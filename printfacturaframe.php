

 <?php 
 require_once('frmencabezado.php');
require_once('plugin/lasclases.php');

 ?>

 <?php
//echo "holaprintfactrraframe";

 $sql='select * from facturas where id_factura= ' . $_GET['id'] ;
$factura=celda($_SESSION['DB'],$sql); 

//echo $sql . "<br>";

$sql="select id_cliente from facturas where id_factura = " . $_GET['id'] ;
//echo $sql . "<br>";



$cli=dato("id_cliente",$_SESSION['DB'],$sql);
//echo $cli. "<br>";
$sql='select * from clientes where id = ' . $cli ;
$cliente=celda($_SESSION['DB'],$sql);

//echo $factura['XML']. " archivo de factura";
//$_SERVER['DOCUMENT_ROOT'].
if (file_exists($factura['XML'])==false){
//echo 'no existe';
require_once('masivo22.php');
//	exit;
}
//exit;

?>

</head>

<body>
<table width="1200" border="0">
  <tr class="TITULOAZUL sticky-top ">
    <td width="382">
<h1 class='bg-info text-primary'>FACTURA : <span style="mso-spacerun:yes">
    
    <input name="FOLIO" style="width: 190px;" type="text" class="" id="FOLIO" value="<?php echo $factura['FOLIO']; ?>" readonly>  </span>  </h1>

     <!--  FACTURA:
        <input name="ID_CLIENTE" type="text" class="botongde" id="ID_CLIENTE" style="width:200" value="<?php echo $factura['FOLIO']; ?>" />  -->   </td>
    <td width="126"><img src="imagenes/pdf.jpg" width="68" height="70" style="cursor:hand;" alt="IMPRIMIR EN PDF" onClick="javascript:facturapdf('<?php echo $factura['FOLIO']; ?>');" /></td>
    <td width="170"><img src="imagenes/miniprinter.jpg" alt="IMPRIMIR EN FORMATO TIKET" width="103" height="79" style="cursor:hand;" onClick="javascript:tkfactura('<?php echo $factura['FOLIO']; ?>');" /></td>
    <td width="256"><img src="imagenes/correo.jpg" alt="ENVIAR FACTURA POR CORREO" width="170" height="81" style="cursor:hand;" onClick="javascript:email('<?php echo $cliente['correo']?>' , '<?php echo  "FAC-" .$factura['FOLIO'] . ".pdf"; ?>' , '<?php echo  $factura['XML']; ?>' , '<?php echo  $factura['FOLIO']; ?>'  );" /></td>
    <td width="256"><img src="imagenes/close2.png" alt="SALIR" width="64" height="64" onClick="javascript:window.open('','_parent','');window.close();"   style="cursor:pointer;" /></td>
  </tr>
  <tr>
    <td><input  

<?php if ($factura['UUID']<>''){ echo " style='display:none' "; }?>

     name="BTGUARDAR" type="submit" class="printtext2" id="BTGUARDAR" value="TIMBRAR Y SELLAR" onClick="javascript:timbrar('<?php echo $factura['XML'];?>','<?php echo $factura['FOLIO'];?>')" />
    <?php  echo "<a href='". $factura['XML'] ."'  target='new' >". $factura['XML'] ." </a>"; ?></td>
    <td colspan="4">&nbsp;</td>
  </tr>
  <tr>
    <td colspan="5"><div id="dvtimbra" class="bg-info"><?php if ($factura['UUID']<>''){ echo "<h1> <a href='". "cfdi.php?uuid=".$factura['UUID'] ."'  target='new' >". "FOLIO FISCAL:". $factura['UUID'] ." </a> </h1>"; }?></div><div id="xmldiv">
	<?php
        if($factura['IVA']==0){$arch="printfacturat0.php?id=". $_GET['id'];}
	else{$arch="facturapdf.php?folio=". $factura['FOLIO'];}

	//$arch="printfactura.php?id=". $_GET['id'];		
	print '<iframe id="CAJAFRAME" width="1300" height="500" src=' .$arch. ' frameborder="0"></iframe>';

	 //include('printfactura.php'); ?></td>
  </tr>
  <tr>
    <td colspan="5"><span style="visibility:hidden">
      <?php  echo "<a href='". $factura['XML'] ."'  target='new' >". $factura['XML'] ." </a>"; ?>
    </span></td>
  </tr>
  <tr>
    <td colspan="5"></td>
  </tr>
</table>
</body>
</html>


<SCRIPT> document.title = "<?php echo "FACTURA : ".$factura['FOLIO'];?>"; </SCRIPT>