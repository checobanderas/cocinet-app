import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/react';

interface OwnerCrudModalProps {
  showOwnerCrudModal: boolean;
  setShowOwnerCrudModal: (v: boolean) => void;
  editingOwner: any;
  setEditingOwner: (v: any) => void;
  formOwnerName: string;
  setFormOwnerName: (v: string) => void;
  formOwnerPin: string;
  setFormOwnerPin: (v: string) => void;
  formOwnerSupervisorPin: string;
  setFormOwnerSupervisorPin: (v: string) => void;
  formOwnerAccent: string;
  setFormOwnerAccent: (v: string) => void;
  formOwnerLogo: string;
  setFormOwnerLogo: (v: string) => void;
  formOwnerAvatar: string;
  setFormOwnerAvatar: (v: string) => void;
  handleSaveOwner: () => Promise<void>;
  isSavingOwner?: boolean;
  handleDeleteOwner: (ownerKey: string) => Promise<void>;
  triggerAppNotification: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const OwnerCrudModal: React.FC<OwnerCrudModalProps> = ({
  showOwnerCrudModal,
  setShowOwnerCrudModal,
  editingOwner,
  setEditingOwner,
  formOwnerName,
  setFormOwnerName,
  formOwnerPin,
  setFormOwnerPin,
  formOwnerSupervisorPin,
  setFormOwnerSupervisorPin,
  formOwnerAccent,
  setFormOwnerAccent,
  formOwnerLogo,
  setFormOwnerLogo,
  formOwnerAvatar,
  setFormOwnerAvatar,
  handleSaveOwner,
  isSavingOwner,
  handleDeleteOwner,
  triggerAppNotification
}) => {
  if (!showOwnerCrudModal) return null;

  return (
    <IonModal
      isOpen={showOwnerCrudModal}
      onDidDismiss={() => {
        setShowOwnerCrudModal(false);
        setEditingOwner(null);
      }}
      className="tenant-crud-modal-class"
      style={{
        "--height": "100%",
        "--width": "100%",
        "--max-height": "650px",
        "--max-width": "480px",
        "--border-radius": "24px",
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar className="text-slate-900" style={{ "--background": "#ffffff", "--padding-start": "16px", "--padding-end": "16px" }}>
          <IonTitle className="text-sm font-black uppercase tracking-wider text-slate-800 p-0 text-left">
            {editingOwner ? "👑 Modificar Propietario" : "➕ Agregar Nuevo Propietario"}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                setShowOwnerCrudModal(false);
                setEditingOwner(null);
              }}
              className="text-slate-500 font-extrabold text-xs uppercase cursor-pointer"
            >
              Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div className="space-y-5 pb-8 text-left">
          <p className="text-xs font-bold text-slate-600 leading-relaxed bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl">
            🔑 <span className="text-indigo-800">Control de Patrones:</span> Registra o modifica las credenciales del propietario principal de la red. Una vez creado, podrás asignarle casas matrices y sucursales.
          </p>

          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Nombre Completo (Grupo)
              </label>
              <input
                type="text"
                placeholder="Ej: JORGE & SORAYA"
                value={formOwnerName}
                onChange={(e) => setFormOwnerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all uppercase"
              />
            </div>

            {/* Owner PIN code */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                PIN de Acceso Propietario (4 dígitos)
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="Ej: 2010"
                value={formOwnerPin}
                onChange={(e) => setFormOwnerPin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-indigo-500 transition-all tracking-widest"
              />
            </div>

            {/* Supervisor PIN code */}
            <div>
              <label className="block text-[11px] font-black text-indigo-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>📋 PIN Supervisor (Acceso a Sucursales)</span>
                <span className="text-[9.5px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-extrabold">Rol Supervisor</span>
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="Ej: 2011"
                value={formOwnerSupervisorPin}
                onChange={(e) => setFormOwnerSupervisorPin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 text-xs font-bold font-mono text-indigo-900 focus:outline-none focus:border-indigo-500 transition-all tracking-widest"
              />
              <span className="text-[10.5px] text-slate-500 font-semibold mt-1 block">
                Permite al supervisor acceder y consultar las sucursales y matrices de este grupo.
              </span>
            </div>

            {/* Avatar Emoji */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Icono / Avatar Emoji
              </label>
              <div className="flex gap-2 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {["🤠", "👒", "👑", "🎩", "🎓", "🌮", "🌯", "🥗", "🏛️", "🌿", "🍕", "🍔", "🍳"].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormOwnerAvatar(emoji)}
                    className={`w-9 h-9 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      formOwnerAvatar === emoji ? "bg-indigo-600 text-white scale-110 shadow-sm" : "bg-white border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Color Distintivo (Accent)
              </label>
              <div className="flex gap-2 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {[
                  { hex: "red", label: "Rojo" },
                  { hex: "purple", label: "Morado" },
                  { hex: "pink", label: "Rosa" },
                  { hex: "teal", label: "Teal" },
                  { hex: "amber", label: "Ámbar" },
                  { hex: "emerald", label: "Esmeralda" },
                  { hex: "indigo", label: "Índigo" },
                  { hex: "cyan", label: "Cian" }
                ].map(col => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setFormOwnerAccent(col.hex)}
                    title={col.label}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
                      formOwnerAccent === col.hex ? "border-slate-800 scale-110 shadow-sm" : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: 
                        col.hex === "red" ? "#dc2626" :
                        col.hex === "purple" ? "#7c3aed" :
                        col.hex === "pink" ? "#db2777" :
                        col.hex === "teal" ? "#0d9488" :
                        col.hex === "amber" ? "#d97706" :
                        col.hex === "emerald" ? "#059669" :
                        col.hex === "indigo" ? "#4f46e5" :
                        col.hex === "cyan" ? "#0891b2" :
                        "#4f46e5"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Logotipo */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                🖼️ Logotipo de la Marca / Red
              </label>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                  {formOwnerLogo ? (
                    <img src={formOwnerLogo} alt="Logo preview" className="w-full h-full object-cover" />
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
                              setFormOwnerLogo(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {formOwnerLogo && (
                      <button
                        type="button"
                        onClick={() => setFormOwnerLogo("")}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10.5px] font-black rounded-lg cursor-pointer border border-rose-200/50 transition-all uppercase border-none"
                      >
                        ✕ Quitar
                      </button>
                    )}
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-bold leading-normal m-0">
                    Sube el logotipo que se aplicará automáticamente a la Casa Matriz y todas las Sucursales de este propietario.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-3">
            {editingOwner && (
              <button
                type="button"
                onClick={() => {
                  handleDeleteOwner(editingOwner.key);
                  setShowOwnerCrudModal(false);
                }}
                className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl cursor-pointer transition-all border border-rose-200 uppercase tracking-wider border-none font-sans"
                style={{ color: "#e11d48", backgroundColor: "#ffe4e6" }}
              >
                🗑️ Eliminar Propietario
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setShowOwnerCrudModal(false);
                  setEditingOwner(null);
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all border-none uppercase tracking-wider font-sans"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingOwner}
                onClick={handleSaveOwner}
                className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md border-none uppercase tracking-wider font-sans ${
                  isSavingOwner ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                }`}
                style={{ backgroundColor: "#10b981" }}
              >
                {isSavingOwner ? "⏳ Guardando..." : "💾 Guardar Propietario"}
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
