import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/react';

interface ConfigurePrefixModalProps {
  showConfigurePrefixModal: boolean;
  setShowConfigurePrefixModal: (v: boolean) => void;
  branchNamePrefix: string;
  setBranchNamePrefix: (v: string) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
  COMPANY_CATALOG: any[];
}

export const ConfigurePrefixModal: React.FC<ConfigurePrefixModalProps> = ({
  showConfigurePrefixModal,
  setShowConfigurePrefixModal,
  branchNamePrefix,
  setBranchNamePrefix,
  triggerAppNotification,
  COMPANY_CATALOG
}) => {
  return (
        <IonModal
          isOpen={showConfigurePrefixModal}
          onDidDismiss={() => setShowConfigurePrefixModal(false)}
          style={{
            "--height": "auto",
            "--width": "100%",
            "--max-width": "500px",
            "--border-radius": "24px",
          }}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#d97706", color: "white" }}>
              <IonTitle style={{ fontSize: "1.05rem", fontWeight: "900" }}>
                🔧 Configurar Filtros de Sucursal
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => setShowConfigurePrefixModal(false)}
                  style={{ "--color": "white", fontWeight: "bold" }}
                >
                  Listo
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent
            className="ion-padding"
            style={{ "--background": "#fff" }}
          >
            <div className="space-y-4 text-left">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs font-semibold text-amber-950">
                <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                  <span>🏢</span> Filtrado de Sucursal de Inicio
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed font-bold">
                  Agrupa y filtra tus sucursales según el nombre de la empresa
                  para separar marcas de manera instantánea. Selecciona un
                  acceso rápido o escribe tu propio prefijo personalizado.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  Filtro por Nombre / Prefijo:
                </label>

                {/* Custom input */}
                <div className="relative">
                  <input
                    type="text"
                    value={branchNamePrefix === "TODAS" ? "" : branchNamePrefix}
                    placeholder="Escribe para buscar (ej: Sombrerudos, Tacos Roy)..."
                    onChange={(e) => {
                      const val = e.target.value;
                      const finalVal = val.trim() === "" ? "TODAS" : val;
                      setBranchNamePrefix(finalVal);
                      localStorage.setItem(
                        "cocinet_branch_name_prefix",
                        finalVal,
                      );
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  />
                  {branchNamePrefix !== "TODAS" && (
                    <button
                      onClick={() => {
                        setBranchNamePrefix("TODAS");
                        localStorage.setItem(
                          "cocinet_branch_name_prefix",
                          "TODAS",
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-extrabold text-xs bg-transparent border-none cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Match count indicator */}
                <div className="text-[10px] text-slate-500 font-black flex items-center justify-between px-1 border-b border-slate-50 pb-2">
                  <span>Coincidencia de Sucursales de Inicio:</span>
                  <span className="text-amber-600 font-black">
                    {
                      COMPANY_CATALOG.filter((c) => {
                        if (branchNamePrefix === "TODAS") return true;
                        return c.name
                          .toLowerCase()
                          .startsWith(branchNamePrefix.toLowerCase().trim());
                      }).length
                    }{" "}
                    de {COMPANY_CATALOG.length}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-2">
                <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  Marcas Predefinidas:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBranchNamePrefix("TODAS");
                      localStorage.setItem(
                        "cocinet_branch_name_prefix",
                        "TODAS",
                      );
                      triggerAppNotification(
                        "🌐 Todas las Sucursales",
                        "Se muestran todas las marcas y sucursales en el login.",
                        "success",
                      );
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-xs text-left cursor-pointer font-bold ${
                      branchNamePrefix === "TODAS"
                        ? "bg-amber-500 border-transparent text-white font-black shadow-md shadow-amber-200"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌐</span>
                      <div>
                        <div className="font-extrabold">Todas las Marcas</div>
                        <div className="text-[9.5px] opacity-80">
                          Muestra la red completa de sucursales en el sistema.
                        </div>
                      </div>
                    </div>
                    {branchNamePrefix === "TODAS" && <span>✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBranchNamePrefix("Sombrerudos");
                      localStorage.setItem(
                        "cocinet_branch_name_prefix",
                        "Sombrerudos",
                      );
                      triggerAppNotification(
                        "🤠 Sombrerudos Seleccionado",
                        "Filtrado automático por sucursales Sombrerudos.",
                        "success",
                      );
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-xs text-left cursor-pointer font-bold ${
                      branchNamePrefix.toLowerCase() === "sombrerudos"
                        ? "bg-amber-500 border-transparent text-white font-black shadow-md shadow-amber-200"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤠</span>
                      <div>
                        <div className="font-extrabold">Sombrerudos</div>
                        <div className="text-[9.5px] opacity-80">
                          Solo sucursales que comienzan con Sombrerudos.
                        </div>
                      </div>
                    </div>
                    {branchNamePrefix.toLowerCase() === "sombrerudos" && (
                      <span>✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBranchNamePrefix("Tacos Roy");
                      localStorage.setItem(
                        "cocinet_branch_name_prefix",
                        "Tacos Roy",
                      );
                      triggerAppNotification(
                        "🌮 Tacos Roy Seleccionado",
                        "Filtrado automático de sucursales Tacos Roy.",
                        "success",
                      );
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-xs text-left cursor-pointer font-bold ${
                      branchNamePrefix.toLowerCase() === "tacos roy"
                        ? "bg-amber-500 border-transparent text-white font-black shadow-md shadow-amber-200"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌮</span>
                      <div>
                        <div className="font-extrabold">Tacos Roy</div>
                        <div className="text-[9.5px] opacity-80">
                          Solo sucursales que comienzan con Tacos Roy.
                        </div>
                      </div>
                    </div>
                    {branchNamePrefix.toLowerCase() === "tacos roy" && (
                      <span>✓</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Footer */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigurePrefixModal(false)}
                  className="w-full py-2.5 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md select-none cursor-pointer border-none"
                  style={{ backgroundColor: "#d97706" }}
                >
                  Confirmar y Filtrar Sucursales 💾
                </button>
              </div>
            </div>
          </IonContent>
        </IonModal>
  );
};
