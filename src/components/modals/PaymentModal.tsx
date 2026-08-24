import React from "react";
import { IonModal } from "@ionic/react";

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  // This is a placeholder indicating that in the actual implementation,
  // this modal requires many props (total, handlePayment, selectedMethod, etc.)
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
}) => {
  if (!showPaymentModal) return null;

  return (
    <IonModal
      isOpen={showPaymentModal}
      onDidDismiss={() => setShowPaymentModal(false)}
      style={{
        "--height": "auto",
        "--max-height": "90vh",
        "--width": "100%",
        "--border-radius": "24px",
      }}
    >
      <div className="p-6 bg-slate-900 text-white rounded-t-3xl shadow-xl h-full flex flex-col">
        {/* Component extracted. In a full implementation, all the logic for
            cash, credit card, and exact amount calculations will live here. */}
        <h2 className="text-xl font-bold mb-4">Módulo de Cobro</h2>
        <p className="text-slate-400">Contenido extraído temporalmente para ilustrar Code Splitting.</p>
        <button 
          className="mt-4 bg-slate-800 p-3 rounded-lg"
          onClick={() => setShowPaymentModal(false)}
        >
          Cerrar
        </button>
      </div>
    </IonModal>
  );
};
