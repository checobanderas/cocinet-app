import { updateCashierSessionInFirebase } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, printOutline } from 'ionicons/icons';

interface TablaArqueoModalProps {
  diferenciaCaja: any;
  tablaArqueoTotalBilletes: any;
  estimatedCashInBox: any;
  tablaArqueoTotalMonedas: any;
  tablaArqueoTotal: any;
  sessionToRender: any;
  showTablaArqueoModal: boolean;
  setShowTablaArqueoModal: (v: boolean) => void;
  activeTablaDenom: any;
  arqueoBilletes: any;
  arqueoMonedas: any;
  arqueoTotal: any;
  estimatedCash: any;
  setActiveTablaDenom: any;
  setShowTablaKeypadOverlay: any;
  setTablaArq100: any;
  setTablaArq1000: any;
  setTablaArq20: any;
  setTablaArq200: any;
  setTablaArq50: any;
  setTablaArq500: any;
  setTablaArqM05: any;
  setTablaArqM1: any;
  setTablaArqM10: any;
  setTablaArqM2: any;
  setTablaArqM5: any;
  showTablaKeypadOverlay: any;
  tablaArq100: any;
  tablaArq1000: any;
  tablaArq20: any;
  tablaArq200: any;
  tablaArq50: any;
  tablaArq500: any;
  tablaArqM05: any;
  tablaArqM1: any;
  tablaArqM10: any;
  tablaArqM2: any;
  tablaArqM5: any;
  triggerAppNotification: any;
}

