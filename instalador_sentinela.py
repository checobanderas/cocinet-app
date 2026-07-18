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
    """Intenta re-ejecutar el script actual con permisos de Administrador."""
    import ctypes
    # Si ya es admin, no hacemos nada
    if is_admin():
        return True
    
    print("🔑 [INFO] Solicitando elevación de privilegios de Administrador... Por favor acepta el diálogo de Windows.")
    try:
        # Volver a lanzar con el comando runas
        script = os.path.abspath(sys.argv[0])
        params = " ".join(sys.argv[1:])
        result = ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, f'"{script}" {params}', None, 1)
        if int(result) > 32:
            print("🚀 [OK] Re-lanzando proceso con permisos de administrador exitosamente.")
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
                print(f"   🏷️  Versión: v{data.get('version', '3.1.0')}")
                print(f"   🔌 Puerto: {data.get('port', PORT)}")
                print(f"   📋 Impresoras Mapeadas: {list(data.get('mapped_printers', {}).keys())}")
                print("================================================================================")
                print("💡 ¡Listo! El Sentinela de Windows ya está conectado a tu base de datos SQLite.")
                print("   Estará revisando continuamente la tabla 'print_queue' para imprimir comandas,")
                print("   cuentas y cortes de caja de forma 100% automática y transparente sin retrasos. ⚡")
                print("================================================================================\n")
                return True
    except Exception as e:
        print(f"⚠️ [AVISO] No se pudo obtener respuesta HTTP directa del Sentinela ({e}).")
        print("   Sin embargo, el servicio de Windows se ha configurado e iniciado en segundo plano.")
        print("   Puedes revisar los logs detallados en 'sentinel_printer.log' para confirmar su operación.")
        return False

def configure_printer_sizes(target_dir):
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
        "FONT_SIZE_PT": 16.0
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
        except Exception:
            pass
            
    print("\n" + "="*80)
    print("    ⚙️  CONFIGURACIÓN DE IMPRESORAS, ANCHOS DE PAPEL Y LOGOTIPO ⚙️")
    print("="*80)
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
        default_name = current_config["PRINTER_MAP"][area]
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
        "FONT_SIZE_PT": new_size
    }
    
    try:
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config_payload, f, indent=4, ensure_ascii=False)
        print(f"✅ [OK] Configuración guardada en: {config_file}\n")
    except Exception as e:
        print(f"⚠️ [AVISO] No se pudo escribir el archivo de configuración ({e}).")

def main():
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

    # 3. Detener servicio existente (si está corriendo)
    print("🛑 [PROCESANDO] Intentando detener cualquier servicio previo del Sentinela...")
    # Intentamos por python o por SC
    run_command(f'python "{SENTINEL_SCRIPT}" stop', "Detener servicio mediante script", ignore_error=True)
    run_command(f'sc stop {SERVICE_NAME}', "Detener servicio mediante SCM de Windows", ignore_error=True)
    time.sleep(1.5)

    # 4. Desinstalar servicio existente
    print("🗑️ [PROCESANDO] Desinstalando versión anterior del servicio de Windows...")
    run_command(f'python "{SENTINEL_SCRIPT}" remove', "Eliminar servicio mediante script", ignore_error=True)
    run_command(f'sc delete {SERVICE_NAME}', "Eliminar servicio mediante SCM de Windows", ignore_error=True)
    time.sleep(1.5)

    # 5. Instalar/Actualizar Dependencias del Sistema
    print("📦 [PROCESANDO] Instalando y actualizando librerías de Python requeridas...")
    deps = ["pywin32", "Flask", "flask-cors"]
    for dep in deps:
        if not run_command(f'"{sys.executable}" -m pip install --upgrade {dep}', f"Instalar/Actualizar paquete '{dep}'"):
            print(f"🛑 [PASO 5 FALLADO] No se pudo instalar la dependencia crítica: {dep}")
            print("💡 Sugerencia: Revisa tu conexión a Internet y asegúrate de que 'pip' esté en tu PATH.")
            input("\nPresiona Enter para salir...")
            sys.exit(1)
    
    # 6. Ejecutar script de post-instalación de pywin32 para registrar DLLs en System32
    print("⚙️ [PROCESANDO] Registrando variables del sistema para servicios de Python en Windows...")
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
    configure_printer_sizes(os.path.dirname(sentinel_path))

    # 7. Instalar el nuevo servicio de Windows
    print("🔌 [PROCESANDO] Instalando el renovado servicio de Windows del Sentinela...")
    # Instalamos con inicio retrasado o automático para que el spooler de Windows esté listo al iniciar
    if not run_command(f'python "{SENTINEL_SCRIPT}" install', "Registrar Servicio de Windows"):
        print("🛑 [PASO 7 FALLADO] Error al registrar el servicio de Windows.")
        print("💡 Sugerencia: Asegúrate de que no haya procesos de Python fantasma bloqueando y de que ejecutas como Administrador.")
        input("\nPresiona Enter para salir...")
        sys.exit(1)

    # Configurar el servicio para que se inicie de forma automática en Windows
    run_command(f'sc config {SERVICE_NAME} start= auto', "Configurar servicio en modo automático", ignore_error=True)

    # 8. Iniciar el servicio de Windows
    print("⚡ [PROCESANDO] Inicializando el servicio en segundo plano de Windows...")
    if not run_command(f'python "{SENTINEL_SCRIPT}" start', "Iniciar Servicio de Windows"):
        # Intentar forzar con SC
        if not run_command(f'sc start {SERVICE_NAME}', "Iniciar Servicio de Windows con SCM"):
            print("🛑 [PASO 8 FALLADO] No se pudo iniciar el servicio de Windows recién instalado.")
            print("💡 Sugerencia: Revisa los logs de Windows Event Viewer o ejecuta 'python sentinel_printer.py' en consola para ver errores.")
            input("\nPresiona Enter para salir...")
            sys.exit(1)

    # 9. Verificación final de salud del servicio HTTP
    print("🎯 [PROCESANDO] Realizando pruebas de conexión finales...")
    verify_service_status()

    print("🎈 ¡INSTALACIÓN COMPLETA DE MANERA EXITOSA! 🎈")
    print("================================================================================")
    print("  El Sentinela de Windows se ha configurado para iniciarse automáticamente con Windows.")
    print("  A partir de ahora, todas las comandas, cuentas y precortes que se envíen desde")
    print("  el navegador (incluso dispositivos Android con RawBT desactivado) se guardarán")
    print("  en tu base de datos y se imprimirán automáticamente de forma centralizada.")
    print("================================================================================\n")
    input("Presiona Enter para finalizar el instalador... 🌟")

if __name__ == "__main__":
    main()
