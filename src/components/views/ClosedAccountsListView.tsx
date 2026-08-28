import { updateInvoiceRequirementInFirebase } from '../../utils/firestore';
import { formatTableName } from '../../utils/formatters';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonBadge, IonButton, IonIcon } from '@ionic/react';
import { closeCircleOutline, printOutline, refreshOutline, shieldCheckmarkOutline } from 'ionicons/icons';

interface ClosedAccountsListViewProps {
  cancellationReason: any;
  editingInvoiceAccountId: any;
  editingInvoicePhoneValue: any;
  expandedAccountIds: any;
  handleQuickChangeAccountStatus: any;
  handleRevertAccountCancellation: any;
  handleSendWhatsAppInvoice: any;
  invoicePhone: any;
  paymentMethod: any;
  paymentMethodFilter: any;
  requiresInvoice: any;
  setAccountCancellationPin: any;
  setAccountCancellationReason: any;
  setAccountToEditPayment: any;
  setEditingInvoiceAccountId: any;
  setEditingInvoicePhoneValue: any;
  setExpandedAccountIds: any;
  setExportingAccount: any;
  setHistory: any;
  setIsEditPaymentModalOpen: any;
  setPaymentMethodFilter: any;
  setPendingCancellationTarget: any;
  setSelectedAccountForCancellation: any;
  setSelectedDeliveryAccount: any;
  setShowAccountCancellationModal: any;
  setShowAuthorizeCancellationModal: any;
  setTempCardLastFour: any;
  setTempPaymentCardType: any;
  setTempPaymentMethod: any;
  triggerAppNotification: any;
  cancelled: any;
  historyForCuentasTab: any;
  markAsPaid: any;
  reprintAccount: any;
}

