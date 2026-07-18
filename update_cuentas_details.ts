import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSubTotal = `<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                           <span>Subtotal:</span>`;

const itemsListHtml = `
                        <div style={{ marginBottom: "16px" }}>
                          <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Productos Cobrados</h4>
                          {account.comandas.flatMap((c: any) => c.items).map((item: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px", paddingBottom: "4px", borderBottom: "1px dashed #e2e8f0" }}>
                              <span style={{ textDecoration: item.isCancelled ? "line-through" : "none", color: item.isCancelled ? "#ef4444" : "#334155" }}>
                                {item.quantity}x {item.product?.name || "Prod"}
                              </span>
                              <span style={{ textDecoration: item.isCancelled ? "line-through" : "none", color: item.isCancelled ? "#ef4444" : "#334155" }}>
                                \${(item.quantity * (item.product?.price || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                           <span>Subtotal:</span>`;

code = code.replace(targetSubTotal, itemsListHtml);

const targetBtn = `<IonButton
                              fill="solid"
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHistoryAccount(account);
                              }}
                           >
                              <IonIcon icon={receiptOutline} slot="start" />
                              Ver Detalle Completo
                           </IonButton>`;

const replacementBtn = `<IonButton
                              fill="solid"
                              color="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHistoryAccount(account);
                              }}
                           >
                              <IonIcon icon={receiptOutline} slot="start" />
                              Ver Detalle Completo
                           </IonButton>`;

code = code.replace(targetBtn, replacementBtn);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated cuentas with details");
