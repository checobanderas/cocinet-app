import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonCol, IonContent, IonGrid, IonPage, IonRow, IonText, useIonAlert } from '@ionic/react';


interface GestionCuentasViewProps {
  cart: any;
  isListening: any;
  isOnline: any;
  renderClosedAccountsList: any;
  renderMaterialHeader: any;
  renderMenu: any;
  renderReview: any;
  renderTableDetails: any;
  selectedTableGestion: any;
  selectedTenant: any;
  setSelectedTableGestion: any;
  setSelectedTableId: any;
  effectiveTables: any;
  startVoiceRecognition: any;
  zones: any;
  scaleLeft?: number;
  scaleRight?: number;
  onScaleChange?: (side: 'left' | 'right', newScale: number) => void;
  companyConfig?: any;
  currentUser?: any;
  updateCompanyConfig?: (updates: any) => void;
}

export const GestionCuentasView: React.FC<GestionCuentasViewProps> = ({
  cart,
  isListening,
  isOnline,
  renderClosedAccountsList,
  renderMaterialHeader,
  renderMenu,
  renderReview,
  renderTableDetails,
  selectedTableGestion,
  selectedTenant,
  setSelectedTableGestion,
  setSelectedTableId,
  effectiveTables, 
  startVoiceRecognition, 
  zones,
  scaleLeft = 1,
  scaleRight = 1,
  onScaleChange,
  companyConfig,
  currentUser,
  updateCompanyConfig
}) => {
  const [presentAlert] = useIonAlert();
  const [isEditingLayout, setIsEditingLayout] = React.useState(false);
  const [draftLayoutConfig, setDraftLayoutConfig] = React.useState<any>({});
  const [draggedZone, setDraggedZone] = React.useState<string | null>(null);
  
  const [showZoomLeft, setShowZoomLeft] = React.useState(false);
  const [showZoomRight, setShowZoomRight] = React.useState(false);

  const renderFloatingZoom = (side: 'left' | 'right', currentScale: number, show: boolean, setShow: (s: boolean) => void) => (
    <div style={{ position: 'absolute', top: '70px', right: '16px', zIndex: 100 }} className="flex items-center gap-2">
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            style={{ overflow: 'hidden' }}
            className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 shadow-lg border border-slate-200"
          >
            <button onClick={() => onScaleChange?.(side, Math.max(0.5, currentScale - 0.1))} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold min-w-[28px]"><i className="fa-solid fa-search-minus"></i></button>
            <span className="text-xs font-black text-slate-500 w-10 text-center">{Math.round(currentScale * 100)}%</span>
            <button onClick={() => onScaleChange?.(side, Math.min(2, currentScale + 0.1))} className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold min-w-[28px]"><i className="fa-solid fa-search-plus"></i></button>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setShow(!show)}
        className="w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all opacity-80 hover:opacity-100"
        title="Zoom"
      >
        <i className={`fa-solid ${show ? 'fa-chevron-right' : 'fa-search'}`}></i>
      </button>
    </div>
  );

  const isPrivileged = currentUser?.role && currentUser.role !== "cajero" && currentUser.role !== "mesero";

  const layoutConfig = isEditingLayout ? draftLayoutConfig : (companyConfig?.tableLayoutSettings || {});
  const zoneAliases = layoutConfig.zoneAliases || {};

  const handleRenameZone = (zone: string) => {
    const currentName = zoneAliases[zone] || zone;
    presentAlert({
      header: 'Renombrar Área',
      message: `Escribe el nuevo nombre para "${currentName}":`,
      inputs: [{ name: 'newName', type: 'text', placeholder: currentName, value: currentName }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Guardar', 
          handler: (data) => {
            if (data.newName && data.newName.trim() !== "") {
              setDraftLayoutConfig((prev: any) => ({
                ...prev,
                zoneAliases: { ...(prev.zoneAliases || {}), [zone]: data.newName.trim() }
              }));
            }
          }
        }
      ]
    });
  };

  const handleAddZone = () => {
    presentAlert({
      header: 'Agregar Nueva Área',
      message: 'Ingresa el nombre del área (ej. Patio, Terraza):',
      inputs: [{ name: 'newName', type: 'text', placeholder: 'Nombre del área' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Agregar', 
          handler: (data) => {
            const newName = data.newName;
            if (newName && newName.trim() !== "") {
              const newZoneKey = newName.trim();
              setDraftLayoutConfig((prev: any) => {
                const currentOrder = prev.zoneOrder || [...zones];
                const newOrder = [...new Set([...currentOrder, ...zones, newZoneKey])];
                return {
                  ...prev,
                  zoneOrder: newOrder,
                  zoneCounts: { ...(prev.zoneCounts || {}), [newZoneKey]: 5 }
                };
              });
            }
          }
        }
      ]
    });
  };

  const orderedZones = [...new Set([...zones, ...(layoutConfig.zoneOrder || [])])].sort((a, b) => {
    const idxA = layoutConfig.zoneOrder?.indexOf(a) ?? 99;
    const idxB = layoutConfig.zoneOrder?.indexOf(b) ?? 99;
    return idxA - idxB;
  }).filter(zone => {
    const configuredCount = layoutConfig.zoneCounts?.[zone];
    if (configuredCount === 0) {
      const tablesInZone = effectiveTables.filter((t: any) => t.zone === zone);
      const occupied = tablesInZone.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
      if (occupied.length === 0) return false;
    }
    return true;
  });

  const handleMoveZone = (zone: string, dir: number) => {
    setDraftLayoutConfig((prev: any) => {
      const currentOrder = prev.zoneOrder || [...zones];
      const newOrder = [...new Set([...currentOrder, ...zones])];
      const idx = newOrder.indexOf(zone);
      if (idx === -1) return prev;
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= newOrder.length) return prev;
      
      [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
      return { ...prev, zoneOrder: newOrder };
    });
  };

  const handleChangeTableCount = (zone: string, delta: number) => {
    setDraftLayoutConfig((prev: any) => {
      const defaultCount = effectiveTables.filter((t: any) => t.zone === zone).length;
      const currentCount = prev.zoneCounts?.[zone] ?? defaultCount;
      const newCount = Math.max(1, currentCount + delta);
      return { 
        ...prev, 
        zoneCounts: { ...(prev.zoneCounts || {}), [zone]: newCount } 
      };
    });
  };

  const handleDeleteZone = (zone: string) => {
    const tablesInZone = effectiveTables.filter((t: any) => t.zone === zone);
    const occupied = tablesInZone.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
    
    if (occupied.length > 0) {
      triggerAppNotification("No permitido", `El área "${zoneAliases[zone] || zone}" tiene mesas ocupadas y no puede ser eliminada.`, "warning");
      return;
    }

    presentAlert({
      header: 'Eliminar Área',
      message: `¿Estás seguro de que deseas eliminar el área "${zoneAliases[zone] || zone}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: () => {
            setDraftLayoutConfig((prev: any) => {
              const currentOrder = prev.zoneOrder || [...zones];
              const newOrder = currentOrder.filter((z: string) => z !== zone);
              return { 
                ...prev, 
                zoneOrder: newOrder,
                zoneCounts: { ...(prev.zoneCounts || {}), [zone]: 0 } 
              };
            });
          }
        }
      ]
    });
  };

return (
      <IonPage>
        {renderMaterialHeader({
          title: (() => {
            if (!selectedTableGestion) return "Gestión de Cuentas (Windows)";
            const z = (selectedTableGestion.zone || "").toLowerCase();
            const l = (selectedTableGestion.label || "").toLowerCase();
            let emoji = "🍽️";
            if (z.includes("llevar") || l.includes("llevar")) emoji = "🛍️";
            else if (z.includes("domicilio") || l.includes("domicilio") || z.includes("reparto") || l.includes("reparto")) emoji = "🏍️";
            const prefix = emoji === "🍽️" ? "Mesa " : "";
            return `Gestionando Cuenta ${emoji} (${prefix}${selectedTableGestion.label || "S/N"})`;
          })(),
          subtitle: selectedTenant?.name || "Cocinet",
          showBack: !!selectedTableGestion,
          onBack: () => setSelectedTableGestion(null),
          showMenu: !selectedTableGestion,
          actions: (selectedTableGestion && isOnline) ? (
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
        <IonContent
          className="ion-padding"
          style={{
            "--background": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          }}
        >
          <IonGrid style={{ height: "100%", margin: 0, padding: 0 }}>
            <IonRow style={{ height: "100%" }}>
              
              {/* Mitad Izquierda: Mapa de Mesas o Menú */}
              <IonCol size="6" style={{ height: "100%", overflow: "hidden", borderRight: "2px solid #334155", paddingRight: "16px", position: "relative" }}>
                {renderFloatingZoom('left', scaleLeft, showZoomLeft, setShowZoomLeft)}
                <AnimatePresence mode="wait">
                  {!selectedTableGestion ? (
                    <motion.div
                      key="mesas"
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ height: "100%", overflowY: "auto", padding: "0.75rem", background: "#f8fafc" }}
                    >
                      <div className="flex justify-end items-center mb-3 mt-2 pr-2">
                        {isPrivileged && (
                          <div className="flex gap-2">
                            {isEditingLayout && (
                              <button 
                                onClick={() => {
                                  setDraftLayoutConfig({});
                                  setIsEditingLayout(false);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm border bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                <i className="fa-solid fa-times mr-1"></i>
                                Cancelar
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (isEditingLayout) {
                                  updateCompanyConfig?.({ tableLayoutSettings: draftLayoutConfig });
                                  setIsEditingLayout(false);
                                } else {
                                  setDraftLayoutConfig(companyConfig?.tableLayoutSettings || {});
                                  setIsEditingLayout(true);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm border ${isEditingLayout ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              <i className={`fa-solid ${isEditingLayout ? 'fa-check' : 'fa-pen'} mr-1`}></i>
                              {isEditingLayout ? 'Guardar Cambios' : 'Editar Mesas'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ zoom: scaleLeft || 1, paddingBottom: "100px" }}>
                      {orderedZones.map((zone: string, zIdx: number) => (
                        <div 
                          key={zone} 
                          className={`ion-margin-bottom ${draggedZone === zone ? 'opacity-50' : ''}`}
                          draggable={isEditingLayout}
                          onDragStart={(e) => {
                            setDraggedZone(zone);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (!draggedZone || draggedZone === zone) return;
                            
                            setDraftLayoutConfig((prev: any) => {
                              const newOrder = [...orderedZones];
                              const draggedIdx = newOrder.indexOf(draggedZone);
                              const targetIdx = newOrder.indexOf(zone);
                              
                              newOrder.splice(draggedIdx, 1);
                              newOrder.splice(targetIdx, 0, draggedZone);
                              
                              return { ...prev, zoneOrder: newOrder };
                            });
                            setDraggedZone(null);
                          }}
                          onDragEnd={() => setDraggedZone(null)}
                        >
                            <div className={`flex items-center justify-between px-3 pb-1 ${isEditingLayout ? 'cursor-move' : ''}`}>
                              <div className="flex items-center gap-2">
                                {isEditingLayout && <i className="fa-solid fa-grip-vertical text-slate-300 mr-1"></i>}
                                <h2
                                  style={{
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                    letterSpacing: "2px",
                                    color: "#475569",
                                    margin: 0,
                                    cursor: (isPrivileged && isEditingLayout) ? 'pointer' : 'default'
                                  }}
                                  onClick={() => isPrivileged && isEditingLayout && handleRenameZone(zone)}
                                  title={isPrivileged && isEditingLayout ? "Clic para renombrar" : ""}
                                >
                                  {zoneAliases[zone] || zone} {isPrivileged && isEditingLayout && <i className="fa-solid fa-pen text-[10px] ml-1 text-slate-400"></i>}
                                </h2>
                              </div>
                              {isPrivileged && isEditingLayout && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteZone(zone);
                                  }}
                                  className="text-rose-400 hover:text-rose-600 transition-colors px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded cursor-pointer"
                                  title="Eliminar área"
                                >
                                  <i className="fa-solid fa-trash-can text-[10px]"></i> Eliminar
                                </button>
                              )}
                            </div>
                          <div style={{ display: "flex", flexWrap: "wrap", margin: "-4px" }}>
                            {(() => {
                              let tablesInZone = effectiveTables.filter((t: any) => t.zone === zone);
                              
                              tablesInZone.sort((a: any, b: any) => {
                                const numA = parseInt(a.label.replace(/\D/g, ""), 10) || 0;
                                const numB = parseInt(b.label.replace(/\D/g, ""), 10) || 0;
                                if (numA !== numB) return numA - numB;
                                return a.label.localeCompare(b.label);
                              });
                              
                              const configuredCount = layoutConfig.zoneCounts?.[zone];
                              if (configuredCount !== undefined) {
                                // If they want less tables, we hide them, UNLESS they are occupied
                                if (configuredCount < tablesInZone.length) {
                                  const occupied = tablesInZone.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
                                  const empty = tablesInZone.filter((t: any) => t.status !== "occupied" && (!t.comandas || t.comandas.length === 0));
                                  const remainingSlots = Math.max(0, configuredCount - occupied.length);
                                  tablesInZone = [...occupied, ...empty.slice(0, remainingSlots)];
                                } 
                                // If they want more tables, we generate mock tables for the UI
                                else if (configuredCount > tablesInZone.length) {
                                  const diff = configuredCount - tablesInZone.length;
                                  const existingNumbers = tablesInZone.map((t: any) => {
                                    const num = parseInt(t.label.replace(/\D/g, ""), 10);
                                    return isNaN(num) ? 0 : num;
                                  });
                                  
                                  const zonePrefix = zoneAliases[zone] || zone;

                                  let nextNum = 1;
                                  for (let i = 0; i < diff; i++) {
                                    while (existingNumbers.includes(nextNum)) {
                                      nextNum++;
                                    }
                                    const newNum = nextNum;
                                    existingNumbers.push(newNum); // mark as used
                                    
                                    tablesInZone.push({
                                      id: `table-${selectedTenant?.id || 'default'}-${zone.replace(/\s+/g, '-').toLowerCase()}-${newNum}`,
                                      uid: `table-${selectedTenant?.id || 'default'}-${zone.replace(/\s+/g, '-').toLowerCase()}-${newNum}`,
                                      label: `${zonePrefix} ${newNum}`,
                                      zone: zone,
                                      status: "available",
                                      comandas: [],
                                      tenantId: selectedTenant?.id,
                                      shape: 'local',
                                      _isMock: true
                                    });
                                  }
                                }
                              }
                              
                              // Re-sort after generating mock tables so they fall into place correctly
                              tablesInZone.sort((a: any, b: any) => {
                                const numA = parseInt(a.label.replace(/\D/g, ""), 10) || 0;
                                const numB = parseInt(b.label.replace(/\D/g, ""), 10) || 0;
                                if (numA !== numB) return numA - numB;
                                return a.label.localeCompare(b.label);
                              });
                              
                              return tablesInZone;
                            })()
                              .map((table) => {
                                const hasActiveOrders = table.comandas.length > 0;
                                const isSelected = selectedTableGestion?.id === table.id;
                                
                                const waiterNames = Array.from(
                                  new Set(
                                    table.comandas
                                      .map((c: any) => c.createdBy?.name)
                                      .filter(Boolean),
                                  ),
                                );

                                return (
                                  <div
                                    key={`${table.id}-${table.status}-${table.comandas?.length || 0}`}
                                    className="ion-text-center"
                                    style={{ flex: "0 0 20%", maxWidth: "20%", padding: "8px 4px", minHeight: "125px" }}
                                  >
                                    <div
                                      onClick={() => { setSelectedTableGestion(table); setSelectedTableId(table.id); }}
                                      style={{
                                        width: "72px",
                                        height: "72px",
                                        margin: "0 auto",
                                        borderRadius: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                        fontWeight: "900",
                                        color: "white",
                                        position: "relative",
                                        boxShadow: isSelected ? "0 0 0 4px #3b82f6, 0 14px 28px rgba(59, 130, 246, 0.4)" : (hasActiveOrders ? "0 14px 28px rgba(225, 29, 72, 0.4)" : "0 8px 16px rgba(0,0,0,0.15)"),
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        border: isSelected ? "4px solid #60a5fa" : "4px solid rgba(255,255,255,0.4)",
                                        background: hasActiveOrders
                                          ? "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
                                          : table.status === "payment_pending"
                                            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                            : table.status === "occupied"
                                              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                                              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      }}
                                    >
                                      {table.label.replace(/\D/g, "") || table.label}
                                      {hasActiveOrders && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "-8px",
                                            background: "#1e293b",
                                            color: "white",
                                            borderRadius: "55%",
                                            width: "28px",
                                            height: "28px",
                                            fontSize: "0.85rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "3px solid white",
                                            fontWeight: "900",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                                          }}
                                        >
                                          {table.comandas.length}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {hasActiveOrders || table.status === "occupied" ? (
                                      <div
                                        style={{
                                          marginTop: "8px",
                                          fontSize: "0.68rem",
                                          fontWeight: "800",
                                          color: "#1e293b",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "1px",
                                          lineHeight: "1.2",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        {waiterNames.length > 0 ? (
                                          <>
                                            <span
                                              style={{
                                                fontSize: "0.55rem",
                                                color: "#64748b",
                                                fontWeight: "normal",
                                              }}
                                            >
                                              🤵{" "}
                                              {waiterNames.length > 1
                                                ? "Meseros:"
                                                : "Mesero:"}
                                            </span>
                                            <span
                                              style={{
                                                color: "#e11d48",
                                                maxWidth: "100%",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                padding: "1px 6px",
                                                background: "#ffe4e6",
                                                borderRadius: "6px",
                                                border: "1px solid #fecdd3",
                                              }}
                                              title={waiterNames.join(" & ")}
                                            >
                                              {waiterNames.join(" & ")}
                                            </span>
                                          </>
                                        ) : (
                                          <span style={{ color: "#e11d48" }}>Activa</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div style={{ marginTop: "8px", fontSize: "0.75rem", fontWeight: "bold", color: "#cbd5e1" }}>
                                        Libre
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {isPrivileged && isEditingLayout && (
                                <>
                                  <div style={{ flex: "0 0 20%", maxWidth: "20%", padding: "8px 4px", minHeight: "125px" }} className="ion-text-center">
                                    <div onClick={() => handleChangeTableCount(zone, -1)} style={{ width: "72px", height: "72px", margin: "0 auto", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "900", color: "#e11d48", background: "#ffe4e6", border: "2px dashed #fecdd3", cursor: "pointer", boxShadow: "0 8px 16px rgba(225,29,72,0.15)" }}>
                                        -
                                    </div>
                                    <div style={{ marginTop: "12px", fontSize: "0.75rem", fontWeight: "bold", color: "#cbd5e1" }}>Quitar</div>
                                  </div>
                                  <div style={{ flex: "0 0 20%", maxWidth: "20%", padding: "8px 4px", minHeight: "125px" }} className="ion-text-center">
                                    <div onClick={() => handleChangeTableCount(zone, 1)} style={{ width: "72px", height: "72px", margin: "0 auto", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "900", color: "#059669", background: "#d1fae5", border: "2px dashed #a7f3d0", cursor: "pointer", boxShadow: "0 8px 16px rgba(5,150,105,0.15)" }}>
                                        +
                                    </div>
                                    <div style={{ marginTop: "12px", fontSize: "0.75rem", fontWeight: "bold", color: "#cbd5e1" }}>Mesa</div>
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      ))}
                      {isPrivileged && isEditingLayout && (
                        <div className="flex justify-center mt-6 mb-8">
                          <button onClick={handleAddZone} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold border-2 border-dashed border-slate-300 hover:bg-slate-200 hover:text-slate-800 transition-colors shadow-sm cursor-pointer">
                            <i className="fa-solid fa-plus mr-2"></i>
                            Agregar Nueva Área
                          </button>
                        </div>
                      )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 0, right: 16, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      <div style={{ zoom: scaleLeft || 1, height: "100%" }}>
                        {renderMenu()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </IonCol>

              {/* Mitad Derecha: Cuentas o Ticket */}
              <IonCol size="6" style={{ height: "100%", overflow: "hidden", paddingLeft: "16px", display: "flex", flexDirection: "column", position: "relative" }}>
                {renderFloatingZoom('right', scaleRight || 1, showZoomRight, setShowZoomRight)}

                <div style={{ flex: 1, position: "relative" }}>
                  <AnimatePresence mode="wait">
                    {!selectedTableGestion ? (
                      <motion.div
                        key="cuentas"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="embedded-menu-container"
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                      >
                        <div style={{ zoom: scaleRight || 1, height: "100%" }}>
                          {renderClosedAccountsList()}
                        </div>
                      </motion.div>
                    ) : cart.length > 0 ? (
                      <motion.div
                        key="review"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="embedded-menu-container"
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                      >
                        <div style={{ zoom: scaleRight || 1, height: "100%" }}>
                          {renderReview()}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="embedded-menu-container"
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                      >
                        <div style={{ zoom: scaleRight || 1, height: "100%" }}>
                          {renderTableDetails()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
};
