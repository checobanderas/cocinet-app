import React from "react";

interface CustomersViewProps {
  customers: any[];
  // And many other props for full implementation
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Catálogo de Clientes</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default CustomersView;
