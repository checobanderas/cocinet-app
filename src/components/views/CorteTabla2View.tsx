import { MultiTurnModal } from '../modals/MultiTurnModal';
import { CorteCuentasFolioRecord, saveCorteFolioRecordToFirebase } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';


interface CorteTabla2ViewProps {
  multiTurnData: any;
  handleExportMultiTurnCSV: any;
  setSelectedMultiTurnDate: any;
  selectedMultiTurnDate: any;
  ClosedAccount: any;
  corte2FolioAnterior: any;
  corte2MontoObjetivo: any;
  corte2Records: any;
  corte2SelectedAccountIds: any;
  corte2SelectedDate: any;
  currentUser: any;
  handleSendWhatsAppInvoice: any;
  history: any;
  invoicePhone: any;
  multiTurnEndDate: any;
  multiTurnStartDate: any;
  paymentMethod: any;
  requiresInvoice: any;
  selectedTenant: any;
  setCorte2FolioAnterior: any;
  setCorte2MontoObjetivo: any;
  setCorte2SelectedAccountIds: any;
  setCorte2SelectedDate: any;
  setMenuToastMessage: any;
  setMultiTurnEndDate: any;
  setMultiTurnPreviewReady: any;
  multiTurnPreviewReady: any;
  setMultiTurnStartDate: any;
  setProductSalesMap: any;
  setShowMenuToast: any;
  setShowMultiTurnModal: any;
  setShowSidebar: any;
  showMultiTurnModal: any;
  account: any;
  cancelled: any;
  reprintAccount: any;
  saved: any;
  sorted: any;
  historyLoaded?: boolean;
}

