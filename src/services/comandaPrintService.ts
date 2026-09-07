import { Comanda, Destination, TableData, ClosedAccount, getFormattedProductName, getProductDestination } from '../utils/appHelpers';
import { formatComandaItemLines, formatComandaItemStructured } from '../utils/formatters';
import { createTransport, PrinterArea, EscPosDriver, PosPrinterJob } from '../utils/printer';
import { addPedidoToPrinter, getMexicoISOString } from '../utils/firestore';

export interface ComandaPrintOptions {
  tableLabel: string;
  comanda: Comanda;
  target?: Destination;
  selectedTenant?: any;
  selectedTable?: TableData | null;
  selectedDeliveryClient?: any;
  selectedDeliveryAddress?: string;
  deliveryNotes?: string;
  systemLocalWindowsAutoPrint?: boolean;
}

export function getComandaDestinations(comanda: Comanda): ("kitchen" | "bar")[] {
  const dests = new Set<"kitchen" | "bar">();
  (comanda?.items || []).forEach((item) => {
    if (!item.isCancelled && item.product) {
      dests.add(getProductDestination(item.product));
    }
  });
  return Array.from(dests);
}

export async function executePrintComanda(options: ComandaPrintOptions): Promise<boolean> {
  const {
    tableLabel,
    comanda,
    target,
    selectedTenant,
    selectedTable,
    selectedDeliveryClient,
    selectedDeliveryAddress,
    deliveryNotes,
    systemLocalWindowsAutoPrint,
  } = options;

  const filteredItems = target
    ? (comanda?.items || []).filter(
        (item) => !item.isCancelled && getProductDestination(item.product) === target,
      )
    : (comanda?.items || []).filter((item) => !item.isCancelled);

  if (filteredItems.length === 0) {
    return false;
  }

  try {
    // Sincronización en paralelo con Firestore Printer Queue (Centinela) 🖨️
    if (selectedTenant) {
      const dClient = selectedDeliveryClient?.name || (selectedTable as any)?.deliveryClientName || null;
      const dPhone = selectedDeliveryClient?.phone || (selectedTable as any)?.deliveryClientPhone || null;
      const dAddr = selectedDeliveryAddress || (selectedTable as any)?.deliveryAddress || null;
      const dNotes = deliveryNotes || (selectedTable as any)?.deliveryNotes || null;

      addPedidoToPrinter(selectedTenant.id, {
        folio: comanda.folio,
        folioInterno: comanda.folioInterno || null,
        mesa: tableLabel,
        items: filteredItems.map((i) => ({
          nombre: getFormattedProductName(i.product),
          cantidad: i.quantity,
          notas: i.notes || "",
          comensal: i.plate,
          destination: getProductDestination(i.product),
        })),
        tipo: "comanda",
        area: target === "bar" ? "barra" : target === "kitchen" ? "cocina" : (target || "cocina"),
        timestamp: getMexicoISOString(),
        mesero: comanda.createdBy?.name || "S/M",
        deliveryClientName: dClient,
        deliveryClientPhone: dPhone,
        deliveryAddress: dAddr,
        deliveryNotes: dNotes,
        generalNotes: comanda.generalNotes || null,
      }).catch((err) => console.warn("Centinela Sync Error:", err));
    }

    if (systemLocalWindowsAutoPrint) {
      return true;
    }

    const printerArea: PrinterArea = target === "bar" ? "barra" : "cocina";

    // Registrar envío de comanda con desglose de ítems en log del sistema (dist/envioprinter.log)
    fetch('/api/printer-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'comanda',
        area: target === "bar" ? "barra" : target === "kitchen" ? "cocina" : (target || "general"),
        folio: comanda.folio,
        folioInterno: comanda.folioInterno,
        mesa: tableLabel,
        mesero: comanda.createdBy?.name || 'S/M',
        printerName: printerArea,
        items: filteredItems.map((i) => ({
          nombre: getFormattedProductName(i.product),
          cantidad: i.quantity,
          category: i.product?.category,
          destination: getProductDestination(i.product),
          notas: i.notes || '',
        })),
        status: 'SUCCESS',
        details: { totalItemsInComanda: (comanda?.items || []).length, filteredCount: filteredItems.length }
      })
    }).catch(() => {});

    const transport = await createTransport(printerArea, selectedTenant?.id);
    const driver = new EscPosDriver();
    const job = new PosPrinterJob(driver, transport as any);

    job.initialize();

    const destName =
      target === "kitchen"
        ? "COCINA"
        : target === "bar"
          ? "BARRA"
          : "GENERAL";

    // Encabezado destacado y de alta visibilidad para cocina / barra
    job.center();
    job.bold(true);
    job.printLine("================================");
    
    // Título de Área y Mesa con fuente grande y doble tamaño
    job.doubleSize(true);
    job.printLine(`${destName}`);
    job.printLine(`MESA: ${tableLabel}`);
    job.normalSize();
    job.bold(true);
    job.printLine("================================");

    job.printLine(
      `Cmd #${comanda.folioInterno || comanda.folio} | Hora: ${new Date(comanda.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );
    if (comanda.createdBy?.name) {
      job.printLine(`MESERO: ${comanda.createdBy.name.toUpperCase()}`);
    }
    job.bold(false);
    job.printLine("================================");

    const isDelivery = selectedTable?.zone === "Servicio a Domicilio" || (selectedTable as any)?.deliveryClientName || selectedDeliveryClient?.name;
    if (isDelivery) {
      const dClient = selectedDeliveryClient?.name || (selectedTable as any)?.deliveryClientName || "";
      const dPhone = selectedDeliveryClient?.phone || (selectedTable as any)?.deliveryClientPhone || "";
      const dAddr = selectedDeliveryAddress || (selectedTable as any)?.deliveryAddress || "";
      const dNotes = deliveryNotes || (selectedTable as any)?.deliveryNotes || "";
      
      job.left();
      job.bold(true);
      if (dClient) job.printLine(`CTE: ${dClient.toUpperCase()}`);
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
      job.bold(false);
      job.printLine("--------------------------------");
    }

    // Cabecera tipo tabla para los productos
    job.left();
    job.bold(true).printLine("CANT  DESCRIPCION").bold(false);
    job.printLine("--------------------------------");

    if (target === "kitchen") {
      // COCINA: Agrupar por comensal solo si hay múltiples comensales
      const plates = Array.from(
        new Set(filteredItems.map((i) => i.plate || 1)),
      ).sort((a, b) => a - b);

      const hasMultiplePlates = plates.length > 1;

      plates.forEach((plateNum) => {
        if (hasMultiplePlates) {
          job
            .center()
            .doubleHeight(true)
            .bold(true)
            .printLine(`-- COMENSAL ${plateNum} --`)
            .normalSize()
            .bold(false)
            .left();
        }

        filteredItems
          .filter((i) => (i.plate || 1) === plateNum)
          .forEach((item) => {
            const { productLines, noteLines } = formatComandaItemStructured(
              item.quantity,
              getFormattedProductName(item.product),
              item.notes,
              32
            );

            // Cantidad y producto en FUENTE DE DOBLE ALTURA y NEGRITAS para máxima visibilidad en comanda
            job.doubleHeight(true).bold(true);
            productLines.forEach((l) => job.printLine(l));
            job.normalSize();

            if (noteLines.length > 0) {
              job.bold(true);
              noteLines.forEach((nl) => job.printLine(nl));
              job.bold(false);
            }

            job.bold(false);
            job.printLine("--------------------------------");
          });
      });
    } else if (target === "bar") {
      // BARRA: Agrupar por producto sumando cantidades
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
        if (item.notes && item.notes.trim()) {
          grouped[key].notes.push(item.notes.trim());
        }
      });

      Object.values(grouped).forEach((item) => {
        const notesStr = Array.from(new Set(item.notes)).join(", ");
        const { productLines, noteLines } = formatComandaItemStructured(item.quantity, item.name, notesStr, 32);

        // Cantidad y producto en FUENTE DE DOBLE ALTURA y NEGRITAS
        job.doubleHeight(true).bold(true);
        productLines.forEach((l) => job.printLine(l));
        job.normalSize();

        if (noteLines.length > 0) {
          job.bold(true);
          noteLines.forEach((nl) => job.printLine(nl));
          job.bold(false);
        }

        job.bold(false);
        job.printLine("--------------------------------");
      });
    } else {
      // Fallback/General
      filteredItems.forEach((item) => {
        const { productLines, noteLines } = formatComandaItemStructured(
          item.quantity,
          getFormattedProductName(item.product),
          item.notes,
          32
        );

        // Cantidad y producto en FUENTE DE DOBLE ALTURA y NEGRITAS
        job.doubleHeight(true).bold(true);
        productLines.forEach((l) => job.printLine(l));
        job.normalSize();

        if (noteLines.length > 0) {
          job.bold(true);
          noteLines.forEach((nl) => job.printLine(nl));
          job.bold(false);
        }

        job.bold(false);
        job.printLine("--------------------------------");
      });
    }

    if (comanda.generalNotes && comanda.generalNotes.trim()) {
      job.doubleHeight(true).bold(true).printLine(`OBS: ${comanda.generalNotes.toUpperCase()}`).normalSize().bold(false);
      job.printLine("--------------------------------");
    }

    // Corte limpio con feed mínimo para no desperdiciar papel
    job.feed(1).cut();
    await job.execute();
    return true;
  } catch (e) {
    console.error("Error printing comanda:", e);
    return false;
  }
}

export function getLastInternalFolio(
  tenantId: string,
  tablesList: TableData[],
  historyList: ClosedAccount[]
): string {
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

  allComandas.forEach((c) => {
    if (c.folioInterno) {
      const num = parseInt(c.folioInterno.replace(/\D/g, ""), 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
        lastFound = c.folioInterno;
      }
    }
  });

  return lastFound;
}
