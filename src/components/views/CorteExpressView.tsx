import { ArqKeyboardModal } from '../modals/ArqKeyboardModal';
import { ReceiptPreviewModal } from '../modals/ReceiptPreviewModal';
import { getMexicoISOString } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackOutline, eyeOutline, syncOutline, trashOutline } from 'ionicons/icons';

interface CorteExpressViewProps {
  arqKeyboardValue: any;
  setArqKeyboardTarget: any;
  handleArqKeyboardDone: any;
  arqKeyboardTarget: any;
  receiptPreviewContent: any;
  setArqKeyboardValue: any;
  activeExpressDenom: any;
  companyConfig: any;
  corteFilterUserId: any;
  currentUser: any;
  expenses: any;
  expressArq100: any;
  expressArq1000: any;
  expressArq20: any;
  expressArq200: any;
  expressArq50: any;
  expressArq500: any;
  expressArqM05: any;
  expressArqM1: any;
  expressArqM10: any;
  expressArqM2: any;
  expressArqM5: any;
  setActiveExpressDenom: any;
  setAppMode: any;
  setCorteFilterUserId: any;
  setExpressArq100: any;
  setExpressArq1000: any;
  setExpressArq20: any;
  setExpressArq200: any;
  setExpressArq50: any;
  setExpressArq500: any;
  setExpressArqM05: any;
  setExpressArqM1: any;
  setExpressArqM10: any;
  setExpressArqM2: any;
  setExpressArqM5: any;
  setMenuToastMessage: any;
  setShowArqKeyboardModal: any;
  setShowMenuToast: any;
  setShowReceiptPreviewModal: any;
  showArqKeyboardModal: any;
  showReceiptPreviewModal: any;
  triggerAppNotification: any;
  users: any;
  corteData: any;
  estimated: any;
  filteredCashMovementsForCorte: any;
  filteredExpensesForCorte: any;
  generateCorteExpressTicketText: any;
}

