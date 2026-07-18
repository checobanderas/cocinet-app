import Database from "better-sqlite3";

const db = new Database("restaurant.db");

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Tables in SQLite:", tables);
  
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
  console.log("Total products in SQLite:", productCount.count);
  
  if (productCount.count > 0) {
    const sample = db.prepare("SELECT * FROM products LIMIT 5").all();
    console.log("Sample products in SQLite:", sample);
  }
} catch (error) {
  console.error("Error querying SQLite:", error);
}
