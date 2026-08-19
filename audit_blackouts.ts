import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from 'fs';

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

function parseDate(val: any) {
  if (!val) return null;
  if (typeof val === 'string') return new Date(val);
  if (val.toDate) return val.toDate();
  return null;
}

async function run() {
  console.log("Fetching all tenants...");
  const tenantsSnap = await getDocs(collection(db, "tenants"));
  const tenants: any = {};
  tenantsSnap.forEach(t => {
     tenants[t.id] = t.data().name || t.id;
  });

  console.log("Fetching notifications from August 2026...");
  const notifSnap = await getDocs(collection(db, "notifications"));
  const dailyNotifs: any = {};
  
  notifSnap.forEach(d => {
    const data = d.data();
    if (data.isCuentaNotification || (data.title && data.title.includes("PRECUENTA"))) {
      const dObj = parseDate(data.createdAt || data.timestamp || data.date);
      if (dObj && dObj.getFullYear() === 2026 && dObj.getMonth() === 7) {
         const tName = tenants[data.tenantId] || data.tenantId;
         const day = dObj.toISOString().split('T')[0];
         
         if (!dailyNotifs[tName]) dailyNotifs[tName] = {};
         if (!dailyNotifs[tName][day]) dailyNotifs[tName][day] = 0;
         dailyNotifs[tName][day]++;
      }
    }
  });

  console.log("Fetching history from August 2026...");
  const historySnap = await getDocs(collection(db, "history"));
  const dailyHistory: any = {};
  historySnap.forEach(d => {
    const data = d.data();
    const dObj = parseDate(data.timestamp || data.updatedAt);
    if (dObj && dObj.getFullYear() === 2026 && dObj.getMonth() === 7) {
       const tName = tenants[data.tenantId] || data.tenantId;
       const day = dObj.toISOString().split('T')[0];
       
       if (!dailyHistory[tName]) dailyHistory[tName] = {};
       if (!dailyHistory[tName][day]) dailyHistory[tName][day] = 0;
       dailyHistory[tName][day]++;
    }
  });

  console.log("\n--- REPORTE DE APAGONES MASIVOS (AGOSTO 2026) ---");
  let blackoutFound = false;

  for (const tName of Object.keys(dailyNotifs)) {
     for (const day of Object.keys(dailyNotifs[tName])) {
        const notifCount = dailyNotifs[tName][day];
        const histCount = (dailyHistory[tName] && dailyHistory[tName][day]) ? dailyHistory[tName][day] : 0;
        
        // Criterio de apagón: Hay más de 20 notificaciones, pero el historial es menos del 20% de las notificaciones
        if (notifCount > 20 && histCount < (notifCount * 0.2)) {
           blackoutFound = true;
           console.log(`⚠️ ALERTA EN: ${tName}`);
           console.log(`   Fecha: ${day}`);
           console.log(`   Precuentas impresas: ${notifCount}`);
           console.log(`   Ventas cobradas en nube: ${histCount}`);
           console.log(`   Porcentaje de pérdida: ${Math.round((1 - histCount/notifCount)*100)}%`);
           console.log(`----------------------------------------`);
        }
     }
  }

  if (!blackoutFound) {
     console.log("✅ Excelente noticia: No se encontraron apagones masivos en ninguna otra sucursal ni fecha en Agosto.");
  }
}

run().catch(console.error);
