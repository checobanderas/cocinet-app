import React from "react";

interface FloorplanViewProps {
  // Placeholder props representing dependencies
  selectedTenant: any;
  tables: any[];
  onTableSelect: (tableId: string) => void;
  isSystemsMode: boolean;
  currentUser: any;
}

export const FloorplanView: React.FC<FloorplanViewProps> = ({
  selectedTenant,
  tables,
  onTableSelect,
  isSystemsMode,
  currentUser,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-slate-800">Vista de Mesas (Croquis)</h1>
      <p className="text-slate-500 mt-2">
        Módulo extraído para carga diferida (Code Splitting).
      </p>
      <div className="mt-8 text-center text-sm text-slate-400">
        Sucursal: {selectedTenant?.name || "Cargando..."} <br />
        Mesas disponibles: {tables?.length || 0}
      </div>
    </div>
  );
};

export default FloorplanView;
