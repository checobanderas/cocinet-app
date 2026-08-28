import { CorteModal } from '../modals/CorteModal';
import DatabaseDeveloperPanel from '../DatabaseDeveloperPanel';
import { addPedidoToPrinter, addTenantToFirebase, deletePedidoFromPrinter, saveCompanyConfigInFirebase } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonAlert, IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { addOutline, calculatorOutline, closeCircleOutline, closeOutline, cloudUploadOutline, hardwareChipOutline, listOutline, lockClosedOutline, printOutline, refreshCircleOutline, restaurantOutline, shieldCheckmarkOutline } from 'ionicons/icons';

interface AdminPanelViewProps {
  adminViewOnlyCorte: any;
  checkoutReturnMode: any;
  companyConfig: any;
  configActiveTab: any;
  connectedBtDeviceName: any;
  corteTab: any;
  currentUser: any;
  handleDownloadCorteReport: any;
  handleDownloadPrecorteReport: any;
  handlePrintCorte: any;
  handlePrintPrecorte: any;
  handleResetAllSystems: any;
  handleResetSales: any;
  handleRevertAccountCancellation: any;
  handleRevertEntireComandaCancellation: any;
  handleRevertItemCancellation: any;
  history: any;
  inventory: any;
  isOnline: any;
  printerQueue: any;
  productCategories: any;
  products: any;
  renderMaterialHeader: any;
  renderUsersManagementPanel: any;
  selectedTenant: any;
  setAdminViewOnlyCorte: any;
  setAppMode: any;
  setBluetoothPrinterBarra: any;
  setBluetoothPrinterCocina: any;
  setBluetoothPrinterCuentas: any;
  setBluetoothTransportMode: any;
  setCheckoutReturnMode: any;
  setCompanyConfig: any;
  setConfigActiveTab: any;
  setCorteTab: any;
  setManageMenuTab: any;
  setMenuToastMessage: any;
  setPendingCancellationTarget: any;
  setSelectedTableGestion: any;
  setSelectedTenant: any;
  setShowAuthorizeCancellationModal: any;
  setShowBluetoothConfigModal: any;
  setShowCashMovementModal: any;
  setShowCorteModal: any;
  setShowMenuToast: any;
  setShowPrinterTemplateModal: any;
  setShowResetSalesConfirm: any;
  setSystemLocalWindowsAutoPrint: any;
  setSystemUseRawBt: any;
  setTicketBusinessName: any;
  setTicketDireccionFiscal: any;
  setTicketEmail: any;
  setTicketFooterMessage: any;
  setTicketGeminiApiKey: any;
  setTicketLugarExpedicion: any;
  setTicketRegimenFiscal: any;
  setTicketRequireInternalFolio: any;
  setTicketRfc: any;
  setTicketSucursal: any;
  setTicketTelefono: any;
  setWebsocketSyncLog: any;
  showCorteModal: any;
  showResetSalesConfirm: any;
  systemLocalWindowsAutoPrint: any;
  systemUseRawBt: any;
  tables: any;
  tenantPrinterConfig: any;
  ticketBusinessName: any;
  ticketDireccionFiscal: any;
  ticketEmail: any;
  ticketFooterMessage: any;
  ticketGeminiApiKey: any;
  ticketLugarExpedicion: any;
  ticketRegimenFiscal: any;
  ticketRequireInternalFolio: any;
  ticketRfc: any;
  ticketSucursal: any;
  ticketTelefono: any;
  triggerAppNotification: any;
  users: any;
  websocketSyncLog: any;
  cancelEntireComanda: any;
  cancelled: any;
  corteData: any;
  generateCorteTicketText: any;
  generatePrecorteTicketText: any;
  sanitizeBusinessName: any;
  sanitizeEmail: any;
  topSold: any;
  efectivoCount: any;
  setEfectivoCount: any;
  totalArqueo: any;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  adminViewOnlyCorte,
  checkoutReturnMode,
  companyConfig,
  configActiveTab,
  connectedBtDeviceName,
  corteTab,
  currentUser,
  handleDownloadCorteReport,
  handleDownloadPrecorteReport,
  handlePrintCorte,
  handlePrintPrecorte,
  handleResetAllSystems,
  handleResetSales,
  handleRevertAccountCancellation,
  handleRevertEntireComandaCancellation,
  handleRevertItemCancellation,
  history,
  inventory,
  isOnline,
  printerQueue,
  productCategories,
  products,
  renderMaterialHeader,
  renderUsersManagementPanel,
  selectedTenant,
  setAdminViewOnlyCorte,
  setAppMode,
  setBluetoothPrinterBarra,
  setBluetoothPrinterCocina,
  setBluetoothPrinterCuentas,
  setBluetoothTransportMode,
  setCheckoutReturnMode,
  setCompanyConfig,
  setConfigActiveTab,
  setCorteTab,
  setManageMenuTab,
  setMenuToastMessage,
  setPendingCancellationTarget,
  setSelectedTableGestion,
  setSelectedTenant,
  setShowAuthorizeCancellationModal,
  setShowBluetoothConfigModal,
  setShowCashMovementModal,
  setShowCorteModal,
  setShowMenuToast,
  setShowPrinterTemplateModal,
  setShowResetSalesConfirm,
  setSystemLocalWindowsAutoPrint,
  setSystemUseRawBt,
  setTicketBusinessName,
  setTicketDireccionFiscal,
  setTicketEmail,
  setTicketFooterMessage,
  setTicketGeminiApiKey,
  setTicketLugarExpedicion,
  setTicketRegimenFiscal,
  setTicketRequireInternalFolio,
  setTicketRfc,
  setTicketSucursal,
  setTicketTelefono,
  setWebsocketSyncLog,
  showCorteModal,
  showResetSalesConfirm,
  systemLocalWindowsAutoPrint,
  systemUseRawBt,
  tables,
  tenantPrinterConfig,
  ticketBusinessName,
  ticketDireccionFiscal,
  ticketEmail,
  ticketFooterMessage,
  ticketGeminiApiKey,
  ticketLugarExpedicion,
  ticketRegimenFiscal,
  ticketRequireInternalFolio,
  ticketRfc,
  ticketSucursal,
  ticketTelefono,
  triggerAppNotification,
  users,
  websocketSyncLog,
  cancelEntireComanda, cancelled, corteData, generateCorteTicketText, generatePrecorteTicketText, sanitizeBusinessName, sanitizeEmail, topSold,
  efectivoCount, setEfectivoCount, totalArqueo
}) => {
const pendingItemsList: any[] = [];
    tables.forEach((t) => {
      (t.comandas || []).forEach((c) => {
        (c.items || []).forEach((item) => {
          if (item.isPendingCancellation) {
            pendingItemsList.push({
              tableId: t.id,
              tableName: t.label,
              folio: c.folio,
              productId: item.product.id,
              name: item.product.name,
              plate: item.plate,
              quantity: item.quantity,
              reason: item.pendingCancellationReason || "No especificado",
              createdBy: c.createdBy,
              item,
            });
          }
        });
      });
    });

    const pendingComandasList: any[] = [];
    tables.forEach((t) => {
      (t.comandas || []).forEach((c) => {
        if (c.isPendingCancellation) {
          pendingComandasList.push({
            tableId: t.id,
            tableName: t.label,
            folio: c.folio,
            reason: c.pendingCancellationReason || "No especificado",
            createdBy: c.createdBy,
            timestamp: c.timestamp,
            itemsCount: (c.items || []).filter(it => !it.isCancelled).length,
            comanda: c,
          });
        }
      });
    });

    const pendingAccountsList = (history || []).filter(
      (h) => h.isPendingCancellation && h.status !== "cancelled"
    );

    const totalPendingCancellations =
      pendingItemsList.length +
      pendingComandasList.length +
      pendingAccountsList.length;

    return (
      <IonPage>
      {renderMaterialHeader({
        title: adminViewOnlyCorte ? "Corte del Día / Caja 📊" : "Panel Administrativo 2026",
        subtitle: `Administración de ${selectedTenant?.name || "Sucursal"}`,
        showBack: true,
        onBack: () => {
          const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
  setSelectedTableGestion(null);
}
setCheckoutReturnMode(null);
          setAdminViewOnlyCorte(false);
        }
      })}
        {!adminViewOnlyCorte && (
          <div className="px-4 py-2 flex flex-wrap gap-2 justify-center border-b border-slate-200">
            {[
              { id: "system", label: "Ajustes y Sistema", emoji: "⚙️" },
              { id: "corte", label: "Corte del Día / Caja", emoji: "🧾" },
              { id: "inventory", label: "Inventario", emoji: "📦" },
              { id: "database", label: "MySQL DB & IA", emoji: "🌐" },
              { id: "users", label: "Usuarios", emoji: "👥" },
              { id: "authorizations", label: "Autorizaciones", emoji: "🔒" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setConfigActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  configActiveTab === tab.id
                    ? "bg-slate-800 text-white shadow-lg scale-105"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.emoji} {tab.label}
                {tab.id === "authorizations" && totalPendingCancellations > 0 && (
                  <span className="bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                    {totalPendingCancellations}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >



          {configActiveTab === "inventory" && (
            <div className="space-y-6 max-w-4xl mx-auto py-4 text-center">
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IonIcon icon={listOutline} style={{ fontSize: "32px" }} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Administrar Inventario
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Ajustes de inventario inicial, movimientos y altas de insumos
                  (materia prima).
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
                  <button
                    onClick={() => setAppMode("inventory")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition duration-200 w-full sm:w-auto"
                  >
                    Ir a Inventario Base
                  </button>
                  <button
                    onClick={() => setAppMode("inventario-v2")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl transition duration-200 w-full sm:w-auto flex items-center justify-center gap-1.5"
                  >
                    <span>Ir a Inventario Formulario 2 📋</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {configActiveTab === "system" ? (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              {/* Cards container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Managing Menu */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                      <IonIcon
                        icon={restaurantOutline}
                        style={{ fontSize: "24px" }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Gestionar Carta y Menú
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Baja y alta de alimentos, bebidas y postres. Puedes
                      escanear cartas completas por foto usando la Inteligencia
                      Artificial.
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-100 mb-6">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {products.length} productos activos en catálogo
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAppMode("manage-menu");
                      setManageMenuTab(null);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-2xl transition duration-200 shadow-sm cursor-pointer"
                  >
                    Administrar Menú
                  </button>
                </div>

                {/* Card 2: Safe Reset */}
                <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                      <IonIcon
                        icon={closeCircleOutline}
                        style={{ fontSize: "24px" }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Restablecimiento Total
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Limpia toda la base de datos local y del servidor. Ideal
                      para abrir un nuevo restaurante con mesas vacías y menú
                      semilla reestablecido.
                    </p>

                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl font-medium mb-6">
                      <strong>Advertencia:</strong> Esta acción borrará todas
                      las comandas, historial de ventas y productos creados por
                      fotos permanentemente.
                    </div>
                  </div>
                  <button
                    onClick={handleResetAllSystems}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-2xl transition duration-200 cursor-pointer text-center"
                  >
                    Reiniciar de Fábrica
                  </button>
                </div>

                {/* Card 3: Reset Sales Mode */}
                <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                      <IonIcon
                        icon={refreshCircleOutline}
                        style={{ fontSize: "24px" }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Reiniciar Cortes de Caja
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Limpia las ventas, comandas e historial del día, dejando
                      los productos, menús y usuarios intactos. Ideal para el
                      fin de la jornada.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSales}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-2xl transition duration-200 cursor-pointer text-center"
                  >
                    Reiniciar Cortes y Cuentas
                  </button>
                </div>

                {/* Card 4: Printer Connection Test 🖨️ */}
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                      <IonIcon
                        icon={printOutline}
                        style={{ fontSize: "24px" }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Probar Impresora Local
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Envía un comando de prueba a la cola de impresión de Python para verificar la sincronización en tiempo real.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedTenant) {
                        triggerAppNotification("⚠️ Error", "Selecciona una sucursal primero.", "warning");
                        return;
                      }
                      try {
                        await addPedidoToPrinter(selectedTenant.id, {
                          folio: "TEST-" + Date.now().toString().slice(-6),
                          mesa: "PRUEBA 🖨️",
                          items: [{ nombre: "PRODUCTO DE PRUEBA", cantidad: 1, subtotal: 0 }],
                          tipo: "comanda",
                          total: 0,
                          isTest: true,
                          area: "cocina"
                        });
                        triggerAppNotification("🖨️ PRUEBA ENVIADA", "Revisa tu monitor de Python en Windows. Si no sale nada, verifica que tu TENANT_ID sea " + selectedTenant.id, "success");
                      } catch (err) {
                        console.error("Error sending test:", err);
                        triggerAppNotification("❌ Error", "No se pudo enviar la prueba.", "warning");
                      }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-2xl transition duration-200 cursor-pointer text-center"
                  >
                    Enviar Prueba de Impresión
                  </button>
                </div>

                {/* Card 5: Bluetooth Printer Configuration 📲 */}
                <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <IonIcon
                          icon={hardwareChipOutline}
                          style={{ fontSize: "24px" }}
                        />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${connectedBtDeviceName ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {connectedBtDeviceName ? `🟢 Conectado` : "⚪ Sin Conexión"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Impresoras Bluetooth
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      Busca, vincula y mapea tus impresoras Bluetooth para Caja/Cuentas, Cocina y Barra, e imprime páginas de prueba.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setBluetoothPrinterCuentas(localStorage.getItem("bluetooth_printer_cuentas") || "cuentas");
                        setBluetoothPrinterCocina(localStorage.getItem("bluetooth_printer_cocina") || "cocina");
                        setBluetoothPrinterBarra(localStorage.getItem("bluetooth_printer_barra") || "barra");
                        setBluetoothTransportMode(localStorage.getItem("bluetooth_transport_mode") || "rawbt");
                        setShowBluetoothConfigModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl transition duration-200 cursor-pointer text-center text-xs shadow-md border-none"
                    >
                      ⚙️ Formulario y Configuración Bluetooth
                    </button>
                  </div>
                </div>

                {/* CONFIGURACIÓN DE DATOS DE LA EMPRESA (TICKET PROFECO / SAT) */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 md:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
                        style={{
                          background: `${selectedTenant.accentColor}15`,
                          color: selectedTenant.accentColor,
                        }}
                      >
                        🏢
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">
                          Parámetros del Ticket y Datos de Venta
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          Define los datos que se imprimen en los tickets de
                          venta y corte de caja de la sucursal seleccionada.
                        </p>
                      </div>
                    </div>

                    <span
                      className="text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 shrink-0 self-start sm:self-center"
                      style={{ background: selectedTenant.accentColor }}
                    >
                      <span>⚙️</span> EDITANDO:{" "}
                      {selectedTenant.name
                        .replace("Sombrerudos ", "")
                        .toUpperCase()}
                    </span>
                  </div>

                  {/* Multitenant Notice */}
                  <div
                    className="p-4 rounded-2xl border text-xs"
                    style={{
                      background: `${selectedTenant.accentColor}08`,
                      borderColor: `${selectedTenant.accentColor}25`,
                      color: "#1e293b",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 mb-1.5 font-black uppercase text-[10.5px]"
                      style={{ color: selectedTenant.accentColor }}
                    >
                      <span>⚠️</span> CONTROL MULTI-TENANT ACTIVO
                    </div>
                    <p className="text-slate-650 leading-relaxed font-medium">
                      Los siguientes valores son **100% independientes** para
                      cada una de tus matrices y sucursales. Al cambiar de
                      matriz en la lista superior, estos campos se cargarán
                      automáticamente con los datos personalizados de la
                      respectiva base de datos de{" "}
                      <strong>{selectedTenant.name}</strong> sin mezclar de
                      ninguna manera tu información de facturación o tickets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Nombre Comercial / Razón Social *
                      </label>
                      <input
                        type="text"
                        value={ticketBusinessName}
                        onChange={(e) => setTicketBusinessName(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. Taquería El Pastorcito"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        RFC (Registro Federal de Contribuyentes)
                      </label>
                      <input
                        type="text"
                        value={ticketRfc}
                        onChange={(e) => setTicketRfc(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. XAXX010101000"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Régimen Fiscal (SAT México) 🇲🇽
                      </label>
                      <input
                        type="text"
                        value={ticketRegimenFiscal}
                        onChange={(e) => setTicketRegimenFiscal(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. 601 - General de Ley Personas Morales / 626 RESICO"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Dirección Fiscal (Calle, No., Col., Municipio)
                      </label>
                      <input
                        type="text"
                        value={ticketDireccionFiscal}
                        onChange={(e) => setTicketDireccionFiscal(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. Av. Azucenas #102, Col. Reforma"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Lugar de Expedición / Código Postal (SAT)
                      </label>
                      <input
                        type="text"
                        value={ticketLugarExpedicion}
                        onChange={(e) => setTicketLugarExpedicion(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. C.P. 68000, OAXACA, MEX"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Teléfono de Atención / Sucursal
                      </label>
                      <input
                        type="text"
                        value={ticketTelefono}
                        onChange={(e) => setTicketTelefono(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. 951 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Correo de Facturación / Atención a Clientes
                      </label>
                      <input
                        type="text"
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. facturacion@tacosroy.mx"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Sucursal / Ubicación en el Ticket
                      </label>
                      <input
                        type="text"
                        value={ticketSucursal}
                        onChange={(e) => setTicketSucursal(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. Sucursal Centro"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Mensaje del Pie de Ticket / Lema (Ej. "Vuelva pronto")
                      </label>
                      <input
                        type="text"
                        value={ticketFooterMessage}
                        onChange={(e) => setTicketFooterMessage(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ej. ¡Gracias por su visita! Vuelva pronto 🌮"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Clave de API Gemini (Para Carga Masiva de Menú e IA de
                        Voz) 🔑
                      </label>
                      <input
                        type="password"
                        value={ticketGeminiApiKey}
                        onChange={(e) => setTicketGeminiApiKey(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="AIzaSy... (Ingresa tu clave de Gemini API para que funcione en hosting)"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">
                        ⚠️ **Nota para Producción / Hosting:** Al estar en un
                        hosting estático (Firebase), la aplicación necesita que
                        configures tu propia clave de API aquí para que las
                        funciones inteligentes del analizador de menú corran
                        directo desde tu navegador.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-3 flex items-center justify-between">
                      <div className="pr-4">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 cursor-pointer">
                          <span>📋</span> Exigir Captura de Folio Interno por Comanda
                        </label>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Si está activado, el sistema solicitará capturar y confirmar el folio de comanda en esta sucursal al enviar el pedido. Si está desactivado, se enviará directo.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={ticketRequireInternalFolio}
                        onChange={(e) => setTicketRequireInternalFolio(e.target.checked)}
                        className="w-6 h-6 accent-indigo-600 rounded cursor-pointer shrink-0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTicketBusinessName(selectedTenant.name);
                        setTicketRfc(selectedTenant.rfc);
                        setTicketSucursal(selectedTenant.sucursalDefault);
                        setTicketFooterMessage(
                          `¡Gracias por su visita! Vuelva pronto 🌮 (${selectedTenant.ownerEmail})`,
                        );
                        setTicketGeminiApiKey(companyConfig.geminiApiKey || "");
                        setTicketRequireInternalFolio(selectedTenant.requireInternalFolio ?? true);
                        triggerAppNotification(
                          "⚡ Valores Sugeridos",
                          `Se han autocompletado los campos con los valores por defecto de: ${selectedTenant.name}`,
                          "info",
                        );
                      }}
                      className="text-[10px] font-extrabold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 self-start cursor-pointer underline decoration-dotted"
                    >
                      <span>🔄</span> Cargar parámetros sugeridos de matriz
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const cleanName = sanitizeBusinessName(ticketBusinessName.trim() || selectedTenant.name);
                          const cleanEmail = sanitizeEmail(ticketEmail.trim());
                          const updatedCfg = {
                            businessName: cleanName,
                            rfc: ticketRfc.trim() || selectedTenant.rfc,
                            sucursal: ticketSucursal.trim() || selectedTenant.sucursalDefault,
                            footerMessage: ticketFooterMessage.trim() || "¡Gracias por su visita! Vuelva pronto 🌮",
                            geminiApiKey: ticketGeminiApiKey.trim(),
                            regimenFiscal: ticketRegimenFiscal.trim(),
                            direccionFiscal: ticketDireccionFiscal.trim(),
                            lugarExpedicion: ticketLugarExpedicion.trim(),
                            telefono: ticketTelefono.trim(),
                            email: cleanEmail,
                            useRawBt: systemUseRawBt,
                            printerConfig: tenantPrinterConfig,
                            productCategories: productCategories,
                          };

                          await saveCompanyConfigInFirebase(selectedTenant.id, updatedCfg);

                          setCompanyConfig(updatedCfg);
                          try {
                            localStorage.setItem("company_config", JSON.stringify(updatedCfg));
                          } catch (e) {}

                          // Also update selectedTenant in tenants collection with geminiApiKey & requireInternalFolio & rfc
                          if (selectedTenant) {
                            const updatedTenant = {
                              ...selectedTenant,
                              name: ticketBusinessName.trim() || selectedTenant.name,
                              rfc: ticketRfc.trim() || selectedTenant.rfc,
                              sucursalDefault: ticketSucursal.trim() || selectedTenant.sucursalDefault,
                              geminiApiKey: ticketGeminiApiKey.trim(),
                              requireInternalFolio: ticketRequireInternalFolio,
                              regimenFiscal: ticketRegimenFiscal.trim(),
                              direccionFiscal: ticketDireccionFiscal.trim(),
                              lugarExpedicion: ticketLugarExpedicion.trim(),
                              telefono: ticketTelefono.trim(),
                              email: ticketEmail.trim(),
                            };
                            await addTenantToFirebase(updatedTenant);
                            setSelectedTenant(updatedTenant);
                          }

                          triggerAppNotification(
                            "🏢 Datos y API Key Guardados",
                            `Hemos sincronizado y guardado con éxito la configuración comercial y la Clave API de la IA de Gemini para: ${selectedTenant.name} ⭐🔑`,
                            "success",
                          );
                          setMenuToastMessage(
                            `Configuración de ${selectedTenant.name} actualizada con éxito y sincronizándose por WebSockets... ⚡`,
                          );
                          setShowMenuToast(true);
                        } catch (err: any) {
                          console.error("Error saving company config:", err);
                          triggerAppNotification(
                            "❌ Error al Guardar",
                            "No se pudo guardar la configuración: " + err.message,
                            "warning"
                          );
                        }
                      }}
                      className="text-white font-black text-xs py-3 px-6 rounded-2xl transition duration-200 cursor-pointer text-center uppercase tracking-wider border-none outline-none flex items-center justify-center gap-2 shadow-md hover:shadow-lg w-full sm:w-auto"
                      style={{ background: selectedTenant.accentColor }}
                    >
                      <span>💾</span> Guardar Datos para{" "}
                      {selectedTenant.name.replace("Sombrerudos ", "")}
                    </button>
                  </div>
                </div>

                {/* CONFIGURACIÓN DE IMPRESIÓN Y RAWBT BLUETOOTH */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 md:col-span-2 space-y-4 text-left">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                      🖨️
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">
                        Configuración de Impresión (Bluetooth / RAWBT)
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Establece si deseas imprimir localmente en Android usando la app RawBT o encolar las impresiones para el Sentinela de Windows.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="space-y-1 text-left">
                      <div className="font-extrabold text-sm text-slate-700 flex items-center gap-2">
                        📲 Usar Impresora Bluetooth (RAWBT para Android)
                      </div>
                      <p className="text-xs text-slate-500 max-w-xl">
                        Si habilitas esta opción, las impresiones se abrirán automáticamente mediante la aplicación RawBT (únicamente soportado en Android). Por defecto está <strong>deshabilitado</strong> para mandar las comandas, cuentas y cortes al <strong>Sentinela de Windows</strong> de forma automática.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={systemUseRawBt}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSystemUseRawBt(val);
                          localStorage.setItem("system_use_rawbt", val ? "true" : "false");
                          if (selectedTenant?.id) {
                            saveCompanyConfigInFirebase(selectedTenant.id, {
                              ...companyConfig,
                              useRawBt: val,
                            }).catch((err) => console.error("Error saving useRawBt:", err));
                          }
                          triggerAppNotification(
                            "⚙️ Configuración Actualizada",
                            val 
                              ? "Impresora Bluetooth (RawBT) habilitada para esta sucursal. 📲" 
                              : "Impresión Bluetooth desactivada. Los tickets se enviarán automáticamente al Sentinela de Windows. 🖨️",
                            "info"
                          );
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-4">
                    <div className="space-y-1 text-left">
                      <div className="font-extrabold text-sm text-slate-700 flex items-center gap-2">
                        🖨️ Auto-Impresión en Windows (localhost:3010)
                      </div>
                      <p className="text-xs text-slate-500 max-w-xl">
                        Si habilitas esta opción, esta terminal de Windows Chrome escuchará en tiempo real la cola de red y mandará automáticamente a imprimir las comandas y cuentas a tu Sentinela local (puerto 3010).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={systemLocalWindowsAutoPrint}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSystemLocalWindowsAutoPrint(val);
                          localStorage.setItem("system_local_windows_autoprint", val ? "true" : "false");
                          triggerAppNotification(
                            "⚙️ Configuración de Red Actualizada",
                            val 
                              ? "Auto-Impresión en Windows habilitada. Escuchando comandas y cuentas de red... 🖨️" 
                              : "Auto-Impresión desactivada. No se enviarán pedidos de la red de forma automática. 🛑",
                            "info"
                          );
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* ESCALA GESTOR CUENTAS block removed */}

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <div className="font-black text-sm text-indigo-900 flex items-center gap-2">
                        🎨 Diseñar Plantilla de Tickets GDI & Servicio Windows
                      </div>
                      <p className="text-xs text-indigo-700 max-w-xl">
                        Personaliza la fuente de Windows, tamaño de letra (pt), márgenes de tus tickets y descarga los archivos de instalación del Sentinela de Windows.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPrinterTemplateModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-md transition-all"
                    >
                      <span>🎨</span> Configurar Plantilla y Descargar Servicio
                    </button>
                  </div>
                </div>
              </div>

              {/* Operational status */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Estado del Sistema
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-800">
                      {tables.length}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Mesas Configuras
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-800">
                      {users.length}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Usuarios Registrados
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-slate-800">
                      {history.length}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Cuentas Procesadas
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div
                      className={`text-2xl font-bold ${isOnline ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isOnline ? "EN LÍNEA" : "SIN INTERNET"}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Base de Datos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : configActiveTab === "inventory" ? null : configActiveTab ===
            "database" ? (
            <DatabaseDeveloperPanel
              websocketSyncLog={websocketSyncLog}
              setWebsocketSyncLog={setWebsocketSyncLog}
              isOnline={isOnline}
              printerQueue={printerQueue}
              onDeletePedido={(id) => deletePedidoFromPrinter(selectedTenant!.id, id)}
              triggerAppNotification={(title, body, type) => {
                setMenuToastMessage(`🔔 [${title}] ${body}`);
                setShowMenuToast(true);
              }}
            />
          ) : configActiveTab === "users" ? (
            renderUsersManagementPanel()
          ) : configActiveTab === "authorizations" ? (
            <div className="space-y-6 max-w-5xl mx-auto py-4">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: "20px" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 m-0" style={{ fontFamily: "sans-serif" }}>Autorizaciones de Cancelación Pendientes</h3>
                    <p className="text-xs text-slate-500 m-0" style={{ fontFamily: "sans-serif" }}>Gestiona y aprueba solicitudes de cancelación de cuentas, comandas o productos</p>
                  </div>
                </div>

                {totalPendingCancellations === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200" style={{ fontFamily: "sans-serif" }}>
                    <span className="text-4xl">🎉</span>
                    <h4 className="text-sm font-bold text-slate-700 mt-2">¡Todo al día!</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">No hay solicitudes de cancelación pendientes de autorizar en este momento.</p>
                  </div>
                ) : (
                  <div className="space-y-6" style={{ fontFamily: "sans-serif" }}>
                    {/* 1. CLOSED ACCOUNTS */}
                    {pendingAccountsList.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
                          <span>🚫</span> Cuentas Cerradas ({pendingAccountsList.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingAccountsList.map((account) => (
                            <div key={account.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:border-rose-300 transition-all">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-black text-slate-700">FOLIO #{account.folio}</span>
                                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">Cuenta Cerrada</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2 font-semibold">
                                  Motivo: <span className="text-rose-700 font-bold">{account.pendingCancellationReason || "No especificado"}</span>
                                </p>
                                <div className="text-[11px] text-slate-500 space-y-0.5 mb-3 font-medium">
                                  <div>Total: <span className="font-bold text-slate-800">${account.total.toFixed(2)}</span></div>
                                  <div>Mesa: <span className="font-bold text-slate-800">{account.tableName || account.tableLabel}</span></div>
                                  <div>Atendido por: <span className="font-bold text-slate-800">{users.find(u => u.id === account.createdBy)?.name || account.createdBy || "Sin registrar"}</span></div>
                                  <div>Fecha: {new Date(account.createdAt).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <IonButton
                                  size="small"
                                  color="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingCancellationTarget({ type: 'account', id: account.id });
                                    setShowAuthorizeCancellationModal(true);
                                  }}
                                  className="font-bold text-xs"
                                  style={{ margin: 0, flex: 1 }}
                                >
                                  Autorizar
                                </IonButton>
                                <IonButton
                                  size="small"
                                  color="medium"
                                  fill="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRevertAccountCancellation(account.id);
                                  }}
                                  className="font-bold text-xs"
                                  style={{ margin: 0 }}
                                >
                                  Revertir
                                </IonButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. ENTIRE COMANDAS */}
                    {pendingComandasList.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                          <span>📋</span> Comandas Completas ({pendingComandasList.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingComandasList.map((item) => (
                            <div key={item.folio} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-black text-slate-700">COMANDA #{item.folio}</span>
                                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">Mesa {item.tableName}</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2 font-semibold">
                                  Motivo: <span className="text-amber-700 font-bold">{item.reason}</span>
                                </p>
                                <div className="text-[11px] text-slate-500 space-y-0.5 mb-3 font-medium">
                                  <div>Atendido por: <span className="font-bold text-slate-800">{item.createdBy?.name || "Sin registrar"}</span></div>
                                  <div>Platillos: <span className="font-bold text-slate-800">{item.itemsCount}</span></div>
                                  <div>Fecha: {new Date(item.timestamp).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <IonButton
                                  size="small"
                                  color="danger"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await cancelEntireComanda(item.folio, item.reason, currentUser!);
                                  }}
                                  className="font-bold text-xs"
                                  style={{ margin: 0, flex: 1 }}
                                >
                                  Autorizar
                                </IonButton>
                                <IonButton
                                  size="small"
                                  color="medium"
                                  fill="outline"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleRevertEntireComandaCancellation(item.tableId, item.comanda, item.folio);
                                  }}
                                  className="font-bold text-xs"
                                  style={{ margin: 0 }}
                                >
                                  Revertir
                                </IonButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. INDIVIDUAL ITEMS */}
                    {pendingItemsList.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                          <span>📦</span> Productos Individuales ({pendingItemsList.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingItemsList.map((p, idx) => (
                            <div key={`${p.folio}-${p.productId}-${p.plate}-${idx}`} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-black text-indigo-700">{p.name} (x{p.quantity})</span>
                                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-lg">Mesa {p.tableName}</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2 font-semibold">
                                  Motivo: <span className="text-indigo-700 font-bold">{p.reason}</span>
                                </p>
                                <div className="text-[11px] text-slate-500 space-y-0.5 mb-3 font-medium">
                                  <div>Comanda: <span className="font-bold text-slate-800">#{p.folio}</span></div>
                                  <div>Plato / Comensal: <span className="font-bold text-slate-800">{p.plate}</span></div>
                                  <div>Atendido por: <span className="font-bold text-slate-800">{p.createdBy?.name || "Sin registrar"}</span></div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <IonButton
                                  size="small"
                                  color="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingCancellationTarget({ type: 'item', id: p.tableId, items: [{ folio: p.folio, productId: p.productId, plate: p.plate }] });
                                    setShowAuthorizeCancellationModal(true);
                                  }}
                                  className="font-bold text-xs"
                                  style={{ margin: 0, flex: 1 }}
                                >
                                  Autorizar
                                </IonButton>
                                <IonButton
                                  size="small"
                                  color="medium"
                                  fill="outline"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const tbl = tables.find(t => t.id === p.tableId);
                                    await handleRevertItemCancellation(p.tableId, tbl, p.folio, p.productId, p.plate);
                                  }}
                                  className="font-bold text-xs"
                                  style={{ margin: 0 }}
                                >
                                  Revertir
                                </IonButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto py-4">
              {/* Notificación y Estado de Sincronización Real-Time */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-emerald-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>
                    🔄 Sincronizado en tiempo real por WebSockets de Base de
                    Datos
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 bg-white/50 px-2 py-0.5 rounded-lg border border-emerald-100 font-bold flex items-center gap-1">
                  <span>🔔</span> Notificaciones Activas
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl shadow-sm">
                  <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                    Ventas Cobradas (Neto)
                  </div>
                  <div className="text-3xl font-black text-emerald-800">
                    ${corteData.total.toFixed(2)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-2 font-medium">
                    Incluye propinas y descuentos aplicados
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl shadow-sm">
                  <div className="text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                    Ventas Brutas
                  </div>
                  <div className="text-3xl font-black text-indigo-800">
                    ${corteData.subtotal.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-600 mt-2 font-medium">
                    Suma de platillos servidos
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl shadow-sm">
                  <div className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                    Descuentos Cruzados
                  </div>
                  <div className="text-3xl font-black text-amber-800">
                    ${corteData.discount.toFixed(2)}
                  </div>
                  <div className="text-xs text-amber-600 mt-2 font-medium">
                    Cupones u ordenes especiales
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl shadow-sm">
                  <div className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
                    Propinas del Personal
                  </div>
                  <div className="text-3xl font-black text-blue-800">
                    ${corteData.tip.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    Para reparticion del pool
                  </div>
                </div>
              </div>

              {/* Bento core statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment methods & Top dishes */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Métodos de Recaudación
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
                          <span>EFECTIVO (Cash)</span>
                          <span className="font-bold text-slate-800">
                            ${corteData.cashSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${corteData.total > 0 ? (corteData.cashSales / corteData.total) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
                          <span>S. TARJETA (T. Débito / T. Crédito)</span>
                          <span className="font-bold text-slate-800">
                            ${corteData.cardSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${corteData.total > 0 ? (corteData.cardSales / corteData.total) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
                          <span>TRANSFERENCIA / SPEI</span>
                          <span className="font-bold text-slate-800">
                            ${corteData.transSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${corteData.total > 0 ? (corteData.transSales / corteData.total) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Top 5 - Alimentos y Artículos más Vendidos
                    </h3>
                    {corteData.topSold.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2 text-center">
                        No hay ventas consolidadas registradas hoy para cálculo
                        de populares.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {corteData.topSold.map((dish, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">
                                {i + 1}
                              </div>
                              <div className="text-xs font-bold text-slate-700">
                                {dish.name}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-800">
                                {dish.quantity} porciones
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                ${dish.subtotal.toFixed(2)} venta bruto
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Printer Simulator view */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Simulador Impresión{" "}
                        {corteTab === "corte"
                          ? "Corte Oficial"
                          : "Precorte Parcial"}
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">
                        ESC/POS 58mm
                      </span>
                    </div>

                    {/* Selector de Corte vs Precorte */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1">
                      <button
                        onClick={() => setCorteTab("corte")}
                        className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition ${corteTab === "corte" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        📊 Corte Oficial (Cierre)
                      </button>
                      <button
                        onClick={() => setCorteTab("precorte")}
                        className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition ${corteTab === "precorte" ? "bg-amber-500 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        ⚠️ Precorte En Turno
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 font-medium">
                      {corteTab === "corte"
                        ? "Estructura para el cierre final de turno de caja. Al imprimir oficial o reiniciar, se limpian las cifras del día."
                        : "El precorte es informativo y parcial. Te permite revisar el corte de caja actual sin reiniciar ni alterar las cuentas o comandas activas."}
                    </p>

                    <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-900 leading-tight max-h-72 overflow-y-auto no-scrollbar">
                      <pre>
                        {corteTab === "corte"
                          ? generateCorteTicketText()
                          : generatePrecorteTicketText()}
                      </pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={
                        corteTab === "corte"
                          ? handlePrintCorte
                          : handlePrintPrecorte
                      }
                      className={`font-semibold py-3 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${corteTab === "corte" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
                    >
                      <IonIcon icon={printOutline} />
                      {corteTab === "corte"
                        ? "Corte Físico 🖨️"
                        : "Precorte Físico 🖨️"}
                    </button>
                    <button
                      onClick={
                        corteTab === "corte"
                          ? handleDownloadCorteReport
                          : handleDownloadPrecorteReport
                      }
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <IonIcon icon={cloudUploadOutline} />
                      {corteTab === "corte"
                        ? "Descargar Ticket 📥"
                        : "Descargar Precorte 📥"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cancellations Log section, extremely important for the owner audit experience */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider">
                    Bitácora de Auditoría: Alimentos y Cuentas Cancelados
                  </h3>
                  <span className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-100">
                    {corteData.canceledItems.length} cancelaciones detectadas
                  </span>
                </div>

                {corteData.canceledItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Excelente: No se han registrado alimentos o cuentas
                    canceladas por personal el día de hoy.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                          <th className="pb-3">Mesa / Ubicación</th>
                          <th className="pb-3">Articulo / Concepto</th>
                          <th className="pb-3 text-center">Cant.</th>
                          <th className="pb-3">
                            Razón / Motivo de Cancelación
                          </th>
                          <th className="pb-3">Autorizado Por</th>
                          <th className="pb-3 text-right">Fecha / Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700">
                        {corteData.canceledItems.map((item, idx) => (
                          <tr
                            key={idx}
                            className="text-xs hover:bg-slate-50/50 transition duration-150"
                          >
                            <td className="py-3 font-semibold text-slate-800">
                              {item.tableName}
                            </td>
                            <td className="py-3 text-red-600 font-medium">
                              {item.productName}
                            </td>
                            <td className="py-3 text-center font-bold">
                              {item.qty}x
                            </td>
                            <td className="py-3 max-w-xs">{item.reason}</td>
                            <td className="py-3">
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                {item.user}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-400 text-[10px]">
                              {item.time.toLocaleDateString()}{" "}
                              {item.time.toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Movimientos de Caja */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Flujo de Efectivo (Entradas y Salidas)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Nómina, retiros, dotaciones, fondos de caja u otros.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCashMovementModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <IonIcon icon={addOutline} />
                    Registrar Movimiento
                  </button>
                </div>

                {corteData.totalCashMovements.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                    No hay movimientos externos de caja hoy.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {corteData.totalCashMovements.map(
                      (mov: any, idx: number) => (
                        <div
                          key={mov.id || idx}
                          className="flex justify-between items-center bg-slate-50 p-3 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${mov.type === "in" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                            >
                              <IonIcon
                                icon={
                                  mov.type === "in" ? addOutline : closeOutline
                                }
                              />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800 capitalize">
                                {mov.concept}
                              </div>
                              <div className="text-xs text-slate-500">
                                {mov.description || "Sin descripción"} •{" "}
                                {mov.user} •{" "}
                                {mov.date.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-sm font-black ${mov.type === "in" ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {mov.type === "in" ? "+" : "-"}$
                            {mov.amount.toFixed(2)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Card de Acción para Ejecutar el Corte de Caja Oficial */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                }}
                className="p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-700/50 mt-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                      <IonIcon
                        icon={lockClosedOutline}
                        style={{ fontSize: "24px" }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                        <span>Procedimiento de Corte de Caja Oficial 🔒</span>
                      </h3>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        Para finalizar el turno laborado, realice el arqueo del
                        efectivo físico contenido en el cajón y genere el
                        reporte oficial de cierre.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
                    <span>⚠️</span>
                    <span>
                      ADVERTENCIA: Completar este paso reiniciará el contador de
                      cuentas del día.
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setShowCorteModal(true)}
                    className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-sky-500/20 flex gap-2 items-center text-sm"
                  >
                    <IonIcon
                      icon={calculatorOutline}
                      style={{ fontSize: "16px" }}
                    />
                    Iniciar Arqueo y Corte 💵
                  </button>
                </div>
              </div>
            </div>
          )}

<CorteModal
          showCorteModal={showCorteModal}
          setShowCorteModal={setShowCorteModal}
          corteData={corteData}
          efectivoCount={efectivoCount}
          setEfectivoCount={setEfectivoCount}
          handleDownloadCorteReport={handleDownloadCorteReport}
          handlePrintCorte={handlePrintCorte}
          setShowResetSalesConfirm={setShowResetSalesConfirm}
          totalArqueo={totalArqueo}
        />
          <IonAlert
            isOpen={showResetSalesConfirm}
            onDidDismiss={() => setShowResetSalesConfirm(false)}
            header="Confirmar Corte Oficial"
            message="¿Está seguro de que desea finalizar el turno actual y realizar el corte oficial de caja? Esto reiniciará las ventas del día localmente."
            buttons={[
              {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => setShowResetSalesConfirm(false)
              },
              {
                text: 'Confirmar Corte',
                role: 'confirm',
                handler: async () => {
                  try {
                    await handleResetSales();
                    setShowCorteModal(false);
                    triggerAppNotification("Sistema", "Corte oficial registrado exitosamente", "success");
                  } catch (e) {
                    // ignore
                  }
                }
              }
            ]}
          />
        </IonContent>
      </IonPage>
    );
};
