import { addTenantToFirebase, getMexicoISOString, updateCashierSessionInFirebase } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { backspaceOutline, closeOutline, saveOutline } from 'ionicons/icons';

interface EditFondoModalProps {
  sessionToRender: any;
  showEditFondoModal: boolean;
  setShowEditFondoModal: (v: boolean) => void;
  corteTablaSessionSelected: any;
  dotacionInicial: any;
  editFondoValue: any;
  selectedTenant: any;
  setCashierSessions: any;
  setCorteTablaSessionSelected: any;
  setCorteXFondoApertura: any;
  setEditFondoValue: any;
  setSelectedTenant: any;
  triggerAppNotification: any;
}

export const EditFondoModal: React.FC<EditFondoModalProps> = ({
  showEditFondoModal,
  setShowEditFondoModal,
  corteTablaSessionSelected, dotacionInicial, editFondoValue, selectedTenant, setCashierSessions, setCorteTablaSessionSelected, setCorteXFondoApertura, setEditFondoValue, setSelectedTenant, triggerAppNotification,
  sessionToRender
}) => {
  return (
        <IonModal
          isOpen={showEditFondoModal}
          onDidDismiss={() => setShowEditFondoModal(false)}
          style={{
            "--height": "100%",
            "--width": "100%",
            "--max-height": "530px",
            "--max-width": "400px",
            "--border-radius": "24px"
          }}
          className="rounded-3xl"
        >
          <div className="flex flex-col bg-slate-900 text-white h-full overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <div>
                  <h3 className="text-sm font-black text-amber-400 tracking-tight uppercase m-0 p-0">
                    Fondo de Apertura
                  </h3>
                  <p className="text-[11px] text-slate-300 font-bold m-0 p-0 mt-0.5">
                    Establece el fondo de caja inicial del turno
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditFondoModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none transition"
              >
                <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              {/* Display Value */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden shadow-inner">
                <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Monto Ingresado
                </div>
                <div className="text-4xl font-extrabold text-emerald-450 tracking-wider">
                  ${Number(editFondoValue || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Touch Keypad */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3 shadow-inner">
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setEditFondoValue((prev) => {
                          if (prev.length >= 8) return prev;
                          return prev + num;
                        });
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditFondoValue("")}
                    className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 h-12 rounded-2xl text-xs font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditFondoValue((prev) => {
                        if (prev.length >= 8) return prev;
                        if (prev === "0" || prev === "") return "0";
                        return prev + "0";
                      });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditFondoValue((prev) => {
                        if (prev.includes(".")) return prev;
                        return (prev || "0") + ".";
                      });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    .
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditFondoValue((prev) => prev.slice(0, -1));
                    }}
                    className="bg-slate-850 hover:bg-slate-800 text-slate-350 h-11 rounded-2xl text-xs font-black shadow flex items-center justify-center gap-1 active:scale-95 transition-all outline-none border-none cursor-pointer"
                  >
                    <IonIcon icon={backspaceOutline} style={{ fontSize: "14px" }} />
                    Borrar
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowEditFondoModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer border-none outline-none text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const newVal = Number(editFondoValue);
                    if (isNaN(newVal) || newVal < 0) {
                      triggerAppNotification("Error", "Monto inválido", "warning");
                      return;
                    }

                    try {
                      if (sessionToRender) {
                        // 1. Actualizar Sesión actual
                        await updateCashierSessionInFirebase(sessionToRender.id, {
                          ...sessionToRender,
                          dotacionInicial: newVal,
                          lastUpdate: getMexicoISOString()
                        });
                        setCashierSessions((prev) => {
                          const exists = prev.some((s) => s.id === sessionToRender.id);
                          if (exists) {
                            return prev.map((s) => (s.id === sessionToRender.id ? { ...s, dotacionInicial: newVal, updatedAt: getMexicoISOString() } : s));
                          } else {
                            return [...prev, { ...sessionToRender, dotacionInicial: newVal, updatedAt: getMexicoISOString() }];
                          }
                        });

                        // 2. Actualizar Tenant (Matriz) para que sea el valor por defecto en futuros turnos
                        if (selectedTenant) {
                          const updatedTenant = {
                            ...selectedTenant,
                            defaultStartingCash: newVal
                          };
                          await addTenantToFirebase(updatedTenant);
                          setSelectedTenant(updatedTenant);
                        }

                        // 3. Actualizar la sesión en el estado local si es la que se está visualizando
                        if (corteTablaSessionSelected && corteTablaSessionSelected.id === sessionToRender.id) {
                          const updatedSess = {
                            ...corteTablaSessionSelected,
                            dotacionInicial: newVal
                          };
                          setCorteTablaSessionSelected(updatedSess as any);
                          // Sincronizar también el fondo de apertura global para el corte X si aplica
                          setCorteXFondoApertura(newVal);
                        }

                        setShowEditFondoModal(false);
                        triggerAppNotification("💰 Fondo Guardado", `El fondo inicial ha sido corregido a $${newVal.toFixed(2)} y guardado como predeterminado. ⚡`, "success");
                      }
                    } catch (err) {
                      console.error("Error actualizando fondo:", err);
                      triggerAppNotification("Error", "No se pudo actualizar el fondo en el servidor", "warning");
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer border-none outline-none text-center shadow-md"
                  style={{ backgroundColor: "#10b981" }}
                >
                  💾 Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </IonModal>
  );
};
