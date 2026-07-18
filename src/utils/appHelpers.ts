import { CompanyTenant, DEFAULT_COMPANY_CATALOG } from "./companyCatalog";
import { getMatchedOwnerKey } from "../accessHelpers";

export type TableStatus = "available" | "occupied" | "reserved" | "payment_pending";
export type TableShape = "local" | "takeout" | "delivery";
export type Destination = "kitchen" | "bar";
export type UserRole = "mesero" | "cajero" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  avatar: string;
  tenantId?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: "food" | "drinks" | "desserts";
  subcategory: string;
  subgroup?: string;
  drinkType?: "hot" | "cold";
  destination: Destination;
  quickNotes?: string[];
  recipe?: Array<{ inventoryItemId: string; quantity: number }>;
}

export function getOperatingDay(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const hour = d.getHours();
  const operatingDate = new Date(d);
  // Business hours: new shift starts at 3:10 AM.
  // Any time before 3:10 AM belongs to the previous day cycle.
  if (hour < 3 || (hour === 3 && d.getMinutes() < 10)) {
    operatingDate.setDate(operatingDate.getDate() - 1);
  }
  const yyyy = operatingDate.getFullYear();
  const mm = String(operatingDate.getMonth() + 1).padStart(2, "0");
  const dd = String(operatingDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getFormattedProductName(product: Product | undefined): string {
  if (!product) return "";
  const sub = (product.subcategory || "").toLowerCase().trim();
  const nameLower = (product.name || "").toLowerCase().trim();
  const isTaco = sub.includes("taco") || nameLower.includes("taco");
  if (isTaco && !nameLower.includes("taco")) {
    return `Taco de ${product.name}`;
  }
  return product.name;
}

export function getProductInventoryStatus(product: any, inventory: any[]) {
  if (!product || !product.recipe || product.recipe.length === 0) {
    return { status: "normal", servingsMin: 999999, limitingInsumo: null };
  }

  let servingsMin = 999999;
  let limitingInsumo = null;
  let hasOutOfStock = false;
  let hasLowStock = false;

  for (const ing of product.recipe) {
    const invItem = inventory.find((it) => it.id === ing.inventoryItemId);
    if (!invItem) continue;

    const stock = invItem.stock || 0;
    const reqQty = ing.quantity || 1;
    const minStock = invItem.minStock !== undefined ? invItem.minStock : 5;

    const servings = stock / reqQty;

    if (stock <= 0) {
      hasOutOfStock = true;
    } else if (stock <= minStock) {
      hasLowStock = true;
    }

    if (servings < servingsMin) {
      servingsMin = servings;
      limitingInsumo = invItem;
    }
  }

  if (hasOutOfStock || servingsMin <= 0) {
    return {
      status: "out_of_stock",
      servingsMin: Math.max(0, servingsMin),
      limitingInsumo,
    };
  }
  if (hasLowStock || servingsMin <= 6) {
    return { status: "low_stock", servingsMin, limitingInsumo };
  }

  return { status: "normal", servingsMin, limitingInsumo: null };
}

// Helper functions for secure token encoding
export function encryptToken(payload: string): string {
  const secret = "cocinet_pro_secure_salt_2026";
  let result = "";
  for (let i = 0; i < payload.length; i++) {
    const charCode = payload.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
    result += charCode.toString(16).padStart(2, "0");
  }
  return btoa(result).replace(/=/g, "");
}

export function decryptToken(token: string): string | null {
  try {
    const secret = "cocinet_pro_secure_salt_2026";
    let base64 = token;
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const hex = atob(base64);
    let result = "";
    for (let i = 0; i < hex.length; i += 2) {
      const hexPart = hex.substring(i, i + 2);
      const charCode = parseInt(hexPart, 16) ^ secret.charCodeAt((i / 2) % secret.length);
      result += String.fromCharCode(charCode);
    }
    if (result.includes("|")) {
      return result;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const getUserPin = (userId: string, defaultPin: string): string => {
  try {
    const customPinsStr = localStorage.getItem("cocinet_custom_pins");
    if (customPinsStr) {
      const customPins = JSON.parse(customPinsStr);
      if (customPins[userId]) {
        return customPins[userId];
      }
    }
  } catch (e) {}
  return defaultPin;
};

export const getCompanyCatalog = (): CompanyTenant[] => {
  try {
    const cached = localStorage.getItem("cocinet_custom_tenants_v3");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return DEFAULT_COMPANY_CATALOG;
};

export const getDefaultUsersList = (): User[] => {
  const allUsers: User[] = [];
  const catalog = getCompanyCatalog();
  
  let customUsersMap: Record<string, User[]> = {};
  try {
    const legacy = localStorage.getItem("cocinet_custom_users");
    if (legacy) {
      customUsersMap = JSON.parse(legacy);
    }
  } catch (e) {}

  catalog.forEach((tenant) => {
    if (customUsersMap[tenant.id] && Array.isArray(customUsersMap[tenant.id])) {
      const tenantCustom = customUsersMap[tenant.id].map(u => ({ ...u, tenantId: tenant.id }));
      allUsers.push(...tenantCustom);
      return;
    }

    const tenantNum = parseInt(tenant.id.replace("tenant-", ""), 10) || 1;
    const shortName = tenant.name
      .replace("Los Mas Buscados ", "")
      .replace("Los Sombrerudos ", "")
      .replace("Taquerias ", "")
      .replace("Tacos Roy ", "")
      .replace("Tacos y Retacos Roy ", "");

    let ownerDisplayName = () => "Propietario";
    if (tenant.ownerKey === "1") ownerDisplayName = () => "Soraya & Jorge";
    else if (tenant.ownerKey === "2") ownerDisplayName = () => "Evelin";
    else if (tenant.ownerKey === "3") ownerDisplayName = () => "Armando";
    else if (tenant.ownerKey === "4") ownerDisplayName = () => "El Mero Mero";
    else if (tenant.ownerKey === "5") ownerDisplayName = () => "San Sebastián";
    else ownerDisplayName = () => tenant.propietario;

    const baseUsers: User[] = [
      {
        id: `${tenant.id}-admin`,
        name: `Propietario: ${ownerDisplayName()} 👑`,
        role: "admin",
        pin: getUserPin(`${tenant.id}-admin`, (2026 + tenantNum).toString()),
        avatar: tenant.avatar === "🤠" ? "fa-solid fa-hat-cowboy" : "fa-solid fa-user-shield",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-manager`,
        name: `Gerente (${shortName}) 👔`,
        role: "admin",
        pin: getUserPin(`${tenant.id}-manager`, (1526 + tenantNum).toString()),
        avatar: "fa-solid fa-user-tie",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-sistemas`,
        name: `Sistemas ⚙️`,
        role: "admin",
        pin: getUserPin(`${tenant.id}-sistemas`, "4020"),
        avatar: "fa-solid fa-laptop-code",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-cajero-1`,
        name: `Cajero 1 💵`,
        role: "cajero",
        pin: getUserPin(`${tenant.id}-cajero-1`, (1026 + tenantNum).toString()),
        avatar: "fa-solid fa-cash-register",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-cajero-2`,
        name: `Cajero 2 💳`,
        role: "cajero",
        pin: getUserPin(`${tenant.id}-cajero-2`, (1126 + tenantNum).toString()),
        avatar: "fa-solid fa-credit-card",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-mesero-main`,
        name: `Mesero 1 🏃`,
        role: "mesero",
        pin: getUserPin(`${tenant.id}-mesero-main`, (126 + tenantNum).toString().padStart(4, "0")),
        avatar: "fa-solid fa-bell-concierge",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-mesero-1`,
        name: `Mesero 2 🚴`,
        role: "mesero",
        pin: getUserPin(`${tenant.id}-mesero-1`, (226 + tenantNum).toString().padStart(4, "0")),
        avatar: "fa-solid fa-person-walking",
        tenantId: tenant.id,
      },
      {
        id: `${tenant.id}-mesero-2`,
        name: `Mesero 3 🚀`,
        role: "mesero",
        pin: getUserPin(`${tenant.id}-mesero-2`, (326 + tenantNum).toString().padStart(4, "0")),
        avatar: "fa-solid fa-person-running",
        tenantId: tenant.id,
      },
    ];
    allUsers.push(...baseUsers);
  });

  return allUsers;
};

export const initializeUsersDatabase = (): User[] => {
  try {
    const cached = localStorage.getItem("cocinet_users_db");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading users db", e);
  }

  const allUsers = getDefaultUsersList();
  localStorage.setItem("cocinet_users_db", JSON.stringify(allUsers));
  return allUsers;
};

export const getTenantUsers = (tenantId: string): User[] => {
  const allUsers = initializeUsersDatabase();
  return allUsers.filter((u) => u.tenantId === tenantId);
};

export const SUBCATEGORY_ORDER = [
  "queso fundido",
  "quesadilla, gringas, sincronizada y burras harina",
  "quesadilla, gringas, sincronizada y burras maiz",
  "quesadilla, gringas, sincronizada y burras maíz",
  "guarniciones",
  "tacos maiz",
  "tacos maíz",
  "tacos harina",
  "extras",
  "tostadas",
  "volcanes",
  "pozoles",
  "carnes"
];

export function getProductReportName(product: any): string {
  if (!product) return "";
  if (product.reportName && product.reportName.trim()) {
    return product.reportName;
  }
  const name = product.name || "";
  const nameLower = name.toLowerCase().trim();
  const subgroup = (product.subgroup || "").trim();
  const subcategory = (product.subcategory || "").trim();
  
  // Define standard types that we want to ensure are in the name
  const keywords = ["gringa", "burra", "burrito", "quesadilla", "taco", "volcan", "pozole", "tostada", "guacamole", "zanahoria", "cerveza", "refresco", "agua", "flan", "tortilla", "alambre", "cebollitas", "orden", "extra"];
  
  // If the product name already contains any of these keywords, we do NOT need to prepend anything!
  const hasKeyword = keywords.some(kw => nameLower.includes(kw));
  if (hasKeyword) {
    return name;
  }
  
  if (subgroup) {
    const subgroupLower = subgroup.toLowerCase();
    let prefix = subgroup;
    if (subgroupLower.includes("gringa")) prefix = "Gringa";
    else if (subgroupLower.includes("burra")) prefix = "Burra";
    else if (subgroupLower.includes("quesadilla")) prefix = "Quesadilla";
    else if (subgroupLower.includes("taco")) prefix = "Taco";
    else if (subgroupLower.includes("volcan")) prefix = "Volcan";
    else if (subgroupLower.includes("pozole")) prefix = "Pozole";
    else if (subgroupLower.includes("tostada")) prefix = "Tostada";
    
    if (prefix && !nameLower.includes(prefix.toLowerCase())) {
      if (nameLower.startsWith("de ") || nameLower.startsWith("al ") || nameLower.startsWith("con ")) {
        return `${prefix} ${name}`;
      } else {
        return `${prefix} de ${name}`;
      }
    }
  }
  
  if (subcategory) {
    const subcatLower = subcategory.toLowerCase();
    let prefix = "";
    if (subcatLower.includes("tacos")) prefix = "Taco";
    else if (subcatLower.includes("gringa")) prefix = "Gringa";
    else if (subcatLower.includes("burra")) prefix = "Burra";
    else if (subcatLower.includes("quesadilla")) prefix = "Quesadilla";
    else if (subcatLower.includes("tostada")) prefix = "Tostada";
    else if (subcatLower.includes("volcan")) prefix = "Volcan";
    
    if (prefix && !nameLower.includes(prefix.toLowerCase())) {
      if (nameLower.startsWith("de ") || nameLower.startsWith("al ") || nameLower.startsWith("con ")) {
        return `${prefix} ${name}`;
      } else {
        return `${prefix} de ${name}`;
      }
    }
  }
  
  return name;
}

export function getProductSortScore(product: any): number {
  if (!product) return 999999;
  if (typeof product.sortOrder === "number" && product.sortOrder !== 9999 && product.sortOrder !== 0) {
    return product.sortOrder;
  }
  const name = (product.name || "").toLowerCase().trim();
  const subcat = (product.subcategory || "").toLowerCase().trim();
  const subgroup = (product.subgroup || "").toLowerCase().trim();
  
  let score = 999999;
  
  // 1. Subcategory priority
  for (let i = 0; i < SUBCATEGORY_ORDER.length; i++) {
    const target = SUBCATEGORY_ORDER[i];
    if (subcat.includes(target) || subgroup.includes(target) || target.includes(subcat) || target.includes(subgroup)) {
      score = 10000 + i * 10000;
      break;
    }
  }
  
  if (score === 999999) {
    if (subcat.includes("queso")) score = 10000 + 0 * 10000;
    else if (subcat.includes("harina") && (subcat.includes("quesadilla") || subcat.includes("gringa") || subcat.includes("burra"))) score = 10000 + 1 * 10000;
    else if (subcat.includes("maiz") && (subcat.includes("quesadilla") || subcat.includes("gringa") || subcat.includes("burra"))) score = 10000 + 2 * 10000;
    else if (subcat.includes("guarnicion") || subcat.includes("guarnición")) score = 10000 + 3 * 10000;
    else if (subcat.includes("tacos maiz") || subcat.includes("tacos maíz")) score = 10000 + 4 * 10000;
    else if (subcat.includes("tacos harina")) score = 10000 + 5 * 10000;
    else if (subcat.includes("extra")) score = 10000 + 6 * 10000;
    else if (subcat.includes("tostada")) score = 10000 + 7 * 10000;
    else if (subcat.includes("volcan")) score = 10000 + 8 * 10000;
    else if (subcat.includes("pozole")) score = 10000 + 9 * 10000;
    else if (subcat.includes("carne")) score = 10000 + 10 * 10000;
    else if (product.category === "food") score = 10000 + 11 * 10000;
    else if (product.category === "drinks") score = 10000 + 12 * 10000;
    else if (product.category === "desserts") score = 10000 + 13 * 10000;
  }
  
  // 2. Subgroup type within category
  if (subgroup.includes("queso fundido") || name.includes("queso fundido")) score += 0;
  else if (subgroup.includes("quesadilla") || name.includes("quesadilla")) score += 100;
  else if (subgroup.includes("gringa") || name.includes("gringa")) score += 200;
  else if (subgroup.includes("sincronizada") || name.includes("sincronizada")) score += 300;
  else if (subgroup.includes("burra") || subgroup.includes("burrita") || name.includes("burra") || name.includes("burrita")) score += 400;
  else {
    // Tacos ordering
    if (name.includes("con queso")) score += 200;
    else if (name.includes("ahogado")) score += 400;
    else score += 100;
  }
  
  // 3. Meat/ingredient priority
  if (name.includes("pastor")) score += 1;
  else if (name.includes("bistec") || name.includes("bisteck")) score += 2;
  else if (name.includes("costilla")) score += 3;
  else if (name.includes("arrachera")) score += 4;
  else if (name.includes("puerco")) score += 5;
  else if (name.includes("res")) score += 6;
  else if (name.includes("pollo")) score += 7;
  else if (name.includes("vegetariano")) score += 8;
  else if (name.includes("lengua")) score += 9;
  else if (name.includes("pata")) score += 10;
  else if (name.includes("champiñon") || name.includes("champiñón")) score += 11;
  
  return score;
}

