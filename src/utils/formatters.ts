export const formatTableName = (zone: string, label: string) => {
  if (!label) return "S/N";
  
  const z = (zone || "").toLowerCase();
  // Extract number from label if it has words like "Para Llevar 14" -> "14"
  let num = label.replace(/\D/g, "");
  if (!num) num = label; // Fallback to raw label if no number
  
  // Custom abbreviations for areas
  if (z.includes("llevar") || z.includes("takeout")) {
    return `P ${num}`;
  }
  if (z.includes("domicilio") || z.includes("reparto") || z.includes("delivery")) {
    return `SD ${num}`;
  }
  if (z.includes("salÃ³n") || z.includes("salon")) {
    return `Mesa ${num}`;
  }
  
  // Default for unknown zones (don't prepend Mesa if they just called it "Terraza")
  const formattedZone = zone ? zone.charAt(0).toUpperCase() + zone.slice(1) : "Mesa";
  return `${formattedZone} ${num}`;
};

export const numeroALetras = (num: number): string => {
  const unidades = ["", "UN ", "DOS ", "TRES ", "CUATRO ", "CINCO ", "SEIS ", "SIETE ", "OCHO ", "NUEVE "];
  const decenas = ["DIEZ ", "ONCE ", "DOCE ", "TRECE ", "CATORCE ", "QUINCE ", "DIECISEIS ", "DIECISIETE ", "DIECIOCHO ", "DIECINUEVE ", "VEINTE ", "TREINTA ", "CUARENTA ", "CINCUENTA ", "SESENTA ", "SETENTA ", "OCHENTA ", "NOVENTA "];
  const centenas = ["", "CIENTO ", "DOSCIENTOS ", "TRESCIENTOS ", "CUATROCIENTOS ", "QUINIENTOS ", "SEISCIENTOS ", "SETECIENTOS ", "OCHOCIENTOS ", "NOVECIENTOS "];

  const getDecenas = (n: number): string => {
    if (n < 10) return unidades[n];
    if (n < 20) return decenas[n - 10];
    if (n === 20) return "VEINTE ";
    if (n < 30) return "VEINTI" + unidades[n - 20];
    const dec = Math.floor(n / 10);
    const uni = n % 10;
    return decenas[dec + 8] + (uni > 0 ? "Y " + unidades[uni] : "");
  };

  const getCentenas = (n: number): string => {
    if (n === 100) return "CIEN ";
    const cent = Math.floor(n / 100);
    const dec = n % 100;
    return centenas[cent] + getDecenas(dec);
  };

  const getMiles = (n: number): string => {
    const c = Math.floor(n / 1000);
    const m = n % 1000;
    if (c === 0) return getCentenas(m);
    if (c === 1) return "MIL " + getCentenas(m);
    return getCentenas(c) + "MIL " + getCentenas(m);
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  if (integerPart === 0) return `CERO PESOS ${decimalPart.toString().padStart(2, "0")}/100 M.N.`;

  return `${getMiles(integerPart)}PESOS ${decimalPart.toString().padStart(2, "0")}/100 M.N.`.trim();
};



