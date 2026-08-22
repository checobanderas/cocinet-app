
const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
  'deleteAllProductsFromFirebase,',
  'deleteAllProductsFromFirebase, softDeleteAllProductsFromFirebase,'
);

// In handleImportTenantMenu
appContent = appContent.replace(
  'await deleteAllProductsFromFirebase(selectedTenant.id, destBranchName, products);',
  'await softDeleteAllProductsFromFirebase(selectedTenant.id, destBranchName, products);'
);

// Add the isDeleted: false to new products in bulk add
appContent = appContent.replace(
  'tenantId: selectedTenant.id,',
  'tenantId: selectedTenant.id,\n          isDeleted: false,'
);

// Update widget text
appContent = appContent.replace(
  'Eliminar\xC3\xA1 los productos de la sucursal actual e importar\xC3\xA1 la carta seleccionada',
  'Ocultar\xC3\xA1 l\xC3\xB3gicamente los productos obsoletos y clonar\xC3\xA1 la carta exacta'
);

appContent = appContent.replace(
  'Est\xC3\xA1s a punto de <strong>BORRAR COMPLETAMENTE</strong> todos los productos de esta sucursal',
  'Est\xC3\xA1s a punto de <strong>CLONAR EL MEN\xC3\x9A</strong> y realizar un borrado l\xC3\xB3gico (ocultar) sobre los obsoletos de'
);

// Add filtering logic to the map where cashier renders it
// The POS display Products is usually baseProducts or displayProducts
// Let's filter out products with isDeleted === true right after 'const baseProducts = products.filter(...'
appContent = appContent.replace(
  'const baseProducts = products.filter(',
  'const baseProducts = products.filter(p => p.isDeleted !== true).filter('
);

// Also filter in menu maps if necessary
appContent = appContent.replace(
  'const filteredProducts = products.filter(',
  'const filteredProducts = products.filter(p => p.isDeleted !== true).filter('
);

fs.writeFileSync('src/App.tsx', appContent);
console.log('patched App.tsx');

