import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";

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
  console.log("--- Querying all backups in tenant_backups ---");
  const allSnap = await getDocs(collection(db, "tenant_backups"));
  console.log(`Total backups in collection 'tenant_backups': ${allSnap.docs.length}`);
  allSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id} | tenantId: ${data.tenantId} | label: ${data.label} | sizeEstimate: ${data.sizeEstimate} bytes`);
  });

  console.log("\n--- Querying backups specifically for tenant-9 ---");
  const tenant9Snap = await getDocs(query(collection(db, "tenant_backups"), where("tenantId", "==", "tenant-9")));
  console.log(`Total backups for tenant-9: ${tenant9Snap.docs.length}`);
  tenant9Snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id} | label: ${data.label} | sizeEstimate: ${data.sizeEstimate} bytes`);
  });
}

main().catch(console.error);
