import React from "react";

export const CorteX: React.FC<any> = (props) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Corte X (Parcial)</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default CorteX;
