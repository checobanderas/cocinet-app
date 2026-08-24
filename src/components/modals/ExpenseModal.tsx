import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, trashOutline } from 'ionicons/icons';

interface ExpenseModalProps {
  showExpenseModal: boolean;
  setShowExpenseModal: (v: boolean) => void;
  // Let's add any props passed in
  expenseFormData: any;
  setExpenseFormData: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  showExpenseModal,
  setShowExpenseModal,
  expenseFormData,
  setExpenseFormData,
  triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={showExpenseModal}
            onDidDismiss={() => {
              setShowExpenseModal(false);
              setSelectedExpenseForEdit(null);
            }}
            style={{
              "--height": "100%",
              "--width": "100%",
              "--max-height": "100%",
              "--max-width": "100%",
              "--border-radius": "0px",
            }}
          >
            <IonHeader className="ion-no-border">
              <IonToolbar
                style={{
                  "--background": "rgb(40, 45, 52)",
                  "--color": "white",
                }}
              >
                <IonTitle>
                  {selectedExpenseForEdit
                    ? "📝 Editar Gasto"
                    : "➕ Registrar Nuevo Gasto"}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton
                    onClick={() => setShowExpenseModal(false)}
                    style={{ fontWeight: "bold", fontSize: "12px" }}
                  >
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>

            <IonContent
              className="ion-no-padding"
              style={{
                "--background": "white",
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <form
                onSubmit={handleSaveExpense}
                className="py-4 px-2 space-y-4 w-full"
              >
                <div className="text-sm text-slate-400 font-bold mb-4 border-b border-slate-100 pb-2">
                  Completa los campos para registrar el egreso físico/digital de
                  tu sucursal.
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Concepto del Gasto / Razón comercial *
                  </label>
                  <input
                    type="text"
                    value={expenseConcept}
                    onChange={(e) => setExpenseConcept(e.target.value)}
                    required
                    placeholder="Ej. Compra de aguacate, Pago de recibo CFE..."
                    className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:border-red-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Monto del egreso *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-slate-400 text-sm font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        required
                        placeholder="0.00"
                        className="w-full p-4 pl-9 border border-slate-200 rounded-xl bg-slate-50 font-black text-sm focus:border-red-500 focus:bg-white outline-none transition text-red-650"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Categoría del Gasto
                    </label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:border-red-500 focus:bg-white outline-none transition cursor-pointer"
                    >
                      <option value="Varios">💼 Varios / Operación</option>
                      <option value="Servicios">
                        ⚡ Servicios (Luz, Agua, Gas)
                      </option>
                      <option value="Insumos">
                        🍅 Insumos / Materia Prima
                      </option>
                      <option value="Sueldos">👥 Sueldos / Nómina</option>
                      <option value="Renta">🏢 Renta / Local</option>
                      <option value="Mantenimiento">🔧 Mantenimiento</option>
                      <option value="Ajustes">🪙 Ajustes de Caja</option>
                      <option value="Otros">📦 Otros Egresos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Referencia / Notas generales sobre el gasto
                  </label>
                  <textarea
                    value={expenseReference}
                    onChange={(e) => setExpenseReference(e.target.value)}
                    rows={3}
                    placeholder="Escriba factura, proveedor, folio de ticket o alguna nota aclaratoria de la compra..."
                    className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-medium text-sm focus:border-red-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm py-4 px-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer uppercase tracking-wider text-center border-none outline-none"
                  >
                    <span>💾</span>{" "}
                    {selectedExpenseForEdit
                      ? "Confirmar Edición de Gasto"
                      : "Guardar Gasto en Servidor"}
                  </button>
                </div>
              </form>
            </IonContent>
          </IonModal>
  );
};
