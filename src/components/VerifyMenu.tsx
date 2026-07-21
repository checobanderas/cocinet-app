import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonLabel,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonText,
  IonFooter,
  IonCard,
  IonCardContent,
  IonBadge
} from "@ionic/react";
import {
  beerOutline,
  iceCreamOutline,
  fastFoodOutline,
  checkmarkCircleOutline,
  closeOutline,
  addOutline,
  trashOutline,
  chatbubbleEllipsesOutline,
  gridOutline,
  eyeOutline,
  checkmarkDoneCircleOutline,
  thumbsUpOutline,
  checkmarkOutline,
  refreshCircleOutline,
  arrowBackOutline,
  checkboxOutline,
  alertCircleOutline,
  sparklesOutline
} from "ionicons/icons";
import { Product, getProductInventoryStatus } from "../utils/appHelpers";

interface VerifyMenuProps {
  products: Product[];
  inventory: any[];
  updateProductInFirebase: (id: string, data: any) => Promise<void>;
  setAppMode: (mode: any) => void;
  currentUser: any;
  renderMaterialHeader: (options: {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    showMenu?: boolean;
    actions?: React.ReactNode;
  }) => React.ReactNode;
}

export default function VerifyMenu({
  products,
  inventory,
  updateProductInFirebase,
  setAppMode,
  currentUser,
  renderMaterialHeader
}: VerifyMenuProps) {
  const [activeCategory, setActiveCategory] = useState<"food" | "drinks" | "desserts">("food");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [activeSubgroup, setActiveSubgroup] = useState<string>("Todos");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dynamic colors based on active category
  const activeColor = useMemo(() => {
    if (activeCategory === "food") return "#ef4444";
    if (activeCategory === "drinks") return "#3b82f6";
    return "#f59e0b";
  }, [activeCategory]);

  // Derived subcategories for current category
  const subcategories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((p) => p.category === activeCategory)
          .map((p) => p.subcategory)
      )
    )
      .filter(Boolean)
      .sort();
  }, [products, activeCategory]);

  // Auto-set subcategory when category changes
  useEffect(() => {
    if (subcategories.length > 0) {
      if (!subcategories.includes(activeSubcategory)) {
        setActiveSubcategory(subcategories[0]);
      }
    } else {
      setActiveSubcategory("");
    }
    setActiveSubgroup("Todos");
  }, [activeCategory, subcategories, activeSubcategory]);

  // Derived subgroups for current subcategory
  const availableSubgroups = useMemo(() => {
    const filtered = products.filter(
      (item) =>
        item.category === activeCategory &&
        item.subcategory === activeSubcategory
    );
    return Array.from(
      new Set(
        filtered
          .map((p) => p.subgroup || "")
          .filter((sg) => sg.trim() !== "")
      )
    ).sort();
  }, [products, activeCategory, activeSubcategory]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(
      (item) =>
        item.category === activeCategory &&
        item.subcategory === activeSubcategory &&
        (activeSubgroup === "Todos" || (item.subgroup || "") === activeSubgroup)
    );
  }, [products, activeCategory, activeSubcategory, activeSubgroup]);

  // Stats for the currently filtered products
  const categoryStats = useMemo(() => {
    const total = filteredProducts.length;
    const approved = filteredProducts.filter((p: any) => p.approved).length;
    const percent = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, percent };
  }, [filteredProducts]);

  const handleToggleProductApproval = async (productId: string, currentStatus: boolean) => {
    setActionLoading(productId);
    try {
      await updateProductInFirebase(productId, { approved: !currentStatus });
      setShowToast({
        message: `Producto ${!currentStatus ? "aprobado 💚" : "pendiente 💛"}`,
        type: "success"
      });
      setTimeout(() => setShowToast(null), 3000);
    } catch (e) {
      console.error(e);
      setShowToast({ message: "Error al actualizar producto ❌", type: "error" });
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAllFiltered = async () => {
    if (filteredProducts.length === 0) return;
    setActionLoading("all");
    try {
      const pendingApproval = filteredProducts.filter((p: any) => !p.approved);
      if (pendingApproval.length === 0) {
        setShowToast({ message: "Todos los productos ya están aprobados ✨", type: "success" });
        setTimeout(() => setShowToast(null), 3000);
        setActionLoading(null);
        return;
      }
      for (const product of pendingApproval) {
        await updateProductInFirebase(product.id, { approved: true });
      }
      setShowToast({
        message: `¡${pendingApproval.length} productos aprobados con éxito! 🎉`,
        type: "success"
      });
      setTimeout(() => setShowToast(null), 3000);
    } catch (e) {
      console.error(e);
      setShowToast({ message: "Error al aprobar productos ❌", type: "error" });
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <IonPage>
      {renderMaterialHeader({
        title: "Verify Menu 📋",
        subtitle: "Aprobación del Catálogo de Productos y Vista de Meseros",
        showBack: true,
        onBack: () => setAppMode("manage-menu"), // Returns to manage products as corrected by owner!
        actions: (
          <div className="flex items-center gap-1 sm:gap-2">
            <IonButton
              fill="clear"
              color="light"
              onClick={() => setAppMode("floorplan")}
              style={{ fontSize: "0.85rem", fontWeight: "bold" }}
            >
              <IonIcon icon={gridOutline} slot="start" />
              <span className="hidden sm:inline">Mesas</span>
            </IonButton>
          </div>
        )
      })}

      <IonHeader className="ion-no-border">
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                background: showToast.type === "success" ? "#10b981" : "#ef4444",
                color: "white",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                zIndex: 99
              }}
            >
              <IonIcon icon={showToast.type === "success" ? checkmarkCircleOutline : alertCircleOutline} />
              <span>{showToast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level 1: Category Selector (Food, Drinks, Desserts) */}
        <IonToolbar color="light">
          <IonSegment
            value={activeCategory}
            onIonChange={(e) => setActiveCategory(e.detail.value as any)}
            style={{ "--background": "#f1f5f9" }}
          >
            <IonSegmentButton
              value="food"
              style={{
                "--background-checked": "#ef4444",
                "--color-checked": "#ffffff",
                "--indicator-color": "#ef4444",
                transition: "all 0.3s ease",
              }}
            >
              <IonIcon
                icon={fastFoodOutline}
                style={{
                  fontSize: activeCategory === "food" ? "1.4rem" : "1.2rem",
                }}
              />
              <IonLabel
                style={{
                  fontWeight: activeCategory === "food" ? "900" : "600",
                }}
              >
                Comida
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton
              value="drinks"
              style={{
                "--background-checked": "#3b82f6",
                "--color-checked": "#ffffff",
                "--indicator-color": "#3b82f6",
                transition: "all 0.3s ease",
              }}
            >
              <IonIcon
                icon={beerOutline}
                style={{
                  fontSize: activeCategory === "drinks" ? "1.4rem" : "1.2rem",
                }}
              />
              <IonLabel
                style={{
                  fontWeight: activeCategory === "drinks" ? "900" : "600",
                }}
              >
                Bebidas
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton
              value="desserts"
              style={{
                "--background-checked": "#f59e0b",
                "--color-checked": "#ffffff",
                "--indicator-color": "#f59e0b",
                transition: "all 0.3s ease",
              }}
            >
              <IonIcon
                icon={iceCreamOutline}
                style={{
                  fontSize: activeCategory === "desserts" ? "1.4rem" : "1.2rem",
                }}
              />
              <IonLabel
                style={{
                  fontWeight: activeCategory === "desserts" ? "900" : "600",
                }}
              >
                Postres
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>

        {/* Level 2: Subcategory Selector */}
        {subcategories.length > 0 && (
          <IonToolbar color="light" style={{ "--min-height": "50px" }}>
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                padding: "4px 8px",
                gap: "8px",
              }}
              className="no-scrollbar"
            >
              {subcategories.map((sub) => {
                const isActiveSub = activeSubcategory === sub;
                return (
                  <IonButton
                    key={sub}
                    size="small"
                    fill={isActiveSub ? "solid" : "outline"}
                    onClick={() => setActiveSubcategory(sub)}
                    style={{
                      "--border-radius": "20px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      flexShrink: 0,
                      "--background": isActiveSub ? activeColor : "",
                      "--border-color": activeColor,
                      "--color": isActiveSub ? "white" : activeColor,
                    }}
                  >
                    {sub}
                  </IonButton>
                );
              })}
            </div>
          </IonToolbar>
        )}

        {/* Level 3: Subgroup Selector */}
        {(() => {
          if (availableSubgroups.length === 0) return null;
          return (
            <IonToolbar
              color="light"
              style={{
                "--min-height": "46px",
                "--padding-start": "0px",
                "--padding-end": "0px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  padding: "8px 12px",
                  gap: "6px",
                  background: "#ffffff",
                  borderBottom: "1px solid #e2e8f0",
                  whiteSpace: "nowrap",
                }}
                className="no-scrollbar"
              >
                {["Todos", ...availableSubgroups].map((subgroup) => {
                  const isSelected = activeSubgroup === subgroup;
                  return (
                    <button
                      key={subgroup}
                      onClick={() => setActiveSubgroup(subgroup)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        border: isSelected ? "none" : "1px solid #cbd5e1",
                        background: isSelected ? activeColor : "#f8fafc",
                        color: isSelected ? "white" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {subgroup}
                    </button>
                  );
                })}
              </div>
            </IonToolbar>
          );
        })()}

        {/* Dynamic Category/Group Stat Summary */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Categoría: {activeCategory} &gt; {activeSubcategory || "Ninguna"} &gt; {activeSubgroup}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700">
              Aprobación: {categoryStats.approved}/{categoryStats.total} ({categoryStats.percent}%)
            </span>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{ width: `${categoryStats.percent}%`, background: "#10b981" }}
              />
            </div>
          </div>
        </div>
      </IonHeader>

      <IonContent style={{ "--background": "#f8fafc" }}>
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <IonIcon icon={alertCircleOutline} style={{ fontSize: "3rem", opacity: 0.3 }} />
            <h3 className="font-bold text-slate-600 mt-2">Sin productos</h3>
            <p className="text-xs">No hay productos cargados en este grupo o subcategoría.</p>
          </div>
        ) : (
          <IonList lines="full" style={{ background: "transparent" }}>
            {filteredProducts.map((product) => {
              const invStatus = getProductInventoryStatus(product, inventory);
              const isApproved = (product as any).approved || false;

              return (
                <IonItem
                  key={product.id}
                  lines="none"
                  style={{
                    "--background": "white",
                    marginBottom: "8px",
                    borderRadius: "12px",
                    margin: "8px",
                    "--padding-start": "16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                  }}
                >
                  <IonLabel className="ion-text-wrap">
                    <h3
                      style={{
                        fontWeight: "bold",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isApproved ? (
                        <span title="Aprobado por el Dueño" className="text-emerald-500 text-lg flex items-center">
                          ✅
                        </span>
                      ) : (
                        <span title="Pendiente de Aprobación" className="text-amber-500 text-lg flex items-center">
                          🟡
                        </span>
                      )}
                      <span className={isApproved ? "text-slate-800" : "text-slate-600"}>
                        {product.name}
                      </span>
                    </h3>

                    <p
                      style={{
                        color: activeColor,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        margin: "4px 0 0 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>${product.price.toFixed(2)}</span>
                      {invStatus.status === "out_of_stock" && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#e11d48",
                            background: "#ffe4e6",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          Agotado 🔴 ({invStatus.limitingInsumo ? invStatus.limitingInsumo.name : "Insumos"})
                        </span>
                      )}
                      {invStatus.status === "low_stock" && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#b45309",
                            background: "#fef9c3",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          Pocas porciones 🟡 (~{Math.floor(invStatus.servingsMin)} porciones)
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[10px] font-black tracking-wide text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full uppercase">
                          Visto Bueno 💚
                        </span>
                      )}
                    </p>

                    {product.subgroup && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                          Subgrupo: {product.subgroup}
                        </span>
                      </div>
                    )}
                  </IonLabel>

                  <div slot="end" className="flex items-center gap-2">
                    <IonButton
                      fill={isApproved ? "outline" : "solid"}
                      color={isApproved ? "medium" : "success"}
                      size="small"
                      disabled={actionLoading === product.id}
                      onClick={() => handleToggleProductApproval(product.id, isApproved)}
                      style={{
                        "--border-radius": "10px",
                        fontWeight: "black",
                        fontSize: "0.75rem",
                        textTransform: "none",
                        minWidth: "110px"
                      }}
                    >
                      {actionLoading === product.id ? (
                        "Procesando..."
                      ) : isApproved ? (
                        "Pendiente 🔄"
                      ) : (
                        <>
                          <IonIcon icon={checkmarkOutline} slot="start" />
                          Visto Bueno
                        </>
                      )}
                    </IonButton>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>

      {/* Floating Action Bar at Footer */}
      {filteredProducts.length > 0 && (
        <IonFooter className="ion-no-border ion-padding" style={{ background: "white" }}>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-left">
              <h4 className="text-sm font-black text-slate-800 m-0">Aprobar vista filtrada</h4>
              <p className="text-[11px] text-slate-500 m-0">
                Otorga el visto bueno a todos los productos visibles actualmente.
              </p>
            </div>
            <IonButton
              expand="block"
              color="success"
              disabled={actionLoading === "all" || categoryStats.percent === 100}
              onClick={handleApproveAllFiltered}
              style={{
                height: "50px",
                minWidth: "220px",
                "--border-radius": "14px",
                fontWeight: "900",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
              }}
            >
              <IonIcon icon={checkmarkDoneCircleOutline} slot="start" />
              {actionLoading === "all" ? "Aprobando..." : "Dar Visto Bueno a Todos"}
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonPage>
  );
}
