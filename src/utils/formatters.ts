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

export const formatReceiptItemLines = (
  quantity: number | string,
  rawName: string,
  priceStr: string,
  totalWidth: number = 32
): string[] => {
  const cleanName = String(rawName || "").trim().toUpperCase();
  const qtyPrefix = `${quantity}x `;
  const fullSingleLine = `${qtyPrefix}${cleanName}`;

  // 1. Si cabe completo en una sola línea junto con el precio:
  if (fullSingleLine.length + 1 + priceStr.length <= totalWidth) {
    const spaces = Math.max(1, totalWidth - fullSingleLine.length - priceStr.length);
    return [`${fullSingleLine}${" ".repeat(spaces)}${priceStr}`];
  }

  // 2. Distribución en múltiples líneas (Word Wrap):
  const words = cleanName.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = qtyPrefix;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const isFirstInLine = currentLine.length === (lines.length === 0 ? qtyPrefix.length : 3);
    const candidate = isFirstInLine ? `${currentLine}${word}` : `${currentLine} ${word}`;

    if (candidate.length <= totalWidth) {
      currentLine = candidate;
    } else {
      if (currentLine.trim().length > 0 && currentLine !== qtyPrefix) {
        lines.push(currentLine);
        currentLine = `   ${word}`;
      } else {
        const avail = totalWidth - currentLine.length;
        if (avail > 3) {
          lines.push(`${currentLine}${word.substring(0, avail)}`);
          currentLine = `   ${word.substring(avail)}`;
        } else {
          lines.push(currentLine);
          currentLine = `   ${word}`;
        }
      }
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    lines.push(`${qtyPrefix}${cleanName}`);
  }

  // 3. Ajustar el precio al final de la última línea alineado a la derecha:
  const lastIndex = lines.length - 1;
  const lastLine = lines[lastIndex];

  if (lastLine.length + 1 + priceStr.length <= totalWidth) {
    const spaces = Math.max(1, totalWidth - lastLine.length - priceStr.length);
    lines[lastIndex] = `${lastLine}${" ".repeat(spaces)}${priceStr}`;
  } else {
    const spaces = Math.max(0, totalWidth - priceStr.length);
    lines.push(`${" ".repeat(spaces)}${priceStr}`);
  }

  return lines;
};

export const formatComandaItemLines = (
  quantity: number | string,
  rawName: string,
  notes?: string,
  totalWidth: number = 32
): string[] => {
  const cleanName = String(rawName || "").trim().toUpperCase();
  const qtyStr = `[ ${quantity} ] `;
  const indent = "      "; // 6 espacios de sangría alineado con el texto
  const lines: string[] = [];

  const fullSingle = `${qtyStr}${cleanName}`;
  if (fullSingle.length <= totalWidth) {
    lines.push(fullSingle);
  } else {
    const words = cleanName.split(/\s+/).filter(Boolean);
    let currentLine = qtyStr;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isFirst = currentLine.length === (lines.length === 0 ? qtyStr.length : indent.length);
      const testLine = isFirst ? `${currentLine}${word}` : `${currentLine} ${word}`;

      if (testLine.length <= totalWidth) {
        currentLine = testLine;
      } else {
        if (currentLine.trim().length > 0 && currentLine !== qtyStr) {
          lines.push(currentLine);
          currentLine = `${indent}${word}`;
        } else {
          const avail = totalWidth - currentLine.length;
          if (avail > 3) {
            lines.push(`${currentLine}${word.substring(0, avail)}`);
            currentLine = `${indent}${word.substring(avail)}`;
          } else {
            lines.push(currentLine);
            currentLine = `${indent}${word}`;
          }
        }
      }
    }
    if (currentLine.trim().length > 0) {
      lines.push(currentLine);
    }
  }

  if (notes && notes.trim()) {
    const cleanNotes = `👉 NOTA: ${notes.trim().toUpperCase()}`;
    const words = cleanNotes.split(/\s+/).filter(Boolean);
    let currentNoteLine = "   ";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isFirst = currentNoteLine.length === 3;
      const testLine = isFirst ? `${currentNoteLine}${word}` : `${currentNoteLine} ${word}`;
      if (testLine.length <= totalWidth) {
        currentNoteLine = testLine;
      } else {
        lines.push(currentNoteLine);
        currentNoteLine = `   ${word}`;
      }
    }
    if (currentNoteLine.trim().length > 0) {
      lines.push(currentNoteLine);
    }
  }

  return lines;
};



