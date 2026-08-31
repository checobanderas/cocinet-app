import React from 'react';
import { IonModal } from '@ionic/react';

export interface MultiTurnFoliatedItem {
  folio: number;
  date: string;
  accountId: string;
  table?: string;
  paymentCategory: "Efectivo" | "Tarjeta" | "Transferencia / Bancos";
  rawPaymentMethod: string;
  total: number;
  timestamp: string;
}

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
  allFoliatedItems?: MultiTurnFoliatedItem[];
  cashFoliatedItems?: MultiTurnFoliatedItem[];
  cardFoliatedItems?: MultiTurnFoliatedItem[];
  transferFoliatedItems?: MultiTurnFoliatedItem[];
  minFolio?: number;
  maxFolio?: number;
}

export const MultiTurnModal: React.FC<MultiTurnModalProps> = ({
  showMultiTurnModal,
  setShowMultiTurnModal,
  multiTurnData,
  selectedMultiTurnDate,
  setSelectedMultiTurnDate,
  handleExportMultiTurnCSV,
  multiTurnEndDate,
  multiTurnPreviewReady,
  multiTurnStartDate,
  selectedTenant,
  setMultiTurnEndDate,
  setMultiTurnPreviewReady,
  setMultiTurnStartDate,
  totalCashSum = 0,
  totalCardSum = 0,
  handleExportMultiTurnWhatsApp,
  enhancedMultiTurnRecords = [],
  totalTransferSum = 0,
  totalMultiTurnSum = 0,
  handleExportMultiTurnExcel,
  sortedShiftKeys = [],
  allFoliatedItems = [],
  cashFoliatedItems = [],
  cardFoliatedItems = [],
  transferFoliatedItems = [],
  minFolio = 0,
  maxFolio = 0
}) => {
  const handlePrint = () => {
    const printElement = document.getElementById("multi-turn-print-area");
    if (!printElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Multi-Turno ${multiTurnStartDate} al ${multiTurnEndDate}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 20px;
              color: #1e293b;
              background: #ffffff;
            }
            .header-box {
              text-align: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            h1 { margin: 0 0 6px 0; font-size: 20px; color: #0f172a; }
            p { margin: 3px 0; font-size: 13px; color: #475569; }
            .section-title {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 18px;
              margin-bottom: 8px;
              border-left: 4px solid #d97706;
              padding-left: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #334155;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .bg-emerald-50 { background-color: #ecfdf5; }
            .bg-stone-50 { background-color: #f8fafc; }
            .grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
              margin-bottom: 15px;
            }
            .card-desglose {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 8px;
              background: #fafafa;
            }
            .card-title {
              font-weight: 800;
              font-size: 12px;
              margin-bottom: 6px;
              text-align: center;
              padding: 4px;
              border-radius: 4px;
            }
            .title-cash { background-color: #dcfce7; color: #166534; }
            .title-card { background-color: #e0e7ff; color: #3730a3; }
            .title-trans { background-color: #fef3c7; color: #92400e; }
            .grand-total-box {
              background-color: #ecfdf5;
              border: 2px solid #10b981;
              border-radius: 8px;
              padding: 10px;
              text-align: right;
              font-size: 14px;
              font-weight: 800;
              color: #065f46;
              margin-top: 15px;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 700;
              font-size: 10px;
            }
            .badge-cash { background-color: #dcfce7; color: #166534; }
            .badge-card { background-color: #e0e7ff; color: #3730a3; }
            .badge-trans { background-color: #fef3c7; color: #92400e; }
            @media print {
              body { margin: 8mm; }
              .no-print { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h1>REPORTE MULTI-TURNO</h1>
            <p><strong>Sucursal:</strong> ${selectedTenant?.name || "N/A"}</p>
            <p><strong>Periodo:</strong> ${multiTurnStartDate} al ${multiTurnEndDate}</p>
            <p><strong>Rango Global de Folios:</strong> #${minFolio} al #${maxFolio} (${allFoliatedItems.length} folios)</p>
          </div>

          <!-- 1. RESUMEN POR TURNOS -->
          <div class="section-title">1. RESUMEN GENERAL POR TURNOS</div>
          <table>
            <thead>
              <tr>
                <th>Turno</th>
                <th class="text-center">Folios</th>
                <th class="text-right">Efectivo</th>
                <th class="text-right">Tarjeta</th>
                <th class="text-right">Transfer.</th>
                <th class="text-right">Total Turno</th>
              </tr>
            </thead>
            <tbody>
              ${enhancedMultiTurnRecords.map((r: any) => `
                <tr>
                  <td class="font-bold">${r.date}</td>
                  <td class="text-center">#${r.folioAnterior + 1} al #${r.folioFinal}</td>
                  <td class="text-right">$${r.cashTotal.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                  <td class="text-right">$${r.cardTotal.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                  <td class="text-right">$${r.transferTotal.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                  <td class="text-right font-bold">$${r.montoFoliado.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
              <tr class="bg-emerald-50 font-bold" style="border-top: 2px solid #10b981;">
                <td colspan="2" class="text-right">TOTALES DEL PERIODO:</td>
                <td class="text-right">$${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                <td class="text-right">$${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                <td class="text-right">$${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                <td class="text-right font-bold" style="color:#065f46;">$${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>

          <!-- 2. LISTADO ACUMULADO GENERAL -->
          <div class="section-title">2. LISTADO GENERAL ACUMULADO (FOLIO POR FOLIO CONSECUTIVO)</div>
          <table>
            <thead>
              <tr>
                <th class="text-center"># Folio</th>
                <th>Turno / Fecha</th>
                <th>Método de Pago</th>
                <th class="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${allFoliatedItems.map((it: any) => `
                <tr>
                  <td class="text-center font-bold">#${it.folio}</td>
                  <td>${it.date}</td>
                  <td>
                    <span class="badge ${it.paymentCategory === 'Efectivo' ? 'badge-cash' : it.paymentCategory === 'Tarjeta' ? 'badge-card' : 'badge-trans'}">
                      ${it.paymentCategory}
                    </span>
                  </td>
                  <td class="text-right font-bold">$${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
              <tr class="bg-emerald-50 font-bold">
                <td colspan="3" class="text-right">TOTAL ACUMULADO (${allFoliatedItems.length} FOLIOS):</td>
                <td class="text-right font-bold" style="color:#065f46;">$${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>

          <!-- 3. DESGLOSE POR MÉTODO DE PAGO -->
          <div class="section-title">3. DESGLOSE POR FORMA DE PAGO (ORDENADO POR FOLIO)</div>
          <div class="grid-3">
            <!-- EFECTIVO -->
            <div class="card-desglose">
              <div class="card-title title-cash">💵 EFECTIVO (${cashFoliatedItems.length})</div>
              <table>
                <thead>
                  <tr>
                    <th class="text-center"># Folio</th>
                    <th class="text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  ${cashFoliatedItems.length > 0 ? cashFoliatedItems.map((it: any) => `
                    <tr>
                      <td class="text-center font-bold">#${it.folio}</td>
                      <td class="text-right">$${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="2" class="text-center">Sin folios</td></tr>`}
                  <tr class="bg-emerald-50 font-bold">
                    <td class="text-center">Subtotal:</td>
                    <td class="text-right">$${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TARJETA -->
            <div class="card-desglose">
              <div class="card-title title-card">💳 TARJETA (${cardFoliatedItems.length})</div>
              <table>
                <thead>
                  <tr>
                    <th class="text-center"># Folio</th>
                    <th class="text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  ${cardFoliatedItems.length > 0 ? cardFoliatedItems.map((it: any) => `
                    <tr>
                      <td class="text-center font-bold">#${it.folio}</td>
                      <td class="text-right">$${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="2" class="text-center">Sin folios</td></tr>`}
                  <tr class="bg-emerald-50 font-bold">
                    <td class="text-center">Subtotal:</td>
                    <td class="text-right">$${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TRANSFERENCIAS -->
            <div class="card-desglose">
              <div class="card-title title-trans">🏦 TRANSFERENCIAS / BANCOS (${transferFoliatedItems.length})</div>
              <table>
                <thead>
                  <tr>
                    <th class="text-center"># Folio</th>
                    <th class="text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  ${transferFoliatedItems.length > 0 ? transferFoliatedItems.map((it: any) => `
                    <tr>
                      <td class="text-center font-bold">#${it.folio}</td>
                      <td class="text-right">$${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="2" class="text-center">Sin folios</td></tr>`}
                  <tr class="bg-emerald-50 font-bold">
                    <td class="text-center">Subtotal:</td>
                    <td class="text-right">$${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grand-total-box">
            GRAN TOTAL ACUMULADO DEL PERIODO: $${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <IonModal
      isOpen={showMultiTurnModal}
      onDidDismiss={() => setShowMultiTurnModal(false)}
      style={{
        "--height": "auto",
        "--max-height": "92vh",
        "--width": "100%",
        "--max-width": "950px",
        "--border-radius": "24px",
      }}
    >
      <div className="p-4 md:p-6 bg-white space-y-5 overflow-y-auto max-h-[92vh] text-slate-800">
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
            <div id="multi-turn-print-area" className="space-y-6">
              
              {/* ENCABEZADO */}
              <div className="text-center border-b pb-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-wide">REPORTE MULTI-TURNO</h3>
                <p className="text-sm text-slate-600 font-bold mt-1">Sucursal: {selectedTenant?.name || "N/A"}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  Periodo: <span className="text-amber-700">{multiTurnStartDate}</span> al <span className="text-amber-700">{multiTurnEndDate}</span>
                </p>
                {allFoliatedItems.length > 0 && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold text-amber-800">
                    <span>🔢 Rango de Folios:</span>
                    <span className="font-black text-amber-900">#{minFolio} al #{maxFolio}</span>
                    <span>({allFoliatedItems.length} folios emitidos)</span>
                  </div>
                )}
              </div>
              
              {enhancedMultiTurnRecords.length > 0 ? (
                <>
                  {/* SECCIÓN 1: RESUMEN POR TURNOS */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-stone-700 uppercase tracking-wider">
                      <span className="bg-amber-500 text-white px-2 py-0.5 rounded-md">1</span>
                      <span>Resumen General por Turnos</span>
                    </div>
                    <div className="overflow-x-auto border-2 border-stone-200 rounded-xl shadow-sm">
                      <table className="w-full text-left border-collapse text-[11px] md:text-sm">
                        <thead className="bg-stone-100 border-b-2 border-stone-300">
                          <tr>
                            <th className="py-2.5 px-3 font-black text-stone-700">Turno</th>
                            <th className="py-2.5 px-2 font-black text-stone-700 text-center">Folios</th>
                            <th className="py-2.5 px-2 font-black text-stone-700 text-right">Efectivo</th>
                            <th className="py-2.5 px-2 font-black text-stone-700 text-right">Tarjeta</th>
                            <th className="py-2.5 px-2 font-black text-stone-700 text-right">Transfer.</th>
                            <th className="py-2.5 px-3 font-black text-stone-700 text-right">Total Turno</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {enhancedMultiTurnRecords.map((r: any) => (
                            <tr key={r.id || r.date} className="hover:bg-stone-50 transition">
                              <td className="py-2 px-3 font-bold text-stone-800 whitespace-nowrap">{r.date}</td>
                              <td className="py-2 px-2 font-bold text-stone-600 text-center whitespace-nowrap">
                                #{r.folioAnterior + 1} al #{r.folioFinal}
                              </td>
                              <td className="py-2 px-2 font-bold text-stone-600 text-right whitespace-nowrap">
                                ${r.cashTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}
                              </td>
                              <td className="py-2 px-2 font-bold text-stone-600 text-right whitespace-nowrap">
                                ${r.cardTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}
                              </td>
                              <td className="py-2 px-2 font-bold text-stone-600 text-right whitespace-nowrap">
                                ${r.transferTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}
                              </td>
                              <td className="py-2 px-3 font-black text-emerald-700 text-right whitespace-nowrap">
                                ${r.montoFoliado.toLocaleString("es-MX", {minimumFractionDigits:2})}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-emerald-50 border-t-2 border-emerald-400 font-bold">
                            <td colSpan={2} className="py-2.5 px-3 font-black text-emerald-900 text-right">TOTALES:</td>
                            <td className="py-2.5 px-2 font-black text-emerald-900 text-right whitespace-nowrap">
                              ${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                            <td className="py-2.5 px-2 font-black text-emerald-900 text-right whitespace-nowrap">
                              ${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                            <td className="py-2.5 px-2 font-black text-emerald-900 text-right whitespace-nowrap">
                              ${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                            <td className="py-2.5 px-3 font-black text-emerald-900 text-right text-base whitespace-nowrap">
                              ${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits:2})}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECCIÓN 2: LISTADO ACUMULADO GENERAL (FOLIO POR FOLIO) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-stone-700 uppercase tracking-wider">
                        <span className="bg-teal-600 text-white px-2 py-0.5 rounded-md">2</span>
                        <span>Listado Consecutivo (Folio por Folio)</span>
                      </div>
                      <span className="text-xs font-bold text-stone-500">
                        Total: {allFoliatedItems.length} folios ordenados
                      </span>
                    </div>

                    <div className="overflow-y-auto max-h-64 border-2 border-stone-200 rounded-xl shadow-sm">
                      <table className="w-full text-left border-collapse text-[11px] md:text-sm">
                        <thead className="sticky top-0 bg-teal-50 border-b-2 border-teal-200 z-10">
                          <tr>
                            <th className="py-2 px-3 font-black text-teal-900 text-center w-24"># Folio</th>
                            <th className="py-2 px-3 font-black text-teal-900">Turno / Fecha</th>
                            <th className="py-2 px-3 font-black text-teal-900">Método de Pago</th>
                            <th className="py-2 px-3 font-black text-teal-900 text-right">Importe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {allFoliatedItems.map((it) => {
                            let badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
                            let icon = "💵";
                            if (it.paymentCategory === "Tarjeta") {
                              badgeStyle = "bg-indigo-100 text-indigo-800 border-indigo-300";
                              icon = "💳";
                            } else if (it.paymentCategory === "Transferencia / Bancos") {
                              badgeStyle = "bg-amber-100 text-amber-800 border-amber-300";
                              icon = "🏦";
                            }

                            return (
                              <tr key={`${it.date}_${it.folio}_${it.accountId}`} className="hover:bg-teal-50/50 transition">
                                <td className="py-1.5 px-3 font-black text-slate-800 text-center bg-stone-50">
                                  #{it.folio}
                                </td>
                                <td className="py-1.5 px-3 font-bold text-stone-700">
                                  {it.date}
                                </td>
                                <td className="py-1.5 px-3 font-bold">
                                  <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs px-2 py-0.5 rounded-md border font-extrabold ${badgeStyle}`}>
                                    <span>{icon}</span>
                                    <span>{it.paymentCategory}</span>
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 font-black text-slate-900 text-right">
                                  ${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-teal-100 border-t-2 border-teal-300">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 font-black text-teal-950 text-right text-xs">
                              TOTAL ACUMULADO ({allFoliatedItems.length} FOLIOS):
                            </td>
                            <td className="py-2 px-3 font-black text-teal-950 text-right text-sm">
                              ${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* SECCIÓN 3: DESGLOSE POR MÉTODO DE PAGO (EFECTIVO, TARJETA, TRANSFERENCIAS) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-stone-700 uppercase tracking-wider">
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md">3</span>
                      <span>Desglose por Forma de Pago (Ordenados por Folio)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* COLUMNA 1: EFECTIVO */}
                      <div className="border-2 border-emerald-300 rounded-2xl overflow-hidden bg-white flex flex-col shadow-sm">
                        <div className="bg-emerald-600 text-white p-2.5 flex items-center justify-between">
                          <span className="font-black text-xs flex items-center gap-1.5">
                            <span>💵</span> EFECTIVO
                          </span>
                          <span className="bg-emerald-700 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {cashFoliatedItems.length} folios
                          </span>
                        </div>
                        <div className="overflow-y-auto max-h-48 flex-1 divide-y divide-stone-100">
                          {cashFoliatedItems.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead className="bg-emerald-50/70 text-emerald-900 border-b border-emerald-100 text-[10px] uppercase font-black">
                                <tr>
                                  <th className="py-1 px-3 text-center"># Folio</th>
                                  <th className="py-1 px-3 text-right">Importe</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-emerald-50">
                                {cashFoliatedItems.map(it => (
                                  <tr key={`c_${it.folio}`} className="hover:bg-emerald-50/50">
                                    <td className="py-1.5 px-3 font-bold text-center text-stone-700">#{it.folio}</td>
                                    <td className="py-1.5 px-3 font-black text-right text-emerald-800">
                                      ${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-4 text-center text-xs text-stone-400 font-bold">Sin folios de efectivo</div>
                          )}
                        </div>
                        <div className="bg-emerald-50 p-2.5 border-t border-emerald-200 flex items-center justify-between text-xs font-black text-emerald-950">
                          <span>Subtotal Efectivo:</span>
                          <span className="text-sm">${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</span>
                        </div>
                      </div>

                      {/* COLUMNA 2: TARJETA */}
                      <div className="border-2 border-indigo-300 rounded-2xl overflow-hidden bg-white flex flex-col shadow-sm">
                        <div className="bg-indigo-600 text-white p-2.5 flex items-center justify-between">
                          <span className="font-black text-xs flex items-center gap-1.5">
                            <span>💳</span> TARJETA
                          </span>
                          <span className="bg-indigo-700 text-indigo-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {cardFoliatedItems.length} folios
                          </span>
                        </div>
                        <div className="overflow-y-auto max-h-48 flex-1 divide-y divide-stone-100">
                          {cardFoliatedItems.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead className="bg-indigo-50/70 text-indigo-900 border-b border-indigo-100 text-[10px] uppercase font-black">
                                <tr>
                                  <th className="py-1 px-3 text-center"># Folio</th>
                                  <th className="py-1 px-3 text-right">Importe</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-indigo-50">
                                {cardFoliatedItems.map(it => (
                                  <tr key={`card_${it.folio}`} className="hover:bg-indigo-50/50">
                                    <td className="py-1.5 px-3 font-bold text-center text-stone-700">#{it.folio}</td>
                                    <td className="py-1.5 px-3 font-black text-right text-indigo-800">
                                      ${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-4 text-center text-xs text-stone-400 font-bold">Sin folios con tarjeta</div>
                          )}
                        </div>
                        <div className="bg-indigo-50 p-2.5 border-t border-indigo-200 flex items-center justify-between text-xs font-black text-indigo-950">
                          <span>Subtotal Tarjeta:</span>
                          <span className="text-sm">${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</span>
                        </div>
                      </div>

                      {/* COLUMNA 3: TRANSFERENCIAS / BANCOS */}
                      <div className="border-2 border-amber-300 rounded-2xl overflow-hidden bg-white flex flex-col shadow-sm">
                        <div className="bg-amber-600 text-white p-2.5 flex items-center justify-between">
                          <span className="font-black text-xs flex items-center gap-1.5">
                            <span>🏦</span> TRANSF. / BANCOS
                          </span>
                          <span className="bg-amber-700 text-amber-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {transferFoliatedItems.length} folios
                          </span>
                        </div>
                        <div className="overflow-y-auto max-h-48 flex-1 divide-y divide-stone-100">
                          {transferFoliatedItems.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead className="bg-amber-50/70 text-amber-900 border-b border-amber-100 text-[10px] uppercase font-black">
                                <tr>
                                  <th className="py-1 px-3 text-center"># Folio</th>
                                  <th className="py-1 px-3 text-right">Importe</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-amber-50">
                                {transferFoliatedItems.map(it => (
                                  <tr key={`trans_${it.folio}`} className="hover:bg-amber-50/50">
                                    <td className="py-1.5 px-3 font-bold text-center text-stone-700">#{it.folio}</td>
                                    <td className="py-1.5 px-3 font-black text-right text-amber-800">
                                      ${it.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-4 text-center text-xs text-stone-400 font-bold">Sin folios con transf./bancos</div>
                          )}
                        </div>
                        <div className="bg-amber-50 p-2.5 border-t border-amber-200 flex items-center justify-between text-xs font-black text-amber-950">
                          <span>Subtotal Bancos:</span>
                          <span className="text-sm">${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}</span>
                        </div>
                      </div>

                    </div>

                    {/* CAJA DE TOTAL ACUMULADO FINAL */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between mt-3">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200 block">
                          GRAN TOTAL ACUMULADO DEL PERIODO
                        </span>
                        <span className="text-xs font-bold text-emerald-100">
                          Folios #{minFolio} al #{maxFolio} ({allFoliatedItems.length} cuentas)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl md:text-3xl font-black tracking-tight">
                          ${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
                  <span className="text-3xl block mb-2">📬</span>
                  <span className="text-stone-500 font-bold">No se encontraron folios guardados en este rango de fechas.</span>
                  <p className="text-xs text-stone-400 mt-2">Recuerda que debes haber guardado el registro de nivelación para cada turno.</p>
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-3 gap-2 print:hidden pt-2 border-t">
              <button
                onClick={handleExportMultiTurnExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
              >
                <span className="text-lg">📥</span>
                <span className="text-xs">Excel</span>
              </button>
              <button
                onClick={handleExportMultiTurnWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
              >
                <span className="text-lg">💬</span>
                <span className="text-xs">WhatsApp</span>
              </button>
              <button
                onClick={handlePrint}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
              >
                <span className="text-lg">🖨️</span>
                <span className="text-xs">PDF/Imp.</span>
              </button>
            </div>

            <div className="text-center print:hidden">
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
