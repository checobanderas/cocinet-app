@echo off
setlocal enabledelayedexpansion
title INSTALADOR SENTINEL COCINET
echo ==========================================
echo INSTALANDO DEPENDENCIAS PARA IMPRESION...
echo ==========================================
echo.

:: Cambiar al directorio donde reside este archivo .bat para evitar errores de ruta en Windows
cd /d "%~dp0"

:: Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado o no esta en el PATH.
    echo Por favor instala Python desde python.org y marca "Add to PATH".
    pause
    exit /b
)

:: Verificar si el script de impresión existe en la misma carpeta
if not exist "sentinel_printer.py" (
    echo [ERROR] No se encontro 'sentinel_printer.py' en esta carpeta.
    echo Asegurate de que el archivo este en: %cd%
    pause
    exit /b
)

echo [+] Instalando Flask, Flask-CORS y PyWin32...
pip install Flask flask-cors pywin32

echo.
echo [+] Configurando registro de Windows para PyWin32...
python -m pywin32_postinstall -install >nul 2>&1

echo.
echo ==========================================
echo CONFIGURACION COMPLETADA
echo ==========================================
echo.
echo Iniciando servidor Sentinel en: %cd%
echo.
python sentinel_printer.py
pause
