/**
 * Helper to match owner names or IDs to their canonical ownerKey.
 */
export function getMatchedOwnerKey(ownerParam: string | null | undefined): string | null {
  if (!ownerParam) return null;
  const cleanParam = ownerParam.trim().toLowerCase();
  if (cleanParam.includes("soraya") || cleanParam.includes("jorge") || cleanParam === "1") return "1";
  if (cleanParam.includes("evelin") || cleanParam === "2") return "2";
  if (cleanParam.includes("armando") || cleanParam === "3") return "3";
  if (cleanParam.includes("mero") || cleanParam.includes("pendiente") || cleanParam === "4") return "4";
  if (cleanParam.includes("sebas") || cleanParam.includes("sebastián") || cleanParam === "5") return "5";
  if (cleanParam.includes("bladimir") || cleanParam === "6") return "6";
  if (cleanParam.includes("amparo") || cleanParam === "7") return "7";
  if (cleanParam.includes("levi") || cleanParam === "8") return "8";
  if (cleanParam.includes("tlacolula") || cleanParam === "9") return "9";
  if (cleanParam.includes("huayapam") || cleanParam === "10") return "10";

  // Check dynamic custom owners from cached list
  try {
    const cached = localStorage.getItem("cocinet_custom_owners_v3");
    if (cached) {
      const customOwners = JSON.parse(cached);
      if (Array.isArray(customOwners)) {
        const found = customOwners.find(o => 
          o.key === cleanParam || 
          o.name?.toLowerCase().includes(cleanParam) || 
          cleanParam.includes(o.name?.toLowerCase())
        );
        if (found) return found.key;
      }
    }
  } catch (e) {
    // Ignore
  }

  return null;
}

/**
 * Checks if the user has access to a specific company/tenant based on restricted owner key.
 */
export function isTenantAccessAllowed(
  tenantOwnerKey: string | null | undefined,
  restrictedOwnerKey: string | null | undefined
): boolean {
  if (!restrictedOwnerKey) return true; // No restriction
  if (!tenantOwnerKey) return false;
  return tenantOwnerKey === restrictedOwnerKey;
}
