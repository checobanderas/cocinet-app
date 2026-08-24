import React from "react";
import { IonModal } from "@ionic/react";

interface TenantCrudModalProps {
  showTenantCrudModal: boolean;
  setShowTenantCrudModal: (show: boolean) => void;
}

export const TenantCrudModal: React.FC<TenantCrudModalProps> = ({
  showTenantCrudModal,
  setShowTenantCrudModal,
}) => {
  if (!showTenantCrudModal) return null;

  return (
    <IonModal isOpen={showTenantCrudModal} onDidDismiss={() => setShowTenantCrudModal(false)}>
      <div className="p-6">
        <h2 className="text-xl font-bold">Administración de Sucursales</h2>
        <button onClick={() => setShowTenantCrudModal(false)}>Cerrar</button>
      </div>
    </IonModal>
  );
};
