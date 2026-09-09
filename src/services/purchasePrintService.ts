import { createTransport, EscPosDriver, PosPrinterJob } from '../utils/printer';
import { numeroALetras, formatReceiptItemLines } from '../utils/formatters';
import { addPedidoToPrinter, getMexicoISOString } from '../utils/firestore';

export interface PurchaseReceptionPrintOptions {
  purchase: {
    id?: string;
    folio?: string;
    supplier: string;
    supplierId?: string;
    invoiceNumber?: string;
    items: Array<{
      inventoryItemId?: string;
      name: string;
      unit?: string;
      qty: number;
      unitCost?: number;
      price: number;
    }>;
    total: number;
    isPaid: boolean;
    paymentMethod?: "efectivo" | "credito" | "transferencia" | string;
    notes?: string;
    timestamp?: string;
    createdBy?: string;
    receivedBy?: string;
    supplierBalance?: number;
  };
  supplier?: any;
  selectedTenant?: any;
  companyConfig?: any;
  currentUser?: any;
  triggerAppNotification?: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export async function executePrintPurchaseReception(options: PurchaseReceptionPrintOptions): Promise<boolean> {
  const {
    purchase,
    supplier,
    selectedTenant,
    companyConfig = {},
    currentUser,
    triggerAppNotification,
  } = options;

  try {
    const bName = (companyConfig.businessName || selectedTenant?.name || "COCINET PRO").toUpperCase();
    const rfcVal = (companyConfig.rfc || selectedTenant?.rfc || "").toUpperCase();
    const dirVal = (companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "").toUpperCase();
    const telVal = companyConfig.telefono || selectedTenant?.telefono || "";
    const sucVal = (companyConfig.sucursal || selectedTenant?.sucursalDefault || "").toUpperCase();

    const folio = purchase.folio || `REC-${purchase.id ? purchase.id.slice(-6).toUpperCase() : Date.now().toString().slice(-6)}`;
    const dateStr = purchase.timestamp ? new Date(purchase.timestamp).toLocaleString("es-MX") : new Date().toLocaleString("es-MX");
    const supplierName = (purchase.supplier || supplier?.name || "PROVEEDOR GENERAL").toUpperCase();
    const invoiceNum = purchase.invoiceNumber || "-";
    const receiverName = (purchase.receivedBy || purchase.createdBy || currentUser?.name || "ALMACEN").toUpperCase();
    const payMode = purchase.paymentMethod === "credito" || !purchase.isPaid
      ? "A CREDITO (PENDIENTE DE PAGO)"
      : purchase.paymentMethod === "transferencia"
      ? "PAGADO (TRANSFERENCIA / BANCO)"
      : "PAGADO DE CONTADO (CAJA)";

    // 1. Sincronización con Firestore Printer Queue (Centinela) si hay tenant
    if (selectedTenant?.id) {
      addPedidoToPrinter(selectedTenant.id, {
        folio,
        mesa: `REC-PROV: ${supplierName}`,
        items: (purchase.items || []).map((item) => ({
          nombre: `${item.name} (${item.unit || "pza"})`,
          cantidad: item.qty,
          precio: item.unitCost || (item.qty > 0 ? item.price / item.qty : item.price),
          subtotal: item.price,
        })),
        subtotal: purchase.total,
        propina: 0,
        descuento: 0,
        total: purchase.total,
        paymentMethod: payMode,
        tipo: "recepcion_compra",
        area: "almacen",
        timestamp: getMexicoISOString(),
        atendidoPor: receiverName,
        businessName: bName,
        rfc: rfcVal,
        direccionFiscal: dirVal,
        telefono: telVal,
        sucursal: sucVal,
      }).catch((err) => console.warn("Centinela Purchase Ticket Error:", err));
    }

    // 2. Impresión Directa ESC/POS (Windows Sentinel o Android RawBT)
    const transport = await createTransport("caja", selectedTenant?.id);
    const driver = new EscPosDriver();
    const job = new PosPrinterJob(driver, transport);

    job.initialize();
    job.center();
    job.bold(true).doubleHeight(true).printLine(bName).doubleHeight(false).bold(false);

    if (rfcVal) job.printLine(`RFC: ${rfcVal}`);
    if (dirVal) job.printLine(dirVal);
    if (telVal) job.printLine(`TEL: ${telVal}`);
    if (sucVal) job.printLine(`SUCURSAL: ${sucVal}`);

    job.printLine("================================");
    job.bold(true).printLine("COMPROBANTE DE RECEPCION").printLine("DE MERCANCIA E INSUMOS").bold(false);
    job.printLine("================================");
    job.left();

    job.bold(true).printLine(`FOLIO: ${folio}`).bold(false);
    job.printLine(`FECHA: ${dateStr}`);
    job.bold(true).printLine(`PROVEEDOR: ${supplierName}`).bold(false);
    if (supplier?.phone) job.printLine(`TEL PROV: ${supplier.phone}`);
    if (invoiceNum !== "-") job.printLine(`REMISION / FACTURA: ${invoiceNum}`);
    job.printLine(`RECIBIO: ${receiverName}`);
    job.printLine("--------------------------------");

    // Header Tabla de Insumos
    job.bold(true).printLine("CANT  DESCRIPCION        IMPORTE").bold(false);
    job.printLine("--------------------------------");

    (purchase.items || []).forEach((item) => {
      const uCost = item.unitCost || (item.qty > 0 ? item.price / item.qty : 0);
      const lineTotalStr = `$${item.price.toFixed(2)}`;
      const descStr = `${item.name} (${item.unit || "pza"})`;
      
      const itemLines = formatReceiptItemLines(
        item.qty,
        `${descStr} @$${uCost.toFixed(2)}`,
        lineTotalStr,
        32
      );
      itemLines.forEach((l) => job.printLine(l));
    });

    job.printLine("--------------------------------");
    job.right();
    job.bold(true).doubleHeight(true).printLine(`TOTAL: $${purchase.total.toFixed(2)}`).doubleHeight(false).bold(false);
    job.center().printLine(`(${numeroALetras(purchase.total)})`);
    job.left();
    job.printLine("--------------------------------");

    job.bold(true).printLine(`CONDICION: ${payMode}`).bold(false);
    if (purchase.notes) {
      job.printLine(`NOTAS: ${purchase.notes}`);
    }
    if (purchase.supplierBalance !== undefined && purchase.supplierBalance > 0) {
      job.printLine(`SALDO DEUDOR PROVEEDOR: $${purchase.supplierBalance.toFixed(2)}`);
    }

    // Sección de Firmas
    job.printLine(" ");
    job.printLine(" ");
    job.center();
    job.printLine("______________________________");
    job.bold(true).printLine("FIRMA ENTREGO (PROVEEDOR)").bold(false);
    job.printLine(" ");
    job.printLine(" ");
    job.printLine("______________________________");
    job.bold(true).printLine("FIRMA RECIBIO (ALMACEN/CAJA)").bold(false);

    job.printLine(" ");
    job.printLine("* Engrapar este comprobante junto");
    job.printLine("  con la remision/nota fisica. *");
    job.printLine("================================");
    job.feed(3);
    job.cut();

    await job.execute();

    if (triggerAppNotification) {
      triggerAppNotification(
        "🖨️ Ticket de Recepción",
        `Comprobante de compra para ${supplierName} enviado a la impresora.`,
        "success"
      );
    }

    return true;
  } catch (error) {
    console.error("Error al imprimir ticket de compra:", error);
    
    // Fallback con ventana de impresión nativa HTML
    printPurchaseReceiptHtml(options);

    if (triggerAppNotification) {
      triggerAppNotification(
        "📄 Vista de Impresión",
        "Abriendo comprobante de recepción para impresión manual.",
        "info"
      );
    }
    return true;
  }
}

/**
 * Generador HTML para impresión en ventana / popup o navegador
 */
export function printPurchaseReceiptHtml(options: PurchaseReceptionPrintOptions) {
  const { purchase, supplier, selectedTenant, companyConfig = {}, currentUser } = options;

  const bName = companyConfig.businessName || selectedTenant?.name || "COCINET PRO";
  const rfcVal = companyConfig.rfc || selectedTenant?.rfc || "";
  const dirVal = companyConfig.direccionFiscal || selectedTenant?.direccionFiscal || "";
  const telVal = companyConfig.telefono || selectedTenant?.telefono || "";
  const folio = purchase.folio || `REC-${purchase.id ? purchase.id.slice(-6).toUpperCase() : Date.now().toString().slice(-6)}`;
  const dateStr = purchase.timestamp ? new Date(purchase.timestamp).toLocaleString("es-MX") : new Date().toLocaleString("es-MX");
  const supplierName = purchase.supplier || supplier?.name || "Proveedor General";
  const invoiceNum = purchase.invoiceNumber || "-";
  const receiverName = purchase.receivedBy || purchase.createdBy || currentUser?.name || "Almacén";
  const payMode = purchase.paymentMethod === "credito" || !purchase.isPaid
    ? "A CRÉDITO (PENDIENTE DE PAGO)"
    : purchase.paymentMethod === "transferencia"
    ? "PAGADO (TRANSFERENCIA / BANCO)"
    : "PAGADO DE CONTADO (CAJA 💵)";

  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Comprobante de Recepción ${folio}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          margin: 0;
          padding: 8px;
          color: #000;
          background: #fff;
          width: 72mm;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .title { font-size: 15px; font-weight: 900; margin-bottom: 2px; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 11px; }
        .table th { border-bottom: 1px dashed #000; padding: 2px 0; }
        .table td { padding: 3px 0; vertical-align: top; }
        .signatures { margin-top: 25px; text-align: center; }
        .sig-line { border-top: 1px solid #000; width: 80%; margin: 30px auto 4px auto; }
        .notice { font-size: 10px; text-align: center; margin-top: 12px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="title">${bName.toUpperCase()}</div>
        ${rfcVal ? `<div>RFC: ${rfcVal}</div>` : ""}
        ${dirVal ? `<div>${dirVal}</div>` : ""}
        ${telVal ? `<div>Tel: ${telVal}</div>` : ""}
        <div class="divider"></div>
        <div class="bold">COMPROBANTE DE RECEPCIÓN</div>
        <div class="bold">DE MERCANCÍA E INSUMOS</div>
        <div class="divider"></div>
      </div>

      <div><b>FOLIO:</b> ${folio}</div>
      <div><b>FECHA:</b> ${dateStr}</div>
      <div><b>PROVEEDOR:</b> ${supplierName}</div>
      ${invoiceNum !== "-" ? `<div><b>REMISIÓN / FACTURA:</b> ${invoiceNum}</div>` : ""}
      <div><b>RECIBIÓ:</b> ${receiverName}</div>

      <div class="divider"></div>

      <table class="table">
        <thead>
          <tr>
            <th align="left">Cant / Insumo</th>
            <th align="right">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${(purchase.items || [])
            .map(
              (item) => `
            <tr>
              <td>
                <b>${item.qty} ${item.unit || "pza"}</b> x ${item.name}<br/>
                <span style="font-size:10px; color:#555;">@$${(item.unitCost || (item.qty > 0 ? item.price / item.qty : 0)).toFixed(2)}</span>
              </td>
              <td align="right" class="bold">$${item.price.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="divider"></div>

      <div class="right" style="font-size: 14px; font-weight: 900;">
        TOTAL COMPRA: $${purchase.total.toFixed(2)}
      </div>
      <div class="center" style="font-size: 10px; margin-top: 2px;">
        (${numeroALetras(purchase.total)})
      </div>

      <div class="divider"></div>
      <div><b>CONDICIÓN:</b> ${payMode}</div>
      ${purchase.notes ? `<div><b>NOTAS:</b> ${purchase.notes}</div>` : ""}

      <div class="signatures">
        <div class="sig-line"></div>
        <div class="bold">FIRMA ENTREGÓ (PROVEEDOR)</div>

        <div class="sig-line"></div>
        <div class="bold">FIRMA RECIBIÓ (ALMACÉN / CAJA)</div>
      </div>

      <div class="notice">
        * Engrapar este comprobante junto con la remisión o nota física del proveedor. *
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
