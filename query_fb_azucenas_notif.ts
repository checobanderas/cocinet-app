import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

const foliosExcelStr = `#1, #36, #35, #34, #24, #23, #17, #16, #15, #14, #13, #12, #05607, #05605, #05609, #05602, #05599, #05606, #05608, #05598, #05604, #05603, #05600, #05601, #05597, #05595, #05593, #05596, #05594, #05592, #05586, #05590, #05585, #05589, #05588, #05591, #05587, #05581, #05584, #05582, #05580, #05579, #05583, #05576, #05574, #05578, #05572, #05571, #05560, #05570, #05577, #05568, #05573, #05575, #05562, #05569, #05566, #05567, #05565, #05559, #05554, #05563, #05564, #05561, #05558, #05556, #05535, #05557, #05555, #05551, #05552, #05553, #05549, #05547, #05550, #05545, #05546, #05531, #05543, #05544, #05542, #05548, #05540, #05541, #05532, #05534, #05536, #05539, #05538, #05537, #05533, #05530, #05529, #05526, #05524, #05512, #05513, #05525, #05528, #05527, #05515, #05519, #05503, #05522, #05523, #05521, #05518, #05520, #05516, #05517, #05509, #05508, #05514, #05511, #05510, #05506, #05507, #05505, #05504`;
const foliosToFind = foliosExcelStr.split(',').map(f => f.trim().replace('#', ''));

async function reconstruct() {
  console.log("Analyzing Azucenas notifications (377e04fd-fb7a-4d0b-8cae-5c75de2f77c6)...");
  
  const snap = await getDocs(collection(db, "notifications"));
  let cuentasEncontradas = [];
  
  snap.forEach(d => {
    const data = d.data();
    const dateStr = data.createdAt || data.timestamp || data.date;
    
    let isTargetDate = false;
    if (dateStr && typeof dateStr === 'string' && (dateStr.includes("2026-08-11") || dateStr.includes("2026-08-12"))) {
      isTargetDate = true;
    }
    
    if (isTargetDate && data.tenantId === "377e04fd-fb7a-4d0b-8cae-5c75de2f77c6") {
      if (data.isCuentaNotification || (data.title && data.title.includes("PRECUENTA"))) {
        // Find if this cuenta contains any of the target folios in its items
        let matchedFolios = [];
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(item => {
            if (item.folioInterno) {
              const vals = item.folioInterno.split(',').map(v => v.replace('#', '').trim());
              for (const v of vals) {
                if (foliosToFind.includes(v)) matchedFolios.push(v);
              }
            }
          });
        }
        
        cuentasEncontradas.push({
          id: d.id,
          date: dateStr,
          table: data.tableLabel,
          total: data.total,
          atendidoPor: data.atendidoPor,
          matchedFolios: [...new Set(matchedFolios)],
          itemsCount: data.items ? data.items.length : 0
        });
      }
    }
  });

  console.log(`\nFound ${cuentasEncontradas.length} total Cuentas notifications for Azucenas on 11/12.`);
  
  const matched = cuentasEncontradas.filter(c => c.matchedFolios.length > 0);
  console.log(`Of those, ${matched.length} directly match the folios you sent.`);
  
  if (matched.length > 0) {
    console.log("Sample of matched accounts:");
    console.log(JSON.stringify(matched.slice(0, 5), null, 2));
  } else {
    // If no direct folio match inside items, show some samples anyway
    console.log("No exact folio match inside items. Here is a sample of Azucenas cuentas found:");
    console.log(JSON.stringify(cuentasEncontradas.slice(0, 5), null, 2));
  }
}

reconstruct().catch(console.error);
