import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface AccountCancellationModalProps {
  showAccountCancellationModal: boolean;
  setShowAccountCancellationModal: (v: boolean) => void;
}

export const AccountCancellationModal: React.FC<AccountCancellationModalProps> = ({
  showAccountCancellationModal,
  setShowAccountCancellationModal
}) => {
  return (
          <IonModal
            isOpen={showAccountCancellationModal}
            onDidDismiss={() => {
              setShowAccountCancellationModal(false);
              setSelectedAccountForCancellation(null);
              setAccountCancellationReason("");
              setAccountCancellationPin("");
            }}
            style={{
              "--height": "560px",
              "--max-height": "90%",
              "--width": "100%",
              "--max-width": "480px",
              "--border-radius": "24px",
              "--box-shadow": "0 10px 40px rgba(0,0,0,0.15)",
            }}
          >
            <IonHeader className="ion-no-border">
              <IonToolbar
                style={{
                  "--background": "rgb(40, 45, 52)",
                  "--color": "white",
                }}
              >
                <IonTitle>Cancelar Cuenta Cerrada</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowAccountCancellationModal(false)}>
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
              <IonText color="dark">
                <p className="text-sm font-bold text-slate-600 mb-4">
                  Selecciona el motivo de cancelación de la cuenta CERRADA (Mesa {selectedAccountForCancellation?.tableLabel}):
                </p>
              </IonText>
              <div className="space-y-2">
                {[
                  "Error de cobro / Ajuste",
                  "Cancelada a solicitud del cliente",
                  "Cobro duplicado",
                  "Platillos no servidos cobrados",
                  "Otro",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      setAccountCancellationReason(reason);
                      if (reason !== "Otro") setAccountCancellationOtherReason("");
                    }}
                    className={`w-full text-left px-4 py-3 border rounded-xl font-semibold transition active:scale-98 shadow-sm ${
                      accountCancellationReason === reason 
                        ? "bg-indigo-600 text-white border-indigo-700" 
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              {accountCancellationReason === "Otro" && (
                <div className="mt-4">
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 ml-1">Especifique el motivo:</label>
                  <textarea
                    value={accountCancellationOtherReason}
                    onChange={(e) => setAccountCancellationOtherReason(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm focus:border-indigo-500 outline-none"
                    placeholder="Escribe el motivo aquí..."
                    rows={3}
                  />
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (!accountCancellationReason) {
                      alert("Selecciona un motivo");
                      return;
                    }
                    if (accountCancellationReason === "Otro" && !accountCancellationOtherReason.trim()) {
                      alert("Por favor especifica el motivo");
                      return;
                    }
                    // Mark for cancellation
                    const finalReason = accountCancellationReason === "Otro" ? accountCancellationOtherReason : accountCancellationReason;
                    handleMarkAccountForCancellation(selectedAccountForCancellation!.id, finalReason);
                    setShowAccountCancellationModal(false);
                  }}
                  disabled={!accountCancellationReason || (accountCancellationReason === "Otro" && !accountCancellationOtherReason.trim())}
                  className="w-full bg-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg disabled:opacity-50"
                >
                  Marcar para Cancelación ⏳
                </button>
              </div>
            </IonContent>
          </IonModal>
  );
};
