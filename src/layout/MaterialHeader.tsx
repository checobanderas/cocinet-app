import React from "react";

export const MaterialHeader: React.FC<any> = (props) => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center px-4">
      <div className="font-bold text-slate-800">Header Principal</div>
    </header>
  );
};

export default MaterialHeader;
