<?php   
require_once('frmencabezado40.php');
require_once('plugin/lasclases.php');
require_once('plugin/modoro.php');

 ?>

<style type="text/css">
.sidebar {

padding: 0px;
}    

</style>
<body>
    <div id="app">
        <div id="sidebar" class="active">
            <div class="sidebar-wrapper active">
<!--                 <div class="sidebar-header p-0">
                    <div class="d-flex p-0">
                        <div class="logo">
                            <img src="assets/images/logo/logoww.png" alt="" class='display-5' srcset="">
                        </div>
                        <div class="toggler p-0">
                            <a href="#" class="sidebar-hide d-xl-none d-block"><i class="bi bi-x bi-middle"></i></a>
                        </div>
                    </div>
                </div> -->
                <div class="sidebar-menu p-0 pt-5" style="margin-top:-25px;">
                    <ul class="menu">
                        <li class="sidebar-title text-primary bg-primary text-white rounded pb-2 pt-2"> <strong> Listas o Catalogos   </strong> </li>

                        <li class="sidebar-item">
                            <a href="javascript:mostrar('cpframe.php','','div#page-content');" class='sidebar-link'>
                                <i class="bi bi-person"></i>
                                <span>Clientes</span>
                            </a>
                        </li>
                        <li class="sidebar-item" style="margin-top:-10px;">
                            <a href="javascript:mostrar('cpframe2.php','','div#page-content');" class='sidebar-link'>
                                <i class="bi bi-list"></i>
                                <span>Facturas</span>
                            </a>
                        </li>                        
                        <li class="sidebar-item  " style="margin-top:-10px;">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-basket-fill"></i>
                                <span>Productos</span>
                            </a>
                        </li>
                        <li class="sidebar-item  " style="margin-top:-10px;">
                             <a href="javascript:var mv = window.open('cmbunidadesaactivar.php', '_blank');location.reload();" class='sidebar-link'>
                                <i class="bi bi-wallet"></i>
                                <span>Unidades</span>
                            </a>
                        </li> 
                        <li class="sidebar-item  " style="margin-top:-10px;">
                            <a href="javascript:var mv = window.open('cmbclavesaactivar.php?cveabuscar=ACEITE', '_blank');location.reload();" class='sidebar-link'>
                                <i class="bi bi-grid-1x2-fill"></i>
                                <span>Claves</span>
                            </a>
                        </li>


                        <li class="sidebar-title text-primary bg-primary text-white rounded pb-2 pt-2"> <strong> Operaciones   </strong> </li>

          <!--               <li class="sidebar-item  " style="margin-top:-10px;">
                            <a href="index.html" class='sidebar-link'>
                                <i class="bi bi-person"></i>
                                <span>Agregar Factura</span>
                            </a> mostrar('reporte.php','','div#body2'); });
                        </li> -->
                        <li class="sidebar-item  " style="margin-top:-10px;">
                            <a href="javascript:var mv = window.open('reporte.php', '_blank');location.reload();" class='sidebar-link'>
                                <i class="bi bi-folder"></i>
                                <span>Reportes</span>
                            </a>
                        </li>                        
                        <li class="sidebar-item  " style="margin-top:-10px;">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-gear"></i>
                                <span>Configuracion</span>
                            </a>
                        </li>
