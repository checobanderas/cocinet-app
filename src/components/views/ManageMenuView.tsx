import { addProductToFirebase, createMenuBackup, deleteMenuBackupFromFirebase, deleteProductFromFirebase, exportFullDatabaseJson, generateUUID, getAllMenuBackupsFromFirebase, getAllProductsFromFirebase, getMexicoISOString, importFullDatabaseJson, migrateBackupsTenant, migrateProductsTenant, restoreMenuBackupInFirebase, updateProductInFirebase } from '../../utils/firestore';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner, IonText } from '@ionic/react';
import { addOutline, cloudUploadOutline, imageOutline, restaurantOutline, syncOutline, trashOutline } from 'ionicons/icons';

interface ManageMenuViewProps {
  COMPANY_CATALOG: any;
  analysisStatus: any;
  backups: any;
  bulkSubcategory: any;
  bulkSubgroup: any;
  collapsedTreeSections: any;
  collapsedTreeSubgroups: any;
  currentUser: any;
  customApiKey: any;
  customAppId: any;
  customAuthDomain: any;
  customDbId: any;
  customProjectId: any;
  detectedProducts: any;
  diagnosticBackups: any;
  diagnosticProducts: any;
  diagnosticRunCount: any;
  draggedIndex: any;
  draggedOverIndex: any;
  editingNoteProductId: any;
  editingNoteText: any;
  enableBackupNotifications: any;
  handleAddProductsToMenu: any;
  handleDragEnd: any;
  handleDragOver: any;
  handleDragStart: any;
  handleDrop: any;
  handleExcelUpload: any;
  handleGenerateAdHocNotes: any;
  handleImportTenantMenu: any;
  handleMenuImageUpload: any;
  handleResetMenuAndRefill: any;
  handleTreeDragOver: any;
  handleTreeDragStart: any;
  handleTreeDrop: any;
  iaNotesError: any;
  iaNotesLoading: any;
  importConfirmStep: any;
  importSelectedTenantId: any;
  inventory: any;
  isAddingProducts: any;
  isAnalyzing: any;
  isDiagnosticRunning: any;
  isImportingTenantMenu: any;
  isMasterAdmin: any;
  manageMenuTab: any;
  manageMenuViewMode: any;
  menuFilterNode: any;
  menuImages: any;
  menuSearchQuery: any;
  newBackupName: any;
  productCategories: any;
  productSearch: any;
  products: any;
  relationMatches: any;
  relationSearch: any;
  renderMaterialHeader: any;
  selectedRecipeProduct: any;
  selectedRelationProductIds: any;
  selectedTenant: any;
  setAppMode: any;
  setBulkSubcategory: any;
  setBulkSubgroup: any;
  setCrudQuickNotes: any;
  setCustomApiKey: any;
  setCustomAppId: any;
  setCustomAuthDomain: any;
  setCustomDbId: any;
  setCustomProjectId: any;
  setDeleteConfirmation: any;
  setDetectedProducts: any;
  setDiagnosticBackups: any;
  setDiagnosticProducts: any;
  setDiagnosticRunCount: any;
  setEditingNoteProductId: any;
  setEditingNoteText: any;
  setEnableBackupNotifications: any;
  setImportConfirmStep: any;
  setImportSelectedTenantId: any;
  setIsDiagnosticRunning: any;
  setManageMenuTab: any;
  setManageMenuViewMode: any;
  setMenuFilterNode: any;
  setMenuImages: any;
  setMenuSearchQuery: any;
  setNewBackupName: any;
  setProductCrudModal: any;
  setProductSearch: any;
  setRelationLog: any;
  setRelationMatches: any;
  setRelationSearch: any;
  setSelectedRecipeProduct: any;
  setSelectedRelationProductIds: any;
  setShowCustomConfig: any;
  setShowDeletedProducts: any;
  setShowRecipeAddModal: any;
  setSplitDeletedOriginal: any;
  setSplitProposedItems: any;
  setSplitSelectedProductId: any;
  setWebsocketSyncLog: any;
  showCustomConfig: any;
  showDeletedProducts: any;
  splitDeletedOriginal: any;
  splitProposedItems: any;
  splitSelectedProductId: any;
  treeDragOverTargetKey: any;
  triggerAppNotification: any;
  analyzeMenuImage: any;
  applyBulkCaseToggle: any;
  applyBulkSubcategory: any;
  applyBulkSubgroup: any;
  collapseAllTreeNodes: any;
  expandAllTreeNodes: any;
  loadAutoFormattedList: any;
  moveSelectedDown: any;
  moveSelectedToBottom: any;
  moveSelectedToTop: any;
  moveSelectedUp: any;
  parseSplitProducts: any;
  saveRelationChanges: any;
  toggleTextCase: any;
  toggleTreeSectionCollapse: any;
  toggleTreeSubgroupCollapse: any;
}

