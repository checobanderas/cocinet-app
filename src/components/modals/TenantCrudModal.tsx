import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { trashOutline, saveOutline, swapHorizontalOutline, documentTextOutline, mapOutline, colorPaletteOutline, businessOutline, closeOutline } from 'ionicons/icons';
import { CompanyTenant } from '../utils/companyCatalog';

interface TenantCrudModalProps {
  showTenantCrudModal: boolean;
  setShowTenantCrudModal: (v: boolean) => void;
  editingTenant: any;
  resetTenantForm: () => void;
  COMPANY_CATALOG: CompanyTenant[];
  customOwners: any[];
  dependentBranches: any[];
  formTenantType: string;
  setFormTenantType: (v: string) => void;
  formTenantName: string;
  setFormTenantName: (v: string) => void;
  formTenantPropietario: string;
  setFormTenantPropietario: (v: string) => void;
  formTenantOwnerKey: string;
  setFormTenantOwnerKey: (v: string) => void;
  formTenantSucursal: string;
  setFormTenantSucursal: (v: string) => void;
  formTenantRfc: string;
  setFormTenantRfc: (v: string) => void;
  formTenantDireccion: string;
  setFormTenantDireccion: (v: string) => void;
  formTenantEmail: string;
  setFormTenantEmail: (v: string) => void;
  formTenantLat: string;
  setFormTenantLat: (v: string) => void;
  formTenantLng: string;
  setFormTenantLng: (v: string) => void;
  formTenantLogoUrl: string;
  setFormTenantLogoUrl: (v: string) => void;
  formTenantAvatar: string;
  setFormTenantAvatar: (v: string) => void;
  formTenantAccentColor: string;
  setFormTenantAccentColor: (v: string) => void;
  formTenantRequireInternalFolio: boolean;
  setFormTenantRequireInternalFolio: (v: boolean) => void;
  transferStep: number;
  setTransferStep: (v: number) => void;
  transferTargetOwnerKey: string;
  setTransferTargetOwnerKey: (v: string) => void;
  transferIncludeBranches: boolean;
  setTransferIncludeBranches: (v: boolean) => void;
  handleSaveTenant: () => Promise<void>;
  handleDeleteTenant: () => Promise<void>;
  executeTenantTransfer: () => Promise<void>;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
  setSelectedTenant: any;
  setShowBluetoothConfigModal: any;
}

