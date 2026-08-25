import { addCashMovementToFirebase, addPurchaseToFirebase, getMexicoISOString } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, trashOutline, printOutline } from 'ionicons/icons';

interface SupplierPurchaseModalProps {
  showSupplierPurchaseModal: boolean;
  setShowSupplierPurchaseModal: (v: boolean) => void;
  // you might need more props
  cashierSessions: any;
  currentUser: any;
  inventory: any;
  selectedScheduleSupplier: any;
  sessionId: any;
  setSelectedScheduleSupplier: any;
  setSupplierPurchaseIsPaid: any;
  setSupplierPurchaseItems: any;
  supplierPurchaseIsPaid: any;
  supplierPurchaseItems: any;
  triggerAppNotification: any;
}

export const SupplierPurchaseModal: React.FC<SupplierPurchaseModalProps> = ({
  showSupplierPurchaseModal,
  setShowSupplierPurchaseModal,
  cashierSessions, currentUser, inventory, selectedScheduleSupplier, sessionId, setSelectedScheduleSupplier, setSupplierPurchaseIsPaid, setSupplierPurchaseItems, supplierPurchaseIsPaid, supplierPurchaseItems, triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={showSupplierPurchaseModal}
            onDidDismiss={() => {
              setShowSupplierPurchaseModal(false);
              setSelectedScheduleSupplier(null);
            }}
            className="rounded-3xl"
            style={{ "--border-radius": "24px" }}
          >
            <div className="flex flex-col h-full bg-[#f8fafc]">
              {/* Header */}
              <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <div>
                    <h2 className="text-sm font-black tracking-tight">
                      Recibir Surtido de Proveedor
                    </h2>
                    <p className="text-[12px] text-slate-300">
                      {selectedScheduleSupplier?.name || "Proveedor"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupplierPurchaseModal(false);
                    setSelectedScheduleSupplier(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer outline-none border-none"
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: "18px" }} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Proveedor Info header */}
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between text-indigo-900">
                  <div>
                    <span className="font-bold text-xs block">
                      PROVEEDOR PROGRAMADO
                    </span>
                    <span className="text-base font-black">
                      {selectedScheduleSupplier?.name}
                    </span>
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-1 rounded-full">
                    Visita:{" "}
                    {selectedScheduleSupplier?.frequency === "diario"
                      ? "Diaria"
                      : selectedScheduleSupplier?.frequency === "semanal"
                        ? "Semanal"
                        : "Cada 3 Días"}
                  </span>
                </div>

                {/* Subform adding item delivered */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-4">
                  <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                    <span>🛒</span> Agregar Insumo Surtido
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Selecciona Insumo del Stock
                      </label>
                      <select
                        id="sup-p-inv"
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl outline-none"
                      >
                        <option value="">
                          Selecciona para resurtir stock...
                        </option>
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} ({inv.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Cant.
                      </label>
                      <input
                        id="sup-p-qty"
                        type="number"
                        placeholder="0"
                        min="1"
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl text-center outline-none font-bold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Costo Total $
                      </label>
                      <input
                        id="sup-p-price"
                        type="number"
                        placeholder="$"
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl text-center outline-none font-bold"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const invSelect = document.getElementById(
                        "sup-p-inv",
                      ) as HTMLSelectElement;
                      const qtyInput = document.getElementById(
                        "sup-p-qty",
                      ) as HTMLInputElement;
                      const priceInput = document.getElementById(
                        "sup-p-price",
                      ) as HTMLInputElement;

                      const invId = invSelect.value;
                      const qty = parseFloat(qtyInput.value);
                      const price = parseFloat(priceInput.value);

                      if (
                        !invId ||
                        isNaN(qty) ||
                        isNaN(price) ||
                        qty <= 0 ||
                        price < 0
                      ) {
                        alert(
                          "Por favor selecciona un insumo e ingresa cantidad y costo válidos.",
                        );
                        return;
                      }

                      const matchedInv = inventory.find((i) => i.id === invId);

                      setSupplierPurchaseItems([
                        ...supplierPurchaseItems,
                        {
                          id: String(Date.now() + Math.random()),
                          inventoryItemId: invId,
                          name: matchedInv?.name || "Insumo",
                          unit: matchedInv?.unit || "pza",
                          qty,
                          price,
                        },
                      ]);

                      invSelect.value = "";
                      qtyInput.value = "";
                      priceInput.value = "";
                    }}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[12px] py-1.5 rounded-xl cursor-pointer transition border border-indigo-100 flex items-center justify-center gap-1"
                  >
                    <span>➕ Agregar al Carrito de Recepción</span>
                  </button>
                </div>

                {/* Carrito de Recepción */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1.5">
                    <span>🗂️</span> Insumos Entregados en esta Recepción
                  </h4>
                  {supplierPurchaseItems.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      Ningún insumo cargado todavía.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold">
                          <th className="py-2">Insumo</th>
                          <th className="py-2 text-center">Cant.</th>
                          <th className="py-2 text-right">Costo Total</th>
                          <th className="py-2 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                        {supplierPurchaseItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2 font-bold text-slate-800">
                              {item.name} ({item.unit})
                            </td>
                            <td className="py-2 text-center font-bold text-slate-600">
                              {item.qty}
                            </td>
                            <td className="py-2 text-right font-black text-slate-950">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="py-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setSupplierPurchaseItems(
                                    supplierPurchaseItems.filter(
                                      (x) => x.id !== item.id,
                                    ),
                                  )
                                }
                                className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                              >
                                ❌
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div className="flex justify-end items-center pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 mr-2">
                      TOTAL COMPRA:
                    </span>
                    <span className="text-sm font-black text-indigo-700">
                      $
                      {supplierPurchaseItems
                        .reduce((acc, x) => acc + x.price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Métdo de Pago del Surtido */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700">
                  <div>
                    <span className="font-bold text-xs block uppercase text-slate-400">
                      Término de Pago / Caja
                    </span>
                    <span className="text-xs font-bold">
                      ¿Cómo se liquida esta entrega de insumos?
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSupplierPurchaseIsPaid(true)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        supplierPurchaseIsPaid
                          ? "bg-emerald-600 text-white shadow-sm font-black"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      💵 Pagado de Caja
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplierPurchaseIsPaid(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        !supplierPurchaseIsPaid
                          ? "bg-amber-500 text-white shadow-sm font-black"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      📄 A Crédito (Por Pagar)
                    </button>
                  </div>
                </div>

                {/* Confirmación final */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSupplierPurchaseModal(false);
                      setSelectedScheduleSupplier(null);
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition border-none outline-none"
                  >
                    Salir
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!selectedScheduleSupplier) return;
                      if (supplierPurchaseItems.length === 0) {
                        alert(
                          "Carga al menos un insumo entregado por el proveedor.",
                        );
                        return;
                      }
                      const totalAmt = supplierPurchaseItems.reduce(
                        (acc, x) => acc + x.price,
                        0,
                      );
                      try {
                        // 1. Log Purchase
                        await addPurchaseToFirebase({
                          supplier: selectedScheduleSupplier.name,
                          items: supplierPurchaseItems.map((item) => ({
                            inventoryItemId: item.inventoryItemId,
                            qty: item.qty,
                            price: item.price,
                          })),
                          total: totalAmt,
                          isPaid: supplierPurchaseIsPaid,
                          userId: currentUser?.id,
                          createdBy: currentUser?.name || "Admin",
                          timestamp: getMexicoISOString(),
                          sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
                        });

                        // 2. If Paid, deduct cash from current session drawer
                        if (supplierPurchaseIsPaid) {
                          await addCashMovementToFirebase({
                            type: "out",
                            concept: "pago_proveedor",
                            amount: totalAmt,
                            description: `Pago de Surtido a Proveedor Programado: ${selectedScheduleSupplier.name}`,
                            user: currentUser?.name || "Admin",
                            userId: currentUser?.id,
                            date: getMexicoISOString(),
                            sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
                          });
                        }

                        triggerAppNotification(
                          "🤝 Entrega Almacenada",
                          `Se recibieron los insumos de ${selectedScheduleSupplier.name} por un total de $${totalAmt.toFixed(2)}. Estado: ${supplierPurchaseIsPaid ? "PAGADO DE CAJA 💵" : "A CRÉDITO 📄"}.`,
                          "success",
                        );

                        setShowSupplierPurchaseModal(false);
                        setSelectedScheduleSupplier(null);
                        setSupplierPurchaseItems([]);
                        setSupplierPurchaseIsPaid(true);
                      } catch (err) {
                        console.error(err);
                        alert("Error al registrar compra.");
                      }
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition border-none outline-none"
                  >
                    Confirmar Recepción y Stock 🚛 💾
                  </button>
                </div>
              </div>
            </div>
          </IonModal>
  );
};
