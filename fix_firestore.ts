import * as fs from 'fs';

let firestoreCode = fs.readFileSync('src/utils/firestore.ts', 'utf8');

if (!firestoreCode.includes('subscribeToCashMovements')) {
  firestoreCode = firestoreCode + `
export function subscribeToCashMovements(callback: (data: any[]) => void) {
  const q = query(collection(db, 'cash_movements'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(movements);
  });
}

export async function addCashMovementToFirebase(movement: any) {
  const ref = doc(collection(db, 'cash_movements'));
  await setDoc(ref, {
    ...movement,
    id: ref.id,
    date: new Date().toISOString()
  });
}
`;
  fs.writeFileSync('src/utils/firestore.ts', firestoreCode);
  console.log('Added CashMovement functions to firestore.ts');
}
