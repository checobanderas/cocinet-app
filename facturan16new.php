<?php

require_once('plugin/lasclases.php');

require_once('plugin/modoro.php');





//require_once('modoro.php');

//require_once('plugin/lasclases.php');

    

//echo session_id();



if (empty($_GET['ID'])) {
    $_GET['ID'] = !empty($_GET['id']) ? $_GET['id'] : (!empty($_GET['id_cliente']) ? $_GET['id_cliente'] : 1);
}
$cliIdSanitized = intval($_GET['ID']);
if ($cliIdSanitized <= 0) $cliIdSanitized = 1;

$sql = 'select * from clientes where ID = ' . $cliIdSanitized . ' or id = ' . $cliIdSanitized;
$cliente = celda($_SESSION['DB'], $sql);



//echo $sql . '<BR>';



$sql='select * from parametros' ;

$parametros=celda($_SESSION['DB'],$sql);



?> 





<!DOCTYPE html>

<html lang="en">



<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?php  echo $cliente['NOMBRE']; ?></title>



    <link rel="preconnect" href="https://fonts.gstatic.com">

    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/bootstrap.css">



    <link rel="stylesheet" href="assets/vendors/perfect-scrollbar/perfect-scrollbar.css">

    <link rel="stylesheet" href="assets/vendors/bootstrap-icons/bootstrap-icons.css">

    <link rel="stylesheet" href="assets/css/app.css">

    <link rel="shortcut icon" href="assets/images/favicon.svg" type="image/x-icon">

</head>









<body>

    

    

<script>

    

// Limpia la caché del navegador

function limpiarCache() {

  // Utiliza la API de caché del navegador para eliminar la caché

  caches.keys().then(function(cacheNames) {

    cacheNames.forEach(function(cacheName) {

      caches.delete(cacheName);

    });

  });

}



// Llama a la función para limpiar la caché

limpiarCache();    

    

</script>



    

    

    <div id="app">



        <div id="main w-100">

            <header class="mb-3">

                <a href="#" class="burger-btn d-block d-xl-none">

                    <i class="bi bi-justify fs-3"></i>

                </a>

            </header>



            <div class="page-heading">









<style>

    

    ul.nav.nav-tabs li.active a {

    background-color: #d9edf7;

}

    </style>

        

</head>



  <?php //echo $cliente['NOMBRE']; ?>





<div id="CONTENIDO" class="container-fluid">

<table width="100%" border="0">

  <tr class="bg-warning text-white display-6">

    <td width="125" > <strong> <h3> CLIENTE : </h3> </strong></td>

    <td colspan="3"  ><h5> <?php echo utf8_decode( $cliente['NOMBRE']);?> </h5></td>

    <td width="282" rowspan="2" class="bg-primary display-6">

      FECHA

    <!--<input name="FECHA" type="text" class="TITULOAZUL" id="FECHA" autofocus onFocus="cal();" value="<?php ?>" style="width:230px;">-->

      <input type="text" class="form-control input-lg" id="FECHA" value="<?php date_default_timezone_set('America/Mexico_City');echo date('d/m/Y');?>">

      </td>

    <td width="262" rowspan="2" class="bg-light"> 

		<img src="imagenes/close2.png" alt="SALIR" style="

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

    cursor:pointer;

" onClick="javascript:window.open('','_parent','');window.close();" class="card" width="100" height="100">
	<button type="button" class="btn btn-dark form-control  btn-lg mr-5" data-toggle="modal" onClick="javascript:addfacturanew();" >Guardar Factura</button></td>

    <td width="89" rowspan="2" class="bg-light">&nbsp;</td>

  </tr>

  <tr>

    <td height="20" class="etiqueta"><strong>R.F.C. :</strong></td>

    <td width="17"><?php echo $cliente['RFC'];?></td>

    <td width="196"><strong>&nbsp&nbsp&nbsp&nbsp	DOMICILIO FISCAL:</strong></td>

    <td width="161"><?php echo $cliente['DOMFISCAL'];?></td>

  </tr>

  <tr>

    <td class="etiqueta"><strong>REGIMEN :</strong></td>

   <!-- <td colspan="3"><?php  echo $cliente['calle']." ".$cliente['colonia']." ".$cliente['municipio'];?></td>-->

	  <td colspan="3"> <div>  <?php $cookie_name = "REGIMENCLIENTE";

