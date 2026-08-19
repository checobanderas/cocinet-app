const Database = require('better-sqlite3');
const db = new Database('restaurant.db');

try {
  const comandas = db.prepare(`SELECT count(*) as c FROM comandas WHERE timestamp LIKE '2026-08-11%' OR timestamp LIKE '2026-08-12%'`).get();
  console.log('Comandas 11/12:', comandas.c);

  const closed = db.prepare(`SELECT count(*) as c FROM closed_accounts WHERE timestamp LIKE '2026-08-11%' OR timestamp LIKE '2026-08-12%'`).get();
  console.log('Cuentas cerradas 11/12:', closed.c);

  const all_comandas_dates = db.prepare(`SELECT substr(timestamp, 1, 10) as dt, count(*) as c FROM comandas GROUP BY dt ORDER BY dt DESC`).all();
  console.log('All comandas dates:', all_comandas_dates);
  
  const all_closed_dates = db.prepare(`SELECT substr(timestamp, 1, 10) as dt, count(*) as c FROM closed_accounts GROUP BY dt ORDER BY dt DESC`).all();
  console.log('All closed dates:', all_closed_dates);

} catch(e) {
  console.error(e);
}
