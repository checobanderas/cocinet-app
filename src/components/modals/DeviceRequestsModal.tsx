import React from "react";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { CompanyTenant } from "../../utils/companyCatalog";
import { DeviceRequest } from "../../utils/firestore"; // Assuming DeviceRequest is exported from firestore.ts. If not, we might need to adjust. Wait, App.tsx imports it from './utils/firestore'.

interface DeviceRequestsModalProps {
  showDeviceRequestsModal: boolean;
  setShowDeviceRequestsModal: (show: boolean) => void;
  allDeviceRequests: any[]; // using any[] to avoid strict type issues if DeviceRequest isn't perfectly exported
  COMPANY_CATALOG: CompanyTenant[];
  updateDeviceRequest: (id: string, data: any) => void;
  deviceId: any;
  pending: any;
}

export const DeviceRequestsModal: React.FC<DeviceRequestsModalProps> = ({
  showDeviceRequestsModal,
  setShowDeviceRequestsModal,
  allDeviceRequests,
  COMPANY_CATALOG,
  updateDeviceRequest,
  deviceId, pending
}) => {
  return (
    <IonModal
      isOpen={showDeviceRequestsModal}
      onDidDismiss={() => setShowDeviceRequestsModal(false)}
      style={{
        "--height": "100%",
        "--width": "100%",
        "--max-height": "90vh",
        "--max-width": "700px",
        "--border-radius": "24px",
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#fff", padding: "8px 16px" }}>
          <IonTitle style={{ fontSize: "1.2rem", fontWeight: "900", color: "#1e293b", paddingLeft: "0" }}>
            🔔 Solicitudes de Dispositivos Externos
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowDeviceRequestsModal(false)} color="dark">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div className="space-y-4 max-w-3xl mx-auto pb-12">
          <p className="text-sm text-slate-500 mb-6">Administra qué dispositivos tienen acceso a interactuar con una sucursal en específico.</p>
          
          {allDeviceRequests.length === 0 ? (
            <div className="text-center p-8 bg-slate-100 rounded-2xl text-slate-500">
              No hay solicitudes de dispositivos pendientes o registradas.
            </div>
          ) : (
            allDeviceRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <i className="fa-solid fa-mobile-screen-button text-indigo-500"></i> {req.deviceName}
                    </span>
                    {req.status === "pending" && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Pendiente</span>}
                    {req.status === "approved" && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Aprobado</span>}
                    {req.status === "rejected" && <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Rechazado</span>}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    <strong>Rol Solicitado:</strong> {req.role}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    ID: {req.deviceId} | Creado: {new Date(req.requestTime).toLocaleString()}
                  </div>
                  {req.assignedTenantId && (
                     <div className="text-xs mt-2 px-2 py-1 bg-slate-100 text-slate-600 rounded-md inline-block border border-slate-200">
                       <strong>Asignado a:</strong> {COMPANY_CATALOG.find(c => c.id === req.assignedTenantId)?.name || req.assignedTenantId}
                     </div>
                  )}
                </div>
                {req.status === "pending" && (
                  <div className="w-full md:w-auto p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-700">Asignar Configuración:</div>
                    <select
                      className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
                      onChange={(e) => updateDeviceRequest(req.id, { assignedTenantId: e.target.value })}
                      value={req.assignedTenantId || ""}
                    >
                      <option value="">Seleccionar Sucursal...</option>
                      {COMPANY_CATALOG.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-[10px] text-slate-500">Hora Inicio</label>
                        <input 
                          type="time" 
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none" 
                          value={req.scheduleStart || "14:00"} 
                          onChange={(e) => updateDeviceRequest(req.id, { scheduleStart: e.target.value })}
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-[10px] text-slate-500">Hora Fin</label>
                        <input 
                          type="time" 
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none" 
                          value={req.scheduleEnd || "02:00"} 
                          onChange={(e) => updateDeviceRequest(req.id, { scheduleEnd: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => {
                            if (!req.assignedTenantId) {
                              alert("Selecciona una sucursal primero.");
                              return;
                            }
                            updateDeviceRequest(req.id, { 
                              status: "approved", 
                              pin: Math.floor(1000 + Math.random() * 9000).toString(),
                              scheduleStart: req.scheduleStart || "14:00",
                              scheduleEnd: req.scheduleEnd || "02:00"
                            });
                         }}
                         className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 rounded-lg"
                       >Aprobar</button>
                       <button 
                         onClick={() => updateDeviceRequest(req.id, { status: "rejected" })}
                         className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2 rounded-lg border border-red-200"
                       >Rechazar</button>
                    </div>
                  </div>
                )}
                {req.status === "approved" && (
                   <button onClick={() => updateDeviceRequest(req.id, { status: "rejected" })} className="text-red-500 text-xs px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">Revocar Acceso</button>
                )}
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
