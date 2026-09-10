<?php
//
// +---------------------------------------------------------------------------+
// | satxmlsv22.php Procesa el arreglo asociativo de intercambio y genera un   |
// |               mensaje XML con los requisitos del SAT de la version 3.2    |
// |               publicada en el DOF del ? de Diciembre del 2011.            |
// |                                                                           |
// +---------------------------------------------------------------------------+
// | Copyright (c) 2011  Fabrica de Jabon la Corona, SA de CV                  |
// +---------------------------------------------------------------------------+
// | This program is free software; you can redistribute it and/or             |
// | modify it under the terms of the GNU General Public License               |
// | as published by the Free Software Foundation; either version 2            |
// | of the License, or (at your option) any later version.                    |
// |                                                                           |
// | This program is distributed in the hope that it will be useful,           |
// | but WITHOUT ANY WARRANTY; without even the implied warranty of            |
// | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             |
// | GNU General Public License for more details.                              |
// |                                                                           |
// | You should have received a copy of the GNU General Public License         |
// | along with this program; if not, write to the Free Software               |
// | Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA|
// +---------------------------------------------------------------------------|
// | Autor: Fernando Ortiz <fortiz@lacorona.com.mx>                            |
// +---------------------------------------------------------------------------+
// |19/dic/2011  Se toma como base el programa de la version 2.0 se agregan los|
// |             nuevos nodos, pero se usa xslt para formar la cadena original |
// +---------------------------------------------------------------------------+
//

	require_once('frmencabezado.php');
header('Content-Type: text/html; charset=UTF-8');
//$key="certificados/lakey.key.pem";
//$cer = "certificados/elcer.cer.pem";
 
$key="certificados/lakey.key.pem";
$cer = "certificados/elcer.cer.pem";

$sql='select * from clientes where emisor = "1"';
$elemisor=celda($_SESSION['DB'],$sql);
$empresa=$elemisor['nomcomercial'];
$direccion=" Calle:".$elemisor['calle']. " Col:".$elemisor['colonia'];

$folioTarget = isset($_GET['id']) ? trim($_GET['id']) : (isset($_POST['folio']) ? trim($_POST['folio']) : (isset($_GET['folio']) ? trim($_GET['folio']) : ''));
$probarfolio = !empty($probarfolio) ? $probarfolio : $folioTarget;

$sql = "select ID_CLIENTE, id_cliente from facturas where folio = '" . $folioTarget ."'" ;
$rowFactCli = celda($_SESSION['DB'], $sql);
$cli = !empty($rowFactCli['ID_CLIENTE']) ? $rowFactCli['ID_CLIENTE'] : (!empty($rowFactCli['id_cliente']) ? $rowFactCli['id_cliente'] : 0);
$cli = intval($cli);

if ($cli > 0) {
    $sql = 'select * from clientes where id = ' . $cli ;
    $cliente = celda($_SESSION['DB'], $sql);
} else {
    $cliente = array();
}

$sql = 'select * from facturas where FOLIO= "' . $probarfolio .'" or folio = "' . $probarfolio . '"';
$factura = celda($_SESSION['DB'], $sql);

$sql='select * from parametros' ;
$parametros=celda($_SESSION['DB'],$sql);

$no_cer=$parametros['CERTIFICADO'];

//echo $sql;
//echo $factura['folio'];
//error_reporting(E_ERROR | E_PARSE);

