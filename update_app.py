import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

handle_save_pattern = re.compile(
    r'(const handleSave = async \(e: React\.FormEvent\) => \{.*?try \{)(.*?)(setProductCrudModal\(\{ isOpen: false, product: null \}\);)',
    re.DOTALL
)

def handle_save_repl(match):
    prefix = match.group(1)
    original_try_body = match.group(2)
    suffix = match.group(3)
    
    new_try_body = """
        const targetTenantsSelect = (e.target as HTMLFormElement).elements.namedItem("targetTenants") as HTMLSelectElement;
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
          
          for (const tId of selectedTenants) {
            if (isEditing && p) {
               const matchedProduct = allProducts.find((prod: any) => prod.tenantId === tId && prod.name.trim().toLowerCase() === name.trim().toLowerCase());
               if (matchedProduct) {
                 await updateProductInFirebase(matchedProduct.id, data);
                 updatedCount++;
               } else {
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
            } else {
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
          
          if (isEditing && p) {
            triggerAppNotification("Productos Actualizados", Se actualizaron \ y se crearon \ en las sucursales seleccionadas., "success");
          } else {
            triggerAppNotification("Productos Creados", Se agregaron \ productos a las sucursales seleccionadas., "success");
          }
        }
    """
    return prefix + new_try_body + suffix

content = handle_save_pattern.sub(handle_save_repl, content)

ui_pattern = re.compile(
    r'(<div className="space-y-1.5">\s*<label className="block text-\[11px\] font-black text-slate-500 uppercase ml-1">Punto de Impresión \(Área\)</label>.*?</div>)',
    re.DOTALL
)

def ui_repl(match):
    original_html = match.group(1)
    new_html = """
              <div className="space-y-1.5 mt-4">
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
                      {t.emoji || "??"} {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-bold ml-1">
                  Si no seleccionas ninguna, la acción solo afectará a la sucursal actual. (Usa Ctrl/Cmd para seleccionar varias)
                </p>
              </div>
    """
    return original_html + new_html

content = ui_pattern.sub(ui_repl, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated App.tsx')
