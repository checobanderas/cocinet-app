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

async function searchNotifications() {
  console.log("Searching notifications collection for Aug 11-12...");
  const snap = await getDocs(collection(db, "notifications"));
  let totalFound = 0;
  let tenantCounts = {};
  
  snap.forEach(d => {
    const data = d.data();
    const dateStr = data.createdAt || data.timestamp || data.date;
    
    let isTargetDate = false;
    if (dateStr && typeof dateStr === 'string' && (dateStr.includes("2026-08-11") || dateStr.includes("2026-08-12"))) {
      isTargetDate = true;
    } else if (dateStr && dateStr.toDate) {
      const dStr = dateStr.toDate().toISOString();
      if (dStr.includes("2026-08-11") || dStr.includes("2026-08-12")) isTargetDate = true;
    }
    
    if (isTargetDate) {
      totalFound++;
      const t = data.tenantId || "NO_TENANT";
      tenantCounts[t] = (tenantCounts[t] || 0) + 1;
      
      // Let's sample a few if it's tenant-9 or Azucenas
      if (t === "tenant-9" && totalFound <= 5) {
        console.log(`\nSample tenant-9 notification:`, JSON.stringify({
          id: d.id,
          title: data.title,
          body: data.body,
          folio: data.folio,
          tableLabel: data.tableLabel,
          atendidoPor: data.atendidoPor,
          createdAt: dateStr
        }, null, 2));
      }
    }
  });

  console.log(`\nTotal notifications found for Aug 11-12: ${totalFound}`);
  console.log("Breakdown by tenant:", tenantCounts);
}

searchNotifications().catch(console.error);
