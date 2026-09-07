import React from 'react';
import { generateDeliveryDriverWhatsAppUrl } from '../../utils/whatsappCloud';

interface DeliveryPanelViewProps {
  deliveryNotes: any;
  selectedDeliveryAddress: any;
  selectedDeliveryClient: any;
  selectedTable: any;
  setShowDeliverySetupModal: any;
  selectedTenant?: any;
}

export const DeliveryPanelView: React.FC<DeliveryPanelViewProps> = ({
  deliveryNotes,
  selectedDeliveryAddress,
  selectedDeliveryClient,
  selectedTable,
  setShowDeliverySetupModal,
  selectedTenant
}) => {
  if (!selectedTable || selectedTable.zone !== "Servicio a Domicilio") return null;

  // Si no tiene cliente asignado, mostrar banner naranja interactivo para no olvidar registrarlo
  if (!selectedDeliveryClient) {
    return (
      <div className="m-3 sm:m-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-400/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner">
            🛵
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-100 uppercase tracking-widest block">
              SERVICIO A DOMICILIO - {selectedTable?.label || "MESA"}
            </span>
            <p className="text-xs font-black text-white">
              ⚠️ Falta Asignar Teléfono y Dirección del Cliente
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeliverySetupModal(true)}
          className="w-full sm:w-auto bg-white hover:bg-amber-50 text-orange-700 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer border-none shadow-md active:scale-95 shrink-0 uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <span>➕</span>
          <span>Registrar / Seleccionar Cliente 🛵</span>
        </button>
      </div>
    );
  }

  // Extraer liga GPS si viene en la dirección o referencias
  let mapsUrl = "";
  const combinedText = `${selectedDeliveryAddress || ""} ${deliveryNotes || ""}`;
  const gpsMatch = combinedText.match(/\[GPS:\s*(https:\/\/[^\]]+)\]/);
  if (gpsMatch) {
    mapsUrl = gpsMatch[1];
  }

  // Calcular total si la mesa tiene comandas
  const allItems = (selectedTable.comandas || []).flatMap((c: any) => c.items || []);
  const activeItems = allItems.filter((i: any) => !i.isCancelled);
  const totalAmount = activeItems.reduce((sum: number, i: any) => sum + (i.quantity * (i.product?.price || 0)), 0);

  const handleShareToDriver = () => {
    const driverUrl = generateDeliveryDriverWhatsAppUrl({
      clientName: selectedDeliveryClient.name,
      clientPhone: selectedDeliveryClient.phone,
      branchName: selectedTenant?.name || "Cocinet",
      address: selectedDeliveryAddress || "Dirección no especificada",
      notes: deliveryNotes || "",
      gpsUrl: mapsUrl,
      items: activeItems.map((i: any) => ({
        name: i.product?.name || "Platillo",
        quantity: i.quantity,
        notes: i.notes
      })),
      total: totalAmount,
      isPaid: selectedTable.status === "payment_pending" || false,
      folio: selectedTable.folioInterno || selectedTable.label
    });
    window.open(driverUrl, "_blank");
  };

  return (
    <div className="m-3 sm:m-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-3xl p-4 shadow-xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
      {/* Detalle visual de fondo */}
      <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none translate-x-8 translate-y-8 select-none">
        🛵
      </div>
      
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
          🛵
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">
              REPARTO A DOMICILIO - {selectedTable?.label || "MESA"}
            </span>
            {mapsUrl && (
              <span className="text-[9px] font-black bg-emerald-500/80 text-white px-1.5 py-0.5 rounded-full uppercase">
                📍 GPS Activo
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-black tracking-tight truncate">
            {selectedDeliveryClient.name}
          </h3>
          <p className="text-xs text-indigo-100 font-bold flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-amber-300">📞 {selectedDeliveryClient.phone}</span>
            <span className="opacity-40">|</span>
            <span className="truncate max-w-[280px]">📍 {selectedDeliveryAddress || "Sin dirección"}</span>
          </p>
          {deliveryNotes && (
            <p className="text-[11px] text-indigo-200/90 font-medium italic truncate max-w-[340px]">
              📝 {deliveryNotes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={handleShareToDriver}
          className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-2.5 rounded-xl transition cursor-pointer border-none shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
          title="Compartir datos de entrega, ubicación y total al WhatsApp del Repartidor"
        >
          <span>📲</span>
          <span>Ficha Repartidor</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDeliverySetupModal(true)}
          className="flex-1 sm:flex-initial bg-white hover:bg-indigo-50 text-indigo-800 text-xs font-black px-3.5 py-2.5 rounded-xl transition cursor-pointer border-none shadow-md active:scale-95 shrink-0"
        >
          Editar Envío ⚙️
        </button>
      </div>
    </div>
  );
};
