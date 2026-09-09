import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSpinner
} from '@ionic/react';

export interface ShiftBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenant: any;
  cashierSessions: any[];
  history: any[];
  expenses?: any[];
  currentUser: any;
  triggerAppNotification: (title: string, msg: string, type?: string) => void;
}

export const ShiftBackupModal: React.FC<ShiftBackupModalProps> = ({
  isOpen,
  onClose,
  selectedTenant,
  cashierSessions = [],
  history = [],
  expenses = [],
  currentUser,
  triggerAppNotification,
}) => {
  // Sentinel State
  const [isSentinelOnline, setIsSentinelOnline] = useState<boolean | null>(null);
  const [sentinelFiles, setSentinelFiles] = useState<any[]>([]);
  const [sentinelDir, setSentinelDir] = useState<string>("C:\\buzon\\respaldos\\turnos");
  const [isLoadingSentinel, setIsLoadingSentinel] = useState<boolean>(false);

  // Form State
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [backupNote, setBackupNote] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>("");

  // Inspection / Preview Modal State
  const [inspectingShift, setInspectingShift] = useState<any | null>(null);
  const [importedShiftData, setImportedShiftData] = useState<any | null>(null);

  // Filter sessions for the active tenant
  const tenantId = selectedTenant?.id || "default";
  const tenantName = selectedTenant?.name || selectedTenant?.sucursalDefault || "Sucursal";

  // Check Sentinel status & fetch existing backups
  const checkSentinelBackups = async () => {
    setIsLoadingSentinel(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("http://localhost:3010/backup-turnos", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setIsSentinelOnline(true);
        setSentinelFiles(data.backups || []);
        if (data.turnos_dir) {
          setSentinelDir(data.turnos_dir);
        }
      } else {
        setIsSentinelOnline(false);
      }
    } catch (e) {
      setIsSentinelOnline(false);
    } finally {
      setIsLoadingSentinel(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkSentinelBackups();
    }
  }, [isOpen]);

  // Build Shift Data Payload for a given CashierSession
  const buildShiftPayload = (session: any, customNote: string = "") => {
    const sId = session.id;

    // Filter sales belonging to this session
    // Match by session.id, or time window fallback
    const shiftSales = history.filter((h: any) => {
      if (h.sessionId && h.sessionId === sId) return true;
      if (!h.sessionId && session.openedAt) {
        const hTime = new Date(h.timestamp || h.createdAt || 0).getTime();
        const openTime = new Date(session.openedAt).getTime();
        const closeTime = session.closedAt ? new Date(session.closedAt).getTime() : Date.now() + 86400000;
        return hTime >= openTime && hTime <= closeTime;
      }
      return false;
    });

    // Filter expenses belonging to this session
    const shiftExpenses = (expenses || []).filter((exp: any) => {
      if (exp.sessionId && exp.sessionId === sId) return true;
      if (!exp.sessionId && session.openedAt) {
        const expTime = new Date(exp.timestamp || exp.date || 0).getTime();
        const openTime = new Date(session.openedAt).getTime();
        const closeTime = session.closedAt ? new Date(session.closedAt).getTime() : Date.now() + 86400000;
        return expTime >= openTime && expTime <= closeTime;
      }
      return false;
    });

    const totalVentas = shiftSales
      .filter((s: any) => s.status !== "cancelled")
      .reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0);

    const totalGastos = shiftExpenses
      .reduce((sum: number, e: any) => sum + (Number(e.amount || e.monto) || 0), 0);

    const opDate = session.openedAt ? session.openedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);

    return {
      backupType: "turno_movimientos",
      version: "2.0",
      tenantId: tenantId,
      tenantName: tenantName,
      sessionId: sId,
      opDate: opDate,
      openedAt: session.openedAt || new Date().toISOString(),
      closedAt: session.closedAt || (session.status === "open" ? null : new Date().toISOString()),
      status: session.status || "closed",
      userName: session.userName || currentUser?.name || "Cajero",
      userId: session.userId || currentUser?.id || "",
      note: customNote || backupNote,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.name || "Admin",
      
      // Totales del Turno
      summary: {
        totalVentas: Number(totalVentas.toFixed(2)),
        ticketsCount: shiftSales.length,
        validTicketsCount: shiftSales.filter((s: any) => s.status !== "cancelled").length,
        cancelledTicketsCount: shiftSales.filter((s: any) => s.status === "cancelled").length,
        totalGastos: Number(totalGastos.toFixed(2)),
        dotacionInicial: session.dotacionInicial || 0,
        arqueoTotal: session.arqueoTotal || 0,
        diferencia: session.diferencia || 0,
        cashSales: session.cashSales || 0,
        cardSales: session.cardSales || 0,
        transSales: session.transSales || 0,
      },

      // Datos de Corte de Caja
      corteData: {
        dotacionInicial: session.dotacionInicial || 0,
        arqueoTotal: session.arqueoTotal || 0,
        arqueoBilletes: session.arqueoBilletes || 0,
        arqueoMonedas: session.arqueoMonedas || 0,
        estimatedCash: session.estimatedCash || 0,
        diferencia: session.diferencia || 0,
      },

      // Registro Detallado de Cuentas / Movimientos
      sales: shiftSales,
      expenses: shiftExpenses,
    };
  };

  // Helper: Download JSON file directly in browser
  const downloadJsonFile = (payload: any, filename: string) => {
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save single shift to Sentinel or Download
  const handleSaveShiftBackup = async (session: any, mode: "sentinel" | "download" | "both" = "both") => {
    setIsProcessing(true);
    setProcessStatus(`Generando respaldo para el turno: ${session.userName || "Cajero"} (${session.id})...`);
    
    try {
      const payload = buildShiftPayload(session, backupNote);
      const cleanTenant = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanSession = String(session.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanDate = (payload.opDate || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `turno_${cleanTenant}_${cleanDate}_${cleanSession}.json`;

      let savedToSentinel = false;

      // Try Sentinel HTTP POST
      if (mode === "sentinel" || mode === "both") {
        try {
          const res = await fetch("http://localhost:3010/backup-turno", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            savedToSentinel = true;
            await checkSentinelBackups();
          }
        } catch (e) {
          console.warn("Sentinel offline o inaccesible vía HTTP:", e);
        }
      }

      // Download directly if requested or if Sentinel was offline
      if (mode === "download" || (!savedToSentinel && mode === "both")) {
        downloadJsonFile(payload, filename);
      }

      if (savedToSentinel) {
        triggerAppNotification(
          "📦 Turno Respaldado",
          `Respaldo guardado exitosamente en ${sentinelDir}\\${filename}`,
          "success"
        );
      } else {
        triggerAppNotification(
          "📥 Archivo JSON Descargado",
          `Se descargó el respaldo "${filename}" en tu computadora.`,
          "success"
        );
      }

      setBackupNote("");
    } catch (err: any) {
      console.error(err);
      triggerAppNotification("❌ Error", `No se pudo respaldar: ${err.message}`, "warning");
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  // Bulk backup all sessions
  const handleBulkBackupAll = async () => {
    if (cashierSessions.length === 0) {
      triggerAppNotification("ℹ️ Sin Turnos", "No hay turnos registrados para respaldar.", "info");
      return;
    }

    const ok = window.confirm(
      `¿Deseas respaldar TODOS los (${cashierSessions.length}) turnos registrados de ${tenantName} en formato JSON?`
    );
    if (!ok) return;

    setIsProcessing(true);
    let successCount = 0;

    for (let i = 0; i < cashierSessions.length; i++) {
      const s = cashierSessions[i];
      setProcessStatus(`Respaldando turno ${i + 1} de ${cashierSessions.length}: ${s.id}...`);
      try {
        const payload = buildShiftPayload(s, "Respaldo masivo de turnos");
        const cleanTenant = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, "_");
        const cleanSession = String(s.id).replace(/[^a-zA-Z0-9_-]/g, "_");
        const cleanDate = (payload.opDate || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `turno_${cleanTenant}_${cleanDate}_${cleanSession}.json`;

        let saved = false;
        try {
          const res = await fetch("http://localhost:3010/backup-turno", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) saved = true;
        } catch (e) {}

        if (!saved) {
          downloadJsonFile(payload, filename);
        }
        successCount++;
      } catch (err) {
        console.error("Error respaldando turno individual:", s.id, err);
      }
    }

    await checkSentinelBackups();
    setIsProcessing(false);
    setProcessStatus("");
    triggerAppNotification(
      "⚡ Respaldos en Lote Completados",
      `Se procesaron ${successCount} turnos exitosamente.`,
      "success"
    );
  };

  // Handle uploaded JSON file inspection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setImportedShiftData(json);
        triggerAppNotification("📄 Archivo Cargado", `Respaldo "${file.name}" leído correctamente.`, "success");
      } catch (err: any) {
        triggerAppNotification("❌ Error de Formato", "El archivo seleccionado no es un JSON válido.", "warning");
      }
    };
    reader.readAsText(file);
  };

  // Sort sessions: open first, then newest closed
  const sortedSessions = [...cashierSessions].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (a.status !== "open" && b.status === "open") return 1;
    const timeA = new Date(a.openedAt || a.closedAt || 0).getTime();
    const timeB = new Date(b.openedAt || b.closedAt || 0).getTime();
    return timeB - timeA;
  });

  // Check if a session already has a matching file in Sentinel
  const getSentinelFileForSession = (sessionId: string) => {
    return sentinelFiles.find((f: any) => {
      if (f.sessionId && f.sessionId === sessionId) return true;
      if (f.filename && f.filename.includes(sessionId.replace(/[^a-zA-Z0-9_-]/g, "_"))) return true;
      return false;
    });
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{
        "--height": "95%",
        "--width": "100%",
        "--max-width": "860px",
        "--border-radius": "24px",
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
            color: "white",
            padding: "6px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px" }}>
            <span style={{ fontSize: "1.4rem" }}>🗄️</span>
            <div>
              <IonTitle style={{ fontSize: "1.05rem", fontWeight: "900", color: "white", padding: 0 }}>
                Respaldo de Movimientos del Turno
              </IonTitle>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700" }}>
                {tenantName} · Formato JSON / Localhost 3010
              </div>
            </div>
          </div>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ "--color": "white", fontWeight: "bold" }}>
              ✕ Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ "--background": "#f8fafc" }}>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── 1. BANNER INFORMATIVO Y ESTADO DE SENTINEL (LOCALHOST:3010) ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "18px",
              padding: "18px 22px",
              color: "white",
              boxShadow: "0 4px 15px rgba(15, 23, 42, 0.15)",
              border: "1px solid #334155",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ fontWeight: "900", fontSize: "1.05rem", color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📦</span> Almacenamiento Local de Turnos
                </div>
                <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: "1.5" }}>
                  Cada turno (incluyendo ventas de madrugada, arqueos, folios, comandas y gastos) se empaqueta en un archivo <code>.json</code> independiente dentro de <strong>{sentinelDir}</strong> para máxima velocidad y cero riesgo de pérdida.
                </p>
              </div>

              {/* Status Pill */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: isSentinelOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    border: isSentinelOnline ? "1px solid #10b981" : "1px solid #ef4444",
                    padding: "5px 12px",
                    borderRadius: "99px",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    color: isSentinelOnline ? "#34d399" : "#f87171",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: isSentinelOnline ? "#10b981" : "#ef4444",
                      display: "inline-block",
                      boxShadow: isSentinelOnline ? "0 0 8px #10b981" : "none",
                    }}
                  />
                  {isLoadingSentinel
                    ? "Verificando Sentinel..."
                    : isSentinelOnline
                    ? `Sentinel Activo (3010) · ${sentinelFiles.length} respaldos`
                    : "Sentinel Inactivo (Descarga .JSON Activa)"}
                </div>

                <button
                  type="button"
                  onClick={checkSentinelBackups}
                  disabled={isLoadingSentinel}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>🔄</span> Actualizar Carpeta
                </button>
              </div>
            </div>

            <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "0.75rem", color: "#94a3b8" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "6px" }}>
                📁 Carpeta destino: <code style={{ color: "#38bdf8" }}>{sentinelDir}</code>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "6px" }}>
                📊 Total de turnos en memoria: <strong style={{ color: "white" }}>{cashierSessions.length}</strong>
              </div>
            </div>
          </div>

          {/* ── 2. GENERADOR MANUAL DE RESPALDO DE TURNO ── */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ margin: 0, fontWeight: "900", fontSize: "0.95rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💾</span> Generar Respaldo Manual de Turno
              </h3>

              {cashierSessions.length > 1 && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleBulkBackupAll}
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "7px 14px",
                    fontSize: "0.78rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
                  }}
                >
                  ⚡ Respaldar Todos los Turnos ({cashierSessions.length})
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "14px" }}>
              {/* Selector de Turno */}
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                  Seleccionar Turno / Sesión:
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    background: "#f8fafc",
                    color: "#1e293b",
                    outline: "none",
                  }}
                >
                  <option value="">-- Selecciona un turno para respaldar --</option>
                  {sortedSessions.map((s) => {
                    const isOpen = s.status === "open";
                    const openDate = s.openedAt ? new Date(s.openedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "Sin fecha";
                    return (
                      <option key={s.id} value={s.id}>
                        {isOpen ? "🟢 [EN CURSO] " : "🔒 [CERRADO] "}
                        {s.userName || "Cajero"} · {openDate} ({s.id.slice(0, 16)}...)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Nota Opcional */}
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                  Nota o Comentario (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cierre de noche, turno madrugada fin de semana"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Action Buttons for selected session */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                disabled={isProcessing || !selectedSessionId}
                onClick={() => {
                  const s = cashierSessions.find((x) => x.id === selectedSessionId);
                  if (s) handleSaveShiftBackup(s, "both");
                }}
                style={{
                  background: !selectedSessionId || isProcessing ? "#94a3b8" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontSize: "0.82rem",
                  fontWeight: "900",
                  cursor: !selectedSessionId || isProcessing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                }}
              >
                <span>💾</span> Guardar Respaldo en C:\buzon\respaldos\turnos
              </button>

              <button
                type="button"
                disabled={isProcessing || !selectedSessionId}
                onClick={() => {
                  const s = cashierSessions.find((x) => x.id === selectedSessionId);
                  if (s) handleSaveShiftBackup(s, "download");
                }}
                style={{
                  background: !selectedSessionId || isProcessing ? "#f1f5f9" : "#e0f2fe",
                  color: !selectedSessionId || isProcessing ? "#94a3b8" : "#0369a1",
                  border: "1px solid #bae6fd",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  fontSize: "0.82rem",
                  fontWeight: "800",
                  cursor: !selectedSessionId || isProcessing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>📥</span> Descargar .JSON
              </button>

              {/* Upload JSON Inspector */}
              <label
                style={{
                  marginLeft: "auto",
                  background: "#f8fafc",
                  border: "1px dashed #94a3b8",
                  color: "#475569",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>📂</span> Inspeccionar / Leer .JSON
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>

            {processStatus && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 14px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "#15803d",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <IonSpinner name="dots" style={{ width: "16px", height: "16px" }} />
                <span>{processStatus}</span>
              </div>
            )}
          </div>

          {/* ── 3. LÍNEA DEL TIEMPO DE MOVIMIENTOS Y TURNOS (TIMELINE) ── */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ margin: 0, fontWeight: "900", fontSize: "1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⏳</span> Línea de Tiempo de Turnos y Movimientos
                <span style={{ fontSize: "0.72rem", fontWeight: "800", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "99px" }}>
                  {sortedSessions.length} turnos
                </span>
              </h3>
            </div>

            {sortedSessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", color: "#94a3b8" }}>
                <span style={{ fontSize: "2.8rem" }}>📭</span>
                <p style={{ fontWeight: "700", fontSize: "0.95rem", margin: "10px 0 4px", color: "#475569" }}>
                  No hay turnos registrados en esta sucursal
                </p>
                <p style={{ fontSize: "0.8rem", margin: 0 }}>
                  Abre un turno en el punto de venta o realiza ventas para ver el historial aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: "18px" }}>
                {/* Vertical bar */}
                <div
                  style={{
                    position: "absolute",
                    left: "5px",
                    top: "14px",
                    bottom: "14px",
                    width: "2px",
                    background: "linear-gradient(180deg, #10b981 0%, #6366f1 50%, #cbd5e1 100%)",
                    zIndex: 1,
                  }}
                />

                {sortedSessions.map((session, idx) => {
                  const isOpen = session.status === "open";
                  const sId = session.id;

                  // Sales and stats
                  const shiftSales = history.filter((h: any) => h.sessionId === sId);
                  const totalVentas = shiftSales
                    .filter((s: any) => s.status !== "cancelled")
                    .reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0);

                  const openDate = session.openedAt ? new Date(session.openedAt) : null;
                  const closeDate = session.closedAt ? new Date(session.closedAt) : null;

                  const openFormatted = openDate
                    ? openDate.toLocaleString("es-MX", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "Fecha desconocida";

                  const closeFormatted = closeDate
                    ? closeDate.toLocaleString("es-MX", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                    : isOpen
                    ? "Turno Activo en Curso"
                    : "Cierre registrado";

                  // Check if spans across midnight
                  const isMadrugada = openDate && closeDate && openDate.getDate() !== closeDate.getDate();

                  // Check if Sentinel backup file exists
                  const sentinelBackup = getSentinelFileForSession(sId);

                  return (
                    <div
                      key={sId}
                      style={{
                        position: "relative",
                        paddingLeft: "26px",
                        paddingBottom: idx === sortedSessions.length - 1 ? "0" : "22px",
                        zIndex: 2,
                      }}
                    >
                      {/* Timeline dot */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-18px",
                          top: "6px",
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          background: isOpen ? "#10b981" : sentinelBackup ? "#3b82f6" : "#cbd5e1",
                          border: "3px solid white",
                          boxShadow: "0 0 0 2px " + (isOpen ? "rgba(16, 185, 129, 0.3)" : "rgba(203, 213, 225, 0.4)"),
                        }}
                      />

                      {/* Card Content */}
                      <div
                        style={{
                          background: isOpen ? "#f0fdf4" : sentinelBackup ? "#fafafa" : "#ffffff",
                          border: isOpen ? "1.5px solid #86efac" : sentinelBackup ? "1px solid #cbd5e1" : "1px solid #e2e8f0",
                          borderRadius: "14px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                              {isOpen ? (
                                <span style={{ fontSize: "0.68rem", fontWeight: "900", background: "#10b981", color: "white", padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.03em" }}>
                                  🟢 TURNO ACTIVO
                                </span>
                              ) : (
                                <span style={{ fontSize: "0.68rem", fontWeight: "800", background: "#475569", color: "white", padding: "2px 8px", borderRadius: "6px" }}>
                                  🔒 CERRADO
                                </span>
                              )}

                              {isMadrugada && (
                                <span style={{ fontSize: "0.68rem", fontWeight: "800", background: "#8b5cf6", color: "white", padding: "2px 8px", borderRadius: "6px" }}>
                                  🌙 Incluye Madrugada
                                </span>
                              )}

                              {sentinelBackup ? (
                                <span style={{ fontSize: "0.68rem", fontWeight: "800", background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "6px" }}>
                                  ✅ Respaldado en Sentinel
                                </span>
                              ) : (
                                <span style={{ fontSize: "0.68rem", fontWeight: "800", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "6px" }}>
                                  ⚠️ Pendiente Respaldo Local
                                </span>
                              )}
                            </div>

                            <div style={{ fontWeight: "900", fontSize: "0.92rem", color: "#1e293b" }}>
                              👤 Cajero: {session.userName || "Sin asignar"} · <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>{sId}</span>
                            </div>

                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px", fontWeight: "600" }}>
                              🕒 Apertura: <strong>{openFormatted}</strong> &rarr; Cierre: <strong>{closeFormatted}</strong>
                            </div>
                          </div>

                          {/* Sales Pill */}
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                              ${totalVentas.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700" }}>
                              📄 {shiftSales.length} movimientos / cuentas
                            </div>
                          </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                            gap: "8px",
                            background: "rgba(241, 245, 249, 0.7)",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            fontSize: "0.72rem",
                          }}
                        >
                          <div>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>💵 Efectivo:</span>
                            <div style={{ fontWeight: "900", color: "#1e293b" }}>
                              ${(session.cashSales || 0).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>💳 Tarjeta:</span>
                            <div style={{ fontWeight: "900", color: "#1e293b" }}>
                              ${(session.cardSales || 0).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>📱 Transf.:</span>
                            <div style={{ fontWeight: "900", color: "#1e293b" }}>
                              ${(session.transSales || 0).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>💼 Dotación Inicial:</span>
                            <div style={{ fontWeight: "900", color: "#1e293b" }}>
                              ${(session.dotacionInicial || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Sentinel File Info if exists */}
                        {sentinelBackup && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#1e40af",
                              background: "#eff6ff",
                              border: "1px solid #dbeafe",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            <span>
                              📁 <strong>{sentinelBackup.filename}</strong> ({Math.round((sentinelBackup.size || 0) / 1024)} KB)
                            </span>
                            <span style={{ color: "#64748b" }}>
                              Modificado: {new Date(sentinelBackup.modifiedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        )}

                        {/* Actions row */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleSaveShiftBackup(session, "both")}
                            style={{
                              padding: "6px 14px",
                              background: sentinelBackup ? "#f0fdf4" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                              color: sentinelBackup ? "#15803d" : "white",
                              border: sentinelBackup ? "1px solid #86efac" : "none",
                              borderRadius: "8px",
                              fontWeight: "800",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>📦</span> {sentinelBackup ? "Actualizar Respaldo" : "Respaldar Turno"}
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleSaveShiftBackup(session, "download")}
                            style={{
                              padding: "6px 12px",
                              background: "#f8fafc",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>📥</span> Descargar .JSON
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectingShift(buildShiftPayload(session))}
                            style={{
                              padding: "6px 12px",
                              background: "#ede9fe",
                              color: "#6b21a8",
                              border: "1px solid #ddd6fe",
                              borderRadius: "8px",
                              fontWeight: "800",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginLeft: "auto",
                            }}
                          >
                            <span>👁️</span> Ver Movimientos ({shiftSales.length})
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 4. VISOR / INSPECTOR DE MOVIMIENTOS DETALLADOS DEL TURNO ── */}
          {(inspectingShift || importedShiftData) && (
            <div
              style={{
                background: "white",
                borderRadius: "18px",
                border: "2px solid #818cf8",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.12)",
              }}
            >
              {(() => {
                const data = inspectingShift || importedShiftData;
                const sales = data.sales || [];
                const expensesList = data.expenses || [];
                return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: "900", fontSize: "1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🔍</span> Detalle de Movimientos: {data.userName} · {data.sessionId}
                        </h4>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                          {importedShiftData ? "📄 Archivo importado externamente" : "📊 Datos en memoria del sistema"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInspectingShift(null);
                          setImportedShiftData(null);
                        }}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontWeight: "800",
                          fontSize: "0.75rem",
                          color: "#475569",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Cerrar Vista Detallada
                      </button>
                    </div>

                    {/* Sales Table */}
                    <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                        <thead style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 5, borderBottom: "1.5px solid #e2e8f0" }}>
                          <tr>
                            <th style={{ padding: "8px 10px", color: "#475569", fontWeight: "800" }}>Folio</th>
                            <th style={{ padding: "8px 10px", color: "#475569", fontWeight: "800" }}>Mesa / Cliente</th>
                            <th style={{ padding: "8px 10px", color: "#475569", fontWeight: "800" }}>Hora</th>
                            <th style={{ padding: "8px 10px", color: "#475569", fontWeight: "800" }}>Pago</th>
                            <th style={{ padding: "8px 10px", color: "#475569", fontWeight: "800", textAlign: "right" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#94a3b8" }}>
                                Sin movimientos registrados en este turno.
                              </td>
                            </tr>
                          ) : (
                            sales.map((sale: any, sIdx: number) => {
                              const timeStr = sale.timestamp || sale.createdAt
                                ? new Date(sale.timestamp || sale.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
                                : "--:--";
                              return (
                                <tr key={sale.id || sIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "8px 10px", fontWeight: "800", color: "#0f172a" }}>
                                    #{sale.folio || sale.id?.slice(-6) || sIdx + 1}
                                  </td>
                                  <td style={{ padding: "8px 10px", color: "#334155" }}>
                                    {sale.tableLabel || sale.tableName || sale.customerName || "Venta Directa"}
                                  </td>
                                  <td style={{ padding: "8px 10px", color: "#64748b" }}>
                                    {timeStr}
                                  </td>
                                  <td style={{ padding: "8px 10px" }}>
                                    <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", textTransform: "capitalize", color: "#334155" }}>
                                      {sale.paymentMethod || "Efectivo"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "8px 10px", fontWeight: "900", color: "#059669", textAlign: "right" }}>
                                    ${(Number(sale.total) || 0).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </IonContent>
    </IonModal>
  );
};
