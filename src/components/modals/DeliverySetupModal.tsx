import React from "react";
import { IonModal } from "@ionic/react";

interface DeliverySetupModalProps {
  showDeliverySetupModal: boolean;
  setShowDeliverySetupModal: (show: boolean) => void;
  // Props omitted for brevity in architectural demo
}

export const DeliverySetupModal: React.FC<DeliverySetupModalProps> = ({
  showDeliverySetupModal,
  setShowDeliverySetupModal,
}) => {
  if (!showDeliverySetupModal) return null;

  return (
    <IonModal
      isOpen={showDeliverySetupModal}
      onDidDismiss={() => setShowDeliverySetupModal(false)}
      style={{
        "--height": "auto",
        "--max-height": "94vh",
        "--width": "100%",
        "--max-width": "720px",
        "--border-radius": "24px",
      }}
    >
      <div className="p-6 bg-white space-y-5 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold">Configuración de Envío a Domicilio</h2>
        <p>Contenido extraído temporalmente para ilustrar Code Splitting.</p>
        <button onClick={() => setShowDeliverySetupModal(false)}>Cerrar</button>
      </div>
    </IonModal>
  );
};
