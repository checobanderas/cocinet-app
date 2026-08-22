import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="urllib3")

import firebase_admin
from firebase_admin import credentials, firestore
import difflib

# 1. Configuración de credenciales
ruta_credencial = "C:/buzon/TAREAS/cocinet-app2/cocinet-app-main/cocinet-app-firebase-adminsdk-fbsvc-4f4bf59b08.json"
cred = credentials.Certificate(ruta_credencial)
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Definir los cambios solicitados por el usuario
actualizaciones = {
    "Chocoflan": 70, "Pay de queso": 70, "Flan napolitano": 70,
    "Agua de litro": 75, "Fuztea": 45, "Tostada de res": 50,
    "Burrita de pastor": 45, "Burrita de ranchera": 55, "Burrita de bistec": 50,
    "Burrito de costilla": 50, "Cerveza": 45, "refresco lata": 42,
    "Tostada de bistec": 50
}

# 3. Listar todos los tenants para elegir
print("--- Tenants disponibles ---")
tenants_ref = db.collection("tenants")
tenants = list(tenants_ref.stream())

for i, t in enumerate(tenants):
    data = t.to_dict()
    print(f"{i + 1}. {data.get('name', 'Sin nombre')} (ID: {t.id})")

seleccion = int(input("\nSelecciona el número del tenant a inspeccionar: ")) - 1
tenant_seleccionado = tenants[seleccion]
tenant_data = tenant_seleccionado.to_dict()
print(f"\nHas seleccionado: {tenant_data.get('name', 'Sin nombre')}")

# 4. Apuntar directamente a la colección 'products'
nombre_columna_productos = "products"
print(f"\nLeyendo productos de la colección: '{nombre_columna_productos}'...\n")

productos_ref = tenant_seleccionado.reference.collection(nombre_columna_productos)
docs = list(productos_ref.stream())

pendientes_actualizar = []

print(f"{'Nombre en BD':<30} | {'Relacionado con':<20} | {'Precio Actual':<15} | {'Nuevo Precio'}")
print("-" * 85)

for doc in docs:
    data = doc.to_dict()
    nombre = data.get("name") or data.get("nombre") or data.get("title")
    precio_actual = data.get("price") if data.get("price") is not None else data.get("precio")
    
    if nombre:
        nombre_limpio = nombre.strip()
        
        # Buscar la mejor coincidencia por similitud
        mejor_ratio = 0
        mejor_coincidencia = None
        
        for prod_buscado in actualizaciones.keys():
            # Calcula el porcentaje de similitud entre el nombre de la BD y el solicitado
            ratio = difflib.SequenceMatcher(None, nombre_limpio.lower(), prod_buscado.lower()).ratio()
            if ratio > mejor_ratio:
                mejor_ratio = ratio
                mejor_coincidencia = prod_buscado
        
        # Si hay una coincidencia del 60% o más, lo consideramos válido
        if mejor_ratio >= 0.60:
            nuevo_precio = actualizaciones[mejor_coincidencia]
            
            # Solo proponemos actualizar si el precio es distinto
            # Se compara también con flotante por si en BD está como 45.0 y queremos 45
            if str(precio_actual) != str(nuevo_precio) and str(precio_actual) != str(float(nuevo_precio)):
                print(f"{nombre_limpio[:28]:<30} | {mejor_coincidencia[:18]:<20} | {str(precio_actual):<15} | {str(nuevo_precio)}")
                pendientes_actualizar.append((doc.reference, nombre_limpio, nuevo_precio))

# 5. Confirmación antes de modificar nada
if not pendientes_actualizar:
    print("\nNo hay cambios pendientes (todos los precios coinciden o no se encontró ninguna similitud).")
else:
    confirmacion = input(f"\nSe encontraron {len(pendientes_actualizar)} posibles actualizaciones. ¿Deseas aplicar estos cambios exactos? (s/n): ")
    
    if confirmacion.lower() == 's':
        batch = db.batch()
        for ref, _, nuevo_precio in pendientes_actualizar:
            # Aseguramos que el precio se guarde como número
            batch.update(ref, {"price": float(nuevo_precio)})
        
        batch.commit()
        print("¡Actualización aplicada correctamente en Firestore!")
    else:
        print("Operación cancelada por el usuario. No se modificó nada.")