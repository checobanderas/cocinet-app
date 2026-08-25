import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ComandaCancelModalProps {
  comandaToCancel: any;
  setComandaToCancel: (v: any) => void;
  cancelEntireComanda: any;
  comandaCancelPin: any;
  comandaCancelReason: any;
  handleMarkEntireComandaForCancellation: any;
  renderCancellationPinPad: any;
  setComandaCancelPin: any;
  setComandaCancelReason: any;
  validateAdminPin: any;
}

export const ComandaCancelModal: React.FC<ComandaCancelModalProps> = ({
  comandaToCancel,
  setComandaToCancel,
  cancelEntireComanda, comandaCancelPin, comandaCancelReason, handleMarkEntireComandaForCancellation, renderCancellationPinPad, setComandaCancelPin, setComandaCancelReason, validateAdminPin
}) => {
  return (
          <IonModal
            isOpen={comandaToCancel !== null}
            onDidDismiss={() => {
              setComandaToCancel(null);
              setComandaCancelReason("");
              setComandaCancelPin("");
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
                <IonTitle>Cancelar Comanda #{comandaToCancel}</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setComandaToCancel(null)}>
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
              {!comandaCancelReason ? (
                <>
                  <IonText color="dark">
                    <p className="text-sm font-bold text-slate-600 mb-4">
                      Selecciona el motivo de cancelación de la comanda completa #{comandaToCancel}:
                    </p>
                  </IonText>
                  <div className="space-y-2">
                    {[
                      "Error de captura / duplicado",
                      "Platillos no servidos",
                      "Cliente se retiró",
                      "Mesa abandonada / Sin consumo",
                      "Otro",
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setComandaCancelReason(reason)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 transition active:scale-98 shadow-sm"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                        Motivo de Cancelación
                      </div>
                      <div className="text-sm font-bold text-rose-950">
                        {comandaCancelReason}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setComandaCancelReason("");
                        setComandaCancelPin("");
                      }}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] px-2.5 py-1 rounded-lg border-none cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        if (comandaToCancel !== null) {
                          await handleMarkEntireComandaForCancellation(comandaToCancel, comandaCancelReason);
                          setComandaToCancel(null);
                          setComandaCancelReason("");
                          setComandaCancelPin("");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-98 text-white font-black text-sm rounded-xl transition shadow-md border-none cursor-pointer"
                    >
                      <span>⏳</span> Solicitar Proceso de Cancelación
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-300"></div>
                      <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">o autorizar con pin</span>
                      <div className="flex-grow border-t border-slate-300"></div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs font-black uppercase text-slate-500 mb-1">
                        🔒 AUTORIZACIÓN INMEDIATA
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold m-0 p-0 leading-tight">
                        Introduce el PIN de Administrador para autorizar y cancelar al instante:
                      </p>
                    </div>

                    {renderCancellationPinPad(
                      comandaCancelPin,
                      setComandaCancelPin,
                      async (pin) => {
                        const adminUser = validateAdminPin(pin);
                        if (adminUser) {
                          if (comandaToCancel !== null) {
                            try {
                              await cancelEntireComanda(comandaToCancel, comandaCancelReason, adminUser);
                              setComandaToCancel(null);
                              setComandaCancelReason("");
                              setComandaCancelPin("");
                            } catch (err) {
                              console.error("Error cancelling comanda:", err);
                            }
                          }
                        } else {
                          alert("⚠️ PIN incorrecto o usuario sin permisos de Administrador.");
                          setComandaCancelPin("");
                        }
                      }
                    )}
                  </div>
                </div>
              )}
            </IonContent>
          </IonModal>
  );
};
