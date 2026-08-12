@echo off
echo =======================================================
echo   PURGANDO SERVICIOS LEGACY Y REINSTALANDO SENTINEL
echo =======================================================
powershell -Command "Start-Process cmd -ArgumentList '/c cd /d \"%~dp0\" && python instalador_sentinela.py' -Verb RunAs"
echo Proceso de reinstalación ejecutado.
