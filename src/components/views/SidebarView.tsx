import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import { closeOutline, logoToUse, restaurantOutline } from 'ionicons/icons';

interface SidebarViewProps {
  logoToUse: any;
  adminViewOnlyCorte: any;
  appMode: any;
  checkoutReturnMode: any;
  configActiveTab: any;
  currentUser: any;
  customOwners: any;
  customers: any;
  expenses: any;
  handleLogout: any;
  isMasterAdmin: any;
  isOwnerUnlocked: any;
  restrictedOwnerKey: any;
  selectedTenant: any;
  setAdminViewOnlyCorte: any;
  setAppMode: any;
  setCheckoutReturnMode: any;
  setConfigActiveTab: any;
  setManageMenuTab: any;
  setSelectedTableGestion: any;
  setShowBluetoothConfigModal: any;
  setShowBranchSwitcherModal: any;
  setShowSidebar: any;
  showBluetoothConfigModal: any;
  showSidebar: any;
  suppliers: any;
  activeOwnerBranchesCount: any;
}

export const SidebarView: React.FC<SidebarViewProps> = ({
  adminViewOnlyCorte,
  appMode,
  checkoutReturnMode,
  configActiveTab,
  currentUser,
  customOwners,
  customers,
  expenses,
  handleLogout,
  isMasterAdmin,
  isOwnerUnlocked,
  restrictedOwnerKey,
  selectedTenant,
  setAdminViewOnlyCorte,
  setAppMode,
  setCheckoutReturnMode,
  setConfigActiveTab,
  setManageMenuTab,
  setSelectedTableGestion,
  setShowBluetoothConfigModal,
  setShowBranchSwitcherModal,
  setShowSidebar,
  showBluetoothConfigModal,
  showSidebar,
  suppliers,
  activeOwnerBranchesCount,
  logoToUse
}) => {
return (
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop with slide fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "#000",
                zIndex: 9990,
                cursor: "pointer",
              }}
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "280px",
                height: "100vh",
                backgroundColor: "#1e293b", // Slate 800
                color: "#f8fafc",
                boxShadow: "4px 0 25px rgba(0, 0, 0, 0.3)",
                zIndex: 9995,
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Header inside Menu */}
              <div
                style={{
                  padding: "20px 16px 16px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Fila superior: Logo + cocinet a la izquierda, botón de cerrar a la derecha */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      <IonIcon
                        icon={restaurantOutline}
                        style={{ fontSize: "16px", color: "white" }}
                      />
                    </div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "Caveat, cursive",
                        fontSize: "2.1rem",
                        lineHeight: 1,
                        background:
                          "linear-gradient(to right, #3b82f6, #a855f7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    >
                      cocinet
                    </h2>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSidebar(false)}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
                  </motion.button>
                </div>

                {/* Bloque medio: Tarjeta de sucursal que aprovecha todo el ancho disponible */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
                    border: `2px solid ${selectedTenant.accentColor || "#3b82f6"}`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                    width: "100%",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {(() => {
                    const ownerObj = customOwners.find(o => o.key === selectedTenant.ownerKey);
                    const logoToUse = ownerObj?.logo;
                    return logoToUse ? (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          backgroundColor: "white",
                          marginBottom: "8px"
                        }}
                      >
                        <img src={logoToUse} alt="Brand Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : null;
                  })()}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>🏢</span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "900",
                        background: selectedTenant.accentColor || "#3b82f6",
                        color: "#ffffff",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {selectedTenant.type || "MATRIZ"} ⭐
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "900",
                      color: "#ffffff",
                      textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      lineHeight: "1.3",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      display: "block",
                      marginBottom: "8px",
                      textAlign: "left",
                    }}
                  >
                    {selectedTenant.name}
                  </span>
                  {isOwnerUnlocked && (!restrictedOwnerKey || activeOwnerBranchesCount > 1) && (
                    <button
                      onClick={() => {
                        setShowBranchSwitcherModal(true);
                        setShowSidebar(false);
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.15)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        color: "#ffffff",
                        fontSize: "9px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "all 0.2s ease",
                      }}
                      title="Cambiar de Empresa / Sucursal 🚪🔄"
                    >
                      🚪 Cambiar Sucursal
                    </button>
                  )}
                </div>

                {/* Bloque inferior: Información de versión */}
                <div style={{ paddingLeft: "4px" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      display: "block",
                    }}
                  >
                    Pro Version 2026
                  </span>
                </div>
              </div>

              {/* Menu content list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
                {/* CATÁLOGOS SECTION */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "#64748b",
                      textTransform: "uppercase",
                      paddingLeft: "12px",
                      marginBottom: "8px",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Catálogos
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {currentUser?.role !== "mesero" && (
                      <>
                        {(isMasterAdmin || isOwnerUnlocked || currentUser?.role === "admin" || currentUser?.role === "sistemas" || currentUser?.id.endsWith("-sistemas")) && (
                          <button
                            onClick={() => {
                              setAppMode("manage-menu");
                              setManageMenuTab(null);
                              setShowSidebar(false);
                            }}
                            className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                              appMode === "manage-menu"
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                                : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-base">
                              🏷️
                            </span>
                            <span>Productos</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setAppMode("suppliers");
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "suppliers"
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-base">
                            🤝
                          </span>
                          <span>Proveedores</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setAppMode("customers");
                        setShowSidebar(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                        appMode === "customers"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]"
                          : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-base">
                        👥
                      </span>
                      <span>Clientes</span>
                    </button>
                  </div>
                </div>

                {/* OPERACIONES SECTION */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "#64748b",
                      textTransform: "uppercase",
                      paddingLeft: "12px",
                      marginBottom: "8px",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Operaciones
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {currentUser?.role !== "mesero" && (
                      <>
                        <button
                          onClick={() => {
                            setAppMode("corte-tabla");
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "corte-tabla"
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-base">
                            📊
                          </span>
                          <span>Cortes y Turnos de Caja</span>
                        </button>

                        {!["cajero", "mesero"].includes(currentUser?.role || "") && (
                          <button
                            onClick={() => {
                              setAppMode("corte-tabla-2");
                              setShowSidebar(false);
                            }}
                            className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                              appMode === "corte-tabla-2"
                                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20 scale-[1.02]"
                                : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-base">
                              📑
                            </span>
                            <span>Historial de Cortes 2 (Folio Cuentas)</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setAppMode("expenses");
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "expenses"
                              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-base">
                            💸
                          </span>
                          <span>Gastos (Egresos)</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        try {
                          localStorage.setItem("cocinet_preferred_tables_view", "floorplan");
                        } catch (e) {}
                        setAppMode("floorplan");
                        setSelectedTableGestion(null);
                        setCheckoutReturnMode(null);
                        setShowSidebar(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                        appMode === "floorplan"
                          ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md scale-[1.02]"
                          : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-500/10 text-base">
                        🍽️
                      </span>
                      <span>Mapa de Mesas</span>
                    </button>
                    <button
                      onClick={() => {
                        try {
                          localStorage.setItem("cocinet_preferred_tables_view", "gestion_cuentas");
                        } catch (e) {}
                        setAppMode("gestion_cuentas");
                        setSelectedTableGestion(null);
                        setCheckoutReturnMode(null);
                        setShowSidebar(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 mt-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                        appMode === "gestion_cuentas"
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md scale-[1.02]"
                          : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-base">
                        💻
                      </span>
                      <span>Gestión de Cuentas</span>
                    </button>
                  </div>
                </div>

                {currentUser?.role !== "mesero" && currentUser?.role !== "cajero" && (
                  <>

                    {/* REPORTES SECTION */}
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: "#64748b",
                          textTransform: "uppercase",
                          paddingLeft: "12px",
                          marginBottom: "8px",
                          letterSpacing: "1.5px",
                        }}
                      >
                        Reportes
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setAppMode("reports");
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "reports"
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-base">
                            📈
                          </span>
                          <span>Estadísticas y Reportes</span>
                        </button>

                        <button
                          onClick={() => {
                            setAppMode("reporte-movimientos");
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "reporte-movimientos"
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-base">
                            🔄
                          </span>
                          <span>Reporte de Movimientos</span>
                        </button>
                      </div>
                    </div>

                    {/* CONFIGURACIÓN SECTION */}
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: "#64748b",
                          textTransform: "uppercase",
                          paddingLeft: "12px",
                          marginBottom: "8px",
                          letterSpacing: "1.5px",
                        }}
                      >
                        Configuración
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setAppMode("admin");
                            setConfigActiveTab("system");
                            setAdminViewOnlyCorte(false);
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "admin" &&
                            configActiveTab === "system" &&
                            !adminViewOnlyCorte
                              ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-500/10 text-base">
                            ⚙️
                          </span>
                          <span>Configuración de Sistema</span>
                        </button>
                        <button
                          onClick={() => {
                            setAppMode("admin");
                            setConfigActiveTab("bluetooth");
                            setAdminViewOnlyCorte(false);
                            setShowBluetoothConfigModal(true);
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            (appMode === "admin" && configActiveTab === "bluetooth") || showBluetoothConfigModal
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-base">
                            📲
                          </span>
                          <span>Configura Impresoras Bluetooth</span>
                        </button>
                        <button
                          onClick={() => {
                            setAppMode("admin");
                            setConfigActiveTab("database");
                            setAdminViewOnlyCorte(false);
                            setShowSidebar(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-left ${
                            appMode === "admin" && configActiveTab === "database"
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md scale-[1.02]"
                              : "text-slate-300 bg-slate-800/20 hover:bg-slate-700/40 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-base">
                            🔌
                          </span>
                          <span>Sincronización MySQL & IA</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status / Footer of Sidebar with Empresa and Usuario controls */}
              <div
                style={{
                  padding: "16px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "#0f172a", // Slate-900 / Dark
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* User profile details */}
                {currentUser && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(15, 23, 42, 0.85)",
                      padding: "8px",
                      borderRadius: "12px",
                      border: "1px solid #1e293b",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>👤</span>
                      <div style={{ textAlign: "left" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "10px",
                            fontWeight: "900",
                            textTransform: "uppercase",
                            color: "#fbbf24",
                            lineHeight: "1",
                          }}
                        >
                          {currentUser.role === "admin"
                            ? "Administrador"
                            : currentUser.role === "cajero"
                              ? "Cajero"
                              : "Mesero"}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0 0",
                            fontSize: "11px",
                            fontWeight: "800",
                            color: "#f1f5f9",
                          }}
                        >
                          {currentUser.name}
                        </p>
                      </div>
                    </div>
                    {/* Logout button for changing user profile 👤🔄 */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowSidebar(false);
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#451a03",
                        border: "1px solid rgba(180, 83, 9, 0.5)",
                        color: "#fbbf24",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      🚪
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
};
