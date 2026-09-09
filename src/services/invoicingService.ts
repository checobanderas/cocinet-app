/**
 * Invoicing Service - CFDI 4.0 Integration for Cocinet POS
 * Connects to tenant's api_facturar.php backend endpoint.
 */

export const DEFAULT_INVOICING_API_URL = "https://tickettimbre.com/trvladimir/api_facturar.php";

export interface SaveCustomerFiscalParams {
  rfc: string;
  nombre: string;
  cp: string;
  regimen: string;
  uso_cfdi?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ticket_id?: number | string;
  total?: number;
  forma_pago?: string;
  metodo_pago?: string;
  concepto?: string;
}

export interface SaveCustomerFiscalResponse {
  ok: boolean;
  cliente_id?: number;
  folio?: number;
  mensaje?: string;
  error?: string;
}

export interface PrepareInvoiceParams {
  ticket_id?: number | string;
  total: number;
  rfc: string;
  nombre: string;
  cp: string;
  regimen: string;
  uso_cfdi?: string;
  forma_pago?: string;
  metodo_pago?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  concepto?: string;
}

export interface PrepareInvoiceResponse {
  ok: boolean;
  folio?: number;
  serie?: string;
  cliente_id?: number;
  pdfUrl?: string;
  desglose?: {
    subtotal: number;
    iva: number;
    retencion_isr: number;
    total: number;
    esPersonaMoral: boolean;
  };
  error?: string;
}

export interface StampInvoiceParams {
  folio: number;
  serie?: string;
}

export interface StampInvoiceResponse {
  ok: boolean;
  folio?: number;
  uuid?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  error?: string;
}

export interface DiscardInvoiceParams {
  folio: number;
}

export interface DiscardInvoiceResponse {
  ok: boolean;
  mensaje?: string;
  error?: string;
}

/**
 * Format SAT/Finkok error messages to be user friendly and actionable.
 */
export function formatFriendlySatError(rawError: string): { title: string; explanation: string; tip: string } {
  const err = (rawError || "").trim();

  if (err.includes("40145") || err.toLowerCase().includes("nombre") || err.toLowerCase().includes("razon social") || err.toLowerCase().includes("razón social")) {
    return {
      title: "Razón Social no coincide con el SAT",
      explanation: "El nombre o razón social del cliente no coincide exactamente con su Constancia de Situación Fiscal.",
      tip: "En CFDI 4.0, el nombre debe escribirse en MAYÚSCULAS y SIN el régimen de capital (ejemplo: escribe 'TACOS ROY' en lugar de 'TACOS ROY SA DE CV')."
    };
  }

  if (err.includes("40144") || err.toLowerCase().includes("domicilio") || err.toLowerCase().includes("postal") || err.toLowerCase().includes("cp") || err.toLowerCase().includes("c.p.")) {
    return {
      title: "Código Postal Fiscal Incorrecto",
      explanation: "El Código Postal (C.P.) capturado no coincide con el domicilio fiscal registrado ante el SAT para este RFC.",
      tip: "Verifique el C.P. de 5 dígitos exactamente como aparece en la Constancia de Situación Fiscal reciente."
    };
  }

  if (err.includes("40146") || err.toLowerCase().includes("regimen") || err.toLowerCase().includes("régimen")) {
    return {
      title: "Régimen Fiscal incompatible",
      explanation: "La clave de régimen fiscal seleccionada no corresponde al tipo de persona o actividad del cliente.",
      tip: "Revise si el cliente es Persona Física (ej. 612, 626) o Persona Moral (ej. 601, 626) y confirme en su constancia."
    };
  }

  if (err.includes("301") || err.toLowerCase().includes("rfc") || err.toLowerCase().includes("no se encuentra en el padron") || err.toLowerCase().includes("padrón")) {
    return {
      title: "RFC no registrado en el SAT",
      explanation: "El RFC no fue encontrado en la lista oficial de contribuyentes del SAT (LCO).",
      tip: "Verifique que el RFC de 12 (moral) o 13 (física) caracteres esté bien escrito sin espacios ni guiones."
    };
  }

  if (err.toLowerCase().includes("firebase") || err.toLowerCase().includes("hosting") || err.toLowerCase().includes("html") || err.toLowerCase().includes("sistema gastron")) {
    return {
      title: "Servidor PHP no configurado o en Hosting Estático",
      explanation: "La URL de Facturación Web API configurada apunta a Firebase Hosting (que solo aloja la app web) y no a un servidor web que ejecute PHP.",
      tip: "Configura en la Sucursal/Inquilino la URL completa hacia tu hosting PHP (ej. https://tudominio.com/api_facturar.php) o deja el campo vacío para operar en modo 'Registro y Solicitud de Factura'."
    };
  }

  return {
    title: "Rechazo de Timbrado SAT / PAC",
    explanation: err || "El servicio del SAT rechazó la solicitud de timbrado.",
    tip: "Revise los datos fiscales o descarte el borrador para liberar el folio."
  };
}

