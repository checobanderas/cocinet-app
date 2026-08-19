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
  
  let brayamTotal = 0;
  let nonBrayamTotal = 0;
  let devices = new Set();
  
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
      if (usrStr.includes("BRAYAM") || usrStr.includes("BRYAM")) {
        brayamTotal++;
      } else {
        nonBrayamTotal++;
        console.log("Non-Brayam Doc:", JSON.stringify(data, null, 2));
      }
      
      // Check for any device/geo fields
      if (data.deviceId) devices.add(data.deviceId);
      if (data.mac) devices.add(data.mac);
      if (data.ip) devices.add(data.ip);
    }
  });

  console.log(`Total Brayam: ${brayamTotal}, Total Non-Brayam: ${nonBrayamTotal}`);
  console.log("Devices/IPs found:", Array.from(devices));
}

check().catch(console.error);
