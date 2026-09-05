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
 * Resuelve el mejor icono disponible para el tenant (logoUrl, logo del dueño o avatar SVG)
 */
export function resolveTenantIcon(tenant: CompanyTenant): string {
  if (tenant.logoUrl && tenant.logoUrl.trim() !== "") {
    return tenant.logoUrl;
  }
  if ((tenant as any).logo && (tenant as any).logo.trim() !== "") {
    return (tenant as any).logo;
  }
  try {
    const cachedOwnersRaw = localStorage.getItem("cocinet_custom_owners_v3");
    if (cachedOwnersRaw && tenant.ownerKey) {
      const ownersList = JSON.parse(cachedOwnersRaw);
      const ownerObj = ownersList.find((o: any) => o.key === tenant.ownerKey);
      if (ownerObj && ownerObj.logo) {
        return ownerObj.logo;
      }
    }
  } catch (e) {}

  return createSvgAvatarIcon(tenant.avatar || "🍽️", tenant.accentColor || "#2563eb");
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
    const tenantIcon = resolveTenantIcon(tenant);

    // URL HTTP canónica que Edge / Chrome reconocen 100% como PWA instalable
    const canonicalManifestUrl = `/manifest-pwa.json?tenant=${encodeURIComponent(tenantParam)}&name=${encodeURIComponent(tenantName)}&color=${encodeURIComponent(themeColor)}${tenantIcon && tenantIcon.startsWith("http") ? `&logo=${encodeURIComponent(tenantIcon)}` : ""}`;

    let manifestLink = document.getElementById("pwa-manifest-link") as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.id = "pwa-manifest-link";
      }
    }

    if (manifestLink) {
      manifestLink.href = canonicalManifestUrl;
    } else {
      const newLink = document.createElement("link");
      newLink.id = "pwa-manifest-link";
      newLink.rel = "manifest";
      newLink.href = canonicalManifestUrl;
      document.head.appendChild(newLink);
    }

    // Actualizar icono de pestaña y de Windows / Apple
    const iconLink = (document.getElementById("pwa-icon-link") || document.querySelector('link[rel="icon"]')) as HTMLLinkElement | null;
    if (iconLink) {
      iconLink.href = tenantIcon;
    }
    const appleIconLink = (document.getElementById("pwa-apple-icon-link") || document.querySelector('link[rel="apple-touch-icon"]')) as HTMLLinkElement | null;
    if (appleIconLink) {
      appleIconLink.href = tenantIcon;
    }

    document.title = appFullName;
    console.log(`✅ [PWA Service] Manifiesto canónico aplicado para: ${appFullName} -> ${canonicalManifestUrl}`);
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
  const defaultIcon = isDev ? "https://img.icons8.com/plasticine/128/restaurant.png" : "https://img.icons8.com/fluency/128/restaurant.png";

  let manifestLink = document.getElementById("pwa-manifest-link") as HTMLLinkElement | null;
  if (!manifestLink) {
    manifestLink = document.querySelector('link[rel="manifest"]');
  }
  if (manifestLink) {
    manifestLink.href = defaultManifest;
  }

  const iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (iconLink) iconLink.href = defaultIcon;

  document.title = isDev ? "COCINET [DEV]" : "COCINET Pro Version 2026";
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
