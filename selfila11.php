
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    
<?php 

//require_once('frmencabezado.php');
$_GET['tabla']='clientes';
//echo 'rrr' . $_GET['RUTA'];
//$_GET['RUTA']='Oaxaca 2 Costa'; ?>

<style type="text/css">

table.dataTable thead th {
    position: relative;
    background-image: none !important;

}
 
table.dataTable thead th.sorting:after,
table.dataTable thead th.sorting_asc:after,
table.dataTable thead th.sorting_desc:after {
    position: absolute;
    top: 12px;
    right: 8px;
    display: block;
    font-family: FontAwesome;
}


tr.odd:nth-child(3) > td:nth-child(3)
{
     
  font-family: 'Nunito';


}

td:nth-child(1) {

cursor:   pointer;
background-color: #435ebe !important;
color:white;
font-weight: bolder;

}
	
   table tr td { 

 /*font-size: 12px;*/
 font-size: 12.5px;
   font-family: 'Nunito';
    }
}

table tbody tr td{


  font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Helvetica, Arial, sans-serif;   
}

/*    div.dataTables_wrapper {
        width: 100vw;
        margin: 0 auto;
    }
*/
table.dataTable td.focus {
        outline: 1px solid #ac1212;
        outline-offset: -3px;
        background-color: #f8e6e6 !important;
    }


div.row:nth-child(1)
{
 margin-top:-63px !important;
 margin-right:200px !important;
 text-align: center !important; 
}


body{
font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
font-size: 14px;
line-height: 1.428571429;
color: #333;


}



div.row:nth-child(3) {

  display: none;

}


/*.dataTables_scrollBody{
margin-left: -25px !important;
}*/


table#example.dataTable tbody tr:hover {
  background-color: #ffa;
   cursor: pointer;
}
/* 
table#example.dataTable tbody tr:hover > .sorting_1 {
  background-color: #ffa;
   cursor: pointer;
}*/

</style>



<script src="https://code.jquery.com/jquery-3.5.1.js"></script>
<script src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/fixedcolumns/3.3.2/js/dataTables.fixedColumns.min.js"></script>
<script src="https://cdn.datatables.net/keytable/2.6.1/js/dataTables.keyTable.min.js"></script>
<script src="https://cdn.datatables.net/rowreorder/1.2.8/js/dataTables.rowReorder.min.js"></script>
<script src="https://cdn.datatables.net/1.10.25/js/dataTables.bootstrap5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossorigin="anonymous"></script>


<script src="plugin/funciones.js"></script>

    <link rel="stylesheet" href="assets/vendors/sweetalert2/sweetalert2.min.css">

  <script src="//cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
 

<!-- <script src="https://cdn.datatables.net/1.10.24/js/dataTables.material.min.js"></script>

<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/material-components-web/4.0.0/material-components-web.min.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.24/css/dataTables.material.min.css"> -->

<link href="https://cdn.datatables.net/1.10.24/css/jquery.dataTables.min.css" rel="stylesheet">
<link href="https://cdn.datatables.net/fixedcolumns/3.3.2/css/fixedColumns.dataTables.min.css" rel="stylesheet">
<link href="https://cdn.datatables.net/keytable/2.6.1/css/keyTable.dataTables.min.css"  rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.1/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous">


            <!-- All Jquery -->

    
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>




<!-- 
<div class="modal-dialog modal-xl">...</div>
<div class="modal-dialog modal-lg">...</div>
<div class="modal-dialog modal-sm">...</div>







<div class="modal modal-fullscreen fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
<iframe class="card" src="frmnewregistro.php?tabla=clientes" width="100%" height="700vh" style="border:none;margin-top: 80px; width: 90vw;" allowfullscreen=true></iframe>

     <div class="modal-header">
        <h5 class="modal-title" id="exampleModalToggleLabel">Modal 1</h5>
       
      </div>
      <div class="modal-body">
        Show a second modal and hide this one with the button below.
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" data-bs-target="#exampleModalToggle2" data-bs-toggle="modal" data-bs-dismiss="modal">Open second modal</button>
      </div>




      
    </div>
 -->




  </div>
</div>
<div class="modal fade" id="exampleModalToggle2" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalToggleLabel2">Modal 2</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Hide this modal and show the first with the button below.
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" data-bs-target="#exampleModalToggle" data-bs-toggle="modal" data-bs-dismiss="modal">Back to first</button>
      </div>
    </div>
  </div>
