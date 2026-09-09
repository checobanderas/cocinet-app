<?php require_once('frmencabezado.php');
require_once('plugin/lasclases.php');
session_start();
?>
<DIV id="CONTENIDOPRINCIPAL">
	
<div class="row">


<div class='col'>
<button type="button"  id="BTPEDIDO" onclick="


var param2 = $('#formulario').serialize();





if ($('#DIRECCION2').val().trim()=='' && $('#DIRECCION2').val().trim()=='' ){
//VOY A PONER OPCIONES DE SELECCION
	seldireccion=direccion1;

//aram='mesa='+document.getElementById('TELEFONO').value+'&seldireccion='+direccion1;
//alert(param);
//if(x!=null){x.close();};
// var x = window.open('opciones3.php?'+param);

parent.ponopcionesdir(document.getElementById('TELEFONO').value,direccion1);

}
else{

//alert('aqui muestro lista de direcciones a escoger');

param='direccion1='+direccion1+'&direccion2='+direccion2+'&direccion3='+direccion3+'&mesa='+document.getElementById('TELEFONO').value;
//alert(param);
if(x!=null){x.close();};
 //var x = window.open('lstdirecciones.php?'+param);
mostrar('lstdirecciones.php',param,'div#CONTENIDOPRINCIPAL')

}

//alert(direccion1);



" class="btn btn-primary btn-flat btn-addon btn-lg m-b-10 m-l-5 w-100">AGREGAR PEDIDO</button>	
	</div>	
<div class='col'>
<button type="button" onclick="preguntar2();" id="BTGUARDAR" class="btn btn-primary btn-flat btn-addon btn-lg m-b-10 m-l-5 w-100">ACTUALIZAR</button>	
	</div>
<div class='col'>
	<button type="button" onclick="preguntar();" id="BTELIMINAR" class="btn btn-primary btn-flat btn-addon btn-lg m-b-10 m-l-5 w-100">ELIMINAR</button>
	</div>
<div class='col'>
	<button type="button" id="BTSALIR" onclick="JavaScript:location.reload();  " class="btn btn-primary btn-flat btn-addon btn-lg m-b-10 m-l-5 w-100">SALIR</button>
	</div>	
	
	</div>





<?php 

$_GET['tabla']='cortes';


//$_GET['id']=55;
$sql ="select * from  " . $_GET['tabla']." where TRIM(id)= " . trim($_GET['id']);
$fila= celda('',$sql);

?>

<script>
$(document).ready(function () {





$(':input:enabled:visible:first').focus();
	
//	
	$('#BTGUARDAR')
	.on('click',function(){
	var param = $('#formulario').serialize();
	
		//alert (param);	

	mostrar('actcliente.php',param,'#CONTENIDOPRINCIPAL');
				//iniciar2(document.getElementById('txtusuario').value,document.getElementById('txtpassword').value);


	   });


	function addpedido(){




  //var param2="mesa="+document.getElementById('TELEFONO').value;
    //var objajax2=null;
   // cargaget("menu","opciones2.php",param2,objajax2);
   //document.getElementById('encabezado').innerHTML='';

	//var param = $('#formulario').serialize();
	
		//alert (param2);	

	//mostrar('opciones2.php',param2,'#CONTENIDOPRINCIPAL');
	




	}
//	$('#BTPEDIDO').on('click',function(){

	$('#BTSALIR')
	.on('click',function(){
	var param = $('#formulario').serialize();
	//alert (param);	

	mostrar('lstclientes2.php',param,'#CONTENIDOPRINCIPAL');
				//iniciar2(document.getElementById('txtusuario').value,document.getElementById('txtpassword').value);
	   });	
	

	$('#BTPEDIDO')
	.on('click',function(){
	var param = document.getElementById('TELEFONO').value;;
	//alert (param);	

	//mostrar('lstclientes2.php',param,'#CONTENIDOPRINCIPAL');
				//iniciar2(document.getElementById('txtusuario').value,document.getElementById('txtpassword').value);
	   });	


	$('#BTELIMINAR')
	.on('click',function(){
	var param = $('#formulario').serialize();
	param=param+
		alert (param);	

		
	if(confirm('¿Estas seguro de borrar este registro?'))
	{
		mostrar('delcliente.php',param,'#CONTENIDOPRINCIPAL');
	}
	else
	{
		alert('SE HA CANCELADO LA OPERACION');
	}			


 swal({
      title: "Are you sure to delete ?",
      text: "You will not be able to recover this imaginary file !!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it !!",
      mostrar('delcliente.php',param,'#CONTENIDOPRINCIPAL'),
      closeOnConfirm: false 
    },
    function() {
      swal("Deleted !!", "Hey, your imaginary file has been deleted !!", "success");
    });



		
		
	
				//iniciar2(document.getElementById('txtusuario').value,document.getElementById('txtpassword').value);
	   });		
//	$('#BTSALIR')
//	.on('click',function(){
//	
//	//alert (param);	
//
//	mostrar('frmclientes.php',param,'#CONTENIDO');
////		$('#CONTENIDO').html('');
////		$('#TITULO').html('');
//			
//	   });	
	
});
</script>


