import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";

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
  const q = query(
    collection(db, "history"),
    where("tenantId", "==", "377e04fd-fb7a-4d0b-8cae-5c75de2f77c6"),
    where("createdBy", "==", "Roxana 💵"),
    limit(1)
  );
  
  const snap = await getDocs(q);
  snap.forEach(d => {
    console.log(JSON.stringify(d.data(), null, 2));
  });
}

run().catch(console.error);
