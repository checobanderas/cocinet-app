import React from "react";

interface ExpensesViewProps {
  expenses: any[];
  // And many other props for full implementation
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
}) => {
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Control de Gastos</h1>
      <p className="px-4 text-slate-500">Módulo extraído para Code Splitting.</p>
    </div>
  );
};

export default ExpensesView;
