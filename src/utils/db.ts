// IndexedDB Utility for COCINET 2026 local-first backup, persistence, and Outbox Transaction Queue

const DB_NAME = 'CocinetDB';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;

export interface OutboxSale {
  id: string;
  tenantId: string;
  data: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: string;
  syncedAt?: string;
  retryCount?: number;
  lastError?: string;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // 1. Products Store
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      // 2. Tables Store
      if (!db.objectStoreNames.contains('tables')) {
        db.createObjectStore('tables', { keyPath: 'id' });
      }
      // 3. History Store (Full historical sales)
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('tenantId', 'tenantId', { unique: false });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      // 4. Offline Sales Outbox (Inviolable Transactional Queue)
      if (!db.objectStoreNames.contains('offline_sales_outbox')) {
        const outboxStore = db.createObjectStore('offline_sales_outbox', { keyPath: 'id' });
        outboxStore.createIndex('status', 'status', { unique: false });
        outboxStore.createIndex('tenantId', 'tenantId', { unique: false });
        outboxStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// -------------------------------------------------------------
// OFFLINE SALES OUTBOX (INVIOLABLE TRANSACTION QUEUE)
// -------------------------------------------------------------

/**
 * Guarda una venta cobrada de forma inmediata e inmutable en disco local.
 * Estado inicial: 'pending'.
 */
export async function saveSaleToOutbox(saleData: any): Promise<void> {
  if (!saleData || !saleData.id) return;
  const db = await initDB();

  const outboxEntry: OutboxSale = {
    id: String(saleData.id),
    tenantId: saleData.tenantId || 'tenant-default',
    data: saleData,
    status: 'pending',
    createdAt: saleData.timestamp || new Date().toISOString(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_sales_outbox', 'history'], 'readwrite');
    const outboxStore = transaction.objectStore('offline_sales_outbox');
    const historyStore = transaction.objectStore('history');

    outboxStore.put(outboxEntry);
    historyStore.put(saleData);

    transaction.oncomplete = () => {
      console.log(`🛡️ [Outbox] Venta #${saleData.id} asegurada en disco local (IndexedDB)`);
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Obtiene todas las ventas pendientes de sincronizar con Firebase.
 */
export async function getPendingOutboxSales(tenantId?: string): Promise<OutboxSale[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_sales_outbox', 'readonly');
    const store = transaction.objectStore('offline_sales_outbox');
    const request = store.getAll();

    request.onsuccess = () => {
      const all: OutboxSale[] = request.result || [];
      const pending = all.filter(item => item.status === 'pending' || item.status === 'failed');
      if (tenantId) {
        resolve(pending.filter(item => item.tenantId === tenantId));
      } else {
        resolve(pending);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Marca una venta como exitosamente subida y confirmada en Firestore.
 */
export async function markOutboxSaleSynced(saleId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_sales_outbox', 'readwrite');
    const store = transaction.objectStore('offline_sales_outbox');
    const getReq = store.get(saleId);

    getReq.onsuccess = () => {
      const entry: OutboxSale | undefined = getReq.result;
      if (entry) {
        entry.status = 'synced';
        entry.syncedAt = new Date().toISOString();
        store.put(entry);
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Marca una venta con fallo temporal de envío para reintento.
 */
export async function markOutboxSaleFailed(saleId: string, error: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_sales_outbox', 'readwrite');
    const store = transaction.objectStore('offline_sales_outbox');
    const getReq = store.get(saleId);

    getReq.onsuccess = () => {
      const entry: OutboxSale | undefined = getReq.result;
      if (entry) {
        entry.status = 'failed';
        entry.retryCount = (entry.retryCount || 0) + 1;
        entry.lastError = error;
        store.put(entry);
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// -------------------------------------------------------------
// HISTORY STORE OPERATIONS (Capacidad ilimitada en Disco)
// -------------------------------------------------------------

export async function getLocalHistory(tenantId?: string): Promise<any[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('history', 'readonly');
    const store = transaction.objectStore('history');
    const request = store.getAll();

    request.onsuccess = () => {
      const results: any[] = request.result || [];
      if (tenantId) {
        resolve(results.filter((h: any) => h.tenantId === tenantId));
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalHistory(history: any[]): Promise<void> {
  if (!Array.isArray(history) || history.length === 0) return;
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('history', 'readwrite');
    const store = transaction.objectStore('history');

    history.forEach((item) => {
      if (item && item.id) {
        store.put(item);
      }
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function saveSingleLocalHistoryItem(item: any): Promise<void> {
  if (!item || !item.id) return;
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('history', 'readwrite');
    const store = transaction.objectStore('history');
    store.put(item);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// -------------------------------------------------------------
// PRODUCTS STORE OPERATIONS
// -------------------------------------------------------------

export async function getLocalProducts(): Promise<any[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('products', 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalProducts(products: any[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('products', 'readwrite');
    const store = transaction.objectStore('products');

    products.forEach((product) => {
      if (product && product.id) {
        store.put(product);
      }
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function removeLocalProduct(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('products', 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// TABLES STORE OPERATIONS
// -------------------------------------------------------------

export async function getLocalTables(): Promise<any[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tables', 'readonly');
    const store = transaction.objectStore('tables');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalTables(tables: any[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tables', 'readwrite');
    const store = transaction.objectStore('tables');

    tables.forEach((table) => {
      if (table && table.id) {
        store.put(table);
      }
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// -------------------------------------------------------------
// SAFE CLEAR (NUNCA BORRA VENTAS PENDIENTES DE OUTBOX)
// -------------------------------------------------------------

export async function clearAllLocalData(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products', 'tables'], 'readwrite');
    
    transaction.objectStore('products').clear();
    transaction.objectStore('tables').clear();
    // NOTA DE SEGURIDAD: 'history' y 'offline_sales_outbox' NO se borran aquí para prevenir pérdida de datos.

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
