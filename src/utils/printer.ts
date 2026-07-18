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

/** URL base del sentinel de impresión en Windows */
export const SENTINEL_URL = "http://localhost:3010";

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
    const res = await fetch(`${SENTINEL_URL}/status`, {
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
    const res = await fetch(`${SENTINEL_URL}/printers`);
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
): Promise<RawBtTransport | WindowsSpoolerTransport | DatabaseQueueTransport | ConsoleMockTransport> {
  // 1. En Windows, si el centinela local está activo, imprimir directo
  if (isWindows()) {
    const online = await isSentinelOnline();
    if (online) {
      return new WindowsSpoolerTransport(area);
    }
  }
  
  // 2. En Android
  if (isAndroid()) {
    // Comprobar si se ha habilitado explícitamente "Usar RAWBT" en la configuración
    // NOTA: Por defecto estará deshabilitado (false), lo cual evita que intente abrir la app Bluetooth automáticamente.
    const useRawBt = localStorage.getItem("system_use_rawbt") === "true";
    if (useRawBt) {
      return new RawBtTransport(area);
    } else {
      // Si está deshabilitado por default, lo enviamos a la cola central en la base de datos SQLite
      // de modo que el centinela de Windows pueda detectarlo e imprimirlo físicamente.
      return new DatabaseQueueTransport(area);
    }
  }

  // 3. Fallback general: registrar en la base de datos central para impresión remota por el centinela central
  return new DatabaseQueueTransport(area);
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

  constructor(printerName?: string) {
    this.printerName = printerName;
  }

  send(prn: string) {
    // Comprobar si "Usar RAWBT" está explícitamente habilitado en localStorage
    // IMPORTANTE: Por defecto está deshabilitado (false), lo cual evita llamadas involuntarias
    const useRawBt = localStorage.getItem("system_use_rawbt") === "true";
    if (!useRawBt) {
      console.log(`🔌 [RawBtTransport] Redirigiendo impresión a DatabaseQueueTransport porque RAWBT está deshabilitado por default.`);
      new DatabaseQueueTransport(this.printerName || "cuentas").send(prn);
      return;
    }

    let S = "#Intent;scheme=rawbt;";
    if (this.printerName) {
      S += `S.printer=${this.printerName};`;
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

    fetch(`${SENTINEL_URL}/print`, {
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
