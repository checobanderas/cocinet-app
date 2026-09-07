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

  // 1. Localizar notificación en memoria o consultar Firebase directamente
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

      if (inMemory) {
        if (isMounted) {
          setLiveNotif(inMemory);
          setIsLoading(false);
        }
      }

      // Consultar en vivo en Firestore para tener el estado más fresco
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
    if (pin.length < 6) {
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
    if (!pin) {
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

  const branchDisplay = notif?.branchName || selectedTenant?.name || "Cocinet";

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-slate-100 flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-6 font-sans">
      {/* Barra superior de encabezado seguro */}
      <div className="w-full max-w-lg flex items-center justify-between py-2 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black shadow-md shadow-rose-600/30">
            🛡️
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide uppercase">Cocinet Seguro</h1>
            <p className="text-[11px] text-slate-400 font-medium">Portal de Autorizaciones</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5"
        >
          <span>🔒</span>
          <span>Salir</span>
        </button>
      </div>

      {/* Tarjeta principal */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/60 relative">
        {/* Badge de Sucursal y Folio */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>📍</span>
            <span className="truncate max-w-[200px]">{branchDisplay}</span>
          </div>

          <div className="bg-rose-950/80 border border-rose-700/60 text-rose-300 font-black px-3 py-1 rounded-full text-xs tracking-wider">
            Folio #{notif?.cancellationFolio || folio}
          </div>
        </div>

        {/* Estado de Carga */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold">Localizando datos de la cancelación...</p>
          </div>
        ) : !notif ? (
          <div className="py-8 text-center space-y-3">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-base font-bold text-slate-200">Cancelación no encontrada</h2>
            <p className="text-xs text-slate-400">
              No se localizó la solicitud con folio <span className="font-mono text-rose-400">#{folio}</span>. Es posible que ya haya sido eliminada o que el folio sea incorrecto.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar y Salir
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Banner si ya fue procesada */}
            {isProcessed && (
              <div
                className={`p-4 rounded-2xl border text-center space-y-1.5 ${
                  notif.status === "approved"
                    ? "bg-emerald-950/60 border-emerald-600/50 text-emerald-200"
                    : "bg-rose-950/60 border-rose-600/50 text-rose-200"
                }`}
              >
                <div className="text-2xl">{notif.status === "approved" ? "✅" : "❌"}</div>
                <h3 className="font-black text-sm uppercase tracking-wide">
                  {notif.status === "approved" ? "Cancelación Autorizada" : "Cancelación Rechazada"}
                </h3>
                {notif.authorizedBy && (
                  <p className="text-xs text-slate-300">
                    Atendida por: <strong className="text-white font-bold">{notif.authorizedBy}</strong>
                  </p>
                )}
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-600 transition-all cursor-pointer"
                  >
                    🔒 Salir del Sistema
                  </button>
                </div>
              </div>
            )}

            {/* Resumen del Contenido a Cancelar */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{isClosedAccount ? "💳 Cuenta Cerrada" : "🍽️ Mesa / Comanda"}</span>
                <span className="font-bold text-slate-200">
                  {notif.tableLabel || (notif.tableId ? `Mesa ${notif.tableId}` : "Caja")}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>👤 Solicitó:</span>
                <span className="font-bold text-slate-200">{notif.waiterName || "Cajero / Mesero"}</span>
              </div>

              {notif.reason && (
                <div className="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl text-xs text-amber-200">
                  <span className="font-bold text-amber-300">Motivo: </span>
                  {notif.reason}
                </div>
              )}

              {/* Lista de productos si es por ítem */}
              {Array.isArray(notif.itemsToCancel) && notif.itemsToCancel.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Productos solicitados:</span>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1 text-xs">
                    {notif.itemsToCancel.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-slate-200 py-0.5 border-b border-slate-800/50 last:border-0">
                        <span className="font-medium">
                          <strong className="text-rose-400 font-black mr-1.5">
                            {item.quantity || 1}x
                          </strong>
                          {item.name || item.productId || "Producto"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Plato #{item.plate || 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {typeof notif.total === "number" && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Total Solicitado:</span>
                  <span className="text-lg font-black text-emerald-400">${notif.total.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Mensajes de Estado / Error */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center border ${
                  statusMessage.type === "success"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                    : statusMessage.type === "error"
                    ? "bg-rose-950/80 border-rose-500 text-rose-300"
                    : "bg-blue-950/80 border-blue-500 text-blue-300"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Teclado PIN interactivo si está pendiente */}
            {!isProcessed && (
              <div className="space-y-3 pt-1">
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-bold mb-2">Ingresa tu PIN de Dueño / Administrador:</p>
                  {/* Puntos del PIN */}
                  <div className="flex justify-center gap-3 py-1">
                    {[0, 1, 2, 3].map((idx) => {
                      const hasVal = pin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                            hasVal
                              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 scale-105 border border-rose-400"
                              : "bg-slate-800 border border-slate-700 text-slate-500"
                          }`}
                        >
                          {hasVal ? "●" : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Teclado numérico */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeyPress(num)}
                      className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-black h-12 rounded-xl text-lg shadow-sm border border-slate-700 cursor-pointer transition-all flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-rose-400 font-bold h-12 rounded-xl text-xs border border-slate-800 cursor-pointer transition-all flex items-center justify-center"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyPress("0")}
                    className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-black h-12 rounded-xl text-lg shadow-sm border border-slate-700 cursor-pointer transition-all flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-400 font-bold h-12 rounded-xl text-xs border border-slate-800 cursor-pointer transition-all flex items-center justify-center"
                  >
                    Borrar ⌫
                  </button>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting || pin.length < 4}
                    onClick={handleAuthorize}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? "Autorizando..." : "✅ Autorizar Cancelación"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleReject}
                    className="w-full py-3.5 bg-slate-800 hover:bg-rose-950/80 hover:border-rose-700 text-slate-300 hover:text-rose-200 border border-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>✕ Rechazar Solicitud</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pie de página */}
      <div className="mt-6 text-center text-slate-500 text-xs">
        <p>Cocinet Cloud POS &bull; Control y Auditoría de Operaciones</p>
      </div>
    </div>
  );
};