</div>



<div id="CONTENIDOPRINCIPAL">

<!-- &nbsp&nbsp&nbsp&nbsp&nbsp -->
<h2 class="row border border-primary rounded-top text-center text-primary"> <strong style="top:-20px;text-align: left;" >   &nbsp&nbsp  LISTA DE <?php  echo strtoupper($_GET["tabla"].' ' .$_GET["RUTA"]);?> <span class="badge"> <?php echo '   ' . $celda["NOMBRE"]; ?> </span> </strong> </h2>  

<button onclick="parent.location.reload ();" class='btn btn-dark btn-outline btn-rounded m-b-10 m-l-5 form-control' style="
    line-height: 12px;
    width: auto;
    font-size: 8pt;
    font-family: tahoma;
    margin-top: 1px;
    margin-right: 2px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 200;
"  ><i class='ti-close'></i> Cerrar</button>




 <button onclick="mostrar('frmnewregistro.php','tabla=clientes','#CONTENIDOPRINCIPAL');" class='btn btn-secondary btn-rounded m-b-10 m-l-5' style="
    line-height: 12px;
    width: auto;
    font-size: 8pt;
    font-family: tahoma;
    margin-top: 1px;
    margin-right: 62px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 200;
"   ><i class='ti-close'></i> Agregar</button>
 
<!-- <a class="btn btn-secondary btn-rounded m-b-10 m-l-5" style="
    line-height: 12px;
    width: auto;
    font-size: 8pt;
    font-family: tahoma;
    margin-top: 1px;
    margin-right: 2px;
    position: absolute;
    top: 0;
    right: 0;
" data-bs-toggle="modal" href="#exampleModalToggle" role="button">Agregar</a> -->


<table id="example" class="display stripe row-border order-column" width="95%" tabindex="0">
        <thead>
            <tr>

<?php 


require_once('plugin/lasclases.php');
$_SESSION["IDUSER"]=$_GET["IDUSER"];

$link=conectarse($_SESSION['DB']);

$_GET['tabla']='clientes';
$sqry="describe " . $_GET['tabla'];

$campos = array();
$iqry=mysql_query($sqry,$link);
$i=0;
$j=mysql_num_rows($iqry);
while ($i<$j) {

array_push($campos, mysql_result($iqry,$i,0));

//echo "<option value='".mysql_result($iqry,$i,0)."'>".mysql_result($iqry,$i,0)."</option>";
$i++;
}
//$campos=array("ID","NUMERO","SUCURSAL");  
$campos=array("ID","RFC","NOMBRE","DOMFISCAL","REGIMEN");
$tipos = array("text","text","text","text","text","text","text","text","text","text","text",);  
$listas = array("","","","","","","","","",""); 
$defaultvalores = array("","","","","","","","","","");     
$valores = array($fila[$campos[0]],$fila[$campos[1]],$fila[$campos[2]],$fila[$campos[3]],$fila[$campos[4]],$fila[$campos[5]]);   
    
for($i=0;$i <= count($campos)-1;$i++)
{ 
  ?>

               <th style="text-align: left;"><?php  echo $campos[$i]; ?></th>
<?php
}


 ?>
 
            </tr>
        </thead>


    
    <?php 




$_GET['id'] =  2;
	//echo;
$sql="select ID,RFC,NOMBRE,DOMFISCAL,REGIMEN from " . $_GET['tabla'] . ' where emisor <> "1"  ORDER BY ID DESC';
//$sql="select * from " . $_GET['tabla'];
//$sql =$sql .' where ruta = "'. $_GET['RUTA'] . '"' ;



