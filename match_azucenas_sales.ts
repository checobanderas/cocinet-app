import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from 'fs';
import * as path from 'path';

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

// Helper to parse Excel date "12/8/2026, 1:23:52 a.m." -> Date object
function parseExcelDate(dateStr: string) {
  try {
    const [datePart, timePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('/');
    let [time, modifier] = timePart.split(' ');
    let [hours, minutes, seconds] = time.split(':');
    
    let h = parseInt(hours, 10);
    if (modifier.includes('p.m.') && h < 12) h += 12;
    if (modifier.includes('a.m.') && h === 12) h = 0;
    
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, parseInt(minutes), parseInt(seconds));
  } catch(e) {
    return null;
  }
}

// Parse Excel rows
function parseExcelFile(filename: string) {
  const content = fs.readFileSync(filename, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const records = [];
  
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 8) {
      const dateObj = parseExcelDate(parts[3]);
      records.push({
        consecutivo: parts[0],
        folioCuenta: parts[1],
        folioInterno: parts[2],
        fechaHoraStr: parts[3],
        dateObj: dateObj,
        mesa: parts[4].trim(),
        pago: parts[5].trim(),
        total: parseFloat(parts[7].replace('$', '').replace(',', '')),
        raw: line
      });
    }
  }
  return records;
}

async function run() {
  const records11 = parseExcelFile('day11.txt');
  const records12 = parseExcelFile('day12.txt');
  const allRecords = [...records11, ...records12];
  
  console.log(`Parsed ${allRecords.length} records from Excel (Day11: ${records11.length}, Day12: ${records12.length})`);
  
  // Fetch all Azucenas notifications
  const snap = await getDocs(collection(db, "notifications"));
  let notifs = [];
  
  snap.forEach(d => {
    const data = d.data();
    if (data.tenantId === "377e04fd-fb7a-4d0b-8cae-5c75de2f77c6") {
      if (data.isCuentaNotification || (data.title && data.title.includes("PRECUENTA"))) {
        const dateStr = data.createdAt || data.timestamp || data.date;
        let dObj = null;
        if (dateStr && typeof dateStr === 'string') {
          dObj = new Date(dateStr);
        } else if (dateStr && dateStr.toDate) {
          dObj = dateStr.toDate();
        }
        
        notifs.push({
          id: d.id,
          dateObj: dObj,
          mesa: data.tableLabel,
          total: parseFloat(data.total) || 0,
          items: data.items || [],
          atendidoPor: data.atendidoPor || "Roxana 💵"
        });
      }
    }
  });

  console.log(`Found ${notifs.length} PRECUENTA/Cuenta notifications for Azucenas`);

  // Match records
  let matched = [];
  let unmatched = [];

  for (const rec of allRecords) {
    // Look for best match: same mesa, same total, time within a few hours before the Excel close time
    let bestMatch = null;
    let bestTimeDiff = Infinity;

    for (const n of notifs) {
      if (n.mesa === rec.mesa && Math.abs(n.total - rec.total) < 0.01) {
        if (n.dateObj && rec.dateObj) {
          const diffHours = (rec.dateObj.getTime() - n.dateObj.getTime()) / (1000 * 60 * 60);
          // notification should ideally be BEFORE the excel "cierre" (close) time, but sometimes can be slightly after if timezones differ
          if (diffHours >= -2 && diffHours <= 12) {
             if (diffHours < bestTimeDiff) {
                bestTimeDiff = diffHours;
                bestMatch = n;
             }
          }
        }
      }
    }

    if (bestMatch) {
       matched.push({
         excel: rec,
         notification: bestMatch
       });
       // Remove the matched notification so it isn't used twice
       notifs = notifs.filter(n => n.id !== bestMatch.id);
    } else {
       unmatched.push(rec);
    }
  }

  // Fallback match: if we couldn't match exactly by total, try matching just by Mesa and close Time
  if (unmatched.length > 0) {
    let stillUnmatched = [];
    for (const rec of unmatched) {
      let bestMatch = null;
      let bestTimeDiff = Infinity;
      for (const n of notifs) {
        if (n.mesa === rec.mesa) {
          if (n.dateObj && rec.dateObj) {
            const diffHours = Math.abs((rec.dateObj.getTime() - n.dateObj.getTime()) / (1000 * 60 * 60));
            if (diffHours <= 4) { // within 4 hours
               if (diffHours < bestTimeDiff) {
                  bestTimeDiff = diffHours;
                  bestMatch = n;
               }
            }
          }
        }
      }

      if (bestMatch) {
        matched.push({
          excel: rec,
          notification: bestMatch,
          note: "Matched by Mesa and Time (Total differed)"
        });
        notifs = notifs.filter(n => n.id !== bestMatch.id);
      } else {
        stillUnmatched.push(rec);
      }
    }
    unmatched = stillUnmatched;
  }

  console.log(`Successfully matched ${matched.length} out of ${allRecords.length} records!`);
  console.log(`Unmatched records: ${unmatched.length}`);

  // Save the reconstructed data
  fs.writeFileSync('reconstructed_sales.json', JSON.stringify({
    matched,
    unmatched
  }, null, 2));

  console.log("Reconstructed mapping saved to reconstructed_sales.json");
}

run().catch(console.error);
