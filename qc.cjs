const Database = require('better-sqlite3');
const db = new Database('restaurant.db');
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
console.log("Tables:", tables.map(t => t.name));

const cortes = db.prepare(`
  SELECT * FROM cortes 
  WHERE date LIKE '2026-08-11%' OR date LIKE '2026-08-12%'
`).all();

console.log("\nCortes (shifts):", JSON.stringify(cortes, null, 2));

try {
  const ventas = db.prepare(`
    SELECT date, total, status, tenant_id FROM orders 
    WHERE date LIKE '2026-08-11%' OR date LIKE '2026-08-12%'
  `).all();
  console.log("\nOrders on those dates:", ventas.length);
  // group by tenant
  const tenantSales = ventas.reduce((acc, v) => {
    acc[v.tenant_id] = (acc[v.tenant_id] || 0) + v.total;
    return acc;
  }, {});
  console.log("Sales by tenant:", tenantSales);
} catch(e) {
  console.log("Orders query error:", e.message);
}

try {
  const tickets = db.prepare(`
    SELECT date, total, status, tenant_id FROM tickets 
    WHERE date LIKE '2026-08-11%' OR date LIKE '2026-08-12%'
  `).all();
  console.log("\nTickets on those dates:", tickets.length);
  const tenantSalesT = tickets.reduce((acc, v) => {
    acc[v.tenant_id] = (acc[v.tenant_id] || 0) + v.total;
    return acc;
  }, {});
  console.log("Tickets Sales by tenant:", tenantSalesT);
} catch(e) {
  console.log("Tickets query error:", e.message);
}

try {
  const tenants = db.prepare(`SELECT * FROM tenants`).all();
  console.log("\nTenants:", tenants);
} catch(e) {
  console.log("Tenants query error:", e.message);
}
