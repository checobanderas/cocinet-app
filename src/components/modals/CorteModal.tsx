import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface CorteModalProps {
  showCorteModal: boolean;
  setShowCorteModal: (v: boolean) => void;
  corteData: any;
}

export const CorteModal: React.FC<CorteModalProps> = ({
  showCorteModal,
  setShowCorteModal,
  corteData
}) => {
  return (
          <IonModal
            isOpen={showCorteModal}
            onDidDismiss={() => setShowCorteModal(false)}
            style={{
              "--width": "90%",
              "--height": "85%",
              "--max-width": "750px",
              "--border-radius": "24px",
            }}
          >
            <IonHeader>
              <IonToolbar
                style={{
                  "--background": "rgb(30, 41, 59)",
                  "--color": "white",
                }}
              >
                <IonTitle style={{ fontWeight: "bold" }}>
                  🔐 Arqueo e Impresión de Corte Oficial
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton
                    onClick={() => setShowCorteModal(false)}
                    style={{ fontWeight: "bold", color: "white" }}
                  >
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>

            <IonContent
              className="ion-padding"
              style={{ "--background": "#f8fafc" }}
            >
              <div className="space-y-6">
                {/* Resumen Esperado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                    <div className="text-emerald-700 text-[11px] font-black uppercase tracking-widest">
                      Esperado en Efectivo 💵
                    </div>
                    <div className="text-xl font-black text-emerald-800 mt-1">
                      ${corteData.cashSales.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                    <div className="text-blue-700 text-[11px] font-black uppercase tracking-widest">
                      Esperado en Tarjetas 💳
                    </div>
                    <div className="text-xl font-black text-blue-800 mt-1">
                      ${corteData.cardSales.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
                    <div className="text-indigo-700 text-[11px] font-black uppercase tracking-widest">
                      Esperado en Transferencias 📲
                    </div>
                    <div className="text-xl font-black text-indigo-800 mt-1">
                      ${corteData.transSales.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Arqueo Grid */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      💵
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">
                        Conteo de Efectivo Físico
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Introduzca la cantidad física de billetes y monedas que
                        hay en el cajón de manera precisa.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { l: "$1000 pesos", k: "b1000", m: 1000 },
                      { l: "$500 pesos", k: "b500", m: 500 },
                      { l: "$200 pesos", k: "b200", m: 200 },
                      { l: "$100 pesos", k: "b100", m: 100 },
                      { l: "$50 pesos", k: "b50", m: 50 },
                      { l: "$20 pesos", k: "b20", m: 20 },
                      { l: "Moneda $20", k: "m20", m: 20 },
                      { l: "Moneda $10", k: "m10", m: 10 },
                      { l: "Moneda $5", k: "m5", m: 5 },
                      { l: "Moneda $2", k: "m2", m: 2 },
                      { l: "Moneda $1", k: "m1", m: 1 },
                      { l: "Moneda 50¢", k: "m05", m: 0.5 },
                    ].map((d) => (
                      <div
                        key={d.k}
                        className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col justify-between"
                      >
                        <span className="text-[12px] font-bold text-slate-500 mb-1">
                          {d.l}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-xs font-bold">
                            x
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={
                              (efectivoCount as any)[d.k] === 0
                                ? ""
                                : (efectivoCount as any)[d.k]
                            }
                            onChange={(e) =>
                              setEfectivoCount({
                                ...efectivoCount,
                                [d.k]: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[13px] text-right font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conciliación Resumen Interno */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner flex flex-col sm:flex-row justify-between items-stretch gap-4">
                  <div className="flex-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-800 pb-4 sm:pb-0 sm:pr-4">
                    <div className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">
                      Total Físico Contado
                    </div>
                    <div className="text-3xl font-black text-sky-400 mt-1">
                      ${totalArqueo.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">
                      Diferencia Contra Esperado
                    </div>
                    {totalArqueo === 0 ? (
                      <div className="text-[13px] text-slate-400 italic mt-1.5 font-semibold">
                        Introduzca el arqueo para calcular.
                      </div>
                    ) : (totalArqueo - corteData.cashSales).toFixed(2) ===
                        "0.00" ||
                      (totalArqueo - corteData.cashSales).toFixed(2) ===
                        "-0.00" ? (
                      <div className="text-emerald-400 font-black text-xl mt-1 flex items-center gap-1.5">
                        <span>Exacto ✅</span>
                        <span className="text-[13px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400">
                          ($0.00)
                        </span>
                      </div>
                    ) : totalArqueo - corteData.cashSales > 0 ? (
                      <div className="text-cyan-400 font-black text-xl mt-1 flex flex-col">
                        <span className="flex items-center gap-1.5">
                          Sobrante 📈
                        </span>
                        <span className="text-[13px] font-bold text-slate-300 mt-1">
                          +${(totalArqueo - corteData.cashSales).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-rose-400 font-black text-xl mt-1 flex flex-col">
                        <span className="flex items-center gap-1.5">
                          Faltante 📉
                        </span>
                        <span className="text-[13px] font-bold text-slate-300 mt-1">
                          -${(corteData.cashSales - totalArqueo).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Ticket */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePrintCorte}
                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-[13px] transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <IonIcon icon={printOutline} />
                    Imprimir Ticket de Cierre 🖨️
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCorteReport}
                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-[13px] transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <IonIcon icon={cloudUploadOutline} />
                    Descargar Reporte PDF 📥
                  </button>
                </div>

                {/* Advertencia Crítica */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900">
                  <div className="text-xl">⚠️</div>
                  <div className="space-y-1">
                    <h4 className="text-[13px] font-black uppercase tracking-wider">
                      Confirmación de Cierre de Caja
                    </h4>
                    <p className="text-[12px] text-amber-800 font-medium leading-relaxed">
                      Al confirmar el corte, se guardará el registro conciliado
                      con las diferencias calculadas, se imprimirán los tickets
                      correspondientes, y se reiniciarán las cuentas activas
                      para comenzar el siguiente turno operativo. Esta acción no
                      se puede deshacer.
                    </p>
                  </div>
                </div>

                {/* Acción de Envío */}
                <button
                  type="button"
                  onClick={() => setShowResetSalesConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-red-600/10 text-sm flex items-center justify-center gap-2 mt-4"
                >
                  <IonIcon icon={lockClosedOutline} />
                  Registrar Corte Oficial y Cerrar Turno 💾 🔒
                </button>
              </div>
            </IonContent>
          </IonModal>
  );
};
