import { getOperatingDay } from '../../utils/appHelpers';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonHeader, IonIcon } from '@ionic/react';
import { menuOutline } from 'ionicons/icons';

interface MaterialHeaderViewProps {
  currentUser: any;
  handleLogout: any;
  isMasterAdmin: any;
  isOnline: any;
  isOwnerUnlocked: any;
  notificationsList: any;
  selectedTenant: any;
  setAppMode: any;
  setCurrentUser: any;
  setLoginSubStep: any;
  setSelectedLoginUser: any;
  setShowBranchSwitcherModal: any;
  setShowNotificationModal: any;
  setShowSidebar: any;
  options: any;
}

export const MaterialHeaderView: React.FC<MaterialHeaderViewProps> = ({
  currentUser,
  handleLogout,
  isMasterAdmin,
  isOnline,
  isOwnerUnlocked,
  notificationsList,
  options,
  selectedTenant,
  setAppMode,
  setCurrentUser,
  setLoginSubStep,
  setSelectedLoginUser,
  setShowBranchSwitcherModal,
  setShowNotificationModal,
  setShowSidebar
}) => {
  const { title, subtitle, showBack = false, onBack, showMenu = true, actions, minimal = false } = options;
  const currentOpDay = getOperatingDay(new Date());
  const unreadCount = notificationsList.filter(
    (n) => !n.read && getOperatingDay(n.createdAt ? new Date(n.createdAt) : new Date()) === currentOpDay
  ).length;

  useEffect(() => {
    if (!showBack) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "Escape" || e.code === "Escape") {
        const target = e.target as HTMLElement;
        const isInputField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
        if (isInputField) {
          target.blur();
        }
        e.preventDefault();
        e.stopPropagation();
        if (onBack) {
          onBack();
        } else {
          setAppMode("floorplan");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showBack, onBack, setAppMode]);

  return (
    <IonHeader className="ion-no-border" style={{ zIndex: 100 }}>
      <div 
        className={`w-full text-white shadow-lg border-b select-none transition-all duration-500 ${
          isOnline 
            ? "bg-black border-neutral-900" 
            : "bg-red-600 border-red-700"
        }`}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          padding: "10px 16px",
        }}
      >
        <div className="flex items-center justify-between gap-3 h-14">
          {/* Left Section: Back or Menu Button */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack || (() => setAppMode("floorplan"))}
                className="w-10 h-10 rounded-full bg-indigo-900/40 hover:bg-indigo-800 text-lg flex items-center justify-center transition border-none cursor-pointer outline-none shadow-sm text-amber-400"
                title="Retroceder (Presiona ESC)"
              >
                ⬅️
              </motion.button>
              ) : showMenu ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSidebar(true)}
                  className="w-10 h-10 rounded-full bg-indigo-900/40 hover:bg-indigo-800 text-lg flex items-center justify-center transition border-none cursor-pointer outline-none shadow-sm"
                  title="Menú Principal"
                >
                  <IonIcon icon={menuOutline} style={{ fontSize: "22px", color: "white" }} />
                </motion.button>
              ) : null}

              {/* Title Section */}
              <div className="text-left flex flex-col justify-center leading-tight">
                <h1 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg m-0">
                  {title}
                </h1>
                {subtitle && (
                  <span className="text-[9px] sm:text-[11px] text-slate-300 font-bold tracking-normal truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Right Section: User details & Notifications & Actions & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {actions}

              {/* Notifications Button */}
              {!minimal && currentUser && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotificationModal(true)}
                  className="relative w-9 h-9 rounded-full bg-indigo-900/40 hover:bg-indigo-800 flex items-center justify-center text-lg border-none cursor-pointer outline-none transition"
                  title="Notificaciones"
                >
                  🔔
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-black shadow-md border border-white animate-bounce">
                      {unreadCount}
                    </div>
                  )}
                </motion.button>
              )}

              {/* Branch indicator & Switcher button */}
              {!minimal && selectedTenant && (
                <div className="flex items-center gap-1.5">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
                      🏢 {selectedTenant.name}
                    </span>
                    <span className="text-[9px] font-mono font-black text-amber-200 bg-black/40 px-1 py-0.5 rounded border border-amber-500/40">
                      {selectedTenant.id}
                    </span>
                  </div>

                  {(isOwnerUnlocked || currentUser?.role === "owner" || currentUser?.role === "supervisor" || isMasterAdmin) && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBranchSwitcherModal(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase flex items-center gap-1 shadow-md border border-indigo-400/40 cursor-pointer"
                      title="Cambiar de Sucursal (Patrón / Supervisor)"
                    >
                      <span>🚪</span>
                      <span className="hidden xs:inline">Cambiar Sucursal</span>
                    </motion.button>
                  )}
                </div>
              )}

              {!minimal && currentUser && (
                <div className="hidden md:flex flex-col items-end text-right leading-none gap-0.5">
                  <span className="text-[11px] font-black text-slate-200">{currentUser.name}</span>
                  <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              )}

              {/* Quick switch profile 👤🔄 */}
              {!minimal && currentUser && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentUser(null);
                    setSelectedLoginUser(null);
                    setLoginSubStep("user");
                    localStorage.removeItem("pos_current_user");
                  }}
                  className="w-9 h-9 rounded-full bg-indigo-900/40 hover:bg-indigo-800 text-sm flex items-center justify-center border-none cursor-pointer outline-none transition"
                  title="Cambiar Usuario 👤🔄"
                >
                  👤🔄
                </motion.button>
              )}

              {/* Logout Button (Cerrar Sesión) */}
              {!minimal && currentUser && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md shadow-rose-900/20 cursor-pointer outline-none"
                  title="Cerrar Sesión Completa"
                >
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span>🚪</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </IonHeader>
    );
};
