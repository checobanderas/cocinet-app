import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IonPage,
  IonContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  cubeOutline,
  restaurantOutline,
  businessOutline,
  scaleOutline,
  trendingDownOutline,
  sparklesOutline,
  arrowBackOutline,
  addOutline,
  searchOutline,
  createOutline,
  trashOutline,
  downloadOutline,
  checkmarkCircleOutline,
  cartOutline,
  cashOutline,
  documentTextOutline,
  refreshOutline,
  closeCircleOutline,
  closeOutline,
} from "ionicons/icons";
import * as XLSX from "xlsx";
import {
  addInventoryItemToFirebase,
  updateInventoryItemInFirebase,
  deleteInventoryItemFromFirebase,
  addInventoryMovementToFirebase,
  updateProductInFirebase,
  addSupplierToFirebase,
  updateSupplierInFirebase,
  deleteSupplierFromFirebase,
  getMexicoISOString,
} from "../../utils/firestore";
import { SupplierModal } from "../modals/SupplierModal";
import { SupplierPurchaseModal } from "../modals/SupplierPurchaseModal";

interface ManageInventoryViewProps {
  renderMaterialHeader: any;
  setAppMode: (mode: any) => void;
  currentUser: any;
  selectedTenant: any;
  inventory: any[];
  products: any[];
  suppliers: any[];
  purchases: any[];
  inventoryMovements: any[];
  cashierSessions: any[];
  triggerAppNotification: (
    title: string,
    message: string,
    type: "success" | "warning" | "error" | "info"
  ) => void;
}

type InventoryTabType =
  | "insumos"
  | "recipes"
  | "purchases_suppliers"
  | "physical_audit"
  | "kardex_movements"
  | "ia_insumos"
  | null;

