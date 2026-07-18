import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI",
  authDomain: "cocinet-app.firebaseapp.com",
  projectId: "cocinet-app",
  storageBucket: "cocinet-app.firebasestorage.app",
  messagingSenderId: "315374858436",
  appId: "1:315374858436:web:c432699c575403bfe91991",
  measurementId: "G-GX3HLJPQHW"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

async function main() {
  console.log("Fetching all products for tenant-9...");
  const productsSnap = await getDocs(query(collection(db, "products"), where("tenantId", "==", "tenant-9")));
  const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log(`Total products in database: ${products.length}`);
  products.forEach((p: any) => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Price: $${p.price}`);
  });
}

main().catch(console.error);
