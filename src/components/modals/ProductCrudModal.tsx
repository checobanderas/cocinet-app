import React from "react";
import { IonModal } from "@ionic/react";

interface ProductCrudModalProps {
  showProductCrudModal: boolean;
  setShowProductCrudModal: (show: boolean) => void;
}

export const ProductCrudModal: React.FC<ProductCrudModalProps> = ({
  showProductCrudModal,
  setShowProductCrudModal,
}) => {
  if (!showProductCrudModal) return null;

  return (
    <IonModal isOpen={showProductCrudModal} onDidDismiss={() => setShowProductCrudModal(false)}>
      <div className="p-6">
        <h2 className="text-xl font-bold">Crear / Editar Producto</h2>
        <button onClick={() => setShowProductCrudModal(false)}>Cerrar</button>
      </div>
    </IonModal>
  );
};