$link = conectarse($_SESSION['DB']);
 $eldato=mysql_query($sql,$link);
 if(mysql_errno()!=0){echo mysql_errno().": ".mysql_error(). " Enviar al administrador del sistema este mensaje de  error: " .  $sql ."<BR>";};
 $nreg = mysql_num_rows($eldato);

    
  if(mysql_num_rows($eldato)>0)
  {
    $cols=explode(',',$cols);
    $funciones=explode('-',$funciones);
    $estilos=explode(',',$estilos);
    $estilosenc=explode(',',$estilosenc);
    $controles=explode(',',$controles);
                      
      
      
$lafila= 0;   
echo '  <tbody style="max-height: 90vh !important;"> ';     
    while($fila=mysql_fetch_array($eldato)){
                       // echo  $fila[$funciones[2]]. "<br>";   
   // echo ' <tr> ' ;
        echo ' <tr  id="ttt" class="'.$fila[0]  .'" > ' ;
       $NCOL=count($campos);
       $lafila = $lafila +1 ;
        //echo " <th id='pie". str_replace(' ', '', $cols[$j]) ."' > ";
       for($j=0;$j<$NCOL;$j++){
        echo ' <td> ';             
        //echo celda4($controles[$j],$cols[$j].$j,$j,$fila[$j],$estilos[$j],$funciones[$j], $lafila); 
        echo $fila[$j]  ;

        echo " </td> "; 
            
      }
    echo " </tr> ";     
       
    }
       

 echo "</tbody>";
    

  } //ESTE CORCHETE CIERRA SI NO TIENE REGISTRIOS LA TABLA
  else{echo ' <div class="jumbotron">
  <h1>La consulta no tiene registros</h1>      
 
</div>';}


     ?>

    <?php //die(); ?>

        <tfoot>
            <tr>

<?php 


require_once('plugin/lasclases.php');

$link=conectarse($_SESSION['DB']);

$_GET['tabla']='clientes';
$sqry="describe " . $_GET['tabla'];

$campos = array();
$iqry=mysql_query($sqry,$link);
$i=0;
$j=mysql_num_rows($iqry);
while ($i<$j) {

array_push($campos, mysql_result($iqry,$i,0));

//echo "<option value='".mysql_result($iqry,$i,0)."'>".mysql_result($iqry,$i,0)."</option>";
$i++;
}


$campos=array("ID","RFC","NOMBRE","CP","REGIMEN");
$campos=array("ID","*","*","*","*");
$tipos = array("text","text","text","text","text","text","text","text","text","text","text",);  
$listas = array("","","","","","","","","",""); 
$defaultvalores = array("","","","","","","","","","");     
$valores = array($fila[$campos[0]],$fila[$campos[1]],$fila[$campos[2]],$fila[$campos[3]],$fila[$campos[4]],$fila[$campos[5]]);   
    
for($i=0;$i <= count($campos)-1;$i++)
{ 
  ?>

               <th class="text-left" style="text-align: left;"><?php  echo $campos[$i]; ?></th>
<?php
}


 ?>
 
            </tr>
        </tfoot>





    </table>
</div>





<input type="hidden" id="ID_CLIENTE" name="ID_CLIENTE" value='<?php  echo htmlspecialchars($_COOKIE["ID_CLIENTE"]);?>'></input>

<input type="hidden" id="SELDIRECCION" name="SELDIRECCION" value='<?php  echo htmlspecialchars($_COOKIE["SELDIRECCION"]);?>'></input>




    <script src="assets/js/extensions/sweetalert2.js"></script>
    <script src="assets/vendors/sweetalert2/sweetalert2.all.min.js"></script>


    <!--Custom JavaScript -->
    <script src="../js/scripts.js"></script>





</body>





</html>

<script type="text/javascript">


//$('#example').append('<caption style="caption-side: bottom"> <h1 class="bg-info">   LISTA DE <?php  echo strtoupper($_GET["tabla"].' ' .$_GET["RUTA"]);?> <span class="badge"> <?php echo '   ' . $celda["NOMBRE"]; ?> </span> </h1>   </caption>');

	//var events = $('#events');
    var table =  $('#example').DataTable( {
        scrollY:        "70vh",
        scrollX:        true,
        scrollCollapse: true,
        paging:         false,
        fixedColumns:   {
            leftColumns: 0
        },
         "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json"
    },
  keys: true,
    "autoWidth": true,
            buttons: [
        'copy', 'excel', 'pdf'
    ],select: true,
    "focus": [ 0, 0 ],
    rowReorder: {
            selector: 'td:nth-child(0)'
        },
        responsive: true,
        fixedHeader: true,
                fixedColumns:   {
            left: 3
        }

    } );


table
    .columns( '.ID' )
    .order( 'desc' )
    .draw();

 table.cell( ':eq(2)' ).focus();

 table.cell( ':eq(2)' ).focus();

 table.cell( ':eq(2)' ).focus();


//table.reload( function () {
  
//} );


