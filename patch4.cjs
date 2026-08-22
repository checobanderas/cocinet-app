const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'products\r\n          .filter((p) => p.category === activeCategory)\r\n          .map((p) => p.subcategory)',
  'products\r\n          .filter((p) => p.isDeleted !== true && p.category === activeCategory)\r\n          .map((p) => p.subcategory)'
);

content = content.replace(
  'products\r\n          .filter((p) => p.category === activeCategory)\r\n          .map((p) => p.subcategory)',
  'products\r\n          .filter((p) => p.isDeleted !== true && p.category === activeCategory)\r\n          .map((p) => p.subcategory)'
);

content = content.replace(
  'products\n                        .filter((p) => p.category === manageMenuTab && p.subcategory)',
  'products\n                        .filter((p) => p.isDeleted !== true && p.category === manageMenuTab && p.subcategory)'
);

content = content.replace(
  'products.map((p) => p.subcategory || \"\").filter(Boolean).sort()',
  'products.filter(p => p.isDeleted !== true).map((p) => p.subcategory || \"\").filter(Boolean).sort()'
);

content = content.replace(
  'products\n          .filter((p) => p.category === crudSelectedCategory)',
  'products\n          .filter((p) => p.isDeleted !== true && p.category === crudSelectedCategory)'
);

content = content.replace(
  'products.map((p) => p.subgroup || \"\").filter(Boolean).sort()',
  'products.filter(p => p.isDeleted !== true).map((p) => p.subgroup || \"\").filter(Boolean).sort()'
);

fs.writeFileSync('src/App.tsx', content);
