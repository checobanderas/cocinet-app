/**
 * Módulo de Integración con WhatsApp API Oficial (Meta Cloud API & Pasarela UltraMsg Gateway)
 * Permite enviar mensajes de WhatsApp 100% silenciosos en segundo plano desde el servidor/cliente.
 */

import { formatMexicoPhone } from "./appHelpers";

export type WhatsAppProvider = "ultramsg" | "meta";

export interface WhatsAppGatewayConfig {
  provider: WhatsAppProvider;
  // UltraMsg Gateway (Recomendado por QR)
  instanceId?: string;
  token?: string;
  // Meta Cloud API Oficial
  phoneNumberId?: string;
  accessToken?: string;
  isEnabled?: boolean;
}

/** Clave de almacenamiento en LocalStorage */
const DEFAULT_CONFIG_KEY = "cocinet_whatsapp_cloud_config";

/** Credenciales oficiales de Meta Cloud API */
export const GLOBAL_DEFAULT_PHONE_NUMBER_ID = "1333624529829399";
export const GLOBAL_DEFAULT_ACCESS_TOKEN = "EAAWMw7qndssBSerl6nOEugdvr44OCrAikaLe9NafpbiPbB0jobmxZCgo5CRREWlhV1FhO7GFvHDsqsTuYrwV46OfjZAQIjAaqUQqq8MCZBrv3sPxwk4kZC509TeKaxMyI8B01d4BTn7fiK3VtrinM9zgrKmP47nLQEjSZAFNycSzeh96h3qXhzvieAqUDVQZDZD";

/** Obtiene la configuración activa de WhatsApp guardada o la global por defecto */
export function getWhatsAppCloudConfig(): WhatsAppGatewayConfig {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(DEFAULT_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isUltraValid = parsed.provider === "ultramsg" && parsed.instanceId && parsed.instanceId !== "instance190849" && parsed.token && parsed.token !== "bkhjvsg23hizl211";
        const provider: WhatsAppProvider = isUltraValid ? "ultramsg" : "meta";

        return {
          provider,
          instanceId: parsed.instanceId || "",
          token: parsed.token || "",
          phoneNumberId: parsed.phoneNumberId || GLOBAL_DEFAULT_PHONE_NUMBER_ID,
          accessToken: parsed.accessToken || GLOBAL_DEFAULT_ACCESS_TOKEN,
          isEnabled: true,
        };
      }
    } catch (e) {
      console.warn("No se pudo leer la configuración de WhatsApp:", e);
    }
  }

  return {
    provider: "meta",
    instanceId: "",
    token: "",
    phoneNumberId: GLOBAL_DEFAULT_PHONE_NUMBER_ID,
    accessToken: GLOBAL_DEFAULT_ACCESS_TOKEN,
    isEnabled: true,
  };
}

/** Guarda la configuración de WhatsApp */
export function saveWhatsAppCloudConfig(config: WhatsAppGatewayConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEFAULT_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Error guardando configuración de WhatsApp:", e);
    }
  }
}

