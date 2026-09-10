<?php
/**
 * API DE FACTURACIÓN CFDI 4.0 - COCINET POS
 * Compatible con PHP 5.4, 5.6, 7.x, 8.x
 *
 * Acciones soportadas:
 *   1. 'buscar_cliente': Consulta clientes por RFC, Nombre/Razón Social o Teléfono (mínimo 3 letras).
 *   2. 'guardar_cliente': Guarda cliente en MySQL y registra pre-factura borrador si viene ticket y total.
 *   3. 'preparar': Genera borrador en tabla `facturas` (timbrada = 0), calcula impuestos y PDF previo.
 *   4. 'timbrar': Sella XML con CSD, timbra con Finkok/SAT (SOAP), guarda UUID y genera PDF oficial.
 *   5. 'eliminar_no_timbrada': Libera el folio no timbrado.
 *   6. 'listar_facturas' / 'listar_no_timbradas': Lista comprobantes con filtros de búsqueda y totales.
 *   7. 'reenviar_correo': Envía ligas de PDF y XML al correo del cliente.
 *   8. 'test_conexion' / 'ping': Verifica el estado del servidor y la base de datos MySQL.
 */

// Silenciar warnings para garantizar respuesta JSON limpia
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);
ini_set('display_errors', '0');

// Encabezados CORS universales
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept, X-Custom-Header');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Función helper de extracción segura compatible con PHP 5.4+ (sin operador ??)
function getVal($arr, $key, $default = '') {
    if (is_array($arr) && isset($arr[$key]) && $arr[$key] !== null) {
        return $arr[$key];
    }
    return $default;
}

// 1. Conexión resiliente a la Base de Datos MySQL
$dbHost = "localhost";
$dbUser = "root";
$dbPass = "checo2100";
$dbName = "tr_vladimir";

$con = null;

