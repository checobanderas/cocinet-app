@echo off
title INSTALADOR SENTINELA COCINET PRO 🚀
echo =======================================================================
echo   🚀 COCINET PRO - INICIANDO INSTALADOR DEL SENTINELA DE IMPRESION 🚀
echo =======================================================================
echo.
echo [INFO] Detectando instalacion de Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ [ERROR] No se detecto Python instalado en el sistema.
    echo 💡 Por favor descarga e instala Python desde: https://www.python.org/downloads/
    echo ⚠️ Asegurate de marcar la casilla "Add Python to PATH" durante la instalacion.
    echo.
    pause
    exit /b 1
)

echo ✅ [OK] Python detectado correctamente.
echo 🔓 Solicitando elevacion de privilegios de Administrador para registrar el servicio...
python "%~dp0instalador_sentinela.py"
if %errorlevel% neq 0 (
    echo.
    echo ❌ [ERROR] Hubo un problema durante el proceso de instalacion.
    echo.
    pause
    exit /b %errorlevel%
)
echo.
echo =======================================================================
echo   🎉 ¡INSTALACION FINALIZADA CON EXITO! PUEDES CERRAR ESTA VENTANA 🎉
echo =======================================================================
pause
