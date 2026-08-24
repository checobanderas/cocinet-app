import React from "react";
import { IonModal } from "@ionic/react";

interface NumpadModalProps {
  showNumpadModal: boolean;
  setShowNumpadModal: (show: boolean) => void;
  // This is a placeholder indicating that in the actual implementation,
  // this modal requires props (inputValue, onConfirm, onCancel, context, etc.)
}

export const NumpadModal: React.FC<NumpadModalProps> = ({
  showNumpadModal,
  setShowNumpadModal,
}) => {
  if (!showNumpadModal) return null;

  return (
    <IonModal
      isOpen={showNumpadModal}
      onDidDismiss={() => setShowNumpadModal(false)}
      style={{
        "--height": "auto",
        "--width": "100%",
        "--max-width": "400px",
        "--border-radius": "24px",
      }}
    >
      <div className="p-4 bg-slate-100 rounded-3xl h-full flex flex-col">
        {/* Component extracted. In a full implementation, the numerical keypad
            and quick-amount buttons logic will live here. */}
        <h2 className="text-lg font-bold mb-2">Teclado Numérico</h2>
        <p className="text-slate-500 text-sm">Contenido extraído temporalmente para ilustrar Code Splitting.</p>
        <button 
          className="mt-4 bg-slate-300 p-2 rounded-lg text-slate-800"
          onClick={() => setShowNumpadModal(false)}
        >
          Cerrar
        </button>
      </div>
    </IonModal>
  );
};