// {{{  satxmlsv22
function satxmlsv22() {
global $xml, $cadena_original, $conn, $sello, $texto, $ret;

//error_reporting(E_ALL & ~(E_WARNING | E_NOTICE));
//error_reporting(E_ALL);
ini_set('max_execution_time', 1000); 	
//echo "inicio"."<br>";
satxmlsv22_genera_xml($arr,$edidata,$dir,$nodo,$addenda);
//echo "inicio2"."<br>";
$cad=satxmlsv22_genera_cadena_original();
//echo "inicio3"."<br>";
satxmlsv22_sella($arr);

//echo "inicio4"."<br>";
$ret = satxmlsv22_termina($arr,$dir);
//echo "inicio4"."<br>";
satxmlsv33_valida();

return $ret;
//die();
}
// }}}
// {{{  satxmlsv22_genera_xml
function satxmlsv22_genera_xml($arr, $edidata, $dir,$nodo,$addenda) {
global $xml, $ret;
//$xml = new DOMdocument('1.0','UTF-8');
$xml = new DOMdocument();	
satxmlsv22_generales($arr, $edidata, $dir,$nodo,$addenda);
satxmlsv22_relacionados($arr, $edidata, $dir,$nodo,$addenda);
satxmlsv22_emisor($arr, $edidata, $dir,$nodo,$addenda);
satxmlsv22_receptor($arr, $edidata, $dir,$nodo,$addenda);
satxmlsv22_conceptos($arr, $edidata, $dir,$nodo,$addenda);
satxmlsv22_impuestos($arr, $edidata, $dir,$nodo,$addenda);
#satxmlsv22_complemento($arr, $edidata, $dir,$nodo,$addenda);
#$ok = satxmlsv22_valida();
}
// }}}
// {{{  Datos generales del Comprobante
function satxmlsv22_generales($arr, $edidata, $dir,$nodo,$addenda) {
global $root, $xml,$factura,$no_cer;
$root = $xml->createElement("cfdi:Comprobante");
$root = $xml->appendChild($root);
 
date_default_timezone_set('America/Mexico_city');
//SI NO TRAE DECIMALES
	//LEPONGO 2

$pasoimporte= explode('.',$factura['TIMPORTE']);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elsubtotal =  $entero.'.'.$fraccionlleno;	

		
$pasoimporte= explode('.',$factura['TOTAL']);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$eltotal =  $entero.'.'.$fraccionlleno;	

$pasoimporte= explode('.',$factura['IVA']);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$eliva =  $entero.'.'.$fraccionlleno;	



$horaCompleta = date('H:i:s');
list($hora, $minuto, $segundo) = explode(':', $horaCompleta);

$hora = intval($hora) - 1;

if ($hora < 0) {
    $hora = 23;
} elseif ($hora < 10) {
    $hora = "0" . $hora;
}

$horaAjustada = $hora . ':' . $minuto . ':' . $segundo;
//echo $horaAjustada;



	
satxmlsv22_cargaAtt($root, array("Certificado"=>"@",
	                             "Exportacion"=>"01",
								 "Fecha"=>$factura['FECHA']. "T". $hora .date(":i:s"),
								  "Folio"=>intval($factura["FOLIO"]),
								 "LugarExpedicion"=>"68000",
								 "FormaPago"=>$factura['METODODEPAGO'],
								 "MetodoPago"=>$factura['FORMADEPAGO'],
								  "Moneda"=>"MXN",
								 "NoCertificado"=>$no_cer,
								  "Sello"=>"@",
								 "Serie"=>"B",
								  "SubTotal"=>$elsubtotal,
								 "TipoCambio"=>"1",
								 "TipoDeComprobante"=>"I",
								 "Total"=>$eltotal,
								 "Version"=>"4.0"
			  
//="01" ="PUE" 								 
                   )
                );

satxmlsv22_cargaAtt($root, array("xmlns:cfdi"=>"http://www.sat.gob.mx/cfd/4",
                          "xmlns:xs"=>"http://www.w3.org/2001/XMLSchema",
                          "xmlns:xsi"=>"http://www.w3.org/2001/XMLSchema-instance",
                          "xsi:schemaLocation"=>"http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"
                         )
                     );	
//				
		//	if(intval($factura["NUMCTAPAGO"])>0) 
//			{
//			satxmlsv22_cargaAtt($root, array("NumCtaPago"=>$factura["NUMCTAPAGO"]) );
//			}
			//if(strlen($factura["CONDICIONESPAGO"])>0) 
//			{
//			satxmlsv22_cargaAtt($root, array("CondicionesDePago"=>$factura["CONDICIONESPAGO"]) );
//			}
							
				
}

