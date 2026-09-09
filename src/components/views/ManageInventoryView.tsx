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
  alertCircleOutline,
  cartOutline,
  cashOutline,
  documentTextOutline,
  refreshOutline,
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

  // --- Sub-states for Recipes Tab ---
  const [recipeProductSearch, setRecipeProductSearch] = useState("");
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState("TODOS");
  const [recipeHasRecipeFilter, setRecipeHasRecipeFilter] = useState<"TODOS" | "CON_RECETA" | "SIN_RECETA">("TODOS");
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<any | null>(null);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [selectedIngredientQty, setSelectedIngredientQty] = useState("");
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");

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
                      id: "recipes" as const,
                      title: "Escandallos y Recetas",
                      emoji: "🍲",
                      color: "#10b981",
                      description:
                        "Vincula ingredientes y porciones a los platillos del menú. Calcula el costo teórico de producción y el margen de utilidad en vivo.",
                      actionExplanation:
                        "Permite controlar mermas, calcular rentabilidad real por platillo y descontar insumos automáticamente al cerrar cuentas.",
                      bgGradient:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      borderColor: "#10b981",
                      stat: `${productsWithRecipes} Platillos con Receta`,
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
              {/* TAB 2: ESCANDALLOS Y RECETAS POR PLATILLO */}
              {/* ========================================================= */}
              {activeTab === "recipes" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: List of Products */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <span>🍲</span> Catálogo de Platillos ({products.filter((p) => !p.isDeleted).length})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Selecciona un platillo para ver su escandallo, ingredientes y cálculo de margen.
                      </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="🔍 Buscar platillo..."
                        value={recipeProductSearch}
                        onChange={(e) => setRecipeProductSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition"
                      />

                      <div className="flex gap-1">
                        {(["TODOS", "CON_RECETA", "SIN_RECETA"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setRecipeHasRecipeFilter(mode)}
                            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition border cursor-pointer ${
                              recipeHasRecipeFilter === mode
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {mode === "TODOS"
                              ? "Todos"
                              : mode === "CON_RECETA"
                              ? "Con Receta"
                              : "Sin Receta"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Product List */}
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {products
                        .filter((p) => !p.isDeleted)
                        .filter((p) => {
                          const hasRec = p.recipe && Array.isArray(p.recipe) && p.recipe.length > 0;
                          if (recipeHasRecipeFilter === "CON_RECETA" && !hasRec) return false;
                          if (recipeHasRecipeFilter === "SIN_RECETA" && hasRec) return false;
                          if (!recipeProductSearch.trim()) return true;
                          return p.name.toLowerCase().includes(recipeProductSearch.toLowerCase());
                        })
                        .map((prod) => {
                          const isSelected = selectedRecipeProduct?.id === prod.id;
                          const recipeCost = calculateProductCost(prod);
                          const price = Number(prod.price) || 0;
                          const marginPercent =
                            price > 0 ? ((price - recipeCost) / price) * 100 : 0;
                          const hasRec = prod.recipe && Array.isArray(prod.recipe) && prod.recipe.length > 0;

                          return (
                            <div
                              key={prod.id}
                              onClick={() => setSelectedRecipeProduct(prod)}
                              className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? "bg-indigo-50 border-indigo-500 shadow-sm"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div>
                                <h4 className="text-xs font-black text-slate-800">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[11px]">
                                  <span className="font-bold text-slate-600">
                                    Precio: ${price.toFixed(2)}
                                  </span>
                                  {hasRec ? (
                                    <span className="text-indigo-600 font-black">
                                      Costo: ${recipeCost.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 font-bold">
                                      Sin Receta
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                {hasRec ? (
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                      marginPercent >= 65
                                        ? "bg-emerald-100 text-emerald-800"
                                        : marginPercent >= 45
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {marginPercent.toFixed(0)}% Margen
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 font-bold">
                                    + Agregar
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Right Column: Selected Product Recipe Details */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                    {selectedRecipeProduct ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                              Escandallo de Producción
                            </span>
                            <h2 className="text-lg font-black text-slate-800">
                              {selectedRecipeProduct.name}
                            </h2>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIngredientId("");
                              setSelectedIngredientQty("");
                              setIngredientSearchQuery("");
                              setShowAddIngredientModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer border-none"
                          >
                            <IonIcon icon={addOutline} />
                            <span>Agregar Insumo a Receta</span>
                          </button>
                        </div>

                        {/* Cost & Margin Metrics Banner */}
                        {(() => {
                          const cost = calculateProductCost(selectedRecipeProduct);
                          const price = Number(selectedRecipeProduct.price) || 0;
                          const profit = price - cost;
                          const margin = price > 0 ? (profit / price) * 100 : 0;

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                  Precio de Venta
                                </span>
                                <span className="text-base font-black text-slate-900">
                                  ${price.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                  Costo Insumos
                                </span>
                                <span className="text-base font-black text-indigo-700">
                                  ${cost.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                  Ganancia Bruta
                                </span>
                                <span
                                  className={`text-base font-black ${
                                    profit > 0 ? "text-emerald-700" : "text-rose-600"
                                  }`}
                                >
                                  ${profit.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                  Margen Utilidad
                                </span>
                                <span
                                  className={`text-base font-black ${
                                    margin >= 65
                                      ? "text-emerald-600"
                                      : margin >= 45
                                      ? "text-amber-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {margin.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Ingredients Table */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            Insumos y Porciones Requeridas
                          </h4>

                          {(!selectedRecipeProduct.recipe || selectedRecipeProduct.recipe.length === 0) ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-xs font-bold">
                              Este platillo no tiene insumos asignados todavía. Presiona "Agregar Insumo a Receta".
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                                    <th className="p-3">Insumo</th>
                                    <th className="p-3 text-center">Porción</th>
                                    <th className="p-3 text-right">Costo Unit.</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                    <th className="p-3 text-center">Acción</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                  {selectedRecipeProduct.recipe.map((ing: any) => {
                                    const inv = inventory.find(
                                      (i) => i.id === ing.inventoryItemId
                                    );
                                    const unitCost = Number(inv?.cost) || 0;
                                    const subtotal = unitCost * (Number(ing.quantity) || 0);

                                    return (
                                      <tr key={ing.inventoryItemId} className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-slate-800">
                                          {inv?.name || "Insumo no encontrado"} ({inv?.unit || "pza"})
                                        </td>
                                        <td className="p-3 text-center font-black text-indigo-700">
                                          {ing.quantity} {inv?.unit || "pza"}
                                        </td>
                                        <td className="p-3 text-right text-slate-600 font-bold">
                                          ${unitCost.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right font-black text-slate-900">
                                          ${subtotal.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-center">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveIngredientFromRecipe(ing.inventoryItemId)
                                            }
                                            className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1 rounded-md transition cursor-pointer"
                                            title="Eliminar de la receta"
                                          >
                                            ❌
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
                      </>
                    ) : (
                      <div className="text-center py-24 text-slate-400">
                        <span className="text-4xl block mb-2">👈</span>
                        <p className="font-bold text-xs">
                          Selecciona un platillo de la lista izquierda para ver o editar su receta.
                        </p>
                      </div>
                    )}
                  </div>
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
        {/* MODAL: AGREGAR INSUMO A RECETA */}
        {/* ========================================================= */}
        <IonModal
          isOpen={showAddIngredientModal}
          onDidDismiss={() => setShowAddIngredientModal(false)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
              <IonTitle>Agregar Ingrediente a la Receta 🍲</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddIngredientModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-md mx-auto space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Seleccionar Insumo del Catálogo
                </label>
                <input
                  type="text"
                  placeholder="🔍 Filtrar insumos..."
                  value={ingredientSearchQuery}
                  onChange={(e) => setIngredientSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none mb-2"
                />
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="">-- Selecciona Insumo --</option>
                  {inventory
                    .filter((i) => {
                      if (!ingredientSearchQuery.trim()) return true;
                      return (i.name || "")
                        .toLowerCase()
                        .includes(ingredientSearchQuery.toLowerCase());
                    })
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit}) - Costo: ${(Number(i.cost) || 0).toFixed(2)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Cantidad por Porción (
                  {inventory.find((i) => i.id === selectedIngredientId)?.unit || "unidad"}
                  )
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Ej: 0.150 para 150g, 1 para 1 pieza"
                  value={selectedIngredientQty}
                  onChange={(e) => setSelectedIngredientQty(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddIngredientToRecipe}
                disabled={!selectedIngredientId || !selectedIngredientQty}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer border-none shadow-md shadow-indigo-500/20"
              >
                ➕ Vincular a la Receta
              </button>
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
