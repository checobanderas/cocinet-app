@echo off
:: Despliegue automático de Cocinet-App en Windows
title Desplegar Cocinet-App en Firebase
chcp 65001 > nul
cls

echo ==========================================================
echo 🚀 BIENVENIDO AL ASISTENTE DE DESPLIEGUE COCINET-APP 🚀
echo ==========================================================
echo.
echo Este archivo automatiza el despliegue a tu hosting de Firebase.
echo Asegúrate de tener instalado Python 3 y Node.js en tu sistema Windows.
echo.
echo Presiona cualquier tecla para iniciar el proceso...
pause > nul
echo.

python deploy_local.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Ocurrió un error en el script. Si es un problema de comando no encontrado,
    echo    asegúrate de cerrar esta terminal y abrir una nueva para que se carguen las
    echo    variables de entorno de Node.js o Python.
    echo.
)

echo.
echo Presiona cualquier tecla para salir...
pause > nul
