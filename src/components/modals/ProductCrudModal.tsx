import React, { useState, useEffect } from 'react';
import { IonModal } from '@ionic/react';

interface ProductCrudModalProps {
  COMPANY_CATALOG: any[];
  productCrudModal: any;
  setProductCrudModal: (v: any) => void;
  crudSelectedCategory: string;
  crudQuickNotes: string[];
  setCrudQuickNotes: (v: string[] | ((prev: string[]) => string[])) => void;
  newCrudQuickNoteText: string;
  setNewCrudQuickNoteText: (v: string) => void;
  ownerBranches: any[];
  tenantPrinterConfig: any;
  allProducts: any[];
  productCategories: any[];
  generateUUID: () => string;
  getMexicoISOString: () => string;
  addProductToFirebase: (prod: any) => Promise<void>;
  updateProductInFirebase: (tenantId: string, prodId: string, updates: any) => Promise<void>;
  getAllProductsFromFirebase: () => Promise<any[]>;
  triggerAppNotification: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  existing?: any;
  existingSubcategories: any[];
  existingSubgroups: any[];
  setRelationMatches?: any;
  tid?: any;
  selectedTenant?: any;
  customOwners?: any[];
  activeOwnerFilter?: any;
  restrictedOwnerKey?: any;
}

export const ProductCrudModal: React.FC<ProductCrudModalProps> = ({
  productCrudModal,
  setProductCrudModal,
  crudSelectedCategory,
  crudQuickNotes,
  setCrudQuickNotes,
  newCrudQuickNoteText,
  setNewCrudQuickNoteText,
  ownerBranches,
  tenantPrinterConfig = {},
  allProducts = [],
  productCategories = [],
  generateUUID,
  getMexicoISOString,
  addProductToFirebase,
  updateProductInFirebase,
  getAllProductsFromFirebase,
  triggerAppNotification,
  existingSubcategories = [],
  existingSubgroups = [],
  setRelationMatches,
  COMPANY_CATALOG = [],
  selectedTenant,
  customOwners = [],
  activeOwnerFilter,
  restrictedOwnerKey,
}) => {
  const isEditing = !!productCrudModal.product;
  const p = productCrudModal.product;

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Determine current active owner key and relevant branches
  const currentOwnerKey =
    selectedTenant?.ownerKey ||
    activeOwnerFilter ||
    restrictedOwnerKey ||
    (selectedTenant?.id && COMPANY_CATALOG.find((c: any) => c.id === selectedTenant.id)?.ownerKey) ||
    "1";

  const ownerObj = customOwners.find((o: any) => o.key === currentOwnerKey) || {
    name: selectedTenant?.propietario || selectedTenant?.name || `Propietario #${currentOwnerKey}`,
    avatar: selectedTenant?.avatar || "👑",
    key: currentOwnerKey
  };

  // Only show branches that belong strictly to the current owner
  const currentOwnerBranches = COMPANY_CATALOG.filter((c: any) => c.ownerKey === currentOwnerKey);
  const relevantBranches = currentOwnerBranches.length > 0 ? currentOwnerBranches : (ownerBranches || []);

  const currentTenantId = selectedTenant?.id || (relevantBranches[0]?.id) || "";

  // Selected target branches state: by default, current sucursal is ALWAYS pre-selected
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  useEffect(() => {
    if (productCrudModal.isOpen) {
      if (currentTenantId) {
        setSelectedTenants([currentTenantId]);
      } else if (relevantBranches.length > 0) {
        setSelectedTenants([relevantBranches[0].id]);
      } else {
        setSelectedTenants([]);
      }
    }
  }, [productCrudModal.isOpen, currentTenantId]);

  const toggleTenant = (tenantId: string) => {
    setSelectedTenants((prev) =>
      prev.includes(tenantId) ? prev.filter((id) => id !== tenantId) : [...prev, tenantId]
    );
  };

  const selectAllOwnerBranches = () => {
    setSelectedTenants(relevantBranches.map((b: any) => b.id));
  };

  const selectOnlyCurrentBranch = () => {
    if (currentTenantId) {
      setSelectedTenants([currentTenantId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const formDataObj = new FormData(e.target as HTMLFormElement);

    const name = (formDataObj.get("name") as string)?.trim();
    const price = Number(formDataObj.get("price"));
    const category = formDataObj.get("category") as string;
    const subcategory = (formDataObj.get("subcategory") as string)?.trim() || "";
    const subgroup = (formDataObj.get("subgroup") as string)?.trim() || "";
    const destination = (formDataObj.get("destination") as string) || "Cocina";
    const reportName = (formDataObj.get("reportName") as string)?.trim() || "";
    const sortOrderRaw = formDataObj.get("sortOrder");
    const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 9999;
    const description = (formDataObj.get("description") as string)?.trim() || "";

    if (!name || isNaN(price)) {
      triggerAppNotification("⚠️ Error", "El nombre y el precio del platillo son requeridos.", "warning");
      return;
    }

    // Determine target branches to apply
    const targetsToApply = selectedTenants.length > 0 ? selectedTenants : (currentTenantId ? [currentTenantId] : []);

    const nowTimestamp = getMexicoISOString().slice(0, 19).replace("T", " ");

    const data: any = {
      name,
      price,
      category,
      subcategory,
      subgroup,
      destination,
      description,
      reportName,
      sortOrder: isNaN(sortOrder) ? 9999 : sortOrder,
      quickNotes: crudQuickNotes || [],
      updated_at: nowTimestamp,
    };

    setIsSaving(true);

    try {
      if (targetsToApply.length <= 1 && (!targetsToApply[0] || targetsToApply[0] === currentTenantId)) {
        // Single branch (current) update
        if (isEditing && p) {
          await updateProductInFirebase(p.id, { ...data, tenantId: currentTenantId });
          if (setRelationMatches) {
            setRelationMatches((prev: any[]) =>
              prev.map((m: any) =>
                m.productId === p.id
                  ? {
                      ...m,
                      proposedReportName: data.reportName || m.proposedReportName,
                      proposedSortOrder: data.sortOrder === 9999 ? m.proposedSortOrder : data.sortOrder,
                      proposedDescription: data.description || m.proposedDescription,
                      proposedSubgroup: data.subgroup || m.proposedSubgroup,
                    }
                  : m
              )
            );
          }
          triggerAppNotification("✅ Producto Actualizado", `${name} se actualizó correctamente en ${selectedTenant?.name || "esta sucursal"}.`, "success");
        } else {
          const newId = `prod_${currentTenantId || "t"}_${Date.now()}`;
          await addProductToFirebase({
            ...data,
            id: newId,
            uuid: generateUUID(),
            tenantId: currentTenantId,
            created_at: nowTimestamp,
          });
          triggerAppNotification("✅ Producto Creado", `${name} se agregó al menú de ${selectedTenant?.name || "esta sucursal"}.`, "success");
        }
      } else {
        // Multiple owner branches replication
        const allProdsFromFb = (await getAllProductsFromFirebase()) || [];
        let createdCount = 0;
        let updatedCount = 0;

        const tenantsToUpdate: { tId: string; matchedProduct: any }[] = [];
        const tenantsToAdd: string[] = [];

        for (const tId of targetsToApply) {
          const matched = allProdsFromFb.find(
            (prod: any) => prod.tenantId === tId && prod.name?.trim().toLowerCase() === name.toLowerCase()
          );
          if (matched) {
            tenantsToUpdate.push({ tId, matchedProduct: matched });
          } else {
            tenantsToAdd.push(tId);
          }
        }

        // Execute all updates and additions in parallel for maximum speed
        await Promise.all([
          ...tenantsToUpdate.map(async (item) => {
            await updateProductInFirebase(item.matchedProduct.id, { ...data, tenantId: item.tId });
            updatedCount++;
          }),
          ...tenantsToAdd.map(async (tId) => {
            const newId = `prod_${tId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await addProductToFirebase({
              ...data,
              id: newId,
              uuid: generateUUID(),
              tenantId: tId,
              created_at: nowTimestamp,
            });
            createdCount++;
          }),
        ]);

        triggerAppNotification(
          "✅ Proceso Completado",
          `Se aplicó "${name}" en ${targetsToApply.length} sucursales (${updatedCount} actualizadas, ${createdCount} creadas).`,
          "success"
        );
      }

      setProductCrudModal({ isOpen: false, product: null });
    } catch (err) {
      console.error("Error saving product:", err);
      triggerAppNotification("❌ Error", "No se pudo guardar el producto. Intente nuevamente.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonModal
      isOpen={productCrudModal.isOpen}
      onDidDismiss={() => {
        if (!isSaving) {
          setProductCrudModal({ isOpen: false, product: null });
        }
      }}
      className="product-crud-modal"
      style={{
        "--height": "95%",
        "--width": "100%",
        "--max-width": "1000px",
        "--border-radius": "28px",
      }}
    >
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative select-none font-sans">
        {/* Saving / Processing Overlay */}
        {isSaving && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-3xl text-white space-y-4 animate-fade-in">
            <div className="w-14 h-14 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black tracking-wide uppercase m-0">Procesando cambios... ⏳</h3>
              <p className="text-xs text-slate-200 font-semibold m-0">Guardando en las sucursales seleccionadas, por favor espere.</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 bg-[#1e293b] text-white flex justify-between items-center shrink-0 border-b border-slate-700/60">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight m-0 flex items-center gap-2">
              {isEditing ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 m-0">
              Administración de Menú • {selectedTenant?.name || "Sucursal Activa"}
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => setProductCrudModal({ isOpen: false, product: null })}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all active:scale-95 cursor-pointer border-none text-white"
          >
            Cerrar ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-0">
          <form onSubmit={handleSave} className="flex flex-col md:flex-row h-full">
            {/* Left Column: ONLY CURRENT OWNER & THEIR BRANCHES */}
            <div className="w-full md:w-2/5 bg-slate-100 border-r border-slate-200 p-5 overflow-y-auto h-full space-y-4">
              <div>
                <label className="block text-[12px] font-black text-slate-700 uppercase tracking-wider">
                  🏢 Aplicar a Sucursales
                </label>
                <p className="text-[10.5px] text-slate-500 font-medium mt-1 leading-snug">
                  Selecciona en qué sucursales de este propietario se guardará este cambio de menú:
                </p>
              </div>

              {/* Owner Group Container */}
              <div className="bg-white p-4 rounded-2xl border border-slate-250 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ownerObj.avatar || "👑"}</span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-tight m-0 leading-tight">
                        {ownerObj.name}
                      </h4>
                      <span className="text-[9.5px] font-bold text-indigo-600 uppercase">
                        Grupo Patrón #{currentOwnerKey}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick select buttons */}
                {relevantBranches.length > 1 && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={selectAllOwnerBranches}
                      className="flex-1 py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-lg transition-colors border border-indigo-200/60 cursor-pointer"
                    >
                      ✓ Todas ({relevantBranches.length})
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={selectOnlyCurrentBranch}
                      className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    >
                      Solo Actual 📍
                    </button>
                  </div>
                )}

                {/* List of Owner's Branches */}
                <div className="space-y-1.5 pt-1">
                  {relevantBranches.map((t: any) => {
                    const isCurrent = t.id === currentTenantId;
                    const isChecked = selectedTenants.includes(t.id);

                    return (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between gap-2 text-[11px] font-bold p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isChecked
                            ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs"
                            : "bg-slate-50/60 hover:bg-slate-100 border-slate-200/70 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            disabled={isSaving}
                            checked={isChecked}
                            onChange={() => toggleTenant(t.id)}
                            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                          />
                          <span className="truncate font-black">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrent && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase">
                              Actual
                            </span>
                          )}
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            {t.type === "Matriz" ? "Matriz 🏡" : "Sucursal 📍"}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10.5px] text-amber-900 font-semibold leading-relaxed">
                💡 <b>Nota:</b> El cambio se aplicará únicamente a las <b>{selectedTenants.length}</b> sucursales marcadas arriba.
              </div>
            </div>

            {/* Right Column: Edit Product Form */}
            <div className="w-full md:w-3/5 p-6 space-y-4 overflow-y-auto h-full pb-20 text-left">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Nombre del Platillo / Bebida *
                </label>
                <input
                  name="name"
                  type="text"
                  disabled={isSaving}
                  defaultValue={p?.name || ""}
                  required
                  className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                  placeholder="Ej. Tacos de Pastor Especial"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Precio ($) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    disabled={isSaving}
                    defaultValue={p?.price || ""}
                    required
                    className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    disabled={isSaving}
                    defaultValue={p?.category || crudSelectedCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      const catObj = productCategories.find((c: any) => c.id === val);
                      if (catObj && catObj.destination) {
                        const form = e.target.form as HTMLFormElement;
                        const destSelect = form?.elements?.namedItem("destination") as HTMLSelectElement;
                        if (destSelect) destSelect.value = catObj.destination;
                      }
                    }}
                    className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs cursor-pointer"
                  >
                    {productCategories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.emoji || ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory & Subgroup */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Subcategoría
                  </label>
                  <input
                    name="subcategory"
                    type="text"
                    disabled={isSaving}
                    defaultValue={p?.subcategory || ""}
                    className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                    placeholder="Ej. Tacos"
                    list="existing-subcategories"
                  />
                  <datalist id="existing-subcategories">
                    {existingSubcategories.map((sc: string, i: number) => (
                      <option key={i} value={sc} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Subgrupo / Variante
                  </label>
                  <input
                    name="subgroup"
                    type="text"
                    disabled={isSaving}
                    defaultValue={p?.subgroup || ""}
                    className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                    placeholder="Ej. Porciones 1kg"
                    list="existing-subgroups"
                  />
                  <datalist id="existing-subgroups">
                    {existingSubgroups.map((sg: string, i: number) => (
                      <option key={i} value={sg} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Descripción del Platillo
                </label>
                <textarea
                  name="description"
                  disabled={isSaving}
                  defaultValue={p?.description || ""}
                  rows={2}
                  className="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs resize-y"
                  placeholder="Detalles del platillo (ingredientes, alérgenos, etc.)"
                />
              </div>

              {/* Report Name & Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Nombre para Reportes
                  </label>
                  <input
                    name="reportName"
                    type="text"
                    disabled={isSaving}
                    defaultValue={p?.reportName || ""}
                    className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                    placeholder="Ej. TACO DE PASTOR DE MAIZ"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Orden en Reportes
                  </label>
                  <input
                    name="sortOrder"
                    type="number"
                    disabled={isSaving}
                    defaultValue={p?.sortOrder === 9999 ? "" : p?.sortOrder}
                    className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                    placeholder="9999"
                  />
                </div>
              </div>

              {/* Print Destination */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Punto de Impresión (Área)
                </label>
                <select
                  name="destination"
                  disabled={isSaving}
                  defaultValue={p?.destination || "Cocina"}
                  className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs cursor-pointer"
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

              {/* Quick Notes / Modifiers */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  Notas Rápidas (Modificadores)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {crudQuickNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-indigo-100"
                    >
                      {note}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => setCrudQuickNotes((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-indigo-700 font-bold bg-transparent border-none cursor-pointer p-0 ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {crudQuickNotes.length === 0 && (
                    <span className="text-[10px] text-slate-400 font-bold italic">No hay notas rápidas agregadas</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    disabled={isSaving}
                    value={newCrudQuickNoteText}
                    onChange={(e) => setNewCrudQuickNoteText(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Ej. Sin Cebolla"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCrudQuickNoteText.trim()) {
                          setCrudQuickNotes((prev) => [...prev, newCrudQuickNoteText.trim()]);
                          setNewCrudQuickNoteText("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      if (newCrudQuickNoteText.trim()) {
                        setCrudQuickNotes((prev) => [...prev, newCrudQuickNoteText.trim()]);
                        setNewCrudQuickNoteText("");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer border-none"
                  >
                    Añadir ➕
                  </button>
                </div>
              </div>

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-4 rounded-2xl shadow-lg transition-all active:scale-98 uppercase tracking-widest text-xs font-black mt-3 border-none flex items-center justify-center gap-2 ${
                  isSaving
                    ? "bg-indigo-400 text-white cursor-not-allowed shadow-none"
                    : "bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-teal-600/20"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando cambios, por favor espere... ⏳</span>
                  </>
                ) : (
                  <>
                    <span>{isEditing ? "Guardar Cambios 💾" : "Registrar Producto ➕"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </IonModal>
  );
};
