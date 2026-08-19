const Database = require('better-sqlite3');
const db = new Database('restaurant.db');

try {
  console.log('comandas schema:', db.prepare("PRAGMA table_info('comandas')").all());
  console.log('closed_accounts schema:', db.prepare("PRAGMA table_info('closed_accounts')").all());
  
  const c = db.prepare("SELECT * FROM comandas ORDER BY id DESC LIMIT 1").all();
  console.log("Last comanda:", c);
  
  const ca = db.prepare("SELECT * FROM closed_accounts ORDER BY id DESC LIMIT 1").all();
  console.log("Last closed_account:", ca);
} catch(e) {
  console.error(e);
}
