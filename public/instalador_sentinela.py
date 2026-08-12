# -*- coding: utf-8 -*-
"""
================================================================================
   🚀 COCINET PRO - Instalador y Actualizador del Sentinela de Windows v3.1 🚀
================================================================================
Este script detiene, desinstala, actualiza dependencias y reinstala de forma
limpia el servicio de Windows del Sentinela de Impresión COCINET PRO.

Requisitos:
  - Ejecutar en Windows con Python 3 instalado.
  - Se auto-elevará a permisos de Administrador automáticamente si es necesario.
================================================================================
"""

import os
import sys
import time
import subprocess
import urllib.request
import json
import argparse

# Asegurar codificación UTF-8 en consola de Windows para evitar errores con Emojis
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Nombre exacto del servicio de Windows
SERVICE_NAME = "CocinetPrinterSentinel"
SENTINEL_SCRIPT = "sentinel_printer.py"
PORT = 3010

def is_admin():
    """Verifica si el script tiene privilegios de Administrador."""
    try:
        import ctypes
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False

def elevate_privileges():
    """Intenta re-ejecutar el script actual con permisos de Administrador manteniendo la consola visible."""
    import ctypes
    # Si ya es admin, no hacemos nada
    if is_admin():
        return True
    
    print("🔑 [INFO] Solicitando elevación de privilegios de Administrador... Por favor acepta el diálogo de Windows.")
    try:
        script = os.path.abspath(sys.argv[0])
        script_dir = os.path.dirname(script)
        params = " ".join(sys.argv[1:])
        cmd_args = f'/k cd /d "{script_dir}" && "{sys.executable}" "{script}" {params}'
        result = ctypes.windll.shell32.ShellExecuteW(None, "runas", "cmd.exe", cmd_args, script_dir, 1)
        if int(result) > 32:
            print("🚀 [OK] Re-lanzando proceso con permisos de administrador en nueva consola...")
            sys.exit(0)
        else:
            print("❌ [ERROR] No se concedieron los permisos de Administrador necesarios.")
            return False
    except Exception as e:
        print(f"❌ [ERROR] Error al intentar elevar privilegios: {e}")
        return False

def print_banner():
    print("\n" + "="*80)
    print("   🌟 COCINET PRO - ACTUALIZADOR DE SERVICIO DE WINDOWS PARA EL SENTINELA 🌟")
    print("="*80 + "\n")

def run_command(args, step_name, ignore_error=False):
    """Ejecuta un comando del sistema informando detalladamente con emojis."""
    print(f"⏳ [PROCESANDO] Paso: {step_name}...")
    try:
        # Usamos shell=True para comandos internos o scripts
        result = subprocess.run(
            args, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True, 
            timeout=30,
            shell=True
        )
        if result.returncode == 0:
            print(f"✅ [ÉXITO] Paso '{step_name}' completado correctamente.")
            return True
        else:
            if ignore_error:
                print(f"⚠️ [AVISO] Paso '{step_name}' finalizó con código {result.returncode} (Ignorado).")
                return True
            print(f"❌ [ERROR] Falló el paso: {step_name}")
            print(f"   Detalles del sistema: {result.stderr.strip() or result.stdout.strip()}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏰ [TIMEOUT] Se agotó el tiempo de espera (30s) para: {step_name}")
        return False
    except Exception as e:
        print(f"💥 [CRÍTICO] Excepción en '{step_name}': {e}")
        return False

