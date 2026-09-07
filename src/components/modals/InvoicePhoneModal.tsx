import React, { useMemo } from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { Sparkles, Building2, ShieldCheck, Send } from 'lucide-react';

interface InvoicePhoneModalProps {
  showInvoicePhoneModal: boolean;
  setShowInvoicePhoneModal: (v: boolean) => void;
  invoicePhoneNumber?: any;
  setInvoicePhoneNumber?: (v: any) => void;
  handleSendInvoiceByWhatsApp?: () => void;
  handleConfirmInvoicePhone: any;
  inputInvoicePhone: any;
  inputInvoicePhoneConfirm: any;
  invoicePhoneError: any;
  setInputInvoicePhone: any;
  setInputInvoicePhoneConfirm: any;
  setPendingInvoiceTarget: any;
  allCustomers?: any[];
}

export const InvoicePhoneModal: React.FC<InvoicePhoneModalProps> = ({
  showInvoicePhoneModal,
  setShowInvoicePhoneModal,
  handleConfirmInvoicePhone,
  inputInvoicePhone,
  inputInvoicePhoneConfirm,
  invoicePhoneError,
  setInputInvoicePhone,
  setInputInvoicePhoneConfirm,
  setPendingInvoiceTarget,
  allCustomers = []
}) => {
  const cleanPhone = (inputInvoicePhone || "").replace(/\D/g, "").slice(0, 10);

  const matchedCustomer = useMemo(() => {
    if (!cleanPhone || cleanPhone.length !== 10) return null;
    return allCustomers.find((c: any) => (c.phone || "").replace(/\D/g, "").slice(-10) === cleanPhone);
  }, [allCustomers, cleanPhone]);

  return (
    <IonModal
      isOpen={showInvoicePhoneModal}
      onDidDismiss={() => {
        setShowInvoicePhoneModal(false);
        setPendingInvoiceTarget(null);
      }}
      style={{
        "--height": "auto",
        "--max-height": "90vh",
        "--width": "92%",
        "--max-width": "480px",
        "--border-radius": "28px",
        "--z-index": "99999",
        "zIndex": 99999,
      }}
    >
      <IonContent className="ion-padding" style={{ "--background": "#0f172a" }}>
        <div className="flex flex-col bg-slate-900 text-white p-6 justify-between rounded-3xl">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold border border-amber-500/30">
                  🧾
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Facturación</h2>
                  <p className="text-xs text-slate-400">Captura de Celular del Cliente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInvoicePhoneModal(false);
                  setPendingInvoiceTarget(null);
                }}
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-lg hover:bg-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              Para registrar la solicitud de factura, ingrese el celular del cliente. <span className="font-bold text-amber-400">Por seguridad se debe capturar 2 veces.</span>
            </p>

            {/* Reconocimiento del Cliente en el Catálogo */}
            {matchedCustomer && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/40 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Cliente: {matchedCustomer.name || matchedCustomer.razonSocial}
                  </span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    Catálogo
                  </span>
                </div>
                {matchedCustomer.rfc ? (
                  <div className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono pt-1">
                    <Building2 className="w-3 h-3" />
                    <span>RFC Registrado: <strong>{matchedCustomer.rfc}</strong> ({matchedCustomer.razonSocial || 'Razón Social guardada'})</span>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px] pt-1">
                    ℹ️ No tiene RFC registrado aún. Se le enviará el formulario por WhatsApp para que lo capture.
                  </div>
                )}
              </div>
            )}

            {invoicePhoneError && (
              <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                <span>{invoicePhoneError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  1. Teléfono Celular (10 dígitos)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Ej. 6671234567"
                  value={inputInvoicePhone}
                  onChange={(e) => setInputInvoicePhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-lg font-bold text-center tracking-widest focus:outline-none focus:border-amber-500 transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Confirmar Teléfono Celular (Repetir)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Ej. 6671234567"
                  value={inputInvoicePhoneConfirm}
                  onChange={(e) => setInputInvoicePhoneConfirm(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-lg font-bold text-center tracking-widest focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-[11px] text-slate-400 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Se enviará automáticamente un mensaje de WhatsApp con el formulario de datos fiscales al cliente.</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowInvoicePhoneModal(false);
                setPendingInvoiceTarget(null);
              }}
              className="flex-1 bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-700 transition text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmInvoicePhone}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Guardar y Requerir</span>
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
