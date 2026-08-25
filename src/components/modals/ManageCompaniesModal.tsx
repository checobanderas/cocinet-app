import { addTenantToFirebase, getMexicoISOString, saveCompaniesConfigToFirebase } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput, IonList } from '@ionic/react';
import { closeOutline, addCircleOutline, trashOutline, saveOutline, createOutline } from 'ionicons/icons';

interface ManageCompaniesModalProps {
  showManageCompaniesModal: boolean;
  setShowManageCompaniesModal: (v: boolean) => void;
  // you might need to add more props based on the body, let's keep it any for now
  activeOwnerFilter: any;
  users: any;
  COMPANY_CATALOG: any;
  setCompanyCatalog: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
  companiesConfig: any;
  item: any;
  searchCompanyQuery: any;
  selectedTenant: any;
  setCompaniesConfig: any;
  setSearchCompanyQuery: any;
  setSelectedTenant: any;
}

export const ManageCompaniesModal: React.FC<ManageCompaniesModalProps> = ({
  showManageCompaniesModal,
  setShowManageCompaniesModal,
  activeOwnerFilter,
  users,
  COMPANY_CATALOG,
  setCompanyCatalog,
  triggerAppNotification,
  companiesConfig, item, searchCompanyQuery, selectedTenant, setCompaniesConfig, setSearchCompanyQuery, setSelectedTenant
}) => {
  return (
        <IonModal
          isOpen={showManageCompaniesModal}
          onDidDismiss={() => {
            setShowManageCompaniesModal(false);
            setSearchCompanyQuery("");
          }}
          style={{
            "--height": "100%",
            "--width": "100%",
            "--max-height": "90vh",
            "--max-width": "700px",
            "--border-radius": "24px",
          }}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#1e293b", color: "white" }}>
              <IonTitle style={{ fontSize: "1.05rem", fontWeight: "900" }}>
                ⚙️ Consola de Red de Sucursales
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => setShowManageCompaniesModal(false)}
                  style={{ "--color": "white", fontWeight: "bold" }}
                >
                  Cerrar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent
            className="ion-padding"
            style={{ "--background": "#f8fafc" }}
          >
            <div className="space-y-4">
              {/* Info Accent Header */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs font-semibold text-indigo-950 flex flex-col gap-1 select-none text-left">
                <div className="flex items-center gap-1.5 font-black text-indigo-900">
                  <span>📶</span> Sincronización Relacional Activa (MySQL +
                  WebSockets)
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed font-bold">
                  Modifica la visibilidad de cada sucursal en el login y
                  agrúpalas de forma dinámica. Cada cambio modificará los UUIDs
                  únicos y registros timestamps para mantener la coherencia en
                  las tablas sincronizadas en tiempo real.
                </p>
              </div>

              {/* Buscador de Sucursales */}
              <div className="relative text-left">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre de sucursal o RFC..."
                  value={searchCompanyQuery}
                  onChange={(e) => setSearchCompanyQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* Company rows list */}
              <div className="space-y-3 font-sans">
                {COMPANY_CATALOG.filter((c) => {
                  if (!searchCompanyQuery.trim()) return true;
                  const query = searchCompanyQuery.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(query) ||
                    c.rfc.toLowerCase().includes(query)
                  );
                }).map((c) => {
                  const conf = companiesConfig[c.id] || {
                    id: c.id,
                    visible: true,
                    groupName: "Grupo General",
                    uuid: `usr_ten_${c.id}`,
                    created_at: getMexicoISOString(),
                    updated_at: getMexicoISOString(),
                  };
                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-slate-300"
                    >
                      {/* Left: Info details */}
                      <div className="space-y-1.5 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏢</span>
                          <div>
                            <span className="text-xs font-black text-slate-800 leading-none">
                              {c.name}
                            </span>
                            <span className="block text-[9px] font-mono text-indigo-600 font-bold">
                              {c.rfc} (Matriz/MySQL ID: {c.id})
                            </span>
                          </div>
                        </div>
                        {/* UUID & MySQL Timestamps Info */}
                        <div className="font-mono text-[9px] text-slate-400 font-bold space-y-0.5 border-t border-slate-50 pt-1.5">
                          <div className="truncate">
                            <span className="text-slate-500 font-extrabold">
                              UUID REGISTRO:
                            </span>{" "}
                            {conf.uuid}
                          </div>
                          <div className="flex flex-wrap gap-x-3">
                            <div>
                              <span className="text-slate-505 font-extrabold text-slate-500">
                                CREADO:
                              </span>{" "}
                              {new Date(conf.created_at).toLocaleString(
                                "es-MX",
                                { hour12: false },
                              )}
                            </div>
                            <div>
                              <span className="text-slate-505 font-extrabold text-slate-500">
                                MODIFICADO:
                              </span>{" "}
                              {new Date(conf.updated_at).toLocaleString(
                                "es-MX",
                                { hour12: false },
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Inputs & visibility toggle */}
                      <div className="flex flex-col gap-2.5 min-w-[245px] text-left">
                        <div className="flex flex-col gap-2">
                          {/* Visibility slider checkbox */}
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={conf.visible}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCompaniesConfig((prev) => ({
                                  ...prev,
                                  [c.id]: {
                                    ...conf,
                                    visible: checked,
                                    updated_at: getMexicoISOString(),
                                  },
                                }));
                              }}
                              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                            />
                            <span className="text-xs font-extrabold text-slate-700">
                              👁️ Mostrar en Login
                            </span>
                          </label>

                          {/* Require Internal Folio switch */}
                          <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={c.requireInternalFolio === true}
                              onChange={async (e) => {
                                const checked = e.target.checked;
                                const updatedTenant = {
                                  ...c,
                                  requireInternalFolio: checked,
                                };
                                const idx = COMPANY_CATALOG.findIndex(item => item.id === c.id);
                                if (idx !== -1) {
                                  COMPANY_CATALOG[idx] = updatedTenant;
                                }
                                try {
                                  await addTenantToFirebase(updatedTenant);
                                  if (selectedTenant?.id === c.id) {
                                    setSelectedTenant(updatedTenant);
                                  }
                                  triggerAppNotification(
                                    checked ? "📋 Folio Interno Exigido" : "⚡ Folio Interno Libre (Desactivado)",
                                    `Folio interno ${checked ? "activado" : "deshabilitado"} para la sucursal: ${c.name}`,
                                    checked ? "info" : "warning"
                                  );
                                } catch (err: any) {
                                  console.error("Error al actualizar folio interno:", err);
                                }
                              }}
                              className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 accent-amber-600 cursor-pointer"
                            />
                            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                              <span>📋</span> Exigir Folio Interno
                            </span>
                          </label>
                        </div>

                        {/* Group Name input with Auto-complete Chips */}
                        <div className="space-y-1.5">
                          <span className="block text-[9px] text-slate-500 font-extrabold">
                            GRUPO O ASOCIACIÓN:
                          </span>
                          <input
                            type="text"
                            value={conf.groupName}
                            placeholder="Ej. Grupo Oaxaca, Grupo Sur..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setCompaniesConfig((prev) => ({
                                ...prev,
                                [c.id]: {
                                  ...conf,
                                  groupName: val,
                                  updated_at: getMexicoISOString(),
                                },
                              }));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />

                          {/* Quick Chips for auto-complete */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Grupo Oaxaca",
                              "Grupo Centro",
                              "Grupo Norte",
                              "Premium ✨",
                            ].map((quickGrp) => (
                              <button
                                key={quickGrp}
                                type="button"
                                onClick={() => {
                                  setCompaniesConfig((prev) => ({
                                    ...prev,
                                    [c.id]: {
                                      ...conf,
                                      groupName: quickGrp,
                                      updated_at: getMexicoISOString(),
                                    },
                                  }));
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                                  conf.groupName === quickGrp
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                                }`}
                              >
                                {quickGrp}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions Footer row */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 text-left">
                <button
                  type="button"
                  onClick={() => {
                    const defaults: Record<string, any> = {};
                    COMPANY_CATALOG.forEach((c) => {
                      defaults[c.id] = {
                        id: c.id,
                        visible: true,
                        groupName: c.propietario
                          ? `Grupo ${c.propietario}`
                          : "Grupo General",
                        uuid: `usr_ten_${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
                        created_at: getMexicoISOString(),
                        updated_at: getMexicoISOString(),
                      };
                    });
                    setCompaniesConfig(defaults);
                    triggerAppNotification(
                      "🔄 Configuración Reestablecida",
                      "Se han restaurado los grupos y visibilidad predeterminados en la base de datos.",
                      "warning",
                    );
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition-all cursor-pointer select-none uppercase tracking-wider border-none"
                >
                  🔄 Restaurar
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    localStorage.setItem(
                      "cocinet_companies_config_v3",
                      JSON.stringify(companiesConfig),
                    );
                    try {
                      await saveCompaniesConfigToFirebase(companiesConfig);
                      triggerAppNotification(
                        "💾 Sincronización Exitosa ☁️",
                        "Los grupos y visibilidad de sucursales se guardaron en la nube. Todos los dispositivos verán los cambios automáticamente.",
                        "success",
                      );
                    } catch (err) {
                      console.error("Error syncing companies config to Firestore:", err);
                      triggerAppNotification(
                        "💾 Guardado Local",
                        "Se guardó localmente pero no se pudo sincronizar a la nube. Intente de nuevo.",
                        "warning",
                      );
                    }
                    setShowManageCompaniesModal(false);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-indigo-200 cursor-pointer select-none uppercase tracking-wider border-none"
                  style={{ backgroundColor: "#4f46e5" }}
                >
                  💾 Guardar y Sincronizar ☁️
                </button>
              </div>
            </div>
          </IonContent>
        </IonModal>
  );
};
