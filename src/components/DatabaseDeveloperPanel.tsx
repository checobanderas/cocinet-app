import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonBadge
} from "@ionic/react";
import {
  syncOutline,
  notificationsOutline,
  flashOutline,
  cubeOutline,
  cloudDownloadOutline,
  checkmarkCircleOutline,
  bugOutline,
  terminalOutline,
  timeOutline,
  keyOutline
} from "ionicons/icons";

// Helper client-side UUID generator
function createClientUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "usr-" + Math.floor(Math.random() * 1000000) + "-4af3-91ee-" + Date.now();
}

interface DatabaseDeveloperPanelProps {
  websocketSyncLog: any[];
  setWebsocketSyncLog: React.Dispatch<React.SetStateAction<any[]>>;
  isOnline: boolean;
  triggerAppNotification?: (title: string, body: string, type?: "success" | "warning" | "danger") => void;
  printerQueue?: any[];
  onDeletePedido?: (id: string) => void;
}

export default function DatabaseDeveloperPanel({
  websocketSyncLog,
  setWebsocketSyncLog,
  isOnline,
  triggerAppNotification,
  printerQueue = [],
  onDeletePedido
}: DatabaseDeveloperPanelProps) {
  const [conceptInput, setConceptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [schemaResult, setSchemaResult] = useState<any | null>(null);
  const [designHistory, setDesignHistory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_mysql_designs");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof Notification !== "undefined") {
      return Notification.permission;
    }
    return "default";
  });

  const [notificationActive, setNotificationActive] = useState<boolean>(() => {
    try {
      const pref = localStorage.getItem("pos_push_notifications_enabled");
      return pref !== "false"; // default to true
    } catch {
      return true;
    }
  });

  // Keep design history in local cache
  useEffect(() => {
    try {
      localStorage.setItem("pos_mysql_designs", JSON.stringify(designHistory));
    } catch (e) {
      console.warn("Error caching designs:", e);
    }
  }, [designHistory]);

  const requestNotificationPermissions = () => {
    if (typeof Notification !== "undefined") {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          if (triggerAppNotification) {
            triggerAppNotification("🔔 ¡Notificaciones de Servidor!", "Las notificaciones locales push se han habilitado con éxito. 📲", "success");
          }
          new Notification("🔔 Notificaciones COCINET Activas", {
            body: "Cambios en base de datos MySQL sincronizados con éxito vía WebSockets en tiempo real.",
            icon: "https://img.icons8.com/fluency/192/restaurant.png"
          });
        }
      });
    } else {
      alert("Tu navegador no soporta notificaciones de escritorio de manera nativa.");
    }
  };

  const handleGenerateSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptInput.trim()) return;

    setIsGenerating(true);
    setSchemaResult(null);

    // Provide visual response
    if (triggerAppNotification) {
      triggerAppNotification("🤖 IA pensando...", "Generando estructura relacional óptima de base de datos MySQL...", "warning");
    }

    try {
      const response = await fetch("/api/generate-mysql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: conceptInput })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Fallo en la comunicación con el servidor");
      }

      const data = await response.json();
      setSchemaResult(data);
      setDesignHistory([data, ...designHistory.slice(0, 9)]);

      if (triggerAppNotification) {
        triggerAppNotification("🎉 ¡Estructura Generada con éxito!", `Tabla MySQL [${data.tableName}] validada y diseñada con UUID único y control de marcas de tiempo. 💾`, "success");
      }

      // Add instant entry to websocket synclog
      const newWsEvent = {
        id: "ws-ai-" + Date.now(),
        uid: createClientUUID(),
        event: "SCHEMA_GENERATE",
        topic: `sync:${data.tableName}`,
        timestamp: new Date().toISOString(),
        details: `💡 IA de COCINET generó diseño de tabla '${data.tableName}' y propago el DDL correspondiente por WebSockets.`
      };
      setWebsocketSyncLog(prev => [newWsEvent, ...prev]);

      // Push real browser notification if allowed
      if (notificationActive && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("💾 Nuevo Diseño de Base de Datos MySQL", {
          body: `Tabla "${data.tableName}" generada con clave primaria UUID y marcas de tiempo de edición.`,
          icon: "https://img.icons8.com/fluency/192/restaurant.png"
        });
      }

    } catch (err: any) {
      console.error(err);
      if (triggerAppNotification) {
        triggerAppNotification("❌ Error de generación", err.message || "Fallo en el servicio de IA.", "danger");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateInsertUpdateEvent = (eventType: "INSERT" | "UPDATE") => {
    const tableId = schemaResult?.tableName || "ordenes_comandas";
    const syntheticId = createClientUUID();
    const currentTs = new Date().toISOString().replace("T", " ").substring(0, 19);

    const detailText = eventType === "INSERT"
      ? `📩 Registro guardado con UUID único: [${syntheticId}] | con 'created_at': ${currentTs} | sincronizado vía WebSockets.`
      : `📝 Registro editado con UUID único: [${syntheticId}] | con 'updated_at' actualizado a: ${currentTs} | propagado en tiempo real.`;

    const newWsEvent = {
      id: "ws-event-" + Date.now(),
      uid: syntheticId,
      event: eventType,
      topic: `sync:${tableId}`,
      timestamp: new Date().toISOString(),
      details: detailText
    };

    setWebsocketSyncLog(prev => [newWsEvent, ...prev]);

    if (triggerAppNotification) {
      triggerAppNotification(`💾 Sincronización MySQL ${eventType}`, `Registro ${eventType === "INSERT" ? "creado" : "editado"} con marcas de tiempo en tiempo real.`, "success");
    }

    if (notificationActive && typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(`⚡ Evento WebSockets: ${eventType}`, {
        body: `Cambio en tabla '${tableId}' propagado con UUID: [${syntheticId.slice(0, 8)}...]`,
        icon: "https://img.icons8.com/fluency/192/restaurant.png"
      });
    }
  };

  const clearLogs = () => {
    setWebsocketSyncLog([
      {
        id: "ws-event-reset",
        uid: createClientUUID(),
        event: "CONNECT",
        topic: "sync:pos_terminal_main",
        timestamp: new Date().toISOString(),
        details: "🔌 Conexión reiniciada con éxito con el servidor de sincronización continuo."
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      
      {/* Real-time Status and Notification Controls banner */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Sincronización Continua por WebSockets 🔌
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Diseño enfocado a la validación de apps en caliente. Sincroniza de manera continua toda la auditoría del restaurante, comandas y cortes utilizando bases de datos relacionales robustas (MySQL) mediante identificadores únicos UUID para prevenir colisiones distribuidas, con marcas de tiempo (timestamp) de creación y edición.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activar Push</p>
                <p className="text-xs font-semibold text-slate-200">{notificationActive ? "Activadas 🔔" : "Muteadas 🔕"}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationActive}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    setNotificationActive(nextVal);
                    localStorage.setItem("pos_push_notifications_enabled", String(nextVal));
                    if (nextVal && notificationPermission !== "granted") {
                      requestNotificationPermissions();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <IonButton
              size="small"
              fill="solid"
              color={notificationPermission === "granted" ? "success" : "warning"}
              onClick={requestNotificationPermissions}
              style={{ "--border-radius": "14px", fontWeight: "900", fontSize: "11px", height: "46px" }}
            >
              <IonIcon icon={notificationsOutline} slot="start" />
              {notificationPermission === "granted" ? "Nativas Habilitadas" : "Habilitar Notificaciones 🗣️"}
            </IonButton>
          </div>
        </div>
      </div>

      {/* Real-time Printer Monitor 🖨️ */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <IonIcon icon={syncOutline} style={{ fontSize: "24px" }} />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">
                Cola de Impresión Real-Time (CloudSync) 🖨️
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Monitor de comandos enviados a la nube para impresión local en Windows/Android.
              </p>
            </div>
          </div>
          <div className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black border border-emerald-100 animate-pulse">
            SINCRO ACTIVA
          </div>
        </div>

        {printerQueue.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <div className="text-3xl mb-2">📥</div>
            <p className="text-xs font-bold">Sin actividad de impresión reciente</p>
            <p className="text-[10px] mt-1">Envía una prueba o genera un pedido para ver actividad.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {printerQueue.map((pedido) => (
              <div key={pedido.id} className={`p-4 rounded-2xl border transition-all ${pedido.impreso ? "bg-slate-50 border-slate-100" : "bg-indigo-50/30 border-indigo-100 shadow-sm"}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${pedido.tipo === "cuenta" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                    {pedido.tipo}
                  </span>
                  <span className={`text-[9px] font-bold ${pedido.impreso ? "text-slate-400" : "text-indigo-600"}`}>
                    {pedido.impreso ? "✅ Impreso" : "⏳ En cola"}
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 mb-0.5 truncate">Mesa: {pedido.mesa}</div>
                <div className="text-[10px] text-slate-500 font-mono mb-2 truncate">Folio: #{pedido.folio}</div>
                
                <div className="space-y-1 mb-3 max-h-20 overflow-y-auto no-scrollbar">
                  {pedido.items?.map((item: any, idx: number) => (
                    <div key={idx} className="text-[10px] text-slate-600 flex justify-between gap-1">
                      <span className="truncate">{item.cantidad}x {item.nombre}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 mt-auto">
                  <span className="text-[9px] text-slate-400 font-mono">
                    {pedido.timestamp ? new Date(pedido.timestamp).toLocaleTimeString() : "N/A"}
                  </span>
                  <button
                    onClick={() => onDeletePedido && onDeletePedido(pedido.id)}
                    className="text-[9px] font-black text-rose-500 hover:text-rose-700 transition cursor-pointer"
                  >
                    ELIMINAR 🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IonGrid className="ion-no-padding">
        <IonRow className="ion-no-padding" style={{ gap: "24px" }}>
          
          {/* Main MySQL Generator using Gemini AI */}
          <IonCol size="12" sizeMd="6" className="ion-no-padding" style={{ display: "flex", flexDirection: "column" }}>
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <IonIcon icon={cubeOutline} style={{ fontSize: "24px" }} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Diseñador y Validador de BD MySQL con IA 🤖🍟
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Describe cualquier módulo del restaurante y la Inteligencia Artificial generará un diseño óptimo para MySQL aplicando UUIDv4 y marcas de tiempo de auditoría.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateSchema} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    ¿Qué módulo de datos deseas diseñar? *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={conceptInput}
                      onChange={(e) => setConceptInput(e.target.value)}
                      required
                      placeholder="Ej. 'comandas_meseros', 'entradas_insumos_proveedor', 'asistencias'..."
                      className="flex-1 p-3.5 border border-slate-200 rounded-2xl bg-slate-50 font-bold text-xs focus:border-indigo-500 focus:bg-white outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !conceptInput.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs px-5 rounded-2xl transition duration-200 border-none outline-none flex items-center gap-1.5 cursor-pointer"
                    >
                      {isGenerating ? <IonSpinner name="crescent" style={{ width: "16px", height: "16px", color: "white" }} /> : <IonIcon icon={flashOutline} />}
                      Diseñar Con IA
                    </button>
                  </div>
                </div>
                
                {/* Seed suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {["historial_comandas", "control_de_caja", "recetas_detalladas", "asistencia_personal"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setConceptInput(s)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1 rounded-full transition outline-none cursor-pointer"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </form>

              {/* Display Result of Schema Generation */}
              <AnimatePresence mode="wait">
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center space-y-3"
                  >
                    <IonSpinner color="indigo" name="crescent" style={{ width: "32px", height: "32px" }} />
                    <p className="text-xs font-bold text-slate-600">
                      Analizando el concepto y estructurando DDL con validaciones de tipo en sucursal... ⚡
                    </p>
                  </motion.div>
                )}

                {schemaResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="border border-indigo-100 rounded-3xl overflow-hidden shadow-sm"
                  >
                    {/* Header bar */}
                    <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] bg-indigo-500 font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-white">
                          Sugerencia IA MySQL
                        </span>
                        <h5 className="text-xs font-bold tracking-tight">
                          📋 Tabla: <span className="font-mono text-yellow-300">{schemaResult.tableName}</span>
                        </h5>
                      </div>
                      <div className="text-xs font-bold text-indigo-300 bg-white/10 px-2 py-1 rounded-lg">
                        ✅ Validado
                      </div>
                    </div>

                    <div className="p-4 space-y-4 bg-slate-50/50">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción del Modelo</p>
                        <p className="text-xs text-slate-600 leading-normal">{schemaResult.description}</p>
                      </div>

                      {/* Columns List with validation metrics */}
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Columnas y Tipos Asignados</p>
                        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-[11px] leading-tight">
                          {schemaResult.columns?.map((col: any, j: number) => (
                            <div key={j} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                              <div className="space-y-0.5 text-left">
                                <span className="font-bold text-slate-800 font-mono">{col.name}</span>
                                <span className="block text-[9px] text-slate-400 font-medium">{col.description}</span>
                              </div>
                              <div className="text-right flex items-center gap-1.5">
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono font-bold text-slate-600 text-[10px]">
                                  {col.type}
                                </span>
                                {col.constraints && (
                                  <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-yellow-200">
                                    {col.constraints}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SQL Code with Unique UUID and Timestamps */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Script DDL MySQL (Alineado a SAT/PROFECO)</p>
                          <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <IonIcon icon={keyOutline} style={{ fontSize: "10px" }} /> UUID + Timestamps
                          </span>
                        </div>
                        <div className="bg-slate-950 text-emerald-400 p-3 rounded-2xl font-mono text-[10px] overflow-x-auto shadow-inner border border-slate-900 leading-tight max-h-52 overflow-y-auto w-full no-scrollbar">
                          <pre>{schemaResult.sql}</pre>
                        </div>
                      </div>

                      {/* Controller events to test syncing */}
                      <div className="bg-white border border-indigo-50 rounded-2xl p-4 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black tracking-widest text-[#4f46e5]/80 uppercase block">Simular Flujo WebSockets</span>
                          <p className="text-[10.5px] text-slate-500 leading-normal">
                            Prueba la transmisión de datos continua para esta tabla. Puedes inyectar un paquete simulado en el registro central que incluye UUIDs únicos y su respectiva fecha/hora de creación.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => simulateInsertUpdateEvent("INSERT")}
                            className="bg-indigo-650 hover:bg-slate-900 bg-indigo-600 text-white font-bold text-xs py-2 px-3 rounded-xl transition border-none outline-none flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>➕</span> Simular INSERT (UUID)
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateInsertUpdateEvent("UPDATE")}
                            className="bg-amber-500 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-xl transition border-none outline-none flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>📝</span> Simular UPDATE
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Design History List */}
              {designHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    💾 Diseños Creados Recientemente
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {designHistory.map((h: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSchemaResult(h)}
                        className="text-[10.5px] font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-205 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        🗄️ {h.tableName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </IonCol>

          {/* WebSockets Real-Time Sincronization Feed */}
          <IonCol size="12" sizeMd="6" className="ion-no-padding" style={{ display: "flex", flexDirection: "column" }}>
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <IonIcon icon={terminalOutline} style={{ fontSize: "24px" }} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-bold text-slate-800">
                        Consola de Eventos WebSockets 📡📶
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Auditoría en tiempo real de transiciones relacionales. Registra cada inserción y modificación distribuida.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={clearLogs}
                    className="text-[10px] text-slate-400 font-bold hover:text-slate-600 bg-slate-50 border border-slate-150 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Llimpiar Consola 🗑️
                  </button>
                </div>

                {/* Simulated Terminal List of WebSocket packets */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar flex-1">
                  <AnimatePresence>
                    {websocketSyncLog.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-slate-950 text-slate-100 p-4 rounded-2xl border border-slate-900 font-mono text-[10.5px] space-y-2 relative overflow-hidden text-left"
                      >
                        {/* Event details side accent bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            event.event === "CONNECT"
                              ? "bg-blue-500"
                              : event.event === "SUBSCRIBE"
                              ? "bg-purple-500"
                              : event.event === "INSERT"
                              ? "bg-emerald-500"
                              : event.event === "UPDATE"
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                          }`}
                        ></div>

                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 ml-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                                event.event === "CONNECT"
                                  ? "bg-blue-600 text-white"
                                  : event.event === "SUBSCRIBE"
                                  ? "bg-purple-600 text-white"
                                  : event.event === "INSERT"
                                  ? "bg-emerald-600 text-white"
                                  : event.event === "UPDATE"
                                  ? "bg-amber-600 text-white"
                                  : "bg-indigo-600 text-white"
                              }`}
                            >
                              {event.event}
                            </span>
                            <span className="text-slate-400 text-[9px] font-bold">Concepto: <span className="text-blue-300">{event.topic}</span></span>
                          </div>
                          <span className="text-slate-500 text-[8.5px]">{event.timestamp?.split("T")[1]?.slice(0, 8)}</span>
                        </div>

                        <div className="ml-1 text-slate-300 leading-relaxed font-semibold">
                          {event.details}
                        </div>

                        <div className="ml-1 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[9px] border-t border-slate-800/60 text-slate-500 font-bold">
                          <div>
                            🔑 <span className="text-slate-400">UUID Principal:</span> <span className="font-mono text-white text-[9.5px]/none bg-white/5 px-1 py-0.5 rounded block truncate select-all">{event.uid}</span>
                          </div>
                          <div>
                            🕒 <span className="text-slate-400">Sincronizado:</span> <span className="text-slate-300 block leading-none">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Explanatory footer aligned to MySQL UUID + Timestamps DDL constraints */}
              <div className="bg-slate-50 rounded-2xl p-4 text-[11px] text-slate-500/90 leading-relaxed font-medium space-y-1 text-left border border-slate-100">
                <p className="font-bold text-slate-700 flex items-center gap-1">
                  ⚖️ ¿Por qué usar UUID únicos y marcas de tiempo? (Validation Checklist)
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Colisiones de IDs evadidas:</strong> Al registrar comandas en modo offline en PWA, los UUIDs únicos generados en cliente se agregan sin chocar en SQLite/MySQL de manera remota.</li>
                  <li><strong>Auditorías completas de creación y edición:</strong> Los campos <span className="font-mono text-slate-700 bg-slate-200/50 px-1 rounded font-bold">created_at</span> y <span className="font-mono text-slate-700 bg-slate-200/50 px-1 rounded font-bold">updated_at</span> administran el origen y modificación del registro con precisión al microsegundo.</li>
                  <li><strong>Sincronización WebSockets continua:</strong> Los eventos fluyen en caliente unificando terminales de meseros, cajero y cocina instantáneamente.</li>
                </ul>
              </div>

            </div>
          </IonCol>
          
        </IonRow>

        {/* 🏢 PANEL EXCLUSIVO DE ARQUITECTURA MULTI-TENANCY & PROPIEDAD */}
        <IonRow className="ion-no-padding mt-6" id="multi-tenancy-steps">
          <IonCol size="12" className="ion-no-padding">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800 space-y-6 text-left">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-950 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
                    Propietario SMC-SISTEMAS Asignado 🌟
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                    Isolación de Base de Datos & Multi-Inquilino 🏢💾
                  </h4>
                  <p className="text-xs text-slate-350 font-medium">
                    Asignación y distribución de pertenencia corporativa bajo el esquema relacional MySQL y autenticación Firebase.
                  </p>
                </div>

                {/* Main default owner indicator */}
                <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg max-w-sm">
                  <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-500 text-lg">
                    🤠
                  </div>
                  <div className="text-left font-mono">
                    <p className="text-[9px] uppercase font-bold text-amber-500 leading-none">Inquilino Predeterminado</p>
                    <p className="text-xs font-black text-slate-100 select-all leading-normal">sombrerudossantamariah@gmail.com</p>
                    <p className="text-[9px] text-slate-450 leading-none mt-1">UUID: <span className="text-indigo-400">c0a80101-1e24-4b5c-8d1e-sombrerudos</span></p>
                  </div>
                </div>
              </div>

              {/* Guía Multi-Tenant step by step cards */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left block: Relational steps */}
                  <div className="bg-slate-950/40 border border-indigo-950/60 rounded-2xl p-5 space-y-3.5">
                    <h5 className="text-sm font-black text-indigo-300 flex items-center gap-1.5">
                      🔄 Pasos para Migrar y Hacerlo Multi-Tenancy en MySQL/Firebase
                    </h5>
                    
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">
                          1
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-slate-150 font-extrabold text-[12.5px]">Añadir Columnas de Tenant & UUID</p>
                          <p className="text-slate-350 text-[11px] font-medium leading-relaxed">
                            Modifica tu comando SQL utilizando <span className="font-mono text-indigo-200 bg-indigo-900/40 px-1 py-0.5 rounded">ALTER TABLE</span> para agregar una columna <span className="font-mono text-indigo-200 bg-indigo-900/40 px-1 py-0.5 rounded">tenant_id VARCHAR(36) NOT NULL</span> en cada tabla de tu base de datos relacional (comandas, ventas, inventarios, etc.).
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">
                          2
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-slate-150 font-extrabold text-[12.5px]">Inyectar Custom Claims en Firebase Token</p>
                          <p className="text-slate-350 text-[11px] font-medium leading-relaxed">
                            Al crear usuarios en Firebase, usa Firebase Admin SDK para incrustar el <span className="font-mono text-indigo-200 bg-indigo-900/40 px-1 py-0.5 rounded">tenantId</span> en los Claims de autenticación: 
                            <br/>
                            <span className="font-mono text-indigo-300 block text-[10px] mt-1 bg-black/40 p-1.5 rounded">admin.auth().setCustomUserClaims(uid, &#123; tenantId: '...' &#125;)</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">
                          3
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-slate-150 font-extrabold text-[12.5px]">Filtrar Consultas en Servidores (Routing)</p>
                          <p className="text-slate-350 text-[11px] font-medium leading-relaxed">
                            Asegúrate de que todos tus endpoints de API o queries SQL incluyan obligatoriamente el filtro de pertenencia:
                            <br/>
                            <span className="font-mono text-indigo-300 block text-[10px] mt-1 bg-black/40 p-1.5 rounded">SELECT * FROM comandas WHERE tenant_id = req.user.tenantId</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right block: Synchronization and constraints */}
                  <div className="bg-slate-950/40 border border-indigo-950/60 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">
                          4
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-slate-150 font-extrabold text-[12.5px]">Canales WebSocket Distribuidos por Room</p>
                          <p className="text-slate-350 text-[11px] font-medium leading-relaxed">
                            En el servidor WebSockets (Socket.io / ws), agrupa las conexiones de los clientes en salas independientes usando el <span className="font-mono text-indigo-200 bg-indigo-900/40 px-1 py-0.5 rounded">tenant_id</span>. Las actualizaciones en caliente solo fluirán en el room del inquilino correspondiente, previniendo fuga de información sensible.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">
                          5
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-slate-150 font-extrabold text-[12.5px]">Marcas de Tiempo e Índices Únicos</p>
                          <p className="text-slate-350 text-[11px] font-medium leading-relaxed">
                            Implementa un índice compuesto en tu base de datos MySQL combinando <span className="font-mono text-indigo-200 bg-indigo-900/40 px-1 py-0.5 rounded">(tenant_id, id)</span>. Esto optimiza el acceso simultáneo a gran escala de múltiples empresas y sucursales, mientras que los triggers de <span className="font-mono text-emerald-300 font-bold">updated_at</span> garantizan auditoría en PWA.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* WebSocket Sync simulation block */}
                    <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-3.5 mt-2 space-y-2 text-[11px]">
                      <span className="font-black text-indigo-300 flex items-center gap-1.5">
                        📡 Sincronización Multi-Tenant Continua
                      </span>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        En esta aplicación, el catálogo de empresas aisla dinámicamente perfiles y configuraciones de impresión con cada clic. Puede realizar simulaciones de sincronización a través de la consola lateral.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </IonCol>
        </IonRow>

      </IonGrid>

    </div>
  );
}
