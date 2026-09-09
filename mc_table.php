<?php require_once('frmencabezado.php');

header('Content-Type: text/html; charset=UTF-8');
?>
<?php

require('fpdf/fpdf.php');

######
#  LEO LAS VARIABLE DIRECTAMENTE DEL XML
$rutaArchivo='FAC-'. $_GET['folio'].'.xml';
//$rutaArchivo='FAC-1A.xml';

$xml = simplexml_load_file($rutaArchivo); 
$ns = $xml->getNamespaces(true);
$xml->registerXPathNamespace('c', $ns['cfdi']);
$xml->registerXPathNamespace('t', $ns['tfd']);
 
 
//EMPIEZO A LEER LA INFORMACION DEL CFDI E IMPRIMIRLA 
foreach ($xml->xpath('//cfdi:Comprobante') as $cfdiComprobante){ 
      //echo $cfdiComprobante['Version']; 
//      echo "<br />"; 
//      echo $cfdiComprobante['Fecha']; 
//      echo "<br />"; 
//      echo $cfdiComprobante['Sello']; 
//      echo "<br />"; 
//      echo $cfdiComprobante['Total']; 
//      echo "<br />"; 
//      echo $cfdiComprobante['SubTotal']; 
//      echo "<br />"; 
//      echo $cfdiComprobante['Certificado']; 
//      echo "<br />"; 
   //   echo $cfdiComprobante['FormaPago']; 
  //   echo "<br />";
   //   echo $cfdiComprobante['MetodoPago']; 
   //  echo "<br />";	
//      echo $cfdiComprobante['NoCertificado']; 
//      echo "<br />"; 
//      echo $cfdiComprobante['TipoDeComprobante']; 
//      echo "<br />"; 
} 
foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Emisor') as $Emisor){ 
   //echo $Emisor['Rfc']; 
//   echo "<br />"; 
//   echo $Emisor['Nombre']; 
//   echo "<br />"; 
} 
foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Emisor//cfdi:DomicilioFiscal') as $DomicilioFiscal){ 
//   echo $DomicilioFiscal['pais']; 
//   echo "<br />"; 
//   echo $DomicilioFiscal['calle']; 
//   echo "<br />"; 
//   echo $DomicilioFiscal['estado']; 
//   echo "<br />"; 
//   echo $DomicilioFiscal['colonia']; 
//   echo "<br />"; 
//   echo $DomicilioFiscal['municipio']; 
//   echo "<br />"; 
//   echo $DomicilioFiscal['noExterior']; 
//   echo "<br />"; 
//   echo $DomicilioFiscal['codigoPostal']; 
//   echo "<br />"; 
} 
foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Emisor//cfdi:ExpedidoEn') as $ExpedidoEn){ 
  // echo $ExpedidoEn['Pais']; 
//   echo "<br />"; 
//   echo $ExpedidoEn['Calle']; 
//   echo "<br />"; 
//   echo $ExpedidoEn['Estado']; 
//   echo "<br />"; 
//   echo $ExpedidoEn['Colonia']; 
//   echo "<br />"; 
//   echo $ExpedidoEn['NoExterior']; 
//   echo "<br />"; 
//   echo $ExpedidoEn['CodigoPostal']; 
//   echo "<br />"; 
} 
foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Receptor') as $Receptor){ 
  // echo $Receptor['Rfc']; 
//   echo "<br />"; 
//   echo $Receptor['Nombre']; 
//   echo "<br />"; 
} 
foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Receptor//cfdi:Domicilio') as $ReceptorDomicilio){ 
  // echo $ReceptorDomicilio['Pais']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['Calle']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['Estado']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['Colonia']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['Municipio']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['NoExterior']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['NoInterior']; 
//   echo "<br />"; 
//   echo $ReceptorDomicilio['CodigoPostal']; 
//   echo "<br />"; 
} 
foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto') as $Concepto){ 
 //  echo "<br />"; 
//   echo $Concepto['Unidad']; 
//   echo "<br />"; 
//   echo $Concepto['Importe']; 
//   echo "<br />"; 
//   echo $Concepto['Cantidad']; 
//   echo "<br />"; 
//   echo $Concepto['Descripcion']; 
//   echo "<br />"; 
//   echo $Concepto['ValorUnitario']; 
//   echo "<br />"; 
//   echo $Concepto['ClaveProdServ']; 
//   echo "<br />"; 
//   echo $Concepto['ClaveUnidad']; 
//   echo "<br />"; 
//  
//   echo "<br />"; 
}
//

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:CfdiRelacionados') as $Relacionadostipo){ 
	
