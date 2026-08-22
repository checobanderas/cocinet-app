import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rewrite handleSave
pattern_save = re.compile(
    r'(const handleSave = async \(e: React\.FormEvent\) => \{.*?try \{)(.*?)(setProductCrudModal\(\{ isOpen: false, product: null \}\);)',
    re.DOTALL
)

new_try = """
          const targetTenantsSelect = (e.target as HTMLFormElement).elements.namedItem('targetTenants') as HTMLSelectElement;
          const selectedTenants = targetTenantsSelect ? Array.from(targetTenantsSelect.selectedOptions).map(o => o.value) : [];
          
          if (selectedTenants.length === 0) {
            if (isEditing && p) {
              await updateProductInFirebase(p.id, data);
              setRelationMatches(prev => prev.map(m => m.productId === p.id ? {
                ...m,
                proposedReportName: data.reportName || m.proposedReportName,
                proposedSortOrder: data.sortOrder === 9999 ? m.proposedSortOrder : data.sortOrder,
                proposedDescription: data.description || m.proposedDescription,
                proposedSubgroup: data.subgroup || m.proposedSubgroup
              } : m));
              triggerAppNotification("Producto Actualizado", \ se actualizó correctamente, "success");
            } else {
              const newId = prod_\;
              await addProductToFirebase({
                ...data,
                id: newId,
                uuid: generateUUID(),
                created_at: nowTimestamp,
              });
              triggerAppNotification("Producto Creado", \ se agregó al menú, "success");
            }
          } else {
            const allProducts = await getAllProductsFromFirebase();
            let createdCount = 0;
            let updatedCount = 0;
            
            if (isEditing && p) {
              // check if it exists in selected tenants
              const tenantsToUpdate = [];
              const tenantsToAdd = [];
              for (const tId of selectedTenants) {
                 const matchedProduct = allProducts.find((prod: any) => prod.tenantId === tId && prod.name.trim().toLowerCase() === name.trim().toLowerCase());
                 if (matchedProduct) {
                   tenantsToUpdate.push({ tId, matchedProduct });
                 } else {
                   tenantsToAdd.push(tId);
                 }
              }
              
              if (tenantsToAdd.length > 0) {
                 const tNames = tenantsToAdd.map(tid => COMPANY_CATALOG.find((c:any) => c.id === tid)?.name || tid).join(", ");
                 const confirmAdd = window.confirm(El producto "\" no existe en: \.\\n\\n¿Deseas agregarlo como nuevo en estas sucursales?);
                 if (confirmAdd) {
                    for (const tId of tenantsToAdd) {
                       const newId = prod_\_\_\;
                       await addProductToFirebase({
                         ...data,
                         id: newId,
                         uuid: generateUUID(),
                         tenantId: tId,
                         created_at: nowTimestamp,
                       });
                       createdCount++;
                    }
                 }
              }
              
              for (const item of tenantsToUpdate) {
                 await updateProductInFirebase(item.matchedProduct.id, data);
                 updatedCount++;
              }
              
              if (updatedCount > 0 || createdCount > 0) {
                 triggerAppNotification("Proceso Completado", Se actualizaron \ y se crearon \ en las sucursales seleccionadas., "success");
              }
            } else {
              // Adding
              const confirmAdd = window.confirm(¿Seguro que deseas AGREGAR este nuevo producto a las \ sucursales seleccionadas?);
              if (confirmAdd) {
                for (const tId of selectedTenants) {
                   const newId = prod_\_\_\;
                   await addProductToFirebase({
                     ...data,
                     id: newId,
                     uuid: generateUUID(),
                     tenantId: tId,
                     created_at: nowTimestamp,
                   });
                   createdCount++;
                }
                triggerAppNotification("Productos Creados", Se agregaron \ productos a las sucursales seleccionadas., "success");
              }
            }
          }
"""

def repl_save(m):
    return m.group(1) + new_try + m.group(3)

content = pattern_save.sub(repl_save, content)

# 2. Extract and remove the UI block from its old place, and insert it at the top of the form
# Look for the exact block I added earlier
ui_block_regex = re.compile(
    r'\s*<div className="space-y-1\.5 mt-4">\s*<label className="block text-\[11px\] font-black text-slate-500 uppercase ml-1">\s*Replicar en Sucursales \(Opcional\).*?</div>',
    re.DOTALL
)
match_ui = ui_block_regex.search(content)

if match_ui:
    ui_html = match_ui.group(0)
    # remove it
    content = content[:match_ui.start()] + content[match_ui.end():]
    
    # inject it at the top of the form
    # The form starts like:
    # <form onSubmit={handleSave}>
    #   <div className="p-6 space-y-6">
    form_start_regex = re.compile(r'(<form onSubmit=\{handleSave\}>\s*<div className="p-6 space-y-6">)')
    
    def repl_form(m):
        return m.group(1) + ui_html
        
    content = form_start_regex.sub(repl_form, content, count=1)
    print("Moved UI to the top.")
else:
    print("Could not find the UI block to move. Proceeding to inject directly.")
    ui_html = '''
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
'''
    form_start_regex = re.compile(r'(<form onSubmit=\{handleSave\}>\s*<div className="p-6 space-y-6">)')
    def repl_form(m):
        return m.group(1) + ui_html
        
    content = form_start_regex.sub(repl_form, content, count=1)
    
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
