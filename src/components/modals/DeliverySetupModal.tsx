import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput, IonPage } from '@ionic/react';
import { closeOutline, checkmarkOutline, searchOutline, locationOutline } from 'ionicons/icons';

interface DeliverySetupModalProps {
  deliveryNotes: any;
  deliverySearchQuery: any;
  handleAddNewDeliveryAddressOnTheFly: any;
  handleRegisterAndSelectDeliveryClient: any;
  handleSaveDeliverySetup: any;
  handleSelectDeliveryClient: any;
  isRegisteringDeliveryClient: any;
  newDeliveryClientAddress: any;
  newDeliveryClientAddressRef: any;
  newDeliveryClientName: any;
  newDeliveryClientPhone: any;
  onTheFlyAddressInput: any;
  onTheFlyAddressRefInput: any;
  renderMaterialHeader: any;
  selectedDeliveryAddress: any;
  selectedDeliveryClient: any;
  selectedTable: any;
  setAppMode: any;
  setDeliveryNotes: any;
  setDeliverySearchQuery: any;
  setIsRegisteringDeliveryClient: any;
  setNewDeliveryClientAddress: any;
  setNewDeliveryClientAddressRef: any;
  setNewDeliveryClientName: any;
  setNewDeliveryClientPhone: any;
  setOnTheFlyAddressInput: any;
  setOnTheFlyAddressRefInput: any;
  setSelectedDeliveryAddress: any;
  setSelectedDeliveryClient: any;
  setShowDeliverySetupModal: any;
  showDeliverySetupModal: any;
  filteredCustomers: any;
}

