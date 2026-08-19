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

const foliosToFind = [
  "1", "36", "35", "34", "24", "23", "17", "16", "15", "14", "13", "12",
  "05607", "05605", "05609", "05602", "05599", "05606", "05608", "05598",
  "05604", "05603", "05600", "05601", "05597", "05595", "05593", "05596",
  "05594", "05592", "05586", "05590", "05585", "05589", "05588", "05591",
  "05587", "05581", "05584", "05582", "05580", "05579", "05583", "05576",
  "05574", "05578", "05572", "05571", "05560", "05570", "05577", "05568",
  "05573", "05575", "05562", "05569", "05566", "05567", "05565", "05559",
  "05554", "05563", "05564", "05561", "05558", "05556", "05535", "05557",
  "05555", "05551", "05552", "05553", "05549", "05547", "05550", "05545",
  "05546", "05531", "05543", "05544", "05542", "05548", "05540", "05541",
  "05532", "05534", "05536", "05539", "05538", "05537", "05533", "05530",
  "05529", "05526", "05524", "05512", "05513", "05525", "05528", "05527",
  "05515", "05519", "05503", "05522", "05523", "05521", "05518", "05520",
  "05516", "05517", "05509", "05508", "05514", "05511", "05510", "05506",
  "05507", "05505", "05504"
];

function checkFolio(data) {
  let found = [];
  
  // Check top level
  if (data.folioInterno) {
    const vals = data.folioInterno.split(',').map(v => v.replace('#', '').trim());
    for (const v of vals) {
      if (foliosToFind.includes(v)) found.push(v);
    }
  }

  // Check items
  if (data.items && Array.isArray(data.items)) {
    data.items.forEach(item => {
      if (item.folioInterno) {
        const vals = item.folioInterno.split(',').map(v => v.replace('#', '').trim());
        for (const v of vals) {
          if (foliosToFind.includes(v)) found.push(v);
        }
      }
    });
  }
  
  // Check comandas
  if (data.comandas && Array.isArray(data.comandas)) {
    data.comandas.forEach(com => {
      if (com.folioInterno) {
        const vals = com.folioInterno.split(',').map(v => v.replace('#', '').trim());
        for (const v of vals) {
          if (foliosToFind.includes(v)) found.push(v);
        }
      }
      if (com.items && Array.isArray(com.items)) {
         com.items.forEach(item => {
           if (item.folioInterno) {
             const vals = item.folioInterno.split(',').map(v => v.replace('#', '').trim());
             for (const v of vals) {
               if (foliosToFind.includes(v)) found.push(v);
             }
           }
         });
      }
    });
  }

  return [...new Set(found)];
}

async function search() {
  console.log("Searching in tenant-9 for the provided folios...");
  let foundCount = 0;
  
  const cols = ["pedidos", "cuentas", "closed_accounts"];
  for (const col of cols) {
    const snap = await getDocs(collection(db, "tenants", "tenant-9", col));
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
        const matched = checkFolio(data);
        if (matched.length > 0) {
          foundCount++;
          console.log(`[${col}] Doc: ${d.id} matches folios: ${matched.join(', ')}`);
        }
      }
    });
  }
  
  console.log(`\nSearch in history collection...`);
  const historySnap = await getDocs(collection(db, "history"));
  historySnap.forEach(d => {
    const data = d.data();
    if (data.tenantId === "tenant-9") {
      const matched = checkFolio(data);
      if (matched.length > 0) {
        foundCount++;
        console.log(`[history] Doc: ${d.id} matches folios: ${matched.join(', ')}`);
      }
    }
  });

  console.log(`\nTotal matched documents: ${foundCount}`);
}

search().catch(console.error);
