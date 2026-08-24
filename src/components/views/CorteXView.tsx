import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { logoUrl } from 'ionicons/icons';

interface CorteXViewProps {
  cashMovements: any;
  companyConfig: any;
  corteXArqB100: any;
  corteXArqB1000: any;
  corteXArqB20: any;
  corteXArqB200: any;
  corteXArqB50: any;
  corteXArqB500: any;
  corteXArqM05: any;
  corteXArqM1: any;
  corteXArqM10: any;
  corteXArqM2: any;
  corteXArqM20: any;
  corteXArqM5: any;
  corteXFondoApertura: any;
  corteXSelectedDate: any;
  currentUser: any;
  expenses: any;
  history: any;
  paymentMethod: any;
  products: any;
  purchases: any;
  renderMaterialHeader: any;
  selectedTenant: any;
  setAppMode: any;
  setCorteXArqB100: any;
  setCorteXArqB1000: any;
  setCorteXArqB20: any;
  setCorteXArqB200: any;
  setCorteXArqB50: any;
  setCorteXArqB500: any;
  setCorteXArqM05: any;
  setCorteXArqM1: any;
  setCorteXArqM10: any;
  setCorteXArqM2: any;
  setCorteXArqM20: any;
  setCorteXArqM5: any;
  setCorteXFondoApertura: any;
  setCorteXSelectedDate: any;
  setShowCorteXCopiedToast: any;
  showCorteXCopiedToast: any;
  ticketBusinessName: any;
  ticketSucursal: any;
}

