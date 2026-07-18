import * as fs from 'fs';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add firestore imports
appCode = appCode.replace(
  `  deleteInventoryItemFromFirebase,
} from "./utils/firestore";`,
  `  deleteInventoryItemFromFirebase,
  subscribeToCashMovements,
  addCashMovementToFirebase,
} from "./utils/firestore";`
);

// 2. Add cashMovements state
appCode = appCode.replace(
  `  const [inventoryPage, setInventoryPage] = useState(1);`,
  `  const [inventoryPage, setInventoryPage] = useState(1);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);`
);

// 3. Add subscription
appCode = appCode.replace(
  `    const unsubPurchases = subscribeToPurchases((data) => {
      setPurchases(data);
    });`,
  `    const unsubPurchases = subscribeToPurchases((data) => {
      setPurchases(data);
    });

    const unsubCashMovements = subscribeToCashMovements((data) => {
      const parsedMovements = (data || []).map((m: any) => ({
        ...m,
        date: m.date instanceof Date ? m.date : new Date(m.date),
      }));
      setCashMovements(parsedMovements);
    });`
);

// 4. Add unsubCashMovements
appCode = appCode.replace(
  `              unsubInv();
        unsubPurchases();
    };`,
  `              unsubInv();
        unsubPurchases();
        unsubCashMovements();
    };`
);

fs.writeFileSync('src/App.tsx', appCode);
console.log('Added cashMovements state and subscription to App.tsx');
