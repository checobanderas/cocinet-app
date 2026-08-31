
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({ projectId: "cocinet-app", apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI", authDomain: "cocinet-app.firebaseapp.com" });
const db = getFirestore(app);

async function main() {
  const s = await getDocs(collection(db, "companies"));
  if (s.empty) {
    const s2 = await getDocs(collection(db, "tenants"));
    s2.forEach(d => console.log(d.id, d.data().name));
  } else {
    s.forEach(d => console.log(d.id, d.data().name, d.data().isActive));
  }
}
main().catch(console.error);

