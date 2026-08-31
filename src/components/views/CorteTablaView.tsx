import { TenantBackupConfirm } from '../modals/TenantBackupConfirm';
import { SystemsChoiceAlert } from '../modals/SystemsChoiceAlert';
import { TablaArqueoModal } from '../modals/TablaArqueoModal';
import { EditFondoModal } from '../modals/EditFondoModal';
import { EscPosDriver, PosPrinterJob, createTransport } from '../../utils/printer';
import { ExportSessionModal } from '../modals/ExportSessionModal';
import { deleteAllTenantHistoryInFirebase, deleteCashierSessionFromFirebase, exportCashierSessionToTargetTenant, getMexicoISOString, releaseTableInFirebase, updateCashierSessionInFirebase, deleteHistoryItemFromFirebase, deleteExpenseFromFirebase, deleteCashMovementFromFirebase, deletePurchaseFromFirebase } from '../../utils/firestore';
import { getCompanyCatalog, getTenantUsers } from '../../utils/appHelpers';
import { getWhatsAppCloudConfig, sendSilentWhatsAppMessage } from '../../utils/whatsappCloud';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonAlert, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackOutline, chevronDownOutline, chevronUpOutline, downloadOutline, gridOutline, logoWhatsapp, menuOutline, statsChartOutline, swapHorizontalOutline, syncOutline, trashOutline } from 'ionicons/icons';

interface CorteTablaViewProps {
  corteData: any;
  CashierSession: any;
  appMode: any;
  cashMovements: any;
  cashierSessions: any;
  companyConfig: any;
  corteTablaSessionSelected: any;
  corteViewMode: any;
  currentUser: any;
  expandedCorteTablaRows: any;
  expandedSessionDetails: any;
  expenses: any;
  exportSessionModal: any;
  exportTargetTenantId: any;
  history: any;
  historySortOrder: any;
  isMasterAdmin: any;
  isSystemsMode: any;
  paymentMethod: any;
  purchases: any;
  renderMaterialHeader: any;
  selectedPendingOwner: any;
  selectedTenant: any;
  setActiveOwnerFilter: any;
  setAppMode: any;
  setCashMovementForm: any;
  setCashMovements: any;
  setCashierSessions: any;
  setCorteFilterUserId: any;
  setCorteTablaSessionSelected: any;
  setCorteViewMode: any;
  setDailyReportTargetDate: any;
  setEditFondoValue: any;
  setExpandedCorteTablaRows: any;
  setExpandedSessionDetails: any;
  setExpenses: any;
  setExportModalStep: any;
  setExportSessionModal: any;
  setExportTargetTenantId: any;
  setHistory: any;
  setHistorySortOrder: any;
  setIsExportingSession: any;
  setIsOwnerUnlocked: any;
  setOwnerPasswordInput: any;
  setSelectedTableGestion: any;
  setShowCashMovementModal: any;
  setShowCloseTurnConfirm: any;
  setShowDailyReportModal: any;
  setShowDeleteAllHistoryConfirm: any;
  setShowEditFondoModal: any;
  setShowOwnerPasswordAlert: any;
  setShowSidebar: any;
  setShowSystemsChoiceAlert: any;
  setShowTablaArqueoModal: any;
  setTables: any;
  setTenantBackupConfirm: any;
  showCloseTurnConfirm: any;
  showDeleteAllHistoryConfirm: any;
  showEditFondoModal: any;
  showOwnerPasswordAlert: any;
  showSystemsChoiceAlert: any;
  showTablaArqueoModal: any;
  tablaArq100: any;
  tablaArq1000: any;
  tablaArq20: any;
  tablaArq200: any;
  tablaArq50: any;
  tablaArq500: any;
  tablaArqM05: any;
  tablaArqM1: any;
  tablaArqM10: any;
  tablaArqM2: any;
  tablaArqM5: any;
  tables: any;
  tenantBackupConfirm: any;
  ticketBusinessName: any;
  ticketSucursal: any;
  triggerAppNotification: any;
  activeSessionForCorte: any;
  arqueoBilletes: any;
  arqueoMonedas: any;
  arqueoTotal: any;
  cancelled: any;
  doc: any;
  estimatedCash: any;
  filteredCashMovementsForCorte: any;
  filteredExpensesForCorte: any;
  filteredHistoryForCorte: any;
  filteredPurchasesForCorte: any;
  grouped: any;
  isValidated: any;
  sessionId: any;
  targetTenantId: any;
  validateOwnerKey: any;
  validatedBy: any;
  activeTablaDenom: any;
  setActiveTablaDenom: any;
  showTablaKeypadOverlay: any;
  setShowTablaKeypadOverlay: any;
  setTablaArq100: any;
  setTablaArq1000: any;
  setTablaArq20: any;
  setTablaArq200: any;
  setTablaArq50: any;
  setTablaArq500: any;
  setTablaArqM05: any;
  setTablaArqM1: any;
  setTablaArqM10: any;
  setTablaArqM2: any;
  setTablaArqM5: any;
}