$tiporelacion = $Relacionadostipo['TipoRelacion'];

}

foreach ($xml->xpath('//cfdi:Comprobante//cfdi:CfdiRelacionados//cfdi:CfdiRelacionado') as $Relacionados){ 
	
 $eluuid=$Relacionados['UUID'];

}
//echo $tiporelacion." tipo relacion<br>";
//echo $eluuid." eluuid<br>";


foreach ($xml->xpath('//cfdi:Comprobante//cfdi:Impuestos//cfdi:Traslados//cfdi:Traslado') as $Traslado){ 
//   echo $Traslado['Base']; 
//   echo "<br />";
//   echo $Traslado['Impuesto']; 
//   echo "<br />";
//   echo $Traslado['TipoFactor']; 
//   echo "<br />";	
//   echo $Traslado['TasaOCuota']; 
//   echo "<br />"; 
//   echo $Traslado['Importe']; 
//   echo "<br />"; 
//   echo "<br />"; 
} 


//ESTA ULTIMA PARTE ES LA QUE GENERABA EL ERROR
foreach ($xml->xpath('//t:TimbreFiscalDigital') as $tfd) {
//   echo $tfd['SelloCFD']; 
//   echo "<br />"; 
  // echo $tfd['FechaTimbrado']; 
//   echo "<br />"; 
  // echo $tfd['UUID']; 
//   echo "<br />"; 
//   echo $tfd['NoCertificadoSAT']; 
//   echo "<br />"; 
//   echo $tfd['version']; 
//   echo "<br />"; 
 //  echo $tfd['SelloSAT']; 
} 





 

//$_GET['folio']='1055-';
//echo "entre2";
$sql='select * from clientes where emisor = 1';
$emisor=celda($_SESSION['DB'],$sql);

$sql="select id_cliente from facturas where folio = '" . $_GET['folio'] ."'" ;
//echo $sql . "<br>";


$cli=dato("id_cliente",$_SESSION['DB'],$sql);
//echo $cli. "<br>";
$sql='select * from clientes where ID = ' . $cli ;
$cliente=celda($_SESSION['DB'],$sql);


$sql='select * from facturas where folio= "' . $_GET['folio'] .'"';
$factura=celda($_SESSION['DB'],$sql);

$sql='select * from metodospago where clave = "' . $cfdiComprobante['FormaPago'] .'"' ;
$metododepago=celda($_SESSION['DB'],$sql);
if ($metododepago == ''){
 $metododepago=	$cfdiComprobante['FormaPago'];
}
else
{
	$metododepago = $metododepago['clave'] . " " . $metododepago['descripcion'];
}


//$sql='select * from metodospago where clave = "' . $factura['METODODEPAGO'] .'"' ;
//$metododepago=celda($_SESSION['DB'],$sql);
if ($cfdiComprobante['MetodoPago'] == 'PUE'){
 $metododepago2= $cfdiComprobante['MetodoPago'] .	' - Pago en una sola exhibición';
}
else
{
	$metododepago2 = $cfdiComprobante['MetodoPago'] . ' - Pago en parcialidades o diferido';
}
//exit;

