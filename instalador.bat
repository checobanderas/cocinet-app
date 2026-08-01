@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
title INSTALADOR SENTINELA COCINET PRO

:: Verificar si el script ya se esta ejecutando como Administrador
net session >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [INFO] Solicitando elevacion de privilegios de Administrador...
    echo [INFO] Por favor presiona 'Si' en el dialogo de Windows que aparecera a continuacion.
    echo.
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo =======================================================================
echo   [+] COCINET PRO - INICIANDO INSTALADOR DEL SENTINELA DE IMPRESION
echo =======================================================================
echo.
echo [INFO] Detectando instalacion de Python compatible (v3.11 / v3.12)...

set "PYTHON_CMD="

:: 1. Priorizar Python 3.11 o 3.12 mediante el lanzador oficial 'py'
py -3.11 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=py -3.11"
    goto :PYTHON_FOUND
)

py -3.12 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=py -3.12"
    goto :PYTHON_FOUND
)

:: 2. Buscar ejecutable directo de Python 3.11 o 3.12 en el sistema
if exist "C:\Users\DELL\AppData\Local\Programs\Python\Python311\python.exe" (
    set "PYTHON_CMD="C:\Users\DELL\AppData\Local\Programs\Python\Python311\python.exe""
    goto :PYTHON_FOUND
)
if exist "C:\Users\CAJA\AppData\Local\Programs\Python\Python311\python.exe" (
    set "PYTHON_CMD="C:\Users\CAJA\AppData\Local\Programs\Python\Python311\python.exe""
    goto :PYTHON_FOUND
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python311\python.exe""
    goto :PYTHON_FOUND
)
if exist "C:\Program Files\Python311\python.exe" (
    set "PYTHON_CMD="C:\Program Files\Python311\python.exe""
    goto :PYTHON_FOUND
)
if exist "C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD="C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe""
    goto :PYTHON_FOUND
)
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python312\python.exe""
    goto :PYTHON_FOUND
)
if exist "C:\Program Files\Python312\python.exe" (
    set "PYTHON_CMD="C:\Program Files\Python312\python.exe""
    goto :PYTHON_FOUND
)

:: 3. Probar lanzador generico 'py -3' o 'python'
py -3 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=py -3"
    goto :PYTHON_FOUND
)

python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=python"
    goto :PYTHON_FOUND
)

:PYTHON_NOT_FOUND
echo.
echo [AVISO] No se detecto Python 3.11 / 3.12 instalado en el sistema.
echo [INFO] Descargando e instalando Python 3.11.9 de forma automatica...
echo.

set "INSTALLER_PATH=%TEMP%\python_installer_setup.exe"

curl -L "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe" -o "!INSTALLER_PATH!"
if not exist "!INSTALLER_PATH!" (
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe', '!INSTALLER_PATH!')"
)

if not exist "!INSTALLER_PATH!" (
    echo [ERROR] No se pudo descargar el instalador de Python automaticamente.
    echo [INFO] Revisa tu conexion a Internet o descarga Python 3.11 manualmente de https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [INFO] Instalando Python 3.11 de forma silenciosa para todos los usuarios...
"!INSTALLER_PATH!" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

if exist "!INSTALLER_PATH!" del /f /q "!INSTALLER_PATH!" >nul 2>&1

py -3.11 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=py -3.11"
    goto :PYTHON_FOUND
)

if exist "C:\Program Files\Python311\python.exe" (
    set "PYTHON_CMD="C:\Program Files\Python311\python.exe""
    goto :PYTHON_FOUND
)

python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=python"
    goto :PYTHON_FOUND
)

echo [ERROR] La instalacion automatica de Python no finalizo correctamente.
pause
exit /b 1

:PYTHON_FOUND
echo [OK] Python compatible detectado correctamente: !PYTHON_CMD!
echo [INFO] Ejecutando proceso de instalacion del servicio del Sentinela...
!PYTHON_CMD! "%~dp0instalador_sentinela.py"
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Hubo un problema durante el proceso de instalacion.
    echo.
    pause
    exit /b !errorlevel!
)
echo.
echo =======================================================================
echo   [OK] INSTALACION FINALIZADA CON EXITO! PUEDES CERRAR ESTA VENTANA
echo =======================================================================
pause