/**
 * Safe JSON parser that catches HTML, PHP warnings/notices, or non-JSON payloads
 * and extracts clean JSON or provides human-readable server error messages.
 */
async function safeParseJsonResponse<T = any>(
  res: Response,
  context: string = "facturación"
): Promise<{ ok: boolean; data?: T; error?: string }> {
  let text = "";
  try {
    text = await res.text();
  } catch (err: any) {
    return { ok: false, error: `No se pudo leer la respuesta del servidor (${err.message})` };
  }

  if (!text || !text.trim()) {
    return { ok: false, error: `El servidor de ${context} devolvió una respuesta vacía (HTTP ${res.status}).` };
  }

  // Remove UTF-8 BOM if present
  const cleanText = text.replace(/^\uFEFF/, "").trim();

  // 1. Try direct JSON parse
  try {
    const parsed = JSON.parse(cleanText);
    return { ok: true, data: parsed };
  } catch (initialErr) {
    // 2. Try to isolate embedded JSON object or array if PHP outputted warnings/echoes before/after
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const potentialJson = cleanText.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(potentialJson);
        return { ok: true, data: parsed };
      } catch (e) {}
    }

    const firstBracket = cleanText.indexOf("[");
    const lastBracket = cleanText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        const potentialJson = cleanText.substring(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(potentialJson);
        return { ok: true, data: parsed };
      } catch (e) {}
    }

    // 3. If HTML/PHP error was returned, extract human-readable text
    console.error(`[Invoicing API - ${context}] Respuesta no-JSON del servidor:`, cleanText);
    if (cleanText.includes("<") && cleanText.includes(">")) {
      if (
        cleanText.includes("COCINET - Sistema Gastronómico") ||
        cleanText.includes("<div id=\"root\"></div>") ||
        cleanText.includes("vite-plugin-pwa") ||
        cleanText.includes("/assets/index-")
      ) {
        return {
          ok: false,
          error: "La URL de Facturación configurada apunta al hosting de Firebase (que devuelve la app web) en lugar de a un servidor PHP ejecutable (ej: https://tudominio.com/api_facturar.php)."
        };
      }

      const stripped = cleanText
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const shortMsg = stripped.length > 250 ? stripped.slice(0, 250) + "..." : stripped;
      return {
        ok: false,
        error: shortMsg
          ? `Mensaje del servidor PHP: "${shortMsg}"`
          : `El servidor de facturación devolvió una página HTML en lugar de JSON (HTTP ${res.status}).`
      };
    }

    const shortText = cleanText.length > 200 ? cleanText.slice(0, 200) + "..." : cleanText;
    return {
      ok: false,
      error: `Respuesta del servidor no válida (${context}): ${shortText}`
    };
  }
}

/**
 * Accion: 'guardar_cliente' - Guarda/actualiza cliente en BD MySQL y registra pre-factura sin timbrar en MySQL si se envía ticket y total.
 */
export async function guardarClienteFacturacion(
  apiUrl: string,
  params: SaveCustomerFiscalParams
): Promise<SaveCustomerFiscalResponse> {
  const url = apiUrl || DEFAULT_INVOICING_API_URL;
  if (!url) return { ok: false, error: "No hay URL de facturación disponible." };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const payload = {
      accion: "guardar_cliente",
      action: "guardar_cliente",
      ...params,
      razonSocial: params.nombre,
      codigoPostal: params.cp,
      regimenFiscal: params.regimen,
      usoCfdi: params.uso_cfdi,
      email: params.correo,
      phone: params.telefono,
      direccionFiscal: params.direccion
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });

    clearTimeout(timeoutId);

    const parseResult = await safeParseJsonResponse<SaveCustomerFiscalResponse>(res, "guardado de cliente en MySQL");
    if (!parseResult.ok || !parseResult.data) {
      return { ok: false, error: parseResult.error || `Error al guardar en MySQL (HTTP ${res.status})` };
    }

    return parseResult.data;
  } catch (err: any) {
    console.error("Error al guardar cliente en API MySQL:", err);
    return { ok: false, error: err.message || "Error al conectar con la base de datos MySQL." };
  }
}

/**
 * Accion: 'buscar_cliente' - Consulta cliente por RFC o Nombre en el servidor PHP.
 */
