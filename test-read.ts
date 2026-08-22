
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI',
  authDomain: 'cocinet-app.firebaseapp.com',
  projectId: 'cocinet-app'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'products'));
  console.log('Read ' + snap.size + ' products!');
  process.exit(0);
}
run().catch(console.error);

