import { PrinterMode } from '../../utils/printer';
import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
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
  activeBtConnections, availableWindowsPrinters, fetchWindowsPrinters, handleSaveTenantPrinters, handleScanBluetoothDevice, handleTestPrinter, isScanningBt, printers,
  AreaPrinterSetting
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
          "--height": "auto",
          "--max-height": "94vh",
          "--width": "100%",
          "--max-width": "720px",
          "--border-radius": "24px",
        }}
      >
        <div className="p-6 bg-white space-y-5 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xl font-black shadow-sm">
                🖨️
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 m-0">Configuración de Impresoras y Categorías</h2>
                <p className="text-xs font-bold text-indigo-600 m-0 flex items-center gap-1 mt-0.5">
                  <span>🏢 Empresa / Inquilino:</span>
                  <span className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-black">{tenantName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBluetoothConfigModal(false)}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs font-black">
            <button
              type="button"
              onClick={() => setConfigModalTab("printers")}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                configModalTab === "printers" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>🖨️ Áreas e Impresoras</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeAreaKeys.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setConfigModalTab("categories")}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                configModalTab === "categories" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>🏷️ Categorías y Emojis</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {productCategories.length}
              </span>
            </button>
          </div>

          {/* TAB 1: IMPRESORAS Y ÁREAS */}
          {configModalTab === "printers" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 text-xs text-slate-700 space-y-1">
                <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <span>🔀 Impresoras Mixtas y Pitidos de Atención (4 Beeps)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold m-0">
                  Asigna el modo de impresión (Windows, Bluetooth Nativo o RawBT) a cada área. Las impresoras Bluetooth emitirán 4 pitidos para alertar al personal.
                </p>
              </div>

              {/* Lista de Áreas */}
              <div className="space-y-3">
                {activeAreaKeys.map((areaKey) => {
                  const cfg = tenantPrinterConfig[areaKey] || { id: areaKey, name: areaKey, mode: "windows", printerName: areaKey, windowsPort: "3010" };
                  const areaTitle = `${cfg.emoji || "🖨️"} ${cfg.name || areaKey.toUpperCase()}`;

                  return (
                    <div key={areaKey} className="border rounded-2xl p-4 space-y-3 bg-slate-50/70 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            {areaTitle}
                          </span>
                          {cfg.isCustom && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Personalizada
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTestPrinter(areaKey as any, cfg.printerName)}
                            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          >
                            📄 Probar
                          </button>
                          {cfg.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteArea(areaKey)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-2.5 py-1 rounded-xl text-xs transition cursor-pointer"
                              title="Eliminar Área"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
                        <div>
                          <label className="block text-[11px] text-slate-600 uppercase mb-1">
                            Tipo de Conexión:
                          </label>
                          <select
                            value={cfg.mode}
                            onChange={(e) => updateAreaConfig(areaKey, "mode", e.target.value as PrinterMode)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                          >
                            <option value="windows">🖥️ Puerto de Windows (Sentinel)</option>
                            <option value="bluetooth">📱 Bluetooth Directo (Nativo GATT)</option>
                            <option value="rawbt">📲 App RawBT (Android Intent)</option>
                            <option value="disabled">🚫 Deshabilitado (No imprimir)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 uppercase mb-1">
                            {cfg.mode === "windows" ? "Nombre / Impresora en Windows:" : "Nombre / Dispositivo Bluetooth:"}
                          </label>
                          {cfg.mode === "windows" && availableWindowsPrinters.length > 0 ? (
                            <select
                              value={cfg.printerName}
                              onChange={(e) => updateAreaConfig(areaKey, "printerName", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                            >
                              <option value="">-- Seleccionar Impresora --</option>
                              {cfg.printerName && !availableWindowsPrinters.includes(cfg.printerName) && (
                                <option value={cfg.printerName}>{cfg.printerName} (Actual)</option>
                              )}
                              {availableWindowsPrinters.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={cfg.printerName}
                              onChange={(e) => updateAreaConfig(areaKey, "printerName", e.target.value)}
                              placeholder={`Ej. Impresora ${areaKey}`}
                              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                            />
                          )}
                        </div>
                      </div>

                      {cfg.mode === "windows" && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs font-bold">
                          <span className="text-[11px] text-slate-600">Puerto del Sentinel en Windows:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cfg.windowsPort || "3010"}
                              onChange={(e) => updateAreaConfig(areaKey, "windowsPort", e.target.value.replace(/\D/g, ""))}
                              placeholder="3010"
                              className="w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono font-black text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={fetchWindowsPrinters}
                              className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg font-bold hover:bg-blue-100 cursor-pointer"
                            >
                              🔄 Buscar Impresoras
                            </button>
                          </div>
                        </div>
                      )}

                      {cfg.mode === "bluetooth" && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            {activeBtConnections[areaKey] ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                🟢 Conectado por Bluetooth {cfg.printerName ? `(${cfg.printerName})` : ""}
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                🔴 No vinculado {cfg.printerName ? `(${cfg.printerName})` : ""}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleScanBluetoothDevice(areaKey as any)}
                            disabled={isScanningBt}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            🔍 Buscar y Vincular BT
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Formulario Crear Nueva Área de Impresión */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                  ➕ Agregar Nueva Área de Impresión (ej. Comal 🫓)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAreaEmoji}
                    onChange={(e) => setNewAreaEmoji(e.target.value)}
                    placeholder="🫓"
                    className="w-12 bg-white border border-indigo-200 rounded-xl p-2 text-center text-sm font-black text-slate-800"
                    title="Emoji"
                  />
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="Nombre del Área (ej. Comal, Parrilla, Postres)"
                    className="flex-1 bg-white border border-indigo-200 rounded-xl p-2 text-xs font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    Crear Área
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORÍAS DE PRODUCTOS */}
          {configModalTab === "categories" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 text-xs text-slate-700 space-y-1">
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <span>🏷️ Categorías de Menú y Puntos de Impresión</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold m-0">
                  Crea categorías dinámicas para tus productos (ej. Comal 🫓) con su emoji y conéctalas con su área de impresión correspondiente.
                </p>
              </div>

              {/* Lista de Categorías */}
              <div className="space-y-2.5">
                {productCategories.map((cat) => (
                  <div key={cat.id} className="border border-slate-200 rounded-2xl p-3 bg-white flex items-center justify-between shadow-2xs gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl bg-slate-100 w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 shadow-2xs">
                        {cat.emoji || "🍽️"}
                      </span>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Imprime en: {tenantPrinterConfig[cat.destination]?.name || cat.destination}
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
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <span className="font-extrabold text-amber-900 flex items-center gap-1">
                  ➕ Agregar Nueva Categoría de Producto (ej. Comal 🫓)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    placeholder="🫓 Emoji"
                    className="w-full bg-white border border-amber-200 rounded-xl p-2 text-center text-xs font-black text-slate-800"
                  />
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nombre Categoría (ej. Comal)"
                    className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs font-bold text-slate-800"
                  />
                  <select
                    value={newCatDest}
                    onChange={(e) => setNewCatDest(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs font-bold text-slate-800 cursor-pointer"
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
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2 rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  ➕ Crear Categoría de Producto
                </button>
              </div>
            </div>
          )}

          {/* Botón de Guardado Principal por Tenant */}
          <div className="border-t pt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                handleSaveTenantPrinters(tenantPrinterConfig, productCategories);
                setShowBluetoothConfigModal(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer"
            >
              <span>💾 GUARDAR IMPRESORAS Y CATEGORÍAS DE</span>
              <span className="underline decoration-white/40 font-black">{tenantName}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center font-bold m-0">
              Esta configuración se guardará permanentemente en Firestore para la empresa seleccionada y en el almacenamiento local.
            </p>
          </div>
        </div>

      </IonModal>
    );
};
