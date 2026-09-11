@echo off
chcp 65001 >nul
title COCINET PRO - Servidor Local
cls
echo ======================================================
echo    🚀 COCINET PRO - SISTEMA LOCAL (LOCALHOST) 🚀
echo ======================================================
echo.
echo [1/2] Verificando Sentinela de Impresion en puerto 3010...
powershell -Command "if (!(Get-NetTCPConnection -LocalPort 3010 -State Listen -ErrorAction SilentlyContinue)) { Start-Process python -ArgumentList 'sentinel_printer.py' -WindowStyle Hidden }"

echo [2/2] Iniciando Servidor Web Local en http://localhost:3000...
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.
start "" "http://localhost:3000"
node dist/server.cjs
pause