//  <cfdi:CfdiRelacionados TipoRelacion="01">
//    <cfdi:CfdiRelacionado UUID="A39DA66B-52CA-49E3-879B-5C05185B0EF7"/>
//  </cfdi:CfdiRelacionados>
// {{{ Datos del RELACIONADOS
function satxmlsv22_relacionados($arr, $edidata, $dir,$nodo,$addenda) {


global $root, $xml,$elemisor,$parametros,$factura;
	
if(($factura["RELACIONADOS"])<>'') 
			{	
$relacionados = $xml->createElement("cfdi:CfdiRelacionados");
$relacionados = $root->appendChild($relacionados);
satxmlsv22_cargaAtt($relacionados, array("TipoRelacion"=>$factura["TIPORELACION"])
                   
                );
$relacionado = $xml->createElement("cfdi:CfdiRelacionado");
$relacionado = $relacionados->appendChild($relacionado);
satxmlsv22_cargaAtt($relacionado, array("UUID"=>$factura["RELACIONADOS"])
                );
	
	
			}	
	
				
}



// {{{ Datos del Emisor  UsoCFDI="G01"
function satxmlsv22_emisor($arr, $edidata, $dir,$nodo,$addenda) {
global $root, $xml,$elemisor,$parametros;
$emisor = $xml->createElement("cfdi:Emisor");
$emisor = $root->appendChild($emisor);
satxmlsv22_cargaAtt($emisor, array("Rfc"=>$parametros['RFC'],
									"Nombre"=>($elemisor['NOMBRE']),
									"RegimenFiscal"=>$parametros['REGIMEN']
                   )
                );


}
// }}}
// {{{ Datos del Receptor
function satxmlsv22_receptor($arr, $edidata, $dir,$nodo,$addenda) {
global $root, $xml,$cliente,$factura;
$receptor = $xml->createElement("cfdi:Receptor");
$receptor = $root->appendChild($receptor);
satxmlsv22_cargaAtt($receptor, array("Rfc"=>$cliente['RFC'],
	"DomicilioFiscalReceptor"=>$cliente['DOMFISCAL'],
	"RegimenFiscalReceptor"=>$cliente['REGIMEN'],
                          "Nombre"=>utf8_decode($cliente['NOMBRE']),
									"UsoCFDI"=>$factura['USOCFDI']
                      )
                  );
}
// }}}
// {{{ Detalle de los conceptos/productos de la factura
function satxmlsv22_conceptos($arr, $edidata, $dir,$nodo,$addenda) {
global $root, $xml,$probarfolio,$factura;

$conceptos = $xml->createElement("cfdi:Conceptos");
$conceptos = $root->appendChild($conceptos);


$sql='SELECT * FROM detfactura where folio = "' . $probarfolio . '"';
//echo $sql;
$link = conectarse('universidad');
$eldato=mysql_query($sql,$link);
//$fila=mysql_fetch_array($eldato);
 if(mysql_num_rows($eldato)>0)
$buffer2="";
//echo "entre a while";
	{
		while($fila=mysql_fetch_array($eldato))
		{
$elvu=	$fila['VALORUNITARIO'];	
$pasoimporte= explode('.',$elvu);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elvu =  $entero.'.'.$fraccionlleno;
			
$miimporte=	$fila['CANTIDAD'] * $fila['VALORUNITARIO'];	
$pasoimporte= explode('.',$miimporte);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elimporte =  $entero.'.'.$fraccionlleno;			
			
			$concepto = $xml->createElement("cfdi:Concepto");
			$concepto = $conceptos->appendChild($concepto);
			$prun = $arr['Conceptos'][$i]['valorUnitario'];
			satxmlsv22_cargaAtt($concepto, array("ClaveProdServ"=>$fila['CLAVES'],
									  "ClaveUnidad"=>$fila['CLAVEU'],
									  "Cantidad"=>$fila['CANTIDAD'],
									                "ObjetoImp"=>"02",
									  "Unidad"=>$fila['UNIDAD'],
									  "Descripcion"=>$fila['DESCRIPCION'],
									  "ValorUnitario"=>$elvu,
									  "Importe"=>$elimporte,
						   )
						);

$Basetr =$elimporte;

			
$pasoimporte= explode('.',$elimporte);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elimporte =  $entero.'.'.$fraccionlleno;				

$pasoimporte= explode('.',$fila['IVA']);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$eliva =  $entero.'.'.$fraccionlleno;				
			
			$tasaocuota="0.160000";
		if ($fila['TIPOIVA'] == 'cero'){$tasaocuota="0.000000";}	
    $impuestos = $xml->createElement("cfdi:Impuestos");
    $impuestos = $concepto->appendChild($impuestos);
    $traslados = $xml->createElement("cfdi:Traslados");
    $traslados = $impuestos->appendChild($traslados);
    $traslado = $xml->createElement("cfdi:Traslado");
    $traslado = $traslados->appendChild($traslado);
    satxmlsv22_cargaAtt($traslado, 
        array("Base"=>$Basetr,
              "Importe"=> $eliva,
              "Impuesto"=>"002",
              "TasaOCuota"=>$tasaocuota,
              "TipoFactor"=>"Tasa"
             )
        );


$pasoimporte= explode('.',($factura['ISR']));
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elimporteisr =  $entero.'.'.$fraccionlleno;

	
if($elimporteisr>0){
$retenciones = $xml->createElement("cfdi:Retenciones");
    $retenciones = $impuestos->appendChild($retenciones);
    $retencion = $xml->createElement("cfdi:Retencion");
    $retencion = $retenciones->appendChild($retencion);
    satxmlsv22_cargaAtt($retencion, 
        array("Base"=>$elimporte,
              "Importe"=>$elimporteisr,
              "Impuesto"=>"001",
              "TasaOCuota"=>"0.012500",
              "TipoFactor"=>"Tasa"
             )
        );

}			

$pasoimporte= explode('.',($factura['RETIVA']));
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elimporteretiva =  $entero.'.'.$fraccionlleno;		
			
    // $retencion = $xml->createElement("cfdi:Retencion");
    // $retencion = $retenciones->appendChild($retencion);
    // satxmlsv22_cargaAtt($retencion, 
    //     array("Base"=>$elimporte,
    //           "Importe"=>$elimporteretiva,
    //           "Impuesto"=>"002",
    //           "TasaOCuota"=>"0.106666",
    //           "TipoFactor"=>"Tasa"
    //          )
    //     );			
	

	  //  $ctapredial = $xml->createElement("cfdi:CuentaPredial");
   // $ctapredial = $concepto->appendChild($ctapredial);
    //satxmlsv22_cargaAtt($ctapredial  , array("Numero"=>71233));			

		}


	}

$totretenciones=$elimporteisr+ $elimporteretiva;

}






