<?php require_once('frmencabezado.php');?>
 <meta http-equiv="refresh" content="4" />

<?php

//echo "Espero un minuto......... PROCESANDO FACTURA.............";

# Username and Password, assigned by FINKO
 
 ///// DEMO O REAL
$sql='select * from parametros' ;
$parametros=celda($_SESSION['DB'],$sql);


$username = $parametros['USER'];
$password = $parametros['PASS'];


$urltimbra = $parametros['URLTIMBRA'];
# Read the xml file and encode it on base64
$invoice_path = $_GET['id'];
$xml_file = fopen($invoice_path, "rb");
$xml_content = fread($xml_file, filesize($invoice_path));
fclose($xml_file);

#In newer PHP versions the SoapLib class automatically converts FILE parameters to base64, so the next line is not needed, otherwise uncomment it
#$xml_content = base64_encode($xml_content);

# Consuming the stamp service
//$url = "http://facturacion.finkok.com/servicios/soap/stamp.wsdl";
$url =$urltimbra;
$client = new SoapClient($url);
 
$params = array(
  "xml" => $xml_content,
  "username" => $username,
  "password" => $password
);
$response = $client->__soapCall("stamp", array($params));

####mostrar el XML timbrado solamente, este se mostrara solo si el XML ha sido timbrado o recibido satisfactoriamente.
#print $response->stampResult->xml;

//echo "<br />"; 
//echo "<br />"; 


if ( $response->stampResult->CodEstatus=='Comprobante timbrado satisfactoriamente') {
echo  " <H1 class='bg-success'> TIMBRADO EXITOSO   </H1>";


$xmlTimbrado=$response->stampResult->xml;
file_put_contents($_GET['id'],$xmlTimbrado );

//echo   "<br />";

$param2='';
$param2= "update facturas set UUID='" . $response->stampResult->UUID  . "'";
//echo "<br />"; 
$param2.= ", FechaTimbrado='" . $response->stampResult->Fecha  . "'";
//echo "<br />"; 
$param2.= ", noCertificadoSAT='" . $response->stampResult->NoCertificadoSAT . "'";
//echo "<br />"; 
//$param2.= ", selloCFD='" . $response['selloCFD']  . "'";
//echo "<br />"; 
$param2.= ", selloSAT='" .$response->stampResult->SatSeal  . "'";
$param2.= " where folio = '" . $_GET['folio'] . "'";
//echo $param2;
actualizar('UNIVERSIDAD',$param2);
//echo "<br />"; 
//echo "<br />";


//print_r($response);
//echo " <script> location.reload(); </script> ";
	//echo " <script> setTimeout(function(){
 //  window.location.reload(1);
//}, 5000);  </script> ";
require_once('leexml.php');
	

//	$page = $_SERVER['PHP_SELF'];
//$sec = "3";
//header("Refresh: $sec; url=$page");

}

else
{
$error=$response->stampResult->Incidencias->Incidencia->MensajeIncidencia;	
	
if($error == 'Timbre Existente') {

echo "YA FUE TIMBRADA PREVIAMENTE";
	
	include('facturapdf.php?folio=' . $_GET['folio'] );
}
else{
echo "<br />"; 
echo "<br />";	
echo  print_r($response,true) . "\n<br>";
	
	
	
}
	//
//	//require_once('facturapdf2.php?folio=' . $_GET['folio'] );
//}	
//$xmlTimbrado=$response->stampResult->xml;
//file_put_contents($_GET['id'],$xmlTimbrado );


//print_r("<h1>".$response."</h1>");
	
}

//include('facturapdf.php?folio=' . $_GET['folio'] );

?>
<script type="text/javascript"> 


</script>