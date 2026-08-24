import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, trashOutline } from 'ionicons/icons';

interface ItemNoteModalProps {
  itemToNote: any;
  setItemToNote: (v: any) => void;
}

export const ItemNoteModal: React.FC<ItemNoteModalProps> = ({
  itemToNote,
  setItemToNote
}) => {
  return (
              <IonModal
                isOpen={itemToNote !== null}
                onDidDismiss={() => setItemToNote(null)}
                initialBreakpoint={1}
                breakpoints={[0, 1]}
                className="auto-height-modal"
                style={{
                  "--height": "auto",
                  "--border-radius": "24px 24px 0 0",
                  "--box-shadow": "0 -10px 40px rgba(0,0,0,0.15)",
                }}
              >
                <div className="p-5 flex flex-col bg-[#282d34] text-white">
                  {/* Sheet Handle */}
                  <div
                    style={{
                      width: "40px",
                      height: "4px",
                      background: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "2px",
                      margin: "0 auto 12px auto",
                    }}
                  />

                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-black text-white">
                      Nota del Producto
                    </span>
                    <button
                      type="button"
                      onClick={() => setItemToNote(null)}
                      className="bg-transparent text-slate-300 hover:text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer border-none outline-none"
                    >
                      CANCELAR
                    </button>
                  </div>

                  {/* Subtitle / Product description */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-300 font-medium m-0 p-0">
                      Personaliza este producto (ej: sin cebolla, poco picante):
                    </p>
                    {noteProduct && (
                      <p className="text-xs font-black text-amber-400 mt-1 mb-0">
                        {noteProduct.name} (Comensal {itemToNote?.plate})
                      </p>
                    )}
                  </div>

                  {/* Suggestions (quickNotes) */}
                  {noteProduct?.quickNotes && noteProduct.quickNotes.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                        Notas sugeridas:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {noteProduct.quickNotes.map((note) => (
                          <button
                            key={note}
                            type="button"
                            onClick={() => {
                              setTempNote(prev => {
                                const trimmed = prev.trim();
                                if (!trimmed) return note;
                                if (trimmed.endsWith(",") || trimmed.endsWith(".")) return `${trimmed} ${note}`;
                                return `${trimmed}, ${note}`;
                              });
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer"
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="relative mb-4">
                    <textarea
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="Escribe aquí..."
                      className="w-full p-4 border border-slate-350 rounded-2xl text-sm focus:border-blue-500 outline-none resize-none pr-12 font-semibold"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#0f172a",
                      }}
                      rows={4}
                    />
                    {isOnline && (
                      <button
                        type="button"
                        onClick={toggleNoteVoiceRecognition}
                        className={`absolute right-3 bottom-4 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition active:scale-95 shadow ${
                          isListeningNote
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                        style={{ zIndex: 10 }}
                      >
                        <IonIcon
                          icon={isListeningNote ? stopCircleOutline || closeOutline : micOutline}
                          style={{ fontSize: "18px" }}
                        />
                      </button>
                    )}
                  </div>

                  {/* Footer Save Button */}
                  <button
                    type="button"
                    onClick={saveItemNote}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer border-none outline-none text-center shadow-lg active:scale-98"
                    style={{ backgroundColor: "#2563eb" }}
                  >
                    GUARDAR NOTA
                  </button>
                </div>
              </IonModal>
  );
};
