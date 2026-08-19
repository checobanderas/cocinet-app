const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = '    pendingPedidos.forEach((pedido) => {\\n      const isAlreadyProcessed = processedPrintIdsRef.current.has(pedido.id);\\n\\n      if (isAlreadyProcessed) return;';
const targetRegex = /pendingPedidos\.forEach\(\(pedido\) => {\s*const isAlreadyProcessed = processedPrintIdsRef\.current\.has\(pedido\.id\);\s*if \(isAlreadyProcessed\) return;/m;

const replacement = `pendingPedidos.forEach((pedido) => {
      const isAlreadyProcessed = 
        processedPrintIdsRef.current.has(pedido.id) ||
        (pedido.tipo === "cuenta" && pedido.folio && processedPrintIdsRef.current.has(pedido.folio));

      if (isAlreadyProcessed) return;`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patch applied successfully via regex!');
} else {
  console.log('Target code not found with regex.');
}
