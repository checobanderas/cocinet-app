import React from "react";

interface DeliveryPanelProps {
  orders: any[];
  onOrderSelect: (order: any) => void;
}

export const DeliveryPanel: React.FC<DeliveryPanelProps> = ({
  orders,
  onOrderSelect,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Panel de Envíos a Domicilio</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default DeliveryPanel;
