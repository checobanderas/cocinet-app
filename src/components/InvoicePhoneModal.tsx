import React, { useState, useEffect } from "react";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from "@ionic/react";
import { closeOutline, callOutline } from "ionicons/icons";

interface InvoicePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phone: string) => void;
  initialPhone?: string;
}

export const InvoicePhoneModal: React.FC<InvoicePhoneModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPhone = "",
}) => {
  const [phone, setPhone] = useState<string>(initialPhone);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setPhone(initialPhone || "");
      setError("");
    }
  }, [isOpen, initialPhone]);

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);
    if (error && clean.length === 10) {
      setError("");
    }
  };

  const handleSave = () => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) {
      setError("El número de teléfono debe tener exactamente 10 dígitos.");
      return;
    }
    setError("");
    onConfirm(clean);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{ "--auto-height": "true", "--width": "90%", "--max-width": "420px", "--border-radius": "24px" }}>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span>🧾</span> Datos de Facturación
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} color="dark">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="flex flex-col gap-4 py-2">
          <p className="text-xs text-slate-600 font-medium">
            Ingresa el número de teléfono celular (10 dígitos) del cliente para asociarlo al requerimiento de factura.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IonIcon icon={callOutline} className="text-amber-600 text-sm" />
              Teléfono Celular (10 dígitos)
            </label>
            <div className="relative flex items-center">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Ej. 6621234567"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-mono text-lg font-bold tracking-wider focus:outline-none focus:border-amber-500 transition"
                autoFocus
              />
              <span className="absolute right-3 text-xs font-bold text-slate-400">
                {phone.length}/10
              </span>
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-200">
                ⚠️ {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirmar</span> ➔
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
