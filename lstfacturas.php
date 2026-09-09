<?php require_once('frmencabezado40.php'); 
require_once('plugin/lasclases.php');
?>

<script>

function SumarColumna(grilla, columna) {
 
    var resultVal = 0.0; 
         
    $("#" + grilla + " tbody tr").not(':last').each(
        function() {
         
            var celdaValor = $(this).find('td:eq(' + columna + ') div');
			
			var currency = celdaValor.html();
			var number = Number(currency.replace(/[^0-9\.-]+/g,""));
            //alert(number);
            if (celdaValor.html() !== null)
                   { resultVal += number;}
                     
        } //function
         
    ); //each
    
    $("#" + grilla + " tbody tr:last td:eq(" + columna + ")").html(resultVal.toFixed(2).toString().replace(',','.'));   
     return resultVal;
} 	
	
$( document ).ready(function() {

	//SumarColumna('tablaclase',10);	
//	$('#TOTAL').val(SumarColumna('tablaclase',9));	
//
//	$('#IVA').val(SumarColumna('tablaclase',8));
//	$('#SUBTOTAL').val(SumarColumna('tablaclase',7));	
//	//SumarColumna('tablaclase',5);
//	//tbody tr:last 
//	
//	$('#pieVALORUNITARIO').html('<strong>TOTALES:</strong>');
//	$('#pieVALORUNITARIO').parent().parent().css('background','mediumturquoise');
	//$('#th').parent().parent().css('background','mediumturquoise');
	
 $('tr#ttt')
	   .on('click',function(){
				 //param="id="+ $(this).attr('class');
				 printfactura($(this).attr('class'));
				//var dataString = $('#formulario').serialize();
//				$.ajax({
//					type: "GET",
//					url: "printfactura.php",
//					data: param,
//						beforeSend: function () {
//								$("#conceptos").html("Procesando, espere por favor...");
//						},
//						success:  function(result){
//									$("#conceptos").html(result);
//							}
//				});	



		 });
});
	
</script>	





<body>
<span class="pedido">FACTURAS</span>
<br>

<?php


$sql='SELECT `ID_FACTURA`,`ID_FACTURA`,
`ID_CLIENTE`,
`FOLIO`,
`FECHA`,
TIMPORTE,
`IVA`,
`SUBTOTAL`,
ISR,
`TOTAL`,
XML,
estado
FROM facturas
';
//echo "elfiltro1: ".$_GET['filtro1'];
//echo "elfiltro2: ".$_GET['filtro2'];
//echo "tipo:".$_GET['tipo'];
//if($_GET['tipo']!='undefined')
//`SERIE`,
//`TASAIVA`,
//`FORMADEPAGO`,
//`METODODEPAGO`,
//`MONEDA`,
//`TIPODECOMPROBANTE`,
//`LUGAREXPEDICION`,
//`REGIMEN`,
//`TOTALIMPUESTOST`,
//`IMPUESTO`,
//`TASA`,
//`IMPORTE`
if(!empty($_GET['tipo']))
{
	if($_GET['tipo']=='LIKE')
	{$sql= $sql. " where " .$_GET['campo'] ." " . $_GET['tipo'] . "'%" .$_GET['valor'] . "%'";}
	else
	{$sql= $sql. " where " .$_GET['campo'] ." " . $_GET['tipo'] . $_GET['valor'] ;}
}
$sql = $sql . " order by ID_FACTURA desc";

//echo $sql;

$cols='`ID`,
`ID`,
`ID_CLIENTE`,
`FOLIO`,
`FECHA`,
IMPORTE,
`IVA`,
`SUBTOTAL`,
ISR,
`TOTAL`,
XML,
ESTADO
';
$controles='idsel,idprev,texto,texto,texto,moneda,moneda,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto';
$funciones=',printfactura,,,,,,,,,,,,,,,,,,';
$estilos='idsel,idsel,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,botonvrojo,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto';

tablav15($cols,$sql,"FACTURAS",$controles,$funciones,$estilos);




?>

</body>
</html>

