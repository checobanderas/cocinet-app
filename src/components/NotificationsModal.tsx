import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonIcon,
} from "@ionic/react";
import { notificationsOutline, checkmarkOutline, documentTextOutline, refreshOutline, trashOutline } from "ionicons/icons";
import { getOperatingDay } from "../utils/appHelpers";
import { 
  getNotificationDeliveryLogs, 
  addNotificationDeliveryLog,
  clearNotificationDeliveryLogs, 
  triggerDeviceNotification,
  NotificationDeliveryLog 
} from "../utils/fcm";
import { sendSilentWhatsAppMessage } from "../utils/whatsappCloud";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  isCancellationRequest?: boolean;
  isClosedAccountCancellationRequest?: boolean;
  isComandaNotification?: boolean;
  isCuentaNotification?: boolean;
  tableId?: string;
  accountId?: string;
  tableLabel?: string;
  total?: number;
  itemsToCancel?: { folio: number; productId: string; plate: number; name: string; quantity: number }[];
  branchName?: string;
  waiterName?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
  authorizedBy?: string;
  createdAt?: string;
  cancellationFolio?: string;
  pedidoData?: any;
  escalatedToSystems?: boolean;
  escalatedAt?: string;
  deliveryLogs?: any[];
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationsList: NotificationItem[];
  setNotificationsList: (list: NotificationItem[]) => void;
  onReprint?: (pedido: any) => Promise<void>;
  onAuthorizeCancellation?: (
    tableId: string,
    items: { folio: number; productId: string; plate: number }[],
    pin: string,
    notifId: string
  ) => Promise<any>;
  onRejectCancellation?: (
    tableId: string,
    items: { folio: number; productId: string; plate: number }[],
    notifId: string
  ) => Promise<any>;
  onAuthorizeClosedAccountCancellation?: (
    accountId: string,
    pin: string,
    notifId: string
  ) => Promise<any>;
  onRejectClosedAccountCancellation?: (
    accountId: string,
    notifId: string
  ) => Promise<any>;
  activeSessionOpenedAt?: string;
  targetCancellationFolio?: string | null;
}

const formatNotificationDate = (createdAt?: string, defaultTime?: string) => {
  if (!createdAt) return defaultTime || "Hace un momento";
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return defaultTime || "Hace un momento";
    
    const day = d.getDate();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const month = months[d.getMonth()];
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return defaultTime || "Hace un momento";
  }
};