<!--                            <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-stack"></i>
                                <span>Catalogos</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="component-alert.html">Clientes</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="component-badge.html">Claves</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="component-breadcrumb.html">Unidades</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="component-button.html">Productos</a>
                                </li>
                            </ul>
                        </li>

                     <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-collection-fill"></i>
                                <span>Extra Components</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="extra-component-avatar.html">Avatar</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="extra-component-sweetalert.html">Sweet Alert</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="extra-component-toastify.html">Toastify</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="extra-component-rating.html">Rating</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="extra-component-divider.html">Divider</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item active has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-grid-1x2-fill"></i>
                                <span>Layouts</span>
                            </a>
                            <ul class="submenu active">
                                <li class="submenu-item ">
                                    <a href="layout-default.html">Default Layout</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="layout-vertical-1-column.html">1 Column</a>
                                </li>
                                <li class="submenu-item active">
                                    <a href="layout-vertical-navbar.html">Vertical with Navbar</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="layout-horizontal.html">Horizontal Menu</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-title">Forms &amp; Tables</li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-hexagon-fill"></i>
                                <span>Form Elements</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="form-element-input.html">Input</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-element-input-group.html">Input Group</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-element-select.html">Select</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-element-radio.html">Radio</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-element-checkbox.html">Checkbox</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-element-textarea.html">Textarea</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="form-layout.html" class='sidebar-link'>
                                <i class="bi bi-file-earmark-medical-fill"></i>
                                <span>Form Layout</span>
                            </a>
                        </li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-pen-fill"></i>
                                <span>Form Editor</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="form-editor-quill.html">Quill</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-editor-ckeditor.html">CKEditor</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-editor-summernote.html">Summernote</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="form-editor-tinymce.html">TinyMCE</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="table.html" class='sidebar-link'>
                                <i class="bi bi-grid-1x2-fill"></i>
                                <span>Table</span>
                            </a>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="table-datatable.html" class='sidebar-link'>
                                <i class="bi bi-file-earmark-spreadsheet-fill"></i>
                                <span>Datatable</span>
                            </a>
                        </li>

                        <li class="sidebar-title">Extra UI</li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-pentagon-fill"></i>
                                <span>Widgets</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="ui-widgets-chatbox.html">Chatbox</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="ui-widgets-pricing.html">Pricing</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="ui-widgets-todolist.html">To-do List</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-egg-fill"></i>
                                <span>Icons</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="ui-icons-bootstrap-icons.html">Bootstrap Icons </a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="ui-icons-fontawesome.html">Fontawesome</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="ui-icons-dripicons.html">Dripicons</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-bar-chart-fill"></i>
                                <span>Charts</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="ui-chart-chartjs.html">ChartJS</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="ui-chart-apexcharts.html">Apexcharts</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="ui-file-uploader.html" class='sidebar-link'>
                                <i class="bi bi-cloud-arrow-up-fill"></i>
                                <span>File Uploader</span>
                            </a>
                        </li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-map-fill"></i>
                                <span>Maps</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="ui-map-google-map.html">Google Map</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="ui-map-jsvectormap.html">JS Vector Map</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-title">Pages</li>

                        <li class="sidebar-item  ">
                            <a href="application-email.html" class='sidebar-link'>
                                <i class="bi bi-envelope-fill"></i>
                                <span>Email Application</span>
                            </a>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="application-chat.html" class='sidebar-link'>
                                <i class="bi bi-chat-dots-fill"></i>
                                <span>Chat Application</span>
                            </a>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="application-gallery.html" class='sidebar-link'>
                                <i class="bi bi-image-fill"></i>
                                <span>Photo Gallery</span>
                            </a>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="application-checkout.html" class='sidebar-link'>
                                <i class="bi bi-basket-fill"></i>
                                <span>Checkout Page</span>
                            </a>
                        </li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-person-badge-fill"></i>
                                <span>Authentication</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="auth-login.html">Login</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="auth-register.html">Register</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="auth-forgot-password.html">Forgot Password</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-item  has-sub">
                            <a href="#" class='sidebar-link'>
                                <i class="bi bi-x-octagon-fill"></i>
                                <span>Errors</span>
                            </a>
                            <ul class="submenu ">
                                <li class="submenu-item ">
                                    <a href="error-403.html">403</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="error-404.html">404</a>
                                </li>
                                <li class="submenu-item ">
                                    <a href="error-500.html">500</a>
                                </li>
                            </ul>
                        </li>

                        <li class="sidebar-title">Raise Support</li>

                        <li class="sidebar-item  ">
                            <a href="https://zuramai.github.io/mazer/docs" class='sidebar-link'>
                                <i class="bi bi-life-preserver"></i>
                                <span>Documentation</span>
                            </a>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="https://github.com/zuramai/mazer/blob/main/CONTRIBUTING.md" class='sidebar-link'>
                                <i class="bi bi-puzzle"></i>
                                <span>Contribute</span>
                            </a>
                        </li>

                        <li class="sidebar-item  ">
                            <a href="https://github.com/zuramai/mazer#donate" class='sidebar-link'>
                                <i class="bi bi-cash"></i>
                                <span>Donate</span>
                            </a>
                        </li>
 -->
                    </ul>
                </div>
            <div class="sidebar-header border border-primary rounded-0">
                    <div class="d-flex">
                        <div class="logo">
                            <img src="assets/images/logo/logo.png" alt="" class='display-5' srcset="">
                        </div>
                        <div class="toggler">
                            <a href="#" class="sidebar-hide d-xl-none d-block"><i class="bi bi-x bi-middle"></i></a>
                        </div>
                    </div>
                </div> 



                <button class="sidebar-toggler btn x"><i data-feather="x"></i></button>
            </div>
        </div>
        <div id="main" class='layout-navbar'>
            <header class='mb-3'>
                <nav class="navbar navbar-expand navbar-light ">
                    <div class="container-fluid">
                        <a href="#" class="burger-btn d-block" style='z-index:900000; top:-10px !important;'>
                            <i class="bi bi-justify fs-3"></i>
                        </a>

                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li class="nav-item dropdown me-1">
                                    <a class="nav-link active dropdown-toggle" href="#" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        <!-- <i class='bi bi-envelope bi-sub fs-4 text-gray-600'></i> -->
                                        <h3> <span class="badge bg-danger text-white"> Cfdi Ver. 4.0</span>  </h3>
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                        <li>
                                            <h6 class="dropdown-header">Mail</h6>
                                        </li>
                                        <li><a class="dropdown-item" href="#">No new mail</a></li>
                                    </ul>
                                </li>
                                <li class="nav-item dropdown me-3">
                                    <a class="nav-link active dropdown-toggle" href="#" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        <i class='bi bi-bell bi-sub fs-4 text-gray-600'></i>
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                        <li>
                                            <h6 class="dropdown-header">Timbres</h6>
                                        </li>
                                        <li><a class="dropdown-item">No disponible temporalmente</a></li>
                                    </ul>
                                </li>
                            </ul>
                            <div class="dropdown">
                                <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                    <div class="user-menu d-flex">
                                        <div class="user-name text-end me-3">
                                            <h6 class="mb-0 text-gray-600">Admin</h6>
                                            <p class="mb-0 text-sm text-gray-600">Administrator</p>
                                        </div>
                                        <div class="user-img d-flex align-items-center">
                                            <div class="avatar avatar-md">
                                                <img src="assets/images/faces/1.jpg">
                                            </div>
                                        </div>
                                    </div>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                    <li>
                                        <h6 class="dropdown-header">Hola, Administrador!</h6>
                                    </li>
                                    <li><a class="dropdown-item" href="#"><i class="icon-mid bi bi-person me-2"></i> Mi
                                            Perfil</a></li>
                                    <li><a class="dropdown-item" href="#"><i class="icon-mid bi bi-gear me-2"></i>
                                            Configurar</a></li>
                                    <li><a class="dropdown-item" href="#"><i class="icon-mid bi bi-wallet me-2"></i>
                                            Soporte Tecnico</a></li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li><a class="dropdown-item text-Salir" onclick="open('', '_self').close();" href="#"><i
                                                class="icon-mid bi bi-box-arrow-left me-2 text-Salir"></i> Salir</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <div id="main-content" class="" style="margin-top:-60px;">

                <div class="page-heading">
                    <div class="page-title">
                        <div class="row">
