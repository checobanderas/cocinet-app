import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, QrCode, Share2 } from 'lucide-react';
import { TablesMode } from '../../utils/appHelpers';
import { ConnectWaiterModal } from '../modals/ConnectWaiterModal';

interface TablesModeSwitcherProps {
  currentMode: TablesMode;
  onSwitchMode?: (mode: TablesMode) => void;
  branchName?: string;
}

export const TablesModeSwitcher: React.FC<TablesModeSwitcherProps> = ({
  currentMode,
  onSwitchMode,
  branchName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!onSwitchMode) return null;

  const modeConfig = {
    floorplan: {
      label: 'Mapa de Mesas',
      shortLabel: 'Mapa',
      icon: '🍽️',
      color: 'from-blue-600 to-indigo-700',
      border: 'border-blue-400/50',
      desc: 'Vista de salón con pestañas'
    },
    gestion_cuentas: {
      label: 'Gestión Cuentas',
      shortLabel: 'Gestión',
      icon: '💻',
      color: 'from-emerald-600 to-teal-700',
      border: 'border-emerald-400/50',
      desc: 'Pantalla dividida 50/50 Windows'
    },
    cuentas_celular: {
      label: 'Cuentas Celular',
      shortLabel: 'Celular',
      icon: '📱',
      color: 'from-violet-600 to-purple-700',
      border: 'border-purple-400/50',
      desc: 'Vista vertical para móviles'
    }
  };

  const current = modeConfig[currentMode] || modeConfig.floorplan;

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-9 px-2.5 sm:px-3 rounded-full bg-gradient-to-r ${current.color} hover:brightness-110 text-white font-extrabold text-xs shadow-md border ${current.border} flex items-center gap-1.5 transition-all cursor-pointer select-none outline-none`}
          title="Cambiar Modalidad de Pantalla 🔄"
        >
          <span className="text-base leading-none animate-spin-slow">🔄</span>
          <span className="text-base leading-none">{current.icon}</span>
          <span className="hidden sm:inline font-black tracking-tight">{current.shortLabel}</span>
          <span className="text-[10px] opacity-80 leading-none">▼</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl z-50 p-2 space-y-1.5"
            >
              <div className="px-3 py-1.5 text-[11px] font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🔄</span>
                  <span>Modalidad de Mesas</span>
                </span>
                <span className="text-[9px] text-slate-400 font-normal">Elige una vista</span>
              </div>

              {/* Botón 1: Mapa de Mesas */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSwitchMode('floorplan');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentMode === 'floorplan'
                    ? 'bg-blue-600/30 text-white border border-blue-500/60 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className="text-xl">🍽️</span>
                <div className="flex-1">
                  <div className="font-extrabold flex items-center justify-between">
                    <span>Mapa de Mesas</span>
                    {currentMode === 'floorplan' && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-black">Activo</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Pestañas tradicionales</div>
                </div>
              </button>

              {/* Botón 2: Gestión de Cuentas */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSwitchMode('gestion_cuentas');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentMode === 'gestion_cuentas'
                    ? 'bg-emerald-600/30 text-white border border-emerald-500/60 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className="text-xl">💻</span>
                <div className="flex-1">
                  <div className="font-extrabold flex items-center justify-between">
                    <span>Gestión de Cuentas</span>
                    {currentMode === 'gestion_cuentas' && (
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black">Activo</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Pantalla dividida 50/50 Windows</div>
                </div>
              </button>

              {/* Botón 3: Cuentas Celular */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSwitchMode('cuentas_celular');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentMode === 'cuentas_celular'
                    ? 'bg-purple-600/30 text-white border border-purple-500/60 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className="text-xl">📱</span>
                <div className="flex-1">
                  <div className="font-extrabold flex items-center justify-between">
                    <span>Cuentas Celular</span>
                    {currentMode === 'cuentas_celular' && (
                      <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-black">Activo</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Vertical ágil para móviles</div>
                </div>
              </button>

              {/* Separador y Conectar Celular / Meseros */}
              <div className="pt-1.5 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowConnectModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md transition-all cursor-pointer border border-purple-400/40"
                >
                  <Smartphone className="w-3.5 h-3.5 text-purple-200" />
                  <span>Conectar Celular / Mesero (QR / WA)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showConnectModal && (
        <ConnectWaiterModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          branchName={branchName}
        />
      )}
    </>
  );
};
