import { deleteCurrentCorteInFirebase } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, alertCircleOutline } from 'ionicons/icons';

interface SystemsChoiceAlertProps {
  showSystemsChoiceAlert: boolean;
  setShowSystemsChoiceAlert: (v: boolean) => void;
  selectedTenant: any;
  setCashMovements: any;
  setCashierSessions: any;
  setExpenses: any;
  setHistory: any;
  setShowDeleteAllHistoryConfirm: any;
  setTables: any;
  triggerAppNotification: any;
}

export const SystemsChoiceAlert: React.FC<SystemsChoiceAlertProps> = ({
  showSystemsChoiceAlert,
  setShowSystemsChoiceAlert,
  selectedTenant, setCashMovements, setCashierSessions, setExpenses, setHistory, setShowDeleteAllHistoryConfirm, setTables, triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={showSystemsChoiceAlert}
            onDidDismiss={() => setShowSystemsChoiceAlert(false)}
            className="auto-height-modal"
          >
            <div className="p-6 bg-white rounded-2xl shadow-2xl max-w-md mx-auto space-y-5 border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 m-0">
                  <span>⚙️</span> Opciones de Sistemas
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSystemsChoiceAlert(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2 py-1 rounded-lg border-none bg-transparent cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider m-0">Inquilino Seleccionado:</p>
                <p className="text-base font-extrabold text-slate-800 mt-1 m-0">{selectedTenant?.name || "Sin Nombre"}</p>
              </div>

              <p className="text-sm font-semibold text-slate-600 m-0">
                ¿Qué deseas limpiar para este inquilino?
              </p>

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const tid = selectedTenant?.id;
                    if (!tid) {
                      triggerAppNotification("Error ❌", "No se ha seleccionado ningún inquilino.", "warning");
                      return;
                    }
                    if (!window.confirm(`⚠️ ADVERTENCIA 1\n¿Estás seguro que deseas limpiar el corte actual y las mesas del inquilino: ${selectedTenant?.name}?`)) return;
                    if (!window.confirm(`🚨 ADVERTENCIA 2\nEsta acción es irreversible y borrará las comandas activas de ${selectedTenant?.name}. ¿Confirmas la limpieza?`)) return;

                    setShowSystemsChoiceAlert(false);
                    setTimeout(async () => {
                      try {
                        triggerAppNotification("Sistemas ⚙️", "Limpiando corte de caja del inquilino...", "info");
                        await deleteCurrentCorteInFirebase(tid);
                        
                        localStorage.removeItem(`pos_tables_${tid}`);
                        // Solo actualizamos el estado en memoria para que React sincronice con localStorage si es necesario,
                        // o dejamos que el reload vuelva a cargar de Firebase.
                        setTables((prev: any[]) => prev.map((t: any) => t.tenantId === tid ? { ...t, status: "available", comandas: [], waiterId: null, activeAccount: null } : t));
                        setHistory((prev: any[]) => prev.filter((h: any) => h.tenantId !== tid));
                        setCashierSessions((prev: any[]) => prev.filter((s: any) => s.tenantId !== tid));
                        setCashMovements((prev: any[]) => prev.filter((m: any) => m.tenantId !== tid));
                        setExpenses((prev: any[]) => prev.filter((e: any) => e.tenantId !== tid));

                        triggerAppNotification("Sistemas ⚙️", `Corte actual de ${selectedTenant?.name || ''} limpiado correctamente. ✅`, "success");
                        
                        setTimeout(() => {
                          window.location.reload();
                        }, 800);
                      } catch (e: any) {
                        console.error("Error al limpiar corte actual:", e);
                        triggerAppNotification("Error ❌", e.message || "Error al limpiar corte", "warning");
                      }
                    }, 350);
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer border-none text-sm uppercase tracking-wide"
                >
                  <span>🧹</span> Limpiar Corte Actual de {selectedTenant?.name?.split(' ')[0] || "Inquilino"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSystemsChoiceAlert(false);
                    setTimeout(() => {
                      setShowDeleteAllHistoryConfirm(true);
                    }, 350);
                  }}
                  className="w-full bg-red-800 hover:bg-red-900 text-white font-black py-3 px-4 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer border-none text-sm uppercase tracking-wide"
                >
                  <span>🚨</span> Eliminar Todo el Historial de {selectedTenant?.name?.split(' ')[0] || "Inquilino"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSystemsChoiceAlert(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer border-none text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </IonModal>
  );
};
