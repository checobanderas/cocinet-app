<?php require_once('frmencabezado.php');
header('Content-Type: text/html; charset=UTF-8');
?>

<?php
define('FPDF_FONTPATH', 'fpdf/font/');
require('mc_table.php');

$pdf=new PDF_MC_Table();
$pdf->AliasNbPages();
$pdf->Open();
$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);



foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}


foreach ($xml->xpath('//cfdi:Comprobante//cfdi:CfdiRelacionados') as $Relacionadostipo){ 
	
$tiporelacion = $Relacionadostipo['TipoRelacion'];

}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:CfdiRelacionados//cfdi:CfdiRelacionado') as $Relacionados){ 
	
 $eluuid=$Relacionados['UUID'];

}
//echo $tiporelacion." tipo relacion<br>";
//echo $eluuid." eluuid<br>";

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

//print_r($data);

for($i=0;$i<count($data);$i++)
{
	//echo "<br>"."<br>"."<br>";
	//echo $data[$i][0]."<br>";
	//echo $data[$i][1]."<br>";
	//echo $data[$i][2]."<br>";
	//echo $data[$i][3]."<br>";
	//echo $data[$i][4]."<br>";
	//echo $data[$i][5]."<br>";
	//echo $data[$i][6]."<br>";	

	//echo "<br>"."<br>"."<br>";
	//echo $data2[$i][0]."<br>";
	//echo $data2[$i][1]."<br>";
	//echo $data2[$i][2]."<br>";
	//echo $data2[$i][3]."<br>";
	//echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

//echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=0;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}



//echo "numlineas: ".$totlineas;

if($totlineas < 15 ){





$arch=folfile($_GET['folio'],$_SESSION['DB']);
//echo "<br>".$arch ;
$pdf->Output($arch);
//$pdf->Output( $arch, 'D');  
$sal="<A HREF=".$arch." >IMPRIMIR BOLETA</A>";
//if(!isset($salir)){}

//header("Content-type:application/pdf");



//header("Content-Disposition:inline;filename=$arch" );

print '<iframe id="CAJAFRAME" width="1200" height="1300" src=' .$arch. ' frameborder="0"></iframe>';



exit;
}


//////////pagina2


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=14;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}







echo "<br>". $totlineas . "<br>";


if($totlineas < 29 ){

$arch=folfile($_GET['folio'],$_SESSION['DB']);
echo "<br>".$arch ;
$pdf->Output($arch);
//$pdf->Output( $arch, 'D');  
$sal="<A HREF=".$arch." >IMPRIMIR BOLETA</A>";
//if(!isset($salir)){}

//header("Content-type:application/pdf");



//header("Content-Disposition:inline;filename=$arch" );

print '<iframe id="CAJAFRAME" width="1200" height="1300" src=' .$arch. ' frameborder="0"></iframe>';



exit;
}

//exit;

//////////pagina3


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);


///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=28;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}


if($totlineas < 43){

$arch=folfile($_GET['folio'],$_SESSION['DB']);
echo "<br>".$arch ;
$pdf->Output($arch);
//$pdf->Output( $arch, 'D');  
$sal="<A HREF=".$arch." >IMPRIMIR BOLETA</A>";
//if(!isset($salir)){}

//header("Content-type:application/pdf");



//header("Content-Disposition:inline;filename=$arch" );

print '<iframe id="CAJAFRAME" width="1200" height="1300" src=' .$arch. ' frameborder="0"></iframe>';



exit;
}






//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);


///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=42;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}


if($totlineas < 57){

$arch=folfile($_GET['folio'],$_SESSION['DB']);
echo "<br>".$arch ;
$pdf->Output($arch);
//$pdf->Output( $arch, 'D');  
$sal="<A HREF=".$arch." >IMPRIMIR BOLETA</A>";
//if(!isset($salir)){}

//header("Content-type:application/pdf");



//header("Content-Disposition:inline;filename=$arch" );

print '<iframe id="CAJAFRAME" width="1200" height="1300" src=' .$arch. ' frameborder="0"></iframe>';



exit;
}



//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=56;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}



if($totlineas < 71 ){

$arch=folfile($_GET['folio'],$_SESSION['DB']);
echo "<br>".$arch ;
$pdf->Output($arch);
//$pdf->Output( $arch, 'D');  
$sal="<A HREF=".$arch." >IMPRIMIR BOLETA</A>";
//if(!isset($salir)){}

//header("Content-type:application/pdf");



//header("Content-Disposition:inline;filename=$arch" );

print '<iframe id="CAJAFRAME" width="1200" height="1300" src=' .$arch. ' frameborder="0"></iframe>';



exit;
}



//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);


///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=70;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}





//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=84;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}




//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=98;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}




//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=112;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}




//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=126;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}




//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=120;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}



//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=134;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}




//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=148;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}



//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=162;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}



//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=176;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}


//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=190;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}





//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=204;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=218;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=232;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=246;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=260;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=274;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=288;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=302;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=316;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=330;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=344;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=358;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=372;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=386;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=400;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=414;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=428;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=442;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=456;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=470;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=484;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=498;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=512;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=527;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=543;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=560;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=578;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=597;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=617;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=638;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=660;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=683;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=707;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}

//////////pagina4