function satxmlsv22_impuestos($arr, $edidata, $dir,$nodo,$addenda) {
global $root, $xml ,$factura,$totretenciones,$elsubtotal;
$Impuestos=array(2,2,2,2,2,2,2,2);
	
$pasoimporte= explode('.',$factura['IVA']);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$eliva =  $entero.'.'.$fraccionlleno;		
	
    $impuestos = $xml->createElement("cfdi:Impuestos");
    $impuestos = $root->appendChild($impuestos);
	

//$retenciones = $xml->createElement("cfdi:Retenciones");
//    $retenciones = $impuestos->appendChild($retenciones);
//    $retencion = $xml->createElement("cfdi:Retencion");
//    $retencion = $retenciones->appendChild($retencion);
//    satxmlsv22_cargaAtt($retencion, 
//        array("Importe"=>'0.000000',
//              "Impuesto"=>"002",
//
//             )
//        );
	
$pasoimporte= explode('.',($factura['ISR']));
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elimporteisr =  $entero.'.'.$fraccionlleno;

	
if($elimporteisr>0){			
$retenciones = $xml->createElement("cfdi:Retenciones");
    $retenciones = $impuestos->appendChild($retenciones);
    $retencion = $xml->createElement("cfdi:Retencion");
    $retencion = $retenciones->appendChild($retencion);
    satxmlsv22_cargaAtt($retencion, 
        array(
              "Importe"=>$elimporteisr,
              "Impuesto"=>"001"
             )
        );

}        
$pasoimporte= explode('.',($factura['RETIVA']));
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$fraccionlleno=str_pad($fraccion,2,'0');
$elimporteretiva =  $entero.'.'.$fraccionlleno;		
			
    // $retencion = $xml->createElement("cfdi:Retencion");
    // $retencion = $retenciones->appendChild($retencion);
    // satxmlsv22_cargaAtt($retencion, 
    //     array(
    //           "Importe"=>$elimporteretiva,
    //           "Impuesto"=>"002"
              
    //          )
    //     );			
			
		
	
	
	
	
	
    $traslados = $xml->createElement("cfdi:Traslados");
    $traslados = $impuestos->appendChild($traslados);
    $traslado = $xml->createElement("cfdi:Traslado");
    $traslado = $traslados->appendChild($traslado);
	if( floatval($eliva) > 0)
	   {
    satxmlsv22_cargaAtt($traslado, 
        array(
            "Base"=>$factura['TIMPORTE'],
              "Importe"=>$eliva,
              "Impuesto"=>"002",
              "TasaOCuota"=>"0.160000",
              "TipoFactor"=>"Tasa"
             )
        );	
	}
		else {
   // $traslado = $xml->createElement("cfdi:Traslado");	
//	$traslado = $traslados->appendChild($traslado);
    satxmlsv22_cargaAtt($traslado, 
        array(
            "Base"=>$factura['TIMPORTE'],
              "Importe"=>'0.00',
              "Impuesto"=>"002",
              "TasaOCuota"=>"0.000000",
              "TipoFactor"=>"Tasa"
             )
        );		
	}
		


	
	
	
$impuestos->SetAttribute("TotalImpuestosTrasladados",$eliva);
	
if($elimporteisr>0){
$impuestos->SetAttribute("TotalImpuestosRetenidos",$elimporteretiva+$elimporteisr);	
}

}
// }}}
// {{{ genera_cadena_original
function satxmlsv22_genera_cadena_original() {
global $xml, $cadena_original, $factura;
//echo "CADINI: ". $cadena_original;
$paso = new DOMDocument;
$paso->loadXML($xml->saveXML());
$xsl = new DOMDocument;
//echo "CADINI2: ". $cadena_original;
$file="xslt/cadenaoriginal_4_0.xslt";      // Ruta al archivo
$xsl->load($file);
$proc = new XSLTProcessor;
//echo "CADINI3: ". $cadena_original;
$proc->importStyleSheet($xsl);
$cadena_original = $proc->transformToXML($paso);
//echo "CAD: ". $cadena_original;
$cad="cadori-". $factura["FOLIO"].".txt";
$filecad = fopen($cad, "w");
fwrite($filecad, $cadena_original . PHP_EOL);
fclose($file);


}

