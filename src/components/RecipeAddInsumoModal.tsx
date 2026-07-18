import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from "@ionic/react";

interface RecipeAddInsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: any[];
  addInventoryItemToFirebase: (item: any) => Promise<void>;
  selectedRecipeProduct: any;
  setSelectedRecipeProduct: (prod: any) => void;
  updateProductInFirebase: (id: string, prod: any) => Promise<void>;
  products: any[];
  productSearch: string;
}

export default function RecipeAddInsumoModal({
  isOpen,
  onClose,
  inventory,
  addInventoryItemToFirebase,
  selectedRecipeProduct,
  setSelectedRecipeProduct,
  updateProductInFirebase,
  products,
  productSearch,
}: RecipeAddInsumoModalProps) {
  const [isCreatingNewInsumo, setIsCreatingNewInsumo] = useState(false);
  const [newInsumoForm, setNewInsumoForm] = useState({
    name: "",
    unit: "pza",
    stock: "0",
    category: "Ingredientes",
  });
  const [insumoQuery, setInsumoQuery] = useState("");
  const [recipeAddIngId, setRecipeAddIngId] = useState("");
  const [recipeAddQty, setRecipeAddQty] = useState("");

  const handleReset = () => {
    setIsCreatingNewInsumo(false);
    setNewInsumoForm({ name: "", unit: "pza", stock: "0", category: "Ingredientes" });
    setInsumoQuery("");
    setRecipeAddIngId("");
    setRecipeAddQty("");
  };

  const handleSaveAndSelectInsumo = async () => {
    if (!newInsumoForm.name.trim()) return;
    // Generate standard UUID-like design with precise timing for MySQL sync behavior
    const newId = `inv_${Date.now()}`;
    const item = {
      id: newId,
      name: newInsumoForm.name.trim(),
      unit: newInsumoForm.unit.trim() || "pza",
      stock: parseFloat(newInsumoForm.stock) || 0,
      category: newInsumoForm.category || "Ingredientes",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addInventoryItemToFirebase(item);
    setRecipeAddIngId(newId);
    setIsCreatingNewInsumo(false);
    setNewInsumoForm({
      name: "",
      unit: "pza",
      stock: "0",
      category: "Ingredientes",
    });
  };

  const handleAddToThisProduct = () => {
    if (!recipeAddIngId || !recipeAddQty || !selectedRecipeProduct) return;
    const qty = parseFloat(recipeAddQty);
    if (isNaN(qty) || qty <= 0) return;

    const currentRecipe = [...(selectedRecipeProduct.recipe || [])];
    const existingIndex = currentRecipe.findIndex(
      (r) => r.inventoryItemId === recipeAddIngId
    );
    if (existingIndex >= 0) {
      currentRecipe[existingIndex] = {
        ...currentRecipe[existingIndex],
        quantity: qty,
      };
    } else {
      currentRecipe.push({
        inventoryItemId: recipeAddIngId,
        quantity: qty,
      });
    }

    updateProductInFirebase(selectedRecipeProduct.id, {
      ...selectedRecipeProduct,
      recipe: currentRecipe,
    }).then(() => {
      setSelectedRecipeProduct({
        ...selectedRecipeProduct,
        recipe: currentRecipe,
      });
      handleReset();
      onClose();
    });
  };

  const handleAddToAllFiltered = async () => {
    if (!recipeAddIngId || !recipeAddQty) return;
    const qty = parseFloat(recipeAddQty);
    if (isNaN(qty) || qty <= 0) return;

    const filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    for (const p of filteredProducts) {
      const currentRecipe = [...(p.recipe || [])];
      const existingIndex = currentRecipe.findIndex(
        (r) => r.inventoryItemId === recipeAddIngId
      );
      if (existingIndex >= 0) {
        currentRecipe[existingIndex] = {
          ...currentRecipe[existingIndex],
          quantity: qty,
        };
      } else {
        currentRecipe.push({
          inventoryItemId: recipeAddIngId,
          quantity: qty,
        });
      }
      await updateProductInFirebase(p.id, {
        ...p,
        recipe: currentRecipe,
      });

      if (selectedRecipeProduct && selectedRecipeProduct.id === p.id) {
        setSelectedRecipeProduct({
          ...p,
          recipe: currentRecipe,
        });
      }
    }

    handleReset();
    onClose();
    alert(`Insumo agregado a ${filteredProducts.length} producto(s) exitosamente ⚡`);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => {
        handleReset();
        onClose();
      }}
      initialBreakpoint={0.7}
      breakpoints={[0, 0.7]}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "rgb(40, 45, 52)",
            "--color": "white",
          }}
        >
          <IonTitle>Agregar Insumo</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div
          style={{
            padding: "16px",
            background: "#f8fafc",
            borderRadius: "12px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontWeight: "bold",
                  color: "#475569",
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                Insumo (Materia Prima) 📦
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewInsumo(!isCreatingNewInsumo)}
                style={{
                  background: isCreatingNewInsumo
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(16, 185, 129, 0.1)",
                  border: "none",
                  color: isCreatingNewInsumo ? "#dc2626" : "#10b981",
                  fontSize: "0.78rem",
                  fontWeight: "800",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                {isCreatingNewInsumo ? "✕ Usar Catálogo" : "➕ Nuevo Insumo"}
              </button>
            </div>

            {isCreatingNewInsumo ? (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  padding: "14px",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "900",
                    color: "#166534",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  ⚡ Registro Rápido de Nuevo Insumo
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.72rem",
                      fontWeight: "bold",
                      color: "#475569",
                      marginBottom: "3px",
                    }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Tortillas de harina kg"
                    value={newInsumoForm.name}
                    onChange={(e) =>
                      setNewInsumoForm({
                        ...newInsumoForm,
                        name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      background: "white",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: "bold",
                        color: "#475569",
                        marginBottom: "3px",
                      }}
                    >
                      Unidad
                    </label>
                    <input
                      type="text"
                      placeholder="kg, pza, L, etc."
                      value={newInsumoForm.unit}
                      onChange={(e) =>
                        setNewInsumoForm({
                          ...newInsumoForm,
                          unit: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        background: "white",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: "bold",
                        color: "#475569",
                        marginBottom: "3px",
                      }}
                    >
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newInsumoForm.stock}
                      onChange={(e) =>
                        setNewInsumoForm({
                          ...newInsumoForm,
                          stock: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        background: "white",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.72rem",
                      fontWeight: "bold",
                      color: "#475569",
                      marginBottom: "3px",
                    }}
                  >
                    Categoría
                  </label>
                  <select
                    value={newInsumoForm.category}
                    onChange={(e) =>
                      setNewInsumoForm({
                        ...newInsumoForm,
                        category: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      background: "white",
                      outline: "none",
                    }}
                  >
                    <option value="Ingredientes">Ingredientes 🍅</option>
                    <option value="Bebidas">Bebidas 🍹</option>
                    <option value="Abarrotes">Abarrotes 🍝</option>
                    <option value="Carnes">Carnes / Mariscos 🥩</option>
                    <option value="Desechables">
                      Desechables / Vajilla 📦
                    </option>
                    <option value="Servicios">
                      Servicios / Sistemas ⚙️
                    </option>
                    <option value="Otros">Otros ⚙️</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAndSelectInsumo}
                  style={{
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  💾 Guardar y Seleccionar
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="🔍 Escribe para buscar insumo..."
                    value={insumoQuery}
                    onChange={(e) => setInsumoQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 30px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      background: "#f1f5f9",
                    }}
                  />
                </div>

                <select
                  value={recipeAddIngId}
                  onChange={(e) => setRecipeAddIngId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "white",
                  }}
                >
                  <option value="">-- Seleccionar Insumo --</option>
                  {inventory
                    .filter((inv) => {
                      if (!insumoQuery.trim()) return true;
                      const term = insumoQuery
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                      const name = (inv.name || "")
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                      return name.includes(term);
                    })
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.unit})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              Cantidad
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Cantidad"
              value={recipeAddQty}
              onChange={(e) => setRecipeAddQty(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              onClick={handleAddToThisProduct}
              disabled={!recipeAddIngId || !recipeAddQty || !selectedRecipeProduct}
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                fontWeight: "bold",
                width: "100%",
                cursor: "pointer",
                border: "none",
                opacity: (!recipeAddIngId || !recipeAddQty || !selectedRecipeProduct) ? 0.6 : 1,
              }}
            >
              Agregar a ESTE producto
            </button>
            <button
              onClick={handleAddToAllFiltered}
              disabled={!recipeAddIngId || !recipeAddQty}
              style={{
                background: "#10b981",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                fontWeight: "bold",
                width: "100%",
                cursor: "pointer",
                border: "none",
                opacity: (!recipeAddIngId || !recipeAddQty) ? 0.6 : 1,
              }}
            >
              Agregar a TODOS (
              {
                products.filter((p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase())
                ).length
              }
              ) los filtrados
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
}
