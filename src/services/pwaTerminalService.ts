import { CompanyTenant } from "../utils/companyCatalog";

const LOCKED_TERMINAL_KEY = "cocinet_locked_terminal_tenant_id";
const LOCKED_TERMINAL_NAME_KEY = "cocinet_locked_terminal_tenant_name";

// Almacenar el evento nativo beforeinstallprompt de Edge/Chrome
let deferredInstallPrompt: any = null;

if (typeof window !== "undefined") {
  // Sincronizar con el listener temprano de index.html
  if ((window as any).__COCINET_PWA_PROMPT__) {
    deferredInstallPrompt = (window as any).__COCINET_PWA_PROMPT__;
  }

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    (window as any).__COCINET_PWA_PROMPT__ = e;
    console.log("📲 [PWA Service] Evento beforeinstallprompt listo para instalación.");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    (window as any).__COCINET_PWA_PROMPT__ = null;
    console.log("🎉 [PWA Service] Aplicación PWA instalada exitosamente en Windows.");
  });
}

/**
 * Genera un icono SVG en formato Data URI basado en el avatar y color del tenant
 */
function createSvgAvatarIcon(avatar: string, bgColor: string): string {
  const cleanColor = bgColor || "#2563eb";
  const cleanAvatar = avatar || "🍽️";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" rx="128" fill="${cleanColor}"/>
    <text x="50%" y="54%" font-size="270" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">${cleanAvatar}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Resuelve el mejor icono disponible para el tenant (logoUrl, logo del dueño o icono restaurante)
 */
export function resolveTenantIcon(tenant: CompanyTenant): string {
  if (tenant.logoUrl && tenant.logoUrl.trim() !== "" && (tenant.logoUrl.startsWith("http") || tenant.logoUrl.startsWith("/"))) {
    return tenant.logoUrl.trim();
  }
  if ((tenant as any).logo && (tenant as any).logo.trim() !== "" && ((tenant as any).logo.startsWith("http") || (tenant as any).logo.startsWith("/"))) {
    return (tenant as any).logo.trim();
  }
  try {
    const cachedOwnersRaw = localStorage.getItem("cocinet_custom_owners_v3");
    if (cachedOwnersRaw && tenant.ownerKey) {
      const ownersList = JSON.parse(cachedOwnersRaw);
      const ownerObj = ownersList.find((o: any) => o.key === tenant.ownerKey);
      if (ownerObj && ownerObj.logo && (ownerObj.logo.startsWith("http") || ownerObj.logo.startsWith("/"))) {
        return ownerObj.logo.trim();
      }
    }
  } catch (e) {}

  return "/restaurant-512.png";
}

/**
 * Obtiene el ID del tenant bloqueado para esta máquina física.
 */
export function getLockedTerminalTenantId(): string | null {
  try {
    return localStorage.getItem(LOCKED_TERMINAL_KEY);
  } catch {
    return null;
  }
}

/**
 * Obtiene el Nombre de la sucursal bloqueada en esta máquina.
 */
export function getLockedTerminalTenantName(): string | null {
  try {
    return localStorage.getItem(LOCKED_TERMINAL_NAME_KEY);
  } catch {
    return null;
  }
}

/**
 * Bloquea esta terminal física a un Tenant específico.
 */
export function lockTerminalToTenant(tenant: CompanyTenant): void {
  try {
    localStorage.setItem(LOCKED_TERMINAL_KEY, tenant.id);
    localStorage.setItem(LOCKED_TERMINAL_NAME_KEY, tenant.name || tenant.sucursalDefault || "Sucursal");
    // Actualizar manifest dinámico inmediatamente
    updatePwaManifestForTenant(tenant);
  } catch (e) {
    console.error("Error al bloquear terminal a tenant:", e);
  }
}

/**
 * Desvincula / Libera esta máquina física para que pueda usarse en cualquier otra sucursal.
 */
export function unlockTerminal(): void {
  try {
    localStorage.removeItem(LOCKED_TERMINAL_KEY);
    localStorage.removeItem(LOCKED_TERMINAL_NAME_KEY);
    resetToDefaultManifest();
  } catch (e) {
    console.error("Error al desvincular terminal:", e);
  }
}

/**
 * Indica si este equipo tiene un candado activo a una sucursal.
 */
export function isTerminalLocked(): boolean {
  return !getLockedTerminalTenantId() ? false : true;
}

/**
 * Genera y aplica un manifest.json dinámico en el DOM apuntando al tenant seleccionado
 */
export function updatePwaManifestForTenant(tenant: CompanyTenant): void {
  if (typeof document === "undefined") return;

  try {
    const tenantParam = tenant.id.replace(/^tenant-/, "");
    const tenantName = tenant.name || tenant.sucursalDefault || "COCINET";
    const appFullName = `COCINET - ${tenantName}`;
    const themeColor = tenant.accentColor || "#0f172a";
    let tenantIcon = resolveTenantIcon(tenant);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://cocinet-prueba.web.app";
    const absoluteIcon512 = tenantIcon.startsWith("http") ? tenantIcon : `${origin}${tenantIcon.startsWith("/") ? tenantIcon : `/${tenantIcon}`}`;
    const absoluteRestaurant512 = `${origin}/restaurant-512.png`;
    const absoluteRestaurant192 = `${origin}/restaurant-192.png`;

    // Generar Manifest dinámico como Blob para compatibilidad 100% en Edge y Chrome Windows
    const manifestData = {
      id: `cocinet-pwa-${tenantParam || 'default'}`,
      name: appFullName,
      short_name: tenantName.length > 12 ? tenantName.slice(0, 12) : tenantName,
      description: `Sistema punto de venta gastronómico inteligente COCINET Pro para ${appFullName}`,
      start_url: `/?tenant=${encodeURIComponent(tenantParam)}`,
      scope: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: themeColor,
      orientation: 'portrait',
      icons: [
        {
          src: absoluteIcon512,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: absoluteRestaurant192,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: absoluteRestaurant512,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ]
    };

    let manifestHref = '/manifest.json';
    try {
      const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: "application/manifest+json" });
      manifestHref = URL.createObjectURL(blob);
    } catch (e) {
      manifestHref = '/manifest.json';
    }

    let manifestLink = document.getElementById("pwa-manifest-link") as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.id = "pwa-manifest-link";
      }
    }

    if (manifestLink) {
      manifestLink.href = manifestHref;
    } else {
      const newLink = document.createElement("link");
      newLink.id = "pwa-manifest-link";
      newLink.rel = "manifest";
      newLink.href = manifestHref;
      document.head.appendChild(newLink);
    }

    // Actualizar icono de pestaña y de Windows / Apple
    const iconLink = (document.getElementById("pwa-icon-link") || document.querySelector('link[rel="icon"]')) as HTMLLinkElement | null;
    if (iconLink) {
      iconLink.href = absoluteIcon512;
    }
    const appleIconLink = (document.getElementById("pwa-apple-icon-link") || document.querySelector('link[rel="apple-touch-icon"]')) as HTMLLinkElement | null;
    if (appleIconLink) {
      appleIconLink.href = absoluteIcon512;
    }

    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const action = (urlParams?.get("action") || urlParams?.get("modo") || urlParams?.get("view") || "").toLowerCase();
    if (action === "config" || action === "edit" || action === "settings") {
      document.title = `⚙️ Configurando ${tenantName} | COCINET`;
    } else if (action === "users" || action === "usuarios") {
      document.title = `👥 Usuarios: ${tenantName} | COCINET`;
    } else if (action === "login") {
      document.title = `🍽️ ${tenantName} | COCINET`;
    } else {
      document.title = appFullName;
    }
    console.log(`✅ [PWA Service] Manifiesto con icono aplicado para: ${document.title}`);
  } catch (err) {
    console.error("Error actualizando manifest dinámico:", err);
  }
}

