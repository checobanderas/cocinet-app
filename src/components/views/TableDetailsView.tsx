import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonCard, IonContent, IonHeader, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonText, IonToolbar } from '@ionic/react';
import { addOutline, checkmarkCircleOutline, printOutline, receiptOutline, restaurantOutline, swapHorizontalOutline, trashOutline } from 'ionicons/icons';

interface TableDetailsViewProps {
  appMode: any;
  cancellationReason: any;
  checkoutReturnMode: any;
  currentUser: any;
  handleRevertEntireComandaCancellation: any;
  isPrintingPrecuenta: any;
  itemsSelectedForCancellation: any;
  precuentaComensal: any;
  precuentaTab: any;
  renderDeliveryPanel: any;
  renderMaterialHeader: any;
  renderPrecuentaItem: any;
  selectedTable: any;
  setActiveCategory: any;
  setActiveSubcategory: any;
  setAppMode: any;
  setCancellationPin: any;
  setCancellationReason: any;
  setCheckoutFallbackItems: any;
  setCheckoutReturnMode: any;
  setComandaToCancel: any;
  setIsPrintingPrecuenta: any;
  setItemsSelectedForCancellation: any;
  setMoveItemsSelection: any;
  setPaymentAmountReceived: any;
  setPaymentDiscountValue: any;
  setPaymentMethod: any;
  setPaymentTipValue: any;
  setPrecuentaComensal: any;
  setPrecuentaModalType: any;
  setPrecuentaTab: any;
  setRequiresInvoice: any;
  setSelectedTableGestion: any;
  setShowBulkItemCancellationReasonModal: any;
  setShowCancellationModal: any;
  setShowDiscountInput: any;
  setShowMoveItemsModal: any;
  setShowPaymentOptions: any;
  setShowTipInput: any;
  setShowTransferTableModal: any;
  setTransferTargetTableId: any;
  triggerAppNotification: any;
}

