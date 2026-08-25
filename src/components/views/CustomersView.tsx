import { CustomerModal } from '../modals/CustomerModal';
import { addCustomerToFirebase, deleteCustomerFromFirebase, updateCustomerInFirebase } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';

interface CustomersViewProps {
  customerModal: any;
  customerModalAddresses: any;
  customers: any;
  renderMaterialHeader: any;
  setAppMode: any;
  setCustomerModal: any;
  triggerAppNotification: any;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customerModal,
  customerModalAddresses,
  customers,
  renderMaterialHeader,
  setAppMode,
  setCustomerModal,
  triggerAppNotification
}) => {
const handleSaveCustomer = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = {
        name: (form.elements.namedItem("custName") as HTMLInputElement).value,
        phone: (form.elements.namedItem("custPhone") as HTMLInputElement).value,
        email: (form.elements.namedItem("custEmail") as HTMLInputElement).value,
        visits:
          parseInt(
            (form.elements.namedItem("custVisits") as HTMLInputElement).value,
          ) || 0,
        notes: (form.elements.namedItem("custNotes") as HTMLTextAreaElement)
          .value,
        addresses: customerModalAddresses,
      };

      if (!data.name) {
        alert("El nombre es requerido");
        return;
      }

      try {
        if (customerModal.customer) {
          await updateCustomerInFirebase(customerModal.customer.id, data);
        } else {
          await addCustomerToFirebase(data);
        }
        setCustomerModal({ isOpen: false, customer: null });
      } catch (err) {
        console.error("Error al guardar cliente", err);
      }
    };

    const handleDeleteCustomer = async (id: string) => {
      if (window.confirm("¿Seguro que deseas eliminar este cliente?")) {
        try {
          await deleteCustomerFromFirebase(id);
        } catch (err) {
          console.error("Error al eliminar cliente", err);
        }
      }
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Catálogo de Clientes",
        subtitle: `Clientes registrados: ${customers.length}`,
        showBack: true,
        onBack: () => setAppMode("floorplan"),
        actions: (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCustomerModal({ isOpen: true, customer: null })}
            className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md cursor-pointer mr-2"
          >
            ➕ Nuevo Cliente
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
                👥 Clientes del Restaurante ({customers.length})
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Lleva un registro de tus clientes preferidos, sus visitas
                acumuladas y preferencias especiales.
              </p>

              {customers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IonIcon
                      icon={peopleOutline}
                      style={{ fontSize: "28px" }}
                    />
                  </div>
                  <h3 className="font-bold text-slate-700">Sin Clientes</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Aún no has agregado clientes a tu catálogo.
                  </p>
                  <button
                    onClick={() =>
                      setCustomerModal({ isOpen: true, customer: null })
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-6 rounded-xl transition cursor-pointer"
                  >
                    Agregar Primer Cliente
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-bold text-slate-600">Nombre</th>
                        <th className="p-4 font-bold text-slate-600">
                          Teléfono
                        </th>
                        <th className="p-4 font-bold text-slate-600">Email</th>
                        <th className="p-4 font-bold text-slate-600">
                          Visitas Totales
                        </th>
                        <th className="p-4 font-bold text-slate-600">
                          Perfil / Notas
                        </th>
                        <th className="p-4 font-bold text-slate-600 text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                        >
                          <td className="p-4 font-bold text-slate-800">
                            {c.name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {c.phone || "-"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {c.email || "-"}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                              ⭐ {c.visits || 0} visitas
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">
                            {c.notes || "-"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  setCustomerModal({
                                    isOpen: true,
                                    customer: c,
                                  })
                                }
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(c.id)}
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

          {/* Customer Form Modal */}
<CustomerModal
          customerModal={customerModal}
          setCustomerModal={setCustomerModal}
          triggerAppNotification={triggerAppNotification}
        />
        </IonContent>
      </IonPage>
    );
};