class PDF_MC_Table extends FPDF
{
var $widths;
var $aligns;

function SetWidths($w)
{
    //Set the array of column widths
    $this->widths=$w;
}

function SetAligns($a)
{
    //Set the array of column alignments
    $this->aligns=$a;
}

function Row($data)
{
    //Calculate the height of the row
    $nb=0;
    for($i=0;$i<count($data);$i++)
        $nb=max($nb,$this->NbLines($this->widths[$i],$data[$i]));
    $h=4*$nb;
    //Issue a page break first if needed
    $this->CheckPageBreak($h);
    //Draw the cells of the row
    for($i=0;$i<count($data);$i++)
    {
        $w=$this->widths[$i];
        $a=isset($this->aligns[$i]) ? $this->aligns[$i] : 'L';
        //Save the current position
        $x=$this->GetX();
        $y=$this->GetY();
        //Draw the border
        $this->Rect($x,$y,$w,$h);
        //Print the text
        $this->MultiCell($w,5,$data[$i],0,$a);
        //Put the position to the right of the cell
        $this->SetXY($x+$w,$y);
    }
    //Go to the next line
    $this->Ln($h);
}
function Row2($data)
{
    //Calculate the height of the row
    $nb=0;
    for($i=0;$i<count($data);$i++)
        $nb=max($nb, $this->NbLines($this->widths[$i], $data[$i]));
    $h=3*$nb;
    //Issue a page break first if needed
    $this->CheckPageBreak($h);
    //Draw the cells of the row
    for($i=0;$i<count($data);$i++)
    {
        $w=$this->widths[$i];
        $a=isset($this->aligns[$i]) ? $this->aligns[$i] : 'L';
        //Save the current position
        $x=$this->GetX();
        $y=$this->GetY();
        //Draw the border
        $this->Rect($x, $y, $w, $h);
        //Print the text
        $this->MultiCell($w, 2, $data[$i], 0, $a);
        //Put the position to the right of the cell
        $this->SetXY($x+$w, $y);
    }
    //Go to the next line
    $this->Ln($h);
}
function CheckPageBreak($h)
{
    //If the height h would cause an overflow, add a new page immediately
    if($this->GetY()+$h>$this->PageBreakTrigger)
        $this->AddPage($this->CurOrientation);
}

function NbLines($w,$txt)
{
    //Computes the number of lines a MultiCell of width w will take
    $cw=&$this->CurrentFont['cw'];
    if($w==0)
        $w=$this->w-$this->rMargin-$this->x;
    $wmax=($w-2*$this->cMargin)*1000/$this->FontSize;
    $s=str_replace("\r",'',$txt);
    $nb=strlen($s);
    if($nb>0 and $s[$nb-1]=="\n")
        $nb--;
    $sep=-1;
    $i=0;
    $j=0;
    $l=0;
    $nl=1;
    while($i<$nb)
    {
        $c=$s[$i];
        if($c=="\n")
        {
            $i++;
            $sep=-1;
            $j=$i;
            $l=0;
            $nl++;
            continue;
        }
        if($c==' ')
            $sep=$i;
        $l+=$cw[$c];
        if($l>$wmax)
        {
            if($sep==-1)
            {
                if($i==$j)
                    $i++;
            }
            else
                $i=$sep+1;
            $sep=-1;
            $j=$i;
            $l=0;
            $nl++;
        }
        else
            $i++;
    }
    return $nl;
}








function Header()

{

global $factura;
global $emisor;
global $cliente;
global $Emisor,$Receptor;

global $Relacionados,$Relacionadostipo;

 //Logo
//$this->Image('fpdf/logo_pb422.jpg',30,50,120,120,'','localhost/smcfacturas/mail.php');
   $this->Image('fpdf/logo_pb4.jpg',10,6,42,32,'','ticketfacturas.mx');
//$this->Image('imagenes/fondofactura.jpg',0,0,200,300,'','localhost/smcfacturas/mail.php');
    $this->SetFillColor(192,192,192);
    $this->SetTextColor(0);
    $this->SetDrawColor(128,0,0);
    $this->SetLineWidth(.3);
    $this->SetFont('Arial','B',10);
   $this->Cell(160);	
$this->Cell(0,5,'Version CFDI',1,1,'C',true);	
	    $this->SetFillColor(255,255,255,255);
   $this->Cell(160);	
$this->Cell(0,5,'4.0',1,1,'C',true);	
 
    $this->SetFillColor(192,192,192);
    $this->SetTextColor(0);
    $this->SetDrawColor(128,0,0);
    $this->SetLineWidth(.3);
    $this->SetFont('Arial','B',10);
   $this->Cell(160);

   $this->Cell(0,5,'Factura Serie No.',1,1,'C');
   $this->Cell(160);
  // $this->SetFont('Arial','',8); 
	 $this->SetFillColor(255,255,255,255);
	
   $this->SetFont('Arial','B',12);
   $this->Cell(0,10, $factura['FOLIO'],1,1,'C');
 $this->SetFont('Arial','B',8);
   $this->Cell(160);
   $this->Cell(0,10,'FECHA:  '. lafecha33($factura['FECHA']),1,1,'L');

//	   $this->Cell(120);
//   $this->Cell(0,10,$factura['SUCURSAL'],0,0,'L');

$this->Ln(10);
    //Movernos a la derecha


   $this->SetFont('Arial','',8);

  $this->Ln(-42);
 /*   $this->Cell(0,5,'','T',0,'L');

   $this->SetX(10);*/
//$this->AddFont('Roboto-Medium','','font/Roboto-Medium.php');

 //  $this->SetX(10);*/
//$this->AddFont('Roboto-Medium','','font/Roboto-Medium.php');
   $this->SetFont('Arial','B',12);
   $this->Cell(0,5,utf8_decode($emisor['nomcomercial']),'',1,'C');  
    $this->SetFont('Arial','',8);
   $this->Cell(0,4,utf8_decode($Emisor['Nombre']),'',1,'C');
   $this->Cell(0,4,"RFC:".$Emisor['Rfc'],'',1,'C');
   if ($emisor['noInterior']<>'.'){$interior = " Int. " . $emisor['noInterior'];}
   else{$interior ='';}
    
   $this->Cell(0,4,utf8_decode($emisor['CALLE']) ." No. ". $emisor['noExterior']. " " . $interior . "COL. " . $emisor['colonia'],'',1,'C');
      $this->Cell(0,4, "MUNICIPIO: " . $emisor['municipio'] ,'',1,'C');
   $this->Cell(0,4, " CP: ".$emisor['codigopostal'] . " " .$emisor['estado']. " " . strtoupper($emisor['pais']) ,'',1,'C');
      $this->Cell(0,4, " REGIMEN FISCAL: " . $Emisor['RegimenFiscal'],'',1,'C');
    $this->Cell(0,4,$emisor['correo'] ,'',1,'C');

 $this->SetFont('Arial','B',8);

  // $this->Ln(10);
    $this->Cell(0,3,"CLIENTE: ",'',1,'L'); 
  // $this->Ln(5);
   $this->Cell(0,3,"RFC: ",'',1,'L');
   $this->Cell(0,3,"DOM. FISCAL: ",'',1,'L');
    $this->Cell(0,3,"REGIMEN: ",'',1,'L');
 $this->Cell(0,3," " ,'',1,'L');


 $this->SetFont('times','',8);
   $this->Ln(-15);
     $this->Cell(20);
   $this->Cell(0,3,($cliente['NOMBRE']),'',1,'L');	
    $this->Cell(20);
   $this->Cell(0,3,$cliente['RFC'],'',1,'L');
    $this->Cell(20);
	   if ($cliente['noInterior']<>'.'){$interior = " Int. " . $cliente['noInterior'];}
   else{$interior ='';}
   //$this->Cell(0,3,utf8_decode($cliente['CALLE']) ." No. ". $cliente['noExterior']. $interior ." " . utf8_decode($cliente['COLONIA']) ,'',1,'L');
    $this->Cell(2);
   $this->Cell(0,3, trim($Receptor['DomicilioFiscalReceptor']) .' '. $cliente['CALLE']  ,'',1,'L');
    $this->Cell(20);

if($Receptor['RegimenFiscalReceptor']==601){$rf='REGIMEN General de Ley Personas Morales ';}    
    
    
  $this->Cell(0,3, $Receptor['RegimenFiscalReceptor']. '  ' . $rf ,'',1,'L');
   

    $this->Ln(0);
  $this->Cell(0,5,"Lugar de Expedicion: " ,'',1,'L');
    $this->Ln(-5);
	   $this->Cell(30);
  $this->Cell(0,5, "C.P. 68000 " . $factura['LUGAREXPEDICION']  ,'',1,'L');

    $this->Ln(-17);
	

	$sql='select * from usocfdi where CLAVE = "' .$Receptor['UsoCFDI'] .'"' ;
//	echo $sql;
$USOCFDI=celda($_SESSION['DB'],$sql);
//	echo "<BR><BR><BR><BR>".$USOCFDI['CVE'];
if ($USOCFDI['clave'] == ''){
 $USOCFDI=	$Receptor['UsoCFDI'];
}
else
{
	$USOCFDI = $Receptor['UsoCFDI'] . " " . $USOCFDI['descripcion'] ;
}
	
	
//	   $this->Cell(117);
//	$this->SetWidths(array(80));
//  $this->Row(array( "USO DEL CFDI: ".	$USOCFDI));
	
//echo  $Relacionadostipo['TipoRelacion']." DSDSD relacion<br>";
//echo $eluuid." eluuid<br>";
  $this->Ln(6);

	   $this->Cell(117);
if ( $Relacionadostipo['TipoRelacion'] == ''){
     $this->Cell(0,10,'SUCURSAL:  '. $factura['SUCURSAL'],0,0,'L');
}
else
{
  $this->Cell(0,10,'DOCUMENTO RELACIONADO (04) "Sustitucion de los cfdis previos "  UUID:'.  $Relacionados['UUID'],0,0,'L');    
 //$this->Cell(0,10,  $Relacionados['UUID'],0,0,'L'); 
}
  // 
    $this->Ln(10);
	

}




//Pie de página

function Footer()

{
global $tfd,$factura,$metododepago,$Receptor;
global $emisor;
global $Emisor;
global $cliente;

global $cfdiComprobante;
global $metododepago2;

    //Posición: a 1,5 cm del final

    $this->SetY(-160);


if( intval($factura['ISR']) > 0){

$this->Cell(130);
$this->Cell(100,5,'IMPORTE:',0,1,'L');
$this->Cell(130);
$this->Cell(100,5,'Traslados Tasa IVA 16% (+):',0,1,'L');
$this->Cell(130);
$this->Cell(100,5,'SUBTOTAL:',0,1,'L');
$this->Cell(130);
$this->Cell(100,5,'Traslados Tasa ISR 1.25%(-):',0,1,'L');
$this->Cell(130);
$this->Cell(100,5,'TOTAL:',0,1,'L');


$this->SetFont('Arial','B',8);
$this->Ln(-25);
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['TIMPORTE'],2,".",","),0,1,'R');
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['IVA'],2,".",","),0,1,'R');
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['SUBTOTAL'],2,".",","),0,1,'R');
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['ISR'],2,".",","),0,1,'R');
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['TOTAL'],2,".",","),0,1,'R');

}
else{
    
    
$this->Cell(130);
$this->Cell(100,5,'SUBTOTAL:',0,1,'L');
$this->Cell(130);
$this->Cell(100,5,'Traslados Tasa IVA 16%:',0,1,'L');
$this->Cell(130);
$this->Cell(100,5,'TOTAL:',0,1,'L');


 $this->SetFont('Arial','B',8);
$this->Ln(-15);
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['TIMPORTE'],2,".",","),0,1,'R');
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['IVA'],2,".",","),0,1,'R');
$this->Cell(150);
$this->Cell(0,5,"$ ".number_format($factura['TOTAL'],2,".",","),0,1,'R');


}

