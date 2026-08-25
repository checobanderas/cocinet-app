import { PrintPreviewModal } from '../modals/PrintPreviewModal';
import { SupplierPurchaseModal } from '../modals/SupplierPurchaseModal';
import { GastoRegisterModal } from '../modals/GastoRegisterModal';
import { ArqueoFormModal } from '../modals/ArqueoFormModal';
import { addArqueoToFirebase, addCashMovementToFirebase, getMexicoISOString } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackOutline, cloudDoneOutline, menuOutline, refreshOutline } from 'ionicons/icons';

interface DashboardViewProps {
  printPreviewContent: any;
  arq100: any;
  arq1000: any;
  arq20: any;
  arq200: any;
  arq50: any;
  arq500: any;
  arqM05: any;
  arqM1: any;
  arqM10: any;
  arqM2: any;
  arqM5: any;
  arqueosHistory: any;
  cashierSessions: any;
  corteFilterUserId: any;
  corteNuevoAmount: any;
  corteNuevoConcept: any;
  corteNuevoDescription: any;
  corteNuevoType: any;
  currentUser: any;
  guidedAmount: any;
  guidedConcept: any;
  guidedDescription: any;
  guidedFlowStep: any;
  guidedSelectedSupplier: any;
  guidedSelectedUser: any;
  guidedType: any;
  history: any;
  setAppMode: any;
  setArq100: any;
  setArq1000: any;
  setArq20: any;
  setArq200: any;
  setArq50: any;
  setArq500: any;
  setArqM05: any;
  setArqM1: any;
  setArqM10: any;
  setArqM2: any;
  setArqM5: any;
  setCorteFilterUserId: any;
  setCorteNuevoAmount: any;
  setCorteNuevoConcept: any;
  setCorteNuevoDescription: any;
  setGastoCategory: any;
  setGastoDescription: any;
  setGastoItems: any;
  setGuidedAmount: any;
  setGuidedConcept: any;
  setGuidedDescription: any;
  setGuidedFlowStep: any;
  setGuidedSelectedSupplier: any;
  setGuidedSelectedUser: any;
  setGuidedType: any;
  setSelectedScheduleSupplier: any;
  setShowArqueoFormModal: any;
  setShowGastoRegisterModal: any;
  setShowPrintPreviewModal: any;
  setShowSidebar: any;
  setShowSupplierPurchaseModal: any;
  setSupplierPurchaseIsPaid: any;
  setSupplierPurchaseItems: any;
  showArqueoFormModal: any;
  showGastoRegisterModal: any;
  showPrintPreviewModal: any;
  showSupplierPurchaseModal: any;
  suppliers: any;
  syncStatus: any;
  triggerAppNotification: any;
  users: any;
  nullconstrenderCorteNuevo: any;
  corteData: any;
  filteredCashMovementsForCorte: any;
  filteredExpensesForCorte: any;
  sessionId: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  arq100,
  arq1000,
  arq20,
  arq200,
  arq50,
  arq500,
  arqM05,
  arqM1,
  arqM10,
  arqM2,
  arqM5,
  arqueosHistory,
  cashierSessions,
  corteFilterUserId,
  corteNuevoAmount,
  corteNuevoConcept,
  corteNuevoDescription,
  corteNuevoType,
  currentUser,
  guidedAmount,
  guidedConcept,
  guidedDescription,
  guidedFlowStep,
  guidedSelectedSupplier,
  guidedSelectedUser,
  guidedType,
  history,
  nullconstrenderCorteNuevo,
  setAppMode,
  setArq100,
  setArq1000,
  setArq20,
  setArq200,
  setArq50,
  setArq500,
  setArqM05,
  setArqM1,
  setArqM10,
  setArqM2,
  setArqM5,
  setCorteFilterUserId,
  setCorteNuevoAmount,
  setCorteNuevoConcept,
  setCorteNuevoDescription,
  setGastoCategory,
  setGastoDescription,
  setGastoItems,
  setGuidedAmount,
  setGuidedConcept,
  setGuidedDescription,
  setGuidedFlowStep,
  setGuidedSelectedSupplier,
  setGuidedSelectedUser,
  setGuidedType,
  setSelectedScheduleSupplier,
  setShowArqueoFormModal,
  setShowGastoRegisterModal,
  setShowPrintPreviewModal,
  setShowSidebar,
  setShowSupplierPurchaseModal,
  setSupplierPurchaseIsPaid,
  setSupplierPurchaseItems,
  showArqueoFormModal,
  showGastoRegisterModal,
  showPrintPreviewModal,
  showSupplierPurchaseModal,
  suppliers,
  syncStatus,
  triggerAppNotification,
  users,
  corteData, filteredCashMovementsForCorte, filteredExpensesForCorte, sessionId,
  printPreviewContent
}) => {
if (currentUser?.role === "mesero") {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
              <IonButtons slot="start">
                <IonButton onClick={() => setAppMode("floorplan")}>
                  <IonIcon icon={arrowBackOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
              <IonTitle style={{ fontWeight: "bold" }}>Acceso Restringido 🔒</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="max-w-md mx-auto my-12 text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl shadow-inner mb-2">
                🔒
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Corte Especial Restringido</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tu usuario cuenta con el rol de <strong>Mesero</strong>. Los meseros únicamente tienen autorización para tomar comandas y pedidos, y no pueden realizar cortes ni arqueos de caja 📊.
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

    const todayOutflows = (filteredCashMovementsForCorte || []).filter(
      (mov) => mov.type === "out",
    );
    const todayInflows = (filteredCashMovementsForCorte || []).filter(
      (mov) => mov.type === "in",
    );
    const todayExpenses = (filteredExpensesForCorte || []).filter(
      (exp) => !!exp.createdAt,
    );

    const totalOutflowsAmt =
      todayOutflows.reduce((sum, mov) => sum + Number(mov.amount || 0), 0) +
      todayExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    const totalInflowsAmt = todayInflows.reduce((sum, mov) => sum + Number(mov.amount || 0), 0);

    const theoreticalBalance =
      corteData.cashSales +
      totalInflowsAmt -
      totalOutflowsAmt -
      corteData.totalPurchasesPaid;

    // Calculate current live physical total
    const billsTotal =
      Number(arq1000) * 1000 +
      Number(arq500) * 500 +
      Number(arq200) * 200 +
      Number(arq100) * 100 +
      Number(arq50) * 50 +
      Number(arq20) * 20;

    const coinsTotal =
      Number(arqM10) * 10 +
      Number(arqM5) * 5 +
      Number(arqM2) * 2 +
      Number(arqM1) * 1 +
      Number(arqM05) * 0.5;

    const instantPhysicalTotal = billsTotal + coinsTotal;
    const instantDifference = instantPhysicalTotal - theoreticalBalance;

    const handleGuidedSubmit = async () => {
      if (!guidedAmount) {
        triggerAppNotification(
          "⚠️ Error de Monto",
          "Por favor indica un monto válido de dinero",
          "warning",
        );
        return;
      }
      const parsedAmt = parseFloat(guidedAmount);
      if (isNaN(parsedAmt) || parsedAmt <= 0) {
        triggerAppNotification(
          "⚠️ Error de Monto",
          "El monto de la caja debe ser un número mayor a cero",
          "warning",
        );
        return;
      }

      let finalConcept = guidedConcept;
      let finalDescription = guidedDescription;

      if (guidedConcept === "nomina") {
        finalDescription =
          `Nómina pagada a: ${guidedSelectedUser || "Personal"}. ${guidedDescription}`.trim();
      } else if (guidedConcept === "pago_proveedor") {
        finalDescription =
          `Pago de proveedor: ${guidedSelectedSupplier || "General"}. ${guidedDescription}`.trim();
      } else if (guidedConcept === "dotacion") {
        finalDescription =
          `Dotación / Fondo de caja. ${guidedDescription}`.trim();
      } else if (guidedConcept === "venta_extra") {
        finalDescription =
          `Venta extra en efectivo manual. ${guidedDescription}`.trim();
      } else if (guidedConcept === "gasto") {
        finalDescription = `Gasto de tiendita. ${guidedDescription}`.trim();
      } else if (guidedConcept === "retiro") {
        finalDescription =
          `Blindaje / Retiro parcial de caja. ${guidedDescription}`.trim();
      } else if (!finalDescription) {
        finalDescription = `Movimiento de ${guidedType === "in" ? "entrada" : "salida"} por ${guidedConcept}`;
      }

      try {
        await addCashMovementToFirebase({
          type: guidedType,
          concept: finalConcept,
          amount: parsedAmt,
          description: finalDescription,
          user: currentUser?.name || "Admin",
          userId: currentUser?.id,
          date: getMexicoISOString(),
          sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
        });

        triggerAppNotification(
          `🟢 Registro Guardado en Tiempo Real`,
          `Se registró un flujo de ${guidedType === "in" ? "Entrada" : "Salida"} de $${parsedAmt.toFixed(2)}.`,
          "success",
        );

        setGuidedAmount("");
        setGuidedDescription("");
        setGuidedSelectedUser("");
        setGuidedSelectedSupplier("");
        setGuidedFlowStep("init");
      } catch (error) {
        console.error("Error adding guided cash movement:", error);
        triggerAppNotification(
          "⚠️ Error",
          "No se pudo registrar en la base de datos real-time",
          "warning",
        );
      }
    };

    const handleAddCorteNuevoMovement = async () => {
      if (!corteNuevoAmount) {
        triggerAppNotification(
          "⚠️ Error de Monto",
          "Por favor ingresa un monto válido",
          "warning",
        );
        return;
      }
      const parsedAmt = parseFloat(corteNuevoAmount);
      if (isNaN(parsedAmt) || parsedAmt <= 0) {
        triggerAppNotification(
          "⚠️ Error de Monto",
          "El monto de la caja debe ser un número mayor a cero",
          "warning",
        );
        return;
      }

      try {
        await addCashMovementToFirebase({
          type: corteNuevoType,
          concept: corteNuevoConcept,
          amount: parsedAmt,
          description:
            corteNuevoDescription ||
            `Movimiento de ${corteNuevoType === "in" ? "entrada" : "salida"}`,
          user: currentUser?.name || "Admin",
          userId: currentUser?.id,
          date: getMexicoISOString(),
          sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
        });

        triggerAppNotification(
          `📈 Movimiento de Caja registrado`,
          `Se registró una ${corteNuevoType === "in" ? "Entrada" : "Salida"} de $${parsedAmt.toFixed(2)} por: ${corteNuevoConcept.toUpperCase()}.`,
          "success",
        );

        setCorteNuevoAmount("");
        setCorteNuevoDescription("");
        setCorteNuevoConcept(corteNuevoType === "in" ? "dotacion" : "retiro");
      } catch (error) {
        console.error("Error adding cash movement:", error);
        triggerAppNotification(
          "⚠️ Error",
          "No se pudo sincronizar el movimiento con el servidor",
          "warning",
        );
      }
    };

    const handleSaveArqueo = async () => {
      try {
        await addArqueoToFirebase({
          billetes: {
            "1000": Number(arq1000) || 0,
            "500": Number(arq500) || 0,
            "200": Number(arq200) || 0,
            "100": Number(arq100) || 0,
            "50": Number(arq50) || 0,
            "20": Number(arq20) || 0,
          },
          monedas: {
            "10": Number(arqM10) || 0,
            "5": Number(arqM5) || 0,
            "2": Number(arqM2) || 0,
            "1": Number(arqM1) || 0,
            "0.5": Number(arqM05) || 0,
          },
          totalFisico: instantPhysicalTotal,
          saldoTeorico: theoreticalBalance,
          diferencia: instantDifference,
          user: currentUser?.name || "Admin",
          timestamp: getMexicoISOString(),
        });

        triggerAppNotification(
          "🪙 Arqueo registrado",
          `Conteo físico guardado por un total de $${instantPhysicalTotal.toFixed(2)}. Diferencia: $${instantDifference.toFixed(2)}.`,
          instantDifference === 0 ? "success" : "warning",
        );

        // Reset counts
        setArq1000("");
        setArq500("");
        setArq200("");
        setArq100("");
        setArq50("");
        setArq20("");
        setArqM10("");
        setArqM5("");
        setArqM2("");
        setArqM1("");
        setArqM05("");

        setShowArqueoFormModal(false);
      } catch (error) {
        console.error("Error saving arqueo:", error);
        triggerAppNotification(
          "⚠️ Error",
          "Error al guardar el arqueo en la base de datos real-time",
          "warning",
        );
      }
    };

    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar
            style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}
          >
            <IonButtons slot="start">
              <motion.button
                whileHover={{ scale: 1.15, cursor: "pointer" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSidebar(true)}
                style={{
                  marginLeft: "8px",
                  marginRight: "4px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "10px",
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <IonIcon icon={menuOutline} style={{ fontSize: "22px" }} />
              </motion.button>
            </IonButtons>
            <IonTitle style={{ fontWeight: "bold" }}>Caja Rápida ⚡</IonTitle>
            <IonButtons slot="end">
              <button
                onClick={() => setShowPrintPreviewModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 shadow-sm transition mr-3 cursor-pointer border-none outline-none"
              >
                <span>👁️ Vista Ticket</span>
              </button>
              <IonButton
                onClick={() => setAppMode("floorplan")}
                style={{ fontWeight: "600" }}
              >
                Cerrar
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >
          <div className="max-w-7xl mx-auto py-1 space-y-5">
            {/* Cashier Selector */}
            <div className="bg-white border text-sm border-slate-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <label className="font-bold text-slate-700 flex items-center gap-2">
                👥 Cajero a inspeccionar:
              </label>
              <select
                value={corteFilterUserId}
                onChange={(e) => setCorteFilterUserId(e.target.value)}
                className="bg-slate-50 border border-slate-200 outline-none text-slate-800 rounded-xl px-4 py-2 font-bold w-full sm:w-auto focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">🌟 Todos (Corte Global)</option>
                {users
                  .filter(
                    (u) =>
                      u.role === "cajero" ||
                      u.role === "admin" ||
                      u.role === "mesero",
                  )
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Status bar */}
            <div className="bg-emerald-500/10 border border-emerald-500/15 px-4 py-2 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    syncStatus === "syncing" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse" :
                    syncStatus === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                    syncStatus === "error" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                    "bg-slate-800/50 text-slate-500 border-slate-700"
                  }`}>
                    <IonIcon icon={syncStatus === "syncing" ? refreshOutline : cloudDoneOutline} />
                    <span>{syncStatus === "syncing" ? "Sincronizando..." : syncStatus === "error" ? "Error Local" : "Sync OK"}</span>
                  </div>
                  <span>🔄 Sincronizando Caja en Vivo por WebSockets</span>
                </div>
              </div>
              <div className="text-[12px] text-emerald-700 bg-white/60 px-2.5 py-0.5 rounded-lg border border-emerald-100 font-bold">
                Cajero: {currentUser?.name || "Activo"}
              </div>
            </div>

            {/* Compact Indicator Grid for Cashier */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                <span className="text-slate-400 text-[12px] font-bold block">
                  💵 Ventas en Efectivo
                </span>
                <span className="text-xl font-black text-slate-800">
                  ${corteData.cashSales.toFixed(2)}
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                <span className="text-slate-400 text-[12px] font-bold block">
                  📥 Entradas Recientes
                </span>
                <span className="text-xl font-black text-emerald-600">
                  ${corteData.cashInFromMovements.toFixed(2)}
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                <span className="text-slate-400 text-[12px] font-bold block">
                  💸 Salidas & Gastos
                </span>
                <span className="text-xl font-black text-rose-500">
                  ${totalOutflowsAmt.toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-2xl">
                <span className="text-slate-300 text-[12px] font-bold block">
                  🏦 Saldo Estimado en Caja
                </span>
                <span className="text-xl font-black text-amber-400">
                  ${theoreticalBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Arqueo Widget */}
              <button
                onClick={() => {
                  setArq1000("");
                  setArq500("");
                  setArq200("");
                  setArq100("");
                  setArq50("");
                  setArq20("");
                  setArqM10("");
                  setArqM5("");
                  setArqM2("");
                  setArqM1("");
                  setArqM05("");
                  setShowArqueoFormModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl hover:shadow-lg transition flex items-center justify-between text-left cursor-pointer border-none outline-none"
              >
                <div>
                  <h3 className="font-black text-sm flex items-center gap-1.5">
                    <span>🧮</span> Arqueo Físico (Contar Dinero)
                  </h3>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Ingresa piezas de billetes y monedas para auditar
                  </p>
                </div>
                <span className="text-2xl">⚡</span>
              </button>

              {/* Quick Compound Gasto widget */}
              <button
                onClick={() => {
                  setGastoItems([]);
                  setGastoDescription("");
                  setGastoCategory("abarrotes");
                  setShowGastoRegisterModal(true);
                }}
                className="bg-indigo-600 text-white p-4 rounded-2xl hover:shadow-lg transition flex items-center justify-between text-left cursor-pointer border-none outline-none"
              >
                <div>
                  <h3 className="font-black text-sm flex items-center gap-1.5">
                    <span>🧾</span> Gasto Compuesto Maestro
                  </h3>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Egresos con desglose de múltiples productos
                  </p>
                </div>
                <span className="text-2xl">➕</span>
              </button>
            </div>

            {/* Main Interactive Agile Workflows Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Recording workflows (Span 7) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Assistant Guided Flow Box: Movimientos */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
                  {/* Step 1: Initial visual options */}
                  {guidedFlowStep === "init" && (
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <span className="text-[12px] font-black tracking-wider text-slate-400 uppercase block mb-1">
                          Punto de Venta Rápido
                        </span>
                        <h3 className="text-sm font-black text-slate-700 uppercase flex items-center justify-center gap-1">
                          <span>💰</span> Flujo de Caja Automatizado
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                        {/* 🟢 Green Inflow button */}
                        <button
                          onClick={() => {
                            setGuidedType("in");
                            setGuidedFlowStep("in_concept");
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-200/90 border border-emerald-500/20 text-emerald-850 p-5 rounded-2xl cursor-pointer transition text-center flex flex-col items-center justify-center space-y-2 border-none outline-none w-full"
                        >
                          <span className="text-3xl">🟢</span>
                          <span className="text-xs font-black uppercase tracking-wider block">
                            Entrada Dinero
                          </span>
                          <span className="text-[11px] text-emerald-600 font-bold">
                            Dotación, venta manual etc.
                          </span>
                        </button>

                        {/* 🔴 Red Outflow button */}
                        <button
                          onClick={() => {
                            setGuidedType("out");
                            setGuidedFlowStep("out_concept");
                          }}
                          className="bg-rose-50 hover:bg-rose-100/80 active:bg-rose-200/90 border border-rose-500/20 text-rose-850 p-5 rounded-2xl cursor-pointer transition text-center flex flex-col items-center justify-center space-y-2 border-none outline-none w-full"
                        >
                          <span className="text-3xl">🔴</span>
                          <span className="text-xs font-black uppercase tracking-wider block">
                            Salida Dinero
                          </span>
                          <span className="text-[11px] text-rose-600 font-bold">
                            Gastos, nóminas, compras
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Choosing entry types (Entrada de Dinero) */}
                  {guidedFlowStep === "in_concept" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <button
                          onClick={() => setGuidedFlowStep("init")}
                          className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                        >
                          ⬅️ Volver
                        </button>
                        <span className="text-[12px] font-black text-emerald-600 uppercase tracking-wider">
                          🟢 REGISTRAR ENTRADA
                        </span>
                      </div>

                      <h4 className="text-[11px] font-black text-slate-400 uppercase text-center tracking-wide">
                        ¿Cuál es el motivo?
                      </h4>

                      <div className="space-y-2.5">
                        <button
                          onClick={() => {
                            setGuidedConcept("dotacion");
                            setGuidedDescription(
                              "Ingreso inicial para dotar de cambios a la caja.",
                            );
                            setGuidedFlowStep("fill_details");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">📥</span>
                            <span>Fondo de Caja (Dotación Inicial)</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setGuidedConcept("venta_extra");
                            setGuidedDescription(
                              "Registro de venta rápida cobrada directamente en efectivo sin mesa.",
                            );
                            setGuidedFlowStep("fill_details");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">💵</span>
                            <span>Venta Rápida en Efectivo</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setGuidedConcept("otro");
                            setGuidedDescription(
                              "Otros ingresos de efectivo extraordinarios.",
                            );
                            setGuidedFlowStep("fill_details");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">⚙️</span>
                            <span>Soporte / Aporte Extra (Supervisor)</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Choosing exit types (Salida de Dinero) */}
                  {guidedFlowStep === "out_concept" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <button
                          onClick={() => setGuidedFlowStep("init")}
                          className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                        >
                          ⬅️ Volver
                        </button>
                        <span className="text-[12px] font-black text-rose-600 uppercase tracking-wider">
                          🔴 REGISTRAR SALIDA
                        </span>
                      </div>

                      <h4 className="text-[11px] font-black text-slate-400 uppercase text-center tracking-wide">
                        ¿En qué se usará el dinero?
                      </h4>

                      <div className="space-y-2">
                        {/* Payroll Option */}
                        <button
                          onClick={() => {
                            setGuidedConcept("nomina");
                            setGuidedFlowStep("select_user");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">💼</span>
                            <span>Pago de Nómina / Adelanto Personal</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>

                        {/* Supplier Purchase option */}
                        <button
                          onClick={() => {
                            setGuidedConcept("pago_proveedor");
                            setGuidedFlowStep("select_supplier");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">🚛</span>
                            <span>Compra / Pago Directo a Proveedor</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>

                        {/* Tiendita gasto */}
                        <button
                          onClick={() => {
                            setGuidedConcept("gasto");
                            setGuidedDescription(
                              "Salida directa para compras de papelería, limpieza o reabastecimiento menor.",
                            );
                            setGuidedFlowStep("fill_details");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">🛒</span>
                            <span>Gasto de Tiendita / Menor Directo</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>

                        {/* Security partial withdrawal */}
                        <button
                          onClick={() => {
                            setGuidedConcept("retiro");
                            setGuidedDescription(
                              "Retiro de seguridad para blindar efectivo de la caja.",
                            );
                            setGuidedFlowStep("fill_details");
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 p-3 rounded-xl text-left font-bold text-xs cursor-pointer flex items-center justify-between transition border-none outline-none text-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">💸</span>
                            <span>Blindaje parcial (Girar a Caja Fuerte)</span>
                          </span>
                          <span className="text-indigo-600 text-xs font-black">
                            Siguiente ➡️
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: List users for Payroll */}
                  {guidedFlowStep === "select_user" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <button
                          onClick={() => setGuidedFlowStep("out_concept")}
                          className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                        >
                          ⬅️ Elegir Motivo
                        </button>
                        <span className="text-[12px] font-black text-rose-600 uppercase tracking-wider">
                          👤 SELECCIONAR EMPLEADO
                        </span>
                      </div>

                      <h4 className="text-[11px] font-black text-slate-400 uppercase text-center tracking-wide">
                        ¿A quién se le paga?
                      </h4>

                      {users.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400">
                            Sin empleados registrados.
                          </p>
                          <button
                            onClick={() => {
                              setGuidedSelectedUser("Empleado General");
                              setGuidedFlowStep("fill_details");
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg mt-2 cursor-pointer border-none outline-none"
                          >
                            Empleado General de Tienda
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setGuidedSelectedUser(u.name);
                                setGuidedFlowStep("fill_details");
                              }}
                              className="bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-150 p-2.5 rounded-xl font-bold text-xs text-slate-700 flex flex-col items-center justify-center space-y-1 hover:text-indigo-800 transition cursor-pointer outline-none text-center"
                            >
                              <span className="text-2xl">👤</span>
                              <span className="font-bold block text-slate-800 line-clamp-1">
                                {u.name}
                              </span>
                              <span className="text-[10px] uppercase bg-slate-200/50 text-slate-500 px-1 py-0.5 rounded-full font-black">
                                {u.role === "mesero"
                                  ? "Mesero"
                                  : u.role === "cajero"
                                    ? "Cajero"
                                    : "Administrador"}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: List suppliers for purchase */}
                  {guidedFlowStep === "select_supplier" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <button
                          onClick={() => setGuidedFlowStep("out_concept")}
                          className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                        >
                          ⬅️ Elegir Motivo
                        </button>
                        <span className="text-[12px] font-black text-rose-600 uppercase tracking-wider">
                          🚛 SELECCIONAR PROVEEDOR
                        </span>
                      </div>

                      <h4 className="text-[11px] font-black text-slate-400 uppercase text-center tracking-wide">
                        ¿A qué proveedor se paga?
                      </h4>

                      {suppliers.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                          <p className="text-xs font-bold text-slate-400">
                            Sin proveedores guardados.
                          </p>
                          <input
                            type="text"
                            placeholder="Escribe Proveedor Externo..."
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                (e.target as HTMLInputElement).value.trim()
                              ) {
                                setGuidedSelectedSupplier(
                                  (e.target as HTMLInputElement).value.trim(),
                                );
                                setGuidedFlowStep("fill_details");
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 text-center w-full max-w-xs outline-none focus:border-indigo-500 font-bold"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                            {suppliers.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setGuidedSelectedSupplier(s.name);
                                  setGuidedFlowStep("fill_details");
                                }}
                                className="bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-150 p-2.5 rounded-xl font-bold text-xs text-slate-700 flex flex-col items-center justify-center hover:text-indigo-800 transition cursor-pointer outline-none w-full text-center"
                              >
                                <span className="text-lg">🤝</span>
                                <span className="font-bold text-slate-800 line-clamp-1 block leading-tight mt-0.5">
                                  {s.name}
                                </span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-full font-black mt-1 uppercase">
                                  {s.category || "General"}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-slate-100 pt-2 text-center">
                            <span className="text-[12px] text-slate-400 font-black block mb-1 uppercase tracking-wide">
                              ¿No está en la lista? Escríbelo:
                            </span>
                            <div className="relative max-w-xs mx-auto">
                              <input
                                type="text"
                                placeholder="Escribe el nombre y presiona Enter"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    (e.target as HTMLInputElement).value.trim()
                                  ) {
                                    setGuidedSelectedSupplier(
                                      (
                                        e.target as HTMLInputElement
                                      ).value.trim(),
                                    );
                                    setGuidedFlowStep("fill_details");
                                  }
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-xl text-xs p-2 text-center w-full font-bold outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 6: Enter amount and finalize */}
                  {guidedFlowStep === "fill_details" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <button
                          onClick={() => {
                            if (guidedConcept === "nomina") {
                              setGuidedFlowStep("select_user");
                            } else if (guidedConcept === "pago_proveedor") {
                              setGuidedFlowStep("select_supplier");
                            } else {
                              setGuidedFlowStep(
                                guidedType === "in"
                                  ? "in_concept"
                                  : "out_concept",
                              );
                            }
                          }}
                          className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                        >
                          ⬅️ Volver
                        </button>
                        <span
                          className={`text-[12px] font-black uppercase tracking-wider ${
                            guidedType === "in"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {guidedType === "in" ? "🟢 Ingreso" : "🔴 Retiro"} -{" "}
                          {guidedConcept.toUpperCase()}
                        </span>
                      </div>

                      {/* Header with clear summary */}
                      <div
                        className={`p-4 rounded-2xl text-center space-y-1 ${
                          guidedType === "in"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : "bg-rose-50 text-rose-800 border border-rose-100"
                        }`}
                      >
                        <span className="text-3xl block">
                          {guidedConcept === "dotacion" && "📥"}
                          {guidedConcept === "venta_extra" && "💵"}
                          {guidedConcept === "nomina" && "💼"}
                          {guidedConcept === "pago_proveedor" && "🚛"}
                          {guidedConcept === "gasto" && "🛒"}
                          {guidedConcept === "retiro" && "💸"}
                          {guidedConcept === "otro" && "⚙️"}
                        </span>

                        <div className="font-black text-xs uppercase tracking-wide text-slate-800 pb-0.5">
                          {guidedConcept === "dotacion" && "Inyección de Fondo"}
                          {guidedConcept === "venta_extra" &&
                            "Concepto de Venta Manual"}
                          {guidedConcept === "nomina" &&
                            `Pago de Nómina/Adelanto`}
                          {guidedConcept === "pago_proveedor" &&
                            `Liquidación a Proveedor`}
                          {guidedConcept === "gasto" && "Insumo menor comprado"}
                          {guidedConcept === "retiro" &&
                            "Blindar Dinero (Caja Fuerte)"}
                          {guidedConcept === "otro" && "Ingreso extraordinario"}
                        </div>

                        {guidedConcept === "nomina" && (
                          <p className="text-[11px] font-black text-indigo-700 bg-white shadow-sm inline-block px-2.5 py-0.5 rounded-lg border border-slate-100">
                            👤 {guidedSelectedUser}
                          </p>
                        )}
                        {guidedConcept === "pago_proveedor" && (
                          <p className="text-[11px] font-black text-indigo-700 bg-white shadow-sm inline-block px-2.5 py-0.5 rounded-lg border border-slate-100">
                            🚛 {guidedSelectedSupplier}
                          </p>
                        )}
                      </div>

                      {/* Cashier input box */}
                      <div className="space-y-1 w-full text-center">
                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-wide text-center">
                          ¿CUÁNTO DINERO ES? ($) *
                        </label>
                        <div className="relative flex items-center max-w-[200px] mx-auto">
                          <span className="absolute left-4 text-xl font-bold text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            autoFocus
                            placeholder="0.00"
                            value={guidedAmount}
                            onChange={(e) => setGuidedAmount(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-slate-50 text-slate-900 text-center text-2xl font-black py-2.5 px-8 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Direct comments */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wide text-center">
                          Comentario rápido (ej. Compra de azúcar, coca colas)
                        </label>
                        <input
                          type="text"
                          placeholder="Escribe aquí un comentario corto..."
                          value={guidedDescription}
                          onChange={(e) => setGuidedDescription(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs py-2 px-3 rounded-lg focus:border-indigo-500 outline-none text-center font-semibold"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="button"
                        onClick={handleGuidedSubmit}
                        className={`w-full font-black text-xs py-3 rounded-xl cursor-pointer transition text-white shadow shadow-indigo-500/10 border-none outline-none ${
                          guidedType === "in"
                            ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                            : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                        }`}
                      >
                        {guidedType === "in"
                          ? "🟢 GUARDAR ENTRADA DE DINERO"
                          : "🔴 REGISTRAR SALIDA DE DINERO"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Workflow Card 2: Proveedores */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center bg-transparent">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🚛</span> Surtido de Proveedores Recurrentes
                    </h3>
                  </div>

                  {suppliers.filter((s) => s.frequency).length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-slate-150 rounded-2xl bg-slate-50">
                      <span className="text-lg">🤝</span>
                      <h3 className="text-[11px] font-bold text-slate-600 mt-1">
                        Sin proveedores con frecuencia asignada
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Edita tus proveedores y agrégales un período de visita
                        programado.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suppliers
                        .filter((s) => s.frequency)
                        .map((sup) => {
                          return (
                            <div
                              key={sup.id}
                              className="flex flex-col justify-between p-3 bg-slate-50 hover:bg-slate-100/75 rounded-xl border border-slate-100/80 transition space-y-2"
                            >
                              <div>
                                <span className="font-bold text-xs text-slate-800 block line-clamp-1">
                                  {sup.name}
                                </span>
                                <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">
                                    {sup.category || "General"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold bg-white px-1 py-0.5 rounded border border-slate-100">
                                    {sup.frequency === "diario"
                                      ? "📅 Diario"
                                      : sup.frequency === "semanal"
                                        ? "📆 Semanal"
                                        : sup.frequency === "tres_dias"
                                          ? "🗓️ Cada 3 días"
                                          : "📂 Quincenal"}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedScheduleSupplier(sup);
                                  setSupplierPurchaseItems([]);
                                  setSupplierPurchaseIsPaid(true);
                                  setShowSupplierPurchaseModal(true);
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] py-1.5 rounded-lg cursor-pointer transition shadow-sm border-none outline-none flex items-center justify-center gap-1"
                              >
                                <span>🚛</span> Surtir / Registrar Entrega
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Option to create supply freely or trigger custom supplier */}
                  <div className="pt-1.5 flex gap-2">
                    <button
                      onClick={() => {
                        setAppMode("suppliers");
                        triggerAppNotification(
                          "🤝 Proveedores",
                          "Accediendo al catálogo de proveedores para gestionar.",
                          "info",
                        );
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] py-2.5 px-3 rounded-xl transition cursor-pointer border-none outline-none text-center"
                    >
                      🤝 Gestor Proveedores
                    </button>
                    <button
                      onClick={() => {
                        if (suppliers.length > 0) {
                          setSelectedScheduleSupplier(suppliers[0]);
                          setSupplierPurchaseItems([]);
                          setSupplierPurchaseIsPaid(true);
                          setShowSupplierPurchaseModal(true);
                        } else {
                          triggerAppNotification(
                            "⚠️ Error",
                            "No tienes proveedores registrados todavía para surtir stock.",
                            "warning",
                          );
                        }
                      }}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[12px] py-2.5 px-3 rounded-xl transition cursor-pointer border-none outline-none text-center"
                    >
                      ➕ Surtido a Proveedor Libre
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Historical logs/Audits (Span 5) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Flow Logs */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center bg-transparent">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>📝</span> Flujos de Hoy
                    </h3>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {corteData.totalCashMovements.length} movs
                    </span>
                  </div>

                  {corteData.totalCashMovements.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      Ningún flujo registrado hoy todavía.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 max-h-[220px] overflow-y-auto space-y-2 pr-1">
                      {corteData.totalCashMovements.slice(0, 8).map((mov) => {
                        const isPlus = mov.type === "in";
                        const formattedTime = mov.date
                          ? new Date(mov.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--";
                        return (
                          <div
                            key={mov.id}
                            className="pt-2 text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-black uppercase px-1 rounded ${
                                    isPlus
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  {isPlus ? "Entrada" : "Salida"}
                                </span>
                                <span className="font-bold text-slate-700 uppercase mb-0.5 text-[11px]">
                                  {mov.concept}
                                </span>
                              </div>
                              <span
                                className="text-[12px] text-slate-400 block truncate max-w-[170px]"
                                title={mov.description}
                              >
                                {mov.description}
                              </span>
                            </div>
                            <div className="text-right whitespace-nowrap pl-2">
                              <span
                                className={`font-black text-xs ${isPlus ? "text-emerald-600" : "text-rose-600"}`}
                              >
                                {isPlus
                                  ? `+$${mov.amount.toFixed(2)}`
                                  : `-$${mov.amount.toFixed(2)}`}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {formattedTime}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Audit & Arqueos history logs */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center bg-transparent">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <span>🧮</span> Arqueos Guardados
                    </h3>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {arqueosHistory.length}
                    </span>
                  </div>

                  {arqueosHistory.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      Ningún arqueo guardado hoy.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {arqueosHistory.slice(0, 5).map((arq) => {
                        const dateObj = arq.timestamp
                          ? new Date(arq.timestamp)
                          : new Date();
                        const timeStr = dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const isBalanced = Number(arq.diferencia || 0) === 0;
                        const isPositive = Number(arq.diferencia || 0) > 0;

                        return (
                          <div
                            key={arq.id}
                            className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-slate-700 block">
                                👤 Arqueo por: {arq.user || "Cajero"}
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                {timeStr} - Físico: $
                                {Number(arq.totalFisico || 0).toFixed(2)}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-center ${
                                isBalanced
                                  ? "bg-emerald-50 text-emerald-800"
                                  : isPositive
                                    ? "bg-blue-50 text-blue-800"
                                    : "bg-rose-50 text-rose-800"
                              }`}
                            >
                              {isBalanced
                                ? "Cuadrado"
                                : isPositive
                                  ? `+$${arq.diferencia.toFixed(2)}`
                                  : `-$${Math.abs(arq.diferencia).toFixed(2)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Modal: Arqueo de Caja */}
<ArqueoFormModal
          showArqueoFormModal={showArqueoFormModal}
          setShowArqueoFormModal={setShowArqueoFormModal}
        />

          {/* Modal A: Registrar Gasto Compuesto por Categoría */}
<GastoRegisterModal
          showGastoRegisterModal={showGastoRegisterModal}
          setShowGastoRegisterModal={setShowGastoRegisterModal}
        />

          {/* Modal B: Surtido de Proveedor Programado */}
<SupplierPurchaseModal
          showSupplierPurchaseModal={showSupplierPurchaseModal}
          setShowSupplierPurchaseModal={setShowSupplierPurchaseModal}
        />

          {/* Modal C: Vista Preliminar Comprobante Térmico de Corte de Caja */}
<PrintPreviewModal
          showPrintPreviewModal={showPrintPreviewModal}
          setShowPrintPreviewModal={setShowPrintPreviewModal}
          printPreviewContent={printPreviewContent}
        />
        </IonContent>
      </IonPage>
    );
};
