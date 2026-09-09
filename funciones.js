

function mostrar(url,param,div){



	//alert(param);

	//alert(url);

//	alert(div);

	//document.getElementById(div).innerHTML= "ESPERE";

	$.ajax({

		type: "GET",

		url: url,

		data: param,

			beforeSend: function () {

					$('*').find($(div)).html("<h1 class='rounded jumbotron bg-info'>Procesando, espere por favor...<h1>");

			},

			success:  function(result){

						$('*').find($(div)).html(result);

				}

	});	









}



function round2(numero)

{

	var original=parseFloat(numero);

	var result=Math.round(original*100)/100 ;

	return result;

}

function validarneg(e) {

    tecla = (document.all) ? e.keyCode : e.which;

	//alert(tecla);

    if (tecla==8) return true;

	if (tecla==0) return true;

	if (tecla==9) return true; //Tecla de retroceso (para poder borrar)

    if (tecla==46) return true;

	if (tecla==45) return true; 

	//Tecla de retroceso (para poder borrar)	

    if (tecla == 190) alert("Punto en el teclado izquierdo (190)");

    if (tecla == 110) alert("Punto en el teclado derecho (110)"); 

    patron =/\d/; //ver nota

    te = String.fromCharCode(tecla);

	

	

	

	    return patron.test(te); 



}



function validar(e) {

    tecla = (document.all) ? e.keyCode : e.which;

	//alert(tecla);

    if (tecla==8) return true;

	if (tecla==0) return true;

	if (tecla==9) return true; //Tecla de retroceso (para poder borrar)

    if (tecla==46) return true; //Tecla de retroceso (para poder borrar)	

    if (tecla == 190) alert("Punto en el teclado izquierdo (190)");

    if (tecla == 110) alert("Punto en el teclado derecho (110)"); 

    patron =/\d/; //ver nota

    te = String.fromCharCode(tecla);

	   

	return patron.test(te); 



}



function SumarColumna(grilla, columna) {

 

    var resultVal = 0.0; 

         

    $("#" + grilla + " tbody tr").not(':first').not(':last').each(

        function() {

         

            var celdaValor = $(this).find('td:eq(' + columna + ')');

            

            if (celdaValor.val() !== null)

                   { resultVal += parseFloat(celdaValor.html().replace(',','.'));}

                     

        } //function

         

    ); //each

    

    $("#" + grilla + " tbody tr:last td:eq(" + columna + ")").html(resultVal.toFixed(2).toString().replace('.',','));   

 

} 







function readCookie(name) {



  var nameEQ = name + "="; 

  var ca = document.cookie.split(';');



  for(var i=0;i < ca.length;i++) {



    var c = ca[i];

    while (c.charAt(0)==' ') c = c.substring(1,c.length);

    if (c.indexOf(nameEQ) == 0) {

      return decodeURIComponent( c.substring(nameEQ.length,c.length) );

    }



  }



  return null;



}







function pontotales3(){

//alert('ENTRE');	

	

//var precio = $('input#PRECIO').val();

var cantidad=$('#CANTIDAD').val();

var iva=$('input#IMPIVA');

var isr=$('input#IMPISR');

var preciopub=$('input#PRECIOPUB.form-control').val();	

var descuento=$('input#DESCUENTO');		

var preventa=$('input#PREVENTA');

var importe=$('input#IMPORTE');	
var csubtotal=$('input#IMPSUBTOTAL');	

var total=$('input#TOTAL');	

var tipoventa = $('input#TIPOIVA').val();

	

		//preciopub.VAL(2333);

	

//alert(preciopub.val());	

if( tipoventa === 'menos') {

    

    

    // Creamos una cookie

//document.cookie = "pais=" + encodeURIComponent( "Uruguay" );



// Leemos la cookie

var miCookie = readCookie( "REGIMENCLIENTE" );

//var miCookie2 = readCookie( "APLICARIRS" );

// Muestra "Uruguay"

//alert($('#PRECIOPUB').val() );

    

    

	//alert(miCookie);

//(state != 10) || (state != 15)

	if( (miCookie == '601')  || (miCookie == '603') || (miCookie == '623') || (miCookie == '624') || (miCookie == '622') || (miCookie == '626') ){

//alert(miCookie);

    	importe.val( round2 ($('#PRECIOPUB').val() * 0.871459695 	,2 )	);

    	iva.val(  round2( importe.val() * .16 ) ,2);

    	isr.val( round2( importe.val() *.01250000 ,2) );
		
        csubtotal.val( Number(importe.val() ) +  Number(iva.val())   );
    	
		preventa.val(importe.val());
    	total.val( Number(csubtotal.val())  - Number(isr.val()) );
		

    //	preciopub.val(importe.val());

    	//alert( preventa.val());

	}else{


		total.val(round2(cantidad*preciopub));
		importe.val(round2(total.val()/1.16));
		
		iva.val( round2(total.val() - importe.val()));
		preventa.val(importe.val());
		preciopub.val(importe.val());
		//alert( preventa.val());
    	isr.val( '0' );
		csubtotal.val( round2(total.val()/1.16)   );



    //	preciopub.val(importe.val());

    	//alert( preventa.val());	    

	}

}	

if(tipoventa === 'mas') {

    

    importe.val(round2(cantidad*preciopub));

	total.val(round2(importe.val()*1.16));

	iva.val( round2(total.val() - importe.val() ));

		isr.val( round2(total.val()/1.012500) );

}

if(tipoventa === 'cero') {

	   // preciopub.val(precio);

	//preventa.val(preciopub.val()); 

importe.val(round2(cantidad*preciopub));

	total.val(round2(cantidad*preciopub));

	iva.val(0);

		isr.val( round2(total.val()/1.012500) );

}	

	





  

}





