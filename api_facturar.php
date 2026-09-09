<?php
/**
 * API DE FACTURACIÓN CFDI 4.0 - COCINET POS
 * Acciones soportadas:
 *   1. 'guardar_cliente': Guarda/actualiza cliente en BD MySQL y registra pre-factura borrador si viene ticket.
 *   2. 'buscar_cliente': Consulta cliente por RFC, Razón Social o Teléfono.
 *   3. 'preparar': Crea borrador en BD (facturas con timbrada = 0, estado = 'PENDIENTE'), calcula impuestos y genera PDF previo.
 *   4. 'timbrar': Sella XML con CSD, timbra con Finkok/SAT (SOAP), guarda UUID y genera PDF oficial.
 *   5. 'eliminar_no_timbrada': Libera el folio no timbrado para no brincar consecutivos.
 *   6. 'listar_no_timbradas': Lista las facturas pendientes por timbrar.
 */

// Silenciar warnings en output para no corromper la respuesta JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);
ini_set('display_errors', '0');

// Encabezados CORS universales para permitir peticiones desde Firebase Web App (HTTPS) y Localhost
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept, X-Custom-Header');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 1. Conexión resiliente a la Base de Datos MySQL
$dbHost = "localhost";
$dbUser = "root";
$dbPass = "checo2100";
$dbName = "tr_vladimir";

$con = null;

// Intentar con mysqli (PHP 7+)
if (function_exists('mysqli_connect')) {
    $con = @mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);
    if (!$con) {
        // Fallback a IP remota si localhost no responde
        $con = @mysqli_connect("109.106.251.99", "abast115_super", "checo2100", $dbName);
    }
    if ($con) {
        @mysqli_set_charset($con, 'utf8');
    }
}

// Fallback a conex2.php si mysqli falló o no está disponible
if (!$con) {
    if (file_exists(__DIR__ . '/plugin/conex2.php')) {
        require_once __DIR__ . '/plugin/conex2.php';
    } elseif (file_exists(__DIR__ . '/conex2.php')) {
        require_once __DIR__ . '/conex2.php';
    }
    if (function_exists('conectarse')) {
        $con = @conectarse($dbName);
    }
}

// Función helper para ejecutar queries compatibles con mysqli y mysql antiguo
function dbQuery($queryStr, $dbCon = null) {
    global $con;
    $conn = $dbCon ? $dbCon : $con;
    if (!$conn) return false;

    if (is_object($conn) && get_class($conn) === 'mysqli') {
        return mysqli_query($conn, $queryStr);
    } elseif (function_exists('mysql_query')) {
        return mysql_query($queryStr, $conn);
    }
    return false;
}

function dbFetchAssoc($result) {
    if (!$result) return null;
    if (is_object($result) && function_exists('mysqli_fetch_assoc')) {
        return mysqli_fetch_assoc($result);
    } elseif (function_exists('mysql_fetch_assoc')) {
        return mysql_fetch_assoc($result);
    }
    return null;
}

function dbInsertId($dbCon = null) {
    global $con;
    $conn = $dbCon ? $dbCon : $con;
    if (is_object($conn) && function_exists('mysqli_insert_id')) {
        return mysqli_insert_id($conn);
    } elseif (function_exists('mysql_insert_id')) {
        return mysql_insert_id($conn);
    }
    return 0;
}

function dbEscape($str, $dbCon = null) {
    global $con;
    $conn = $dbCon ? $dbCon : $con;
    if (is_object($conn) && function_exists('mysqli_real_escape_string')) {
        return mysqli_real_escape_string($conn, $str);
    } elseif (function_exists('mysql_real_escape_string')) {
        return mysql_real_escape_string($str, $conn);
    }
    return addslashes($str);
}

// 2. Leer payload JSON o POST enviado desde Cocinet POS / Portal
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!$data || !is_array($data)) {
    $data = $_POST;
}

if (!isset($data['accion']) && !isset($data['action'])) {
    if (isset($_GET['accion'])) {
        $data['accion'] = $_GET['accion'];
    } elseif (isset($_GET['action'])) {
        $data['accion'] = $_GET['action'];
    } else {
        echo json_encode(['ok' => false, 'error' => 'Petición inválida. Se requiere parámetro accion.']);
        exit;
    }
}

$accion = trim($data['accion'] ?? $data['action'] ?? '');

// Base URL para descargas de PDF y XML
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? 80) == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/\\');
$baseUrl = $protocol . $host . ($scriptDir ? $scriptDir : '') . '/';

