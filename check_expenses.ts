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

async function check() {
  const tenantId = "tenant-3";
  
  // Expenses
  const qExp = query(collection(db, "expenses"), where("tenantId", "==", tenantId));
  const snapExp = await getDocs(qExp);
  console.log(`Found ${snapExp.size} expenses for ${tenantId}`);
  let expData = snapExp.docs.map(d => ({id: d.id, ...d.data()}));
  // sort desc
  expData.sort((a: any, b: any) => {
      const timeA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
  });
  console.log("Recent expenses:", expData.slice(0, 5).map(e => {
      return { id: e.id, date: e.createdAt && e.createdAt.toDate ? e.createdAt.toDate() : e.createdAt, amount: e.amount, description: e.description };
  }));

  // Cash movements
  const qCash = query(collection(db, "cash_movements"), where("tenantId", "==", tenantId));
  const snapCash = await getDocs(qCash);
  console.log(`Found ${snapCash.size} cash_movements for ${tenantId}`);
  let cashData = snapCash.docs.map(d => ({id: d.id, ...d.data()}));
  cashData.sort((a: any, b: any) => {
      const timeA = a.timestamp && typeof a.timestamp.toDate === 'function' ? a.timestamp.toDate().getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const timeB = b.timestamp && typeof b.timestamp.toDate === 'function' ? b.timestamp.toDate().getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return timeB - timeA;
  });
  console.log("Recent cash movements:", cashData.slice(0, 5).map(m => {
      return { id: m.id, type: m.type, date: m.timestamp && m.timestamp.toDate ? m.timestamp.toDate() : m.timestamp, amount: m.amount };
  }));

  // Purchases
  const qPurch = query(collection(db, "purchases"), where("tenantId", "==", tenantId));
  const snapPurch = await getDocs(qPurch);
  console.log(`Found ${snapPurch.size} purchases for ${tenantId}`);
}
check().catch(console.error);