$cookie_value = $cliente['REGIMEN'];

setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/");  echo $cliente['REGIMEN'];?> </div>  </td>

    <td colspan="3" class="bg-info display-6"><h1 class='bg-info text-primary'>FACTURA : <span style="mso-spacerun:yes">

    

    <input name="FOLIO" style="width: 190px;" type="text" class="" id="FOLIO" value="<?php echo folfactura(); ?>" readonly>  </span>  </h1> </td>

  </tr>

  <tr class="">

    <td class="etiqueta"><strong>CORREO :</strong></td>

    <td colspan="3"><?php echo $cliente['correo'];?></td>

    <td class="border border-primary"><span style="mso-spacerun:yes">

    <input style="display: none;" name="SUCURSAL" type="text" class="celdatexto" id="SUCURSAL" value="<?php echo $_GET['SUCURSAL']; ?>"   >

   <h5 style='display:none;' class="bg-info mt-3">CAPTURAR TICKETS</h5>

   <input style='display:none;' name="BTINC" type="button" class="celdatexto" id="BTINC" value="IVA INCLUIDO"   >

    <input style='display:none;' name="BTMAS" type="button" class="celdatexto" id="BTMAS" value="MAS IVA"   >

    <input style='display:none;' name="PEDIDO" type="text" class="celdatexto" id="PEDIDOSIN" value="<?php echo $_GET['id_pedido']; ?>"   >    

    <input style='display:none;' name="BTSIN" type="button" class="celdatexto" id="BTSIN" value="NO APLICA"   >

  <!--   



    <strong>Agregar Nota(s):</strong> --></span></td>

    <td class="border border-primary"><input style='display:none;' name="PEDIDO2" type="text" placeholder="Inc. IVA" class="celdatexto form-control" id="PEDIDO" value="<?php echo $_GET['id_pedido']; ?>"   ></td>

    <td class="border border-primary"><input style='display:none;' name="PEDIDOMAS" type="text" placeholder="Mas IVA" class="celdatexto form-control" id="PEDIDOMAS" value="<?php echo $_GET['id_pedido']; ?>"   ></td> 

  </tr>



  

  <tr>

    <td  colspan="7"><div style="display: none;" class="subencabezado" id="REGIMEN"><?php echo $emisor['regimen'];?></div></td>

  </tr>

</table>







<table width="100%">

   <tr class="bg-info">





     <td width="218"> <strong>FORMA DE PAGO:</strong><strong>

   

       <?php   require_once('cmbformasdepago.php');?> <br> 

     </strong></td>

    

     <td colspan="2"><strong>METODO DE PAGO:</strong>

      <br>

  <?php require_once('cmbmetododepago.php');?>   <br>  </td>



  

     <td width="247"><strong>USO DEL CFDI:

       

       

       </strong><strong>

        <br>

        <?php   require_once('cmbusocfdi.php');?> <br> 

      </strong></td>

     <td width="349"><strong>CFDI RELACIONADOS:

       <?php   require_once('cmbcfdirelacionados.php');?> 



