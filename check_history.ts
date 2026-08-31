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
  const tenantsSnap = await getDocs(collection(db, "tenants"));
  tenantsSnap.docs.forEach(t => {
     console.log(t.id, t.data().name);
  });
}
check().catch(console.error);