/**
 * Restaura el manifest por defecto
 */
export function resetToDefaultManifest(): void {
  if (typeof document === "undefined") return;
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const defaultManifest = isDev ? "/manifest-dev.json" : "/manifest.json";
  const defaultIcon = "/restaurant-512.png";

  let manifestLink = document.getElementById("pwa-manifest-link") as HTMLLinkElement | null;
  if (!manifestLink) {
    manifestLink = document.querySelector('link[rel="manifest"]');
  }
  if (manifestLink) {
    manifestLink.href = defaultManifest;
  }

  const iconLink = (document.getElementById("pwa-icon-link") || document.querySelector('link[rel="icon"]')) as HTMLLinkElement | null;
  if (iconLink) {
    iconLink.href = defaultIcon;
  }
  const appleIconLink = (document.getElementById("pwa-apple-icon-link") || document.querySelector('link[rel="apple-touch-icon"]')) as HTMLLinkElement | null;
  if (appleIconLink) {
    appleIconLink.href = defaultIcon;
  }

  document.title = "COCINET - Sistema Gastronómico";
}

/**
 * Intenta invocar el diálogo nativo de instalación de Edge/Chrome
 */
export async function triggerPwaInstall(): Promise<"installed" | "dismissed" | "needs_reload" | "unavailable"> {
  const promptToUse = deferredInstallPrompt || (typeof window !== "undefined" ? (window as any).__COCINET_PWA_PROMPT__ : null);
  
  if (promptToUse) {
    try {
      promptToUse.prompt();
      const choiceResult = await promptToUse.userChoice;
      deferredInstallPrompt = null;
      if (typeof window !== "undefined") {
        (window as any).__COCINET_PWA_PROMPT__ = null;
      }
      if (choiceResult && choiceResult.outcome === "accepted") {
        console.log("✅ Usuario aceptó instalar la PWA.");
        return "installed";
      } else {
        console.log("❌ Usuario canceló la instalación de la PWA.");
        return "dismissed";
      }
    } catch (e) {
      console.error("Error al invocar prompt de instalación:", e);
      return "unavailable";
    }
  }
  return "needs_reload";
}
