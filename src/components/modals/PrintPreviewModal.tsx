import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, printOutline } from 'ionicons/icons';

interface PrintPreviewModalProps {
  theoreticalBalance: any;
  totalInflowsAmt: any;
  instantDifference: any;
  instantPhysicalTotal: any;
  showPrintPreviewModal: boolean;
  setShowPrintPreviewModal: (v: boolean) => void;
  printPreviewContent: string;
  corteData: any;
  currentUser: any;
  mexicoTime: any;
  purchases: any;
  totalOutflowsAmt: any;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  showPrintPreviewModal,
  setShowPrintPreviewModal,
  printPreviewContent,
  corteData, currentUser, mexicoTime, purchases, totalOutflowsAmt,
  theoreticalBalance,
  totalInflowsAmt,
  instantDifference,
  instantPhysicalTotal
}) => {
  return (
          <IonModal
            isOpen={showPrintPreviewModal}
            onDidDismiss={() => setShowPrintPreviewModal(false)}
            className="rounded-3xl"
            style={{ "--border-radius": "24px" }}
          >
            <div className="flex flex-col h-full bg-[#1e293b] text-slate-200">
              {/* Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👁️</span>
                  <div>
                    <h2 className="text-sm font-black tracking-tight">
                      Vista Preliminar de Impresión
                    </h2>
                    <p className="text-[12px] text-slate-400">
                      Comprobante térmico de balanza de auditoría
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrintPreviewModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none"
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
                </button>
              </div>

              {/* Ticket Preview Body */}
              <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start bg-slate-950">
                {/* Simulated Thermal Ticket paper rollup */}
                <div
                  id="comprobante-corte-termico"
                  className="bg-white text-black p-5 sm:p-7 max-w-sm w-full font-mono text-[11px] leading-relaxed shadow-2xl relative border-t-8 border-indigo-600"
                  style={{ minHeight: "450px" }}
                >
                  {/* Jagged border bottom simulation */}
                  <div className="text-center font-bold tracking-widest text-[#334155] border-b border-dashed border-slate-300 pb-3 mb-4">
                    <span className="text-base font-black">
                      🍔 COCINET POS 🍕
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      SISTEMA INTEGRAL DE RESTAURACIÓN
                    </span>
                    <span className="block text-[11px] font-medium text-slate-500 mt-1">
                      CDMX -MÉXICO ZONE 🇲🇽
                    </span>
                    <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                      ESTADO: CONECTADO WEBSOCKETS
                    </span>
                  </div>

                  <div className="space-y-1 mb-4 border-b border-dashed border-slate-200 pb-3 text-slate-700">
                    <div>
                      <strong>REGISTRO:</strong> CORTE DE CAJA MENSUAL/DIARIO
                    </div>
                    <div>
                      <strong>FECHA EMISIÓN:</strong>{" "}
                      {mexicoTime || new Date().toLocaleString()}
                    </div>
                    <div>
                      <strong>CAJERO ACTIVO:</strong>{" "}
                      {currentUser?.name || "Administrador Oficial"}
                    </div>
                    <div>
                      <strong>COMPILACIÓN STAMP:</strong> 02-JUN-2026 21:40
                      (PRO)
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="space-y-1 text-xs border-b border-slate-300 pb-3 mb-3">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>(+) VENTAS COBRADAS:</span>
                      <span className="text-right text-emerald-600">
                        ${corteData.cashSales.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-500 pl-2 space-y-0.5">
                      <div className="flex justify-between">
                        <span>• EFECTIVO EN CAJA:</span>
                        <span>${corteData.cashSales.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• TARJETA (REST):</span>
                        <span>${corteData.cardSales.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• TRANSFERENCIA (REST):</span>
                        <span>${corteData.transSales.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-slate-800 pt-1.5">
                      <span>(+) ENTRADAS EXT:</span>
                      <span className="text-right text-indigo-600">
                        ${totalInflowsAmt.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-slate-800 pt-1">
                      <span>(-) EGRESOS EXT & GASTOS:</span>
                      <span className="text-right text-rose-600">
                        ${totalOutflowsAmt.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-slate-800 pt-1">
                      <span>(-) PROV. SURTIDO PAGADO:</span>
                      <span className="text-right text-orange-600">
                        ${corteData.totalPurchasesPaid.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-sm border-b-2 border-double border-slate-400 py-2.5 mb-4 text-[#1e293b]">
                    <span>SALDO ESTIMADO NETO:</span>
                    <span className="text-right">
                      ${theoreticalBalance.toFixed(2)}
                    </span>
                  </div>

                  {/* Individual Cash Movements Logs */}
                  {corteData.totalCashMovements.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold border-b border-dashed border-slate-200 pb-1 mb-1 bg-slate-50 p-1 text-center text-slate-700">
                        LOG DE FLUJO DE CAJA EXTRAORDINARIO
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        {corteData.totalCashMovements.map((mov: any) => (
                          <div key={mov.id} className="flex justify-between">
                            <span>• {mov.concept?.toUpperCase()}:</span>
                            <span
                              className={
                                mov.type === "in"
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }
                            >
                              {mov.type === "in" ? "+" : "-"}$
                              {mov.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Registered Purchases list */}
                  {purchases.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold border-b border-dashed border-slate-200 pb-1 mb-1 bg-slate-50 p-1 text-center text-slate-700">
                        ENTREGAS DE PROVEEDORES DEL DÍA
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        {purchases.map((pur: any) => (
                          <div key={pur.id} className="flex justify-between">
                            <span>• {pur.supplier?.slice(0, 18)}:</span>
                            <span className="font-bold">
                              ${pur.total?.toFixed(2)} (
                              {pur.isPaid ? "PAGADO" : "CRÉDITO"})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Arqueo physics count comparison */}
                  <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[#475569] text-center">
                    <span className="font-black block text-[12px] border-b border-slate-200 pb-1 mb-1.5 text-slate-700">
                      VERIFICACIÓN FÍSICA DE AUDITORÍA
                    </span>
                    <div className="space-y-1 text-[12px]">
                      <div className="flex justify-between font-bold">
                        <span>SALDO TEÓRICO EN LIBRO:</span>
                        <span>${theoreticalBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-800">
                        <span>ARQUEO FÍSICO ARQUEADO:</span>
                        <span>${instantPhysicalTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-black border-t border-dashed border-slate-300 pt-1 mt-1 text-slate-900">
                        <span>COMPROBACIÓN DIFERENCIA:</span>
                        <span
                          className={
                            instantDifference === 0
                              ? "text-emerald-700"
                              : instantDifference > 0
                                ? "text-blue-700"
                                : "text-rose-700"
                          }
                        >
                          {instantDifference === 0
                            ? "CUADRADO ($0.00)"
                            : instantDifference > 0
                              ? `SOBRANTE (+${instantDifference.toFixed(2)})`
                              : `FALTANTE (-${Math.abs(instantDifference).toFixed(2)})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Auditor space signatures */}
                  <div className="pt-8 space-y-8 text-center text-slate-400 text-[10px] tracking-wider uppercase">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="border-t border-slate-300 pt-1 font-bold text-slate-600 w-32 mx-auto">
                          FIRMA CAJERO
                        </div>
                        <div className="text-slate-400 mt-0.5 text-[9px]">
                          {currentUser?.name || "OPERANTE ACTIVO"}
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-slate-300 pt-1 font-bold text-slate-600 w-32 mx-auto">
                          FIRMA SUPERVISOR
                        </div>
                        <div className="text-slate-400 mt-0.5 text-[9px]">
                          AUDITORÍA INTERNA CORPORATIVA
                        </div>
                      </div>
                    </div>
                    <div className="text-center font-bold text-slate-300 normal-case border-t border-dashed border-slate-200 pt-2 tracking-widest text-[9px]">
                      *** GRACIAS POR MANTENER LA CAJA BIEN CUADRADA ***
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="bg-slate-900 px-5 py-4 flex gap-3 border-t border-slate-800">
                <button
                  onClick={() => setShowPrintPreviewModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl cursor-pointer transition border-none outline-none"
                >
                  Regresar
                </button>
                <button
                  onClick={() => {
                    const printContents = document.getElementById(
                      "comprobante-corte-termico",
                    )?.innerHTML;
                    if (!printContents) return;
                    const originalContents = document.body.innerHTML;

                    // Open a stylish print dialog context
                    const iframe = document.createElement("iframe");
                    iframe.style.position = "fixed";
                    iframe.style.right = "0";
                    iframe.style.bottom = "0";
                    iframe.style.width = "0";
                    iframe.style.height = "0";
                    iframe.style.border = "0";
                    document.body.appendChild(iframe);

                    const doc =
                      iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc) {
                      doc.write(`
                        <html>
                          <head>
                            <title>Comprobante Térmico de Corte de Caja</title>
                            <style>
                              body { font-family: monospace; font-size: 11px; padding: 20px; text-align: left; background: white; color: black; }
                              strong { font-weight: bold; }
                              .text-center { text-align: center; }
                              .text-right { text-align: right; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .mb-4 { margin-bottom: 16px; }
                              .border-b { border-bottom: 1px solid black; }
                              .border-b-2 { border-bottom: 2px solid black; }
                              .pb-3 { padding-bottom: 12px; }
                              .pt-8 { padding-top: 32px; }
                              .space-y-1 > * { margin-bottom: 4px; }
                              .space-y-8 > * { margin-bottom: 32px; }
                              @media print {
                                body { padding: 0; margin: 0; }
                              }
                            </style>
                          </head>
                          <body>
                            ${printContents}
                          </body>
                        </html>
                      `);
                      doc.close();
                      setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                        setTimeout(
                          () => document.body.removeChild(iframe),
                          500,
                        );
                      }, 500);
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition shadow border-none outline-none flex items-center justify-center gap-1.5"
                >
                  <span>🖨️ Imprimir Ticket de Caja</span>
                </button>
              </div>
            </div>
          </IonModal>
  );
};
