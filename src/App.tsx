import { numeroALetras, formatReceiptItemLines, formatComandaItemLines } from './utils/formatters';
import { DailyReportModal } from "./components/DailyReportModal";
import InstallPWA from "./components/InstallPWA";
import NotificationsModal from "./components/NotificationsModal";
import RecipeAddInsumoModal from "./components/RecipeAddInsumoModal";
import { PrinterTemplateModal } from "./components/PrinterTemplateModal";
import { NumpadModal } from "./components/modals/NumpadModal";
import { parseStructuredExcelCatalog } from "./services/excelMenuParser";
import { getComandaDestinations, executePrintComanda, getLastInternalFolio } from "./services/comandaPrintService";
import { executePrintTicket } from "./services/receiptPrintService";
import { executeImportTenantMenu, executeReplicateMenuToTenants } from "./services/tenantMenuSyncService";
import {
  getLockedTerminalTenantId,
  updatePwaManifestForTenant,
  isTerminalLocked,
  lockTerminalToTenant,
  unlockTerminal
} from "./services/pwaTerminalService";
import {
  User,
  Product,
  getOperatingDay,
  getFormattedProductName,
  getProductDestination,
  getProductInventoryStatus,
  encryptToken,
  decryptToken,
  getUserPin,
  getDefaultUsersList,
  initializeUsersDatabase,
  getTenantUsers,
  ProductCategorySetting,
  getDefaultProductCategories,
  getProductReportName,
  getProductSortScore,
  getCompanyCatalog,
  getPreferredTablesMode,
  setPreferredTablesMode
} from "./utils/appHelpers";

import { OwnerCrudModal } from './components/modals/OwnerCrudModal';
import { TenantCrudModal } from './components/modals/TenantCrudModal';
import { TenantUsersModal } from './components/modals/TenantUsersModal';
import { ProductCrudModal } from './components/modals/ProductCrudModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { BranchSwitcherModal } from './components/modals/BranchSwitcherModal';
import { PinModalOverlay } from './components/modals/PinModalOverlay';
import { MultiTurnModal } from './components/modals/MultiTurnModal';
import { SupplierModal } from './components/modals/SupplierModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { ManageCompaniesModal } from './components/modals/ManageCompaniesModal';
import { CorteModal } from './components/modals/CorteModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { ArqueoFormModal } from './components/modals/ArqueoFormModal';
import { FolioModal } from './components/modals/FolioModal';
import { InvoicePhoneModal } from './components/modals/InvoicePhoneModal';
import { SupplierPurchaseModal } from './components/modals/SupplierPurchaseModal';
import { PrintPreviewModal } from './components/modals/PrintPreviewModal';
import { TablaArqueoModal } from './components/modals/TablaArqueoModal';
import { EditFondoModal } from './components/modals/EditFondoModal';
import { ReceiptPreviewModal } from './components/modals/ReceiptPreviewModal';
import { ArqKeyboardModal } from './components/modals/ArqKeyboardModal';
import { BulkItemCancellationReasonModal } from './components/modals/BulkItemCancellationReasonModal';
import { AuthorizeCancellationModal } from './components/modals/AuthorizeCancellationModal';
import { ItemNoteModal } from './components/modals/ItemNoteModal';
import { ItemCancelModal } from './components/modals/ItemCancelModal';
import { ComandaCancelModal } from './components/modals/ComandaCancelModal';
import { AccountCancellationModal } from './components/modals/AccountCancellationModal';
import { ComensalPreview } from './components/modals/ComensalPreview';
import { GastoRegisterModal } from './components/modals/GastoRegisterModal';
import { ExportSessionModal } from './components/modals/ExportSessionModal';
import { SystemsChoiceAlert } from './components/modals/SystemsChoiceAlert';
import { TenantBackupConfirm } from './components/modals/TenantBackupConfirm';
import { EditPaymentModal } from './components/modals/EditPaymentModal';
import { DeliverySetupModal } from './components/modals/DeliverySetupModal';
import { FloorplanView } from './components/views/FloorplanView';
import { MenuView } from './components/views/MenuView';
import { CheckoutView } from './components/views/CheckoutView';
import { TableDetailsView } from './components/views/TableDetailsView';
import { AdminPanelView } from './components/views/AdminPanelView';
import { ManageMenuView } from './components/views/ManageMenuView';
import { ReportsView } from './components/views/ReportsView';
import { DashboardView } from './components/views/DashboardView';
import { CorteNuevoView } from './components/views/CorteNuevoView';
import { CorteTablaView } from './components/views/CorteTablaView';
import { CorteXView } from './components/views/CorteXView';
import { CorteExpressView } from './components/views/CorteExpressView';
import { SidebarView } from './components/views/SidebarView';
import { SwitchingTenantOverlayView } from './components/views/SwitchingTenantOverlayView';
import { UserHeaderInfoView } from './components/views/UserHeaderInfoView';
import { LoginView } from './components/views/LoginView';
import { CancellationPinPadView } from './components/views/CancellationPinPadView';
import { ClosedAccountsListView } from './components/views/ClosedAccountsListView';
import { DeliveryPanelView } from './components/views/DeliveryPanelView';
import { ReviewItemView } from './components/views/ReviewItemView';
import { ReviewView } from './components/views/ReviewView';
import { UsersManagementPanelView } from './components/views/UsersManagementPanelView';
import { SuppliersView } from './components/views/SuppliersView';
import { CustomersView } from './components/views/CustomersView';
import { ExpensesView } from './components/views/ExpensesView';
import { GestionCuentasView } from './components/views/GestionCuentasView';
import { CorteTabla2View } from './components/views/CorteTabla2View';
import { ReporteMovimientosView } from './components/views/ReporteMovimientosView';
import { MaterialHeaderView } from './components/views/MaterialHeaderView';
import { PrecuentaItemView } from './components/views/PrecuentaItemView';
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { GoogleGenAI, Type } from "@google/genai";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonText,
  setupIonicReact,
  IonPage,
  IonModal,
  IonToast,
  IonSpinner,
  IonAccordion,
  IonAccordionGroup,
  IonAlert,
} from "@ionic/react";
import {
  cartOutline,
  restaurantOutline,
  beerOutline,
  iceCreamOutline,
  addOutline,
  removeOutline,
  receiptOutline,
  cardOutline,
  cashOutline,
  swapHorizontalOutline,
  checkmarkCircleOutline,
  refreshOutline,
  cloudDoneOutline,
  arrowBackOutline,
  arrowForwardOutline,
  eyeOutline,
  chatbubbleEllipsesOutline,
  trashOutline,
  printOutline,
  closeOutline,
  micOutline,
  syncOutline,
  stopCircleOutline,
  fastFoodOutline,
  closeCircleOutline,
  backspaceOutline,
  settingsOutline,
  imageOutline,
  cloudUploadOutline,
  refreshCircleOutline,
  listOutline,
  menuOutline,
  peopleOutline,
  businessOutline,
  barChartOutline,
  notificationsOutline,
  lockClosedOutline,
  calculatorOutline,
  flashOutline,
  calendarOutline,
  cubeOutline,
  checkmarkDoneCircleOutline,
  timeOutline,
  walletOutline,
  statsChartOutline,
  gridOutline,
  chevronUpOutline,
  chevronDownOutline,
  hardwareChipOutline,
  logoWhatsapp,
  downloadOutline,
  shareSocialOutline,
  saveOutline,
  shieldCheckmarkOutline,
  checkmarkOutline,
} from "ionicons/icons";

import { EscPosDriver, RawBtTransport, PosPrinterJob, WindowsSpoolerTransport, isWindows, createTransport, WebBluetoothTransport, sendTestReceipt, getWindowsPrinters, PrinterArea, TenantPrinterSettings, getTenantPrinterSettings, saveTenantPrinterSettingsToLocal, PrinterMode, AreaPrinterSetting, formatPhone, startPrinterSentinelMonitor } from "./utils/printer";
import {
  getLocalProducts,
  saveLocalProducts,
  getLocalTables,
  saveLocalTables,
  getLocalHistory,
  saveLocalHistory,
  clearAllLocalData,
} from "./utils/db";
import { startOfflineSyncService } from "./services/offlineSyncService";
import { getMatchedOwnerKey, isTenantAccessAllowed } from "./accessHelpers";
import {
  subscribeToProducts,
  subscribeToTables,
  fetchTablesFromFirebase,
  subscribeToHistory,
  subscribeToUsers,
  subscribeToInventory,
  subscribeToPurchases,
  addPurchaseToFirebase,
  updatePurchaseStatusInFirebase,
  syncLocalDataToFirebase,
  addComandaToFirebase,
  cancelComandaItemInFirebase,
  cancelEntireComandaInFirebase,
  markEntireComandaForCancellationInFirebase,
  revertEntireComandaCancellationInFirebase,
  cancelClosedAccountInFirebase,
  markAccountForCancellationInFirebase,
  authorizeAccountCancellationInFirebase,
  revertAccountCancellationInFirebase,
  markComandaItemsForCancellationInFirebase,
  revertComandaItemsCancellationInFirebase,
  finalizeComandaItemsCancellationInFirebase,
  confirmPaymentInFirebase,
  updateInvoiceRequirementInFirebase,
  releaseTableInFirebase,
  checkoutTableInFirebase,
  moveItemsBetweenTablesInFirebase,
  transferEntireTableInFirebase,
  bulkAddProductsToFirebase,
  resetAllSystemsInFirebase,
  resetSalesInFirebase,
  migrateAvatarsInFirebase,
  addProductToFirebase,
  generateUUID,
  updateProductInFirebase,
  deleteProductFromFirebase,
  deleteAllProductsFromFirebase, softDeleteAllProductsFromFirebase,
  addInventoryItemToFirebase,
  updateInventoryItemInFirebase,
  deleteInventoryItemFromFirebase,
  subscribeToCashMovements,
  addCashMovementToFirebase,
  subscribeToSuppliers,
  addSupplierToFirebase,
  updateSupplierInFirebase,
  deleteSupplierFromFirebase,
  subscribeToCustomers,
  addCustomerToFirebase,
  updateCustomerInFirebase,
  deleteCustomerFromFirebase,
  updateTableDeliveryInfoInFirebase,
  subscribeToInventoryMovements,
  addInventoryMovementToFirebase,
  subscribeToArqueos,
  addArqueoToFirebase,
  getCompanyConfig,
  saveCompanyConfigInFirebase,
  subscribeToTenants,
  subscribeToCustomOwnersFromFirebase,
  saveCustomOwnersToFirebase,
  deleteCurrentCorteInFirebase,
  deleteAllTenantHistoryInFirebase,
  addTenantToFirebase,
  deleteTenantFromFirebase,
  subscribeToExpenses,
  addExpenseToFirebase,
  updateExpenseInFirebase,
  deleteExpenseFromFirebase,
  subscribeToCashierSessions,
  addCashierSessionToFirebase,
  updateCashierSessionInFirebase,
  deleteCashierSessionFromFirebase,
  exportCashierSessionToTargetTenant,
  deleteCashMovementFromFirebase,
  deletePurchaseFromFirebase,
  deleteHistoryItemFromFirebase,
  initializeDefaultTablesForTenant,
  initializeDefaultProductsForTenant,
  DeviceRequest,
  subscribeToDeviceRequests,
  addDeviceRequest,
  updateDeviceRequest,
  deleteDeviceRequest,
  subscribeToSingleDeviceRequest,
  saveUserToFirebase,
  deleteUserFromFirebase,
  bulkAddUsersToFirebase,
  subscribeToMenuBackups,
  createMenuBackup,
  CorteCuentasFolioRecord,
  subscribeToCorteFolioHistoryFromFirebase,
  saveCorteFolioRecordToFirebase,
  deleteMenuBackupFromFirebase,
  restoreMenuBackupInFirebase,
  MenuBackup,
  getAllProductsFromFirebase,
  getAllMenuBackupsFromFirebase,
  migrateProductsTenant,
  migrateBackupsTenant,
  exportFullDatabaseJson,
  importFullDatabaseJson,
  updateClosedAccountDeliveryStatusInFirebase,
  subscribeToPrinterQueue,
  addPedidoToPrinter,
  deletePedidoFromPrinter,
  updatePedidoInFirebase,
  subscribeToCompanyConfig,
  getMexicoISOString,
  addNotificationToFirebase,
  subscribeToNotifications,
  updateNotificationInFirebase,
  saveCompaniesConfigToFirebase,
  subscribeToCompaniesConfigFromFirebase,
  exportTenantDataJson,
  TenantBackupSnapshot,
  saveTenantBackupSnapshot,
  subscribeToTenantBackupSnapshots,
  deleteTenantBackupSnapshot,
  restoreTenantBackupSnapshot,
  deduplicateComandas,
  subscribeToMasterConfig,
  saveMasterPinToFirestore,
} from "./utils/firestore";


import { parseVoiceTranscriptLocally } from "./utils/voiceParser";
import DatabaseDeveloperPanel from "./components/DatabaseDeveloperPanel";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

setupIonicReact({
  mode: "md", // Force Material Design for Android feel
});

type TableStatus = "available" | "occupied" | "reserved" | "payment_pending";
type TableShape = "local" | "takeout" | "delivery";
type Destination = "kitchen" | "bar";
type UserRole = "mesero" | "cajero" | "admin";

import { CompanyTenant, DEFAULT_COMPANY_CATALOG } from "./utils/companyCatalog";
import { PinsStructureModal } from './components/modals/PinsStructureModal';
import { DeviceRequestsModal } from './components/modals/DeviceRequestsModal';
import { BluetoothConfigModal } from './components/modals/BluetoothConfigModal';

let COMPANY_CATALOG: CompanyTenant[] = (() => {
  try {
    const cached = localStorage.getItem("cocinet_custom_tenants_v3");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return DEFAULT_COMPANY_CATALOG;
})();

interface CashierSession {
  id: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  status: "open" | "closed";
  dotacionInicial?: number;
  arqueoTotal?: number;
  arqueoBilletes?: number;
  arqueoMonedas?: number;
  estimatedCash?: number;
  diferencia?: number;
  cashSales?: number;
  cardSales?: number;
  transSales?: number;
  cashSalesCount?: number;
  cardSalesCount?: number;
  transSalesCount?: number;
  totalInflows?: number;
  totalOutflows?: number;
  totalPurchasesPaid?: number;
}


// export function getOperatingDay extraído



// interface User importada



// interface Product importada



// export function getFormattedProductName extraído


interface CartItem {
  product: Product;
  quantity: number;
  plate: number;
  notes?: string;
  isCancelled?: boolean;
  isPendingCancellation?: boolean;
  pendingCancellationReason?: string;
  cancellationReason?: string;
  cancelledBy?: User;
}

interface Comanda {
  folio: number;
  folioInterno?: string;
  timestamp: Date;
  items: CartItem[];
  generalNotes?: string;
  createdBy?: User;
}

interface TableData {
  id: string;
  label: string;
  shape: TableShape;
  status: TableStatus;
  zone: string;
  waiterId?: string;
  comandas: Comanda[];
}

export interface CashMovement {
  id: string;
  type: "in" | "out";
  concept: "nomina" | "retiro" | "dotacion" | "fondo" | "otro";
  amount: number;
  description: string;
  date: Date;
  user: string;
}

interface ClosedAccount {
  id: string;
  tableLabel: string;
  comandas: Comanda[];
  subtotal: number;
  tip: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cardLastFour?: string;
  cardType?: string;
  timestamp: Date;
  isPaid: boolean;
  status: "completed" | "cancelled";
  isPendingCancellation?: boolean;
  pendingCancellationReason?: string;
  cancellationReason?: string;
  cancelledBy?: User;
  requiresInvoice?: boolean;
  invoicePhone?: string;
}

const COMENSAL_COLORS: { [key: number]: string } = {
  1: "#10b981", // Green
  2: "#3b82f6", // Blue
  3: "#8b5cf6", // Purple
  4: "#f59e0b", // Orange
  5: "#ec4899", // Pink
};

const getComensalColor = (comensal: number) =>
  COMENSAL_COLORS[comensal] || "#64748b";

const DISCOUNT_PASSWORD = "10";
const ADMIN_PASSWORD = "100";
const ADMIN_PIN = "2026";


// InstallPWA extraído a componente separado



// export function getProductInventoryStatus extraído


// Helper functions for secure token encoding

// function encryptToken extraído



// function decryptToken extraído



// const getUserPin extraído
;


// const getDefaultUsersList extraído
;


// const initializeUsersDatabase extraído
;


// const getTenantUsers extraído
;

let UNIQUE_OWNERS: any[] = (() => {
  try {
    const cached = localStorage.getItem("cocinet_custom_owners_v3");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return [
    { key: "1", name: "SORAYA & JORGE", avatar: "🤠", company: 'Cadena "Los Sombrerudos"', accentColor: "red" },
    { key: "2", name: "EVELIN", avatar: "👒", company: 'Taquerías "Los Sombrerudos"', accentColor: "purple" },
    { key: "3", name: "ARMANDO", avatar: "👑", company: 'Los Mero Mero "Universidad"', accentColor: "pink" },
    { key: "4", name: "EL MERO MERO", avatar: "🎩", company: 'Los Mero Mero "Santa María"', accentColor: "teal" },
    { key: "5", name: "SAN SEBASTIÁN", avatar: "🎓", company: 'Taquerías "San Sebastián"', accentColor: "amber" },
    { key: "6", name: "BLADIMIR", avatar: "🌮", company: 'Tacos Roy "MBravo"', accentColor: "red" },
    { key: "7", name: "AMPARO", avatar: "🌯", company: 'Tacos y Retacos "Roy"', accentColor: "emerald" },
    { key: "8", name: "LEVI", avatar: "🥗", company: 'Tacos Roy "Viguera"', accentColor: "indigo" },
    { key: "9", name: "TLACOLULA", avatar: "🏛️", company: 'Tlacolula Tlacolula', accentColor: "pink" },
    { key: "10", name: "HUAYAPAM", avatar: "🌿", company: 'Crucero Huayapam', accentColor: "cyan" }
  ];
})();

let OWNER_PINS: Record<string, string> = (() => {
  try {
    const cached = localStorage.getItem("cocinet_custom_owner_pins_v3");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return {
    "1": "2010",
    "2": "2020",
    "3": "2030",
    "4": "2040",
    "5": "2050",
    "6": "2060",
    "7": "2070",
    "8": "2080",
    "9": "2090",
    "10": "2100"
  };
})();

let OWNER_SUPERVISOR_PINS: Record<string, string> = (() => {
  try {
    const cached = localStorage.getItem("cocinet_custom_supervisor_pins_v3");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return {
    "1": "2011",
    "2": "2021",
    "3": "2031",
    "4": "2041",
    "5": "2051",
    "6": "2061",
    "7": "2071",
    "8": "2081",
    "9": "2091",
    "10": "2101"
  };
})();

const MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

function sanitizeBusinessName(name?: string): string {
  if (!name) return "TACOS ROY";
  let clean = name.trim();
  clean = clean.replace(/^\d+\s*(?:x|X)\s*/gi, "");
  clean = clean.replace(/\$?\s*\d+(?:\.\d{1,2})?\s*$/gi, "");
  clean = clean.trim();
  if (!clean || clean.toUpperCase() === "TRUJANO") return "TACOS ROY TRUJANO";
  return clean;
}

function sanitizeEmail(email?: string): string {
  if (!email) return "";
  const clean = email.trim();
  if (!clean.includes("@") || clean.length < 5) return "";
  return clean;
}

const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = ctx.currentTime;
    playNote(783.99, now, 0.4, "sine");       // G5
    playNote(1046.50, now + 0.15, 0.5, "sine"); // C6
    playNote(1318.51, now + 0.3, 0.6, "sine");  // E6
    playNote(1567.98, now + 0.45, 0.8, "sine"); // G6
  } catch (e) {
    console.warn("Failed to play synthesized chime sound:", e);
  }
};

const playNotificationSound = (isCancellation = false) => {
  const soundEnabled = localStorage.getItem("notification_sound_enabled") !== "false";
  if (!soundEnabled) return;

  playChimeSound();
  if (isCancellation) {
    setTimeout(() => {
      playChimeSound();
    }, 850);
  }
};

const toggleTextCase = (text: string): string => {
  const trimmed = (text || "").trim();
  if (!trimmed) return "";
  
  if (trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map(word => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  } else {
    return trimmed.toUpperCase();
  }
};

function createDefault30TablesList(tenantId: string) {
  const list: any[] = [];
  for (let i = 1; i <= 25; i++) {
    list.push({
      id: `table-${tenantId}-salon-${i}`,
      uid: `table-${tenantId}-salon-${i}`,
      label: `${i}`,
      shape: "local",
      status: "available",
      waiterId: null,
      comandas: [],
      zone: "Salón Principal",
      tenantId: tenantId,
      updatedAt: new Date().toISOString(),
    });
  }
  for (let i = 1; i <= 5; i++) {
    list.push({
      id: `table-${tenantId}-takeout-${i}`,
      uid: `table-${tenantId}-takeout-${i}`,
      label: `P${i}`,
      shape: "takeout",
      status: "available",
      waiterId: null,
      comandas: [],
      zone: "Para Llevar",
      tenantId: tenantId,
      updatedAt: new Date().toISOString(),
    });
  }
  for (let i = 1; i <= 5; i++) {
    list.push({
      id: `table-${tenantId}-delivery-${i}`,
      uid: `table-${tenantId}-delivery-${i}`,
      label: `D${i}`,
      shape: "delivery",
      status: "available",
      waiterId: null,
      comandas: [],
      zone: "Servicio a Domicilio",
      tenantId: tenantId,
      updatedAt: new Date().toISOString(),
    });
  }
  return list;
}
function normalizeZoneName(rawZone?: string): string {
  if (!rawZone) return "Salón Principal";
  const z = String(rawZone).trim().toLowerCase();
  if (z.includes("domicilio") || z.includes("delivery") || z === "d" || z === "a domicilio") {
    return "Servicio a Domicilio";
  }
  if (z.includes("llevar") || z.includes("takeout") || z === "p" || z === "para llevar") {
    return "Para Llevar";
  }
  return "Salón Principal";
}

function ensureAll35TablesForTenant(existingTables: any[], tenantId: string) {
  const safeTenantId = tenantId || "default-tenant";
  const tableMap = new Map<string, any>();

  (existingTables || []).forEach((t: any) => {
    if (!t || typeof t !== "object") return;
    let zone = normalizeZoneName(t.zone);
    let rawLabel = String(t.label || "").trim();
    if (!rawLabel) return;
    
    // Normalize label: "Mesa 1" -> "1", "Mesa P1" -> "P1", "Mesa D1" -> "D1"
    let label = rawLabel.replace(/^mesa\s*/i, "").trim();
    if (zone === "Servicio a Domicilio" && label.startsWith("S")) {
      label = label.replace(/^S/i, "D");
    }
    const key = `${zone}::${label}`;

    const existing = tableMap.get(key);
    if (!existing) {
      tableMap.set(key, { ...t, zone, label, comandas: t.comandas || [] });
    } else {
      const existingIsOccupied = existing.status === "occupied" || (existing.comandas && existing.comandas.length > 0);
      const newIsOccupied = t.status === "occupied" || (t.comandas && t.comandas.length > 0);

      if (newIsOccupied) {
        if (!existingIsOccupied) {
          tableMap.set(key, { ...t, zone, label, comandas: t.comandas || [] });
        } else {
          // Both records have data: merge comandas by folio so no order is ever lost
          const comandasMap = new Map<number, any>();
          (existing.comandas || []).forEach((c: any) => comandasMap.set(c.folio, c));
          (t.comandas || []).forEach((c: any) => comandasMap.set(c.folio, c));
          const mergedComandas = deduplicateComandas(Array.from(comandasMap.values()));
          tableMap.set(key, {
            ...existing,
            ...t,
            zone,
            label,
            status: "occupied",
            comandas: mergedComandas,
          });
        }
      }
    }
  });

  // Garantizar exactamente 25 mesas en Salón Principal (1 a 25)
  for (let i = 1; i <= 25; i++) {
    const labelStr = `${i}`;
    const key = `Salón Principal::${labelStr}`;
    if (!tableMap.has(key)) {
      tableMap.set(key, {
        id: `table-${safeTenantId}-salon-${i}`,
        uid: `table-${safeTenantId}-salon-${i}`,
        label: labelStr,
        shape: "local",
        status: "available",
        waiterId: null,
        comandas: [],
        zone: "Salón Principal",
        tenantId: safeTenantId,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Garantizar mesas P1 a P5 en Para Llevar
  for (let i = 1; i <= 5; i++) {
    const labelStr = `P${i}`;
    const key = `Para Llevar::${labelStr}`;
    if (!tableMap.has(key)) {
      tableMap.set(key, {
        id: `table-${safeTenantId}-takeout-${i}`,
        uid: `table-${safeTenantId}-takeout-${i}`,
        label: labelStr,
        shape: "takeout",
        status: "available",
        waiterId: null,
        comandas: [],
        zone: "Para Llevar",
        tenantId: safeTenantId,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Garantizar mesas D1 a D5 en Servicio a Domicilio
  for (let i = 1; i <= 5; i++) {
    const labelStr = `D${i}`;
    const key1 = `Servicio a Domicilio::${labelStr}`;
    const key2 = `A Domicilio::${labelStr}`;
    if (!tableMap.has(key1) && !tableMap.has(key2)) {
      tableMap.set(key1, {
        id: `table-${safeTenantId}-delivery-${i}`,
        uid: `table-${safeTenantId}-delivery-${i}`,
        label: labelStr,
        shape: "delivery",
        status: "available",
        waiterId: null,
        comandas: [],
        zone: "Servicio a Domicilio",
        tenantId: safeTenantId,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const finalResult = Array.from(tableMap.values());
  const occupiedList = finalResult.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
  if (occupiedList.length > 0) {
    console.log("⚡ [ENSURE_35_OUT] Occupied tables count:", occupiedList.length, occupiedList.map((t: any) => `Mesa ${t.label} (status=${t.status}, comandas=${t.comandas?.length})`));
  }
  return finalResult;
}

export default function App() {
  const [selectedTenant, setSelectedTenant] = useState<CompanyTenant | null>(() => {
    try {
      // 1. Prioridad Máxima: Candado de Terminal Física (Hardware / Terminal Lock de esta PC)
      const lockedTenantId = getLockedTerminalTenantId();
      if (lockedTenantId) {
        const foundLocked = COMPANY_CATALOG.find((c) => c.id === lockedTenantId);
        if (foundLocked) {
          return foundLocked;
        }
      }

      // 2. Parámetro de URL (?tenant=..., ?sucursal=..., ?company=..., ?id=...)
      const params = new URLSearchParams(window.location.search);
      let tenantParam =
        params.get("tenant") ||
        params.get("sucursal") ||
        params.get("company") ||
        params.get("id");
      if (tenantParam) {
        const cleanP = tenantParam.toLowerCase().trim();
        const cleanPWithPrefix = cleanP.startsWith("tenant-") ? cleanP : `tenant-${cleanP}`;
        const cleanPWithoutPrefix = cleanP.replace(/^tenant-/, "");

        const found = COMPANY_CATALOG.find(
          (c) =>
            c.id.toLowerCase() === cleanP ||
            c.id.toLowerCase() === cleanPWithPrefix ||
            c.id.toLowerCase().replace(/^tenant-/, "") === cleanPWithoutPrefix ||
            c.name.toLowerCase().includes(cleanP) ||
            c.sucursalDefault.toLowerCase().includes(cleanP) ||
            (c.direccion && c.direccion.toLowerCase().includes(cleanP)) ||
            (c.propietario && c.propietario.toLowerCase().includes(cleanP))
        );
        if (found) {
          return found;
        }
        // If specified in URL but not found, remain strictly neutral
        return null;
      }

      const ownerParam =
        params.get("ownerKey") ||
        params.get("ownerPin") ||
        params.get("owner") ||
        params.get("filtro");
      const matchedOwnerKey = getMatchedOwnerKey(ownerParam);
      if (matchedOwnerKey) {
        const foundOwnerTenant = COMPANY_CATALOG.find((c) => c.ownerKey === matchedOwnerKey);
        if (foundOwnerTenant) {
          return foundOwnerTenant;
        }
      }
    } catch (e) {
      // Ignore
    }

    // Without a valid URL parameter or terminal lock, start 100% clean and neutral (Cocinet)
    return null;
  });

  useEffect(() => {
    if (selectedTenant) {
      try {
        localStorage.setItem("pos_selected_tenant", JSON.stringify(selectedTenant));
        updatePwaManifestForTenant(selectedTenant);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem("pos_selected_tenant");
      } catch (e) {}
    }
  }, [selectedTenant]);

  const [showSystemsChoiceAlert, setShowSystemsChoiceAlert] = useState(false);
  const [showDeleteAllHistoryConfirm, setShowDeleteAllHistoryConfirm] = useState(false);

  const hasTenantInUrl = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return !!(
        params.get("tenant") ||
        params.get("sucursal") ||
        params.get("company") ||
        params.get("id") ||
        params.get("acceso") ||
        params.get("token")
      );
    } catch {
      return false;
    }
  }, []);

  const [users, setUsers] = useState<User[]>([]);

  // Check URL parameters on mount to support automated direct links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let tenantParam =
        params.get("tenant") ||
        params.get("sucursal") ||
        params.get("company") ||
        params.get("id");
      let tokenParam = (params.get("token") || params.get("acceso") || params.get("key") || "").trim();

      // Check if tokenParam is an encrypted token. If so, decrypt it
      if (tokenParam) {
        const decrypted = decryptToken(tokenParam);
        if (decrypted) {
          const parts = decrypted.split("|");
          if (parts.length === 2) {
            tenantParam = parts[0];
            tokenParam = parts[1];
          }
        }
      }

      const ownerParam =
        params.get("ownerKey") ||
        params.get("ownerPin") ||
        params.get("owner") ||
        params.get("filtro");

      if (tenantParam) {
        const cleanP = tenantParam.toLowerCase().trim();
        const cleanPWithPrefix = cleanP.startsWith("tenant-") ? cleanP : `tenant-${cleanP}`;
        const cleanPWithoutPrefix = cleanP.replace(/^tenant-/, "");

        const found = COMPANY_CATALOG.find(
          (c) =>
            c.id.toLowerCase() === cleanP ||
            c.id.toLowerCase() === cleanPWithPrefix ||
            c.id.toLowerCase().replace(/^tenant-/, "") === cleanPWithoutPrefix ||
            c.name.toLowerCase().includes(cleanP) ||
            c.sucursalDefault.toLowerCase().includes(cleanP) ||
            (c.direccion && c.direccion.toLowerCase().includes(cleanP)) ||
            (c.propietario && c.propietario.toLowerCase().includes(cleanP))
        );
        if (found) {
          // If token matches a user in ANY sucursal, redirect them to that sucursal
          const allUsers = initializeUsersDatabase();
          const cleanToken = tokenParam.toLowerCase().trim();
          let targetUser = allUsers.find(
            (u) => u.pin === tokenParam || u.id.toLowerCase() === cleanToken
          );

          let activeTenant = found;
          if (targetUser && targetUser.tenantId) {
            const foundTargetTenant = COMPANY_CATALOG.find(c => c.id === targetUser.tenantId);
            if (foundTargetTenant) {
              activeTenant = foundTargetTenant;
              setSelectedTenant(foundTargetTenant);
              localStorage.setItem("pos_selected_tenant", JSON.stringify(foundTargetTenant));
            }
          }

          const tempUsers = getTenantUsers(activeTenant.id);
          let loggedUser: User | null = null;
          let unlockOwnerFilter = false;
          let sysMode = false;
          let restrictedOwner: string | null = null;

          loggedUser = tempUsers.find(
            (u) =>
              u.id.toLowerCase() === cleanToken ||
              u.pin === tokenParam ||
              (cleanToken === "propietario" && u.id.endsWith("-admin")) ||
              (cleanToken === "gerente" && u.id.endsWith("-manager")) ||
              (cleanToken === "sistemas" && u.id.endsWith("-sistemas")) ||
              (cleanToken === "cajero1" && u.id.endsWith("-cajero-1")) ||
              (cleanToken === "cajero2" && u.id.endsWith("-cajero-2")) ||
              (cleanToken === "mesero1" && u.id.endsWith("-mesero-main")) ||
              (cleanToken === "mesero2" && u.id.endsWith("-mesero-1")) ||
              (cleanToken === "mesero3" && u.id.endsWith("-mesero-2"))
          );

          if (loggedUser) {
            if (loggedUser.id.endsWith("-sistemas")) {
              unlockOwnerFilter = true;
              sysMode = true;
              restrictedOwner = null;
            } else if (loggedUser.id.endsWith("-admin")) {
              unlockOwnerFilter = true;
              sysMode = false;
              restrictedOwner = found.ownerKey;
            } else {
              unlockOwnerFilter = false;
              sysMode = false;
              restrictedOwner = null;
            }
          }

          if (loggedUser) {
            setCurrentUser(loggedUser);
            setIsOwnerUnlocked(unlockOwnerFilter);
            localStorage.setItem("cocinet_is_owner_unlocked", unlockOwnerFilter ? "true" : "false");
            
            setIsSystemsMode(sysMode);
            localStorage.setItem("cocinet_is_systems", sysMode ? "true" : "false");
            
            setRestrictedOwnerKey(restrictedOwner);
            if (restrictedOwner) {
              localStorage.setItem("cocinet_restricted_owner_key", restrictedOwner);
            } else {
              localStorage.removeItem("cocinet_restricted_owner_key");
            }

            if (unlockOwnerFilter) {
              if (sysMode) {
                setActiveOwnerFilter(null);
                localStorage.removeItem("cocinet_active_owner_filter");
              } else {
                setActiveOwnerFilter(found.ownerKey);
                localStorage.setItem("cocinet_active_owner_filter", found.ownerKey);
              }
            } else {
              setActiveOwnerFilter(found.ownerKey);
              localStorage.setItem("cocinet_active_owner_filter", found.ownerKey);
            }

            if (loggedUser.role === "admin" || loggedUser.id.endsWith("-sistemas")) {
              setAppMode("corte-tabla");
            } else {
              setAppMode(getPreferredTablesMode());
            }
            setLoginSubStep("tenant");
            
            // Set URL token flag
            setIsUrlTokenSession(true);
            localStorage.setItem("cocinet_is_url_token", "true");
            
            const hasCustom = () => {
              try {
                const customPinsStr = localStorage.getItem("cocinet_custom_pins");
                if (customPinsStr) {
                  const customPins = JSON.parse(customPinsStr);
                  return !!customPins[loggedUser!.id];
                }
              } catch (e) {}
              return false;
            };
            if (!hasCustom()) {
              <LoginView
                triggerAppNotification={triggerAppNotification}
                users={users}
                executeTenantTransfer={executeTenantTransfer}
                resetTenantForm={resetTenantForm}
                setCompaniesConfig={setCompaniesConfig}
                searchCompanyQuery={searchCompanyQuery}
                setSearchCompanyQuery={setSearchCompanyQuery}
                setSelectedTenant={setSelectedTenant}
              />
              setShowChangePinModal(true);
            }

            triggerAppNotification(
              "🚀 Acceso Autorizado por Token",
              `Bienvenido de vuelta, ${loggedUser.name}.`,
              "success"
            );
          } else {
            // No token or invalid token: just pre-configure device to this sucursal
            setCurrentUser(null);
            setIsOwnerUnlocked(false);
            localStorage.setItem("cocinet_is_owner_unlocked", "false");
            setIsSystemsMode(false);
            localStorage.setItem("cocinet_is_systems", "false");
            setRestrictedOwnerKey(null);
            localStorage.removeItem("cocinet_restricted_owner_key");

            setActiveOwnerFilter(found.ownerKey);
            localStorage.setItem("cocinet_active_owner_filter", found.ownerKey);
            setLoginSubStep("tenant");
            triggerAppNotification(
              "📱 Dispositivo Configurado",
              `Este dispositivo ha sido asignado a la sucursal: ${found.name}. Seleccione su usuario para ingresar.`,
              "success"
            );
          }
        }
      } else if (ownerParam) {
        const matchedOwnerKey = getMatchedOwnerKey(ownerParam);

        if (matchedOwnerKey) {
          const firstOwnerTenant = COMPANY_CATALOG.find((c) => c.ownerKey === matchedOwnerKey);
          if (firstOwnerTenant) {
            setSelectedTenant(firstOwnerTenant);
            localStorage.setItem("pos_selected_tenant", JSON.stringify(firstOwnerTenant));
          }

          setActiveOwnerFilter(matchedOwnerKey);
          localStorage.setItem("cocinet_active_owner_filter", matchedOwnerKey);
          setIsOwnerUnlocked(true);
          localStorage.setItem("cocinet_is_owner_unlocked", "true");
          
          setIsSystemsMode(false);
          localStorage.setItem("cocinet_is_systems", "false");
          setRestrictedOwnerKey(matchedOwnerKey);
          localStorage.setItem("cocinet_restricted_owner_key", matchedOwnerKey);

          triggerAppNotification(
            "🔑 Código Propietario por Enlace",
            `Filtrado automático activado para el propietario #${ownerParam}. Acceso rápido configurado.`,
            "success"
          );
        }
      }
    } catch (e) {
      console.warn("Error reading URL search params:", e);
    }
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      try {
        localStorage.setItem(
          "pos_selected_tenant",
          JSON.stringify(selectedTenant),
        );
      } catch (err) {
        console.warn("Error caching selected tenant:", err);
      }
      // Look up owner logo in cached custom owners if available
      let ownerLogo = "";
      try {
        const cachedOwnersRaw = localStorage.getItem("cocinet_custom_owners_v3");
        const ownersList = cachedOwnersRaw ? JSON.parse(cachedOwnersRaw) : [];
        const ownerObj = ownersList.find((o: any) => o.key === selectedTenant.ownerKey);
        if (ownerObj) {
          ownerLogo = ownerObj.logo || "";
        }
      } catch (err) {
        console.warn("Error loading owner logo:", err);
      }

      // Update general system configuration with selected company's details 🏢⚡
      setCompanyConfig((prev) => ({
        ...prev,
        businessName: selectedTenant.name,
        rfc: selectedTenant.rfc,
        sucursal: selectedTenant.sucursalDefault,
        footerMessage: prev.footerMessage || `¡Gracias por su visita! Vuelva pronto 🌮 (${selectedTenant.ownerEmail})`,
        logoUrl: selectedTenant.logoUrl || ownerLogo || "",
        geminiApiKey: prev.geminiApiKey || "",
        regimenFiscal: selectedTenant.regimenFiscal || prev.regimenFiscal || "601 - General de Ley Personas Morales",
        direccionFiscal: selectedTenant.direccionFiscal || prev.direccionFiscal || "",
        lugarExpedicion: selectedTenant.lugarExpedicion || prev.lugarExpedicion || "",
        telefono: selectedTenant.telefono || prev.telefono || "",
        email: selectedTenant.email || prev.email || "",
      }));

      setTicketRequireInternalFolio(selectedTenant.requireInternalFolio === true);

      const tenantUsers = getTenantUsers(selectedTenant.id);
      setUsers(tenantUsers);
    }
  }, [selectedTenant]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginPin, setLoginPin] = useState("");
  const [selectedLoginUser, setSelectedLoginUser] = useState<User | null>(null);
  const [loginSubStep, setLoginSubStep] = useState<"device_registration" | "tenant">(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hasUrlParam = !!(
        params.get("tenant") ||
        params.get("sucursal") ||
        params.get("company") ||
        params.get("id") ||
        params.get("token") ||
        params.get("acceso") ||
        params.get("ownerKey") ||
        params.get("ownerPin") ||
        params.get("owner") ||
        params.get("filtro")
      );
      if (hasUrlParam) {
        return "tenant"; // Will be overridden/resolved by useEffect on mount
      }
    } catch (e) {}

    const isUnlocked = localStorage.getItem("cocinet_is_owner_unlocked") === "true";
    if (isUnlocked) {
      const restricted = localStorage.getItem("cocinet_restricted_owner_key");
      if (restricted) {
        const ownerBranches = COMPANY_CATALOG.filter(c => c.ownerKey === restricted);
        if (ownerBranches.length === 1) {
          return "tenant";
        }
      }
      return "tenant";
    }
    return "tenant";
  });
  const [isUrlTokenSession, setIsUrlTokenSession] = useState<boolean>(() => localStorage.getItem("cocinet_is_url_token") === "true");
  const [isSystemsMode, setIsSystemsMode] = useState<boolean>(false);

  const [deviceId, setDeviceId] = useState(() => {
    let id = localStorage.getItem("pos_device_id");
    if (!id) {
       id = "device-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
       localStorage.setItem("pos_device_id", id);
    }
    return id;
  });
  const [deviceRequest, setDeviceRequest] = useState<DeviceRequest | null>(null);
  const [isMasterAdmin, setIsMasterAdmin] = useState(() => localStorage.getItem("pos_master_admin") === "true");
  const [masterAdminPin, setMasterAdminPin] = useState<string>(() => localStorage.getItem("cocinet_master_pin") || "2052");

  useEffect(() => {
    const unsub = subscribeToMasterConfig((data) => {
      if (data && data.pin) {
        const cleanPin = String(data.pin).trim();
        setMasterAdminPin(cleanPin);
        localStorage.setItem("cocinet_master_pin", cleanPin);
      }
    });
    return () => unsub();
  }, []);
  const [allDeviceRequests, setAllDeviceRequests] = useState<DeviceRequest[]>([]);
  const [showDeviceRequestsModal, setShowDeviceRequestsModal] = useState(false);
  const [showCuentasSummary, setShowCuentasSummary] = useState(false);
  const [devReqName, setDevReqName] = useState("");
  const [devReqRole, setDevReqRole] = useState("mesero");

  const currentUserRef = useRef<User | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const processedPrintIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return subscribeToSingleDeviceRequest(deviceId, (req) => {
      setDeviceRequest(req);
      if (req && req.status === "approved" && req.assignedTenantId) {
         const tenant = COMPANY_CATALOG.find((c) => c.id === req.assignedTenantId);
         if (tenant) {
            setSelectedTenant((prev) => (prev?.id !== tenant.id ? tenant : prev));
            const autoUser: User = {
               id: req.deviceId, 
               name: req.deviceName,
               role: ((req.role as any) === "preventista" ? "mesero" : req.role as UserRole),
               pin: req.pin || "",
               avatar: "fa-solid fa-user",
            };
            setCurrentUser((prev) => {
              if (!prev || prev.id !== autoUser.id || prev.role !== autoUser.role) {
                if (autoUser.role === "admin" || autoUser.id.endsWith("-sistemas")) {
                  setAppMode("corte-tabla");
                } else {
                  setAppMode(getPreferredTablesMode());
                }
                return autoUser;
              }
              return prev;
            });
         }
      } else {
         const activeUser = currentUserRef.current;
         const isUrlToken = localStorage.getItem("cocinet_is_url_token") === "true";
         if (!isUrlToken && activeUser && activeUser.role !== "admin" && !activeUser.id.endsWith("-sistemas")) {
            setCurrentUser(null);
            setLoginSubStep("device_registration");
            triggerAppNotification(
              "⚠️ Acceso Revocado",
              "Tu dispositivo ha sido deshabilitado para esta sucursal.",
              "warning"
            );
         }
      }
    });
  }, [deviceId, isMasterAdmin]);

  useEffect(() => {
    if (isMasterAdmin) {
       return subscribeToDeviceRequests((reqs) => {
           setAllDeviceRequests(reqs);
           // Show native notification if supported and permission granted
           if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                const pending = reqs.filter(r => r.status === "pending");
                // simplistic check to avoid spamming notification
                if (pending.length > 0 && pending[0].requestTime > new Date(Date.now() - 5000).toISOString()) {
                   new Notification("Solicitud de Nuevo Dispositivo 📱", {
                      body: `El dispositivo "${pending[0].deviceName}" solicita acceso como ${pending[0].role}.`,
                   });
                }
           }
       });
    }
  }, [isMasterAdmin]);

  const [notificationsGranted, setNotificationsGranted] = useState<boolean>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission === "granted";
    }
    return false;
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkNetworkConnection = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        await fetch(`https://www.google.com/favicon.ico?t=${Date.now()}`, {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return true;
      } catch (err) {
        return false;
      }
    };

    let lastStatus = navigator.onLine;

    const triggerOnlineNotification = () => {
      const title = "🟢 SISTEMA EN LÍNEA";
      const body = "Se ha recuperado la conexión de red. ¡Sincronizando de manera continua a través de WebSockets! ⚡";
      
      const newNotif = {
        id: String(Date.now() + Math.random()),
        title,
        body,
        time: "Ahora mismo",
        read: false,
      };
      setNotificationsList((prev) => [newNotif, ...prev]);

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
        } catch (e) {
          console.warn("Error native Notification:", e);
        }
      }

      setMenuToastMessage(`${title}\import { ConfigurePrefixModal } from './components/modals/ConfigurePrefixModal';\nn${body}`);
      setShowMenuToast(true);
    };

    const triggerOfflineNotification = () => {
      const title = "🔴 TRABAJANDO SIN CONEXIÓN";
      const body = "Se ha perdido la conexión a internet. Los datos están 100% seguros en caché local. 📁";
      
      const newNotif = {
        id: String(Date.now() + Math.random()),
        title,
        body,
        time: "Ahora mismo",
        read: false,
      };
      setNotificationsList((prev) => [newNotif, ...prev]);

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
        } catch (e) {
          console.warn("Error native Notification:", e);
        }
      }

      setMenuToastMessage(`${title}\n${body}`);
      setShowMenuToast(true);
    };

    const checkStatus = async () => {
      const currentStatus = await checkNetworkConnection();
      
      if (currentStatus !== lastStatus) {
        if (currentStatus) {
          setIsOnline(true);
          setShowOfflineBanner(false);
          setShowOnlineBanner(true);
          triggerOnlineNotification();
        } else {
          setIsOnline(false);
          setShowOfflineBanner(true);
          setShowOnlineBanner(false);
          triggerOfflineNotification();
        }
        lastStatus = currentStatus;
      }
    };

    // Run check immediately
    checkStatus();

    // Check every 4 seconds
    const intervalId = setInterval(checkStatus, 4000);

    const handleOnline = () => {
      checkStatus();
    };
    const handleOffline = () => {
      checkStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const stopSyncService = startOfflineSyncService();

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (typeof stopSyncService === "function") {
        stopSyncService();
      }
    };
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("pos_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("pos_current_user");
      }
    } catch (e) {
      console.warn("localStorage error writing user:", e);
    }
  }, [currentUser]);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem("pos_products");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [tables, setTables] = useState<TableData[]>(() => {
    try {
      const cached = localStorage.getItem("pos_tables");
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((t: any) => ({
          ...t,
          comandas: (t.comandas || []).map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp),
          })),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [history, setHistory] = useState<ClosedAccount[]>(() => {
    try {
      const activeTenant = selectedTenant?.id || getLockedTerminalTenantId() || "tenant-7";
      const cachedToday = localStorage.getItem(`pos_recent_history_${activeTenant}`) || localStorage.getItem("pos_history");
      if (cachedToday) {
        const parsed = JSON.parse(cachedToday);
        if (Array.isArray(parsed)) {
          return parsed.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [dailyReportTargetDate, setDailyReportTargetDate] = useState<string | undefined>(undefined);
  const [itemsSelectedForCancellation, setItemsSelectedForCancellation] = useState<{ folio: number; productId: string; plate: number }[]>([]);
  const [showBulkItemCancellationModal, setShowBulkItemCancellationModal] = useState(false);
  const [showBulkItemCancellationReasonModal, setShowBulkItemCancellationReasonModal] = useState(false);
  const [bulkItemCancellationReason, setBulkItemCancellationReason] = useState("");
  const [bulkItemCancellationOtherReason, setBulkItemCancellationOtherReason] = useState("");
  const [bulkItemCancellationPin, setBulkItemCancellationPin] = useState("");
  const [accountCancellationOtherReason, setAccountCancellationOtherReason] = useState("");
  const [confirmItemCancelReason, setConfirmItemCancelReason] = useState(false);
  const [confirmComandaCancelReason, setConfirmComandaCancelReason] = useState(false);
  const [confirmAccountCancelReason, setConfirmAccountCancelReason] = useState(false);
  const [showAuthorizeCancellationModal, setShowAuthorizeCancellationModal] = useState(false);
  const [pendingCancellationTarget, setPendingCancellationTarget] = useState<{ type: 'account' | 'item' | 'bulk', id: string, items?: any, reason?: string, user?: User } | null>(null);
  const [authorizationPin, setAuthorizationPin] = useState("");

  const [paymentMethodFilter, setPaymentMethodFilter] = useState<
    "all" | "cash" | "bank" | "lupay"
  >("all");

  const fetchData = async () => {}; // Mocked so other functions don't crash

  useEffect(() => {
    if (!selectedTenant) return;
    const tenantId = selectedTenant.id;
    // Load cached tables for the new tenant immediately (don't wipe with empty array!)
    // This shows occupied tables instantly from localStorage while Firestore syncs
    try {
      const cachedRaw = localStorage.getItem("pos_tables_" + tenantId) || localStorage.getItem("pos_tables");
      if (cachedRaw) {
        const allCached = JSON.parse(cachedRaw);
        const tenantCached = Array.isArray(allCached)
          ? allCached.filter((t: any) => !t.tenantId || t.tenantId === tenantId)
          : [];
        if (tenantCached.length > 0) {
          const parsed = tenantCached.map((t: any) => ({
            ...t,
            comandas: (t.comandas || []).map((c: any) => ({
              ...c,
              timestamp: new Date(c.timestamp),
            })),
          }));
          setTables(ensureAll35TablesForTenant(parsed, tenantId));
        } else {
          setTables(ensureAll35TablesForTenant([], tenantId));
        }
      } else {
        setTables(ensureAll35TablesForTenant([], tenantId));
      }
    } catch {
      setTables(ensureAll35TablesForTenant([], tenantId));
    }

    // Pre-cargar historial de forma inmediata (0ms) desde caché rápido de hoy y luego IndexedDB
    try {
      const cachedToday = localStorage.getItem(`pos_recent_history_${tenantId}`);
      if (cachedToday) {
        const parsed = JSON.parse(cachedToday);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(
            parsed.map((h: any) => ({
              ...h,
              timestamp: new Date(h.timestamp),
            }))
          );
          setHistoryLoaded(true);
        }
      }
    } catch (e) {}

    getLocalHistory(tenantId)
      .then((localHist) => {
        if (Array.isArray(localHist) && localHist.length > 0) {
          setHistory((prev) => {
            if (prev.length === 0 || prev.length < localHist.length) {
              return localHist.map((h: any) => ({
                ...h,
                timestamp:
                  h.timestamp && typeof h.timestamp.toDate === "function"
                    ? h.timestamp.toDate()
                    : new Date(h.timestamp),
              }));
            }
            return prev;
          });
          setHistoryLoaded(true);
        }
      })
      .catch((e) => console.warn("Error leyendo historial offline:", e));


    setCashierSessionsLoaded(false);
    setHistoryLoaded(false);
    setCashMovementsLoaded(false);
    setExpensesLoaded(false);
    setPurchasesLoaded(false);

    // We bind Firestore listeners with explicit tenantId to eliminate race conditions completely ⚡🏢
    const unsubProducts = subscribeToProducts(tenantId, (data) => {
      setProducts(data);
      try {
        localStorage.setItem("pos_products", JSON.stringify(data));
      } catch (e) {
        console.warn("Error caching products:", e);
      }
    });

    const unsubNotifications = subscribeToNotifications(tenantId, (fireNotifs) => {
      setNotificationsList((prev) => {
        const mergedMap = new globalThis.Map();
        prev.forEach((n) => mergedMap.set(n.id, n));
        
        fireNotifs.forEach((fn) => {
          mergedMap.set(fn.id, { ...mergedMap.get(fn.id), ...fn });
        });
        
        const newList = Array.from(mergedMap.values());
        newList.sort((a: any, b: any) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        return newList;
      });

      fireNotifs.forEach((fn) => {
        const notifTime = fn.createdAt ? new Date(fn.createdAt).getTime() : Date.now();
        const now = Date.now();
        const isRecent = Math.abs(now - notifTime) < 45000;

        if (isRecent && !notifiedIdsRef.current.has(fn.id)) {
          notifiedIdsRef.current.add(fn.id);

          const isCancellation = fn.isCancellationRequest || fn.isClosedAccountCancellationRequest || (fn.title && fn.title.toLowerCase().includes("cancel"));

          playNotificationSound(isCancellation);

          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              try {
                new Notification(fn.title || "Cocinet Alerta 🔔", {
                  body: fn.body || "",
                  vibrate: [200, 100, 200],
                  requireInteraction: true
                } as any);
              } catch (e) {
                console.warn("Error showing native Notification in subscription:", e);
              }
            } else if (Notification.permission === "default") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  try {
                    new Notification(fn.title || "Cocinet Alerta 🔔", {
                      body: fn.body || "",
                      vibrate: [200, 100, 200]
                    } as any);
                  } catch (e) {}
                }
              });
            }
          }
        }
      });
    });

    const unsubBackups = subscribeToMenuBackups(tenantId, (data) => {
      setBackups(data || []);
    });

    console.log("🌐 [WEBSOCKET_CONNECT] Subscribing to Firestore tables in real-time for tenant:", tenantId);

    const unsubTables = subscribeToTables(tenantId, (data) => {
      const occupiedInRaw = (data || []).filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
      console.log(`⚡ [WEBSOCKET_SNAPSHOT] Received ${data ? data.length : 0} raw table docs from Firestore. Occupied count: ${occupiedInRaw.length}`, occupiedInRaw.map((t: any) => `Mesa ${t.label} (${t.zone})`));

      let rawTables = data;

      if (!rawTables || rawTables.length === 0) {
        rawTables = createDefault30TablesList(tenantId);
        initializeDefaultTablesForTenant(tenantId).catch((err) => {
          console.warn("Error seeding tables for tenant:", err);
        });
      } else {
        rawTables = ensureAll35TablesForTenant(rawTables, tenantId);
        if (rawTables.length < 35) {
          initializeDefaultTablesForTenant(tenantId).catch((err) => {
            console.warn("Error seeding tables for tenant:", err);
          });
        }
      }

      // Parse dates and normalize legacy zones/labels to prevent crashes and jumbled groups
      const parsedServerTables = rawTables.map((t: any) => {
        let zone = normalizeZoneName(t.zone);
        let label = t.label || "";
        if (t.shape === "delivery" && label.startsWith("S")) {
          label = label.replace("S", "D");
        }
        return {
          ...t,
          zone,
          label,
          comandas: deduplicateComandas(
            (t.comandas || []).map((c: any) => ({
              ...c,
              timestamp:
                c.timestamp && typeof c.timestamp.toDate === "function"
                  ? c.timestamp.toDate()
                  : new Date(c.timestamp),
            }))
          ),
        };
      });

      const finalOccupied = parsedServerTables.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
      console.log(`🔴 [WEBSOCKET_SET_TABLES] Setting ${parsedServerTables.length} tables in React state. Occupied: ${finalOccupied.length}`, finalOccupied.map((t: any) => `Mesa ${t.label} (${t.zone})`));

      setTables(parsedServerTables);
      try {
        localStorage.setItem("pos_tables_" + tenantId, JSON.stringify(parsedServerTables));
      } catch (e) {
        console.warn("Error caching tables:", e);
      }
    });

    const unsubHistory = subscribeToHistory(tenantId, (data) => {
      const parsedServerHistory = (data || []).map((h: any) => ({
        ...h,
        timestamp:
          h.timestamp && typeof h.timestamp.toDate === "function"
            ? h.timestamp.toDate()
            : new Date(h.timestamp),
      }));
      setHistory(parsedServerHistory);
      setHistoryLoaded(true);
      // Guardamos en IndexedDB (sin límite de 5 MB de LocalStorage)
      saveLocalHistory(parsedServerHistory).catch((e) =>
        console.warn("Error caching history in IndexedDB:", e)
      );

      // Guardamos la versión ultra-ligera de hoy (<20 KB) para carga instantánea al abrir la app
      try {
        const currentOpDay = getOperatingDay(new Date());
        const todayHistory = parsedServerHistory.filter(
          (h: any) => getOperatingDay(h.timestamp) === currentOpDay
        );
        localStorage.setItem(
          `pos_recent_history_${tenantId}`,
          JSON.stringify(todayHistory)
        );
      } catch (e) {}

      // Purgamos la clave pesada de localStorage para evitar QuotaExceededError
      try {
        localStorage.removeItem("pos_history");
      } catch (e) {}

    });

    const unsubUsers = subscribeToUsers(
      (data) => {
        try {
          localStorage.setItem("pos_users", JSON.stringify(data));
          if (Array.isArray(data)) {
            const defaults = getDefaultUsersList();
            const mergedMap = new globalThis.Map<string, User>();
            defaults.forEach((u) => mergedMap.set(u.id, u));
            
            data.forEach((u) => {
              if (u.id) {
                mergedMap.set(u.id, {
                  id: u.id,
                  name: u.name || "",
                  role: u.role || "mesero",
                  pin: u.pin || "",
                  avatar: u.avatar || "fa-solid fa-user",
                  tenantId: u.tenantId || "",
                  phone: u.phone || "",
                  email: u.email || "",
                  reportSchedule: u.reportSchedule || "Al Cierre",
                  isReportRecipient: u.isReportRecipient ?? (u.role === "admin" || u.id.endsWith("-admin") || u.id.endsWith("-manager") || u.id.endsWith("-sistemas")),
                  fcmToken: u.fcmToken || ""
                });
              }
            });
            
            const mergedList = Array.from(mergedMap.values());
            localStorage.setItem("cocinet_users_db", JSON.stringify(mergedList));
            
            if (selectedTenant) {
              setUsers(mergedList.filter((u: any) => u.tenantId === selectedTenant.id));
            }
            if (modalTenant) {
              setModalUsers(mergedList.filter((u: any) => u.tenantId === modalTenant.id));
            }
          }
        } catch (e) {
          console.warn("Error caching users:", e);
        }
      },
      (error) => {
        triggerAppNotification(
          "⚠️ Permisos de Usuarios Bloqueados",
          `No se pudo leer la lista de PINs en la nube. Detalle: ${error?.message || error}. Asegúrate de habilitar los permisos de lectura/escritura en Firebase Firestore para la colección 'users'.`,
          "warning"
        );
      }
    );

    const unsubInv = subscribeToInventory(tenantId, (data) => {
      // Evitar elementos duplicados por ID
      const uniqueData = (data || []).filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.id === item.id),
      );
      setInventory(uniqueData);
      try {
        localStorage.setItem("pos_inventory", JSON.stringify(uniqueData));
      } catch (e) {
        console.warn("Error caching inventory:", e);
      }
    });

    const unsubPurchases = subscribeToPurchases(tenantId, (data) => {
      setPurchases(data);
      setPurchasesLoaded(true);
      try {
        localStorage.setItem("pos_purchases", JSON.stringify(data));
      } catch (e) {
        console.warn("Error caching purchases:", e);
      }
    });

    const unsubCashMovements = subscribeToCashMovements(tenantId, (data) => {
      const parsedMovements = (data || []).map((m: any) => ({
        ...m,
        date: m.date instanceof Date ? m.date : new Date(m.date),
      }));
      setCashMovements(parsedMovements);
      setCashMovementsLoaded(true);
      try {
        localStorage.setItem(
          "pos_cash_movements",
          JSON.stringify(parsedMovements),
        );
      } catch (e) {
        console.warn("Error caching cash_movements:", e);
      }
    });

    const unsubSuppliers = subscribeToSuppliers(tenantId, (data) => {
      setSuppliers(data);
      try {
        localStorage.setItem("pos_suppliers", JSON.stringify(data));
      } catch (e) {
        console.warn("Error caching suppliers:", e);
      }
    });

    const unsubCustomers = subscribeToCustomers(tenantId, (data) => {
      setCustomers(data);
      try {
        localStorage.setItem("pos_customers", JSON.stringify(data));
      } catch (e) {
        console.warn("Error caching customers:", e);
      }
    });

    const unsubInventoryMovements = subscribeToInventoryMovements(
      tenantId,
      (data) => {
        const safeData = data || [];
        setInventoryMovements(safeData);
        try {
          localStorage.setItem(
            "pos_inventory_movements",
            JSON.stringify(safeData),
          );
        } catch (e) {
          console.warn("Error caching inventory movements:", e);
        }
      },
    );

    const unsubArqueos = subscribeToArqueos(tenantId, (data) => {
      const safeData = data || [];
      setArqueosHistory(safeData);
      try {
        localStorage.setItem("pos_arqueos_history", JSON.stringify(safeData));
      } catch (e) {
        console.warn("Error caching arqueos history:", e);
      }
    });

    const unsubCashierSessions = subscribeToCashierSessions(
      tenantId,
      (data) => {
        const safeData = data || [];
        setCashierSessions(safeData);
        setCashierSessionsLoaded(true);
        try {
          localStorage.setItem(
            "pos_cashier_sessions",
            JSON.stringify(safeData),
          );
        } catch (e) {
          console.warn("Error caching cashier sessions:", e);
        }
      },
      (error) => {
        triggerAppNotification(
          "⚠️ Permisos de Cortes Bloqueados",
          `No se pudo sincronizar los turnos de caja en la nube. Detalle: ${error?.message || error}. Verifica los permisos de Firestore para 'cashier_sessions_v2'.`,
          "warning"
        );
      }
    );

    const unsubExpenses = subscribeToExpenses(tenantId, (data) => {
      const safeData = data || [];
      setExpenses(safeData);
      setExpensesLoaded(true);
      try {
        localStorage.setItem("pos_expenses", JSON.stringify(safeData));
      } catch (e) {
        console.warn("Error caching expenses:", e);
      }
    });

    const unsubCompanyConfig = subscribeToCompanyConfig(
      selectedTenant.id,
      (data: any) => {
        const rawB = data?.businessName || selectedTenant.name || "TACOS ROY";
        const b = sanitizeBusinessName(rawB);
        const r = data?.rfc || selectedTenant.rfc || "XAXX010101000";
        const s =
          data?.sucursal || selectedTenant.sucursalDefault || "Sucursal Centro";
        const f =
          data?.footerMessage ||
          `¡Gracias por su visita! Vuelva pronto 🌮 (${selectedTenant.ownerEmail})`;
        const g = data?.geminiApiKey || "";
        const u = data?.useRawBt ?? false;
        const reg = data?.regimenFiscal ?? selectedTenant.regimenFiscal ?? "";
        const dir = data?.direccionFiscal ?? selectedTenant.direccionFiscal ?? "";
        const lug = data?.lugarExpedicion ?? selectedTenant.lugarExpedicion ?? "";
        const tel = data?.telefono ?? selectedTenant.telefono ?? "";
        const eml = sanitizeEmail(data?.email ?? selectedTenant.email ?? "");

        if (data?.printerConfig) {
          saveTenantPrinterSettingsToLocal(selectedTenant.id, data.printerConfig);
          setTenantPrinterConfig(data.printerConfig);
        }

        if (data?.productCategories && Array.isArray(data.productCategories)) {
          try {
            localStorage.setItem(`product_categories_${selectedTenant.id}`, JSON.stringify(data.productCategories));
            setProductCategories(data.productCategories);
          } catch (e) {}
        }

        setCompanyConfig((prev) => ({
          ...prev,
          ...data,
          businessName: b,
          rfc: r,
          sucursal: s,
          footerMessage: f,
          geminiApiKey: g,
          useRawBt: u,
          regimenFiscal: reg,
          direccionFiscal: dir,
          lugarExpedicion: lug,
          telefono: tel,
          email: eml,
        }));

        setSystemUseRawBt(u);
        setTicketBusinessName(b);
        setTicketRfc(r);
        setTicketSucursal(s);
        setTicketFooterMessage(f);
        setTicketGeminiApiKey(g);
        setTicketRegimenFiscal(reg);
        setTicketDireccionFiscal(dir);
        setTicketLugarExpedicion(lug);
        setTicketTelefono(tel);
        setTicketEmail(eml);

        try {
          localStorage.setItem(
            "company_config",
            JSON.stringify({
              businessName: b,
              rfc: r,
              sucursal: s,
              footerMessage: f,
              geminiApiKey: g,
              useRawBt: u,
              regimenFiscal: reg,
              direccionFiscal: dir,
              lugarExpedicion: lug,
              telefono: tel,
              email: eml,
            }),
          );
          localStorage.setItem("system_use_rawbt", u ? "true" : "false");
        } catch (e) {
          console.warn("Error caching company config:", e);
        }
      },
    );

    const unsubCorte2 = subscribeToCorteFolioHistoryFromFirebase(tenantId, (records) =>
      setCorte2Records(records || [])
    );

    fetchConfig();
    migrateAvatarsInFirebase().catch((e) =>
      console.warn("Avatar migrate bypass (offline/connection transient):", e),
    );

    return () => {
      unsubProducts();
      unsubNotifications();
      unsubTables();
      unsubHistory();
      unsubUsers();
      unsubInv();
      unsubPurchases();
      unsubCashMovements();
      unsubSuppliers();
      unsubCustomers();
      unsubInventoryMovements();
      unsubArqueos();
      unsubExpenses();
      unsubCashierSessions();
      unsubBackups();
      unsubCompanyConfig();
      unsubCorte2();
    };
  }, [selectedTenant?.id]);

  // 📦 Subscribe to full tenant backup snapshots (real-time) - Disabled as requested
  useEffect(() => {
    if (!selectedTenant?.id) return;
    setTenantBackupSnapshots([]);
  }, [selectedTenant?.id]);

  useEffect(() => {
    if (currentUser && selectedTenant?.id) {
      const tenantId = selectedTenant.id;
      fetchTablesFromFirebase(tenantId)
        .then((liveTables) => {
          if (liveTables && liveTables.length > 0) {
            const ensured = ensureAll35TablesForTenant(liveTables, tenantId);
            const parsed = ensured.map((t: any) => ({
              ...t,
              zone: normalizeZoneName(t.zone),
              comandas: (t.comandas || []).map((c: any) => ({
                ...c,
                timestamp:
                  c.timestamp && typeof c.timestamp.toDate === "function"
                    ? c.timestamp.toDate()
                    : new Date(c.timestamp),
              })),
            }));
            setTables(parsed);
            try {
              localStorage.setItem("pos_tables_" + tenantId, JSON.stringify(parsed));
            } catch (e) {}
          }
        })
        .catch((err) => console.warn("Error auto-refreshing tables on user change:", err));
    }
  }, [currentUser?.id, selectedTenant?.id]);

  // Sincronización continua con la base de datos local (SQLite) para el Sentinel de Impresión ⚙️⚡
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error" | "success">("idle");
  const lastSyncRef = useRef<number>(0);
  useEffect(() => {
    if (!selectedTenant || !tables.length) return;

    const syncWithLocalDB = async () => {
      const now = Date.now();
      if (now - lastSyncRef.current < 3000) return; // Mínimo 3 segundos entre syncs
      
      setSyncStatus("syncing");
      try {
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products,
            tables: tables.map(t => ({
              ...t,
              comandas: t.comandas || [] 
            })),
            history: history.slice(0, 100),
            tenantInfo: {
              name: selectedTenant.name,
              branch: selectedTenant.branch || selectedTenant.sucursalDefault || "Matriz"
            }
          })
        });
        
        if (response.ok) {
          lastSyncRef.current = Date.now();
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2000);
        } else {
          setSyncStatus("error");
        }
      } catch (err) {
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(syncWithLocalDB, 2000);
    return () => clearTimeout(timer);
  }, [tables, history, products, selectedTenant?.id]);

  // Solicitar permiso de notificaciones al inicio 🔔
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const [configActiveTab, setConfigActiveTab] = useState<
    "system" | "corte" | "inventory" | "database" | "users"
  >("system");

  // User Management State (Offline-ready)
  const [showEmployeeGuide, setShowEmployeeGuide] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    role: "mesero" as "mesero" | "cajero" | "admin",
    pin: "",
    avatar: "fa-solid fa-bell-concierge",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    pin: "",
  });
  const [expandedDashboardInvId, setExpandedDashboardInvId] = useState<
    string | null
  >(null);
  const [expandedDashboardSaleMethod, setExpandedDashboardSaleMethod] =
    useState<string | null>(null);
  const [movementModal, setMovementModal] = useState<{
    isOpen: boolean;
    item: any | null;
    type: "IN" | "OUT";
  }>({ isOpen: false, item: null, type: "IN" });

  // States for live MySQL developer simulation & design validator 💡💻🤖
  const [mysqlConcept, setMysqlConcept] = useState("");
  const [mysqlGenerating, setMysqlGenerating] = useState(false);
  const [mysqlResult, setMysqlResult] = useState<any | null>(null);
  const [websocketSyncLog, setWebsocketSyncLog] = useState<any[]>(() => {
    return [
      {
        id: "ws-event-1",
        uid: "c0a80101-1e24-4b5c-8d1e-289f8123abc1",
        event: "CONNECT",
        topic: "sync:pos_terminal_main",
        timestamp: getMexicoISOString(),
        details:
          "🔌 Conexión establecida con éxito con el servidor de sincronización continuo.",
      },
      {
        id: "ws-event-2",
        uid: "df098c11-fc23-4f91-88c9-fae202199b45",
        event: "SUBSCRIBE",
        topic: "sync:closed_accounts",
        timestamp: getMexicoISOString(),
        details:
          "📡 Suscripción al tópico de actualizaciones de auditoría de ventas activa.",
      },
    ];
  });
  const [corteTab, setCorteTab] = useState<"corte" | "precorte">("corte");
  const [reportsTab, setReportsTab] = useState<"sales" | "inventory">("sales");
  const [invReportDate, setInvReportDate] = useState<string>(
    () => getMexicoISOString().split("T")[0],
  );
  const [reporteMovimientosInicio, setReporteMovimientosInicio] = useState<string>(() => {
    const today = getMexicoISOString().split("T")[0];
    return today + "T14:00";
  });
  const [reporteMovimientosFin, setReporteMovimientosFin] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    return tomorrowStr + "T06:00";
  });
  const [isMovimientosConsulted, setIsMovimientosConsulted] = useState<boolean>(false);
  const [corteXSelectedDate, setCorteXSelectedDate] = useState<string>(
    () => getMexicoISOString().split("T")[0],
  );
  const [corteXFondoApertura, setCorteXFondoApertura] = useState<number>(1000);
  const [showCorteXCopiedToast, setShowCorteXCopiedToast] = useState<boolean>(false);

  // Corte X Independent Cash Count Denominations
  const [corteXArqB1000, setCorteXArqB1000] = useState<string>("0");
  const [corteXArqB500, setCorteXArqB500] = useState<string>("0");
  const [corteXArqB200, setCorteXArqB200] = useState<string>("0");
  const [corteXArqB100, setCorteXArqB100] = useState<string>("0");
  const [corteXArqB50, setCorteXArqB50] = useState<string>("0");
  const [corteXArqB20, setCorteXArqB20] = useState<string>("0");
  const [corteXArqM20, setCorteXArqM20] = useState<string>("0");
  const [corteXArqM10, setCorteXArqM10] = useState<string>("0");
  const [corteXArqM5, setCorteXArqM5] = useState<string>("0");
  const [corteXArqM2, setCorteXArqM2] = useState<string>("0");
  const [corteXArqM1, setCorteXArqM1] = useState<string>("0");
  const [corteXArqM05, setCorteXArqM05] = useState<string>("0");
  const [showManageMenuModal, setShowManageMenuModal] = useState(false);
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [inventoryTab, setInventoryTab] = useState<"stock" | "purchases">(
    "stock",
  );
  const [manageMenuTab, setManageMenuTab] = useState<
    | "backup"
    | "import_tenant"
    | "upload_subgroups"
    | "food"
    | "drinks"
    | "desserts"
    | "recipes"
    | "adhoc_notes"
    | "split_products"
    | "relation_order_ia"
    | null
  >(null);
  const [menuFilterNode, setMenuFilterNode] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // 🏢 Control de Gestión de la Red de Empresas (Concepto Relacional MySQL con UUID y Timestamps)
  const [companiesConfig, setCompaniesConfig] = useState<
    Record<
      string,
      {
        id: string;
        visible: boolean;
        groupName: string;
        uuid: string;
        created_at: string;
        updated_at: string;
      }
    >
  >(() => {
    const cached = localStorage.getItem("cocinet_companies_config_v3");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Error cargando config de empresas:", e);
      }
    }
    const defaults: Record<string, any> = {};
    COMPANY_CATALOG.forEach((c) => {
      defaults[c.id] = {
        id: c.id,
        visible: true,
        groupName: c.propietario ? `Grupo ${c.propietario}` : "Grupo General",
        uuid: `usr_ten_${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
        created_at: getMexicoISOString(),
        updated_at: getMexicoISOString(),
      };
    });
    return defaults;
  });

  const [showManageCompaniesModal, setShowManageCompaniesModal] =
    useState(false);
  const [showBranchSwitcherModal, setShowBranchSwitcherModal] = useState(false);
  const [showTenantUsersModal, setShowTenantUsersModal] = useState(false);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [showTenantCrudModal, setShowTenantCrudModal] = useState(false);
  const [tenantsVersion, setTenantsVersion] = useState(0);


  useEffect(() => {
    const unsub = subscribeToTenants(async (firestoreTenants) => {
      // Merge Firestore tenants with DEFAULT_COMPANY_CATALOG
      const merged = [...DEFAULT_COMPANY_CATALOG];
      
      // Auto-seed: If a default tenant is missing from Firestore, upload it 🏢🚀
      for (const defTenant of DEFAULT_COMPANY_CATALOG) {
        const exists = firestoreTenants.find(ft => ft.id === defTenant.id);
        if (!exists) {
          console.log(`Seeding missing tenant to cloud: ${defTenant.name}`);
          try {
            await addTenantToFirebase({
              ...defTenant,
              createdAt: getMexicoISOString(),
              updatedAt: getMexicoISOString(),
              isSystemDefault: true
            });
          } catch (err) {
            console.error("Error seeding tenant:", err);
          }
        }
      }

      firestoreTenants.forEach((ft) => {
        const normalizedTenant: CompanyTenant = {
          sucursalDefault: ft.sucursalDefault || ft.name || "Sucursal",
          ownerKey: ft.ownerKey || "1",
          propietario: ft.propietario || "PROPIETARIO",
          bgColor: ft.bgColor || "from-slate-50 to-indigo-100",
          avatar: ft.avatar || "🏢",
          accentColor: ft.accentColor || "#4f46e5",
          lightColor: ft.lightColor || (ft.accentColor ? ft.accentColor + "33" : "#4f46e533"),
          ...ft,
          type: ft.type || "Sucursal",
        };
        const idx = merged.findIndex((m) => m.id === ft.id);
        if (idx !== -1) {
          merged[idx] = normalizedTenant;
        } else {
          merged.push(normalizedTenant);
        }
      });

      // Auto-register missing owners in customOwners so owner cards and tenants render
      setCustomOwners((prevOwners) => {
        let changed = false;
        const nextOwners = [...prevOwners];
        merged.forEach((t) => {
          if (t.ownerKey && !nextOwners.some((o) => o.key === t.ownerKey)) {
            nextOwners.push({
              key: t.ownerKey,
              name: (t.propietario || `GRUPO ${t.ownerKey}`).toUpperCase(),
              avatar: t.avatar || "🤠",
              company: `Grupo ${t.propietario || t.ownerKey}`,
              accentColor: "indigo",
              logo: t.logoUrl || "",
            });
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("cocinet_custom_owners_v3", JSON.stringify(nextOwners));
          UNIQUE_OWNERS = nextOwners;
        }
        return changed ? nextOwners : prevOwners;
      });
      
      // Update global COMPANY_CATALOG
      COMPANY_CATALOG.length = 0;
      COMPANY_CATALOG.push(...merged);
      
      // Update local storage as well for offline fallback
      localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
      
      setSelectedTenant((currentTenant) => {
        if (!currentTenant) return merged[0];
        const updated = merged.find((t) => t.id === currentTenant.id);
        if (!updated) return currentTenant;
        if (currentTenant.id === updated.id && currentTenant.name === updated.name && currentTenant.sucursalDefault === updated.sucursalDefault) {
          return currentTenant;
        }
        return updated;
      });

      setTenantsVersion((v) => v + 1);

      // 🔑 BUG FIX: Auto-add any new tenants to companiesConfig so they are visible on ALL devices
      setCompaniesConfig((prevConfig) => {
        let changed = false;
        const next = { ...prevConfig };
        merged.forEach((tenant) => {
          if (!next[tenant.id]) {
            next[tenant.id] = {
              id: tenant.id,
              visible: true,
              groupName: tenant.propietario ? `Grupo ${tenant.propietario}` : "Grupo General",
              uuid: `usr_ten_${tenant.id}`,
              created_at: getMexicoISOString(),
              updated_at: getMexicoISOString(),
            };
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("cocinet_companies_config_v3", JSON.stringify(next));
        }
        return changed ? next : prevConfig;
      });

      // Keep selectedTenant state synchronized with Firestore updates
      setSelectedTenant((current) => {
        if (!current) return current;
        const updated = merged.find((t) => t.id === current.id);
        if (updated) {
          if (JSON.stringify(updated) !== JSON.stringify(current)) {
            localStorage.setItem("pos_selected_tenant", JSON.stringify(updated));
            return updated as any;
          }
        }
        return current;
      });
    });
    return () => unsub();
  }, []);

  // 🌐 Sync companiesConfig from Firestore (so all devices see the same visibility settings)
  useEffect(() => {
    const unsub = subscribeToCompaniesConfigFromFirebase((firestoreConfig) => {
      if (!firestoreConfig) return;
      setCompaniesConfig((prev) => {
        // Merge: Firestore is authoritative, but keep any local-only entries (new tenants not yet synced)
        const merged = { ...prev };
        Object.entries(firestoreConfig).forEach(([id, conf]) => {
          merged[id] = conf as any;
        });
        localStorage.setItem("cocinet_companies_config_v3", JSON.stringify(merged));
        return merged;
      });
    });
    return () => unsub();
  }, []);

  // 👑 Sincronizar Propietarios y PINs desde Firestore (tiempo real)
  useEffect(() => {
    const unsub = subscribeToCustomOwnersFromFirebase(async (data) => {
      if (!data) {
        try {
          const defaultOwners = [
            { key: "1", name: "SORAYA & JORGE", avatar: "🤠", company: 'Cadena "Los Sombrerudos"', accentColor: "red" },
            { key: "2", name: "EVELIN", avatar: "👒", company: 'Taquerías "Los Sombrerudos"', accentColor: "purple" },
            { key: "3", name: "ARMANDO", avatar: "👑", company: 'Los Mero Mero "Universidad"', accentColor: "pink" },
            { key: "4", name: "EL MERO MERO", avatar: "🎩", company: 'Los Mero Mero "Santa María"', accentColor: "teal" },
            { key: "5", name: "SAN SEBASTIÁN", avatar: "🎓", company: 'Taquerías "San Sebastián"', accentColor: "amber" },
            { key: "6", name: "BLADIMIR", avatar: "🌮", company: 'Tacos Roy "MBravo"', accentColor: "red" },
            { key: "7", name: "AMPARO", avatar: "🌯", company: 'Tacos y Retacos "Roy"', accentColor: "emerald" },
            { key: "8", name: "LEVI", avatar: "🥗", company: 'Tacos Roy "Viguera"', accentColor: "indigo" },
            { key: "9", name: "TLACOLULA", avatar: "🏛️", company: 'Tlacolula Tlacolula', accentColor: "pink" },
            { key: "10", name: "HUAYAPAM", avatar: "🌿", company: 'Crucero Huayapam', accentColor: "cyan" }
          ];
          const defaultPins = {
            "1": "2010",
            "2": "2020",
            "3": "2030",
            "4": "2040",
            "5": "2050",
            "6": "2060",
            "7": "2070",
            "8": "2080",
            "9": "2090",
            "10": "2100"
          };
          await saveCustomOwnersToFirebase(defaultOwners, defaultPins);
        } catch (err) {
          console.error("Error al inicializar propietarios en Firestore:", err);
        }
        return;
      }

      const { owners, pins, supervisorPins } = data;
      
      // Read local cached custom owners to prevent overwriting locally created entries
      let cachedLocalOwners: any[] = [];
      let cachedLocalPins: Record<string, string> = {};
      let cachedLocalSupervisorPins: Record<string, string> = {};
      try {
        const cO = localStorage.getItem("cocinet_custom_owners_v3");
        if (cO) cachedLocalOwners = JSON.parse(cO);
        const cP = localStorage.getItem("cocinet_custom_owner_pins_v3");
        if (cP) cachedLocalPins = JSON.parse(cP);
        const cSP = localStorage.getItem("cocinet_custom_supervisor_pins_v3");
        if (cSP) cachedLocalSupervisorPins = JSON.parse(cSP);
      } catch (e) {}

      const mergedOwners = [
        { key: "1", name: "SORAYA & JORGE", avatar: "🤠", company: 'Cadena "Los Sombrerudos"', accentColor: "red" },
        { key: "2", name: "EVELIN", avatar: "👒", company: 'Taquerías "Los Sombrerudos"', accentColor: "purple" },
        { key: "3", name: "ARMANDO", avatar: "👑", company: 'Los Mero Mero "Universidad"', accentColor: "pink" },
        { key: "4", name: "EL MERO MERO", avatar: "🎩", company: 'Los Mero Mero "Santa María"', accentColor: "teal" },
        { key: "5", name: "SAN SEBASTIÁN", avatar: "🎓", company: 'Taquerías "San Sebastián"', accentColor: "amber" },
        { key: "6", name: "BLADIMIR", avatar: "🌮", company: 'Tacos Roy "MBravo"', accentColor: "red" },
        { key: "7", name: "AMPARO", avatar: "🌯", company: 'Tacos y Retacos "Roy"', accentColor: "emerald" },
        { key: "8", name: "LEVI", avatar: "🥗", company: 'Tacos Roy "Viguera"', accentColor: "indigo" },
        { key: "9", name: "TLACOLULA", avatar: "🏛️", company: 'Tlacolula Tlacolula', accentColor: "pink" },
        { key: "10", name: "HUAYAPAM", avatar: "🌿", company: 'Crucero Huayapam', accentColor: "cyan" }
      ];

      // Merge local custom owners first
      cachedLocalOwners.forEach((o: any) => {
        if (o && o.key) {
          const idx = mergedOwners.findIndex(mo => mo.key === o.key);
          if (idx !== -1) mergedOwners[idx] = o;
          else mergedOwners.push(o);
        }
      });

      // Merge Firestore owners (authoritative)
      owners.forEach((o: any) => {
        if (o && o.key) {
          const idx = mergedOwners.findIndex(mo => mo.key === o.key);
          if (idx !== -1) mergedOwners[idx] = o;
          else mergedOwners.push(o);
        }
      });

      const mergedPins = {
        "1": "2010",
        "2": "2020",
        "3": "2030",
        "4": "2040",
        "5": "2050",
        "6": "2060",
        "7": "2070",
        "8": "2080",
        "9": "2090",
        "10": "2100",
        ...cachedLocalPins,
        ...pins
      };

      const mergedSupervisorPins = {
        "1": "2011",
        "2": "2021",
        "3": "2031",
        "4": "2041",
        "5": "2051",
        "6": "2061",
        "7": "2071",
        "8": "2081",
        "9": "2091",
        "10": "2101",
        ...cachedLocalSupervisorPins,
        ...supervisorPins
      };

      setCustomOwners(mergedOwners);
      setCustomOwnerPins(mergedPins);
      setCustomOwnerSupervisorPins(mergedSupervisorPins);
      UNIQUE_OWNERS = mergedOwners;
      OWNER_PINS = mergedPins;
      OWNER_SUPERVISOR_PINS = mergedSupervisorPins;

      localStorage.setItem("cocinet_custom_owners_v3", JSON.stringify(mergedOwners));
      localStorage.setItem("cocinet_custom_owner_pins_v3", JSON.stringify(mergedPins));
      localStorage.setItem("cocinet_custom_supervisor_pins_v3", JSON.stringify(mergedSupervisorPins));
      setOwnersVersion((v) => v + 1);
    });
    return () => unsub();
  }, []);

  const [ownersVersion, setOwnersVersion] = useState(0);
  const [isSwitchingTenant, setIsSwitchingTenant] = useState<boolean>(false);
  const [switchingTenantName, setSwitchingTenantName] = useState<string>("");

  const renderSwitchingTenantOverlay = () => (
    <SwitchingTenantOverlayView
      switchingTenantName={switchingTenantName}
      
    />
  );;

  const [customOwners, setCustomOwners] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("cocinet_custom_owners_v3");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return UNIQUE_OWNERS;
  });
  const [customOwnerPins, setCustomOwnerPins] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem("cocinet_custom_owner_pins_v3");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return OWNER_PINS;
  });
  const [customOwnerSupervisorPins, setCustomOwnerSupervisorPins] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem("cocinet_custom_supervisor_pins_v3");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return OWNER_SUPERVISOR_PINS;
  });

  const [showOwnerCrudModal, setShowOwnerCrudModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<any | null>(null);
  const [formOwnerName, setFormOwnerName] = useState("");
  const [formOwnerAvatar, setFormOwnerAvatar] = useState("🤠");
  const [formOwnerAccent, setFormOwnerAccent] = useState("indigo");
  const [formOwnerPin, setFormOwnerPin] = useState("");
  const [formOwnerSupervisorPin, setFormOwnerSupervisorPin] = useState("");
  const [formOwnerLogo, setFormOwnerLogo] = useState("");
  const isSavingOwnerRef = useRef(false);
  const [isSavingOwner, setIsSavingOwner] = useState(false);

  const handleSaveOwner = async () => {
    if (isSavingOwnerRef.current) return;
    if (!formOwnerName.trim()) {
      triggerAppNotification("⚠️ Error", "El nombre del propietario es requerido.", "warning");
      return;
    }

    if (!editingOwner) {
      const exists = customOwners.some(
        o => o.name.trim().toUpperCase() === formOwnerName.trim().toUpperCase()
      );
      if (exists) {
        triggerAppNotification(
          "⚠️ Propietario Existente",
          `Ya existe un propietario con el nombre "${formOwnerName.trim()}".`,
          "warning"
        );
        return;
      }
    }

    isSavingOwnerRef.current = true;
    setIsSavingOwner(true);

    try {
      let updatedOwners = [...customOwners];
      let updatedPins = { ...customOwnerPins };
      let updatedSupervisorPins = { ...customOwnerSupervisorPins };

      if (editingOwner) {
        // Edit existing
        updatedOwners = updatedOwners.map(o => {
          if (o.key === editingOwner.key) {
            return { ...o, name: formOwnerName.toUpperCase(), avatar: formOwnerAvatar, accentColor: formOwnerAccent, logo: formOwnerLogo };
          }
          return o;
        });
        if (formOwnerPin) {
          updatedPins[editingOwner.key] = formOwnerPin;
        }
        if (formOwnerSupervisorPin) {
          updatedSupervisorPins[editingOwner.key] = formOwnerSupervisorPin;
        }
        triggerAppNotification("💾 Propietario Actualizado", `Se guardaron los cambios para ${formOwnerName}`, "success");
      } else {
        // Add new
        const nextKey = (Math.max(...updatedOwners.map(o => parseInt(o.key) || 0), 0) + 1).toString();
        const newOwner = {
          key: nextKey,
          name: formOwnerName.toUpperCase(),
          avatar: formOwnerAvatar,
          company: `Grupo ${formOwnerName}`,
          accentColor: formOwnerAccent,
          logo: formOwnerLogo
        };
        updatedOwners.push(newOwner);
        updatedPins[nextKey] = formOwnerPin || (2000 + parseInt(nextKey) * 10).toString();
        updatedSupervisorPins[nextKey] = formOwnerSupervisorPin || (2001 + parseInt(nextKey) * 10).toString();
        triggerAppNotification("👑 Propietario Registrado", `Se creó el propietario ${formOwnerName} (PIN Owner: ${updatedPins[nextKey]}, Supervisor: ${updatedSupervisorPins[nextKey]})`, "success");
      }

      setCustomOwners(updatedOwners);
      setCustomOwnerPins(updatedPins);
      setCustomOwnerSupervisorPins(updatedSupervisorPins);
      UNIQUE_OWNERS = updatedOwners;
      OWNER_PINS = updatedPins;
      OWNER_SUPERVISOR_PINS = updatedSupervisorPins;
      localStorage.setItem("cocinet_custom_owners_v3", JSON.stringify(updatedOwners));
      localStorage.setItem("cocinet_custom_owner_pins_v3", JSON.stringify(updatedPins));
      localStorage.setItem("cocinet_custom_supervisor_pins_v3", JSON.stringify(updatedSupervisorPins));
      setOwnersVersion(prev => prev + 1);
      setShowOwnerCrudModal(false);
      setEditingOwner(null);

      try {
        await saveCustomOwnersToFirebase(updatedOwners, updatedPins, updatedSupervisorPins);
      } catch (err) {
        console.error("Error al guardar propietarios en Firebase:", err);
      }
    } finally {
      isSavingOwnerRef.current = false;
      setIsSavingOwner(false);
    }
  };

  const handleDeleteOwner = async (ownerKey: string) => {
    const updatedOwners = customOwners.filter(o => o.key !== ownerKey);
    const updatedPins = { ...customOwnerPins };
    const updatedSupervisorPins = { ...customOwnerSupervisorPins };
    delete updatedPins[ownerKey];
    delete updatedSupervisorPins[ownerKey];

    setCustomOwners(updatedOwners);
    setCustomOwnerPins(updatedPins);
    setCustomOwnerSupervisorPins(updatedSupervisorPins);
    UNIQUE_OWNERS = updatedOwners;
    OWNER_PINS = updatedPins;
    OWNER_SUPERVISOR_PINS = updatedSupervisorPins;
    localStorage.setItem("cocinet_custom_owners_v3", JSON.stringify(updatedOwners));
    localStorage.setItem("cocinet_custom_owner_pins_v3", JSON.stringify(updatedPins));
    localStorage.setItem("cocinet_custom_supervisor_pins_v3", JSON.stringify(updatedSupervisorPins));
    setOwnersVersion(prev => prev + 1);
    triggerAppNotification("🗑️ Propietario Eliminado", "El propietario ha sido eliminado de la red de sucursales.", "warning");

    try {
      await saveCustomOwnersToFirebase(updatedOwners, updatedPins, updatedSupervisorPins);
    } catch (err) {
      console.error("Error al guardar eliminación de propietario en Firebase:", err);
    }
  };

  const [editingTenant, setEditingTenant] = useState<CompanyTenant | null>(null);
  const [formTenantName, setFormTenantName] = useState("");
  const [formTenantRfc, setFormTenantRfc] = useState("");
  const [formTenantEmail, setFormTenantEmail] = useState("");
  const [formTenantAvatar, setFormTenantAvatar] = useState("🏢");
  const [formTenantAccentColor, setFormTenantAccentColor] = useState("#4f46e5");
  const [formTenantSucursal, setFormTenantSucursal] = useState("");
  const [formTenantType, setFormTenantType] = useState<"Matriz" | "Sucursal">("Matriz");
  const [formTenantOwnerKey, setFormTenantOwnerKey] = useState("");
  const [formTenantPropietario, setFormTenantPropietario] = useState("");
  const [formTenantDireccion, setFormTenantDireccion] = useState("");
  const [formTenantLat, setFormTenantLat] = useState<number | "">("");
  const [formTenantLng, setFormTenantLng] = useState<number | "">("");
  const [formTenantLogoUrl, setFormTenantLogoUrl] = useState("");
  const [formTenantRequireInternalFolio, setFormTenantRequireInternalFolio] = useState<boolean>(false);
  const [formTenantAllowEfectivo, setFormTenantAllowEfectivo] = useState<boolean>(true);
  const [formTenantAllowTarjeta, setFormTenantAllowTarjeta] = useState<boolean>(true);
  const [formTenantAllowTransferencia, setFormTenantAllowTransferencia] = useState<boolean>(true);
  const [formTenantAllowLupay, setFormTenantAllowLupay] = useState<boolean>(true);
  const [formTenantRequireCardDigits, setFormTenantRequireCardDigits] = useState<boolean>(true);

  // Tenant Transfer States (Traspaso de Inquilino inline)
  const [transferStep, setTransferStep] = useState<0 | 1 | 2>(0);
  const [transferTargetOwnerKey, setTransferTargetOwnerKey] = useState("");
  const [transferIncludeBranches, setTransferIncludeBranches] = useState(true);
  const isSavingTenantRef = useRef(false);
  const [isSavingTenant, setIsSavingTenant] = useState(false);

  const resetTenantForm = () => {
    setEditingTenant(null);
    setFormTenantName("");
    setFormTenantRfc("");
    setFormTenantEmail("");
    setFormTenantAvatar("🏢");
    setFormTenantAccentColor("#4f46e5");
    setFormTenantSucursal("");
    setFormTenantType("Matriz");
    setFormTenantOwnerKey("");
    setFormTenantPropietario("");
    setFormTenantDireccion("");
    setFormTenantLat("");
    setFormTenantLng("");
    setFormTenantLogoUrl("");
    setFormTenantRequireInternalFolio(false);
    setFormTenantAllowEfectivo(true);
    setFormTenantAllowTarjeta(true);
    setFormTenantAllowTransferencia(true);
    setFormTenantAllowLupay(true);
    setFormTenantRequireCardDigits(true);
    setTransferStep(0);
    setTransferTargetOwnerKey("");
    setTransferIncludeBranches(true);
  };

  const handleEditTenantClick = (tenant: CompanyTenant) => {
    setEditingTenant(tenant);
    setFormTenantName(tenant.name);
    setFormTenantRfc(tenant.rfc);
    setFormTenantEmail(tenant.ownerEmail);
    setFormTenantAvatar(tenant.avatar);
    setFormTenantAccentColor(tenant.accentColor);
    setFormTenantSucursal(tenant.sucursalDefault);
    setFormTenantType(tenant.type);
    setFormTenantOwnerKey(tenant.ownerKey || "");
    setFormTenantPropietario(tenant.propietario || "");
    setFormTenantDireccion(tenant.direccion || "");
    setFormTenantLat(tenant.lat ?? "");
    setFormTenantLng(tenant.lng ?? "");
    setFormTenantLogoUrl(tenant.logoUrl || "");
    setFormTenantRequireInternalFolio(tenant.requireInternalFolio === true);
    setFormTenantAllowEfectivo(tenant.allowEfectivo !== false);
    setFormTenantAllowTarjeta(tenant.allowTarjeta !== false);
    setFormTenantAllowTransferencia(tenant.allowTransferencia !== false);
    setFormTenantAllowLupay(tenant.allowLupay !== false);
    setFormTenantRequireCardDigits(tenant.requireCardDigits !== false);
    setTransferStep(0);
    setTransferTargetOwnerKey("");
    setTransferIncludeBranches(tenant.type === "Matriz");
    setShowTenantCrudModal(true);
  };

  const executeTenantTransfer = async () => {
    if (!editingTenant || !transferTargetOwnerKey) return;

    const targetOwner = customOwners.find(o => o.key === transferTargetOwnerKey);
    const targetName = targetOwner ? targetOwner.name : formTenantPropietario || "PROPIETARIO";
    const originOwnerKey = editingTenant.ownerKey || "";
    const originOwner = customOwners.find(o => o.key === originOwnerKey);
    const originOwnerName = originOwner?.name || editingTenant.propietario || "ORIGEN";

    // 1. Prepare updated main tenant
    const updatedTenant: CompanyTenant = {
      ...editingTenant,
      name: formTenantName.trim() || editingTenant.name,
      rfc: formTenantRfc.trim().toUpperCase() || editingTenant.rfc,
      sucursalDefault: formTenantSucursal.trim() || editingTenant.sucursalDefault,
      ownerKey: transferTargetOwnerKey,
      propietario: targetName,
      ownerEmail: targetOwner?.ownerEmail || formTenantEmail || editingTenant.ownerEmail,
      type: formTenantType,
      direccion: formTenantDireccion.trim() || editingTenant.direccion,
      lat: formTenantLat !== "" ? Number(formTenantLat) : editingTenant.lat,
      lng: formTenantLng !== "" ? Number(formTenantLng) : editingTenant.lng,
      logoUrl: formTenantLogoUrl || editingTenant.logoUrl,
      requireInternalFolio: formTenantRequireInternalFolio,
      allowEfectivo: formTenantAllowEfectivo,
      allowTarjeta: formTenantAllowTarjeta,
      allowTransferencia: formTenantAllowTransferencia,
      allowLupay: formTenantAllowLupay,
      requireCardDigits: formTenantRequireCardDigits,
      updatedAt: getMexicoISOString(),
    };

    const updatedCatalog = [...COMPANY_CATALOG];
    const mainIdx = updatedCatalog.findIndex(c => c.id === editingTenant.id);
    if (mainIdx !== -1) {
      updatedCatalog[mainIdx] = updatedTenant;
    }

    // 2. If transferIncludeBranches & Matriz, update all dependent branches of origin owner
    let transferredBranchCount = 0;
    if (transferIncludeBranches && editingTenant.type === "Matriz") {
      updatedCatalog.forEach((comp, i) => {
        if (comp.id !== editingTenant.id && comp.ownerKey === originOwnerKey) {
          updatedCatalog[i] = {
            ...comp,
            ownerKey: transferTargetOwnerKey,
            propietario: targetName,
            updatedAt: getMexicoISOString(),
          };
          transferredBranchCount++;
          addTenantToFirebase(updatedCatalog[i]).catch(err => console.warn("Branch sync error:", err));
        }
      });
    }

    // 3. Save main tenant to Firebase
    try {
      await addTenantToFirebase(updatedTenant);
    } catch (err) {
      console.warn("Could not save tenant to Firebase:", err);
    }

    // 4. Update global COMPANY_CATALOG array & localStorage
    COMPANY_CATALOG.length = 0;
    COMPANY_CATALOG.push(...updatedCatalog);
    localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
    setTenantsVersion(prev => prev + 1);

    // 5. Success notification
    triggerAppNotification(
      "🔄 Traspaso Concluido Con Éxito",
      `Se traspasó "${updatedTenant.name}" de ${originOwnerName} (Clave ${originOwnerKey}) a ${targetName} (Clave ${transferTargetOwnerKey})` +
        (transferredBranchCount > 0 ? ` junto con ${transferredBranchCount} sucursal(es).` : "."),
      "success"
    );

    setTransferStep(0);
    setShowTenantCrudModal(false);
    resetTenantForm();
  };

  const handleSaveTenant = async () => {
    if (isSavingTenantRef.current) return;
    if (!formTenantName.trim()) {
      triggerAppNotification("⚠️ Nombre Requerido", "Debes indicar el nombre de la sucursal/empresa.", "warning");
      return;
    }

    let nextOwnerKey = formTenantOwnerKey;
    let nextPropietario = formTenantPropietario;
    let nextEmail = formTenantEmail;

    if (formTenantType === "Matriz" && !nextOwnerKey) {
      const existingKeys = COMPANY_CATALOG.map(c => parseInt(c.ownerKey || "0", 10)).filter(k => !isNaN(k));
      nextOwnerKey = (existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1).toString();
      if (!nextPropietario) {
        nextPropietario = formTenantName.split(" ")[0].toUpperCase();
      }
    }

    // If editing existing tenant and owner changed in inputs, deploy 2-step confirmation transfer
    if (editingTenant && (nextOwnerKey !== editingTenant.ownerKey || (nextPropietario && nextPropietario !== editingTenant.propietario))) {
      setTransferTargetOwnerKey(nextOwnerKey);
      setTransferIncludeBranches(formTenantType === "Matriz");
      setTransferStep(1);
      return;
    }

    // Double-submit / duplicate branch check
    if (!editingTenant) {
      const isDuplicate = COMPANY_CATALOG.some(
        c => c.name.trim().toLowerCase() === formTenantName.trim().toLowerCase() &&
             (c.sucursalDefault || "").trim().toLowerCase() === formTenantSucursal.trim().toLowerCase() &&
             c.ownerKey === (nextOwnerKey || "1")
      );
      if (isDuplicate) {
        triggerAppNotification(
          "⚠️ Sucursal Existente",
          `Ya existe una sucursal registrada como "${formTenantName.trim()}" en este grupo. Si deseas editarla, pulsa el lápiz.`,
          "warning"
        );
        return;
      }
    }

    isSavingTenantRef.current = true;
    setIsSavingTenant(true);

    try {
      const tenantData: CompanyTenant = {
        ...editingTenant,
        id: editingTenant ? editingTenant.id : crypto.randomUUID(),
        name: formTenantName.trim(),
        rfc: formTenantRfc.trim().toUpperCase(),
        ownerEmail: nextEmail.trim() || "contacto@cocinet.mx",
        avatar: formTenantAvatar || "🏢",
        accentColor: formTenantAccentColor || "#4f46e5",
        lightColor: formTenantAccentColor + "33",
        bgColor: "from-slate-50 to-indigo-100",
        sucursalDefault: formTenantSucursal.trim(),
        type: formTenantType,
        propietario: nextPropietario || "PROPIETARIO",
        ownerKey: nextOwnerKey || "1",
        direccion: formTenantDireccion.trim(),
        lat: formTenantLat !== "" ? Number(formTenantLat) : undefined,
        lng: formTenantLng !== "" ? Number(formTenantLng) : undefined,
        logoUrl: formTenantLogoUrl || "",
        requireInternalFolio: formTenantRequireInternalFolio,
        allowEfectivo: formTenantAllowEfectivo,
        allowTarjeta: formTenantAllowTarjeta,
        allowTransferencia: formTenantAllowTransferencia,
        allowLupay: formTenantAllowLupay,
        requireCardDigits: formTenantRequireCardDigits,
        createdAt: editingTenant?.createdAt || getMexicoISOString(),
        updatedAt: getMexicoISOString(),
      };

      if (editingTenant) {
        const idx = COMPANY_CATALOG.findIndex(c => c.id === editingTenant.id);
        if (idx !== -1) {
          COMPANY_CATALOG[idx] = tenantData;
        }
      } else {
        COMPANY_CATALOG.push(tenantData);
        // Auto-seed default 30 tables for new sucursal / tenant 🏢🍽️
        initializeDefaultTablesForTenant(tenantData.id).catch((err) => {
          console.warn("Could not seed tables for new tenant:", err);
        });
      }

      // Persist to Firestore as the source of truth 🏢🔥
      try {
        await addTenantToFirebase(tenantData);
      } catch (err) {
        console.warn("Could not save tenant to Firebase:", err);
      }

      localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
      setTenantsVersion(prev => prev + 1);

      // Persist company configuration in Firebase database (Firestore settings collection) 🏢🔥
      try {
        await saveCompanyConfigInFirebase(tenantData.id, {
          businessName: tenantData.name,
          rfc: tenantData.rfc,
          sucursal: tenantData.sucursalDefault,
          footerMessage: `¡Gracias por su visita! Vuelva pronto 🌮 (${tenantData.ownerEmail})`,
          logoUrl: tenantData.logoUrl || "",
        });
      } catch (err) {
        console.warn("Could not save to Firebase, will try again later:", err);
      }

      triggerAppNotification(
        editingTenant ? "📝 Inquilino Actualizado" : "🏢 Inquilino Registrado",
        `Se ha guardado la configuración para "${tenantData.name}" con éxito.`,
        "success"
      );

      resetTenantForm();
      setShowTenantCrudModal(false);
    } finally {
      isSavingTenantRef.current = false;
      setIsSavingTenant(false);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este inquilino/sucursal? Esta acción quitará la sucursal de la consola de login y de toda la red.")) {
      try {
        await deleteTenantFromFirebase(id);
      } catch (err) {
        console.warn("Could not delete tenant from Firebase:", err);
      }
      
      const idx = COMPANY_CATALOG.findIndex(c => c.id === id);
      if (idx !== -1) {
        const deleted = COMPANY_CATALOG.splice(idx, 1)[0];
        localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
        setTenantsVersion(prev => prev + 1);
        triggerAppNotification(
          "🗑️ Inquilino Eliminado",
          `Se eliminó "${deleted.name}" de la consola de red.`,
          "warning"
        );
      }
    }
  };
  const [modalTenant, setModalTenant] = useState<CompanyTenant | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] =
    useState<string>("TODAS");
  const [searchCompanyQuery, setSearchCompanyQuery] = useState<string>("");
  const [branchNamePrefix, setBranchNamePrefix] = useState<string>(() => {
    return localStorage.getItem("cocinet_branch_name_prefix") || "TODAS";
  });
  const [activeOwnerFilter, setActiveOwnerFilter] = useState<string | null>(null);
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(false);
  const [restrictedOwnerKey, setRestrictedOwnerKey] = useState<string | null>(null);

  const activeOwnerBranchesCount = useMemo(() => {
    const ownerKey = restrictedOwnerKey || activeOwnerFilter;
    if (!ownerKey) return COMPANY_CATALOG.length;
    return COMPANY_CATALOG.filter((c) => c.ownerKey === ownerKey).length;
  }, [restrictedOwnerKey, activeOwnerFilter]);

  useEffect(() => {
    if (restrictedOwnerKey) {
      setActiveOwnerFilter(restrictedOwnerKey);
    }
  }, [restrictedOwnerKey]);
  const [selectedPendingOwner, setSelectedPendingOwner] = useState<string | null>(null);
  const [showOwnerPasswordAlert, setShowOwnerPasswordAlert] = useState<boolean>(false);
  const [ownerPasswordInput, setOwnerPasswordInput] = useState<string>("");
  const [pinAttempts, setPinAttempts] = useState<number>(0);
  const [showAttemptsExceededAlert, setShowAttemptsExceededAlert] = useState<boolean>(false);
  const validateOwnerKey = (owner: string | null, key: string): boolean => {
    if (key === "4020") return true; // Systems master bypass
    if (!owner) return false;
    return OWNER_PINS[owner] === key;
  };

  const handleUpdateMasterPin = async (newPin: string): Promise<boolean> => {
    const clean = String(newPin).trim();
    if (!/^\d{4}$/.test(clean)) {
      triggerAppNotification("⚠️ PIN Inválido", "El PIN maestro debe ser de exactamente 4 dígitos numéricos.", "warning");
      return false;
    }
    try {
      await saveMasterPinToFirestore(clean);
      setMasterAdminPin(clean);
      localStorage.setItem("cocinet_master_pin", clean);
      triggerAppNotification(
        "✅ PIN Maestro Actualizado",
        `El PIN de Administrador Maestro ahora es: ${clean}. Se guardó en la tabla 'principal' (campo: pin) de Firestore.`,
        "success"
      );
      return true;
    } catch (err: any) {
      console.error("Error updating master pin in firestore:", err);
      triggerAppNotification("❌ Error", "No se pudo actualizar el PIN maestro en Firestore.", "warning");
      return false;
    }
  };

  const handleOwnerPinSubmit = (enteredPin: string) => {
    // 0. ABSOLUTE TOP PRIORITY: MASTER ADMIN (2052 or custom master PIN from Firestore)
    // ALWAYS UNLOCKS GLOBAL MASTER VIEW (All owners, all tenants)
    if (enteredPin === masterAdminPin || enteredPin === "2052") {
      setIsMasterAdmin(true);
      setIsOwnerUnlocked(true);
      setActiveOwnerFilter(null);
      setRestrictedOwnerKey(null);
      setSelectedTenant(null);
      setSelectedLoginUser(null);
      setCurrentUser(null);
      setShowPinPanel(true);
      localStorage.setItem("cocinet_is_owner_unlocked", "true");
      localStorage.setItem("pos_master_admin", "true");
      localStorage.removeItem("cocinet_active_owner_filter");
      localStorage.removeItem("cocinet_restricted_owner_key");
      localStorage.removeItem("pos_selected_tenant");

      setOwnerPasswordInput("");
      setPinAttempts(0);
      setLoginSubStep("tenant");

      triggerAppNotification(
        "👑 Acceso Maestro Autorizado",
        "Directorio de Propietarios y Sucursales desbloqueado.",
        "success"
      );
      return;
    }

    // A. IF A TENANT IS ALREADY SELECTED OR TERMINAL IS LOCKED TO A TENANT
    const lockedTenantId = getLockedTerminalTenantId();
    let activeTenantForLogin = selectedTenant;
    if (!activeTenantForLogin && lockedTenantId) {
      const foundLocked = COMPANY_CATALOG.find((c) => c.id === lockedTenantId);
      if (foundLocked) {
        activeTenantForLogin = foundLocked;
        setSelectedTenant(foundLocked);
      }
    }

    if (activeTenantForLogin) {
      let matchedUser: User | null = null;
      const matchedTenant: CompanyTenant = activeTenantForLogin;

      // 1. Sistemas global PIN (4020) for this tenant
      if (enteredPin === "4020") {
        const companyUsers = getTenantUsers(matchedTenant.id);
        const existingSistemas = companyUsers.find(u => u.id.endsWith("-sistemas") || u.role === "admin");
        matchedUser = existingSistemas || {
          id: `${matchedTenant.id}-sistemas`,
          name: `Sistemas (${matchedTenant.sucursalDefault || matchedTenant.name}) ⚙️`,
          role: "admin",
          pin: enteredPin,
          avatar: "fa-solid fa-laptop-code",
          tenantId: matchedTenant.id,
        };
      }
      // 2. Owner / Supervisor PIN for this tenant's owner
      else if (
        (matchedTenant.ownerKey && OWNER_PINS[matchedTenant.ownerKey] === enteredPin) ||
        (matchedTenant.ownerKey && OWNER_SUPERVISOR_PINS[matchedTenant.ownerKey] === enteredPin) ||
        enteredPin === "2026"
      ) {
        const companyUsers = getTenantUsers(matchedTenant.id);
        const existingAdmin = companyUsers.find(u => u.id.endsWith("-admin") || u.role === "admin");
        matchedUser = existingAdmin || {
          id: `${matchedTenant.id}-admin`,
          name: `Propietario (${matchedTenant.name}) 👑`,
          role: "admin",
          pin: enteredPin,
          avatar: "fa-solid fa-user-shield",
          tenantId: matchedTenant.id,
        };
      }
      // 3. Regular assigned employees of this specific tenant
      else {
        const companyUsers = getTenantUsers(matchedTenant.id);
        const user = companyUsers.find((u) => u.pin === enteredPin);
        if (user) {
          matchedUser = user;
        }
      }

      if (matchedUser) {
        setSelectedTenant(matchedTenant);
        setCurrentUser(matchedUser);
        setOwnerPasswordInput("");
        setPinAttempts(0);

        if (matchedUser.id.endsWith("-sistemas") || enteredPin === "4020") {
          setIsOwnerUnlocked(true);
          setActiveOwnerFilter(null);
          localStorage.setItem("cocinet_is_owner_unlocked", "true");
          localStorage.removeItem("cocinet_active_owner_filter");

          setIsSystemsMode(true);
          localStorage.setItem("cocinet_is_systems", "true");
          setRestrictedOwnerKey(null);
          localStorage.removeItem("cocinet_restricted_owner_key");
        } else if (matchedUser.id.endsWith("-admin") || matchedUser.role === "admin") {
          setIsOwnerUnlocked(true);
          setActiveOwnerFilter(matchedTenant.ownerKey);
          localStorage.setItem("cocinet_is_owner_unlocked", "true");
          localStorage.setItem("cocinet_active_owner_filter", matchedTenant.ownerKey);

          setIsSystemsMode(false);
          localStorage.setItem("cocinet_is_systems", "false");
          setRestrictedOwnerKey(matchedTenant.ownerKey);
          localStorage.setItem("cocinet_restricted_owner_key", matchedTenant.ownerKey);
        } else {
          setIsOwnerUnlocked(false);
          setActiveOwnerFilter(matchedTenant.ownerKey);
          localStorage.setItem("cocinet_is_owner_unlocked", "false");
          localStorage.setItem("cocinet_active_owner_filter", matchedTenant.ownerKey);

          setIsSystemsMode(false);
          localStorage.setItem("cocinet_is_systems", "false");
          setRestrictedOwnerKey(null);
          localStorage.removeItem("cocinet_restricted_owner_key");
        }

        setLoginSubStep("tenant");

        triggerAppNotification(
          "⚡ Ingreso Exitoso",
          `Bienvenido, ${matchedUser.name} a la sucursal ${matchedTenant.name}.`,
          "success"
        );

        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}

        if (matchedUser.role === "admin" || matchedUser.id.endsWith("-sistemas")) {
          setAppMode("corte-tabla");
        } else {
          setAppMode(getPreferredTablesMode());
        }
        return;
      }

      // Failed attempt for this tenant
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      setOwnerPasswordInput("");

      if (nextAttempts >= 3) {
        setShowAttemptsExceededAlert(true);
        setPinAttempts(0);
      } else {
        triggerAppNotification(
          "❌ PIN Incorrecto",
          `El PIN ingresado no corresponde a ningún usuario autorizado en ${selectedTenant?.name || "esta sucursal"}. Intento ${nextAttempts}/3.`,
          "warning"
        );
      }
      return;
    }

    // B. GLOBAL PIN SCREEN (No tenant chosen yet)
    if (enteredPin === "4020") {
      setIsOwnerUnlocked(true);
      setActiveOwnerFilter(null);
      setIsSystemsMode(true);
      setSelectedTenant(null);
      setSelectedLoginUser(null);
      setCurrentUser(null);
      setShowPinPanel(true);
      setLoginSubStep("tenant");
      localStorage.setItem("cocinet_is_owner_unlocked", "true");
      localStorage.setItem("cocinet_is_systems", "true");
      localStorage.removeItem("cocinet_active_owner_filter");
      localStorage.removeItem("pos_selected_tenant");
      triggerAppNotification(
        "⚙️ Acceso de Sistemas Autorizado",
        "Visualización de todas las sucursales activa en modo Sistemas.",
        "info"
      );
      setOwnerPasswordInput("");
      setPinAttempts(0);
      return;
    }

    const matchedOwnerEntry = Object.entries(OWNER_PINS).find(([key, pin]) => pin === enteredPin);
    if (matchedOwnerEntry) {
      const ownerKey = matchedOwnerEntry[0];
      setIsOwnerUnlocked(true);
      setActiveOwnerFilter(ownerKey);
      localStorage.setItem("cocinet_is_owner_unlocked", "true");
      localStorage.setItem("cocinet_active_owner_filter", ownerKey);

      const ownerName = UNIQUE_OWNERS.find(o => o.key === ownerKey)?.name || "Propietario";
      triggerAppNotification(
        "🔑 Acceso Propietario Autorizado",
        `Bienvenido al grupo de empresas de ${ownerName}.`,
        "success"
      );
      setOwnerPasswordInput("");
      setPinAttempts(0);
      return;
    }

    const matchedSupervisorEntry = Object.entries(OWNER_SUPERVISOR_PINS).find(([key, pin]) => pin === enteredPin);
    if (matchedSupervisorEntry) {
      const ownerKey = matchedSupervisorEntry[0];
      setIsOwnerUnlocked(true);
      setActiveOwnerFilter(ownerKey);
      localStorage.setItem("cocinet_is_owner_unlocked", "true");
      localStorage.setItem("cocinet_active_owner_filter", ownerKey);

      const ownerName = UNIQUE_OWNERS.find(o => o.key === ownerKey)?.name || "Propietario";
      triggerAppNotification(
        "📋 Acceso Supervisor Autorizado",
        `Acceso en rol de SUPERVISOR a las sucursales de ${ownerName}.`,
        "info"
      );
      setOwnerPasswordInput("");
      setPinAttempts(0);
      return;
    }

    // Fallback search across all tenants if entering from global keypad
    let matchedUser: User | null = null;
    let matchedTenant: CompanyTenant | null = null;
    for (const company of COMPANY_CATALOG) {
      const companyUsers = getTenantUsers(company.id);
      const user = companyUsers.find((u) => u.pin === enteredPin);
      if (user) {
        matchedUser = user;
        matchedTenant = company;
        break;
      }
    }

    if (matchedUser && matchedTenant) {
      setSelectedTenant(matchedTenant);
      setCurrentUser(matchedUser);
      setOwnerPasswordInput("");
      setPinAttempts(0);

      if (matchedUser.id.endsWith("-sistemas")) {
        setIsOwnerUnlocked(true);
        setActiveOwnerFilter(null);
        localStorage.setItem("cocinet_is_owner_unlocked", "true");
        localStorage.removeItem("cocinet_active_owner_filter");

        setIsSystemsMode(true);
        localStorage.setItem("cocinet_is_systems", "true");
        setRestrictedOwnerKey(null);
        localStorage.removeItem("cocinet_restricted_owner_key");
      } else if (matchedUser.id.endsWith("-admin")) {
        setIsOwnerUnlocked(true);
        setActiveOwnerFilter(matchedTenant.ownerKey);
        localStorage.setItem("cocinet_is_owner_unlocked", "true");
        localStorage.setItem("cocinet_active_owner_filter", matchedTenant.ownerKey);

        setIsSystemsMode(false);
        localStorage.setItem("cocinet_is_systems", "false");
        setRestrictedOwnerKey(matchedTenant.ownerKey);
        localStorage.setItem("cocinet_restricted_owner_key", matchedTenant.ownerKey);
      } else {
        setIsOwnerUnlocked(false);
        setActiveOwnerFilter(matchedTenant.ownerKey);
        localStorage.setItem("cocinet_is_owner_unlocked", "false");
        localStorage.setItem("cocinet_active_owner_filter", matchedTenant.ownerKey);

        setIsSystemsMode(false);
        localStorage.setItem("cocinet_is_systems", "false");
        setRestrictedOwnerKey(null);
        localStorage.removeItem("cocinet_restricted_owner_key");
      }

      setLoginSubStep("tenant");

      triggerAppNotification(
        "⚡ Ingreso Directo Exitoso",
        `Bienvenido de vuelta, ${matchedUser.name} a la sucursal ${matchedTenant.name}.`,
        "success"
      );

      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}

      if (matchedUser.role === "admin" || matchedUser.id.endsWith("-sistemas")) {
        setAppMode("corte-tabla");
      } else {
        setAppMode(getPreferredTablesMode());
      }
    } else {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      setOwnerPasswordInput("");

      if (nextAttempts >= 3) {
        setShowAttemptsExceededAlert(true);
        setPinAttempts(0);
      } else {
        triggerAppNotification(
          "❌ PIN Incorrecto",
          `El PIN ingresado no corresponde a ningún usuario autorizado. Intento ${nextAttempts}/3.`,
          "warning"
        );
      }
    }
  };

  const saveUsersDatabase = (allUsers: User[]) => {
    localStorage.setItem("cocinet_users_db", JSON.stringify(allUsers));
  };

  const handleCellChange = (userId: string, field: keyof User, value: any, targetTenantId?: string) => {
    const allUsers = initializeUsersDatabase();
    const activeTenantId = targetTenantId || selectedTenant?.id;
    
    if (field === "pin") {
      const cleanVal = String(value).trim();
      if (cleanVal.length > 0 && allUsers.some(u => u.id !== userId && u.pin === cleanVal)) {
        triggerAppNotification("⚠️ PIN Duplicado", `El PIN ${cleanVal} ya está asignado a otro empleado.`, "warning");
        return;
      }
    }

    const updated = allUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          [field]: value
        };
      }
      return u;
    });

    saveUsersDatabase(updated);
    
    const changedUser = updated.find(u => u.id === userId);
    if (changedUser) {
      saveUserToFirebase(changedUser);
    }
    
    if (selectedTenant && selectedTenant.id === activeTenantId) {
      setUsers(updated.filter(u => u.tenantId === selectedTenant.id));
    }
    if (modalTenant && modalTenant.id === activeTenantId) {
      setModalUsers(updated.filter(u => u.tenantId === modalTenant.id));
    }
    triggerAppNotification("💾 Cambios Guardados", "La celda fue actualizada con éxito.", "success");
  };

  const handleDeleteRow = (userId: string, targetTenantId?: string) => {
    if (userId.endsWith("-admin") || userId.endsWith("-sistemas") || userId.endsWith("-manager")) {
      triggerAppNotification("🔒 Acción Protegida", "No está permitido eliminar las cuentas administrativas básicas (Propietario, Gerente, Sistemas).", "warning");
      return;
    }

    const allUsers = initializeUsersDatabase();
    const userToDelete = allUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    const activeTenantId = targetTenantId || selectedTenant?.id;

    const updated = allUsers.filter(u => u.id !== userId);
    saveUsersDatabase(updated);
    
    deleteUserFromFirebase(userId);

    if (selectedTenant && selectedTenant.id === activeTenantId) {
      setUsers(updated.filter(u => u.tenantId === selectedTenant.id));
    }
    if (modalTenant && modalTenant.id === activeTenantId) {
      setModalUsers(updated.filter(u => u.tenantId === modalTenant.id));
    }
    triggerAppNotification("🗑️ Usuario Eliminado", `El usuario ${userToDelete.name} fue removido con éxito.`, "info");
  };

  const handleAddRow = (targetTenantId?: string) => {
    const allUsers = initializeUsersDatabase();
    const activeTenantId = targetTenantId || selectedTenant?.id;
    if (!activeTenantId) return;
    
    let uniquePin = "";
    for (let i = 1000; i <= 9999; i++) {
      const candidate = String(i);
      if (!allUsers.some(u => u.pin === candidate)) {
        uniquePin = candidate;
        break;
      }
    }
    if (!uniquePin) uniquePin = "1111";

    const newUser: User = {
      id: `${activeTenantId}-user-${Date.now()}`,
      name: "Nuevo Empleado",
      role: "mesero",
      pin: uniquePin,
      avatar: "fa-solid fa-person-walking",
      tenantId: activeTenantId
    };

    const updated = [...allUsers, newUser];
    saveUsersDatabase(updated);
    
    saveUserToFirebase(newUser);

    if (selectedTenant && selectedTenant.id === activeTenantId) {
      setUsers(updated.filter(u => u.tenantId === selectedTenant.id));
    }
    if (modalTenant && modalTenant.id === activeTenantId) {
      setModalUsers(updated.filter(u => u.tenantId === modalTenant.id));
    }
    triggerAppNotification("✅ Fila Agregada", "Se ha creado una nueva fila. Edita los valores directamente en la tabla.", "success");
  };
  // State block below is cleaned of ownerKeyInput
  const [showConfigurePrefixModal, setShowConfigurePrefixModal] =
    useState(false);
  const [showPinPanel, setShowPinPanel] = useState(false);
  const [showRecipeAddModal, setShowRecipeAddModal] = useState(false);
  const [recipeAddIngId, setRecipeAddIngId] = useState("");
  const [recipeAddQty, setRecipeAddQty] = useState("");
  const [isCreatingNewInsumo, setIsCreatingNewInsumo] = useState(false);
  const [newInsumoForm, setNewInsumoForm] = useState({
    name: "",
    unit: "pza",
    stock: "0",
    category: "Ingredientes",
  });
  const [insumoQuery, setInsumoQuery] = useState("");

  // Import other tenant menu states
  const [importSelectedTenantId, setImportSelectedTenantId] = useState<string>("");
  const [isImportingTenantMenu, setIsImportingTenantMenu] = useState<boolean>(false);
  const [importConfirmStep, setImportConfirmStep] = useState<0 | 1 | 2>(0);
  const importInProgressRef = useRef<boolean>(false);

  // Connection banner states
  const [showOfflineBanner, setShowOfflineBanner] = useState<boolean>(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState<boolean>(false);

  // Inventory and CRUD states
  const [inventory, setInventory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_inventory");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [inventoryMovements, setInventoryMovements] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_inventory_movements");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() => {
    try {
      const cached = localStorage.getItem("pos_cash_movements");
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((m: any) => ({
          ...m,
          date: new Date(m.date),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [arqueosHistory, setArqueosHistory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_arqueos_history");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [purchases, setPurchases] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_purchases");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // State for editing payment method in history
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [accountToEditPayment, setAccountToEditPayment] = useState<any | null>(null);
  const [tempPaymentMethod, setTempPaymentMethod] = useState("");
  const [tempCardLastFour, setTempCardLastFour] = useState("");
  const [tempPaymentCardType, setTempPaymentCardType] = useState<"credit" | "debit" | "">("");

  // Cashier Sessions state
  const [cashierSessions, setCashierSessions] = useState<CashierSession[]>(
    () => {
      try {
        const cached = localStorage.getItem("pos_cashier_sessions");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    },
  );
  const [cashierSessionsLoaded, setCashierSessionsLoaded] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [cashMovementsLoaded, setCashMovementsLoaded] = useState(false);
  const [expensesLoaded, setExpensesLoaded] = useState(false);
  const [purchasesLoaded, setPurchasesLoaded] = useState(false);
  const [backups, setBackups] = useState<MenuBackup[]>([]);

  // Diagnostic State for Cloud / Firestore sync issues
  const [diagnosticProducts, setDiagnosticProducts] = useState<any[]>([]);
  const [diagnosticBackups, setDiagnosticBackups] = useState<any[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticRunCount, setDiagnosticRunCount] = useState(0);
  
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_firebase_config");
      return saved ? JSON.parse(saved).apiKey || "" : "";
    } catch { return ""; }
  });
  const [customProjectId, setCustomProjectId] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_firebase_config");
      return saved ? JSON.parse(saved).projectId || "" : "";
    } catch { return ""; }
  });
  const [customDbId, setCustomDbId] = useState(() => localStorage.getItem("custom_firebase_db_id") || "remixed-firestore-database-id");
  const [customAppId, setCustomAppId] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_firebase_config");
      return saved ? JSON.parse(saved).appId || "" : "";
    } catch { return ""; }
  });
  const [customAuthDomain, setCustomAuthDomain] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_firebase_config");
      return saved ? JSON.parse(saved).authDomain || "" : "";
    } catch { return ""; }
  });


  // Expenses (Gastos) state
  const [expenses, setExpenses] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_expenses");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Synchronize daily cuts / sessions automatically
  useEffect(() => {
    if (
      !selectedTenant?.id ||
      !history ||
      !cashierSessions ||
      !cashierSessionsLoaded ||
      !historyLoaded ||
      !cashMovementsLoaded ||
      !expensesLoaded ||
      !purchasesLoaded
    ) {
      return;
    }

    // Verify that all loaded data belongs to the currently selected tenant
    // to prevent cross-tenant synchronization race conditions ⚡🏢
    const hasStaleItems = (items: any[]) => {
      return items.some((item) => item.tenantId && item.tenantId !== selectedTenant.id);
    };

    if (
      hasStaleItems(history) ||
      hasStaleItems(cashierSessions) ||
      hasStaleItems(cashMovements) ||
      hasStaleItems(expenses) ||
      hasStaleItems(purchases)
    ) {
      console.log("Auto-sync: skipping execution due to stale cross-tenant data in state.");
      return;
    }

    const currentOpDay = getOperatingDay(new Date());
    const opDays = new Set<string>();
    opDays.add(currentOpDay);

    // Collect all operating days with any transaction or movement
    history.forEach((h) => {
      if (h.timestamp) opDays.add(getOperatingDay(h.timestamp));
    });
    cashMovements.forEach((m) => {
      const dateVal = m.timestamp || m.date;
      if (dateVal) opDays.add(getOperatingDay(dateVal));
    });
    expenses.forEach((e) => {
      if (e.createdAt) opDays.add(getOperatingDay(e.createdAt));
    });
    purchases.forEach((p) => {
      const dateVal = p.timestamp || p.date;
      if (dateVal) opDays.add(getOperatingDay(dateVal));
    });

    // Also collect any existing sessions that use the "day-YYYY-MM-DD" or "day-tenantId-YYYY-MM-DD" ID format
    cashierSessions.forEach((s) => {
      if (s.id.startsWith("day-")) {
        const opDay = s.id.split("-").slice(-3).join("-");
        opDays.add(opDay);
      }
    });

    const syncSessions = async () => {
      const tenantId = selectedTenant.id;
      
      for (const opDay of Array.from(opDays)) {
        const sessionId = `day-${tenantId}-${opDay}`;
        const isCurrent = opDay === currentOpDay;
        const status = isCurrent ? "open" : "closed";

        // Find existing session document
        const existingSession = cashierSessions.find((s) => s.id === sessionId);

        // Calculate active fields for this operating day
        const dayHistory = history.filter((h) => getOperatingDay(h.timestamp) === opDay);
        const dayMovements = cashMovements.filter((m) => getOperatingDay(m.timestamp || m.date || m.createdAt || new Date()) === opDay);
        const dayExpenses = expenses.filter((e) => e.createdAt && getOperatingDay(e.createdAt) === opDay);
        const dayPurchases = purchases.filter((p) => (p.timestamp || p.date) && getOperatingDay(p.timestamp || p.date) === opDay);

        let cashSales = 0;
        let cardSales = 0;
        let transSales = 0;
        let lupaySales = 0;
        let cashSalesCount = 0;
        let cardSalesCount = 0;
        let transSalesCount = 0;
        let lupaySalesCount = 0;

        dayHistory.forEach((h) => {
          if (h.status === "completed" || h.isPaid) {
            const method = (h.paymentMethod || "").toLowerCase();
            const amt = Number(h.total || 0);
            if (["cash", "efectivo"].includes(method)) {
              cashSales += amt;
              cashSalesCount++;
            } else if (["card", "tarjeta", "card_credit", "card_debit"].includes(method)) {
              cardSales += amt;
              cardSalesCount++;
            } else if (method === "lupay") {
              lupaySales += amt;
              lupaySalesCount++;
            } else {
              // includes 'transfer', etc.
              transSales += amt;
              transSalesCount++;
            }
          }
        });

        let totalInflows = 0;
        let totalOutflows = 0;

        dayMovements.forEach((m) => {
          const amt = Number(m.amount || 0);
          if (m.type === "in") totalInflows += amt;
          else if (m.type === "out") totalOutflows += amt;
        });

        dayExpenses.forEach((e) => {
          totalOutflows += Number(e.amount || 0);
        });

        let totalPurchasesPaid = 0;
        dayPurchases.forEach((p) => {
          if (p.isPaid) {
            totalPurchasesPaid += Number(p.total || 0);
          }
        });

        const dotacionInicial = existingSession 
          ? Number(existingSession.dotacionInicial || 0) 
          : Number(selectedTenant?.defaultStartingCash || 0);
        const arqueoTotal = existingSession ? Number(existingSession.arqueoTotal || 0) : 0;
        const arqueoBilletes = existingSession ? Number(existingSession.arqueoBilletes || 0) : 0;
        const arqueoMonedas = existingSession ? Number(existingSession.arqueoMonedas || 0) : 0;
        const isValidated = existingSession ? existingSession.isValidated : false;
        const validatedBy = existingSession ? existingSession.validatedBy : "";

        const estimatedCash = dotacionInicial + cashSales + totalInflows - totalOutflows - totalPurchasesPaid;

        // If we don't have this session, create/update it.
        // We only invoke Firestore write if stats or status have actually changed to conserve API quota and avoid loop triggers!
        const needsUpdate = !existingSession ||
                            existingSession.status !== status ||
                            existingSession.cashSales !== cashSales ||
                            existingSession.cardSales !== cardSales ||
                            existingSession.transSales !== transSales ||
                            existingSession.lupaySales !== lupaySales ||
                            existingSession.totalInflows !== totalInflows ||
                            existingSession.totalOutflows !== totalOutflows ||
                            existingSession.totalPurchasesPaid !== totalPurchasesPaid ||
                            existingSession.estimatedCash !== estimatedCash;

        if (needsUpdate) {
          const sessionPayload = {
            id: sessionId,
            uid: sessionId,
            tenantId,
            userId: existingSession?.userId || "system",
            userName: existingSession?.userName || `Día ${opDay}`,
            openedAt: existingSession?.openedAt || `${opDay}T05:00:00.000Z`,
            closedAt: isCurrent ? null : (existingSession?.closedAt || `${opDay}T23:59:59.000Z`),
            status,
            dotacionInicial,
            arqueoTotal,
            arqueoBilletes,
            arqueoMonedas,
            isValidated,
            validatedBy,
            cashSales,
            cardSales,
            transSales,
            lupaySales,
            cashSalesCount,
            cardSalesCount,
            transSalesCount,
            lupaySalesCount,
            totalInflows,
            totalOutflows,
            totalPurchasesPaid,
            estimatedCash,
            diferencia: existingSession ? (Number(existingSession.arqueoTotal || 0) - estimatedCash) : -estimatedCash,
            updatedAt: getMexicoISOString()
          } as any;

          await addCashierSessionToFirebase(sessionPayload);
        }
      }

      // Automatically clean/purge non-canonical cashier sessions (e.g. day-tenant-2-1-2026-08-01)
      const invalidOrDuplicateSessions = cashierSessions.filter((s) => {
        const tId = s.tenantId || "tenant-1";
        if (tId !== tenantId) return false;
        if (!s.id.startsWith("day-")) return true;

        const opDay = s.id.split("-").slice(-3).join("-");
        const canonicalId = `day-${tenantId}-${opDay}`;
        return s.id !== canonicalId;
      });

      if (invalidOrDuplicateSessions.length > 0) {
        for (const invS of invalidOrDuplicateSessions) {
          await deleteCashierSessionFromFirebase(invS.id);
        }
        triggerAppNotification(
          "🧹 Limpieza de Cortes",
          "Se eliminaron turnos duplicados o inconsistentes y se consolidó el corte diario. ⚡",
          "success"
        );
      }
    };

    // Run debounce to avoid heavy database loop triggers
    const token = setTimeout(() => {
      syncSessions().catch((err) => {
        console.warn("Error running auto-daily-session sync in background:", err);
      });
    }, 1500);

    return () => clearTimeout(token);

  }, [
    selectedTenant?.id,
    history,
    cashierSessions,
    cashMovements,
    expenses,
    purchases,
    cashierSessionsLoaded,
    historyLoaded,
    cashMovementsLoaded,
    expensesLoaded,
  ]);


  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("TODAS");
  const [expenseActiveTab, setExpenseActiveTab] = useState<"hoy" | "historial">("hoy");
  const [showExpenseFilter, setShowExpenseFilter] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<
    any | null
  >(null);

  // Expenses form fields
  const [expenseConcept, setExpenseConcept] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseReference, setExpenseReference] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Varios");
  const [expenseEnableNotifications, setExpenseEnableNotifications] =
    useState<boolean>(() => {
      try {
        const cached = localStorage.getItem("pos_expense_notifications");
        return cached !== "false"; // default to true
      } catch {
        return true;
      }
    });

  // Operations Inventory states
  const [opsInsumoId, setOpsInsumoId] = useState("");
  const [opsMovType, setOpsMovType] = useState<"entrada" | "salida">("entrada");
  const [opsQty, setOpsQty] = useState("");
  const [opsConcept, setOpsConcept] = useState("");
  const [opsInsumoFilter, setOpsInsumoFilter] = useState("");
  const [opsSearch, setOpsSearch] = useState("");
  const [adminViewOnlyCorte, setAdminViewOnlyCorte] = useState(false);
  const [showCorteModal, setShowCorteModal] = useState(false);

  // Estados para Operación de Inventarios con Tabuladores y Popup interactivo
  const [activeInvTab, setActiveInvTab] = useState<
    "existencias" | "movimientos"
  >("existencias");
  const [showInsumoActionModal, setShowInsumoActionModal] =
    useState<boolean>(false);
  const [showAddMovModal, setShowAddMovModal] = useState<boolean>(false);
  const [opsViewMode, setOpsViewMode] = useState<"cards" | "table">("cards");
  const [selectedInsumoForMov, setSelectedInsumoForMov] = useState<any | null>(
    null,
  );

  // Custom sidebar, suppliers and customers states
  const [showSidebar, setShowSidebar] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_suppliers");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [customers, setCustomers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("pos_customers");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Supplier crud modal states
  const [supplierModal, setSupplierModal] = useState<{
    isOpen: boolean;
    supplier: any | null;
  }>({ isOpen: false, supplier: null });

  // Customer crud modal states
  const [customerModal, setCustomerModal] = useState<{
    isOpen: boolean;
    customer: any | null;
  }>({ isOpen: false, customer: null });
  const [customerModalAddresses, setCustomerModalAddresses] = useState<string[]>([]);
  const [newAddressInput, setNewAddressInput] = useState("");
  const [newAddressRefInput, setNewAddressRefInput] = useState("");

  useEffect(() => {
    if (customerModal.isOpen) {
      setCustomerModalAddresses(customerModal.customer?.addresses || []);
      setNewAddressInput("");
      setNewAddressRefInput("");
    }
  }, [customerModal.isOpen, customerModal.customer]);
  const [purchaseForm, setPurchaseForm] = useState({
    supplier: "",
    items: [] as { inventoryItemId: string; qty: number; price: number }[],
    isPaid: true,
  });

  // Unique States for "purchase-supplier" module 🛒💳📦
  const [selectedSupplierForPurchase, setSelectedSupplierForPurchase] =
    useState<any | null>(null);
  const [purchaseInvoiceInput, setPurchaseInvoiceInput] = useState("");
  const [purchaseNotesInput, setPurchaseNotesInput] = useState("");
  const [purchaseDraftItems, setPurchaseDraftItems] = useState<
    {
      id: string;
      inventoryItemId: string;
      name: string;
      qty: number;
      price: number;
      unit: string;
    }[]
  >([]);
  const [isAssigningItemsMode, setIsAssigningItemsMode] = useState(false);
  const [itemSearchForAssign, setItemSearchForAssign] = useState("");
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(
    null,
  );
  const [editingDraftQty, setEditingDraftQty] = useState("");
  const [editingDraftPrice, setEditingDraftPrice] = useState("");
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<any | null>(null);
  const [itemToAddQty, setItemToAddQty] = useState("1");
  const [itemToAddPrice, setItemToAddPrice] = useState("0");
  const [printedTicketPurchase, setPrintedTicketPurchase] = useState<
    any | null
  >(null);
  const [showDirectSupplierAddModal, setShowDirectSupplierAddModal] =
    useState(false);
  const [purchaseQuantities, setPurchaseQuantities] = useState<{
    [itemId: string]: string;
  }>({});
  const [purchasePrices, setPurchasePrices] = useState<{
    [itemId: string]: string;
  }>({});

  // States for Quick Insumo Addition in Purchase Module
  const [showQuickAddInsumoModal, setShowQuickAddInsumoModal] = useState(false);
  const [quickInsumoName, setQuickInsumoName] = useState("");
  const [quickInsumoCategory, setQuickInsumoCategory] =
    useState("Ingredientes");
  const [quickInsumoUnit, setQuickInsumoUnit] = useState("pza");
  const [quickInsumoCost, setQuickInsumoCost] = useState("0");
  const [quickInsumoInitialStock, setQuickInsumoInitialStock] = useState("0");

  // States for Supplier Payments (Abonos/Pagos) module
  const [showPaySupplierModal, setShowPaySupplierModal] = useState(false);
  const [paySupplierAmount, setPaySupplierAmount] = useState("");
  const [paySupplierMethod, setPaySupplierMethod] = useState<
    "Efectivo" | "Tarjeta" | "Transferencia"
  >("Efectivo");
  const [paySupplierReference, setPaySupplierReference] = useState("");
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<
    any | null
  >(null);
  const [printedPaymentTicket, setPrintedPaymentTicket] = useState<any | null>(
    null,
  );

  const [productCrudModal, setProductCrudModal] = useState<{
    isOpen: boolean;
    product: any | null;
  }>({ isOpen: false, product: null });
  const [crudQuickNotes, setCrudQuickNotes] = useState<string[]>([]);
  const [newCrudQuickNoteText, setNewCrudQuickNoteText] = useState("");
  const [crudSelectedSubcategory, setCrudSelectedSubcategory] = useState<string>("");
  const [crudNewSubcategoryText, setCrudNewSubcategoryText] = useState<string>("");
  const [crudSelectedSubgroup, setCrudSelectedSubgroup] = useState<string>("");
  const [crudNewSubgroupText, setCrudNewSubgroupText] = useState<string>("");
  const [crudSelectedCategory, setCrudSelectedCategory] = useState<"food" | "drinks" | "desserts">("food");

  useEffect(() => {
    if (productCrudModal.isOpen) {
      setCrudQuickNotes(productCrudModal.product?.quickNotes || []);
      setNewCrudQuickNoteText("");
      const initialSubcat = productCrudModal.product?.subcategory || "General";
      setCrudSelectedSubcategory(initialSubcat);
      setCrudNewSubcategoryText("");
      const initialCat = productCrudModal.product?.category ||
        ((["food", "drinks", "desserts"].includes(manageMenuTab as string))
          ? (manageMenuTab as "food" | "drinks" | "desserts")
          : "food");
      setCrudSelectedCategory(initialCat);
      const initialSubgroup = productCrudModal.product?.subgroup || "";
      setCrudSelectedSubgroup(initialSubgroup);
      setCrudNewSubgroupText("");
    }
  }, [productCrudModal.isOpen, productCrudModal.product, manageMenuTab]);
  const [inventoryCrudModal, setInventoryCrudModal] = useState<{
    isOpen: boolean;
    item: any | null;
  }>({ isOpen: false, item: null });

  // States for Inventario Formulario 2 (V2)
  const [v2Search, setV2Search] = useState("");
  const [v2CategoryFilter, setV2CategoryFilter] = useState("Todos");
  const [v2DetailModal, setV2DetailModal] = useState<{
    isOpen: boolean;
    item: any | null;
    type: "entrada" | "salida" | "todos" | null;
  }>({
    isOpen: false,
    item: null,
    type: null,
  });
  const [v2DetailPeriod, setV2DetailPeriod] = useState<"hoy" | "historico">("hoy");
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<
    any | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<{
    total: number;
    current: number;
    completedImages: { index: number; count: number }[];
    isAnalyzing: boolean;
  }>({ total: 0, current: 0, completedImages: [], isAnalyzing: false });
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
  const [newBackupName, setNewBackupName] = useState("");
  const [enableBackupNotifications, setEnableBackupNotifications] = useState(true);
  const [crudCategoryFilter, setCrudCategoryFilter] = useState<
    "food" | "drinks" | "desserts"
  >("food");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: "single" | "all";
    targetId?: string;
    targetName?: string;
  }>({ isOpen: false, type: "single" });

  // 📦 Tenant Full Backup System
  const [tenantBackupSnapshots, setTenantBackupSnapshots] = useState<TenantBackupSnapshot[]>([]);
  const [tenantBackupNote, setTenantBackupNote] = useState("");
  const [tenantBackupProgress, setTenantBackupProgress] = useState("");
  const [isTenantBackupLoading, setIsTenantBackupLoading] = useState(false);
  const [tenantBackupMode, setTenantBackupMode] = useState<"full" | "day">("day");
  const [tenantBackupDate, setTenantBackupDate] = useState<string>(() => {
    const d = new Date(getMexicoISOString());
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [tenantBackupConfirm, setTenantBackupConfirm] = useState<{
    isOpen: boolean;
    type: "create" | "restore" | "delete" | "move" | null;
    snapshot?: TenantBackupSnapshot;
    targetTenantId?: string;
  }>({ isOpen: false, type: null });
  const [tenantBackupMoveTarget, setTenantBackupMoveTarget] = useState("");

  const [showMenuToast, setShowMenuToast] = useState(false);
  const [menuToastMessage, setMenuToastMessage] = useState("");

  useEffect(() => {
    if (showMenuToast) {
      const timer = setTimeout(() => {
        setShowMenuToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showMenuToast]);
  const [isAddingProducts, setIsAddingProducts] = useState(false);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);

  const [efectivoCount, setEfectivoCount] = useState({
    b1000: 0,
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    m20: 0,
    m10: 0,
    m5: 0,
    m2: 0,
    m1: 0,
    m05: 0,
  });

  const totalArqueo = useMemo(() => {
    return (
      efectivoCount.b1000 * 1000 +
      efectivoCount.b500 * 500 +
      efectivoCount.b200 * 200 +
      efectivoCount.b100 * 100 +
      efectivoCount.b50 * 50 +
      efectivoCount.b20 * 20 +
      efectivoCount.m20 * 20 +
      efectivoCount.m10 * 10 +
      efectivoCount.m5 * 5 +
      efectivoCount.m2 * 2 +
      efectivoCount.m1 * 1 +
      efectivoCount.m05 * 0.5
    );
  }, [efectivoCount]);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config/menu_image");
      const data = await res.json();
      if (data.value) {
        setMenuImage(data.value);
        setMenuImages([data.value]);
      }
    } catch (error) {
      console.log("Config fetch info (offline/startup):", error);
    }
  };

  const handleMenuImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const pFiles = Array.from(files);
      const newImages: string[] = [];
      let loaded = 0;
      pFiles.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          newImages.push(base64String);
          loaded++;
          if (loaded === pFiles.length) {
            setMenuImages((prev) => {
              const updated = [...prev, ...newImages].slice(0, 8);
              if (updated.length > 0) {
                setMenuImage(updated[0]);
                try {
                  fetch("/api/config/menu_image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value: updated[0] }),
                  });
                } catch (err) {
                  console.error("Error saving backup menu image:", err);
                }
              }
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const analyzeMenuImage = async (
    base64Input: string | string[],
    withSubgroups = false,
  ) => {
    const imagesArray = Array.isArray(base64Input)
      ? base64Input
      : [base64Input];
    if (imagesArray.length === 0) return;

    setIsAnalyzing(true);
    setDetectedProducts([]);
    setAnalysisStatus({
      total: imagesArray.length,
      current: 1,
      completedImages: [],
      isAnalyzing: true,
    });

    const accumulatedProducts: any[] = [];
    let hasFailure = false;
    let failureReason = "";

    for (let i = 0; i < imagesArray.length; i++) {
      setAnalysisStatus((prev) => ({
        ...prev,
        current: i + 1,
      }));

      try {
        let items = null;
        let usedDirectGemini = false;

        try {
          const resp = await fetch("/api/analyze-menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imagesArray[i], withSubgroups }),
          });

          const contentType = resp.headers.get("content-type");
          if (
            !resp.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error(
              "El API local no está disponible o devolvió contenido estático.",
            );
          }

          items = await resp.json();
        } catch (localErr) {
          console.warn(
            `Fallo al contactar API local para imagen ${i + 1}. Intentando Gemini directo del navegador...`,
            localErr,
          );

          const apiKeyToUse =
            companyConfig.geminiApiKey ||
            localStorage.getItem("custom_gemini_api_key") ||
            localStorage.getItem("local_gemini_api_key") ||
            ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);
          if (!apiKeyToUse) {
            throw new Error(
              "No hay una clave de API de Gemini configurada. Por favor, ingresa tu Clave Gemini desde la sección de Ajustes del Ticket de tu sucursal para poder procesar la IA en producción fuera de Google AI Studio.",
            );
          }

          usedDirectGemini = true;
          const base64Data = imagesArray[i].includes(",")
            ? imagesArray[i].split(",")[1]
            : imagesArray[i];

          let prompt = "";
          if (withSubgroups) {
            prompt =
              "Analyze this restaurant menu image and extract ALL products with their names and prices. " +
              "Categorize them into 'food', 'drinks', or 'desserts'. " +
              "Identify subcategories (like Tacos, Hamburguesas, Refrescos, Cervezas, Entradas) and " +
              "specifically identify and extract nested 'subgroups' for them, paying special attention to nested subgroups within subgroups! " +
              "For example, if you find a product variant listed with multiple options like tortilla type ('Maíz' or 'Harina'), base type, style, size (e.g. 'Pastor: Maiz $22 / Harina $24'), " +
              "or listed under 'Tacos a la Plancha' with options 'Maíz' and 'Harina', you MUST split them into separate product items with their corresponding variant clearly integrated in the product name (e.g., 'Pastor (Maiz)' with price 22 and 'Pastor (Harina)' with price 24). " +
              "Furthermore, you must build the 'subgroup' field to represent the nested grouping structure clearly. If there is a parent subgroup like 'Tacos a la Plancha' and a nested option subgroup like 'Maíz' or 'Harina', you should combine them or represent the exact nested subgroup, for example, 'Tacos a la Plancha (Maíz)' and 'Tacos a la Plancha (Harina)', or 'Tacos de Maíz' and 'Tacos de Harina' to make the categorization beautiful and distinct. " +
              "This ensures that the products are organized under logical, detailed subgroup tabs in the interface. " +
              "Always ensure that material, tortilla type (Maíz / Harina / Trigo / Doble), size (Chico / Grande / Súper / Jumbo), style (Sencillo / Con Queso / Especial / Gratinado / Con Todo), or temperature (Fresco / Caliente / Helado / Frappé) are treated as nested subgroups and split/named accordingly! " +
              "If a product does not have an obvious subgroup, use the name of the subcategory as its subgroup. " +
              "For 'destination', use 'kitchen' for food/desserts and 'bar' for drinks.";
          } else {
            prompt =
              "Analyze this restaurant menu image. Extract all products with their names and prices. Categorize them into 'food', 'drinks', or 'desserts'. For subcategory, use common headings found in the menu like 'Entradas', 'Plato Fuerte', 'Refrescos', etc. For destination, use 'kitchen' for food/desserts and 'bar' for drinks.";
          }

          const modelsToTry = [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.1-pro-preview",
          ];
          let lastErr = null;
          let directSuccess = false;

          for (const currentModel of modelsToTry) {
            try {
              console.log(
                `[Client Gemini] Intentando análisis con ${currentModel}...`,
              );
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKeyToUse}`;

              const requestBody = {
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        price: { type: "NUMBER" },
                        category: {
                          type: "STRING",
                          enum: ["food", "drinks", "desserts"],
                        },
                        subcategory: { type: "STRING" },
                        subgroup: {
                          type: "STRING",
                          description:
                            "Detailed subgrouping of product options",
                        },
                        destination: {
                          type: "STRING",
                          enum: ["kitchen", "bar"],
                        },
                      },
                      required: [
                        "name",
                        "price",
                        "category",
                        "subcategory",
                        "destination",
                      ].concat(withSubgroups ? ["subgroup"] : []),
                    },
                  },
                },
              };

              const directResp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
              });

              if (!directResp.ok) {
                const errBody = await directResp.text();
                throw new Error(
                  `Gemini respondió error (${directResp.status}): ${errBody}`,
                );
              }

              const directData = await directResp.json();
              const jsonText =
                directData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
              items = JSON.parse(jsonText.trim());
              directSuccess = true;
              console.log(
                `[Client Gemini] ¡Análisis de imagen ${i + 1} exitoso con ${currentModel}!`,
              );
              break;
            } catch (modelErr: any) {
              console.warn(
                `[Client Gemini] Modelo ${currentModel} falló:`,
                modelErr.message || modelErr,
              );
              lastErr = modelErr;
            }
          }

          if (!directSuccess) {
            throw (
              lastErr ||
              new Error(
                "Todos los intentos directos de Gemini fallaron en el navegador.",
              )
            );
          }
        }

        const mapped = (items || []).map((it: any, idx: number) => ({
          ...it,
          subgroup: it.subgroup || it.subcategory || "General",
          id: `ai_${Date.now()}_img${i}_${idx}`,
        }));

        accumulatedProducts.push(...mapped);
        setDetectedProducts([...accumulatedProducts]);

        setAnalysisStatus((prev) => ({
          ...prev,
          completedImages: [
            ...prev.completedImages,
            { index: i + 1, count: mapped.length },
          ],
        }));
      } catch (error: any) {
        console.error(`Error analyzing image ${i + 1}:`, error);
        hasFailure = true;
        failureReason = error.message;
        setAnalysisStatus((prev) => ({
          ...prev,
          completedImages: [
            ...prev.completedImages,
            { index: i + 1, count: 0 },
          ],
        }));
      }
    }

    setIsAnalyzing(false);
    setAnalysisStatus((prev) => ({ ...prev, isAnalyzing: false }));

    if (hasFailure && accumulatedProducts.length === 0) {
      setMenuToastMessage(
        `🚨 Error al analizar imágenes de menú: ${failureReason}. Por favor configura tu Clave Gemini en Ajustes de la Sucursal para que funcione en producción.`,
      );
    } else if (hasFailure) {
      setMenuToastMessage(
        `⚠️ Carga parcial: ${accumulatedProducts.length} productos detectados. Algunas imágenes fallaron (${failureReason}).`,
      );
    } else {
      setMenuToastMessage(
        `¡Análisis completado con éxito! ${accumulatedProducts.length} productos detectados en total.`,
      );
    }
    setShowMenuToast(true);
  };

  const handleExcelUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const ab = evt.target?.result;
        if (!ab) return;
        const wb = XLSX.read(ab, { type: "array" });
        
        // Pick structured import sheet if available, or first sheet
        const sheetNames = wb.SheetNames;
        const targetSheetName = sheetNames.find(s => 
          s.toLowerCase().includes("importar") || 
          s.toLowerCase().includes("catalogo") || 
          s.toLowerCase().includes("lista")
        ) || sheetNames[0];
        
        const ws = wb.Sheets[targetSheetName];
        const rawGrid: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (!rawGrid || rawGrid.length === 0) {
          setMenuToastMessage("El archivo está vacío o no se pudo leer.");
          setShowMenuToast(true);
          return;
        }

        // Direct Structured Parsing to preserve strict sortOrder and avoid AI drops
        const directParsed = parseStructuredExcelCatalog(rawGrid);
        if (directParsed && directParsed.length > 0) {
          setDetectedProducts(directParsed);
          setAnalysisStatus({
            total: 1,
            current: 1,
            completedImages: [{ index: 1, count: directParsed.length }],
            isAnalyzing: false,
          });
          setMenuToastMessage(`✅ ¡Lectura directa exitosa! Se cargaron ${directParsed.length} productos con su orden consecutivo exacto (1 al ${directParsed.length}).`);
          setShowMenuToast(true);
          return;
        }

        // Fallback to AI analysis if unstructured
        const data = XLSX.utils.sheet_to_json(ws);
        if (data && data.length > 0) {
          analyzeExcelMenu(data);
        } else {
          setMenuToastMessage("El archivo está vacío o no se pudo leer.");
          setShowMenuToast(true);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error("Error leyendo Excel:", err);
      setMenuToastMessage("Error al procesar el archivo Excel.");
      setShowMenuToast(true);
    }
  };

  const analyzeExcelMenu = async (excelRows: any[]) => {
    if (excelRows.length === 0) return;

    setIsAnalyzing(true);
    setDetectedProducts([]);
    setAnalysisStatus({
      total: 1,
      current: 1,
      completedImages: [],
      isAnalyzing: true,
    });

    try {
      const rowsText = excelRows.map((r) => JSON.stringify(r)).join("\n");
      let parsedItems = [];
      let usedDirectGemini = false;

      try {
        const resp = await fetch("/api/analyze-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rowsText }),
        });

        const contentType = resp.headers.get("content-type");
        if (!resp.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("El API local no está disponible.");
        }

        parsedItems = await resp.json();
      } catch (localErr) {
        console.warn("Fallo al contactar API local para Excel. Intentando Gemini directo del navegador...", localErr);

        const apiKeyToUse =
          companyConfig.geminiApiKey ||
          localStorage.getItem("custom_gemini_api_key") ||
          localStorage.getItem("local_gemini_api_key") ||
          ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);
        if (!apiKeyToUse) {
          throw new Error(
            "No hay una clave de API de Gemini configurada. Por favor, ingresa tu Clave Gemini desde la sección de Ajustes del Ticket."
          );
        }

        usedDirectGemini = true;
      
        const prompt = 
          "Analyze this list of products from an Excel/CSV upload. Extract all products with their names and prices. " +
          "You MUST output the price strictly as a numeric value. " +
          "Categorize them into 'food', 'drinks', or 'desserts'. " +
          "Identify subcategories (like Tacos, Hamburguesas, Refrescos, Cervezas, Entradas) and " +
          "create detailed subgroups logically grouping the options (e.g. 'Tacos de Asada', 'Bebidas Calientes'). " +
          "For 'destination', use 'kitchen' for food/desserts and 'bar' for drinks. " +
          "Here is the data:\n\n" + rowsText;

        const modelsToTry = [
          "gemini-3.1-flash-lite",
          "gemini-3.5-flash",
          "gemini-3.1-pro-preview",
          "gemini-1.5-flash",
        ];
        let lastErr = null;
        let directSuccess = false;

        for (const currentModel of modelsToTry) {
          try {
            console.log(`[Client Gemini] Intentando análisis Excel con ${currentModel}...`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKeyToUse}`;

            const requestBody = {
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      price: { type: "NUMBER" },
                      category: {
                        type: "STRING",
                        enum: ["food", "drinks", "desserts"],
                      },
                      subcategory: { type: "STRING" },
                      subgroup: { type: "STRING" },
                      destination: {
                        type: "STRING",
                        enum: ["kitchen", "bar"],
                      },
                    },
                    required: ["name", "price", "category", "subcategory", "subgroup", "destination"],
                  },
                },
              },
            };

            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            });
            const resultText = await res.text();
            if (!res.ok) throw new Error(`Error de Gemini: ${resultText}`);

            const parsedData = JSON.parse(resultText);
            const candidate = parsedData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate) {
              parsedItems = JSON.parse(candidate);
              directSuccess = true;
              break;
            }
          } catch (err) {
            console.warn(`[Client Gemini] Excel modelo ${currentModel} falló:`, err);
            lastErr = err;
          }
        }

        if (!directSuccess) throw lastErr || new Error("Todos los intentos con Gemini fallaron.");
      }

      const mapped = (parsedItems || []).map((it: any, idx: number) => ({
        ...it,
        id: `ai_excel_${Date.now()}_${idx}`,
      }));

      setDetectedProducts(mapped);
      setAnalysisStatus(prev => ({
        ...prev,
        completedImages: [{ index: 1, count: mapped.length }],
      }));
      setMenuToastMessage(`¡Análisis de Excel exitoso! ${mapped.length} productos detectados.`);
      setShowMenuToast(true);

    } catch (error: any) {
      console.error("Error analyzing excel:", error);
      setMenuToastMessage(`🚨 Error al procesar Excel: ${error.message}`);
      setShowMenuToast(true);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus((prev) => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleAddProductsToMenu = async (itemsToAdd: any[]) => {
    if (itemsToAdd.length === 0) return;

    setIsAddingProducts(true);
    setMenuToastMessage(`Iniciando carga de ${itemsToAdd.length} productos...`);
    setShowMenuToast(true);

    try {
      await bulkAddProductsToFirebase(itemsToAdd, false, selectedTenant.id);

      const foodCount = itemsToAdd.filter(p => p.category === "food").length;
      const drinksCount = itemsToAdd.filter(p => p.category === "drinks").length;
      const dessertsCount = itemsToAdd.filter(p => p.category === "desserts").length;

      const msg = `✅ ¡Éxito! Se importaron ${itemsToAdd.length} productos al menú:\n\n🌮 Alimentos: ${foodCount}\n🥤 Bebidas: ${drinksCount}\n🍰 Postres: ${dessertsCount}`;
      alert(msg);

      setMenuToastMessage(`Cargados: 🍔 ${foodCount} alimentos, 🥤 ${drinksCount} bebidas, 🍰 ${dessertsCount} postres.`);
      setIsAddingProducts(false);

      setTimeout(() => {
        setDetectedProducts([]);
        setShowMenuToast(false);
      }, 4000);
    } catch (error: any) {
      console.error("Error adding products:", error);
      setMenuToastMessage(
        `Error: ${error.message || "No se pudieron agregar los productos"}`,
      );
      setIsAddingProducts(false);
      setTimeout(() => {
        setShowMenuToast(false);
      }, 3500);
    }
  };

  const handleResetMenuAndRefill = async (itemsToAdd: any[]) => {
    if (itemsToAdd.length === 0) return;

    setIsAddingProducts(true);
    setMenuToastMessage("Reiniciando base de datos y preparando carga...");
    setShowMenuToast(true);

    try {
      await resetAllSystemsInFirebase(selectedTenant.id);
      await bulkAddProductsToFirebase(itemsToAdd, true, selectedTenant.id);

      const foodCount = itemsToAdd.filter(p => p.category === "food").length;
      const drinksCount = itemsToAdd.filter(p => p.category === "drinks").length;
      const dessertsCount = itemsToAdd.filter(p => p.category === "desserts").length;

      const msg = `✅ ¡Menú Reiniciado con Éxito! Se cargaron ${itemsToAdd.length} productos:\n\n🌮 Alimentos: ${foodCount}\n🥤 Bebidas: ${drinksCount}\n🍰 Postres: ${dessertsCount}`;
      alert(msg);

      setMenuToastMessage(`Reiniciado con: 🍔 ${foodCount} alimentos, 🥤 ${drinksCount} bebidas, 🍰 ${dessertsCount} postres.`);
      setIsAddingProducts(false);
      setTimeout(() => {
        setDetectedProducts([]);
        setShowMenuToast(false);
      }, 4000);
    } catch (error: any) {
      console.error("Error resetting menu:", error);
      setMenuToastMessage("Error al reiniciar el menú.");
      setIsAddingProducts(false);
      setTimeout(() => {
        setShowMenuToast(false);
      }, 3500);
    }
  };

  const [selectedHistoryAccount, setSelectedHistoryAccount] =
    useState<ClosedAccount | null>(null);
  const [expandedAccountIds, setExpandedAccountIds] = useState<string[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedTableGestion, setSelectedTableGestion] = useState<any>(null);
  const [checkoutReturnMode, setCheckoutReturnMode] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<
    | "floorplan"
    | "menu"
    | "review"
    | "table-details"
    | "checkout"
    | "admin"
    | "manage-menu"
    | "inventory"
    | "suppliers"
    | "customers"
    | "reports"
    | "ops-inventarios"
    | "inventario-v2"
    | "corte-nuevo"
    | "corte-express"
    | "corte-tabla"
    | "corte-tabla-2"
    | "corte-x"
    | "insumos-b1"
    | "expenses"
    | "dashboard"
    | "ia-insumos"
    | "ticket-local"
    | "ticket-red"
    | "reporte-movimientos"
    | "verify-menu"
    | "gestion_cuentas"
  >(() => getPreferredTablesMode());

  const [systemLocalWindowsAutoPrint, setSystemLocalWindowsAutoPrint] = useState<boolean>(() => {
    const cached = localStorage.getItem("system_local_windows_autoprint");
    if (cached !== null) {
      return cached === "true";
    }
    return isWindows();
  });

  const [printerQueue, setPrinterQueue] = useState<any[]>([]);

  useEffect(() => {
    if (selectedTenant) {
      let isInitialSnapshot = true;
      const unsub = subscribeToPrinterQueue(selectedTenant.id, (data) => {
        if (isInitialSnapshot) {
          isInitialSnapshot = false;
          data.forEach((p) => {
            processedPrintIdsRef.current.add(p.id);
            const subKey = `${p.tipo || "comanda"}_${p.folio || p.id}_${p.area || "general"}`;
            processedPrintIdsRef.current.add(subKey);
            if (p.tipo === "cuenta" && p.folio) processedPrintIdsRef.current.add(p.folio);
          });
          console.log(`[WindowsAutoPrint] Primer snapshot de Firestore (${selectedTenant.id}): ${data.length} pedidos existentes marcados como procesados.`);
        }
        setPrinterQueue(data.slice(0, 15));
      });
      return () => unsub();
    }
  }, [selectedTenant?.id]);

  const printPedidoFromNetwork = async (pedido: any) => {
    try {
      if (pedido.tipo === "cuenta") {
        const rfcVal = (pedido.rfc || companyConfig.rfc || selectedTenant?.rfc || "").toUpperCase();
        const regVal = (pedido.regimenFiscal || companyConfig.regimenFiscal || selectedTenant?.regimenFiscal || "").toUpperCase();
        const lugVal = (pedido.lugarExpedicion || companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion || "").toUpperCase();
        const dirVal = (pedido.direccionFiscal || companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").toUpperCase();

        const missing = [];
        if (!rfcVal) missing.push("RFC");
        if (!regVal) missing.push("Régimen Fiscal");
        if (!lugVal) missing.push("Lugar de Expedición (C.P.)");
        if (!dirVal) missing.push("Dirección Fiscal");

        if (missing.length > 0) {
          console.warn(`⚠️ [Impresión] Faltan datos fiscales del SAT para este ticket (${missing.join(", ")}), pero se procede a imprimir por prioridad de venta.`);
        }
      }

      let printerName: string = "cuentas";
      if (pedido.tipo === "comanda") {
        const areaLower = (pedido.area || "general").toLowerCase();
        if (areaLower === "kitchen" || areaLower === "cocina") {
          printerName = "cocina";
        } else if (areaLower === "bar" || areaLower === "barra") {
          printerName = "barra";
        } else {
          printerName = "cocina"; // fallback
        }
      }

      const targetTenantId = pedido.tenantId || selectedTenant?.id;
      const transport = await createTransport(printerName as any, targetTenantId);
      const driver = new EscPosDriver();
      const job = new PosPrinterJob(driver, transport as any);

      job.initialize();

      if (pedido.tipo === "comanda") {
        job.center();
        job.setPrintMode(job.FONT_SIZE_NORMAL).bold(true);
        job.printLine("================================");
        const destLabel = printerName === "cocina" ? "COCINA" : printerName === "barra" ? "BARRA" : "GENERAL";
        job.printLine(`*** ${destLabel} - MESA: ${pedido.mesa} ***`);
        job.bold(false);
        const timeStr = pedido.timestamp ? new Date(pedido.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        job.printLine(`Cmd #${pedido.folio || "S/F"} | Hora: ${timeStr}`);
        if (pedido.mesero) {
          job.printLine(`MESERO: ${pedido.mesero.toUpperCase()}`);
        }
        job.printLine("================================");
        
        if (pedido.deliveryClientName || pedido.deliveryAddress) {
          job.left();
          if (pedido.deliveryClientName) job.bold(true).printLine(`CTE: ${pedido.deliveryClientName.toUpperCase()}`).bold(false);
          if (pedido.deliveryPhone) job.printLine(`TEL: ${pedido.deliveryPhone}`);
          if (pedido.deliveryAddress) {
            let cleanAddr = pedido.deliveryAddress;
            let refText = "";
            if (pedido.deliveryAddress.includes("(Ref:")) {
              const parts = pedido.deliveryAddress.split("(Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].replace(")", "").trim();
            } else if (pedido.deliveryAddress.includes("| Ref:")) {
              const parts = pedido.deliveryAddress.split("| Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].trim();
            }
            job.printLine(`DIR: ${cleanAddr.toUpperCase()}`);
            if (refText) job.printLine(`REF: ${refText.toUpperCase()}`);
          }
          if (pedido.deliveryNotes) job.bold(true).printLine(`NOTAS: ${pedido.deliveryNotes.toUpperCase()}`).bold(false);
          job.printLine("--------------------------------");
        }
        
        job.left();
        job.bold(true).printLine("CANT  DESCRIPCION").bold(false);
        job.printLine("--------------------------------");

        if (printerName === "cocina") {
          // Group by comensal/plate if present
          const hasComensal = pedido.items?.some((i: any) => i.comensal !== undefined);
          if (hasComensal) {
            const plates = Array.from(
              new Set(pedido.items.map((i: any) => i.comensal || 1))
            ).sort((a: any, b: any) => Number(a) - Number(b));
            
            plates.forEach((plateNum) => {
              job.center().bold(true).printLine(`-- COMENSAL ${plateNum} --`).bold(false).left();
              pedido.items
                .filter((i: any) => (i.comensal || 1) === plateNum)
                .forEach((item: any) => {
                  const lines = formatComandaItemLines(item.cantidad || 1, item.nombre, item.notas || item.notes, 32);
                  job.bold(true);
                  lines.forEach((l) => job.printLine(l));
                  job.bold(false);
                  job.printLine("--------------------------------");
                });
            });
          } else {
            pedido.items?.forEach((item: any) => {
              const lines = formatComandaItemLines(item.cantidad || 1, item.nombre, item.notas || item.notes, 32);
              job.bold(true);
              lines.forEach((l) => job.printLine(l));
              job.bold(false);
              job.printLine("--------------------------------");
            });
          }
        } else {
          // Bar or General
          pedido.items?.forEach((item: any) => {
            const lines = formatComandaItemLines(item.cantidad || 1, item.nombre, item.notas || item.notes, 32);
            job.bold(true);
            lines.forEach((l) => job.printLine(l));
            job.bold(false);
            job.printLine("--------------------------------");
          });
        }

        if (pedido.generalNotes && pedido.generalNotes.trim()) {
          job.bold(true).printLine(`OBS: ${pedido.generalNotes.toUpperCase()}`).bold(false);
          job.printLine("--------------------------------");
        }

      } else if (pedido.tipo === "cuenta") {
        job.center();
        job.setPrintMode(job.FONT_SIZE_BIG + job.FONT_EMPHASIZED).bold(true);
        const bName = sanitizeBusinessName(pedido.businessName || companyConfig.businessName || selectedTenant?.name || "TACOS ROY").toUpperCase();
        job.printLine(bName);
        job.setPrintMode(job.FONT_SIZE_NORMAL).bold(false);
        job.printLine("--------------------------------");
        
        const rfcVal = (pedido.rfc || companyConfig.rfc || selectedTenant?.rfc || "").toUpperCase();
        const regVal = (pedido.regimenFiscal || companyConfig.regimenFiscal || selectedTenant?.regimenFiscal || "").toUpperCase();
        const lugVal = (pedido.lugarExpedicion || companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion || "").toUpperCase();
        const dirVal = (pedido.direccionFiscal || companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").toUpperCase();
        const telVal = (pedido.telefono || companyConfig.telefono || selectedTenant?.telefono || "").toUpperCase();
        const emlVal = sanitizeEmail(pedido.email || companyConfig.email || selectedTenant?.email || "");
        const sucVal = (pedido.sucursal || companyConfig.sucursal || selectedTenant?.sucursalDefault || "").toUpperCase();

        if (rfcVal) job.printLine(`RFC: ${rfcVal}`);
        if (regVal) job.printLine(`REGIMEN FISCAL: ${regVal}`);
        if (lugVal) job.printLine(`LUGAR EXPEDICION: ${lugVal}`);
        if (dirVal) job.printLine(`DIR: ${dirVal}`);
        if (sucVal) job.printLine(`SUC: ${sucVal}`);
        if (telVal) job.printLine(`📞 TEL. SUCURSAL: ${formatPhone(telVal) || telVal}`);
        if (emlVal) job.printLine(`✉️ ${emlVal.toLowerCase()}`);
        
        job.printLine("--------------------------------");
        job.printLine(`MESA: ${pedido.mesa}`);
        const dateStr = pedido.timestamp ? new Date(pedido.timestamp).toLocaleString("es-MX") : new Date().toLocaleString("es-MX");
        job.printLine(`FECHA: ${dateStr}`);
        job.printLine("--------------------------------");
        job.center().bold(true).printLine("📝 DETALLE DEL PEDIDO 📝").bold(false).left();
        job.printLine("--------------------------------");

        job.left();
        (pedido.items || []).forEach((item: any) => {
          const price = `$${Number(item.subtotal || (item.precio || 0) * (item.cantidad || 1)).toFixed(2)}`;
          const rawName = String(item.nombre || "");
          const itemLines = formatReceiptItemLines(item.cantidad || 1, rawName, price, 32);
          itemLines.forEach((l) => job.printLine(l));
        });

        if (pedido.deliveryClientName || pedido.deliveryAddress) {
          job.printLine("--------------------------------");
          job.center().bold(true).printLine("DATOS DE ENVIO").bold(false).left();
          if (pedido.deliveryClientName) job.printLine(`CLIENTE: ${pedido.deliveryClientName.toUpperCase()}`);
          
          if (pedido.deliveryAddress) {
            let cleanAddr = pedido.deliveryAddress;
            let refText = "";
            if (pedido.deliveryAddress.includes("(Ref:")) {
              const parts = pedido.deliveryAddress.split("(Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].replace(")", "").trim();
            } else if (pedido.deliveryAddress.includes("| Ref:")) {
              const parts = pedido.deliveryAddress.split("| Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].trim();
            }
            job.printLine(`DIR: ${cleanAddr.toUpperCase()}`);
            if (refText) job.printLine(`REF: ${refText.toUpperCase()}`);
          }
          if (pedido.deliveryNotes) job.printLine(`NOTAS: ${pedido.deliveryNotes.toUpperCase()}`);
          job.printLine("--------------------------------");
        }

        job.right().printLine("--------------------------------");
        const subtotalVal = Number(pedido.subtotal !== undefined && pedido.subtotal !== null ? pedido.subtotal : (pedido.total ?? 0));
        const propinaVal = Number(pedido.propina ?? 0);
        const descuentoVal = Number(pedido.descuento ?? 0);
        const totalVal = Number(pedido.total !== undefined && pedido.total !== null ? pedido.total : Math.max(0, subtotalVal - descuentoVal));

        job.printLine(`SUBTOTAL: $${subtotalVal.toFixed(2)}`);
        if (descuentoVal > 0) job.printLine(`DESCUENTO: -$${descuentoVal.toFixed(2)}`);
        if (propinaVal > 0) job.printLine(`PROPINA: $${propinaVal.toFixed(2)}`);
        
        job.bold(true).printLine(`TOTAL: $${totalVal.toFixed(2)}`).bold(false);
        job.printLine(" ");
        job.center().printLine(`(${numeroALetras(totalVal)})`).left();

        const getPaymentLabel = (p: any) => {
          const m = (p.paymentMethod || p.metodoPago || p.payment_method || p.formaPago || p.tipoPago || "").toString().toLowerCase().trim();
          const ct = (p.cardType || p.tipoTarjeta || "").toString().toLowerCase().trim();

          if (["cash", "efectivo"].includes(m)) return "💵 EFECTIVO";
          if (["card", "tarjeta", "credit", "debit", "credito", "debito"].includes(m)) {
            if (ct === "credito" || m === "credito") return "💳 TARJETA CRÉDITO";
            if (ct === "debito" || m === "debito") return "💳 TARJETA DÉBITO";
            return "💳 TARJETA";
          }
          if (["lupay", "lu-pay"].includes(m)) return "📲 LUPAY";
          if (["transfer", "transferencia", "spei"].includes(m)) return "💸 TRANSFERENCIA";
          if (m) return `💳 ${m.toUpperCase()}`;
          return "";
        };

        const payLabel = getPaymentLabel(pedido);
        if (payLabel) {
          job.center().bold(true).printLine(payLabel).bold(false).left();
        }
        if (pedido.pagadoCon || pedido.montoRecibido) {
          job.printLine(`PAGADO CON: $${Number(pedido.pagadoCon || pedido.montoRecibido).toFixed(2)}`);
        }
        if (pedido.cambio && Number(pedido.cambio) > 0) {
          job.printLine(`CAMBIO: $${Number(pedido.cambio).toFixed(2)}`);
        }

        if (pedido.requiresInvoice) {
          job.printLine("--------------------------------");
          job.left();
          job.bold(true).printLine("🧾 REQUIERE FACTURA").bold(false);
        }

        job.center();
        if (companyConfig.footerMessage) {
          job.feed(1).printLine(companyConfig.footerMessage.toUpperCase());
        }
      }

      job.feed(3).cut();
      await job.execute();
      console.log(`[WindowsAutoPrint] Sent print job for ${pedido.tipo} #${pedido.folio}`);
    } catch (err) {
      console.error("[WindowsAutoPrint] Error preparing or sending print job:", err);
      throw err;
    }
  };

  // Background printer queue observer daemon for Windows
  useEffect(() => {
    if (!selectedTenant || !systemLocalWindowsAutoPrint) return;

    const MAX_PRINT_AGE_MS = 2 * 60 * 1000; // 2 minutos máximo
    const now = Date.now();

    const pendingPedidos = printerQueue.filter((p) => p.impreso === false || p.impreso === undefined);

    pendingPedidos.forEach((pedido) => {
      const itemKey = `${pedido.tipo || "comanda"}_${pedido.folio || pedido.id}_${pedido.area || "general"}`;
      const isAlreadyProcessed = 
        processedPrintIdsRef.current.has(pedido.id) ||
        processedPrintIdsRef.current.has(itemKey) ||
        (pedido.tipo === "cuenta" && pedido.folio && processedPrintIdsRef.current.has(pedido.folio));

      if (isAlreadyProcessed) return;

      processedPrintIdsRef.current.add(pedido.id);
      processedPrintIdsRef.current.add(itemKey);
      if (pedido.tipo === "cuenta" && pedido.folio) {
        processedPrintIdsRef.current.add(pedido.folio);
      }

      // Validar antigüedad: no imprimir si fue creado hace más de 2 minutos o si carece de timestamp válido
      const pedidoTime = pedido.timestamp ? new Date(pedido.timestamp).getTime() : 0;
      const isTooOld = pedidoTime === 0 || (now - pedidoTime > MAX_PRINT_AGE_MS);

      if (isTooOld) {
        console.warn(`[WindowsAutoPrint] Pedido omitido por antigüedad (> 2 min o sin timestamp):`, pedido.folio || pedido.id);
        updatePedidoInFirebase(selectedTenant.id, pedido.id, { impreso: true, expired: true }).catch(() => {});
        return;
      }

      console.log(`[WindowsAutoPrint] Auto-printing network ${pedido.tipo}:`, pedido.folio);
      
      printPedidoFromNetwork(pedido).then(() => {
        updatePedidoInFirebase(selectedTenant.id, pedido.id, { impreso: true }).catch((err) => {
          console.error("[WindowsAutoPrint] Error marking printed in Firestore:", err);
        });
      });
    });
  }, [printerQueue, selectedTenant, systemLocalWindowsAutoPrint]);

  // --- Estados del Servicio a Domicilio ---
  const [deliverySearchQuery, setDeliverySearchQuery] = useState("");
  const [isRegisteringDeliveryClient, setIsRegisteringDeliveryClient] = useState(false);
  const [newDeliveryClientName, setNewDeliveryClientName] = useState("");
  const [newDeliveryClientPhone, setNewDeliveryClientPhone] = useState("");
  const [newDeliveryClientAddress, setNewDeliveryClientAddress] = useState("");
  const [newDeliveryClientAddressRef, setNewDeliveryClientAddressRef] = useState("");
  const [onTheFlyAddressInput, setOnTheFlyAddressInput] = useState("");
  const [onTheFlyAddressRefInput, setOnTheFlyAddressRefInput] = useState("");
  const [selectedDeliveryClient, setSelectedDeliveryClient] = useState<any | null>(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showDeliverySetupModal, setShowDeliverySetupModal] = useState(false);

  const handleSelectDeliveryClient = (client: any) => {
    setSelectedDeliveryClient(client);
    const firstAddr = client.addresses?.[0] || "";
    setSelectedDeliveryAddress(firstAddr);
    setDeliverySearchQuery("");

    if (firstAddr.includes("(Ref:")) {
      const parts = firstAddr.split("(Ref:");
      const ref = parts[1].replace(")", "").trim();
      if (ref) setDeliveryNotes(ref);
    } else if (firstAddr.includes("| Ref:")) {
      const parts = firstAddr.split("| Ref:");
      const ref = parts[1].trim();
      if (ref) setDeliveryNotes(ref);
    }
  };

  const handleRegisterAndSelectDeliveryClient = async () => {
    if (!newDeliveryClientName.trim() || !newDeliveryClientPhone.trim()) {
      alert("El nombre y teléfono son requeridos ⚠️");
      return;
    }

    try {
      let finalAddr = newDeliveryClientAddress.trim();
      if (finalAddr && newDeliveryClientAddressRef.trim()) {
        finalAddr = `${finalAddr} (Ref: ${newDeliveryClientAddressRef.trim()})`;
      }

      const initialAddresses = finalAddr ? [finalAddr] : [];
      const newCust = {
        name: newDeliveryClientName.trim(),
        phone: newDeliveryClientPhone.trim(),
        addresses: initialAddresses,
        email: "",
        visits: 1,
        notes: "Registrado express en reparto"
      };

      const newId = await addCustomerToFirebase(newCust);
      const fullCust = { ...newCust, id: newId, uid: newId };
      
      setSelectedDeliveryClient(fullCust);
      setSelectedDeliveryAddress(finalAddr);
      if (newDeliveryClientAddressRef.trim()) {
        setDeliveryNotes(newDeliveryClientAddressRef.trim());
      }
      setIsRegisteringDeliveryClient(false);
      setNewDeliveryClientName("");
      setNewDeliveryClientPhone("");
      setNewDeliveryClientAddress("");
      setNewDeliveryClientAddressRef("");
      triggerAppNotification("👥 CLIENTE REGISTRADO", `Se guardó a ${newCust.name} en el catálogo de clientes.`, "success");
    } catch (err) {
      console.error("Error al registrar cliente express:", err);
      alert("Error al registrar el cliente express. ❌");
    }
  };

  const handleAddNewDeliveryAddressOnTheFly = async (addrStr: string, refStr: string = "") => {
    if (!addrStr.trim() || !selectedDeliveryClient) return;
    let cleanAddr = addrStr.trim();
    if (refStr.trim()) {
      cleanAddr = `${cleanAddr} (Ref: ${refStr.trim()})`;
    }
    
    const updatedAddresses = [...(selectedDeliveryClient.addresses || []), cleanAddr];
    const updatedClient = {
      ...selectedDeliveryClient,
      addresses: updatedAddresses
    };

    try {
      await updateCustomerInFirebase(selectedDeliveryClient.id, {
        ...selectedDeliveryClient,
        addresses: updatedAddresses
      });
      setSelectedDeliveryClient(updatedClient);
      setSelectedDeliveryAddress(cleanAddr);
      if (refStr.trim()) {
        setDeliveryNotes(refStr.trim());
      }
      setOnTheFlyAddressInput("");
      setOnTheFlyAddressRefInput("");
      triggerAppNotification("📍 DIRECCIÓN AGREGADA", `Se añadió nueva dirección a ${selectedDeliveryClient.name}`, "success");
    } catch (err) {
      console.error("Error adding address on-the-fly:", err);
      alert("Error al agregar la nueva dirección. ❌");
    }
  };

  const handleSaveDeliverySetup = async () => {
    if (!selectedTable) {
      alert("No hay mesa seleccionada ⚠️");
      return;
    }
    if (!selectedDeliveryClient) {
      alert("Por favor selecciona o registra un cliente primero ⚠️");
      return;
    }
    if (!selectedDeliveryAddress) {
      alert("Por favor selecciona una dirección de entrega ⚠️");
      return;
    }

    try {
      const deliveryData = {
        deliveryClientName: selectedDeliveryClient.name,
        deliveryClientPhone: selectedDeliveryClient.phone,
        deliveryAddress: selectedDeliveryAddress,
        deliveryNotes: deliveryNotes
      };

      await updateTableDeliveryInfoInFirebase(selectedTable.id, deliveryData);

      const updatedTable = {
        ...selectedTable,
        ...deliveryData
      };

      setTables(prev => prev.map(t => t.id === selectedTable.id ? updatedTable : t));

      triggerAppNotification(
        "🛵 ENVÍO CONFIGURADO",
        `Pedido asignado a ${selectedDeliveryClient.name} | Dirección: ${selectedDeliveryAddress}`,
        "success"
      );

      setShowDeliverySetupModal(false);
    } catch (err) {
      console.error("Error saving delivery info to table:", err);
      alert("Ocurrió un error al guardar la configuración de entrega ❌");
    }
  };

  const [mainTab, setMainTab] = useState<"mesas" | "comandas" | "cuentas">(
    "mesas",
  );
  const [activeCategory, setActiveCategory] = useState<
    "food" | "drinks" | "desserts"
  >("food");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [activeSubgroup, setActiveSubgroup] = useState<string>("Todos");
  const [activeDrinkType, setActiveDrinkType] = useState<"hot" | "cold">("hot");
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>("");
  const [showDeletedProducts, setShowDeletedProducts] = useState<boolean>(false);
  const [productSalesMap, setProductSalesMap] = useState<Record<string, number>>(() => {
    try {
      const cached = localStorage.getItem("cocinet_product_sales_stats");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [currentComensal, setCurrentComensal] = useState<number>(1);
  const [reviewComensal, setReviewComensal] = useState<number | "summary">(1);
  const [precuentaComensal, setPrecuentaComensal] = useState<number>(1);
  const [showComensalPreview, setShowComensalPreview] = useState(false);
  const [showComensalesBar, setShowComensalesBar] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [checkoutFallbackItems, setCheckoutFallbackItems] = useState<
    CartItem[]
  >([]);

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "cash" | "transfer" | "lupay"
  >("cash");
  const [paymentCardType, setPaymentCardType] = useState<"debito" | "credito" | "">("");
  const [showTipInput, setShowTipInput] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const isProcessingPaymentRef = useRef(false);

  // Estados para cancelar cuentas cerradas en la lista de cuentas 🚫🧾
  const [selectedAccountForCancellation, setSelectedAccountForCancellation] = useState<ClosedAccount | null>(null);
  const [accountCancellationReason, setAccountCancellationReason] = useState<string>("");
  const [accountCancellationPin, setAccountCancellationPin] = useState<string>("");
  const [showAccountCancellationModal, setShowAccountCancellationModal] = useState(false);

  // Estados para cancelar productos individuales y comandas completas
  const [itemCancelReason, setItemCancelReason] = useState<string>("");
  const [itemCancelPin, setItemCancelPin] = useState<string>("");
  const [comandaCancelReason, setComandaCancelReason] = useState<string>("");
  const [comandaCancelPin, setComandaCancelPin] = useState<string>("");

  // Estados para ver/editar datos de entrega a domicilio 🛵
  const [selectedDeliveryAccount, setSelectedDeliveryAccount] = useState<any | null>(null);
  const [exportingAccount, setExportingAccount] = useState<ClosedAccount | null>(null);

  const [showMoveItemsModal, setShowMoveItemsModal] = useState(false);
  const [moveItemsSelection, setMoveItemsSelection] = useState<Record<string, number>>({});
  const [moveTargetTableId, setMoveTargetTableId] = useState<string>("");
  const [showTransferTableModal, setShowTransferTableModal] = useState(false);
  const [transferTargetTableId, setTransferTargetTableId] = useState<string>("");
  const [showPrecuentaModal, setShowPrecuentaModal] = useState(false);
  const [precuentaModalType, setPrecuentaModalType] = useState<"resumen" | "comandas" | "comensales">("resumen");
  const [printLoading, setPrintLoading] = useState<number | null>(null);
  const [isPrintingPrecuenta, setIsPrintingPrecuenta] = useState<boolean>(false);
  const [generalNotes, setGeneralNotes] = useState<string>("");
  const [showCloseTurnConfirm, setShowCloseTurnConfirm] = useState(false);
  const [showResetSalesConfirm, setShowResetSalesConfirm] = useState(false);

  // Estados para Modal de Folio Interno de Comanda por Sucursal 📋
  const [showFolioModal, setShowFolioModal] = useState<boolean>(false);
  const [folioStep, setFolioStep] = useState<1 | 2>(1);
  const [folioInput1, setFolioInput1] = useState<string>("");
  const [folioInputValue, setFolioInputValue] = useState<string>("");
  const [folioModalError, setFolioModalError] = useState<string | null>(null);
  const [pendingGoToCheckout, setPendingGoToCheckout] = useState<boolean>(false);
  const [suggestedLastFolio, setSuggestedLastFolio] = useState<string>("");
  const folioInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para Corte Nuevo y Arqueo de Caja
  const [corteNuevoType, setCorteNuevoType] = useState<"in" | "out">("in");
  const [corteNuevoConcept, setCorteNuevoConcept] =
    useState<string>("dotacion");
  const [corteNuevoAmount, setCorteNuevoAmount] = useState<string>("");
  const [corteNuevoDescription, setCorteNuevoDescription] =
    useState<string>("");

  // Estados para Cortexpress (Corte Corto Simplificado)
  const [expressOutflowType, setExpressOutflowType] = useState<
    "gasto" | "retiro"
  >("gasto");
  const [expressOutflowAmount, setExpressOutflowAmount] = useState<string>("");
  const [expressOutflowDescription, setExpressOutflowDescription] =
    useState<string>("");
  const [showReceiptPreviewModal, setShowReceiptPreviewModal] =
    useState<boolean>(false);
  const [showArqKeyboardModal, setShowArqKeyboardModal] =
    useState<boolean>(false);

  // PIN Verification and Tenant selection
  const [showTenantPinModal, setShowTenantPinModal] = useState<boolean>(false);
  const [showPinsStructureModal, setShowPinsStructureModal] = useState<boolean>(false);
  const [pendingTenant, setPendingTenant] = useState<CompanyTenant | null>(
    null,
  );
  const [pendingTenantContext, setPendingTenantContext] = useState<
    "login" | "admin"
  >("login");
  const [typedPin, setTypedPin] = useState<string>("");

  // Denominations for Cortexpress
  const [expressArq1000, setExpressArq1000] = useState<string>("0");
  const [expressArq500, setExpressArq500] = useState<string>("0");
  const [expressArq200, setExpressArq200] = useState<string>("0");
  const [expressArq100, setExpressArq100] = useState<string>("0");
  const [expressArq50, setExpressArq50] = useState<string>("0");
  const [expressArq20, setExpressArq20] = useState<string>("0");
  const [expressArqM10, setExpressArqM10] = useState<string>("0");
  const [expressArqM5, setExpressArqM5] = useState<string>("0");
  const [expressArqM2, setExpressArqM2] = useState<string>("0");
  const [expressArqM1, setExpressArqM1] = useState<string>("0");
  const [expressArqM05, setExpressArqM05] = useState<string>("0");

  // Denominations for Corte Tabla
  const [tablaArq1000, setTablaArq1000] = useState<string>("0");
  const [tablaArq500, setTablaArq500] = useState<string>("0");
  const [tablaArq200, setTablaArq200] = useState<string>("0");
  const [tablaArq100, setTablaArq100] = useState<string>("0");
  const [tablaArq50, setTablaArq50] = useState<string>("0");
  const [tablaArq20, setTablaArq20] = useState<string>("0");
  const [tablaArqM10, setTablaArqM10] = useState<string>("0");
  const [tablaArqM5, setTablaArqM5] = useState<string>("0");
  const [tablaArqM2, setTablaArqM2] = useState<string>("0");
  const [tablaArqM1, setTablaArqM1] = useState<string>("0");
  const [tablaArqM05, setTablaArqM05] = useState<string>("0");
  const [showTablaArqueoModal, setShowTablaArqueoModal] =
    useState<boolean>(false);
  const [activeTablaDenom, setActiveTablaDenom] = useState<string>("1000");
  const [showTablaKeypadOverlay, setShowTablaKeypadOverlay] =
    useState<boolean>(false);
  const [expandedCorteTablaRows, setExpandedCorteTablaRows] = useState<{
    cash: boolean;
    mixed: boolean;
    expenses: boolean;
    purchases: boolean;
    inflows: boolean;
    activeOrders: boolean;
    lupay: boolean;
  }>({
    cash: false,
    mixed: false,
    expenses: false,
    purchases: false,
    inflows: false,
    activeOrders: false,
    lupay: false,
  });

  const [activeExpressDenom, setActiveExpressDenom] = useState<string>("1000");

  // Estados para Historial de Cortes 2 (Folio Cuentas / Nivelación)
  const [corte2Records, setCorte2Records] = useState<CorteCuentasFolioRecord[]>([]);
  const [corte2SelectedDate, setCorte2SelectedDate] = useState<string>("");
  const [corte2FolioAnterior, setCorte2FolioAnterior] = useState<number | null>(null);
  const [corte2MontoObjetivo, setCorte2MontoObjetivo] = useState<number>(0);
  const [corte2SelectedAccountIds, setCorte2SelectedAccountIds] = useState<string[]>([]);
  
  // State for Multi-Turn Report
  const [showMultiTurnModal, setShowMultiTurnModal] = useState<boolean>(false);
  const [multiTurnStartDate, setMultiTurnStartDate] = useState<string>("");
  const [multiTurnEndDate, setMultiTurnEndDate] = useState<string>("");
  const [multiTurnPreviewReady, setMultiTurnPreviewReady] = useState<boolean>(false);

  const [systemUseRawBt, setSystemUseRawBt] = useState<boolean>(() => {
    return localStorage.getItem("system_use_rawbt") === "true"; // por default será false ya que la clave no existirá
  });

  const [bluetoothPrinterCuentas, setBluetoothPrinterCuentas] = useState<string>(() => localStorage.getItem("bluetooth_printer_cuentas") || "cuentas");
  const [bluetoothPrinterCocina, setBluetoothPrinterCocina] = useState<string>(() => localStorage.getItem("bluetooth_printer_cocina") || "cocina");
  const [bluetoothPrinterBarra, setBluetoothPrinterBarra] = useState<string>(() => localStorage.getItem("bluetooth_printer_barra") || "barra");
  const [bluetoothTransportMode, setBluetoothTransportMode] = useState<string>(() => localStorage.getItem("bluetooth_transport_mode") || "webbluetooth");
  const [showBluetoothConfigModal, setShowBluetoothConfigModal] = useState<boolean>(false);
  const [showPrinterTemplateModal, setShowPrinterTemplateModal] = useState<boolean>(false);
  const [connectedBtDeviceName, setConnectedBtDeviceName] = useState<string | null>(() => localStorage.getItem("bt_connected_device_name"));
  const [systemPrintDestination, setSystemPrintDestination] = useState<string>(() => localStorage.getItem("system_print_destination") || "windows");
  const [windowsPrinterPort, setWindowsPrinterPort] = useState<string>(() => localStorage.getItem("windows_printer_port") || "3010");
  const [isScanningBt, setIsScanningBt] = useState<boolean>(false);
  const [availableWindowsPrinters, setAvailableWindowsPrinters] = useState<string[]>([]);
  const [isSentinelLoading, setIsSentinelLoading] = useState<boolean>(false);
  const [activeBtConnections, setActiveBtConnections] = useState<Record<string, boolean>>(() => ({
    cuentas: WebBluetoothTransport.isConnected("cuentas"),
    cocina: WebBluetoothTransport.isConnected("cocina"),
    barra: WebBluetoothTransport.isConnected("barra")
  }));

  const [tenantPrinterConfig, setTenantPrinterConfig] = useState<TenantPrinterSettings>(() => {
    return getTenantPrinterSettings(selectedTenant?.id);
  });

  const [productCategories, setProductCategories] = useState<ProductCategorySetting[]>(() => {
    const tenantId = selectedTenant?.id || "default";
    try {
      const raw = localStorage.getItem(`product_categories_${tenantId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return getDefaultProductCategories();
  });

  const [newAreaName, setNewAreaName] = useState<string>("");
  const [newAreaEmoji, setNewAreaEmoji] = useState<string>("🫓");
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatEmoji, setNewCatEmoji] = useState<string>("🫓");
  const [newCatDest, setNewCatDest] = useState<string>("cocina");
  const [configModalTab, setConfigModalTab] = useState<"printers" | "categories">("printers");

  useEffect(() => {
    if (selectedTenant?.id) {
      const tenantId = selectedTenant.id;
      const cfg = getTenantPrinterSettings(tenantId);
      setTenantPrinterConfig(cfg);
      try {
        const raw = localStorage.getItem(`product_categories_${tenantId}`);
        if (raw) {
          setProductCategories(JSON.parse(raw));
        } else {
          setProductCategories(getDefaultProductCategories());
        }
      } catch (e) {
        setProductCategories(getDefaultProductCategories());
      }
    }
  }, [selectedTenant?.id, showBluetoothConfigModal]);

  const handleSaveTenantPrinters = async (newConfig?: TenantPrinterSettings, newCategories?: ProductCategorySetting[]) => {
    const targetTenant = selectedTenant;
    const targetId = targetTenant?.id || "default";
    const cfgToSave = newConfig || tenantPrinterConfig;
    const catsToSave = newCategories || productCategories;

    // 1. Guardar en almacenamiento local del dispositivo
    saveTenantPrinterSettingsToLocal(targetId, cfgToSave);
    setTenantPrinterConfig(cfgToSave);
    try {
      localStorage.setItem(`product_categories_${targetId}`, JSON.stringify(catsToSave));
      setProductCategories(catsToSave);
    } catch (e) {}

    // 2. Persistir en Firestore (en settings/companyConfig y en tenants/{id})
    try {
      await saveCompanyConfigInFirebase(targetId, {
        printerConfig: cfgToSave,
        productCategories: catsToSave,
      });

      if (targetTenant?.id) {
        await addTenantToFirebase({
          ...targetTenant,
          printerConfig: cfgToSave,
          productCategories: catsToSave,
        });
      }

      triggerAppNotification(
        "🖨️ Configuración Guardada",
        `Se guardaron las impresoras y categorías para "${targetTenant?.name || targetId}".`,
        "success"
      );
    } catch (err: any) {
      console.warn("No se pudo guardar la config en Firebase, guardado local:", err);
      triggerAppNotification(
        "💾 Guardado Local",
        "Configuración guardada en este equipo.",
        "warning"
      );
    }
  };

  useEffect(() => {
    if (showBluetoothConfigModal) {
      setActiveBtConnections({
        cuentas: WebBluetoothTransport.isConnected("cuentas"),
        cocina: WebBluetoothTransport.isConnected("cocina"),
        barra: WebBluetoothTransport.isConnected("barra")
      });
    }
  }, [showBluetoothConfigModal]);

  useEffect(() => {
    if (selectedTenant?.id) {
      const tenantId = selectedTenant.id;
      const dest = localStorage.getItem(`system_print_destination_${tenantId}`) || localStorage.getItem("system_print_destination") || "windows";
      const port = localStorage.getItem(`windows_printer_port_${tenantId}`) || localStorage.getItem("windows_printer_port") || "3010";
      setSystemPrintDestination(dest);
      setWindowsPrinterPort(port);
    }
  }, [selectedTenant?.id]);

  const fetchWindowsPrinters = async (portParam?: string) => {
    setIsSentinelLoading(true);
    const portToUse = portParam || windowsPrinterPort || "3010";
    try {
      const printersList = await getWindowsPrinters(portToUse, selectedTenant?.id);
      setAvailableWindowsPrinters(printersList);
      if (printersList && printersList.length > 0) {
        triggerAppNotification(
          "🖨️ Impresoras Detectadas",
          `Se encontraron ${printersList.length} impresoras de Windows en el puerto ${portToUse}:\n${printersList.join(", ")}`,
          "success"
        );
      } else {
        triggerAppNotification(
          "⚠️ Centinela sin respuesta",
          `No se detectó respuesta del Centinela en http://localhost:${portToUse}. Asegúrate de tener iniciado el servicio local (sentinel_printer.py).`,
          "warning"
        );
      }
    } catch (err: any) {
      console.error("Error al cargar impresoras de Windows:", err);
      triggerAppNotification(
        "❌ Error al Buscar Impresoras",
        `Fallo al conectar con http://localhost:${portToUse}.`,
        "error"
      );
    } finally {
      setIsSentinelLoading(false);
    }
  };

  useEffect(() => {
    if (showBluetoothConfigModal) {
      fetchWindowsPrinters();
    }
  }, [showBluetoothConfigModal, selectedTenant?.id]);


  const [ticketBusinessName, setTicketBusinessName] = useState<string>(
    "Taquería El Pastorcito",
  );
  const [ticketRfc, setTicketRfc] = useState<string>("XAXX010101000");
  const [ticketSucursal, setTicketSucursal] =
    useState<string>("Sucursal Centro");
  const [ticketFooterMessage, setTicketFooterMessage] = useState<string>(
    "¡Gracias por su visita! Vuelva pronto 🌮",
  );
  const [ticketGeminiApiKey, setTicketGeminiApiKey] = useState<string>("");
  const [ticketRequireInternalFolio, setTicketRequireInternalFolio] = useState<boolean>(false);
  const [ticketRegimenFiscal, setTicketRegimenFiscal] = useState<string>("601 - General de Ley Personas Morales");
  const [ticketDireccionFiscal, setTicketDireccionFiscal] = useState<string>("");
  const [ticketLugarExpedicion, setTicketLugarExpedicion] = useState<string>("");
  const [ticketTelefono, setTicketTelefono] = useState<string>("");
  const [ticketEmail, setTicketEmail] = useState<string>("");

  const [companyConfig, setCompanyConfig] = useState<{
    businessName: string;
    rfc: string;
    sucursal: string;
    footerMessage: string;
    geminiApiKey: string;
    regimenFiscal?: string;
    direccionFiscal?: string;
    lugarExpedicion?: string;
    telefono?: string;
    email?: string;
    logoUrl?: string;
    useRawBt?: boolean;
  }>(() => {
    try {
      const cached = localStorage.getItem("company_config");
      return cached
        ? {
            geminiApiKey: "",
            logoUrl: "",
            useRawBt: false,
            regimenFiscal: "601 - General de Ley Personas Morales",
            direccionFiscal: "",
            lugarExpedicion: "",
            telefono: "",
            email: "",
            ...JSON.parse(cached),
          }
        : {
            businessName: "Taquería El Pastorcito",
            rfc: "XAXX010101000",
            sucursal: "Sucursal Centro",
            footerMessage: "¡Gracias por su visita! Vuelva pronto 🌮",
            geminiApiKey: "",
            regimenFiscal: "601 - General de Ley Personas Morales",
            direccionFiscal: "",
            lugarExpedicion: "",
            telefono: "",
            email: "",
            logoUrl: "",
            useRawBt: false,
          };
    } catch {
      return {
        businessName: "Taquería El Pastorcito",
        rfc: "XAXX010101000",
        sucursal: "Sucursal Centro",
        footerMessage: "¡Gracias por su visita! Vuelva pronto 🌮",
        geminiApiKey: "",
        logoUrl: "",
        useRawBt: false,
      };
    }
  });

  // Guided cash box workflow states for cashiers
  const [guidedFlowStep, setGuidedFlowStep] = useState<
    | "init"
    | "in_concept"
    | "out_concept"
    | "select_user"
    | "select_supplier"
    | "fill_details"
  >("init");
  const [guidedType, setGuidedType] = useState<"in" | "out">("in");
  const [guidedConcept, setGuidedConcept] = useState<string>("");
  const [guidedSelectedUser, setGuidedSelectedUser] = useState<string>("");
  const [guidedSelectedSupplier, setGuidedSelectedSupplier] =
    useState<string>("");
  const [guidedAmount, setGuidedAmount] = useState<string>("");
  const [guidedDescription, setGuidedDescription] = useState<string>("");
  const [showArqueoFormModal, setShowArqueoFormModal] = useState(false);

  // Denominations for cash counts
  const [arq1000, setArq1000] = useState<string>("");
  const [arq500, setArq500] = useState<string>("");
  const [arq200, setArq200] = useState<string>("");
  const [arq100, setArq100] = useState<string>("");
  const [arq50, setArq50] = useState<string>("");
  const [arq20, setArq20] = useState<string>("");
  const [arqM10, setArqM10] = useState<string>("");
  const [arqM5, setArqM5] = useState<string>("");
  const [arqM2, setArqM2] = useState<string>("");
  const [arqM1, setArqM1] = useState<string>("");
  const [arqM05, setArqM05] = useState<string>("");

  const [notificationsList, setNotificationsList] = useState([
    {
      id: "1",
      title: "🛎️ Servicio Activo",
      body: "Pedidos en tiempo real vía WebSockets sincronizados.",
      time: "Hace un momento",
      read: false,
    },
    {
      id: "2",
      title: "🍳 Notificación de Cocina",
      body: "Los platillos de la Mesa 2 están listos para servirse.",
      time: "Hace 5 minutos",
      read: false,
    },
    {
      id: "3",
      title: "💳 Pago Confirmado",
      body: "La cuenta de la Mesa 4 ha sido pagada con Tarjeta.",
      time: "Hace 15 minutos",
      read: true,
    },
  ]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Reloj en tiempo real de México 🇲🇽
  const [mexicoTime, setMexicoTime] = useState<string>("");
  const [mexicoClockShort, setMexicoClockShort] = useState<string>("");

  useEffect(() => {
    const updateMexicoClock = () => {
      try {
        const now = new Date();
        const shortFormatter = new Intl.DateTimeFormat("es-MX", {
          timeZone: "America/Mexico_City",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        const longFormatter = new Intl.DateTimeFormat("es-MX", {
          timeZone: "America/Mexico_City",
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setMexicoClockShort(shortFormatter.format(now));

        let longStr = longFormatter.format(now);
        if (longStr) {
          longStr = longStr.charAt(0).toUpperCase() + longStr.slice(1);
        }
        setMexicoTime(longStr);
      } catch (err) {
        console.error("Error setting clock:", err);
      }
    };
    updateMexicoClock();
    const intervalId = setInterval(updateMexicoClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Estados Pro para Módulo de Gastos y Proveedores en Corte de Caja MX 🇲🇽
  const [showGastoRegisterModal, setShowGastoRegisterModal] = useState(false);
  const [gastoCategory, setGastoCategory] = useState<string>("abarrotes");
  const [gastoDescription, setGastoDescription] = useState<string>("");
  const [gastoItems, setGastoItems] = useState<any[]>([]);
  const [gastoItemName, setGastoItemName] = useState<string>("");
  const [gastoItemQty, setGastoItemQty] = useState<string>("");
  const [gastoItemPrice, setGastoItemPrice] = useState<string>("");

  const [showSupplierPurchaseModal, setShowSupplierPurchaseModal] =
    useState(false);
  const [selectedScheduleSupplier, setSelectedScheduleSupplier] = useState<
    any | null
  >(null);
  const [supplierPurchaseItems, setSupplierPurchaseItems] = useState<any[]>([]);
  const [supplierPurchaseIsPaid, setSupplierPurchaseIsPaid] =
    useState<boolean>(true);

  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);

  const triggerAppNotification = (
    title: string,
    body: string,
    type: "info" | "success" | "warning" = "info",
    metadata?: any
  ) => {
    const newNotif = {
      id: String(Date.now() + Math.random()),
      title: title,
      body: body,
      time: "Ahora mismo",
      read: false,
      tenantId: selectedTenant?.id || "tenant-7",
      ...metadata,
    };

    if (
      metadata?.isCancellationRequest || 
      metadata?.isClosedAccountCancellationRequest ||
      metadata?.isComandaNotification ||
      metadata?.isCuentaNotification
    ) {
      addNotificationToFirebase(newNotif).catch((err) => {
        console.error("Error writing notification to Firebase:", err);
      });
    }
    
    setNotificationsList((prev) => {
      // Avoid duplicate items if Firebase snapshot triggers quickly
      if (prev.some((n) => n.id === newNotif.id)) return prev;
      return [newNotif, ...prev];
    });

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch (e) {
        console.warn("Error native Notification:", e);
      }
    }

    setMenuToastMessage(`${title}\n${body}`);
    setShowMenuToast(true);
  };

  // Escuchar eventos y errores de impresión globalmente y monitorear el Sentinela (Puerto 3010) 🖨️⚡
  useEffect(() => {
    const handlePrinterEvent = (e: any) => {
      const { title, message, type } = e.detail || {};
      if (title && message) {
        triggerAppNotification(title, message, type || "warning");
      }
    };
    window.addEventListener("cocinet-printer-event", handlePrinterEvent);

    if (isWindows()) {
      const port = windowsPrinterPort || "3010";
      startPrinterSentinelMonitor(port, 20000);
    }

    return () => {
      window.removeEventListener("cocinet-printer-event", handlePrinterEvent);
    };
  }, [windowsPrinterPort]);

  const handleSupportAction = (type: "phone" | "whatsapp" | "video", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === "phone") {
      triggerAppNotification(
        "📞 Llamando a Soporte",
        "Iniciando llamada de soporte al 951-127-3796...",
        "info"
      );
      try {
        window.location.href = "tel:9511273796";
      } catch (err) {
        console.error("Error initiating tel link:", err);
      }
    } else if (type === "whatsapp") {
      const message = encodeURIComponent("Hola Cocinet, necesito soporte técnico con mi base de datos/sincronización 🛠️");
      const url = `https://wa.me/529511273796?text=${message}`;
      triggerAppNotification(
        "💬 Abriendo WhatsApp",
        "Redirigiendo a WhatsApp de Soporte (951-127-3796)...",
        "success"
      );
      try {
        const w = window.open(url, "_blank");
        if (!w) {
          window.location.href = url;
        }
      } catch (err) {
        window.location.href = url;
      }
    } else if (type === "video") {
      const message = encodeURIComponent("Hola Cocinet, me gustaría ver el video tutorial o preguntas frecuentes de la app 🎬");
      const url = `https://wa.me/529511273796?text=${message}`;
      triggerAppNotification(
        "🎬 Video Tutorial / FAQ",
        "Solicitando acceso al video tutorial de Cocinet en WhatsApp...",
        "info"
      );
      try {
        const w = window.open(url, "_blank");
        if (!w) {
          window.location.href = url;
        }
      } catch (err) {
        window.location.href = url;
      }
    }
  };

  const handleReturnToSucursalesCatalog = () => {
    setIsSwitchingTenant(true);
    setSwitchingTenantName("Catálogo de Sucursales");
    
    setTables([]);
    setHistory([]);
    setInventory([]);
    setSelectedTableId(null);
    
    setSelectedTenant(null as any);
    setCurrentUser(null as any);
    setLoginSubStep("tenant");
    
    setTimeout(() => {
      setIsSwitchingTenant(false);
    }, 450);

    triggerAppNotification(
      "🏠 Regreso a Sucursales",
      "Selecciona la sucursal que deseas consultar o supervisar.",
      "info"
    );
  };

  const handleSelectCompanyWithPinCheck = (
    company: CompanyTenant,
    context: "login" | "admin",
  ) => {
    setIsSwitchingTenant(true);
    setSwitchingTenantName(company.name);
    setTables([]);
    setHistory([]);
    setInventory([]);
    setSelectedTableId(null);

    if (isOwnerUnlocked) {
      setSelectedTenant(company);
      if (context === "login") {
        const tenantUsers = getTenantUsers(company.id);
        const adminUser = tenantUsers.find((u) => u.id === `${company.id}-admin`) || 
                          tenantUsers.find((u) => u.id === `${company.id}-sistemas`) ||
                          tenantUsers[0];
        if (adminUser) {
          setCurrentUser(adminUser);
        }
        
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}

        if (adminUser && (adminUser.role === "admin" || adminUser.id.endsWith("-sistemas"))) {
          setAppMode("corte-tabla");
        } else {
          setAppMode(getPreferredTablesMode());
        }
        triggerAppNotification(
          "🏢 Acceso Autorizado",
          `Conectado a la sucursal: ${company.name} ⭐ (Cargando datos en vivo)`,
          "success",
        );
        const newWsEvent = {
          id: "ws-tenant-" + Date.now(),
          uid: "tenant-uuid-" + company.id,
          event: "TENANT_SWITCH",
          topic: `sync:auth_isolate`,
          timestamp: getMexicoISOString(),
          details: `🔌 Acceso directo de propietario/supervisor para la sucursal [${company.name}] | Base de datos sincronizada continuamente.`,
        };
        setWebsocketSyncLog((prev) => [newWsEvent, ...prev]);
      } else {
        triggerAppNotification(
          "🏢 Matriz Conectada - Panel Administrativo",
          `Has ingresado al panel de administración para: ${company.name} ⭐`,
          "success",
        );
        const newWsEvent = {
          id: "ws-admin-tenant-" + Date.now(),
          uid: "tenant-uuid-" + company.id,
          event: "ADMIN_TENANT_SWITCH",
          topic: `sync:auth_isolate`,
          timestamp: getMexicoISOString(),
          details: `🔌 Panel administrativo accedido para: [${company.name}]`,
        };
        setWebsocketSyncLog((prev) => [newWsEvent, ...prev]);
      }

      setTimeout(() => {
        setIsSwitchingTenant(false);
      }, 900);
      return;
    }

    setIsSwitchingTenant(false);
    setPendingTenant(company);
    setPendingTenantContext(context);
    setTypedPin("");
    setShowTenantPinModal(true);
  };

  const handlePinNumericPress = (action: string) => {
    if (action === "CLEAR") {
      setTypedPin("");
    } else if (action === "BACKSPACE") {
      setTypedPin((prev) => prev.slice(0, -1));
    } else {
      if (typedPin.length < 4) {
        const nextPin = typedPin + action;
        setTypedPin(nextPin);

        let isValidPin = false;
        let matchedRole = "Usuario";

        if (pendingTenant) {
          let parsedNum = parseInt(pendingTenant.id.replace(/[^0-9]/g, ""), 10);
          if (isNaN(parsedNum) || parsedNum <= 0) parsedNum = 1;
          const tenantNum = (parsedNum % 100) || 1;
          const oPin = (2026 + tenantNum).toString();
          const mPin = (1526 + tenantNum).toString();
          const sPin = "4020";
          const c1Pin = (1026 + tenantNum).toString();
          const c2Pin = (1126 + tenantNum).toString();
          const g1Pin = (126 + tenantNum).toString().padStart(4, "0");
          const g2Pin = (226 + tenantNum).toString().padStart(4, "0");
          const g3Pin = (326 + tenantNum).toString().padStart(4, "0");

          if (nextPin === oPin) {
            isValidPin = true;
            matchedRole = "Patrón (Dueño)";
          } else if (nextPin === mPin) {
            isValidPin = true;
            matchedRole = "Gerente (Administrador)";
          } else if (nextPin === sPin) {
            isValidPin = true;
            matchedRole = "Sistemas";
          } else if (nextPin === c1Pin) {
            isValidPin = true;
            matchedRole = "Cajero 1";
          } else if (nextPin === c2Pin) {
            isValidPin = true;
            matchedRole = "Cajero 2";
          } else if (nextPin === g1Pin || nextPin === g2Pin || nextPin === g3Pin) {
            isValidPin = true;
            matchedRole = "Mesero";
          } else if (nextPin === "2026" || nextPin === "2027") {
            isValidPin = true;
            matchedRole = "Acceso Maestro";
          }
        }

        if (isValidPin) {
          if (pendingTenant) {
            setIsSwitchingTenant(true);
            setSwitchingTenantName(pendingTenant.name);
            setTables([]);
            setHistory([]);
            setInventory([]);
            setSelectedTableId(null);

            setSelectedTenant(pendingTenant);
            if (pendingTenantContext === "login") {
              setLoginSubStep("user");
              triggerAppNotification(
                "🏢 Acceso Autorizado",
                `Conectado a ${pendingTenant.name} como [${matchedRole}]. Sincronizando datos...`,
                "success",
              );
              const newWsEvent = {
                id: "ws-tenant-" + Date.now(),
                uid: "tenant-uuid-" + pendingTenant.id,
                event: "TENANT_SWITCH",
                topic: `sync:auth_isolate`,
                timestamp: getMexicoISOString(),
                details: `🔌 Handshake completado para [${matchedRole}]: [${pendingTenant.ownerEmail}] | Base de datos sincronizada.`,
              };
              setWebsocketSyncLog((prev) => [newWsEvent, ...prev]);
            } else {
              triggerAppNotification(
                "🏢 Matriz Conectada",
                `Has cambiado a: ${pendingTenant.name} ⭐ (Acceso como ${matchedRole})`,
                "success",
              );
              const newWsEvent = {
                id: "ws-admin-tenant-" + Date.now(),
                uid: "tenant-uuid-" + pendingTenant.id,
                event: "ADMIN_TENANT_SWITCH",
                topic: `sync:auth_isolate`,
                timestamp: getMexicoISOString(),
                details: `🔌 Cambio de entorno administrativo autorizandose como [${matchedRole}] para: [${pendingTenant.name}].`,
              };
              setWebsocketSyncLog((prev) => [newWsEvent, ...prev]);
            }

            setTimeout(() => {
              setIsSwitchingTenant(false);
            }, 900);
          }
          setShowTenantPinModal(false);
          setPendingTenant(null);
          setTypedPin("");
        } else if (nextPin.length === 4) {
          triggerAppNotification(
            "🔒 PIN Incorrecto",
            "El código de seguridad ingresado es incorrecto para este punto de venta. Vuelva a intentarlo.",
            "warning",
          );
          setTimeout(() => {
            setTypedPin("");
          }, 350);
        }
      }
    }
  };

  const handleSwitchBranch = (company: CompanyTenant) => {
    setIsSwitchingTenant(true);
    setSwitchingTenantName(company.name);
    setTables([]);
    setHistory([]);
    setInventory([]);
    setSelectedTableId(null);

    setSelectedTenant(company);
    localStorage.setItem("pos_selected_tenant", JSON.stringify(company));

    if (currentUser) {
      const isSistemas = currentUser.id.endsWith("-sistemas");
      const isPropietario = currentUser.id.endsWith("-admin") || currentUser.role === "owner" || currentUser.role === "supervisor";

      if (isSistemas) {
        setCurrentUser({
          ...currentUser,
          id: `${company.id}-sistemas`
        });
      } else if (isPropietario) {
        let ownerDisplayName = "Propietario";
        if (company.ownerKey === "1") ownerDisplayName = "Soraya & Jorge";
        else if (company.ownerKey === "2") ownerDisplayName = "Evelin";
        else if (company.ownerKey === "3") ownerDisplayName = "Armando";
        else if (company.ownerKey === "4") ownerDisplayName = "El Mero Mero";
        else if (company.ownerKey === "5") ownerDisplayName = "San Sebastián";
        else ownerDisplayName = company.propietario;

        const isSuper = currentUser.role === "supervisor";
        setCurrentUser({
          ...currentUser,
          id: `${company.id}-${isSuper ? 'supervisor' : 'admin'}`,
          name: isSuper ? `Supervisor: ${ownerDisplayName} 📋` : `Propietario: ${ownerDisplayName} 👑`,
          role: isSuper ? "supervisor" : "owner",
          avatar: isSuper ? "fa-solid fa-user-gear" : (company.avatar === "🤠" ? "fa-solid fa-hat-cowboy" : "fa-solid fa-user-shield"),
        });
      }
    }

    setShowBranchSwitcherModal(false);

    setTimeout(() => {
      setIsSwitchingTenant(false);
    }, 900);

    triggerAppNotification(
      "🏢 Sucursal Cambiada",
      `Te has cambiado con éxito a la sucursal: ${company.name}`,
      "success"
    );
  };










  const handleScanBluetoothDevice = async (area: "cuentas" | "cocina" | "barra" = "cuentas") => {
    if (!WebBluetoothTransport.isSupported()) {
      const msg = `⚠️ Web Bluetooth no está soportado o requiere HTTPS.\n\n` +
        `Como estás accediendo desde el celular por HTTP, la búsqueda automática de Bluetooth no es posible por razones de seguridad de Chrome.\n\n` +
        `Para configurar tu impresora:\n` +
        `1. Escribe el nombre exacto de la impresora Bluetooth en el cuadro de texto (ej. el nombre que tiene vinculada en tu teléfono).\n` +
        `2. Selecciona la opción 'App RawBT (Android)' como tu Modo de Conexión Principal en la parte superior.`;
      
      window.alert(msg);
      triggerAppNotification("⚠️ Bluetooth no soportado", msg, "warning");
      return;
    }

    setIsScanningBt(true);
    try {
      const res = await WebBluetoothTransport.scanAndConnect(area);
      if (res.success && res.deviceName) {
        setConnectedBtDeviceName(res.deviceName);
        localStorage.setItem("bt_connected_device_name", res.deviceName);

        // Mapear y guardar al alias/impresora del área seleccionada
        if (area === "cuentas") {
          setBluetoothPrinterCuentas(res.deviceName);
          localStorage.setItem("bluetooth_printer_cuentas", res.deviceName);
        } else if (area === "cocina") {
          setBluetoothPrinterCocina(res.deviceName);
          localStorage.setItem("bluetooth_printer_cocina", res.deviceName);
        } else if (area === "barra") {
          setBluetoothPrinterBarra(res.deviceName);
          localStorage.setItem("bluetooth_printer_barra", res.deviceName);
        }

        // Actualizar estado de conexión activa
        setActiveBtConnections(prev => ({ ...prev, [area]: true }));

        const msg = `Impresora Bluetooth vinculada a ${area === "cuentas" ? "Cuentas" : area === "cocina" ? "Cocina" : "Barra"}: ${res.deviceName} 🖨️`;
        window.alert(`✅ ¡Éxito!\n\n${msg}`);
        triggerAppNotification("🖨️ Impresora Vinculada", msg, "success");
      } else if (res.error) {
        window.alert(`⚠️ Error Bluetooth: ${res.error}`);
        triggerAppNotification("⚠️ Error Bluetooth", res.error, "warning");
      }
    } catch (err: any) {
      console.error("Error al buscar dispositivo Bluetooth:", err);
      const msg = `No se conectó impresora Bluetooth: ${err?.message || "Cancelado"}`;
      window.alert(`❌ Error de Conexión\n\n${msg}`);
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleTestPrinter = async (area: "cuentas" | "cocina" | "barra" = "cuentas", printerName?: string) => {
    try {
      await sendTestReceipt(area, printerName || "Impresora de Prueba", selectedTenant?.id);
      const msg = `Ticket de prueba enviado a ${area === "cuentas" ? "Cuentas" : area === "cocina" ? "Cocina" : "Barra"}`;
      window.alert(`✅ ¡Éxito!\n\n${msg}`);
      triggerAppNotification("📄 Ticket de Prueba", msg, "success");
    } catch (err: any) {
      console.error("Error al enviar prueba de impresión:", err);
      const msg = `Error al imprimir prueba: ${err?.message || "Error de conexión"}`;
      window.alert(`❌ Error al Imprimir\n\n${msg}`);
      triggerAppNotification("❌ Error al Imprimir", msg, "warning");
    }
  };

  const renderDeliverySetupModal = () => {
    if (!showDeliverySetupModal) return null;

    const filteredCustomers = customers.filter(c => {
      if (!deliverySearchQuery.trim()) return true;
      const q = deliverySearchQuery.toLowerCase().trim();
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.addresses || []).some((a: string) => a.toLowerCase().includes(q))
      );
    });

    return (
<DeliverySetupModal
          deliveryNotes={deliveryNotes}
          deliverySearchQuery={deliverySearchQuery}
          handleAddNewDeliveryAddressOnTheFly={handleAddNewDeliveryAddressOnTheFly}
          handleRegisterAndSelectDeliveryClient={handleRegisterAndSelectDeliveryClient}
          handleSaveDeliverySetup={handleSaveDeliverySetup}
          handleSelectDeliveryClient={handleSelectDeliveryClient}
          isRegisteringDeliveryClient={isRegisteringDeliveryClient}
          newDeliveryClientAddress={newDeliveryClientAddress}
          newDeliveryClientAddressRef={newDeliveryClientAddressRef}
          newDeliveryClientName={newDeliveryClientName}
          newDeliveryClientPhone={newDeliveryClientPhone}
          onTheFlyAddressInput={onTheFlyAddressInput}
          onTheFlyAddressRefInput={onTheFlyAddressRefInput}
          renderMaterialHeader={renderMaterialHeader}
          selectedDeliveryAddress={selectedDeliveryAddress}
          selectedDeliveryClient={selectedDeliveryClient}
          selectedTable={selectedTable}
          setAppMode={setAppMode}
          setDeliveryNotes={setDeliveryNotes}
          setDeliverySearchQuery={setDeliverySearchQuery}
          setIsRegisteringDeliveryClient={setIsRegisteringDeliveryClient}
          setNewDeliveryClientAddress={setNewDeliveryClientAddress}
          setNewDeliveryClientAddressRef={setNewDeliveryClientAddressRef}
          setNewDeliveryClientName={setNewDeliveryClientName}
          setNewDeliveryClientPhone={setNewDeliveryClientPhone}
          setOnTheFlyAddressInput={setOnTheFlyAddressInput}
          setOnTheFlyAddressRefInput={setOnTheFlyAddressRefInput}
          setSelectedDeliveryAddress={setSelectedDeliveryAddress}
          setSelectedDeliveryClient={setSelectedDeliveryClient}
          setShowDeliverySetupModal={setShowDeliverySetupModal}
          showDeliverySetupModal={showDeliverySetupModal}
          filteredCustomers={filteredCustomers}
        />
    );
  };



  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccountForPayment, setSelectedAccountForPayment] =
    useState<ClosedAccount | null>(null);

  // Real-time synchronization to automatically kick user out of table/checkout view if table gets cancelled/liberated on another device 🔄
  useEffect(() => {
    if (selectedTableId && (appMode === "checkout" || appMode === "table-details")) {
      const freshTable = tables.find((t) => t.id === selectedTableId);
      // If table became available/unoccupied or its comandas were cleared out, close checkout / details screen
      if (freshTable && (freshTable.status === "available" || !freshTable.comandas || freshTable.comandas.length === 0)) {
        triggerAppNotification(
          "⚠️ Mesa Liberada / Cancelada",
          `La Mesa ${freshTable.label} ha sido cancelada o liberada por un administrador. Retornando al mapa de mesas.`,
          "warning"
        );
        setAppMode("floorplan");
        setSelectedTableId(null);
        setCheckoutFallbackItems([]);
        setShowPaymentOptions(false);
      }
    }
  }, [tables, selectedTableId, appMode]);

  // Real-time synchronization to automatically close payment modal if the active payment account gets cancelled 🔄
  useEffect(() => {
    if (showPaymentModal && selectedAccountForPayment) {
      const freshAccount = history.find((h) => h.id === selectedAccountForPayment.id);
      if (freshAccount && freshAccount.status === "cancelled") {
        triggerAppNotification(
          "🚫 Cuenta Cancelada",
          `La cuenta de la Mesa ${freshAccount.tableLabel || "General"} ha sido cancelada por un administrador. No se puede cobrar.`,
          "warning"
        );
        setShowPaymentModal(false);
        setSelectedAccountForPayment(null);
      }
    }
  }, [history, showPaymentModal, selectedAccountForPayment]);
  const [showCashMovementModal, setShowCashMovementModal] = useState(false);
  const [cashMovementForm, setCashMovementForm] = useState<{
    type: "in" | "out";
    concept: "nomina" | "retiro" | "dotacion" | "fondo" | "otro";
    amount: string;
    description: string;
  }>({ type: "out", concept: "retiro", amount: "", description: "" });

  const [paymentAmountReceived, setPaymentAmountReceived] =
    useState<string>("");
  const [paymentCardLastFour, setPaymentCardLastFour] = useState<string>("");
  const [requiresInvoice, setRequiresInvoice] = useState<boolean>(false);
  const [invoicePhone, setInvoicePhone] = useState<string>("");
  const [showInvoicePhoneModal, setShowInvoicePhoneModal] = useState<boolean>(false);
  const [inputInvoicePhone, setInputInvoicePhone] = useState<string>("");
  const [inputInvoicePhoneConfirm, setInputInvoicePhoneConfirm] = useState<string>("");
  const [invoicePhoneError, setInvoicePhoneError] = useState<string>("");
    const [editingInvoiceAccountId, setEditingInvoiceAccountId] = useState<string | null>(null);
  const [editingInvoicePhoneValue, setEditingInvoicePhoneValue] = useState<string>("");
const [pendingInvoiceTarget, setPendingInvoiceTarget] = useState<{
    type: "activeTable" | "closedAccount";
    account?: any;
  } | null>(null);
  const [showNumpad, setShowNumpad] = useState(false);
  const [showTopCortePanel, setShowTopCortePanel] = useState(false);
  const [cortePanelTab, setCortePanelTab] = useState<"cuentas" | "cargos">("cuentas");
  const [checkedAccounts, setCheckedAccounts] = useState<Record<string, boolean>>({});
  const [validationPhysicalAmount, setValidationPhysicalAmount] = useState<string>("");
  const [validationNotes, setValidationNotes] = useState<string>("");
  const [isSavingValidation, setIsSavingValidation] = useState<boolean>(false);
  const [numpadValue, setNumpadValue] = useState("");
  const [numpadTotal, setNumpadTotal] = useState(0);
  const [numpadTarget, setNumpadTarget] = useState<
    | "checkout"
    | "closed_account"
    | "card_digits"
    | "discount_target"
    | "discount_value"
    | "tip_target"
    | "tip_value"
  >("checkout");
  const [isNumpadValueFresh, setIsNumpadValueFresh] = useState(true);

  const openNumpad = (
    value: string,
    total: number,
    target:
      | "checkout"
      | "closed_account"
      | "card_digits"
      | "discount_target"
      | "discount_value"
      | "tip_target"
      | "tip_value",
  ) => {
    setNumpadValue(value);
    setNumpadTotal(total);
    setNumpadTarget(target);
    setIsNumpadValueFresh(true);
    setShowNumpad(true);
  };

  const handleNumpadConfirm = (valueStrRaw: any) => {
    const valueStr = typeof valueStrRaw === "string" ? valueStrRaw : String(numpadValue);
    const val = valueStr || "0";
    const numVal = parseFloat(val) || 0;
    const checkoutSubtotal = (() => {
      const tableItems = (selectedTable?.comandas || []).flatMap((c) => c?.items || []) || [];
      const allItems = tableItems.length > 0 ? tableItems : checkoutFallbackItems;
      return allItems
        .filter((item) => !item.isCancelled)
        .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    })();

    if (numpadTarget === "card_digits") {
      setPaymentCardLastFour(valueStr.slice(0, 4));
    } else if (numpadTarget === "discount_target") {
      setPaymentDiscountTarget(valueStr);
      if (numVal > 0) {
        const activeSubtotal = selectedAccountForPayment
          ? selectedAccountForPayment.subtotal
          : checkoutSubtotal;
        const activeTip = paymentTipValue;
        const currentTotalWithoutDiscount = activeSubtotal + activeTip;
        const newDiscount = Math.max(0, currentTotalWithoutDiscount - numVal);
        setPaymentDiscountValue(Math.round(newDiscount));
        setPaymentDiscountType("amount");
      }
    } else if (numpadTarget === "discount_value") {
      setPaymentDiscountValue(Math.round(numVal));
      setPaymentDiscountTarget("");
    } else if (numpadTarget === "tip_target") {
      setPaymentTipTarget(valueStr);
      if (numVal > 0) {
        const activeSubtotal = selectedAccountForPayment
          ? selectedAccountForPayment.subtotal
          : checkoutSubtotal;
        const currentDiscount = selectedAccountForPayment
          ? (paymentDiscountType === "percent"
              ? activeSubtotal * (paymentDiscountValue / 100)
              : paymentDiscountValue)
          : (paymentDiscountType === "percent"
              ? checkoutSubtotal * (paymentDiscountValue / 100)
              : paymentDiscountValue);
        const currentTotalWithoutTip = activeSubtotal - Math.round(currentDiscount);
        const newTip = Math.max(0, numVal - currentTotalWithoutTip);
        setPaymentTipValue(Math.round(newTip));
      }
    } else if (numpadTarget === "tip_value") {
      setPaymentTipValue(Math.round(numVal));
      setPaymentTipTarget("");
    } else {
      setPaymentAmountReceived(valueStr || "0");
    }
    setShowNumpad(false);
  };

  // Escuchar teclado físico para el panel numérico de cobro 🔢⌨️
  useEffect(() => {
    if (!showNumpad) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        if (numpadTarget === "card_digits") {
          if (isNumpadValueFresh) {
            setNumpadValue(key);
            setIsNumpadValueFresh(false);
          } else if (numpadValue.length < 4) {
            setNumpadValue((prev) => prev + key);
          }
        } else {
          if (isNumpadValueFresh) {
            setNumpadValue(key);
            setIsNumpadValueFresh(false);
          } else {
            setNumpadValue((prev) => (prev === "0" ? key : prev + key));
          }
        }
      } else if (key === "." || key === ",") {
        e.preventDefault();
        if (numpadTarget === "card_digits") return; // No decimals for last 4 digits
        if (isNumpadValueFresh) {
          setNumpadValue("0.");
          setIsNumpadValueFresh(false);
        } else if (!numpadValue.includes(".")) {
          setNumpadValue((prev) => (prev === "" ? "0." : prev + "."));
        }
      } else if (key === "Backspace") {
        e.preventDefault();
        setNumpadValue((prev) => prev.slice(0, -1));
      } else if (key === "Escape" || key === "c" || key === "C" || key === "Delete") {
        e.preventDefault();
        setNumpadValue("");
      } else if (key === "Enter") {
        e.preventDefault();
        handleNumpadConfirm(numpadValue);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNumpad, numpadValue, isNumpadValueFresh, numpadTarget, handleNumpadConfirm]);
  const [paymentPassword, setPaymentPassword] = useState<string>("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [cancellationPin, setCancellationPin] = useState("");
  const [corteFilterUserId, setCorteFilterUserId] = useState<string>("ALL");
  const [corteTablaSessionSelected, setCorteTablaSessionSelected] =
    useState<CashierSession | null>(null);
  const [corteViewMode, setCorteViewMode] = useState<"current" | "history">("current");
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  const [historySortOrder, setHistorySortOrder] = useState<"desc" | "asc">("desc");
  const [corteActionFilter, setCorteActionFilter] = useState<"all" | "validated" | "pending">("all");
  const [expandedSessionDetails, setExpandedSessionDetails] = useState<Record<string, boolean>>({});

  // 🚀 Exportar Corte a otro Tenant (Multitenant - Rol Sistemas)
  const [exportSessionModal, setExportSessionModal] = useState<CashierSession | null>(null);
  const [exportTargetTenantId, setExportTargetTenantId] = useState<string>("");
  const [exportModalStep, setExportModalStep] = useState<1 | 2>(1);
  const [isExportingSession, setIsExportingSession] = useState<boolean>(false);



  // ⚡ Concurrency safety: listen to realtime cashierSessions.
  // If the currently viewed open session was closed by another device, notify the user and throw them out.
  useEffect(() => {
    if (appMode === "corte-tabla" && corteTablaSessionSelected) {
      if (corteTablaSessionSelected.status === "open") {
        const latestSessionState = cashierSessions.find(
          (s) => s.id === corteTablaSessionSelected.id
        );
        if (latestSessionState && latestSessionState.status === "closed") {
          triggerAppNotification(
            "🔒 TURNO CERRADO DESDE OTRA TERMINAL",
            `El turno de ${latestSessionState.userName} ha sido cerrado desde otro dispositivo.`,
            "warning"
          );
          setCorteTablaSessionSelected(null);
          setAppMode("floorplan");
        }
      }
    }
  }, [cashierSessions, appMode, corteTablaSessionSelected]);

  // Default view mode initialized once

  const [pendingCancellation, setPendingCancellation] = useState<{
    type: "item" | "order";
    data: any;
  } | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showNumpadModal, setShowNumpadModal] = useState(false);
  const [showEditFondoModal, setShowEditFondoModal] = useState(false);
  const [editFondoValue, setEditFondoValue] = useState("");

  const handleLogin = () => {
    if (selectedLoginUser && loginPin === selectedLoginUser.pin) {
      setCurrentUser(selectedLoginUser);
      setLoginPin("");
      setSelectedLoginUser(null);

      // Apply role-based company privileges
      if (selectedLoginUser.id.endsWith("-sistemas")) {
        setIsOwnerUnlocked(true);
        setActiveOwnerFilter(null);
        localStorage.setItem("cocinet_is_owner_unlocked", "true");
        localStorage.removeItem("cocinet_active_owner_filter");
        
        setIsSystemsMode(true);
        localStorage.setItem("cocinet_is_systems", "true");
        setRestrictedOwnerKey(null);
        localStorage.removeItem("cocinet_restricted_owner_key");
      } else if (selectedLoginUser.id.endsWith("-admin")) {
        setIsOwnerUnlocked(true);
        setActiveOwnerFilter(selectedTenant.ownerKey);
        localStorage.setItem("cocinet_is_owner_unlocked", "true");
        localStorage.setItem("cocinet_active_owner_filter", selectedTenant.ownerKey);
        
        setIsSystemsMode(false);
        localStorage.setItem("cocinet_is_systems", "false");
        setRestrictedOwnerKey(selectedTenant.ownerKey);
        localStorage.setItem("cocinet_restricted_owner_key", selectedTenant.ownerKey);
      } else {
        setIsOwnerUnlocked(false);
        setActiveOwnerFilter(selectedTenant.ownerKey);
        localStorage.setItem("cocinet_is_owner_unlocked", "false");
        localStorage.setItem("cocinet_active_owner_filter", selectedTenant.ownerKey);
        
        setIsSystemsMode(false);
        localStorage.setItem("cocinet_is_systems", "false");
        setRestrictedOwnerKey(null);
        localStorage.removeItem("cocinet_restricted_owner_key");
      }
      
      // Redirect based on role
      if (selectedLoginUser.role === "mesero") {
        setAppMode(getPreferredTablesMode());
      } else {
        setAppMode("corte-tabla");
      }

      // ⚡ AUTO-REFRESH MESAS DESDE FIREBASE AL INICIAR SESIÓN
      if (selectedTenant?.id) {
        const tenantId = selectedTenant.id;
        fetchTablesFromFirebase(tenantId)
          .then((liveTables) => {
            if (liveTables && liveTables.length > 0) {
              const ensured = ensureAll35TablesForTenant(liveTables, tenantId);
              const parsed = ensured.map((t: any) => ({
                ...t,
                zone: normalizeZoneName(t.zone),
                comandas: (t.comandas || []).map((c: any) => ({
                  ...c,
                  timestamp:
                    c.timestamp && typeof c.timestamp.toDate === "function"
                      ? c.timestamp.toDate()
                      : new Date(c.timestamp),
                })),
              }));
              setTables(parsed);
              try {
                localStorage.setItem("pos_tables_" + tenantId, JSON.stringify(parsed));
              } catch (e) {}
            }
          })
          .catch((err) => console.warn("Error auto-refreshing tables on login:", err));
      }
    } else {
      alert("PIN incorrecto");
      setLoginPin("");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedLoginUser(null);
    setLoginSubStep("tenant"); // Changed from "user" to "tenant"
    setIsOwnerUnlocked(false);
    setActiveOwnerFilter(selectedTenant ? selectedTenant.ownerKey : null);
    
    // Clear user cache, but retain selected tenant to lock the device
    localStorage.removeItem("pos_current_user");
    localStorage.setItem("cocinet_is_owner_unlocked", "false");
    if (selectedTenant) {
      localStorage.setItem("cocinet_active_owner_filter", selectedTenant.ownerKey);
    }
    
    setIsMasterAdmin(false);
    localStorage.removeItem("pos_master_admin");

    setIsSystemsMode(false);
    localStorage.setItem("cocinet_is_systems", "false");
    setRestrictedOwnerKey(null);
    localStorage.removeItem("cocinet_restricted_owner_key");
    
    setIsUrlTokenSession(false);
    localStorage.removeItem("cocinet_is_url_token");
    
    setAppMode(getPreferredTablesMode());
  };

  const existingSubcategories = useMemo(() => {
    return Array.from(new Set(products.filter(p => p.isDeleted !== true).map((p) => p.subcategory || "").filter(Boolean).sort()));
  }, [products]);

  const crudCategorySubcategories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((p) => p.category === crudSelectedCategory)
          .map((p) => p.subcategory || "")
          .filter(Boolean)
          .sort(),
      ),
    );
  }, [products, crudSelectedCategory]);

  const existingSubgroups = useMemo(() => {
    return Array.from(new Set(products.filter(p => p.isDeleted !== true).map((p) => p.subgroup || "").filter(Boolean).sort()));
  }, [products]);

  const existingSubgroupsFiltered = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((p) => p.category === crudSelectedCategory)
          .map((p) => p.subgroup || "")
          .filter(Boolean)
          .sort(),
      ),
    );
  }, [products, crudSelectedCategory]);

  const activeSessionForCorte = useMemo(() => {
    if (corteViewMode === "history") {
      return corteTablaSessionSelected;
    }
    if (corteTablaSessionSelected) return corteTablaSessionSelected;
    const openSessions = cashierSessions.filter((s) => s.status === "open");
    if (openSessions.length === 1) return openSessions[0];

    if (corteViewMode === "current") {
      const currentOpDay = getOperatingDay(new Date());
      const tenantId = selectedTenant?.id || "tenant-1";
      const existing = cashierSessions.find((s) => s.id === `day-${tenantId}-${currentOpDay}`);
      if (existing) return existing;
      return {
        id: `day-${tenantId}-${currentOpDay}`,
        uid: `day-${tenantId}-${currentOpDay}`,
        tenantId: tenantId,
        userId: currentUser?.id || "system",
        userName: currentUser?.name || "Cajero Principal",
        openedAt: `${currentOpDay}T05:00:00.000Z`,
        closedAt: null,
        status: "open",
        dotacionInicial: Number(selectedTenant?.defaultStartingCash || 1000),
        cashSales: 0,
        cardSales: 0,
        transSales: 0,
        cashSalesCount: 0,
        cardSalesCount: 0,
        transSalesCount: 0,
        totalInflows: 0,
        totalOutflows: 0,
        totalPurchasesPaid: 0,
        estimatedCash: 0,
        arqueoTotal: 0,
        arqueoBilletes: 0,
        arqueoMonedas: 0,
        diferencia: 0,
        isValidated: false
      } as any;
    }
    return null;
  }, [cashierSessions, corteTablaSessionSelected, corteViewMode, selectedTenant, currentUser]);

  // Synchronize local state corteXFondoApertura with database active session or tenant config
  useEffect(() => {
    if (activeSessionForCorte) {
      setCorteXFondoApertura(Number(activeSessionForCorte.dotacionInicial || 0));
    } else if (selectedTenant) {
      setCorteXFondoApertura(Number(selectedTenant.defaultStartingCash || 1000));
    }
  }, [activeSessionForCorte, selectedTenant]);

  const saveCorteXFondoApertura = async (val: number) => {
    const currentOpDay = corteXSelectedDate || getOperatingDay(new Date());
    const tenantId = selectedTenant?.id || "tenant-1";
    const sessionId = `day-${tenantId}-${currentOpDay}`;
    
    try {
      const existing = cashierSessions.find((s) => s.id === sessionId);
      if (existing) {
        await updateCashierSessionInFirebase(sessionId, {
          ...existing,
          dotacionInicial: val,
          updatedAt: getMexicoISOString()
        });
        setCashierSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, dotacionInicial: val, updatedAt: getMexicoISOString() } : s))
        );
      } else {
        const newSession = {
          id: sessionId,
          uid: sessionId,
          tenantId,
          userId: currentUser?.id || "system",
          userName: currentUser?.name || `Día ${currentOpDay}`,
          openedAt: `${currentOpDay}T05:00:00.000Z`,
          closedAt: null,
          status: "open",
          dotacionInicial: val,
          arqueoTotal: 0,
          arqueoBilletes: 0,
          arqueoMonedas: 0,
          isValidated: false,
          updatedAt: getMexicoISOString()
        };
        await addCashierSessionToFirebase(newSession as any);
        setCashierSessions((prev) => [...prev, newSession as any]);
      }
      
      // Also update defaultStartingCash in selectedTenant
      if (selectedTenant) {
        const updatedTenant = {
          ...selectedTenant,
          defaultStartingCash: val
        };
        await addTenantToFirebase(updatedTenant);
        setSelectedTenant(updatedTenant);
      }
      
      triggerAppNotification("💰 Fondo Guardado", `El fondo de caja inicial se actualizó a $${val.toFixed(2)}`, "success");
    } catch (err) {
      console.error("Error saving initial cash fund:", err);
      triggerAppNotification("Error", "No se pudo actualizar el fondo en el servidor", "warning");
    }
  };

  const historyForCuentasTab = useMemo(() => {
    const currentOpDay = getOperatingDay(new Date());
    return history.filter((h) => {
      return getOperatingDay(h.timestamp) === currentOpDay;
    });
  }, [history]);

  const filteredHistoryForCorte = useMemo(() => {
    return history.filter((h) => {
      const targetUser = users.find((u) => u.id === corteFilterUserId);
      const matchesUser =
        corteFilterUserId === "ALL" ||
        h.createdBy === corteFilterUserId ||
        (targetUser && h.createdBy === targetUser.name) ||
        h.cancelledBy?.id === corteFilterUserId ||
        (targetUser && h.cancelledBy?.name === targetUser.name);
      
      const matchesSession = activeSessionForCorte
        ? getOperatingDay(h.timestamp) === activeSessionForCorte.id.split("-").slice(-3).join("-")
        : true;
        
      return matchesUser && matchesSession;
    });
  }, [history, corteFilterUserId, activeSessionForCorte, users]);

  const filteredCashMovementsForCorte = useMemo(() => {
    return cashMovements.filter((m) => {
      const targetUser = users.find((u) => u.id === corteFilterUserId);
      const matchesUser =
        corteFilterUserId === "ALL" ||
        m.userId === corteFilterUserId ||
        (targetUser && m.user === targetUser.name);
      
      const matchesSession = activeSessionForCorte
        ? getOperatingDay(m.timestamp || m.date || new Date()) === activeSessionForCorte.id.split("-").slice(-3).join("-")
        : true;
        
      return matchesUser && matchesSession;
    });
  }, [cashMovements, corteFilterUserId, users, activeSessionForCorte]);

  const filteredExpensesForCorte = useMemo(() => {
    return expenses.filter((e) => {
      const targetUser = users.find((u) => u.id === corteFilterUserId);
      const matchesUser =
        corteFilterUserId === "ALL" ||
        e.userId === corteFilterUserId ||
        (targetUser && e.createdBy === targetUser.name);
      
      const matchesSession = activeSessionForCorte
        ? (e.createdAt && getOperatingDay(e.createdAt) === activeSessionForCorte.id.split("-").slice(-3).join("-"))
        : true;
        
      return matchesUser && matchesSession;
    });
  }, [expenses, corteFilterUserId, users, activeSessionForCorte]);

  const filteredPurchasesForCorte = useMemo(() => {
    return purchases.filter((p) => {
      const targetUser = users.find((u) => u.id === corteFilterUserId);
      const matchesUser =
        corteFilterUserId === "ALL" ||
        p.userId === corteFilterUserId ||
        (targetUser && p.createdBy === targetUser.name);
      
      const matchesSession = activeSessionForCorte
        ? getOperatingDay(p.timestamp || p.date || new Date()) === activeSessionForCorte.id.split("-").slice(-3).join("-")
        : true;
        
      return matchesUser && matchesSession;
    });
  }, [purchases, corteFilterUserId, users, activeSessionForCorte]);

  const corteData = useMemo(() => {
    const completedHistory = filteredHistoryForCorte.filter(
      (h) => h.status === "completed" || h.isPaid,
    );

    let subtotal = 0;
    let tip = 0;
    let discount = 0;
    let total = 0;

    let cashSales = 0;
    let cardSales = 0;
    let transSales = 0;
    let lupaySales = 0;

    let cashSalesCount = 0;
    let cardSalesCount = 0;
    let transSalesCount = 0;
    let lupaySalesCount = 0;

    completedHistory.forEach((h) => {
      subtotal += Number(h.subtotal || 0);
      tip += Number(h.tip || 0);
      discount += Number(h.discount || 0);
      total += Number(h.total || 0);

      const method = (h.paymentMethod || "").toLowerCase();
      if (method === "cash" || method === "efectivo") {
        cashSales += Number(h.total || 0);
        cashSalesCount++;
      } else if (method === "card" || method === "tarjeta") {
        cardSales += Number(h.total || 0);
        cardSalesCount++;
      } else if (method === "lupay") {
        lupaySales += Number(h.total || 0);
        lupaySalesCount++;
      } else {
        transSales += Number(h.total || 0);
        transSalesCount++;
      }
    });

    // Calculate top sold products
    const productCounts: {
      [key: string]: {
        name: string;
        quantity: number;
        category: string;
        subtotal: number;
      };
    } = {};

    let cashInFromMovements = 0;
    let cashOutFromMovements = 0;

    filteredCashMovementsForCorte.forEach((m) => {
      if (m.type === "in") cashInFromMovements += Number(m.amount || 0);
      else if (m.type === "out") cashOutFromMovements += Number(m.amount || 0);
    });

    completedHistory.forEach((h) => {
      (h.comandas || []).forEach((com) => {
        (com.items || []).forEach((item) => {
          if (!item.isCancelled) {
            const pId = item.product.id;
            const qty = Number(item.quantity || 0);
            const price = Number(item.product.price || 0);
            if (!productCounts[pId]) {
              productCounts[pId] = {
                name: getFormattedProductName(item.product),
                quantity: 0,
                category: item.product.category,
                subtotal: 0,
              };
            }
            productCounts[pId].quantity += qty;
            productCounts[pId].subtotal += qty * price;
          }
        });
      });
    });

    let totalPurchasesPaid = 0;
    let totalPurchasesCredit = 0;
    filteredPurchasesForCorte.forEach((p) => {
      if (p.isPaid) totalPurchasesPaid += p.total || 0;
      else totalPurchasesCredit += p.total || 0;
    });

    const allProductsSold = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity);

    const topSold = allProductsSold.slice(0, 5);

    // Get cancelled items or tickets with acting user details
    const canceledItems: {
      tableName: string;
      productName: string;
      qty: number;
      reason: string;
      user?: string;
      time: Date;
    }[] = [];

    // 1. Check active tables for cancelled items
    tables.forEach((t) => {
      (t.comandas || []).forEach((c) => {
        (c.items || []).forEach((item) => {
          if (item.isCancelled) {
            canceledItems.push({
              tableName: `Mesa ${t.label}`,
              productName: getFormattedProductName(item.product),
              qty: item.quantity,
              reason: item.cancellationReason || "No especificada",
              user: item.cancelledBy?.name || "Mesero",
              time: c.timestamp ? new Date(c.timestamp) : new Date(),
            });
          }
        });
      });
    });

    // 2. Check history for cancelled accounts & items inside them
    filteredHistoryForCorte.forEach((h) => {
      if (h.status === "cancelled") {
        canceledItems.push({
          tableName: `Cuenta ${h.tableLabel}`,
          productName: "Cuenta Completa Cancelada",
          qty: 1,
          reason: h.cancellationReason || "No especificada",
          user: h.cancelledBy?.name || "Mesero/Cajero",
          time: h.timestamp ? new Date(h.timestamp) : new Date(),
        });
      } else {
        (h.comandas || []).forEach((c) => {
          (c.items || []).forEach((item) => {
            if (item.isCancelled) {
              canceledItems.push({
                tableName: `Mesa ${h.tableLabel}`,
                productName: getFormattedProductName(item.product),
                qty: item.quantity,
                reason: item.cancellationReason || "No especificada",
                user: item.cancelledBy?.name || "Cajero",
                time: h.timestamp ? new Date(h.timestamp) : new Date(),
              });
            }
          });
        });
      }
    });

    return {
      subtotal,
      tip,
      discount,
      total,
      count: completedHistory.length,
      totalPurchasesPaid,
      totalPurchasesCredit,
      netCashFlow:
        cashSales +
        cashInFromMovements -
        cashOutFromMovements -
        totalPurchasesPaid,
      cashSales,
      cashInFromMovements,
      cashOutFromMovements,
      totalCashMovements: cashMovements,
      cardSales,
      transSales,
      lupaySales,
      cashSalesCount,
      cardSalesCount,
      transSalesCount,
      lupaySalesCount,
      topSold,
      allProductsSold,
      canceledItems: canceledItems.sort(
        (a, b) => b.time.getTime() - a.time.getTime(),
      ),
    };
  }, [
    filteredHistoryForCorte,
    filteredCashMovementsForCorte,
    filteredPurchasesForCorte,
    filteredExpensesForCorte,
    tables,
  ]);

  const activeSessionId = activeSessionForCorte?.id;
  const activeSessionValidated = activeSessionForCorte?.isValidated;
  const activeSessionValidatedAmount = activeSessionForCorte?.validatedTotalAmount;
  const activeSessionValidationNotes = activeSessionForCorte?.validationNotes;

  useEffect(() => {
    if (activeSessionForCorte) {
      const validatedList = (activeSessionForCorte as any).validatedAccountsList || [];
      const checkedMap: Record<string, boolean> = {};
      validatedList.forEach((id: string) => {
        checkedMap[id] = true;
      });
      
      if (validatedList.length === 0 && (activeSessionForCorte as any).isValidated) {
        filteredHistoryForCorte.filter((h) => h.status === "completed" || h.isPaid).forEach((h) => {
          checkedMap[h.id] = true;
        });
      }
      
      setCheckedAccounts(checkedMap);
      setValidationPhysicalAmount(
        activeSessionValidatedAmount !== undefined
          ? String(activeSessionValidatedAmount)
          : ""
      );
      setValidationNotes(activeSessionValidationNotes || "");
    } else {
      setCheckedAccounts({});
      setValidationPhysicalAmount("");
      setValidationNotes("");
    }
  }, [activeSessionId, activeSessionValidated, activeSessionValidatedAmount, activeSessionValidationNotes]);

  const handleSaveValidation = async () => {
    if (!activeSessionForCorte) {
      alert("No hay una sesión activa para validar.");
      return;
    }
    
    setIsSavingValidation(true);
    try {
      const validatedList = Object.keys(checkedAccounts).filter((k) => checkedAccounts[k]);
      const dataToSave = {
        isValidated: true,
        validatedTotalAmount: parseFloat(validationPhysicalAmount) || 0,
        validatedAccountsList: validatedList,
        validationNotes: validationNotes,
        validationDate: getMexicoISOString(),
        validationUser: currentUser?.name || "Administrador",
      };
      
      await updateCashierSessionInFirebase(activeSessionForCorte.id, dataToSave);
      
      if (corteTablaSessionSelected && corteTablaSessionSelected.id === activeSessionForCorte.id) {
        setCorteTablaSessionSelected({
          ...corteTablaSessionSelected,
          ...dataToSave,
        } as any);
      }
      
      alert("¡Validación del día guardada correctamente!");
    } catch (err: any) {
      console.error("Error al guardar la validación del corte:", err);
      alert("Error al guardar la validación: " + (err.message || String(err)));
    } finally {
      setIsSavingValidation(false);
    }
  };

  const generateCorteTicketText = () => {
    const {
      subtotal,
      tip,
      discount,
      total,
      count,
      cashSales,
      cardSales,
      transSales,
      totalPurchasesPaid,
      totalPurchasesCredit,
      topSold,
    } = corteData;
    const line = "--------------------------------";
    const doubleLine = "================================";
    const now = new Date();
    let t = "";

    const bNameStr = (companyConfig?.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase();

    t += `   ${bNameStr.substring(0, 26)}   \n`;
    if (companyConfig?.rfc) t += `RFC: ${companyConfig.rfc.toUpperCase()}\n`;
    if (companyConfig?.regimenFiscal) t += `REGIMEN FISCAL: ${companyConfig.regimenFiscal.toUpperCase()}\n`;
    if (companyConfig?.lugarExpedicion) t += `LUGAR EXPEDICION: ${companyConfig.lugarExpedicion.toUpperCase()}\n`;
    if (companyConfig?.direccionFiscal) t += `DIR: ${companyConfig.direccionFiscal.toUpperCase()}\n`;
    if (companyConfig?.sucursal) t += `SUCURSAL: ${companyConfig.sucursal.toUpperCase().substring(0, 24)}\n`;
    if (companyConfig?.telefono) t += `TEL: ${companyConfig.telefono}\n`;
    if (companyConfig?.email) t += `EMAIL: ${companyConfig.email.toLowerCase()}\n`;
    t += "      CORTE DE CAJA DIARIO       \n";
    t += doubleLine + "\n";
    t += `Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n`;
    t += `Usuario: ${currentUser?.name || "Administrador"}\n`;
    t += doubleLine + "\n";
    t += "RESUMEN FINANCIERO:\n";
    t += `Ventas Brutas:     $${subtotal.toFixed(2)}\n`;
    t += `Descuentos (-):     $${discount.toFixed(2)}\n`;
    t += `Propinas (+):       $${tip.toFixed(2)}\n`;
    t += line + "\n";
    t += `TOTAL COBRADO:     $${total.toFixed(2)}\n`;
    t += doubleLine + "\n";
    t += "DESGLOSE POR METODO DE PAGO:\n";
    t += `Efectivo:          $${cashSales.toFixed(2)}\n`;
    t += `S. Tarjeta:        $${cardSales.toFixed(2)}\n`;
    t += `Transferencias:    ${transSales.toFixed(2)}\n`;
    t += line + "\n";
    t += `Compras (Efectivo): -$ ${totalPurchasesPaid.toFixed(2)}\n`;
    t += `Compras a Credito:  $ ${totalPurchasesCredit.toFixed(2)}\n`;
    t += line + "\n";
    t += `EFECTIVO NETO CAJA: ${(cashSales - totalPurchasesPaid).toFixed(2)}\n`;
    t += line + "\n";
    t += `Transacciones:      #${count}\n`;
    t += doubleLine + "\n";
    t += "TOP 5 - ARTICULOS MAS VENDIDOS:\n";
    topSold.forEach((item, idx) => {
      t += `${idx + 1}. [${item.quantity}x] ${item.name.substring(0, 16).padEnd(16)} $${item.subtotal.toFixed(2)}\n`;
    });
    t += doubleLine + "\n";
    t += "\n";
    t += "    ¡Fin de Reporte Diario!     \n";
    t += "\n\n\n\n";
    return t;
  };

  const generatePrecorteTicketText = () => {
    const {
      subtotal,
      tip,
      discount,
      total,
      count,
      cashSales,
      cardSales,
      transSales,
      totalPurchasesPaid,
      totalPurchasesCredit,
      topSold,
    } = corteData;
    const line = "--------------------------------";
    const doubleLine = "================================";
    const now = new Date();

    const bNameStr = (companyConfig?.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase();

    let t = "";
    t += `   ${bNameStr.substring(0, 26)}   \n`;
    if (companyConfig?.rfc) t += `RFC: ${companyConfig.rfc.toUpperCase()}\n`;
    if (companyConfig?.regimenFiscal) t += `REGIMEN FISCAL: ${companyConfig.regimenFiscal.toUpperCase()}\n`;
    if (companyConfig?.lugarExpedicion) t += `LUGAR EXPEDICION: ${companyConfig.lugarExpedicion.toUpperCase()}\n`;
    if (companyConfig?.direccionFiscal) t += `DIR: ${companyConfig.direccionFiscal.toUpperCase()}\n`;
    if (companyConfig?.sucursal) t += `SUCURSAL: ${companyConfig.sucursal.toUpperCase().substring(0, 24)}\n`;
    if (companyConfig?.telefono) t += `TEL: ${companyConfig.telefono}\n`;
    if (companyConfig?.email) t += `EMAIL: ${companyConfig.email.toLowerCase()}\n`;
    t += "    *** PRECORTE INFORMATIVO ***\n";
    t += "      (NO CIERRA EL TURNO)      \n";
    t += doubleLine + "\n";
    t += `Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n`;
    t += `Usuario: ${currentUser?.name || "Administrador"}\n`;
    t += doubleLine + "\n";
    t += "RESUMEN ESTIMADO:\n";
    t += `Ventas Brutas:     $${subtotal.toFixed(2)}\n`;
    t += `Descuentos (-):     $${discount.toFixed(2)}\n`;
    t += `Propinas (+):       $${tip.toFixed(2)}\n`;
    t += line + "\n";
    t += `TOTAL PARCIAL:     $${total.toFixed(2)}\n`;
    t += doubleLine + "\n";
    t += "DESGLOSE POR PAGOS ESTIMADO:\n";
    t += `Efectivo:          $${cashSales.toFixed(2)}\n`;
    t += `S. Tarjeta:        $${cardSales.toFixed(2)}\n`;
    t += `Transferencias:    ${transSales.toFixed(2)}\n`;
    t += line + "\n";
    t += `Compras (Efectivo): -$ ${totalPurchasesPaid.toFixed(2)}\n`;
    t += `Compras a Credito:  $ ${totalPurchasesCredit.toFixed(2)}\n`;
    t += line + "\n";
    t += `EFECTIVO ESTIMADO CAJA: ${(cashSales - totalPurchasesPaid).toFixed(2)}\n`;
    t += line + "\n";
    t += `Transacciones doc.: #${count}\n`;
    t += doubleLine + "\n";
    t += "TOP 5 - ARTICULOS VENDIDOS:\n";
    topSold.forEach((item, idx) => {
      t += `${idx + 1}. [${item.quantity}x] ${item.name.substring(0, 16).padEnd(16)} $${item.subtotal.toFixed(2)}\n`;
    });
    t += doubleLine + "\n";
    t += "\n";
    t += " * FIN DE PRECORTE INFORMATIVO * \n";
    t += "\n\n\n\n";
    return t;
  };

  const generateCorteExpressTicketText = () => {
    const line = "--------------------------------";
    const doubleLine = "================================";
    const now = new Date();

    const todayOutflows = (cashMovements || []).filter(
      (mov) => mov.type === "out",
    );
    const { cashSales, cardSales, transSales, total, count, canceledItems } =
      corteData;

    const bNameStr = (companyConfig?.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase();
    const fMsgStr = companyConfig?.footerMessage || "¡Gracias por su preferencia!";

    let t = "";
    t += `   ${bNameStr.substring(0, 26)}   \n`;
    if (companyConfig?.rfc) t += `RFC: ${companyConfig.rfc.toUpperCase()}\n`;
    if (companyConfig?.regimenFiscal) t += `REGIMEN FISCAL: ${companyConfig.regimenFiscal.toUpperCase()}\n`;
    if (companyConfig?.lugarExpedicion) t += `LUGAR EXPEDICION: ${companyConfig.lugarExpedicion.toUpperCase()}\n`;
    if (companyConfig?.direccionFiscal) t += `DIR: ${companyConfig.direccionFiscal.toUpperCase()}\n`;
    if (companyConfig?.sucursal) t += `SUCURSAL: ${companyConfig.sucursal.toUpperCase().substring(0, 24)}\n`;
    if (companyConfig?.telefono) t += `TEL: ${companyConfig.telefono}\n`;
    if (companyConfig?.email) t += `EMAIL: ${companyConfig.email.toLowerCase()}\n`;
    t += "SISTEMA POS - TICKET DE CORTE EXPRESS\n";
    t += doubleLine + "\n";
    t += `Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n`;
    t += `Cajero: ${currentUser?.name || "Operador"}\n`;
    t += doubleLine + "\n";

    t += "VENTAS POR METODO DE PAGO:\n";
    t += `💵 Efectivo:       $${cashSales.toFixed(2)}\n`;
    t += `💳 Tarjeta:        $${cardSales.toFixed(2)}\n`;
    t += `📲 Transferencia:  $${transSales.toFixed(2)}\n`;
    t += line + "\n";
    t += `TOTAL DE VENTAS:   $${total.toFixed(2)}\n`;
    t += `Transacciones:      #${count}\n`;
    t += doubleLine + "\n";

    t += "RESUMEN DE EGRESOS / SALIDAS:\n";
    const totalExpressOutflows = todayOutflows.reduce(
      (sum, m) => sum + Number(m.amount || 0),
      0,
    );
    t += `Salidas de Caja:  -$${totalExpressOutflows.toFixed(2)}\n`;
    t += line + "\n";
    todayOutflows.forEach((m, idx) => {
      const typeLabel = m.concept === "gasto" ? "🛒Gasto" : "💸Retiro";
      const cleanDesc = (m.description || "")
        .replace("Cortexpress: [🍝 Gasto de Operación] - ", "")
        .replace("Cortexpress: [💸 Retiro de Caja / Blindaje] - ", "");
      t += `${idx + 1}. [${typeLabel}] - $${Number(m.amount).toFixed(2)}\n`;
      t += `   Ref: ${cleanDesc.substring(0, 26)}\n`;
    });
    if (todayOutflows.length === 0) {
      t += "Sin salidas de caja registradas.\n";
    }
    t += doubleLine + "\n";

    t += "CANCELACIONES DEL DIA:\n";
    if (canceledItems.length === 0) {
      t += "Sin cancelaciones detectadas.\n";
    } else {
      canceledItems.forEach((item, idx) => {
        t += `${idx + 1}. ${item.productName.substring(0, 16)} (${item.qty}x)\n`;
        t += `   Motivo: ${item.reason.substring(0, 26)}\n`;
        t += `   Autor: ${item.user || "Cajero"}\n`;
      });
    }
    t += doubleLine + "\n";

    // Expected vs counted cash calculation matching dashboard:
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayExpenses = (expenses || []).filter((exp) => {
      if (!exp.createdAt) return false;
      const expDate = new Date(exp.createdAt);
      return expDate >= startOfToday;
    });
    const totalOutflowsAmt =
      todayOutflows.reduce((sum, mov) => sum + Number(mov.amount || 0), 0) +
      todayExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const estimated = Math.max(0, cashSales - totalOutflowsAmt);

    const expressTotalArq =
      Number(expressArq1000 || 0) * 1000 +
      Number(expressArq500 || 0) * 500 +
      Number(expressArq200 || 0) * 200 +
      Number(expressArq100 || 0) * 100 +
      Number(expressArq50 || 0) * 50 +
      Number(expressArq20 || 0) * 20 +
      Number(expressArqM10 || 0) * 10 +
      Number(expressArqM5 || 0) * 5 +
      Number(expressArqM2 || 0) * 2 +
      Number(expressArqM1 || 0) * 1 +
      Number(expressArqM05 || 0) * 0.5;

    const diff = expressTotalArq - estimated;

    t += "RESULTADO DEL ARQUEO EXPRESO:\n";
    t += `ESPERADO EN CAJA: $${estimated.toFixed(2)}\n`;
    t += `ARQUEO FISICO:    $${expressTotalArq.toFixed(2)}\n`;
    t += line + "\n";
    if (diff === 0) {
      t += "DIFERENCIA:       $0.00 (EXACTO)\n";
    } else if (diff > 0) {
      t += `DIFERENCIA:      +$${diff.toFixed(2)} (SOBRANTE)\n`;
    } else {
      t += `DIFERENCIA:      -$${Math.abs(diff).toFixed(2)} (FALTANTE)\n`;
    }
    t += doubleLine + "\n";
    t += `   ${fMsgStr.substring(0, 28)}   \n`;
    t += "\n\n\n\n";
    return t;
  };

  const handlePrintPrecorte = async () => {
    if ((window as any)._isPrintingCorte) return;
    (window as any)._isPrintingCorte = true;
    setTimeout(() => {
      (window as any)._isPrintingCorte = false;
    }, 2500);

    try {
      const driver = new EscPosDriver();
      const transport = await createTransport("cuentas", selectedTenant?.id);
      const job = new PosPrinterJob(driver, transport as any);

      const {
        subtotal,
        tip,
        discount,
        total,
        count,
        cashSales,
        cardSales,
        transSales,
        topSold,
      } = corteData;
      const now = new Date();

      job
        .initialize()
        .center()
        .bold(true)
        .printLine((companyConfig?.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase())
        .printLine(
          companyConfig.rfc ? `RFC: ${companyConfig.rfc.toUpperCase()}` : "",
        )
        .printLine(
          companyConfig.sucursal
            ? `SUC: ${companyConfig.sucursal.toUpperCase()}`
            : "",
        )
        .printLine("*** PRECORTE INFORMATIVO ***")
        .printLine(" (NO CIERRA EL TURNO) ")
        .bold(false)
        .printLine("================================")
        .left()
        .printLine(
          `Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        )
        .printLine(`Atendido: ${currentUser?.name || "Admin"}`)
        .printLine("================================")
        .bold(true)
        .printLine("RESUMEN PARCIAL:")
        .bold(false)
        .printLine(`Ventas Brutas:  $${subtotal.toFixed(2)}`)
        .printLine(`Descuentos (-):  $${discount.toFixed(2)}`)
        .printLine(`Propinas (+):    $${tip.toFixed(2)}`)
        .printLine("--------------------------------")
        .bold(true)
        .printLine(`TOTAL ESTIMADO: $${total.toFixed(2)}`)
        .bold(false)
        .printLine("================================")
        .printLine("METODOS DE PAGO:")
        .printLine(`Efectivo:       $${cashSales.toFixed(2)}`)
        .printLine(`S. Tarjeta:     $${cardSales.toFixed(2)}`)
        .printLine(`Transferencia:  ${transSales.toFixed(2)}`)
        .printLine(`Transacciones:   #${count}`)
        .printLine("--------------------------------")
        .printLine(
          `Compras Pagadas: -$ ${corteData.totalPurchasesPaid.toFixed(2)}`,
        )
        .printLine(
          `Compras Credito:  $ ${corteData.totalPurchasesCredit.toFixed(2)}`,
        )
        .printLine("--------------------------------")
        .bold(true)
        .printLine(`CAJA NETO EFECT: ${corteData.netCashFlow.toFixed(2)}`)
        .bold(false)
        .printLine("================================")
        .bold(true)
        .printLine("TOP 5 - ARTICULOS VENDIDOS:")
        .bold(false);

      topSold.forEach((item, idx) => {
        job.printLine(
          `${idx + 1}. [${item.quantity}x] ${item.name.substring(0, 16)} $${item.subtotal.toFixed(2)}`,
        );
      });

      job.printLine("================================").feed(3).cut().execute();

      setMenuToastMessage("Comisionando impresion de precorte...");
      setShowMenuToast(true);
    } catch (err: any) {
      console.error("Print precorte failed:", err);
      setMenuToastMessage("Error de impresion precorte: " + err.message);
      setShowMenuToast(true);
    }
  };

  const handleDownloadPrecorteReport = () => {
    try {
      const text = generatePrecorteTicketText();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Precorte_dia_${getMexicoISOString().split("T")[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      setMenuToastMessage("Precorte descargado con exito.");
      setShowMenuToast(true);
    } catch (err: any) {
      console.error("Download precorte failed:", err);
    }
  };

  const handlePrintCorte = async () => {
    if ((window as any)._isPrintingCorte) return;
    (window as any)._isPrintingCorte = true;
    setTimeout(() => {
      (window as any)._isPrintingCorte = false;
    }, 2500);

    try {
      const driver = new EscPosDriver();
      const transport = await createTransport("cuentas", selectedTenant?.id);
      const job = new PosPrinterJob(driver, transport as any);

      const {
        subtotal,
        tip,
        discount,
        total,
        count,
        cashSales,
        cardSales,
        transSales,
        topSold,
      } = corteData;
      const now = new Date();

      job
        .initialize()
        .center()
        .bold(true)
        .printLine((companyConfig?.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase())
        .printLine(
          companyConfig.rfc ? `RFC: ${companyConfig.rfc.toUpperCase()}` : "",
        )
        .printLine(
          companyConfig.sucursal
            ? `SUC: ${companyConfig.sucursal.toUpperCase()}`
            : "",
        )
        .printLine("CORTE DE CAJA DIARIO")
        .bold(false)
        .printLine("================================")
        .left()
        .printLine(
          `Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        )
        .printLine(`Atendido: ${currentUser?.name || "Admin"}`)
        .printLine("================================")
        .bold(true)
        .printLine("RESUMEN FINANCIERO:")
        .bold(false)
        .printLine(`Ventas Brutas:  $${subtotal.toFixed(2)}`)
        .printLine(`Descuentos (-):  $${discount.toFixed(2)}`)
        .printLine(`Propinas (+):    $${tip.toFixed(2)}`)
        .printLine("--------------------------------")
        .bold(true)
        .printLine(`TOTAL COBRADO:  $${total.toFixed(2)}`)
        .bold(false)
        .printLine("================================")
        .printLine("METODOS DE PAGO:")
        .printLine(`Efectivo:       $${cashSales.toFixed(2)}`)
        .printLine(`S. Tarjeta:     $${cardSales.toFixed(2)}`)
        .printLine(`Transferencia:  ${transSales.toFixed(2)}`)
        .printLine(`Transacciones:   #${count}`)
        .printLine("--------------------------------")
        .printLine(
          `Compras Pagadas: -$ ${corteData.totalPurchasesPaid.toFixed(2)}`,
        )
        .printLine(
          `Compras Credito:  $ ${corteData.totalPurchasesCredit.toFixed(2)}`,
        )
        .printLine("--------------------------------")
        .bold(true)
        .printLine(`CAJA NETA Efect: ${corteData.netCashFlow.toFixed(2)}`)
        .bold(false)
        .printLine("================================")
        .bold(true)
        .printLine("TOP 5 - ARTICULOS VENDIDOS:")
        .bold(false);

      topSold.forEach((item, idx) => {
        job.printLine(
          `${idx + 1}. [${item.quantity}x] ${item.name.substring(0, 16)} $${item.subtotal.toFixed(2)}`,
        );
      });

      job.printLine("================================").feed(3).cut().execute();

      setMenuToastMessage("Comisionando impresion de corte diario...");
      setShowMenuToast(true);
    } catch (err: any) {
      console.error("Print cut failed:", err);
      setMenuToastMessage("Error de impresion: " + err.message);
      setShowMenuToast(true);
    }
  };

  const handleDownloadCorteReport = () => {
    try {
      const text = generateCorteTicketText();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Corte_dia_${getMexicoISOString().split("T")[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      setMenuToastMessage("Reporte de caja descargado con exito.");
      setShowMenuToast(true);
    } catch (err: any) {
      console.error("Download report failed:", err);
    }
  };

  const handleResetSales = async () => {
    try {
      setIsAddingProducts(true);
      setMenuToastMessage("Reiniciando cortes de caja y comandas...");
      setShowMenuToast(true);

      const res = await fetch("/api/reset-sales", { method: "POST" });
      if (res.ok) {
        await resetSalesInFirebase(); // keep firebase synced
      }

      // Explicitly clean all transactional / operational states immediately
      setHistory([]);
      setCashMovements([]);
      setExpenses([]);
      setPurchases([]);
      setArqueosHistory([]);
      setCashierSessions([]);
      setInventoryMovements([]);
      setCorteTablaSessionSelected(null);

      // Clean local storage cache keys to prevent stale data reload
      const keysToClear = [
        "pos_history",
        "pos_cash_movements",
        "pos_expenses",
        "pos_purchases",
        "pos_arqueos_history",
        "pos_cashier_sessions",
        "pos_inventory_movements",
      ];
      keysToClear.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn("Error clearing cache key:", key, e);
        }
      });

      setMenuToastMessage("Cortes y ventas reiniciadas.");
      setTimeout(() => {
        setIsAddingProducts(false);
        setShowMenuToast(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error resetting sales:", err);
      setMenuToastMessage(err.message || "Error al reiniciar ventas.");
      setIsAddingProducts(false);
    }
  };

  const handleResetAllSystems = async () => {
    try {
      setIsAddingProducts(true);
      setMenuToastMessage("Borrando base de datos y reiniciando sistema...");
      setShowMenuToast(true);

      // 1. Clear IndexedDB
      await clearAllLocalData();

      // 2. Clear SQLite on Express Server
      await fetch("/api/reset", { method: "POST" });

      // 3. Call Firebase reset logic (now seeds default tables, products & users)
      await resetAllSystemsInFirebase();

      setMenuToastMessage("Sistema reiniciado. Todo en limpio.");

      // 4. Clear current logged in user and reset everything
      setCurrentUser(null);
      setAppMode("floorplan");
      setMainTab("mesas");

      setTimeout(() => {
        setIsAddingProducts(false);
        setShowMenuToast(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error resetting all systems:", err);
      setMenuToastMessage(err.message || "Error al reiniciar el sistema.");
      setIsAddingProducts(false);
    }
  };

  const renderUserHeaderInfo = () => (
    <UserHeaderInfoView
      currentUser={currentUser}
      handleLogout={handleLogout}
      isUrlTokenSession={isUrlTokenSession}
      notificationsList={notificationsList}
      setCurrentUser={setCurrentUser}
      setLoginSubStep={setLoginSubStep}
      setNewPinInput={setNewPinInput}
      setSelectedLoginUser={setSelectedLoginUser}
      setShowChangePinModal={setShowChangePinModal}
      setShowNotificationModal={setShowNotificationModal}
      
    />
  );;

  const renderMaterialHeader = (options: {     title: string;     subtitle?: string;     showBack?: boolean;     onBack?: () => void;     showMenu?: boolean;     actions?: React.ReactNode;     minimal?: boolean;   }) => (
    <MaterialHeaderView
      currentUser={currentUser}
      handleLogout={handleLogout}
      isMasterAdmin={isMasterAdmin}
      isOnline={isOnline}
      isOwnerUnlocked={isOwnerUnlocked}
      notificationsList={notificationsList}
      selectedTenant={selectedTenant}
      setAppMode={setAppMode}
      setCurrentUser={setCurrentUser}
      setLoginSubStep={setLoginSubStep}
      setSelectedLoginUser={setSelectedLoginUser}
      setShowBranchSwitcherModal={setShowBranchSwitcherModal}
      setShowNotificationModal={setShowNotificationModal}
      setShowSidebar={setShowSidebar}
      options={options}
    />
  );;

  const renderLogin = () => (
    <LoginView
      COMPANY_CATALOG={COMPANY_CATALOG}
      activeOwnerFilter={activeOwnerFilter}
      allDeviceRequests={allDeviceRequests}
      branchNamePrefix={branchNamePrefix}
      companiesConfig={companiesConfig}
      customOwnerPins={customOwnerPins}
      customOwnerSupervisorPins={customOwnerSupervisorPins}
      customOwners={customOwners}
      devReqName={devReqName}
      devReqRole={devReqRole}
      deviceId={deviceId}
      deviceRequest={deviceRequest}
      editingOwner={editingOwner}
      editingTenant={editingTenant}
      formOwnerAccent={formOwnerAccent}
      formOwnerAvatar={formOwnerAvatar}
      formOwnerLogo={formOwnerLogo}
      formOwnerName={formOwnerName}
      formOwnerPin={formOwnerPin}
      formOwnerSupervisorPin={formOwnerSupervisorPin}
      formTenantAccentColor={formTenantAccentColor}
      formTenantAvatar={formTenantAvatar}
      formTenantDireccion={formTenantDireccion}
      formTenantEmail={formTenantEmail}
      formTenantLat={formTenantLat}
      formTenantLng={formTenantLng}
      formTenantLogoUrl={formTenantLogoUrl}
      formTenantName={formTenantName}
      formTenantOwnerKey={formTenantOwnerKey}
      formTenantPropietario={formTenantPropietario}
      formTenantRequireInternalFolio={formTenantRequireInternalFolio}
      formTenantAllowEfectivo={formTenantAllowEfectivo}
      setFormTenantAllowEfectivo={setFormTenantAllowEfectivo}
      formTenantAllowTarjeta={formTenantAllowTarjeta}
      setFormTenantAllowTarjeta={setFormTenantAllowTarjeta}
      formTenantAllowTransferencia={formTenantAllowTransferencia}
      setFormTenantAllowTransferencia={setFormTenantAllowTransferencia}
      formTenantAllowLupay={formTenantAllowLupay}
      setFormTenantAllowLupay={setFormTenantAllowLupay}
      formTenantRequireCardDigits={formTenantRequireCardDigits}
      setFormTenantRequireCardDigits={setFormTenantRequireCardDigits}
      formTenantRfc={formTenantRfc}
      formTenantSucursal={formTenantSucursal}
      formTenantType={formTenantType}
      handleAddRow={handleAddRow}
      handleCellChange={handleCellChange}
      handleDeleteOwner={handleDeleteOwner}
      handleDeleteRow={handleDeleteRow}
      handleDeleteTenant={handleDeleteTenant}
      handleEditTenantClick={handleEditTenantClick}
      handleOwnerPinSubmit={handleOwnerPinSubmit}
      handleSaveOwner={handleSaveOwner}
      handleSaveTenant={handleSaveTenant}
      handleSelectCompanyWithPinCheck={handleSelectCompanyWithPinCheck}
      handleSupportAction={handleSupportAction}
      history={history}
      isMasterAdmin={isMasterAdmin}
      isOwnerUnlocked={isOwnerUnlocked}
      loginSubStep={loginSubStep}
      mexicoClockShort={mexicoClockShort}
      modalTenant={modalTenant}
      modalUsers={modalUsers}
      notificationsGranted={notificationsGranted}
      ownerPasswordInput={ownerPasswordInput}
      restrictedOwnerKey={restrictedOwnerKey}
      revealedPins={revealedPins}
      selectedTenant={selectedTenant}
      setActiveOwnerFilter={setActiveOwnerFilter}
      setBranchNamePrefix={setBranchNamePrefix}
      setDevReqName={setDevReqName}
      setDevReqRole={setDevReqRole}
      setEditingOwner={setEditingOwner}
      setFormOwnerAccent={setFormOwnerAccent}
      setFormOwnerAvatar={setFormOwnerAvatar}
      setFormOwnerLogo={setFormOwnerLogo}
      setFormOwnerName={setFormOwnerName}
      setFormOwnerPin={setFormOwnerPin}
      setFormOwnerSupervisorPin={setFormOwnerSupervisorPin}
      setFormTenantAccentColor={setFormTenantAccentColor}
      setFormTenantAvatar={setFormTenantAvatar}
      setFormTenantDireccion={setFormTenantDireccion}
      setFormTenantEmail={setFormTenantEmail}
      setFormTenantLat={setFormTenantLat}
      setFormTenantLng={setFormTenantLng}
      setFormTenantLogoUrl={setFormTenantLogoUrl}
      setFormTenantName={setFormTenantName}
      setFormTenantOwnerKey={setFormTenantOwnerKey}
      setFormTenantPropietario={setFormTenantPropietario}
      setFormTenantRequireInternalFolio={setFormTenantRequireInternalFolio}
      setFormTenantRfc={setFormTenantRfc}
      setFormTenantSucursal={setFormTenantSucursal}
      setFormTenantType={setFormTenantType}
      setIsMasterAdmin={setIsMasterAdmin}
      setIsOwnerUnlocked={setIsOwnerUnlocked}
      setIsSystemsMode={setIsSystemsMode}
      setLoginSubStep={setLoginSubStep}
      setModalTenant={setModalTenant}
      setModalUsers={setModalUsers}
      setNotificationsGranted={setNotificationsGranted}
      setOwnerPasswordInput={setOwnerPasswordInput}
      setRestrictedOwnerKey={setRestrictedOwnerKey}
      setRevealedPins={setRevealedPins}
      setSelectedLoginUser={setSelectedLoginUser}
      setShowConfigurePrefixModal={setShowConfigurePrefixModal}
      setShowDeviceRequestsModal={setShowDeviceRequestsModal}
      setShowManageCompaniesModal={setShowManageCompaniesModal}
      setShowOwnerCrudModal={setShowOwnerCrudModal}
      setShowPinPanel={setShowPinPanel}
      setShowPinsStructureModal={setShowPinsStructureModal}
      setShowTenantCrudModal={setShowTenantCrudModal}
      setShowTenantUsersModal={setShowTenantUsersModal}
      setTenantsVersion={setTenantsVersion}
      setTransferIncludeBranches={setTransferIncludeBranches}
      setTransferStep={setTransferStep}
      setTransferTargetOwnerKey={setTransferTargetOwnerKey}
      showConfigurePrefixModal={showConfigurePrefixModal}
      showDeviceRequestsModal={showDeviceRequestsModal}
      showManageCompaniesModal={showManageCompaniesModal}
      showOwnerCrudModal={showOwnerCrudModal}
      showPinPanel={showPinPanel}
      showPinsStructureModal={showPinsStructureModal}
      showTenantCrudModal={showTenantCrudModal}
      showTenantUsersModal={showTenantUsersModal}
      transferIncludeBranches={transferIncludeBranches}
      transferStep={transferStep}
      transferTargetOwnerKey={transferTargetOwnerKey}
      triggerAppNotification={triggerAppNotification}
      masterAdminPin={masterAdminPin}
      handleUpdateMasterPin={handleUpdateMasterPin}
      executeTenantTransfer={executeTenantTransfer}
      resetTenantForm={resetTenantForm}
          setCompaniesConfig={setCompaniesConfig}
          searchCompanyQuery={searchCompanyQuery}
          setSearchCompanyQuery={setSearchCompanyQuery}
          setSelectedTenant={setSelectedTenant}
          isSavingTenant={isSavingTenant}
          isSavingOwner={isSavingOwner}
      
    />
  );;

  const validateAdminPin = (enteredPin: string): User | null => {
    // 1. Master/Sistemas Pins (Global allowed)
    if (enteredPin === "4020" || enteredPin === "2052" || enteredPin === "2026") {
      const firstAdmin = users.find((u) => u.role === "admin") || {
        id: "admin-master",
        name: enteredPin === "4020" ? "Sistemas Bypass 🛠️" : "Admin Maestro 👑",
        role: "admin" as UserRole,
        pin: enteredPin,
        avatar: "fa-solid fa-laptop-code",
        tenantId: selectedTenant?.id || "",
      };
      return firstAdmin;
    }

    // 2. Search for matching admin in the current branch users (Local Tenant)
    // Cajeros y meseros NO pueden autorizar. Cualquier otro rol superior local (admin, gerente, etc.) SÍ puede.
    let localAdmin = users.find((u) => u.pin === enteredPin && u.role !== "mesero" && u.role !== "cajero");
    if (localAdmin) return localAdmin;

    // 3. Search through ALL users of ALL sucursales (Cross-Tenant)
    // Los administradores o gerentes de otras sucursales NO pueden cancelar aquí.
    // SOLO se permite si son de nivel Propietario o Sistemas.
    for (const company of COMPANY_CATALOG) {
      if (company.id === selectedTenant?.id) continue;
      const companyUsers = getTenantUsers(company.id);
      const crossTenantUser = companyUsers.find((x) => x.pin === enteredPin);
      if (crossTenantUser) {
        const isSistemas = crossTenantUser.id.endsWith("-sistemas") || crossTenantUser.name.toLowerCase().includes("sistemas");
        const isPropietario = crossTenantUser.id.endsWith("-admin") || crossTenantUser.role === "owner" || (crossTenantUser.role as any) === "supervisor";
        
        if (isSistemas || isPropietario) {
          return crossTenantUser;
        }
      }
    }

    return null;
  };

  const verifyPinAndCancel = () => {
    const adminUser = validateAdminPin(cancellationPin);

    if (adminUser) {
      if (pendingCancellation?.type === "item") {
        const { productId, plate, folio, reason } = pendingCancellation.data;
        cancelItemInOrder(productId, plate, folio, reason, adminUser);
      } else if (pendingCancellation?.type === "order") {
        cancelOrder(pendingCancellation.data, adminUser);
      }
      setCancellationPin("");
      setPendingCancellation(null);
      setShowPinModal(false);
      return true;
    } else {
      alert("⚠️ PIN incorrecto o usuario sin permisos de Administrador");
      setCancellationPin("");
      return false;
    }
  };

  const renderCancellationPinPad = (     currentPin: string,     setPin: (pin: string) => void,     onComplete: (pin: string) => void   ) => (
    <CancellationPinPadView

      currentPin={currentPin} setPin={setPin} onComplete={onComplete}
    />
  );;
  const [passwordTarget, setPasswordTarget] = useState<"discount" | "admin">(
    "admin",
  );
  const [paymentDiscountType, setPaymentDiscountType] = useState<
    "percent" | "amount"
  >("percent");
  const [paymentDiscountValue, setPaymentDiscountValue] = useState<number>(0);
  const modalDiscountAmount = selectedAccountForPayment
    ? Math.round(
        paymentDiscountType === "percent"
          ? selectedAccountForPayment.subtotal * (paymentDiscountValue / 100)
          : paymentDiscountValue
      )
    : 0;
  const [paymentTipValue, setPaymentTipValue] = useState<number>(0);
  const [paymentTipTarget, setPaymentTipTarget] = useState<string>("");
  const [paymentDiscountTarget, setPaymentDiscountTarget] =
    useState<string>("");
  const [precuentaTab, setPrecuentaTab] = useState<
    "resumen" | "comandas" | "comensales"
  >("resumen");

  const handleAddCashMovement = async () => {
    if (!cashMovementForm.amount) return;
    const amount = parseFloat(cashMovementForm.amount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await addCashMovementToFirebase({
        type: cashMovementForm.type,
        concept: cashMovementForm.concept,
        amount: amount,
        description: cashMovementForm.description,
        user: currentUser?.name || "Admin",
        userId: currentUser?.id,
        sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
      });
      setShowCashMovementModal(false);
      setCashMovementForm({
        type: "out",
        concept: "retiro",
        amount: "",
        description: "",
      });
    } catch (e) {
      console.error("Error adding cash movement", e);
    }
  };

  const cancelComanda = async (folio: number, reason: string, user: User) => {
    // 1. Instant local visual feedback
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === selectedTableId) {
          return {
            ...t,
            comandas: t.comandas.map((c) => {
              if (c.folio === folio) {
                return {
                  ...c,
                  items: c.items.map((item) => ({
                    ...item,
                    isCancelled: true,
                    cancellationReason: reason,
                    cancelledBy: user,
                  })),
                };
              }
              return c;
            }),
          };
        }
        return t;
      }),
    );

    // 2. Persist to Firestore instantly
    if (selectedTableId && selectedTable) {
      try {
        await cancelEntireComandaInFirebase(
          selectedTableId,
          selectedTable,
          folio,
          reason,
          user,
        );
        triggerAppNotification(
          "🚫 Comanda Cancelada",
          `Comanda folio #${folio} de Mesa ${selectedTable.label} cancelada con éxito.`,
          "success",
        );
      } catch (err: any) {
        console.error("Error persisting comanda cancellation to Firebase:", err);
        triggerAppNotification(
          "❌ Error al Guardar Cancelación",
          err.message || "La transferencia al servidor falló.",
          "warning",
        );
      }
    }
  };

  const [itemToCancel, setItemToCancel] = useState<{
    productId: string;
    plate: number;
    folio: number;
  } | null>(null);
  const [comandaToCancel, setComandaToCancel] = useState<number | null>(null);
  const [itemToNote, setItemToNote] = useState<{
    productId: string;
    plate: number;
    currentNote?: string;
  } | null>(null);
  const [tempNote, setTempNote] = useState<string>("");
  const [isListeningNote, setIsListeningNote] = useState(false);
  const noteRecognitionRef = useRef<any>(null);
  const [folioCounter, setFolioCounter] = useState<number>(1001);
  const [isRefreshingTables, setIsRefreshingTables] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [showVoiceToast, setShowVoiceToast] = useState(false);
  const [voiceToastMessage, setVoiceToastMessage] = useState("");
  const [lastAddedItems, setLastAddedItems] = useState<CartItem[]>([]);
  const transcriptRef = useRef<string>("");
  const isStartingVoiceRef = useRef<boolean>(false);
  const cancelPendingVoiceRef = useRef<boolean>(false);
  const feedbackTimerRef = useRef<any>(null);

  const effectiveTables = useMemo(() => {
    const tenantId = selectedTenant?.id || "default-tenant";
    if (tables && tables.length > 0) {
      const result = ensureAll35TablesForTenant(tables, tenantId);
      const occupied = result.filter((t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0));
      console.log("🟡 [EFFECTIVE_TABLES] occupied in memo:", occupied.map((t: any) => `Mesa ${t.label} status=${t.status} comandas=${t.comandas?.length}`));
      return result;
    }
    return createDefault30TablesList(tenantId);
  }, [tables, selectedTenant?.id]);

  const selectedTable = useMemo(() => {
    return effectiveTables.find((t) => t.id === selectedTableId) || selectedTableGestion;
  }, [effectiveTables, selectedTableId, selectedTableGestion]);

  useEffect(() => {
    const subs = Array.from(
      new Set(
        products
          .filter((p) => p.isDeleted !== true && p.category === activeCategory)
          .map((p) => p.subcategory),
      ),
    ).filter(Boolean);

    if (
      subs.length > 0 &&
      (!activeSubcategory || !subs.includes(activeSubcategory))
    ) {
      setActiveSubcategory(subs[0]);
    }
  }, [products, activeCategory, activeSubcategory]);

  useEffect(() => {
    setActiveSubgroup("Todos");
  }, [activeCategory, activeSubcategory]);

  const handleTableClick = (table: TableData) => {
    setSelectedTableId(table.id);

    // Always reset menu navigation state
    setActiveCategory("food");
    setActiveSubcategory("");
    setCurrentComensal(1);
    setGeneralNotes("");

    // Initialize delivery state based on selectedTable
    if (table.zone === "Servicio a Domicilio") {
      setDeliverySearchQuery("");
      setIsRegisteringDeliveryClient(false);
      setNewDeliveryClientName("");
      setNewDeliveryClientPhone("");
      setNewDeliveryClientAddress("");
      setDeliveryNotes((table as any).deliveryNotes || "");
      
      const tClientName = (table as any).deliveryClientName;
      const tClientPhone = (table as any).deliveryClientPhone;
      
      if (tClientName && tClientPhone) {
        const found = customers.find(
          (c) => c.name === tClientName && c.phone === tClientPhone
        );
        if (found) {
          setSelectedDeliveryClient(found);
          setSelectedDeliveryAddress((table as any).deliveryAddress || found.addresses?.[0] || "");
        } else {
          setSelectedDeliveryClient({
            name: tClientName,
            phone: tClientPhone,
            addresses: (table as any).deliveryAddress ? [(table as any).deliveryAddress] : []
          });
          setSelectedDeliveryAddress((table as any).deliveryAddress || "");
        }
      } else {
        setSelectedDeliveryClient(null);
        setSelectedDeliveryAddress("");
      }
    } else {
      setSelectedDeliveryClient(null);
      setSelectedDeliveryAddress("");
    }

    const hasComandas = Array.isArray(table.comandas) && table.comandas.length > 0;
    const isOccupied = table.status === "occupied" || hasComandas;

    if (!isOccupied) {
      setAppMode("menu");
      setCart([]);
      if (table.zone === "Servicio a Domicilio") {
        setShowDeliverySetupModal(true);
      }
    } else {
      setAppMode("table-details");
      setPrecuentaComensal(1);
      setPrecuentaTab("resumen");
    }
  };

  const addToCart = (product: Product, qtyToAdd: number = 1) => {
    setCart((prev) => {
      const comensalToUse = currentComensal;

      // 1. Try to find an item with NO notes (standard behavior)
      const existingNoNotes = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.plate === comensalToUse &&
          !item.notes,
      );
      if (existingNoNotes) {
        return prev.map((item) =>
          item.product.id === product.id &&
          item.plate === comensalToUse &&
          !item.notes
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item,
        );
      }

      // 2. If no "normal" item exists, check if there is EXACTLY ONE item with notes
      const allItemsForProduct = prev.filter(
        (item) =>
          item.product.id === product.id && item.plate === comensalToUse,
      );
      if (allItemsForProduct.length === 1) {
        // Increment that single item, even if it has notes
        return prev.map((item) =>
          item.product.id === product.id && item.plate === comensalToUse
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item,
        );
      }

      // 3. Otherwise (multiple variations or none), add a new "normal" item
      return [...prev, { product, quantity: qtyToAdd, plate: comensalToUse }];
    });
  };

  const updateItemNoteInCart = (
    productId: string,
    plate: number,
    note: string,
  ) => {
    setCart((prev) => {
      // Find the specific item being edited using its original note
      const targetIndex = prev.findIndex(
        (item) =>
          item.product.id === productId &&
          item.plate === plate &&
          (item.notes || "") === (itemToNote?.currentNote || ""),
      );

      if (targetIndex === -1) return prev;

      const newCart = [...prev];
      const itemToUpdate = newCart[targetIndex];

      // If the note hasn't actually changed, return as is
      if (itemToUpdate.notes === note) return prev;

      // Check if there's another item that already has this NEW note
      // If so, we merge them instead of having two separate lines
      const duplicateIndex = newCart.findIndex(
        (item, idx) =>
          idx !== targetIndex &&
          item.product.id === productId &&
          item.plate === plate &&
          (item.notes || "") === (note || ""),
      );

      if (duplicateIndex !== -1) {
        // Merge quantities into the existing item with the same note
        newCart[duplicateIndex] = {
          ...newCart[duplicateIndex],
          quantity: newCart[duplicateIndex].quantity + itemToUpdate.quantity,
        };
        // Remove the old item line
        newCart.splice(targetIndex, 1);
      } else {
        // No duplicate found, just update the note on the current item
        newCart[targetIndex] = { ...itemToUpdate, notes: note || undefined };
      }

      return newCart;
    });
  };

  const cancelItemInOrder = async (
    productId: string,
    plate: number,
    folio: number,
    reason: string,
    user: User,
  ) => {
    try {
      if (selectedTableId && selectedTable) {
        await cancelComandaItemInFirebase(
          selectedTableId,
          selectedTable,
          folio,
          productId,
          plate,
          reason,
          user,
        );
      }
    } catch (error) {
      console.error("Error cancelling item:", error);
    }
    setItemToCancel(null);
  };

  const updateQuantity = (
    productId: string,
    plate: number,
    delta: number,
    notes?: string,
  ) => {
    setCart((prev) => {
      // Find the specific item to update
      // If notes is provided, we match exactly.
      // If not, we prefer the item with NO notes, then the first one found.
      let targetIndex = -1;
      if (notes !== undefined) {
        targetIndex = prev.findIndex(
          (item) =>
            item.product.id === productId &&
            item.plate === plate &&
            item.notes === notes,
        );
      } else {
        targetIndex = prev.findIndex(
          (item) =>
            item.product.id === productId &&
            item.plate === plate &&
            !item.notes,
        );
        if (targetIndex === -1) {
          targetIndex = prev.findIndex(
            (item) => item.product.id === productId && item.plate === plate,
          );
        }
      }

      if (targetIndex === -1) return prev;

      const newCart = [...prev];
      const item = newCart[targetIndex];
      const newQty = Math.max(0, item.quantity + delta);

      if (newQty === 0) {
        newCart.splice(targetIndex, 1);
        // If in review mode and this was the last item for this comensal, switch to another tab
        if (appMode === "review" && reviewComensal === plate) {
          const remainingForComensal = newCart.filter((i) => i.plate === plate);
          if (remainingForComensal.length === 0) {
            const otherComensales = Array.from(
              new Set(newCart.map((i) => i.plate)),
            ).sort((a: any, b: any) => a - b);
            if (otherComensales.length > 0) {
              setReviewComensal(otherComensales[0] as number);
            } else {
              setReviewComensal("summary");
            }
          }
        }
      } else {
        newCart[targetIndex] = { ...item, quantity: newQty };
      }
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const printComanda = async (
    tableLabel: string,
    comanda: Comanda,
    target?: Destination,
  ): Promise<boolean> => {
    setPrintLoading(comanda.folio);
    const success = await executePrintComanda({
      tableLabel,
      comanda,
      target,
      selectedTenant,
      selectedTable,
      selectedDeliveryClient,
      selectedDeliveryAddress,
      deliveryNotes,
      systemLocalWindowsAutoPrint,
    });
    setPrintLoading(null);
    return success;
  };

  const getExistingTableFolio = (table: TableData | null | undefined): string | null => {
    if (!table) return null;
    if (table.status === "available" || !Array.isArray(table.comandas) || table.comandas.length === 0) {
      return null;
    }
    const hasActiveItems = table.comandas.some(
      (c: any) => c.items && c.items.some((item: any) => !item.isCancelled)
    );
    if (!hasActiveItems) return null;

    if ((table as any).folioInterno && String((table as any).folioInterno).trim() !== "") {
      return String((table as any).folioInterno).trim();
    }
    const found = table.comandas.find(
      (c: any) => c.folioInterno && String(c.folioInterno).trim() !== ""
    );
    if (found) return String(found.folioInterno).trim();
    return null;
  };

  const isInternalFolioDuplicate = (
    candidateFolio: string,
    tenantId: string,
    tablesList: TableData[],
    historyList: ClosedAccount[],
    currentTableId?: string
  ): boolean => {
    if (!candidateFolio) return false;
    const target = candidateFolio.trim().toLowerCase();

    const isToday = (dateVal: any): boolean => {
      if (!dateVal) return true;
      const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
      if (isNaN(d.getTime())) return true;
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    // Validar en otras mesas activas de la misma sucursal
    for (const t of (tablesList || []) as any[]) {
      const tTenant = t.tenantId || tenantId;
      if (tTenant === tenantId && Array.isArray(t.comandas)) {
        if (currentTableId && t.id === currentTableId) {
          continue;
        }
        for (const c of t.comandas) {
          if (
            c.folioInterno &&
            String(c.folioInterno).trim().toLowerCase() === target &&
            isToday(c.timestamp)
          ) {
            return true;
          }
        }
      }
    }

    // Validar en historial de cuentas cerradas de la misma sucursal pero SOLO DEL MISMO DÍA
    for (const h of (historyList || []) as any[]) {
      const hTenant = h.tenantId || tenantId;
      if (hTenant === tenantId) {
        const accountIsToday = isToday(h.timestamp);
        if (accountIsToday && Array.isArray(h.comandas)) {
          for (const c of h.comandas) {
            if (
              c.folioInterno &&
              String(c.folioInterno).trim().toLowerCase() === target
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  const generateOrder = async (goToCheckout: boolean = false) => {
    if (cart.length === 0) { alert("El carrito está vacío"); return; }
    if (!selectedTable) { alert("Mesa no seleccionada (selectedTable es nulo)"); return; }
    if (isGeneratingOrder) { console.log("Ya se está generando la orden"); return; }
    setIsGeneratingOrder(true);

    // Si la mesa ya tiene un folio interno asignado en esta sesión, se reutiliza directamente sin pedirlo de nuevo
    const existingTableFolio = getExistingTableFolio(selectedTable);
    if (existingTableFolio) {
      await executeGenerateOrder(existingTableFolio, goToCheckout);
      return;
    }

    // Folio interno DESHABILITADO por defecto. Solo se exige si la sucursal lo tiene activado explícitamente (true)
    const requiresFolio = selectedTenant?.requireInternalFolio === true;
    if (!requiresFolio) {
      await executeGenerateOrder("", goToCheckout);
      return;
    }

    const tenantId = selectedTenant?.id || "";
    const lastFolio = getLastInternalFolio(tenantId, tables, history);

    setFolioStep(1);
    setFolioInput1("");
    setFolioInputValue("");
    setFolioModalError(null);
    setPendingGoToCheckout(goToCheckout);
    setSuggestedLastFolio(lastFolio);
    setShowFolioModal(true);
    setIsGeneratingOrder(false);
    setTimeout(() => {
      if (folioInputRef.current) folioInputRef.current.focus();
    }, 100);
  };

  const handleFolioStepSubmit = async () => {
    if (isGeneratingOrder) return;
    const val = folioInputValue.trim();
    if (!val) {
      setFolioModalError("⚠️ Por favor ingresa el número de folio interno.");
      return;
    }

    if (folioStep === 1) {
      setFolioInput1(val);
      setFolioInputValue("");
      setFolioModalError(null);
      setFolioStep(2);
      setTimeout(() => {
        if (folioInputRef.current) folioInputRef.current.focus();
      }, 50);
    } else {
      const f1 = folioInput1.trim();
      const f2 = val;

      if (f1.toLowerCase() !== f2.toLowerCase()) {
        setFolioModalError(`❌ Los folios no coinciden (#${f1} vs #${f2}). Intenta de nuevo.`);
        setFolioStep(1);
        setFolioInput1("");
        setFolioInputValue("");
        setTimeout(() => {
          if (folioInputRef.current) folioInputRef.current.focus();
        }, 50);
        return;
      }

      const tenantId = selectedTenant?.id || "";
      if (isInternalFolioDuplicate(f1, tenantId, tables, history, selectedTable?.id)) {
        setFolioModalError(`⚠️ El folio interno #${f1} ya fue registrado el día de hoy en esta sucursal.`);
        setFolioStep(1);
        setFolioInput1("");
        setFolioInputValue("");
        setTimeout(() => {
          if (folioInputRef.current) folioInputRef.current.focus();
        }, 50);
        return;
      }

      try {
        localStorage.setItem("cocinet_last_internal_folio_" + tenantId, f1);
      } catch (e) {}

      setIsGeneratingOrder(true);
      setShowFolioModal(false);
      await executeGenerateOrder(f1, pendingGoToCheckout);
    }
  };

  const executeGenerateOrder = async (folioInterno: string, goToCheckout: boolean = false) => {
    if (cart.length === 0) { alert("execute: El carrito está vacío"); return; }
    if (!selectedTable) { alert("execute: Mesa no seleccionada"); return; }
    if (isGeneratingOrder) { console.log("execute: Ya se está generando la orden"); return; }

    const tableLabel = selectedTable.label;
    const currentTable = selectedTable;
    const currentSelectedId = selectedTableId;
    if (!currentSelectedId) { alert("execute: Mesa no seleccionada"); return; }

    const comandaItems = [...cart];
    const notes = generalNotes;
    const folio = Date.now();
    const existingTableFolio = (currentTable as any)?.folioInterno || ((currentTable as any)?.comandas || []).find((c: any) => c.folioInterno)?.folioInterno || "";
    const finalFolioInterno = folioInterno || existingTableFolio || "";

    const newComanda: Comanda = {
      folio: folio,
      folioInterno: finalFolioInterno,
      timestamp: new Date(),
      items: comandaItems,
      generalNotes: notes,
      createdBy: currentUser || undefined,
    };

    // ⚡ 1. OPTIMISTIC UI: Update local React state & cache IMMEDIATELY (0ms latency)
    setTables((prevTables) => {
      const updated = prevTables.map((t) => {
        if (t.id === currentSelectedId) {
          const existing = t.comandas || [];
          return {
            ...t,
            status: "occupied" as const,
            comandas: deduplicateComandas([...existing, newComanda]),
            folioInterno: finalFolioInterno || t.folioInterno,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      try {
        const tid = selectedTenant?.id || "default-tenant";
        localStorage.setItem("pos_tables_" + tid, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // ⚡ 2. Clear inputs, close modals, and transition screens INSTANTLY (0ms)
    setCart([]);
    setGeneralNotes("");
    setShowComensalPreview(false);
    setIsGeneratingOrder(false);

    const actualGoToCheckout = (goToCheckout === true) && currentUser?.role !== "mesero";

    if (actualGoToCheckout) {
      setCheckoutFallbackItems(comandaItems);
      setShowTipInput(false);
      setShowDiscountInput(false);
      setShowPaymentOptions(false);
      setPaymentTipValue(0);
      setPaymentDiscountValue(0);
      setPaymentAmountReceived("");
      setPaymentMethod("cash");
      setCheckoutReturnMode(appMode);
      setAppMode("checkout");
    } else {
      const preferred = getPreferredTablesMode();
      if (appMode === "gestion_cuentas" || preferred === "gestion_cuentas") {
        setAppMode("gestion_cuentas");
        setSelectedTableGestion(null);
      } else {
        setAppMode("floorplan");
        setSelectedTableId(null);
      }
    }

    // ⚡ 3. BACKGROUND TASKS: Firestore persistence, notifications & printing (non-blocking)
    try {
      const dClient = selectedDeliveryClient?.name || (currentTable as any)?.deliveryClientName || "";
      const dPhone = selectedDeliveryClient?.phone || (currentTable as any)?.deliveryClientPhone || "";
      const dAddr = selectedDeliveryAddress || (currentTable as any)?.deliveryAddress || "";
      const dNotes = deliveryNotes || (currentTable as any)?.deliveryNotes || "";
      
      let deliverySubStr = "";
      if (dClient || dAddr) {
        deliverySubStr = ` | 🛵 CLIENTE: ${dClient.toUpperCase()}`;
        if (dPhone) deliverySubStr += ` (Tel: ${dPhone})`;
        if (dAddr) {
          let cleanA = dAddr;
          let refT = "";
          if (dAddr.includes("(Ref:")) {
            const parts = dAddr.split("(Ref:");
            cleanA = parts[0].trim();
            refT = parts[1].replace(")", "").trim();
          } else if (dAddr.includes("| Ref:")) {
            const parts = dAddr.split("| Ref:");
            cleanA = parts[0].trim();
            refT = parts[1].trim();
          }
          deliverySubStr += ` | Dir: ${cleanA}`;
          if (refT) deliverySubStr += ` | Ref: ${refT}`;
        }
        if (dNotes) deliverySubStr += ` | Notas: ${dNotes}`;
      }

      triggerAppNotification(
        "🍳 COMANDA ENVIADA",
        `Mesa ${tableLabel} | Folio: #${finalFolioInterno || folio} | ${comandaItems.length} productos.${deliverySubStr}`,
        "success",
        {
          isComandaNotification: true,
          comandaFolio: folio,
          folioInterno: finalFolioInterno,
          tableLabel: tableLabel,
          deliveryClientName: dClient || null,
          deliveryClientPhone: dPhone || null,
          deliveryAddress: dAddr || null,
          deliveryNotes: dNotes || null,
          items: comandaItems.map((i: any) => ({
            nombre: getFormattedProductName(i.product),
            cantidad: i.quantity,
            notas: i.notes || "",
            comensal: i.plate,
            destination: getProductDestination(i.product),
          })),
          createdBy: currentUser?.name || "S/M",
          timestamp: getMexicoISOString(),
          pedidoData: {
            tipo: "comanda",
            folio: folio,
            folioInterno: finalFolioInterno,
            mesa: tableLabel,
            deliveryClientName: dClient || null,
            deliveryClientPhone: dPhone || null,
            deliveryAddress: dAddr || null,
            deliveryNotes: dNotes || null,
            items: comandaItems.map((i: any) => ({
                nombre: getFormattedProductName(i.product),
                cantidad: i.quantity,
                notas: i.notes || "",
                comensal: i.plate,
                destination: getProductDestination(i.product),
            })),
            mesero: currentUser?.name || "S/M",
            timestamp: getMexicoISOString(),
          }
        }
      );

      // Trigger automatic printing for both destinations sequentially and reliably
      const destinations = getComandaDestinations(newComanda);

      (async () => {
        try {
          if (destinations.includes("kitchen")) {
            await printComanda(tableLabel, newComanda, "kitchen");
          }
          if (destinations.includes("bar")) {
            if (destinations.includes("kitchen")) {
              // Pausa de seguridad de 800ms para permitir que la impresora termine y libere el spooler
              await new Promise((resolve) => setTimeout(resolve, 800));
            }
            await printComanda(tableLabel, newComanda, "bar");
          }
          if (destinations.length === 0) {
            await printComanda(tableLabel, newComanda);
          }
        } catch (err) {
          console.error("Error in sequential comanda dispatch:", err);
        }
      })();

      // Save to Firebase in background without blocking UI
      addComandaToFirebase(
        currentSelectedId,
        comandaItems,
        notes,
        currentUser,
        currentTable,
        folioInterno,
        folio
      ).catch((err) => {
        console.error("Error saving comanda in background to Firebase:", err);
      });
    } catch (error: any) {
      console.error("Error dispatching background tasks for comanda:", error);
    }
  };

  const finalizePayment = async (isPaidNow: boolean = true) => {
    if (isProcessingPaymentRef.current || isProcessingPayment) {
      console.warn("⚠️ finalizePayment: Cobro ya en progreso, llamada duplicada bloqueada.");
      return;
    }
    isProcessingPaymentRef.current = true;

    if (requiresInvoice && (!invoicePhone || invoicePhone.trim().length !== 10)) {
      isProcessingPaymentRef.current = false;
      alert("⚠️ Error de Validación: Para solicitar factura es obligatorio ingresar el teléfono celular de 10 dígitos del cliente.");
      return;
    }

    if ((paymentMethod === "card" || paymentMethod === "transfer") && selectedTenant?.requireCardDigits !== false && (!paymentCardLastFour || paymentCardLastFour.length < 4)) {
      isProcessingPaymentRef.current = false;
      alert("⚠️ Error de Validación: Para pagos con Tarjeta o Transferencia, es obligatorio ingresar los últimos 4 dígitos de verificación.");
      return;
    }

    if (selectedTableId) {
      const freshTable = tables.find(t => t.id === selectedTableId);
      if (!freshTable || freshTable.status === "available" || !freshTable.comandas || freshTable.comandas.length === 0) {
        isProcessingPaymentRef.current = false;
        alert("⚠️ Esta mesa ya ha sido cancelada o liberada por un administrador. No se puede cobrar.");
        const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : (checkoutReturnMode === "floorplan" ? "floorplan" : getPreferredTablesMode());
        setAppMode(nextMode);
        if (nextMode === "gestion_cuentas") {
          setSelectedTableGestion(null);
        }
        setCheckoutReturnMode(null);
        setSelectedTableId(null);
        setCheckoutFallbackItems([]);
        setShowPaymentOptions(false);
        return;
      }
    }

    if (selectedTable) {
      const allItems = selectedTable.comandas.flatMap((c) => c.items);
      const activeItems = allItems.filter((item) => !item.isCancelled);
      
      if (activeItems.length === 0) {
        isProcessingPaymentRef.current = false;
        alert("⚠️ No hay productos activos para cobrar en esta mesa.");
        return;
      }

      const subtotal = activeItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
      const discountAmount = Math.round(
        paymentDiscountType === "percent"
          ? subtotal * (paymentDiscountValue / 100)
          : paymentDiscountValue
      );
      const billTotal = subtotal - discountAmount + paymentTipValue;

      setIsProcessingPayment(true);
      try {
        if (selectedTableId) {
          const tableSnapshot = {
            ...selectedTable,
            comandas: (selectedTable.comandas || []).map((c) => ({
              ...c,
              items: (c.items || []).map((i) => ({ ...i })),
            })),
          };

          // Optimistic local state update for instant release
          setTables((prev) =>
            prev.map((t) =>
              t.id === selectedTableId
                ? { ...t, status: "available", comandas: [], folioInterno: undefined }
                : t
            )
          );

          await checkoutTableInFirebase(selectedTableId, selectedTable, {
            tableLabel: selectedTable.label,
            subtotal,
            tip: paymentTipValue,
            discount: discountAmount,
            total: billTotal,
            paymentMethod,
            cardLastFour: (paymentMethod === "card" || paymentMethod === "transfer") ? paymentCardLastFour : "",
            cardType: (paymentMethod === "card") ? paymentCardType : "",
            isPaid: isPaidNow,
            createdBy: currentUser?.id,
            sessionId: cashierSessions.find((s) => s.status === "open")?.id || `day-${selectedTenant?.id || "tenant-1"}-${getOperatingDay(new Date())}`,
            requiresInvoice,
            invoicePhone: requiresInvoice ? invoicePhone : "",
          });

          triggerAppNotification(
            "💰 TICKET GENERADO / CUENTA CERRADA",
            `Mesa ${selectedTable.label} | Total: $${billTotal.toFixed(2)} | Pago: ${paymentMethod.toUpperCase()}. ${!navigator.onLine ? "📴 Registrado Offline (Modo Híbrido)" : "⚡ Sincronizado con Firestore"}`,
          );

          // Auto-print ticket upon closing the account in background without holding UI
          printTicket(tableSnapshot, "resumen", paymentMethod, paymentCardType).catch((err) => {
            console.error("Error printing ticket in background:", err);
          });
        }
      } catch (error: any) {
        console.error("Error during checkout:", error);
        triggerAppNotification(
          "❌ Error al Cobrar Mesa",
          error.message || "No se pudo registrar la venta.",
        );
      } finally {
        isProcessingPaymentRef.current = false;
        setIsProcessingPayment(false);
      }
    } else {
      isProcessingPaymentRef.current = false;
    }

    const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : (checkoutReturnMode === "floorplan" ? "floorplan" : getPreferredTablesMode());
    setAppMode(nextMode);
    if (nextMode === "gestion_cuentas") {
      setSelectedTableGestion(null);
    }
    setCheckoutReturnMode(null);
    setSelectedTableId(null);
    setPaymentTipValue(0);
    setPaymentDiscountValue(0);
    setPaymentTipTarget("");
    setPaymentDiscountTarget("");
    setPaymentAmountReceived("");
    setPaymentCardLastFour("");
    setPaymentCardType("");
    setPaymentMethod("cash");
    setCheckoutFallbackItems([]);
  };

  const cancelOrder = async (reason: string, user: User) => {
    if (isProcessingPaymentRef.current || isProcessingPayment) return;
    isProcessingPaymentRef.current = true;
    if (selectedTable) {
      setIsProcessingPayment(true);
      try {
        if (selectedTableId) {
          // Cancel all comandas
          for (const c of selectedTable.comandas) {
            await cancelEntireComandaInFirebase(
              selectedTableId,
              selectedTable,
              c.folio,
              reason,
              user,
            );
          }

          // Then checkout as cancelled
          const allItems = selectedTable.comandas.flatMap((c) => c.items);
          const subtotal = allItems
            .filter((item) => !item.isCancelled)
            .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
          const discountAmount = Math.round(
            paymentDiscountType === "percent"
              ? subtotal * (paymentDiscountValue / 100)
              : paymentDiscountValue
          );
          const billTotal = subtotal - discountAmount;

          await checkoutTableInFirebase(selectedTableId, selectedTable, {
            tableLabel: selectedTable.label,
            subtotal,
            tip: paymentTipValue,
            discount: discountAmount,
            total: billTotal,
            paymentMethod,
            isPaid: false,
            status: "cancelled",
            cancellationReason: reason,
            cancelledBy: user,
            sessionId: cashierSessions.find((s) => s.status === "open")?.id || `day-${selectedTenant?.id || "tenant-1"}-${getOperatingDay(new Date())}`,
          });
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
      } finally {
        isProcessingPaymentRef.current = false;
        setIsProcessingPayment(false);
      }
    } else {
      isProcessingPaymentRef.current = false;
    }

    const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : (checkoutReturnMode === "floorplan" ? "floorplan" : getPreferredTablesMode());
    setAppMode(nextMode);
    if (nextMode === "gestion_cuentas") {
      setSelectedTableGestion(null);
    }
    setCheckoutReturnMode(null);
    setSelectedTableId(null);
    setPaymentTipValue(0);
    setPaymentDiscountValue(0);
    setCancellationReason("");
    setShowCancellationModal(false);
  };

  const handleConfirmTransferTable = async () => {
    if (!selectedTable || !transferTargetTableId) return;

    try {
      const sourceId = selectedTable.id;
      const targetTable = effectiveTables.find(t => t.id === transferTargetTableId);
      if (!targetTable) return;

      const sourceComandas = JSON.parse(JSON.stringify(selectedTable.comandas || []));
      let targetComandas = JSON.parse(JSON.stringify(targetTable.comandas || []));

      // Concatenate comandas and add a tag to their notes
      const updatedSourceComandas = sourceComandas.map((c: any) => ({
        ...c,
        generalNotes: (c.generalNotes ? c.generalNotes + " | " : "") + `Mudado de Mesa ${selectedTable.label}`
      }));

      targetComandas = [...targetComandas, ...updatedSourceComandas];

      await transferEntireTableInFirebase(
        sourceId,
        targetTable.id,
        targetComandas,
        targetTable.status === "available" ? "occupied" : targetTable.status
      );

      triggerAppNotification(
        "🔄 Cuenta Reasignada",
        `Se transfirió toda la cuenta de la Mesa ${selectedTable.label} a la Mesa ${targetTable.label} (${targetTable.zone}) con éxito ⚡📦`,
        "success"
      );

      setShowTransferTableModal(false);
      setTransferTargetTableId("");
      const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : (checkoutReturnMode === "floorplan" ? "floorplan" : getPreferredTablesMode());
      setAppMode(nextMode);
      if (nextMode === "gestion_cuentas") {
        setSelectedTableGestion(null);
      }
      setCheckoutReturnMode(null);
      setSelectedTableId(targetTable.id); // set target table as active so they can see it!
    } catch(err) {
      console.error("Error transferring table", err);
      triggerAppNotification("Error", "Ocurrió un error al transferir la mesa. Intente de nuevo.", "warning");
    }
  };

  const handleConfirmMove = async () => {
    if (!selectedTable || !moveTargetTableId || Object.values(moveItemsSelection).every(v => v === 0)) return;

    try {
       const sourceId = selectedTable.id;
       const targetTable = effectiveTables.find(t => t.id === moveTargetTableId);
       if (!targetTable) return;

       const sourceComandas = JSON.parse(JSON.stringify(selectedTable.comandas));
       const targetComandas = JSON.parse(JSON.stringify(targetTable.comandas));
       const itemsToMove: any[] = [];
       let anythingMoved = false;

       const updatedSourceComandas: any[] = [];

       sourceComandas.forEach((comanda: any, cIdx: number) => {
          const updatedItems: any[] = [];
          comanda.items.forEach((item: any, iIdx: number) => {
             const key = `${cIdx}-${iIdx}`;
             const moveQty = moveItemsSelection[key] || 0;
             if (moveQty > 0) {
                 const qtyToKeep = item.quantity - moveQty;
                 itemsToMove.push({
                     ...item,
                     quantity: moveQty,
                     isCancelled: false,
                     cancellationReason: undefined,
                     cancelledBy: undefined,
                     plate: 1, 
                 });
                 anythingMoved = true;

                 if (qtyToKeep > 0) {
                     updatedItems.push({
                         ...item,
                         quantity: qtyToKeep
                     });
                 }
             } else {
                 updatedItems.push(item);
             }
          });
          
          if (updatedItems.length > 0) {
              updatedSourceComandas.push({
                  ...comanda,
                  items: updatedItems
              });
          }
       });

       if (anythingMoved) {
          const newComanda = {
             folio: Date.now(),
             timestamp: getMexicoISOString(),
             items: itemsToMove,
             createdBy: currentUser,
             generalNotes: "Movido de mesa " + selectedTable.label
          };
          targetComandas.push(newComanda);

          await moveItemsBetweenTablesInFirebase(sourceId, updatedSourceComandas, targetTable.id, targetComandas, targetTable.status === "available" ? "occupied" : targetTable.status);
          
          triggerAppNotification(
             "📦 Productos Movidos",
             `Se movieron los productos exitosamente a la mesa ${targetTable.label}`,
             "success"
          );
       }
       setShowMoveItemsModal(false);
       setMoveItemsSelection({});
       setMoveTargetTableId("");
       const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : (checkoutReturnMode === "floorplan" ? "floorplan" : getPreferredTablesMode());
       setAppMode(nextMode);
       if (nextMode === "gestion_cuentas") {
         setSelectedTableGestion(null);
       }
       setCheckoutReturnMode(null);
       setSelectedTableId(null);
    } catch(err) {
       console.error("Error moving items", err);
       alert("Error al mover los productos.");
    }
  };

  const markAsPaid = (accountId: string) => {
    const account = history.find((a) => a.id === accountId);
    if (account) {
      if (account.status === "cancelled") {
        alert("⚠️ Esta cuenta ya ha sido cancelada por un administrador y no se puede cobrar.");
        return;
      }
      setSelectedAccountForPayment(account);
      const discountAmount =
        paymentDiscountType === "percent"
          ? account.subtotal * (account.discount / 100)
          : account.discount;
      const accountTotal = account.subtotal - discountAmount + account.tip;
      setPaymentAmountReceived(accountTotal.toFixed(2));
      setPaymentDiscountValue(account.discount);
      setPaymentTipValue(account.tip);
      setPaymentMethod("cash");
      setRequiresInvoice(account.requiresInvoice || false);
      setInvoicePhone(account.invoicePhone || "");
      setShowPaymentModal(true);
    }
  };

  const handleOpenInvoicePhoneModal = (targetType: "activeTable" | "closedAccount", account?: any) => {
    setPendingInvoiceTarget({ type: targetType, account });
    setInputInvoicePhone(invoicePhone || account?.invoicePhone || "");
    setInputInvoicePhoneConfirm(invoicePhone || account?.invoicePhone || "");
    setInvoicePhoneError("");
    setShowInvoicePhoneModal(true);
  };

  const handleConfirmInvoicePhone = async () => {
    const p1 = inputInvoicePhone.trim();
    const p2 = inputInvoicePhoneConfirm.trim();
    const cleanP1 = p1.replace(/\D/g, "");
    const cleanP2 = p2.replace(/\D/g, "");

    if (!cleanP1 || cleanP1.length !== 10) {
      setInvoicePhoneError("⛔ El número celular debe ser válido y contener exactamente 10 dígitos. Por favor capture de nuevo ambos campos.");
      setInputInvoicePhone("");
      setInputInvoicePhoneConfirm("");
      return;
    }

    if (cleanP1 !== cleanP2) {
      setInvoicePhoneError("⛔ Los números de celular no coinciden. Por favor capture de nuevo 2 veces ambos campos.");
      setInputInvoicePhone("");
      setInputInvoicePhoneConfirm("");
      return;
    }

    setInvoicePhoneError("");
    if (pendingInvoiceTarget?.type === "activeTable") {
      setRequiresInvoice(true);
      setInvoicePhone(cleanP1);
    } else if (pendingInvoiceTarget?.type === "closedAccount" && pendingInvoiceTarget.account) {
      try {
        await updateInvoiceRequirementInFirebase(pendingInvoiceTarget.account.id, true, cleanP1);
        setHistory((prev) =>
          prev.map((acc) =>
            acc.id === pendingInvoiceTarget.account.id
              ? { ...acc, requiresInvoice: true, invoicePhone: cleanP1 }
              : acc
          )
        );
        triggerAppNotification(
          "🧾 FACTURACIÓN ACTUALIZADA",
          `Cuenta ${pendingInvoiceTarget.account.tableLabel} marcada como: Requiere Factura (Cel: ${cleanP1})`
        );
      } catch (err) {
        console.error("Error updating invoice requirement:", err);
      }
    }
    setShowInvoicePhoneModal(false);
    setPendingInvoiceTarget(null);
  };

  const buildWhatsAppInvoiceMessage = (account: any) => {
    const bName = (companyConfig.businessName || selectedTenant?.name || "RESTAURANTE").toUpperCase();
    const tableLabel = account.tableLabel || account.mesa || "General";
    const dateStr = account.timestamp
      ? new Date(account.timestamp).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })
      : new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });

    const folioStr = account.folio ? `#${account.folio}` : account.id ? `#${String(account.id).slice(-6)}` : "S/F";
    
    const m = (account.paymentMethod || account.metodoPago || "").toString().toLowerCase().trim();
    const ct = (account.cardType || account.tipoTarjeta || "").toString().toLowerCase().trim();
    let payStr = "💵 Efectivo";
    if (["card", "tarjeta", "credit", "debit", "credito", "debito"].includes(m)) {
      if (ct === "credito" || m === "credito") payStr = "💳 Tarjeta Crédito";
      else if (ct === "debito" || m === "debito") payStr = "💳 Tarjeta Débito";
      else payStr = "💳 Tarjeta";
    } else if (["transfer", "transferencia", "spei"].includes(m)) {
      payStr = "💸 Transferencia";
    } else if (["lupay", "lu-pay"].includes(m)) {
      payStr = "📲 Lúpay";
    }

    const allItems: any[] = [];
    if (account.comandas && Array.isArray(account.comandas)) {
      account.comandas.forEach((c: any) => {
        (c.items || []).forEach((it: any) => {
          if (!it.isCancelled) allItems.push(it);
        });
      });
    } else if (account.items && Array.isArray(account.items)) {
      account.items.forEach((it: any) => {
        if (!it.isCancelled) allItems.push(it);
      });
    }

    let itemsStr = "";
    if (allItems.length > 0) {
      const grouped = allItems.reduce((acc: any[], item: any) => {
        const pName = getFormattedProductName(item.product || item).toUpperCase();
        const pPrice = Number(item.product?.price || item.precio || item.subtotal / (item.quantity || item.cantidad || 1) || 0);
        const qty = Number(item.quantity || item.cantidad || 1);
        const existing = acc.find((i) => i.name === pName);
        if (existing) {
          existing.qty += qty;
          existing.subtotal += (item.subtotal || qty * pPrice);
        } else {
          acc.push({ name: pName, qty, subtotal: item.subtotal || qty * pPrice });
        }
        return acc;
      }, []);

      itemsStr = grouped
        .map((i) => `• ${i.qty}x ${i.name} - $${Number(i.subtotal).toFixed(2)}`)
        .join("\n");
    }

    const subtotalVal = Number(account.subtotal || account.total || 0);
    const discountVal = Number(account.discount || account.descuento || 0);
    const tipVal = Number(account.tip || account.propina || 0);
    const totalVal = Number(account.total || (subtotalVal + tipVal - discountVal));

    let msg = `¡Hola! 👋 Te saludamos de *${bName}* 🌮🥤\n\n`;
    msg += `Por este medio nos puedes hacer llegar tu *Constancia de Situación Fiscal (SAT)* 📄 actualizada, así como tu *correo electrónico* ✉️ para poder generarte y enviarte tu factura electrónica.\n\n`;
    msg += `📌 *DATOS DEL TICKET A FACTURAR:*\n`;
    msg += `🧾 *Folio:* ${folioStr}\n`;
    msg += `🪑 *Mesa:* ${tableLabel}\n`;
    msg += `📅 *Fecha:* ${dateStr}\n\n`;

    if (itemsStr) {
      msg += `🛒 *DETALLE DEL CONSUMO:*\n${itemsStr}\n\n`;
    }

    msg += `💰 *Subtotal:* $${subtotalVal.toFixed(2)}\n`;
    if (discountVal > 0) msg += `🏷️ *Descuento:* -$${discountVal.toFixed(2)}\n`;
    if (tipVal > 0) msg += `🪙 *Propina:* +$${tipVal.toFixed(2)}\n`;
    msg += `💵 *TOTAL FACTURA:* $${totalVal.toFixed(2)}\n`;
    msg += `💳 *Forma de Pago:* ${payStr}\n\n`;
    msg += `¡Quedamos atentos a tus datos para enviarte tu factura a la brevedad! Quedamos a tus órdenes. 😊🙏`;

    return msg;
  };

  const handleSendWhatsAppInvoice = (account: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const rawPhone = (account.invoicePhone || invoicePhone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      alert("⚠️ No hay un número de teléfono celular válido capturado para esta factura.");
      return;
    }
    const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
    const msg = buildWhatsAppInvoiceMessage(account);
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  const handleQuickChangeAccountStatus = async (
    account: any,
    newStatus: "en_camino" | "entregado" | "pagado" | "no_entregado"
  ) => {
    try {
      let delStatus: "en_camino" | "entregado" | "no_entregado" = "entregado";
      let paidState: boolean = true;

      if (newStatus === "en_camino") {
        delStatus = "en_camino";
        paidState = false;
      } else if (newStatus === "entregado" || newStatus === "pagado") {
        delStatus = "entregado";
        paidState = true;
      } else if (newStatus === "no_entregado") {
        delStatus = "no_entregado";
        paidState = false;
      }

      await updateClosedAccountDeliveryStatusInFirebase(account.id, delStatus, paidState);

      setHistory((prev) =>
        prev.map((acc) =>
          acc.id === account.id
            ? {
                ...acc,
                deliveryStatus: delStatus,
                isPaid: paidState,
              }
            : acc
        )
      );

      const labelMap: Record<string, string> = {
        en_camino: "🛵 EN CAMINO",
        entregado: "✅ ENTREGADO / PAGADO",
        pagado: "💵 PAGADO",
        no_entregado: "⚠️ NO ENTREGADO",
      };

      triggerAppNotification(
        "🔄 ESTATUS DE CUENTA ACTUALIZADO",
        `La cuenta ${account.tableLabel} fue marcada como: ${labelMap[newStatus] || newStatus}`,
        "success"
      );
    } catch (err) {
      console.error("Error updating account status:", err);
      triggerAppNotification("⚠️ Error", "No se pudo actualizar el estatus de la cuenta.", "warning");
    }
  };

  const handleMarkItemForCancellation = async (folio: number, productId: string, plate: number, reason: string) => {
    if (!selectedTable) return;
    try {
      await markComandaItemsForCancellationInFirebase(
        selectedTable.id,
        selectedTable,
        [{ folio, productId, plate }],
        reason,
        currentUser
      );

      const comanda = selectedTable.comandas?.find(c => c.folio === folio);
      const item = comanda?.items?.find(it => it.product.id === productId && it.plate === plate);
      const itemName = item?.product.name || "Producto";
      const itemQty = item?.quantity || 1;

      const cancellationFolio = "CAN-" + String(Date.now()).slice(-5);
      const tableLabel = selectedTable.label || "No especificada";
      const notifTitle = `⏳ Solicitud de Cancelación #${cancellationFolio}`;
      const notifBody = `Solicitud enviada.\nFolio: ${cancellationFolio}\nMesa: ${tableLabel}\nSucursal: ${selectedTenant?.name || "No especificada"}\nMesero: ${currentUser?.name || "No registrado"}\nSe solicitó la cancelación de ${itemQty}x ${itemName}.\nMotivo: ${reason}\nEscribe aquí tu PIN para autorizar.`;

      triggerAppNotification(notifTitle, notifBody, "success", {
        isCancellationRequest: true,
        cancellationFolio,
        tableLabel,
        tableId: selectedTable.id,
        itemsToCancel: [{ folio, productId, plate, name: itemName, quantity: itemQty }],
        branchName: selectedTenant?.name || "No especificada",
        waiterName: currentUser?.name || "No registrado",
        reason: reason,
        status: "pending",
      });
    } catch (error) {
      console.error("Error marking item for cancellation:", error);
      triggerAppNotification("Error", "No se pudo marcar para cancelación", "warning");
    }
  };

  const handleAuthorizeItemCancellation = async (tableId: string, tableInfo: any, folio: number, productId: string, plate: number, adminUser: User) => {
    try {
      await finalizeComandaItemsCancellationInFirebase(
        tableId,
        tableInfo,
        [{ folio, productId, plate }],
        adminUser
      );
      triggerAppNotification("Producto cancelado", "La cancelación ha sido autorizada ✅", "success");
    } catch (error) {
      console.error("Error authorizing item cancellation:", error);
      triggerAppNotification("Error", "No se pudo autorizar la cancelación", "warning");
    }
  };

  const handleRevertItemCancellation = async (tableId: string, tableInfo: any, folio: number, productId: string, plate: number) => {
    try {
      await revertComandaItemsCancellationInFirebase(
        tableId,
        tableInfo,
        folio,
        productId,
        plate
      );
      triggerAppNotification("Cancelación revertida", "El producto vuelve a estar activo ✅", "success");
    } catch (error) {
      console.error("Error reverting item cancellation:", error);
      triggerAppNotification("Error", "No se pudo revertir la cancelación", "warning");
    }
  };

  const handleMarkAccountForCancellation = async (accountId: string, reason: string) => {
    try {
      await markAccountForCancellationInFirebase(accountId, reason);
      const account = history.find(a => a.id === accountId);
      const itemsDetails = (account?.comandas || []).flatMap(c => 
        (c.items || []).map(it => ({
          name: it.product.name,
          quantity: it.quantity,
          folio: c.folio
        }))
      );

      const accountCreatedByUser = users.find(u => u.id === account?.createdBy);
      const waiterNameStr = accountCreatedByUser ? accountCreatedByUser.name : (account?.createdBy || "No registrado");

      const cancellationFolio = "CAN-" + String(Date.now()).slice(-5);
      const tableLabel = account?.tableLabel || "No especificada";
      const notifTitle = `⏳ Cancelación de Cuenta Cerrada #${cancellationFolio}`;
      const notifBody = `Solicitud enviada.\nFolio: ${cancellationFolio}\nMesa: ${tableLabel}\nSucursal: ${selectedTenant?.name || "No especificada"}\nMesero: ${waiterNameStr}\nSe solicitó la cancelación de la cuenta por $${account?.total || 0}.\nMotivo: ${reason}\nEscribe aquí tu PIN para autorizar.`;

      triggerAppNotification(notifTitle, notifBody, "success", {
        isClosedAccountCancellationRequest: true,
        cancellationFolio,
        tableLabel,
        accountId: accountId,
        branchName: selectedTenant?.name || "No especificada",
        waiterName: waiterNameStr,
        total: account?.total || 0,
        itemsToCancel: itemsDetails,
        reason: reason,
        status: "pending",
      });
    } catch (error) {
      console.error("Error marking account for cancellation:", error);
      triggerAppNotification("Error", "No se pudo marcar la cuenta", "warning");
    }
  };

  const handleAuthorizeAccountCancellation = async (accountId: string, adminUser: User) => {
    try {
      const account = history.find(a => a.id === accountId);
      const reason = account?.pendingCancellationReason || account?.cancellationReason || "Autorizado por Administrador";
      await cancelClosedAccountInFirebase(accountId, reason, adminUser);
      triggerAppNotification("Cuenta cancelada", `La cuenta ha sido cancelada definitivamente por ${adminUser.name} 🚫`, "success");
    } catch (error) {
      console.error("Error authorizing account cancellation:", error);
      triggerAppNotification("Error", "No se pudo autorizar la cancelación", "warning");
    }
  };

  const handleRevertAccountCancellation = async (accountId: string) => {
    try {
      await revertAccountCancellationInFirebase(accountId);
      triggerAppNotification("Cancelación revertida", "La cuenta vuelve a estar completada ✅", "success");
    } catch (error) {
      console.error("Error reverting account cancellation:", error);
      triggerAppNotification("Error", "No se pudo revertir la cancelación", "warning");
    }
  };

  const handleCancelItem = async (folio: number, productId: string, plate: number, reason: string, adminUser: User) => {
    if (!selectedTable) return;
    try {
      await cancelComandaItemInFirebase(
        selectedTable.id,
        selectedTable,
        folio,
        productId,
        plate,
        reason,
        adminUser
      );
      triggerAppNotification("Producto cancelado", "El producto ha sido eliminado de la comanda ✅", "success");
    } catch (error) {
      console.error("Error cancelling item:", error);
      triggerAppNotification("Error", "No se pudo cancelar el producto", "warning");
    }
  };

  const handleCancelClosedAccount = async (accountId: string, reason: string, adminUser: User) => {
    try {
      await cancelClosedAccountInFirebase(accountId, reason, adminUser);
      triggerAppNotification("Cuenta cancelada", `La cuenta cerrada ha sido cancelada por ${adminUser.name} 🚫`, "success");
    } catch (error) {
      console.error("Error cancelling closed account:", error);
      triggerAppNotification("Error", "No se pudo cancelar la cuenta", "warning");
    }
  };

  const cancelEntireComanda = async (folio: number, reason: string, adminUser: User) => {
    if (selectedTableId && selectedTable) {
      try {
        await cancelEntireComandaInFirebase(
          selectedTableId,
          selectedTable,
          folio,
          reason,
          adminUser
        );
        triggerAppNotification("Comanda cancelada", `La comanda #${folio} ha sido cancelada por ${adminUser.name} ✅`, "success");
      } catch (err) {
        console.error("Error cancelling entire comanda:", err);
        triggerAppNotification("Error", "No se pudo cancelar la comanda", "warning");
      }
    }
  };

  const handleMarkEntireComandaForCancellation = async (folio: number, reason: string) => {
    if (selectedTableId && selectedTable) {
      try {
        await markEntireComandaForCancellationInFirebase(
          selectedTableId,
          selectedTable,
          folio,
          reason
        );

        const comanda = selectedTable.comandas?.find(c => c.folio === folio);
        const itemsDetails = (comanda?.items || []).filter(it => !it.isCancelled).map(it => ({
          folio: folio,
          productId: it.product.id,
          plate: it.plate,
          name: it.product.name,
          quantity: it.quantity,
        }));

        const cancellationFolio = "CAN-" + String(Date.now()).slice(-5);
        const tableLabel = selectedTable.label || "No especificada";
        const notifTitle = `⏳ Solicitud de Cancelación de Comanda #${cancellationFolio}`;
        const notifBody = `Solicitud enviada.\nFolio: ${cancellationFolio}\nMesa: ${tableLabel}\nSucursal: ${selectedTenant?.name || "No especificada"}\nMesero: ${currentUser?.name || "No registrado"}\nSe solicitó la cancelación de la comanda entera #${folio}.\nMotivo: ${reason}\nEscribe aquí tu PIN para autorizar.`;

        triggerAppNotification(notifTitle, notifBody, "success", {
          isCancellationRequest: true,
          cancellationFolio,
          tableLabel,
          tableId: selectedTable.id,
          itemsToCancel: itemsDetails,
          branchName: selectedTenant?.name || "No especificada",
          waiterName: currentUser?.name || "No registrado",
          reason: reason,
          status: "pending",
        });
      } catch (err) {
        console.error("Error marking comanda for cancellation:", err);
        triggerAppNotification("Error", "No se pudo marcar la comanda para cancelación", "warning");
      }
    }
  };

  const handleRevertEntireComandaCancellation = async (tableId: string, tableInfo: any, folio: number) => {
    try {
      await revertEntireComandaCancellationInFirebase(tableId, tableInfo, folio);
      triggerAppNotification("Solicitud revertida", `Se ha cancelado la solicitud de la comanda #${folio} 🔄`, "info");
    } catch (err) {
      console.error("Error reverting comanda cancellation request:", err);
      triggerAppNotification("Error", "No se pudo revertir la solicitud", "warning");
    }
  };

  const confirmPayment = async (account: ClosedAccount) => {
    // if (paymentMethod === "card" && !paymentCardType) {
    //   alert("⚠️ Error de Validación: Para pagos con Tarjeta, es obligatorio seleccionar si es Crédito o Débito.");
    //   return;
    // }

    if ((paymentMethod === "card" || paymentMethod === "transfer") && selectedTenant?.requireCardDigits !== false && (!paymentCardLastFour || paymentCardLastFour.length < 4)) {
      alert("⚠️ Error de Validación: Para pagos con Tarjeta o Transferencia, es obligatorio ingresar los últimos 4 dígitos de verificación.");
      return;
    }

    const freshAccount = history.find(h => h.id === account.id);
    if (freshAccount && freshAccount.status === "cancelled") {
      alert("⚠️ Esta cuenta ya ha sido cancelada por un administrador y no se puede cobrar.");
      setShowPaymentModal(false);
      setSelectedAccountForPayment(null);
      return;
    }

    const discountAmount = Math.round(
      paymentDiscountType === "percent"
        ? account.subtotal * (paymentDiscountValue / 100)
        : paymentDiscountValue
    );
    const billTotal = account.subtotal - discountAmount + paymentTipValue;
    const lastFour = (paymentMethod === "card" || paymentMethod === "transfer") ? paymentCardLastFour : "";

    try {
      await confirmPaymentInFirebase(account.id, {
        isPaid: true,
        tip: paymentTipValue,
        discount: discountAmount,
        total: billTotal,
        paymentMethod: paymentMethod,
        cardLastFour: lastFour,
        cardType: (paymentMethod === "card") ? paymentCardType : "",
        requiresInvoice: requiresInvoice,
        invoicePhone: requiresInvoice ? invoicePhone : "",
      });
    } catch (e) {
      console.error("Error updating payment in Firebase:", e);
    }

    setHistory((prev) =>
      prev.map((acc) =>
        acc.id === account.id
          ? {
              ...acc,
              isPaid: true,
              tip: paymentTipValue,
              discount: discountAmount,
              total: billTotal,
              paymentMethod: paymentMethod,
              cardLastFour: lastFour,
              cardType: (paymentMethod === "card") ? paymentCardType : "",
              requiresInvoice: requiresInvoice,
              invoicePhone: requiresInvoice ? invoicePhone : "",
            }
          : acc,
      ),
    );

    setTables((prev) =>
      prev.map((t) => {
        if (t.label === account.tableLabel && t.status === "payment_pending") {
          return { ...t, status: "available", comandas: [] };
        }
        return t;
      }),
    );

    // Auto-print ticket when payment is confirmed
    const finalizedAccount = {
      ...account,
      isPaid: true,
      tip: paymentTipValue,
      discount: discountAmount,
      total: billTotal,
      paymentMethod: paymentMethod,
      cardLastFour: lastFour,
      cardType: (paymentMethod === "card") ? paymentCardType : "",
      requiresInvoice: requiresInvoice,
      invoicePhone: requiresInvoice ? invoicePhone : "",
    };
    reprintAccount(finalizedAccount);

    setShowPaymentModal(false);
    setSelectedAccountForPayment(null);
    setPaymentTipValue(0);
    setPaymentDiscountValue(0);
    setPaymentTipTarget("");
    setPaymentDiscountTarget("");
    setPaymentAmountReceived("");
    setPaymentCardLastFour("");
    setPaymentCardType("");
  };

  const handleUpdatePaymentMethod = async () => {
    if (!accountToEditPayment) return;
    console.log("Updating payment method for account:", accountToEditPayment.id, tempPaymentMethod);

    if ((tempPaymentMethod === "card" || tempPaymentMethod === "transfer") && selectedTenant?.requireCardDigits !== false && (!tempCardLastFour || tempCardLastFour.length < 4)) {
      triggerAppNotification("⚠️ Error", "Para pagos con Tarjeta o Transferencia, es obligatorio ingresar los últimos 4 dígitos.", "warning");
      return;
    }

    if (tempPaymentMethod === "card" && accountToEditPayment?.requiresInvoice && !tempPaymentCardType) {
      triggerAppNotification("⚠️ Error", "Para pagos con Tarjeta con Factura, es obligatorio especificar Crédito o Débito.", "warning");
      return;
    }

    try {
      console.log("Calling confirmPaymentInFirebase...");
      await confirmPaymentInFirebase(accountToEditPayment.id, {
        paymentMethod: tempPaymentMethod,
        cardLastFour: tempCardLastFour,
        cardType: tempPaymentCardType,
        isPaid: accountToEditPayment.isPaid,
        tip: accountToEditPayment.tip || 0,
        discount: accountToEditPayment.discount || 0,
        total: accountToEditPayment.total || 0,
      });
      console.log("confirmPaymentInFirebase finished.");

      setHistory((prev) =>
        prev.map((acc) =>
          acc.id === accountToEditPayment.id
            ? {
                ...acc,
                paymentMethod: tempPaymentMethod,
                cardLastFour: tempCardLastFour,
                cardType: tempPaymentCardType,
              }
            : acc
        )
      );

      triggerAppNotification("💾 Pago Actualizado", "El método de pago ha sido corregido con éxito. ✨", "success");
      setIsEditPaymentModalOpen(false);
      setAccountToEditPayment(null);
    } catch (err) {
      console.error("Error updating payment method:", err);
      triggerAppNotification("❌ Error", "No se pudo actualizar el método de pago: " + (err instanceof Error ? err.message : String(err)), "warning");
    }
  };

  const checkMissingSATFiscalFields = (): string[] => {
    const rfcVal = (companyConfig.rfc || selectedTenant?.rfc || "").trim();
    const regVal = (companyConfig.regimenFiscal || selectedTenant?.regimenFiscal || "").trim();
    const lugVal = (companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion || "").trim();
    const dirVal = (companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").trim();

    const missing: string[] = [];
    if (!rfcVal) missing.push("RFC");
    if (!regVal) missing.push("Régimen Fiscal");
    if (!lugVal) missing.push("Lugar de Expedición (C.P.)");
    if (!dirVal) missing.push("Dirección Fiscal");
    return missing;
  };

  const reprintAccount = async (account: ClosedAccount, customFolio?: number) => {
    const missingSAT = checkMissingSATFiscalFields();
    if (missingSAT.length > 0) {
      console.warn(`⚠️ [Impresión] Faltan datos fiscales del SAT para la reimpresión (${missingSAT.join(", ")}), pero se procede a imprimir por prioridad de venta.`);
    }

    const allItems = (account.comandas || [])
      .flatMap((c) => c.items)
      .filter((i) => !i.isCancelled);

    try {
      const transport = await createTransport("cuentas", selectedTenant?.id);
      const driver = new EscPosDriver();
      const job = new PosPrinterJob(driver, transport as any);

      const rfcVal = (companyConfig.rfc || selectedTenant?.rfc || "").toUpperCase();
      const regVal = (companyConfig.regimenFiscal || selectedTenant?.regimenFiscal || "").toUpperCase();
      const lugVal = (companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion || "").toUpperCase();
      const dirVal = (companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").toUpperCase();
      const telVal = companyConfig.telefono || selectedTenant?.telefono || "";
      const emlVal = sanitizeEmail(companyConfig.email || selectedTenant?.email || "");
      const sucVal = (companyConfig.sucursal || selectedTenant?.sucursalDefault || "").toUpperCase();
      const bName = sanitizeBusinessName(companyConfig.businessName || selectedTenant?.name || "TACOS ROY").toUpperCase();

      job.initialize();
      job.center();
      job
        .setPrintMode(job.FONT_SIZE_BIG + job.FONT_EMPHASIZED)
        .bold(true)
        .printLine(bName)
        .setPrintMode(job.FONT_SIZE_NORMAL)
        .bold(false);
      job.printLine("--------------------------------");
      if (rfcVal) job.printLine(`RFC: ${rfcVal}`);
      if (regVal) job.printLine(`REGIMEN FISCAL: ${regVal}`);
      if (lugVal) job.printLine(`LUGAR EXPEDICION: ${lugVal}`);
      if (dirVal) job.printLine(`DIR: ${dirVal}`);
      if (sucVal) job.printLine(`SUC: ${sucVal}`);
      if (telVal) job.printLine(`📞 TEL. SUCURSAL: ${formatPhone(telVal) || telVal}`);
      if (emlVal) job.printLine(`✉️ ${emlVal.toLowerCase()}`);
      
      job.printLine("--------------------------------");
      if (customFolio !== undefined && customFolio !== null) {
        job.bold(true).printLine(`FOLIO: #${customFolio}`).bold(false);
      }
      job.printLine(`MESA: ${account.tableLabel}`);
      job.printLine(`FECHA: ${account.timestamp ? new Date(account.timestamp).toLocaleString("es-MX") : ""}`);
      job.printLine("--------------------------------");
      job.center().bold(true).printLine("📝 DETALLE DEL PEDIDO 📝").bold(false).left();
      job.printLine("--------------------------------");
      const getPaymentLabel = (acc: any) => {
        const m = (acc.paymentMethod || acc.metodoPago || acc.payment_method || acc.formaPago || acc.tipoPago || "").toString().toLowerCase().trim();
        const ct = (acc.cardType || acc.tipoTarjeta || "").toString().toLowerCase().trim();

        if (["cash", "efectivo"].includes(m)) return "💵 EFECTIVO";
        if (["card", "tarjeta", "credit", "debit", "credito", "debito"].includes(m)) {
          if (ct === "credito" || m === "credito") return "💳 TARJETA CRÉDITO";
          if (ct === "debito" || m === "debito") return "💳 TARJETA DÉBITO";
          return "💳 TARJETA";
        }
        if (["lupay", "lu-pay"].includes(m)) return "📲 LUPAY";
        if (["transfer", "transferencia", "spei"].includes(m)) return "💸 TRANSFERENCIA";
        if (m) return `💳 ${m.toUpperCase()}`;
        return "💵 EFECTIVO";
      };

      job.left();
      const summarized = allItems.reduce((acc: any[], item) => {
        const existing = acc.find((i) => i.product.id === item.product.id);
        if (existing) existing.quantity += item.quantity;
        else acc.push({ ...item });
        return acc;
      }, []);

      summarized.forEach((item) => {
        const line = `${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()}`;
        const price = `$${(item.quantity * item.product.price).toFixed(2)}`;
        const padding = " ".repeat(
          Math.max(1, 32 - line.length - price.length),
        );
        job.printLine(line + padding + price);
      });

      job.printLine("--------------------------------");
      job.right();
      job.printLine(`SUBTOTAL: $${account.subtotal.toFixed(2)}`);
      if (account.tip > 0) job.printLine(`PROPINA: $${account.tip.toFixed(2)}`);
      if (account.discount > 0)
        job.printLine(`DESCUENTO: -$${account.discount.toFixed(2)}`);
      job
        .bold(true)
        .printLine(`TOTAL: $${account.total.toFixed(2)}`)
        .bold(false);
      job.printLine(" ");
      job.center().printLine(`(${numeroALetras(account.total)})`).left();

      const payLabel = getPaymentLabel(account);
      if (payLabel) {
        job.center().bold(true).printLine(payLabel).bold(false).left();
      }

      if (account.requiresInvoice) {
        job.printLine("--------------------------------");
        job.left();
        job.bold(true).printLine("🧾 REQUIERE FACTURA").bold(false);
      }

      // -------------------------------------------------------------
      // SECCIÓN DE AUDITORÍA: CANCELACIONES EN LA PARTE INFERIOR
      // -------------------------------------------------------------
      const cancelled = (account.comandas || [])
        .flatMap((c) => c.items)
        .filter((i) => i.isCancelled);
      const isAccountCancelled = account.status === "cancelled";

      if (cancelled.length > 0 || isAccountCancelled) {
        job.printLine("--------------------------------");
        job.center().bold(true).printLine("AUDITORIA: CANCELACIONES").bold(false).left();
        job.printLine("--------------------------------");

        if (isAccountCancelled) {
          job.bold(true).printLine("CUENTA CANCELADA").bold(false);
          if ((account as any).cancellationReason) {
            job.printLine(`MOTIVO: ${String((account as any).cancellationReason).toUpperCase()}`);
          }
          if ((account as any).cancelledBy?.name) {
            job.printLine(`AUTORIZO: ${String((account as any).cancelledBy.name).toUpperCase()}`);
          }
          if (cancelled.length > 0) {
            job.printLine(" ");
          }
        }

        if (cancelled.length > 0) {
          const summarizedCancelled = cancelled.reduce((acc: any[], item) => {
            const reason = item.cancellationReason || "No especificado";
            const authUser = item.cancelledBy?.name || "";
            const existing = acc.find(
              (i) =>
                i.product.id === item.product.id &&
                i.cancellationReason === reason &&
                (i.cancelledBy?.name || "") === authUser
            );
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              acc.push({ ...item, cancellationReason: reason });
            }
            return acc;
          }, []);

          summarizedCancelled.forEach((item) => {
            job.printLine(
              `${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()} (CANC)`
            );
            job.printLine(`  MOTIVO: ${String(item.cancellationReason).toUpperCase()}`);
            if (item.cancelledBy?.name) {
              job.printLine(`  AUTORIZO: ${String(item.cancelledBy.name).toUpperCase()}`);
            }
          });
        }
      }

      job.printLine(" ");
      job.center();
      job.printLine(companyConfig.footerMessage.toUpperCase());
      job.cut();
      job.execute();
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  const printTicket = async (
    table: TableData,
    view: "resumen" | "comandas" | "comensales" = "resumen",
    explicitPaymentMethod?: string,
    explicitCardType?: string,
  ) => {
    const missingSAT = checkMissingSATFiscalFields();
    if (missingSAT.length > 0) {
      console.warn(`⚠️ [Impresión] Faltan datos fiscales del SAT para la precuenta (${missingSAT.join(", ")}), pero procediendo a imprimir.`);
    }

    await executePrintTicket({
      table,
      view,
      explicitPaymentMethod,
      explicitCardType,
      selectedTenant,
      companyConfig,
      currentUser,
      selectedDeliveryClient,
      selectedDeliveryAddress,
      deliveryNotes,
      paymentMethod,
      paymentCardType,
      paymentDiscountType,
      paymentDiscountValue,
      paymentTipValue,
      requiresInvoice,
      invoicePhone,
      triggerAppNotification,
      processedPrintIdsRef,
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );

  const zonesOrder: Record<string, number> = {
    "Salón Principal": 1,
    "Para Llevar": 2,
    "Servicio a Domicilio": 3,
  };
  const zones = effectiveTables
    .map((t) => t.zone || "Salón Principal")
    .filter((v, i, a) => Boolean(v) && a.indexOf(v) === i)
    .sort((a, b) => {
      const orderA = zonesOrder[a as string] || 99;
      const orderB = zonesOrder[b as string] || 99;
      return orderA - orderB;
    });

  const handleManualRefreshTables = async () => {
    if (!selectedTenant?.id) return;
    const tenantId = selectedTenant.id;
    setIsRefreshingTables(true);
    triggerAppNotification("🔄 REFRESCANDO MESAS", "Consultando Firestore en vivo...", "info");
    try {
      const liveTables = await fetchTablesFromFirebase(tenantId);
      const ensured = ensureAll35TablesForTenant(liveTables || [], tenantId);
      const parsed = ensured.map((t: any) => ({
        ...t,
        zone: normalizeZoneName(t.zone),
        comandas: (t.comandas || []).map((c: any) => ({
          ...c,
          timestamp:
            c.timestamp && typeof c.timestamp.toDate === "function"
              ? c.timestamp.toDate()
              : new Date(c.timestamp),
        })),
      }));
      setTables(parsed);
      try {
        localStorage.setItem("pos_tables_" + tenantId, JSON.stringify(parsed));
      } catch (e) {}
      const occupied = parsed.filter(
        (t: any) => t.status === "occupied" || (t.comandas && t.comandas.length > 0),
      );
      triggerAppNotification(
        "✅ MESAS ACTUALIZADAS",
        `Se cargaron ${occupied.length} mesas ocupadas desde la nube.`,
        "success",
      );
    } catch (err) {
      console.warn("Error refreshing tables manually:", err);
      triggerAppNotification("⚠️ ERROR DE REFRESCO", "No se pudieron obtener las mesas de la nube", "warning");
    } finally {
      setIsRefreshingTables(false);
    }
  };

    const renderClosedAccountsList = () => (
    <ClosedAccountsListView
      cancellationReason={cancellationReason}
      editingInvoiceAccountId={editingInvoiceAccountId}
      editingInvoicePhoneValue={editingInvoicePhoneValue}
      expandedAccountIds={expandedAccountIds}
      handleQuickChangeAccountStatus={handleQuickChangeAccountStatus}
      handleRevertAccountCancellation={handleRevertAccountCancellation}
      handleSendWhatsAppInvoice={handleSendWhatsAppInvoice}
      invoicePhone={invoicePhone}
      paymentMethod={paymentMethod}
      paymentMethodFilter={paymentMethodFilter}
      requiresInvoice={requiresInvoice}
      setAccountCancellationPin={setAccountCancellationPin}
      setAccountCancellationReason={setAccountCancellationReason}
      setAccountToEditPayment={setAccountToEditPayment}
      setEditingInvoiceAccountId={setEditingInvoiceAccountId}
      setEditingInvoicePhoneValue={setEditingInvoicePhoneValue}
      setExpandedAccountIds={setExpandedAccountIds}
      setExportingAccount={setExportingAccount}
      setHistory={setHistory}
      setIsEditPaymentModalOpen={setIsEditPaymentModalOpen}
      setPaymentMethodFilter={setPaymentMethodFilter}
      setPendingCancellationTarget={setPendingCancellationTarget}
      setSelectedAccountForCancellation={setSelectedAccountForCancellation}
      setSelectedDeliveryAccount={setSelectedDeliveryAccount}
      setShowAccountCancellationModal={setShowAccountCancellationModal}
      setShowAuthorizeCancellationModal={setShowAuthorizeCancellationModal}
      setTempCardLastFour={setTempCardLastFour}
      setTempPaymentCardType={setTempPaymentCardType}
      setTempPaymentMethod={setTempPaymentMethod}
      triggerAppNotification={triggerAppNotification}
          historyForCuentasTab={historyForCuentasTab}
          markAsPaid={markAsPaid}
          reprintAccount={reprintAccount}
      
    />
  );;

  const handleSwitchTablesMode = (targetMode: "floorplan" | "gestion_cuentas") => {
    setPreferredTablesMode(targetMode);
    setAppMode(targetMode);
    if (targetMode === "floorplan") {
      setSelectedTableGestion(null);
    } else {
      setSelectedTableId(null);
    }
  };

  const renderFloorplan = () => (
    <FloorplanView
      generalNotes={generalNotes}
      handleTableClick={handleTableClick}
      isListening={isListening}
      isOnline={isOnline}
      mainTab={mainTab}
      renderClosedAccountsList={renderClosedAccountsList}
      renderMaterialHeader={renderMaterialHeader}
      selectedTenant={selectedTenant}
      setMainTab={setMainTab}
      tables={tables}
      effectiveTables={effectiveTables}
      getComandaDestinations={getComandaDestinations}
      getComensalColor={getComensalColor}
      printComanda={printComanda}
      startVoiceRecognition={startVoiceRecognition}
      zones={zones}
      onSwitchTablesMode={handleSwitchTablesMode}
    />
  );;

  const menuString = useMemo(() => {
    return products.map((p) => `- ${p.name}`).join("\n");
  }, [products]);

  const processVoiceOrder = async (transcript: string) => {
    if (!transcript) return;

    // Helper to parse table label from transcript
    const parseTableLabelFromTranscript = (text: string): string | null => {
      const normalized = text.toLowerCase();
      const numberWords: { [key: string]: string } = {
        uno: "1", dos: "2", tres: "3", cuatro: "4", cinco: "5",
        seis: "6", siete: "7", ocho: "8", nueve: "9", diez: "10",
        once: "11", doce: "12", trece: "13", catorce: "14", quince: "15"
      };

      const match = normalized.match(/mesa\s+(\d+|[a-zñáéíóú]+)/i);
      if (match) {
        const value = match[1];
        if (/^\d+$/.test(value)) {
          return value;
        }
        if (numberWords[value]) {
          return numberWords[value];
        }
      }
      return null;
    };

    let targetTable = selectedTable;
    if (!targetTable) {
      const label = parseTableLabelFromTranscript(transcript);
      if (label) {
        const found = tables.find(t => t.label.toLowerCase() === label.toLowerCase());
        if (found) {
          targetTable = found;
          setSelectedTableId(found.id);
          setActiveCategory("food");
          setActiveSubcategory("");
          setCurrentComensal(1);
          setGeneralNotes("");
          setAppMode("menu");
          setCart([]);
        }
      }
    }

    if (!targetTable) {
      triggerAppNotification(
        "Mesa requerida", 
        "Por favor especifica una mesa en tu dictado (ej. 'Mesa 2: dos tacos de alambre') o entra a una mesa antes de hablar.", 
        "warning"
      );
      setIsProcessingVoice(false);
      setShowVoiceToast(false);
      return;
    }

    setIsProcessingVoice(true);
    setVoiceToastMessage(`🎙️ "${transcript}"\n🔮 Procesando con IA...`);
    setShowVoiceToast(true);

    let parsedItems = null;
    let fallbackUsed = false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // Límite de 30 segundos ⏱️

    try {
      const apiKeyToUse =
        companyConfig.geminiApiKey ||
        localStorage.getItem("custom_gemini_api_key") ||
        ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);

      let voiceGeminiSucceeded = false;

      if (apiKeyToUse) {
        setVoiceToastMessage(
          `🎙️ "${transcript}"\n🔮 Procesando con IA (Gemini directo)...`,
        );
        try {
          const menuStringForGemini = products
            .map((p) => `- ID: "${p.id}", Nombre: "${p.name}"`)
            .join("\n");
          const promptText = `Dado el siguiente dictado de voz de un cliente en un restaurante de comunidad hispanohablante: "${transcript}"
Interpreta el dictado de voz y asócialo de forma inteligente con los productos disponibles en el menú.

Menú del restaurante con sus respectivos IDs y nombres oficiales:
${menuStringForGemini}

Instrucciones:
1. Analiza el texto dictado e identifica los platillos, bebidas, postres u otros productos solicitados.
2. Mapea cada artículo con el producto correcto del menú. DEBES retornar el 'productId' de ese producto mapeado. Si no hay coincidencia exacta (por ejemplo, por pequeñas diferencias o variaciones coloquiales), busca el más similar/concordante y usa su 'productId' correspondiente del menú. Es obligatorio rellenar el campo 'productId' con un ID válido del menú.
3. Extrae la cantidad solicitada (por defecto es 1 si no se especifica).
4. Extrae cualquier instrucción especial o notas opcionales (p. ej., "sin cebolla", "con hielo", "bien cocido").
5. Identifica de forma inteligente si en el texto se indica qué comensal o plato ordena el producto (ej. "el comensal dos", "para el comensal 3", "para el uno", "persona 4"). Si se especifica, extrae el número del comensal como un número entero del 1 al 5 en el campo 'plate'. Si no se menciona, no incluyas el campo o déjalo nulo.
6. Retorna exclusivamente un arreglo JSON con objetos que contengan {productId, productName, quantity, notes, plate}.
7. El resultado debe ser EXCLUSIVAMENTE el JSON, sin formato markdown, sin explicaciones, de forma directa.`;

          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKeyToUse}`;

          const requestBody = {
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    productId: { type: "STRING" },
                    productName: { type: "STRING" },
                    quantity: { type: "NUMBER" },
                    notes: { type: "STRING" },
                    plate: { type: "INTEGER" },
                  },
                  required: ["productId", "productName", "quantity"],
                },
              },
            },
          };

          const directResp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (directResp.ok) {
            const directData = await directResp.json();
            const jsonText =
              directData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
            parsedItems = JSON.parse(jsonText.trim());
            voiceGeminiSucceeded = true;
            console.log(
              "[Client Gemini] ¡Orden por voz procesada con éxito via API directo!",
            );
          } else {
            console.warn(
              `[Client Gemini] Error de API directo: ${directResp.status}`,
            );
          }
        } catch (geminiVoiceErr) {
          console.warn(
            "[Client Gemini] Falló procesamiento directo:",
            geminiVoiceErr,
          );
        }
      }

      if (!voiceGeminiSucceeded) {
        try {
          const resp = await fetch("/api/voice-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              transcript,
              menuString,
              menu: products.map((p) => ({ id: p.id, name: p.name })),
            }),
          });

          if (!resp.ok) {
            throw new Error("API call failed.");
          }

          const contentType = resp.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error(
              "Respuesta no es JSON (recibido " +
                (contentType || "ninguno") +
                "). Puede ser una redirección de hosting estático.",
            );
          }

          parsedItems = await resp.json();
          voiceGeminiSucceeded = true;
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.warn(
              "🚨 Solicitud de orden por voz cancelada por exceder límite de 30 segundos.",
            );
            setIsProcessingVoice(false);
            setVoiceToastMessage(
              "🛑 El tiempo de procesamiento de orden excedió los 30 segundos. El pedido no pudo ser procesado.",
            );
            setShowVoiceToast(true);
            triggerAppNotification(
              "⚠️ Tiempo de Espera Excedido",
              "La orden por voz tardó demasiado y fue cancelada de forma automática.",
              "warning",
            );
            if (feedbackTimerRef.current)
              clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = setTimeout(() => {
              setShowVoiceToast(false);
            }, 8000);
            return; // Salir de inmediato y cancelar el flujo completo
          }

          console.warn(
            "Fallo al contactar servidor de comandos por voz. Intentando modo offline... ⚡",
            error,
          );
        }
      }

      if (!voiceGeminiSucceeded) {
        fallbackUsed = true;
        setVoiceToastMessage(
          `🎙️ "${transcript}"\n⚡ Procesando sin internet (Modo Offline)...`,
        );

        try {
          const localMatches = parseVoiceTranscriptLocally(
            transcript,
            products,
            currentComensal,
          );
          if (localMatches && localMatches.length > 0) {
            parsedItems = localMatches.map((m) => ({
              productId: m.product.id,
              productName: m.product.name,
              quantity: m.quantity,
              notes: m.notes,
              plate: m.plate,
            }));
          }
        } catch (localErr) {
          console.error("Local matching failed:", localErr);
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // Helper normalizador de strings para un emparejamiento inteligente y flexible 🧠
    const normalizeStr = (str: string) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quitar acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // quitar puntuaciones
        .trim();
    };

    // Helper de Levenshtein para emparejamiento por similitud
    const getLevenshteinDistance = (a: string, b: string): number => {
      const matrix: number[][] = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1, // deletion
            );
          }
        }
      }
      return matrix[b.length][a.length];
    };

    const getStringSimilarity = (s1: string, s2: string): number => {
      const norm1 = normalizeStr(s1);
      const norm2 = normalizeStr(s2);
      if (norm1 === norm2) return 1.0;
      if (!norm1 || !norm2) return 0.0;
      const maxLength = Math.max(norm1.length, norm2.length);
      const distance = getLevenshteinDistance(norm1, norm2);
      return (maxLength - distance) / maxLength;
    };

    const getProductSimilarity = (
      transcriptItem: string,
      productName: string,
    ): number => {
      const normT = normalizeStr(transcriptItem);
      const normP = normalizeStr(productName);
      if (normT === normP) return 1.0;
      if (!normT || !normP) return 0.0;

      // 1. Similitud directa a nivel de caracteres (Levenshtein)
      const directSim = getStringSimilarity(normT, normP);
      if (directSim > 0.82) return directSim;

      // 2. Similitud a nivel de palabras (soporta reordenamiento y palabras intermedias)
      const wordsT = normT.split(/\s+/).filter((w) => w.length > 1);
      const wordsP = normP.split(/\s+/).filter((w) => w.length > 1);
      if (wordsT.length === 0 || wordsP.length === 0) return 0.0;

      let totalMatchScore = 0;
      wordsT.forEach((w1) => {
        let bestWordSim = 0;
        wordsP.forEach((w2) => {
          const sim = getStringSimilarity(w1, w2);
          if (sim > bestWordSim) {
            bestWordSim = sim;
          }
        });
        if (bestWordSim >= 0.7) {
          totalMatchScore += bestWordSim;
        }
      });

      const wordSim = totalMatchScore / Math.max(wordsT.length, wordsP.length);
      return Math.max(directSim, wordSim);
    };

    // Intento rápido de extraer comensal desde el texto en cliente como fallback del fallback 🔎
    const lowerTranscript = transcript.toLowerCase();
    let detectedFallbackComensal = currentComensal;
    if (
      lowerTranscript.includes("comensal 1") ||
      lowerTranscript.includes("comensal uno") ||
      lowerTranscript.includes("para el uno")
    )
      detectedFallbackComensal = 1;
    else if (
      lowerTranscript.includes("comensal 2") ||
      lowerTranscript.includes("comensal dos") ||
      lowerTranscript.includes("para el dos")
    )
      detectedFallbackComensal = 2;
    else if (
      lowerTranscript.includes("comensal 3") ||
      lowerTranscript.includes("comensal tres") ||
      lowerTranscript.includes("para el tres")
    )
      detectedFallbackComensal = 3;
    else if (
      lowerTranscript.includes("comensal 4") ||
      lowerTranscript.includes("comensal cuatro") ||
      lowerTranscript.includes("para el cuatro")
    )
      detectedFallbackComensal = 4;
    else if (
      lowerTranscript.includes("comensal 5") ||
      lowerTranscript.includes("comensal cinco") ||
      lowerTranscript.includes("para el cinco")
    )
      detectedFallbackComensal = 5;

    const newCartItems: CartItem[] = [];

    if (parsedItems && Array.isArray(parsedItems)) {
      parsedItems.forEach(
        (item: {
          productId?: string;
          productName: string;
          quantity: number;
          notes?: string;
          plate?: number;
        }) => {
          let product = null;

          // 1. Intentar emparejar por el ID exacto retornado por Gemini 🎯
          if (item.productId) {
            product = products.find((p) => p.id === item.productId);
          }

          // 2. Si no coincide por ID, intentar coincidencia exacta o similitud inteligente
          if (!product && item.productName) {
            const normalizedItemName = normalizeStr(item.productName);
            product = products.find(
              (p) => normalizeStr(p.name) === normalizedItemName,
            );

            if (!product) {
              let bestSimilarity = 0;
              let bestProduct = null;

              products.forEach((p) => {
                const sim = getProductSimilarity(item.productName, p.name);
                if (sim > bestSimilarity) {
                  bestSimilarity = sim;
                  bestProduct = p;
                }
              });

              // Umbral de coincidencia flexible y preciso (0.40)
              if (bestSimilarity >= 0.4) {
                product = bestProduct;
              }
            }
          }

          if (product) {
            const itemComensal =
              item.plate && item.plate >= 1 && item.plate <= 5
                ? Number(item.plate)
                : detectedFallbackComensal;

            newCartItems.push({
              product,
              quantity: item.quantity,
              plate: itemComensal,
              notes: item.notes,
            });

            // Auto-seleccionar la pestaña del comensal detectado de manera ágil
            setCurrentComensal(itemComensal);
          }
        },
      );
    }

    if (newCartItems.length > 0) {
      setCart((prev) => [...prev, ...newCartItems]);
      setLastAddedItems(newCartItems);
      setShowComensalPreview(true);

      const addedText = newCartItems
        .map(
          (i) =>
            `${i.quantity}x ${getFormattedProductName(i.product)} (Comensal ${i.plate})`,
        )
        .join(", ");
      setVoiceToastMessage(
        `✅ Agregado: ${addedText} ${fallbackUsed ? "(Local ⚡)" : ""}`,
      );
      setShowVoiceToast(true);

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setIsProcessingVoice(false);
        setShowVoiceToast(false);
      }, 4500);
    } else {
      setVoiceToastMessage(
        `⚠️ No se identificaron productos del menú en tu grabación: "${transcript}"`,
      );
      setShowVoiceToast(true);
      setIsProcessingVoice(false);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setShowVoiceToast(false);
      }, 5000);
    }
  };

  const sanitizeSpeechTranscript = (rawText: string): string => {
    if (!rawText) return "";
    // Remove letter stutter separated by hyphen, spaces (e.g. d-d-d-d, d d d d)
    let clean = rawText.replace(/\b([a-zA-Z])(?:[- ]+\1)+\b/gi, "$1");
    // Remove short syllable repetition (e.g. de-de, un-un)
    clean = clean.replace(/\b([a-zA-Z]{1,3})(?:[- ]+\1)+\b/gi, "$1");
    // Remove consecutive word duplications (e.g. para para, de de)
    clean = clean.replace(/\b([a-zA-ZñÑáéíóúÁÉÍÓÚ]+)\s+\1\b/gi, "$1");
    // Clean up stray consonant stutters as standalone words
    clean = clean.replace(/\b[b-df-hj-np-tv-z]\b/gi, "");
    return clean.trim().replace(/\s+/g, " ");
  };

  const startVoiceRecognition = async () => {
    // 1. Si ya se está procesando el pedido de IA, ignorar clics adicionales
    if (isProcessingVoice) return;

    // 2. Si ya está escuchando de forma activa, detener de inmediato para procesar la transcipción
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error al detener reconocimiento:", e);
        }
      }
      setIsListening(false);
      return;
    }

    // 3. Si se hace clic mientras el micrófono se está inicializando (esperando permisos/getUserMedia):
    // Cancelar la inicialización pendiente de forma inmediata y apagar la interfaz
    if (isStartingVoiceRef.current) {
      cancelPendingVoiceRef.current = true;
      isStartingVoiceRef.current = false;
      setIsListening(false);
      setShowVoiceToast(false);
      return;
    }

    // Activar estados de inicialización
    isStartingVoiceRef.current = true;
    cancelPendingVoiceRef.current = false;

    // Si por alguna razón está en 0 o no válido, asegurar que es mínimo 1
    if (currentComensal < 1) {
      setCurrentComensal(1);
    }
    setShowComensalPreview(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Tu navegador no soporta el reconocimiento de voz. En iOS usa Safari; en Android usa Chrome/Edge; y asegúrate de no estar en navegación de incógnito.",
      );
      isStartingVoiceRef.current = false;
      return;
    }

    // Solicitar permiso nativo de micrófono antes de arrancar SpeechRecognition.
    // Esto garantiza que el navegador abra el popup de permiso nativo y unifique iOS/Android.
    try {
      setVoiceToastMessage("Iniciando micrófono... 🎙️");
      setShowVoiceToast(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Detener las pistas inmediatamente después para que no causen conflicto con SpeechRecognition
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      isStartingVoiceRef.current = false;
      console.error("Microphone Access Error:", err);
      let errMsg =
        "No se pudo acceder al micrófono. Por favor, actívalo en la configuración de tu navegador.";
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        errMsg =
          "Permiso de micrófono denegado. Por favor, haz clic sobre el candado en la URL y dale permiso de Micrófono 🎙️";
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        errMsg =
          "No se detectó un micrófono físico conectado en tu dispositivo.";
      }
      alert(errMsg);
      setVoiceToastMessage(`❌ ${errMsg}`);
      setShowVoiceToast(true);
      setTimeout(() => setShowVoiceToast(false), 6000);
      return;
    }

    // Si el usuario canceló la inicialización durante el tiempo de espera del permiso, salir de inmediato
    if (cancelPendingVoiceRef.current) {
      isStartingVoiceRef.current = false;
      cancelPendingVoiceRef.current = false;
      setShowVoiceToast(false);
      return;
    }

    transcriptRef.current = "";
    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.interimResults = true;
    recognition.continuous = false; // continuous = false avoids browser loop bugs and "d-d-d" stutter
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isStartingVoiceRef.current = false; // Inicialización terminada con éxito!
      setIsListening(true);
      setShowVoiceToast(true);
      setVoiceToastMessage("Escuchando... Di tu pedido ahora 🎙️");
    };

    recognition.onresult = (event: any) => {
      let speechSoFar = "";
      for (let i = 0; i < event.results.length; i++) {
        speechSoFar += event.results[i][0].transcript;
      }

      const currentTranscript = speechSoFar.trim().replace(/\s+/g, " ");
      const sanitizedHTML = sanitizeSpeechTranscript(currentTranscript);
      transcriptRef.current = sanitizedHTML;

      // Actualizar el texto en pantalla en tiempo real con lo que el usuario habla
      setVoiceToastMessage(sanitizedHTML || "Escuchando...");

      // Detección de palabras clave para terminar rápidamente
      const stopKeywords = [
        "listo",
        "terminar",
        "hecho",
        "confirmar",
        "ya está",
        "finalizar",
      ];
      const lastResult =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (stopKeywords.some((k) => lastResult.includes(k))) {
        // Exclusión de la palabra clave del pedido final
        let cleaned = sanitizedHTML;
        stopKeywords.forEach((k) => {
          const regex = new RegExp(`\\b${k}\\b`, "gi");
          cleaned = cleaned.replace(regex, "");
        });
        transcriptRef.current = sanitizeSpeechTranscript(cleaned);
        recognition.stop();
      }
    };

    recognition.onerror = (event: any) => {
      isStartingVoiceRef.current = false;
      console.error("Speech recognition error:", event.error);
      let errorMsg = "Error en el reconocimiento de voz.";
      if (event.error === "not-allowed") {
        errorMsg = "Permiso de micrófono bloqueado por el navegador o iframe.";
      } else if (event.error === "service-not-allowed") {
        errorMsg =
          "Servicio de reconocimiento de voz restringido en este dispositivo.";
      } else if (event.error === "no-speech") {
        errorMsg =
          "No se detectó sonido. Intenta hablar más fuerte o acérquese al micrófono.";
      } else if (event.error === "audio-capture") {
        errorMsg = "No se pudo capturar audio. Revisa tu micrófono.";
      } else if (event.error === "network") {
        errorMsg =
          "Error de red. La transcripción por voz requiere conexión activa a internet.";
      }
      setVoiceToastMessage(`⚠️ ${errorMsg}`);

      // Permitir al usuario ver el mensaje de error por unos segundos antes de cerrar
      setTimeout(() => {
        setIsListening(false);
        setShowVoiceToast(false);
      }, 4000);
    };

    recognition.onend = () => {
      isStartingVoiceRef.current = false;
      setIsListening(false);
      const finalResult = transcriptRef.current.trim().replace(/\s+/g, " ");
      if (finalResult) {
        processVoiceOrder(finalResult);
      } else {
        setShowVoiceToast(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleNoteVoiceRecognition = async () => {
    if (isListeningNote) {
      if (noteRecognitionRef.current) {
        try {
          noteRecognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping note recognition:", e);
        }
      }
      setIsListeningNote(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el reconocimiento de voz para notas.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      console.error(err);
      alert("No se pudo acceder al micrófono para dictar la nota.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.continuous = false; // continuous = false prevents repeating speech segments on mobile browsers
    recognition.interimResults = true;

    const baseNote = tempNote.trim();

    recognition.onstart = () => {
      setIsListeningNote(true);
    };

    recognition.onresult = (event: any) => {
      let speechSoFar = "";
      for (let i = 0; i < event.results.length; i++) {
        speechSoFar += event.results[i][0].transcript;
      }
      const text = speechSoFar.trim().replace(/\s+/g, " ");
      const sanitized = sanitizeSpeechTranscript(text);
      if (sanitized) {
        setTempNote(baseNote ? `${baseNote} ${sanitized}` : sanitized);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition note error:", event.error);
      setIsListeningNote(false);
    };

    recognition.onend = () => {
      setIsListeningNote(false);
    };

    noteRecognitionRef.current = recognition;
    recognition.start();
  };

  const renderDeliveryPanel = () => (
    <DeliveryPanelView
      deliveryNotes={deliveryNotes}
      selectedDeliveryAddress={selectedDeliveryAddress}
      selectedDeliveryClient={selectedDeliveryClient}
      selectedTable={selectedTable}
      setShowDeliverySetupModal={setShowDeliverySetupModal}
      
    />
  );;

  const renderMenu = () => (
    <MenuView
      activeCategory={activeCategory}
      activeSubcategory={activeSubcategory}
      activeSubgroup={activeSubgroup}
      appMode={appMode}
      cart={cart}
      currentComensal={currentComensal}
      currentUser={currentUser}
      inventory={inventory}
      isListening={isListening}
      isOnline={isOnline}
      isProcessingVoice={isProcessingVoice}
      menuSearchQuery={menuSearchQuery}
      productCategories={productCategories}
      products={products}
      renderDeliveryPanel={renderDeliveryPanel}
      renderMaterialHeader={renderMaterialHeader}
      selectedTable={selectedTable}
      setActiveCategory={setActiveCategory}
      setActiveDrinkType={setActiveDrinkType}
      setActiveSubcategory={setActiveSubcategory}
      setActiveSubgroup={setActiveSubgroup}
      setAppMode={setAppMode}
      setCurrentComensal={setCurrentComensal}
      setMenuSearchQuery={setMenuSearchQuery}
      setReviewComensal={setReviewComensal}
      setSelectedTableGestion={setSelectedTableGestion}
      setShowComensalPreview={setShowComensalPreview}
      setShowComensalesBar={setShowComensalesBar}
      setShowVoiceToast={setShowVoiceToast}
      showComensalPreview={showComensalPreview}
      showComensalesBar={showComensalesBar}
      showVoiceToast={showVoiceToast}
      voiceToastMessage={voiceToastMessage}
          addToCart={addToCart}
          getComensalColor={getComensalColor}
          openItemNoteModal={openItemNoteModal}
          startVoiceRecognition={startVoiceRecognition}
          totalItems={totalItems}
          totalPrice={totalPrice}
          updateQuantity={updateQuantity}
      
    />
  );;

  const openItemNoteModal = (
    productId: string,
    plate: number,
    currentNote?: string,
  ) => {
    setItemToNote({ productId, plate, currentNote });
    setTempNote(currentNote || "");
  };

  const saveItemNote = () => {
    if (itemToNote) {
      updateItemNoteInCart(itemToNote.productId, itemToNote.plate, tempNote);
      setItemToNote(null);
      if (isListeningNote) {
        try {
          noteRecognitionRef.current?.stop();
        } catch (e) {}
        setIsListeningNote(false);
      }
    }
  };

  const renderReviewItem = (item: CartItem, idx?: number) => (
    <ReviewItemView 
          idx={idx}
          item={item}
          openItemNoteModal={openItemNoteModal}
          updateQuantity={updateQuantity}
    />
  );

  const renderPrecuentaItem = (item: CartItem, showDelete = false, folio?: number, index?: number) => (
    <PrecuentaItemView
      key={`precuenta-item-${item.product.id}-${folio ?? 'sum'}-${index ?? 0}-${item.plate ?? 0}-${item.notes ?? ''}-${item.isCancelled ? 'canc' : 'act'}`}
      item={item}
      showDelete={showDelete}
      cancellationReason={cancellationReason}
      handleRevertItemCancellation={handleRevertItemCancellation}
      itemsSelectedForCancellation={itemsSelectedForCancellation}
      selectedTable={selectedTable}
      setItemsSelectedForCancellation={setItemsSelectedForCancellation}
      setPendingCancellationTarget={setPendingCancellationTarget}
      setShowAuthorizeCancellationModal={setShowAuthorizeCancellationModal} 
      folio={folio} 
      index={index}
      getComensalColor={getComensalColor}
    />
  );

  const renderReview = () => (
    <ReviewView
      appMode={appMode}
      cart={cart}
      checkoutReturnMode={checkoutReturnMode}
      currentUser={currentUser}
      generalNotes={generalNotes}
      isGeneratingOrder={isGeneratingOrder}
      renderReviewItem={renderReviewItem}
      reviewComensal={reviewComensal}
      selectedTable={selectedTable}
      setAppMode={setAppMode}
      setCart={setCart}
      setCheckoutReturnMode={setCheckoutReturnMode}
      setConfirmRestart={setConfirmRestart}
      setGeneralNotes={setGeneralNotes}
      setReviewComensal={setReviewComensal}
      setSelectedTableGestion={setSelectedTableGestion}
      generateOrder={generateOrder}
      getComensalColor={getComensalColor}
      triggerAppNotification={triggerAppNotification}
    />
  );

  const renderTableDetails = () => (
    <TableDetailsView
      appMode={appMode}
      cancellationReason={cancellationReason}
      checkoutReturnMode={checkoutReturnMode}
      currentUser={currentUser}
      handleRevertEntireComandaCancellation={handleRevertEntireComandaCancellation}
      isPrintingPrecuenta={isPrintingPrecuenta}
      itemsSelectedForCancellation={itemsSelectedForCancellation}
      precuentaComensal={precuentaComensal}
      precuentaTab={precuentaTab}
      renderDeliveryPanel={renderDeliveryPanel}
      renderMaterialHeader={renderMaterialHeader}
      renderPrecuentaItem={renderPrecuentaItem}
      selectedTable={selectedTable}
      setActiveCategory={setActiveCategory}
      setActiveSubcategory={setActiveSubcategory}
      setAppMode={setAppMode}
      setCancellationPin={setCancellationPin}
      setCancellationReason={setCancellationReason}
      setCheckoutFallbackItems={setCheckoutFallbackItems}
      setCheckoutReturnMode={setCheckoutReturnMode}
      setComandaToCancel={setComandaToCancel}
      setIsPrintingPrecuenta={setIsPrintingPrecuenta}
      setItemsSelectedForCancellation={setItemsSelectedForCancellation}
      setMoveItemsSelection={setMoveItemsSelection}
      setPaymentAmountReceived={setPaymentAmountReceived}
      setPaymentDiscountValue={setPaymentDiscountValue}
      setPaymentMethod={setPaymentMethod}
      setPaymentTipValue={setPaymentTipValue}
      setPrecuentaComensal={setPrecuentaComensal}
      setPrecuentaModalType={setPrecuentaModalType}
      setPrecuentaTab={setPrecuentaTab}
      setRequiresInvoice={setRequiresInvoice}
      setSelectedTableGestion={setSelectedTableGestion}
      setShowBulkItemCancellationReasonModal={setShowBulkItemCancellationReasonModal}
      setShowCancellationModal={setShowCancellationModal}
      setShowDiscountInput={setShowDiscountInput}
      setShowMoveItemsModal={setShowMoveItemsModal}
      setShowPaymentOptions={setShowPaymentOptions}
      setShowTipInput={setShowTipInput}
      setShowTransferTableModal={setShowTransferTableModal}
      setTransferTargetTableId={setTransferTargetTableId}
      triggerAppNotification={triggerAppNotification}
          cancelEntireComanda={cancelEntireComanda}
          getComandaDestinations={getComandaDestinations}
          getComensalColor={getComensalColor}
          printComanda={printComanda}
          printTicket={printTicket}
      
    />
  );;

  const renderCheckout = () => (
    <CheckoutView
      selectedTenant={selectedTenant}
      cancellationReason={cancellationReason}
      checkoutFallbackItems={checkoutFallbackItems}
      checkoutReturnMode={checkoutReturnMode}
      currentUser={currentUser}
      invoicePhone={invoicePhone}
      isProcessingPayment={isProcessingPayment}
      paymentAmountReceived={paymentAmountReceived}
      paymentCardLastFour={paymentCardLastFour}
      paymentCardType={paymentCardType}
      paymentDiscountTarget={paymentDiscountTarget}
      paymentDiscountType={paymentDiscountType}
      paymentDiscountValue={paymentDiscountValue}
      paymentMethod={paymentMethod}
      paymentTipTarget={paymentTipTarget}
      paymentTipValue={paymentTipValue}
      renderMaterialHeader={renderMaterialHeader}
      renderPrecuentaItem={renderPrecuentaItem}
      requiresInvoice={requiresInvoice}
      selectedAccountForPayment={selectedAccountForPayment}
      selectedTable={selectedTable}
      setAppMode={setAppMode}
      setInvoicePhone={setInvoicePhone}
      setPasswordTarget={setPasswordTarget}
      setPaymentAmountReceived={setPaymentAmountReceived}
      setPaymentCardLastFour={setPaymentCardLastFour}
      setPaymentCardType={setPaymentCardType}
      setPaymentDiscountTarget={setPaymentDiscountTarget}
      setPaymentDiscountType={setPaymentDiscountType}
      setPaymentDiscountValue={setPaymentDiscountValue}
      setPaymentMethod={setPaymentMethod}
      setPaymentTipValue={setPaymentTipValue}
      setPrecuentaComensal={setPrecuentaComensal}
      setPrecuentaTab={setPrecuentaTab}
      setRequiresInvoice={setRequiresInvoice}
      setShowDiscountInput={setShowDiscountInput}
      setShowPasswordInput={setShowPasswordInput}
      setShowPaymentOptions={setShowPaymentOptions}
      setShowTipInput={setShowTipInput}
      showDiscountInput={showDiscountInput}
      showPaymentOptions={showPaymentOptions}
      showTipInput={showTipInput}
          finalizePayment={finalizePayment}
          openNumpad={openNumpad}
      
    />
  );;

  const renderUsersManagementPanel = () => (
    <UsersManagementPanelView
      COMPANY_CATALOG={COMPANY_CATALOG}
      activeOwnerFilter={activeOwnerFilter}
      currentUser={currentUser}
      handleAddRow={handleAddRow}
      handleCellChange={handleCellChange}
      handleDeleteRow={handleDeleteRow}
      isSystemsMode={isSystemsMode}
      restrictedOwnerKey={restrictedOwnerKey}
      selectedTenant={selectedTenant}
      setShowEmployeeGuide={setShowEmployeeGuide}
      showEmployeeGuide={showEmployeeGuide}
      triggerAppNotification={triggerAppNotification}
      users={users}
      
    />
  );;

  const renderAdminPanel = () => (
    <AdminPanelView
      adminViewOnlyCorte={adminViewOnlyCorte}
      checkoutReturnMode={checkoutReturnMode}
      companyConfig={companyConfig}
      configActiveTab={configActiveTab}
      connectedBtDeviceName={connectedBtDeviceName}
      corteTab={corteTab}
      currentUser={currentUser}
      handleDownloadCorteReport={handleDownloadCorteReport}
      handleDownloadPrecorteReport={handleDownloadPrecorteReport}
      handlePrintCorte={handlePrintCorte}
      handlePrintPrecorte={handlePrintPrecorte}
      handleResetAllSystems={handleResetAllSystems}
      handleResetSales={handleResetSales}
      handleRevertAccountCancellation={handleRevertAccountCancellation}
      handleRevertEntireComandaCancellation={handleRevertEntireComandaCancellation}
      handleRevertItemCancellation={handleRevertItemCancellation}
      history={history}
      inventory={inventory}
      isOnline={isOnline}
      printerQueue={printerQueue}
      productCategories={productCategories}
      products={products}
      renderMaterialHeader={renderMaterialHeader}
      renderUsersManagementPanel={renderUsersManagementPanel}
      selectedTenant={selectedTenant}
      setAdminViewOnlyCorte={setAdminViewOnlyCorte}
      setAppMode={setAppMode}
      setBluetoothPrinterBarra={setBluetoothPrinterBarra}
      setBluetoothPrinterCocina={setBluetoothPrinterCocina}
      setBluetoothPrinterCuentas={setBluetoothPrinterCuentas}
      setBluetoothTransportMode={setBluetoothTransportMode}
      setCheckoutReturnMode={setCheckoutReturnMode}
      setCompanyConfig={setCompanyConfig}
      setConfigActiveTab={setConfigActiveTab}
      setCorteTab={setCorteTab}
      setManageMenuTab={setManageMenuTab}
      setMenuToastMessage={setMenuToastMessage}
      setPendingCancellationTarget={setPendingCancellationTarget}
      setSelectedTableGestion={setSelectedTableGestion}
      setSelectedTenant={setSelectedTenant}
      setShowAuthorizeCancellationModal={setShowAuthorizeCancellationModal}
      setShowBluetoothConfigModal={setShowBluetoothConfigModal}
      setShowCashMovementModal={setShowCashMovementModal}
      setShowCorteModal={setShowCorteModal}
      setShowMenuToast={setShowMenuToast}
      setShowPrinterTemplateModal={setShowPrinterTemplateModal}
      setShowResetSalesConfirm={setShowResetSalesConfirm}
      setSystemLocalWindowsAutoPrint={setSystemLocalWindowsAutoPrint}
      setSystemUseRawBt={setSystemUseRawBt}
      setTicketBusinessName={setTicketBusinessName}
      setTicketDireccionFiscal={setTicketDireccionFiscal}
      setTicketEmail={setTicketEmail}
      setTicketFooterMessage={setTicketFooterMessage}
      setTicketGeminiApiKey={setTicketGeminiApiKey}
      setTicketLugarExpedicion={setTicketLugarExpedicion}
      setTicketRegimenFiscal={setTicketRegimenFiscal}
      setTicketRequireInternalFolio={setTicketRequireInternalFolio}
      setTicketRfc={setTicketRfc}
      setTicketSucursal={setTicketSucursal}
      setTicketTelefono={setTicketTelefono}
      setWebsocketSyncLog={setWebsocketSyncLog}
      showCorteModal={showCorteModal}
      showResetSalesConfirm={showResetSalesConfirm}
      systemLocalWindowsAutoPrint={systemLocalWindowsAutoPrint}
      systemUseRawBt={systemUseRawBt}
      tables={tables}
      tenantPrinterConfig={tenantPrinterConfig}
      ticketBusinessName={ticketBusinessName}
      ticketDireccionFiscal={ticketDireccionFiscal}
      ticketEmail={ticketEmail}
      ticketFooterMessage={ticketFooterMessage}
      ticketGeminiApiKey={ticketGeminiApiKey}
      ticketLugarExpedicion={ticketLugarExpedicion}
      ticketRegimenFiscal={ticketRegimenFiscal}
      ticketRequireInternalFolio={ticketRequireInternalFolio}
      ticketRfc={ticketRfc}
      ticketSucursal={ticketSucursal}
      ticketTelefono={ticketTelefono}
      triggerAppNotification={triggerAppNotification}
      users={users}
      websocketSyncLog={websocketSyncLog}
          cancelEntireComanda={cancelEntireComanda}
          corteData={corteData}
          generateCorteTicketText={generateCorteTicketText}
          generatePrecorteTicketText={generatePrecorteTicketText}
          sanitizeBusinessName={sanitizeBusinessName}
          sanitizeEmail={sanitizeEmail}
          efectivoCount={efectivoCount}
          setEfectivoCount={setEfectivoCount}
          totalArqueo={totalArqueo}
      
    />
  );;



  const handleImportTenantMenu = async () => {
    if (importInProgressRef.current) return;
    importInProgressRef.current = true;
    setIsImportingTenantMenu(true);
    try {
      const ok = await executeImportTenantMenu({
        importSelectedTenantId,
        selectedTenant,
        companyCatalog: COMPANY_CATALOG,
        currentProducts: products,
        triggerAppNotification,
      });
      if (ok) {
        setImportSelectedTenantId("");
        setManageMenuTab(null);
        setImportConfirmStep(0);
      }
    } finally {
      setIsImportingTenantMenu(false);
      importInProgressRef.current = false;
    }
  };

  const handleReplicateMenuToTenants = async (targetTenantIds: string[]) => {
    if (importInProgressRef.current) return;
    importInProgressRef.current = true;
    setIsImportingTenantMenu(true);
    try {
      const ok = await executeReplicateMenuToTenants({
        targetTenantIds,
        selectedTenant,
        companyCatalog: COMPANY_CATALOG,
        currentProducts: products,
        triggerAppNotification,
      });
      if (ok) {
        setManageMenuTab(null);
      }
    } finally {
      setIsImportingTenantMenu(false);
      importInProgressRef.current = false;
    }
  };

  const renderManageMenu = () => (
    <ManageMenuView
      COMPANY_CATALOG={COMPANY_CATALOG}
      analysisStatus={analysisStatus}
      backups={backups}
      bulkSubcategory={bulkSubcategory}
      bulkSubgroup={bulkSubgroup}
      collapsedTreeSections={collapsedTreeSections}
      collapsedTreeSubgroups={collapsedTreeSubgroups}
      currentUser={currentUser}
      customApiKey={customApiKey}
      customAppId={customAppId}
      customAuthDomain={customAuthDomain}
      customDbId={customDbId}
      customProjectId={customProjectId}
      detectedProducts={detectedProducts}
      diagnosticBackups={diagnosticBackups}
      diagnosticProducts={diagnosticProducts}
      diagnosticRunCount={diagnosticRunCount}
      draggedIndex={draggedIndex}
      draggedOverIndex={draggedOverIndex}
      editingNoteProductId={editingNoteProductId}
      editingNoteText={editingNoteText}
      enableBackupNotifications={enableBackupNotifications}
      handleAddProductsToMenu={handleAddProductsToMenu}
      handleDragEnd={handleDragEnd}
      handleDragOver={handleDragOver}
      handleDragStart={handleDragStart}
      handleDrop={handleDrop}
      handleExcelUpload={handleExcelUpload}
      handleGenerateAdHocNotes={handleGenerateAdHocNotes}
      handleImportTenantMenu={handleImportTenantMenu}
      handleReplicateMenuToTenants={handleReplicateMenuToTenants}
      handleMenuImageUpload={handleMenuImageUpload}
      handleResetMenuAndRefill={handleResetMenuAndRefill}
      handleTreeDragOver={handleTreeDragOver}
      handleTreeDragStart={handleTreeDragStart}
      handleTreeDrop={handleTreeDrop}
      iaNotesError={iaNotesError}
      iaNotesLoading={iaNotesLoading}
      importConfirmStep={importConfirmStep}
      importSelectedTenantId={importSelectedTenantId}
      inventory={inventory}
      isAddingProducts={isAddingProducts}
      isAnalyzing={isAnalyzing}
      isDiagnosticRunning={isDiagnosticRunning}
      isImportingTenantMenu={isImportingTenantMenu}
      isMasterAdmin={isMasterAdmin}
      manageMenuTab={manageMenuTab}
      manageMenuViewMode={manageMenuViewMode}
      menuFilterNode={menuFilterNode}
      menuImages={menuImages}
      menuSearchQuery={menuSearchQuery}
      newBackupName={newBackupName}
      productCategories={productCategories}
      productSearch={productSearch}
      products={products}
      relationMatches={relationMatches}
      relationSearch={relationSearch}
      renderMaterialHeader={renderMaterialHeader}
      selectedRecipeProduct={selectedRecipeProduct}
      selectedRelationProductIds={selectedRelationProductIds}
      selectedTenant={selectedTenant}
      setAppMode={setAppMode}
      setBulkSubcategory={setBulkSubcategory}
      setBulkSubgroup={setBulkSubgroup}
      setCrudQuickNotes={setCrudQuickNotes}
      setCustomApiKey={setCustomApiKey}
      setCustomAppId={setCustomAppId}
      setCustomAuthDomain={setCustomAuthDomain}
      setCustomDbId={setCustomDbId}
      setCustomProjectId={setCustomProjectId}
      setDeleteConfirmation={setDeleteConfirmation}
      setDetectedProducts={setDetectedProducts}
      setDiagnosticBackups={setDiagnosticBackups}
      setDiagnosticProducts={setDiagnosticProducts}
      setDiagnosticRunCount={setDiagnosticRunCount}
      setEditingNoteProductId={setEditingNoteProductId}
      setEditingNoteText={setEditingNoteText}
      setEnableBackupNotifications={setEnableBackupNotifications}
      setImportConfirmStep={setImportConfirmStep}
      setImportSelectedTenantId={setImportSelectedTenantId}
      setIsDiagnosticRunning={setIsDiagnosticRunning}
      setManageMenuTab={setManageMenuTab}
      setManageMenuViewMode={setManageMenuViewMode}
      setMenuFilterNode={setMenuFilterNode}
      setMenuImages={setMenuImages}
      setMenuSearchQuery={setMenuSearchQuery}
      setNewBackupName={setNewBackupName}
      setProductCrudModal={setProductCrudModal}
      setProductSearch={setProductSearch}
      setRelationLog={setRelationLog}
      setRelationMatches={setRelationMatches}
      setRelationSearch={setRelationSearch}
      setSelectedRecipeProduct={setSelectedRecipeProduct}
      setSelectedRelationProductIds={setSelectedRelationProductIds}
      setShowCustomConfig={setShowCustomConfig}
      setShowDeletedProducts={setShowDeletedProducts}
      setShowRecipeAddModal={setShowRecipeAddModal}
      setSplitDeletedOriginal={setSplitDeletedOriginal}
      setSplitProposedItems={setSplitProposedItems}
      setSplitSelectedProductId={setSplitSelectedProductId}
      setWebsocketSyncLog={setWebsocketSyncLog}
      showCustomConfig={showCustomConfig}
      showDeletedProducts={showDeletedProducts}
      splitDeletedOriginal={splitDeletedOriginal}
      splitProposedItems={splitProposedItems}
      splitSelectedProductId={splitSelectedProductId}
      treeDragOverTargetKey={treeDragOverTargetKey}
      triggerAppNotification={triggerAppNotification}
          analyzeMenuImage={analyzeMenuImage}
          applyBulkCaseToggle={applyBulkCaseToggle}
          applyBulkSubcategory={applyBulkSubcategory}
          applyBulkSubgroup={applyBulkSubgroup}
          collapseAllTreeNodes={collapseAllTreeNodes}
          expandAllTreeNodes={expandAllTreeNodes}
          loadAutoFormattedList={loadAutoFormattedList}
          moveSelectedDown={moveSelectedDown}
          moveSelectedToBottom={moveSelectedToBottom}
          moveSelectedToTop={moveSelectedToTop}
          moveSelectedUp={moveSelectedUp}
          parseSplitProducts={parseSplitProducts}
          saveRelationChanges={saveRelationChanges}
          toggleTextCase={toggleTextCase}
          toggleTreeSectionCollapse={toggleTreeSectionCollapse}
          toggleTreeSubgroupCollapse={toggleTreeSubgroupCollapse}
      
    />
  );;

  const [iaNotesLoading, setIaNotesLoading] = useState(false);
  const [iaNotesError, setIaNotesError] = useState("");
  const [editingNoteProductId, setEditingNoteProductId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // States for Split/Compressed Products tab
  const [splitSelectedProductId, setSplitSelectedProductId] = useState<string>("");
  const [splitDeletedOriginal, setSplitDeletedOriginal] = useState<boolean>(true);
  const [splitProposedItems, setSplitProposedItems] = useState<{ name: string; price: number }[]>([]);

  // States for Relation & Ordering IA tab
  const [relationImages, setRelationImages] = useState<string[]>([]);
  const [relationAnalyzing, setRelationAnalyzing] = useState<boolean>(false);
  const [relationMatches, setRelationMatches] = useState<{
    productId: string;
    originalName: string;
    proposedReportName: string;
    proposedSortOrder: number;
    matched: boolean;
    proposedDescription: string;
    proposedSubgroup: string;
    proposedSubcategory: string;
  }[]>([]);
  const [selectedRelationProductIds, setSelectedRelationProductIds] = useState<string[]>([]);
  const [bulkSubgroup, setBulkSubgroup] = useState("");
  const [bulkSubcategory, setBulkSubcategory] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [relationLog, setRelationLog] = useState<string[]>([]);
  const [relationFilter, setRelationFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [relationSearch, setRelationSearch] = useState<string>("");

  // Tree View & Drag and Drop State for Menu Products Reordering
  const [manageMenuViewMode, setManageMenuViewMode] = useState<'tree' | 'table'>('tree');
  const [collapsedTreeSections, setCollapsedTreeSections] = useState<Record<string, boolean>>({});
  const [collapsedTreeSubgroups, setCollapsedTreeSubgroups] = useState<Record<string, boolean>>({});
  const [treeDragSource, setTreeDragSource] = useState<{
    type: 'section' | 'subgroup' | 'product';
    sectionName: string;
    subgroupName?: string;
    productId?: string;
  } | null>(null);
  const [treeDragOverTargetKey, setTreeDragOverTargetKey] = useState<string | null>(null);

  const [editingTreeSectionName, setEditingTreeSectionName] = useState<string | null>(null);
  const [editingTreeSectionValue, setEditingTreeSectionValue] = useState<string>("");
  const [editingTreeSubgroupKey, setEditingTreeSubgroupKey] = useState<string | null>(null);
  const [editingTreeSubgroupValue, setEditingTreeSubgroupValue] = useState<string>("");

  const handleRenameTreeSection = (oldSecName: string, newSecName: string) => {
    const trimmedNew = newSecName.trim();
    if (!trimmedNew || trimmedNew === oldSecName) {
      setEditingTreeSectionName(null);
      return;
    }
    setRelationMatches(prev => prev.map(item => {
      const currentSec = (item.proposedSubcategory || "Sin Sección").trim() || "Sin Sección";
      if (currentSec === oldSecName) {
        return { ...item, proposedSubcategory: trimmedNew };
      }
      return item;
    }));
    setCollapsedTreeSections(prev => {
      const next = { ...prev };
      if (next[oldSecName] !== undefined) {
        next[trimmedNew] = next[oldSecName];
        delete next[oldSecName];
      }
      return next;
    });
    triggerAppNotification(
      "Sección Actualizada",
      `Se cambió el nombre de la sección "${oldSecName}" a "${trimmedNew}" en todos sus productos.`,
      "success"
    );
    setEditingTreeSectionName(null);
  };

  const handleRenameTreeSubgroup = (secName: string, oldSubName: string, newSubName: string) => {
    const trimmedNew = newSubName.trim();
    if (!trimmedNew || trimmedNew === oldSubName) {
      setEditingTreeSubgroupKey(null);
      return;
    }
    setRelationMatches(prev => prev.map(item => {
      const currentSec = (item.proposedSubcategory || "Sin Sección").trim() || "Sin Sección";
      const currentSub = (item.proposedSubgroup || "Sin Subgrupo").trim() || "Sin Subgrupo";
      if (currentSec === secName && currentSub === oldSubName) {
        return { ...item, proposedSubgroup: trimmedNew };
      }
      return item;
    }));
    const oldFullKey = `${secName}___${oldSubName}`;
    const newFullKey = `${secName}___${trimmedNew}`;
    setCollapsedTreeSubgroups(prev => {
      const next = { ...prev };
      if (next[oldFullKey] !== undefined) {
        next[newFullKey] = next[oldFullKey];
        delete next[oldFullKey];
      }
      return next;
    });
    triggerAppNotification(
      "Subgrupo Actualizado",
      `Se cambió el nombre del subgrupo "${oldSubName}" a "${trimmedNew}" en todos sus productos.`,
      "success"
    );
    setEditingTreeSubgroupKey(null);
  };

  const toggleTreeSectionCollapse = (secName: string) => {
    setCollapsedTreeSections(prev => ({ ...prev, [secName]: !prev[secName] }));
  };

  const toggleTreeSubgroupCollapse = (subKey: string) => {
    setCollapsedTreeSubgroups(prev => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  const expandAllTreeNodes = () => {
    setCollapsedTreeSections({});
    setCollapsedTreeSubgroups({});
  };

  const collapseAllTreeNodes = (matches: typeof relationMatches) => {
    const secColl: Record<string, boolean> = {};
    const subColl: Record<string, boolean> = {};
    matches.forEach(m => {
      const sec = (m.proposedSubcategory || "Sin Sección").trim() || "Sin Sección";
      const sub = (m.proposedSubgroup || "Sin Subgrupo").trim() || "Sin Subgrupo";
      secColl[sec] = true;
      subColl[`${sec}___${sub}`] = true;
    });
    setCollapsedTreeSections(secColl);
    setCollapsedTreeSubgroups(subColl);
  };

  const handleTreeDragStart = (
    e: React.DragEvent,
    type: 'section' | 'subgroup' | 'product',
    sectionName: string,
    subgroupName?: string,
    productId?: string
  ) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    const payload = { type, sectionName, subgroupName: subgroupName || "", productId: productId || "" };
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    setTreeDragSource(payload);
  };

  const handleTreeDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (treeDragOverTargetKey !== targetKey) {
      setTreeDragOverTargetKey(targetKey);
    }
  };

  const handleTreeDrop = (
    e: React.DragEvent,
    targetType: 'section' | 'subgroup' | 'product',
    targetSectionName: string,
    targetSubgroupName?: string,
    targetProductId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setTreeDragOverTargetKey(null);

    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) {
      setTreeDragSource(null);
      return;
    }

    try {
      const dragData = JSON.parse(rawData) as {
        type: 'section' | 'subgroup' | 'product';
        sectionName: string;
        subgroupName: string;
        productId: string;
      };

      setRelationMatches(prev => {
        const next = [...prev];

        // 1. PRODUCT DRAG & DROP
        if (dragData.type === "product" && dragData.productId) {
          const sourceIdx = next.findIndex(m => m.productId === dragData.productId);
          if (sourceIdx === -1) return prev;
          const [draggedProduct] = next.splice(sourceIdx, 1);

          // Update target category & subgroup
          draggedProduct.proposedSubcategory = targetSectionName === "Sin Sección" ? "" : targetSectionName;
          draggedProduct.proposedSubgroup = (targetSubgroupName || "Sin Subgrupo") === "Sin Subgrupo" ? "" : (targetSubgroupName || "");

          if (targetType === "product" && targetProductId) {
            const targetIdx = next.findIndex(m => m.productId === targetProductId);
            if (targetIdx !== -1) {
              next.splice(targetIdx, 0, draggedProduct);
            } else {
              next.push(draggedProduct);
            }
          } else if (targetType === "subgroup") {
            const tgtSub = (targetSubgroupName || "Sin Subgrupo") === "Sin Subgrupo" ? "" : (targetSubgroupName || "");
            const tgtSec = targetSectionName === "Sin Sección" ? "" : targetSectionName;
            let lastSubIdx = -1;
            for (let i = next.length - 1; i >= 0; i--) {
              if (
                (next[i].proposedSubcategory || "") === tgtSec &&
                (next[i].proposedSubgroup || "") === tgtSub
              ) {
                lastSubIdx = i;
                break;
              }
            }
            if (lastSubIdx !== -1) {
              next.splice(lastSubIdx + 1, 0, draggedProduct);
            } else {
              next.push(draggedProduct);
            }
          } else {
            next.push(draggedProduct);
          }
        }

        // 2. SUBGROUP DRAG & DROP
        else if (dragData.type === "subgroup" && dragData.subgroupName) {
          const sourceSubName = dragData.subgroupName === "Sin Subgrupo" ? "" : dragData.subgroupName;
          const sourceSecName = dragData.sectionName === "Sin Sección" ? "" : dragData.sectionName;
          const targetSecName = targetSectionName === "Sin Sección" ? "" : targetSectionName;

          const subgroupItems = next.filter(
            m => (m.proposedSubcategory || "") === sourceSecName && (m.proposedSubgroup || "") === sourceSubName
          );
          const remainingItems = next.filter(
            m => !((m.proposedSubcategory || "") === sourceSecName && (m.proposedSubgroup || "") === sourceSubName)
          );

          subgroupItems.forEach(item => {
            item.proposedSubcategory = targetSecName;
          });

          if (targetType === "subgroup" && targetSubgroupName) {
            const tgtSubName = targetSubgroupName === "Sin Subgrupo" ? "" : targetSubgroupName;
            const insertIdx = remainingItems.findIndex(
              m => (m.proposedSubcategory || "") === targetSecName && (m.proposedSubgroup || "") === tgtSubName
            );
            if (insertIdx !== -1) {
              remainingItems.splice(insertIdx, 0, ...subgroupItems);
            } else {
              remainingItems.push(...subgroupItems);
            }
          } else {
            remainingItems.push(...subgroupItems);
          }
          return remainingItems.map((item, idx) => ({ ...item, proposedSortOrder: idx + 1 }));
        }

        // 3. SECTION DRAG & DROP
        else if (dragData.type === "section" && dragData.sectionName) {
          const sourceSecName = dragData.sectionName === "Sin Sección" ? "" : dragData.sectionName;
          const targetSecName = targetSectionName === "Sin Sección" ? "" : targetSectionName;

          const sectionItems = next.filter(m => (m.proposedSubcategory || "") === sourceSecName);
          const remainingItems = next.filter(m => (m.proposedSubcategory || "") !== sourceSecName);

          const insertIdx = remainingItems.findIndex(m => (m.proposedSubcategory || "") === targetSecName);
          if (insertIdx !== -1) {
            remainingItems.splice(insertIdx, 0, ...sectionItems);
          } else {
            remainingItems.push(...sectionItems);
          }
          return remainingItems.map((item, idx) => ({ ...item, proposedSortOrder: idx + 1 }));
        }

        // Reassign sequential sortOrder for all items
        return next.map((item, idx) => ({
          ...item,
          proposedSortOrder: idx + 1
        }));
      });
    } catch (err) {
      console.error("Error parsing drag data:", err);
    } finally {
      setTreeDragSource(null);
    }
  };

  const suggestProductReportName = (product: any): string => {
    const name = (product.name || "").trim().toUpperCase();
    const subcategory = (product.subcategory || "").trim().toUpperCase();
    const subgroup = (product.subgroup || "").trim().toUpperCase();
    
    let cleanName = name
      .replace(/\(MAIZ\)/g, "")
      .replace(/\(MAÍZ\)/g, "")
      .replace(/\(HARINA\)/g, "")
      .replace(/MAIZ/g, "")
      .replace(/MAÍZ/g, "")
      .replace(/HARINA/g, "")
      .replace(/CON QUESO/g, "")
      .replace(/AHOGADO/g, "")
      .trim();

    // Clean parentheses content (e.g. "VOLCÁN (BISTEC)" -> "VOLCÁN BISTEC")
    cleanName = cleanName.replace(/\(([^)]+)\)/g, "$1").replace(/[()]/g, "").trim();

    const originalCleaned = cleanName;

    // Strip prefix pleonasms with support for accents (e.g. VOLCÁN, GRINGAS, etc.)
    cleanName = cleanName
      .replace(/^(TACOS? DE|TACOS?|TOSTADAS? DE|TOSTADAS?|QUESO FUNDIDO CON|QUESO FUNDIDO DE|QUESO FUNDIDO|QUESADILLAS? DE|QUESADILLAS?|GRINGAS? DE|GRINGAS? AL|GRINGAS?|BURRITOS? DE|BURRAS? DE|BURRITOS?|BURRAS?|SINCRONIZADAS? DE|SINCRONIZADAS?|VOLCÁ?NES? DE|VOLCÁ?NES?|POZOLES? DE|POZOLES?)\s+/gi, "")
      .trim();

    if (!cleanName) {
      cleanName = originalCleaned;
    }

    let tortilla = "";
    if (subcategory.includes("MAIZ") || subcategory.includes("MAÍZ") || name.includes("MAIZ") || name.includes("MAÍZ")) {
      tortilla = "MAÍZ";
    } else if (subcategory.includes("HARINA") || name.includes("HARINA")) {
      tortilla = "HARINA";
    }

    let type = "";
    if (subcategory.includes("GRINGA") || subgroup.includes("GRINGA") || name.includes("GRINGA")) {
      type = "GRINGA";
    } else if (subcategory.includes("QUESADILLA") || subgroup.includes("QUESADILLA") || name.includes("QUESADILLA")) {
      type = "QUESADILLA";
    } else if (subcategory.includes("BURRA") || subgroup.includes("BURRA") || subcategory.includes("BURRITO") || subgroup.includes("BURRITO") || name.includes("BURRA") || name.includes("BURRITO")) {
      type = "BURRA";
    } else if (subcategory.includes("SINCRONIZADA") || subgroup.includes("SINCRONIZADA") || name.includes("SINCRONIZADA")) {
      type = "SINCRONIZADA";
    } else if (subcategory.includes("TACO") || subgroup.includes("TACO") || name.includes("TACO")) {
      type = "TACO";
    } else if (subcategory.includes("VOLCAN") || subgroup.includes("VOLCAN") || subcategory.includes("VOLCÁN") || subgroup.includes("VOLCÁN") || name.includes("VOLCAN") || name.includes("VOLCÁN")) {
      type = "VOLCÁN";
    } else if (subcategory.includes("TOSTADA") || subgroup.includes("TOSTADA") || name.includes("TOSTADA")) {
      type = "TOSTADA";
    } else if (subcategory.includes("POZOLE") || subgroup.includes("POZOLE") || name.includes("POZOLE")) {
      type = "POZOLE";
    } else if (subcategory.includes("QUESO FUNDIDO") || subgroup.includes("QUESO FUNDIDO") || name.includes("QUESO FUNDIDO")) {
      type = "QUESO FUNDIDO";
    }

    if (!type) {
      return name;
    }

    let suggested = "";
    if (type === "GRINGA") {
      suggested = `GRINGA DE ${cleanName}`;
      if (tortilla) suggested += ` DE ${tortilla}`;
    } else if (type === "TACO") {
      const hasCheese = name.includes("QUESO");
      const isAhogado = name.includes("AHOGADO");
      suggested = `TACO DE ${cleanName}`;
      if (hasCheese) suggested += " CON QUESO";
      if (isAhogado) suggested += " AHOGADO";
      if (tortilla) suggested += ` DE ${tortilla}`;
    } else if (type === "QUESADILLA") {
      suggested = `QUESADILLA DE ${cleanName}`;
      if (tortilla) suggested += ` DE ${tortilla}`;
    } else if (type === "BURRA") {
      suggested = `BURRA DE ${cleanName}`;
      if (tortilla) suggested += ` DE ${tortilla}`;
    } else if (type === "SINCRONIZADA") {
      suggested = `SINCRONIZADA DE ${cleanName}`;
      if (tortilla) suggested += ` DE ${tortilla}`;
    } else if (type === "VOLCÁN") {
      suggested = `VOLCÁN DE ${cleanName}`;
    } else if (type === "TOSTADA") {
      suggested = `TOSTADA DE ${cleanName}`;
    } else if (type === "POZOLE") {
      suggested = `POZOLE DE ${cleanName}`;
    } else if (type === "QUESO FUNDIDO") {
      suggested = `QUESO FUNDIDO CON ${cleanName}`;
    }

    return suggested.replace(/\s+/g, " ").trim();
  };

  const loadAutoFormattedList = () => {
    const sorted = [...products].sort((a, b) => {
      const scoreA = getProductSortScore(a);
      const scoreB = getProductSortScore(b);
      return scoreA - scoreB;
    });

    const matches = sorted.map((p, index) => {
      const suggestedName = suggestProductReportName(p);
      return {
        productId: p.id,
        originalName: p.name,
        proposedReportName: p.reportName || suggestedName,
        proposedSortOrder: p.sortOrder && p.sortOrder !== 9999 ? p.sortOrder : (index + 1),
        matched: true,
        proposedDescription: p.description || "",
        proposedSubgroup: p.subgroup || "",
        proposedSubcategory: p.subcategory || ""
      };
    });

    setRelationMatches(matches);
    setSelectedRelationProductIds([]);
    setRelationLog([
      "📋 Catálogo de productos leído correctamente.",
      `✨ Se ordenaron los ${products.length} productos por Categoría y Subgrupo.`,
      "✍️ Sugerencias automáticas generadas para descripciones (por ejemplo: 'GRINGA AL PASTOR DE HARINA' en lugar de 'PASTOR (HARINA)')."
    ]);

    triggerAppNotification(
      "📋 Catálogo Cargado",
      `Se generaron sugerencias de reporte y ordenamiento para los ${products.length} productos con éxito.`,
      "success"
    );
  };

  const saveRelationChanges = async (onlyMatched = false, shouldExit = true) => {
    if (relationMatches.length === 0) {
      alert("No hay cambios propuestos para guardar.");
      return;
    }

    const confirm = window.confirm(
      `¿Está seguro de que desea guardar los nombres de reporte, subgrupos, subcategorías, descripciones y el orden de los ${relationMatches.length} productos en la base de datos?\n\nEsto afectará inmediatamente a los reportes y cortes.`
    );
    if (!confirm) return;

    try {
      const targets = relationMatches.filter(m => !onlyMatched || m.matched);

      // Fast local update & localStorage cache update 🚀
      setProducts(prev => {
        const map = new globalThis.Map<string, any>(prev.map(p => [p.id, { ...p }]));
        targets.forEach(m => {
          const existing = map.get(m.productId);
          if (existing) {
            existing.reportName = m.proposedReportName.trim();
            existing.sortOrder = Number(m.proposedSortOrder);
            existing.description = (m.proposedDescription || "").trim();
            existing.subgroup = (m.proposedSubgroup || "").trim();
            existing.subcategory = (m.proposedSubcategory || "").trim();
          }
        });
        const updatedList = Array.from(map.values());
        try {
          localStorage.setItem("pos_products", JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      });

      // Fast parallel chunking for Firestore updates ⚡
      const CHUNK_SIZE = 20;
      for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
        const chunk = targets.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(match =>
            updateProductInFirebase(match.productId, {
              reportName: match.proposedReportName.trim(),
              sortOrder: Number(match.proposedSortOrder),
              description: (match.proposedDescription || "").trim(),
              subgroup: (match.proposedSubgroup || "").trim(),
              subcategory: (match.proposedSubcategory || "").trim()
            })
          )
        );
      }

      alert(`✅ ¡Éxito! Se guardaron los cambios para ${targets.length} productos correctamente.`);

      triggerAppNotification(
        "📋 Catálogo Sincronizado",
        `Se han actualizado ${targets.length} productos con nombres de reporte, subgrupos, subcategorías, descripciones y orden secuencial con éxito.`,
        "success"
      );

      if (shouldExit) {
        setRelationMatches([]);
        setRelationLog([]);
        setSelectedRelationProductIds([]);
        setManageMenuTab(null);
      }
    } catch (err: any) {
      alert("❌ Ocurrió un error al guardar los cambios en la base de datos: " + err.message);
    }
  };

  // Drag and Drop native handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedOverIndex !== index) {
      setDraggedOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("text/plain");
    if (!sourceIndexStr) return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    
    if (sourceIndex === targetIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }

    setRelationMatches(prev => {
      const next = [...prev];
      const [draggedItem] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, draggedItem);
      // Reassign sequential sortOrder
      return next.map((item, idx) => ({
        ...item,
        proposedSortOrder: idx + 1
      }));
    });

    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  // Bulk Reordering Shift functions
  const moveSelectedUp = () => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => {
      const next = [...prev];
      // Iterate from top to bottom (index 1 to length-1)
      for (let i = 1; i < next.length; i++) {
        const item = next[i];
        const isSelected = selectedRelationProductIds.includes(item.productId);
        const prevSelected = selectedRelationProductIds.includes(next[i - 1].productId);
        if (isSelected && !prevSelected) {
          // Swap with previous
          next[i] = next[i - 1];
          next[i - 1] = item;
        }
      }
      return next.map((item, idx) => ({
        ...item,
        proposedSortOrder: idx + 1
      }));
    });
  };

  const moveSelectedDown = () => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => {
      const next = [...prev];
      // Iterate from bottom to top (index length-2 down to 0)
      for (let i = next.length - 2; i >= 0; i--) {
        const item = next[i];
        const isSelected = selectedRelationProductIds.includes(item.productId);
        const nextSelected = selectedRelationProductIds.includes(next[i + 1].productId);
        if (isSelected && !nextSelected) {
          // Swap with next
          next[i] = next[i + 1];
          next[i + 1] = item;
        }
      }
      return next.map((item, idx) => ({
        ...item,
        proposedSortOrder: idx + 1
      }));
    });
  };

  const moveSelectedToTop = () => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => {
      const selected = prev.filter(item => selectedRelationProductIds.includes(item.productId));
      const unselected = prev.filter(item => !selectedRelationProductIds.includes(item.productId));
      const next = [...selected, ...unselected];
      return next.map((item, idx) => ({
        ...item,
        proposedSortOrder: idx + 1
      }));
    });
  };

  const moveSelectedToBottom = () => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => {
      const selected = prev.filter(item => selectedRelationProductIds.includes(item.productId));
      const unselected = prev.filter(item => !selectedRelationProductIds.includes(item.productId));
      const next = [...unselected, ...selected];
      return next.map((item, idx) => ({
        ...item,
        proposedSortOrder: idx + 1
      }));
    });
  };

  // Bulk Field Assignment functions
  const applyBulkSubgroup = (newSubgroup: string) => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => prev.map(item => {
      if (selectedRelationProductIds.includes(item.productId)) {
        return { ...item, proposedSubgroup: newSubgroup.trim() };
      }
      return item;
    }));
    triggerAppNotification(
      "Subgrupo Actualizado",
      `Se asignó el subgrupo "${newSubgroup}" a ${selectedRelationProductIds.length} productos.`,
      "success"
    );
  };

  const applyBulkSubcategory = (newSubcategory: string) => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => prev.map(item => {
      if (selectedRelationProductIds.includes(item.productId)) {
        return { ...item, proposedSubcategory: newSubcategory.trim() };
      }
      return item;
    }));
    triggerAppNotification(
      "Sección Actualizada",
      `Se asignó la sección "${newSubcategory}" a ${selectedRelationProductIds.length} productos.`,
      "success"
    );
  };

  const applyBulkCaseToggle = () => {
    if (selectedRelationProductIds.length === 0) return;
    setRelationMatches(prev => prev.map(item => {
      if (selectedRelationProductIds.includes(item.productId)) {
        return { ...item, proposedReportName: toggleTextCase(item.proposedReportName) };
      }
      return item;
    }));
    triggerAppNotification(
      "Mayúsculas/Capitalizado",
      `Se cambió el formato de texto de ${selectedRelationProductIds.length} productos.`,
      "success"
    );
  };

  const parseSplitProducts = (originalName: string): string[] => {
    const splitters = /\s*\/\s*|\s*,\s*|\s+o\s+|\s+O\s+/;
    const parts = originalName.split(splitters).map(p => p.trim()).filter(Boolean);
    if (parts.length <= 1) return [originalName];

    const prefixes = [
      "tacos de ", "taco de ", "refresco ", "agua de ", "orden de ", "gringa de ", "torta de ", "tortas de ", "quesadilla de ", "sincronizada de ", "flauta de ", "enchiladas de ", "bebida "
    ];
    const lowerFirst = parts[0].toLowerCase();
    let foundPrefix = "";
    for (const pf of prefixes) {
      if (lowerFirst.startsWith(pf)) {
        foundPrefix = parts[0].substring(0, pf.length);
        break;
      }
    }

    if (!foundPrefix) {
      const words = parts[0].split(/\s+/);
      if (words.length > 1) {
        foundPrefix = words[0] + " ";
      }
    }

    return parts.map((part, index) => {
      if (index === 0) return part;
      if (foundPrefix && !part.toLowerCase().startsWith(foundPrefix.toLowerCase())) {
        return `${foundPrefix}${part}`;
      }
      return part;
    });
  };

  const handleGenerateAdHocNotes = async () => {
    if (products.length === 0) {
      setIaNotesError("No hay productos registrados en esta sucursal.");
      return;
    }
    setIaNotesLoading(true);
    setIaNotesError("");
    try {
      const apiKeyToUse =
        ticketGeminiApiKey ||
        companyConfig.geminiApiKey ||
        localStorage.getItem("custom_gemini_api_key") ||
        localStorage.getItem("local_gemini_api_key") ||
        ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);

      const resp = await fetch("/api/generate-adhoc-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory
          })),
          apiKey: apiKeyToUse
        })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Fallo al generar las notas ad-hoc con IA.");
      }

      const results = await resp.json();
      if (!Array.isArray(results)) {
        throw new Error("El formato de respuesta de la IA no es un arreglo válido.");
      }

      // Update products in Firestore
      let updatedCount = 0;
      for (const item of results) {
        if (item.id && Array.isArray(item.quickNotes)) {
          const cleanedNotes = item.quickNotes
            .map((n: string) => n.trim())
            .filter((n: string) => n.length > 0);

          await updateProductInFirebase(item.id, {
            quickNotes: cleanedNotes
          });
          updatedCount++;
        }
      }

      alert(`🎉 ¡Sincronización Exitosa! Se generaron y guardaron notas ad-hoc para ${updatedCount} productos a través de la IA.`);
    } catch (err: any) {
      console.error(err);
      setIaNotesError(err.message || "Ocurrió un error inesperado al procesar las notas con IA.");
    } finally {
      setIaNotesLoading(false);
    }
  };

  const [iaInsumosLoading, setIaInsumosLoading] = useState(false);
  const [iaInsumosResult, setIaInsumosResult] = useState<any[]>([]);
  const [iaInsumosError, setIaInsumosError] = useState("");

  const handleGenerateInsumosWithIA = async () => {
    const apiKeyToUse =
      ticketGeminiApiKey ||
      companyConfig.geminiApiKey ||
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("local_gemini_api_key") ||
      ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);

    if (!apiKeyToUse) {
      setIaInsumosError(
        "⚠️ Faltan credenciales: Por favor ingresa tu Clave de Gemini API en la sección 'Configuración' -> 'Ajustes del Sistema' para habilitar a la IA.",
      );
      return;
    }
    if (products.length === 0) {
      setIaInsumosError(
        "No hay productos en el menú. La IA necesita platillos para determinar qué insumos usar.",
      );
      return;
    }

    setIaInsumosError("");
    setIaInsumosLoading(true);
    setIaInsumosResult([]);

    try {
      const promptText =
        "Analiza el siguiente menú de restaurante:\n" +
        products.map((p) => "- " + p.name).join("\n") +
        "\nA partir de este menú, genera una lista completa de los ingredientes/insumos (materia prima) base necesarios para prepararlos. Ten en cuenta que solo deben ser cosas que se puedan medir en stock.\n" +
        "Importante, toma decisiones de comida real, por ejemplo:\n" +
        " - 'Tlayuda' es un insumo pieza.\n" +
        " - 'Burrito' requerirá 'Tortilla de Harina G'\n" +
        " - 'Sincronizada' requerirá 'Tortilla de Harina Num 4' o 'Normal'\n" +
        " - 'Taco' requerirá 'Tortilla de Maíz'\n" +
        " - 'Huevos al gusto' requerirá 'Huevo'\n\n" +
        "Asegúrate de NO incluir formato markdown rodeando al JSON ni explicaciones. Responde puramente con un array JSON.";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyToUse}`;

      const requestBody = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                unit: { type: "STRING" },
                category: {
                  type: "STRING",
                  enum: ["Ingredientes", "Bebidas", "Empaques", "Otros"],
                },
                minStock: { type: "NUMBER" },
                cost: { type: "NUMBER" },
              },
              required: ["name", "unit", "category", "minStock", "cost"],
            },
          },
        },
      };

      console.log("Generando insumos con IA via fetch directo...");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Error de la API (${response.status}): ${errBody}`);
      }

      const data = await response.json();
      let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

      // En caso de que el modelo aún ponga etiquetas md
      rawResponse = rawResponse.replace(/```(json)?/g, "").trim();

      const parsedInsumos = JSON.parse(rawResponse);
      if (Array.isArray(parsedInsumos)) {
        setIaInsumosResult(parsedInsumos);
      } else {
        throw new Error("El modelo no retornó un arreglo JSON válido.");
      }
    } catch (e: any) {
      console.error("Error completo de IA:", e);
      setIaInsumosError(
        e.message || "Oops... Ocurrió un error leyendo al agente.",
      );
    } finally {
      setIaInsumosLoading(false);
    }
  };

  const handleSaveInsumosIa = async () => {
    if (!selectedTenant || iaInsumosResult.length === 0) return;

    try {
      for (const inv of iaInsumosResult) {
        const exists = inventory.find(
          (i) => i.name.toLowerCase() === inv.name.toLowerCase(),
        );
        if (!exists) {
          await addInventoryItemToFirebase({
            name: inv.name,
            unit: inv.unit || "pza",
            stock: 0,
            cost: inv.cost || 0,
            minStock: inv.minStock || 0,
            category: inv.category || "Ingredientes",
          });
        }
      }
      triggerAppNotification(
        "IA: ¡Éxito!",
        "Los insumos generados han sido añadidos al inventario principal.",
        "success",
      );
      setIaInsumosResult([]);
    } catch (error) {
      console.error(error);
      triggerAppNotification(
        "Error IA",
        "Hubo un problema al guardar el inventario generado.",
        "warning",
      );
    }
  };

  const handleWipeInsumos = async () => {
    if (
      window.confirm(
        "⚠️ ALERTA PELIGROSA: ¿Estás seguro de ELIMINAR TODOS los insumos registrados del Inventario actual? Toda esta lista se borrará en la nube.",
      )
    ) {
      try {
        for (const item of inventory) {
          await deleteInventoryItemFromFirebase(item.id);
        }
        triggerAppNotification(
          "Inventario",
          "Se han borrado todos los insumos.",
          "info",
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderSidebar = () => (
    <SidebarView
      adminViewOnlyCorte={adminViewOnlyCorte}
      appMode={appMode}
      checkoutReturnMode={checkoutReturnMode}
      configActiveTab={configActiveTab}
      currentUser={currentUser}
      customOwners={customOwners}
      customers={customers}
      expenses={expenses}
      handleLogout={handleLogout}
      isMasterAdmin={isMasterAdmin}
      isOwnerUnlocked={isOwnerUnlocked}
      restrictedOwnerKey={restrictedOwnerKey}
      selectedTenant={selectedTenant}
      setAdminViewOnlyCorte={setAdminViewOnlyCorte}
      setAppMode={setAppMode}
      setCheckoutReturnMode={setCheckoutReturnMode}
      setConfigActiveTab={setConfigActiveTab}
      setManageMenuTab={setManageMenuTab}
      setSelectedTableGestion={setSelectedTableGestion}
      setShowBluetoothConfigModal={setShowBluetoothConfigModal}
      setShowBranchSwitcherModal={setShowBranchSwitcherModal}
      setShowSidebar={setShowSidebar}
      showBluetoothConfigModal={showBluetoothConfigModal}
      showSidebar={showSidebar}
      suppliers={suppliers}
          activeOwnerBranchesCount={activeOwnerBranchesCount}
      
    />
  );;

  const renderSuppliers = () => (
    <SuppliersView
      renderMaterialHeader={renderMaterialHeader}
      setAppMode={setAppMode}
      setSupplierModal={setSupplierModal}
      supplierModal={supplierModal}
      suppliers={suppliers}
      triggerAppNotification={triggerAppNotification}
      
    />
  );;

  const renderCustomers = () => (
    <CustomersView
      customerModal={customerModal}
      customerModalAddresses={customerModalAddresses}
      customers={customers}
      renderMaterialHeader={renderMaterialHeader}
      setAppMode={setAppMode}
      setCustomerModal={setCustomerModal}
      triggerAppNotification={triggerAppNotification}
      
    />
  );;

  const renderExpenses = () => (
    <ExpensesView
      cashierSessions={cashierSessions}
      currentUser={currentUser}
      expenseActiveTab={expenseActiveTab}
      expenseAmount={expenseAmount}
      expenseCategory={expenseCategory}
      expenseCategoryFilter={expenseCategoryFilter}
      expenseConcept={expenseConcept}
      expenseEnableNotifications={expenseEnableNotifications}
      expenseReference={expenseReference}
      expenseSearch={expenseSearch}
      expenses={expenses}
      renderMaterialHeader={renderMaterialHeader}
      selectedExpenseForEdit={selectedExpenseForEdit}
      selectedTenant={selectedTenant}
      setAppMode={setAppMode}
      setExpenseActiveTab={setExpenseActiveTab}
      setExpenseAmount={setExpenseAmount}
      setExpenseCategory={setExpenseCategory}
      setExpenseCategoryFilter={setExpenseCategoryFilter}
      setExpenseConcept={setExpenseConcept}
      setExpenseReference={setExpenseReference}
      setExpenseSearch={setExpenseSearch}
      setMenuToastMessage={setMenuToastMessage}
      setSelectedExpenseForEdit={setSelectedExpenseForEdit}
      setShowExpenseFilter={setShowExpenseFilter}
      setShowExpenseModal={setShowExpenseModal}
      setShowMenuToast={setShowMenuToast}
      showExpenseFilter={showExpenseFilter}
      showExpenseModal={showExpenseModal}
      triggerAppNotification={triggerAppNotification}
      
    />
  );;

  const renderReports = () => (
    <ReportsView
      expenses={expenses}
      history={history}
      invReportDate={invReportDate}
      inventory={inventory}
      inventoryMovements={inventoryMovements}
      invoicePhone={invoicePhone}
      paymentMethod={paymentMethod}
      products={products}
      purchases={purchases}
      renderMaterialHeader={renderMaterialHeader}
      reportsTab={reportsTab}
      requiresInvoice={requiresInvoice}
      setAppMode={setAppMode}
      setInvReportDate={setInvReportDate}
      setReportsTab={setReportsTab}
      
    />
  );;

  const handleSaveMovement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!opsInsumoId) {
      setMenuToastMessage("⚠️ Por favor selecciona un insumo de la lista.");
      setShowMenuToast(true);
      return;
    }
    const qtyNum = parseFloat(opsQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setMenuToastMessage("⚠️ Ingrese una cantidad válida mayor a cero.");
      setShowMenuToast(true);
      return;
    }

    const activeInsumo = inventory.find((i) => i.id === opsInsumoId);
    if (!activeInsumo) return;

    const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const finalQty = opsMovType === "entrada" ? qtyNum : -qtyNum;

    try {
      await addInventoryMovementToFirebase({
        id: movementId,
        inventoryItemId: opsInsumoId,
        type: opsMovType,
        qty: finalQty,
        concept:
          opsConcept.trim() ||
          (opsMovType === "entrada"
            ? "Entrada manual de insumos 📈"
            : "Ajuste / Salida manual de insumos 📉"),
        executedBy: currentUser?.name || "Administrador",
        timestamp: getMexicoISOString(),
      });

      triggerAppNotification(
        "📈 Inventario Actualizado",
        `Se registró un movimiento para "${activeInsumo.name}" por ${finalQty} ${activeInsumo.unit}.`,
        "success",
      );

      setOpsInsumoId("");
      setOpsQty("");
      setOpsConcept("");
      setSelectedInsumoForMov(null);
    } catch (err: any) {
      setMenuToastMessage(
        `❌ Error al guardar movimiento: ${err.message || err}`,
      );
      setShowMenuToast(true);
    }
  };


  const renderGestionCuentas = () => (
    <GestionCuentasView
      cart={cart}
      isListening={isListening}
      isOnline={isOnline}
      renderClosedAccountsList={renderClosedAccountsList}
      renderMaterialHeader={renderMaterialHeader}
      renderMenu={renderMenu}
      renderReview={renderReview}
      renderTableDetails={renderTableDetails}
      selectedTableGestion={selectedTableGestion}
      selectedTenant={selectedTenant}
      setSelectedTableGestion={setSelectedTableGestion}
      setSelectedTableId={setSelectedTableId}
      effectiveTables={effectiveTables}
      startVoiceRecognition={startVoiceRecognition}
      zones={zones}
      scaleLeft={companyConfig?.gestionCuentasLeftScale || 1}
      scaleRight={companyConfig?.gestionCuentasRightScale || 1}
          onScaleChange={(side, val) => {
            if (!selectedTenant?.id) return;
            const key = side === 'left' ? 'gestionCuentasLeftScale' : 'gestionCuentasRightScale';
            const updated = { ...companyConfig, [key]: parseFloat(val.toFixed(2)) };
            setCompanyConfig(updated);
            saveCompanyConfigInFirebase(selectedTenant.id, updated).catch(console.error);
          }}
          companyConfig={companyConfig}
          currentUser={currentUser}
          updateCompanyConfig={(updates: any) => {
            if (!selectedTenant?.id) return;
            const updated = { ...companyConfig, ...updates };
            setCompanyConfig(updated);
            saveCompanyConfigInFirebase(selectedTenant.id, updated).catch(console.error);
          }}
          onSwitchTablesMode={handleSwitchTablesMode}
    />
  );;

  const renderDashboard = () => null;    const renderCorteNuevo = () => (
    <CorteNuevoView
      arq100={arq100}
      arq1000={arq1000}
      arq20={arq20}
      arq200={arq200}
      arq50={arq50}
      arq500={arq500}
      arqM05={arqM05}
      arqM1={arqM1}
      arqM10={arqM10}
      arqM2={arqM2}
      arqM5={arqM5}
      arqueosHistory={arqueosHistory}
      cashierSessions={cashierSessions}
      corteFilterUserId={corteFilterUserId}
      corteNuevoAmount={corteNuevoAmount}
      corteNuevoConcept={corteNuevoConcept}
      corteNuevoDescription={corteNuevoDescription}
      corteNuevoType={corteNuevoType}
      currentUser={currentUser}
      guidedAmount={guidedAmount}
      guidedConcept={guidedConcept}
      guidedDescription={guidedDescription}
      guidedFlowStep={guidedFlowStep}
      guidedSelectedSupplier={guidedSelectedSupplier}
      guidedSelectedUser={guidedSelectedUser}
      guidedType={guidedType}
      history={history}
      setAppMode={setAppMode}
      setArq100={setArq100}
      setArq1000={setArq1000}
      setArq20={setArq20}
      setArq200={setArq200}
      setArq50={setArq50}
      setArq500={setArq500}
      setArqM05={setArqM05}
      setArqM1={setArqM1}
      setArqM10={setArqM10}
      setArqM2={setArqM2}
      setArqM5={setArqM5}
      setCorteFilterUserId={setCorteFilterUserId}
      setCorteNuevoAmount={setCorteNuevoAmount}
      setCorteNuevoConcept={setCorteNuevoConcept}
      setCorteNuevoDescription={setCorteNuevoDescription}
      setGastoCategory={setGastoCategory}
      setGastoDescription={setGastoDescription}
      setGastoItems={setGastoItems}
      setGuidedAmount={setGuidedAmount}
      setGuidedConcept={setGuidedConcept}
      setGuidedDescription={setGuidedDescription}
      setGuidedFlowStep={setGuidedFlowStep}
      setGuidedSelectedSupplier={setGuidedSelectedSupplier}
      setGuidedSelectedUser={setGuidedSelectedUser}
      setGuidedType={setGuidedType}
      setSelectedScheduleSupplier={setSelectedScheduleSupplier}
      setShowArqueoFormModal={setShowArqueoFormModal}
      setShowGastoRegisterModal={setShowGastoRegisterModal}
      setShowPrintPreviewModal={setShowPrintPreviewModal}
      setShowSidebar={setShowSidebar}
      setShowSupplierPurchaseModal={setShowSupplierPurchaseModal}
      setSupplierPurchaseIsPaid={setSupplierPurchaseIsPaid}
      setSupplierPurchaseItems={setSupplierPurchaseItems}
      showArqueoFormModal={showArqueoFormModal}
      showGastoRegisterModal={showGastoRegisterModal}
      showPrintPreviewModal={showPrintPreviewModal}
      showSupplierPurchaseModal={showSupplierPurchaseModal}
      suppliers={suppliers}
      syncStatus={syncStatus}
      triggerAppNotification={triggerAppNotification}
      users={users}
      
    />
  );;;

  const renderCorteTabla = () => (
    <CorteTablaView
      appMode={appMode}
      cashMovements={cashMovements}
      cashierSessions={cashierSessions}
      companyConfig={companyConfig}
      corteTablaSessionSelected={corteTablaSessionSelected}
      corteViewMode={corteViewMode}
      currentUser={currentUser}
      expandedCorteTablaRows={expandedCorteTablaRows}
      expandedSessionDetails={expandedSessionDetails}
      expenses={expenses}
      exportSessionModal={exportSessionModal}
      exportTargetTenantId={exportTargetTenantId}
      history={history}
      historySortOrder={historySortOrder}
      isMasterAdmin={isMasterAdmin}
      isSystemsMode={isSystemsMode}
      paymentMethod={paymentMethod}
      purchases={purchases}
      products={products}
      renderMaterialHeader={renderMaterialHeader}
      selectedPendingOwner={selectedPendingOwner}
      selectedTenant={selectedTenant}
      setActiveOwnerFilter={setActiveOwnerFilter}
      setAppMode={setAppMode}
      setCashMovementForm={setCashMovementForm}
      setCashMovements={setCashMovements}
      setCashierSessions={setCashierSessions}
      setCorteFilterUserId={setCorteFilterUserId}
      setCorteTablaSessionSelected={setCorteTablaSessionSelected}
      setCorteViewMode={setCorteViewMode}
      setDailyReportTargetDate={setDailyReportTargetDate}
      setEditFondoValue={setEditFondoValue}
      setExpandedCorteTablaRows={setExpandedCorteTablaRows}
      setExpandedSessionDetails={setExpandedSessionDetails}
      setExpenses={setExpenses}
      setExportModalStep={setExportModalStep}
      setExportSessionModal={setExportSessionModal}
      setExportTargetTenantId={setExportTargetTenantId}
      setHistory={setHistory}
      setHistorySortOrder={setHistorySortOrder}
      setIsExportingSession={setIsExportingSession}
      setIsOwnerUnlocked={setIsOwnerUnlocked}
      setOwnerPasswordInput={setOwnerPasswordInput}
      setSelectedTableGestion={setSelectedTableGestion}
      setSelectedTableId={setSelectedTableId}
      setShowCashMovementModal={setShowCashMovementModal}
      setShowCloseTurnConfirm={setShowCloseTurnConfirm}
      setShowDailyReportModal={setShowDailyReportModal}
      setShowDeleteAllHistoryConfirm={setShowDeleteAllHistoryConfirm}
      setShowEditFondoModal={setShowEditFondoModal}
      setShowOwnerPasswordAlert={setShowOwnerPasswordAlert}
      setShowSidebar={setShowSidebar}
      setShowSystemsChoiceAlert={setShowSystemsChoiceAlert}
      setShowTablaArqueoModal={setShowTablaArqueoModal}
      setTables={setTables}
      setTenantBackupConfirm={setTenantBackupConfirm}
      showCloseTurnConfirm={showCloseTurnConfirm}
      showDeleteAllHistoryConfirm={showDeleteAllHistoryConfirm}
      showEditFondoModal={showEditFondoModal}
      showOwnerPasswordAlert={showOwnerPasswordAlert}
      showSystemsChoiceAlert={showSystemsChoiceAlert}
      showTablaArqueoModal={showTablaArqueoModal}
      tablaArq100={tablaArq100}
      tablaArq1000={tablaArq1000}
      tablaArq20={tablaArq20}
      tablaArq200={tablaArq200}
      tablaArq50={tablaArq50}
      tablaArq500={tablaArq500}
      tablaArqM05={tablaArqM05}
      tablaArqM1={tablaArqM1}
      tablaArqM10={tablaArqM10}
      tablaArqM2={tablaArqM2}
      tablaArqM5={tablaArqM5}
      tables={tables}
      tenantBackupConfirm={tenantBackupConfirm}
      ticketBusinessName={ticketBusinessName}
      ticketSucursal={ticketSucursal}
      triggerAppNotification={triggerAppNotification}
          corteData={corteData}
          activeSessionForCorte={activeSessionForCorte}
          filteredCashMovementsForCorte={filteredCashMovementsForCorte}
          filteredExpensesForCorte={filteredExpensesForCorte}
          filteredHistoryForCorte={filteredHistoryForCorte}
          filteredPurchasesForCorte={filteredPurchasesForCorte}
          validateOwnerKey={validateOwnerKey}
          activeTablaDenom={activeTablaDenom}
          setActiveTablaDenom={setActiveTablaDenom}
          showTablaKeypadOverlay={showTablaKeypadOverlay}
          setShowTablaKeypadOverlay={setShowTablaKeypadOverlay}
          setTablaArq100={setTablaArq100}
          setTablaArq1000={setTablaArq1000}
          setTablaArq20={setTablaArq20}
          setTablaArq200={setTablaArq200}
          setTablaArq50={setTablaArq50}
          setTablaArq500={setTablaArq500}
          setTablaArqM05={setTablaArqM05}
          setTablaArqM1={setTablaArqM1}
          setTablaArqM10={setTablaArqM10}
          setTablaArqM2={setTablaArqM2}
          setTablaArqM5={setTablaArqM5}
    />
  );;

  const renderCorteTabla2 = () => (
    <CorteTabla2View
      corte2FolioAnterior={corte2FolioAnterior}
      corte2MontoObjetivo={corte2MontoObjetivo}
      corte2Records={corte2Records}
      corte2SelectedAccountIds={corte2SelectedAccountIds}
      corte2SelectedDate={corte2SelectedDate}
      currentUser={currentUser}
      handleSendWhatsAppInvoice={handleSendWhatsAppInvoice}
      history={history}
      historyLoaded={historyLoaded}
      invoicePhone={invoicePhone}
      multiTurnEndDate={multiTurnEndDate}
      multiTurnStartDate={multiTurnStartDate}
      paymentMethod={paymentMethod}
      requiresInvoice={requiresInvoice}
      selectedTenant={selectedTenant}
      setCorte2FolioAnterior={setCorte2FolioAnterior}
      setCorte2MontoObjetivo={setCorte2MontoObjetivo}
      setCorte2SelectedAccountIds={setCorte2SelectedAccountIds}
      setCorte2SelectedDate={setCorte2SelectedDate}
      setMenuToastMessage={setMenuToastMessage}
      setMultiTurnEndDate={setMultiTurnEndDate}
      setMultiTurnPreviewReady={setMultiTurnPreviewReady}
      multiTurnPreviewReady={multiTurnPreviewReady}
      setMultiTurnStartDate={setMultiTurnStartDate}
      setProductSalesMap={setProductSalesMap}
      setShowMenuToast={setShowMenuToast}
      setShowMultiTurnModal={setShowMultiTurnModal}
      setShowSidebar={setShowSidebar}
      showMultiTurnModal={showMultiTurnModal}
          reprintAccount={reprintAccount}
      
    />
  );;

  const renderCorteX = () => (
    <CorteXView
      cashMovements={cashMovements}
      companyConfig={companyConfig}
      corteXArqB100={corteXArqB100}
      corteXArqB1000={corteXArqB1000}
      corteXArqB20={corteXArqB20}
      corteXArqB200={corteXArqB200}
      corteXArqB50={corteXArqB50}
      corteXArqB500={corteXArqB500}
      corteXArqM05={corteXArqM05}
      corteXArqM1={corteXArqM1}
      corteXArqM10={corteXArqM10}
      corteXArqM2={corteXArqM2}
      corteXArqM20={corteXArqM20}
      corteXArqM5={corteXArqM5}
      corteXFondoApertura={corteXFondoApertura}
      corteXSelectedDate={corteXSelectedDate}
      currentUser={currentUser}
      expenses={expenses}
      history={history}
      paymentMethod={paymentMethod}
      products={products}
      purchases={purchases}
      renderMaterialHeader={renderMaterialHeader}
      selectedTenant={selectedTenant}
      setAppMode={setAppMode}
      setCorteXArqB100={setCorteXArqB100}
      setCorteXArqB1000={setCorteXArqB1000}
      setCorteXArqB20={setCorteXArqB20}
      setCorteXArqB200={setCorteXArqB200}
      setCorteXArqB50={setCorteXArqB50}
      setCorteXArqB500={setCorteXArqB500}
      setCorteXArqM05={setCorteXArqM05}
      setCorteXArqM1={setCorteXArqM1}
      setCorteXArqM10={setCorteXArqM10}
      setCorteXArqM2={setCorteXArqM2}
      setCorteXArqM20={setCorteXArqM20}
      setCorteXArqM5={setCorteXArqM5}
      setCorteXFondoApertura={setCorteXFondoApertura}
      setCorteXSelectedDate={setCorteXSelectedDate}
      setShowCorteXCopiedToast={setShowCorteXCopiedToast}
      showCorteXCopiedToast={showCorteXCopiedToast}
      ticketBusinessName={ticketBusinessName}
      ticketSucursal={ticketSucursal}
          saveCorteXFondoApertura={saveCorteXFondoApertura}
      
    />
  );;



  const renderReporteMovimientos = () => (
    <ReporteMovimientosView
      checkoutReturnMode={checkoutReturnMode}
      history={history}
      isMovimientosConsulted={isMovimientosConsulted}
      paymentMethod={paymentMethod}
      renderMaterialHeader={renderMaterialHeader}
      reporteMovimientosFin={reporteMovimientosFin}
      reporteMovimientosInicio={reporteMovimientosInicio}
      selectedTenant={selectedTenant}
      setAppMode={setAppMode}
      setCheckoutReturnMode={setCheckoutReturnMode}
      setIsMovimientosConsulted={setIsMovimientosConsulted}
      setReporteMovimientosFin={setReporteMovimientosFin}
      setReporteMovimientosInicio={setReporteMovimientosInicio}
      setSelectedTableGestion={setSelectedTableGestion}
      users={users}
      
    />
  );;

  const renderCorteExpress = () => (
    <CorteExpressView
      activeExpressDenom={activeExpressDenom}
      companyConfig={companyConfig}
      corteFilterUserId={corteFilterUserId}
      currentUser={currentUser}
      expenses={expenses}
      expressArq100={expressArq100}
      expressArq1000={expressArq1000}
      expressArq20={expressArq20}
      expressArq200={expressArq200}
      expressArq50={expressArq50}
      expressArq500={expressArq500}
      expressArqM05={expressArqM05}
      expressArqM1={expressArqM1}
      expressArqM10={expressArqM10}
      expressArqM2={expressArqM2}
      expressArqM5={expressArqM5}
      setActiveExpressDenom={setActiveExpressDenom}
      setAppMode={setAppMode}
      setCorteFilterUserId={setCorteFilterUserId}
      setExpressArq100={setExpressArq100}
      setExpressArq1000={setExpressArq1000}
      setExpressArq20={setExpressArq20}
      setExpressArq200={setExpressArq200}
      setExpressArq50={setExpressArq50}
      setExpressArq500={setExpressArq500}
      setExpressArqM05={setExpressArqM05}
      setExpressArqM1={setExpressArqM1}
      setExpressArqM10={setExpressArqM10}
      setExpressArqM2={setExpressArqM2}
      setExpressArqM5={setExpressArqM5}
      setMenuToastMessage={setMenuToastMessage}
      setShowArqKeyboardModal={setShowArqKeyboardModal}
      setShowMenuToast={setShowMenuToast}
      setShowReceiptPreviewModal={setShowReceiptPreviewModal}
      showArqKeyboardModal={showArqKeyboardModal}
      showReceiptPreviewModal={showReceiptPreviewModal}
      triggerAppNotification={triggerAppNotification}
      users={users}
          corteData={corteData}
          filteredCashMovementsForCorte={filteredCashMovementsForCorte}
          filteredExpensesForCorte={filteredExpensesForCorte}
          generateCorteExpressTicketText={generateCorteExpressTicketText}
      
    />
  );;



  const handleAuthorizeCancellationFromNotification = async (
    tableId: string,
    items: { folio: number; productId: string; plate: number }[],
    pin: string,
    notifId: string
  ): Promise<any> => {
    const admin = validateAdminPin(pin);
    if (!admin) {
      return null;
    }
    const table = tables.find(t => t.id === tableId) || {};
    try {
      await finalizeComandaItemsCancellationInFirebase(
        tableId,
        table,
        items,
        admin
      );
      
      // Persist the approval in Firebase so other devices see it
      await updateNotificationInFirebase(notifId, { status: "approved", authorizedBy: admin.name });

      // Update local state of notifications to reflect the approval
      setNotificationsList(prev => prev.map(n => 
        n.id === notifId ? { ...n, status: "approved", authorizedBy: admin.name } : n
      ));

      return admin;
    } catch (err) {
      console.error("Error authorizing from notification:", err);
      throw err;
    }
  };

  const handleRejectCancellationFromNotification = async (
    tableId: string,
    items: { folio: number; productId: string; plate: number }[],
    notifId: string
  ): Promise<void> => {
    const table = tables.find(t => t.id === tableId) || {};
    try {
      for (const item of items) {
        await revertComandaItemsCancellationInFirebase(
          tableId,
          table,
          item.folio,
          item.productId,
          item.plate
        );
      }

      // Persist the rejection in Firebase so other devices see it
      await updateNotificationInFirebase(notifId, { status: "rejected" });

      // Update local state of notifications to reflect the rejection
      setNotificationsList(prev => prev.map(n => 
        n.id === notifId ? { ...n, status: "rejected" } : n
      ));
    } catch (err) {
      console.error("Error rejecting from notification:", err);
      throw err;
    }
  };

  const handleAuthorizeClosedAccountCancellationFromNotification = async (
    accountId: string,
    pin: string,
    notifId: string
  ): Promise<any> => {
    const admin = validateAdminPin(pin);
    if (!admin) {
      return null;
    }
    try {
      const account = history.find(a => a.id === accountId);
      const reason = account?.pendingCancellationReason || account?.cancellationReason || "Autorizado por Administrador";
      await cancelClosedAccountInFirebase(accountId, reason, admin);
      
      // Persist the approval in Firebase so other devices see it
      await updateNotificationInFirebase(notifId, { status: "approved", authorizedBy: admin.name });

      // Update local state of notifications to reflect the approval
      setNotificationsList(prev => prev.map(n => 
        n.id === notifId ? { ...n, status: "approved", authorizedBy: admin.name } : n
      ));

      return admin;
    } catch (err) {
      console.error("Error authorizing closed account from notification:", err);
      throw err;
    }
  };

  const handleRejectClosedAccountCancellationFromNotification = async (
    accountId: string,
    notifId: string
  ): Promise<void> => {
    try {
      await revertAccountCancellationInFirebase(accountId);

      // Persist the rejection in Firebase so other devices see it
      await updateNotificationInFirebase(notifId, { status: "rejected" });

      // Update local state of notifications to reflect the rejection
      setNotificationsList(prev => prev.map(n => 
        n.id === notifId ? { ...n, status: "rejected" } : n
      ));
    } catch (err) {
      console.error("Error rejecting closed account from notification:", err);
      throw err;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar auto-repeat si se deja presionada la tecla F10
      if (e.key === "F10" && !e.repeat) {
        e.preventDefault();
        // Solo si no estamos escuchando ni procesando, iniciamos
        if (!isListening && !isStartingVoiceRef.current && !isProcessingVoice) {
          startVoiceRecognition();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "F10") {
        e.preventDefault();
        // Si estamos escuchando, lo detenemos simulando un segundo clic (toggle)
        if (isListening) {
          startVoiceRecognition();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isListening, isProcessingVoice, startVoiceRecognition]);

  return (
    <IonApp>
      <InstallPWA />
      <NotificationsModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notificationsList={notificationsList}
        setNotificationsList={setNotificationsList}
        onReprint={printPedidoFromNetwork}
        onAuthorizeCancellation={handleAuthorizeCancellationFromNotification}
        onRejectCancellation={handleRejectCancellationFromNotification}
        onAuthorizeClosedAccountCancellation={handleAuthorizeClosedAccountCancellationFromNotification}
        onRejectClosedAccountCancellation={handleRejectClosedAccountCancellationFromNotification}
        activeSessionOpenedAt={activeSessionForCorte?.openedAt}
      />
      {isSwitchingTenant && renderSwitchingTenantOverlay()}
      {showTenantPinModal && renderPinModalOverlay()}
      <BranchSwitcherModal
          showBranchSwitcherModal={showBranchSwitcherModal}
          setShowBranchSwitcherModal={setShowBranchSwitcherModal}
          COMPANY_CATALOG={COMPANY_CATALOG}
          companiesConfig={companiesConfig}
          customOwners={customOwners}
          currentUser={currentUser}
          ownerKey={activeOwnerFilter}
          selectedTenant={selectedTenant}
          restrictedOwnerKey={restrictedOwnerKey}
          isSystemsMode={isSystemsMode}
          isSistemas={currentUser?.id?.endsWith('-sistemas') || false}
          activeOwnerFilter={activeOwnerFilter}
          handleSwitchBranch={handleSwitchBranch}
          MAPS_API_KEY={MAPS_API_KEY}
        />
      <BluetoothConfigModal
          tenantName={selectedTenant?.name || ""}
          showBluetoothConfigModal={showBluetoothConfigModal}
          setShowBluetoothConfigModal={setShowBluetoothConfigModal}
          productCategories={productCategories}
          setProductCategories={setProductCategories}
          tenantPrinterConfig={tenantPrinterConfig}
          setTenantPrinterConfig={setTenantPrinterConfig}
          triggerAppNotification={triggerAppNotification}
          activeBtConnections={activeBtConnections}
          availableWindowsPrinters={availableWindowsPrinters}
          fetchWindowsPrinters={fetchWindowsPrinters}
          handleSaveTenantPrinters={handleSaveTenantPrinters}
          handleScanBluetoothDevice={handleScanBluetoothDevice}
          handleTestPrinter={handleTestPrinter}
          isScanningBt={isScanningBt}
        />
      {showDeliverySetupModal && renderDeliverySetupModal()}
      <PrinterTemplateModal
        isOpen={showPrinterTemplateModal}
        onClose={() => setShowPrinterTemplateModal(false)}
        triggerAppNotification={(title, body, type) => {
          setMenuToastMessage(`🔔 [${title}] ${body}`);
          setShowMenuToast(true);
        }}
      />
      {/* Master Render */}
      {!currentUser ? (
        renderLogin()
      ) : (
        <>
          {appMode === "floorplan" && renderFloorplan()}
          {appMode === "menu" && renderMenu()}
          {appMode === "review" && renderReview()}
          {appMode === "table-details" && renderTableDetails()}
          {appMode === "checkout" && renderCheckout()}
          {appMode === "admin" && renderAdminPanel()}

          {appMode === "manage-menu" && renderManageMenu()}
          {appMode === "suppliers" && renderSuppliers()}
          {appMode === "customers" && renderCustomers()}
          {appMode === "reports" && renderReports()}
          {appMode === "reporte-movimientos" && renderReporteMovimientos()}
          {appMode === "corte-nuevo" && renderCorteNuevo()}
          {appMode === "corte-express" && renderCorteExpress()}
          {appMode === "corte-tabla" && renderCorteTabla()}
          {appMode === "corte-tabla-2" && renderCorteTabla2()}
          {appMode === "corte-x" && renderCorteX()}
          {appMode === "expenses" && renderExpenses()}
          {appMode === "gestion_cuentas" && renderGestionCuentas()}

          {renderSidebar()}
          <PaymentModal
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          selectedTable={selectedTable}
          selectedAccountForPayment={selectedAccountForPayment}
          selectedTenant={selectedTenant}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentAmountReceived={paymentAmountReceived}
          setPaymentAmountReceived={setPaymentAmountReceived}
          paymentDiscountType={paymentDiscountType}
          setPaymentDiscountType={setPaymentDiscountType}
          paymentDiscountValue={paymentDiscountValue}
          setPaymentDiscountValue={setPaymentDiscountValue}
          paymentDiscountTarget={paymentDiscountTarget}
          setPaymentDiscountTarget={setPaymentDiscountTarget}
          paymentTipTarget={paymentTipTarget}
          setPaymentTipTarget={setPaymentTipTarget}
          paymentTipValue={paymentTipValue}
          setPaymentTipValue={setPaymentTipValue}
          paymentCardType={paymentCardType}
          setPaymentCardType={setPaymentCardType}
          paymentCardLastFour={paymentCardLastFour}
          setPaymentCardLastFour={setPaymentCardLastFour}
          confirmPayment={confirmPayment}
          showNumpad={showNumpad}
          setShowNumpad={setShowNumpad}
          numpadValue={numpadValue}
          setNumpadValue={setNumpadValue}
          numpadTarget={numpadTarget}
          numpadTotal={numpadTotal}
          isNumpadValueFresh={isNumpadValueFresh}
          setIsNumpadValueFresh={setIsNumpadValueFresh}
          handleNumpadConfirm={handleNumpadConfirm}
          modalDiscountAmount={modalDiscountAmount}
          openNumpad={openNumpad}
        />
          <NumpadModal
          showNumpadModal={showNumpadModal}
          setShowNumpadModal={setShowNumpadModal}
        />
          <ProductCrudModal
          productCrudModal={productCrudModal}
          setProductCrudModal={setProductCrudModal}
          crudSelectedCategory={crudSelectedCategory}
          crudQuickNotes={crudQuickNotes}
          setCrudQuickNotes={setCrudQuickNotes}
          newCrudQuickNoteText={newCrudQuickNoteText}
          setNewCrudQuickNoteText={setNewCrudQuickNoteText}
          tenantPrinterConfig={tenantPrinterConfig}
          productCategories={productCategories}
          generateUUID={generateUUID}
          getMexicoISOString={getMexicoISOString}
          addProductToFirebase={addProductToFirebase}
          updateProductInFirebase={updateProductInFirebase}
          getAllProductsFromFirebase={getAllProductsFromFirebase}
          triggerAppNotification={triggerAppNotification}
          existingSubcategories={existingSubcategories}
          existingSubgroups={existingSubgroups}
          setRelationMatches={setRelationMatches}
          COMPANY_CATALOG={COMPANY_CATALOG}
          ownerBranches={COMPANY_CATALOG.filter(c => c.ownerKey === (currentUser?.ownerKey || (currentUser?.id || "").replace("-admin", "")))}
          allProducts={products}
          existing={null}
          tid={null}
        />

          {/* Bulk Item Cancellation Reason Modal */}
<BulkItemCancellationReasonModal
          showBulkItemCancellationReasonModal={showBulkItemCancellationReasonModal}
          setShowBulkItemCancellationReasonModal={setShowBulkItemCancellationReasonModal}
          bulkItemCancellationOtherReason={bulkItemCancellationOtherReason}
          bulkItemCancellationReason={bulkItemCancellationReason}
          currentUser={currentUser}
          itemsSelectedForCancellation={itemsSelectedForCancellation}
          selectedTable={selectedTable}
          selectedTenant={selectedTenant}
          setBulkItemCancellationOtherReason={setBulkItemCancellationOtherReason}
          setBulkItemCancellationReason={setBulkItemCancellationReason}
          setItemsSelectedForCancellation={setItemsSelectedForCancellation}
          triggerAppNotification={triggerAppNotification}
        />

          {/* Authorization Modal for Pending Cancellations */}
<AuthorizeCancellationModal
          showAuthorizeCancellationModal={showAuthorizeCancellationModal}
          setShowAuthorizeCancellationModal={setShowAuthorizeCancellationModal}
          authorizationPin={authorizationPin}
          handleAuthorizeAccountCancellation={handleAuthorizeAccountCancellation}
          pendingCancellationTarget={pendingCancellationTarget}
          renderCancellationPinPad={renderCancellationPinPad}
          selectedTable={selectedTable}
          setAuthorizationPin={setAuthorizationPin}
          setPendingCancellationTarget={setPendingCancellationTarget}
          triggerAppNotification={triggerAppNotification}
          validateAdminPin={validateAdminPin}
        />

          {/* Recipe Add Modal */}
          <RecipeAddInsumoModal
            isOpen={showRecipeAddModal}
            onClose={() => setShowRecipeAddModal(false)}
            inventory={inventory}
            addInventoryItemToFirebase={addInventoryItemToFirebase}
            selectedRecipeProduct={selectedRecipeProduct}
            setSelectedRecipeProduct={setSelectedRecipeProduct}
            updateProductInFirebase={updateProductInFirebase}
            products={products}
            productSearch={productSearch}
          />

          {/* Note/Customize Modal */}
          {(() => {
            const noteProduct = itemToNote ? products.find(p => p.id === itemToNote.productId) : null;
            return (
<ItemNoteModal
          itemToNote={itemToNote}
          setItemToNote={setItemToNote}
          isListeningNote={isListeningNote}
          isOnline={isOnline}
          noteProduct={noteProduct}
          saveItemNote={saveItemNote}
          setTempNote={setTempNote}
          tempNote={tempNote}
          toggleNoteVoiceRecognition={toggleNoteVoiceRecognition}
        />
            );
          })()}

          {/* Item Cancellation Modal */}
<ItemCancelModal
          itemToCancel={itemToCancel}
          setItemToCancel={setItemToCancel}
          accountCancellationOtherReason={accountCancellationOtherReason}
          handleCancelItem={handleCancelItem}
          handleMarkItemForCancellation={handleMarkItemForCancellation}
          itemCancelPin={itemCancelPin}
          itemCancelReason={itemCancelReason}
          renderCancellationPinPad={renderCancellationPinPad}
          setAccountCancellationOtherReason={setAccountCancellationOtherReason}
          setItemCancelPin={setItemCancelPin}
          setItemCancelReason={setItemCancelReason}
          validateAdminPin={validateAdminPin}
        />

          {/* Comanda Cancellation Modal */}
<ComandaCancelModal
          comandaToCancel={comandaToCancel}
          setComandaToCancel={setComandaToCancel}
          cancelEntireComanda={cancelEntireComanda}
          comandaCancelPin={comandaCancelPin}
          comandaCancelReason={comandaCancelReason}
          handleMarkEntireComandaForCancellation={handleMarkEntireComandaForCancellation}
          renderCancellationPinPad={renderCancellationPinPad}
          setComandaCancelPin={setComandaCancelPin}
          setComandaCancelReason={setComandaCancelReason}
          validateAdminPin={validateAdminPin}
        />

          {/* Closed Account Cancellation Modal */}
<AccountCancellationModal
          showAccountCancellationModal={showAccountCancellationModal}
          setShowAccountCancellationModal={setShowAccountCancellationModal}
          accountCancellationOtherReason={accountCancellationOtherReason}
          accountCancellationReason={accountCancellationReason}
          handleMarkAccountForCancellation={handleMarkAccountForCancellation}
          selectedAccountForCancellation={selectedAccountForCancellation}
          setAccountCancellationOtherReason={setAccountCancellationOtherReason}
          setAccountCancellationPin={setAccountCancellationPin}
          setAccountCancellationReason={setAccountCancellationReason}
          setSelectedAccountForCancellation={setSelectedAccountForCancellation}
        />
        </>
      )}
      {/* Modal para Editar Método de Pago en Historial */}
<EditPaymentModal
          isEditPaymentModalOpen={isEditPaymentModalOpen}
          setIsEditPaymentModalOpen={setIsEditPaymentModalOpen}
          accountToEditPayment={accountToEditPayment}
          selectedTenant={selectedTenant}
          handleUpdatePaymentMethod={handleUpdatePaymentMethod}
          setAccountToEditPayment={setAccountToEditPayment}
          setTempCardLastFour={setTempCardLastFour}
          setTempPaymentCardType={setTempPaymentCardType}
          setTempPaymentMethod={setTempPaymentMethod}
          tempCardLastFour={tempCardLastFour}
          tempPaymentCardType={tempPaymentCardType}
          tempPaymentMethod={tempPaymentMethod}
        />

      <DailyReportModal 
        isOpen={showDailyReportModal} 
        onClose={() => setShowDailyReportModal(false)}
        history={history}
        targetDate={dailyReportTargetDate}
        products={products}
        companyName={selectedTenant?.name || "Cocinet App"}
      />

      <IonAlert
        isOpen={showAttemptsExceededAlert}
        onDidDismiss={() => {
          setShowAttemptsExceededAlert(false);
          setShowPinPanel(false);
        }}
        header="⚠️ Límite de Intentos Excedido"
        message="Has superado los 3 intentos permitidos. Debes solicitar una clave de acceso al soporte técnico al 951 127 3796"
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Llamar 📞',
            handler: () => {
              window.location.href = "tel:9511273796";
            }
          },
          {
            text: 'WhatsApp 💬',
            handler: () => {
              const text = encodeURIComponent("Hola Cocinet, excedí los intentos de PIN y necesito una clave de acceso 🔑");
              window.open(`https://wa.me/529511273796?text=${text}`, "_blank");
            }
          }
        ]}
      />

      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "16px",
              right: "16px",
              margin: "0 auto",
              maxWidth: "500px",
              background: "rgba(185, 28, 28, 0.95)",
              backdropFilter: "blur(12px)",
              color: "white",
              padding: "20px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(239, 68, 68, 0.3)",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              zIndex: 99999,
              fontFamily: "'Space Grotesk', sans-serif",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}
              >
                📴
              </motion.div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "900", letterSpacing: "0.03em" }}>
                  SIN CONEXIÓN A INTERNET
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", opacity: 0.95, fontWeight: "bold", lineHeight: "1.4" }}>
                  PUEDE SEGUIR OPERANDO, LE AVISAREMOS EN CUANTO SE CONECTE DE NUEVO
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOfflineBanner(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "white",
                color: "#b91c1c",
                fontWeight: "900",
                fontSize: "12px",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              <span>👍</span> Enterado y continuar la operación
            </button>
          </motion.div>
        )}

        {showOnlineBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "16px",
              right: "16px",
              margin: "0 auto",
              maxWidth: "500px",
              background: "rgba(6, 95, 70, 0.95)",
              backdropFilter: "blur(12px)",
              color: "white",
              padding: "20px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.3)",
              border: "2px solid rgba(16, 185, 129, 0.4)",
              zIndex: 99999,
              fontFamily: "'Space Grotesk', sans-serif",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}
              >
                📶
              </motion.div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "900", letterSpacing: "0.03em" }}>
                  CONEXIÓN REESTABLECIDA
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", opacity: 0.95, fontWeight: "bold", lineHeight: "1.4" }}>
                  El sistema ha recuperado la conexión y está operando en línea.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOnlineBanner(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "white",
                color: "#065f46",
                fontWeight: "900",
                fontSize: "12px",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              <span>👍</span> Enterado y continuar la operación
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para solicitar Folio Interno de Comanda por Sucursal (Rápido POS) 📋 */}
<FolioModal
          showFolioModal={showFolioModal}
          setShowFolioModal={setShowFolioModal}
          setFolioModalError={setFolioModalError}
          selectedTenant={selectedTenant}
          suggestedLastFolio={suggestedLastFolio}
          folioModalError={folioModalError}
          folioStep={folioStep}
          folioInputRef={folioInputRef}
          folioInputValue={folioInputValue}
          isGeneratingOrder={isGeneratingOrder}
          setFolioInputValue={setFolioInputValue}
          handleFolioStepSubmit={handleFolioStepSubmit}
        />

      {/* Modal para solicitar Teléfono Celular de Referencia al requerir factura */}
<InvoicePhoneModal
          showInvoicePhoneModal={showInvoicePhoneModal}
          setShowInvoicePhoneModal={setShowInvoicePhoneModal}
          handleConfirmInvoicePhone={handleConfirmInvoicePhone}
          inputInvoicePhone={inputInvoicePhone}
          inputInvoicePhoneConfirm={inputInvoicePhoneConfirm}
          invoicePhoneError={invoicePhoneError}
          setInputInvoicePhone={setInputInvoicePhone}
          setInputInvoicePhoneConfirm={setInputInvoicePhoneConfirm}
          setPendingInvoiceTarget={setPendingInvoiceTarget}
        />

      <IonAlert
        isOpen={deleteConfirmation.isOpen}
        onDidDismiss={() => setDeleteConfirmation({ isOpen: false, type: "single" })}
        header="⚠️ Confirmar Eliminación"
        message={
          deleteConfirmation.type === "single"
            ? `¿Estás seguro de que deseas eliminar (lógicamente) el producto ${deleteConfirmation.targetName}?\n\nNota: Este producto solo será ocultado para este tenant/sucursal.`
            : `¿Estás a punto de eliminar TODOS los productos de ${selectedTenant?.name || "este tenant"}?\n\nEsta es la última confirmación.`
        }
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
            cssClass: "text-slate-500 font-semibold",
          },
          {
            text: "Sí, Eliminar",
            role: "destructive",
            cssClass: "text-rose-600 font-bold",
            handler: async () => {
              try {
                if (deleteConfirmation.type === "single" && deleteConfirmation.targetId) {
                  await updateProductInFirebase(deleteConfirmation.targetId, { isDeleted: true });
                  setShowMenuToast(true);
                  setMenuToastMessage("Producto eliminado lógicamente del tenant.");
                } else if (deleteConfirmation.type === "all") {
                  await softDeleteAllProductsFromFirebase(selectedTenant.id, selectedTenant.name || "Sucursal", products);
                  setShowMenuToast(true);
                  setMenuToastMessage("Todos los productos fueron eliminados lógicamente.");
                }
              } catch (error) {
                console.error(error);
                setShowMenuToast(true);
                setMenuToastMessage("Error al eliminar.");
              }
            },
          },
        ]}
      />

      <IonToast
        isOpen={showMenuToast}
        onDidDismiss={() => setShowMenuToast(false)}
        message={menuToastMessage}
        duration={4000}
        position="bottom"
        style={{
          "--background": "#1e293b",
          "--color": "#f8fafc",
          "--border-radius": "16px",
          "--button-color": "#38bdf8",
          "fontWeight": "bold"
        }}
      />
    </IonApp>
  );
}