<div id="CONTENIDOPRINCIPAL" class="container"> 
<form class='form' id="formulario"> 
<input type="text" id="ID" name="ID" style="display: none;" value="<?php echo trim($_GET['id']) ;?>">
<?php


//$campos = array("NOMBRE","DIRECCION","COLONIA","POBLACION","ACTIVOS","NCOMERCIAL","TELEFONO","ID_RUTA");
//$tipos = array("text","text","text","text","text","text","text","combo","date","text","text","text","text");	
//$listas = array("","","","","","","","combo.php");	

//echo count($campos);

if(!isset($_SESSION))
{
session_start();
}  	

require_once('plugin/lasclases.php');
//echo $_SESSION['DB'];
$link=conectarse('hima1');
$_SESSION['DB']='hima1';
$sqry="describe " . $_GET['tabla'];

//"Select * from usuarios where acceso = '" . $_SESSION['CESUCURSAL'] . "'";
//echo $sqry;
$campos = array();
$iqry=mysql_query($sqry,$link);
$i=1;
$j=mysql_num_rows($iqry);
while ($i<$j) {

array_push($campos, mysql_result($iqry,$i,0));

//echo "<option value='".mysql_result($iqry,$i,0)."'>".mysql_result($iqry,$i,0)."</option>";
$i++;
}

$tipos = array("text","text","text","textarea","textarea","textarea","textarea","textarea","text","text","text",);	
$listas = array("","","","","","","","","","");	
$defaultvalores = array("","","","","","","","","","");		
$valores = array($fila[$campos[0]],$fila[$campos[1]],$fila[$campos[2]],$fila[$campos[3]],$fila[$campos[4]],$fila[$campos[5]]);	 
	
for($i=0;$i <= count($campos)-1;$i++)
{ 
	
echo " <div class='row'> ";

	
###############################                  COMBO  	
if($tipos[$i]=='combo')	{ 
	echo '<div class="col-2 text-sm-right">	'; echo $campos[$i]. ":";
	echo '</div>';
	echo '<div class="col-10">	';
	//valores del combo
	$_GET['SQL']='select ID,CONCAT(RUTA , " - " , DIAES) AS RUTA from rutas';
	$_GET['NOMBRE']= $campos[$i];
	$_GET['VALOR']=$fila[$i+1];	
	require_once($listas[$i]);
	
	echo '</div>';
}
##############################################	TEXTO
	if($tipos[$i]=='text')	{ 
	     echo '<div class="col-2 text-sm-right">	'; 	echo $campos[$i]; echo ': </div>';
		 echo  '<div class="col-10">	';  
		 echo " <input onKeyUp='this.value = this.value.toUpperCase();'  class='form-control rounded' value='".$fila[$i+1] . "'  name='".$campos[$i] . "' id='".$campos[$i] . "' type='".$tipos[$i] ."' >";
		 echo '</div>';
	}
	
	if($tipos[$i]=='textarea')	{ 



		//echo $fila$fila[$i+1]
	     echo '<div class="col-2 text-sm-right">	'; 	echo $campos[$i]; echo ': </div>';
		 echo  '<div class="col-10">	'; 
		 echo ' <textarea rows="4" onKeyUp="this.value = this.value.toUpperCase();" class="w-100"  name="'. $campos[$i] .'"  id="'. $campos[$i] .'" >'.$fila[$i+1].'</textarea> '; 
		// echo " <input onKeyUp='this.value = this.value.toUpperCase();'  class='form-control rounded' value='".$fila[$i+1] . "'  name='".$campos[$i] . "' id='".$campos[$i] . "' type='".$tipos[$i] ."' >";
		 echo '</div>';

	}
echo '</div>';
}

