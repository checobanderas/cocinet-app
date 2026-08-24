import React from "react";
import { IonModal } from "@ionic/react";

interface FolioModalProps {
  showFolioModal: boolean;
  setShowFolioModal: (show: boolean) => void;
}

export const FolioModal: React.FC<FolioModalProps> = ({
  showFolioModal,
  setShowFolioModal,
}) => {
  if (!showFolioModal) return null;

  return (
    <IonModal isOpen={showFolioModal} onDidDismiss={() => setShowFolioModal(false)}>
      <div className="p-6">
        <h2 className="text-xl font-bold">Capturar Folio Interno</h2>
        <button onClick={() => setShowFolioModal(false)}>Cerrar</button>
      </div>
    </IonModal>
  );
};