// {{{ Calculo de sello
function satxmlsv22_sella33($arr) {
global $root, $cadena_original, $sello,$cer,$key,$no_cer,$elsello,$elcertificado;
$certificado = $no_cer;
//$ruta = "/u/cte/src/cfd/";
$file=$cer;   // Ruta al archivo
// Obtiene la llave privada del Certificado de Sello Digital (CSD),
//    Ojo , Nunca es la FIEL/FEA
$pkeyid = openssl_get_privatekey(file_get_contents($file));
openssl_sign($cadena_original, $crypttext, $pkeyid, OPENSSL_ALGO_SHA256);
openssl_free_key($pkeyid);
$sello = base64_encode($crypttext);      // lo codifica en formato base64
$root->setAttribute("Sello",$sello);
$file=$key;      // Ruta al archivo de Llave publica
$datos = file($file);
$certificado = ""; $carga=false;
for ($i=0; $i<sizeof($datos); $i++) {
    if (strstr($datos[$i],"END CERTIFICATE")) $carga=false;
    if ($carga) $certificado .= trim($datos[$i]);
    if (strstr($datos[$i],"BEGIN CERTIFICATE")) $carga=true;
}
// El certificado como base64 lo agrega al XML para simplificar la validacion
$root->setAttribute("Certificado",$certificado);
}
// }}}


