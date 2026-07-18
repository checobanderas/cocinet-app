import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update corteData computation
code = code.replace(
  `const topSold = Object.values(productCounts)`,
  `
    let totalPurchasesPaid = 0;
    let totalPurchasesCredit = 0;
    purchases.forEach(p => {
      if (p.isPaid) totalPurchasesPaid += (p.total || 0);
      else totalPurchasesCredit += (p.total || 0);
    });
    
    const topSold = Object.values(productCounts)`
);

code = code.replace(
  `count: completedHistory.length,`,
  `count: completedHistory.length,\n      totalPurchasesPaid,\n      totalPurchasesCredit,\n      netCashFlow: cashSales - totalPurchasesPaid,`
);

// Update Corte print ticket
code = code.replace(
  `t += \`Pagos Trans.:  $\${transSales.toFixed(2)}\\n\`;`,
  `t += \`Pagos Trans.:  $\${transSales.toFixed(2)}\\n\`;\n    t += \`---------------------------\\n\`;\n    t += \`Compras (Pago Efectivo):  $-\${totalPurchasesPaid.toFixed(2)}\\n\`;\n    t += \`Compras (Crédito/Deuda):  $\${totalPurchasesCredit.toFixed(2)}\\n\`;\n    t += \`---------------------------\\n\`;\n    t += \`EFECTIVO NETO CAJA: $\${(cashSales - totalPurchasesPaid).toFixed(2)}\\n\`;`
);

code = code.replace(
  `.printLine(\`Pagos Trans.:  $\${transSales.toFixed(2)}\`)`,
  `.printLine(\`Pagos Trans.:  $\${transSales.toFixed(2)}\`)\n        .printLine("-----------------------")\n        .printLine(\`Compras Pagadas Ef.: $-\${totalPurchasesPaid.toFixed(2)}\`)\n        .printLine(\`Compras a Credito:   $\${totalPurchasesCredit.toFixed(2)}\`)\n        .printLine("-----------------------")\n        .printLine(\`EFECTIVO NETO EN CAJA: $\${(cashSales - totalPurchasesPaid).toFixed(2)}\`)`
);

// Update Corte screen
const screenCorteReplace = `<li className="flex justify-between items-center py-3">
                      <span className="text-slate-500 font-medium">Billetes/Efectivo Ingresado</span>
                      <span className="font-bold text-slate-800">\${corteData.cashSales.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between items-center py-3 border-t border-slate-100">
                      <span className="text-slate-500 font-medium text-rose-500">Gastos Compras (Efectivo)</span>
                      <span className="font-bold text-rose-600">-\${corteData.totalPurchasesPaid.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between items-center py-3 border-t border-slate-100">
                      <span className="text-slate-700 font-bold text-lg">Efectivo Neto en Caja</span>
                      <span className="font-black text-emerald-600 text-xl">\${corteData.netCashFlow.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between items-center py-3 border-t border-slate-100">
                      <span className="text-slate-500 font-medium text-amber-500">Cuentas por Pagar (Compras a Crédito)</span>
                      <span className="font-bold text-amber-600">\${corteData.totalPurchasesCredit.toFixed(2)}</span>
                    </li>`;

code = code.replace(
  `<li className="flex justify-between items-center py-3">\n                            <span className="text-slate-500 font-medium">\n                              Efectivo\n                            </span>\n                            <span className="font-bold text-emerald-600">\n                              \${corteData.cashSales.toFixed(2)}\n                            </span>\n                          </li>`,
  screenCorteReplace
);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated flow");
