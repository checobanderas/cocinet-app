import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IonPage,
  IonContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  documentTextOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  businessOutline,
  cloudCheckmarkOutline,
  downloadOutline,
  refreshOutline,
  searchOutline,
  mailOutline,
  paperPlaneOutline,
  trashOutline,
  arrowBackOutline,
  eyeOutline,
  copyOutline,
  closeOutline,
  calendarOutline,
  flashOutline,
  statsChartOutline,
  chevronForwardOutline,
  chevronDownOutline,
  chevronUpOutline,
  gridOutline,
  layersOutline,
  logoWhatsapp,
  informationCircleOutline,
  chatbubblesOutline,
  checkmarkDoneOutline,
  sendOutline,
  createOutline,
  personOutline,
  checkboxOutline,
  squareOutline,
  shuffleOutline,
  optionsOutline,
  phonePortraitOutline,
  shareSocialOutline,
  openOutline,
} from "ionicons/icons";
import * as XLSX from "xlsx";
import {
  DEFAULT_INVOICING_API_URL,
  ApiInvoiceItem,
  listarFacturasFromApi,
  timbrarFactura,
  descartarFactura,
  reenviarFacturaPorCorreo,
  testConexionFacturacion,
  obtenerLogServidorFacturacion,
  formatFriendlySatError,
} from "../../services/invoicingService";
import {
  sendSilentWhatsAppMessage,
  generateInvoicePortalUrl,
} from "../../utils/whatsappCloud";

export interface MessageTemplate {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  template: string;
}

export const INVOICE_REMINDER_TEMPLATES: MessageTemplate[] = [
  {
    id: "template_1",
    name: "Plantilla 1: Formal & Completa",
    badge: "Oficial",
    icon: "📄",
    description: "Mensaje formal con detalle de consumo, ticket y enlace estructurado.",
    template: `🌮 *RECORDATORIO DE FACTURACIÓN ELECTRÓNICA*
🏢 *{sucursal}*

¡Hola{cliente}! 👋 Te contactamos de *{sucursal}*. Notamos que solicitaste factura para tu consumo de *${total}* (Ticket #{ticket}), pero aún estamos en espera de tus datos fiscales (RFC, Razón Social, etc.) para poder generarla. 🧾✨

📄 *Por favor ingresa tus datos fiscales en el siguiente enlace:*
{enlace}

💡 *Si ya has facturado con nosotros anteriormente, al ingresar tu RFC o número celular tus datos se llenarán automáticamente.*
En cuanto los completes, emitiremos tu factura y te llegará a tu correo. ✉️

¡Muchas gracias por tu preferencia! 😊🙏`,
  },
  {
    id: "template_2",
    name: "Plantilla 2: Amable & Cierre Fiscal",
    badge: "Seguimiento",
    icon: "⏰",
    description: "Mensaje cálido enfatizando el tiempo de emisión para evitar cierres de mes.",
    template: `🧾 *AVISO DE FACTURA PENDIENTE*
🏢 *{sucursal}*

Estimado cliente{cliente} 👋 Le recordamos amablemente de parte de *{sucursal}* que tenemos pendiente la emisión de su factura correspondiente al consumo Ticket #{ticket} por un importe de *${total}*.

Para asegurar que su comprobante fiscal CFDI 4.0 se timbre oportunamente, por favor capture sus datos en el siguiente portal:
{enlace}

¡Estamos a sus órdenes y agradecemos su preferencia! 🌮✨`,
  },
  {
    id: "template_3",
    name: "Plantilla 3: Rápida & Directa",
    badge: "Express",
    icon: "⚡",
    description: "Mensaje conciso para respuesta rápida y llenado en 1 minuto.",
    template: `¡Hola{cliente}! 👋 En *{sucursal}* estamos listos para timbrar tu factura del Ticket #{ticket} (${total}).

Solo nos faltan tus datos fiscales. Por favor ingresa a este enlace para completarlos en 1 minuto:
{enlace}

¡Muchas gracias por tu visita! 😊👍`,
  },
];

interface ManageInvoicingViewProps {
  renderMaterialHeader: any;
  setAppMode: (mode: any) => void;
  currentUser: any;
  selectedTenant: any;
  COMPANY_CATALOG?: any[];
  customOwners?: any[];
  activeOwnerFilter?: any;
  history?: any[];
  customers?: any[];
  triggerAppNotification: (
    title: string,
    message: string,
    type: "success" | "warning" | "error" | "info"
  ) => void;
}

type InvoicingTabType =
  | "no_timbradas"
  | "timbradas"
  | "requieren_datos"
  | "multi_sucursal"
  | "emisor_csd"
  | "reporte_excel"
  | null;

