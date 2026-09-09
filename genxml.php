
<?php 
require_once('frmencabezado.php');
//$_GET['id']='2B';
$nuevo_archivo = 'FAC-'. $_GET['id'] .'.xml';
//
//if (!copy($archivo, $nuevo_archivo)) {
//    echo "Error al copiar $archivo...\n";
//}
//
//$sql='update facturas set xml = "' . $nuevo_archivo  . '"' . ' where folio= "' . $_GET['id'] . '"';
//actualizar($_SESSION['DB'],$sql);
// echo "<a href='". $nuevo_archivo ."'  target='new' >". $nuevo_archivo ." </a>";
 
require_once('creacfdi.php'); 
$xml=satxmlsv22(); 
 
 
 
/* <?php

$xml = satxmlsv32(); // Genera cadena XML en base a arreglo asociativo y cadena EDI*/
print $xml;         // Muestra el XML
$fp = fopen($nuevo_archivo,"w");
fwrite($fp,$xml);
fclose($fp);



$sql='update facturas set xml = "' . $nuevo_archivo  . '"' . ' where folio= "' . $_GET['id'] . '"';
//echo $sql;
actualizar($_SESSION['DB'],$sql);
 echo "<a href='". $nuevo_archivo ."'  target='new' >". $nuevo_archivo ." </a>";

?>



