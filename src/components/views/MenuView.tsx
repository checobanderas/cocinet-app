import { getProductInventoryStatus } from '../../utils/appHelpers';
import { ComensalPreview } from '../modals/ComensalPreview';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonText, IonToolbar } from '@ionic/react';
import { addOutline, cartOutline, chatbubbleEllipsesOutline, checkmarkCircleOutline, closeOutline, eyeOutline, micOutline, removeOutline, syncOutline, trashOutline } from 'ionicons/icons';

interface MenuViewProps {
  activeCategory: any;
  activeSubcategory: any;
  activeSubgroup: any;
  appMode: any;
  cart: any;
  currentComensal: any;
  currentUser: any;
  inventory: any;
  isListening: any;
  isOnline: any;
  isProcessingVoice: any;
  menuSearchQuery: any;
  productCategories: any;
  productSalesMap: any;
  products: any;
  renderDeliveryPanel: any;
  renderMaterialHeader: any;
  selectedTable: any;
  setActiveCategory: any;
  setActiveDrinkType: any;
  setActiveSubcategory: any;
  setActiveSubgroup: any;
  setAppMode: any;
  setCurrentComensal: any;
  setMenuSearchQuery: any;
  setReviewComensal: any;
  setSelectedTableGestion: any;
  setShowComensalPreview: any;
  setShowComensalesBar: any;
  setShowVoiceToast: any;
  showComensalPreview: any;
  showComensalesBar: any;
  showVoiceToast: any;
  voiceToastMessage: any;
  addToCart: any;
  getComensalColor: any;
  openItemNoteModal: any;
  startVoiceRecognition: any;
  totalItems: any;
  totalPrice: any;
  updateQuantity: any;
}

