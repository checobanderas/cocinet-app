import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
  IonBadge,
} from "@ionic/react";
import {
  closeOutline,
  cloudUploadOutline,
  documentTextOutline,
  sparklesOutline,
  downloadOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  swapHorizontalOutline,
  helpCircleOutline,
  arrowForwardOutline,
  refreshOutline,
  documentAttachOutline,
} from "ionicons/icons";
import * as XLSX from "xlsx";
import { Product } from "../utils/appHelpers";
import { bulkUpdateProductsSubgroupsInFirebase } from "../utils/firestore";

interface MenuPdfAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedTenant: string;
  triggerAppNotification: (
    title: string,
    message: string,
    type: "success" | "warning" | "error" | "info"
  ) => void;
  sisterTenants?: { id: string; name: string }[];
}

export interface ReconciledAuditItem {
  excelRowIndex: number;
  originalRow: any[];
  excelName: string;
  excelPrice: number;
  excelOrder?: number | string;
  pdfMatchedName: string;
  pdfMatchedPrice: number | null;
  priceDiff: number;
  status: "price_diff" | "exact_match" | "missing_in_pdf" | "new_in_pdf";
  selectedPrice: number;
  acceptedAction: "use_pdf" | "keep_excel" | "custom";
  customPrice?: number;
  notes: string;
}

export interface NewPdfProductItem {
  name: string;
  price: number;
  section: string;
  accepted: boolean;
}

export const MenuPdfAuditorModal: React.FC<MenuPdfAuditorModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedTenant,
  triggerAppNotification,
  sisterTenants = [],
}) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [rawWorkbook, setRawWorkbook] = useState<any | null>(null);
  const [rawExcelRows, setRawExcelRows] = useState<any[]>([]);
  const [reconciledItems, setReconciledItems] = useState<ReconciledAuditItem[]>([]);
  const [newPdfProducts, setNewPdfProducts] = useState<NewPdfProductItem[]>([]);
  
  const [activeTabFilter, setActiveTabFilter] = useState<
    "all" | "diffs" | "missing_in_pdf" | "new_in_pdf" | "matches"
  >("all");

  const [isSavingToCocinet, setIsSavingToCocinet] = useState<boolean>(false);
  const [replicateToSisters, setReplicateToSisters] = useState<boolean>(true);

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:application/pdf;base64,
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 1. Process Excel + PDF with Gemini Flash
  const handleStartAudit = async () => {
    if (!excelFile) {
      triggerAppNotification("Falta Archivo Excel", "Por favor selecciona la lista de Excel de la empresa.", "warning");
      return;
    }
    if (!pdfFile) {
      triggerAppNotification("Falta Carta en PDF", "Por favor selecciona el archivo PDF de la Carta del restaurante.", "warning");
      return;
    }

    const apiKeyToUse =
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("local_gemini_api_key") ||
      ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
      "";

    setIsProcessing(true);
    setProcessingStage("Leyendo archivo Excel de la empresa...");
    setProgressPercent(15);

    try {
      // Step A: Parse Excel
      const excelAb = await excelFile.arrayBuffer();
      const wb = XLSX.read(excelAb, { type: "array" });
      setRawWorkbook(wb);

      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];
      const sheetRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setRawExcelRows(sheetRows);

      // Extract products from Excel rows
      const extractedExcelItems: Array<{
        rowIndex: number;
        originalRow: any[];
        name: string;
        price: number;
        order?: any;
      }> = [];

      sheetRows.forEach((row, idx) => {
        if (!Array.isArray(row) || row.length === 0) return;
        const col0 = String(row[0] || "").trim();
        if (!col0 || col0 === "0") return;

        // Skip obvious headers
        const upper0 = col0.toUpperCase();
        if (upper0.includes("PRODUCTO") || upper0.includes("NOMBRE") || upper0.includes("CONSECUTIVO")) return;

        // Determine price and consecutive
        let orderNum: any = "";
        let priceNum = NaN;

        for (let i = 1; i < row.length; i++) {
          const valStr = String(row[i] || "").replace(/[$,]/g, "").trim();
          if (valStr !== "") {
            const parsed = parseFloat(valStr);
            if (!isNaN(parsed)) {
              if (orderNum === "") orderNum = parsed;
              else if (isNaN(priceNum)) priceNum = parsed;
            }
          }
        }

        // If priceNum wasn't found in col 2, but was in col 1 or 3
        if (isNaN(priceNum) && typeof orderNum === "number") {
          priceNum = orderNum;
          orderNum = idx + 1;
        }

        if (!isNaN(priceNum) && priceNum >= 0) {
          extractedExcelItems.push({
            rowIndex: idx,
            originalRow: row,
            name: col0,
            price: priceNum,
            order: orderNum,
          });
        }
      });

      setProcessingStage(`Excel procesado (${extractedExcelItems.length} productos). Convirtiendo Carta PDF...`);
      setProgressPercent(40);

      // Step B: Convert PDF to base64
      const pdfBase64 = await fileToBase64(pdfFile);

      setProcessingStage("Analizando Carta PDF y cruzando precios con Inteligencia Artificial (Gemini 2.5 Flash)...");
      setProgressPercent(65);

      let matchedData: any = null;

      if (apiKeyToUse) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyToUse}`;

        const promptText = `Eres un auditor experto de restaurantes.
