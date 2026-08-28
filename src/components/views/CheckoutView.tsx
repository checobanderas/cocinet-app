import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonLabel, IonPage, IonRow, IonSegment, IonSegmentButton, IonText, IonToolbar } from '@ionic/react';
import { addOutline, cardOutline, cashOutline, flashOutline, swapHorizontalOutline, trashOutline } from 'ionicons/icons';

interface CheckoutViewProps {
  cancellationReason: any;
  checkoutFallbackItems: any;
  currentUser: any;
  invoicePhone: any;
  selectedTenant: any;
  isProcessingPayment: any;
  paymentAmountReceived: any;
  paymentCardLastFour: any;
  paymentCardType: any;
  paymentDiscountTarget: any;
  paymentDiscountType: any;
  paymentDiscountValue: any;
  paymentMethod: any;
  paymentTipTarget: any;
  paymentTipValue: any;
  renderMaterialHeader: any;
  renderPrecuentaItem: any;
  requiresInvoice: any;
  selectedAccountForPayment: any;
  selectedTable: any;
  setAppMode: any;
  setInvoicePhone: any;
  setPasswordTarget: any;
  setPaymentAmountReceived: any;
  setPaymentCardLastFour: any;
  setPaymentCardType: any;
  setPaymentDiscountTarget: any;
  setPaymentDiscountType: any;
  setPaymentDiscountValue: any;
  setPaymentMethod: any;
  setPaymentTipValue: any;
  setPrecuentaComensal: any;
  setPrecuentaTab: any;
  setRequiresInvoice: any;
  setShowDiscountInput: any;
  setShowPasswordInput: any;
  setShowPaymentOptions: any;
  setShowTipInput: any;
  showDiscountInput: any;
  showPaymentOptions: any;
  showTipInput: any;
  finalizePayment: any;
  openNumpad: any;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cancellationReason,
  checkoutFallbackItems,
  currentUser,
  invoicePhone,
  selectedTenant,
  isProcessingPayment,
  paymentAmountReceived,
  paymentCardLastFour,
  paymentCardType,
  paymentDiscountTarget,
  paymentDiscountType,
  paymentDiscountValue,
  paymentMethod,
  paymentTipTarget,
  paymentTipValue,
  renderMaterialHeader,
  renderPrecuentaItem,
  requiresInvoice,
  selectedAccountForPayment,
  selectedTable,
  setAppMode,
  setInvoicePhone,
  setPasswordTarget,
  setPaymentAmountReceived,
  setPaymentCardLastFour,
  setPaymentCardType,
  setPaymentDiscountTarget,
  setPaymentDiscountType,
  setPaymentDiscountValue,
  setPaymentMethod,
  setPaymentTipValue,
  setPrecuentaComensal,
  setPrecuentaTab,
  setRequiresInvoice,
  setShowDiscountInput,
  setShowPasswordInput,
  setShowPaymentOptions,
  setShowTipInput,
  showDiscountInput,
  showPaymentOptions,
  showTipInput,
  finalizePayment, openNumpad
}) => {
if (currentUser?.role === "mesero") {
      return (
        <IonPage>
          <IonContent className="ion-padding text-center">
            <div style={{ marginTop: "80px", padding: "20px" }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🚫</div>
              <h2 className="text-xl font-bold text-red-600">Acceso Restringido</h2>
              <p className="text-slate-600 mt-2">Los meseros no tienen permisos para cobrar cuentas.</p>
              <IonButton className="mt-6" onClick={() => setAppMode("floorplan")} style={{ "--border-radius": "16px" }}>
                Volver a Mesas
              </IonButton>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    const tableItems = selectedTable?.comandas.flatMap((c) => c.items) || [];
    const allItems = tableItems.length > 0 ? tableItems : checkoutFallbackItems;
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

    const subtotal = allItems
      .filter((item) => !item.isCancelled)
      .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const discountAmount = Math.round(
      paymentDiscountType === "percent"
        ? subtotal * (paymentDiscountValue / 100)
        : paymentDiscountValue
    );
    const total = subtotal + paymentTipValue - discountAmount;
    const change =
      paymentMethod === "cash" ? Number(paymentAmountReceived) - total : 0;

    const applyTipPercent = (percent: number) => {
      setPaymentTipValue(Math.round(subtotal * (percent / 100)));
    };

    const handleDiscountClick = () => {
      setPasswordTarget("discount");
      setShowPasswordInput(true);
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: `Caja Mesa ${selectedTable?.label || "S/N"}`,
        subtitle: `Cobrando por: ${currentUser?.name || "Cajero"}`,
        showBack: true,
        onBack: () => {
          setAppMode("table-details");
          setPrecuentaComensal(1);
          setPrecuentaTab("resumen");
        }
      })}
        <IonContent style={{ "--background": "#f1f5f9" }}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="6">
                <IonCard
                  style={{
                    borderRadius: "24px",
                    margin: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                >
                  <IonCardContent className="ion-no-padding">
                    {/* Standardized Summary */}
                    <div
                      style={{
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          background: "#1e293b",
                          color: "white",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            margin: "0",
                          }}
                        >
                          Resumen de Consumo
                        </p>
                      </div>
                      <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {summarizedItems.map((item, idx) =>
                          renderPrecuentaItem(
                            { ...item, plate: 0 },
                            false,
                            undefined,
                            idx,
                          ),
                        )}
                        {cancelledItems.length > 0 && (
                          <>
                            <div
                              style={{
                                padding: "8px 16px",
                                background: "#fef2f2",
                                borderTop: "1px solid #fee2e2",
                                borderBottom: "1px solid #fee2e2",
                              }}
                            >
                              <IonText
                                color="danger"
                                style={{
                                  fontWeight: "800",
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                }}
                              >
                                <IonIcon
                                  icon={trashOutline}
                                  style={{
                                    marginRight: "6px",
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
                                idx + 100,
                              ),
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ion-padding">
                      {/* Totals Section */}
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <IonText color="medium">Subtotal</IonText>
                          <IonText style={{ fontWeight: "bold" }}>
                            ${subtotal.toFixed(2)}
                          </IonText>
                        </div>

                        {paymentTipValue > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <IonText color="success">Propina (+)</IonText>
                            <IonText
                              style={{ fontWeight: "bold", color: "#10b981" }}
                            >
                              ${paymentTipValue.toFixed(2)}
                            </IonText>
                          </div>
                        )}

                        {discountAmount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <IonText color="danger">Descuento (-)</IonText>
                            <IonText
                              style={{ fontWeight: "bold", color: "#ef4444" }}
                            >
                              -${discountAmount.toFixed(2)}
                            </IonText>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "2px dashed #e2e8f0",
                          }}
                        >
                          <IonText
                            style={{ fontWeight: "900", fontSize: "1.2rem" }}
                          >
                            TOTAL
                          </IonText>
                          <IonText
                            color="primary"
                            style={{ fontWeight: "900", fontSize: "1.8rem" }}
                          >
                            ${total.toFixed(2)}
                          </IonText>
                        </div>
                      </div>

                      {/* Action Buttons (Tip/Discount) */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        <IonButton
                          fill={showTipInput ? "solid" : "outline"}
                          size="small"
                          style={{ flex: 1, "--border-radius": "12px" }}
                          onClick={() => {
                            setShowTipInput(!showTipInput);
                            setShowDiscountInput(false);
                          }}
                        >
                          Propina
                        </IonButton>
                        <IonButton
                          fill={showDiscountInput ? "solid" : "outline"}
                          size="small"
                          style={{ flex: 1, "--border-radius": "12px" }}
                          onClick={() => {
                            setShowDiscountInput(!showDiscountInput);
                            setShowTipInput(false);
                          }}
                        >
                          Descuento
                        </IonButton>
                      </div>

                      {/* Tip Input Section */}
                      {showTipInput && (
                        <div
                          style={{
                            marginBottom: "16px",
                            padding: "16px",
                            background: "#f0fdf4",
                            borderRadius: "16px",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <IonText
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "0.85rem",
                                }}
                              >
                                Añadir Propina
                              </IonText>
                              <IonText
                                color="medium"
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                }}
                              >
                                Porcentaje o Monto:
                              </IonText>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {[10, 15, 20].map((p) => (
                                <IonButton
                                  key={p}
                                  size="small"
                                  fill="clear"
                                  color="success"
                                  onClick={() => applyTipPercent(p)}
                                  style={{ fontSize: "0.7rem", height: "24px" }}
                                >
                                  {p}%
                                </IonButton>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {/* Option 1: Adjust total final */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Ajustar Total (Cerrar en):</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input
                                  type="text"
                                  readOnly
                                  value={paymentTipTarget ? `$ ${paymentTipTarget}` : ""}
                                  onClick={() => {
                                    const activeSubtotal = selectedAccountForPayment
                                      ? selectedAccountForPayment.subtotal
                                      : subtotal;
                                    openNumpad(paymentTipTarget || "", activeSubtotal, "tip_target");
                                  }}
                                  placeholder="Total final"
                                  style={{
                                    width: "110px",
                                    border: "2px solid #10b981",
                                    borderRadius: "10px",
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    background: "white",
                                    cursor: "pointer",
                                  }}
                                />
                              </div>
                            </div>

                            <div style={{ textTransform: "uppercase", fontSize: "0.55rem", fontWeight: "900", color: "#cbd5e1", textAlign: "center" }}>
                              — o bien —
                            </div>

                            {/* Option 2: Direct value */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Monto de Propina:</span>
                              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <input
                                  type="text"
                                  readOnly
                                  value={paymentTipValue ? `$ ${paymentTipValue}` : ""}
                                  onClick={() => {
                                    const activeSubtotal = selectedAccountForPayment
                                      ? selectedAccountForPayment.subtotal
                                      : subtotal;
                                    openNumpad(paymentTipValue ? paymentTipValue.toString() : "", activeSubtotal, "tip_value");
                                  }}
                                  placeholder="Propina $"
                                  style={{
                                    width: "110px",
                                    border: "2px solid #86efac",
                                    borderRadius: "10px",
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    background: "white",
                                    cursor: "pointer",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Discount Input Section */}
                      {showDiscountInput && (
                        <div
                          style={{
                            marginBottom: "16px",
                            padding: "16px",
                            background: "#fef2f2",
                            borderRadius: "16px",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <IonText
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "0.85rem",
                                }}
                              >
                                Añadir Descuento
                              </IonText>
                              <IonText
                                color="medium"
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                }}
                              >
                                Porcentaje o Monto:
                              </IonText>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {[5, 10, 15, 20].map((p) => (
                                <IonButton
                                  key={p}
                                  size="small"
                                  fill="clear"
                                  color="danger"
                                  onClick={() => {
                                    setPaymentDiscountValue(p);
                                    setPaymentDiscountType("percent");
                                    setPaymentDiscountTarget("");
                                  }}
                                  style={{ fontSize: "0.7rem", height: "24px" }}
                                >
                                  {p}%
                                </IonButton>
                              ))}
                              <IonButton
                                size="small"
                                fill="clear"
                                color="primary"
                                onClick={handleDiscountClick}
                                style={{ fontSize: "0.7rem", height: "24px" }}
                              >
                                <IonIcon icon={addOutline} slot="start" />
                                Validar
                              </IonButton>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {/* Option 1: Adjust total final */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Ajustar Total Final:</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input
                                  type="text"
                                  readOnly
                                  value={paymentDiscountTarget ? `$ ${paymentDiscountTarget}` : ""}
                                  onClick={() => {
                                    const activeSubtotal = selectedAccountForPayment
                                      ? selectedAccountForPayment.subtotal
                                      : subtotal;
                                    openNumpad(paymentDiscountTarget || "", activeSubtotal, "discount_target");
                                  }}
                                  placeholder="Ej. 150"
                                  style={{
                                    width: "110px",
                                    border: "2px solid #ef4444",
                                    borderRadius: "10px",
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    background: "white",
                                    cursor: "pointer",
                                  }}
                                />
                              </div>
                            </div>

                            <div style={{ textTransform: "uppercase", fontSize: "0.6rem", fontWeight: "900", color: "#cbd5e1", textAlign: "center", margin: "2px 0" }}>
                              — o bien —
                            </div>

                            {/* Option 2: Direct value */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Descuento Directo:</span>
                              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <IonSegment
                                  value={paymentDiscountType}
                                  onIonChange={(e) =>
                                    setPaymentDiscountType(e.detail.value as any)
                                  }
                                  style={{ width: "70px", height: "32px" }}
                                >
                                  <IonSegmentButton value="percent" style={{ minHeight: "auto", fontSize: "0.7rem" }}>
                                    %
                                  </IonSegmentButton>
                                  <IonSegmentButton value="amount" style={{ minHeight: "auto", fontSize: "0.7rem" }}>
                                    $
                                  </IonSegmentButton>
                                </IonSegment>
                                <input
                                  type="text"
                                  readOnly
                                  value={
                                    paymentDiscountValue
                                      ? paymentDiscountType === "percent"
                                        ? `${paymentDiscountValue}%`
                                        : `$ ${paymentDiscountValue}`
                                      : ""
                                  }
                                  onClick={() => {
                                    const activeSubtotal = selectedAccountForPayment
                                      ? selectedAccountForPayment.subtotal
                                      : subtotal;
                                    openNumpad(
                                      paymentDiscountValue ? paymentDiscountValue.toString() : "",
                                      activeSubtotal,
                                      "discount_value",
                                    );
                                  }}
                                  placeholder={paymentDiscountType === "percent" ? "% Porcent" : "Monto $"}
                                  style={{
                                    width: "110px",
                                    border: "2px solid #fca5a5",
                                    borderRadius: "10px",
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    background: "white",
                                    cursor: "pointer",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main "Cobrar" Button */}
                      {!showPaymentOptions ? (
                        <IonButton
                          expand="block"
                          color="success"
                          onClick={() => setShowPaymentOptions(true)}
                          style={{
                            height: "60px",
                            "--border-radius": "16px",
                            fontWeight: "900",
                            fontSize: "1.2rem",
                          }}
                        >
                          COBRAR
                        </IonButton>
                      ) : (
                        <div style={{ animation: "fadeIn 0.3s ease" }}>
                          <IonText color="medium">
                            <p
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                textAlign: "center",
                                marginBottom: "12px",
                              }}
                            >
                              Seleccione Método de Pago
                            </p>
                          </IonText>
                          <IonSegment
                            value={paymentMethod}
                            onIonChange={(e) => {
                              const method = e.detail.value as any;
                              setPaymentMethod(method);
                              if (method === "cash") {
                                setPaymentAmountReceived(total.toFixed(2));
                              } else {
                                setPaymentAmountReceived("");
                              }
                              if (method === "transfer") {
                                openNumpad(paymentCardLastFour || "", 0, "card_digits");
                              }
                            }}
                            style={{ marginBottom: "16px" }}
                          >
                            {selectedTenant?.allowEfectivo !== false && (
                              <IonSegmentButton value="cash">
                                <IonIcon icon={cashOutline} />
                                <IonLabel style={{ fontSize: "11px" }}>Efectivo</IonLabel>
                              </IonSegmentButton>
                            )}
                            {selectedTenant?.allowLupay !== false && (
                              <IonSegmentButton value="lupay">
                                <IonIcon icon={flashOutline} />
                                <IonLabel style={{ fontSize: "11px" }}>Lúpay</IonLabel>
                              </IonSegmentButton>
                            )}
                            {selectedTenant?.allowTarjeta !== false && (
                              <IonSegmentButton value="card">
                                <IonIcon icon={cardOutline} />
                                <IonLabel style={{ fontSize: "11px" }}>Tarjeta</IonLabel>
                              </IonSegmentButton>
                            )}
                            {selectedTenant?.allowTransferencia !== false && (
                              <IonSegmentButton value="transfer">
                                <IonIcon icon={swapHorizontalOutline} />
                                <IonLabel style={{ fontSize: "11px" }}>Transf.</IonLabel>
                              </IonSegmentButton>
                            )}
                          </IonSegment>

                          {/* Debit / Credit card subtype selection */}
                          {false && paymentMethod === "card" && requiresInvoice && (
                            <div
                              id="card-type-selection-container"
                              className={`mb-4 border rounded-2xl p-3 flex flex-col gap-2 transition-all ${
                                !paymentCardType
                                  ? "bg-red-50/90 border-red-400 ring-2 ring-red-300 shadow-md"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <span className={`text-[11px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 ${
                                !paymentCardType ? "text-red-700 font-black animate-pulse" : "text-slate-500"
                              }`}>
                                {!paymentCardType && "⚠️ "}¿La tarjeta es Crédito o Débito? {!paymentCardType && "(REQUERIDO)"}
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentCardType("debito");
                                    openNumpad(paymentCardLastFour || "", 0, "card_digits");
                                  }}
                                  className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                                    paymentCardType === "debito"
                                      ? "bg-emerald-600 text-white shadow-md border-2 border-emerald-700 font-black scale-[1.02]"
                                      : "bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-300"
                                  }`}
                                >
                                  Débito 💳
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentCardType("credito");
                                    openNumpad(paymentCardLastFour || "", 0, "card_digits");
                                  }}
                                  className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                                    paymentCardType === "credito"
                                      ? "bg-emerald-600 text-white shadow-md border-2 border-emerald-700 font-black scale-[1.02]"
                                      : "bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-300"
                                  }`}
                                >
                                  Crédito 💳
                                </button>
                              </div>
                              {!paymentCardType && (
                                <p className="text-[11px] font-black text-red-600 text-center mt-0.5">
                                  👉 Selecciona Débito o Crédito para habilitar "FINALIZAR PAGO".
                                </p>
                              )}
                            </div>
                          )}

                          {/* Card/Transfer last 4 digits input */}
                          {(paymentMethod === "card" || paymentMethod === "transfer") && (
                            <div
                              style={{
                                marginBottom: "16px",
                                padding: "16px",
                                background: "#f8fafc",
                                borderRadius: "16px",
                                border: "2px solid #cbd5e1",
                                animation: "fadeIn 0.2s ease",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "12px",
                                  width: "100%",
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <IonText
                                    style={{
                                      fontWeight: "bold",
                                      display: "block",
                                      marginBottom: "4px",
                                      fontSize: "0.85rem",
                                      color: "#64748b",
                                    }}
                                  >
                                    Últimos 4 Dígitos {paymentMethod === "card" ? "💳" : "📲"}
                                    {selectedTenant?.requireCardDigits === false && " (Opcional)"}
                                  </IonText>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    value={paymentCardLastFour}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      setPaymentCardLastFour(val.slice(0, 4));
                                    }}
                                    onClick={() => {
                                      openNumpad(
                                        paymentCardLastFour,
                                        0,
                                        "card_digits"
                                      );
                                    }}
                                    placeholder="••••"
                                    style={{
                                      width: "100%",
                                      border: "none",
                                      background: "transparent",
                                      textAlign: "left",
                                      fontWeight: "900",
                                      fontSize: "1.8rem",
                                      color: "#0f172a",
                                      outline: "none",
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openNumpad(
                                      paymentCardLastFour,
                                      0,
                                      "card_digits"
                                    );
                                  }}
                                  style={{
                                    background: "#e2e8f0",
                                    border: "1px solid #cbd5e1",
                                    padding: "10px",
                                    borderRadius: "14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                                    fontSize: "1.4rem",
                                    transition: "transform 0.1s ease",
                                  }}
                                  title="Teclado Numérico"
                                >
                                  🔢
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Cash Input */}
                          {paymentMethod === "cash" && (
                            <div
                              style={{
                                marginBottom: "16px",
                                padding: "16px",
                                background: "#f1f5f9",
                                borderRadius: "16px",
                                border: "2px solid #cbd5e1",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "12px",
                                  width: "100%",
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <IonText
                                    style={{
                                      fontWeight: "bold",
                                      display: "block",
                                      marginBottom: "4px",
                                      fontSize: "0.85rem",
                                      color: "#64748b",
                                    }}
                                  >
                                    Efectivo Recibido 💵
                                  </IonText>
                                  <input
                                    type="text"
                                    inputMode="none"
                                    readOnly={true}
                                    value={paymentAmountReceived}
                                    onClick={() => {
                                      openNumpad(
                                        paymentAmountReceived || total.toFixed(2),
                                        total,
                                        "checkout"
                                      );
                                    }}
                                    onChange={(e) =>
                                      setPaymentAmountReceived(e.target.value)
                                    }
                                    placeholder="0.00"
                                    autoFocus
                                    style={{
                                      width: "100%",
                                      border: "none",
                                      background: "transparent",
                                      textAlign: "left",
                                      fontWeight: "900",
                                      fontSize: "1.8rem",
                                      color: "#0f172a",
                                      outline: "none",
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openNumpad(
                                      paymentAmountReceived || total.toFixed(2),
                                      total,
                                      "checkout"
                                    );
                                  }}
                                  style={{
                                    background: "#e2e8f0",
                                    border: "1px solid #cbd5e1",
                                    padding: "10px",
                                    borderRadius: "14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                                    fontSize: "1.4rem",
                                    transition: "transform 0.1s ease",
                                  }}
                                  title="Teclado Numérico"
                                >
                                  🔢
                                </button>
                              </div>

                              {/* Sugerencias de billetes (Suma consecutiva) */}
                              <div
                                style={{
                                  marginTop: "12px",
                                  borderTop: "1px dashed #cbd5e1",
                                  paddingTop: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#64748b",
                                    fontWeight: "bold",
                                    display: "block",
                                    marginBottom: "8px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Suma Rápida de Billetes 💵 (Toca para sumar
                                  acumulado)
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    overflowX: "auto",
                                    paddingBottom: "6px",
                                    scrollbarWidth: "none",
                                  }}
                                  className="no-scrollbar"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPaymentAmountReceived(total.toFixed(2))
                                    }
                                    style={{
                                      background: "#3b82f6",
                                      color: "white",
                                      border: "none",
                                      padding: "6px 12px",
                                      borderRadius: "10px",
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                      whiteSpace: "nowrap",
                                      cursor: "pointer",
                                    }}
                                  >
                                    🎯 Exacto
                                  </button>
                                  {[20, 50, 100, 200, 500, 1000].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => {
                                        const cur =
                                          parseFloat(paymentAmountReceived) ||
                                          0;
                                        setPaymentAmountReceived(
                                          (cur + val).toString(),
                                        );
                                      }}
                                      style={{
                                        background: "white",
                                        color: "#0f172a",
                                        border: "1px solid #cbd5e1",
                                        padding: "6px 10px",
                                        borderRadius: "10px",
                                        fontSize: "0.75rem",
                                        fontWeight: "800",
                                        whiteSpace: "nowrap",
                                        cursor: "pointer",
                                      }}
                                    >
                                      💵 +${val}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setPaymentAmountReceived("")}
                                    style={{
                                      background: "#fee2e2",
                                      color: "#ef4444",
                                      border: "1px solid #fca5a5",
                                      padding: "6px 12px",
                                      borderRadius: "10px",
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                      whiteSpace: "nowrap",
                                      cursor: "pointer",
                                    }}
                                  >
                                    🚫 Borrar
                                  </button>
                                </div>
                              </div>

                              {Number(paymentAmountReceived) > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: "12px",
                                    paddingTop: "12px",
                                    borderTop: "1px solid #cbd5e1",
                                  }}
                                >
                                  <IonText color="medium">Cambio:</IonText>
                                  <IonText
                                    color={change >= 0 ? "success" : "danger"}
                                    style={{
                                      fontWeight: "900",
                                      fontSize: "1.4rem",
                                    }}
                                  >
                                    ${change.toFixed(2)}
                                  </IonText>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Requiere factura checkbox/toggle option in active table checkout panel */}
                          <div className="mt-4 mb-4 flex flex-col gap-2">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (requiresInvoice) {
                                  setRequiresInvoice(false);
                                  setInvoicePhone("");
                                } else {
                                  setRequiresInvoice(true);
                                }
                              }}
                              className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all shadow-xs active:scale-[0.99] ${
                                requiresInvoice
                                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">🧾</span>
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold text-slate-800">Requiere Factura</span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    ¿El cliente solicita factura de esta venta?
                                  </span>
                                </div>
                              </div>

                              {/* Switch interactivo */}
                              <div
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                                  requiresInvoice ? "bg-emerald-600" : "bg-slate-300"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                    requiresInvoice ? "translate-x-6" : "translate-x-0"
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Campo de teléfono integrado en línea */}
                            {requiresInvoice && (
                              <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl flex flex-col gap-2 shadow-xs">
                                <label className="text-xs font-black text-amber-950 flex items-center justify-between">
                                  <span>📱 Teléfono Celular (10 dígitos)</span>
                                  <span className="font-mono text-[10px] text-amber-800 font-bold">
                                    {invoicePhone.length}/10
                                  </span>
                                </label>
                                <div className="relative flex items-center">
                                  <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="Ej. 6621234567"
                                    value={invoicePhone}
                                    onChange={(e) => {
                                      const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                                      setInvoicePhone(clean);
                                    }}
                                    className="w-full bg-white border-2 border-amber-400 rounded-xl px-4 py-2.5 text-slate-900 font-mono font-black text-lg tracking-widest focus:outline-none focus:border-amber-600 transition shadow-inner"
                                    autoFocus
                                  />
                                </div>
                                {invoicePhone.length > 0 && invoicePhone.length < 10 && (
                                  <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                                    ⏳ Ingrese los 10 dígitos (faltan {10 - invoicePhone.length})
                                  </p>
                                )}
                                {invoicePhone.length === 10 && (
                                  <p className="text-[11px] font-black text-emerald-700 flex items-center gap-1 bg-emerald-100/80 p-1.5 rounded-lg border border-emerald-300">
                                    ✅ Teléfono registrado: {invoicePhone}
                                  </p>
                                 )}
                               </div>
                             )}
                           </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <IonButton
                              fill="outline"
                              color="medium"
                              onClick={() => setShowPaymentOptions(false)}
                              style={{
                                flex: 1,
                                height: "55px",
                                "--border-radius": "16px",
                              }}
                            >
                              Atrás
                            </IonButton>
                            <IonButton
                              expand="block"
                              color="primary"
                              onClick={() => finalizePayment(true)}
                              disabled={
                                isProcessingPayment ||
                                (paymentMethod === "cash" &&
                                  (Number(paymentAmountReceived) < total ||
                                    !paymentAmountReceived)) ||
                                (paymentMethod === "card" &&
                                  (selectedTenant?.requireCardDigits !== false && (!paymentCardLastFour || paymentCardLastFour.length < 4))) ||
                                (paymentMethod === "transfer" &&
                                  (selectedTenant?.requireCardDigits !== false && (!paymentCardLastFour || paymentCardLastFour.length < 4)))
                              }
                              style={{
                                flex: 2,
                                height: "55px",
                                "--border-radius": "16px",
                                fontWeight: "900",
                              }}
                            >
                              FINALIZAR PAGO
                            </IonButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar className="ion-padding-horizontal ion-padding-bottom">
            <IonButton
              expand="block"
              color="medium"
              fill="clear"
              onClick={() => {
                setAppMode("table-details");
                setPrecuentaComensal(1);
                setPrecuentaTab("resumen");
              }}
            >
              Cancelar y volver
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
};
