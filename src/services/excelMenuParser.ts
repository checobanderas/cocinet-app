/**
 * Servicio de parseo y lectura estructurada de menús de Excel.
 * Preserva el orden consecutivo estricto (1..210) y clasifica automáticamente
 * categorías (food, drinks, desserts) y destinos (kitchen, bar).
 */

export interface ParsedExcelProduct {
  id: string;
  name: string;
  sortOrder: number;
  consecutive: number;
  price: number;
  category: "food" | "drinks" | "desserts" | string;
  subcategory: string;
  subgroup: string;
  destination: "kitchen" | "bar" | string;
}

export function parseStructuredExcelCatalog(rawGrid: any[][]): ParsedExcelProduct[] | null {
  if (!rawGrid || rawGrid.length < 2) return null;

  let currentSection = "";
  const parsed: ParsedExcelProduct[] = [];

  for (let r = 0; r < rawGrid.length; r++) {
    const row = rawGrid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const col0 = String(row[0] || "").trim();
    if (!col0) continue;

    // Omitir fila de encabezados
    if (
      col0.toUpperCase() === "PRODUCTO" ||
      col0.toUpperCase() === "PRODUCTO / DESCRIPCIÓN" ||
      col0.toUpperCase() === "NOMBRE" ||
      col0.toUpperCase() === "PRODUCTO / PLATILLO"
    ) {
      continue;
    }

    // Buscar si hay columnas numéricas (consecutivo y precio)
    let consecNum = NaN;
    let priceNum = NaN;

    for (let c = 1; c < row.length; c++) {
      const cellRaw = String(row[c] || "").replace(/[$,]/g, "").trim();
      if (cellRaw !== "") {
        const val = parseFloat(cellRaw);
        if (!isNaN(val)) {
          if (isNaN(consecNum)) {
            consecNum = val;
          } else if (isNaN(priceNum)) {
            priceNum = val;
          }
        }
      }
    }

    // Si la fila no tiene números, es encabezado de sección/categoría
    if (isNaN(consecNum) && isNaN(priceNum)) {
      currentSection = col0;
      continue;
    }

    // Si solo se encontró 1 número
    if (!isNaN(consecNum) && isNaN(priceNum)) {
      if (consecNum >= 1 && consecNum <= 999 && Number.isInteger(consecNum) && row[1] !== undefined && String(row[1]).trim() !== "") {
        priceNum = 0;
      } else {
        priceNum = consecNum;
        consecNum = parsed.length + 1;
      }
    }

    const sortOrder = !isNaN(consecNum) ? consecNum : parsed.length + 1;
    const finalPrice = !isNaN(priceNum) ? priceNum : 0;

    const nameLower = col0.toLowerCase();
    const secLower = (currentSection || "").toLowerCase();

    let category = "food";
    let destination: "kitchen" | "bar" = "kitchen";

    if (
      secLower.includes("bebida") ||
      secLower.includes("refresco") ||
      secLower.includes("cerveza") ||
      secLower.includes("agua") ||
      secLower.includes("caf") ||
      secLower.includes("te") ||
      nameLower.includes("coca") ||
      nameLower.includes("refresco") ||
      nameLower.includes("cerveza") ||
      nameLower.includes("barrilito") ||
      nameLower.includes("agua") ||
      nameLower.includes("limonada") ||
      nameLower.includes("naranjada") ||
      nameLower.includes("topo chico") ||
      nameLower.includes("ponche") ||
      nameLower.includes("soda") ||
      nameLower.includes("atole") ||
      nameLower.includes("tizana") ||
      nameLower.includes("choco milk") ||
      nameLower.includes("frape") ||
      nameLower.includes("matcha") ||
      nameLower.includes("taro") ||
      nameLower.includes("suero") ||
      nameLower.includes("michelada")
    ) {
      category = "drinks";
      destination = "bar";
    } else if (
      secLower.includes("postre") ||
      secLower.includes("flan") ||
      secLower.includes("panque") ||
      secLower.includes("tarta") ||
      nameLower.includes("postre") ||
      nameLower.includes("flan") ||
      nameLower.includes("panque") ||
      nameLower.includes("tarta") ||
      nameLower.includes("pay")
    ) {
      category = "desserts";
      destination = "kitchen";
    }

    parsed.push({
      id: `ai_excel_${Date.now()}_${sortOrder}`,
      name: col0,
      sortOrder,
      consecutive: sortOrder,
      price: finalPrice,
      category,
      subcategory: currentSection || (category === "drinks" ? "Bebidas" : category === "desserts" ? "Postres" : "Alimentos"),
      subgroup: currentSection || "General",
      destination,
    });
  }

  return parsed.length > 0 ? parsed : null;
}
