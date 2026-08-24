import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, backspaceOutline, checkmarkOutline } from 'ionicons/icons';

interface ArqKeyboardModalProps {
  showArqKeyboardModal: boolean;
  setShowArqKeyboardModal: (v: boolean) => void;
  arqKeyboardTarget: any;
  setArqKeyboardTarget: (v: any) => void;
  arqKeyboardValue: any;
  setArqKeyboardValue: (v: any) => void;
  handleArqKeyboardDone: () => void;
}

export const ArqKeyboardModal: React.FC<ArqKeyboardModalProps> = ({
  showArqKeyboardModal,
  setShowArqKeyboardModal,
  arqKeyboardTarget,
  setArqKeyboardTarget,
  arqKeyboardValue,
  setArqKeyboardValue,
  handleArqKeyboardDone
}) => {
  return (
          <IonModal
            isOpen={showArqKeyboardModal}
            onDidDismiss={() => setShowArqKeyboardModal(false)}
            style={{ "--border-radius": "24px" }}
            className="rounded-3xl"
          >
            <div className="flex flex-col bg-slate-900 text-white h-full overflow-y-auto">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧮</span>
                  <div>
                    <h3 className="text-sm font-black text-rose-400 tracking-tight uppercase m-0 p-0">
                      Conteo de Denominación
                    </h3>
                    <p className="text-[12px] text-slate-300 font-bold m-0 p-0 mt-0.5">
                      Ajusta la cantidad de piezas físicas de esta denominación
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArqKeyboardModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none transition"
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                {/* Active Denomination Highlight */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>DENOMINACIÓN SELECCIONADA:</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
                      Modo Híbrido
                    </span>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-3xl">
                      {["1000", "500", "200", "100", "50", "20"].includes(
                        activeExpressDenom,
                      )
                        ? "💵"
                        : "🪙"}
                    </span>
                    <span className="text-2xl font-black text-white tracking-wide">
                      {activeExpressDenom === "0.50"
                        ? "Centavos 50¢"
                        : `$${activeExpressDenom} Pesos`}
                    </span>
                  </div>

                  {/* Quantity Display box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-2 left-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                      Piezas Totales en Cajón
                    </div>
                    <div className="text-4xl font-extrabold text-rose-500 tracking-wider">
                      {(() => {
                        switch (activeExpressDenom) {
                          case "1000":
                            return expressArq1000;
                          case "500":
                            return expressArq500;
                          case "200":
                            return expressArq200;
                          case "100":
                            return expressArq100;
                          case "50":
                            return expressArq50;
                          case "20":
                            return expressArq20;
                          case "10":
                            return expressArqM10;
                          case "5":
                            return expressArqM5;
                          case "2":
                            return expressArqM2;
                          case "1":
                            return expressArqM1;
                          case "0.50":
                            return expressArqM05;
                          default:
                            return "0";
                        }
                      })()}{" "}
                      <span className="text-lg font-bold text-slate-400 uppercase tracking-tight">
                        Pzs
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-bold">
                      Subtotal:{" "}
                      <span className="text-emerald-400 font-extrabold">
                        $
                        {(() => {
                          const valNum = Number(activeExpressDenom);
                          let pieces = 0;
                          switch (activeExpressDenom) {
                            case "1000":
                              pieces = Number(expressArq1000 || 0);
                              break;
                            case "500":
                              pieces = Number(expressArq500 || 0);
                              break;
                            case "200":
                              pieces = Number(expressArq200 || 0);
                              break;
                            case "100":
                              pieces = Number(expressArq100 || 0);
                              break;
                            case "50":
                              pieces = Number(expressArq50 || 0);
                              break;
                            case "20":
                              pieces = Number(expressArq20 || 0);
                              break;
                            case "10":
                              pieces = Number(expressArqM10 || 0);
                              break;
                            case "5":
                              pieces = Number(expressArqM5 || 0);
                              break;
                            case "2":
                              pieces = Number(expressArqM2 || 0);
                              break;
                            case "1":
                              pieces = Number(expressArqM1 || 0);
                              break;
                            case "0.50":
                              pieces = Number(expressArqM05 || 0);
                              break;
                          }
                          return (pieces * valNum).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                          });
                        })()}{" "}
                        MXN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keyboard Container */}
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-2.5 shadow-inner">
                  <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                      (num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleExpressNumericPress(num)}
                          className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                        >
                          {num}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => handleExpressNumericPress("CLEAR")}
                      className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 h-12 rounded-2xl text-xs font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                    >
                      C (Limpiar)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressNumericPress("0")}
                      className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressNumericPress("00")}
                      className="bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-2xl text-sm font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                    >
                      00
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleExpressNumericPress("BACKSPACE")}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 h-11 rounded-2xl text-xs font-black shadow flex items-center justify-center gap-1 active:scale-95 transition-all outline-none border-none cursor-pointer"
                    >
                      <IonIcon
                        icon={backspaceOutline}
                        style={{ fontSize: "14px" }}
                      />
                      Borrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowArqKeyboardModal(false)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-2xl tracking-tight transition active:scale-95 shadow cursor-pointer border-none outline-none text-center"
                    >
                      Listo / Guardar ✓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </IonModal>
  );
};
