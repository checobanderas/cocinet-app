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
  formatFriendlySatError,
} from "../../services/invoicingService";

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

  // Load Invoices from Backend API
  const fetchInvoices = async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      const res = await listarFacturasFromApi(apiUrl, {
        estado: "todas",
        busqueda: searchQuery.trim() || undefined,
        fecha_inicio: filterStartDate || undefined,
        fecha_fin: filterEndDate || undefined,
      });

      if (res.ok && res.facturas) {
        setInvoices(res.facturas);
        const stats: any = res.resumen || (res as any).stats;
        if (stats) {
          const timbradasCount = stats.timbradas ?? res.facturas.filter((f) => !!f.timbrada || !!f.uuid).length;
          const noTimbradasCount =
            stats.no_timbradas ?? stats.pendientes ?? res.facturas.filter((f) => !f.timbrada && !f.uuid).length;
          const montoTotal =
            stats.monto_total_timbrado ??
            stats.monto_facturado ??
            res.facturas.reduce((acc, f) => (f.timbrada || f.uuid ? acc + (Number(f.total) || 0) : acc), 0);

          setApiResumen({
            total: stats.total ?? res.facturas.length,
            timbradas: timbradasCount,
            no_timbradas: noTimbradasCount,
            monto_total_timbrado: montoTotal,
            monto_total_no_timbrado: stats.monto_total_no_timbrado ?? 0,
          });
        } else {
          setApiResumen({
            total: res.facturas.length,
            timbradas: res.facturas.filter((f) => !!f.timbrada || !!f.uuid).length,
            no_timbradas: res.facturas.filter((f) => !f.timbrada && !f.uuid).length,
            monto_total_timbrado: res.facturas.reduce((acc, f) => (f.timbrada || f.uuid ? acc + (Number(f.total) || 0) : acc), 0),
            monto_total_no_timbrado: 0,
          });
        }
      } else {
        triggerAppNotification(
          "ℹ️ Facturación",
          res.error || "No se pudieron obtener las facturas del servidor.",
          "warning"
        );
      }
    } catch (err: any) {
      console.error("Error al consultar facturas:", err);
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
    try {
      const res = await testConexionFacturacion(apiUrl);
      setConnectionTestResult(res);
      if (res.ok) {
        triggerAppNotification("✅ Conexión Exitosa", "Servidor de facturación y base de datos MySQL en línea.", "success");
      } else {
        triggerAppNotification("⚠️ Error de Conexión", res.error || "No se pudo conectar al servidor PHP.", "error");
      }
    } catch (e: any) {
      setConnectionTestResult({ ok: false, error: e.message || "Error al conectar." });
    } finally {
      setTestingConnection(false);
    }
  };

  // Pre-Facturas (No Timbradas)
  const preFacturas = useMemo(() => {
    return invoices.filter((i) => !i.timbrada && !i.uuid);
  }, [invoices]);

  // Facturas Timbradas
  const facturasTimbradas = useMemo(() => {
    return invoices.filter((i) => !!i.timbrada || !!i.uuid);
  }, [invoices]);

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
      // Tab filter
      if (activeTab === "no_timbradas") {
        if (inv.timbrada || inv.uuid) return false;
      } else if (activeTab === "timbradas") {
        if (!inv.timbrada && !inv.uuid) return false;
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
          badgeBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          countBadge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
          count: `${preFacturas.length} pendientes`,
          extra: `$${preFacturas.reduce((acc, i) => acc + (Number(i.total) || 0), 0).toFixed(2)}`,
        };
      case "timbradas":
        return {
          title: "Facturas Timbradas (SAT)",
          subtitle: "Comprobantes fiscales oficiales CFDI 4.0 con UUID, PDF y XML",
          icon: "✅",
          badgeBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
          countBadge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
          count: `${facturasTimbradas.length} timbradas`,
          extra: `$${facturasTimbradas.reduce((acc, i) => acc + (Number(i.total) || 0), 0).toFixed(2)}`,
        };
      case "requieren_datos":
        return {
          title: "Requieren Factura (Sin Datos)",
          subtitle: "Cuentas marcadas en caja esperando datos fiscales del cliente",
          icon: "🧾",
          badgeBg: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
          countBadge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
          count: `${ticketsRequierenFactura.length} tickets`,
          extra: `$${ticketsRequierenFactura.reduce((acc, t: any) => acc + (Number(t.total) || 0), 0).toFixed(2)}`,
        };
      case "multi_sucursal":
        return {
          title: "Control Multi-Sucursal",
          subtitle: "Consolidado de emisión fiscal entre sucursales e inquilinos",
          icon: "🌐",
          badgeBg: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
          countBadge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
          count: `${branchList.length || 1} sucursales`,
          extra: selectedTenant?.name || "Matriz",
        };
      case "emisor_csd":
        return {
          title: "Emisor Fiscal & Conexión PAC",
          subtitle: "Diagnóstico de conexión PHP, sellos CSD y configuración",
          icon: "🏢",
          badgeBg: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
          countBadge: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
          count: "Conexión Activa",
          extra: selectedTenant?.rfc || "RFC Activo",
        };
      case "reporte_excel":
        return {
          title: "Reporte Contable Fiscal",
          subtitle: "Desglose contable de Subtotal, IVA 16%, Retenciones y Totales",
          icon: "📊",
          badgeBg: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
          countBadge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
          count: `${invoices.length} facturas`,
          extra: `$${(apiResumen.monto_total_timbrado + apiResumen.monto_total_no_timbrado).toFixed(2)}`,
        };
      default:
        return {
          title: "Todas las Facturas y Borradores",
          subtitle: "Listado general consolidado de comprobantes fiscales",
          icon: "📑",
          badgeBg: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
          countBadge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
          count: `${invoices.length} registros`,
          extra: `$${(apiResumen.monto_total_timbrado + apiResumen.monto_total_no_timbrado).toFixed(2)}`,
        };
    }
  }, [
    activeTab,
    preFacturas,
    facturasTimbradas,
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

  return (
    <IonPage className="bg-slate-950 text-slate-100">
      {renderMaterialHeader(
        "Módulo de Facturación CFDI 4.0",
        () => setAppMode("floorplan"),
        "🧾"
      )}

      <IonContent className="bg-slate-950" fullscreen>
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
                className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/90 p-3.5 md:p-4 rounded-2xl border border-slate-700/80 shadow-xl mb-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-indigo-500/60 transition group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-105 ${activeTabMeta.badgeBg}`}
                  >
                    {activeTabMeta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                        Módulo Activo
                      </span>
                      <h2 className="text-sm md:text-base font-black text-white group-hover:text-indigo-200 transition">
                        {activeTabMeta.title}
                      </h2>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${activeTabMeta.countBadge}`}>
                        {activeTabMeta.count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-300">{selectedTenant?.name || "Sucursal Matriz"}</span>
                      <span>•</span>
                      <span>{activeTabMeta.subtitle}</span>
                      {activeTabMeta.extra && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-amber-300">{activeTabMeta.extra}</span>
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
                    className="p-2 md:px-3 md:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    title="Sincronizar con el servidor"
                  >
                    <IonIcon icon={refreshOutline} className={`text-sm ${loading ? "animate-spin text-indigo-400" : ""}`} />
                    <span className="hidden sm:inline">{loading ? "Sincronizando..." : "Sincronizar"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportExcel();
                    }}
                    className="p-2 md:px-3 md:py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    title="Exportar a Excel"
                  >
                    <IonIcon icon={downloadOutline} className="text-sm" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>

                  <button
                    onClick={() => setIsWidgetsCollapsed(false)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">
                      🧾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                          CFDI 4.0 Pro
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🟢 Enlace MySQL Directo
                        </span>
                      </div>
                      <h1 className="text-xl md:text-2xl font-black text-white mt-1">
                        Gestión y Control de Facturación
                      </h1>
                      <p className="text-xs text-slate-400">
                        {selectedTenant?.name || "Sucursal Matriz"} • RFC Emisor:{" "}
                        <strong className="text-slate-200">{selectedTenant?.rfc || "EMISOR ACTIVO"}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions & Collapse Button */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={fetchInvoices}
                      disabled={loading}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <IonIcon icon={refreshOutline} className={`text-base ${loading ? "animate-spin text-indigo-400" : ""}`} />
                      <span>{loading ? "Sincronizando..." : "Sincronizar"}</span>
                    </button>

                    <button
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                    >
                      <IonIcon icon={downloadOutline} className="text-base" />
                      <span>Exportar Excel</span>
                    </button>

                    <button
                      onClick={() => setIsWidgetsCollapsed(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
                      title="Plegar cuadrícula para ver directamente la tabla"
                    >
                      <IonIcon icon={chevronUpOutline} className="text-sm" />
                      <span>Plegar</span>
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
                        ? "bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-900 border-amber-500 shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl text-amber-400">
                        ⏳
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "no_timbradas" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-amber-400">
                          {preFacturas.length}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">Pre-Facturas (No Timbradas)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Datos listos en MySQL esperando timbrado PAC/SAT.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total por Timbrar:</span>
                      <span className="font-bold text-amber-400">
                        ${preFacturas.reduce((acc, i) => acc + (Number(i.total) || 0), 0).toFixed(2)}
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
                        ? "bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
                        ✅
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "timbradas" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-emerald-400">
                          {facturasTimbradas.length}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">Facturas Timbradas (SAT)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Comprobantes oficiales con UUID, PDF y XML listos.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Monto Timbrado:</span>
                      <span className="font-bold text-emerald-400">
                        ${facturasTimbradas.reduce((acc, i) => acc + (Number(i.total) || 0), 0).toFixed(2)}
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
                        ? "bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl text-cyan-400">
                        🧾
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "requieren_datos" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-cyan-400">
                          {ticketsRequierenFactura.length}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">Requieren Factura (Sin Datos)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Tickets marcados en caja esperando captura del cliente.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Monto Pendiente:</span>
                      <span className="font-bold text-cyan-400">
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
                        ? "bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl text-indigo-400">
                        🌐
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "multi_sucursal" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-indigo-400">
                          {branchList.length || 1}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">Todas las Sucursales</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Control consolidado de emisión y folios multi-inquilino.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Sucursal Actual:</span>
                      <span className="font-bold text-indigo-400 truncate max-w-[140px]">
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
                        ? "bg-gradient-to-br from-violet-950/90 via-slate-900 to-slate-900 border-violet-500 shadow-xl shadow-violet-500/20 ring-2 ring-violet-500/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl text-violet-400">
                        🏢
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "emisor_csd" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Activo
                          </span>
                        )}
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          CSD SAT 4.0
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">Emisor Fiscal & PAC</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Estado de conexión con el backend PHP, sellos y PAC.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estado Conexión:</span>
                      <span className="font-bold text-emerald-400">🟢 Conectado</span>
                    </div>
                  </motion.div>

                  {/* Widget 6: Reporte y Contabilidad */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab("reporte_excel")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      activeTab === "reporte_excel"
                        ? "bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl text-blue-400">
                        📊
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "reporte_excel" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Activo
                          </span>
                        )}
                        <span className="text-2xl font-black text-blue-400">
                          {invoices.length}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">Reporte Contable Fiscal</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Desglose de Subtotal, IVA 16%, Retenciones y Totales.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Facturación Total:</span>
                      <span className="font-bold text-blue-400">
                        ${(apiResumen.monto_total_timbrado + apiResumen.monto_total_no_timbrado).toFixed(2)}
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
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col md:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <IonIcon icon={searchOutline} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por RFC, Razón Social, Folio o Ticket..."
                className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
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
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Todas ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab("no_timbradas")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "no_timbradas"
                    ? "bg-amber-600 text-white shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ⏳ No Timbradas ({preFacturas.length})
              </button>
              <button
                onClick={() => setActiveTab("timbradas")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "timbradas"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ✅ Timbradas ({facturasTimbradas.length})
              </button>
              <button
                onClick={() => setActiveTab("requieren_datos")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "requieren_datos"
                    ? "bg-cyan-600 text-white shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🏢</span> Configuración del Emisor Fiscal & API PHP
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Parámetros de conexión y timbrado del emisor activo.
                  </p>
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  <IonIcon icon={refreshOutline} className={testingConnection ? "animate-spin" : ""} />
                  <span>{testingConnection ? "Probando..." : "Probar Conexión con Servidor"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">URL del Endpoint PHP</span>
                  <p className="text-sm font-mono font-bold text-indigo-400 mt-1 break-all">
                    {apiUrl}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Razón Social Emisor</span>
                  <p className="text-sm font-bold text-white mt-1">
                    {selectedTenant?.name || "COCINET DEMO"}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">RFC Emisor</span>
                  <p className="text-sm font-mono font-bold text-amber-400 mt-1">
                    {selectedTenant?.rfc || "XAXX010101000"}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Régimen Fiscal Emisor</span>
                  <p className="text-sm font-bold text-white mt-1">
                    {selectedTenant?.regimenFiscal || "601 - General de Ley Personas Morales"}
                  </p>
                </div>
              </div>

              {connectionTestResult && (
                <div className={`mt-5 p-4 rounded-xl border ${
                  connectionTestResult.ok
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-red-950/40 border-red-500/40 text-red-200"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🧾</span> Cuentas que Solicitaron Factura (Sin RFC aún)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Tickets cerrados en caja marcados con "Requiere Factura" donde el cliente todavía no ingresa sus datos.
                  </p>
                </div>
              </div>

              {ticketsRequierenFactura.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="font-bold text-sm text-slate-300">No hay tickets pendientes de datos fiscales</p>
                  <p className="text-xs text-slate-500 mt-1">Todas las cuentas solicitadas ya cuentan con borrador o factura timbrada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Ticket / Folio</th>
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">Mesa / Zona</th>
                        <th className="p-3">Teléfono Cliente</th>
                        <th className="p-3">Total ($)</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ticketsRequierenFactura.map((t: any) => (
                        <tr key={t.id || t.folio} className="hover:bg-slate-800/50 transition">
                          <td className="p-3 font-mono font-bold text-white">
                            #{t.folio || t.id}
                          </td>
                          <td className="p-3">
                            {t.timestamp ? new Date(t.timestamp).toLocaleString("es-MX") : "Hoy"}
                          </td>
                          <td className="p-3 font-bold text-slate-200">
                            {t.tableName || t.tableLabel || "Mesa"} ({t.tableZone || "Salón"})
                          </td>
                          <td className="p-3 font-mono text-cyan-400">
                            {t.invoicePhone || t.phone || "No especificado"}
                          </td>
                          <td className="p-3 font-bold text-emerald-400">
                            ${Number(t.total || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyCustomerPortalLink(t.folio || t.id, t.invoicePhone)}
                                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                                title="Copiar liga para enviar por WhatsApp al cliente"
                              >
                                <IonIcon icon={copyOutline} />
                                <span>Copiar Liga</span>
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
          )}

          {/* ========================================================= */}
          {/* MAIN INVOICE LIST TABLE (Pre-Facturas & Timbradas)        */}
          {/* ========================================================= */}
          {activeTab !== "emisor_csd" && activeTab !== "requieren_datos" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📑</span>
                  <span>
                    {activeTab === "no_timbradas"
                      ? "Pre-Facturas Pendientes de Timbrado"
                      : activeTab === "timbradas"
                      ? "Historial de Facturas Timbradas (CFDI 4.0)"
                      : "Todas las Facturas y Borradores"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {filteredInvoices.length}
                  </span>
                </h2>

                <span className="text-xs text-slate-400 hidden sm:inline">
                  Ordenado por Folio Descendente
                </span>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <span className="text-4xl block mb-2">🔍</span>
                  <p className="font-bold text-sm text-slate-300">No se encontraron facturas</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prueba cambiando los términos de búsqueda o filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
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
                    <tbody className="divide-y divide-slate-800">
                      {filteredInvoices.map((inv) => {
                        const isStamped = Boolean(inv.timbrada || inv.uuid);
                        return (
                          <tr key={inv.folio} className="hover:bg-slate-800/50 transition">
                            <td className="p-3 font-mono font-black text-white">
                              #{inv.folio}
                            </td>

                            <td className="p-3">
                              {isStamped ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <span>✅</span> Timbrada
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <span>⏳</span> Borrador
                                </span>
                              )}
                            </td>

                            <td className="p-3 font-mono text-slate-300">
                              {inv.ticket || inv.ticket_id || "-"}
                            </td>

                            <td className="p-3 font-mono font-bold text-amber-300">
                              {inv.rfc}
                            </td>

                            <td className="p-3 font-semibold text-slate-200 truncate max-w-[200px]" title={inv.razon_social}>
                              {inv.razon_social}
                            </td>

                            <td className="p-3 text-slate-400 whitespace-nowrap">
                              {inv.fecha ? inv.fecha.slice(0, 16) : "-"}
                            </td>

                            <td className="p-3 font-bold text-emerald-400 whitespace-nowrap">
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
                                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                                      title="Timbrar borrador inmediatamente ante el SAT"
                                    >
                                      <IonIcon icon={flashOutline} />
                                      <span>Timbrar SAT</span>
                                    </button>

                                    <button
                                      onClick={() => handleDiscardDraft(inv)}
                                      className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 hover:text-red-200 transition cursor-pointer"
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
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1 transition"
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
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1 transition"
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
                                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
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
          <div className="min-h-full bg-slate-950 text-white p-6 flex flex-col justify-center max-w-lg mx-auto">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl text-amber-400">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Timbrar Pre-Factura</h3>
                    <p className="text-xs text-slate-400">Folio #{stampConfirmInvoice?.folio}</p>
                  </div>
                </div>
                {!stamping && (
                  <button
                    onClick={() => setStampConfirmInvoice(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <IonIcon icon={closeOutline} className="text-xl" />
                  </button>
                )}
              </div>

              {stampConfirmInvoice && (
                <div className="space-y-3 text-xs mb-6">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Receptor:</span>
                    <span className="font-bold text-white">{stampConfirmInvoice.razon_social}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">RFC:</span>
                    <span className="font-mono font-bold text-amber-400">{stampConfirmInvoice.rfc}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Total a Timbrar:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${Number(stampConfirmInvoice.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {stampErrorDetails && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 space-y-1 text-xs">
                  <div className="font-bold text-red-300 flex items-center gap-1.5">
                    <IonIcon icon={alertCircleOutline} className="text-base" />
                    <span>{stampErrorDetails.title}</span>
                  </div>
                  <p className="opacity-90">{stampErrorDetails.explanation}</p>
                  {stampErrorDetails.tip && (
                    <p className="pt-2 text-amber-300 font-medium">
                      💡 Tip: {stampErrorDetails.tip}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStampConfirmInvoice(null)}
                  disabled={stamping}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => stampConfirmInvoice && handleImmediateStamp(stampConfirmInvoice)}
                  disabled={stamping}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
          <div className="min-h-full bg-slate-950 text-white p-6 flex flex-col justify-center max-w-md mx-auto">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl text-indigo-400">
                    📧
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reenviar Comprobantes</h3>
                    <p className="text-xs text-slate-400">Factura #{resendModalInvoice?.folio}</p>
                  </div>
                </div>
                {!resendingEmail && (
                  <button
                    onClick={() => setResendModalInvoice(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <IonIcon icon={closeOutline} className="text-xl" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  Correo Electrónico de Destino
                </label>
                <div className="relative">
                  <IonIcon icon={mailOutline} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={resendEmailInput}
                    onChange={(e) => setResendEmailInput(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
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
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
      </IonContent>
    </IonPage>
  );
};