$decimales=explode('.',$factura['TOTAL']);
if($decimales[1]=='')
{
	$decimales="00";
}
else{
	$decimales=$decimales[1];
}

 $this->SetFont('Arial','B',8);

$this->Cell(100,5,strtoupper(num2letras(($factura['TOTAL']))). " PESOS " . $decimales ."/100 M.N.",0,1,'L');

$this->Cell(50,5,'FORMA DE PAGO  ' ,'TLR',1,'L');
$this->Ln(-5);
$this->Cell(50);
$this->Cell(50,5,'METODO DE PAGO','TLR',1,'L');
$this->Ln(-5);
$this->Cell(100);
$this->Cell(30,5,'NUMERO CUENTA','TLR',1,'L');
$this->Ln(-5);
$this->Cell(130);
$this->Cell(66,5,'USO DE CFDI','TLR',1,'L');

  // $this->Cell(130);. $factura['FORMADEPAGO']
	//$this->SetWidths(array(66));
  //$this->Row(array($Emisor['RegimenFiscal']. " - ". $emisor['regimen']));
//echo $metododepago['descripcion'];
//echo $metododepago['clave'];
//exit;




	$sql='select * from usocfdi where CLAVE = "' .$Receptor['UsoCFDI'] .'"' ;
//	echo $sql;
$USOCFDI=celda($_SESSION['DB'],$sql);
//	echo "<BR><BR><BR><BR>".$USOCFDI['CVE'];
if ($USOCFDI['clave'] == ''){
 $USOCFDI=	$Receptor['UsoCFDI'];
}
else
{
	$USOCFDI = $Receptor['UsoCFDI'] . " " . $USOCFDI['descripcion'] ;
}
	

 $this->SetFont(''); 
