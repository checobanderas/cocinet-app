import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, writeBatch, doc } from "firebase/firestore";

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

async function run() {
  const tenantId = "377e04fd-fb7a-4d0b-8cae-5c75de2f77c6";
  const q = query(
    collection(db, "history"),
    where("tenantId", "==", tenantId),
    where("createdBy", "==", "Roxana 💵") // Our reconstructed accounts
  );
  
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} reconstructed history records to fix folioInterno.`);
  
  let batch = writeBatch(db);
  let count = 0;
  let totalFixed = 0;

  snap.forEach(d => {
    const data = d.data();
    
    // We stored the correct folioInterno at the root of the document previously
    const theFolioInterno = data.folioInterno; 
    
    if (data.comandas && Array.isArray(data.comandas) && data.comandas.length > 0) {
       // Only update if it doesn't already have it inside the comanda
       const newComandas = data.comandas.map((comanda: any) => {
          return {
             ...comanda,
             folioInterno: theFolioInterno // Place it inside the comanda!
          };
       });
       
       batch.update(doc(db, "history", d.id), { comandas: newComandas });
       count++;
       totalFixed++;
    }
    
    if (count === 400) {
       batch.commit().then(() => console.log(`Committed ${totalFixed} fixes...`));
       batch = writeBatch(db);
       count = 0;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Committed ${totalFixed} fixes...`);
  }
  
  console.log(`Finished fixing folioInterno in ${totalFixed} records.`);
}

run().catch(console.error);