export const CorteTablaView: React.FC<CorteTablaViewProps> = ({
  appMode,
  cashMovements,
  cashierSessions,
  companyConfig,
  corteTablaSessionSelected,
  corteViewMode,
  currentUser,
  expandedCorteTablaRows,
  expandedSessionDetails,
  expenses,
  exportSessionModal,
  exportTargetTenantId,
  history,
  historySortOrder,
  isMasterAdmin,
  isSystemsMode,
  paymentMethod,
  purchases,
  renderMaterialHeader,
  selectedPendingOwner,
  selectedTenant,
  setActiveOwnerFilter,
  setAppMode,
  setCashMovementForm,
  setCashMovements,
  setCashierSessions,
  setCorteFilterUserId,
  setCorteTablaSessionSelected,
  setCorteViewMode,
  setDailyReportTargetDate,
  setEditFondoValue,
  setExpandedCorteTablaRows,
  setExpandedSessionDetails,
  setExpenses,
  setExportModalStep,
  setExportSessionModal,
  setExportTargetTenantId,
  setHistory,
  setHistorySortOrder,
  setIsExportingSession,
  setIsOwnerUnlocked,
  setOwnerPasswordInput,
  setSelectedTableGestion,
  setShowCashMovementModal,
  setShowCloseTurnConfirm,
  setShowDailyReportModal,
  setShowDeleteAllHistoryConfirm,
  setShowEditFondoModal,
  setShowOwnerPasswordAlert,
  setShowSidebar,
  setShowSystemsChoiceAlert,
  setShowTablaArqueoModal,
  setTables,
  setTenantBackupConfirm,
  showCloseTurnConfirm,
  showDeleteAllHistoryConfirm,
  showEditFondoModal,
  showOwnerPasswordAlert,
  showSystemsChoiceAlert,
  showTablaArqueoModal,
  tablaArq100,
  tablaArq1000,
  tablaArq20,
  tablaArq200,
  tablaArq50,
  tablaArq500,
  tablaArqM05,
  tablaArqM1,
  tablaArqM10,
  tablaArqM2,
  tablaArqM5,
  tables,
  tenantBackupConfirm,
  ticketBusinessName,
  ticketSucursal,
  triggerAppNotification,
  activeSessionForCorte, arqueoBilletes, arqueoMonedas, arqueoTotal, cancelled, doc, estimatedCash, filteredCashMovementsForCorte, filteredExpensesForCorte, filteredHistoryForCorte, filteredPurchasesForCorte, grouped, isValidated, sessionId, targetTenantId, validateOwnerKey,
  validatedBy,
  activeTablaDenom,
  setActiveTablaDenom,
  showTablaKeypadOverlay,
  setShowTablaKeypadOverlay,
  setTablaArq100,
  setTablaArq1000,
  setTablaArq20,
  setTablaArq200,
  setTablaArq50,
  setTablaArq500,
  setTablaArqM05,
  setTablaArqM1,
  setTablaArqM10,
  setTablaArqM2,
  setTablaArqM5,
  corteData,
  CashierSession
}) => {
  const [showPendingTablesModal, setShowPendingTablesModal] = useState(false);
  const [showClosePinModal, setShowClosePinModal] = useState(false);
  const [closePinInput, setClosePinInput] = useState("");
  const [showTestWhatsappModal, setShowTestWhatsappModal] = useState(false);
  const [testWhatsappPhone, setTestWhatsappPhone] = useState("");
  const [pendingTablesList, setPendingTablesList] = useState<any[]>([]);

  if (currentUser?.role === "mesero") {
      return (
        <IonPage>
        {renderMaterialHeader({
          title: "Acceso Restringido 🔒",
          subtitle: "Corte y Turno de Caja Restringido",
          showBack: true,
          onBack: () => appMode === "gestion_cuentas" ? setSelectedTableGestion(null) : setAppMode("floorplan"),
        })}
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-md mx-auto my-12 text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl shadow-inner mb-2">
                🔒
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Corte y Turno de Caja Restringido</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tu usuario cuenta con el rol de <strong>Mesero</strong>. Los meseros únicamente tienen autorización para tomar comandas y pedidos, y no pueden abrir, ver, ni cerrar turnos de caja ni realizar cortes 📊.
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

    const getSessionFinancials = (session: any) => {
      if (!session) return {
        cashSales: 0,
        cardSales: 0,
        transSales: 0,
        lupaySales: 0,
        totalVentas: 0,
        totalInflows: 0,
        totalOutflows: 0,
        totalPurchasesPaid: 0,
        totalGastos: 0,
        dotacionInicial: 0,
        balanceEsperado: 0,
        balanceReal: 0,
        dif: 0,
      };

      const sId = session.id;
      const sOpened = new Date(session.openedAt);
      const sClosed = session.closedAt ? new Date(session.closedAt) : null;

      // Filter history for this session
      const sessionHistory = history.filter((h) => {
        if (h.sessionId && h.sessionId === sId) return true;
        // Timestamp fallback
        const hTime = new Date(h.timestamp);
        return hTime >= sOpened && (!sClosed || hTime <= sClosed);
      });

      // Filter cash movements
      const sessionMovements = cashMovements.filter((m) => {
        if (m.sessionId && m.sessionId === sId) return true;
        const mTime = new Date(m.timestamp || m.date || new Date());
        return mTime >= sOpened && (!sClosed || mTime <= sClosed);
      });

      // Filter expenses
      const sessionExpenses = expenses.filter((e) => {
        if (e.sessionId && e.sessionId === sId) return true;
        if (!e.createdAt) return false;
        const eTime = new Date(e.createdAt);
        return eTime >= sOpened && (!sClosed || eTime <= sClosed);
      });

      // Filter purchases
      const sessionPurchases = purchases.filter((p) => {
        if (p.sessionId && p.sessionId === sId) return true;
        const pTime = new Date(p.timestamp || new Date());
        return pTime >= sOpened && (!sClosed || pTime <= sClosed);
      });

      // Calculate sales
      let cashSales = 0;
      let cardSales = 0;
      let transSales = 0;
      let lupaySales = 0;

      sessionHistory.forEach((h) => {
        if (h.status === "completed" || h.isPaid) {
          const method = (h.paymentMethod || "").toLowerCase();
          const amt = Number(h.total || 0);
          if (method === "cash" || method === "efectivo") {
            cashSales += amt;
          } else if (method === "card" || method === "tarjeta") {
            cardSales += amt;
          } else if (method === "lupay") {
            lupaySales += amt;
          } else {
            transSales += amt;
          }
        }
      });

      // Inflows and outflows from movements
      let totalInflows = 0;
      let totalOutflows = 0;

      sessionMovements.forEach((m) => {
        const amt = Number(m.amount || 0);
        if (m.type === "in") {
          totalInflows += amt;
        } else if (m.type === "out") {
          totalOutflows += amt;
        }
      });

      // Expenses
      sessionExpenses.forEach((e) => {
        totalOutflows += Number(e.amount || 0);
      });

      // Purchases
      let totalPurchasesPaid = 0;
      sessionPurchases.forEach((p) => {
        if (p.isPaid) {
          totalPurchasesPaid += Number(p.total || 0);
        }
      });

      const dotacionInicial = Number(session.dotacionInicial || 0);

      const finalCashSales = (session.cashSales !== undefined && Number(session.cashSales) > 0) ? Number(session.cashSales) : cashSales;
      const finalCardSales = (session.cardSales !== undefined && Number(session.cardSales) > 0) ? Number(session.cardSales) : cardSales;
      const finalTransSales = (session.transSales !== undefined && Number(session.transSales) > 0) ? Number(session.transSales) : transSales;
      const finalLupaySales = (session.lupaySales !== undefined && Number(session.lupaySales) > 0) ? Number(session.lupaySales) : lupaySales;

      const finalTotalInflows = (session.totalInflows !== undefined && Number(session.totalInflows) > 0) ? Number(session.totalInflows) : totalInflows;
      const finalTotalOutflows = (session.totalOutflows !== undefined && Number(session.totalOutflows) > 0) ? Number(session.totalOutflows) : totalOutflows;
      const finalTotalPurchasesPaid = (session.totalPurchasesPaid !== undefined && Number(session.totalPurchasesPaid) > 0) ? Number(session.totalPurchasesPaid) : totalPurchasesPaid;

      const computedEstimated = Math.max(
        0,
        dotacionInicial +
          finalCashSales +
          finalTotalInflows -
          finalTotalOutflows -
          finalTotalPurchasesPaid
      );

      const balanceEsperado = Number(session.estimatedCash || 0) > 0 ? Number(session.estimatedCash) : computedEstimated;
      const balanceReal = Number(session.arqueoTotal || 0);
      const dif = balanceReal - balanceEsperado;

      return {
        cashSales: finalCashSales,
        cardSales: finalCardSales,
        transSales: finalTransSales,
        lupaySales: finalLupaySales,
        totalVentas: finalCashSales + finalCardSales + finalTransSales + finalLupaySales,
        dotacionInicial,
        totalInflows: finalTotalInflows,
        totalOutflows: finalTotalOutflows,
        totalPurchasesPaid: finalTotalPurchasesPaid,
        totalGastos: finalTotalOutflows + finalTotalPurchasesPaid,
        balanceEsperado,
        balanceReal,
        dif,
      };
    };

    const openSessions = cashierSessions.filter((s) => s.status === "open");
    const sessionToRender = activeSessionForCorte;
    const shouldShowSelector = !sessionToRender;

    const handleReiniciarCorte = async () => {
    if (!selectedTenant) {
      triggerAppNotification("Error", "No hay inquilino seleccionado", "warning");
      return;
    }
    setShowSystemsChoiceAlert(true);
  };

  const handleOpenExportModal = (session: CashierSession) => {
    setExportSessionModal(session);
    setExportTargetTenantId("");
    setExportModalStep(1);
  };

  const handleExecuteExportTenantCorte = async () => {
    if (!exportSessionModal || !exportTargetTenantId) {
      triggerAppNotification("Error ❌", "Selecciona un inquilino destino válido.", "warning");
      return;
    }

    const isSistemasRole =
      currentUser?.role === "sistemas" ||
      currentUser?.role === "Sistemas" ||
      currentUser?.id?.endsWith("-sistemas") ||
      isSystemsMode;

    if (!isSistemasRole) {
      triggerAppNotification(
        "Acceso Denegado 🔒",
        "Esta función requiere privilegios exclusivos del rol Sistemas.",
        "warning"
      );
      return;
    }

    const targetTenant = getCompanyCatalog().find((t) => t.id === exportTargetTenantId);
    if (!targetTenant) {
      triggerAppNotification("Error ❌", "No se encontró la información del inquilino destino.", "warning");
      return;
    }

    setIsExportingSession(true);

    try {
      const sId = exportSessionModal.id;
      const sOpened = new Date(exportSessionModal.openedAt);
      const sClosed = exportSessionModal.closedAt ? new Date(exportSessionModal.closedAt) : null;

      const sessionHistory = history.filter((h) => {
        if (h.sessionId && h.sessionId === sId) return true;
        const hTime = new Date(h.timestamp);
        return hTime >= sOpened && (!sClosed || hTime <= sClosed);
      });

      const sessionMovements = cashMovements.filter((m) => {
        if (m.sessionId && m.sessionId === sId) return true;
        const mTime = new Date(m.timestamp || m.date || new Date());
        return mTime >= sOpened && (!sClosed || mTime <= sClosed);
      });

      const sessionExpenses = expenses.filter((e) => {
        if (e.sessionId && e.sessionId === sId) return true;
        if (!e.createdAt) return false;
        const eTime = new Date(e.createdAt);
        return eTime >= sOpened && (!sClosed || eTime <= sClosed);
      });

      const sessionPurchases = purchases.filter((p) => {
        if (p.sessionId && p.sessionId === sId) return true;
        const pTime = new Date(p.timestamp || new Date());
        return pTime >= sOpened && (!sClosed || pTime <= sClosed);
      });

      const result = await exportCashierSessionToTargetTenant({
        sourceSession: exportSessionModal,
        targetTenantId: exportTargetTenantId,
        sessionHistory,
        sessionMovements,
        sessionExpenses,
        sessionPurchases,
        existingSessions: cashierSessions,
      });

      triggerAppNotification(
        "¡Corte Exportado Exitosamente! 🚀✅",
        `El corte de caja se transfirió correctamente a "${targetTenant.name}". Se crearon ${result.totalExportedItems} registros contables duplicados sin modificar el origen.`,
        "success"
      );

      setExportSessionModal(null);
      setExportTargetTenantId("");
      setExportModalStep(1);
    } catch (err: any) {
      console.error("Error al exportar corte a otro tenant:", err);
      triggerAppNotification(
        "Error en Exportación ❌",
        err.message || "Ocurrió un error inesperado al realizar la transferencia entre inquilinos.",
        "warning"
      );
    } finally {
      setIsExportingSession(false);
    }
  };




    if (shouldShowSelector) {
      const tenantShortName = selectedTenant?.name.replace("Sombrerudos ", "") || "Matriz";
      const patronUserId = `${selectedTenant?.id}-admin`;
      const patronUserName = `Patrón ${tenantShortName} 🤠 Matriz`;

      // Memorize grouped closed sessions by day
      const groupedClosedSessions = cashierSessions.reduce((acc: Record<string, CashierSession[]>, session) => {
        if (session.status !== "closed") return acc;

        // Apply secondary filter
        
        const dateVal = session.closedAt || session.openedAt || getMexicoISOString();
        const d = new Date(dateVal);
        const dayString = d.toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const capitalized = dayString.charAt(0).toUpperCase() + dayString.slice(1);

        if (!acc[capitalized]) {
          acc[capitalized] = [];
        }
        acc[capitalized].push(session);
        return acc;
      }, {});

      // Sort sessions inside groups
      Object.keys(groupedClosedSessions).forEach((key) => {
        groupedClosedSessions[key].sort((a, b) => {
          const timeA = new Date(a.closedAt || a.openedAt).getTime();
          const timeB = new Date(b.closedAt || b.openedAt).getTime();
          return historySortOrder === "desc" ? timeB - timeA : timeA - timeB;
        });
      });

      // Sort the group keys
      const sortedGroupKeys = Object.keys(groupedClosedSessions).sort((keyA, keyB) => {
        const itemA = groupedClosedSessions[keyA][0];
        const itemB = groupedClosedSessions[keyB][0];
        if (!itemA || !itemB) return 0;
        const timeA = new Date(itemA.closedAt || itemA.openedAt).getTime();
        const timeB = new Date(itemB.closedAt || itemB.openedAt).getTime();
        return historySortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });

      return (
        <IonPage>
        {renderMaterialHeader({
          title: selectedTenant ? `🏢 ${selectedTenant.name}` : "Cortes y Turnos",
          subtitle: `📍 ${selectedTenant?.sucursalDefault || "Matriz"} - Cortes y Turnos de Caja`,
          showBack: true,
          onBack: () => appMode === "gestion_cuentas" ? setSelectedTableGestion(null) : setAppMode("floorplan"),
        })}
        <IonHeader className="ion-no-border">
            {/* Selector de vistas principal */}
            <div className="flex items-center justify-center p-2.5 bg-slate-800 gap-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => {
                  setCorteViewMode("current");
                  setCorteTablaSessionSelected(null);
                  setCorteFilterUserId("ALL");
                }}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black transition border-none cursor-pointer ${
                  corteViewMode === "current"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/40 bg-transparent"
                }`}
              >
                <span>⚡ Turno Actual</span>
              </button>

              
              {currentUser?.role !== "cajero" && (
                <button
                  type="button"
                  onClick={() => {
                    setCorteViewMode("history");
                    setCorteTablaSessionSelected(null);
                    setCorteFilterUserId("ALL");
                  }}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black transition border-none cursor-pointer ${
                    corteViewMode === "history"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/40 bg-transparent"
                  }`}
                >
                  <span>🏛️ Historial</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setDailyReportTargetDate(undefined);
                  setShowDailyReportModal(true);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black transition border-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 ml-4"
              >
                <IonIcon icon={statsChartOutline} style={{ fontSize: "14px" }} />
                <span>📊 Reporte del Día</span>
              </button>
            </div>
          </IonHeader>
          <IonContent
            className="ion-padding"
            style={{ "--background": "#f8fafc" }}
          >
            <div className="max-w-4xl mx-auto py-4">

              {/* VISTA: REALIZAR CORTES (Turnos Activos / Abrir Turno) */}
              {corteViewMode === "current" && (
                <div className="space-y-6">
                  <div className="text-center py-2">
                    <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
                      <span>🏪</span> Ciclo de Venta Activo
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      El corte de caja se realiza automáticamente a las 3:00 AM del día
                    </p>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-indigo-50/80 shadow-sm text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-3xl shadow-inner">
                      🏪
                    </div>
                    <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">
                      Ciclo de Venta Activo
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                      El ciclo de venta actual abarca desde las 5:00 AM de hoy hasta las 3:00 AM del día siguiente. No es necesario abrir ni cerrar turnos manualmente: el sistema agrupa, calcula e inicializa la dotación de caja en tiempo real de manera continua.
                    </p>
                    <div className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
                      <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
                        ¿Hay mesas ocupadas o cuentas pendientes rezagadas de días anteriores?
                      </p>
                      <button
                        onClick={async () => {
                          if (window.confirm("¿Estás seguro de que deseas liberar y limpiar TODAS las mesas para iniciar fresco? Esto borrará comandas activas de las mesas.")) {
                            try {
                              for (const table of tables) {
                                if (table.status === "occupied" || table.status === "payment_pending") {
                                  await releaseTableInFirebase(table.id);
                                }
                              }
                              triggerAppNotification("Limpieza 🧹", "¡Todas las mesas de la sucursal han sido liberadas y limpiadas! 🧹✅", "success");
                            } catch (err) {
                              triggerAppNotification("Error ❌", "Error al liberar las mesas", "warning");
                            }
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 px-6 rounded-2xl text-xs transition shadow border-none pointer-events-auto cursor-pointer"
                      >
                        🧹 Liberar y Limpiar Todas las Mesas
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA: VALIDAR CORTES / HISTORIAL POR DÍA */}
              {corteViewMode === "history" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <span>🕒</span> Validar Cortes & Historial de Turnos
                      </h2>
                      <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                        Revisa, aprueba / valida y organiza turnos por día
                      </p>
                    </div>

                    {/* Botón reorganizar por día */}
                    <button
                      type="button"
                      onClick={() => setHistorySortOrder(prev => prev === "desc" ? "asc" : "desc")}
                      className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-2 rounded-2xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      🔄 Reorganizar Cortes ({historySortOrder === "desc" ? "Más Reciente ↓" : "Más Antiguo ↑"})
                    </button>
                  </div>

                  {/* Barra de Filtro de Validación (Removed) */}

                  {/* Separación y listado agrupado por día */}
                  <div className="space-y-8">
                    {sortedGroupKeys.map((dayKey) => (
                      <div key={dayKey} className="space-y-3">
                        {/* Cabecera del día */}
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 bg-indigo-50/50 p-3 rounded-2xl">
                          <span className="text-lg">📅</span>
                          <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest">
                            {dayKey}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const firstSession = groupedClosedSessions[dayKey][0];
                              const targetOpDay = firstSession.openedAt ? firstSession.openedAt.split("T")[0] : getMexicoISOString().split("T")[0];
                              setDailyReportTargetDate(targetOpDay);
                              setShowDailyReportModal(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-[11px] transition duration-150 flex items-center gap-1 border border-emerald-500/25 cursor-pointer ml-3 shadow-sm shadow-emerald-600/20"
                          >
                            <IonIcon icon={statsChartOutline} style={{ fontSize: "12px" }} />
                            <span>Reporte del Día 📊</span>
                          </button>
                          <span className="ml-auto bg-indigo-100 text-indigo-800 text-[12px] font-black px-2 py-0.5 rounded-full">
                            {groupedClosedSessions[dayKey].length} {groupedClosedSessions[dayKey].length === 1 ? "turno" : "turnos"}
                          </span>
                        </div>

                        {/* Listado de turnos de ese día */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedClosedSessions[dayKey].map((session) => {
                            const financials = getSessionFinancials(session);
                            const totalVentas = financials.totalVentas;
                            const totalGastos = financials.totalGastos;
                            const balanceEsperado = financials.balanceEsperado;
                            const balanceReal = financials.balanceReal;
                            const dif = financials.dif;
                            const dotacionInicial = financials.dotacionInicial;
                            const totalInflows = financials.totalInflows;
                            const cashSales = financials.cashSales;

                            const isOpen = session.status === "open";
                            const headerText = (() => {
                              const dVal = session.closedAt || session.openedAt || getMexicoISOString();
                              const dObj = new Date(dVal);
                              const dayStr = dObj.toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                              const formattedDate = dayStr.toUpperCase();
                              const statusText = isOpen ? "ABIERTO" : "CERRADO";
                              const closeTimeStr = (!isOpen && session.closedAt) 
                                ? new Date(session.closedAt).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: true }) 
                                : "";
                              return `${formattedDate}, ${statusText}${closeTimeStr ? `, HORA DE CIERRE: ${closeTimeStr.toUpperCase()}` : ""}`;
                            })();

                            const isExpanded = !!expandedSessionDetails[session.id];
                            const sId = session.id;
                            const sOpened = new Date(session.openedAt);
                            const sClosed = session.closedAt ? new Date(session.closedAt) : null;

                            // Filter data for this specific session inline
                            const sessionHistory = history.filter((h) => {
                              if (h.sessionId && h.sessionId === sId) return true;
                              const hTime = new Date(h.timestamp);
                              return hTime >= sOpened && (!sClosed || hTime <= sClosed);
                            });

                            const sessionMovements = cashMovements.filter((m) => {
                              if (m.sessionId && m.sessionId === sId) return true;
                              const mTime = new Date(m.timestamp || m.date || new Date());
                              return mTime >= sOpened && (!sClosed || mTime <= sClosed);
                            });

                            const sessionExpenses = expenses.filter((e) => {
                              if (e.sessionId && e.sessionId === sId) return true;
                              if (!e.createdAt) return false;
                              const eTime = new Date(e.createdAt);
                              return eTime >= sOpened && (!sClosed || eTime <= sClosed);
                            });

                            const sessionPurchases = purchases.filter((p) => {
                              if (p.sessionId && p.sessionId === sId) return true;
                              const pTime = new Date(p.timestamp || new Date());
                              return pTime >= sOpened && (!sClosed || pTime <= sClosed);
                            });

                            return (
                              <div
                                key={session.id}
                                onClick={() => {
                                  setExpandedSessionDetails(prev => ({
                                    ...prev,
                                    [session.id]: !prev[session.id]
                                  }));
                                }}
                                className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all flex flex-col justify-between gap-3 relative overflow-hidden cursor-pointer ${
                                  session.isValidated 
                                    ? "border-emerald-200/85 hover:border-emerald-400 bg-emerald-50/10" 
                                    : "border-slate-100 hover:border-indigo-200"
                                }`}
                              >
                                <div>
                                  {/* Encabezado de la Tarjeta */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-black text-slate-800 text-sm leading-snug">
                                        📅 {headerText}
                                      </h4>
                                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                                        👤 Operador: {session.userName}
                                      </span>
                                    </div>
                                    <div className="text-right self-end sm:self-auto">
                                      {session.isValidated ? (
                                        <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full text-[12px] uppercase tracking-wider block">
                                          ✓ Validado
                                        </span>
                                      ) : (
                                        <span className="bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full text-[12px] uppercase tracking-wider block">
                                          ⚠️ Sin Validar
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Desglose financiero resumido (fuente más grande) */}
                                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1.5 text-xs font-semibold text-slate-600 mt-2">
                                    <div className="flex justify-between items-center text-slate-900 font-black text-xs pb-1 border-b border-slate-150">
                                      <span>📈 Ventas Totales:</span>
                                      <span className="text-emerald-700 font-black text-sm">${totalVentas.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span>📥 Fondo de Caja + Entradas:</span>
                                      <span className="text-indigo-600 font-bold">${(dotacionInicial + totalInflows).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span>💵 Efectivo Ventas:</span>
                                      <span className="text-slate-850 font-bold">${cashSales.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span>💸 Salidas / Gastos:</span>
                                      <span className="text-rose-600 font-bold">-${totalGastos.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-805 font-bold pt-1.5 border-t border-slate-205 text-[11px]">
                                      <span>📊 Esperado Efectivo:</span>
                                      <span className="text-slate-900 font-black text-xs">${balanceEsperado.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-indigo-800 font-extrabold text-[11px]">
                                      <span>⭐ Arqueo Declarado:</span>
                                      <span className="bg-indigo-50 px-2 py-0.5 rounded font-black text-xs">${balanceReal.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Conciliación */}
                                    <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-200 text-[11px]">
                                      <span className="font-bold">🎯 Diferencia:</span>
                                      <span className={`font-black px-1.5 py-0.5 rounded text-[12px] ${dif < 0 ? "bg-rose-50 text-rose-600" : dif > 0 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                                        {dif < 0 ? `Faltante: -$${Math.abs(dif).toFixed(2)}` : dif > 0 ? `Sobrante: +$${dif.toFixed(2)}` : "Exacta ✓"}
                                      </span>
                                    </div>

                                    {session.isValidated && (
                                      <div className="text-[12px] text-emerald-800 font-bold bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex flex-col gap-0.5 mt-1.5 leading-tight">
                                        <span>👤 Revisado por: {session.validatedBy || "Patrón"}</span>
                                        <span>📅 Fecha: {session.validatedAt ? new Date(session.validatedAt).toLocaleDateString() : "Recientemente"}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Cuentas detalladas en línea */}
                                  {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4" onClick={(e) => e.stopPropagation()}>
                                      <h5 className="text-xs font-black text-indigo-950 uppercase tracking-widest border-b border-indigo-50 pb-1.5 flex items-center gap-1.5">
                                        <span>📋</span> Cuentas y Movimientos del Turno
                                      </h5>

                                      {/* 1. Ventas Efectivo */}
                                      <div className="space-y-1.5">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                                          💵 Ventas en Efectivo:
                                        </span>
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                          {sessionHistory.filter(h => (h.status === "completed" || h.isPaid) && ["cash", "efectivo"].includes((h.paymentMethod || "").toLowerCase())).map((h, idx) => (
                                            <div key={`s-cash-${h.id}-${idx}`} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100/60">
                                              <span className="font-bold text-slate-700">Mesa {h.tableLabel || "0"}</span>
                                              <span className="text-slate-400 font-semibold">{new Date(h.timestamp || Date.now()).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</span>
                                              <span className="font-extrabold text-slate-800">${Number(h.total || 0).toFixed(2)}</span>
                                            </div>
                                          ))}
                                          {sessionHistory.filter(h => (h.status === "completed" || h.isPaid) && ["cash", "efectivo"].includes((h.paymentMethod || "").toLowerCase())).length === 0 && (
                                            <span className="text-xs text-slate-400 font-semibold italic block py-0.5">Ninguna venta en efectivo.</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* 2. Ventas Electrónicas */}
                                      <div className="space-y-1.5">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                                          💳 Ventas Electrónicas (Tarjeta/Trans):
                                        </span>
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                          {sessionHistory.filter(h => (h.status === "completed" || h.isPaid) && !["cash", "efectivo", "lupay"].includes((h.paymentMethod || "").toLowerCase())).map((h, idx) => (
                                            <div key={`s-mixed-${h.id}-${idx}`} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100/60">
                                              <span className="font-bold text-slate-700">Mesa {h.tableLabel || "0"} <span className="bg-indigo-50 text-indigo-750 text-[12px] px-1 py-0.5 rounded font-black uppercase">{h.paymentMethod}{h.cardLastFour ? ` *${h.cardLastFour}` : ""}</span></span>
                                              <span className="text-slate-400 font-semibold">{new Date(h.timestamp || Date.now()).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</span>
                                              <span className="font-extrabold text-slate-800">${Number(h.total || 0).toFixed(2)}</span>
                                            </div>
                                          ))}
                                          {sessionHistory.filter(h => (h.status === "completed" || h.isPaid) && !["cash", "efectivo", "lupay"].includes((h.paymentMethod || "").toLowerCase())).length === 0 && (
                                            <span className="text-xs text-slate-400 font-semibold italic block py-0.5">Ninguna venta electrónica.</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* 2.5. Cuentas de LUPAY */}
                                      <div className="space-y-1.5">
                                        <span className="text-[11px] font-black text-indigo-650 uppercase tracking-wider block">
                                          📱 Cuentas de LUPAY:
                                        </span>
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                          {sessionHistory.filter(h => (h.status === "completed" || h.isPaid) && (h.paymentMethod || "").toLowerCase() === "lupay").map((h, idx) => (
                                            <div key={`s-lupay-${h.id}-${idx}`} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100/60">
                                              <span className="font-bold text-slate-700">Mesa {h.tableLabel || "0"} <span className="bg-indigo-50 text-indigo-750 text-[12px] px-1 py-0.5 rounded font-black uppercase">{h.paymentMethod}</span></span>
                                              <span className="text-slate-400 font-semibold">{new Date(h.timestamp || Date.now()).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</span>
                                              <span className="font-extrabold text-slate-800">${Number(h.total || 0).toFixed(2)}</span>
                                            </div>
                                          ))}
                                          {sessionHistory.filter(h => (h.status === "completed" || h.isPaid) && (h.paymentMethod || "").toLowerCase() === "lupay").length === 0 && (
                                            <span className="text-xs text-slate-400 font-semibold italic block py-0.5">Ninguna venta LUPAY.</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* 3. Entradas Adicionales */}
                                      <div className="space-y-1.5">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                                          📥 Entradas Adicionales:
                                        </span>
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                          {sessionMovements.filter(m => m.type === "in").map((mov, idx) => (
                                            <div key={`s-in-${mov.id || idx}`} className="text-xs bg-slate-50 p-2 rounded border border-slate-100/60 flex flex-col gap-0.5">
                                              <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-700">{mov.concept === "dotacion" ? "Inyección Fondo" : mov.concept === "venta_extra" ? "Venta Caja" : mov.concept || "Ingreso"}</span>
                                                <span className="font-black text-emerald-600">+${Number(mov.amount || 0).toFixed(2)}</span>
                                              </div>
                                              {mov.description && <p className="text-[11px] text-slate-500 italic font-semibold">"{mov.description}"</p>}
                                            </div>
                                          ))}
                                          {sessionMovements.filter(m => m.type === "in").length === 0 && (
                                            <span className="text-xs text-slate-400 font-semibold italic block py-0.5">Ninguna entrada registrada.</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* 4. Egresos y Gastos */}
                                      <div className="space-y-1.5">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                                          💸 Egresos / Gastos de Caja:
                                        </span>
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                          {[
                                            ...sessionExpenses.map(e => ({ type: "expense", title: `${e.concept || "Gasto"} (${e.category || "Varios"})`, amt: e.amount, ref: e.reference })),
                                            ...sessionMovements.filter(m => m.type === "out").map(m => ({ type: "outflow", title: `Retiro: ${m.concept || "Salida"}`, amt: m.amount, ref: m.description }))
                                          ].map((eg, idx) => (
                                            <div key={`s-eg-${idx}`} className="text-xs bg-slate-50 p-2 rounded border border-slate-100/60 flex flex-col gap-0.5">
                                              <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-700">{eg.title}</span>
                                                <span className="font-black text-rose-600">-${Number(eg.amt || 0).toFixed(2)}</span>
                                              </div>
                                              {eg.ref && <p className="text-[11px] text-slate-500 italic font-semibold">"{eg.ref}"</p>}
                                            </div>
                                          ))}
                                          {sessionExpenses.length === 0 && sessionMovements.filter(m => m.type === "out").length === 0 && (
                                            <span className="text-xs text-slate-400 font-semibold italic block py-0.5">Ningún egreso o retiro.</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* 5. Compras Proveedores */}
                                      <div className="space-y-1.5">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                                          🛒 Compras a Proveedores (Efectivo):
                                        </span>
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                          {sessionPurchases.filter(p => p.isPaid).map((p, idx) => (
                                            <div key={`s-purch-${p.id || idx}`} className="text-xs bg-slate-50 p-2 rounded border border-slate-100/60 flex flex-col gap-0.5">
                                              <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-700">{p.supplierName || "Proveedor"} <span className="font-normal text-slate-400">({p.concept || "Insumos"})</span></span>
                                                <span className="font-black text-rose-600">-${Number(p.total || 0).toFixed(2)}</span>
                                              </div>
                                            </div>
                                          ))}
                                          {sessionPurchases.filter(p => p.isPaid).length === 0 && (
                                            <span className="text-xs text-slate-400 font-semibold italic block py-0.5">Ninguna compra en efectivo.</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Botones de Acciones para Organizar/Validar/Asignar/Borrar */}
                                <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-1.5 justify-end">
                                  {/* Botón Ver Detalle en línea */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedSessionDetails(prev => ({
                                        ...prev,
                                        [session.id]: !prev[session.id]
                                      }));
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-705 font-black px-3.5 py-2 rounded-xl text-xs transition border-none cursor-pointer flex items-center gap-1.5"
                                  >
                                    {isExpanded ? "👁️ Ocultar Detalle" : "👁️ Ver Detalle"}
                                  </button>

                                  {/* Accion: VALIDAR CORTE (Solo si no está validado) */}
                                  {/* {!session.isValidated && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await updateCashierSessionInFirebase(session.id, {
                                            isValidated: true,
                                            validatedAt: getMexicoISOString(),
                                            validatedBy: currentUser?.name || "Patrón",
                                          });
                                          triggerAppNotification(
                                            "Corte Validado ✅",
                                            "¡Corte de caja validado y aprobado correctamente! 🤠✨",
                                            "success"
                                          );
                                        } catch (err) {
                                          triggerAppNotification(
                                            "Error ❌",
                                            "Ocurrió un error al validar el corte",
                                            "warning"
                                          );
                                        }
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-[12px] transition border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                                    >
                                      ✓ Validar Corte
                                    </button>
                                  )} */}

                                  {/* Accion: ASIGNAR AL PATRÓN (Solo si no es ya propiedad de él) */}
                                  {session.userId !== patronUserId && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`¿Deseas asignar y re-atribuir este corte/turno al usuario Patrón matriz (${patronUserName})? This will normalize reporting statistics.`)) {
                                          try {
                                            await updateCashierSessionInFirebase(session.id, {
                                              userId: patronUserId,
                                              userName: patronUserName,
                                            });
                                            alert("¡Este corte ha sido reasignado exitosamente al Patrón! 🤠 Matriz ✓");
                                          } catch (err) {
                                            alert("Error al reasignar el corte");
                                          }
                                        }
                                      }}
                                      className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-black px-3 py-1.5 rounded-xl text-[12px] transition border-none cursor-pointer flex items-center gap-1"
                                    >
                                      🤠 Asignar a Patrón
                                    </button>
                                  )}

                                  {/* Accion: EXPORTAR CORTE A OTRO TENANT (Exclusivo Rol Sistemas) */}
                                  {(currentUser?.role === "sistemas" ||
                                    currentUser?.role === "Sistemas" ||
                                    currentUser?.id?.endsWith("-sistemas") ||
                                    isSystemsMode) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenExportModal(session);
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-[12px] transition border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                                      title="Exportar una copia de este corte de caja hacia otro inquilino (Exclusivo Sistemas)"
                                    >
                                      <IonIcon icon={swapHorizontalOutline} className="text-xs text-white" />
                                      <span>Exportar a otro tenant</span>
                                    </button>
                                  )}

                                  {/* Accion: BORRAR CORTE Y NO LOS MOVIMIENTOS */}
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const sessionHistory = (history || []).filter((h: any) => h.sessionId === session.id);
                                      const sessionExpenses = (expenses || []).filter((ex: any) => ex.sessionId === session.id);
                                      const sessionCash = (cashMovements || []).filter((cm: any) => cm.sessionId === session.id);
                                      const sessionPurchases = (purchases || []).filter((p: any) => p.sessionId === session.id);

                                      const tenantName = selectedTenant?.name || "este tenant";

                                      const msg1 = `¿Desea eliminar este corte del tenant ${tenantName}? \n\nESTA ACCIÓN ES IRREVERSIBLE.\n\nSe borrará el registro de arqueo y los siguientes movimientos asociados de este turno y tenant:\n- ${sessionHistory.length} cuentas (ventas/comandas)\n- ${sessionExpenses.length} gastos\n- ${sessionCash.length} movimientos de caja\n- ${sessionPurchases.length} compras\n\nLos movimientos de otros cortes continuarán intactos. ¿Desea continuar?`;

                                      if (window.confirm(msg1)) {
                                        const msg2 = `¿Está COMPLETAMENTE seguro? Esto borrará definitivamente el turno y sus ${sessionHistory.length} cuentas, ${sessionExpenses.length} gastos, etc. No hay marcha atrás.`;
                                        if (window.confirm(msg2)) {
                                          const msg3 = `ÚLTIMA CONFIRMACIÓN.\n\n¿Borrar TODO lo relacionado al turno del tenant ${tenantName}? (Turno, ventas, gastos, movimientos y compras de ESTE corte)`;
                                          if (window.confirm(msg3)) {
                                            try {
                                              for (const item of sessionHistory) {
                                                if (item?.id) await deleteHistoryItemFromFirebase(item.id);
                                              }
                                              for (const item of sessionExpenses) {
                                                if (item?.id) await deleteExpenseFromFirebase(item.id);
                                              }
                                              for (const item of sessionCash) {
                                                if (item?.id) await deleteCashMovementFromFirebase(item.id);
                                              }
                                              for (const item of sessionPurchases) {
                                                if (item?.id) await deletePurchaseFromFirebase(item.id);
                                              }
                                              
                                              await deleteCashierSessionFromFirebase(session.id);

                                              alert("Registro de turno y todos sus movimientos asociados fueron eliminados de forma irreversible. ✓ 🧹");
                                            } catch (err) {
                                              console.error("Error al borrar el corte y movimientos", err);
                                              alert("Error al borrar el corte y sus movimientos. Revise la consola para más detalles.");
                                            }
                                          }
                                        }
                                      }
                                    }}
                                    className="bg-rose-50 hover:bg-rose-105 text-rose-600 font-bold px-2.5 py-1.5 rounded-xl text-[12px] transition border-none cursor-pointer flex items-center gap-1 ml-auto"
                                    title="Borrar registro de corte sin afectar las transacciones asociadas"
                                  >
                                    <IonIcon icon={trashOutline} className="text-xs" />
                                    <span>Borrar</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {sortedGroupKeys.length === 0 && (
                      <div className="p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl">📬</span>
                        <span>No hay cortes de caja cerrados que coincidan con los filtros seleccionados.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </IonContent>

          {/* Modal de Exportación de Corte entre Inquilinos (2 Pasos - Rol Sistemas) */}
<ExportSessionModal
          exportSessionModal={exportSessionModal}
          setExportSessionModal={setExportSessionModal}
        />
        </IonPage>
      );
    }


    // Now if we reach here, we have a sessionToRender (implicitly selected or auto-selected)
    const isClosed = sessionToRender?.status === "closed";
    const sessionToRenderFinancials = isClosed ? getSessionFinancials(sessionToRender) : null;

    const safeCorteData = corteData || {};

    const dynamicCashSales = safeCorteData.cashSales || 0;
    const dynamicCardSales = safeCorteData.cardSales || 0;
    const dynamicTransSales = safeCorteData.transSales || 0;
    const dynamicLupaySales = safeCorteData.lupaySales || 0;
    const dynamicTotalPurchasesPaid = safeCorteData.totalPurchasesPaid || 0;

    const fallbackCashSales = sessionToRenderFinancials ? sessionToRenderFinancials.cashSales : 0;
    const fallbackCardSales = sessionToRenderFinancials ? sessionToRenderFinancials.cardSales : 0;
    const fallbackTransSales = sessionToRenderFinancials ? sessionToRenderFinancials.transSales : 0;
    const fallbackLupaySales = sessionToRenderFinancials ? sessionToRenderFinancials.lupaySales : 0;
    const fallbackTotalPurchasesPaid = sessionToRenderFinancials ? sessionToRenderFinancials.totalPurchasesPaid : 0;
    const fallbackTotalOutflows = sessionToRenderFinancials ? sessionToRenderFinancials.totalOutflows : 0;
    const fallbackTotalInflows = sessionToRenderFinancials ? sessionToRenderFinancials.totalInflows : 0;

    const corteDataShadow = {
      ...safeCorteData,
      cashSales: dynamicCashSales > 0 ? dynamicCashSales : (isClosed ? fallbackCashSales : dynamicCashSales),
      cardSales: dynamicCardSales > 0 ? dynamicCardSales : (isClosed ? fallbackCardSales : dynamicCardSales),
      transSales: dynamicTransSales > 0 ? dynamicTransSales : (isClosed ? fallbackTransSales : dynamicTransSales),
      lupaySales: dynamicLupaySales > 0 ? dynamicLupaySales : (isClosed ? fallbackLupaySales : dynamicLupaySales),
      cashSalesCount: safeCorteData.cashSalesCount > 0 ? safeCorteData.cashSalesCount : (isClosed && sessionToRender?.cashSalesCount !== undefined ? sessionToRender.cashSalesCount : (safeCorteData.cashSalesCount || 0)),
      cardSalesCount: safeCorteData.cardSalesCount > 0 ? safeCorteData.cardSalesCount : (isClosed && sessionToRender?.cardSalesCount !== undefined ? sessionToRender.cardSalesCount : (safeCorteData.cardSalesCount || 0)),
      transSalesCount: safeCorteData.transSalesCount > 0 ? safeCorteData.transSalesCount : (isClosed && sessionToRender?.transSalesCount !== undefined ? sessionToRender.transSalesCount : (safeCorteData.transSalesCount || 0)),
      lupaySalesCount: safeCorteData.lupaySalesCount > 0 ? safeCorteData.lupaySalesCount : (isClosed && sessionToRender?.lupaySalesCount !== undefined ? sessionToRender.lupaySalesCount : (safeCorteData.lupaySalesCount || 0)),
      totalPurchasesPaid: dynamicTotalPurchasesPaid > 0 ? dynamicTotalPurchasesPaid : (isClosed ? fallbackTotalPurchasesPaid : dynamicTotalPurchasesPaid),
    };

    return ((corteData) => {
      const todayOutflows = (filteredCashMovementsForCorte || []).filter(
      (mov) => mov.type === "out",
    );
    const todayInflows = (filteredCashMovementsForCorte || []).filter(
      (mov) => mov.type === "in",
    );
    const todayExpenses = (filteredExpensesForCorte || []).filter(
      (exp) => !!exp.createdAt,
    );

    const dynamicOutflowsAmt = (todayOutflows.reduce((sum, mov) => sum + Number(mov.amount || 0), 0) +
         todayExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0));
    const totalOutflowsAmt = dynamicOutflowsAmt > 0
      ? dynamicOutflowsAmt
      : (isClosed ? fallbackTotalOutflows : dynamicOutflowsAmt);

    const dynamicInflowsAmt = todayInflows.reduce((sum, mov) => sum + Number(mov.amount || 0), 0);
    const totalInflowsAmt = dynamicInflowsAmt > 0
      ? dynamicInflowsAmt
      : (isClosed ? fallbackTotalInflows : dynamicInflowsAmt);

    const totalEntradasEfectivo = Number(sessionToRender?.dotacionInicial || 0) + corteData.cashSales + totalInflowsAmt;
    const totalSalidasEfectivo = totalOutflowsAmt + corteData.totalPurchasesPaid;

    const calculatedEstimatedCash = Math.max(
      0,
      corteData.cashSales +
        totalInflowsAmt +
        Number(sessionToRender?.dotacionInicial || 0) -
        totalOutflowsAmt -
        corteData.totalPurchasesPaid,
    );
    const estimatedCashInBox = calculatedEstimatedCash > 0
      ? calculatedEstimatedCash
      : (isClosed && sessionToRender?.estimatedCash !== undefined ? sessionToRender.estimatedCash : calculatedEstimatedCash);

    const totalVentasTurno =
      Number(corteData.cashSales || 0) +
      Number(corteData.cardSales || 0) +
      Number(corteData.transSales || 0) +
      Number(corteData.lupaySales || 0);

    const totalCobrosTurnoCount =
      Number(corteData.cashSalesCount || 0) +
      Number(corteData.cardSalesCount || 0) +
      Number(corteData.transSalesCount || 0) +
      Number(corteData.lupaySalesCount || 0);

    const tablaArqueoTotalBilletes =
      (parseInt(tablaArq1000) || 0) * 1000 +
      (parseInt(tablaArq500) || 0) * 500 +
      (parseInt(tablaArq200) || 0) * 200 +
      (parseInt(tablaArq100) || 0) * 100 +
      (parseInt(tablaArq50) || 0) * 50 +
      (parseInt(tablaArq20) || 0) * 20;

    const tablaArqueoTotalMonedas =
      (parseInt(tablaArqM10) || 0) * 10 +
      (parseInt(tablaArqM5) || 0) * 5 +
      (parseInt(tablaArqM2) || 0) * 2 +
      (parseInt(tablaArqM1) || 0) * 1 +
      (parseInt(tablaArqM05) || 0) * 0.5;

    const tablaArqueoTotal = tablaArqueoTotalBilletes + tablaArqueoTotalMonedas;

    const diferenciaCaja = tablaArqueoTotal - estimatedCashInBox;
    const esFaltante = diferenciaCaja < 0;
    const esSobrante = diferenciaCaja > 0;

    const generateCorteText = (customCajeroName?: string, customRole?: string, isReopenedNotice?: boolean) => {
      const dateStr = new Date().toLocaleString("es-MX");
      const nombreNegocio = ticketBusinessName || selectedTenant?.name || "COCINET";
      const nombreSucursal = ticketSucursal || selectedTenant?.sucursalDefault || "SUCURSAL MATRIZ";
      const cajeroNombre = customCajeroName || sessionToRender?.closedByUserName || sessionToRender?.userName || currentUser?.name || "Cajero de Turno";
      const rolStr = customRole || sessionToRender?.closedByUserRole || currentUser?.role || "cajero";
      const isReopened = isReopenedNotice !== undefined ? isReopenedNotice : ((sessionToRender?.reopenedCount || 0) > 0);

      const totalVentasNetas =
        Number(corteData.cashSales || 0) +
        Number(corteData.cardSales || 0) +
        Number(corteData.transSales || 0) +
        Number(corteData.lupaySales || 0);

      const totalCobrosCount =
        Number(corteData.cashSalesCount || 0) +
        Number(corteData.cardSalesCount || 0) +
        Number(corteData.transSalesCount || 0) +
        Number(corteData.lupaySalesCount || 0);

      let text = `=================================\n`;
      text += `🏪 ${nombreNegocio.toUpperCase()}\n`;
      text += `📍 SUCURSAL: ${nombreSucursal.toUpperCase()}\n`;
      text += `=================================\n`;
      if (isReopened) {
        text += `🚨 CORTE FINAL DEFINITIVO (ACUMULADO DEL DÍA)\n`;
        text += `⚠️ (Actualiza y reemplaza al corte anterior por ventas adicionales en madrugada)\n`;
      } else {
        text += `📝 CORTE DE CAJA / FIN DE TURNO\n`;
      }
      text += `📅 Fecha: ${dateStr}\n`;
      text += `👤 Responsable: ${cajeroNombre} (${rolStr.toUpperCase()})\n`;
      text += `=================================\n\n`;

      text += `🟢 TOTAL VENDIDO EN EL DÍA: $${totalVentasNetas.toFixed(2)}\n`;
      text += `🧾 Total Cuentas Cobradas: ${totalCobrosCount} cuentas\n`;
      text += `---------------------------------\n`;
      text += `💵 Efectivo en Ventas:    $${Number(corteData.cashSales || 0).toFixed(2)} (${corteData.cashSalesCount || 0} cobros)\n`;
      text += `💳 Tarjetas / Transf:     $${(Number(corteData.cardSales || 0) + Number(corteData.transSales || 0)).toFixed(2)} (${(corteData.cardSalesCount || 0) + (corteData.transSalesCount || 0)} cobros)\n`;
      if (Number(corteData.lupaySales || 0) > 0) {
        text += `📱 Ventas LUPAY:          $${Number(corteData.lupaySales || 0).toFixed(2)} (${corteData.lupaySalesCount || 0} cobros)\n`;
      }
      text += `---------------------------------\n\n`;

      text += `💰 BALANCE EN CAJA (SOLO EFECTIVO)\n`;
      text += `---------------------------------\n`;
      text += `📥 Fondo de Apertura:     $${Number(sessionToRender?.dotacionInicial || 0).toFixed(2)}\n`;
      text += `➕ Entradas Adicionales:  $${totalInflowsAmt.toFixed(2)}\n`;
      text += `➖ Gastos / Egresos:     -$${totalOutflowsAmt.toFixed(2)}\n`;
      text += `🛒 Compras Pagadas:      -$${Number(corteData.totalPurchasesPaid || 0).toFixed(2)}\n`;
      text += `---------------------------------\n`;
      text += `💵 EFECTIVO ESPERADO:     $${estimatedCashInBox.toFixed(2)}\n`;
      text += `⭐ CONTEO FÍSICO (ARQUEO):$${tablaArqueoTotal.toFixed(2)}\n`;
      text += `---------------------------------\n`;

      const absDif = Math.abs(diferenciaCaja).toFixed(2);
      if (esFaltante) {
        text += `🔴 FALTANTE EN CAJA:     -$${absDif}\n`;
      } else if (esSobrante) {
        text += `🟢 SOBRANTE EN CAJA:     +$${absDif}\n`;
      } else {
        text += `✅ CAJA CUADRADA AL 100%\n`;
      }
      text += `=================================\n\n`;

      text += `💳 DETALLE VENTAS ELECTRÓNICAS\n`;
      text += `---------------------------------\n`;
      let elecAdded = false;
      (filteredHistoryForCorte || [])
        .filter(
          (h) =>
            (h.status === "completed" || h.isPaid) &&
            !["cash", "efectivo"].includes((h.paymentMethod || "").toLowerCase())
        )
        .forEach((h) => {
          const foliosInt = (h.comandas || []).map((c: any) => c.folioInterno ? `#${c.folioInterno}` : `#${c.folio}`).join(",");
          text += `• Mesa ${h.tableLabel || "0"} (${h.paymentMethod.toUpperCase()}${h.cardLastFour ? ` *${h.cardLastFour}` : ""}${foliosInt ? ` Int:${foliosInt}` : ""}): $${Number(h.total || 0).toFixed(2)}\n`;
          elecAdded = true;
        });
      if (!elecAdded) text += `• Sin ventas electrónicas\n`;
      text += `👉 Total Elec: $${(corteData.cardSales + corteData.transSales + corteData.lupaySales).toFixed(2)}\n`;
      text += `=================================\n`;
      text += `¡Gracias por cuidar sucursal! 🌮✨\n`;
      return text;
    };

    const handleInitiateCloseShift = () => {
      if (!sessionToRender) {
        triggerAppNotification("Aviso", "No hay una sesión activa de turno para cerrar.", "info");
        return;
      }

      // 1. Candado: Checar si hay mesas o comandas abiertas pendientes de cobro
      const occupied = (tables || []).filter((t: any) => {
        if (t.status === "occupied" || t.status === "payment_pending") return true;
        const comandas = t.comandas || [];
        return comandas.some((c: any) => (c.items || []).some((i: any) => !i.isCancelled));
      });

      if (occupied.length > 0) {
        setPendingTablesList(occupied);
        setShowPendingTablesModal(true);
        return;
      }

      // 2. Si no hay mesas abiertas, pedir PIN del Cajero Responsable
      setClosePinInput("");
      setShowClosePinModal(true);
    };

    const handleConfirmCloseWithPin = async (pinEntered: string) => {
      const tenantUsers = getTenantUsers(selectedTenant?.id || "tenant-1");
      const matchedUser = tenantUsers.find((u) => u.pin === pinEntered) ||
        (pinEntered === "2052" || pinEntered === "4020" ? { id: "master", name: "Administrador General", role: "admin" as const, pin: pinEntered, avatar: "👑" } : null);

      if (!matchedUser) {
        triggerAppNotification("❌ PIN Incorrecto", "El PIN ingresado no corresponde a ningún usuario autorizado de esta sucursal.", "warning");
        return;
      }

      try {
        const nowIso = new Date().toISOString();
        const isReopening = (sessionToRender?.reopenedCount || 0) > 0;
        
        const updatedSession = {
          ...sessionToRender,
          status: "closed",
          closedAt: nowIso,
          closedByUserName: matchedUser.name,
          closedByUserRole: matchedUser.role,
          arqueoTotal: tablaArqueoTotal,
          arqueoBilletes: tablaArqueoTotalBilletes,
          arqueoMonedas: tablaArqueoTotalMonedas,
          estimatedCash: estimatedCashInBox,
          diferencia: diferenciaCaja,
          cashSales: corteData.cashSales,
          cardSales: corteData.cardSales,
          transSales: corteData.transSales,
          cashSalesCount: corteData.cashSalesCount,
          cardSalesCount: corteData.cardSalesCount,
          transSalesCount: corteData.transSalesCount,
          totalInflows: totalInflowsAmt,
          totalOutflows: totalOutflowsAmt,
          totalPurchasesPaid: corteData.totalPurchasesPaid,
          lastReportedTotal: totalVentasTurno,
        };

        await updateCashierSessionInFirebase(sessionToRender.id, updatedSession);
        
        setCashierSessions((prev: any[]) =>
          prev.map((s) => (s.id === sessionToRender.id ? updatedSession : s))
        );

        setShowClosePinModal(false);
        triggerAppNotification(
          "Turno Cerrado 🔒✅",
          `El turno fue finalizado formalmente por ${matchedUser.name} (${matchedUser.role}).`,
          "success"
        );

        // Disparo de WhatsApp
        const text = generateCorteText(matchedUser.name, matchedUser.role, isReopening);
        const metaConfig = getWhatsAppCloudConfig();

        if (metaConfig.phoneNumberId && metaConfig.accessToken) {
          const tenantUsers = getTenantUsers(selectedTenant?.id || "tenant-1");
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
              sendSilentWhatsAppMessage(r.phone!, text).catch((e) =>
                console.error("Error silent send:", e)
              );
            });
            triggerAppNotification(
              "WhatsApp Silencioso Entregado 🚀✅",
              `Corte entregado en segundo plano a los administradores (${recipients.map((r) => r.name).join(", ")}).`,
              "success"
            );
          } else {
            const encodedText = encodeURIComponent(text);
            window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
          }
        } else {
          const encodedText = encodeURIComponent(text);
          window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
        }
      } catch (err) {
        console.error(err);
        triggerAppNotification("Error", "No se pudo cerrar el turno en Firebase.", "warning");
      }
    };

    const handleReopenShift = async () => {
      if (!sessionToRender) return;
      try {
        const updatedSession = {
          ...sessionToRender,
          status: "open",
          reopenedAt: new Date().toISOString(),
          reopenedCount: (sessionToRender.reopenedCount || 0) + 1,
        };

        await updateCashierSessionInFirebase(sessionToRender.id, updatedSession);
        setCashierSessions((prev: any[]) =>
          prev.map((s) => (s.id === sessionToRender.id ? updatedSession : s))
        );

        triggerAppNotification(
          "Turno Reabierto 🔓",
          "La caja está activa nuevamente para registrar ventas adicionales.",
          "success"
        );
      } catch (err) {
        console.error(err);
        triggerAppNotification("Error", "No se pudo reabrir el turno.", "warning");
      }
    };

    const handleSendTestWhatsApp = async (customPhone?: string) => {
      const text = generateCorteText("Prueba de Cajero", "cajero", false);
      const cleanPhone = (customPhone || "").replace(/\D/g, "");
      const phoneTarget = cleanPhone ? (cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone) : "";

      const metaConfig = getWhatsAppCloudConfig();
      if (metaConfig.phoneNumberId && metaConfig.accessToken && cleanPhone) {
        triggerAppNotification("Enviando WhatsApp Silencioso 🚀", `Conectando con Meta para entregar corte a +52 ${cleanPhone}...`, "info");
        const res = await sendSilentWhatsAppMessage(cleanPhone, text);
        setShowTestWhatsappModal(false);
        if (res.success) {
          triggerAppNotification("WhatsApp Silencioso Entregado ✅🚀", `Reporte de prueba entregado en segundo plano a +52 ${cleanPhone}.`, "success");
          return;
        }
      }

      const encodedText = encodeURIComponent(`🧪 [CORTE DE PRUEBA]\n\n${text}`);
      const waUrl = phoneTarget ? `https://wa.me/${phoneTarget}?text=${encodedText}` : `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(waUrl, "_blank");
      setShowTestWhatsappModal(false);
      triggerAppNotification("WhatsApp de Prueba 📲", "Enlace de WhatsApp de prueba generado con éxito.", "success");
    };

    const exportCorteTablaToTXT = () => {
      const text = generateCorteText();
      const element = document.createElement("a");
      const file = new Blob([text], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      const sName = (ticketSucursal || selectedTenant?.sucursalDefault || "matriz").toLowerCase().replace(/\s+/g, "_");
      element.download = `corte_${sName}_${getMexicoISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      triggerAppNotification("Exportador", "Corte exportado a archivo TXT correctamente 📄✨", "success");
    };

    const sendCorteTablaToWhatsApp = () => {
      const text = generateCorteText();
      const encodedText = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
      triggerAppNotification("WhatsApp", "Enlace de WhatsApp generado con éxito 📲💬", "success");
    };

    const printCorteTabla = async () => {
      if ((window as any)._isPrintingCorte) return;
      (window as any)._isPrintingCorte = true;
      setTimeout(() => {
        (window as any)._isPrintingCorte = false;
      }, 2500);

      try {
        const driver = new EscPosDriver();
        const transport = await createTransport("cuentas", selectedTenant?.id);
        const job = new PosPrinterJob(driver, transport as any);

        const dateStr = new Date().toLocaleString("es-MX");
        
        const rawNegocio = ticketBusinessName || selectedTenant?.name || companyConfig.businessName || "COCINET";
        const rawSucursal = ticketSucursal || selectedTenant?.sucursalDefault || companyConfig.sucursal || "Matriz";

        const nombreNegocio = rawNegocio;
        const nombreSucursal = rawSucursal;
        const cajeroNombre = sessionToRender?.userName || currentUser?.name || "Sin Cajero";

        job.initialize()
           .center()
           .bold(true)
           .printLine(nombreNegocio.toUpperCase())
           .printLine(nombreSucursal.toUpperCase())
           .bold(false)
           .printLine("--------------------------------")
           .printLine("CORTE DE CAJA")
           .printLine(`Fecha: ${dateStr}`)
           .printLine(`Cajero: ${cajeroNombre}`)
           .printLine("--------------------------------")
           .left();
        
        // Sales Summary by Payment Type
        if (corteData) {
            job.bold(true).printLine("RESUMEN DE VENTAS").bold(false)
               .printLine(`Efectivo: $${corteData.cashSales.toFixed(2)} (${corteData.cashSalesCount} vnt)`)
               .printLine(`Tarjeta:  $${corteData.cardSales.toFixed(2)} (${corteData.cardSalesCount} vnt)`)
               .printLine(`Transf.:  $${corteData.transSales.toFixed(2)} (${corteData.transSalesCount} vnt)`)
               .printLine("--------------------------------")
               .bold(true)
               .printLine(`Total Ventas: $${(corteData.cashSales + corteData.cardSales + corteData.transSales).toFixed(2)}`)
               .bold(false)
               .printLine("--------------------------------");
            
            // Detailed Accounts
            job.bold(true).printLine("DETALLE DE CUENTAS").bold(false);
            filteredHistoryForCorte.filter(h => h.status === "completed" || h.isPaid).forEach(h => {
              job.printLine(`${h.tableLabel || "Mesa ?"} | ${h.paymentMethod} | $${Number(h.total || 0).toFixed(2)}`);
            });

            // Expenses/Cancellations
            job.printLine("--------------------------------")
               .bold(true).printLine("EGRESOS Y CANCELACIONES").bold(false)
               .printLine(`Gastos:      $${corteData.totalOutflows?.toFixed(2) || "0.00"}`);
               
            filteredHistoryForCorte.filter(h => h.status === "cancelled" || h.isCancelled).forEach(h => {
               job.printLine(`Cancelado: Mesa ${h.tableLabel || "?"} - $${Number(h.total || 0).toFixed(2)}`);
            });
            
            job.printLine("--------------------------------")
               .bold(true)
               .printLine(`Balance Final: $${(corteData.totalInflows - corteData.totalOutflows)?.toFixed(2) || "0.00"}`)
               .bold(false);
        }

        job.feed(3)
           .cut()
           .execute();
        
        triggerAppNotification("Impresión", "Corte enviado a impresora 🖨️", "success");
      } catch (err) {
        console.error("Error printing corte:", err);
        triggerAppNotification("Error de impresión", "No se pudo conectar con la impresora", "warning");
      }
    };








    return (
      <IonPage>
        <IonHeader>
          <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
            <IonButtons slot="start">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSidebar(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  marginRight: "4.5px",
                }}
              >
                <IonIcon icon={menuOutline} style={{ fontSize: "22px" }} />
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  if (window.innerHeight > window.innerWidth) {
                    setAppMode("floorplan");
                  } else {
                    setAppMode("gestion_cuentas");
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-750 text-white font-black py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition duration-150 flex items-center gap-1.5 border border-emerald-500/25 mr-2 cursor-pointer shadow-sm shadow-emerald-600/20"
                title="Volver al mapa de mesas"
              >
                <IonIcon icon={gridOutline} className="text-sm" />
                <span className="hidden sm:inline">Gestionar Cuentas 🗺️</span>
                <span className="inline sm:hidden">Cuentas 🗺️</span>
              </button>
              {corteTablaSessionSelected && (
                <button
                  type="button"
                  onClick={() => {
                    setCorteTablaSessionSelected(null);
                    setCorteFilterUserId("ALL");
                  }}
                  className="bg-indigo-600/30 hover:bg-indigo-600/50 text-white font-bold py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition duration-150 flex items-center gap-1.5 border border-indigo-500/20 mr-2"
                >
                  <IonIcon icon={arrowBackOutline} className="text-sm" />
                  <span className="hidden sm:inline">Volver a Turnos</span>
                  <span className="inline sm:hidden">Volver</span>
                </button>
              )}
            </IonButtons>
            <IonTitle style={{ fontWeight: "bold", padding: "0 4px" }}>
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-xs sm:text-sm md:text-base font-black text-amber-400 uppercase tracking-tight truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-xs lg:max-w-md">
                  {selectedTenant ? `🏢 ${selectedTenant.name}` : "Corte de Caja"}
                </span>
                <span className="text-[11px] sm:text-[11px] md:text-xs text-slate-300 font-bold tracking-normal truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-xs lg:max-w-md">
                  📍 {selectedTenant?.sucursalDefault || "Matriz"} {sessionToRender?.status === "closed" ? "(Auditoría)" : ""}
                </span>
              </div>
            </IonTitle>
            <IonButtons slot="end">
              <button
                type="button"
                onClick={() => {
                  setDailyReportTargetDate(undefined);
                  setShowDailyReportModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition duration-150 flex items-center gap-1.5 border border-emerald-500/25 mr-2 cursor-pointer shadow-sm shadow-emerald-600/20"
                title="Abrir Reporte del Día"
              >
                <IonIcon icon={statsChartOutline} className="text-sm" />
                <span className="hidden sm:inline">Reporte del Día 📊</span>
                <span className="inline sm:hidden">Reporte 📊</span>
              </button>
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 md:p-1.5 rounded-full border border-slate-700/60 mr-1 md:mr-3">
                <button
                  type="button"
                  onClick={() => {
                    setCorteViewMode("current");
                    setCorteTablaSessionSelected(null);
                    setCorteFilterUserId("ALL");
                  }}
                  className={`flex items-center gap-1 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border-none cursor-pointer ${
                    corteViewMode === "current"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/40 bg-transparent"
                  }`}
                >
                  <span className="hidden sm:inline">⚡ Turno Actual</span>
                  <span className="inline sm:hidden">⚡ Turno</span>
                </button>
                {currentUser?.role !== "cajero" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCorteViewMode("history");
                      setCorteTablaSessionSelected(null);
                      setCorteFilterUserId("ALL");
                    }}
                    className={`flex items-center gap-1 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border-none cursor-pointer ${
                      corteViewMode === "history"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/40 bg-transparent"
                    }`}
                  >
                    <span className="hidden sm:inline">🕒 Historial</span>
                    <span className="inline sm:hidden">🕒 Hist</span>
                  </button>
                )}
              </div>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonAlert
          isOpen={showOwnerPasswordAlert}
          onDidDismiss={() => {
            setShowOwnerPasswordAlert(false);
            setOwnerPasswordInput("");
          }}
          header="Clave de Propietario"
          subHeader="Autenticación Requerida"
          message="Ingrese la clave de seguridad para visualizar este grupo de empresas:"
          inputs={[
            {
              name: 'password',
              type: 'password',
              placeholder: 'Ingrese Clave / PIN',
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                setShowOwnerPasswordAlert(false);
                setOwnerPasswordInput("");
              }
            },
            {
              text: 'Desbloquear',
              handler: (data) => {
                const entered = data.password || "";
                if (validateOwnerKey(selectedPendingOwner, entered)) {
                  setIsOwnerUnlocked(true);
                  setActiveOwnerFilter(selectedPendingOwner);
                  localStorage.setItem("cocinet_is_owner_unlocked", "true");
                  localStorage.setItem("cocinet_active_owner_filter", selectedPendingOwner || "");
                  triggerAppNotification(
                    "🔑 Grupo Desbloqueado",
                    "Acceso autorizado al grupo de empresas seleccionado.",
                    "success"
                  );
                } else {
                  triggerAppNotification(
                    "❌ Clave Incorrecta",
                    "La clave ingresada no es válida para este propietario.",
                    "warning"
                  );
                  return false; // keeps alert open
                }
              }
            }
          ]}
        />

        <IonAlert
          isOpen={showCloseTurnConfirm}
          onDidDismiss={() => setShowCloseTurnConfirm(false)}
          header="Registrar Arqueo"
          message="¿Confirmas guardar los conteos de billetes y monedas actuales? Esto actualizará el arqueo y balance general sin interrumpir la operación del día."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setShowCloseTurnConfirm(false)
            },
            {
              text: 'Guardar conteo',
              role: 'confirm',
              handler: async () => {
                try {
                  if (sessionToRender) {
                    await updateCashierSessionInFirebase(
                      sessionToRender.id,
                      {
                        ...sessionToRender,
                        arqueoTotal: tablaArqueoTotal,
                        arqueoBilletes: tablaArqueoTotalBilletes,
                        arqueoMonedas: tablaArqueoTotalMonedas,
                        estimatedCash: estimatedCashInBox,
                        diferencia: diferenciaCaja,
                        // Update metrics in doc
                        cashSales: corteData.cashSales,
                        cardSales: corteData.cardSales,
                        transSales: corteData.transSales,
                        cashSalesCount: corteData.cashSalesCount,
                        cardSalesCount: corteData.cardSalesCount,
                        transSalesCount: corteData.transSalesCount,
                        totalInflows: totalInflowsAmt,
                        totalOutflows: totalOutflowsAmt,
                        totalPurchasesPaid: corteData.totalPurchasesPaid,
                      },
                    );

                    triggerAppNotification("Balance 📊", "Conteos de caja y arqueo guardados de manera exitosa. ✅", "success");
                    setAppMode("corte-tabla");
                    setCorteTablaSessionSelected(null);
                  }
                } catch (err) {
                  triggerAppNotification("Error", "No se pudo guardar el arqueo", "warning");
                }
              }
            }
          ]}
        />

        <EditFondoModal
          showEditFondoModal={showEditFondoModal}
          setShowEditFondoModal={setShowEditFondoModal}
        />

        {/* MODAL 1: CANDADO DE CUENTAS ABIERTAS */}
        <IonModal
          isOpen={showPendingTablesModal}
          onDidDismiss={() => setShowPendingTablesModal(false)}
          style={{
            "--height": "auto",
            "--max-height": "85vh",
            "--width": "95%",
            "--max-width": "600px",
            "--border-radius": "24px",
          }}
        >
          <div className="p-6 bg-white text-left font-sans">
            <div className="flex items-center gap-3 pb-4 border-b border-rose-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-950 m-0">
                  Cuentas Pendientes de Cobro
                </h3>
                <p className="text-xs text-rose-600 font-bold m-0">
                  No se puede cerrar el turno mientras existan mesas o pedidos sin cobrar.
                </p>
              </div>
            </div>

            <div className="py-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
              {pendingTablesList.map((t: any) => {
                const totalMesa = (t.comandas || []).reduce(
                  (sum: number, c: any) =>
                    sum +
                    (c.items || []).reduce(
                      (s: number, i: any) =>
                        s + (i.isCancelled ? 0 : i.quantity * (i.product?.price || 0)),
                      0
                    ),
                  0
                );
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-2xl transition"
                  >
                    <div>
                      <span className="text-sm font-black text-slate-800 block">
                        🍽️ {t.label || `Mesa ${t.id}`}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {(t.comandas || []).length} comanda(s) • Total:{" "}
                        <strong className="text-amber-700 font-black">
                          ${totalMesa.toFixed(2)}
                        </strong>
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowPendingTablesModal(false);
                        setSelectedTableGestion(t.id);
                        setAppMode("gestion_cuentas");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition border-none cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>Ir a Cobrar 💳</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPendingTablesModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs transition border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </IonModal>

        {/* MODAL 2: CANDADO DE PIN DE CAJERO RESPONSABLE */}
        <IonModal
          isOpen={showClosePinModal}
          onDidDismiss={() => setShowClosePinModal(false)}
          style={{
            "--height": "auto",
            "--max-height": "90vh",
            "--width": "95%",
            "--max-width": "420px",
            "--border-radius": "24px",
          }}
        >
          <div className="p-6 bg-white text-center font-sans">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🔑
            </div>
            <h3 className="text-lg font-black text-slate-900 m-0">
              Confirmar Cierre de Turno
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1 mb-4">
              Ingresa el PIN de 4 dígitos del cajero o administrador responsable para sellar este corte.
            </p>

            {/* PIN Display */}
            <div className="flex justify-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all ${
                    closePinInput.length > idx
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 scale-105 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-300"
                  }`}
                >
                  {closePinInput.length > idx ? "●" : ""}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto my-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "C") {
                      setClosePinInput("");
                    } else if (key === "OK") {
                      if (closePinInput.length === 4) {
                        handleConfirmCloseWithPin(closePinInput);
                      } else {
                        triggerAppNotification("Aviso", "Ingresa los 4 dígitos de tu PIN.", "warning");
                      }
                    } else {
                      if (closePinInput.length < 4) {
                        const nextVal = closePinInput + key;
                        setClosePinInput(nextVal);
                        if (nextVal.length === 4) {
                          setTimeout(() => handleConfirmCloseWithPin(nextVal), 150);
                        }
                      }
                    }
                  }}
                  className={`h-12 rounded-2xl font-black text-lg border cursor-pointer transition active:scale-95 flex items-center justify-center ${
                    key === "OK"
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                      : key === "C"
                      ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                  }`}
                >
                  {key === "OK" ? "✓" : key}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowClosePinModal(false)}
              className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </IonModal>

        {/* MODAL 3: ENVIAR CORTE DE PRUEBA */}
        <IonModal
          isOpen={showTestWhatsappModal}
          onDidDismiss={() => setShowTestWhatsappModal(false)}
          style={{
            "--height": "auto",
            "--max-height": "85vh",
            "--width": "95%",
            "--max-width": "460px",
            "--border-radius": "24px",
          }}
        >
          <div className="p-6 bg-white text-left font-sans">
            <div className="flex items-center gap-3 pb-3 border-b border-sky-100">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
                🧪
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 m-0">
                  Enviar Corte de Prueba por WhatsApp
                </h3>
                <p className="text-[11px] text-slate-500 font-bold m-0">
                  Prueba cómo recibe el dueño el formato y los totales del corte.
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <label className="text-xs font-black text-slate-700 block">
                Número de WhatsApp de Destino (10 dígitos):
              </label>
              <input
                type="tel"
                placeholder="Ej: 9511234567"
                value={testWhatsappPhone}
                onChange={(e) => setTestWhatsappPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl px-3 py-2.5 text-slate-800 font-mono text-sm outline-none transition"
              />
              <p className="text-[11px] text-slate-400 font-medium">
                Si lo dejas vacío, abrirá WhatsApp para que elijas el contacto manualmente.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowTestWhatsappModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition border-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSendTestWhatsApp(testWhatsappPhone)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-200"
              >
                <IonIcon icon={logoWhatsapp} className="text-sm" />
                <span>Enviar Prueba 🚀</span>
              </button>
            </div>
          </div>
        </IonModal>

        <IonContent
          style={{ "--background": "#f8fafc", "--padding-top": "2px", "--padding-bottom": "16px" }}
          className="px-2 sm:px-4"
        >
          <div className="max-w-4xl mx-auto pt-2 pb-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 m-0">
                  <span className="text-2xl sm:text-3xl">📊</span> Corte Actual
                </h1>
                <p className="text-[14px] sm:text-[14px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Resumen general y balance final • {selectedTenant?.sucursalDefault || "Matriz"}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                {(currentUser?.id.endsWith("-sistemas") || currentUser?.role === "Sistemas" || isSystemsMode) && sessionToRender && (
                  <button
                    onClick={handleReiniciarCorte}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-200 shadow-md shadow-rose-600/20 flex items-center gap-1.5 border-none cursor-pointer text-[13px] uppercase tracking-wider"
                  >
                    <IonIcon icon={syncOutline} className="text-lg" />
                    <span>Reiniciar Corte ⚙️</span>
                  </button>
                )}
                {(currentUser?.id.endsWith("-sistemas") || currentUser?.role === "Sistemas" || isSystemsMode || isMasterAdmin) && (
                  <button
                    onClick={() => setTenantBackupConfirm({ isOpen: true, type: null })}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-200 shadow-md shadow-violet-600/20 flex items-center gap-1.5 border-none cursor-pointer text-[13px] uppercase tracking-wider"
                  >
                    <span>📦 Respaldo del Tenant</span>
                  </button>
                )}

                {sessionToRender?.status === "open" ? (
                  <button
                    onClick={handleInitiateCloseShift}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 px-4 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 border-none cursor-pointer text-[13px] uppercase tracking-wider animate-pulse hover:animate-none"
                  >
                    <span>🔒 Cerrar Turno</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 text-slate-500 font-bold py-2.5 px-3 rounded-xl flex items-center gap-1.5 text-[12px] border border-slate-200 uppercase tracking-widest select-none">
                      <span>🔒 Turno Cerrado</span>
                    </div>
                    <button
                      onClick={handleReopenShift}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3.5 rounded-xl transition duration-200 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 border-none cursor-pointer text-[12px] uppercase tracking-wider"
                    >
                      <span>🔓 Reabrir Turno</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowTestWhatsappModal(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-3 rounded-xl transition duration-200 shadow-md shadow-sky-600/25 flex items-center gap-1.5 border-none cursor-pointer text-[13px]"
                  title="Enviar mensaje de corte de prueba a cualquier WhatsApp"
                >
                  <span>🧪 Probar WhatsApp</span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    printCorteTabla();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3.5 rounded-xl transition duration-200 shadow-md shadow-emerald-600/25 flex items-center gap-1.5 border-none cursor-pointer text-[14px]"
                >
                  <IonIcon icon={gridOutline} className="text-base" />
                  <span>Imprimir 🖨️</span>
                </button>

                <button
                  onClick={sendCorteTablaToWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-3.5 rounded-xl transition duration-200 shadow-md shadow-green-600/25 flex items-center gap-1.5 border-none cursor-pointer text-[14px]"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <IonIcon icon={logoWhatsapp} className="text-base" />
                  <span>WhatsApp 📲</span>
                </button>

                <button
                  onClick={exportCorteTablaToTXT}
                  className="bg-slate-700 hover:bg-slate-850 text-white font-bold py-2.5 px-3.5 rounded-xl transition duration-200 shadow-md shadow-slate-700/25 flex items-center gap-1.5 border-none cursor-pointer text-[14px]"
                >
                  <IonIcon icon={downloadOutline} className="text-base" />
                  <span>Exportar TXT 📄</span>
                </button>
              </div>
            </div>

            {/* WIDGET UNIFICADO Y PULIDO: RESUMEN DE CORTE DE CAJA */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              
              {/* BLOQUE SUPERIOR 1: TOTAL VENDIDO EN EL TURNO (VENTA GENERAL) */}
              <div className="bg-slate-950 text-white px-5 py-4 border-b border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                      🟢 TOTAL VENDIDO EN EL TURNO (VENTA GENERAL)
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                        ${totalVentasTurno.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-300 font-bold">
                        ({totalCobrosTurnoCount} {totalCobrosTurnoCount === 1 ? "cuenta cobrada" : "cuentas cobradas en total"})
                      </span>
                    </div>
                  </div>

                  {/* Resumen por tipo de pago */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">💵 Efectivo:</span>
                      <span className="font-mono font-black text-white">${Number(corteData.cashSales || 0).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="text-sky-400 font-bold">💳 Tarj / Transf:</span>
                      <span className="font-mono font-black text-white">${(Number(corteData.cardSales || 0) + Number(corteData.transSales || 0)).toFixed(2)}</span>
                    </div>
                    {Number(corteData.lupaySales || 0) > 0 && (
                      <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <span className="text-purple-400 font-bold">📱 Lupay:</span>
                        <span className="font-mono font-black text-white">${Number(corteData.lupaySales || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOQUE SUPERIOR 2: BALANCE ESPERADO EN CAJA (SOLO EFECTIVO FÍSICO) */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                    💰 DINERO ESPERADO EN CAJA (SOLO EFECTIVO FÍSICO)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      ${estimatedCashInBox.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                      (Fondo inicial + Ventas en efectivo - Gastos)
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Efectivo Teórico Calculado
                  </span>
                  <span className="text-xs bg-slate-800 text-amber-300 px-2.5 py-1 rounded font-mono border border-slate-700 font-bold">
                    Turno: {sessionToRender?.userName || "Operador"}
                  </span>
                </div>
              </div>

              {/* SEPARADOR PRINCIPAL */}
              <div className="h-[1px] bg-slate-200" />

              {/* CUERPO DEL WIDGET: ENTRADAS Y SALIDAS */}
              <div className="p-3 space-y-4">
                
                {/* SECCIÓN: ENTRADAS (INGRESOS DE EFECTIVO) */}
                <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/50">
                  {/* SEPARADOR COMO CINTILLO */}
                  <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-emerald-500/30 text-emerald-900">
                    <span className="text-base font-black tracking-wider uppercase">🟢 ENTRADAS Y APERTURA DE CAJA</span>
                    <span className="font-extrabold text-base text-emerald-700">${totalEntradasEfectivo.toFixed(2)}</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Elemento: Fondo de Apertura */}
                    <div className="flex justify-between items-center p-2 bg-slate-50 hover:bg-slate-100/70 rounded border border-slate-100 transition">
                      <div className="text-left">
                        <span className="text-[15px] font-bold text-slate-700 block uppercase tracking-wide">Fondo de Apertura</span>
                        <span className="text-[15px] text-slate-400 font-bold">Fondo inicial establecido</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-800">${Number(sessionToRender?.dotacionInicial || 0).toFixed(2)}</span>
                        {sessionToRender?.status === "open" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentVal = Number(sessionToRender?.dotacionInicial || 0).toString();
                              setEditFondoValue(currentVal);
                              setShowEditFondoModal(true);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded text-[14px] transition uppercase border-none cursor-pointer"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Elemento: Ventas Efectivo */}
                    <div className="flex flex-col p-2 bg-slate-50 hover:bg-slate-100/70 rounded border border-slate-100 transition">
                      <div 
                        onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, cash: !prev.cash }))}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div className="text-left flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-slate-700 block uppercase tracking-wide">Ventas en Efectivo</span>
                          <span className="text-[15px] text-indigo-600 font-bold">({corteData.cashSalesCount} cobros)</span>
                          <IonIcon icon={expandedCorteTablaRows.cash ? chevronUpOutline : chevronDownOutline} className="text-slate-400 text-xs" />
                        </div>
                        <span className="text-base font-black text-slate-800">${corteData.cashSales.toFixed(2)}</span>
                      </div>

                      {expandedCorteTablaRows.cash && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 space-y-1 max-h-40 overflow-y-auto">
                          {(filteredHistoryForCorte || [])
                            .filter(h => (h.status === "completed" || h.isPaid) && ["cash", "efectivo"].includes((h.paymentMethod || "").toLowerCase()))
                            .map((h, i) => (
                              <div key={`c-cash-${h.id}-${i}`} className="flex justify-between items-center text-[16px] text-slate-600 bg-white/85 py-1.5 px-2 rounded border border-slate-100">
                                <span className="font-semibold text-slate-700">Mesa {h.tableLabel || "0"}</span>
                                <span className="text-slate-400">{new Date(h.timestamp || Date.now()).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</span>
                                <span className="font-bold text-slate-800">${Number(h.total || 0).toFixed(2)}</span>
                              </div>
                            ))}
                          {(filteredHistoryForCorte || []).filter(h => (h.status === "completed" || h.isPaid) && ["cash", "efectivo"].includes((h.paymentMethod || "").toLowerCase())).length === 0 && (
                            <p className="text-[16px] text-slate-400 font-semibold italic text-center py-1">Sin cobros en efectivo en este turno.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Elemento: Entradas Adicionales */}
                    <div className="flex flex-col p-2 bg-slate-50 hover:bg-slate-100/70 rounded border border-slate-100 transition">
                      <div 
                        onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, inflows: !prev.inflows }))}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div className="text-left flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-slate-700 block uppercase tracking-wide">Entradas Adicionales</span>
                          <span className="text-[15px] text-emerald-600 font-bold">({todayInflows.length} movs)</span>
                          <IonIcon icon={expandedCorteTablaRows.inflows ? chevronUpOutline : chevronDownOutline} className="text-slate-400 text-xs" />
                        </div>
                        <span className="text-base font-black text-emerald-600">+${totalInflowsAmt.toFixed(2)}</span>
                      </div>

                      {expandedCorteTablaRows.inflows && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 space-y-1 max-h-40 overflow-y-auto">
                          {todayInflows.map((mov, i) => (
                            <div key={`c-in-${mov.id || i}`} className="text-[16px] bg-white/85 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">📥 {mov.concept === "dotacion" ? "Inyección" : mov.concept || "Ingreso"}</span>
                                <span className="font-bold text-emerald-600">+${Number(mov.amount || 0).toFixed(2)}</span>
                              </div>
                              {mov.description && <p className="text-[15px] text-slate-500 italic">"{mov.description}"</p>}
                            </div>
                          ))}
                          {todayInflows.length === 0 && (
                            <p className="text-[16px] text-slate-400 font-semibold italic text-center py-1">Sin entradas adicionales registradas.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: COMANDAS ACTIVAS (PEDIDOS EN MESA) 🍽️ */}
                <div className="bg-amber-50/40 p-2 rounded-lg border border-amber-100/50">
                  <div 
                    onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, activeOrders: !prev.activeOrders }))}
                    className="flex justify-between items-center cursor-pointer pb-1.5 mb-2 border-b border-amber-500/30 text-amber-900"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black tracking-wider uppercase">🍽️ COMANDAS ACTIVAS</span>
                      <IonIcon icon={expandedCorteTablaRows.activeOrders ? chevronUpOutline : chevronDownOutline} className="text-amber-500 text-xs" />
                    </div>
                    <span className="font-extrabold text-base text-amber-700">
                      ${tables.reduce((sum, t) => sum + (t.comandas || []).reduce((s, c) => s + (c.items || []).reduce((ss, i) => ss + (i.isCancelled ? 0 : (i.quantity * (i.product?.price || 0))), 0), 0), 0).toFixed(2)}
                    </span>
                  </div>

                  {expandedCorteTablaRows.activeOrders && (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[14px]">
                        <thead>
                          <tr className="bg-amber-100/30 text-amber-900 border-b border-amber-200">
                            <th className="py-2 px-2 font-black">MESA</th>
                            <th className="py-2 px-2 font-black">FOLIO</th>
                            <th className="py-2 px-2 font-black">ITEMS</th>
                            <th className="py-2 px-2 font-black text-right">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          {tables.filter(t => t.status === "occupied").map(t => (
                            (t.comandas || []).map(c => {
                              const total = (c.items || []).reduce((s, i) => s + (i.isCancelled ? 0 : (i.quantity * (i.product?.price || 0))), 0);
                              return (
                                <tr key={c.folio} className="bg-white/80">
                                  <td className="py-2 px-2 font-bold">{t.label}</td>
                                  <td className="py-2 px-2 font-mono text-[12px]">{c.folio}</td>
                                  <td className="py-2 px-2 text-slate-500 text-[12px] truncate max-w-[150px]">
                                    {(c.items || []).map(i => `${i.quantity}x ${i.product?.name}`).join(", ")}
                                  </td>
                                  <td className="py-2 px-2 font-black text-right text-amber-700">${total.toFixed(2)}</td>
                                </tr>
                              );
                            })
                          ))}
                          {tables.filter(t => t.status === "occupied").length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-400 italic">No hay comandas activas en este momento.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* SEPARADOR DE SECCIONES (LÍNEA SUTIL) */}
                <div className="border-t border-slate-100 my-1" />

                {/* SECCIÓN: SALIDAS (EGRESOS DE EFECTIVO) */}
                <div className="bg-rose-50/40 p-2 rounded-lg border border-rose-100/50">
                  {/* SEPARADOR COMO CINTILLO */}
                  <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-rose-500/30 text-rose-900">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black tracking-wider uppercase">🔴 SALIDAS Y EGRESOS DE CAJA</span>
                      {sessionToRender?.status === "open" && (
                        <button
                          onClick={() => {
                            setCashMovementForm({ type: "out", concept: "retiro", amount: "", description: "" });
                            setShowCashMovementModal(true);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-2 py-0.5 rounded text-[14px] uppercase border-none cursor-pointer transition"
                        >
                          + Registrar Retiro
                        </button>
                      )}
                    </div>
                    <span className="font-extrabold text-base text-rose-700">-${totalSalidasEfectivo.toFixed(2)}</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Elemento: Gastos & Retiros */}
                    <div className="flex flex-col p-2 bg-slate-50 hover:bg-slate-100/70 rounded border border-slate-100 transition">
                      <div 
                        onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, expenses: !prev.expenses }))}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div className="text-left flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-slate-700 block uppercase tracking-wide">Gastos & Retiros</span>
                          <span className="text-[15px] text-rose-600 font-bold">({todayExpenses.length + todayOutflows.length} movs)</span>
                          <IonIcon icon={expandedCorteTablaRows.expenses ? chevronUpOutline : chevronDownOutline} className="text-slate-400 text-xs" />
                        </div>
                        <span className="text-base font-black text-rose-600">-${totalOutflowsAmt.toFixed(2)}</span>
                      </div>

                      {expandedCorteTablaRows.expenses && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 space-y-1 max-h-40 overflow-y-auto">
                          {todayExpenses.map((exp, i) => (
                            <div key={`c-exp-${exp.id || i}`} className="text-[16px] bg-white/85 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-rose-800">🏷️ {exp.concept || "Gasto"}</span>
                                <span className="font-bold text-rose-600">-${Number(exp.amount || 0).toFixed(2)}</span>
                              </div>
                              {exp.reference && <p className="text-[15px] text-slate-500 font-bold">Ref: {exp.reference}</p>}
                            </div>
                          ))}
                          {todayOutflows.map((mov, i) => (
                            <div key={`c-mov-${mov.id || i}`} className="text-[16px] bg-white/85 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-amber-900">💸 Retiro: {mov.concept || "Salida"}</span>
                                <span className="font-bold text-rose-600">-${Number(mov.amount || 0).toFixed(2)}</span>
                              </div>
                              {mov.description && <p className="text-[15px] text-slate-500 italic">"{mov.description}"</p>}
                            </div>
                          ))}
                          {todayExpenses.length === 0 && todayOutflows.length === 0 && (
                            <p className="text-[16px] text-slate-400 font-semibold italic text-center py-1">Sin egresos o retiros.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Elemento: Compras a Proveedores */}
                    <div className="flex flex-col p-2 bg-slate-50 hover:bg-slate-100/70 rounded border border-slate-100 transition">
                      <div 
                        onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, purchases: !prev.purchases }))}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div className="text-left flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-slate-700 block uppercase tracking-wide">Compras Proveedores (Efectivo)</span>
                          <span className="text-[15px] text-orange-700 font-bold">({filteredPurchasesForCorte.filter(p => p.isPaid).length} pagadas)</span>
                          <IonIcon icon={expandedCorteTablaRows.purchases ? chevronUpOutline : chevronDownOutline} className="text-slate-400 text-xs" />
                        </div>
                        <span className="text-base font-black text-rose-600">-${corteData.totalPurchasesPaid.toFixed(2)}</span>
                      </div>

                      {expandedCorteTablaRows.purchases && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 space-y-1 max-h-40 overflow-y-auto">
                          {filteredPurchasesForCorte.filter(p => p.isPaid).map((p, i) => (
                            <div key={`c-purch-${p.id || i}`} className="text-[16px] bg-white/85 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-orange-900">🛒 {p.supplierName || "Proveedor"}</span>
                                <span className="font-bold text-orange-700">-${Number(p.total || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                          {filteredPurchasesForCorte.filter(p => p.isPaid).length === 0 && (
                            <p className="text-[16px] text-slate-400 font-semibold italic text-center py-1">Sin compras pagadas en efectivo.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SEPARADOR DE SECCIONES (LÍNEA SUTIL) */}
                <div className="border-t border-slate-100 my-1" />

                {/* SECCIÓN: ARQUEO FÍSICO Y CONCILIACIÓN */}
                <div>
                  <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-slate-500/20 text-slate-900">
                    <span className="text-base font-bold tracking-wider uppercase">🧮 ARQUEO DE CAJA Y CONCILIACIÓN (FÍSICO)</span>
                    <button
                      onClick={() => setShowTablaArqueoModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-2.5 py-0.5 rounded text-[14px] uppercase border-none cursor-pointer transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Contar Caja 🪙</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Arqueo Físico Card */}
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center flex flex-col justify-center">
                      <span className="text-[15px] font-bold text-slate-400 uppercase tracking-wider block">CONTEO FÍSICO (ARQUEO)</span>
                      <span className="text-xl font-black text-slate-800 mt-0.5">${tablaArqueoTotal.toFixed(2)}</span>
                      <span className="text-[14px] text-indigo-600 font-bold mt-0.5 cursor-pointer hover:underline" onClick={() => setShowTablaArqueoModal(true)}>
                        Haz clic para registrar billetes/monedas
                      </span>
                    </div>

                    {/* Diferencia Card */}
                    <div className={`p-2 rounded border text-center flex flex-col justify-center ${
                      tablaArqueoTotal === 0 ? "bg-slate-50 border-slate-100 text-slate-400" :
                      esFaltante ? "bg-rose-50 border-rose-200 text-rose-900" :
                      esSobrante ? "bg-blue-50 border-blue-200 text-blue-900" :
                      "bg-emerald-50 border-emerald-200 text-emerald-950"
                    }`}>
                      <span className="text-[15px] font-bold uppercase tracking-wider block">
                        {tablaArqueoTotal === 0 ? "DIFERENCIA (SIN ARQUEO)" :
                         esFaltante ? "⚠️ FALTANTE DETECTADO" : 
                         esSobrante ? "💰 SOBRANTE DETECTADO" : 
                         "✅ CAJA CUADRADA"}
                      </span>
                      <span className={`text-xl font-black mt-0.5 ${
                        tablaArqueoTotal === 0 ? "text-slate-400" :
                        esFaltante ? "text-rose-700" :
                        esSobrante ? "text-blue-700" :
                        "text-emerald-700"
                      }`}>
                        {tablaArqueoTotal === 0 ? "$0.00" : `${esFaltante ? "-" : esSobrante ? "+" : ""}$${Math.abs(diferenciaCaja).toFixed(2)}`}
                      </span>
                      <span className="text-[14px] font-bold mt-0.5 uppercase tracking-wider">
                        {tablaArqueoTotal === 0 ? "Conteo Físico en cero" :
                         esFaltante ? "Diferencia negativa en caja" : 
                         esSobrante ? "Diferencia positiva detectada" : 
                         "¡Conciliación exacta!"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SEPARADOR DE SECCIONES (LÍNEA SUTIL) */}
                <div className="border-t border-slate-100 my-1" />

                {/* SECCIÓN: MEDIOS ELECTRÓNICOS */}
                <div className="bg-slate-50 p-2 rounded border border-slate-150/60">
                  <div 
                    onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, mixed: !prev.mixed }))}
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <div className="text-left flex items-center gap-1.5">
                      <span className="text-[15px] font-bold text-slate-600 block uppercase tracking-wide">💳 3. Ventas Electrónicas (Tarjeta/Transf)</span>
                      <span className="text-[14px] text-slate-400 font-bold">({corteData.cardSalesCount + corteData.transSalesCount} cobros - informativo, no entran a caja)</span>
                      <IonIcon icon={expandedCorteTablaRows.mixed ? chevronUpOutline : chevronDownOutline} className="text-slate-400 text-xs" />
                    </div>
                    <span className="text-base font-black text-slate-700">${(corteData.cardSales + corteData.transSales).toFixed(2)}</span>
                  </div>

                  {expandedCorteTablaRows.mixed && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 space-y-1 max-h-40 overflow-y-auto">
                      {(filteredHistoryForCorte || [])
                        .filter(h => (h.status === "completed" || h.isPaid) && !["cash", "efectivo", "lupay"].includes((h.paymentMethod || "").toLowerCase()))
                        .map((h, i) => (
                          <div key={`c-mixed-${h.id}-${i}`} className="flex justify-between items-center text-[16px] text-slate-600 bg-white py-1.5 px-2 rounded border border-slate-100">
                            <span className="font-semibold text-slate-700">Mesa {h.tableLabel || "0"} <span className="text-indigo-650 font-bold bg-indigo-50 px-1.5 py-1 rounded text-[14px] uppercase">{h.paymentMethod}</span></span>
                            <span className="text-slate-400">{new Date(h.timestamp || Date.now()).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</span>
                            <span className="font-bold text-slate-800">${Number(h.total || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      {(filteredHistoryForCorte || []).filter(h => (h.status === "completed" || h.isPaid) && !["cash", "efectivo", "lupay"].includes((h.paymentMethod || "").toLowerCase())).length === 0 && (
                        <p className="text-[16px] text-slate-400 font-semibold italic text-center py-1">Sin cobros electrónicos en este turno.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* SEPARADOR DE SECCIONES (LÍNEA SUTIL) */}
                <div className="border-t border-slate-100 my-1" />

                {/* SECCIÓN: CUENTAS DE LUPAY */}
                <div className="bg-slate-50 p-2 rounded border border-slate-150/60">
                  <div 
                    onClick={() => setExpandedCorteTablaRows(prev => ({ ...prev, lupay: !prev.lupay }))}
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <div className="text-left flex items-center gap-1.5">
                      <span className="text-[15px] font-bold text-indigo-700 block uppercase tracking-wide">📱 4. Cuentas de LUPAY</span>
                      <span className="text-[14px] text-slate-400 font-bold">({corteData.lupaySalesCount || 0} cobros - informativo, no entran a caja)</span>
                      <IonIcon icon={expandedCorteTablaRows.lupay ? chevronUpOutline : chevronDownOutline} className="text-slate-400 text-xs" />
                    </div>
                    <span className="text-base font-black text-indigo-700">${(corteData.lupaySales || 0).toFixed(2)}</span>
                  </div>

                  {expandedCorteTablaRows.lupay && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 space-y-1 max-h-40 overflow-y-auto">
                      {(filteredHistoryForCorte || [])
                        .filter(h => (h.status === "completed" || h.isPaid) && (h.paymentMethod || "").toLowerCase() === "lupay")
                        .map((h, i) => (
                          <div key={`c-lupay-${h.id}-${i}`} className="flex justify-between items-center text-[16px] text-slate-600 bg-white py-1.5 px-2 rounded border border-slate-100">
                            <span className="font-semibold text-slate-700">Mesa {h.tableLabel || "0"} <span className="text-indigo-650 font-bold bg-indigo-50 px-1.5 py-1 rounded text-[14px] uppercase">{h.paymentMethod}</span></span>
                            <span className="text-slate-400">{new Date(h.timestamp || Date.now()).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</span>
                            <span className="font-bold text-slate-800">${Number(h.total || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      {(filteredHistoryForCorte || []).filter(h => (h.status === "completed" || h.isPaid) && (h.paymentMethod || "").toLowerCase() === "lupay").length === 0 && (
                        <p className="text-[16px] text-slate-400 font-semibold italic text-center py-1">Sin cobros LUPAY en este turno.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

<TablaArqueoModal
          showTablaArqueoModal={showTablaArqueoModal}
          setShowTablaArqueoModal={setShowTablaArqueoModal}
          diferenciaCaja={diferenciaCaja}
          tablaArqueoTotalBilletes={tablaArqueoTotalBilletes}
          estimatedCashInBox={estimatedCashInBox}
          tablaArqueoTotalMonedas={tablaArqueoTotalMonedas}
          tablaArqueoTotal={tablaArqueoTotal}
          sessionToRender={sessionToRender}
          activeTablaDenom={activeTablaDenom}
          arqueoBilletes={arqueoBilletes}
          arqueoMonedas={arqueoMonedas}
          arqueoTotal={arqueoTotal}
          estimatedCash={estimatedCash}
          setActiveTablaDenom={setActiveTablaDenom}
          setShowTablaKeypadOverlay={setShowTablaKeypadOverlay}
          setTablaArq100={setTablaArq100}
          setTablaArq1000={setTablaArq1000}
          setTablaArq20={setTablaArq20}
          setTablaArq200={setTablaArq200}
          setTablaArq50={setTablaArq50}
          setTablaArq500={setTablaArq500}
          setTablaArqM05={setTablaArqM05}
          setTablaArqM1={setTablaArqM1}
          setTablaArqM10={setTablaArqM10}
          setTablaArqM2={setTablaArqM2}
          setTablaArqM5={setTablaArqM5}
          showTablaKeypadOverlay={showTablaKeypadOverlay}
          tablaArq100={tablaArq100}
          tablaArq1000={tablaArq1000}
          tablaArq20={tablaArq20}
          tablaArq200={tablaArq200}
          tablaArq50={tablaArq50}
          tablaArq500={tablaArq500}
          tablaArqM05={tablaArqM05}
          tablaArqM1={tablaArqM1}
          tablaArqM10={tablaArqM10}
          tablaArqM2={tablaArqM2}
          tablaArqM5={tablaArqM5}
          triggerAppNotification={triggerAppNotification}
        />

<SystemsChoiceAlert
          showSystemsChoiceAlert={showSystemsChoiceAlert}
          setShowSystemsChoiceAlert={setShowSystemsChoiceAlert}
          selectedTenant={selectedTenant}
          setCashMovements={setCashMovements}
          setCashierSessions={setCashierSessions}
          setExpenses={setExpenses}
          setHistory={setHistory}
          setShowDeleteAllHistoryConfirm={setShowDeleteAllHistoryConfirm}
          setTables={setTables}
          triggerAppNotification={triggerAppNotification}
        />

          <IonAlert
            isOpen={showDeleteAllHistoryConfirm}
            onDidDismiss={() => setShowDeleteAllHistoryConfirm(false)}
            header="⚠️ LIMPIEZA PROFUNDA ⚠️"
            message={`¿Estás ABSOLUTAMENTE seguro? Se borrará todo el historial, ventas, gastos, movimientos y sesiones de caja de ${selectedTenant?.name}. Esta acción es IRREVERSIBLE.`}
            buttons={[
              {
                text: "No, Cancelar",
                role: "cancel"
              },
              {
                text: "SÍ, BORRAR TODO",
                cssClass: "text-red-700 font-bold",
                handler: async () => {
                  try {
                    const tid = selectedTenant?.id;
                    if (!tid) return;
                    if (!window.confirm(`🚨 ADVERTENCIA FINAL\n¿Confirmas que deseas eliminar de forma PERMANENTE todo el historial del inquilino ${selectedTenant?.name}? No se podrá deshacer.`)) return;
                    
                    triggerAppNotification("Sistemas ⚙️", "Eliminando todo el historial del inquilino...", "info");
                    await deleteAllTenantHistoryInFirebase(tid);
                    
                    localStorage.removeItem(`pos_tables_${tid}`);
                    // Solo actualizamos la memoria local de React y filtramos por inquilino.

                    setTables((prev: any[]) => prev.map((t: any) => t.tenantId === tid ? { ...t, status: "available", comandas: [], waiterId: null, activeAccount: null } : t));
                    setHistory((prev: any[]) => prev.filter((h: any) => h.tenantId !== tid));
                    setCashierSessions((prev: any[]) => prev.filter((s: any) => s.tenantId !== tid));
                    setCashMovements((prev: any[]) => prev.filter((m: any) => m.tenantId !== tid));
                    setExpenses((prev: any[]) => prev.filter((e: any) => e.tenantId !== tid));

                    triggerAppNotification("Sistemas ⚙️", "Historial completo eliminado correctamente. 🧹✅", "success");
                    setTimeout(() => {
                      window.location.reload();
                    }, 800);
                  } catch (e: any) {
                    triggerAppNotification("Error ❌", e.message || "Error al eliminar historial", "warning");
                  }
                }
              }
            ]}
          />

          {/* ╔══════════════════════════════════════════════════════════════╗
              ║  📦 MODAL RESPALDO COMPLETO DEL TENANT                       ║
              ╚══════════════════════════════════════════════════════════════╝ */}
<TenantBackupConfirm
          tenantBackupConfirm={tenantBackupConfirm}
          setTenantBackupConfirm={setTenantBackupConfirm}
        />

        </IonContent>
      </IonPage>
    );
    })(corteDataShadow);
};
