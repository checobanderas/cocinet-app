import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonCol, IonContent, IonGrid, IonPage, IonRow, IonText } from '@ionic/react';


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
  effectiveTables, startVoiceRecognition, zones
}) => {
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
                <AnimatePresence mode="wait">
                  {!selectedTableGestion ? (
                    <motion.div
                      key="mesas"
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ height: "100%", overflowY: "auto" }}
                    >
                      <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                        <h2 style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>📍 Mapa de Mesas</h2>
                      </div>
                      {zones.map((zone) => (
                        <div key={zone} className="ion-margin-bottom">
                          <IonText color="medium">
                            <h2
                              className="ion-padding-start"
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                color: "#94a3b8",
                              }}
                            >
                              {zone}
                            </h2>
                          </IonText>
                          <div style={{ display: "flex", flexWrap: "wrap", margin: "-4px" }}>
                            {effectiveTables
                              .filter((t) => t.zone === zone)
                              .sort((a, b) => {
                                const numA = parseInt(a.label.replace(/\D/g, ""), 10) || 0;
                                const numB = parseInt(b.label.replace(/\D/g, ""), 10) || 0;
                                if (numA !== numB) return numA - numB;
                                return a.label.localeCompare(b.label);
                              })
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
                                      {table.label}
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
                          </div>
                        </div>
                      ))}
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
                      {renderMenu()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </IonCol>

              {/* Mitad Derecha: Cuentas o Ticket */}
              <IonCol size="6" style={{ height: "100%", overflow: "hidden", paddingLeft: "16px", position: "relative" }}>
                <AnimatePresence mode="wait">
                  {!selectedTableGestion ? (
                    <motion.div
                      key="cuentas"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 16, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderClosedAccountsList()}
                    </motion.div>
                  ) : cart.length > 0 ? (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 16, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderReview()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 16, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderTableDetails()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
};
