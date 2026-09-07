import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { exportDailyReportExcel, getFriendlyTitleDate } from "../../utils/dailyReportService";
import { getOperatingDay } from "../../utils/appHelpers";

interface ExcelDownloadPortalViewProps {
  history: any[];
  products: any[];
  selectedTenant?: any;
  targetDate?: string;
  onClose: () => void;
}

export const ExcelDownloadPortalView: React.FC<ExcelDownloadPortalViewProps> = ({
  history,
  products,
  selectedTenant,
  targetDate,
  onClose,
}) => {
  const [downloadStatus, setDownloadStatus] = useState<"pending" | "downloaded" | "error">("pending");
  const [downloadCount, setDownloadCount] = useState(0);

  const effectiveDate = targetDate || getOperatingDay(new Date());
  const friendlyDate = getFriendlyTitleDate(effectiveDate);
  const companyName = selectedTenant?.name || "Cocinet App";

  // Trigger automatic download on view load
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        exportDailyReportExcel(history || [], products || [], effectiveDate, companyName);
        setDownloadStatus("downloaded");
        setDownloadCount((prev) => prev + 1);
      } catch (err) {
        console.error("Error auto-descargando Excel:", err);
        setDownloadStatus("error");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [effectiveDate, companyName, history, products]);

  const handleManualDownload = () => {
    try {
      exportDailyReportExcel(history || [], products || [], effectiveDate, companyName);
      setDownloadStatus("downloaded");
      setDownloadCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error manual descargando Excel:", err);
      setDownloadStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header con gradiente elegante */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <FileSpreadsheet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Reporte Diario Oficial en Excel</h1>
          <p className="text-emerald-100 text-sm mt-1 font-medium">Libro de Cálculo Multihojas (.xlsx)</p>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 space-y-6">
          {/* Tarjeta de Información de Empresa y Fecha */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sucursal / Empresa</p>
                <p className="text-base font-bold text-slate-800">{companyName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-800 pt-2 border-t border-slate-200/70">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fecha Contable de Operación</p>
                <p className="text-base font-bold text-slate-800">{friendlyDate}</p>
              </div>
            </div>
          </div>

          {/* Banner de Estado de Descarga */}
          {downloadStatus === "downloaded" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-emerald-900">¡Descarga Iniciada Exitosamente!</p>
                <p className="text-emerald-700 mt-0.5">
                  El archivo Excel se ha descargado a la carpeta de descargas de tu dispositivo.
                </p>
              </div>
            </div>
          )}

          {downloadStatus === "pending" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <p className="text-sm font-medium text-blue-900">
                Generando y procesando el archivo Excel con 4 hojas...
              </p>
            </div>
          )}

          {downloadStatus === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-red-900">Hubo un detalle al iniciar la descarga automática</p>
                <p className="text-red-700 mt-0.5">
                  Haz clic en el botón verde inferior para descargar el archivo directamente.
                </p>
              </div>
            </div>
          )}

          {/* Resumen de Hojas incluidas en el Excel */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Estructura del Libro Excel (4 Hojas)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Dashboard y Arqueo</p>
                  <p className="text-slate-500">Resumen financiero y pagos</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Listado de Cuentas</p>
                  <p className="text-slate-500">Folios de comanda y cobros</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Catálogo de Productos</p>
                  <p className="text-slate-500">Cantidades y piezas vendidas</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs">
                  4
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Cancelaciones</p>
                  <p className="text-slate-500">Motivos y autorizaciones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleManualDownload}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{downloadCount > 0 ? "Volver a Descargar Excel (.xlsx)" : "Descargar Archivo Excel (.xlsx)"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span>Entrar al Sistema Cocinet POS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500">
          Generado automáticamente por Cocinet POS • {companyName}
        </div>
      </div>
    </div>
  );
};
