import * as fs from 'fs';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for modal
appCode = appCode.replace(
  `  const [paymentAmountReceived, setPaymentAmountReceived] =`,
  `  const [showCashMovementModal, setShowCashMovementModal] = useState(false);
  const [cashMovementForm, setCashMovementForm] = useState<{
    type: "in" | "out";
    concept: "nomina" | "retiro" | "dotacion" | "fondo" | "otro";
    amount: string;
    description: string;
  }>({ type: "out", concept: "retiro", amount: "", description: "" });
  
  const [paymentAmountReceived, setPaymentAmountReceived] =`
);

// 2. Add handler for submit
appCode = appCode.replace(
  `  const cancelComanda = `,
  `  const handleAddCashMovement = async () => {
    if (!cashMovementForm.amount) return;
    const amount = parseFloat(cashMovementForm.amount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await addCashMovementToFirebase({
         type: cashMovementForm.type,
         concept: cashMovementForm.concept,
         amount: amount,
         description: cashMovementForm.description,
         user: currentUser?.name || "Admin"
      });
      setShowCashMovementModal(false);
      setCashMovementForm({ type: "out", concept: "retiro", amount: "", description: "" });
    } catch (e) {
      console.error("Error adding cash movement", e);
    }
  };

  const cancelComanda = `
);

// 3. Add UI inside Corte de Caja 
// Looking for `          {configActiveTab === "corte" && (` 
// Wait, someone else changed configActiveTab. 
// "Ventas Brutas" is around 7067.
// I'll search for `              {/* Arqueo de Caja */}` and insert before it.

const addMovementUi = `
              {/* Movimientos de Caja */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                   <div>
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                       Flujo de Efectivo (Entradas y Salidas)
                     </h3>
                     <p className="text-xs text-slate-500 mt-1">
                       Nómina, retiros, dotaciones, fondos de caja u otros.
                     </p>
                   </div>
                   <button 
                     onClick={() => setShowCashMovementModal(true)}
                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                   >
                     <IonIcon icon={addOutline} />
                     Registrar Movimiento
                   </button>
                </div>
                
                {corteData.totalCashMovements.length === 0 ? (
                   <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                     No hay movimientos externos de caja hoy.
                   </div>
                ) : (
                   <div className="space-y-3">
                     {corteData.totalCashMovements.map((mov: any, idx: number) => (
                       <div key={mov.id || idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-lg \${mov.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}\`}>
                               <IonIcon icon={mov.type === 'in' ? addOutline : closeOutline} />
                             </div>
                             <div>
                               <div className="text-sm font-bold text-slate-800 capitalize">{mov.concept}</div>
                               <div className="text-xs text-slate-500">{mov.description || "Sin descripción"} • {mov.user} • {mov.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                             </div>
                          </div>
                          <div className={\`text-sm font-black \${mov.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}\`}>
                             {mov.type === 'in' ? '+' : '-'}\${mov.amount.toFixed(2)}
                          </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>

              {/* Arqueo de Caja */}`;

appCode = appCode.replace(
  `              {/* Arqueo de Caja */}`,
  addMovementUi
);

// 4. Add the Modal UI at the end of the return statement
// Look for `<IonToast` or similar global modals.

const modalUi = `
        {/* Cash Movement Modal */}
        <IonModal
          isOpen={showCashMovementModal}
          onDidDismiss={() => setShowCashMovementModal(false)}
          initialBreakpoint={0.7}
          breakpoints={[0, 0.7]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}>
              <IonTitle>Registrar Movimiento</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCashMovementModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="bg-slate-50 p-4 rounded-xl mb-4">
              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Tipo de Movimiento</label>
              <IonSegment 
                value={cashMovementForm.type} 
                onIonChange={e => setCashMovementForm({...cashMovementForm, type: e.detail.value as any, concept: e.detail.value === "in" ? "dotacion" : "retiro"})}
                className="mb-4"
              >
                <IonSegmentButton value="in">
                  <IonLabel>Entrada (+)</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="out">
                  <IonLabel>Salida (-)</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Concepto</label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 mb-4"
                value={cashMovementForm.concept}
                onChange={e => setCashMovementForm({...cashMovementForm, concept: e.target.value as any})}
              >
                {cashMovementForm.type === 'in' ? (
                  <>
                    <option value="dotacion">Dotación a Caja</option>
                    <option value="fondo">Fondo de Caja (Apertura)</option>
                    <option value="otro">Otro Ingreso</option>
                  </>
                ) : (
                  <>
                    <option value="retiro">Retiro de Caja</option>
                    <option value="nomina">Pago de Nómina / Proveedor</option>
                    <option value="otro">Otro Egreso</option>
                  </>
                )}
              </select>

              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Monto en Efectivo</label>
              <div className="relative mb-4">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">$</span>
                 </div>
                 <input 
                   type="number"
                   className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                   placeholder="0.00"
                   value={cashMovementForm.amount}
                   onChange={e => setCashMovementForm({...cashMovementForm, amount: e.target.value})}
                 />
              </div>

              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Descripción / Nota</label>
              <input 
                 type="text"
                 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 mb-6"
                 placeholder="Ej. Pago al repartidor de hielo"
                 value={cashMovementForm.description}
                 onChange={e => setCashMovementForm({...cashMovementForm, description: e.target.value})}
              />

              <button 
                onClick={handleAddCashMovement}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-center shadow-md transition-colors"
              >
                Guardar Movimiento
              </button>
            </div>
          </IonContent>
        </IonModal>
`;

appCode = appCode.replace(
  `        {/* Cancellation Modal inside App (Used everywhere basically) */}`,
  modalUi + `\n        {/* Cancellation Modal inside App (Used everywhere basically) */}`
);

fs.writeFileSync('src/App.tsx', appCode);
console.log('Added CashMovement UI');
