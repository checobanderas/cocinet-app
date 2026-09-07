import { CustomerModal } from '../modals/CustomerModal';
import { addCustomerToFirebase, deleteCustomerFromFirebase, updateCustomerInFirebase } from '../../utils/firestore';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import { Building2, Sparkles, MapPin, Receipt } from 'lucide-react';

interface CustomersViewProps {
  customerModal: any;
  customerModalAddresses: any;
  customers: any[];
  renderMaterialHeader: any;
  setAppMode: any;
  setCustomerModal: any;
  triggerAppNotification: any;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customerModal,
  customerModalAddresses,
  customers = [],
  renderMaterialHeader,
  setAppMode,
  setCustomerModal,
  triggerAppNotification
}) => {
  const [newAddressInput, setNewAddressInput] = useState("");
  const [newAddressRefInput, setNewAddressRefInput] = useState("");
  const [localAddresses, setLocalAddresses] = useState<string[]>([]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const rfcVal = ((form.elements.namedItem("custRfc") as HTMLInputElement)?.value || "").toUpperCase().trim();
    const razonSocialVal = ((form.elements.namedItem("custRazonSocial") as HTMLInputElement)?.value || "").toUpperCase().trim();
    const regimenFiscalVal = (form.elements.namedItem("custRegimenFiscal") as HTMLSelectElement)?.value || "612";
    const usoCfdiVal = (form.elements.namedItem("custUsoCfdi") as HTMLSelectElement)?.value || "G03";
    const cpVal = ((form.elements.namedItem("custCp") as HTMLInputElement)?.value || "").trim();
    const emailFacturacionVal = ((form.elements.namedItem("custEmailFacturacion") as HTMLInputElement)?.value || "").trim().toLowerCase();

    const data: any = {
      name: (form.elements.namedItem("custName") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("custPhone") as HTMLInputElement).value.trim().replace(/\D/g, "").slice(0, 10),
      email: (form.elements.namedItem("custEmail") as HTMLInputElement).value.trim().toLowerCase(),
      visits: parseInt((form.elements.namedItem("custVisits") as HTMLInputElement).value) || 0,
      notes: (form.elements.namedItem("custNotes") as HTMLTextAreaElement).value.trim(),
      addresses: customerModalAddresses || localAddresses || [],
      rfc: rfcVal,
      razonSocial: razonSocialVal || (form.elements.namedItem("custName") as HTMLInputElement).value.trim().toUpperCase(),
      regimenFiscal: regimenFiscalVal,
      usoCfdi: usoCfdiVal,
      cp: cpVal,
      emailFacturacion: emailFacturacionVal,
      hasFiscalData: !!rfcVal
    };

    if (!data.name || !data.phone) {
      alert("El nombre y teléfono son requeridos ⚠️");
      return;
    }

    try {
      if (customerModal.customer) {
        await updateCustomerInFirebase(customerModal.customer.id, data);
        triggerAppNotification("👥 CLIENTE ACTUALIZADO", `Se actualizaron los datos de ${data.name}`, "success");
      } else {
        await addCustomerToFirebase(data);
        triggerAppNotification("👥 CLIENTE REGISTRADO", `Se agregó ${data.name} al catálogo`, "success");
      }
      setCustomerModal({ isOpen: false, customer: null });
    } catch (err) {
      console.error("Error al guardar cliente", err);
      triggerAppNotification("⚠️ Error", "No se pudo guardar el cliente en Firestore.", "warning");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este cliente?")) {
      try {
        await deleteCustomerFromFirebase(id);
        triggerAppNotification("🗑️ CLIENTE ELIMINADO", "Cliente removido del catálogo.", "info");
      } catch (err) {
        console.error("Error al eliminar cliente", err);
      }
    }
  };

  return (
    <IonPage>
      {renderMaterialHeader({
        title: "Catálogo de Clientes y Facturación",
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
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div className="max-w-6xl mx-auto py-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              👥 Directorio de Clientes ({customers.length})
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Directorio unificado para Servicio a Domicilio y Facturación Electrónica CFDI 4.0.
            </p>

            {customers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IonIcon icon={peopleOutline} style={{ fontSize: "28px" }} />
                </div>
                <h3 className="font-bold text-slate-700">Sin Clientes</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Aún no has agregado clientes a tu catálogo.
                </p>
                <button
                  onClick={() => setCustomerModal({ isOpen: true, customer: null })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-6 rounded-xl transition cursor-pointer"
                >
                  Agregar Primer Cliente
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-600 uppercase tracking-wider">
                      <th className="p-4 font-bold">Cliente / Razón Social</th>
                      <th className="p-4 font-bold">Teléfono Celular</th>
                      <th className="p-4 font-bold">Datos Fiscales (RFC)</th>
                      <th className="p-4 font-bold">Direcciones Reparto</th>
                      <th className="p-4 font-bold">Visitas</th>
                      <th className="p-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c.id || c.uid} className="hover:bg-slate-50/70 transition text-xs">
                        <td className="p-4">
                          <p className="font-black text-slate-800 text-sm">{c.name}</p>
                          {c.email && <p className="text-slate-500 text-[11px]">{c.email}</p>}
                          {c.notes && <p className="text-amber-700 text-[10px] italic mt-0.5 max-w-xs truncate">📝 {c.notes}</p>}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">
                          📞 {c.phone || "-"}
                        </td>
                        <td className="p-4">
                          {c.rfc ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold text-[11px]">
                                🏛️ {c.rfc}
                              </span>
                              {c.razonSocial && c.razonSocial !== c.name && (
                                <p className="text-[10px] text-slate-500 uppercase truncate max-w-[180px]">{c.razonSocial}</p>
                              )}
                              {c.cp && <p className="text-[10px] text-slate-400 font-mono">CP: {c.cp}</p>}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Sin RFC</span>
                          )}
                        </td>
                        <td className="p-4">
                          {c.addresses && c.addresses.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                              📍 {c.addresses.length} {c.addresses.length === 1 ? 'dirección' : 'direcciones'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Sin dirección</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ⭐ {c.visits || 0}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setCustomerModal({ isOpen: true, customer: c })}
                              className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition border-none bg-transparent cursor-pointer"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c.id || c.uid)}
                              className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition border-none bg-transparent cursor-pointer"
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
          customerModalAddresses={customerModalAddresses || localAddresses}
          newAddressInput={newAddressInput}
          newAddressRefInput={newAddressRefInput}
          setCustomerModalAddresses={setLocalAddresses}
          setNewAddressInput={setNewAddressInput}
          setNewAddressRefInput={setNewAddressRefInput}
          handleSaveCustomer={handleSaveCustomer}
        />
      </IonContent>
    </IonPage>
  );
};
export default CustomersView;
