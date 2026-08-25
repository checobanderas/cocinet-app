import { ExpenseModal } from '../modals/ExpenseModal';
import { getOperatingDay } from '../../utils/appHelpers';
import { addExpenseToFirebase, deleteExpenseFromFirebase, updateExpenseInFirebase } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';


interface ExpensesViewProps {
  expenseFormData: any;
  setExpenseFormData: any;
  cashierSessions: any;
  currentUser: any;
  expenseActiveTab: any;
  expenseAmount: any;
  expenseCategory: any;
  expenseCategoryFilter: any;
  expenseConcept: any;
  expenseEnableNotifications: any;
  expenseReference: any;
  expenseSearch: any;
  expenses: any;
  renderMaterialHeader: any;
  selectedExpenseForEdit: any;
  selectedTenant: any;
  setAppMode: any;
  setExpenseActiveTab: any;
  setExpenseAmount: any;
  setExpenseCategory: any;
  setExpenseCategoryFilter: any;
  setExpenseConcept: any;
  setExpenseReference: any;
  setExpenseSearch: any;
  setMenuToastMessage: any;
  setSelectedExpenseForEdit: any;
  setShowExpenseFilter: any;
  setShowExpenseModal: any;
  setShowMenuToast: any;
  showExpenseFilter: any;
  showExpenseModal: any;
  triggerAppNotification: any;
  sessionId: any;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  cashierSessions,
  currentUser,
  expenseActiveTab,
  expenseAmount,
  expenseCategory,
  expenseCategoryFilter,
  expenseConcept,
  expenseEnableNotifications,
  expenseReference,
  expenseSearch,
  expenses,
  renderMaterialHeader,
  selectedExpenseForEdit,
  selectedTenant,
  setAppMode,
  setExpenseActiveTab,
  setExpenseAmount,
  setExpenseCategory,
  setExpenseCategoryFilter,
  setExpenseConcept,
  setExpenseReference,
  setExpenseSearch,
  setMenuToastMessage,
  setSelectedExpenseForEdit,
  setShowExpenseFilter,
  setShowExpenseModal,
  setShowMenuToast,
  showExpenseFilter,
  showExpenseModal,
  triggerAppNotification,
  sessionId,
  expenseFormData,
  setExpenseFormData
}) => {
// Save or Edit handler
    const handleSaveExpense = async (e: React.FormEvent) => {
      e.preventDefault();
      const amountNum = parseFloat(expenseAmount);
      if (!expenseConcept.trim()) {
        alert("El concepto del gasto es requerido ⚠️");
        return;
      }
      if (isNaN(amountNum) || amountNum <= 0) {
        alert("Por favor ingrese un monto válido mayor a 0 💰");
        return;
      }

      const expenseData = {
        concept: expenseConcept.trim(),
        amount: amountNum,
        reference: expenseReference.trim(),
        category: expenseCategory,
        createdBy: currentUser?.name || "Cajero",
        userId: currentUser?.id || "unauthenticated",
        sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
      };

      try {
        if (selectedExpenseForEdit) {
          await updateExpenseInFirebase(selectedExpenseForEdit.id, expenseData);
          setMenuToastMessage(
            `✅ Gasto actualizado: ${expenseConcept} por $${amountNum.toFixed(2)}`,
          );

          if (
            expenseEnableNotifications &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Gastos Sincronizados ⚡", {
              body: `Se ha actualizado un gasto: "${expenseConcept}" por $${amountNum.toFixed(2)}`,
              icon: "/public/icon.png",
            });
          }
        } else {
          await addExpenseToFirebase(expenseData);
          setMenuToastMessage(
            `🎉 Gasto registrado con éxito: ${expenseConcept} por $${amountNum.toFixed(2)}`,
          );

          if (
            expenseEnableNotifications &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Nuevo Gasto Sincronizado ⚡", {
              body: `Se registró un nuevo gasto en vivo: "${expenseConcept}" por $${amountNum.toFixed(2)}`,
              icon: "/public/icon.png",
            });
          }
        }
        setShowMenuToast(true);
        // Reset form fields
        setExpenseConcept("");
        setExpenseAmount("");
        setExpenseReference("");
        setExpenseCategory("Varios");
        setSelectedExpenseForEdit(null);
        setShowExpenseModal(false);
      } catch (err: any) {
        console.error("Error al registrar gasto:", err);
        setMenuToastMessage(`❌ Error al guardar gasto: ${err.message}`);
        setShowMenuToast(true);
      }
    };

    const handlePrintExpense = (exp: any) => {
      const expDate = exp.createdAt ? new Date(exp.createdAt) : new Date();
      const formattedDate = expDate.toLocaleDateString("es-MX");
      const formattedTime = expDate.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprobante de Egreso</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; margin: 20px; font-size: 14px; max-width: 400px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed black; padding-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .label { font-weight: bold; }
            .value { text-align: right; word-wrap: break-word; max-width: 60%; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; border-top: 1px dashed black; padding-top: 10px; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; text-align: center; border-top: 1px solid black; padding-top: 5px; font-size: 12px; }
            @media print {
              body { margin: 0; padding: 10px; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">COMPROBANTE DE EGRESO</div>
            <div>Fecha: ${formattedDate} ${formattedTime}</div>
            <div>Folio: ${exp.uuid ? exp.uuid.substring(0, 8) : exp.id.substring(0, 8)}</div>
          </div>
          
          <div class="row">
            <span class="label">Concepto:</span>
            <span class="value">${exp.concept}</span>
          </div>
          <div class="row">
            <span class="label">Categoría:</span>
            <span class="value">${exp.category || "Varios"}</span>
          </div>
          <div class="row">
            <span class="label">Referencia:</span>
            <span class="value">${exp.reference || "N/A"}</span>
          </div>
          <div class="row">
            <span class="label">Responsable:</span>
            <span class="value">${exp.createdBy || "Sistema"}</span>
          </div>

          <div class="total">
            TOTAL: $${Number(exp.amount || 0).toFixed(2)}
          </div>

          <div class="signatures">
            <div class="signature-box">
              <br/>
              Entregó
            </div>
            <div class="signature-box">
              <br/>
              Recibió
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(printHtml);
      printWindow.document.close();
    };

    const handleDeleteExpense = async (expense: any) => {
      if (
        window.confirm(
          `⚠️ ¿Seguro que deseas eliminar el gasto "${expense.concept}" por $${expense.amount.toFixed(2)}?\nEsta acción es irreversible.`,
        )
      ) {
        try {
          await deleteExpenseFromFirebase(expense.id);
          setMenuToastMessage(
            `🗑️ Gasto eliminado con éxito: ${expense.concept}`,
          );
          setShowMenuToast(true);

          if (
            expenseEnableNotifications &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Gasto Eliminado 🗑️", {
              body: `Se eliminó el gasto: "${expense.concept}" por $${expense.amount}`,
              icon: "/public/icon.png",
            });
          }
        } catch (err: any) {
          console.error("Error al eliminar gasto:", err);
          setMenuToastMessage(`❌ Error al eliminar: ${err.message}`);
          setShowMenuToast(true);
        }
      }
    };

    const requestNotificationPermission = () => {
      if (typeof Notification !== "undefined") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setMenuToastMessage(
              "🔔 ¡Notificaciones activadas con éxito! Estás sincronizado en tiempo real.",
            );
            setShowMenuToast(true);
          } else {
            setMenuToastMessage("⚠️ Permiso de notificaciones denegado.");
            setShowMenuToast(true);
          }
        });
      } else {
        alert(
          "Este navegador no soporta notificaciones de sistema, pero recibirás alertas en vivo dentro de la app. 📲",
        );
      }
    };

    const currentOpDay = getOperatingDay(new Date());
    const filteredExpenses = expenses
      .filter((exp) => {
        const matchSearch =
          (exp.concept || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.reference || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.category || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.uuid || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.createdBy || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase());

        const matchCategory =
          expenseCategoryFilter === "TODAS" ||
          exp.category === expenseCategoryFilter;

        const isToday = exp.createdAt ? getOperatingDay(exp.createdAt) === currentOpDay : false;
        const matchTab = expenseActiveTab === "hoy" ? isToday : !isToday;

        return matchSearch && matchCategory && matchTab;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    // Sum of expenses calculations
    const totalExpensesSum = filteredExpenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0,
    );
    const totalCount = filteredExpenses.length;

    // Categorized breakdown
    const categoryTotals = filteredExpenses.reduce(
      (acc: { [key: string]: number }, exp) => {
        const cat = exp.category || "Varios";
        acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
        return acc;
      },
      {},
    );

    const groupedFilteredExpenses = filteredExpenses.reduce(
      (acc: { [key: string]: typeof filteredExpenses }, exp) => {
        const cat = exp.category || "Varios";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(exp);
        return acc;
      },
      {} as Record<string, typeof filteredExpenses>,
    );

    const sortedCategories = Object.keys(groupedFilteredExpenses).sort(
      (a, b) => {
        // "Varios" goes first always
        if (a === "Varios") return -1;
        if (b === "Varios") return 1;
        return a.localeCompare(b);
      },
    );

    const openCreateModalWithCategory = (cat: string) => {
      setSelectedExpenseForEdit(null);
      setExpenseConcept("");
      setExpenseAmount("");
      setExpenseReference("");
      setExpenseCategory(cat);
      setShowExpenseModal(true);
    };

    const openCreateModal = () => {
      setSelectedExpenseForEdit(null);
      setExpenseConcept("");
      setExpenseAmount("");
      setExpenseReference("");
      setExpenseCategory("Varios");
      setShowExpenseModal(true);
    };

    const openEditModal = (expense: any) => {
      setSelectedExpenseForEdit(expense);
      setExpenseConcept(expense.concept);
      setExpenseAmount(String(expense.amount));
      setExpenseReference(expense.reference || "");
      setExpenseCategory(expense.category || "Varios");
      setShowExpenseModal(true);
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Egresos y Gastos 💸",
        subtitle: `Gastos de ${selectedTenant?.name || "Sucursal"}`,
        showBack: true,
        onBack: () => setAppMode("floorplan"),
        actions: (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md cursor-pointer mr-2"
          >
            ➕ Registrar Gasto
          </motion.button>
        )
      })}

        <IonContent
          className="ion-no-padding"
          style={{ "--background": "#f8fafc", paddingLeft: 0, paddingRight: 0 }}
        >
          <div className="w-full mx-auto py-4 space-y-6 px-0">
            <hr className="border-slate-200 border-dashed" />

            {/* FILTERS AND SEARCH COMPONENT */}
            <div className="flex flex-col gap-4">
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="🔎 Buscar por concepto, referencia o cajero..."
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-2xl outline-none focus:border-red-500 transition-all shadow-sm"
                />
                <button
                  onClick={() => setShowExpenseFilter(!showExpenseFilter)}
                  className={`p-3 border rounded-2xl transition shadow-sm cursor-pointer flex items-center justify-center ${showExpenseFilter ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  title="Filtros"
                >
                  <span className="text-lg">🎛️</span>
                </button>
              </div>

              {/* Category selector */}
              {showExpenseFilter && (
                <div className="w-full md:w-1/3 flex items-center gap-2 self-end">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Filtrar:
                  </span>
                  <select
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-xs py-3 px-3 rounded-2xl outline-none focus:border-red-500 transition cursor-pointer shadow-sm"
                  >
                    <option value="TODAS">📁 Todas las Categorías</option>
                    <option value="Varios">💼 Varios / Operación</option>
                    <option value="Servicios">
                      ⚡ Servicios (Luz, Agua, Gas)
                    </option>
                    <option value="Insumos">🍅 Insumos / Materia Prima</option>
                    <option value="Sueldos">👥 Sueldos / Nómina</option>
                    <option value="Renta">🏢 Renta / Local</option>
                    <option value="Mantenimiento">🔧 Mantenimiento</option>
                    <option value="Ajustes">🪙 Ajustes de Caja</option>
                    <option value="Otros">📦 Otros Egresos</option>
                  </select>
                </div>
              )}
            </div>

            {/* TABS SELECTOR */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner max-w-md mx-auto border border-slate-200/50">
              <button
                type="button"
                onClick={() => setExpenseActiveTab("hoy")}
                style={{
                  background: expenseActiveTab === "hoy" ? "#dc2626" : "transparent",
                  color: expenseActiveTab === "hoy" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: expenseActiveTab === "hoy" ? "0 4px 10px rgba(220, 38, 38, 0.25)" : "none",
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight uppercase flex items-center justify-center gap-1.5 outline-none"
              >
                📅 Hoy
              </button>
              <button
                type="button"
                onClick={() => setExpenseActiveTab("historial")}
                style={{
                  background: expenseActiveTab === "historial" ? "#dc2626" : "transparent",
                  color: expenseActiveTab === "historial" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: expenseActiveTab === "historial" ? "0 4px 10px rgba(220, 38, 38, 0.25)" : "none",
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight uppercase flex items-center justify-center gap-1.5 outline-none"
              >
                🏛️ Historial
              </button>
            </div>

            {/* EXPENSES DATA TABLE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
                    Base de Datos de Egresos 🧾
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Resumen de transacciones con ID de tabla relacional y marcas
                    de tiempo
                  </p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 border-none outline-none"
                >
                  <span>➕ Nuevo</span>
                </button>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <span className="text-4xl block mb-2 select-none">💸</span>
                  <h4 className="font-black text-slate-750 text-sm">
                    Sin Gastos Registrados
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 font-semibold">
                    No se encontraron gastos que coincidan con tus criterios.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-md transition cursor-pointer text-center uppercase tracking-wider"
                  >
                    Registrar Primer Gasto
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                  <table className="w-full border-collapse text-left text-sm bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-xs tracking-wider">
                        <th className="p-4 w-1/2">Concepto y Referencia</th>
                        <th className="p-4 text-center">Registro</th>
                        <th className="p-4 text-right">Monto</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>

                    {sortedCategories.map((cat) => {
                      const catExpenses = groupedFilteredExpenses[cat];
                      const catTotal = categoryTotals[cat] || 0;
                      // Determine Icon for Category
                      const iconMap: Record<string, string> = {
                        Varios: "💼",
                        Servicios: "⚡",
                        Insumos: "🍅",
                        Sueldos: "👥",
                        Renta: "🏢",
                        Mantenimiento: "🔧",
                        Ajustes: "🪙",
                        Otros: "📦",
                      };
                      const catIcon = iconMap[cat] || "💼";

                      return (
                        <tbody
                          key={cat}
                          className="divide-y divide-slate-50/80"
                        >
                          {/* CATEGORY HEADER ROW */}
                          <tr className="bg-slate-100/70 border-y border-slate-200">
                            <td colSpan={4} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-base">{catIcon}</span>
                                  <span className="font-black text-slate-800 uppercase tracking-widest text-sm">
                                    {cat}
                                  </span>
                                  <span className="bg-white border border-slate-200/80 text-xs text-slate-500 font-black px-2 py-0.5 rounded-full shadow-sm">
                                    {catExpenses.length} mov
                                    {catExpenses.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-black text-red-600 text-base bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                                    $
                                    {catTotal.toLocaleString("es-MX", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                  <button
                                    onClick={() =>
                                      openCreateModalWithCategory(cat)
                                    }
                                    className="flex justify-center items-center h-7 w-7 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition shadow-md cursor-pointer"
                                    title={`Añadir nuevo registro a ${cat}`}
                                  >
                                    <span className="text-sm font-bold leading-none select-none">
                                      ➕
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* EXPENSES ROWS FOR THIS CATEGORY */}
                          {catExpenses.map((exp) => {
                            const expDate = exp.createdAt
                              ? new Date(exp.createdAt)
                              : new Date();
                            const isEdited =
                              exp.updatedAt && exp.updatedAt !== exp.createdAt;

                            return (
                              <tr
                                key={exp.id}
                                className="hover:bg-slate-50/50 transition duration-150"
                              >
                                {/* CONCEPTO Y REFERENCIA */}
                                <td className="p-4">
                                  <div className="font-bold text-slate-800 text-base">
                                    {exp.concept}
                                  </div>
                                  {exp.reference && (
                                    <div className="text-xs text-slate-500 mt-1 flex items-start gap-1 max-w-[200px] md:max-w-xs">
                                      <span className="translate-y-px">📝</span>
                                      <span className="truncate">
                                        {exp.reference}
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-[10px] font-mono text-slate-300 mt-1.5 hidden md:flex items-center gap-1">
                                    🔑{" "}
                                    {exp.uuid
                                      ? exp.uuid.substring(0, 8)
                                      : exp.id.substring(0, 8)}
                                  </div>
                                </td>

                                {/* REGISTRO: FECHA Y USUARIO */}
                                <td className="p-4 text-center">
                                  <div className="text-sm font-bold text-slate-600">
                                    📅 {expDate.toLocaleDateString("es-MX")}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    🕒{" "}
                                    {expDate.toLocaleTimeString("es-MX", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md inline-block mt-1.5 whitespace-nowrap">
                                    👤 {exp.createdBy || "Sistema"}
                                  </div>
                                  {isEdited && (
                                    <div
                                      className="text-[9px] text-amber-500 flex items-center justify-center gap-0.5 mt-1"
                                      title={`Editado el: ${new Date(exp.updatedAt).toLocaleString()}`}
                                    >
                                      <span>✏️</span> Editado
                                    </div>
                                  )}
                                </td>

                                {/* MONTO */}
                                <td className="p-4 text-right">
                                  <span className="text-base font-black text-red-650 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100">
                                    -${Number(exp.amount || 0).toFixed(2)}
                                  </span>
                                </td>

                                {/* ACCIONES CRUD */}
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    <button
                                      onClick={() => handlePrintExpense(exp)}
                                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl font-black transition cursor-pointer shadow-sm text-xs"
                                      title="Imprimir Comprobante"
                                    >
                                      🖨️
                                    </button>
                                    <button
                                      onClick={() => openEditModal(exp)}
                                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl font-black transition cursor-pointer shadow-sm text-xs"
                                      title="Editar registro"
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExpense(exp)}
                                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-black transition cursor-pointer shadow-sm text-xs"
                                      title="Eliminar registro"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              )}

              {filteredExpenses.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between shadow-md mt-4 w-full">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-300 mb-2 md:mb-0">
                    Total Acumulado de Gastos Registrados
                  </span>
                  <span className="text-3xl font-black text-rose-400">
                    $
                    {totalExpensesSum.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 font-bold select-none py-2 border-t border-slate-100">
              Sincronización Multidispositivo de Gastos Activa por Canal de
              WebSockets 📶 • Base de Datasets MySQL Schema
            </div>
          </div>

<ExpenseModal
          showExpenseModal={showExpenseModal}
          setShowExpenseModal={setShowExpenseModal}
          expenseFormData={expenseFormData}
          setExpenseFormData={setExpenseFormData}
          triggerAppNotification={triggerAppNotification}
        />
        </IonContent>
      </IonPage>
    );
};
