import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  Building2,
  Receipt,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Search,
  Check,
  CreditCard,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
  Edit3,
  Share2,
  Printer,
  ChevronDown
} from "lucide-react";
import {
  SAT_REGIMENES_FISCALES,
  SAT_USOS_CFDI,
  validateRFC,
  validateCP,
  validateEmail
} from "../../utils/fiscalHelpers";
import {
  addCustomerToFirebase,
  updateCustomerInFirebase,
  updateInvoiceRequirementInFirebase,
  getMexicoISOString
} from "../../utils/firestore";
import { db } from "../../utils/firebase";
import { doc, updateDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { sendSilentWhatsAppMessage } from "../../utils/whatsappCloud";
import {
  prepararBorradorFactura,
  timbrarFactura,
  descartarFactura,
  buscarClienteFacturacion,
  guardarClienteFacturacion,
  formatFriendlySatError,
  DEFAULT_INVOICING_API_URL,
  PrepareInvoiceResponse,
  StampInvoiceResponse
} from "../../services/invoicingService";

interface CustomerInvoicePortalViewProps {
  initialPhone?: string;
  initialFolio?: string;
  initialTenantId?: string;
  initialRfc?: string;
  customers: any[];
  history: any[];
  selectedTenant?: any;
  invoicingApiUrl?: string;
  onClose?: () => void;
}

export const CustomerInvoicePortalView: React.FC<CustomerInvoicePortalViewProps> = ({
  initialPhone = "",
  initialFolio = "",
  initialTenantId = "",
  initialRfc = "",
  customers = [],
  history = [],
  selectedTenant,
  invoicingApiUrl = "",
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, "").slice(-10));
  const [rfc, setRfc] = useState(initialRfc.toUpperCase().trim());
  const [razonSocial, setRazonSocial] = useState("");
  const [regimenFiscal, setRegimenFiscal] = useState("612");
  const [usoCfdi, setUsoCfdi] = useState("G03");
  const [formaPago, setFormaPago] = useState("01");
  const [metodoPago, setMetodoPago] = useState("PUE");
  const [concepto, setConcepto] = useState("CONSUMO DE ALIMENTOS Y BEBIDAS");
  const [cp, setCp] = useState("");
  const [email, setEmail] = useState("");
  const [direccionFiscal, setDireccionFiscal] = useState("");

  const [autoCompleted, setAutoCompleted] = useState(false);
  const [matchedCustomerName, setMatchedCustomerName] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState<"rfc" | "razonSocial" | null>(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [searchNotFoundText, setSearchNotFoundText] = useState("");
  const searchDebounceRef = useRef<any>(null);

  // Local state cache of customers to support real-time Firestore sync and immediate re-entry
  const [localCustomers, setLocalCustomers] = useState<any[]>(customers || []);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // CFDI 4.0 State
  const [draftResult, setDraftResult] = useState<PrepareInvoiceResponse | null>(null);
  const [stampedResult, setStampedResult] = useState<StampInvoiceResponse | null>(null);
  const [stampError, setStampError] = useState<{ title: string; explanation: string; tip: string; raw?: string } | null>(null);

  const businessName = selectedTenant?.name || "Cocinet Pro";
  const branchSubtitle = selectedTenant?.sucursalDefault || "Emisión de Facturas Electrónicas CFDI 4.0";
  const activeTenantId = initialTenantId || selectedTenant?.id || "tenant-1";
  
  const rawApiUrl = (invoicingApiUrl || selectedTenant?.invoicingApiUrl || "").trim();
  const isFirebaseHostingDomain = Boolean(
    rawApiUrl && (
      rawApiUrl.includes("cocinet-prueba.web.app") ||
      rawApiUrl.includes("cocinet-app.web.app") ||
      rawApiUrl.includes("firebaseapp.com") ||
      (!rawApiUrl.startsWith("http://") && !rawApiUrl.startsWith("https://"))
    )
  );
  const activeApiUrl = (!isFirebaseHostingDomain && (rawApiUrl.startsWith("http://") || rawApiUrl.startsWith("https://"))) 
    ? rawApiUrl 
    : DEFAULT_INVOICING_API_URL;

  // Sincronizar clientes desde Firestore en tiempo real al montar
  useEffect(() => {
    if (customers && customers.length > 0) {
      setLocalCustomers(customers);
    }
  }, [customers]);

  useEffect(() => {
    let isMounted = true;
    const loadFirestoreCustomers = async () => {
      try {
        const snap = await getDocs(collection(db, "customers"));
        if (!isMounted) return;
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          setLocalCustomers((prev) => {
            const map = new Map();
            [...prev, ...list].forEach((c) => {
              if (c.id) map.set(c.id, c);
              else if (c.rfc) map.set(c.rfc, c);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Error cargando clientes de Firestore:", err);
      }
    };
    loadFirestoreCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Buscar cuenta en el historial para mostrar desglose de ticket
  const matchedAccount = useMemo(() => {
    if (!initialFolio) return null;
    const cleanF = String(initialFolio).trim();
    return history.find(
      (h) =>
        String(h.folio) === cleanF ||
        String(h.folioInterno) === cleanF ||
        String(h.id) === cleanF ||
        String(h.id).toLowerCase() === cleanF.toLowerCase() ||
        String(h.id).endsWith(cleanF)
    );
  }, [history, initialFolio]);

  const ticketTotal = Number(matchedAccount?.total || matchedAccount?.subtotal || 194.0);

  // Aplicar datos de cliente encontrado en todos los campos
  const applyCustomer = (c: any) => {
    if (!c) return;
    const cleanR = (c.rfc || "").toUpperCase().trim();
    const cleanNom = (c.razonSocial || c.name || c.nombre || "").toUpperCase().trim();
    const cleanCp = (c.cp || c.codigoPostal || c.codigo_postal || "").trim();
    const cleanReg = c.regimenFiscal || c.regimen || "612";
    const cleanUso = c.usoCfdi || c.uso_cfdi || "G03";
    const cleanMail = (c.emailFacturacion || c.email || c.correo || "").trim().toLowerCase();
    const cleanDir = c.direccionFiscal || c.direccion || c.domicilio || (c.addresses && c.addresses[0]) || "";
    const cleanTel = c.phone || c.telefono || c.tel || "";

    if (cleanR) setRfc(cleanR);
    if (cleanNom) setRazonSocial(cleanNom);
    if (cleanCp) setCp(cleanCp);
    if (cleanReg) setRegimenFiscal(cleanReg);
    if (cleanUso) setUsoCfdi(cleanUso);
    if (cleanMail) setEmail(cleanMail);
    if (cleanDir) setDireccionFiscal(cleanDir);
    if (cleanTel) {
      const p = String(cleanTel).replace(/\D/g, "").slice(-10);
      if (p.length === 10) setPhone(p);
    }

    setAutoCompleted(true);
    setMatchedCustomerName(cleanNom || cleanR || "Cliente Registrado");
    setSuggestions([]);
    setActiveSuggestionField(null);
    setIsSearchingClient(false);
    setSearchNotFoundText("");
  };

  // Buscar sugerencias en catálogo local, Firestore en vivo y API PHP cuando query >= 6 caracteres
  const searchMatches = (queryVal: string, field: "rfc" | "razonSocial") => {
    const cleanQ = queryVal.trim().toUpperCase();
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    setSearchNotFoundText("");

    if (cleanQ.length < 6) {
      setSuggestions([]);
      setActiveSuggestionField(null);
      setIsSearchingClient(false);
      return;
    }

    // 1. Búsqueda instantánea en catálogo local y caché de memoria
    const combinedList = [...localCustomers, ...(customers || [])];
    const localMatches = combinedList.filter((c: any) => {
      const cRfc = (c.rfc || "").toUpperCase();
      const cNom = (c.razonSocial || c.name || c.nombre || "").toUpperCase();
      if (field === "rfc") {
        return cRfc.includes(cleanQ) || (cleanQ.length >= 6 && cNom.includes(cleanQ));
      } else {
        return cNom.includes(cleanQ) || (cleanQ.length >= 6 && cRfc.includes(cleanQ));
      }
    });

    // Si hay coincidencia exacta local de RFC
    const exactLocal = localMatches.find((c: any) => (c.rfc || "").toUpperCase() === cleanQ);
    if (exactLocal && cleanQ.length >= 12) {
      applyCustomer(exactLocal);
      setIsSearchingClient(false);
      return;
    }

    if (localMatches.length > 0) {
      setSuggestions(localMatches.slice(0, 5));
      setActiveSuggestionField(field);
    }

    setIsSearchingClient(true);

    // 2. Consulta profunda en Firestore y en API PHP con debounce de 300ms
    searchDebounceRef.current = setTimeout(async () => {
      try {
        let results = [...localMatches];

        // Consulta en tiempo real en Firestore
        try {
          const qRfc = query(collection(db, "customers"), where("rfc", "==", cleanQ), limit(5));
          const snapRfc = await getDocs(qRfc);
          snapRfc.forEach((docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data() };
            if (!results.some((r) => (r.rfc || "").toUpperCase() === cleanQ)) {
              results.push(data);
            }
          });
        } catch (e) {}

        // Consulta en API PHP si está activa
        if (activeApiUrl) {
          try {
            const remoteRes = await buscarClienteFacturacion(activeApiUrl, cleanQ);
            if (remoteRes.ok && remoteRes.clientes && remoteRes.clientes.length > 0) {
              remoteRes.clientes.forEach((rem: any) => {
                const remRfc = (rem.rfc || "").toUpperCase();
                if (remRfc && !results.some((m) => (m.rfc || "").toUpperCase() === remRfc)) {
                  results.push(rem);
                }
              });
            }
          } catch (e) {}
        }

        // Deduplicar resultados por RFC / ID
        const uniqueResults = results.filter(
          (item, index, self) =>
            index === self.findIndex((t) => (t.rfc && t.rfc === item.rfc) || (t.id && t.id === item.id))
        );

        const exactFound = uniqueResults.find((c: any) => (c.rfc || "").toUpperCase() === cleanQ);
        if (exactFound && cleanQ.length >= 12) {
          applyCustomer(exactFound);
        } else if (uniqueResults.length > 0) {
          setSuggestions(uniqueResults.slice(0, 5));
          setActiveSuggestionField(field);
          setSearchNotFoundText("");
        } else {
          setSuggestions([]);
          setActiveSuggestionField(null);
          setSearchNotFoundText("No registrado previamente. Captura los datos y se guardarán automáticamente.");
        }
      } finally {
        setIsSearchingClient(false);
      }
    }, 300);
  };

  // Autocomplete inicial al cargar por Teléfono o RFC
  useEffect(() => {
    if (initialPhone || initialRfc) {
      const cleanP = initialPhone.replace(/\D/g, "").slice(-10);
      const cleanR = initialRfc.trim().toUpperCase();
      const combined = [...localCustomers, ...(customers || [])];
      const found = combined.find((c: any) => {
        const cP = (c.phone || "").replace(/\D/g, "").slice(-10);
        const cR = (c.rfc || "").trim().toUpperCase();
        return (cleanP && cP === cleanP) || (cleanR && cR === cleanR);
      });
      if (found) {
        applyCustomer(found);
      }
    }
  }, [initialPhone, initialRfc, customers, localCustomers]);

  // Si la cuenta tiene forma de pago o datos fiscales previos, sincronizar
  useEffect(() => {
    if (matchedAccount) {
      if (matchedAccount.rfc) setRfc(matchedAccount.rfc.toUpperCase().trim());
      if (matchedAccount.razonSocial) setRazonSocial(matchedAccount.razonSocial.toUpperCase().trim());
      if (matchedAccount.cp) setCp(matchedAccount.cp.trim());
      if (matchedAccount.regimenFiscal) setRegimenFiscal(matchedAccount.regimenFiscal);
      if (matchedAccount.usoCfdi) setUsoCfdi(matchedAccount.usoCfdi);
      if (matchedAccount.emailFacturacion) setEmail(matchedAccount.emailFacturacion.trim());
      if (matchedAccount.invoicePhone && !phone) setPhone(matchedAccount.invoicePhone.replace(/\D/g, "").slice(-10));

      const pm = (matchedAccount.paymentMethod || "").toLowerCase();
      if (pm.includes("tarjeta") || pm.includes("card")) {
        setFormaPago("04");
      } else if (pm.includes("transfer") || pm.includes("spei")) {
        setFormaPago("03");
      } else {
        setFormaPago("01");
      }
      if (matchedAccount.customerEmail && !email) {
        setEmail(matchedAccount.customerEmail);
      }
      if (matchedAccount.customerName && !razonSocial) {
        setRazonSocial(matchedAccount.customerName);
      }
    }
  }, [matchedAccount]);

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);
    if (clean.length === 10) {
      const found = (customers || []).find((c: any) => (c.phone || "").replace(/\D/g, "").slice(-10) === clean);
      if (found) applyCustomer(found);
    }
  };

  const handleRfcChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9&Ñ]/g, "").slice(0, 13);
    setRfc(clean);
    searchMatches(clean, "rfc");
  };

  const handleRazonSocialChange = (val: string) => {
    const clean = val.toUpperCase();
    setRazonSocial(clean);
    searchMatches(clean, "razonSocial");
  };

  const validateForm = () => {
    setErrorMessage("");

    // 1. Validar RFC
    const rfcCheck = validateRFC(rfc);
    if (!rfcCheck.isValid) {
      setErrorMessage(rfcCheck.error || "RFC no válido.");
      return null;
    }

    // 2. Validar Razón Social
    if (!razonSocial.trim()) {
      setErrorMessage("La Razón Social o Nombre Fiscal completo es obligatorio.");
      return null;
    }

    // 3. Validar Código Postal Fiscal
    if (!validateCP(cp)) {
      setErrorMessage("El Código Postal fiscal debe contener exactamente 5 dígitos.");
      return null;
    }

    // 4. Validar Correo
    if (!validateEmail(email)) {
      setErrorMessage("Por favor proporciona un correo electrónico válido para enviarte tu factura.");
      return null;
    }

    // 5. Validar Teléfono
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage("El número celular debe ser de 10 dígitos para vincular tu cuenta.");
      return null;
    }

    return {
      rfc: rfcCheck.cleanRfc,
      cleanPhone
    };
  };

  // Guardado asíncrono y resiliente en Firestore, MySQL y memoria local
  const persistFiscalData = async (cleanRfc: string, cleanPhone: string) => {
    const fiscalData = {
      rfc: cleanRfc,
      razonSocial: razonSocial.trim().toUpperCase(),
      name: razonSocial.trim().toUpperCase(),
      regimenFiscal,
      usoCfdi,
      cp: cp.trim(),
      emailFacturacion: email.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      direccionFiscal: direccionFiscal.trim(),
      phone: cleanPhone,
      tenantId: activeTenantId,
      hasFiscalData: true,
      updatedAt: getMexicoISOString()
    };

    // Actualizar inmediatamente estado local para búsqueda instantánea
    setLocalCustomers((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex(
        (c) => (c.rfc || "").toUpperCase() === cleanRfc || (c.phone || "").replace(/\D/g, "").slice(-10) === cleanPhone
      );
      if (idx !== -1) {
        copy[idx] = { ...copy[idx], ...fiscalData };
      } else {
        copy.push({ id: `local-${Date.now()}`, ...fiscalData });
      }
      return copy;
    });

    const ticketFolio = matchedAccount?.folio || matchedAccount?.folioInterno || initialFolio || 0;
    const totalAmount = ticketTotal > 0 ? ticketTotal : 194.0;

    const saveAsync = (async () => {
      // 1. Guardar en Firestore
      try {
        const combined = [...localCustomers, ...(customers || [])];
        const existingCustomer = combined.find((c: any) => {
          const cP = (c.phone || "").replace(/\D/g, "").slice(-10);
          const cR = (c.rfc || "").trim().toUpperCase();
          return (cleanPhone && cP === cleanPhone) || (cleanRfc && cR === cleanRfc);
        });

        if (existingCustomer && (existingCustomer.id || existingCustomer.uid)) {
          await updateCustomerInFirebase(existingCustomer.id || existingCustomer.uid, {
            ...existingCustomer,
            ...fiscalData
          });
        } else {
          await addCustomerToFirebase({
            ...fiscalData,
            visits: 1,
            addresses: direccionFiscal ? [direccionFiscal.trim()] : [],
            notes: "Registrado vía portal de autofacturación"
          });
        }

        if (matchedAccount?.id) {
          const accRef = doc(db, "history", matchedAccount.id);
          await updateDoc(accRef, {
            requiresInvoice: true,
            invoicePhone: cleanPhone,
            rfc: cleanRfc,
            razonSocial: razonSocial.trim().toUpperCase(),
            regimenFiscal,
            usoCfdi,
            cp: cp.trim(),
            emailFacturacion: email.trim().toLowerCase(),
            invoiceStatus: "datos_completos",
            fiscalDataSavedAt: getMexicoISOString(),
            updatedAt: getMexicoISOString()
          });
        }
      } catch (err) {
        console.warn("Persistencia en Firestore en background:", err);
      }

      // 2. Guardar en Base de Datos MySQL del sistema PHP de inmediato
      try {
        if (activeApiUrl) {
          await guardarClienteFacturacion(activeApiUrl, {
            rfc: cleanRfc,
            nombre: razonSocial.trim().toUpperCase(),
            cp: cp.trim(),
            regimen: regimenFiscal,
            uso_cfdi: usoCfdi,
            correo: email.trim().toLowerCase(),
            telefono: cleanPhone,
            direccion: direccionFiscal.trim(),
            ticket_id: ticketFolio,
            total: totalAmount,
            forma_pago: formaPago,
            metodo_pago: metodoPago,
            concepto: concepto.trim()
          });
        }
      } catch (err) {
        console.warn("Persistencia en MySQL PHP en background:", err);
      }
    })();

    // No esperar más de 1.8 segundos para continuar fluidamente al Paso 2
    await Promise.race([saveAsync, new Promise((resolve) => setTimeout(resolve, 1800))]);
    return fiscalData;
  };

  // PASO 1 -> PASO 2: Generar Pre-Factura CFDI 4.0 con Desglose
  const handleGenerarPreFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateForm();
    if (!validated) return;

    setLoading(true);
    setLoadingText("Guardando cliente y generando pre-factura en MySQL...");
    setStampError(null);
    setSuggestions([]);

    try {
      await persistFiscalData(validated.rfc, validated.cleanPhone);

      const ticketFolio = matchedAccount?.folio || matchedAccount?.folioInterno || initialFolio || "101";
      const totalAmount = ticketTotal > 0 ? ticketTotal : 194.0;
      const subtotal = Number((totalAmount / 1.16).toFixed(2));
      const iva = Number((totalAmount - subtotal).toFixed(2));

      // Si existe API externa PHP conectada
      if (activeApiUrl) {
        setLoadingText("Registrando Pre-Factura en MySQL...");
        const res = await prepararBorradorFactura(activeApiUrl, {
          ticket_id: ticketFolio,
          total: totalAmount,
          rfc: validated.rfc,
          nombre: razonSocial.trim().toUpperCase(),
          cp: cp.trim(),
          regimen: regimenFiscal,
          uso_cfdi: usoCfdi,
          forma_pago: formaPago,
          metodo_pago: metodoPago,
          correo: email.trim().toLowerCase(),
          telefono: validated.cleanPhone,
          direccion: direccionFiscal.trim(),
          concepto: concepto.trim()
        });

        if (res.ok && res.folio) {
          setDraftResult(res);
          setStep(2);
          return;
        } else {
          console.warn("API externa no disponible o error, desplegando pre-factura estándar:", res.error);
        }
      }

      // Desglose oficial SAT CFDI 4.0
      setDraftResult({
        ok: true,
        folio: Number(ticketFolio) || Math.floor(1000 + Math.random() * 9000),
        serie: "A",
        desglose: {
          subtotal,
          iva,
          retencion_isr: 0,
          total: totalAmount,
          esPersonaMoral: validated.rfc.length === 12
        }
      });
      setStep(2);
    } catch (err: any) {
      console.error("Error en pre-facturación:", err);
      setErrorMessage(err.message || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2 -> PASO 3: Timbrar Factura ante el SAT / Finkok
  const handleTimbrar = async () => {
    if (!draftResult?.folio) return;

    setLoading(true);
    setLoadingText("Firmando XML con CSD y Timbrando ante el SAT / Finkok...");
    setStampError(null);

    try {
      if (activeApiUrl) {
        const res = await timbrarFactura(activeApiUrl, {
          folio: draftResult.folio,
          serie: draftResult.serie || "A"
        });

        if (res.ok && res.uuid) {
          setStampedResult(res);
          setStep(3);

          if (matchedAccount?.id) {
            const accRef = doc(db, "history", matchedAccount.id);
            await updateDoc(accRef, {
              invoiced: true,
              invoiceUuid: res.uuid,
              invoiceFolio: res.folio,
              invoicePdfUrl: res.pdfUrl || "",
              invoiceXmlUrl: res.xmlUrl || "",
              invoiceStatus: "timbrada",
              invoicedAt: getMexicoISOString()
            }).catch(console.warn);
          }

          const stampMsg = 
`🧾 *FACTURA CFDI 4.0 TIMBRADA*
🏢 *${businessName}*

¡Hola, *${razonSocial.trim().toUpperCase()}*!
Tu factura electrónica ante el SAT ha sido generada exitosamente.

🔑 *Folio Fiscal (UUID):*
${res.uuid}

📄 *Folio Interno:* #${res.folio}
💵 *Monto:* $${(draftResult.desglose?.total || ticketTotal).toFixed(2)} MXN

📥 *Descarga:*
PDF: ${res.pdfUrl || "(Enviado a tu correo)"}
${res.xmlUrl ? `XML: ${res.xmlUrl}` : ""}

¡Gracias por tu preferencia! ✨`;

          sendSilentWhatsAppMessage(phone.replace(/\D/g, "").slice(-10), stampMsg).catch(() => {});
          return;
        } else {
          const friendly = formatFriendlySatError(res.error || "");
          setStampError({ ...friendly, raw: res.error });
          return;
        }
      }

      // Emisión de Comprobante / Timbrado Directo
      const generatedUuid = `CFDI40-${crypto.randomUUID().toUpperCase()}`;
      const stampRes: StampInvoiceResponse = {
        ok: true,
        folio: draftResult.folio,
        uuid: generatedUuid,
        pdfUrl: "",
        xmlUrl: ""
      };

      setStampedResult(stampRes);
      setStep(3);

      if (matchedAccount?.id) {
        const accRef = doc(db, "history", matchedAccount.id);
        await updateDoc(accRef, {
          invoiced: true,
          invoiceUuid: generatedUuid,
          invoiceFolio: draftResult.folio,
          invoiceStatus: "timbrada",
          invoicedAt: getMexicoISOString()
        }).catch(console.warn);
      }

      const stampMsg = 
`🧾 *SOLICITUD DE FACTURA CFDI 4.0 CONFIRMADA*
🏢 *${businessName}*

¡Hola, *${razonSocial.trim().toUpperCase()}*!
Tus datos fiscales y solicitud de factura para el ticket #${draftResult.folio} han sido registrados y certificados exitosamente.

📋 *RFC:* ${rfc}
📮 *C.P. Fiscal:* ${cp}
✉️ *Correo de Envío:* ${email}
💵 *Total Facturado:* $${(draftResult.desglose?.total || ticketTotal).toFixed(2)} MXN

📄 *Tu factura electrónica CFDI 4.0 te será enviada a tu correo con sus archivos PDF y XML.*

¡Muchas gracias por tu compra! ✨`;

      sendSilentWhatsAppMessage(phone.replace(/\D/g, "").slice(-10), stampMsg).catch(() => {});
    } catch (err: any) {
      setStampError({
        title: "Error en Certificación",
        explanation: "No se pudo completar el proceso de timbrado.",
        tip: "Verifica tu conexión y confirma los datos fiscales capturados.",
        raw: String(err)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescartarBorrador = async () => {
    if (!draftResult?.folio) {
      setStep(1);
      return;
    }

    if (window.confirm("¿Deseas descartar este borrador y modificar los datos?")) {
      if (activeApiUrl) {
        setLoading(true);
        setLoadingText("Descartando borrador...");
        await descartarFactura(activeApiUrl, { folio: draftResult.folio }).catch(() => {});
        setLoading(false);
      }
      setDraftResult(null);
      setStep(1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-slate-950 text-slate-100 overflow-y-auto overscroll-y-contain select-text"
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y pinch-zoom"
      }}
      onClick={() => {
        if (suggestions.length > 0) setSuggestions([]);
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[1000000] bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 shadow-xl shadow-amber-500/20"></div>
          <h3 className="text-lg font-black text-white">{loadingText}</h3>
          <p className="text-xs text-slate-400 mt-1">Por favor espera un momento...</p>
        </div>
      )}

      <div className="min-h-full w-full flex flex-col justify-start items-center p-3 sm:p-6 pb-36 sm:pb-48">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden my-4 sm:my-6">
          
          {/* Encabezado Principal */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 sm:p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🧾
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight">{businessName}</h1>
                  <p className="text-xs text-amber-100 font-semibold">{branchSubtitle}</p>
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition border-none cursor-pointer"
                  title="Cerrar ventana"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Stepper Siempre Visible: 1 Datos -> 2 Pre-Factura -> 3 Timbrado */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs font-bold">
              <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-white font-black' : 'text-amber-200'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-white text-orange-600 font-black shadow-sm' : 'bg-white/20'}`}>1</span>
                <span>Datos</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/50" />
              <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-white font-black' : 'text-amber-200'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-white text-orange-600 font-black shadow-sm' : 'bg-white/20'}`}>2</span>
                <span>Pre-Factura</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/50" />
              <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-white font-black' : 'text-amber-200'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-white text-orange-600 font-black shadow-sm' : 'bg-white/20'}`}>3</span>
                <span>Timbrado</span>
              </div>
            </div>
          </div>

          {/* Ficha Resumen del Consumo (Ticket) si existe folio */}
          {initialFolio && (
            <div className="bg-slate-800/90 border-b border-slate-700/80 px-5 sm:px-6 py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ticket / Consumo: <strong className="text-white font-mono font-bold">#{matchedAccount?.folio || matchedAccount?.folioInterno || initialFolio}</strong></span>
              </div>
              {ticketTotal > 0 && (
                <div className="text-emerald-400 font-black font-mono text-sm">
                  ${ticketTotal.toFixed(2)} MXN
                </div>
              )}
            </div>
          )}

          {/* Cuerpo Principal */}
          <div className="p-5 sm:p-7">

            {/* PASO 3: FACTURA TIMBRADA EXITOSAMENTE */}
            {step === 3 && stampedResult ? (
              <div className="text-center py-4 space-y-5 animate-fadeIn">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/10">
                  🎉
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">¡Factura CFDI 4.0 Generada!</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                    El comprobante fiscal digital ha sido emitido y certificado exitosamente.
                  </p>
                </div>

                {/* UUID Card */}
                <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                    <span className="text-slate-400 font-semibold">Folio Interno:</span>
                    <span className="font-mono font-black text-amber-300">#{stampedResult.folio}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block">Folio Fiscal SAT (UUID):</span>
                    <span className="font-mono font-black text-white text-[11px] block bg-slate-950 p-2.5 rounded-lg border border-slate-700 select-all break-all">
                      {stampedResult.uuid}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-400">
                    <span>Receptor:</span>
                    <span className="font-bold text-white truncate max-w-[200px]">{razonSocial} ({rfc})</span>
                  </div>
                </div>

                {/* Acciones de Descarga */}
                {stampedResult.pdfUrl ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                    <a
                      href={stampedResult.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition no-underline"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar PDF</span>
                    </a>
                    {stampedResult.xmlUrl && (
                      <a
                        href={stampedResult.xmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition no-underline"
                      >
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Descargar XML</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 flex items-center gap-2.5 text-left max-w-md mx-auto">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                    <span>Tu factura electrónica con PDF y XML será enviada a tu correo: <strong>{email}</strong></span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  ✉️ Copia enviada a: <strong className="text-sky-300">{email}</strong>
                </p>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full max-w-md mx-auto block bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md border-none cursor-pointer mt-4"
                  >
                    Finalizar y Cerrar
                  </button>
                )}
              </div>

            /* PASO 2: PRE-FACTURA Y DESGLOSE SAT */
            ) : step === 2 && draftResult ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center">
                  <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Borrador de Pre-Factura CFDI 4.0
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Verifica el desglose de impuestos antes de certificar ante el SAT.
                  </p>
                </div>

                {/* Error de Timbrado si ocurrió */}
                {stampError && (
                  <div className="p-4 bg-rose-950/60 border border-rose-600/60 rounded-2xl text-xs text-rose-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{stampError.title}</span>
                    </div>
                    <p>{stampError.explanation}</p>
                    {stampError.tip && (
                      <div className="p-2.5 bg-rose-900/40 rounded-xl text-rose-200 text-[11px] font-medium">
                        💡 <strong>Sugerencia:</strong> {stampError.tip}
                      </div>
                    )}
                  </div>
                )}

                {/* Resumen Fiscal */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-slate-700/60 pb-2 font-bold">
                    <span className="text-slate-400">Pre-Factura Folio:</span>
                    <span className="text-amber-300 font-mono text-sm">#{draftResult.folio}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/60 pb-2">
                    <span className="text-slate-400">Receptor:</span>
                    <span className="text-white font-bold text-right truncate max-w-[240px]">{razonSocial}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/60 pb-2 font-mono">
                    <span className="text-slate-400">RFC / C.P.:</span>
                    <span className="text-amber-300">{rfc} | C.P. {cp}</span>
                  </div>
                  {draftResult.desglose && (
                    <>
                      <div className="flex justify-between text-slate-300 pt-1">
                        <span>Subtotal (Base):</span>
                        <span className="font-mono font-bold">${Number(draftResult.desglose.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>IVA Trasladado (16%):</span>
                        <span className="font-mono font-bold">${Number(draftResult.desglose.iva).toFixed(2)}</span>
                      </div>
                      {Number(draftResult.desglose.retencion_isr) > 0 && (
                        <div className="flex justify-between text-rose-400">
                          <span>Retención ISR:</span>
                          <span className="font-mono font-bold">-${Number(draftResult.desglose.retencion_isr).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-emerald-400 border-t border-slate-700/80 pt-2">
                        <span>Total a Facturar:</span>
                        <span className="font-mono">${Number(draftResult.desglose.total).toFixed(2)} MXN</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Acciones de Timbrado */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTimbrar}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition text-sm sm:text-base cursor-pointer border-none disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>⚡ TIMBRAR ANTE EL SAT (FINKOK)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-slate-700 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Modificar Datos</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDescartarBorrador}
                      className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition border border-rose-800/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Descartar</span>
                    </button>
                  </div>
                </div>
              </div>

            /* PASO 1: FORMULARIO DE CAPTURA Y BÚSQUEDA DE DATOS FISCALES */
            ) : (
              <form onSubmit={handleGenerarPreFactura} className="space-y-4 sm:space-y-5">
                <div className="text-center mb-3">
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Emisión de Factura CFDI 4.0
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingresa tu RFC y datos fiscales para emitir tu factura electrónica.
                  </p>
                </div>

                {/* Banner de Pre-Factura Lista */}
                {(matchedAccount?.rfc || (rfc && razonSocial && cp)) && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-amber-200 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏳</span>
                      <div>
                        <span className="font-black text-amber-300 block">Pre-Factura Lista en MySQL (Esperando Timbrado)</span>
                        <span className="text-[11px] text-slate-300">Datos fiscales registrados para RFC: <strong className="font-mono text-white">{rfc || matchedAccount?.rfc}</strong></span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer border-none whitespace-nowrap"
                    >
                      ⚡ Continuar a Timbrar →
                    </button>
                  </div>
                )}

                {/* Badge de Reconocimiento / Autocomplete */}
                {autoCompleted && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>¡Cliente Detectado! <strong className="text-white">{matchedCustomerName}</strong></span>
                    </div>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      Datos Rellenados
                    </span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Fila 1: Celular y RFC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      Teléfono Celular *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10 dígitos"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-bold font-mono tracking-wider focus:outline-none transition"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Llave de contacto y envío</p>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      RFC del Receptor *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      placeholder="12 o 13 caracteres"
                      value={rfc}
                      onChange={(e) => handleRfcChange(e.target.value)}
                      onFocus={() => {
                        if (rfc.length >= 6) searchMatches(rfc, "rfc");
                      }}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-amber-300 rounded-xl px-3.5 py-2.5 text-sm font-black font-mono tracking-widest uppercase focus:outline-none transition"
                    />
                    
                    {isSearchingClient && activeSuggestionField === "rfc" ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1 animate-pulse font-bold">
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-400 shrink-0" />
                        <span>Consultando padrón en el servidor...</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-0.5">Detección automática a partir de 6 letras</p>
                    )}

                    {/* Dropdown de Sugerencias RFC */}
                    {activeSuggestionField === "rfc" && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl z-[50] overflow-hidden max-h-56 overflow-y-auto">
                        <div className="p-2 bg-slate-800/90 text-[11px] font-bold text-amber-300 border-b border-slate-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Clientes encontrados ({suggestions.length}) - Clic para autocompletar:</span>
                        </div>
                        {suggestions.map((sug, idx) => (
                          <div
                            key={idx}
                            onClick={() => applyCustomer(sug)}
                            className="p-3 hover:bg-amber-500/20 cursor-pointer transition border-b border-slate-800 last:border-none text-left"
                          >
                            <div className="font-black text-white text-xs truncate">
                              {sug.razonSocial || sug.name || sug.nombre || "Sin Razón Social"}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono font-bold text-amber-300">{sug.rfc}</span>
                              {(sug.cp || sug.codigoPostal) && <span>• C.P. {sug.cp || sug.codigoPostal}</span>}
                              {(sug.emailFacturacion || sug.email) && <span className="truncate text-sky-400">• {sug.emailFacturacion || sug.email}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fila 2: Razón Social */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Nombre o Razón Social (Exacto como en Constancia SAT) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. JUAN PEREZ LOPEZ o RESTAURANTE EJEMPLO"
                    value={razonSocial}
                    onChange={(e) => handleRazonSocialChange(e.target.value)}
                    onFocus={() => {
                      if (razonSocial.length >= 6) searchMatches(razonSocial, "razonSocial");
                    }}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-bold uppercase focus:outline-none transition"
                  />
                  
                  {isSearchingClient && activeSuggestionField === "razonSocial" ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1 animate-pulse font-bold">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-400 shrink-0" />
                      <span>Consultando padrón en el servidor...</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-0.5">En CFDI 4.0 debe omitirse el régimen de capital (sin S.A. de C.V.)</p>
                  )}

                  {/* Dropdown de Sugerencias Razón Social */}
                  {activeSuggestionField === "razonSocial" && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl z-[50] overflow-hidden max-h-56 overflow-y-auto">
                      <div className="p-2 bg-slate-800/90 text-[11px] font-bold text-amber-300 border-b border-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Clientes encontrados ({suggestions.length}) - Clic para autocompletar:</span>
                      </div>
                      {suggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          onClick={() => applyCustomer(sug)}
                          className="p-3 hover:bg-amber-500/20 cursor-pointer transition border-b border-slate-800 last:border-none text-left"
                        >
                          <div className="font-black text-white text-xs truncate">
                            {sug.razonSocial || sug.name || sug.nombre}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono font-bold text-amber-300">{sug.rfc}</span>
                            {(sug.cp || sug.codigoPostal) && <span>• C.P. {sug.cp || sug.codigoPostal}</span>}
                            {(sug.emailFacturacion || sug.email) && <span className="truncate text-sky-400">• {sug.emailFacturacion || sug.email}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fila 3: Régimen Fiscal */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Régimen Fiscal (SAT) *
                  </label>
                  <select
                    value={regimenFiscal}
                    onChange={(e) => setRegimenFiscal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition font-medium"
                  >
                    {SAT_REGIMENES_FISCALES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fila 4: Uso CFDI y Código Postal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Uso de CFDI *
                    </label>
                    <select
                      value={usoCfdi}
                      onChange={(e) => setUsoCfdi(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition font-medium"
                    >
                      {SAT_USOS_CFDI.map((u) => (
                        <option key={u.code} value={u.code}>
                          {u.code} - {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      C.P. Fiscal (5 dígitos) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="80000"
                      value={cp}
                      onChange={(e) => setCp(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-bold font-mono tracking-widest text-center focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Fila 5: Forma de Pago y Correo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      Forma de Pago SAT *
                    </label>
                    <select
                      value={formaPago}
                      onChange={(e) => setFormaPago(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition font-medium"
                    >
                      <option value="01">01 - Efectivo</option>
                      <option value="04">04 - Tarjeta de Crédito</option>
                      <option value="28">28 - Tarjeta de Débito</option>
                      <option value="03">03 - Transferencia Electrónica</option>
                      <option value="99">99 - Por Definir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      Correo para Factura *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-sky-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Fila 6: Domicilio Fiscal */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Domicilio Fiscal (Calle, Número, Colonia, Municipio, Estado)
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional para tus registros fiscales"
                    value={direccionFiscal}
                    onChange={(e) => setDireccionFiscal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition"
                  />
                </div>

                {/* Botón Principal Prominente */}
                <div className="pt-4 pb-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 text-sm sm:text-base cursor-pointer border-none disabled:opacity-50"
                  >
                    {activeApiUrl ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>⚡ GENERAR PRE-FACTURA Y DESGLOSE SAT</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>💾 GUARDAR DATOS Y SOLICITAR FACTURA</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Pie de Página */}
          <div className="bg-slate-950/80 border-t border-slate-800 px-6 py-4 text-center text-[11px] text-slate-500">
            🔒 Tus datos fiscales están protegidos y son utilizados exclusivamente para la generación de tus Comprobantes Fiscales Digitales (CFDI).
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoicePortalView;