<!--                             <div class="col-12 col-md-6 order-md-1 order-last">
                                <h3>Bienvenido al modulo de Facturacion Electronica</h3>
                                <p class="text-subtitle text-muted">Navbar will appear in top of the page.</p>
                            </div>
                            <div class="col-12 col-md-6 order-md-2 order-first">
                                <nav aria-label="breadcrumb" class="breadcrumb-header float-start float-lg-end">
                                    <ol class="breadcrumb">
                                        <li class="breadcrumb-item"><a href="index.html">Inicio</a></li>
                                        <li class="breadcrumb-item active" aria-current="page">Principal
                                        </li>
                                    </ol>
                                </nav>
                            </div> -->

<div id="page-content" class="page-content" >
                <section class="row" >
                    <div class="col-12 col-lg-12">
                        <div class="row" style="display: none;">
                            <div class="col-6 col-lg-3 col-md-6">
                                <div class="card">
                                    <div class="card-body px-3 py-4-5">
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="stats-icon purple">
                                                    <i class="iconly-boldShow"></i>
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <h6 class="text-muted font-semibold">Facturas</h6>
                                                <h6 class="font-extrabold mb-0">1,000</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-3 col-md-6">
                                <div class="card">
                                    <div class="card-body px-3 py-4-5">
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="stats-icon blue">
                                                    <i class="iconly-boldProfile"></i>
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <h6 class="text-muted font-semibold">Reportes</h6>
                                                <h6 class="font-extrabold mb-0">.</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-3 col-md-6">
                                <div class="card">
                                    <div class="card-body px-3 py-4-5">
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="stats-icon green">
                                                    <i class="iconly-boldAdd-User"></i>
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <h6 class="text-muted font-semibold">Clientes</h6>
                                                <h6 class="font-extrabold mb-0">190</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-3 col-md-6">
                                <div class="card">
                                    <div class="card-body px-3 py-4-5">
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="stats-icon red">
                                                    <i class="iconly-boldBookmark"></i>
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <h6 class="text-muted font-semibold">Timbres</h6>
                                                <h6 class="font-extrabold mb-0">Ilimitado</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row" style="margin-top:0px;">
<div class="col-12 col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center">
                            <div class="card w-75">
                              <!--   <div class="card-header">
                                    <h4>Slides only</h4>
                                    <p>A carousel without slide control</p>
                                </div> -->
                                <div class="card-body">
                                    <div id="carouselExampleSlidesOnly" class="carousel slide w-100" data-bs-ride="carousel">
                                        <div class="carousel-inner">
                                            <div class="carousel-item active">
                                                <img src="assets/images/samples/architecture0.jpg" class="d-block w-100" alt="...">
                                            </div>
                                            <div class="carousel-item">
                                                <img src="assets/images/samples/architecture1.jpg" class="d-block w-100" alt="...">
                                            </div>
                                            <div class="carousel-item">
                                                <img src="assets/images/samples/architecture5.jpg" class="d-block w-100" alt="...">
                                            </div>                                            
                                        </div>
                                    </div>
                                </div>
                            </div>