export const ClosedAccountsListView: React.FC<ClosedAccountsListViewProps> = ({
  cancellationReason,
  editingInvoiceAccountId,
  editingInvoicePhoneValue,
  expandedAccountIds,
  handleQuickChangeAccountStatus,
  handleRevertAccountCancellation,
  handleSendWhatsAppInvoice,
  invoicePhone,
  paymentMethod,
  paymentMethodFilter,
  requiresInvoice,
  setAccountCancellationPin,
  setAccountCancellationReason,
  setAccountToEditPayment,
  setEditingInvoiceAccountId,
  setEditingInvoicePhoneValue,
  setExpandedAccountIds,
  setExportingAccount,
  setHistory,
  setIsEditPaymentModalOpen,
  setPaymentMethodFilter,
  setPendingCancellationTarget,
  setSelectedAccountForCancellation,
  setSelectedDeliveryAccount,
  setShowAccountCancellationModal,
  setShowAuthorizeCancellationModal,
  setTempCardLastFour,
  setTempPaymentCardType,
  setTempPaymentMethod,
  triggerAppNotification,
  cancelled, historyForCuentasTab, markAsPaid, reprintAccount
}) => {
  const [showSummaryPanel, setShowSummaryPanel] = React.useState(false);

return (
      <>
        <div className="custom-scrollbar" style={{ animation: "fadeIn 0.3s ease-out", height: "100%", overflowY: "auto", paddingRight: "8px", paddingBottom: "24px" }}>
            {/* TITLE AND TOGGLE FOR SUMMARY CARDS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showSummaryPanel ? "12px" : "16px", paddingLeft: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ 
                  background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)", 
                  WebkitBackgroundClip: "text", 
                  WebkitTextFillColor: "transparent",
                  fontSize: "1.4rem",
                  fontWeight: "900",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textShadow: "0px 2px 10px rgba(0,0,0,0.2)"
                }}>
                  <i className="fa-solid fa-file-invoice-dollar" style={{ WebkitTextFillColor: "#8b5cf6" }}></i>
                  HISTORIAL DE CUENTAS
                </div>
              </div>
              <button
                onClick={() => setShowSummaryPanel(!showSummaryPanel)}
                style={{
                  background: "transparent",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {showSummaryPanel ? "Ocultar Tipos de Pago ▲" : "Mostrar Tipos de Pago ▼"}
              </button>
            </div>

            {/* Sales Summary Cards */}
            {showSummaryPanel && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
              <div
                onClick={() =>
                  setPaymentMethodFilter((prev) =>
                    prev === "cash" ? "all" : "cash",
                  )
                }
                style={{
                  background:
                    paymentMethodFilter === "cash" ? "#f0fdf4" : "white",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "cash"
                      ? "0 8px 16px -4px rgba(16, 185, 129, 0.35)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderTop:
                    paymentMethodFilter === "cash"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  borderRight:
                    paymentMethodFilter === "cash"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  borderBottom:
                    paymentMethodFilter === "cash"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  borderLeft:
                    paymentMethodFilter === "cash"
                      ? "4px solid #10b981"
                      : "4px solid #10b981",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "cash" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "cash" ? "#15803d" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Efectivo <span style={{ fontSize: "2.3rem" }}>💵</span>{" "}
                  {paymentMethodFilter === "cash" && "🎯"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "cash" ? "#166534" : "#1e293b",
                  }}
                >
                  $
                  {historyForCuentasTab
                    .filter(
                      (a) =>
                        a.status !== "cancelled" && a.paymentMethod === "cash",
                    )
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                onClick={() =>
                  setPaymentMethodFilter((prev) =>
                    prev === "bank" ? "all" : "bank",
                  )
                }
                style={{
                  background:
                    paymentMethodFilter === "bank" ? "#eff6ff" : "white",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "bank"
                      ? "0 8px 16px -4px rgba(59, 130, 246, 0.35)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderTop:
                    paymentMethodFilter === "bank"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  borderRight:
                    paymentMethodFilter === "bank"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  borderBottom:
                    paymentMethodFilter === "bank"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  borderLeft:
                    paymentMethodFilter === "bank"
                      ? "4px solid #3b82f6"
                      : "4px solid #3b82f6",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "bank" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "bank" ? "#1d4ed8" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Bancos / Tarjeta{" "}
                  <span style={{ fontSize: "2.3rem" }}>🏦💳</span>{" "}
                  {paymentMethodFilter === "bank" && "🎯"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "bank" ? "#1e40af" : "#1e293b",
                  }}
                >
                  $
                  {historyForCuentasTab
                    .filter(
                      (a) =>
                        a.status !== "cancelled" &&
                        (a.paymentMethod === "card" ||
                          a.paymentMethod === "transfer"),
                    )
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                onClick={() =>
                  setPaymentMethodFilter((prev) =>
                    prev === "lupay" ? "all" : "lupay",
                  )
                }
                style={{
                  background:
                    paymentMethodFilter === "lupay" ? "#faf5ff" : "white",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "lupay"
                      ? "0 8px 16px -4px rgba(168, 85, 247, 0.35)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderTop:
                    paymentMethodFilter === "lupay"
                      ? "2px solid #a855f7"
                      : "2px solid transparent",
                  borderRight:
                    paymentMethodFilter === "lupay"
                      ? "2px solid #a855f7"
                      : "2px solid transparent",
                  borderBottom:
                    paymentMethodFilter === "lupay"
                      ? "2px solid #a855f7"
                      : "2px solid transparent",
                  borderLeft:
                    paymentMethodFilter === "lupay"
                      ? "4px solid #a855f7"
                      : "4px solid #a855f7",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "lupay" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "lupay" ? "#7e22ce" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Lúpay <span style={{ fontSize: "2.3rem" }}>⚡</span>{" "}
                  {paymentMethodFilter === "lupay" && "🎯"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "lupay" ? "#6b21a8" : "#1e293b",
                  }}
                >
                  $
                  {historyForCuentasTab
                    .filter((a) => a.status !== "cancelled" && a.paymentMethod === "lupay")
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                onClick={() => setPaymentMethodFilter("all")}
                style={{
                  background:
                    paymentMethodFilter === "all" ? "#0f172a" : "#1e293b",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "all"
                      ? "0 8px 16px -4px rgba(15, 23, 42, 0.5)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  border:
                    paymentMethodFilter === "all"
                      ? "2px solid #64748b"
                      : "2px solid transparent",
                  color: "white",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "all" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "all"
                        ? "#e2e8f0"
                        : "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Total Venta <span style={{ fontSize: "1.3rem" }}>📊🎯</span>{" "}
                  {paymentMethodFilter === "all" && "🎯"}
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                  $
                  {historyForCuentasTab
                    .filter((a) => a.status !== "cancelled")
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
            )}

            {/* Filter Notice Banner if active */}
            {paymentMethodFilter !== "all" && (
              <div
                style={{
                  background:
                    paymentMethodFilter === "cash"
                      ? "#ecfdf5"
                      : paymentMethodFilter === "bank"
                        ? "#eff6ff"
                        : "#faf5ff",
                  border:
                    paymentMethodFilter === "cash"
                      ? "1px solid #a7f3d0"
                      : paymentMethodFilter === "bank"
                        ? "1px solid #bfdbfe"
                        : "1px solid #e9d5ff",
                  color:
                    paymentMethodFilter === "cash"
                      ? "#065f46"
                      : paymentMethodFilter === "bank"
                        ? "#1e40af"
                        : "#6b21a8",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <span>
                  🔍 Mostrando únicamente pagos en:{" "}
                  <strong>
                    {paymentMethodFilter === "cash"
                      ? "Efectivo 💵"
                      : paymentMethodFilter === "bank"
                        ? "Bancos / Tarjeta 🏦💳"
                        : "Lúpay ⚡"}
                  </strong>
                </span>
                <button
                  onClick={() => setPaymentMethodFilter("all")}
                  style={{
                    background: "rgba(0,0,0,0.06)",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "inherit",
                  }}
                >
                  Ver Todos (Quitar Filtro)
                </button>
              </div>
            )}

            <div
              style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                width: "100%",
              }}
            >
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        textAlign: "left",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      <th style={{ padding: "12px 16px" }}>MESA</th>
                      <th style={{ padding: "12px 16px" }}>MONTO</th>
                      <th style={{ padding: "12px 16px" }}>HORA</th>
                      <th style={{ padding: "12px 16px" }}>MEDIO</th>
                      <th style={{ padding: "12px 16px" }}>ESTATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredHistory = historyForCuentasTab.filter((account) => {
                        if (paymentMethodFilter === "all") return true;
                        if (paymentMethodFilter === "cash") {
                          return (
                            account.status !== "cancelled" &&
                            account.paymentMethod === "cash"
                          );
                        }
                        if (paymentMethodFilter === "bank") {
                          return (
                            account.status !== "cancelled" &&
                            (account.paymentMethod === "card" ||
                              account.paymentMethod === "transfer")
                          );
                        }
                        if (paymentMethodFilter === "lupay") {
                          return (
                            account.status !== "cancelled" &&
                            account.paymentMethod === "lupay"
                          );
                        }
                        return true;
                      });

                      if (filteredHistory.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "24px",
                                textAlign: "center",
                                color: "#64748b",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                              }}
                            >
                              ⚠️ No hay registros cerrados con el método de pago
                              seleccionado
                            </td>
                          </tr>
                        );
                      }

                      return filteredHistory.map((account) => {
                        const hasCancelledItems = (account.comandas || []).some(
                          (c) => (c.items || []).some((i) => i.isCancelled),
                        );
                        let rowBg = "transparent";
                        let rowBorder = "1px solid #f1f5f9";
                        if (account.status === "cancelled") {
                          rowBg = "#fff1f2";
                          rowBorder = "1px solid #fecaca";
                        }
                        const isExpanded = expandedAccountIds.includes(
                          account.id,
                        );
                        return (
                          <React.Fragment key={account.id}>
                            <tr
                              style={{
                                background: rowBg,
                                borderBottom: isExpanded ? "none" : rowBorder,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onClick={() => {
                                setExpandedAccountIds((prev) =>
                                  prev.includes(account.id)
                                    ? prev.filter((id) => id !== account.id)
                                    : [...prev, account.id],
                                );
                              }}
                              className="hover:bg-slate-50"
                            >
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontWeight: "bold",
                                  color: "#1e293b",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span>{formatTableName(account.zone || '', account.tableLabel)}</span>
                                  {account.zone === "Servicio a Domicilio" && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDeliveryAccount(account);
                                      }}
                                      style={{
                                        border: "none",
                                        background: "#eff6ff",
                                        color: "#1d4ed8",
                                        borderRadius: "8px",
                                        padding: "4px 8px",
                                        fontSize: "0.75rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow: "0 2px 4px rgba(29, 78, 216, 0.1)",
                                        cursor: "pointer",
                                        outline: "none"
                                      }}
                                      title="Ver datos de entrega a domicilio"
                                      className="hover:bg-blue-100 active:scale-95 transition-all"
                                    >
                                      🛵👤 {account.paymentMethod === "cash" ? "💵" : account.paymentMethod === "card" ? "💳" : account.paymentMethod === "lupay" ? "⚡" : "🏦"}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontWeight: "bold",
                                  color: "#3b82f6",
                                }}
                              >
                                ${account.total.toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: "0.85rem",
                                  color: "#64748b",
                                }}
                              >
                                {account.timestamp instanceof Date &&
                                !isNaN(account.timestamp.getTime())
                                  ? account.timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "---"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "center",
                                }}
                              >
                                <div className="inline-flex items-center gap-1.5 justify-center" style={{ fontSize: "1.3rem" }}>
                                  <span
                                    title={
                                      (account.paymentMethod === "cash"
                                        ? "Efectivo"
                                        : account.paymentMethod === "card"
                                          ? "Tarjeta"
                                          : account.paymentMethod === "lupay"
                                            ? "Lúpay"
                                            : "Transferencia") +
                                      (account.requiresInvoice ? ` - Requiere Factura (${account.invoicePhone || "Sin tel."})` : "")
                                    }
                                  >
                                    {account.paymentMethod === "cash"
                                      ? "💵"
                                      : account.paymentMethod === "card"
                                        ? "💳"
                                        : account.paymentMethod === "lupay"
                                          ? "⚡"
                                          : "🏦"}
                                  </span>
                                  {account.requiresInvoice && (
                                    <span className="inline-flex items-center gap-1 ml-1">
                                      <span title="Requiere Factura">🧾</span>
                                      {account.invoicePhone ? (
                                        <button
                                          type="button"
                                          onClick={(e) => handleSendWhatsAppInvoice(account, e)}
                                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1 rounded-full text-xs shadow-md transition cursor-pointer active:scale-95 border border-emerald-500"
                                          title="💬 Enviar WhatsApp solicitando Constancia Fiscal y enviar ticket"
                                        >
                                          <span>💬</span>
                                          <span className="underline">({account.invoicePhone})</span>
                                        </button>
                                      ) : (
                                        <span className="text-stone-400 text-xs font-bold ml-0.5">(Sin tel)</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {account.status === "cancelled" ? (
                                  <IonBadge color="danger">Cancelada ❌</IonBadge>
                                ) : (
                                  <select
                                    value={
                                      account.zone === "Servicio a Domicilio" || account.deliveryStatus
                                        ? (account.deliveryStatus || (account.isPaid ? "entregado" : "en_camino"))
                                        : (account.isPaid ? "pagado" : "en_camino")
                                    }
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const val = e.target.value as "en_camino" | "entregado" | "pagado" | "no_entregado";
                                      handleQuickChangeAccountStatus(account, val);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-xs font-black px-3 py-1.5 rounded-xl border cursor-pointer shadow-sm outline-none transition-all ${
                                      account.deliveryStatus === "entregado" || (account.isPaid && account.deliveryStatus !== "en_camino" && account.deliveryStatus !== "no_entregado")
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                                        : account.deliveryStatus === "no_entregado"
                                        ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                                        : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 animate-pulse"
                                    }`}
                                  >
                                    <option value="en_camino">🛵 En Camino</option>
                                    <option value="entregado">✅ Entregado</option>
                                    <option value="pagado">💵 Pagado</option>
                                    <option value="no_entregado">⚠️ No Entregado</option>
                                  </select>
                                )}
                              </td>
                          </tr>
                          {isExpanded && (
                            <tr
                              style={{
                                background:
                                  account.status === "cancelled"
                                    ? "#fff1f2"
                                    : "#f8fafc",
                                borderBottom: rowBorder,
                              }}
                            >
                              <td
                                colSpan={5}
                                style={{ padding: "0 16px 16px 16px" }}
                              >
                                <div
                                  style={{
                                    background: "white",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow:
                                      "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
                                  }}
                                >
                                  <div
                                    style={{
                                      marginBottom: "16px",
                                      borderBottom: "1px solid #e2e8f0",
                                      paddingBottom: "12px",
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: "0 0 12px 0",
                                        fontSize: "0.9rem",
                                        color: "#64748b",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Productos Vendidos
                                    </h4>
                                    {account.comandas
                                      .flatMap((c: any) => c.items)
                                      .map((item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "0.9rem",
                                            marginBottom: "6px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              textDecoration: item.isCancelled
                                                ? "line-through"
                                                : "none",
                                              color: item.isCancelled
                                                ? "#ef4444"
                                                : "#334155",
                                            }}
                                          >
                                            {item.quantity}x{" "}
                                            {item.product?.name || "Prod"}
                                          </span>
                                          <span
                                            style={{
                                              textDecoration: item.isCancelled
                                                ? "line-through"
                                                : "none",
                                              color: item.isCancelled
                                                ? "#ef4444"
                                                : "#334155",
                                              fontWeight: "500",
                                            }}
                                          >
                                            $
                                            {(
                                              item.quantity *
                                              (item.product?.price || 0)
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: "8px",
                                      fontSize: "0.9rem",
                                      color: "#64748b",
                                    }}
                                  >
                                    <span>Subtotal:</span>
                                    <span>${account.subtotal.toFixed(2)}</span>
                                  </div>
                                  {account.discount > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                        fontSize: "0.9rem",
                                        color: "#ef4444",
                                      }}
                                    >
                                      <span>
                                        Descuento ({account.discountReason}):
                                      </span>
                                      <span>
                                        -${account.discount.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {account.tip > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                        fontSize: "0.9rem",
                                        color: "#10b981",
                                      }}
                                    >
                                      <span>Propina:</span>
                                      <span>${account.tip.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontWeight: "bold",
                                      fontSize: "1.1rem",
                                      borderTop: "1px solid #e2e8f0",
                                      paddingTop: "8px",
                                      marginBottom: "16px",
                                      color: "#1e293b",
                                    }}
                                  >
                                    <span>Total:</span>
                                    <span>${account.total.toFixed(2)}</span>
                                  </div>

                                  {account.status === "cancelled" && (
                                    <div
                                      className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4 text-xs font-semibold text-red-800"
                                      style={{ margin: "12px 0 16px 0", cursor: "default", width: "100%" }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="font-extrabold text-sm mb-1 text-red-900 flex items-center gap-1">
                                        🚫 CUENTA CANCELADA
                                      </div>
                                      <div>
                                        <strong>Autorizado por:</strong> {account.cancelledBy?.name || "Administrador registrado"} ({account.cancelledBy?.role || "admin"})
                                      </div>
                                      <div className="mt-1">
                                        <strong>Motivo de Cancelación:</strong> "{account.cancellationReason || "Prueba de cambios en el sistema"}"
                                      </div>
                                    </div>
                                  )}

                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "12px",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    {account.status !== "cancelled" && !account.isPendingCancellation && (
                                      <IonButton
                                        size="small"
                                        color="danger"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedAccountForCancellation(account);
                                          setAccountCancellationReason("");
                                          setAccountCancellationPin("");
                                          setShowAccountCancellationModal(true);
                                        }}
                                      >
                                        <IonIcon icon={closeCircleOutline} slot="start" />
                                        Cancelar Cuenta 🚫
                                      </IonButton>
                                    )}
                                    {account.status !== "cancelled" && (
                                       <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleQuickChangeAccountStatus(account, "en_camino");
                                           }}
                                           className={`px-2 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                                             (account.deliveryStatus === "en_camino" || (!account.deliveryStatus && !account.isPaid))
                                               ? "bg-amber-500 text-white shadow-sm"
                                               : "bg-white text-slate-700 hover:bg-amber-50"
                                           }`}
                                         >
                                           🛵 En Camino
                                         </button>
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleQuickChangeAccountStatus(account, "entregado");
                                           }}
                                           className={`px-2 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                                             (account.deliveryStatus === "entregado" || (account.isPaid && account.deliveryStatus !== "en_camino"))
                                               ? "bg-emerald-600 text-white shadow-sm"
                                               : "bg-white text-slate-700 hover:bg-emerald-50"
                                           }`}
                                         >
                                           ✅ Entregado / Pagado
                                         </button>
                                       </div>
                                     )}
                                    {account.isPendingCancellation && (
                                      <div className="flex items-center gap-2">
                                        <IonBadge color="warning" className="font-black px-3 py-1.5 rounded-xl">EN ESPERA ⏳</IonBadge>
                                        <IonButton
                                          size="small"
                                          color="danger"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingCancellationTarget({ type: 'account', id: account.id });
                                            setShowAuthorizeCancellationModal(true);
                                          }}
                                        >
                                          <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                                          Autorizar
                                        </IonButton>
                                        <IonButton
                                          size="small"
                                          color="medium"
                                          fill="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRevertAccountCancellation(account.id);
                                          }}
                                        >
                                          <IonIcon icon={refreshOutline} slot="start" />
                                          Revertir
                                        </IonButton>
                                      </div>
                                    )}
                                    {account.status !== "cancelled" &&
                                      !account.isPaid && (
                                        <IonButton
                                          size="small"
                                          color="warning"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsPaid(account.id);
                                          }}
                                        >
                                          Marcar Pagado
                                        </IonButton>
                                      )}
                                    {account.status !== "cancelled" && (
                                       editingInvoiceAccountId === account.id ? (
                                         <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-xl border-2 border-amber-300 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                           <span className="text-xs font-black text-amber-950">📱 Celular:</span>
                                           <input
                                             type="tel"
                                             inputMode="numeric"
                                             maxLength={10}
                                             placeholder="Ej. 6621234567"
                                             value={editingInvoicePhoneValue}
                                             onChange={(e) => setEditingInvoicePhoneValue(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                             className="bg-white border-2 border-amber-400 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-slate-900 w-36 outline-none focus:border-amber-600"
                                             autoFocus
                                           />
                                           <button
                                             type="button"
                                             onClick={async (e) => {
                                               e.stopPropagation();
                                               if (editingInvoicePhoneValue.length !== 10) {
                                                 alert("El número celular debe tener exactamente 10 dígitos.");
                                                 return;
                                               }
                                               try {
                                                 await updateInvoiceRequirementInFirebase(account.id, true, editingInvoicePhoneValue);
                                                 setHistory((prev) =>
                                                   prev.map((acc) =>
                                                     acc.id === account.id
                                                       ? { ...acc, requiresInvoice: true, invoicePhone: editingInvoicePhoneValue }
                                                       : acc
                                                   )
                                                 );
                                                 triggerAppNotification(
                                                   "🧾 FACTURACIÓN ACTUALIZADA",
                                                   `Cuenta ${account.tableLabel} marcada como: Requiere Factura (Cel: ${editingInvoicePhoneValue})`
                                                 );
                                                 setEditingInvoiceAccountId(null);
                                                 setEditingInvoicePhoneValue("");
                                               } catch (err) {
                                                 console.error(err);
                                               }
                                             }}
                                             className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                                           >
                                             <span>Guardar</span> ✓
                                           </button>
                                           <button
                                             type="button"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               setEditingInvoiceAccountId(null);
                                               setEditingInvoicePhoneValue("");
                                             }}
                                             className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition"
                                           >
                                             ✕
                                           </button>
                                         </div>
                                       ) : (
                                         <button
                                           type="button"
                                           onClick={async (e) => {
                                             e.stopPropagation();
                                             if (account.requiresInvoice) {
                                               try {
                                                 await updateInvoiceRequirementInFirebase(account.id, false, "");
                                                 setHistory((prev) =>
                                                   prev.map((acc) =>
                                                     acc.id === account.id
                                                       ? { ...acc, requiresInvoice: false, invoicePhone: "" }
                                                       : acc
                                                   )
                                                 );
                                                 triggerAppNotification(
                                                   "🧾 FACTURACIÓN ACTUALIZADA",
                                                   `Cuenta ${account.tableLabel} marcada como: No requiere Factura`
                                                 );
                                               } catch (err) {
                                                 console.error("Error updating invoice requirement:", err);
                                               }
                                             } else {
                                               setEditingInvoiceAccountId(account.id);
                                               setEditingInvoicePhoneValue(account.invoicePhone || "");
                                             }
                                           }}
                                           className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                             account.requiresInvoice
                                               ? "bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-600"
                                               : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                                           }`}
                                         >
                                           🧾 {account.requiresInvoice ? "Quitar Factura" : "Requiere Factura"}
                                         </button>
                                       )
                                     )}

                                    {account.status !== "cancelled" && (
                                      <IonButton
                                        size="small"
                                        fill="outline"
                                        color="secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAccountToEditPayment(account);
                                          setTempPaymentMethod(account.paymentMethod || "cash");
                                          setTempCardLastFour(account.cardLastFour || "");
                                          setTempPaymentCardType(account.cardType || "");
                                          setIsEditPaymentModalOpen(true);
                                        }}
                                      >
                                        <IonIcon icon={refreshOutline} slot="start" />
                                        Cambiar Tipo de Pago 🔄
                                      </IonButton>
                                    )}

                                    <IonButton
                                      fill="outline"
                                      color="primary"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        reprintAccount(account);
                                      }}
                                    >
                                      <IonIcon
                                        icon={printOutline}
                                        slot="start"
                                      />
                                      Reimprimir Nota
                                    </IonButton>
                                    <IonButton
                                      color="secondary"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExportingAccount(account);
                                      }}
                                      title="Exportar"
                                    >
                                      📤
                                    </IonButton>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
              </div>
            </div>
          </div>
      </>
    );
};
