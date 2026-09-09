<?php require_once('frmencabezado40.php');
$_GET['ID_VENDEDOR']=2;
?>
<title> AGREGAR NUEVO <?php echo " ". $_GET['tabla']; ?>                            **            **</title>

<script>
$(document).ready(function () {
  $(':input:enabled:visible:first').focus();
	
  $('#BTGUARDAR').on('click',function(){
    var param = $('#formulario').serialize();
    mostrar('addregistro.php',param,'#CONTENIDOPRINCIPAL');
  });	
	
  $('#BTSALIR').on('click',function(){
    location.reload();			
  });	

  // Controlamos que si pulsamos escape se cierre el div
  $(document).keyup(function(event){
    if(event.which==27) {
      parent.window.location.reload();
      window.close();
    }
  });
});
</script>

<div id="CONTENIDOPRINCIPAL2" class="container"> 
<form class='form' id="formulario"> 

<input type="text" id="tabla" name="tabla" style="display: none;" value="<?php echo $_GET['tabla']; ?>" >

<div class='row border border-primary rounded-top'>
  <div class="col-6">
    <h3 class="text-primary font-italic text-left"><STRONG> ALTA DE <?php echo strtoupper($_GET['tabla']); ?> </STRONG> </h3>
  </div>

  <div class="col-6 mt-4">
  </div>

  <a id="BTGUARDAR" style="
      line-height: 12px;
      width: auto;
      font-size: 8pt;
      font-family: tahoma;
      margin-top: 1px;
      margin-right: 52px;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 200;
  " class="btn btn-app bg-primary text-white rounded-top ">
    <i class="fa fa-save"></i> Guardar
  </a>

  <a id="BTSALIR" style="
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
  " class="btn btn-app bg-dark text-white rounded-top" onclick="javascript:parent.ponclientes();" >
    <i class="fa fa-close"></i> Salir
  </a>
</div>

<div class="card-content mt-5" style="margin-top: 20px;">
  <div class="card-body">
    <div class="row">

<?php
if(!isset($_SESSION)) {
  session_start();
}  	

require_once('plugin/lasclases.php');
$link=conectarse($_SESSION['DB']);
$sqry="describe " . $_GET['tabla'];

$campos = array();
$iqry=mysql_query($sqry,$link);
$i=0;
$j=mysql_num_rows($iqry);
while ($i<$j) {
  array_push($campos, mysql_result($iqry,$i,0));
  $i++;
}

$tipos = array("oculto","text","textarea","textarea","combo","textarea","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text","textarea","text","text","text","text");	
$listas = array("","","","","cmbregimenes.php","","","","","","");	
$defaultvalores = array("","","","","","","","","","");	

for($i=0;$i <= count($campos)-1;$i++)
{ 
  ############################### COMBO  	
  if($tipos[$i]=='combo')	{ 
    echo '       <div class="col-md-6 col-12">
                <div class="form-group">
                    <label for="first-name-column">'. strtoupper($campos[$i]) .'</label>';
    
    $_GET['SQL']='select ID,CONCAT(RUTA , " - " , DIAES) AS RUTA from rutas';
    $_GET['NOMBRE']= $campos[$i];
    $_GET['VALOR']='';	
    require_once($listas[$i]);

    echo '      </div>
            </div>';
  }

  ############################################## TEXTO
  if($tipos[$i]=='text')	{ 
    echo '       <div class="col-md-6 col-12">
                <div class="form-group">
                    <label for="first-name-column">'. strtoupper($campos[$i]) .'</label>
                    <input type="text" id="'.$campos[$i].'" class="form-control" placeholder="'.$campos[$i].'" value="" name="'.$campos[$i].'">
                </div>
            </div> 	';
  }

  if($tipos[$i]=='oculto')	{ 
    echo '<div class="col-2 text-sm-right" style="display:none;"> '; echo $campos[$i]; echo ': </div>';
    echo  '<div class="col-3">';  
    echo " <input onKeyUp='this.value = this.value.toUpperCase();' style='display:none;' class='form-control rounded' value='' name='".$campos[$i] . "' id='".$campos[$i] . "' type='".$tipos[$i] ."' >";
    echo '</div>';
  }	

  if($tipos[$i]=='textarea')	{ 
    echo '       <div class="col-md-6 col-12">
                <div class="form-group">
                    <label for="first-name-column">'.strtoupper($campos[$i]).'</label>
                    <textarea rows="2" type="text" id="'.$campos[$i].'" class="form-control" placeholder="'.$campos[$i].'" name="'.$campos[$i].'"></textarea> 
                </div>
            </div> 	';
  }
}
?>	

    </div>
  </div>
</div>
<hr>

<script>
$(document).keyup(function(event){
  var tecla = event.which;
  switch (tecla) { 
    case 27: 
      swal({
        title: "Sweet !!",   
        text: "<span style='color:#ff0000'>Hey, you are using HTML !!<span>",
        html: true 
      });
      break;
    case 118: 
      window.open("lstclientes2.php");  
      break;    
    case 'dojo': 
      alert('dojo Wins!');
      break;
    default:
  }
});  
</script>