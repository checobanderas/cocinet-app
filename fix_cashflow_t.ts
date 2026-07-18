import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update generateCorteTicketText ticket
code = code.replace(
  `t += \`Transferencias:    \$\${transSales.toFixed(2)}\\n\`;\n    t += line + "\\n";`,
  `t += \`Transferencias:    \$\${transSales.toFixed(2)}\\n\`;
    t += line + "\\n";
    t += \`Compras (Efectivo): -$ \${totalPurchasesPaid.toFixed(2)}\\n\`;
    t += \`Compras a Credito:  $ \${totalPurchasesCredit.toFixed(2)}\\n\`;
    t += line + "\\n";
    t += \`EFECTIVO NETO CAJA: $\${(cashSales - totalPurchasesPaid).toFixed(2)}\\n\`;
    t += line + "\\n";`
);

// Update physical printer
code = code.replace(
  `.printLine(\`Transferencia:  \$\${transSales.toFixed(2)}\`)
        .printLine(\`Transacciones:   #\${count}\`)`,
  `.printLine(\`Transferencia:  \$\${transSales.toFixed(2)}\`)
        .printLine(\`Transacciones:   #\${count}\`)
        .printLine("--------------------------------")
        .printLine(\`Compras Pagadas: -$ \${corteData.totalPurchasesPaid.toFixed(2)}\`)
        .printLine(\`Compras Credito:  $ \${corteData.totalPurchasesCredit.toFixed(2)}\`)
        .printLine("--------------------------------")
        .bold(true)
        .printLine(\`CAJA NETA Efect: $\${corteData.netCashFlow.toFixed(2)}\`)
        .bold(false)`
);


fs.writeFileSync('src/App.tsx', code);
console.log("Updated flow ticket");
