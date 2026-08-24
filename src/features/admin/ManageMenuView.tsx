import React from "react";

interface ManageMenuViewProps {
  products: any[];
  categories: any[];
  onAddProduct: () => void;
  // And many other props for full implementation
}

export const ManageMenuView: React.FC<ManageMenuViewProps> = ({
  products,
  categories,
  onAddProduct,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Administrar Menú e Inventario</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default ManageMenuView;
