import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, writeBatch } from "firebase/firestore";

const activeConfig = {
  apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI",
  authDomain: "cocinet-app.firebaseapp.com",
  projectId: "cocinet-app",
  storageBucket: "cocinet-app.firebasestorage.app",
  messagingSenderId: "315374858436",
  appId: "1:315374858436:web:c432699c575403bfe91991",
  measurementId: "G-GX3HLJPQHW"
};

const app = initializeApp(activeConfig);
const db = getFirestore(app);

const pdf_items = {
  "TACOS AL PASTOR": 22,
  "TACOS DE BISTECK": 26,
  "TACOS DE COSTILLA": 26,
  "TACOS DE ARRACHERA": 34,
  "TACOS AL PASTOR HARINA": 24,
  "TACOS DE BISTECK HARINA": 28,
  "TACOS DE COSTILLA HARINA": 28,
  "TACOS DE ARRACHERA HARINA": 36,
  "TACOS DE PUERCO": 22,
  "TACOS DE RES": 26,
  "TACOS DE POLLO": 22,
  "TACOS AL PASTOR CON QUESO": 28,
  "TACOS DE BISTECK CON QUESO": 32,
  "TACOS DE COSTILLA CON QUESO": 32,
  "TACOS DE ARRACHERA CON QUESO": 40,
  "TACOS AL PASTOR AHOGADO": 24,
  "TACOS DE BISTECK AHOGADO": 28,
  "TACOS DE COSTILLA AHOGADO": 28,
  "TACOS DE ARRACHERA AHOGADO": 36,
  "TACOS DE PUERCO AHOGADO": 24,
  "TACOS DE RES AHOGADO": 28,
  "ALAMBRE PASTOR": 145,
  "ALAMBRE BISTECK": 145,
  "ALAMBRE DE COSTILLA": 145,
  "ALAMBRE DE ARRACHERA": 145,
  "MATA HAMBRE": 145,
  "PLATO MIXTO": 145,
  "VEGETARIANO": 145,
  "ALAMBRE ESPECIAL": 145,
  "PLATO SUIZO": 145,
  "MULA TERCA": 145,
  "QUESO FUNDIDO": 100,
  "QUESO FUNDIDO COMBINADO": 120,
  "TOSTADA AL PASTOR": 45,
  "TOSTADA DE PUERCO": 45,
  "TOSTADA DE COSTILLA": 50,
  "TOSTADA DE ARRACHERA": 55,
  "VOLCAN AL PASTOR": 50,
  "VOLCAN DE COSTILLA": 55,
  "VOLCAN DE ARRACHERA": 60,
  "BURRA AL PASTOR": 45,
  "BURRA DE BISTECK": 50,
  "BURRA DE COSTILLA": 50,
  "BURRA DE ARRACHERA": 55,
  "GRINGA AL PASTOR": 75,
  "GRINGA DE BISTECK": 75,
  "GRINGA DE COSTILLA": 75,
  "GRINGA DE ARRACHERA": 80,
  "1/2 KG PUERCO": 230,
  "1 KG PUERCO": 460,
  "1/2 KG DE RES": 250,
  "1 KG DE RES": 500,
  "1/2 KG DE BISTECK": 250,
  "1 KG DE BISTECK": 500,
  "1/2 KG DE ARRACHERA": 270,
  "1 KG DE ARRACHERA": 540,
  "ORDEN DE GUACAMOLE": 25,
  "ORDEN DE ZANAHORIAS": 25,
  "PANQUE DE ELOTE": 75,
  "FLAN": 65,
  "VASO DE AGUA DE SABOR": 40,
  "JARRA AGUA SABOR": 120,
  "VASO DE LIMONADA O NARANJADA": 60,
  "JARRA DE LIMONADA O NARANJADA": 130,
  "REFRESCOS": 38,
  "TIZANA FRIA": 50,
  "BARRILITO": 40,
  "CERVEZA ESPECIAL": 55,
  "SUERO O MICHELADA": 35,
  "CAFÉ DE OLLA": 30,
  "TIZANA CALIENTE": 50,
  "ATOLE": 35
};

async function updatePrices() {
  const snapshot = await getDocs(collection(db, "products"));
  const batch = writeBatch(db);
  let count = 0;
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.isDeleted) continue;
    
    const name = (data.name || "").trim().toUpperCase();
    let newPrice = pdf_items[name];
    
    if (!newPrice) {
      if (name === "QUESO FUNDIDO ESPECIAL") newPrice = 110;
      if (name === "QUESADILLA ESPECIAL AL PASTOR" || name === "QUESADILLA AL PASTOR" || name === "QUESADILLA AL PASTOR MAIZ") newPrice = 75;
      if (name === "QUESADILLA ESPECIAL BISTECK" || name === "QUESADILLA BISTECK" || name === "QUESADILLA BISTECK MAIZ") newPrice = 75;
      if (name === "QUESADILLA ESPECIAL COSTILLA" || name === "QUESADILLA COSTILLA" || name === "QUESADILLA COSTILLA MAIZ") newPrice = 75;
      if (name === "QUESADILLA ESPECIAL ARRACHERA" || name === "QUESADILLA ARRACHERA" || name === "QUESADILLA ARRACHERA MAIZ") newPrice = 80;
      if (name === "TACOS DE LENGUA DE RES AHOGADO") newPrice = 28;
      if (name === "TACOS DE LENGUA DE RES HARINA AHOGADO") newPrice = 33;
      if (name === "TACOS DE LENGUA DE RES CON QUESO") newPrice = 26;
      if (name === "TACOS DE LENGUA DE RES HARINA") newPrice = 36;
      if (name === "TOSTADA DE LENGUA DE RES") newPrice = 40;
      if (name === "VOLCAN DE LENGUA DE RES") newPrice = 50;
      if (name === "1/2 KG DE LENGUA DE RES") newPrice = 225;
      if (name === "1 KG DE LENGUA DE RES") newPrice = 500;
      if (name === "CAFÉ DE OLLA" || name === "CAFE DE OLLA" || name === "CAF DE OLLA") newPrice = 30;
    }
    
    if (newPrice && data.price !== newPrice) {
      console.log(`Updating ${name} from ${data.price} to ${newPrice}`);
      batch.update(docSnap.ref, { price: newPrice });
      count++;
    }
  }
  
  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} products.`);
  } else {
    console.log("No price changes needed.");
  }
  process.exit(0);
}

updatePrices().catch(console.error);
