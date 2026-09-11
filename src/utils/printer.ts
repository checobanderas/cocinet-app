/**
 * COCINET PRO - Sistema de impresión unificado
 *
 * Detección automática de plataforma:
 *   - Android  → RawBtTransport  (Intent a la app RawBT)
 *   - Windows  → WindowsSpoolerTransport  (HTTP → sentinel_printer.py en localhost:3010)
 *
 * Uso:
 *   const transport = await PrinterTransportFactory.create("cocina");
 *   const job = new PosPrinterJob(new EscPosDriver(), transport);
 *   job.initialize().printLine("Hola").cut().execute();
 */

// ─── Detección de plataforma ─────────────────────────────────────────────────

export function getActiveTenantId(): string {
  try {
    const raw = localStorage.getItem("pos_selected_tenant");
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && obj.id) return obj.id;
    }
  } catch (e) {
    console.error("Error parsing pos_selected_tenant:", e);
  }
  return "default";
}

export function getTenantPrintDestination(tenantId?: string): string {
  const tId = tenantId || getActiveTenantId();
  return localStorage.getItem(`system_print_destination_${tId}`) || 
         localStorage.getItem("system_print_destination") || 
         "windows";
}

export function getTenantPrinterPort(tenantId?: string): string {
  const tId = tenantId || getActiveTenantId();
  return localStorage.getItem(`windows_printer_port_${tId}`) || 
         localStorage.getItem("windows_printer_port") || 
         "3010";
}

/** URL base del sentinel de impresión en Windows (puerto configurable) */
export function getSentinelUrl(tenantId?: string): string {
  const port = getTenantPrinterPort(tenantId);
  return `http://localhost:${port}`;
}

/** Devuelve true si el navegador corre en Windows */
export function isWindows(): boolean {
  const platform = (navigator as any).platform || "";
  const userAgent = navigator.userAgent || "";
  return /Win/i.test(platform) || /Windows/i.test(userAgent);
}

export type PrinterEventPayload = {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

export function notifyPrinterEvent(payload: PrinterEventPayload) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cocinet-printer-event", { detail: payload }));
  }
}

let sentinelHealthTimer: any = null;
let lastSentinelStatus: boolean | null = null;

export function startPrinterSentinelMonitor(port: string = "3010", intervalMs: number = 30000) {
  if (typeof window === "undefined") return;
  if (sentinelHealthTimer) clearInterval(sentinelHealthTimer);

  const checkHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(`http://localhost:${port}/status`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        lastSentinelStatus = true;
      } else {
        lastSentinelStatus = false;
      }
    } catch {
      lastSentinelStatus = false;
    }
  };

  setTimeout(checkHealth, 3000);
  sentinelHealthTimer = setInterval(checkHealth, intervalMs);
}

export function formatPhone(phone?: string): string {
  if (!phone) return "";
  const clean = String(phone).replace(/\D/g, "");
  if (clean.length === 10) {
    return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

/** Devuelve true si el navegador corre en Android */
export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Verifica si el sentinel de Windows está activo haciendo un GET a /status.
 * Timeout de 1 segundo para no bloquear la UI.
 */
export async function isSentinelOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${getSentinelUrl()}/status`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Retorna las impresoras disponibles en el sentinel de Windows.
 * Retorna [] si el sentinel no está activo.
 */
export async function getWindowsPrinters(customPort?: string, tenantId?: string): Promise<string[]> {
  const port = customPort || getTenantPrinterPort(tenantId) || "3010";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`http://localhost:${port}/printers`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    return data.printers ?? [];
  } catch (e) {
    console.warn(`[getWindowsPrinters] No se pudo obtener lista de impresoras de http://localhost:${port}/printers:`, e);
    return [];
  }
}

// ─── Factory de transporte ────────────────────────────────────────────────────

// ─── Factory de transporte ────────────────────────────────────────────────────

export type PrinterArea = "cuentas" | "cocina" | "barra" | string;
export type PrinterMode = "windows" | "bluetooth" | "disabled";

export interface AreaPrinterSetting {
  id: string;
  name: string;
  emoji?: string;
  mode: PrinterMode;
  printerName: string;
  windowsPort: string;
  isCustom?: boolean;
}

export type TenantPrinterSettings = Record<string, AreaPrinterSetting>;

export function getDefaultTenantPrinterSettings(): TenantPrinterSettings {
  return {
    cuentas: { id: "cuentas", name: "Cuentas (Tickets / Recibos)", emoji: "💵", mode: "windows", printerName: "cuentas", windowsPort: "3010" },
    cocina: { id: "cocina", name: "Cocina (Comandas)", emoji: "🍳", mode: "windows", printerName: "cocina", windowsPort: "3010" },
    barra: { id: "barra", name: "Barra (Bebidas)", emoji: "🍹", mode: "windows", printerName: "barra", windowsPort: "3010" },
  };
}