export const TablaArqueoModal: React.FC<TablaArqueoModalProps> = ({
  showTablaArqueoModal,
  setShowTablaArqueoModal,
  activeTablaDenom, arqueoBilletes, arqueoMonedas, arqueoTotal, estimatedCash, setActiveTablaDenom, setShowTablaKeypadOverlay, setTablaArq100, setTablaArq1000, setTablaArq20, setTablaArq200, setTablaArq50, setTablaArq500, setTablaArqM05, setTablaArqM1, setTablaArqM10, setTablaArqM2, setTablaArqM5, showTablaKeypadOverlay, tablaArq100, tablaArq1000, tablaArq20, tablaArq200, tablaArq50, tablaArq500, tablaArqM05, tablaArqM1, tablaArqM10, tablaArqM2, tablaArqM5, triggerAppNotification,
  diferenciaCaja,
  tablaArqueoTotalBilletes,
  estimatedCashInBox,
  tablaArqueoTotalMonedas,
  tablaArqueoTotal,
  sessionToRender
}) => {
  return (
          <IonModal
            isOpen={showTablaArqueoModal}
            onDidDismiss={() => setShowTablaArqueoModal(false)}
            style={{ "--height": "auto", "--max-height": "95%", "--width": "95%", "--max-width": "1100px", "--border-radius": "24px" }}
          >
            {(() => {
              const billsList = [
                { id: "1000", label: "1000", val: tablaArq1000, setter: setTablaArq1000, mul: 1000 },
                { id: "500", label: "500", val: tablaArq500, setter: setTablaArq500, mul: 500 },
                { id: "200", label: "200", val: tablaArq200, setter: setTablaArq200, mul: 200 },
                { id: "100", label: "100", val: tablaArq100, setter: setTablaArq100, mul: 100 },
                { id: "50", label: "50", val: tablaArq50, setter: setTablaArq50, mul: 50 },
                { id: "20", label: "20", val: tablaArq20, setter: setTablaArq20, mul: 20 },
              ];

              const coinsList = [
                { id: "M10", label: "10", val: tablaArqM10, setter: setTablaArqM10, mul: 10 },
                { id: "M5", label: "5", val: tablaArqM5, setter: setTablaArqM5, mul: 5 },
                { id: "M2", label: "2", val: tablaArqM2, setter: setTablaArqM2, mul: 2 },
                { id: "M1", label: "1", val: tablaArqM1, setter: setTablaArqM1, mul: 1 },
                { id: "M05", label: "0.50", val: tablaArqM05, setter: setTablaArqM05, mul: 0.5 },
              ];

              const allDenoms = [...billsList, ...coinsList];
              const activeItem = allDenoms.find((d) => d.id === activeTablaDenom) || billsList[0];

              const handleKeypadTap = (key: string) => {
                let currentValStr = String(activeItem.val);
                if (currentValStr === "undefined" || currentValStr === "null") {
                  currentValStr = "0";
                }

                if (key === "CLEAR") {
                  activeItem.setter("0");
                } else if (key === "BACK") {
                  if (currentValStr.length <= 1) {
                    activeItem.setter("0");
                  } else {
                    activeItem.setter(currentValStr.slice(0, -1));
                  }
                } else if (key === "+1") {
                  const num = parseInt(currentValStr) || 0;
                  activeItem.setter(String(num + 1));
                } else if (key === "-1") {
                  const num = parseInt(currentValStr) || 0;
                  activeItem.setter(String(Math.max(0, num - 1)));
                } else {
                  // Digit input
                  if (currentValStr === "0") {
                    activeItem.setter(key);
                  } else {
                    activeItem.setter(currentValStr + key);
                  }
                }
              };

              const handleNextDenom = () => {
                const idx = allDenoms.findIndex((d) => d.id === activeTablaDenom);
                if (idx !== -1 && idx < allDenoms.length - 1) {
                  setActiveTablaDenom(allDenoms[idx + 1].id);
                }
              };

              const handlePrevDenom = () => {
                const idx = allDenoms.findIndex((d) => d.id === activeTablaDenom);
                if (idx > 0) {
                  setActiveTablaDenom(allDenoms[idx - 1].id);
                }
              };

              return (
                <div className="p-6 bg-slate-50 min-h-full flex flex-col font-sans">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200">
                    <div>
                      <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                        <span>🧮</span> Calculadora de Arqueo Físico
                      </h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Sincronización de conteo monetario real en MySQL
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTablaArqueoModal(false)}
                      className="p-2 border border-slate-200 rounded-xl bg-white text-slate-400 hover:text-slate-600 shadow-sm transition hover:scale-105 cursor-pointer"
                    >
                      <IonIcon icon={closeOutline} className="text-xl" />
                    </button>
                  </div>

                  {/* Body grid: Responsive split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 items-stretch overflow-y-auto max-h-[65vh]">
                    {/* Billetes Section (half width) */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                          <h3 className="font-bold text-indigo-950 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>💵</span> Billetes
                          </h3>
                          <span className="text-xs bg-emerald-50 text-emerald-700 font-black px-2.5 py-1 rounded-lg">
                            ${tablaArqueoTotalBilletes.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {billsList.map((item) => {
                            const isCurrent = activeTablaDenom === item.id;
                            const itemTotal = (parseInt(item.val) || 0) * item.mul;
                            return (
                              <div
                                key={`billete-${item.label}`}
                                onClick={() => {
                                  setActiveTablaDenom(item.id);
                                  setShowTablaKeypadOverlay(true);
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-indigo-50 border-indigo-400 shadow-sm ring-2 ring-indigo-100"
                                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-700 w-12 text-right">
                                    ${item.label}
                                  </span>
                                  <span className="text-[12px] text-slate-400 font-black">X</span>
                                  <input
                                    type="text"
                                    inputMode="none"
                                    readOnly
                                    value={item.val}
                                    className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-xs outline-none select-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTablaDenom(item.id);
                                      setShowTablaKeypadOverlay(true);
                                    }}
                                    className={`flex items-center justify-center w-7 h-7 rounded-lg border text-xs transition-all ${
                                      isCurrent
                                        ? "bg-indigo-600 border-indigo-600 text-white font-extrabold"
                                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                                    }`}
                                    title="Abrir Teclado"
                                  >
                                    🔢
                                  </button>
                                </div>
                                <span className="text-xs font-black text-slate-500 font-mono">
                                  ${itemTotal.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                        <span>Total en Billetes:</span>
                        <span className="text-indigo-950">${tablaArqueoTotalBilletes.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Monedas Section (half width) */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                          <h3 className="font-bold text-indigo-950 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>🪙</span> Monedas
                          </h3>
                          <span className="text-xs bg-emerald-50 text-emerald-700 font-black px-2.5 py-1 rounded-lg">
                            ${tablaArqueoTotalMonedas.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {coinsList.map((item) => {
                            const isCurrent = activeTablaDenom === item.id;
                            const itemTotal = (parseFloat(item.val) || 0) * item.mul;
                            return (
                              <div
                                key={`moneda-${item.label}`}
                                onClick={() => {
                                  setActiveTablaDenom(item.id);
                                  setShowTablaKeypadOverlay(true);
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-indigo-50 border-indigo-400 shadow-sm ring-2 ring-indigo-100"
                                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-700 w-12 text-right">
                                    ${item.label}
                                  </span>
                                  <span className="text-[12px] text-slate-400 font-black">X</span>
                                  <input
                                    type="text"
                                    inputMode="none"
                                    readOnly
                                    value={item.val}
                                    className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-xs outline-none select-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTablaDenom(item.id);
                                      setShowTablaKeypadOverlay(true);
                                    }}
                                    className={`flex items-center justify-center w-7 h-7 rounded-lg border text-xs transition-all ${
                                      isCurrent
                                        ? "bg-indigo-600 border-indigo-600 text-white font-extrabold"
                                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                                    }`}
                                    title="Abrir Teclado"
                                  >
                                    🔢
                                  </button>
                                </div>
                                <span className="text-xs font-black text-slate-500 font-mono">
                                  ${itemTotal.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                        <span>Total en Monedas:</span>
                        <span className="text-indigo-950">${tablaArqueoTotalMonedas.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 🧮 GORGEOUS FLOAT-ON-TOP OVERLAY NUMERIC KEYPAD */}
                  {showTablaKeypadOverlay && (
                    <div 
                      className="fixed inset-0 z-[2500] flex items-end sm:items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs transition-all duration-300"
                      onClick={() => setShowTablaKeypadOverlay(false)}
                    >
                      <div 
                        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden transform scale-100 transition-all duration-300 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Overlay Header */}
                        <div className="bg-gradient-to-r from-indigo-950 to-indigo-900 text-white p-5 text-center relative">
                          <button
                            type="button"
                            onClick={() => setShowTablaKeypadOverlay(false)}
                            className="absolute right-4 top-4 p-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-850/80 text-indigo-200 hover:text-white transition cursor-pointer border-none"
                            title="Cerrar"
                          >
                            <IonIcon icon={closeOutline} className="text-lg" />
                          </button>
                          <span className="text-[12px] uppercase font-bold tracking-widest text-indigo-300 block mb-1">
                            INGRESANDO CANTIDAD
                          </span>
                          <span className="text-lg font-black flex items-center justify-center gap-1.5">
                            {activeItem.id.startsWith("M") ? "🪙" : "💵"} ${activeItem.label} {activeItem.id.startsWith("M") ? "Moneda" : "Billete"}
                          </span>
                          <div className="bg-indigo-950/70 border border-indigo-900 font-mono text-2xl font-black mt-3 py-1 px-5 rounded-2xl text-emerald-400 inline-block shadow-inner">
                            {activeItem.val || "0"} <span className="text-xs text-indigo-300 font-sans">pzas</span>
                          </div>
                        </div>

                        {/* Keypad Buttons */}
                        <div className="p-5 bg-slate-50">
                          <div className="grid grid-cols-3 gap-2.5">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "00"].map((num) => (
                              <button
                                key={`overlay-key-num-${num}`}
                                type="button"
                                onClick={() => handleKeypadTap(num)}
                                className="bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-black py-4 rounded-xl border border-slate-200 shadow-sm active:scale-95 transition text-lg cursor-pointer select-none"
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleKeypadTap("BACK")}
                              className="bg-amber-100 hover:bg-amber-105 text-amber-800 font-black py-4 rounded-xl shadow-sm active:scale-95 transition text-base flex items-center justify-center cursor-pointer border-none"
                              title="Borrar"
                            >
                              <span>⌫</span>
                            </button>
                          </div>

                          {/* Quick Adjustments Row */}
                          <div className="grid grid-cols-3 gap-2.5 mt-2.5">
                            <button
                              type="button"
                              onClick={() => handleKeypadTap("-1")}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-black py-3.5 rounded-xl border border-red-100 active:scale-95 transition text-xs cursor-pointer"
                            >
                              -1 pza
                            </button>
                            <button
                              type="button"
                              onClick={() => handleKeypadTap("+1")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black py-3.5 rounded-xl border border-emerald-100 active:scale-95 transition text-xs cursor-pointer"
                            >
                              +1 pza
                            </button>
                            <button
                              type="button"
                              onClick={() => handleKeypadTap("CLEAR")}
                              className="bg-slate-200 hover:bg-slate-250 text-slate-700 font-black py-3.5 rounded-xl border border-slate-300 active:scale-95 transition text-xs cursor-pointer"
                            >
                              Limpiar
                            </button>
                          </div>

                          {/* Navigation & Done Action Row */}
                          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={handlePrevDenom}
                              className="bg-white hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl border border-slate-200 shadow-xs active:scale-95 transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Anter. ⬆️</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleNextDenom}
                              className="bg-white hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl border border-slate-200 shadow-xs active:scale-95 transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Sigu. ⬇️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTablaKeypadOverlay(false)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition text-xs flex items-center justify-center border-none cursor-pointer"
                            >
                              <span>Listo ✅</span>
                            </button>
                          </div>

                          {/* Real-time sum ticker inside the keypad */}
                          <div className="mt-4 bg-indigo-50 border border-indigo-100/60 py-2.5 px-4 rounded-xl text-center self-center shadow-inner">
                            <span className="text-[12px] font-bold text-indigo-500 block mb-0.5 uppercase tracking-wider">Subtotal Conteo</span>
                            <span className="text-lg font-black text-indigo-950 font-mono">${tablaArqueoTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Totals and Action footer */}
                  <div className="absolute bottom-0 left-0 w-full p-5 bg-white border-t border-slate-200 shadow-t rounded-b-[24px]">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      {/* Separate totals summary badge list */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                          Billetes: <b className="text-slate-800 font-black">${tablaArqueoTotalBilletes.toFixed(2)}</b>
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                          Monedas: <b className="text-slate-800 font-black">${tablaArqueoTotalMonedas.toFixed(2)}</b>
                        </span>
                        <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-100">
                          Suma Total: <b className="text-indigo-800 font-black">${tablaArqueoTotal.toFixed(2)}</b>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            // Quick clear all
                            allDenoms.forEach((d) => d.setter("0"));
                          }}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase transition border-none cursor-pointer"
                        >
                          Reiniciar Todo
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              if (sessionToRender) {
                                await updateCashierSessionInFirebase(
                                  sessionToRender.id,
                                  {
                                    ...sessionToRender,
                                    arqueoTotal: tablaArqueoTotal,
                                    arqueoBilletes: tablaArqueoTotalBilletes,
                                    arqueoMonedas: tablaArqueoTotalMonedas,
                                    estimatedCash: estimatedCashInBox,
                                    diferencia: diferenciaCaja,
                                  }
                                );
                                triggerAppNotification("Arqueo 📊", "Conteo físico guardado correctamente. ✅", "success");
                              }
                            } catch (err) {
                              console.error("Error saving physical count:", err);
                              triggerAppNotification("Error", "No se pudo guardar el conteo físico", "warning");
                            }
                            setShowTablaArqueoModal(false);
                          }}
                          className="flex-1 sm:flex-initial px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition border-none cursor-pointer"
                          style={{ backgroundColor: "#4f46e5" }}
                        >
                          Guardar Conteo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </IonModal>
  );
};
