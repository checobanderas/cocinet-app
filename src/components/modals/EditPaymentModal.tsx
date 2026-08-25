import { motion } from 'motion/react';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { cardOutline, cashOutline, closeOutline, saveOutline, swapHorizontalOutline, walletOutline } from 'ionicons/icons';

interface EditPaymentModalProps {
  isEditPaymentModalOpen: boolean;
  setIsEditPaymentModalOpen: (v: boolean) => void;
  accountToEditPayment: any;
  handleUpdatePaymentMethod: any;
  setAccountToEditPayment: any;
  setTempCardLastFour: any;
  setTempPaymentCardType: any;
  setTempPaymentMethod: any;
  tempCardLastFour: any;
  tempPaymentCardType: any;
  tempPaymentMethod: any;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isEditPaymentModalOpen,
  setIsEditPaymentModalOpen,
  accountToEditPayment, handleUpdatePaymentMethod, setAccountToEditPayment, setTempCardLastFour, setTempPaymentCardType, setTempPaymentMethod, tempCardLastFour, tempPaymentCardType, tempPaymentMethod
}) => {
  return (
      <IonModal
        isOpen={isEditPaymentModalOpen}
        onDidDismiss={() => {
          setIsEditPaymentModalOpen(false);
          setAccountToEditPayment(null);
        }}
        className="auto-height-modal"
        breakpoints={[0, 1]}
        initialBreakpoint={1}
      >
        <div className="p-6 bg-slate-900 h-full flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-black text-white m-0">🔄 Editar Método de Pago</h2>
              <p className="text-xs text-slate-400 m-0">Corrigiendo ticket: {accountToEditPayment?.id.substring(0, 8)}... | Mesa {accountToEditPayment?.tableLabel}</p>
            </div>
            <button
              onClick={() => setIsEditPaymentModalOpen(false)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition border-none cursor-pointer"
            >
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-2">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Selecciona el nuevo método:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cash", label: "Efectivo", icon: cashOutline, color: "text-emerald-400" },
                  { id: "card", label: "Tarj. Crédito", icon: cardOutline, color: "text-blue-400", subtype: "credito" },
                  { id: "card", label: "Tarj. Débito", icon: cardOutline, color: "text-indigo-400", subtype: "debito" },
                  { id: "lupay", label: "Lupay", icon: walletOutline, color: "text-purple-400" },
                  { id: "transfer", label: "Transferencia", icon: swapHorizontalOutline, color: "text-amber-400" },
                ].map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTempPaymentMethod(m.id);
                      if (m.subtype) setTempPaymentCardType(m.subtype as any);
                      else setTempPaymentCardType("");
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      (tempPaymentMethod === m.id && (!m.subtype || tempPaymentCardType === m.subtype))
                        ? "bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-slate-900 ${m.color}`}>
                      <IonIcon icon={m.icon} className="text-lg" />
                    </div>
                    <span className={`text-xs font-bold ${(tempPaymentMethod === m.id && (!m.subtype || tempPaymentCardType === m.subtype)) ? "text-white" : "text-slate-400"}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(tempPaymentMethod === "card" || tempPaymentMethod === "transfer") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3"
              >
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Últimos 4 dígitos:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="0000"
                      value={tempCardLastFour}
                      onChange={(e) => setTempCardLastFour(e.target.value.replace(/\D/g, ""))}
                      className="bg-slate-900 text-white text-center font-mono font-bold text-lg p-3 rounded-xl border-2 border-slate-800 focus:border-indigo-500 outline-none w-full tracking-[0.2em]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsEditPaymentModalOpen(false)}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition border-none cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdatePaymentMethod}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition shadow-lg shadow-indigo-900/20 border-none cursor-pointer flex items-center justify-center gap-2"
            >
              <IonIcon icon={saveOutline} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </IonModal>
  );
};
