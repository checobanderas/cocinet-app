import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ArqueoFormModalProps {
  theoreticalBalance: any;
  instantPhysicalTotal: any;
  handleSaveArqueo: any;
  instantDifference: any;
  showArqueoFormModal: boolean;
  setShowArqueoFormModal: (v: boolean) => void;
  arq100: any;
  arq1000: any;
  arq20: any;
  arq200: any;
  arq50: any;
  arq500: any;
  arqM05: any;
  arqM1: any;
  arqM10: any;
  arqM2: any;
  arqM5: any;
  setArq100: any;
  setArq1000: any;
  setArq20: any;
  setArq200: any;
  setArq50: any;
  setArq500: any;
  setArqM05: any;
  setArqM1: any;
  setArqM10: any;
  setArqM2: any;
  setArqM5: any;
}

export const ArqueoFormModal: React.FC<ArqueoFormModalProps> = ({
  showArqueoFormModal,
  setShowArqueoFormModal,
  arq100, arq1000, arq20, arq200, arq50, arq500, arqM05, arqM1, arqM10, arqM2, arqM5, setArq100, setArq1000, setArq20, setArq200, setArq50, setArq500, setArqM05, setArqM1, setArqM10, setArqM2, setArqM5,
  theoreticalBalance,
  instantPhysicalTotal,
  handleSaveArqueo,
  instantDifference
}) => {
  return (
          <IonModal
            isOpen={showArqueoFormModal}
            onDidDismiss={() => setShowArqueoFormModal(false)}
            className="rounded-3xl"
            style={{ "--border-radius": "24px" }}
          >
            <div className="flex flex-col h-full bg-[#f8fafc]">
              {/* Header */}
              <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧮</span>
                  <div>
                    <h2 className="text-sm font-black tracking-tight">
                      Arqueo de Caja Manual
                    </h2>
                    <p className="text-[12px] text-slate-300">
                      Conteo físico de billetes y monedas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArqueoFormModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none"
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Live balance banner */}
                <div className="bg-blue-600 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg shadow-blue-600/10">
                  <div>
                    <span className="text-[12px] uppercase font-bold tracking-wide opacity-80 block">
                      Saldo en Libro Teórico
                    </span>
                    <span className="text-xl font-bold">
                      ${theoreticalBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] uppercase font-bold tracking-wide opacity-80 block">
                      Total Arqueado Físico
                    </span>
                    <span className="text-xl font-black">
                      ${instantPhysicalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Billetes Card */}
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                      <span>💵</span> Billetes Pesos (MXN)
                    </h4>

                    <div className="space-y-2">
                      {[1000, 500, 200, 100, 50, 20].map((val) => {
                        let currentVal = "";
                        let currentSetter: any;
                        if (val === 1000) {
                          currentVal = arq1000;
                          currentSetter = setArq1000;
                        } else if (val === 500) {
                          currentVal = arq500;
                          currentSetter = setArq500;
                        } else if (val === 200) {
                          currentVal = arq200;
                          currentSetter = setArq200;
                        } else if (val === 100) {
                          currentVal = arq100;
                          currentSetter = setArq100;
                        } else if (val === 50) {
                          currentVal = arq50;
                          currentSetter = setArq50;
                        } else if (val === 20) {
                          currentVal = arq20;
                          currentSetter = setArq20;
                        }

                        const sub = (Number(currentVal) || 0) * val;

                        return (
                          <div
                            key={val}
                            className="flex justify-between items-center gap-3 bg-transparent"
                          >
                            <span className="text-xs font-bold text-slate-600 w-12 text-right">
                              ${val}
                            </span>
                            <span className="text-slate-400 text-xs">x</span>
                            <input
                              type="number"
                              placeholder="0"
                              min="0"
                              value={currentVal}
                              onChange={(e) => currentSetter(e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-200 text-slate-800 text-center text-xs py-1.5 rounded-lg focus:border-indigo-500 outline-none font-bold"
                            />
                            <span className="text-slate-400 text-[12px]">
                              =
                            </span>
                            <span className="text-xs font-bold text-slate-800 w-16 text-right">
                              ${sub.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monedas Card */}
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                      <span>🪙</span> Monedas Pesos (MXN)
                    </h4>

                    <div className="space-y-2">
                      {[10, 5, 2, 1, 0.5].map((val) => {
                        let currentVal = "";
                        let currentSetter: any;
                        if (val === 10) {
                          currentVal = arqM10;
                          currentSetter = setArqM10;
                        } else if (val === 5) {
                          currentVal = arqM5;
                          currentSetter = setArqM5;
                        } else if (val === 2) {
                          currentVal = arqM2;
                          currentSetter = setArqM2;
                        } else if (val === 1) {
                          currentVal = arqM1;
                          currentSetter = setArqM1;
                        } else if (val === 0.5) {
                          currentVal = arqM05;
                          currentSetter = setArqM05;
                        }

                        const sub = (Number(currentVal) || 0) * val;

                        return (
                          <div
                            key={val}
                            className="flex justify-between items-center gap-3 bg-transparent"
                          >
                            <span className="text-xs font-bold text-slate-600 w-12 text-right">
                              ${val.toFixed(2)}
                            </span>
                            <span className="text-slate-400 text-xs">x</span>
                            <input
                              type="number"
                              placeholder="0"
                              min="0"
                              value={currentVal}
                              onChange={(e) => currentSetter(e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-200 text-slate-800 text-center text-xs py-1.5 rounded-lg focus:border-indigo-500 outline-none font-bold"
                            />
                            <span className="text-slate-400 text-[12px]">
                              =
                            </span>
                            <span className="text-xs font-bold text-slate-800 w-16 text-right">
                              ${sub.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Real-time comparison widget */}
                <div
                  className={`p-4 rounded-2.5xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    instantDifference === 0
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : instantDifference > 0
                        ? "bg-blue-50 border-blue-100 text-blue-800"
                        : "bg-rose-50 border-rose-100 text-rose-800"
                  }`}
                >
                  <div className="text-center sm:text-left">
                    <span className="text-[12px] uppercase font-bold tracking-wider block">
                      Balance de Auditoría
                    </span>
                    <h3 className="text-sm font-black flex items-center justify-center sm:justify-start gap-1">
                      {instantDifference === 0 ? (
                        <>✅ Caja Cuadrada ($0.00)</>
                      ) : instantDifference > 0 ? (
                        <>🎉 Sobrante de +${instantDifference.toFixed(2)}</>
                      ) : (
                        <>
                          ⚠️ Faltante de -$
                          {Math.abs(instantDifference).toFixed(2)}
                        </>
                      )}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowArqueoFormModal(false)}
                      className="bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-bold text-[11px] px-4 py-2.5 rounded-xl cursor-pointer transition shadow-sm border-none outline-none"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveArqueo}
                      className={`font-bold text-[11px] px-5 py-2.5 rounded-xl cursor-pointer transition text-white shadow-sm border-none outline-none ${
                        instantDifference === 0
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : instantDifference > 0
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      Registrar Auditoría en Servidor 💾
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </IonModal>
  );
};