$this->Cell(50,5,$metododepago,'BLR',1,'L');
$this->Ln(-5);
$this->Cell(50);
$this->Cell(50,5,utf8_decode($metododepago2),'BLR',1,'L');
$this->Ln(-5);
$this->Cell(100);
$this->Cell(30,5,$cfdiComprobante['NumCtaPago'],'BLR',1,'L');
$this->Ln(-5);
$this->Cell(130);
$this->Cell(66,5, $USOCFDI ,'BLR',1,'L');

    //$this->Ln();
    $this->SetFillColor(192,192,192);
    $this->SetTextColor(0);
    $this->SetDrawColor(128,0,0);
    $this->SetLineWidth(.3);
    $this->SetFont('Arial','B',10);
$this->Cell(0,10,'ESTO ES UNA REPRESENTACION IMPRESA DE UN CFDI VER. 4.0',1,1,'C',true);
//$this->Ln();
$this->Cell(60,5,'serie del centificado del emisor:',0,1,'R');
$this->Cell(60,5,'FOLIO FISCAL',0,1,'R');
$this->Cell(60,5,'No de serie del certificado del SAT',0,1,'R');
$this->Cell(60,5,'FECHA Y HORA DE CERTIFICACION:',0,1,'R');
$this->Ln(-20);
$this->Cell(60);
$this->Cell(90,5,$cfdiComprobante['NoCertificado'],'TLR',1,'L');
$this->Cell(60);
$this->Cell(90,5,$tfd['UUID'],'TLR',1,'L');
$this->Cell(60);
$this->Cell(90,5,$tfd['NoCertificadoSAT'],'TLR',1,'L');
$this->Cell(60);
$this->Cell(90,5,$tfd['FechaTimbrado'],'1',1,'L');


