import { DailyReportModal } from "./components/DailyReportModal";
import InstallPWA from "./components/InstallPWA";
import NotificationsModal from "./components/NotificationsModal";
import RecipeAddInsumoModal from "./components/RecipeAddInsumoModal";
import { PrinterTemplateModal } from "./components/PrinterTemplateModal";
import {
  User,
  Product,
  getOperatingDay,
  getFormattedProductName,
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
  getCompanyCatalog
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
  const [selectedTenant, setSelectedTenant] = useState<CompanyTenant>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let tenantParam =
        params.get("tenant") ||
        params.get("sucursal") ||
        params.get("company") ||
        params.get("id");
      if (tenantParam) {
        const found = COMPANY_CATALOG.find(
          (c) =>
            c.id.toLowerCase() === tenantParam.toLowerCase().trim() ||
            c.name.toLowerCase().includes(tenantParam.toLowerCase().trim()) ||
            c.sucursalDefault
              .toLowerCase()
              .includes(tenantParam.toLowerCase().trim())
        );
        if (found) {
          return found;
        }
      }

      const cached = localStorage.getItem("pos_selected_tenant");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          const found = COMPANY_CATALOG.find((c) => c.id === parsed.id);
          if (found) return found;
          return {
            id: parsed.id,
            name: parsed.name || "Sucursal",
            rfc: parsed.rfc || "XAXX010101000",
            ownerEmail: parsed.ownerEmail || "",
            avatar: parsed.avatar || "🏢",
            accentColor: parsed.accentColor || "#4f46e5",
            lightColor: parsed.lightColor || "#4f46e533",
            bgColor: parsed.bgColor || "from-slate-50 to-indigo-100",
            sucursalDefault: parsed.sucursalDefault || parsed.name || "Sucursal",
            type: parsed.type || "Sucursal",
            propietario: parsed.propietario || "PROPIETARIO",
            ownerKey: parsed.ownerKey || "1",
            ...parsed,
          };
        }
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

    const santaMaria = COMPANY_CATALOG.find((c) => c.id === "tenant-7") || COMPANY_CATALOG[0];
    return santaMaria;
  });

  useEffect(() => {
    if (selectedTenant) {
      try {
        localStorage.setItem("pos_selected_tenant", JSON.stringify(selectedTenant));
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
        const found = COMPANY_CATALOG.find(
          (c) =>
            c.id.toLowerCase() === tenantParam.toLowerCase().trim() ||
            c.name.toLowerCase().includes(tenantParam.toLowerCase().trim()) ||
            c.sucursalDefault
              .toLowerCase()
              .includes(tenantParam.toLowerCase().trim()),
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

            const isVertical = window.innerWidth < window.innerHeight || window.innerWidth < 768;
            if (loggedUser.role === "admin" || loggedUser.id.endsWith("-sistemas")) {
              setAppMode("corte-tabla");
            } else {
              setAppMode(isVertical ? "floorplan" : "gestion_cuentas");
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
                const isVertical = window.innerWidth < window.innerHeight || window.innerWidth < 768;
                if (autoUser.role === "admin" || autoUser.id.endsWith("-sistemas")) {
                  setAppMode("corte-tabla");
                } else {
                  setAppMode(isVertical ? "floorplan" : "gestion_cuentas");
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

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
      const cached = localStorage.getItem("pos_history");
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }));
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
      try {
        localStorage.setItem(
          "pos_history",
          JSON.stringify(parsedServerHistory),
        );
      } catch (e) {
        console.warn("Error caching history:", e);
      }
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
                  tenantId: u.tenantId || ""
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

        setCompanyConfig({
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
        });

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

  const renderSwitchingTenantOverlay = () => {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <IonSpinner name="crescent" style={{ width: "64px", height: "64px", color: "#6366f1", marginBottom: "20px" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", margin: "0 0 8px 0" }}>
          🔄 Conectando a {switchingTenantName || "Sucursal"}...
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
          Sincronizando base de datos y catálogo de productos...
        </p>
      </div>
    );
  };

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

  const handleSaveOwner = async () => {
    if (!formOwnerName.trim()) {
      triggerAppNotification("⚠️ Error", "El nombre del propietario es requerido.", "warning");
      return;
    }

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

  // Tenant Transfer States (Traspaso de Inquilino inline)
  const [transferStep, setTransferStep] = useState<0 | 1 | 2>(0);
  const [transferTargetOwnerKey, setTransferTargetOwnerKey] = useState("");
  const [transferIncludeBranches, setTransferIncludeBranches] = useState(true);

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
    if (!formTenantName.trim()) {
      alert("Por favor ingresa el nombre de la empresa.");
      return;
    }
    if (!formTenantRfc.trim()) {
      alert("Por favor ingresa el RFC.");
      return;
    }
    if (!formTenantSucursal.trim()) {
      alert("Por favor ingresa el nombre de la sucursal.");
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
      // Auto-seed default 30 tables and standard products for new sucursal / tenant 🏢🌮
      initializeDefaultTablesForTenant(tenantData.id).catch((err) => {
        console.warn("Could not seed tables for new tenant:", err);
      });
      initializeDefaultProductsForTenant(tenantData.id).catch((err) => {
        console.warn("Could not seed products for new tenant:", err);
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

  const handleOwnerPinSubmit = (enteredPin: string) => {
    if (enteredPin === "4020" || enteredPin === "2052") {
      setIsOwnerUnlocked(true);
      setActiveOwnerFilter(null);
      setIsMasterAdmin(enteredPin === "2052");
      localStorage.setItem("cocinet_is_owner_unlocked", "true");
      if (enteredPin === "2052") {
        localStorage.setItem("pos_master_admin", "true");
      }
      localStorage.removeItem("cocinet_active_owner_filter");
      triggerAppNotification(
        "🔑 Acceso Maestro Autorizado",
        "Visualización total de todas las sucursales activa para propósitos de auditoría local.",
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

    // 3. Search through ALL users of ALL sucursales
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

      // Apply role-based privileges
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

      // Clean address bar query parameters to avoid page reload loops
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}

      // Redirect based on role and screen orientation
      const isVertical = window.innerWidth < window.innerHeight || window.innerWidth < 768;
      if (matchedUser.role === "admin" || matchedUser.id.endsWith("-sistemas")) {
        setAppMode("corte-tabla");
      } else {
        setAppMode(isVertical ? "floorplan" : "gestion_cuentas");
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
          `El PIN ingresado no corresponde a ningún propietario o empleado autorizado. Intento ${nextAttempts}/3.`,
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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
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
  >("floorplan");

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
      const unsub = subscribeToPrinterQueue(selectedTenant.id, (data) => {
        setPrinterQueue(data.slice(0, 15));
      });
      return () => unsub();
    }
  }, [selectedTenant]);

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
        job.setPrintMode(job.FONT_SIZE_BIG + job.FONT_EMPHASIZED).bold(true);
        job.printLine(`COMANDA #${pedido.folio}`);
        
        job.setPrintMode(job.FONT_SIZE_NORMAL).bold(true);
        if (pedido.mesero) {
          job.printLine(`MESERO: ${pedido.mesero.toUpperCase()}`);
        }
        
        const destLabel = printerName === "cocina" ? "COCINA" : printerName === "barra" ? "BARRA" : "GENERAL";
        job.printLine(`DESTINO: ${destLabel}`);
        job.printLine(`MESA: ${pedido.mesa}`);
        
        const timeStr = pedido.timestamp ? new Date(pedido.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        job.printLine(`HORA: ${timeStr}`);
        
        if (pedido.deliveryClientName || pedido.deliveryAddress) {
          job.bold(true).printLine("-- DATOS DE ENVIO --").bold(false);
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
        }
        
        job.bold(false).printLine("--------------------------------");

        job.left();

        if (printerName === "cocina") {
          // Group by comensal/plate if present
          const hasComensal = pedido.items?.some((i: any) => i.comensal !== undefined);
          if (hasComensal) {
            const plates = Array.from(
              new Set(pedido.items.map((i: any) => i.comensal || 1))
            ).sort((a: any, b: any) => Number(a) - Number(b));
            
            plates.forEach((plateNum) => {
              job.center().bold(true).printLine(`*** COMENSAL ${plateNum} ***`).bold(false).left();
              pedido.items
                .filter((i: any) => (i.comensal || 1) === plateNum)
                .forEach((item: any) => {
                  job.printLine(`${item.cantidad}x ${item.nombre.toUpperCase()}`);
                  if (item.notas) {
                    job.printLine(`   > ${item.notas}`);
                  }
                });
              job.printLine("--------------------------------");
            });
          } else {
            pedido.items?.forEach((item: any) => {
              job.printLine(`${item.cantidad}x ${item.nombre.toUpperCase()}`);
              if (item.notas) {
                job.printLine(`   > ${item.notes || item.notas}`);
              }
            });
          }
        } else {
          // Bar or General
          pedido.items?.forEach((item: any) => {
            job.printLine(`${item.cantidad}x ${item.nombre.toUpperCase()}`);
            if (item.notas) {
              job.printLine(`   > ${item.notes || item.notas}`);
            }
          });
        }

        if (pedido.generalNotes) {
          job.feed(1).bold(true).printLine(`OBS: ${pedido.generalNotes}`).bold(false);
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
          const maxDescLen = Math.max(10, 32 - price.length - 4);
          const rawName = String(item.nombre).toUpperCase();
          const cleanName = rawName.length > maxDescLen ? rawName.substring(0, maxDescLen) : rawName;
          const line = `${item.cantidad}x ${cleanName}`;
          const padding = " ".repeat(Math.max(1, 32 - line.length - price.length));
          job.printLine(line + padding + price);
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
      job.execute();
      console.log(`[WindowsAutoPrint] Sent print job for ${pedido.tipo} #${pedido.folio}`);
    } catch (err) {
      console.error("[WindowsAutoPrint] Error preparing or sending print job:", err);
    }
  };

  // Background printer queue observer daemon for Windows
  useEffect(() => {
    if (!selectedTenant || !systemLocalWindowsAutoPrint) return;

    const pendingPedidos = printerQueue.filter((p) => p.impreso === false || p.impreso === undefined);

    pendingPedidos.forEach((pedido) => {
      const isAlreadyProcessed = 
        processedPrintIdsRef.current.has(pedido.id) ||
        (pedido.tipo === "cuenta" && pedido.folio && processedPrintIdsRef.current.has(pedido.folio));

      if (isAlreadyProcessed) return;

      processedPrintIdsRef.current.add(pedido.id);

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
  const [corte2FolioAnterior, setCorte2FolioAnterior] = useState<number>(0);
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

  const fetchWindowsPrinters = async () => {
    setIsSentinelLoading(true);
    try {
      const printers = await getWindowsPrinters();
      setAvailableWindowsPrinters(printers);
    } catch (err) {
      console.error("Error al cargar impresoras de Windows:", err);
    } finally {
      setIsSentinelLoading(false);
    }
  };

  useEffect(() => {
    if (showBluetoothConfigModal && systemPrintDestination === "windows") {
      fetchWindowsPrinters();
    }
  }, [showBluetoothConfigModal, systemPrintDestination, windowsPrinterPort]);


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

        const isVertical = window.innerWidth < window.innerHeight || window.innerWidth < 768;
        if (adminUser && (adminUser.role === "admin" || adminUser.id.endsWith("-sistemas"))) {
          setAppMode("corte-tabla");
        } else {
          setAppMode(isVertical ? "floorplan" : "gestion_cuentas");
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
      const tableItems = selectedTable?.comandas.flatMap((c) => c.items) || [];
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

  // Automatically default Corte View Mode to "current" (Turno Actual) for administrators
  // so they can see active movements and the current operating day right away instead of history.
  useEffect(() => {
    if (currentUser?.role === "admin") {
      setCorteViewMode("current");
    }
  }, [currentUser, selectedTenant]);

  const [pendingCancellation, setPendingCancellation] = useState<{
    type: "item" | "order";
    data: any;
  } | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
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
        setAppMode("floorplan");
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
    
    setAppMode("floorplan");
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

  const renderUserHeaderInfo = () => {
    if (!currentUser) return null;
    const currentOpDay = getOperatingDay(new Date());
    const unreadCount = notificationsList.filter(
      (n) => !n.read && getOperatingDay(n.createdAt ? new Date(n.createdAt) : new Date()) === currentOpDay
    ).length;
    return (
      <IonButtons slot="end">
        {/* Notification Bell Button 🔔 */}
        <IonButton
          onClick={() => setShowNotificationModal(true)}
          color="warning"
          fill="clear"
          style={{
            position: "relative",
            marginRight: "4px",
            "--background": "rgba(255,255,255,0.08)",
            borderRadius: "10px",
            width: "36px",
            height: "36px",
          }}
        >
          <IonIcon
            icon={notificationsOutline}
            slot="icon-only"
            style={{ fontSize: "20px" }}
          />
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                background: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                fontSize: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                boxShadow: "0 0 6px #ef4444",
                border: "1px solid white",
              }}
            >
              {unreadCount}
            </div>
          )}
        </IonButton>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginLeft: "4px",
            marginRight: "10px",
          }}
        >
          <IonText
            style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}
          >
            {currentUser.name}
          </IonText>
          <IonText
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{currentUser.role}</span>
            {isUrlTokenSession && (
              <button
                onClick={() => {
                  setNewPinInput("");
                  setShowChangePinModal(true);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "1px 4px",
                  color: "#38bdf8",
                  fontSize: "9px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  gap: "2px",
                }}
                title="Personalizar PIN 🔑"
              >
                🔑 PIN
              </button>
            )}
            {/* Quick button to switch user profile 👤🔄 */}
            <button
              onClick={() => {
                setCurrentUser(null);
                setSelectedLoginUser(null);
                setLoginSubStep("user");
                localStorage.removeItem("pos_current_user");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "4px",
                padding: "1px 4px",
                color: "white",
                fontSize: "8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                fontFamily: "sans-serif",
              }}
              title="Cambiar Usuario 👤🔄"
            >
              👤🔄
            </button>
          </IonText>
        </div>
        <IonButton
          onClick={handleLogout}
          color="light"
          fill="clear"
          title="Cerrar Sesión Completa"
        >
          <IonIcon icon={closeOutline} slot="icon-only" />
        </IonButton>
      </IonButtons>
    );
  };

  const renderMaterialHeader = (options: {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    showMenu?: boolean;
    actions?: React.ReactNode;
    minimal?: boolean;
  }) => {
    const { title, subtitle, showBack = false, onBack, showMenu = true, actions, minimal = false } = options;
    const currentOpDay = getOperatingDay(new Date());
    const unreadCount = notificationsList.filter(
      (n) => !n.read && getOperatingDay(n.createdAt ? new Date(n.createdAt) : new Date()) === currentOpDay
    ).length;

    return (
      <IonHeader className="ion-no-border" style={{ zIndex: 100 }}>
        <div 
          className={`w-full text-white shadow-lg border-b select-none transition-all duration-500 ${
            isOnline 
              ? "bg-black border-neutral-900" 
              : "bg-red-600 border-red-700"
          }`}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            padding: "10px 16px",
          }}
        >
          <div className="flex items-center justify-between gap-3 h-14">
            {/* Left Section: Back or Menu Button */}
            <div className="flex items-center gap-3">
              {showBack ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack || (() => setAppMode("floorplan"))}
                  className="w-10 h-10 rounded-full bg-indigo-900/40 hover:bg-indigo-800 text-lg flex items-center justify-center transition border-none cursor-pointer outline-none shadow-sm text-amber-400"
                  title="Retroceder"
                >
                  ⬅️
                </motion.button>
              ) : showMenu ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSidebar(true)}
                  className="w-10 h-10 rounded-full bg-indigo-900/40 hover:bg-indigo-800 text-lg flex items-center justify-center transition border-none cursor-pointer outline-none shadow-sm"
                  title="Menú Principal"
                >
                  <IonIcon icon={menuOutline} style={{ fontSize: "22px", color: "white" }} />
                </motion.button>
              ) : null}

              {/* Title Section */}
              <div className="text-left flex flex-col justify-center leading-tight">
                <h1 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg m-0">
                  {title}
                </h1>
                {subtitle && (
                  <span className="text-[9px] sm:text-[11px] text-slate-300 font-bold tracking-normal truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Right Section: User details & Notifications & Actions & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {actions}

              {/* Notifications Button */}
              {!minimal && currentUser && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotificationModal(true)}
                  className="relative w-9 h-9 rounded-full bg-indigo-900/40 hover:bg-indigo-800 flex items-center justify-center text-lg border-none cursor-pointer outline-none transition"
                  title="Notificaciones"
                >
                  🔔
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-black shadow-md border border-white animate-bounce">
                      {unreadCount}
                    </div>
                  )}
                </motion.button>
              )}

              {/* Branch indicator & Switcher button */}
              {!minimal && selectedTenant && (
                <div className="flex items-center gap-1.5">
                  <div className="hidden sm:flex items-center px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
                      🏢 {selectedTenant.name}
                    </span>
                  </div>

                  {(isOwnerUnlocked || currentUser?.role === "owner" || currentUser?.role === "supervisor" || isMasterAdmin) && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBranchSwitcherModal(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase flex items-center gap-1 shadow-md border border-indigo-400/40 cursor-pointer"
                      title="Cambiar de Sucursal (Patrón / Supervisor)"
                    >
                      <span>🚪</span>
                      <span className="hidden xs:inline">Cambiar Sucursal</span>
                    </motion.button>
                  )}
                </div>
              )}

              {!minimal && currentUser && (
                <div className="hidden md:flex flex-col items-end text-right leading-none gap-0.5">
                  <span className="text-[11px] font-black text-slate-200">{currentUser.name}</span>
                  <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              )}

              {/* Quick switch profile 👤🔄 */}
              {!minimal && currentUser && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentUser(null);
                    setSelectedLoginUser(null);
                    setLoginSubStep("user");
                    localStorage.removeItem("pos_current_user");
                  }}
                  className="w-9 h-9 rounded-full bg-indigo-900/40 hover:bg-indigo-800 text-sm flex items-center justify-center border-none cursor-pointer outline-none transition"
                  title="Cambiar Usuario 👤🔄"
                >
                  👤🔄
                </motion.button>
              )}

              {/* Logout Button (Cerrar Sesión) */}
              {!minimal && currentUser && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md shadow-rose-900/20 cursor-pointer outline-none"
                  title="Cerrar Sesión Completa"
                >
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span>🚪</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </IonHeader>
    );
  };

  const renderLogin = () => {
    return (
      <IonPage>
        <TenantUsersModal
          showTenantUsersModal={showTenantUsersModal}
          setShowTenantUsersModal={setShowTenantUsersModal}
          modalTenant={modalTenant}
          modalUsers={modalUsers}
          handleAddRow={handleAddRow}
          handleCellChange={handleCellChange}
          handleDeleteRow={handleDeleteRow}
          revealedPins={revealedPins}
          setRevealedPins={setRevealedPins}
          triggerAppNotification={triggerAppNotification}
        />
        <TenantCrudModal
          showTenantCrudModal={showTenantCrudModal}
          setShowTenantCrudModal={setShowTenantCrudModal}
          editingTenant={editingTenant}
          resetTenantForm={resetTenantForm}
          COMPANY_CATALOG={COMPANY_CATALOG}
          customOwners={customOwners}
          dependentBranches={dependentBranches}
          formTenantType={formTenantType}
          setFormTenantType={setFormTenantType}
          formTenantName={formTenantName}
          setFormTenantName={setFormTenantName}
          formTenantPropietario={formTenantPropietario}
          setFormTenantPropietario={setFormTenantPropietario}
          formTenantOwnerKey={formTenantOwnerKey}
          setFormTenantOwnerKey={setFormTenantOwnerKey}
          formTenantSucursal={formTenantSucursal}
          setFormTenantSucursal={setFormTenantSucursal}
          formTenantRfc={formTenantRfc}
          setFormTenantRfc={setFormTenantRfc}
          formTenantDireccion={formTenantDireccion}
          setFormTenantDireccion={setFormTenantDireccion}
          formTenantEmail={formTenantEmail}
          setFormTenantEmail={setFormTenantEmail}
          formTenantLat={formTenantLat}
          setFormTenantLat={setFormTenantLat}
          formTenantLng={formTenantLng}
          setFormTenantLng={setFormTenantLng}
          formTenantLogoUrl={formTenantLogoUrl}
          setFormTenantLogoUrl={setFormTenantLogoUrl}
          formTenantAvatar={formTenantAvatar}
          setFormTenantAvatar={setFormTenantAvatar}
          formTenantAccentColor={formTenantAccentColor}
          setFormTenantAccentColor={setFormTenantAccentColor}
          formTenantRequireInternalFolio={formTenantRequireInternalFolio}
          setFormTenantRequireInternalFolio={setFormTenantRequireInternalFolio}
          transferStep={transferStep}
          setTransferStep={setTransferStep}
          transferTargetOwnerKey={transferTargetOwnerKey}
          setTransferTargetOwnerKey={setTransferTargetOwnerKey}
          transferIncludeBranches={transferIncludeBranches}
          setTransferIncludeBranches={setTransferIncludeBranches}
          handleSaveTenant={handleSaveTenant}
          handleDeleteTenant={handleDeleteTenant}
          executeTenantTransfer={executeTenantTransfer}
          triggerAppNotification={triggerAppNotification}
        />
        <OwnerCrudModal
          showOwnerCrudModal={showOwnerCrudModal}
          setShowOwnerCrudModal={setShowOwnerCrudModal}
          editingOwner={editingOwner}
          setEditingOwner={setEditingOwner}
          formOwnerName={formOwnerName}
          setFormOwnerName={setFormOwnerName}
          formOwnerPin={formOwnerPin}
          setFormOwnerPin={setFormOwnerPin}
          formOwnerSupervisorPin={formOwnerSupervisorPin}
          setFormOwnerSupervisorPin={setFormOwnerSupervisorPin}
          formOwnerAccent={formOwnerAccent}
          setFormOwnerAccent={setFormOwnerAccent}
          formOwnerLogo={formOwnerLogo}
          setFormOwnerLogo={setFormOwnerLogo}
          formOwnerAvatar={formOwnerAvatar}
          setFormOwnerAvatar={setFormOwnerAvatar}
          handleSaveOwner={handleSaveOwner}
          handleDeleteOwner={handleDeleteOwner}
          triggerAppNotification={triggerAppNotification}
        />
        {/* Device Requests Modal (Master Admin only) */}
        <DeviceRequestsModal
          showDeviceRequestsModal={showDeviceRequestsModal}
          setShowDeviceRequestsModal={setShowDeviceRequestsModal}
          allDeviceRequests={allDeviceRequests}
          COMPANY_CATALOG={COMPANY_CATALOG}
          updateDeviceRequest={updateDeviceRequest}
        />

        

        {/* Modal informativo sobre Estructura Systemática de PINs de Acceso */}
        <PinsStructureModal
          showPinsStructureModal={showPinsStructureModal}
          setShowPinsStructureModal={setShowPinsStructureModal}
          COMPANY_CATALOG={COMPANY_CATALOG}
        />

        {/* Modal Gestor de Empresas (MySQL Model) */}
<ManageCompaniesModal
          showManageCompaniesModal={showManageCompaniesModal}
          setShowManageCompaniesModal={setShowManageCompaniesModal}
          activeOwnerFilter={activeOwnerFilter}
          users={users}
          COMPANY_CATALOG={COMPANY_CATALOG}
          setCompanyCatalog={setCompanyCatalog}
          triggerAppNotification={triggerAppNotification}
        />

        {/* Modal Configurar Sucursales (Filtros por Prefijo Roy/Sombrerudos) */}
        <ConfigurePrefixModal
          showConfigurePrefixModal={showConfigurePrefixModal}
          setShowConfigurePrefixModal={setShowConfigurePrefixModal}
          branchNamePrefix={branchNamePrefix}
          setBranchNamePrefix={setBranchNamePrefix}
          triggerAppNotification={triggerAppNotification}
          COMPANY_CATALOG={COMPANY_CATALOG}
        />

        <IonContent
          style={{
            "--background": "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            "--padding-top": "0px",
            "--padding-bottom": "0px",
            "--padding-start": "0px",
            "--padding-end": "0px",
          }}
        >
          <style>{`
            @keyframes lock-glowing-pulse {
              0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 2px rgba(217, 119, 6, 0.4));
              }
              50% {
                transform: scale(1.22);
                filter: drop-shadow(0 0 12px rgba(217, 119, 6, 0.85));
              }
            }
            .animate-lock {
              display: inline-block;
              animation: lock-glowing-pulse 1.8s infinite ease-in-out;
            }
          `}</style>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              padding: "0",
            }}
          >
            {!showPinPanel && (
              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest(".no-pin-trigger") || target.closest("button") || target.closest("[role='button']")) {
                    return;
                  }
                  setShowPinPanel(true);
                }}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minHeight: "100vh",
                  maxHeight: "100vh",
                  margin: "0",
                  padding: "1rem 1rem",
                  backgroundColor: "#f4ecd8",
                  textAlign: "center",
                  boxShadow: "inset 0 0 40px rgba(140, 124, 104, 0.3)",
                  borderRadius: "0px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
                className="select-none overflow-hidden"
              >
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    right: "10px",
                    bottom: "10px",
                    border: "2px solid #8c7c68",
                    opacity: 0.4,
                    pointerEvents: "none",
                  }}
                ></div>

                {/* 🌊 MARCA DE AGUA DEL LOGO OFICIAL COCINET */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(85vw, 480px)",
                    height: "min(85vh, 480px)",
                    backgroundImage: "url('/cocinet-logo.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                    opacity: 0.12,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />

                {/* 🎨 EMBLEMA / LOGO SUPERIOR DEL SISTEMA */}
                <div className="relative z-10 mb-1 flex items-center justify-center">
                  <img
                    src="/cocinet-logo.png"
                    alt="Logo COCINET"
                    className="h-16 sm:h-20 max-h-[18vh] w-auto object-contain drop-shadow-md transition-transform hover:scale-105"
                    style={{ filter: "drop-shadow(0px 4px 10px rgba(45, 36, 28, 0.18))" }}
                  />
                </div>

                <h1
                  className="relative z-10"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(2.8rem, 6vw, 4.2rem)",
                    margin: "0.2rem 0",
                    color: "#2d241c",
                    textTransform: "uppercase",
                    lineHeight: "1",
                    textShadow: "2px 2px 0px #e0d5ba",
                  }}
                >
                  Cocinet
                </h1>
                <h2
                  className="relative z-10"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: 0,
                    fontWeight: "900",
                    fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                    textShadow: "0px 4px 20px rgba(78, 205, 196, 0.4)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  VERSIÓN AGOSTO 2026
                </h2>

                {/* 🔒 GRAN CANDADO PULSANTE EN EL CENTRO */}
                <div className="my-2.5 relative z-10">
                  <span
                    className="animate-lock cursor-pointer"
                    style={{ fontSize: "2.8rem" }}
                    role="img"
                    aria-label="candado"
                  >
                    🔒
                  </span>
                  <div className="text-[12px] sm:text-[13px] font-black uppercase text-amber-800 tracking-wider mt-1">
                    Haga clic para acceder
                  </div>
                </div>

                {/* 📞💬🎬 FILA DE EMOJIS DE SOPORTE DIRECTO DEBAJO DEL CANDADO */}
                <div 
                  className="flex flex-col items-center justify-center mt-3 pt-3 border-t border-dashed border-[#8c7c68]/40 w-full no-pin-trigger relative z-20"
                  onClick={(e) => e.stopPropagation()} // Para que hacer clic en los emojis no abra el panel del PIN
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[11px] sm:text-[12px] font-extrabold uppercase text-amber-900/80 tracking-widest mb-2">
                    Soporte técnico
                  </div>
                  <div className="flex items-center justify-center gap-7">
                    {/* Teléfono */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportAction("phone", e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-3xl sm:text-4xl hover:scale-130 active:scale-95 transition-all duration-200 select-none cursor-pointer bg-transparent border-none p-0 focus:outline-none relative z-30"
                      title="Llamar al 951-127-3796"
                    >
                      📞
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportAction("whatsapp", e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-3xl sm:text-4xl hover:scale-130 active:scale-95 transition-all duration-200 select-none cursor-pointer bg-transparent border-none p-0 focus:outline-none relative z-30"
                      title="Enviar WhatsApp al 951-127-3796"
                    >
                      💬
                    </button>

                    {/* Video Tutorial / FAQ (🎬) */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportAction("video", e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-3xl sm:text-4xl hover:scale-130 active:scale-95 transition-all duration-200 select-none cursor-pointer bg-transparent border-none p-0 focus:outline-none relative z-30"
                      title="Video Tutorial y Preguntas Frecuentes"
                    >
                      🎬
                    </button>
                  </div>
                </div>

                {/* 📅 Reloj y Calendario en tiempo real estilo Tarjeta */}
                <div 
                  className="mt-3 flex flex-col items-stretch justify-center gap-3 bg-[#fcf9f2]/90 backdrop-blur-sm border border-[#d2c2ad] rounded-2xl p-4 shadow-sm max-w-[420px] mx-auto w-full no-pin-trigger relative z-20"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Fecha - Tipo Calendario */}
                  <div className="flex items-center gap-3 text-[#5c4d3c] w-full pl-2">
                    <div className="text-3xl select-none" role="img" aria-label="Calendario">📅</div>
                    <div className="text-left">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Fecha</div>
                      <div className="text-[16px] sm:text-[17px] font-black uppercase text-slate-700 leading-tight">
                        {(() => {
                          const str = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
                          return str.charAt(0).toUpperCase() + str.slice(1);
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Separador Horizontal */}
                  <div className="w-full h-[1px] bg-[#d2c2ad]"></div>

                  {/* Hora - Tipo Reloj */}
                  <div className="flex items-center gap-3 text-[#5c4d3c] w-full pl-2">
                    <div className="text-3xl select-none" role="img" aria-label="Reloj">⏰</div>
                    <div className="text-left">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Hora</div>
                      <div className="text-[20px] sm:text-[22px] font-black font-mono tracking-widest text-slate-800 leading-none">
                        {mexicoClockShort || new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "2px dashed #8c7c68",
                    fontSize: "1rem",
                    color: "#4a3f35",
                    letterSpacing: "2px",
                    fontWeight: "bold",
                  }}
                ></div>
              </div>
            )}

            {/* 📱 SECTOR DE REGISTRO DE DISPOSITIVO */}
            {!showPinPanel && loginSubStep === "device_registration" ? (
              <div className="w-full max-w-[600px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md mb-8 space-y-6 text-center mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                     <i className="fa-solid fa-mobile-screen-button text-4xl text-indigo-500"></i>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Vincular Dispositivo</h2>
                  <p className="text-slate-500 text-sm">
                    Este dispositivo no está vinculado a ninguna sucursal. Ingresa tus datos para mandar una solicitud al administrador.
                  </p>

                  {!deviceRequest || deviceRequest.status === "rejected" ? (
                    <form 
                      className="w-full space-y-4 mt-4 text-left"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!devReqName) {
                           alert("Ingresa tu nombre"); return;
                        }
                        await addDeviceRequest({
                           deviceId,
                           deviceName: devReqName,
                           role: devReqRole,
                        });
                      }}
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
                        <input
                          type="text"
                          value={devReqName}
                          onChange={(e) => setDevReqName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                          placeholder="Ej. Juan Pérez"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Puesto / Rol</label>
                        <select
                          value={devReqRole}
                          onChange={(e) => setDevReqRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="mesero">Mesero (Atención general)</option>
                          <option value="cajero">Cajero (Cobro e Inventarios)</option>
                        </select>
                      </div>
                      
                      {deviceRequest?.status === "rejected" && (
                         <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
                           <i className="fa-solid fa-circle-xmark"></i> Solicitud rechazada. Intenta de nuevo.
                         </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] mt-4 shadow-indigo-600/20"
                      >
                        Enviar Solicitud al Administrador <i className="fa-solid fa-paper-plane ml-2"></i>
                      </button>

                    </form>
                  ) : (
                    <div className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-4">
                       <i className="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i>
                       <h3 className="text-lg font-bold text-slate-800">Esperando Autorización...</h3>
                       <p className="text-sm text-slate-500 text-center">
                         Notificamos al administrador. Una vez que apruebe tu dispositivo, entrarás automáticamente al sistema.
                       </p>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl w-full border border-slate-200">
                    <p className="text-[12px] text-slate-500 mb-2 font-bold uppercase tracking-widest">¿Eres Administrador?</p>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        placeholder="PIN..." 
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none text-center w-24 font-mono tracking-widest"
                        onChange={(e) => {
                          if (e.target.value === "2052") {
                            setIsMasterAdmin(true);
                            localStorage.setItem("pos_master_admin", "true");
                            setLoginSubStep("tenant");
                            if (typeof window !== "undefined" && "Notification" in window) {
                               Notification.requestPermission();
                            }
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : showPinPanel ? (
              <div className="w-full max-w-[600px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md mb-8 space-y-6 text-center animate-fade-in mx-auto">
                
                {/* 🛡️ BANNER SUPERIOR CON ESTADO DE RED LOCAL Y WEBSOCKETS (Solo se muestra en el Paso 2 si ya está desbloqueado) */}
                {(isOwnerUnlocked || restrictedOwnerKey) && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4 text-left">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        BIENVENIDO
                      </h3>
                      <p className="text-[11px] text-slate-500 font-bold">
                        📅 {new Date().toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ⏰ {new Date().toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMasterAdmin(false);
                          localStorage.removeItem("pos_master_admin");
                          setIsSystemsMode(false);
                          localStorage.setItem("cocinet_is_systems", "false");
                          setIsOwnerUnlocked(false);
                          localStorage.setItem("cocinet_is_owner_unlocked", "false");
                          setActiveOwnerFilter(null);
                          localStorage.removeItem("cocinet_active_owner_filter");
                          setRestrictedOwnerKey(null);
                          localStorage.removeItem("cocinet_restricted_owner_key");
                          setSelectedLoginUser(null);
                          setLoginSubStep("tenant");
                          setShowPinPanel(false);
                          try {
                            window.history.replaceState({}, document.title, window.location.pathname);
                          } catch (e) {}
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer select-none border-none"
                      >
                        🚪 Volver a Inicio
                      </button>
                    </div>
                  </div>
                )}

                {/* 🤠 PASO 1: SELECCIÓN DEL PROPIETARIO / PATRÓN (BLOQUEO DE VISTA DE CONTEOS) */}
                {!isOwnerUnlocked && !restrictedOwnerKey ? (
                  <div className="space-y-6 py-4 max-w-sm mx-auto transition-all duration-300">
                    <div className="text-left">
                      <button
                        type="button"
                        onClick={() => {
                          setOwnerPasswordInput("");
                          setShowPinPanel(false);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black rounded-xl flex items-center gap-1.5 transition-all select-none border-none cursor-pointer"
                      >
                        ↩️ Volver a Inicio
                      </button>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[14px] uppercase font-extrabold text-indigo-700 tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full inline-block mb-1">
                        Acceso al Sistema 🔒
                      </span>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">
                        Ingrese su PIN de Seguridad 🔑
                      </h4>
                      <p className="text-[14px] text-slate-500 font-semibold leading-relaxed">
                        Introduce tu PIN de 4 dígitos asignado por tu administrador para iniciar sesión en tu sucursal.
                      </p>
                    </div>

                    {/* Display Dots */}
                    <div className="flex justify-center gap-3 my-4">
                      {[0, 1, 2, 3].map((index) => {
                        const hasDigit = ownerPasswordInput.length > index;
                        return (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              hasDigit
                                ? "bg-indigo-600 border-indigo-600 scale-110"
                                : "bg-slate-100 border-slate-300"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (ownerPasswordInput.length < 4) {
                              const newVal = ownerPasswordInput + num;
                              setOwnerPasswordInput(newVal);
                              if (newVal.length === 4) {
                                handleOwnerPinSubmit(newVal);
                              }
                            }
                          }}
                          className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer select-none"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setOwnerPasswordInput("")}
                        className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer select-none"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (ownerPasswordInput.length < 4) {
                            const newVal = ownerPasswordInput + "0";
                            setOwnerPasswordInput(newVal);
                            if (newVal.length === 4) {
                              handleOwnerPinSubmit(newVal);
                            }
                          }
                        }}
                        className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer select-none"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (ownerPasswordInput.length > 0) {
                            setOwnerPasswordInput(ownerPasswordInput.slice(0, -1));
                          }
                        }}
                        className="w-16 h-16 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer select-none"
                      >
                        ⌫
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 🏢 PASO 2: SELECCIÓN DE EMPRESA, MATRIZ O SUCURSAL */
                  <div className="space-y-6 transition-all duration-300">
                    
                    {/* ENCABEZADO DE ENFOQUE PROPIETARIO */}
                    {(() => {
                      const ownerObj = customOwners.find(o => o.key === activeOwnerFilter);
                      if (!ownerObj && activeOwnerFilter) return null;

                      const selectedOwnerName = ownerObj ? `${ownerObj.name} ${ownerObj.avatar}` : "Auditor Maestro 🌟";
                      const selectedOwnerAvatar = ownerObj ? ownerObj.avatar : "🌟";
                      
                      const selectedOwnerBg = 
                        ownerObj?.accentColor === "red" ? "bg-red-50 text-red-900 border-red-200" :
                        ownerObj?.accentColor === "purple" ? "bg-purple-50 text-purple-900 border-purple-200" :
                        ownerObj?.accentColor === "pink" ? "bg-pink-50 text-pink-900 border-pink-200" :
                        ownerObj?.accentColor === "teal" ? "bg-teal-50 text-teal-900 border-teal-200" :
                        ownerObj?.accentColor === "amber" ? "bg-amber-50 text-amber-900 border-amber-200" :
                        ownerObj?.accentColor === "emerald" ? "bg-emerald-50 text-emerald-900 border-emerald-200" :
                        ownerObj?.accentColor === "indigo" ? "bg-indigo-50 text-indigo-900 border-indigo-200" :
                        ownerObj?.accentColor === "cyan" ? "bg-cyan-50 text-cyan-900 border-cyan-200" :
                        "bg-indigo-50 text-indigo-900 border-indigo-200";

                      return (
                        <div className={`p-4 rounded-2xl border ${selectedOwnerBg} text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{selectedOwnerAvatar}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black uppercase tracking-tight">
                                  GRUPO: {ownerObj ? ownerObj.name : "VISTA GLOBAL DE RED"}
                                </h3>
                                {isMasterAdmin && ownerObj && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingOwner(ownerObj);
                                      setFormOwnerName(ownerObj.name);
                                      setFormOwnerAvatar(ownerObj.avatar);
                                      setFormOwnerAccent(ownerObj.accentColor);
                                      setFormOwnerPin(customOwnerPins[ownerObj.key] || "");
                                      setShowOwnerCrudModal(true);
                                    }}
                                    className="p-1 hover:bg-black/5 rounded text-[11px] cursor-pointer transition-all border-none bg-transparent font-bold"
                                    title="Modificar Nombre del Propietario"
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] opacity-75 font-bold">
                                {ownerObj ? `Clave de Red: #${ownerObj.key} • PIN Acceso: ${customOwnerPins[ownerObj.key] || "No asig."}` : "Consola maestra de supervisión de transacciones locales."}
                              </p>
                            </div>
                          </div>
               
                          {!restrictedOwnerKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOwnerUnlocked(false);
                                if (!isMasterAdmin) {
                                  localStorage.setItem("cocinet_is_owner_unlocked", "false");
                                }
                                setActiveOwnerFilter(null);
                                localStorage.removeItem("cocinet_active_owner_filter");
                                triggerAppNotification(
                                  "🔒 Filtro Retirado",
                                  "Regresando a la selección del propietario principal.",
                                  "info"
                                );
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                            >
                              ⬅️ Cambiar Patrón
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <div className="text-center max-w-xl mx-auto space-y-1">
                      <span className="text-[10px] uppercase font-extrabold text-teal-700 tracking-widest bg-teal-50 px-2.5 py-1 rounded-full">
                        Paso 2 de 2: Conexión de Empresa y Sucursal
                      </span>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        Seleccione el Punto de Venta / Sucursal Autorizada
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold">
                        Las cuentas, comandas y arqueos físicos se guardarán exclusivamente bajo esta base de datos local con UUIDs únicos de sincronización en caliente.
                      </p>
                    </div>

                    {isMasterAdmin && (
                      <div className="text-center py-2">
                        <button
                          type="button"
                          onClick={() => {
                            resetTenantForm();
                            setShowTenantCrudModal(true);
                          }}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mx-auto border-none uppercase tracking-wider animate-pulse"
                          style={{ backgroundColor: "#e11d48" }}
                        >
                          🛠️ Registrar / Gestionar Inquilinos (2052)
                        </button>
                      </div>
                    )}

                    {(() => {
                      if (isMasterAdmin && !activeOwnerFilter) {
                        // Render Propietarios list as cards
                        return (
                          <div className="space-y-6 text-left">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                              <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                  👥 Directorio de Propietarios Autorizados
                                </h3>
                                <p className="text-[11px] text-slate-500 font-bold">
                                  Seleccione un propietario para gestionar su red de matrices, puntos de venta y realizar acciones CRUD.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOwner(null);
                                  setFormOwnerName("");
                                  setFormOwnerAvatar("🤠");
                                  setFormOwnerAccent("indigo");
                                  setFormOwnerPin("");
                                  setFormOwnerLogo("");
                                  setShowOwnerCrudModal(true);
                                }}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md border-none transition-all uppercase tracking-wider font-sans"
                                style={{ backgroundColor: "#4f46e5" }}
                              >
                                ➕ Agregar Propietario
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {customOwners.map((owner) => {
                                const ownerBranches = COMPANY_CATALOG.filter(c => c.ownerKey === owner.key);
                                const numMatrices = ownerBranches.filter(c => c.type === 'Matriz').length;
                                const numSucursales = ownerBranches.filter(c => c.type !== 'Matriz').length;
                                const pin = customOwnerPins[owner.key] || "No asig.";

                                const colHex = 
                                  owner.accentColor === "red" ? "#dc2626" :
                                  owner.accentColor === "purple" ? "#7c3aed" :
                                  owner.accentColor === "pink" ? "#db2777" :
                                  owner.accentColor === "teal" ? "#0d9488" :
                                  owner.accentColor === "amber" ? "#d97706" :
                                  owner.accentColor === "emerald" ? "#059669" :
                                  owner.accentColor === "indigo" ? "#4f46e5" :
                                  owner.accentColor === "cyan" ? "#0891b2" :
                                  "#4f46e5";

                                const bgColLight = 
                                  owner.accentColor === "red" ? "from-red-50 to-red-100/40" :
                                  owner.accentColor === "purple" ? "from-purple-50 to-purple-100/40" :
                                  owner.accentColor === "pink" ? "from-pink-50 to-pink-100/40" :
                                  owner.accentColor === "teal" ? "from-teal-50 to-teal-100/40" :
                                  owner.accentColor === "amber" ? "from-amber-50 to-amber-100/40" :
                                  owner.accentColor === "emerald" ? "from-emerald-50 to-emerald-100/40" :
                                  owner.accentColor === "indigo" ? "from-indigo-50 to-indigo-100/40" :
                                  owner.accentColor === "cyan" ? "from-cyan-50 to-cyan-100/40" :
                                  "from-slate-50 to-slate-100";

                                return (
                                  <div
                                    key={owner.key}
                                    onClick={() => {
                                      setActiveOwnerFilter(owner.key);
                                      localStorage.setItem("cocinet_active_owner_filter", owner.key);
                                    }}
                                    className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between border-slate-150 bg-gradient-to-br ${bgColLight}`}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                          <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-sm overflow-hidden bg-white"
                                            style={{ backgroundColor: colHex }}
                                          >
                                            {owner.logo ? (
                                              <img src={owner.logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                              owner.avatar
                                            )}
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
                                              {owner.name}
                                            </h4>
                                            <span className="text-[11px] text-slate-400 font-bold block mt-1 uppercase">
                                              ID Red: #{owner.key}
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingOwner(owner);
                                            setFormOwnerName(owner.name);
                                            setFormOwnerAvatar(owner.avatar);
                                            setFormOwnerAccent(owner.accentColor);
                                            setFormOwnerPin(pin);
                                            setFormOwnerSupervisorPin(customOwnerSupervisorPins[owner.key] || "");
                                            setFormOwnerLogo(owner.logo || "");
                                            setShowOwnerCrudModal(true);
                                          }}
                                          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-250 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs border-none font-bold"
                                          title="Modificar Propietario / PIN Supervisor"
                                        >
                                          ✏️
                                        </button>
                                      </div>

                                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[12.5px] text-slate-500 font-semibold">
                                        <div className="flex items-center justify-between">
                                          <span>🔑 PIN Acceso:</span>
                                          <span className="font-mono bg-white text-slate-850 px-1.5 py-0.5 rounded text-[11.5px] font-black tracking-widest border border-slate-200">
                                            {pin}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>🏠 Casas Matrices:</span>
                                          <span className="text-slate-800 font-bold">{numMatrices}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>📍 Puntos de Venta:</span>
                                          <span className="text-slate-800 font-bold">{numSucursales}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-750 font-black uppercase tracking-wider">
                                      <span>Ver sucursales &rarr;</span>
                                      <span className="bg-white/60 px-2 py-0.5 rounded border border-slate-100">ENTRAR 📂</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Otherwise, filter and display matrices and sucursales
                      const filteredCompanies = COMPANY_CATALOG.filter((company) => {
                        const conf = companiesConfig[company.id];
                        const isVisible = conf ? conf.visible : true;
                        if (!isVisible) return false;

                        if (activeOwnerFilter && company.ownerKey !== activeOwnerFilter) {
                          return false;
                        }
                        return true;
                      });

                      const matrices = filteredCompanies.filter(c => c.type === "Matriz");
                      const sucursales = filteredCompanies.filter(c => c.type !== "Matriz");

                      return (
                        <div className="space-y-6 text-left">
                          
                          {/* Botón para registrar sucursal dentro de la vista del propietario */}
                          {isMasterAdmin && activeOwnerFilter && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  resetTenantForm();
                                  const ownerObj = customOwners.find(o => o.key === activeOwnerFilter);
                                  if (ownerObj) {
                                    setFormTenantOwnerKey(ownerObj.key);
                                    setFormTenantPropietario(ownerObj.name);
                                    setFormTenantEmail("contacto@cocinet.mx");
                                    setFormTenantAvatar(ownerObj.avatar || "🏢");
                                    setFormTenantAccentColor("#10b981");
                                  }
                                  setFormTenantType("Sucursal");
                                  setShowTenantCrudModal(true);
                                }}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md border-none transition-all uppercase tracking-wider"
                                style={{ backgroundColor: "#0d9488" }}
                              >
                                ➕ Agregar Sucursal a este Patrón
                              </button>
                            </div>
                          )}

                          {/* SECCIÓN 1: CASAS MATRICES (SEDE PRINCIPAL) */}
                          {matrices.length > 0 && (
                            <div className="space-y-3">
                              <span className="text-[12.5px] uppercase font-black tracking-wider text-slate-400 pl-1 flex items-center gap-1">
                                🏠 Casa Matriz / Base de Operaciones Principal
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {matrices.map((company) => {
                                  const isSelected = selectedTenant.id === company.id;
                                  return (
                                    <div
                                      key={company.id}
                                      onClick={() => handleSelectCompanyWithPinCheck(company, "login")}
                                      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                                        isSelected
                                          ? "border-indigo-600 bg-indigo-50/40 shadow-inner"
                                          : "border-slate-150 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-[11px] font-black shadow z-10">
                                          ✓
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2.5">
                                            {(() => {
                                              const ownerObj = customOwners.find(o => o.key === company.ownerKey);
                                              const logoToUse = company.logoUrl || ownerObj?.logo;
                                              return (
                                                <div className="relative group shrink-0" onClick={(e) => e.stopPropagation()}>
                                                  <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md overflow-hidden bg-white shrink-0 border border-slate-100"
                                                    style={{ backgroundColor: company.accentColor }}
                                                  >
                                                    {logoToUse ? (
                                                      <img src={logoToUse} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                      <span className="text-lg">{company.avatar}</span>
                                                    )}
                                                  </div>
                                                  {isMasterAdmin && (
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer text-[10px] text-white font-black">
                                                      📷
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                          const file = e.target.files?.[0];
                                                          if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                              const base64 = reader.result as string;
                                                              const idx = COMPANY_CATALOG.findIndex(c => c.id === company.id);
                                                              if (idx !== -1) {
                                                                COMPANY_CATALOG[idx] = { ...COMPANY_CATALOG[idx], logoUrl: base64 };
                                                                localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
                                                                setTenantsVersion(prev => prev + 1);
                                                                
                                                                try {
                                                                  await saveCompanyConfigInFirebase(company.id, {
                                                                    businessName: company.name,
                                                                    rfc: company.rfc,
                                                                    sucursal: company.sucursalDefault,
                                                                    footerMessage: `¡Gracias por su visita! Vuelva pronto 🌮 (${company.ownerEmail})`,
                                                                    logoUrl: base64,
                                                                  });
                                                                  triggerAppNotification("🖼️ Logotipo Sincronizado", `Se actualizó el logo de "${company.name}" en Firebase.`, "success");
                                                                } catch (err) {
                                                                  console.error("Firebase error:", err);
                                                                  triggerAppNotification("⚠️ Error Firebase", "No se pudo sincronizar, pero se guardó localmente.", "warning");
                                                                }
                                                              }
                                                            };
                                                            reader.readAsDataURL(file);
                                                          }
                                                        }}
                                                      />
                                                    </label>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                            <div>
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <h4 className="text-sm font-black text-slate-800 tracking-tight leading-snug uppercase">
                                                  {company.name}
                                                </h4>
                                                <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                  MATRIZ 🏡
                                                </span>
                                              </div>
                                              <span className="block text-[11.5px] text-slate-400 font-mono font-bold">
                                                {company.rfc}
                                              </span>
                                            </div>
                                          </div>

                                          {isMasterAdmin && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditTenantClick(company);
                                              }}
                                              className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center text-xs border border-amber-250 cursor-pointer transition-all font-bold"
                                              title="Modificar Inquilino"
                                            >
                                              ✏️
                                            </button>
                                          )}
                                        </div>

                                        <div className="space-y-1 pt-1 text-[12px] border-t border-slate-50 mt-1">
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                            <span>📧</span> <span className="font-bold">Contacto:</span> {company.ownerEmail}
                                          </div>
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                            <span>📍</span> <span className="font-bold">Sucursal:</span> {company.sucursalDefault}
                                          </div>
                                          {company.direccion && (
                                            <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                              <span>🗺️</span> <span className="font-bold">Dirección:</span> {company.direccion}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Canal de Sincronización</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                                          {isSelected ? "CONECTADO EN TIEMPO REAL" : "DISPONIBLE"}
                                        </span>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Control de Accesos</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setModalTenant(company);
                                            setModalUsers(getTenantUsers(company.id));
                                            setShowTenantUsersModal(true);
                                          }}
                                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm border-none"
                                        >
                                          👥 Compartir Acceso / PINs
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* SECCIÓN 2: SUCURSALES AUTORIZADAS */}
                          {sucursales.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <span className="text-[12.5px] uppercase font-black tracking-wider text-slate-400 pl-1 flex items-center gap-1">
                                📍 Puntos de Venta y Sucursales de la Red
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sucursales.map((company) => {
                                  const isSelected = selectedTenant.id === company.id;
                                  return (
                                    <div
                                      key={company.id}
                                      onClick={() => handleSelectCompanyWithPinCheck(company, "login")}
                                      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                                        isSelected
                                          ? "border-indigo-600 bg-indigo-50/40 shadow-inner"
                                          : "border-slate-150 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-[11px] font-black shadow z-10">
                                          ✓
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2.5">
                                            {(() => {
                                              const ownerObj = customOwners.find(o => o.key === company.ownerKey);
                                              const logoToUse = company.logoUrl || ownerObj?.logo;
                                              return (
                                                <div className="relative group shrink-0" onClick={(e) => e.stopPropagation()}>
                                                  <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md overflow-hidden bg-white shrink-0 border border-slate-100"
                                                    style={{ backgroundColor: company.accentColor }}
                                                  >
                                                    {logoToUse ? (
                                                      <img src={logoToUse} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                      <span className="text-lg">{company.avatar}</span>
                                                    )}
                                                  </div>
                                                  {isMasterAdmin && (
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer text-[10px] text-white font-black">
                                                      📷
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                          const file = e.target.files?.[0];
                                                          if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                              const base64 = reader.result as string;
                                                              const idx = COMPANY_CATALOG.findIndex(c => c.id === company.id);
                                                              if (idx !== -1) {
                                                                COMPANY_CATALOG[idx] = { ...COMPANY_CATALOG[idx], logoUrl: base64 };
                                                                localStorage.setItem("cocinet_custom_tenants_v3", JSON.stringify(COMPANY_CATALOG));
                                                                setTenantsVersion(prev => prev + 1);
                                                                
                                                                try {
                                                                  await saveCompanyConfigInFirebase(company.id, {
                                                                    businessName: company.name,
                                                                    rfc: company.rfc,
                                                                    sucursal: company.sucursalDefault,
                                                                    footerMessage: `¡Gracias por su visita! Vuelva pronto 🌮 (${company.ownerEmail})`,
                                                                    logoUrl: base64,
                                                                  });
                                                                  triggerAppNotification("🖼️ Logotipo Sincronizado", `Se actualizó el logo de "${company.name}" en Firebase.`, "success");
                                                                } catch (err) {
                                                                  console.error("Firebase error:", err);
                                                                  triggerAppNotification("⚠️ Error Firebase", "No se pudo sincronizar, pero se guardó localmente.", "warning");
                                                                }
                                                              }
                                                            };
                                                            reader.readAsDataURL(file);
                                                          }
                                                        }}
                                                      />
                                                    </label>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                            <div>
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <h4 className="text-sm font-black text-slate-800 tracking-tight leading-snug uppercase">
                                                  {company.name}
                                                </h4>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                  SUCURSAL 📍
                                                </span>
                                              </div>
                                              <span className="block text-[11.5px] text-slate-400 font-mono font-bold">
                                                {company.rfc}
                                              </span>
                                            </div>
                                          </div>

                                          {isMasterAdmin && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditTenantClick(company);
                                              }}
                                              className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center text-xs border border-amber-250 cursor-pointer transition-all font-bold"
                                              title="Modificar Inquilino"
                                            >
                                              ✏️
                                            </button>
                                          )}
                                        </div>

                                        <div className="space-y-1 pt-1 text-[12px] border-t border-slate-50 mt-1">
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                            <span>📧</span> <span className="font-bold">Contacto:</span> {company.ownerEmail}
                                          </div>
                                          <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                            <span>📍</span> <span className="font-bold">Sucursal:</span> {company.sucursalDefault}
                                          </div>
                                          {company.direccion && (
                                            <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                                              <span>🗺️</span> <span className="font-bold">Dirección:</span> {company.direccion}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Canal de Sincronización</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                                          {isSelected ? "CONECTADO EN TIEMPO REAL" : "DISPONIBLE"}
                                        </span>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between">
                                        <span className="text-[11px] uppercase font-black text-slate-400">Control de Accesos</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setModalTenant(company);
                                            setModalUsers(getTenantUsers(company.id));
                                            setShowTenantUsersModal(true);
                                          }}
                                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm border-none"
                                        >
                                          👥 Compartir Acceso / PINs
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {filteredCompanies.length === 0 && (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                              <span className="text-3xl block mb-2">🚫</span>
                              <h4 className="text-sm font-black text-slate-700 mb-1">No hay sucursales configuradas</h4>
                              <p className="text-[11px] max-w-md mx-auto leading-relaxed">
                                No se encontraron sucursales asociadas o autorizadas para este propietario actualmente. Abre el Gestor de Empresas para registrarlas.
                              </p>
                            </div>
                          )}

                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 🔔 CONTROL DE CONFIGURACIÓN DE NOTIFICACIONES PWA EN CALIENTE */}
                <div className="pt-4 border-t border-dashed border-slate-200">
                  <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between border border-slate-100 gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl animate-bounce">🔔</span>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Centro de Notificaciones en Vivo ⚡</h5>
                        <p className="text-[10px] text-slate-500 font-bold">Activa las alertas del navegador para cambios de caja, gastos y comandas en caliente vía WebSockets.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="toggle-pwa-notifications"
                      onClick={() => {
                        if (typeof Notification !== "undefined") {
                          Notification.requestPermission().then((permission) => {
                            if (permission === "granted") {
                              setNotificationsGranted(true);
                              new Notification("🔔 Canal Sincronizado", {
                                body: "Las notificaciones en tiempo real para transacciones MySQL y WebSockets han sido activadas con éxito.",
                                icon: "/public/icon.png"
                              });
                              triggerAppNotification(
                                "🔔 Notificaciones Conectadas",
                                "¡Perfecto! Has activado con éxito las notificaciones en tiempo real sobre transacciones de caja. 🚀",
                                "success"
                              );
                            } else {
                              setNotificationsGranted(false);
                              triggerAppNotification(
                                "⚠️ Notificaciones Bloqueadas",
                                "Por favor autoriza las notificaciones directamente en tu navegador.",
                                "warning"
                              );
                            }
                          });
                        }
                      }}
                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border-none ${
                        notificationsGranted 
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {notificationsGranted ? "🟢 Notificaciones Activas" : "🔔 Activar Notificaciones"}
                    </button>
                  </div>
                </div>

              </div>

            ) : null}

          </div>
        </IonContent>
      </IonPage>
    );
  };

  const validateAdminPin = (enteredPin: string): User | null => {
    // 1. Search for matching admin in the current branch users
    let admin = users.find((u) => u.pin === enteredPin && u.role === "admin");
    if (admin) return admin;

    // 2. Search through ALL users of ALL sucursales
    for (const company of COMPANY_CATALOG) {
      const companyUsers = getTenantUsers(company.id);
      const u = companyUsers.find((x) => x.pin === enteredPin && x.role === "admin");
      if (u) return u;
    }

    // 3. Systems master or standard admin PIN fallback if any
    if (enteredPin === "4020" || enteredPin === "2052" || enteredPin === "2026") {
      const firstAdmin = users.find((u) => u.role === "admin") || {
        id: "admin-master",
        name: enteredPin === "4020" ? "Sistemas Bypass ⚙️" : "Admin Maestro 👑",
        role: "admin" as UserRole,
        pin: enteredPin,
        avatar: "fa-solid fa-laptop-code",
        tenantId: selectedTenant?.id || "",
      };
      return firstAdmin;
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

  const renderCancellationPinPad = (
    currentPin: string,
    setPin: (pin: string) => void,
    onComplete: (pin: string) => void
  ) => {
    const handlePress = (key: string) => {
      if (key === "CLEAR") {
        setPin("");
      } else if (key === "BACKSPACE") {
        setPin(currentPin.slice(0, -1));
      } else {
        if (currentPin.length < 4) {
          const nextPin = currentPin + key;
          setPin(nextPin);
          if (nextPin.length === 4) {
            onComplete(nextPin);
          }
        }
      }
    };

    return (
      <div className="space-y-4 select-none">
        {/* Code dots */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = currentPin.length > index;
            return (
              <div
                key={index}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  hasDigit
                    ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-500/30 scale-105"
                    : "bg-slate-200 border border-slate-300 text-slate-400"
                }`}
              >
                {hasDigit ? "●" : ""}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 space-y-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePress(num)}
                className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-black h-11 rounded-xl text-md shadow-sm border border-slate-200 cursor-pointer transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePress("CLEAR")}
              className="bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 font-bold h-11 rounded-xl text-xs border border-red-200 cursor-pointer transition-all"
            >
              Limpiar
            </button>
            <button
              key="0"
              type="button"
              onClick={() => handlePress("0")}
              className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-black h-11 rounded-xl text-md shadow-sm border border-slate-200 cursor-pointer transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handlePress("BACKSPACE")}
              className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-600 font-bold h-11 rounded-xl text-xs border border-slate-200 cursor-pointer transition-all flex items-center justify-center"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    );
  };
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
    return effectiveTables.find((t) => t.id === selectedTableId);
  }, [effectiveTables, selectedTableId]);

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

  const getComandaDestinations = (comanda: Comanda): Destination[] => {
    const dests = new Set<Destination>();
    comanda.items.forEach((item) => {
      if (!item.isCancelled) {
        dests.add(item.product.destination as Destination);
      }
    });
    return Array.from(dests);
  };

  const printComanda = (
    tableLabel: string,
    comanda: Comanda,
    target?: Destination,
  ) => {
    setPrintLoading(comanda.folio);

    const filteredItems = target
      ? comanda.items.filter(
          (item) => !item.isCancelled && item.product.destination === target,
        )
      : comanda.items.filter((item) => !item.isCancelled);

    if (filteredItems.length === 0) {
      setPrintLoading(null);
      return;
    }

    setTimeout(async () => {
      try {
        // Parallel sync with Firestore Printer Queue (Centinela) 🖨️
        if (selectedTenant) {
          const dClient = selectedDeliveryClient?.name || (selectedTable as any)?.deliveryClientName || null;
          const dPhone = selectedDeliveryClient?.phone || (selectedTable as any)?.deliveryClientPhone || null;
          const dAddr = selectedDeliveryAddress || (selectedTable as any)?.deliveryAddress || null;
          const dNotes = deliveryNotes || (selectedTable as any)?.deliveryNotes || null;

          addPedidoToPrinter(selectedTenant.id, {
            folio: comanda.folio,
            mesa: tableLabel,
            items: filteredItems.map((i) => ({
              nombre: getFormattedProductName(i.product),
              cantidad: i.quantity,
              notas: i.notes || "",
              comensal: i.plate,
            })),
            tipo: "comanda",
            area: target || "general",
            timestamp: getMexicoISOString(),
            mesero: comanda.createdBy?.name || "S/M",
            deliveryClientName: dClient,
            deliveryClientPhone: dPhone,
            deliveryAddress: dAddr,
            deliveryNotes: dNotes,
          }).catch((err) => console.warn("Centinela Sync Error:", err));
        }

        if (systemLocalWindowsAutoPrint) {
          setPrintLoading(null);
          return;
        }

        const printerArea: PrinterArea = target === "bar" ? "barra" : "cocina";
        const transport = await createTransport(printerArea, selectedTenant?.id);
        const driver = new EscPosDriver();
        const job = new PosPrinterJob(driver, transport as any);

        job.initialize();

        job.center();
        job.setPrintMode(job.FONT_SIZE_BIG + job.FONT_EMPHASIZED).bold(true);
        job.printLine(comanda.folioInterno ? `COMANDA INTERNA #${comanda.folioInterno}` : `COMANDA #${comanda.folio}`);
        if (comanda.createdBy) {
          job.setPrintMode(job.FONT_SIZE_NORMAL).bold(true);
          job.printLine(`MESERO: ${comanda.createdBy.name.toUpperCase()}`);
        }
        job.setPrintMode(job.FONT_SIZE_NORMAL).bold(false);

        const destName =
          target === "kitchen"
            ? "COCINA"
            : target === "bar"
              ? "BARRA"
              : "GENERAL";
        job.bold(true).printLine(`DESTINO: ${destName}`).bold(false);
        job.printLine(`MESA: ${tableLabel}`);
        job.printLine(
          `HORA: ${new Date(comanda.timestamp).toLocaleTimeString()}`,
        );

        const isDelivery = selectedTable?.zone === "Servicio a Domicilio" || (selectedTable as any)?.deliveryClientName || selectedDeliveryClient?.name;
        if (isDelivery) {
          const dClient = selectedDeliveryClient?.name || (selectedTable as any)?.deliveryClientName || "";
          const dPhone = selectedDeliveryClient?.phone || (selectedTable as any)?.deliveryClientPhone || "";
          const dAddr = selectedDeliveryAddress || (selectedTable as any)?.deliveryAddress || "";
          const dNotes = deliveryNotes || (selectedTable as any)?.deliveryNotes || "";
          
          job.bold(true).printLine("-- DATOS DE ENVIO --").bold(false);
          if (dClient) job.printLine(`CLIENTE: ${dClient.toUpperCase()}`);
          if (dPhone) job.printLine(`TEL: ${dPhone}`);
          
          if (dAddr) {
            let cleanAddr = dAddr;
            let refText = "";
            if (dAddr.includes("(Ref:")) {
              const parts = dAddr.split("(Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].replace(")", "").trim();
            } else if (dAddr.includes("| Ref:")) {
              const parts = dAddr.split("| Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].trim();
            }
            job.printLine(`DIR: ${cleanAddr.toUpperCase()}`);
            if (refText) job.printLine(`REF: ${refText.toUpperCase()}`);
          }
          if (dNotes) job.printLine(`NOTAS: ${dNotes.toUpperCase()}`);
        }

        job.printLine("--------------------------------");

        job.left();

        if (target === "kitchen") {
          // COCINA: Group by comensal (plate)
          const plates = Array.from(
            new Set(filteredItems.map((i) => i.plate)),
          ).sort((a, b) => a - b);
          plates.forEach((plateNum) => {
            job
              .center()
              .bold(true)
              .printLine(`*** COMENSAL ${plateNum} ***`)
              .bold(false)
              .left();
            filteredItems
              .filter((i) => i.plate === plateNum)
              .forEach((item) => {
                job.printLine(
                  `${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()}`,
                );
                if (item.notes) {
                  job.printLine(`   > ${item.notes}`);
                }
              });
            job.printLine("--------------------------------");
          });
        } else if (target === "bar") {
          // BARRA: Group by product (sum quantities), comensal doesn't matter
          const grouped: {
            [key: string]: { name: string; quantity: number; notes: string[] };
          } = {};
          filteredItems.forEach((item) => {
            const key = item.product.id + (item.notes || "");
            if (!grouped[key]) {
              grouped[key] = {
                name: getFormattedProductName(item.product),
                quantity: 0,
                notes: [],
              };
            }
            grouped[key].quantity += item.quantity;
            if (item.notes) grouped[key].notes.push(item.notes);
          });

          Object.values(grouped).forEach((item) => {
            job.printLine(`${item.quantity}x ${item.name.toUpperCase()}`);
            const uniqueNotes = Array.from(new Set(item.notes));
            uniqueNotes.forEach((n) => {
              job.printLine(`   > ${n}`);
            });
          });
        } else {
          // Fallback/General
          filteredItems.forEach((item) => {
            job.printLine(
              `${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()}`,
            );
            if (item.notes) {
              job.printLine(`   > ${item.notes}`);
            }
          });
        }

        if (comanda.generalNotes) {
          job
            .feed(1)
            .bold(true)
            .printLine(`OBS: ${comanda.generalNotes}`)
            .bold(false);
        }

        job.feed(3).cut();
        job.execute();
      } catch (e) {
        console.error("Error printing to RawBT:", e);
        // Fallback: Simple print window
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(
            `<html><body style="font-family:monospace; white-space:pre;">Error printing. Check console.</body></html>`,
          );
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
      setPrintLoading(null);
    }, 500);
  };

  const getLastInternalFolio = (
    tenantId: string,
    tablesList: TableData[],
    historyList: ClosedAccount[]
  ): string => {
    const cached = localStorage.getItem("cocinet_last_internal_folio_" + tenantId);
    let lastFound: string = cached || "";
    let highestNum = -1;

    if (cached && !isNaN(Number(cached))) {
      highestNum = Number(cached);
    }

    const allComandas: Comanda[] = [];

    (tablesList || []).forEach((t: any) => {
      const tTenant = t.tenantId || tenantId;
      if (tTenant === tenantId && Array.isArray(t.comandas)) {
        allComandas.push(...t.comandas);
      }
    });

    (historyList || []).forEach((h: any) => {
      const hTenant = h.tenantId || tenantId;
      if (hTenant === tenantId && Array.isArray(h.comandas)) {
        allComandas.push(...h.comandas);
      }
    });

    allComandas.forEach((c: any) => {
      if (c.folioInterno) {
        const valStr = String(c.folioInterno).trim();
        const num = Number(valStr);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
          lastFound = valStr;
        } else if (highestNum === -1 && !lastFound) {
          lastFound = valStr;
        }
      }
    });

    return lastFound;
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
    setIsGeneratingOrder(true);
    setMenuToastMessage("Procesando comanda...");
    setShowMenuToast(true);

    const tableLabel = selectedTable.label;
    const comandaItems = [...cart];
    const notes = generalNotes;

    try {
      if (!selectedTableId) throw new Error("Mesa no seleccionada");

      const folio = await addComandaToFirebase(
        selectedTableId,
        comandaItems,
        notes,
        currentUser,
        selectedTable,
        folioInterno,
      );

      const dClient = selectedDeliveryClient?.name || (selectedTable as any)?.deliveryClientName || "";
      const dPhone = selectedDeliveryClient?.phone || (selectedTable as any)?.deliveryClientPhone || "";
      const dAddr = selectedDeliveryAddress || (selectedTable as any)?.deliveryAddress || "";
      const dNotes = deliveryNotes || (selectedTable as any)?.deliveryNotes || "";
      
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
        `Mesa ${tableLabel} | Folio Interno: #${folioInterno} | ${comandaItems.length} productos.${deliverySubStr}`,
        "success",
        {
          isComandaNotification: true,
          comandaFolio: folio,
          folioInterno: folioInterno,
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
            destination: i.product.destination || "general",
          })),
          createdBy: currentUser?.name || "S/M",
          timestamp: getMexicoISOString(),
          pedidoData: {
            tipo: "comanda",
            folio: folio,
            folioInterno: folioInterno,
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
                destination: i.product.destination || "general",
            })),
            mesero: currentUser?.name || "S/M",
            timestamp: getMexicoISOString(),
          }
        }
      );

      const newComanda: Comanda = {
        folio: folio,
        folioInterno: folioInterno,
        timestamp: new Date(),
        items: comandaItems,
        generalNotes: notes,
        createdBy: currentUser || undefined,
      };

      // Update local React state & cache OPTIMISTICALLY immediately! ⚡ (0ms UI latency)
      const currentSelectedId = selectedTableId;
      setTables((prevTables) => {
        const updated = prevTables.map((t) => {
          if (t.id === currentSelectedId) {
            const existing = t.comandas || [];
            return {
              ...t,
              status: "occupied",
              comandas: deduplicateComandas([...existing, newComanda]),
              folioInterno: folioInterno || t.folioInterno,
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

      // Trigger automatic printing for both destinations
      const destinations = getComandaDestinations(newComanda);

      if (destinations.includes("kitchen")) {
        printComanda(tableLabel, newComanda, "kitchen");
      }

      if (destinations.includes("kitchen") && destinations.includes("bar")) {
        setTimeout(() => {
          printComanda(tableLabel, newComanda, "bar");
        }, 1500);
      } else if (destinations.includes("bar")) {
        printComanda(tableLabel, newComanda, "bar");
      }

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
        setShowComensalPreview(false);
        setCart([]);
        setGeneralNotes("");
      } else {
        if (appMode === "gestion_cuentas") {
          setSelectedTableGestion(null);
        } else {
          setAppMode("floorplan");
          setSelectedTableId(null);
        }
        setCart([]);
        setGeneralNotes("");
      }
    } catch (error: any) {
      console.error("Error generating order:", error);
      setMenuToastMessage(
        `Error: ${error.message || "No se pudo generar la comanda"}`,
      );
    } finally {
      setIsGeneratingOrder(false);
    }
  };

  const finalizePayment = async (isPaidNow: boolean = true) => {
    if (isProcessingPayment) return;

    if (requiresInvoice && (!invoicePhone || invoicePhone.trim().length !== 10)) {
      alert("⚠️ Error de Validación: Para solicitar factura es obligatorio ingresar el teléfono celular de 10 dígitos del cliente.");
      return;
    }

    if (paymentMethod === "card" && !paymentCardType) {
      alert("⚠️ Error de Validación: Para pagos con Tarjeta, es obligatorio seleccionar si es Crédito o Débito.");
      const el = document.getElementById("card-type-selection-container");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if ((paymentMethod === "card" || paymentMethod === "transfer") && (!paymentCardLastFour || paymentCardLastFour.length < 4)) {
      alert("⚠️ Error de Validación: Para pagos con Tarjeta o Transferencia, es obligatorio ingresar los últimos 4 dígitos de verificación.");
      return;
    }

    if (selectedTableId) {
      const freshTable = tables.find(t => t.id === selectedTableId);
      if (!freshTable || freshTable.status === "available" || !freshTable.comandas || freshTable.comandas.length === 0) {
        alert("⚠️ Esta mesa ya ha sido cancelada o liberada por un administrador. No se puede cobrar.");
        const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
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

          // Auto-print ticket upon closing the account
          await printTicket(tableSnapshot, "resumen", paymentMethod, paymentCardType);
        }
      } catch (error: any) {
        console.error("Error during checkout:", error);
        triggerAppNotification(
          "❌ Error al Cobrar Mesa",
          error.message || "No se pudo registrar la venta.",
        );
      } finally {
        setIsProcessingPayment(false);
      }
    }

    const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
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
    if (isProcessingPayment) return;
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
        setIsProcessingPayment(false);
      }
    }

    const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
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
      const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
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
       const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
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
    if (paymentMethod === "card" && !paymentCardType) {
      alert("⚠️ Error de Validación: Para pagos con Tarjeta, es obligatorio seleccionar si es Crédito o Débito.");
      return;
    }

    if ((paymentMethod === "card" || paymentMethod === "transfer") && (!paymentCardLastFour || paymentCardLastFour.length < 4)) {
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

    if ((tempPaymentMethod === "card" || tempPaymentMethod === "transfer") && (!tempCardLastFour || tempCardLastFour.length < 4)) {
      triggerAppNotification("⚠️ Error", "Para pagos con Tarjeta o Transferencia, es obligatorio ingresar los últimos 4 dígitos.", "warning");
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

      const cancelled = account.comandas
        .flatMap((c) => c.items)
        .filter((i) => i.isCancelled);
      if (cancelled.length > 0) {
        job.printLine("--------------------------------");
        job.bold(true).printLine("CANCELACIONES").bold(false);
        const summarizedCancelled = cancelled.reduce((acc: any[], item) => {
          const existing = acc.find(
            (i) =>
              i.product.id === item.product.id &&
              i.cancellationReason === item.cancellationReason,
          );
          if (existing) existing.quantity += item.quantity;
          else acc.push({ ...item });
          return acc;
        }, []);
        summarizedCancelled.forEach((item) => {
          job.printLine(
            `${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()} (CANC)`,
          );
          job.printLine(`  MOTIVO: ${item.cancellationReason}`);
          if (item.cancelledBy)
            job.printLine(`  POR: ${item.cancelledBy.name}`);
        });
      }

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

      const payLabel = getPaymentLabel(account);
      if (payLabel) {
        job.center().bold(true).printLine(payLabel).bold(false).left();
      }

      if (account.requiresInvoice) {
        job.printLine("--------------------------------");
        job.left();
        job.bold(true).printLine("🧾 REQUIERE FACTURA").bold(false);
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

    const activePayMethod = explicitPaymentMethod || paymentMethod || (table as any).paymentMethod || (table as any).metodoPago || "";
    const activeCardType = explicitCardType || paymentCardType || (table as any).cardType || (table as any).tipoTarjeta || "";

    const allItems = table.comandas.flatMap((c) => c.items);
    const currentSubtotal = allItems
      .filter((i) => !i.isCancelled)
      .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    
    // Si no hay valores en los inputs globales (0), intentamos usar los de la mesa si existieran
    const currentDiscountAmount = Math.round(
      paymentDiscountType === "percent"
        ? currentSubtotal * (paymentDiscountValue / 100)
        : paymentDiscountValue
    );
    const currentTotal = currentSubtotal + paymentTipValue - currentDiscountAmount;

    try {
      const bName = (companyConfig.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase();
      const rfcVal = (companyConfig.rfc || selectedTenant?.rfc || "").toUpperCase();
      const regVal = (companyConfig.regimenFiscal || selectedTenant?.regimenFiscal || "").toUpperCase();
      const lugVal = (companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion || "").toUpperCase();
      const dirVal = (companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").toUpperCase();
      const telVal = companyConfig.telefono || selectedTenant?.telefono || "";
      const emlVal = companyConfig.email || selectedTenant?.email || "";
      const sucVal = (companyConfig.sucursal || selectedTenant?.sucursalDefault || "").toUpperCase();

      // Parallel sync with Firestore Printer Queue (Centinela) for Tickets 🖨️
      if (selectedTenant) {
        const preFolio = "PRE-" + table.label + "-" + Date.now().toString().slice(-4);
        const dClient = selectedDeliveryClient?.name || (table as any).deliveryClientName || null;
        const dPhone = selectedDeliveryClient?.phone || (table as any).deliveryClientPhone || null;
        const dAddr = selectedDeliveryAddress || (table as any).deliveryAddress || null;
        const dNotes = deliveryNotes || (table as any).deliveryNotes || null;

        addPedidoToPrinter(selectedTenant.id, {
          folio: preFolio,
          mesa: table.label,
          items: allItems
            .filter((i) => !i.isCancelled)
            .map((i) => ({
              nombre: getFormattedProductName(i.product),
              cantidad: i.quantity,
              precio: i.product.price,
              subtotal: i.quantity * i.product.price,
            })),
          subtotal: currentSubtotal,
          propina: paymentTipValue,
          descuento: currentDiscountAmount,
          total: currentTotal,
          paymentMethod: activePayMethod,
          metodoPago: activePayMethod,
          cardType: activeCardType,
          tipo: "cuenta",
          area: "caja",
          requiresInvoice: requiresInvoice,
          invoicePhone: requiresInvoice ? invoicePhone : "",
          timestamp: getMexicoISOString(),
          atendidoPor: currentUser?.name || "S/M",
          deliveryClientName: dClient,
          deliveryClientPhone: dPhone,
          deliveryAddress: dAddr,
          deliveryNotes: dNotes,
          businessName: bName,
          rfc: rfcVal,
          regimenFiscal: regVal,
          lugarExpedicion: lugVal,
          direccionFiscal: dirVal,
          telefono: telVal,
          email: emlVal,
          sucursal: sucVal,
        }).catch((err) => console.warn("Centinela Ticket Error:", err));

        let deliverySubStr = "";
        if (dClient) deliverySubStr += ` | Cliente: ${dClient}`;
        if (dPhone) deliverySubStr += ` | Tel: ${dPhone}`;
        if (dAddr) {
          if (typeof dAddr === "string") {
            deliverySubStr += ` | Dir: ${dAddr}`;
          } else {
            const cleanA = dAddr.street || dAddr.address || dAddr.formatted || "";
            let refT = dAddr.notes || dAddr.reference || "";
            if (!refT && cleanA.includes("(Ref:")) {
              const parts = cleanA.split("(Ref:");
              refT = parts[1].replace(")", "").trim();
            } else if (!refT && cleanA.includes(",")) {
              const parts = cleanA.split(",");
              refT = parts[1].trim();
            }
            deliverySubStr += ` | Dir: ${cleanA}`;
            if (refT) deliverySubStr += ` | Ref: ${refT}`;
          }
        }

        triggerAppNotification(
          "💰 PRECUENTA SOLICITADA",
          `Mesa: ${table.label} | Total: $${currentTotal.toFixed(2)}${deliverySubStr} | Atendido por: ${currentUser?.name || "S/M"}`,
          "success",
          {
            isCuentaNotification: true,
            tableLabel: table.label,
            folio: preFolio,
            subtotal: currentSubtotal,
            propina: paymentTipValue,
            descuento: currentDiscountAmount,
            total: currentTotal,
            deliveryClientName: dClient,
            deliveryClientPhone: dPhone,
            deliveryAddress: dAddr,
            deliveryNotes: dNotes,
            items: allItems
              .filter((i) => !i.isCancelled)
              .map((i) => ({
                nombre: getFormattedProductName(i.product),
                cantidad: i.quantity,
                precio: i.product.price,
                subtotal: i.quantity * i.product.price,
              })),
            atendidoPor: Array.from(new Set(table.comandas.map(c => c.createdBy?.name).filter(Boolean))).join(", ") || currentUser?.name || "S/M",
            pedidoData: {
                tipo: "cuenta",
                folio: preFolio,
                mesa: table.label,
                subtotal: currentSubtotal,
                propina: paymentTipValue,
                descuento: currentDiscountAmount,
                total: currentTotal,
                paymentMethod: activePayMethod,
                metodoPago: activePayMethod,
                cardType: activeCardType,
                deliveryClientName: dClient,
                deliveryClientPhone: dPhone,
                deliveryAddress: dAddr,
                deliveryNotes: dNotes,
                items: allItems
                  .filter((i) => !i.isCancelled)
                  .map((i) => ({
                    nombre: getFormattedProductName(i.product),
                    cantidad: i.quantity,
                    precio: i.product.price,
                    subtotal: i.quantity * i.product.price,
                  })),
                atendidoPor: Array.from(new Set(table.comandas.map(c => c.createdBy?.name).filter(Boolean))).join(", ") || currentUser?.name || "S/M",
                timestamp: getMexicoISOString(),
                businessName: companyConfig.businessName,
                rfc: companyConfig.rfc,
                regimenFiscal: companyConfig.regimenFiscal,
                lugarExpedicion: companyConfig.lugarExpedicion,
                direccionFiscal: companyConfig.direccionFiscal,
                telefono: companyConfig.telefono,
                email: companyConfig.email,
                sucursal: companyConfig.sucursal,
            }
          }
        );

        processedPrintIdsRef.current.add(preFolio);
      }

      const transport = await createTransport("cuentas", selectedTenant?.id);
      const driver = new EscPosDriver();
      const job = new PosPrinterJob(driver, transport as any);

      job.initialize();
      job.center();
      job
        .setPrintMode(job.FONT_SIZE_BIG + job.FONT_EMPHASIZED)
        .bold(true)
        .printLine(bName)
        .setPrintMode(job.FONT_SIZE_NORMAL)
        .bold(false);
      job.printLine("--------------------------------");
      if (companyConfig.rfc)
        job.printLine(`RFC: ${companyConfig.rfc.toUpperCase()}`);
      if (companyConfig.regimenFiscal)
        job.printLine(`REGIMEN FISCAL: ${companyConfig.regimenFiscal.toUpperCase()}`);
      if (companyConfig.lugarExpedicion)
        job.printLine(`LUGAR EXPEDICION: ${companyConfig.lugarExpedicion.toUpperCase()}`);
      if (companyConfig.direccionFiscal)
        job.printLine(`DIR: ${companyConfig.direccionFiscal.toUpperCase()}`);
      if (companyConfig.sucursal)
        job.printLine(`SUC: ${companyConfig.sucursal.toUpperCase()}`);
      if (telVal)
        job.printLine(`📞 TEL: ${formatPhone(telVal) || telVal}`);
      if (companyConfig.email)
        job.printLine(`✉️ ${companyConfig.email.toLowerCase()}`);

      job.printLine("--------------------------------");
      job.printLine(`MESA: ${table.label}`);
      job.printLine(`FECHA: ${new Date().toLocaleString("es-MX")}`);
      job.printLine("--------------------------------");
      job.center().bold(true).printLine("📝 DETALLE DEL PEDIDO 📝").bold(false).left();
      job.printLine("--------------------------------");

      job.left();

      if (view === "resumen") {
        const summarized = allItems
          .filter((i) => !i.isCancelled)
          .reduce((acc: any[], item) => {
            const existing = acc.find((i) => i.product.id === item.product.id);
            if (existing) existing.quantity += item.quantity;
            else acc.push({ ...item });
            return acc;
          }, []);
        summarized.forEach((item) => {
          const price = `$${(item.quantity * item.product.price).toFixed(2)}`;
          const maxDescLen = Math.max(10, 32 - price.length - 4);
          const rawName = getFormattedProductName(item.product).toUpperCase();
          const cleanName = rawName.length > maxDescLen ? rawName.substring(0, maxDescLen) : rawName;
          const line = `${item.quantity}x ${cleanName}`;
          const padding = " ".repeat(
            Math.max(1, 32 - line.length - price.length),
          );
          job.printLine(line + padding + price);
        });

        const cancelled = allItems.filter((i) => i.isCancelled);
        if (cancelled.length > 0) {
          job.printLine("--------------------------------");
          job.bold(true).printLine("CANCELACIONES").bold(false);
          const summarizedCancelled = cancelled.reduce((acc: any[], item) => {
            const existing = acc.find(
              (i) =>
                i.product.id === item.product.id &&
                i.cancellationReason === item.cancellationReason,
            );
            if (existing) existing.quantity += item.quantity;
            else acc.push({ ...item });
            return acc;
          }, []);
          summarizedCancelled.forEach((item) => {
            job.printLine(
              `${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()} (CANC)`,
            );
            job.printLine(`  MOTIVO: ${item.cancellationReason}`);
            if (item.cancelledBy)
              job.printLine(`  POR: ${item.cancelledBy.name}`);
          });
        }
      } else if (view === "comandas") {
        table.comandas.forEach((comanda) => {
          job.bold(true).printLine(comanda.folioInterno ? `FOLIO INTERNO #${comanda.folioInterno}` : `FOLIO #${comanda.folio}`).bold(false);
          comanda.items
            .filter((i) => !i.isCancelled)
            .forEach((item) => {
              const line = `  ${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()}`;
              const price = `$${(item.quantity * item.product.price).toFixed(2)}`;
              const padding = " ".repeat(
                Math.max(1, 32 - line.length - price.length),
              );
              job.printLine(line + padding + price);
            });

          const cancelled = comanda.items.filter((i) => i.isCancelled);
          if (cancelled.length > 0) {
            job.printLine("  -- CANCELACIONES --");
            cancelled.forEach((item) => {
              job.printLine(
                `  ${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()} (CANC)`,
              );
              job.printLine(`    MOTIVO: ${item.cancellationReason}`);
            });
          }
          job.printLine(" ");
        });
      } else if (view === "comensales") {
        const comensales = Array.from(
          new Set(allItems.map((i) => i.plate)),
        ).sort((a, b) => a - b);
        comensales.forEach((cNum) => {
          job.bold(true).printLine(`COMENSAL ${cNum}`).bold(false);
          allItems
            .filter((i) => !i.isCancelled && i.plate === cNum)
            .forEach((item) => {
              const line = `  ${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()}`;
              const price = `$${(item.quantity * item.product.price).toFixed(2)}`;
              const padding = " ".repeat(
                Math.max(1, 32 - line.length - price.length),
              );
              job.printLine(line + padding + price);
            });

          const cancelled = allItems.filter(
            (i) => i.isCancelled && i.plate === cNum,
          );
          if (cancelled.length > 0) {
            job.printLine("  -- CANCELACIONES --");
            cancelled.forEach((item) => {
              job.printLine(
                `  ${item.quantity}x ${getFormattedProductName(item.product).toUpperCase()} (CANC)`,
              );
              job.printLine(`    MOTIVO: ${item.cancellationReason}`);
            });
          }
          job.printLine(" ");
        });
      }

      const dClientEsc = selectedDeliveryClient?.name || (table as any).deliveryClientName || "";
      const dPhoneEsc = selectedDeliveryClient?.phone || (table as any).deliveryClientPhone || "";
      const dAddrEsc = selectedDeliveryAddress || (table as any).deliveryAddress || "";
      const dNotesEsc = deliveryNotes || (table as any).deliveryNotes || "";

      if (table.zone === "Servicio a Domicilio" || dClientEsc || dAddrEsc) {
        job.printLine(" ");
        job.center().bold(true).printLine("DATOS DE ENVIO").bold(false).left();
        if (dClientEsc) {
          job.printLine(`CLIENTE: ${dClientEsc.toUpperCase()}`);
        }
        if (dAddrEsc) {
          let cleanAddr = "";
          let refText = "";
          if (typeof dAddrEsc === "string") {
            cleanAddr = dAddrEsc;
            if (dAddrEsc.includes("(Ref:")) {
              const parts = dAddrEsc.split("(Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].replace(")", "").trim();
            } else if (dAddrEsc.includes("| Ref:")) {
              const parts = dAddrEsc.split("| Ref:");
              cleanAddr = parts[0].trim();
              refText = parts[1].trim();
            }
          } else if (typeof dAddrEsc === "object" && dAddrEsc !== null) {
            cleanAddr = (dAddrEsc as any).street || (dAddrEsc as any).address || (dAddrEsc as any).formatted || "";
            refText = (dAddrEsc as any).notes || (dAddrEsc as any).reference || "";
          }

          if (cleanAddr) job.printLine(`DIR: ${String(cleanAddr).toUpperCase()}`);
          if (refText) job.printLine(`REF: ${String(refText).toUpperCase()}`);
        }
        if (dNotesEsc) {
          job.printLine(`NOTAS: ${String(dNotesEsc).toUpperCase()}`);
        }
        job.printLine("--------------------------------");
      }

      job.right();
      job.printLine(`SUBTOTAL: $${currentSubtotal.toFixed(2)}`);
      if (paymentTipValue > 0)
        job.printLine(`PROPINA: $${paymentTipValue.toFixed(2)}`);
      if (currentDiscountAmount > 0)
        job.printLine(`DESCUENTO: -$${currentDiscountAmount.toFixed(2)}`);
      job
        .bold(true)
        .printLine(`TOTAL: $${currentTotal.toFixed(2)}`)
        .bold(false);

      if (explicitPaymentMethod || (table as any).isPaid) {
        const payMethodToUse = explicitPaymentMethod || (table as any).paymentMethod || activePayMethod;
        if (payMethodToUse) {
          let pLabel = String(payMethodToUse).toUpperCase();
          if (["CASH", "EFECTIVO"].includes(pLabel)) pLabel = "EFECTIVO";
          else if (["CARD", "TARJETA"].includes(pLabel)) pLabel = activeCardType === "credito" ? "TARJETA CRÉDITO" : activeCardType === "debito" ? "TARJETA DÉBITO" : "TARJETA";
          else if (["TRANSFER", "TRANSFERENCIA", "SPEI"].includes(pLabel)) pLabel = "TRANSFERENCIA";
          
          job.printLine(`PAGADO: $${currentTotal.toFixed(2)}`);
          job.printLine(`PAGO CON: ${pLabel}`);
        }
      }

      if (requiresInvoice) {
        job.printLine("--------------------------------");
        job.left();
        job.bold(true).printLine("🧾 REQUIERE FACTURA").bold(false);
      }

      job.center();
      job.feed(1).printLine((companyConfig?.footerMessage || "¡Gracias por su visita!").toUpperCase());
      job.feed(3).cut();

      job.execute();
    } catch (e) {
      console.error("Error printing ticket with native bluetooth, fallback to iframe print:", e);
      
      const allItems = table.comandas.flatMap((c) => c.items);
      const subTotalItems = allItems
        .filter((i) => !i.isCancelled)
        .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
      const discountAmount = Math.round(
        paymentDiscountType === "percent"
          ? subTotalItems * (paymentDiscountValue / 100)
          : paymentDiscountValue
      );
      const total = subTotalItems + paymentTipValue - discountAmount;

      let itemsHtml = "";
      if (view === "resumen") {
        const summarized = allItems
          .filter((i) => !i.isCancelled)
          .reduce((acc: any[], item) => {
            const existing = acc.find((i) => i.product.id === item.product.id);
            if (existing) existing.quantity += item.quantity;
            else acc.push({ ...item });
            return acc;
          }, []);
        summarized.forEach((item) => {
          itemsHtml += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>${item.quantity}x ${item.product.name.toUpperCase()}</span>
              <span>$${(item.quantity * item.product.price).toFixed(2)}</span>
            </div>
          `;
        });
      } else if (view === "comandas") {
        table.comandas.forEach((comanda) => {
          itemsHtml += `<div style="font-weight: bold; margin-top: 8px;">${comanda.folioInterno ? `FOLIO INTERNO #${comanda.folioInterno}` : `FOLIO #${comanda.folio}`}</div>`;
          comanda.items
            .filter((i) => !i.isCancelled)
            .forEach((item) => {
              itemsHtml += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px; padding-left: 10px;">
                  <span>${item.quantity}x ${item.product.name.toUpperCase()}</span>
                  <span>$${(item.quantity * item.product.price).toFixed(2)}</span>
                </div>
              `;
            });
        });
      } else if (view === "comensales") {
        const comensales = Array.from(
          new Set(allItems.map((i) => i.plate)),
        ).sort((a, b) => a - b);
        comensales.forEach((cNum) => {
          itemsHtml += `<div style="font-weight: bold; margin-top: 8px;">COMENSAL ${cNum}</div>`;
          allItems
            .filter((i) => !i.isCancelled && i.plate === cNum)
            .forEach((item) => {
              itemsHtml += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px; padding-left: 10px;">
                  <span>${item.quantity}x ${item.product.name.toUpperCase()}</span>
                  <span>$${(item.quantity * item.product.price).toFixed(2)}</span>
                </div>
              `;
            });
        });
      }

      const receiptTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @media print {
              body { margin: 0; padding: 0; background: #fff; }
              @page { margin: 0; }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              color: #000;
              width: 300px;
              margin: 0 auto;
              padding: 15px;
              background: #fff;
              box-sizing: border-box;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="center">
            <div style="display: flex; justify-content: center; margin-bottom: 10px;">
              <img src="${companyConfig.logoUrl || '/logoroy.png'}" style="max-height: 50px; max-width: 140px; object-fit: contain;" onError="this.style.display='none'" />
            </div>
            <h2 style="margin: 0 0 5px 0;">${(companyConfig.businessName || selectedTenant?.name || "TAQUERIA").toUpperCase()}</h2>
            <div class="divider"></div>
            ${(companyConfig.rfc || selectedTenant?.rfc) ? `<div style="font-size: 11px;">RFC: ${(companyConfig.rfc || selectedTenant?.rfc || "").toUpperCase()}</div>` : ''}
            ${(companyConfig.regimenFiscal || selectedTenant?.regimenFiscal) ? `<div style="font-size: 11px;">RÉGIMEN FISCAL: ${(companyConfig.regimenFiscal || selectedTenant?.regimenFiscal || "").toUpperCase()}</div>` : ''}
            ${(companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion) ? `<div style="font-size: 11px;">LUGAR EXPEDICIÓN: ${(companyConfig.lugarExpedicion || selectedTenant?.lugarExpedicion || "").toUpperCase()}</div>` : ''}
            ${(companyConfig.direccionFiscal || selectedTenant?.direccionFiscal) ? `<div style="font-size: 11px;">DIR: ${(companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").toUpperCase()}</div>` : ''}
            ${(companyConfig.sucursal || selectedTenant?.sucursalDefault) ? `<div style="font-size: 11px;">SUC: ${(companyConfig.sucursal || selectedTenant?.sucursalDefault || "").toUpperCase()}</div>` : ''}
            ${(companyConfig.telefono || selectedTenant?.telefono) ? `<div style="font-size: 11px;">📞 TEL: ${formatPhone(companyConfig.telefono || selectedTenant?.telefono) || companyConfig.telefono || selectedTenant?.telefono}</div>` : ''}
            ${(companyConfig.email || selectedTenant?.email) ? `<div style="font-size: 11px;">✉️ ${(companyConfig.email || selectedTenant?.email || "").toLowerCase()}</div>` : ''}
            <div class="divider"></div>
            <div>Mesa: ${table.label}</div>
            <div>Fecha: ${new Date().toLocaleString("es-MX")}</div>
            <div class="divider"></div>
            <div style="font-weight: bold; text-align: center; font-size: 12px; margin: 4px 0;">📝 DETALLE DEL PEDIDO 📝</div>
            <div class="divider"></div>
          </div>
          <div>
            ${itemsHtml}
          </div>
          <div class="divider"></div>
          ${
            table.zone === "Servicio a Domicilio" || (table as any).deliveryClientName || selectedDeliveryClient?.name || selectedDeliveryAddress ? `
              <div style="font-size: 11px; margin-top: 5px; margin-bottom: 5px; padding: 6px; border: 1px dashed #000; border-radius: 4px;">
                <div style="font-weight: bold; text-align: center; margin-bottom: 4px;">-- DATOS DE ENVÍO --</div>
                ${selectedDeliveryClient?.name || (table as any).deliveryClientName ? `<div><strong>CLIENTE:</strong> ${(selectedDeliveryClient?.name || (table as any).deliveryClientName).toUpperCase()}</div>` : ""}
                ${selectedDeliveryClient?.phone || (table as any).deliveryClientPhone ? `<div><strong>TEL:</strong> ${selectedDeliveryClient?.phone || (table as any).deliveryClientPhone}</div>` : ""}
                ${selectedDeliveryAddress || (table as any).deliveryAddress ? (() => {
                  const dAddr = selectedDeliveryAddress || (table as any).deliveryAddress;
                  let cleanAddr = dAddr;
                  let refText = "";
                  if (dAddr.includes("(Ref:")) {
                    const parts = dAddr.split("(Ref:");
                    cleanAddr = parts[0].trim();
                    refText = parts[1].replace(")", "").trim();
                  } else if (dAddr.includes("| Ref:")) {
                    const parts = dAddr.split("| Ref:");
                    cleanAddr = parts[0].trim();
                    refText = parts[1].trim();
                  }
                  return `<div><strong>DIR:</strong> ${cleanAddr.toUpperCase()}</div>` +
                    (refText ? `<div><strong>REF:</strong> ${refText.toUpperCase()}</div>` : "");
                })() : ""}
                ${deliveryNotes || (table as any).deliveryNotes ? `<div><strong>NOTAS:</strong> ${(deliveryNotes || (table as any).deliveryNotes).toUpperCase()}</div>` : ""}
              </div>
              <div class="divider"></div>
            ` : ""
          }
          <div class="right">
            <div class="total-row"><strong>SUBTOTAL:</strong><span>$${subTotalItems.toFixed(2)}</span></div>
            ${discountAmount > 0 ? `<div class="total-row"><strong>DESCUENTO:</strong><span>-$${discountAmount.toFixed(2)}</span></div>` : ''}
            <div class="total-row" style="font-size: 15px; font-weight: bold;"><strong>TOTAL A PAGAR:</strong><span>$${total.toFixed(2)}</span></div>
            ${paymentTipValue > 0 ? `<div class="total-row" style="margin-top: 4px; border-top: 1px dotted #888; padding-top: 4px; font-size: 11px;"><strong>(+) PROPINA MESEROS (VOLUNTARIA):</strong><span>$${paymentTipValue.toFixed(2)}</span></div>` : ''}
          </div>
          <div class="divider"></div>
          <div class="center" style="font-size: 11px; margin-top: 15px;">
            ${companyConfig.footerMessage.toUpperCase()}<br/>
            ¡GRACIAS POR SU PREFERENCIA! ⚡🍕
          </div>
        </body>
        </html>
      `;

      let iframe = document.getElementById("print-iframe") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
      }
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(receiptTemplate);
        doc.close();
      }
    }
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

    const renderClosedAccountsList = () => {
    return (
      <>
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            {/* Sales Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                onClick={() =>
                  setPaymentMethodFilter((prev) =>
                    prev === "cash" ? "all" : "cash",
                  )
                }
                style={{
                  background:
                    paymentMethodFilter === "cash" ? "#f0fdf4" : "white",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "cash"
                      ? "0 8px 16px -4px rgba(16, 185, 129, 0.35)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderTop:
                    paymentMethodFilter === "cash"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  borderRight:
                    paymentMethodFilter === "cash"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  borderBottom:
                    paymentMethodFilter === "cash"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  borderLeft:
                    paymentMethodFilter === "cash"
                      ? "4px solid #10b981"
                      : "4px solid #10b981",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "cash" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "cash" ? "#15803d" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Efectivo <span style={{ fontSize: "2.3rem" }}>💵</span>{" "}
                  {paymentMethodFilter === "cash" && "🎯"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "cash" ? "#166534" : "#1e293b",
                  }}
                >
                  $
                  {historyForCuentasTab
                    .filter(
                      (a) =>
                        a.status !== "cancelled" && a.paymentMethod === "cash",
                    )
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                onClick={() =>
                  setPaymentMethodFilter((prev) =>
                    prev === "bank" ? "all" : "bank",
                  )
                }
                style={{
                  background:
                    paymentMethodFilter === "bank" ? "#eff6ff" : "white",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "bank"
                      ? "0 8px 16px -4px rgba(59, 130, 246, 0.35)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderTop:
                    paymentMethodFilter === "bank"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  borderRight:
                    paymentMethodFilter === "bank"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  borderBottom:
                    paymentMethodFilter === "bank"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  borderLeft:
                    paymentMethodFilter === "bank"
                      ? "4px solid #3b82f6"
                      : "4px solid #3b82f6",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "bank" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "bank" ? "#1d4ed8" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Bancos / Tarjeta{" "}
                  <span style={{ fontSize: "2.3rem" }}>🏦💳</span>{" "}
                  {paymentMethodFilter === "bank" && "🎯"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "bank" ? "#1e40af" : "#1e293b",
                  }}
                >
                  $
                  {historyForCuentasTab
                    .filter(
                      (a) =>
                        a.status !== "cancelled" &&
                        (a.paymentMethod === "card" ||
                          a.paymentMethod === "transfer"),
                    )
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                onClick={() =>
                  setPaymentMethodFilter((prev) =>
                    prev === "lupay" ? "all" : "lupay",
                  )
                }
                style={{
                  background:
                    paymentMethodFilter === "lupay" ? "#faf5ff" : "white",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "lupay"
                      ? "0 8px 16px -4px rgba(168, 85, 247, 0.35)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderTop:
                    paymentMethodFilter === "lupay"
                      ? "2px solid #a855f7"
                      : "2px solid transparent",
                  borderRight:
                    paymentMethodFilter === "lupay"
                      ? "2px solid #a855f7"
                      : "2px solid transparent",
                  borderBottom:
                    paymentMethodFilter === "lupay"
                      ? "2px solid #a855f7"
                      : "2px solid transparent",
                  borderLeft:
                    paymentMethodFilter === "lupay"
                      ? "4px solid #a855f7"
                      : "4px solid #a855f7",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "lupay" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "lupay" ? "#7e22ce" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Lúpay <span style={{ fontSize: "2.3rem" }}>⚡</span>{" "}
                  {paymentMethodFilter === "lupay" && "🎯"}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "lupay" ? "#6b21a8" : "#1e293b",
                  }}
                >
                  $
                  {historyForCuentasTab
                    .filter((a) => a.status !== "cancelled" && a.paymentMethod === "lupay")
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                onClick={() => setPaymentMethodFilter("all")}
                style={{
                  background:
                    paymentMethodFilter === "all" ? "#0f172a" : "#1e293b",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  boxShadow:
                    paymentMethodFilter === "all"
                      ? "0 8px 16px -4px rgba(15, 23, 42, 0.5)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  border:
                    paymentMethodFilter === "all"
                      ? "2px solid #64748b"
                      : "2px solid transparent",
                  color: "white",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  transform:
                    paymentMethodFilter === "all" ? "scale(1.03)" : "scale(1)",
                }}
                className="hover:shadow-md"
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "900",
                    color:
                      paymentMethodFilter === "all"
                        ? "#e2e8f0"
                        : "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Total Venta <span style={{ fontSize: "1.3rem" }}>📊🎯</span>{" "}
                  {paymentMethodFilter === "all" && "🎯"}
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                  $
                  {historyForCuentasTab
                    .filter((a) => a.status !== "cancelled")
                    .reduce((sum, a) => sum + a.total, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>

            {/* Filter Notice Banner if active */}
            {paymentMethodFilter !== "all" && (
              <div
                style={{
                  background:
                    paymentMethodFilter === "cash"
                      ? "#ecfdf5"
                      : paymentMethodFilter === "bank"
                        ? "#eff6ff"
                        : "#faf5ff",
                  border:
                    paymentMethodFilter === "cash"
                      ? "1px solid #a7f3d0"
                      : paymentMethodFilter === "bank"
                        ? "1px solid #bfdbfe"
                        : "1px solid #e9d5ff",
                  color:
                    paymentMethodFilter === "cash"
                      ? "#065f46"
                      : paymentMethodFilter === "bank"
                        ? "#1e40af"
                        : "#6b21a8",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <span>
                  🔍 Mostrando únicamente pagos en:{" "}
                  <strong>
                    {paymentMethodFilter === "cash"
                      ? "Efectivo 💵"
                      : paymentMethodFilter === "bank"
                        ? "Bancos / Tarjeta 🏦💳"
                        : "Lúpay ⚡"}
                  </strong>
                </span>
                <button
                  onClick={() => setPaymentMethodFilter("all")}
                  style={{
                    background: "rgba(0,0,0,0.06)",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "inherit",
                  }}
                >
                  Ver Todos (Quitar Filtro)
                </button>
              </div>
            )}

            <div
              style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                width: "100%",
              }}
            >
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        textAlign: "left",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      <th style={{ padding: "12px 16px" }}>MESA</th>
                      <th style={{ padding: "12px 16px" }}>MONTO</th>
                      <th style={{ padding: "12px 16px" }}>HORA</th>
                      <th style={{ padding: "12px 16px" }}>MEDIO</th>
                      <th style={{ padding: "12px 16px" }}>ESTATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredHistory = historyForCuentasTab.filter((account) => {
                        if (paymentMethodFilter === "all") return true;
                        if (paymentMethodFilter === "cash") {
                          return (
                            account.status !== "cancelled" &&
                            account.paymentMethod === "cash"
                          );
                        }
                        if (paymentMethodFilter === "bank") {
                          return (
                            account.status !== "cancelled" &&
                            (account.paymentMethod === "card" ||
                              account.paymentMethod === "transfer")
                          );
                        }
                        if (paymentMethodFilter === "lupay") {
                          return (
                            account.status !== "cancelled" &&
                            account.paymentMethod === "lupay"
                          );
                        }
                        return true;
                      });

                      if (filteredHistory.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "24px",
                                textAlign: "center",
                                color: "#64748b",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                              }}
                            >
                              ⚠️ No hay registros cerrados con el método de pago
                              seleccionado
                            </td>
                          </tr>
                        );
                      }

                      return filteredHistory.map((account) => {
                        const hasCancelledItems = (account.comandas || []).some(
                          (c) => (c.items || []).some((i) => i.isCancelled),
                        );
                        let rowBg = "transparent";
                        let rowBorder = "1px solid #f1f5f9";
                        if (account.status === "cancelled") {
                          rowBg = "#fff1f2";
                          rowBorder = "1px solid #fecaca";
                        }
                        const isExpanded = expandedAccountIds.includes(
                          account.id,
                        );
                        return (
                          <React.Fragment key={account.id}>
                            <tr
                              style={{
                                background: rowBg,
                                borderBottom: isExpanded ? "none" : rowBorder,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onClick={() => {
                                setExpandedAccountIds((prev) =>
                                  prev.includes(account.id)
                                    ? prev.filter((id) => id !== account.id)
                                    : [...prev, account.id],
                                );
                              }}
                              className="hover:bg-slate-50"
                            >
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontWeight: "bold",
                                  color: "#1e293b",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span>Mesa {account.tableLabel}</span>
                                  {account.zone === "Servicio a Domicilio" && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDeliveryAccount(account);
                                      }}
                                      style={{
                                        border: "none",
                                        background: "#eff6ff",
                                        color: "#1d4ed8",
                                        borderRadius: "8px",
                                        padding: "4px 8px",
                                        fontSize: "0.75rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow: "0 2px 4px rgba(29, 78, 216, 0.1)",
                                        cursor: "pointer",
                                        outline: "none"
                                      }}
                                      title="Ver datos de entrega a domicilio"
                                      className="hover:bg-blue-100 active:scale-95 transition-all"
                                    >
                                      🛵👤 {account.paymentMethod === "cash" ? "💵" : account.paymentMethod === "card" ? "💳" : account.paymentMethod === "lupay" ? "⚡" : "🏦"}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontWeight: "bold",
                                  color: "#3b82f6",
                                }}
                              >
                                ${account.total.toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: "0.85rem",
                                  color: "#64748b",
                                }}
                              >
                                {account.timestamp instanceof Date &&
                                !isNaN(account.timestamp.getTime())
                                  ? account.timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "---"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "center",
                                }}
                              >
                                <div className="inline-flex items-center gap-1.5 justify-center" style={{ fontSize: "1.3rem" }}>
                                  <span
                                    title={
                                      (account.paymentMethod === "cash"
                                        ? "Efectivo"
                                        : account.paymentMethod === "card"
                                          ? "Tarjeta"
                                          : account.paymentMethod === "lupay"
                                            ? "Lúpay"
                                            : "Transferencia") +
                                      (account.requiresInvoice ? ` - Requiere Factura (${account.invoicePhone || "Sin tel."})` : "")
                                    }
                                  >
                                    {account.paymentMethod === "cash"
                                      ? "💵"
                                      : account.paymentMethod === "card"
                                        ? "💳"
                                        : account.paymentMethod === "lupay"
                                          ? "⚡"
                                          : "🏦"}
                                  </span>
                                  {account.requiresInvoice && (
                                    <span className="inline-flex items-center gap-1 ml-1">
                                      <span title="Requiere Factura">🧾</span>
                                      {account.invoicePhone ? (
                                        <button
                                          type="button"
                                          onClick={(e) => handleSendWhatsAppInvoice(account, e)}
                                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1 rounded-full text-xs shadow-md transition cursor-pointer active:scale-95 border border-emerald-500"
                                          title="💬 Enviar WhatsApp solicitando Constancia Fiscal y enviar ticket"
                                        >
                                          <span>💬</span>
                                          <span className="underline">({account.invoicePhone})</span>
                                        </button>
                                      ) : (
                                        <span className="text-stone-400 text-xs font-bold ml-0.5">(Sin tel)</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {account.status === "cancelled" ? (
                                  <IonBadge color="danger">Cancelada ❌</IonBadge>
                                ) : (
                                  <select
                                    value={
                                      account.zone === "Servicio a Domicilio" || account.deliveryStatus
                                        ? (account.deliveryStatus || (account.isPaid ? "entregado" : "en_camino"))
                                        : (account.isPaid ? "pagado" : "en_camino")
                                    }
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const val = e.target.value as "en_camino" | "entregado" | "pagado" | "no_entregado";
                                      handleQuickChangeAccountStatus(account, val);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-xs font-black px-3 py-1.5 rounded-xl border cursor-pointer shadow-sm outline-none transition-all ${
                                      account.deliveryStatus === "entregado" || (account.isPaid && account.deliveryStatus !== "en_camino" && account.deliveryStatus !== "no_entregado")
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                                        : account.deliveryStatus === "no_entregado"
                                        ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                                        : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 animate-pulse"
                                    }`}
                                  >
                                    <option value="en_camino">🛵 En Camino</option>
                                    <option value="entregado">✅ Entregado</option>
                                    <option value="pagado">💵 Pagado</option>
                                    <option value="no_entregado">⚠️ No Entregado</option>
                                  </select>
                                )}
                              </td>
                          </tr>
                          {isExpanded && (
                            <tr
                              style={{
                                background:
                                  account.status === "cancelled"
                                    ? "#fff1f2"
                                    : "#f8fafc",
                                borderBottom: rowBorder,
                              }}
                            >
                              <td
                                colSpan={5}
                                style={{ padding: "0 16px 16px 16px" }}
                              >
                                <div
                                  style={{
                                    background: "white",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow:
                                      "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
                                  }}
                                >
                                  <div
                                    style={{
                                      marginBottom: "16px",
                                      borderBottom: "1px solid #e2e8f0",
                                      paddingBottom: "12px",
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: "0 0 12px 0",
                                        fontSize: "0.9rem",
                                        color: "#64748b",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Productos Vendidos
                                    </h4>
                                    {account.comandas
                                      .flatMap((c: any) => c.items)
                                      .map((item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "0.9rem",
                                            marginBottom: "6px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              textDecoration: item.isCancelled
                                                ? "line-through"
                                                : "none",
                                              color: item.isCancelled
                                                ? "#ef4444"
                                                : "#334155",
                                            }}
                                          >
                                            {item.quantity}x{" "}
                                            {item.product?.name || "Prod"}
                                          </span>
                                          <span
                                            style={{
                                              textDecoration: item.isCancelled
                                                ? "line-through"
                                                : "none",
                                              color: item.isCancelled
                                                ? "#ef4444"
                                                : "#334155",
                                              fontWeight: "500",
                                            }}
                                          >
                                            $
                                            {(
                                              item.quantity *
                                              (item.product?.price || 0)
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: "8px",
                                      fontSize: "0.9rem",
                                      color: "#64748b",
                                    }}
                                  >
                                    <span>Subtotal:</span>
                                    <span>${account.subtotal.toFixed(2)}</span>
                                  </div>
                                  {account.discount > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                        fontSize: "0.9rem",
                                        color: "#ef4444",
                                      }}
                                    >
                                      <span>
                                        Descuento ({account.discountReason}):
                                      </span>
                                      <span>
                                        -${account.discount.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {account.tip > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                        fontSize: "0.9rem",
                                        color: "#10b981",
                                      }}
                                    >
                                      <span>Propina:</span>
                                      <span>${account.tip.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontWeight: "bold",
                                      fontSize: "1.1rem",
                                      borderTop: "1px solid #e2e8f0",
                                      paddingTop: "8px",
                                      marginBottom: "16px",
                                      color: "#1e293b",
                                    }}
                                  >
                                    <span>Total:</span>
                                    <span>${account.total.toFixed(2)}</span>
                                  </div>

                                  {account.status === "cancelled" && (
                                    <div
                                      className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4 text-xs font-semibold text-red-800"
                                      style={{ margin: "12px 0 16px 0", cursor: "default", width: "100%" }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="font-extrabold text-sm mb-1 text-red-900 flex items-center gap-1">
                                        🚫 CUENTA CANCELADA
                                      </div>
                                      <div>
                                        <strong>Autorizado por:</strong> {account.cancelledBy?.name || "Administrador registrado"} ({account.cancelledBy?.role || "admin"})
                                      </div>
                                      <div className="mt-1">
                                        <strong>Motivo de Cancelación:</strong> "{account.cancellationReason || "Prueba de cambios en el sistema"}"
                                      </div>
                                    </div>
                                  )}

                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "12px",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    {account.status !== "cancelled" && !account.isPendingCancellation && (
                                      <IonButton
                                        size="small"
                                        color="danger"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedAccountForCancellation(account);
                                          setAccountCancellationReason("");
                                          setAccountCancellationPin("");
                                          setShowAccountCancellationModal(true);
                                        }}
                                      >
                                        <IonIcon icon={closeCircleOutline} slot="start" />
                                        Cancelar Cuenta 🚫
                                      </IonButton>
                                    )}
                                    {account.status !== "cancelled" && (
                                       <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleQuickChangeAccountStatus(account, "en_camino");
                                           }}
                                           className={`px-2 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                                             (account.deliveryStatus === "en_camino" || (!account.deliveryStatus && !account.isPaid))
                                               ? "bg-amber-500 text-white shadow-sm"
                                               : "bg-white text-slate-700 hover:bg-amber-50"
                                           }`}
                                         >
                                           🛵 En Camino
                                         </button>
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleQuickChangeAccountStatus(account, "entregado");
                                           }}
                                           className={`px-2 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                                             (account.deliveryStatus === "entregado" || (account.isPaid && account.deliveryStatus !== "en_camino"))
                                               ? "bg-emerald-600 text-white shadow-sm"
                                               : "bg-white text-slate-700 hover:bg-emerald-50"
                                           }`}
                                         >
                                           ✅ Entregado / Pagado
                                         </button>
                                       </div>
                                     )}
                                    {account.isPendingCancellation && (
                                      <div className="flex items-center gap-2">
                                        <IonBadge color="warning" className="font-black px-3 py-1.5 rounded-xl">EN ESPERA ⏳</IonBadge>
                                        <IonButton
                                          size="small"
                                          color="danger"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingCancellationTarget({ type: 'account', id: account.id });
                                            setShowAuthorizeCancellationModal(true);
                                          }}
                                        >
                                          <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                                          Autorizar
                                        </IonButton>
                                        <IonButton
                                          size="small"
                                          color="medium"
                                          fill="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRevertAccountCancellation(account.id);
                                          }}
                                        >
                                          <IonIcon icon={refreshOutline} slot="start" />
                                          Revertir
                                        </IonButton>
                                      </div>
                                    )}
                                    {account.status !== "cancelled" &&
                                      !account.isPaid && (
                                        <IonButton
                                          size="small"
                                          color="warning"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsPaid(account.id);
                                          }}
                                        >
                                          Marcar Pagado
                                        </IonButton>
                                      )}
                                    {account.status !== "cancelled" && (
                                       editingInvoiceAccountId === account.id ? (
                                         <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-xl border-2 border-amber-300 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                           <span className="text-xs font-black text-amber-950">📱 Celular:</span>
                                           <input
                                             type="tel"
                                             inputMode="numeric"
                                             maxLength={10}
                                             placeholder="Ej. 6621234567"
                                             value={editingInvoicePhoneValue}
                                             onChange={(e) => setEditingInvoicePhoneValue(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                             className="bg-white border-2 border-amber-400 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-slate-900 w-36 outline-none focus:border-amber-600"
                                             autoFocus
                                           />
                                           <button
                                             type="button"
                                             onClick={async (e) => {
                                               e.stopPropagation();
                                               if (editingInvoicePhoneValue.length !== 10) {
                                                 alert("El número celular debe tener exactamente 10 dígitos.");
                                                 return;
                                               }
                                               try {
                                                 await updateInvoiceRequirementInFirebase(account.id, true, editingInvoicePhoneValue);
                                                 setHistory((prev) =>
                                                   prev.map((acc) =>
                                                     acc.id === account.id
                                                       ? { ...acc, requiresInvoice: true, invoicePhone: editingInvoicePhoneValue }
                                                       : acc
                                                   )
                                                 );
                                                 triggerAppNotification(
                                                   "🧾 FACTURACIÓN ACTUALIZADA",
                                                   `Cuenta ${account.tableLabel} marcada como: Requiere Factura (Cel: ${editingInvoicePhoneValue})`
                                                 );
                                                 setEditingInvoiceAccountId(null);
                                                 setEditingInvoicePhoneValue("");
                                               } catch (err) {
                                                 console.error(err);
                                               }
                                             }}
                                             className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                                           >
                                             <span>Guardar</span> ✓
                                           </button>
                                           <button
                                             type="button"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               setEditingInvoiceAccountId(null);
                                               setEditingInvoicePhoneValue("");
                                             }}
                                             className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition"
                                           >
                                             ✕
                                           </button>
                                         </div>
                                       ) : (
                                         <button
                                           type="button"
                                           onClick={async (e) => {
                                             e.stopPropagation();
                                             if (account.requiresInvoice) {
                                               try {
                                                 await updateInvoiceRequirementInFirebase(account.id, false, "");
                                                 setHistory((prev) =>
                                                   prev.map((acc) =>
                                                     acc.id === account.id
                                                       ? { ...acc, requiresInvoice: false, invoicePhone: "" }
                                                       : acc
                                                   )
                                                 );
                                                 triggerAppNotification(
                                                   "🧾 FACTURACIÓN ACTUALIZADA",
                                                   `Cuenta ${account.tableLabel} marcada como: No requiere Factura`
                                                 );
                                               } catch (err) {
                                                 console.error("Error updating invoice requirement:", err);
                                               }
                                             } else {
                                               setEditingInvoiceAccountId(account.id);
                                               setEditingInvoicePhoneValue(account.invoicePhone || "");
                                             }
                                           }}
                                           className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                             account.requiresInvoice
                                               ? "bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-600"
                                               : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                                           }`}
                                         >
                                           🧾 {account.requiresInvoice ? "Quitar Factura" : "Requiere Factura"}
                                         </button>
                                       )
                                     )}

                                    {account.status !== "cancelled" && (
                                      <IonButton
                                        size="small"
                                        fill="outline"
                                        color="secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAccountToEditPayment(account);
                                          setTempPaymentMethod(account.paymentMethod || "cash");
                                          setTempCardLastFour(account.cardLastFour || "");
                                          setTempPaymentCardType(account.cardType || "");
                                          setIsEditPaymentModalOpen(true);
                                        }}
                                      >
                                        <IonIcon icon={refreshOutline} slot="start" />
                                        Cambiar Tipo de Pago 🔄
                                      </IonButton>
                                    )}

                                    <IonButton
                                      fill="outline"
                                      color="primary"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        reprintAccount(account);
                                      }}
                                    >
                                      <IonIcon
                                        icon={printOutline}
                                        slot="start"
                                      />
                                      Reimprimir Nota
                                    </IonButton>
                                    <IonButton
                                      color="secondary"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExportingAccount(account);
                                      }}
                                      title="Exportar"
                                    >
                                      📤
                                    </IonButton>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
              </div>
            </div>
          </div>
      </>
    );
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

  const renderDeliveryPanel = () => {
    if (!selectedTable || selectedTable.zone !== "Servicio a Domicilio") return null;

    if (!selectedDeliveryClient) {
      return null; // Removed upper banner as requested so it does not obstruct ordering
    }

    return (
      <div className="m-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-3xl p-4 shadow-md border-none flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Background visual detail */}
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none translate-x-8 translate-y-8 select-none">
          🛵
        </div>
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🛵
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">REPARTO A DOMICILIO</span>
            <h3 className="text-sm font-black tracking-tight">{selectedDeliveryClient.name}</h3>
            <p className="text-xs text-indigo-100 font-bold flex items-center gap-1">
              <span>📞 {selectedDeliveryClient.phone}</span>
              <span className="opacity-50">|</span>
              <span className="truncate max-w-[200px]">📍 {selectedDeliveryAddress || "Sin dirección"}</span>
            </p>
            {deliveryNotes && (
              <p className="text-[10px] text-indigo-200/90 font-medium italic truncate max-w-[300px]">
                📝 {deliveryNotes}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDeliverySetupModal(true)}
          className="bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0 relative z-10"
        >
          Editar Envío ⚙️
        </button>
      </div>
    );
  };

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
    <div
      key={`${item.product.id}-${item.plate}-${item.notes || ""}-${idx !== undefined ? idx : ""}`}
      style={{ background: "white", borderBottom: "1px solid #f1f5f9" }}
    >
      <div style={{ padding: "12px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, marginRight: "8px" }}>
            <h3
              style={{
                fontWeight: "900",
                margin: 0,
                fontSize: "0.95rem",
                color: "#1e293b",
                lineHeight: "1.2",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {getFormattedProductName(item.product)}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: "bold",
                }}
              >
                ${item.product.price.toFixed(2)}
              </span>
              <span style={{ color: "#cbd5e1", fontSize: "0.7rem" }}>•</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#10b981",
                  fontWeight: "900",
                }}
              >
                ${(item.quantity * item.product.price).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f1f5f9",
                borderRadius: "12px",
                padding: "2px",
              }}
            >
              <IonButton
                fill="clear"
                color="medium"
                onClick={() =>
                  updateQuantity(item.product.id, item.plate, -1, item.notes)
                }
                style={{
                  "--padding-start": "4px",
                  "--padding-end": "4px",
                  height: "32px",
                  width: "32px",
                  margin: 0,
                }}
              >
                <IonIcon icon={removeOutline} style={{ fontSize: "0.9rem" }} />
              </IonButton>
              <IonText
                style={{
                  fontWeight: "900",
                  width: "28px",
                  textAlign: "center",
                  fontSize: "1rem",
                  color: "#1e293b",
                }}
              >
                {item.quantity}
              </IonText>
              <IonButton
                fill="clear"
                color="primary"
                onClick={() =>
                  updateQuantity(item.product.id, item.plate, 1, item.notes)
                }
                style={{
                  "--padding-start": "4px",
                  "--padding-end": "4px",
                  height: "32px",
                  width: "32px",
                  margin: 0,
                }}
              >
                <IonIcon icon={addOutline} style={{ fontSize: "0.9rem" }} />
              </IonButton>
            </div>

            <IonButton
              fill="clear"
              color="warning"
              onClick={() =>
                openItemNoteModal(item.product.id, item.plate, item.notes)
              }
              style={{ height: "36px", width: "36px", margin: 0 }}
            >
              <IonIcon
                icon={chatbubbleEllipsesOutline}
                slot="icon-only"
                style={{ fontSize: "1.2rem" }}
              />
            </IonButton>

            <IonButton
              fill="clear"
              color="danger"
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.plate,
                  -item.quantity,
                  item.notes,
                )
              }
              style={{ height: "36px", width: "36px", margin: 0 }}
            >
              <IonIcon
                icon={trashOutline}
                slot="icon-only"
                style={{ fontSize: "1.2rem" }}
              />
            </IonButton>
          </div>
        </div>

        {item.notes && (
          <div
            style={{
              marginTop: "8px",
              background: "#fff7ed",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "0.8rem",
              color: "#c2410c",
              border: "1px solid #ffedd5",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <IonIcon
              icon={chatbubbleEllipsesOutline}
              style={{ fontSize: "0.9rem", marginTop: "2px" }}
            />
            <span style={{ fontWeight: "bold", lineHeight: "1.4" }}>
              {item.notes}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrecuentaItem = (
    item: CartItem,
    showDelete = false,
    folio?: number,
    index?: number,
  ) => {
    const isCancelled = item.isCancelled;
    const isPendingCancellation = item.isPendingCancellation;
    const canSelect = showDelete && !isCancelled && !isPendingCancellation && folio !== undefined;
    const isSelected = canSelect && (itemsSelectedForCancellation || []).some(
      (it) => it.folio === folio && it.productId === item.product.id && it.plate === item.plate
    );

    return (
      <div
        key={`item-${item.product.id}-${item.plate}-${folio}-${index}`}
        onClick={() => {
          if (canSelect) {
            const newItem = { folio, productId: item.product.id, plate: item.plate };
            if (isSelected) {
              setItemsSelectedForCancellation(prev => prev.filter(it => !(it.folio === folio && it.productId === item.product.id && it.plate === item.plate)));
            } else {
              setItemsSelectedForCancellation(prev => [...prev, newItem]);
            }
          }
        }}
        style={{
          background: isSelected ? "#fff1f2" : "white",
          borderBottom: "1px solid #f1f5f9",
          opacity: isCancelled ? 0.6 : 1,
          cursor: canSelect ? "pointer" : "default",
        }}
      >
        <div style={{ padding: "8px 12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, marginRight: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              {canSelect && (
                <div 
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                    isSelected ? "bg-rose-500 border-rose-500 shadow-sm" : "bg-white border-slate-300 hover:border-rose-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newItem = { folio, productId: item.product.id, plate: item.plate };
                    if (isSelected) {
                      setItemsSelectedForCancellation(prev => prev.filter(it => !(it.folio === folio && it.productId === item.product.id && it.plate === item.plate)));
                    } else {
                      setItemsSelectedForCancellation(prev => [...prev, newItem]);
                    }
                  }}
                >
                  {isSelected && <IonIcon icon={checkmarkOutline} className="text-white text-xs font-black" />}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {item.plate > 0 && (
                    <IonBadge
                      style={{
                        background: getComensalColor(item.plate),
                        fontSize: "0.65rem",
                        fontWeight: "900",
                        borderRadius: "6px",
                        padding: "2px 6px",
                      }}
                    >
                      C{item.plate}
                    </IonBadge>
                  )}
                  <h3
                    style={{
                      fontWeight: "900",
                      margin: 0,
                      fontSize: "0.95rem",
                      color: isCancelled ? "#94a3b8" : isPendingCancellation ? "#b45309" : "#1e293b",
                      lineHeight: "1.2",
                      textDecoration: isCancelled ? "line-through" : "none",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {getFormattedProductName(item.product)}
                  </h3>
                  {isPendingCancellation && (
                    <IonBadge color="warning" style={{ fontSize: "0.6rem", fontWeight: "bold" }}>EN ESPERA ⏳</IonBadge>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontWeight: "bold",
                    }}
                  >
                    ${item.product.price.toFixed(2)}
                  </span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.7rem" }}>•</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: isCancelled ? "#94a3b8" : isPendingCancellation ? "#b45309" : "#10b981",
                      fontWeight: "900",
                      textDecoration: isCancelled ? "line-through" : "none",
                    }}
                  >
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonText
                style={{
                  fontWeight: "900",
                  fontSize: "1.1rem",
                  color: isCancelled ? "#94a3b8" : isPendingCancellation ? "#b45309" : "#1e293b",
                }}
              >
                x{item.quantity}
              </IonText>

              {isPendingCancellation && folio !== undefined && (
                <div className="flex gap-1">
                   <IonButton
                      fill="clear"
                      color="danger"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // This will show a PIN modal to authorize
                        setPendingCancellationTarget({ type: 'item', id: selectedTable!.id, items: [{ folio, productId: item.product.id, plate: item.plate }] });
                        setShowAuthorizeCancellationModal(true);
                      }}
                    >
                      <IonIcon icon={shieldCheckmarkOutline} slot="icon-only" />
                   </IonButton>
                   <IonButton
                      fill="clear"
                      color="medium"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevertItemCancellation(selectedTable!.id, selectedTable, folio, item.product.id, item.plate);
                      }}
                    >
                      <IonIcon icon={refreshOutline} slot="icon-only" />
                   </IonButton>
                </div>
              )}
            </div>
          </div>

          {item.notes && (
            <div
              style={{
                marginTop: "8px",
                background: "#fff7ed",
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "0.8rem",
                color: "#c2410c",
                border: "1px solid #ffedd5",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <IonIcon
                icon={chatbubbleEllipsesOutline}
                style={{ fontSize: "0.9rem", marginTop: "2px" }}
              />
              <span style={{ fontWeight: "bold", lineHeight: "1.4" }}>
                {item.notes}
              </span>
            </div>
          )}

          {isCancelled && (
            <div
              style={{
                marginTop: "8px",
                background: "#fef2f2",
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "0.75rem",
                color: "#b91c1c",
                border: "1px solid #fee2e2",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IonIcon icon={closeCircleOutline} />
                CANCELADO
              </div>
              <div style={{ marginTop: "2px" }}>
                Motivo: {item.cancellationReason}
              </div>
              {item.cancelledBy && (
                <div style={{ marginTop: "2px", opacity: 0.8 }}>
                  Por: {item.cancelledBy.name}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReview = () => {
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );
    const comensales = Array.from(new Set(cart.map((item) => item.plate))).sort(
      (a: any, b: any) => a - b,
    ) as number[];

    return (
      <IonPage>
        {appMode !== "gestion_cuentas" && (
          <IonHeader className="ion-no-border">
            <IonToolbar
              style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}
            >
            <IonButtons slot="start">
              <IonButton onClick={() => setAppMode("menu")}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
              <div
                style={{
                  marginLeft: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "900",
                    color: "white",
                  }}
                >
                  Mesa {selectedTable?.label}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    color: "rgba(255,255,255,0.8)",
                    textTransform: "uppercase",
                  }}
                >
                  {currentUser?.name}
                </span>
              </div>
            </IonButtons>
            <IonTitle style={{ fontSize: "1rem", fontWeight: "bold" }}>
              Revisar Pedido
            </IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() => setAppMode("floorplan")}
                color="light"
                fill="clear"
              >
                <IonIcon icon={closeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        )}
        <IonContent style={{ "--background": "#f1f5f9" }}>
          {/* Standardized Comensal Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              gap: "10px",
              overflowX: "auto",
              background: "white",
              borderBottom: "1px solid #e2e8f0",
              position: "sticky",
              top: 0,
              zIndex: 10,
              scrollbarWidth: "none",
            }}
            className="no-scrollbar"
          >
            <div
              onClick={() => {
                if (
                  window.confirm(
                    "⚠️ ¿Estas seguro de reiniciar este pedido? (Se eliminarán los productos de la memoria)",
                  )
                ) {
                  setCart([]);
                  setReviewComensal(1);
                  setGeneralNotes("");
                  setConfirmRestart(false);
                  const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
  setSelectedTableGestion(null);
}
setCheckoutReturnMode(null);
                }
              }}
              style={{
                minWidth: "140px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fee2e2",
                color: "#dc2626",
                fontWeight: "900",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "all 0.2s ease",
                border: "1px solid #fecaca",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.1)",
                flexShrink: 0,
              }}
            >
              Reiniciar Pedido 🔄
            </div>
            {comensales
              .filter((n) => n > 0)
              .map((num) => (
                <div
                  key={num}
                  onClick={() => setReviewComensal(num)}
                  style={{
                    minWidth: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      reviewComensal === num
                        ? getComensalColor(num)
                        : "#f8fafc",
                    color: reviewComensal === num ? "white" : "#64748b",
                    fontWeight: "900",
                    fontSize: "1.1rem",
                    transition: "all 0.2s ease",
                    border:
                      reviewComensal === num ? "none" : "1px solid #e2e8f0",
                    cursor: "pointer",
                    boxShadow:
                      reviewComensal === num
                        ? `0 4px 10px ${getComensalColor(num)}44`
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {num}
                </div>
              ))}
            <div
              onClick={() => setReviewComensal("summary")}
              style={{
                minWidth: "100px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  reviewComensal === "summary" ? "#0f172a" : "#f8fafc",
                color: reviewComensal === "summary" ? "white" : "#64748b",
                fontWeight: "900",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "all 0.2s ease",
                boxShadow:
                  reviewComensal === "summary"
                    ? "0 4px 12px -2px rgba(15, 23, 42, 0.4)"
                    : "none",
                border:
                  reviewComensal === "summary" ? "none" : "1px solid #e2e8f0",
                cursor: "pointer",
                marginLeft: "auto",
                flexShrink: 0,
              }}
            >
              Resumen
            </div>
          </div>

          {/* Tab Content */}
          {reviewComensal !== "summary" ? (
            <div
              key={reviewComensal}
              style={{ animation: "fadeIn 0.3s ease-out" }}
            >
              {(() => {
                const comensalNum = reviewComensal as number;
                const allComensalItems = cart.filter(
                  (item) => item.plate === comensalNum,
                );
                const entradas = allComensalItems.filter(
                  (item) => item.product.subcategory === "Entradas",
                );
                const otherItems = allComensalItems.filter(
                  (item) => item.product.subcategory !== "Entradas",
                );

                if (allComensalItems.length === 0) {
                  return (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <IonIcon
                        icon={restaurantOutline}
                        style={{
                          fontSize: "3rem",
                          marginBottom: "12px",
                          opacity: 0.3,
                        }}
                      />
                      <p style={{ fontWeight: "bold" }}>
                        No hay platillos para este comensal
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      margin: "12px",
                      background: "white",
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background:
                          comensalNum === 0
                            ? "#1e293b"
                            : getComensalColor(comensalNum),
                        color: "white",
                      }}
                    >
                      <IonText
                        style={{
                          fontSize: "1rem",
                          fontWeight: "900",
                          letterSpacing: "1px",
                        }}
                      >
                        {comensalNum === 0
                          ? "PARA COMPARTIR 🥗"
                          : `PEDIDO COMENSAL ${comensalNum}`}
                      </IonText>
                      <div style={{ flex: 1 }}></div>
                      <IonBadge
                        style={{
                          "--background": "rgba(255,255,255,0.2)",
                          color: "white",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          padding: "4px 10px",
                        }}
                      >
                        {allComensalItems.length}{" "}
                        {allComensalItems.length === 1 ? "Ítem" : "Ítems"}
                      </IonBadge>
                    </div>

                    <IonList style={{ background: "transparent", padding: 0 }}>
                      {entradas.length > 0 && (
                        <>
                          <div
                            style={{
                              padding: "8px 20px",
                              background: "#fffbeb",
                              borderBottom: "1px solid #fef3c7",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <IonIcon
                              icon={restaurantOutline}
                              style={{ fontSize: "0.9rem", color: "#b45309" }}
                            />
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "900",
                                color: "#b45309",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                              }}
                            >
                              Entradas / Principios
                            </span>
                          </div>
                          {entradas.map((item, idx) =>
                            renderReviewItem(item, idx),
                          )}
                        </>
                      )}

                      {otherItems.length > 0 && (
                        <>
                          {entradas.length > 0 && (
                            <div
                              style={{
                                padding: "8px 20px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <IonIcon
                                icon={fastFoodOutline}
                                style={{ fontSize: "0.9rem", color: "#64748b" }}
                              />
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: "900",
                                  color: "#64748b",
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                }}
                              >
                                Platos Fuertes / Otros
                              </span>
                            </div>
                          )}
                          {otherItems.map((item, idx) =>
                            renderReviewItem(item, idx),
                          )}
                        </>
                      )}
                    </IonList>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ animation: "fadeIn 0.3s ease-out" }}>
              <div className="ion-padding">
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IonIcon
                        icon={chatbubbleEllipsesOutline}
                        style={{ color: "#3b82f6", fontSize: "1.2rem" }}
                      />
                    </div>
                    <div>
                      <IonLabel
                        style={{
                          fontWeight: "900",
                          color: "#1e293b",
                          fontSize: "1rem",
                          display: "block",
                        }}
                      >
                        Observaciones Generales
                      </IonLabel>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          fontWeight: "bold",
                        }}
                      >
                        Instrucciones especiales para todo el pedido
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Ej: Mesa VIP, Sacar rápido, Familia del dueño..."
                    style={{
                      width: "100%",
                      height: "120px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "16px",
                      fontSize: "1rem",
                      outline: "none",
                      background: "#f8fafc",
                      color: "#1e293b",
                      fontWeight: "500",
                      lineHeight: "1.5",
                    }}
                  />
                </div>
              </div>

              <div className="ion-padding-horizontal ion-padding-bottom">
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: "24px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <IonText
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                      }}
                    >
                      Resumen del Pedido
                    </IonText>
                    <IonBadge
                      color="success"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {cart.length} Ítems
                    </IonBadge>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  ></div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <IonText
                        style={{
                          color: "white",
                          fontWeight: "900",
                          fontSize: "2.5rem",
                        }}
                      >
                        ${totalPrice.toFixed(2)}
                      </IonText>
                      <IonText
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        Total con IVA
                      </IonText>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <IonText
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          display: "block",
                        }}
                      >
                        Mesa {selectedTable?.label}
                      </IonText>
                      <IonText
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {comensales.length} Comensales
                      </IonText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </IonContent>
        <IonFooter className="ion-no-border">
          <IonToolbar
            className="ion-padding"
            style={{ "--background": "#f8fafc" }}
          >
            {(() => {
              const isTakeout = selectedTable?.zone.toLowerCase().includes("llevar") || selectedTable?.zone.toLowerCase().includes("domicilio") || selectedTable?.zone.toLowerCase().includes("mostrador");
              return (
                <IonButton
                  expand="block"
                  color={isTakeout ? "primary" : "success"}
                  onClick={() => {
                    if (isTakeout && appMode === "gestion_cuentas") {
                      generateOrder(true);
                    } else {
                      generateOrder(false);
                    }
                  }}
                  disabled={isGeneratingOrder}
                  style={{
                    height: "56px",
                    "--border-radius": "16px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {isGeneratingOrder ? (
                    <IonSpinner name="crescent" color="light" />
                  ) : (
                    <>
                      <IonIcon icon={isTakeout ? "wallet-outline" : restaurantOutline} slot="start" />
                      {isTakeout && appMode === "gestion_cuentas" ? "Confirmar, Enviar y Cobrar" : "Confirmar y Enviar Pedido"}
                    </>
                  )}
                </IonButton>
              );
            })()}
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  };

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
      
    />
  );;

  const renderCheckout = () => (
    <CheckoutView
      cancellationReason={cancellationReason}
      checkoutFallbackItems={checkoutFallbackItems}
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
      
    />
  );;

  const renderUsersManagementPanel = () => {
    const currentTenantUsers = users;

    const cycleAvatar = (userId: string, currentAvatar: string) => {
      const avatars = [
        "fa-solid fa-person-walking",
        "fa-solid fa-person-running",
        "fa-solid fa-bell-concierge",
        "fa-solid fa-cash-register",
        "fa-solid fa-user-tie",
        "fa-solid fa-user-shield",
        "fa-solid fa-hat-cowboy",
        "fa-solid fa-laptop-code"
      ];
      const index = avatars.indexOf(currentAvatar);
      const nextIndex = (index + 1) % avatars.length;
      handleCellChange(userId, "avatar", avatars[nextIndex]);
    };

    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        {/* Header Action Card */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📊 Tabla de Usuarios (Estilo Excel)
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic directamente en cualquier celda para modificar el Nombre, PIN, Rol o Sucursal. Los cambios se guardan automáticamente.
            </p>
          </div>
          <button
            onClick={handleAddRow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-2xl transition duration-200 flex items-center gap-2 text-sm shadow-md shadow-indigo-200"
          >
            <i className="fa-solid fa-plus text-xs" />
            Agregar Nueva Fila
          </button>
        </div>

        {/* Guía de Inicio Rápido para Empleados */}
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
          <button
            onClick={() => setShowEmployeeGuide(!showEmployeeGuide)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <i className="fa-solid fa-graduation-cap text-base" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  📖 Guía de Inicio Rápido para Colaboradores
                </h4>
                <p className="text-xs text-slate-500">
                  Instrucciones rápidas para el uso correcto de roles, accesos y turnos.
                </p>
              </div>
            </div>
            <div className="text-slate-400 hover:text-slate-600 transition">
              <i className={`fa-solid ${showEmployeeGuide ? "fa-chevron-up" : "fa-chevron-down"} text-sm`} />
            </div>
          </button>

          {showEmployeeGuide && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-indigo-100/60 text-slate-600 text-xs leading-relaxed animate-fadeIn">
              <div className="space-y-2">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-user-gear text-indigo-500" /> 1. Roles y Privilegios
                </h5>
                <ul className="space-y-1.5 list-disc list-inside text-slate-500">
                  <li><strong className="text-slate-700">Administrador:</strong> Acceso total al panel, inventarios y finanzas.</li>
                  <li><strong className="text-slate-700">Cajero:</strong> Encargado de ventas, cobros y arqueos de caja.</li>
                  <li><strong className="text-slate-700">Mesero:</strong> Registra comandas directo desde el mapa de mesas.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-key text-indigo-500" /> 2. PIN y Seguridad
                </h5>
                <p className="text-slate-500">
                  Cada empleado cuenta con un <strong className="text-slate-700">PIN personal e intransferible</strong> para iniciar sesión. Es indispensable para autorizar cancelaciones de comandas y cortes de caja.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-pen-to-square text-indigo-500" /> 3. Modificaciones Rápidas
                </h5>
                <p className="text-slate-500">
                  Como administrador, puedes editar la información de cualquier colaborador haciendo clic directo sobre la celda correspondiente en la tabla estilo Excel. Los cambios se sincronizan al instante en la base de datos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Excel Table Container */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] lg:min-w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[80px] min-w-[80px] text-center">Avatar</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[120px] min-w-[120px]">ID de Acceso</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider min-w-[220px]">Nombre Completo</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[130px] min-w-[130px]">Rol</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[100px] min-w-[100px]">PIN</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[240px] min-w-[240px]">Sucursal Asignada</th>
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider w-[100px] min-w-[100px] text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTenantUsers.map((user) => {
                  const isProtected = user.id.endsWith("-admin") || user.id.endsWith("-sistemas") || user.id.endsWith("-manager");
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar Cycler */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => cycleAvatar(user.id, user.avatar)}
                          className="w-9 h-9 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center text-base hover:bg-indigo-50 hover:text-indigo-600 transition"
                          title="Haz clic para cambiar de avatar"
                        >
                          <i className={user.avatar || "fa-solid fa-user"} />
                        </button>
                      </td>

                      {/* User ID (Read-only) */}
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-400 select-all font-semibold">
                        {user.id.replace(`${user.tenantId}-`, "")}
                      </td>

                      {/* Name Input */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          defaultValue={user.name}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value.trim() !== user.name) {
                              handleCellChange(user.id, "name", e.target.value.trim());
                            }
                          }}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-semibold outline-none transition text-sm"
                        />
                      </td>

                      {/* Role Select */}
                      <td className="py-2.5 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleCellChange(user.id, "role", e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-semibold outline-none cursor-pointer text-sm"
                        >
                          <option value="mesero">Mesero 🏃</option>
                          <option value="cajero">Cajero 💵</option>
                          <option value="admin">Admin 👔</option>
                        </select>
                      </td>

                      {/* PIN Input */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          maxLength={4}
                          defaultValue={user.pin}
                          onBlur={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length === 4 && val !== user.pin) {
                              handleCellChange(user.id, "pin", val);
                            } else if (val !== user.pin) {
                              e.target.value = user.pin; // Revert
                              triggerAppNotification("⚠️ Error", "El PIN debe tener exactamente 4 dígitos.", "warning");
                            }
                          }}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-mono font-bold outline-none transition text-sm"
                        />
                      </td>

                      {/* Tenant/Branch Select */}
                      <td className="py-2.5 px-4">
                        <select
                          value={user.tenantId || selectedTenant.id}
                          onChange={(e) => handleCellChange(user.id, "tenantId", e.target.value)}
                          className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-800 font-semibold outline-none cursor-pointer text-sm"
                        >
                          {(() => {
                            const ownerKey = restrictedOwnerKey || activeOwnerFilter || selectedTenant.ownerKey;
                            const isSistemas = currentUser?.id.endsWith("-sistemas") || isSystemsMode;
                            const allowedCompanies = COMPANY_CATALOG.filter((c) => {
                              if (isSistemas) return true;
                              if (ownerKey && c.ownerKey === ownerKey) return true;
                              return false;
                            });
                            return allowedCompanies.map((tenant) => (
                              <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                              </option>
                            ));
                          })()}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center">
                        {isProtected ? (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-lg select-none">
                            Fijo
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteRow(user.id)}
                            className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/50 w-8 h-8 rounded-xl flex items-center justify-center transition"
                            title="Eliminar este usuario"
                          >
                            <i className="fa-solid fa-trash-can text-xs" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
      
    />
  );;



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
      
    />
  );;

  const renderSuppliers = () => {
    const handleSaveSupplier = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = {
        name: (form.elements.namedItem("supName") as HTMLInputElement).value,
        phone: (form.elements.namedItem("supPhone") as HTMLInputElement).value,
        email: (form.elements.namedItem("supEmail") as HTMLInputElement).value,
        address: (form.elements.namedItem("supAddress") as HTMLInputElement)
          .value,
        category: (form.elements.namedItem("supCategory") as HTMLSelectElement)
          .value,
        notes: (form.elements.namedItem("supNotes") as HTMLTextAreaElement)
          .value,
        frequency:
          (form.elements.namedItem("supFrequency") as HTMLSelectElement)
            .value || "diario",
      };

      if (!data.name) {
        alert("El nombre es requerido");
        return;
      }

      try {
        if (supplierModal.supplier) {
          await updateSupplierInFirebase(supplierModal.supplier.id, data);
        } else {
          await addSupplierToFirebase(data);
        }
        setSupplierModal({ isOpen: false, supplier: null });
      } catch (err) {
        console.error("Error al guardar proveedor", err);
      }
    };

    const handleDeleteSupplier = async (id: string) => {
      if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
        try {
          await deleteSupplierFromFirebase(id);
        } catch (err) {
          console.error("Error al eliminar proveedor", err);
        }
      }
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Catálogo de Proveedores",
        subtitle: `Proveedores registrados: ${suppliers.length}`,
        showBack: true,
        onBack: () => setAppMode("floorplan"),
        actions: (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSupplierModal({ isOpen: true, supplier: null })}
            className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md cursor-pointer mr-2"
          >
            ➕ Nuevo Proveedor
          </motion.button>
        )
      })}
        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >
          <div className="max-w-6xl mx-auto py-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                🤝 Proveedores Registrados ({suppliers.length})
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Administra los proveedores que surten insumos, abarrotes y
                bebidas a tu restaurante.
              </p>

              {suppliers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IonIcon
                      icon={businessOutline}
                      style={{ fontSize: "28px" }}
                    />
                  </div>
                  <h3 className="font-bold text-slate-700">Sin Proveedores</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Aún no has agregado proveedores a tu catálogo.
                  </p>
                  <button
                    onClick={() =>
                      setSupplierModal({ isOpen: true, supplier: null })
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-6 rounded-xl transition cursor-pointer"
                  >
                    Agregar Primer Proveedor
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-bold text-slate-600">Nombre</th>
                        <th className="p-4 font-bold text-slate-600">
                          Categoría
                        </th>
                        <th className="p-4 font-bold text-slate-600">
                          Teléfono
                        </th>
                        <th className="p-4 font-bold text-slate-600">Email</th>
                        <th className="p-4 font-bold text-slate-600">
                          Dirección
                        </th>
                        <th className="p-4 font-bold text-slate-600 text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                        >
                          <td className="p-4 font-bold text-slate-800">
                            <div>{s.name}</div>
                            {s.frequency && (
                              <div
                                className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5"
                                style={{
                                  display: "flex",
                                  gap: "3px",
                                  alignItems: "center",
                                }}
                              >
                                <span>📅</span>{" "}
                                <span>
                                  {s.frequency === "diario"
                                    ? "Surtido Diario"
                                    : s.frequency === "semanal"
                                      ? "Surtido Semanal"
                                      : s.frequency === "tres_dias"
                                        ? "Cada 3 Días"
                                        : s.frequency === "quincenal"
                                          ? "Quincenal"
                                          : s.frequency}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                              {s.category || "General"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">
                            {s.phone || "-"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {s.email || "-"}
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">
                            {s.address || "-"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  setSupplierModal({
                                    isOpen: true,
                                    supplier: s,
                                  })
                                }
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteSupplier(s.id)}
                                className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Form Modal */}
<SupplierModal
          supplierModal={supplierModal}
          setSupplierModal={setSupplierModal}
          triggerAppNotification={triggerAppNotification}
        />
        </IonContent>
      </IonPage>
    );
  };

  const renderCustomers = () => {
    const handleSaveCustomer = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = {
        name: (form.elements.namedItem("custName") as HTMLInputElement).value,
        phone: (form.elements.namedItem("custPhone") as HTMLInputElement).value,
        email: (form.elements.namedItem("custEmail") as HTMLInputElement).value,
        visits:
          parseInt(
            (form.elements.namedItem("custVisits") as HTMLInputElement).value,
          ) || 0,
        notes: (form.elements.namedItem("custNotes") as HTMLTextAreaElement)
          .value,
        addresses: customerModalAddresses,
      };

      if (!data.name) {
        alert("El nombre es requerido");
        return;
      }

      try {
        if (customerModal.customer) {
          await updateCustomerInFirebase(customerModal.customer.id, data);
        } else {
          await addCustomerToFirebase(data);
        }
        setCustomerModal({ isOpen: false, customer: null });
      } catch (err) {
        console.error("Error al guardar cliente", err);
      }
    };

    const handleDeleteCustomer = async (id: string) => {
      if (window.confirm("¿Seguro que deseas eliminar este cliente?")) {
        try {
          await deleteCustomerFromFirebase(id);
        } catch (err) {
          console.error("Error al eliminar cliente", err);
        }
      }
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Catálogo de Clientes",
        subtitle: `Clientes registrados: ${customers.length}`,
        showBack: true,
        onBack: () => setAppMode("floorplan"),
        actions: (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCustomerModal({ isOpen: true, customer: null })}
            className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md cursor-pointer mr-2"
          >
            ➕ Nuevo Cliente
          </motion.button>
        )
      })}
        <IonContent
          className="ion-padding"
          style={{ "--background": "#f8fafc" }}
        >
          <div className="max-w-6xl mx-auto py-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                👥 Clientes del Restaurante ({customers.length})
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Lleva un registro de tus clientes preferidos, sus visitas
                acumuladas y preferencias especiales.
              </p>

              {customers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IonIcon
                      icon={peopleOutline}
                      style={{ fontSize: "28px" }}
                    />
                  </div>
                  <h3 className="font-bold text-slate-700">Sin Clientes</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Aún no has agregado clientes a tu catálogo.
                  </p>
                  <button
                    onClick={() =>
                      setCustomerModal({ isOpen: true, customer: null })
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-6 rounded-xl transition cursor-pointer"
                  >
                    Agregar Primer Cliente
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-bold text-slate-600">Nombre</th>
                        <th className="p-4 font-bold text-slate-600">
                          Teléfono
                        </th>
                        <th className="p-4 font-bold text-slate-600">Email</th>
                        <th className="p-4 font-bold text-slate-600">
                          Visitas Totales
                        </th>
                        <th className="p-4 font-bold text-slate-600">
                          Perfil / Notas
                        </th>
                        <th className="p-4 font-bold text-slate-600 text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                        >
                          <td className="p-4 font-bold text-slate-800">
                            {c.name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {c.phone || "-"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {c.email || "-"}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                              ⭐ {c.visits || 0} visitas
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">
                            {c.notes || "-"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  setCustomerModal({
                                    isOpen: true,
                                    customer: c,
                                  })
                                }
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(c.id)}
                                className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Customer Form Modal */}
<CustomerModal
          customerModal={customerModal}
          setCustomerModal={setCustomerModal}
          triggerAppNotification={triggerAppNotification}
        />
        </IonContent>
      </IonPage>
    );
  };

  const renderExpenses = () => {
    // Save or Edit handler
    const handleSaveExpense = async (e: React.FormEvent) => {
      e.preventDefault();
      const amountNum = parseFloat(expenseAmount);
      if (!expenseConcept.trim()) {
        alert("El concepto del gasto es requerido ⚠️");
        return;
      }
      if (isNaN(amountNum) || amountNum <= 0) {
        alert("Por favor ingrese un monto válido mayor a 0 💰");
        return;
      }

      const expenseData = {
        concept: expenseConcept.trim(),
        amount: amountNum,
        reference: expenseReference.trim(),
        category: expenseCategory,
        createdBy: currentUser?.name || "Cajero",
        userId: currentUser?.id || "unauthenticated",
        sessionId: cashierSessions.find((s) => s.status === "open")?.id || null,
      };

      try {
        if (selectedExpenseForEdit) {
          await updateExpenseInFirebase(selectedExpenseForEdit.id, expenseData);
          setMenuToastMessage(
            `✅ Gasto actualizado: ${expenseConcept} por $${amountNum.toFixed(2)}`,
          );

          if (
            expenseEnableNotifications &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Gastos Sincronizados ⚡", {
              body: `Se ha actualizado un gasto: "${expenseConcept}" por $${amountNum.toFixed(2)}`,
              icon: "/public/icon.png",
            });
          }
        } else {
          await addExpenseToFirebase(expenseData);
          setMenuToastMessage(
            `🎉 Gasto registrado con éxito: ${expenseConcept} por $${amountNum.toFixed(2)}`,
          );

          if (
            expenseEnableNotifications &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Nuevo Gasto Sincronizado ⚡", {
              body: `Se registró un nuevo gasto en vivo: "${expenseConcept}" por $${amountNum.toFixed(2)}`,
              icon: "/public/icon.png",
            });
          }
        }
        setShowMenuToast(true);
        // Reset form fields
        setExpenseConcept("");
        setExpenseAmount("");
        setExpenseReference("");
        setExpenseCategory("Varios");
        setSelectedExpenseForEdit(null);
        setShowExpenseModal(false);
      } catch (err: any) {
        console.error("Error al registrar gasto:", err);
        setMenuToastMessage(`❌ Error al guardar gasto: ${err.message}`);
        setShowMenuToast(true);
      }
    };

    const handlePrintExpense = (exp: any) => {
      const expDate = exp.createdAt ? new Date(exp.createdAt) : new Date();
      const formattedDate = expDate.toLocaleDateString("es-MX");
      const formattedTime = expDate.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprobante de Egreso</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; margin: 20px; font-size: 14px; max-width: 400px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed black; padding-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .label { font-weight: bold; }
            .value { text-align: right; word-wrap: break-word; max-width: 60%; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; border-top: 1px dashed black; padding-top: 10px; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; text-align: center; border-top: 1px solid black; padding-top: 5px; font-size: 12px; }
            @media print {
              body { margin: 0; padding: 10px; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">COMPROBANTE DE EGRESO</div>
            <div>Fecha: ${formattedDate} ${formattedTime}</div>
            <div>Folio: ${exp.uuid ? exp.uuid.substring(0, 8) : exp.id.substring(0, 8)}</div>
          </div>
          
          <div class="row">
            <span class="label">Concepto:</span>
            <span class="value">${exp.concept}</span>
          </div>
          <div class="row">
            <span class="label">Categoría:</span>
            <span class="value">${exp.category || "Varios"}</span>
          </div>
          <div class="row">
            <span class="label">Referencia:</span>
            <span class="value">${exp.reference || "N/A"}</span>
          </div>
          <div class="row">
            <span class="label">Responsable:</span>
            <span class="value">${exp.createdBy || "Sistema"}</span>
          </div>

          <div class="total">
            TOTAL: $${Number(exp.amount || 0).toFixed(2)}
          </div>

          <div class="signatures">
            <div class="signature-box">
              <br/>
              Entregó
            </div>
            <div class="signature-box">
              <br/>
              Recibió
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(printHtml);
      printWindow.document.close();
    };

    const handleDeleteExpense = async (expense: any) => {
      if (
        window.confirm(
          `⚠️ ¿Seguro que deseas eliminar el gasto "${expense.concept}" por $${expense.amount.toFixed(2)}?\nEsta acción es irreversible.`,
        )
      ) {
        try {
          await deleteExpenseFromFirebase(expense.id);
          setMenuToastMessage(
            `🗑️ Gasto eliminado con éxito: ${expense.concept}`,
          );
          setShowMenuToast(true);

          if (
            expenseEnableNotifications &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Gasto Eliminado 🗑️", {
              body: `Se eliminó el gasto: "${expense.concept}" por $${expense.amount}`,
              icon: "/public/icon.png",
            });
          }
        } catch (err: any) {
          console.error("Error al eliminar gasto:", err);
          setMenuToastMessage(`❌ Error al eliminar: ${err.message}`);
          setShowMenuToast(true);
        }
      }
    };

    const requestNotificationPermission = () => {
      if (typeof Notification !== "undefined") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setMenuToastMessage(
              "🔔 ¡Notificaciones activadas con éxito! Estás sincronizado en tiempo real.",
            );
            setShowMenuToast(true);
          } else {
            setMenuToastMessage("⚠️ Permiso de notificaciones denegado.");
            setShowMenuToast(true);
          }
        });
      } else {
        alert(
          "Este navegador no soporta notificaciones de sistema, pero recibirás alertas en vivo dentro de la app. 📲",
        );
      }
    };

    const currentOpDay = getOperatingDay(new Date());
    const filteredExpenses = expenses
      .filter((exp) => {
        const matchSearch =
          (exp.concept || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.reference || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.category || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.uuid || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase()) ||
          (exp.createdBy || "")
            .toLowerCase()
            .includes(expenseSearch.toLowerCase());

        const matchCategory =
          expenseCategoryFilter === "TODAS" ||
          exp.category === expenseCategoryFilter;

        const isToday = exp.createdAt ? getOperatingDay(exp.createdAt) === currentOpDay : false;
        const matchTab = expenseActiveTab === "hoy" ? isToday : !isToday;

        return matchSearch && matchCategory && matchTab;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    // Sum of expenses calculations
    const totalExpensesSum = filteredExpenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0,
    );
    const totalCount = filteredExpenses.length;

    // Categorized breakdown
    const categoryTotals = filteredExpenses.reduce(
      (acc: { [key: string]: number }, exp) => {
        const cat = exp.category || "Varios";
        acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
        return acc;
      },
      {},
    );

    const groupedFilteredExpenses = filteredExpenses.reduce(
      (acc: { [key: string]: typeof filteredExpenses }, exp) => {
        const cat = exp.category || "Varios";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(exp);
        return acc;
      },
      {} as Record<string, typeof filteredExpenses>,
    );

    const sortedCategories = Object.keys(groupedFilteredExpenses).sort(
      (a, b) => {
        // "Varios" goes first always
        if (a === "Varios") return -1;
        if (b === "Varios") return 1;
        return a.localeCompare(b);
      },
    );

    const openCreateModalWithCategory = (cat: string) => {
      setSelectedExpenseForEdit(null);
      setExpenseConcept("");
      setExpenseAmount("");
      setExpenseReference("");
      setExpenseCategory(cat);
      setShowExpenseModal(true);
    };

    const openCreateModal = () => {
      setSelectedExpenseForEdit(null);
      setExpenseConcept("");
      setExpenseAmount("");
      setExpenseReference("");
      setExpenseCategory("Varios");
      setShowExpenseModal(true);
    };

    const openEditModal = (expense: any) => {
      setSelectedExpenseForEdit(expense);
      setExpenseConcept(expense.concept);
      setExpenseAmount(String(expense.amount));
      setExpenseReference(expense.reference || "");
      setExpenseCategory(expense.category || "Varios");
      setShowExpenseModal(true);
    };

    return (
      <IonPage>
      {renderMaterialHeader({
        title: "Egresos y Gastos 💸",
        subtitle: `Gastos de ${selectedTenant?.name || "Sucursal"}`,
        showBack: true,
        onBack: () => setAppMode("floorplan"),
        actions: (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 transition border-none shadow-md cursor-pointer mr-2"
          >
            ➕ Registrar Gasto
          </motion.button>
        )
      })}

        <IonContent
          className="ion-no-padding"
          style={{ "--background": "#f8fafc", paddingLeft: 0, paddingRight: 0 }}
        >
          <div className="w-full mx-auto py-4 space-y-6 px-0">
            <hr className="border-slate-200 border-dashed" />

            {/* FILTERS AND SEARCH COMPONENT */}
            <div className="flex flex-col gap-4">
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="🔎 Buscar por concepto, referencia o cajero..."
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-2xl outline-none focus:border-red-500 transition-all shadow-sm"
                />
                <button
                  onClick={() => setShowExpenseFilter(!showExpenseFilter)}
                  className={`p-3 border rounded-2xl transition shadow-sm cursor-pointer flex items-center justify-center ${showExpenseFilter ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  title="Filtros"
                >
                  <span className="text-lg">🎛️</span>
                </button>
              </div>

              {/* Category selector */}
              {showExpenseFilter && (
                <div className="w-full md:w-1/3 flex items-center gap-2 self-end">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Filtrar:
                  </span>
                  <select
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-xs py-3 px-3 rounded-2xl outline-none focus:border-red-500 transition cursor-pointer shadow-sm"
                  >
                    <option value="TODAS">📁 Todas las Categorías</option>
                    <option value="Varios">💼 Varios / Operación</option>
                    <option value="Servicios">
                      ⚡ Servicios (Luz, Agua, Gas)
                    </option>
                    <option value="Insumos">🍅 Insumos / Materia Prima</option>
                    <option value="Sueldos">👥 Sueldos / Nómina</option>
                    <option value="Renta">🏢 Renta / Local</option>
                    <option value="Mantenimiento">🔧 Mantenimiento</option>
                    <option value="Ajustes">🪙 Ajustes de Caja</option>
                    <option value="Otros">📦 Otros Egresos</option>
                  </select>
                </div>
              )}
            </div>

            {/* TABS SELECTOR */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner max-w-md mx-auto border border-slate-200/50">
              <button
                type="button"
                onClick={() => setExpenseActiveTab("hoy")}
                style={{
                  background: expenseActiveTab === "hoy" ? "#dc2626" : "transparent",
                  color: expenseActiveTab === "hoy" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: expenseActiveTab === "hoy" ? "0 4px 10px rgba(220, 38, 38, 0.25)" : "none",
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight uppercase flex items-center justify-center gap-1.5 outline-none"
              >
                📅 Hoy
              </button>
              <button
                type="button"
                onClick={() => setExpenseActiveTab("historial")}
                style={{
                  background: expenseActiveTab === "historial" ? "#dc2626" : "transparent",
                  color: expenseActiveTab === "historial" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: expenseActiveTab === "historial" ? "0 4px 10px rgba(220, 38, 38, 0.25)" : "none",
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight uppercase flex items-center justify-center gap-1.5 outline-none"
              >
                🏛️ Historial
              </button>
            </div>

            {/* EXPENSES DATA TABLE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
                    Base de Datos de Egresos 🧾
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Resumen de transacciones con ID de tabla relacional y marcas
                    de tiempo
                  </p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 border-none outline-none"
                >
                  <span>➕ Nuevo</span>
                </button>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <span className="text-4xl block mb-2 select-none">💸</span>
                  <h4 className="font-black text-slate-750 text-sm">
                    Sin Gastos Registrados
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 font-semibold">
                    No se encontraron gastos que coincidan con tus criterios.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-md transition cursor-pointer text-center uppercase tracking-wider"
                  >
                    Registrar Primer Gasto
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                  <table className="w-full border-collapse text-left text-sm bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-xs tracking-wider">
                        <th className="p-4 w-1/2">Concepto y Referencia</th>
                        <th className="p-4 text-center">Registro</th>
                        <th className="p-4 text-right">Monto</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>

                    {sortedCategories.map((cat) => {
                      const catExpenses = groupedFilteredExpenses[cat];
                      const catTotal = categoryTotals[cat] || 0;
                      // Determine Icon for Category
                      const iconMap: Record<string, string> = {
                        Varios: "💼",
                        Servicios: "⚡",
                        Insumos: "🍅",
                        Sueldos: "👥",
                        Renta: "🏢",
                        Mantenimiento: "🔧",
                        Ajustes: "🪙",
                        Otros: "📦",
                      };
                      const catIcon = iconMap[cat] || "💼";

                      return (
                        <tbody
                          key={cat}
                          className="divide-y divide-slate-50/80"
                        >
                          {/* CATEGORY HEADER ROW */}
                          <tr className="bg-slate-100/70 border-y border-slate-200">
                            <td colSpan={4} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-base">{catIcon}</span>
                                  <span className="font-black text-slate-800 uppercase tracking-widest text-sm">
                                    {cat}
                                  </span>
                                  <span className="bg-white border border-slate-200/80 text-xs text-slate-500 font-black px-2 py-0.5 rounded-full shadow-sm">
                                    {catExpenses.length} mov
                                    {catExpenses.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-black text-red-600 text-base bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                                    $
                                    {catTotal.toLocaleString("es-MX", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                  <button
                                    onClick={() =>
                                      openCreateModalWithCategory(cat)
                                    }
                                    className="flex justify-center items-center h-7 w-7 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition shadow-md cursor-pointer"
                                    title={`Añadir nuevo registro a ${cat}`}
                                  >
                                    <span className="text-sm font-bold leading-none select-none">
                                      ➕
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* EXPENSES ROWS FOR THIS CATEGORY */}
                          {catExpenses.map((exp) => {
                            const expDate = exp.createdAt
                              ? new Date(exp.createdAt)
                              : new Date();
                            const isEdited =
                              exp.updatedAt && exp.updatedAt !== exp.createdAt;

                            return (
                              <tr
                                key={exp.id}
                                className="hover:bg-slate-50/50 transition duration-150"
                              >
                                {/* CONCEPTO Y REFERENCIA */}
                                <td className="p-4">
                                  <div className="font-bold text-slate-800 text-base">
                                    {exp.concept}
                                  </div>
                                  {exp.reference && (
                                    <div className="text-xs text-slate-500 mt-1 flex items-start gap-1 max-w-[200px] md:max-w-xs">
                                      <span className="translate-y-px">📝</span>
                                      <span className="truncate">
                                        {exp.reference}
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-[10px] font-mono text-slate-300 mt-1.5 hidden md:flex items-center gap-1">
                                    🔑{" "}
                                    {exp.uuid
                                      ? exp.uuid.substring(0, 8)
                                      : exp.id.substring(0, 8)}
                                  </div>
                                </td>

                                {/* REGISTRO: FECHA Y USUARIO */}
                                <td className="p-4 text-center">
                                  <div className="text-sm font-bold text-slate-600">
                                    📅 {expDate.toLocaleDateString("es-MX")}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    🕒{" "}
                                    {expDate.toLocaleTimeString("es-MX", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md inline-block mt-1.5 whitespace-nowrap">
                                    👤 {exp.createdBy || "Sistema"}
                                  </div>
                                  {isEdited && (
                                    <div
                                      className="text-[9px] text-amber-500 flex items-center justify-center gap-0.5 mt-1"
                                      title={`Editado el: ${new Date(exp.updatedAt).toLocaleString()}`}
                                    >
                                      <span>✏️</span> Editado
                                    </div>
                                  )}
                                </td>

                                {/* MONTO */}
                                <td className="p-4 text-right">
                                  <span className="text-base font-black text-red-650 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100">
                                    -${Number(exp.amount || 0).toFixed(2)}
                                  </span>
                                </td>

                                {/* ACCIONES CRUD */}
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    <button
                                      onClick={() => handlePrintExpense(exp)}
                                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl font-black transition cursor-pointer shadow-sm text-xs"
                                      title="Imprimir Comprobante"
                                    >
                                      🖨️
                                    </button>
                                    <button
                                      onClick={() => openEditModal(exp)}
                                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl font-black transition cursor-pointer shadow-sm text-xs"
                                      title="Editar registro"
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExpense(exp)}
                                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-black transition cursor-pointer shadow-sm text-xs"
                                      title="Eliminar registro"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              )}

              {filteredExpenses.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between shadow-md mt-4 w-full">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-300 mb-2 md:mb-0">
                    Total Acumulado de Gastos Registrados
                  </span>
                  <span className="text-3xl font-black text-rose-400">
                    $
                    {totalExpensesSum.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 font-bold select-none py-2 border-t border-slate-100">
              Sincronización Multidispositivo de Gastos Activa por Canal de
              WebSockets 📶 • Base de Datasets MySQL Schema
            </div>
          </div>

<ExpenseModal
          showExpenseModal={showExpenseModal}
          setShowExpenseModal={setShowExpenseModal}
          expenseFormData={expenseFormData}
          setExpenseFormData={setExpenseFormData}
          triggerAppNotification={triggerAppNotification}
        />
        </IonContent>
      </IonPage>
    );
  };

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


  const renderGestionCuentas = () => {
    return (
      <IonPage>
        {renderMaterialHeader({
          title: (() => {
            if (!selectedTableGestion) return "Gestión de Cuentas (Windows)";
            const z = (selectedTableGestion.zone || "").toLowerCase();
            const l = (selectedTableGestion.label || "").toLowerCase();
            let emoji = "🍽️";
            if (z.includes("llevar") || l.includes("llevar")) emoji = "🛍️";
            else if (z.includes("domicilio") || l.includes("domicilio") || z.includes("reparto") || l.includes("reparto")) emoji = "🏍️";
            const prefix = emoji === "🍽️" ? "Mesa " : "";
            return `Gestionando Cuenta ${emoji} (${prefix}${selectedTableGestion.label || "S/N"})`;
          })(),
          subtitle: selectedTenant?.name || "Cocinet",
          showBack: !!selectedTableGestion,
          onBack: () => setSelectedTableGestion(null),
          showMenu: !selectedTableGestion,
          actions: (selectedTableGestion && isOnline) ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startVoiceRecognition}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] sm:text-xs transition-all cursor-pointer border-none shadow-md ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-amber-400 text-slate-900"
              }`}
              title={isListening ? "Detener..." : "Pedir por Voz"}
            >
              <span className="flex items-center gap-1 select-none">
                {isListening ? "⏹️ Detener" : "🎙️ Voz"}
              </span>
            </motion.button>
          ) : null
        })}
        <IonContent
          className="ion-padding"
          style={{
            "--background": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          }}
        >
          <IonGrid style={{ height: "100%", margin: 0, padding: 0 }}>
            <IonRow style={{ height: "100%" }}>
              
              {/* Mitad Izquierda: Mapa de Mesas o Menú */}
              <IonCol size="6" style={{ height: "100%", overflow: "hidden", borderRight: "2px solid #334155", paddingRight: "16px", position: "relative" }}>
                <AnimatePresence mode="wait">
                  {!selectedTableGestion ? (
                    <motion.div
                      key="mesas"
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ height: "100%", overflowY: "auto" }}
                    >
                      <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                        <h2 style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>📍 Mapa de Mesas</h2>
                      </div>
                      {zones.map((zone) => (
                        <div key={zone} className="ion-margin-bottom">
                          <IonText color="medium">
                            <h2
                              className="ion-padding-start"
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                color: "#94a3b8",
                              }}
                            >
                              {zone}
                            </h2>
                          </IonText>
                          <div style={{ display: "flex", flexWrap: "wrap", margin: "-4px" }}>
                            {effectiveTables
                              .filter((t) => t.zone === zone)
                              .sort((a, b) => {
                                const numA = parseInt(a.label.replace(/\D/g, ""), 10) || 0;
                                const numB = parseInt(b.label.replace(/\D/g, ""), 10) || 0;
                                if (numA !== numB) return numA - numB;
                                return a.label.localeCompare(b.label);
                              })
                              .map((table) => {
                                const hasActiveOrders = table.comandas.length > 0;
                                const isSelected = selectedTableGestion?.id === table.id;
                                
                                const waiterNames = Array.from(
                                  new Set(
                                    table.comandas
                                      .map((c: any) => c.createdBy?.name)
                                      .filter(Boolean),
                                  ),
                                );

                                return (
                                  <div
                                    key={`${table.id}-${table.status}-${table.comandas?.length || 0}`}
                                    className="ion-text-center"
                                    style={{ flex: "0 0 20%", maxWidth: "20%", padding: "8px 4px", minHeight: "125px" }}
                                  >
                                    <div
                                      onClick={() => { setSelectedTableGestion(table); setSelectedTableId(table.id); }}
                                      style={{
                                        width: "72px",
                                        height: "72px",
                                        margin: "0 auto",
                                        borderRadius: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                        fontWeight: "900",
                                        color: "white",
                                        position: "relative",
                                        boxShadow: isSelected ? "0 0 0 4px #3b82f6, 0 14px 28px rgba(59, 130, 246, 0.4)" : (hasActiveOrders ? "0 14px 28px rgba(225, 29, 72, 0.4)" : "0 8px 16px rgba(0,0,0,0.15)"),
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        border: isSelected ? "4px solid #60a5fa" : "4px solid rgba(255,255,255,0.4)",
                                        background: hasActiveOrders
                                          ? "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
                                          : table.status === "payment_pending"
                                            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                            : table.status === "occupied"
                                              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                                              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      }}
                                    >
                                      {table.label}
                                      {hasActiveOrders && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "-8px",
                                            background: "#1e293b",
                                            color: "white",
                                            borderRadius: "55%",
                                            width: "28px",
                                            height: "28px",
                                            fontSize: "0.85rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "3px solid white",
                                            fontWeight: "900",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                                          }}
                                        >
                                          {table.comandas.length}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {hasActiveOrders || table.status === "occupied" ? (
                                      <div
                                        style={{
                                          marginTop: "8px",
                                          fontSize: "0.68rem",
                                          fontWeight: "800",
                                          color: "#1e293b",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "1px",
                                          lineHeight: "1.2",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        {waiterNames.length > 0 ? (
                                          <>
                                            <span
                                              style={{
                                                fontSize: "0.55rem",
                                                color: "#64748b",
                                                fontWeight: "normal",
                                              }}
                                            >
                                              🤵{" "}
                                              {waiterNames.length > 1
                                                ? "Meseros:"
                                                : "Mesero:"}
                                            </span>
                                            <span
                                              style={{
                                                color: "#e11d48",
                                                maxWidth: "100%",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                padding: "1px 6px",
                                                background: "#ffe4e6",
                                                borderRadius: "6px",
                                                border: "1px solid #fecdd3",
                                              }}
                                              title={waiterNames.join(" & ")}
                                            >
                                              {waiterNames.join(" & ")}
                                            </span>
                                          </>
                                        ) : (
                                          <span style={{ color: "#e11d48" }}>Activa</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div style={{ marginTop: "8px", fontSize: "0.75rem", fontWeight: "bold", color: "#cbd5e1" }}>
                                        Libre
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 0, right: 16, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderMenu()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </IonCol>

              {/* Mitad Derecha: Cuentas o Ticket */}
              <IonCol size="6" style={{ height: "100%", overflow: "hidden", paddingLeft: "16px", position: "relative" }}>
                <AnimatePresence mode="wait">
                  {!selectedTableGestion ? (
                    <motion.div
                      key="cuentas"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 16, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderClosedAccountsList()}
                    </motion.div>
                  ) : cart.length > 0 ? (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 16, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderReview()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="embedded-menu-container"
                      style={{ position: "absolute", top: 0, left: 16, right: 0, bottom: 0, overflow: "hidden", borderRadius: "16px", background: "#1e293b" }}
                    >
                      {renderTableDetails()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  };

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
      
    />
  );;

  const renderCorteTabla2 = () => {
    // Role check: Only allowed for non-cajero and non-mesero
    if (["cajero", "mesero"].includes(currentUser?.role || "")) {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar color="light" className="border-b border-stone-300">
              <IonButtons slot="start">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-white bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                >
                  ☰ Menú
                </button>
              </IonButtons>
              <IonTitle className="font-black text-stone-800">📑 Historial de Cortes 2</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-[#f4f3ec] text-stone-800">
            <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-stone-300 rounded-3xl text-center shadow-xl space-y-3">
              <span className="text-6xl block">🛑</span>
              <h2 className="text-2xl font-black text-rose-600">Acceso Restringido</h2>
              <p className="text-stone-700 font-bold leading-relaxed text-sm">
                Este módulo de Foliación Interna y Nivelación de Cortes 2 es de uso exclusivo para Administración, Gerencia y Propietario.
              </p>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    // Helper shift date key (attributes early morning 00:00 - 04:59 to previous day's shift in LOCAL timezone)
    const getShiftKey = (timestamp: any) => {
      if (!timestamp) return "";
      const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(d.getTime())) return "";
      const shifted = new Date(d);
      if (shifted.getHours() < 5) {
        shifted.setDate(shifted.getDate() - 1);
      }
      const y = shifted.getFullYear();
      const m = String(shifted.getMonth() + 1).padStart(2, "0");
      const day = String(shifted.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    // Helper check if account is Lupay (Lupay accounts are completely excluded)
    const isLupayAccount = (acc: ClosedAccount) => {
      const method = (acc.paymentMethod || "").toLowerCase();
      return method.includes("lupay") || (acc as any).isLupay || (acc as any).paymentCategory === "lupay";
    };

    // Group history accounts by shift date (excluding cancelled & Lupay accounts)
    const shiftAccountsMap: Record<string, ClosedAccount[]> = {};
    (history || []).forEach((acc) => {
      if (acc.status === "cancelled" || isLupayAccount(acc)) return;
      const key = getShiftKey(acc.timestamp);
      if (!key) return;
      if (!shiftAccountsMap[key]) shiftAccountsMap[key] = [];
      shiftAccountsMap[key].push(acc);
    });

    const sortedShiftKeys = Object.keys(shiftAccountsMap).sort((a, b) => b.localeCompare(a));

    const getTodayLocalShiftKey = () => {
      const now = new Date();
      if (now.getHours() < 5) {
        now.setDate(now.getDate() - 1);
      }
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const activeDateKey = corte2SelectedDate || sortedShiftKeys[0] || getTodayLocalShiftKey();

    // Accounts for active date, sorted chronologically ascending (⏱️)
    const currentShiftAccounts = [...(shiftAccountsMap[activeDateKey] || [])].sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return tA - tB;
    });

    // Check if there's a saved record for activeDateKey
    const existingRecord = corte2Records.find((r) => r.date === activeDateKey);

    // Initial folio anterior calculation
    let calculatedFolioAnterior = 0;
    if (existingRecord) {
      calculatedFolioAnterior = existingRecord.folioAnterior;
    } else {
      const prevRecord = corte2Records.find((r) => r.date < activeDateKey);
      if (prevRecord) {
        calculatedFolioAnterior = prevRecord.folioFinal || 0;
      }
    }

    const folioAnterior = corte2FolioAnterior !== undefined && corte2FolioAnterior !== 0
      ? corte2FolioAnterior
      : calculatedFolioAnterior;

    const montoObjetivo = corte2MontoObjetivo || (existingRecord ? existingRecord.montoObjetivo : 0);

    // Mandatory accounts: requiresInvoice OR Card OR Transfer/Bank
    const isMandatoryAccount = (acc: ClosedAccount) => {
      if (acc.requiresInvoice) return true;
      const method = (acc.paymentMethod || "").toLowerCase();
      return ["card", "tarjeta", "transfer", "transferencia", "banco"].some((m) => method.includes(m));
    };

    const mandatoryAccountIds = currentShiftAccounts
      .filter((acc) => isMandatoryAccount(acc))
      .map((acc) => acc.id);

    // Selected account IDs set (mandatory are forced)
    const activeSelectedSet = new Set<string>([
      ...mandatoryAccountIds,
      ...(corte2SelectedAccountIds.length > 0 ? corte2SelectedAccountIds : (existingRecord ? existingRecord.selectedAccountIds : mandatoryAccountIds)),
    ]);

    // Calculate folios for checked accounts
    let runningFolio = folioAnterior;
    let assignedFolioMap: Record<string, number> = {};
    let lastAssignedFolio = folioAnterior;

    currentShiftAccounts.forEach((acc) => {
      if (activeSelectedSet.has(acc.id)) {
        runningFolio++;
        assignedFolioMap[acc.id] = runningFolio;
        lastAssignedFolio = runningFolio;
      }
    });

    // Subtotal of selected accounts
    const subtotalFoliado = currentShiftAccounts
      .filter((acc) => activeSelectedSet.has(acc.id))
      .reduce((sum, acc) => sum + Number(acc.total || 0), 0);

    const diferencia = subtotalFoliado - montoObjetivo;

    // Toggle check handler
    const toggleAccountSelection = (accId: string, isMandatory: boolean) => {
      if (isMandatory) return; // Locked!
      const newSet = new Set(activeSelectedSet);
      if (newSet.has(accId)) {
        newSet.delete(accId);
      } else {
        newSet.add(accId);
      }
      setCorte2SelectedAccountIds(Array.from(newSet));
    };

    // Smart suggestion algorithm ("💡 Sugerir Selección para Nivelar" -> Preferentemente importes más pequeños)
    const handleSmartSuggestion = () => {
      if (montoObjetivo <= 0) {
        setMenuToastMessage("⚠️ Ingresa un monto objetivo mayor a $0 para nivelar.");
        setShowMenuToast(true);
        return;
      }

      const mandatoryTotal = currentShiftAccounts
        .filter((acc) => isMandatoryAccount(acc))
        .reduce((sum, acc) => sum + Number(acc.total || 0), 0);

      const neededFromCash = montoObjetivo - mandatoryTotal;

      if (neededFromCash <= 0) {
        setCorte2SelectedAccountIds([...mandatoryAccountIds]);
        setMenuToastMessage("💡 Las cuentas obligatorias (Factura/Tarjeta/Transf) cubren el monto objetivo.");
        setShowMenuToast(true);
        return;
      }

      // Cash accounts sorted by total ASCENDING (preferentemente los importes más pequeños)
      const optionalCashAccounts = currentShiftAccounts
        .filter((acc) => !isMandatoryAccount(acc))
        .sort((a, b) => Number(a.total || 0) - Number(b.total || 0));

      if (optionalCashAccounts.length === 0) {
        setCorte2SelectedAccountIds([...mandatoryAccountIds]);
        setMenuToastMessage("ℹ️ No hay cuentas en efectivo adicionales para seleccionar.");
        setShowMenuToast(true);
        return;
      }

      const selectedCashIds: string[] = [];
      let accumulatedCash = 0;

      for (const acc of optionalCashAccounts) {
        selectedCashIds.push(acc.id);
        accumulatedCash += Number(acc.total || 0);
        if (accumulatedCash >= neededFromCash) break;
      }

      setCorte2SelectedAccountIds([...mandatoryAccountIds, ...selectedCashIds]);
      setMenuToastMessage(`💡 Sugerencia aplicada: ${selectedCashIds.length} cuentas de menor importe seleccionadas para nivelación.`);
      setShowMenuToast(true);
    };

    // Batch Print handlers
    const handlePrintAllAccounts = async () => {
      if (currentShiftAccounts.length === 0) {
        setMenuToastMessage("⚠️ No hay cuentas en este turno para imprimir.");
        setShowMenuToast(true);
        return;
      }
      setMenuToastMessage(`🖨️ Imprimiendo las ${currentShiftAccounts.length} cuentas del turno...`);
      setShowMenuToast(true);
      for (const acc of currentShiftAccounts) {
        const folioNum = assignedFolioMap[acc.id];
        await reprintAccount(acc, folioNum);
        await new Promise((r) => setTimeout(r, 250));
      }
    };

    const handlePrintSelectedAccounts = async () => {
      const selectedAccounts = currentShiftAccounts.filter((acc) => activeSelectedSet.has(acc.id));
      if (selectedAccounts.length === 0) {
        setMenuToastMessage("⚠️ No hay cuentas con checkbox / foliadas para imprimir.");
        setShowMenuToast(true);
        return;
      }
      setMenuToastMessage(`🖨️ Imprimiendo las ${selectedAccounts.length} cuentas foliadas (con checkbox)...`);
      setShowMenuToast(true);
      for (const acc of selectedAccounts) {
        const folioNum = assignedFolioMap[acc.id];
        await reprintAccount(acc, folioNum);
        await new Promise((r) => setTimeout(r, 250));
      }
    };

    // Save record to Firebase
    const handleSaveCorte2Record = async () => {
      if (!selectedTenant?.id) return;

      // 1. Validation for Folio Anterior jump
      const prevRecord = corte2Records.find((r) => r.date < activeDateKey);
      const expectedFolioAnterior = prevRecord ? prevRecord.folioFinal : 0;

      if (folioAnterior !== expectedFolioAnterior) {
        const confirmMsg = 
          `⚠️ ADVERTENCIA: El folio inicial ingresado provoca un salto en la numeración.\n\n` +
          `Esperado (donde terminó el turno anterior): ${expectedFolioAnterior}\n` +
          `Ingresado actualmente: ${folioAnterior}\n\n` +
          `¿Deseas guardar de todos modos con este salto de folios?\n` +
          `(Si das 'Cancelar', se corregirá al valor esperado automáticamente).`;
          
        if (!window.confirm(confirmMsg)) {
          setCorte2FolioAnterior(expectedFolioAnterior);
          return; // Detener ejecución para que el usuario guarde con el número correcto
        }
      }

      const recId = existingRecord?.id || `corte2_${activeDateKey.replace(/-/g, "")}_${selectedTenant.id}`;
      const recordToSave: CorteCuentasFolioRecord = {
        id: recId,
        tenantId: selectedTenant.id,
        date: activeDateKey,
        folioAnterior: folioAnterior,
        folioFinal: lastAssignedFolio,
        montoObjetivo: montoObjetivo,
        montoFoliado: subtotalFoliado,
        selectedAccountIds: Array.from(activeSelectedSet),
        status: "closed",
        createdAt: existingRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await saveCorteFolioRecordToFirebase(selectedTenant.id, recordToSave);
        
        // 2. Domino/Recursive update for subsequent shifts
        const subsequentRecords = [...corte2Records]
          .filter(r => r.date > activeDateKey)
          .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically ascending
          
        if (subsequentRecords.length > 0) {
          let currentChainFolio = lastAssignedFolio; // Final folio of the record we just saved
          
          for (const nextRec of subsequentRecords) {
            const foliosCount = nextRec.selectedAccountIds.length;
            const nextFolioFinal = currentChainFolio + foliosCount;
            
            // Update only if there is a discrepancy to save database writes
            if (nextRec.folioAnterior !== currentChainFolio || nextRec.folioFinal !== nextFolioFinal) {
              const updatedRec: CorteCuentasFolioRecord = {
                ...nextRec,
                folioAnterior: currentChainFolio,
                folioFinal: nextFolioFinal
              };
              await saveCorteFolioRecordToFirebase(selectedTenant.id, updatedRec);
            }
            
            currentChainFolio = nextFolioFinal;
          }
        }

        // Actualizar ranking estático de favoritos por nodo en el corte de caja para el día siguiente 📊🏆
        try {
          const stats: Record<string, number> = {};
          (history || []).forEach((acc) => {
            if (acc.status !== "cancelled" && Array.isArray(acc.items)) {
              acc.items.forEach((item) => {
                const pId = item.product?.id || item.id;
                if (pId) {
                  stats[pId] = (stats[pId] || 0) + (item.quantity || 1);
                }
              });
            }
          });
          setProductSalesMap(stats);
          localStorage.setItem("cocinet_product_sales_stats", JSON.stringify(stats));
        } catch (e) {}

        setMenuToastMessage(`✅ Guardado exitoso: Folios #${folioAnterior + 1} al #${lastAssignedFolio} registrados.`);
        setShowMenuToast(true);
      } catch (err: any) {
        setMenuToastMessage(`❌ Error al guardar nivelación: ${err.message || err}`);
        setShowMenuToast(true);
      }
    };

    // Badge styling for Traffic Light / Formato Condicional (🚦) in Light Theme
    let trafficLightBadge = (
      <div className="bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-emerald-700">
        <span className="text-2xl">✅</span>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Estado de Meta</span>
          <span className="text-sm font-black">Coincide con la Meta</span>
        </div>
      </div>
    );

    if (montoObjetivo > 0) {
      if (Math.abs(diferencia) <= 50) {
        trafficLightBadge = (
          <div className="bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-emerald-700">
            <span className="text-2xl">✅</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Nivelación Correcta</span>
              <span className="text-sm font-black">Coincide con la meta (Dif: ${diferencia.toFixed(2)})</span>
            </div>
          </div>
        );
      } else if (diferencia < -50) {
        trafficLightBadge = (
          <div className="bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border-2 border-amber-600">
            <span className="text-2xl">⚠️</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-900 font-extrabold">SALDO FALTANTE</span>
              <span className="text-base font-black">Faltan ${Math.abs(diferencia).toFixed(2)}</span>
            </div>
          </div>
        );
      } else {
        trafficLightBadge = (
          <div className="bg-indigo-600 text-white font-black px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 border border-indigo-700">
            <span className="text-2xl">ℹ️</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-indigo-100 font-bold">SALDO EXCEDENTE</span>
              <span className="text-base font-black">Sobran ${diferencia.toFixed(2)}</span>
            </div>
          </div>
        );
      }
    }

    const selectedCount = currentShiftAccounts.filter((acc) => activeSelectedSet.has(acc.id)).length;

    // --- LOGICA REPORTE MULTI-TURNO ---
    const enhancedMultiTurnRecords = corte2Records
      .filter(r => {
        if (!multiTurnStartDate || !multiTurnEndDate) return false;
        return r.date >= multiTurnStartDate && r.date <= multiTurnEndDate;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => {
        let cashTotal = 0;
        let cardTotal = 0;
        let transferTotal = 0;
        
        const shiftAccounts = shiftAccountsMap[r.date] || [];
        const selectedAccounts = shiftAccounts.filter(acc => r.selectedAccountIds.includes(acc.id));
        
        selectedAccounts.forEach(acc => {
          const amt = Number(acc.total || 0);
          const method = (acc.paymentMethod || "").toLowerCase();
          if (["card", "tarjeta"].some(m => method.includes(m))) {
            cardTotal += amt;
          } else if (["transfer", "transferencia", "banco", "bank"].some(m => method.includes(m))) {
            transferTotal += amt;
          } else {
            cashTotal += amt;
          }
        });
        
        return {
          ...r,
          cashTotal,
          cardTotal,
          transferTotal
        };
      });

    const totalMultiTurnSum = enhancedMultiTurnRecords.reduce((acc, r) => acc + (r.montoFoliado || 0), 0);
    const totalCashSum = enhancedMultiTurnRecords.reduce((acc, r) => acc + r.cashTotal, 0);
    const totalCardSum = enhancedMultiTurnRecords.reduce((acc, r) => acc + r.cardTotal, 0);
    const totalTransferSum = enhancedMultiTurnRecords.reduce((acc, r) => acc + r.transferTotal, 0);

    const handleExportMultiTurnWhatsApp = () => {
      let text = `*REPORTE MULTI-TURNO*\n`;
      text += `Sucursal: ${selectedTenant?.name || "N/A"}\n`;
      text += `Periodo: ${multiTurnStartDate} al ${multiTurnEndDate}\n\n`;
      enhancedMultiTurnRecords.forEach(r => {
        text += `📅 Turno: ${r.date}\n`;
        text += `🔢 Folios: ${r.folioAnterior + 1} al ${r.folioFinal}\n`;
        text += `💵 Efectivo: $${r.cashTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        text += `💳 Tarjeta: $${r.cardTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        text += `🏦 Transfer: $${r.transferTotal.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
        text += `💰 TOTAL: $${r.montoFoliado.toLocaleString("es-MX", {minimumFractionDigits:2})}\n\n`;
      });
      if (enhancedMultiTurnRecords.length === 0) {
        text += `No hay folios registrados en este periodo.\n\n`;
      }
      text += `*RESUMEN DEL PERIODO*\n`;
      text += `💵 Efectivo: $${totalCashSum.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
      text += `💳 Tarjeta: $${totalCardSum.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
      text += `🏦 Transfer: $${totalTransferSum.toLocaleString("es-MX", {minimumFractionDigits:2})}\n`;
      text += `*💰 TOTAL GLOBAL: $${totalMultiTurnSum.toLocaleString("es-MX", {minimumFractionDigits:2})}*\n`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    };

    const handleExportMultiTurnExcel = () => {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"></head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th colspan="7" style="font-size:16px; font-weight:bold; background-color:#d9e1f2;">
                  REPORTE MULTI-TURNO - ${selectedTenant?.name || "N/A"}
                </th>
              </tr>
              <tr>
                <th colspan="7" style="font-size:14px; background-color:#f0f0f0;">
                  Periodo: ${multiTurnStartDate} al ${multiTurnEndDate}
                </th>
              </tr>
              <tr style="background-color:#d9e1f2;">
                <th>Turno</th>
                <th>Folio Inicial</th>
                <th>Folio Final</th>
                <th>Efectivo ($)</th>
                <th>Tarjeta ($)</th>
                <th>Transferencia ($)</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              ${enhancedMultiTurnRecords.map(r => `
                <tr>
                  <td>${r.date}</td>
                  <td>${r.folioAnterior + 1}</td>
                  <td>${r.folioFinal}</td>
                  <td>${r.cashTotal}</td>
                  <td>${r.cardTotal}</td>
                  <td>${r.transferTotal}</td>
                  <td>${r.montoFoliado}</td>
                </tr>
              `).join('')}
              <tr style="background-color:#ffff00; font-weight:bold;">
                <td colspan="3" align="right">TOTAL PERIODO</td>
                <td>${totalCashSum}</td>
                <td>${totalCardSum}</td>
                <td>${totalTransferSum}</td>
                <td>${totalMultiTurnSum}</td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_MultiTurno_${multiTurnStartDate}_al_${multiTurnEndDate}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };



    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="light" className="border-b border-stone-300">
            <IonButtons slot="start">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2.5 text-white bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition flex items-center gap-2 ml-2 font-black text-xs shadow-sm"
              >
                <span>☰</span>
                <span>Menú</span>
              </button>
            </IonButtons>
            <IonTitle className="font-black text-amber-700">📑 Cortes — {selectedTenant?.name || "Sucursal"}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="bg-[#f4f3ec] text-stone-800 ion-padding">
          <div className="max-w-7xl mx-auto space-y-6 pb-16">
            
            {/* Header & Controls Panel (Fondo Blanco Ostión Elegante) */}
            <div className="bg-white border border-stone-300/90 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Row 1: Date Selector & Tenant */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 bg-amber-100 border border-amber-300 rounded-2xl">📑</span>
                  <div>
                    <h1 className="text-xl font-black text-stone-900 tracking-tight">Foliación Consecutiva de Cuentas por Turno</h1>
                    <p className="text-xs font-bold text-stone-600">
                      Asigna número interno consecutivo a las cuentas para nivelación de ingresos ({selectedTenant?.name || "Sucursal"}).
                    </p>
                  </div>
                </div>

                {/* Shift Date Selector & Multi-Turn Report Button */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-2xl border border-stone-300">
                    <span className="text-xs font-black text-stone-700 pl-2">📅 Turno:</span>
                    <select
                      value={activeDateKey}
                      onChange={(e) => {
                        setCorte2SelectedDate(e.target.value);
                        setCorte2SelectedAccountIds([]);
                        setCorte2FolioAnterior(0);
                        setCorte2MontoObjetivo(0);
                      }}
                      className="bg-white text-amber-900 font-black text-sm px-3 py-2 rounded-xl border-2 border-stone-300 outline-none cursor-pointer shadow-sm focus:border-amber-500"
                    >
                      {sortedShiftKeys.map((key) => (
                        <option key={key} value={key}>
                          Corte del {key} ({shiftAccountsMap[key]?.length || 0} cuentas)
                        </option>
                      ))}
                      {!sortedShiftKeys.includes(activeDateKey) && (
                        <option value={activeDateKey}>{activeDateKey}</option>
                      )}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setShowMultiTurnModal(true);
                      setMultiTurnPreviewReady(false);
                      setMultiTurnStartDate("");
                      setMultiTurnEndDate("");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>📑</span>
                    <span>Reporte Multi-Turnos</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Control Inputs (Folio Anterior, Monto Objetivo) & Traffic Light status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                
                {/* Folio Anterior */}
                <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                    🔢 ÚLTIMO FOLIO (TURNO PASADO):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={folioAnterior}
                    onChange={(e) => setCorte2FolioAnterior(Number(e.target.value) || 0)}
                    className="bg-white border-2 border-stone-300 text-amber-800 font-black text-xl px-3 py-2 rounded-xl outline-none focus:border-amber-500 transition shadow-inner"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-stone-500 font-bold italic">Folio final en el que se quedó ayer</span>
                </div>

                {/* Monto Objetivo a Nivelar */}
                <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                    🎯 Monto Nivelación Objetivo:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-black text-lg">$</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={montoObjetivo || ""}
                      onChange={(e) => setCorte2MontoObjetivo(Number(e.target.value) || 0)}
                      className="w-full bg-white border-2 border-stone-300 text-emerald-800 font-black text-xl pl-8 pr-3 py-2 rounded-xl outline-none focus:border-emerald-600 transition shadow-inner"
                      placeholder="0.00"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 font-bold italic">Monto a definir para ingresos</span>
                </div>

                {/* Subtotal Foliado Actual */}
                <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex flex-col gap-1">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider">
                    📈 Subtotal Seleccionado:
                  </label>
                  <span className="text-2xl font-black text-stone-900">
                    ${subtotalFoliado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-stone-600 font-extrabold">
                    {lastAssignedFolio > folioAnterior
                      ? `Folios: #${folioAnterior + 1} al #${lastAssignedFolio}`
                      : "Sin folios asignados"}
                  </span>
                </div>

                {/* Badge de Formato Condicional (🚦) */}
                <div className="flex justify-center md:justify-end">
                  {trafficLightBadge}
                </div>
              </div>

              {/* Banner de Rango de Folios Generados e Impresión */}
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-amber-200/80 rounded-xl">📜</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                      Rango de Folios Generados en este Turno:
                    </span>
                    <div className="text-base font-black text-amber-950 flex items-center gap-2 flex-wrap">
                      {lastAssignedFolio > folioAnterior ? (
                        <>
                          <span>del</span>
                          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-600 shadow-sm text-sm">
                            #{folioAnterior + 1}
                          </span>
                          <span>al</span>
                          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-600 shadow-sm text-sm">
                            #{lastAssignedFolio}
                          </span>
                          <span className="text-xs font-extrabold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300">
                            ({selectedCount} cuentas foliadas)
                          </span>
                        </>
                      ) : (
                        <span className="text-stone-500 italic text-sm">Sin cuentas seleccionadas para foliación</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrintSelectedAccounts}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2.5 rounded-xl shadow transition text-xs flex items-center gap-2 cursor-pointer border border-amber-700"
                    title="Imprimir únicamente las cuentas con checkbox marcados"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Foliadas ({selectedCount})</span>
                  </button>

                  <button
                    onClick={handlePrintAllAccounts}
                    className="bg-stone-800 hover:bg-stone-900 text-white font-black px-4 py-2.5 rounded-xl shadow transition text-xs flex items-center gap-2 cursor-pointer border border-stone-900"
                    title="Imprimir todas las cuentas registradas en este turno"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Todas ({currentShiftAccounts.length})</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Smart Suggestion & Save */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSmartSuggestion}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-md text-xs transition flex items-center gap-2 cursor-pointer border border-amber-600"
                  >
                    <span>💡</span>
                    <span>Sugerir Selección para Nivelar</span>
                  </button>
                  <span className="text-xs text-stone-600 font-bold italic">
                    (Prioriza seleccionar los importes más pequeños)
                  </span>
                </div>

                <button
                  onClick={handleSaveCorte2Record}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl shadow-md text-xs transition flex items-center gap-2 cursor-pointer border border-emerald-700"
                >
                  <span>💾</span>
                  <span>Guardar Registro de Nivelación</span>
                </button>
              </div>

            </div>

            {/* Table of Accounts */}
            <div className="bg-white border border-stone-300/90 rounded-3xl p-6 shadow-xl space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Cuentas del Turno (Sin Cuentas Lupay)</span>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                    {currentShiftAccounts.length} cuentas
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs font-black text-stone-700">
                  <button
                    onClick={handlePrintSelectedAccounts}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Foliadas ({selectedCount})</span>
                  </button>
                  <button
                    onClick={handlePrintAllAccounts}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>🖨️</span>
                    <span>Imprimir Todas ({currentShiftAccounts.length})</span>
                  </button>
                </div>
              </div>

              {currentShiftAccounts.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border-2 border-stone-200">
                  <table className="w-full text-left text-xs text-stone-800">
                    <thead className="bg-stone-200 text-stone-800 font-black uppercase tracking-wider border-b-2 border-stone-300">
                      <tr>
                        <th className="py-3 px-4 text-center">Sel.</th>
                        <th className="py-3 px-4"># Folio</th>
                        <th className="py-3 px-4">Hora</th>
                        <th className="py-3 px-4">Mesa / Ticket</th>
                        <th className="py-3 px-4">Forma de Pago</th>
                        <th className="py-3 px-4">Requiere Factura</th>
                        <th className="py-3 px-4 text-right">Total ($)</th>
                        <th className="py-3 px-4 text-center">Imprimir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-bold">
                      {currentShiftAccounts.map((acc) => {
                        const isMandatory = isMandatoryAccount(acc);
                        const isChecked = activeSelectedSet.has(acc.id);
                        const folioNum = assignedFolioMap[acc.id];
                        const dateObj = new Date(acc.timestamp);
                        const timeStr = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                          : "N/D";

                        return (
                          <tr
                            key={acc.id}
                            className={`transition ${
                              isChecked
                                ? isMandatory
                                  ? "bg-amber-100/70 text-stone-900 font-bold"
                                  : "bg-emerald-100/60 text-stone-900 font-bold"
                                : "bg-white text-stone-400 font-semibold hover:bg-stone-50"
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isMandatory}
                                onChange={() => toggleAccountSelection(acc.id, isMandatory)}
                                className={`w-4 h-4 rounded border-stone-400 cursor-pointer ${
                                  isMandatory ? "accent-amber-600 opacity-90 cursor-not-allowed" : "accent-emerald-600"
                                }`}
                              />
                            </td>

                            {/* # Folio */}
                            <td className="py-3 px-4 font-black">
                              {folioNum ? (
                                <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs border border-amber-600 shadow-sm">
                                  #{folioNum}
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>

                            {/* Hora */}
                            <td className="py-3 px-4 font-mono text-stone-700 font-bold">
                              {timeStr}
                            </td>

                            {/* Mesa / Ticket */}
                            <td className="py-3 px-4 font-black text-stone-900 text-sm">
                              {acc.tableLabel || "Cuenta"}
                            </td>

                            {/* Forma de Pago */}
                            <td className="py-3 px-4 capitalize">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-black ${
                                  (acc.paymentMethod || "").toLowerCase().includes("card") || (acc.paymentMethod || "").toLowerCase().includes("tarjeta")
                                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                                    : (acc.paymentMethod || "").toLowerCase().includes("trans")
                                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                }`}
                              >
                                {acc.paymentMethod || "Efectivo"}
                              </span>
                            </td>

                            {/* Factura */}
                            <td className="py-3 px-4">
                              {acc.requiresInvoice ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-md text-[11px] font-black">
                                    📄 Factura
                                  </span>
                                  {acc.invoicePhone ? (
                                    <button
                                      type="button"
                                      onClick={(e) => handleSendWhatsAppInvoice(acc, e)}
                                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-0.5 rounded-full text-xs shadow-sm transition cursor-pointer border border-emerald-500"
                                      title="💬 Enviar WhatsApp solicitando Constancia Fiscal y enviar ticket"
                                    >
                                      <span>💬</span>
                                      <span className="underline">({acc.invoicePhone})</span>
                                    </button>
                                  ) : (
                                    <span className="text-stone-400 text-xs font-bold">(Sin tel)</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-400 font-semibold">No</span>
                              )}
                            </td>

                            {/* Total */}
                            <td className="py-3 px-4 text-right font-black text-sm text-stone-900">
                              ${Number(acc.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </td>

                            {/* Botón Imprimir Individual */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => reprintAccount(acc, folioNum)}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 p-1.5 rounded-lg transition font-bold text-xs shadow-xs cursor-pointer"
                                title={`Imprimir ticket ${folioNum ? `(Folio #${folioNum})` : ""}`}
                              >
                                🖨️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 font-bold bg-stone-100/60 rounded-3xl border-2 border-dashed border-stone-300">
                  <span className="text-4xl block mb-2">📬</span>
                  <span>No hay cuentas registradas en este turno para la fecha seleccionada.</span>
                </div>
              )}

            </div>

          </div>
        </IonContent>
        <MultiTurnModal
          showMultiTurnModal={showMultiTurnModal}
          setShowMultiTurnModal={setShowMultiTurnModal}
          multiTurnData={multiTurnData}
          selectedMultiTurnDate={selectedMultiTurnDate}
          setSelectedMultiTurnDate={setSelectedMultiTurnDate}
          handleExportMultiTurnCSV={handleExportMultiTurnCSV}
        />
      </IonPage>
    );
  };

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
      
    />
  );;



  const renderReporteMovimientos = () => {
    const startOfReport = new Date(reporteMovimientosInicio);
    const endOfReport = new Date(reporteMovimientosFin);

    const filteredHistory = history.filter((h) => {
      if (!h.timestamp) return false;
      const t = new Date(h.timestamp);
      return t >= startOfReport && t <= endOfReport;
    });

    const getCajeroName = (userId: string) => {
      const u = users.find((u) => u.id === userId);
      return u ? u.name : userId || "Desconocido";
    };

    // 1. EFECTIVO
    const efeRows = filteredHistory
      .filter((h) => h.paymentMethod === "cash")
      .map((h) => ({
        cuenta: h.tableLabel || h.id?.slice(-6) || "N/A",
        subtotal: h.subtotal || 0,
        sdom: h.tip || 0,
        descuento: h.discount || 0,
        total: h.total || 0,
      }));
    const efeTotal = efeRows.reduce((sum, r) => sum + r.total, 0);

    // 2. TRANSFERENCIA
    const transfRows = filteredHistory
      .filter((h) => h.paymentMethod === "transfer")
      .map((h) => ({
        cuenta: (h.tableLabel || h.id?.slice(-6) || "N/A") + "T",
        cobro: h.total || 0,
        transf: h.cardLastFour ? "****" + h.cardLastFour : "****",
        cajero: getCajeroName(h.createdBy),
      }));
    const transfTotal = transfRows.reduce((sum, r) => sum + r.cobro, 0);

    // 3. TARJETA
    const tarjetaRows = filteredHistory
      .filter((h) => h.paymentMethod === "card")
      .map((h) => ({
        cuenta: (h.tableLabel || h.id?.slice(-6) || "N/A") + "TJT",
        total: h.total || 0,
        tarjeta: (h.cardLastFour ? "****" + h.cardLastFour : "****") + (h.cardType ? ` (${h.cardType.toUpperCase()})` : ""),
        cajero: getCajeroName(h.createdBy),
      }));
    const tarjetaTotal = tarjetaRows.reduce((sum, r) => sum + r.total, 0);

    // 4. LÚPAY
    const lupayRows = filteredHistory
      .filter((h) => h.paymentMethod === "lupay")
      .map((h) => ({
        cuenta: (h.tableLabel || h.id?.slice(-6) || "N/A") + "LP",
        total: h.total || 0,
        lupay: h.cardLastFour ? "****" + h.cardLastFour : "LÚPAY",
        cajero: getCajeroName(h.createdBy),
      }));
    const lupayTotal = lupayRows.reduce((sum, r) => sum + r.total, 0);

    const globalTotal = efeTotal + transfTotal + tarjetaTotal + lupayTotal;

    const handleExcelExport = () => {
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8"/>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; font-family: Arial, sans-serif; text-align: left; }
            th { background-color: #333; color: white; }
            .bg-header { background-color: #f4f4f4; font-weight: bold; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <table border="1">
            <tr><th colspan="5" style="background-color:#1e293b; color:#ffffff; font-size:16px; text-align:center;">REPORTE DE INGRESOS - SUCURSAL ${(selectedTenant?.name || "Pino Suárez").toUpperCase()}</th></tr>
            <tr><th colspan="5" style="text-align:center;">Periodo: ${reporteMovimientosInicio} a ${reporteMovimientosFin}</th></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS EFECTIVO</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Total</th><th class="text-right">SDOM</th><th class="text-right">Descuento</th><th class="text-right">Cobro</th></tr>
      `;

      efeRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.subtotal.toFixed(2)}</td><td class="text-right">${r.sdom.toFixed(2)}</td><td class="text-right">${r.descuento.toFixed(2)}</td><td class="text-right">${r.total.toFixed(2)}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL EFECTIVO (Suma):</b></td><td class="text-right"><b>${efeTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS TRANSFERENCIA</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Cobro</th><th colspan="2">Transf.</th><th>Cajero</th></tr>
      `;

      transfRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.cobro.toFixed(2)}</td><td colspan="2">${r.transf}</td><td>${r.cajero}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL TRANSFERENCIA (Suma):</b></td><td class="text-right"><b>${transfTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS TARJETA</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Total</th><th>Tarjeta</th><th colspan="2">Cajero</th></tr>
      `;

      tarjetaRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.total.toFixed(2)}</td><td>${r.tarjeta}</td><td colspan="2">${r.cajero}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL TARJETA (Suma):</b></td><td class="text-right"><b>${tarjetaTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr class="bg-header"><td colspan="5">VENTAS LÚPAY</td></tr>
            <tr><th>Cuenta</th><th class="text-right">Total</th><th>Lúpay</th><th colspan="2">Cajero</th></tr>
      `;

      lupayRows.forEach((r) => {
        html += `<tr><td>${r.cuenta}</td><td class="text-right">${r.total.toFixed(2)}</td><td>${r.lupay}</td><td colspan="2">${r.cajero}</td></tr>`;
      });
      html += `
            <tr><td colspan="4" align="right"><b>TOTAL LÚPAY (Suma):</b></td><td class="text-right"><b>${lupayTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="5"></td></tr>
            
            <tr style="background-color:#1e293b; color:#ffffff;"><th colspan="5">RESUMEN DEL PERIODO</th></tr>
            <tr><td colspan="4" align="right">EFECTIVO:</td><td class="text-right"><b>$${efeTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="4" align="right">TRANSFERENCIA:</td><td class="text-right"><b>$${transfTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="4" align="right">TARJETA:</td><td class="text-right"><b>$${tarjetaTotal.toFixed(2)}</b></td></tr>
            <tr><td colspan="4" align="right">LÚPAY:</td><td class="text-right"><b>$${lupayTotal.toFixed(2)}</b></td></tr>
            <tr style="background-color:#10b981; color:#ffffff;"><td colspan="4" align="right"><b>TOTAL VENTA:</b></td><td class="text-right"><b>$${globalTotal.toFixed(2)}</b></td></tr>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Ingresos_${(selectedTenant?.name || "Sucursal").replace(/\s+/g, "_")}_${getMexicoISOString().slice(0, 10)}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <IonPage className="print:bg-white select-text">
        <div className="print:hidden">
          {renderMaterialHeader({
            title: "Reporte de Ingresos y Movimientos 🔄",
            subtitle: `Sucursal ${selectedTenant?.name || "Pino Suárez"}`,
            showBack: true,
            onBack: () => {
              const nextMode = checkoutReturnMode === "gestion_cuentas" ? "gestion_cuentas" : "floorplan";
setAppMode(nextMode);
if (checkoutReturnMode === "gestion_cuentas") {
  setSelectedTableGestion(null);
}
setCheckoutReturnMode(null);
              setIsMovimientosConsulted(false);
            },
          })}
        </div>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="max-w-4xl mx-auto space-y-6 pb-12 print:absolute print:inset-0 print:bg-white print:p-0 print:shadow-none print:m-0 print:w-full">
            
            {/* Filtro de Fechas - Ocultar en Impresion */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-md mx-auto text-center print:hidden space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Periodo - Sucursal {selectedTenant?.name || "Pino Suárez"}</h3>
              
              <div className="space-y-4 text-left">
                <div>
                  <label htmlFor="E_input" className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio (E):</label>
                  <input
                    type="datetime-local"
                    id="E_input"
                    value={reporteMovimientosInicio}
                    onChange={(e) => setReporteMovimientosInicio(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 font-bold text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="S_input" className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Fecha Fin (S):</label>
                  <input
                    type="datetime-local"
                    id="S_input"
                    value={reporteMovimientosFin}
                    onChange={(e) => setReporteMovimientosFin(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 font-bold text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMovimientosConsulted(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl transition duration-200 cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    Consultar Ingresos
                  </button>
                </div>

                {isMovimientosConsulted && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleExcelExport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-4 rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <span>📥 Exportar Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-4 rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/10"
                    >
                      <span>🖨️ Exportar PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resultado del Reporte */}
            {isMovimientosConsulted && (
              <div className="space-y-8 print:space-y-6">
                
                {/* Encabezado Exclusivo para PDF / Impresion */}
                <div className="hidden print:block text-center border-b pb-4 mb-6">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">REPORTE DE INGRESOS - SUCURSAL {(selectedTenant?.name || "PINO SUÁREZ").toUpperCase()}</h1>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Periodo: {new Date(reporteMovimientosInicio).toLocaleString()} a {new Date(reporteMovimientosFin).toLocaleString()}
                  </p>
                </div>

                {/* VENTAS EFECTIVO */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Efectivo
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Total</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">SDOM</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Descuento</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Cobro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {efeRows.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          efeRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.subtotal.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.sdom.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.descuento.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs font-black text-slate-900 text-right">${row.total.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Efectivo:</span>
                    <span className="text-sm text-slate-900 font-black">${efeTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* VENTAS TRANSFERENCIA */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Transferencia
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Cobro (Banco)</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-center">Transf.</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cajero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transfRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          transfRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.cobro.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-center font-mono font-bold">{row.transf}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 font-bold">{row.cajero}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Transferencia:</span>
                    <span className="text-sm text-slate-900 font-black">${transfTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* VENTAS TARJETA */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Tarjeta
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Total</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-center">Tarjeta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cajero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tarjetaRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          tarjetaRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.total.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-center font-mono font-bold">{row.tarjeta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 font-bold">{row.cajero}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Tarjeta:</span>
                    <span className="text-sm text-slate-900 font-black">${tarjetaTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* VENTAS LÚPAY */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs print:border print:border-slate-300 print:rounded-none">
                  <div className="bg-slate-800 text-white py-3 px-5 text-center font-extrabold uppercase tracking-widest text-[11px] print:bg-slate-100 print:text-black print:border-b">
                    Ventas Lúpay
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-50">
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cuenta</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-right">Total</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase text-center">Referencia</th>
                          <th className="py-2.5 px-4 text-xs font-black text-slate-600 uppercase">Cajero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lupayRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                              No hay registros para mostrar en este periodo.
                            </td>
                          </tr>
                        ) : (
                          lupayRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{row.cuenta}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-right font-medium">${row.total.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 text-center font-mono font-bold">{row.lupay}</td>
                              <td className="py-2.5 px-4 text-xs text-slate-600 font-bold">{row.cajero}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 py-3 px-5 text-right font-bold text-xs text-slate-700 flex justify-end gap-2 items-center print:bg-white">
                    <span className="text-emerald-600 uppercase tracking-wider text-[12px]">Total Lúpay:</span>
                    <span className="text-sm text-slate-900 font-black">${lupayTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* RESUMEN GLOBAL */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-center gap-6 print:border print:border-slate-300 print:rounded-none print:bg-white">
                  <div className="text-center md:text-left space-y-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Resumen del Periodo</h3>
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                      Generado el {new Date().toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-2 text-right">
                    <div className="text-xs text-slate-600 font-bold uppercase">Efectivo: <span className="font-mono font-black text-slate-950">${efeTotal.toFixed(2)}</span></div>
                    <div className="text-xs text-slate-600 font-bold uppercase">Transferencia: <span className="font-mono font-black text-slate-950">${transfTotal.toFixed(2)}</span></div>
                    <div className="text-xs text-slate-600 font-bold uppercase">Tarjeta: <span className="font-mono font-black text-slate-950">${tarjetaTotal.toFixed(2)}</span></div>
                    <div className="text-xs text-slate-600 font-bold uppercase">Lúpay: <span className="font-mono font-black text-slate-950">${lupayTotal.toFixed(2)}</span></div>
                    
                    <div className="mt-3 bg-emerald-600 text-white font-black text-sm py-3 px-6 rounded-2xl shadow-md shadow-emerald-500/20 uppercase tracking-wider print:text-black print:border print:border-slate-400 print:shadow-none print:bg-white">
                      Total Venta: ${globalTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </IonContent>
      </IonPage>
    );
  };

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
          companiesConfig={companiesConfig}
          customOwners={customOwners}
          currentUser={currentUser}
          ownerKey={ownerKey}
          selectedTenant={selectedTenant}
          restrictedOwnerKey={restrictedOwnerKey}
          isSystemsMode={isSystemsMode}
          isSistemas={isSistemas}
          activeOwnerFilter={activeOwnerFilter}
          handleSwitchBranch={handleSwitchBranch}
        />
      <BluetoothConfigModal
          tenantName={tenantName}
          showBluetoothConfigModal={showBluetoothConfigModal}
          setShowBluetoothConfigModal={setShowBluetoothConfigModal}
          productCategories={productCategories}
          setProductCategories={setProductCategories}
          tenantPrinterConfig={tenantPrinterConfig}
          setTenantPrinterConfig={setTenantPrinterConfig}
          triggerAppNotification={triggerAppNotification}
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
          {renderPaymentModal()}
          {renderNumpadModal()}
          <ProductCrudModal
          productCrudModal={productCrudModal}
          setProductCrudModal={setProductCrudModal}
          crudSelectedCategory={crudSelectedCategory}
          crudQuickNotes={crudQuickNotes}
          setCrudQuickNotes={setCrudQuickNotes}
          newCrudQuickNoteText={newCrudQuickNoteText}
          setNewCrudQuickNoteText={setNewCrudQuickNoteText}
          ownerBranches={ownerBranches}
          tenantPrinterConfig={tenantPrinterConfig}
          allProducts={allProducts}
          productCategories={productCategories}
          generateUUID={generateUUID}
          getMexicoISOString={getMexicoISOString}
          addProductToFirebase={addProductToFirebase}
          updateProductInFirebase={updateProductInFirebase}
          getAllProductsFromFirebase={getAllProductsFromFirebase}
          triggerAppNotification={triggerAppNotification}
        />

          {/* Bulk Item Cancellation Reason Modal */}
<BulkItemCancellationReasonModal
          showBulkItemCancellationReasonModal={showBulkItemCancellationReasonModal}
          setShowBulkItemCancellationReasonModal={setShowBulkItemCancellationReasonModal}
        />

          {/* Authorization Modal for Pending Cancellations */}
<AuthorizeCancellationModal
          showAuthorizeCancellationModal={showAuthorizeCancellationModal}
          setShowAuthorizeCancellationModal={setShowAuthorizeCancellationModal}
          authorizePasswordValue={authorizePasswordValue}
          setAuthorizePasswordValue={setAuthorizePasswordValue}
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
        />
            );
          })()}

          {/* Item Cancellation Modal */}
<ItemCancelModal
          itemToCancel={itemToCancel}
          setItemToCancel={setItemToCancel}
        />

          {/* Comanda Cancellation Modal */}
<ComandaCancelModal
          comandaToCancel={comandaToCancel}
          setComandaToCancel={setComandaToCancel}
        />

          {/* Closed Account Cancellation Modal */}
<AccountCancellationModal
          showAccountCancellationModal={showAccountCancellationModal}
          setShowAccountCancellationModal={setShowAccountCancellationModal}
        />
        </>
      )}
      {/* Modal para Editar Método de Pago en Historial */}
<EditPaymentModal
          isEditPaymentModalOpen={isEditPaymentModalOpen}
          setIsEditPaymentModalOpen={setIsEditPaymentModalOpen}
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
          currentFolio={currentFolio}
          setCurrentFolio={setCurrentFolio}
          currentFolioPrefix={currentFolioPrefix}
          setCurrentFolioPrefix={setCurrentFolioPrefix}
          handleSaveFolioChanges={handleSaveFolioChanges}
        />

      {/* Modal para solicitar Teléfono Celular de Referencia al requerir factura */}
<InvoicePhoneModal
          showInvoicePhoneModal={showInvoicePhoneModal}
          setShowInvoicePhoneModal={setShowInvoicePhoneModal}
          invoicePhoneNumber={invoicePhoneNumber}
          setInvoicePhoneNumber={setInvoicePhoneNumber}
          handleSendInvoiceByWhatsApp={handleSendInvoiceByWhatsApp}
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


