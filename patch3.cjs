
const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the widget subtext
appContent = appContent.replace(
  /Eliminar.* los productos de la sucursal actual e importar.* la carta seleccionada\. El sistema realiza un respaldo autom.*tico antes de continuar\./,
  'Ocultará lógicamente los productos antiguos e importará la carta exacta. Tus cortes de venta antiguos y tickets quedan protegidos.'
);

// Replace the modal bullet point
appContent = appContent.replace(
  /<li>Se eliminar.*n todos los productos de la sucursal actual/g,
  '<li>Se ocultarán (borrado lógico) todos los productos de la sucursal actual'
);

fs.writeFileSync('src/App.tsx', appContent);

