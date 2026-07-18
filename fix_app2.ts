import * as fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("useState(false);\\n", "useState(false);\n");
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed literal backslash N');
