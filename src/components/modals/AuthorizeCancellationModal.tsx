import React, { useState, useEffect } from 'react';
import { IonModal, IonIcon } from '@ionic/react';
import { closeOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import {
  finalizeComandaItemsCancellationInFirebase,
  updateNotificationInFirebase,
  recordCancellationTimelineEvent
} from '../../utils/firestore';
import { getSimplifiedDeviceInfo } from '../../utils/appHelpers';

interface AuthorizeCancellationModalProps {
  showAuthorizeCancellationModal: boolean;
  setShowAuthorizeCancellationModal: (v: boolean) => void;
  authorizationPin: string;
  setAuthorizationPin: (v: string) => void;
  pendingCancellationTarget: any;
  setPendingCancellationTarget: (v: any) => void;
  selectedTable: any;
  handleAuthorizeAccountCancellation: any;
  renderCancellationPinPad: any;
  triggerAppNotification: any;
  validateAdminPin: any;
  selectedTenant?: any;
  notificationsList?: any[];
  setNotificationsList?: any;
  users?: any[];
  currentUser?: any;
  notifyAdminsCancellationResolved?: any;
  authorizePasswordValue?: any;
  setAuthorizePasswordValue?: (v: any) => void;
  account?: any;
  item?: any;
}

export const AuthorizeCancellationModal: React.FC<AuthorizeCancellationModalProps> = ({
  showAuthorizeCancellationModal,
  setShowAuthorizeCancellationModal,
  authorizationPin,
  setAuthorizationPin,
  pendingCancellationTarget,
  setPendingCancellationTarget,
  selectedTable,
  handleAuthorizeAccountCancellation,
  renderCancellationPinPad,
  triggerAppNotification,
  validateAdminPin,
  selectedTenant,
  notificationsList = [],
  setNotificationsList,
  users = [],
  currentUser,
  notifyAdminsCancellationResolved
}) => {
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Live timer tick every 5 seconds while modal is open
  useEffect(() => {
    if (!showAuthorizeCancellationModal) return;
    setNowTime(Date.now());
    const interval = setInterval(() => setNowTime(Date.now()), 5000);
    return () => clearInterval(interval);
  }, [showAuthorizeCancellationModal]);

  // Find matching pending notification for target
  const matchingNotif = notificationsList.find((n) => {
    if (n.status !== 'pending') return false;
    if (pendingCancellationTarget?.type === 'account') {
      return n.isClosedAccountCancellationRequest && n.accountId === pendingCancellationTarget.id;
    } else {
      return !n.isClosedAccountCancellationRequest && n.tableId === pendingCancellationTarget?.id;
    }
  });

  const createdTimestamp = matchingNotif?.createdAt
    ? new Date(matchingNotif.createdAt).getTime()
    : matchingNotif?.timestamp
    ? new Date(matchingNotif.timestamp).getTime()
    : null;

  const elapsedMinutes = createdTimestamp ? Math.max(0, Math.floor((nowTime - createdTimestamp) / 60000)) : 0;
  const timeoutLimit = Number(selectedTenant?.cancellationTimeoutMinutes) || 7;
  const isTimedOut = createdTimestamp !== null ? elapsedMinutes >= timeoutLimit : false;
  const remainingMinutes = Math.max(1, timeoutLimit - elapsedMinutes);

  return (
    <IonModal
      isOpen={showAuthorizeCancellationModal}
      onDidDismiss={() => {
        setShowAuthorizeCancellationModal(false);
        setAuthorizationPin('');
        setPendingCancellationTarget(null);
      }}
      style={{
        '--height': 'auto',
        '--max-height': '92vh',
        '--width': '420px',
        '--border-radius': '28px',
      }}
    >
      <div className="flex flex-col h-full bg-slate-900 text-white overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h3 className="text-sm font-black text-rose-400 tracking-tight uppercase m-0 flex items-center gap-1.5">
              <span>🔒</span> Autorización de Cancelación
            </h3>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">
              {isTimedOut
                ? 'Introduce tu PIN de Administrador o Cajero'
                : 'Introduce tu PIN de Administrador'}
            </p>
          </div>
          <button
            onClick={() => setShowAuthorizeCancellationModal(false)}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full border-none cursor-pointer text-white transition-all"
          >
            <IonIcon icon={closeOutline} className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-center items-center space-y-4">
          {/* Target Description */}
          <div className="w-full text-center">
            <p className="text-xs font-black text-slate-300 uppercase tracking-wide mb-1">
              {pendingCancellationTarget?.type === 'account'
                ? '📄 Cancelación de Cuenta Cerrada'
                : '🍽️ Cancelación de Productos'}
            </p>
            {matchingNotif?.cancellationFolio && (
              <span className="inline-block bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                Folio: #{matchingNotif.cancellationFolio}
              </span>
            )}
          </div>

          {/* Timeout Banner / Status */}
          <div className="w-full">
            {isTimedOut ? (
              <div className="bg-gradient-to-r from-amber-950/90 to-amber-900/80 border-2 border-amber-500/60 rounded-2xl p-3.5 text-left space-y-1 shadow-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-300 font-black text-[11px] uppercase tracking-wide">
                    <span>⏱️</span> Tiempo de Espera Agotado ({elapsedMinutes} min)
                  </span>
                  <span className="bg-amber-400 text-amber-950 text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase">
                    Desbloqueo Local
                  </span>
                </div>
                <p className="text-[10.5px] text-amber-100 font-medium leading-relaxed m-0">
                  Por el momento ningún administrativo o gerente pudo atender la solicitud en los últimos {timeoutLimit} min. Puedes autorizarla con tu <strong>PIN de Cajero de 4 dígitos</strong>.
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 px-3 flex items-center justify-between text-left">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase block">
                    Espera de Respuesta
                  </span>
                  <span className="text-[11.5px] font-black text-slate-200 flex items-center gap-1">
                    <IonIcon icon={timeOutline} className="text-indigo-400" />
                    Solicitado hace {elapsedMinutes < 1 ? 'menos de 1' : elapsedMinutes} min
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase block">
                    Desbloqueo Cajero
                  </span>
                  <span className="text-[11px] font-black text-amber-400">
                    en ~{remainingMinutes} min
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PIN Display */}
          <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 w-full text-center">
            <span className="text-2xl font-black tracking-[0.8em] ml-[0.8em] text-indigo-400">
              {'•'.repeat(authorizationPin.length) || '----'}
            </span>
          </div>

          {/* PIN Pad */}
          <div className="w-full flex justify-center pb-2">
            {renderCancellationPinPad(
              authorizationPin,
              setAuthorizationPin,
              async (pin: string) => {
                const effectiveTenantId = selectedTenant?.id || '';
                const admin = validateAdminPin(pin, effectiveTenantId);

                // Check Admin authorization first
                if (admin) {
                  const authorizerUser = { ...admin };
                  if (pendingCancellationTarget?.type === 'account') {
                    await handleAuthorizeAccountCancellation(pendingCancellationTarget.id, authorizerUser);
                  } else if (
                    pendingCancellationTarget?.type === 'item' ||
                    pendingCancellationTarget?.type === 'bulk'
                  ) {
                    await finalizeComandaItemsCancellationInFirebase(
                      pendingCancellationTarget.id,
                      selectedTable || {},
                      pendingCancellationTarget.items || [],
                      authorizerUser
                    );
                    if (matchingNotif) {
                      await updateNotificationInFirebase(matchingNotif.id, {
                        status: 'approved',
                        authorizedBy: authorizerUser.name,
                        authorizedAt: new Date().toISOString(),
                      });
                      recordCancellationTimelineEvent(matchingNotif.id, {
                        stage: 'resolved',
                        title: 'Cancelación Autorizada en Terminal ✅',
                        description: `Autorizada por ${authorizerUser.name} (${authorizerUser.role}).`,
                        actor: authorizerUser.name,
                        deviceInfo: getSimplifiedDeviceInfo(),
                        status: 'ok',
                      });
                      if (setNotificationsList) {
                        setNotificationsList((prev: any[]) =>
                          prev.map((n) =>
                            n.id === matchingNotif.id
                              ? { ...n, status: 'approved', authorizedBy: authorizerUser.name }
                              : n
                          )
                        );
                      }
                      if (notifyAdminsCancellationResolved && matchingNotif.cancellationFolio) {
                        notifyAdminsCancellationResolved(
                          matchingNotif.tenantId || effectiveTenantId || 'tenant-1',
                          matchingNotif.branchName || selectedTenant?.name || 'Cocinet',
                          matchingNotif.cancellationFolio,
                          true,
                          authorizerUser.name
                        );
                      }
                    }
                    triggerAppNotification('Cancelación exitosa', 'Productos cancelados definitivamente ✅', 'success');
                  }
                  setShowAuthorizeCancellationModal(false);
                  setAuthorizationPin('');
                  setPendingCancellationTarget(null);
                  return;
                }

                // If not admin, check if timed out and entered a valid cashier PIN
                if (isTimedOut) {
                  const localCashier = users.find(
                    (u: any) =>
                      u.pin === pin &&
                      (u.role === 'cajero' ||
                        u.role === 'admin' ||
                        u.role === 'gerente' ||
                        u.role === 'mesero')
                  );

                  if (localCashier) {
                    const auditNote = `Cancelado por Cajero ${localCashier.name} tras ${elapsedMinutes} min sin respuesta de gerencia`;
                    const cashierUser: any = {
                      ...localCashier,
                      name: `${localCashier.name} (Cajero Local - Timeout)`,
                      role: localCashier.role || 'cajero',
                      isCashierOverride: true,
                      elapsedMinutes,
                      auditNote,
                    };

                    if (pendingCancellationTarget?.type === 'account') {
                      await handleAuthorizeAccountCancellation(
                        pendingCancellationTarget.id,
                        cashierUser,
                        auditNote
                      );
                    } else if (
                      pendingCancellationTarget?.type === 'item' ||
                      pendingCancellationTarget?.type === 'bulk'
                    ) {
                      await finalizeComandaItemsCancellationInFirebase(
                        pendingCancellationTarget.id,
                        selectedTable || {},
                        pendingCancellationTarget.items || [],
                        cashierUser
                      );
                      if (matchingNotif) {
                        await updateNotificationInFirebase(matchingNotif.id, {
                          status: 'approved',
                          authorizedBy: cashierUser.name,
                          authorizedAt: new Date().toISOString(),
                          cashierTimeoutAuthorized: true,
                          cancellationAuditNote: auditNote,
                        });
                        recordCancellationTimelineEvent(matchingNotif.id, {
                          stage: 'resolved',
                          title: 'Cancelación Autorizada por Cajero (Timeout) ⏱️',
                          description: auditNote,
                          actor: localCashier.name,
                          deviceInfo: getSimplifiedDeviceInfo(),
                          status: 'ok',
                        });
                        if (setNotificationsList) {
                          setNotificationsList((prev: any[]) =>
                            prev.map((n) =>
                              n.id === matchingNotif.id
                                ? {
                                    ...n,
                                    status: 'approved',
                                    authorizedBy: cashierUser.name,
                                    cashierTimeoutAuthorized: true,
                                  }
                                : n
                            )
                          );
                        }
                        if (notifyAdminsCancellationResolved && matchingNotif.cancellationFolio) {
                          notifyAdminsCancellationResolved(
                            matchingNotif.tenantId || effectiveTenantId || 'tenant-1',
                            matchingNotif.branchName || selectedTenant?.name || 'Cocinet',
                            matchingNotif.cancellationFolio,
                            true,
                            cashierUser.name
                          );
                        }
                      }
                      triggerAppNotification(
                        'Cancelación exitosa',
                        `Productos cancelados por cajero tras ${elapsedMinutes} min ✅`,
                        'success'
                      );
                    }

                    setShowAuthorizeCancellationModal(false);
                    setAuthorizationPin('');
                    setPendingCancellationTarget(null);
                    return;
                  } else {
                    alert('PIN incorrecto ❌ (Introduce tu PIN de Cajero o PIN de Administrador)');
                    setAuthorizationPin('');
                    return;
                  }
                }

                // If not timed out and not valid admin
                alert(
                  `PIN de Administrador incorrecto ❌\n(Si ningún administrador atiende la solicitud, el PIN de cajero se habilitará automáticamente en ~${remainingMinutes} min)`
                );
                setAuthorizationPin('');
              }
            )}
          </div>
        </div>
      </div>
    </IonModal>
  );
};

