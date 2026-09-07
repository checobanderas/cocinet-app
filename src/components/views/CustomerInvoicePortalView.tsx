import React, { useState, useEffect, useMemo } from "react";
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
  Clock
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
import { doc, updateDoc } from "firebase/firestore";
import { sendSilentWhatsAppMessage } from "../../utils/whatsappCloud";

interface CustomerInvoicePortalViewProps {
  initialPhone?: string;
  initialFolio?: string;
  initialTenantId?: string;
  initialRfc?: string;
  customers: any[];
  history: any[];
  selectedTenant?: any;
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
  onClose
}) => {
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, "").slice(-10));
  const [rfc, setRfc] = useState(initialRfc.toUpperCase().trim());
  const [razonSocial, setRazonSocial] = useState("");
  const [regimenFiscal, setRegimenFiscal] = useState("612");
  const [usoCfdi, setUsoCfdi] = useState("G03");
  const [cp, setCp] = useState("");
  const [email, setEmail] = useState("");
  const [direccionFiscal, setDireccionFiscal] = useState("");

  const [autoCompleted, setAutoCompleted] = useState(false);
  const [matchedCustomerName, setMatchedCustomerName] = useState("");

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedDataSummary, setSavedDataSummary] = useState<any | null>(null);

  const businessName = selectedTenant?.name || "Cocinet Pro";
  const branchSubtitle = selectedTenant?.sucursalDefault || "Emisión de Facturas Electrónicas CFDI 4.0";

  // Buscar cuenta en el historial para mostrar desglose de ticket
  const matchedAccount = useMemo(() => {
    if (!initialFolio) return null;
    return history.find(
      (h) =>
        String(h.folio) === String(initialFolio) ||
        String(h.folioInterno) === String(initialFolio) ||
        String(h.id).endsWith(String(initialFolio))
    );
  }, [history, initialFolio]);

  // Autocomplete si coincide el Teléfono o RFC en el catálogo
  const handleLookupAndFill = (searchPhone: string, searchRfc: string) => {
    const cleanP = searchPhone.replace(/\D/g, "").slice(-10);
    const cleanR = searchRfc.trim().toUpperCase();

    if (!cleanP && !cleanR) return;

    const found = customers.find((c: any) => {
      const cP = (c.phone || "").replace(/\D/g, "").slice(-10);
      const cR = (c.rfc || "").trim().toUpperCase();
      if (cleanP && cP === cleanP) return true;
      if (cleanR && cR === cleanR) return true;
      return false;
    });

    if (found) {
      setMatchedCustomerName(found.name || found.razonSocial || "Cliente Frecuente");
      
      if (found.rfc && !rfc) setRfc(found.rfc.toUpperCase().trim());
      if (found.razonSocial) setRazonSocial(found.razonSocial);
      else if (found.name && !razonSocial) setRazonSocial(found.name);

      if (found.regimenFiscal) setRegimenFiscal(found.regimenFiscal);
      if (found.usoCfdi) setUsoCfdi(found.usoCfdi);
      if (found.cp || found.codigoPostal) setCp(found.cp || found.codigoPostal);
      if (found.emailFacturacion || found.email) setEmail(found.emailFacturacion || found.email);
      if (found.direccionFiscal) setDireccionFiscal(found.direccionFiscal);
      else if (found.addresses && found.addresses.length > 0 && !direccionFiscal) {
        setDireccionFiscal(found.addresses[0]);
      }

      setAutoCompleted(true);
    }
  };

  // Autocomplete inicial al cargar
  useEffect(() => {
    if (initialPhone || initialRfc) {
      handleLookupAndFill(initialPhone, initialRfc);
    }
  }, [initialPhone, initialRfc, customers]);

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);
    if (clean.length === 10) {
      handleLookupAndFill(clean, rfc);
    }
  };

  const handleRfcChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9&Ñ]/g, "").slice(0, 13);
    setRfc(clean);
    if (clean.length >= 12) {
      handleLookupAndFill(phone, clean);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validar RFC
    const rfcCheck = validateRFC(rfc);
    if (!rfcCheck.isValid) {
      setErrorMessage(rfcCheck.error || "RFC no válido.");
      return;
    }

    // 2. Validar Razón Social
    if (!razonSocial.trim()) {
      setErrorMessage("La Razón Social o Nombre Fiscal completo es obligatorio.");
      return;
    }

    // 3. Validar Código Postal Fiscal
    if (!validateCP(cp)) {
      setErrorMessage("El Código Postal fiscal debe contener exactamente 5 dígitos.");
      return;
    }

    // 4. Validar Correo
    if (!validateEmail(email)) {
      setErrorMessage("Por favor proporciona un correo electrónico válido para enviarte tu factura.");
      return;
    }

    // 5. Validar Teléfono
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage("El número celular debe ser de 10 dígitos para vincular tu cuenta.");
      return;
    }

    setSaveStatus("saving");

    try {
      const fiscalData = {
        rfc: rfcCheck.cleanRfc,
        razonSocial: razonSocial.trim().toUpperCase(),
        regimenFiscal,
        usoCfdi,
        cp: cp.trim(),
        emailFacturacion: email.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        direccionFiscal: direccionFiscal.trim(),
        phone: cleanPhone,
        hasFiscalData: true,
        updatedAt: getMexicoISOString()
      };

      // Guardar / Actualizar en Catálogo de Clientes de Firestore
      const existingCustomer = customers.find((c: any) => {
        const cP = (c.phone || "").replace(/\D/g, "").slice(-10);
        const cR = (c.rfc || "").trim().toUpperCase();
        return (cleanPhone && cP === cleanPhone) || (rfcCheck.cleanRfc && cR === rfcCheck.cleanRfc);
      });

      if (existingCustomer) {
        await updateCustomerInFirebase(existingCustomer.id || existingCustomer.uid, {
          ...existingCustomer,
          ...fiscalData,
          name: existingCustomer.name || razonSocial.trim().toUpperCase(),
        });
      } else {
        await addCustomerToFirebase({
          name: razonSocial.trim().toUpperCase(),
          ...fiscalData,
          visits: 1,
          addresses: direccionFiscal ? [direccionFiscal.trim()] : [],
          notes: "Registrado vía portal de autofacturación"
        });
      }

      // Si hay folio o cuenta relacionada, actualizar la cuenta en Firestore
      if (matchedAccount) {
        const accRef = doc(db, "history", matchedAccount.id);
        await updateDoc(accRef, {
          requiresInvoice: true,
          invoicePhone: cleanPhone,
          rfc: rfcCheck.cleanRfc,
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

      // Enviar WhatsApp de confirmación silencioso al cliente
      const confirmMsg = 
`✅ *DATOS FISCALES RECIBIDOS*
🏢 *${businessName}*

¡Hola, *${razonSocial.trim().toUpperCase()}*!
Tus datos fiscales han sido guardados y vinculados correctamente a tu consumo ${initialFolio ? `(Folio #${initialFolio})` : ''}.

📋 *RFC:* ${rfcCheck.cleanRfc}
📮 *C.P. Fiscal:* ${cp.trim()}
✉️ *Correo:* ${email.trim().toLowerCase()}

📄 *Tu factura electrónica está en proceso de emisión y te será enviada a tu correo.*

¡Muchas gracias por tu preferencia! 🎉`;

      sendSilentWhatsAppMessage(cleanPhone, confirmMsg).catch((e) => {
        console.warn("WhatsApp de confirmación de datos fiscales no enviado:", e);
      });

      setSavedDataSummary({
        rfc: rfcCheck.cleanRfc,
        razonSocial: razonSocial.trim().toUpperCase(),
        regimenFiscal,
        usoCfdi,
        cp: cp.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        folio: initialFolio || matchedAccount?.folio || matchedAccount?.folioInterno || null,
        total: matchedAccount?.total || null
      });

      setSaveStatus("success");
    } catch (err: any) {
      console.error("Error guardando datos fiscales:", err);
      setErrorMessage("Ocurrió un error al registrar tus datos fiscales. Por favor verifica tu conexión e intenta de nuevo.");
      setSaveStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start items-center p-3 sm:p-6 select-text overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden my-auto">
        
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
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Ficha Resumen del Consumo (Ticket) si existe folio */}
        {initialFolio && (
          <div className="bg-slate-800/90 border-b border-slate-700/80 px-5 sm:px-6 py-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ticket a Facturar: <strong className="text-white font-mono font-bold">#{initialFolio}</strong></span>
            </div>
            {matchedAccount?.total && (
              <div className="text-emerald-400 font-black font-mono text-sm">
                ${Number(matchedAccount.total).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Cuerpo del Formulario */}
        <div className="p-5 sm:p-7">
          {saveStatus === "success" && savedDataSummary ? (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/10">
                ✅
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">¡Datos Fiscales Registrados!</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Tus datos han sido registrados con éxito. Tu factura electrónica CFDI 4.0 será generada y enviada a tu correo electrónico.
                </p>
              </div>

              {/* Resumen de Datos Guardados */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400 font-semibold">RFC Receptor:</span>
                  <span className="font-mono font-bold text-amber-300">{savedDataSummary.rfc}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400 font-semibold">Razón Social:</span>
                  <span className="font-bold text-white text-right">{savedDataSummary.razonSocial}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400 font-semibold">Código Postal Fiscal:</span>
                  <span className="font-mono font-bold text-white">{savedDataSummary.cp}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400 font-semibold">Correo de Envío:</span>
                  <span className="font-bold text-sky-400 truncate max-w-[220px]">{savedDataSummary.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Celular de Contacto:</span>
                  <span className="font-mono font-bold text-slate-300">{savedDataSummary.phone}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 flex items-center gap-2.5 text-left max-w-md mx-auto">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>Para futuros consumos, tus datos fiscales se recordarán automáticamente al ingresar tu RFC o celular.</span>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full max-w-md mx-auto block bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md border-none cursor-pointer"
                >
                  Cerrar
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="text-center mb-3">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Registro de Datos Fiscales
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tu RFC y datos fiscales para emitir tu factura electrónica.
                </p>
              </div>

              {/* Badge de Reconocimiento / Autocomplete */}
              {autoCompleted && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>¡Cliente reconocido! <strong className="text-white">{matchedCustomerName}</strong></span>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    Auto-rellenado
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
                  <p className="text-[10px] text-slate-500 mt-0.5">Llave para recordar tus datos</p>
                </div>

                <div>
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
                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-amber-300 rounded-xl px-3.5 py-2.5 text-sm font-black font-mono tracking-widest uppercase focus:outline-none transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Ej. XAXX010101000</p>
                </div>
              </div>

              {/* Fila 2: Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Nombre o Razón Social (Tal como aparece en tu Constancia Fiscal) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. JUAN PEREZ LOPEZ"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-bold uppercase focus:outline-none transition"
                />
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

              {/* Fila 5: Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Correo para Envío de Factura (XML y PDF) *
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveStatus === "saving"}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition transform active:scale-98 text-sm cursor-pointer border-none disabled:opacity-50"
                >
                  {saveStatus === "saving" ? (
                    <span>⏳ Guardando datos fiscales...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>💾 GUARDAR DATOS Y GENERAR FACTURA</span>
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
  );
};
export default CustomerInvoicePortalView;
