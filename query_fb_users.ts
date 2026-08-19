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

async function check() {
  const tenant = "tenant-9";
  const colRef = collection(db, "tenants", tenant, "pedidos");
  const snap = await getDocs(colRef);
  const users = new Set();
  
  snap.forEach(d => {
    const data = d.data();
    const dateStr = data.createdAt || data.date || data.timestamp || data.cierreDate;
    if (dateStr && (dateStr.includes("2026-08-11") || dateStr.includes("2026-08-12"))) {
      if (data.createdBy) users.add(data.createdBy);
      if (data.cajero) users.add(data.cajero);
      if (data.user) users.add(data.user);
      if (data.mesero) users.add(data.mesero);
    }
  });

  console.log("Users found in pedidos on 11/12:", Array.from(users));
  
  const scRef = collection(db, "tenants", tenant, "shift_closures_v2");
  const scSnap = await getDocs(scRef);
  const scUsers = new Set();
  scSnap.forEach(d => {
    const data = d.data();
    if (data.date && (data.date.includes("2026-08-11") || data.date.includes("2026-08-12"))) {
      scUsers.add(data.operador || data.createdBy || data.user);
    }
  });
  console.log("Users found in shift_closures_v2 on 11/12:", Array.from(scUsers));
}

check().catch(console.error);
