import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface SupplierModalProps {
  supplierModal: any;
  setSupplierModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  supplierModal,
  setSupplierModal,
  triggerAppNotification
}) => {
  return (
          <IonModal
            isOpen={supplierModal.isOpen}
            onDidDismiss={() =>
              setSupplierModal({ isOpen: false, supplier: null })
            }
          >
            <IonHeader className="ion-no-border">
              <IonToolbar
                style={{
                  "--background": "rgb(40, 45, 52)",
                  "--color": "white",
                }}
              >
                <IonTitle>
                  {supplierModal.supplier
                    ? "✏️ Editar Proveedor"
                    : "🤝 Nuevo Proveedor"}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton
                    onClick={() =>
                      setSupplierModal({ isOpen: false, supplier: null })
                    }
                  >
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <form
                onSubmit={handleSaveSupplier}
                className="space-y-4 max-w-lg mx-auto py-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    name="supName"
                    type="text"
                    required
                    defaultValue={supplierModal.supplier?.name || ""}
                    placeholder="Distribuidora de Alimentos S.A."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Categoría
                    </label>
                    <select
                      name="supCategory"
                      defaultValue={
                        supplierModal.supplier?.category || "Ingredientes"
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
                    >
                      <option value="Ingredientes">Ingredientes 🍅</option>
                      <option value="Bebidas">Bebidas 🍹</option>
                      <option value="Abarrotes">Abarrotes 🍝</option>
                      <option value="Carnes">Carnes / Mariscos 🥩</option>
                      <option value="Desechables">
                        Desechables / Vajilla 📦
                      </option>
                      <option value="Servicios">Servicios / Sistemas ⚙️</option>
                      <option value="Otros">Otros ⚙️</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Visita Programada
                    </label>
                    <select
                      name="supFrequency"
                      defaultValue={
                        supplierModal.supplier?.frequency || "diario"
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
                    >
                      <option value="diario">Diario 📅</option>
                      <option value="semanal">Semanal 📆</option>
                      <option value="tres_dias">Cada 3 Días 🗓️</option>
                      <option value="quincenal">Quincenal 📂</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Teléfono
                    </label>
                    <input
                      name="supPhone"
                      type="tel"
                      defaultValue={supplierModal.supplier?.phone || ""}
                      placeholder="55-1234-5678"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
                    ></input>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Email
                  </label>
                  <input
                    name="supEmail"
                    type="email"
                    defaultValue={supplierModal.supplier?.email || ""}
                    placeholder="contacto@proveedor.com"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Dirección Física
                  </label>
                  <input
                    name="supAddress"
                    type="text"
                    defaultValue={supplierModal.supplier?.address || ""}
                    placeholder="Av. Paseo de la Reforma 123, CDMX"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Notas / Detalles de Proveeduría
                  </label>
                  <textarea
                    name="supNotes"
                    rows={3}
                    defaultValue={supplierModal.supplier?.notes || ""}
                    placeholder="Tiempo de entrega estimado: 2 días. Pago contra entrega."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Guardar Proveedor
                  </button>
                </div>
              </form>
            </IonContent>
          </IonModal>
  );
};
