import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';



interface CancellationPinPadViewProps {
  currentPin: any;
  setPin: any;
  onComplete: any;
}

export const CancellationPinPadView: React.FC<CancellationPinPadViewProps> = ({
  currentPin,
  onComplete,
  setPin
}) => {
  const handlePress = (key: string) => {
    if (key === "CLEAR") {
      setPin("");
    } else if (key === "BACKSPACE") {
      setPin(currentPin.slice(0, -1));
    } else {
      if (currentPin.length < 4) {
        const nextPin = currentPin + key;
        setPin(nextPin);
        if (nextPin.length === 4) {
          onComplete(nextPin);
        }
      }
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handlePress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePress('BACKSPACE');
      } else if (e.key === 'Delete' || e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handlePress('CLEAR');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentPin.length > 0) {
          onComplete(currentPin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPin, onComplete]);

  return (
      <div className="space-y-4 select-none">
        {/* Code dots */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = currentPin.length > index;
            return (
              <div
                key={index}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  hasDigit
                    ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-500/30 scale-105"
                    : "bg-slate-200 border border-slate-300 text-slate-400"
                }`}
              >
                {hasDigit ? "●" : ""}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 space-y-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePress(num)}
                className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-black h-11 rounded-xl text-md shadow-sm border border-slate-200 cursor-pointer transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePress("CLEAR")}
              className="bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 font-bold h-11 rounded-xl text-xs border border-red-200 cursor-pointer transition-all"
            >
              Limpiar
            </button>
            <button
              key="0"
              type="button"
              onClick={() => handlePress("0")}
              className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-black h-11 rounded-xl text-md shadow-sm border border-slate-200 cursor-pointer transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handlePress("BACKSPACE")}
              className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-600 font-bold h-11 rounded-xl text-xs border border-slate-200 cursor-pointer transition-all flex items-center justify-center"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    );
};
