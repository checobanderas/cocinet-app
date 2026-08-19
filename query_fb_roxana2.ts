import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
  const tenantsSnap = await getDocs(collection(db, "tenants"));
  for (const t of tenantsSnap.docs) {
    const tenant = t.id;
    const collections = ["comandas", "cuentas", "closed_accounts", "pedidos", "shift_closures_v2"];
    for (const col of collections) {
      const colRef = collection(db, "tenants", tenant, col);
      const snap = await getDocs(colRef);
      snap.forEach(d => {
        const data = d.data();
        const dateStr = data.createdAt || data.date || data.timestamp || data.cierreDate;
        let isTargetDate = false;
        if (dateStr && typeof dateStr === 'string' && (dateStr.includes("2026-08-11") || dateStr.includes("2026-08-12"))) {
          isTargetDate = true;
        } else if (dateStr && dateStr.toDate) {
          const dStr = dateStr.toDate().toISOString();
          if (dStr.includes("2026-08-11") || dStr.includes("2026-08-12")) isTargetDate = true;
        }
        
        if (isTargetDate) {
          const usrStr = `${data.createdBy} ${data.cajero} ${data.user} ${data.mesero} ${data.operador} ${data.atendidoPor}`.toUpperCase();
          if (usrStr.includes("ROXANA")) {
             console.log(`FOUND Roxana in tenant ${tenant}, collection ${col}, doc ${d.id}`);
          }
        }
      });
    }
  }
  console.log("Done searching for Roxana with atendidoPor.");
}

check().catch(console.error);