// =========================================================================
// ACCIÓN: BUSCAR CLIENTE
// =========================================================================
if ($accion === 'buscar_cliente') {
    $q = trim($data['query'] ?? $data['rfc'] ?? $data['nombre'] ?? $_GET['query'] ?? $_GET['rfc'] ?? '');
    $qEsc = dbEscape($q);

    if (strlen($q) < 3) {
        echo json_encode(['ok' => true, 'clientes' => []]);
        exit;
    }

    $sql = "SELECT id, RFC AS rfc, NOMBRE AS nombre, NOMBRE AS razonSocial, DOMFISCAL AS direccionFiscal, CP AS cp, REGIMEN AS regimenFiscal, USOCFDI AS usoCfdi, EMAIL AS emailFacturacion, TELEFONO AS phone 
            FROM clientes 
            WHERE (RFC LIKE '%$qEsc%' OR NOMBRE LIKE '%$qEsc%' OR TELEFONO LIKE '%$qEsc%') AND emisor <> '1' 
            ORDER BY id DESC LIMIT 10";
    
    $res = dbQuery($sql);
    $clientes = [];
    if ($res) {
        while ($row = dbFetchAssoc($res)) {
            $clientes[] = [
                'id'               => $row['id'],
                'rfc'              => strtoupper(trim($row['rfc'] ?? '')),
                'nombre'           => strtoupper(trim($row['nombre'] ?? '')),
                'razonSocial'      => strtoupper(trim($row['razonSocial'] ?? $row['nombre'] ?? '')),
                'cp'               => trim($row['cp'] ?? ''),
                'regimenFiscal'    => trim($row['regimenFiscal'] ?? '612'),
                'usoCfdi'          => trim($row['usoCfdi'] ?? 'G03'),
                'emailFacturacion' => trim($row['emailFacturacion'] ?? ''),
                'phone'            => trim($row['phone'] ?? ''),
                'direccionFiscal'  => trim($row['direccionFiscal'] ?? '')
            ];
        }
    }

    echo json_encode(['ok' => true, 'clientes' => $clientes]);
    exit;
}