export function getTenantPrinterSettings(tenantId?: string): TenantPrinterSettings {
  const tId = tenantId || getActiveTenantId();
  const defaults = getDefaultTenantPrinterSettings();

  try {
    const raw = localStorage.getItem(`tenant_printer_config_${tId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...defaults,
          ...parsed,
        };
      }
    }
  } catch (e) {}

  const globalDest = getTenantPrintDestination(tId);
  const defaultPort = getTenantPrinterPort(tId);

  const bCuentas = localStorage.getItem(`bluetooth_printer_cuentas_${tId}`) || localStorage.getItem("bluetooth_printer_cuentas") || "cuentas";
  const bCocina = localStorage.getItem(`bluetooth_printer_cocina_${tId}`) || localStorage.getItem("bluetooth_printer_cocina") || "cocina";
  const bBarra = localStorage.getItem(`bluetooth_printer_barra_${tId}`) || localStorage.getItem("bluetooth_printer_barra") || "barra";

  return {
    cuentas: {
      id: "cuentas",
      name: "Cuentas (Tickets / Recibos)",
      emoji: "💵",
      mode: globalDest === "bluetooth" ? "bluetooth" : "windows",
      printerName: bCuentas,
      windowsPort: defaultPort,
    },
    cocina: {
      id: "cocina",
      name: "Cocina (Comandas)",
      emoji: "🍳",
      mode: globalDest === "bluetooth" ? "bluetooth" : "windows",
      printerName: bCocina,
      windowsPort: defaultPort,
    },
    barra: {
      id: "barra",
      name: "Barra (Bebidas)",
      emoji: "🍹",
      mode: globalDest === "bluetooth" ? "bluetooth" : "windows",
      printerName: bBarra,
      windowsPort: defaultPort,
    },
  };
}

export function saveTenantPrinterSettingsToLocal(tenantId: string, settings: TenantPrinterSettings): void {
  try {
    localStorage.setItem(`tenant_printer_config_${tenantId}`, JSON.stringify(settings));
    if (settings.cuentas?.printerName) {
      localStorage.setItem(`bluetooth_printer_cuentas_${tenantId}`, settings.cuentas.printerName);
    }
    if (settings.cocina?.printerName) {
      localStorage.setItem(`bluetooth_printer_cocina_${tenantId}`, settings.cocina.printerName);
    }
    if (settings.barra?.printerName) {
      localStorage.setItem(`bluetooth_printer_barra_${tenantId}`, settings.barra.printerName);
    }
    if (settings.cuentas?.windowsPort) {
      localStorage.setItem(`windows_printer_port_${tenantId}`, settings.cuentas.windowsPort);
    }
  } catch (e) {
    console.error("Error saving tenant printer settings to localStorage:", e);
  }
}

/**
 * Crea el transporte correcto según la configuración del tenant y del área:
 *   - Windows (Puerto configurado por área) → WindowsSpoolerTransport
 *   - Bluetooth Nativo (GATT / Web Bluetooth) → WebBluetoothTransport
 *   - Deshabilitado                         → ConsoleMockTransport
 *
 * @param area      Área de la impresora: "cuentas" | "cocina" | "barra"
 * @param tenantId  ID del inquilino opcional
 */
export async function createTransport(
  area: PrinterArea = "cuentas",
  tenantId?: string
): Promise<WebBluetoothTransport | WindowsSpoolerTransport | RawBtTransport | DatabaseQueueTransport | ConsoleMockTransport> {
  const tId = tenantId || getActiveTenantId();
  const settings = getTenantPrinterSettings(tId);
  const normalizedArea = (area.toLowerCase() === "caja" || area.toLowerCase() === "cuenta") ? "cuentas" : area.toLowerCase();
  const areaConfig = settings[normalizedArea] || settings[area] || { mode: "windows", printerName: area, windowsPort: "3010" };

  if (areaConfig.mode === "disabled") {
    return new ConsoleMockTransport(area);
  }

  if (areaConfig.mode === "windows") {
    return new WindowsSpoolerTransport(normalizedArea, areaConfig.windowsPort || "3010", areaConfig.printerName || area, tId);
  }

  if (areaConfig.mode === "bluetooth") {
    return new WebBluetoothTransport(normalizedArea, areaConfig.printerName);
  }

  if (areaConfig.mode === "rawbt") {
    return new RawBtTransport(areaConfig.printerName || normalizedArea, true);
  }

  if (WebBluetoothTransport.isConnected(normalizedArea, areaConfig.printerName)) {
    return new WebBluetoothTransport(normalizedArea, areaConfig.printerName);
  }

  return new WindowsSpoolerTransport(normalizedArea, areaConfig.windowsPort || "3010", areaConfig.printerName || area, tId);
}

// ─── Transports ───────────────────────────────────────────────────────────────

/** Envía el trabajo a la cola de impresión de la base de datos central */
export class DatabaseQueueTransport {
  printerKey: string;

  constructor(printerKey: string = "cuentas") {
    this.printerKey = printerKey;
  }

  send(prn: string) {
    const payload = {
      printer_key: this.printerKey,
      raw_data: prn,
    };

    fetch("/api/print-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          console.error("[Printer] Error al registrar en la cola de base de datos:", err);
        } else {
          console.log(`🔌 [Printer] Ticket para '${this.printerKey}' encolado exitosamente en base de datos para impresión en Windows.`);
        }
      })
      .catch((err) => {
        console.error("[Printer] No se pudo conectar con la API de cola de impresión:", err);
      });
  }
}

/** Envía el trabajo a la app RawBT en Android vía Intent URL scheme */
export class RawBtTransport {
  printerName?: string;
  forceRawBt: boolean;

  constructor(printerName?: string, forceRawBt: boolean = false) {
    this.printerName = printerName;
    this.forceRawBt = forceRawBt;
  }

  send(prn: string) {
    const logicalKey = this.printerName || "cuentas";
    const mappedPrinter = localStorage.getItem(`bluetooth_printer_${logicalKey}`) || logicalKey;

    const useRawBt = this.forceRawBt || localStorage.getItem("system_use_rawbt") === "true";
    if (!useRawBt) {
      console.log(`🔌 [RawBtTransport] Redirigiendo impresión a DatabaseQueueTransport porque RAWBT está deshabilitado por default.`);
      new DatabaseQueueTransport(logicalKey).send(prn);
      return;
    }

    let S = "#Intent;scheme=rawbt;";
    if (mappedPrinter) {
      S += `S.printer=${mappedPrinter};`;
    }
    const P = "package=ru.a402d.rawbtprinter;end;";
    const textEncoded = "base64," + btoa(unescape(prn));
    window.location.href = "intent:" + textEncoded + S + P;
  }
}

/**
 * Envía el trabajo al servidor Python local (sentinel_printer.py)
 * vía HTTP POST en el puerto configurado (ej: 3010)
 */
export class WindowsSpoolerTransport {
  printerKey: string;
  customPort?: string;
  customPrinterName?: string;
  tenantId?: string;

  private static KEY_MAP: Record<string, string> = {
    cuentas: "cuentas",
    cocina:  "cocina",
    barra:   "barra",
  };

  constructor(printerKey: string = "cuentas", customPort?: string, customPrinterName?: string, tenantId?: string) {
    this.printerKey = printerKey;
    this.customPort = customPort;
    this.customPrinterName = customPrinterName;
    this.tenantId = tenantId;
  }

  async send(prn: string): Promise<boolean> {
    const key = this.customPrinterName || (WindowsSpoolerTransport.KEY_MAP[this.printerKey.toLowerCase()] ?? this.printerKey);
    const port = this.customPort || getTenantPrinterPort(this.tenantId) || "3010";
    const startTime = Date.now();

    const payload = {
      printer: key,
      raw_data: prn,
    };

    console.log(`🖨️ [WindowsSpoolerTransport] Enviando ticket a http://localhost:${port}/print (Impresora: '${key}', Tenant: '${this.tenantId || 'activo'}')`);

    const maxRetries = 2;
    let lastErrorMsg = "";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`http://localhost:${port}/print`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const durationMs = Date.now() - startTime;

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          console.error(`[Printer] Error del sentinel en intento ${attempt}:`, err);
          lastErrorMsg = err?.error || res.statusText;
        } else {
          const resData = await res.json().catch(() => ({}));
          console.log(`✅ [Printer] Impresión rápida exitosa en puerto ${port} para '${key}' (${durationMs}ms)`);
          
          fetch('/api/printer-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tipo: 'raw_spooler',
              area: this.printerKey,
              printerName: key,
              port,
              status: resData.ignored ? 'DUPLICATE' : 'SUCCESS',
              durationMs,
              details: resData
            })
          }).catch(() => {});

          return true;
        }
      } catch (err: any) {
        lastErrorMsg = err?.message || String(err);
        console.warn(`[Printer] Intento ${attempt}/${maxRetries} fallido enviando a http://localhost:${port}/print:`, err);
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    const durationMs = Date.now() - startTime;

    // Registrar fallo en log
    fetch('/api/printer-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'raw_spooler',
        area: this.printerKey,
        printerName: key,
        port,
        status: 'ERROR',
        durationMs,
        errorMsg: lastErrorMsg
      })
    }).catch(() => {});

    // 🔴 Si fallaron los retries, notificar al mesero/usuario con una alerta clara en pantalla
    console.error(`❌ [Printer Error] Todos los intentos de impresión en puerto ${port} fallaron. Notificando error.`);

    notifyPrinterEvent({
      title: "❌ Error de Impresión - Sentinela Caído",
      message: `No se pudo conectar al Sentinela local en http://localhost:${port}. Verifica que el servicio (sentinel_printer.py) esté iniciado (${lastErrorMsg || "Sin conexión"}).`,
      type: "error",
    });

    // Intentar encolar en el backend local por contingencia de forma segura
    try {
      const qCtrl = new AbortController();
      const qTimeout = setTimeout(() => qCtrl.abort(), 1000);
      await fetch(`/api/print-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printer_key: key, raw_data: prn }),
        signal: qCtrl.signal,
      });
      clearTimeout(qTimeout);
      console.log(`📌 [Printer Fallback] Ticket guardado en la cola de contingencia de la base de datos.`);
    } catch (e) {
      console.warn(`[Printer Fallback] Tampoco se pudo guardar en la cola de contingencia:`, e);
    }

    return false;
  }
}

/** Transporte de fallback que solo imprime en consola (para testing) */
export class ConsoleMockTransport {
  area: string;
  constructor(area: string = "cuentas") {
    this.area = area;
  }
  send(prn: string) {
    console.group(`[MockPrinter → ${this.area}]`);
    console.log("ESC/POS raw data (URL-encoded):", prn.substring(0, 200) + "...");
    console.groupEnd();
  }
}

// ─── Web Bluetooth Transport ──────────────────────────────────────────────────

/**
 * Transporte para comunicación directa con impresoras térmicas vía Web Bluetooth API (GATT)
 */
export class WebBluetoothTransport {
  static activeConnections: Record<string, { device: any; server: any; writeCharacteristic: any }> = {};
  area: string;
  printerName?: string;

  constructor(area: string = "cuentas", printerName?: string) {
    this.area = area;
    this.printerName = printerName;
  }

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  static isConnected(area?: string, printerName?: string): boolean {
    if (!area) {
      return Object.values(WebBluetoothTransport.activeConnections).some(
        c => c.device && c.server?.connected && c.writeCharacteristic
      );
    }
    const conn = WebBluetoothTransport.activeConnections[area] || 
                 (printerName ? WebBluetoothTransport.activeConnections[printerName] : null);
    return !!(conn && conn.device && conn.server?.connected && conn.writeCharacteristic);
  }

  static async scanAndConnect(area: string = "cuentas"): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!WebBluetoothTransport.isSupported()) {
      return { success: false, error: "Web Bluetooth API no está soportado en este navegador. Usa Google Chrome o Microsoft Edge." };
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // Common Serial/Printer service
          "49535343-fe7d-41a3-93d0-8609310014f5", // ISSC Transparent service
          "00001101-0000-1000-8000-00805f9b34fb", // SPP UUID
          "0000e7e0-0000-1000-8000-00805f9b34fb", // Custom ESC/POS service
          "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Feasycom BLE printer
          "0000af00-0000-1000-8000-00805f9b34fb", // JP-58 printer
          "0000ff00-0000-1000-8000-00805f9b34fb", // Custom FF00
          "0000fee7-0000-1000-8000-00805f9b34fb", // Wechat / POS printer service
          "0000ff02-0000-1000-8000-00805f9b34fb",
          "0000ffe0-0000-1000-8000-00805f9b34fb", // HM-10 UART
          "0000fff0-0000-1000-8000-00805f9b34fb",
          "000018f1-0000-1000-8000-00805f9b34fb",
          "00001800-0000-1000-8000-00805f9b34fb",
          "0000180a-0000-1000-8000-00805f9b34fb"
        ]
      });

      if (!device) return { success: false, error: "No se seleccionó ningún dispositivo Bluetooth." };

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      let charFound: any = null;

      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              charFound = char;
              break;
            }
          }
        } catch {
          continue;
        }
        if (charFound) break;
      }

      if (!charFound) {
        return { success: false, error: `Se conectó con '${device.name || device.id}', pero no se encontró un canal de escritura ESC/POS compatible.` };
      }

      const connObj = {
        device,
        server,
        writeCharacteristic: charFound
      };

      WebBluetoothTransport.activeConnections[area] = connObj;
      if (device.name) {
        WebBluetoothTransport.activeConnections[device.name] = connObj;
      }

      device.addEventListener("gattserverdisconnected", () => {
        console.warn(`[Bluetooth] Dispositivo '${device.name || area}' desconectado.`);
      });

      return { success: true, deviceName: device.name || device.id };
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        return { success: false, error: "Búsqueda cancelada por el usuario." };
      }
      console.error("Error al conectar por Web Bluetooth:", err);
      return { success: false, error: err.message || "No se pudo establecer conexión Bluetooth." };
    }
  }

  static async tryAutoReconnect(area: string, printerName?: string): Promise<boolean> {
    if (!WebBluetoothTransport.isSupported()) return false;
    try {
      const existingConn = WebBluetoothTransport.activeConnections[area] || 
                           (printerName ? WebBluetoothTransport.activeConnections[printerName] : null);
      if (existingConn?.device) {
        if (!existingConn.server?.connected) {
          const server = await existingConn.device.gatt.connect();
          existingConn.server = server;
          const services = await server.getPrimaryServices();
          for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                existingConn.writeCharacteristic = char;
                return true;
              }
            }
          }
        }
        return true;
      }

      if (typeof (navigator as any).bluetooth?.getDevices === "function") {
        const devices = await (navigator as any).bluetooth.getDevices();
        if (devices && devices.length > 0) {
          const targetDevice = (printerName
            ? devices.find((d: any) => d.name === printerName || d.id === printerName)
            : null) || devices[0];

          if (targetDevice) {
            const server = await targetDevice.gatt.connect();
            const services = await server.getPrimaryServices();
            let charFound: any = null;
            for (const service of services) {
              try {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                  if (char.properties.write || char.properties.writeWithoutResponse) {
                    charFound = char;
                    break;
                  }
                }
              } catch {}
              if (charFound) break;
            }

            if (charFound) {
              const connObj = { device: targetDevice, server, writeCharacteristic: charFound };
              WebBluetoothTransport.activeConnections[area] = connObj;
              if (targetDevice.name) WebBluetoothTransport.activeConnections[targetDevice.name] = connObj;
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.warn("[Bluetooth] Intento de auto-reconexión falló:", e);
    }
    return false;
  }

  static async disconnect(area?: string): Promise<void> {
    if (!area) {
      for (const key of Object.keys(WebBluetoothTransport.activeConnections)) {
        await WebBluetoothTransport.disconnect(key);
      }
      return;
    }
    const conn = WebBluetoothTransport.activeConnections[area];
    if (conn) {
      if (conn.server && conn.server.connected) {
        conn.server.disconnect();
      }
      delete WebBluetoothTransport.activeConnections[area];
    }
  }

  async send(prn: string): Promise<boolean> {
    const area = this.area || "cuentas";
    let isConn = WebBluetoothTransport.isConnected(area, this.printerName);

    if (!isConn) {
      console.log(`[Bluetooth] Intentando auto-reconexión para área '${area}' (${this.printerName || 'sin nombre'})...`);
      isConn = await WebBluetoothTransport.tryAutoReconnect(area, this.printerName);
    }

    if (!isConn) {
      console.warn(`[Bluetooth] Impresora Bluetooth '${this.printerName || area}' no está conectada por GATT.`);
      
      if (isAndroid()) {
        console.log(`[Bluetooth] Entorno Android detectado: fallback a RawBT Transport.`);
        new RawBtTransport(this.printerName || area, true).send(prn);
        return true;
      }

      notifyPrinterEvent({
        title: "⚠️ Impresora Bluetooth no conectada",
        message: `No se pudo conectar a la impresora Bluetooth '${this.printerName || area}'. Asegúrate de que esté encendida y vinculada desde la Configuración de Impresoras.`,
        type: "warning",
      });
      return false;
    }

    const conn = WebBluetoothTransport.activeConnections[area] || 
                 (this.printerName ? WebBluetoothTransport.activeConnections[this.printerName] : null);
    if (!conn || !conn.writeCharacteristic) return false;

    try {
      // Convertir raw string URL percent-encoded a Uint8Array
      const bytes: number[] = [];
      let i = 0;
      while (i < prn.length) {
        if (prn[i] === "%" && i + 2 < prn.length) {
          const hex = prn.substring(i + 1, i + 3);
          bytes.push(parseInt(hex, 16));
          i += 3;
        } else {
          bytes.push(prn.charCodeAt(i));
          i++;
        }
      }

      const buffer = new Uint8Array(bytes);
      const chunkSize = 80;
      for (let offset = 0; offset < buffer.length; offset += chunkSize) {
        const chunk = buffer.slice(offset, offset + chunkSize);
        if (conn.writeCharacteristic.properties.writeWithoutResponse) {
          await conn.writeCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await conn.writeCharacteristic.writeValueWithResponse(chunk);
        }
        await new Promise((r) => setTimeout(r, 10));
      }

      console.log(`✅ [Bluetooth] Impresión enviada exitosamente a '${this.printerName || area}' (${buffer.length} bytes)`);
      return true;
    } catch (err: any) {
      console.error("[Bluetooth] Error al transmitir datos a la impresora Bluetooth:", err);
      notifyPrinterEvent({
        title: "❌ Error de Impresión Bluetooth",
        message: `Fallo al transmitir a la impresora '${this.printerName || area}': ${err?.message || "Desconexión"}`,
        type: "error",
      });
      return false;
    }
  }
}

// ─── Generador de Páginas de Prueba ──────────────────────────────────────────

export async function sendTestReceipt(logicalKey: string, customName: string, tenantId?: string) {
  const normalizedArea = (logicalKey.toLowerCase() === "caja" || logicalKey.toLowerCase() === "cuenta") ? "cuentas" : logicalKey.toLowerCase();
  const settings = getTenantPrinterSettings(tenantId);
  const areaConfig = settings[normalizedArea] || settings[logicalKey] || { mode: "windows", printerName: customName || normalizedArea, windowsPort: "3010" };
  const driver = new EscPosDriver();
  const targetPrinterName = areaConfig.printerName || customName || normalizedArea;

  if (areaConfig.mode === "windows") {
    const port = areaConfig.windowsPort || "3010";
    const transport = new WindowsSpoolerTransport(normalizedArea, port, targetPrinterName, tenantId);
    const job = new PosPrinterJob(driver, transport as any);
    await buildTestJob(job, normalizedArea, targetPrinterName, `Puerto de Windows (Puerto ${port})`).execute();
    return {
      success: true,
      message: `Página de prueba enviada a '${targetPrinterName}' vía Puerto de Windows ${port}.`,
    };
  } else if (areaConfig.mode === "rawbt") {
    const transport = new RawBtTransport(targetPrinterName, true);
    const job = new PosPrinterJob(driver, transport as any);
    await buildTestJob(job, normalizedArea, targetPrinterName, "App RawBT (Bluetooth)").execute();
    return {
      success: true,
      message: `Página de prueba enviada a '${targetPrinterName}' vía App RawBT.`,
    };
  } else if (areaConfig.mode === "disabled") {
    return {
      success: false,
      message: `Impresora deshabilitada para el área '${normalizedArea}'.`,
    };
  } else {
    // Modo Bluetooth Directo
    const transport = new WebBluetoothTransport(normalizedArea, targetPrinterName);
    const job = new PosPrinterJob(driver, transport as any);
    await buildTestJob(job, normalizedArea, targetPrinterName, "Bluetooth Directo (Nativo GATT)").execute();
    return {
      success: true,
      message: `Página de prueba enviada a '${targetPrinterName}' vía Bluetooth Directo.`,
    };
  }
}

function buildTestJob(job: PosPrinterJob, logicalKey: string, customName: string, modeName: string): PosPrinterJob {
  return job
    .initialize()
    .beep(4)
    .center()
    .bold(true)
    .printLine("================================")
    .printLine("     COCINET RESTAURANTE PRO    ")
    .printLine("  PAGINA DE PRUEBA DE IMPRESION ")
    .printLine("================================")
    .bold(false)
    .left()
    .printLine(`Area Logica: ${logicalKey.toUpperCase()}`)
    .printLine(`Imp. Bluetooth: ${customName}`)
    .printLine(`Modo Conex.: ${modeName}`)
    .printLine(`Fecha: ${new Date().toLocaleDateString()}`)
    .printLine(`Hora: ${new Date().toLocaleTimeString()}`)
    .printLine("--------------------------------")
    .printLine("PRUEBA DE FUENTES Y ALINEACION:")
    .left().printLine("Izquierda  [OK]")
    .center().printLine("Centro     [OK]")
    .right().printLine("Derecha    [OK]")
    .left()
    .printLine("--------------------------------")
    .bold(true)
    .printLine("CARACTERES Y PATRON DE CORTE:")
    .bold(false)
    .printLine("ABCDEFGHIJKLM NOPQRSTUVWXYZ")
    .printLine("1234567890 !@#$%^&*()_+-=")
    .printLine("[██████████████████████████████]")
    .printLine("--------------------------------")
    .center()
    .bold(true)
    .printLine("CONEXION Y PRUEBA EXITOSA ⭐")
    .bold(false)
    .feed(3)
    .cut();
}

// ─── Driver ESC/POS ──────────────────────────────────────────────────────────

export class EscPosDriver {
  encodeByte(b: number) {
    let hexString = Math.floor(b).toString(16);
    if (hexString.length % 2) {
      hexString = "0" + hexString;
    }
    return "%" + hexString;
  }

  lf(lines?: number) {
    if (lines === undefined || lines < 2) {
      return this.encodeByte(10) + this.encodeByte(13);
    } else {
      return this.encodeByte(27) + "d" + this.encodeByte(lines);
    }
  }

  alignment(aligment: number) {
    return this.encodeByte(27) + "a" + this.encodeByte(aligment);
  }

  cut(mode: number, lines: number) {
    return this.encodeByte(29) + "V" + this.encodeByte(mode) + this.encodeByte(lines);
  }

  setPrintMode(mode: number) {
    return this.encodeByte(27) + "!" + this.encodeByte(mode);
  }

  /**
   * Configura el multiplicador de tamaño de caracteres vía GS ! n (ESC/POS estándar)
   * @param widthMultiplier  Multiplicador de ancho (1 a 8)
   * @param heightMultiplier Multiplicador de alto (1 a 8)
   */
  setFontSize(widthMultiplier: number = 1, heightMultiplier: number = 1) {
    const w = Math.min(Math.max(Math.floor(widthMultiplier), 1), 8) - 1;
    const h = Math.min(Math.max(Math.floor(heightMultiplier), 1), 8) - 1;
    const n = (w << 4) | h;
    return this.encodeByte(29) + "!" + this.encodeByte(n);
  }

  setDoubleHeight(on: boolean = true) {
    return this.setFontSize(1, on ? 2 : 1);
  }

  setDoubleWidth(on: boolean = true) {
    return this.setFontSize(on ? 2 : 1, 1);
  }

  setDoubleSize(on: boolean = true) {
    return this.setFontSize(on ? 2 : 1, on ? 2 : 1);
  }

  emphasis(mode: boolean | number) {
    return this.encodeByte(27) + "E" + (mode ? "1" : "0");
  }

  underline(mode: number) {
    return this.encodeByte(27) + "-" + this.encodeByte(mode);
  }

  initialize() {
    return this.encodeByte(27) + "@";
  }

  beep(times: number = 4) {
    let s = "";
    // BEL character (ASCII 7)
    for (let i = 0; i < times; i++) {
      s += this.encodeByte(7);
    }
    // ESC B n t (ESC 66 count duration)
    s += this.encodeByte(27) + "B" + this.encodeByte(times) + this.encodeByte(2);
    // ESC ( A tone/sound command
    s += this.encodeByte(27) + this.encodeByte(40) + "A" + this.encodeByte(4) + this.encodeByte(0) + "04" + this.encodeByte(1) + this.encodeByte(1);
    return s;
  }

  qrCode(url: string) {
    const bytes = new TextEncoder().encode(url);
    const storeLen = bytes.length + 3;
    const pL = storeLen % 256;
    const pH = Math.floor(storeLen / 256);
    let s = "";

    // Set QR code model (Model 2)
    s += this.encodeByte(29) + "(k" + this.encodeByte(4) + this.encodeByte(0) + "1A" + this.encodeByte(50) + this.encodeByte(0);
    // Set module size (size 6)
    s += this.encodeByte(29) + "(k" + this.encodeByte(3) + this.encodeByte(0) + "1C" + this.encodeByte(6);
    // Set error correction level (Level M)
    s += this.encodeByte(29) + "(k" + this.encodeByte(3) + this.encodeByte(0) + "1E" + this.encodeByte(49);
    // Store data in symbol storage area
    s += this.encodeByte(29) + "(k" + this.encodeByte(pL) + this.encodeByte(pH) + "1P0";
    bytes.forEach((b) => {
      s += this.encodeByte(b);
    });
    // Print symbol data
    s += this.encodeByte(29) + "(k" + this.encodeByte(3) + this.encodeByte(0) + "1Q0";
    return s;
  }
}

// ─── Job de impresión ─────────────────────────────────────────────────────────

export class PosPrinterJob {
  driver: EscPosDriver;
  transport: RawBtTransport | WindowsSpoolerTransport | ConsoleMockTransport | WebBluetoothTransport | DatabaseQueueTransport;
  buffer: string[];

  ALIGNMENT_LEFT = 0;
  ALIGNMENT_CENTER = 1;
  ALIGNMENT_RIGHT = 2;

  FONT_SIZE_SMALL = 1;
  FONT_SIZE_NORMAL = 0;
  FONT_SIZE_MEDIUM1 = 33;
  FONT_SIZE_MEDIUM2 = 15;
  FONT_SIZE_MEDIUM3 = 49;
  FONT_SIZE_BIG = 48;
  FONT_SIZE_BIG_BOLD = 56;
  FONT_SIZE_DOUBLE_HEIGHT = 16;
  FONT_SIZE_DOUBLE_HEIGHT_BOLD = 24;
  FONT_SIZE_DOUBLE_WIDTH = 32;
  FONT_SIZE_DOUBLE_WIDTH_BOLD = 40;

  FONT_A = 0;
  FONT_B = 1;
  FONT_EMPHASIZED = 8;
  FONT_DOUBLE_HEIGHT_FLAG = 16;
  FONT_DOUBLE_WIDTH_FLAG = 32;
  FONT_ITALIC = 64;
  FONT_UNDERLINE = 128;

  UNDERLINE_NONE = 0;
  UNDERLINE_SINGLE = 1;
  UNDERLINE_DOUBLE = 2;

  CUT_FULL = 65;
  CUT_PARTIAL = 66;

  constructor(
    driver: EscPosDriver,
    transport: RawBtTransport | WindowsSpoolerTransport | ConsoleMockTransport | WebBluetoothTransport | DatabaseQueueTransport
  ) {
    this.driver = driver;
    this.transport = transport;
    this.buffer = [];
  }

  beep(times: number = 4) {
    this.buffer.push(this.driver.beep(times));
    return this;
  }

  async execute() {
    await this.transport.send(this.buffer.join(""));
    return this;
  }

  initialize() {
    this.buffer.push(this.driver.initialize());
    return this;
  }

  print(string: string) {
    const cleanStr = String(string ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E\n\r]/g, " ");
    const bytes = new TextEncoder().encode(cleanStr);
    let s = "";
    bytes.forEach((b) => {
      s += this.driver.encodeByte(b);
    });
    this.buffer.push(s);
    return this;
  }

  printLine(string: string) {
    this.print(string);
    this.buffer.push(this.driver.lf());
    return this;
  }

  printText(
    text: string,
    aligment: number = this.ALIGNMENT_LEFT,
    size: number = this.FONT_SIZE_NORMAL
  ) {
    this.setAlignment(aligment);
    this.setPrintMode(size);
    this.printLine(text);
    return this;
  }

  setPrintMode(mode: number) {
    this.buffer.push(this.driver.setPrintMode(mode));
    return this;
  }

  /**
   * Ajusta el tamaño de fuente (multiplicador de ancho y alto de 1 a 8)
   */
  setFontSize(widthMultiplier: number = 1, heightMultiplier: number = 1) {
    this.buffer.push(this.driver.setFontSize(widthMultiplier, heightMultiplier));
    return this;
  }

  /**
   * Activa o desactiva la fuente de doble altura
   */
  doubleHeight(on: boolean = true) {
    this.buffer.push(this.driver.setDoubleHeight(on));
    return this;
  }

  /**
   * Activa o desactiva la fuente de doble anchura
   */
  doubleWidth(on: boolean = true) {
    this.buffer.push(this.driver.setDoubleWidth(on));
    return this;
  }

  /**
   * Activa o desactiva la fuente de doble tamaño (ancho y alto x2)
   */
  doubleSize(on: boolean = true) {
    this.buffer.push(this.driver.setDoubleSize(on));
    return this;
  }

  /**
   * Restablece el tamaño de fuente a tamaño estándar/normal
   */
  normalSize() {
    this.buffer.push(this.driver.setFontSize(1, 1));
    this.buffer.push(this.driver.setPrintMode(0));
    return this;
  }

  emphasis(mode: boolean | number) {
    this.buffer.push(this.driver.emphasis(mode));
    return this;
  }

  bold(on: boolean = true) {
    this.buffer.push(this.driver.emphasis(on));
    return this;
  }

  underline(mode: number = this.UNDERLINE_SINGLE) {
    this.buffer.push(this.driver.underline(mode));
    return this;
  }

  setAlignment(aligment: number = this.ALIGNMENT_LEFT) {
    this.buffer.push(this.driver.alignment(aligment));
    return this;
  }

  cut(mode: number = this.CUT_FULL, lines: number = 3) {
    this.buffer.push(this.driver.cut(mode, lines));
    return this;
  }

  feed(lines: number = 1) {
    this.buffer.push(this.driver.lf(lines));
    return this;
  }

  left() {
    this.buffer.push(this.driver.alignment(this.ALIGNMENT_LEFT));
    return this;
  }

  right() {
    this.buffer.push(this.driver.alignment(this.ALIGNMENT_RIGHT));
    return this;
  }

  center() {
    this.buffer.push(this.driver.alignment(this.ALIGNMENT_CENTER));
    return this;
  }

  printQR(url: string) {
    this.buffer.push(this.driver.qrCode(url));
    return this;
  }
}
