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
  Check
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
import { doc, setDoc, updateDoc } from "firebase/firestore";

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
  const [matchedCustomerId, setMatchedCustomerId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedDataSummary, setSavedDataSummary] = useState<any | null>(null);

  const businessName = selectedTenant?.name || "Cocinet";
  const branchSubtitle = selectedTenant?.sucursalDefault || "Facturación Electrónica CFDI 4.0";

  // Buscar si hay cuenta con este folio en el historial
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
      setMatchedCustomerId(found.id || found.uid || null);
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

  // Autocomplete inicial al cargar con initialPhone o initialRfc
  useEffect(() => {
    if (initialPhone || initialRfc) {
      handleLookupAndFill(initialPhone, initialRfc);
    }
  }, [initialPhone, initialRfc, customers]);

  // Al cambiar teléfono o RFC manualmente, buscar coincidencias
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

      // Guardar / Actualizar en Catálogo de Clientes
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
      setErrorMessage("Ocurrió un error al guardar tus datos fiscales. Por favor intenta nuevamente.");
      setSaveStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 select-text">
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl rounded-3xl overflow-hidden">
        
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                🧾
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">{businessName}</h1>
                <p className="text-xs text-amber-100 font-medium">{branchSubtitle}</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tarjeta de Ticket si existe */}
        {initialFolio && (
          <div className="bg-slate-800/80 border-b border-slate-700/60 px-6 py-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Folio de Consumo: <strong className="text-white font-mono">#{initialFolio}</strong></span>
            </div>
            {matchedAccount?.total && (
              <div className="text-emerald-400 font-black font-mono text-sm">
                ${Number(matchedAccount.total).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Contenido Principal */}
        <div className="p-6 sm:p-8">
          {saveStatus === "success" && savedDataSummary ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/10 animate-bounce">
                ✅
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">¡Datos Fiscales Registrados!</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Tus datos han sido vinculados correctamente. La factura electrónica será generada y enviada a tu correo electrónico.
                </p>
              </div>

              {/* Resumen de Datos Guardados */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">RFC:</span>
                  <span className="font-mono font-bold text-amber-300">{savedDataSummary.rfc}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">Razón Social:</span>
                  <span className="font-bold text-white text-right">{savedDataSummary.razonSocial}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">Código Postal:</span>
                  <span className="font-mono font-bold text-white">{savedDataSummary.cp}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">Correo Envío:</span>
                  <span className="font-bold text-sky-400 truncate max-w-[220px]">{savedDataSummary.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-mono font-bold text-slate-300">{savedDataSummary.phone}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 text-left">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>Para futuros consumos, tus datos se recordarán automáticamente con tu RFC o número de teléfono.</span>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
                >
                  Finalizar
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Captura de Datos para Facturación
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tu RFC o celular. Si ya estás registrado, tus datos fiscales se llenarán automáticamente.
                </p>
              </div>

              {/* Badge de Autocomplete */}
              {autoCompleted && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>¡Cliente reconocido! <strong className="text-white">{matchedCustomerName}</strong></span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">Auto-completado</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Fila 1: Celular y RFC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <p className="text-[10px] text-slate-500 mt-1">Llave para recordarte en el sistema</p>
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
                  <p className="text-[10px] text-slate-500 mt-1">Ej. XAXX010101000</p>
                </div>
              </div>

              {/* Fila 2: Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Nombre o Razón Social (Sin régimen societario) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. JUAN PEREZ LOPEZ o EMPRESA EJEMPLO"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold uppercase focus:outline-none transition"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Fila 6: Dirección Fiscal (Opcional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Dirección Fiscal Completa (Calle, Número, Colonia, Ciudad)
                </label>
                <input
                  type="text"
                  placeholder="Opcional para tus registros"
                  value={direccionFiscal}
                  onChange={(e) => setDireccionFiscal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveStatus === "saving"}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition transform active:scale-98 text-sm cursor-pointer disabled:opacity-50"
                >
                  {saveStatus === "saving" ? (
                    <span>⏳ Guardando datos fiscales...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>💾 Guardar y Solicitar Factura</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/60 border-t border-slate-800 px-6 py-4 text-center text-[11px] text-slate-500">
          🔒 Tus datos fiscales están protegidos y sólo se usarán para la emisión de tus CFDI de consumo.
        </div>
      </div>
    </div>
  );
};
export default CustomerInvoicePortalView;
