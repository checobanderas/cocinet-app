import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";

const db = new Database('restaurant.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');
db.pragma('busy_timeout = 5000'); // Evitar bloqueos de base de datos ⚡

// Initialize Database
db.exec(`
  PRAGMA foreign_keys = OFF;
  
  -- Forzamos actualización de esquema eliminando tablas viejas si causan conflictos ⚡
  -- DROP TABLE IF EXISTS comanda_items;
  -- DROP TABLE IF EXISTS comandas;
  -- DROP TABLE IF EXISTS tables;
  -- DROP TABLE IF EXISTS products;
  -- DROP TABLE IF EXISTS closed_accounts;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    pin TEXT NOT NULL,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    drinkType TEXT,
    destination TEXT NOT NULL,
    subgroup TEXT
  );

  CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    shape TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    zone TEXT,
    waiterId TEXT
  );

  CREATE TABLE IF NOT EXISTS comandas (
    folio TEXT PRIMARY KEY,
    tableId TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    generalNotes TEXT,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS comanda_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folio TEXT,
    productId TEXT,
    quantity INTEGER NOT NULL,
    plate INTEGER NOT NULL,
    notes TEXT,
    isCancelled BOOLEAN DEFAULT FALSE,
    cancellationReason TEXT,
    cancelledBy TEXT
  );

  CREATE TABLE IF NOT EXISTS closed_accounts (
    id TEXT PRIMARY KEY,
    tableLabel TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tip REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    paymentMethod TEXT NOT NULL,
    comandasJson TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    isPaid BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'completed',
    cancellationReason TEXT,
    cancelledBy TEXT
  );

  CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS print_queue (
    id TEXT PRIMARY KEY,
    printer_key TEXT NOT NULL,
    raw_data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  PRAGMA foreign_keys = OFF;
`);

// Migration: Add comandasJson to closed_accounts if it doesn't exist
try {
  db.prepare('ALTER TABLE closed_accounts ADD COLUMN comandasJson TEXT').run();
} catch (e) {
  // Column probably already exists or table is empty
}

// Seed Initial Data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, name, role, pin, avatar) VALUES (?, ?, ?, ?, ?)');
  const users = [
    ['m1', 'Mesero 1', 'mesero', '1111', 'https://api.dicebear.com/8.x/micah/svg?seed=Felix'],
    ['m2', 'Mesero 2', 'mesero', '2222', 'https://api.dicebear.com/8.x/micah/svg?seed=Aneka'],
    ['m3', 'Mesero 3', 'mesero', '3333', 'https://api.dicebear.com/8.x/micah/svg?seed=Milo'],
    ['c1', 'Cajero 1', 'cajero', '4444', 'https://api.dicebear.com/8.x/micah/svg?seed=Caleb'],
    ['c2', 'Cajero 2', 'cajero', '5555', 'https://api.dicebear.com/8.x/micah/svg?seed=Jasmine'],
    ['a1', 'Admin 1', 'admin', '6666', 'https://api.dicebear.com/8.x/micah/svg?seed=Adrian'],
    ['a2', 'Admin 2', 'admin', '7777', 'https://api.dicebear.com/8.x/micah/svg?seed=Sasha'],
    ['a3', 'Admin 3', 'admin', '8888', 'https://api.dicebear.com/8.x/micah/svg?seed=Bailey'],
  ];
  users.forEach(u => insertUser.run(...u));

  const insertProduct = db.prepare('INSERT INTO products (id, name, price, category, subcategory, destination) VALUES (?, ?, ?, ?, ?, ?)');
  const products = [
    ['e1', 'Guacamole con Totopos', 65, 'food', 'Entradas', 'kitchen'],
    ['e2', 'Queso Fundido', 85, 'food', 'Entradas', 'kitchen'],
    ['t1', 'Taco al Pastor', 15, 'food', 'Tacos', 'kitchen'],
    ['t2', 'Taco de Bistec', 18, 'food', 'Tacos', 'kitchen'],
    ['c1', 'Café Americano', 25, 'drinks', 'Café', 'bar'],
    ['ce1', 'Cerveza Corona', 45, 'drinks', 'Cerveza', 'bar'],
    ['s1', 'Flan Napolitano', 35, 'desserts', 'Postres', 'bar'],
  ];
  products.forEach(p => insertProduct.run(...p));

  const insertTable = db.prepare('INSERT INTO tables (id, label, shape, status, zone) VALUES (?, ?, ?, ?, ?)');
  for (let i = 1; i <= 20; i++) insertTable.run(`T${i}`, `${i}`, 'local', 'available', 'Salón Principal');
  for (let i = 1; i <= 5; i++) insertTable.run(`P${i}`, `P${i}`, 'takeout', 'available', 'Para Llevar');
  for (let i = 1; i <= 5; i++) insertTable.run(`S${i}`, `S${i}`, 'delivery', 'available', 'A Domicilio');
}