<input name="RELACIONADOS" type="text" class="form-control" id="RELACIONADOS" placeholder="FOLIO FISCAL"   />



     </strong></td>





   </tr>

   <tr>

    <td><strong>

     <!--  <textarea style="display: block;" name="METODODEPAGO" id="METODODEPAGO" class="form-control">PAGO EN UNA EXHIBICION</textarea> -->

    </strong></td>

    <td colspan="2"><input name="TASAIVA" type="hidden" class="cajadetexto" id="TASAIVA"   value="16" />

      <input type="hidden" name="MONEDA" id="MONEDA" value="MNX">

      <input type="hidden" name="TIPODECOMPROBANTE" id="TIPODECOMPROBANTE" value="ingreso">

      <input type="hidden" name="METODODEPAGO" id="METODODEPAGO" value="03">

      <strong>

      <!-- <textarea style="display: block;" name="CVEFORMADEPAGO" id="CVEFORMADEPAGO" class="form-control">Efectivo</textarea> -->

      </strong></td>

    <td><strong>

      <!-- <textarea style="display: block;" name="CVEUSOCFDI" id="CVEUSOCFDI" class="form-control"> Gastos en general</textarea> -->

    </strong></td>

    <td>

    <input name="NUMCUENTAPAGO" type="hidden" class="form-control" id="NUMCUENTAPAGO" placeholder="NUMERO DE CUENTA"   />

    </td>

  </tr>

     <tr>

    <td colspan="5">

</td>

  </tr>

   <tr>

    <td colspan="4"><input  name="CONDICIONESPAGO" type="hidden" class="cajadetexto" id="CONDICIONESPAGO" placeholder="CRED/CONT" /></td>

    <td><input type="hidden" name="ID_CLIENTE" id="ID_CLIENTE" value="<?php echo $_GET['ID'];?>">

     <input type="hidden" name="LUGAREXPEDICION" id="LUGAREXPEDICION" value="Oaxaca de Juarez, Oax.">

     <input name="TOTALIMPUESTOST" type="hidden" id="TOTALIMPUESTOST" value="16"></td>

  </tr>



  <tr>

    <td colspan="5">.</td>

  </tr>

  

  

  <tr>

    <td height="53" colspan="5"><div id="conceptos"><?php $_GET['tipo']='=';$_GET['campo']='folio';$_GET['valor']='0'; require_once('lstconceptos.php'); ?></div></td>

  </tr>

  </table>

<blockquote>&nbsp;</blockquote>

    















                <!-- Modal Sizes start -->

                <section id="modal-sizes" style="top:-100px !important;">

                    <div class="card">

                        <div class="card-content">

                            <div class="card-body">

  

                                <div class="row">

                                    <div class="col-12 w-100">



                                        <!--Modal full size -->

                                        <div class="me-1 mb-1 d-inline-block ">

                                            <!-- Button trigger for full size modal -->

<!--                                             <button type="button" class="btn btn-info btn-lg" data-bs-toggle="modal"

                                                data-bs-target="#full-scrn">

                                                Full Screen Modal

                                            </button> -->



                                            <!-- full size modal-->

                                            <div class="modal fade text-left w-100" id="full-scrn" tabindex="-1"

                                                role="dialog" aria-labelledby="myModalLabel20" aria-hidden="true">

                                                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-full"

                                                    role="document">

                                                    <div class="modal-content">

                                                        <div class="modal-header btn btn-info btn-lg">

                                                            <h4 class="modal-title" id="myModalLabel20">Agregar Productos o Servicios</h4>

                                                            <button type="button" class="close" data-bs-dismiss="modal"

                                                                aria-label="Close">

                                                                <i data-feather="x"></i>

                                                            </button>

                                                        </div>

                                                        <div class="modal-body">

                       

























  <form id="frmdatos"  class='m-2' > 



   <div class="row">

       

    <div class="col-sm-5 text-primary"

      > <label for="CONCEPTO" ><strong> CONCEPTO</strong> </label>

       <?php  // require_once('cmbproductos.php');?>

      <textarea style="height: 100px;" name="CONCEPTO"  class="form-control" id="CONCEPTO">CONSUMO DE ALIMENTOS</textarea>

        <!-- <input type="text" class="form-control" id="CONCEPTO" >-->

      

              </div>

       

   

    <div class="col-sm-4 text-primary">

          <label  for="CLAVE"> <strong> CLAVE</strong> </label>

          

       <?php   require_once('cmbclaves.php');?>



   

           <label for="UNIDAD"> <strong> UNIDAD</strong> </label>

