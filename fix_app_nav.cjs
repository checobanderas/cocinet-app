const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /setAppMode\(checkoutReturnMode \|\| "floorplan"\);\s*if \(checkoutReturnMode === "gestion_cuentas"\) \{\s*setSelectedTableGestion\(null\);\s*\}\s*setCheckoutReturnMode\(null\);/g;

let matches = 0;
content = content.replace(targetRegex, (match) => {
    matches++;
    const leadingWsMatch = match.match(/^\s*/);
    const ws = leadingWsMatch ? leadingWsMatch[0] : "";
    return `const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
${ws}setAppMode(nextMode);
${ws}if (checkoutReturnMode === "gestion_cuentas") {
${ws}  setSelectedTableGestion(null);
${ws}}
${ws}setCheckoutReturnMode(null);`;
});

fs.writeFileSync(file, content);
console.log('Replaced ' + matches + ' occurrences successfully.');