<!--                             <div class="card">
                                <div class="card-header">
                                    <h4>With Captions</h4>
                                    <p>A carousel with captions over the top</p>
                                </div>
                                <div class="card-body">
                                    <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel">
                                        <ol class="carousel-indicators">
                                            <li data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" class=""></li>
                                            <li data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" class="active"></li>
                                            <li data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2"></li>
                                        </ol>
                                        <div class="carousel-inner">
                                            <div class="carousel-item">
                                                <img src="assets/images/samples/1.png" class="d-block w-100" alt="...">
                                                <div class="carousel-caption d-none d-md-block">
                                                    <h5>First slide label</h5>
                                                    <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                                                </div>
                                            </div>
                                            <div class="carousel-item active">
                                                <img src="assets/images/samples/2.png" class="d-block w-100" alt="...">
                                                <div class="carousel-caption d-none d-md-block">
                                                    <h5>Second slide label</h5>
                                                    <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <a class="carousel-control-prev" href="#carouselExampleCaptions" role="button" data-bs-slide="prev">
                                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span class="visually-hidden">Previous</span>
                                        </a>
                                        <a class="carousel-control-next" href="#carouselExampleCaptions" role="button" data-bs-slide="next">
                                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span class="visually-hidden">Next</span>
                                        </a>
                                    </div>
                                </div>
                            </div> -->
                        </div>




                        </div>
