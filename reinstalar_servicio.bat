@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
title REINSTALANDO SERVICIO SENTINEL
net session >nul 2>&1
if !errorlevel! neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)
cd /d "%~dp0"
echo =======================================================
echo   DESINSTALANDO Y REINSTALANDO SERVICIO COCINET SENTINEL
echo =======================================================
python sentinel_printer.py stop
sc stop CocinetPrinterSentinel
sc delete CocinetPrinterSentinel
taskkill /F /IM pythonservice.exe
timeout /t 2 /nobreak >nul

echo.
echo Instalando nuevo servicio desde: %cd%
python sentinel_printer.py --startup auto install
sc config CocinetPrinterSentinel start= auto
python sentinel_printer.py start
sc start CocinetPrinterSentinel
echo.
echo =======================================================
echo   SERVICIO REINSTALADO Y REINICIADO CON ÉXITO
echo =======================================================
timeout /t 3 >nul
