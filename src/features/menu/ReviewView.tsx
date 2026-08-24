import React from "react";

interface ReviewViewProps {
  currentOrder: any;
  onConfirm: () => void;
  onModify: () => void;
  // And many other props for full implementation
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  currentOrder,
  onConfirm,
  onModify,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Revisión de Pedido</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default ReviewView;
