const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const uiHtml = `
              <div className="space-y-1.5 mb-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">
                  ?? Replicar en Sucursales (Opcional)
                </label>
                <select
                  name="targetTenants"
                  multiple
                  className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                  style={{ minHeight: '100px' }}
                >
                  {COMPANY_CATALOG.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji || '??'} {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-bold ml-1 mt-1">
                  (Usa Ctrl/Cmd para seleccionar varias). Solo afectará a la sucursal actual si lo dejas vacío.
                </p>
              </div>
`;

const formRegex = /(<form onSubmit=\{handleSave\} className="space-y-5 pb-6">)/;
if (content.match(formRegex)) {
    content = content.replace(formRegex, (m, g1) => g1 + uiHtml);
    fs.writeFileSync('src/App.tsx', content, 'utf-8');
    console.log('Injected UI block.');
} else {
    console.log('Regex did not match.');
}
