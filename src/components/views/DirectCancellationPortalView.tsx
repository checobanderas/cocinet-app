import React, { useState, useEffect } from "react";
import { getNotificationFromFirebase } from "../../utils/firestore";

interface DirectCancellationPortalViewProps {
  folio: string;
  selectedTenant?: any;
  notificationsList: any[];
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
  onClose: () => void;
}

const formatNotificationDate = (createdAt?: string) => {
  if (!createdAt) return "Hace un momento";
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return "Hace un momento";
    const day = d.getDate();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const month = months[d.getMonth()];
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return "Hace un momento";
  }
};

export const DirectCancellationPortalView: React.FC<DirectCancellationPortalViewProps> = ({
  folio,
  selectedTenant,
  notificationsList,
  onAuthorizeCancellation,
  onRejectCancellation,
  onAuthorizeClosedAccountCancellation,
  onRejectClosedAccountCancellation,
  onClose,
}) => {
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [liveNotif, setLiveNotif] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  // 1. Cargar notificación desde memoria o Firebase
  useEffect(() => {
    let isMounted = true;

    const findNotification = async () => {
      setIsLoading(true);
      const cleanFolio = folio.trim().toLowerCase();

      // Primero buscar en memoria
      const inMemory = notificationsList.find((n) => {
        const nFolio = (n.cancellationFolio || "").trim().toLowerCase();
        const nId = (n.id || "").trim().toLowerCase();
        return nFolio === cleanFolio || nId === cleanFolio;
      });

      if (inMemory && isMounted) {
        setLiveNotif(inMemory);
        setIsLoading(false);
      }

      // Consultar Firestore en tiempo real para obtener datos más frescos
      try {
        const liveDoc = await getNotificationFromFirebase(folio);
        if (isMounted && liveDoc) {
          setLiveNotif(liveDoc);
        }
      } catch (err) {
        console.warn("No se pudo cargar la notificación remota:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    findNotification();
    return () => {
      isMounted = false;
    };
  }, [folio, notificationsList]);

  const notif = liveNotif;
  const isClosedAccount = notif?.isClosedAccountCancellationRequest;
  const isProcessed = notif?.status === "approved" || notif?.status === "rejected";

  const handleKeyPress = (digit: string) => {
    if (isProcessed || isSubmitting) return;
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setStatusMessage(null);
    }
  };

  const handleBackspace = () => {
    if (isProcessed || isSubmitting) return;
    setPin((prev) => prev.slice(0, -1));
    setStatusMessage(null);
  };

  const handleClear = () => {
    if (isProcessed || isSubmitting) return;
    setPin("");
    setStatusMessage(null);
  };

  const handleAuthorize = async () => {
    if (!pin || pin.length < 4) {
      setStatusMessage({ type: "error", text: "Introduce tu PIN de 4 dígitos para autorizar." });
      return;
    }
    if (!notif) {
      setStatusMessage({ type: "error", text: "No se encontró el registro de la cancelación." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (isClosedAccount) {
        if (!onAuthorizeClosedAccountCancellation) return;
        const res = await onAuthorizeClosedAccountCancellation(notif.accountId || "", pin, notif.id);
        if (res?.alreadyProcessed) {
          setStatusMessage({
            type: "info",
            text: `ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || "otro administrador"}.`,
          });
          setLiveNotif((prev: any) => ({ ...prev, status: "approved", authorizedBy: res.authorizedBy }));
        } else if (res) {
          setStatusMessage({
            type: "success",
            text: `✅ ¡Cancelación de Cuenta Autorizada con éxito por ${res.name || "Administrador"}!`,
          });
          setLiveNotif((prev: any) => ({ ...prev, status: "approved", authorizedBy: res.name }));
        } else {
          setStatusMessage({ type: "error", text: "❌ PIN Incorrecto. Verifica e intenta de nuevo." });
        }
      } else {
        if (!onAuthorizeCancellation) return;
        const res = await onAuthorizeCancellation(
          notif.tableId || "",
          notif.itemsToCancel || [],
          pin,
          notif.id
        );
        if (res?.alreadyProcessed) {
          setStatusMessage({
            type: "info",
            text: `ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || "otro administrador"}.`,
          });
          setLiveNotif((prev: any) => ({ ...prev, status: "approved", authorizedBy: res.authorizedBy }));
        } else if (res) {
          setStatusMessage({
            type: "success",
            text: `✅ ¡Cancelación Autorizada con éxito por ${res.name || "Administrador"}!`,
          });
          setLiveNotif((prev: any) => ({ ...prev, status: "approved", authorizedBy: res.name }));
        } else {
          setStatusMessage({ type: "error", text: "❌ PIN Incorrecto. Verifica e intenta de nuevo." });
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Error al autorizar: ${err.message || String(err)}` });
    } finally {
      setIsSubmitting(false);
      setPin("");
    }
  };

  const handleReject = async () => {
    if (!window.confirm("¿Estás seguro de que deseas RECHAZAR esta solicitud de cancelación?")) {
      return;
    }
    if (!notif) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (isClosedAccount) {
        if (!onRejectClosedAccountCancellation) return;
        const res = await onRejectClosedAccountCancellation(notif.accountId || "", notif.id);
        if (res?.alreadyProcessed) {
          setStatusMessage({
            type: "info",
            text: `ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || "otro administrador"}.`,
          });
        } else {
          setStatusMessage({
            type: "info",
            text: "✕ Solicitud rechazada. La cuenta permanece completada.",
          });
          setLiveNotif((prev: any) => ({ ...prev, status: "rejected" }));
        }
      } else {
        if (!onRejectCancellation) return;
        const res = await onRejectCancellation(
          notif.tableId || "",
          notif.itemsToCancel || [],
          notif.id
        );
        if (res?.alreadyProcessed) {
          setStatusMessage({
            type: "info",
            text: `ℹ️ Esta solicitud ya fue atendida por ${res.authorizedBy || "otro administrador"}.`,
          });
        } else {
          setStatusMessage({
            type: "info",
            text: "✕ Solicitud rechazada. Los productos vuelven a estar activos.",
          });
          setLiveNotif((prev: any) => ({ ...prev, status: "rejected" }));
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Error al rechazar: ${err.message || String(err)}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Enlace automático con el Teclado Físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "textarea" || tag === "select" || target?.isContentEditable) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Delete" || e.key === "Escape" || e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (pin.length >= 4) {
          handleAuthorize();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pin, isProcessed, isSubmitting, notif]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-100 bg-gradient-to-br from-slate-50 via-rose-50/30 to-indigo-50/40 text-slate-800 flex flex-col items-center justify-start p-3 sm:p-6 pb-24 font-sans overflow-y-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Barra Superior */}
      <div className="w-full max-w-lg flex items-center justify-between py-2 border-b border-slate-200/80 mb-3 sm:mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black shadow-md shadow-rose-500/20 text-lg">
            🔔
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight">Cocinet POS</h1>
            <p className="text-[11px] text-slate-500 font-semibold">Autorización de Solicitudes</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>✕</span>
          <span>Cerrar</span>
        </button>
      </div>

      {/* Tarjeta idéntica a NotificationCard */}
      <div className="w-full max-w-lg">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="inline-block w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-600">Cargando datos de la cancelación...</p>
          </div>
        ) : !notif ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-base font-black text-slate-800">Cancelación no encontrada</h2>
            <p className="text-xs text-slate-500">
              No se localizó la solicitud con folio <span className="font-mono text-rose-600 font-bold">#{folio}</span>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar y Salir
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "#fff1f2",
              border: "2px solid #e11d48",
              borderRadius: "24px",
              padding: "18px sm:22px",
              boxShadow: "0 0 0 4px rgba(225, 29, 72, 0.15), 0 10px 30px rgba(225, 29, 72, 0.12)",
              transition: "all 0.2s ease",
            }}
            className="font-sans text-slate-800"
          >
            {/* Cabecera de la Tarjeta */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: "900", color: "#be123c" }}>
                {notif.title || `🚨 Solicitud de Cancelación #${notif.cancellationFolio || folio}`}
              </h4>
              <div className="flex gap-1.5 items-center flex-wrap justify-end">
                <span className="bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse uppercase tracking-tight shadow-xs">
                  🎯 ENLACE DIRECTO
                </span>
                <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                  REQUERIDO
                </span>
              </div>
            </div>

            {/* Texto del cuerpo */}
            {notif.body && (
              <p style={{ margin: "6px 0 10px 0", fontSize: "0.85rem", color: "#334155", lineHeight: "1.45", whiteSpace: "pre-line" }}>
                {notif.body}
              </p>
            )}

            {/* Metadatos y Folio */}
            <div className="mt-3 p-4 bg-white/95 border border-rose-200 rounded-2xl space-y-3 text-sm shadow-xs">
              {notif.cancellationFolio && (
                <div className="bg-rose-100/90 text-rose-950 px-3.5 py-2 rounded-xl font-black tracking-tight flex items-center justify-between text-xs sm:text-sm border border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎫</span> Folio: <span className="text-base font-black text-rose-700">#{notif.cancellationFolio}</span>
                  </div>
                  {notif.escalatedToSystems && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      ⚡ Escalado a Sistemas
                    </span>
                  )}
                </div>
              )}

              {/* Bloque de Sucursal, Mesa, Solicitó y Monto en tarjetas visuales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-base">
                    🏢
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sucursal</p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {notif.branchName || selectedTenant?.name || "Cocinet"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-base">
                    📍
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mesa / Cuenta</p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {notif.tableLabel || (notif.tableId ? `Mesa ${notif.tableId}` : "Caja")}
                    </p>
                  </div>
                </div>

                <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 font-bold text-base">
                    👤
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Solicitó Cancelación</p>
                    <p className="text-sm font-black text-rose-900 truncate">
                      {notif.waiterName || "Cajero / Mesero"}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-base">
                    💰
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Monto a Cancelar</p>
                    <p className="text-base font-black text-emerald-900">
                      ${typeof notif.total === 'number' ? notif.total.toFixed(2) : notif.total || "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla Detallada de Productos a Cancelar */}
              {Array.isArray(notif.itemsToCancel) && notif.itemsToCancel.length > 0 && (
                <div className="border-t border-rose-200/80 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>📦</span> Productos Solicitados para Cancelación:
                    </span>
                    <span className="bg-rose-100 text-rose-800 font-black text-[11px] px-2.5 py-0.5 rounded-full">
                      {notif.itemsToCancel.length} {notif.itemsToCancel.length === 1 ? "ítem" : "ítems"}
                    </span>
                  </div>

                  <div className="overflow-hidden border border-rose-200 rounded-xl bg-white shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-rose-50/90 text-rose-900 font-bold border-b border-rose-200 text-[11px] uppercase tracking-wider">
                          <th className="py-2 px-2.5 text-center w-8">#</th>
                          <th className="py-2 px-2.5">Producto / Concepto</th>
                          <th className="py-2 px-2.5 text-center w-14">Cant.</th>
                          <th className="py-2 px-2.5 text-right w-20">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {notif.itemsToCancel.map((it: any, idx: number) => (
                          <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                            <td className="py-2 px-2.5 text-center font-bold text-slate-400 text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2.5 font-extrabold text-slate-900 text-xs sm:text-sm">
                              {it.name || it.productId}
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="inline-block bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-md text-xs">
                                x{it.quantity || 1}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right text-[11px] text-slate-500 font-medium">
                              {it.folio !== undefined ? `Plato #${it.plate || 1}` : "Directo"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {notif.reason && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs sm:text-sm">
                  <span className="text-amber-700 font-bold text-base leading-none">📝</span>
                  <div>
                    <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">Motivo de Cancelación:</span>
                    <span className="font-extrabold text-amber-950 mt-0.5 block">{notif.reason}</span>
                  </div>
                </div>
              )}

              {/* Estado de Autorización */}
              <div className="border-t border-rose-200/80 pt-3">
                {notif.status === "approved" ? (
                  <div className="bg-emerald-600 text-white font-black text-center py-3 px-4 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 shadow-sm">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>✓</span> <span>¡Cancelación Autorizada!</span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-100">
                      Atendida por <strong className="text-white font-bold">{notif.authorizedBy || "Administrador"}</strong>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white text-emerald-900 rounded-xl text-xs font-black shadow-xs hover:bg-emerald-50 transition-all cursor-pointer"
                      >
                        🔒 Salir del Sistema
                      </button>
                    </div>
                  </div>
                ) : notif.status === "rejected" ? (
                  <div className="bg-slate-700 text-white font-black text-center py-3 px-4 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 shadow-sm">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>✕</span> <span>Solicitud Rechazada / Revertida</span>
                    </div>
                    {notif.authorizedBy && (
                      <div className="text-[11px] font-medium text-slate-200">
                        Atendida por <strong className="text-white font-bold">{notif.authorizedBy}</strong>
                      </div>
                    )}
                    <div className="pt-2">
                      <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-black shadow-xs hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        🔒 Salir del Sistema
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="text-rose-900 font-black text-sm uppercase tracking-wide flex items-center justify-between border-b border-rose-200/80 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">🔒</span>
                        <span>Escribe aquí tu PIN para autorizar:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold lowercase">o teclea en físico</span>
                    </div>

                    {/* Puntos visuales del PIN */}
                    <div className="flex justify-center gap-2.5 py-1">
                      {[0, 1, 2, 3].map((idx) => {
                        const hasVal = pin.length > idx;
                        return (
                          <div
                            key={idx}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                              hasVal
                                ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 scale-105 border-2 border-rose-500"
                                : "bg-white border-2 border-rose-200 text-slate-400"
                            }`}
                          >
                            {hasVal ? "●" : ""}
                          </div>
                        );
                      })}
                    </div>

                    {/* Teclado numérico táctil interactivo */}
                    <div className="bg-slate-100/90 p-2.5 rounded-2xl border border-rose-200/80 grid grid-cols-3 gap-1.5">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleKeyPress(num)}
                          className="bg-white hover:bg-rose-50 active:scale-95 text-slate-800 font-black h-11 rounded-xl text-base shadow-xs border border-slate-200/80 cursor-pointer transition-all flex items-center justify-center"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleClear}
                        className="bg-red-50 hover:bg-red-100 active:scale-95 text-rose-700 font-bold h-11 rounded-xl text-xs border border-red-200 cursor-pointer transition-all flex items-center justify-center"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeyPress("0")}
                        className="bg-white hover:bg-rose-50 active:scale-95 text-slate-800 font-black h-11 rounded-xl text-base shadow-xs border border-slate-200/80 cursor-pointer transition-all flex items-center justify-center"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold h-11 rounded-xl text-xs border border-slate-300 cursor-pointer transition-all flex items-center justify-center"
                      >
                        Borrar ⌫
                      </button>
                    </div>

                    {/* Mensaje de error o éxito */}
                    {statusMessage && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border ${
                          statusMessage.type === "success"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : statusMessage.type === "error"
                            ? "bg-rose-100 border-rose-300 text-rose-900"
                            : "bg-blue-50 border-blue-300 text-blue-900"
                        }`}
                      >
                        {statusMessage.text}
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleAuthorize}
                        disabled={isSubmitting || pin.length < 4}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-3 px-3 rounded-2xl transition-all shadow-md shadow-rose-600/30 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{isSubmitting ? "Autorizando..." : "Autorizar Cancelación ✓"}</span>
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isSubmitting}
                        className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold py-3 px-3.5 rounded-2xl transition-all text-xs cursor-pointer"
                      >
                        Rechazar ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección de Trazabilidad */}
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
                      <span>⏳</span> En línea
                    </span>
                  )}
                </div>

                {showTimeline && (
                  <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-2xl space-y-2 text-[11px] shadow-inner">
                    <div className="font-black text-amber-400 border-b border-slate-700 pb-1 flex items-center justify-between">
                      <span>Línea de Vida de la Solicitud (#{notif.cancellationFolio || notif.id})</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Auditoría en Vivo</span>
                    </div>

                    <div className="space-y-2 relative pl-2 border-l-2 border-slate-700">
                      <div className="relative pl-3">
                        <span className="absolute -left-[11px] top-0.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                        <div className="font-bold text-slate-200">1. Solicitud Registrada</div>
                        <div className="text-[10px] text-slate-400">
                          Por: <b>{notif.waiterName || 'Mesero/Cajero'}</b> • {formatNotificationDate(notif.createdAt)}
                        </div>
                      </div>

                      <div className="relative pl-3">
                        <span className="absolute -left-[11px] top-0.5 w-2 h-2 rounded-full bg-indigo-500"></span>
                        <div className="font-bold text-slate-200">2. Notificaciones Despachadas</div>
                        <div className="text-[10px] text-slate-400">
                          WhatsApp enviado a administradores de sucursal con enlace directo de autorización.
                        </div>
                      </div>

                      <div className="relative pl-3">
                        <span className="absolute -left-[11px] top-0.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                        <div className="font-bold text-slate-200">
                          3. Acceso al Portal: ✅ Abierto en navegador
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-slate-400 text-xs font-medium">
        <p>Cocinet Cloud POS &bull; Sistema de Gestión de Sucursales</p>
      </div>
    </div>
  );
};