export async function buscarClienteFacturacion(
  apiUrl: string,
  query: string
): Promise<{ ok: boolean; clientes?: any[]; error?: string }> {
  if (!apiUrl || !query || query.trim().length < 6) {
    return { ok: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        accion: "buscar_cliente",
        action: "buscar_cliente",
        query: query.trim(),
        rfc: query.trim().toUpperCase(),
        nombre: query.trim()
      })
    });

    clearTimeout(timeoutId);

    const parsed = await safeParseJsonResponse<{ ok: boolean; clientes?: any[]; error?: string }>(res, "búsqueda de cliente");
    if (!parsed.ok || !parsed.data) {
      return { ok: false, error: parsed.error };
    }

    return parsed.data;
  } catch (err: any) {
    return { ok: false };
  }
}

/**
 * Accion: 'preparar' - Genera borrador en BD y PDF preliminar.
 */
export async function prepararBorradorFactura(
  apiUrl: string,
  params: PrepareInvoiceParams
): Promise<PrepareInvoiceResponse> {
  if (!apiUrl) {
    return { ok: false, error: "No se ha configurado la URL de Facturación Web API en este inquilino/sucursal." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const payload = {
      accion: "preparar",
      action: "preparar",
      ticket_id: params.ticket_id,
      ticket: params.ticket_id,
      folio: params.ticket_id,
      total: params.total,
      subtotal: params.total ? Number((params.total / 1.16).toFixed(2)) : 0,
      iva: params.total ? Number((params.total - (params.total / 1.16)).toFixed(2)) : 0,
      rfc: params.rfc,
      nombre: params.nombre,
      razon_social: params.nombre,
      razonSocial: params.nombre,
      cp: params.cp,
      codigo_postal: params.cp,
      codigoPostal: params.cp,
      regimen: params.regimen,
      regimen_fiscal: params.regimen,
      regimenFiscal: params.regimen,
      uso_cfdi: params.uso_cfdi,
      usoCfdi: params.uso_cfdi,
      forma_pago: params.forma_pago,
      formaPago: params.forma_pago,
      metodo_pago: params.metodo_pago,
      metodoPago: params.metodo_pago,
      correo: params.correo,
      email: params.correo,
      concepto: params.concepto,
      descripcion: params.concepto,
      ...params
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });

    clearTimeout(timeoutId);

    const parseResult = await safeParseJsonResponse<PrepareInvoiceResponse>(res, "pre-factura");
    if (!parseResult.ok || !parseResult.data) {
      return { ok: false, error: parseResult.error || `Error en el servidor de facturación (HTTP ${res.status})` };
    }

    return parseResult.data;
  } catch (err: any) {
    console.error("Error al preparar borrador de factura:", err);
    if (err.name === "AbortError") {
      return { ok: false, error: "Tiempo de espera agotado al conectar con el servidor de facturación (15s)." };
    }
    return { ok: false, error: err.message || "Error al conectar con la API de facturación." };
  }
}

/**
 * Accion: 'timbrar' - Sella XML y timbra ante Finkok/SAT.
 */
export async function timbrarFactura(
  apiUrl: string,
  params: StampInvoiceParams
): Promise<StampInvoiceResponse> {
  if (!apiUrl) {
    return { ok: false, error: "No se ha configurado la URL de Facturación Web API en este inquilino/sucursal." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        accion: "timbrar",
        action: "timbrar",
        ...params
      })
    });

    clearTimeout(timeoutId);

    const parseResult = await safeParseJsonResponse<StampInvoiceResponse>(res, "timbrado");
    if (!parseResult.ok || !parseResult.data) {
      return { ok: false, error: parseResult.error || `Error en el servidor de timbrado (HTTP ${res.status})` };
    }

    return parseResult.data;
  } catch (err: any) {
    console.error("Error al timbrar factura:", err);
    if (err.name === "AbortError") {
      return { ok: false, error: "Tiempo de espera agotado al timbrar ante el PAC / SAT (20s)." };
    }
    return { ok: false, error: err.message || "Error al conectar con el servicio de timbrado." };
  }
}

/**
 * Accion: 'eliminar_no_timbrada' - Libera el folio borrador en la BD.
 */
export async function descartarFactura(
  apiUrl: string,
  params: DiscardInvoiceParams
): Promise<DiscardInvoiceResponse> {
  if (!apiUrl) {
    return { ok: false, error: "No se ha configurado la URL de Facturación Web API en este inquilino/sucursal." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        accion: "eliminar_no_timbrada",
        action: "eliminar_no_timbrada",
        ...params
      })
    });

    clearTimeout(timeoutId);

    const parseResult = await safeParseJsonResponse<DiscardInvoiceResponse>(res, "descarte de borrador");
    if (!parseResult.ok || !parseResult.data) {
      return { ok: false, error: parseResult.error || `Error al descartar borrador (HTTP ${res.status})` };
    }

    return parseResult.data;
  } catch (err: any) {
    console.error("Error al descartar borrador:", err);
    return { ok: false, error: err.message || "Error al conectar con la API de facturación." };
  }
}
