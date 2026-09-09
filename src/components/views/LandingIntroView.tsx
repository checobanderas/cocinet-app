import React from 'react';
import { motion } from 'framer-motion';
import { sendSilentWhatsAppMessage } from '../../utils/whatsappCloud';
import { resetToDefaultManifest } from '../../services/pwaTerminalService';

interface LandingIntroViewProps {
  onEnterLogin: () => void;
  resolvedTenantName?: string;
  neutralPlatformLogo?: string;
}

export const LandingIntroView: React.FC<LandingIntroViewProps> = ({
  onEnterLogin,
  resolvedTenantName,
  neutralPlatformLogo = "/cocinet-logo.png",
}) => {
  React.useEffect(() => {
    resetToDefaultManifest();
  }, []);

  const phoneNumber = "9511273796";
  const [showQuoteModal, setShowQuoteModal] = React.useState(false);
  const [clientContactName, setClientContactName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [locationCity, setLocationCity] = React.useState("");
  const [acquisitionType, setAcquisitionType] = React.useState("Renta Mensual Todo Incluido");
  const [tableCount, setTableCount] = React.useState("11 a 25 Mesas");
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([
    "Cocina Caliente",
    "Caja Principal"
  ]);
  const [waiterDevices, setWaiterDevices] = React.useState("3 a 5 Celulares");
  const [selectedModules, setSelectedModules] = React.useState<string[]>([
    "Facturación CFDI 4.0",
    "Inventarios con Receta IA"
  ]);
  const [trainingCount, setTrainingCount] = React.useState("4 a 10 Personas");
  const [installationType, setInstallationType] = React.useState("En Sitio (Red + Impresoras)");
  const [isSendingQuote, setIsSendingQuote] = React.useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = React.useState(false);

  const handleToggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleToggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSendQuote = async () => {
    if (isSendingQuote) return;
    setIsSendingQuote(true);

    const cleanClientPhone = clientPhone.replace(/\D/g, "").slice(-10);

    const leadSummary =
`🛎️ *NUEVA SOLICITUD DE COTIZACIÓN - COCINET POS*

👤 *Contacto:* ${clientContactName.trim() || "Posible Cliente"}
📱 *WhatsApp Cliente:* ${cleanClientPhone || clientPhone.trim() || "No proporcionado"}
🏢 *Negocio:* ${businessName.trim() || "Restaurante/Taquería"}
📍 *Ciudad / Estado:* ${locationCity.trim() || "México"}
💎 *Modalidad:* ${acquisitionType}
🪑 *Capacidad / Mesas:* ${tableCount}
🍳 *Áreas:* ${selectedAreas.length > 0 ? selectedAreas.join(", ") : "Caja general"}
📱 *Comanderos Móviles:* ${waiterDevices}
✨ *Módulos:* ${selectedModules.length > 0 ? selectedModules.join(", ") : "Básicos"}
🧑‍🏫 *Capacitación:* ${trainingCount}
🛠️ *Instalación:* ${installationType}
⏰ *Fecha:* ${new Date().toLocaleString("es-MX")}`;

    // 1. Enviar silenciosamente al teléfono del administrador (9511273796)
    try {
      await sendSilentWhatsAppMessage("9511273796", leadSummary);
    } catch (err) {
      console.warn("Error enviando WhatsApp silencioso a 9511273796:", err);
    }

    // 2. Si el cliente colocó su teléfono celular, responderle silenciosamente
    if (cleanClientPhone.length === 10) {
      const clientConfirmation =
`¡Hola${clientContactName.trim() ? ` ${clientContactName.trim()}` : ""}! 👋

Hemos recibido tu solicitud de cotización para *${businessName.trim() || "tu negocio"}* en COCINET POS.

✨ *En breve nos comunicaremos contigo* para brindarte una propuesta personalizada con el mejor precio y promociones.

¡Muchas gracias por tu interés! 🌮🚀`;

      sendSilentWhatsAppMessage(cleanClientPhone, clientConfirmation).catch((e) => {
        console.warn("Error enviando acuse a cliente:", e);
      });
    }

    setIsSendingQuote(false);
    setQuoteSubmitted(true);
  };

  const getFormattedWhatsAppUrl = () => {
    const text = 
`¡Hola! Me gustaría cotizar el sistema *COCINET POS*:

🏢 *Negocio:* ${businessName.trim() || "Restaurante/Taquería"} ${locationCity.trim() ? `(${locationCity.trim()})` : ""}
💎 *Modalidad:* ${acquisitionType}
🪑 *Capacidad:* ${tableCount}
🍳 *Áreas:* ${selectedAreas.length > 0 ? selectedAreas.join(", ") : "Caja general"}
📱 *Comanderos Móviles:* ${waiterDevices}
✨ *Módulos:* ${selectedModules.length > 0 ? selectedModules.join(", ") : "Básicos"}
🧑‍🏫 *Capacitación:* ${trainingCount}
🛠️ *Instalación:* ${installationType}

¿Podrían compartirme presupuesto detallado y disponibilidad? ¡Muchas gracias!`;

    return `https://wa.me/529511273796?text=${encodeURIComponent(text)}`;
  };

  const quickWhatsappUrl = `https://wa.me/529511273796?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20una%20cotizaci%C3%B3n%20para%20el%20sistema%20COCINET%20POS.`;
  const callUrl = `tel:9511273796`;

  return (
    <div
      className="min-h-screen text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-900 overflow-x-hidden relative"
      style={{
        backgroundColor: "#fffbeb",
        backgroundImage: `
          radial-gradient(at 10% 15%, rgba(245, 158, 11, 0.18) 0px, transparent 40%),
          radial-gradient(at 90% 25%, rgba(234, 88, 12, 0.15) 0px, transparent 35%),
          radial-gradient(at 50% 80%, rgba(249, 115, 22, 0.12) 0px, transparent 50%),
          linear-gradient(135deg, rgba(255, 253, 245, 0.90) 0%, rgba(254, 243, 199, 0.85) 50%, rgba(255, 247, 237, 0.92) 100%),
          url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2000&q=80')
        `,
        backgroundSize: "cover, cover, cover, cover, cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ─── 🌟 TOP NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-amber-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-amber-500/25">
            🍽️
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              COCINET <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-extrabold">PRO</span>
            </span>
            <p className="text-[10px] font-extrabold text-amber-800/80 uppercase tracking-widest leading-none m-0">
              Punto de Venta Gastronómico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
          >
            <span>💬 Cotizar WhatsApp</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">951-127-3796</span>
          </button>

          <button
            type="button"
            onClick={onEnterLogin}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer"
          >
            <span>¿Ya eres usuario? Iniciar Sesión 🔑</span>
          </button>
        </div>
      </header>

      {/* ─── 🚀 HERO SECTION CON VIDEO/SHOWCASE ALEGRE ─────────────────── */}
      <section className="relative pt-10 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-black uppercase tracking-widest shadow-xs">
          ⚡ Software Punto de Venta Líder para Taquerías, Restaurantes, Cafeterías y Bares en México
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          El Software y Programa{" "}
          <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
            Punto de Venta Más Rápido y Completo
          </span>{" "}
          para tu Restaurante
        </h1>

        <p className="text-base sm:text-lg text-slate-700 font-medium max-w-3xl mx-auto leading-relaxed">
          <b>COCINET Pro</b> es el programa punto de venta gastronómico que acelera el servicio de meseros, automatiza comandas a cocina y barra, controla tus inventarios con IA, envía cortes automáticos por WhatsApp y timbra facturas CFDI 4.0 al instante.
          <span className="text-orange-800 font-bold block mt-1.5 bg-orange-100/70 py-1 px-3 rounded-xl border border-orange-300/80 inline-block shadow-xs">
            ✨ Disponible en RENTA MENSUAL flexible o VENTA DE LICENCIA definitiva.
          </span>
        </p>

        {/* CTA Buttons in Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onEnterLogin}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ingresar al Sistema POS 🚀</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm sm:text-base border-2 border-amber-300 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-amber-900/5"
          >
            <span className="text-emerald-500 text-xl">💬</span>
            <span>Solicitar Cotización: <b>951 127 3796</b></span>
          </button>
        </div>

        {/* 🎬 HERO SHOWCASE (Ambiente Alegre de Servicio y Cocina en Acción) */}
        <div className="relative max-w-4xl mx-auto mt-6 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
            alt="Ambiente de restaurante alegre COCINET"
            className="w-full h-64 sm:h-96 object-cover brightness-95"
            loading="eager"
          />

          {/* Overlay informativo con métricas en tiempo real */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 flex flex-col justify-between p-4 sm:p-6 text-left pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                🟢 En Vivo • Sistema en Operación
              </span>
              <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 text-xs font-bold shadow">
                ⚡ Cero Retrasos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-amber-200 shadow-lg">
                <div className="text-xs font-extrabold text-slate-500 uppercase">Comandas Móviles</div>
                <div className="text-sm font-black text-slate-900">Directo a cocina en 1 seg 🍳</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-200 shadow-lg">
                <div className="text-xs font-extrabold text-slate-500 uppercase">Corte Antirrobo</div>
                <div className="text-sm font-black text-emerald-800">Caja blindada al 100% 🛡️</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-blue-200 shadow-lg">
                <div className="text-xs font-extrabold text-slate-500 uppercase">Facturación 4.0</div>
                <div className="text-sm font-black text-blue-900">SAT / QR Automático 🧾</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto text-left">
          <div className="bg-white/90 backdrop-blur-md border border-amber-200/90 p-4 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="text-3xl">🧾</div>
            <div>
              <h4 className="text-xs font-black text-slate-900 m-0">Facturación 4.0</h4>
              <p className="text-[11px] text-slate-600 m-0 font-medium">Desde el ticket o en línea</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-amber-200/90 p-4 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="text-3xl">📦</div>
            <div>
              <h4 className="text-xs font-black text-slate-900 m-0">Inventarios con IA</h4>
              <p className="text-[11px] text-slate-600 m-0 font-medium">Costeo, merma y recetas</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-amber-200/90 p-4 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="text-3xl">🛡️</div>
            <div>
              <h4 className="text-xs font-black text-slate-900 m-0">Auditoría Antirrobo</h4>
              <p className="text-[11px] text-slate-600 m-0 font-medium">Cero fugas en caja y turnos</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-amber-200/90 p-4 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="text-3xl">🖨️</div>
            <div>
              <h4 className="text-xs font-black text-slate-900 m-0">Multi-Impresión</h4>
              <p className="text-[11px] text-slate-600 m-0 font-medium">Cocina, barra y cajas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 💎 LAS 6 GRANDES BONDADES DE COCINET ────────────────────────── */}
      <section className="py-16 bg-white/75 backdrop-blur-md border-t border-b border-amber-200/80 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase text-orange-700 tracking-widest bg-orange-100 px-3.5 py-1 rounded-full border border-orange-200 inline-block shadow-2xs">
              Beneficios Exclusivos
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ¿Por qué los mejores restaurantes eligen <span className="text-amber-600">COCINET</span>?
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Tecnología robusta diseñada desde el campo de batalla: rápido en horas pico, seguro en todo momento y fácil de usar para cajeros y meseros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Beneficio 1 */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-amber-200/80 p-6 rounded-3xl space-y-3 hover:border-amber-400 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center text-2xl font-black shadow-xs">
                🧾
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Facturación Electrónica CFDI 4.0</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                Timbrado fiscal instantáneo en cumplimiento con el SAT. Permite a tus clientes autofacturarse desde su teléfono mediante código QR o emite facturas al instante desde caja con desglose de impuestos e IEPS.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-emerald-200/80 p-6 rounded-3xl space-y-3 hover:border-emerald-400 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center text-2xl font-black shadow-xs">
                📦
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Inventarios Inteligentes & Costeo IA</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                Estandariza tus recetas: cada orden descuenta automáticamente gramos de carne, verduras, tortillas y bebidas. Conoce tu costo real por platillo, margen de utilidad y recibe alertas de compras oportunas.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-rose-200/80 p-6 rounded-3xl space-y-3 hover:border-rose-400 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center text-2xl font-black shadow-xs">
                🛡️
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Arqueos de Caja & Protección Antirrobo</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                Cortes X y Z exactos con desglose por forma de pago (efectivo, tarjeta, transferencias). Cancelaciones de productos y comandas autorizadas solo con PIN de administrador o supervisor con bitácora de auditoría.
              </p>
            </div>

            {/* Beneficio 4 */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-blue-200/80 p-6 rounded-3xl space-y-3 hover:border-blue-400 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center text-2xl font-black shadow-xs">
                📱
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Comandero Móvil para Meseros</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                Toma órdenes al pie de la mesa desde cualquier teléfono o tablet. Las comandas vuelan inmediatamente a las impresoras de cocina, barra y parrilla sin errores ni demoras de traslado.
              </p>
            </div>

            {/* Beneficio 5 */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-purple-200/80 p-6 rounded-3xl space-y-3 hover:border-purple-400 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 text-purple-700 flex items-center justify-center text-2xl font-black shadow-xs">
                🏢
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Control Multi-Sucursal y Multi-Patrón</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                Supervisa todas tus sucursales y casas matrices desde un solo panel aislado y seguro. Consulta ventas consolidadas en vivo, réplica de menús y reportes diarios directamente desde tu celular.
              </p>
            </div>

            {/* Beneficio 6 */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-cyan-200/80 p-6 rounded-3xl space-y-3 hover:border-cyan-400 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-300 text-cyan-700 flex items-center justify-center text-2xl font-black shadow-xs">
                ⚡
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Modo Híbrido: Funciona sin Internet</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                Si se cae el internet o falla la señal, tu restaurante sigue cobrando, imprimiendo tickets y atendiendo mesas sin interrupción. Al regresar la conexión, todo se sincroniza automáticamente a la nube.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 💰 PLANES DE VENTA Y RENTA ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-10">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase text-amber-800 tracking-widest bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 inline-block shadow-2xs">
            Esquemas de Adquisición
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Elige la Modalidad que Mejor se Adapte a tu Negocio
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Sin letras chiquitas. Obtén una cotización personalizada de acuerdo a tu número de cajas, impresoras, meseros y sucursales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Opción 1: Renta Mensual */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-amber-400/80 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                  Modalidad Flexible
                </span>
                <h3 className="text-2xl font-black text-slate-900 m-0">Renta Mensual Todo Incluido</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Comienza sin grandes inversiones iniciales. Ideal para negocios que buscan flexibilidad y respaldo continuo.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-bold list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Actualizaciones y mejoras continuas sin costo adicional
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Soporte técnico prioritario por WhatsApp y llamada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Respaldo y sincronización en la nube incluidos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Capacitación de meseros, cajeros y administradores
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setAcquisitionType("Renta Mensual Todo Incluido");
                setShowQuoteModal(true);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider text-center block shadow-lg shadow-orange-500/20 transition-all hover:scale-102 active:scale-98 border-none cursor-pointer"
            >
              Cotizar Plan de Renta (WhatsApp) 💬
            </button>
          </div>

          {/* Opción 2: Venta Definitiva */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-400/80 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                Más Popular
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  Licencia Vitalicia
                </span>
                <h3 className="text-2xl font-black text-slate-900 m-0">Venta de Licencia Definitiva</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Sé dueño absoluto de tu sistema POS. Un solo pago, sin mensualidades forzosas para operar tu restaurante.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-bold list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Licencia permanente sin vencimiento
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Instalación y puesta a punto en tus equipos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Configuración completa de impresoras térmicas y red
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span> Garantía directa y asesoría comercial personalizada
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setAcquisitionType("Venta de Licencia Definitiva");
                setShowQuoteModal(true);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider text-center block shadow-lg shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98 border-none cursor-pointer"
            >
              Cotizar Compra de Licencia (WhatsApp) 💬
            </button>
          </div>
        </div>
      </section>

      {/* ─── 📞 CONTACTO COMERCIAL Y COTIZACIONES ───────────────────────── */}
      <section className="py-14 bg-white/65 backdrop-blur-md border-t border-amber-200/80 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white via-amber-50/50 to-orange-50/50 backdrop-blur-md border-2 border-amber-300 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 text-3xl font-black flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
            📞
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¿Listo para transformar la operación de tu restaurante?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Completa el cotizador inteligente para enviarte un presupuesto exacto y adaptado a tu número de áreas, comanderos y sucursales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={callUrl}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 no-underline shadow-md"
            >
              <span>📞 Llamar: 951 127 3796</span>
            </a>

            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <span>📊 Abrir Cotizador WhatsApp 💬</span>
            </button>

            <button
              type="button"
              onClick={onEnterLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer shadow-lg shadow-amber-500/25"
            >
              <span>Entrar al POS 🔑</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-bold pt-2 m-0">
            📍 Atención directa en México • Servicio, capacitación y soporte técnico garantizado
          </p>
        </div>
      </section>

      {/* ─── 🔻 FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-amber-200/80 text-center text-slate-600 text-xs font-semibold px-4 space-y-3 bg-amber-100/50">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={onEnterLogin}
            className="text-amber-800 hover:text-amber-900 font-black uppercase text-xs bg-transparent border-none cursor-pointer transition-colors"
          >
            Acceso a Clientes / Iniciar Sesión 🔑
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs bg-transparent border-none cursor-pointer transition-colors"
          >
            Cotizador Inteligente (951-127-3796)
          </button>
        </div>
        <p className="text-[11px] text-slate-500 m-0">
          © {new Date().getFullYear()} COCINET PRO POS • Todos los derechos reservados.
        </p>
      </footer>

      {/* ─── 📊 MODAL INTERACTIVO DE COTIZACIÓN WHATSAPP ─────────────────── */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-left relative">
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-0.5 rounded-full border border-orange-200 inline-block">
                  Cotización Rápida
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 flex items-center gap-2">
                  📊 Cotizador Inteligente COCINET POS
                </h3>
                <p className="text-xs text-slate-500 font-medium m-0">
                  Selecciona las características de tu restaurante para generar una cotización precisa por WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-black text-lg flex items-center justify-center border-none cursor-pointer transition-all shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-md">
                  ✅
                </div>
                <h3 className="text-2xl font-black text-slate-900 m-0">
                  ¡Solicitud Enviada con Éxito!
                </h3>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 py-3 px-5 rounded-2xl max-w-md mx-auto font-black text-sm shadow-xs">
                  ✨ En breve nos comunicaremos contigo.
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  Hemos enviado los detalles de tu cotización a nuestro equipo de atención comercial para prepararte la mejor propuesta.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuoteModal(false);
                      setQuoteSubmitted(false);
                    }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border-none cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <a
                    href={getFormattedWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 no-underline shadow-md shadow-emerald-200"
                  >
                    <span>💬 Abrir Chat en WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Paso 1: Datos del Negocio y Modalidad */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-l-4 border-amber-500 pl-2 m-0">
                    1. Datos de tu Restaurante y Contacto
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre del Restaurante / Negocio:</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ej. Tacos Roy / Mariscos El Puerto"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Ciudad / Estado (México):</label>
                      <input
                        type="text"
                        value={locationCity}
                        onChange={(e) => setLocationCity(e.target.value)}
                        placeholder="Ej. Oaxaca, Oax. / CDMX / Puebla"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tu Nombre o Responsable:</label>
                      <input
                        type="text"
                        value={clientContactName}
                        onChange={(e) => setClientContactName(e.target.value)}
                        placeholder="Ej. Ing. Roberto Mendoza"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tu Celular / WhatsApp (10 dígitos):</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Ej. 9511234567"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none font-mono font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Esquema que te interesa:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { key: "Renta Mensual Todo Incluido", label: "💳 Renta Mensual" },
                        { key: "Venta de Licencia Definitiva", label: "🏆 Compra Definitiva" },
                        { key: "Ambas / Deseo Asesoría", label: "🤝 Deseo Asesoría" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setAcquisitionType(item.key)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                            acquisitionType === item.key
                              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Paso 2: Capacidad y Áreas de Impresión */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-l-4 border-orange-500 pl-2 m-0">
                    2. Capacidad, Mesas y Áreas a Atender
                  </h4>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Número de Mesas / Comensales:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["1 a 10 Mesas", "11 a 25 Mesas", "26 a 50+ Mesas", "Solo Para Llevar / Mostrador"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setTableCount(opt)}
                          className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-center ${
                            tableCount === opt
                              ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Áreas de Producción / Impresoras Requeridas:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        "🍳 Cocina Caliente",
                        "🌮 Trompo / Taquería / Parrilla",
                        "🍹 Barra / Bebidas",
                        "💵 Caja Principal",
                        "🛵 Despacho Domicilio",
                      ].map((area) => {
                        const isChecked = selectedAreas.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => handleToggleArea(area)}
                            className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border cursor-pointer flex items-center gap-2 ${
                              isChecked
                                ? "bg-amber-50 border-amber-400 text-amber-900 shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black border ${isChecked ? "bg-amber-500 text-slate-950 border-amber-600" : "bg-white border-slate-300"}`}>
                              {isChecked ? "✓" : ""}
                            </span>
                            <span>{area}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Dispositivos para Meseros (Comanderos Móviles):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["1 a 2 Celulares", "3 a 5 Celulares", "6 a 10 Celulares", "Ninguno (Solo Caja)"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setWaiterDevices(opt)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-center ${
                            waiterDevices === opt
                              ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Paso 3: Módulos y Servicios Profesionales */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-l-4 border-emerald-500 pl-2 m-0">
                    3. Módulos, Capacitación e Instalación
                  </h4>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Módulos Especiales:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "🧾 Facturación CFDI 4.0 con QR",
                        "📦 Inventarios con Receta IA y Costeo",
                        "🛵 Módulo de Servicio a Domicilio / Reparto",
                        "🏢 Multi-Sucursal en Tiempo Real",
                      ].map((mod) => {
                        const isChecked = selectedModules.includes(mod);
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => handleToggleModule(mod)}
                            className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border cursor-pointer flex items-center gap-2 ${
                              isChecked
                                ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black border ${isChecked ? "bg-emerald-600 text-white border-emerald-700" : "bg-white border-slate-300"}`}>
                              {isChecked ? "✓" : ""}
                            </span>
                            <span>{mod}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">🧑‍🏫 Capacitación de Personal:</label>
                      <select
                        value={trainingCount}
                        onChange={(e) => setTrainingCount(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium outline-none"
                      >
                        <option value="Básica (1 a 3 Personas)">Básica (1 a 3 Personas)</option>
                        <option value="4 a 10 Personas (Cajeros y Meseros)">4 a 10 Personas (Cajeros y Meseros)</option>
                        <option value="Intensiva Multi-Turno (10+ Personas)">Intensiva Multi-Turno (10+ Personas)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">🛠️ Instalación y Configuración:</label>
                      <select
                        value={installationType}
                        onChange={(e) => setInstallationType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium outline-none"
                      >
                        <option value="En Sitio (Red + Impresoras Térmicas)">En Sitio (Red + Impresoras Térmicas)</option>
                        <option value="Configuración Remota Guiada">Configuración Remota Guiada</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer de Acciones del Modal */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="w-full sm:w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer"
                  >
                    Cerrar
                  </button>

                  <button
                    type="button"
                    onClick={handleSendQuote}
                    disabled={isSendingQuote}
                    className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98"
                  >
                    <i className="fa-brands fa-whatsapp text-base" />
                    <span>
                      {isSendingQuote
                        ? "Enviando Solicitud..."
                        : "📲 Enviar Cotización por WhatsApp"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
