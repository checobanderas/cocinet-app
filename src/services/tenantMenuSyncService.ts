import {
  softDeleteAllProductsFromFirebase,
  getAllProductsFromFirebase,
  bulkAddProductsToFirebase,
} from '../utils/firestore';
import { Product } from '../utils/appHelpers';

export interface ImportTenantMenuParams {
  importSelectedTenantId: string;
  selectedTenant: any;
  companyCatalog: any[];
  currentProducts: Product[];
  triggerAppNotification: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export async function executeImportTenantMenu(params: ImportTenantMenuParams): Promise<boolean> {
  const {
    importSelectedTenantId,
    selectedTenant,
    companyCatalog,
    currentProducts,
    triggerAppNotification,
  } = params;

  if (!importSelectedTenantId) {
    triggerAppNotification("Error ⚠️", "Por favor selecciona una sucursal origen.", "warning");
    return false;
  }

  const sourceTenant = companyCatalog.find((c) => c.id === importSelectedTenantId);
  const sourceTenantName = sourceTenant ? sourceTenant.name : importSelectedTenantId;

  try {
    // 1. Respaldo y borrado suave de productos de destino
    const destBranchName = selectedTenant?.name || selectedTenant?.sucursalDefault || "Sucursal";
    await softDeleteAllProductsFromFirebase(selectedTenant.id, destBranchName, currentProducts);

    // 2. Obtener productos de la sucursal origen
    const allProducts = await getAllProductsFromFirebase();
    const sourceProductsRaw = allProducts.filter((p: any) => p.tenantId === importSelectedTenantId);

    if (sourceProductsRaw.length === 0) {
      triggerAppNotification("Advertencia ⚠️", "La sucursal origen seleccionada no contiene productos para importar.", "warning");
      return false;
    }

    // Deduplicar productos de origen
    const seenKeys = new Set<string>();
    const sourceProducts: any[] = [];
    sourceProductsRaw.forEach((p: any) => {
      if (!p.name) return;
      const key = `${p.name.trim().toLowerCase()}_${p.category || ""}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        sourceProducts.push(p);
      }
    });

    // 3. Mapear al payload destino con nuevos IDs únicos por sucursal
    const productsToInsert = sourceProducts.map((p: any) => {
      const { id, uid, tenantId, sucursal, ...rest } = p;
      const newRawId = `prod_${selectedTenant.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return {
        ...rest,
        id: newRawId,
        uid: newRawId,
        tenantId: selectedTenant.id,
        isDeleted: false,
        sucursal: selectedTenant.name || selectedTenant.sucursalDefault || "Sucursal"
      };
    });

    // 4. Guardar en Firebase
    await bulkAddProductsToFirebase(productsToInsert);

    const foodCount = productsToInsert.filter((p: any) => p.category === "food").length;
    const drinksCount = productsToInsert.filter((p: any) => p.category === "drinks").length;
    const dessertsCount = productsToInsert.filter((p: any) => p.category === "desserts").length;

    triggerAppNotification(
      "¡Éxito! 📥",
      `Se han importado exitosamente ${productsToInsert.length} productos desde "${sourceTenantName}" a la sucursal actual:
      🍔 ${foodCount} alimentos, 🥤 ${drinksCount} bebidas, 🍰 ${dessertsCount} postres.`,
      "success"
    );
    return true;
  } catch (error: any) {
    console.error("Error al importar menú de otra sucursal:", error);
    triggerAppNotification("Error ❌", error.message || "Ocurrió un error inesperado durante la importación.", "warning");
    return false;
  }
}

export interface ReplicateMenuParams {
  targetTenantIds: string[];
  selectedTenant: any;
  companyCatalog: any[];
  currentProducts: Product[];
  triggerAppNotification: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export async function executeReplicateMenuToTenants(params: ReplicateMenuParams): Promise<boolean> {
  const {
    targetTenantIds,
    selectedTenant,
    companyCatalog,
    currentProducts,
    triggerAppNotification,
  } = params;

  if (!selectedTenant) return false;
  if (!targetTenantIds || targetTenantIds.length === 0) {
    triggerAppNotification("Error ⚠️", "Selecciona al menos una sucursal destino.", "warning");
    return false;
  }

  const activeProducts = currentProducts.filter((p: any) => !p.isDeleted);
  if (activeProducts.length === 0) {
    triggerAppNotification("Advertencia ⚠️", "La sucursal actual no contiene productos activos para replicar.", "warning");
    return false;
  }

  try {
    const seenKeys = new Set<string>();
    const cleanProducts: any[] = [];
    activeProducts.forEach((p: any) => {
      if (!p.name) return;
      const key = `${p.name.trim().toLowerCase()}_${p.category || ""}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        cleanProducts.push(p);
      }
    });

    const replicatedNames: string[] = [];

    for (const destId of targetTenantIds) {
      const destTenant = companyCatalog.find(c => c.id === destId);
      const destName = destTenant ? destTenant.name : destId;
      replicatedNames.push(destName);

      // 1. Respaldo y borrado suave de productos de destino
      await softDeleteAllProductsFromFirebase(destId, destName, []);

      // 2. Mapear payload
      const productsToInsert = cleanProducts.map((p: any) => {
        const { id, uid, tenantId, sucursal, ...rest } = p;
        const newRawId = `prod_${destId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        return {
          ...rest,
          id: newRawId,
          uid: newRawId,
          tenantId: destId,
          isDeleted: false,
          sucursal: destName
        };
      });

      // 3. Guardar en Firebase
      await bulkAddProductsToFirebase(productsToInsert, false, destId);
    }

    triggerAppNotification(
      "¡Replicación Exitosa! 📡",
      `Se han replicado exitosamente ${cleanProducts.length} productos a ${replicatedNames.length} sucursal(es): ${replicatedNames.join(", ")}.`,
      "success"
    );
    return true;
  } catch (error: any) {
    console.error("Error al replicar menú a sucursales:", error);
    triggerAppNotification("Error ❌", error.message || "Ocurrió un error al replicar el menú.", "warning");
    return false;
  }
}
