import React from 'react';
import { IonIcon } from '@ionic/react';
import { backspaceOutline } from 'ionicons/icons';

interface PinModalOverlayProps {
  showTenantPinModal: boolean;
  setShowTenantPinModal: (v: boolean) => void;
  pendingTenant: any;
  setPendingTenant: (v: any) => void;
  typedPin: string;
  setTypedPin: (v: string) => void;
  handlePinNumericPress: (key: string) => void;
}

export const PinModalOverlay: React.FC<PinModalOverlayProps> = ({
  showTenantPinModal,
  setShowTenantPinModal,
  pendingTenant,
  setPendingTenant,
  typedPin,
  setTypedPin,
  handlePinNumericPress
}) => {
  const renderPinModalOverlay = () => {
    if (!pendingTenant) return null;

    return (
      <div
        style={{ zIndex: 9999999 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none"
      >
        <div
          className="bg-slate-900 border border-slate-850 rounded-3xl max-w-sm w-full p-6 text-white text-center space-y-6 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
              🔒
            </div>
            <h3 className="text-sm font-black tracking-wider uppercase text-rose-400 m-0 p-0">
              CÓDIGO REQUERIDO 🔑
            </h3>
            <p className="text-[11.5px] text-slate-300 font-bold leading-relaxed px-2 m-0 p-0">
              Ingresa el PIN de seguridad de{" "}
              <span className="text-white font-extrabold underline decoration-rose-500">
                4 dígitos
              </span>{" "}
              para poder habilitar la sincronización de datos de esta sucursal:
            </p>
            <div className="bg-slate-800 border border-slate-700/60 py-2 px-3.5 rounded-2xl inline-block font-black text-xs text-indigo-400">
              🏢 {pendingTenant.name} ({pendingTenant.type})
            </div>
          </div>

          {/* Code Dots indicators */}
          <div className="flex justify-center gap-4 py-1">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = typedPin.length > index;
              return (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-200 ${
                    hasDigit
                      ? "bg-rose-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)] ring-2 ring-rose-500/30 text-xl scale-105"
                      : "bg-slate-850 border border-slate-800 text-slate-500"
                  }`}
                >
                  {hasDigit ? "●" : ""}
                </div>
              );
            })}
          </div>

          {/* Numeric Pad Grid */}
          <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinNumericPress(num)}
                  style={{ touchAction: "manipulation" }}
                  className="bg-slate-850 hover:bg-slate-800 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePinNumericPress("CLEAR")}
                style={{ touchAction: "manipulation" }}
                className="bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/30 text-rose-300 h-12 rounded-2xl text-xs font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={() => handlePinNumericPress("0")}
                style={{ touchAction: "manipulation" }}
                className="bg-slate-850 hover:bg-slate-800 text-white h-12 rounded-2xl text-lg font-black shadow flex items-center justify-center active:scale-95 transition-all outline-none border-none cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={() => handlePinNumericPress("BACKSPACE")}
                style={{ touchAction: "manipulation" }}
                className="bg-slate-850 hover:bg-slate-800 text-slate-300 h-12 rounded-2xl text-[11px] font-black shadow flex items-center justify-center gap-1 active:scale-95 transition-all outline-none border-none cursor-pointer"
              >
                <IonIcon icon={backspaceOutline} style={{ fontSize: "14px" }} />
                Borrar
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTenantPinModal(false);
                setPendingTenant(null);
                setTypedPin("");
              }}
              style={{ touchAction: "manipulation" }}
              className="w-full bg-slate-900 hover:bg-slate-805 text-rose-400 border border-rose-500/20 font-black text-xs py-3 rounded-2xl tracking-tight transition active:scale-95 shadow cursor-pointer border-none outline-none text-center"
            >
              🚫 Cancelar Selección
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            <span>🛡️</span> <span>SISTEMA DE SEGURIDAD MULTI-SUCURSAL</span>
          </div>
        </div>
      </div>
    );
  };

  return renderPinModalOverlay();
};
