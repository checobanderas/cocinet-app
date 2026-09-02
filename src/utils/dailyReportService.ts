import * as XLSX from 'xlsx';
import { getOperatingDay, getProductReportName, getProductSortScore, getTenantUsers, SUBCATEGORY_ORDER } from './appHelpers';
import { getWhatsAppCloudConfig, sendSilentWhatsAppMessage } from './whatsappCloud';

export function getFriendlyTitleDate(todayOperatingDay: string): string {
  if (!todayOperatingDay) return "";
  try {
    const parts = todayOperatingDay.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dObj = new Date(year, month, day);
      const dayStr = dObj.toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
    }
  } catch (e) {
    // Fallback
  }
  return todayOperatingDay;
}

export function processDailyReportData(history: any[], products: any[] = [], targetDate?: string) {
  const todayOperatingDay = targetDate || getOperatingDay(new Date());
  const friendlyTitleDate = getFriendlyTitleDate(todayOperatingDay);

  const dailyHistory = (history || []).filter(h => {
    if (h.status === "cancelled") return false;
    const accountDate = h.timestamp instanceof Date ? h.timestamp : new Date(h.timestamp);
    return getOperatingDay(accountDate) === todayOperatingDay;
  }).sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });

  const dailyCancellations: Array<{
    id: string;
    folio: string | number;
    timestamp: any;
    tableLabel: string;
    description: string;
    quantity: number;
    reason: string;
    user: string;
    total: number;
    type: 'cuenta' | 'producto';
  }> = [];

  (history || []).forEach(h => {
    const accountDate = h.timestamp instanceof Date ? h.timestamp : new Date(h.timestamp);
    if (getOperatingDay(accountDate) !== todayOperatingDay) return;

    if (h.status === "cancelled") {
      let calcTotal = Number(h.total || 0);
      if (!calcTotal || calcTotal === 0) {
        (h.comandas || []).forEach((c: any) => {
          (c.items || []).forEach((item: any) => {
            calcTotal += (item.quantity || 1) * (item.product?.price || item.price || 0);
          });
        });
      }
      dailyCancellations.push({
        id: `account-${h.id || h.folio}-${h.timestamp}`,
        folio: h.folio || "N/A",
        timestamp: h.timestamp,
        tableLabel: h.tableLabel || "N/A",
        description: "Cuenta Completa Cancelada",
        quantity: 1,
        reason: h.cancellationReason || "No especificada",
        user: h.cancelledBy?.name || "Administrador/Cajero",
        total: calcTotal,
        type: 'cuenta'
      });
    } else {
      (h.comandas || []).forEach((c: any) => {
        (c.items || []).forEach((item: any, idx: number) => {
          if (item.isCancelled) {
            const liveProduct = products.find(p => String(p.id) === String(item.product?.id)) || 
                                products.find(p => (p.name || "").toLowerCase().trim() === (item.product?.name || "").toLowerCase().trim()) || 
                                item.product;
            const itemPrice = item.product?.price || item.price || liveProduct?.price || 0;
            dailyCancellations.push({
              id: `item-${h.id || h.folio}-${c.id || idx}-${idx}`,
              folio: h.folio || "N/A",
              timestamp: c.timestamp || h.timestamp,
              tableLabel: h.tableLabel || "N/A",
              description: getProductReportName(liveProduct),
              quantity: item.quantity || 1,
              reason: item.cancellationReason || "No especificada",
              user: item.cancelledBy?.name || "Mesero/Cajero",
              total: (item.quantity || 1) * itemPrice,
              type: 'producto'
            });
          }
        });
      });
    }
  });

  const totalCancellations = dailyCancellations.reduce((sum, item) => sum + item.total, 0);

  const productSummaryMap: Record<string, { name: string, quantity: number, total: number, product: any }> = {};
  dailyHistory.forEach(account => {
    (account.comandas || []).forEach((comanda: any) => {
      (comanda.items || []).forEach((item: any) => {
        if (item.isCancelled) return;
        const key = item.product?.id || item.product?.name || "item";
        const liveProduct = products.find(p => String(p.id) === String(item.product?.id)) || 
                            products.find(p => (p.name || "").toLowerCase().trim() === (item.product?.name || "").toLowerCase().trim()) || 
                            item.product;
        if (!productSummaryMap[key]) {
          productSummaryMap[key] = { name: getProductReportName(liveProduct), quantity: 0, total: 0, product: liveProduct };
        }
        productSummaryMap[key].quantity += (item.quantity || 1);
        productSummaryMap[key].total += (item.quantity || 1) * (item.product?.price || item.price || 0);
      });
    });
  });

  const productSummary = Object.values(productSummaryMap).filter(p => !p.name.includes("---")).sort((a, b) => {
    const scoreA = getProductSortScore(a.product);
    const scoreB = getProductSortScore(b.product);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.name.localeCompare(b.name);
  });

  const groups: Record<string, typeof productSummary> = {};
  productSummary.forEach(p => {
    const groupKey = (p.product?.subgroup || p.product?.subcategory || "OTROS").toUpperCase().trim();
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(p);
  });

  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      const scoreA = getProductSortScore(a.product);
      const scoreB = getProductSortScore(b.product);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name);
    });
  });

  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    const minScoreA = Math.min(...groups[a].map(p => getProductSortScore(p.product)));
    const minScoreB = Math.min(...groups[b].map(p => getProductSortScore(p.product)));

    if (minScoreA !== minScoreB) {
      return minScoreA - minScoreB;
    }

    const idxA = SUBCATEGORY_ORDER.findIndex(target => a.toLowerCase().includes(target) || target.includes(a.toLowerCase()));
    const idxB = SUBCATEGORY_ORDER.findIndex(target => b.toLowerCase().includes(target) || target.includes(b.toLowerCase()));
    const scoreA = idxA === -1 ? 999 : idxA;
    const scoreB = idxB === -1 ? 999 : idxB;
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.localeCompare(b);
  });

  const groupedProducts = sortedGroupKeys.map(key => ({
    groupName: key,
    items: groups[key]
  }));

  const totalAccounts = dailyHistory.reduce((sum, h) => sum + (h.total || 0), 0);
  const totalProducts = productSummary.reduce((sum, p) => sum + p.total, 0);

  let cash = 0;
  let card = 0;
  let transfer = 0;
  let lupay = 0;
  let cortesia = 0;
  let discount = 0;

  dailyHistory.forEach(h => {
    const pm = (h.paymentMethod || "Efectivo").toLowerCase().trim();
    const amt = Number(h.total || 0);
    const disc = Number(h.discount || 0);
    discount += disc;

    if (pm.includes("cortes") || pm.includes("empleado")) {
      cortesia += amt;
    } else if (pm === "lupay" || pm === "upay") {
      lupay += amt;
    } else if (pm === "card" || pm === "tarjeta" || pm === "debit") {
      card += amt;
    } else if (pm === "transfer" || pm === "transferencia") {
      transfer += amt;
    } else if (pm === "cash" || pm === "efectivo") {
      cash += amt;
    } else {
      cash += amt;
    }
  });

  const paymentBreakdown = { cash, card, transfer, lupay, cortesia, discount };

  return {
    todayOperatingDay,
    friendlyTitleDate,
    dailyHistory,
    dailyCancellations,
    totalCancellations,
    productSummary,
    groupedProducts,
    totalAccounts,
    totalProducts,
    paymentBreakdown,
  };
}

