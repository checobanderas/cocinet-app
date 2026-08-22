const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'products\r\n                        .filter((p) => p.category === manageMenuTab && p.subcategory)',
  'products\r\n                        .filter((p) => p.isDeleted !== true && p.category === manageMenuTab && p.subcategory)'
);

fs.writeFileSync('src/App.tsx', content);
