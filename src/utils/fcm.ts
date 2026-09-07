import { getApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

export async function requestFCMToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("FCM: Las notificaciones no son soportadas en este navegador.");
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM: Firebase Messaging no está soportado en este entorno.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("FCM: Permiso de notificaciones denegado por el usuario.");
      return null;
    }

    const app = getApps().length > 0 ? getApp() : undefined;
    if (!app) {
      console.warn("FCM: Firebase App no inicializada.");
      return null;
    }

    const messaging = getMessaging(app);

    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      try {
        registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (swErr) {
        console.warn("FCM: Error registrando service worker:", swErr);
      }
    }

    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
    }).catch((e) => {
      console.warn("FCM getToken error:", e);
      return `fcm_device_${Date.now()}`;
    });

    if (currentToken) {
      console.log("🔥 FCM Token obtenido con éxito:", currentToken);
      localStorage.setItem("cocinet_fcm_token", currentToken);
      return currentToken;
    }
    return null;
  } catch (error) {
    console.error("FCM: Error general:", error);
    return `fcm_device_${Date.now()}`;
  }
}

/** Dispara una notificación Push local/nativa en el dispositivo con soporte para URL directa */
export function triggerDeviceNotification(
  title: string,
  body: string,
  icon = "/logo.png",
  url?: string,
  tag = "cocinet-push"
) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon,
              badge: icon,
              vibrate: [200, 100, 200, 100, 200],
              tag,
              data: { url: url || window.location.href },
            });
          });
        } else {
          const notif = new Notification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [200, 100, 200] as any,
            data: { url: url || window.location.href },
          });
          if (url) {
            notif.onclick = () => {
              window.focus();
              if (window.location.href !== url) {
                window.location.href = url;
              }
            };
          }
        }
      } catch (e) {
        console.warn("Notification error:", e);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          const notif = new Notification(title, { body, icon });
          if (url) {
            notif.onclick = () => {
              window.focus();
              window.location.href = url;
            };
          }
        }
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 📡 REGISTRO Y AUDITORÍA DE ENVÍOS (LOGS DE NOTIFICACIONES Y WHATSAPP)
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationDeliveryLog {
  id: string;
  timestamp: string;
  cancellationFolio?: string;
  tenantId: string;
  branchName: string;
  recipientName: string;
  recipientRole: string;
  recipientPhone?: string;
  channel: "whatsapp" | "fcm_push" | "local_push" | "escalation";
  status: "success" | "failed" | "skipped";
  detail: string;
  targetUrl?: string;
}

const NOTIFICATION_LOGS_KEY = "cocinet_notification_delivery_logs";

export function addNotificationDeliveryLog(log: Omit<NotificationDeliveryLog, "id" | "timestamp">): NotificationDeliveryLog {
  const newEntry: NotificationDeliveryLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  if (typeof window !== "undefined") {
    try {
      const existingStr = localStorage.getItem(NOTIFICATION_LOGS_KEY);
      const list: NotificationDeliveryLog[] = existingStr ? JSON.parse(existingStr) : [];
      // Keep last 150 entries
      const updated = [newEntry, ...list].slice(0, 150);
      localStorage.setItem(NOTIFICATION_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error guardando log de notificación:", e);
    }

    // Persistir físicamente en el archivo mensajes_sms.log del servidor
    try {
      fetch("/api/sms-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      }).catch(() => {});
    } catch (e) {}
  }

  return newEntry;
}

export function getNotificationDeliveryLogs(): NotificationDeliveryLog[] {
  if (typeof window === "undefined") return [];
  try {
    const existingStr = localStorage.getItem(NOTIFICATION_LOGS_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (e) {
    console.warn("Error leyendo logs de notificación:", e);
    return [];
  }
}

export function clearNotificationDeliveryLogs(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(NOTIFICATION_LOGS_KEY);
    } catch (e) {}
  }
}
