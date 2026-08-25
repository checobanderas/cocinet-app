import { deleteTenantBackupSnapshot, exportTenantDataJson, getMexicoISOString, restoreTenantBackupSnapshot, saveTenantBackupSnapshot } from '../../utils/firestore';
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, cloudDownloadOutline } from 'ionicons/icons';

interface TenantBackupConfirmProps {
  COMPANY_CATALOG: any;
  tenantBackupConfirm: any;
  setTenantBackupConfirm: (v: any) => void;
  isTenantBackupLoading: any;
  selectedTenant: any;
  setIsTenantBackupLoading: any;
  setTenantBackupDate: any;
  setTenantBackupMode: any;
  setTenantBackupMoveTarget: any;
  setTenantBackupNote: any;
  setTenantBackupProgress: any;
  tenantBackupDate: any;
  tenantBackupMode: any;
  tenantBackupMoveTarget: any;
  tenantBackupNote: any;
  tenantBackupProgress: any;
  tenantBackupSnapshots: any;
  triggerAppNotification: any;
}

export const TenantBackupConfirm: React.FC<TenantBackupConfirmProps> = ({
  tenantBackupConfirm,
  setTenantBackupConfirm,
  isTenantBackupLoading, selectedTenant, setIsTenantBackupLoading, setTenantBackupDate, setTenantBackupMode, setTenantBackupMoveTarget, setTenantBackupNote, setTenantBackupProgress, tenantBackupDate, tenantBackupMode, tenantBackupMoveTarget, tenantBackupNote, tenantBackupProgress, tenantBackupSnapshots, triggerAppNotification,
  COMPANY_CATALOG
}) => {
  return (
          <IonModal
            isOpen={tenantBackupConfirm.isOpen}
            onDidDismiss={() => setTenantBackupConfirm({ isOpen: false, type: null })}
            style={{ "--height": "95%", "--width": "100%", "--max-width": "780px", "--border-radius": "20px" }}
          >
            <IonHeader className="ion-no-border">
              <IonToolbar style={{ "--background": "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white" }}>
                <IonTitle style={{ fontSize: "1rem", fontWeight: "900", color: "white" }}>
                  📦 Respaldo Completo del Tenant — {selectedTenant?.name || ""}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton
                    onClick={() => setTenantBackupConfirm({ isOpen: false, type: null })}
                    style={{ "--color": "white", fontWeight: "bold" }}
                  >
                    Cerrar
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent style={{ "--background": "#f1f5f9" }}>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* ── INFO BANNER ── */}
                <div style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", borderRadius: "14px", padding: "16px 20px", border: "1px solid #c4b5fd" }}>
                  <div style={{ fontWeight: "900", fontSize: "1rem", color: "#4c1d95", marginBottom: "4px" }}>📦 Sistema de Respaldos Completos</div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#5b21b6", lineHeight: "1.5" }}>
                    Genera una copia completa de <strong>todos los datos del tenant actual</strong> (productos, mesas, historial, usuarios, gastos, proveedores, clientes y más).
                    Los respaldos se guardan en la nube y puedes restaurarlos o moverlos a otro tenant en cualquier momento.
                  </p>
                  <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fcd34d", fontSize: "0.78rem", fontWeight: "700", color: "#92400e" }}>
                    ⚠️ <strong>Recomendación:</strong> Se sugiere crear un respaldo antes de realizar cualquier operación de restauración o migración.
                  </div>
                </div>

                {/* ── CREAR RESPALDO ── */}
                <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontWeight: "900", fontSize: "1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                    💾 Crear Nuevo Respaldo
                  </h3>

                  {/* Mode Selector */}
                  <div style={{ marginBottom: "14px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#475569" }}>Modo de Alcance:</span>
                    <button
                      type="button"
                      onClick={() => setTenantBackupMode("full")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: tenantBackupMode === "full" ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                        background: tenantBackupMode === "full" ? "#eeefff" : "#f8fafc",
                        color: tenantBackupMode === "full" ? "#4338ca" : "#64748b",
                        fontWeight: "800",
                        fontSize: "0.78rem",
                        cursor: "pointer"
                      }}
                    >
                      🌐 Respaldo Completo (Todo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTenantBackupMode("day")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: tenantBackupMode === "day" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        background: tenantBackupMode === "day" ? "#e0f2fe" : "#f8fafc",
                        color: tenantBackupMode === "day" ? "#0369a1" : "#64748b",
                        fontWeight: "800",
                        fontSize: "0.78rem",
                        cursor: "pointer"
                      }}
                    >
                      📅 Respaldo Por Día (Evita límite de tamaño)
                    </button>
                  </div>

                  {/* Day Picker if mode is 'day' */}
                  {tenantBackupMode === "day" && (
                    <div style={{ marginBottom: "14px", background: "#f0f9ff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#0369a1" }}>📆 Seleccionar Fecha a Respaldar:</span>
                      <input
                        type="date"
                        value={tenantBackupDate}
                        onChange={(e) => setTenantBackupDate(e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #0284c7", fontWeight: "700", fontSize: "0.85rem", color: "#0f172a", outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(getMexicoISOString());
                          d.setDate(d.getDate() - 1);
                          setTenantBackupDate(d.toISOString().slice(0, 10));
                        }}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "#0284c7", color: "white", border: "none", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        ⏪ Ayer (Día -1)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(getMexicoISOString());
                          d.setDate(d.getDate() - 2);
                          setTenantBackupDate(d.toISOString().slice(0, 10));
                        }}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "#0369a1", color: "white", border: "none", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        ⏪ Anteayer (Día -2)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTenantBackupDate(getMexicoISOString().slice(0, 10));
                        }}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "#e2e8f0", color: "#334155", border: "none", fontWeight: "700", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        📅 Hoy
                      </button>

                      {/* Botón rápido para respaldar los 2 días por separado */}
                      <button
                        type="button"
                        disabled={isTenantBackupLoading}
                        onClick={async () => {
                          const now = new Date(getMexicoISOString());
                          const d1 = new Date(now);
                          d1.setDate(d1.getDate() - 1);
                          const date1Str = d1.toISOString().slice(0, 10);

                          const d2 = new Date(now);
                          d2.setDate(d2.getDate() - 2);
                          const date2Str = d2.toISOString().slice(0, 10);

                          const ok = window.confirm(
                            `¿Deseas crear 2 RESPALDOS INDEPENDIENTES para los últimos 2 días por separado?\n\n1. Respaldo Ayer: ${date1Str}\n2. Respaldo Anteayer: ${date2Str}`
                          );
                          if (!ok) return;

                          setIsTenantBackupLoading(true);
                          try {
                            const tenantShortName = (selectedTenant?.sucursalDefault || selectedTenant?.name || "Tenant").slice(0, 40);
                            const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });

                            // 1. Respaldo Día -1 (Ayer)
                            setTenantBackupProgress(`Creando respaldo del día ${date1Str} (Ayer)...`);
                            const label1 = `${tenantShortName} - [DÍA ${date1Str}] ${timeStr}${tenantBackupNote.trim() ? ` - ${tenantBackupNote.trim()}` : ""}`;
                            const data1 = await exportTenantDataJson(selectedTenant.id, { startDate: date1Str, endDate: date1Str });
                            await saveTenantBackupSnapshot(selectedTenant.id, label1, tenantBackupNote.trim(), data1);

                            // 2. Respaldo Día -2 (Anteayer)
                            setTenantBackupProgress(`Creando respaldo del día ${date2Str} (Anteayer)...`);
                            const label2 = `${tenantShortName} - [DÍA ${date2Str}] ${timeStr}${tenantBackupNote.trim() ? ` - ${tenantBackupNote.trim()}` : ""}`;
                            const data2 = await exportTenantDataJson(selectedTenant.id, { startDate: date2Str, endDate: date2Str });
                            await saveTenantBackupSnapshot(selectedTenant.id, label2, tenantBackupNote.trim(), data2);

                            setTenantBackupProgress("");
                            triggerAppNotification("✅ 2 Respaldos Creados", `Se guardaron exitosamente 2 respaldos por separado para ${date1Str} (Ayer) y ${date2Str} (Anteayer).`, "success");
                          } catch (err: any) {
                            console.error(err);
                            setTenantBackupProgress("");
                            triggerAppNotification("❌ Error", `Error al crear respaldos: ${err.message}`, "warning");
                          } finally {
                            setIsTenantBackupLoading(false);
                          }
                        }}
                        style={{ padding: "6px 12px", borderRadius: "8px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "white", border: "none", fontWeight: "900", fontSize: "0.78rem", cursor: "pointer", marginLeft: "auto" }}
                      >
                        ⚡ Respaldar Últimos 2 Días (Por Separado)
                      </button>

                      <span style={{ fontSize: "0.72rem", color: "#0284c7", fontWeight: "600", width: "100%" }}>
                        💡 Genera respaldos independientes por día para mantener cada jornada ligera e independiente.
                      </span>
                    </div>
                  )}

                  {/* Auto-suffix preview */}
                  {(() => {
                    const now = new Date();
                    const tenantShortName = (selectedTenant?.sucursalDefault || selectedTenant?.name || "Tenant").slice(0, 40);
                    const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
                    const dateTag = tenantBackupMode === "day" ? `[DÍA ${tenantBackupDate}]` : now.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
                    const autoSuffix = `${tenantShortName} - ${dateTag} ${timeStr}`;
                    const finalLabel = tenantBackupNote.trim() ? `${autoSuffix} - ${tenantBackupNote.trim()}` : autoSuffix;
                    return (
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", marginBottom: "4px" }}>📝 Nombre del respaldo:</div>
                        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "8px 12px", fontSize: "0.82rem", fontWeight: "700", color: "#0369a1", fontFamily: "monospace", wordBreak: "break-all" }}>
                          {finalLabel}
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Nota adicional (opcional): Ej. respaldo especial cierre"
                      value={tenantBackupNote}
                      onChange={(e) => setTenantBackupNote(e.target.value)}
                      style={{ flex: 1, minWidth: "220px", padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "10px", fontSize: "0.88rem", outline: "none" }}
                    />
                    <button
                      disabled={isTenantBackupLoading}
                      onClick={() => {
                        const modeMsg = tenantBackupMode === "day"
                          ? `Crear respaldo por día (${tenantBackupDate})`
                          : `Crear respaldo completo de todas las fechas`;
                        const ok = window.confirm(
                          `¿Estás seguro de continuar?\n\nAcción: ${modeMsg} para "${selectedTenant?.name}".`
                        );
                        if (!ok) return;
                        setIsTenantBackupLoading(true);
                        setTenantBackupProgress("Exportando datos del tenant...");
                        (async () => {
                          try {
                            const now = new Date();
                            const tenantShortName = (selectedTenant?.sucursalDefault || selectedTenant?.name || "Tenant").slice(0, 40);
                            const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
                            const dateTag = tenantBackupMode === "day" ? `[DÍA ${tenantBackupDate}]` : now.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
                            const autoSuffix = `${tenantShortName} - ${dateTag} ${timeStr}`;
                            const label = tenantBackupNote.trim() ? `${autoSuffix} - ${tenantBackupNote.trim()}` : autoSuffix;
                            
                            setTenantBackupProgress("Recopilando datos desde Firestore...");
                            const exportOpts = tenantBackupMode === "day" ? { startDate: tenantBackupDate, endDate: tenantBackupDate } : undefined;
                            const data = await exportTenantDataJson(selectedTenant.id, exportOpts);
                            
                            setTenantBackupProgress("Guardando respaldo en la nube...");
                            await saveTenantBackupSnapshot(selectedTenant.id, label, tenantBackupNote.trim(), data);
                            setTenantBackupNote("");
                            setTenantBackupProgress("");
                            triggerAppNotification("✅ Respaldo Creado", `Respaldo "${label}" guardado exitosamente en la nube.`, "success");
                          } catch (err: any) {
                            console.error(err);
                            setTenantBackupProgress("");
                            triggerAppNotification("❌ Error", `No se pudo crear el respaldo: ${err.message}`, "warning");
                          } finally {
                            setIsTenantBackupLoading(false);
                          }
                        })();
                      }}
                      style={{ padding: "10px 20px", background: isTenantBackupLoading ? "#94a3b8" : "#4f46e5", color: "white", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "0.88rem", cursor: isTenantBackupLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                    >
                      {isTenantBackupLoading ? "⏳ Procesando..." : "💾 Crear Respaldo"}
                    </button>
                  </div>
                  {tenantBackupProgress && (
                    <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0f9ff", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "700", color: "#0369a1", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>⏳</span> {tenantBackupProgress}
                    </div>
                  )}
                </div>

                {/* ── LÍNEA TEMPORAL DE RESPALDOS ── */}
                <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontWeight: "900", fontSize: "1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                    ⏳ Línea de Tiempo de Respaldos
                    <span style={{ fontSize: "0.72rem", fontWeight: "700", background: "#ede9fe", color: "#5b21b6", padding: "2px 8px", borderRadius: "99px" }}>
                      {tenantBackupSnapshots.length} respaldos
                    </span>
                  </h3>

                  {tenantBackupSnapshots.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 20px", color: "#94a3b8" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📂</div>
                      <p style={{ fontWeight: "600", fontSize: "0.9rem", margin: "0 0 4px" }}>No hay respaldos registrados aún</p>
                      <p style={{ fontSize: "0.78rem", margin: 0 }}>Crea tu primer respaldo usando el panel de arriba.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {tenantBackupSnapshots.map((snap, idx) => {
                        const sizeKb = snap.sizeEstimate ? Math.round(snap.sizeEstimate / 1024) : 0;
                        const totalDocs = snap.totalDocs ?? (snap.data?.collections
                          ? Object.values(snap.data.collections).reduce((acc: number, arr: any) => acc + (arr?.length || 0), 0)
                          : 0);
                        const createdAt = snap.createdAt ? new Date(snap.createdAt).toLocaleString("es-MX", { hour12: false }) : "";
                        const isDayFiltered = Boolean(snap.startDate);
                        return (
                          <div
                            key={snap.id}
                            style={{
                              background: idx === 0 ? "#faf5ff" : "#f8fafc",
                              border: idx === 0 ? "2px solid #c4b5fd" : "1px solid #e2e8f0",
                              borderRadius: "12px",
                              padding: "14px 16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            {/* Header row */}
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
                                  {idx === 0 && (
                                    <span style={{ fontSize: "0.65rem", fontWeight: "800", background: "#4f46e5", color: "white", padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em" }}>⭐ MÁS RECIENTE</span>
                                  )}
                                  {isDayFiltered ? (
                                    <span style={{ fontSize: "0.65rem", fontWeight: "800", background: "#0284c7", color: "white", padding: "2px 6px", borderRadius: "4px" }}>📅 DÍA {snap.startDate}</span>
                                  ) : (
                                    <span style={{ fontSize: "0.65rem", fontWeight: "800", background: "#6b21a8", color: "white", padding: "2px 6px", borderRadius: "4px" }}>🌐 COMPLETO</span>
                                  )}
                                </div>
                                <div style={{ fontWeight: "800", fontSize: "0.88rem", color: "#1e293b", wordBreak: "break-word" }}>{snap.label}</div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>
                                  🕒 {createdAt} · 📄 {totalDocs} registros · 💾 {sizeKb} KB
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {/* Restore to same tenant */}
                              <button
                                style={{ padding: "6px 12px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer" }}
                                onClick={() => {
                                  const ok1 = window.confirm(
                                    `¿Estás seguro de RESTAURAR este respaldo?\n\n"${snap.label}"\n\nSe REEMPLAZARÁN los datos actuales del tenant "${selectedTenant?.name}".\n\n⚠️ Se recomienda crear un respaldo previo antes de continuar.`
                                  );
                                  if (!ok1) return;
                                  const ok2 = window.confirm(
                                    `⚠️ CONFIRMACIÓN FINAL\n\nEsta acción escribirá ${totalDocs} registros sobre "${selectedTenant?.name}".\n\n¿Deseas continuar?`
                                  );
                                  if (!ok2) return;
                                  setIsTenantBackupLoading(true);
                                  setTenantBackupProgress("Restaurando datos...");
                                  restoreTenantBackupSnapshot(snap, selectedTenant.id, (msg) => setTenantBackupProgress(msg))
                                    .then((count) => {
                                      setTenantBackupProgress("");
                                      triggerAppNotification("✅ Restauración Completa", `Se restauraron ${count} registros en "${selectedTenant?.name}".`, "success");
                                    })
                                    .catch((err: any) => {
                                      setTenantBackupProgress("");
                                      triggerAppNotification("❌ Error", `Error al restaurar: ${err.message}`, "warning");
                                    })
                                    .finally(() => setIsTenantBackupLoading(false));
                                }}
                              >
                                🔄 Restaurar aquí
                              </button>

                              {/* Move to another tenant */}
                              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                <select
                                  value={tenantBackupMoveTarget}
                                  onChange={(e) => setTenantBackupMoveTarget(e.target.value)}
                                  style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", background: "white", color: "#334155", outline: "none" }}
                                >
                                  <option value="">📤 Mover a otro tenant...</option>
                                  {COMPANY_CATALOG.filter(c => c.id !== selectedTenant?.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                                {tenantBackupMoveTarget && (
                                  <button
                                    style={{ padding: "6px 12px", background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer" }}
                                    onClick={() => {
                                      const destTenant = COMPANY_CATALOG.find(c => c.id === tenantBackupMoveTarget);
                                      const ok1 = window.confirm(
                                        `¿Confirmas mover el respaldo:\n"${snap.label}"\n\nal tenant:\n"${destTenant?.name}"?\n\n⚠️ Se recomienda hacer un respaldo previo del tenant destino antes de continuar.`
                                      );
                                      if (!ok1) return;
                                      const ok2 = window.confirm(
                                        `⚠️ ADVERTENCIA FINAL\n\nEsta acción escribirá ${totalDocs} registros sobre "${destTenant?.name}".\n\nLos IDs de documentos serán reescritos con el tenantId destino.\n\n¿Deseas continuar?`
                                      );
                                      if (!ok2) return;
                                      setIsTenantBackupLoading(true);
                                      setTenantBackupProgress(`Migrando datos a "${destTenant?.name}"...`);
                                      restoreTenantBackupSnapshot(snap, tenantBackupMoveTarget, (msg) => setTenantBackupProgress(msg))
                                        .then((count) => {
                                          setTenantBackupProgress("");
                                          setTenantBackupMoveTarget("");
                                          triggerAppNotification("✅ Migración Completa", `Se migraron ${count} registros a "${destTenant?.name}".`, "success");
                                        })
                                        .catch((err: any) => {
                                          setTenantBackupProgress("");
                                          triggerAppNotification("❌ Error", `Error al migrar: ${err.message}`, "warning");
                                        })
                                        .finally(() => setIsTenantBackupLoading(false));
                                    }}
                                  >
                                    📤 Mover
                                  </button>
                                )}
                              </div>

                              {/* Delete */}
                              <button
                                style={{ padding: "6px 12px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer", marginLeft: "auto" }}
                                onClick={() => {
                                  const ok = window.confirm(`¿Eliminar este respaldo?\n\n"${snap.label}"\n\nEsta acción es irreversible.`);
                                  if (!ok) return;
                                  deleteTenantBackupSnapshot(snap.id)
                                    .then(() => triggerAppNotification("🗑️ Eliminado", "El respaldo fue eliminado.", "info"))
                                    .catch((err: any) => triggerAppNotification("❌ Error", err.message, "warning"));
                                }}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                            {tenantBackupProgress && isTenantBackupLoading && (
                              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0369a1", background: "#f0f9ff", padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                ⏳ {tenantBackupProgress}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </IonContent>
          </IonModal>
  );
};
