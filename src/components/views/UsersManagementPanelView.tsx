import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';



interface UsersManagementPanelViewProps {
  COMPANY_CATALOG: any;
  activeOwnerFilter: any;
  currentUser: any;
  handleAddRow: any;
  handleCellChange: any;
  handleDeleteRow: any;
  isSystemsMode: any;
  restrictedOwnerKey: any;
  selectedTenant: any;
  setShowEmployeeGuide: any;
  showEmployeeGuide: any;
  triggerAppNotification: any;
  users: any;
}

export const UsersManagementPanelView: React.FC<UsersManagementPanelViewProps> = ({
  COMPANY_CATALOG,
  activeOwnerFilter,
  currentUser,
  handleAddRow,
  handleCellChange,
  handleDeleteRow,
  isSystemsMode,
  restrictedOwnerKey,
  selectedTenant,
  setShowEmployeeGuide,
  showEmployeeGuide,
  triggerAppNotification,
  users
}) => {
const currentTenantUsers = users;

    const cycleAvatar = (userId: string, currentAvatar: string) => {
      const avatars = [
        "fa-solid fa-person-walking",
        "fa-solid fa-person-running",
        "fa-solid fa-bell-concierge",
        "fa-solid fa-cash-register",
        "fa-solid fa-user-tie",
        "fa-solid fa-user-shield",
        "fa-solid fa-hat-cowboy",
        "fa-solid fa-laptop-code"
      ];
      const index = avatars.indexOf(currentAvatar);
      const nextIndex = (index + 1) % avatars.length;
      handleCellChange(userId, "avatar", avatars[nextIndex]);
    };

    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        {/* Header Action Card */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📊 Tabla de Usuarios (Estilo Excel)
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic directamente en cualquier celda para modificar el Nombre, PIN, Rol o Sucursal. Los cambios se guardan automáticamente.
            </p>
          </div>
          <button
            onClick={handleAddRow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-2xl transition duration-200 flex items-center gap-2 text-sm shadow-md shadow-indigo-200"
          >
            <i className="fa-solid fa-plus text-xs" />
            Agregar Nueva Fila
          </button>
        </div>

        {/* Guía de Inicio Rápido para Empleados */}
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
          <button
            onClick={() => setShowEmployeeGuide(!showEmployeeGuide)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <i className="fa-solid fa-graduation-cap text-base" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  📖 Guía de Inicio Rápido para Colaboradores
                </h4>
                <p className="text-xs text-slate-500">
                  Instrucciones rápidas para el uso correcto de roles, accesos y turnos.
                </p>
              </div>
            </div>
            <div className="text-slate-400 hover:text-slate-600 transition">
              <i className={`fa-solid ${showEmployeeGuide ? "fa-chevron-up" : "fa-chevron-down"} text-sm`} />
            </div>
          </button>

          {showEmployeeGuide && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-indigo-100/60 text-slate-600 text-xs leading-relaxed animate-fadeIn">
              <div className="space-y-2">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-user-gear text-indigo-500" /> 1. Roles y Privilegios
                </h5>
                <ul className="space-y-1.5 list-disc list-inside text-slate-500">
                  <li><strong className="text-slate-700">Administrador:</strong> Acceso total al panel, inventarios y finanzas.</li>
                  <li><strong className="text-slate-700">Cajero:</strong> Encargado de ventas, cobros y arqueos de caja.</li>
                  <li><strong className="text-slate-700">Mesero:</strong> Registra comandas directo desde el mapa de mesas.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-key text-indigo-500" /> 2. PIN y Seguridad
                </h5>
                <p className="text-slate-500">
                  Cada empleado cuenta con un <strong className="text-slate-700">PIN personal e intransferible</strong> para iniciar sesión. Es indispensable para autorizar cancelaciones de comandas y cortes de caja.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-pen-to-square text-indigo-500" /> 3. Modificaciones Rápidas
                </h5>
                <p className="text-slate-500">
                  Como administrador, puedes editar la información de cualquier colaborador haciendo clic directo sobre la celda correspondiente en la tabla estilo Excel. Los cambios se sincronizan al instante en la base de datos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Excel Table Container */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] lg:min-w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[80px] min-w-[80px] text-center">Avatar</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[120px] min-w-[120px]">ID de Acceso</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider min-w-[220px]">Nombre Completo</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[130px] min-w-[130px]">Rol</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[100px] min-w-[100px]">PIN</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[240px] min-w-[240px]">Sucursal Asignada</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[100px] min-w-[100px] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTenantUsers.map((user) => {
                  const isProtected = user.id.endsWith("-admin") || user.id.endsWith("-sistemas") || user.id.endsWith("-manager");
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar Cycler */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => cycleAvatar(user.id, user.avatar)}
                          className="w-9 h-9 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center text-base hover:bg-indigo-50 hover:text-indigo-600 transition"
                          title="Haz clic para cambiar de avatar"
                        >
                          <i className={user.avatar || "fa-solid fa-user"} />
                        </button>
                      </td>

                      {/* User ID (Read-only) */}
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-400 select-all font-semibold">
                        {user.id.replace(`${user.tenantId}-`, "")}
                      </td>

                      {/* Name Input */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          defaultValue={user.name}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value.trim() !== user.name) {
                              handleCellChange(user.id, "name", e.target.value.trim());
                            }
                          }}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-semibold outline-none transition text-sm"
                        />
                      </td>

                      {/* Role Select */}
                      <td className="py-2.5 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleCellChange(user.id, "role", e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-semibold outline-none cursor-pointer text-sm"
                        >
                          <option value="mesero">Mesero 🏃</option>
                          <option value="cajero">Cajero 💵</option>
                          <option value="admin">Admin 👔</option>
                        </select>
                      </td>

                      {/* PIN Input */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          maxLength={4}
                          defaultValue={user.pin}
                          onBlur={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length === 4 && val !== user.pin) {
                              handleCellChange(user.id, "pin", val);
                            } else if (val !== user.pin) {
                              e.target.value = user.pin; // Revert
                              triggerAppNotification("⚠️ Error", "El PIN debe tener exactamente 4 dígitos.", "warning");
                            }
                          }}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-mono font-bold outline-none transition text-sm"
                        />
                      </td>

                      {/* Tenant/Branch Select */}
                      <td className="py-2.5 px-4">
                        <select
                          value={user.tenantId || selectedTenant.id}
                          onChange={(e) => handleCellChange(user.id, "tenantId", e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-semibold outline-none cursor-pointer text-sm"
                        >
                          {(() => {
                            const ownerKey = restrictedOwnerKey || activeOwnerFilter || selectedTenant.ownerKey;
                            const isSistemas = currentUser?.id.endsWith("-sistemas") || isSystemsMode;
                            const allowedCompanies = COMPANY_CATALOG.filter((c) => {
                              if (isSistemas) return true;
                              if (ownerKey && c.ownerKey === ownerKey) return true;
                              return false;
                            });
                            return allowedCompanies.map((tenant) => (
                              <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                              </option>
                            ));
                          })()}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center">
                        {isProtected ? (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-lg select-none">
                            Fijo
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteRow(user.id)}
                            className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/50 w-8 h-8 rounded-xl flex items-center justify-center transition"
                            title="Eliminar este usuario"
                          >
                            <i className="fa-solid fa-trash-can text-xs" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};
