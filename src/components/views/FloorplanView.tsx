import { getFormattedProductName } from '../../utils/appHelpers';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonAccordion, IonAccordionGroup, IonBadge, IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonPage, IonRow, IonSegment, IonSegmentButton, IonText, IonToolbar } from '@ionic/react';
import { arrowForwardOutline, beerOutline, printOutline, receiptOutline, restaurantOutline } from 'ionicons/icons';

interface FloorplanViewProps {
  generalNotes: any;
  handleTableClick: any;
  isListening: any;
  isOnline: any;
  mainTab: any;
  renderClosedAccountsList: any;
  renderMaterialHeader: any;
  selectedTenant: any;
  setMainTab: any;
  tables: any;
  effectiveTables: any;
  getComandaDestinations: any;
  getComensalColor: any;
  printComanda: any;
  startVoiceRecognition: any;
  zones: any;
  onSwitchTablesMode?: (mode: "floorplan" | "gestion_cuentas") => void;
}

export const FloorplanView: React.FC<FloorplanViewProps> = ({
  generalNotes,
  handleTableClick,
  isListening,
  isOnline,
  mainTab,
  renderClosedAccountsList,
  renderMaterialHeader,
  selectedTenant,
  setMainTab,
  tables,
  effectiveTables, getComandaDestinations, getComensalColor, printComanda, startVoiceRecognition, zones,
  onSwitchTablesMode
}) => {
  return (
<IonPage>
      {renderMaterialHeader({
        title: selectedTenant ? `🏢 ${selectedTenant.name}` : "Cocinet",
        subtitle: `📍 ${selectedTenant?.sucursalDefault || "Matriz"}`,
        showBack: false,
        showMenu: true,
        actions: (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onSwitchTablesMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSwitchTablesMode("gestion_cuentas")}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[11px] sm:text-xs transition-all cursor-pointer border border-emerald-500/40 shadow-sm"
                title="Cambiar a Gestión de Cuentas (Pantalla Dividida)"
              >
                <span>💻</span>
                <span className="hidden sm:inline">Gestión Cuentas</span>
              </motion.button>
            )}
            {isOnline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startVoiceRecognition}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer border-none shadow-md ${
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
            )}
          </div>
        )
      })}
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}
        >
          <IonSegment
            value={mainTab}
            onIonChange={(e) => setMainTab(e.detail.value as any)}
            style={{ "--background": "rgba(255,255,255,0.1)" }}
          >
            <IonSegmentButton
              value="mesas"
              style={
                mainTab === "mesas"
                  ? {
                      background: "#3b82f6",
                      borderRadius: "8px",
                      margin: "4px",
                    }
                  : { margin: "4px" }
              }
            >
              <IonLabel
                style={{
                  color: "white",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i
                  className="fa-solid fa-chair"
                  style={{ fontSize: "1.2rem" }}
                ></i>{" "}
                Mesas
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton
              value="comandas"
              style={
                mainTab === "comandas"
                  ? {
                      background: "#f59e0b",
                      borderRadius: "8px",
                      margin: "4px",
                    }
                  : { margin: "4px" }
              }
            >
              <IonLabel
                style={{
                  color: "white",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i
                  className="fa-solid fa-bell-concierge"
                  style={{ fontSize: "1.2rem" }}
                ></i>{" "}
                Comandas
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton
              value="cuentas"
              style={
                mainTab === "cuentas"
                  ? {
                      background: "#10b981",
                      borderRadius: "8px",
                      margin: "4px",
                    }
                  : { margin: "4px" }
              }
            >
              <IonLabel
                style={{
                  color: "white",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i
                  className="fa-solid fa-file-invoice-dollar"
                  style={{ fontSize: "1.2rem" }}
                ></i>{" "}
                Cuentas
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="ion-padding"
        style={{
          "--background": "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        }}
      >
        {mainTab === "mesas" &&
          zones.map((zone) => (
            <div key={zone} className="ion-margin-bottom">
              <IonText color="medium">
                <h2
                  className="ion-padding-start"
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: "#4a5568",
                  }}
                >
                  {zone}
                </h2>
              </IonText>
              <IonGrid>
                <IonRow>
                  {effectiveTables
                    .filter((t) => t.zone === zone)
                    .sort((a, b) => {
                      const numA =
                        parseInt(a.label.replace(/\D/g, ""), 10) || 0;
                      const numB =
                        parseInt(b.label.replace(/\D/g, ""), 10) || 0;
                      if (numA !== numB) return numA - numB;
                      return a.label.localeCompare(b.label);
                    })
                    .map((table) => {
                      const waiterNames = Array.from(
                        new Set(
                          table.comandas
                            .map((c) => c.createdBy?.name)
                            .filter(Boolean),
                        ),
                      );
                      const hasActiveOrders = table.comandas.length > 0;
                      return (
                        <IonCol
                          size="2.4"
                          key={`${table.id}-${table.status}-${table.comandas?.length || 0}`}
                          className="ion-text-center"
                          style={{ padding: "8px 4px", minHeight: "125px" }}
                        >
                          <div
                            onClick={() => handleTableClick(table)}
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
                              boxShadow: hasActiveOrders
                                ? "0 14px 28px rgba(225, 29, 72, 0.4)"
                                : "0 8px 16px rgba(0,0,0,0.15)",
                              cursor: "pointer",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              border: "4px solid rgba(255,255,255,0.4)",
                              background: hasActiveOrders
                                ? "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)" // Hermoso rojo vibrante 🔴
                                : table.status === "payment_pending"
                                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" // Naranja si está pidiendo cuenta 🟠
                                  : table.status === "occupied"
                                    ? "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)" // Rojo 🔴
                                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)", // Verde libre 🟢
                              position: "relative",
                              outline: "none",
                              animation: hasActiveOrders
                                ? "pulse-table 2s infinite"
                                : "none",
                              padding: "4px",
                            }}
                            className="table-item"
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform =
                                "scale(1.15) translateY(-8px)";
                              e.currentTarget.style.boxShadow = hasActiveOrders
                                ? "0 22px 35px rgba(225, 29, 72, 0.6)"
                                : "0 20px 40px rgba(0,0,0,0.3)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.8)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform =
                                "scale(1) translateY(0)";
                              e.currentTarget.style.boxShadow = hasActiveOrders
                                ? "0 14px 28px rgba(225, 29, 72, 0.4)"
                                : "0 12px 24px rgba(0,0,0,0.2)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.4)";
                            }}
                          >
                            <span
                              style={{
                                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                                lineHeight: "1",
                              }}
                            >
                              {table.label}
                            </span>
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
                          {/* Elegante etiqueta del mesero o estado debajo del círculo 🤵 */}
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
                                <span
                                  style={{
                                    color: "#e11d48",
                                    padding: "1px 6px",
                                    background: "#ffe4e6",
                                    borderRadius: "6px",
                                    border: "1px solid #fecdd3",
                                  }}
                                >
                                  Ocupada 🔴
                                </span>
                              )}
                            </div>
                          ) : table.status === "payment_pending" ? (
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "0.6rem",
                                color: "#d97706",
                                fontWeight: "bold",
                              }}
                            >
                              Cuenta Solicitada 🟠
                            </div>
                          ) : (
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "0.6rem",
                                color: "#10b981",
                                fontWeight: "bold",
                              }}
                            >
                              Disponible 🟢
                            </div>
                          )}
                        </IonCol>
                      );
                    })}
                </IonRow>
              </IonGrid>
            </div>
          ))}

        {mainTab === "comandas" && (
          <IonAccordionGroup
            style={{
              background: "transparent",
              marginLeft: "-16px",
              marginRight: "-16px",
              padding: "4px 0",
            }}
          >
            {tables
              .filter((t) => t.comandas.length > 0)
              .flatMap((t) => t.comandas.map((c) => ({ table: t, comanda: c })))
              .length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <IonIcon
                  icon={receiptOutline}
                  style={{ fontSize: "4rem", color: "#cbd5e1" }}
                />
                <IonText color="medium">
                  <p>No hay comandas activas</p>
                </IonText>
              </div>
            ) : (
              tables
                .filter((t) => t.comandas.length > 0)
                .flatMap((t) =>
                  t.comandas.map((c) => ({ table: t, comanda: c })),
                )
                .sort(
                  (a, b) =>
                    new Date(b.comanda.timestamp).getTime() -
                    new Date(a.comanda.timestamp).getTime(),
                )
                .map(({ table, comanda }) => {
                  const comensales = Array.from(
                    new Set(comanda.items.map((item) => item.plate)),
                  ).sort((a: any, b: any) => a - b) as number[];
                  return (
                    <IonAccordion
                      key={comanda.folio}
                      value={comanda.folio.toString()}
                      style={{
                        borderRadius: "0px",
                        marginBottom: "10px",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.05)",
                        background: "white",
                        width: "100%",
                      }}
                    >
                      <IonItem slot="header" color="light" lines="none" style={{ "--padding-start": "12px", "--padding-end": "12px" }}>
                        <IonIcon
                          icon={receiptOutline}
                          slot="start"
                          color="primary"
                          style={{ marginRight: "8px" }}
                        />
                        <IonLabel style={{ margin: "8px 0" }}>
                          <h2
                            style={{
                              fontWeight: "900",
                              whiteSpace: "normal",
                              fontSize: "1.05rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            {comanda.folioInterno ? (
                              <>
                                <span style={{ color: "#d97706", background: "#fef3c7", padding: "2px 8px", borderRadius: "6px", border: "1px solid #fde68a" }}>
                                  Folio Interno #{comanda.folioInterno}
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "normal" }}>
                                  (ID: #{comanda.folio})
                                </span>
                              </>
                            ) : (
                              `#${comanda.folio}`
                            )}
                          </h2>
                          <p style={{ fontSize: "0.75rem" }}>
                            Propietario: {comanda.createdBy?.name || "S/M"} 👑 •{" "}
                            {new Date(comanda.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </IonLabel>
                        <IonBadge
                          slot="end"
                          color="primary"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            fontWeight: "900",
                            letterSpacing: "0.5px",
                          }}
                        >
                          MESA {table.label}
                        </IonBadge>
                      </IonItem>
                      <div
                        slot="content"
                        style={{ background: "white", padding: "10px 12px" }}
                      >
                        {comensales.map((comensalNum: number) => (
                          <div key={comensalNum}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "8px 0 4px 0",
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  height: "1px",
                                  background: getComensalColor(comensalNum),
                                }}
                              ></div>
                              <IonText
                                style={{
                                  margin: "0 10px",
                                  fontSize: "0.65rem",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                  color: getComensalColor(comensalNum),
                                }}
                              >
                                Comensal {comensalNum}
                              </IonText>
                              <div
                                style={{
                                  flex: 1,
                                  height: "1px",
                                  background: getComensalColor(comensalNum),
                                }}
                              ></div>
                            </div>
                            {comanda.items
                              .filter((item) => item.plate === comensalNum)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    marginBottom: "4px",
                                    padding: "0 4px",
                                    opacity: item.isCancelled ? 0.5 : 1,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.9rem",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    <IonText
                                      style={{
                                        fontWeight: "500",
                                        textDecoration: item.isCancelled
                                          ? "line-through"
                                          : "none",
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {item.quantity}x{" "}
                                      {getFormattedProductName(item.product)}
                                      {item.isCancelled && (
                                        <span
                                          style={{
                                            color: "#ef4444",
                                            fontSize: "0.7rem",
                                            marginLeft: "6px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          [CANCELADO]
                                        </span>
                                      )}
                                    </IonText>
                                    <IonText
                                      color="medium"
                                      style={{
                                        textDecoration: item.isCancelled
                                          ? "line-through"
                                          : "none",
                                      }}
                                    >
                                      $
                                      {(
                                        item.quantity * item.product.price
                                      ).toFixed(2)}
                                    </IonText>
                                  </div>
                                  {item.notes && !item.isCancelled && (
                                    <div
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "#64748b",
                                        fontStyle: "italic",
                                        paddingLeft: "12px",
                                        borderLeft: "2px solid #e2e8f0",
                                      }}
                                    >
                                      {item.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ))}

                        {comanda.generalNotes && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "8px 10px",
                              background: "#fffbeb",
                              borderRadius: "10px",
                              border: "1px solid #fef3c7",
                            }}
                          >
                            <IonText
                              style={{
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                                display: "block",
                                color: "#b45309",
                                textTransform: "uppercase",
                              }}
                            >
                              Observación:
                            </IonText>
                            <IonText
                              style={{ fontSize: "0.85rem", color: "#92400e" }}
                            >
                              {comanda.generalNotes}
                            </IonText>
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            gap: "6px",
                            borderTop: "1px solid #f1f5f9",
                            paddingTop: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {getComandaDestinations(comanda).includes(
                            "kitchen",
                          ) && (
                            <IonButton
                              fill="outline"
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                printComanda(table.label, comanda, "kitchen");
                              }}
                              style={{ flex: "1 1 30%", fontSize: "0.7rem" }}
                            >
                              <IonIcon icon={restaurantOutline} slot="start" />
                              Cocina
                            </IonButton>
                          )}
                          {getComandaDestinations(comanda).includes("bar") && (
                            <IonButton
                              fill="outline"
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                printComanda(table.label, comanda, "bar");
                              }}
                              style={{ flex: "1 1 30%", fontSize: "0.7rem" }}
                            >
                              <IonIcon icon={beerOutline} slot="start" />
                              Barra
                            </IonButton>
                          )}
                          {getComandaDestinations(comanda).length === 0 && (
                            <IonButton
                              fill="outline"
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                printComanda(table.label, comanda);
                              }}
                              style={{ flex: "1 1 30%", fontSize: "0.7rem" }}
                            >
                              <IonIcon icon={printOutline} slot="start" />
                              Reimprimir
                            </IonButton>
                          )}
                          <IonButton
                            color="secondary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTableClick(table);
                            }}
                            style={{ flex: "1 1 30%", fontSize: "0.7rem" }}
                          >
                            <IonIcon icon={arrowForwardOutline} slot="start" />
                            Ver Mesa
                          </IonButton>
                        </div>
                      </div>
                    </IonAccordion>
                  );
                })
            )}
          </IonAccordionGroup>
        )}

        {mainTab === "cuentas" && renderClosedAccountsList()}
      </IonContent>
      {!isOnline && (
        <IonFooter className="ion-no-border">
          <IonToolbar 
            style={{ 
              "--background": "linear-gradient(to right, rgb(159, 18, 57), rgb(136, 19, 55))", // Deep Rose/Crimson dark gradient
              "--color": "white", 
              "borderTop": "1px solid rgba(255, 255, 255, 0.08)",
              "transition": "all 0.5s ease" 
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 sm:py-2.5 text-xs text-slate-300 gap-1.5 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 animate-pulse"></span>
                </span>
                <span className="font-extrabold tracking-tight text-[11px] sm:text-xs text-slate-200">
                  🔴 OPERANDO SIN CONEXIÓN • Datos seguros en caché local 📁
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] sm:text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <span>📢</span> Notificaciones PWA: <span className="bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-black border border-amber-400/20 uppercase tracking-widest">Activas</span>
                </span>
                <span className="hidden md:inline text-slate-500 font-mono text-[9px]">
                  UUID Sync Engine • Active DB
                </span>
              </div>
            </div>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};
