import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const activeConfig = {
  apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI",
  authDomain: "cocinet-app.firebaseapp.com",
  projectId: "cocinet-app"
};

const app = initializeApp(activeConfig);
const db = getFirestore(app);

async function checkTenant() {
  const snapshot = await getDocs(collection(db, "tenants"));
  let tenants = [];
  for (const doc of snapshot.docs) {
    tenants.push({ id: doc.id, name: doc.data().name, rfc: doc.data().rfc });
  }
  console.log("Tenants:", tenants);
  process.exit(0);
}
checkTenant().catch(console.error);
