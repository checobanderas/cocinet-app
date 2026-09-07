import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonPage } from '@ionic/react';

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
  allCustomers?: any[];
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
  filteredCustomers,
  allCustomers = []
}) => {
  const [phoneSearch, setPhoneSearch] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // Sincronizar teléfono si ya hay cliente seleccionado
  useEffect(() => {
    if (selectedDeliveryClient?.phone) {
      setPhoneSearch(selectedDeliveryClient.phone);
    }
  }, [selectedDeliveryClient]);

  // Búsqueda instantánea por teléfono como LLAVE PRINCIPAL
  const cleanPhoneInput = phoneSearch.replace(/\D/g, "");
  const matchedClientByPhone = cleanPhoneInput.length >= 7 
    ? (allCustomers.length > 0 ? allCustomers : filteredCustomers).find((c: any) => {
        const cPhone = (c.phone || "").replace(/\D/g, "");
        return cPhone.endsWith(cleanPhoneInput) || cleanPhoneInput.endsWith(cPhone);
      })
    : null;

  // Auto-seleccionar cliente si coincide exactamente por teléfono
  const handlePhoneInputChange = (val: string) => {
    setPhoneSearch(val);
    setNewDeliveryClientPhone(val);
    const cleaned = val.replace(/\D/g, "");
    
    if (cleaned.length >= 10) {
      const match = (allCustomers.length > 0 ? allCustomers : filteredCustomers).find((c: any) => {
        const cPhone = (c.phone || "").replace(/\D/g, "");
        return cPhone === cleaned;
      });
      if (match) {
        handleSelectDeliveryClient(match);
        setIsRegisteringDeliveryClient(false);
      }
    }
  };

  // Función para capturar coordenadas GPS en vivo
  const handleCaptureGPS = (target: "new" | "onthefly") => {
    if (!navigator.geolocation) {
      alert("Tu dispositivo o navegador no soporta geolocalización GPS ⚠️");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const mapsTag = `[GPS: https://www.google.com/maps?q=${lat},${lng}]`;
        
        if (target === "new") {
          if (!newDeliveryClientAddressRef.includes("[GPS:")) {
            setNewDeliveryClientAddressRef(prev => prev ? `${prev} ${mapsTag}` : mapsTag);
          }
        } else {
          if (!onTheFlyAddressRefInput.includes("[GPS:")) {
            setOnTheFlyAddressRefInput(prev => prev ? `${prev} ${mapsTag}` : mapsTag);
          }
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn("Error capturando GPS:", err);
        alert("No se pudo obtener la ubicación GPS. Verifica los permisos de ubicación.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Helper para parsear una dirección guardada
  const parseAddressItem = (rawAddr: string) => {
    let cleanAddr = rawAddr || "";
    let refText = "";
    let mapsLink = "";

    if (cleanAddr.includes("[GPS:")) {
      const gpsMatch = cleanAddr.match(/\[GPS:\s*(https:\/\/[^\]]+)\]/);
      if (gpsMatch) {
        mapsLink = gpsMatch[1];
        cleanAddr = cleanAddr.replace(gpsMatch[0], "").trim();
      }
    }

    if (cleanAddr.includes("(Ref:")) {
      const parts = cleanAddr.split("(Ref:");
      cleanAddr = parts[0].trim();
      refText = parts[1].replace(")", "").trim();
    } else if (cleanAddr.includes("| Ref:")) {
      const parts = cleanAddr.split("| Ref:");
      cleanAddr = parts[0].trim();
      refText = parts[1].trim();
    }

    return { cleanAddr, refText, mapsLink };
  };

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
          subtitle: `Búsqueda por Teléfono, Gestión de Direcciones y GPS`,
          showBack: true,
          onBack: () => setShowDeliverySetupModal(false)
        })}

        <IonContent style={{ "--background": "#f8fafc" }}>
          <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-28">
            
            {/* BANNER PRINCIPAL DE SERVICIO A DOMICILIO */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
                  🛵
                </div>
                <div>
                  <span className="text-[11px] font-black text-amber-100 uppercase tracking-widest block">
                    REPARTO / SERVICIO A DOMICILIO
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    {selectedDeliveryClient ? `Cliente: ${selectedDeliveryClient.name}` : "Teléfono del Cliente (Llave Principal)"}
                  </h2>
                  <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                    {selectedTable?.label ? `Asignando orden a la mesa ${selectedTable.label}` : "Selecciona o registra el cliente de entrega"}
                  </p>
                </div>
              </div>

              {selectedDeliveryClient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeliveryClient(null);
                    setSelectedDeliveryAddress("");
                    setDeliveryNotes("");
                    setPhoneSearch("");
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/40 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 active:scale-95 shadow-sm"
                >
                  🔄 Cambiar Cliente / Teléfono
                </button>
              )}
            </div>

            {/* SECCIÓN 1: BUSCADOR POR TELÉFONO COMO LLAVE PRINCIPAL */}
            {!selectedDeliveryClient && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      📞 1. Escribe el Teléfono del Cliente
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      El sistema detectará si ya cuenta con una o más direcciones registradas.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsRegisteringDeliveryClient(!isRegisteringDeliveryClient)}
                    className="text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border-none transition cursor-pointer uppercase tracking-wider self-start sm:self-auto"
                  >
                    {isRegisteringDeliveryClient ? "📋 Buscar por Directorio" : "➕ Formulario Nuevo"}
                  </button>
                </div>

                {/* CAMPO DE TELÉFONO DESTACADO */}
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-indigo-200/80 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                  <label className="block text-[11px] font-black text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>📞 Teléfono Celular (10 dígitos)</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black">Llave Principal</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      value={phoneSearch}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      placeholder="Ej. 951 123 4567"
                      className="w-full bg-transparent border-none text-lg sm:text-xl font-mono font-black text-slate-900 focus:outline-none tracking-wider"
                      autoFocus
                    />
                    {phoneSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneSearch("");
                          setNewDeliveryClientPhone("");
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm cursor-pointer bg-transparent border-none"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* RESULTADO DE LA BÚSQUEDA POR TELÉFONO */}
                {matchedClientByPhone ? (
                  /* CLIENTE ENCONTRADO */
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-sm">
                          👤
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">
                            ✅ CLIENTE REGISTRADO ENCONTRADO
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase">{matchedClientByPhone.name}</h4>
                          <p className="text-xs font-mono font-bold text-emerald-800">📞 {matchedClientByPhone.phone}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectDeliveryClient(matchedClientByPhone)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md border-none transition cursor-pointer uppercase tracking-wider shrink-0"
                      >
                        Elegir Cliente ⚡
                      </button>
                    </div>

                    {/* DIRECCIONES DEL CLIENTE ENCONTRADO */}
                    <div className="pt-2 border-t border-emerald-200">
                      <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block mb-2">
                        📍 Direcciones Registradas ({(matchedClientByPhone.addresses || []).length}):
                      </span>
                      <div className="space-y-2">
                        {(matchedClientByPhone.addresses || []).map((addr: string, i: number) => {
                          const parsed = parseAddressItem(addr);
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                handleSelectDeliveryClient(matchedClientByPhone);
                                setSelectedDeliveryAddress(addr);
                                if (parsed.refText) setDeliveryNotes(parsed.refText);
                              }}
                              className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between gap-2 shadow-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">📍 {parsed.cleanAddr}</p>
                                {parsed.refText && (
                                  <p className="text-[11px] font-medium text-amber-700 truncate">📝 Ref: {parsed.refText}</p>
                                )}
                              </div>
                              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                                Usar Dirección #{i + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : cleanPhoneInput.length >= 10 && !isRegisteringDeliveryClient ? (
                  /* TELÉFONO NO ENCONTRADO -> OFRECER REGISTRO RÁPIDO */
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-center space-y-3">
                    <div className="text-3xl">✨</div>
                    <div>
                      <h4 className="text-sm font-black text-amber-950 uppercase">
                        Teléfono {phoneSearch} no registrado
                      </h4>
                      <p className="text-xs text-amber-800 font-medium mt-0.5">
                        Este cliente es nuevo. Completa sus datos para guardarlo en el directorio y no volver a pedírselos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDeliveryClientPhone(phoneSearch);
                        setIsRegisteringDeliveryClient(true);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md border-none transition cursor-pointer uppercase tracking-wider inline-flex items-center gap-2"
                    >
                      <span>📝</span>
                      <span>Registrar Nuevo Cliente con este Teléfono</span>
                    </button>
                  </div>
                ) : null}

                {/* FORMULARIO DIRECTO DE NUEVO CLIENTE */}
                {isRegisteringDeliveryClient && (
                  <div className="space-y-4 bg-indigo-50/50 p-5 rounded-2xl border-2 border-indigo-200">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📝 Registro de Nuevo Cliente</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsRegisteringDeliveryClient(false)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                          👤 Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={newDeliveryClientName}
                          onChange={(e) => setNewDeliveryClientName(e.target.value)}
                          placeholder="Ej. Juan Pérez López"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                          📞 Teléfono (10 dígitos) *
                        </label>
                        <input
                          type="tel"
                          value={newDeliveryClientPhone}
                          onChange={(e) => setNewDeliveryClientPhone(e.target.value)}
                          placeholder="Ej. 9511234567"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        📍 Calle, Número y Colonia *
                      </label>
                      <input
                        type="text"
                        value={newDeliveryClientAddress}
                        onChange={(e) => setNewDeliveryClientAddress(e.target.value)}
                        placeholder="Ej. Av. Hidalgo #123 entre Morelos y Juárez, Col. Centro"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                          📝 Referencias / Fachada (Opcional)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleCaptureGPS("new")}
                          disabled={gpsLoading}
                          className="text-[11px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border-none transition cursor-pointer flex items-center gap-1"
                          title="Obtener ubicación GPS exacta del repartidor o negocio"
                        >
                          <span>📍</span>
                          <span>{gpsLoading ? "Capturando..." : "Obtener GPS actual"}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newDeliveryClientAddressRef}
                        onChange={(e) => setNewDeliveryClientAddressRef(e.target.value)}
                        placeholder="Ej. Portón blanco con zaguán negro, frente a la tienda"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterAndSelectDeliveryClient}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs py-3.5 rounded-xl shadow-md border-none transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <span>💾</span>
                      <span>Guardar Cliente y Asignar Pedido</span>
                    </button>
                  </div>
                )}

                {/* BÚSQUEDA ALTERNATIVA POR NOMBRE O COLONIA */}
                {!isRegisteringDeliveryClient && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                      O buscar por nombre o colonia en el directorio:
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        value={deliverySearchQuery}
                        onChange={(e) => setDeliverySearchQuery(e.target.value)}
                        placeholder="🔎 Buscar por nombre o colonia..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
                    </div>

                    {deliverySearchQuery.trim() && (
                      <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                        {filteredCustomers.length === 0 ? (
                          <div className="text-center py-4 text-slate-400 font-bold text-xs">
                            No se encontraron clientes con "{deliverySearchQuery}".
                          </div>
                        ) : (
                          filteredCustomers.map((client: any) => (
                            <div
                              key={client.id || client.phone}
                              onClick={() => handleSelectDeliveryClient(client)}
                              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-between gap-3"
                            >
                              <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase">{client.name}</h4>
                                <p className="text-[11px] text-slate-500 font-mono font-bold">📞 {client.phone}</p>
                              </div>
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-black border-none transition"
                              >
                                Elegir ⚡
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN 2: CLIENTE ASIGNADO & SELECCIÓN DE DIRECCIÓN */}
            {selectedDeliveryClient && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA: GESTIÓN DE MÚLTIPLES DIRECCIONES */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">PASO 2</span>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                          📍 Selecciona la Dirección de Entrega
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                        className="text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border-none transition cursor-pointer uppercase tracking-wider"
                      >
                        {showAddAddressForm ? "Ver Direcciones" : "➕ Otra Dirección"}
                      </button>
                    </div>

                    {/* LISTA DE DIRECCIONES GUARDADAS (1, 2, 3 o más) */}
                    {(!selectedDeliveryClient.addresses || selectedDeliveryClient.addresses.length === 0) ? (
                      <div className="text-center py-6 text-slate-400 font-bold text-xs space-y-2">
                        <p>Este cliente no tiene direcciones registradas aún.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 font-medium">
                          {(selectedDeliveryClient.addresses || []).length > 1
                            ? `Este cliente tiene ${(selectedDeliveryClient.addresses || []).length} direcciones registradas. Elige a cuál enviar:`
                            : "Dirección registrada para este cliente:"}
                        </p>

                        <div className="space-y-2.5">
                          {(selectedDeliveryClient.addresses || []).map((addrItem: string, idx: number) => {
                            const parsed = parseAddressItem(addrItem);
                            const isSelected = selectedDeliveryAddress === addrItem;

                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedDeliveryAddress(addrItem);
                                  if (parsed.refText) setDeliveryNotes(parsed.refText);
                                }}
                                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between gap-3 ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                                    : "border-slate-200 hover:border-indigo-300 bg-slate-50/50"
                                }`}
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                                  }`}>
                                    {isSelected && <span className="text-[10px] font-black">✓</span>}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                                        Dirección #{idx + 1}
                                      </span>
                                      {isSelected && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-600 text-white rounded-md">
                                          Seleccionada ✅
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                      📍 {parsed.cleanAddr}
                                    </p>
                                    {parsed.refText && (
                                      <p className="text-xs font-semibold text-amber-800">
                                        📝 <span className="font-bold">Ref:</span> {parsed.refText}
                                      </p>
                                    )}
                                    {parsed.mapsLink && (
                                      <a
                                        href={parsed.mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 hover:underline mt-1"
                                      >
                                        <span>🗺️</span>
                                        <span>Ver en Google Maps</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* FORMULARIO PARA AGREGAR NUEVA DIRECCIÓN A ESTE CLIENTE */}
                    {(showAddAddressForm || (!selectedDeliveryClient.addresses || selectedDeliveryClient.addresses.length === 0)) && (
                      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-indigo-200 space-y-3 pt-4">
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                          ➕ Añadir Nueva Dirección a {selectedDeliveryClient.name}
                        </span>
                        
                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
                            📍 Nueva Calle, Número y Colonia
                          </label>
                          <input
                            type="text"
                            value={onTheFlyAddressInput}
                            onChange={(e) => setOnTheFlyAddressInput(e.target.value)}
                            placeholder="Ej. Calle Morelos #456, Col. Reforma"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-black text-slate-600 uppercase">
                              📝 Referencias de esta Dirección
                            </label>
                            <button
                              type="button"
                              onClick={() => handleCaptureGPS("onthefly")}
                              disabled={gpsLoading}
                              className="text-[10px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded border-none transition cursor-pointer flex items-center gap-1"
                            >
                              <span>📍</span>
                              <span>{gpsLoading ? "GPS..." : "Obtener GPS"}</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={onTheFlyAddressRefInput}
                            onChange={(e) => setOnTheFlyAddressRefInput(e.target.value)}
                            placeholder="Ej. Casa verde dos pisos, timbre blanco"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onTheFlyAddressInput.trim()) {
                              handleAddNewDeliveryAddressOnTheFly(onTheFlyAddressInput, onTheFlyAddressRefInput);
                              setShowAddAddressForm(false);
                            } else {
                              alert("Ingresa la dirección para guardarla ⚠️");
                            }
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer border-none shadow-sm uppercase tracking-wider"
                        >
                          💾 Guardar y Seleccionar Esta Dirección
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* COLUMNA DERECHA: RESUMEN DE ENTREGA Y CONFIRMACIÓN */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">PASO 3</span>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                      📋 Resumen de la Orden
                    </h3>

                    {/* FICHA CLIENTE */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CLIENTE</span>
                          <h4 className="text-sm font-black text-slate-900 uppercase">{selectedDeliveryClient.name}</h4>
                          <p className="text-xs font-mono font-bold text-indigo-600">📞 {selectedDeliveryClient.phone}</p>
                        </div>
                        <span className="text-2xl">👤</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">DIRECCIÓN ASIGNADA</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {selectedDeliveryAddress ? `📍 ${parseAddressItem(selectedDeliveryAddress).cleanAddr}` : "⚠️ Ninguna dirección seleccionada"}
                        </p>
                      </div>
                    </div>

                    {/* NOTAS Y REFERENCIAS EDITABLES */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        📝 Instrucciones de Envío para Repartidor / Cocina
                      </label>
                      <textarea
                        rows={3}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Ej. Llevar cambio de $500, no tocar timbre, salsa aparte..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 resize-none shadow-inner"
                      />
                    </div>

                    {/* BOTÓN FINAL DE CONFIRMAR Y ABRIR MENÚ */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!selectedDeliveryAddress) {
                            alert("Por favor selecciona una dirección de entrega ⚠️");
                            return;
                          }
                          await handleSaveDeliverySetup();
                          setAppMode("menu");
                        }}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-sm py-4 rounded-2xl shadow-xl border-none transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span>🛵</span>
                        <span>Confirmar y Tomar Pedido 🌮</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </IonContent>
      </IonPage>
    </IonModal>
  );
};
