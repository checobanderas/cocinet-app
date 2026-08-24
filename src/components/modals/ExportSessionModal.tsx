import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, downloadOutline } from 'ionicons/icons';

interface ExportSessionModalProps {
  exportSessionModal: any;
  setExportSessionModal: (v: any) => void;
}

export const ExportSessionModal: React.FC<ExportSessionModalProps> = ({
  exportSessionModal,
  setExportSessionModal
}) => {
  return (
          <IonModal
            isOpen={!!exportSessionModal}
            onDidDismiss={() => {
              if (!isExportingSession) {
                setExportSessionModal(null);
                setExportTargetTenantId("");
                setExportModalStep(1);
              }
            }}
            className="ion-modal-custom"
          >
            <div className="p-4 sm:p-6 bg-slate-900 text-white min-h-full flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-indigo-400 flex items-center gap-2">
                      <span>🚀</span> Exportar Corte a otro Tenant
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {exportModalStep === 1
                        ? "Paso 1 de 2: Seleccionar Inquilino Destino"
                        : "Paso 2 de 2: Confirmación Final y Responsabilidad"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isExportingSession) {
                        setExportSessionModal(null);
                        setExportTargetTenantId("");
                        setExportModalStep(1);
                      }
                    }}
                    disabled={isExportingSession}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl border-none cursor-pointer transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Paso 1: Selección de Origen y Destino */}
                {exportModalStep === 1 && exportSessionModal && (
                  <div className="space-y-4">
                    {/* Card Origen */}
                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl space-y-2">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                        🏢 Inquilino de Origen (Fuente):
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-slate-700 rounded-xl">
                          {selectedTenant?.avatar || "🏢"}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">
                            {selectedTenant?.name || "Inquilino Actual"}
                          </h4>
                          <span className="text-xs text-indigo-300 font-semibold block">
                            Sucursal: {selectedTenant?.sucursalDefault || "Matriz"} (ID: {selectedTenant?.id || exportSessionModal.tenantId || "tenant-1"})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resumen del Corte Seleccionado */}
                    <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl space-y-1.5 text-xs">
                      <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest block mb-2">
                        📊 Resumen del Corte de Caja a Transferir:
                      </span>
                      <div className="flex justify-between text-slate-300">
                        <span>📅 Fecha / Cierre:</span>
                        <span className="font-bold text-white">
                          {exportSessionModal.closedAt
                            ? new Date(exportSessionModal.closedAt).toLocaleString("es-MX")
                            : exportSessionModal.openedAt
                            ? new Date(exportSessionModal.openedAt).toLocaleString("es-MX")
                            : "Fecha N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>👤 Operador de Caja:</span>
                        <span className="font-bold text-white">{exportSessionModal.userName}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>💵 Ventas Efectivo:</span>
                        <span className="font-bold text-emerald-400">
                          ${Number(exportSessionModal.cashSales || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>💳 Ventas Electrónicas:</span>
                        <span className="font-bold text-blue-400">
                          ${Number((exportSessionModal.cardSales || 0) + (exportSessionModal.transSales || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Selector Inquilino Destino */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                        🎯 Seleccionar Inquilino de Destino:
                      </label>
                      <select
                        value={exportTargetTenantId}
                        onChange={(e) => setExportTargetTenantId(e.target.value)}
                        className="w-full bg-slate-800 border-2 border-indigo-500/50 text-white font-bold p-3 rounded-xl text-xs focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="">-- Selecciona el inquilino de destino --</option>
                        {getCompanyCatalog()
                          .filter((t) => t.id !== (selectedTenant?.id || exportSessionModal.tenantId || "tenant-1"))
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.avatar || "🏢"} {t.name} ({t.sucursalDefault || "Sucursal"})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Paso 2: Alerta de Advertencia y Confirmación Final */}
                {exportModalStep === 2 && exportSessionModal && (
                  <div className="space-y-4">
                    {/* Warning Callout Box */}
                    <div className="bg-amber-950/70 border-2 border-amber-500/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
                        <span className="text-xl">⚠️</span>
                        <span>Advertencia de Responsabilidad (Rol Sistemas)</span>
                      </div>
                      <p className="text-xs text-amber-100 font-semibold leading-relaxed">
                        Esta operación es una <strong className="text-white underline">acción administrativa protegida</strong>. Al confirmar, el sistema ejecutará una transferencia en la base de datos entre inquilinos.
                      </p>
                      <ul className="text-[11px] text-amber-200/90 font-medium space-y-1.5 pl-4 list-disc">
                        <li>
                          <strong>Sin mutación de origen:</strong> Los datos del inquilino origen <em>({selectedTenant?.name})</em> NO serán modificados ni eliminados.
                        </li>
                        <li>
                          <strong>Copia integral:</strong> Se copiará la sesión de caja junto con todas las ventas, cobros, egresos y compras asociadas.
                        </li>
                        <li>
                          <strong>Validación de duplicados:</strong> El sistema validará que el destino no posea ya un corte en la misma fecha para evitar registros duplicados.
                        </li>
                        <li>
                          <strong>Responsabilidad:</strong> El usuario de Sistemas asume la responsabilidad total de esta clonación contable.
                        </li>
                      </ul>
                    </div>

                    {/* Resumen de Confirmación */}
                    <div className="bg-slate-800 p-4 rounded-2xl space-y-2 border border-slate-700 text-xs">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                        📋 Resumen de la Operación:
                      </span>
                      <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-700">
                        <span>Origen:</span>
                        <span className="font-black text-indigo-300">{selectedTenant?.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-700">
                        <span>Destino:</span>
                        <span className="font-black text-emerald-400">
                          {getCompanyCatalog().find((t) => t.id === exportTargetTenantId)?.name || exportTargetTenantId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 py-1">
                        <span>Fecha del Corte:</span>
                        <span className="font-bold text-white">
                          {exportSessionModal.closedAt
                            ? new Date(exportSessionModal.closedAt).toLocaleDateString("es-MX")
                            : exportSessionModal.openedAt
                            ? new Date(exportSessionModal.openedAt).toLocaleDateString("es-MX")
                            : "Hoy"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center gap-3">
                {exportModalStep === 1 ? (
                  <>
                    <button
                      onClick={() => {
                        setExportSessionModal(null);
                        setExportTargetTenantId("");
                        setExportModalStep(1);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border-none cursor-pointer transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!exportTargetTenantId) {
                          triggerAppNotification("Atención ⚠️", "Por favor selecciona el inquilino de destino.", "warning");
                          return;
                        }
                        setExportModalStep(2);
                      }}
                      disabled={!exportTargetTenantId}
                      className={`font-black px-5 py-2.5 rounded-xl text-xs border-none cursor-pointer transition flex items-center gap-2 ${
                        exportTargetTenantId
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <span>Siguiente: Confirmar</span>
                      <span>➡️</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setExportModalStep(1)}
                      disabled={isExportingSession}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border-none cursor-pointer transition"
                    >
                      ⬅️ Regresar
                    </button>
                    <button
                      onClick={handleExecuteExportTenantCorte}
                      disabled={isExportingSession}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs border-none cursor-pointer transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                    >
                      {isExportingSession ? (
                        <>
                          <IonIcon icon={syncOutline} className="animate-spin text-sm" />
                          <span>Exportando...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀 Confirmar y Ejecutar Transferencia</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </IonModal>
  );
};