<?php require_once('cmbunidades.php');?>

    </div>



   </div> 







 <div class="row">





    <div class="col-sm-1 bg-info" >

       <label for="CANTIDAD">CANTIDAD</label>

    <input class="form-control" name="CANTIDAD" id="CANTIDAD" type="text" onKeyPress='return validar(event);' value="1">

    </div>



      

   <div class="col-sm-5 bg-info" >    



   <strong> PRECIO PUBLICO </strong>

&nbsp&nbsp&nbsp&nbsp&nbsp

    <label class="radio-inline" >

      <input  type="radio" name="optradio" id="menos" checked="checked" >IVA Incluido

    </label>

&nbsp&nbsp

    <label class="radio-inline">

      <input type="radio" name="optradio" id='mas'  >Mas IVA

    </label>&nbsp&nbsp

    <label class="radio-inline">

      <input type="radio" name="optradio" id="cero">TASA 0%

       </label>

     

      <input type="hidden" name="TIPOIVA" value="menos" id="TIPOIVA">     

        

      <input type="text" class="form-control" id="PRECIOPUB" name="PRECIOPUB" onKeyPress='return validar(event);'  value="0">



    </div>



   </div>









     <div class="row mb-5">

    



   

 <!--         <div class="col-sm-2 bg-info" >

       <label for="PREVENTA">PREVENTA</label>



 </div>-->

    <input class="form-control mb-3" id="PREVENTA" type="hidden" name="PREVENTA" value="0">   

             <div class="col-sm-2 bg-info" >

       <label for="IMPORTE">IMPORTE</label>

    <input class="form-control" name="IMPORTE" id="IMPORTE" type="text" onKeyPress='return validar(event);' readonly value="0">

 </div>

   

   
<div class="col-sm-1 bg-info" >

       <label for="IMPIVA">IVA</label>

    <input class="form-control mb-3" id="IMPIVA" type="text" readonly onKeyPress='return validar(event);' value="0" name="IVA">

 </div>
<div class="col-sm-1 bg-info" >

       <label for="IMPSUBTOTAL">SUBTOTAL</label>

    <input class="form-control mb-3" id="IMPSUBTOTAL" type="text" readonly onKeyPress='return validar(event);' value="0" name="IMPSUBTOTAL">

 </div>		 

              <div class="col-sm-1 bg-info" >

       <label for="IMPISR">ISR</label>

    <input class="form-control mb-3" id="IMPISR" type="text" readonly onKeyPress='return validar(event);' value="0" name="ISR">

 </div>

             <div class="col-sm-2 bg-info" >

       <label for="TOTAL">TOTAL</label>

    <input class="form-control mb-3" name="TOTAL" id="TOTAL" type="text" readonly onKeyPress='return validar(event);' value="0">

 </div>

    

            <div class="col-sm-1" >

       <label for="DESCUENTO" style="display: none;">DESCTO</label>

    <input class="form-control" id="DESCUENTO" name="DESCUENTO" type="text" onKeyPress='return validar(event);' value="0" style="display: none;">

    <br><br>

 </div>

      

   </form>

    

</div>   





        <div class="modal-footer mt-5">

        <!--  <div class="col-sm-2 bg-info" > </div>-->

      <button type="button" id="BTGUARDARCONCEPTOS" class="btn btn-primary">GUARDAR PRODUCTO O SERVICIO</button>



                                                              <button type="button" class="btn btn-light-secondary"

                                                                data-bs-dismiss="modal">

                                                                <i class="bx bx-x d-block d-sm-none"></i>

                                                                <span class="d-none d-sm-block">Salir</span>

                                                            </button>

          <!-- <button type="button" class="btn btn-default" data-dismiss="modal">Salir</button> -->

        </div>





  

    </div>

                       

  

</div>  

       

  

</div>  















 </form>













                                                        </div>



                                                        

