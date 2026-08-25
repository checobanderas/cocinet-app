import { SupplierModal } from '../modals/SupplierModal';
import { addSupplierToFirebase, deleteSupplierFromFirebase, updateSupplierInFirebase } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { businessOutline } from 'ionicons/icons';

interface SuppliersViewProps {
  renderMaterialHeader: any;
  setAppMode: any;
  setSupplierModal: any;
  supplierModal: any;
  suppliers: any;
  triggerAppNotification: any;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  renderMaterialHeader,
  setAppMode,
  setSupplierModal,
  supplierModal,
  suppliers,
  triggerAppNotification
}) => {
const handleSaveSupplier = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = {
        name: (form.elements.namedItem("supName") as HTMLInputElement).value,
        phone: (form.elements.namedItem("supPhone") as HTMLInputElement).value,
        email: (form.elements.namedItem("supEmail") as HTMLInputElement).value,
        address: (form.elements.namedItem("supAddress") as HTMLInputElement)
          .value,
        category: (form.elements.namedItem("supCategory") as HTMLSelectElement)
          .value,
        notes: (form.elements.namedItem("supNotes") as HTMLTextAreaElement)
          .value,
        frequency:
          (form.elements.namedItem("supFrequency") as HTMLSelectElement)
            .value || "diario",
      };

      if (!data.name) {
        alert("El nombre es requerido");
        return;
      }

      try {
        if (supplierModal.supplier) {
          await updateSupplierInFirebase(supplierModal.supplier.id, data);
        } else {
          await addSupplierToFirebase(data);
        }
        setSupplierModal({ isOpen: false, supplier: null });
      } catch (err) {
        console.error("Error al guardar proveedor", err);
      }
    };

    const handleDeleteSupplier = async (id: string) => {
      if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
        try {
          await deleteSupplierFromFirebase(id);
        } catch (err) {
          console.error("Error al eliminar proveedor", err);
        }
      }
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Catálogo de Proveedores",
        subtitle: `Proveedores registrados: ${suppliers.length}`,
        showBack: true,
        onBack: () => setAppMode("floorplan"),
        actions: (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSupplierModal({ isOpen: true, supplier: null })}
            className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md cursor-pointer mr-2"
          >
            ➕ Nuevo Proveedor
          </motion.button>
        )
      })}
        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >
          <div className="max-w-6xl mx-auto py-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                🤝 Proveedores Registrados ({suppliers.length})
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Administra los proveedores que surten insumos, abarrotes y
                bebidas a tu restaurante.
              </p>

              {suppliers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IonIcon
                      icon={businessOutline}
                      style={{ fontSize: "28px" }}
                    />
                  </div>
                  <h3 className="font-bold text-slate-700">Sin Proveedores</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Aún no has agregado proveedores a tu catálogo.
                  </p>
                  <button
                    onClick={() =>
                      setSupplierModal({ isOpen: true, supplier: null })
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-6 rounded-xl transition cursor-pointer"
                  >
                    Agregar Primer Proveedor
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-bold text-slate-600">Nombre</th>
                        <th className="p-4 font-bold text-slate-600">
                          Categoría
                        </th>
                        <th className="p-4 font-bold text-slate-600">
                          Teléfono
                        </th>
                        <th className="p-4 font-bold text-slate-600">Email</th>
                        <th className="p-4 font-bold text-slate-600">
                          Dirección
                        </th>
                        <th className="p-4 font-bold text-slate-600 text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                        >
                          <td className="p-4 font-bold text-slate-800">
                            <div>{s.name}</div>
                            {s.frequency && (
                              <div
                                className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5"
                                style={{
                                  display: "flex",
                                  gap: "3px",
                                  alignItems: "center",
                                }}
                              >
                                <span>📅</span>{" "}
                                <span>
                                  {s.frequency === "diario"
                                    ? "Surtido Diario"
                                    : s.frequency === "semanal"
                                      ? "Surtido Semanal"
                                      : s.frequency === "tres_dias"
                                        ? "Cada 3 Días"
                                        : s.frequency === "quincenal"
                                          ? "Quincenal"
                                          : s.frequency}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                              {s.category || "General"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">
                            {s.phone || "-"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {s.email || "-"}
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">
                            {s.address || "-"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  setSupplierModal({
                                    isOpen: true,
                                    supplier: s,
                                  })
                                }
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteSupplier(s.id)}
                                className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Form Modal */}
<SupplierModal
          supplierModal={supplierModal}
          setSupplierModal={setSupplierModal}
          triggerAppNotification={triggerAppNotification}
        />
        </IonContent>
      </IonPage>
    );
};