export const ManageInventoryView: React.FC<ManageInventoryViewProps> = ({
  renderMaterialHeader,
  setAppMode,
  currentUser,
  selectedTenant,
  inventory,
  products,
  suppliers,
  purchases,
  inventoryMovements,
  cashierSessions,
  triggerAppNotification,
}) => {
  const [activeTab, setActiveTab] = useState<InventoryTabType>(null);

  // --- Sub-states for Insumos Tab ---
  const [insumoSearch, setInsumoSearch] = useState("");
  const [insumoCategoryFilter, setInsumoCategoryFilter] = useState("TODOS");
  const [editingInsumo, setEditingInsumo] = useState<any | null>(null);
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [quickAdjustInsumo, setQuickAdjustInsumo] = useState<any | null>(null);
  const [quickAdjustQty, setQuickAdjustQty] = useState("");
  const [quickAdjustType, setQuickAdjustType] = useState<"entrada" | "merma" | "ajuste">("ajuste");
  const [quickAdjustReason, setQuickAdjustReason] = useState("");

  // Insumo Form
  const [insumoFormName, setInsumoFormName] = useState("");
  const [insumoFormCategory, setInsumoFormCategory] = useState("Ingredientes");
  const [insumoFormUnit, setInsumoFormUnit] = useState("kg");
  const [insumoFormCost, setInsumoFormCost] = useState("");
  const [insumoFormStock, setInsumoFormStock] = useState("");
  const [insumoFormMinStock, setInsumoFormMinStock] = useState("");

  // --- Sub-states for Recipes / Inventory Mode Tab ---
  const [recipeActiveCategory, setRecipeActiveCategory] = useState<string>("food");
  const [recipeActiveSubcategory, setRecipeActiveSubcategory] = useState<string>("Todos");
  const [recipeProductSearch, setRecipeProductSearch] = useState("");
  const [recipeInventoryTypeFilter, setRecipeInventoryTypeFilter] = useState<"TODOS" | "receta" | "pieza" | "bulto" | "caja" | "none">("TODOS");
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<any | null>(null);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [selectedIngredientQty, setSelectedIngredientQty] = useState("");
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [ingredientCategoryFilter, setIngredientCategoryFilter] = useState("TODOS");

  // Excel Table Selection & Bulk Insumo Assignment States ⚡
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkInsumoId, setBulkInsumoId] = useState<string>("");
  const [bulkInsumoQty, setBulkInsumoQty] = useState<string>("1");
  const [bulkTargetInventoryType, setBulkTargetInventoryType] = useState<string>("receta");
  const [isApplyingBulk, setIsApplyingBulk] = useState<boolean>(false);
  const [showBulkPanel, setShowBulkPanel] = useState<boolean>(true);

  // --- Sub-states for Compras / Proveedores Tab ---
  const [purchasesTabSubView, setPurchasesTabSubView] = useState<"suppliers" | "purchases">("suppliers");
  const [supplierModal, setSupplierModal] = useState<{ isOpen: boolean; supplier: any | null }>({
    isOpen: false,
    supplier: null,
  });
  const [showSupplierPurchaseModal, setShowSupplierPurchaseModal] = useState(false);
  const [selectedScheduleSupplier, setSelectedScheduleSupplier] = useState<any | null>(null);
  const [supplierPurchaseItems, setSupplierPurchaseItems] = useState<any[]>([]);
  const [supplierPurchaseIsPaid, setSupplierPurchaseIsPaid] = useState(true);

  // --- Sub-states for Physical Audit Tab ---
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [auditSearch, setAuditSearch] = useState("");

  // --- Sub-states for Kardex Tab ---
  const [kardexSearch, setKardexSearch] = useState("");
  const [kardexTypeFilter, setKardexTypeFilter] = useState("TODOS");

  // --- Sub-states for AI Tab ---
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Computed metrics
  const totalInsumos = inventory.length;
  const lowStockInsumos = inventory.filter(
    (i) => (Number(i.stock) || 0) <= (Number(i.minStock) || 0)
  ).length;
  const totalStockValuation = inventory.reduce(
    (acc, i) => acc + (Number(i.stock) || 0) * (Number(i.cost) || 0),
    0
  );
  const productsWithRecipes = products.filter(
    (p) => p.recipe && Array.isArray(p.recipe) && p.recipe.length > 0 && !p.isDeleted
  ).length;

  // Handler for Insumo Modal Open
  const handleOpenNewInsumo = () => {
    setEditingInsumo(null);
    setInsumoFormName("");
    setInsumoFormCategory("Ingredientes");
    setInsumoFormUnit("kg");
    setInsumoFormCost("0");
    setInsumoFormStock("0");
    setInsumoFormMinStock("5");
    setShowInsumoModal(true);
  };

  const handleOpenEditInsumo = (item: any) => {
    setEditingInsumo(item);
    setInsumoFormName(item.name || "");
    setInsumoFormCategory(item.category || "Ingredientes");
    setInsumoFormUnit(item.unit || "kg");
    setInsumoFormCost(String(item.cost ?? 0));
    setInsumoFormStock(String(item.stock ?? 0));
    setInsumoFormMinStock(String(item.minStock ?? 5));
    setShowInsumoModal(true);
  };

  const handleSaveInsumo = async () => {
    if (!insumoFormName.trim()) {
      alert("Por favor escribe el nombre del insumo.");
      return;
    }
    const itemData = {
      name: insumoFormName.trim(),
      category: insumoFormCategory,
      unit: insumoFormUnit.trim() || "pza",
      cost: parseFloat(insumoFormCost) || 0,
      stock: parseFloat(insumoFormStock) || 0,
      minStock: parseFloat(insumoFormMinStock) || 0,
    };

    try {
      if (editingInsumo) {
        await updateInventoryItemInFirebase(editingInsumo.id, itemData);
        triggerAppNotification(
          "Insumo Actualizado",
          `Se actualizó "${itemData.name}" exitosamente.`,
          "success"
        );
      } else {
        await addInventoryItemToFirebase({
          id: `inv_${Date.now()}`,
          ...itemData,
          createdAt: getMexicoISOString(),
        });
        triggerAppNotification(
          "Insumo Creado",
          `Se agregó "${itemData.name}" al catálogo de insumos.`,
          "success"
        );
      }
      setShowInsumoModal(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el insumo.");
    }
  };

  const handleDeleteInsumo = async (item: any) => {
    if (
      window.confirm(
        `¿Seguro que deseas eliminar "${item.name}"? Los platillos que usen este insumo dejarán de descontarlo.`
      )
    ) {
      try {
        await deleteInventoryItemFromFirebase(item.id);
        triggerAppNotification("Insumo Eliminado", `Se eliminó "${item.name}".`, "info");
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el insumo.");
      }
    }
  };

  const handleQuickAdjustStock = async () => {
    if (!quickAdjustInsumo) return;
    const diff = parseFloat(quickAdjustQty);
    if (isNaN(diff) || diff === 0) {
      alert("Ingresa una cantidad válida diferente de 0.");
      return;
    }

    const currentStock = Number(quickAdjustInsumo.stock) || 0;
    let delta = 0;
    let movType = "ajuste";

    if (quickAdjustType === "entrada") {
      delta = Math.abs(diff);
      movType = "entrada_manual";
    } else if (quickAdjustType === "merma") {
      delta = -Math.abs(diff);
      movType = "merma";
    } else {
      // Ajuste directo
      delta = diff;
      movType = "ajuste_manual";
    }

    const newStock = Math.max(0, currentStock + delta);

    try {
      await updateInventoryItemInFirebase(quickAdjustInsumo.id, { stock: newStock });
      await addInventoryMovementToFirebase({
        inventoryItemId: quickAdjustInsumo.id,
        type: movType,
        qty: delta,
        concept: quickAdjustReason.trim() || `Ajuste rápido de stock (${movType})`,
        executedBy: currentUser?.name || "Admin",
      });

      triggerAppNotification(
        "Stock Ajustado",
        `Stock de "${quickAdjustInsumo.name}" actualizado a ${newStock} ${quickAdjustInsumo.unit}.`,
        "success"
      );
      setQuickAdjustInsumo(null);
      setQuickAdjustQty("");
      setQuickAdjustReason("");
    } catch (err) {
      console.error(err);
      alert("Error al ajustar stock.");
    }
  };

  // Recipe helpers
  const calculateProductCost = (prod: any) => {
    if (!prod?.recipe || !Array.isArray(prod.recipe)) return 0;
    return prod.recipe.reduce((total: number, ing: any) => {
      const invItem = inventory.find((i) => i.id === ing.inventoryItemId);
      const unitCost = Number(invItem?.cost) || 0;
      return total + unitCost * (Number(ing.quantity) || 0);
    }, 0);
  };

  const handleUpdateProductInventoryType = async (prod: any, newType: string) => {
    try {
      const updatedProduct = {
        ...prod,
        inventoryType: newType,
      };
      await updateProductInFirebase(prod.id, updatedProduct);
      if (selectedRecipeProduct?.id === prod.id) {
        setSelectedRecipeProduct(updatedProduct);
      }
      const label =
        newType === "receta"
          ? "Por Receta (Insumos)"
          : newType === "pieza"
          ? "Por Pieza"
          : newType === "bulto"
          ? "Por Bulto"
          : newType === "caja"
          ? "Por Caja"
          : "Sin Inventario";
      triggerAppNotification(
        "Modo de Inventario Actualizado",
        `"${prod.name}" configurado como "${label}".`,
        "success"
      );
    } catch (err) {
      console.error(err);
      triggerAppNotification("Error", "No se pudo actualizar el modo de inventario.", "error");
    }
  };

  const handleInlinePriceChange = async (prod: any, newPriceStr: string) => {
    const val = parseFloat(newPriceStr);
    if (isNaN(val) || val < 0) return;
    if (val === Number(prod.price)) return;
    try {
      await updateProductInFirebase(prod.id, { ...prod, price: val });
      triggerAppNotification(
        "Precio Actualizado ⚡",
        `"${prod.name}": $${val.toFixed(2)}`,
        "success"
      );
    } catch (err) {
      console.error(err);
      triggerAppNotification("Error", "No se pudo actualizar el precio.", "error");
    }
  };

  const handleBulkApplyInsumo = async (targetProducts: any[]) => {
    if (!bulkInsumoId) {
      triggerAppNotification("Atención ⚠️", "Selecciona un insumo para aplicar a los platillos.", "warning");
      return;
    }
    const qty = parseFloat(bulkInsumoQty);
    if (isNaN(qty) || qty <= 0) {
      triggerAppNotification("Atención ⚠️", "Ingresa una cantidad o porción válida mayor a cero.", "warning");
      return;
    }
    if (targetProducts.length === 0) {
      triggerAppNotification("Atención ⚠️", "No hay productos en el filtro o selección actual.", "warning");
      return;
    }

    const insumo = inventory.find((i) => i.id === bulkInsumoId);
    const insumoName = insumo?.name || "Insumo";
    const insumoUnit = insumo?.unit || "unidad";

    setIsApplyingBulk(true);
    try {
      for (const prod of targetProducts) {
        const currentRecipe = [...(prod.recipe || [])];
        const existingIdx = currentRecipe.findIndex((r: any) => r.inventoryItemId === bulkInsumoId);
        if (existingIdx >= 0) {
          currentRecipe[existingIdx] = {
            ...currentRecipe[existingIdx],
            quantity: qty,
          };
        } else {
          currentRecipe.push({
            inventoryItemId: bulkInsumoId,
            quantity: qty,
          });
        }
        await updateProductInFirebase(prod.id, {
          ...prod,
          recipe: currentRecipe,
          inventoryType: "receta",
        });
      }
      triggerAppNotification(
        "¡Insumo Asignado en Lote! ⚡🍲",
        `Se agregó "${qty} ${insumoUnit} de ${insumoName}" a ${targetProducts.length} platillos con éxito.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      triggerAppNotification("Error", "Ocurrió un error al aplicar el insumo en lote.", "error");
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const handleBulkRemoveInsumo = async (targetProducts: any[]) => {
    if (!bulkInsumoId) {
      triggerAppNotification("Atención ⚠️", "Selecciona el insumo que deseas retirar de los platillos.", "warning");
      return;
    }
    const insumo = inventory.find((i) => i.id === bulkInsumoId);
    const insumoName = insumo?.name || "Insumo";

    if (!window.confirm(`¿Seguro que deseas retirar el insumo "${insumoName}" de los ${targetProducts.length} platillos filtrados?`)) {
      return;
    }

    setIsApplyingBulk(true);
    try {
      for (const prod of targetProducts) {
        const currentRecipe = (prod.recipe || []).filter((r: any) => r.inventoryItemId !== bulkInsumoId);
        await updateProductInFirebase(prod.id, { ...prod, recipe: currentRecipe });
      }
      triggerAppNotification(
        "Insumo Retirado en Lote 🗑️",
        `Se retiró "${insumoName}" de ${targetProducts.length} platillos.`,
        "info"
      );
    } catch (err) {
      console.error(err);
      triggerAppNotification("Error", "Error al retirar insumo en lote.", "error");
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const handleBulkChangeInventoryType = async (targetProducts: any[], newType: string) => {
    if (targetProducts.length === 0) return;
    setIsApplyingBulk(true);
    try {
      for (const prod of targetProducts) {
        await updateProductInFirebase(prod.id, { ...prod, inventoryType: newType });
      }
      const label =
        newType === "receta"
          ? "Por Receta (Insumos)"
          : newType === "pieza"
          ? "Por Pieza"
          : newType === "bulto"
          ? "Por Bulto"
          : newType === "caja"
          ? "Por Caja"
          : "Sin Inventario";
      triggerAppNotification(
        "Modo de Inventario en Lote ⚡",
        `Se configuraron ${targetProducts.length} platillos como "${label}".`,
        "success"
      );
    } catch (err) {
      console.error(err);
      triggerAppNotification("Error", "Error al actualizar modo en lote.", "error");
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const isProductInCategory = (prod: any, catId: string) => {
    const rawCat = (prod.category || "").toLowerCase().trim();
    if (catId === "food") {
      return (
        rawCat === "food" ||
        rawCat === "alimentos" ||
        rawCat === "comida" ||
        rawCat === "platillos" ||
        rawCat === "entradas" ||
        rawCat === "tacos" ||
        rawCat === "tlayudas" ||
        (!rawCat && !isProductInCategory(prod, "drinks") && !isProductInCategory(prod, "desserts"))
      );
    }
    if (catId === "drinks") {
      return (
        rawCat === "drinks" ||
        rawCat === "bebidas" ||
        rawCat === "bebida" ||
        rawCat === "refrescos" ||
        rawCat === "cervezas" ||
        rawCat === "cocteleria" ||
        rawCat === "aguas" ||
        rawCat === "cafe" ||
        rawCat === "café"
      );
    }
    if (catId === "desserts") {
      return rawCat === "desserts" || rawCat === "postres" || rawCat === "postre";
    }
    return rawCat === catId.toLowerCase();
  };

  const normalizeSearchText = (str: string) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const matchProductSearchQuery = (prod: any, query: string) => {
    if (!query || !query.trim()) return true;
    const normalizedQuery = normalizeSearchText(query);
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;

    const prodName = normalizeSearchText(prod.name);
    const prodSub = normalizeSearchText(prod.subcategory);
    const prodDesc = normalizeSearchText(prod.description);
    const prodCat = normalizeSearchText(prod.category);
    const fullTarget = `${prodName} ${prodSub} ${prodDesc} ${prodCat}`;

    // All terms in the query must match against the product text
    return terms.every((term) => {
      if (fullTarget.includes(term)) return true;
      // Stemming: tacos -> taco, ordenes -> orden, etc.
      if (term.endsWith("s") && term.length > 3 && fullTarget.includes(term.slice(0, -1))) {
        return true;
      }
      if (term.endsWith("es") && term.length > 4 && fullTarget.includes(term.slice(0, -2))) {
        return true;
      }
      return false;
    });
  };

  const handleAddIngredientToRecipe = async () => {
    if (!selectedRecipeProduct || !selectedIngredientId) return;
    const qty = parseFloat(selectedIngredientQty);
    if (isNaN(qty) || qty <= 0) {
      alert("Ingresa una porción/cantidad mayor a cero.");
      return;
    }

    const currentRecipe = [...(selectedRecipeProduct.recipe || [])];
    const existingIndex = currentRecipe.findIndex(
      (r) => r.inventoryItemId === selectedIngredientId
    );

    if (existingIndex >= 0) {
      currentRecipe[existingIndex] = {
        ...currentRecipe[existingIndex],
        quantity: qty,
      };
    } else {
      currentRecipe.push({
        inventoryItemId: selectedIngredientId,
        quantity: qty,
      });
    }

    try {
      await updateProductInFirebase(selectedRecipeProduct.id, {
        ...selectedRecipeProduct,
        recipe: currentRecipe,
      });
      setSelectedRecipeProduct({
        ...selectedRecipeProduct,
        recipe: currentRecipe,
      });
      setShowAddIngredientModal(false);
      setSelectedIngredientId("");
      setSelectedIngredientQty("");
      setIngredientSearchQuery("");
      triggerAppNotification(
        "Receta Actualizada",
        `Se agregó ingrediente al escandallo de "${selectedRecipeProduct.name}".`,
        "success"
      );
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la receta del platillo.");
    }
  };

  const handleRemoveIngredientFromRecipe = async (inventoryItemId: string) => {
    if (!selectedRecipeProduct) return;
    const currentRecipe = (selectedRecipeProduct.recipe || []).filter(
      (r: any) => r.inventoryItemId !== inventoryItemId
    );

    try {
      await updateProductInFirebase(selectedRecipeProduct.id, {
        ...selectedRecipeProduct,
        recipe: currentRecipe,
      });
      setSelectedRecipeProduct({
        ...selectedRecipeProduct,
        recipe: currentRecipe,
      });
      triggerAppNotification(
        "Ingrediente Eliminado",
        `Se retiró el insumo de la receta.`,
        "info"
      );
    } catch (err) {
      console.error(err);
      alert("Error al remover el ingrediente.");
    }
  };

  // Physical Audit Apply
  const handleApplyAuditAdjustments = async () => {
    const changes: Array<{ item: any; diff: number; realQty: number }> = [];

    inventory.forEach((item) => {
      if (physicalCounts[item.id] !== undefined) {
        const theoretical = Number(item.stock) || 0;
        const real = Number(physicalCounts[item.id]);
        const diff = real - theoretical;
        if (diff !== 0) {
          changes.push({ item, diff, realQty: real });
        }
      }
    });

    if (changes.length === 0) {
      alert("No hay diferencias detectadas entre el conteo físico y el stock del sistema.");
      return;
    }

    if (
      !window.confirm(
        `Se aplicarán ajustes de inventario para ${changes.length} insumo(s). ¿Deseas continuar?`
      )
    ) {
      return;
    }

    try {
      for (const change of changes) {
        await updateInventoryItemInFirebase(change.item.id, {
          stock: change.realQty,
        });

        await addInventoryMovementToFirebase({
          inventoryItemId: change.item.id,
          type: change.diff < 0 ? "merma" : "ajuste_fisico",
          qty: change.diff,
          concept: `Auditoría física de almacén: Conteo real ${change.realQty} vs Teórico ${change.item.stock} ${change.item.unit}`,
          executedBy: currentUser?.name || "Auditor / Admin",
        });
      }

      setPhysicalCounts({});
      triggerAppNotification(
        "Auditoría Asentada",
        `Se actualizaron ${changes.length} insumos y se registraron sus movimientos de merma/ajuste.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      alert("Error al aplicar los ajustes de auditoría.");
    }
  };

  // Excel Export Helpers
  const exportInsumosToExcel = () => {
    const data = inventory.map((i) => ({
      ID: i.id,
      Nombre: i.name,
      Categoría: i.category || "Ingredientes",
      Unidad: i.unit || "pza",
      "Costo Unitario ($)": Number(i.cost) || 0,
      "Stock Actual": Number(i.stock) || 0,
      "Stock Mínimo": Number(i.minStock) || 0,
      "Valorización Total ($)": (Number(i.stock) || 0) * (Number(i.cost) || 0),
      "Alerta Stock": (Number(i.stock) || 0) <= (Number(i.minStock) || 0) ? "STOCK BAJO" : "OK",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catálogo de Insumos");
    XLSX.writeFile(wb, `Inventario_${selectedTenant?.name || "Sucursal"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportKardexToExcel = () => {
    const data = inventoryMovements.map((m) => {
      const inv = inventory.find((i) => i.id === m.inventoryItemId);
      return {
        "Fecha / Hora": m.timestamp || m.updatedAt || "-",
        Insumo: inv?.name || m.inventoryItemId,
        Unidad: inv?.unit || "pza",
        "Tipo Movimiento": m.type,
        Cantidad: m.qty,
        "Concepto / Detalle": m.concept || "-",
        Responsable: m.executedBy || "Sistema",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kardex de Movimientos");
    XLSX.writeFile(wb, `Kardex_${selectedTenant?.name || "Sucursal"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportAuditToExcel = () => {
    const data = inventory.map((item) => {
      const theoretical = Number(item.stock) || 0;
      const physical = physicalCounts[item.id] !== undefined ? Number(physicalCounts[item.id]) : theoretical;
      const diff = physical - theoretical;
      const unitCost = Number(item.cost) || 0;
      const financialDiff = diff * unitCost;

      return {
        Insumo: item.name,
        Categoría: item.category || "Ingredientes",
        Unidad: item.unit || "pza",
        "Costo Unitario ($)": unitCost,
        "Stock Teórico": theoretical,
        "Conteo Físico Real": physical,
        "Diferencia (Uds)": diff,
        "Impacto Económico ($)": financialDiff,
        Estado: diff === 0 ? "CUADRADO" : diff < 0 ? "FALTANTE / MERMA" : "SOBRANTE",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Auditoria Fisica");
    XLSX.writeFile(wb, `Auditoria_Almacen_${selectedTenant?.name || "Sucursal"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // AI Generator function
  const handleRunAiInsumosGenerator = async () => {
    setIsGeneratingIA(true);
    const apiKey =
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("local_gemini_api_key") ||
      ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
      "";

    const activeMenu = products
      .filter((p) => !p.isDeleted)
      .slice(0, 40)
      .map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price }));

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const prompt = `Eres un chef ejecutivo y auditor de costos para restaurantes y taquerías mexicanas.
Dado este menú de platillos: ${JSON.stringify(activeMenu)}
Genera una lista de insumos de materia prima recomendados y sugerencias de recetas estándar con sus porciones exactas.
Devuelve un JSON estructurado con:
{
  "insumos": [
    { "name": "Tortillas de maíz kg", "category": "Ingredientes", "unit": "kg", "cost": 24, "stock": 10, "minStock": 5 },
    { "name": "Carne de Pastor Marinada kg", "category": "Carnes", "unit": "kg", "cost": 140, "stock": 15, "minStock": 5 }
  ],
  "recipes": [
    { "productName": "Taco al Pastor", "ingredients": [{ "insumoName": "Tortillas de maíz kg", "quantity": 0.03 }, { "insumoName": "Carne de Pastor Marinada kg", "quantity": 0.08 }] }
  ]
}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              response_mime_type: "application/json",
            },
          }),
        });
        const resData = await response.json();
        const textOut = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOut) {
          const parsed = JSON.parse(textOut);
          setAiSuggestions(parsed.insumos || []);
          setIsGeneratingIA(false);
          return;
        }
      } catch (e) {
        console.warn("AI generation fallback to curated restaurant standards:", e);
      }
    }

    // Curated Fallback
    setTimeout(() => {
      const curated = [
        { name: "Tortillas de Maíz Taquera", category: "Ingredientes", unit: "kg", cost: 24, stock: 15, minStock: 5 },
        { name: "Tortillas de Harina Grandes", category: "Ingredientes", unit: "paquete", cost: 35, stock: 10, minStock: 3 },
        { name: "Carne de Pastor Marinada", category: "Carnes", unit: "kg", cost: 145, stock: 20, minStock: 8 },
        { name: "Bistec / Asada Calidad", category: "Carnes", unit: "kg", cost: 185, stock: 15, minStock: 5 },
        { name: "Queso Oaxaca / Hebra", category: "Ingredientes", unit: "kg", cost: 130, stock: 12, minStock: 4 },
        { name: "Cebolla Blanca", category: "Ingredientes", unit: "kg", cost: 22, stock: 10, minStock: 3 },
        { name: "Cilantro Fresco", category: "Ingredientes", unit: "manojo", cost: 10, stock: 8, minStock: 2 },
        { name: "Limón con Semilla", category: "Ingredientes", unit: "kg", cost: 38, stock: 12, minStock: 4 },
        { name: "Aguacate Hass", category: "Ingredientes", unit: "kg", cost: 75, stock: 6, minStock: 2 },
        { name: "Refresco Coca-Cola 355ml", category: "Bebidas", unit: "pza", cost: 14, stock: 48, minStock: 24 },
        { name: "Platos Térmicos / Desechables", category: "Desechables", unit: "paquete", cost: 45, stock: 5, minStock: 2 },
      ];
      setAiSuggestions(curated);
      setIsGeneratingIA(false);
    }, 600);
  };

  const handleApplyAiInsumo = async (item: any) => {
    try {
      await addInventoryItemToFirebase({
        id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: item.name,
        category: item.category || "Ingredientes",
        unit: item.unit || "kg",
        cost: Number(item.cost) || 0,
        stock: Number(item.stock) || 0,
        minStock: Number(item.minStock) || 5,
        createdAt: getMexicoISOString(),
      });
      setAiSuggestions((prev) => prev.filter((s) => s.name !== item.name));
      triggerAppNotification(
        "Insumo Agregado",
        `Se agregó "${item.name}" desde las sugerencias de IA.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      alert("Error al agregar el insumo.");
    }
  };

  const handleApplyAllAiInsumos = async () => {
    try {
      for (const item of aiSuggestions) {
        await addInventoryItemToFirebase({
          id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: item.name,
          category: item.category || "Ingredientes",
          unit: item.unit || "kg",
          cost: Number(item.cost) || 0,
          stock: Number(item.stock) || 0,
          minStock: Number(item.minStock) || 5,
          createdAt: getMexicoISOString(),
        });
      }
      triggerAppNotification(
        "Insumos Importados",
        `Se agregaron ${aiSuggestions.length} insumos al catálogo exitosamente.`,
        "success"
      );
      setAiSuggestions([]);
    } catch (err) {
      console.error(err);
      alert("Error al importar todos los insumos.");
    }
  };

  return (
    <IonPage>
      {renderMaterialHeader({
        title: "Control de Inventarios y Almacén 📦",
        subtitle: `Sucursal: ${selectedTenant?.name || "Matriz"} · ${inventory.length} insumos · ${productsWithRecipes} recetas`,
        showBack: true,
        onBack: () => {
          if (activeTab !== null) {
            setActiveTab(null);
          } else {
            setAppMode("floorplan");
          }
        },
      })}

      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div className="max-w-7xl mx-auto py-2">
          {/* Main Widget Control Center (When activeTab is null) */}
          {activeTab === null ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Insumos Registrados
                    </span>
                    <span className="text-2xl font-black text-slate-800">
                      {totalInsumos}
                    </span>
                  </div>
                  <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                    🥩
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Valorización en Bodega
                    </span>
                    <span className="text-2xl font-black text-emerald-600">
                      ${totalStockValuation.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                    💰
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Alertas de Stock Bajo
                    </span>
                    <span
                      className={`text-2xl font-black ${
                        lowStockInsumos > 0 ? "text-rose-600" : "text-slate-800"
                      }`}
                    >
                      {lowStockInsumos}
                    </span>
                  </div>
                  <span
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
                      lowStockInsumos > 0
                        ? "bg-rose-50 text-rose-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    ⚠️
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Recetas y Escandallos
                    </span>
                    <span className="text-2xl font-black text-indigo-600">
                      {productsWithRecipes} / {products.filter((p) => !p.isDeleted).length}
                    </span>
                  </div>
                  <span className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                    🍲
                  </span>
                </div>
              </div>

              {/* Dashboard Banner & Widgets Grid */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🛠️</span>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">
                      Módulos y Widgets de Gestión de Almacén
                    </h2>
                    <p className="text-xs text-slate-500">
                      Selecciona un bloque para gestionar insumos, escandallos de costos, proveedores, arqueo físico y movimientos en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                  {[
                    {
                      id: "recipes" as const,
                      title: "Gestión de productos por recetas y modo de inventario",
                      emoji: "🍲",
                      color: "#10b981",
                      description:
                        "Configura cómo descuenta inventario cada platillo (por pieza, por bulto, por caja o por receta) y asocia los insumos y porciones exactas como en el menú del cajero.",
                      actionExplanation:
                        "Visualiza productos por categorías (Alimentos, Bebidas, Postres) y asigna recetas con descuento automático por comanda.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%)",
                      borderColor: "#10b981",
                      stat: `${productsWithRecipes} de ${products.filter((p) => !p.isDeleted).length} con Receta`,
                    },
                    {
                      id: "insumos" as const,
                      title: "Catálogo de Insumos y Stock",
                      emoji: "🥩",
                      color: "#3b82f6",
                      description:
                        "Registra materias primas, unidades de medida (kg, g, lt, ml, pza), costos unitarios, stock actual y stock mínimo de alerta.",
                      actionExplanation:
                        "Base de datos de ingredientes que se descontarán automáticamente con cada comanda cobrada en el punto de venta.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      borderColor: "#3b82f6",
                      stat: `${inventory.length} Insumos Registrados`,
                    },
                    {
                      id: "purchases_suppliers" as const,
                      title: "Compras y Proveedores",
                      emoji: "🛒",
                      color: "#8b5cf6",
                      description:
                        "Directorio de proveedores y registro de facturas o notas de remisión. Alimenta las entradas de almacén y egresos de caja.",
                      actionExplanation:
                        "Registra compras al contado o a crédito, recalculando automáticamente el stock y afectando el arqueo de caja si se liquida en turno.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      borderColor: "#8b5cf6",
                      stat: `${suppliers.length} Proveedores / ${purchases.length} Compras`,
                    },
                    {
                      id: "physical_audit" as const,
                      title: "Conteo Físico vs Teórico",
                      emoji: "⚖️",
                      color: "#f59e0b",
                      description:
                        "Herramienta de auditoría para bodega y refrigeradores. Captura el conteo real y compara con el sistema para detectar mermas o faltantes.",
                      actionExplanation:
                        "Genera el balance de diferencias en unidades y dinero, permitiendo aplicar el ajuste definitivo al stock en un solo clic.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      borderColor: "#f59e0b",
                      stat: "Auditoría de Almacén",
                    },
                    {
                      id: "kardex_movements" as const,
                      title: "Kardex y Movimientos",
                      emoji: "📉",
                      color: "#ef4444",
                      description:
                        "Historial cronológico de todos los movimientos: compras, ventas automáticas por comandas, mermas y ajustes con exportación a Excel.",
                      actionExplanation:
                        "Trazabilidad completa para auditoría contable y detección de fugas de producto en tiempo real.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      borderColor: "#ef4444",
                      stat: `${inventoryMovements.length} Movimientos Registrados`,
                    },
                    {
                      id: "ia_insumos" as const,
                      title: "Generador Insumos IA ✨",
                      emoji: "✨",
                      color: "#06b6d4",
                      description:
                        "Inteligencia Artificial Gemini para analizar tu carta de menú y sugerir automáticamente catálogo de insumos y porciones estándar.",
                      actionExplanation:
                        "Acelera la configuración inicial generando recetas y materias primas típicas para restaurantes con un solo clic.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      borderColor: "#06b6d4",
                      stat: "Asistente Gemini AI",
                    },
                  ].map((w) => (
                    <motion.div
                      key={w.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(w.id)}
                      className="cursor-pointer rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group hover:border-slate-400"
                      style={{ background: w.bgGradient }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl p-2.5 rounded-2xl bg-white/80 shadow-xs border border-slate-100">
                            {w.emoji}
                          </span>
                          <span
                            className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full text-white shadow-xs"
                            style={{ background: w.color }}
                          >
                            {w.stat}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-800 group-hover:text-slate-950">
                            {w.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {w.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="truncate pr-2">{w.actionExplanation}</span>
                        <span className="text-base text-slate-700 font-black">→</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Sub-View Container (when a widget tab is active) */
            <div className="space-y-4">
              {/* Back Bar */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer border-none"
                >
                  <IonIcon icon={arrowBackOutline} />
                  <span>Volver al Panel de Widgets</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-400">Módulo:</span>
                  <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                    {activeTab === "insumos" && "Catálogo de Insumos 🥩"}
                    {activeTab === "recipes" && "Escandallos y Recetas 🍲"}
                    {activeTab === "purchases_suppliers" && "Compras y Proveedores 🛒"}
                    {activeTab === "physical_audit" && "Conteo Físico vs Teórico ⚖️"}
                    {activeTab === "kardex_movements" && "Kardex y Movimientos 📉"}
                    {activeTab === "ia_insumos" && "Generador Insumos IA ✨"}
                  </span>
                </div>
              </div>

              {/* ========================================================= */}
              {/* TAB 1: INSUMOS (MATERIA PRIMA & STOCK) */}
              {/* ========================================================= */}
              {activeTab === "insumos" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <span>🥩</span> Catálogo de Insumos y Materia Prima ({inventory.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Administra ingredientes, bebidas y suministros con sus unidades de medida, costos y stock.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={exportInsumosToExcel}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                      >
                        <IonIcon icon={downloadOutline} />
                        <span>Exportar Excel</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenNewInsumo}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer border-none"
                      >
                        <IonIcon icon={addOutline} />
                        <span>Nuevo Insumo</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters & Search */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 relative">
                      <IonIcon
                        icon={searchOutline}
                        className="absolute left-3 top-3 text-slate-400 text-base"
                      />
                      <input
                        type="text"
                        placeholder="Buscar insumo por nombre..."
                        value={insumoSearch}
                        onChange={(e) => setInsumoSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="sm:col-span-6 flex flex-wrap gap-1.5 items-center">
                      {[
                        "TODOS",
                        "Ingredientes",
                        "Carnes",
                        "Bebidas",
                        "Abarrotes",
                        "Desechables",
                        "Otros",
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setInsumoCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            insumoCategoryFilter === cat
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table of Insumos */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                          <th className="p-3">Insumo</th>
                          <th className="p-3">Categoría</th>
                          <th className="p-3 text-center">Unidad</th>
                          <th className="p-3 text-right">Costo Unit.</th>
                          <th className="p-3 text-center">Stock Actual</th>
                          <th className="p-3 text-center">Stock Mínimo</th>
                          <th className="p-3 text-right">Valorizado</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {inventory
                          .filter((i) => {
                            if (insumoCategoryFilter !== "TODOS" && (i.category || "Ingredientes") !== insumoCategoryFilter) {
                              return false;
                            }
                            if (!insumoSearch.trim()) return true;
                            return (i.name || "")
                              .toLowerCase()
                              .includes(insumoSearch.toLowerCase());
                          })
                          .map((item) => {
                            const isLow = (Number(item.stock) || 0) <= (Number(item.minStock) || 0);
                            const valTotal = (Number(item.stock) || 0) * (Number(item.cost) || 0);
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                <td className="p-3 font-black text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <span>{item.name}</span>
                                    {isLow && (
                                      <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                        ⚠️ Stock Bajo
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold">
                                    {item.category || "Ingredientes"}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-bold text-indigo-600">
                                  {item.unit || "pza"}
                                </td>
                                <td className="p-3 text-right font-black text-slate-900">
                                  ${(Number(item.cost) || 0).toFixed(2)}
                                </td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full font-black text-xs inline-block ${
                                      isLow
                                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    }`}
                                  >
                                    {item.stock ?? 0} {item.unit}
                                  </span>
                                </td>
                                <td className="p-3 text-center text-slate-500 font-bold">
                                  {item.minStock ?? 5}
                                </td>
                                <td className="p-3 text-right font-black text-emerald-700">
                                  ${valTotal.toFixed(2)}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQuickAdjustInsumo(item);
                                        setQuickAdjustQty("");
                                        setQuickAdjustReason("");
                                        setQuickAdjustType("ajuste");
                                      }}
                                      title="Ajuste Rápido de Stock"
                                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition border border-amber-200 cursor-pointer"
                                    >
                                      ⚡
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditInsumo(item)}
                                      title="Editar Insumo"
                                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 cursor-pointer"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteInsumo(item)}
                                      title="Eliminar Insumo"
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 cursor-pointer"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 1: GESTIÓN DE PRODUCTOS POR RECETAS Y MODO DE INVENTARIO */}
              {/* ========================================================= */}
              {activeTab === "recipes" && (
                <div className="space-y-5">
                  {/* Top Bar with Category Segments & POS-style buttons */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <span>🍲</span> Gestión de Productos por Recetas y Modo de Inventario
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Visualiza los productos como en el menú del cajero por categorías (Alimentos, Bebidas, Postres) y configura su tipo de inventario y escandallos.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition self-start md:self-auto cursor-pointer border border-slate-200"
                      >
                        <IonIcon icon={arrowBackOutline} />
                        <span>Volver a Módulos</span>
                      </button>
                    </div>

                    {/* POS-Style Main Category Buttons (Alimentos, Bebidas, Postres, etc.) */}
                    <div className="flex flex-wrap items-center gap-3">
                      {[
                        { id: "food", name: "Alimentos", emoji: "🍽️", color: "#ef4444", bgActive: "bg-red-500", borderActive: "border-red-500", textActive: "text-white" },
                        { id: "drinks", name: "Bebidas", emoji: "🥤", color: "#3b82f6", bgActive: "bg-blue-600", borderActive: "border-blue-600", textActive: "text-white" },
                        { id: "desserts", name: "Postres", emoji: "🍰", color: "#f59e0b", bgActive: "bg-amber-500", borderActive: "border-amber-500", textActive: "text-white" },
                      ].map((cat) => {
                        const isSelected = recipeActiveCategory === cat.id;
                        const count = products.filter((p) => !p.isDeleted && isProductInCategory(p, cat.id)).length;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setRecipeActiveCategory(cat.id);
                              setRecipeActiveSubcategory("Todos");
                            }}
                            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-xs cursor-pointer border ${
                              isSelected
                                ? `${cat.bgActive} ${cat.borderActive} ${cat.textActive} shadow-md scale-105`
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span className="text-xl">{cat.emoji}</span>
                            <span>{cat.name}</span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Subcategories Horizontal Scroll Bar */}
                    {(() => {
                      const subcats = Array.from(
                        new Set(
                          products
                            .filter((p) => !p.isDeleted && isProductInCategory(p, recipeActiveCategory))
                            .map((p) => p.subcategory)
                            .filter(Boolean)
                        )
                      ).sort();

                      if (subcats.length === 0) return null;

                      return (
                        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">
                            Subcategoría:
                          </span>
                          <button
                            type="button"
                            onClick={() => setRecipeActiveSubcategory("Todos")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                              recipeActiveSubcategory === "Todos"
                                ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Todos
                          </button>
                          {subcats.map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setRecipeActiveSubcategory(sub)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                                recipeActiveSubcategory === sub
                                  ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Search & Inventory Mode Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <div className="relative flex-1 w-full">
                        <IonIcon
                          icon={searchOutline}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"
                        />
                        <input
                          type="text"
                          placeholder="🔍 Buscar por cualquier palabra (ej: tacos har, pastor, arrachera)..."
                          value={recipeProductSearch}
                          onChange={(e) => setRecipeProductSearch(e.target.value)}
                          className="w-full pl-10 pr-36 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold outline-none transition shadow-2xs"
                        />
                        {recipeProductSearch.trim() !== "" && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setRecipeProductSearch("");
                                setSelectedProductIds([]);
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-black px-2.5 py-1 rounded-lg transition flex items-center gap-1 border border-rose-200 cursor-pointer shadow-2xs"
                              title="Limpiar búsqueda para volver a capturar"
                            >
                              <IonIcon icon={closeCircleOutline} className="text-sm" />
                              <span>Limpiar búsqueda</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Filter by Inventory Type */}
                      <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                        {[
                          { id: "TODOS", label: "Todos" },
                          { id: "receta", label: "🍲 Por Receta" },
                          { id: "pieza", label: "📦 Por Pieza" },
                          { id: "bulto", label: "📦 Por Bulto" },
                          { id: "caja", label: "📦 Por Caja" },
                          { id: "none", label: "⚪ Sin Control" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setRecipeInventoryTypeFilter(f.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer border ${
                              recipeInventoryTypeFilter === f.id
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Computed Filtered Products List */}
                  {(() => {
                    const isSearching = recipeProductSearch.trim().length > 0;

                    const filteredRecipeProducts = products
                      .filter((p) => !p.isDeleted)
                      .filter((p) => {
                        // When searching, match across category or search globally within menu
                        if (isSearching) {
                          return isProductInCategory(p, recipeActiveCategory) || matchProductSearchQuery(p, recipeProductSearch);
                        }
                        return isProductInCategory(p, recipeActiveCategory);
                      })
                      .filter((p) => {
                        // When searching text, search across all subcategories so nothing is hidden
                        if (!isSearching && recipeActiveSubcategory && recipeActiveSubcategory !== "Todos") {
                          return p.subcategory === recipeActiveSubcategory;
                        }
                        return true;
                      })
                      .filter((p) => matchProductSearchQuery(p, recipeProductSearch))
                      .filter((p) => {
                        const invType = p.inventoryType || (p.recipe && p.recipe.length > 0 ? "receta" : "none");
                        if (recipeInventoryTypeFilter === "TODOS") return true;
                        if (recipeInventoryTypeFilter === "receta") return invType === "receta" || (p.recipe && p.recipe.length > 0);
                        if (recipeInventoryTypeFilter === "pieza") return invType === "pieza";
                        if (recipeInventoryTypeFilter === "bulto") return invType === "bulto";
                        if (recipeInventoryTypeFilter === "caja") return invType === "caja";
                        if (recipeInventoryTypeFilter === "none") return invType === "none" && (!p.recipe || p.recipe.length === 0);
                        return true;
                      });

                    const targetBulkProducts = selectedProductIds.length > 0
                      ? filteredRecipeProducts.filter((p) => selectedProductIds.includes(p.id))
                      : filteredRecipeProducts;

                    return (
                      <div className="space-y-4">
                        {/* ========================================================= */}
                        {/* BARRA DE ASIGNACIÓN MASIVA PARA PRODUCTOS FILTRADOS ⚡ */}
                        {/* ========================================================= */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-black text-white flex items-center gap-1.5">
                                <span>⚡</span> Acciones Masivas al Vuelo:
                              </span>
                              <span className="bg-indigo-600/80 text-white font-black text-xs px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                                {targetBulkProducts.length} {selectedProductIds.length > 0 ? "Seleccionados" : "Filtrados"}
                              </span>
                              {recipeActiveSubcategory !== "Todos" && (
                                <span className="bg-slate-800 text-indigo-200 text-xs font-semibold px-2 py-0.5 rounded-md">
                                  📂 {recipeActiveSubcategory}
                                </span>
                              )}
                            </div>

                            {/* Selection Helpers */}
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedProductIds.length === filteredRecipeProducts.length) {
                                    setSelectedProductIds([]);
                                  } else {
                                    setSelectedProductIds(filteredRecipeProducts.map((p) => p.id));
                                  }
                                }}
                                className="text-[11px] font-bold text-indigo-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition border-none cursor-pointer"
                              >
                                {selectedProductIds.length === filteredRecipeProducts.length && filteredRecipeProducts.length > 0
                                  ? "Deseleccionar Todos"
                                  : `Seleccionar Todos (${filteredRecipeProducts.length})`}
                              </button>
                              {selectedProductIds.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedProductIds([])}
                                  className="text-[11px] font-bold text-rose-300 hover:text-rose-100 bg-rose-500/20 px-2 py-1 rounded-lg transition border-none cursor-pointer"
                                >
                                  ✕ Limpiar
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Bulk Form Controls */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                            {/* Insumo Selector */}
                            <div className="lg:col-span-5">
                              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                                🍲 Seleccionar Insumo a Descontar:
                              </label>
                              <select
                                value={bulkInsumoId}
                                onChange={(e) => setBulkInsumoId(e.target.value)}
                                className="w-full p-2 bg-slate-800/90 text-white border border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-indigo-400"
                              >
                                <option value="">-- Elige Insumo (ej. Tortilla de Harina, Bistec, Queso...) --</option>
                                {inventory.map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} ({i.unit}) — ${(Number(i.cost) || 0).toFixed(2)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Insumo Quantity */}
                            <div className="lg:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                                Cantidad ({inventory.find((i) => i.id === bulkInsumoId)?.unit || "porción"}):
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder="1"
                                value={bulkInsumoQty}
                                onChange={(e) => setBulkInsumoQty(e.target.value)}
                                className="w-full p-2 bg-slate-800/90 text-white border border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-indigo-400 text-center"
                              />
                            </div>

                            {/* Bulk Apply Buttons */}
                            <div className="lg:col-span-5 flex flex-wrap gap-2 pt-3 lg:pt-0">
                              <button
                                type="button"
                                onClick={() => handleBulkApplyInsumo(targetBulkProducts)}
                                disabled={isApplyingBulk || !bulkInsumoId || filteredRecipeProducts.length === 0}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs py-2.5 px-3 rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 border-none cursor-pointer"
                                title="Agrega o actualiza este insumo y cantidad a todos los productos filtrados"
                              >
                                <i className="fa-solid fa-bolt" />
                                <span>{isApplyingBulk ? "Aplicando..." : `➕ Descontar a los ${targetBulkProducts.length}`}</span>
                              </button>

                              {bulkInsumoId && (
                                <button
                                  type="button"
                                  onClick={() => handleBulkRemoveInsumo(targetBulkProducts)}
                                  disabled={isApplyingBulk}
                                  className="bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition border-none cursor-pointer"
                                  title="Quitar este insumo de la receta de todos los filtrados"
                                >
                                  🗑️ Quitar
                                </button>
                              )}

                              <div className="w-full flex items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-400 font-bold shrink-0">O cambiar modo a:</span>
                                <select
                                  value={bulkTargetInventoryType}
                                  onChange={(e) => setBulkTargetInventoryType(e.target.value)}
                                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold px-2 py-1 outline-none"
                                >
                                  <option value="receta">🍲 Por Receta</option>
                                  <option value="pieza">📦 Por Pieza</option>
                                  <option value="bulto">🎒 Por Bulto</option>
                                  <option value="caja">🗳️ Por Caja</option>
                                  <option value="none">⚪ Sin Control</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleBulkChangeInventoryType(targetBulkProducts, bulkTargetInventoryType)}
                                  disabled={isApplyingBulk || filteredRecipeProducts.length === 0}
                                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-[11px] py-1 px-2.5 rounded-lg transition border-none cursor-pointer"
                                >
                                  Aplicar Modo ⚡
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ========================================================= */}
                        {/* TABLA INTERACTIVA TIPO EXCEL / SPREADSHEET 📊 */}
                        {/* ========================================================= */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs text-slate-700 min-w-[1080px]">
                              <thead>
                                <tr className="bg-slate-900 text-white border-b border-slate-200 font-bold text-[11px]">
                                  <th className="py-2.5 px-2.5 w-[36px] text-center">
                                    <input
                                      type="checkbox"
                                      checked={
                                        filteredRecipeProducts.length > 0 &&
                                        selectedProductIds.length === filteredRecipeProducts.length
                                      }
                                      onChange={() => {
                                        if (selectedProductIds.length === filteredRecipeProducts.length) {
                                          setSelectedProductIds([]);
                                        } else {
                                          setSelectedProductIds(filteredRecipeProducts.map((p) => p.id));
                                        }
                                      }}
                                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                                      title="Seleccionar todos los productos filtrados"
                                    />
                                  </th>
                                  <th className="py-2.5 px-2.5 w-[40px] text-center text-slate-400">#</th>
                                  <th className="py-2.5 px-2.5 min-w-[200px]">Platillo / Producto</th>
                                  <th className="py-2.5 px-2.5 w-[130px]">Subcategoría</th>
                                  <th className="py-2.5 px-2.5 w-[110px] text-right">Precio ($) ✏️</th>
                                  <th className="py-2.5 px-2.5 w-[185px]">Modo de Inventario ⚙️</th>
                                  <th className="py-2.5 px-2.5 min-w-[280px]">Insumos / Escandallo 🍲</th>
                                  <th className="py-2.5 px-2.5 w-[100px] text-right">Costo Insumos</th>
                                  <th className="py-2.5 px-2.5 w-[100px] text-right">Margen Bruto</th>
                                  <th className="py-2.5 px-2.5 w-[85px] text-center">% Ganancia</th>
                                  <th className="py-2.5 px-2.5 w-[120px] text-center">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredRecipeProducts.length === 0 ? (
                                  <tr>
                                    <td colSpan={11} className="p-8 text-center text-slate-400">
                                      <span className="text-3xl block mb-2">🔍</span>
                                      <p className="font-bold text-slate-600">No se encontraron productos con los filtros aplicados.</p>
                                      <p className="text-xs text-slate-400 mt-1">Prueba cambiando la subcategoría o la búsqueda.</p>
                                    </td>
                                  </tr>
                                ) : (
                                  filteredRecipeProducts.map((prod, idx) => {
                                    const isSelected = selectedProductIds.includes(prod.id);
                                    const currentType = prod.inventoryType || (prod.recipe && prod.recipe.length > 0 ? "receta" : "none");
                                    const recipeCost = calculateProductCost(prod);
                                    const price = Number(prod.price) || 0;
                                    const profit = price - recipeCost;
                                    const marginPercent = price > 0 ? (profit / price) * 100 : 0;
                                    const hasRecipeItems = prod.recipe && Array.isArray(prod.recipe) && prod.recipe.length > 0;

                                    return (
                                      <tr
                                        key={prod.id}
                                        className={`transition-colors ${
                                          isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50/80"
                                        }`}
                                      >
                                        {/* Checkbox */}
                                        <td className="py-2 px-2.5 text-center">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                              setSelectedProductIds((prev) =>
                                                prev.includes(prod.id)
                                                  ? prev.filter((id) => id !== prod.id)
                                                  : [...prev, prod.id]
                                              );
                                            }}
                                            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                                          />
                                        </td>

                                        {/* Row Index */}
                                        <td className="py-2 px-2.5 text-center text-[11px] text-slate-400 font-mono">
                                          {idx + 1}
                                        </td>

                                        {/* Product Name */}
                                        <td className="py-2 px-2.5">
                                          <div className="font-black text-slate-900 leading-snug">
                                            {prod.name}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono">
                                            ID: {prod.id}
                                          </div>
                                        </td>

                                        {/* Subcategory */}
                                        <td className="py-2 px-2.5">
                                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                            {prod.subcategory || "General"}
                                          </span>
                                        </td>

                                        {/* Sale Price (Editable on the fly) */}
                                        <td className="py-2 px-2.5 text-right">
                                          <div className="inline-flex items-center justify-end">
                                            <span className="text-slate-400 text-xs mr-1 font-bold">$</span>
                                            <input
                                              type="number"
                                              step="any"
                                              defaultValue={price}
                                              key={`${prod.id}-${price}`}
                                              onBlur={(e) => handleInlinePriceChange(prod, e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleInlinePriceChange(prod, (e.target as any).value);
                                                  (e.target as any).blur();
                                                }
                                              }}
                                              className="w-20 p-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-black text-slate-900 text-right outline-none transition shadow-2xs"
                                              title="Editar precio de venta al vuelo"
                                            />
                                          </div>
                                        </td>

                                        {/* Inventory Mode (Select on the fly) */}
                                        <td className="py-2 px-2.5">
                                          <select
                                            value={currentType}
                                            onChange={(e) => handleUpdateProductInventoryType(prod, e.target.value)}
                                            className={`w-full p-1.5 rounded-lg text-xs font-bold border transition outline-none cursor-pointer ${
                                              currentType === "receta"
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                                : currentType === "pieza" || currentType === "bulto" || currentType === "caja"
                                                ? "bg-blue-50 border-blue-300 text-blue-800"
                                                : "bg-slate-50 border-slate-200 text-slate-600"
                                            }`}
                                          >
                                            <option value="receta">🍲 Por Receta (Insumos)</option>
                                            <option value="pieza">📦 Por Pieza</option>
                                            <option value="bulto">🎒 Por Bulto</option>
                                            <option value="caja">🗳️ Por Caja</option>
                                            <option value="none">⚪ Sin Control / No Aplica</option>
                                          </select>
                                        </td>

                                        {/* Insumos / Escandallo Breakdown */}
                                        <td className="py-2 px-2.5">
                                          {currentType === "receta" ? (
                                            hasRecipeItems ? (
                                              <div className="flex flex-wrap gap-1 items-center">
                                                {prod.recipe.map((ing: any) => {
                                                  const inv = inventory.find((i) => i.id === ing.inventoryItemId);
                                                  return (
                                                    <span
                                                      key={ing.inventoryItemId}
                                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-slate-800"
                                                      title={`${inv?.name || "Insumo"}: ${ing.quantity} ${inv?.unit || "pza"} ($${((Number(inv?.cost) || 0) * (Number(ing.quantity) || 0)).toFixed(2)})`}
                                                    >
                                                      <span>🥩</span>
                                                      <span>{inv?.name || "Insumo"}:</span>
                                                      <strong className="text-emerald-700 font-black">
                                                        {ing.quantity} {inv?.unit || "pza"}
                                                      </strong>
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                                                <span>⚠️</span> Sin insumos asignados
                                              </span>
                                            )
                                          ) : currentType === "none" ? (
                                            <span className="text-[11px] text-slate-400 italic">
                                              No aplica escandallo
                                            </span>
                                          ) : (
                                            <span className="text-[11px] text-blue-700 font-semibold">
                                              Descuenta 1 {currentType} por orden
                                            </span>
                                          )}
                                        </td>

                                        {/* Cost of Ingredients */}
                                        <td className="py-2 px-2.5 text-right font-black text-slate-800">
                                          {currentType === "receta" ? `$${recipeCost.toFixed(2)}` : "-"}
                                        </td>

                                        {/* Gross Profit */}
                                        <td className="py-2 px-2.5 text-right font-black text-emerald-600">
                                          {currentType === "receta" ? `$${Math.max(0, profit).toFixed(2)}` : `$${price.toFixed(2)}`}
                                        </td>

                                        {/* Margin Percent */}
                                        <td className="py-2 px-2.5 text-center">
                                          {currentType === "receta" && price > 0 ? (
                                            <span
                                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                marginPercent >= 65
                                                  ? "bg-emerald-100 text-emerald-800"
                                                  : marginPercent >= 45
                                                  ? "bg-amber-100 text-amber-800"
                                                  : "bg-rose-100 text-rose-800"
                                              }`}
                                            >
                                              {marginPercent.toFixed(0)}%
                                            </span>
                                          ) : (
                                            <span className="text-slate-300 text-xs">-</span>
                                          )}
                                        </td>

                                        {/* Action Button */}
                                        <td className="py-2 px-2.5 text-center">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedRecipeProduct(prod);
                                              setSelectedIngredientId("");
                                              setSelectedIngredientQty("");
                                              setIngredientSearchQuery("");
                                              setShowAddIngredientModal(true);
                                            }}
                                            className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200 px-2.5 py-1.5 rounded-xl font-black text-[11px] transition cursor-pointer shadow-2xs"
                                            title="Abrir editor de escandallo e insumos de este platillo"
                                          >
                                            <span>🍲</span>
                                            <span>{hasRecipeItems ? "Editar" : "Insumos"}</span>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: COMPRAS Y PROVEEDORES */}
              {/* ========================================================= */}
              {activeTab === "purchases_suppliers" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <span>🤝</span> Compras y Directorio de Proveedores
                      </h2>
                      <p className="text-xs text-slate-500">
                        Gestiona tus proveedores y registra recepciones de insumos con entradas automáticas al stock.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (suppliers.length === 0) {
                            alert("Registra primero un proveedor para recibir compras.");
                            return;
                          }
                          setSelectedScheduleSupplier(suppliers[0]);
                          setSupplierPurchaseItems([]);
                          setSupplierPurchaseIsPaid(true);
                          setShowSupplierPurchaseModal(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer border-none"
                      >
                        <IonIcon icon={cartOutline} />
                        <span>Registrar Nueva Compra</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSupplierModal({ isOpen: true, supplier: null })}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <IonIcon icon={addOutline} />
                        <span>Nuevo Proveedor</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-view switcher */}
                  <div className="flex gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setPurchasesTabSubView("suppliers")}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        purchasesTabSubView === "suppliers"
                          ? "bg-slate-800 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      🤝 Proveedores ({suppliers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurchasesTabSubView("purchases")}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        purchasesTabSubView === "purchases"
                          ? "bg-slate-800 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      🛒 Historial de Compras ({purchases.length})
                    </button>
                  </div>

                  {purchasesTabSubView === "suppliers" ? (
                    /* Suppliers List */
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                            <th className="p-3">Proveedor</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3">Teléfono</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Frecuencia</th>
                            <th className="p-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {suppliers.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="p-3 font-black text-slate-800">
                                {s.name}
                              </td>
                              <td className="p-3">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
                                  {s.category || "General"}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">{s.phone || "-"}</td>
                              <td className="p-3 text-slate-600">{s.email || "-"}</td>
                              <td className="p-3 text-indigo-600 font-bold uppercase text-[10px]">
                                📅 {s.frequency || "Semanal"}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedScheduleSupplier(s);
                                      setSupplierPurchaseItems([]);
                                      setSupplierPurchaseIsPaid(true);
                                      setShowSupplierPurchaseModal(true);
                                    }}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-200"
                                  >
                                    🛒 Surtir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSupplierModal({ isOpen: true, supplier: s })}
                                    className="text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm(`¿Eliminar al proveedor "${s.name}"?`)) {
                                        await deleteSupplierFromFirebase(s.id);
                                      }
                                    }}
                                    className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition"
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Purchases History */
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                            <th className="p-3">Fecha / Hora</th>
                            <th className="p-3">Proveedor</th>
                            <th className="p-3">Insumos Recibidos</th>
                            <th className="p-3 text-center">Término</th>
                            <th className="p-3 text-right">Total Compra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {purchases.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="p-3 text-slate-600 font-bold">
                                {p.timestamp ? new Date(p.timestamp).toLocaleString("es-MX") : "-"}
                              </td>
                              <td className="p-3 font-black text-slate-800">
                                {p.supplier || "Proveedor General"}
                              </td>
                              <td className="p-3 text-slate-600">
                                {p.items && Array.isArray(p.items)
                                  ? p.items.map((i: any) => `${i.qty}x`).join(", ")
                                  : "-"}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                    p.isPaid
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {p.isPaid ? "💵 Pagado Caja" : "📄 A Crédito"}
                                </span>
                              </td>
                              <td className="p-3 text-right font-black text-slate-900 text-sm">
                                ${(Number(p.total) || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: CONTEO FÍSICO VS TEÓRICO (AUDITORÍA & MERMAS) */}
              {/* ========================================================= */}
              {activeTab === "physical_audit" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <span>⚖️</span> Auditoría de Almacén: Conteo Físico vs Teórico
                      </h2>
                      <p className="text-xs text-slate-500">
                        Captura las existencias reales en bodega/refrigerador para detectar mermas, faltantes y asentar ajustes.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={exportAuditToExcel}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                      >
                        <IonIcon icon={downloadOutline} />
                        <span>Exportar Auditoría</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyAuditAdjustments}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer border-none"
                      >
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span>Asentar Ajuste y Registrar Mermas 💾</span>
                      </button>
                    </div>
                  </div>

                  {/* Audit summary calculations */}
                  {(() => {
                    let totalDiffVal = 0;
                    let diffCount = 0;

                    inventory.forEach((i) => {
                      if (physicalCounts[i.id] !== undefined) {
                        const diff = Number(physicalCounts[i.id]) - (Number(i.stock) || 0);
                        if (diff !== 0) {
                          diffCount++;
                          totalDiffVal += diff * (Number(i.cost) || 0);
                        }
                      }
                    });

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase block">
                            Insumos Auditados
                          </span>
                          <span className="text-xl font-black text-slate-800">
                            {Object.keys(physicalCounts).length} / {inventory.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase block">
                            Insumos con Descuadre
                          </span>
                          <span
                            className={`text-xl font-black ${
                              diffCount > 0 ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            {diffCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase block">
                            Impacto Financiero Neto
                          </span>
                          <span
                            className={`text-xl font-black ${
                              totalDiffVal < 0
                                ? "text-rose-600"
                                : totalDiffVal > 0
                                ? "text-emerald-600"
                                : "text-slate-800"
                            }`}
                          >
                            ${totalDiffVal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Audit Controls & Table */}
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="🔍 Filtrar insumo..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-72 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-amber-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const initial: Record<string, number> = {};
                        inventory.forEach((i) => {
                          initial[i.id] = Number(i.stock) || 0;
                        });
                        setPhysicalCounts(initial);
                      }}
                      className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer border-none"
                    >
                      🔄 Llenar Todo con Stock Teórico
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                          <th className="p-3">Insumo</th>
                          <th className="p-3 text-center">Unidad</th>
                          <th className="p-3 text-right">Costo Unit.</th>
                          <th className="p-3 text-center">Stock Teórico</th>
                          <th className="p-3 text-center bg-amber-50/50">Conteo Físico Real</th>
                          <th className="p-3 text-center">Diferencia</th>
                          <th className="p-3 text-right">Impacto $</th>
                          <th className="p-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {inventory
                          .filter((i) => {
                            if (!auditSearch.trim()) return true;
                            return (i.name || "")
                              .toLowerCase()
                              .includes(auditSearch.toLowerCase());
                          })
                          .map((item) => {
                            const theoretical = Number(item.stock) || 0;
                            const currentVal =
                              physicalCounts[item.id] !== undefined
                                ? physicalCounts[item.id]
                                : "";
                            const realNum =
                              physicalCounts[item.id] !== undefined
                                ? Number(physicalCounts[item.id])
                                : theoretical;
                            const diff = realNum - theoretical;
                            const costUnit = Number(item.cost) || 0;
                            const diffCost = diff * costUnit;

                            return (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-3 font-black text-slate-800">
                                  {item.name}
                                </td>
                                <td className="p-3 text-center text-slate-500 font-bold">
                                  {item.unit}
                                </td>
                                <td className="p-3 text-right font-bold text-slate-600">
                                  ${costUnit.toFixed(2)}
                                </td>
                                <td className="p-3 text-center font-black text-slate-700">
                                  {theoretical}
                                </td>
                                <td className="p-3 text-center bg-amber-50/30">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder={String(theoretical)}
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setPhysicalCounts({
                                        ...physicalCounts,
                                        [item.id]: val === "" ? (0 as any) : parseFloat(val),
                                      });
                                    }}
                                    className="w-24 text-center font-black text-xs py-1.5 px-2 bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                                  />
                                </td>
                                <td className="p-3 text-center font-black">
                                  <span
                                    className={
                                      diff === 0
                                        ? "text-slate-400"
                                        : diff < 0
                                        ? "text-rose-600"
                                        : "text-emerald-600"
                                    }
                                  >
                                    {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-black">
                                  <span
                                    className={
                                      diffCost === 0
                                        ? "text-slate-400"
                                        : diffCost < 0
                                        ? "text-rose-600"
                                        : "text-emerald-600"
                                    }
                                  >
                                    ${diffCost.toFixed(2)}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {diff === 0 ? (
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                      🟢 Cuadrado
                                    </span>
                                  ) : diff < 0 ? (
                                    <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                      🔴 Merma / Faltante
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                      🟡 Sobrante
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: KARDEX Y MOVIMIENTOS */}
              {/* ========================================================= */}
              {activeTab === "kardex_movements" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <span>📉</span> Kardex y Trazabilidad de Movimientos ({inventoryMovements.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Historial completo de deducciones automáticas por ventas, compras de insumos, mermas y ajustes manuales.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={exportKardexToExcel}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                    >
                      <IonIcon icon={downloadOutline} />
                      <span>Descargar Kardex Excel</span>
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="🔍 Buscar por insumo o concepto..."
                        value={kardexSearch}
                        onChange={(e) => setKardexSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500 transition"
                      />
                    </div>

                    <div className="sm:col-span-6 flex flex-wrap gap-1.5 items-center">
                      {[
                        "TODOS",
                        "venta",
                        "compra",
                        "merma",
                        "ajuste_fisico",
                        "entrada_manual",
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setKardexTypeFilter(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            kardexTypeFilter === t
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {t === "TODOS"
                            ? "Todos"
                            : t === "venta"
                            ? "🌮 Ventas POS"
                            : t === "compra"
                            ? "🛒 Compras"
                            : t === "merma"
                            ? "⚠️ Mermas"
                            : t === "ajuste_fisico"
                            ? "⚖️ Auditoría"
                            : "📥 Entradas"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Movements Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                          <th className="p-3">Fecha / Hora</th>
                          <th className="p-3">Insumo</th>
                          <th className="p-3 text-center">Tipo Movimiento</th>
                          <th className="p-3 text-center">Cantidad</th>
                          <th className="p-3">Concepto / Detalle</th>
                          <th className="p-3 text-center">Responsable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {inventoryMovements
                          .filter((m) => {
                            if (kardexTypeFilter !== "TODOS" && m.type !== kardexTypeFilter) {
                              return false;
                            }
                            if (!kardexSearch.trim()) return true;
                            const term = kardexSearch.toLowerCase();
                            const inv = inventory.find((i) => i.id === m.inventoryItemId);
                            return (
                              (inv?.name || "").toLowerCase().includes(term) ||
                              (m.concept || "").toLowerCase().includes(term)
                            );
                          })
                          .map((m) => {
                            const inv = inventory.find((i) => i.id === m.inventoryItemId);
                            const isPositive = Number(m.qty) > 0;

                            return (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="p-3 text-slate-500 font-bold whitespace-nowrap">
                                  {m.timestamp ? new Date(m.timestamp).toLocaleString("es-MX") : "-"}
                                </td>
                                <td className="p-3 font-black text-slate-800">
                                  {inv?.name || m.inventoryItemId}
                                </td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      m.type === "venta"
                                        ? "bg-blue-100 text-blue-800"
                                        : m.type === "compra"
                                        ? "bg-purple-100 text-purple-800"
                                        : m.type === "merma"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {m.type}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-black">
                                  <span
                                    className={
                                      isPositive ? "text-emerald-600" : "text-rose-600"
                                    }
                                  >
                                    {isPositive ? `+${m.qty}` : m.qty} {inv?.unit || ""}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600 max-w-md truncate">
                                  {m.concept || "-"}
                                </td>
                                <td className="p-3 text-center text-slate-500 font-bold">
                                  {m.executedBy || "Sistema"}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: GENERADOR DE INSUMOS IA (GEMINI) */}
              {/* ========================================================= */}
              {activeTab === "ia_insumos" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <span>✨</span> Asistente de IA: Generador de Insumos y Escandallos
                      </h2>
                      <p className="text-xs text-slate-500">
                        La Inteligencia Artificial Gemini analiza los platillos activos de tu menú para generar automáticamente materias primas y recetas estándar.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingIA}
                      onClick={handleRunAiInsumosGenerator}
                      className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer border-none"
                    >
                      {isGeneratingIA ? (
                        <>
                          <IonSpinner name="crescent" style={{ width: "16px", height: "16px" }} />
                          <span>Analizando Menú con IA...</span>
                        </>
                      ) : (
                        <>
                          <IonIcon icon={sparklesOutline} />
                          <span>Generar Sugerencias de Insumos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiSuggestions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-cyan-50 p-4 rounded-2xl border border-cyan-200 text-cyan-900">
                        <span className="text-xs font-bold">
                          ✨ Se generaron {aiSuggestions.length} sugerencias de insumos optimizados para tu restaurante.
                        </span>
                        <button
                          type="button"
                          onClick={handleApplyAllAiInsumos}
                          className="bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition cursor-pointer border-none"
                        >
                          ➕ Importar Todos al Catálogo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {aiSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-black text-slate-800 text-xs">
                                  {item.name}
                                </span>
                                <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {item.category || "Ingredientes"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-3">
                                <span>Unidad: <b>{item.unit}</b></span>
                                <span>Costo: <b>${item.cost}</b></span>
                                <span>Stock: <b>{item.stock}</b></span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyAiInsumo(item)}
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 rounded-xl transition cursor-pointer border-none"
                            >
                              ➕ Agregar este Insumo
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-slate-500 space-y-2">
                      <span className="text-4xl block">✨</span>
                      <h4 className="font-black text-sm text-slate-700">
                        Generador Inteligente Listo
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Haz clic en "Generar Sugerencias de Insumos" para que el modelo Gemini escanee tu carta y configure la lista de materias primas base.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL: NUEVO / EDITAR INSUMO */}
        {/* ========================================================= */}
        <IonModal
          isOpen={showInsumoModal}
          onDidDismiss={() => setShowInsumoModal(false)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
              <IonTitle>{editingInsumo ? "Editar Insumo" : "Nuevo Insumo de Stock"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowInsumoModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-xl mx-auto space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tortillas de Maíz kg, Pechuga de Pollo kg, Coca-Cola 355ml"
                  value={insumoFormName}
                  onChange={(e) => setInsumoFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Categoría
                  </label>
                  <select
                    value={insumoFormCategory}
                    onChange={(e) => setInsumoFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="Ingredientes">Ingredientes 🍅</option>
                    <option value="Carnes">Carnes / Mariscos 🥩</option>
                    <option value="Bebidas">Bebidas 🍹</option>
                    <option value="Abarrotes">Abarrotes 🍝</option>
                    <option value="Desechables">Desechables 📦</option>
                    <option value="Otros">Otros ⚙️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    placeholder="kg, g, lt, ml, pza, paquete"
                    value={insumoFormUnit}
                    onChange={(e) => setInsumoFormUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Costo Unitario ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={insumoFormCost}
                    onChange={(e) => setInsumoFormCost(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={insumoFormStock}
                    onChange={(e) => setInsumoFormStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="5"
                    value={insumoFormMinStock}
                    onChange={(e) => setInsumoFormMinStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveInsumo}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer border-none shadow-md shadow-blue-500/20"
                >
                  💾 Guardar Insumo
                </button>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* ========================================================= */}
        {/* MODAL: AJUSTE RÁPIDO DE STOCK */}
        {/* ========================================================= */}
        <IonModal
          isOpen={!!quickAdjustInsumo}
          onDidDismiss={() => setQuickAdjustInsumo(null)}
          initialBreakpoint={0.65}
          breakpoints={[0, 0.65]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
              <IonTitle>Ajuste Rápido de Stock ⚡</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setQuickAdjustInsumo(null)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-md mx-auto space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold text-xs block">Insumo:</span>
                <span className="font-black text-sm">{quickAdjustInsumo?.name}</span>
                <div className="text-xs mt-1">
                  Stock actual: <b>{quickAdjustInsumo?.stock} {quickAdjustInsumo?.unit}</b>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tipo de Ajuste
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAdjustType("entrada")}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                      quickAdjustType === "entrada"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    📥 Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustType("merma")}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                      quickAdjustType === "merma"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    ⚠️ Merma (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustType("ajuste")}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                      quickAdjustType === "ajuste"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    ⚖️ Ajuste (+/-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Cantidad ({quickAdjustInsumo?.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={quickAdjustQty}
                  onChange={(e) => setQuickAdjustQty(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Motivo / Observación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Merma por caducidad, conteo físico, etc."
                  value={quickAdjustReason}
                  onChange={(e) => setQuickAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleQuickAdjustStock}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer border-none shadow-md shadow-amber-500/20"
              >
                Aplicar Ajuste de Stock
              </button>
            </div>
          </IonContent>
        </IonModal>

        {/* ========================================================= */}
        {/* MODAL: GESTIÓN DE RECETA / ESCANDALLO */}
        {/* ========================================================= */}
        <IonModal
          isOpen={showAddIngredientModal && !!selectedRecipeProduct}
          onDidDismiss={() => {
            setShowAddIngredientModal(false);
            setSelectedIngredientId("");
            setSelectedIngredientQty("");
            setIngredientSearchQuery("");
            setIngredientCategoryFilter("TODOS");
          }}
          initialBreakpoint={0.9}
          breakpoints={[0, 0.9, 1]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
              <IonTitle>Receta y Escandallo 🍲</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddIngredientModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-2xl mx-auto space-y-5 pb-8">
              {/* Product Header Card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white shadow-lg border border-slate-700/50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-900/60 px-2.5 py-1 rounded-full border border-indigo-700/50">
                      {selectedRecipeProduct?.category?.toUpperCase() || "PRODUCTO"}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 leading-tight">
                      {selectedRecipeProduct?.name}
                    </h2>
                    {selectedRecipeProduct?.subcategory && (
                      <p className="text-xs text-slate-300 font-semibold mt-0.5">
                        📂 {selectedRecipeProduct.subcategory}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">Precio de Venta</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">
                      ${(Number(selectedRecipeProduct?.price) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cost & Profit Analysis Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center bg-slate-900/80 p-3 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Costo Insumos</div>
                    <div className="text-sm sm:text-base font-black text-amber-400">
                      ${calculateProductCost(selectedRecipeProduct).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Margen Bruto</div>
                    <div className="text-sm sm:text-base font-black text-emerald-400">
                      ${Math.max(0, (Number(selectedRecipeProduct?.price) || 0) - calculateProductCost(selectedRecipeProduct)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">% Ganancia</div>
                    <div className="text-sm sm:text-base font-black text-cyan-400">
                      {(Number(selectedRecipeProduct?.price) || 0) > 0
                        ? (
                            (Math.max(0, (Number(selectedRecipeProduct?.price) || 0) - calculateProductCost(selectedRecipeProduct)) /
                              (Number(selectedRecipeProduct?.price) || 1)) *
                            100
                          ).toFixed(1)
                        : "0"}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Ingredients in Recipe Table */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <span>📋 Insumos en la Receta</span>
                    <span className="bg-indigo-100 text-indigo-700 text-[11px] font-black px-2 py-0.5 rounded-full">
                      {selectedRecipeProduct?.recipe?.length || 0}
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Se descontarán en cada venta
                  </span>
                </div>

                {(!selectedRecipeProduct?.recipe || selectedRecipeProduct.recipe.length === 0) ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-3xl block mb-1">🥣</span>
                    <p className="text-xs font-bold text-slate-600">
                      Este platillo aún no tiene insumos asignados.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Agrega los ingredientes abajo (tortillas, carnes, salsas, etc.) para calcular costos y descontar inventario automáticamente.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold">
                          <th className="pb-2">Insumo</th>
                          <th className="pb-2 text-center">Porción</th>
                          <th className="pb-2 text-right">Costo Unit.</th>
                          <th className="pb-2 text-right">Subtotal</th>
                          <th className="pb-2 text-center">Quitar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRecipeProduct.recipe.map((ing: any) => {
                          const item = inventory.find((i) => i.id === ing.inventoryItemId);
                          const unitCost = Number(item?.cost) || 0;
                          const subtotal = unitCost * (Number(ing.quantity) || 0);
                          return (
                            <tr key={ing.inventoryItemId} className="hover:bg-slate-50 transition">
                              <td className="py-2.5 font-bold text-slate-800">
                                <div>{item?.name || "Insumo no encontrado"}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {item?.category || "General"} • Stock: {item?.stock ?? 0} {item?.unit || ""}
                                </div>
                              </td>
                              <td className="py-2.5 text-center font-black text-indigo-700">
                                {ing.quantity} {item?.unit || "pza"}
                              </td>
                              <td className="py-2.5 text-right font-medium text-slate-600">
                                ${unitCost.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-right font-black text-slate-900">
                                ${subtotal.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredientFromRecipe(ing.inventoryItemId)}
                                  className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer border-none"
                                  title="Quitar de la receta"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Ingredient Section */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>➕ Agregar / Modificar Ingrediente</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenNewInsumo}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition border border-indigo-200 cursor-pointer"
                  >
                    ✨ + Crear Nuevo Insumo
                  </button>
                </div>

                {/* Category Filters for Insumos */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "TODOS",
                    "Carnes",
                    "Verduras",
                    "Lácteos",
                    "Abarrotes",
                    "Bebidas",
                    "Panadería",
                    "Salsas",
                    "Desechables",
                    "Otros",
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setIngredientCategoryFilter(cat)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border ${
                        ingredientCategoryFilter === cat
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search and Insumo Selector */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Buscar insumo (tortilla, bistec, queso, limón...)..."
                      value={ingredientSearchQuery}
                      onChange={(e) => setIngredientSearchQuery(e.target.value)}
                      className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <select
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">-- Selecciona el insumo a añadir o modificar --</option>
                    {inventory
                      .filter((i) => {
                        const matchCat =
                          ingredientCategoryFilter === "TODOS" ||
                          (i.category || "").toLowerCase() === ingredientCategoryFilter.toLowerCase();
                        const matchSearch =
                          !ingredientSearchQuery.trim() ||
                          (i.name || "").toLowerCase().includes(ingredientSearchQuery.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit}) — Costo: ${(Number(i.cost) || 0).toFixed(2)} | Stock: {i.stock ?? 0} {i.unit}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Portion Quantity and Live Cost Calculation */}
                {selectedIngredientId && (
                  <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-3">
                    {(() => {
                      const selItem = inventory.find((i) => i.id === selectedIngredientId);
                      const unit = selItem?.unit || "unidad";
                      const cost = Number(selItem?.cost) || 0;
                      const qty = parseFloat(selectedIngredientQty) || 0;
                      const subtotal = cost * qty;

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-indigo-900">
                              Insumo: <b>{selItem?.name}</b>
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              Costo unitario: <b>${cost.toFixed(2)} / {unit}</b>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Cantidad por Porción ({unit}):
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder={`Ej: ${unit === "kg" ? "0.150 (para 150g)" : unit === "pza" ? "2" : "1"}`}
                                value={selectedIngredientQty}
                                onChange={(e) => setSelectedIngredientQty(e.target.value)}
                                className="w-full p-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-black outline-none focus:border-indigo-600"
                              />
                            </div>

                            <div className="bg-white p-2.5 rounded-xl border border-indigo-200 text-center">
                              <span className="text-[10px] text-slate-500 font-bold block">
                                Costo Agregado a la Receta
                              </span>
                              <span className="text-base font-black text-emerald-600">
                                ${subtotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddIngredientToRecipe}
                  disabled={!selectedIngredientId || !selectedIngredientQty || parseFloat(selectedIngredientQty) <= 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm py-3 rounded-xl transition cursor-pointer border-none shadow-md shadow-indigo-500/20"
                >
                  ➕ Guardar Insumo en Receta
                </button>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal Proveedores */}
        <SupplierModal
          supplierModal={supplierModal}
          setSupplierModal={setSupplierModal}
          triggerAppNotification={triggerAppNotification}
        />

        {/* Modal Compras */}
        <SupplierPurchaseModal
          showSupplierPurchaseModal={showSupplierPurchaseModal}
          setShowSupplierPurchaseModal={setShowSupplierPurchaseModal}
          cashierSessions={cashierSessions}
          currentUser={currentUser}
          inventory={inventory}
          selectedScheduleSupplier={selectedScheduleSupplier}
          sessionId={cashierSessions?.find((s) => s.status === "open")?.id || null}
          setSelectedScheduleSupplier={setSelectedScheduleSupplier}
          setSupplierPurchaseIsPaid={setSupplierPurchaseIsPaid}
          setSupplierPurchaseItems={setSupplierPurchaseItems}
          supplierPurchaseIsPaid={supplierPurchaseIsPaid}
          supplierPurchaseItems={supplierPurchaseItems}
          triggerAppNotification={triggerAppNotification}
        />
      </IonContent>
    </IonPage>
  );
};
