import React from "react";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { CompanyTenant } from "../../utils/companyCatalog";

interface PinsStructureModalProps {
  showPinsStructureModal: boolean;
  setShowPinsStructureModal: (show: boolean) => void;
  COMPANY_CATALOG: CompanyTenant[];
}

export const PinsStructureModal: React.FC<PinsStructureModalProps> = ({
  showPinsStructureModal,
  setShowPinsStructureModal,
  COMPANY_CATALOG
}) => {
  return (
    <IonModal
      isOpen={showPinsStructureModal}
      onDidDismiss={() => setShowPinsStructureModal(false)}
      style={{
        "--height": "100%",
        "--width": "100%",
        "--max-height": "95vh",
        "--max-width": "900px",
        "--border-radius": "24px",
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#1e1b4b", padding: "8px 16px" }}>
          <IonTitle style={{ fontSize: "1.1rem", fontWeight: "900", color: "#ffffff", paddingLeft: "0" }}>
            🔑 Estructura de PINs por Empresa (Sincronización MySQL) ⚡
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowPinsStructureModal(false)} style={{ "--color": "#ffffff" }}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ "--background": "#0f172a" }}>
        <div className="space-y-6 text-white pb-12">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">
              🔒 Reglas Sincronizadas del Algoritmo del Sistema
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para fines de simplificación y sincronización continua en bases de datos aisladas con UUIDs únicos, cada sucursal/inquilino <span className="font-mono text-cyan-400">#X</span> (del 1 al 14) hereda un juego de claves en secuencia de un prefijo específico. ¡Esto permite a los dueños, cajeros y garroteros recordar fácilmente todas sus claves de acceso!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">👑 DUEÑO / PATRÓN</span>
                <code className="text-indigo-300">2026 + X</code>
                <span className="text-slate-500 block mt-1">(Ej: #1 = 2027, #2 = 2028)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">👔 GERENTE / ENCARGADO</span>
                <code className="text-indigo-300">1526 + X</code>
                <span className="text-slate-500 block mt-1">(Ej: #1 = 1527, #2 = 1528)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-violet-400 block mb-1">⚙️ SISTEMAS / TI</span>
                <code className="text-indigo-300">4020</code>
                <span className="text-slate-500 block mt-1">(Fijo para todas las sucursales)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">💵 CAJERO 1 / CAJERO 2</span>
                <code className="text-indigo-300">1026 + X / 1126 + X</code>
                <span className="text-slate-500 block mt-1">(Ej: #1 = 1027 / 1127)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 sm:col-span-2 md:col-span-3">
                <span className="font-bold text-rose-400 block mb-1">🤵 MESEROS (DEL 1 AL 3)</span>
                <code className="text-indigo-300">0126 + X (Mesero 1) • 0226 + X (Mesero 2) • 0326 + X (Mesero 3)</code>
                <span className="text-slate-500 block mt-1">(Ej: #1 = 0127, 0227, 0327)</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3"># Reg</th>
                  <th className="p-3">Inquilino / Sucursal</th>
                  <th className="p-3 text-amber-400">🤠 Patrón</th>
                  <th className="p-3 text-cyan-400">👔 Gerente</th>
                  <th className="p-3 text-emerald-400">💵 Cajero 1</th>
                  <th className="p-3 text-teal-400">💳 Cajero 2</th>
                  <th className="p-3 text-rose-400">🏃 Meseros (1 a 3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {COMPANY_CATALOG.map((c) => {
                  let parsedNum = parseInt(c.id.replace(/[^0-9]/g, ""), 10);
                  if (isNaN(parsedNum) || parsedNum <= 0) parsedNum = 1;
                  const num = (parsedNum % 100) || 1;
                  const short = c.name
                    .replace("Los Mas Buscados ", "")
                    .replace("Los Sombrerudos ", "")
                    .replace("Taquerias ", "")
                    .replace("Tacos Roy ", "")
                    .replace("Tacos y Retacos Roy ", "");
                  return (
                    <tr key={c.id} className="hover:bg-slate-850/45 transition-all">
                      <td className="p-3 text-slate-500">#{num}</td>
                      <td className="p-3 text-slate-200">
                        {short.length > 20 ? short.substring(0, 18) + "..." : short}
                      </td>
                      <td className="p-3 text-amber-300 bg-amber-950/10 border-l border-slate-800/50">
                        {2026 + num}
                      </td>
                      <td className="p-3 text-cyan-300 bg-cyan-950/10">
                        {1526 + num}
                      </td>
                      <td className="p-3 text-emerald-300 bg-emerald-950/10 border-l border-slate-800/50">
                        {1026 + num}
                      </td>
                      <td className="p-3 text-teal-300 bg-teal-950/10">
                        {1126 + num}
                      </td>
                      <td className="p-3 text-rose-300 bg-rose-950/10 border-l border-slate-800/50">
                        {String(126 + num).padStart(4, "0")} / {String(226 + num).padStart(4, "0")} / {String(326 + num).padStart(4, "0")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