function delconcepto(id){

	

    param="id="+id;

    alert(param);



mostrar("delconcepto.php",param,'LISTACONCEPTOS');	

}


function writeCookie(name,value,days) {
	if (days) {
	  var date = new Date();
	  date.setTime(date.getTime()+(days*24*60*60*1000));
	  var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
  }

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

//$('div#FRMCLAVESAACTIVAR button.btn.dropdown-toggle.btn-default').attr('title')

function addfacturanew(){



param="tablaped=0,'"+ document.getElementById('ID_CLIENTE').value
	+ "','" + round2( getCookie('TOTIMPORTE') )
+ "','" + round2( getCookie('TOTIVA') )
+ "','" + getCookie('TOTSUBTOTAL')  + "','" 
+ round2(getCookie('TOTISR') ) + "','" 
+ round2( getCookie('TOTTOTAL') ) + "','" 
+ document.getElementById('SUCURSAL').value + "','" 
+  FECMYSQL(document.getElementById('FECHA').value) + "','" + document.getElementById('FOLIO').value + "','" + document.getElementById('TASAIVA').value

+ "','" + parent.document.getElementById('CMBMETODODEPAGO').value + "','" + parent.document.getElementById('CMBFRMPAGO').value 

+ "','" + document.getElementById('MONEDA').value + "','" + document.getElementById('TIPODECOMPROBANTE').value 

+ "','" + document.getElementById('LUGAREXPEDICION').value + "','" + document.getElementById('CONDICIONESPAGO').value  + "','" + document.getElementById('NUMCUENTAPAGO').value  + "','" + document.getElementById('REGIMEN').innerHTML

+ "','" + round2(document.getElementById('IVA').value)  + "','" + "IVA"

+ "','" + document.getElementById('TASAIVA').value + "','" + round2(document.getElementById('IVA').value)

+ "'&ID_CLIENTE="+document.getElementById('ID_CLIENTE').value + "&FOLIO="+document.getElementById('FOLIO').value +

	"&PEDIDO="+document.getElementById('PEDIDO').value +

	"&SUCURSAL="+document.getElementById('SUCURSAL').value +

	"&GTOTAL="+document.getElementById('TOTAL').value +

	"&RELACIONADOS="+document.getElementById('RELACIONADOS').value +

"&TIPORELACION="+ parent.document.getElementById('CMBCFDIRELACIONADOS').value +

"&USOCFDI="+ parent.document.getElementById('CMBUSOCFDI').value;

alert(param);

	//throw new Error("ERROR");

//var objajax=null;

//cargaget("CONTENIDO","addfactura.php",param,objajax);

	

		$.ajax({

				type: "GET",

				url: "addfactura.php",

				data: param,

					beforeSend: function () {

						//alert('bodyyyy');

							//$('*').find('#conceptos').html("Procesando, espere por favor...");

							$('*').find('#conceptos').html("<h1 class='rounded jumbotron bg-info'>Procesando, espere por favor...<h1>");

					},

					success:  function(result){

								$('*').find('#conceptos').html(result);

						},

					  error: function (xhr, ajaxOptions, thrownError) {

						alert(xhr.status);

						alert(thrownError);

					  }					

			});	

//mostrar('addfactura.php',param,'CONTENIDO');

}



function FECMYSQL(micadena){

    //var micadena=filtro;

	var miarray=micadena.split("/");

	var mivar0=miarray[0];

	var mivar1=miarray[1];

	var mivar2=miarray[2];	

	//alert("var2;"+mivar2+"var1;"+mivar1+"var0;"+mivar0);

	return 	""+mivar2+"-"+mivar1+"-"+mivar0;



}