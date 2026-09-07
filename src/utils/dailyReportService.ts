import * as XLSX from 'xlsx';
import { getOperatingDay, getProductReportName, getProductSortScore, getTenantUsers, SUBCATEGORY_ORDER } from './appHelpers';
import { getWhatsAppCloudConfig, sendSilentWhatsAppMessage } from './whatsappCloud';
import { storage, ensureFirebaseAuth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

export const getAccountComandaFolios = (h: any): string[] => {
  const folios: string[] = [];
  (h.comandas || []).forEach((c: any) => {
    const f = c.folioInterno !== undefined && c.folioInterno !== null && String(c.folioInterno).trim() !== ""
      ? String(c.folioInterno).trim()
      : (c.folio !== undefined && c.folio !== null && String(c.folio).trim() !== "" ? String(c.folio).trim() : "");
    if (f && !folios.includes(f)) {
      folios.push(f);
    }
  });
  return folios;
};

export const formatAccountComandaFolios = (h: any): string => {
  const folios = getAccountComandaFolios(h);
  if (folios.length === 0) return "S/F";
  return folios.map(f => `#${f}`).join(", ");
};

export const getAccountSortFolio = (h: any): number => {
  const folios = getAccountComandaFolios(h);
  if (folios.length === 0) return 999999999;
  const num = parseInt(folios[0].replace(/\D/g, ""), 10);
  return isNaN(num) ? 999999999 : num;
};

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

  const dailyHistoryByFolio = [...dailyHistory].sort((a, b) => {
    const numA = getAccountSortFolio(a);
    const numB = getAccountSortFolio(b);
    if (numA !== numB) return numA - numB;
    const strA = formatAccountComandaFolios(a);
    const strB = formatAccountComandaFolios(b);
    if (strA !== strB) return strA.localeCompare(strB);
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
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
    dailyHistoryByFolio,
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
    const foliosInt = formatAccountComandaFolios(h);
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
    totalAccounts,
    totalProducts,
    paymentBreakdown,
  } = processDailyReportData(history, products, targetDate);

  const cleanCompany = (companyName || "Cocinet")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const totalSoldPieces = productSummary.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const avgTicket = dailyHistory.length > 0 ? (totalProducts - paymentBreakdown.discount) / dailyHistory.length : 0;

  const soldMap: Record<string, { quantity: number, total: number }> = {};
  productSummary.forEach(p => {
    if (p.product?.id) soldMap[String(p.product.id)] = { quantity: p.quantity, total: p.total };
    soldMap[(p.name || "").toLowerCase().trim()] = { quantity: p.quantity, total: p.total };
  });

  const sortedDirectCatalog = [...(products || [])]
    .filter((p: any) => !(p.name || "").includes("---") && !p.isDeleted)
    .sort((a: any, b: any) => {
      const numA = Number(a.sortOrder !== undefined && a.sortOrder !== null && a.sortOrder !== 9999 ? a.sortOrder : (a.consecutive || 999999));
      const numB = Number(b.sortOrder !== undefined && b.sortOrder !== null && b.sortOrder !== 9999 ? b.sortOrder : (b.consecutive || 999999));
      if (numA !== numB) return numA - numB;
      return (a.name || "").localeCompare(b.name || "");
    });

  let soldCatalogCount = 0;
  let unsoldCatalogCount = 0;
  sortedDirectCatalog.forEach(p => {
    const liveName = getProductReportName(p);
    const sold = soldMap[String(p.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(p.name || "").toLowerCase().trim()];
    if (sold && sold.quantity > 0) soldCatalogCount++;
    else unsoldCatalogCount++;
  });

  const wb = XLSX.utils.book_new();

  // 1. PESTAÑA: DASHBOARD
  const ws1Data: any[][] = [
    [`REPORTE DIARIO DE OPERACIONES — ${companyName.toUpperCase()}`],
    [`Fecha de Operación: ${friendlyTitleDate} | Emisión: ${new Date().toLocaleTimeString()} | Sistema: Cocinet POS System`],
    [],
    ['1. RESUMEN GENERAL Y ARQUEO DE CAJA (PANEL EJECUTIVO)'],
    ['TOTAL VENDIDO (NETO)', '', 'TOTAL CUENTAS', 'DESCUENTOS', 'TOTAL CANCELADO', 'PLATILLOS VENDIDOS', 'TICKET PROMEDIO', ''],
    [
      Number((totalProducts - paymentBreakdown.discount).toFixed(2)),
      '',
      dailyHistory.length,
      Number((-paymentBreakdown.discount).toFixed(2)),
      Number(totalCancellations.toFixed(2)),
      totalSoldPieces,
      Number(avgTicket.toFixed(2)),
      ''
    ],
    [],
    ['DESGLOSE POR MÉTODO DE PAGO', '', '', 'TIPO / ORIGEN', '', 'MONTO RECAUDADO ($)', '', ''],
    ['💵 Efectivo en Caja', '', '', 'Ingreso Directo Caja', '', Number(paymentBreakdown.cash.toFixed(2)), '', ''],
    ['💳 Tarjetas Débito / Crédito', '', '', 'Terminal Bancaria', '', Number(paymentBreakdown.card.toFixed(2)), '', ''],
    ['📲 Transferencias Interbancarias', '', '', 'BBVA / STP / SPEI', '', Number(paymentBreakdown.transfer.toFixed(2)), '', ''],
    ['⚡ Cobros LUPAY', '', '', 'Plataforma Digital QR', '', Number(paymentBreakdown.lupay.toFixed(2)), '', ''],
    ['💜 Cortesías / Consumo Personal', '', '', 'Consumo Interno', '', Number(paymentBreakdown.cortesia.toFixed(2)), '', '']
  ];

  let rIdx = 13;
  const merges1: any[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 4, c: 6 }, e: { r: 4, c: 7 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },
    { s: { r: 5, c: 6 }, e: { r: 5, c: 7 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } },
    { s: { r: 7, c: 3 }, e: { r: 7, c: 4 } },
    { s: { r: 7, c: 5 }, e: { r: 7, c: 7 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } },
    { s: { r: 8, c: 3 }, e: { r: 8, c: 4 } },
    { s: { r: 8, c: 5 }, e: { r: 8, c: 7 } },
    { s: { r: 9, c: 0 }, e: { r: 9, c: 2 } },
    { s: { r: 9, c: 3 }, e: { r: 9, c: 4 } },
    { s: { r: 9, c: 5 }, e: { r: 9, c: 7 } },
    { s: { r: 10, c: 0 }, e: { r: 10, c: 2 } },
    { s: { r: 10, c: 3 }, e: { r: 10, c: 4 } },
    { s: { r: 10, c: 5 }, e: { r: 10, c: 7 } },
    { s: { r: 11, c: 0 }, e: { r: 11, c: 2 } },
    { s: { r: 11, c: 3 }, e: { r: 11, c: 4 } },
    { s: { r: 11, c: 5 }, e: { r: 11, c: 7 } },
    { s: { r: 12, c: 0 }, e: { r: 12, c: 2 } },
    { s: { r: 12, c: 3 }, e: { r: 12, c: 4 } },
    { s: { r: 12, c: 5 }, e: { r: 12, c: 7 } }
  ];

  if (paymentBreakdown.discount > 0) {
    ws1Data.push(['🏷️ Descuentos Promocionales', '', '', 'Deducción de Venta', '', Number((-paymentBreakdown.discount).toFixed(2)), '', '']);
    merges1.push(
      { s: { r: rIdx, c: 0 }, e: { r: rIdx, c: 2 } },
      { s: { r: rIdx, c: 3 }, e: { r: rIdx, c: 4 } },
      { s: { r: rIdx, c: 5 }, e: { r: rIdx, c: 7 } }
    );
    rIdx++;
  }

  ws1Data.push(['TOTAL GENERAL NETO (ARQUEO CUADRADO):', '', '', '', '', Number((totalProducts - paymentBreakdown.discount).toFixed(2)), '', '']);
  merges1.push(
    { s: { r: rIdx, c: 0 }, e: { r: rIdx, c: 4 } },
    { s: { r: rIdx, c: 5 }, e: { r: rIdx, c: 7 } }
  );

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!merges'] = merges1;
  ws1['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Dashboard');

  // 2. PESTAÑA: CUENTAS
  const ws2Data: any[][] = [
    [`2. LISTADO DETALLADO DE CUENTAS COBRADAS (${dailyHistory.length} CUENTAS)`],
    [`Orden Cronológico | Cuentas Registradas: ${dailyHistory.length} | Filtros Excel Activados`],
    ['# Consec.', 'Folio Cuenta', 'Folio Interno Comandas', 'Fecha / Hora Cierre', 'Mesa', 'Método de Pago', 'Factura', 'Total Cobrado ($)']
  ];

  dailyHistory.forEach((h, idx) => {
    const consecutive = dailyHistory.length - idx;
    const foliosInternos = formatAccountComandaFolios(h);
    const timeStr = h.timestamp instanceof Date ? h.timestamp.toLocaleString() : (typeof h.timestamp === 'string' ? h.timestamp : new Date(h.timestamp).toLocaleString());
    const invStr = h.requiresInvoice ? (h.invoicePhone ? `Sí (${h.invoicePhone})` : "Sí") : "No";
    ws2Data.push([
      `#${consecutive}`,
      h.folio || `CUT-${consecutive}`,
      foliosInternos,
      timeStr,
      h.tableLabel || "N/A",
      h.paymentMethod || "Efectivo",
      invStr,
      Number(Number(h.total || 0).toFixed(2))
    ]);
  });

  ws2Data.push([`TOTAL DE CUENTAS (${dailyHistory.length}):`, '', '', '', '', '', '', Number(totalAccounts.toFixed(2))]);
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: ws2Data.length - 1, c: 0 }, e: { r: ws2Data.length - 1, c: 6 } }
  ];
  ws2['!autofilter'] = { ref: `A3:H${dailyHistory.length + 3}` };
  ws2['!cols'] = [{ wch: 10 }, { wch: 16 }, { wch: 24 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Cuentas');

  // 3. PESTAÑA: PRODUCTOS
  const ws3Data: any[][] = [
    [`3. CATÁLOGO GENERAL DE PRODUCTOS Y RENDIMIENTO (${soldCatalogCount} Con Venta / ${unsoldCatalogCount} Sin Venta)`],
    [`Orden de Catálogo | Total Productos: ${sortedDirectCatalog.length} | Filtros Excel Activados`],
    ['# Orden', 'Producto / Platillo', 'Categoría / Subgrupo', 'Precio Lista ($)', 'Estado en Ventas', 'Cant. Vendida', 'Total Recaudado ($)']
  ];

  sortedDirectCatalog.forEach((prod, idx) => {
    const orderNum = prod.sortOrder !== undefined && prod.sortOrder !== null && prod.sortOrder !== 9999 
      ? prod.sortOrder 
      : (prod.consecutive || (idx + 1));
    const liveName = getProductReportName(prod);
    const category = (prod.subgroup || prod.subcategory || "OTROS").toUpperCase().trim();
    const sold = soldMap[String(prod.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(prod.name || "").toLowerCase().trim()] || { quantity: 0, total: 0 };
    const priceVal = Number(prod.price || 0);

    ws3Data.push([
      orderNum,
      liveName,
      category,
      Number(priceVal.toFixed(2)),
      sold.quantity > 0 ? `🟢 SÍ VENDIDO (${sold.quantity})` : '⚪ SIN VENTAS (0)',
      sold.quantity,
      Number(sold.total.toFixed(2))
    ]);
  });

  ws3Data.push([`TOTAL GENERAL PRODUCTOS (${totalSoldPieces} PIEZAS VENDIDAS):`, '', '', '', '', totalSoldPieces, Number(totalProducts.toFixed(2))]);
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: ws3Data.length - 1, c: 0 }, e: { r: ws3Data.length - 1, c: 4 } }
  ];
  ws3['!autofilter'] = { ref: `A3:G${sortedDirectCatalog.length + 3}` };
  ws3['!cols'] = [{ wch: 10 }, { wch: 38 }, { wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Productos');

  // 4. PESTAÑA: CANCELACIONES
  const ws4Data: any[][] = [
    [`4. REGISTRO DETALLADO DE CANCELACIONES Y ANULACIONES (${dailyCancellations.length} REGISTROS)`],
    [`Total de Cancelaciones: ${dailyCancellations.length} registros | Monto Cancelado: $${totalCancellations.toFixed(2)} | Filtros Excel Activados`],
    ['# Consec.', 'Folio', 'Tipo', 'Fecha / Hora', 'Mesa', 'Producto / Concepto', 'Cantidad', 'Motivo de Cancelación', 'Autorizado Por', 'Total Cancelado ($)']
  ];

  dailyCancellations.forEach((item, index) => {
    const consecutive = dailyCancellations.length - index;
    const timeStr = item.timestamp instanceof Date ? item.timestamp.toLocaleString() : (typeof item.timestamp === 'string' ? item.timestamp : new Date(item.timestamp).toLocaleString());
    ws4Data.push([
      `#${consecutive}`,
      item.folio,
      item.type === 'cuenta' ? 'Cuenta Completa' : 'Producto',
      timeStr,
      item.tableLabel,
      item.description,
      item.quantity,
      item.reason,
      item.user,
      Number(Number(item.total || 0).toFixed(2))
    ]);
  });

  ws4Data.push([`TOTAL CANCELACIONES (${dailyCancellations.length} REGISTROS):`, '', '', '', '', '', '', '', '', Number(totalCancellations.toFixed(2))]);
  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
  ws4['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: ws4Data.length - 1, c: 0 }, e: { r: ws4Data.length - 1, c: 8 } }
  ];
  ws4['!autofilter'] = { ref: `A3:J${dailyCancellations.length + 3}` };
  ws4['!cols'] = [{ wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 10 }, { wch: 32 }, { wch: 12 }, { wch: 28 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Cancelaciones');

  // Trigger download of real .xlsx file
  const filename = `ReporteDiario_${cleanCompany}_${todayOperatingDay}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export async function generateAndSendExcelDailyReportToWhatsApp(
  history: any[],
  products: any[] = [],
  targetDate?: string,
  tenant?: any,
  ticketBusinessName?: string
): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
  try {
    const todayOperatingDay = targetDate || getOperatingDay(new Date());
    const friendlyTitleDate = getFriendlyTitleDate(todayOperatingDay);
    const companyName = ticketBusinessName || tenant?.name || "Cocinet App";
    const cleanCompany = (companyName || "Cocinet").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `ReporteDiario_${cleanCompany}_${todayOperatingDay}.xlsx`;

    const processed = processDailyReportData(history || [], products || [], targetDate);
    const {
      dailyHistory,
      dailyCancellations,
      paymentBreakdown,
      totalProducts,
      totalAccounts,
      totalCancellations,
      totalSoldPieces,
      sortedDirectCatalog,
      soldMap,
      soldCatalogCount,
      unsoldCatalogCount,
    } = processed;

    const wb = XLSX.utils.book_new();

    // 1. DASHBOARD
    let rIdx = 13;
    const ws1Data: any[][] = [
      [`📊 REPORTE DIARIO DE OPERACIÓN Y VENTAS - ${companyName.toUpperCase()}`],
      [`Fecha de Operación: ${friendlyTitleDate} (Día Contable: ${todayOperatingDay}) | Generado: ${new Date().toLocaleString()}`],
      [''],
      ['1. RESUMEN FINANCIERO Y FORMAS DE PAGO'],
      ['Concepto / Canal', '', 'Monto Recaudado ($)', '', '% Participación', '', 'Notas / Detalle', ''],
      ['💵 Efectivo en Caja', '', Number(paymentBreakdown.cash.toFixed(2)), '', totalAccounts > 0 ? `${((paymentBreakdown.cash / totalAccounts) * 100).toFixed(1)}%` : '0%', '', 'Cobros en efectivo', ''],
      ['💳 Tarjetas Bancarias', '', Number(paymentBreakdown.card.toFixed(2)), '', totalAccounts > 0 ? `${((paymentBreakdown.card / totalAccounts) * 100).toFixed(1)}%` : '0%', '', 'Terminal TPV', ''],
      ['📲 Transferencias', '', Number(paymentBreakdown.transfer.toFixed(2)), '', totalAccounts > 0 ? `${((paymentBreakdown.transfer / totalAccounts) * 100).toFixed(1)}%` : '0%', '', 'SPEI / QR', ''],
      ['🏷️ Descuentos', '', Number((-paymentBreakdown.discount).toFixed(2)), '', '', '', 'Deducciones', ''],
      ['TOTAL GENERAL NETO:', '', Number((totalProducts - paymentBreakdown.discount).toFixed(2)), '', '100%', '', 'Arqueo Cuadrado', ''],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dashboard');

    // 2. CUENTAS
    const ws2Data: any[][] = [
      [`2. LISTADO DETALLADO DE CUENTAS COBRADAS (${dailyHistory.length} CUENTAS)`],
      [`Orden Cronológico | Cuentas Registradas: ${dailyHistory.length} | Filtros Excel Activados`],
      ['# Consec.', 'Folio Cuenta', 'Folio Interno Comandas', 'Fecha / Hora Cierre', 'Mesa', 'Método de Pago', 'Factura', 'Total Cobrado ($)']
    ];
    dailyHistory.forEach((h, idx) => {
      const consecutive = dailyHistory.length - idx;
      const foliosInternos = formatAccountComandaFolios(h);
      const timeStr = h.timestamp instanceof Date ? h.timestamp.toLocaleString() : (typeof h.timestamp === 'string' ? h.timestamp : new Date(h.timestamp).toLocaleString());
      const invStr = h.requiresInvoice ? (h.invoicePhone ? `Sí (${h.invoicePhone})` : "Sí") : "No";
      ws2Data.push([
        `#${consecutive}`,
        h.folio || `CUT-${consecutive}`,
        foliosInternos,
        timeStr,
        h.tableLabel || "N/A",
        h.paymentMethod || "Efectivo",
        invStr,
        Number(Number(h.total || 0).toFixed(2))
      ]);
    });
    ws2Data.push([`TOTAL DE CUENTAS (${dailyHistory.length}):`, '', '', '', '', '', '', Number(totalAccounts.toFixed(2))]);
    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Cuentas');

    // 3. PRODUCTOS
    const ws3Data: any[][] = [
      [`3. CATÁLOGO GENERAL DE PRODUCTOS Y RENDIMIENTO (${soldCatalogCount} Con Venta / ${unsoldCatalogCount} Sin Venta)`],
      [`Orden de Catálogo | Total Productos: ${sortedDirectCatalog.length} | Filtros Excel Activados`],
      ['# Orden', 'Producto / Platillo', 'Categoría / Subgrupo', 'Precio Lista ($)', 'Estado en Ventas', 'Cant. Vendida', 'Total Recaudado ($)']
    ];
    sortedDirectCatalog.forEach((prod, idx) => {
      const orderNum = prod.sortOrder !== undefined && prod.sortOrder !== null && prod.sortOrder !== 9999 
        ? prod.sortOrder 
        : (prod.consecutive || (idx + 1));
      const liveName = getProductReportName(prod);
      const category = (prod.subgroup || prod.subcategory || "OTROS").toUpperCase().trim();
      const sold = soldMap[String(prod.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(prod.name || "").toLowerCase().trim()] || { quantity: 0, total: 0 };
      const priceVal = Number(prod.price || 0);

      ws3Data.push([
        orderNum,
        liveName,
        category,
        Number(priceVal.toFixed(2)),
        sold.quantity > 0 ? `🟢 SÍ VENDIDO (${sold.quantity})` : '⚪ SIN VENTAS (0)',
        sold.quantity,
        Number(sold.total.toFixed(2))
      ]);
    });
    ws3Data.push([`TOTAL GENERAL PRODUCTOS (${totalSoldPieces} PIEZAS VENDIDAS):`, '', '', '', '', totalSoldPieces, Number(totalProducts.toFixed(2))]);
    const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Productos');

    // 4. CANCELACIONES
    const ws4Data: any[][] = [
      [`4. REGISTRO DETALLADO DE CANCELACIONES Y ANULACIONES (${dailyCancellations.length} REGISTROS)`],
      [`Total de Cancelaciones: ${dailyCancellations.length} registros | Monto Cancelado: $${totalCancellations.toFixed(2)} | Filtros Excel Activados`],
      ['# Consec.', 'Folio', 'Tipo', 'Fecha / Hora', 'Mesa', 'Producto / Concepto', 'Cantidad', 'Motivo de Cancelación', 'Autorizado Por', 'Total Cancelado ($)']
    ];
    dailyCancellations.forEach((item, index) => {
      const consecutive = dailyCancellations.length - index;
      const timeStr = item.timestamp instanceof Date ? item.timestamp.toLocaleString() : (typeof item.timestamp === 'string' ? item.timestamp : new Date(item.timestamp).toLocaleString());
      ws4Data.push([
        `#${consecutive}`,
        item.folio,
        item.type === 'cuenta' ? 'Cuenta Completa' : 'Producto',
        timeStr,
        item.tableLabel,
        item.description,
        item.quantity,
        item.reason,
        item.user,
        Number(Number(item.total || 0).toFixed(2))
      ]);
    });
    ws4Data.push([`TOTAL CANCELACIONES (${dailyCancellations.length} REGISTROS):`, '', '', '', '', '', '', '', '', Number(totalCancellations.toFixed(2))]);
    const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Cancelaciones');

    // 5. Convertir a Blob y Subir a Firebase Storage
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    let storageDownloadUrl = "";
    try {
      await ensureFirebaseAuth();
      const storageRef = ref(storage, `reportes_excel/${cleanCompany}/${filename}`);
      const snapshot = await uploadBytes(storageRef, excelBlob, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      storageDownloadUrl = await getDownloadURL(snapshot.ref);
      console.log("✅ Excel subido a Firebase Storage:", storageDownloadUrl);
    } catch (sErr) {
      console.warn("No se pudo subir el archivo Excel a Firebase Storage:", sErr);
    }

    // 6. Construir enlace de descarga garantizado (Storage o Web POS)
    const tenantId = tenant?.id || "tenant-1";
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const publicBase = isLocal ? "http://localhost:3000" : (typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://cocinet-prueba.web.app");
    const cleanPath = typeof window !== "undefined" && window.location.pathname && window.location.pathname !== "/" ? window.location.pathname : "";
    const directWebDownloadUrl = `${publicBase}${cleanPath}?download=excel&tenant=${tenantId}&date=${todayOperatingDay}`;

    const downloadLinkToUse = storageDownloadUrl || directWebDownloadUrl;

    // 7. Construir mensaje de WhatsApp con enlace clickeable
    let excelMsg = `📊 *REPORTE DIARIO EN EXCEL (.XLSX)*\n`;
    excelMsg += `🏢 *${companyName.toUpperCase()}*\n`;
    excelMsg += `📅 *Fecha:* ${friendlyTitleDate}\n`;
    excelMsg += `📁 *Archivo:* ${filename}\n`;
    excelMsg += `💰 *Venta Neta:* $${(totalProducts - paymentBreakdown.discount).toFixed(2)}\n`;
    excelMsg += `💵 *Efectivo:* $${paymentBreakdown.cash.toFixed(2)} | 💳 *Tarjetas:* $${paymentBreakdown.card.toFixed(2)} | 📲 *Transf:* $${paymentBreakdown.transfer.toFixed(2)}\n`;
    if (dailyCancellations.length > 0) {
      excelMsg += `❌ *Cancelaciones (${dailyCancellations.length}):* $${totalCancellations.toFixed(2)}\n`;
    }
    excelMsg += `📦 *Piezas Vendidas:* ${totalSoldPieces} piezas\n\n`;

    excelMsg += `📥 *Descargar Archivo Excel Oficial (.xlsx):*\n\n${downloadLinkToUse}\n\n`;
    excelMsg += `_Toca el enlace para descargar el archivo Excel con sus 4 hojas (Dashboard, Cuentas, Productos, Cancelaciones)._\n\n`;
    excelMsg += `_Enviado silenciosamente por Cocinet POS._`;

    // 7. Enviar a destinatarios
    const tenantUsers = getTenantUsers(tenant?.id || "tenant-1");
    const recipients = tenantUsers.filter(
      (u) =>
        (u.isReportRecipient ||
          u.id.endsWith("-admin") ||
          u.id.endsWith("-manager") ||
          u.id.endsWith("-sistemas") ||
          u.role === "admin" ||
          u.role === "owner") &&
        u.phone
    );

    if (recipients.length > 0) {
      for (const r of recipients) {
        if (r.phone) {
          sendSilentWhatsAppMessage(r.phone, excelMsg).catch((e) =>
            console.warn("Error enviando Excel por WhatsApp:", e)
          );
        }
      }
    }

    return { success: true, url: storageDownloadUrl, filename };
  } catch (err: any) {
    console.error("Error generando/enviando Excel:", err);
    return { success: false, error: err.message || String(err) };
  }
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
        // Enviar 3: Archivo Excel en Firebase Storage
        setTimeout(() => {
          generateAndSendExcelDailyReportToWhatsApp(history, products, operatingDay, tenant, ticketBusinessName).catch((e) =>
            console.error("Error auto 5am silent excel:", e)
          );
        }, 3000);
      });
    }
  }
}