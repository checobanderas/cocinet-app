import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchorGroupStartString = '<IonAccordionGroup className="ion-padding" style={{ background: "transparent", padding: 0 }}>';
const anchorGroupEndString = '</IonAccordionGroup>\n          </div>\n        )}\n      </IonContent>';

const startIndex = code.indexOf(anchorGroupStartString);
const endIndex = code.indexOf(anchorGroupEndString, startIndex) + '</IonAccordionGroup>'.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find accordion bounds");
  process.exit(1);
}

const tableCode = `
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  {history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        No hay cuentas cerradas
                      </td>
                    </tr>
                  ) : (
                    history.map((account) => {
                      const hasCancelledItems = (account.comandas || []).some(
                        (c) => c.items.some((i) => i.isCancelled),
                      );
                      let rowBg = "transparent";
                      let rowBorder = "1px solid #f1f5f9";
                      if (account.status === "cancelled") {
                        rowBg = "#fff1f2";
                        rowBorder = "1px solid #fecaca";
                      }
                      const isExpanded = expandedAccountIds.includes(account.id);
                      return (
                        <React.Fragment key={account.id}>
                          <tr
                            style={{
                              background: rowBg,
                              borderBottom: isExpanded ? "none" : rowBorder,
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                            onClick={() => {
                              setExpandedAccountIds((prev) =>
                                prev.includes(account.id)
                                  ? prev.filter((id) => id !== account.id)
                                  : [...prev, account.id]
                              );
                            }}
                            className="hover:bg-slate-50"
                          >
                            <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#1e293b" }}>
                              Mesa {account.tableLabel}
                            </td>
                            <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#3b82f6" }}>
                              \${account.total.toFixed(2)}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#64748b" }}>
                              {account.timestamp instanceof Date && !isNaN(account.timestamp.getTime())
                                ? account.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "---"}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <IonBadge color="primary">
                                {account.paymentMethod === "cash"
                                  ? "Efectivo"
                                  : account.paymentMethod === "card"
                                    ? "Tarjeta"
                                    : "Transf."}
                              </IonBadge>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {account.status === "cancelled" ? (
                                <IonBadge color="danger">Cancelada</IonBadge>
                              ) : account.isPaid ? (
                                <IonBadge color="success">Pagado</IonBadge>
                              ) : (
                                <IonBadge color="warning">Pendiente</IonBadge>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr style={{ background: account.status === "cancelled" ? "#fff1f2" : "#f8fafc", borderBottom: rowBorder }}>
                              <td colSpan={5} style={{ padding: "0 16px 16px 16px" }}>
                                <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}>
                                  <div style={{ marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Productos Vendidos</h4>
                                    {account.comandas.flatMap((c: any) => c.items).map((item: any, idx: number) => (
                                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "6px" }}>
                                        <span style={{ textDecoration: item.isCancelled ? "line-through" : "none", color: item.isCancelled ? "#ef4444" : "#334155" }}>
                                          {item.quantity}x {item.product?.name || "Prod"}
                                        </span>
                                        <span style={{ textDecoration: item.isCancelled ? "line-through" : "none", color: item.isCancelled ? "#ef4444" : "#334155", fontWeight: "500" }}>
                                          \${(item.quantity * (item.product?.price || 0)).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#64748b" }}>
                                    <span>Subtotal:</span>
                                    <span>\${account.subtotal.toFixed(2)}</span>
                                  </div>
                                  {account.discount > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#ef4444" }}>
                                      <span>Descuento ({account.discountReason}):</span>
                                      <span>-\${account.discount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  {account.tip > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#10b981" }}>
                                      <span>Propina:</span>
                                      <span>\${account.tip.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1rem", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginBottom: "16px", color: "#1e293b" }}>
                                    <span>Total:</span>
                                    <span>\${account.total.toFixed(2)}</span>
                                  </div>
                                  
                                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                    {account.status !== "cancelled" && !account.isPaid && (
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
                                    <IonButton
                                      fill="outline"
                                      color="primary"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        reprintAccount(account);
                                      }}
                                    >
                                      <IonIcon icon={printOutline} slot="start" />
                                      Reimprimir Nota
                                    </IonButton>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>`;

code = code.substring(0, startIndex) + tableCode + code.substring(endIndex);

// Define expandedAccountIds state
const selectedAccountCode = `const [selectedHistoryAccount, setSelectedHistoryAccount] =
    useState<ClosedAccount | null>(null);`;
const stateCode = `${selectedAccountCode}
  const [expandedAccountIds, setExpandedAccountIds] = useState<string[]>([]);`;

code = code.replace(selectedAccountCode, stateCode);

fs.writeFileSync('src/App.tsx', code);
console.log('Restored table with collapsible rows.');
