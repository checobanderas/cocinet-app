import Database from "better-sqlite3";

const db = new Database("restaurant.db");

try {
  const sampleConfig = db.prepare("SELECT * FROM app_config LIMIT 10").all() as any[];
  console.log("App config sample:", sampleConfig);

} catch (error) {
  console.error("Error querying SQLite:", error);
}