export function generateDailyReportText(
  history: any[],
  products: any[] = [],
  targetDate?: string,
  companyName: string = "Cocinet App"
): string {
  const {
    friendlyTitleDate,
    dailyHistory,
    dailyCancellations,
    totalCancellations,
    groupedProducts,
    totalAccounts,
    totalProducts,
    paymentBreakdown,
  } = processDailyReportData(history, products, targetDate);

  let text = `🏪 *${companyName.toUpperCase()}*\n`;
  text += `📊 *REPORTE DIARIO DE VENTAS*\n`;
  text += `📅 *Fecha:* ${friendlyTitleDate}\n`;
  text += `----------------------------------\n\n`;

  text += `💰 *RESUMEN DE CUENTAS & COMANDAS (${dailyHistory.length}):*\n`;
  dailyHistory.forEach((h, idx) => {
    const consecutive = dailyHistory.length - idx;
    const foliosInt = (h.comandas || []).map((c: any) => c.folioInterno ? `#${c.folioInterno}` : `#${c.folio}`).join(", ");
    text += `• #${consecutive} | Mesa ${h.tableLabel || "N/A"} | Folio Int: *${foliosInt}* | Total: *$${(h.total || 0).toFixed(2)}*\n`;
  });
  text += `\n`;

  text += `💵 *MÉTODOS DE PAGO:*\n`;
  text += `• Efec: *$${paymentBreakdown.cash.toFixed(2)}*\n`;
  text += `• Tarj: *$${paymentBreakdown.card.toFixed(2)}*\n`;
  text += `• Transf: *$${paymentBreakdown.transfer.toFixed(2)}*\n`;
  text += `• LUPAY: *$${paymentBreakdown.lupay.toFixed(2)}*\n`;
  text += `• Cort/Emp: *$${paymentBreakdown.cortesia.toFixed(2)}*\n`;
  text += `• Descuentos: *-$${paymentBreakdown.discount.toFixed(2)}*\n\n`;

  if (dailyCancellations.length > 0) {
    text += `❌ *CANCELACIONES:*\n`;
    text += `• Total Registros: *${dailyCancellations.length}*\n`;
    text += `• Total Cancelado: *$${totalCancellations.toFixed(2)}*\n\n`;
  }

  text += `🍔 *PRODUCTOS VENDIDOS:*\n`;
  groupedProducts.forEach(group => {
    text += `\n*${group.groupName}*\n`;
    group.items.forEach(p => {
      text += `• ${p.quantity} x *${p.name}* → *$${p.total.toFixed(2)}*\n`;
    });
  });
  text += `\n`;

  text += `📈 *TOTALES FINALES:*\n`;
  text += `• Total Cuentas: *$${totalAccounts.toFixed(2)}*\n`;
  text += `• Total Productos: *$${totalProducts.toFixed(2)}*\n`;
  text += `• Total Cancelaciones: *$${totalCancellations.toFixed(2)}*\n`;
  if (paymentBreakdown.discount > 0) {
    text += `• (-) Descuentos: *-$${paymentBreakdown.discount.toFixed(2)}*\n`;
    text += `• Total Prod. (Ajustado): *$${(totalProducts - paymentBreakdown.discount).toFixed(2)}*\n`;
  }
  text += `----------------------------------\n`;
  text += `Generado por Cocinet App 🌮✨`;

  return text;
}