export const ManageMenuView: React.FC<ManageMenuViewProps> = ({
  COMPANY_CATALOG,
  analysisStatus,
  backups,
  bulkSubcategory,
  bulkSubgroup,
  collapsedTreeSections,
  collapsedTreeSubgroups,
  currentUser,
  customApiKey,
  customAppId,
  customAuthDomain,
  customDbId,
  customProjectId,
  detectedProducts,
  diagnosticBackups,
  diagnosticProducts,
  diagnosticRunCount,
  draggedIndex,
  draggedOverIndex,
  editingNoteProductId,
  editingNoteText,
  enableBackupNotifications,
  handleAddProductsToMenu,
  handleDragEnd,
  handleDragOver,
  handleDragStart,
  handleDrop,
  handleExcelUpload,
  handleGenerateAdHocNotes,
  handleImportTenantMenu,
  handleMenuImageUpload,
  handleResetMenuAndRefill,
  handleTreeDragOver,
  handleTreeDragStart,
  handleTreeDrop,
  iaNotesError,
  iaNotesLoading,
  importConfirmStep,
  importSelectedTenantId,
  inventory,
  isAddingProducts,
  isAnalyzing,
  isDiagnosticRunning,
  isImportingTenantMenu,
  isMasterAdmin,
  manageMenuTab,
  manageMenuViewMode,
  menuFilterNode,
  menuImages,
  menuSearchQuery,
  newBackupName,
  productCategories,
  productSearch,
  products,
  relationMatches,
  relationSearch,
  renderMaterialHeader,
  selectedRecipeProduct,
  selectedRelationProductIds,
  selectedTenant,
  setAppMode,
  setBulkSubcategory,
  setBulkSubgroup,
  setCrudQuickNotes,
  setCustomApiKey,
  setCustomAppId,
  setCustomAuthDomain,
  setCustomDbId,
  setCustomProjectId,
  setDeleteConfirmation,
  setDetectedProducts,
  setDiagnosticBackups,
  setDiagnosticProducts,
  setDiagnosticRunCount,
  setEditingNoteProductId,
  setEditingNoteText,
  setEnableBackupNotifications,
  setImportConfirmStep,
  setImportSelectedTenantId,
  setIsDiagnosticRunning,
  setManageMenuTab,
  setManageMenuViewMode,
  setMenuFilterNode,
  setMenuImages,
  setMenuSearchQuery,
  setNewBackupName,
  setProductCrudModal,
  setProductSearch,
  setRelationLog,
  setRelationMatches,
  setRelationSearch,
  setSelectedRecipeProduct,
  setSelectedRelationProductIds,
  setShowCustomConfig,
  setShowDeletedProducts,
  setShowRecipeAddModal,
  setSplitDeletedOriginal,
  setSplitProposedItems,
  setSplitSelectedProductId,
  setWebsocketSyncLog,
  showCustomConfig,
  showDeletedProducts,
  splitDeletedOriginal,
  splitProposedItems,
  splitSelectedProductId,
  treeDragOverTargetKey,
  triggerAppNotification,
  analyzeMenuImage, applyBulkCaseToggle, applyBulkSubcategory, applyBulkSubgroup, collapseAllTreeNodes, expandAllTreeNodes, loadAutoFormattedList, moveSelectedDown, moveSelectedToBottom, moveSelectedToTop, moveSelectedUp, parseSplitProducts, saveRelationChanges, toggleTextCase, toggleTreeSectionCollapse, toggleTreeSubgroupCollapse
}) => {
const hasAccess = isMasterAdmin || currentUser?.role === "sistemas" || currentUser?.id.endsWith("-sistemas");
    if (!hasAccess) {
      return (
        <IonPage>
          <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-12 max-w-md mx-auto">
              <span style={{ fontSize: "5rem", marginBottom: "16px", display: "block" }}>🔒</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Acceso Restringido</h2>
              <p className="text-slate-500 text-sm font-semibold leading-relaxed mt-3">
                Solo el administrador principal (2052) o personal de sistemas tienen autorización para gestionar el menú.
              </p>
              <button
                type="button"
                onClick={() => setAppMode("admin")}
                style={{
                  marginTop: "32px",
                  padding: "12px 24px",
                  background: "#4f46e5",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "16px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)"
                }}
              >
                Volver al Panel
              </button>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Administrar Menú",
        subtitle: `Productos totales: ${products.length}`,
        showBack: true,
        onBack: () => {
          if (manageMenuTab !== null) {
            setManageMenuTab(null);
          } else {
            setAppMode("admin");
          }
        },
        actions: products.length > 0 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (window.confirm("¿Estás absolutamente seguro que deseas empezar el proceso para borrar TODOS los productos de este tenant?")) {
                setDeleteConfirmation({ isOpen: true, type: "all" });
              }
            }}
            className="px-3 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-xs font-black flex items-center gap-1 transition border-none shadow-sm cursor-pointer mr-2"
            title="Eliminar Productos Sucursal"
          >
            <span>🗑️ Eliminar productos de {selectedTenant?.name || "este tenant"}</span>
          </motion.button>
        ) : null
      })}
        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >
          {/* Dashboard/Control Center Widgets representing standard actions - Conditionally visible */}
          {manageMenuTab === null ? (
            <div
              style={{
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "20px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🛠️</span>
                <h3
                  style={{
                    margin: 0,
                    fontWeight: "800",
                    color: "#1e293b",
                    fontSize: "1.05rem",
                  }}
                >
                  Panel de Herramientas y Widgets Inteligentes
                </h3>
              </div>
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "0.82rem",
                  color: "#64748b",
                }}
              >
                Selecciona uno de los siguientes widgets para acceder a su
                respectiva funcionalidad. Cada bloque explica la acción del
                sistema en tiempo real y muestra los recursos actuales.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "14px",
                }}
              >
                {[
                  {
                    id: "backup" as const,
                    title: "Generar respaldo",
                    emoji: "💾",
                    color: "#3b82f6",
                    shortTitle: "Respaldos",
                    description:
                      "Crea un respaldo seguro de la base de datos de tu menú. Visualiza la línea de tiempo de tus respaldos para recuperar o volver a activar versiones anteriores al instante.",
                    actionExplanation:
                      "Los respaldos son independientes por inquilino (tenant) y sucursal. Puedes restaurar el menú completo en cualquier momento.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#3b82f6",
                    stat: `${backups.length} respaldos`,
                  },
                  {
                    id: "import_tenant" as const,
                    title: "Importar de otra sucursal",
                    emoji: "📥",
                    color: "#8b5cf6",
                    shortTitle: "Clonar Carta",
                    description:
                      "Copia de forma masiva los productos y la estructura de categorías de otra sucursal de la empresa hacia esta sucursal.",
                    actionExplanation:
                      "Ocultar� l�gicamente los productos antiguos e importar� la carta exacta. Tus cortes de venta antiguos y tickets quedan protegidos.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#8b5cf6",
                    stat: "Importar Menú",
                  },
                  {
                    id: "upload_subgroups" as const,
                    title: "Generar Menú IA con Subgrupos",
                    emoji: "✨",
                    color: "#059669",
                    shortTitle: "Menú con Subgrupos",
                    description:
                      "Carga fotos del menú para identificar alimentos, bebidas y postres, además de subgrupos inteligentes como tacos gratinados, por pieza, quesadillas chicas o bebidas frías/calientes.",
                    actionExplanation:
                      "Esta acción procesa y clasifica jerárquicamente cada elemento en subcategorías y subgrupos detallados para agilizar la toma de comandas.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#059669",
                    stat: "Subgrupos IA",
                  },
                  {
                    id: "import_excel_ai" as const,
                    title: "Importar Excel Ordenado",
                    emoji: "📊",
                    color: "#2563eb",
                    shortTitle: "Excel e IA",
                    description:
                      "Sube un archivo Excel o CSV con las columnas PRODUCTO, CONSECUTIVO y PRECIO UNITARIO. La IA se encargará de clasificarlos automáticamente.",
                    actionExplanation:
                      "Extraerá los productos y usará Inteligencia Artificial para organizarlos en categorías y subgrupos detallados.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#2563eb",
                    stat: "Subir Tabla",
                  },
                  {
                    id: "food" as const,
                    title: "Platillos y Alimentos",
                    emoji: "🌮",
                    color: "#ef4444",
                    shortTitle: "Comida",
                    description:
                      "Administra entradas, platos fuertes, ensaladas, tacos y guarniciones del restaurante. Puedes añadir nuevos platillos, cambiar precios y asignar impresoras.",
                    actionExplanation:
                      "Esta acción te permite crear registros únicos en la base de datos para platos, asignándolos a la comanda de Cocina para su preparación inmediata.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#ef4444",
                    stat: `${products.filter((p) => p.category === "food").length} productos`,
                  },
                  {
                    id: "drinks" as const,
                    title: "Bebidas y Licores",
                    emoji: "🍹",
                    color: "#06b6d4",
                    shortTitle: "Bebidas",
                    description:
                      "Supervisa refrescos, jugos, cervezas y coctelería fina. Modifica precios, edita descripciones y configúralos para su impresión y despacho directo desde la Barra.",
                    actionExplanation:
                      "Esta acción guarda bebidas individuales vinculándolas con la Barra o Barra de Bebidas para una correcta sincronización de comandas.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#06b6d4",
                    stat: `${products.filter((p) => p.category === "drinks").length} bebidas`,
                  },
                  {
                    id: "desserts" as const,
                    title: "Postres y Dulces",
                    emoji: "🍰",
                    color: "#d946ef",
                    shortTitle: "Postres",
                    description:
                      "Administra rebanadas de pastel, repostería, helados y postres del menú. Controla cuáles se muestran en comanderas de meseros para sugerencia de sobremesa.",
                    actionExplanation:
                      "Esta acción registra delicias culinarias y dulces para agilizar el servicio al cliente y potenciar la venta adicional en las mesas activas.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(217, 70, 239, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#d946ef",
                    stat: `${products.filter((p) => p.category === "desserts").length} postres`,
                  },
                  {
                    id: "recipes" as const,
                    title: "Fórmulas y Recetas",
                    emoji: "🍲",
                    color: "#10b981",
                    shortTitle: "Recetas",
                    description:
                      "Vincula platillos con insumos e ingredientes del almacén. Automatiza la deducción de inventario para que cada venta reste de forma continua los insumos.",
                    actionExplanation:
                      "Esta acción permite calcular costos de producción, margen bruto y controlar de manera inteligente el stock disponible en almacén.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#10b981",
                    stat: "Recetario",
                  },
                  {
                    id: "adhoc_notes" as const,
                    title: "Notas Ad-Hoc IA 🧠",
                    emoji: "💡",
                    color: "#f59e0b",
                    shortTitle: "Notas Ad-Hoc",
                    description:
                      "Genera notas y sugerencias automáticas de personalización inteligente para tus productos con IA (ej: 'con vaso y hielos' para refrescos, 'sin cebolla' para tacos).",
                    actionExplanation:
                      "Utiliza Inteligencia Artificial para analizar el menú y asignar opciones de personalización rápidas que aparecerán al tomar pedidos.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#f59e0b",
                    stat: "Personalización",
                  },
                  {
                    id: "split_products" as const,
                    title: "Separar Productos Comprimidos 🥞",
                    emoji: "🥞",
                    color: "#6366f1",
                    shortTitle: "Separar Juntos",
                    description:
                      "Separa productos agrupados con barra '/' o comas (ej: 'Taco de Pastor/Chorizo/Carnitas') en productos individuales con el mismo precio de forma automática.",
                    actionExplanation:
                      "Detecta productos compuestos y genera las variantes correspondientes para facilitar y agilizar la toma de comandas en mesa.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#6366f1",
                    stat: "Separación",
                  },
                  {
                    id: "relation_order_ia" as const,
                    title: "Relacionar y Ordenar IA 🧠",
                    emoji: "🧠",
                    color: "#e11d48",
                    shortTitle: "Relacionar y Ordenar",
                    description:
                      "Sube fotos de la lista del dueño para corregir nombres de reporte de productos y asignarles su orden personalizado mediante Inteligencia Artificial.",
                    actionExplanation:
                      "Esta acción analiza las fotos cargadas para relacionar los productos del catálogo con sus descripciones deseadas y su número de orden personalizado.",
                    bgGradient:
                      "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    borderColorActive: "#e11d48",
                    stat: "Relacionar e ID",
                  },
                ].map((w) => {
                  const isActive = manageMenuTab === w.id;
                  return (
                    <motion.div
                      key={w.id}
                      whileHover={{ scale: 1.02, cursor: "pointer" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setManageMenuTab(w.id as any)}
                      style={{
                        background: w.bgGradient,
                        borderRadius: "14px",
                        padding: "14px",
                        border: isActive
                          ? `2.5px solid ${w.borderColorActive}`
                          : "1.5px solid #cbd5e1",
                        boxShadow: isActive
                          ? `0 12px 20px -3px ${w.color}20, 0 4px 6px -4px ${w.color}15`
                          : "0 2px 4px -1px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease-in-out",
                        position: "relative",
                      }}
                    >
                      {isActive && (
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: w.color,
                            color: "white",
                            borderRadius: "20px",
                            padding: "2px 8px",
                            fontSize: "0.62rem",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          ✓ Activo
                        </span>
                      )}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ fontSize: "1.6rem" }}>{w.emoji}</span>
                          <div>
                            <h4
                              style={{
                                margin: 0,
                                fontWeight: "800",
                                color: "#1e293b",
                                fontSize: "0.85rem",
                                lineHeight: "1.1",
                              }}
                            >
                              {w.title}
                            </h4>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                color: w.color,
                                textTransform: "uppercase",
                              }}
                            >
                              {w.stat}
                            </span>
                          </div>
                        </div>
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "0.74rem",
                            color: "#475569",
                            lineHeight: "1.25",
                          }}
                        >
                          {w.description}
                        </p>
                      </div>
                      <div
                        style={{
                          borderTop: "1.5px dashed rgba(0,0,0,0.06)",
                          paddingTop: "6px",
                          marginTop: "4px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.68rem",
                            color: "#64748b",
                            fontStyle: "italic",
                            display: "flex",
                            gap: "3px",
                            alignItems: "start",
                          }}
                        >
                          <span>💡</span> <span>{w.actionExplanation}</span>
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Header card dynamic when form is active containing beautiful back-arrow to return */
            (() => {
              const activeWidget = [
                {
                  id: "backup" as const,
                  title: "Generar respaldo",
                  emoji: "💾",
                  color: "#3b82f6",
                  stat: "Respaldos Sincronizados",
                  actionExplanation:
                    "Administración e historial de respaldos de menú por tenant y sucursal. Restaura versiones anteriores con un solo clic.",
                },
                {
                  id: "upload_subgroups" as const,
                  title: "Generar Menú IA con Subgrupos",
                  emoji: "✨",
                  color: "#059669",
                  stat: "Subgrupos IA Extendido",
                  actionExplanation:
                    "Identifica detalladamente alimentos, bebidas y postres con sus subgrupos específicos (tacos gratinados, por pieza, con piña, etc.) para una clasificación perfecta.",
                },
                {
                  id: "import_excel_ai" as const,
                  title: "Importar Excel Ordenado",
                  emoji: "📊",
                  color: "#2563eb",
                  stat: "Excel e IA Integrados",
                  actionExplanation:
                    "Procesa un listado de productos desde Excel/CSV con sus precios usando Inteligencia Artificial para auto-clasificarlos.",
                },
                {
                  id: "food" as const,
                  title: "Platillos y Alimentos",
                  emoji: "🌮",
                  color: "#ef4444",
                  stat: `${products.filter((p) => p.category === "food").length} productos`,
                  actionExplanation:
                    "Administra entradas, platos fuertes, tacos y guarniciones con precios y sincronización de Cocina.",
                },
                {
                  id: "drinks" as const,
                  title: "Bebidas y Licores",
                  emoji: "🍹",
                  color: "#06b6d4",
                  stat: `${products.filter((p) => p.category === "drinks").length} bebidas`,
                  actionExplanation:
                    "Gestiona refrescos, licores, cocteles y despachos inmediatos directo desde la Barra del restaurante.",
                },
                {
                  id: "desserts" as const,
                  title: "Postres y Dulces",
                  emoji: "🍰",
                  color: "#d946ef",
                  stat: `${products.filter((p) => p.category === "desserts").length} postres`,
                  actionExplanation:
                    "Controla pasteles, helados, repostería y dulces para la sugerencia perfecta al comensal.",
                },
                {
                  id: "recipes" as const,
                  title: "Fórmulas y Recetas",
                  emoji: "🍲",
                  color: "#10b981",
                  stat: "Recetario",
                  actionExplanation:
                    "Diseña recetas ligando platillos con insumos. Descuenta de forma automática e inteligente en cada venta.",
                },
              ].find((w) => w.id === manageMenuTab);

              if (!activeWidget) return null;

              return (
                <div
                  style={{
                    background: "white",
                    border: "1px solid #cbd5e1",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "20px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    animation: "fadeIn 0.2s ease-out",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setManageMenuTab(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background: "#fff",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        color: "#1e293b",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>⬅️</span> Volver a la
                      Administración del Menú
                    </motion.button>
                    <div
                      style={{
                        height: "24px",
                        width: "1.5px",
                        background: "#cbd5e1",
                      }}
                    ></div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {activeWidget.emoji}
                      </span>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontWeight: "800",
                            color: "#1e293b",
                            fontSize: "1rem",
                          }}
                        >
                          {activeWidget.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: activeWidget.color,
                            fontWeight: "bold",
                            textTransform: "uppercase",
                          }}
                        >
                          {activeWidget.stat}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                      maxWidth: "450px",
                      fontStyle: "italic",
                    }}
                  >
                    {activeWidget.actionExplanation}
                  </div>
                </div>
              );
            })()
          )}
          {manageMenuTab === "import_tenant" && (
            <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "1.25rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📥</span> Importar Menú de Otra Sucursal o Matriz
                </h3>
                <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Clona todo el catálogo de productos de otra sucursal. Esta operación reemplazará la carta de la sucursal actual por la seleccionada.
                </p>
              </div>

              {importConfirmStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "8px" }}>
                      Seleccionar Sucursal / Matriz de Origen
                    </label>
                    <select
                      value={importSelectedTenantId}
                      onChange={(e) => setImportSelectedTenantId(e.target.value)}
                      disabled={isImportingTenantMenu}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "0.9rem",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        background: "#f8fafc",
                        outline: "none",
                        cursor: isImportingTenantMenu ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="">-- Seleccionar Sucursal --</option>
                      {COMPANY_CATALOG.filter((c) => c.id !== selectedTenant?.id).map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.type || "Sucursal"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px", color: "#92400e" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "0.88rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                      ⚠️ Importante antes de continuar
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.8rem", lineHeight: "1.4" }}>
                      <li>Se archivarán (borrado lógico) todos los productos de la sucursal actual: <strong>{selectedTenant?.name || ""}</strong>.</li>
                      <li>Se creará un respaldo automático del menú actual en tu historial de respaldos.</li>
                      <li>Los productos importados conservarán sus precios, nombres, descripciones y categorías exactas de la sucursal origen.</li>
                    </ul>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setImportConfirmStep(1)}
                      disabled={!importSelectedTenantId}
                      style={{
                        padding: "12px 24px",
                        background: !importSelectedTenantId ? "#a78bfa" : "#7c3aed",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "none",
                        cursor: !importSelectedTenantId ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem",
                        boxShadow: "0 4px 6px rgba(124, 58, 237, 0.15)"
                      }}
                    >
                      <span>📥</span>
                      Confirmar e Importar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImportSelectedTenantId("");
                        setManageMenuTab(null);
                      }}
                      style={{
                        padding: "12px 20px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1.5px solid #cbd5e1",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {importConfirmStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
                  <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "12px", padding: "18px", color: "#991b1b" }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px" }}>
                      ⚠️ ALERTA DE SEGURIDAD (Paso 1 de 2)
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.5", fontWeight: "bold" }}>
                      Estás a punto de <strong>ARCHIVAR (BORRADO LÓGICO)</strong> todos los productos de esta sucursal (<strong>{selectedTenant?.name || ""}</strong>) e importar los productos de la sucursal/matriz <strong>"{COMPANY_CATALOG.find(c => c.id === importSelectedTenantId)?.name || importSelectedTenantId}"</strong>.
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
                      ¿Estás seguro de que deseas continuar? Los productos actuales serán marcados como eliminados (borrado lógico) y no se perderán de forma permanente.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setImportConfirmStep(2)}
                      style={{
                        padding: "12px 24px",
                        background: "#dc2626",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      Sí, deseo continuar
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportConfirmStep(0)}
                      style={{
                        padding: "12px 20px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1.5px solid #cbd5e1",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      Cancelar / Regresar
                    </button>
                  </div>
                </div>
              )}

              {importConfirmStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
                  <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: "12px", padding: "18px", color: "#c2410c" }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px" }}>
                      🛑 RECOMENDACIÓN DE RESPALDO (Paso 2 de 2)
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.5", fontWeight: "bold" }}>
                      Antes de continuar, el sistema generará automáticamente una copia de respaldo del menú actual en tu historial de respaldos.
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
                      ¿Aún así deseas continuar con la importación y el borrado lógico de la carta actual?
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={handleImportTenantMenu}
                      disabled={isImportingTenantMenu}
                      style={{
                        padding: "12px 24px",
                        background: isImportingTenantMenu ? "#a78bfa" : "#7c3aed",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "none",
                        cursor: isImportingTenantMenu ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem"
                      }}
                    >
                      {isImportingTenantMenu ? (
                        <>
                          <span style={{ display: "inline-block" }} className="animate-spin">🔄</span>
                          Importando...
                        </>
                      ) : (
                        <>
                          <span>📥</span>
                          Confirmar e Importar Ahora
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportConfirmStep(0)}
                      disabled={isImportingTenantMenu}
                      style={{
                        padding: "12px 20px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        border: "1.5px solid #cbd5e1",
                        cursor: isImportingTenantMenu ? "not-allowed" : "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {manageMenuTab === "backup" && (
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              {/* Backups Panel */}
              <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>

                {/* 🔍 DIAGNOSTIC AND CLOUD SYNCHRONIZER CARD */}
                <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "14px", border: "1px solid #bbf7d0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem", color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>⚡</span> Escáner y Sincronizador de la Nube (Firestore)
                      </h3>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#1e3a1e" }}>
                        Herramienta de diagnóstico para validar, auditar y rescatar productos o respaldos en toda tu base de datos de Firestore.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <IonButton
                        fill="outline"
                        color="success"
                        size="small"
                        onClick={() => setShowCustomConfig(!showCustomConfig)}
                        style={{ fontWeight: "bold" }}
                      >
                        ⚙️ {showCustomConfig ? "Ocultar Config" : "Ajustar Conexión"}
                      </IonButton>
                      <IonButton
                        fill="solid"
                        color="success"
                        size="small"
                        disabled={isDiagnosticRunning}
                        onClick={async () => {
                          setIsDiagnosticRunning(true);
                          try {
                            const prods = await getAllProductsFromFirebase();
                            const bks = await getAllMenuBackupsFromFirebase();
                            setDiagnosticProducts(prods);
                            setDiagnosticBackups(bks);
                            setDiagnosticRunCount(prev => prev + 1);
                            triggerAppNotification(
                              "Escaneo Exitoso 🔍",
                              `Se encontraron ${prods.length} productos y ${bks.length} respaldos totales en la base de datos Firestore.`,
                              "success"
                            );
                          } catch (err: any) {
                            console.error("Error running diagnostics:", err);
                            triggerAppNotification(
                              "Error de Diagnóstico ❌",
                              "No se pudo completar el análisis de Firestore. Verifique conexión.",
                              "warning"
                            );
                          } finally {
                            setIsDiagnosticRunning(false);
                          }
                        }}
                        style={{ fontWeight: "bold" }}
                      >
                        {isDiagnosticRunning ? "🔍 Analizando..." : "🔍 Iniciar Escaneo en Vivo"}
                      </IonButton>
                    </div>
                  </div>

                  {/* FORMULARIO DE CONFIGURACIÓN PERSONALIZADA DE FIREBASE */}
                  {showCustomConfig && (
                    <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", fontWeight: "bold", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>🔥</span> Credenciales de Firestore Personalizadas
                      </h4>
                      <p style={{ margin: "0 0 12px 0", fontSize: "0.75rem", color: "#64748b", lineHeight: "1.3" }}>
                        Pega aquí tus claves de Firebase para que el sistema se conecte directamente a tu base de datos y cargue tus 59 productos de Santa María.
                      </p>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "4px" }}>Project ID *</label>
                          <input 
                            type="text" 
                            value={customProjectId} 
                            onChange={(e) => setCustomProjectId(e.target.value)} 
                            placeholder="ej. cocinet2026"
                            style={{ width: "100%", padding: "6px 8px", fontSize: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "4px" }}>API Key *</label>
                          <input 
                            type="password" 
                            value={customApiKey} 
                            onChange={(e) => setCustomApiKey(e.target.value)} 
                            placeholder="AIzaSy..."
                            style={{ width: "100%", padding: "6px 8px", fontSize: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "4px" }}>Database ID (Opcional, vacío si es default)</label>
                          <input 
                            type="text" 
                            value={customDbId} 
                            onChange={(e) => setCustomDbId(e.target.value)} 
                            placeholder="remixed-firestore-database-id"
                            style={{ width: "100%", padding: "6px 8px", fontSize: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "4px" }}>App ID (Opcional)</label>
                          <input 
                            type="text" 
                            value={customAppId} 
                            onChange={(e) => setCustomAppId(e.target.value)} 
                            placeholder="1:3768044077:web:..."
                            style={{ width: "100%", padding: "6px 8px", fontSize: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}
                          />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "4px" }}>Auth Domain (Opcional)</label>
                          <input 
                            type="text" 
                            value={customAuthDomain} 
                            onChange={(e) => setCustomAuthDomain(e.target.value)} 
                            placeholder="cocinet2026.firebaseapp.com"
                            style={{ width: "100%", padding: "6px 8px", fontSize: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("¿Seguro que deseas restablecer la conexión de Firebase a los valores por defecto del sistema?")) {
                              localStorage.removeItem("custom_firebase_config");
                              localStorage.removeItem("custom_firebase_db_id");
                              triggerAppNotification("Conexión Restablecida 🔄", "Se han borrado tus credenciales personalizadas. Recargando la página...", "success");
                              setTimeout(() => window.location.reload(), 1500);
                            }
                          }}
                          style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Restablecer por Defecto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!customProjectId.trim() || !customApiKey.trim()) {
                              alert("El Project ID y API Key son obligatorios para guardar la configuración.");
                              return;
                            }
                            const configObj = {
                              apiKey: customApiKey.trim(),
                              projectId: customProjectId.trim(),
                              authDomain: customAuthDomain.trim() || `${customProjectId.trim()}.firebaseapp.com`,
                              storageBucket: `${customProjectId.trim()}.appspot.com`,
                              appId: customAppId.trim() || "1:1234567890:web:abcdef1234567890",
                              messagingSenderId: "1234567890"
                            };
                            localStorage.setItem("custom_firebase_config", JSON.stringify(configObj));
                            localStorage.setItem("custom_firebase_db_id", customDbId.trim());
                            triggerAppNotification("Configuración Guardada 🔥", "¡Credenciales de Firebase actualizadas! Recargando para establecer conexión segura...", "success");
                            setTimeout(() => window.location.reload(), 1500);
                          }}
                          style={{ padding: "6px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Conectar y Guardar
                        </button>
                      </div>

                      {/* Herramienta de Migración / Copia de Seguridad JSON */}
                      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #cbd5e1" }}>
                        <p style={{ margin: "0 0 6px 0", fontSize: "0.82rem", fontWeight: "bold", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>🔄</span> Copiar / Migrar Base de Datos Completa (JSON)
                        </p>
                        <p style={{ margin: "0 0 12px 0", fontSize: "0.7rem", color: "#64748b", lineHeight: "1.3" }}>
                          Para jalar una copia de la base de datos anterior a la nueva: 
                          1. Mientras estás conectado al Firebase actual (o por defecto), pulsa <b>Exportar Todo a JSON</b> para descargar los datos.
                          2. Escribe los datos de la nueva base de datos arriba y pulsa <b>Conectar y Guardar</b> (la página se recargará con el nuevo Firebase).
                          3. Pulsa <b>Importar desde JSON</b> y selecciona el archivo descargado para subir toda la información de golpe.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                triggerAppNotification("🔄 Exportando...", "Recuperando todos los datos de la base de datos actual. Por favor, espere...", "info");
                                const data = await exportFullDatabaseJson();
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                                const url = URL.createObjectURL(blob);
                                const dl = document.createElement("a");
                                dl.setAttribute("href", url);
                                dl.setAttribute("download", `cocinet_full_backup_${data.projectId}_${getMexicoISOString().slice(0,10)}.json`);
                                document.body.appendChild(dl);
                                dl.click();
                                dl.remove();
                                URL.revokeObjectURL(url);
                                triggerAppNotification("📥 Copia Descargada ✅", "Los datos se han descargado con éxito. Ahora conecta tu nuevo Firebase e impórtalos aquí.", "success");
                              } catch (err: any) {
                                triggerAppNotification("❌ Error al exportar", err.message || "Falló la exportación", "warning");
                              }
                            }}
                            style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "bold", cursor: "pointer" }}
                          >
                            📥 Exportar Todo a JSON
                          </button>
                          
                          <label style={{ padding: "6px 12px", background: "#d97706", color: "#fff", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "bold", cursor: "pointer", display: "inline-block" }}>
                            📤 Importar desde JSON
                            <input
                              type="file"
                              accept=".json"
                              onChange={async (evt) => {
                                const file = evt.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async (re) => {
                                  try {
                                    const parsed = JSON.parse(re.target?.result as string);
                                    const count = await importFullDatabaseJson(parsed, (msg) => {
                                      triggerAppNotification("⏳ Importando...", msg, "info");
                                    });
                                    triggerAppNotification("🚀 Copia Sincronizada ✅", `¡Se han importado exitosamente ${count} registros a la nueva base de datos de Firebase!`, "success");
                                    setTimeout(() => window.location.reload(), 2000);
                                  } catch (err: any) {
                                    triggerAppNotification("❌ Error al importar", err.message || "Falló la importación", "warning");
                                  }
                                };
                                reader.readAsText(file);
                              }}
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                  {diagnosticRunCount > 0 ? (
                    <div style={{ marginTop: "16px", background: "white", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "0.88rem", fontWeight: "bold", color: "#1e293b" }}>
                        📊 Resumen de Datos Encontrados en la Nube (Firestore)
                      </h4>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr", md: "1fr 1fr", gap: "16px" }}>
                        {/* Column 1: Products */}
                        <div>
                          <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>
                            📦 Productos Agrupados por Tenant ID:
                          </p>
                          {(() => {
                            const groups: Record<string, any[]> = {};
                            diagnosticProducts.forEach(p => {
                              const tid = p.tenantId || "sin_tenant";
                              if (!groups[tid]) groups[tid] = [];
                              groups[tid].push(p);
                            });

                            const keys = Object.keys(groups);
                            if (keys.length === 0) {
                              return <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>No hay productos en la base de datos.</p>;
                            }

                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {keys.map(k => {
                                  const companyInfo = COMPANY_CATALOG.find(c => c.id === k);
                                  const name = companyInfo ? companyInfo.name : k === "sin_tenant" ? "Sin Tenant ID" : `Desconocido (${k})`;
                                  return (
                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                      <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#334155" }}>
                                        {name}
                                      </span>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#2563eb" }}>
                                          {groups[k].length} prod.
                                        </span>
                                        {k !== selectedTenant?.id && (
                                          <IonButton
                                            fill="clear"
                                            size="small"
                                            onClick={async () => {
                                              if (window.confirm(`¿Deseas migrar/copiar los ${groups[k].length} productos de "${name}" a la sucursal actual "${selectedTenant?.name}" (${selectedTenant?.id})?`)) {
                                                try {
                                                  await migrateProductsTenant(groups[k].map(p => p.id), selectedTenant.id);
                                                  triggerAppNotification("Migración Exitosa 🚀", "Los productos se han migrado con éxito.", "success");
                                                  const prods = await getAllProductsFromFirebase();
                                                  setDiagnosticProducts(prods);
                                                } catch (err: any) {
                                                  console.error(err);
                                                  triggerAppNotification("Error al migrar ❌", "No se pudo realizar la migración.", "warning");
                                                }
                                              }
                                            }}
                                            style={{ margin: 0, fontSize: "0.68rem", fontWeight: "bold", "--color": "#059669" }}
                                          >
                                            🔗 Copiar Aquí
                                          </IonButton>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Column 2: Backups */}
                        <div>
                          <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>
                            💾 Copias de Seguridad Disponibles:
                          </p>
                          {(() => {
                            if (diagnosticBackups.length === 0) {
                              return <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>No hay copias de seguridad registradas.</p>;
                            }

                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                                {diagnosticBackups.map(bk => {
                                  const tenantName = COMPANY_CATALOG.find(c => c.id === bk.tenantId)?.name || bk.tenantId;
                                  return (
                                    <div key={bk.id} style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.72rem" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#1e293b" }}>
                                        <span>{bk.name}</span>
                                        <span style={{ color: "#059669" }}>{bk.products?.length || 0} p.</span>
                                      </div>
                                      <div style={{ color: "#64748b", fontSize: "0.65rem", marginTop: "2px" }}>
                                        Sucursal original: {tenantName}
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "6px" }}>
                                        {bk.tenantId !== selectedTenant?.id && (
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              if (window.confirm(`¿Deseas migrar esta copia de seguridad "${bk.name}" para que pertenezca a la sucursal actual "${selectedTenant?.name}"?`)) {
                                                try {
                                                  await migrateBackupsTenant([bk.id], selectedTenant.id);
                                                  triggerAppNotification("Respaldo Vinculado 🔄", "El respaldo ahora pertenece a esta sucursal.", "success");
                                                  const bks = await getAllMenuBackupsFromFirebase();
                                                  setDiagnosticBackups(bks);
                                                } catch (err) {
                                                  triggerAppNotification("Error ❌", "No se pudo vincular el respaldo.", "warning");
                                                }
                                              }
                                            }}
                                            style={{ fontSize: "0.62rem", background: "#e0f2fe", color: "#0369a1", border: "none", padding: "3px 6px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                                          >
                                            🔗 Vincular Aquí
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (window.confirm(`⚠️ ¿Deseas RESTAURAR DIRECTAMENTE este respaldo de ${bk.products?.length || 0} productos en tu sucursal activa "${selectedTenant?.name}"?\nEsto reemplazará tu menú actual.`)) {
                                              try {
                                                await restoreMenuBackupInFirebase(selectedTenant.id, bk.products || []);
                                                triggerAppNotification("Menú Restaurado 🔄", `¡Se ha restaurado el menú con éxito con los ${bk.products?.length || 0} productos!`, "success");
                                              } catch (err) {
                                                triggerAppNotification("Error al Restaurar ❌", "No se pudo completar la restauración.", "warning");
                                              }
                                            }
                                          }}
                                          style={{ fontSize: "0.62rem", background: "#dcfce7", color: "#15803d", border: "none", padding: "3px 6px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                                        >
                                          🔄 Restaurar Directo
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: "12px", background: "#fff", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#475569", lineHeight: "1.3" }}>
                        💡 <b>Recomendación para Santa María (59 productos):</b> Si tenías cargado un respaldo o productos con otro tenantId, esta herramienta listará todas las bases de datos de Firestore en un solo clic. Podrás vincularlas o restaurarlas directamente a tu sesión actual de Santa María de forma rápida.
                      </p>
                    </div>
                  )}

                {/* 1. Generator Card */}
                <div style={{ background: "white", padding: "20px", borderRadius: "14px", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>💾</span> Generar Respaldo de Menú
                      </h3>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                        Guarda el estado actual de tu menú (<b>{products.length} productos</b>) para la sucursal <b>{selectedTenant?.name || selectedTenant?.sucursalDefault || "Principal"}</b>.
                      </p>
                    </div>

                    {/* Notification control */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "6px 12px", borderRadius: "20px" }}>
                      <span style={{ fontSize: "1rem" }}>🔔</span>
                      <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        Notificaciones Activas
                        <input
                          type="checkbox"
                          checked={enableBackupNotifications}
                          onChange={(e) => {
                            setEnableBackupNotifications(e.target.checked);
                            if (e.target.checked) {
                              triggerAppNotification("Notificaciones 🔔", "¡Se han habilitado las alertas de respaldos y sincronización en tiempo real! ✅", "success");
                            }
                          }}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Auto-suffix preview */}
                  {(() => {
                    const now = new Date();
                    const tenantShortName = (selectedTenant?.sucursalDefault || selectedTenant?.name || "Sucursal").slice(0, 30);
                    const dateStr = now.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
                    const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
                    const autoSuffix = `${tenantShortName} - ${dateStr} ${timeStr}`;
                    const finalName = newBackupName.trim() ? `${autoSuffix} - ${newBackupName.trim()}` : autoSuffix;
                    return (
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>
                          📝 Nombre del respaldo (generado automáticamente):
                        </div>
                        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "8px 12px", fontSize: "0.82rem", fontWeight: "700", color: "#0369a1", fontFamily: "monospace", wordBreak: "break-all" }}>
                          {finalName}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Nota adicional (opcional): Ej. menú festivo / cambio de precios"
                      value={newBackupName}
                      onChange={(e) => setNewBackupName(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: "250px",
                        padding: "10px 14px",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "0.88rem",
                        outline: "none",
                        transition: "all 0.15s ease",
                      }}
                    />
                    <IonButton
                      fill="solid"
                      color="primary"
                      onClick={async () => {
                        try {
                          const now = new Date();
                          const tenantShortName = (selectedTenant?.sucursalDefault || selectedTenant?.name || "Sucursal").slice(0, 30);
                          const dateStr = now.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
                          const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
                          const autoSuffix = `${tenantShortName} - ${dateStr} ${timeStr}`;
                          const backupName = newBackupName.trim() ? `${autoSuffix} - ${newBackupName.trim()}` : autoSuffix;
                          const branchName = selectedTenant?.name || selectedTenant?.sucursalDefault || "Sucursal";
                          
                          await createMenuBackup(
                            selectedTenant.id,
                            branchName,
                            backupName,
                            products
                          );
                          setNewBackupName("");
                          
                          if (enableBackupNotifications) {
                            triggerAppNotification(
                              "Respaldo Creado 💾",
                              `¡Se ha creado correctamente el respaldo "${backupName}" con ${products.length} productos! 💾✅`,
                              "success"
                            );
                          }
                        } catch (err: any) {
                          console.error(err);
                          triggerAppNotification(
                            "Error ❌",
                            "No se pudo crear el respaldo. Intente de nuevo.",
                            "warning"
                          );
                        }
                      }}
                      style={{ fontWeight: "bold" }}
                    >
                      💾 Crear Respaldo
                    </IonButton>
                  </div>
                </div>

                {/* 2. Timeline and Backup History */}
                <div style={{ background: "white", padding: "24px", borderRadius: "14px", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontWeight: "bold", fontSize: "0.95rem", color: "#475569" }}>
                    ⏳ Línea de Tiempo de Respaldos de esta Sucursal
                  </h4>

                  {backups.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                      <span style={{ fontSize: "2.5rem" }}>📂</span>
                      <p style={{ fontWeight: "500", fontSize: "0.92rem", margin: "10px 0 4px" }}>No hay respaldos registrados</p>
                      <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>
                        Aún no has creado ningún respaldo para la sucursal <b>{selectedTenant?.name || "activa"}</b>. Ingresa un nombre arriba para crear el primero.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative", paddingLeft: "16px" }}>
                      {/* Left vertical timeline bar */}
                      <div style={{
                        position: "absolute",
                        left: "4px",
                        top: "10px",
                        bottom: "10px",
                        width: "2px",
                        background: "linear-gradient(180deg, #3b82f6 0%, #cbd5e1 100%)",
                        zIndex: 1,
                      }}></div>

                      {backups.map((bk, idx) => {
                        const dateObj = new Date(bk.timestamp);
                        const formattedDate = isNaN(dateObj.getTime())
                          ? bk.timestamp
                          : dateObj.toLocaleString("es-MX", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                        return (
                          <div
                            key={bk.id}
                            style={{
                              position: "relative",
                              paddingLeft: "24px",
                              paddingBottom: idx === backups.length - 1 ? "0" : "24px",
                              zIndex: 2,
                            }}
                          >
                            {/* Timeline node node */}
                            <div style={{
                              position: "absolute",
                              left: "-16px",
                              top: "4px",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: idx === 0 ? "#3b82f6" : "#cbd5e1",
                              border: "2.5px solid white",
                              boxShadow: "0 0 0 2px " + (idx === 0 ? "rgba(59, 130, 246, 0.2)" : "rgba(203, 213, 225, 0.2)"),
                            }}></div>

                            {/* Card Details */}
                            <div style={{
                              background: idx === 0 ? "rgba(59, 130, 246, 0.02)" : "white",
                              border: "1px solid " + (idx === 0 ? "#93c5fd" : "#e2e8f0"),
                              padding: "16px",
                              borderRadius: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "14px",
                            }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <h5 style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem", color: "#1e293b" }}>
                                    {bk.name}
                                  </h5>
                                  {idx === 0 && (
                                    <span style={{ fontSize: "0.7rem", background: "#3b82f6", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                                      Más Reciente ✨
                                    </span>
                                  )}
                                </div>
                                
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span>📅</span> <span className="font-mono">{formattedDate}</span>
                                </p>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#475569", fontWeight: "500" }}>
                                  🍔 Contiene <b>{bk.products?.length || 0}</b> productos y categorías del menú.
                                </p>
                              </div>

                              {/* Actions */}
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <IonButton
                                  fill="solid"
                                  color="success"
                                  size="small"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `⚠️ ¿Estás seguro de que deseas recuperar este respaldo?\n\n"${bk.name}"\n\nEsto reemplazará todos los productos (${products.length}) del menú actual de la sucursal: "${selectedTenant?.name}" con los ${bk.products?.length || 0} productos de este respaldo. Esta acción no se puede deshacer.`
                                      )
                                    ) {
                                      try {
                                        await restoreMenuBackupInFirebase(
                                          selectedTenant.id,
                                          bk.products || []
                                        );
                                        
                                        if (enableBackupNotifications) {
                                          triggerAppNotification(
                                            "Menu Restaurado 🔄",
                                            `¡El menú se ha restaurado exitosamente al respaldo "${bk.name}"! 🔄✅`,
                                            "success"
                                          );
                                        }
                                      } catch (error: any) {
                                        console.error(error);
                                        triggerAppNotification(
                                          "Error al Restaurar ❌",
                                          "Ocurrió un error al intentar restaurar el menú.",
                                          "warning"
                                        );
                                      }
                                    }
                                  }}
                                  style={{ fontWeight: "bold" }}
                                >
                                  🔄 Recuperar y Activar
                                </IonButton>

                                <IonButton
                                  fill="outline"
                                  color="danger"
                                  size="small"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `🗑️ ¿Estás seguro de que deseas eliminar permanentemente el respaldo:\n"${bk.name}"?`
                                      )
                                    ) {
                                      try {
                                        await deleteMenuBackupFromFirebase(bk.id);
                                        
                                        if (enableBackupNotifications) {
                                          triggerAppNotification(
                                            "Respaldo Eliminado 🗑️",
                                            `¡El respaldo "${bk.name}" ha sido eliminado! 🧹✅`,
                                            "info"
                                          );
                                        }
                                      } catch (error: any) {
                                        console.error(error);
                                        triggerAppNotification(
                                          "Error al eliminar ❌",
                                          "No se pudo eliminar el respaldo.",
                                          "warning"
                                        );
                                      }
                                    }
                                  }}
                                >
                                  🗑️ Eliminar
                                </IonButton>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {(manageMenuTab === "upload_subgroups" || manageMenuTab === "import_excel_ai") && (
            <div style={{ textAlign: "center", padding: "10px" }}>
              <IonText color="medium">
                <p
                  style={{
                    marginBottom: "16px",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  {manageMenuTab === "upload_subgroups" ? (
                    <span>
                      ✨ Sube imágenes de tu menú impreso. El sistema detectará
                      los platillos, bebidas, postres y creará{" "}
                      <b>subgrupos inteligentes</b> (como tacos por pieza,
                      gratinados, quesadillas grandes/chicas, bebidas
                      frías/alcoholicas, etc.) para una clasificación perfecta.
                    </span>
                  ) : (
                    <span>
                      📊 Sube un archivo Excel o CSV con las columnas PRODUCTO, CONSECUTIVO y PRECIO UNITARIO.
                      La IA extraerá el menú y clasificará los productos en categorías y <b>subgrupos inteligentes</b> de forma automática.
                    </span>
                  )}
                </p>
              </IonText>

              {manageMenuTab === "upload_subgroups" ? (
                <input
                  type="file"
                  id="menu-upload"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleMenuImageUpload}
                />
              ) : (
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls, .csv"
                  style={{ display: "none" }}
                  onChange={handleExcelUpload}
                />
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {manageMenuTab === "import_excel_ai" ? (
                  <IonButton
                    fill="solid"
                    color="secondary"
                    onClick={() => document.getElementById("excel-upload")?.click()}
                    disabled={isAnalyzing}
                  >
                    <IonIcon slot="start" icon={cloudUploadOutline} />
                    {isAnalyzing ? "Analizando Excel..." : "📊 Seleccionar Archivo Excel/CSV"}
                  </IonButton>
                ) : (
                  <>
                    <IonButton
                      fill="solid"
                      color="secondary"
                      onClick={() => document.getElementById("menu-upload")?.click()}
                    >
                      <IonIcon slot="start" icon={cloudUploadOutline} />
                      {menuImages.length > 0 ? "➕ Agregar Imagen" : "📸 Subir Imagen(es)"}
                    </IonButton>

                    {menuImages.length > 0 && (
                      <IonButton
                        fill="solid"
                        color="success"
                        disabled={isAnalyzing}
                        onClick={() => analyzeMenuImage(menuImages, true)}
                        style={{ fontWeight: "bold" }}
                      >
                        <IonIcon slot="start" icon={syncOutline} />
                        {isAnalyzing ? "Analizando..." : "✨ Generar Menú IA con Subgrupos"}
                      </IonButton>
                    )}

                    {menuImages.length > 0 && (
                      <IonButton
                        fill="outline"
                        color="danger"
                        onClick={() => setMenuImages([])}
                      >
                        <IonIcon slot="start" icon={trashOutline} />
                        Limpiar Todo
                      </IonButton>
                    )}
                  </>
                )}
              </div>

              {isAnalyzing && analysisStatus.isAnalyzing && (
                <div
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "16px",
                    padding: "20px",
                    margin: "24px 0",
                    textAlign: "left",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <IonSpinner name="crescent" color="primary" />
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontWeight: "bold",
                          color: "#1e293b",
                        }}
                      >
                        Procesando menú de forma secuencial... 🚀
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "#475569",
                        }}
                      >
                        Analizando Imagen {analysisStatus.current} de{" "}
                        {analysisStatus.total}
                      </p>
                    </div>
                  </div>

                  {/* Elegant sequential step list */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {Array.from({ length: analysisStatus.total }).map(
                      (_, idx) => {
                        const imgIndex = idx + 1;
                        const isCompleted = analysisStatus.completedImages.some(
                          (item) => item.index === imgIndex,
                        );
                        const compInfo = analysisStatus.completedImages.find(
                          (item) => item.index === imgIndex,
                        );
                        const isActive = analysisStatus.current === imgIndex;

                        return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "10px 14px",
                              background: isActive
                                ? "rgba(59, 130, 246, 0.08)"
                                : "white",
                              borderRadius: "10px",
                              border: isActive
                                ? "1px solid #3b82f6"
                                : "1px solid #e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "bold",
                                  color: isActive ? "#3b82f6" : "#475569",
                                }}
                              >
                                📸 Imagen {imgIndex}:
                              </span>
                              <span
                                style={{ fontSize: "0.9rem", color: "#1e293b" }}
                              >
                                {isCompleted
                                  ? `Análisis completado ✅ (${compInfo?.count || 0} productos detectados)`
                                  : isActive
                                    ? "Analizando y procesando con Inteligencia Artificial... ⏳"
                                    : "En espera... 🕒"}
                              </span>
                            </div>
                            {isCompleted && (
                              <span
                                style={{
                                  color: "#10b981",
                                  fontWeight: "bold",
                                  fontSize: "1.1rem",
                                }}
                              >
                                ✓
                              </span>
                            )}
                            {isActive && (
                              <IonSpinner
                                name="dots"
                                color="primary"
                                style={{ height: "20px" }}
                              />
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* Grid of uploaded menu images */}
              {menuImages.length > 0 && !isAddingProducts && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "16px",
                    padding: "16px",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    background: "#f8fafc",
                    marginTop: "16px",
                  }}
                >
                  {menuImages.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                        background: "white",
                        aspectRatio: "3/4",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        id={`btn-remove-preview-img-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuImages((prev) =>
                            prev.filter((_, i) => i !== idx),
                          );
                        }}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#ef4444",
                          color: "white",
                          borderRadius: "50%",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          cursor: "pointer",
                          fontWeight: "bold",
                          zIndex: 10,
                        }}
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: "rgba(15, 23, 42, 0.7)",
                          color: "white",
                          padding: "6px 8px",
                          fontSize: "0.75rem",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        Imagen {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {menuImages.length === 0 && !isAddingProducts && (
                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    padding: "60px 20px",
                    background: "#f8fafc",
                    color: "#94a3b8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    document.getElementById("menu-upload")?.click()
                  }
                >
                  <IonIcon
                    icon={imageOutline}
                    style={{
                      fontSize: "64px",
                      marginBottom: "14px",
                      color: "#cbd5e1",
                    }}
                  />
                  <p
                    style={{
                      fontWeight: "500",
                      fontSize: "1rem",
                      color: "#64748b",
                      margin: "0 0 4px",
                    }}
                  >
                    No se han seleccionado imágenes
                  </p>
                  <p
                    style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}
                  >
                    Arrastra o haz clic para subir una o varias fotos del menú
                  </p>
                </div>
              )}

              {/* Dynamic Table for Editing and Confirming Extracted Menu Products */}
              {detectedProducts.length > 0 && !isAnalyzing && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "2px solid #10b981",
                    borderRadius: "20px",
                    padding: "24px",
                    marginTop: "24px",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "16px",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontWeight: "bold",
                          color: "#065f46",
                          fontSize: "1.25rem",
                        }}
                      >
                        📋 {detectedProducts.length} Productos Detectados por IA
                        ✨
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Revisa la lista extraída antes de guardarla en tu
                        catálogo. Puedes editar o quitar elementos.
                      </p>
                    </div>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      <IonButton
                        fill="solid"
                        color="success"
                        disabled={
                          isAddingProducts || detectedProducts.length === 0
                        }
                        onClick={() =>
                          handleAddProductsToMenu(detectedProducts)
                        }
                        style={{ fontWeight: "bold" }}
                      >
                        📥 Importar al Menú
                      </IonButton>
                      <IonButton
                        fill="outline"
                        color="danger"
                        disabled={
                          isAddingProducts || detectedProducts.length === 0
                        }
                        onClick={() => {
                          if (
                            window.confirm(
                              "⚠️ ¿Estás seguro de que deseas borrar ABSOLUTAMENTE todo tu menú actual y reemplazarlo con los productos detectados?",
                            )
                          ) {
                            handleResetMenuAndRefill(detectedProducts);
                          }
                        }}
                        style={{ fontWeight: "bold" }}
                      >
                        ⚠️ Reiniciar Menú e Importar
                      </IonButton>
                    </div>
                  </div>

                  {/* Live Table */}
                  <div
                    style={{
                      overflowX: "auto",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.9rem",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <th
                            style={{
                              padding: "12px 16px",
                              fontWeight: "600",
                              color: "#475569",
                              textAlign: "left",
                            }}
                          >
                            Nombre del Platillo/Bebida
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              fontWeight: "600",
                              color: "#475569",
                              textAlign: "left",
                            }}
                          >
                            Categoría
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              fontWeight: "600",
                              color: "#475569",
                              textAlign: "left",
                            }}
                          >
                            Subcategoría
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              fontWeight: "600",
                              color: "#475569",
                              textAlign: "left",
                            }}
                          >
                            Subgrupo
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              fontWeight: "600",
                              color: "#475569",
                              textAlign: "right",
                            }}
                          >
                            Precio
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              fontWeight: "600",
                              color: "#475569",
                              textAlign: "center",
                            }}
                          >
                            Acción
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {detectedProducts.map((p, idx) => (
                          <tr
                            key={p.id || idx}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td style={{ padding: "10px 16px" }}>
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDetectedProducts((prev) =>
                                    prev.map((item, i) =>
                                      i === idx ? { ...item, name: val } : item,
                                    ),
                                  );
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                }}
                              />
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <select
                                value={p.category || "food"}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDetectedProducts((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? {
                                            ...item,
                                            category: val,
                                            destination:
                                              val === "drinks"
                                                ? "bar"
                                                : "kitchen",
                                          }
                                        : item,
                                    ),
                                  );
                                }}
                                style={{
                                  padding: "6px 10px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  background: "white",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {productCategories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name} {cat.emoji || "🍽️"}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <input
                                type="text"
                                value={p.subcategory || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDetectedProducts((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, subcategory: val }
                                        : item,
                                    ),
                                  );
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                }}
                              />
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <input
                                type="text"
                                value={p.subgroup || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDetectedProducts((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, subgroup: val }
                                        : item,
                                    ),
                                  );
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                }}
                              />
                            </td>
                            <td
                              style={{
                                padding: "10px 16px",
                                textAlign: "right",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    marginRight: "4px",
                                    color: "#64748b",
                                  }}
                                >
                                  $
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={p.price}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setDetectedProducts((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? { ...item, price: val }
                                          : item,
                                      ),
                                    );
                                  }}
                                  style={{
                                    width: "80px",
                                    padding: "6px 10px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    textAlign: "right",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "10px 16px",
                                textAlign: "center",
                              }}
                            >
                              <button
                                onClick={() => {
                                  setDetectedProducts((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  );
                                }}
                                style={{
                                  color: "#ef4444",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.1rem",
                                }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {(manageMenuTab === "food" ||
            manageMenuTab === "drinks" ||
            manageMenuTab === "desserts") && (
            <div style={{ padding: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontWeight: "bold",
                    margin: "0",
                    color: "#1e293b",
                    textTransform: "capitalize",
                  }}
                >
                  {manageMenuTab === "food"
                    ? "Alimentos 🌮"
                    : manageMenuTab === "drinks"
                      ? "Bebidas 🍹"
                      : "Postres 🍰"}
                </h3>
                <IonButton
                  color="primary"
                  onClick={() =>
                    setProductCrudModal({ isOpen: true, product: null })
                  }
                >
                  <IonIcon icon={addOutline} slot="start" />
                  Nuevo Producto
                </IonButton>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "16px",
                  flexWrap: "wrap"
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar producto por nombre..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  style={{
                    flex: "1 1 200px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
                <select
                  value={menuFilterNode}
                  onChange={(e) => setMenuFilterNode(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    minWidth: "150px",
                    flex: "0 1 auto",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Todos los nodos</option>
                  {Array.from(
                    new Set(
                      products
                        .filter((p) => p.isDeleted !== true && p.category === manageMenuTab && p.subcategory)
                        .map((p) => p.subcategory)
                    )
                  ).sort().map((node) => (
                    <option key={node} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowDeletedProducts(!showDeletedProducts)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: showDeletedProducts ? "#f97316" : "#cbd5e1",
                    backgroundColor: showDeletedProducts ? "#fff7ed" : "white",
                    color: showDeletedProducts ? "#ea580c" : "#64748b",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "all 0.2s"
                  }}
                >
                  {showDeletedProducts ? "Ocultar Borrados" : "Mostrar Borrados"}
                </button>
              </div>
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    textAlign: "left",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    <tr>
                      <th style={{ padding: "12px 16px" }}>Nombre</th>
                      <th style={{ padding: "12px 16px" }}>Categoría</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>
                        Precio
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const searchTokens = menuSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
                      const filteredProducts = products
                        .filter((p) => p.category === manageMenuTab)
                        .filter((p) => showDeletedProducts ? true : p.isDeleted !== true)
                        .filter((p) => searchTokens.every(token => p.name.toLowerCase().includes(token)))
                        .filter((p) => !menuFilterNode || p.subcategory === menuFilterNode);

                      if (filteredProducts.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                padding: "32px",
                                textAlign: "center",
                                color: "#64748b",
                              }}
                            >
                              No hay productos registrados que coincidan con la búsqueda.
                            </td>
                          </tr>
                        );
                      }

                      return filteredProducts.map((p) => (
                          <tr
                            key={p.id}
                            style={{ 
                              borderBottom: "1px solid #e2e8f0",
                              backgroundColor: p.isDeleted ? "#ffedd5" : "transparent"
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 16px",
                                fontWeight: "500",
                                color: "#1e293b",
                              }}
                            >
                              {p.name} <br />
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}
                              >
                                {p.subcategory || ""}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {p.category === "food"
                                ? "Comida"
                                : p.category === "drinks"
                                  ? "Bebidas"
                                  : "Postre"}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "right",
                                fontWeight: "bold",
                                color: "#059669",
                              }}
                            >
                              ${p.price.toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "center",
                              }}
                            >
                              <button
                                onClick={() => {
                                  setProductCrudModal({
                                    isOpen: true,
                                    product: p,
                                  });
                                  // Forzar carga de notas rápidas si existen
                                  if (p.quickNotes) setCrudQuickNotes(p.quickNotes);
                                }}
                                style={{
                                  color: "#3b82f6",
                                  marginRight: "16px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  background: "none",
                                  border: "none",
                                }}
                              >
                                Editar
                              </button>
                              {p.isDeleted ? (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`¿Seguro que deseas recuperar ${p.name}?`)) {
                                      try {
                                        await updateProductInFirebase(p.id, { isDeleted: false });
                                        triggerAppNotification("Recuperado", `${p.name} ha sido recuperado`, "success");
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }
                                  }}
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    background: "none",
                                    border: "none",
                                  }}
                                >
                                  Recuperar
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setDeleteConfirmation({
                                      isOpen: true,
                                      type: "single",
                                      targetId: p.id,
                                      targetName: p.name,
                                    });
                                  }}
                                  style={{
                                    color: "#ef4444",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    background: "none",
                                    border: "none",
                                  }}
                                >
                                  Eliminar
                                </button>
                              )}
                            </td>
                          </tr>
                        ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {manageMenuTab === "recipes" && (
            <div style={{ padding: "10px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(300px, 1fr) minmax(400px, 1.5fr)",
                  gap: "24px",
                }}
              >
                {/* Left: Product Selection with Search Table */}
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <h3
                      style={{
                        fontWeight: "bold",
                        margin: "0 0 12px 0",
                        color: "#1e293b",
                      }}
                    >
                      🍔 Selección de Platillo
                    </h3>
                    <input
                      type="text"
                      placeholder="Buscar platillo por nombre..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      overflowY: "auto",
                      height: "400px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        textAlign: "left",
                        borderCollapse: "collapse",
                        fontSize: "0.85rem",
                      }}
                    >
                      <tbody>
                        {products
                          .filter((p) =>
                            p.name
                              .toLowerCase()
                              .includes(productSearch.toLowerCase()),
                          )
                          .map((p) => {
                            const isSelected =
                              selectedRecipeProduct?.id === p.id;
                            return (
                              <tr
                                key={p.id}
                                onClick={() => setSelectedRecipeProduct(p)}
                                style={{
                                  borderBottom: "1px solid #f1f5f9",
                                  cursor: "pointer",
                                  background: isSelected ? "#e0f2fe" : "white",
                                  borderLeft: isSelected
                                    ? "4px solid #0ea5e9"
                                    : "4px solid transparent",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "12px",
                                    fontWeight: isSelected ? "bold" : "normal",
                                    color: "#334155",
                                  }}
                                >
                                  {p.name} <br />
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "#64748b",
                                    }}
                                  >
                                    {p.category === "food"
                                      ? "Comida"
                                      : p.category === "drinks"
                                        ? "Bebidas"
                                        : "Postres"}{" "}
                                    - ${p.price}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Recipe Editor details */}
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: "bold",
                        margin: "0",
                        color: "#1e293b",
                      }}
                    >
                      🍲 Insumos:{" "}
                      <span style={{ color: "#4f46e5" }}>
                        {selectedRecipeProduct
                          ? selectedRecipeProduct.name
                          : "Ninguno seleccionado"}
                      </span>
                    </h3>
                    {selectedRecipeProduct && (
                      <button
                        onClick={() => setShowRecipeAddModal(true)}
                        style={{
                          background: "#3b82f6",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <IonIcon icon={addOutline} />
                        Agregar Insumo
                      </button>
                    )}
                  </div>

                  {selectedRecipeProduct ? (
                    <>
                      <div
                        style={{
                          overflowY: "auto",
                          height: "440px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            textAlign: "left",
                            borderCollapse: "collapse",
                            fontSize: "0.9rem",
                          }}
                        >
                          <thead
                            style={{
                              background: "#f8fafc",
                              color: "#64748b",
                              textTransform: "uppercase",
                              fontSize: "0.75rem",
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            <tr>
                              <th style={{ padding: "10px 16px" }}>Insumo</th>
                              <th style={{ padding: "10px 16px" }}>Unidad</th>
                              <th
                                style={{
                                  padding: "10px 16px",
                                  textAlign: "center",
                                }}
                              >
                                Cantidad en Platillo
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {!selectedRecipeProduct.recipe ||
                            selectedRecipeProduct.recipe.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  style={{
                                    textAlign: "center",
                                    padding: "32px",
                                    color: "#94a3b8",
                                  }}
                                >
                                  Este producto no tiene insumos.
                                  <br /> <br />
                                </td>
                              </tr>
                            ) : (
                              selectedRecipeProduct.recipe.map(
                                (rIng: any, index: number) => {
                                  const inv = inventory.find(
                                    (i) => i.id === rIng.inventoryItemId,
                                  );
                                  if (!inv) return null;
                                  return (
                                    <tr
                                      key={
                                        selectedRecipeProduct.id +
                                        "-" +
                                        rIng.inventoryItemId
                                      }
                                      style={{
                                        borderBottom: "1px solid #f1f5f9",
                                        background: "white",
                                      }}
                                    >
                                      <td
                                        style={{
                                          padding: "12px 16px",
                                          fontWeight: "bold",
                                          color: "#334155",
                                        }}
                                      >
                                        {inv.name}
                                      </td>
                                      <td
                                        style={{
                                          padding: "12px 16px",
                                          color: "#64748b",
                                        }}
                                      >
                                        {inv.unit}
                                      </td>
                                      <td
                                        style={{
                                          padding: "12px 16px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          defaultValue={rIng.quantity}
                                          placeholder="0"
                                          onBlur={(e) => {
                                            let val = parseFloat(
                                              e.target.value,
                                            );
                                            const currentRecipe = [
                                              ...selectedRecipeProduct.recipe,
                                            ];
                                            if (!isNaN(val) && val > 0) {
                                              if (
                                                currentRecipe[index]
                                                  .quantity !== val
                                              ) {
                                                currentRecipe[index] = {
                                                  ...currentRecipe[index],
                                                  quantity: val,
                                                };
                                                updateProductInFirebase(
                                                  selectedRecipeProduct.id,
                                                  {
                                                    ...selectedRecipeProduct,
                                                    recipe: currentRecipe,
                                                  },
                                                ).then(() => {
                                                  setSelectedRecipeProduct({
                                                    ...selectedRecipeProduct,
                                                    recipe: currentRecipe,
                                                  });
                                                });
                                              }
                                            } else {
                                              currentRecipe.splice(index, 1);
                                              updateProductInFirebase(
                                                selectedRecipeProduct.id,
                                                {
                                                  ...selectedRecipeProduct,
                                                  recipe: currentRecipe,
                                                },
                                              ).then(() => {
                                                setSelectedRecipeProduct({
                                                  ...selectedRecipeProduct,
                                                  recipe: currentRecipe,
                                                });
                                              });
                                              e.target.value = "";
                                            }
                                          }}
                                          style={{
                                            width: "80px",
                                            padding: "8px",
                                            border: "1px solid #cbd5e1",
                                            borderRadius: "8px",
                                            textAlign: "right",
                                            fontWeight: "bold",
                                          }}
                                        />
                                      </td>
                                      <td
                                        style={{
                                          padding: "12px 16px",
                                          textAlign: "right",
                                        }}
                                      >
                                        <button
                                          onClick={() => {
                                            const currentRecipe = [
                                              ...selectedRecipeProduct.recipe,
                                            ];
                                            currentRecipe.splice(index, 1);
                                            updateProductInFirebase(
                                              selectedRecipeProduct.id,
                                              {
                                                ...selectedRecipeProduct,
                                                recipe: currentRecipe,
                                              },
                                            ).then(() => {
                                              setSelectedRecipeProduct({
                                                ...selectedRecipeProduct,
                                                recipe: currentRecipe,
                                              });
                                            });
                                          }}
                                          style={{
                                            color: "#ef4444",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Quitar
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                },
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "64px 32px",
                        background: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        borderRadius: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      <IonIcon
                        icon={restaurantOutline}
                        style={{
                          fontSize: "3rem",
                          marginBottom: "16px",
                          opacity: 0.5,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "1rem",
                          fontWeight: "500",
                          margin: 0,
                        }}
                      >
                        Elige un platillo de la lista para editar su receta
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {manageMenuTab === "adhoc_notes" && (
            <div style={{ padding: "10px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "16px",
                  marginBottom: "24px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "2rem" }}>🧠✨</span>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800" }}>
                    Notas de Personalización con Inteligencia Artificial
                  </h2>
                </div>
                <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.5" }}>
                  Analiza de manera inteligente todo tu menú de productos y genera de forma automática sugerencias
                  rápidas y notas comunes ("ad-hoc") que aparecerán por defecto en el panel de notas de cada producto al
                  tomar una comanda (ej. "Con vaso, con hielos" para refrescos, "Sin verdura, con cilantro, sin cebolla" para tacos, etc.).
                </p>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <IonButton
                    disabled={iaNotesLoading}
                    onClick={handleGenerateAdHocNotes}
                    style={{
                      "--background": "#f59e0b",
                      "--color": "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {iaNotesLoading ? (
                      <>
                        <IonSpinner name="crescent" style={{ marginRight: "8px" }} />
                        Analizando menú con IA...
                      </>
                    ) : (
                      "Generar Notas Ad-Hoc con IA 🧠✨"
                    )}
                  </IonButton>

                  <IonButton
                    fill="outline"
                    color="light"
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas borrar las notas ad-hoc de TODOS los productos?")) {
                        products.forEach(p => {
                          updateProductInFirebase(p.id, { quickNotes: [] });
                        });
                        alert("🧹 Se han limpiado las notas ad-hoc de todos los productos.");
                      }
                    }}
                    style={{ fontWeight: "bold" }}
                  >
                    🗑️ Limpiar todas las Notas
                  </IonButton>
                </div>

                {iaNotesError && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #ef4444",
                      borderRadius: "8px",
                      padding: "12px",
                      marginTop: "16px",
                      color: "#fca5a5",
                      fontSize: "0.85rem",
                    }}
                  >
                    {iaNotesError}
                  </div>
                )}
              </div>

              {/* List of Products with Notes */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <h3 style={{ margin: 0, fontWeight: "800", color: "#1e293b", fontSize: "1.1rem" }}>
                    📋 Catálogo de Productos y Notas Asignadas ({products.length} productos)
                  </h3>
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre o subcategoría..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      minWidth: "240px",
                    }}
                  />
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                      fontSize: "0.85rem",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
                        <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>Producto</th>
                        <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>Categoría</th>
                        <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>Subcategoría</th>
                        <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>Notas Ad-Hoc / Mensajes Default</th>
                        <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569", textAlign: "right" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                            No hay productos registrados en el menú. Carga o crea productos primero.
                          </td>
                        </tr>
                      ) : (
                        products
                          .filter((p) => {
                            const query = productSearch.toLowerCase();
                            return (
                              p.name.toLowerCase().includes(query) ||
                              (p.subcategory || "").toLowerCase().includes(query)
                            );
                          })
                          .map((p) => {
                            const isEditing = editingNoteProductId === p.id;
                            return (
                              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#1e293b" }}>
                                  {p.name}
                                </td>
                                <td style={{ padding: "12px 16px", color: "#64748b" }}>
                                  <span
                                    style={{
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      background: p.category === "food" ? "#fee2e2" : p.category === "drinks" ? "#ecfeff" : "#fdf4ff",
                                      color: p.category === "food" ? "#b91c1c" : p.category === "drinks" ? "#0e7490" : "#a21caf",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {p.category === "food" ? "Comida 🌮" : p.category === "drinks" ? "Bebida 🍹" : "Postre 🍰"}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 16px", color: "#64748b" }}>
                                  {p.subcategory || "General"}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  {isEditing ? (
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                      <input
                                        type="text"
                                        value={editingNoteText}
                                        onChange={(e) => setEditingNoteText(e.target.value)}
                                        placeholder="Separadas por comas, ej: Sin hielo, Con vaso"
                                        style={{
                                          padding: "6px 10px",
                                          border: "1px solid #3b82f6",
                                          borderRadius: "6px",
                                          fontSize: "0.85rem",
                                          width: "100%",
                                          maxWidth: "320px",
                                        }}
                                      />
                                      <button
                                        onClick={async () => {
                                          const notes = editingNoteText
                                            .split(",")
                                            .map((n) => n.trim())
                                            .filter(Boolean);
                                          await updateProductInFirebase(p.id, { quickNotes: notes });
                                          setEditingNoteProductId(null);
                                        }}
                                        style={{
                                          background: "#10b981",
                                          color: "white",
                                          border: "none",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          fontWeight: "bold",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        onClick={() => setEditingNoteProductId(null)}
                                        style={{
                                          background: "#94a3b8",
                                          color: "white",
                                          border: "none",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          fontWeight: "bold",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                      {p.quickNotes && p.quickNotes.length > 0 ? (
                                        p.quickNotes.map((note) => (
                                          <span
                                            key={note}
                                            style={{
                                              background: "#f1f5f9",
                                              color: "#334155",
                                              padding: "4px 8px",
                                              borderRadius: "8px",
                                              fontSize: "0.75rem",
                                              border: "1px solid #e2e8f0",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {note}
                                          </span>
                                        ))
                                      ) : (
                                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>
                                          Sin notas asignadas (se usarán por default si es taco o nada)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                  {!isEditing && (
                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                      <button
                                        onClick={() => {
                                          setEditingNoteProductId(p.id);
                                          setEditingNoteText((p.quickNotes || []).join(", "));
                                        }}
                                        style={{
                                          color: "#3b82f6",
                                          background: "none",
                                          border: "none",
                                          fontWeight: "bold",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Editar ✏️
                                      </button>
                                      {p.quickNotes && p.quickNotes.length > 0 && (
                                        <button
                                          onClick={async () => {
                                            if (confirm(`¿Borrar las notas de ${p.name}?`)) {
                                              await updateProductInFirebase(p.id, { quickNotes: [] });
                                            }
                                          }}
                                          style={{
                                            color: "#ef4444",
                                            background: "none",
                                            border: "none",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                          }}
                                        >
                                          Borrar 🗑️
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {manageMenuTab === "split_products" && (
            <div style={{ padding: "10px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "16px",
                  marginBottom: "24px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "2rem" }}>🥞✨</span>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800" }}>
                    Separar Productos Comprimidos o Juntos
                  </h2>
                </div>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "#e0e7ff", lineHeight: "1.5" }}>
                  ¿Tienes productos registrados juntos como <strong>"Taco de Pastor/Chorizo/Carnitas"</strong> para ahorrar espacio?
                  Esta herramienta los detecta y separa de manera automatizada en productos individuales con el mismo precio, categoría y subcategoría para agilizar tus comandas.
                </p>
              </div>

              {/* Recomendaciones */}
              {products.filter(p => p.name.includes("/") || p.name.includes(",") || p.name.toLowerCase().includes(" o ")).length > 0 && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <h4 style={{ margin: "0 0 10px 0", color: "#166534", fontWeight: "bold", fontSize: "0.95rem" }}>
                    💡 Productos detectados listos para separar:
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {products
                      .filter(p => p.name.includes("/") || p.name.includes(",") || p.name.toLowerCase().includes(" o "))
                      .map(p => (
                        <button
                          key={`rec-${p.id}`}
                          onClick={() => {
                            setSplitSelectedProductId(p.id);
                            const parsed = parseSplitProducts(p.name);
                            setSplitProposedItems(parsed.map(name => ({ name, price: p.price })));
                          }}
                          style={{
                            background: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontWeight: "600",
                            color: "#1e293b",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#4f46e5";
                            e.currentTarget.style.background = "#f5f3ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#cbd5e1";
                            e.currentTarget.style.background = "white";
                          }}
                        >
                          🥞 {p.name} (${p.price.toFixed(2)})
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Formulario Principal */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "700", color: "#1e293b", marginBottom: "8px", fontSize: "0.9rem" }}>
                    Elige el producto original a separar:
                  </label>
                  <select
                    value={splitSelectedProductId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitSelectedProductId(val);
                      if (val) {
                        const original = products.find(p => p.id === val);
                        if (original) {
                          const parsed = parseSplitProducts(original.name);
                          setSplitProposedItems(parsed.map(name => ({ name, price: original.price })));
                        }
                      } else {
                        setSplitProposedItems([]);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.subcategory || "General"}) - ${p.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {splitSelectedProductId && (
                  <div style={{ animation: "fadeIn 0.2s ease-in-out" }}>
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "20px",
                      }}
                    >
                      <h4 style={{ margin: "0 0 12px 0", color: "#1e293b", fontWeight: "800", fontSize: "0.95rem" }}>
                        ✨ Vista Previa de la Separación
                      </h4>
                      <p style={{ margin: "0 0 16px 0", fontSize: "0.82rem", color: "#64748b" }}>
                        Hemos analizado el nombre del producto original y propuesto las siguientes variantes. Puedes editar el nombre final y el precio de cada uno antes de confirmar:
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {splitProposedItems.map((item, index) => (
                          <div
                            key={`prop-${index}`}
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              background: "white",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                            }}
                          >
                            <span style={{ fontWeight: "bold", color: "#4f46e5", minWidth: "24px" }}>
                              #{index + 1}
                            </span>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>
                                Nombre del producto
                              </label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const updated = [...splitProposedItems];
                                  updated[index].name = e.target.value;
                                  setSplitProposedItems(updated);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                }}
                              />
                            </div>
                            <div style={{ width: "120px" }}>
                              <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>
                                Precio ($)
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={item.price}
                                onChange={(e) => {
                                  const updated = [...splitProposedItems];
                                  updated[index].price = parseFloat(e.target.value) || 0;
                                  setSplitProposedItems(updated);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                  fontWeight: "700",
                                  textAlign: "right",
                                }}
                              />
                            </div>
                            <button
                              onClick={() => {
                                setSplitProposedItems(prev => prev.filter((_, idx) => idx !== index));
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "1.2rem",
                                padding: "4px",
                              }}
                              title="Eliminar variante"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => {
                            setSplitProposedItems(prev => [...prev, { name: "", price: 0 }]);
                          }}
                          style={{
                            background: "#eef2ff",
                            color: "#4f46e5",
                            border: "1px dashed #c7d2fe",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          ➕ Agregar Variante Manual
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="delete-original-cb"
                        checked={splitDeletedOriginal}
                        onChange={(e) => setSplitDeletedOriginal(e.target.checked)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <label htmlFor="delete-original-cb" style={{ fontSize: "0.85rem", color: "#334155", fontWeight: "600", cursor: "pointer" }}>
                        🗑️ Eliminar el producto original agrupado tras realizar la separación exitosa
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => {
                          setSplitSelectedProductId("");
                          setSplitProposedItems([]);
                        }}
                        style={{
                          background: "#94a3b8",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          if (splitProposedItems.length === 0) {
                            alert("Por favor agrega al menos una variante para crear.");
                            return;
                          }
                          let original = products.find(p => p.id === splitSelectedProductId);
                          if (!original) {
                            original = products.find(p => p.name === splitSelectedProductId);
                          }
                          if (!original) {
                            alert("⚠️ Error: No se pudo localizar el producto original seleccionado en el catálogo actual de la sucursal.");
                            return;
                          }

                           // Execute splitting with MySQL-style design with unique UUIDs and Timestamps
                           try {
                             let idx = 0;
                             for (const item of splitProposedItems) {
                               if (!item.name.trim()) continue;
                               const uniqueUuid = generateUUID();
                               const nowTimestamp = getMexicoISOString().slice(0, 19).replace("T", " "); // MySQL timestamp format YYYY-MM-DD HH:mm:ss
                               const newId = `prod_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000000)}`;

                               await addProductToFirebase({
                                 id: newId,
                                 uuid: uniqueUuid,
                                 created_at: nowTimestamp,
                                 updated_at: nowTimestamp,
                                 name: item.name.trim(),
                                 price: item.price,
                                 category: original.category,
                                 subcategory: original.subcategory || "General",
                                 subgroup: original.subgroup || "",
                                 drinkType: original.drinkType || null,
                                 destination: original.destination || (original.category === "drinks" ? "bar" : "kitchen"),
                                 quickNotes: original.quickNotes || [],
                               });
                               idx++;
                             }

                            if (splitDeletedOriginal) {
                              await deleteProductFromFirebase(original.id);
                            }

                            // 🔔 Push real-time notification
                            triggerAppNotification(
                              "🥞 Sincronización Exitosa (WebSockets)",
                              `Se han creado ${splitProposedItems.length} registros individuales con UUIDs únicos en base de datos.`,
                              "success"
                            );

                            // 🔌 Log a continuous synchronization event in WebSocket logs
                            const wsLogItem = {
                              id: `ws-event-${Date.now()}`,
                              uid: generateUUID(),
                              event: "MYSQL_SYNC",
                              topic: `sync:products:${selectedTenant?.id || "general"}`,
                              timestamp: getMexicoISOString(),
                              details: `🔄 WebSocket: Separación de "${original.name}" en [${splitProposedItems.map(it => it.name).join(", ")}] realizada. ${splitProposedItems.length} registros sincronizados con éxito.`,
                            };
                            setWebsocketSyncLog(prev => [wsLogItem, ...prev]);

                            // Reset form
                            setSplitSelectedProductId("");
                            setSplitProposedItems([]);
                          } catch (err: any) {
                            alert("Ocurrió un error al realizar la separación: " + err.message);
                          }
                        }}
                        style={{
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          padding: "10px 24px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
                        }}
                      >
                        🥞 Confirmar y Separar Productos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {manageMenuTab === "relation_order_ia" && (() => {
            const filteredMatches = relationMatches.filter(match => {
              const pObj = products.find(p => p.id === match.productId);
              const q = relationSearch.trim().toLowerCase();
              if (q) {
                const searchTerms = q.split(/\s+/).filter(Boolean);
                if (searchTerms.length === 0) return true;
                
                const targetText = [
                  match.originalName,
                  match.proposedReportName,
                  pObj?.subcategory,
                  pObj?.subgroup,
                  pObj?.category
                ].filter(Boolean).join(" ").toLowerCase();
                
                return searchTerms.every(term => targetText.includes(term));
              }
              return true;
            });

            const handleBulkAddSortOrder = (amount: number) => {
              if (relationMatches.length === 0) {
                alert("No hay productos en la lista para modificar.");
                return;
              }
              const confirm = window.confirm(`¿Estás seguro de que deseas sumar ${amount} a la prioridad de orden de todos los productos en la lista?`);
              if (!confirm) return;

              setRelationMatches(prev => prev.map(match => {
                const currentOrder = Number(match.proposedSortOrder) || 0;
                return {
                  ...match,
                  proposedSortOrder: currentOrder + amount
                };
              }));

              triggerAppNotification(
                "Orden Actualizado",
                `Se sumó ${amount} al orden de todos los productos.`,
                "success"
              );
            };

            return (
              <div style={{ padding: "10px" }}>
                {/* Generador Local */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    marginBottom: "24px",
                    textAlign: "center"
                  }}
                >
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                    ⚡ Generador Automático Local
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "20px" }}>
                    Carga la lista completa de los {products.length} productos y genera automáticamente las propuestas de nombres completos y orden secuencial.
                  </p>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={loadAutoFormattedList}
                      style={{
                        background: "#0284c7",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 6px rgba(2, 132, 199, 0.2)",
                      }}
                    >
                      <span>⚡ Generar Sugerencias del Catálogo</span>
                    </button>
                    {relationMatches.length > 0 && (
                      <button
                        onClick={() => {
                          setRelationMatches([]);
                          setRelationLog([]);
                          setRelationSearch("");
                        }}
                        style={{
                          background: "#64748b",
                          color: "white",
                          border: "none",
                          padding: "12px 20px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabla de Resultados de Relación */}
                {relationMatches.length > 0 && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "1px solid #cbd5e1",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                          📋 Tabla de Modificaciones Propuestas
                        </h3>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                          Revisa y edita los nombres y el orden de los productos en tus reportes. Usa la vista de árbol para arrastrar y reordenar fácilmente.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        {/* Selector de Modo de Vista */}
                        <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                          <button
                            type="button"
                            onClick={() => setManageMenuViewMode("tree")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "0.78rem",
                              fontWeight: "bold",
                              border: "none",
                              cursor: "pointer",
                              background: manageMenuViewMode === "tree" ? "#4f46e5" : "transparent",
                              color: manageMenuViewMode === "tree" ? "white" : "#64748b",
                              transition: "all 0.2s"
                            }}
                          >
                            🌳 Vista de Árbol (Drag & Drop)
                          </button>
                          <button
                            type="button"
                            onClick={() => setManageMenuViewMode("table")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "0.78rem",
                              fontWeight: "bold",
                              border: "none",
                              cursor: "pointer",
                              background: manageMenuViewMode === "table" ? "#4f46e5" : "transparent",
                              color: manageMenuViewMode === "table" ? "white" : "#64748b",
                              transition: "all 0.2s"
                            }}
                          >
                            📋 Vista de Tabla
                          </button>
                        </div>

                        {manageMenuViewMode === "tree" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={expandAllTreeNodes}
                              style={{
                                background: "white",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                color: "#334155"
                              }}
                            >
                              📖 Desplegar Todo
                            </button>
                            <button
                              type="button"
                              onClick={() => collapseAllTreeNodes(relationMatches)}
                              style={{
                                background: "white",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                color: "#334155"
                              }}
                            >
                              📕 Colapsar Todo
                            </button>
                          </div>
                        )}

                        <input
                          type="text"
                          placeholder="Buscar producto..."
                          value={relationSearch}
                          onChange={(e) => setRelationSearch(e.target.value)}
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            width: "200px",
                            background: "white"
                          }}
                        />
                      </div>
                    </div>

                    {selectedRelationProductIds.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                          border: "2px solid #6366f1",
                          borderRadius: "16px",
                          padding: "16px 20px",
                          marginBottom: "16px",
                          boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(99, 102, 241, 0.15)",
                          flexWrap: "wrap",
                          gap: "16px",
                          position: "sticky",
                          top: "0",
                          zIndex: 50,
                          transition: "all 0.3s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.1rem" }}>⚡</span>
                          <div>
                            <div style={{ fontWeight: "800", color: "#4f46e5", fontSize: "0.95rem" }}>
                              {selectedRelationProductIds.length} productos seleccionados
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedRelationProductIds([]);
                              }}
                              style={{
                                background: "transparent",
                                color: "#64748b",
                                border: "none",
                                padding: 0,
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                textAlign: "left"
                              }}
                            >
                              Limpiar selección
                            </button>
                          </div>
                        </div>

                        {/* Mover Orden en Bloque */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", marginRight: "4px" }}>ORDEN:</span>
                          <button
                            onClick={(e) => { e.preventDefault(); moveSelectedUp(); }}
                            style={{
                              background: "white",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#1e293b"; }}
                          >
                            ⬆️ Subir
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); moveSelectedDown(); }}
                            style={{
                              background: "white",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#1e293b"; }}
                          >
                            ⬇️ Bajar
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); moveSelectedToTop(); }}
                            style={{
                              background: "white",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#1e293b"; }}
                          >
                            🔝 Al Inicio
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); moveSelectedToBottom(); }}
                            style={{
                              background: "white",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#1e293b"; }}
                          >
                            🔚 Al Final
                          </button>
                        </div>

                        {/* Modificaciones en Lote */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          {/* Cambiar Subgrupo */}
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            <input
                              type="text"
                              placeholder="Nuevo Subgrupo"
                              value={bulkSubgroup}
                              onChange={(e) => setBulkSubgroup(e.target.value)}
                              list="bulk-subgroups-list"
                              style={{
                                padding: "6px 10px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                width: "130px",
                                background: "white"
                              }}
                            />
                            <datalist id="bulk-subgroups-list">
                              {Array.from(new Set(relationMatches.map(m => m.proposedSubgroup).filter(Boolean))).map(sg => (
                                <option key={sg} value={sg} />
                              ))}
                            </datalist>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!bulkSubgroup) return;
                                applyBulkSubgroup(bulkSubgroup);
                                setBulkSubgroup("");
                              }}
                              style={{
                                background: "#4f46e5",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                            >
                              Aplicar
                            </button>
                          </div>

                          {/* Cambiar Sección */}
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            <input
                              type="text"
                              placeholder="Nueva Sección"
                              value={bulkSubcategory}
                              onChange={(e) => setBulkSubcategory(e.target.value)}
                              list="bulk-subcategories-list"
                              style={{
                                padding: "6px 10px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                width: "130px",
                                background: "white"
                              }}
                            />
                            <datalist id="bulk-subcategories-list">
                              {Array.from(new Set(relationMatches.map(m => m.proposedSubcategory).filter(Boolean))).map(sc => (
                                <option key={sc} value={sc} />
                              ))}
                            </datalist>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!bulkSubcategory) return;
                                applyBulkSubcategory(bulkSubcategory);
                                setBulkSubcategory("");
                              }}
                              style={{
                                background: "#0d9488",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                            >
                              Sección
                            </button>
                          </div>

                          {/* Alternar Letra */}
                          <button
                            onClick={(e) => { e.preventDefault(); applyBulkCaseToggle(); }}
                            style={{
                              background: "#f1f5f9",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                            title="Alternar Mayuscular/Capitalizado"
                          >
                            🔠 Alternar Letra
                          </button>

                          {/* Botón de Guardar en la Barra Superior */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              saveRelationChanges(false, false);
                            }}
                            style={{
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 14px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginLeft: "auto"
                            }}
                            title="Guardar todos los cambios de subgrupos, secciones y nombres a la base de datos de inmediato"
                          >
                            💾 Guardar Cambios BD
                          </button>
                        </div>
                      </div>
                    )}

                    {/* VISTA DE ÁRBOLES O TABLA */}
                    {manageMenuViewMode === "tree" ? (
                      <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(() => {
                          const secObj: Record<string, Record<string, typeof relationMatches>> = {};
                          filteredMatches.forEach(match => {
                            const sec = (match.proposedSubcategory || "Sin Sección").trim() || "Sin Sección";
                            const sub = (match.proposedSubgroup || "Sin Subgrupo").trim() || "Sin Subgrupo";
                            if (!secObj[sec]) secObj[sec] = {};
                            if (!secObj[sec][sub]) secObj[sec][sub] = [];
                            secObj[sec][sub].push(match);
                          });

                          const sectionKeys = Object.keys(secObj);

                          if (sectionKeys.length === 0) {
                            return (
                              <div style={{ textAlign: "center", padding: "30px", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                                No se encontraron productos coincidentes con la búsqueda.
                              </div>
                            );
                          }

                          return sectionKeys.map((secName) => {
                            const subObj = secObj[secName];
                            const isSecCollapsed = !!collapsedTreeSections[secName];
                            const secKey = `sec_${secName}`;
                            const isSecDragOver = treeDragOverTargetKey === secKey;
                            const subKeys = Object.keys(subObj);
                            const totalSecProducts = subKeys.reduce((acc, k) => acc + subObj[k].length, 0);

                            return (
                              <div
                                key={secName}
                                draggable={true}
                                onDragStart={(e) => handleTreeDragStart(e, "section", secName)}
                                onDragOver={(e) => handleTreeDragOver(e, secKey)}
                                onDrop={(e) => handleTreeDrop(e, "section", secName)}
                                style={{
                                  border: isSecDragOver ? "3px solid #6366f1" : "2px solid #cbd5e1",
                                  borderRadius: "14px",
                                  background: isSecDragOver ? "#eef2ff" : "#f8fafc",
                                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                  overflow: "hidden",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                {/* Header de Sección */}
                                <div
                                  style={{
                                    padding: "12px 16px",
                                    background: "linear-gradient(90deg, #1e293b 0%, #334155 100%)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    cursor: "grab",
                                    userSelect: "none"
                                  }}
                                  title="Arrastra desde aquí para reordenar esta Sección entera"
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#93c5fd" }}>⋮⋮ 🪢 📂</span>
                                    <span style={{ fontWeight: "800", fontSize: "1rem", letterSpacing: "0.5px" }}>
                                      SECCIÓN: {secName.toUpperCase()}
                                    </span>
                                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>
                                      {totalSecProducts} {totalSecProducts === 1 ? "producto" : "productos"}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newSecName = window.prompt("Modificar nombre de la sección:", secName);
                                        if (newSecName && newSecName.trim() !== "" && newSecName.trim() !== secName) {
                                          const trimmed = newSecName.trim();
                                          setRelationMatches(prev => prev.map(m => {
                                            if ((m.proposedSubcategory || "Sin Sección").trim() === secName) {
                                              return { ...m, proposedSubcategory: trimmed };
                                            }
                                            return m;
                                          }));
                                        }
                                      }}
                                      style={{
                                        background: "rgba(255,255,255,0.15)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        color: "white",
                                        borderRadius: "8px",
                                        padding: "4px 10px",
                                        fontSize: "0.75rem",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                      }}
                                    >
                                      <span>✏️ Editar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTreeSectionCollapse(secName);
                                      }}
                                      style={{
                                        background: "rgba(255,255,255,0.15)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        color: "white",
                                        borderRadius: "8px",
                                        padding: "4px 10px",
                                        fontSize: "0.75rem",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                      }}
                                    >
                                      <span>{isSecCollapsed ? "Desplegar ▶" : "Colapsar ▼"}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Subgrupos y Productos de la Sección */}
                                {!isSecCollapsed && (
                                  <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {subKeys.map((subName) => {
                                      const items = subObj[subName];
                                      const subKey = `sub_${secName}_${subName}`;
                                      const fullSubKey = `${secName}___${subName}`;
                                      const isSubCollapsed = !!collapsedTreeSubgroups[fullSubKey];
                                      const isSubDragOver = treeDragOverTargetKey === subKey;

                                      return (
                                        <div
                                          key={subName}
                                          draggable={true}
                                          onDragStart={(e) => handleTreeDragStart(e, "subgroup", secName, subName)}
                                          onDragOver={(e) => handleTreeDragOver(e, subKey)}
                                          onDrop={(e) => handleTreeDrop(e, "subgroup", secName, subName)}
                                          style={{
                                            border: isSubDragOver ? "2.5px solid #6366f1" : "1.5px solid #cbd5e1",
                                            borderRadius: "12px",
                                            background: isSubDragOver ? "#e0e7ff" : "white",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                                            overflow: "hidden",
                                            transition: "all 0.2s ease"
                                          }}
                                        >
                                          {/* Header de Subgrupo */}
                                          <div
                                            style={{
                                              padding: "10px 14px",
                                              background: "#f1f5f9",
                                              borderBottom: isSubCollapsed ? "none" : "1px solid #e2e8f0",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              cursor: "grab",
                                              userSelect: "none"
                                            }}
                                            title="Arrastra desde aquí para mover el Subgrupo"
                                          >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                              <span style={{ fontSize: "1.1rem", color: "#6366f1", fontWeight: "bold" }}>⋮⋮ 🪢 📁</span>
                                              <span style={{ fontWeight: "800", fontSize: "0.9rem", color: "#1e293b" }}>
                                                SUBGRUPO: {subName}
                                              </span>
                                              <span style={{ background: "#e2e8f0", color: "#475569", padding: "2px 8px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "700" }}>
                                                {items.length} productos
                                              </span>
                                            </div>

                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const newSubName = window.prompt("Modificar nombre del subgrupo:", subName);
                                                  if (newSubName && newSubName.trim() !== "" && newSubName.trim() !== subName) {
                                                    const trimmed = newSubName.trim();
                                                    setRelationMatches(prev => prev.map(m => {
                                                      if ((m.proposedSubcategory || "Sin Sección").trim() === secName && (m.proposedSubgroup || "Sin Subgrupo").trim() === subName) {
                                                        return { ...m, proposedSubgroup: trimmed };
                                                      }
                                                      return m;
                                                    }));
                                                  }
                                                }}
                                                style={{
                                                  background: "white",
                                                  border: "1px solid #cbd5e1",
                                                  color: "#475569",
                                                  borderRadius: "6px",
                                                  padding: "3px 8px",
                                                  fontSize: "0.7rem",
                                                  fontWeight: "bold",
                                                  cursor: "pointer"
                                                }}
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleTreeSubgroupCollapse(fullSubKey);
                                                }}
                                                style={{
                                                  background: "white",
                                                  border: "1px solid #cbd5e1",
                                                  color: "#475569",
                                                  borderRadius: "6px",
                                                  padding: "3px 8px",
                                                  fontSize: "0.7rem",
                                                  fontWeight: "bold",
                                                  cursor: "pointer"
                                                }}
                                              >
                                                {isSubCollapsed ? "▶" : "▼"}
                                              </button>
                                            </div>
                                          </div>

                                          {/* Lista de Productos del Subgrupo */}
                                          {!isSubCollapsed && (
                                            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                              {items.map((match) => {
                                                const pObj = products.find(p => p.id === match.productId);
                                                if (!pObj) return null;
                                                const prodKey = `prod_${match.productId}`;
                                                const isProdDragOver = treeDragOverTargetKey === prodKey;
                                                const idx = relationMatches.findIndex(m => m.productId === match.productId);

                                                return (
                                                  <div
                                                    key={match.productId}
                                                    draggable={true}
                                                    onDragStart={(e) => handleTreeDragStart(e, "product", secName, subName, match.productId)}
                                                    onDragOver={(e) => handleTreeDragOver(e, prodKey)}
                                                    onDrop={(e) => handleTreeDrop(e, "product", secName, subName, match.productId)}
                                                    style={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "space-between",
                                                      padding: "8px 12px",
                                                      borderRadius: "10px",
                                                      border: isProdDragOver ? "2px solid #6366f1" : "1px solid #e2e8f0",
                                                      background: selectedRelationProductIds.includes(match.productId)
                                                        ? "#f0fdf4"
                                                        : isProdDragOver
                                                        ? "#eef2ff"
                                                        : "#fafafa",
                                                      transition: "all 0.15s ease",
                                                      gap: "10px",
                                                      flexWrap: "wrap"
                                                    }}
                                                  >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "220px" }}>
                                                      {/* Checkbox */}
                                                      <input
                                                        type="checkbox"
                                                        checked={selectedRelationProductIds.includes(match.productId)}
                                                        onChange={() => {
                                                          const isSelected = selectedRelationProductIds.includes(match.productId);
                                                          if (isSelected) {
                                                            setSelectedRelationProductIds(prev => prev.filter(id => id !== match.productId));
                                                          } else {
                                                            setSelectedRelationProductIds(prev => [...prev, match.productId]);
                                                          }
                                                        }}
                                                        style={{ transform: "scale(1.2)", cursor: "pointer" }}
                                                        onClick={(e) => e.stopPropagation()}
                                                      />

                                                      {/* Grip handle emoji */}
                                                      <span
                                                        style={{
                                                          cursor: "grab",
                                                          userSelect: "none",
                                                          fontSize: "1.1rem",
                                                          color: "#6366f1",
                                                          fontWeight: "900"
                                                        }}
                                                        title="Arrastra para mover este producto"
                                                      >
                                                        ⋮⋮ 🪢 📦
                                                      </span>

                                                      {/* Product info */}
                                                      <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                          <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "0.9rem" }}>
                                                            {match.proposedReportName}
                                                          </span>
                                                        </div>
                                                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                                                          Original: <strong style={{ color: "#334155" }}>{match.originalName}</strong>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {/* Orden input & Actions */}
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "800" }}>ORDEN:</span>
                                                        <input
                                                          type="number"
                                                          value={match.proposedSortOrder === 9999 ? "" : match.proposedSortOrder}
                                                          placeholder="9999"
                                                          onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedSortOrder: val } : m));
                                                          }}
                                                          style={{
                                                            width: "60px",
                                                            padding: "4px 6px",
                                                            border: "1px solid #cbd5e1",
                                                            borderRadius: "6px",
                                                            fontSize: "0.8rem",
                                                            textAlign: "center",
                                                            fontWeight: "bold",
                                                            background: "white"
                                                          }}
                                                        />
                                                      </div>

                                                      <button
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          const nextText = toggleTextCase(match.proposedReportName);
                                                          setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedReportName: nextText } : m));
                                                        }}
                                                        style={{
                                                          background: "#f1f5f9",
                                                          border: "1px solid #cbd5e1",
                                                          borderRadius: "6px",
                                                          padding: "4px 8px",
                                                          cursor: "pointer",
                                                          fontSize: "0.8rem"
                                                        }}
                                                        title="Alternar Mayúsculas"
                                                      >
                                                        🔠
                                                      </button>

                                                      <button
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          setProductCrudModal({ isOpen: true, product: pObj });
                                                        }}
                                                        style={{
                                                          background: "#4f46e5",
                                                          color: "white",
                                                          border: "none",
                                                          borderRadius: "6px",
                                                          padding: "4px 10px",
                                                          fontSize: "0.75rem",
                                                          fontWeight: "bold",
                                                          cursor: "pointer"
                                                        }}
                                                      >
                                                        ✏️ Editar
                                                      </button>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                    <div style={{ overflowX: "auto", marginBottom: "20px", maxHeight: "500px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", textAlign: "left" }}>
                            <th style={{ padding: "12px", width: "40px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={filteredMatches.length > 0 && filteredMatches.every(m => selectedRelationProductIds.includes(m.productId))}
                                onChange={(e) => {
                                  const isAllSelected = filteredMatches.length > 0 && filteredMatches.every(m => selectedRelationProductIds.includes(m.productId));
                                  if (isAllSelected) {
                                    setSelectedRelationProductIds(prev => prev.filter(id => !filteredMatches.some(m => m.productId === id)));
                                  } else {
                                    const next = [...selectedRelationProductIds];
                                    filteredMatches.forEach(m => {
                                      if (!next.includes(m.productId)) next.push(m.productId);
                                    });
                                    setSelectedRelationProductIds(next);
                                  }
                                }}
                                style={{ transform: "scale(1.2)", cursor: "pointer" }}
                              />
                            </th>
                            <th style={{ padding: "12px", width: "50px", textAlign: "center", color: "#475569", fontWeight: "700" }}>Mover</th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700" }}>Producto Original (Waiter Menu)</th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700" }}>Subgrupo</th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700" }}>Sección</th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700" }}>Nombre en Reportes (Deseado por Dueño)</th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700", minWidth: "180px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span>Orden en Reportes</span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleBulkAddSortOrder(10);
                                    }}
                                    style={{
                                      background: "#0284c7",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "4px 8px",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      boxShadow: "0 2px 4px rgba(2, 132, 199, 0.15)",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#0369a1"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0284c7"; }}
                                  >
                                    Aumentar 10
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleBulkAddSortOrder(100);
                                    }}
                                    style={{
                                      background: "#0f766e",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "4px 8px",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      boxShadow: "0 2px 4px rgba(15, 118, 110, 0.15)",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#115e59"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0f766e"; }}
                                  >
                                    Aumentar 100
                                  </button>
                                </div>
                              </div>
                            </th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700", textAlign: "center" }}>Editar</th>
                            <th style={{ padding: "12px", color: "#475569", fontWeight: "700", textAlign: "center" }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMatches.map((match) => {
                            const pObj = products.find(p => p.id === match.productId);
                            if (!pObj) return null;
                            const idx = relationMatches.findIndex(m => m.productId === match.productId);
                            return (
                              <tr
                                key={match.productId}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, idx)}
                                style={{
                                  borderBottom: "1px solid #f1f5f9",
                                  borderTop: draggedOverIndex === idx ? "3px solid #6366f1" : undefined,
                                  opacity: draggedIndex === idx ? 0.4 : 1,
                                  backgroundColor: selectedRelationProductIds.includes(match.productId) ? "#f0fdf4" : "white",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                {/* Checkbox de Selección */}
                                <td style={{ padding: "12px", textAlign: "center", width: "40px" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedRelationProductIds.includes(match.productId)}
                                    onChange={() => {
                                      const isSelected = selectedRelationProductIds.includes(match.productId);
                                      if (isSelected) {
                                        setSelectedRelationProductIds(prev => prev.filter(id => id !== match.productId));
                                      } else {
                                        setSelectedRelationProductIds(prev => [...prev, match.productId]);
                                      }
                                    }}
                                    style={{ transform: "scale(1.2)", cursor: "pointer" }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>

                                {/* Handle de arrastre */}
                                <td
                                  style={{
                                    padding: "12px",
                                    textAlign: "center",
                                    width: "50px",
                                    cursor: "grab",
                                    userSelect: "none",
                                    color: "#94a3b8",
                                    fontSize: "1.1rem"
                                  }}
                                  title="Arrastra para reordenar"
                                >
                                  ⋮⋮
                                </td>

                                <td style={{ padding: "12px" }}>
                                  <div style={{ fontWeight: "700", color: "#1e293b" }}>{match.originalName}</div>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", gap: "6px", marginTop: "2px" }}>
                                    <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{match.proposedSubcategory}</span>
                                    {match.proposedSubgroup && <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>{match.proposedSubgroup}</span>}
                                  </div>
                                </td>
                                <td style={{ padding: "12px", minWidth: "150px" }}>
                                  <input
                                    type="text"
                                    value={match.proposedSubgroup}
                                    placeholder="Subgrupo"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedSubgroup: val } : m));
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      fontSize: "0.85rem",
                                      background: "white"
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "12px", minWidth: "150px" }}>
                                  <input
                                    type="text"
                                    value={match.proposedSubcategory}
                                    placeholder="Sección"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedSubcategory: val } : m));
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      fontSize: "0.85rem",
                                      background: "white"
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "12px", minWidth: "240px" }}>
                                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    <input
                                      type="text"
                                      value={match.proposedReportName}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedReportName: val } : m));
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: "8px",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "8px",
                                        fontSize: "0.85rem",
                                        background: "white"
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const nextText = toggleTextCase(match.proposedReportName);
                                        setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedReportName: nextText } : m));
                                      }}
                                      style={{
                                        background: "#f1f5f9",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "8px",
                                        padding: "8px 10px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "background 0.2s"
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                                      title="Cambiar mayúsculas/minúsculas"
                                    >
                                      🔠
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: "12px", width: "120px" }}>
                                  <input
                                    type="number"
                                    value={match.proposedSortOrder === 9999 ? "" : match.proposedSortOrder}
                                    placeholder="9999"
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setRelationMatches(prev => prev.map((m, i) => i === idx ? { ...m, proposedSortOrder: val } : m));
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      fontSize: "0.85rem",
                                      textAlign: "center",
                                      background: "white"
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "12px", textAlign: "center" }}>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setProductCrudModal({ isOpen: true, product: pObj });
                                    }}
                                    style={{
                                      background: "#4f46e5",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "8px",
                                      padding: "8px 12px",
                                      fontSize: "0.8rem",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "4px",
                                      boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#4338ca"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#4f46e5"; }}
                                  >
                                    ✏️ Editar
                                  </button>
                                </td>
                                <td style={{ padding: "12px", textAlign: "center" }}>
                                  <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.75rem" }}>
                                    ✓ Listo
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  </div>
                )}
              </div>
            );
          })()}
        </IonContent>
      </IonPage>
    );
};
