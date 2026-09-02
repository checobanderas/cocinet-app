import { PrinterMode } from '../../utils/printer';
import React, { useState } from 'react';
import { IonModal } from '@ionic/react';
import { ProductCategorySetting, AreaPrinterSetting } from '../../utils/appHelpers';

interface BluetoothConfigModalProps {
  AreaPrinterSetting: any;
  tenantName: string;
  showBluetoothConfigModal: boolean;
  setShowBluetoothConfigModal: (v: boolean) => void;
  productCategories: ProductCategorySetting[];
  setProductCategories: React.Dispatch<React.SetStateAction<ProductCategorySetting[]>>;
  tenantPrinterConfig: Record<string, AreaPrinterSetting>;
  setTenantPrinterConfig: React.Dispatch<React.SetStateAction<Record<string, AreaPrinterSetting>>>;
  triggerAppNotification: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  activeBtConnections: any;
  availableWindowsPrinters: any;
  fetchWindowsPrinters: any;
  handleSaveTenantPrinters: any;
  handleScanBluetoothDevice: any;
  handleTestPrinter: any;
  isScanningBt: any;
  printers: any;
}

export const BluetoothConfigModal: React.FC<BluetoothConfigModalProps> = ({
  tenantName,
  showBluetoothConfigModal,
  setShowBluetoothConfigModal,
  productCategories,
  setProductCategories,
  tenantPrinterConfig,
  setTenantPrinterConfig,
  triggerAppNotification,
  activeBtConnections,
  availableWindowsPrinters,
  fetchWindowsPrinters,
  handleSaveTenantPrinters,
  handleScanBluetoothDevice,
  handleTestPrinter,
  isScanningBt,
}) => {
  const [newAreaName, setNewAreaName] = useState<string>('');
  const [newAreaEmoji, setNewAreaEmoji] = useState<string>('');
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatEmoji, setNewCatEmoji] = useState<string>('');
  const [newCatDest, setNewCatDest] = useState<string>('cocina');
  const [configModalTab, setConfigModalTab] = useState<'printers' | 'categories'>('printers');

  const updateAreaConfig = (areaKey: string, key: keyof AreaPrinterSetting, val: any) => {
    setTenantPrinterConfig((prev) => {
      const current = prev[areaKey] || {
        id: areaKey,
        name: areaKey,
        mode: "windows",
        printerName: areaKey,
        windowsPort: "3010",
      };
      return {
        ...prev,
        [areaKey]: {
          ...current,
          [key]: val,
        },
      };
    });
  };

  const handleAddArea = () => {
    if (!newAreaName.trim()) {
      triggerAppNotification("⚠️ Nombre Requerido", "Ingresa un nombre para la nueva área (ej. Comal).", "warning");
      return;
    }
    const key = newAreaName.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    if (tenantPrinterConfig[key]) {
      triggerAppNotification("⚠️ Área Existente", "Ya existe un área de impresión con este nombre.", "warning");
      return;
    }
    const newSetting: AreaPrinterSetting = {
      id: key,
      name: newAreaName.trim(),
      emoji: newAreaEmoji.trim() || "🖨️",
      mode: "windows",
      printerName: key,
      windowsPort: "3010",
      isCustom: true,
    };
    setTenantPrinterConfig((prev) => ({ ...prev, [key]: newSetting }));
    setNewAreaName("");
    setNewAreaEmoji("");
    triggerAppNotification("✅ Área Creada", `Área de impresión "${newAreaName.trim()} ${newAreaEmoji}" agregada.`, "success");
  };

  const handleDeleteArea = (key: string) => {
    setTenantPrinterConfig((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    triggerAppNotification("🗑️ Área Eliminada", "Se eliminó el área personalizada.", "info");
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      triggerAppNotification("⚠️ Nombre Requerido", "Ingresa un nombre para la nueva categoría (ej. Comal).", "warning");
      return;
    }
    const id = newCatName.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    if (productCategories.some((c) => c.id === id)) {
      triggerAppNotification("⚠️ Categoría Existente", "Ya existe una categoría con este nombre.", "warning");
      return;
    }
    const newCat: ProductCategorySetting = {
      id,
      name: newCatName.trim(),
      emoji: newCatEmoji.trim() || "🍽️",
      destination: newCatDest || "cocina",
    };
    setProductCategories((prev) => [...prev, newCat]);
    setNewCatName("");
    setNewCatEmoji("");
    triggerAppNotification("✅ Categoría Creada", `Categoría "${newCatName.trim()} ${newCatEmoji}" creada exitosamente.`, "success");
  };

  const handleDeleteCategory = (catId: string) => {
    if (["food", "drinks", "desserts"].includes(catId)) {
      triggerAppNotification("⚠️ Categoría por Defecto", "Las categorías principales no se pueden eliminar.", "warning");
      return;
    }
    setProductCategories((prev) => prev.filter((c) => c.id !== catId));
    triggerAppNotification("🗑️ Categoría Eliminada", "Categoría personalizada eliminada.", "info");
  };

  const activeAreaKeys = Object.keys(tenantPrinterConfig);

  return (
    <IonModal
      isOpen={showBluetoothConfigModal}
      onDidDismiss={() => setShowBluetoothConfigModal(false)}
      style={{
        "--height": "100%",
        "--max-height": "100%",
        "--width": "100%",
        "--max-width": "100%",
        "--border-radius": "0px",
      }}
    >
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Top Navbar Pantalla Completa */}
        <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowBluetoothConfigModal(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer"
            >
              <span>←</span>
              <span>Volver</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center text-white text-xl font-black shadow-inner">
                🖨️
              </div>
              <div>
                <h1 className="text-base font-black text-white m-0 tracking-tight">
                  Configuración de Impresoras y Puntos de Venta
                </h1>
                <p className="text-xs font-bold text-slate-400 m-0 flex items-center gap-1.5 mt-0.5">
                  <span>Sucursal Activa:</span>
                  <span className="bg-indigo-900/90 text-indigo-200 border border-indigo-500/30 px-2.5 py-0.5 rounded-md font-black">
                    {tenantName}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                handleSaveTenantPrinters(tenantPrinterConfig, productCategories);
                setShowBluetoothConfigModal(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>💾</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </header>

        {/* Contenedor Principal Amplio */}
        <main className="flex-1 overflow-y-auto max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 pb-28">
          {/* Selector de Pestañas Grande */}
          <div className="flex bg-slate-200 p-1.5 rounded-2xl gap-2 text-xs font-black shadow-inner">
            <button
              type="button"
              onClick={() => setConfigModalTab("printers")}
              className={`flex-1 py-3 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                configModalTab === "printers"
                  ? "bg-white text-indigo-700 shadow-md font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="text-base">🖨️</span>
              <span className="text-sm font-black">Áreas e Impresoras Térmicas</span>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {activeAreaKeys.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setConfigModalTab("categories")}
              className={`flex-1 py-3 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                configModalTab === "categories"
                  ? "bg-white text-indigo-700 shadow-md font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="text-base">🏷️</span>
              <span className="text-sm font-black">Categorías de Menú y Enrutamiento</span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {productCategories.length}
              </span>
            </button>
          </div>

          {/* TAB 1: IMPRESORAS Y ÁREAS */}
          {configModalTab === "printers" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-slate-700 shadow-2xs">
                <div className="font-extrabold text-blue-900 flex items-center gap-2 text-sm">
                  <span>ℹ️ Control de Impresión por Sucursal</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold m-0 mt-1">
                  Configura si esta sucursal imprime comandas en Cocina y Barra. Las cuentas siempre permanecen activas. Puedes conectar impresoras locales de Windows (Centinela puerto 3010) o impresoras Bluetooth directas.
                </p>
              </div>

              {/* Grid de Áreas en 2 Columnas para Pantalla Completa */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeAreaKeys.map((areaKey) => {
                  const cfg = tenantPrinterConfig[areaKey] || { id: areaKey, name: areaKey, mode: "windows", printerName: areaKey, windowsPort: "3010" };
                  const areaTitle = `${cfg.emoji || "🖨️"} ${cfg.name || areaKey.toUpperCase()}`;
                  const isCuentas = areaKey === "cuentas";
                  const isEnabled = isCuentas || cfg.mode !== "disabled";

                  return (
                    <div
                      key={areaKey}
                      className={`border rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between ${
                        isEnabled
                          ? "bg-white border-slate-300 shadow-sm hover:shadow-md"
                          : "bg-slate-50 border-slate-200 opacity-75"
                      }`}
                    >
                      <div>
                        {/* Header de la tarjeta */}
                        <div className="flex items-center justify-between border-b pb-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-wide">
                              {areaTitle}
                            </span>
                            {isCuentas ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-md">
                                🔒 Siempre Activo (Cobro)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const nextMode = cfg.mode === "disabled" ? "windows" : "disabled";
                                  updateAreaConfig(areaKey, "mode", nextMode);
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                                  isEnabled
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                    : "bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300"
                                }`}
                              >
                                <span>{isEnabled ? "🟢 Habilitada (ON)" : "⚪ Desactivada (OFF)"}</span>
                              </button>
                            )}
                            {cfg.isCustom && (
                              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Personalizada
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isEnabled && (
                              <button
                                type="button"
                                onClick={() => handleTestPrinter(areaKey as any, cfg.printerName)}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                              >
                                <span>📄</span>
                                <span>Probar</span>
                              </button>
                            )}
                            {cfg.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteArea(areaKey)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
                                title="Eliminar Área"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Contenido si está Desactivada */}
                        {!isEnabled ? (
                          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 font-semibold flex items-center justify-between">
                            <span>🚫 Comandas de {cfg.name} desactivadas para esta sucursal (no se enviarán tickets).</span>
                            <button
                              type="button"
                              onClick={() => updateAreaConfig(areaKey, "mode", "windows")}
                              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                            >
                              Habilitar
                            </button>
                          </div>
                        ) : (
                          /* Contenido si está Habilitada */
                          <div className="space-y-4 text-xs font-bold">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-slate-600 uppercase mb-1 font-bold">
                                  Tipo de Conexión:
                                </label>
                                <select
                                  value={cfg.mode === "disabled" ? "windows" : cfg.mode}
                                  onChange={(e) => updateAreaConfig(areaKey, "mode", e.target.value as PrinterMode)}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                                >
                                  <option value="windows">🖥️ Puerto de Windows (Sentinel / USB)</option>
                                  <option value="bluetooth">📱 Bluetooth Directo (Nativo GATT)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-600 uppercase mb-1 font-bold">
                                  {cfg.mode === "bluetooth" ? "Dispositivo Bluetooth:" : "Impresora en Windows:"}
                                </label>
                                {cfg.mode !== "bluetooth" && availableWindowsPrinters && availableWindowsPrinters.length > 0 ? (
                                  <select
                                    value={cfg.printerName}
                                    onChange={(e) => updateAreaConfig(areaKey, "printerName", e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                                  >
                                    <option value="">-- Seleccionar Impresora Detectada --</option>
                                    {cfg.printerName && !availableWindowsPrinters.includes(cfg.printerName) && (
                                      <option value={cfg.printerName}>{cfg.printerName} (Actual)</option>
                                    )}
                                    {availableWindowsPrinters.map((p: string) => (
                                      <option key={p} value={p}>{p}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={cfg.printerName}
                                    onChange={(e) => updateAreaConfig(areaKey, "printerName", e.target.value)}
                                    placeholder={`Ej. ${areaKey}`}
                                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Controles para Windows (Puerto y Botón Buscar) */}
                            {cfg.mode !== "bluetooth" && (
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-600 font-bold">Puerto Local:</span>
                                  <input
                                    type="text"
                                    value={cfg.windowsPort || "3010"}
                                    onChange={(e) => updateAreaConfig(areaKey, "windowsPort", e.target.value.replace(/\D/g, ""))}
                                    placeholder="3010"
                                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-black text-slate-800 text-xs"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => fetchWindowsPrinters(cfg.windowsPort || "3010")}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                >
                                  <span>🔄</span>
                                  <span>Buscar Impresoras</span>
                                </button>
                              </div>
                            )}

                            {/* Controles para Bluetooth Directo */}
                            {cfg.mode === "bluetooth" && (
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                <div className="flex items-center gap-1.5">
                                  {activeBtConnections && activeBtConnections[areaKey] ? (
                                    <span className="text-emerald-600 font-black flex items-center gap-1 text-xs">
                                      🟢 Vinculado {cfg.printerName ? `(${cfg.printerName})` : ""}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-bold flex items-center gap-1 text-xs">
                                      🔴 No conectado {cfg.printerName ? `(${cfg.printerName})` : ""}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleScanBluetoothDevice(areaKey as any)}
                                  disabled={isScanningBt}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>🔍</span>
                                  <span>Vincular Bluetooth</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Crear Nueva Área */}
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 space-y-3">
                <span className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                  <span>➕</span>
                  <span>Agregar Nueva Área de Impresión Personalizada (ej. Comal 🫓, Parrilla 🔥)</span>
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={newAreaEmoji}
                    onChange={(e) => setNewAreaEmoji(e.target.value)}
                    placeholder="🫓 Emoji"
                    className="w-full sm:w-20 bg-white border border-indigo-200 rounded-xl p-2.5 text-center text-sm font-black text-slate-800"
                  />
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="Nombre del Área (ej. Comal, Parrilla, Postres)"
                    className="flex-1 w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    Crear Área
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORÍAS */}
          {configModalTab === "categories" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-xs text-slate-700 shadow-2xs">
                <div className="font-extrabold text-amber-900 flex items-center gap-2 text-sm">
                  <span>🏷️ Enrutamiento de Categorías hacia Áreas de Impresión</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold m-0 mt-1">
                  Asigna a qué impresora debe viajar cada categoría de productos cuando los meseros mandan comanda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {productCategories.map((cat) => (
                  <div key={cat.id} className="border border-slate-200 rounded-2xl p-3.5 bg-white flex items-center justify-between shadow-2xs gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl bg-slate-100 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 shadow-2xs">
                        {cat.emoji || "🍽️"}
                      </span>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Área: {tenantPrinterConfig[cat.destination]?.name || cat.destination}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={cat.destination}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductCategories((prev) =>
                            prev.map((c) => (c.id === cat.id ? { ...c, destination: val } : c))
                          );
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        {activeAreaKeys.map((areaKey) => (
                          <option key={areaKey} value={areaKey}>
                            {tenantPrinterConfig[areaKey]?.emoji || "🖨️"} {tenantPrinterConfig[areaKey]?.name || areaKey}
                          </option>
                        ))}
                      </select>

                      {!["food", "drinks", "desserts"].includes(cat.id) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-2 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          title="Eliminar Categoría"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario Crear Nueva Categoría */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3 text-xs">
                <span className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                  <span>➕</span>
                  <span>Agregar Nueva Categoría de Producto</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    placeholder="🫓 Emoji"
                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-center text-xs font-black text-slate-800"
                  />
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nombre Categoría (ej. Comal)"
                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  />
                  <select
                    value={newCatDest}
                    onChange={(e) => setNewCatDest(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {activeAreaKeys.map((areaKey) => (
                      <option key={areaKey} value={areaKey}>
                        {tenantPrinterConfig[areaKey]?.emoji || "🖨️"} {tenantPrinterConfig[areaKey]?.name || areaKey}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  ➕ Crear Categoría de Producto
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer Barra Flotante de Guardado */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 z-30 shadow-2xl flex items-center justify-between">
          <div className="text-xs text-slate-500 font-bold hidden sm:block">
            🏢 Guardando configuración para <strong className="text-slate-900">{tenantName}</strong>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowBluetoothConfigModal(false)}
              className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveTenantPrinters(tenantPrinterConfig, productCategories);
                setShowBluetoothConfigModal(false);
              }}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>Guardar Configuración de {tenantName}</span>
            </button>
          </div>
        </footer>
      </div>
    </IonModal>
  );
};
