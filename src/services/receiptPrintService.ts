import { TableData, User } from '../utils/appHelpers';
import { getFormattedProductName } from '../utils/appHelpers';
import { numeroALetras, formatReceiptItemLines } from '../utils/formatters';
import { createTransport, EscPosDriver, PosPrinterJob, formatPhone } from '../utils/printer';
import { addPedidoToPrinter, getMexicoISOString } from '../utils/firestore';

export interface ReceiptPrintOptions {
  table: TableData;
  view?: "resumen" | "comandas" | "comensales";
  explicitPaymentMethod?: string;
  explicitCardType?: string;
  selectedTenant?: any;
  companyConfig?: any;
  currentUser?: User | null;
  selectedDeliveryClient?: any;
  selectedDeliveryAddress?: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  paymentCardType?: string;
  paymentDiscountType?: "percent" | "amount";
  paymentDiscountValue?: number;
  paymentTipValue?: number;
  requiresInvoice?: boolean;
  invoicePhone?: string;
  triggerAppNotification?: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info', extra?: any) => void;
  processedPrintIdsRef?: React.MutableRefObject<Set<string>>;
}

export async function executePrintTicket(options: ReceiptPrintOptions): Promise<boolean> {
  const {
    table,
    view = "resumen",
    explicitPaymentMethod,
    explicitCardType,
    selectedTenant,
    companyConfig = {},
    currentUser,
    selectedDeliveryClient,
    selectedDeliveryAddress,
    deliveryNotes,
    paymentMethod = "",
    paymentCardType = "",
    paymentDiscountType = "amount",
    paymentDiscountValue = 0,
    paymentTipValue = 0,
    requiresInvoice = false,
    invoicePhone = "",
    triggerAppNotification,
    processedPrintIdsRef,
  } = options;

  const activePayMethod = explicitPaymentMethod || paymentMethod || (table as any).paymentMethod || (table as any).metodoPago || "";
  const activeCardType = explicitCardType || paymentCardType || (table as any).cardType || (table as any).tipoTarjeta || "";

  const allItems = table.comandas ? table.comandas.flatMap((c) => c.items || []) : [];
  const currentSubtotal = allItems
    .filter((i) => !i.isCancelled)
    .reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  
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

    // Sincronización en paralelo con Firestore Printer Queue (Centinela) para Tickets 🖨️
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

      if (triggerAppNotification) {
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
          }
        );
      }

      if (processedPrintIdsRef) {
        processedPrintIdsRef.current.add(preFolio);
      }
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
        const rawName = getFormattedProductName(item.product);
        const itemLines = formatReceiptItemLines(item.quantity, rawName, price, 32);
        itemLines.forEach((l) => job.printLine(l));
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
            const price = `$${(item.quantity * item.product.price).toFixed(2)}`;
            const rawName = getFormattedProductName(item.product);
            const itemLines = formatReceiptItemLines(item.quantity, rawName, price, 32);
            itemLines.forEach((l) => job.printLine(l));
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
            const price = `$${(item.quantity * item.product.price).toFixed(2)}`;
            const rawName = getFormattedProductName(item.product);
            const itemLines = formatReceiptItemLines(item.quantity, rawName, price, 32);
            itemLines.forEach((l) => job.printLine(l));
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
    
    job.printLine(" ");
    job.center().printLine(`(${numeroALetras(currentTotal)})`).left();

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

    await job.execute();
    return true;
  } catch (e) {
    console.error("Error in executePrintTicket:", e);
    return false;
  }
}
