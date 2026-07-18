@echo off
title Lanzador Reimpresor Cocinet Pro
echo [1/2] Verificando dependencias...
python -m pip install firebase-admin requests --quiet
echo [2/2] Iniciando ventana de reimpresion...
:: Ejecutamos pythonw para que no abra la consola negra al iniciar
start "" pythonw reimpresor_windows.pyw
echo ¡Listo! La ventana deberia aparecer en unos segundos.
exit
