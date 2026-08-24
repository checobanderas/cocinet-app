import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, checkmarkOutline, keyOutline } from 'ionicons/icons';

interface AuthorizeCancellationModalProps {
  showAuthorizeCancellationModal: boolean;
  setShowAuthorizeCancellationModal: (v: boolean) => void;
  authorizePasswordValue: any;
  setAuthorizePasswordValue: (v: any) => void;
}

export const AuthorizeCancellationModal: React.FC<AuthorizeCancellationModalProps> = ({
  showAuthorizeCancellationModal,
  setShowAuthorizeCancellationModal,
  authorizePasswordValue,
  setAuthorizePasswordValue
}) => {
  return (
          <IonModal
            isOpen={showAuthorizeCancellationModal}
            onDidDismiss={() => {
              setShowAuthorizeCancellationModal(false);
              setAuthorizationPin("");
              setPendingCancellationTarget(null);
            }}
            style={{
              "--height": "560px",
              "--width": "420px",
              "--border-radius": "28px",
            }}
          >
            <div className="flex flex-col h-full bg-slate-900 text-white">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-rose-400 tracking-tight uppercase m-0">Autorización Requerida 🔒</h3>
                  <p className="text-[11px] text-slate-400 m-0">Introduce tu PIN de Administrador</p>
                </div>
                <button onClick={() => setShowAuthorizeCancellationModal(false)} className="bg-white/10 p-2 rounded-full border-none cursor-pointer">
                  <IonIcon icon={closeOutline} className="text-white" />
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center items-center space-y-6">
                <div className="text-center">
                  <p className="text-sm text-slate-300 font-bold mb-2">
                    {pendingCancellationTarget?.type === 'account' ? 'Confirmar cancelación de CUENTA' : 'Confirmar cancelación de PRODUCTOS'}
                  </p>
                  <div className="bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800">
                    <span className="text-3xl font-black tracking-[1em] ml-[1em]">{"•".repeat(authorizationPin.length) || "----"}</span>
                  </div>
                </div>

                {renderCancellationPinPad(
                  authorizationPin,
                  setAuthorizationPin,
                  async (pin) => {
                    const admin = validateAdminPin(pin);
                    if (admin) {
                      if (pendingCancellationTarget?.type === 'account') {
                        await handleAuthorizeAccountCancellation(pendingCancellationTarget.id, admin);
                      } else if (pendingCancellationTarget?.type === 'item' || pendingCancellationTarget?.type === 'bulk') {
                        await finalizeComandaItemsCancellationInFirebase(
                          pendingCancellationTarget.id,
                          selectedTable || {}, // This might be tricky if not in table view, but usually we are
                          pendingCancellationTarget.items || [],
                          admin
                        );
                        triggerAppNotification("Cancelación exitosa", "Productos cancelados definitivamente ✅", "success");
                      }
                      setShowAuthorizeCancellationModal(false);
                      setAuthorizationPin("");
                      setPendingCancellationTarget(null);
                    } else {
                      alert("PIN de Administrador incorrecto ❌");
                      setAuthorizationPin("");
                    }
                  }
                )}
              </div>
            </div>
          </IonModal>
  );
};