//print_r($_COOKIE);
//echo '¡Hola ' . htmlspecialchars($_COOKIE[$campos[$i]]) . '!';
//echo '¡Hola ' . htmlspecialchars($_COOKIE["DIRECCION2"]) . '!';
//echo '¡Hola ' . htmlspecialchars($_COOKIE["DIRECCION3"]) . '!';

	?>	
<script type="text/javascript">
	direccion1 =$('#DIRECCION1').val();
	direccion2 =$('#DIRECCION2').val();
	direccion3 =$('#DIRECCION3').val();
</script>

<input type="text" id="tabla" name="tabla" style="display: none;" value="<?php echo $_GET['tabla']; ?>">

</form>	
	

	</div>	


</DIV>

    <!-- All Jquery -->
    <script src="../js/lib/jquery/jquery.min.js"></script>
    <!-- Bootstrap tether Core JavaScript -->
    <script src="../js/lib/bootstrap/js/popper.min.js"></script>
    <script src="../js/lib/bootstrap/js/bootstrap.min.js"></script>
    <!-- slimscrollbar scrollbar JavaScript -->
    <script src="../js/jquery.slimscroll.js"></script>
    <!--Menu sidebar -->
    <script src="../js/sidebarmenu.js"></script>
    <!--stickey kit -->
    <script src="../js/lib/sticky-kit-master/dist/sticky-kit.min.js"></script>

    <script src="../js/lib/sweetalert/sweetalert.min.js"></script>
    <!-- scripit init-->
    <script src="../js/lib/sweetalert/sweetalert.init.js"></script>
    <!--Custom JavaScript -->
    <script src="../js/scripts.js"></script>

	
<SCRIPT>

    $(document).keyup(function(event){

        if(event.which==27)

        {

          // mostrar('lstclientes.php',param,'#CONTENIDO');
          document.close();

        }

    });


	document.title=' <?php echo strtoupper( substr($_GET['tabla'],0,strlen( $_GET['tabla']) -1)  ); ?> No.:  <?php echo  $_GET['id']; ?> ';



function preguntar2() {


  swal({
      title: "Confirmar Solicitud !!",
      text: "Estas seguro de modificar este Registro ?",
      type: "warning",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
       confirmButtonText: "Si, modificar este registro !!",
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    },
    function() {
      setTimeout(function() {
	var param = $('#formulario').serialize();
	//param=param+
		//alert (param);

		mostrar('actregistro.php',param,'#CONTENIDOPRINCIPAL');  

//        swal("Modificado", " El registro ha sido Modificado !!");
      }, 2000);
    });
}


function preguntar() {


  swal({
      title: "Confirmar Solicitud !!",
      text: "Estas seguro de borrar este Registro ?",
      type: "warning",
      cancelButtonText: "Cancelar ",
         confirmButtonColor: "#DD6B55",
      showCancelButton: true,
       confirmButtonText: "Si, Borrar este registro !!",
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    },
    function() {
      setTimeout(function() {
	var param = $('#formulario').serialize();
	//param=param+
		//alert (param);	
		mostrar('delregistro.php',param,'#CONTENIDOPRINCIPAL');      	
        swal("Eliminado","El  cliente ha sido eliminado !!","success");
      }, 2000);
    });
}






</SCRIPT>	