export const CorteExpressView: React.FC<CorteExpressViewProps> = ({
  activeExpressDenom,
  companyConfig,
  corteFilterUserId,
  currentUser,
  expenses,
  expressArq100,
  expressArq1000,
  expressArq20,
  expressArq200,
  expressArq50,
  expressArq500,
  expressArqM05,
  expressArqM1,
  expressArqM10,
  expressArqM2,
  expressArqM5,
  setActiveExpressDenom,
  setAppMode,
  setCorteFilterUserId,
  setExpressArq100,
  setExpressArq1000,
  setExpressArq20,
  setExpressArq200,
  setExpressArq50,
  setExpressArq500,
  setExpressArqM05,
  setExpressArqM1,
  setExpressArqM10,
  setExpressArqM2,
  setExpressArqM5,
  setMenuToastMessage,
  setShowArqKeyboardModal,
  setShowMenuToast,
  setShowReceiptPreviewModal,
  showArqKeyboardModal,
  showReceiptPreviewModal,
  triggerAppNotification,
  users,
  corteData, estimated, filteredCashMovementsForCorte, filteredExpensesForCorte, generateCorteExpressTicketText,
  arqKeyboardValue,
  setArqKeyboardTarget,
  handleArqKeyboardDone,
  arqKeyboardTarget,
  receiptPreviewContent,
  setArqKeyboardValue
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
              <h2 className="text-xl font-extrabold text-slate-800">Cortexpress Restringido</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tu usuario cuenta con el rol de <strong>Mesero</strong>. Los meseros únicamente tienen autorización para tomar comandas y pedidos, y no pueden realizar cortes express de caja ⚡.
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

    // Today's cash movements (Ventas, Gastos/Egresos directos)
    const todayOutflows = (filteredCashMovementsForCorte || []).filter(
      (mov) => mov.type === "out",
    );

    // We also consider expenses registered in our database today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayExpenses = (filteredExpensesForCorte || []).filter((exp) => {
      if (!exp.createdAt) return false;
      const expDate = new Date(exp.createdAt);
      return expDate >= startOfToday;
    });

    // Sum of all outflows/expenses today
    const totalOutflowsAmt =
      todayOutflows.reduce((sum, mov) => sum + Number(mov.amount || 0), 0) +
      todayExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    // Calc physical cash estimated: Cash Sales minus Outflows
    const estimatedCashInBox = Math.max(
      0,
      corteData.cashSales - totalOutflowsAmt,
    );

    const expressTotalArq =
      Number(expressArq1000 || 0) * 1000 +
      Number(expressArq500 || 0) * 500 +
      Number(expressArq200 || 0) * 200 +
      Number(expressArq100 || 0) * 100 +
      Number(expressArq50 || 0) * 50 +
      Number(expressArq20 || 0) * 20 +
      Number(expressArqM10 || 0) * 10 +
      Number(expressArqM5 || 0) * 5 +
      Number(expressArqM2 || 0) * 2 +
      Number(expressArqM1 || 0) * 1 +
      Number(expressArqM05 || 0) * 0.5;

    // Auto-scroll function
    const scrollToReceiptSection = () => {
      const element = document.getElementById("express-preview-export");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        setShowReceiptPreviewModal(true);
      }
    };

    const handleExpressNumericPress = (digit: string) => {
      let currentVal = "0";
      let setVal: (value: string) => void;

      switch (activeExpressDenom) {
        case "1000":
          currentVal = expressArq1000;
          setVal = setExpressArq1000;
          break;
        case "500":
          currentVal = expressArq500;
          setVal = setExpressArq500;
          break;
        case "200":
          currentVal = expressArq200;
          setVal = setExpressArq200;
          break;
        case "100":
          currentVal = expressArq100;
          setVal = setExpressArq100;
          break;
        case "50":
          currentVal = expressArq50;
          setVal = setExpressArq50;
          break;
        case "20":
          currentVal = expressArq20;
          setVal = setExpressArq20;
          break;
        case "10":
          currentVal = expressArqM10;
          setVal = setExpressArqM10;
          break;
        case "5":
          currentVal = expressArqM5;
          setVal = setExpressArqM5;
          break;
        case "2":
          currentVal = expressArqM2;
          setVal = setExpressArqM2;
          break;
        case "1":
          currentVal = expressArqM1;
          setVal = setExpressArqM1;
          break;
        case "0.50":
          currentVal = expressArqM05;
          setVal = setExpressArqM05;
          break;
        default:
          return;
      }

      let newVal = currentVal;
      if (digit === "CLEAR") {
        newVal = "0";
      } else if (digit === "BACKSPACE") {
        newVal = currentVal.substring(0, currentVal.length - 1);
        if (newVal === "" || newVal === "-") newVal = "0";
      } else if (digit === "00") {
        if (currentVal === "0") {
          newVal = "0";
        } else {
          newVal = currentVal + "00";
        }
      } else {
        if (currentVal === "0" || currentVal === "") {
          newVal = digit;
        } else {
          newVal = currentVal + digit;
        }
      }
      setVal(newVal);
    };

    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar
            style={{ "--background": "rgb(244, 63, 94)", "--color": "white" }}
          >
            <IonButtons slot="start">
              <IonButton onClick={() => setAppMode("floorplan")}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle style={{ fontWeight: "900" }}>
              Corte Express • Panel de Control del Dueño 📊
            </IonTitle>
            <IonButtons slot="end">
              {/* Eye icon / Vista Preliminar button requested by user */}
              <button
                onClick={() => setShowReceiptPreviewModal(true)}
                className="bg-white/15 hover:bg-white/25 text-white py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center gap-1.5 border-none outline-none mr-3 cursor-pointer"
              >
                <IonIcon icon={eyeOutline} style={{ fontSize: "15px" }} />
                <span>Vista Preliminar Impreso 👁️</span>
              </button>

              <button
                onClick={() => setAppMode("floorplan")}
                className="bg-slate-900 hover:bg-slate-950 text-white py-1.5 px-3 rounded-xl text-xs font-black transition border-none outline-none cursor-pointer"
              >
                Salir
              </button>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="ion-padding bg-slate-50"
          style={{ "--background": "#f8fafc" }}
        >
          <div className="max-w-5xl mx-auto space-y-6 py-2">
            {/* Cashier Selector */}
            <div className="bg-white border text-sm border-slate-200 p-3 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <label className="font-bold text-slate-700 flex items-center gap-2">
                👥 Filtrar Movimientos por Cajero:
              </label>
              <select
                value={corteFilterUserId}
                onChange={(e) => setCorteFilterUserId(e.target.value)}
                className="bg-slate-50 border border-slate-200 outline-none text-slate-800 rounded-xl px-4 py-2 font-bold w-full sm:w-auto focus:ring-2 focus:ring-rose-500"
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

            {/* Real-time sync notifier banner */}
            <div className="bg-rose-500/10 border border-rose-500/15 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-rose-800 text-xs font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span>
                  📶 CANAL WEB_SOCKET ACTIVADO: Monitoreo en Tiempo Real para el
                  Propietario
                </span>
              </div>
              <div className="text-[12px] text-rose-700 bg-white/80 px-2.5 py-0.5 rounded-xl border border-rose-100 font-extrabold uppercase">
                Propietario: {currentUser?.name || "Administrador"}
              </div>
            </div>

            {/* MAIN DASHBOARD CARDS FOR OWNER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CARD 1: ESTIMATED CASH IN GAVETA */}
              <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider text-emerald-100/80">
                    Efectivo Estimado en Caja 💵
                  </span>
                  <h3 className="text-2.5xl font-black">
                    $
                    {estimatedCashInBox.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium">
                  Fórmula: Ventas Efectivo - Gastos
                </p>
                <span className="absolute right-3 bottom-1 text-5xl opacity-15 select-none font-mono">
                  💵
                </span>
              </div>

              {/* CARD 2: TOTAL SALES */}
              <div className="bg-indigo-600 text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider text-indigo-100/80">
                    Ventas Diarias Totales (Bruto) 🏆
                  </span>
                  <h3 className="text-2.5xl font-black">
                    $
                    {corteData.total.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <p className="text-[11px] text-indigo-100/90 font-medium">
                  Suma de todos los métodos de pago
                </p>
                <span className="absolute right-3 bottom-1 text-5xl opacity-15 select-none">
                  📈
                </span>
              </div>

              {/* CARD 3: TOTAL OUTFLOWS / EXPENSES */}
              <div className="bg-amber-600 text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider text-amber-100/80">
                    Egresos / Gastos de Hoy 🛑
                  </span>
                  <h3 className="text-2.5xl font-black">
                    -$
                    {totalOutflowsAmt.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <p className="text-[11px] text-amber-100/90 font-medium">
                  Insumos, retiros y gastos generales
                </p>
                <span className="absolute right-3 bottom-1 text-5xl opacity-15 select-none">
                  📉
                </span>
              </div>

              {/* CARD 4: COUNTED CLIENTS */}
              <div className="bg-slate-800 text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider text-slate-300">
                    Cuentas Cerradas Hoy 👥
                  </span>
                  <h3 className="text-2.5xl font-black">
                    #{corteData.count} Cuentas
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300/80 font-medium">
                  Comensales atendidos con éxito hoy
                </p>
                <span className="absolute right-3 bottom-1 text-5xl opacity-15 select-none">
                  🍽️
                </span>
              </div>
            </div>

            {/* INFLOWS BY PAYMENT METHODS + BAR GRAPHIC */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    Desglose de Ingresos por Canal de Pago
                  </h3>
                  <p className="text-[12px] text-slate-400 font-bold">
                    Validación exacta en vivo • Almacenamiento distribuido
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cash Sales Detail */}
                <div className="bg-slate-50 border border-slate-200/55 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-500 uppercase text-[12px]">
                      💵 Ventas Efectivo
                    </span>
                    <span className="font-black text-slate-800">
                      ${corteData.cashSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${corteData.total > 0 ? (corteData.cashSales / corteData.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold text-right">
                    {corteData.total > 0
                      ? ((corteData.cashSales / corteData.total) * 100).toFixed(
                          0,
                        )
                      : 0}
                    % del volumen global
                  </div>
                </div>

                {/* Card Sales Detail */}
                <div className="bg-slate-50 border border-slate-200/55 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-500 uppercase text-[12px]">
                      💳 Terminal Tarjeta
                    </span>
                    <span className="font-black text-slate-800">
                      ${corteData.cardSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${corteData.total > 0 ? (corteData.cardSales / corteData.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold text-right">
                    {corteData.total > 0
                      ? ((corteData.cardSales / corteData.total) * 100).toFixed(
                          0,
                        )
                      : 0}
                    % del volumen global
                  </div>
                </div>

                {/* Transfer Sales Detail */}
                <div className="bg-slate-50 border border-slate-200/55 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-500 uppercase text-[12px]">
                      📲 Transferencias SPEI
                    </span>
                    <span className="font-black text-slate-800">
                      ${corteData.transSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${corteData.total > 0 ? (corteData.transSales / corteData.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold text-right">
                    {corteData.total > 0
                      ? (
                          (corteData.transSales / corteData.total) *
                          100
                        ).toFixed(0)
                      : 0}
                    % del volumen global
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED DAILY MOVEMENTS RESUMEN TABLE (Clean, focused concept log) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                      Resumen Simplificado de Movimientos de Caja de Hoy
                    </h3>
                    <p className="text-[12px] text-slate-400 font-bold">
                      Concepto, origen, monto exacto registrado en
                      SQLite/Firebase
                    </p>
                  </div>
                </div>
                <div className="text-[12px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
                  Sincronizado ⚡
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                      <th className="p-3">Categoría de Flujo</th>
                      <th className="p-3">Concepto / Comentario</th>
                      <th className="p-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {/* INFLOWS */}
                    {corteData.cashSales > 0 && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 rounded-md py-0.5 px-2 text-[11px] font-black uppercase font-sans">
                            📥 Entrada
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          Ventas Totales Cobradas en Efectivo 💵
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                          +${corteData.cashSales.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {corteData.cardSales > 0 && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 rounded-md py-0.5 px-2 text-[11px] font-black uppercase font-sans">
                            📥 Entrada
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          Ventas Totales Cobradas con Tarjeta Bancaria 💳
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                          +${corteData.cardSales.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {corteData.transSales > 0 && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 rounded-md py-0.5 px-2 text-[11px] font-black uppercase font-sans">
                            📥 Entrada
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          Ventas Totales Cobradas vía Transferencia Spei 📲
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                          +${corteData.transSales.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* OUTFLOWS (TODAY CASHMOVEMENTS) */}
                    {todayOutflows.map((mov: any, idx: number) => (
                      <tr
                        key={`outflow-mov-${idx}`}
                        className="hover:bg-slate-50/50"
                      >
                        <td className="p-3">
                          <span className="bg-rose-100 text-rose-800 rounded-md py-0.5 px-2 text-[11px] font-black uppercase font-sans">
                            📤 Salida (Caja)
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {mov.description || "Egreso Especial de Caja"}
                        </td>
                        <td className="p-3 text-right text-rose-600 font-black">
                          -${Number(mov.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* EXPENSES FOR TODAY SINCE THEY ARE OUTFLOWS */}
                    {todayExpenses.map((exp: any, idx: number) => (
                      <tr
                        key={`outflow-exp-${idx}`}
                        className="hover:bg-slate-50/50"
                      >
                        <td className="p-3">
                          <span className="bg-rose-100 text-rose-800 rounded-md py-0.5 px-2 text-[11px] font-black uppercase font-sans">
                            🛒 Gasto Sucursal
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          🛒 [{exp.category || "Varios"}] - {exp.concept}{" "}
                          {exp.reference ? `(Ref: ${exp.reference})` : ""}
                        </td>
                        <td className="p-3 text-right text-rose-600 font-black">
                          -${Number(exp.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {corteData.cashSales === 0 &&
                      corteData.cardSales === 0 &&
                      corteData.transSales === 0 &&
                      todayOutflows.length === 0 &&
                      todayExpenses.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-6 text-center text-slate-400 italic font-bold"
                          >
                            Sin ningún movimiento o venta registrada para el día
                            de hoy. 🌱
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CANCELATIONS TABLE FOR SECURITY CONTROL */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-2xl text-rose-600">❌</span>
                <div>
                  <h3 className="text-sm font-black text-rose-600 uppercase tracking-wide">
                    Control de Cancelaciones y Descuentos del Día (Dueño)
                  </h3>
                  <p className="text-[12px] text-slate-400 font-bold">
                    Reporte estricto de auditoría para evitar mermas financieras
                  </p>
                </div>
              </div>

              {corteData.canceledItems.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400">
                    Sin cancelaciones registradas hoy. ¡Cero Mermas Financieras!
                    🌟
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-150 max-h-[220px] overflow-y-auto pr-1">
                  {corteData.canceledItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md uppercase">
                            {item.tableName}
                          </span>
                          <span className="font-black text-slate-800 text-xs">
                            {item.productName}
                          </span>
                          <span className="text-xs text-slate-405 font-bold">
                            x{item.qty}
                          </span>
                        </div>
                        <p className="text-xs text-rose-950 font-semibold bg-rose-50/70 p-2 rounded-xl border border-rose-100 inline-block">
                          ✍️ Motivo de Cancelación:{" "}
                          <span className="font-extrabold text-rose-700">
                            {item.reason}
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-[12px] text-slate-400 font-bold">
                        <div>
                          Cajero:{" "}
                          <span className="text-slate-650 font-black">
                            {item.user || "Cajero"}
                          </span>
                        </div>
                        <div>{new Date(item.time).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PANELA DE CONTEO / ARQUEO FISICO EXPRESO Y REGISTRO DE DENOMINACIONES */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-bounce">🧮</span>
                  <div>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Arqueo de Efectivo Express en Vivo 💵</span>
                      <span className="text-[11px] bg-rose-500 text-white font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest animate-pulse">
                        MySQL Sync Activado 🐳
                      </span>
                    </h3>
                    <p className="text-xs text-rose-600 font-bold">
                      Calculadora con teclado digital integrado para evitar
                      teclado nativo en Android/iOS 📱
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setExpressArq1000("0");
                      setExpressArq500("0");
                      setExpressArq200("0");
                      setExpressArq100("0");
                      setExpressArq50("0");
                      setExpressArq20("0");
                      setExpressArqM10("0");
                      setExpressArqM5("0");
                      setExpressArqM2("0");
                      setExpressArqM1("0");
                      setExpressArqM05("0");
                      setActiveExpressDenom("1000");
                      triggerAppNotification(
                        "🧹 Conteo Reiniciado",
                        "Todas las cantidades de billetes y monedas se restablecieron a cero.",
                        "success",
                      );
                    }}
                    className="bg-slate-105 hover:bg-slate-200 border border-slate-200 text-slate-705 py-2 px-3 rounded-2xl text-[11px] font-black tracking-tight transition flex items-center gap-1.5 cursor-pointer border-none outline-none"
                  >
                    <IonIcon icon={trashOutline} />
                    Limpiar Todo 🧹
                  </button>
                  <button
                    onClick={() => {
                      const uuid =
                        "arq-" +
                        Math.random().toString(36).substring(2, 15) +
                        "-" +
                        Math.random().toString(36).substring(2, 15);
                      const timestamp = new Date()
                        .toISOString()
                        .replace("T", " ")
                        .substring(0, 19);
                      triggerAppNotification(
                        "💾 Sincronización MySQL",
                        `Arqueo guardado con UUID único: [${uuid}] | Timestamp: ${timestamp} | Sincronizado vía WebSockets en la red local. 🚀`,
                        "success",
                      );
                    }}
                    className="bg-emerald-605 hover:bg-emerald-700 text-white py-2 px-3.5 rounded-2xl text-[11px] font-black tracking-tight transition flex items-center gap-1.5 cursor-pointer border-none outline-none shadow-sm"
                  >
                    <IonIcon icon={syncOutline} className="animate-spin" />
                    Sincronizar SQL 💾
                  </button>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column left: 11 Denomination rows (Billetes and Monedas) */}
                <div className="lg:col-span-7 space-y-2 max-h-[580px] overflow-y-auto pr-2">
                  <div className="text-[12px] font-black text-emerald-700 bg-emerald-50 py-1.5 px-3.5 rounded-xl uppercase tracking-widest inline-block select-none mb-1">
                    💸 Billetes Nacionales (Selecciona uno para capturar)
                  </div>

                  {[
                    {
                      val: "1000",
                      label: "$1,000 Pesos",
                      valNum: 1000,
                      state: expressArq1000,
                      set: setExpressArq1000,
                      isCoin: false,
                    },
                    {
                      val: "500",
                      label: "$500 Pesos",
                      valNum: 500,
                      state: expressArq500,
                      set: setExpressArq500,
                      isCoin: false,
                    },
                    {
                      val: "200",
                      label: "$200 Pesos",
                      valNum: 200,
                      state: expressArq200,
                      set: setExpressArq200,
                      isCoin: false,
                    },
                    {
                      val: "100",
                      label: "$100 Pesos",
                      valNum: 100,
                      state: expressArq100,
                      set: setExpressArq100,
                      isCoin: false,
                    },
                    {
                      val: "50",
                      label: "$50 Pesos",
                      valNum: 50,
                      state: expressArq50,
                      set: setExpressArq50,
                      isCoin: false,
                    },
                    {
                      val: "20",
                      label: "$20 Pesos",
                      valNum: 20,
                      state: expressArq20,
                      set: setExpressArq20,
                      isCoin: false,
                    },
                  ].map((denom) => {
                    const isActive = activeExpressDenom === denom.val;
                    const subtotal = Number(denom.state || 0) * denom.valNum;
                    return (
                      <div
                        key={denom.val}
                        onClick={() => {
                          setActiveExpressDenom(denom.val);
                          setShowArqKeyboardModal(true);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                          isActive
                            ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30 font-bold"
                            : "bg-slate-50 hover:bg-slate-100/85 border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">💵</span>
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs block">
                              {denom.label}
                            </span>
                            <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                              Subtotal: $
                              {subtotal.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold text-xs select-none">
                            x
                          </span>
                          <input
                            type="text"
                            value={denom.state}
                            readOnly={true}
                            inputMode="none"
                            className={`w-16 p-2 rounded-xl text-center text-xs font-black shadow-inner border transition-all outline-none ${
                              isActive
                                ? "bg-white border-rose-500 text-rose-700 ring-2 ring-rose-250"
                                : "bg-white border-slate-205 text-slate-800"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-[12px] font-black text-amber-700 bg-amber-50 py-1.5 px-3.5 rounded-xl uppercase tracking-widest inline-block select-none mt-3.5 mb-1">
                    🪙 Monedas Fraccionarias (Selecciona una para capturar)
                  </div>

                  {[
                    {
                      val: "10",
                      label: "$10.00 Pesos",
                      valNum: 10,
                      state: expressArqM10,
                      set: setExpressArqM10,
                      isCoin: true,
                    },
                    {
                      val: "5",
                      label: "$5.00 Pesos",
                      valNum: 5,
                      state: expressArqM5,
                      set: setExpressArqM5,
                      isCoin: true,
                    },
                    {
                      val: "2",
                      label: "$2.00 Pesos",
                      valNum: 2,
                      state: expressArqM2,
                      set: setExpressArqM2,
                      isCoin: true,
                    },
                    {
                      val: "1",
                      label: "$1.00 Peso",
                      valNum: 1,
                      state: expressArqM1,
                      set: setExpressArqM1,
                      isCoin: true,
                    },
                    {
                      val: "0.50",
                      label: "$0.50 Centavos",
                      valNum: 0.5,
                      state: expressArqM05,
                      set: setExpressArqM05,
                      isCoin: true,
                    },
                  ].map((denom) => {
                    const isActive = activeExpressDenom === denom.val;
                    const subtotal = Number(denom.state || 0) * denom.valNum;
                    return (
                      <div
                        key={denom.val}
                        onClick={() => {
                          setActiveExpressDenom(denom.val);
                          setShowArqKeyboardModal(true);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                          isActive
                            ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30 font-bold"
                            : "bg-slate-50 hover:bg-slate-100/85 border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🪙</span>
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs block">
                              {denom.label}
                            </span>
                            <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                              Subtotal: $
                              {subtotal.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold text-xs select-none">
                            x
                          </span>
                          <input
                            type="text"
                            value={denom.state}
                            readOnly={true}
                            inputMode="none"
                            className={`w-16 p-2 rounded-xl text-center text-xs font-black shadow-inner border transition-all outline-none ${
                              isActive
                                ? "bg-white border-rose-500 text-rose-700 ring-2 ring-rose-250"
                                : "bg-white border-slate-205 text-slate-805"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column right: Custom Virtual Numeric Panel and Expected vs Counted Comparison */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Virtual Keyboard Indicator */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Captura Interactiva Activa ✍️
                      </span>
                      <span className="text-[11px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                        Teclado Desactivado
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">
                        Denominación Actual:
                      </span>
                      <span className="text-rose-450 font-black text-sm uppercase">
                        {activeExpressDenom === "0.50"
                          ? "Centavos 50¢"
                          : `$${activeExpressDenom} Pesos`}
                      </span>
                    </div>
                  </div>

                  {/* VIRTUAL KEYBOARD PANEL */}
                  <div className="bg-slate-100 rounded-3xl p-4 shadow-inner border border-slate-205 space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                        (num) => (
                          <button
                            key={num}
                            onClick={() => handleExpressNumericPress(num)}
                            className="bg-white hover:bg-slate-50 text-slate-800 h-14 rounded-2xl text-lg font-black shadow-sm flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                          >
                            {num}
                          </button>
                        ),
                      )}
                      <button
                        onClick={() => handleExpressNumericPress("CLEAR")}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 h-14 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                      >
                        C (Limpiar)
                      </button>
                      <button
                        onClick={() => handleExpressNumericPress("0")}
                        className="bg-white hover:bg-slate-50 text-slate-800 h-14 rounded-2xl text-lg font-black shadow-sm flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        onClick={() => handleExpressNumericPress("00")}
                        className="bg-white hover:bg-slate-50 text-slate-800 h-14 rounded-2xl text-base font-black shadow-sm flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                      >
                        00
                      </button>
                    </div>
                    {/* Delete button spanning full width */}
                    <button
                      onClick={() => handleExpressNumericPress("BACKSPACE")}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 h-12 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all outline-none border-none cursor-pointer"
                    >
                      <span>⌫ Retroceder (Borrar Dígito)</span>
                    </button>
                  </div>

                  {/* COMPARISON AND STATISTICS IN LARGE LETTERS - HIGHLIGHT MODULE */}
                  <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-3xl space-y-4">
                    <div className="text-[12px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-205 pb-1.5 flex items-center justify-between">
                      <span>Resumen de Cierre de Caja</span>
                      <span className="text-[12px] text-emerald-600 font-extrabold flex items-center gap-1">
                        🟢 En Línea
                      </span>
                    </div>

                    {/* Esperado / Estimate */}
                    <div className="space-y-0.5">
                      <div className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                        Efectivo Esperado (Balanza Esp.)
                      </div>
                      <div className="text-1.5xl font-extrabold text-slate-700 flex items-baseline gap-1">
                        <span>$</span>
                        <span className="text-2xl font-black">
                          {estimatedCashInBox.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-[12px] font-bold text-slate-400 font-mono">
                          MXN
                        </span>
                      </div>
                    </div>

                    {/* Arqueado / Conteo Físico */}
                    <div className="space-y-0.5">
                      <div className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                        Total Conteo Físico (Cash Count)
                      </div>
                      <div className="text-2xl font-extrabold text-[#e11d48] flex items-baseline gap-1">
                        <span>$</span>
                        <span className="text-3xl font-black">
                          {expressTotalArq.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-[12px] font-bold text-rose-500 font-mono">
                          MXN
                        </span>
                      </div>
                    </div>

                    {/* DIFFERENCE DISPLAY: SURPLUS OR SHORTAGE */}
                    <div className="border-t border-slate-200 pt-3">
                      {expressTotalArq === 0 ? (
                        <div className="bg-slate-105 bg-opacity-40 p-3 rounded-2xl text-[11px] font-bold text-slate-550 text-center border border-dashed border-slate-300">
                          🤖 captured 0.00. Ingresa las denominaciones recibidas
                          en caja para contrastar con la balanza esperada.
                        </div>
                      ) : expressTotalArq - estimatedCashInBox === 0 ? (
                        <div className="bg-emerald-500/10 border border-emerald-500 p-3.5 rounded-2xl text-center space-y-1">
                          <div className="text-xs font-black text-emerald-800 uppercase flex items-center justify-center gap-1">
                            <span>Exacto ✅</span>
                            <span>¡Caja Cuadrada Perfecta!</span>
                          </div>
                          <p className="text-[12px] text-emerald-700 font-bold">
                            La diferencia es de $0.00 pesos. Sincronización
                            libre de cualquier descuadre de inventario.
                          </p>
                        </div>
                      ) : expressTotalArq - estimatedCashInBox > 0 ? (
                        <div className="bg-blue-500/10 border border-blue-500 p-3.5 rounded-2xl text-center space-y-1">
                          <div className="text-xs font-black text-blue-800 uppercase flex items-center justify-center gap-1">
                            <span>Sobrante Detectado 📈</span>
                            <span>
                              +$
                              {(
                                expressTotalArq - estimatedCashInBox
                              ).toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <p className="text-[12px] text-blue-700 font-semibold">
                            Se registraron más de lo esperado en la gaveta
                            comparado al volumen esperado de ventas.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-rose-500/10 border border-rose-500 p-3.5 rounded-2xl text-center space-y-1">
                          <div className="text-xs font-black text-rose-800 uppercase flex items-center justify-center gap-1">
                            <span>Faltante Detectado ⚠️</span>
                            <span>
                              -$
                              {Math.abs(
                                expressTotalArq - estimatedCashInBox,
                              ).toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <p className="text-[12px] text-rose-700 font-semibold">
                            Faltan fondos físicos en la gaveta. Auditar el
                            historial de comandas y cancelaciones.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DEDICATED PREVIEW MODULE WITH ACTIONABLE BUTTONS FOR OWNER */}
            <div
              id="express-preview-export"
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                      Módulo de Previsualización & Compartido de Ticket
                    </h3>
                    <p className="text-[12px] text-slate-400 font-bold">
                      Vista física exacta del ticket térmico regulado por
                      Profeco/SAT
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* View in eye popup requested */}
                  <button
                    onClick={() => setShowReceiptPreviewModal(true)}
                    className="bg-rose-500 hover:bg-rose-600 text-white py-2.5 px-3.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border-none outline-none"
                  >
                    <IonIcon icon={eyeOutline} />
                    <span>Ver Impreso Grande 👁️</span>
                  </button>

                  {/* Export action */}
                  <button
                    onClick={() => {
                      try {
                        const text = generateCorteExpressTicketText();
                        const blob = new Blob([text], {
                          type: "text/plain;charset=utf-8",
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `CorteExpress_${companyConfig.businessName.replace(/\s+/g, "_")}_${getMexicoISOString().split("T")[0]}.txt`;
                        link.click();
                        URL.revokeObjectURL(url);
                        setMenuToastMessage(
                          "Ticket de Corte Express exportado con éxito.",
                        );
                        setShowMenuToast(true);
                      } catch (err: any) {
                        console.error("Export ticket failed:", err);
                      }
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 py-2.5 px-3.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border-none outline-none"
                  >
                    📥 Exportar TXT
                  </button>

                  {/* Send via WhatsApp action */}
                  <button
                    onClick={() => {
                      const text = generateCorteExpressTicketText();
                      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                      window.open(url, "_blank");
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-2.5 px-3.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border-none outline-none"
                  >
                    💬 Enviar por WhatsApp
                  </button>
                </div>
              </div>

              {/* Receipt Visualizer (Monospace design mimicking 58mm / 80mm thermal receipt) */}
              <div className="flex justify-center bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-150">
                <div className="bg-[#fdfbf7] p-5 sm:p-7 rounded-2xl shadow-md border border-amber-100/60 max-w-[340px] w-full font-mono text-slate-800 text-[11px] leading-tight select-all relative overflow-hidden">
                  {/* Scissors cut effect decor */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_30%,_#e2e8f0_31%)] bg-[length:8px_8px] bg-repeat-x"></div>

                  <div className="text-center text-slate-400 text-[11px] mb-4 font-black select-none tracking-widest uppercase border-b border-dashed border-slate-200 pb-1">
                    ✂️ PRE-VISUALIZACIÓN DE TICKET AUTOMÁTICO ✂️
                  </div>
                  <pre className="whitespace-pre-wrap font-mono break-all leading-normal">
                    {generateCorteExpressTicketText()}
                  </pre>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_30%,_#e2e8f0_31%)] bg-[length:8px_8px] bg-repeat-x"></div>
                </div>
              </div>
            </div>
          </div>

          {/* EYE FULLSCREEN RECEIPT MODAL FOR THE OWNER REQUESTED BY USER */}
<ReceiptPreviewModal
          showReceiptPreviewModal={showReceiptPreviewModal}
          setShowReceiptPreviewModal={setShowReceiptPreviewModal}
          receiptPreviewContent={receiptPreviewContent}
        />

          {/* POPUP MODAL CON TECLADO NUMÉRICO PARA CAPTURAR/EDITAR DENOMINACIÓN */}
<ArqKeyboardModal
          showArqKeyboardModal={showArqKeyboardModal}
          setShowArqKeyboardModal={setShowArqKeyboardModal}
          arqKeyboardTarget={arqKeyboardTarget}
          setArqKeyboardTarget={setArqKeyboardTarget}
          arqKeyboardValue={arqKeyboardValue}
          setArqKeyboardValue={setArqKeyboardValue}
          handleArqKeyboardDone={handleArqKeyboardDone}
        />
        </IonContent>
      </IonPage>
    );
};