$pdf->AddPage('P','Letter');
$pdf->SetFont('Arial', '', 14);

//LLENO LA MATRIZ CON PRODUCTOS
$link=conectarse($_SESSION['DB']);

$CC= "SELECT CLAVEU,CANTIDAD,concat('XBX-' , UNIDAD) AS UNIDAD,DESCRIPCION,PRECIO,IMPORTE,IVA,TOTAL FROM detfactura WHERE TRIM(folio) ='" . $factura['FOLIO'] . "'";

$sql=mysql_query($CC,$link);

//print('nume de conceptos'.mysql_num_rows($sql));

//while($row = mysql_fetch_array($sql)){
//	$line=$row['CLAVEU'].";" .$row['CANTIDAD'].";".$row['UNIDAD'].";".utf8_decode($row['DESCRIPCION']).";".round($row['PRECIO'],2).";".round($row['IMPORTE'],2).";".round($row['IVA'],2).";".round($row['TOTAL'],2);
//
//    $data[]=explode(';',$line);
//
//}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
	
$line=$Concepto['ClaveProdServ'].";" . $Concepto['Cantidad'].";".$Concepto['ClaveUnidad']. "-".$Concepto['Unidad'].";".utf8_decode($Concepto['Descripcion']).";".$Concepto['ValorUnitario'].";".$Concepto['Importe'];

   $data[]=explode(';',$line);	
	
	
}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
	
$line=$Traslado['Base'].";" . $Traslado['Impuesto'].";".$Traslado['TipoFactor'].";".$Traslado['TasaOCuota'].";".$Traslado['Importe'];

   $data2[]=explode(';',$line);	
	
}

//echo var_dump($data);

print_r($data);

for($i=0;$i<count($data);$i++)
{
	echo "<br>"."<br>"."<br>";
	echo $data[$i][0]."<br>";
	echo $data[$i][1]."<br>";
	echo $data[$i][2]."<br>";
	echo $data[$i][3]."<br>";
	echo $data[$i][4]."<br>";
	echo $data[$i][5]."<br>";
	echo $data[$i][6]."<br>";	

	echo "<br>"."<br>"."<br>";
	echo $data2[$i][0]."<br>";
	echo $data2[$i][1]."<br>";
	echo $data2[$i][2]."<br>";
	echo $data2[$i][3]."<br>";
	echo $data2[$i][4]."<br>";	
}

//exit;
//$header=array('CLAVE','CANT','UNIDAD','DESCRIPCION','ValorUnitario','IMPORTE');




///////////////////MATRIZ CON PRODUCTOS
//YABLA DE CONCEPTOS 
    $pdf->SetFillColor(192,192,192);
    $pdf->SetTextColor(0);
    $pdf->SetDrawColor(128,0,0);
    $pdf->SetLineWidth(.3);
    $pdf->SetFont('Arial','B',9);
    //Cabecera
    $w=array(16,11,16,90,25,30,25,25,30);
    //for($i=0;$i<count($header);$i++)
$pdf->SetAligns(array('L','L','L','L','R','C','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,25));
        $pdf->Row(array('Clave','Cant','Unidad','Descripcion','ValorUnitario','Impuesto','Importe'));
		//$pdf->Ln();

    //Restauración de colores y fuentes
    $pdf->SetFillColor(0, 0, 255);
    $pdf->SetTextColor(0);
    if(count($header) > 25)
    {$pdf->SetFont('Arial','',6);}
     else{
      $pdf->SetFont('','',7);
     }
$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
$pdf->SetWidths(array(16,11,16,74,25,30,20,25,30));
    //Datos
    $fill=false;
  $contador = 0;
  $totlineas = count($data);

echo "numlineas: ".$totlineas;
//exit;

  $numlineas = 14;



for($i=732;$i<count($data);$i++)
{
	
	
	
   $pdf->SetWidths(array(16,11,16,74,25,15,15,25,30));
		$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
         if($contador == $numlineas ){ break;}
	 $pdf->Row(array($data[$i][0],$data[$i][1],$data[$i][2],$data[$i][3],number_format($data[$i][4],2,".",","),$data2[$i][1]."-IVA",number_format($data2[$i][4],2,".",","),number_format($data[$i][5],2,".",",")));

    $pdf->SetWidths(array(188));
   
	$pdf->SetAligns(array('C'));		
	//$pdf->Row(array('Impuestos Trasladados'));
	$pdf->SetWidths(array(16,11,16,90,25,30,20,25,30));
	$pdf->SetAligns(array('L','L','L','L','R','R','R','R'));
		
	 //$pdf->Row(array($data2[$i][0],$data2[$i][1],$data2[$i][2],$data2[$i][3],number_format($data2[$i][4],2,".",",")));		
         $contador = $contador + 1;	

}





$arch=folfile($_GET['folio'],$_SESSION['DB']);
echo "<br>".$arch ;
$pdf->Output($arch);
//$pdf->Output( $arch, 'D');  
$sal="<A HREF=".$arch." >IMPRIMIR BOLETA</A>";
//if(!isset($salir)){}

//header("Content-type:application/pdf");



//header("Content-Disposition:inline;filename=$arch" );

print '<iframe id="CAJAFRAME" width="1200" height="1300" src=' .$arch. ' frameborder="0"></iframe>';































//header('Location:' .$arch);	
?>