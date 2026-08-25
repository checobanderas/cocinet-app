import { addCashMovementToFirebase, getMexicoISOString } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface GastoRegisterModalProps {
  showGastoRegisterModal: boolean;
  setShowGastoRegisterModal: (v: boolean) => void;
  cashierSessions: any;
  currentUser: any;
  gastoCategory: any;
  gastoDescription: any;
  gastoItemName: any;
  gastoItemPrice: any;
  gastoItemQty: any;
  gastoItems: any;
  sessionId: any;
  setGastoCategory: any;
  setGastoDescription: any;
  setGastoItemName: any;
  setGastoItemPrice: any;
  setGastoItemQty: any;
  setGastoItems: any;
  triggerAppNotification: any;
}

export const GastoRegisterModal: React.FC<GastoRegisterModalProps> = ({
  showGastoRegisterModal,
  setShowGastoRegisterModal,
  cashierSessions, currentUser, gastoCategory, gastoDescription, gastoItemName, gastoItemPrice, gastoItemQty, gastoItems, sessionId, setGastoCategory, setGastoDescription, setGastoItemName, setGastoItemPrice, setGastoItemQty, setGastoItems, triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={showGastoRegisterModal}
            onDidDismiss={() => setShowGastoRegisterModal(false)}
            className="rounded-3xl"
            style={{ "--border-radius": "24px" }}
          >
            <div className="flex flex-col h-full bg-[#f8fafc]">
              {/* Header */}
              <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧾</span>
                  <div>
                    <h2 className="text-sm font-black tracking-tight">
                      Gasto Compuesto Maestro
                    </h2>
                    <p className="text-[12px] text-slate-300">
                      Registar egreso de caja con desglose de productos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGastoRegisterModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none"
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Categoría & Concepto */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-wide mb-1.5">
                      Categoría de Gasto *
                    </label>
                    <select
                      value={gastoCategory}
                      onChange={(e) => setGastoCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="abarrotes">
                        🍝 Abarrotes Varios (Tiendita/Esquina)
                      </option>
                      <option value="nomina">
                        💼 Pago de Nómina / Personal
                      </option>
                      <option value="servicios">
                        ⚙️ Servicios (Luz/Sistemas/Internet)
                      </option>
                      <option value="mantenimiento">
                        🛠️ Mantenimiento / Reparación
                      </option>
                      <option value="papeleria">
                        📂 Papelería / Desechables
                      </option>
                      <option value="otros">💵 Otros Egresos de Caja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-wide mb-1.5">
                      Descripción General (Concepto)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Compras de última hora para el turno"
                      value={gastoDescription}
                      onChange={(e) => setGastoDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs py-2.5 px-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Sub-formulario de Ítems */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                    <span>➕</span> Agregar Producto / Concepto al Detalle de
                    Gasto
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Nombre del Insumo / Concepto
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Servilletas de cocina, Jabón líquido, etc."
                        value={gastoItemName}
                        onChange={(e) => setGastoItemName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl focus:border-indigo-500 outline-none font-medium"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Cant.
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        min="1"
                        value={gastoItemQty}
                        onChange={(e) => setGastoItemQty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl focus:border-indigo-500 text-center outline-none font-bold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Precio Unit.
                      </label>
                      <input
                        type="number"
                        placeholder="$0.00"
                        min="0"
                        value={gastoItemPrice}
                        onChange={(e) => setGastoItemPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl focus:border-indigo-500 text-center outline-none font-bold"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!gastoItemName || !gastoItemQty || !gastoItemPrice) {
                        alert("Por favor llena todos los campos del producto.");
                        return;
                      }
                      const qty = parseFloat(gastoItemQty);
                      const price = parseFloat(gastoItemPrice);
                      if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
                        alert("Monto o cantidad inválida.");
                        return;
                      }
                      setGastoItems([
                        ...gastoItems,
                        {
                          id: String(Date.now() + Math.random()),
                          name: gastoItemName,
                          qty,
                          unitPrice: price,
                          total: qty * price,
                        },
                      ]);
                      setGastoItemName("");
                      setGastoItemQty("");
                      setGastoItemPrice("");
                    }}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[12px] py-2 rounded-xl cursor-pointer transition border border-indigo-100 flex items-center justify-center gap-1"
                  >
                    <span>➕ Agregar Producto al Listado</span>
                  </button>
                </div>

                {/* Listado de Ítems Cargados */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                    <span>🛒</span> Desglose de Productos Registrados (
                    {gastoItems.length})
                  </h4>
                  {gastoItems.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      Ningún producto agregado todavía. ¡Carga un producto para
                      ver el desglose!
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 font-bold text-slate-400">
                            <th className="py-2">Producto / Servicio</th>
                            <th className="py-2 text-center">Cant.</th>
                            <th className="py-2 text-right">Precio Unit.</th>
                            <th className="py-2 text-right">Total</th>
                            <th className="py-2 text-center">Remover</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                          {gastoItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="py-2 font-bold text-slate-800">
                                {item.name}
                              </td>
                              <td className="py-2 text-center font-bold text-slate-600">
                                {item.qty}
                              </td>
                              <td className="py-2 text-right">
                                ${item.unitPrice.toFixed(2)}
                              </td>
                              <td className="py-2 text-right font-black text-slate-900">
                                ${item.total.toFixed(2)}
                              </td>
                              <td className="py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGastoItems(
                                      gastoItems.filter(
                                        (x) => x.id !== item.id,
                                      ),
                                    )
                                  }
                                  className="text-rose-600 hover:text-rose-800 font-bold ml-1 cursor-pointer"
                                >
                                  ❌
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end items-center pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 mr-2">
                      SUBTOTAL GASTO:
                    </span>
                    <span className="text-lg font-black text-rose-600">
                      $
                      {gastoItems
                        .reduce((acc, x) => acc + x.total, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Guardar */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGastoRegisterModal(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition shadow-sm border-none outline-none"
                  >
                    Salir
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (gastoItems.length === 0) {
                        alert(
                          "Agrega al menos un ítem al desglose del gasto corporativo.",
                        );
                        return;
                      }
                      const totalAmount = gastoItems.reduce(
                        (acc, x) => acc + x.total,
                        0,
                      );
                      try {
                        await addCashMovementToFirebase({
                          type: "out",
                          concept: "gasto",
                          amount: totalAmount,
                          description: `Gasto: ${gastoCategory.toUpperCase()} - ${gastoDescription || "Detalle múltiple de abarrotes/nómina"}`,
                          user: currentUser?.name || "Admin",
                          userId: currentUser?.id,
                          isGasto: true,
                          gastoCategory: gastoCategory,
                          items: gastoItems,
                          date: getMexicoISOString(),
                          sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
                        });

                        triggerAppNotification(
                          "🛒 Gasto Registrado",
                          `Desglose guardado correctamente por $${totalAmount.toFixed(2)} de ${gastoCategory.toUpperCase()}.`,
                          "success",
                        );

                        setGastoItems([]);
                        setGastoDescription("");
                        setGastoCategory("abarrotes");
                        setShowGastoRegisterModal(false);
                      } catch (err) {
                        console.error(err);
                        alert("Error al guardar egreso en Firestore.");
                      }
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition shadow-sm border-none outline-none"
                  >
                    Guardar Gasto en Caja Real-time 💾
                  </button>
                </div>
              </div>
            </div>
          </IonModal>
  );
};
