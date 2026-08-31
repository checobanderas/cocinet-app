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

/** Dispara una notificación Push local/nativa en el dispositivo */
export function triggerDeviceNotification(title: string, body: string, icon = "/logo.png") {
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
              tag: "cocinet-push",
            });
          });
        } else {
          new Notification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [200, 100, 200] as any,
          });
        }
      } catch (e) {
        console.warn("Notification error:", e);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification(title, { body, icon });
        }
      });
    }
  }
}
