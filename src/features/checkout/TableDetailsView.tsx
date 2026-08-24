import React from "react";

interface TableDetailsViewProps {
  tableData: any;
  onPay: () => void;
  onAddMore: () => void;
  // And many other props for full implementation
}

export const TableDetailsView: React.FC<TableDetailsViewProps> = ({
  tableData,
  onPay,
  onAddMore,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Detalle de la Mesa</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default TableDetailsView;
