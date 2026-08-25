import { IonModal } from '@ionic/react';
import { addProductToFirebase, bulkAddProductsToFirebase, generateUUID, getAllProductsFromFirebase, getMexicoISOString, softDeleteAllProductsFromFirebase, updateProductInFirebase } from 'utils/firestore';
const renderProductCrudModal = () => {
    const isEditing = !!productCrudModal.product;
    const p = productCrudModal.product;

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get("name") as string;
      const price = Number(formData.get("price"));
      const category = formData.get("category") as "food" | "drinks" | "desserts";
      const subcategory = formData.get("subcategory") as string;
      const subgroup = formData.get("subgroup") as string;
      const destination = formData.get("destination") as string;
      const reportName = formData.get("reportName") as string;
      const sortOrderRaw = formData.get("sortOrder");
      const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 9999;
      const description = formData.get("description") as string;

      if (!name || isNaN(price)) {
        triggerAppNotification("Error", "Nombre y precio son requeridos", "warning");
        return;
      }

      const nowTimestamp = getMexicoISOString().slice(0, 19).replace("T", " ");
      const data: any = {
        name,
        price,
        category,
        subcategory,
        subgroup,
        destination,
        description: description ? description.trim() : "",
        reportName: reportName ? reportName.trim() : "",
        sortOrder: isNaN(sortOrder) ? 9999 : sortOrder,
        quickNotes: crudQuickNotes,
        updated_at: nowTimestamp,
      };

      try {
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
              triggerAppNotification("Producto Actualizado", `${name} se actualiz� correctamente`, "success");
            } else {
              const newId = `prod_${Date.now()}`;
              await addProductToFirebase({
                ...data,
                id: newId,
                uuid: generateUUID(),
                created_at: nowTimestamp,
              });
              triggerAppNotification("Producto Creado", `${name} se agreg� al men�`, "success");
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
                   tenantsToUpdate.push({
  tId, matchedProduct,
  importSelectedTenantId,
  triggerAppNotification,
  setImportConfirmStep,
  newCrudQuickNoteText,
  importInProgressRef,
  COMPANY_CATALOG,
  setCrudQuickNotes,
  setRelationMatches,
  crudSelectedCategory,
  productCategories,
  setImportSelectedTenantId,
  products,
  productCrudModal,
  crudQuickNotes,
  selectedTenant,
  tenantPrinterConfig,
  setProductCrudModal,
  setNewCrudQuickNoteText,
  setIsImportingTenantMenu,
  setManageMenuTab
});
                 } else {
                   tenantsToAdd.push(tId);
                 }
              }
              
              if (tenantsToAdd.length > 0) {
                 const tNames = tenantsToAdd.map(tid => COMPANY_CATALOG.find((c:any) => c.id === tid)?.name || tid).join(', ');
                 const confirmAdd = window.confirm(`El producto "${name}" no existe en: ${tNames}.\n\n�Deseas agregarlo como nuevo en estas sucursales?`);
                 if (confirmAdd) {
                    for (const tId of tenantsToAdd) {
                       const newId = `prod_${tId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
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
                 triggerAppNotification("Proceso Completado", `Se actualizaron ${updatedCount} y se crearon ${createdCount} en las sucursales seleccionadas.`, "success");
              }
            } else {
              const confirmAdd = window.confirm(`�Seguro que deseas AGREGAR este nuevo producto a las ${selectedTenants.length} sucursales seleccionadas?`);
              if (confirmAdd) {
                for (const tId of selectedTenants) {
                   const newId = `prod_${tId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                   await addProductToFirebase({
                     ...data,
                     id: newId,
                     uuid: generateUUID(),
                     tenantId: tId,
                     created_at: nowTimestamp,
                   });
                   createdCount++;
                }
                triggerAppNotification("Productos Creados", `Se agregaron ${createdCount} productos a las sucursales seleccionadas.`, "success");
              }
            }
          }
