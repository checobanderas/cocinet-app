const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const r = /filter\(\(p\) => !menuFilterNode \|\| p\.subcategory === menuFilterNode\)\s*\.map\(\(p\) => \(\s*<tr\s*key={p\.id}\s*style={{ borderBottom: "1px solid #e2e8f0" }}\s*>/;
let newContent = content.replace(r, `filter((p) => !menuFilterNode || p.subcategory === menuFilterNode)
                        .filter((p) => showDeletedAdmin || p.isDeleted !== true)
                        .map((p) => (
                          <tr
                            key={p.id}
                            style={{ 
                                borderBottom: '1px solid #e2e8f0',
                                backgroundColor: p.isDeleted ? '#ffedd5' : 'transparent', // Orange background for logically deleted
                            }}
                          >`);
if (newContent !== content) {
    fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
    console.log('Fixed tbody mapping and row color via regex');
} else {
    console.log('Could not find match');
}
