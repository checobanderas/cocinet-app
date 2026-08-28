import React from 'react';

import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';

import { closeOutline, saveOutline } from 'ionicons/icons';



interface ProductCrudModalProps {
  COMPANY_CATALOG: any;

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

  getAllProductsFromFirebase: () => Promise<void>;

  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;

  existing: any;
  existingSubcategories: any;
  existingSubgroups: any;
  setRelationMatches: any;
  tid: any;
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
  tenantPrinterConfig,
  allProducts,
  productCategories,
  generateUUID,
  getMexicoISOString,
  addProductToFirebase,
  updateProductInFirebase,
  getAllProductsFromFirebase,
  triggerAppNotification,
  existing, existingSubcategories, existingSubgroups, setRelationMatches, tid,
  COMPANY_CATALOG
}) => {
    const isEditing = !!productCrudModal.product;

    const p = productCrudModal.product;



    const handleSave = async (e: React.FormEvent) => {

      e.preventDefault();

      const formDataObj = new FormData(e.target as HTMLFormElement);

      const selectedTenants = formDataObj.getAll('targetTenants') as string[];

      

      const name = formDataObj.get("name") as string;

      const price = Number(formDataObj.get("price"));

      const category = formDataObj.get("category") as "food" | "drinks" | "desserts";

      const subcategory = formDataObj.get("subcategory") as string;

      const subgroup = formDataObj.get("subgroup") as string;

      const destination = formDataObj.get("destination") as string;

      const reportName = formDataObj.get("reportName") as string;

      const sortOrderRaw = formDataObj.get("sortOrder");

      const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 9999;

      const description = formDataObj.get("description") as string;



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

              triggerAppNotification("Producto Actualizado", `${name} se actualizó correctamente`, "success");

            } else {

              const newId = `prod_${Date.now()}`;

              await addProductToFirebase({

                ...data,

                id: newId,

                uuid: generateUUID(),

                created_at: nowTimestamp,

              });

              triggerAppNotification("Producto Creado", `${name} se agregó al men�`, "success");

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

                 const confirmAdd = window.confirm(`El producto "${name}" no existe en: ${tNames}.\n\n¿Deseas agregarlo como nuevo en estas sucursales?`);

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

              const confirmAdd = window.confirm(`¿Seguro que deseas AGREGAR este nuevo producto a las ${selectedTenants.length} sucursales seleccionadas?`);

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

          "--height": "95%",

          "--width": "100%",

          "--max-width": "1000px",

          "--border-radius": "28px",

        }}

      >

        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">

          <div className="p-6 bg-[#1e293b] text-white flex justify-between items-center shrink-0">

            <div>

              <h2 className="text-xl font-black uppercase tracking-tight m-0">

                {isEditing ? "?? Editar Producto" : "? Nuevo Producto"}

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



          <div className="flex-1 overflow-hidden p-0">

            <form onSubmit={handleSave} className="flex flex-col md:flex-row h-full">

              {/* Left Column: Tenants Grouped by Owner */}

              <div className="w-full md:w-2/5 bg-slate-100 border-r border-slate-200 p-6 overflow-y-auto h-full">

                <div className="mb-4">

                  <label className="block text-[12px] font-black text-slate-600 uppercase">

                    ?? Replicar en Sucursales

                  </label>

                  <p className="text-[10px] text-slate-500 font-bold mt-1">

                    (Opcional) Selecciona d�nde aplicarás los cambios. Deja vacío para aplicar solo en la sucursal actual.

                  </p>

                </div>

                

                <div className="space-y-4 pb-10">

                  {Array.from(new Set(COMPANY_CATALOG.map(c => c.ownerKey))).map(ownerKey => {

                    const ownerBranches = COMPANY_CATALOG.filter(c => c.ownerKey === ownerKey);

                    if (ownerBranches.length === 0) return null;

                    return (

                      <div key={ownerKey || "default"} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">

                        <div className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-2 inline-block truncate max-w-full">

                          PROPIETARIO: {ownerKey || "N/A"}

                        </div>

                        <div className="space-y-1.5 pl-1">

                          {ownerBranches.map((t) => (

                            <label key={t.id} className="flex items-center gap-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 p-1.5 rounded cursor-pointer transition-colors">

                              <input type="checkbox" name="targetTenants" value={t.id} className="w-4 h-4 accent-indigo-600" />

                              <span className="truncate">{t.emoji || '??'} {t.name}</span>

                            </label>

                          ))}

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>



              {/* Right Column: Edit Form */}

              <div className="w-full md:w-3/5 p-6 space-y-5 overflow-y-auto h-full pb-20">

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

                    <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Categor�a</label>

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

                          {cat.name} {cat.emoji || "???"}

                        </option>

                      ))}

                    </select>

                  </div>

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-1.5">

                    <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Subcategor�a</label>

                    <input

                      name="subcategory"

                      type="text"

                      defaultValue={p?.subcategory || ""}

                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"

                      placeholder="Ej. Tacos"

                      list="existing-subcategories"

                    />

                    <datalist id="existing-subcategories">

                      {existingSubcategories.map((sc, i) => (

                        <option key={i} value={sc} />

                      ))}

                    </datalist>

                  </div>

                  <div className="space-y-1.5">

                    <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Subgrupo / Variante</label>

                    <input

                      name="subgroup"

                      type="text"

                      defaultValue={p?.subgroup || ""}

                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"

                      placeholder="Ej. Porciones 1kg"

                      list="existing-subgroups"

                    />

                    <datalist id="existing-subgroups">

                      {existingSubgroups.map((sg, i) => (

                        <option key={i} value={sg} />

                      ))}

                    </datalist>

                  </div>

                </div>



                <div className="space-y-1.5">

                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Descripci�n del Producto</label>

                  <textarea

                    name="description"

                    defaultValue={p?.description || ""}

                    rows={3}

                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm resize-y"

                    placeholder="Detalles del platillo (ingredientes, al�rgenos, etc.)"

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

                      placeholder="Ej. TACO DE PASTOR DE MAIZ"

                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Orden en Reportes</label>

                    <input

                      name="sortOrder"

                      type="number"

                      defaultValue={p?.sortOrder === 9999 ? "" : p?.sortOrder}

                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"

                      placeholder="9999"

                    />

                  </div>

                </div>



                <div className="space-y-1.5">

                  <label className="block text-[11px] font-black text-slate-500 uppercase ml-1">Punto de Impresi�n (�rea)</label>

                  <select

                    name="destination"

                    defaultValue={p?.destination || "Cocina"}

                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"

                  >

                    {Object.keys(tenantPrinterConfig).map((areaKey) => {

                      const cfg = tenantPrinterConfig[areaKey];

                      return (

                        <option key={areaKey} value={areaKey}>

                          {cfg?.emoji || "???"} {cfg?.name || areaKey}

                        </option>

                      );

                    })}

                    <option value="none">?? Sin impresi�n</option>

                  </select>

                </div>



                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">

                  <label className="block text-[11px] font-black text-slate-500 uppercase">Notas R�pidas (Modificadores)</label>

                  <div className="flex flex-wrap gap-2">

                    {crudQuickNotes.map((note, idx) => (

                      <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 border border-indigo-100">

                        {note}

                        <button type="button" onClick={() => setCrudQuickNotes(prev => prev.filter((_, i) => i !== idx))} className="text-indigo-300 hover:text-indigo-600">?</button>

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

                  {isEditing ? "Guardar Cambios ?" : "Registrar Producto ?"}

                </button>

              </div>

            </form>

          </div>

        </div>

      </IonModal>

    );
};
