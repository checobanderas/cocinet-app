import React from "react";
import { IonModal } from "@ionic/react";

interface OwnerCrudModalProps {
  showOwnerCrudModal: boolean;
  setShowOwnerCrudModal: (show: boolean) => void;
}

export const OwnerCrudModal: React.FC<OwnerCrudModalProps> = ({
  showOwnerCrudModal,
  setShowOwnerCrudModal,
}) => {
  if (!showOwnerCrudModal) return null;

  return (
    <IonModal isOpen={showOwnerCrudModal} onDidDismiss={() => setShowOwnerCrudModal(false)}>
      <div className="p-6">
        <h2 className="text-xl font-bold">Administración de Propietarios</h2>
        <button onClick={() => setShowOwnerCrudModal(false)}>Cerrar</button>
      </div>
    </IonModal>
  );
};
