<?php require_once('frmencabezado40.php');
require_once('plugin/lasclases.php');
session_start();
?>
<style>
div.row:nth-child(1)
{
 margin-top:0px !important;
 margin-right:0px !important;
 text-align: center !important; 
 z-index: -2000;
}
</style>

<body>

<DIV id="CONTENIDOPRINCIPAL">
	
<div class="buttons sticky-top card">

<div class="btn btn-danger">
  <h3><?php echo "                Cliente #:"; ?><span class="badge bg-transparent"> <?php echo trim($_GET['id']); ?></span></h3>
   
  <button type="button" id="BTGUARDAR" onclick="preguntar2();" class="btn btn-dark btn-flat btn-addon btn-sm m-b-10 m-l-5"> ACTUALIZAR</button>	
  <button type="button" id="BTELIMINAR" onclick="preguntar();" class="btn btn-dark btn-flat btn-addon btn-sm m-b-10 m-l-5">ELIMINAR</button>

  <button type="button" id="BTPEDIDO" onclick="
    var param2 = $('#formulario').serialize();
    param='ID=<?php echo trim($_GET["id"]); ?>';
    if(x!=null){x.close();};
    var x = window.open('selfila12.php?'+param);
  " class="btn btn-warning btn-flat btn-addon btn-sm m-b-10 m-l-5 text-dark">VER FACTURAS</button>	

  <button type="button" id="BTPEDIDO" onclick="
    var param2 = $('#formulario').serialize();
    param='id=<?php echo trim($_GET["id"]); ?>';
    if(x!=null){x.close();};
    mostrar('cliente.php',param,'div#CONTENIDOPRINCIPAL')
  " class="btn btn-warning btn-flat btn-addon btn-sm m-b-10 m-l-5 text-dark">AGREGAR FACTURA</button>	

</div>

  <button type="button" id="BTSALIR" onclick="JavaScript:location.reload();" style="
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
  " class="btn btn-dark btn-flat btn-addon btn-sm m-b-10 m-l-5">SALIR</button>
</div>	

<?php 
$_GET['tabla']='clientes';

$sql ="select * from  " . $_GET['tabla']." where TRIM(id)= " . trim($_GET['id']);
$fila= celda('',$sql);
?>

<script>
$(document).ready(function () {

  $(':input:enabled:visible:first').focus();
	
  $('#BTGUARDAR').on('click',function(){
    preguntar2();
  });

  $('#BTSALIR').on('click',function(){
    var param = $('#formulario').serialize();
    mostrar('lstclientes2.php',param,'#CONTENIDOPRINCIPAL');
  });	
	
  $('#BTPEDIDO').on('click',function(){
    var param = document.getElementById('TELEFONO').value;
  });	

  $('#BTELIMINAR').on('click',function(){
    var param = $('#formulario').serialize();
    alert (param);	
  });
});
</script>

<div id="CONTENIDOPRINCIPAL" class="container-fluid"> 
<form class='form' id="formulario"> 
<input type="hidden" id="ID" name="ID" value="<?php echo trim($_GET['id']) ;?>">

<div class="card-content">
  <div class="card-body">
    <div class="row">

<?php
if(!isset($_SESSION)) {
  session_start();
}  	

require_once('plugin/lasclases.php');

$link=conectarse('hima1');
$_SESSION['DB']='hima1';
$sqry="describe " . $_GET['tabla'];

$campos = array();
$iqry=mysql_query($sqry,$link);
$i=0;
$j=mysql_num_rows($iqry);
while ($i<$j) {
  array_push($campos, mysql_result($iqry,$i,0));
  $i++;
}

// Estructura sincronizada exactamente igual a frmnew (Combo en posicion 4)
$tipos = array("oculto","text","textarea","textarea","combo","textarea","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text");	
$listas = array("","","","","cmbregimenes.php","","","","","","");	
$defaultvalores = array("","","","","","","","","","");		

