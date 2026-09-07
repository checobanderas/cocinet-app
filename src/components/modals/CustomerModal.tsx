import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/react';
import { SAT_REGIMENES_FISCALES, SAT_USOS_CFDI } from '../../utils/fiscalHelpers';

interface CustomerModalProps {
  handleSaveCustomer: any;
  customerModal: any;
  setCustomerModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
  customerModalAddresses: any;
  newAddressInput: any;
  newAddressRefInput: any;
  setCustomerModalAddresses: any;
  setNewAddressInput: any;
  setNewAddressRefInput: any;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customerModal,
  setCustomerModal,
  triggerAppNotification,
  customerModalAddresses,
  newAddressInput,
  newAddressRefInput,
  setCustomerModalAddresses,
  setNewAddressInput,
  setNewAddressRefInput,
  handleSaveCustomer
}) => {
  const [showFiscalSection, setShowFiscalSection] = useState(
    !!(customerModal.customer?.rfc || customerModal.customer?.razonSocial)
  );

  return (
    <IonModal
      isOpen={customerModal.isOpen}
      onDidDismiss={() => setCustomerModal({ isOpen: false, customer: null })}
      style={{
        "--height": "auto",
        "--max-height": "90vh",
        "--width": "94%",
        "--max-width": "540px",
        "--border-radius": "28px",
        "--z-index": "99999",
        "zIndex": 99999,
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
            {customerModal.customer ? "✏️ Editar Cliente" : "👥 Nuevo Cliente"}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setCustomerModal({ isOpen: false, customer: null })}>
              Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <form onSubmit={handleSaveCustomer} className="space-y-4 max-w-lg mx-auto py-2 text-slate-800">
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
              className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Teléfono Celular *
              </label>
              <input
                name="custPhone"
                type="tel"
                maxLength={10}
                required
                defaultValue={customerModal.customer?.phone || ""}
                placeholder="6671234567"
                className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-bold font-mono focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Visitas
              </label>
              <input
                name="custVisits"
                type="number"
                min="0"
                defaultValue={customerModal.customer?.visits !== undefined ? customerModal.customer.visits : 1}
                className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              Email General
            </label>
            <input
              name="custEmail"
              type="email"
              defaultValue={customerModal.customer?.email || ""}
              placeholder="juan.perez@email.com"
              className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm focus:border-amber-500 outline-none"
            />
          </div>

          {/* SECCIÓN FISCAL PARA FACTURACIÓN */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Datos Fiscales (Facturación CFDI 4.0)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    {customerModal.customer?.rfc ? `RFC Registrado: ${customerModal.customer.rfc}` : 'Datos para emitir facturas electrónicas'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFiscalSection(!showFiscalSection)}
                className="text-xs font-black text-amber-700 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition border-none cursor-pointer"
              >
                {showFiscalSection ? "Ocultar" : "Mostrar / Editar"}
              </button>
            </div>

            {showFiscalSection && (
              <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      RFC *
                    </label>
                    <input
                      name="custRfc"
                      type="text"
                      maxLength={13}
                      defaultValue={customerModal.customer?.rfc || ""}
                      placeholder="XAXX010101000"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-mono font-bold uppercase focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      C.P. Fiscal (5 dígitos) *
                    </label>
                    <input
                      name="custCp"
                      type="text"
                      maxLength={5}
                      defaultValue={customerModal.customer?.cp || customerModal.customer?.codigoPostal || ""}
                      placeholder="80000"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-mono font-bold text-center focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Razón Social o Nombre Fiscal *
                  </label>
                  <input
                    name="custRazonSocial"
                    type="text"
                    defaultValue={customerModal.customer?.razonSocial || customerModal.customer?.name || ""}
                    placeholder="JUAN PEREZ LOPEZ"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs uppercase font-medium focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Régimen Fiscal
                  </label>
                  <select
                    name="custRegimenFiscal"
                    defaultValue={customerModal.customer?.regimenFiscal || "612"}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs focus:border-amber-500 outline-none"
                  >
                    {SAT_REGIMENES_FISCALES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Uso de CFDI
                  </label>
                  <select
                    name="custUsoCfdi"
                    defaultValue={customerModal.customer?.usoCfdi || "G03"}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs focus:border-amber-500 outline-none"
                  >
                    {SAT_USOS_CFDI.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.code} - {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Correo para Facturación
                  </label>
                  <input
                    name="custEmailFacturacion"
                    type="email"
                    defaultValue={customerModal.customer?.emailFacturacion || customerModal.customer?.email || ""}
                    placeholder="facturacion@empresa.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs text-sky-700 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              Notas y Preferencias
            </label>
            <textarea
              name="custNotes"
              rows={2}
              defaultValue={customerModal.customer?.notes || ""}
              placeholder="Preferencias del cliente..."
              className="w-full p-3 border border-slate-200 rounded-xl bg-white text-xs focus:border-amber-500 outline-none"
            />
          </div>

          {/* DIRECCIONES DE ENTREGA */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              📍 Direcciones de Entrega (A Domicilio)
            </label>
            
            {customerModalAddresses.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">
                Ninguna dirección registrada aún.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {customerModalAddresses.map((addr: string, idx: number) => {
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
                        onClick={() => setCustomerModalAddresses((prev: string[]) => prev.filter((_, i) => i !== idx))}
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
                placeholder="📝 Referencia (Fachada, portón, entre calles)..."
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
                    setCustomerModalAddresses((prev: string[]) => [...prev, formatted]);
                    setNewAddressInput("");
                    setNewAddressRefInput("");
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-black transition cursor-pointer border-none shadow-sm uppercase tracking-wider"
              >
                ➕ Agregar Dirección
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition cursor-pointer border-none text-sm"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </IonContent>
    </IonModal>
  );
};
export default CustomerModal;
