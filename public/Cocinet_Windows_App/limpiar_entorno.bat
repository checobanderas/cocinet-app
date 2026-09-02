@echo off
chcp 65001 > nul
title LIMPIADOR DE ENTORNO COCINET PRO

:: Solicitar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo Solicitando elevacion de privilegios de Administrador...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo =========================================================
echo   [+] LIMPIADOR DE ENTORNO COCINET PRO (DEV)
echo =========================================================
echo.
echo Deteniendo procesos de Node.js en segundo plano...
taskkill /F /T /IM node.exe >nul 2>&1
if %errorLevel% equ 0 (
    echo  - [OK] Servidores Node.js detenidos.
) else (
    echo  - [INFO] No habia servidores Node.js corriendo.
)

echo.
echo Deteniendo servicios de impresion (opcional)...
taskkill /F /T /IM pythonservice.exe >nul 2>&1
if %errorLevel% equ 0 (
    echo  - [OK] Servicios Python detenidos.
) else (
    echo  - [INFO] No habia servicios Python corriendo.
)

echo.
echo =========================================================
echo   [OK] ENTORNO LIMPIO
echo =========================================================
echo.
echo Ahora puedes:
echo 1. Borrar todas las carpetas repetidas (Cocinet_Windows_App 1, 2, etc).
echo 2. Extraer tu nuevo ZIP en una sola carpeta limpia.
echo 3. Volver a arrancar.
echo 4. En el navegador, usar "Ctrl + F5" para limpiar cache web.
echo.
pause
