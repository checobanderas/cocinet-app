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

/** URL base del sentinel de impresión en Windows (puerto configurable) */
export function getSentinelUrl(): string {
  const port = localStorage.getItem("windows_printer_port") || "3010";
  return `http://localhost:${port}`;
}

/** Devuelve true si el navegador corre en Windows */
export function isWindows(): boolean {
  const platform = (navigator as any).platform || "";
  const userAgent = navigator.userAgent || "";
  return /Win/i.test(platform) || /Windows/i.test(userAgent);
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
export async function getWindowsPrinters(): Promise<string[]> {
  try {
    const res = await fetch(`${getSentinelUrl()}/printers`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.printers ?? [];
  } catch {
    return [];
  }
}

// ─── Factory de transporte ────────────────────────────────────────────────────

export type PrinterArea = "cuentas" | "cocina" | "barra";

/**
 * Crea el transporte correcto según la plataforma:
 *   - Android con RawBT habilitado   → RawBtTransport
 *   - Android con RawBT deshabilitado → DatabaseQueueTransport (cola central)
 *   - Windows con sentinel activo     → WindowsSpoolerTransport
 *   - Fallback (o sentinel offline)   → DatabaseQueueTransport (remoto)
 *
 * @param area  Área de la impresora: "cuentas" | "cocina" | "barra"
 */
export async function createTransport(
  area: PrinterArea = "cuentas"
): Promise<WebBluetoothTransport | WindowsSpoolerTransport | RawBtTransport | DatabaseQueueTransport | ConsoleMockTransport> {
  const destination = localStorage.getItem("system_print_destination") || "bluetooth";

  if (destination === "windows") {
    return new WindowsSpoolerTransport(area);
  }

  // Si se decide bluetooth:
  // 1. Si Web Bluetooth está conectado por GATT para esta área, usar Web Bluetooth
  if (WebBluetoothTransport.isConnected(area)) {
    return new WebBluetoothTransport(area);
  }

  // 2. Si no, usar RawBtTransport
  return new RawBtTransport(area);
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
    // Determinar la clave lógica original (por defecto 'cuentas')
    const logicalKey = this.printerName || "cuentas";
    
    // Mapear la clave lógica a la impresora bluetooth configurada
    const mappedPrinter = localStorage.getItem(`bluetooth_printer_${logicalKey}`) || logicalKey;

    // Comprobar si "Usar RAWBT" está explícitamente habilitado en localStorage o si se fuerza
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
 * vía HTTP POST en localhost:3010
 */
export class WindowsSpoolerTransport {
  printerKey: string;

  /** Mapa de áreas lógicas a claves que reconoce el sentinel */
  private static KEY_MAP: Record<string, string> = {
    cuentas: "cuentas",
    cocina:  "cocina",
    barra:   "barra",
  };

  constructor(printerKey: string = "cuentas") {
    this.printerKey = printerKey;
  }

  send(prn: string) {
    const key = WindowsSpoolerTransport.KEY_MAP[this.printerKey.toLowerCase()] ?? this.printerKey;

    const payload = {
      printer: key,
      raw_data: prn,
    };

    fetch(`${getSentinelUrl()}/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          console.error("[Printer] Error del sentinel:", err);
        }
      })
      .catch((err) => {
        console.warn("[Printer] Sentinel offline o inaccesible:", err);
      });
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
  printerName?: string;

  constructor(printerName?: string) {
    this.printerName = printerName;
  }

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  static isConnected(area?: string): boolean {
    if (!area) {
      return Object.values(WebBluetoothTransport.activeConnections).some(
        c => c.device && c.server?.connected && c.writeCharacteristic
      );
    }
    const conn = WebBluetoothTransport.activeConnections[area];
    return !!(conn && conn.device && conn.server?.connected && conn.writeCharacteristic);
  }

  static async scanAndConnect(area: string = "cuentas"): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!WebBluetoothTransport.isSupported()) {
      return { success: false, error: "Web Bluetooth API no está soportado en este navegador. Usa Chrome o Edge." };
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // Common Serial/Printer service
          "49535343-fe7d-41a3-93d0-8609310014f5", // ISSC Transparent service
          "00001101-0000-1000-8000-00805f9b34fb", // SPP UUID
          "0000e7e0-0000-1000-8000-00805f9b34fb"  // Custom ESC/POS service
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
        return { success: false, error: `Se conectó con '${device.name || device.id}', pero no se encontró un servicio de escritura compatible.` };
      }

      WebBluetoothTransport.activeConnections[area] = {
        device,
        server,
        writeCharacteristic: charFound
      };

      return { success: true, deviceName: device.name || device.id };
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        return { success: false, error: "Búsqueda cancelada por el usuario." };
      }
      console.error("Error al conectar por Web Bluetooth:", err);
      return { success: false, error: err.message || "No se pudo establecer conexión Bluetooth." };
    }
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

  async send(prn: string) {
    const area = this.printerName || "cuentas";
    if (!WebBluetoothTransport.isConnected(area)) {
      console.warn(`Web Bluetooth no está conectado activamente por GATT para el área: ${area}. Encolando para impresión en servidor...`);
      new DatabaseQueueTransport(area).send(prn);
      return;
    }

    const conn = WebBluetoothTransport.activeConnections[area];
    if (!conn) return;

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
      const chunkSize = 100;
      for (let offset = 0; offset < buffer.length; offset += chunkSize) {
        const chunk = buffer.slice(offset, offset + chunkSize);
        if (conn.writeCharacteristic.properties.writeWithoutResponse) {
          await conn.writeCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await conn.writeCharacteristic.writeValueWithResponse(chunk);
        }
      }
    } catch (err) {
      console.error("Error al enviar datos por Web Bluetooth:", err);
      new DatabaseQueueTransport(area).send(prn);
    }
  }
}

// ─── Generador de Páginas de Prueba ──────────────────────────────────────────

export function sendTestReceipt(logicalKey: string, customName: string) {
  const destination = localStorage.getItem("system_print_destination") || "bluetooth";
  const driver = new EscPosDriver();

  if (destination === "windows") {
    const transport = new WindowsSpoolerTransport(logicalKey);
    const job = new PosPrinterJob(driver, transport);
    const port = localStorage.getItem("windows_printer_port") || "3010";
    buildTestJob(job, logicalKey, customName, `Puerto de Windows (Puerto ${port})`).execute();
    return {
      success: true,
      message: `Página de prueba enviada a '${customName}' vía Puerto de Windows ${port}.`,
    };
  } else {
    // Bluetooth
    if (WebBluetoothTransport.isConnected(logicalKey)) {
      const transport = new WebBluetoothTransport(logicalKey);
      const job = new PosPrinterJob(driver, transport as any);
      buildTestJob(job, logicalKey, customName, "Web Bluetooth Directo (Nativo)").execute();
      return {
        success: true,
        message: `Página de prueba enviada a '${customName}' vía Web Bluetooth Directo (Nativo).`,
      };
    } else {
      const transport = new RawBtTransport(logicalKey, true); // Force RawBT
      const job = new PosPrinterJob(driver, transport as any);
      buildTestJob(job, logicalKey, customName, "App RawBT (Bluetooth)").execute();
      return {
        success: true,
        message: `Página de prueba enviada a '${customName}' vía App RawBT.`,
      };
    }
  }
}

function buildTestJob(job: PosPrinterJob, logicalKey: string, customName: string, modeName: string): PosPrinterJob {
  return job
    .initialize()
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

  emphasis(mode: boolean | number) {
    return this.encodeByte(27) + "E" + (mode ? "1" : "0");
  }

  underline(mode: number) {
    return this.encodeByte(27) + "-" + this.encodeByte(mode);
  }

  initialize() {
    return this.encodeByte(27) + "@";
  }
}

// ─── Job de impresión ─────────────────────────────────────────────────────────

export class PosPrinterJob {
  driver: EscPosDriver;
  transport: RawBtTransport | WindowsSpoolerTransport | ConsoleMockTransport;
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

  FONT_A = 0;
  FONT_B = 1;
  FONT_EMPHASIZED = 8;
  FONT_DOUBLE_HEIGHT = 16;
  FONT_DOUBLE_WIDTH = 32;
  FONT_ITALIC = 64;
  FONT_UNDERLINE = 128;

  UNDERLINE_NONE = 0;
  UNDERLINE_SINGLE = 1;
  UNDERLINE_DOUBLE = 2;

  CUT_FULL = 65;
  CUT_PARTIAL = 66;

  constructor(
    driver: EscPosDriver,
    transport: RawBtTransport | WindowsSpoolerTransport | ConsoleMockTransport
  ) {
    this.driver = driver;
    this.transport = transport;
    this.buffer = [];
  }

  execute() {
    this.transport.send(this.buffer.join(""));
    return this;
  }

  initialize() {
    this.buffer.push(this.driver.initialize());
    return this;
  }

  print(string: string) {
    const bytes = new TextEncoder().encode(string);
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
}
