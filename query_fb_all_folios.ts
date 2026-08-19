import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

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
  const historySnap = await getDocs(collection(db, "history"));
  let allFolios = new Set();
  
  historySnap.forEach(d => {
    const data = d.data();
    if (data.tenantId === "tenant-9") {
      const dateStr = data.createdAt || data.date || data.timestamp || data.cierreDate;
      let isTargetDate = false;
      if (dateStr && typeof dateStr === 'string' && (dateStr.includes("2026-08-11") || dateStr.includes("2026-08-12"))) {
        isTargetDate = true;
      } else if (dateStr && dateStr.toDate) {
        const dStr = dateStr.toDate().toISOString();
        if (dStr.includes("2026-08-11") || dStr.includes("2026-08-12")) isTargetDate = true;
      }
      
      if (isTargetDate && data.folioInterno) {
         allFolios.add(data.folioInterno);
      }
    }
  });

  console.log("All unique folioInterno values for tenant-9 on 11/12:");
  console.log(Array.from(allFolios));
}

check().catch(console.error);
