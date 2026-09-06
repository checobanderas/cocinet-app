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

export const getAccountComandaSysFolios = (h: any): string => {
  const sysFolios: string[] = [];
  (h.comandas || []).forEach((c: any) => {
    if (c.folio && !sysFolios.includes(String(c.folio))) {
      sysFolios.push(String(c.folio));
    }
  });
  return sysFolios.join(", ");
};

export const getAccountSortFolio = (h: any): number => {
  const folios = getAccountComandaFolios(h);
  if (folios.length === 0) return 999999999;
  const num = parseInt(folios[0].replace(/\D/g, ""), 10);
  return isNaN(num) ? 999999999 : num;
};

export type AccountSortField = 'time' | 'folio' | 'table' | 'payment' | 'invoice' | 'total';
export type AccountFilterType = 'all' | 'cash' | 'card' | 'transfer' | 'lupay' | 'cortesia' | 'invoice';
export type ProductFilterType = 'all' | 'sold' | 'unsold';
export type ProductSortField = 'order' | 'name' | 'category' | 'price' | 'quantity' | 'total';
export type SortDirection = 'asc' | 'desc';

export interface CatalogProductReportItem {
  id: string;
  orderNum: number;
  name: string;
  category: string;
  price: number;
  quantitySold: number;
  totalSold: number;
  isSold: boolean;
  product: any;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose, history, targetDate, companyName = "Cocinet App", products = [] }) => {
  const [tab, setTab] = useState<'cuentas' | 'productos' | 'cancelaciones'>('cuentas');
  
  // Sorting & Filtering for Cuentas
  const [accountSortField, setAccountSortField] = useState<AccountSortField>('time');
  const [accountSortDir, setAccountSortDir] = useState<SortDirection>('desc');
  const [accountFilter, setAccountFilter] = useState<AccountFilterType>('all');
  const [accountSearch, setAccountSearch] = useState<string>('');

  // Filtering & Sorting for Productos
  const [productFilter, setProductFilter] = useState<ProductFilterType>('all');
  const [productSortField, setProductSortField] = useState<ProductSortField>('order');
  const [productSortDir, setProductSortDir] = useState<SortDirection>('asc');
  const [productSearch, setProductSearch] = useState<string>('');

  // Excel Export Option
  const [excelExportMode, setExcelExportMode] = useState<'view' | 'full'>('full');

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

  const accountCounts = useMemo(() => {
    const total = dailyHistory.length;
    let cash = 0;
    let card = 0;
    let transfer = 0;
    let lupay = 0;
    let cortesia = 0;
    let invoice = 0;

    dailyHistory.forEach(h => {
      const pm = (h.paymentMethod || "").toLowerCase();
      if (pm.includes("cortes") || pm.includes("empleado")) cortesia++;
      else if (pm === "lupay" || pm === "upay") lupay++;
      else if (pm === "card" || pm === "tarjeta" || pm === "debit") card++;
      else if (pm === "transfer" || pm === "transferencia") transfer++;
      else cash++;

      if (h.requiresInvoice) invoice++;
    });

    return { total, cash, card, transfer, lupay, cortesia, invoice };
  }, [dailyHistory]);

  const sortedDailyHistory = useMemo(() => {
    let list = dailyHistory;

    if (accountFilter !== 'all') {
      list = list.filter(h => {
        const pm = (h.paymentMethod || "").toLowerCase();
        if (accountFilter === 'cash') return pm.includes("efectivo") || pm === "cash" || (!pm.includes("tarjeta") && !pm.includes("transfer") && !pm.includes("lupay") && !pm.includes("cortes"));
        if (accountFilter === 'card') return pm.includes("tarjeta") || pm === "card" || pm === "debit";
        if (accountFilter === 'transfer') return pm.includes("transfer") || pm === "transferencia";
        if (accountFilter === 'lupay') return pm === "lupay" || pm === "upay";
        if (accountFilter === 'cortesia') return pm.includes("cortes") || pm.includes("empleado");
        if (accountFilter === 'invoice') return !!h.requiresInvoice;
        return true;
      });
    }

    if (accountSearch.trim() !== '') {
      const q = accountSearch.toLowerCase().trim();
      list = list.filter(h => {
        const folios = formatAccountComandaFolios(h).toLowerCase();
        const fStr = String(h.folio || "").toLowerCase();
        const tStr = String(h.tableLabel || "").toLowerCase();
        const pm = String(h.paymentMethod || "").toLowerCase();
        const phone = String(h.invoicePhone || "").toLowerCase();
        return folios.includes(q) || fStr.includes(q) || tStr.includes(q) || pm.includes(q) || phone.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (accountSortField === 'time') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        cmp = dateA - dateB;
      } else if (accountSortField === 'folio') {
        const numA = getAccountSortFolio(a);
        const numB = getAccountSortFolio(b);
        if (numA !== numB) cmp = numA - numB;
        else cmp = formatAccountComandaFolios(a).localeCompare(formatAccountComandaFolios(b));
      } else if (accountSortField === 'table') {
        const tA = String(a.tableLabel || "");
        const tB = String(b.tableLabel || "");
        cmp = tA.localeCompare(tB, undefined, { numeric: true, sensitivity: 'base' });
      } else if (accountSortField === 'payment') {
        cmp = (a.paymentMethod || "Efectivo").localeCompare(b.paymentMethod || "Efectivo");
      } else if (accountSortField === 'invoice') {
        const invA = a.requiresInvoice ? 1 : 0;
        const invB = b.requiresInvoice ? 1 : 0;
        cmp = invA - invB;
      } else if (accountSortField === 'total') {
        cmp = (a.total || 0) - (b.total || 0);
      }
      return accountSortDir === 'asc' ? cmp : -cmp;
    });
  }, [dailyHistory, accountFilter, accountSearch, accountSortField, accountSortDir]);

  const dailyHistoryByFolio = useMemo(() => {
    return [...dailyHistory].sort((a, b) => {
      const numA = getAccountSortFolio(a);
      const numB = getAccountSortFolio(b);
      if (numA !== numB) return numA - numB;
      const strA = formatAccountComandaFolios(a);
      const strB = formatAccountComandaFolios(b);
      if (strA !== strB) return strA.localeCompare(strB);
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }, [dailyHistory]);

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
    return Object.values(summary).filter(p => !p.name.includes("---")).sort((a, b) => {
      const scoreA = getProductSortScore(a.product);
      const scoreB = getProductSortScore(b.product);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name);
    });
  }, [dailyHistory, products]);

  const soldMap = useMemo(() => {
    const map: Record<string, { quantity: number, total: number }> = {};
    productSummary.forEach(p => {
      if (p.product?.id) map[String(p.product.id)] = { quantity: p.quantity, total: p.total };
      map[(p.name || "").toLowerCase().trim()] = { quantity: p.quantity, total: p.total };
    });
    return map;
  }, [productSummary]);

  const fullCatalogItems = useMemo<CatalogProductReportItem[]>(() => {
    const directCatalog = [...(products || [])]
      .filter((p: any) => !(p.name || "").includes("---") && !p.isDeleted);

    return directCatalog.map((prod, idx) => {
      const orderNum = prod.sortOrder !== undefined && prod.sortOrder !== null && prod.sortOrder !== 9999 
        ? Number(prod.sortOrder) 
        : (prod.consecutive || (idx + 1));
      const liveName = getProductReportName(prod);
      const sold = soldMap[String(prod.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(prod.name || "").toLowerCase().trim()] || { quantity: 0, total: 0 };
      const category = (prod.subgroup || prod.subcategory || "OTROS").toUpperCase().trim();
      const price = Number(prod.price || 0);
      return {
        id: String(prod.id || idx),
        orderNum,
        name: liveName,
        category,
        price,
        quantitySold: sold.quantity,
        totalSold: sold.total,
        isSold: sold.quantity > 0,
        product: prod
      };
    });
  }, [products, soldMap]);

  const filteredAndSortedProducts = useMemo(() => {
    let list = fullCatalogItems;
    if (productFilter === 'sold') {
      list = list.filter(p => p.quantitySold > 0);
    } else if (productFilter === 'unsold') {
      list = list.filter(p => p.quantitySold === 0);
    }

    if (productSearch.trim() !== '') {
      const q = productSearch.toLowerCase().trim();
      list = list.filter(p => {
        return p.name.toLowerCase().includes(q) || 
               p.category.toLowerCase().includes(q) || 
               String(p.orderNum).includes(q);
      });
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (productSortField === 'order') {
        cmp = a.orderNum - b.orderNum;
      } else if (productSortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (productSortField === 'category') {
        cmp = a.category.localeCompare(b.category);
      } else if (productSortField === 'price') {
        cmp = a.price - b.price;
      } else if (productSortField === 'quantity') {
        cmp = a.quantitySold - b.quantitySold;
      } else if (productSortField === 'total') {
        cmp = a.totalSold - b.totalSold;
      }
      return productSortDir === 'asc' ? cmp : -cmp;
    });
  }, [fullCatalogItems, productFilter, productSearch, productSortField, productSortDir]);

  const productCounts = useMemo(() => {
    const total = fullCatalogItems.length;
    const sold = fullCatalogItems.filter(p => p.quantitySold > 0).length;
    const unsold = total - sold;
    return { total, sold, unsold };
  }, [fullCatalogItems]);

  const handleAccountSort = (field: AccountSortField) => {
    if (accountSortField === field) {
      setAccountSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAccountSortField(field);
      if (field === 'time' || field === 'total') {
        setAccountSortDir('desc');
      } else {
        setAccountSortDir('asc');
      }
    }
  };

  const handleProductSort = (field: ProductSortField) => {
    if (productSortField === field) {
      setProductSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortField(field);
      if (field === 'quantity' || field === 'total') {
        setProductSortDir('desc');
      } else {
        setProductSortDir('asc');
      }
    }
  };

  const groupedFullCatalog = useMemo(() => {
    const groups: Record<string, Array<{
      name: string;
      price: number;
      quantitySold: number;
      totalSold: number;
      product: any;
    }>> = {};

    (products || []).filter((p: any) => !(p.name || "").includes("---")).forEach(prod => {
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
  }, [products, soldMap]);

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

  const escapeXml = (str: any): string => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const exportToExcel = (mode: 'view' | 'full' = 'view') => {
    const cleanCompany = (companyName || "Cocinet")
      .replace(/[^a-zA-Z0-9\s_-]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    const totalSoldPieces = productSummary.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const avgTicket = dailyHistory.length > 0 ? (totalProducts - paymentBreakdown.discount) / dailyHistory.length : 0;
    const isFilteredMode = mode === 'view';

    // Accounts dataset to export
    const accountsToExport = isFilteredMode ? sortedDailyHistory : [...dailyHistory].sort((a, b) => {
      let cmp = 0;
      if (accountSortField === 'time') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        cmp = dateA - dateB;
      } else if (accountSortField === 'folio') {
        const numA = getAccountSortFolio(a);
        const numB = getAccountSortFolio(b);
        if (numA !== numB) cmp = numA - numB;
        else cmp = formatAccountComandaFolios(a).localeCompare(formatAccountComandaFolios(b));
      } else if (accountSortField === 'table') {
        cmp = String(a.tableLabel || "").localeCompare(String(b.tableLabel || ""), undefined, { numeric: true });
      } else if (accountSortField === 'payment') {
        cmp = (a.paymentMethod || "Efectivo").localeCompare(b.paymentMethod || "Efectivo");
      } else if (accountSortField === 'invoice') {
        cmp = (a.requiresInvoice ? 1 : 0) - (b.requiresInvoice ? 1 : 0);
      } else if (accountSortField === 'total') {
        cmp = (a.total || 0) - (b.total || 0);
      }
      return accountSortDir === 'asc' ? cmp : -cmp;
    });

    const accountsSumTotal = accountsToExport.reduce((sum, h) => sum + (h.total || 0), 0);

    // Products dataset to export
    const productsToExport = isFilteredMode ? filteredAndSortedProducts : [...fullCatalogItems].sort((a, b) => {
      let cmp = 0;
      if (productSortField === 'order') cmp = a.orderNum - b.orderNum;
      else if (productSortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (productSortField === 'category') cmp = a.category.localeCompare(b.category);
      else if (productSortField === 'price') cmp = a.price - b.price;
      else if (productSortField === 'quantity') cmp = a.quantitySold - b.quantitySold;
      else if (productSortField === 'total') cmp = a.totalSold - b.totalSold;
      return productSortDir === 'asc' ? cmp : -cmp;
    });

    const productsExportSoldPieces = productsToExport.reduce((sum, p) => sum + p.quantitySold, 0);
    const productsExportTotalMoney = productsToExport.reduce((sum, p) => sum + p.totalSold, 0);
    const productsExportSoldCount = productsToExport.filter(p => p.quantitySold > 0).length;
    const productsExportUnsoldCount = productsToExport.filter(p => p.quantitySold === 0).length;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Cocinet POS</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
    </Style>
    <Style ss:ID="HeaderMain">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#334155"/>
      <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SectionTitleSky">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0284C7" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="SectionTitleTeal">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0D9488" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="SectionTitleIndigo">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="SectionTitleRose">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#BE123C" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="KpiHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="KpiValue">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#1E3A8A"/>
      <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="KpiValueInt">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#1E3A8A"/>
      <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="KpiValueDanger">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#BE123C"/>
      <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="ColHeadTeal">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0F766E"/>
      <Interior ss:Color="#CCFBF1" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ColHeadIndigo">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#3730A3"/>
      <Interior ss:Color="#E0E7FF" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ColHeadRose">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#9F1239"/>
      <Interior ss:Color="#FFE4E6" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ColHeadSky">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0369A1"/>
      <Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CellCenterBold">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E293B"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CellLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CellLeftBold">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E293B"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CellRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CellCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CellCurrencyBold">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E293B"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="ProdSoldLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#065F46"/>
      <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ProdSoldCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
      <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ProdSoldRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#065F46"/>
      <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ProdSoldQty">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#065F46"/>
      <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="ProdUnsoldLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ProdUnsoldCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ProdUnsoldRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="ProdUnsoldQty">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="TotalRowLabel">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#166534"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="TotalRowValue">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#166534"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="TotalRowQty">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#166534"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>

    <Style ss:ID="CancelTotalRowLabel">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#991B1B"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
    <Style ss:ID="CancelTotalRowValue">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#991B1B"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="$#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>
      </Borders>
    </Style>
 </Styles>

 <!-- PESTAÑA 1: DASHBOARD EJECUTIVO -->
 <Worksheet ss:Name="Dashboard">
  <Table ss:DefaultColumnWidth="100">
    <Column ss:Width="160"/>
    <Column ss:Width="160"/>
    <Column ss:Width="120"/>
    <Column ss:Width="120"/>
    <Column ss:Width="120"/>
    <Column ss:Width="120"/>
    <Column ss:Width="120"/>
    <Column ss:Width="140"/>

    <Row ss:Height="30">
      <Cell ss:MergeAcross="7" ss:StyleID="HeaderMain"><Data ss:Type="String">REPORTE DIARIO DE OPERACIONES — ${escapeXml(companyName.toUpperCase())}</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="7" ss:StyleID="SubHeader"><Data ss:Type="String">Fecha de Operación: ${escapeXml(friendlyTitleDate)} | Emisión: ${escapeXml(new Date().toLocaleTimeString())} | Sistema: Cocinet POS System</Data></Cell>
    </Row>
    <Row ss:Height="10"/>

    <!-- WIDGETS / TARJETAS KPI -->
    <Row ss:Height="24">
      <Cell ss:MergeAcross="7" ss:StyleID="SectionTitleSky"><Data ss:Type="String">1. RESUMEN GENERAL Y ARQUEO DE CAJA (PANEL EJECUTIVO)</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="1" ss:StyleID="KpiHeader"><Data ss:Type="String">TOTAL VENDIDO (NETO)</Data></Cell>
      <Cell ss:StyleID="KpiHeader"><Data ss:Type="String">TOTAL CUENTAS</Data></Cell>
      <Cell ss:StyleID="KpiHeader"><Data ss:Type="String">DESCUENTOS</Data></Cell>
      <Cell ss:StyleID="KpiHeader"><Data ss:Type="String">TOTAL CANCELADO</Data></Cell>
      <Cell ss:StyleID="KpiHeader"><Data ss:Type="String">PLATILLOS VENDIDOS</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="KpiHeader"><Data ss:Type="String">TICKET PROMEDIO</Data></Cell>
    </Row>
    <Row ss:Height="28">
      <Cell ss:MergeAcross="1" ss:StyleID="KpiValue"><Data ss:Type="Number">${(totalProducts - paymentBreakdown.discount).toFixed(2)}</Data></Cell>
      <Cell ss:StyleID="KpiValueInt"><Data ss:Type="Number">${dailyHistory.length}</Data></Cell>
      <Cell ss:StyleID="KpiValueDanger"><Data ss:Type="Number">${(-paymentBreakdown.discount).toFixed(2)}</Data></Cell>
      <Cell ss:StyleID="KpiValueDanger"><Data ss:Type="Number">${totalCancellations.toFixed(2)}</Data></Cell>
      <Cell ss:StyleID="KpiValueInt"><Data ss:Type="Number">${totalSoldPieces}</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="KpiValue"><Data ss:Type="Number">${avgTicket.toFixed(2)}</Data></Cell>
    </Row>
    <Row ss:Height="10"/>

    <!-- DESGLOSE DE PAGO -->
    <Row ss:Height="22">
      <Cell ss:MergeAcross="2" ss:StyleID="ColHeadSky"><Data ss:Type="String">DESGLOSE POR MÉTODO DE PAGO</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="ColHeadSky"><Data ss:Type="String">TIPO / ORIGEN</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="ColHeadSky"><Data ss:Type="String">MONTO RECAUDADO ($)</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="2" ss:StyleID="CellLeftBold"><Data ss:Type="String">💵 Efectivo en Caja</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">Ingreso Directo Caja</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${paymentBreakdown.cash.toFixed(2)}</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="2" ss:StyleID="CellLeftBold"><Data ss:Type="String">💳 Tarjetas Débito / Crédito</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">Terminal Bancaria</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${paymentBreakdown.card.toFixed(2)}</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="2" ss:StyleID="CellLeftBold"><Data ss:Type="String">📲 Transferencias Interbancarias</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">BBVA / STP / SPEI</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${paymentBreakdown.transfer.toFixed(2)}</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="2" ss:StyleID="CellLeftBold"><Data ss:Type="String">⚡ Cobros LUPAY</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">Plataforma Digital QR</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${paymentBreakdown.lupay.toFixed(2)}</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="2" ss:StyleID="CellLeftBold"><Data ss:Type="String">💜 Cortesías / Consumo Personal</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">Consumo Interno</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${paymentBreakdown.cortesia.toFixed(2)}</Data></Cell>
    </Row>
    ${paymentBreakdown.discount > 0 ? `
    <Row ss:Height="20">
      <Cell ss:MergeAcross="2" ss:StyleID="CellLeftBold"><Data ss:Type="String">🏷️ Descuentos Promocionales</Data></Cell>
      <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">Deducción de Venta</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${(-paymentBreakdown.discount).toFixed(2)}</Data></Cell>
    </Row>
    ` : ''}
    <Row ss:Height="24">
      <Cell ss:MergeAcross="4" ss:StyleID="TotalRowLabel"><Data ss:Type="String">TOTAL GENERAL NETO (ARQUEO CUADRADO):</Data></Cell>
      <Cell ss:MergeAcross="2" ss:StyleID="TotalRowValue"><Data ss:Type="Number">${(totalProducts - paymentBreakdown.discount).toFixed(2)}</Data></Cell>
    </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayGridlines/>
  </WorksheetOptions>
 </Worksheet>

 <!-- PESTAÑA 2: CUENTAS COBRADAS -->
 <Worksheet ss:Name="Cuentas">
  <Table ss:DefaultColumnWidth="100">
    <Column ss:Width="65"/>
    <Column ss:Width="105"/>
    <Column ss:Width="140"/>
    <Column ss:Width="145"/>
    <Column ss:Width="70"/>
    <Column ss:Width="125"/>
    <Column ss:Width="105"/>
    <Column ss:Width="120"/>

    <Row ss:Height="26">
      <Cell ss:MergeAcross="7" ss:StyleID="SectionTitleTeal">
        <Data ss:Type="String">2. LISTADO DETALLADO DE CUENTAS COBRADAS (${accountsToExport.length} CUENTAS${isFilteredMode && accountFilter !== 'all' ? ` — FILTRO: ${escapeXml(accountFilter.toUpperCase())}` : ''}${isFilteredMode && accountSearch ? ` — BÚSQUEDA: "${escapeXml(accountSearch)}"` : ''})</Data>
      </Cell>
    </Row>
    <Row ss:Height="18">
      <Cell ss:MergeAcross="7" ss:StyleID="SubHeader">
        <Data ss:Type="String">Orden: ${escapeXml(accountSortField.toUpperCase())} (${accountSortDir === 'asc' ? 'ASC' : 'DESC'}) | Cuentas Registradas: ${accountsToExport.length} | Filtros Excel Activados</Data>
      </Cell>
    </Row>
    <Row ss:Height="22">
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String"># Consec.</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Folio Cuenta</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Folio Interno Comandas</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Fecha / Hora Cierre</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Mesa</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Método de Pago</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Factura</Data></Cell>
      <Cell ss:StyleID="ColHeadTeal"><Data ss:Type="String">Total Cobrado ($)</Data></Cell>
    </Row>
    ${accountsToExport.map((h, idx) => {
      const consecutive = accountsToExport.length - idx;
      const foliosInternos = formatAccountComandaFolios(h);
      const timeStr = h.timestamp instanceof Date ? h.timestamp.toLocaleString() : (typeof h.timestamp === 'string' ? h.timestamp : new Date(h.timestamp).toLocaleString());
      const invStr = h.requiresInvoice ? (h.invoicePhone ? `Sí (${h.invoicePhone})` : "Sí") : "No";
      return `
      <Row ss:Height="20">
        <Cell ss:StyleID="CellCenterBold"><Data ss:Type="String">#${consecutive}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(h.folio || `CUT-${consecutive}`)}</Data></Cell>
        <Cell ss:StyleID="CellCenterBold"><Data ss:Type="String">${escapeXml(foliosInternos)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(timeStr)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(h.tableLabel || "N/A")}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(h.paymentMethod || "Efectivo")}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(invStr)}</Data></Cell>
        <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${Number(h.total || 0).toFixed(2)}</Data></Cell>
      </Row>
      `;
    }).join('')}
    <Row ss:Height="24">
      <Cell ss:MergeAcross="6" ss:StyleID="TotalRowLabel"><Data ss:Type="String">TOTAL DE CUENTAS (${accountsToExport.length}):</Data></Cell>
      <Cell ss:StyleID="TotalRowValue"><Data ss:Type="Number">${accountsSumTotal.toFixed(2)}</Data></Cell>
    </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayGridlines/>
    <AutoFilter x:Range="R3C1:R3C8"/>
  </WorksheetOptions>
 </Worksheet>

 <!-- PESTAÑA 3: CATÁLOGO DE PRODUCTOS -->
 <Worksheet ss:Name="Productos">
  <Table ss:DefaultColumnWidth="100">
    <Column ss:Width="65"/>
    <Column ss:Width="260"/>
    <Column ss:Width="160"/>
    <Column ss:Width="110"/>
    <Column ss:Width="140"/>
    <Column ss:Width="100"/>
    <Column ss:Width="130"/>

    <Row ss:Height="26">
      <Cell ss:MergeAcross="6" ss:StyleID="SectionTitleIndigo">
        <Data ss:Type="String">3. CATÁLOGO GENERAL DE PRODUCTOS Y RENDIMIENTO (${productsExportSoldCount} Con Venta / ${productsExportUnsoldCount} Sin Venta${isFilteredMode && productFilter !== 'all' ? ` — FILTRO: ${escapeXml(productFilter === 'sold' ? 'SOLO VENDIDOS' : 'SIN VENTA')}` : ''}${isFilteredMode && productSearch ? ` — BÚSQUEDA: "${escapeXml(productSearch)}"` : ''})</Data>
      </Cell>
    </Row>
    <Row ss:Height="18">
      <Cell ss:MergeAcross="6" ss:StyleID="SubHeader">
        <Data ss:Type="String">Orden: ${escapeXml(productSortField.toUpperCase())} (${productSortDir === 'asc' ? 'ASC' : 'DESC'}) | Total Productos: ${productsToExport.length} | Filtros Excel Activados</Data>
      </Cell>
    </Row>
    <Row ss:Height="22">
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String"># Orden</Data></Cell>
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String">Producto / Platillo</Data></Cell>
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String">Categoría / Subgrupo</Data></Cell>
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String">Precio Lista ($)</Data></Cell>
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String">Estado en Ventas</Data></Cell>
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String">Cant. Vendida</Data></Cell>
      <Cell ss:StyleID="ColHeadIndigo"><Data ss:Type="String">Total Recaudado ($)</Data></Cell>
    </Row>
    ${productsToExport.map((p) => {
      const isSold = p.quantitySold > 0;
      if (isSold) {
        return `
        <Row ss:Height="20">
          <Cell ss:StyleID="ProdSoldCenter"><Data ss:Type="Number">${p.orderNum}</Data></Cell>
          <Cell ss:StyleID="ProdSoldLeft"><Data ss:Type="String">${escapeXml(p.name)}</Data></Cell>
          <Cell ss:StyleID="ProdSoldCenter"><Data ss:Type="String">${escapeXml(p.category)}</Data></Cell>
          <Cell ss:StyleID="ProdSoldRight"><Data ss:Type="Number">${Number(p.price || 0).toFixed(2)}</Data></Cell>
          <Cell ss:StyleID="ProdSoldCenter"><Data ss:Type="String">🟢 SÍ VENDIDO (${p.quantitySold})</Data></Cell>
          <Cell ss:StyleID="ProdSoldQty"><Data ss:Type="Number">${p.quantitySold}</Data></Cell>
          <Cell ss:StyleID="ProdSoldRight"><Data ss:Type="Number">${Number(p.totalSold || 0).toFixed(2)}</Data></Cell>
        </Row>
        `;
      } else {
        return `
        <Row ss:Height="20">
          <Cell ss:StyleID="ProdUnsoldCenter"><Data ss:Type="Number">${p.orderNum}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldLeft"><Data ss:Type="String">${escapeXml(p.name)}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldCenter"><Data ss:Type="String">${escapeXml(p.category)}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldRight"><Data ss:Type="Number">${Number(p.price || 0).toFixed(2)}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldCenter"><Data ss:Type="String">⚪ SIN VENTAS (0)</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldQty"><Data ss:Type="Number">0</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldRight"><Data ss:Type="Number">0.00</Data></Cell>
        </Row>
        `;
      }
    }).join('')}
    <Row ss:Height="24">
      <Cell ss:MergeAcross="4" ss:StyleID="TotalRowLabel"><Data ss:Type="String">TOTAL PRODUCTOS (${productsExportSoldPieces} PIEZAS VENDIDAS):</Data></Cell>
      <Cell ss:StyleID="TotalRowQty"><Data ss:Type="Number">${productsExportSoldPieces}</Data></Cell>
      <Cell ss:StyleID="TotalRowValue"><Data ss:Type="Number">${productsExportTotalMoney.toFixed(2)}</Data></Cell>
    </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayGridlines/>
    <AutoFilter x:Range="R3C1:R3C7"/>
  </WorksheetOptions>
 </Worksheet>

 <!-- PESTAÑA 4: CANCELACIONES Y ANULACIONES -->
 <Worksheet ss:Name="Cancelaciones">
  <Table ss:DefaultColumnWidth="100">
    <Column ss:Width="65"/>
    <Column ss:Width="95"/>
    <Column ss:Width="110"/>
    <Column ss:Width="145"/>
    <Column ss:Width="70"/>
    <Column ss:Width="230"/>
    <Column ss:Width="75"/>
    <Column ss:Width="190"/>
    <Column ss:Width="130"/>
    <Column ss:Width="120"/>

    <Row ss:Height="26">
      <Cell ss:MergeAcross="9" ss:StyleID="SectionTitleRose">
        <Data ss:Type="String">4. REGISTRO DETALLADO DE CANCELACIONES Y ANULACIONES (${dailyCancellations.length} REGISTROS)</Data>
      </Cell>
    </Row>
    <Row ss:Height="18">
      <Cell ss:MergeAcross="9" ss:StyleID="SubHeader">
        <Data ss:Type="String">Total de Cancelaciones: ${dailyCancellations.length} registros | Monto Cancelado: $${totalCancellations.toFixed(2)} | Filtros Excel Activados</Data>
      </Cell>
    </Row>
    <Row ss:Height="22">
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String"># Consec.</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Folio</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Tipo</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Fecha / Hora</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Mesa</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Producto / Concepto</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Cantidad</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Motivo de Cancelación</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Autorizado Por</Data></Cell>
      <Cell ss:StyleID="ColHeadRose"><Data ss:Type="String">Total Cancelado ($)</Data></Cell>
    </Row>
    ${dailyCancellations.map((item, index) => {
      const consecutive = dailyCancellations.length - index;
      const timeStr = item.timestamp instanceof Date ? item.timestamp.toLocaleString() : (typeof item.timestamp === 'string' ? item.timestamp : new Date(item.timestamp).toLocaleString());
      return `
      <Row ss:Height="20">
        <Cell ss:StyleID="CellCenterBold"><Data ss:Type="String">#${consecutive}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(item.folio)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(item.type === 'cuenta' ? 'Cuenta Completa' : 'Producto')}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(timeStr)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(item.tableLabel)}</Data></Cell>
        <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(item.description)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${item.quantity}</Data></Cell>
        <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.reason)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(item.user)}</Data></Cell>
        <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${Number(item.total || 0).toFixed(2)}</Data></Cell>
      </Row>
      `;
    }).join('')}
    <Row ss:Height="24">
      <Cell ss:MergeAcross="8" ss:StyleID="CancelTotalRowLabel"><Data ss:Type="String">TOTAL CANCELACIONES (${dailyCancellations.length} REGISTROS):</Data></Cell>
      <Cell ss:StyleID="CancelTotalRowValue"><Data ss:Type="Number">${totalCancellations.toFixed(2)}</Data></Cell>
    </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayGridlines/>
    <AutoFilter x:Range="R3C1:R3C10"/>
  </WorksheetOptions>
 </Worksheet>

</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const modeSuffix = isFilteredMode ? "_Filtrado" : "_Completo";
    link.download = `ReporteDiario_${cleanCompany}_${todayOperatingDay}${modeSuffix}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sendToWhatsApp = () => {
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

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const renderSortBadge = (currentField: string, targetField: string, dir: SortDirection) => {
    if (currentField === targetField) {
      return (
        <span className="inline-flex items-center gap-0.5 ml-1 text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shadow">
          {dir === 'asc' ? '🔼 ASC' : '🔽 DESC'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center ml-1 text-[10px] font-semibold text-slate-400 opacity-80">
        ↕️
      </span>
    );
  };

  const renderAccountsTable = () => {
    return (
      <div className="w-full">
        {/* Realtime Search & Payment Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="🔍 Escribe para buscar por folio, comanda, mesa o método..." 
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
            />
            {accountSearch && (
              <button 
                type="button"
                onClick={() => setAccountSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Payment Method Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAccountFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'all' ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
            >
              🔘 Todas ({accountCounts.total})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('cash')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'cash' ? 'bg-emerald-700 text-white shadow' : 'bg-white text-emerald-800 hover:bg-emerald-50'}`}
            >
              💵 Efec ({accountCounts.cash})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('card')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'card' ? 'bg-sky-700 text-white shadow' : 'bg-white text-sky-800 hover:bg-sky-50'}`}
            >
              💳 Tarj ({accountCounts.card})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('transfer')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'transfer' ? 'bg-blue-700 text-white shadow' : 'bg-white text-blue-800 hover:bg-blue-50'}`}
            >
              📲 Transf ({accountCounts.transfer})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('lupay')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'lupay' ? 'bg-amber-600 text-white shadow' : 'bg-white text-amber-800 hover:bg-amber-50'}`}
            >
              ⚡ Lupay ({accountCounts.lupay})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('cortesia')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'cortesia' ? 'bg-purple-700 text-white shadow' : 'bg-white text-purple-800 hover:bg-purple-50'}`}
            >
              💜 Cort ({accountCounts.cortesia})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('invoice')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${accountFilter === 'invoice' ? 'bg-indigo-700 text-white shadow' : 'bg-white text-indigo-800 hover:bg-indigo-50'}`}
            >
              🧾 Fact ({accountCounts.invoice})
            </button>
          </div>
        </div>

        {/* Active Sort Banner */}
        <div className="flex flex-wrap items-center justify-between bg-slate-800 text-slate-200 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b border-slate-700 mb-0 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span>📊 Ordenando por:</span>
            <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] shadow">
              {accountSortField === 'folio' ? 'Folio / Comandas' :
               accountSortField === 'time' ? 'Hora de Cierre' :
               accountSortField === 'table' ? 'Mesa' :
               accountSortField === 'payment' ? 'Método de Pago' :
               accountSortField === 'invoice' ? 'Facturación' : 'Monto Total'} 
              {accountSortDir === 'asc' ? ' 🔼 (Menor a Mayor)' : ' 🔽 (Mayor a Menor)'}
            </span>
          </div>
          <span className="text-[10px] text-amber-200 font-bold">👆 Haz clic en cualquier columna para cambiar orden</span>
        </div>

        <IonGrid className="w-full">
          {/* Interactive Sortable Header Row with Colored Highlight */}
          <IonRow className="sticky top-0 z-10 font-bold bg-slate-900 text-white shadow select-none text-xs">
            <IonCol 
              size="3" 
              onClick={() => handleAccountSort('folio')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${accountSortField === 'folio' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Folio / Cda</span>
              {renderSortBadge(accountSortField, 'folio', accountSortDir)}
            </IonCol>

            <IonCol 
              size="2" 
              onClick={() => handleAccountSort('time')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${accountSortField === 'time' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Hora</span>
              {renderSortBadge(accountSortField, 'time', accountSortDir)}
            </IonCol>

            <IonCol 
              size="2" 
              onClick={() => handleAccountSort('table')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${accountSortField === 'table' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Mesa</span>
              {renderSortBadge(accountSortField, 'table', accountSortDir)}
            </IonCol>

            <IonCol 
              size="2" 
              onClick={() => handleAccountSort('payment')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${accountSortField === 'payment' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Pago</span>
              {renderSortBadge(accountSortField, 'payment', accountSortDir)}
            </IonCol>

            <IonCol 
              size="1.5" 
              onClick={() => handleAccountSort('invoice')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${accountSortField === 'invoice' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Factura</span>
              {renderSortBadge(accountSortField, 'invoice', accountSortDir)}
            </IonCol>

            <IonCol 
              size="1.5" 
              onClick={() => handleAccountSort('total')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-end ${accountSortField === 'total' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Total</span>
              {renderSortBadge(accountSortField, 'total', accountSortDir)}
            </IonCol>
          </IonRow>

          {/* Data Rows */}
          {sortedDailyHistory.length === 0 ? (
            <IonRow className="p-8 text-center text-slate-500 font-medium">
              <IonCol size="12">✨ No hay cuentas que coincidan con la búsqueda o filtro seleccionado.</IonCol>
            </IonRow>
          ) : (
            sortedDailyHistory.map((h, index) => {
              const consecutive = sortedDailyHistory.length - index;
              const formattedFolios = formatAccountComandaFolios(h);
              const sysFolios = getAccountComandaSysFolios(h);
              return (
                <IonRow key={h.id || `${h.folio}-${index}`} className={getRowClass(h)}>
                  <IonCol size="3">
                    <div className="font-bold text-slate-800">#{consecutive}</div>
                    {h.folio && <div className="text-[11px] text-slate-500 font-medium">Folio: {h.folio}</div>}
                    <div className="text-[11px] text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300 mt-0.5 font-bold inline-block">
                      Cda Folio Int: {formattedFolios}
                    </div>
                    {sysFolios && (
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        Cda Sys: {sysFolios}
                      </div>
                    )}
                  </IonCol>
                  <IonCol size="2">{formatTime(h.timestamp)}</IonCol>
                  <IonCol size="2">{h.tableLabel || "-"}</IonCol>
                  <IonCol size="2">{h.paymentMethod || "Efectivo"}</IonCol>
                  <IonCol size="1.5">{h.requiresInvoice ? (h.invoicePhone ? `Sí (${h.invoicePhone})` : "Sí") : "No"}</IonCol>
                  <IonCol size="1.5" className="text-right font-bold text-slate-900">${(h.total || 0).toFixed(2)}</IonCol>
                </IonRow>
              );
            })
          )}
        </IonGrid>
      </div>
    );
  };

  const renderProductsTable = () => {
    return (
      <div className="w-full">
        {/* Realtime Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="🔍 Escribe para buscar platillo por nombre o categoría..." 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
            {productSearch && (
              <button 
                type="button"
                onClick={() => setProductSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setProductFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${productFilter === 'all' ? 'bg-blue-700 text-white shadow-blue-300 ring-2 ring-blue-400' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
            >
              🔘 Todos <span className="bg-slate-200/80 text-slate-800 px-1.5 py-0.2 rounded text-[10px] font-black">{productCounts.total}</span>
            </button>
            <button
              type="button"
              onClick={() => setProductFilter('sold')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${productFilter === 'sold' ? 'bg-emerald-700 text-white shadow-emerald-300 ring-2 ring-emerald-400' : 'bg-white text-emerald-800 hover:bg-emerald-50'}`}
            >
              🟢 Solo Vendidos <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded text-[10px] font-black">{productCounts.sold}</span>
            </button>
            <button
              type="button"
              onClick={() => setProductFilter('unsold')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${productFilter === 'unsold' ? 'bg-slate-800 text-white shadow-slate-300 ring-2 ring-slate-400' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
            >
              ⚪ Sin Venta <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-black">{productCounts.unsold}</span>
            </button>
          </div>
        </div>

        {/* Active Sort Banner */}
        <div className="flex flex-wrap items-center justify-between bg-slate-800 text-slate-200 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b border-slate-700 mb-0 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span>📊 Ordenando por:</span>
            <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] shadow">
              {productSortField === 'order' ? '# Número de Orden' :
               productSortField === 'name' ? 'Nombre Producto' :
               productSortField === 'category' ? 'Categoría' :
               productSortField === 'price' ? 'Precio de Lista' :
               productSortField === 'quantity' ? 'Cantidad Vendida' : 'Total Recaudado'} 
              {productSortDir === 'asc' ? ' 🔼 (Ascendente)' : ' 🔽 (Descendente)'}
            </span>
          </div>
          <span className="text-[10px] text-amber-200 font-bold">👆 Haz clic en cualquier columna para cambiar orden</span>
        </div>

        {/* Table */}
        <IonGrid className="w-full">
          {/* Header Row with Sortable Columns */}
          <IonRow className="sticky top-0 z-10 font-bold bg-slate-900 text-white shadow select-none text-xs">
            <IonCol 
              size="1.5"
              onClick={() => handleProductSort('order')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${productSortField === 'order' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span># Orden</span>
              {renderSortBadge(productSortField, 'order', productSortDir)}
            </IonCol>

            <IonCol 
              size="4"
              onClick={() => handleProductSort('name')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${productSortField === 'name' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Producto / Platillo</span>
              {renderSortBadge(productSortField, 'name', productSortDir)}
            </IonCol>

            <IonCol 
              size="2"
              onClick={() => handleProductSort('category')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${productSortField === 'category' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Categoría</span>
              {renderSortBadge(productSortField, 'category', productSortDir)}
            </IonCol>

            <IonCol 
              size="1.5"
              onClick={() => handleProductSort('price')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${productSortField === 'price' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Precio Lista</span>
              {renderSortBadge(productSortField, 'price', productSortDir)}
            </IonCol>

            <IonCol 
              size="1.5"
              onClick={() => handleProductSort('quantity')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between border-r border-slate-700 ${productSortField === 'quantity' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Cant. Vendida</span>
              {renderSortBadge(productSortField, 'quantity', productSortDir)}
            </IonCol>

            <IonCol 
              size="1.5"
              onClick={() => handleProductSort('total')}
              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-end ${productSortField === 'total' ? 'bg-amber-600 text-white font-black ring-2 ring-inset ring-amber-300' : 'hover:bg-slate-800 text-slate-100'}`}
            >
              <span>Total Recaudado</span>
              {renderSortBadge(productSortField, 'total', productSortDir)}
            </IonCol>
          </IonRow>

          {/* Product Rows */}
          {filteredAndSortedProducts.length === 0 ? (
            <IonRow className="p-8 text-center text-slate-500 font-medium">
              <IonCol size="12">✨ No hay productos que coincidan con la búsqueda o filtro seleccionado.</IonCol>
            </IonRow>
          ) : (
            filteredAndSortedProducts.map((p) => {
              const isSold = p.quantitySold > 0;
              return (
                <IonRow 
                  key={p.id} 
                  className={`border-b p-2 text-xs items-center transition-colors ${isSold ? 'bg-emerald-50/70 hover:bg-emerald-100/70 text-slate-900' : 'bg-slate-50/50 hover:bg-slate-100 text-slate-600 opacity-90'}`}
                >
                  <IonCol size="1.5" className="font-bold">
                    <span className={isSold ? "text-emerald-800 font-black" : "text-slate-400 font-medium"}>
                      #{p.orderNum}
                    </span>
                  </IonCol>
                  <IonCol size="4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[10px] mt-0.5">
                      {isSold ? (
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          🟢 SÍ VENDIDO ({p.quantitySold})
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium bg-slate-200/80 px-1.5 py-0.5 rounded">
                          ⚪ SIN VENTAS (0)
                        </span>
                      )}
                    </div>
                  </IonCol>
                  <IonCol size="2">
                    <span className="text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 font-semibold uppercase">
                      {p.category}
                    </span>
                  </IonCol>
                  <IonCol size="1.5" className="font-semibold">
                    ${p.price.toFixed(2)}
                  </IonCol>
                  <IonCol size="1.5">
                    {isSold ? (
                      <span className="font-black text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                        {p.quantitySold}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">0</span>
                    )}
                  </IonCol>
                  <IonCol size="1.5" className="text-right">
                    {isSold ? (
                      <span className="font-black text-emerald-800 text-sm">
                        ${p.totalSold.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400">$0.00</span>
                    )}
                  </IonCol>
                </IonRow>
              );
            })
          )}
        </IonGrid>
      </div>
    );
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
          renderAccountsTable()
        ) : tab === 'productos' ? (
          renderProductsTable()
        ) : (
          <IonGrid className="w-full">
            <IonRow className="sticky top-0 z-10 font-bold bg-rose-950 text-white p-2.5 text-xs select-none shadow">
              <IonCol size="2">Folio / Tipo</IonCol>
              <IonCol size="2">Hora / Mesa</IonCol>
              <IonCol size="3">Descripción / Producto</IonCol>
              <IonCol size="1" className="text-center">Cant.</IonCol>
              <IonCol size="2">Motivo / Por</IonCol>
              <IonCol size="2" className="text-right">Total</IonCol>
            </IonRow>
            {dailyCancellations.length === 0 ? (
              <IonRow className="p-8 text-center text-slate-500 font-medium">
                <IonCol size="12">✨ No hay cancelaciones registradas en este día.</IonCol>
              </IonRow>
            ) : (
              dailyCancellations.map((c, index) => {
                const consecutive = dailyCancellations.length - index;
                return (
                  <IonRow key={c.id} className="border-b p-2 bg-rose-50/60 hover:bg-rose-100/60 text-xs transition-colors">
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
                <IonButton expand="block" color="primary" onClick={() => exportToExcel('view')}>
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
