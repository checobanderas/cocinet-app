import re

with open('src/components/views/GestionCuentasView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add states for edit mode
code = code.replace(
    'return (',
    '''
  const [isEditingLayout, setIsEditingLayout] = React.useState(false);
  const isPrivileged = currentUser?.role && currentUser.role !== "cajero" && currentUser.role !== "mesero";

  const layoutConfig = companyConfig?.tableLayoutSettings || {};
  const orderedZones = [...zones].sort((a, b) => {
    const idxA = layoutConfig.zoneOrder?.indexOf(a) ?? 99;
    const idxB = layoutConfig.zoneOrder?.indexOf(b) ?? 99;
    return idxA - idxB;
  });

  const handleMoveZone = (zone: string, dir: number) => {
    const currentOrder = layoutConfig.zoneOrder || [...zones];
    const newOrder = [...new Set([...currentOrder, ...zones])];
    const idx = newOrder.indexOf(zone);
    if (idx === -1) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    updateCompanyConfig?.({
      tableLayoutSettings: { ...layoutConfig, zoneOrder: newOrder }
    });
  };

  const handleChangeTableCount = (zone: string, delta: number) => {
    const defaultCount = effectiveTables.filter((t: any) => t.zone === zone).length;
    const currentCount = layoutConfig.zoneCounts?.[zone] ?? defaultCount;
    const newCount = Math.max(1, currentCount + delta);
    
    updateCompanyConfig?.({
      tableLayoutSettings: { 
        ...layoutConfig, 
        zoneCounts: { ...(layoutConfig.zoneCounts || {}), [zone]: newCount } 
      }
    });
  };

  return (
'''
)

code = code.replace(
    'style={{ height: "100%", overflowY: "auto", padding: "0.75rem" }}',
    'style={{ height: "100%", overflowY: "auto", padding: "0.75rem", background: "#f8fafc" }}'
)

header_pattern = r'\{\/\*\s*Header\s*\*\/.*?\}\/\*\s*Zones\s*\*\/\s*\{zones\.map\(\(zone\)\s*=>\s*\('

new_header = r'''
                    {/* Header: Modo Edicion */}
                    {isPrivileged && (
                      <div className="flex justify-end mb-3">
                        <button 
                          onClick={() => setIsEditingLayout(!isEditingLayout)}
                          className={px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm border }
                        >
                          <i className={a-solid  mr-1}></i>
                          {isEditingLayout ? 'Terminar Edicion' : 'Editar Layout'}
                        </button>
                      </div>
                    )}

                    {/* Zones */}
                    {orderedZones.map((zone: string, zIdx: number) => (
'''
code = re.sub(header_pattern, lambda m: new_header, code, flags=re.DOTALL)

zone_title_pattern = r'(\{\/\*\s*auto-fill grid so columns scale with the panel width\s*\*\/)'

new_zone_title = r'''
                        {isEditingLayout && (
                          <div className="flex items-center gap-2 mb-2 ml-1">
                            <button onClick={() => handleMoveZone(zone, -1)} disabled={zIdx === 0} className="w-6 h-6 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-50 cursor-pointer flex items-center justify-center"><i className="fa-solid fa-arrow-up text-[10px]"></i></button>
                            <button onClick={() => handleMoveZone(zone, 1)} disabled={zIdx === orderedZones.length - 1} className="w-6 h-6 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-50 cursor-pointer flex items-center justify-center"><i className="fa-solid fa-arrow-down text-[10px]"></i></button>
                            
                            <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
                            
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mesas:</span>
                            <button onClick={() => handleChangeTableCount(zone, -1)} className="w-6 h-6 rounded bg-rose-100 text-rose-600 hover:bg-rose-200 cursor-pointer flex items-center justify-center font-bold">-</button>
                            <span className="text-xs font-black text-slate-700 w-4 text-center">{layoutConfig.zoneCounts?.[zone] ?? effectiveTables.filter((t: any) => t.zone === zone).length}</span>
                            <button onClick={() => handleChangeTableCount(zone, 1)} className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 cursor-pointer flex items-center justify-center font-bold">+</button>
                          </div>
                        )}
                        \1
'''
code = re.sub(zone_title_pattern, lambda m: new_zone_title.replace('\\1', m.group(1)), code)

filter_pattern = r'effectiveTables\s*\n\s*\.filter\(\(t\)\s*=>\s*t\.zone\s*===\s*zone\)\s*\n\s*\.sort\(\(a,\s*b\)\s*=>\s*\{'

new_filter = r'''(() => {
                              let tablesInZone = effectiveTables.filter((t: any) => t.zone === zone);
                              
                              tablesInZone.sort((a: any, b: any) => {
'''
code = re.sub(filter_pattern, lambda m: new_filter, code)

sort_end_pattern = r'return\s*a\.label\.localeCompare\(b\.label\);\s*\n\s*\}\)'

new_sort_end = r'''return a.label.localeCompare(b.label);
                              });
                              
                              const configuredCount = layoutConfig.zoneCounts?.[zone];
                              if (configuredCount !== undefined) {
                                // If they want less tables, we hide them, UNLESS they are occupied
                                if (configuredCount < tablesInZone.length) {
                                  // Keep occupied tables visible no matter what
                                  const occupied = tablesInZone.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
                                  const empty = tablesInZone.filter((t: any) => t.status !== "occupied" && (!t.comandas || t.comandas.length === 0));
                                  
                                  // We take all occupied ones, and then fill the rest with empty ones up to configuredCount
                                  const remainingSlots = Math.max(0, configuredCount - occupied.length);
                                  tablesInZone = [...occupied, ...empty.slice(0, remainingSlots)];
                                  
                                  // re-sort them so they display correctly
                                  tablesInZone.sort((a: any, b: any) => {
                                    const numA = parseInt(a.label.replace(/\D/g, ""), 10) || 0;
                                    const numB = parseInt(b.label.replace(/\D/g, ""), 10) || 0;
                                    if (numA !== numB) return numA - numB;
                                    return a.label.localeCompare(b.label);
                                  });
                                } 
                                // If they want more tables, we generate mock tables for the UI
                                else if (configuredCount > tablesInZone.length) {
                                  const diff = configuredCount - tablesInZone.length;
                                  const lastTable = tablesInZone[tablesInZone.length - 1];
                                  const prefix = lastTable?.label.replace(/[0-9]/g, '') || (zone === 'Para Llevar' ? 'P' : (zone === 'Servicio a Domicilio' ? 'D' : ''));
                                  
                                  for (let i = 1; i <= diff; i++) {
                                    const newNum = tablesInZone.length + i;
                                    tablesInZone.push({
                                      id: 	able---,
                                      uid: 	able---,
                                      label: ${prefix},
                                      zone: zone,
                                      status: "available",
                                      comandas: [],
                                      tenantId: selectedTenant?.id,
                                      shape: lastTable?.shape || 'local',
                                      _isMock: true // Flag to know it doesn't exist in DB yet
                                    });
                                  }
                                }
                              }
                              return tablesInZone;
                            })()'''

code = re.sub(sort_end_pattern, lambda m: new_sort_end, code)

code = code.replace('color: "#94a3b8",', 'color: "#64748b",')

with open('src/components/views/GestionCuentasView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
