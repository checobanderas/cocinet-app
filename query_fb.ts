import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI",
  authDomain: "cocinet-app.firebaseapp.com",
  projectId: "cocinet-app",
  storageBucket: "cocinet-app.firebasestorage.app",
  messagingSenderId: "315374858436",
  appId: "1:315374858436:web:c432699c575403bfe91991",
  measurementId: "G-GX3HLJPQHW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log("Fetching tenants...");
  const tenantsSnap = await getDocs(collection(db, "tenants"));
  let targetTenant = null;
  tenantsSnap.forEach((doc) => {
    const data = doc.data();
    console.log("Tenant:", doc.id, "=>", data.name, data.owner);
    if (data.name?.toUpperCase().includes("AZUCENA") || data.owner?.toUpperCase().includes("BLADIMIR")) {
      targetTenant = doc.id;
    }
  });

  if (!targetTenant) {
    console.log("Tenant not found.");
    return;
  }
  
  console.log("Found tenant ID:", targetTenant);
  
  const closuresRef = collection(db, "tenants", targetTenant, "shift_closures_v2");
  const q = query(closuresRef); // Get all or filter by date
  const snap = await getDocs(q);
  
  const cuts = [];
  snap.forEach(d => {
    cuts.push({ id: d.id, ...d.data() });
  });

  console.log("Found", cuts.length, "shift_closures_v2");
  
  const targetDates = cuts.filter(c => c.date && (c.date.startsWith("2026-08-11") || c.date.startsWith("2026-08-12")));
  console.log("Cuts for 11 and 12 Aug:", JSON.stringify(targetDates, null, 2));

  // Let's also check if there is a 'cortes' collection, just in case
  const oldClosuresRef = collection(db, "tenants", targetTenant, "cortes");
  const oldSnap = await getDocs(oldClosuresRef);
  const oldCuts = [];
  oldSnap.forEach(d => oldCuts.push({id: d.id, ...d.data()}));
  
  const oldTargetDates = oldCuts.filter(c => c.date && (c.date.startsWith("2026-08-11") || c.date.startsWith("2026-08-12")));
  console.log("Old Cortes for 11 and 12 Aug:", JSON.stringify(oldTargetDates, null, 2));

  // Let's also check if there are sales for those days in 'pedidos' or 'comandas'
  console.log("Checking pedidos...");
  const pedidosRef = collection(db, "tenants", targetTenant, "pedidos");
  const pSnap = await getDocs(pedidosRef);
  let sales11 = 0;
  let sales12 = 0;
  pSnap.forEach(d => {
    const p = d.data();
    if (p.createdAt && p.createdAt.startsWith("2026-08-11") && p.status !== "cancelled") sales11++;
    if (p.createdAt && p.createdAt.startsWith("2026-08-12") && p.status !== "cancelled") sales12++;
    if (p.date && p.date.startsWith("2026-08-11") && p.status !== "cancelled") sales11++;
    if (p.date && p.date.startsWith("2026-08-12") && p.status !== "cancelled") sales12++;
  });
  console.log(`Pedidos found - Aug 11: ${sales11}, Aug 12: ${sales12}`);
}

main().catch(console.error);
