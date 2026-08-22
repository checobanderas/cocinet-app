const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add state
const stateRegex = /(const \[manageMenuTab, setManageMenuTab\] = useState<"food" \| "drinks" \| "desserts">.*?);/;
content = content.replace(stateRegex, `$1\n  const [showDeletedAdmin, setShowDeletedAdmin] = useState(false);`);

// 2. Add filter to the map
const mapRegex = /(\.filter\(\(p\) => p\.category === manageMenuTab\)\s*\n\s*\.filter\(\(p\) => !menuSearchQuery \|\| \s*p\.name\.toLowerCase\(\)\.includes\(menuSearchQuery\.toLowerCase\(\)\)\)\s*\n\s*\.filter\(\(p\) => !menuFilterNode \|\| p\.subcategory === menuFilterNode\))/;

if (content.match(mapRegex)) {
    content = content.replace(mapRegex, `$1\n                          .filter((p) => showDeletedAdmin || p.isDeleted !== true)`);
} else {
    console.log("Could not find the map regex for admin menu list.");
}

// 3. Add Checkbox UI
const uiRegex = /(<select\s*value=\{menuFilterNode\}[\s\S]*?<\/select>)/;
if (content.match(uiRegex)) {
    const checkboxUI = `
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#475569", cursor: "pointer", marginLeft: "10px" }}>
                    <input type="checkbox" checked={showDeletedAdmin} onChange={(e) => setShowDeletedAdmin(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#ef4444" }} />
                    Mostrar borrados lógicamente
                  </label>
`;
    content = content.replace(uiRegex, `$1\n${checkboxUI}`);
    console.log("Injected UI checkbox.");
} else {
    console.log("Could not find the select element for menuFilterNode.");
}

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('App.tsx updated using node.');
