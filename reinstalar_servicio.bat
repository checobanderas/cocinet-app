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
echo   PURGANDO SERVICIOS LEGACY Y REINSTALANDO SENTINEL
echo =======================================================
python "%~dp0instalador_sentinela.py"
echo =======================================================
echo   SERVICIO REINSTALADO Y REINICIADO CON ÉXITO
echo =======================================================
timeout /t 3 >nul
