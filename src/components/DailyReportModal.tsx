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
import { closeOutline, downloadOutline, listOutline, restaurantOutline, logoWhatsapp } from 'ionicons/icons';
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
  const [tab, setTab] = useState<'cuentas' | 'productos'>('cuentas');
  
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

  const totalAccounts = useMemo(() => dailyHistory.reduce((sum, h) => sum + (h.total || 0), 0), [dailyHistory]);
  const totalProducts = useMemo(() => productSummary.reduce((sum, p) => sum + p.total, 0), [productSummary]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, typeof productSummary> = {};
    productSummary.forEach(p => {
      const subcat = (p.product.subcategory || "OTROS").toUpperCase().trim();
      if (!groups[subcat]) {
        groups[subcat] = [];
      }
      groups[subcat].push(p);
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
    
    // Accounts sheet (Cuentas)
    const accountsAOA: any[][] = [];
    
    // Title Blocks (merged columns)
    accountsAOA.push([companyName.toUpperCase()]);
    accountsAOA.push(["REPORTE DIARIO DE CUENTAS DETALLADO"]);
    accountsAOA.push([`FECHA DE CONSULTA: ${friendlyTitleDate}`]);
    accountsAOA.push([`EMITIDO POR: COCINET APP - HORA: ${new Date().toLocaleTimeString()}`]);
    accountsAOA.push([]); // Empty row
    
    // Header Row (Row index 5, which is Row 6 in Excel)
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

    // Data Rows (Row index 6 to 6 + N - 1)
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

    // Append blank row
    accountsAOA.push([]);

    // Append payment breakdown totals
    accountsAOA.push(["DESGLOSE POR FORMA DE PAGO", "", "", "", "", "", "", ""]);
    accountsAOA.push(["💵 EFECTIVO", "", "", "", "", "", "", paymentBreakdown.cash]);
    accountsAOA.push(["💳 TARJETA CRÉDITO/DÉBITO", "", "", "", "", "", "", paymentBreakdown.card]);
    accountsAOA.push(["📲 TRANSFERENCIA INTERBANCARIA", "", "", "", "", "", "", paymentBreakdown.transfer]);
    accountsAOA.push(["⚡ COBRO LUPAY", "", "", "", "", "", "", paymentBreakdown.lupay]);
    accountsAOA.push(["💜 CORTESÍA / EMPLEADOS", "", "", "", "", "", "", paymentBreakdown.cortesia]);
    accountsAOA.push(["🏷️ DESCUENTOS APLICADOS", "", "", "", "", "", "", paymentBreakdown.discount]);

    // Append blank row
    accountsAOA.push([]);

    // Append grand totals
    accountsAOA.push(["TOTAL DE CUENTAS COBRADAS", "", "", "", "", "", "", { t: "n", f: `SUM(H7:H${6 + N})` }]);
    accountsAOA.push(["TOTAL BRUTO DE PRODUCTOS", "", "", "", "", "", "", totalProducts]);
    
    if (paymentBreakdown.discount > 0) {
      accountsAOA.push(["(-) DESCUENTOS APLICADOS", "", "", "", "", "", "", -paymentBreakdown.discount]);
      accountsAOA.push(["TOTAL PRODUCTOS CON DESCUENTOS", "", "", "", "", "", "", { t: "n", f: `H${6 + N + 12}+H${6 + N + 13}` }]);
    }

    const wsAccounts = XLSX.utils.aoa_to_sheet(accountsAOA);

    // Merge titles (A1:H1, A2:H2, A3:H3, A4:H4)
    wsAccounts['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }
    ];

    // Set column widths
    const colWidthsAccounts = [
      { wch: 32 }, // Consecutivo / Forma de pago
      { wch: 15 }, // Folio
      { wch: 35 }, // Comandas
      { wch: 25 }, // Fecha
      { wch: 12 }, // Mesa
      { wch: 18 }, // Pago
      { wch: 18 }, // Factura
      { wch: 18 }  // Total
    ];
    wsAccounts['!cols'] = colWidthsAccounts;

    // Apply currency format to Column H (index 7) for all data and total rows
    Object.keys(wsAccounts).forEach((key) => {
      if (key.startsWith('!')) return;
      const col = key.replace(/[0-9]/g, '');
      const row = parseInt(key.replace(/[^0-9]/g, ''), 10);
      
      // Skip title rows
      if (row <= 5) return;
      
      const cell = wsAccounts[key];
      if (cell && (cell.t === 'n' || cell.f)) {
        if (col === 'H') {
          cell.z = '$#,##0.00';
        }
      }
    });

    XLSX.utils.book_append_sheet(wb, wsAccounts, "Cuentas");

    // Products sheet (Productos)
    const productsAOA: any[][] = [];
    productsAOA.push([companyName.toUpperCase()]);
    productsAOA.push(["REPORTE DIARIO DE PRODUCTOS VENDIDOS"]);
    productsAOA.push([`FECHA DE CONSULTA: ${friendlyTitleDate}`]);
    productsAOA.push([`EMITIDO POR: COCINET APP - HORA: ${new Date().toLocaleTimeString()}`]);
    productsAOA.push([]); // Empty row

    // Header (Row 6)
    productsAOA.push(["PRODUCTO / PLATILLO", "CANTIDAD", "TOTAL RECAUDADO"]);

    groupedProducts.forEach(group => {
      productsAOA.push([]); // Blank row
      productsAOA.push([`📂 ${group.groupName.toUpperCase()}`, "", ""]); // Group Header
      group.items.forEach(p => {
        productsAOA.push([p.name, p.quantity, p.total]);
      });
    });

    const L = productsAOA.length;

    productsAOA.push([]); // Row L + 1
    productsAOA.push(["TOTAL BRUTO DE PRODUCTOS", "", { t: "n", f: `SUM(C7:C${L})` }]); // Row L + 2
    
    if (paymentBreakdown.discount > 0) {
      productsAOA.push(["(-) DESCUENTOS APLICADOS", "", -paymentBreakdown.discount]); // Row L + 3
      productsAOA.push(["TOTAL PRODUCTOS CON DESCUENTOS", "", { t: "n", f: `C${L + 2}+C${L + 3}` }]); // Row L + 4
    }

    const wsProducts = XLSX.utils.aoa_to_sheet(productsAOA);

    // Merge titles (A1:C1, A2:C2, A3:C3, A4:C4)
    wsProducts['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }
    ];

    const colWidthsProducts = [
      { wch: 50 }, // Producto
      { wch: 15 }, // Cantidad
      { wch: 18 }  // Total
    ];
    wsProducts['!cols'] = colWidthsProducts;

    // Apply currency format to Column C (index 2) and quantity format to Column B (index 1)
    Object.keys(wsProducts).forEach((key) => {
      if (key.startsWith('!')) return;
      const col = key.replace(/[0-9]/g, '');
      const row = parseInt(key.replace(/[^0-9]/g, ''), 10);
      
      // Skip title rows
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
      }
    });

    XLSX.utils.book_append_sheet(wb, wsProducts, "Productos");

    XLSX.writeFile(wb, `ReporteDiario_${todayOperatingDay}.xlsx`);
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
        ) : (
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
