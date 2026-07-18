import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add missing imports
code = code.replace(
  'subscribeToInventory,',
  'subscribeToInventory,\n  subscribeToPurchases,\n  addPurchaseToFirebase,\n  updatePurchaseStatusInFirebase,'
);

// 2. Add `purchases` to `manageMenuTab`
code = code.replace(
  '"upload" | "crud" | "recipes" | "inventory"',
  '"upload" | "crud" | "recipes" | "purchases"'
);

// 3. Add `inventory` to `configActiveTab`
code = code.replace(
  'const [configActiveTab, setConfigActiveTab] = useState<"system" | "corte">(\n    "system",\n  );',
  'const [configActiveTab, setConfigActiveTab] = useState<"system" | "corte" | "inventory">("system");'
);

// 4. Add purchases state and subscription
const stateBlock = `  const [inventory, setInventory] = useState<any[]>([]);\n  const [purchases, setPurchases] = useState<any[]>([]);\n  const [purchaseForm, setPurchaseForm] = useState({ supplier: "", items: [] as { inventoryItemId: string, qty: number, price: number }[], isPaid: true });`;

code = code.replace(
  'const [inventory, setInventory] = useState<any[]>([]);',
  stateBlock
);

const effBlock = `      const unsubInv = subscribeToInventory((data) => setInventory(data));\n      const unsubPurchases = subscribeToPurchases((data) => setPurchases(data));`;

code = code.replace(
  'const unsubInv = subscribeToInventory((data) => setInventory(data));',
  effBlock
);

const retBlock = `        unsubInv();\n        unsubPurchases();`;

code = code.replace(
  'unsubInv();',
  retBlock
);
fs.writeFileSync('src/App.tsx', code);
console.log("Basic updates applied.");
