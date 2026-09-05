import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  getPendingOutboxSales,
  markOutboxSaleSynced,
  markOutboxSaleFailed,
  saveSaleToOutbox,
  OutboxSale,
} from "../utils/db";

let isSyncing = false;
let syncIntervalTimer: any = null;

export interface OutboxStatus {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

let lastSyncSuccessTime: string | null = null;

/**
 * Notifica a la aplicación de cambios en el estado del Outbox.
 */
function notifyOutboxStatus(pendingCount: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cocinet:outbox_status_changed", {
        detail: {
          pendingCount,
          isSyncing,
          lastSyncTime: lastSyncSuccessTime,
        },
      })
    );
  }
}

/**
 * Procesa y envía a Firestore todas las ventas acumuladas offline.
 */
export async function syncPendingSalesNow(
  tenantId?: string
): Promise<{ synced: number; failed: number }> {
  if (isSyncing) {
    return { synced: 0, failed: 0 };
  }

  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  if (!isOnline) {
    return { synced: 0, failed: 0 };
  }

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pendingSales = await getPendingOutboxSales(tenantId);
    if (pendingSales.length === 0) {
      isSyncing = false;
      notifyOutboxStatus(0);
      return { synced: 0, failed: 0 };
    }

    console.log(
      `📡 [OfflineSync] Sincronizando ${pendingSales.length} ventas pendientes con Firestore...`
    );

    for (const item of pendingSales) {
      try {
        const historyRef = doc(db, "history", item.id);

        // Verificamos si ya existe en Firestore para evitar reescrituras innecesarias
        const existingSnap = await getDoc(historyRef).catch(() => null);
        if (!existingSnap || !existingSnap.exists()) {
          await setDoc(historyRef, {
            ...item.data,
            syncedAt: new Date().toISOString(),
            isOfflineRecovered: true,
          });
        }

        await markOutboxSaleSynced(item.id);
        synced++;
        console.log(
          `✅ [OfflineSync] Venta #${item.id} sincronizada con éxito en la nube.`
        );
      } catch (err: any) {
        console.warn(
          `⚠️ [OfflineSync] Error sincronizando venta #${item.id}:`,
          err
        );
        await markOutboxSaleFailed(item.id, err?.message || String(err));
        failed++;
      }
    }

    lastSyncSuccessTime = new Date().toISOString();
    const remaining = await getPendingOutboxSales(tenantId);
    notifyOutboxStatus(remaining.length);
  } catch (error) {
    console.error(
      "❌ [OfflineSync] Error general en el ciclo de sincronización:",
      error
    );
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

/**
 * Inicia el escucha en segundo plano para sincronización automática:
 * 1. Al detectar evento 'online'
 * 2. Cada 20 segundos por temporizador
 */
export function startOfflineSyncService(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    console.log(
      "🌐 [OfflineSync] Conexión a internet restablecida. Iniciando sincronización de ventas..."
    );
    syncPendingSalesNow();
  };

  window.addEventListener("online", handleOnline);

  // Ejecución inicial tras 3 segundos
  setTimeout(() => {
    syncPendingSalesNow();
  }, 3000);

  // Intervalo periódico de seguridad (cada 20 segundos)
  syncIntervalTimer = setInterval(() => {
    if (navigator.onLine && !isSyncing) {
      syncPendingSalesNow();
    }
  }, 20000);

  return () => {
    window.removeEventListener("online", handleOnline);
    if (syncIntervalTimer) {
      clearInterval(syncIntervalTimer);
      syncIntervalTimer = null;
    }
  };
}

/**
 * Registra una venta en el outbox y dispara sincronización inmediata si hay red.
 */
export async function queueSaleForSync(saleData: any): Promise<void> {
  await saveSaleToOutbox(saleData);
  if (typeof navigator !== "undefined" && navigator.onLine) {
    // Sincronizar en background sin congelar el hilo principal
    setTimeout(() => {
      syncPendingSalesNow();
    }, 500);
  }
}