function satxmlsv22_sella($arr) {
global $root, $cadena_original, $sello,$cer,$key,$no_cer,$elsello,$elcertificado;
$certificado = $no_cer;
$file=$key;      // Ruta al archivo
// Obtiene la llave privada del Certificado de Sello Digital (CSD),
//echo "jjkk ".$cadena_original;
//    Ojo , Nunca es la FIEL/FEA
$pkeyid = openssl_get_privatekey(file_get_contents($file));
// crear la firma
//openssl_sign($datos, $firma, $private_key_pem, OPENSSL_ALGO_SHA256);
	
openssl_sign($cadena_original, $crypttext, $pkeyid, OPENSSL_ALGO_SHA256);
openssl_free_key($pkeyid);
 
$sello = base64_encode($crypttext);      // lo codifica en formato base64
//$sello=$elsello;
$root->setAttribute("Sello",$sello);
 
$file=$cer;      // Ruta al archivo de Llave publica
$datos = file($file);
$certificado = ""; $carga=false;
for ($i=0; $i<sizeof($datos); $i++) {
    if (strstr($datos[$i],"END CERTIFICATE")) $carga=false;
    if ($carga) $certificado .= trim($datos[$i]);
    if (strstr($datos[$i],"BEGIN CERTIFICATE")) $carga=true;
}
// El certificado como base64 lo agrega al XML para simplificar la validacion

//$certificado=$elcertificado;
$root->setAttribute("Certificado",$certificado);
}
// }}}


function satxmlsv22_termina($arr,$dir) {
global $xml, $conn;
$xml->formatOutput = true;
$todo = $xml->saveXML();
$nufa = $arr['serie'].$arr['folio'];    // Junta el numero de factura   serie + folio
$paso = $todo;
return($todo);
}
// {{{ Funcion que carga los atributos a la etiqueta XML
function satxmlsv22_cargaAtt(&$nodo, $attr) {
$quitar = array('sello'=>1,'noCertificado'=>1,'certificado'=>1);
foreach ($attr as $key => $val) {
    $val = preg_replace('/\s\s+/', ' ', $val);   // Regla 5a y 5c
    $val = trim($val);                           // Regla 5b
    if (strlen($val)>0) {   // Regla 6
        $val = utf8_encode(str_replace("|","/",$val)); // Regla 1
        $nodo->setAttribute($key,$val);
    }
}
}
 
// {{{ valida que el xml coincida con esquema XSD
function satxmlsv33_valida() {
global $xml, $texto;
$xml->formatOutput=true;
$paso = new DOMDocument("1.0","UTF-8");
$texto = $xml->saveXML();
$paso->loadXML($texto);
// file_put_contents("paso.xml",$texto);
libxml_use_internal_errors(true);
libxml_clear_errors();
$ruta = "xslt/";
$file=$ruta."cfdv40.xsd"; 
	
$ok = $paso->schemaValidate($file);
return $ok;
}
// }}}
// {{{ display_xml_errors
function display_xml_errors() {
    global $texto;
    $lineas = explode("\n", $texto);
    $errors = libxml_get_errors();

    foreach ($errors as $error) {
        echo display_xml_error($error, $lineas);
    }

    libxml_clear_errors();
}
/// }}}}
// {{{ display_xml_error
function display_xml_error($error, $lineas) {
    $return  = $lineas[$error->line - 1]. "\n";
    $return .= str_repeat('-', $error->column) . "^\n";

    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "Warning $error->code: ";
            break;
                                                       
         case LIBXML_ERR_ERROR:
            $return .= "Error $error->code: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "Fatal Error $error->code: ";
            break;
    }

    $return .= trim($error->message) .
               "\n  Linea: $error->line" .
               "\n  Columna: $error->column";
    echo "$return\n\n--------------------------------------------\n\n";
}

?>