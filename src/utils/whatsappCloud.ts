/**
 * Módulo de Integración con WhatsApp Cloud API Oficial de Meta (Facebook Developers)
 * Permite enviar mensajes de WhatsApp 100% silenciosos en segundo plano desde el servidor/cliente.
 */

import { formatMexicoPhone } from "./appHelpers";

export interface WhatsAppCloudConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId?: string;
  isEnabled?: boolean;
}

const DEFAULT_CONFIG_KEY = "cocinet_meta_whatsapp_config";

/** Obtiene la configuración activa de Meta WhatsApp guardada localmente o en el tenant */
export function getWhatsAppCloudConfig(): WhatsAppCloudConfig {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(DEFAULT_CONFIG_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("No se pudo leer la configuración de WhatsApp Cloud:", e);
    }
  }

  return {
    phoneNumberId: "",
    accessToken: "",
    businessAccountId: "",
    isEnabled: false,
  };
}

/** Guarda la configuración de Meta WhatsApp */
export function saveWhatsAppCloudConfig(config: WhatsAppCloudConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEFAULT_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Error guardando configuración de WhatsApp Cloud:", e);
    }
  }
}

/**
 * Envía un mensaje de texto formateado 100% silencioso a través de la WhatsApp Cloud API de Meta.
 * @param toPhone Número de teléfono del destinatario (10 dígitos o con lada)
 * @param messageText Texto del mensaje (admite emojis, saltos de línea y formato *negrita*)
 * @param customConfig Configuración opcional personalizada
 */
export async function sendSilentWhatsAppMessage(
  toPhone: string,
  messageText: string,
  customConfig?: Partial<WhatsAppCloudConfig>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = { ...getWhatsAppCloudConfig(), ...customConfig };

  const cleanPhone = formatMexicoPhone(toPhone);
  if (!cleanPhone) {
    return { success: false, error: "Número de teléfono no válido." };
  }

  if (!config.phoneNumberId || !config.accessToken) {
    return {
      success: false,
      error: "WhatsApp Cloud API no está configurada aún (Falta Phone Number ID o Access Token).",
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
      const errorMsg = data?.error?.message || "Error desconocido en la API de Meta";
      console.error("❌ Error de Meta WhatsApp Cloud API:", data);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    console.log("✅ WhatsApp enviado silenciosamente con éxito. ID:", messageId);
    return { success: true, messageId };
  } catch (err: any) {
    console.error("❌ Error de red al conectar con Meta:", err);
    return { success: false, error: err.message || "Error de conexión con Meta." };
  }
}
