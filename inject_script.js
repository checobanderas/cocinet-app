const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetAnchor = `              {/* Reset Sales / Demo Mode */}
              <div className="bg-white border border-amber-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">`;

const arqueoCode = `              {/* Arqueo de Caja */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Arqueo de Caja (Conteo de Efectivo en Caja)
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Ingresa las cantidades de billetes y monedas físicas en caja para determinar si hay faltante o sobrante de acuerdo a las ventas en efectivo del sistema. Nota: Pagos por tarjeta o transferencia (Bancos) no se cuentan aquí.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Denominaciones */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "$1000", k: "b1000", m: 1000 },
                      { l: "$500", k: "b500", m: 500 },
                      { l: "$200", k: "b200", m: 200 },
                      { l: "$100", k: "b100", m: 100 },
                      { l: "$50", k: "b50", m: 50 },
                      { l: "$20", k: "b20", m: 20 },
                      { l: "Moneda $20", k: "m20", m: 20 },
                      { l: "Moneda $10", k: "m10", m: 10 },
                      { l: "Moneda $5", k: "m5", m: 5 },
                      { l: "Moneda $2", k: "m2", m: 2 },
                      { l: "Moneda $1", k: "m1", m: 1 },
                      { l: "Moneda 50¢", k: "m05", m: 0.5 },
                    ].map((d) => (
                      <div key={d.k} className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-semibold text-slate-600 w-1/2">{d.l}</span>
                        <input
                          type="number"
                          min="0"
                          value={(efectivoCount as any)[d.k] === 0 ? "" : (efectivoCount as any)[d.k]}
                          onChange={(e) => setEfectivoCount({ ...efectivoCount, [d.k]: Number(e.target.value) })}
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:border-indigo-500"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Resumen */}
                  <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                      Corte y Conciliación
                    </h4>
                    
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-semibold text-slate-600">Total Físico Contado:</span>
                       <span className="text-lg font-bold text-slate-800">\${totalArqueo.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-emerald-700">
                       <span className="text-sm font-semibold">Esperado en Efectivo:</span>
                       <span className="text-lg font-bold">\${corteData.cashSales.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-slate-200 w-full mb-4"></div>

                    {totalArqueo === 0 ? (
                       <div className="text-center text-xs text-slate-400 italic font-medium">
                         Ingresa el conteo de billetes y monedas para calcular diferencias.
                       </div>
                    ) : (totalArqueo - corteData.cashSales).toFixed(2) === "0.00" || (totalArqueo - corteData.cashSales).toFixed(2) === "-0.00" ? (
                       <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl text-center font-bold">
                         ¡Caja Cuadrada Exactamente! ($0.00)
                       </div>
                    ) : totalArqueo - corteData.cashSales > 0 ? (
                       <div className="bg-blue-100 text-blue-800 p-4 rounded-xl text-center font-bold flex flex-col items-center">
                         <span>SOBRANTE DE CAJA</span>
                         <span className="text-xl">+\$\${(totalArqueo - corteData.cashSales).toFixed(2)}</span>
                         <span className="text-xs font-normal mt-1 opacity-80">(No reportado en sistema)</span>
                       </div>
                    ) : (
                       <div className="bg-red-100 text-red-800 p-4 rounded-xl text-center font-bold flex flex-col items-center">
                         <span>FALTANTE DE CAJA</span>
                         <span className="text-xl">-\$\${(corteData.cashSales - totalArqueo).toFixed(2)}</span>
                         <span className="text-xs font-normal mt-1 opacity-80">(Dinero perdido / entregado de más)</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>\n\n`;

code = code.replace(targetAnchor, arqueoCode + targetAnchor);
fs.writeFileSync('src/App.tsx', code);
console.log('Arqueo injected via script.');
