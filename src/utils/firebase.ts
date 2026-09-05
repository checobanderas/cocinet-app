import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  setLogLevel
} from "firebase/firestore";

// Silenciar warnings/errores de conexión internos de Firebase en consola
try {
  setLogLevel("silent");
} catch (e) {
  console.warn("Failed to set log level to silent:", e);
}

// Configuración por defecto del sistema
const defaultFirebaseConfig = {
  apiKey: "AIzaSyA-pj8EA8Pl7CVM9P-L4lOLhzxadQVQujI",
  authDomain: "cocinet-app.firebaseapp.com",
  projectId: "cocinet-app",
  storageBucket: "cocinet-app.firebasestorage.app",
  messagingSenderId: "315374858436",
  appId: "1:315374858436:web:c432699c575403bfe91991",
  measurementId: "G-GX3HLJPQHW"
};

const defaultDbId = "";

// Intentar cargar configuración personalizada desde localStorage en el navegador
let activeConfig = defaultFirebaseConfig;
let activeDbId = defaultDbId;
let isCustomActive = false;

if (typeof window !== "undefined") {
  try {
    const savedConfig = localStorage.getItem("custom_firebase_config");
    const savedDbId = localStorage.getItem("custom_firebase_db_id");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed && parsed.projectId && parsed.apiKey) {
        activeConfig = parsed;
        isCustomActive = true;
        console.log("🔥 Utilizando configuración de Firebase cargada desde localStorage:", parsed.projectId);
      }
    }
    if (savedDbId !== null) {
      activeDbId = savedDbId;
      console.log("🔥 Utilizando Firestore Database ID cargado desde localStorage:", activeDbId || "(default)");
    }
  } catch (e) {
    console.warn("No se pudo leer la configuración de Firebase de localStorage:", e);
  }
}

// Inicializar la app correspondiente. Usamos un nombre específico si no es la configuración por defecto para evitar colisiones.
let app;
const appName = isCustomActive ? "custom_app" : "[DEFAULT]";

if (appName === "[DEFAULT]") {
  app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
} else {
  // Inicializamos una app secundaria para la configuración personalizada
  const existingApps = getApps();
  const customApp = existingApps.find(a => a.name === appName);
  app = customApp || initializeApp(activeConfig, appName);
}

let firestoreDb;

const cleanDbId = (activeDbId === "(default)" || activeDbId === "default" || !activeDbId) ? undefined : activeDbId;

try {
  // Inicializamos Firestore con long-polling y caché persistente multitestaña (IndexedDB) con tamaño ilimitado (CACHE_SIZE_UNLIMITED)
  // Esto previene el error QuotaExceededError y permite que la aplicación opere de forma 100% offline.
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: 41943040 // 40 MB default instead of UNLIMITED to avoid IndexedDB crashes
    })
  }, cleanDbId);
} catch (error: any) {
  console.warn("Firestore failed configuration with persistence cache. Retrying with long polling only:", error);
  try {
    // Si la persistencia falla (ej: IndexedDB bloqueado en iframe sandbox), inicializamos solo con long-polling
    firestoreDb = initializeFirestore(app, {
      experimentalForceLongPolling: true
    }, cleanDbId);
  } catch (innerError: any) {
    console.warn("Firestore initializeFirestore failed twice. Using getFirestore as final resort:", innerError);
    firestoreDb = getFirestore(app, cleanDbId);
  }
}

export const db = firestoreDb;

export async function purgeLocalFirestoreCache() {
  if (typeof window === "undefined" || !window.indexedDB) return;
  console.warn("🧹 Purgando bases de datos IndexedDB locales de Firestore...");
  if (window.indexedDB.databases) {
    try {
      const dbs = await window.indexedDB.databases();
      dbs.forEach((d) => {
        if (d.name && (d.name.includes("firestore") || d.name.includes("[DEFAULT]"))) {
          window.indexedDB.deleteDatabase(d.name);
        }
      });
    } catch (e) {
      console.warn("Error al enumerar bases de datos IndexedDB:", e);
    }
  }
  const fallbacks = [
    "firestore/[DEFAULT]/cocinet-app/(default)",
    "firestore/[DEFAULT]/cocinet-app/(default)/main",
    "firestore/[DEFAULT]/cocinet-app/",
    "firestore/custom_app/cocinet-app/(default)",
    "firestore",
    "[DEFAULT]main",
    "[DEFAULT]"
  ];
  fallbacks.forEach((name) => {
    try { window.indexedDB.deleteDatabase(name); } catch (e) {}
  });
}

if (typeof window !== "undefined") {
  (window as any).purgeFirestoreCache = () => {
    purgeLocalFirestoreCache().then(() => {
      localStorage.setItem("needs_firestore_purge", "true");
      window.location.reload();
    });
  };

  // Limpieza preventiva de claves huérfanas en localStorage al arrancar
  // para blindar contra el límite de 5 MB y evitar QuotaExceededError
  try {
    if (localStorage.getItem("pos_history")) {
      localStorage.removeItem("pos_history");
    }
    // Si hay acumulación de llaves viejas de clientes de pestañas cerradas
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("firestore_clients_")) {
        keysToRemove.push(k);
      }
    }
    // Dejar solo las más recientes si hay más de 10
    if (keysToRemove.length > 10) {
      keysToRemove.slice(0, keysToRemove.length - 5).forEach((k) => {
        try { localStorage.removeItem(k); } catch {}
      });
    }
  } catch (e) {
    console.warn("Storage auto-cleanup notice:", e);
  }
}



