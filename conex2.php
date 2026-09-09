<?php


function conectarse($DB)
{

$servidor="localhost";
$user="root";
$pass="checo2100";


$connect_myconn = "CONEXION DB";	
$hostname_myconn = "109.106.251.99";
$database_myconn = "abast115_sxoxo";
$username_myconn = "abast115_super";
$password_myconn = "checo2100";	

$connect_myconn = "CONEXION DB";	
$hostname_myconn = "localhost";
$database_myconn = "huamuches";
$username_myconn = "root";
$password_myconn = "";	


   if (!($link=mysql_connect($servidor,$user,$pass)))



   {



      echo "Error conectando a la base de datos.";



      exit();



   }







   if (!mysql_select_db('tr_vladimir',$link))



   {



      $msje="Error seleccionando la base de datos.".$DB;



      echo $msje;



	 



      exit();



   }







   return $link;



}



?>