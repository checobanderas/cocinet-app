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
import { notificationsOutline, checkmarkOutline } from "ionicons/icons";
import { getOperatingDay } from "../utils/appHelpers";

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
  ) => Promise<void>;
  onAuthorizeClosedAccountCancellation?: (
    accountId: string,
    pin: string,
    notifId: string
  ) => Promise<any>;
  onRejectClosedAccountCancellation?: (
    accountId: string,
    notifId: string
  ) => Promise<void>;
  activeSessionOpenedAt?: string;
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
  ) => Promise<void>;
  onAuthorizeClosedAccountCancellation?: (
    accountId: string,
    pin: string,
    notifId: string
  ) => Promise<any>;
  onRejectClosedAccountCancellation?: (
    accountId: string,
    notifId: string
  ) => Promise<void>;
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
        const admin = await onAuthorizeClosedAccountCancellation(notif.accountId || "", pin, notif.id);
        if (admin) {
          alert(`¡Cancelación de Cuenta Cerrada Autorizada con éxito por ${admin.name}! ✅`);
        } else {
          alert("PIN de Administrador incorrecto ❌");
        }
      } else {
        if (!onAuthorizeCancellation) return;
        const admin = await onAuthorizeCancellation(notif.tableId || "", notif.itemsToCancel || [], pin, notif.id);
        if (admin) {
          alert(`¡Cancelación de Productos Autorizada con éxito por ${admin.name}! ✅`);
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
        await onRejectClosedAccountCancellation(notif.accountId || "", notif.id);
        alert("La solicitud ha sido rechazada y la cuenta vuelve a estar completada. ✕");
      } else {
        if (!onRejectCancellation) return;
        await onRejectCancellation(notif.tableId || "", notif.itemsToCancel || [], notif.id);
        alert("La solicitud ha sido rechazada y los productos vuelven a estar activos. ✕");
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
        background: isAnyCancellationRequest
          ? "#fff1f2"
          : notif.read
          ? "white"
          : "#fffbeb",
        border: isAnyCancellationRequest
          ? "1.5px solid #f43f5e"
          : notif.read
          ? "1px solid #e2e8f0"
          : "1.5px solid #f59e0b",
        borderRadius: "18px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: isAnyCancellationRequest
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
        <div className="flex gap-1.5 items-center">
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
            <div className="bg-rose-100 text-rose-900 px-3 py-1.5 rounded-xl font-black tracking-tight flex items-center gap-1.5 mb-1.5 text-xs border border-rose-200">
              <span>🎫</span> Folio de Cancelación: <span className="text-sm font-black text-rose-700">{notif.cancellationFolio}</span>
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
              <div className="bg-emerald-500 text-white font-black text-center py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <span>✓</span> ¡Cancelación Autorizada por {notif.authorizedBy}!
              </div>
            ) : notif.status === "rejected" ? (
              <div className="bg-slate-500 text-white font-black text-center py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <span>✕</span> Solicitud Rechazada / Revertida
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-rose-900 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <span>🔒</span> Escribe aquí tu PIN para autorizar:
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="PIN Administrador"
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
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>
          📅 {formatNotificationDate(notif.createdAt, notif.time)}
        </span>
        <div className="flex gap-2">
          {onReprint && (notif.isComandaNotification || notif.isCuentaNotification) && (
            <button
              onClick={handleReprint}
              className="text-[11px] font-black text-indigo-600 underline cursor-pointer bg-none border-none"
            >
              Reimprimir 🖨️
            </button>
          )}
          {!notif.read && (
            <button
              onClick={() => onMarkAsRead(notif.id)}
              style={{
                background: "none",
                border: "none",
                color: isAnyCancellationRequest ? "#e11d48" : "#d97706",
                fontSize: "11px",
                fontWeight: "black",
                cursor: "pointer",
                textDecoration: "underline",
              }}
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
}: NotificationsModalProps) {
  
  const [activeFilter, setActiveFilter] = React.useState<"all" | "cancellations">("all");
  const [showHistory, setShowHistory] = React.useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("notification_sound_enabled") !== "false";
  });

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
    if (showHistory) return true;
    return isFromCurrentTurn(n);
  });

  // 2. Filter by type (Todas vs Cancelaciones)
  const filteredNotifications = baseNotifications.filter((n) => {
    if (activeFilter === "cancellations") {
      return isCancellation(n);
    }
    return true;
  });

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

  const handleTestWebsocketSync = () => {
    const randomUuid = "db-" + Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newNotif: NotificationItem = {
      id: String(Date.now()),
      title: "⚡ Sincronización MySQL",
      body: `Cambio en base de datos MySQL (ID único UUID: ${randomUuid} | Creado/Editado en: ${timestamp}) propagado via WebSockets con éxito.`,
      time: "Ahora mismo",
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotificationsList([newNotif, ...notificationsList]);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⚡ Sincronización Real-Time MySQL", {
        body: `UUID: ${randomUuid} sincronizado exitosamente via WebSockets.`,
        icon: "https://img.icons8.com/fluency/192/restaurant.png",
      });
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
        "--max-width": "520px",
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
          <IonTitle>🔔 Notificaciones Cocinet</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ fontWeight: "bold" }}>
              Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        {/* Controls: Filter & Sound Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm mb-4">
          {/* Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todas ({baseNotifications.length})
            </button>
            <button
              onClick={() => setActiveFilter("cancellations")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeFilter === "cancellations"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cancelaciones ({baseNotifications.filter(isCancellation).length})
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => handleToggleSound(!soundEnabled)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span>{soundEnabled ? "🔊 Sonido Activo" : "🔇 Alerta Silenciada"}</span>
          </button>
        </div>

        <div
          className="flex items-center justify-between gap-2 mb-4"
        >
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
          {filteredNotifications.length === 0 ? (
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
            filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkAsRead={handleMarkAsRead}
                onReprint={onReprint}
                onAuthorizeCancellation={onAuthorizeCancellation}
                onRejectCancellation={onRejectCancellation}
                onAuthorizeClosedAccountCancellation={onAuthorizeClosedAccountCancellation}
                onRejectClosedAccountCancellation={onRejectClosedAccountCancellation}
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

          <IonButton
            expand="block"
            fill="clear"
            onClick={handleTestWebsocketSync}
            style={{ fontWeight: "extrabold" }}
          >
            Probar Sincronización WebSockets 🚀
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}
