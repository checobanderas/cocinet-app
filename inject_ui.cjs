const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const uiHtml = `
              <div className="space-y-1.5 mb-4">
                <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">
                  Replicar en Sucursales (Opcional)
                </label>
                <select
                  name="targetTenants"
                  multiple
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                  style={{ minHeight: '120px' }}
                >
                  {COMPANY_CATALOG.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji || '??'} {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-bold ml-1">
                  Si no seleccionas ninguna, la acción solo afectará a la sucursal actual. (Usa Ctrl/Cmd para seleccionar varias)
                </p>
              </div>
`;

const formRegex = /(<form onSubmit=\{handleSave\}>\s*<div className="p-6 space-y-6">)/;
content = content.replace(formRegex, (m, g1) => g1 + uiHtml);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Injected UI block.');