setProductCrudModal({ isOpen: false, product: null });
      } catch (err) {
        console.error(err);
        triggerAppNotification("Error", "No se pudo guardar el producto", "warning");
      }
    };

    return (
      <IonModal
        isOpen={productCrudModal.isOpen}
        onDidDismiss={() => setProductCrudModal({ isOpen: false, product: null })}
        className="product-crud-modal"
        style={{
          "--height": "90%",
          "--width": "100%",
          "--max-width": "500px",
          "--border-radius": "28px",
        }}
      >
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
          <div className="p-6 bg-[#1e293b] text-white flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight m-0">
                {isEditing ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Panel de Administración de Menú
              </p>
            </div>
            <button 
              onClick={() => setProductCrudModal({ isOpen: false, product: null })}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all active:scale-95"
            >
              Cerrar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSave} className="space-y-5 pb-6">
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
                  (Usa Ctrl/Cmd para seleccionar varias). Solo afectar� a la sucursal actual si lo dejas vac�o.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Nombre del Platillo / Bebida</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={p?.name || ""}
                  required
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="Ej. Tacos de Pastor Especial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Precio ($)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={p?.price || ""}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Categoría</label>
                  <select
                    name="category"
                    defaultValue={p?.category || crudSelectedCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      const catObj = productCategories.find((c) => c.id === val);
                      if (catObj && catObj.destination) {
                        const form = e.target.form as HTMLFormElement;
                        const destSelect = form.elements.namedItem("destination") as HTMLSelectElement;
                        if (destSelect) destSelect.value = catObj.destination;
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.emoji || "🍽️"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Subcategoría</label>
                  <input
                    name="subcategory"
                    type="text"
                    defaultValue={p?.subcategory || "General"}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="Ej. Tacos"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Subgrupo / Variante</label>
                  <input
                    name="subgroup"
                    type="text"
                    defaultValue={p?.subgroup || ""}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="Ej. Pastor"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Descripción del Producto</label>
                <textarea
                  name="description"
                  defaultValue={p?.description || ""}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="Detalles del platillo (ingredientes, alérgenos, etc.)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Nombre para Reportes</label>
                  <input
                    name="reportName"
                    type="text"
                    defaultValue={p?.reportName || ""}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="Ej. TACO DE PASTOR DE MAÍZ"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Orden en Reportes</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={p?.sortOrder && p?.sortOrder !== 9999 ? p?.sortOrder : ""}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="9999"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Punto de Impresión (Área)</label>
                <select
                  name="destination"
                  defaultValue={p?.destination || (p?.category === "drinks" ? "barra" : "cocina")}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                >
                  {Object.keys(tenantPrinterConfig).map((areaKey) => {
                    const cfg = tenantPrinterConfig[areaKey];
                    return (
                      <option key={areaKey} value={areaKey}>
                        {cfg?.emoji || "🖨️"} {cfg?.name || areaKey}
                      </option>
                    );
                  })}
                  <option value="none">🚫 Sin impresión</option>
                </select>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase">Notas Rápidas (Modificadores)</label>
                <div className="flex flex-wrap gap-2">
                  {crudQuickNotes.map((note, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 border border-indigo-100">
                      {note}
                      <button type="button" onClick={() => setCrudQuickNotes(prev => prev.filter((_, i) => i !== idx))} className="text-indigo-300 hover:text-indigo-600">✕</button>
                    </span>
                  ))}
                  {crudQuickNotes.length === 0 && <span className="text-[10px] text-slate-400 font-bold italic">No hay notas agregadas</span>}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newCrudQuickNoteText}
                    onChange={(e) => setNewCrudQuickNoteText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Ej. Sin Cebolla"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCrudQuickNoteText.trim()) {
                          setCrudQuickNotes(prev => [...prev, newCrudQuickNoteText.trim()]);
                          setNewCrudQuickNoteText("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCrudQuickNoteText.trim()) {
                        setCrudQuickNotes(prev => [...prev, newCrudQuickNoteText.trim()]);
                        setNewCrudQuickNoteText("");
                      }
                    }}
                    className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-600/20 transition-all active:scale-95 uppercase tracking-widest text-sm mt-4 border-b-4 border-teal-800"
              >
                {isEditing ? "Guardar Cambios ✓" : "Registrar Producto ✓"}
              </button>
            </form>
          </div>
        </div>
      </IonModal>
    );
  };

  const handleImportTenantMenu = async () => {
    if (importInProgressRef.current) return;
    if (!importSelectedTenantId) {
      triggerAppNotification("Error ⚠️", "Por favor selecciona una sucursal origen.", "warning");
      return;
    }

    const sourceTenant = COMPANY_CATALOG.find((c) => c.id === importSelectedTenantId);
    const sourceTenantName = sourceTenant ? sourceTenant.name : importSelectedTenantId;

    importInProgressRef.current = true;
    setIsImportingTenantMenu(true);
    try {
      // 1. Delete destination products (and automatically back up under menu_backups collection!)
      const destBranchName = selectedTenant?.name || selectedTenant?.sucursalDefault || "Sucursal";
      await softDeleteAllProductsFromFirebase(selectedTenant.id, destBranchName, products);

      // 2. Fetch all products to get source products
      const allProducts = await getAllProductsFromFirebase();
      const sourceProductsRaw = allProducts.filter((p: any) => p.tenantId === importSelectedTenantId);

      if (sourceProductsRaw.length === 0) {
        triggerAppNotification("Advertencia ⚠️", "La sucursal origen seleccionada no contiene productos para importar.", "warning");
        setIsImportingTenantMenu(false);
        setImportConfirmStep(0);
        return;
      }

      // De-duplicate source products by name and category to clean up any existing database duplicates
      const seenKeys = new Set<string>();
      const sourceProducts: any[] = [];
      sourceProductsRaw.forEach((p: any) => {
        if (!p.name) return;
        const key = `${p.name.trim().toLowerCase()}_${p.category || ""}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          sourceProducts.push(p);
        }
      });

      // 3. Map to destination payload
      const productsToInsert = sourceProducts.map((p: any) => {
        const { id, uid, tenantId, sucursal, ...rest } = p;
        const newRawId = `prod_${selectedTenant.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        return {
          ...rest,
          id: newRawId,
          uid: newRawId,
          tenantId: selectedTenant.id,
          isDeleted: false,
          sucursal: selectedTenant.name || selectedTenant.sucursalDefault || "Sucursal"
        };
      });

      // 4. Save to Firebase
      await bulkAddProductsToFirebase(productsToInsert);

      // 5. Reset selection states and UI
      setImportSelectedTenantId("");
      setManageMenuTab(null);
      setImportConfirmStep(0);

      // Compute exact quantities per category
      const foodCount = productsToInsert.filter((p: any) => p.category === "food").length;
      const drinksCount = productsToInsert.filter((p: any) => p.category === "drinks").length;
      const dessertsCount = productsToInsert.filter((p: any) => p.category === "desserts").length;

      triggerAppNotification(
        "¡Éxito! 📥",
        `Se han importado exitosamente ${productsToInsert.length} productos desde "${sourceTenantName}" a la sucursal actual:
        🍔 ${foodCount} alimentos, 🥤 ${drinksCount} bebidas, 🍰 ${dessertsCount} postres.`,
        "success"
      );
    } catch (error: any) {
      console.error("Error al importar menú de otra sucursal:", error);
      triggerAppNotification("Error ❌", error.message || "Ocurrió un error inesperado durante la importación.", "warning");
    } finally {
      setIsImportingTenantMenu(false);
      importInProgressRef.current = false;
    }
  };

  