/** Helper para envío directo a Meta Cloud API */
async function sendViaMetaCloudDirect(
  phone: string,
  text: string,
  phoneNumberId?: string,
  accessToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const effectivePhoneId = phoneNumberId || GLOBAL_DEFAULT_PHONE_NUMBER_ID;
  const effectiveToken = accessToken || GLOBAL_DEFAULT_ACCESS_TOKEN;
  const endpoint = `https://graph.facebook.com/v19.0/${effectivePhoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "text",
    text: {
      preview_url: true,
      body: text,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.messages?.[0]?.id) {
      console.log("✅ WhatsApp enviado silenciosamente con Meta Cloud API. ID:", data.messages[0].id);
      return { success: true, messageId: data.messages[0].id };
    }

    const errorMsg = data?.error?.message || "Error en la API de Meta";
    console.warn("❌ Error de Meta WhatsApp:", data);
    return { success: false, error: errorMsg };
  } catch (err: any) {
    console.warn("❌ Error de red directo con Meta:", err);
    return { success: false, error: err.message || "Error de conexión con Meta." };
  }
}

/**
 * Envía un mensaje de texto formateado 100% silencioso a través de Meta Cloud API (o UltraMsg si está activo).
 * @param toPhone Número de teléfono del destinatario (10 dígitos o con lada)
 * @param messageText Texto del mensaje (admite emojis, saltos de línea y formato *negrita*)
 * @param customConfig Configuración opcional personalizada
 */
export async function sendSilentWhatsAppMessage(
  toPhone: string,
  messageText: string,
  customConfig?: Partial<WhatsAppGatewayConfig>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = { ...getWhatsAppCloudConfig(), ...customConfig };

  const cleanPhone = formatMexicoPhone(toPhone);
  if (!cleanPhone) {
    return { success: false, error: "Número de teléfono no válido." };
  }

  // 1. Intentar envío a través del Proxy Backend (/api/send-whatsapp)
  try {
    const proxyResponse = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: cleanPhone,
        message: messageText,
        provider: config.provider,
        instanceId: config.instanceId,
        token: config.token,
        phoneNumberId: config.phoneNumberId || GLOBAL_DEFAULT_PHONE_NUMBER_ID,
        accessToken: config.accessToken || GLOBAL_DEFAULT_ACCESS_TOKEN,
      }),
    });

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      if (proxyData.success) {
        console.log("✅ WhatsApp enviado silenciosamente vía Backend Proxy:", proxyData);
        return { success: true, messageId: proxyData.messageId };
      } else {
        console.warn("⚠️ Proxy Backend retornó fallo:", proxyData.error);
        // Si el proveedor que falló era UltraMsg, intentar fallback automático a Meta Cloud API
        if (config.provider === "ultramsg") {
          console.log("🔄 Reintentando con Meta Cloud API oficial...");
          const metaResult = await sendViaMetaCloudDirect(cleanPhone, messageText, config.phoneNumberId, config.accessToken);
          if (metaResult.success) return metaResult;
        }
        return { success: false, error: proxyData.error || "Fallo en pasarela de WhatsApp" };
      }
    }
  } catch (proxyErr) {
    console.warn("Proxy backend /api/send-whatsapp no disponible, intentando directo:", proxyErr);
  }

  // 2. Envío directo como fallback (UltraMsg)
  if (config.provider === "ultramsg" && config.instanceId && config.token && config.instanceId !== "instance190849") {
    const cleanInstance = config.instanceId.trim();
    const endpoint = `https://api.ultramsg.com/${cleanInstance}/messages/chat`;

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append("token", config.token.trim());
      bodyParams.append("to", cleanPhone);
      bodyParams.append("body", messageText);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.sent === "true" || data.sent === true || data.id)) {
        console.log("✅ WhatsApp enviado silenciosamente con UltraMsg. ID:", data.id);
        return { success: true, messageId: String(data.id) };
      } else {
        console.warn("⚠️ UltraMsg falló directo, cambiando a Meta Cloud API...");
      }
    } catch (err: any) {
      console.warn("⚠️ UltraMsg directo no disponible, reintentando con Meta...");
    }
  }

  // 3. Fallback / Envío directo mediante Meta Cloud API Oficial
  return await sendViaMetaCloudDirect(
    cleanPhone,
    messageText,
    config.phoneNumberId || GLOBAL_DEFAULT_PHONE_NUMBER_ID,
    config.accessToken || GLOBAL_DEFAULT_ACCESS_TOKEN
  );
}

/**
 * Envía mensaje de confirmación al cliente cuando su pedido a domicilio es registrado.
 */