function mostrar(url,param,div){
	//alert(div);
//alert(param);
//	alert(url);
	$.ajax({
		type: "GET",
		url: url,
		data: param,
			beforeSend: function () {
					$('*').find($(div)).html("Procesando, espere por favor...");
			},
			success:  function(result){
						
						$('*').find($(div)).html(result).fadeIn( "slow" );;

				}
	});	

}


    $(document).keyup(function(event){


//alert(event.which);
var tecla =event.which ;


switch (tecla) { 


   case 113: 


//alert(tecla);
param="totalventa=" + parseFloat($('#pie3TOTAL').html()) + "&txtsaldoa=" +  $('#txtsaldoa').val() + "&txtfolioa=" +  $('#txtfolioa').val() + "&id=" + $('#ID_CLIENTE').val() +"&ID_VENDEDOR="+$('#ID_VENDEDOR').val()+"&ID_RUTA="+$('#ID_RUTA').val()+"&TPAGO="+parseFloat($('#pie3TOTAL').html());
//alert(param);
 mostrar('lstordendecompra.php',param,'#frmcobro');
   $('#botonmodal').click() ;

//  swal({
//     title: "Sweet !!",
//     text: "<span style='color:#ff0000'>Hey, you are using HTML !!<span>",
//     html: true
//   });

// //  ,
//  swal({
//       title: "CAPTURA EL PAGO !!",
//       type: "input",
//       showCancelButton: true,
//       closeOnConfirm: false,
//       animation: "slide-from-top",
//       inputPlaceholder: "AQUI PON EL PAGO",
//       inputValue: parseFloat($('#pie3TOTAL').html()),
//   text:parseFloat($('#pie3TOTAL').html())
//     },
//     function(inputValue) {

//      //inputValue.select(); 
//       if (inputValue === false) return false;
//       if (inputValue === "") {
//         swal.showInputError("Necesitas poner una cantidad!");
//         return false
//       }
//       else{
//             //$('#txtns').val();
//             if(inputValue >= parseFloat($('#pie3TOTAL').html()) ){


//          //$('#celda11').val($('#txtns').val());
//          //swal("PAGO !!",{text: "<span style='color:#ff0000'>Hey, you are using HTML !!<span>"} , " PAGO :" + inputValue + "TOTAL A COBRAR: "+ parseFloat($('#pie3TOTAL').html())+ " " + "CAMBIO: "+ (inputValue -parseFloat($('#pie3TOTAL').html()) ), "success");

// swal("PAGO DE CONTADO !!", " PAGO :" + inputValue + " <br> " + "TOTAL A COBRAR: "+ parseFloat($('#pie3TOTAL').html())+ "CAMBIO= " + (inputValue -parseFloat($('#pie3TOTAL').html())), "success");
// param="totalventa=" + parseFloat($('#pie3TOTAL').html()) + "&txtsaldoa=" +  $('#txtsaldoa').val() + "&txtfolioa=" +  $('#txtfolioa').val() + "&id=" + $('#ID_CLIENTE').val() +"&ID_VENDEDOR="+$('#ID_VENDEDOR').val()+"&ID_RUTA="+$('#ID_RUTA').val()+"&TPAGO="+parseFloat($('#pie3TOTAL').html());
// alert(param);
//  mostrar('lstpagoventas.php',param,'#frmcobro');
//     $('#botonmodal').click() ;
  
//             }
//             else{

//              swal("CREDITO !!", " PAGO :" + inputValue + "  TOTAL CREDITO: "+ parseFloat($('#pie3TOTAL').html()) , "success");
//                   param="totalventa=" + parseFloat($('#pie3TOTAL').html()) + "&txtsaldoa=" +  $('#txtsaldoa').val() + "&txtfolioa=" +  $('#txtfolioa').val() + "&id=" + $('#ID_CLIENTE').val() +"&ID_VENDEDOR="+$('#ID_VENDEDOR').val()+"&ID_RUTA="+$('#ID_RUTA').val()+"&TPAGO="+inputValue;     
//                   alert(param);        
//              mostrar('lstpagoventas.php',param,'#frmcobro');
//                 $('#botonmodal').click() ;

//             }  
//       }
//        //swal("Hey !!", "You wrote: " + inputValue, "success");
//     });

 


  

    
  
  



  //$('#celda11').focus();
  // window.top.close();
    break;
    case 27:

       $('#example_filter > label:nth-child(1) > input:nth-child(1)').focus(); 

       $('#example_filter > label:nth-child(1) > input:nth-child(1)').select(); 


 table.cell( ':eq(2)' ).focus();

// table.cell( ':eq(2)' ).focus();

    //  alert($("tr td:eq(1)").val());
    break;

    case 13:

//alert($('html body div#example_wrapper.dataTables_wrapper div.DTFC_ScrollWrapper div.dataTables_scroll div.dataTables_scrollBody table#example.display.stripe.row-border.order-column.dataTable tbody tr td.focus').parent().closest("tr").find("> td:first-child").html());

    var celdaclick = $('html body div#example_wrapper.dataTables_wrapper div.DTFC_ScrollWrapper div.dataTables_scroll div.dataTables_scrollBody table#example.display.stripe.row-border.order-column.dataTable tbody tr td.focus').parent().closest("tr").find("> td:first-child").html();

let str = celdaclick;
   // Returns 12

alert(str.length);

if(str.length>555555555){
     //param="id="+ celdaclick+"&tabla=clientes";
     param='mesa='+celdaclick;
 var ventanaDestino = window.open("opciones3.php?"+param);

     //mostrar('frmmodregistro.php',param,'#CONTENIDOPRINCIPAL'); 
    // var ventanaDestino

}
else{
 param="id="+ celdaclick+"&tabla=clientes";
     mostrar('frmmodregistro.php',param,'#CONTENIDOPRINCIPAL'); 

}
  

 //alert('DIO ENTER ');
    //var rowData = table.rows( indexes ).data().toArray();
         //   alert(cell.data());
   

//$("#tblComponents").cell(':eq(0)', 0).focus();
    //     if ($('input').is( ":focus" )) {
            //alert('dentro de buscar');
       //alert( table.cell().html()); 
 
    //}
         
    break;
   case 118: 
   window.open("lstclientes2.php");  

  //   var vta = null; vta=window.open('../lstproductos2.php','_blank');
  //   window.parent.location.reload();
     break;    

     
  case 'dojo': 
    alert('dojo Wins!');
    break;
  default:
   // alert('Nobody Wins!');
}




    });  

 table.cell( ':eq(2)' ).focus();


