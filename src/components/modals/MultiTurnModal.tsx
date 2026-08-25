import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { closeOutline, downloadOutline } from 'ionicons/icons';

interface MultiTurnModalProps {
  totalCashSum: any;
  totalCardSum: any;
  handleExportMultiTurnWhatsApp: any;
  enhancedMultiTurnRecords: any;
  totalTransferSum: any;
  totalMultiTurnSum: any;
  handleExportMultiTurnExcel: any;
  sortedShiftKeys: any;
  showMultiTurnModal: boolean;
  setShowMultiTurnModal: (v: boolean) => void;
  multiTurnData: any;
  selectedMultiTurnDate: string;
  setSelectedMultiTurnDate: (v: string) => void;
  handleExportMultiTurnCSV?: () => void;
  multiTurnEndDate: any;
  multiTurnPreviewReady: any;
  multiTurnStartDate: any;
  selectedTenant: any;
  setMultiTurnEndDate: any;
  setMultiTurnPreviewReady: any;
  setMultiTurnStartDate: any;
}

export const MultiTurnModal: React.FC<MultiTurnModalProps> = ({
  showMultiTurnModal,
  setShowMultiTurnModal,
  multiTurnData,
  selectedMultiTurnDate,
  setSelectedMultiTurnDate,
  handleExportMultiTurnCSV,
  multiTurnEndDate, multiTurnPreviewReady, multiTurnStartDate, selectedTenant, setMultiTurnEndDate, setMultiTurnPreviewReady, setMultiTurnStartDate,
  totalCashSum,
  totalCardSum,
  handleExportMultiTurnWhatsApp,
  enhancedMultiTurnRecords,
  totalTransferSum,
  totalMultiTurnSum,
  handleExportMultiTurnExcel,
  sortedShiftKeys
}) => {
  const renderMultiTurnModal = () => (
      <IonModal
        isOpen={showMultiTurnModal}
        onDidDismiss={() => setShowMultiTurnModal(false)}
        style={{
          "--height": "auto",
          "--max-height": "90vh",
          "--width": "100%",
          "--max-width": "850px",
          "--border-radius": "24px",
        }}
      >
        <div className="p-6 bg-white space-y-5 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between border-b pb-3 print:hidden">
            <h2 className="text-xl font-black text-amber-700 flex items-center gap-2">
              <span>📑</span> Reporte Multi-Turnos
            </h2>
            <button
              onClick={() => setShowMultiTurnModal(false)}
              className="text-stone-400 hover:text-rose-500 font-bold transition text-2xl"
            >
              ×
            </button>
          </div>

          {!multiTurnPreviewReady ? (
            <div className="space-y-5 print:hidden">
              <p className="text-sm text-stone-600 font-bold">
                Selecciona el rango de turnos que deseas incluir en el reporte:
              </p>
              
              <div className="flex flex-col gap-4 bg-stone-50 p-5 rounded-2xl border-2 border-stone-200">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider">Desde el Turno:</label>
                  <select
                    value={multiTurnStartDate}
                    onChange={(e) => setMultiTurnStartDate(e.target.value)}
                    className="bg-white border-2 border-stone-300 text-stone-800 font-bold text-sm px-3 py-2.5 rounded-xl outline-none focus:border-amber-500 transition"
                  >
                    <option value="">-- Selecciona --</option>
                    {[...sortedShiftKeys].sort((a, b) => a.localeCompare(b)).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider">Hasta el Turno:</label>
                  <select
                    value={multiTurnEndDate}
                    onChange={(e) => setMultiTurnEndDate(e.target.value)}
                    className="bg-white border-2 border-stone-300 text-stone-800 font-bold text-sm px-3 py-2.5 rounded-xl outline-none focus:border-amber-500 transition"
                  >
                    <option value="">-- Selecciona --</option>
                    {[...sortedShiftKeys].sort((a, b) => a.localeCompare(b)).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
              </div>

              {multiTurnStartDate && multiTurnEndDate && multiTurnStartDate > multiTurnEndDate && (
                <div className="text-rose-600 font-bold text-sm text-center">
                  ⚠️ El turno inicial debe ser anterior o igual al turno final.
                </div>
              )}
              
              <button
                disabled={!multiTurnStartDate || !multiTurnEndDate || multiTurnStartDate > multiTurnEndDate}
                onClick={() => setMultiTurnPreviewReady(true)}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl shadow-md transition"
              >
                Generar Vista Previa
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* VISTA PREVIA / PDF CONTENT */}
              <div id="multi-turn-print-area" className="space-y-4">
                <div className="text-center border-b pb-4">
                  <h3 className="text-2xl font-black text-slate-900">REPORTE MULTI-TURNO</h3>
                  <p className="text-sm text-slate-600 font-bold mt-1">Sucursal: {selectedTenant?.name || "N/A"}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Periodo: {multiTurnStartDate} al {multiTurnEndDate}
                  </p>
                </div>
                
                {enhancedMultiTurnRecords.length > 0 ? (
                  <div className="overflow-y-auto max-h-[45vh] border-2 border-stone-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px] md:text-sm">
                      <thead className="sticky top-0 bg-stone-100 z-10 shadow-sm">
                        <tr className="border-b-2 border-stone-300">
                          <th className="py-2 px-2 font-black text-stone-700">Turno</th>
                          <th className="py-2 px-1 font-black text-stone-700 text-center">Folios</th>
                          <th className="py-2 px-2 font-black text-stone-700 text-right">Efectivo</th>
                          <th className="py-2 px-2 font-black text-stone-700 text-right">Tarjeta</th>
                          <th className="py-2 px-2 font-black text-stone-700 text-right">Transfer.</th>
                          <th className="py-2 px-2 font-black text-stone-700 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {enhancedMultiTurnRecords.map(r => (
                          <tr key={r.id} className="hover:bg-stone-50 transition">
                            <td className="py-2 px-2 font-bold text-stone-800 whitespace-nowrap">{r.date}</td>
                            <td className="py-2 px-1 font-bold text-stone-600 text-center whitespace-nowrap">
                              {r.folioAnterior + 1} al {r.folioFinal}
                            </td>
                            <td className="py-2 px-2 font-bold text-stone-600 text-right">
                              ${r.cashTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                            <td className="py-2 px-2 font-bold text-stone-600 text-right">
                              ${r.cardTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                            <td className="py-2 px-2 font-bold text-stone-600 text-right">
                              ${r.transferTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                            <td className="py-2 px-2 font-black text-emerald-700 text-right">
                              ${r.montoFoliado.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50 border-t-4 border-emerald-500 sticky bottom-0">
                          <td colSpan={2} className="py-3 px-2 font-black text-emerald-900 text-right">TOTALES:</td>
                          <td className="py-3 px-2 font-black text-emerald-900 text-right">
                            ${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                          </td>
                          <td className="py-3 px-2 font-black text-emerald-900 text-right">
                            ${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                          </td>
                          <td className="py-3 px-2 font-black text-emerald-900 text-right">
                            ${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                          </td>
                          <td className="py-3 px-2 font-black text-emerald-900 text-right text-base">
                            ${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
                    <span className="text-3xl block mb-2">📬</span>
                    <span className="text-stone-500 font-bold">No se encontraron folios guardados en este rango de fechas.</span>
                    <p className="text-xs text-stone-400 mt-2">Recuerda que debes haber guardado el registro de nivelación para cada turno.</p>
                  </div>
                )}
              </div>

              {/* Botones de Exportar */}
              <div className="grid grid-cols-3 gap-2 print:hidden">
                <button
                  onClick={handleExportMultiTurnExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                >
                  <span className="text-lg">📥</span>
                  <span className="text-xs">Excel</span>
                </button>
                <button
                  onClick={handleExportMultiTurnWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                >
                  <span className="text-lg">💬</span>
                  <span className="text-xs">WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    const printContents = document.getElementById("multi-turn-print-area")?.innerHTML;
                    if (printContents) {
                      const originalContents = document.body.innerHTML;
                      document.body.innerHTML = printContents;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload();
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                >
                  <span className="text-lg">🖨️</span>
                  <span className="text-xs">PDF/Imp.</span>
                </button>
              </div>

              <div className="text-center print:hidden mt-4">
                <button
                  onClick={() => setMultiTurnPreviewReady(false)}
                  className="text-stone-500 font-bold text-sm underline hover:text-stone-700 cursor-pointer"
                >
                  ← Volver a Selección
                </button>
              </div>
            </div>
          )}
        </div>
      </IonModal>
    );
};