// =========================================================================
// ACCIÓN: GUARDAR CLIENTE Y REGISTRAR BORRADOR EN BD
// =========================================================================
if ($accion === 'guardar_cliente' || $accion === 'guardar_datos') {
    $rfc          = strtoupper(trim($data['rfc'] ?? ''));
    $nombre       = strtoupper(trim($data['nombre'] ?? $data['razonSocial'] ?? $data['razon_social'] ?? ''));
    $cp           = trim($data['cp'] ?? $data['codigo_postal'] ?? $data['codigoPostal'] ?? '');
    $regimen      = trim($data['regimen'] ?? $data['regimen_fiscal'] ?? $data['regimenFiscal'] ?? '612');
    $usoCfdi      = trim($data['uso_cfdi'] ?? $data['usoCfdi'] ?? 'G03');
    $correo       = trim($data['correo'] ?? $data['email'] ?? $data['emailFacturacion'] ?? '');
    $telefono     = trim($data['telefono'] ?? $data['phone'] ?? $data['celular'] ?? '');
    $direccion    = trim($data['direccion'] ?? $data['direccionFiscal'] ?? $data['domfiscal'] ?? '');
    
    $ticketId     = isset($data['ticket_id']) ? intval($data['ticket_id']) : (isset($data['ticket']) ? intval($data['ticket']) : 0);
    $total        = floatval($data['total'] ?? 0);
    $formaPago    = trim($data['forma_pago'] ?? $data['formaPago'] ?? '01');
    $metodoPago   = trim($data['metodo_pago'] ?? $data['metodoPago'] ?? 'PUE');
    $conceptoDesc = trim($data['concepto'] ?? $data['descripcion'] ?? 'CONSUMO DE ALIMENTOS Y BEBIDAS');

    if (empty($rfc) || empty($nombre)) {
        echo json_encode(['ok' => false, 'error' => 'RFC y Razón Social son requeridos.']);
        exit;
    }

    $rfcEsc       = dbEscape($rfc);
    $nombreEsc    = dbEscape($nombre);
    $cpEsc        = dbEscape($cp);
    $regimenEsc   = dbEscape($regimen);
    $usoCfdiEsc   = dbEscape($usoCfdi);
    $correoEsc    = dbEscape($correo);
    $telefonoEsc  = dbEscape($telefono);
    $direccionEsc = dbEscape($direccion);

    // 1. Guardar o Actualizar Cliente en tabla `clientes`
    $clienteId = 0;
    $checkCli = dbQuery("SELECT id FROM clientes WHERE UPPER(TRIM(rfc)) = '$rfcEsc' LIMIT 1");
    $rowCli = dbFetchAssoc($checkCli);

    if ($rowCli && !empty($rowCli['id'])) {
        $clienteId = intval($rowCli['id']);
        $sqlUpdCli = "UPDATE clientes SET 
            NOMBRE = '$nombreEsc',
            CP = '$cpEsc',
            REGIMEN = '$regimenEsc',
            USOCFDI = '$usoCfdiEsc',
            EMAIL = '$correoEsc',
            TELEFONO = '$telefonoEsc',
            DOMFISCAL = '$direccionEsc'
            WHERE id = $clienteId";
        dbQuery($sqlUpdCli);
    } else {
        $sqlInsCli = "INSERT INTO clientes (
            RFC, NOMBRE, CP, REGIMEN, USOCFDI, EMAIL, TELEFONO, DOMFISCAL, emisor
        ) VALUES (
            '$rfcEsc', '$nombreEsc', '$cpEsc', '$regimenEsc', '$usoCfdiEsc', '$correoEsc', '$telefonoEsc', '$direccionEsc', 0
        )";
        if (dbQuery($sqlInsCli)) {
            $clienteId = dbInsertId();
        }
    }

    // 2. Si viene ticket y total, registrar la pre-factura en la tabla `facturas` (timbrada = 0, estado = 'PENDIENTE')
    $folio = 0;
    if ($total > 0) {
        $esPersonaMoral = (strlen($rfc) === 12);
        if ($esPersonaMoral) {
            $subtotal = round($total / 1.1475, 2);
            $iva      = round($subtotal * 0.16, 2);
            $retIsr   = round($subtotal * 0.0125, 2);
            $calculado = round($subtotal + $iva - $retIsr, 2);
            if ($calculado != $total) {
                $subtotal = round($total + $retIsr - $iva, 2);
            }
        } else {
            $subtotal = round($total / 1.16, 2);
            $iva      = round($total - $subtotal, 2);
            $retIsr   = 0.00;
        }

        $serie = 'A';
        $fecha = date('Y-m-d H:i:s');

        // Verificar si ya existe borrador para este ticket
        $checkFact = ($ticketId > 0) ? dbQuery("SELECT ID_FACTURA, folio FROM facturas WHERE ticket_id = $ticketId AND timbrada = 0 LIMIT 1") : null;
        $rowFact = dbFetchAssoc($checkFact);

        if ($rowFact && !empty($rowFact['folio'])) {
            $folio = intval($rowFact['folio']);
            $sqlUpdFact = "UPDATE facturas SET 
                ID_CLIENTE = $clienteId,
                fecha = '$fecha',
                rfc = '$rfcEsc',
                nombre = '$nombreEsc',
                cp = '$cpEsc',
                regimenfiscal = '$regimenEsc',
                usocfdi = '$usoCfdiEsc',
                formapago = '$formaPago',
                metodopago = '$metodoPago',
                timporte = $subtotal,
                subtotal = $subtotal,
                iva = $iva,
                ret_isr = $retIsr,
                isr = $retIsr,
                total = $total,
                correo = '$correoEsc',
                estado = 'PENDIENTE',
                timbrada = 0
                WHERE folio = $folio";
            dbQuery($sqlUpdFact);
            dbQuery("DELETE FROM detfactura WHERE folio = $folio");
        } else {
            $queryFolio = dbQuery("SELECT IFNULL(MAX(folio), 0) + 1 AS siguiente_folio FROM facturas");
            $rowFolio   = dbFetchAssoc($queryFolio);
            $folio      = intval($rowFolio['siguiente_folio'] ?? 1);
            if ($folio <= 0) $folio = 1;

            $sqlInsFact = "INSERT INTO facturas (
                ID_CLIENTE, serie, folio, fecha, rfc, nombre, cp, regimenfiscal, usocfdi,
                formapago, metodopago, timporte, subtotal, iva, ret_isr, isr, total,
                correo, ticket_id, timbrada, estado, tipo_comprobante
            ) VALUES (
                $clienteId, '$serie', $folio, '$fecha', '$rfcEsc', '$nombreEsc', '$cpEsc', '$regimenEsc', '$usoCfdiEsc',
                '$formaPago', '$metodoPago', $subtotal, $subtotal, $iva, $retIsr, $retIsr, $total,
                '$correoEsc', $ticketId, 0, 'PENDIENTE', 'I'
            )";
            dbQuery($sqlInsFact);
        }

        // Insertar detalle del producto/servicio
        $conceptoEsc = dbEscape($conceptoDesc);
        $sqlDetalle = "INSERT INTO detfactura (
            folio, serie, cantidad, claveunidad, unidad, claveprodserv,
            descripcion, valorunitario, importe, tasaiva, iva, ret_isr
        ) VALUES (
            $folio, '$serie', 1, 'E48', 'SERVICIO', '90101501',
            '$conceptoEsc', $subtotal, $subtotal, 0.16, $iva, $retIsr
        )";
        dbQuery($sqlDetalle);
    }

    echo json_encode([
        'ok'         => true,
        'cliente_id' => $clienteId,
        'folio'      => $folio,
        'mensaje'    => 'Datos del cliente y pre-factura guardados exitosamente en la base de datos.'
    ]);
    exit;
}