export function exportDailyReportExcel(
  history: any[],
  products: any[] = [],
  targetDate?: string,
  companyName: string = "Cocinet App"
): void {
  const {
    todayOperatingDay,
    friendlyTitleDate,
    dailyHistory,
    dailyCancellations,
    totalCancellations,
    productSummary,
    groupedProducts,
    totalProducts,
    paymentBreakdown,
  } = processDailyReportData(history, products, targetDate);

  const wb = XLSX.utils.book_new();
  const cleanCompany = (companyName || "Cocinet")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const formatWorksheet = (ws: XLSX.WorkSheet, headerRowIdx: number = 6) => {
    Object.keys(ws).forEach((key) => {
      if (key.startsWith("!")) return;
      const col = key.replace(/[0-9]/g, "");
      const row = parseInt(key.replace(/[^0-9]/g, ""), 10);
      const cell = ws[key];
      if (!cell) return;

      if (!cell.s) cell.s = {};

      if (row === 1) {
        cell.s = {
          fill: { fgColor: { rgb: "1E3A8A" } },
          font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      } else if (row === 2) {
        cell.s = {
          fill: { fgColor: { rgb: "2563EB" } },
          font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      } else if (row === 3 || row === 4) {
        cell.s = {
          fill: { fgColor: { rgb: "F1F5F9" } },
          font: { name: "Calibri", sz: 10, italic: row === 4, color: { rgb: "334155" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      } else if (row === headerRowIdx) {
        cell.s = {
          fill: { fgColor: { rgb: "1E293B" } },
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    });
  };

  // ==================== SHEET 1: CUENTAS ====================
  const accountsAOA: any[][] = [];
  accountsAOA.push([`${companyName.toUpperCase()} - REPORTE DE OPERACIONES`]);
  accountsAOA.push(["REPORTE DIARIO DE CUENTAS COBRADAS Y DESGLOSE"]);
  accountsAOA.push([`FECHA DE OPERACIÓN: ${friendlyTitleDate}`]);
  accountsAOA.push([`EMITIDO POR: COCINET POS SYSTEM - HORA: ${new Date().toLocaleTimeString()}`]);
  accountsAOA.push([]);

  accountsAOA.push([
    "CONSECUTIVO",
    "FOLIO CUENTA",
    "FOLIO INTERNO COMANDAS",
    "FECHA / HORA DE CIERRE",
    "MESA",
    "MÉTODO DE PAGO",
    "REQUIERE FACTURA",
    "TOTAL COBRADO"
  ]);

  const N = dailyHistory.length;

  dailyHistory.forEach((h, index) => {
    const consecutive = dailyHistory.length - index;
    const foliosInternos = (h.comandas || []).map((c: any) => c.folioInterno ? `#${c.folioInterno}` : `#${c.folio}`).join(", ");
    accountsAOA.push([
      `#${consecutive}`,
      h.folio || `CUT-${consecutive}`,
      foliosInternos,
      h.timestamp instanceof Date ? h.timestamp.toLocaleString() : h.timestamp,
      h.tableLabel || "N/A",
      h.paymentMethod || "Efectivo",
      h.requiresInvoice ? (h.invoicePhone ? `Sí (${h.invoicePhone})` : "Sí") : "No",
      h.total
    ]);
  });

  accountsAOA.push([]);

  const desgloseStartRow = accountsAOA.length + 1;
  accountsAOA.push(["SECTION_HEADER:DESGLOSE POR FORMA DE PAGO", "MONTO RECAUDADO"]);
  accountsAOA.push(["💵 EFECTIVO", paymentBreakdown.cash]);
  accountsAOA.push(["💳 TARJETA CRÉDITO / DÉBITO", paymentBreakdown.card]);
  accountsAOA.push(["📲 TRANSFERENCIA INTERBANCARIA", paymentBreakdown.transfer]);
  accountsAOA.push(["⚡ COBRO LUPAY", paymentBreakdown.lupay]);
  accountsAOA.push(["💜 CORTESÍA / EMPLEADOS", paymentBreakdown.cortesia]);
  accountsAOA.push(["🏷️ DESCUENTOS APLICADOS", paymentBreakdown.discount]);

  accountsAOA.push([]);

  const totalsStartRow = accountsAOA.length + 1;
  accountsAOA.push(["SECTION_HEADER:RESUMEN Y TOTALES GENERALES", "MONTO TOTAL"]);
  accountsAOA.push(["TOTAL DE CUENTAS COBRADAS", { t: "n", f: `SUM(H7:H${6 + N})` }]);
  accountsAOA.push(["TOTAL BRUTO DE PRODUCTOS", totalProducts]);
  accountsAOA.push(["TOTAL DE CANCELACIONES", totalCancellations]);
  if (paymentBreakdown.discount > 0) {
    accountsAOA.push(["(-) DESCUENTOS APLICADOS", -paymentBreakdown.discount]);
    accountsAOA.push(["TOTAL PRODUCTOS CON DESCUENTOS", { t: "n", f: `B${totalsStartRow + 2}+B${totalsStartRow + 4}` }]);
  }

  const wsAccounts = XLSX.utils.aoa_to_sheet(accountsAOA);
  wsAccounts['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }
  ];
  wsAccounts['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 26 },
    { wch: 22 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 }
  ];

  Object.keys(wsAccounts).forEach((key) => {
    if (key.startsWith('!')) return;
    const col = key.replace(/[0-9]/g, '');
    const row = parseInt(key.replace(/[^0-9]/g, ''), 10);
    if (row <= 5) return;
    const cell = wsAccounts[key];
    if (cell && (cell.t === 'n' || cell.f)) {
      if (col === 'H' || col === 'B') {
        cell.z = '$#,##0.00';
      }
    }
    if (cell && typeof cell.v === 'string' && cell.v.startsWith('SECTION_HEADER:')) {
      cell.v = cell.v.replace('SECTION_HEADER:', '');
      cell.s = {
        fill: { fgColor: { rgb: "E0E7FF" } },
        font: { bold: true, color: { rgb: "1E1B4B" } }
      };
    }
  });

  formatWorksheet(wsAccounts);
  XLSX.utils.book_append_sheet(wb, wsAccounts, "Cuentas");

  // ==================== SHEET 2: PRODUCTOS ====================
  const productsAOA: any[][] = [];
  productsAOA.push([`${companyName.toUpperCase()} - PRODUCTOS VENDIDOS`]);
  productsAOA.push(["REPORTE DIARIO DE PRODUCTOS VENDIDOS POR SUBGRUPO"]);
  productsAOA.push([`FECHA DE CONSULTA: ${friendlyTitleDate}`]);
  productsAOA.push([`EMITIDO POR: COCINET POS SYSTEM - HORA: ${new Date().toLocaleTimeString()}`]);
  productsAOA.push([]);

  productsAOA.push(["PRODUCTO / PLATILLO", "CANTIDAD VENDIDA", "TOTAL RECAUDADO"]);

  groupedProducts.forEach(group => {
    productsAOA.push([]);
    productsAOA.push([`GROUP_HEADER:📂 ${group.groupName.toUpperCase()}`, "", ""]);
    group.items.forEach(p => {
      productsAOA.push([p.name, p.quantity, p.total]);
    });
  });

  const L = productsAOA.length;

  productsAOA.push([]);
  productsAOA.push(["TOTAL BRUTO DE PRODUCTOS", { t: "n", f: `SUM(B7:B${L})` }, { t: "n", f: `SUM(C7:C${L})` }]);
  
  if (paymentBreakdown.discount > 0) {
    productsAOA.push(["(-) DESCUENTOS APLICADOS", "", -paymentBreakdown.discount]);
    productsAOA.push(["TOTAL PRODUCTOS CON DESCUENTOS", "", { t: "n", f: `C${L + 2}+C${L + 3}` }]);
  }

  const wsProducts = XLSX.utils.aoa_to_sheet(productsAOA);
  wsProducts['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }
  ];

  wsProducts['!cols'] = [
    { wch: 50 },
    { wch: 20 },
    { wch: 20 }
  ];

  Object.keys(wsProducts).forEach((key) => {
    if (key.startsWith('!')) return;
    const col = key.replace(/[0-9]/g, '');
    const row = parseInt(key.replace(/[^0-9]/g, ''), 10);
    if (row <= 5) return;
    const cell = wsProducts[key];
    if (cell) {
      if (cell.t === 'n' || cell.f) {
        if (col === 'C') {
          cell.z = '$#,##0.00';
        } else if (col === 'B') {
          cell.z = '#,##0.0';
        }
      }
      if (typeof cell.v === 'string' && cell.v.startsWith('GROUP_HEADER:')) {
        cell.v = cell.v.replace('GROUP_HEADER:', '');
        cell.s = {
          fill: { fgColor: { rgb: "E0E7FF" } },
          font: { bold: true, color: { rgb: "1E1B4B" } }
        };
      }
    }
  });

  formatWorksheet(wsProducts);
  XLSX.utils.book_append_sheet(wb, wsProducts, "Productos");

  // ==================== SHEET 3: CANCELACIONES ====================
  const cancellationsAOA: any[][] = [];
  cancellationsAOA.push([`${companyName.toUpperCase()} - CANCELACIONES`]);
  cancellationsAOA.push(["REPORTE DIARIO DE CANCELACIONES Y ANULACIONES"]);
  cancellationsAOA.push([`FECHA DE CONSULTA: ${friendlyTitleDate}`]);
  cancellationsAOA.push([`EMITIDO POR: COCINET POS SYSTEM - HORA: ${new Date().toLocaleTimeString()}`]);
  cancellationsAOA.push([]);

  cancellationsAOA.push([
    "CONSECUTIVO",
    "FOLIO",
    "TIPO",
    "FECHA / HORA",
    "MESA / ORDEN",
    "PRODUCTO / CONCEPTO",
    "CANTIDAD",
    "MOTIVO",
    "AUTORIZADO POR",
    "TOTAL PERDIDO / CANCELADO"
  ]);

  const C = dailyCancellations.length;

  dailyCancellations.forEach((item, index) => {
    const consecutive = dailyCancellations.length - index;
    cancellationsAOA.push([
      `#${consecutive}`,
      item.folio || `CAN-${consecutive}`,
      item.type === 'cuenta' ? "Cuenta Completa" : "Producto Individual",
      item.timestamp instanceof Date ? item.timestamp.toLocaleString() : item.timestamp,
      item.tableLabel || "N/A",
      item.description,
      item.quantity,
      item.reason,
      item.user,
      item.total
    ]);
  });

  cancellationsAOA.push([]);
  cancellationsAOA.push(["TOTAL CANCELACIONES DEL DÍA", "", "", "", "", "", "", "", "", { t: "n", f: `SUM(J7:J${6 + C})` }]);

  const wsCancellations = XLSX.utils.aoa_to_sheet(cancellationsAOA);
  wsCancellations['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } }
  ];

  wsCancellations['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 35 },
    { wch: 12 },
    { wch: 30 },
    { wch: 22 },
    { wch: 18 }
  ];

  Object.keys(wsCancellations).forEach((key) => {
    if (key.startsWith('!')) return;
    const col = key.replace(/[0-9]/g, '');
    const row = parseInt(key.replace(/[^0-9]/g, ''), 10);
    if (row <= 5) return;
    const cell = wsCancellations[key];
    if (cell && (cell.t === 'n' || cell.f)) {
      if (col === 'J') {
        cell.z = '$#,##0.00';
      } else if (col === 'G') {
        cell.z = '#,##0.0';
      }
    }
  });

  formatWorksheet(wsCancellations);
  XLSX.utils.book_append_sheet(wb, wsCancellations, "Cancelaciones");

  // ==================== SHEET 4: CATÁLOGO EN ORDEN CONSECUTIVO ====================
  const soldMap: Record<string, { quantity: number, total: number }> = {};
  productSummary.forEach(p => {
    if (p.product?.id) soldMap[String(p.product.id)] = { quantity: p.quantity, total: p.total };
    soldMap[(p.name || "").toLowerCase().trim()] = { quantity: p.quantity, total: p.total };
  });

  const catalogAOA: any[][] = [];
  catalogAOA.push([`${companyName.toUpperCase()} - CATÁLOGO GENERAL DE PRODUCTOS`]);
  catalogAOA.push(["LISTADO COMPLETO DE PRODUCTOS Y ESTADO DE VENTAS DEL DÍA (ORDEN AUDITORÍA)"]);
  catalogAOA.push([`FECHA DE CONSULTA: ${friendlyTitleDate}`]);
  catalogAOA.push([`EMITIDO POR: COCINET POS SYSTEM - HORA: ${new Date().toLocaleTimeString()}`]);
  catalogAOA.push([]);

  catalogAOA.push(["# ORDEN", "PRODUCTO / PLATILLO", "PRECIO LISTA", "ESTADO EN VENTAS", "CANT. VENDIDA", "TOTAL RECAUDADO"]);

  const sortedDirectCatalog = [...(products || [])]
    .filter((p: any) => !(p.name || "").includes("---") && !p.isDeleted)
    .sort((a: any, b: any) => {
      const numA = Number(a.sortOrder !== undefined && a.sortOrder !== null && a.sortOrder !== 9999 ? a.sortOrder : (a.consecutive || 999999));
      const numB = Number(b.sortOrder !== undefined && b.sortOrder !== null && b.sortOrder !== 9999 ? b.sortOrder : (b.consecutive || 999999));
      if (numA !== numB) return numA - numB;
      return (a.name || "").localeCompare(b.name || "");
    });

  sortedDirectCatalog.forEach((prod, idx) => {
    const orderNum = prod.sortOrder !== undefined && prod.sortOrder !== null && prod.sortOrder !== 9999 
      ? prod.sortOrder 
      : (prod.consecutive || (idx + 1));
    const liveName = getProductReportName(prod);
    const sold = soldMap[String(prod.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(prod.name || "").toLowerCase().trim()] || { quantity: 0, total: 0 };
    const priceVal = Number(prod.price || 0);

    if (sold.quantity > 0) {
      catalogAOA.push([orderNum, liveName, priceVal, `🟢 SÍ VENDIDO (${sold.quantity})`, sold.quantity, sold.total]);
    } else {
      catalogAOA.push([orderNum, liveName, priceVal, "⚪ SIN VENTAS (0)", 0, 0]);
    }
  });

  const M = catalogAOA.length;

  catalogAOA.push([]);
  catalogAOA.push(["TOTAL GENERAL DEL CATÁLOGO", "", "", "", { t: "n", f: `SUM(E7:E${M})` }, { t: "n", f: `SUM(F7:F${M})` }]);

  const wsCatalog = XLSX.utils.aoa_to_sheet(catalogAOA);
  wsCatalog['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }
  ];
  wsCatalog['!cols'] = [
    { wch: 10 },
    { wch: 45 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 }
  ];

  Object.keys(wsCatalog).forEach((key) => {
    if (key.startsWith('!')) return;
    const col = key.replace(/[0-9]/g, '');
    const row = parseInt(key.replace(/[^0-9]/g, ''), 10);
    if (row <= 5) return;
    const cell = wsCatalog[key];
    if (!cell) return;

    if (!cell.s) cell.s = {};

    if (cell.t === 'n' || cell.f) {
      if (col === 'C' || col === 'F') {
        cell.z = '$#,##0.00';
      } else if (col === 'E') {
        cell.z = '#,##0.0';
      }
    }
  });

  formatWorksheet(wsCatalog);
  XLSX.utils.book_append_sheet(wb, wsCatalog, "Productos de Lista");

  const exportFilename = `ReporteDiario_${cleanCompany}_${todayOperatingDay}.xlsx`;
  XLSX.writeFile(wb, exportFilename);
}

export async function sendAutomated5AMDailyReport(
  history: any[],
  products: any[],
  operatingDay: string,
  tenant: any,
  ticketBusinessName: string,
  corteText: string
) {
  const companyName = ticketBusinessName || tenant?.name || "Cocinet App";
  const dailyReportText = generateDailyReportText(history || [], products || [], operatingDay, companyName);
  const metaConfig = getWhatsAppCloudConfig();

  if ((metaConfig.instanceId && metaConfig.token) || (metaConfig.phoneNumberId && metaConfig.accessToken)) {
    const tenantUsers = getTenantUsers(tenant?.id || "tenant-1");
    const recipients = tenantUsers.filter(
      (u) =>
        (u.isReportRecipient ||
          u.id.endsWith("-admin") ||
          u.id.endsWith("-manager") ||
          u.id.endsWith("-sistemas") ||
          u.role === "admin") &&
        u.phone
    );

    if (recipients.length > 0) {
      recipients.forEach((r) => {
        // Enviar 1: Corte Final 5 AM
        sendSilentWhatsAppMessage(r.phone!, corteText).catch((e) =>
          console.error("Error auto 5am silent corte:", e)
        );
        // Enviar 2: Reporte del Día
        setTimeout(() => {
          sendSilentWhatsAppMessage(r.phone!, dailyReportText).catch((e) =>
            console.error("Error auto 5am silent report:", e)
          );
        }, 1500);
      });
    }
  }
}