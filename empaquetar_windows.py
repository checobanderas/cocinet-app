import os
import shutil
import zipfile
import subprocess

print("======================================================")
print("📦 COCINET PRO - EMPAQUETADOR DE APP PARA WINDOWS 📦")
print("======================================================\n")

# 1. Compilar React (dist)
print("⏳ [Paso 1/4] Compilando aplicación de React (npm run build)...")
result = subprocess.run("npm run build", shell=True)
if result.returncode != 0:
    print("❌ Error al compilar la aplicación.")
    exit(1)
print("✅ Aplicación compilada con éxito en la carpeta 'dist'.\n")

# 2. Preparar archivos
zip_filename = "Cocinet_Windows_App.zip"
public_dir = "public"
zip_path = os.path.join(public_dir, zip_filename)

if os.path.exists(zip_path):
    os.remove(zip_path)

files_to_zip = [
    ("dist", "dist"), # Carpeta completa de react
    ("public/sentinel_printer.py", "sentinel_printer.py"),
    ("public/instalador_sentinela.py", "instalador_sentinela.py"),
    ("public/limpiar_entorno.py", "limpiar_entorno.py"),
    ("public/limpiar_entorno.bat", "limpiar_entorno.bat"),
    ("public/logoroy.png", "logoroy.png") # Agregamos el logo si existe para las impresiones
]

# 3. Crear el ZIP
print("⏳ [Paso 2/4] Creando el archivo ZIP con el servidor y la app...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for src, dst in files_to_zip:
        if not os.path.exists(src):
            print(f"⚠️ Aviso: No se encontró '{src}', omitiendo...")
            continue
            
        if os.path.isdir(src):
            for root, dirs, files in os.walk(src):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Relativo al destino del zip
                    arcname = os.path.join(dst, os.path.relpath(file_path, src))
                    zipf.write(file_path, arcname)
        else:
            zipf.write(src, dst)

print(f"✅ Archivo '{zip_filename}' creado con éxito.\n")

# 4. Finalizado
print("⏳ [Paso 3/4] El empaquetador guardó el ZIP en la carpeta 'public'.")
print("✅ Así, al hacer deploy a tu servidor web, la gente podrá descargarlo.\n")

print("🎉 [Paso 4/4] ¡EMPAQUETADO TERMINADO! 🎉")
print(f"Ya puedes hacer tu 'git add .', 'git commit' y 'git push'.\n")
