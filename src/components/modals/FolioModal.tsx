import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface FolioModalProps {
  showFolioModal: boolean;
  setShowFolioModal: (v: boolean) => void;
  // Let's add any props passed in
  currentFolio: any;
  setCurrentFolio: (v: any) => void;
  currentFolioPrefix: any;
  setCurrentFolioPrefix: (v: any) => void;
  handleSaveFolioChanges: () => void;
}

export const FolioModal: React.FC<FolioModalProps> = ({
  showFolioModal,
  setShowFolioModal,
  currentFolio,
  setCurrentFolio,
  currentFolioPrefix,
  setCurrentFolioPrefix,
  handleSaveFolioChanges
}) => {
  return (
      <IonModal
        isOpen={showFolioModal}
        onDidDismiss={() => {
          setShowFolioModal(false);
          setFolioModalError(null);
        }}
        style={{ "--height": "auto", "--max-height": "90vh", "--border-radius": "24px" }}
      >
        <div className="p-6 bg-slate-900 text-white rounded-3xl max-w-md mx-auto shadow-2xl border border-slate-800 w-full">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <span>📋</span> Captura de Folio Interno
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sucursal: <strong className="text-slate-200">{selectedTenant?.name || "General"}</strong>
              </p>
            </div>
            <button
              onClick={() => {
                setShowFolioModal(false);
                setFolioModalError(null);
              }}
              className="text-slate-400 hover:text-white p-2 text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <div className="my-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs flex justify-between items-center">
            <span className="text-slate-400">Último folio registrado:</span>
            <strong className="text-emerald-400 font-mono text-sm ml-1">
              {suggestedLastFolio ? `#${suggestedLastFolio}` : "Sin folios previos"}
            </strong>
          </div>

          {folioModalError && (
            <div className="mb-4 p-3 bg-red-950/90 border border-red-500/80 text-red-200 text-xs rounded-xl flex items-start gap-2 font-medium">
              <span className="text-base">⚠️</span>
              <div className="flex-1">{folioModalError}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold mb-2">
                {folioStep === 1 ? "Paso 1 de 2: Ingrese Folio" : "Paso 2 de 2: Confirme el Folio"}
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-3">
                {folioStep === 1
                  ? "Escribe el folio interno y presiona ENTER ↵"
                  : `Vuelve a escribir el folio y presiona ENTER ↵`}
              </p>

              <input
                ref={folioInputRef}
                type="text"
                value={folioInputValue}
                disabled={isGeneratingOrder}
                onChange={(e) => {
                  setFolioInputValue(e.target.value);
                  if (folioModalError) setFolioModalError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!isGeneratingOrder) handleFolioStepSubmit();
                  }
                }}
                placeholder={folioStep === 1 ? "Ingresa folio (ej: 105)" : "Confirma el folio"}
                className="w-full bg-slate-900 border-2 border-emerald-500 focus:border-amber-400 rounded-xl px-4 py-3 text-2xl text-center font-mono font-bold text-white outline-none transition-all placeholder:text-slate-600 placeholder:text-base disabled:opacity-50"
                autoFocus
              />
              <span className="block text-[11px] text-slate-500 mt-2 font-medium">
                ⏎ Presiona ENTER para {folioStep === 1 ? "continuar" : "enviar comanda"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={isGeneratingOrder}
              onClick={() => {
                setShowFolioModal(false);
                setFolioModalError(null);
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              disabled={isGeneratingOrder}
              onClick={handleFolioStepSubmit}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {isGeneratingOrder
                  ? "Procesando..."
                  : folioStep === 1
                    ? "Siguiente ➔"
                    : "Confirmar y Enviar 🍳"}
              </span>
            </button>
          </div>
        </div>
      </IonModal>
  );
};