// =========================================================================
// ACCIÓN 1: PREPARAR BORRADOR (PRE-FACTURA)
// =========================================================================
if ($accion === 'preparar') {
    $ticketId     = isset($data['ticket_id']) ? intval($data['ticket_id']) : (isset($data['ticket']) ? intval($data['ticket']) : 0);
    $total        = floatval($data['total'] ?? 0);
    $rfc          = strtoupper(trim($data['rfc'] ?? ''));
    $nombre       = strtoupper(trim($data['nombre'] ?? $data['razonSocial'] ?? ''));
    $cp           = trim($data['cp'] ?? $data['codigoPostal'] ?? '');
    $regimen      = trim($data['regimen'] ?? $data['regimenFiscal'] ?? '612');
    $usoCfdi      = trim($data['uso_cfdi'] ?? $data['usoCfdi'] ?? 'G03');
    $formaPago    = trim($data['forma_pago'] ?? $data['formaPago'] ?? '01');
    $metodoPago   = trim($data['metodo_pago'] ?? $data['metodoPago'] ?? 'PUE');
    $correo       = trim($data['correo'] ?? $data['email'] ?? '');
    $telefono     = trim($data['telefono'] ?? $data['phone'] ?? '');
    $direccion    = trim($data['direccion'] ?? $data['direccionFiscal'] ?? '');
    $conceptoDesc = trim($data['concepto'] ?? $data['descripcion'] ?? 'CONSUMO DE ALIMENTOS Y BEBIDAS');

    if (empty($rfc) || empty($nombre) || empty($cp) || empty($regimen) || $total <= 0) {
        echo json_encode(['ok' => false, 'error' => 'Faltan datos fiscales obligatorios (RFC, Nombre, CP, Régimen o Total).']);
        exit;
    }

    $rfcEsc       = dbEscape($rfc);
    $nombreEsc    = dbEscape($nombre);
    $cpEsc        = dbEscape($cp);
    $regimenEsc   = dbEscape($regimen);
    $usoCfdiEsc   = dbEscape($usoCfdi);
    $correoEsc    = dbEscape($correo);
    $telefonoEsc  = dbEscape($telefono);
    $direccionEsc = dbEscape($direccion);

    // 1. Guardar/Actualizar Cliente en tabla `clientes`
    $clienteId = 0;
    $checkCli = dbQuery("SELECT id FROM clientes WHERE UPPER(TRIM(rfc)) = '$rfcEsc' LIMIT 1");
    $rowCli = dbFetchAssoc($checkCli);

    if ($rowCli && !empty($rowCli['id'])) {
        $clienteId = intval($rowCli['id']);
        $sqlUpdCli = "UPDATE clientes SET 
            NOMBRE = '$nombreEsc',
            CP = '$cpEsc',
            REGIMEN = '$regimenEsc',
            USOCFDI = '$usoCfdiEsc',
            EMAIL = '$correoEsc',
            TELEFONO = '$telefonoEsc',
            DOMFISCAL = '$direccionEsc'
            WHERE id = $clienteId";
        dbQuery($sqlUpdCli);
    } else {
        $sqlInsCli = "INSERT INTO clientes (
            RFC, NOMBRE, CP, REGIMEN, USOCFDI, EMAIL, TELEFONO, DOMFISCAL, emisor
        ) VALUES (
            '$rfcEsc', '$nombreEsc', '$cpEsc', '$regimenEsc', '$usoCfdiEsc', '$correoEsc', '$telefonoEsc', '$direccionEsc', 0
        )";
        if (dbQuery($sqlInsCli)) {
            $clienteId = dbInsertId();
        }
    }

    // 2. Cálculo de Impuestos CFDI 4.0
    $esPersonaMoral = (strlen($rfc) === 12);
    $aplicaRetISR   = $esPersonaMoral;

    if ($aplicaRetISR) {
        $subtotal = round($total / 1.1475, 2);
        $iva      = round($subtotal * 0.16, 2);
        $retIsr   = round($subtotal * 0.0125, 2);
        $calculado = round($subtotal + $iva - $retIsr, 2);
        if ($calculado != $total) {
            $subtotal = round($total + $retIsr - $iva, 2);
        }
    } else {
        $subtotal = round($total / 1.16, 2);
        $iva      = round($total - $subtotal, 2);
        $retIsr   = 0.00;
    }

    $serie = 'A';
    $fecha = date('Y-m-d H:i:s');
    $folio = 0;

    // Verificar si ya existe borrador para este ticket
    $checkFact = ($ticketId > 0) ? dbQuery("SELECT ID_FACTURA, folio FROM facturas WHERE ticket_id = $ticketId AND timbrada = 0 LIMIT 1") : null;
    $rowFact = dbFetchAssoc($checkFact);

    if ($rowFact && !empty($rowFact['folio'])) {
        $folio = intval($rowFact['folio']);
        $sqlFactura = "UPDATE facturas SET 
            ID_CLIENTE = $clienteId,
            fecha = '$fecha',
            rfc = '$rfcEsc',
            nombre = '$nombreEsc',
            cp = '$cpEsc',
            regimenfiscal = '$regimenEsc',
            usocfdi = '$usoCfdiEsc',
            formapago = '$formaPago',
            metodopago = '$metodoPago',
            timporte = $subtotal,
            subtotal = $subtotal,
            iva = $iva,
            ret_isr = $retIsr,
            isr = $retIsr,
            total = $total,
            correo = '$correoEsc',
            estado = 'PENDIENTE',
            timbrada = 0
            WHERE folio = $folio";
        dbQuery($sqlFactura);
        dbQuery("DELETE FROM detfactura WHERE folio = $folio");
    } else {
        $queryFolio = dbQuery("SELECT IFNULL(MAX(folio), 0) + 1 AS siguiente_folio FROM facturas");
        $rowFolio   = dbFetchAssoc($queryFolio);
        $folio      = intval($rowFolio['siguiente_folio'] ?? 1);
        if ($folio <= 0) $folio = 1;

        $sqlFactura = "INSERT INTO facturas (
            ID_CLIENTE, serie, folio, fecha, rfc, nombre, cp, regimenfiscal, usocfdi,
            formapago, metodopago, timporte, subtotal, iva, ret_isr, isr, total,
            correo, ticket_id, timbrada, estado, tipo_comprobante
        ) VALUES (
            $clienteId, '$serie', $folio, '$fecha', '$rfcEsc', '$nombreEsc', '$cpEsc', '$regimenEsc', '$usoCfdiEsc',
            '$formaPago', '$metodoPago', $subtotal, $subtotal, $iva, $retIsr, $retIsr, $total,
            '$correoEsc', $ticketId, 0, 'PENDIENTE', 'I'
        )";
        dbQuery($sqlFactura);
    }

    // Insertar detalle
    $conceptoEsc = dbEscape($conceptoDesc);
    $sqlDetalle = "INSERT INTO detfactura (
        folio, serie, cantidad, claveunidad, unidad, claveprodserv,
        descripcion, valorunitario, importe, tasaiva, iva, ret_isr
    ) VALUES (
        $folio, '$serie', 1, 'E48', 'SERVICIO', '90101501',
        '$conceptoEsc', $subtotal, $subtotal, 0.16, $iva, $retIsr
    )";
    dbQuery($sqlDetalle);

    // Generar PDF borrador si existe el generador FPDF
    $pdfUrl = '';
    if (file_exists(__DIR__ . '/facturapdf.php')) {
        $_GET['folio'] = $folio;
        $_GET['es_borrador'] = 1;
        @include_once __DIR__ . '/facturapdf.php';
        $pdfUrl = $baseUrl . "facturas/factura_{$folio}.pdf?v=" . time();
    }

    echo json_encode([
        'ok'         => true,
        'folio'      => $folio,
        'serie'      => $serie,
        'cliente_id' => $clienteId,
        'pdfUrl'     => $pdfUrl,
        'desglose'   => [
            'subtotal'       => $subtotal,
            'iva'            => $iva,
            'retencion_isr'  => $retIsr,
            'total'          => $total,
            'esPersonaMoral' => $esPersonaMoral
        ]
    ]);
    exit;
}