export const DeliverySetupModal: React.FC<DeliverySetupModalProps> = ({
  deliveryNotes,
  deliverySearchQuery,
  handleAddNewDeliveryAddressOnTheFly,
  handleRegisterAndSelectDeliveryClient,
  handleSaveDeliverySetup,
  handleSelectDeliveryClient,
  isRegisteringDeliveryClient,
  newDeliveryClientAddress,
  newDeliveryClientAddressRef,
  newDeliveryClientName,
  newDeliveryClientPhone,
  onTheFlyAddressInput,
  onTheFlyAddressRefInput,
  renderMaterialHeader,
  selectedDeliveryAddress,
  selectedDeliveryClient,
  selectedTable,
  setAppMode,
  setDeliveryNotes,
  setDeliverySearchQuery,
  setIsRegisteringDeliveryClient,
  setNewDeliveryClientAddress,
  setNewDeliveryClientAddressRef,
  setNewDeliveryClientName,
  setNewDeliveryClientPhone,
  setOnTheFlyAddressInput,
  setOnTheFlyAddressRefInput,
  setSelectedDeliveryAddress,
  setSelectedDeliveryClient,
  setShowDeliverySetupModal,
  showDeliverySetupModal,
  filteredCustomers
}) => {
  return (
      <IonModal
        isOpen={showDeliverySetupModal}
        onDidDismiss={() => setShowDeliverySetupModal(false)}
        style={{
          "--height": "100%",
          "--width": "100%",
          "--max-height": "100%",
          "--max-width": "100%",
          "--border-radius": "0px"
        }}
      >
        <IonPage>
          {renderMaterialHeader({
            title: `🛵 Servicio a Domicilio - ${selectedTable?.label || "Mesa"}`,
            subtitle: `Gestión de Cliente, Teléfono y Dirección de Envío`,
            showBack: true,
            onBack: () => setShowDeliverySetupModal(false)
          })}

          <IonContent style={{ "--background": "#f8fafc" }}>
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
              
              {/* HEADER BANNER */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
                    🛵
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-amber-100 uppercase tracking-widest block">CONFIGURACIÓN DE ENTREGA</span>
                    <h2 className="text-xl font-black tracking-tight">
                      {selectedDeliveryClient ? `Cliente: ${selectedDeliveryClient.name}` : "Seleccionar o Registrar Cliente"}
                    </h2>
                    <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                      Asigna el destinatario para la comanda de la {selectedTable?.label || "Mesa"}.
                    </p>
                  </div>
                </div>

                {selectedDeliveryClient && (
                  <button
                    type="button"
                    onClick={() => setSelectedDeliveryClient(null)}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/40 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                  >
                    🔄 Cambiar Cliente
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA: BÚSQUEDA Y REGISTRO DE CLIENTE (7 COLS) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        👥 Buscar en Directorio de Clientes
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsRegisteringDeliveryClient(!isRegisteringDeliveryClient)}
                        className="text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border-none transition cursor-pointer uppercase tracking-wider"
                      >
                        {isRegisteringDeliveryClient ? "📋 Buscar Existente" : "➕ Crear Nuevo Cliente"}
                      </button>
                    </div>

                    {isRegisteringDeliveryClient ? (
                      /* FORMULARIO DE NUEVO CLIENTE */
                      <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                          📝 Registro Express de Nuevo Cliente
                        </span>
                        
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            👤 Nombre Completo *
                          </label>
                          <input
                            type="text"
                            value={newDeliveryClientName}
                            onChange={(e) => setNewDeliveryClientName(e.target.value)}
                            placeholder="Ej. Juan Pérez López"
                            className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            📞 Teléfono de Contacto (10 dígitos) *
                          </label>
                          <input
                            type="tel"
                            value={newDeliveryClientPhone}
                            onChange={(e) => setNewDeliveryClientPhone(e.target.value)}
                            placeholder="Ej. 9511234567"
                            className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            📍 Calle, Número y Colonia
                          </label>
                          <input
                            type="text"
                            value={newDeliveryClientAddress}
                            onChange={(e) => setNewDeliveryClientAddress(e.target.value)}
                            placeholder="Ej. Calle Hidalgo #123, Col. Centro"
                            className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            📝 Referencia de esta Dirección (Opcional)
                          </label>
                          <input
                            type="text"
                            value={newDeliveryClientAddressRef}
                            onChange={(e) => setNewDeliveryClientAddressRef(e.target.value)}
                            placeholder="Ej. Portón blanco, entre Reforma y Juárez, frente al parque"
                            className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleRegisterAndSelectDeliveryClient}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs py-3 rounded-xl shadow-md border-none transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                          <span>💾</span>
                          <span>Guardar y Seleccionar Cliente</span>
                        </button>
                      </div>
                    ) : (
                      /* BUSCADOR Y LISTADO DE CLIENTES */
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={deliverySearchQuery}
                            onChange={(e) => setDeliverySearchQuery(e.target.value)}
                            placeholder="🔎 Buscar por nombre, teléfono o colonia..."
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                          />
                          <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                        </div>

                        <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                          {filteredCustomers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 font-bold text-xs">
                              No se encontraron clientes registrados con esa búsqueda.
                              <br />
                              <button
                                type="button"
                                onClick={() => {
                                  setNewDeliveryClientName(deliverySearchQuery);
                                  setIsRegisteringDeliveryClient(true);
                                }}
                                className="mt-3 text-indigo-600 underline font-black cursor-pointer bg-transparent border-none text-xs"
                              >
                                ➕ Crear cliente "{deliverySearchQuery}"
                              </button>
                            </div>
                          ) : (
                            filteredCustomers.map((client) => {
                              const isSelected = selectedDeliveryClient?.id === client.id || selectedDeliveryClient?.phone === client.phone;
                              return (
                                <div
                                  key={client.id || client.phone}
                                  onClick={() => handleSelectDeliveryClient(client)}
                                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                                      : "border-slate-150 hover:border-indigo-300 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                                      👤
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{client.name}</h4>
                                      <p className="text-[11px] text-slate-500 font-mono font-bold">📞 {client.phone}</p>
                                      {client.addresses?.[0] && (
                                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[240px]">📍 {client.addresses[0]}</p>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border-none transition shrink-0 ${
                                      isSelected
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700"
                                    }`}
                                  >
                                    {isSelected ? "Seleccionado ✓" : "Elegir ⚡"}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMNA DERECHA: DATOS DE ENTREGA & CONFIRMACIÓN (5 COLS) */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                      📍 Datos de Envío & Referencias
                    </h3>

                    {!selectedDeliveryClient ? (
                      <div className="text-center py-12 text-slate-400 font-bold text-xs space-y-2">
                        <div className="text-4xl">👈</div>
                        <p>Selecciona o registra un cliente en el panel de la izquierda para configurar su dirección y notas de envío.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* RESUMEN CLIENTE */}
                        <div className="bg-indigo-50/80 border border-indigo-150 rounded-2xl p-3.5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">CLIENTE ASIGNADO</span>
                            <h4 className="text-xs font-black text-indigo-950 uppercase">{selectedDeliveryClient.name}</h4>
                            <p className="text-[11px] font-mono font-bold text-indigo-750">📞 {selectedDeliveryClient.phone}</p>
                          </div>
                          <span className="text-2xl">✅</span>
                        </div>

                        {/* SELECCIÓN DE DIRECCIÓN */}
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                            📍 Selección de Dirección de Entrega *
                          </label>

                          <div className="space-y-2 mb-3">
                            {(selectedDeliveryClient.addresses || []).map((addrItem: string, idx: number) => {
                              let addrText = addrItem;
                              let refText = "";
                              if (addrItem.includes("(Ref:")) {
                                const parts = addrItem.split("(Ref:");
                                addrText = parts[0].trim();
                                refText = parts[1].replace(")", "").trim();
                              } else if (addrItem.includes("| Ref:")) {
                                const parts = addrItem.split("| Ref:");
                                addrText = parts[0].trim();
                                refText = parts[1].trim();
                              }

                              const isChecked = selectedDeliveryAddress === addrItem;

                              return (
                                <label
                                  key={idx}
                                  onClick={() => {
                                    setSelectedDeliveryAddress(addrItem);
                                    if (refText) setDeliveryNotes(refText);
                                  }}
                                  className={`flex items-start gap-2.5 p-3 rounded-xl border-2 transition cursor-pointer ${
                                    isChecked
                                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="deliveryAddress"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedDeliveryAddress(addrItem);
                                      if (refText) setDeliveryNotes(refText);
                                    }}
                                    className="mt-1 accent-indigo-600"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-800 leading-snug">📍 {addrText}</p>
                                    {refText && (
                                      <p className="text-[11px] font-semibold text-amber-700 mt-0.5 leading-tight">
                                        📝 <span className="font-bold">Ref:</span> {refText}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>

                          {/* AGREGAR OTRA DIRECCIÓN CON REFERENCIA */}
                          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 space-y-2">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                              ➕ Añadir Otra Dirección a este Cliente
                            </span>
                            <input
                              type="text"
                              value={onTheFlyAddressInput}
                              onChange={(e) => setOnTheFlyAddressInput(e.target.value)}
                              placeholder="📍 Dirección (Calle, Número, Col)"
                              className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={onTheFlyAddressRefInput}
                              onChange={(e) => setOnTheFlyAddressRefInput(e.target.value)}
                              placeholder="📝 Referencia (Fachada, portón, entre calles)"
                              className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (onTheFlyAddressInput.trim()) {
                                  handleAddNewDeliveryAddressOnTheFly(onTheFlyAddressInput, onTheFlyAddressRefInput);
                                }
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-black py-2 rounded-xl transition cursor-pointer border-none shadow-xs uppercase tracking-wider"
                            >
                              ➕ Agregar Dirección con Referencia
                            </button>
                          </div>
                        </div>

                        {/* NOTAS Y REFERENCIAS */}
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            📝 Referencias / Notas de Envío (Opcional)
                          </label>
                          <textarea
                            rows={3}
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            placeholder="Ej. Casa portón blanco, llamar al llegar, dejar en recepción..."
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                          />
                        </div>

                        {/* BOTÓN FINAL DE GUARDAR Y TOMAR PEDIDO */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await handleSaveDeliverySetup();
                              setAppMode("menu");
                            }}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-sm py-4 rounded-2xl shadow-lg border-none transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <span>🛵</span>
                            <span>Guardar Cliente y Pasar al Menú 🌮</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </IonContent>
        </IonPage>
      </IonModal>
  );
};
