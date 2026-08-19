import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
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
  // Note: Because we might have thousands of notifications, we'll fetch all and filter in memory for safety.
  // In a massive production DB we'd use index queries, but for a month it's fine.
  const notifSnap = await getDocs(collection(db, "notifications"));
  let notifications: any[] = [];
  
  notifSnap.forEach(d => {
    const data = d.data();
    if (data.isCuentaNotification || (data.title && data.title.includes("PRECUENTA"))) {
      const dObj = parseDate(data.createdAt || data.timestamp || data.date);
      if (dObj && dObj.getFullYear() === 2026 && dObj.getMonth() === 7) { // August is month 7 (0-indexed)
         notifications.push({
           id: d.id,
           tenantId: data.tenantId,
           dateObj: dObj,
           mesa: data.tableLabel,
           total: parseFloat(data.total) || 0,
           items: data.items || [],
           title: data.title
         });
      }
    }
  });

  console.log(`Found ${notifications.length} precuenta notifications in August 2026.`);

  console.log("Fetching history from August 2026...");
  const historySnap = await getDocs(collection(db, "history"));
  let history: any[] = [];
  historySnap.forEach(d => {
    const data = d.data();
    const dObj = parseDate(data.timestamp || data.updatedAt);
    if (dObj && dObj.getFullYear() === 2026 && dObj.getMonth() === 7) {
       history.push({
         id: d.id,
         tenantId: data.tenantId,
         dateObj: dObj,
         mesa: data.tableLabel,
         total: parseFloat(data.total) || 0
       });
    }
  });
  console.log(`Found ${history.length} history records in August 2026.`);

  console.log("Fetching all active pedidos...");
  let pedidos: any[] = [];
  for (const tId of Object.keys(tenants)) {
    const pSnap = await getDocs(collection(db, "tenants", tId, "pedidos"));
    pSnap.forEach(d => {
       const data = d.data();
       const dObj = parseDate(data.timestamp || data.updatedAt);
       pedidos.push({
         id: d.id,
         tenantId: tId,
         dateObj: dObj || new Date(),
         mesa: data.tableLabel,
         total: parseFloat(data.total) || 0
       });
    });
  }
  console.log(`Found ${pedidos.length} active pedidos.`);

  const allCloudSales = [...history, ...pedidos];

  // Group by tenant
  const salesByTenant: any = {};
  for (const s of allCloudSales) {
     if (!salesByTenant[s.tenantId]) salesByTenant[s.tenantId] = [];
     salesByTenant[s.tenantId].push(s);
  }

  // Cross reference
  const discrepancies: any[] = [];
  const matchedNotifs = [];

  for (const n of notifications) {
     const tenantSales = salesByTenant[n.tenantId] || [];
     let match = null;

     for (let i = 0; i < tenantSales.length; i++) {
        const s = tenantSales[i];
        if (s.mesa === n.mesa && Math.abs(s.total - n.total) < 1) {
           // Check time difference (within 16 hours)
           const diffHours = Math.abs(s.dateObj.getTime() - n.dateObj.getTime()) / (1000 * 60 * 60);
           if (diffHours < 16) {
              match = s;
              // Remove from pool to avoid double matching
              tenantSales.splice(i, 1);
              break;
           }
        }
     }

     if (!match) {
        discrepancies.push(n);
     } else {
        matchedNotifs.push(n);
     }
  }

  console.log(`Analysis complete. Matched: ${matchedNotifs.length}, Discrepancies: ${discrepancies.length}`);

  // Group discrepancies by tenant and day
  const report: any = {};
  for (const d of discrepancies) {
     const tName = tenants[d.tenantId] || d.tenantId;
     const day = d.dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
     
     if (!report[tName]) report[tName] = {};
     if (!report[tName][day]) report[tName][day] = [];
     
     report[tName][day].push(d);
  }

  fs.writeFileSync('audit_report.json', JSON.stringify({
     summary: Object.keys(report).map(tName => ({
        tenant: tName,
        days: Object.keys(report[tName]).map(day => ({
           date: day,
           missingCount: report[tName][day].length
        }))
     })),
     raw_discrepancies: report
  }, null, 2));

  console.log("Report saved to audit_report.json");
}

run().catch(console.error);
