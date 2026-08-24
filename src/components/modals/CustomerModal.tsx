import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface CustomerModalProps {
  customerModal: any;
  setCustomerModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customerModal,
  setCustomerModal,
  triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={customerModal.isOpen}
            onDidDismiss={() =>
              setCustomerModal({ isOpen: false, customer: null })
            }
            initialBreakpoint={0.75}
            breakpoints={[0, 0.75]}
          >
            <IonHeader className="ion-no-border">
              <IonToolbar
                style={{
                  "--background": "rgb(40, 45, 52)",
                  "--color": "white",
                }}
              >
                <IonTitle>
                  {customerModal.customer
                    ? "✏️ Editar Cliente"
                    : "👥 Nuevo Cliente"}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton
                    onClick={() =>
                      setCustomerModal({ isOpen: false, customer: null })
                    }
                  >
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <form
                onSubmit={handleSaveCustomer}
                className="space-y-4 max-w-lg mx-auto py-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    name="custName"
                    type="text"
                    required
                    defaultValue={customerModal.customer?.name || ""}
                    placeholder="Juan Pérez"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Teléfono
                    </label>
                    <input
                      name="custPhone"
                      type="tel"
                      defaultValue={customerModal.customer?.phone || ""}
                      placeholder="55-8765-4321"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Visitas del Cliente
                    </label>
                    <input
                      name="custVisits"
                      type="number"
                      min="0"
                      defaultValue={
                        customerModal.customer?.visits !== undefined
                          ? customerModal.customer.visits
                          : 0
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Email
                  </label>
                  <input
                    name="custEmail"
                    type="email"
                    defaultValue={customerModal.customer?.email || ""}
                    placeholder="juan.perez@email.com"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Preferencias Especiales / Alergias o Notas
                  </label>
                  <textarea
                    name="custNotes"
                    rows={2}
                    defaultValue={customerModal.customer?.notes || ""}
                    placeholder="Prefiere mesa en terraza. Es vegetariano. Alérgico a las nueces."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    📍 Direcciones de Entrega (A Domicilio)
                  </label>
                  <p className="text-xs text-slate-500">
                    Registra una o varias direcciones para el servicio de reparto.
                  </p>
                  
                  {customerModalAddresses.length === 0 ? (
                    <div className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">
                      Ninguna dirección registrada aún.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {customerModalAddresses.map((addr, idx) => {
                        let addrText = addr;
                        let refText = "";
                        if (addr.includes("(Ref:")) {
                          const parts = addr.split("(Ref:");
                          addrText = parts[0].trim();
                          refText = parts[1].replace(")", "").trim();
                        } else if (addr.includes("| Ref:")) {
                          const parts = addr.split("| Ref:");
                          addrText = parts[0].trim();
                          refText = parts[1].trim();
                        }

                        return (
                          <div key={idx} className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-xs">
                            <div className="flex-1 truncate">
                              <p className="text-xs text-slate-800 font-bold truncate">📍 {addrText}</p>
                              {refText && (
                                <p className="text-[11px] text-amber-700 font-semibold truncate">📝 <span className="font-bold">Ref:</span> {refText}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setCustomerModalAddresses(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 text-xs font-black p-1 transition cursor-pointer border-none bg-transparent shrink-0"
                              title="Eliminar Dirección"
                            >
                              ❌
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <input
                      type="text"
                      value={newAddressInput}
                      onChange={(e) => setNewAddressInput(e.target.value)}
                      placeholder="📍 Calle, Número y Colonia..."
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newAddressRefInput}
                      onChange={(e) => setNewAddressRefInput(e.target.value)}
                      placeholder="📝 Referencia de la dirección (Fachada, portón, entre calles)..."
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAddressInput.trim()) {
                          let formatted = newAddressInput.trim();
                          if (newAddressRefInput.trim()) {
                            formatted = `${formatted} (Ref: ${newAddressRefInput.trim()})`;
                          }
                          setCustomerModalAddresses(prev => [...prev, formatted]);
                          setNewAddressInput("");
                          setNewAddressRefInput("");
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-black transition cursor-pointer border-none shadow-sm uppercase tracking-wider"
                    >
                      ➕ Agregar Dirección con Referencia
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </IonContent>
          </IonModal>
  );
};