export const CorteXView: React.FC<CorteXViewProps> = ({
  cashMovements,
  companyConfig,
  corteXArqB100,
  corteXArqB1000,
  corteXArqB20,
  corteXArqB200,
  corteXArqB50,
  corteXArqB500,
  corteXArqM05,
  corteXArqM1,
  corteXArqM10,
  corteXArqM2,
  corteXArqM20,
  corteXArqM5,
  corteXFondoApertura,
  corteXSelectedDate,
  currentUser,
  expenses,
  history,
  paymentMethod,
  products,
  purchases,
  renderMaterialHeader,
  selectedTenant,
  setAppMode,
  setCorteXArqB100,
  setCorteXArqB1000,
  setCorteXArqB20,
  setCorteXArqB200,
  setCorteXArqB50,
  setCorteXArqB500,
  setCorteXArqM05,
  setCorteXArqM1,
  setCorteXArqM10,
  setCorteXArqM2,
  setCorteXArqM20,
  setCorteXArqM5,
  setCorteXFondoApertura,
  setCorteXSelectedDate,
  setShowCorteXCopiedToast,
  showCorteXCopiedToast,
  ticketBusinessName,
  ticketSucursal
}) => {
if (currentUser?.role === "mesero") {
      return (
        <IonPage>
          {renderMaterialHeader({
            title: "Acceso Restringido 🔒",
            subtitle: "Corte de movimientos del día restringido",
            showBack: true,
            onBack: () => setAppMode("floorplan"),
          })}
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-md mx-auto my-12 text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl shadow-inner mb-2">
                🔒
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Corte Restringido</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tu usuario cuenta con el rol de <strong>Mesero</strong>. Los meseros únicamente tienen autorización para tomar comandas y pedidos, y no pueden realizar cortes ni ver movimientos financieros.
              </p>
              <button
                onClick={() => setAppMode("floorplan")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow border-none cursor-pointer mt-4"
              >
                Ir al Mapa de Mesas 🍽️
              </button>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    // Calculate dates based on selected date (6:00 AM selected_day to 5:59 AM next_day)
    const getCorteXRange = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const start = new Date(year, month - 1, day, 6, 0, 0, 0);
      const end = new Date(year, month - 1, day + 1, 5, 59, 59, 999);
      return { start, end };
    };

    const { start, end } = getCorteXRange(corteXSelectedDate);

    // Filter history (completed/paid orders)
    const filteredHistory = history.filter((h) => {
      const hTime = new Date(h.timestamp);
      return (h.status === "completed" || h.isPaid) && hTime >= start && hTime <= end;
    });

    const filteredMovements = cashMovements.filter((m) => {
      const mTime = new Date(m.timestamp || m.date || new Date());
      return mTime >= start && mTime <= end;
    });

    const filteredExpensesList = expenses.filter((e) => {
      if (!e.createdAt) return false;
      const eTime = new Date(e.createdAt);
      return eTime >= start && eTime <= end;
    });

    const filteredPurchasesList = purchases.filter((p) => {
      const pTime = new Date(p.timestamp || p.date || new Date());
      return pTime >= start && pTime <= end;
    });

    // Financial calculations
    let corteXCashSales = 0;
    let corteXCashCount = 0;
    let corteXCardSales = 0;
    let corteXCardCount = 0;
    let corteXTransSales = 0;
    let corteXTransCount = 0;
    let corteXLupaySales = 0;
    let corteXLupayCount = 0;

    filteredHistory.forEach((h) => {
      const method = (h.paymentMethod || "").toLowerCase();
      const amt = Number(h.total || 0);
      if (method === "cash" || method === "efectivo") {
        corteXCashSales += amt;
        corteXCashCount++;
      } else if (method === "card" || method === "tarjeta") {
        corteXCardSales += amt;
        corteXCardCount++;
      } else if (method === "lupay") {
        corteXLupaySales += amt;
        corteXLupayCount++;
      } else {
        corteXTransSales += amt;
        corteXTransCount++;
      }
    });

    const corteXElectSales = corteXCardSales + corteXTransSales + corteXLupaySales;
    const corteXElectCount = corteXCardCount + corteXTransCount + corteXLupayCount;

    const corteXInflows = filteredMovements
      .filter((m) => m.type === "in")
      .reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const corteXOutflows = filteredMovements
      .filter((m) => m.type === "out")
      .reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const corteXExpensesAmt = filteredExpensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const corteXPurchasesAmt = filteredPurchasesList
      .filter((p) => p.isPaid && (!p.paymentMethod || ["cash", "efectivo"].includes(p.paymentMethod.toLowerCase())))
      .reduce((sum, p) => sum + Number(p.total || 0), 0);

    const totalEntradas = Number(corteXFondoApertura || 0) + corteXCashSales + corteXInflows;
    const totalSalidas = corteXExpensesAmt + corteXOutflows + corteXPurchasesAmt;

    const corteXEstimatedCash = Math.max(0, totalEntradas - totalSalidas);

    // Physical count totals
    const corteXArqTotalBilletes =
      Number(corteXArqB1000 || 0) * 1000 +
      Number(corteXArqB500 || 0) * 500 +
      Number(corteXArqB200 || 0) * 200 +
      Number(corteXArqB100 || 0) * 100 +
      Number(corteXArqB50 || 0) * 50 +
      Number(corteXArqB20 || 0) * 20;

    const corteXArqTotalMonedas =
      Number(corteXArqM20 || 0) * 20 +
      Number(corteXArqM10 || 0) * 10 +
      Number(corteXArqM5 || 0) * 5 +
      Number(corteXArqM2 || 0) * 2 +
      Number(corteXArqM1 || 0) * 1 +
      Number(corteXArqM05 || 0) * 0.5;

    const corteXArqTotal = corteXArqTotalBilletes + corteXArqTotalMonedas;
    const corteXDiferencia = corteXArqTotal - corteXEstimatedCash;

    // Product Sales list
    const productSalesMap: { [prodId: string]: { name: string; qty: number; total: number; price: number; product: any } } = {};
    filteredHistory.forEach((h) => {
      (h.comandas || []).forEach((c) => {
        (c.items || []).forEach((item) => {
          if (item.isCancelled) return;
          const prod = item.product;
          if (!prod) return;
          const liveProd = products.find((p: any) => String(p.id) === String(prod.id)) || 
                           products.find((p: any) => (p.name || "").toLowerCase().trim() === (prod.name || "").toLowerCase().trim()) || 
                           prod;
           const prodId = prod.id || prod.name;
          const qty = Number(item.quantity || 0);
          const price = Number(prod.price || 0);
          const itemTotal = qty * price;
          
          if (!productSalesMap[prodId]) {
            productSalesMap[prodId] = {
              name: getProductReportName(liveProd),
              qty: 0,
              total: 0,
              price: price,
              product: liveProd
            };
          }
          productSalesMap[prodId].qty += qty;
          productSalesMap[prodId].total += itemTotal;
        });
      });
    });
    const productSalesList = Object.values(productSalesMap).sort((a, b) => {
      const scoreA = getProductSortScore(a.product);
      const scoreB = getProductSortScore(b.product);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name);
    });

    const getCorteText = () => {
      const startLocalStr = start.toLocaleDateString("es-MX") + " " + start.toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' });
      const endLocalStr = end.toLocaleDateString("es-MX") + " " + end.toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleString("es-MX");
      const nombreNegocio = ticketBusinessName || selectedTenant?.name || "TAQUERÍA EL PASTORCITO";
      const nombreSucursal = ticketSucursal || selectedTenant?.sucursalDefault || "SUCURSAL MATRIZ";
      const cajeroNombre = currentUser?.name || "Sin Cajero";

      let text = `=================================\n`;
      text += `🏪 ${nombreNegocio.toUpperCase()}\n`;
      text += `📍 SUCURSAL: ${nombreSucursal.toUpperCase()}\n`;
      text += `=================================\n`;
      text += `📝 CORTE DE MOVIMIENTOS DEL DÍA (CORTE X)\n`;
      text += `📅 Fecha de Consulta: ${corteXSelectedDate}\n`;
      text += `⏱️ Turno: ${startLocalStr} a ${endLocalStr}\n`;
      text += `👤 Generado por: ${cajeroNombre}\n`;
      text += `⏱️ Impreso el: ${dateStr}\n`;
      text += `=================================\n\n`;

      text += `💰 ENTRADAS (INGRESOS)\n`;
      text += `---------------------------------\n`;
      text += `📥 Fondo de Apertura: $${Number(corteXFondoApertura || 0).toFixed(2)}\n`;
      text += `💵 Ventas Efectivo:   $${corteXCashSales.toFixed(2)} (${corteXCashCount} vnt)\n`;
      text += `➕ Entradas Adic:    $${corteXInflows.toFixed(2)}\n`;
      text += `---------------------------------\n`;
      text += `📈 TOTAL ENTRADAS:    $${totalEntradas.toFixed(2)}\n\n`;

      text += `🔴 EGRESOS / SALIDAS\n`;
      text += `---------------------------------\n`;
      text += `💸 Gastos y Retiros:  $${(corteXExpensesAmt + corteXOutflows).toFixed(2)}\n`;
      text += `🛒 Compras Proveed:   $${corteXPurchasesAmt.toFixed(2)}\n`;
      text += `---------------------------------\n`;
      text += `📉 TOTAL SALIDAS:     $${totalSalidas.toFixed(2)}\n\n`;

      text += `🧮 CONCILIACIÓN DE CAJA\n`;
      text += `---------------------------------\n`;
      text += `📊 Balance Esperado:  $${corteXEstimatedCash.toFixed(2)}\n`;
      text += `🪙 Conteo Arqueo Real: $${corteXArqTotal.toFixed(2)}\n`;
      text += `---------------------------------\n`;

      const absDif = Math.abs(corteXDiferencia).toFixed(2);
      if (corteXArqTotal === 0) {
        text += `⚪ SIN CONTEO FÍSICO REGISTRADO\n`;
      } else if (corteXDiferencia < 0) {
        text += `⚠️ FALTANTE CAJA:   -$${absDif}\n`;
      } else if (corteXDiferencia > 0) {
        text += `💰 SOBRANTE CAJA:   +$${absDif}\n`;
      } else {
        text += `✅ CAJA CUADRADA EXCELENTE\n`;
      }
      text += `=================================\n\n`;

      text += `💳 VENTAS ELECTRÓNICAS (INFORMATIVO)\n`;
      text += `---------------------------------\n`;
      text += `💳 Ventas Tarjeta:    $${corteXCardSales.toFixed(2)} (${corteXCardCount} vnt)\n`;
      text += `📲 Transferencias:    $${corteXTransSales.toFixed(2)} (${corteXTransCount} vnt)\n`;
      text += `📱 Cuentas LUPAY:     $${corteXLupaySales.toFixed(2)} (${corteXLupayCount} vnt)\n`;
      text += `---------------------------------\n`;
      text += `💳 Total Electrónico: $${corteXElectSales.toFixed(2)} (${corteXElectCount} vnt)\n`;
      text += `=================================\n\n`;

      if (productSalesList.length > 0) {
        text += `🍔 PRODUCTOS VENDIDOS DEL DÍA\n`;
        text += `---------------------------------\n`;
        productSalesList.forEach((p) => {
          text += `${p.qty.toFixed(1).padStart(5)}x ${p.name.substring(0, 16).padEnd(16)} $${p.total.toFixed(2)}\n`;
        });
        text += `=================================\n`;
      }

      return text;
    };

    const handleShareWhatsApp = () => {
      const text = getCorteText();
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    };

    const handleCopyClipboard = () => {
      const text = getCorteText();
      navigator.clipboard.writeText(text);
      setShowCorteXCopiedToast(true);
      setTimeout(() => setShowCorteXCopiedToast(false), 3000);
    };

    const handlePrintCorte = () => {
      const text = getCorteText();
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <style>
              @media print {
                body { margin: 0; padding: 0; background: #fff; }
                @page { margin: 0; }
              }
              body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 13px;
                color: #000;
                width: 300px;
                margin: 0 auto;
                padding: 15px;
                background: #fff;
                box-sizing: border-box;
              }
              .center { text-align: center; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${companyConfig.logoUrl ? `
              <div class="center" style="display: flex; justify-content: center; margin-bottom: 12px;">
                <img src="${companyConfig.logoUrl}" style="max-height: 32px; max-width: 90px; object-fit: contain;" />
              </div>
            ` : ""}
            <pre style="font-family: monospace; font-size: 13px; line-height: 1.4; color: #000; margin: 0; white-space: pre-wrap;">${text}</pre>
          </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert("Por favor permite las ventanas emergentes para poder imprimir el reporte.");
      }
    };

    return (
      <IonPage>
        {renderMaterialHeader({
          title: "Corte de movimientos del día",
          subtitle: "Consulta del día de trabajo (Corte X)",
          showBack: true,
          onBack: () => setAppMode("floorplan"),
        })}

        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="max-w-4xl mx-auto space-y-5">
            
            {/* Top custom warning / banner explaining the 6am to 5:59am logic */}
            <div className="bg-indigo-900 text-indigo-100 rounded-3xl p-5 shadow-lg border border-indigo-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[12px] font-black uppercase tracking-wider bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full">
                  Cintillo de arriba 🌮
                </span>
                <h3 className="text-lg font-black tracking-tight mt-1 text-white">Corte de movimientos del día</h3>
                <p className="text-xs text-indigo-200/90 leading-relaxed max-w-xl">
                  Las taquerías funcionan casi 24 horas y cierran de madrugada. Por ello, la primera venta del día se considera desde las <strong>6:00 AM</strong> del día seleccionado hasta las <strong>5:59 AM</strong> del día siguiente.
                </p>
              </div>
              
              {/* Date Selector Form */}
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Seleccionar Fecha:</span>
                  <input
                    type="date"
                    value={corteXSelectedDate}
                    onChange={(e) => setCorteXSelectedDate(e.target.value)}
                    className="p-1.5 border border-indigo-400/30 rounded-xl bg-indigo-950 text-white font-extrabold focus:outline-none focus:border-amber-400 text-xs cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Fondo Inicial ($):</span>
                  <input
                    type="number"
                    value={corteXFondoApertura}
                    onChange={(e) => setCorteXFondoApertura(Number(e.target.value) || 0)}
                    onBlur={(e) => saveCorteXFondoApertura(Number(e.target.value) || 0)}
                    className="p-1.5 w-24 border border-indigo-400/30 rounded-xl bg-indigo-950 text-white font-extrabold focus:outline-none focus:border-amber-400 text-xs"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Range info banner */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⏱️</span>
                <div className="text-left">
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Rango de Horarios de este Corte</span>
                  <span className="text-xs font-black text-slate-700">
                    Del {start.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })} al {end.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const todayStr = getMexicoISOString().split("T")[0];
                    setCorteXSelectedDate(todayStr);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition border-none cursor-pointer"
                >
                  Hoy
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    const yestStr = d.toISOString().split("T")[0];
                    setCorteXSelectedDate(yestStr);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition border-none cursor-pointer"
                >
                  Ayer
                </button>
              </div>
            </div>

            {/* Floating Copied Toast Notification */}
            {showCorteXCopiedToast && (
              <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-500">
                <span>📋</span>
                <span>¡Corte copiado al portapapeles! Listo para enviar.</span>
              </div>
            )}

            {/* Main grid with calculations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              
              {/* Financial Box Left Panel */}
              <div className="md:col-span-2 space-y-5">
                
                {/* INGRESOS CARD */}
                <div className="bg-emerald-50/40 rounded-3xl p-5 border border-emerald-100/50 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-lg">🟢</span>
                      <span className="font-black text-sm text-slate-800 uppercase tracking-wide">Ingresos y Entradas de Caja</span>
                    </div>
                    <span className="font-black text-emerald-600 text-sm">+${totalEntradas.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    {/* Item: Fondo de caja */}
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-700 block">📥 Fondo Inicial de Apertura</span>
                        <span className="text-[12px] text-slate-400 font-medium">Monto con el que inicia caja en la mañana</span>
                      </div>
                      <span className="text-xs font-black text-slate-700">${Number(corteXFondoApertura || 0).toFixed(2)}</span>
                    </div>

                    {/* Item: Ventas en Efectivo */}
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-700 block">💵 Ventas en Efectivo del Día</span>
                        <span className="text-[12px] text-emerald-600 font-bold">({corteXCashCount} comandas cobradas)</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600">+${corteXCashSales.toFixed(2)}</span>
                    </div>

                    {/* Item: Entradas Extra */}
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-700 block">➕ Entradas de Efectivo Adicionales</span>
                        <span className="text-[12px] text-slate-400 font-medium">Otros ingresos a caja (p. ej. cambio del banco)</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600">+${corteXInflows.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* EGRESOS CARD */}
                <div className="bg-rose-50/40 rounded-3xl p-5 border border-rose-100/50 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500 text-lg">🔴</span>
                      <span className="font-black text-sm text-slate-800 uppercase tracking-wide">Salidas y Egresos de Caja</span>
                    </div>
                    <span className="font-black text-rose-600 text-sm">-${totalSalidas.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    {/* Item: Gastos & Retiros */}
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-700 block">💸 Gastos Registrados & Retiros</span>
                        <span className="text-[12px] text-rose-600 font-bold">({filteredExpensesList.length + filteredMovements.filter(m => m.type === "out").length} movimientos)</span>
                      </div>
                      <span className="text-xs font-black text-rose-600">-${(corteXExpensesAmt + corteXOutflows).toFixed(2)}</span>
                    </div>

                    {/* Item: Compras Proveedores */}
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-700 block">🛒 Compras a Proveedores (Efectivo)</span>
                        <span className="text-[12px] text-orange-700 font-bold">({filteredPurchasesList.filter(p => p.isPaid).length} pagadas en efectivo)</span>
                      </div>
                      <span className="text-xs font-black text-rose-600">-${corteXPurchasesAmt.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* ARQUEO FISICO CARD */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 text-lg">🧮</span>
                      <span className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Arqueo de Monedas y Billetes</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">Conteo Manual Directo 🪙</span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Ingresa la cantidad física de billetes y monedas que hay en caja al final del día. El sistema calculará la diferencia automáticamente.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Billete 1000 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$1000 (Billete)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqB1000}
                        onChange={(e) => setCorteXArqB1000(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Billete 500 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$500 (Billete)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqB500}
                        onChange={(e) => setCorteXArqB500(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Billete 200 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$200 (Billete)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqB200}
                        onChange={(e) => setCorteXArqB200(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Billete 100 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$100 (Billete)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqB100}
                        onChange={(e) => setCorteXArqB100(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Billete 50 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$50 (Billete)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqB50}
                        onChange={(e) => setCorteXArqB50(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Billete 20 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$20 (Billete)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqB20}
                        onChange={(e) => setCorteXArqB20(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Moneda 20 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$20 (Moneda)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqM20}
                        onChange={(e) => setCorteXArqM20(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Moneda 10 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$10 (Moneda)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqM10}
                        onChange={(e) => setCorteXArqM10(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Moneda 5 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$5 (Moneda)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqM5}
                        onChange={(e) => setCorteXArqM5(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Moneda 2 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$2 (Moneda)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqM2}
                        onChange={(e) => setCorteXArqM2(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Moneda 1 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$1 (Moneda)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqM1}
                        onChange={(e) => setCorteXArqM1(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {/* Moneda 0.50 */}
                    <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[12px] font-extrabold text-slate-500">$0.50 (Moneda)</span>
                      <input
                        type="number"
                        min="0"
                        value={corteXArqM05}
                        onChange={(e) => setCorteXArqM05(e.target.value)}
                        className="mt-1 p-1 text-center font-black bg-white rounded-lg border border-slate-200 text-slate-800 text-xs w-full focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Reset button inside Arqueo */}
                  <div className="text-right">
                    <button
                      onClick={() => {
                        setCorteXArqB1000("0"); setCorteXArqB500("0"); setCorteXArqB200("0"); setCorteXArqB100("0"); setCorteXArqB50("0"); setCorteXArqB20("0");
                        setCorteXArqM20("0"); setCorteXArqM10("0"); setCorteXArqM5("0"); setCorteXArqM2("0"); setCorteXArqM1("0"); setCorteXArqM05("0");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-3 py-1 rounded text-[12px] border-none cursor-pointer transition"
                    >
                      Limpiar Conteo 🧹
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side summary column */}
              <div className="space-y-5">
                
                {/* ACTIONS CARD */}
                <div className="bg-[#1e1b4b] text-white rounded-3xl p-5 shadow-lg border border-indigo-950/40 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Acciones del Reporte</h4>
                  <p className="text-[11px] text-indigo-200 leading-relaxed">
                    Comparte, descarga o imprime este corte de caja directamente.
                  </p>
                  <div className="flex flex-col gap-2 pt-1.5">
                    <button
                      onClick={handleCopyClipboard}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>📋 Copiar Reporte TXT</span>
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>💬 Enviar por WhatsApp</span>
                    </button>
                    <button
                      onClick={handlePrintCorte}
                      className="bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold py-2.5 px-4 rounded-xl text-xs transition border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>🖨️ Imprimir Reporte</span>
                    </button>
                  </div>
                </div>

                {/* SUMMARY STATS CARD */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">📊 Resumen de Resultados</h4>
                  
                  <div className="space-y-3 text-left">
                    <div>
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Balance Esperado (Efectivo)</span>
                      <span className="text-lg font-black text-slate-800">${corteXEstimatedCash.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Conteo Físico Real</span>
                      <span className="text-lg font-black text-indigo-900">${corteXArqTotal.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Diferencia de Caja</span>
                      {corteXArqTotal === 0 ? (
                        <span className="text-xs font-bold text-slate-400">Sin conteo (ingresa monedas/billetes)</span>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-base font-black ${corteXDiferencia < 0 ? "text-rose-600" : corteXDiferencia > 0 ? "text-emerald-600" : "text-emerald-600"}`}>
                            {corteXDiferencia >= 0 ? "+" : ""}${corteXDiferencia.toFixed(2)}
                          </span>
                          <span className={`text-[11px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            corteXDiferencia < 0 ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            corteXDiferencia > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {corteXDiferencia < 0 ? "⚠️ Faltante" : corteXDiferencia > 0 ? "💰 Sobrante" : "✅ Cuadrado"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* VENTAS ELECTRONICAS CARD */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">💳 Ventas Electrónicas (Informativo)</h4>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                    Pagos recibidos mediante Tarjetas o Transferencias Bancarias. Estos fondos no ingresan a la caja física.
                  </p>
                  
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>💳 Tarjeta Bancaria:</span>
                      <span className="font-bold text-slate-800">${corteXCardSales.toFixed(2)} ({corteXCardCount} vts)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>📲 Transferencias SPEI:</span>
                      <span className="font-bold text-slate-800">${corteXTransSales.toFixed(2)} ({corteXTransCount} vts)</span>
                    </div>
                    <div className="border-t border-slate-100 my-1" />
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-700">
                      <span>Total Electrónico:</span>
                      <span>${corteXElectSales.toFixed(2)} ({corteXElectCount} vts)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* PRODUCT SALES LIST SECTION */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍔</span>
                  <span className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Platillos y Productos Vendidos</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {productSalesList.length} productos diferentes
                </span>
              </div>

              {productSalesList.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold">
                  No hay ventas registradas en este período de tiempo 📭
                </div>
              ) : (
                <div className="overflow-x-auto animate-fadeIn">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 text-[12px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-2.5">Producto</th>
                        <th className="py-2.5 text-center">Cant. Vendida</th>
                        <th className="py-2.5 text-right">Precio Unitario</th>
                        <th className="py-2.5 text-right">Monto Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productSalesList.map((p, i) => (
                        <tr key={`px-prod-${i}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-extrabold text-slate-800">{p.name}</td>
                          <td className="py-3 text-center font-black text-indigo-600 bg-indigo-50/30 rounded-lg">{p.qty.toFixed(1)}</td>
                          <td className="py-3 text-right font-bold text-slate-500">${p.price.toFixed(2)}</td>
                          <td className="py-3 text-right font-extrabold text-slate-800">${p.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </IonContent>
      </IonPage>
    );
};