export const TenantCrudModal: React.FC<TenantCrudModalProps> = ({
  showTenantCrudModal,
  setShowTenantCrudModal,
  editingTenant,
  resetTenantForm,
  COMPANY_CATALOG,
  customOwners,
  dependentBranches,
  formTenantType,
  setFormTenantType,
  formTenantName,
  setFormTenantName,
  formTenantPropietario,
  setFormTenantPropietario,
  formTenantOwnerKey,
  setFormTenantOwnerKey,
  formTenantSucursal,
  setFormTenantSucursal,
  formTenantRfc,
  setFormTenantRfc,
  formTenantDireccion,
  setFormTenantDireccion,
  formTenantEmail,
  setFormTenantEmail,
  formTenantLat,
  setFormTenantLat,
  formTenantLng,
  setFormTenantLng,
  formTenantLogoUrl,
  setFormTenantLogoUrl,
  formTenantAvatar,
  setFormTenantAvatar,
  formTenantAccentColor,
  setFormTenantAccentColor,
  formTenantRequireInternalFolio,
  setFormTenantRequireInternalFolio,
  transferStep,
  setTransferStep,
  transferTargetOwnerKey,
  setTransferTargetOwnerKey,
  transferIncludeBranches,
  setTransferIncludeBranches,
  handleSaveTenant,
  handleDeleteTenant,
  executeTenantTransfer,
  triggerAppNotification,
  setSelectedTenant, setShowBluetoothConfigModal
}) => {

    // Get all Matrices for "Asociar a Matriz" dropdown
    const matrices = COMPANY_CATALOG.filter(c => c.type === "Matriz");

    return (
      <IonModal
        isOpen={showTenantCrudModal}
        onDidDismiss={() => {
          setShowTenantCrudModal(false);
          resetTenantForm();
        }}
        style={{
          "--height": "100%",
          "--width": "100%",
          "--max-height": "95vh",
          "--max-width": "700px",
          "--border-radius": "24px",
        }}
      >
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "#f8fafc", padding: "8px 16px" }}>
            <IonTitle style={{ fontSize: "1.1rem", fontWeight: "900", color: "#1e293b", paddingLeft: "0" }}>
              🛠️ {editingTenant ? `Editar Inquilino: ${editingTenant.name}` : "Registrar Nuevo Inquilino / Sucursal"}
            </IonTitle>
            <IonButtons slot="end">
              <button
                type="button"
                onClick={() => {
                  setShowTenantCrudModal(false);
                  resetTenantForm();
                }}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-full cursor-pointer transition-all border-none font-bold text-sm"
              >
                ✕
              </button>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="space-y-5 pb-8">
            <p className="text-xs font-bold text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
              🔑 <span className="text-amber-800">Consola de Control de Red (PIN 2052):</span> Configura, edita o elimina inquilinos y sus sucursales. Las sucursales asignadas se asociarán automáticamente con su respectiva matriz de red heredando su propietario y clave.
            </p>

            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Tipo de Registro
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTenantType("Matriz");
                      setFormTenantOwnerKey("");
                      setFormTenantPropietario("");
                    }}
                    className={`py-3 px-4 rounded-xl font-extrabold text-xs uppercase flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      formTenantType === "Matriz"
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🏡 Casa Matriz
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTenantType("Sucursal");
                      if (matrices.length > 0) {
                        const m = matrices[0];
                        setFormTenantOwnerKey(m.ownerKey || "");
                        setFormTenantPropietario(m.propietario || "");
                        setFormTenantEmail(m.ownerEmail || "");
                        setFormTenantAvatar(m.avatar || "🏢");
                        setFormTenantAccentColor(m.accentColor || "#4f46e5");
                      }
                    }}
                    className={`py-3 px-4 rounded-xl font-extrabold text-xs uppercase flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      formTenantType === "Sucursal"
                        ? "bg-teal-650 border-teal-650 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                    style={formTenantType === "Sucursal" ? { backgroundColor: "#0d9488", borderColor: "#0d9488" } : {}}
                  >
                    📍 Sucursal / Punto de Venta
                  </button>
                </div>
              </div>

              {/* Asociar a Propietario de Red (For both Matriz and Sucursal) */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Asociar a Propietario de Red Existente 👑
                </label>
                <select
                  value={formTenantOwnerKey}
                  onChange={(e) => {
                    const matched = customOwners.find(o => o.key === e.target.value);
                    if (matched) {
                      setFormTenantOwnerKey(matched.key);
                      setFormTenantPropietario(matched.name);
                      setFormTenantAvatar(matched.avatar || "🏢");
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">-- Seleccionar Propietario Registrado --</option>
                  {customOwners.map(o => (
                    <option key={o.key} value={o.key}>
                      {o.avatar} {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* If Sucursal, choose Matriz optionally to copy settings */}
              {formTenantType === "Sucursal" && matrices.length > 0 && (
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Asociar / Copiar Configuración de Matriz Existente (Opcional)
                  </label>
                  <select
                    onChange={(e) => {
                      const matched = matrices.find(m => m.id === e.target.value || m.ownerKey === e.target.value);
                      if (matched) {
                        setFormTenantOwnerKey(matched.ownerKey || "");
                        setFormTenantPropietario(matched.propietario || "");
                        setFormTenantEmail(matched.ownerEmail || "");
                        setFormTenantAvatar(matched.avatar || "🏢");
                        setFormTenantAccentColor(matched.accentColor || "#4f46e5");
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="">-- No asociar/copiar de matriz --</option>
                    {matrices.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name} ({m.propietario})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Propietario ID and Owner Key inputs (For both Matriz and Sucursal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Identificador de Propietario (Grupo)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: JORGE-SORAYA"
                    value={formTenantPropietario}
                    onChange={(e) => setFormTenantPropietario(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Clave de Red (ownerKey)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 11 (Auto-generado si se deja vacío)"
                    value={formTenantOwnerKey}
                    onChange={(e) => setFormTenantOwnerKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Nombre Comercial / Empresa
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tacos El Sombrerudo Sucursal Reforma"
                  value={formTenantName}
                  onChange={(e) => setFormTenantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* RFC & Sucursal name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    RFC
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: SOM160101XOX"
                    value={formTenantRfc}
                    onChange={(e) => setFormTenantRfc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-indigo-500 transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Nombre del Punto de Venta (ID Sucursal)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Reforma, Centro, etc."
                    value={formTenantSucursal}
                    onChange={(e) => setFormTenantSucursal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              
              {/* Direccion & Coordinates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    📍 Dirección de la Sucursal / Matriz
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Av. Reforma #1234, Col. Centro, CP 06000, CDMX"
                    value={formTenantDireccion}
                    onChange={(e) => setFormTenantDireccion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Geolocation Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        alert("Tu navegador no soporta geolocalización");
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setFormTenantLat(Number(position.coords.latitude.toFixed(6)));
                          setFormTenantLng(Number(position.coords.longitude.toFixed(6)));
                          triggerAppNotification("📍 Ubicación Actual", "Coordenadas obtenidas correctamente", "success");
                        },
                        (error) => {
                          console.error("Error getting location:", error);
                          alert("Error al obtener ubicación: " + error.message);
                        }
                      );
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95"
                  >
                    📍 Usar Ubicación Actual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const query = formTenantDireccion || formTenantName || "Restaurante";
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                      window.open(url, "_blank");
                      triggerAppNotification("🗺️ Google Maps", "Busca el lugar, copia las coordenadas y pégalas abajo.", "info");
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95"
                  >
                    🔍 Buscar en Google Maps
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="17.0654"
                      value={formTenantLat}
                      onChange={(e) => setFormTenantLat(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="-96.7236"
                      value={formTenantLng}
                      onChange={(e) => setFormTenantLng(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Owner email */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Email de Contacto (Administrador)
                </label>
                <input
                  type="email"
                  placeholder="Ej: administrador@sombrerudos.mx"
                  value={formTenantEmail}
                  onChange={(e) => setFormTenantEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>



              {/* Visual customizations (Avatar and Accent color) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Icono / Emoji
                  </label>
                  <div className="flex gap-2 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {["🏢", "🤠", "🌮", "🌯", "🥗", "🌿", "🏛️", "🎩", "👒", "👑", "🎓", "🍕", "🍔"].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormTenantAvatar(emoji)}
                        className={`w-9 h-9 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          formTenantAvatar === emoji ? "bg-indigo-600 text-white scale-110 shadow-sm" : "bg-white border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Color Distintivo (Accent Color)
                  </label>
                  <div className="flex gap-2 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {[
                      { hex: "#dc2626", label: "Rojo" },
                      { hex: "#059669", label: "Verde" },
                      { hex: "#ca8a04", label: "Amarillo" },
                      { hex: "#2563eb", label: "Azul" },
                      { hex: "#7c3aed", label: "Morado" },
                      { hex: "#db2777", label: "Rosa" },
                      { hex: "#14b8a6", label: "Turquesa" },
                      { hex: "#f59e0b", label: "Naranja" }
                    ].map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFormTenantAccentColor(col.hex)}
                        title={col.label}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
                          formTenantAccentColor === col.hex ? "border-slate-800 scale-110 shadow-sm" : "border-transparent"
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Logotipo del Inquilino / Sucursal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-4">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  🖼️ Logotipo de este Inquilino / Sucursal
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                    {formTenantLogoUrl ? (
                      <img src={formTenantLogoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold text-center p-1 uppercase leading-tight">Sin Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10.5px] font-black rounded-lg cursor-pointer border border-indigo-200/50 transition-all uppercase inline-block m-0">
                        📥 Subir Imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 250 * 1024) {
                                triggerAppNotification("⚠️ Imagen Grande", "El logotipo es un poco pesado, pero intentaremos guardarlo.", "warning");
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormTenantLogoUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {formTenantLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormTenantLogoUrl("")}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10.5px] font-black rounded-lg cursor-pointer border border-rose-200/50 transition-all uppercase border-none"
                        >
                          ✕ Quitar
                        </button>
                      )}
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-bold leading-normal m-0">
                      Sube una imagen para los tickets impresos de la cuenta y del corte 🖨️
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción Folio Interno */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 flex items-center justify-between">
                <div className="pr-3">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <span>📋</span> Exigir Folio Interno por Comanda
                  </label>
                  <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                    Si está activado, el sistema solicitará capturar y confirmar el folio de comanda al enviar cada pedido en esta sucursal.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formTenantRequireInternalFolio}
                  onChange={(e) => setFormTenantRequireInternalFolio(e.target.checked)}
                  className="w-6 h-6 accent-indigo-600 rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Sección Traspaso de Inquilino a otro Propietario / Dueño (Despliegue Inline sin modales) */}
              {editingTenant && (
                <div className="mt-5 text-left">
                  {transferStep === 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🔄</span>
                        <div>
                          <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider m-0">
                            Traspaso de Inquilino a Otro Propietario / Dueño
                          </h4>
                          <p className="text-[11px] font-bold text-amber-800 m-0 mt-0.5 leading-snug">
                            Selecciona el nuevo propietario de destino para transferir la propiedad de este inquilino ({editingTenant.type}) actualmente asignado a <strong>{editingTenant.propietario}</strong> (Clave: {editingTenant.ownerKey}).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
                        <div className="sm:col-span-2">
                          <label className="block text-[10.5px] font-black text-amber-900 uppercase tracking-wider mb-1">
                            📥 Seleccionar Dueño de Destino:
                          </label>
                          <select
                            value={transferTargetOwnerKey}
                            onChange={(e) => setTransferTargetOwnerKey(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-600 shadow-xs cursor-pointer"
                          >
                            <option value="">-- Seleccionar Dueño Destino --</option>
                            {customOwners.map(o => (
                              <option key={o.key} value={o.key} disabled={o.key === editingTenant.ownerKey}>
                                {o.avatar} {o.name} (Clave: {o.key}) {o.key === editingTenant.ownerKey ? "← (Origen Actual)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!transferTargetOwnerKey) {
                              alert("Por favor selecciona el propietario de destino para realizar el traspaso.");
                              return;
                            }
                            if (transferTargetOwnerKey === editingTenant.ownerKey) {
                              alert("El dueño de destino debe ser diferente al dueño de origen actual.");
                              return;
                            }
                            setTransferIncludeBranches(editingTenant.type === "Matriz");
                            setTransferStep(1);
                          }}
                          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>🔄</span> Iniciar Traspaso
                        </button>
                      </div>
                    </div>
                  )}

                  {transferStep === 1 && (() => {
                    const originOwnerKey = editingTenant.ownerKey || "";
                    const originOwner = customOwners.find(o => o.key === originOwnerKey);
                    const originOwnerName = originOwner?.name || editingTenant.propietario || "ORIGEN S/D";
                    const targetOwner = customOwners.find(o => o.key === transferTargetOwnerKey);
                    const targetOwnerName = targetOwner?.name || `Dueño Key ${transferTargetOwnerKey}`;
                    const dependentBranches = COMPANY_CATALOG.filter(c => c.id !== editingTenant.id && c.ownerKey === originOwnerKey);

                    return (
                      <div className="bg-amber-500/10 border-2 border-amber-500 rounded-2xl p-5 space-y-4 shadow-md transition-all">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📍</span>
                            <div>
                              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider m-0">
                                Confirmación de Traspaso (Paso 1 de 2)
                              </h4>
                              <p className="text-[10.5px] font-bold text-amber-800 m-0">
                                Verifica detalladamente la información del ORIGEN y del DESTINO.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTransferStep(0)}
                            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-black text-[10.5px] rounded-lg border-none cursor-pointer uppercase"
                          >
                            ✕ Cancelar
                          </button>
                        </div>

                        {/* ORIGEN */}
                        <div className="bg-white border-2 border-amber-300 rounded-xl p-3.5 space-y-1.5 shadow-xs">
                          <span className="text-[9.5px] font-black text-amber-800 uppercase tracking-wider block">📤 ORIGEN (Propietario Actual):</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">
                              {originOwner?.avatar || "👑"} {originOwnerName}
                            </span>
                            <span className="text-[10.5px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                              Clave: {originOwnerKey}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-bold text-slate-600 m-0">
                            Inquilino: {editingTenant.avatar} <strong>{editingTenant.name}</strong> ({editingTenant.type}) | RFC: {editingTenant.rfc}
                          </p>
                        </div>

                        <div className="text-center my-1">
                          <span className="text-xs font-black text-amber-800 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 uppercase shadow-2xs">
                            ⬇️ TRASPASAR PROPIEDAD AL NUEVO DUEÑO ⬇️
                          </span>
                        </div>

                        {/* DESTINO */}
                        <div className="bg-white border-2 border-indigo-300 rounded-xl p-3.5 space-y-1.5 shadow-xs">
                          <span className="text-[9.5px] font-black text-indigo-800 uppercase tracking-wider block">📥 DESTINO (Nuevo Propietario):</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-950">
                              {targetOwner?.avatar || "👑"} {targetOwnerName}
                            </span>
                            <span className="text-[10.5px] font-black bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-md">
                              Clave Destino: {transferTargetOwnerKey}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox sucursales */}
                        {editingTenant.type === "Matriz" && dependentBranches.length > 0 && (
                          <div className="bg-white p-3 rounded-xl border border-amber-300 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-black text-slate-800 block">🌳 Traspasar Sucursales Asociadas ({dependentBranches.length})</span>
                              <span className="text-[10px] font-bold text-slate-500 block">Reasignar también las {dependentBranches.length} sucursal(es) al nuevo propietario.</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={transferIncludeBranches}
                              onChange={(e) => setTransferIncludeBranches(e.target.checked)}
                              className="w-5 h-5 accent-amber-600 rounded cursor-pointer shrink-0"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 gap-3">
                          <button
                            type="button"
                            onClick={() => setTransferStep(0)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl border-none uppercase cursor-pointer"
                          >
                            Regresar
                          </button>
                          <button
                            type="button"
                            onClick={() => setTransferStep(2)}
                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl border-none uppercase shadow-md cursor-pointer"
                          >
                            Continuar al Paso 2 (2/2) ➔
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {transferStep === 2 && (() => {
                    const originOwnerKey = editingTenant.ownerKey || "";
                    const originOwner = customOwners.find(o => o.key === originOwnerKey);
                    const originOwnerName = originOwner?.name || editingTenant.propietario || "ORIGEN S/D";
                    const targetOwner = customOwners.find(o => o.key === transferTargetOwnerKey);
                    const targetOwnerName = targetOwner?.name || `Dueño Key ${transferTargetOwnerKey}`;
                    const dependentBranches = COMPANY_CATALOG.filter(c => c.id !== editingTenant.id && c.ownerKey === originOwnerKey);

                    return (
                      <div className="bg-rose-500/10 border-2 border-rose-500 rounded-2xl p-5 space-y-4 shadow-lg transition-all">
                        <div className="bg-rose-600 text-white p-3.5 rounded-xl flex items-center gap-2.5 shadow-sm">
                          <span className="text-2xl">🚨</span>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider m-0">SEGUNDO AVISO DE CONFIRMACIÓN (2/2)</h4>
                            <p className="text-[10.5px] font-bold m-0 opacity-95">
                              ¿Estás TOTALMENTE SEGURO de ejecutar el traspaso? Esta es la segunda y última verificación.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border-2 border-rose-300 rounded-xl p-4 space-y-2.5 shadow-xs text-xs font-bold">
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">📤 ORIGEN:</span>
                            <span className="text-slate-900 font-black">{originOwner?.avatar || "👑"} {originOwnerName} (Clave {originOwnerKey})</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">🏢 INQUILINO:</span>
                            <span className="text-amber-900 font-black">{editingTenant.avatar} {editingTenant.name}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">📥 DESTINO:</span>
                            <span className="text-indigo-900 font-black">{targetOwner?.avatar || "👑"} {targetOwnerName} (Clave {transferTargetOwnerKey})</span>
                          </div>
                          {editingTenant.type === "Matriz" && dependentBranches.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">🌳 SUCURSALES:</span>
                              <span className="text-teal-800 font-black">{transferIncludeBranches ? `Se traspasan ${dependentBranches.length} sucursales` : "Solo la Matriz"}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 gap-3">
                          <button
                            type="button"
                            onClick={() => setTransferStep(1)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl border-none uppercase cursor-pointer"
                          >
                            ⬅️ Regresar al Paso 1
                          </button>
                          <button
                            type="button"
                            onClick={executeTenantTransfer}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl border-none uppercase shadow-lg cursor-pointer active:scale-95 transition-all"
                          >
                            ✅ CONFIRMAR Y TRASPASAR AHORA (2/2) 🚀
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-3 flex-wrap">
              {editingTenant && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteTenant(editingTenant.id);
                      setShowTenantCrudModal(false);
                    }}
                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl cursor-pointer transition-all border border-rose-200 uppercase tracking-wider border-none"
                    style={{ color: "#e11d48", backgroundColor: "#ffe4e6" }}
                  >
                    🗑️ Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!transferTargetOwnerKey) {
                        const defaultTarget = customOwners.find(o => o.key !== editingTenant.ownerKey)?.key || "";
                        setTransferTargetOwnerKey(defaultTarget);
                      }
                      setTransferIncludeBranches(editingTenant.type === "Matriz");
                      setTransferStep(1);
                    }}
                    className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black rounded-xl cursor-pointer transition-all border border-amber-200 uppercase tracking-wider border-none"
                  >
                    🔄 Traspasar Inquilino
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTenant(editingTenant);
                      setShowBluetoothConfigModal(true);
                    }}
                    className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl cursor-pointer transition-all border border-indigo-200 uppercase tracking-wider border-none"
                  >
                    🖨️ Configurar Impresoras
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowTenantCrudModal(false);
                    resetTenantForm();
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all border-none uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveTenant}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md border-none uppercase tracking-wider"
                  style={{ backgroundColor: "#10b981" }}
                >
                  💾 Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </IonContent>
      </IonModal>
    );
};
