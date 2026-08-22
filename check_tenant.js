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
  const snapshot = await getDocs(collection(db, "products"));
  let tenantsFound = new Set();
  let asadaProducts = [];
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    tenantsFound.add(data.tenantId || 'unknown');
    
    // Check if tenant is related to ASADA
    if (data.tenantId && data.tenantId.toLowerCase().includes('asada')) {
      asadaProducts.push({ name: data.name, price: data.price });
    }
  }
  
  console.log("Tenants found in DB:", Array.from(tenantsFound));
  console.log(`Found ${asadaProducts.length} products for ASADA ROY.`);
  if (asadaProducts.length > 0) {
      console.log(asadaProducts.slice(0, 5));
  }
  process.exit(0);
}
checkTenant().catch(console.error);
