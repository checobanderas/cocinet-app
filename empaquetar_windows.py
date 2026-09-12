import os
import sys
import shutil
import zipfile
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

print("======================================================")
print("📦 COCINET PRO - EMPAQUETADOR WINDOWS (LOCALHOST) 📦")
print("======================================================\n")

# 0. Limpieza previa de archivos temporales y anidamientos
print("⏳ [Paso 1/4] Limpiando artefactos temporales y zips antiguos...")
for folder in ["public/Cocinet_Windows_App/dist", "dist/Cocinet_Windows_App"]:
    if os.path.exists(folder):
        try:
            shutil.rmtree(folder, ignore_errors=True)
        except Exception:
            pass

for root_dir in ["public", "dist"]:
    if os.path.exists(root_dir):
        for f in os.listdir(root_dir):
            if f.endswith(".zip"):
                try:
                    os.remove(os.path.join(root_dir, f))
                except Exception:
                    pass

# 1. Compilar React y Servidor Backend
print("⏳ [Paso 2/4] Compilando React y servidor local (npm run build)...")
result = subprocess.run("npm run build", shell=True)
if result.returncode != 0:
    print("❌ Error al compilar la aplicación.")
    sys.exit(1)
print("✅ Compilación exitosa en la carpeta 'dist'.\n")

# 2. Generar Lanzador One-Click para Localhost (Python Puerto 3010)
launcher_content = """@echo off
chcp 65001 >nul
title COCINET PRO - Servidor Local
cls
echo ======================================================
echo    🚀 COCINET PRO - SISTEMA LOCAL (LOCALHOST) 🚀
echo ======================================================
echo.
echo [1/2] Verificando Sentinela de Impresion en puerto 3010...
powershell -Command "if (!(Get-NetTCPConnection -LocalPort 3010 -State Listen -ErrorAction SilentlyContinue)) { Start-Process python -ArgumentList 'sentinel_printer.py' -WindowStyle Hidden }"

echo [2/2] Abriendo Cocinet en http://localhost:3010...
echo.
start "" "http://localhost:3010"
echo Sistema iniciado correctamente. Puedes cerrar esta ventana.
timeout /t 3 >nul
"""

launcher_path = "INICIAR_COCINET_LOCALHOST.bat"
with open(launcher_path, "w", encoding="utf-8") as f:
    f.write(launcher_content)

# 3. Preparar archivos para empaquetar
output_zip = "Cocinet_Windows_App.zip"
zip_path = os.path.join("public", output_zip)

files_to_pack = [
    ("dist", "dist"),
    ("public/sentinel_printer.py", "sentinel_printer.py"),
    ("public/instalador_sentinela.py", "instalador_sentinela.py"),
    ("public/printer_config.json", "printer_config.json"),
    ("public/limpiar_entorno.py", "limpiar_entorno.py"),
    ("public/logoroy.png", "logoroy.png"),
    ("package.json", "package.json"),
    (launcher_path, "INICIAR_COCINET_LOCALHOST.bat")
]

print("⏳ [Paso 3/4] Empaquetando distribución limpia para Windows Localhost...")
EXCLUDE_EXTS = {".zip", ".log", ".tmp", ".git"}
EXCLUDE_DIRS = {"node_modules", ".git", "Cocinet_Windows_App", "__pycache__"}

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
    for src, dst in files_to_pack:
        if not os.path.exists(src):
            fallback = os.path.join("public", "Cocinet_Windows_App", os.path.basename(src))
            if os.path.exists(fallback):
                src = fallback
            else:
                continue

        if os.path.isdir(src):
            for root, dirs, files in os.walk(src):
                dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
                for file in files:
                    ext = os.path.splitext(file)[1].lower()
                    if ext in EXCLUDE_EXTS:
                        continue
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, src)
                    arcname = os.path.join(dst, rel_path)
                    zipf.write(file_path, arcname)
        else:
            zipf.write(src, dst)

# Sincronizar carpeta public/Cocinet_Windows_App de manera limpia
target_app_dir = os.path.join("public", "Cocinet_Windows_App")
os.makedirs(target_app_dir, exist_ok=True)
for src, dst in files_to_pack:
    if os.path.exists(src) and not os.path.isdir(src):
        shutil.copy2(src, os.path.join(target_app_dir, dst))

zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"✅ Paquete ZIP generado exitosamente: '{zip_path}' ({zip_size_mb:.2f} MB)")
print("======================================================")
print("🎉 [Paso 4/4] ¡EMPAQUETADO PARA WINDOWS COMPLETADO! 🎉")
print("======================================================\n")