// =========================================================================
// ACCIÓN 2: TIMBRAR CON FINKOK / SAT
// =========================================================================
if ($accion === 'timbrar') {
    $folio = intval($data['folio'] ?? 0);
    $serie = trim($data['serie'] ?? 'A');

    if ($folio <= 0) {
        echo json_encode(['ok' => false, 'error' => 'Se requiere el folio del borrador a timbrar.']);
        exit;
    }

    // 1. Crear el XML firmado con creacfdi.php
    if (file_exists(__DIR__ . '/creacfdi.php')) {
        $_POST['folio'] = $folio;
        $_POST['serie'] = $serie;
        $_GET['id'] = $folio;
        require_once __DIR__ . '/creacfdi.php';
    } else {
        echo json_encode(['ok' => false, 'error' => 'No se encontró el módulo creacfdi.php en el servidor.']);
        exit;
    }

    // 2. Timbrar mediante SOAP Finkok con timbrar.php
    if (file_exists(__DIR__ . '/timbrar.php')) {
        $_POST['folio'] = $folio;
        $_POST['serie'] = $serie;
        $_GET['id'] = "facturas/factura_{$folio}.xml";
        $_GET['folio'] = $folio;
        require_once __DIR__ . '/timbrar.php';
        
        if (isset($uuid) && !empty($uuid)) {
            dbQuery("UPDATE facturas SET timbrada = 1, estado = 'TIMBRADA', uuid = '$uuid', FechaTimbrado = NOW() WHERE folio = $folio");

            if (file_exists(__DIR__ . '/facturapdf.php')) {
                $_GET['folio'] = $folio;
                $_GET['es_borrador'] = 0;
                @include __DIR__ . '/facturapdf.php';
            }

            echo json_encode([
                'ok'      => true,
                'folio'   => $folio,
                'uuid'    => $uuid,
                'pdfUrl'  => $baseUrl . "facturas/factura_{$folio}.pdf?v=" . time(),
                'xmlUrl'  => $baseUrl . "facturas/factura_{$folio}.xml?v=" . time()
            ]);
            exit;
        } else {
            $errorMsg = !empty($errorSat) ? $errorSat : (!empty($error) ? $error : 'El SAT rechazó el timbrado. Verifique los datos fiscales.');
            echo json_encode([
                'ok'    => false,
                'error' => $errorMsg,
                'folio' => $folio
            ]);
            exit;
        }
    } else {
        echo json_encode(['ok' => false, 'error' => 'No se encontró el módulo timbrar.php en el servidor.']);
        exit;
    }
}

