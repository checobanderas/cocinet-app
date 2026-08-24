import React from "react";

export const Sidebar: React.FC<any> = (props) => {
  return (
    <div className="w-64 bg-slate-900 text-white h-full hidden md:flex flex-col">
      <div className="p-4 font-bold text-lg">Navegación</div>
    </div>
  );
};

export default Sidebar;
