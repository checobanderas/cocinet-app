import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';


interface ReportsViewProps {
  expenses: any;
  history: any;
  invReportDate: any;
  inventory: any;
  inventoryMovements: any;
  invoicePhone: any;
  paymentMethod: any;
  products: any;
  purchases: any;
  renderMaterialHeader: any;
  reportsTab: any;
  requiresInvoice: any;
  setAppMode: any;
  setInvReportDate: any;
  setReportsTab: any;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  history,
  invReportDate,
  inventory,
  inventoryMovements,
  invoicePhone,
  paymentMethod,
  products,
  purchases,
  renderMaterialHeader,
  reportsTab,
  requiresInvoice,
  setAppMode,
  setInvReportDate,
  setReportsTab
}) => {
// Analytics calculations from history
    const totalSales = history.reduce((sum, h) => sum + (h.total || 0), 0);
    const totalAccountsCount = history.length;
    const averageTicket =
      totalAccountsCount > 0 ? totalSales / totalAccountsCount : 0;

    // Splits
    const cashSales = history
      .filter((h) => h.paymentMethod === "cash")
      .reduce((sum, h) => sum + (h.total || 0), 0);
    const cardSales = history
      .filter((h) => h.paymentMethod === "card")
      .reduce((sum, h) => sum + (h.total || 0), 0);
    const transferSales = history
      .filter((h) => h.paymentMethod === "transfer")
      .reduce((sum, h) => sum + (h.total || 0), 0);

    // Categories statistics
    let foodQtyCount = 0;
    let drinkQtyCount = 0;
    let dessertQtyCount = 0;

    history.forEach((h) => {
      (h.items || []).forEach((item) => {
        // find product category
        const prod = products.find(
          (p) => p.id === item.productId || p.name === item.name,
        );
        const cat = prod?.category || "food";
        if (cat === "drinks") drinkQtyCount += item.quantity || 1;
        else if (cat === "desserts") dessertQtyCount += item.quantity || 1;
        else foodQtyCount += item.quantity || 1;
      });
    });

    const totalItemsSoldCount = foodQtyCount + drinkQtyCount + dessertQtyCount;

    // --- REPORTES DIARIOS DE INVENTARIO ---
    const selectedDateStr = invReportDate;

    // Movements that occurred strictly AFTER the selected date
    const futureMovements = inventoryMovements.filter((mov) => {
      if (!mov.timestamp) return false;
      const movDate = mov.timestamp.slice(0, 10);
      return movDate > selectedDateStr;
    });

    // Movements of the selected date itself
    const dayMovements = inventoryMovements.filter((mov) => {
      if (!mov.timestamp) return false;
      return mov.timestamp.slice(0, 10) === selectedDateStr;
    });

    // Purchases made on the selected date to compute purchase expenses
    const dayPurchases = purchases.filter((p) => {
      if (!p.timestamp) return false;
      return p.timestamp.slice(0, 10) === selectedDateStr;
    });

    // Calculate report data for each inventory item
    const inventoryReportData = inventory.map((inv) => {
      const liveStock = inv.stock || 0;
      const cost = inv.cost || 0;

      // Sum of subsequent movements that affected the stock between selected date and today
      const futureSum = futureMovements
        .filter((mov) => mov.inventoryItemId === inv.id)
        .reduce((sum, mov) => sum + (mov.qty || 0), 0);

      const finalStock = liveStock - futureSum;

      // Movements of the selected date itself for this item
      const itemDayMovs = dayMovements.filter(
        (mov) => mov.inventoryItemId === inv.id,
      );

      // Total quantity purchased today
      const compraQty = itemDayMovs
        .filter((mov) => mov.type === "compra")
        .reduce((sum, mov) => sum + (mov.qty || 0), 0);

      // Total quantity sold today (negatives, represent sales consumption, get absolute magnitude)
      const ventaQty = Math.abs(
        itemDayMovs
          .filter((mov) => mov.type === "venta")
          .reduce((sum, mov) => sum + (mov.qty || 0), 0),
      );

      // Total quantity adjusted manually today (entrada or salida, excluding compra & venta)
      const ajusteQty = itemDayMovs
        .filter((mov) => mov.type !== "compra" && mov.type !== "venta")
        .reduce((sum, mov) => sum + (mov.qty || 0), 0);

      const daySum = itemDayMovs.reduce((sum, mov) => sum + (mov.qty || 0), 0);
      const startingStock = finalStock - daySum;

      // Expenses incurred for sales (money spent on purchases of this item today)
      let actualPurchaseExpense = 0;
      dayPurchases.forEach((p) => {
        (p.items || []).forEach((pItem: any) => {
          if (pItem.inventoryItemId === inv.id) {
            actualPurchaseExpense += pItem.price || 0;
          }
        });
      });

      // Cost of goods sold (COGS)
      const cogs = ventaQty * cost;

      return {
        id: inv.id,
        name: inv.name,
        unit: inv.unit,
        startingStock,
        compraQty,
        ventaQty,
        ajusteQty,
        finalStock,
        cogs,
        actualPurchaseExpense,
        cost,
      };
    });

    const totalCOGS = inventoryReportData.reduce(
      (sum, row) => sum + row.cogs,
      0,
    );
    const totalPurchasesExpense = inventoryReportData.reduce(
      (sum, row) => sum + row.actualPurchaseExpense,
      0,
    );

    const handlePrintInventoryReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const html = `
        <html>
          <head>
            <title>Reporte Diario de Inventario - ${invReportDate}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; }
              h1 { margin: 0 0 5px 0; color: #1e293b; font-size: 1.8rem; }
              .date { color: #64748b; font-size: 1.1rem; margin-bottom: 25px; }
              .summary-box { display: flex; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
              .summary-card { flex: 1; }
              .summary-card h4 { margin: 0 0 5px 0; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
              .summary-card p { margin: 0; font-size: 1.6rem; font-weight: bold; color: #1e293b; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 0.8rem; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
              td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
              tr:nth-child(even) { background: #f8fafc; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
            </style>
          </head>
          <body>
            <h1>📋 Reporte Diario de Inventario</h1>
            <div class="date">Fecha del reporte: <strong>${invReportDate}</strong></div>
            
            <div class="summary-box">
              <div class="summary-card">
                <h4>Costo de Ventas (COGS)</h4>
                <p style="color: #4f46e5;">$${totalCOGS.toFixed(2)}</p>
              </div>
              <div class="summary-card">
                <h4>Gastos por Compras</h4>
                <p style="color: #059669;">$${totalPurchasesExpense.toFixed(2)}</p>
              </div>
              <div class="summary-card">
                <h4>Insumos en Catálogo</h4>
                <p>${inventory.length}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th class="text-right">Stock Inicial</th>
                  <th class="text-right">Compras (+)</th>
                  <th class="text-right">Ventas (-)</th>
                  <th class="text-right">Ajustes (+/-)</th>
                  <th class="text-right">Stock Final</th>
                  <th class="text-right">Costo Unit.</th>
                  <th class="text-right">Costo Ventas (COGS)</th>
                  <th class="text-right">Gasto Compras</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryReportData
                  .map(
                    (row) => `
                  <tr>
                    <td><strong>${row.name}</strong> (${row.unit})</td>
                    <td class="text-right">${row.startingStock.toFixed(2)}</td>
                    <td class="text-right">${row.compraQty > 0 ? "+" + row.compraQty.toFixed(2) : "0.00"}</td>
                    <td class="text-right">${row.ventaQty > 0 ? "-" + row.ventaQty.toFixed(2) : "0.00"}</td>
                    <td class="text-right">${row.ajusteQty !== 0 ? (row.ajusteQty > 0 ? "+" + row.ajusteQty.toFixed(2) : row.ajusteQty.toFixed(2)) : "0.00"}</td>
                    <td class="text-right" style="font-weight: bold; color: #1e293b;">${row.finalStock.toFixed(2)}</td>
                    <td class="text-right">$${row.cost.toFixed(2)}</td>
                    <td class="text-right" style="color: #4f46e5; font-weight: 600;">$${row.cogs.toFixed(2)}</td>
                    <td class="text-right" style="color: #059669; font-weight: 600;">$${row.actualPurchaseExpense.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div style="margin-top: 40px; text-align: center; font-size: 0.8rem; color: #94a3b8;">
              Reporte generado automáticamente • Sincronizado en tiempo real
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Estadísticas y Reportes Financieros",
        subtitle: "Métricas de Desempeño y Caja",
        showBack: true,
        onBack: () => setAppMode("floorplan"),
      })}
        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >
          <div className="max-w-6xl mx-auto py-4">
            {/* Tab Selector Headers */}
            <div className="flex border-b border-slate-200 mb-6 gap-6">
              <button
                onClick={() => setReportsTab("sales")}
                className={`pb-3 font-bold text-sm transition-all duration-200 border-b-2 px-1 ${
                  reportsTab === "sales"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                📊 Resumen de Ventas
              </button>
              <button
                onClick={() => setReportsTab("inventory")}
                className={`pb-3 font-bold text-sm transition-all duration-200 border-b-2 px-1 ${
                  reportsTab === "inventory"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                📋 Reporte Diario de Inventario
              </button>
            </div>

            {reportsTab === "sales" ? (
              <>
                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md border-b-4 border-indigo-700">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Ventas Históricas Totales
                    </span>
                    <span className="text-3xl font-black block">
                      $
                      {totalSales.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Total acumulado de todas las cuentas cerradas
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl p-6 shadow-md border-b-4 border-emerald-700">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Cuentas Procesadas
                    </span>
                    <span className="text-3xl font-black block">
                      {totalAccountsCount} cuentas
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Comensales totales atendidos físicamente
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 shadow-md border-b-4 border-amber-700">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Ticket Promedio
                    </span>
                    <span className="text-3xl font-black block">
                      $
                      {averageTicket.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Consumo promedio por mesas facturadas
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-6 shadow-md border-b-4 border-purple-700">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Insumos y Productos
                    </span>
                    <span className="text-3xl font-black block">
                      {products.length} platillos
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Activos en el catálogo de carta
                    </span>
                  </div>
                </div>

                {/* Middle Section: Payment Breakdown & Popular Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Payment Methods */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      💳 Métodos de Pago Distribuidos
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm font-semibold mb-1 col-slate-500">
                          <span>Efectivo 💵</span>
                          <span>
                            ${cashSales.toFixed(2)} (
                            {totalSales > 0
                              ? ((cashSales / totalSales) * 100).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${totalSales > 0 ? (cashSales / totalSales) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm font-semibold mb-1 col-slate-500">
                          <span>Tarjeta de Débito/Crédito 💳</span>
                          <span>
                            ${cardSales.toFixed(2)} (
                            {totalSales > 0
                              ? ((cardSales / totalSales) * 100).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{
                              width: `${totalSales > 0 ? (cardSales / totalSales) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm font-semibold mb-1 col-slate-500">
                          <span>Transferencia Bancaria 📲</span>
                          <span>
                            ${transferSales.toFixed(2)} (
                            {totalSales > 0
                              ? ((transferSales / totalSales) * 100).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{
                              width: `${totalSales > 0 ? (transferSales / totalSales) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Popular Categories */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      🍕 Volumen de Venta por Categoría
                    </h3>
                    {totalItemsSoldCount === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-400">
                        Aún no se registran consumos de platos.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm font-semibold mb-1">
                            <span>Comida 🌮</span>
                            <span>
                              {foodQtyCount} unidades (
                              {(
                                (foodQtyCount / totalItemsSoldCount) *
                                100
                              ).toFixed(0)}
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full"
                              style={{
                                width: `${(foodQtyCount / totalItemsSoldCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm font-semibold mb-1">
                            <span>Bebidas 🍹</span>
                            <span>
                              {drinkQtyCount} unidades (
                              {(
                                (drinkQtyCount / totalItemsSoldCount) *
                                100
                              ).toFixed(0)}
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-500 h-full rounded-full"
                              style={{
                                width: `${(drinkQtyCount / totalItemsSoldCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm font-semibold mb-1">
                            <span>Postres 🍰</span>
                            <span>
                              {dessertQtyCount} unidades (
                              {(
                                (dessertQtyCount / totalItemsSoldCount) *
                                100
                              ).toFixed(0)}
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-fuchsia-500 h-full rounded-full"
                              style={{
                                width: `${(dessertQtyCount / totalItemsSoldCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Transaction log */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm pb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 font-sans">
                    📋 Listado de Cuentas Recientes Cobradas
                  </h3>
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-400">
                      Aún no hay transacciones cobradas.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-50 rounded-2xl">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 font-bold text-slate-600">
                              ID / Cuenta
                            </th>
                            <th className="p-4 font-bold text-slate-600">
                              Fecha / Hora
                            </th>
                            <th className="p-4 font-bold text-slate-600">
                              Mesa
                            </th>
                            <th className="p-4 font-bold text-slate-600">
                              Método
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right">
                              Subtotal
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right">
                              Propina
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.slice(0, 10).map((h) => (
                            <tr
                              key={h.id}
                              className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                            >
                              <td className="p-4 font-semibold text-slate-700 font-sans">
                                Comanda {h.id.slice(-5).toUpperCase()}
                              </td>
                              <td className="p-4 text-slate-500">
                                {h.timestamp instanceof Date
                                  ? h.timestamp.toLocaleString("es-MX", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })
                                  : new Date(h.timestamp).toLocaleString(
                                      "es-MX",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )}
                              </td>
                              <td className="p-4 font-bold text-slate-800">
                                {h.tableName || "Mesa"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                                    h.paymentMethod === "cash"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : h.paymentMethod === "card"
                                        ? "bg-sky-50 text-sky-700 border border-sky-100"
                                        : "bg-purple-50 text-purple-700 border border-purple-100"
                                  }`}
                                >
                                  <span
                                    style={{ fontSize: "1.6rem" }}
                                     title={
                                       (h.paymentMethod === "cash"
                                         ? "Efectivo"
                                         : h.paymentMethod === "card"
                                           ? "Tarjeta"
                                           : h.paymentMethod === "lupay"
                                             ? "Lúpay"
                                             : "Transferencia") +
                                       (h.requiresInvoice ? ` - Requiere Factura (${h.invoicePhone || "Sin tel."})` : "")
                                     }
                                   >
                                     {h.paymentMethod === "cash"
                                       ? "💵"
                                       : h.paymentMethod === "card"
                                         ? "💳"
                                         : h.paymentMethod === "lupay"
                                           ? "⚡"
                                           : "🏦"}
                                     {h.requiresInvoice && (h.invoicePhone ? ` 🧾 (${h.invoicePhone})` : " 🧾")}
                                  </span>
                                </span>
                              </td>
                              <td className="p-4 text-right text-slate-600">
                                ${(h.subtotal || 0).toFixed(2)}
                              </td>
                              <td className="p-4 text-right text-slate-600">
                                ${(h.tip || 0).toFixed(2)}
                              </td>
                              <td className="p-4 text-right font-bold text-slate-800">
                                ${(h.total || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* --- SECCIÓN DETALLADA DEL REPORTE DIARIO DE INVENTARIO --- */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      Seleccionar Día del Reporte:
                    </span>
                    <input
                      type="date"
                      value={invReportDate}
                      onChange={(e) => setInvReportDate(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrintInventoryReport}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition shadow-sm hover:shadow"
                    >
                      <span>Imprimir / Descargar Reporte 🖨️</span>
                    </button>
                  </div>
                </div>

                {/* Report KPI Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md border-b-4 border-indigo-700">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Costo de Ventas Diario (COGS)
                    </span>
                    <span className="text-3xl font-black block">
                      $
                      {totalCOGS.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Costo total de insumos consumidos por ventas
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl p-6 shadow-md border-b-4 border-emerald-700">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Gastos en Compras de Insumos
                    </span>
                    <span className="text-3xl font-black block">
                      $
                      {totalPurchasesExpense.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Monto invertido en compras registradas hoy
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-3xl p-6 shadow-md border-b-4 border-slate-900">
                    <span className="text-xs font-bold opacity-85 uppercase tracking-widest block mb-1">
                      Insumos Registrados
                    </span>
                    <span className="text-3xl font-black block">
                      {inventory.length} materias primas
                    </span>
                    <span className="text-xs opacity-75 mt-3 block">
                      Total de ingredientes en catálogo
                    </span>
                  </div>
                </div>

                {/* Table card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 font-sans">
                    <span>📋 Balance Detallado de Insumos</span>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 py-1 px-2.5 rounded-full">
                      Cierre del día coincide con apertura del día siguiente
                    </span>
                  </h3>

                  {inventoryReportData.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-medium font-sans">
                      No hay insumos registrados en el catálogo.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 font-bold text-slate-600">
                              Insumo
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Apertura (Inic.)
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Compras (+)
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Consumo Ventas (-)
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Ajustes (+/-)
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Cierre (Final)
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Costo Unit.
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Costo Venta (COGS)
                            </th>
                            <th className="p-4 font-bold text-slate-600 text-right font-sans">
                              Gasto Compra
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryReportData.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b border-slate-50 hover:bg-slate-50/30 transition"
                            >
                              <td className="p-4 font-bold text-slate-800 font-sans">
                                {row.name}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  ({row.unit})
                                </span>
                              </td>
                              <td className="p-4 text-right text-slate-700 font-medium font-sans">
                                {row.startingStock.toFixed(2)}
                              </td>
                              <td className="p-4 text-right text-emerald-600 font-semibold font-sans">
                                {row.compraQty > 0
                                  ? `+${row.compraQty.toFixed(2)}`
                                  : "0.00"}
                              </td>
                              <td className="p-4 text-right text-rose-600 font-semibold font-sans">
                                {row.ventaQty > 0
                                  ? `-${row.ventaQty.toFixed(2)}`
                                  : "0.00"}
                              </td>
                              <td
                                className={`p-4 text-right font-semibold font-sans ${row.ajusteQty > 0 ? "text-emerald-600" : row.ajusteQty < 0 ? "text-rose-600" : "text-slate-500"}`}
                              >
                                {row.ajusteQty !== 0
                                  ? row.ajusteQty > 0
                                    ? `+${row.ajusteQty.toFixed(2)}`
                                    : row.ajusteQty.toFixed(2)
                                  : "0.00"}
                              </td>
                              <td className="p-4 text-right text-slate-900 font-extrabold bg-slate-50/50 font-sans">
                                {row.finalStock.toFixed(2)}
                              </td>
                              <td className="p-4 text-right text-slate-600 font-sans">
                                ${row.cost.toFixed(2)}
                              </td>
                              <td className="p-4 text-right text-indigo-600 font-bold font-sans">
                                ${row.cogs.toFixed(2)}
                              </td>
                              <td className="p-4 text-right text-emerald-600 font-bold font-sans">
                                ${row.actualPurchaseExpense.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
};
