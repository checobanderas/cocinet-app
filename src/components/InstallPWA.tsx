import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("cocinet_pwa_dismissed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Detect if running inside iframe
    const checkIframe = () => {
      try {
        setIsInIframe(window.self !== window.top);
      } catch (e) {
        setIsInIframe(true);
      }
    };
    checkIframe();

    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);
    };

    checkStandalone();

    const userAgent = navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const win = /Windows|Win64|Win32|Wow64/i.test(userAgent);
    setIsWindows(win);

    const desktop =
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );
    setIsDesktop(desktop);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("focus", checkStandalone);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("focus", checkStandalone);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setDismissed(true);
      }
    } else if (isIOS) {
      alert(
        "Para instalar en tu iPhone/iPad: toca el botón de Compartir ⎋ en la barra de Safari y selecciona 'Añadir a pantalla de inicio' 📲",
      );
    } else if (isWindows) {
      alert(
        "💻 Instalación en Windows:\n\n1. Si estás usando Chrome o Edge, busca el ícono de flecha hacia abajo (📥) o el símbolo de suma (+) que aparece a la derecha de la barra de direcciones de tu navegador.\n\n2. Si no lo ves, haz clic en los 3 puntos (⋮) de arriba a la derecha del navegador y presiona 'Instalar COCINET Pro...' (o 'Guardar y compartir' -> 'Instalar esta página como aplicación').\n\n¡Eso creará un acceso directo súper rápido en tu escritorio!",
      );
    } else {
      // Fallback native menu prompt helper (standard browser fallback)
      alert(
        "Presiona el botón de instalación (icono de flecha o tres puntos ⋮ en tu navegador arriba a la derecha) para agregar a tu pantalla principal.",
      );
    }
  };

  const handleClose = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("cocinet_pwa_dismissed", "true");
    } catch (e) {}
  };

  const notifyUserForPush = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("🔔 ¡Notificaciones de COCINET!", {
            body: "Las notificaciones están activadas en tu dispositivo principal.",
            icon: "https://img.icons8.com/fluency/192/restaurant.png",
          });
        }
      });
    }
  };

  // If already installed (standalone mode), don't show the prompt
  if (isStandalone) return null;
  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 70, scale: 0.9 }}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "16px",
          right: "16px",
          maxWidth: "460px",
          zIndex: 99999,
          background: "rgba(15, 23, 42, 0.98)",
          backdropFilter: "blur(16px)",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          border: "2px solid #3b82f6",
          padding: "20px",
          color: "#fff",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: "16px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
            }}
          >
            <img
              src="https://img.icons8.com/fluency/192/restaurant.png"
              alt="Cocinet Icon"
              style={{ width: "32px", height: "32px" }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "6px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "900",
                  color: "#f8fafc",
                  letterSpacing: "0.2px",
                }}
              >
                {isWindows
                  ? "💻 ¿Instalar COCINET en Windows?"
                  : "📲 ¿Deseas agregar a pantalla de inicio?"}
              </h3>
              <span
                style={{
                  fontSize: "9px",
                  background: "#3b82f6",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontWeight: "900",
                }}
              >
                PWA PRO
              </span>
            </div>

            {isInIframe ? (
              <div style={{ marginBottom: "12px" }}>
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "12px",
                    color: "#94a3b8",
                    lineHeight: "1.4",
                  }}
                >
                  ⚠️{" "}
                  <strong>Modo de previsualización activa en AI Studio.</strong>
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11.5px",
                    color: "#cbd5e1",
                    lineHeight: "1.4",
                  }}
                >
                  Haz clic abajo en{" "}
                  <strong>&quot;🚀 Abrir pestaña&quot;</strong> para ejecutar
                  Cocinet en pantalla completa. Desde ahí podrás ver la flecha
                  de descarga (📥) en la barra superior de tu navegador Windows
                  o instalarlo nativamente.
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: "12px" }}>
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "12px",
                    color: "#cbd5e1",
                    lineHeight: "1.4",
                  }}
                >
                  {isWindows
                    ? "Disfruta de Cocinet como un programa nativo en Windows: acceso directo en tu Escritorio, inicio ultrarrápido y soporte offline inmediato."
                    : "Agrégalo a tu teléfono o computadora para disfrutar el modo de pantalla completa, acceso veloz y notificaciones automáticas inmediatas."}
                </p>
                {isWindows && (
                  <div
                    style={{
                      fontSize: "11px",
                      background: "rgba(59, 130, 246, 0.12)",
                      border: "1px dashed rgba(59, 130, 246, 0.3)",
                      borderRadius: "10px",
                      padding: "8px 10px",
                      color: "#93c5fd",
                      marginTop: "6px",
                    }}
                  >
                    💡 <strong>Tip de Instalación:</strong> Si el instalador no
                    arranca, busca la flechita hacia abajo 📥 adjacent a la
                    barra de direcciones de tu navegador Windows (Chrome/Edge) o
                    haz clic en los 3 puntos y selecciona{" "}
                    <strong>Instalar</strong>.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              {isInIframe ? (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    padding: "10px 16px",
                    fontWeight: "800",
                    fontSize: "12px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  🚀 Abrir pestaña para instalar
                </a>
              ) : (
                <button
                  onClick={async () => {
                    await handleInstallClick();
                    notifyUserForPush();
                  }}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    padding: "10px 18px",
                    fontWeight: "800",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  📥 Aceptar e Instalar {isWindows && "en PC"}
                </button>
              )}

              <button
                onClick={() => {
                  handleClose();
                  notifyUserForPush();
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
