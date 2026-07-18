import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/\\x7b/g, '{').replace(/\\x7d/g, '}');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed syntax");
