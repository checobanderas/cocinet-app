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
  const tenant = "tenant-9";
  const colRef = collection(db, "tenants", tenant, "pedidos");
  const snap = await getDocs(colRef);
  const users = new Set();
  let brayamCount = 0;
  let roxanaCount = 0;
  let otherCount = 0;
  
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
      const u = data.mesero || data.createdBy || data.cajero || data.user || "UNKNOWN";
      users.add(u);
      if (u.toUpperCase().includes("BRAYAM") || u.toUpperCase().includes("BRYAM")) {
        brayamCount++;
      } else if (u.toUpperCase().includes("ROXANA") || u.toUpperCase().includes("ROX")) {
        roxanaCount++;
      } else {
        otherCount++;
      }
    }
  });

  console.log("Unique users on 11/12:", Array.from(users));
  console.log(`Counts -> Brayam: ${brayamCount}, Roxana: ${roxanaCount}, Other: ${otherCount}`);
}

check().catch(console.error);
