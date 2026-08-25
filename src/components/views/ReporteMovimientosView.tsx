import { getMexicoISOString } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';


interface ReporteMovimientosViewProps {
  checkoutReturnMode: any;
  history: any;
  isMovimientosConsulted: any;
  paymentMethod: any;
  renderMaterialHeader: any;
  reporteMovimientosFin: any;
  reporteMovimientosInicio: any;
  selectedTenant: any;
  setAppMode: any;
  setCheckoutReturnMode: any;
  setIsMovimientosConsulted: any;
  setReporteMovimientosFin: any;
  setReporteMovimientosInicio: any;
  setSelectedTableGestion: any;
  users: any;
}

export const ReporteMovimientosView: React.FC<ReporteMovimientosViewProps> = ({
  checkoutReturnMode,
  history,
  isMovimientosConsulted,
  paymentMethod,
  renderMaterialHeader,
  reporteMovimientosFin,
  reporteMovimientosInicio,
  selectedTenant,
  setAppMode,
  setCheckoutReturnMode,
  setIsMovimientosConsulted,
  setReporteMovimientosFin,
  setReporteMovimientosInicio,
  setSelectedTableGestion,
  users
}) => {
const startOfReport = new Date(reporteMovimientosInicio);
    const endOfReport = new Date(reporteMovimientosFin);

    const filteredHistory = history.filter((h) => {
      if (!h.timestamp) return false;
      const t = new Date(h.timestamp);
      return t >= startOfReport && t <= endOfReport;
    });

    const getCajeroName = (userId: string) => {
      const u = users.find((u) => u.id === userId);
      return u ? u.name : userId || "Desconocido";
    };

    // 1. EFECTIVO
    const efeRows = filteredHistory
      .filter((h) => h.paymentMethod === "cash")
      .map((h) => ({
        cuenta: h.tableLabel || h.id?.slice(-6) || "N/A",
        subtotal: h.subtotal || 0,
        sdom: h.tip || 0,
        descuento: h.discount || 0,
        total: h.total || 0,
      }));
    const efeTotal = efeRows.reduce((sum, r) => sum + r.total, 0);

    // 2. TRANSFERENCIA
    const transfRows = filteredHistory
      .filter((h) => h.paymentMethod === "transfer")
      .map((h) => ({
        cuenta: (h.tableLabel || h.id?.slice(-6) || "N/A") + "T",
        cobro: h.total || 0,
        transf: h.cardLastFour ? "****" + h.cardLastFour : "****",
        cajero: getCajeroName(h.createdBy),
      }));
    const transfTotal = transfRows.reduce((sum, r) => sum + r.cobro, 0);

    // 3. TARJETA
    const tarjetaRows = filteredHistory
      .filter((h) => h.paymentMethod === "card")
      .map((h) => ({
        cuenta: (h.tableLabel || h.id?.slice(-6) || "N/A") + "TJT",
        total: h.total || 0,
        tarjeta: (h.cardLastFour ? "****" + h.cardLastFour : "****") + (h.cardType ? ` (${h.cardType.toUpperCase()})` : ""),
        cajero: getCajeroName(h.createdBy),
      }));
    const tarjetaTotal = tarjetaRows.reduce((sum, r) => sum + r.total, 0);

    // 4. LÚPAY
    const lupayRows = filteredHistory
      .filter((h) => h.paymentMethod === "lupay")
      .map((h) => ({
        cuenta: (h.tableLabel || h.id?.slice(-6) || "N/A") + "LP",
        total: h.total || 0,
        lupay: h.cardLastFour ? "****" + h.cardLastFour : "LÚPAY",
        cajero: getCajeroName(h.createdBy),
      }));
    const lupayTotal = lupayRows.reduce((sum, r) => sum + r.total, 0);

    const globalTotal = efeTotal + transfTotal + tarjetaTotal + lupayTotal;

    const handleExcelExport = () => {
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8"/>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; font-family: Arial, sans-serif; text-align: left; }
            th { background-color: #333; color: white; }
            .bg-header { background-color: #f4f4f4; font-weight: bold; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <table border="1">
            <tr><th colspan="5" style="background-color:#1e293b; color:#ffffff; font-size:16px; text-align:center;">REPORTE DE INGRESOS - SUCURSAL ${(selectedTenant?.name || "Pino Suárez").toUpperCase()}</th></tr>
            <tr><th colspan="5" style="text-align:center;">Periodo: ${reporteMovimientosInicio} a ${reporteMovimientosFin}</th></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS EFECTIVO</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Total</th><th class="text-right">SDOM</th><th class="text-right">Descuento</th><th class="text-right">Cobro</th></tr>
      `;

      efeRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.subtotal.toFixed(2)}</td><td class="text-right">${r.sdom.toFixed(2)}</td><td class="text-right">${r.descuento.toFixed(2)}</td><td class="text-right">${r.total.toFixed(2)}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL EFECTIVO (Suma):</b></td><td class="text-right"><b>${efeTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS TRANSFERENCIA</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Cobro</th><th colspan="2">Transf.</th><th>Cajero</th></tr>
      `;

      transfRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.cobro.toFixed(2)}</td><td colspan="2">${r.transf}</td><td>${r.cajero}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL TRANSFERENCIA (Suma):</b></td><td class="text-right"><b>${transfTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS TARJETA</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Total</th><th>Tarjeta</th><th colspan="2">Cajero</th></tr>
      `;

      tarjetaRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.total.toFixed(2)}</td><td>${r.tarjeta}</td><td colspan="2">${r.cajero}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL TARJETA (Suma):</b></td><td class="text-right"><b>${tarjetaTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS LÚPAY</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Total</th><th>Lúpay</th><th colspan="2">Cajero</th></tr>
      `;

      lupayRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.total.toFixed(2)}</td><td>${r.lupay}</td><td colspan="2">${r.cajero}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL LÚPAY (Suma):</b></td><td class="text-right"><b>${lupayTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr style="background-color:#1e293b; color:#ffffff;"><th colspan="5">RESUMEN DEL PERIODO</th></tr>
            <tr><td colspan="4" align="right">EFECTIVO:</td><td class="text-right"><b>$${efeTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="4" align="right">TRANSFERENCIA:</td><td class="text-right"><b>$${transfTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="4" align="right">TARJETA:</td><td class="text-right"><b>$${tarjetaTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="4" align="right">LÚPAY:</td><td class="text-right"><b>$${lupayTotal.toFixed(2)}</b></td></tr>
            <tr style="background-color:#10b981; color:#ffffff;"><td colspan="4" align="right"><b>TOTAL VENTA:</b></td><td class="text-right"><b>$${globalTotal.toFixed(2)}</b></td></tr>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Ingresos_${(selectedTenant?.name || "Sucursal").replace(/\s+/g, "_")}_${getMexicoISOString().slice(0, 10)}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <IonPage className="print:bg-white select-text">
        <div className="print:hidden">
          {renderMaterialHeader({
            title: "Reporte de Ingresos y Movimientos 🔄",
            subtitle: `Sucursal ${selectedTenant?.name || "Pino Suárez"}`,
            showBack: true,
            onBack: () => {
              const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
  setSelectedTableGestion(null);
}
setCheckoutReturnMode(null);
              setIsMovimientosConsulted(false);
            },
          })}
        </div>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="max-w-4xl mx-auto space-y-6 pb-12 print:absolute print:inset-0 print:bg-white print:p-0 print:shadow-none print:m-0 print:w-full">
            
            {/* Filtro de Fechas - Ocultar en Impresion */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-md mx-auto text-center print:hidden space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Periodo - Sucursal {selectedTenant?.name || "Pino Suárez"}</h3>
              
              <div className="space-y-4 text-left">
                <div>
                  <label htmlFor="E_input" className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio (E):</label>
                  <input
                    type="datetime-local"
                    id="E_input"
                    value={reporteMovimientosInicio}
                    onChange={(e) => setReporteMovimientosInicio(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 font-bold text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="S_input" className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Fecha Fin (S):</label>
                  <input
                    type="datetime-local"
                    id="S_input"
                    value={reporteMovimientosFin}
                    onChange={(e) => setReporteMovimientosFin(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 font-bold text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMovimientosConsulted(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl transition duration-200 cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    Consultar Ingresos
                  </button>
                </div>

                {isMovimientosConsulted && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleExcelExport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-4 rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <span>📥 Exportar Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-4 rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/10"
                    >
                      <span>🖨️ Exportar PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resultado del Reporte */}
            {isMovimientosConsulted && (
              <div className="space-y-8 print:space-y-6">
                
                {/* Encabezado Exclusivo para PDF / Impresion */}
                <div className="hidden print:block text-center border-b pb-4 mb-6">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">REPORTE DE INGRESOS - SUCURSAL {(selectedTenant?.name || "PINO SUÁREZ").toUpperCase()}</h1>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Periodo: {new Date(reporteMovimientosInicio).toLocaleString()} a {new Date(reporteMovimientosFin).toLocaleString()}
                  </p>
                </div>

                {/* VENTAS EFECTIVO */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Efectivo
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Total</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">SDOM</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Descuento</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Cobro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {efeRows.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          efeRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.subtotal.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.sdom.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.descuento.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs font-black text-slate-900 text-right">${row.total.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Efectivo:</span>
                    <span className="text-sm text-slate-900 font-black">${efeTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* VENTAS TRANSFERENCIA */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Transferencia
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Cobro (Banco)</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-center">Transf.</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cajero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transfRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          transfRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.cobro.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-center font-mono font-bold">{row.transf}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 font-bold">{row.cajero}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Transferencia:</span>
                    <span className="text-sm text-slate-900 font-black">${transfTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* VENTAS TARJETA */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Tarjeta
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Total</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-center">Tarjeta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cajero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tarjetaRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          tarjetaRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.total.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-center font-mono font-bold">{row.tarjeta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 font-bold">{row.cajero}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Tarjeta:</span>
                    <span className="text-sm text-slate-900 font-black">${tarjetaTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* VENTAS LÚPAY */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Lúpay
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Total</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-center">Referencia</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cajero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lupayRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          lupayRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.total.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-center font-mono font-bold">{row.lupay}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 font-bold">{row.cajero}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Lúpay:</span>
                    <span className="text-sm text-slate-900 font-black">${lupayTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* RESUMEN GLOBAL */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-center gap-6 print:border print:border-slate-300 print:rounded-none print:bg-white">
                  <div className="text-center md:text-left space-y-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Resumen del Periodo</h3>
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                      Generado el {new Date().toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-2 text-right">
                    <div className="text-xs text-slate-600 font-bold uppercase">Efectivo: <span className="font-mono font-black text-slate-950">${efeTotal.toFixed(2)}</span></div>
                    <div className="text-xs text-slate-600 font-bold uppercase">Transferencia: <span className="font-mono font-black text-slate-950">${transfTotal.toFixed(2)}</span></div>
                    <div className="text-xs text-slate-600 font-bold uppercase">Tarjeta: <span className="font-mono font-black text-slate-950">${tarjetaTotal.toFixed(2)}</span></div>
                    <div className="text-xs text-slate-600 font-bold uppercase">Lúpay: <span className="font-mono font-black text-slate-950">${lupayTotal.toFixed(2)}</span></div>
                    
                    <div className="mt-3 bg-emerald-600 text-white font-black text-sm py-3 px-6 rounded-2xl shadow-md shadow-emerald-500/20 uppercase tracking-wider print:text-black print:border print:border-slate-400 print:shadow-none print:bg-white">
                      Total Venta: ${globalTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </IonContent>
      </IonPage>
    );
};