<!--                                                         <div class="modal-footer">

                                                            <button type="button" class="btn btn-light-secondary"

                                                                data-bs-dismiss="modal">

                                                                <i class="bx bx-x d-block d-sm-none"></i>

                                                                <span class="d-none d-sm-block">Cerrar</span>

                                                            </button>

                                                            <button type="button" class="btn btn-primary ml-1"

                                                                data-bs-dismiss="modal">

                                                                <i class="bx bx-check d-block d-sm-none"></i>

                                                                <span class="d-none d-sm-block"></span>

                                                            </button>

                                                        </div> -->





                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                <!-- Modal Sizes end -->



                <!-- Form and scrolling Components start -->



                <!-- Form and scrolling Components end -->

            </div>



























<!--             <footer>

                <div class="footer clearfix mb-0 text-muted">

                    <div class="float-start">

                        <p>2021 &copy; Mazer</p>

                    </div>

                    <div class="float-end">

                        <p>Crafted with <span class="text-danger"><i class="bi bi-heart"></i></span> by <a

                                href="http://ahmadsaugi.com">A. Saugi</a></p>

                    </div>

                </div>

            </footer> -->

        </div>

    </div>

    <script src="assets/vendors/perfect-scrollbar/perfect-scrollbar.min.js"></script>

    <script src="assets/js/bootstrap.bundle.min.js"></script>



    <script src="assets/js/main.js"></script>

</body>



</html>





    <script> 

        

$( document ).ready(function() {

        





   $(' .container-fluid > div:nth-child(1) > div:nth-child(2)').html(' <button type="button" class="btn btn-primary btn-lg mt-3" data-bs-toggle="modal" data-bs-target="#full-scrn"> Agregar Productos o Servicios. </button>');

    

 //  $('[data-toggle="tooltip"]').tooltip(); 

//alert('ini'); 

$(':input').on('input',function(){pontotales3();});



$(':input').keydown(function (e) {

    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;

    if (key == 13) {

        e.preventDefault();

        var inputs = $(this).closest('form').find(':input:visible:enabled');

        if ((inputs.length-1) == inputs.index(this))

            $(':input:enabled:visible:first').focus();

        else

            inputs.eq(inputs.index(this) + 1).focus();

    }

});



$('#mas').on('click', function()

{ $('#TIPOIVA').val('mas');});

    

$('#menos').on('click', function(){ $('#TIPOIVA').val('menos');});

    

$('#cero').on('click', function(){ $('#TIPOIVA').val('cero');});

    

    

$('#menos').trigger( "click" );   //inicializo con cero EXCENTO

$('#BTGUARDARCONCEPTOS').on('click',function(){



        //var cunidad =$('div#FRMCVEUNIDADES button.btn.dropdown-toggle.btn-default').attr('title');

        //var clave =$('div#FRMCLAVES button.btn.dropdown-toggle.btn-default').attr('title');

    

//alert($('div#FRMCVEUNIDADES > select > option').attr('title'));



  var cunidad = parent.document.getElementById('CMBCVEUNIDAD').value ;

  var clave = parent.document.getElementById('CMBCVE').value ;

    

    var param = $('#frmdatos').serialize();

    param+="&CUNIDAD=" + cunidad + "&CLAVES=" + clave;

       // alert(param);

        

    

            $.ajax({

                type: "GET",

                url: "addconcepto.php",

                data: param,

                    beforeSend: function () {

                        //alert('bodyyyy');

                            $('*').find('#conceptos').html("Procesando, espere por favor...");

                    },

                    success:  function(result){

                                $('*').find('#conceptos').html(result);

                        },

                      error: function (xhr, ajaxOptions, thrownError) {

                        alert(xhr.status);

                        alert(thrownError);

                      }                 

            });



    });



//$('#CMBMETODODEPAGO').selectpicker('val', ' Gastos en general');

    

    

//$('div#FRMMETODO button.btn.dropdown-toggle.btn-default').attr('title') = "G03";  

//$( '#datepicker' ).datepicker({

//        dateFormat: 'dd/mm/yy',

//        dayNamesMin: [ 'Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa' ],

//        monthNames: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ]

//});

    

}); 

    

    

    





    

    





        

        

    </script>   