$('#BTGUARDAR').on('click',function(){
    // alert('sssss');
    table.cell( ':eq(2)' ).focus();
                  
});

$('#example tbody').on('click', 'td:first-child', function () {
 
    var table = $('#example').DataTable();
 
  // alert( table.cell( this ).data() );

let str = table.cell( this ).data();
   // Returns 12

//alert(str.length);
if(str.length>333333333){
     //param="id="+ celdaclick+"&tabla=clientes";






      setTimeout(function() {
	
var param2 = $('#formulario').serialize();
var ventanaDestino = window.open("selcliente.php?"+param2);

       // swal("Modificado", " El registro ha sido Modificado !!");
      }, 500);


      setTimeout(function() {
param='mesa='+ table.cell( this ).data();
 var ventanaDestino = window.open("opciones3.php?"+param);

       // swal("Modificado", " El registro ha sido Modificado !!");
      }, 2000);



     //mostrar('frmmodregistro.php',param,'#CONTENIDOPRINCIPAL'); 
    // var ventanaDestino

}
else{

 param="id="+ table.cell( this ).data() +"&tabla=clientes";
  //if(parseInt(table.cell( this ).data().val)>0)
 // {
     mostrar('frmmodregistro.php',param,'#CONTENIDOPRINCIPAL'); 
  //}

}

//mostrar('opciones2.php',param,'div#CONTENIDOPRINCIPAL');

});
// table.on( 'draw', function () {
// 	table.row(':eq(0)' ).focus();
//     table.cell( ':eq(2)' ).focus();


// } );

parent.document.title='FACTURA Net(Cfdi 4.0) CLIENTES';




// A $( document ).ready() block.
$( document ).ready(function() {
    $('div.row:nth-child(1)').css('margin-top','-50px !important');

$('tr#ttt').on('click',function(){
         param="ID="+ parseInt( $(this).attr('class'));
         //alert(param);
        

      //  alert('cc de fila');

             setTimeout(function() {
            //param='mesa='+ table.cell( this ).data();
             var ventanaDestino = window.open("facturan16new.php?"+param);

                   // swal("Modificado", " El registro ha sido Modificado !!");
                  }, 2000);


     });
  

$('div.row:nth-child(1)').on('click',function(){
       //  param="ID="+ parseInt( $(this).attr('class'));
        // alert(param);
       //alert('cc del id')

     });

});

 </script>