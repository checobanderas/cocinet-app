import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface AccountCancellationModalProps {
  showAccountCancellationModal: boolean;
  setShowAccountCancellationModal: (v: boolean) => void;
  accountCancellationOtherReason: any;
  accountCancellationReason: any;
  handleMarkAccountForCancellation: any;
  selectedAccountForCancellation: any;
  setAccountCancellationOtherReason: any;
  setAccountCancellationPin: any;
  setAccountCancellationReason: any;
  setSelectedAccountForCancellation: any;
}

export const AccountCancellationModal: React.FC<AccountCancellationModalProps> = ({
  showAccountCancellationModal,
  setShowAccountCancellationModal,
  accountCancellationOtherReason,
  accountCancellationReason,
  handleMarkAccountForCancellation,
  selectedAccountForCancellation,
  setAccountCancellationOtherReason,
  setAccountCancellationPin,
  setAccountCancellationReason,
  setSelectedAccountForCancellation,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  return (
    <IonModal
      isOpen={showAccountCancellationModal}
      onDidDismiss={() => {
        setIsProcessing(false);
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
            <IonButton
              disabled={isProcessing}
              onClick={() => setShowAccountCancellationModal(false)}
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
        <IonText color="dark">
          <p className="text-sm font-bold text-slate-600 mb-4">
            Selecciona el motivo de cancelación de la cuenta CERRADA (Mesa{" "}
            {selectedAccountForCancellation?.tableLabel}):
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
              disabled={isProcessing}
              onClick={() => {
                setAccountCancellationReason(reason);
                if (reason !== "Otro") setAccountCancellationOtherReason("");
              }}
              className={`w-full text-left px-4 py-3 border rounded-xl font-semibold transition active:scale-98 shadow-sm ${
                accountCancellationReason === reason
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
              } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {reason}
            </button>
          ))}
        </div>
        {accountCancellationReason === "Otro" && (
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
              if (!accountCancellationReason) {
                alert("Selecciona un motivo");
                return;
              }
              if (
                accountCancellationReason === "Otro" &&
                !accountCancellationOtherReason.trim()
              ) {
                alert("Por favor especifica el motivo");
                return;
              }
              setIsProcessing(true);
              try {
                const finalReason =
                  accountCancellationReason === "Otro"
                    ? accountCancellationOtherReason
                    : accountCancellationReason;
                await handleMarkAccountForCancellation(
                  selectedAccountForCancellation!.id,
                  finalReason
                );
                setShowAccountCancellationModal(false);
              } catch (e) {
                console.error(e);
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={
              isProcessing ||
              !accountCancellationReason ||
              (accountCancellationReason === "Otro" &&
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
      </IonContent>
    </IonModal>
  );
};
