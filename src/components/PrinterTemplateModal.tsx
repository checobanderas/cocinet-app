import React, { useState, useEffect } from "react";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from "@ionic/react";
import { closeOutline, printOutline, saveOutline, downloadOutline, textOutline, codeDownloadOutline, checkmarkCircleOutline } from "ionicons/icons";

interface PrinterTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerAppNotification?: (title: string, body: string, type: "success" | "error" | "info" | "warning") => void;
}

export const PrinterTemplateModal: React.FC<PrinterTemplateModalProps> = ({
  isOpen,
  onClose,
  triggerAppNotification,
}) => {
  const [fontName, setFontName] = useState<string>("Segoe UI");
  const [fontSizePt, setFontSizePt] = useState<number>(11.0);
  const [headerFontSizePt, setHeaderFontSizePt] = useState<number>(16.0);
  const [itemFontSizePt, setItemFontSizePt] = useState<number>(11.0);
  const [totalFontSizePt, setTotalFontSizePt] = useState<number>(15.0);
  const [marginLeftPx, setMarginLeftPx] = useState<number>(10);
  const [marginRightPx, setMarginRightPx] = useState<number>(25);
  const [lineSpacing, setLineSpacing] = useState<number>(4);
  const [showDivider, setShowDivider] = useState<boolean>(true);
  const [logoPath, setLogoPath] = useState<string>("C:\\buzon\\logo.jpg");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    try {
      // 1. Intentar cargar del servidor Express
      const res = await fetch("/api/sentinel/config");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          applyConfigState(data.config);
          return;
        }
      }

      // 2. Intentar cargar directamente del sentinel local 3010
      const sentinelRes = await fetch("http://localhost:3010/config");
      if (sentinelRes.ok) {
        const data = await sentinelRes.json();
        if (data.success && data.config) {
          applyConfigState(data.config);
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar la configuración previa del Sentinel:", e);
    }
  };

  const applyConfigState = (cfg: any) => {
    if (cfg.FONT_NAME) setFontName(cfg.FONT_NAME);
    if (cfg.FONT_SIZE_PT) setFontSizePt(Number(cfg.FONT_SIZE_PT));
    if (cfg.HEADER_FONT_SIZE_PT) setHeaderFontSizePt(Number(cfg.HEADER_FONT_SIZE_PT));
    if (cfg.ITEM_FONT_SIZE_PT) setItemFontSizePt(Number(cfg.ITEM_FONT_SIZE_PT));
    if (cfg.TOTAL_FONT_SIZE_PT) setTotalFontSizePt(Number(cfg.TOTAL_FONT_SIZE_PT));
    if (cfg.MARGIN_LEFT_PX !== undefined) setMarginLeftPx(Number(cfg.MARGIN_LEFT_PX));
    if (cfg.MARGIN_RIGHT_PX !== undefined) setMarginRightPx(Number(cfg.MARGIN_RIGHT_PX));
    if (cfg.LINE_SPACING !== undefined) setLineSpacing(Number(cfg.LINE_SPACING));
    if (cfg.SHOW_DIVIDER !== undefined) setShowDivider(Boolean(cfg.SHOW_DIVIDER));
    if (cfg.LOGO_PATH) setLogoPath(cfg.LOGO_PATH);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const payload = {
      FONT_NAME: fontName,
      FONT_SIZE_PT: fontSizePt,
      HEADER_FONT_SIZE_PT: headerFontSizePt,
      ITEM_FONT_SIZE_PT: itemFontSizePt,
      TOTAL_FONT_SIZE_PT: totalFontSizePt,
      MARGIN_LEFT_PX: marginLeftPx,
      MARGIN_RIGHT_PX: marginRightPx,
      LINE_SPACING: lineSpacing,
      SHOW_DIVIDER: showDivider,
      LOGO_PATH: logoPath,
    };

    let saved = false;

    // Guardar en servidor local Express
    try {
      const res = await fetch("/api/sentinel/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) saved = true;
    } catch (e) {
      console.warn("Error guardando en Express /api/sentinel/config:", e);
    }

    // Guardar directamente en Sentinel 3010 si está activo
    try {
      const resSentinel = await fetch("http://localhost:3010/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resSentinel.ok) saved = true;
    } catch (e) {
      console.warn("Error guardando directamente en Sentinel 3010:", e);
    }

    setIsSaving(false);
    if (saved) {
      if (triggerAppNotification) {
        triggerAppNotification("🎨 Plantilla Guardada", "La configuración de fuentes y tamaños de ticket se actualizó con éxito.", "success");
      }
    } else {
      if (triggerAppNotification) {
        triggerAppNotification("⚠️ Error", "No se pudo conectar con el servidor para guardar la plantilla.", "error");
      }
    }
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    try {
      const res = await fetch("http://localhost:3010/test-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printer: "cuentas" }),
      });
      if (res.ok) {
        if (triggerAppNotification) {
          triggerAppNotification("🖨️ Ticket Enviado", "Se envió un ticket de prueba al Sentinela GDI en el puerto 3010.", "success");
        }
      } else {
        throw new Error("Respuesta no OK del Sentinel 3010");
      }
    } catch (e: any) {
      if (triggerAppNotification) {
        triggerAppNotification("❌ Error de Impresión", "No se pudo conectar al Sentinela local en http://localhost:3010.", "error");
      }
    } finally {
      setIsTesting(false);
    }
  };

  const downloadFile = async (fileName: string) => {
    try {
      const res = await fetch(`/${fileName}?v=${Date.now()}`);
      if (res.ok) {
        const text = await res.text();
        if (!text.trim().toLowerCase().startsWith("<!doctype html") && !text.trim().toLowerCase().startsWith("<html")) {
          const blob = new Blob([text], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
      }
    } catch (e) {
      console.warn("Fallback de descarga estática:", e);
    }

    const link = document.createElement("a");
    link.href = `/api/sentinel/download/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInstallerFiles = () => {
    const files = ["instalador.bat", "sentinel_printer.py", "instalador_sentinela.py", "printer_config.json"];
    files.forEach((file, index) => {
      setTimeout(() => {
        downloadFile(file);
      }, index * 400);
    });
    setShowInstructions(true);
    if (triggerAppNotification) {
      triggerAppNotification("📥 Descargando Archivos", "Se están descargando los 4 archivos de instalación para el Servicio de Windows.", "info");
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="printer-template-modal">
      <IonHeader>
        <IonToolbar style={{ "--background": "#1e293b", "--color": "white" }}>
          <IonTitle>
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
              <span>🎨</span> Plantilla & Fuentes de Ticket GDI
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} color="light">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-slate-50">
        <div className="max-w-4xl mx-auto p-6 space-y-6 text-left">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30 mb-2 inline-block">
                Diseño Vectorial GDI • Puerto 3010
              </span>
              <h2 className="text-xl font-black tracking-tight text-white m-0">
                Personalización de Tipografía y Layout de Tickets 🖨️
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Ajusta las fuentes de Windows, tamaños de texto, márgenes y descarga el instalador del Servicio de Windows.
              </p>
            </div>
            <button
              onClick={handleDownloadInstallerFiles}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer shrink-0"
            >
              <IonIcon icon={codeDownloadOutline} style={{ fontSize: "18px" }} />
              Descargar Archivos de Instalación 📥
            </button>
          </div>

          {/* Instrucciones de Instalación con Emojis */}
          {showInstructions && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold">
                  🚀
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wide m-0">
                    Pasos para instalar el Servicio en Windows 🛡️
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium m-0">
                    Sigue estos sencillos pasos en la computadora donde está conectada tu impresora:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-950">
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex items-start gap-3">
                  <span className="text-lg">1️⃣</span>
                  <div>
                    <strong className="block text-emerald-900">Guarda los archivos juntos</strong>
                    Coloca los 4 archivos descargados (<code>instalador.bat</code>, <code>sentinel_printer.py</code>, <code>instalador_sentinela.py</code> y <code>printer_config.json</code>) en una misma carpeta (ejemplo: <code>C:\buzon\</code>).
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex items-start gap-3">
                  <span className="text-lg">2️⃣</span>
                  <div>
                    <strong className="block text-emerald-900">Ejecuta como Administrador</strong>
                    Haz clic derecho sobre <strong><code>instalador.bat</code></strong> y selecciona <strong>"Ejecutar como Administrador"</strong> 🛡️.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex items-start gap-3">
                  <span className="text-lg">3️⃣</span>
                  <div>
                    <strong className="block text-emerald-900">Instalación Automática</strong>
                    El script instalará las dependencias necesarias de Python y registrará el servicio <strong>CocinetPrinterSentinel</strong> en el puerto 3010.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex items-start gap-3">
                  <span className="text-lg">4️⃣</span>
                  <div>
                    <strong className="block text-emerald-900">¡Listo para imprimir! 🎉</strong>
                    Tus tickets ahora se imprimirán automáticamente con el diseño GDI configurado.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Configuración de Plantilla */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Izquierda: Tipografía y Tamaños */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <IonIcon icon={textOutline} className="text-indigo-600 text-lg" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider m-0">
                  Fuente & Tamaños de Texto (pt)
                </h3>
              </div>

              {/* FONT FAMILY */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fuente de Windows (Font Family)
                </label>
                <select
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Segoe UI">Segoe UI ⭐ (Recomendada - Moderna y muy legible)</option>
                  <option value="Arial">Arial (Neutra y universal)</option>
                  <option value="Consolas">Consolas (Estilo retro de terminal alineada)</option>
                  <option value="Tahoma">Tahoma (Compacta y nítida)</option>
                  <option value="Verdana">Verdana (Ancha y clara)</option>
                  <option value="Courier New">Courier New (Caja registradora clásica)</option>
                  <option value="Trebuchet MS">Trebuchet MS (Moderna estilizada)</option>
                </select>
              </div>

              {/* HEADER FONT SIZE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tamaño Encabezados / Título:
                  </label>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {headerFontSizePt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="0.5"
                  value={headerFontSizePt}
                  onChange={(e) => setHeaderFontSizePt(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* ITEM FONT SIZE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tamaño Productos / Platillos:
                  </label>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {itemFontSizePt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="9"
                  max="18"
                  step="0.5"
                  value={itemFontSizePt}
                  onChange={(e) => setItemFontSizePt(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* TOTAL FONT SIZE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tamaño Totales / Subtotales:
                  </label>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {totalFontSizePt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="22"
                  step="0.5"
                  value={totalFontSizePt}
                  onChange={(e) => setTotalFontSizePt(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* BASE FONT SIZE */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tamaño Base General:
                  </label>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {fontSizePt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="16"
                  step="0.5"
                  value={fontSizePt}
                  onChange={(e) => setFontSizePt(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Columna Derecha: Márgenes, Logotipo y Separadores */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <IonIcon icon={printOutline} className="text-indigo-600 text-lg" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider m-0">
                  Márgenes, Logotipo y Separadores
                </h3>
              </div>

              {/* MARGENES */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Margen Izq. (px)
                  </label>
                  <input
                    type="number"
                    value={marginLeftPx}
                    onChange={(e) => setMarginLeftPx(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Margen Der. (px)
                  </label>
                  <input
                    type="number"
                    value={marginRightPx}
                    onChange={(e) => setMarginRightPx(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* LINE SPACING */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Espaciado entre Líneas (px)
                </label>
                <input
                  type="number"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              {/* LOGO PATH */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ruta del Logotipo en Windows
                </label>
                <input
                  type="text"
                  value={logoPath}
                  onChange={(e) => setLogoPath(e.target.value)}
                  placeholder="C:\buzon\logo.jpg"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              {/* SHOW DIVIDER CHECKBOX */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700">
                  Líneas Divisorias Vectoriales
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDivider}
                    onChange={(e) => setShowDivider(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* PREVIEW CONTAINER */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5 font-mono text-[11px] border border-slate-800">
                <div className="text-indigo-400 font-bold uppercase tracking-widest text-[9px] flex items-center justify-between">
                  <span>Previsualización Estilizada (POS Tabla):</span>
                  <span className="text-emerald-400 font-normal">✨ Con Emojis & Total en Letra</span>
                </div>
                <div className="truncate font-bold text-center text-amber-300 pt-1" style={{ fontSize: `${headerFontSizePt * 0.8}px`, fontFamily: fontName }}>
                  🌮 TACOS ROY AZUCENAS 🌮
                </div>
                <div className="text-center text-[10px] text-slate-400 pb-1">=== TICKET DE CUENTA ===</div>
                
                {/* ENCABEZADO DE TABLA POS */}
                <div className="border-t border-b border-slate-700 py-1 space-y-0.5">
                  <div className="text-slate-300 font-bold text-[10px]">DESCRIPCIÓN DE PRODUCTO</div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>  CANT x PRECIO U.</span>
                    <span>IMPORTE</span>
                  </div>
                </div>

                {/* PRODUCTO 1 */}
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200" style={{ fontSize: `${itemFontSizePt * 0.95}px`, fontFamily: fontName }}>
                    1 x 🌯 ALAMBRE ESPECIAL CON QUESO
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]" style={{ fontFamily: fontName }}>
                    <span className="pl-3">1 x $145.00</span>
                    <span className="font-bold text-slate-200">$145.00</span>
                  </div>
                  <div className="pl-4 text-[9px] text-amber-300/90 italic">└ * Con salsa verde y limon</div>
                </div>

                {/* PRODUCTO 2 */}
                <div className="space-y-0.5 border-b border-slate-800 pb-1.5">
                  <div className="font-bold text-slate-200" style={{ fontSize: `${itemFontSizePt * 0.95}px`, fontFamily: fontName }}>
                    1 x 🍺 CERVEZA ARTESANAL
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]" style={{ fontFamily: fontName }}>
                    <span className="pl-3">1 x $80.00</span>
                    <span className="font-bold text-slate-200">$80.00</span>
                  </div>
                </div>

                {/* BLOQUE DE TOTALES */}
                <div className="flex justify-between text-slate-400 pt-1" style={{ fontFamily: fontName }}>
                  <span className="pl-16">SUBTOTAL:</span>
                  <span>$225.00</span>
                </div>
                <div className="flex justify-between font-black text-emerald-400 pt-0.5 border-t border-slate-800" style={{ fontSize: `${totalFontSizePt * 0.9}px`, fontFamily: fontName }}>
                  <span className="pl-12">TOTAL A PAGAR:</span>
                  <span>$225.00</span>
                </div>
                <div className="text-center text-[9px] text-indigo-300 italic font-semibold pt-1 border-t border-slate-800" style={{ fontFamily: fontName }}>
                  SON: (DOSCIENTOS VEINTICINCO PESOS 00/100 M.N.)
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleTestPrint}
              disabled={isTesting}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <IonIcon icon={printOutline} />
              {isTesting ? "Imprimiendo..." : "🖨️ Probar Ticket en Impresora (GDI)"}
            </button>

            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <IonIcon icon={saveOutline} />
              {isSaving ? "Guardando..." : "💾 Guardar Plantilla de Ticket"}
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
