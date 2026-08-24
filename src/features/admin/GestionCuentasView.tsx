import React from "react";

interface GestionCuentasViewProps {
  orders: any[];
  onOrderSelect: (order: any) => void;
  // And many other props for full implementation
}

export const GestionCuentasView: React.FC<GestionCuentasViewProps> = ({
  orders,
  onOrderSelect,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Gestión de Cuentas</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default GestionCuentasView;
