import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit, orderBy } from "firebase/firestore";

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
const db = getFirestore(app);

async function check() {
  const targetTenant = "377e04fd-fb7a-4d0b-8cae-5c75de2f77c6";
  
  const pRef = collection(db, "tenants", targetTenant, "pedidos");
  const pSnap = await getDocs(query(pRef, limit(5)));
  pSnap.forEach(d => console.log("Sample pedido date format:", d.data().createdAt, d.data().date));
  
  // also check if they use 'cuentas' instead of 'pedidos'
  const cRef = collection(db, "tenants", targetTenant, "cuentas");
  const cSnap = await getDocs(query(cRef, limit(5)));
  cSnap.forEach(d => console.log("Sample cuenta date format:", d.data().createdAt, d.data().date));
  
  // check 'closed_accounts'
  const caRef = collection(db, "tenants", targetTenant, "closed_accounts");
  const caSnap = await getDocs(query(caRef, limit(5)));
  caSnap.forEach(d => console.log("Sample closed_account date format:", d.data().createdAt, d.data().date, d.data().cierreDate));

  // check 'shift_closures'
  const scRef = collection(db, "tenants", targetTenant, "shift_closures");
  const scSnap = await getDocs(query(scRef, limit(5)));
  scSnap.forEach(d => console.log("Sample shift_closure:", d.data().date, d.data().cierreDate));
  
  // check 'shift_closures_v2' again without filters
  const sc2Ref = collection(db, "tenants", targetTenant, "shift_closures_v2");
  const sc2Snap = await getDocs(query(sc2Ref, limit(5)));
  sc2Snap.forEach(d => console.log("Sample shift_closures_v2:", d.data().date, d.data().cierreDate));
  
  console.log("Done");
}

check().catch(console.error);
