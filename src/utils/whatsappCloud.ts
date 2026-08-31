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

/** Credenciales globales preconfiguradas para todos los tenants */
const GLOBAL_DEFAULT_INSTANCE = "instance190130";
const GLOBAL_DEFAULT_TOKEN = "ayi9d3764t8h8t7s";

/** Obtiene la configuración activa de WhatsApp guardada o la global por defecto */
export function getWhatsAppCloudConfig(): WhatsAppGatewayConfig {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(DEFAULT_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          provider: parsed.provider || "ultramsg",
          instanceId: parsed.instanceId || GLOBAL_DEFAULT_INSTANCE,
          token: parsed.token || GLOBAL_DEFAULT_TOKEN,
          phoneNumberId: parsed.phoneNumberId || "",
          accessToken: parsed.accessToken || "",
          isEnabled: true,
        };
      }
    } catch (e) {
      console.warn("No se pudo leer la configuración de WhatsApp:", e);
    }
  }

  return {
    provider: "ultramsg",
    instanceId: GLOBAL_DEFAULT_INSTANCE,
    token: GLOBAL_DEFAULT_TOKEN,
    phoneNumberId: "",
    accessToken: "",
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

/**
 * Envía un mensaje de texto formateado 100% silencioso a través de UltraMsg o Meta Cloud API.
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

  // 1. Envío mediante UltraMsg Gateway (QR)
  if (config.provider === "ultramsg" || (!config.provider && config.instanceId)) {
    if (!config.instanceId || !config.token) {
      return {
        success: false,
        error: "UltraMsg no está configurado (Falta Instance ID o Token).",
      };
    }

    const cleanInstance = config.instanceId.trim();
    const endpoint = `https://api.ultramsg.com/${cleanInstance}/messages/chat`;

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append("token", config.token.trim());
      bodyParams.append("to", cleanPhone);
      bodyParams.append("body", messageText);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });

      const data = await response.json();

      if (data.sent === "true" || data.sent === true || data.id) {
        console.log("✅ WhatsApp enviado silenciosamente con UltraMsg. ID:", data.id);
        return { success: true, messageId: String(data.id) };
      } else {
        const err = data.error || data.message || "Error al enviar con UltraMsg";
        console.error("❌ Error de UltraMsg:", data);
        return { success: false, error: String(err) };
      }
    } catch (err: any) {
      console.error("❌ Error de red con UltraMsg:", err);
      return { success: false, error: err.message || "Error de conexión con UltraMsg." };
    }
  }

  // 2. Envío mediante Meta Cloud API Oficial
  if (config.provider === "meta") {
    if (!config.phoneNumberId || !config.accessToken) {
      return {
        success: false,
        error: "WhatsApp Cloud API de Meta no está configurada (Falta Phone Number ID o Access Token).",
      };
    }

    const endpoint = `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || "Error en la API de Meta";
        console.error("❌ Error de Meta WhatsApp:", data);
        return { success: false, error: errorMsg };
      }

      const messageId = data?.messages?.[0]?.id;
      console.log("✅ WhatsApp enviado silenciosamente con Meta. ID:", messageId);
      return { success: true, messageId };
    } catch (err: any) {
      console.error("❌ Error de red con Meta:", err);
      return { success: false, error: err.message || "Error de conexión con Meta." };
    }
  }

  return { success: false, error: "Proveedor de WhatsApp no configurado." };
}