export const MenuView: React.FC<MenuViewProps> = ({
  activeCategory,
  activeSubcategory,
  activeSubgroup,
  appMode,
  cart,
  currentComensal,
  currentUser,
  inventory,
  isListening,
  isOnline,
  isProcessingVoice,
  menuSearchQuery,
  productCategories,
  productSalesMap,
  products,
  renderDeliveryPanel,
  renderMaterialHeader,
  selectedTable,
  setActiveCategory,
  setActiveDrinkType,
  setActiveSubcategory,
  setActiveSubgroup,
  setAppMode,
  setCurrentComensal,
  setMenuSearchQuery,
  setReviewComensal,
  setSelectedTableGestion,
  setShowComensalPreview,
  setShowComensalesBar,
  setShowVoiceToast,
  showComensalPreview,
  showComensalesBar,
  showVoiceToast,
  voiceToastMessage,
  addToCart, getComensalColor, openItemNoteModal, startVoiceRecognition, totalItems, totalPrice, updateQuantity
}) => {
const subcategories = Array.from(
      new Set(
        products
          .filter((p) => p.isDeleted !== true && p.category === activeCategory)
          .map((p) => p.subcategory),
      ),
    )
      .filter(Boolean)
      .sort();

    return (
      <IonPage>
      {appMode !== "gestion_cuentas" && renderMaterialHeader({
        title: `Mesa ${selectedTable?.label || "S/N"}`,
        subtitle: `Tomando pedido: ${currentUser?.name || "Mesero"}`,
        showBack: true,
        minimal: appMode === "gestion_cuentas",
        onBack: () => appMode === "gestion_cuentas" ? setSelectedTableGestion(null) : setAppMode("floorplan"),
        actions: isOnline ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startVoiceRecognition}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] sm:text-xs transition-all cursor-pointer border-none shadow-md ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-amber-400 text-slate-900"
            }`}
            title={isListening ? "Detener..." : "Pedir por Voz"}
          >
            <span className="flex items-center gap-1 select-none">
              {isListening ? "⏹️ Detener" : "🎙️ Voz"}
            </span>
          </motion.button>
        ) : null
      })}
      <IonHeader className="ion-no-border">
          {/* Voice Feedback Area */}
          {(showVoiceToast || isListening || isProcessingVoice) && (
            <IonToolbar
              color="dark"
              style={{ "--min-height": "auto", padding: "4px 16px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
                <IonIcon
                  icon={
                    isProcessingVoice
                      ? syncOutline
                      : isListening
                        ? micOutline
                        : checkmarkCircleOutline
                  }
                  color={
                    isListening
                      ? "danger"
                      : isProcessingVoice
                        ? "primary"
                        : "success"
                  }
                  style={{
                    fontSize: "14px",
                    animation: isProcessingVoice
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
                <IonText
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "white",
                    whiteSpace: "pre-line",
                  }}
                >
                  {isListening || isProcessingVoice
                    ? voiceToastMessage || "Procesando pedido..."
                    : voiceToastMessage}
                </IonText>
                {!isListening && !isProcessingVoice && (
                  <IonIcon
                    icon={closeOutline}
                    slot="end"
                    style={{
                      marginLeft: "auto",
                      fontSize: "14px",
                      opacity: 0.6,
                    }}
                    onClick={() => setShowVoiceToast(false)}
                  />
                )}
              </div>
            </IonToolbar>
          )}

          <IonToolbar color="light">
            <IonSegment
              value={activeCategory}
              onIonChange={(e) => {
                setActiveCategory(e.detail.value as any);
                setMenuSearchQuery("");
                setActiveSubgroup("Todos");
              }}
              style={{ "--background": "#f1f5f9" }}
            >
              {productCategories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                const color = cat.id === "food" ? "#ef4444" : cat.id === "drinks" ? "#3b82f6" : cat.id === "desserts" ? "#f59e0b" : "#6366f1";
                return (
                  <IonSegmentButton
                    key={cat.id}
                    value={cat.id}
                    style={{
                      "--background-checked": color,
                      "--color-checked": "#ffffff",
                      "--indicator-color": color,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span style={{ fontSize: isSelected ? "1.3rem" : "1.1rem", marginRight: "4px" }}>
                      {cat.emoji || "🍽️"}
                    </span>
                    <IonLabel style={{ fontWeight: isSelected ? "900" : "600" }}>
                      {cat.name}
                    </IonLabel>
                  </IonSegmentButton>
                );
              })}
            </IonSegment>
          </IonToolbar>

          {/* Submenu Level 1 */}
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
                const categoryColor =
                  activeCategory === "food"
                    ? "#ef4444"
                    : activeCategory === "drinks"
                      ? "#3b82f6"
                      : "#f59e0b";
                const isActiveSub =
                  activeCategory === "desserts" || activeSubcategory === sub;
                return (
                  <IonButton
                    key={sub}
                    size="small"
                    fill={isActiveSub ? "solid" : "outline"}
                    onClick={() => {
                      setMenuSearchQuery("");
                      if (activeCategory === "food") {
                        if (sub === "Bebidas Calientes") {
                          setActiveCategory("drinks");
                          setActiveDrinkType("hot");
                          setActiveSubcategory("Café");
                        } else if (sub === "Bebidas Frías") {
                          setActiveCategory("drinks");
                          setActiveDrinkType("cold");
                          setActiveSubcategory("Cerveza");
                        } else {
                          setActiveSubcategory(sub);
                        }
                      } else if (activeCategory === "drinks") {
                        setActiveSubcategory(sub);
                      } else if (activeCategory === "drinks") {
                        setActiveSubcategory(sub);
                      } else if (activeCategory === "desserts") {
                        setActiveSubcategory("Postres");
                      }
                    }}
                    style={{
                      "--border-radius": "20px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      flexShrink: 0,
                      "--background": isActiveSub ? categoryColor : "",
                      "--border-color": categoryColor,
                      "--color": isActiveSub ? "white" : categoryColor,
                    }}
                  >
                    {sub}
                  </IonButton>
                );
              })}
            </div>
          </IonToolbar>

          {/* Submenu Level 2 (Legacy removal, now dynamic) */}
          {activeCategory === "drinks" &&
            subcategories.includes(activeSubcategory) && (
              <div style={{ height: "4px" }} />
            )}

          {/* Subgroups & Favoritos (Fixed below navbar inside IonToolbar) */}
          {(() => {
            const filteredProducts = products.filter(p => p.isDeleted !== true).filter(
              (item) =>
                item.category === activeCategory &&
                item.subcategory === activeSubcategory,
            );

            const availableSubgroups = Array.from(
              new Set(
                filteredProducts
                  .map((p) => p.subgroup || "")
                  .filter((sg) => sg.trim() !== ""),
              ),
            );

            const isLargeList = filteredProducts.length > 5;
            const options = isLargeList
              ? ["Todos", "⭐ Favoritos", ...availableSubgroups]
              : availableSubgroups.length > 1
                ? ["Todos", ...availableSubgroups]
                : [];

            if (options.length <= 1) return null;

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
                  {options.map((subgroup) => {
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
                          background: isSelected
                            ? subgroup === "⭐ Favoritos"
                              ? "#eab308"
                              : activeCategory === "food"
                                ? "#ef4444"
                                : activeCategory === "drinks"
                                  ? "#3b82f6"
                                  : "#f59e0b"
                            : "#f8fafc",
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

          {/* Standardized Comensal Selector (Predeterminadamente Oculto con Toggle) */}
          <IonToolbar
            color="light"
            style={{
              "--min-height": "42px",
              "--padding-start": "0px",
              "--padding-end": "0px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "white",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {/* BARRA SUPERIOR DE TOGGLE (SIEMPRE VISIBLE, MUESTRA ESTADO) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 14px",
                  background: showComensalesBar ? "#f8fafc" : "#ffffff",
                  borderBottom: showComensalesBar ? "1px solid #cbd5e1" : "none",
                }}
              >
                <div
                  onClick={() => setShowComensalesBar((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>👥</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#334155" }}>
                    Comensales:
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "14px",
                      background: getComensalColor(currentComensal),
                      color: "white",
                      fontWeight: "900",
                      fontSize: "0.78rem",
                      boxShadow: `0 2px 6px ${getComensalColor(currentComensal)}44`,
                    }}
                  >
                    Comensal {currentComensal}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>
                    {showComensalesBar ? "▲ (Ocultar)" : "▼ (Desplegar)"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setShowComensalesBar((prev) => !prev)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "10px",
                      background: showComensalesBar ? "#fee2e2" : "#f1f5f9",
                      color: showComensalesBar ? "#dc2626" : "#475569",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {showComensalesBar ? "🙈 Ocultar" : "👁️ Mostrar Comensales"}
                  </button>
                  <IonButton
                    size="small"
                    fill="clear"
                    onClick={() => setShowComensalPreview(true)}
                    style={{
                      "--border-radius": "10px",
                      fontSize: "1.1rem",
                      "--color": getComensalColor(currentComensal),
                    }}
                    title="Ver desglose del comensal"
                  >
                    <IonIcon icon={eyeOutline} />
                  </IonButton>
                </div>
              </div>

              {/* SECCIÓN DESPLEGABLE CON LOS NÚMEROS DE COMENSAL (OCULTA POR DEFECTO) */}
              {showComensalesBar && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 14px",
                    gap: "8px",
                    overflowX: "auto",
                    background: "#f8fafc",
                    scrollbarWidth: "none",
                    animation: "fadeIn 0.2s ease-out",
                  }}
                  className="no-scrollbar"
                >
                  {Array.from(
                    { length: Math.max(currentComensal, 5) },
                    (_, i) => i + 1,
                  ).map((num) => (
                    <div
                      key={num}
                      onClick={() => setCurrentComensal(num)}
                      style={{
                        minWidth: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          currentComensal === num
                            ? getComensalColor(num)
                            : "white",
                        color: currentComensal === num ? "white" : "#64748b",
                        fontWeight: "900",
                        fontSize: "1.05rem",
                        transition: "all 0.2s ease",
                        border:
                          currentComensal === num ? "none" : "1px solid #cbd5e1",
                        cursor: "pointer",
                        boxShadow:
                          currentComensal === num
                            ? `0 4px 10px ${getComensalColor(num)}44`
                            : "none",
                        flexShrink: 0,
                      }}
                    >
                      {num}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentComensal((prev) => prev + 1)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "12px",
                      background: "#e2e8f0",
                      color: "#334155",
                      fontWeight: "800",
                      fontSize: "0.75rem",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              )}
            </div>
          </IonToolbar>
        </IonHeader>

<ComensalPreview
          showComensalPreview={showComensalPreview}
          setShowComensalPreview={setShowComensalPreview}
        />
        <IonContent style={{ "--background": "#f8fafc" }}>
          {renderDeliveryPanel()}

          {/* Search bar (Siempre visible para búsqueda global en todo el catálogo) */}
          {(() => {
            return (
              <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex flex-col gap-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="🔍 Buscar en TODO el catálogo... (ej: tac arr ma)"
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
                  {menuSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMenuSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-black text-sm p-0.5 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center border-none cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Product Cards List */}
          {(() => {
            const baseProducts = products.filter(p => p.isDeleted !== true).filter(
              (item) =>
                item.category === activeCategory &&
                item.subcategory === activeSubcategory,
            );

            let displayProducts = baseProducts;

            if (activeSubgroup === "⭐ Favoritos") {
              displayProducts = [...baseProducts].sort(
                (a, b) => (productSalesMap[b.id] || 0) - (productSalesMap[a.id] || 0)
              ).slice(0, 12);
            } else if (activeSubgroup !== "Todos") {
              displayProducts = baseProducts.filter(
                (item) => (item.subgroup || "") === activeSubgroup
              );
            } else if (baseProducts.length > 5) {
              // Pre-sort large lists by top-sold items so popular items stay at top
              displayProducts = [...baseProducts].sort(
                (a, b) => (productSalesMap[b.id] || 0) - (productSalesMap[a.id] || 0)
              );
            }

            if (menuSearchQuery.trim() !== "") {
              // BÚSQUEDA GLOBAL POR COINCIDENCIAS MULTI-PALABRA EN TODO EL CATÁLOGO (sin limitar por nodo/categoría) 🧠⚡
              const rawTokens = menuSearchQuery
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .split(/\s+/)
                .filter(Boolean);

              displayProducts = products.filter((p) => {
                const fullSearchText = [
                  p.name,
                  p.subgroup || "",
                  p.subcategory || "",
                  p.category || "",
                  p.description || "",
                  p.code || "",
                  p.id || ""
                ]
                  .join(" ")
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "");

                return rawTokens.every((token) => fullSearchText.includes(token));
              });

              displayProducts.sort((a, b) => {
                const aName = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const bName = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const firstToken = rawTokens[0] || "";
                const aStarts = aName.startsWith(firstToken) ? 1 : 0;
                const bStarts = bName.startsWith(firstToken) ? 1 : 0;
                if (aStarts !== bStarts) return bStarts - aStarts;
                return (productSalesMap[b.id] || 0) - (productSalesMap[a.id] || 0);
              });
            }

            if (displayProducts.length === 0) {
              return (
                <div className="p-8 text-center text-slate-400 font-bold">
                  <span>No se encontraron productos para "{menuSearchQuery || "esta sección"}" 🍽️</span>
                </div>
              );
            }

            return (
              <div className="py-2">
                {menuSearchQuery.trim() !== "" && (
                  <div className="mx-3 mb-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-bold flex items-center justify-between shadow-sm">
                    <span>⚡ Coincidencias globales en catálogo: "{menuSearchQuery}"</span>
                    <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                      {displayProducts.length} producto(s)
                    </span>
                  </div>
                )}
                {displayProducts.map((product) => {
                  const itemsForProduct = cart.filter(
                    (item) =>
                      item.product.id === product.id &&
                      item.plate === currentComensal,
                  );
                  const primaryItem =
                    itemsForProduct.find((i) => !i.notes) || itemsForProduct[0];
                  const totalQty = itemsForProduct.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
                  const hasNotes = itemsForProduct.some(
                    (item) => item.notes && item.notes.trim() !== "",
                  );
                  const invStatus = getProductInventoryStatus(product, inventory);
                  const salesCount = productSalesMap[product.id] || 0;

                  return (
                    <div
                      key={product.id}
                      style={{
                        margin: "8px 12px",
                        padding: "10px 14px",
                        borderRadius: "16px",
                        background: "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        border: totalQty > 0 ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* 1. LEFT FIXED ACTION COLUMN (width: 120px) */}
                      <div
                        style={{
                          width: "120px",
                          minWidth: "120px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flexShrink: 0,
                        }}
                      >
                        {totalQty === 0 ? (
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            style={{
                              width: "48px",
                              height: "44px",
                              background: "#2563eb",
                              color: "white",
                              borderRadius: "14px",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                              transition: "transform 0.1s ease, background-color 0.2s ease",
                            }}
                            className="active:scale-90 hover:bg-blue-700"
                            title="Agregar 1"
                          >
                            <IonIcon icon={addOutline} style={{ fontSize: "1.8rem", fontWeight: "bold" }} />
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {/* BOTÓN + SIEMPRE EN LA EXTREMA IZQUIERDA */}
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              style={{
                                width: "40px",
                                height: "44px",
                                background: "#2563eb",
                                color: "white",
                                borderRadius: "12px",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                              }}
                              className="active:scale-90 hover:bg-blue-700 transition-all"
                              title="Agregar 1"
                            >
                              <IonIcon icon={addOutline} style={{ fontSize: "1.6rem", fontWeight: "bold" }} />
                            </button>

                            {/* BOTÓN VERDE DE CANTIDAD EN EL CENTRO: CLICK SUMA DE 5 EN 5 */}
                            <button
                              type="button"
                              onClick={() => addToCart(product, 5)}
                              style={{
                                background: getComensalColor(currentComensal),
                                color: "white",
                                height: "44px",
                                minWidth: "34px",
                                padding: "0 6px",
                                borderRadius: "12px",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "900",
                                fontSize: "1.1rem",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                cursor: "pointer",
                              }}
                              className="active:scale-95 transition-all"
                              title={`Comensal ${currentComensal}: ${totalQty} (Toca para sumar +5)`}
                            >
                              {totalQty}
                            </button>

                            {/* BOTÓN - EN EL LADO DERECHO */}
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, currentComensal, -1)}
                              style={{
                                width: "34px",
                                height: "44px",
                                background: "#f1f5f9",
                                color: "#334155",
                                borderRadius: "12px",
                                border: "1px solid #cbd5e1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              className="active:scale-90 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all"
                              title="Quitar 1"
                            >
                              <IonIcon icon={removeOutline} style={{ fontSize: "1.3rem" }} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 2. MIDDLE PRODUCT DETAILS */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "900", fontSize: "1.05rem", color: "#0f172a", lineHeight: 1.2 }}>
                            {product.name}
                          </span>
                          {salesCount > 0 && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "800",
                                background: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fde68a",
                                padding: "1px 6px",
                                borderRadius: "10px",
                              }}
                              title={`Ventas registradas: ${salesCount}`}
                            >
                              🔥 {salesCount}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                          <span style={{ color: getComensalColor(currentComensal), fontWeight: "900", fontSize: "1rem" }}>
                            ${product.price.toFixed(2)}
                          </span>
                          {invStatus.status === "out_of_stock" && (
                            <span style={{ fontSize: "0.75rem", color: "#e11d48", background: "#ffe4e6", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                              Agotado 🔴 ({invStatus.limitingInsumo?.name || "Insumos"})
                            </span>
                          )}
                          {invStatus.status === "low_stock" && (
                            <span style={{ fontSize: "0.75rem", color: "#b45309", background: "#fef9c3", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                              Pocas porciones 🟡 (~{Math.floor(invStatus.servingsMin)} porciones)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3. RIGHT SECONDARY ACTIONS (Notes & Delete) */}
                      {totalQty > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() =>
                              openItemNoteModal(
                                product.id,
                                currentComensal,
                                primaryItem?.notes,
                              )
                            }
                            style={{
                              height: "40px",
                              padding: "0 10px",
                              borderRadius: "12px",
                              border: hasNotes ? "1px solid #f59e0b" : "1px solid #cbd5e1",
                              background: hasNotes ? "#fef3c7" : "#f8fafc",
                              color: hasNotes ? "#78350f" : "#475569",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                            title="Agregar o editar nota"
                          >
                            <IonIcon icon={chatbubbleEllipsesOutline} style={{ fontSize: "1.3rem", color: hasNotes ? "#d97706" : "#64748b" }} />
                            {hasNotes && <span>Nota</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, currentComensal, -totalQty)}
                            style={{
                              height: "40px",
                              width: "40px",
                              borderRadius: "12px",
                              border: "1px solid #fecdd3",
                              background: "#fff1f2",
                              color: "#e11d48",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            title="Eliminar del comensal"
                          >
                            <IonIcon icon={trashOutline} style={{ fontSize: "1.3rem" }} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </IonContent>
        {totalItems > 0 && appMode !== "gestion_cuentas" && (
          <IonFooter className="ion-no-border">
            <IonToolbar
              style={{
                "--background": "rgb(40, 45, 52)",
                "--color": "white",
                "--border-radius": "20px 20px 0 0",
              }}
              className="ion-padding-horizontal py-1"
            >
              <div
                onClick={() => {
                  const firstComensal =
                    cart.length > 0 ? Math.min(...cart.map((i) => i.plate)) : 1;
                  setReviewComensal(firstComensal);
                  setAppMode("review");
                }}
                className="flex items-center justify-between gap-2 w-full px-2 py-1 cursor-pointer hover:opacity-90 transition"
              >
                {/* Left: View Order */}
                <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-tight">
                  <IonIcon icon={cartOutline} style={{ fontSize: "1.4rem" }} />
                  <span>VER PEDIDO ({totalItems})</span>
                </div>

                {/* Right: Total Price */}
                <div className="text-emerald-400 font-black text-base sm:text-lg tracking-tight">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
            </IonToolbar>
          </IonFooter>
        )}
      </IonPage>
    );
};