// Intentar con mysqli (PHP 7+)
if (function_exists('mysqli_connect')) {
    if (function_exists('mysqli_report')) {
        @mysqli_report(MYSQLI_REPORT_OFF);
    }
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

// Funciones helper universales de Base de Datos
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

// Función de logging hacia facturas.log
function facturasLog($mensaje, $nivel = 'INFO') {
    $logFile = __DIR__ . '/facturas.log';
    $fecha = date('Y-m-d H:i:s');
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
    $entry = "[$fecha] [$ip] [$nivel] $mensaje" . PHP_EOL;
    @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}

// 2. Leer payload JSON o POST enviado desde Cocinet POS / Portal
$rawInput = file_get_contents('php://input');
$data = null;
if (!empty($rawInput)) {
    $cleanInput = preg_replace('/^[\xEF\xBB\xBF\x00-\x1F\x7F]+/', '', trim($rawInput));
    $data = json_decode($cleanInput, true);
    if (!is_array($data)) {
        $data = json_decode($rawInput, true);
    }
}
if (!$data || !is_array($data)) {
    $data = $_POST;
}
if (!is_array($data)) {
    $data = array();
}

$accion = '';
if (isset($data['accion'])) {
    $accion = trim($data['accion']);
} elseif (isset($data['action'])) {
    $accion = trim($data['action']);
} elseif (isset($_GET['accion'])) {
    $accion = trim($_GET['accion']);
} elseif (isset($_GET['action'])) {
    $accion = trim($_GET['action']);
}

facturasLog("Peticion recibida: Metodo=" . $_SERVER['REQUEST_METHOD'] . " | Accion=" . ($accion ? $accion : 'NINGUNA/DEFAULT') . " | Payload=" . substr($rawInput ? $rawInput : serialize($_GET), 0, 200));

// Si se abre directo en navegador sin parámetros o con GET, listar facturas por defecto
if (empty($accion) || $accion === 'test_conexion' || $accion === 'ping') {
    $accion = 'listar_facturas';
}

// Base URL para descargas de PDF y XML
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$protocol = $isHttps ? "https://" : "http://";
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
$scriptDir = rtrim(dirname(isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : ''), '/\\');
$baseUrl = $protocol . $host . ($scriptDir ? $scriptDir : '') . '/';

// =========================================================================
// ACCIÓN: BUSCAR CLIENTE
// =========================================================================
if ($accion === 'buscar_cliente') {
    $q = trim(getVal($data, 'query', getVal($data, 'rfc', getVal($data, 'nombre', getVal($_GET, 'query', getVal($_GET, 'rfc', ''))))));
    $qEsc = dbEscape($q);

    if (strlen($q) < 3) {
        echo json_encode(array('ok' => true, 'clientes' => array()));
        exit;
    }

    $sql = "SELECT id, RFC AS rfc, NOMBRE AS nombre, NOMBRE AS razonSocial, DOMFISCAL AS direccionFiscal, CP AS cp, REGIMEN AS regimenFiscal, USOCFDI AS usoCfdi, EMAIL AS emailFacturacion, TELEFONO AS phone 
            FROM clientes 
            WHERE (RFC LIKE '%$qEsc%' OR NOMBRE LIKE '%$qEsc%' OR TELEFONO LIKE '%$qEsc%') AND emisor <> '1' 
            ORDER BY id DESC LIMIT 10";
    
    $res = dbQuery($sql);
    $clientes = array();
    if ($res) {
        while ($row = dbFetchAssoc($res)) {
            $clientes[] = array(
                'id'               => getVal($row, 'id'),
                'rfc'              => strtoupper(trim(getVal($row, 'rfc'))),
                'nombre'           => strtoupper(trim(getVal($row, 'nombre'))),
                'razonSocial'      => strtoupper(trim(getVal($row, 'razonSocial', getVal($row, 'nombre')))),
                'cp'               => trim(getVal($row, 'cp')),
                'regimenFiscal'    => trim(getVal($row, 'regimenFiscal', '612')),
                'usoCfdi'          => trim(getVal($row, 'usoCfdi', 'G03')),
                'emailFacturacion' => trim(getVal($row, 'emailFacturacion')),
                'phone'            => trim(getVal($row, 'phone')),
                'direccionFiscal'  => trim(getVal($row, 'direccionFiscal'))
            );
        }
    }

    echo json_encode(array('ok' => true, 'clientes' => $clientes));
    exit;
}

// =========================================================================
// ACCIÓN: GUARDAR CLIENTE Y REGISTRAR BORRADOR EN BD
// =========================================================================
if ($accion === 'guardar_cliente' || $accion === 'guardar_datos') {
    $rfc          = strtoupper(trim(getVal($data, 'rfc')));
    $nombre       = strtoupper(trim(getVal($data, 'nombre', getVal($data, 'razonSocial', getVal($data, 'razon_social')))));
    $cp           = trim(getVal($data, 'cp', getVal($data, 'codigo_postal', getVal($data, 'codigoPostal'))));
    $regimen      = trim(getVal($data, 'regimen', getVal($data, 'regimen_fiscal', getVal($data, 'regimenFiscal', '612'))));
    $usoCfdi      = trim(getVal($data, 'uso_cfdi', getVal($data, 'usoCfdi', 'G03')));
    $correo       = trim(getVal($data, 'correo', getVal($data, 'email', getVal($data, 'emailFacturacion'))));
    $telefono     = trim(getVal($data, 'telefono', getVal($data, 'phone', getVal($data, 'celular'))));
    $direccion    = trim(getVal($data, 'direccion', getVal($data, 'direccionFiscal', getVal($data, 'domfiscal'))));
    
    $ticketId     = isset($data['ticket_id']) ? intval($data['ticket_id']) : (isset($data['ticket']) ? intval($data['ticket']) : 0);
    $total        = floatval(getVal($data, 'total', 0));
    $formaPago    = trim(getVal($data, 'forma_pago', getVal($data, 'formaPago', '01')));
    $metodoPago   = trim(getVal($data, 'metodo_pago', getVal($data, 'metodoPago', 'PUE')));
    $conceptoDesc = trim(getVal($data, 'concepto', getVal($data, 'descripcion', 'CONSUMO DE ALIMENTOS Y BEBIDAS')));

    if (empty($rfc) || empty($nombre)) {
        echo json_encode(array('ok' => false, 'error' => 'RFC y Razón Social son requeridos.'));
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
            $folio      = intval(getVal($rowFolio, 'siguiente_folio', 1));
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

    echo json_encode(array(
        'ok'         => true,
        'cliente_id' => $clienteId,
        'folio'      => $folio,
        'mensaje'    => 'Datos del cliente y pre-factura guardados exitosamente en la base de datos.'
    ));
    exit;
}

// =========================================================================
// ACCIÓN 1: PREPARAR BORRADOR (PRE-FACTURA)
// =========================================================================
if ($accion === 'preparar') {
    $ticketId     = isset($data['ticket_id']) ? intval($data['ticket_id']) : (isset($data['ticket']) ? intval($data['ticket']) : 0);
    $total        = floatval(getVal($data, 'total', 0));
    $rfc          = strtoupper(trim(getVal($data, 'rfc')));
    $nombre       = strtoupper(trim(getVal($data, 'nombre', getVal($data, 'razonSocial'))));
    $cp           = trim(getVal($data, 'cp', getVal($data, 'codigoPostal')));
    $regimen      = trim(getVal($data, 'regimen', getVal($data, 'regimenFiscal', '612')));
    $usoCfdi      = trim(getVal($data, 'uso_cfdi', getVal($data, 'usoCfdi', 'G03')));
    $formaPago    = trim(getVal($data, 'forma_pago', getVal($data, 'formaPago', '01')));
    $metodoPago   = trim(getVal($data, 'metodo_pago', getVal($data, 'metodoPago', 'PUE')));
    $correo       = trim(getVal($data, 'correo', getVal($data, 'email')));
    $telefono     = trim(getVal($data, 'telefono', getVal($data, 'phone')));
    $direccion    = trim(getVal($data, 'direccion', getVal($data, 'direccionFiscal')));
    $conceptoDesc = trim(getVal($data, 'concepto', getVal($data, 'descripcion', 'CONSUMO DE ALIMENTOS Y BEBIDAS')));

    if (empty($rfc) || empty($nombre) || empty($cp) || empty($regimen) || $total <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Faltan datos fiscales obligatorios (RFC, Nombre, CP, Régimen o Total).'));
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
        $folio      = intval(getVal($rowFolio, 'siguiente_folio', 1));
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

    echo json_encode(array(
        'ok'         => true,
        'folio'      => $folio,
        'serie'      => $serie,
        'cliente_id' => $clienteId,
        'pdfUrl'     => $pdfUrl,
        'desglose'   => array(
            'subtotal'       => $subtotal,
            'iva'            => $iva,
            'retencion_isr'  => $retIsr,
            'total'          => $total,
            'esPersonaMoral' => $esPersonaMoral
        )
    ));
    exit;
}

// =========================================================================
// ACCIÓN 2: TIMBRAR CON FINKOK / SAT
// =========================================================================
if ($accion === 'timbrar') {
    $folio = intval(getVal($data, 'folio', 0));
    $serie = trim(getVal($data, 'serie', 'A'));

    if ($folio <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Se requiere el folio del borrador a timbrar.'));
        exit;
    }

    // 1. Crear el XML firmado con creacfdi.php
    if (file_exists(__DIR__ . '/creacfdi.php')) {
        $_POST['folio'] = $folio;
        $_POST['serie'] = $serie;
        $_GET['id'] = $folio;
        require_once __DIR__ . '/creacfdi.php';
    } else {
        echo json_encode(array('ok' => false, 'error' => 'No se encontró el módulo creacfdi.php en el servidor.'));
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

            echo json_encode(array(
                'ok'      => true,
                'folio'   => $folio,
                'uuid'    => $uuid,
                'pdfUrl'  => $baseUrl . "facturas/factura_{$folio}.pdf?v=" . time(),
                'xmlUrl'  => $baseUrl . "facturas/factura_{$folio}.xml?v=" . time()
            ));
            exit;
        } else {
            $errorMsg = !empty($errorSat) ? $errorSat : (!empty($error) ? $error : 'El SAT rechazó el timbrado. Verifique los datos fiscales.');
            echo json_encode(array(
                'ok'    => false,
                'error' => $errorMsg,
                'folio' => $folio
            ));
            exit;
        }
    } else {
        echo json_encode(array('ok' => false, 'error' => 'No se encontró el módulo timbrar.php en el servidor.'));
        exit;
    }
}

// =========================================================================
// ACCIÓN 3: ELIMINAR NO TIMBRADA (LIBERAR FOLIO)
// =========================================================================
if ($accion === 'eliminar_no_timbrada') {
    $folio = intval(getVal($data, 'folio', 0));

    if ($folio <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Folio inválido para descartar.'));
        exit;
    }

    $check = dbQuery("SELECT timbrada FROM facturas WHERE folio = $folio");
    $row   = dbFetchAssoc($check);

    if ($row && intval(getVal($row, 'timbrada')) === 1) {
        echo json_encode(array('ok' => false, 'error' => 'Esta factura ya fue timbrada ante el SAT y no puede ser eliminada directamente.'));
        exit;
    }

    dbQuery("DELETE FROM detfactura WHERE folio = $folio");
    dbQuery("DELETE FROM facturas WHERE folio = $folio");

    $pdfPath = __DIR__ . "/facturas/factura_{$folio}.pdf";
    if (file_exists($pdfPath)) {
        @unlink($pdfPath);
    }

    echo json_encode(array(
        'ok'      => true,
        'mensaje' => "El borrador del folio $folio fue descartado y el folio quedó liberado."
    ));
    exit;
}

// =========================================================================
// ACCIÓN 4: LISTAR FACTURAS (FILTROS POR ESTADO, BUSQUEDA Y FECHA)
// =========================================================================
if ($accion === 'listar_facturas' || $accion === 'listar_no_timbradas' || $accion === 'listar') {
    $filtroEstado = trim(getVal($data, 'estado', getVal($_GET, 'estado', '')));
    $busqueda     = trim(getVal($data, 'busqueda', getVal($data, 'query', getVal($_GET, 'busqueda', getVal($_GET, 'query', '')))));
    $fechaInicio  = trim(getVal($data, 'fecha_inicio', getVal($_GET, 'fecha_inicio', '')));
    $fechaFin     = trim(getVal($data, 'fecha_fin', getVal($_GET, 'fecha_fin', '')));

    $where = array("1=1");
    $whereSimple = array("1=1");

    if ($accion === 'listar_no_timbradas' || $filtroEstado === 'no_timbradas' || $filtroEstado === 'pendientes') {
        $where[] = "((F.UUID IS NULL OR F.UUID = '' OR F.UUID = '0') AND (F.estado IS NULL OR F.estado <> 'TIMBRADA') AND (F.timbrada IS NULL OR F.timbrada = 0))";
        $whereSimple[] = "((UUID IS NULL OR UUID = '' OR UUID = '0') AND (estado IS NULL OR estado <> 'TIMBRADA') AND (timbrada IS NULL OR timbrada = 0))";
    } elseif ($filtroEstado === 'timbradas') {
        $where[] = "((F.UUID IS NOT NULL AND F.UUID <> '' AND F.UUID <> '0') OR F.estado = 'TIMBRADA' OR F.timbrada = 1)";
        $whereSimple[] = "((UUID IS NOT NULL AND UUID <> '' AND UUID <> '0') OR estado = 'TIMBRADA' OR timbrada = 1)";
    }

    if (!empty($busqueda)) {
        $bEsc = dbEscape($busqueda);
        $where[] = "(COALESCE(C.RFC, F.rfc, '') LIKE '%$bEsc%' OR COALESCE(C.NOMBRE, F.nombre, '') LIKE '%$bEsc%' OR COALESCE(F.folio, F.FOLIO, '') LIKE '%$bEsc%' OR COALESCE(F.UUID, '') LIKE '%$bEsc%')";
        $whereSimple[] = "(COALESCE(rfc, '') LIKE '%$bEsc%' OR COALESCE(nombre, '') LIKE '%$bEsc%' OR COALESCE(folio, FOLIO, '') LIKE '%$bEsc%' OR COALESCE(UUID, '') LIKE '%$bEsc%')";
    }

    if (!empty($fechaInicio)) {
        $fIniEsc = dbEscape($fechaInicio);
        $where[] = "F.FECHA >= '$fIniEsc'";
        $whereSimple[] = "FECHA >= '$fIniEsc'";
    }
    if (!empty($fechaFin)) {
        $fFinEsc = dbEscape($fechaFin);
        $where[] = "F.FECHA <= '$fFinEsc 23:59:59'";
        $whereSimple[] = "FECHA <= '$fFinEsc 23:59:59'";
    }

    $whereSql = implode(' AND ', $where);
    $whereSqlSimple = implode(' AND ', $whereSimple);

    // 1. Pre-cargar catálogo de clientes en memoria para evitar errores de JOIN en MySQL
    $clientMap = array();
    $qCliAll = dbQuery("SELECT * FROM clientes");
    if ($qCliAll) {
        while ($rC = dbFetchAssoc($qCliAll)) {
            $cId = strval(getVal($rC, 'id', getVal($rC, 'ID', getVal($rC, 'ID_CLIENTE', getVal($rC, 'id_cliente', getVal($rC, 'idCliente', ''))))));
            if (!empty($cId)) {
                $clientMap[$cId] = $rC;
            }
        }
    }

    // 2. Consulta directa a la tabla facturas
    $sql = "SELECT * FROM facturas WHERE $whereSqlSimple ORDER BY COALESCE(ID_FACTURA, id_factura, folio, FOLIO, id, 1) DESC LIMIT 500";
    $res = dbQuery($sql);
    if (!$res) {
        $res = dbQuery("SELECT * FROM facturas ORDER BY 1 DESC LIMIT 500");
    }

    $lista = array();
    if ($res) {
        while ($row = dbFetchAssoc($res)) {
            $folioRow = trim(strval(getVal($row, 'folio', getVal($row, 'FOLIO', getVal($row, 'ID_FACTURA', getVal($row, 'id_factura', getVal($row, 'id', '')))))));
            $rawUuid  = trim(strval(getVal($row, 'uuid', getVal($row, 'UUID', ''))));
            $rawXml   = trim(strval(getVal($row, 'xml', getVal($row, 'XML', ''))));
            $rawEstado = strtoupper(trim(strval(getVal($row, 'estado', getVal($row, 'ESTADO', '')))));
            $rawTimbrada = intval(getVal($row, 'timbrada', getVal($row, 'TIMBRADA', 0)));
            
            $isTimbrada = (!empty($rawUuid) && $rawUuid !== '0' && strlen($rawUuid) > 5)
                          || ($rawTimbrada === 1 || $rawTimbrada === '1')
                          || ($rawEstado === 'TIMBRADA' || $rawEstado === '1' || $rawEstado === 'ACTIVA')
                          || (!empty($rawXml) && strlen($rawXml) > 3);
            
            $pdfUrl = $baseUrl . "facturas/factura_{$folioRow}.pdf";
            $xmlUrl = $baseUrl . "facturas/factura_{$folioRow}.xml";

            $idCliFk = strval(getVal($row, 'ID_CLIENTE', getVal($row, 'id_cliente', getVal($row, 'idCliente', 0))));
            $nombreCli = '';
            $rfcCli = 'XAXX010101000';
            $emailCli = '';
            $cpCli = '';
            $regCli = '612';
            $usoCli = 'G03';

            if (!empty($idCliFk) && isset($clientMap[$idCliFk])) {
                $rCli = $clientMap[$idCliFk];
                $nombreCli = getVal($rCli, 'NOMBRE', getVal($rCli, 'nombre', ''));
                $rfcCli    = getVal($rCli, 'RFC', getVal($rCli, 'rfc', 'XAXX010101000'));
                $emailCli  = getVal($rCli, 'EMAIL', getVal($rCli, 'email', ''));
                $cpCli     = getVal($rCli, 'CP', getVal($rCli, 'cp', ''));
                $regCli    = getVal($rCli, 'REGIMEN', getVal($rCli, 'regimen', '612'));
                $usoCli    = getVal($rCli, 'USOCFDI', getVal($rCli, 'usocfdi', 'G03'));
            } else {
                $nombreCli = getVal($row, 'cliente_nombre', getVal($row, 'nombre', getVal($row, 'NOMBRE', getVal($row, 'razon_social', ''))));
                $rfcCli    = getVal($row, 'cliente_rfc', getVal($row, 'rfc', getVal($row, 'RFC', 'XAXX010101000')));
                $emailCli  = getVal($row, 'cliente_email', getVal($row, 'correo', getVal($row, 'EMAIL', '')));
                $cpCli     = getVal($row, 'cliente_cp', getVal($row, 'cp', getVal($row, 'CP', '')));
                $regCli    = getVal($row, 'cliente_regimen', getVal($row, 'regimenfiscal', getVal($row, 'REGIMEN', '612')));
                $usoCli    = getVal($row, 'cliente_usocfdi', getVal($row, 'usocfdi', getVal($row, 'USOCFDI', 'G03')));
            }

            if (empty($nombreCli)) {
                $nombreCli = "CLIENTE #$idCliFk";
            }

            $subtotalVal = floatval(getVal($row, 'subtotal', getVal($row, 'SUBTOTAL', getVal($row, 'timporte', getVal($row, 'TIMPORTE', getVal($row, 'IMPORTE', 0))))));
            $ivaVal      = floatval(getVal($row, 'iva', getVal($row, 'IVA', 0)));
            $isrVal      = floatval(getVal($row, 'isr', getVal($row, 'ISR', getVal($row, 'ret_isr', getVal($row, 'RET_ISR', 0)))));
            $totalVal    = floatval(getVal($row, 'total', getVal($row, 'TOTAL', 0)));

            if ($totalVal <= 0 && $subtotalVal > 0) {
                $totalVal = round($subtotalVal + $ivaVal - $isrVal, 2);
            }
            if ($subtotalVal <= 0 && $totalVal > 0) {
                $subtotalVal = round($totalVal / 1.16, 2);
                $ivaVal = round($totalVal - $subtotalVal, 2);
            }

            $lista[] = array(
                'id'                  => getVal($row, 'id_factura', getVal($row, 'ID_FACTURA', getVal($row, 'id', $folioRow))),
                'folio'               => $folioRow,
                'serie'               => getVal($row, 'serie', getVal($row, 'SERIE', 'A')),
                'fecha'               => getVal($row, 'fecha', getVal($row, 'FECHA', '')),
                'ticket'              => getVal($row, 'ticket_id', getVal($row, 'TICKET_ID', getVal($row, 'ticket', getVal($row, 'TICKET', '')))),
                'ticket_id'           => getVal($row, 'ticket_id', getVal($row, 'TICKET_ID', getVal($row, 'ticket', getVal($row, 'TICKET', '')))),
                'rfc'                 => strtoupper(trim($rfcCli)),
                'razon_social'        => strtoupper(trim($nombreCli)),
                'nombre'              => strtoupper(trim($nombreCli)),
                'total'               => $totalVal,
                'subtotal'            => $subtotalVal,
                'iva'                 => $ivaVal,
                'ret_isr'             => $isrVal,
                'retencion_isr'       => $isrVal,
                'uuid'                => $rawUuid,
                'timbrada'            => $isTimbrada ? 1 : 0,
                'estado'              => $isTimbrada ? 'TIMBRADA' : ($rawEstado ? $rawEstado : 'PENDIENTE'),
                'email'               => getVal($row, 'cliente_email', getVal($row, 'correo', getVal($row, 'EMAIL', ''))),
                'correo'              => getVal($row, 'cliente_email', getVal($row, 'correo', getVal($row, 'EMAIL', ''))),
                'cp'                  => getVal($row, 'cliente_cp', getVal($row, 'cp', getVal($row, 'CP', ''))),
                'regimen_fiscal'      => getVal($row, 'cliente_regimen', getVal($row, 'regimenfiscal', getVal($row, 'REGIMEN', '612'))),
                'uso_cfdi'            => getVal($row, 'cliente_usocfdi', getVal($row, 'usocfdi', getVal($row, 'USOCFDI', 'G03'))),
                'pdf_url'             => $pdfUrl,
                'xml_url'             => $xmlUrl,
                'pdfUrl'              => $pdfUrl,
                'xmlUrl'              => $xmlUrl
            );
        }
    }

    // Totales rápidos para widgets
    $qStats = dbQuery("SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN (UUID IS NOT NULL AND TRIM(UUID) <> '' AND TRIM(UUID) <> '0') OR estado = 'TIMBRADA' OR estado = '1' OR timbrada = 1 OR (XML IS NOT NULL AND TRIM(XML) <> '') THEN 1 ELSE 0 END) AS timbradas_count,
        SUM(CASE WHEN ((UUID IS NULL OR TRIM(UUID) = '' OR TRIM(UUID) = '0') AND (estado IS NULL OR (estado <> 'TIMBRADA' AND estado <> '1')) AND (timbrada IS NULL OR timbrada = 0) AND (XML IS NULL OR TRIM(XML) = '')) THEN 1 ELSE 0 END) AS pendientes_count,
        SUM(CASE WHEN (UUID IS NOT NULL AND TRIM(UUID) <> '' AND TRIM(UUID) <> '0') OR estado = 'TIMBRADA' OR estado = '1' OR timbrada = 1 OR (XML IS NOT NULL AND TRIM(XML) <> '') THEN TOTAL ELSE 0 END) AS total_facturado_monto,
        SUM(CASE WHEN ((UUID IS NULL OR TRIM(UUID) = '' OR TRIM(UUID) = '0') AND (estado IS NULL OR (estado <> 'TIMBRADA' AND estado <> '1')) AND (timbrada IS NULL OR timbrada = 0) AND (XML IS NULL OR TRIM(XML) = '')) THEN TOTAL ELSE 0 END) AS total_no_timbrado_monto
        FROM facturas");
    $stats = dbFetchAssoc($qStats);
    $qCli  = dbQuery("SELECT COUNT(*) AS total_clientes FROM clientes");
    $cli   = dbFetchAssoc($qCli);

    $resumen = array(
        'total'                   => intval(getVal($stats, 'total_count', 0)),
        'total_facturas'          => intval(getVal($stats, 'total_count', 0)),
        'timbradas'               => intval(getVal($stats, 'timbradas_count', 0)),
        'facturas_timbradas'      => intval(getVal($stats, 'timbradas_count', 0)),
        'no_timbradas'            => intval(getVal($stats, 'pendientes_count', 0)),
        'pendientes'              => intval(getVal($stats, 'pendientes_count', 0)),
        'clientes_mysql'          => intval(getVal($cli, 'total_clientes', 0)),
        'monto_total_timbrado'    => floatval(getVal($stats, 'total_facturado_monto', 0)),
        'monto_total_no_timbrado' => floatval(getVal($stats, 'total_no_timbrado_monto', 0)),
        'monto_facturado'         => floatval(getVal($stats, 'total_facturado_monto', 0))
    );

    facturasLog("Listar Facturas OK: Encontradas=" . count($lista) . " | Timbradas=" . $resumen['timbradas'] . " | Monto=$" . $resumen['monto_facturado']);

    echo json_encode(array(
        'ok'       => true,
        'facturas' => $lista,
        'resumen'  => $resumen,
        'stats'    => $resumen
    ));
    exit;
}

// =========================================================================
// ACCIÓN 5: REENVIAR FACTURA POR CORREO
// =========================================================================
if ($accion === 'reenviar_correo' || $accion === 'enviar_correo') {
    $folio  = intval(getVal($data, 'folio', getVal($_GET, 'folio', 0)));
    $correo = trim(getVal($data, 'correo', getVal($data, 'email', getVal($_GET, 'correo', getVal($_GET, 'email', '')))));

    if ($folio <= 0) {
        echo json_encode(array('ok' => false, 'error' => 'Se requiere el folio de la factura.'));
        exit;
    }

    $qFact = dbQuery("SELECT * FROM facturas WHERE folio = $folio LIMIT 1");
    $fact  = dbFetchAssoc($qFact);

    if (!$fact) {
        echo json_encode(array('ok' => false, 'error' => "No se encontró la factura Folio #$folio en la base de datos."));
        exit;
    }

    $destinatario = !empty($correo) ? $correo : trim(getVal($fact, 'correo'));
    if (empty($destinatario)) {
        echo json_encode(array('ok' => false, 'error' => 'Por favor especifica una dirección de correo válida.'));
        exit;
    }

    $destEsc = dbEscape($destinatario);
    dbQuery("UPDATE facturas SET correo = '$destEsc' WHERE folio = $folio");

    $pdfUrl = $baseUrl . "facturas/factura_{$folio}.pdf";
    $xmlUrl = $baseUrl . "facturas/factura_{$folio}.xml";

    // Enviar correo nativo o retornar links listos
    $subject = "Factura Electrónica CFDI 4.0 - Folio #{$folio} - " . getVal($fact, 'nombre');
    $message = "Estimado cliente,\n\nAdjuntamos los enlaces para la descarga de su Comprobante Fiscal Digital por Internet (CFDI 4.0):\n\n"
             . "Folio: #{$folio}\n"
             . "RFC: " . getVal($fact, 'rfc') . "\n"
             . "Total: $" . number_format(floatval(getVal($fact, 'total', 0)), 2) . " MXN\n\n"
             . "Descargar PDF: $pdfUrl\n"
             . "Descargar XML: $xmlUrl\n\n"
             . "Gracias por su preferencia.";
    
    $headers = "From: no-reply@" . ($host ? $host : "cocinet.com") . "\r\n" .
               "Reply-To: no-reply@" . ($host ? $host : "cocinet.com") . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    @mail($destinatario, $subject, $message, $headers);
    facturasLog("Correo reenviado: Folio=$folio a $destinatario");

    echo json_encode(array(
        'ok'      => true,
        'mensaje' => "Factura enviada exitosamente a $destinatario.",
        'correo'  => $destinatario,
        'pdfUrl'  => $pdfUrl,
        'xmlUrl'  => $xmlUrl
    ));
    exit;
}

// =========================================================================
// ACCIÓN 6: TEST DE CONEXIÓN Y ESTADO GENERAL
// =========================================================================
if ($accion === 'test_conexion' || $accion === 'ping') {
    $qStats = dbQuery("SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN (UUID IS NOT NULL AND TRIM(UUID) <> '' AND TRIM(UUID) <> '0') OR estado = 'TIMBRADA' OR estado = '1' OR timbrada = 1 OR (XML IS NOT NULL AND TRIM(XML) <> '') THEN 1 ELSE 0 END) AS timbradas_count,
        SUM(CASE WHEN ((UUID IS NULL OR TRIM(UUID) = '' OR TRIM(UUID) = '0') AND (estado IS NULL OR (estado <> 'TIMBRADA' AND estado <> '1')) AND (timbrada IS NULL OR timbrada = 0) AND (XML IS NULL OR TRIM(XML) = '')) THEN 1 ELSE 0 END) AS pendientes_count,
        SUM(CASE WHEN (UUID IS NOT NULL AND TRIM(UUID) <> '' AND TRIM(UUID) <> '0') OR estado = 'TIMBRADA' OR estado = '1' OR timbrada = 1 OR (XML IS NOT NULL AND TRIM(XML) <> '') THEN TOTAL ELSE 0 END) AS total_facturado_monto,
        SUM(CASE WHEN ((UUID IS NULL OR TRIM(UUID) = '' OR TRIM(UUID) = '0') AND (estado IS NULL OR (estado <> 'TIMBRADA' AND estado <> '1')) AND (timbrada IS NULL OR timbrada = 0) AND (XML IS NULL OR TRIM(XML) = '')) THEN TOTAL ELSE 0 END) AS total_no_timbrado_monto
        FROM facturas");
    $stats = dbFetchAssoc($qStats);
    $qCli  = dbQuery("SELECT COUNT(*) AS total_clientes FROM clientes");
    $cli   = dbFetchAssoc($qCli);

    $resumenObj = array(
        'total'                   => intval(getVal($stats, 'total_count', 0)),
        'total_facturas'          => intval(getVal($stats, 'total_count', 0)),
        'timbradas'               => intval(getVal($stats, 'timbradas_count', 0)),
        'facturas_timbradas'      => intval(getVal($stats, 'timbradas_count', 0)),
        'no_timbradas'            => intval(getVal($stats, 'pendientes_count', 0)),
        'pendientes'              => intval(getVal($stats, 'pendientes_count', 0)),
        'clientes_mysql'          => intval(getVal($cli, 'total_clientes', 0)),
        'monto_total_timbrado'    => floatval(getVal($stats, 'total_facturado_monto', 0)),
        'monto_total_no_timbrado' => floatval(getVal($stats, 'total_no_timbrado_monto', 0)),
        'monto_facturado'         => floatval(getVal($stats, 'total_facturado_monto', 0))
    );

    facturasLog("Test Conexion / Ping OK: Timbradas=" . $resumenObj['timbradas'] . " | Monto=$" . $resumenObj['monto_facturado']);

    echo json_encode(array(
        'ok'         => true,
        'servidor'   => 'PHP MySQL CFDI 4.0 API Activa',
        'host'       => $host,
        'stats'      => $resumenObj,
        'resumen'    => $resumenObj,
        'log_path'   => __DIR__ . '/facturas.log'
    ));
    exit;
}

// =========================================================================
// ACCIÓN 7: VER O DESCARGAR FACTURAS.LOG
// =========================================================================
if ($accion === 'ver_log' || $accion === 'obtener_log' || $accion === 'leer_log') {
    $logFile = __DIR__ . '/facturas.log';
    $logContent = "";
    if (file_exists($logFile)) {
        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines && is_array($lines)) {
            $lastLines = array_slice($lines, -150);
            $logContent = implode(PHP_EOL, $lastLines);
        }
    } else {
        $logContent = "[" . date('Y-m-d H:i:s') . "] [INFO] Archivo facturas.log iniciado.";
    }

    echo json_encode(array(
        'ok'       => true,
        'log_path' => $logFile,
        'total_lineas' => isset($lines) ? count($lines) : 0,
        'log'      => $logContent
    ));
    exit;
}

facturasLog("Accion no reconocida: '$accion'");
echo json_encode(array('ok' => false, 'error' => "Acción no reconocida: '$accion'"));

