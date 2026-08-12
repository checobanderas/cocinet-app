// Archivos incrustados del Sentinela
export const EMBEDDED_INSTALLER_FILES: Record<string, string> = {
  "instalador.bat": `@echo off
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
`,
  "instalador_sentinela.py": `# -*- coding: utf-8 -*-
import os, sys, time, subprocess, urllib.request, json

SERVICE_NAME = "CocinetPrinterSentinel"
SENTINEL_SCRIPT = "sentinel_printer.py"
PORT = 3010

def is_admin():
    try:
        import ctypes
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False

def elevate_privileges():
    import ctypes
    if is_admin():
        return True
    try:
        script = os.path.abspath(sys.argv[0])
        script_dir = os.path.dirname(script)
        params = " ".join(sys.argv[1:])
        cmd_args = f'/k cd /d "{script_dir}" && "{sys.executable}" "{script}" {params}'
        result = ctypes.windll.shell32.ShellExecuteW(None, "runas", "cmd.exe", cmd_args, script_dir, 1)
        return int(result) > 32
    except Exception:
        return False

def print_banner():
    print("\\n" + "="*80)
    print("   🌟 COCINET PRO - SERVICIO SENTINELA DE IMPRESIÓN v7.0.0-PRO 🌟")
    print("="*80 + "\\n")

def run_command(args, step_name, ignore_error=False):
    print(f"⏳ [PROCESANDO] Paso: {step_name}...")
    try:
        result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=30, shell=True)
        return result.returncode == 0 or ignore_error
    except Exception:
        return ignore_error

def main():
    print_banner()
    if not is_admin():
        elevate_privileges()
        sys.exit(0)

    run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" stop', "Detener servicio", ignore_error=True)
    run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" remove', "Eliminar servicio", ignore_error=True)
    run_command(f'"{sys.executable}" -m pip install --upgrade pywin32 Flask flask-cors pillow', "Instalar dependencias", ignore_error=True)
    run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" install', "Registrar Servicio")
    run_command(f'sc config {SERVICE_NAME} start= auto', "Modo automático", ignore_error=True)
    run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" start', "Iniciar Servicio")

    print("\\n🎈 ¡INSTALACIÓN Y ACTUALIZACIÓN v7.0.0-PRO FINALIZADA CON ÉXITO! 🎈")
    print("================================================================================")
    print("  VERSIÓN INSTALADA: v7.0.0-PRO (Sentinela de Impresión Cocinet)")
    print("")
    print("  PROPÓSITO Y USO DEL SERVICIO:")
    print("  • Servicio de fondo (Puerto 3010) para recepción de comanda/cuenta desde Cocinet.")
    print("  • Impresión térmica vectorizada GDI y ESC/POS en papel 58mm y 80mm por área.")
    print("  • Servidor de alta disponibilidad para comandas de Cocina, Cuentas y Barra.")
    print("")
    print("  NOVEDADES Y ACTUALIZACIONES APLICADAS (v7.0.0-PRO):")
    print("  • 🛡️ Registro automático de diagnósticos de caídas en 'sentinel_crash.log'.")
    print("  • 🔄 Reconexión automática en puerto 3010 y tolerancia a fallos de red.")
    print("  • ⚡ Encolado de contingencia en SQLite si la impresora está desconectada.")
    print("  • 🖨️ Formateo limpio de 1 línea por producto con montos y sumas exactos.")
    print("================================================================================\\n")
    input("Presiona Enter para finalizar el instalador... 🌟")

if __name__ == "__main__":
    main()
`
};
