import React from "react";

interface MenuViewProps {
  products: any[];
  categories: any[];
  onProductSelect: (product: any) => void;
  // And many other props for full implementation
}

export const MenuView: React.FC<MenuViewProps> = ({
  products,
  categories,
  onProductSelect,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Menú de Productos</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default MenuView;