export const CorteTabla2View: React.FC<CorteTabla2ViewProps> = ({
  corte2FolioAnterior,
  corte2MontoObjetivo,
  corte2Records,
  corte2SelectedAccountIds,
  corte2SelectedDate,
  currentUser,
  handleSendWhatsAppInvoice,
  history,
  invoicePhone,
  multiTurnEndDate,
  multiTurnStartDate,
  paymentMethod,
  requiresInvoice,
  selectedTenant,
  setCorte2FolioAnterior,
  setCorte2MontoObjetivo,
  setCorte2SelectedAccountIds,
  setCorte2SelectedDate,
  setMenuToastMessage,
  setMultiTurnEndDate,
  setMultiTurnPreviewReady,
  multiTurnPreviewReady,
  setMultiTurnStartDate,
  setProductSalesMap,
  setShowMenuToast,
  setShowMultiTurnModal,
  setShowSidebar,
  showMultiTurnModal,
  account, cancelled, reprintAccount, saved, sorted,
  multiTurnData,
  handleExportMultiTurnCSV,
  setSelectedMultiTurnDate,
  selectedMultiTurnDate,
  ClosedAccount,
  historyLoaded
}) => {
// Role check: Only allowed for non-cajero and non-mesero
    if (["cajero", "mesero"].includes(currentUser?.role || "")) {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar color="light" className="border-b border-stone-300">
              <IonButtons slot="start">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-white bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                >
                  ☰ Menú
                </button>
              </IonButtons>
              <IonTitle className="font-black text-stone-800">📑 Historial de Cortes 2</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-[#f4f3ec] text-stone-800">
            <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-stone-300 rounded-3xl text-center shadow-xl space-y-3">
              <span className="text-6xl block">🛑</span>
              <h2 className="text-2xl font-black text-rose-600">Acceso Restringido</h2>
              <p className="text-stone-700 font-bold leading-relaxed text-sm">
                Este módulo de Foliación Interna y Nivelación de Cortes 2 es de uso exclusivo para Administración, Gerencia y Propietario.
              </p>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    // Helper shift date key (attributes early morning 00:00 - 04:59 to previous day's shift in LOCAL timezone)
    const getShiftKey = (timestamp: any) => {
      if (!timestamp) return "";
      const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(d.getTime())) return "";
      const shifted = new Date(d);
      if (shifted.getHours() < 5) {
        shifted.setDate(shifted.getDate() - 1);
      }
      const y = shifted.getFullYear();
      const m = String(shifted.getMonth() + 1).padStart(2, "0");
      const day = String(shifted.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    // Helper check if account is Lupay (Lupay accounts are completely excluded)
    const isLupayAccount = (acc: ClosedAccount) => {
      const method = (acc.paymentMethod || "").toLowerCase();
      return method.includes("lupay") || (acc as any).isLupay || (acc as any).paymentCategory === "lupay";
    };

    // Group history accounts by shift date (excluding cancelled, Lupay, and $0.00 accounts)
    const shiftAccountsMap: Record<string, ClosedAccount[]> = {};
    (history || []).forEach((acc) => {
      const amt = Number(acc.total || 0);
      if (acc.status === "cancelled" || isLupayAccount(acc) || amt <= 0) return;
      const key = getShiftKey(acc.timestamp);
      if (!key) return;
      if (!shiftAccountsMap[key]) shiftAccountsMap[key] = [];
      shiftAccountsMap[key].push(acc);
    });

    const sortedShiftKeys = Object.keys(shiftAccountsMap).sort((a, b) => b.localeCompare(a));

    const [selectedMonth, setSelectedMonth] = React.useState<string>("");

    const availableMonthKeys = Array.from(new Set(sortedShiftKeys.map(k => k.slice(0, 7)))).sort((a, b) => b.localeCompare(a));

    const getTodayLocalShiftKey = () => {
      const now = new Date();
      if (now.getHours() < 5) {
        now.setDate(now.getDate() - 1);
      }
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const currentMonthKey = getTodayLocalShiftKey().slice(0, 7); // e.g. "2026-08"

    // Default to current month or first available month
    const activeMonth = selectedMonth || (availableMonthKeys.includes(currentMonthKey) ? currentMonthKey : (availableMonthKeys[0] || ""));

    const formatMonthLabel = (monthKey: string) => {
      if (!monthKey || monthKey === "all") return "Todos los Meses";
      const [yearStr, monthStr] = monthKey.split("-");
      const monthNum = parseInt(monthStr, 10);
      const monthsEs = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const monthName = monthsEs[monthNum - 1] || monthStr;
      return `${monthName} ${yearStr}`;
    };

    const filteredShiftKeys = activeMonth === "all"
      ? sortedShiftKeys
      : sortedShiftKeys.filter(k => k.startsWith(activeMonth));

    const activeDateKey = (corte2SelectedDate && (activeMonth === "all" || corte2SelectedDate.startsWith(activeMonth)))
      ? corte2SelectedDate
      : (filteredShiftKeys[0] || sortedShiftKeys[0] || getTodayLocalShiftKey());

    const handleMonthChange = (newMonth: string) => {
      setSelectedMonth(newMonth);
      const newFilteredKeys = newMonth === "all"
        ? sortedShiftKeys
        : sortedShiftKeys.filter(k => k.startsWith(newMonth));
      if (newFilteredKeys.length > 0) {
        setCorte2SelectedDate(newFilteredKeys[0]);
        setCorte2SelectedAccountIds([]);
        setCorte2FolioAnterior(null);
        setCorte2MontoObjetivo(0);
      }
    };

    // Accounts for active date, sorted chronologically ascending (⏱️)
    const currentShiftAccounts = [...(shiftAccountsMap[activeDateKey] || [])].sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return tA - tB;
    });

    // Check if there's a saved record for activeDateKey
    const existingRecord = corte2Records.find((r) => r.date === activeDateKey);

    // Initial folio anterior calculation
    let calculatedFolioAnterior = 0;
    if (existingRecord) {
      calculatedFolioAnterior = existingRecord.folioAnterior;
    } else {
      const prevRecord = corte2Records.find((r) => r.date < activeDateKey);
      if (prevRecord) {
        calculatedFolioAnterior = prevRecord.folioFinal || 0;
      }
    }

    const folioAnterior = (corte2FolioAnterior !== undefined && corte2FolioAnterior !== null && corte2FolioAnterior !== "")
      ? Number(corte2FolioAnterior)
      : calculatedFolioAnterior;

    const montoObjetivo = corte2MontoObjetivo || (existingRecord ? existingRecord.montoObjetivo : 0);

    // Mandatory accounts: requiresInvoice OR Card OR Transfer/Bank (only with total > $0)
    const isMandatoryAccount = (acc: ClosedAccount) => {
      if (Number(acc.total || 0) <= 0) return false;
      if (acc.requiresInvoice) return true;
      const method = (acc.paymentMethod || "").toLowerCase();
      return ["card", "tarjeta", "transfer", "transferencia", "banco"].some((m) => method.includes(m));
    };

    const mandatoryAccountIds = currentShiftAccounts
      .filter((acc) => isMandatoryAccount(acc))
      .map((acc) => acc.id);

    // Selected account IDs set (mandatory are forced)
    const activeSelectedSet = new Set<string>([
      ...mandatoryAccountIds,
      ...(corte2SelectedAccountIds.length > 0 ? corte2SelectedAccountIds : (existingRecord ? existingRecord.selectedAccountIds : mandatoryAccountIds)),
    ]);

    // Calculate folios for checked accounts
    let runningFolio = folioAnterior;
    let assignedFolioMap: Record<string, number> = {};
    let lastAssignedFolio = folioAnterior;

    currentShiftAccounts.forEach((acc) => {
      if (activeSelectedSet.has(acc.id)) {
        runningFolio++;
        assignedFolioMap[acc.id] = runningFolio;
        lastAssignedFolio = runningFolio;
      }
    });

    // Subtotal of selected accounts
    const subtotalFoliado = currentShiftAccounts
      .filter((acc) => activeSelectedSet.has(acc.id))
      .reduce((sum, acc) => sum + Number(acc.total || 0), 0);

    const diferencia = subtotalFoliado - montoObjetivo;

    // Toggle check handler
    const toggleAccountSelection = (accId: string, isMandatory: boolean) => {
      if (isMandatory) return; // Locked!
      const newSet = new Set(activeSelectedSet);
      if (newSet.has(accId)) {
        newSet.delete(accId);
      } else {
        newSet.add(accId);
      }
      setCorte2SelectedAccountIds(Array.from(newSet));
    };

    // Smart suggestion algorithm ("💡 Sugerir Selección para Nivelar" -> Preferentemente importes más pequeños)
    const handleSmartSuggestion = () => {
      if (montoObjetivo <= 0) {
        setMenuToastMessage("⚠️ Ingresa un monto objetivo mayor a $0 para nivelar.");
        setShowMenuToast(true);
        return;
      }

      const mandatoryTotal = currentShiftAccounts
        .filter((acc) => isMandatoryAccount(acc))
        .reduce((sum, acc) => sum + Number(acc.total || 0), 0);

      const neededFromCash = montoObjetivo - mandatoryTotal;

      if (neededFromCash <= 0) {
        setCorte2SelectedAccountIds([...mandatoryAccountIds]);
        setMenuToastMessage("💡 Las cuentas obligatorias (Factura/Tarjeta/Transf) cubren el monto objetivo.");
        setShowMenuToast(true);
        return;
      }

      // Cash accounts sorted by total ASCENDING (preferentemente los importes más pequeños)
      const optionalCashAccounts = currentShiftAccounts
        .filter((acc) => !isMandatoryAccount(acc))
        .sort((a, b) => Number(a.total || 0) - Number(b.total || 0));

      if (optionalCashAccounts.length === 0) {
        setCorte2SelectedAccountIds([...mandatoryAccountIds]);
        setMenuToastMessage("ℹ️ No hay cuentas en efectivo adicionales para seleccionar.");
        setShowMenuToast(true);
        return;
      }

      const selectedCashIds: string[] = [];
      let accumulatedCash = 0;

      for (const acc of optionalCashAccounts) {
        selectedCashIds.push(acc.id);
        accumulatedCash += Number(acc.total || 0);
        if (accumulatedCash >= neededFromCash) break;
      }

      setCorte2SelectedAccountIds([...mandatoryAccountIds, ...selectedCashIds]);
      setMenuToastMessage(`💡 Sugerencia aplicada: ${selectedCashIds.length} cuentas de menor importe seleccionadas para nivelación.`);
      setShowMenuToast(true);
    };

    // Batch Print handlers
    const handlePrintAllAccounts = async () => {
      if (currentShiftAccounts.length === 0) {
        setMenuToastMessage("⚠️ No hay cuentas en este turno para imprimir.");
        setShowMenuToast(true);
        return;
      }
      setMenuToastMessage(`🖨️ Imprimiendo las ${currentShiftAccounts.length} cuentas del turno...`);
      setShowMenuToast(true);
      for (const acc of currentShiftAccounts) {
        const folioNum = assignedFolioMap[acc.id];
        await reprintAccount(acc, folioNum);
        await new Promise((r) => setTimeout(r, 250));
      }
    };

    const handlePrintSelectedAccounts = async () => {
      const selectedAccounts = currentShiftAccounts.filter((acc) => activeSelectedSet.has(acc.id));
      if (selectedAccounts.length === 0) {
        setMenuToastMessage("⚠️ No hay cuentas con checkbox / foliadas para imprimir.");
        setShowMenuToast(true);
        return;
      }
      setMenuToastMessage(`🖨️ Imprimiendo las ${selectedAccounts.length} cuentas foliadas (con checkbox)...`);
      setShowMenuToast(true);
      for (const acc of selectedAccounts) {
        const folioNum = assignedFolioMap[acc.id];
        await reprintAccount(acc, folioNum);
        await new Promise((r) => setTimeout(r, 250));
      }
    };

    // Save record to Firebase
    const handleSaveCorte2Record = async () => {
      if (!selectedTenant?.id) return;

      // 1. Validation for Folio Anterior jump
      const prevRecord = corte2Records.find((r) => r.date < activeDateKey);
      const expectedFolioAnterior = prevRecord ? prevRecord.folioFinal : 0;

      if (folioAnterior !== expectedFolioAnterior) {
        const confirmMsg = 
          `⚠️ ADVERTENCIA: El folio inicial ingresado provoca un salto en la numeración.\n\n` +
          `Esperado (donde terminó el turno anterior): ${expectedFolioAnterior}\n` +
          `Ingresado actualmente: ${folioAnterior}\n\n` +
          `¿Deseas guardar de todos modos con este salto de folios?\n` +
          `(Si das 'Cancelar', se corregirá al valor esperado automáticamente).`;
          
        if (!window.confirm(confirmMsg)) {
          setCorte2FolioAnterior(expectedFolioAnterior);
          return; // Detener ejecución para que el usuario guarde con el número correcto
        }
      }

      const recId = existingRecord?.id || `corte2_${activeDateKey.replace(/-/g, "")}_${selectedTenant.id}`;
      const recordToSave: CorteCuentasFolioRecord = {
        id: recId,
        tenantId: selectedTenant.id,
        date: activeDateKey,
        folioAnterior: folioAnterior,
        folioFinal: lastAssignedFolio,
        montoObjetivo: montoObjetivo,
        montoFoliado: subtotalFoliado,
        selectedAccountIds: Array.from(activeSelectedSet),
        status: "closed",
        createdAt: existingRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await saveCorteFolioRecordToFirebase(selectedTenant.id, recordToSave);
        
        // 2. Domino/Recursive update for subsequent shifts
        const subsequentRecords = [...corte2Records]
          .filter(r => r.date > activeDateKey)
          .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically ascending
          
        if (subsequentRecords.length > 0) {
          let currentChainFolio = lastAssignedFolio; // Final folio of the record we just saved
          
          for (const nextRec of subsequentRecords) {
            const foliosCount = nextRec.selectedAccountIds.length;
            const nextFolioFinal = currentChainFolio + foliosCount;
            
            // Update only if there is a discrepancy to save database writes
            if (nextRec.folioAnterior !== currentChainFolio || nextRec.folioFinal !== nextFolioFinal) {
              const updatedRec: CorteCuentasFolioRecord = {
                ...nextRec,
                folioAnterior: currentChainFolio,
                folioFinal: nextFolioFinal
              };
              await saveCorteFolioRecordToFirebase(selectedTenant.id, updatedRec);
            }
            
            currentChainFolio = nextFolioFinal;
          }
        }

        // Actualizar ranking estático de favoritos por nodo en el corte de caja para el día siguiente 📊🏆
        try {
          const stats: Record<string, number> = {};
          (history || []).forEach((acc) => {
            if (acc.status !== "cancelled" && Array.isArray(acc.items)) {
              acc.items.forEach((item) => {
                const pId = item.product?.id || item.id;
                if (pId) {
                  stats[pId] = (stats[pId] || 0) + (item.quantity || 1);
                }
              });
            }
          });
          setProductSalesMap(stats);
          localStorage.setItem("cocinet_product_sales_stats", JSON.stringify(stats));
        } catch (e) {}

        setMenuToastMessage(`✅ Guardado exitoso: Folios #${folioAnterior + 1} al #${lastAssignedFolio} registrados.`);
        setShowMenuToast(true);
      } catch (err: any) {
        setMenuToastMessage(`❌ Error al guardar nivelación: ${err.message || err}`);
        setShowMenuToast(true);
      }
    };

    // Badge styling for Traffic Light / Formato Condicional (🚦) in Light Theme
    let trafficLightBadge = (
      <div className="bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-emerald-700">
        <span className="text-2xl">✅</span>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Estado de Meta</span>
          <span className="text-sm font-black">Coincide con la Meta</span>
        </div>
      </div>
    );

    if (montoObjetivo > 0) {
      if (Math.abs(diferencia) <= 50) {
        trafficLightBadge = (
          <div className="bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-emerald-700">
            <span className="text-2xl">✅</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Nivelación Correcta</span>
              <span className="text-sm font-black">Coincide con la meta (Dif: ${diferencia.toFixed(2)})</span>
            </div>
          </div>
        );
      } else if (diferencia < -50) {
        trafficLightBadge = (
          <div className="bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border-2 border-amber-600">
            <span className="text-2xl">⚠️</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-900 font-extrabold">SALDO FALTANTE</span>
              <span className="text-base font-black">Faltan ${Math.abs(diferencia).toFixed(2)}</span>
            </div>
          </div>
        );
      } else {
        trafficLightBadge = (
          <div className="bg-indigo-600 text-white font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-indigo-700">
            <span className="text-2xl">ℹ️</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-indigo-100 font-bold">SALDO EXCEDENTE</span>
              <span className="text-base font-black">Sobran ${diferencia.toFixed(2)}</span>
            </div>
          </div>
        );
      }
    }

    const selectedCount = currentShiftAccounts.filter((acc) => activeSelectedSet.has(acc.id)).length;

    // --- LOGICA REPORTE MULTI-TURNO ---
    const allFoliatedItems: Array<{
      folio: number;
      date: string;
      accountId: string;
      table: string;
      paymentCategory: "Efectivo" | "Tarjeta" | "Transferencia / Bancos";
      rawPaymentMethod: string;
      total: number;
      timestamp: string;
    }> = [];

    const enhancedMultiTurnRecords = (corte2Records || [])
      .filter((r: any) => {
        if (!multiTurnStartDate || !multiTurnEndDate) return false;
        return r.date >= multiTurnStartDate && r.date <= multiTurnEndDate;
      })
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .map((r: any) => {
        let cashTotal = 0;
        let cardTotal = 0;
        let transferTotal = 0;
        
        const shiftAccounts = [...(shiftAccountsMap[r.date] || [])].sort((a, b) => {
          const tA = new Date(a.timestamp).getTime();
          const tB = new Date(b.timestamp).getTime();
          return tA - tB;
        });

        const selectedSet = new Set(r.selectedAccountIds || []);
        let runningFolio = r.folioAnterior || 0;

        shiftAccounts.forEach(acc => {
          const amt = Number(acc.total || 0);
          if (selectedSet.has(acc.id) && amt > 0) {
            runningFolio++;
            const method = (acc.paymentMethod || (acc as any).metodoPago || (acc as any).payment_method || (acc as any).formaPago || (acc as any).tipoPago || "").toLowerCase().trim();
            
            let paymentCategory: "Efectivo" | "Tarjeta" | "Transferencia / Bancos" = "Efectivo";
            if (["card", "tarjeta"].some(m => method.includes(m))) {
              cardTotal += amt;
              paymentCategory = "Tarjeta";
            } else if (["transfer", "transferencia", "banco", "bank"].some(m => method.includes(m))) {
              transferTotal += amt;
              paymentCategory = "Transferencia / Bancos";
            } else {
              cashTotal += amt;
              paymentCategory = "Efectivo";
            }

            allFoliatedItems.push({
              folio: runningFolio,
              date: r.date,
              accountId: acc.id,
              table: (acc as any).tableName || (acc as any).mesa || (acc as any).table || "",
              paymentCategory,
              rawPaymentMethod: acc.paymentMethod || "Efectivo",
              total: amt,
              timestamp: acc.timestamp
            });
          }
        });
        
        return {
          ...r,
          cashTotal,
          cardTotal,
          transferTotal
        };
      });

    // Ordenar estrictamente todos los items foliados de forma ascendente por número de folio
    allFoliatedItems.sort((a, b) => a.folio - b.folio);

    const cashFoliatedItems = allFoliatedItems.filter(it => it.paymentCategory === "Efectivo").sort((a, b) => a.folio - b.folio);
    const cardFoliatedItems = allFoliatedItems.filter(it => it.paymentCategory === "Tarjeta").sort((a, b) => a.folio - b.folio);
    const transferFoliatedItems = allFoliatedItems.filter(it => it.paymentCategory === "Transferencia / Bancos").sort((a, b) => a.folio - b.folio);

    const totalMultiTurnSum = enhancedMultiTurnRecords.reduce((acc: number, r: any) => acc + (r.montoFoliado || 0), 0);
    const totalCashSum = enhancedMultiTurnRecords.reduce((acc: number, r: any) => acc + r.cashTotal, 0);
    const totalCardSum = enhancedMultiTurnRecords.reduce((acc: number, r: any) => acc + r.cardTotal, 0);
    const totalTransferSum = enhancedMultiTurnRecords.reduce((acc: number, r: any) => acc + r.transferTotal, 0);

    const minFolio = allFoliatedItems.length > 0 ? allFoliatedItems[0].folio : 0;
    const maxFolio = allFoliatedItems.length > 0 ? allFoliatedItems[allFoliatedItems.length - 1].folio : 0;

    const handleExportMultiTurnWhatsApp = () => {
      let text = `*📋 REPORTE MULTI-TURNO*\n`;
      text += `🏬 *Sucursal:* ${selectedTenant?.name || "N/A"}\n`;
      text += `📅 *Periodo:* ${multiTurnStartDate} al ${multiTurnEndDate}\n`;
      if (allFoliatedItems.length > 0) {
        text += `🔢 *Rango Global de Folios:* #${minFolio} al #${maxFolio} (${allFoliatedItems.length} folios)\n`;
      }
      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*1️⃣ RESUMEN POR TURNOS*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      enhancedMultiTurnRecords.forEach((r: any) => {
        text += `📅 *Turno: ${r.date}*\n`;
        text += `🔢 Folios: #${r.folioAnterior + 1} al #${r.folioFinal}\n`;
        text += `💵 Efectivo: $${r.cashTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        text += `💳 Tarjeta: $${r.cardTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        text += `🏦 Transfer: $${r.transferTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        text += `💰 *Total Turno:* $${r.montoFoliado.toLocaleString("es-MX", {minimumFractionDigits:2})}\n\n`;
      });
      if (enhancedMultiTurnRecords.length === 0) {
        text += `No hay folios registrados en este periodo.\n\n`;
      }

      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*2️⃣ LISTADO GENERAL (FOLIO POR FOLIO)*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (allFoliatedItems.length > 0) {
        allFoliatedItems.forEach(it => {
          const icon = it.paymentCategory === "Efectivo" ? "💵" : it.paymentCategory === "Tarjeta" ? "💳" : "🏦";
          text += `Folio #${it.folio} | $${it.total.toLocaleString("es-MX", {minimumFractionDigits:2})} | ${icon} ${it.paymentCategory} (${it.date})\n`;
        });
        text += `\n*Total Acumulado:* $${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits:2})} (${allFoliatedItems.length} cuentas)\n\n`;
      } else {
        text += `Sin cuentas foliadas.\n\n`;
      }

      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*3️⃣ DESGLOSE POR MÉTODO DE PAGO*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      
      text += `💵 *EFECTIVO (${cashFoliatedItems.length} folios):*\n`;
      if (cashFoliatedItems.length > 0) {
        cashFoliatedItems.forEach(it => {
          text += `• Folio #${it.folio}: $${it.total.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        });
        text += `*Subtotal Efectivo:* $${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits:2})}\n\n`;
      } else {
        text += `Sin folios en efectivo.\n\n`;
      }

      text += `💳 *TARJETA (${cardFoliatedItems.length} folios):*\n`;
      if (cardFoliatedItems.length > 0) {
        cardFoliatedItems.forEach(it => {
          text += `• Folio #${it.folio}: $${it.total.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        });
        text += `*Subtotal Tarjeta:* $${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits:2})}\n\n`;
      } else {
        text += `Sin folios con tarjeta.\n\n`;
      }

      text += `🏦 *TRANSFERENCIAS / BANCOS (${transferFoliatedItems.length} folios):*\n`;
      if (transferFoliatedItems.length > 0) {
        transferFoliatedItems.forEach(it => {
          text += `• Folio #${it.folio}: $${it.total.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        });
        text += `*Subtotal Transferencias/Bancos:* $${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits:2})}\n\n`;
      } else {
        text += `Sin folios con transferencia/bancos.\n\n`;
      }

      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*💰 GRAN TOTAL GLOBAL: $${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits:2})}*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    };

    const handleExportMultiTurnExcel = () => {
      const maxDesgloseRows = Math.max(cashFoliatedItems.length, cardFoliatedItems.length, transferFoliatedItems.length, 1);
      let desgloseRowsHtml = '';
      for (let i = 0; i < maxDesgloseRows; i++) {
        const cash = cashFoliatedItems[i];
        const card = cardFoliatedItems[i];
        const trans = transferFoliatedItems[i];
        desgloseRowsHtml += `
          <tr>
            <td align="center">${cash ? '#' + cash.folio : ''}</td>
            <td align="right">${cash ? cash.total.toFixed(2) : ''}</td>
            <td style="border:none; width:15px;"></td>
            <td align="center">${card ? '#' + card.folio : ''}</td>
            <td align="right">${card ? card.total.toFixed(2) : ''}</td>
            <td style="border:none; width:15px;"></td>
            <td align="center">${trans ? '#' + trans.folio : ''}</td>
            <td align="right">${trans ? trans.total.toFixed(2) : ''}</td>
          </tr>
        `;
      }

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
            table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
            th, td { border: 1px solid #b0bec5; padding: 6px 10px; }
            th { background-color: #e2e8f0; font-weight: bold; }
          </style>
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th colspan="7" style="font-size:16px; font-weight:bold; background-color:#1e3a8a; color:#ffffff; text-align:center; padding:10px;">
                  REPORTE MULTI-TURNO - ${selectedTenant?.name || "N/A"}
                </th>
              </tr>
              <tr>
                <th colspan="7" style="font-size:12px; background-color:#f1f5f9; text-align:center; padding:6px;">
                  Periodo: ${multiTurnStartDate} al ${multiTurnEndDate} &nbsp;|&nbsp; 
                  Rango Global de Folios: #${minFolio} al #${maxFolio} (${allFoliatedItems.length} folios)
                </th>
              </tr>
              <tr>
                <th colspan="7" style="font-size:13px; font-weight:bold; background-color:#0284c7; color:#ffffff; text-align:left; padding:6px;">
                  1. RESUMEN GENERAL POR TURNOS
                </th>
              </tr>
              <tr style="background-color:#e0f2fe; font-weight:bold;">
                <th>Turno</th>
                <th align="center">Folio Inicial</th>
                <th align="center">Folio Final</th>
                <th align="right">Efectivo ($)</th>
                <th align="right">Tarjeta ($)</th>
                <th align="right">Transferencia ($)</th>
                <th align="right">Total Turno ($)</th>
              </tr>
            </thead>
            <tbody>
              ${enhancedMultiTurnRecords.map((r: any) => `
                <tr>
                  <td>${r.date}</td>
                  <td align="center">${r.folioAnterior + 1}</td>
                  <td align="center">${r.folioFinal}</td>
                  <td align="right">${r.cashTotal.toFixed(2)}</td>
                  <td align="right">${r.cardTotal.toFixed(2)}</td>
                  <td align="right">${r.transferTotal.toFixed(2)}</td>
                  <td align="right" style="font-weight:bold;">${r.montoFoliado.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="background-color:#dcfce7; font-weight:bold;">
                <td colspan="3" align="right">TOTALES DEL PERIODO:</td>
                <td align="right">${totalCashSum.toFixed(2)}</td>
                <td align="right">${totalCardSum.toFixed(2)}</td>
                <td align="right">${totalTransferSum.toFixed(2)}</td>
                <td align="right" style="font-size:12pt; color:#166534;">${totalMultiTurnSum.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <br/>

          <!-- 2. LISTADO ACUMULADO FOLIO POR FOLIO -->
          <table border="1">
            <thead>
              <tr>
                <th colspan="4" style="font-size:13px; font-weight:bold; background-color:#0d9488; color:#ffffff; text-align:left; padding:6px;">
                  2. LISTADO GENERAL ACUMULADO (FOLIO POR FOLIO CONSECUTIVO)
                </th>
              </tr>
              <tr style="background-color:#ccfbf1; font-weight:bold;">
                <th align="center"># Folio</th>
                <th>Turno / Fecha</th>
                <th>Método de Pago</th>
                <th align="right">Importe ($)</th>
              </tr>
            </thead>
            <tbody>
              ${allFoliatedItems.map(it => `
                <tr>
                  <td align="center" style="font-weight:bold;">#${it.folio}</td>
                  <td>${it.date}</td>
                  <td>${it.paymentCategory}</td>
                  <td align="right">${it.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="background-color:#dcfce7; font-weight:bold;">
                <td colspan="3" align="right">TOTAL ACUMULADO (${allFoliatedItems.length} FOLIOS):</td>
                <td align="right" style="font-size:12pt; color:#166534;">${totalMultiTurnSum.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <br/>

          <!-- 3. DESGLOSE POR MÉTODO DE PAGO -->
          <table border="1">
            <thead>
              <tr>
                <th colspan="8" style="font-size:13px; font-weight:bold; background-color:#4f46e5; color:#ffffff; text-align:left; padding:6px;">
                  3. DESGLOSE POR MÉTODO DE PAGO (ORDENADO POR FOLIO)
                </th>
              </tr>
              <tr>
                <th colspan="2" align="center" style="background-color:#dcfce7; color:#166534; font-weight:bold;">💵 EFECTIVO (${cashFoliatedItems.length})</th>
                <th style="border:none; width:15px;"></th>
                <th colspan="2" align="center" style="background-color:#e0e7ff; color:#3730a3; font-weight:bold;">💳 TARJETA (${cardFoliatedItems.length})</th>
                <th style="border:none; width:15px;"></th>
                <th colspan="2" align="center" style="background-color:#fef3c7; color:#92400e; font-weight:bold;">🏦 TRANSFERENCIAS / BANCOS (${transferFoliatedItems.length})</th>
              </tr>
              <tr style="background-color:#f8fafc; font-weight:bold;">
                <th align="center"># Folio</th>
                <th align="right">Importe ($)</th>
                <th style="border:none;"></th>
                <th align="center"># Folio</th>
                <th align="right">Importe ($)</th>
                <th style="border:none;"></th>
                <th align="center"># Folio</th>
                <th align="right">Importe ($)</th>
              </tr>
            </thead>
            <tbody>
              ${desgloseRowsHtml}
              <tr style="background-color:#f1f5f9; font-weight:bold;">
                <td align="center">Subtotal Efectivo:</td>
                <td align="right">${totalCashSum.toFixed(2)}</td>
                <td style="border:none;"></td>
                <td align="center">Subtotal Tarjeta:</td>
                <td align="right">${totalCardSum.toFixed(2)}</td>
                <td style="border:none;"></td>
                <td align="center">Subtotal Bancos:</td>
                <td align="right">${totalTransferSum.toFixed(2)}</td>
              </tr>
              <tr style="background-color:#fef08a; font-weight:bold; font-size:12pt;">
                <td colspan="8" align="right" style="padding:10px;">
                  GRAN TOTAL ACUMULADO: $${totalMultiTurnSum.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_MultiTurno_${multiTurnStartDate}_al_${multiTurnEndDate}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };



    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="light" className="border-b border-stone-300">
            <IonButtons slot="start">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2.5 text-white bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition flex items-center gap-2 ml-2 font-black text-xs shadow-sm"
              >
                <span>☰</span>
                <span>Menú</span>
              </button>
            </IonButtons>
            <IonTitle className="font-black text-amber-700">📑 Cortes — {selectedTenant?.name || "Sucursal"}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="bg-[#f4f3ec] text-stone-800 ion-padding">
          <div className="max-w-7xl mx-auto space-y-6 pb-16">
            
            {/* Header & Controls Panel (Fondo Blanco Ostión Elegante) */}
            <div className="bg-white border border-stone-300/90 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Row 1: Date Selector & Tenant */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 bg-amber-100 border border-amber-300 rounded-2xl">📑</span>
                  <div>
                    <h1 className="text-xl font-black text-stone-900 tracking-tight">Foliación Consecutiva de Cuentas por Turno</h1>
                    <p className="text-xs font-bold text-stone-600">
                      Asigna número interno consecutivo a las cuentas para nivelación de ingresos ({selectedTenant?.name || "Sucursal"}).
                    </p>
                  </div>
                </div>

                {/* Shift Date & Month Selector & Multi-Turn Report Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <style>{`
                    @keyframes turnoHeartbeat {
                      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
                      15% { transform: scale(1.05); box-shadow: 0 0 12px 3px rgba(217, 119, 6, 0.35); }
                      30% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
                      45% { transform: scale(1.03); box-shadow: 0 0 8px 2px rgba(217, 119, 6, 0.25); }
                      60% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
                      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
                    }
                    .turno-heartbeat-anim {
                      animation: turnoHeartbeat 1.8s infinite ease-in-out;
                      transform-origin: center center;
                    }
                  `}</style>
                  
                  {/* Selector de Mes / Periodo */}
                  <div className="flex items-center gap-2 p-1.5 md:p-2 rounded-2xl border bg-amber-50/80 border-amber-300 shadow-sm">
                    <span className="text-xs font-black text-amber-900 pl-1.5 flex items-center gap-1">
                      <span>📆</span> Mes:
                    </span>
                    <select
                      value={activeMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="bg-white text-amber-950 font-black text-xs md:text-sm px-2.5 py-2 rounded-xl border-2 border-amber-400 outline-none cursor-pointer shadow-sm focus:border-amber-600 transition"
                    >
                      {availableMonthKeys.map((mKey) => (
                        <option key={mKey} value={mKey}>
                          {formatMonthLabel(mKey)} ({sortedShiftKeys.filter(k => k.startsWith(mKey)).length} turnos)
                        </option>
                      ))}
                      {availableMonthKeys.length > 1 && (
                        <option value="all">Todos los Meses ({sortedShiftKeys.length} turnos)</option>
                      )}
                      {availableMonthKeys.length === 0 && (
                        <option value="">Cargando periodos...</option>
                      )}
                    </select>
                  </div>

                  {/* Selector de Turno con Animación Heartbeat */}
                  <div
                    className="turno-heartbeat-anim flex items-center gap-2 p-1.5 md:p-2 rounded-2xl border bg-amber-50 border-amber-400 shadow-md transition-all"
                  >
                    <span className="text-xs font-black text-amber-900 pl-1.5 flex items-center gap-1">
                      <span>📅</span> Turno:
                    </span>
                    <select
                      value={activeDateKey}
                      onChange={(e) => {
                        setCorte2SelectedDate(e.target.value);
                        setCorte2SelectedAccountIds([]);
                        setCorte2FolioAnterior(null);
                        setCorte2MontoObjetivo(0);
                      }}
                      className="bg-white text-amber-950 font-black text-xs md:text-sm px-2.5 py-2 rounded-xl border-2 border-amber-400 outline-none cursor-pointer shadow-sm focus:border-amber-600 transition"
                    >
                      {filteredShiftKeys.map((key) => (
                        <option key={key} value={key}>
                          Corte del {key} ({shiftAccountsMap[key]?.length || 0} cuentas)
                        </option>
                      ))}
                      {filteredShiftKeys.length === 0 ? (
                        <option value={activeDateKey}>
                          {!historyLoaded ? "Cargando fechas..." : "Sin turnos en este periodo"}
                        </option>
                      ) : !filteredShiftKeys.includes(activeDateKey) ? (
                        <option value={activeDateKey}>{activeDateKey}</option>
                      ) : null}
                    </select>
                  </div>

                  {/* Botón Reporte Multi-Turnos */}
                  <button
                    onClick={() => {
                      setShowMultiTurnModal(true);
                      setMultiTurnPreviewReady(false);
                      if (filteredShiftKeys.length > 0) {
                        const sortedAsc = [...filteredShiftKeys].sort((a, b) => a.localeCompare(b));
                        setMultiTurnStartDate(sortedAsc[0]);
                        setMultiTurnEndDate(sortedAsc[sortedAsc.length - 1]);
                      } else {
                        setMultiTurnStartDate("");
                        setMultiTurnEndDate("");
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2.5 px-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <span>📑</span>
                    <span>Reporte Multi-Turnos</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Control Inputs (Folio Anterior, Monto Objetivo) & Traffic Light status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                
                {/* Folio Anterior */}
                <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                    🔢 ÚLTIMO FOLIO (TURNO PASADO):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={folioAnterior}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCorte2FolioAnterior(val === "" ? 0 : Number(val));
                    }}
                    className="bg-white border-2 border-stone-300 text-amber-800 font-black text-xl px-3 py-2 rounded-xl outline-none focus:border-amber-500 transition shadow-inner"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-stone-500 font-bold italic">Folio final en el que se quedó ayer</span>
                </div>

                {/* Monto Objetivo a Nivelar */}
                <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                    🎯 Monto Nivelación Objetivo:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-black text-lg">$</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={montoObjetivo || ""}
                      onChange={(e) => setCorte2MontoObjetivo(Number(e.target.value) || 0)}
                      className="w-full bg-white border-2 border-stone-300 text-emerald-800 font-black text-xl pl-8 pr-3 py-2 rounded-xl outline-none focus:border-emerald-600 transition shadow-inner"
                      placeholder="0.00"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 font-bold italic">Monto a definir para ingresos</span>
                </div>

                {/* Subtotal Foliado Actual */}
                <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                    📈 Subtotal Seleccionado:
                  </label>
                  <span className="text-2xl font-black text-stone-900">
                    ${subtotalFoliado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-stone-600 font-extrabold">
                    {lastAssignedFolio > folioAnterior
                      ? `Folios: #${folioAnterior + 1} al #${lastAssignedFolio}`
                      : "Sin folios asignados"}
                  </span>
                </div>

                {/* Badge de Formato Condicional (🚦) */}
                <div className="flex justify-center md:justify-end">
                  {trafficLightBadge}
                </div>
              </div>

              {/* Banner de Rango de Folios Generados e Impresión */}
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-amber-200/80 rounded-xl">📜</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                      Rango de Folios Generados en este Turno:
                    </span>
                    <div className="text-base font-black text-amber-950 flex items-center gap-2 flex-wrap">
                      {lastAssignedFolio > folioAnterior ? (
                        <>
                          <span>del</span>
                          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-600 shadow-sm text-sm">
                            #{folioAnterior + 1}
                          </span>
                          <span>al</span>
                          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-600 shadow-sm text-sm">
                            #{lastAssignedFolio}
                          </span>
                          <span className="text-xs font-extrabold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300">
                            ({selectedCount} cuentas foliadas)
                          </span>
                        </>
                      ) : (
                        <span className="text-stone-500 italic text-sm">Sin cuentas seleccionadas para foliación</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrintSelectedAccounts}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2.5 rounded-xl shadow transition text-xs flex items-center gap-2 cursor-pointer border border-amber-700"
                    title="Imprimir únicamente las cuentas con checkbox marcados"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Foliadas ({selectedCount})</span>
                  </button>

                  <button
                    onClick={handlePrintAllAccounts}
                    className="bg-stone-800 hover:bg-stone-900 text-white font-black px-4 py-2.5 rounded-xl shadow transition text-xs flex items-center gap-2 cursor-pointer border border-stone-900"
                    title="Imprimir todas las cuentas registradas en este turno"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Todas ({currentShiftAccounts.length})</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Smart Suggestion & Save */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSmartSuggestion}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-md text-xs transition flex items-center gap-2 cursor-pointer border border-amber-600"
                  >
                    <span>💡</span>
                    <span>Sugerir Selección para Nivelar</span>
                  </button>
                  <span className="text-xs text-stone-600 font-bold italic">
                    (Prioriza seleccionar los importes más pequeños)
                  </span>
                </div>

                <button
                  onClick={handleSaveCorte2Record}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl shadow-md text-xs transition flex items-center gap-2 cursor-pointer border border-emerald-700"
                >
                  <span>💾</span>
                  <span>Guardar Registro de Nivelación</span>
                </button>
              </div>

            </div>

            {/* Table of Accounts */}
            <div className="bg-white border border-stone-300/90 rounded-3xl p-6 shadow-xl space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Cuentas del Turno (Sin Cuentas Lupay)</span>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                    {currentShiftAccounts.length} cuentas
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs font-black text-stone-700">
                  <button
                    onClick={handlePrintSelectedAccounts}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Foliadas ({selectedCount})</span>
                  </button>
                  <button
                    onClick={handlePrintAllAccounts}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Todas ({currentShiftAccounts.length})</span>
                  </button>
                </div>
              </div>

              {(!historyLoaded && (!history || history.length === 0)) ? (
                <div className="p-12 flex flex-col items-center justify-center text-center text-stone-500 font-bold bg-stone-100/60 rounded-3xl border-2 border-dashed border-stone-300">
                  <span className="text-4xl block mb-4 animate-pulse">⏳</span>
                  <span className="text-xl font-black text-stone-600 block mb-2">Cargando cortes de la sucursal...</span>
                  <span className="text-stone-400 text-sm">Por favor espera un momento</span>
                </div>
              ) : currentShiftAccounts.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border-2 border-stone-200">
                  <table className="w-full text-left text-xs text-stone-800">
                    <thead className="bg-stone-200 text-stone-800 font-black uppercase tracking-wider border-b-2 border-stone-300">
                      <tr>
                        <th className="py-3 px-4 text-center">Sel.</th>
                        <th className="py-3 px-4"># Folio</th>
                        <th className="py-3 px-4">Hora</th>
                        <th className="py-3 px-4">Mesa / Ticket</th>
                        <th className="py-3 px-4">Forma de Pago</th>
                        <th className="py-3 px-4">Requiere Factura</th>
                        <th className="py-3 px-4 text-right">Total ($)</th>
                        <th className="py-3 px-4 text-center">Imprimir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-bold">
                      {currentShiftAccounts.map((acc) => {
                        const isMandatory = isMandatoryAccount(acc);
                        const isChecked = activeSelectedSet.has(acc.id);
                        const folioNum = assignedFolioMap[acc.id];
                        const dateObj = new Date(acc.timestamp);
                        const timeStr = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                          : "N/D";

                        return (
                          <tr
                            key={acc.id}
                            className={`transition ${
                              isChecked
                                ? isMandatory
                                  ? "bg-amber-100/70 text-stone-900 font-bold"
                                  : "bg-emerald-100/60 text-stone-900 font-bold"
                                : "bg-white text-stone-400 font-semibold hover:bg-stone-50"
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isMandatory}
                                onChange={() => toggleAccountSelection(acc.id, isMandatory)}
                                className={`w-4 h-4 rounded border-stone-400 cursor-pointer ${
                                  isMandatory ? "accent-amber-600 opacity-90 cursor-not-allowed" : "accent-emerald-600"
                                }`}
                              />
                            </td>

                            {/* # Folio */}
                            <td className="py-3 px-4 font-black">
                              {folioNum ? (
                                <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs border border-amber-600 shadow-sm">
                                  #{folioNum}
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>

                            {/* Hora */}
                            <td className="py-3 px-4 font-mono text-stone-700 font-bold">
                              {timeStr}
                            </td>

                            {/* Mesa / Ticket */}
                            <td className="py-3 px-4 font-black text-stone-900 text-sm">
                              {acc.tableLabel || "Cuenta"}
                            </td>

                            {/* Forma de Pago */}
                            <td className="py-3 px-4 capitalize">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-black ${
                                  (acc.paymentMethod || "").toLowerCase().includes("card") || (acc.paymentMethod || "").toLowerCase().includes("tarjeta")
                                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                                    : (acc.paymentMethod || "").toLowerCase().includes("trans")
                                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                }`}
                              >
                                {acc.paymentMethod || "Efectivo"}
                              </span>
                            </td>

                            {/* Factura */}
                            <td className="py-3 px-4">
                              {acc.requiresInvoice ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-md text-[11px] font-black">
                                    📄 Factura
                                  </span>
                                  {acc.invoicePhone ? (
                                    <button
                                      type="button"
                                      onClick={(e) => handleSendWhatsAppInvoice(acc, e)}
                                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-0.5 rounded-full text-xs shadow-sm transition cursor-pointer border border-emerald-500"
                                      title="💬 Enviar WhatsApp solicitando Constancia Fiscal y enviar ticket"
                                    >
                                      <span>💬</span>
                                      <span className="underline">({acc.invoicePhone})</span>
                                    </button>
                                  ) : (
                                    <span className="text-stone-400 text-xs font-bold">(Sin tel)</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-400 font-semibold">No</span>
                              )}
                            </td>

                            {/* Total */}
                            <td className="py-3 px-4 text-right font-black text-sm text-stone-900">
                              ${Number(acc.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </td>

                            {/* Botón Imprimir Individual */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => reprintAccount(acc, folioNum)}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 p-1.5 rounded-lg transition font-bold text-xs shadow-xs cursor-pointer"
                                title={`Imprimir ticket ${folioNum ? `(Folio #${folioNum})` : ""}`}
                              >
                                🖨️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 font-bold bg-stone-100/60 rounded-3xl border-2 border-dashed border-stone-300">
                  <span className="text-4xl block mb-2">📬</span>
                  <span>No hay cuentas registradas en este turno para la fecha seleccionada.</span>
                </div>
              )}

            </div>

          </div>
        </IonContent>
        <MultiTurnModal
          showMultiTurnModal={showMultiTurnModal}
          setShowMultiTurnModal={setShowMultiTurnModal}
          multiTurnData={multiTurnData}
          selectedMultiTurnDate={selectedMultiTurnDate}
          setSelectedMultiTurnDate={setSelectedMultiTurnDate}
          handleExportMultiTurnCSV={handleExportMultiTurnCSV}
          sortedShiftKeys={sortedShiftKeys || []}
          multiTurnStartDate={multiTurnStartDate}
          setMultiTurnStartDate={setMultiTurnStartDate}
          multiTurnEndDate={multiTurnEndDate}
          setMultiTurnEndDate={setMultiTurnEndDate}
          multiTurnPreviewReady={multiTurnPreviewReady}
          setMultiTurnPreviewReady={setMultiTurnPreviewReady}
          selectedTenant={selectedTenant}
          totalCashSum={totalCashSum}
          totalCardSum={totalCardSum}
          totalTransferSum={totalTransferSum}
          totalMultiTurnSum={totalMultiTurnSum}
          enhancedMultiTurnRecords={enhancedMultiTurnRecords}
          allFoliatedItems={allFoliatedItems}
          cashFoliatedItems={cashFoliatedItems}
          cardFoliatedItems={cardFoliatedItems}
          transferFoliatedItems={transferFoliatedItems}
          minFolio={minFolio}
          maxFolio={maxFolio}
          handleExportMultiTurnWhatsApp={handleExportMultiTurnWhatsApp}
          handleExportMultiTurnExcel={handleExportMultiTurnExcel}
        />
      </IonPage>
    );
};
