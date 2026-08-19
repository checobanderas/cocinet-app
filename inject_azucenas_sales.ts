import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch } from "firebase/firestore";
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

function getMexicoISOString(d?: Date) {
  const date = d ? new Date(d) : new Date();
  const tzOffset = -6 * 60; // CST
  const localTime = new Date(date.getTime() + tzOffset * 60 * 1000);
  return localTime.toISOString().replace('Z', '');
}

async function run() {
  const data = JSON.parse(fs.readFileSync('reconstructed_sales.json', 'utf-8'));
  const matched = data.matched;
  const tenantId = "377e04fd-fb7a-4d0b-8cae-5c75de2f77c6"; // Azucenas

  console.log(`Starting injection of ${matched.length} records...`);

  // We will process in batches of 500 (Firestore limit)
  let batch = writeBatch(db);
  let count = 0;
  let totalInjected = 0;

  for (const record of matched) {
    const excel = record.excel;
    const notif = record.notification;

    const historyRef = doc(collection(db, "history"));
    const closedId = historyRef.id;

    // determine date
    const dateObj = new Date(excel.dateObj);
    const dateStr = getMexicoISOString(dateObj); // roughly yyyy-mm-ddThh:mm:ss
    const dayStr = dateStr.split('T')[0]; // yyyy-mm-dd

    // determine zone based on mesa
    let zone = "Comedor";
    if (excel.mesa.startsWith("P")) zone = "Para Llevar";
    if (excel.mesa.toLowerCase() === "domicilio") zone = "Servicio a Domicilio";

    // Reconstruct one comanda to hold all items
    const dummyComanda = {
      uid: `comanda-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      folio: Date.now(),
      timestamp: dateObj.toISOString(),
      updatedAt: dateStr,
      atendidoPor: "Roxana 💵",
      generalNotes: "Reconstruido a partir de notificación",
      items: notif.items || []
    };

    const closedAccount = {
      id: closedId,
      uid: closedId,
      tenantId: tenantId,
      timestamp: dateStr,
      updatedAt: dateStr,
      folioInterno: excel.folioInterno,
      tableLabel: excel.mesa,
      zone: zone,
      total: excel.total,
      subtotal: excel.total, // assuming no discount for reconstructed data
      discount: 0,
      tip: 0,
      paymentMethod: excel.pago || "cash",
      isPaid: true,
      comandas: [dummyComanda],
      createdBy: "Roxana 💵",
      sessionId: `day-${tenantId}-${dayStr}`, // This links it to the cut of that day
      deliveryClientName: null,
      deliveryClientPhone: null,
      deliveryNotes: null,
      deliveryStatus: null,
      cardLastFour: ""
    };

    batch.set(historyRef, closedAccount);
    count++;
    totalInjected++;

    if (count === 500) {
      await batch.commit();
      console.log(`Committed ${totalInjected} records...`);
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Committed ${totalInjected} records...`);
  }

  console.log(`Successfully injected all ${totalInjected} records into history!`);
}

run().catch(console.error);
