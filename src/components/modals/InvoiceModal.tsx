import React from "react";
import { IonModal } from "@ionic/react";

interface InvoiceModalProps {
  showInvoiceModal: boolean;
  setShowInvoiceModal: (show: boolean) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  showInvoiceModal,
  setShowInvoiceModal
}) => {
  if (!showInvoiceModal) return null;

  return (
    <IonModal isOpen={showInvoiceModal} onDidDismiss={() => setShowInvoiceModal(false)}>
      <div className="p-6">
        <h2 className="text-xl font-bold">Solicitar Factura (Celular)</h2>
        <button onClick={() => setShowInvoiceModal(false)}>Cerrar</button>
      </div>
    </IonModal>
  );
};