// =========================================================================
// ACCIÓN 3: ELIMINAR NO TIMBRADA (LIBERAR FOLIO)
// =========================================================================
if ($accion === 'eliminar_no_timbrada') {
    $folio = intval($data['folio'] ?? 0);

    if ($folio <= 0) {
        echo json_encode(['ok' => false, 'error' => 'Folio inválido para descartar.']);
        exit;
    }

    $check = dbQuery("SELECT timbrada FROM facturas WHERE folio = $folio");
    $row   = dbFetchAssoc($check);

    if ($row && intval($row['timbrada']) === 1) {
        echo json_encode(['ok' => false, 'error' => 'Esta factura ya fue timbrada ante el SAT y no puede ser eliminada directamente.']);
        exit;
    }

    dbQuery("DELETE FROM detfactura WHERE folio = $folio");
    dbQuery("DELETE FROM facturas WHERE folio = $folio");

    $pdfPath = __DIR__ . "/facturas/factura_{$folio}.pdf";
    if (file_exists($pdfPath)) {
        @unlink($pdfPath);
    }

    echo json_encode([
        'ok'      => true,
        'mensaje' => "El borrador del folio $folio fue descartado y el folio quedó liberado."
    ]);
    exit;
}

// =========================================================================
// ACCIÓN 4: LISTAR FACTURAS (FILTROS POR ESTADO, BUSQUEDA Y FECHA)
// =========================================================================
if ($accion === 'listar_facturas' || $accion === 'listar_no_timbradas' || $accion === 'listar') {
    $filtroEstado = trim($data['estado'] ?? $_GET['estado'] ?? '');
    $busqueda     = trim($data['busqueda'] ?? $data['query'] ?? $_GET['busqueda'] ?? $_GET['query'] ?? '');
    $fechaInicio  = trim($data['fecha_inicio'] ?? $_GET['fecha_inicio'] ?? '');
    $fechaFin     = trim($data['fecha_fin'] ?? $_GET['fecha_fin'] ?? '');

    $where = ["1=1"];

    if ($accion === 'listar_no_timbradas' || $filtroEstado === 'no_timbradas' || $filtroEstado === 'pendientes') {
        $where[] = "(F.timbrada = 0 OR F.estado = 'PENDIENTE' OR F.estado = 'BORRADOR')";
    } elseif ($filtroEstado === 'timbradas') {
        $where[] = "(F.timbrada = 1 OR F.estado = 'TIMBRADA')";
    }

    if (!empty($busqueda)) {
        $bEsc = dbEscape($busqueda);
        $where[] = "(F.rfc LIKE '%$bEsc%' OR F.nombre LIKE '%$bEsc%' OR F.folio LIKE '%$bEsc%' OR F.uuid LIKE '%$bEsc%' OR F.ticket_id LIKE '%$bEsc%')";
    }

    if (!empty($fechaInicio)) {
        $fIniEsc = dbEscape($fechaInicio);
        $where[] = "F.fecha >= '$fIniEsc 00:00:00'";
    }
    if (!empty($fechaFin)) {
        $fFinEsc = dbEscape($fechaFin);
        $where[] = "F.fecha <= '$fFinEsc 23:59:59'";
    }

    $whereSql = implode(' AND ', $where);
    $sql = "SELECT F.ID_FACTURA, F.ID_CLIENTE, F.serie, F.folio, F.fecha, F.rfc, F.nombre, 
                   F.timporte AS subtotal, F.iva, F.ret_isr, F.total, F.correo, F.ticket_id, 
                   F.timbrada, F.estado, F.uuid, F.formapago, F.metodopago, F.usocfdi, F.regimenfiscal, F.cp
            FROM facturas F 
            WHERE $whereSql 
            ORDER BY F.ID_FACTURA DESC LIMIT 150";

    $res = dbQuery($sql);
    $lista = [];
    if ($res) {
        while ($row = dbFetchAssoc($res)) {
            $folioRow = intval($row['folio'] ?? 0);
            $isTimbrada = intval($row['timbrada'] ?? 0) === 1 || ($row['estado'] ?? '') === 'TIMBRADA';
            
            $pdfUrl = $baseUrl . "facturas/factura_{$folioRow}.pdf";
            $xmlUrl = $baseUrl . "facturas/factura_{$folioRow}.xml";

            $row['folio']     = $folioRow;
            $row['timbrada']  = $isTimbrada ? 1 : 0;
            $row['subtotal']  = floatval($row['subtotal'] ?? 0);
            $row['iva']       = floatval($row['iva'] ?? 0);
            $row['ret_isr']   = floatval($row['ret_isr'] ?? 0);
            $row['total']     = floatval($row['total'] ?? 0);
            $row['pdfUrl']    = $pdfUrl;
            $row['xmlUrl']    = $xmlUrl;
            $lista[] = $row;
        }
    }

    // Totales rápidos para widgets
    $qStats = dbQuery("SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN timbrada = 1 OR estado = 'TIMBRADA' THEN 1 ELSE 0 END) AS timbradas_count,
        SUM(CASE WHEN timbrada = 0 OR estado = 'PENDIENTE' OR estado = 'BORRADOR' THEN 1 ELSE 0 END) AS pendientes_count,
        SUM(CASE WHEN timbrada = 1 OR estado = 'TIMBRADA' THEN total ELSE 0 END) AS total_facturado_monto
        FROM facturas");
    $stats = dbFetchAssoc($qStats);

    echo json_encode([
        'ok'       => true,
        'facturas' => $lista,
        'stats'    => [
            'total'          => intval($stats['total_count'] ?? 0),
            'timbradas'      => intval($stats['timbradas_count'] ?? 0),
            'pendientes'     => intval($stats['pendientes_count'] ?? 0),
            'monto_facturado'=> floatval($stats['total_facturado_monto'] ?? 0)
        ]
    ]);
    exit;
}

// =========================================================================
// ACCIÓN 5: REENVIAR FACTURA POR CORREO
// =========================================================================
if ($accion === 'reenviar_correo' || $accion === 'enviar_correo') {
    $folio  = intval($data['folio'] ?? $_GET['folio'] ?? 0);
    $correo = trim($data['correo'] ?? $data['email'] ?? $_GET['correo'] ?? $_GET['email'] ?? '');

    if ($folio <= 0) {
        echo json_encode(['ok' => false, 'error' => 'Se requiere el folio de la factura.']);
        exit;
    }

    $qFact = dbQuery("SELECT * FROM facturas WHERE folio = $folio LIMIT 1");
    $fact  = dbFetchAssoc($qFact);

    if (!$fact) {
        echo json_encode(['ok' => false, 'error' => "No se encontró la factura Folio #$folio en la base de datos."]);
        exit;
    }

    $destinatario = !empty($correo) ? $correo : trim($fact['correo'] ?? '');
    if (empty($destinatario)) {
        echo json_encode(['ok' => false, 'error' => 'Por favor especifica una dirección de correo válida.']);
        exit;
    }

    $destEsc = dbEscape($destinatario);
    dbQuery("UPDATE facturas SET correo = '$destEsc' WHERE folio = $folio");

    $pdfUrl = $baseUrl . "facturas/factura_{$folio}.pdf";
    $xmlUrl = $baseUrl . "facturas/factura_{$folio}.xml";

    // Enviar correo nativo o retornar links listos
    $subject = "Factura Electrónica CFDI 4.0 - Folio #{$folio} - " . ($fact['nombre'] ?? '');
    $message = "Estimado cliente,\n\nAdjuntamos los enlaces para la descarga de su Comprobante Fiscal Digital por Internet (CFDI 4.0):\n\n"
             . "Folio: #{$folio}\n"
             . "RFC: " . ($fact['rfc'] ?? '') . "\n"
             . "Total: $" . number_format(floatval($fact['total'] ?? 0), 2) . " MXN\n\n"
             . "Descargar PDF: $pdfUrl\n"
             . "Descargar XML: $xmlUrl\n\n"
             . "Gracias por su preferencia.";
    
    $headers = "From: no-reply@" . ($host ? $host : "cocinet.com") . "\r\n" .
               "Reply-To: no-reply@" . ($host ? $host : "cocinet.com") . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    @mail($destinatario, $subject, $message, $headers);

    echo json_encode([
        'ok'      => true,
        'mensaje' => "Factura enviada exitosamente a $destinatario.",
        'correo'  => $destinatario,
        'pdfUrl'  => $pdfUrl,
        'xmlUrl'  => $xmlUrl
    ]);
    exit;
}

// =========================================================================
// ACCIÓN 6: TEST DE CONEXIÓN Y ESTADO GENERAL
// =========================================================================
if ($accion === 'test_conexion' || $accion === 'ping') {
    $qStats = dbQuery("SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN timbrada = 1 OR estado = 'TIMBRADA' THEN 1 ELSE 0 END) AS timbradas_count,
        SUM(CASE WHEN timbrada = 0 OR estado = 'PENDIENTE' OR estado = 'BORRADOR' THEN 1 ELSE 0 END) AS pendientes_count,
        SUM(CASE WHEN timbrada = 1 OR estado = 'TIMBRADA' THEN total ELSE 0 END) AS total_facturado_monto
        FROM facturas");
    $stats = dbFetchAssoc($qStats);
    $qCli  = dbQuery("SELECT COUNT(*) AS total_clientes FROM clientes WHERE emisor <> '1'");
    $cli   = dbFetchAssoc($qCli);

    echo json_encode([
        'ok'         => true,
        'servidor'   => 'PHP MySQL CFDI 4.0 API Activa',
        'host'       => $host,
        'stats'      => [
            'total_facturas'  => intval($stats['total_count'] ?? 0),
            'timbradas'       => intval($stats['timbradas_count'] ?? 0),
            'pendientes'      => intval($stats['pendientes_count'] ?? 0),
            'clientes_mysql'  => intval($cli['total_clientes'] ?? 0),
            'monto_facturado' => floatval($stats['total_facturado_monto'] ?? 0)
        ]
    ]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Acción no reconocida.']);