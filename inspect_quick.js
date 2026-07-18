const { initializeApp } = require("firebase/app");
const { initializeFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");

const firebaseConfig = {
  apiKey: "AIzaSyBARujfOUtNV9Sa0McGVJAJTLI_nhgRrws",
  authDomain: "cocinet2026.firebaseapp.com",
  projectId: "cocinet2026",
  storageBucket: "cocinet2026.firebasestorage.app",
  messagingSenderId: "3768044077",
  appId: "1:3768044077:web:9d8be0b0662178553506a4",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "remixed-firestore-database-id");

async function main() {
  console.log("Checking Firestore database...");
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const count = querySnapshot.size;
    console.log(`Found ${count} products.`);
    
    const tenantCounts = {};
    const sample = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const tid = data.tenantId || "undefined";
      tenantCounts[tid] = (tenantCounts[tid] || 0) + 1;
      if (sample.length < 10) {
        sample.push({
          id: doc.id,
          name: data.name,
          tenantId: data.tenantId,
          sucursal: data.sucursal || null,
          category: data.category
        });
      }
    });
    
    const result = {
      totalProducts: count,
      tenantCounts,
      sampleProducts: sample
    };
    
    fs.writeFileSync("./db_debug_result.json", JSON.stringify(result, null, 2));
    console.log("Written results to db_debug_result.json");
  } catch (err) {
    console.error("Error:", err);
    fs.writeFileSync("./db_debug_result.json", JSON.stringify({ error: err.message }, null, 2));
  }
  process.exit(0);
}

main();
