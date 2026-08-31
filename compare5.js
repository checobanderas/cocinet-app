
const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const app = initializeApp({ projectId: 'cocinet-app', apiKey: 'AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI', authDomain: 'cocinet-app.firebaseapp.com' });
const db = getFirestore(app);

const tenants = [
  { id: 'tenant-9', name: 'TACOS ROY MBRAVO' },
  { id: '377e04fd-fb7a-4d0b-8cae-5c75de2f77c6', name: 'TACOS ROY AZUCENAS' },
  { id: '4884d1f2-a89e-468c-acc5-3660089049e6', name: 'TACOS ROY TRUJANO' },
  { id: '63948592-3ca7-42ed-baf5-f8dc3228f2fd', name: 'TACOS ROY XOXO' }
];

async function main() {
  const fileContent = fs.readFileSync('expected_products.txt', 'utf8').replace(/\0/g, '');
  const expectedLines = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const expectedProducts = expectedLines.map(l => {
    const parts = l.split('\t').map(p => p.trim());
    if (parts.length >= 3) {
      return {
        name: parts[0],
        order: parseInt(parts[1]),
        price: parseFloat(parts[2])
      };
    }
    return null;
  }).filter(p => p !== null);

  for (const tenant of tenants) {
    console.log('\n\n=========================================');
    console.log('Analizando Sucursal: ' + tenant.name + ' (' + tenant.id + ')');
    const q = query(collection(db, 'products'), where('tenantId', '==', tenant.id));
    const snap = await getDocs(q);
    const dbProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(p => !p.deleted && !p.isDeleted && !p.deletedAt); // Assuming active

    // Normalize names to handle spaces/casing
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();

    const expectedMap = new Map();
    expectedProducts.forEach(ep => expectedMap.set(normalize(ep.name), ep));

    const dbMap = new Map();
    dbProducts.forEach(dp => dbMap.set(normalize(dp.name), dp));

    const outdated = [];
    const missing = [];

    // Check what is missing or outdated
    expectedMap.forEach((ep, normName) => {
      if (dbMap.has(normName)) {
        const dp = dbMap.get(normName);
        let differences = [];
        if (Number(dp.price) !== ep.price) differences.push('Precio (esperado $' + ep.price + ', actual $' + dp.price + ')');
        
        if (differences.length > 0) {
          outdated.push('- ' + ep.name + ': ' + differences.join(', '));
        }
      } else {
        missing.push('- ' + ep.name + ' (faltante)');
      }
    });

    console.log('\n[PRODUCTOS DESACTUALIZADOS]');
    if (outdated.length > 0) outdated.forEach(o => console.log(o));
    else console.log('Ninguno. Todos los precios coinciden.');

    console.log('\n[PRODUCTOS FALTANTES]');
    if (missing.length > 0) missing.forEach(m => console.log(m));
    else console.log('Ninguno. Todos los productos de la lista están agregados.');
  }
}
main().catch(console.error);
