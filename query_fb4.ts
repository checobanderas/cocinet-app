import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI",
  authDomain: "cocinet-app.firebaseapp.com",
  projectId: "cocinet-app",
  storageBucket: "cocinet-app.firebasestorage.app",
  messagingSenderId: "315374858436",
  appId: "1:315374858436:web:c432699c575403bfe91991"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check(tenant) {
  console.log(`Checking tenant: ${tenant}...`);
  const collectionsToCheck = ["cuentas", "closed_accounts", "comandas", "pedidos", "shift_closures_v2", "shift_closures", "cortes"];
  for (const col of collectionsToCheck) {
    const ref = collection(db, "tenants", tenant, col);
    const snap = await getDocs(query(ref));
    let count11 = 0;
    let count12 = 0;
    snap.forEach(d => {
      const data = d.data();
      const dateStr = data.createdAt || data.date || data.timestamp || data.cierreDate;
      if (dateStr && typeof dateStr === 'string') {
        if (dateStr.includes("2026-08-11")) count11++;
        if (dateStr.includes("2026-08-12")) count12++;
      } else if (dateStr && dateStr.toDate) {
        const d = dateStr.toDate().toISOString();
        if (d.includes("2026-08-11")) count11++;
        if (d.includes("2026-08-12")) count12++;
      }
    });
    if (count11 > 0 || count12 > 0) {
      console.log(`  ${col} found - Aug 11: ${count11}, Aug 12: ${count12}`);
    }
  }
}

async function main() {
  await check("tenant-9");
  await check("tenant-15");
  // Also check 377e04fd-fb7a-4d0b-8cae-5c75de2f77c6
  await check("377e04fd-fb7a-4d0b-8cae-5c75de2f77c6");
}

main().catch(console.error);
