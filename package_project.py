import os

# Lista de archivos a empaquetar de forma relativa
archivos_a_incluir = [
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "index.html",
    "server.ts",
    "database.sql",
    "src/accessHelpers.ts",
    "src/App.tsx",
    "src/index.css",
    "src/main.tsx",
    "src/search.ts",
    "src/components/DailyReportModal.tsx",
    "src/components/DatabaseDeveloperPanel.tsx",
    "src/components/InstallPWA.tsx",
    "src/components/NotificationsModal.tsx",
    "src/components/RecipeAddInsumoModal.tsx",
    "src/components/VerifyMenu.tsx",
    "src/utils/appHelpers.ts",
    "src/utils/companyCatalog.ts",
    "src/utils/db.ts",
    "src/utils/firebase.ts",
    "src/utils/firestore.ts",
    "src/utils/printer.ts",
    "src/utils/voiceParser.ts"
]

archivo_salida = "proyecto_codigo_completo.txt"

def empaquetar():
    print(f"Iniciando empaquetado de archivos en {archivo_salida}...")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    with open(os.path.join(base_dir, archivo_salida), "w", encoding="utf-8") as out:
        for rel_path in archivos_a_incluir:
            full_path = os.path.join(base_dir, rel_path)
            if os.path.exists(full_path):
                print(f"Incluyendo: {rel_path}")
                out.write(f"\n==================================================\n")
                out.write(f"--- INICIO DE ARCHIVO: {rel_path} ---\n")
                out.write(f"==================================================\n\n")
                
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    out.write(f.read())
                    
                out.write(f"\n\n==================================================\n")
                out.write(f"--- FIN DE ARCHIVO: {rel_path} ---\n")
                out.write(f"==================================================\n")
            else:
                print(f"Advertencia: No se encontró {rel_path}")
                
    print(f"\n¡Éxito! Todo el código se ha guardado en: {os.path.join(base_dir, archivo_salida)}")

if __name__ == "__main__":
    empaquetar()
