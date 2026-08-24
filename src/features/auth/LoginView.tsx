import React from "react";

export const LoginView: React.FC<any> = (props) => {
  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-black">Iniciar Sesión</h1>
      <p className="text-slate-400 mt-2">Módulo de Login Extraído.</p>
    </div>
  );
};

export default LoginView;
