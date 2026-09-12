import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IonContent,
  IonIcon,
  IonPage
} from '@ionic/react';
import {
  cartOutline,
  addOutline,
  trashOutline,
  printOutline,
  cashOutline,
  closeOutline
} from 'ionicons/icons';
import { TablesMode } from '../../utils/appHelpers';
import { TablesModeSwitcher } from '../common/TablesModeSwitcher';

interface CuentasCelularViewProps {
  tables: any[];
  effectiveTables: any[];
  zones: string[];
  products: any[];
  productCategories: any[];
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  addToCart: (product: any, qty?: number) => void;
  currentUser: any;
  selectedTenant: any;
  renderMaterialHeader: any;
  onSwitchTablesMode?: (mode: TablesMode) => void;
  generateOrder: (goToCheckout?: boolean) => void;
  setAppMode: (mode: any) => void;
  setCheckoutReturnMode: (mode: string | null) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  isOnline?: boolean;
  isListening?: boolean;
  startVoiceRecognition?: () => void;
  generalNotes?: string;
  setGeneralNotes?: (notes: string) => void;
}

export const CuentasCelularView: React.FC<CuentasCelularViewProps> = ({
  tables,
  effectiveTables,
  zones,
  products,
  productCategories,
  cart,
  setCart,
  addToCart,
  currentUser,
  selectedTenant,
  renderMaterialHeader,
  onSwitchTablesMode,
  generateOrder,
  setAppMode,
  setCheckoutReturnMode,
  selectedTableId,
  setSelectedTableId,
  isOnline,
  isListening,
  startVoiceRecognition,
  generalNotes,
  setGeneralNotes
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showProductDrawer, setShowProductDrawer] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Selected table reference
  const currentTable = useMemo(() => {
    if (!selectedTableId) return null;
    return effectiveTables.find((t) => t.id === selectedTableId) || null;
  }, [selectedTableId, effectiveTables]);

  // Existing sent comandas items on table
  const existingComandas = useMemo(() => {
    return currentTable?.comandas || [];
  }, [currentTable]);

  const activeExistingItems = useMemo(() => {
    return existingComandas.flatMap((c: any) => c.items || []).filter((i: any) => !i.isCancelled);
  }, [existingComandas]);

  const existingTotal = useMemo(() => {
    return activeExistingItems.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * (item.quantity || 1),
      0
    );
  }, [activeExistingItems]);

  // Current new cart subtotal
  const cartTotal = useMemo(() => {
    return cart.reduce((sum: number, item: any) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
  }, [cart]);

  // Combined grand total
  const grandTotal = existingTotal + cartTotal;

  // Filtered tables by selected zone
  const filteredTables = useMemo(() => {
    if (selectedZone === 'all') return effectiveTables;
    return effectiveTables.filter((t) => t.zone === selectedZone);
  }, [effectiveTables, selectedZone]);

  // Filtered products for drawer
  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (activeCategory !== 'all') {
      list = list.filter((p) => (p.category || 'other') === activeCategory);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, productSearch]);

  // Helper to get cart quantity for a specific product
  const getProductCartCount = (productId: string) => {
    const item = cart.find((i) => i.product?.id === productId);
    return item ? item.quantity : 0;
  };

  // Cart operations
  const handleQuantityChange = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      const newQty = (item.quantity || 1) + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        item.quantity = newQty;
        updated[index] = item;
      }
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemNoteChange = (index: number, note: string) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], notes: note };
      return updated;
    });
  };

  // Flow handlers
  const handleSelectTable = (table: any) => {
    setSelectedTableId(table.id);
  };

  const handleBackToTables = () => {
    setSelectedTableId(null);
    setShowProductDrawer(false);
  };

  const handleSendComanda = () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al pedido antes de enviar comanda.');
      return;
    }
    generateOrder(false);
  };

  const handleDirectCheckout = () => {
    if (cart.length > 0) {
      generateOrder(true);
    } else if (activeExistingItems.length > 0) {
      setCheckoutReturnMode('cuentas_celular');
      setAppMode('checkout');
    } else {
      alert('Esta mesa no tiene productos ni consumos para cobrar.');
    }
  };

  return (
    <IonPage>
      {renderMaterialHeader({
        title: currentTable
          ? `Mesa ${currentTable.label}`
          : (selectedTenant?.sucursalDefault ? `🏢 ${selectedTenant.sucursalDefault}` : (selectedTenant?.name ? `🏢 ${selectedTenant.name}` : "Cocinet")),
        subtitle: currentTable
          ? `Área: ${currentTable.zone || 'Principal'}`
          : (selectedTenant?.sucursalDefault && selectedTenant?.name ? `📍 ${selectedTenant.name}` : "📍 Cuentas Celular"),
        showBack: !!currentTable,
        onBack: handleBackToTables,
        showMenu: !currentTable,
        actions: (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!currentTable && (
              <TablesModeSwitcher currentMode="cuentas_celular" onSwitchMode={onSwitchTablesMode} />
            )}
            {isOnline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startVoiceRecognition}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer border-none shadow-md ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-slate-900'
                }`}
                title={isListening ? 'Detener...' : 'Pedir por Voz'}
              >
                <span className="flex items-center gap-1 select-none">
                  {isListening ? '⏹️ Detener' : '🎙️ Voz'}
                </span>
              </motion.button>
            )}
          </div>
        )
      })}

      <IonContent
        className="ion-padding"
        style={{
          '--background': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto pb-24">
          {/* SCREEN 1: SELECCIÓN DE MESAS */}
          {!currentTable && (
            <div className="space-y-4">
              {/* Zone Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedZone('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    selectedZone === 'all'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todas las Áreas ({effectiveTables.length})
                </button>
                {zones.map((zone) => {
                  const count = effectiveTables.filter((t) => t.zone === zone).length;
                  return (
                    <button
                      key={zone}
                      onClick={() => setSelectedZone(zone)}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                        selectedZone === zone
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {zone} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Grid of Tables */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredTables.map((table) => {
                  const coms = table.comandas || [];
                  const activeItems = coms.flatMap((c: any) => c.items || []).filter((i: any) => !i.isCancelled);
                  const isOccupied = table.status === 'occupied' || activeItems.length > 0;
                  const tableTotal = activeItems.reduce(
                    (s: number, i: any) => s + (i.product?.price || 0) * (i.quantity || 1),
                    0
                  );

                  return (
                    <motion.div
                      key={table.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectTable(table)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] shadow-lg ${
                        isOccupied
                          ? 'bg-gradient-to-br from-amber-950/60 to-slate-900/90 border-amber-500/50 shadow-amber-950/30'
                          : 'bg-gradient-to-br from-slate-800/70 to-slate-900/90 border-slate-700/60 shadow-slate-950/40 hover:border-indigo-500/50'
                      }`}
                    >
                      {/* Header Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-white">
                          Mesa {table.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isOccupied
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isOccupied ? 'Ocupada' : 'Libre'}
                        </span>
                      </div>

                      {/* Info Body */}
                      <div className="mt-2 text-xs">
                        <div className="text-slate-400 truncate">{table.zone || 'Principal'}</div>
                        {isOccupied ? (
                          <div className="mt-1 flex items-center justify-between font-black text-amber-300 text-sm">
                            <span>{activeItems.length} prod.</span>
                            <span>${tableTotal.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-slate-500 font-semibold">
                            Toca para abrir cuenta
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 2: GESTIÓN DE LA CUENTA */}
          {currentTable && (
            <div className="space-y-4">
              {/* Table Info Banner & Quick Add Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/80 border border-indigo-500/30 shadow-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">Mesa {currentTable.label}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentTable.zone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeExistingItems.length} comandados • Total: ${grandTotal.toFixed(2)}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProductDrawer(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <IonIcon icon={addOutline} className="text-lg font-black" />
                  <span>+ Agregar Productos</span>
                </motion.button>
              </div>

              {/* Items in New Cart */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <IonIcon icon={cartOutline} className="text-emerald-400 text-lg" />
                    <span className="font-extrabold text-sm text-white">
                      Por Comandar ({cart.length})
                    </span>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <div className="text-2xl mb-1">🛒</div>
                    No hay productos nuevos por enviar.
                    <br />
                    Toca <strong>+ Agregar Productos</strong> para capturar pedidos rápidamente.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 mt-2 space-y-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-2">
                            <div className="font-bold text-xs text-white">
                              {item.product?.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-semibold">
                              ${item.product?.price} c/u • Total: $
                              {((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                          </div>

                          {/* Stepper + - */}
                          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700/50">
                            <button
                              onClick={() => handleQuantityChange(idx, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-black text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(idx, 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveCartItem(idx)}
                              className="w-7 h-7 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 flex items-center justify-center cursor-pointer ml-1"
                            >
                              <IonIcon icon={trashOutline} className="text-xs" />
                            </button>
                          </div>
                        </div>

                        {/* Optional item note input */}
                        <div className="mt-1.5">
                          <input
                            type="text"
                            placeholder="Nota opcional (ej. Sin cebolla, extra salsa...)"
                            value={item.notes || ''}
                            onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                            className="w-full px-2.5 py-1 text-[11px] bg-slate-950/60 rounded-lg border border-slate-800 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Previously Sent Comandas */}
              {activeExistingItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                      📋 Consumo Anteriormente Enviado a Cocina
                    </span>
                    <span className="font-black text-xs text-amber-300">
                      ${existingTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/40 mt-2">
                    {existingComandas.map((comanda: any, cIdx: number) => {
                      const validItems = (comanda.items || []).filter((i: any) => !i.isCancelled);
                      if (validItems.length === 0) return null;
                      return (
                        <div key={cIdx} className="py-2 first:pt-0">
                          <div className="text-[10px] font-bold text-slate-500 flex items-center justify-between mb-1">
                            <span>Comanda #{cIdx + 1} • {comanda.userName || 'Mesero'}</span>
                            <span>{comanda.timestamp ? new Date(comanda.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          {validItems.map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex items-center justify-between text-xs py-0.5">
                              <span className="text-slate-300 font-medium">
                                <strong className="text-white font-black mr-1">{item.quantity}x</strong>
                                {item.product?.name}
                                {item.notes ? <span className="text-[10px] text-amber-400 block italic">({item.notes})</span> : null}
                              </span>
                              <span className="text-slate-400 font-bold">
                                ${((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Sticky Actions */}
              <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-40">
                <div className="max-w-2xl mx-auto flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSendComanda}
                    disabled={cart.length === 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
                      cart.length > 0
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <IonIcon icon={printOutline} className="text-lg" />
                    <span>Enviar Comanda ({cart.length})</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleDirectCheckout}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
                  >
                    <IonIcon icon={cashOutline} className="text-lg" />
                    <span>Cobrar (${grandTotal.toFixed(2)})</span>
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      {/* DRAWER: + AGREGAR PRODUCTOS */}
      <AnimatePresence>
        {showProductDrawer && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <span>🍔 Agregar a Mesa {currentTable?.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold">
                    {cart.reduce((s, i) => s + i.quantity, 0)} items en carrito
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Toca un producto para agregar (+1). Clic, clic, clic para sumar.
                </p>
              </div>

              <button
                onClick={() => setShowProductDrawer(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <IonIcon icon={closeOutline} className="text-xl" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 space-y-2">
              <input
                type="text"
                placeholder="🔍 Buscar producto por nombre..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Todos ({products.length})
                </button>
                {(productCategories || []).map((cat: any) => {
                  const catId = typeof cat === 'string' ? cat : cat.id;
                  const catName = typeof cat === 'string' ? cat : (cat.name || cat.id);
                  const catEmoji = typeof cat === 'string' ? '🍽️' : (cat.emoji || '🍽️');
                  return (
                    <button
                      key={catId}
                      onClick={() => setActiveCategory(catId)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                        activeCategory === catId
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{catEmoji}</span>
                      <span>{catName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products Fast-Tap Grid */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredProducts.map((prod) => {
                const count = getProductCartCount(prod.id);
                return (
                  <motion.button
                    key={prod.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => addToCart(prod, 1)}
                    className={`relative p-3 rounded-xl border text-left flex flex-col justify-between min-h-[85px] transition-all cursor-pointer shadow-md ${
                      count > 0
                        ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white line-clamp-2 leading-tight">
                      {prod.name}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black text-xs text-emerald-400">
                        ${prod.price}
                      </span>
                      {count > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] shadow-sm">
                          {count}
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                          +
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Drawer Bottom Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400">Subtotal nuevo pedido: </span>
                <span className="font-black text-emerald-400">${cartTotal.toFixed(2)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowProductDrawer(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg cursor-pointer"
              >
                Listo / Ver Pedido
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IonPage>
  );
};