Se te proporciona el PDF de la Carta/Menú física de un restaurante y una lista de productos en formato JSON proveniente del Excel contable de la empresa.

Tu tarea es:
1. Extraer TODOS los platillos, bebidas, postres y complementos con sus PRECIOS EXACTOS visibles en el PDF de la Carta.
2. Emparejar semánticamente cada producto del Excel con su correspondiente platillo en la Carta PDF (tolera diferencias sutiles como "ALAMBRE PASTOR" vs "Alambre Especial de Pastor", "1/2 KILO ASADA" vs "Medio Kilo de Asada", mayúsculas/minúsculas).
3. Detectar platillos visibles en el PDF de la Carta que NO están en el Excel de la empresa.

LISTA DE PRODUCTOS DEL EXCEL:
${JSON.stringify(extractedExcelItems.map(item => ({ id: item.rowIndex, name: item.name, price: item.price })))}

Retorna EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "matches": [
    {
      "excelIndex": number,
      "excelName": "string",
      "excelPrice": number,
      "pdfName": "string",
      "pdfPrice": number,
      "confidence": number,
      "notes": "string"
    }
  ],
  "newInPdf": [
    {
      "name": "string",
      "price": number,
      "section": "string"
    }
  ]
}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inline_data: {
                      mime_type: pdfFile.type || "application/pdf",
                      data: pdfBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Error en API Gemini: ${response.status} - ${errText}`);
        }

        const jsonRes = await response.json();
        const rawContent = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          try {
            matchedData = JSON.parse(rawContent);
          } catch (e) {
            console.error("Error al parsear respuesta JSON de Gemini:", e);
          }
        }
      }

      setProcessingStage("Generando reporte comparativo y tabla de discrepancias...");
      setProgressPercent(90);

      // Step C: Build Reconciled Items
      const auditItems: ReconciledAuditItem[] = [];
      const matchedMap = new Map<number, any>();

      if (matchedData?.matches && Array.isArray(matchedData.matches)) {
        matchedData.matches.forEach((m: any) => {
          if (typeof m.excelIndex === "number") {
            matchedMap.set(m.excelIndex, m);
          }
        });
      }

      extractedExcelItems.forEach((item) => {
        const match = matchedMap.get(item.rowIndex);
        let pdfMatchedName = item.name;
        let pdfMatchedPrice: number | null = null;
        let notes = "";

        if (match) {
          pdfMatchedName = match.pdfName || item.name;
          pdfMatchedPrice = typeof match.pdfPrice === "number" ? match.pdfPrice : null;
          notes = match.notes || "";
        }

        let status: ReconciledAuditItem["status"] = "missing_in_pdf";
        let priceDiff = 0;
        let selectedPrice = item.price;

        if (pdfMatchedPrice !== null) {
          priceDiff = pdfMatchedPrice - item.price;
          if (Math.abs(priceDiff) > 0.01) {
            status = "price_diff";
            selectedPrice = pdfMatchedPrice; // Default to Carta price on difference
          } else {
            status = "exact_match";
            selectedPrice = item.price;
          }
        }

        auditItems.push({
          excelRowIndex: item.rowIndex,
          originalRow: item.originalRow,
          excelName: item.name,
          excelPrice: item.price,
          excelOrder: item.order,
          pdfMatchedName: pdfMatchedName,
          pdfMatchedPrice: pdfMatchedPrice,
          priceDiff: priceDiff,
          status: status,
          selectedPrice: selectedPrice,
          acceptedAction: status === "price_diff" ? "use_pdf" : "keep_excel",
          notes: notes,
        });
      });

      setReconciledItems(auditItems);

      // New products in PDF
      const newItems: NewPdfProductItem[] = [];
      if (matchedData?.newInPdf && Array.isArray(matchedData.newInPdf)) {
        matchedData.newInPdf.forEach((np: any) => {
          if (np.name && typeof np.price === "number") {
            newItems.push({
              name: np.name,
              price: np.price,
              section: np.section || "ALIMENTOS",
              accepted: true,
            });
          }
        });
      }
      setNewPdfProducts(newItems);

      setProgressPercent(100);
      setProcessingStage("¡Auditoría completada exitosamente!");

      const totalDiffs = auditItems.filter((i) => i.status === "price_diff").length;
      triggerAppNotification(
        "Auditoría Completada ⚖️",
        `Se encontraron ${totalDiffs} discrepancias de precio y ${newItems.length} platillos nuevos en la Carta.`,
        totalDiffs > 0 ? "warning" : "success"
      );
    } catch (err: any) {
      console.error("Error durante la auditoría:", err);
      triggerAppNotification("Error en Auditoría", err?.message || "Ocurrió un error al procesar los archivos.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Export identical Excel with added audit columns (Preserves Exact Row Order)
  const handleExportAuditorExcel = () => {
    if (!rawExcelRows || rawExcelRows.length === 0 || reconciledItems.length === 0) {
      triggerAppNotification("Sin datos", "Primero realiza la auditoría de los archivos.", "warning");
      return;
    }

    try {
      // Map reconciled by row index
      const itemByRowIndex = new Map<number, ReconciledAuditItem>();
      reconciledItems.forEach((it) => itemByRowIndex.set(it.excelRowIndex, it));

      // Build rows copying original exact columns + 3 audit columns
      const updatedSheetRows: any[][] = [];

      // Find max original columns to append headers cleanly
      let maxCols = 0;
      rawExcelRows.forEach((r) => {
        if (Array.isArray(r) && r.length > maxCols) maxCols = r.length;
      });

      let headerAdded = false;

      rawExcelRows.forEach((row, idx) => {
        const rowCopy = Array.isArray(row) ? [...row] : [];
        while (rowCopy.length < maxCols) {
          rowCopy.push("");
        }

        const auditItem = itemByRowIndex.get(idx);

        if (!headerAdded && (idx === 0 || String(row[0] || "").toUpperCase().includes("PRODUCTO"))) {
          rowCopy.push("PRECIO EN CARTA PDF");
          rowCopy.push("DIFERENCIA ($)");
          rowCopy.push("ESTADO AUDITORÍA / ACCIÓN");
          headerAdded = true;
        } else if (auditItem) {
          if (auditItem.pdfMatchedPrice !== null) {
            rowCopy.push(auditItem.pdfMatchedPrice);
            rowCopy.push(auditItem.priceDiff);

            if (auditItem.status === "price_diff") {
              const diffText = auditItem.priceDiff > 0 ? `+$${auditItem.priceDiff}` : `-$${Math.abs(auditItem.priceDiff)}`;
              rowCopy.push(`🔴 CAMBIAR PRECIO (Excel: $${auditItem.excelPrice} -> Carta: $${auditItem.pdfMatchedPrice} [${diffText}])`);
            } else {
              rowCopy.push("🟢 PRECIO CORRECTO (Coincide)");
            }
          } else {
            rowCopy.push("No encontrado en PDF");
            rowCopy.push(0);
            rowCopy.push("🔵 NO FIGURA EN CARTA FÍSICA");
          }
        } else {
          // Empty row or section header
          rowCopy.push("");
          rowCopy.push("");
          rowCopy.push("");
        }

        updatedSheetRows.push(rowCopy);
      });

      // Create Workbook with 2 Sheets: Sheet 1 (Exact Audited Excel), Sheet 2 (Nuevos Platillos)
      const newWb = XLSX.utils.book_new();

      const wsAudited = XLSX.utils.aoa_to_sheet(updatedSheetRows);
      XLSX.utils.book_append_sheet(newWb, wsAudited, "Auditoría Precios Original");

      if (newPdfProducts.length > 0) {
        const newProductsRows: any[][] = [
          ["SECCIÓN EN CARTA", "PLATILLO EN CARTA PDF", "PRECIO EN CARTA ($)", "OBSERVACIÓN CONTABLE"],
          ...newPdfProducts.map((np) => [
            np.section,
            np.name,
            np.price,
            "🟡 DAR DE ALTA EN CATÁLOGO CONTABLE (Nuevo en Carta)",
          ]),
        ];
        const wsNew = XLSX.utils.aoa_to_sheet(newProductsRows);
        XLSX.utils.book_append_sheet(newWb, wsNew, "Platillos Nuevos en Carta");
      }

      const fileName = `Auditoria_Discrepancias_${selectedTenant}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(newWb, fileName);

      triggerAppNotification("Excel Generado 📥", `Se exportó "${fileName}" con el orden exacto del auditor.`, "success");
    } catch (err: any) {
      console.error("Error exportando Excel del auditor:", err);
      triggerAppNotification("Error al Exportar", err?.message || "No se pudo generar el archivo Excel.", "error");
    }
  };

  // 3. Apply Reconciled Prices directly to Cocinet Firestore Database
  const handleApplyToCocinet = async () => {
    if (reconciledItems.length === 0) return;

    setIsSavingToCocinet(true);
    try {
      const updates: Array<{ id: string; price: number; name?: string }> = [];

      // Map existing products by lowercase name
      const existingProductMap = new Map<string, Product>();
      products.forEach((p) => {
        if (!p.isDeleted) {
          existingProductMap.set(p.name.trim().toLowerCase(), p);
        }
      });

      reconciledItems.forEach((item) => {
        const pKey = item.excelName.trim().toLowerCase();
        const existing = existingProductMap.get(pKey);
        if (existing) {
          const finalPrice = item.acceptedAction === "use_pdf" && item.pdfMatchedPrice !== null
            ? item.pdfMatchedPrice
            : item.acceptedAction === "custom" && typeof item.customPrice === "number"
            ? item.customPrice
            : item.excelPrice;

          if (existing.price !== finalPrice) {
            updates.push({
              id: existing.id,
              price: finalPrice,
            });
          }
        }
      });

      if (updates.length > 0) {
        await bulkUpdateProductsSubgroupsInFirebase(
          selectedTenant,
          updates as any
        );

        if (replicateToSisters && sisterTenants.length > 0) {
          for (const sis of sisterTenants) {
            await bulkUpdateProductsSubgroupsInFirebase(
              sis.id,
              updates as any
            );
          }
        }

        triggerAppNotification(
          "Precios Actualizados ✅",
          `Se actualizaron ${updates.length} precios en Cocinet${replicateToSisters ? " y se replicaron a las sucursales." : "."}`,
          "success"
        );
      } else {
        triggerAppNotification("Sin Cambios", "No había precios pendientes de actualización.", "info");
      }

      onClose();
    } catch (err: any) {
      console.error("Error al guardar precios en Cocinet:", err);
      triggerAppNotification("Error al Guardar", err?.message || "Ocurrió un error al actualizar Firebase.", "error");
    } finally {
      setIsSavingToCocinet(false);
    }
  };

  // Metrics
  const diffsCount = reconciledItems.filter((i) => i.status === "price_diff").length;
  const matchesCount = reconciledItems.filter((i) => i.status === "exact_match").length;
  const missingInPdfCount = reconciledItems.filter((i) => i.status === "missing_in_pdf").length;
  const newInPdfCount = newPdfProducts.length;

  const filteredItems = reconciledItems.filter((it) => {
    if (activeTabFilter === "all") return true;
    if (activeTabFilter === "diffs") return it.status === "price_diff";
    if (activeTabFilter === "matches") return it.status === "exact_match";
    if (activeTabFilter === "missing_in_pdf") return it.status === "missing_in_pdf";
    return true;
  });

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{ "--width": "95vw", "--max-width": "1200px", "--height": "92vh" }}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            ⚖️ Auditor y Conciliador de Precios: Excel de la Empresa vs Carta en PDF
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} fill="clear" color="light">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ "--background": "#f8fafc", padding: "16px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "16px 12px 40px 12px" }}>
          
          {/* STEP 1: Upload Zones */}
          {reconciledItems.length === 0 && (
            <div style={{ background: "white", padding: "24px", borderRadius: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "1.6rem" }}>📂</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#1e293b" }}>
                    Paso 1: Sube ambos archivos para cruzar y contrastar
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                    La Inteligencia Artificial cruzará fila por fila el Excel contra la Carta PDF y detectará precios desactualizados o faltantes.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
                {/* Excel Upload Card */}
                <div
                  style={{
                    border: excelFile ? "2px solid #22c55e" : "2px dashed #94a3b8",
                    borderRadius: "14px",
                    padding: "20px",
                    background: excelFile ? "#f0fdf4" : "#f8fafc",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => document.getElementById("auditor-excel-file-input")?.click()}
                >
                  <input
                    id="auditor-excel-file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) setExcelFile(e.target.files[0]);
                    }}
                  />
                  <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>📊</div>
                  <div style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem" }}>
                    {excelFile ? excelFile.name : "1. Seleccionar Lista de Excel"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                    {excelFile ? `(${(excelFile.size / 1024).toFixed(1)} KB)` : "El archivo que te envió la empresa (.xlsx)"}
                  </div>
                  {excelFile && (
                    <IonBadge color="success" style={{ marginTop: "10px" }}>
                      ✓ Excel Cargado
                    </IonBadge>
                  )}
                </div>

                {/* PDF Upload Card */}
                <div
                  style={{
                    border: pdfFile ? "2px solid #22c55e" : "2px dashed #94a3b8",
                    borderRadius: "14px",
                    padding: "20px",
                    background: pdfFile ? "#f0fdf4" : "#f8fafc",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => document.getElementById("auditor-pdf-file-input")?.click()}
                >
                  <input
                    id="auditor-pdf-file-input"
                    type="file"
                    accept=".pdf,image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                    }}
                  />
                  <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>📜</div>
                  <div style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem" }}>
                    {pdfFile ? pdfFile.name : "2. Seleccionar Carta en PDF"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                    {pdfFile ? `(${(pdfFile.size / 1024).toFixed(1)} KB)` : "El menú impreso o diseño en PDF del restaurante"}
                  </div>
                  {pdfFile && (
                    <IonBadge color="success" style={{ marginTop: "10px" }}>
                      ✓ Carta PDF Cargada
                    </IonBadge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <button
                  onClick={handleStartAudit}
                  disabled={!excelFile || !pdfFile || isProcessing}
                  style={{
                    padding: "12px 32px",
                    background: !excelFile || !pdfFile || isProcessing ? "#cbd5e1" : "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: !excelFile || !pdfFile || isProcessing ? "not-allowed" : "pointer",
                    boxShadow: !excelFile || !pdfFile || isProcessing ? "none" : "0 4px 14px rgba(79, 70, 229, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {isProcessing ? (
                    <>
                      <IonSpinner name="crescent" style={{ width: "20px", height: "20px" }} />
                      <span>{processingStage || "Procesando con IA..."}</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={sparklesOutline} style={{ fontSize: "1.2rem" }} />
                      <span>Iniciar Auditoría y Cruzar Precios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Results & Reconciliation Dashboard */}
          {reconciledItems.length > 0 && (
            <div>
              {/* Top Summary Bar */}
              <div style={{ background: "white", padding: "18px 20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⚖️</span> Resultados de Auditoría ({reconciledItems.length} analizados)
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "3px" }}>
                    {excelFile?.name} <span style={{ color: "#94a3b8" }}>vs</span> {pdfFile?.name}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleExportAuditorExcel}
                    style={{
                      padding: "9px 16px",
                      background: "#059669",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.88rem",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                    }}
                  >
                    <IonIcon icon={downloadOutline} style={{ fontSize: "1.1rem" }} />
                    <span>📥 Exportar Discrepancias para Auditor</span>
                  </button>

                  <button
                    onClick={handleApplyToCocinet}
                    disabled={isSavingToCocinet}
                    style={{
                      padding: "9px 18px",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.88rem",
                      borderRadius: "10px",
                      border: "none",
                      cursor: isSavingToCocinet ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                    }}
                  >
                    {isSavingToCocinet ? (
                      <IonSpinner name="crescent" style={{ width: "16px", height: "16px" }} />
                    ) : (
                      <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: "1.1rem" }} />
                    )}
                    <span>✅ Aplicar Precios al Menú</span>
                  </button>

                  <button
                    onClick={() => {
                      setReconciledItems([]);
                      setNewPdfProducts([]);
                    }}
                    style={{
                      padding: "9px 12px",
                      background: "#f1f5f9",
                      color: "#475569",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    <IonIcon icon={refreshOutline} />
                  </button>
                </div>
              </div>

              {/* Status Filter Badges */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "12px" }}>
                <button
                  onClick={() => setActiveTabFilter("all")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    border: activeTabFilter === "all" ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                    background: activeTabFilter === "all" ? "#4f46e5" : "white",
                    color: activeTabFilter === "all" ? "white" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  Todos ({reconciledItems.length})
                </button>

                <button
                  onClick={() => setActiveTabFilter("diffs")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    border: activeTabFilter === "diffs" ? "2px solid #dc2626" : "1px solid #fecaca",
                    background: activeTabFilter === "diffs" ? "#dc2626" : "#fef2f2",
                    color: activeTabFilter === "diffs" ? "white" : "#b91c1c",
                    cursor: "pointer",
                  }}
                >
                  🔴 Diferencias de Precio ({diffsCount})
                </button>

                {newInPdfCount > 0 && (
                  <button
                    onClick={() => setActiveTabFilter("new_in_pdf")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.82rem",
                      fontWeight: "bold",
                      border: activeTabFilter === "new_in_pdf" ? "2px solid #d97706" : "1px solid #fde68a",
                      background: activeTabFilter === "new_in_pdf" ? "#d97706" : "#fffbeb",
                      color: activeTabFilter === "new_in_pdf" ? "white" : "#b45309",
                      cursor: "pointer",
                    }}
                  >
                    🟡 Nuevos en Carta PDF ({newInPdfCount})
                  </button>
                )}

                <button
                  onClick={() => setActiveTabFilter("missing_in_pdf")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    border: activeTabFilter === "missing_in_pdf" ? "2px solid #2563eb" : "1px solid #bfdbfe",
                    background: activeTabFilter === "missing_in_pdf" ? "#2563eb" : "#eff6ff",
                    color: activeTabFilter === "missing_in_pdf" ? "white" : "#1d4ed8",
                    cursor: "pointer",
                  }}
                >
                  🔵 No en Carta ({missingInPdfCount})
                </button>

                <button
                  onClick={() => setActiveTabFilter("matches")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    border: activeTabFilter === "matches" ? "2px solid #16a34a" : "1px solid #bbf7d0",
                    background: activeTabFilter === "matches" ? "#16a34a" : "#f0fdf4",
                    color: activeTabFilter === "matches" ? "white" : "#15803d",
                    cursor: "pointer",
                  }}
                >
                  🟢 Correctos ({matchesCount})
                </button>
              </div>

              {/* Table of Reconciled Items */}
              {activeTabFilter !== "new_in_pdf" && (
                <div style={{ background: "white", borderRadius: "14px", border: "1px solid #cbd5e1", overflowX: "auto", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1", textAlign: "left" }}>
                        <th style={{ padding: "10px 12px", color: "#475569", width: "40px" }}>#</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Producto en Excel</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Precio Excel</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Precio Carta PDF</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Diferencia</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Acción Seleccionada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => {
                        const isDiff = item.status === "price_diff";
                        const isMissing = item.status === "missing_in_pdf";
                        const rowBg = isDiff ? "#fff1f2" : isMissing ? "#f8fafc" : "#ffffff";

                        return (
                          <tr key={index} style={{ background: rowBg, borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: "bold" }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#1e293b" }}>
                              {item.excelName}
                              {item.pdfMatchedName && item.pdfMatchedName.toLowerCase() !== item.excelName.toLowerCase() && (
                                <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: "normal" }}>
                                  Match Carta: {item.pdfMatchedName}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#334155" }}>
                              ${item.excelPrice}
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                              {item.pdfMatchedPrice !== null ? (
                                <span style={{ color: isDiff ? "#dc2626" : "#16a34a" }}>
                                  ${item.pdfMatchedPrice}
                                </span>
                              ) : (
                                <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>
                                  No aparece
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              {item.pdfMatchedPrice !== null ? (
                                isDiff ? (
                                  <span style={{ color: item.priceDiff > 0 ? "#dc2626" : "#ea580c", fontWeight: "bold" }}>
                                    {item.priceDiff > 0 ? `+$${item.priceDiff}` : `-$${Math.abs(item.priceDiff)}`}
                                  </span>
                                ) : (
                                  <span style={{ color: "#16a34a", fontSize: "0.8rem" }}>$0.00 ✓</span>
                                )
                              ) : (
                                <span style={{ color: "#94a3b8" }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              {isDiff && item.pdfMatchedPrice !== null ? (
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    onClick={() => {
                                      const updated = [...reconciledItems];
                                      const target = updated.find((u) => u.excelRowIndex === item.excelRowIndex);
                                      if (target) {
                                        target.acceptedAction = "use_pdf";
                                        target.selectedPrice = target.pdfMatchedPrice!;
                                        setReconciledItems(updated);
                                      }
                                    }}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                      border: item.acceptedAction === "use_pdf" ? "1.5px solid #16a34a" : "1px solid #cbd5e1",
                                      background: item.acceptedAction === "use_pdf" ? "#16a34a" : "white",
                                      color: item.acceptedAction === "use_pdf" ? "white" : "#334155",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Usar Carta (${item.pdfMatchedPrice})
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = [...reconciledItems];
                                      const target = updated.find((u) => u.excelRowIndex === item.excelRowIndex);
                                      if (target) {
                                        target.acceptedAction = "keep_excel";
                                        target.selectedPrice = target.excelPrice;
                                        setReconciledItems(updated);
                                      }
                                    }}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                      border: item.acceptedAction === "keep_excel" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                                      background: item.acceptedAction === "keep_excel" ? "#2563eb" : "white",
                                      color: item.acceptedAction === "keep_excel" ? "white" : "#334155",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Dejar Excel (${item.excelPrice})
                                  </button>
                                </div>
                              ) : isMissing ? (
                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Conservar Excel</span>
                              ) : (
                                <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: "bold" }}>Coincide</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table of New Products in PDF */}
              {activeTabFilter === "new_in_pdf" && (
                <div style={{ background: "white", borderRadius: "14px", border: "1px solid #cbd5e1", overflowX: "auto", padding: "16px" }}>
                  <h4 style={{ margin: "0 0 12px 0", color: "#b45309", fontSize: "1rem", fontWeight: "bold" }}>
                    🟡 Platillos encontrados en la Carta PDF que faltaban en el Excel ({newPdfProducts.length})
                  </h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#fef3c7", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px" }}>Sección</th>
                        <th style={{ padding: "8px 12px" }}>Platillo en Carta</th>
                        <th style={{ padding: "8px 12px" }}>Precio Carta</th>
                        <th style={{ padding: "8px 12px" }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newPdfProducts.map((np, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #fde68a" }}>
                          <td style={{ padding: "8px 12px", color: "#92400e", fontWeight: "bold" }}>{np.section}</td>
                          <td style={{ padding: "8px 12px", fontWeight: "bold", color: "#1e293b" }}>{np.name}</td>
                          <td style={{ padding: "8px 12px", color: "#16a34a", fontWeight: "bold" }}>${np.price}</td>
                          <td style={{ padding: "8px 12px", color: "#059669", fontSize: "0.8rem", fontWeight: "bold" }}>
                            ✓ Se incluirá en la exportación para el auditor
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </IonContent>
    </IonModal>
  );
};
