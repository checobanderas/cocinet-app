export const formatTableName = (zone: string, label: string): string => {
  if (!label) return "S/N";
  
  const rawStr = `${zone || ''} ${label}`.trim().toLowerCase();
  
  // Extract number from label or raw text
  let num = label.replace(/\D/g, "");
  if (!num) num = rawStr.replace(/\D/g, "");
  
  // 1. Para Llevar -> P1, P2, P3...
  if (rawStr.includes("llevar") || rawStr.includes("takeout") || label.toUpperCase().startsWith("P")) {
    return num ? `P${num}` : `P ${label}`;
  }
  
  // 2. Servicio a Domicilio / Reparto / Delivery -> D1, D2, D3...
  if (rawStr.includes("domicilio") || rawStr.includes("reparto") || rawStr.includes("delivery") || label.toUpperCase().startsWith("D")) {
    return num ? `D${num}` : `D ${label}`;
  }
  
  // 3. Mesas de Salón Principal o cualquier mesa numerada -> M1, M2, M3...
  if (num) {
    return `M${num}`;
  }
  
  // Fallback si no tiene número
  return label;
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



