import React, { useState, useMemo } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonButtons
} from '@ionic/react';
import { closeOutline, downloadOutline, listOutline, restaurantOutline, logoWhatsapp, closeCircleOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';
import { getOperatingDay, getProductReportName, getProductSortScore, SUBCATEGORY_ORDER } from '../utils/appHelpers';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  targetDate?: string;
  companyName?: string;
  products?: any[];
}

const formatTime = (ts: any) => {
  const date = ts instanceof Date ? ts : new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getRowClass = (h: any) => {
  let classes = "border-b p-2";
  if (h.requiresInvoice) classes += " bg-yellow-100";
  const pm = (h.paymentMethod || "Efectivo").toLowerCase();
  
  if (pm === 'upay') classes += " bg-green-200";
  else if (['card', 'debit', 'transfer'].includes(pm)) classes += " bg-green-100";
  else if (pm.includes('cortes')) classes += " bg-purple-100"; // For cortesía
  
  return classes;
};

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose, history, targetDate, companyName = "Cocinet App", products = [] }) => {
  const [tab, setTab] = useState<'cuentas' | 'productos' | 'cancelaciones'>('cuentas');
  
  const todayOperatingDay = useMemo(() => targetDate || getOperatingDay(new Date()), [targetDate]);

  const friendlyTitleDate = useMemo(() => {
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
  }, [todayOperatingDay]);

  const dailyHistory = useMemo(() => {
    const filtered = history.filter(h => {
        if (h.status === "cancelled") return false;
        const accountDate = h.timestamp instanceof Date ? h.timestamp : new Date(h.timestamp);
        return getOperatingDay(accountDate) === todayOperatingDay;
    });
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  }, [history, todayOperatingDay]);

  const dailyCancellations = useMemo(() => {
    const list: Array<{
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

    history.forEach(h => {
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
        list.push({
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
              list.push({
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

    return list.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  }, [history, todayOperatingDay, products]);

  const totalCancellations = useMemo(() => {
    return dailyCancellations.reduce((sum, item) => sum + item.total, 0);
  }, [dailyCancellations]);

  const productSummary = useMemo(() => {
    const summary: Record<string, { name: string, quantity: number, total: number, product: any }> = {};
    dailyHistory.forEach(account => {
      (account.comandas || []).forEach((comanda: any) => {
        (comanda.items || []).forEach((item: any) => {
          if (item.isCancelled) return;
          const key = item.product.id;
          const liveProduct = products.find(p => String(p.id) === String(item.product.id)) || 
                              products.find(p => (p.name || "").toLowerCase().trim() === (item.product.name || "").toLowerCase().trim()) || 
                              item.product;
          if (!summary[key]) {
            summary[key] = { name: getProductReportName(liveProduct), quantity: 0, total: 0, product: liveProduct };
          }
          summary[key].quantity += item.quantity;
          summary[key].total += item.quantity * (item.product?.price || 0);
        });
      });
    });
    return Object.values(summary).sort((a, b) => {
      const scoreA = getProductSortScore(a.product);
      const scoreB = getProductSortScore(b.product);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name);
    });
  }, [dailyHistory, products]);

  const groupedFullCatalog = useMemo(() => {
    const soldMap: Record<string, { quantity: number, total: number }> = {};
    productSummary.forEach(p => {
      if (p.product?.id) soldMap[String(p.product.id)] = { quantity: p.quantity, total: p.total };
      soldMap[(p.name || "").toLowerCase().trim()] = { quantity: p.quantity, total: p.total };
    });

    const groups: Record<string, Array<{
      name: string;
      price: number;
      quantitySold: number;
      totalSold: number;
      product: any;
    }>> = {};

    (products || []).forEach(prod => {
      const groupKey = (prod.subgroup || prod.subcategory || "OTROS").toUpperCase().trim();
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      const liveName = getProductReportName(prod);
      const sold = soldMap[String(prod.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(prod.name || "").toLowerCase().trim()] || { quantity: 0, total: 0 };
      groups[groupKey].push({
        name: liveName,
        price: Number(prod.price || 0),
        quantitySold: sold.quantity,
        totalSold: sold.total,
        product: prod
      });
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const scoreA = getProductSortScore(a.product);
        const scoreB = getProductSortScore(b.product);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.name.localeCompare(b.name);
      });
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
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

    return sortedKeys.map(key => ({
      groupName: key,
      items: groups[key]
    }));
  }, [products, productSummary]);

  const totalAccounts = useMemo(() => dailyHistory.reduce((sum, h) => sum + (h.total || 0), 0), [dailyHistory]);
  const totalProducts = useMemo(() => productSummary.reduce((sum, p) => sum + p.total, 0), [productSummary]);

  const groupedProducts = useMemo(() => {
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

    const sortedKeys = Object.keys(groups).sort((a, b) => {
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

    return sortedKeys.map(key => ({
      groupName: key,
      items: groups[key]
    }));
  }, [productSummary]);

  const paymentBreakdown = useMemo(() => {
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

    return { cash, card, transfer, lupay, cortesia, discount };
  }, [dailyHistory]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const cleanCompany = (companyName || "Cocinet")
      .replace(/[^a-zA-Z0-9\s_-]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    // Helper to style worksheet headers & banners professionally
    const formatWorksheet = (ws: XLSX.WorkSheet, headerRowIdx: number = 6) => {
      Object.keys(ws).forEach((key) => {
        if (key.startsWith("!")) return;
        const col = key.replace(/[0-9]/g, "");
        const row = parseInt(key.replace(/[^0-9]/g, ""), 10);
        const cell = ws[key];
        if (!cell) return;

        if (!cell.s) cell.s = {};

        // Row 1: Company / Branch Title Banner
        if (row === 1) {
          cell.s = {
            fill: { fgColor: { rgb: "1E3A8A" } },
            font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
        // Row 2: Subtitle Banner
        else if (row === 2) {
          cell.s = {
            fill: { fgColor: { rgb: "2563EB" } },
            font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
        // Row 3 & 4: Date & Time Info
        else if (row === 3 || row === 4) {
          cell.s = {
            fill: { fgColor: { rgb: "F1F5F9" } },
            font: { name: "Calibri", sz: 10, italic: row === 4, color: { rgb: "334155" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
        // Header Row (Row 6)
        else if (row === headerRowIdx) {
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
    accountsAOA.push([]); // Empty row
    
    // Header Row (Row 6)
    accountsAOA.push([
      "CONSECUTIVO",
      "FOLIO",
      "COMANDAS",
      "FECHA / HORA DE CIERRE",
      "MESA",
      "MÉTODO DE PAGO",
      "REQUIERE FACTURA",
      "TOTAL COBRADO"
    ]);

    const N = dailyHistory.length;

    // Data Rows
    dailyHistory.forEach((h, index) => {
      const consecutive = dailyHistory.length - index;
      accountsAOA.push([
        `#${consecutive}`,
        h.folio,
        (h.comandas || []).map((c: any) => c.folio).join(", "),
        h.timestamp instanceof Date ? h.timestamp.toLocaleString() : h.timestamp,
        h.tableLabel || "N/A",
        h.paymentMethod || "Efectivo",
        h.requiresInvoice ? "Sí" : "No",
        h.total
      ]);
    });

    // Blank row
    accountsAOA.push([]);

    // Payment breakdown (placed in adjacent columns A & B to eliminate 7-column gaps)
    const desgloseStartRow = accountsAOA.length + 1;
    accountsAOA.push(["SECTION_HEADER:DESGLOSE POR FORMA DE PAGO", "MONTO RECAUDADO"]);
    accountsAOA.push(["💵 EFECTIVO", paymentBreakdown.cash]);
    accountsAOA.push(["💳 TARJETA CRÉDITO / DÉBITO", paymentBreakdown.card]);
    accountsAOA.push(["📲 TRANSFERENCIA INTERBANCARIA", paymentBreakdown.transfer]);
    accountsAOA.push(["⚡ COBRO LUPAY", paymentBreakdown.lupay]);
    accountsAOA.push(["💜 CORTESÍA / EMPLEADOS", paymentBreakdown.cortesia]);
    accountsAOA.push(["🏷️ DESCUENTOS APLICADOS", paymentBreakdown.discount]);

    accountsAOA.push([]);

    // Summary totals (placed in adjacent columns A & B)
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
      { wch: 35 }, // Consecutivo / Forma de pago
      { wch: 22 }, // Folio / Monto
      { wch: 35 }, // Comandas
      { wch: 25 }, // Fecha
      { wch: 12 }, // Mesa
      { wch: 20 }, // Pago
      { wch: 18 }, // Factura
      { wch: 20 }  // Total
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
      // Style Section Headers in column A for desglose/totals
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
    productsAOA.push([]); // Empty row

    // Header (Row 6)
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
      { wch: 50 }, // Producto
      { wch: 20 }, // Cantidad
      { wch: 20 }  // Total
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
      "MESA",
      "PRODUCTO / CONCEPTO",
      "CANTIDAD",
      "MOTIVO DE CANCELACIÓN",
      "AUTORIZADO POR",
      "TOTAL CANCELADO"
    ]);

    const numCancels = dailyCancellations.length;
    dailyCancellations.forEach((item, index) => {
      const consecutive = numCancels - index;
      cancellationsAOA.push([
        `#${consecutive}`,
        item.folio,
        item.type === 'cuenta' ? "Cuenta Completa" : "Producto",
        item.timestamp instanceof Date ? item.timestamp.toLocaleString() : new Date(item.timestamp).toLocaleString(),
        item.tableLabel,
        item.description,
        item.quantity,
        item.reason,
        item.user,
        item.total
      ]);
    });

    cancellationsAOA.push([]);
    cancellationsAOA.push([
      "TOTAL DE CANCELACIONES",
      "", "", "", "", "", "", "", "",
      { t: "n", f: `SUM(J7:J${6 + numCancels})` }
    ]);

    const wsCancellations = XLSX.utils.aoa_to_sheet(cancellationsAOA);
    wsCancellations['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } }
    ];
    wsCancellations['!cols'] = [
      { wch: 14 }, // Consecutivo
      { wch: 14 }, // Folio
      { wch: 18 }, // Tipo
      { wch: 22 }, // Fecha
      { wch: 12 }, // Mesa
      { wch: 35 }, // Producto/Concepto
      { wch: 12 }, // Cantidad
      { wch: 30 }, // Motivo
      { wch: 22 }, // Autorizado
      { wch: 18 }  // Total
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

    // ==================== SHEET 4: PRODUCTOS DE LISTA (CATÁLOGO CON COLORES VENDIDO/NO VENDIDO) ====================
    const catalogAOA: any[][] = [];
    catalogAOA.push([`${companyName.toUpperCase()} - CATÁLOGO GENERAL DE PRODUCTOS`]);
    catalogAOA.push(["LISTADO COMPLETO DE PRODUCTOS Y ESTADO DE VENTAS DEL DÍA"]);
    catalogAOA.push([`FECHA DE CONSULTA: ${friendlyTitleDate}`]);
    catalogAOA.push([`EMITIDO POR: COCINET POS SYSTEM - HORA: ${new Date().toLocaleTimeString()}`]);
    catalogAOA.push([]); // Empty row

    // Header Row (Row 6)
    catalogAOA.push(["PRODUCTO / PLATILLO", "PRECIO LISTA", "ESTADO EN VENTAS", "CANT. VENDIDA", "TOTAL RECAUDADO"]);

    // Track rows that represent sold products vs unsold products for cell background color fill
    const soldRowIndices: Set<number> = new Set();
    const unsoldRowIndices: Set<number> = new Set();
    const groupHeaderRowIndices: Set<number> = new Set();

    groupedFullCatalog.forEach(group => {
      catalogAOA.push([]);
      const groupRowIdx = catalogAOA.length;
      groupHeaderRowIndices.add(groupRowIdx);
      catalogAOA.push([`GROUP_HEADER:📂 ${group.groupName.toUpperCase()}`, "", "", "", ""]);
      
      group.items.forEach(p => {
        const itemRowIdx = catalogAOA.length + 1; // 1-indexed Excel row
        if (p.quantitySold > 0) {
          soldRowIndices.add(itemRowIdx);
          catalogAOA.push([p.name, p.price, `🟢 SÍ VENDIDO (${p.quantitySold})`, p.quantitySold, p.totalSold]);
        } else {
          unsoldRowIndices.add(itemRowIdx);
          catalogAOA.push([p.name, p.price, "⚪ SIN VENTAS (0)", 0, 0]);
        }
      });
    });

    const M = catalogAOA.length;

    catalogAOA.push([]);
    catalogAOA.push(["TOTAL GENERAL DEL CATÁLOGO", "", "", { t: "n", f: `SUM(D7:D${M})` }, { t: "n", f: `SUM(E7:E${M})` }]);

    const wsCatalog = XLSX.utils.aoa_to_sheet(catalogAOA);
    wsCatalog['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }
    ];
    wsCatalog['!cols'] = [
      { wch: 45 }, // Producto
      { wch: 16 }, // Precio Lista
      { wch: 22 }, // Estado en Ventas
      { wch: 18 }, // Cant Vendida
      { wch: 20 }  // Total Recaudado
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
        if (col === 'B' || col === 'E') {
          cell.z = '$#,##0.00';
        } else if (col === 'D') {
          cell.z = '#,##0.0';
        }
      }

      // Format Group Headers
      if (typeof cell.v === 'string' && cell.v.startsWith('GROUP_HEADER:')) {
        cell.v = cell.v.replace('GROUP_HEADER:', '');
        cell.s = {
          fill: { fgColor: { rgb: "E0E7FF" } },
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "1E1B4B" } }
        };
      }
      // Format Sold Rows (Soft Light Green Fill)
      else if (soldRowIndices.has(row)) {
        cell.s = {
          fill: { fgColor: { rgb: "D1FAE5" } }, // Emerald light green background
          font: { name: "Calibri", sz: 10, color: { rgb: "065F46" }, bold: col === 'A' || col === 'C' }
        };
      }
      // Format Unsold Rows (Soft Light Gray Fill)
      else if (unsoldRowIndices.has(row)) {
        cell.s = {
          fill: { fgColor: { rgb: "F3F4F6" } }, // Neutral light gray background
          font: { name: "Calibri", sz: 10, color: { rgb: "6B7280" } }
        };
      }
    });

    formatWorksheet(wsCatalog);
    XLSX.utils.book_append_sheet(wb, wsCatalog, "Productos de Lista");

    const exportFilename = `ReporteDiario_${cleanCompany}_${todayOperatingDay}.xlsx`;
    XLSX.writeFile(wb, exportFilename);
  };

  const sendToWhatsApp = () => {
    let text = `🏪 *${companyName.toUpperCase()}*\n`;
    text += `📊 *REPORTE DIARIO DE VENTAS*\n`;
    text += `📅 *Fecha:* ${friendlyTitleDate}\n`;
    text += `----------------------------------\n\n`;

    text += `💰 *RESUMEN DE CUENTAS*\n`;
    text += `• Total Cuentas Cobradas: *${dailyHistory.length}*\n\n`;

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

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{
        "--width": "100%",
        "--height": "100%",
        "--max-width": "100%",
        "--max-height": "100%",
        "--border-radius": "0px",
      }}
    >
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Reporte Diario: {friendlyTitleDate}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}><IonIcon icon={closeOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={tab} onIonChange={e => setTab(e.detail.value as any)}>
            <IonSegmentButton value="cuentas"><IonIcon icon={listOutline} /> Cuentas</IonSegmentButton>
            <IonSegmentButton value="productos"><IonIcon icon={restaurantOutline} /> Productos</IonSegmentButton>
            <IonSegmentButton value="cancelaciones"><IonIcon icon={closeCircleOutline} /> Cancelaciones ({dailyCancellations.length})</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent className="p-4">
        {tab === 'cuentas' ? (
          <IonGrid className="w-full">
            <IonRow className="sticky top-0 z-10 border-b font-bold bg-slate-100 p-2">
              <IonCol>Folio / Comanda</IonCol>
              <IonCol>Hora</IonCol>
              <IonCol>Mesa</IonCol>
              <IonCol>Pago</IonCol>
              <IonCol>Factura</IonCol>
              <IonCol className="text-right">Total</IonCol>
            </IonRow>
            {dailyHistory.map((h, index) => {
              const consecutive = dailyHistory.length - index;
              return (
                <IonRow key={h.id} className={getRowClass(h)}>
                  <IonCol>
                    <div className="font-bold text-slate-800">#{consecutive}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Folio: {h.folio}</div>
                    <div className="text-[10px] text-indigo-600 mt-0.5 font-semibold">
                      Cda: {(h.comandas || []).map((c: any) => c.folio).join(", ")}
                    </div>
                  </IonCol>
                  <IonCol>{formatTime(h.timestamp)}</IonCol>
                  <IonCol>{h.tableLabel || "-"}</IonCol>
                  <IonCol>{h.paymentMethod || "Efectivo"}</IonCol>
                  <IonCol>{h.requiresInvoice ? "Sí" : "No"}</IonCol>
                  <IonCol className="text-right">${(h.total || 0).toFixed(2)}</IonCol>
                </IonRow>
              );
            })}
          </IonGrid>
        ) : tab === 'productos' ? (
          <IonGrid className="w-full">
            <IonRow className="sticky top-0 z-10 border-b font-bold bg-slate-100 p-2">
              <IonCol>Producto</IonCol>
              <IonCol className="text-center">Cant.</IonCol>
              <IonCol className="text-right">Total</IonCol>
            </IonRow>
            {groupedProducts.map(group => (
              <React.Fragment key={group.groupName}>
                <IonRow className="bg-slate-200/50 p-2 font-bold text-xs text-slate-700 uppercase tracking-wider">
                  <IonCol size="12">{group.groupName}</IonCol>
                </IonRow>
                {group.items.map(p => (
                  <IonRow key={p.name} className="border-b p-2">
                    <IonCol>{p.name}</IonCol>
                    <IonCol className="text-center">{p.quantity}</IonCol>
                    <IonCol className="text-right">${p.total.toFixed(2)}</IonCol>
                  </IonRow>
                ))}
              </React.Fragment>
            ))}
          </IonGrid>
        ) : (
          <IonGrid className="w-full">
            <IonRow className="sticky top-0 z-10 border-b font-bold bg-rose-100 p-2 text-rose-900">
              <IonCol size="2">Folio / Tipo</IonCol>
              <IonCol size="2">Hora / Mesa</IonCol>
              <IonCol size="3">Descripción / Producto</IonCol>
              <IonCol size="1" className="text-center">Cant.</IonCol>
              <IonCol size="2">Motivo / Por</IonCol>
              <IonCol size="2" className="text-right">Total</IonCol>
            </IonRow>
            {dailyCancellations.length === 0 ? (
              <IonRow className="p-6 text-center text-slate-500 font-medium">
                <IonCol size="12">✨ No hay cancelaciones registradas en este día.</IonCol>
              </IonRow>
            ) : (
              dailyCancellations.map((c, index) => {
                const consecutive = dailyCancellations.length - index;
                return (
                  <IonRow key={c.id} className="border-b p-2 bg-rose-50/50 hover:bg-rose-50 text-xs">
                    <IonCol size="2">
                      <div className="font-bold text-rose-800">#{consecutive} - Folio: {c.folio}</div>
                      <div className="text-[10px] text-rose-600 font-semibold uppercase">{c.type === 'cuenta' ? 'Cuenta Completa' : 'Producto'}</div>
                    </IonCol>
                    <IonCol size="2">
                      <div>{formatTime(c.timestamp)}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{c.tableLabel}</div>
                    </IonCol>
                    <IonCol size="3" className="font-semibold text-slate-800">
                      {c.description}
                    </IonCol>
                    <IonCol size="1" className="text-center font-bold">
                      {c.quantity}
                    </IonCol>
                    <IonCol size="2">
                      <div className="italic text-slate-600">{c.reason}</div>
                      <div className="text-[10px] text-slate-400">Por: {c.user}</div>
                    </IonCol>
                    <IonCol size="2" className="text-right font-bold text-rose-700 text-sm">
                      ${c.total.toFixed(2)}
                    </IonCol>
                  </IonRow>
                );
              })
            )}
          </IonGrid>
        )}
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonButton expand="block" color="success" onClick={sendToWhatsApp}>
                  <IonIcon icon={logoWhatsapp} slot="start" /> WhatsApp 💬
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton expand="block" onClick={exportToExcel}>
                  <IonIcon icon={downloadOutline} slot="start" /> Excel 📊
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow className="border-t pt-2 mt-1">
              <IonCol size="12" className="text-center font-black text-[10px] text-slate-500 uppercase tracking-widest">
                Desglose por Forma de Pago
              </IonCol>
            </IonRow>
            <IonRow className="text-xs text-slate-600 px-2 font-semibold">
              <IonCol size="6" className="text-left">
                💵 Efec: <strong>${paymentBreakdown.cash.toFixed(2)}</strong>
              </IonCol>
              <IonCol size="6" className="text-right">
                💳 Tarj: <strong>${paymentBreakdown.card.toFixed(2)}</strong>
              </IonCol>
              <IonCol size="6" className="text-left">
                📲 Transf: <strong>${paymentBreakdown.transfer.toFixed(2)}</strong>
              </IonCol>
              <IonCol size="6" className="text-right">
                ⚡ LUPAY: <strong>${paymentBreakdown.lupay.toFixed(2)}</strong>
              </IonCol>
              <IonCol size="6" className="text-left text-purple-700">
                💜 Cort/Emp: <strong>${paymentBreakdown.cortesia.toFixed(2)}</strong>
              </IonCol>
              <IonCol size="6" className="text-right text-rose-600">
                🏷️ Desctos: <strong>${paymentBreakdown.discount.toFixed(2)}</strong>
              </IonCol>
            </IonRow>
            <IonRow className="border-t pt-2 mt-2">
              <IonCol className="text-center">
                <IonLabel style={{ fontWeight: "bold" }}>Total Cuentas: ${totalAccounts.toFixed(2)}</IonLabel>
                <br />
                <IonLabel style={{ fontWeight: "bold" }}>Total Productos: ${totalProducts.toFixed(2)}</IonLabel>
                {dailyCancellations.length > 0 && (
                  <>
                    <br />
                    <IonLabel className="text-rose-600 font-extrabold" style={{ fontSize: "0.9rem" }}>
                      ❌ Total Cancelaciones ({dailyCancellations.length}): ${totalCancellations.toFixed(2)}
                    </IonLabel>
                  </>
                )}
                {paymentBreakdown.discount > 0 && (
                  <>
                    <br />
                    <IonLabel className="text-rose-600 font-semibold" style={{ fontSize: "0.85rem" }}>
                      (-) Descuentos Aplicados: -${paymentBreakdown.discount.toFixed(2)}
                    </IonLabel>
                    <br />
                    <IonLabel style={{ fontWeight: "bold", color: "#059669" }}>
                      Total Productos (Ajustado): ${(totalProducts - paymentBreakdown.discount).toFixed(2)}
                    </IonLabel>
                  </>
                )}
                {Math.abs(totalAccounts - (totalProducts - paymentBreakdown.discount)) > 0.01 && (
                  <>
                    <br />
                    <IonNote color="danger" className="font-bold">Discrepancia detectada!</IonNote>
                  </>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};
