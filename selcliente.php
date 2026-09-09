<?php require_once('frmencabezado.php');
require_once('plugin/lasclases.php');
//echo $_SESSION['DB'];

$_GET['tabla']='clientes';
$_GET['id']=9;

$sql ="select * from  " . $_GET['tabla']." where TRIM(id)= " . trim($_GET['id']);
$fila= celda('',$sql);



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

$tipos = array("text","text","text","text","text","text","text","text","text","text","text",);	
$listas = array("","","","","","","","","","");	
$defaultvalores = array("","","","","","","","","","");		
$valores = array($fila[$campos[0]],$fila[$campos[1]],$fila[$campos[2]],$fila[$campos[3]],$fila[$campos[4]],$fila[$campos[5]]);	 
	
for($i=0;$i <= count($campos)-1;$i++)
{ 
	     echo '<div class="col-2 text-sm-right">	'; 	echo $campos[$i]; echo ': </div>';
		 echo  '<div class="col-10">	';  
		 echo " <input onKeyUp='this.value = this.value.toUpperCase();'  class='form-control rounded' value='".$fila[$i+1] . "'  name='".$campos[$i] . "' id='".$campos[$i] . "' type='".$tipos[$i] ."' >";
		 echo '</div>';
}
	
	?>	
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
		alert (param);

		mostrar('actregistro.php',param,'#CONTENIDOPRINCIPAL');      	
        swal("Modificado", " El registro ha sido Modificado !!");
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
