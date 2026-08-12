@echo off
echo =======================================================
echo   DESINSTALANDO Y REINSTALANDO SERVICIO COCINET SENTINEL
echo =======================================================
powershell -Command "Start-Process cmd -ArgumentList '/c python \"%~dp0sentinel_printer.py\" stop ^&^& sc stop CocinetPrinterSentinel ^&^& sc delete CocinetPrinterSentinel ^&^& taskkill /F /IM pythonservice.exe ^&^& timeout /t 2 ^&^& python \"%~dp0sentinel_printer.py\" --startup auto install ^&^& python \"%~dp0sentinel_printer.py\" start' -Verb RunAs"
echo Servicio desinstalado y reinstalado.
