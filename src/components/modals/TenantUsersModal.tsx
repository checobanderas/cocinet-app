import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface TenantUsersModalProps {
  showTenantUsersModal: boolean;
  setShowTenantUsersModal: (v: boolean) => void;
  modalTenant: any;
  modalUsers: any[];
  handleAddRow: () => void;
  handleCellChange: (index: number, field: string, value: string) => void;
  handleDeleteRow: (index: number) => void;
  revealedPins: Record<number, boolean>;
  setRevealedPins: (v: Record<number, boolean> | ((prev: Record<number, boolean>) => Record<number, boolean>)) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const TenantUsersModal: React.FC<TenantUsersModalProps> = ({
  showTenantUsersModal,
  setShowTenantUsersModal,
  modalTenant,
  modalUsers,
  handleAddRow,
  handleCellChange,
  handleDeleteRow,
  revealedPins,
  setRevealedPins,
  triggerAppNotification
}) => {

    const cycleAvatar = (userId: string, currentAvatar: string) => {
      const avatars = [
        "fa-solid fa-person-walking",
        "fa-solid fa-person-running",
        "fa-solid fa-bell-concierge",
        "fa-solid fa-cash-register",
        "fa-solid fa-user-tie",
        "fa-solid fa-user-shield",
        "fa-solid fa-hat-cowboy",
        "fa-solid fa-laptop-code"
      ];
      const index = avatars.indexOf(currentAvatar);
      const nextIndex = (index + 1) % avatars.length;
      handleCellChange(userId, "avatar", avatars[nextIndex], modalTenant?.id);
    };

    return (
      <IonModal
        isOpen={showTenantUsersModal}
        onDidDismiss={() => setShowTenantUsersModal(false)}
        style={{
          "--height": "100%",
          "--width": "100%",
          "--max-height": "90vh",
          "--max-width": "900px",
          "--border-radius": "24px",
        }}
      >
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "#fff", padding: "8px 16px" }}>
            <IonTitle style={{ fontSize: "1.2rem", fontWeight: "900", color: "#1e293b", paddingLeft: "0" }}>
              👥 Accesos y PINs: {modalTenant?.name || ''}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowTenantUsersModal(false)} color="dark">
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="space-y-6 max-w-4xl mx-auto pb-12 text-left">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div>
                <h4 className="text-sm font-black text-slate-800 m-0">Gestión Rápida de Empleados</h4>
                <p className="text-[11px] text-slate-500 font-bold m-0">
                  Modifica nombres, roles y PINs de seguridad. Los empleados usarán estos PINs en la pantalla de inicio.
                </p>
              </div>
              <button
                onClick={() => handleAddRow(modalTenant.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition duration-200 flex items-center gap-1.5 text-xs shadow-md shadow-indigo-200 border-none cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]" />
                Agregar Fila
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-600 min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-3 w-[70px] text-center">Avatar</th>
                      <th className="py-2.5 px-3 w-[110px]">ID Acceso</th>
                      <th className="py-2.5 px-3">Nombre Completo</th>
                      <th className="py-2.5 px-3 w-[100px]">Rol</th>
                      <th className="py-2.5 px-3 w-[130px]">PIN de Acceso 🔑</th>
                      <th className="py-2.5 px-3 w-[200px] text-center">Enviar / Compartir</th>
                      <th className="py-2.5 px-3 w-[80px] text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {modalUsers.map((user) => {
                      const isProtected = user.id.endsWith("-admin") || user.id.endsWith("-sistemas") || user.id.endsWith("-manager");
                      
                      let roleLabel = user.id;
                      if (user.id.endsWith("-admin")) roleLabel = "propietario";
                      else if (user.id.endsWith("-manager")) roleLabel = "gerente";
                      else if (user.id.endsWith("-sistemas")) roleLabel = "sistemas";
                      else if (user.id.endsWith("-cajero-1")) roleLabel = "cajero1";
                      else if (user.id.endsWith("-cajero-2")) roleLabel = "cajero2";
                      else if (user.id.endsWith("-mesero-main")) roleLabel = "mesero1";
                      else if (user.id.endsWith("-mesero-1")) roleLabel = "mesero2";
                      else if (user.id.endsWith("-mesero-2")) roleLabel = "mesero3";
                      
                      const link = `${window.location.origin}${window.location.pathname}?tenant=${modalTenant.id}&token=${roleLabel}${roleLabel === "propietario" ? `&owner=${modalTenant.ownerKey}` : ""}`;
                      
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Avatar */}
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => cycleAvatar(user.id, user.avatar)}
                              className="w-8 h-8 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center text-sm hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                              title="Cambiar avatar"
                            >
                              <i className={user.avatar || "fa-solid fa-user"} />
                            </button>
                          </td>

                          {/* ID (Read-only) */}
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-400 select-all font-bold">
                            {user.id.replace(`${user.tenantId}-`, "")}
                          </td>

                          {/* Name Input */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              defaultValue={user.name}
                              onBlur={(e) => {
                                if (e.target.value.trim() && e.target.value.trim() !== user.name) {
                                  handleCellChange(user.id, "name", e.target.value.trim(), modalTenant.id);
                                }
                              }}
                              className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border border-transparent focus:border-indigo-500 rounded px-1.5 py-0.5 text-slate-800 font-semibold outline-none transition text-xs"
                            />
                          </td>

                          {/* Role Select */}
                          <td className="py-2 px-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleCellChange(user.id, "role", e.target.value, modalTenant.id)}
                              className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border border-transparent focus:border-indigo-500 rounded px-1.5 py-0.5 text-slate-800 font-semibold outline-none cursor-pointer text-xs"
                            >
                              <option value="mesero">Mesero 🏃</option>
                              <option value="cajero">Cajero 💵</option>
                              <option value="admin">Admin 👔</option>
                            </select>
                          </td>

                          {/* PIN Input */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:bg-white rounded px-1.5 py-0.5 transition-all w-[110px]">
                              <input
                                type={revealedPins[user.id] ? "text" : "password"}
                                maxLength={4}
                                defaultValue={user.pin}
                                onClick={() => {
                                  setRevealedPins(prev => ({ ...prev, [user.id]: true }));
                                }}
                                onFocus={() => {
                                  setRevealedPins(prev => ({ ...prev, [user.id]: true }));
                                }}
                                onBlur={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  if (val.length === 4 && val !== user.pin) {
                                    handleCellChange(user.id, "pin", val, modalTenant.id);
                                  } else if (val !== user.pin) {
                                    e.target.value = user.pin; // Revert
                                    triggerAppNotification("⚠️ Error", "El PIN debe tener exactamente 4 dígitos.", "warning");
                                  }
                                }}
                                className="w-12 bg-transparent text-slate-800 font-mono font-black text-center outline-none border-none text-[13px] tracking-widest placeholder-slate-300"
                                placeholder="0000"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRevealedPins(prev => ({ ...prev, [user.id]: !prev[user.id] }));
                                }}
                                className="p-1 hover:bg-slate-200/60 text-slate-400 hover:text-indigo-600 rounded cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0 ml-auto"
                                title={revealedPins[user.id] ? "Ocultar PIN" : "Mostrar PIN"}
                              >
                                <i className={`fa-solid ${revealedPins[user.id] ? "fa-eye-slash" : "fa-eye"} text-[10px]`} />
                              </button>
                            </div>
                          </td>

                          {/* Enviar / Compartir */}
                          <td className="py-2 px-3">
                            <div className="flex justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(link);
                                  triggerAppNotification(
                                    "🔗 Enlace Copiado",
                                    `Acceso directo para ${user.name} copiado al portapapeles.`,
                                    "success"
                                  );
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border-none"
                              >
                                📋 Copiar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const msg = encodeURIComponent(`Hola ${user.name}! Aquí tienes tu acceso directo de Cocinet Pro:\n\n${link}`);
                                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border-none"
                              >
                                🟢 WhatsApp
                              </button>
                            </div>
                          </td>

                          {/* Action (Delete) */}
                          <td className="py-2 px-3 text-center">
                            {isProtected ? (
                              <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                Fijo
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteRow(user.id, modalTenant.id)}
                                className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/50 w-6 h-6 rounded flex items-center justify-center transition mx-auto cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <i className="fa-solid fa-trash-can text-[10px]" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </IonContent>
      </IonModal>
    );
};
