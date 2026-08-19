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
    const tData = t.data();
    if (!tData.name?.toUpperCase().includes("AZUCENA") && !tData.owner?.toUpperCase().includes("BLADIMIR")) {
      continue;
    }
    console.log("Checking tenant:", t.id, tData.name, tData.owner);
    const scRef = collection(db, "tenants", t.id, "shift_closures_v2");
    const scSnap = await getDocs(scRef);
    console.log(`  Found ${scSnap.size} shift_closures_v2`);
    scSnap.forEach(d => {
      const c = d.data();
      if (c.date?.includes("2026-08-11") || c.date?.includes("2026-08-12") || c.id.includes("2026-08-11") || c.id.includes("2026-08-12")) {
        console.log(`    MATCH: id=${d.id} date=${c.date} total=${c.total} status=${c.status}`);
      }
    });

    const scRef1 = collection(db, "tenants", t.id, "shift_closures");
    const scSnap1 = await getDocs(scRef1);
    console.log(`  Found ${scSnap1.size} shift_closures`);
    scSnap1.forEach(d => {
      const c = d.data();
      if (c.date?.includes("2026-08-11") || c.date?.includes("2026-08-12") || c.id.includes("2026-08-11") || c.id.includes("2026-08-12")) {
        console.log(`    MATCH: id=${d.id} date=${c.date} total=${c.total} status=${c.status}`);
      }
    });
  }
}

check().catch(console.error);
