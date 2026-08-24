import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';



interface DeliveryPanelViewProps {
  deliveryNotes: any;
  selectedDeliveryAddress: any;
  selectedDeliveryClient: any;
  selectedTable: any;
  setShowDeliverySetupModal: any;
}

export const DeliveryPanelView: React.FC<DeliveryPanelViewProps> = ({
  deliveryNotes,
  selectedDeliveryAddress,
  selectedDeliveryClient,
  selectedTable,
  setShowDeliverySetupModal
}) => {
if (!selectedTable || selectedTable.zone !== "Servicio a Domicilio") return null;

    if (!selectedDeliveryClient) {
      return null; // Removed upper banner as requested so it does not obstruct ordering
    }

    return (
      <div className="m-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-3xl p-4 shadow-md border-none flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Background visual detail */}
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none translate-x-8 translate-y-8 select-none">
          🛵
        </div>
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🛵
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">REPARTO A DOMICILIO</span>
            <h3 className="text-sm font-black tracking-tight">{selectedDeliveryClient.name}</h3>
            <p className="text-xs text-indigo-100 font-bold flex items-center gap-1">
              <span>📞 {selectedDeliveryClient.phone}</span>
              <span className="opacity-50">|</span>
              <span className="truncate max-w-[200px]">📍 {selectedDeliveryAddress || "Sin dirección"}</span>
            </p>
            {deliveryNotes && (
              <p className="text-[10px] text-indigo-200/90 font-medium italic truncate max-w-[300px]">
                📝 {deliveryNotes}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDeliverySetupModal(true)}
          className="bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0 relative z-10"
        >
          Editar Envío ⚙️
        </button>
      </div>
    );
};
