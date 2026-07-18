import * as fs from 'fs';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  `} = {};
    completedHistory.forEach((h) => {`,
  `} = {};
    
    let cashInFromMovements = 0;
    let cashOutFromMovements = 0;
    
    cashMovements.forEach(m => {
      if (m.type === 'in') cashInFromMovements += Number(m.amount || 0);
      else if (m.type === 'out') cashOutFromMovements += Number(m.amount || 0);
    });

    completedHistory.forEach((h) => {`
);

appCode = appCode.replace(
  `netCashFlow: cashSales - totalPurchasesPaid,
      cashSales,`,
  `netCashFlow: cashSales + cashInFromMovements - cashOutFromMovements - totalPurchasesPaid,
      cashSales,
      cashInFromMovements,
      cashOutFromMovements,
      totalCashMovements: cashMovements,`
);

// We must also update generateCorteTicketText
appCode = appCode.replace(
  `      cashSales,
      cardSales,
      transSales,
      totalPurchasesPaid,
      totalPurchasesCredit,
      netCashFlow,
      topSold,
      canceledItems,
    } = corteData;`,
  `      cashSales,
      cardSales,
      transSales,
      totalPurchasesPaid,
      totalPurchasesCredit,
      netCashFlow,
      topSold,
      canceledItems,
      cashInFromMovements,
      cashOutFromMovements,
      totalCashMovements,
    } = corteData;`
);

appCode = appCode.replace(
  `job
        .bold(true)
        .printLine(\`Efectivo:      $ \${cashSales.toFixed(2)}\`)
        .printLine(\`Tarjeta:       $ \${cardSales.toFixed(2)}\`)
        .printLine(\`Transferencia: $ \${transSales.toFixed(2)}\`)
        .bold(false);
      job.printLine("--------------------------------");
      if (totalPurchasesPaid > 0 || totalPurchasesCredit > 0) {
        job.printLine("MOVIMIENTOS (COMPRAS)");
        job
          .printLine(\`Compras Pagadas: -$ \${totalPurchasesPaid.toFixed(2)}\`)
          .printLine(\`Compras Credito:  $ \${totalPurchasesCredit.toFixed(2)}\`)
          .printLine("--------------------------------");
      }
      job.bold(true);
      job
        .printLine(\`CAJA NETA Efect: \${netCashFlow.toFixed(2)}\`)
        .printLine("--------------------------------");
      job.bold(false);`,
  `job
        .bold(true)
        .printLine(\`Efectivo:      $ \${cashSales.toFixed(2)}\`)
        .printLine(\`Tarjeta:       $ \${cardSales.toFixed(2)}\`)
        .printLine(\`Transferencia: $ \${transSales.toFixed(2)}\`)
        .bold(false);
      job.printLine("--------------------------------");
      if (totalPurchasesPaid > 0 || totalPurchasesCredit > 0 || totalCashMovements.length > 0) {
        job.printLine("MOVIMIENTOS DE CAJA");
        
        if (cashInFromMovements > 0) {
          job.printLine(\`Entradas:      +$ \${cashInFromMovements.toFixed(2)}\`);
        }
        if (cashOutFromMovements > 0) {
          job.printLine(\`Salidas/Retiros:-$ \${cashOutFromMovements.toFixed(2)}\`);
        }
        
        if (totalPurchasesPaid > 0 || totalPurchasesCredit > 0) {
          job
            .printLine(\`Compras Pagadas: -$ \${totalPurchasesPaid.toFixed(2)}\`)
            .printLine(\`Compras Credito:  $ \${totalPurchasesCredit.toFixed(2)}\`);
        }
        job.printLine("--------------------------------");
      }
      job.bold(true);
      job
        .printLine(\`CAJA NETA Efect: \${netCashFlow.toFixed(2)}\`)
        .printLine("--------------------------------");
      job.bold(false);`
);

appCode = appCode.replace(
  `[history, tables]);`,
  `[history, tables, cashMovements]);`
);


fs.writeFileSync('src/App.tsx', appCode);
console.log('Updated corteData logic');