export async function sendDeliveryOrderConfirmationWhatsApp(params: {
  phone: string;
  clientName: string;
  branchName: string;
  folio: number | string;
  items: { name: string; quantity: number; notes?: string }[];
  address: string;
  notes?: string;
  total?: number;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { phone, clientName, branchName, folio, items, address, notes, total } = params;
  
  const itemsList = items.map(i => `• *${i.quantity}x* ${i.name}${i.notes ? ` _(${i.notes})_` : ''}`).join('\n');
  
  const text = 
`🌮 *¡HOLA, ${clientName.toUpperCase()}!*
Tu pedido para *Servicio a Domicilio* en *${branchName}* ha sido registrado con éxito.

📋 *Folio de Pedido:* #${folio}
📍 *Dirección de Entrega:* ${address}
${notes ? `📝 *Referencias:* ${notes}\n` : ''}${total ? `💰 *Total Estimado:* $${total.toFixed(2)}\n` : ''}
🛍️ *Detalle de tu Pedido:*
${itemsList}

⏱️ *Estado:* 🍳 En preparación en cocina.
¡Te avisaremos en cuanto el repartidor vaya en camino! 🛵`;

  return await sendSilentWhatsAppMessage(phone, text);
}

/**
 * Envía mensaje al cliente cuando su pedido ya va en camino hacia su domicilio.
 */
export async function sendDeliveryOnTheWayWhatsApp(params: {
  phone: string;
  clientName: string;
  branchName: string;
  address: string;
  notes?: string;
  total?: number;
  paymentMethod?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { phone, clientName, branchName, address, notes, total, paymentMethod } = params;
  
  const text = 
`🛵 *¡TU PEDIDO VA EN CAMINO!*
¡Hola, *${clientName.toUpperCase()}*! Tu orden de *${branchName}* ya salió con nuestro repartidor.

📍 *Dirección:* ${address}
${notes ? `📝 *Referencias:* ${notes}\n` : ''}${total ? `💵 *Total a Cobrar:* $${total.toFixed(2)} ${paymentMethod ? `(${paymentMethod.toUpperCase()})` : ''}\n` : ''}
⏱️ *¡En pocos minutos estará en tu puerta!*
¡Buen provecho y gracias por tu preferencia! 🎉`;

  return await sendSilentWhatsAppMessage(phone, text);
}

/**
 * Genera el mensaje y URL de WhatsApp para enviar la ficha completa del pedido al Repartidor.
 */
export function generateDeliveryDriverWhatsAppUrl(params: {
  driverPhone?: string;
  clientName: string;
  clientPhone: string;
  branchName: string;
  address: string;
  notes?: string;
  gpsUrl?: string;
  items?: { name: string; quantity: number; notes?: string }[];
  total?: number;
  isPaid?: boolean;
  paymentMethod?: string;
  folio?: number | string;
}): string {
  const { driverPhone, clientName, clientPhone, branchName, address, notes, gpsUrl, items, total, isPaid, paymentMethod, folio } = params;

  let itemsText = "";
  if (items && items.length > 0) {
    itemsText = `\n🛍️ *Productos:*\n` + items.map(i => `• ${i.quantity}x ${i.name}`).join('\n') + `\n`;
  }

  const effectiveGps = gpsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const message = 
`🛵 *FICHA DE ENTREGA A DOMICILIO*
🏢 *Sucursal:* ${branchName}
${folio ? `📋 *Folio:* #${folio}\n` : ''}
👤 *Cliente:* ${clientName}
📞 *Teléfono Cliente:* ${clientPhone}
📍 *Dirección:* ${address}
${notes ? `📝 *Referencias:* ${notes}\n` : ''}${itemsText}
💰 *Total:* ${total ? `$${total.toFixed(2)}` : 'Por liquidar'} | ${isPaid ? '✅ *PAGADO PREVIAMENTE*' : `💵 *COBRAR EN DOMICILIO (${(paymentMethod || 'Efectivo').toUpperCase()})*`}

🗺️ *Navegación GPS / Google Maps:*
${effectiveGps}`;

  const cleanDriver = driverPhone ? formatMexicoPhone(driverPhone) : "";
  const base = cleanDriver ? `https://api.whatsapp.com/send?phone=${cleanDriver}&text=` : `https://api.whatsapp.com/send?text=`;
  return `${base}${encodeURIComponent(message)}`;
}

/**
 * Genera la URL para el Portal de Captura de Datos Fiscales del Cliente.
 */
export function generateInvoicePortalUrl(params: {
  phone?: string;
  tenantId?: string;
  folio?: number | string;
  rfc?: string;
}): string {
  const origin = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://cocinet-prueba.web.app";

  const searchParams = new URLSearchParams();
  searchParams.set("action", "facturacion");
  if (params.phone) {
    const cleanPhone = params.phone.replace(/\D/g, "").slice(-10);
    searchParams.set("phone", cleanPhone);
  }
  if (params.tenantId) {
    searchParams.set("tenant", params.tenantId);
  }
  if (params.folio) {
    searchParams.set("folio", String(params.folio));
  }
  if (params.rfc) {
    searchParams.set("rfc", params.rfc.toUpperCase().trim());
  }

  return `${origin}/?${searchParams.toString()}`;
}

/**
 * Envía mensaje de solicitud de datos fiscales por WhatsApp con enlace al formulario de auto-facturación.
 */
export async function sendInvoiceDataRequestWhatsApp(params: {
  phone: string;
  clientName?: string;
  branchName: string;
  folio?: number | string;
  total?: number;
  itemsText?: string;
  portalUrl?: string;
  tenantId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { phone, clientName, branchName, folio, total, itemsText, portalUrl, tenantId } = params;

  const effectiveUrl = portalUrl || generateInvoicePortalUrl({ phone, tenantId, folio });

  const greeting = clientName ? `¡Hola, *${clientName.toUpperCase()}*! 👋` : "¡Hola! 👋";

  const text = 
`🌮 *SOLICITUD DE FACTURA ELECTRÓNICA*
🏢 *${branchName}*

${greeting}
Aquí tienes el comprobante de tu consumo:
${folio ? `🧾 *Folio:* #${folio}\n` : ''}${total ? `💰 *Total:* $${Number(total).toFixed(2)}\n` : ''}${itemsText ? `\n🛒 *Detalle del Consumo:*\n${itemsText}\n` : ''}
📄 *Para generar tu factura, haz clic en el siguiente enlace:*

${effectiveUrl}

💡 *Si ya has facturado con nosotros, al ingresar tu RFC o celular tus datos se llenarán automáticamente.*
En cuanto completes tus datos, emitiremos tu factura y te llegará a tu correo. ✉️✨

¡Muchas gracias por tu preferencia! 😊🙏`;

  return await sendSilentWhatsAppMessage(phone, text);
}

