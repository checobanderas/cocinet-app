import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, logoWhatsapp } from 'ionicons/icons';

interface InvoicePhoneModalProps {
  showInvoicePhoneModal: boolean;
  setShowInvoicePhoneModal: (v: boolean) => void;
  invoicePhoneNumber: any;
  setInvoicePhoneNumber: (v: any) => void;
  handleSendInvoiceByWhatsApp: () => void;
  handleConfirmInvoicePhone: any;
  inputInvoicePhone: any;
  inputInvoicePhoneConfirm: any;
  invoicePhoneError: any;
  setInputInvoicePhone: any;
  setInputInvoicePhoneConfirm: any;
  setPendingInvoiceTarget: any;
}

export const InvoicePhoneModal: React.FC<InvoicePhoneModalProps> = ({
  showInvoicePhoneModal,
  setShowInvoicePhoneModal,
  invoicePhoneNumber,
  setInvoicePhoneNumber,
  handleSendInvoiceByWhatsApp,
  handleConfirmInvoicePhone, inputInvoicePhone, inputInvoicePhoneConfirm, invoicePhoneError, setInputInvoicePhone, setInputInvoicePhoneConfirm, setPendingInvoiceTarget
}) => {
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
            "--max-width": "460px",
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
                    <p className="text-xs text-slate-400">Celular de Referencia</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoicePhoneModal(false);
                    setPendingInvoiceTarget(null);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-lg hover:bg-slate-700"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                Para registrar la solicitud de factura, ingrese el celular de referencia del cliente. <span className="font-bold text-amber-400">Por seguridad debe capturarlo 2 veces.</span>
              </p>

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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowInvoicePhoneModal(false);
                  setPendingInvoiceTarget(null);
                }}
                className="flex-1 bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-700 transition text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmInvoicePhone}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition text-sm"
              >
                Guardar y Requerir
              </button>
            </div>
          </div>
          </IonContent>

        </IonModal>
  );
};
