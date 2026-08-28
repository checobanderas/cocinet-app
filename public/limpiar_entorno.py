import os
import sys
import ctypes
import subprocess
import time

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def elevate_privileges():
    if sys.platform == 'win32':
        script = os.path.abspath(sys.argv[0])
        params = ' '.join([f'"{arg}"' for arg in sys.argv[1:]])
        try:
            ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, f'"{script}" {params}', None, 1)
            return True
        except Exception as e:
            return False
    return False

def kill_process(process_name):
    print(f"[*] Buscando y deteniendo {process_name}...")
    # /F = force, /IM = image name, /T = tree
    result = subprocess.run(f"taskkill /F /T /IM {process_name}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode == 0:
        print(f"  [OK] {process_name} fue detenido correctamente.")
    else:
        print(f"  [INFO] No se encontró {process_name} en ejecución o no se pudo detener.")

def main():
    if not is_admin():
        print("[!] Solicitando permisos de administrador...")
        if elevate_privileges():
            sys.exit(0)
        else:
            print("[ERROR] No se pudo obtener permisos de administrador. Ejecuta el script manualmente como administrador.")
            input("Presiona Enter para salir...")
            sys.exit(1)

    print("=========================================================")
    print("🧹 LIMPIADOR DE ENTORNO LOCAL - COCINET PRO 🧹")
    print("=========================================================")
    print("Este script detendrá los servidores Node.js y los servicios")
    print("antiguos que puedan estar bloqueando tu entorno de pruebas.\n")

    # Matar servidores Node.js (React / Express)
    kill_process("node.exe")

    # Opcional: Matar los servicios de impresión en caso de que estén en conflicto
    kill_process("pythonservice.exe")

    print("\n=========================================================")
    print("✅ ¡ENTORNO LIMPIO Y LISTO!")
    print("=========================================================")
    print("Ahora puedes:")
    print("1. Eliminar las carpetas ZIP repetidas que ya no uses.")
    print("2. Descomprimir la versión más reciente en una carpeta fija (ej. C:\\Cocinet_Local).")
    print("3. Ejecutar tu servidor de nuevo.")
    print("4. Ir a tu navegador y presionar 'Ctrl + F5' para forzar la actualización.")
    print("=========================================================\n")
    
    input("Presiona Enter para cerrar esta ventana...")

if __name__ == "__main__":
    main()
