const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regexSave = /(const handleSave = async \(e: React\.FormEvent\) => \{.*?try \{)(.*?)(setProductCrudModal\(\{ isOpen: false, product: null \}\);)/s;

const newTry = `
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
              triggerAppNotification("Producto Actualizado", \`\${name} se actualizó correctamente\`, "success");
            } else {
              const newId = \`prod_\${Date.now()}\`;
              await addProductToFirebase({
                ...data,
                id: newId,
                uuid: generateUUID(),
                created_at: nowTimestamp,
              });
              triggerAppNotification("Producto Creado", \`\${name} se agregó al menú\`, "success");
            }
          } else {
            const allProducts = await getAllProductsFromFirebase();
            let createdCount = 0;
            let updatedCount = 0;
            
            if (isEditing && p) {
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
                 const tNames = tenantsToAdd.map(tid => COMPANY_CATALOG.find((c:any) => c.id === tid)?.name || tid).join(', ');
                 const confirmAdd = window.confirm(\`El producto "\${name}" no existe en: \${tNames}.\\n\\n¿Deseas agregarlo como nuevo en estas sucursales?\`);
                 if (confirmAdd) {
                    for (const tId of tenantsToAdd) {
                       const newId = \`prod_\${tId}_\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`;
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
                 triggerAppNotification("Proceso Completado", \`Se actualizaron \${updatedCount} y se crearon \${createdCount} en las sucursales seleccionadas.\`, "success");
              }
            } else {
              const confirmAdd = window.confirm(\`¿Seguro que deseas AGREGAR este nuevo producto a las \${selectedTenants.length} sucursales seleccionadas?\`);
              if (confirmAdd) {
                for (const tId of selectedTenants) {
                   const newId = \`prod_\${tId}_\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`;
                   await addProductToFirebase({
                     ...data,
                     id: newId,
                     uuid: generateUUID(),
                     tenantId: tId,
                     created_at: nowTimestamp,
                   });
                   createdCount++;
                }
                triggerAppNotification("Productos Creados", \`Se agregaron \${createdCount} productos a las sucursales seleccionadas.\`, "success");
              }
            }
          }
`;

content = content.replace(regexSave, (match, prefix, body, suffix) => prefix + newTry + suffix);

const uiRegex = /\s*<div className="space-y-1\.5 mt-4">\s*<label className="block text-\[11px\] font-black text-slate-500 uppercase ml-1">\s*Replicar en Sucursales \(Opcional\)<\/label>.*?<\/div>/s;

const uiMatch = content.match(uiRegex);
if (uiMatch) {
    const uiHtml = uiMatch[0].replace('mt-4', 'mb-4');
    content = content.replace(uiRegex, '');
    const formRegex = /(<form onSubmit=\{handleSave\}>\s*<div className="p-6 space-y-6">)/;
    content = content.replace(formRegex, (m, g1) => g1 + uiHtml);
    console.log('UI block moved.');
} else {
    console.log('Could not find existing UI block to move.');
}

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('App.tsx updated using node.');
