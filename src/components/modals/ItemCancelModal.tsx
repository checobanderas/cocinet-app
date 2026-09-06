import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ItemCancelModalProps {
  itemToCancel: any;
  setItemToCancel: (v: any) => void;
  accountCancellationOtherReason: any;
  handleCancelItem: any;
  handleMarkItemForCancellation: any;
  itemCancelPin: any;
  itemCancelReason: any;
  renderCancellationPinPad: any;
  setAccountCancellationOtherReason: any;
  setItemCancelPin: any;
  setItemCancelReason: any;
  validateAdminPin: any;
}

export const ItemCancelModal: React.FC<ItemCancelModalProps> = ({
  itemToCancel,
  setItemToCancel,
  accountCancellationOtherReason,
  handleCancelItem,
  handleMarkItemForCancellation,
  itemCancelPin,
  itemCancelReason,
  renderCancellationPinPad,
  setAccountCancellationOtherReason,
  setItemCancelPin,
  setItemCancelReason,
  validateAdminPin,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  return (
    <IonModal
      isOpen={!!itemToCancel}
      onDidDismiss={() => {
        setIsProcessing(false);
        setItemToCancel(null);
        setItemCancelReason("");
        setItemCancelPin("");
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
          <IonTitle>Cancelar Producto</IonTitle>
          <IonButtons slot="end">
            <IonButton
              disabled={isProcessing}
              onClick={() => setItemToCancel(null)}
            >
              Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="ion-padding"
        style={{ "--background": "#f8fafc" }}
      >
        {!itemCancelReason ? (
          <>
            <IonText color="dark">
              <p className="text-sm font-bold text-slate-600 mb-4">
                Indica el motivo de cancelación de este producto:
              </p>
            </IonText>
            <div className="space-y-2">
              {[
                "Error de captura",
                "Producto no servido",
                "Cliente se retiró",
                "Falta de insumos",
                "Otro",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setItemCancelReason(reason);
                    if (reason !== "Otro") setAccountCancellationOtherReason("");
                  }}
                  className={`w-full text-left px-4 py-3 border rounded-xl font-semibold transition active:scale-98 shadow-sm ${
                    itemCancelReason === reason
                      ? "bg-indigo-600 text-white border-indigo-700"
                      : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                  } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {itemCancelReason === "Otro" && (
              <div className="mt-4">
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 ml-1">
                  Especifique el motivo:
                </label>
                <textarea
                  disabled={isProcessing}
                  value={accountCancellationOtherReason}
                  onChange={(e) =>
                    setAccountCancellationOtherReason(e.target.value)
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm focus:border-indigo-500 outline-none"
                  placeholder="Escribe el motivo aquí..."
                  rows={3}
                />
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={async () => {
                  if (isProcessing) return;
                  if (!itemCancelReason) {
                    alert("Selecciona un motivo");
                    return;
                  }
                  if (
                    itemCancelReason === "Otro" &&
                    !accountCancellationOtherReason.trim()
                  ) {
                    alert("Por favor especifica el motivo");
                    return;
                  }
                  setIsProcessing(true);
                  try {
                    const finalReason =
                      itemCancelReason === "Otro"
                        ? accountCancellationOtherReason
                        : itemCancelReason;
                    await handleMarkItemForCancellation(
                      itemToCancel!.folio,
                      itemToCancel!.productId,
                      itemToCancel!.plate,
                      finalReason
                    );
                    setItemToCancel(null);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={
                  isProcessing ||
                  !itemCancelReason ||
                  (itemCancelReason === "Otro" &&
                    !accountCancellationOtherReason.trim())
                }
                className={`w-full font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 ${
                  isProcessing
                    ? "bg-rose-400 text-white cursor-not-allowed opacity-80"
                    : "bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span>Procesando solicitud, por favor espere...</span>
                  </>
                ) : (
                  <span>Marcar para Cancelación ⏳</span>
                )}
              </button>
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
                        {itemCancelReason}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItemCancelReason("");
                        setItemCancelPin("");
                      }}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] px-2.5 py-1 rounded-lg border-none cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>

                  <div className="text-center">
                    <div className="text-xs font-black uppercase text-slate-500 mb-1">
                      🔒 PIN DE ADMINISTRADOR REQUERIDO
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold m-0 p-0 leading-tight">
                      Para cancelar este producto de la comanda, se requiere la autorización mediante PIN de un Administrador:
                    </p>
                  </div>

                  {renderCancellationPinPad(
                    itemCancelPin,
                    setItemCancelPin,
                    async (pin) => {
                      const admin = validateAdminPin(pin);
                      if (admin) {
                        if (itemToCancel) {
                          await handleCancelItem(
                            itemToCancel.folio,
                            itemToCancel.productId,
                            itemToCancel.plate,
                            itemCancelReason,
                            admin
                          );
                          setItemToCancel(null);
                          setItemCancelReason("");
                          setItemCancelPin("");
                        }
                      } else {
                        alert("⚠️ PIN incorrecto o usuario sin permisos de Administrador.");
                        setItemCancelPin("");
                      }
                    }
                  )}
                </div>
              )}
            </IonContent>
          </IonModal>
  );
};
