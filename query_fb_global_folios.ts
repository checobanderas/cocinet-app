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

async function search() {
  console.log("Searching history collection globally for specific folios...");
  const historySnap = await getDocs(collection(db, "history"));
  let found = 0;
  
  historySnap.forEach(d => {
    const data = d.data();
    if (data.folioInterno) {
      if (data.folioInterno.includes("05504") || data.folioInterno.includes("05607") || data.folioInterno.includes("05560")) {
        console.log(`Found doc: ${d.id}, tenant: ${data.tenantId}, folioInterno: ${data.folioInterno}, date: ${data.createdAt || data.date}`);
        found++;
      }
    }
  });

  console.log(`Total globally found: ${found}`);
}

search().catch(console.error);
