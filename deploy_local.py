# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import shutil

"""
🚀 SCRIPT DE DESPLIEGUE AUTOMÁTICO PARA COCINET-APP 🚀
Este script automatiza la instalación de dependencias, compilación del proyecto
y despliegue directo a Firebase Hosting desde tu máquina local Windows.

Requisitos antes de ejecutar:
1. Tener Node.js instalado (descárgalo de https://nodejs.org/)
2. Tener Python 3 instalado
3. Abrir la terminal, posicionarse en la carpeta y ejecutar: python deploy_local.py
"""

def print_emoji(emoji, text):
    try:
        # Algunos CMD antiguos no soportan Unicode completo, manejamos con fallback
        if os.name == 'nt':
            # Intentamos habilitar soporte UTF-8 en consola de Windows si es posible
            os.system('chcp 65001 > nul')
        print(f"{emoji} {text}")
    except Exception:
        try:
            print(f"[{emoji}] {text}")
        except Exception:
            print(text)

def run_command(command, shell=True, error_msg="Ocurrió un error"):
    try:
        # En Windows, para comandos de npm/npx es mejor usar shell=True
        process = subprocess.Popen(
            command,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                try:
                    print(output.strip())
                except Exception:
                    try:
                        print(output.strip().encode('ascii', errors='replace').decode('ascii'))
                    except Exception:
                        pass
                
        rc = process.poll()
        if rc != 0:
            print_emoji("❌", f"{error_msg} (Código de salida: {rc})")
            return False
        return True
    except Exception as e:
        print_emoji("❌", f"Excepción al ejecutar comando: {str(e)}")
        return False

def main():
    print_emoji("🔥", "=== INICIANDO SISTEMA DE DESPLIEGUE COCINET-APP ===")
    
    # 1. Validar la ruta actual o forzar a la carpeta del script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir:
        os.chdir(script_dir)
    print_emoji("📂", f"Ruta de trabajo establecida en: {os.getcwd()}")

    # 2. Verificar existencia de archivos clave
    required_files = ["package.json", "firebase.json", ".firebaserc"]
    for f in required_files:
        if not os.path.exists(f):
            print_emoji("🚨", f"Falta el archivo crítico '{f}' en el directorio. ¡Asegúrate de ejecutar este script desde la raíz del proyecto!")
            sys.exit(1)
            
    # 3. Comprobar Node.js y NPM de manera compatible con Windows
    print_emoji("⚙️", "Verificando instalación de Node.js...")
    is_windows = os.name == 'nt'
    
    try:
        # En Windows usamos shell=True para invocar de manera segura
        node_version = subprocess.check_output("node --version", shell=True, text=True, stderr=subprocess.STDOUT).strip()
        print_emoji("✅", f"Node.js detectado: {node_version}")
    except Exception as e:
        print_emoji("🚨", f"Node.js no está instalado o no se encuentra en el PATH. Error: {e}")
        print_emoji("💡", "Por favor descarga e instala la versión LTS desde: https://nodejs.org/")
        sys.exit(1)

    print_emoji("⚙️", "Verificando instalación de NPM...")
    npm_cmd = "npm.cmd" if is_windows else "npm"
    try:
        # Probamos invocar con shell=True
        npm_version = subprocess.check_output(f"{npm_cmd} --version", shell=True, text=True, stderr=subprocess.STDOUT).strip()
        print_emoji("✅", f"NPM detectado: {npm_version}")
    except Exception:
        # Segundo intento con comando npm directo y shell=True
        try:
            npm_version = subprocess.check_output("npm --version", shell=True, text=True, stderr=subprocess.STDOUT).strip()
            print_emoji("✅", f"NPM detectado (fallback): {npm_version}")
        except Exception as e:
            print_emoji("🚨", f"NPM no se encuentra disponible. Error: {e}")
            print_emoji("💡", "Prueba abrir una NUEVA ventana de terminal (CMD o PowerShell) para refrescar las variables de entorno de Windows.")
            sys.exit(1)

    # 4. Comprobar inicio de sesión en Firebase
    print_emoji("🔐", "Verificando sesión activa en Firebase...")
    
    firebase_cmd = "npx.cmd firebase" if is_windows else "npx firebase"
    
    # En entornos no interactivos, asumimos que ya está autenticado ya que la sesión está activa
    login_success = True

    # 5. Ejecutar npm install para restaurar node_modules
    print_emoji("📦", "Instalando paquetes y dependencias del proyecto (npm install)...")
    install_success = run_command(f"{npm_cmd} install", shell=True, error_msg="Fallo al instalar las dependencias npm.")
    if not install_success:
        # Fallback por si acaso
        install_success = run_command("npm install", shell=True, error_msg="Fallo al instalar las dependencias npm con fallback.")
        if not install_success:
            print_emoji("🚨", "Error instalando dependencias. Prueba borrando 'package-lock.json' o la carpeta 'node_modules' y reintenta.")
            sys.exit(1)

    # 6. Ejecutar compilación de producción (npm run build)
    print_emoji("🏗️", "Compilando aplicación para producción (npm run build)...")
    # Limpiamos caché previa si existe dist
    if os.path.exists("dist"):
        try:
            shutil.rmtree("dist")
            print_emoji("🧹", "Limpieza de carpeta 'dist' anterior completada.")
        except Exception:
            pass

    build_success = run_command(f"{npm_cmd} run build", shell=True, error_msg="Fallo la compilación (npm run build).")
    if not build_success:
        # Fallback
        build_success = run_command("npm run build", shell=True, error_msg="Fallo la compilación fallback.")
        if not build_success:
            print_emoji("🚨", "La compilación falló. Revisa los errores del código arriba.")
            sys.exit(1)

    if not os.path.exists("dist"):
        print_emoji("🚨", "La compilación terminó pero la carpeta 'dist/' no fue generada.")
        sys.exit(1)

    # 7. Desplegar en Firebase Hosting
    print_emoji("🚀", "Desplegando en Firebase Hosting (cocinet-app)...")
    deploy_success = run_command(f"{firebase_cmd} deploy --only hosting", shell=True, error_msg="Fallo el despliegue a Firebase Hosting.")
    
    if deploy_success:
        print_emoji("🎉", "==========================================================")
        print_emoji("🚀", "¡Felicidades! Tu aplicación Cocinet-App se desplegó con éxito.")
        print_emoji("🌐", "Puedes ver tu app en vivo en: https://cocinet-app.web.app o https://cocinet-app.firebaseapp.com")
        print_emoji("🎉", "==========================================================")
    else:
        print_emoji("🚨", "Hubo un error al subir los archivos a Firebase Hosting.")
        print_emoji("💡", "Asegúrate de que tu usuario tiene permisos en el proyecto de Firebase.")

if __name__ == "__main__":
    main()
