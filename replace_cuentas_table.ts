import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchorTop = `{mainTab === "cuentas" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            {/* Sales Summary Cards */}`;

const beginIndex = code.indexOf(anchorTop);
if (beginIndex === -1) {
  console.log("Could not find start of cuentas tab");
  process.exit(1);
}

const tableStartString = `<div
              style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            >
              <table`;

const tableStartIndex = code.indexOf(tableStartString, beginIndex);
if (tableStartIndex === -1) {
    console.log("Could not find table start");
    process.exit(1);
}

const endString = `          </div>
        )}
      </IonContent>`;
const finalIndex = code.indexOf(endString, tableStartIndex);

if (finalIndex === -1) {
    console.log("Could not find table end");
    process.exit(1);
}

const newAccordionCode = `
            <IonAccordionGroup className="ion-padding" style={{ background: "transparent", padding: 0 }}>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <IonIcon
                    icon={cashOutline}
                    style={{ fontSize: "4rem", color: "#cbd5e1" }}
                  />
                  <IonText color="medium">
                    <p>No hay cuentas cerradas</p>
                  </IonText>
                </div>
              ) : (
                history.map((account) => {
                  const hasCancelledItems = (account.comandas || []).some((c) =>
                    c.items.some((i) => i.isCancelled)
                  );
                  let rowBg = "white";
                  if (account.status === "cancelled") {
                    rowBg = "#fff1f2";
                  }

                  return (
                    <IonAccordion
                      key={account.id}
                      value={account.id}
                      style={{
                        borderRadius: "16px",
                        marginBottom: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        background: rowBg,
                      }}
                    >
                      <IonItem
                        slot="header"
                        color={account.status === "cancelled" ? "danger" : "light"}
                        lines="none"
                      >
                        <IonIcon
                          icon={cashOutline}
                          slot="start"
                          color={account.status === "cancelled" ? "light" : "success"}
                        />
                        <IonLabel>
                          <h2
                            style={{
                              fontWeight: "bold",
                              whiteSpace: "normal",
                            }}
                          >
                            MESA {account.tableLabel}
                          </h2>
                          <p>
                            {account.paymentMethod === "cash"
                                ? "Efectivo"
                                : account.paymentMethod === "card"
                                  ? "Tarjeta"
                                  : "Transf."} •{" "}
                            {account.timestamp instanceof Date &&
                            !isNaN(account.timestamp.getTime())
                              ? account.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "---"}
                          </p>
                        </IonLabel>
                        <div slot="end" style={{ textAlign: "right", paddingRight: "8px" }}>
                           <div style={{ fontWeight: "black", fontSize: "1.1rem" }}>
                             \${account.total.toFixed(2)}
                           </div>
                           {account.status === "cancelled" ? (
                             <span style={{ fontSize: "0.7rem", fontWeight: "bold" }}>CANCELADO</span>
                           ) : account.isPaid ? (
                             <IonBadge color="success">Pagado</IonBadge>
                           ) : (
                             <IonBadge color="warning">Pendiente</IonBadge>
                           )}
                        </div>
                      </IonItem>
                      <div slot="content" className="ion-padding" style={{ background: "white", borderRadius: "0 0 16px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                           <span>Subtotal:</span>
                           <span>\${account.subtotal.toFixed(2)}</span>
                        </div>
                        {account.discount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#ef4444" }}>
                             <span>Descuento:</span>
                             <span>-\${account.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {account.tip > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#10b981" }}>
                             <span>Propina:</span>
                             <span>\${account.tip.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1rem", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginBottom: "16px" }}>
                           <span>Total:</span>
                           <span>\${account.total.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                           <IonButton
                              fill="outline"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                reprintAccount(account);
                              }}
                           >
                              <IonIcon icon={printOutline} slot="start" />
                              Reimprimir
                           </IonButton>
                           <IonButton
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
                           </IonButton>
                           {account.status !== "cancelled" && !account.isPaid && (
                             <IonButton
                                size="small"
                                color="warning"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsPaid(account.id);
                                }}
                             >
                                Pagar
                             </IonButton>
                           )}
                        </div>
                      </div>
                    </IonAccordion>
                  );
                })
              )}
            </IonAccordionGroup>
`;

code = code.substring(0, tableStartIndex) + newAccordionCode + code.substring(finalIndex);
fs.writeFileSync('src/App.tsx', code);
console.log("Successfully replaced cuentas table with IonAccordionGroup");