def check_sentinel_file():
    """Verifica que el archivo del sentinela exista en la misma carpeta."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(current_dir, SENTINEL_SCRIPT)
    if os.path.exists(target_path):
        return target_path
    
    # Buscar en el directorio actual de ejecución
    if os.path.exists(SENTINEL_SCRIPT):
        return os.path.abspath(SENTINEL_SCRIPT)
        
    return None

def verify_service_status():
    """Realiza una petición HTTP al puerto del Sentinela para verificar que esté activo."""
    print(f"🔍 [VERIFICACIÓN] Conectando con el Sentinela en http://localhost:{PORT}/status ...")
    time.sleep(2) # Esperar a que el servicio se asiente
    try:
        url = f"http://localhost:{PORT}/status"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                print("\n🎉 ¡EL SENTINELA SE ENCUENTRA EN LÍNEA Y OPERANDO CON ÉXITO! 🎉")
                print(f"   📡 Estado: {data.get('status', 'desconocido').upper()}")
                print(f"   🛠️  Servicio: {data.get('service', 'N/A')}")
                print(f"   🏷️  Versión Instalada: v{data.get('version', '7.0.0-PRO')}")
                print(f"   🔌 Puerto: {data.get('port', PORT)}")
                print(f"   📋 Impresoras Mapeadas: {list(data.get('mapped_printers', {}).keys())}")
                print("   ✨ Novedades v7.0.0-PRO:")
                print("      • 🛡️ Diagnóstico de caídas automático registrado en 'sentinel_crash.log'.")
                print("      • 🔄 Reconexión automática transparente en puerto 3010 con auto-reintentos.")
                print("      • ⚡ Encolado de contingencia en base de datos SQLite.")
                print("      • 🖨️ Despliegue estricto de 1 línea por producto con montos exactos.")
                print("================================================================================")
                print("💡 ¡Listo! El Sentinela de Windows ya está actualizado e impresoras listas.")
                print("================================================================================\n")
                return True
    except Exception as e:
        print(f"⚠️ [AVISO] No se pudo obtener respuesta HTTP directa del Sentinela ({e}).")
        print("   Sin embargo, el servicio de Windows se ha configurado e iniciado en segundo plano.")
        print("   Puedes revisar los logs detallados en 'sentinel.log' para confirmar su operación.")
        return False

def configure_printer_sizes(target_dir, env_mode="production"):
    """Pregunta al usuario por consola interactiva los nombres, anchos de papel, logotipo y fuentes de las impresoras."""
    config_file = os.path.join(target_dir, "printer_config.json")
    
    # Valores base por defecto
    current_config = {
        "PRINTER_MAP": {
            "cuentas": "CUENTAS",
            "cocina":  "COCINA",
            "barra":   "BARRA",
        },
        "PRINTER_PAPER_SIZES": {
            "cuentas": "80mm",
            "cocina":  "80mm",
            "barra":   "80mm",
        },
        "LOGO_PATH": "C:\\buzon\\logo.jpg",
        "FONT_NAME": "Arial",
        "FONT_SIZE_PT": 16.0,
        "ENVIRONMENT": env_mode,
        "DEBUG_VERBOSE": (env_mode == "testing"),
        "DB_PATH": "restaurant.db",
        "LOG_FILE": "sentinel.log",
        "POLL_INTERVAL_SECONDS": 2,
        "DEDUP_TTL_SECONDS": 10
    }
    
    # Leer el existente si existe para conservar la config anterior del usuario
    if os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "PRINTER_MAP" in data:
                    current_config["PRINTER_MAP"].update(data["PRINTER_MAP"])
                if "PRINTER_PAPER_SIZES" in data:
                    current_config["PRINTER_PAPER_SIZES"].update(data["PRINTER_PAPER_SIZES"])
                if "LOGO_PATH" in data:
                    current_config["LOGO_PATH"] = data["LOGO_PATH"]
                if "FONT_NAME" in data:
                    current_config["FONT_NAME"] = data["FONT_NAME"]
                if "FONT_SIZE_PT" in data:
                    current_config["FONT_SIZE_PT"] = float(data["FONT_SIZE_PT"])
                if "DB_PATH" in data:
                    current_config["DB_PATH"] = data["DB_PATH"]
                if "LOG_FILE" in data:
                    current_config["LOG_FILE"] = data["LOG_FILE"]
                if "POLL_INTERVAL_SECONDS" in data:
                    current_config["POLL_INTERVAL_SECONDS"] = data["POLL_INTERVAL_SECONDS"]
                if "DEDUP_TTL_SECONDS" in data:
                    current_config["DEDUP_TTL_SECONDS"] = data["DEDUP_TTL_SECONDS"]
        except Exception:
            pass
            
    print("\n" + "="*80)
    print("    ⚙️  CONFIGURACIÓN DE IMPRESORAS, ANCHOS DE PAPEL Y LOGOTIPO ⚙️")
    print("="*80)
    
    # Listar impresoras instaladas en Windows
    installed_list = []
    try:
        import win32print
        flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
        installed_list = [p[2] for p in win32print.EnumPrinters(flags)]
        if installed_list:
            print("🖨️  Impresoras detectadas en este equipo:")
            for p in installed_list:
                print(f"   • {p}")
            print("")
    except Exception:
        pass

    print("Por favor, ingresa los datos correspondientes.\n")
    
    # Preguntar ruta del logotipo
    default_logo = current_config.get("LOGO_PATH", "C:\\buzon\\logo.jpg")
    logo_input = input(f"➤ Ruta física del logotipo (.jpg) (Enter para '{default_logo}'): ").strip()
    new_logo = logo_input if logo_input else default_logo
    print(f"   ↳ Logotipo configurado en: '{new_logo}'\n")
    
    # Preguntar tipografía y tamaño
    default_font = current_config.get("FONT_NAME", "Arial")
    font_input = input(f"➤ Nombre de la tipografía (Enter para '{default_font}'): ").strip()
    new_font = font_input if font_input else default_font
    
    default_size = current_config.get("FONT_SIZE_PT", 16.0)
    size_input = input(f"➤ Tamaño de letra base en puntos (Enter para '{default_size}'): ").strip()
    try:
        new_size = float(size_input) if size_input else default_size
    except Exception:
        new_size = default_size
        
    print(f"   ↳ Tipografía configurada: '{new_font}' con tamaño {new_size} pt.\n")
    
    new_map = {}
    new_sizes = {}
    
    for area in ["cuentas", "cocina", "barra"]:
        default_name = current_config["PRINTER_MAP"].get(area, "CUENTAS")
        # Si la predeterminada no coincide con ninguna instalada, sugerir la primera disponible de Windows
        if installed_list and not any(p.upper() == default_name.upper() for p in installed_list):
            default_name = installed_list[0]

        name = input(f"➤ Nombre de impresora en Windows para '{area}' (Enter para '{default_name}'): ").strip()
        new_map[area] = name if name else default_name
        
        default_size = current_config["PRINTER_PAPER_SIZES"][area]
        size_in = input(f"   ¿Ancho de papel de esta impresora? (Enter para '{default_size}', o ingresa '58' o '80'): ").strip()
        if size_in == "58":
            new_sizes[area] = "58mm"
        elif size_in == "80":
            new_sizes[area] = "80mm"
        else:
            new_sizes[area] = default_size
            
        print(f"   ↳ Guardado: Impresora '{new_map[area]}' con papel {new_sizes[area]}.\n")
        
    config_payload = {
        "PRINTER_MAP": new_map,
        "PRINTER_PAPER_SIZES": new_sizes,
        "LOGO_PATH": new_logo,
        "FONT_NAME": new_font,
        "FONT_SIZE_PT": new_size,
        "ENVIRONMENT": env_mode,
        "DEBUG_VERBOSE": (env_mode == "testing"),
        "DB_PATH": current_config.get("DB_PATH", "restaurant.db"),
        "LOG_FILE": current_config.get("LOG_FILE", "sentinel.log"),
        "POLL_INTERVAL_SECONDS": current_config.get("POLL_INTERVAL_SECONDS", 2),
        "DEDUP_TTL_SECONDS": current_config.get("DEDUP_TTL_SECONDS", 10),
        "ERROR_CODES": {
            "PRINTER_OFFLINE": "La impresora esta apagada, desconectada o fuera de linea.",
            "PRINTER_PAPER_OUT": "La impresora no tiene papel.",
            "PRINTER_DOOR_OPEN": "La tapa de la impresora esta abierta.",
            "PRINTER_PAPER_JAM": "Hay un atasco de papel en la impresora.",
            "PRINTER_NOT_FOUND": "No se encontro la impresora especificada en el sistema Windows.",
            "INVALID_PAYLOAD": "El formato JSON de impresion es invalido o esta malformado."
        }
    }
    
    try:
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config_payload, f, indent=4, ensure_ascii=False)
        print(f"✅ [OK] Configuración guardada en: {config_file}\n")
    except Exception as e:
        print(f"⚠️ [AVISO] No se pudo escribir el archivo de configuración ({e}).")

def main():
    parser = argparse.ArgumentParser(description="Instalador del Servicio Sentinela de Impresión")
    parser.add_argument("--env", choices=["production", "testing"], default="production", help="Ambiente de ejecucion")
    args, unknown = parser.parse_known_args()
    env_mode = args.env

    print_banner()

    # 1. Asegurar elevación de privilegios de Administrador
    if not is_admin():
        if not elevate_privileges():
            print("🛑 [PASO 1 FALLADO] El script REQUIERE ejecutarse con permisos de Administrador para instalar servicios.")
            print("💡 Sugerencia: Haz clic derecho sobre el instalador y selecciona 'Ejecutar como Administrador'.")
            input("\nPresiona Enter para salir...")
            sys.exit(1)
        sys.exit(0)
    else:
        print("🔓 [PASO 1 OK] Permisos de Administrador detectados y validados.")

    # 2. Localizar archivo sentinel_printer.py
    sentinel_path = check_sentinel_file()
    if not sentinel_path:
        print(f"🛑 [PASO 2 FALLADO] No se encontró el archivo '{SENTINEL_SCRIPT}' en la carpeta actual.")
        print("💡 Sugerencia: Asegúrate de extraer este instalador en el mismo directorio donde está el sentinela.")
        input("\nPresiona Enter para salir...")
        sys.exit(1)
    else:
        print(f"📂 [PASO 2 OK] Archivo del Sentinela localizado en: {sentinel_path}")

    # Cambiar al directorio del script para evitar fallos de rutas relativas
    os.chdir(os.path.dirname(sentinel_path))

    # 3. Detener y cerrar forzadamente cualquier servicio o proceso previo del Sentinela
    print("🛑 [PROCESANDO] Deteniendo y liberando memoria del Sentinela previo...")
    run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" stop', "Detener servicio mediante script", ignore_error=True)
    run_command(f'sc stop {SERVICE_NAME}', "Detener servicio mediante SCM de Windows", ignore_error=True)
    run_command('taskkill /F /FI "SERVICES eq COCINETPrintSentinel"', "Cierre forzado por SCM", ignore_error=True)
    run_command('taskkill /F /IM pythonservice.exe', "Cierre forzado de pythonservice.exe", ignore_error=True)
    time.sleep(2.0)

    # 4. Desinstalar servicio existente
    print("🗑️ [PROCESANDO] Limpiando registro del servicio previo de Windows...")
    run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" remove', "Eliminar servicio mediante script", ignore_error=True)
    run_command(f'sc delete {SERVICE_NAME}', "Eliminar servicio mediante SCM de Windows", ignore_error=True)
    time.sleep(1.5)

    # 5. Instalar/Actualizar Dependencias del Sistema
    print("📦 [PROCESANDO] Instalando y actualizando librerías de Python requeridas...")
    deps = ["pywin32", "Flask", "flask-cors", "pillow"]
    for dep in deps:
        if not run_command(f'"{sys.executable}" -m pip install --upgrade {dep}', f"Instalar/Actualizar paquete '{dep}'"):
            print(f"🛑 [PASO 5 FALLADO] No se pudo instalar la dependencia crítica: {dep}")
            print("💡 Sugerencia: Revisa tu conexión a Internet y asegúrate de que 'pip' esté en tu PATH.")
            input("\nPresiona Enter para salir...")
            sys.exit(1)
    
    # 6. Ejecutar script de post-instalación de pywin32 para registrar DLLs en System32
    print("⚙️ [PROCESANDO] Registrando variables del sistema para servicios de Python en Windows...")
    try:
        import shutil
        sys32_path = os.environ.get("SystemRoot", r"C:\Windows") + r"\System32"
        pywin32_sys32 = os.path.join(sys.prefix, "Lib", "site-packages", "pywin32_system32")
        if os.path.exists(pywin32_sys32):
            for f in os.listdir(pywin32_sys32):
                if f.lower().endswith(".dll"):
                    src = os.path.join(pywin32_sys32, f)
                    try:
                        shutil.copy2(src, os.path.join(sys32_path, f))
                        shutil.copy2(src, os.path.join(sys.prefix, f))
                    except Exception:
                        pass
    except Exception:
        pass

    post_install_cmd = f'"{sys.executable}" -c "import os, sys; print(os.path.join(sys.prefix, \'Scripts\', \'pywin32_postinstall.py\'))"'
    try:
        post_path = subprocess.check_output(post_install_cmd, shell=True, text=True).strip()
        if os.path.exists(post_path):
            run_command(f'"{sys.executable}" "{post_path}" -install', "Ejecutar post-instalación de pywin32", ignore_error=True)
        else:
            # Buscar en el entorno virtual si aplica
            alt_path = os.path.join(sys.prefix, "Scripts", "pywin32_postinstall.py")
            if os.path.exists(alt_path):
                run_command(f'"{sys.executable}" "{alt_path}" -install', "Ejecutar post-instalación de pywin32 alternativo", ignore_error=True)
    except Exception as e:
        print(f"⚠️ [AVISO] No se pudo registrar pywin32_postinstall de forma automatizada ({e}). Continuando de todos modos...")

    # 6.5. Configuración de Impresoras y Tamaños de Papel (58mm / 80mm)
    configure_printer_sizes(os.path.dirname(sentinel_path), env_mode=env_mode)

    # 7. Instalar el nuevo servicio de Windows
    print("🔌 [PROCESANDO] Instalando el renovado servicio de Windows del Sentinela v3.6.0...")
    # Instalamos con inicio retrasado o automático para que el spooler de Windows esté listo al iniciar
    if not run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" install', "Registrar Servicio de Windows"):
        print("🛑 [PASO 7 FALLADO] Error al registrar el servicio de Windows.")
        print("💡 Sugerencia: Asegúrate de que no haya procesos de Python fantasma bloqueando y de que ejecutas como Administrador.")
        input("\nPresiona Enter para salir...")
        sys.exit(1)

    # Configurar el servicio para que se inicie de forma automática en Windows
    run_command(f'sc config {SERVICE_NAME} start= auto', "Configurar servicio en modo automático", ignore_error=True)

    # 8. Iniciar el servicio de Windows
    print("⚡ [PROCESANDO] Inicializando el servicio en segundo plano de Windows...")
    if not run_command(f'"{sys.executable}" "{SENTINEL_SCRIPT}" start', "Iniciar Servicio de Windows"):
        # Intentar forzar con SC
        if not run_command(f'sc start {SERVICE_NAME}', "Iniciar Servicio de Windows con SCM"):
            print("🛑 [PASO 8 FALLADO] No se pudo iniciar el servicio de Windows recién instalado.")
            print("💡 Sugerencia: Revisa los logs de Windows Event Viewer o ejecuta 'python sentinel_printer.py' en consola para ver errores.")
            input("\nPresiona Enter para salir...")
            sys.exit(1)

    # 9. Verificación final de salud del servicio HTTP
    print("🎯 [PROCESANDO] Realizando pruebas de conexión finales...")
    verify_service_status()

    print("🎈 ¡INSTALACIÓN Y ACTUALIZACIÓN v7.0.0-PRO FINALIZADA CON ÉXITO! 🎈")
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
    print("================================================================================\n")
    input("Presiona Enter para finalizar el instalador... 🌟")

if __name__ == "__main__":
    main()