//$nombre_fichero = ($factura['FOLIO']."Qr.png");
////
//if (file_exists($nombre_fichero)) {
//    //echo "El fichero $nombre_fichero existe";
//} else {


require_once('phpqrcode/qrlib.php');
// El nombre del fichero que se generará (una imagen PNG).
$file = $factura['FOLIO']."Qr.png";
$pasoimporte= explode('.',$factura['TOTAL']);
$entero=$pasoimporte[0];
$fraccion=$pasoimporte[1];
$enterolleno=str_pad($entero,10,"0",STR_PAD_LEFT);
$fraccionlleno=str_pad($fraccion,6,'0');
// Los datos del CFDI que llevará (Revisar anexo 20 para los detalles del texto del codigo QR).
$data = '?re='. $Emisor['Rfc'].'&rr='.$cliente['rfc'].'&tt='.$enterolleno.'.'.$fraccionlleno.'&id='.$factura['UUID'];
 
// Y generamos la imagen (Revisar el Anexo 20 para verificar los detalles del archivo de imagen).
QRcode::png($data, $file,4,3);

//}


 $this->Image(($factura['FOLIO']."Qr.png"),160,200,40);

 
 $this->SetFont('Arial','',8);
$this->Cell(120,5,'sello digital del CFDI',0,1,'');

  $this->SetFont('Arial','',5);
$this->SetWidths(array(150));
$this->Row2(array($tfd['SelloCFD'] ));

 $this->SetFont('Arial','',8);
$this->Cell(120,5,'sello del SAT',0,1,'');

  $this->SetFont('Arial','',5);
$this->SetWidths(array(150));
$this->Row2(array($tfd['SelloSAT']));

 $this->SetFont('Arial','',8);
$this->Cell(130,5,'cadena original del complemento de certificacion digital del SAT ',0,1,'');
  $this->SetFont('Arial','',5);
$this->SetWidths(array(150));
$this->Row2(array(substr($cfdiComprobante['Certificado'],0,500)));
//strlen($factura['certificado'])mmmm   .substr($factura['certificado'],901, 20 )
//substr($factura['certificado'],1,200)$factura['certificado']

 $this->SetFont('Arial','B',9);
   $this->Cell(0,10,'Pagina '.$this->PageNo().' de {nb}',0,0,'R');

 $this->SetFont('courier','B',8);
$this->Ln(-10);
 $this->Cell(153);
 $this->Cell(20,5,'FACTURA EMITIDA POR',0,1,'L');
  $this->Cell(153);
 $this->Cell(20,5,'ticketfacturas.com',0,1,'L');
}





}
?>