function NotificationCard({
  notif,
  onMarkAsRead,
  onReprint,
  onAuthorizeCancellation,
  onRejectCancellation,
  onAuthorizeClosedAccountCancellation,
  onRejectClosedAccountCancellation,
  isTarget,
}: {
  key?: string;
  notif: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onReprint?: (pedido: any) => Promise<void>;
  onAuthorizeCancellation?: (
    tableId: string,
    items: { folio: number; productId: string; plate: number }[],
    pin: string,
    notifId: string
  ) => Promise<any>;
  onRejectCancellation?: (
    tableId: string,
    items: { folio: number; productId: string; plate: number }[],
    notifId: string
  ) => Promise<any>;
  onAuthorizeClosedAccountCancellation?: (
    accountId: string,
    pin: string,
    notifId: string
  ) => Promise<any>;
  onRejectClosedAccountCancellation?: (
    accountId: string,
    notifId: string
  ) => Promise<any>;
  isTarget?: boolean;
}) {
  const [pin, setPin] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isAnyCancellationRequest = notif.isCancellationRequest || notif.isClosedAccountCancellationRequest;

  const handleReprint = async () => {
    if (onReprint) {
      await onReprint(notif.pedidoData);
      alert("Reimpresión enviada 🖨️");
    }
  };

  const handleAuthorize = async () => {
    if (!pin) {
      alert("Introduce tu PIN para autorizar");
      return;
    }
    setIsSubmitting(true);
    try {
      if (notif.isClosedAccountCancellationRequest) {
        if (!onAuthorizeClosedAccountCancellation) return;
        const res = await onAuthorizeClosedAccountCancellation(notif.accountId || "", pin, notif.id);
        if (res?.alreadyProcessed) {
          alert(`ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || 'otro administrador'}.`);
        } else if (res) {
          alert(`¡Cancelación de Cuenta Cerrada Autorizada con éxito por ${res.name}! ✅`);
        } else {
          alert("PIN de Administrador incorrecto ❌");
        }
      } else {
        if (!onAuthorizeCancellation) return;
        const res = await onAuthorizeCancellation(notif.tableId || "", notif.itemsToCancel || [], pin, notif.id);
        if (res?.alreadyProcessed) {
          alert(`ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || 'otro administrador'}.`);
        } else if (res) {
          alert(`¡Cancelación de Productos Autorizada con éxito por ${res.name}! ✅`);
        } else {
          alert("PIN de Administrador incorrecto ❌");
        }
      }
    } catch (err: any) {
      alert("Error al autorizar: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
      setPin("");
    }
  };

  const handleReject = async () => {
    if (!window.confirm("¿Estás seguro de que deseas rechazar la cancelación y reactivar los productos/cuenta?")) return;
    setIsSubmitting(true);
    try {
      if (notif.isClosedAccountCancellationRequest) {
        if (!onRejectClosedAccountCancellation) return;
        const res = await onRejectClosedAccountCancellation(notif.accountId || "", notif.id);
        if (res?.alreadyProcessed) {
          alert(`ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || 'otro administrador'}.`);
        } else {
          alert("La solicitud ha sido rechazada y la cuenta vuelve a estar completada. ✕");
        }
      } else {
        if (!onRejectCancellation) return;
        const res = await onRejectCancellation(notif.tableId || "", notif.itemsToCancel || [], notif.id);
        if (res?.alreadyProcessed) {
          alert(`ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || 'otro administrador'}.`);
        } else {
          alert("La solicitud ha sido rechazada y los productos vuelven a estar activos. ✕");
        }
      }
    } catch (err: any) {
      alert("Error al rechazar: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: isTarget
          ? "#fff1f2"
          : isAnyCancellationRequest
          ? "#fff1f2"
          : notif.read
          ? "white"
          : "#fffbeb",
        border: isTarget
          ? "2px solid #e11d48"
          : isAnyCancellationRequest
          ? "1.5px solid #f43f5e"
          : notif.read
          ? "1px solid #e2e8f0"
          : "1.5px solid #f59e0b",
        borderRadius: "18px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: isTarget
          ? "0 0 0 3px rgba(225, 29, 72, 0.2), 0 6px 20px rgba(225, 29, 72, 0.18)"
          : isAnyCancellationRequest
          ? "0 4px 14px rgba(244,63,94,0.12)"
          : notif.read
          ? "none"
          : "0 4px 12px rgba(245,158,11,0.15)",
        transition: "all 0.2s ease",
      }}
      className="font-sans text-slate-800"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "900", color: isAnyCancellationRequest ? "#be123c" : "#1e293b" }}>
          {notif.title}
        </h4>
        <div className="flex gap-1.5 items-center flex-wrap justify-end">
          {isTarget && (
            <span className="bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse uppercase tracking-tight shadow-sm">
              🎯 ENLACE DIRECTO
            </span>
          )}
          {isAnyCancellationRequest && (
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse uppercase">
              REQUERIDO
            </span>
          )}
          {!notif.read && (
            <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
              NUEVO
            </span>
          )}
        </div>
      </div>

      <p style={{ margin: "6px 0 8px 0", fontSize: "0.85rem", color: "#334155", lineHeight: "1.45", whiteSpace: "pre-line" }}>
        {notif.body}
      </p>

        {/* Rich cancellation metadata and action buttons */}
      {isAnyCancellationRequest && (
        <div className="mt-3 p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl space-y-2 text-xs">
          {notif.cancellationFolio && (
            <div className="bg-rose-100 text-rose-900 px-3 py-1.5 rounded-xl font-black tracking-tight flex items-center justify-between mb-1.5 text-xs border border-rose-200">
              <div className="flex items-center gap-1.5">
                <span>🎫</span> Folio de Cancelación: <span className="text-sm font-black text-rose-700">{notif.cancellationFolio}</span>
              </div>
              {notif.escalatedToSystems && (
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow-xs animate-pulse">
                  ⚡ Escalado Sistemas
                </span>
              )}
            </div>
          )}

          {/* Banner de Escalamiento si pasaron > 3 min o si fue escalado */}
          {(notif.escalatedToSystems || (notif.status !== "approved" && notif.status !== "rejected" && notif.createdAt && (Date.now() - new Date(notif.createdAt).getTime()) >= 180000)) && (
            <div className="bg-amber-100 border border-amber-300 text-amber-950 p-2.5 rounded-xl font-bold text-xs flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <div>
                <span className="font-black text-amber-900 block">ESCALADO A SISTEMAS (+5 MIN SIN RESPUESTA)</span>
                <span className="text-[11px] font-medium text-amber-800 leading-tight block">
                  Esta comanda superó el tiempo límite sin respuesta de administradores locales. Habilitada para autorización por Área de Sistemas (PIN Maestro: <b>4020</b>).
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 text-rose-950">
            <div>🏢 <span className="font-bold">Sucursal:</span> {notif.branchName || "No especificada"}</div>
            <div>📍 <span className="font-bold">Mesa:</span> {notif.tableLabel || "No especificada"}</div>
            <div>🤵 <span className="font-bold">Mesero:</span> {notif.waiterName || "No especificado"}</div>
            <div>💰 <span className="font-bold">Total:</span> <span className="font-extrabold text-rose-700 text-sm">${notif.total || 0}</span></div>
          </div>
          
          {notif.itemsToCancel && notif.itemsToCancel.length > 0 && (
            <div className="text-rose-950 font-semibold border-t border-rose-100/50 pt-1.5">
              📦 <span className="font-black">Productos ({notif.itemsToCancel.length}):</span>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 font-normal">
                {notif.itemsToCancel.map((it: any, idx: number) => (
                  <li key={idx}>
                    {it.name} <span className="font-bold text-rose-700">(x{it.quantity})</span> {it.folio !== undefined ? `- Folio #${it.folio}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-rose-950 border-t border-rose-100/50 pt-1.5">
            📝 <span className="font-bold">Motivo:</span> <span className="font-semibold text-rose-800">{notif.reason}</span>
          </div>

          <div className="border-t border-rose-200/50 pt-3">
            {notif.status === "approved" ? (
              <div className="bg-emerald-600 text-white font-black text-center py-2.5 px-3 rounded-xl text-xs flex flex-col items-center justify-center gap-0.5 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span>✓</span> <span>¡Cancelación Autorizada!</span>
                </div>
                <div className="text-[11px] font-normal text-emerald-100">
                  Atendida por <strong className="text-white font-bold">{notif.authorizedBy || "Administrador"}</strong>
                </div>
              </div>
            ) : notif.status === "rejected" ? (
              <div className="bg-slate-600 text-white font-black text-center py-2.5 px-3 rounded-xl text-xs flex flex-col items-center justify-center gap-0.5 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span>✕</span> <span>Solicitud Rechazada / Revertida</span>
                </div>
                {notif.authorizedBy && (
                  <div className="text-[11px] font-normal text-slate-200">
                    Atendida por <strong className="text-white font-bold">{notif.authorizedBy}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-rose-900 font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">🔒 Escribe aquí tu PIN para autorizar:</span>
                  <button
                    type="button"
                    onClick={() => setPin("4020")}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-black px-2 py-0.5 rounded cursor-pointer border-none"
                    title="Usar PIN Maestro de Sistemas (4020)"
                  >
                    Usar PIN Sistemas 🛠️
                  </button>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="PIN Administrador / Sistemas"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  disabled={isSubmitting}
                  className="w-full text-center tracking-[0.5em] font-black text-slate-800 text-base py-2 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAuthorize}
                    disabled={isSubmitting || pin.length < 4}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-2.5 px-3 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                  >
                    {isSubmitting ? "Autorizando..." : "Autorizar Cancelación ✓"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold py-2.5 px-3 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Rechazar ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 📊 SECCIÓN DE TRAZABILIDAD BIDIRECCIONAL & AUDITORÍA EN TIEMPO REAL */}
          <div className="border-t border-rose-100/80 pt-2 space-y-1">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowTimeline(!showTimeline)}
                className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border-none"
              >
                <span>📊</span> <span>{showTimeline ? "Ocultar Trazabilidad" : "Ver Trazabilidad Bidireccional"}</span>
                <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded-full font-black">
                  {(notif.timeline || []).length + (notif.openedCount ? 1 : 0) + 2}
                </span>
              </button>

              {notif.openedCount ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>👁️</span> Abierto ({notif.openedCount}x)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>⏳</span> Sin abrir aún
                </span>
              )}
            </div>

            {showTimeline && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2 text-[11px] shadow-inner">
                <div className="font-black text-amber-400 border-b border-slate-700 pb-1 flex items-center justify-between">
                  <span>Línea de Vida de la Solicitud (#{notif.cancellationFolio || notif.id})</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">Auditoría en Vivo</span>
                </div>

                {/* Eventos del Timeline */}
                <div className="space-y-2 relative pl-2 border-l-2 border-slate-700">
                  {/* Evento 1: Creación */}
                  <div className="relative pl-3">
                    <span className="absolute -left-[11px] top-0.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div className="font-bold text-slate-200">1. Solicitud Registrada</div>
                    <div className="text-[10px] text-slate-400">
                      Por: <b>{notif.waiterName || 'Mesero/Cajero'}</b> • {formatNotificationDate(notif.createdAt)}
                    </div>
                  </div>

                  {/* Evento 2: Despacho WhatsApp/Push */}
                  <div className="relative pl-3">
                    <span className="absolute -left-[11px] top-0.5 w-2 h-2 rounded-full bg-indigo-500"></span>
                    <div className="font-bold text-slate-200">2. Notificaciones Despachadas</div>
                    <div className="text-[10px] text-slate-400">
                      WhatsApp enviado a administradores de sucursal y alerta Push generada con enlace directo.
                    </div>
                  </div>

                  {/* Evento 3: Apertura de Enlace */}
                  <div className="relative pl-3">
                    <span className={`absolute -left-[11px] top-0.5 w-2 h-2 rounded-full ${notif.openedCount ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <div className="font-bold text-slate-200">
                      3. Apertura de URL / Notificación: {notif.openedCount ? `✅ Abierto (${notif.openedCount} veces)` : '⏳ Pendiente (No han dado clic)'}
                    </div>
                    {notif.lastOpenedAt && (
                      <div className="text-[10px] text-emerald-300">
                        Última apertura: {new Date(notif.lastOpenedAt).toLocaleTimeString('es-MX')}
                      </div>
                    )}
                  </div>

                  {/* Eventos adicionales dinámicos */}
                  {(notif.timeline || []).map((ev: any, idx: number) => (
                    <div key={idx} className="relative pl-3">
                      <span className={`absolute -left-[11px] top-0.5 w-2 h-2 rounded-full ${ev.status === 'error' ? 'bg-rose-500' : ev.status === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
                      <div className="font-bold text-slate-200">{ev.title}</div>
                      <div className="text-[10px] text-slate-400">{ev.description}</div>
                      {ev.timestamp && (
                        <div className="text-[9px] text-slate-500 font-mono">
                          {new Date(ev.timestamp).toLocaleTimeString('es-MX')}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Evento Final: Estado Actual */}
                  <div className="relative pl-3">
                    <span className={`absolute -left-[11px] top-0.5 w-2 h-2 rounded-full ${notif.status === 'approved' ? 'bg-emerald-500' : notif.status === 'rejected' ? 'bg-slate-500' : 'bg-rose-500'}`}></span>
                    <div className="font-bold text-slate-200">
                      4. Estado Final: {notif.status === 'approved' ? '✅ AUTORIZADA' : notif.status === 'rejected' ? '✕ RECHAZADA' : '⏳ EN ESPERA DE AUTORIZACIÓN'}
                    </div>
                    {notif.authorizedBy && (
                      <div className="text-[10px] text-slate-300">
                        Atendida por: <b>{notif.authorizedBy}</b>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>
          📅 {formatNotificationDate(notif.createdAt, notif.time)}
        </span>
        <div className="flex items-center gap-2">
          {onReprint && (notif.isComandaNotification || notif.isCuentaNotification) && (
            <button
              onClick={handleReprint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all border-none cursor-pointer"
            >
              <span>🖨️</span> Reimprimir
            </button>
          )}
          {!notif.read && (
            <button
              onClick={() => onMarkAsRead(notif.id)}
              className={`font-bold px-2.5 py-1 rounded-xl text-xs border-none cursor-pointer transition-all ${
                isAnyCancellationRequest 
                  ? "bg-rose-100 hover:bg-rose-200 text-rose-800" 
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900"
              }`}
            >
              Leído ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notificationsList,
  setNotificationsList,
  onReprint,
  onAuthorizeCancellation,
  onRejectCancellation,
  onAuthorizeClosedAccountCancellation,
  onRejectClosedAccountCancellation,
  activeSessionOpenedAt,
  targetCancellationFolio,
}: NotificationsModalProps) {
  const [activeFilter, setActiveFilter] = React.useState<"all" | "cancellations" | "logs">("all");
  const [showHistory, setShowHistory] = React.useState<boolean>(false);
  const [deliveryLogs, setDeliveryLogs] = React.useState<NotificationDeliveryLog[]>([]);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("notification_sound_enabled") !== "false";
  });

  const loadLogs = () => {
    setDeliveryLogs(getNotificationDeliveryLogs());
  };

  React.useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, activeFilter]);

  // Auto-focus cancellations if deep link has targetCancellationFolio
  React.useEffect(() => {
    if (isOpen && targetCancellationFolio) {
      setActiveFilter("cancellations");
      setShowHistory(true);
    }
  }, [isOpen, targetCancellationFolio]);

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("notification_sound_enabled", String(enabled));
  };

  const isCancellation = (notif: NotificationItem) => {
    return (
      !!notif.isCancellationRequest ||
      !!notif.isClosedAccountCancellationRequest ||
      notif.title.toLowerCase().includes("cancel") ||
      notif.body.toLowerCase().includes("cancel")
    );
  };

  const currentOpDay = getOperatingDay(new Date());

  const isFromCurrentTurn = (notif: NotificationItem) => {
    if (!notif.createdAt) return true;
    if (activeSessionOpenedAt) {
      return new Date(notif.createdAt).getTime() >= new Date(activeSessionOpenedAt).getTime();
    }
    const notifDay = getOperatingDay(notif.createdAt);
    return notifDay === currentOpDay;
  };

  // 1. Filter by current turn or show entire history
  const baseNotifications = notificationsList.filter((n) => {
    if (showHistory || (targetCancellationFolio && n.cancellationFolio === targetCancellationFolio)) return true;
    return isFromCurrentTurn(n);
  });

  // 2. Filter by type (Todas vs Cancelaciones)
  const filteredNotifications = baseNotifications.filter((n) => {
    if (activeFilter === "cancellations") {
      return isCancellation(n);
    }
    return true;
  });

  // 3. Prioritize targeted cancellation folio at the top
  const sortedNotifications = React.useMemo(() => {
    if (!targetCancellationFolio) return filteredNotifications;
    return [...filteredNotifications].sort((a, b) => {
      if (a.cancellationFolio === targetCancellationFolio) return -1;
      if (b.cancellationFolio === targetCancellationFolio) return 1;
      return 0;
    });
  }, [filteredNotifications, targetCancellationFolio]);

  const handleMarkAllAsRead = () => {
    const updated = notificationsList.map((n) => {
      const isShown = filteredNotifications.some((fn) => fn.id === n.id);
      if (isShown) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotificationsList(updated);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notificationsList.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotificationsList(updated);
  };

  const handleEnablePush = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          alert("🎉 ¡Canal de Notificaciones de Servidor Habilitado! 🔔");
          new Notification("🔔 Canal Activo - COCINET Pro", {
            body: "Las notificaciones locales y remotas de base de datos están listas.",
            icon: "https://img.icons8.com/fluency/192/restaurant.png",
          });
        } else {
          alert("Permiso denegado o cerrado.");
        }
      });
    } else {
      alert("Las notificaciones nativas no son soportadas en este navegador.");
    }
  };

  const handleClearLogs = () => {
    if (window.confirm("¿Deseas vaciar el historial de logs de envíos?")) {
      clearNotificationDeliveryLogs();
      setDeliveryLogs([]);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{
        "--height": "650px",
        "--max-height": "95%",
        "--width": "100%",
        "--max-width": "540px",
        "--border-radius": "24px",
        "--box-shadow": "0 10px 40px rgba(0,0,0,0.15)",
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "rgb(40, 45, 52)",
            "--color": "white",
          }}
        >
          <IonTitle>🔔 Notificaciones & Auditoría</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ fontWeight: "bold" }}>
              Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        {/* Controls: Filter & Sound Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-4">
          {/* Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todas ({baseNotifications.length})
            </button>
            <button
              onClick={() => setActiveFilter("cancellations")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "cancellations"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cancelaciones ({baseNotifications.filter(isCancellation).length})
            </button>
            <button
              onClick={() => setActiveFilter("logs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "logs"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Logs Envíos 📡
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => handleToggleSound(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border shrink-0 ${
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span>{soundEnabled ? "🔊 Sonido" : "🔇 Silencio"}</span>
          </button>
        </div>

        {/* ─── VISTA 1: LOGS DE ENVÍOS AUDITORÍA ─── */}
        {activeFilter === "logs" ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950 text-xs">
              <div>
                <span className="font-extrabold block">📡 Registro de Envíos WhatsApp & Push</span>
                <span className="text-[11px] text-emerald-800">Monitorea entregas, errores y estado de mensajes en tiempo real.</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    const testFolio = "TEST-" + String(Date.now()).slice(-4);
                    const origin = window.location.origin;
                    const pathname = window.location.pathname;
                    const testUrl = `${origin}${pathname}?tenant=tenant-1&token=sistemas&req=${testFolio}`;

                    const testNotif: NotificationItem = {
                      id: `test_${Date.now()}`,
                      title: `⏳ Solicitud de Prueba #${testFolio}`,
                      body: `Prueba de circuito bidireccional.\nFolio: ${testFolio}\nMesero: Sistemas Test\nMotivo: Validación de Diagnóstico\nEscribe PIN (4020) para autorizar.`,
                      time: "Ahora mismo",
                      read: false,
                      isCancellationRequest: true,
                      cancellationFolio: testFolio,
                      tableLabel: "Mesa Prueba",
                      branchName: "Sucursal Matriz",
                      waiterName: "Sistemas Test",
                      total: 150,
                      reason: "Prueba integral de notificaciones",
                      status: "pending",
                      createdAt: new Date().toISOString(),
                      timeline: [
                        {
                          stage: "created",
                          title: "Solicitud de Prueba Generada 🧪",
                          description: `Creada en simulador para verificar WhatsApp y Push.`,
                          timestamp: new Date().toISOString(),
                          actor: "Sistemas",
                          status: "ok",
                        }
                      ]
                    };

                    setNotificationsList([testNotif, ...notificationsList]);

                    sendSilentWhatsAppMessage("9511273796", `🧪 PRUEBA DE TRAZABILIDAD COCINET\nFolio: #${testFolio}\nPrueba de circuito de cancelación.\n🔗 Abrir Enlace:\n${testUrl}`)
                      .then((res) => {
                        addNotificationDeliveryLog({
                          cancellationFolio: testFolio,
                          tenantId: "tenant-1",
                          branchName: "Sucursal Matriz",
                          recipientName: "Sistemas (Prueba)",
                          recipientRole: "sistemas",
                          recipientPhone: "9511273796",
                          channel: "whatsapp",
                          status: res.success ? "success" : "failed",
                          detail: res.success ? `WhatsApp de prueba enviado (ID: ${res.messageId || 'OK'})` : `Fallo: ${res.error}`,
                          targetUrl: testUrl,
                        });
                        loadLogs();
                      });

                    triggerDeviceNotification(`🧪 Prueba #${testFolio}`, "Toca para abrir y verificar el enlace", "/logo.png", testUrl);
                    setActiveFilter("cancellations");
                    alert(`✅ Solicitud de prueba #${testFolio} generada. Se disparó WhatsApp y Push a Sistemas.`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] border-none cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>🧪</span> Probar Circuito
                </button>
                <button
                  onClick={loadLogs}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] border-none cursor-pointer"
                  title="Actualizar logs"
                >
                  🔄
                </button>
                <button
                  onClick={handleClearLogs}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2.5 py-1 rounded-lg text-[11px] border-none cursor-pointer"
                  title="Borrar logs"
                >
                  🗑️
                </button>
              </div>
            </div>

            {deliveryLogs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold">
                No hay logs de envíos registrados todavía. Se generarán al solicitar cancelaciones o enviar alertas.
              </div>
            ) : (
              <div className="space-y-2">
                {deliveryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-slate-900">
                        <span>
                          {log.status === "success" ? "✅" : log.status === "failed" ? "❌" : "⏭️"}
                        </span>
                        <span className="uppercase tracking-tight text-[11px] text-indigo-700 font-extrabold">
                          [{log.channel}]
                        </span>
                        <span>{log.recipientName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString("es-MX") : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                      <div>🏢 <b>Sucursal:</b> {log.branchName}</div>
                      <div>📱 <b>Tel:</b> {log.recipientPhone || "Sin número"}</div>
                      {log.cancellationFolio && (
                        <div>🎫 <b>Folio:</b> #{log.cancellationFolio}</div>
                      )}
                      <div>👤 <b>Rol:</b> {log.recipientRole}</div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] font-mono border border-slate-100 text-slate-800 break-words">
                      <b>Detalle:</b> {log.detail}
                    </div>

                    {log.targetUrl && (
                      <div className="pt-1 text-[10px] text-slate-500 truncate">
                        🔗 <b>Enlace:</b> <a href={log.targetUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{log.targetUrl}</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ─── VISTA 2: LISTA DE NOTIFICACIONES Y CANCELACIONES ─── */
          <>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {showHistory ? "🕒 Historial Completo" : "📋 Turno Actual"}
                </span>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                    showHistory
                      ? "bg-amber-600 border-amber-600 text-white hover:bg-amber-700 shadow-sm"
                      : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {showHistory ? "Ver Turno Actual" : "Ver Historial Anterior"}
                </button>
              </div>
              {filteredNotifications.some((n) => !n.read) && (
                <IonButton
                  size="small"
                  fill="outline"
                  color="warning"
                  onClick={handleMarkAllAsRead}
                  style={{ "--border-radius": "10px", fontSize: "0.75rem", margin: 0 }}
                >
                  Marcar todo leído
                </IonButton>
              )}
            </div>

            <IonList
              style={{ background: "transparent", borderRadius: "16px" }}
              lines="none"
            >
              {sortedNotifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "3rem" }}>📭</div>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    No tienes notificaciones para este filtro.
                  </p>
                </div>
              ) : (
                sortedNotifications.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    onMarkAsRead={handleMarkAsRead}
                    onReprint={onReprint}
                    onAuthorizeCancellation={onAuthorizeCancellation}
                    onRejectCancellation={onRejectCancellation}
                    onAuthorizeClosedAccountCancellation={onAuthorizeClosedAccountCancellation}
                    onRejectClosedAccountCancellation={onRejectClosedAccountCancellation}
                    isTarget={!!(targetCancellationFolio && notif.cancellationFolio === targetCancellationFolio)}
                  />
                ))
              )}
            </IonList>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <IonButton
                expand="block"
                color="warning"
                style={{
                  height: "48px",
                  "--border-radius": "12px",
                  fontWeight: "bold",
                }}
                onClick={handleEnablePush}
              >
                <IonIcon icon={notificationsOutline} slot="start" />
                Habilitar Notificaciones Push 🗣️
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonModal>
  );
}
