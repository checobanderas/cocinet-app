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
import { getOperatingDay, getProductReportName, getProductSortScore, SUBCATEGORY_ORDER, getTenantUsers } from '../utils/appHelpers';
import { sendSilentWhatsAppMessage } from '../utils/whatsappCloud';
import { storage, ensureFirebaseAuth } from '../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  const exportToExcel = async (mode: 'view' | 'full' = 'view') => {
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
      [`2. LISTADO DETALLADO DE CUENTAS COBRADAS (${accountsToExport.length} CUENTAS${isFilteredMode && accountFilter !== 'all' ? ` — FILTRO: ${accountFilter.toUpperCase()}` : ''}${isFilteredMode && accountSearch ? ` — BÚSQUEDA: "${accountSearch}"` : ''})`],
      [`Orden: ${accountSortField.toUpperCase()} (${accountSortDir === 'asc' ? 'ASC' : 'DESC'}) | Cuentas Registradas: ${accountsToExport.length} | Filtros Excel Activados`],
      ['# Consec.', 'Folio Cuenta', 'Folio Interno Comandas', 'Fecha / Hora Cierre', 'Mesa', 'Método de Pago', 'Factura', 'Total Cobrado ($)']
    ];

    accountsToExport.forEach((h, idx) => {
      const consecutive = accountsToExport.length - idx;
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

    ws2Data.push([`TOTAL DE CUENTAS (${accountsToExport.length}):`, '', '', '', '', '', '', Number(accountsSumTotal.toFixed(2))]);
    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    ws2['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: ws2Data.length - 1, c: 0 }, e: { r: ws2Data.length - 1, c: 6 } }
    ];
    ws2['!autofilter'] = { ref: `A3:H${accountsToExport.length + 3}` };
    ws2['!cols'] = [{ wch: 10 }, { wch: 16 }, { wch: 24 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Cuentas');

    // 3. PESTAÑA: PRODUCTOS
    const ws3Data: any[][] = [
      [`3. CATÁLOGO GENERAL DE PRODUCTOS Y RENDIMIENTO (${productsExportSoldCount} Con Venta / ${productsExportUnsoldCount} Sin Venta${isFilteredMode && productFilter !== 'all' ? ` — FILTRO: ${productFilter === 'sold' ? 'SOLO VENDIDOS' : 'SIN VENTA'}` : ''}${isFilteredMode && productSearch ? ` — BÚSQUEDA: "${productSearch}"` : ''})`],
      [`Orden: ${productSortField.toUpperCase()} (${productSortDir === 'asc' ? 'ASC' : 'DESC'}) | Total Productos: ${productsToExport.length} | Filtros Excel Activados`],
      ['# Orden', 'Producto / Platillo', 'Categoría / Subgrupo', 'Precio Lista ($)', 'Estado en Ventas', 'Cant. Vendida', 'Total Recaudado ($)']
    ];

    productsToExport.forEach((p) => {
      ws3Data.push([
        p.orderNum,
        p.name,
        p.category,
        Number(Number(p.price || 0).toFixed(2)),
        p.quantitySold > 0 ? `🟢 SÍ VENDIDO (${p.quantitySold})` : '⚪ SIN VENTAS (0)',
        p.quantitySold,
        Number(Number(p.totalSold || 0).toFixed(2))
      ]);
    });

    ws3Data.push([`TOTAL GENERAL PRODUCTOS (${productsExportSoldPieces} PIEZAS VENDIDAS):`, '', '', '', '', productsExportSoldPieces, Number(productsExportTotalMoney.toFixed(2))]);
    const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
    ws3['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: ws3Data.length - 1, c: 0 }, e: { r: ws3Data.length - 1, c: 4 } }
    ];
    ws3['!autofilter'] = { ref: `A3:G${productsToExport.length + 3}` };
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
    const modeSuffix = isFilteredMode ? "_Filtrado" : "_Completo";
    const filename = `ReporteDiario_${cleanCompany}_${todayOperatingDay}${modeSuffix}.xlsx`;

    // 1. Generar binario para Firebase Storage y descarga local
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Descarga local
      XLSX.writeFile(wb, filename);

      // 2. Subir a Firebase Storage
      let storageDownloadUrl = "";
      try {
        await ensureFirebaseAuth();
        const storageRef = ref(storage, `reportes_excel/${cleanCompany}/${filename}`);
        const snapshot = await uploadBytes(storageRef, excelBlob, {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        storageDownloadUrl = await getDownloadURL(snapshot.ref);
        console.log("✅ Excel subido a Firebase Storage:", storageDownloadUrl);
      } catch (storageErr) {
        console.warn("⚠️ No se pudo subir el Excel a Firebase Storage:", storageErr);
      }

      // 3. Enlace de descarga garantizado (Storage o Portal Web Cocinet)
      const tenantId = currentTenant?.id || "tenant-1";
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const publicBase = isLocal ? "http://localhost:3000" : (typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://cocinet-prueba.web.app");
      const cleanPath = typeof window !== "undefined" && window.location.pathname && window.location.pathname !== "/" ? window.location.pathname : "";
      const directWebDownloadUrl = `${publicBase}${cleanPath}?download=excel&tenant=${tenantId}&date=${todayOperatingDay}`;

      const downloadLinkToUse = storageDownloadUrl || directWebDownloadUrl;

      // 4. Envío silencioso por WhatsApp del resumen y enlace oficial
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

      const recipients = getReportRecipients();
      for (const r of recipients) {
        if (r.phone) {
          sendSilentWhatsAppMessage(r.phone, excelMsg).catch((e) =>
            console.warn("Error silent whatsapp excel:", e)
          );
        }
      }
    } catch (e: any) {
      console.warn("Error procesando exportación de Excel:", e);
    }

    alert("Excel enviado exitosamente a WhatsApp");
  };

  const getReportRecipients = () => {
    const phonesSet = new Set<string>();
    const recipients: Array<{ name: string; phone: string }> = [];

    const addRecipient = (name: string, rawPhone?: string) => {
      if (!rawPhone) return;
      const clean = rawPhone.replace(/\D/g, "");
      if (clean.length >= 10 && !phonesSet.has(clean)) {
        phonesSet.add(clean);
        recipients.push({ name, phone: clean });
      }
    };

    try {
      const savedTenant = localStorage.getItem("pos_selected_tenant");
      const tenantId = savedTenant ? JSON.parse(savedTenant)?.id : "tenant-1";
      const users = getTenantUsers(tenantId);
      users.forEach((u) => {
        if (
          (u.isReportRecipient ||
            u.id.endsWith("-admin") ||
            u.id.endsWith("-manager") ||
            u.id.endsWith("-sistemas") ||
            u.role === "admin" ||
            u.role === "owner") &&
          u.phone
        ) {
          addRecipient(u.name, u.phone);
        }
      });
    } catch (e) {}

    if (recipients.length === 0) {
      addRecipient("Administrador", "9511273796");
    }
    return recipients;
  };

  const sendToWhatsApp = async () => {
    try {
      const avgTicket = dailyHistory.length > 0 ? (totalProducts - paymentBreakdown.discount) / dailyHistory.length : 0;
      const totalPieces = productSummary.reduce((sum, p) => sum + (p.quantity || 0), 0);

      let text = `📊 *REPORTE DIARIO DE OPERACIONES*\n`;
      text += `🏢 *${companyName.toUpperCase()}*\n`;
      text += `📅 *Fecha:* ${friendlyTitleDate}\n`;
      text += `🕒 *Emisión:* ${new Date().toLocaleTimeString('es-MX')}\n`;
      text += `----------------------------------\n\n`;

      text += `💰 *RESUMEN DE CAJA:*\n`;
      text += `• Total Cuentas Cobradas: *${dailyHistory.length}*\n`;
      text += `• Venta Neta: *$${(totalProducts - paymentBreakdown.discount).toFixed(2)}*\n`;
      text += `• Ticket Promedio: *$${avgTicket.toFixed(2)}*\n`;
      text += `• Piezas Vendidas: *${totalPieces}*\n\n`;

      text += `💳 *DESGLOSE POR FORMA DE PAGO:*\n`;
      text += `• 💵 Efectivo: *$${paymentBreakdown.cash.toFixed(2)}*\n`;
      text += `• 💳 Tarjeta: *$${paymentBreakdown.card.toFixed(2)}*\n`;
      text += `• 📲 Transferencia: *$${paymentBreakdown.transfer.toFixed(2)}*\n`;
      text += `• ⚡ LUPAY: *$${paymentBreakdown.lupay.toFixed(2)}*\n`;
      text += `• 💜 Cortesía / Consumo: *$${paymentBreakdown.cortesia.toFixed(2)}*\n`;
      if (paymentBreakdown.discount > 0) {
        text += `• 🏷️ Descuentos Aplicados: *-$${paymentBreakdown.discount.toFixed(2)}*\n`;
      }
      text += `\n`;

      if (dailyCancellations.length > 0) {
        text += `❌ *CANCELACIONES (${dailyCancellations.length}):*\n`;
        text += `• Total Cancelado: *$${totalCancellations.toFixed(2)}*\n\n`;
      }

      text += `🌮 *TOP PRODUCTOS VENDIDOS:*\n`;
      let count = 0;
      groupedProducts.forEach(group => {
        if (count < 12) {
          text += `*${group.groupName}*\n`;
          group.items.forEach(p => {
            if (count < 12) {
              text += `• ${p.quantity}x ${p.name} → $${p.total.toFixed(2)}\n`;
              count++;
            }
          });
        }
      });
      text += `\n----------------------------------\n`;
      text += `Generado por Cocinet POS ✨`;

      const recipients = getReportRecipients();
      let sentCount = 0;
      for (const r of recipients) {
        const res = await sendSilentWhatsAppMessage(r.phone, text);
        if (res.success) sentCount++;
      }

      alert(`✅ Reporte diario enviado exitosamente por WhatsApp a ${sentCount} administrador(es) en silencio.`);
    } catch (err: any) {
      alert(`⚠️ Error enviando por WhatsApp: ${err.message || String(err)}`);
    }
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