export const ManageInvoicingView: React.FC<ManageInvoicingViewProps> = ({
  renderMaterialHeader,
  setAppMode,
  currentUser,
  selectedTenant,
  COMPANY_CATALOG = [],
  customOwners = [],
  activeOwnerFilter,
  history = [],
  customers = [],
  triggerAppNotification,
}) => {
  const [activeTab, setActiveTab] = useState<InvoicingTabType>(null);
  const [isWidgetsCollapsed, setIsWidgetsCollapsed] = useState<boolean>(false);

  const handleSelectTab = (tab: InvoicingTabType) => {
    setActiveTab(tab);
    setIsWidgetsCollapsed(true);
  };

  // Invoicing API URL resolution
  const apiUrl = useMemo(() => {
    return selectedTenant?.invoicingApiUrl || DEFAULT_INVOICING_API_URL;
  }, [selectedTenant]);

  // Loading & Data States
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<ApiInvoiceItem[]>([]);
  const [apiResumen, setApiResumen] = useState<{
    total: number;
    timbradas: number;
    no_timbradas: number;
    monto_total_timbrado: number;
    monto_total_no_timbrado: number;
  }>({
    total: 0,
    timbradas: 0,
    no_timbradas: 0,
    monto_total_timbrado: 0,
    monto_total_no_timbrado: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Modal States
  const [resendModalInvoice, setResendModalInvoice] = useState<ApiInvoiceItem | null>(null);
  const [resendEmailInput, setResendEmailInput] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  const [stampConfirmInvoice, setStampConfirmInvoice] = useState<ApiInvoiceItem | null>(null);
  const [stamping, setStamping] = useState(false);
  const [stampErrorDetails, setStampErrorDetails] = useState<{
    title: string;
    explanation: string;
    tip: string;
  } | null>(null);

  const [connectionTestResult, setConnectionTestResult] = useState<any | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Mass Selection & Messaging State
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isMassMessageModalOpen, setIsMassMessageModalOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("template_1");
  const [customMessageText, setCustomMessageText] = useState<string>(INVOICE_REMINDER_TEMPLATES[0].template);
  const [isRotatingTemplates, setIsRotatingTemplates] = useState<boolean>(false);
  const [recipientPhonesOverride, setRecipientPhonesOverride] = useState<Record<string, string>>({});
  const [sendingMassMessages, setSendingMassMessages] = useState<boolean>(false);
  const [massSendProgress, setMassSendProgress] = useState<{
    current: number;
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  const [massSendLog, setMassSendLog] = useState<
    {
      ticketId: string;
      folio: string;
      phone: string;
      status: "success" | "error" | "no_phone";
      error?: string;
    }[]
  >([]);

  // Diagnostics & Real-time Log State
  const [diagnosticLogs, setDiagnosticLogs] = useState<
    { id: string; time: string; level: "INFO" | "SUCCESS" | "WARN" | "ERROR"; message: string; details?: any }[]
  >([]);
  const [apiDiagnostic, setApiDiagnostic] = useState<{
    status: "idle" | "loading" | "connected" | "error";
    message: string;
    lastSync: string;
    statsFound?: any;
    errorDetails?: string;
  }>({
    status: "idle",
    message: "Iniciando diagnóstico de conexión...",
    lastSync: "",
  });
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [remoteLogText, setRemoteLogText] = useState("");
  const [loadingRemoteLog, setLoadingRemoteLog] = useState(false);

  const addDiagnosticLog = (level: "INFO" | "SUCCESS" | "WARN" | "ERROR", message: string, details?: any) => {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      level,
      message,
      details,
    };
    setDiagnosticLogs((prev) => [entry, ...prev].slice(0, 80));
  };

  // Load Invoices from Backend API
  const fetchInvoices = async () => {
    if (!apiUrl) {
      addDiagnosticLog("WARN", "No se ha configurado ninguna URL de API de facturación.");
      setApiDiagnostic({
        status: "error",
        message: "No hay URL de API de facturación configurada.",
        lastSync: new Date().toLocaleTimeString(),
      });
      return;
    }

    setLoading(true);
    addDiagnosticLog("INFO", `Consultando facturas en API: ${apiUrl}`, { query: searchQuery, filterStartDate, filterEndDate });
    
    try {
      const res = await listarFacturasFromApi(apiUrl, {
        estado: "todas",
        busqueda: searchQuery.trim() || undefined,
        fecha_inicio: filterStartDate || undefined,
        fecha_fin: filterEndDate || undefined,
      });

      if (res.ok) {
        const facturasList = res.facturas || [];
        setInvoices(facturasList);
        
        const stats: any = res.resumen || (res as any).stats || {};
        const timbradasCount = Number(
          stats.timbradas ??
          stats.timbradas_count ??
          stats.facturas_timbradas ??
          facturasList.filter((f) => !!f.timbrada || !!f.uuid).length ??
          0
        );
        const noTimbradasCount = Number(
          stats.no_timbradas ??
          stats.pendientes ??
          stats.pendientes_count ??
          facturasList.filter((f) => !f.timbrada && !f.uuid).length ??
          0
        );
        const montoTotal = Number(
          stats.monto_total_timbrado ??
          stats.monto_facturado ??
          stats.total_facturado_monto ??
          facturasList.reduce((acc, f) => (f.timbrada || f.uuid ? acc + (Number(f.total) || 0) : acc), 0) ??
          0
        );
        const totalCount = Number(
          stats.total ??
          stats.total_facturas ??
          stats.total_count ??
          facturasList.length ??
          timbradasCount
        );

        setApiResumen({
          total: totalCount,
          timbradas: timbradasCount,
          no_timbradas: noTimbradasCount,
          monto_total_timbrado: montoTotal,
          monto_total_no_timbrado: stats.monto_total_no_timbrado ?? 0,
        });

        addDiagnosticLog(
          "SUCCESS",
          `✅ Facturas sincronizadas: ${timbradasCount} timbradas ($${montoTotal.toFixed(2)} MXN), ${noTimbradasCount} pendientes (${facturasList.length} en lista).`,
          stats
        );

        setApiDiagnostic({
          status: "connected",
          message: `Conectado a MySQL (${timbradasCount} facturas timbradas por $${montoTotal.toFixed(2)} MXN)`,
          lastSync: new Date().toLocaleTimeString(),
          statsFound: { totalCount, timbradasCount, noTimbradasCount, montoTotal },
        });
      } else {
        const errMsg = res.error || "El servidor no devolvió lista de facturas.";
        addDiagnosticLog("ERROR", `⚠️ Error al consultar facturas: ${errMsg}`);
        setApiDiagnostic({
          status: "error",
          message: errMsg,
          lastSync: new Date().toLocaleTimeString(),
          errorDetails: errMsg,
        });
        triggerAppNotification("ℹ️ Facturación", errMsg, "warning");
      }
    } catch (err: any) {
      console.error("Error al consultar facturas:", err);
      const errMsg = err.message || "Error al conectar con la API de facturación.";
      addDiagnosticLog("ERROR", `❌ Excepción de red/servidor: ${errMsg}`);
      setApiDiagnostic({
        status: "error",
        message: errMsg,
        lastSync: new Date().toLocaleTimeString(),
        errorDetails: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [apiUrl]);

  // Handle Testing Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);
    addDiagnosticLog("INFO", `Ejecutando Ping / Test de Conexión a ${apiUrl}...`);
    try {
      const res = await testConexionFacturacion(apiUrl);
      setConnectionTestResult(res);
      if (res.ok) {
        const stats: any = (res as any).stats || (res as any).resumen || {};
        const timbradas = stats.timbradas ?? stats.facturas_timbradas ?? 0;
        const monto = stats.monto_facturado ?? stats.monto_total_timbrado ?? 0;
        addDiagnosticLog("SUCCESS", `✅ Conexión PHP/MySQL OK: ${timbradas} facturas timbradas ($${Number(monto).toFixed(2)} MXN).`, res);
        
        // Actualizar resumen si vino en el ping
        if (timbradas > 0 || monto > 0) {
          setApiResumen((prev) => ({
            ...prev,
            timbradas: timbradas > 0 ? timbradas : prev.timbradas,
            monto_total_timbrado: monto > 0 ? monto : prev.monto_total_timbrado,
          }));
        }

        setApiDiagnostic({
          status: "connected",
          message: `Servidor PHP y MySQL en línea (${timbradas} timbradas, $${Number(monto).toFixed(2)})`,
          lastSync: new Date().toLocaleTimeString(),
          statsFound: stats,
        });
        triggerAppNotification("✅ Conexión Exitosa", `Servidor PHP activo: ${timbradas} facturas timbradas ($${Number(monto).toFixed(2)} MXN).`, "success");
      } else {
        const errMsg = res.error || "No se pudo conectar al servidor PHP.";
        addDiagnosticLog("ERROR", `❌ Fallo en test de conexión: ${errMsg}`);
        setApiDiagnostic({
          status: "error",
          message: errMsg,
          lastSync: new Date().toLocaleTimeString(),
          errorDetails: errMsg,
        });
        triggerAppNotification("⚠️ Error de Conexión", errMsg, "error");
      }
    } catch (e: any) {
      const errMsg = e.message || "Error de red al conectar.";
      setConnectionTestResult({ ok: false, error: errMsg });
      addDiagnosticLog("ERROR", `❌ Excepción en test de conexión: ${errMsg}`);
      setApiDiagnostic({
        status: "error",
        message: errMsg,
        lastSync: new Date().toLocaleTimeString(),
        errorDetails: errMsg,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Abrir y consultar facturas.log del servidor
  const handleOpenLogModal = async () => {
    setIsLogModalOpen(true);
    setLoadingRemoteLog(true);
    try {
      const res = await obtenerLogServidorFacturacion(apiUrl);
      if (res.ok && res.log) {
        setRemoteLogText(res.log);
      } else {
        setRemoteLogText(`[${new Date().toLocaleString()}] No se pudo leer facturas.log remoto: ${res.error || "Archivo no disponible aún en el servidor."}`);
      }
    } catch (err: any) {
      setRemoteLogText(`[${new Date().toLocaleString()}] Error al solicitar facturas.log: ${err.message}`);
    } finally {
      setLoadingRemoteLog(false);
    }
  };

  // Descargar archivo facturas.log localmente
  const handleDownloadLogFile = () => {
    const header = `=== BITACORA LOCAL Y REMOTA DE FACTURACION CFDI 4.0 ===\nFecha de descarga: ${new Date().toLocaleString()}\nEndpoint API: ${apiUrl}\n\n--- EVENTOS DE LA SESION EN VIVO ---\n`;
    const sessionText = diagnosticLogs
      .map((l) => `[${l.time}] [${l.level}] ${l.message} ${l.details ? JSON.stringify(l.details) : ""}`)
      .join("\n");
    const remoteSection = `\n\n--- CONTENIDO DEL ARCHIVO facturas.log REMOTO ---\n${remoteLogText || "(Sin registros remotos consultados)"}\n`;

    const blob = new Blob([header + sessionText + remoteSection], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "facturas.log";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerAppNotification("💾 Log Descargado", "Archivo facturas.log descargado exitosamente.", "success");
  };

  // Detector universal de Factura Timbrada (compatible con esquemas nuevos y legados)
  const isInvoiceStamped = (i: ApiInvoiceItem | any): boolean => {
    if (!i) return false;
    if (Boolean(i.timbrada && i.timbrada !== 0 && i.timbrada !== "0")) return true;
    if (i.uuid && typeof i.uuid === "string" && i.uuid.trim() !== "" && i.uuid.trim() !== "0" && i.uuid.trim().length > 5) return true;
    if (i.estado && (i.estado === "TIMBRADA" || i.estado === "1" || i.estado === "ACTIVA")) return true;
    if (i.xml_url && typeof i.xml_url === "string" && i.xml_url.trim().length > 0 && !i.xml_url.endsWith("/.xml") && !i.xml_url.endsWith("factura_.xml")) return true;
    if (i.xml && typeof i.xml === "string" && i.xml.trim().length > 3) return true;
    return false;
  };

  // Pre-Facturas (No Timbradas)
  const preFacturas = useMemo(() => {
    return invoices.filter((i) => !isInvoiceStamped(i));
  }, [invoices]);

  // Facturas Timbradas
  const facturasTimbradas = useMemo(() => {
    return invoices.filter((i) => isInvoiceStamped(i));
  }, [invoices]);

  // Contadores y montos consolidados (combinando lista obtenida y resumen directo del servidor)
  const totalTimbradasCount = useMemo(() => {
    return Math.max(facturasTimbradas.length, apiResumen.timbradas || 0);
  }, [facturasTimbradas.length, apiResumen.timbradas]);

  const totalMontoTimbrado = useMemo(() => {
    const fromList = facturasTimbradas.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
    return fromList > 0 ? fromList : (apiResumen.monto_total_timbrado || 0);
  }, [facturasTimbradas, apiResumen.monto_total_timbrado]);

  const totalNoTimbradasCount = useMemo(() => {
    return Math.max(preFacturas.length, apiResumen.no_timbradas || 0);
  }, [preFacturas.length, apiResumen.no_timbradas]);

  const totalMontoNoTimbrado = useMemo(() => {
    const fromList = preFacturas.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
    return fromList > 0 ? fromList : (apiResumen.monto_total_no_timbrado || 0);
  }, [preFacturas, apiResumen.monto_total_no_timbrado]);

  const totalGeneralFacturas = useMemo(() => {
    return Math.max(invoices.length, apiResumen.total || 0, totalTimbradasCount + totalNoTimbradasCount);
  }, [invoices.length, apiResumen.total, totalTimbradasCount, totalNoTimbradasCount]);

  // Cuentas de Firestore que solicitaron factura pero aún no tienen datos fiscales
  const ticketsRequierenFactura = useMemo(() => {
    return history.filter((h: any) => {
      const requires = h.requiresInvoice === true;
      if (!requires) return false;
      // Verificar si ya existe en las facturas de la API por ticket o folio
      const alreadyPreFacturada = invoices.some(
        (inv) =>
          String(inv.ticket || inv.ticket_id) === String(h.folio || h.id) ||
          String(inv.folio) === String(h.folio || h.id)
      );
      return !alreadyPreFacturada;
    });
  }, [history, invoices]);

  // List of branches for multi-sucursal filter
  const branchList = useMemo(() => {
    if (!COMPANY_CATALOG || COMPANY_CATALOG.length === 0) return [];
    if (activeOwnerFilter) {
      return COMPANY_CATALOG.filter((c) => c.ownerKey === activeOwnerFilter);
    }
    return COMPANY_CATALOG;
  }, [COMPANY_CATALOG, activeOwnerFilter]);

  // Filtered List based on Search, Tab & Branch
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isStamped = isInvoiceStamped(inv);
      // Tab filter
      if (activeTab === "no_timbradas") {
        if (isStamped) return false;
      } else if (activeTab === "timbradas") {
        if (!isStamped) return false;
      }

      if (selectedBranchId !== "ALL") {
        if (inv.tenant_id && inv.tenant_id !== selectedBranchId) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRfc = (inv.rfc || "").toLowerCase().includes(q);
        const matchName = (inv.razon_social || "").toLowerCase().includes(q);
        const matchFolio = String(inv.folio || "").includes(q);
        const matchTicket = String(inv.ticket || inv.ticket_id || "").includes(q);
        const matchUuid = (inv.uuid || "").toLowerCase().includes(q);
        if (!matchRfc && !matchName && !matchFolio && !matchTicket && !matchUuid) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, activeTab, selectedBranchId, searchQuery]);

  // Active tab metadata for collapsed header
  const activeTabMeta = useMemo(() => {
    switch (activeTab) {
      case "no_timbradas":
        return {
          title: "Pre-Facturas (No Timbradas)",
          subtitle: "Borradores con datos listos para timbrar ante el SAT",
          icon: "⏳",
          badgeBg: "bg-amber-100 text-amber-800 border border-amber-200",
          countBadge: "bg-amber-100 text-amber-800 border border-amber-200",
          count: `${totalNoTimbradasCount} no timbradas en total`,
          extra: `$${totalMontoNoTimbrado.toFixed(2)}`,
        };
      case "timbradas":
        return {
          title: "Facturas Timbradas (SAT)",
          subtitle: "Comprobantes fiscales oficiales CFDI 4.0 con UUID, PDF y XML",
          icon: "✅",
          badgeBg: "bg-emerald-100 text-emerald-800 border border-emerald-200",
          countBadge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
          count: `${totalTimbradasCount} timbradas en total`,
          extra: `$${totalMontoTimbrado.toFixed(2)}`,
        };
      case "requieren_datos":
        return {
          title: "Requieren Factura (Sin Datos)",
          subtitle: "Cuentas marcadas en caja esperando datos fiscales del cliente",
          icon: "🧾",
          badgeBg: "bg-cyan-100 text-cyan-800 border border-cyan-200",
          countBadge: "bg-cyan-100 text-cyan-800 border border-cyan-200",
          count: `${ticketsRequierenFactura.length} tickets`,
          extra: `$${ticketsRequierenFactura.reduce((acc, t: any) => acc + (Number(t.total) || 0), 0).toFixed(2)}`,
        };
      case "multi_sucursal":
        return {
          title: "Control Multi-Sucursal",
          subtitle: "Consolidado de emisión fiscal entre sucursales e inquilinos",
          icon: "🌐",
          badgeBg: "bg-indigo-100 text-indigo-800 border border-indigo-200",
          countBadge: "bg-indigo-100 text-indigo-800 border border-indigo-200",
          count: `${branchList.length || 1} sucursales`,
          extra: selectedTenant?.name || "Matriz",
        };
      case "emisor_csd":
        return {
          title: "Emisor Fiscal & Conexión PAC",
          subtitle: "Diagnóstico de conexión PHP, sellos CSD y configuración",
          icon: "🏢",
          badgeBg: "bg-violet-100 text-violet-800 border border-violet-200",
          countBadge: "bg-violet-100 text-violet-800 border border-violet-200",
          count: "Conexión Activa",
          extra: selectedTenant?.rfc || "RFC Activo",
        };
      case "reporte_excel":
        return {
          title: "Reporte Contable Fiscal",
          subtitle: "Desglose contable de Subtotal, IVA 16%, Retenciones y Totales",
          icon: "📊",
          badgeBg: "bg-blue-100 text-blue-800 border border-blue-200",
          countBadge: "bg-blue-100 text-blue-800 border border-blue-200",
          count: `${totalGeneralFacturas} facturas en total`,
          extra: `$${(totalMontoTimbrado + totalMontoNoTimbrado).toFixed(2)}`,
        };
      default:
        return {
          title: "Todas las Facturas y Borradores",
          subtitle: "Listado general consolidado de comprobantes fiscales",
          icon: "📑",
          badgeBg: "bg-indigo-100 text-indigo-800 border border-indigo-200",
          countBadge: "bg-indigo-100 text-indigo-800 border border-indigo-200",
          count: `${totalGeneralFacturas} registros en total`,
          extra: `$${(totalMontoTimbrado + totalMontoNoTimbrado).toFixed(2)}`,
        };
    }
  }, [
    activeTab,
    preFacturas,
    facturasTimbradas,
    totalTimbradasCount,
    totalMontoTimbrado,
    totalNoTimbradasCount,
    totalMontoNoTimbrado,
    totalGeneralFacturas,
    ticketsRequierenFactura,
    branchList,
    selectedTenant,
    invoices,
    apiResumen,
  ]);

  // Immediate 1-Click Stamping
  const handleImmediateStamp = async (invoice: ApiInvoiceItem) => {
    setStamping(true);
    setStampErrorDetails(null);
    try {
      const res = await timbrarFactura(apiUrl, {
        folio: Number(invoice.folio),
        serie: invoice.serie || "A",
      });

      if (res.ok && res.uuid) {
        triggerAppNotification(
          "🎉 ¡Factura Timbrada con Éxito!",
          `Folio #${invoice.folio} timbrado ante el SAT. UUID: ${res.uuid.slice(0, 8)}...`,
          "success"
        );
        setStampConfirmInvoice(null);
        await fetchInvoices();
      } else {
        const friendly = formatFriendlySatError(res.error || "Error al timbrar");
        setStampErrorDetails(friendly);
      }
    } catch (err: any) {
      setStampErrorDetails({
        title: "Error de Conexión",
        explanation: err.message || "Ocurrió un error al contactar el servidor de timbrado.",
        tip: "Verifique su conexión a internet y vuelva a intentarlo.",
      });
    } finally {
      setStamping(false);
    }
  };

  // Discard Draft Pre-Invoice
  const handleDiscardDraft = async (invoice: ApiInvoiceItem) => {
    if (!window.confirm(`¿Está seguro de descartar y eliminar el borrador Folio #${invoice.folio}?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await descartarFactura(apiUrl, { folio: Number(invoice.folio) });
      if (res.ok) {
        triggerAppNotification("🗑️ Borrador Eliminado", `El borrador #${invoice.folio} fue eliminado correctamente.`, "info");
        await fetchInvoices();
      } else {
        triggerAppNotification("⚠️ Error", res.error || "No se pudo eliminar el borrador.", "error");
      }
    } catch (err: any) {
      triggerAppNotification("⚠️ Error", err.message || "Error al conectar.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Action
  const handleResendEmail = async () => {
    if (!resendModalInvoice || !resendEmailInput.trim()) {
      triggerAppNotification("⚠️ Ingrese un correo", "Por favor escriba la dirección de correo del cliente.", "warning");
      return;
    }

    setResendingEmail(true);
    try {
      const res = await reenviarFacturaPorCorreo(apiUrl, {
        folio: Number(resendModalInvoice.folio),
        email: resendEmailInput.trim(),
        pdf_url: resendModalInvoice.pdf_url,
        xml_url: resendModalInvoice.xml_url,
      });

      if (res.ok) {
        triggerAppNotification(
          "📧 Correo Enviado",
          `Los archivos PDF y XML de la factura #${resendModalInvoice.folio} fueron reenviados a ${resendEmailInput.trim()}.`,
          "success"
        );
        setResendModalInvoice(null);
      } else {
        triggerAppNotification("⚠️ Error de Envío", res.error || "No se pudo enviar el correo.", "error");
      }
    } catch (err: any) {
      triggerAppNotification("⚠️ Error", err.message || "Error al reenviar correo.", "error");
    } finally {
      setResendingEmail(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (invoices.length === 0) {
      triggerAppNotification("⚠️ Sin Datos", "No hay facturas para exportar.", "warning");
      return;
    }

    const rows = invoices.map((inv) => {
      const subtotal = inv.subtotal ?? (inv.total ? Number((inv.total / 1.16).toFixed(2)) : 0);
      const iva = inv.iva ?? (inv.total ? Number((inv.total - subtotal).toFixed(2)) : 0);
      const isr = inv.retencion_isr ?? 0;

      return {
        "Folio Factura": inv.folio,
        "Serie": inv.serie || "A",
        "Fecha Emisión": inv.fecha || "",
        "Ticket / Cuenta": inv.ticket || inv.ticket_id || "",
        "Estado": inv.timbrada || inv.uuid ? "TIMBRADA SAT" : "PRE-FACTURA (NO TIMBRADA)",
        "RFC Receptor": inv.rfc,
        "Razón Social": inv.razon_social,
        "Régimen Fiscal": inv.regimen_fiscal || "",
        "Uso CFDI": inv.uso_cfdi || "G03",
        "Forma de Pago": inv.forma_pago || "01",
        "Método de Pago": inv.metodo_pago || "PUE",
        "Subtotal ($)": subtotal,
        "IVA 16% ($)": iva,
        "Retención ISR 1.25% ($)": isr,
        "Total ($)": inv.total,
        "UUID Fiscal SAT": inv.uuid || "PENDIENTE",
        "Correo Cliente": inv.email || "",
        "Teléfono": inv.telefono || "",
        "Enlace PDF": inv.pdf_url || "",
        "Enlace XML": inv.xml_url || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas CFDI 4.0");

    const fileName = `Reporte_Facturacion_${selectedTenant?.name?.replace(/\s+/g, "_") || "Cocinet"}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    triggerAppNotification("📊 Excel Generado", `Se ha descargado el reporte ${fileName}`, "success");
  };

  // Helper to copy customer portal link
  const copyCustomerPortalLink = (ticketFolio: string | number, phone?: string) => {
    const origin = window.location.origin;
    const tenantParam = selectedTenant?.id ? `&tenant=${encodeURIComponent(selectedTenant.id)}` : "";
    const phoneParam = phone ? `&phone=${encodeURIComponent(phone)}` : "";
    const url = `${origin}/?action=facturacion&folio=${ticketFolio}${phoneParam}${tenantParam}`;

    navigator.clipboard.writeText(url);
    triggerAppNotification(
      "📋 Enlace Copiado",
      "Liga directa del portal de autofacturación copiada para enviar por WhatsApp o SMS al cliente.",
      "success"
    );
  };

  // Helper for ticket multi-selection
  const handleToggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllTickets = () => {
    const allIds = ticketsRequierenFactura.map((t: any) => String(t.id || t.folio));
    setSelectedTicketIds(allIds);
  };

  const handleDeselectAllTickets = () => {
    setSelectedTicketIds([]);
  };

  const isAllTicketsSelected =
    ticketsRequierenFactura.length > 0 &&
    ticketsRequierenFactura.every((t: any) => selectedTicketIds.includes(String(t.id || t.folio)));

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = INVOICE_REMINDER_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setCustomMessageText(tmpl.template);
    }
  };

  const formatTicketMessage = (templateText: string, ticket: any, index?: number) => {
    let text = templateText;
    if (isRotatingTemplates && typeof index === "number") {
      const rotated = INVOICE_REMINDER_TEMPLATES[index % INVOICE_REMINDER_TEMPLATES.length].template;
      text = rotated;
    }
    const branchName = selectedTenant?.name || "Restaurante";
    const folio = ticket.folio || ticket.id || "-";
    const total = Number(ticket.total || 0).toFixed(2);
    const clientName = ticket.customerName || ticket.clientName || "";
    const clientGreeting = clientName ? ` *${clientName.trim()}*` : "";
    const phone =
      recipientPhonesOverride[String(ticket.id || ticket.folio)] ||
      ticket.invoicePhone ||
      ticket.phone ||
      ticket.customerPhone ||
      ticket.clientPhone ||
      "";
    const portalUrl = generateInvoicePortalUrl({
      phone,
      tenantId: selectedTenant?.id,
      folio,
    });

    return text
      .replace(/{sucursal}/g, branchName)
      .replace(/{ticket}/g, String(folio))
      .replace(/{folio}/g, String(folio))
      .replace(/{total}/g, total)
      .replace(/{cliente}/g, clientGreeting)
      .replace(/{enlace}/g, portalUrl)
      .replace(/{telefono}/g, phone);
  };

  const handleOpenMassModalWithSelection = () => {
    if (selectedTicketIds.length === 0) {
      handleSelectAllTickets();
    }
    setMassSendProgress(null);
    setMassSendLog([]);
    setIsMassMessageModalOpen(true);
  };

  const handleSendSingleTicketWhatsApp = (ticket: any) => {
    const key = String(ticket.id || ticket.folio);
    setSelectedTicketIds([key]);
    setMassSendProgress(null);
    setMassSendLog([]);
    setIsMassMessageModalOpen(true);
  };

  const handleOpenWhatsAppWebDirect = (ticket: any) => {
    const key = String(ticket.id || ticket.folio);
    const phone =
      recipientPhonesOverride[key] ||
      ticket.invoicePhone ||
      ticket.phone ||
      ticket.customerPhone ||
      ticket.clientPhone ||
      "";
    const cleanPhone = phone.replace(/\D/g, "");
    const text = formatTicketMessage(customMessageText, ticket);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSendMassWhatsApp = async () => {
    const targetTickets = ticketsRequierenFactura.filter((t: any) =>
      selectedTicketIds.includes(String(t.id || t.folio))
    );

    if (targetTickets.length === 0) {
      triggerAppNotification("⚠️ Sin Selección", "Selecciona al menos un ticket para enviar.", "warning");
      return;
    }

    setSendingMassMessages(true);
    setMassSendProgress({ current: 0, total: targetTickets.length, success: 0, failed: 0 });
    const logs: {
      ticketId: string;
      folio: string;
      phone: string;
      status: "success" | "error" | "no_phone";
      error?: string;
    }[] = [];

    for (let i = 0; i < targetTickets.length; i++) {
      const t = targetTickets[i];
      const ticketKey = String(t.id || t.folio);
      const phone =
        recipientPhonesOverride[ticketKey] ||
        t.invoicePhone ||
        t.phone ||
        t.customerPhone ||
        t.clientPhone ||
        "";
      const cleanPhone = phone.replace(/\D/g, "");

      if (!cleanPhone || cleanPhone.length < 10) {
        logs.push({
          ticketId: ticketKey,
          folio: String(t.folio || t.id),
          phone: phone || "Sin número",
          status: "no_phone",
          error: "No cuenta con teléfono celular válido (10 dígitos)",
        });
        setMassSendProgress({
          current: i + 1,
          total: targetTickets.length,
          success: logs.filter((l) => l.status === "success").length,
          failed: logs.filter((l) => l.status !== "success").length,
        });
        continue;
      }

      const messageText = formatTicketMessage(customMessageText, t, i);

      try {
        const res = await sendSilentWhatsAppMessage(cleanPhone, messageText);
        if (res.success) {
          logs.push({
            ticketId: ticketKey,
            folio: String(t.folio || t.id),
            phone: cleanPhone,
            status: "success",
          });
        } else {
          logs.push({
            ticketId: ticketKey,
            folio: String(t.folio || t.id),
            phone: cleanPhone,
            status: "error",
            error: res.error || "Fallo de envío en pasarela WhatsApp",
          });
        }
      } catch (err: any) {
        logs.push({
          ticketId: ticketKey,
          folio: String(t.folio || t.id),
          phone: cleanPhone,
          status: "error",
          error: err.message || "Error al conectar con WhatsApp",
        });
      }

      const currentSuccess = logs.filter((l) => l.status === "success").length;
      const currentFailed = logs.filter((l) => l.status !== "success").length;
      setMassSendProgress({
        current: i + 1,
        total: targetTickets.length,
        success: currentSuccess,
        failed: currentFailed,
      });

      if (i < targetTickets.length - 1) {
        await new Promise((r) => setTimeout(r, 450));
      }
    }

    setMassSendLog(logs);
    setSendingMassMessages(false);

    const finalSuccess = logs.filter((l) => l.status === "success").length;
    const finalFailed = logs.filter((l) => l.status !== "success").length;

    if (finalSuccess > 0) {
      triggerAppNotification(
        "🎉 Recordatorios Enviados",
        `Se enviaron exitosamente ${finalSuccess} mensajes de WhatsApp. ${finalFailed > 0 ? `(${finalFailed} con detalle o sin teléfono)` : ""}`,
        "success"
      );
    } else {
      triggerAppNotification(
        "⚠️ Envíos Incompletos",
        `No se pudo enviar ningún mensaje automático. Puedes usar el botón de WhatsApp Web directo.`,
        "warning"
      );
    }
  };

  return (
    <IonPage className="bg-slate-100 text-slate-800">
      {renderMaterialHeader(
        "Módulo de Facturación CFDI 4.0",
        () => setAppMode("floorplan"),
        "🧾"
      )}

      <IonContent className="bg-slate-100" fullscreen>
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
          <AnimatePresence mode="wait">
            {isWidgetsCollapsed ? (
              /* ========================================================= */
              /* COMPACT COLLAPSED BAR WITH ACTIVE TITLE & DOWN ARROW      */
              /* ========================================================= */
              <motion.div
                key="collapsed-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsWidgetsCollapsed(false)}
                className="bg-white p-3.5 md:p-4 rounded-2xl border border-slate-200 shadow-sm mb-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-indigo-400 hover:shadow-md transition group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105 ${activeTabMeta.badgeBg}`}
                  >
                    {activeTabMeta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                        Módulo Activo
                      </span>
                      <h2 className="text-sm md:text-base font-black text-slate-800 group-hover:text-indigo-600 transition">
                        {activeTabMeta.title}
                      </h2>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${activeTabMeta.countBadge}`}>
                        {activeTabMeta.count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">{selectedTenant?.name || "Sucursal Matriz"}</span>
                      <span>•</span>
                      <span>{activeTabMeta.subtitle}</span>
                      {activeTabMeta.extra && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-indigo-600">{activeTabMeta.extra}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchInvoices();
                    }}
                    disabled={loading}
                    className="p-2 md:px-3 md:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    title="Sincronizar con el servidor"
                  >
                    <IonIcon icon={refreshOutline} className={`text-sm ${loading ? "animate-spin text-indigo-600" : ""}`} />
                    <span className="hidden sm:inline">{loading ? "Sincronizando..." : "Sincronizar"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportExcel();
                    }}
                    className="p-2 md:px-3 md:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    title="Exportar a Excel"
                  >
                    <IonIcon icon={downloadOutline} className="text-sm" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>

                  <button
                    onClick={() => setIsWidgetsCollapsed(false)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer"
                    title="Desplegar módulos y estadísticas"
                  >
                    <IonIcon icon={gridOutline} className="text-sm" />
                    <span>Módulos</span>
                    <IonIcon icon={chevronDownOutline} className="text-sm group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ========================================================= */
              /* FULL HEADER & 6 DASHBOARD WIDGET CARDS                    */
              /* ========================================================= */
              <motion.div
                key="expanded-widgets"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-6"
              >
                {/* Header & Tenant Badge */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-sm text-indigo-600">
                      🧾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                          CFDI 4.0 Pro
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🟢 Enlace MySQL Directo
                        </span>
                      </div>
                      <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                        Gestión y Control de Facturación
                      </h1>
                      <p className="text-xs text-slate-500">
                        {selectedTenant?.name || "Sucursal Matriz"} • RFC Emisor:{" "}
                        <strong className="text-slate-700">{selectedTenant?.rfc || "EMISOR ACTIVO"}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions & Collapse Button */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={fetchInvoices}
                      disabled={loading}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <IonIcon icon={refreshOutline} className={`text-base ${loading ? "animate-spin text-indigo-600" : ""}`} />
                      <span>{loading ? "Sincronizando..." : "Sincronizar"}</span>
                    </button>

                    <button
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                    >
                      <IonIcon icon={downloadOutline} className="text-base" />
                      <span>Exportar Excel</span>
                    </button>

                    <button
                      onClick={() => setIsWidgetsCollapsed(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
                      title="Plegar cuadrícula para ver directamente la tabla"
                    >
                      <IonIcon icon={chevronUpOutline} className="text-sm" />
                      <span>Plegar</span>
                    </button>
                  </div>
                </div>

                {/* Live Diagnostic & Server Log Status Banner */}
                <div className="mb-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                  <div className="flex items-start md:items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      apiDiagnostic.status === 'connected' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                      apiDiagnostic.status === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
                      'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      {apiDiagnostic.status === 'connected' ? '📡' : apiDiagnostic.status === 'error' ? '⚠️' : '⏳'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">Estado de Servidor & API:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          apiDiagnostic.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          apiDiagnostic.status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {apiDiagnostic.status === 'connected' ? '🟢 EN LÍNEA' : apiDiagnostic.status === 'error' ? '🔴 ERROR' : '🟡 SINCRONIZANDO'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">• {apiUrl}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        {apiDiagnostic.message} {apiDiagnostic.lastSync && <span className="text-slate-400">({apiDiagnostic.lastSync})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto flex-wrap">
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <IonIcon icon={refreshOutline} className={testingConnection ? 'animate-spin text-indigo-600' : ''} />
                      <span>{testingConnection ? 'Probando...' : 'Probar Conexión (Ping)'}</span>
                    </button>
                    <button
                      onClick={handleOpenLogModal}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <IonIcon icon={documentTextOutline} />
                      <span>📋 Ver Registro / facturas.log</span>
                    </button>
                    <button
                      onClick={handleDownloadLogFile}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      title="Descargar archivo facturas.log local"
                    >
                      <IonIcon icon={downloadOutline} />
                      <span>💾 Descargar .log</span>
                    </button>
                  </div>
                </div>

                {/* 6 DASHBOARD WIDGET CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Widget 1: Pre-Facturas Pendientes / No Timbradas */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("no_timbradas")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "no_timbradas"
                        ? "bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/30"
                        : "bg-white border-slate-200 hover:border-amber-400 hover:shadow-md hover:bg-amber-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-xl text-amber-700">
                        ⏳
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "no_timbradas" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-amber-600">
                          {totalNoTimbradasCount}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">Pre-Facturas (No Timbradas)</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Datos listos en MySQL esperando timbrado PAC/SAT.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Total por Timbrar:</span>
                      <span className="font-bold text-amber-600">
                        ${totalMontoNoTimbrado.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>

                  {/* Widget 2: Facturas Timbradas ante el SAT */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("timbradas")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "timbradas"
                        ? "bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-400/30"
                        : "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-xl text-emerald-700">
                        ✅
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "timbradas" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-emerald-600">
                          {totalTimbradasCount}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">Facturas Timbradas (SAT)</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Comprobantes oficiales con UUID, PDF y XML listos.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Monto Total Timbrado:</span>
                      <span className="font-bold text-emerald-600">
                        ${totalMontoTimbrado.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>

                  {/* Widget 3: Cuentas que Requieren Factura (Sin Datos) */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("requieren_datos")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "requieren_datos"
                        ? "bg-cyan-50/80 border-cyan-400 shadow-md ring-2 ring-cyan-400/30"
                        : "bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md hover:bg-cyan-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-cyan-100/70 border border-cyan-200 flex items-center justify-center text-xl text-cyan-700">
                        🧾
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "requieren_datos" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-cyan-600">
                          {ticketsRequierenFactura.length}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">Requieren Factura (Sin Datos)</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tickets marcados en caja esperando captura del cliente.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Monto Pendiente:</span>
                      <span className="font-bold text-cyan-600">
                        ${ticketsRequierenFactura.reduce((acc, t: any) => acc + (Number(t.total) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>

                  {/* Widget 4: Multi-Sucursal (Todos los Inquilinos) */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("multi_sucursal")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "multi_sucursal"
                        ? "bg-indigo-50/80 border-indigo-400 shadow-md ring-2 ring-indigo-400/30"
                        : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100/70 border border-indigo-200 flex items-center justify-center text-xl text-indigo-700">
                        🌐
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "multi_sucursal" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-indigo-600">
                          {branchList.length || 1}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">Todas las Sucursales</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Control consolidado de emisión y folios multi-inquilino.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Sucursal Actual:</span>
                      <span className="font-bold text-indigo-600 truncate max-w-[140px]">
                        {selectedTenant?.name || "Matriz"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Widget 5: Emisor Fiscal y Conexión CSD/SAT */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("emisor_csd")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "emisor_csd"
                        ? "bg-violet-50/80 border-violet-400 shadow-md ring-2 ring-violet-400/30"
                        : "bg-white border-slate-200 hover:border-violet-400 hover:shadow-md hover:bg-violet-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-violet-100/70 border border-violet-200 flex items-center justify-center text-xl text-violet-700">
                        🏢
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "emisor_csd" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                            Activo
                          </span>
                        )}
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                          CSD SAT 4.0
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">Emisor Fiscal & PAC</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Estado de conexión con el backend PHP, sellos y PAC.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Estado Conexión:</span>
                      <span className="font-bold text-emerald-600">🟢 Conectado</span>
                    </div>
                  </motion.div>

                  {/* Widget 6: Reporte y Contabilidad */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("reporte_excel")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "reporte_excel"
                        ? "bg-blue-50/80 border-blue-400 shadow-md ring-2 ring-blue-400/30"
                        : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-xl text-blue-700">
                        📊
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "reporte_excel" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-blue-600">
                          {totalGeneralFacturas}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">Reporte Contable Fiscal</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Desglose de Subtotal, IVA 16%, Retenciones y Totales.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Facturación Total:</span>
                      <span className="font-bold text-blue-600">
                        ${(totalMontoTimbrado + totalMontoNoTimbrado).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================= */}
          {/* SEARCH & FILTERS TOOLBAR                                  */}
          {/* ========================================================= */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <IonIcon icon={searchOutline} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por RFC, Razón Social, Folio o Ticket..."
                className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <IonIcon icon={closeOutline} />
                </button>
              )}
            </div>

            {/* Branch Filter */}
            {branchList.length > 1 && (
              <div className="w-full md:w-56">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="ALL">🏢 Todas las Sucursales</option>
                  {branchList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tab Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab(null)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === null
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Todas ({totalGeneralFacturas})
              </button>
              <button
                onClick={() => setActiveTab("no_timbradas")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "no_timbradas"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ⏳ No Timbradas ({totalNoTimbradasCount})
              </button>
              <button
                onClick={() => setActiveTab("timbradas")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "timbradas"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ✅ Timbradas ({totalTimbradasCount})
              </button>
              <button
                onClick={() => setActiveTab("requieren_datos")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "requieren_datos"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🧾 Sin Datos ({ticketsRequierenFactura.length})
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB CONTENT: TAB 5 - EMISOR FISCAL Y CONEXIÓN            */}
          {/* ========================================================= */}
          {activeTab === "emisor_csd" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>🏢</span> Configuración del Emisor Fiscal & API PHP
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Parámetros de conexión y timbrado del emisor activo.
                  </p>
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <IonIcon icon={refreshOutline} className={testingConnection ? "animate-spin" : ""} />
                  <span>{testingConnection ? "Probando..." : "Probar Conexión con Servidor"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">URL del Endpoint PHP</span>
                  <p className="text-sm font-mono font-bold text-indigo-600 mt-1 break-all">
                    {apiUrl}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Razón Social Emisor</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedTenant?.name || "COCINET DEMO"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">RFC Emisor</span>
                  <p className="text-sm font-mono font-bold text-amber-600 mt-1">
                    {selectedTenant?.rfc || "XAXX010101000"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Régimen Fiscal Emisor</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedTenant?.regimenFiscal || "601 - General de Ley Personas Morales"}
                  </p>
                </div>
              </div>

              {connectionTestResult && (
                <div className={`mt-5 p-4 rounded-xl border ${
                  connectionTestResult.ok
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-red-50 border-red-300 text-red-800"
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>{connectionTestResult.ok ? "✅" : "⚠️"}</span>
                    <span>{connectionTestResult.ok ? "Conexión Exitosa con MySQL" : "Fallo de Conexión"}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">
                    {connectionTestResult.mensaje || connectionTestResult.error || JSON.stringify(connectionTestResult)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB CONTENT: TAB 3 - CUENTAS QUE REQUIEREN FACTURA       */}
          {/* ========================================================= */}
          {activeTab === "requieren_datos" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 mb-6 shadow-sm">
              {/* Header & Quick Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧾</span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Cuentas Pendientes de Datos Fiscales
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-200">
                      {ticketsRequierenFactura.length} tickets
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cuentas que solicitaron factura en caja pero el cliente aún no captura su RFC ni datos de emisión.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {ticketsRequierenFactura.length > 0 && (
                    <>
                      <button
                        onClick={
                          isAllTicketsSelected ? handleDeselectAllTickets : handleSelectAllTickets
                        }
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <IonIcon
                          icon={isAllTicketsSelected ? checkmarkDoneOutline : checkboxOutline}
                          className="text-sm"
                        />
                        <span>{isAllTicketsSelected ? "Deseleccionar Todos" : "Seleccionar Todos"}</span>
                      </button>

                      <button
                        onClick={handleOpenMassModalWithSelection}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
                        title="Enviar recordatorio por WhatsApp a los tickets seleccionados"
                      >
                        <IonIcon icon={logoWhatsapp} className="text-base" />
                        <span>
                          Enviar Mensaje Masivo {selectedTicketIds.length > 0 ? `(${selectedTicketIds.length})` : `(${ticketsRequierenFactura.length})`}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Selection Alert Bar */}
              {selectedTicketIds.length > 0 && (
                <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    <span className="font-bold">
                      {selectedTicketIds.length} de {ticketsRequierenFactura.length} tickets seleccionados
                    </span>
                    <span className="text-cyan-700 font-semibold">
                      (Total: $
                      {ticketsRequierenFactura
                        .filter((t: any) => selectedTicketIds.includes(String(t.id || t.folio)))
                        .reduce((acc: number, t: any) => acc + (Number(t.total) || 0), 0)
                        .toFixed(2)}
                      )
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeselectAllTickets}
                      className="px-2.5 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-100 font-bold transition text-xs cursor-pointer"
                    >
                      Deseleccionar
                    </button>
                    <button
                      onClick={() => {
                        setMassSendProgress(null);
                        setMassSendLog([]);
                        setIsMassMessageModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <IonIcon icon={chatbubblesOutline} className="text-sm" />
                      <span>Configurar Plantillas & Enviar</span>
                    </button>
                  </div>
                </div>
              )}

              {ticketsRequierenFactura.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="font-bold text-sm text-slate-700">No hay tickets pendientes de datos fiscales</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Todas las cuentas solicitadas ya cuentan con borrador en la API o factura timbrada.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllTicketsSelected}
                            onChange={(e) => {
                              if (e.target.checked) handleSelectAllTickets();
                              else handleDeselectAllTickets();
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            title="Seleccionar o deseleccionar todos los tickets visibles"
                          />
                        </th>
                        <th className="p-3">Ticket / Folio</th>
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">Mesa / Zona</th>
                        <th className="p-3">Cliente / Teléfono</th>
                        <th className="p-3">Total ($)</th>
                        <th className="p-3 text-right">Acciones de Recordatorio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ticketsRequierenFactura.map((t: any) => {
                        const ticketKey = String(t.id || t.folio);
                        const isSelected = selectedTicketIds.includes(ticketKey);
                        const currentPhone =
                          recipientPhonesOverride[ticketKey] ??
                          t.invoicePhone ??
                          t.phone ??
                          t.customerPhone ??
                          t.clientPhone ??
                          "";

                        return (
                          <tr
                            key={ticketKey}
                            className={`transition ${
                              isSelected ? "bg-cyan-50/50 hover:bg-cyan-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectTicket(ticketKey)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              #{t.folio || t.id}
                            </td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {t.timestamp
                                ? new Date(t.timestamp).toLocaleString("es-MX", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })
                                : "Hoy"}
                            </td>
                            <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                              {t.tableName || t.tableLabel || "Mesa"} ({t.tableZone || "Salón"})
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5">
                                {t.customerName || t.clientName ? (
                                  <span className="font-semibold text-slate-800 text-[11px]">
                                    {t.customerName || t.clientName}
                                  </span>
                                ) : null}
                                <div className="flex items-center gap-1.5">
                                  <IonIcon
                                    icon={currentPhone ? logoWhatsapp : alertCircleOutline}
                                    className={`text-xs ${
                                      currentPhone ? "text-emerald-600" : "text-amber-500"
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={currentPhone}
                                    placeholder="Sin celular (clic p/ editar)"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setRecipientPhonesOverride((prev) => ({
                                        ...prev,
                                        [ticketKey]: val,
                                      }));
                                    }}
                                    className="bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:bg-white text-xs font-mono text-slate-700 py-0.5 px-1 outline-none w-32 placeholder:text-slate-400 placeholder:italic"
                                    title="Editar teléfono de WhatsApp para este ticket"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">
                              ${Number(t.total || 0).toFixed(2)}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Botón Enviar WhatsApp con Plantillas */}
                                <button
                                  onClick={() => handleSendSingleTicketWhatsApp(t)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                                  title="Configurar y enviar recordatorio por WhatsApp a este cliente"
                                >
                                  <IonIcon icon={logoWhatsapp} className="text-xs" />
                                  <span>WhatsApp</span>
                                </button>

                                {/* Abrir WhatsApp Web Directo */}
                                <button
                                  onClick={() => handleOpenWhatsAppWebDirect(t)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
                                  title="Abrir chat en WhatsApp Web directamente"
                                >
                                  <IonIcon icon={openOutline} className="text-xs" />
                                </button>

                                {/* Copiar Liga */}
                                <button
                                  onClick={() => copyCustomerPortalLink(t.folio || t.id, currentPhone)}
                                  className="px-2.5 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                                  title="Copiar liga del portal de auto-facturación"
                                >
                                  <IonIcon icon={copyOutline} className="text-xs" />
                                  <span>Liga</span>
                                </button>
                              </div>
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

          {/* ========================================================= */}
          {/* MAIN INVOICE LIST TABLE (Pre-Facturas & Timbradas)        */}
          {/* ========================================================= */}
          {activeTab !== "emisor_csd" && activeTab !== "requieren_datos" && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>📑</span>
                  <span>
                    {activeTab === "no_timbradas"
                      ? "Pre-Facturas Pendientes de Timbrado"
                      : activeTab === "timbradas"
                      ? "Historial de Facturas Timbradas (CFDI 4.0)"
                      : "Todas las Facturas y Borradores"}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold">
                    {filteredInvoices.length}
                  </span>
                </h2>

                <span className="text-xs text-slate-500 hidden sm:inline font-medium">
                  Ordenado por Folio Descendente
                </span>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <span className="text-4xl block mb-2">🔍</span>
                  <p className="font-bold text-sm text-slate-700">No se encontraron facturas</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prueba cambiando los términos de búsqueda o filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Folio</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Ticket</th>
                        <th className="p-3">RFC Receptor</th>
                        <th className="p-3">Razón Social</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Total ($)</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map((inv) => {
                        const isStamped = isInvoiceStamped(inv);
                        return (
                          <tr key={inv.folio} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-black text-slate-900">
                              #{inv.folio}
                            </td>

                            <td className="p-3">
                              {isStamped ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span>✅</span> Timbrada
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <span>⏳</span> Borrador
                                </span>
                              )}
                            </td>

                            <td className="p-3 font-mono text-slate-600">
                              {inv.ticket || inv.ticket_id || "-"}
                            </td>

                            <td className="p-3 font-mono font-bold text-slate-800">
                              {inv.rfc}
                            </td>

                            <td className="p-3 font-semibold text-slate-800 truncate max-w-[200px]" title={inv.razon_social}>
                              {inv.razon_social}
                            </td>

                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {inv.fecha ? inv.fecha.slice(0, 16) : "-"}
                            </td>

                            <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">
                              ${Number(inv.total || 0).toFixed(2)}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Botón para Pre-Factura: Timbrar Inmediato */}
                                {!isStamped && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setStampConfirmInvoice(inv);
                                        setStampErrorDetails(null);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                                      title="Timbrar borrador inmediatamente ante el SAT"
                                    >
                                      <IonIcon icon={flashOutline} />
                                      <span>Timbrar SAT</span>
                                    </button>

                                    <button
                                      onClick={() => handleDiscardDraft(inv)}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                                      title="Eliminar borrador no timbrado"
                                    >
                                      <IonIcon icon={trashOutline} />
                                    </button>
                                  </>
                                )}

                                {/* Botones para Factura Timbrada: Ver PDF, Descargar XML, Reenviar */}
                                {isStamped && (
                                  <>
                                    {inv.pdf_url && (
                                      <a
                                        href={inv.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1 transition"
                                        title="Ver factura en PDF"
                                      >
                                        <IonIcon icon={eyeOutline} />
                                        <span>PDF</span>
                                      </a>
                                    )}

                                    {inv.xml_url && (
                                      <a
                                        href={inv.xml_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1 transition"
                                        title="Descargar XML timbrado"
                                      >
                                        <IonIcon icon={downloadOutline} />
                                        <span>XML</span>
                                      </a>
                                    )}

                                    <button
                                      onClick={() => {
                                        setResendModalInvoice(inv);
                                        setResendEmailInput(inv.email || "");
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                      title="Reenviar comprobante por correo"
                                    >
                                      <IonIcon icon={mailOutline} />
                                      <span>Reenviar</span>
                                    </button>
                                  </>
                                )}
                              </div>
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

        {/* ========================================================= */}
        {/* MODAL: TIMBRAR PRE-FACTURA DIRECTAMENTE                  */}
        {/* ========================================================= */}
        <IonModal
          isOpen={Boolean(stampConfirmInvoice)}
          onDidDismiss={() => {
            if (!stamping) {
              setStampConfirmInvoice(null);
              setStampErrorDetails(null);
            }
          }}
        >
          <div className="min-h-full bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col justify-center max-w-lg mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl text-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl text-amber-700">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Timbrar Pre-Factura</h3>
                    <p className="text-xs text-slate-500">Folio #{stampConfirmInvoice?.folio}</p>
                  </div>
                </div>
                {!stamping && (
                  <button
                    onClick={() => setStampConfirmInvoice(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <IonIcon icon={closeOutline} className="text-xl" />
                  </button>
                )}
              </div>

              {stampConfirmInvoice && (
                <div className="space-y-3 text-xs mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                    <span className="text-slate-500">Receptor:</span>
                    <span className="font-bold text-slate-800">{stampConfirmInvoice.razon_social}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                    <span className="text-slate-500">RFC:</span>
                    <span className="font-mono font-bold text-amber-600">{stampConfirmInvoice.rfc}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                    <span className="text-slate-500">Total a Timbrar:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      ${Number(stampConfirmInvoice.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {stampErrorDetails && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 space-y-1 text-xs">
                  <div className="font-bold text-red-700 flex items-center gap-1.5">
                    <IonIcon icon={alertCircleOutline} className="text-base" />
                    <span>{stampErrorDetails.title}</span>
                  </div>
                  <p className="opacity-90">{stampErrorDetails.explanation}</p>
                  {stampErrorDetails.tip && (
                    <p className="pt-2 text-amber-800 font-medium">
                      💡 Tip: {stampErrorDetails.tip}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStampConfirmInvoice(null)}
                  disabled={stamping}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => stampConfirmInvoice && handleImmediateStamp(stampConfirmInvoice)}
                  disabled={stamping}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {stamping ? (
                    <>
                      <IonSpinner name="crescent" className="w-4 h-4" />
                      <span>Timbrando ante PAC...</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={flashOutline} />
                      <span>Confirmar y Timbrar SAT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </IonModal>

        {/* ========================================================= */}
        {/* MODAL: REENVIAR CORREO CON PDF Y XML                     */}
        {/* ========================================================= */}
        <IonModal
          isOpen={Boolean(resendModalInvoice)}
          onDidDismiss={() => {
            if (!resendingEmail) setResendModalInvoice(null);
          }}
        >
          <div className="min-h-full bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col justify-center max-w-md mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl text-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl text-indigo-600">
                    📧
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Reenviar Comprobantes</h3>
                    <p className="text-xs text-slate-500">Factura #{resendModalInvoice?.folio}</p>
                  </div>
                </div>
                {!resendingEmail && (
                  <button
                    onClick={() => setResendModalInvoice(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <IonIcon icon={closeOutline} className="text-xl" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Correo Electrónico de Destino
                </label>
                <div className="relative">
                  <IonIcon icon={mailOutline} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={resendEmailInput}
                    onChange={(e) => setResendEmailInput(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Se enviarán los archivos oficiales XML y PDF timbrados por el SAT.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setResendModalInvoice(null)}
                  disabled={resendingEmail}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {resendingEmail ? (
                    <>
                      <IonSpinner name="crescent" className="w-4 h-4" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={paperPlaneOutline} />
                      <span>Enviar Correo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </IonModal>

        {/* ========================================================= */}
        {/* MODAL: ENVÍO MASIVO DE RECORDATORIOS POR WHATSAPP         */}
        {/* ========================================================= */}
        <IonModal
          isOpen={isMassMessageModalOpen}
          onDidDismiss={() => {
            if (!sendingMassMessages) {
              setIsMassMessageModalOpen(false);
            }
          }}
        >
          <div className="min-h-full bg-slate-900/60 backdrop-blur-sm p-3 md:p-6 flex flex-col justify-center max-w-4xl mx-auto overflow-y-auto">
            <div className="bg-white p-5 md:p-7 rounded-3xl border border-slate-200 shadow-2xl text-slate-800 my-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-2xl text-emerald-700 shadow-sm">
                    <IonIcon icon={logoWhatsapp} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Recordatorio Masivo de Facturación
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedTicketIds.length} ticket(s) seleccionado(s) • Sucursal:{" "}
                      <strong className="text-slate-700">{selectedTenant?.name || "Matriz"}</strong>
                    </p>
                  </div>
                </div>

                {!sendingMassMessages && (
                  <button
                    onClick={() => setIsMassMessageModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <IonIcon icon={closeOutline} className="text-2xl" />
                  </button>
                )}
              </div>

              {/* Summary Stats Cards */}
              {(() => {
                const targetTickets = ticketsRequierenFactura.filter((t: any) =>
                  selectedTicketIds.includes(String(t.id || t.folio))
                );
                const totalMonto = targetTickets.reduce((acc, t: any) => acc + (Number(t.total) || 0), 0);
                const withPhone = targetTickets.filter((t: any) => {
                  const phone =
                    recipientPhonesOverride[String(t.id || t.folio)] ||
                    t.invoicePhone ||
                    t.phone ||
                    t.customerPhone ||
                    t.clientPhone;
                  return phone && phone.replace(/\D/g, "").length >= 10;
                }).length;
                const withoutPhone = targetTickets.length - withPhone;
                const sampleTicket = targetTickets[0] || {
                  folio: "1234",
                  total: 350.0,
                  customerName: "Cliente Ejemplo",
                  phone: "5512345678",
                };

                return (
                  <div className="space-y-5">
                    {/* Top Metric Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">
                            Destinatarios
                          </span>
                          <p className="text-base font-black text-slate-800">
                            {targetTickets.length} Cuentas
                          </p>
                        </div>
                        <span className="text-xl">👥</span>
                      </div>

                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-700 uppercase">
                            Monto por Facturar
                          </span>
                          <p className="text-base font-black text-emerald-800">
                            ${totalMonto.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-xl">💰</span>
                      </div>

                      <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-cyan-700 uppercase">
                            Teléfonos Válidos
                          </span>
                          <p className="text-base font-black text-cyan-800">
                            {withPhone} listos {withoutPhone > 0 ? `(${withoutPhone} sin celular)` : ""}
                          </p>
                        </div>
                        <span className="text-xl">📱</span>
                      </div>
                    </div>

                    {/* Template Selector Cards (Plantillas 1, 2 y 3) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span>Selecciona o Modifica una Plantilla de Mensaje:</span>
                        <span className="text-[11px] text-indigo-600 font-medium">
                          3 Estilos Predefinidos
                        </span>
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {INVOICE_REMINDER_TEMPLATES.map((tmpl) => {
                          const isSelected = selectedTemplateId === tmpl.id && !isRotatingTemplates;
                          return (
                            <div
                              key={tmpl.id}
                              onClick={() => {
                                handleSelectTemplate(tmpl.id);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                                isSelected
                                  ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                                  : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-lg">{tmpl.icon}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isSelected
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-100 text-slate-600 border border-slate-200"
                                  }`}
                                >
                                  {tmpl.badge}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900">{tmpl.name}</h4>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                {tmpl.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Rotating templates option */}
                      <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">🔄</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              Modo Rotativo de Plantillas (1, 2 y 3)
                            </p>
                            <p className="text-[11px] text-slate-600">
                              Alterna automáticamente las 3 plantillas entre los clientes para que no todos reciban el mismo mensaje.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isRotatingTemplates}
                          onChange={(e) => setIsRotatingTemplates(e.target.checked)}
                          className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Message Editor & Placeholders */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          {isRotatingTemplates
                            ? "Plantilla Base (Modo Rotativo Activo)"
                            : "Texto del Mensaje (Editable)"}
                        </label>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-semibold mr-1">Insertar:</span>
                          {["{cliente}", "{sucursal}", "{ticket}", "{total}", "{enlace}"].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setCustomMessageText((prev) => `${prev} ${v}`)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 text-[10px] font-mono border border-slate-200 transition"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={5}
                        value={customMessageText}
                        onChange={(e) => setCustomMessageText(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 p-3 rounded-2xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed"
                        placeholder="Escribe el mensaje o personaliza la plantilla..."
                      />
                    </div>

                    {/* Live WhatsApp Preview Box */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <span>💬</span>
                        <span>Vista Previa en Tiempo Real (Ejemplo con Ticket #{sampleTicket.folio || sampleTicket.id}):</span>
                      </label>
                      <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-emerald-200/60 shadow-inner">
                        <div className="max-w-md bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed border border-slate-200/50">
                          {formatTicketMessage(customMessageText, sampleTicket, 0)}
                          <div className="text-[10px] text-slate-400 text-right mt-2 font-mono">
                            {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} ✓✓
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* List of Recipients & Phone Inputs */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>Lista de Destinatarios ({targetTickets.length}):</span>
                        <span className="text-[11px] text-slate-500">
                          Puedes ingresar o corregir números de celular aquí
                        </span>
                      </label>

                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/50">
                        {targetTickets.map((t: any, idx: number) => {
                          const key = String(t.id || t.folio);
                          const ph =
                            recipientPhonesOverride[key] ??
                            t.invoicePhone ??
                            t.phone ??
                            t.customerPhone ??
                            t.clientPhone ??
                            "";
                          const isValidPhone = ph.replace(/\D/g, "").length >= 10;

                          return (
                            <div
                              key={key}
                              className="p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-white transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  #{t.folio || t.id}
                                </span>
                                <span className="text-slate-500">
                                  {t.tableName || t.tableLabel || "Mesa"}
                                </span>
                                {t.customerName && (
                                  <span className="text-slate-700 font-semibold">
                                    • {t.customerName}
                                  </span>
                                )}
                                <span className="text-emerald-700 font-bold">
                                  ${Number(t.total || 0).toFixed(2)}
                                </span>
                                {isRotatingTemplates && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                                    P{((idx % 3) + 1)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={ph}
                                  placeholder="Ingresa celular 10 dígitos"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRecipientPhonesOverride((prev) => ({
                                      ...prev,
                                      [key]: val,
                                    }));
                                  }}
                                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono w-44 focus:outline-none ${
                                    isValidPhone
                                      ? "bg-white border-slate-300 text-slate-800 focus:border-indigo-500"
                                      : "bg-red-50 border-red-300 text-red-700 focus:border-red-500"
                                  }`}
                                />
                                {isValidPhone ? (
                                  <span className="text-emerald-600 text-sm" title="Número válido">
                                    ✅
                                  </span>
                                ) : (
                                  <span className="text-amber-500 text-sm" title="Falta celular">
                                    ⚠️
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Progress Bar & Logs */}
                    {massSendProgress && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>
                            {sendingMassMessages
                              ? `Enviando ${massSendProgress.current} de ${massSendProgress.total}...`
                              : `Envío masivo finalizado (${massSendProgress.total} tickets)`}
                          </span>
                          <span className="font-mono text-indigo-600">
                            {Math.round((massSendProgress.current / (massSendProgress.total || 1)) * 100)}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                            style={{
                              width: `${(massSendProgress.current / (massSendProgress.total || 1)) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span className="text-emerald-600 font-bold">
                            ✅ {massSendProgress.success} enviados con éxito
                          </span>
                          <span className="text-red-500 font-bold">
                            ⚠️ {massSendProgress.failed} con error o sin número
                          </span>
                        </div>
                      </div>
                    )}

                    {massSendLog.length > 0 && !sendingMassMessages && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto text-[11px] space-y-1">
                        <span className="font-bold text-slate-700 block mb-1">
                          Detalle de Resultados:
                        </span>
                        {massSendLog.map((log, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0"
                          >
                            <span className="font-mono">
                              Ticket #{log.folio} ({log.phone}):
                            </span>
                            <span
                              className={`font-bold ${
                                log.status === "success"
                                  ? "text-emerald-600"
                                  : log.status === "no_phone"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {log.status === "success"
                                ? "✅ Enviado"
                                : log.status === "no_phone"
                                ? "⚠️ Sin Teléfono"
                                : `❌ ${log.error || "Fallo"}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Modal Footer Actions */}
                    <div className="flex gap-3 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => setIsMassMessageModalOpen(false)}
                        disabled={sendingMassMessages}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                      >
                        {massSendLog.length > 0 ? "Cerrar" : "Cancelar"}
                      </button>

                      <button
                        onClick={handleSendMassWhatsApp}
                        disabled={sendingMassMessages || targetTickets.length === 0}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {sendingMassMessages ? (
                          <>
                            <IonSpinner name="crescent" className="w-4 h-4 text-white" />
                            <span>Enviando por WhatsApp...</span>
                          </>
                        ) : (
                          <>
                            <IonIcon icon={logoWhatsapp} className="text-base" />
                            <span>
                              Iniciar Envío a {targetTickets.length} Destinatario(s)
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </IonModal>

        {/* ========================================================= */}
        {/* MODAL DE VISOR Y DIAGNÓSTICO DE LOGS: facturas.log       */}
        {/* ========================================================= */}
        <IonModal
          isOpen={isLogModalOpen}
          onDidDismiss={() => setIsLogModalOpen(false)}
          className="ion-modal-custom"
        >
          <div className="p-4 md:p-6 bg-slate-900 text-slate-100 max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto border border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-base md:text-lg font-black text-white">
                    Bitácora de Diagnóstico y Conexión (facturas.log)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ubicación en servidor: <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">{apiUrl.replace(/api_facturar\.php.*/, 'facturas.log')}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live Diagnostic Session Log */}
            <div className="py-3 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span>📡 Eventos de la Sesión Actual (Frontend)</span>
                  <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.2 rounded font-mono">
                    {diagnosticLogs.length} eventos
                  </span>
                </h4>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto space-y-1 border border-slate-800">
                  {diagnosticLogs.length === 0 ? (
                    <div className="text-slate-500 italic">No hay eventos registrados en esta sesión aún.</div>
                  ) : (
                    diagnosticLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                        <span
                          className={`font-bold shrink-0 ${
                            log.level === 'SUCCESS' ? 'text-emerald-400' :
                            log.level === 'ERROR' ? 'text-rose-400' :
                            log.level === 'WARN' ? 'text-amber-400' : 'text-sky-400'
                          }`}
                        >
                          [{log.level}]
                        </span>
                        <span className="text-slate-300 break-all">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Remote Server Log */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🖥️ Archivo facturas.log del Servidor Remoto (PHP / MySQL)</span>
                    {loadingRemoteLog && <IonSpinner name="crescent" className="w-3.5 h-3.5 text-amber-400" />}
                  </h4>
                  <button
                    onClick={handleOpenLogModal}
                    disabled={loadingRemoteLog}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer"
                  >
                    <IonIcon icon={refreshOutline} className={loadingRemoteLog ? 'animate-spin' : ''} />
                    <span>Refrescar Log Remoto</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-emerald-300 max-h-56 overflow-y-auto overflow-x-auto whitespace-pre-wrap border border-slate-800 select-all">
                  {remoteLogText || (loadingRemoteLog ? 'Consultando facturas.log desde el servidor...' : 'Sin registros remotos.')}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                📁 También guardado localmente en la carpeta raíz del proyecto: <strong className="text-amber-300 font-mono">facturas.log</strong>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadLogFile}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md border-none cursor-pointer"
                >
                  <IonIcon icon={downloadOutline} />
                  <span>Descargar facturas.log</span>
                </button>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition border-none cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