<!--                         <div class="row" >
                            <div class="col-12 col-xl-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h4>Profile Visit</h4>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="d-flex align-items-center">
                                                    <svg class="bi text-primary" width="32" height="32" fill="blue" style="width:10px">
                                                        <use xlink:href="assets/vendors/bootstrap-icons/bootstrap-icons.svg#circle-fill"></use>
                                                    </svg>
                                                    <h5 class="mb-0 ms-3">Europe</h5>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <h5 class="mb-0">862</h5>
                                            </div>
                                            <div class="col-12" style="position: relative;">
                                                <div id="chart-europe" style="min-height: 95px;"><div id="apexchartspoluaw7lh" class="apexcharts-canvas apexchartspoluaw7lh apexcharts-theme-light" style="width: 159px; height: 80px;"><svg id="SvgjsSvg1408" width="159" height="80" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" class="apexcharts-svg apexcharts-zoomable" xmlns:data="ApexChartsNS" transform="translate(0, 0)" style="background: transparent none repeat scroll 0% 0%;"><g id="SvgjsG1410" class="apexcharts-inner apexcharts-graphical" transform="translate(22, 30)"><defs id="SvgjsDefs1409"><clipPath id="gridRectMaskpoluaw7lh"><rect id="SvgjsRect1420" width="133" height="37" x="-3" y="-1" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fff"></rect></clipPath><clipPath id="gridRectMarkerMaskpoluaw7lh"><rect id="SvgjsRect1421" width="131" height="39" x="-2" y="-2" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fff"></rect></clipPath><linearGradient id="SvgjsLinearGradient1426" x1="0" y1="0" x2="0" y2="1"><stop id="SvgjsStop1427" stop-opacity="0.65" stop-color="rgba(83,80,233,0.65)" offset="0"></stop><stop id="SvgjsStop1428" stop-opacity="0.5" stop-color="rgba(169,168,244,0.5)" offset="1"></stop><stop id="SvgjsStop1429" stop-opacity="0.5" stop-color="rgba(169,168,244,0.5)" offset="1"></stop></linearGradient></defs><line id="SvgjsLine1417" x1="0" y1="0" x2="0" y2="28" stroke="#b6b6b6" stroke-dasharray="3" class="apexcharts-xcrosshairs" x="0" y="0" width="1" height="28" fill="#b1b9c4" filter="none" fill-opacity="0.9" stroke-width="1"></line><g id="SvgjsG1432" class="apexcharts-xaxis" transform="translate(0, 0)"><g id="SvgjsG1433" class="apexcharts-xaxis-texts-g" transform="translate(0, -4)"></g></g><g id="SvgjsG1439" class="apexcharts-grid"><g id="SvgjsG1440" class="apexcharts-gridlines-horizontal" style="display: none;"><line id="SvgjsLine1442" x1="0" y1="0" x2="127" y2="0" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1443" x1="0" y1="5" x2="127" y2="5" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1444" x1="0" y1="10" x2="127" y2="10" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1445" x1="0" y1="15" x2="127" y2="15" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1446" x1="0" y1="20" x2="127" y2="20" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1447" x1="0" y1="25" x2="127" y2="25" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1448" x1="0" y1="30" x2="127" y2="30" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1449" x1="0" y1="35" x2="127" y2="35" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line></g><g id="SvgjsG1441" class="apexcharts-gridlines-vertical" style="display: none;"></g><line id="SvgjsLine1451" x1="0" y1="35" x2="127" y2="35" stroke="transparent" stroke-dasharray="0"></line><line id="SvgjsLine1450" x1="0" y1="1" x2="0" y2="35" stroke="transparent" stroke-dasharray="0"></line></g><g id="SvgjsG1422" class="apexcharts-area-series apexcharts-plot-series"><g id="SvgjsG1423" class="apexcharts-series" seriesName="series1" data:longestSeries="true" rel="1" data:realIndex="0"><path id="SvgjsPath1430" d="M 0 35L 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75C 127 14.75 127 14.75 127 35M 127 14.75z" fill="url(#SvgjsLinearGradient1426)" fill-opacity="1" stroke-opacity="1" stroke-linecap="butt" stroke-width="0" stroke-dasharray="0" class="apexcharts-area" index="0" clip-path="url(#gridRectMaskpoluaw7lh)" pathTo="M 0 35L 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75C 127 14.75 127 14.75 127 35M 127 14.75z" pathFrom="M -1 45L -1 45L 16.565217391304348 45L 27.608695652173914 45L 38.65217391304348 45L 49.69565217391305 45L 60.73913043478261 45L 71.78260869565217 45L 82.82608695652173 45L 93.86956521739131 45L 104.91304347826087 45L 115.95652173913044 45L 127 45"></path><path id="SvgjsPath1431" d="M 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75" fill="none" fill-opacity="1" stroke="#5350e9" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-area" index="0" clip-path="url(#gridRectMaskpoluaw7lh)" pathTo="M 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75" pathFrom="M -1 45L -1 45L 16.565217391304348 45L 27.608695652173914 45L 38.65217391304348 45L 49.69565217391305 45L 60.73913043478261 45L 71.78260869565217 45L 82.82608695652173 45L 93.86956521739131 45L 104.91304347826087 45L 115.95652173913044 45L 127 45"></path><g id="SvgjsG1424" class="apexcharts-series-markers-wrap" data:realIndex="0"><g class="apexcharts-series-markers"><circle id="SvgjsCircle1457" r="0" cx="0" cy="0" class="apexcharts-marker wztvk9dz8 no-pointer-events" stroke="#ffffff" fill="#5350e9" fill-opacity="1" stroke-width="2" stroke-opacity="0.9" default-marker-size="0"></circle></g></g></g><g id="SvgjsG1425" class="apexcharts-datalabels" data:realIndex="0"></g></g><line id="SvgjsLine1452" x1="0" y1="0" x2="127" y2="0" stroke="#b6b6b6" stroke-dasharray="0" stroke-width="1" class="apexcharts-ycrosshairs"></line><line id="SvgjsLine1453" x1="0" y1="0" x2="127" y2="0" stroke-dasharray="0" stroke-width="0" class="apexcharts-ycrosshairs-hidden"></line><g id="SvgjsG1454" class="apexcharts-yaxis-annotations"></g><g id="SvgjsG1455" class="apexcharts-xaxis-annotations"></g><g id="SvgjsG1456" class="apexcharts-point-annotations"></g><rect id="SvgjsRect1458" width="0" height="0" x="0" y="0" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fefefe" class="apexcharts-zoom-rect"></rect><rect id="SvgjsRect1459" width="0" height="0" x="0" y="0" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fefefe" class="apexcharts-selection-rect"></rect></g><rect id="SvgjsRect1416" width="0" height="0" x="0" y="0" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fefefe"></rect><g id="SvgjsG1437" class="apexcharts-yaxis" rel="0" transform="translate(-8, 0)"><g id="SvgjsG1438" class="apexcharts-yaxis-texts-g"></g></g><g id="SvgjsG1411" class="apexcharts-annotations"></g></svg><div class="apexcharts-legend" style="max-height: 40px;"></div><div class="apexcharts-tooltip apexcharts-theme-light"><div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;"></div><div class="apexcharts-tooltip-series-group" style="order: 1;"><span class="apexcharts-tooltip-marker" style="background-color: rgb(83, 80, 233);"></span><div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;"><div class="apexcharts-tooltip-y-group"><span class="apexcharts-tooltip-text-label"></span><span class="apexcharts-tooltip-text-value"></span></div><div class="apexcharts-tooltip-z-group"><span class="apexcharts-tooltip-text-z-label"></span><span class="apexcharts-tooltip-text-z-value"></span></div></div></div></div><div class="apexcharts-xaxistooltip apexcharts-xaxistooltip-bottom apexcharts-theme-light"><div class="apexcharts-xaxistooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;"></div></div><div class="apexcharts-yaxistooltip apexcharts-yaxistooltip-0 apexcharts-yaxistooltip-left apexcharts-theme-light"><div class="apexcharts-yaxistooltip-text"></div></div></div></div>
                                            <div class="resize-triggers"><div class="expand-trigger"><div style="width: 184px; height: 96px;"></div></div><div class="contract-trigger"></div></div></div>
                                        </div>
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="d-flex align-items-center">
                                                    <svg class="bi text-success" width="32" height="32" fill="blue" style="width:10px">
                                                        <use xlink:href="assets/vendors/bootstrap-icons/bootstrap-icons.svg#circle-fill"></use>
                                                    </svg>
                                                    <h5 class="mb-0 ms-3">America</h5>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <h5 class="mb-0">375</h5>
                                            </div>
                                            <div class="col-12" style="position: relative;">
                                                <div id="chart-america" style="min-height: 95px;"><div id="apexchartsa9itingf" class="apexcharts-canvas apexchartsa9itingf apexcharts-theme-light" style="width: 159px; height: 80px;"><svg id="SvgjsSvg1355" width="159" height="80" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" class="apexcharts-svg apexcharts-zoomable" xmlns:data="ApexChartsNS" transform="translate(0, 0)" style="background: transparent none repeat scroll 0% 0%;"><g id="SvgjsG1357" class="apexcharts-inner apexcharts-graphical" transform="translate(22, 30)"><defs id="SvgjsDefs1356"><clipPath id="gridRectMaska9itingf"><rect id="SvgjsRect1367" width="133" height="37" x="-3" y="-1" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fff"></rect></clipPath><clipPath id="gridRectMarkerMaska9itingf"><rect id="SvgjsRect1368" width="131" height="39" x="-2" y="-2" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fff"></rect></clipPath><linearGradient id="SvgjsLinearGradient1373" x1="0" y1="0" x2="0" y2="1"><stop id="SvgjsStop1374" stop-opacity="0.65" stop-color="rgba(0,139,117,0.65)" offset="0"></stop><stop id="SvgjsStop1375" stop-opacity="0.5" stop-color="rgba(128,197,186,0.5)" offset="1"></stop><stop id="SvgjsStop1376" stop-opacity="0.5" stop-color="rgba(128,197,186,0.5)" offset="1"></stop></linearGradient></defs><line id="SvgjsLine1364" x1="0" y1="0" x2="0" y2="28" stroke="#b6b6b6" stroke-dasharray="3" class="apexcharts-xcrosshairs" x="0" y="0" width="1" height="28" fill="#b1b9c4" filter="none" fill-opacity="0.9" stroke-width="1"></line><g id="SvgjsG1379" class="apexcharts-xaxis" transform="translate(0, 0)"><g id="SvgjsG1380" class="apexcharts-xaxis-texts-g" transform="translate(0, -4)"></g></g><g id="SvgjsG1386" class="apexcharts-grid"><g id="SvgjsG1387" class="apexcharts-gridlines-horizontal" style="display: none;"><line id="SvgjsLine1389" x1="0" y1="0" x2="127" y2="0" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1390" x1="0" y1="5" x2="127" y2="5" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1391" x1="0" y1="10" x2="127" y2="10" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1392" x1="0" y1="15" x2="127" y2="15" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1393" x1="0" y1="20" x2="127" y2="20" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1394" x1="0" y1="25" x2="127" y2="25" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1395" x1="0" y1="30" x2="127" y2="30" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line><line id="SvgjsLine1396" x1="0" y1="35" x2="127" y2="35" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-gridline"></line></g><g id="SvgjsG1388" class="apexcharts-gridlines-vertical" style="display: none;"></g><line id="SvgjsLine1398" x1="0" y1="35" x2="127" y2="35" stroke="transparent" stroke-dasharray="0"></line><line id="SvgjsLine1397" x1="0" y1="1" x2="0" y2="35" stroke="transparent" stroke-dasharray="0"></line></g><g id="SvgjsG1369" class="apexcharts-area-series apexcharts-plot-series"><g id="SvgjsG1370" class="apexcharts-series" seriesName="series1" data:longestSeries="true" rel="1" data:realIndex="0"><path id="SvgjsPath1377" d="M 0 35L 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75C 127 14.75 127 14.75 127 35M 127 14.75z" fill="url(#SvgjsLinearGradient1373)" fill-opacity="1" stroke-opacity="1" stroke-linecap="butt" stroke-width="0" stroke-dasharray="0" class="apexcharts-area" index="0" clip-path="url(#gridRectMaska9itingf)" pathTo="M 0 35L 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75C 127 14.75 127 14.75 127 35M 127 14.75z" pathFrom="M -1 45L -1 45L 16.565217391304348 45L 27.608695652173914 45L 38.65217391304348 45L 49.69565217391305 45L 60.73913043478261 45L 71.78260869565217 45L 82.82608695652173 45L 93.86956521739131 45L 104.91304347826087 45L 115.95652173913044 45L 127 45"></path><path id="SvgjsPath1378" d="M 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75" fill="none" fill-opacity="1" stroke="#008b75" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-area" index="0" clip-path="url(#gridRectMaska9itingf)" pathTo="M 0 29.5C 5.797826086956522 29.5 10.767391304347825 5 16.565217391304348 5C 20.430434782608696 5 23.743478260869566 15 27.608695652173914 15C 31.473913043478262 15 34.78695652173913 23.5 38.65217391304348 23.5C 42.517391304347825 23.5 45.8304347826087 18 49.69565217391305 18C 53.560869565217395 18 56.87391304347826 28 60.73913043478261 28C 64.60434782608695 28 67.91739130434783 14.75 71.78260869565217 14.75C 75.64782608695651 14.75 78.9608695652174 4.75 82.82608695652173 4.75C 86.69130434782609 4.75 90.00434782608696 23.5 93.86956521739131 23.5C 97.73478260869565 23.5 101.04782608695653 18 104.91304347826087 18C 108.77826086956522 18 112.0913043478261 28 115.95652173913044 28C 119.82173913043478 28 123.13478260869566 14.75 127 14.75" pathFrom="M -1 45L -1 45L 16.565217391304348 45L 27.608695652173914 45L 38.65217391304348 45L 49.69565217391305 45L 60.73913043478261 45L 71.78260869565217 45L 82.82608695652173 45L 93.86956521739131 45L 104.91304347826087 45L 115.95652173913044 45L 127 45"></path><g id="SvgjsG1371" class="apexcharts-series-markers-wrap" data:realIndex="0"><g class="apexcharts-series-markers"><circle id="SvgjsCircle1404" r="0" cx="0" cy="0" class="apexcharts-marker wqos74mpa no-pointer-events" stroke="#ffffff" fill="#008b75" fill-opacity="1" stroke-width="2" stroke-opacity="0.9" default-marker-size="0"></circle></g></g></g><g id="SvgjsG1372" class="apexcharts-datalabels" data:realIndex="0"></g></g><line id="SvgjsLine1399" x1="0" y1="0" x2="127" y2="0" stroke="#b6b6b6" stroke-dasharray="0" stroke-width="1" class="apexcharts-ycrosshairs"></line><line id="SvgjsLine1400" x1="0" y1="0" x2="127" y2="0" stroke-dasharray="0" stroke-width="0" class="apexcharts-ycrosshairs-hidden"></line><g id="SvgjsG1401" class="apexcharts-yaxis-annotations"></g><g id="SvgjsG1402" class="apexcharts-xaxis-annotations"></g><g id="SvgjsG1403" class="apexcharts-point-annotations"></g><rect id="SvgjsRect1405" width="0" height="0" x="0" y="0" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fefefe" class="apexcharts-zoom-rect"></rect><rect id="SvgjsRect1406" width="0" height="0" x="0" y="0" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fefefe" class="apexcharts-selection-rect"></rect></g><rect id="SvgjsRect1363" width="0" height="0" x="0" y="0" rx="0" ry="0" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0" fill="#fefefe"></rect><g id="SvgjsG1384" class="apexcharts-yaxis" rel="0" transform="translate(-8, 0)"><g id="SvgjsG1385" class="apexcharts-yaxis-texts-g"></g></g><g id="SvgjsG1358" class="apexcharts-annotations"></g></svg><div class="apexcharts-legend" style="max-height: 40px;"></div><div class="apexcharts-tooltip apexcharts-theme-light"><div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;"></div><div class="apexcharts-tooltip-series-group" style="order: 1;"><span class="apexcharts-tooltip-marker" style="background-color: rgb(0, 139, 117);"></span><div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;"><div class="apexcharts-tooltip-y-group"><span class="apexcharts-tooltip-text-label"></span><span class="apexcharts-tooltip-text-value"></span></div><div class="apexcharts-tooltip-z-group"><span class="apexcharts-tooltip-text-z-label"></span><span class="apexcharts-tooltip-text-z-value"></span></div></div></div></div><div class="apexcharts-xaxistooltip apexcharts-xaxistooltip-bottom apexcharts-theme-light"><div class="apexcharts-xaxistooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;"></div></div><div class="apexcharts-yaxistooltip apexcharts-yaxistooltip-0 apexcharts-yaxistooltip-left apexcharts-theme-light"><div class="apexcharts-yaxistooltip-text"></div></div></div></div>
                                            <div class="resize-triggers"><div class="expand-trigger"><div style="width: 184px; height: 96px;"></div></div><div class="contract-trigger"></div></div></div>
                                        </div>
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="d-flex align-items-center">
                                                    <svg class="bi text-danger" width="32" height="32" fill="blue" style="width:10px">
                                                        <use xlink:href="assets/vendors/bootstrap-icons/bootstrap-icons.svg#circle-fill"></use>
                                                    </svg>
                                                    <h5 class="mb-0 ms-3">Indonesia</h5>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <h5 class="mb-0">1025</h5>
                                            </div>

                            <div class="col-12 col-xl-8">
                                <div class="card">
                                    <div class="card-header">
                                        <h4>Latest Comments</h4>
                                    </div>
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-hover table-lg">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Comment</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td class="col-3">
                                                            <div class="d-flex align-items-center">
                                                                <div class="avatar avatar-md">
                                                                    <img src="assets/images/faces/5.jpg">
                                                                </div>
                                                                <p class="font-bold ms-3 mb-0">Si Cantik</p>
                                                            </div>
                                                        </td>
                                                        <td class="col-auto">
                                                            <p class=" mb-0">Congratulations on your graduation!</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="col-3">
                                                            <div class="d-flex align-items-center">
                                                                <div class="avatar avatar-md">
                                                                    <img src="assets/images/faces/2.jpg">
                                                                </div>
                                                                <p class="font-bold ms-3 mb-0">Si Ganteng</p>
                                                            </div>
                                                        </td>
                                                        <td class="col-auto">
                                                            <p class=" mb-0">Wow amazing design! Can you make another
                                                                tutorial for
                                                                this design?</p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-3">
                        <div class="card">
                            <div class="card-body py-4 px-5">
                                  <img src="assets/images/bg/1.jpg" height="150" width="150" alt="Face 1">  
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-">
                                    
                                    </div>
                                     
                                    <div class="avatar avatar-xl">
                                       
                                    </div>
                                    <div class="ms-3 name">
                                        <h5 class="font-bold">John Duck</h5>
                                        <h6 class="text-muted mb-0">@johnducky</h6>
                                    </div> 
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h4>Recent Messages</h4>
                            </div>
                            <div class="card-content pb-4">
                                <div class="recent-message d-flex px-4 py-3">
                                    <div class="avatar avatar-lg">
                                        <img src="assets/images/faces/4.jpg">
                                    </div>
                                    <div class="name ms-4">
                                        <h5 class="mb-1">Hank Schrader</h5>
                                        <h6 class="text-muted mb-0">@johnducky</h6>
                                    </div>
                                </div>
                                <div class="recent-message d-flex px-4 py-3">
                                    <div class="avatar avatar-lg">
                                        <img src="assets/images/faces/5.jpg">
                                    </div>
                                    <div class="name ms-4">
                                        <h5 class="mb-1">Dean Winchester</h5>
                                        <h6 class="text-muted mb-0">@imdean</h6>
                                    </div>
                                </div>
                                <div class="recent-message d-flex px-4 py-3">
                                    <div class="avatar avatar-lg">
                                        <img src="assets/images/faces/1.jpg">
                                    </div>
                                    <div class="name ms-4">
                                        <h5 class="mb-1">John Dodol</h5>
                                        <h6 class="text-muted mb-0">@dodoljohn</h6>
                                    </div>
                                </div>
                                <div class="px-4">
                                    <button class="btn btn-block btn-xl btn-light-primary font-bold mt-3">Start
                                        Conversation</button>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h4>Visitors Profile</h4>
                            </div>




                        </div>
                    </div>
                   <section class="section">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">Example Content</h4>
                            </div>
                            <div class="card-body">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur quas omnis
                                laudantium tempore
                                exercitationem, expedita aspernatur sed officia asperiores unde tempora maxime odio
                                reprehenderit
                                distinctio incidunt! Vel aspernatur dicta consequatur!
                            </div>
                        </div>
                    </section> 
                </div>

                <footer>
                    <div class="footer clearfix mb-0 text-muted">
                        <div class="float-start">
                            <p>2021 &copy; Mazer</p>
                        </div>
                        <div class="float-end">
                            <p>Crafted with <span class="text-danger"><i class="bi bi-heart-fill icon-mid"></i></span>
                                by <a href="https://ahmadsaugi.com">Saugi</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </div> -->
    </div>
    <script src="assets/vendors/perfect-scrollbar/perfect-scrollbar.min.js"></script>
    <script src="assets/js/bootstrap.bundle.min.js"></script>

 
    <script src="assets/js/main.js"></script>
</body>

</html>
							
							<script>
							
							parent.document.title='FACTURA Mobi(Cfdi 4.0)';


							
							</script>