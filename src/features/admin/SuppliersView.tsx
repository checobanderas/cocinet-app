import React from "react";

interface SuppliersViewProps {
  suppliers: any[];
  // And many other props for full implementation
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Catálogo de Proveedores</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default SuppliersView;
