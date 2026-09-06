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

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return "";
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
        <Data ss:Type="String">2. LISTADO DETALLADO DE CUENTAS COBRADAS (${dailyHistory.length} CUENTAS)</Data>
      </Cell>
    </Row>
    <Row ss:Height="18">
      <Cell ss:MergeAcross="7" ss:StyleID="SubHeader">
        <Data ss:Type="String">Orden Cronológico | Cuentas Registradas: ${dailyHistory.length} | Filtros Excel Activados</Data>
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
    ${dailyHistory.map((h, idx) => {
      const consecutive = dailyHistory.length - idx;
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
      <Cell ss:MergeAcross="6" ss:StyleID="TotalRowLabel"><Data ss:Type="String">TOTAL DE CUENTAS (${dailyHistory.length}):</Data></Cell>
      <Cell ss:StyleID="TotalRowValue"><Data ss:Type="Number">${totalAccounts.toFixed(2)}</Data></Cell>
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
        <Data ss:Type="String">3. CATÁLOGO GENERAL DE PRODUCTOS Y RENDIMIENTO (${soldCatalogCount} Con Venta / ${unsoldCatalogCount} Sin Venta)</Data>
      </Cell>
    </Row>
    <Row ss:Height="18">
      <Cell ss:MergeAcross="6" ss:StyleID="SubHeader">
        <Data ss:Type="String">Orden de Catálogo | Total Productos: ${sortedDirectCatalog.length} | Filtros Excel Activados</Data>
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
    ${sortedDirectCatalog.map((prod, idx) => {
      const orderNum = prod.sortOrder !== undefined && prod.sortOrder !== null && prod.sortOrder !== 9999 
        ? prod.sortOrder 
        : (prod.consecutive || (idx + 1));
      const liveName = getProductReportName(prod);
      const category = (prod.subgroup || prod.subcategory || "OTROS").toUpperCase().trim();
      const sold = soldMap[String(prod.id)] || soldMap[liveName.toLowerCase().trim()] || soldMap[(prod.name || "").toLowerCase().trim()] || { quantity: 0, total: 0 };
      const priceVal = Number(prod.price || 0);

      if (sold.quantity > 0) {
        return `
        <Row ss:Height="20">
          <Cell ss:StyleID="ProdSoldCenter"><Data ss:Type="Number">${orderNum}</Data></Cell>
          <Cell ss:StyleID="ProdSoldLeft"><Data ss:Type="String">${escapeXml(liveName)}</Data></Cell>
          <Cell ss:StyleID="ProdSoldCenter"><Data ss:Type="String">${escapeXml(category)}</Data></Cell>
          <Cell ss:StyleID="ProdSoldRight"><Data ss:Type="Number">${priceVal.toFixed(2)}</Data></Cell>
          <Cell ss:StyleID="ProdSoldCenter"><Data ss:Type="String">🟢 SÍ VENDIDO (${sold.quantity})</Data></Cell>
          <Cell ss:StyleID="ProdSoldQty"><Data ss:Type="Number">${sold.quantity}</Data></Cell>
          <Cell ss:StyleID="ProdSoldRight"><Data ss:Type="Number">${sold.total.toFixed(2)}</Data></Cell>
        </Row>
        `;
      } else {
        return `
        <Row ss:Height="20">
          <Cell ss:StyleID="ProdUnsoldCenter"><Data ss:Type="Number">${orderNum}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldLeft"><Data ss:Type="String">${escapeXml(liveName)}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldCenter"><Data ss:Type="String">${escapeXml(category)}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldRight"><Data ss:Type="Number">${priceVal.toFixed(2)}</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldCenter"><Data ss:Type="String">⚪ SIN VENTAS (0)</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldQty"><Data ss:Type="Number">0</Data></Cell>
          <Cell ss:StyleID="ProdUnsoldRight"><Data ss:Type="Number">0.00</Data></Cell>
        </Row>
        `;
      }
    }).join('')}
    <Row ss:Height="24">
      <Cell ss:MergeAcross="4" ss:StyleID="TotalRowLabel"><Data ss:Type="String">TOTAL PRODUCTOS (${totalSoldPieces} PIEZAS VENDIDAS):</Data></Cell>
      <Cell ss:StyleID="TotalRowQty"><Data ss:Type="Number">${totalSoldPieces}</Data></Cell>
      <Cell ss:StyleID="TotalRowValue"><Data ss:Type="Number">${totalProducts.toFixed(2)}</Data></Cell>
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
  link.download = `ReporteDiario_${cleanCompany}_${todayOperatingDay}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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