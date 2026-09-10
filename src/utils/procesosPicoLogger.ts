/**
 * Módulo de Monitoreo de Rendimiento y Procesos Pico (procesospico.log)
 * Mide con precisión (performance.now()) las operaciones críticas de lectura y escritura.
 */

export type ProcesoTipo = 
  | 'LECTURA_FIRESTORE'
  | 'ESCRITURA_FIRESTORE'
  | 'TRANSACCION_FIRESTORE'
  | 'BATCH_FIRESTORE'
  | 'COBRO_MESA'
  | 'COMANDA_COCINA'
  | 'SINCRONIZACION';

export interface ProcesoPicoEntry {
  timestamp: string;
  source: 'FRONTEND_REACT' | 'BACKEND_FLASK' | 'BACKEND_NODE';
  tipo: ProcesoTipo | string;
  operacion: string;
  duracionMs: number;
  status: 'OK' | 'ERROR' | 'TIMEOUT';
  detalles?: Record<string, any>;
}

// Cola en memoria para envío eficiente por lotes (evita saturar la red en horas pico)
const logQueue: ProcesoPicoEntry[] = [];
let flushTimeout: any = null;

function getFormattedTimestamp(): string {
  const now = new Date();
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const ms = pad(now.getMilliseconds(), 3);
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`;
}

/**
 * Envia el lote de logs acumulados hacia el backend local de Flask / Node
 * para persistirlo en procesospico.log sin bloquear el hilo principal.
 */
async function flushLogQueue(): Promise<void> {
  if (logQueue.length === 0) return;
  const batch = logQueue.splice(0, logQueue.length);

  const payload = JSON.stringify({ logs: batch });

  // 1. Intentar con el backend local (Node / Vite / Flask)
  const targets = [
    '/api/log-procesopico',
    'http://localhost:3010/api/log-procesopico'
  ];

  let sent = false;
  for (const target of targets) {
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        const ok = navigator.sendBeacon(target, blob);
        if (ok) {
          sent = true;
          break;
        }
      }
      
      const res = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });
      if (res.ok) {
        sent = true;
        break;
      }
    } catch (e) {
      // Intentar el siguiente endpoint
    }
  }

  if (!sent) {
    // Si no hay conexión con el servidor de logs, almacenar temporalmente en sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = JSON.parse(window.sessionStorage.getItem('procesospico_pending') || '[]');
        const updated = [...stored, ...batch].slice(-200); // Guardar máximo 200
        window.sessionStorage.setItem('procesospico_pending', JSON.stringify(updated));
      }
    } catch (e) {}
  }
}

function scheduleFlush(): void {
  if (flushTimeout) return;
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushLogQueue().catch(() => {});
  }, 1000); // Agrupa logs cada 1 segundo para máximo rendimiento
}

/**
 * Registra una medición de rendimiento en procesospico.log
 */
export function logProcesoPico(
  tipo: ProcesoTipo | string,
  operacion: string,
  duracionMs: number,
  status: 'OK' | 'ERROR' | 'TIMEOUT' = 'OK',
  detalles?: Record<string, any>
): void {
  const timestamp = getFormattedTimestamp();
  const entry: ProcesoPicoEntry = {
    timestamp,
    source: 'FRONTEND_REACT',
    tipo,
    operacion,
    duracionMs: Number(duracionMs.toFixed(2)),
    status,
    detalles
  };

  // Formato estándar de línea para procesospico.log
  const logLine = `[${entry.timestamp}] [FRONTEND_REACT] [${entry.tipo}] op="${entry.operacion}" duracion=${entry.duracionMs.toFixed(2)}ms status=${entry.status}${entry.detalles ? ' ' + JSON.stringify(entry.detalles) : ''}`;

  // Log en consola estilizado para depuración en vivo
  const color = entry.duracionMs > 1000 ? '#f44336' : (entry.duracionMs > 300 ? '#ff9800' : '#00bcd4');
  console.log(`%c[PROCESOSPICO] ${logLine}`, `color: ${color}; font-weight: 600;`);

  logQueue.push(entry);
  scheduleFlush();
}

/**
 * Mide automáticamente con performance.now() el tiempo de ejecución de una función asíncrona.
 */
export async function measurePerformanceAsync<T>(
  tipo: ProcesoTipo | string,
  operacion: string,
  fn: () => Promise<T>,
  detalles?: Record<string, any>
): Promise<T> {
  const t0 = performance.now();
  let status: 'OK' | 'ERROR' | 'TIMEOUT' = 'OK';
  try {
    const result = await fn();
    const t1 = performance.now();
    const duracionMs = t1 - t0;
    logProcesoPico(tipo, operacion, duracionMs, 'OK', detalles);
    return result;
  } catch (err: any) {
    const t1 = performance.now();
    const duracionMs = t1 - t0;
    status = err?.message?.includes('timeout') ? 'TIMEOUT' : 'ERROR';
    const errDetails = {
      ...(detalles || {}),
      error: err instanceof Error ? err.message : String(err)
    };
    logProcesoPico(tipo, operacion, duracionMs, status, errDetails);
    throw err;
  }
}