export const TableDetailsView: React.FC<TableDetailsViewProps> = ({
  appMode,
  cancellationReason,
  checkoutReturnMode,
  currentUser,
  handleRevertEntireComandaCancellation,
  isPrintingPrecuenta,
  itemsSelectedForCancellation,
  precuentaComensal,
  precuentaTab,
  renderDeliveryPanel,
  renderMaterialHeader,
  renderPrecuentaItem,
  selectedTable,
  setActiveCategory,
  setActiveSubcategory,
  setAppMode,
  setCancellationPin,
  setCancellationReason,
  setCheckoutFallbackItems,
  setCheckoutReturnMode,
  setComandaToCancel,
  setIsPrintingPrecuenta,
  setItemsSelectedForCancellation,
  setMoveItemsSelection,
  setPaymentAmountReceived,
  setPaymentDiscountValue,
  setPaymentMethod,
  setPaymentTipValue,
  setPrecuentaComensal,
  setPrecuentaModalType,
  setPrecuentaTab,
  setRequiresInvoice,
  setSelectedTableGestion,
  setShowBulkItemCancellationReasonModal,
  setShowCancellationModal,
  setShowDiscountInput,
  setShowMoveItemsModal,
  setShowPaymentOptions,
  setShowTipInput,
  setShowTransferTableModal,
  setTransferTargetTableId,
  triggerAppNotification
}) => {
const allItems = selectedTable?.comandas.flatMap((c) => c.items) || [];
    const tableTotal =
      allItems
        .filter((item) => !item.isCancelled)
        .reduce((sum, item) => sum + item.quantity * item.product.price, 0) ||
      0;

    // Grouping for "Resumen" (Summarized)
    const summarizedItems = allItems
      .filter((item) => !item.isCancelled)
      .reduce((acc: any[], item) => {
        const existing = acc.find((i) => i.product.id === item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, []);

    const cancelledItems = allItems
      .filter((item) => item.isCancelled)
      .reduce((acc: any[], item) => {
        const existing = acc.find(
          (i) =>
            i.product.id === item.product.id &&
            i.cancellationReason === item.cancellationReason &&
            i.cancelledBy?.id === item.cancelledBy?.id,
        );
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, []);

    // Grouping for "Comensales"
    const comensales = Array.from(
      new Set(allItems.map((item) => item.plate)),
    ).sort((a: number, b: number) => a - b) as number[];
    const maxComensal = Math.max(...comensales, 0);

    return (
      <IonPage>
      {appMode !== "gestion_cuentas" && renderMaterialHeader({
        title: `Mesa ${selectedTable?.label || "S/N"}`,
        subtitle: (() => {
          const activeWaiterNames = Array.from(
            new Set(
              (selectedTable?.comandas || [])
                .map((c) => c.createdBy?.name)
                .filter(Boolean),
            ),
          );
          return activeWaiterNames.length > 0
            ? `Atendido por: ${activeWaiterNames.join(" & ")}`
            : `Atendido por: ${currentUser?.name || "Sin registrar"}`;
        })(),
        showBack: true,
        minimal: appMode === "gestion_cuentas",
        onBack: () => {
          if (appMode === "gestion_cuentas") {
            setSelectedTableGestion(null);
          } else {
            const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
  setSelectedTableGestion(null);
}
setCheckoutReturnMode(null);
          }
          setPrecuentaComensal(1);
          setPrecuentaTab("resumen");
        }
      })}
      <IonHeader className="ion-no-border">
          <IonToolbar
            style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}
          >
            <IonSegment
              value={precuentaTab}
              onIonChange={(e) => setPrecuentaTab(e.detail.value as any)}
              style={{ "--background": "rgba(255,255,255,0.1)" }}
            >
              <IonSegmentButton value="resumen">
                <IonLabel style={{ color: "white", fontWeight: "bold" }}>
                  Resumen
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="comandas">
                <IonLabel style={{ color: "white", fontWeight: "bold" }}>
                  Comandas
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="comensales">
                <IonLabel style={{ color: "white", fontWeight: "bold" }}>
                  Comensales
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ "--background": "#f8fafc" }}>
          <div className="ion-padding">
            {precuentaTab === "resumen" && (
              <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                {renderDeliveryPanel()}
                <IonCard
                  style={{
                    borderRadius: "24px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "20px",
                      background: "#1e293b",
                      color: "white",
                    }}
                  >
                    <h2
                      style={{
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "800",
                        letterSpacing: "1px",
                      }}
                    >
                      RESUMEN DE CONSUMO
                    </h2>
                  </div>
                  <div style={{ background: "white" }}>
                    {summarizedItems.map((item, idx) =>
                      renderPrecuentaItem(
                        { ...item, plate: 0 },
                        false,
                        undefined,
                        idx,
                      ),
                    )}
                    {summarizedItems.length === 0 &&
                      cancelledItems.length === 0 && (
                        <div
                          style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          <IonIcon
                            icon={receiptOutline}
                            style={{ fontSize: "3rem", opacity: 0.2 }}
                          />
                          <p>No hay consumos registrados</p>
                        </div>
                      )}
                    {cancelledItems.length > 0 && (
                      <>
                        <div
                          style={{
                            padding: "15px 20px",
                            background: "#fef2f2",
                            borderTop: "1px solid #fee2e2",
                            borderBottom: "1px solid #fee2e2",
                          }}
                        >
                          <IonText
                            color="danger"
                            style={{
                              fontWeight: "800",
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            <IonIcon
                              icon={trashOutline}
                              style={{
                                marginRight: "8px",
                                verticalAlign: "middle",
                              }}
                            />
                            Cancelaciones
                          </IonText>
                        </div>
                        {cancelledItems.map((item, idx) =>
                          renderPrecuentaItem(
                            { ...item, plate: 0 },
                            false,
                            undefined,
                            idx,
                          ),
                        )}
                      </>
                    )}
                  </div>
                </IonCard>
              </div>
            )}

            {precuentaTab === "comandas" && (
              <div style={{ animation: "fadeIn 0.3s ease-out", marginLeft: "-16px", marginRight: "-16px", marginTop: "-16px" }}>
                {selectedTable?.comandas.map((comanda) => (
                  <IonCard
                    key={comanda.folio}
                    style={{
                      borderRadius: "0px",
                      marginBottom: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                      marginInline: "0px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 16px",
                        background: "#334155",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <IonIcon
                            icon={receiptOutline}
                            style={{ marginRight: "10px" }}
                          />
                          <IonText
                            style={{
                              fontWeight: "800",
                              fontSize: "1rem",
                              letterSpacing: "1px",
                            }}
                          >
                            FOLIO {comanda.folioInterno ? `INTERNO #${comanda.folioInterno}` : `#${comanda.folio}`}
                          </IonText>
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            opacity: 0.85,
                            marginLeft: "28px",
                            marginTop: "2px",
                            fontWeight: "bold",
                          }}
                        >
                          🤵 Atendido por:{" "}
                          {comanda.createdBy?.name || "Sin registrar"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <IonButton
                          fill="clear"
                          color="primary"
                          size="small"
                          onClick={() => {
                            const dests = getComandaDestinations(comanda);
                            if (dests.includes("kitchen")) {
                              printComanda(
                                selectedTable!.label,
                                comanda,
                                "kitchen",
                              );
                            }
                            if (
                              dests.includes("kitchen") &&
                              dests.includes("bar")
                            ) {
                              setTimeout(() => {
                                printComanda(
                                  selectedTable!.label,
                                  comanda,
                                  "bar",
                                );
                              }, 1500);
                            } else if (dests.includes("bar")) {
                              printComanda(
                                selectedTable!.label,
                                comanda,
                                "bar",
                              );
                            }
                          }}
                          style={{
                            margin: 0,
                            "--padding-start": "0",
                            "--padding-end": "0",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                          }}
                        >
                          <IonIcon icon={printOutline} slot="start" />
                          Reimprimir
                        </IonButton>
                        {!comanda.isPendingCancellation && (
                          <IonButton
                            fill="clear"
                            color="danger"
                            size="small"
                            onClick={() => setComandaToCancel(comanda.folio)}
                            style={{
                              margin: 0,
                              "--padding-start": "0",
                              "--padding-end": "0",
                            }}
                          >
                            <IonIcon icon={trashOutline} slot="icon-only" />
                          </IonButton>
                        )}
                        <IonText style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                          {new Date(comanda.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </IonText>
                      </div>
                    </div>
                    {comanda.isPendingCancellation && (
                      <div className="bg-amber-50 text-amber-800 px-4 py-2.5 text-xs font-black border-b border-amber-200 flex flex-wrap gap-2 justify-between items-center" style={{ fontFamily: "sans-serif" }}>
                        <span className="flex items-center gap-1.5">
                          <span>⏳</span> Proceso de Cancelación: {comanda.pendingCancellationReason || "No especificado"}
                        </span>
                        <div className="flex gap-2">
                          {currentUser?.role === "admin" && (
                            <IonButton
                              size="small"
                              color="danger"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await cancelEntireComanda(comanda.folio, comanda.pendingCancellationReason || "Autorizado por Admin", currentUser);
                              }}
                              style={{ margin: 0, fontWeight: "900" }}
                            >
                              Autorizar 🚫
                            </IonButton>
                          )}
                          <IonButton
                            size="small"
                            color="medium"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleRevertEntireComandaCancellation(selectedTable!.id, selectedTable, comanda.folio);
                            }}
                            style={{ margin: 0, fontWeight: "900" }}
                          >
                            Revertir 🔄
                          </IonButton>
                        </div>
                      </div>
                    )}
                    <div style={{ background: "white" }}>
                      {comanda.items.map((item, idx) =>
                        renderPrecuentaItem(item, true, comanda.folio, idx),
                      )}
                    </div>
                  </IonCard>
                ))}
              </div>
            )}

            {precuentaTab === "comensales" && (
              <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                {/* Standardized Comensal Selector */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    gap: "10px",
                    overflowX: "auto",
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    marginBottom: "15px",
                    borderRadius: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    scrollbarWidth: "none",
                  }}
                  className="no-scrollbar"
                >
                  <div
                    onClick={() => setPrecuentaComensal(0)}
                    style={{
                      minWidth: "80px",
                      height: "42px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        precuentaComensal === 0 ? "#1e293b" : "#f1f5f9",
                      color: precuentaComensal === 0 ? "white" : "#64748b",
                      fontWeight: "900",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.2s ease",
                      border:
                        precuentaComensal === 0 ? "none" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      boxShadow:
                        precuentaComensal === 0
                          ? "0 4px 10px rgba(30, 41, 59, 0.3)"
                          : "none",
                      flexShrink: 0,
                    }}
                  >
                    Para Compartir 🥗
                  </div>
                  {Array.from(
                    { length: Math.max(maxComensal, 4) },
                    (_, i) => i + 1,
                  ).map((num) => (
                    <div
                      key={num}
                      onClick={() => setPrecuentaComensal(num)}
                      style={{
                        minWidth: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          precuentaComensal === num
                            ? getComensalColor(num)
                            : "#f1f5f9",
                        color: precuentaComensal === num ? "white" : "#64748b",
                        fontWeight: "900",
                        fontSize: "1.1rem",
                        transition: "all 0.2s ease",
                        border:
                          precuentaComensal === num
                            ? "none"
                            : "1px solid #e2e8f0",
                        cursor: "pointer",
                        boxShadow:
                          precuentaComensal === num
                            ? `0 4px 10px ${getComensalColor(num)}44`
                            : "none",
                        flexShrink: 0,
                      }}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <IonCard
                  style={{
                    borderRadius: "24px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "15px 20px",
                      background:
                        precuentaComensal === 0
                          ? "#1e293b"
                          : getComensalColor(precuentaComensal),
                      color: "white",
                    }}
                  >
                    <h2
                      style={{
                        margin: "0",
                        fontSize: "1rem",
                        fontWeight: "800",
                        letterSpacing: "1px",
                      }}
                    >
                      {precuentaComensal === 0
                        ? "PLATOS COMPARTIDOS 🥗"
                        : `PEDIDO COMENSAL ${precuentaComensal}`}
                    </h2>
                  </div>
                  <div style={{ background: "white" }}>
                    {allItems
                      .filter((item) => item.plate === precuentaComensal)
                      .map((item, idx) =>
                        renderPrecuentaItem(item, false, undefined, idx),
                      )}
                    {allItems.filter((item) => item.plate === precuentaComensal)
                      .length === 0 && (
                      <div
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        <IonIcon
                          icon={restaurantOutline}
                          style={{ fontSize: "3rem", opacity: 0.2 }}
                        />
                        <p>Este comensal no tiene pedidos</p>
                      </div>
                    )}
                  </div>
                </IonCard>
              </div>
            )}

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  borderRadius: "24px",
                  padding: "25px",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 15px 30px -10px rgba(0,0,0,0.3)",
                }}
              >
                <div>
                  <IonText
                    style={{
                      fontSize: "0.9rem",
                      opacity: 0.7,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      fontWeight: "bold",
                    }}
                  >
                    Total a Pagar
                  </IonText>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "900",
                      marginTop: "5px",
                    }}
                  >
                    ${tableTotal.toFixed(2)}
                  </div>
                </div>
                <IonIcon
                  icon={receiptOutline}
                  style={{ fontSize: "3.5rem", opacity: 0.2 }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <IonButton
                    expand="block"
                    color="primary"
                    fill="outline"
                    disabled={isPrintingPrecuenta}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isPrintingPrecuenta) return;
                      setIsPrintingPrecuenta(true);

                      try {
                        setPrecuentaModalType(precuentaTab);
                        
                        // 🖨️ Mandar a imprimir precuenta inmediatamente según la pestaña seleccionada
                        if (selectedTable) {
                          await printTicket(selectedTable, precuentaTab);
                        }

                        triggerAppNotification(
                          "🖨️ Ticket Enviado",
                          `Imprimiendo precuenta (${precuentaTab.toUpperCase()}) para Mesa ${selectedTable?.label || ""}... ⚡🍽️`,
                          "success"
                        );
                      } catch (err: any) {
                        console.error("Error al imprimir precuenta:", err);
                      } finally {
                        setTimeout(() => setIsPrintingPrecuenta(false), 1200);
                      }
                    }}
                    style={{
                      height: "65px",
                      "--border-radius": "20px",
                      fontWeight: "800",
                      fontSize: "1rem",
                    }}
                  >
                    <IonIcon icon={printOutline} slot="start" />
                    {isPrintingPrecuenta
                      ? "Imprimiendo..."
                      : precuentaTab === "resumen"
                        ? "Precuenta"
                        : precuentaTab === "comandas"
                          ? "Comandas"
                          : "Comensales"}
                  </IonButton>

                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={() => {
                      setActiveCategory("food");
                      setActiveSubcategory("");
                      setAppMode("menu");
                    }}
                    style={{
                      height: "65px",
                      "--border-radius": "20px",
                      fontWeight: "800",
                      fontSize: "1rem",
                    }}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Agregar Prod.
                  </IonButton>
                </div>
                
                {currentUser?.role !== "mesero" && (selectedTable?.comandas?.length || 0) > 0 && (
                  <>
                    <IonButton
                      expand="block"
                      color="tertiary"
                      fill="outline"
                      onClick={() => {
                        const initialSelection: Record<string, number> = {};
                        setMoveItemsSelection(initialSelection);
                        setShowMoveItemsModal(true);
                      }}
                      style={{
                        height: "55px",
                        "--border-radius": "20px",
                        fontWeight: "800",
                        fontSize: "0.9rem",
                      }}
                    >
                      <IonIcon icon={swapHorizontalOutline} slot="start" />
                      MOVER PRODUCTOS A OTRA MESA
                    </IonButton>

                    <IonButton
                      expand="block"
                      color="danger"
                      fill="solid"
                      disabled={itemsSelectedForCancellation.length === 0}
                      onClick={() => {
                        setShowBulkItemCancellationReasonModal(true);
                      }}
                      style={{
                        height: "55px",
                        "--border-radius": "20px",
                        fontWeight: "900",
                        fontSize: "0.95rem",
                        marginTop: "8px",
                      }}
                    >
                      <IonIcon icon={trashOutline} slot="start" />
                      Enviar a Proceso de Cancelación {itemsSelectedForCancellation.length > 0 ? `(${itemsSelectedForCancellation.length})` : ""}
                    </IonButton>

                    {itemsSelectedForCancellation.length > 0 && (
                      <IonButton
                        expand="block"
                        color="medium"
                        fill="clear"
                        onClick={() => {
                          setItemsSelectedForCancellation([]);
                        }}
                        style={{ fontWeight: "bold" }}
                      >
                        Limpiar Selección 🔄
                      </IonButton>
                    )}

                    <IonButton
                      expand="block"
                      color="secondary"
                      fill="solid"
                      onClick={() => {
                        setTransferTargetTableId("");
                        setShowTransferTableModal(true);
                      }}
                      style={{
                        height: "55px",
                        "--border-radius": "20px",
                        fontWeight: "800",
                        fontSize: "0.9rem",
                        marginTop: "8px",
                      }}
                    >
                      <IonIcon icon={swapHorizontalOutline} slot="start" />
                      MUDAR CUENTA / MODALIDAD 🔄
                    </IonButton>

                    <IonButton
                      expand="block"
                      color="danger"
                      fill="outline"
                      onClick={() => {
                        setCancellationReason(""); // Reset reason
                        setCancellationPin(""); // Reset PIN input
                        setShowCancellationModal(true);
                      }}
                      style={{
                        height: "55px",
                        "--border-radius": "20px",
                        fontWeight: "800",
                        fontSize: "0.9rem",
                        marginTop: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <IonIcon icon={trashOutline} slot="start" />
                      CANCELAR CUENTA COMPLETA 🚫
                    </IonButton>
                  </>
                )}
              </div>

              {currentUser?.role !== "mesero" && (selectedTable?.comandas?.length || 0) > 0 && (
                <IonButton
                  expand="block"
                  color="success"
                  onClick={() => {
                    const existingItems =
                      selectedTable?.comandas.flatMap((c) => c.items) || [];
                    setCheckoutFallbackItems(existingItems);
                    setShowTipInput(false);
                    setShowDiscountInput(false);
                    setShowPaymentOptions(false);
                    setPaymentTipValue(0);
                    setPaymentDiscountValue(0);
                    setPaymentAmountReceived("");
                    setPaymentMethod("cash");
                    setRequiresInvoice(false);
                    setCheckoutReturnMode(appMode);
                    setAppMode("checkout");
                  }}
                  style={{
                    height: "75px",
                    "--border-radius": "24px",
                    fontWeight: "900",
                    fontSize: "1.3rem",
                    boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    slot="start"
                    style={{ fontSize: "1.8rem" }}
                  />
                  COBRAR CUENTA
                </IonButton>
              )}
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
};
