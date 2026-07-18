import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The block to replace for purchases starts at: {manageMenuTab === "inventory" && (
const newPurchasesContent = '{manageMenuTab === "purchases" && (' + `
            <div style={{ padding: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontWeight: "bold", margin: "0", color: "#1e293b" }}>🛒 Compras y Resurtido</h3>
              </div>
              <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", marginBottom: "4px" }}>Proveedor</label>
                    <input 
                      type="text" 
                      placeholder="Nombre del proveedor"
                      value={purchaseForm.supplier}
                      onChange={e => setPurchaseForm({...purchaseForm, supplier: e.target.value})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", marginBottom: "4px" }}>Estado de Pago</label>
                    <select 
                      value={purchaseForm.isPaid ? 'true' : 'false'}
                      onChange={e => setPurchaseForm({...purchaseForm, isPaid: e.target.value === 'true'})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "white" }}
                    >
                      <option value="true">Pagado (afecta caja)</option>
                      <option value="false">A Crédito (por pagar)</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "bold", color: "#334155" }}>Agregar Ítem</h4>
                  <div style={{ display: "flex", gap: "8px" }}>
                     <select id="p-inv" style={{ flex: 1, padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "white" }}>
                       <option value="">Selecciona insumo...</option>
                       {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>)}
                     </select>
                     <input id="p-qty" type="number" placeholder="Cant." style={{ width: "80px", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
                     <input id="p-price" type="number" placeholder="Total $" style={{ width: "100px", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
                     <button 
                       onClick={() => {
                         const invId = (document.getElementById("p-inv") as HTMLSelectElement).value;
                         const qty = parseFloat((document.getElementById("p-qty") as HTMLInputElement).value);
                         const price = parseFloat((document.getElementById("p-price") as HTMLInputElement).value);
                         if (!invId || isNaN(qty) || isNaN(price)) return;
                         
                         setPurchaseForm({
                           ...purchaseForm,
                           items: [...purchaseForm.items, { inventoryItemId: invId, qty, price }]
                         });
                         (document.getElementById("p-inv") as HTMLSelectElement).value = '';
                         (document.getElementById("p-qty") as HTMLInputElement).value = '';
                         (document.getElementById("p-price") as HTMLInputElement).value = '';
                       }}
                       style={{ background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}>
                       Agregar
                     </button>
                  </div>
                </div>

                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "0.85rem", marginBottom: "16px" }}>
                  <thead style={{ background: "#f1f5f9", color: "#64748b" }}>
                    <tr>
                      <th style={{ padding: "8px 12px" }}>Insumo</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Cant.</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Precio $</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseForm.items.map((item, idx) => {
                       const inv = inventory.find(i => i.id === item.inventoryItemId);
                       return (
                         <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                           <td style={{ padding: "8px 12px", fontWeight: "bold" }}>{inv?.name || 'Insumo'}</td>
                           <td style={{ padding: "8px 12px", textAlign: "center" }}>{item.qty}</td>
                           <td style={{ padding: "8px 12px", textAlign: "right", color: "#059669" }}>$\\x7bitem.price.toFixed(2)\\x7d</td>
                           <td style={{ padding: "8px 12px", textAlign: "center" }}>
                             <button onClick={() => {
                               const newItms = [...purchaseForm.items];
                               newItms.splice(idx, 1);
                               setPurchaseForm({...purchaseForm, items: newItms});
                             }} style={{ color: "#ef4444", fontWeight: "bold" }}>X</button>
                           </td>
                         </tr>
                       );
                    })}
                    {purchaseForm.items.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: "16px", color: "#94a3b8" }}>No hay ítems agregados</td></tr>
                    )}
                  </tbody>
                </table>
                
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                   <div style={{ fontSize: "1.1rem" }}>
                     Total: <strong style={{ color: "#059669" }}>$\\x7bpurchaseForm.items.reduce((s,i) => s + i.price, 0).toFixed(2)\\x7d</strong>
                   </div>
                   <button 
                     onClick={async () => {
                       if (!purchaseForm.supplier || purchaseForm.items.length === 0) return alert("Faltan datos");
                       await addPurchaseToFirebase({ ...purchaseForm, total: purchaseForm.items.reduce((s,i) => s + i.price, 0) });
                       setPurchaseForm({ supplier: "", items: [], isPaid: true });
                       alert("Compra guardada y stock ajustado");
                     }}
                     style={{ background: "#10b981", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold" }}
                   >
                     Registrar Compra
                   </button>
                </div>
              </div>
              
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontWeight: "bold", margin: "0 0 16px 0", color: "#1e293b" }}>Historial de Compras</h3>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  {purchases.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#334155" }}>\\x7bp.supplier\\x7d</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>\\x7bnew Date(p.timestamp).toLocaleString()\\x7d • \\x7bp.items?.length || 0\\x7d ítems</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>$\\x7bp.total?.toFixed(2)\\x7d</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: p.isPaid ? "#3b82f6" : "#f59e0b" }}>
                          \\x7bp.isPaid ? 'PAGADO' : 'POR PAGAR'\\x7d
                        </div>
                      </div>
                    </div>
                  ))}
                  {purchases.length === 0 && <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8" }}>No hay compras registradas</div>}
                </div>
              </div>
            </div>
          )}`

// Now let's find the inventory block boundaries
const invStart = code.indexOf('{manageMenuTab === "inventory" && (');
const recipesStart = code.indexOf('{manageMenuTab === "recipes" && (');

if(invStart === -1 || recipesStart === -1) {
    console.error("Could not find blocks");
    process.exit(1);
}

const invBlock = code.substring(invStart, recipesStart); // This is the old inventory block

// Replace it with the new purchases block in Manage Menu
code = code.substring(0, invStart) + newPurchasesContent + '\n\n          ' + code.substring(recipesStart);

// Now wrap invBlock in renderAdminInventory and inject it before renderAdminPanel
let cleanInvBlock = invBlock;
if (cleanInvBlock.startsWith('{manageMenuTab === "inventory" && (')) {
  cleanInvBlock = cleanInvBlock.substring('{manageMenuTab === "inventory" && ('.length);
}
// remove trailing )}
const lastCloseIdx = cleanInvBlock.lastIndexOf(')}');
// it might have some formatting.
if (lastCloseIdx !== -1) {
  cleanInvBlock = cleanInvBlock.substring(0, lastCloseIdx);
}

const fullAdminInventoryComponent = `\nconst renderAdminInventory = () => {\n    return (\n      <IonPage>\n        <IonHeader className="ion-no-border">\n          <IonToolbar style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}>\n            <IonButtons slot="start">\n              <IonButton onClick={() => setAppMode("admin")}>\n                <IonIcon icon={arrowBackOutline} slot="icon-only" />\n              </IonButton>\n            </IonButtons>\n            <IonTitle>Inventario y Mov.</IonTitle>\n          </IonToolbar>\n        </IonHeader>\n        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>\n          ` + cleanInvBlock + `\n        </IonContent>\n      </IonPage>\n    );\n  };\n  `;

code = code.replace(`const renderAdminPanel = () => {`, fullAdminInventoryComponent + `\n  const renderAdminPanel = () => {`);

// Also update where the app renders modes
code = code.replace(
  `{appMode === "admin" && renderAdminPanel()}`,
  `{appMode === "admin" && renderAdminPanel()}\n          {appMode === "inventory" && renderAdminInventory()}`
);

// Add the call to switch to inventory app mode from the Admin Panel's tabs
code = code.replace(
  `{configActiveTab === "system" ? (`,
  `{configActiveTab === "inventory" && (
            <div className="space-y-6 max-w-4xl mx-auto py-4 text-center">
               <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <IonIcon icon={listOutline} style={{ fontSize: "32px" }} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Administrar Inventario</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Ajustes de inventario inicial, movimientos y altas de insumos (materia prima).
                  </p>
                  <button 
                    onClick={() => setAppMode("inventory")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-2xl transition duration-200"
                  >
                    Ir a Inventario y Movimientos
                  </button>
               </div>
            </div>
          )}
          {configActiveTab === "system" ? (`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Applied purchases tab and inventory move");