// Migration to add subgroup column to products if database already existed
try {
  db.prepare("ALTER TABLE products ADD COLUMN subgroup TEXT").run();
  console.log("Migration: Added subgroup column to products table.");
} catch (e) {
  // Column already exists
}

// Evolution of avatars
try {
  db.prepare("UPDATE users SET avatar = REPLACE(avatar, 'avataaars', 'notionists') WHERE avatar LIKE '%avataaars%'").run();
  db.prepare("UPDATE users SET avatar = REPLACE(avatar, 'lorelei', 'notionists') WHERE avatar LIKE '%lorelei%'").run();
  db.prepare("UPDATE users SET avatar = REPLACE(avatar, '/7.x/', '/8.x/') WHERE avatar LIKE '%/7.x/%'").run();
} catch (e) {
  // Migration already applied or similar
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/sync', (req, res) => {
    const { products, tables, history, tenantInfo } = req.body;
    const startTime = Date.now();
    try {
      const restoreTransaction = db.transaction(() => {
        if (tenantInfo) {
          db.prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)').run('tenant_name', tenantInfo.name || '');
          db.prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)').run('branch_name', tenantInfo.branch || '');
        }

        // ALWAYS clean dependent items first to avoid Foreign Key constraints ⚡
        if ((tables && tables.length > 0) || (products && products.length > 0)) {
          db.prepare('DELETE FROM comanda_items').run();
          db.prepare('DELETE FROM comandas').run();
        }

        if (products && products.length > 0) {
          db.prepare('DELETE FROM products').run();
          const insertProduct = db.prepare('INSERT OR REPLACE INTO products (id, name, price, category, subcategory, destination, subgroup) VALUES (?, ?, ?, ?, ?, ?, ?)');
          for (const p of products) {
            insertProduct.run(p.id, p.name, p.price, p.category, p.subcategory || null, p.destination, p.subgroup || null);
          }
        }

        if (tables && tables.length > 0) {
          const insertTable = db.prepare('INSERT OR REPLACE INTO tables (id, label, shape, status, zone, waiterId) VALUES (?, ?, ?, ?, ?, ?)');
          const insertComanda = db.prepare('INSERT OR REPLACE INTO comandas (folio, tableId, timestamp, generalNotes, createdBy) VALUES (?, ?, ?, ?, ?)');
          const insertItem = db.prepare('INSERT OR REPLACE INTO comanda_items (folio, productId, quantity, plate, notes, isCancelled, cancellationReason, cancelledBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

          for (const t of tables) {
            insertTable.run(t.id, t.label, t.shape || 'local', t.status || 'available', t.zone || null, t.waiterId || null);
            
            if (t.comandas && t.comandas.length > 0) {
              for (const c of t.comandas) {
                const tsStr = c.timestamp ? new Date(c.timestamp).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
                // Soporte para objetos o strings en createdBy/cancelledBy
                const createdByName = typeof c.createdBy === 'object' ? c.createdBy?.name : (c.createdBy || 'Sistema');
                const folio = c.folio || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
                
                insertComanda.run(folio, t.id, tsStr, c.generalNotes || null, createdByName);
                
                if (c.items && c.items.length > 0) {
                  for (const item of c.items) {
                    const pId = item.product?.id || item.productId;
                    if (!pId) continue;
                    
                    const cancelledByName = typeof item.cancelledBy === 'object' ? item.cancelledBy?.name : item.cancelledBy;
                    insertItem.run(
                      folio,
                      pId,
                      item.quantity || 1,
                      item.plate || 1,
                      item.notes || null,
                      item.isCancelled ? 1 : 0,
                      item.cancellationReason || null,
                      cancelledByName || null
                    );
                  }
                }
              }
            }
          }
        }

        if (history && history.length > 0) {
          db.prepare('DELETE FROM closed_accounts').run();
          const insertHistory = db.prepare(`
            INSERT OR REPLACE INTO closed_accounts (id, tableLabel, subtotal, tip, discount, total, paymentMethod, comandasJson, timestamp, isPaid, status, cancellationReason, cancelledBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const h of history) {
            const hTsStr = h.timestamp ? new Date(h.timestamp).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
            const cancelledBy = typeof h.cancelledBy === 'object' ? h.cancelledBy?.name : (h.cancelledBy || null);
            
            insertHistory.run(
              h.id,
              h.tableLabel || 'Mesa ?',
              h.subtotal || 0,
              h.tip || 0,
              h.discount || 0,
              h.total || 0,
              h.paymentMethod || 'Efectivo',
              JSON.stringify(h.comandas || []),
              hTsStr,
              h.isPaid ? 1 : 0,
              h.status || 'completed',
              h.cancellationReason || null,
              cancelledBy
            );
          }
        }
      });

      restoreTransaction();
      const duration = Date.now() - startTime;
      console.log(`🔄 Sync local OK (${duration}ms) | Mesas: ${tables?.length || 0} | Historial: ${history?.length || 0}`);
      res.json({ success: true, message: 'Server database syndicated successfully' });
    } catch (err: any) {
      console.error('CRITICAL: Sync transaction failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reset', (req, res) => {
    try {
      const resetTransaction = db.transaction(() => {
        db.prepare('DELETE FROM comanda_items').run();
        db.prepare('DELETE FROM comandas').run();
        db.prepare('DELETE FROM closed_accounts').run();
        db.prepare('DELETE FROM products').run();
        db.prepare('DELETE FROM users').run();
        db.prepare('DELETE FROM tables').run();
        db.prepare('DELETE FROM app_config').run();

        // Restart users
        const insertUser = db.prepare('INSERT INTO users (id, name, role, pin, avatar) VALUES (?, ?, ?, ?, ?)');
        const seedUsers = [
          ['m1', 'Mesero 1', 'mesero', '1111', 'https://api.dicebear.com/8.x/micah/svg?seed=Felix'],
          ['m2', 'Mesero 2', 'mesero', '2222', 'https://api.dicebear.com/8.x/micah/svg?seed=Aneka'],
          ['m3', 'Mesero 3', 'mesero', '3333', 'https://api.dicebear.com/8.x/micah/svg?seed=Milo'],
          ['c1', 'Cajero 1', 'cajero', '4444', 'https://api.dicebear.com/8.x/micah/svg?seed=Caleb'],
          ['c2', 'Cajero 2', 'cajero', '5555', 'https://api.dicebear.com/8.x/micah/svg?seed=Jasmine'],
          ['a1', 'Admin 1', 'admin', '6666', 'https://api.dicebear.com/8.x/micah/svg?seed=Adrian'],
          ['a2', 'Admin 2', 'admin', '7777', 'https://api.dicebear.com/8.x/micah/svg?seed=Sasha'],
          ['a3', 'Admin 3', 'admin', '8888', 'https://api.dicebear.com/8.x/micah/svg?seed=Bailey'],
        ];
        seedUsers.forEach(u => insertUser.run(...u));

        // Restart products
        const insertProduct = db.prepare('INSERT INTO products (id, name, price, category, subcategory, destination) VALUES (?, ?, ?, ?, ?, ?)');
        const seedProducts = [
          ['e1', 'Guacamole con Totopos', 65, 'food', 'Entradas', 'kitchen'],
          ['e2', 'Queso Fundido', 85, 'food', 'Entradas', 'kitchen'],
          ['t1', 'Taco al Pastor', 15, 'food', 'Tacos', 'kitchen'],
          ['t2', 'Taco de Bistec', 18, 'food', 'Tacos', 'kitchen'],
          ['c1', 'Café Americano', 25, 'drinks', 'Café', 'bar'],
          ['ce1', 'Cerveza Corona', 45, 'drinks', 'Cerveza', 'bar'],
          ['s1', 'Flan Napolitano', 35, 'desserts', 'Postres', 'bar'],
        ];
        seedProducts.forEach(p => insertProduct.run(...p));

        // Restart tables
        const insertTable = db.prepare('INSERT INTO tables (id, label, shape, status, zone) VALUES (?, ?, ?, ?, ?)');
        for (let i = 1; i <= 20; i++) insertTable.run(`T${i}`, `${i}`, 'local', 'available', 'Salón Principal');
        for (let i = 1; i <= 5; i++) insertTable.run(`P${i}`, `P${i}`, 'takeout', 'available', 'Para Llevar');
        for (let i = 1; i <= 5; i++) insertTable.run(`S${i}`, `S${i}`, 'delivery', 'available', 'A Domicilio');
      });

      resetTransaction();
      res.json({ success: true, message: 'All systems cleared and reseeded successfully.' });
    } catch (err: any) {
      console.error('CRITICAL: Reset transaction failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reset-sales', (req, res) => {
    try {
      const resetTransaction = db.transaction(() => {
        db.prepare('DELETE FROM comanda_items').run();
        db.prepare('DELETE FROM comandas').run();
        db.prepare('DELETE FROM closed_accounts').run();
        
        // Reset all tables to 'available'
        db.prepare('UPDATE tables SET status = ?, waiterId = NULL').run('available');
      });

      resetTransaction();
      res.json({ success: true, message: 'Cortes de caja y ventas reiniciados correctamente.' });
    } catch (err: any) {
      console.error('CRITICAL: Reset sales transaction failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Routes
  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  });

  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { id, name, price, category, subcategory, destination, subgroup } = req.body;
    db.prepare('INSERT OR REPLACE INTO products (id, name, price, category, subcategory, destination, subgroup) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, price, category, subcategory, destination, subgroup || null);
    res.json({ success: true });
  });

  app.post('/api/products/bulk', (req, res) => {
    const { products } = req.body;
    const insert = db.prepare('INSERT OR REPLACE INTO products (id, name, price, category, subcategory, destination, subgroup) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const deleteOld = db.prepare('DELETE FROM products');
    const { reset } = req.query;

    const transaction = db.transaction((items) => {
       if (reset === 'true') deleteOld.run();
       for (const item of items) {
         insert.run(item.id, item.name, item.price, item.category, item.subcategory, item.destination, item.subgroup || null);
       }
    });

    transaction(products);
    res.json({ success: true });
  });

  app.delete('/api/products', (req, res) => {
    const { tenantId } = req.query;
    console.log("API: Deleting products for tenant:", tenantId);
    if (tenantId) {
      db.prepare('DELETE FROM products WHERE id IN (SELECT id FROM products WHERE ? IS NOT NULL)').run(tenantId);
      // Note: As SQLite doesn't currently store tenantId, this might be tricky to fully implement 
      // without modifying the database schema. Based on the current note, 
      // it seems it currently deletes ALL products. 
      // To strictly honor the tenantId, the database schema needs to be updated.
      // For now, I will keep the existing behavior of deleting all, 
      // as the schema does not support tenant filtering.
      db.prepare('DELETE FROM products').run();
    } else {
      db.prepare('DELETE FROM products').run();
    }
    res.json({ success: true });
  });

  app.get('/api/tables', (req, res) => {
    const tables = db.prepare('SELECT * FROM tables').all();
    const tablesWithComandas = tables.map((t: any) => {
      const comandas = db.prepare('SELECT * FROM comandas WHERE tableId = ?').all(t.id);
      const comandasWithItems = comandas.map((c: any) => {
        const items = db.prepare(`
          SELECT ci.*, p.name, p.price, p.category, p.subcategory, p.destination 
          FROM comanda_items ci 
          JOIN products p ON ci.productId = p.id 
          WHERE ci.folio = ?
        `).all(c.folio);
        return {
          ...c,
          items: items.map((i: any) => ({
            ...i,
            product: {
              id: i.productId,
              name: i.name,
              price: i.price,
              category: i.category,
              subcategory: i.subcategory,
              destination: i.destination
            }
          }))
        };
      });
      return { ...t, comandas: comandasWithItems };
    });
    res.json(tablesWithComandas);
  });

  app.post('/api/comandas', (req, res) => {
    const { tableId, items, generalNotes, createdBy } = req.body;
    const insertComanda = db.prepare('INSERT INTO comandas (tableId, generalNotes, createdBy) VALUES (?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO comanda_items (folio, productId, quantity, plate, notes) VALUES (?, ?, ?, ?, ?)');
    const updateTable = db.prepare("UPDATE tables SET status = 'occupied' WHERE id = ?");

    const transaction = db.transaction(() => {
      const result = insertComanda.run(tableId, generalNotes, createdBy);
      const folio = result.lastInsertRowid;
      for (const item of items) {
        insertItem.run(folio, item.product.id, item.quantity, item.plate, item.notes);
      }
      updateTable.run(tableId);
      return folio;
    });

    const folio = transaction();
    res.json({ folio: Number(folio) });
  });

  app.post('/api/tables/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/checkout', (req, res) => {
    const { id, tableId, tableLabel, subtotal, tip, discount, total, paymentMethod, createdBy, comandas } = req.body;
    const insertHistory = db.prepare(`
      INSERT INTO closed_accounts (id, tableLabel, subtotal, tip, discount, total, paymentMethod, comandasJson, isPaid, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'completed')
    `);
    const deleteComandas = db.prepare('DELETE FROM comandas WHERE tableId = ?');
    const deleteItems = db.prepare('DELETE FROM comanda_items WHERE folio IN (SELECT folio FROM comandas WHERE tableId = ?)');
    const updateTable = db.prepare("UPDATE tables SET status = 'available' WHERE id = ?");

    const transaction = db.transaction(() => {
      insertHistory.run(id, tableLabel, subtotal, tip, discount, total, paymentMethod, JSON.stringify(comandas || []));
      deleteItems.run(tableId);
      deleteComandas.run(tableId);
      updateTable.run(tableId);
    });

    transaction();
    res.json({ success: true });
  });

  app.get('/api/history', (req, res) => {
    const history = db.prepare('SELECT * FROM closed_accounts ORDER BY timestamp DESC').all();
    const historyWithComandas = history.map((h: any) => ({
      ...h,
      comandas: h.comandasJson ? JSON.parse(h.comandasJson) : []
    }));
    res.json(historyWithComandas);
  });

  app.get('/api/config/:key', (req, res) => {
    const config = db.prepare('SELECT value FROM app_config WHERE key = ?').get(req.params.key) as any;
    res.json({ value: config?.value || null });
  });

  app.post('/api/print-queue', (req, res) => {
    const { id, printer_key, raw_data } = req.body;
    // Generar un UUID único para el registro de impresión
    const jobId = id || `prn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    try {
      db.prepare(`
        INSERT OR REPLACE INTO print_queue (id, printer_key, raw_data, status, created_at, updated_at) 
        VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(jobId, printer_key || 'cuentas', raw_data);
      
      console.log(`🔌 [print_queue] Encolado de ticket exitoso. ID: ${jobId}, Impresora: ${printer_key}`);
      res.json({ success: true, id: jobId, status: 'pending' });
    } catch (err: any) {
      console.error("❌ Error al encolar en print_queue:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/print-queue/pending', (req, res) => {
    try {
      const pending = db.prepare("SELECT * FROM print_queue WHERE status = 'pending'").all();
      res.json(pending);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/config/:key', (req, res) => {
    const { value } = req.body;
    db.prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)').run(req.params.key, value);
    res.json({ success: true });
  });

  // Helper to obtain a validated GoogleGenAI client
  function getGeminiClient(customApiKey?: string) {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "" || apiKey.includes("placeholder")) {
      throw new Error(
        "La clave de API (GEMINI_API_KEY) es inválida o no está configurada.\n\n" +
        "Sigue estos pasos para configurarla:\n" +
        "1. En Google AI Studio, ve al menú de 'Settings' (panel lateral o botón de engranaje).\n" +
        "2. Haz clic en 'Secrets' o 'Claves de API'.\n" +
        "3. Registra una clave llamada 'GEMINI_API_KEY' con tu clave de API Gemini real.\n" +
        "4. Una vez guardado el cambio, asegúrate de reiniciar el servidor desde el panel de AI Studio."
      );
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Secure endpoint to generate ad hoc customizable quick notes for each product using AI 🧠💡
  app.post('/api/generate-adhoc-notes', async (req, res) => {
    const { products, apiKey } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Faltan productos para analizar." });
    }

    try {
      const ai = getGeminiClient(apiKey);
      const promptText = `Analiza los siguientes productos del menú del restaurante:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, subcategory: p.subcategory })), null, 2)}

Para cada uno de estos productos, genera una lista de hasta 4 notas, sugerencias de preparación o mensajes "ad hoc" y comunes (mensajes de personalización breves y útiles para tomar pedidos) en español de acuerdo a su naturaleza gastronómica. No uses explicaciones extensas, sé muy conciso.
Ejemplos contextuales por tipo de producto:
- Refrescos/Bebidas frías: ["Con vaso", "Con hielos", "Sin hielos", "Para llevar"]
- Tacos/Antojitos: ["Sin cebolla", "Sin cilantro", "Sin verdura", "Con todo"]
- Hamburguesas/Sándwiches: ["Sin mayonesa", "Sin cebolla", "Con queso extra", "Término medio"]
- Cafés: ["Leche deslactosada", "Sin azúcar", "Con azúcar", "Frío"]
- Cortes de carne: ["Bien cocido", "Término medio", "Tres cuartos", "Poco cocido"]
- Postres: ["Con helado", "Para llevar", "Porción doble"]

Aplica lógica gastronómica mexicana y de comida rápida en general.
Retorna obligatoriamente un arreglo JSON de objetos, cada uno con los campos exactos:
- id: El ID del producto original.
- quickNotes: Un arreglo de strings con las notas o sugerencias rápidas generadas.

El formato del resultado debe ser únicamente el JSON válido, sin bloques de código markdown, sin explicaciones adicionales.`;

      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.1-pro-preview"];
      let response = null;
      let lastError = null;

      for (const currentModel of modelsToTry) {
        try {
          console.log(`Intentando generar notas ad-hoc con el modelo: ${currentModel}...`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents: promptText,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    quickNotes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                  },
                  required: ["id", "quickNotes"],
                },
              },
            },
          });
          if (response) {
            console.log(`¡Éxito generando notas ad-hoc con ${currentModel}!`);
            break;
          }
        } catch (err: any) {
          console.warn(`Error al usar el modelo ${currentModel} para notas ad-hoc:`, err.message || err);
          lastError = err;
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (!response) {
        throw lastError || new Error("Todos los modelos de Gemini fallaron al generar las notas ad-hoc.");
      }

      const responseText = response.text || "[]";
      const items = JSON.parse(responseText.trim());
      res.json(items);
    } catch (error: any) {
      console.error("Error generating adhoc notes in server:", error);
      res.status(500).json({ error: error.message || "Fallo de Gemini al generar notas ad-hoc." });
    }
  });

  // Server-side Gemini API endpoints to securely expose AI functionalities
  app.post('/api/analyze-menu', async (req, res) => {
    const { image, images, withSubgroups } = req.body;
    let base64List: string[] = [];

    if (images && Array.isArray(images)) {
      base64List = images.map(img => img.includes(",") ? img.split(",")[1] : img);
    } else if (image) {
      base64List = [image.includes(",") ? image.split(",")[1] : image];
    }

    if (base64List.length === 0) {
      return res.status(400).json({ error: "No se proporcionó imagen de menú" });
    }

    try {
      const ai = getGeminiClient();

      let prompt = "";
      if (withSubgroups) {
        prompt = "Analyze this restaurant menu image and extract ALL products with their names and prices. " +
          "Categorize them into 'food', 'drinks', or 'desserts'. " +
          "Identify subcategories (like Tacos, Hamburguesas, Refrescos, Cervezas, Entradas) and " +
          "specifically identify and extract nested 'subgroups' for them, paying special attention to nested subgroups within subgroups! " +
          "For example, if you find a product variant listed with multiple options like tortilla type ('Maíz' or 'Harina'), base type, style, size (e.g. 'Pastor: Maiz $22 / Harina $24'), " +
          "or listed under 'Tacos a la Plancha' with options 'Maíz' and 'Harina', you MUST split them into separate product items with their corresponding variant clearly integrated in the product name (e.g., 'Pastor (Maiz)' with price 22 and 'Pastor (Harina)' with price 24). " +
          "Furthermore, you must build the 'subgroup' field to represent the nested grouping structure clearly. If there is a parent subgroup like 'Tacos a la Plancha' and a nested option subgroup like 'Maíz' or 'Harina', you should combine them or represent the exact nested subgroup, for example, 'Tacos a la Plancha (Maíz)' and 'Tacos a la Plancha (Harina)', or 'Tacos de Maíz' and 'Tacos de Harina' to make the categorization beautiful and distinct. " +
          "This ensures that the products are organized under logical, detailed subgroup tabs in the interface. " +
          "Always ensure that material, tortilla type (Maíz / Harina / Trigo / Doble), size (Chico / Grande / Súper / Jumbo), style (Sencillo / Con Queso / Especial / Gratinado / Con Todo), or temperature (Fresco / Caliente / Helado / Frappé) are treated as nested subgroups and split/named accordingly! " +
          "If a product does not have an obvious subgroup, use the name of the subcategory as its subgroup. " +
          "For 'destination', use 'kitchen' for food/desserts and 'bar' for drinks.";
      } else {
        prompt =
          "Analyze this restaurant menu image. Extract all products with their names and prices. Categorize them into 'food', 'drinks', or 'desserts'. For subcategory, use common headings found in the menu like 'Entradas', 'Plato Fuerte', 'Refrescos', etc. For destination, use 'kitchen' for food/desserts and 'bar' for drinks.";
      }

      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.1-pro-preview"];
      let response = null;
      let lastError = null;

      for (const currentModel of modelsToTry) {
        try {
          console.log(`Intentando analizar menú (subgrupos=${!!withSubgroups}) con el modelo: ${currentModel}...`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents: [
              {
                parts: [
                  { text: prompt },
                  ...base64List.map(base64Data => ({
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Data,
                    },
                  })),
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    category: {
                      type: Type.STRING,
                      enum: ["food", "drinks", "desserts"],
                    },
                    subcategory: { type: Type.STRING },
                    subgroup: { type: Type.STRING, description: "Detailed sub-grouping of variants like Tacos Gratinados, Classic, Alcoholic, Large, or by Piece. If none exists, reuse subcategory." },
                    destination: { type: Type.STRING, enum: ["kitchen", "bar"] },
                  },
                  required: [
                    "name",
                    "price",
                    "category",
                    "subcategory",
                    "destination",
                  ].concat(withSubgroups ? ["subgroup"] : []),
                },
              },
            },
          });
          if (response) {
            console.log(`¡Éxito analizando menú con ${currentModel}!`);
            break;
          }
        } catch (err: any) {
          console.warn(`Error al analizar menú con ${currentModel}:`, err.message || err);
          lastError = err;
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (!response) {
        throw lastError || new Error("Todos los modelos fallaron al analizar la imagen del menú.");
      }

      const responseText = response.text || "[]";
      let items = JSON.parse(responseText.trim());
      items = items.map((it: any) => ({
        ...it,
        subgroup: it.subgroup || it.subcategory || "General"
      }));
      res.json(items);
    } catch (error: any) {
      console.error("Error analyzing menu in server:", error);
      res.status(500).json({ error: error.message || "Fallo de Gemini al procesar imagen de menú." });
    }
  });

  app.post('/api/voice-order', async (req, res) => {
    const { transcript, menuString, menu } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Falta transcripción de voz" });
    }

    try {
      const ai = getGeminiClient();

      // Construcción del menú estructurado para Gemini
      let menuStringForGemini = menuString;
      if (menu && Array.isArray(menu)) {
        menuStringForGemini = menu.map(p => `- ID: "${p.id}", Nombre: "${p.name}"`).join("\n");
      }

      const promptText = `Dado el siguiente dictado de voz de un cliente en un restaurante de comunidad hispanohablante: "${transcript}"
Interpreta el dictado de voz y asócialo de forma inteligente con los productos disponibles en el menú.

Menú del restaurante con sus respectivos IDs y nombres oficiales:
${menuStringForGemini || ""}

Instrucciones:
1. Analiza el texto dictado e identifica los platillos, bebidas, postres u otros productos solicitados.
2. Mapea cada artículo con el producto correcto del menú. DEBES retornar el 'productId' de ese producto mapeado. Si no hay coincidencia exacta (por ejemplo, por pequeñas diferencias o variaciones coloquiales), busca el más similar/concordante y usa su 'productId' correspondiente del menú. Es obligatorio rellenar el campo 'productId' con un ID válido del menú.
3. Extrae la cantidad solicitada (por defecto es 1 si no se especifica).
4. Extrae cualquier instrucción especial o notas opcionales (p. ej., "sin cebolla", "con hielo", "bien cocido").
5. Identifica de forma inteligente si en el texto se indica qué comensal o plato ordena el producto (ej. "el comensal dos", "para el comensal 3", "para el uno", "persona 4"). Si se especifica, extrae el número del comensal como un número entero del 1 al 5 en el campo 'plate'. Si no se menciona, no incluyas el campo o déjalo nulo.
6. Retorna exclusivamente un arreglo JSON con objetos que contengan {productId, productName, quantity, notes, plate}.
7. El resultado debe ser EXCLUSIVAMENTE el JSON, sin formato markdown, sin explicaciones, de forma directa.`;

      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.1-pro-preview"];
      let response = null;
      let lastError = null;

      for (const currentModel of modelsToTry) {
        try {
          console.log(`Intentando procesar orden con el modelo: ${currentModel}...`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents: promptText,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productId: { type: Type.STRING },
                    productName: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    notes: { type: Type.STRING },
                    plate: { type: Type.INTEGER },
                  },
                  required: ["productId", "productName", "quantity"],
                },
              },
            },
          });
          if (response) {
            console.log(`¡Éxito procesando orden con ${currentModel}!`);
            break;
          }
        } catch (err: any) {
          console.warn(`Error al usar el modelo ${currentModel}:`, err.message || err);
          lastError = err;
          // Esperamos 50ms antes del siguiente fallback
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (!response) {
        throw lastError || new Error("Todos los modelos de Gemini fallaron al procesar la comanda de voz.");
      }

      const responseText = response.text || "[]";
      const items = JSON.parse(responseText.trim());
      res.json(items);
    } catch (error: any) {
      console.error("Error processing voice order in server:", error);
      res.status(500).json({ error: error.message || "Fallo de Gemini al procesar dictado de voz." });
    }
  });

  // Secure endpoint to generate and validate MySQL structures using AI 💡💻
  app.post('/api/generate-mysql', async (req, res) => {
    const { concept } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Falta el concepto de la tabla a diseñar." });
    }

    try {
      const ai = getGeminiClient();

      const promptText = `Eres un Administrador De Base de Datos MySQL y Desarrollador Web experto de alto nivel.
El usuario desea diseñar una tabla o un módulo de datos para su aplicación: "${concept}"

Crea el script DDL SQL optimizado de MySQL que siga estas reglas obligatorias:
1. Utiliza UUID v4 como clave primaria (usando VARCHAR(36) PRIMARY KEY o CHAR(36) PRIMARY KEY).
2. Cada tabla DEBE tener marcas de tiempo 'created_at' y 'updated_at' para rastrear de manera precisa la creación y edición de registros:
   - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
3. Incluye comentarios explicativos en cada columna (con COMMENT '...') y nombres de tablas claros y en español.
4. Genera una validación JSON del esquema que indique:
   - status: "success" | "error"
   - tableName: El nombre sugerido de la tabla.
   - description: Qué hace la tabla.
   - sql: El script de creación SQL completo sin formatear.
   - columns: Un arreglo de columnas con {name, type, constraints, description}.
   - websocketEvents: Un ejemplo de payload JSON que se enviaría por un canal de WebSockets de sincronización en tiempo real para un evento de 'INSERT' o 'UPDATE', que incluya el UUID sintético del registro y el timestamp correspondiente.

Retorna un objeto JSON con el siguiente esquema estricto:
{
  "status": "success",
  "tableName": "string",
  "description": "string",
  "sql": "string",
  "columns": [
    { "name": "string", "type": "string", "constraints": "string", "description": "string" }
  ],
  "websocketEvents": {
    "topic": "string",
    "event": "string",
    "payload": {
      "id": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  }
}

Retorna EXCLUSIVAMENTE el JSON directo, sin bloques markdown de código (como \`\`\`json), sin explicaciones de texto adicionales.`;

      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.1-pro-preview"];
      let response = null;
      let lastError = null;

      for (const currentModel of modelsToTry) {
        try {
          console.log(`Intentando diseñar base de datos MySQL con el modelo: ${currentModel}...`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents: promptText,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  tableName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  sql: { type: Type.STRING },
                  columns: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        constraints: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["name", "type", "description"]
                    }
                  },
                  websocketEvents: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      event: { type: Type.STRING },
                      payload: { type: Type.OBJECT }
                    },
                    required: ["topic", "event", "payload"]
                  }
                },
                required: ["status", "tableName", "description", "sql", "columns", "websocketEvents"]
              }
            }
          });
          if (response) {
            console.log(`¡Éxito diseñando base de datos con ${currentModel}!`);
            break;
          }
        } catch (err: any) {
          console.warn(`Error al usar el modelo ${currentModel}:`, err.message || err);
          lastError = err;
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (!response) {
        throw lastError || new Error("Todos los modelos de Gemini fallaron al diseñar MySQL.");
      }

      const responseText = response.text || "{}";
      const items = JSON.parse(responseText.trim());
      res.json(items);
    } catch (error: any) {
      console.error("Error designing database in server:", error);
      res.status(500).json({ error: error.message || "Fallo de Gemini al procesar diseño de base de datos." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.post('/api/comandas/:folio/cancel', (req, res) => {
    const { reason, user } = req.body;
    db.prepare('UPDATE comanda_items SET isCancelled = 1, cancellationReason = ?, cancelledBy = ? WHERE folio = ?')
      .run(reason, user.id, req.params.folio);
    res.json({ success: true });
  });

  app.post('/api/comandas/:folio/items/:productId/cancel', (req, res) => {
    const { plate, reason, user } = req.body;
    db.prepare('UPDATE comanda_items SET isCancelled = 1, cancellationReason = ?, cancelledBy = ? WHERE folio = ? AND productId = ? AND plate = ?')
      .run(reason, user.id, req.params.folio, req.params.productId, plate);
    res.json({ success: true });
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
