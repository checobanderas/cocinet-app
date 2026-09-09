<?php require_once('frmencabezado.php');?>



<script>
	
$( document ).ready(function() {
	
$("#tablaclase tr:first-child > th").css("background-color", "#ccc");	
//alert('inilstclientes');
$('tr#ttt')
	   .on('click',function(){
				 param="id="+ $(this).attr('class');
				 //alert(param);
				//var dataString = $('#formulario').serialize();
                printfactura($(this).attr('class'));


		 });
	
	
$('table').decapitate();
	
	exit;

	
//////
//	
//var table = $('#tablaclase'),
//    thead = table.find('thead'),
//    
//    fixed_thead,
//    fixed_table = $('<table />', {
//      'cellpadding': 5,
//      'cellspacing': 0,
//      'border': 1,
//      'id': 'tablaclase'
//    }),
//    
//    fixed_table_wrapper = $('<div />', {
//      'height': 400,
//      'css': {
//        'overflow': 'auto'
//      }
//    });
//    
//table.before(fixed_table);
//
////thead.find('th').each(function() {
////  $(this).css('width', $(this).width());
////});
////$('#columna2').css('width', 675);
////	
//	
//	var columna = 0;
//$("#tablaclase tr:first-child > td").each(function() {
//	
//	var ancho= $(this).width();
//	alert(ancho);
//	
//
//		alert(columna);
//	
//	$( "th:eq(" + columna + ")").css('width', ancho);
//
//
//		columna=columna+1;
//});	
//	
//	
//	
//fixed_thead = thead.clone();
//fixed_table.append(fixed_thead);
//
//thead.hide();
//
//table.wrap(fixed_table_wrapper);

// align the new table header with the original table
//fixed_table.css('left', (fixed_table.offset().left - table.offset().left) * -1);	
////////
	
	
	
// http://obvcode.blogspot.com/2007/11/easiest-way-to-check-ie-version-with.html
	
//var Browser = {
//  version: function() {
//    var version = 999; // we assume a sane browser
//    if (navigator.appVersion.indexOf("MSIE") != -1) {
//      // bah, IE again, lets downgrade version number
//      version = parseFloat(navigator.appVersion.split("MSIE")[1]);
//    }

//    return version;
//  }
//};
//
//var table = $('#tablaclase'),
//    thead = table.find('thead'),
//    fixed_thead,
//
//    the_window = $(window),
//
//    tr_1, tr_2, did_scroll = false;
//
//thead.find('td').each(function() {
//  $(this).css('width', $(this).width());
//});
//
//fixed_thead = thead.clone();
//
//thead.after(fixed_thead);
//
//if( Browser.version() < 8 ) {
//  fixed_thead.find('tr').css({
//    'position': 'absolute',
//    'top': 0
//  });
//
//  tr_1 = fixed_thead.find('tr:first');
//  tr_2 = fixed_thead.find('tr:last').css('margin-top', tr_1.height());
//}else {
//  fixed_thead.css({
//    'position': 'fixed',
//    'top': 0,
//    'width': table.width()
//  });
//}
//
//fixed_thead.hide();
//
//the_window.scroll(function() {
//  if( the_window.scrollTop() >= table.offset().top ) {
//    fixed_thead.show();
//
//    if( Browser.version() < 8 ) {
//      did_scroll = true;
//    }
//  }else {
//    fixed_thead.hide();
//  }
//
//  if( the_window.scrollTop() > (table.offset().top + table.height()) - fixed_thead.height() ) {
//    fixed_thead.hide();
//  }
//});
//
//setInterval(function() {
//  if( did_scroll ) {
//    did_scroll = false;
//    tr_1.css('top', the_window.scrollTop());
//    tr_2.css('top', the_window.scrollTop());
//  }
//}, 250);
	
	
});
</script>	

</head>

<body>
<?php


$sql='SELECT `ID_FACTURA`,`ID_FACTURA`,
`nombre`,
`FOLIO`,
`FECHA`,
IMPORTE,
`IVA`,
`SUBTOTAL`,
ISR,
`TOTAL`,
UUID,
F.estado
FROM facturas F INNER JOIN clientes C ON F.ID_CLIENTE = C.ID_CLIENTE
';

if(!empty($_GET['tipo']))
{
	if($_GET['tipo']=='LIKE')
	{$sql= $sql. " where " .$_GET['campo'] ." " . $_GET['tipo'] . "'%" .$_GET['valor'] . "%'";}
	else
	{$sql= $sql. " where " .$_GET['campo'] ." " . $_GET['tipo'] . $_GET['valor'] ;}
}
$sql = $sql . " order by ID_FACTURA desc";

//echo $sql;

$cols='ID,ID,NOMBRE,FOLIO,FECHA,SUBTOTAL,IVA,TOTAL,UUID,ESTADO';
$controles='texto,texto,texto,texto,texto,moneda,moneda,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto,texto';
$funciones=',printfactura,,,,,,,,,,,,,,,,,,';
$estilos='celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,botonvrojo,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto,celdatexto';
$pie='0,0,0,0,0,0,0,0,0,0,0,0';//2 es $pie='0,2,0,0,0,0,0,0,3,0,0,0,0';
tablav15($cols,$sql,"FACTURAS",$controles,$funciones,$estilos,$pie);

?>
</body>
</html>