for($i=0;$i <= count($campos)-1;$i++)
{ 
  ############################### COMBO  	
  if($tipos[$i]=='combo')	{ 
    echo '<div class="col-md-6 col-12">';
    echo '  <div class="form-group">';
    echo '    <label for="first-name-column">'. strtoupper($campos[$i]) .'</label>';
    
    $_GET['SQL']='select ID,CONCAT(RUTA , " - " , DIAES) AS RUTA from rutas';
    $_GET['NOMBRE']= $campos[$i];
    $_GET['VALOR']=$fila[$i]; // Carga el valor actual guardado en la Base de Datos	
    require_once($listas[$i]);
    
    echo '  </div>';
    echo '</div>';
  }

  ############################################## TEXTO
  if($tipos[$i]=='text')	{ 
    echo '       <div class="col-md-6 col-12">
                <div class="form-group">
                    <label for="first-name-column">'. strtoupper($campos[$i]) .'</label>
                    <input type="text" id="'.$campos[$i].'" class="form-control" placeholder="'.$campos[$i].'" value="'.$fila[$i].'" name="'.$campos[$i].'">
                </div>
            </div> 	';
  }

  if($tipos[$i]=='oculto')	{ 
    echo '<div class="col-2 text-sm-right" style="display:none;"> '; echo $campos[$i]; echo ': </div>';
    echo  '<div class="col-3">';  
    echo " <input onKeyUp='this.value = this.value.toUpperCase();' style='display:none;' class='form-control rounded' value='".$fila[$i] . "' name='".$campos[$i] . "' id='".$campos[$i] . "' type='".$tipos[$i] ."' >";
    echo '</div>';
  }	

  if($tipos[$i]=='textarea')	{ 
    echo '       <div class="col-md-6 col-12">
                <div class="form-group">
                    <label for="first-name-column">'.strtoupper($campos[$i]).'</label>
                    <textarea rows="2" type="text" id="'.$campos[$i].'" class="form-control" placeholder="'.$campos[$i].'" name="'.$campos[$i].'">'.$fila[$i].'</textarea> 
                </div>
            </div> 	';
  }
}
?>	

    </div>
  </div>
</div>

<script type="text/javascript">
  direccion1 =$('#DIRECCION1').val();
  direccion2 =$('#DIRECCION2').val();
  direccion3 =$('#DIRECCION3').val();
</script>

<input type="text" id="tabla" name="tabla" style="display: none;" value="<?php echo $_GET['tabla']; ?>">

</form>	

</div>	

</DIV>

<script src="assets/js/extensions/sweetalert2.js"></script>
<script src="assets/vendors/sweetalert2/sweetalert2.all.min.js"></script>

</body>	
</html>

<script type="text/javascript">
function preguntar2() {
  swal.fire({
      title: "Confirmar Solicitud !!",
      text: "Estas seguro de modificar este Registro ?",
      type: "warning",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      confirmButtonText: "Si, modificar este registro !!",
      closeOnConfirm: false,
      showLoaderOnConfirm: true
  }).then((result) => {
    if (result.isConfirmed) {
      setTimeout(function() {
        var param = $('#formulario').serialize();
        mostrar('actregistro.php',param,'#CONTENIDOPRINCIPAL');  
      }, 2000);
    }
  })
}

function preguntar() {
  Swal.fire({
    title: "Confirmar Solicitud !!",
    text: "Estas seguro de modificar este Registro ?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: "Cancelar",
    confirmButtonText: 'Si, borrar registro!'
  }).then((result) => {
    if (result.isConfirmed) {
      setTimeout(function() {
        var param = $('#formulario').serialize();
        mostrar('delregistro.php',param,'#CONTENIDOPRINCIPAL');    
        Swal.fire(
          'Borrado!',
          'El registro ha sido borrado.',
          'success'
        )
      }, 2000);
    }
  })
}
</script>