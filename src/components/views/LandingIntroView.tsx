import React from 'react';
import { motion } from 'framer-motion';

interface LandingIntroViewProps {
  onEnterLogin: () => void;
  resolvedTenantName?: string;
  neutralPlatformLogo?: string;
}

export const LandingIntroView: React.FC<LandingIntroViewProps> = ({
  onEnterLogin,
  resolvedTenantName,
  neutralPlatformLogo = "/logoroy.png",
}) => {
  const phoneNumber = "9511273796";
  const whatsappUrl = `https://wa.me/529511273796?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20una%20cotizaci%C3%B3n%20para%20el%20sistema%20COCINET%20POS%20(Venta%20o%20Renta).`;
  const callUrl = `tel:9511273796`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 overflow-x-hidden">
      {/* ─── 🌟 TOP NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-amber-500/25">
            🍽️
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              COCINET <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">PRO</span>
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none m-0">
              Punto de Venta Gastronómico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black transition-all hover:scale-105 active:scale-95 no-underline"
          >
            <span>💬 Cotizar</span>
            <span className="text-[11px] font-mono text-emerald-300">951-127-3796</span>
          </a>

          <button
            type="button"
            onClick={onEnterLogin}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer"
          >
            <span>¿Ya eres usuario? Iniciar Sesión 🔑</span>
          </button>
        </div>
      </header>

      {/* ─── 🚀 HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
          ⚡ Diseñado para Taquerías, Restaurantes y Cadenas en México
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Multiplica tus Ventas, Blinda tu Caja y{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            Controla tu Negocio al 100%
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
          <b>COCINET</b> es el ecosistema inteligente que automatiza comandas, inventarios con IA, facturación CFDI 4.0, cortes de caja y sincronización multi-sucursal en tiempo real. 
          <span className="text-amber-300 font-bold block mt-1">Disponible en esquema de RENTA mensual flexible o COMPRA definitiva de licencia.</span>
        </p>

        {/* CTA Buttons in Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onEnterLogin}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ingresar al Sistema POS 🚀</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-black text-sm sm:text-base border border-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 no-underline shadow-md"
          >
            <span className="text-emerald-400 text-lg">💬</span>
            <span>Solicitar Cotización: <b>951 127 3796</b></span>
          </a>
        </div>

        {/* Quick Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto text-left">
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">🧾</div>
            <div>
              <h4 className="text-xs font-black text-white m-0">Facturación 4.0</h4>
              <p className="text-[11px] text-slate-400 m-0 font-medium">Desde el ticket o en línea</p>
            </div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">📦</div>
            <div>
              <h4 className="text-xs font-black text-white m-0">Inventarios con IA</h4>
              <p className="text-[11px] text-slate-400 m-0 font-medium">Costeo, merma y recetas</p>
            </div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h4 className="text-xs font-black text-white m-0">Auditoría Antirrobo</h4>
              <p className="text-[11px] text-slate-400 m-0 font-medium">Cero fugas en caja y turnos</p>
            </div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">🖨️</div>
            <div>
              <h4 className="text-xs font-black text-white m-0">Multi-Impresión</h4>
              <p className="text-[11px] text-slate-400 m-0 font-medium">Cocina, barra y cajas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 💎 LAS 6 GRANDES BONDADES DE COCINET ────────────────────────── */}
      <section className="py-16 bg-slate-950/60 border-t border-b border-slate-800/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              ¿Por qué los mejores restaurantes eligen <span className="text-amber-400">COCINET</span>?
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Tecnología robusta diseñada desde el campo de batalla: rápido en horas pico, seguro en todo momento y fácil de usar para cajeros y meseros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Beneficio 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-black">
                🧾
              </div>
              <h3 className="text-base font-black text-white m-0">Facturación Electrónica CFDI 4.0</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium m-0">
                Timbrado fiscal instantáneo en cumplimiento con el SAT. Permite a tus clientes autofacturarse desde su teléfono mediante código QR o emite facturas al instante desde caja con desglose de impuestos e IEPS.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black">
                📦
              </div>
              <h3 className="text-base font-black text-white m-0">Inventarios Inteligentes & Costeo IA</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium m-0">
                Estandariza tus recetas: cada orden descuenta automáticamente gramos de carne, verduras, tortillas y bebidas. Conoce tu costo real por platillo, margen de utilidad y recibe alertas de compras oportunas.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-black">
                🛡️
              </div>
              <h3 className="text-base font-black text-white m-0">Arqueos de Caja & Protección Antirrobo</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium m-0">
                Cortes X y Z exactos con desglose por forma de pago (efectivo, tarjeta, transferencias). Cancelaciones de productos y comandas autorizadas solo con PIN de administrador o supervisor con bitácora de auditoría.
              </p>
            </div>

            {/* Beneficio 4 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-black">
                📱
              </div>
              <h3 className="text-base font-black text-white m-0">Comandero Móvil para Meseros</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium m-0">
                Toma órdenes al pie de la mesa desde cualquier teléfono o tablet. Las comandas vuelan inmediatamente a las impresoras de cocina, barra y parrilla sin errores ni demoras de traslado.
              </p>
            </div>

            {/* Beneficio 5 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl font-black">
                🏢
              </div>
              <h3 className="text-base font-black text-white m-0">Control Multi-Sucursal y Multi-Patrón</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium m-0">
                Supervisa todas tus sucursales y casas matrices desde un solo panel aislado y seguro. Consulta ventas consolidadas en vivo, réplica de menús y reportes diarios directamente desde tu celular.
              </p>
            </div>

            {/* Beneficio 6 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl font-black">
                ⚡
              </div>
              <h3 className="text-base font-black text-white m-0">Modo Híbrido: Funciona sin Internet</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium m-0">
                Si se cae el internet o falla la señal, tu restaurante sigue cobrando, imprimiendo tickets y atendiendo mesas sin interrupción. Al regresar la conexión, todo se sincroniza automáticamente a la nube.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 💰 PLANES DE VENTA Y RENTA ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-10">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20 inline-block">
            Esquemas de Adquisición
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Elige la Modalidad que Mejor se Adapte a tu Negocio
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Sin letras chiquitas. Obtén una cotización personalizada de acuerdo a tu número de cajas, impresoras y sucursales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Opción 1: Renta Mensual */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 border-2 border-slate-700/80 p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
                Modalidad Flexible
              </span>
              <h3 className="text-2xl font-black text-white m-0">Renta Mensual Todo Incluido</h3>
              <p className="text-xs text-slate-400 font-medium">
                Comienza sin grandes inversiones iniciales. Ideal para negocios que buscan flexibilidad y respaldo continuo.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-bold list-none p-0 m-0">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Actualizaciones y mejoras continuas sin costo adicional
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Soporte técnico prioritario por WhatsApp y llamada
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Respaldo y sincronización en la nube incluidos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Capacitación de meseros, cajeros y administradores
              </li>
            </ul>

            <a
              href={`https://wa.me/529511273796?text=Hola,%20me%20interesa%20conocer%20los%20planes%20de%20RENTA%20MENSUAL%20del%20sistema%20Cocinet%20POS.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center block no-underline shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-98"
            >
              Cotizar Plan de Renta 💬
            </a>
          </div>

          {/* Opción 2: Venta Definitiva */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 border-2 border-indigo-500/50 p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              Más Popular
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-md">
                Licencia Vitalicia
              </span>
              <h3 className="text-2xl font-black text-white m-0">Venta de Licencia Definitiva</h3>
              <p className="text-xs text-slate-400 font-medium">
                Sé dueño absoluto de tu sistema POS. Un solo pago, sin mensualidades forzosas para operar tu restaurante.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-bold list-none p-0 m-0">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Licencia permanente sin vencimiento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Instalación y puesta a punto en tus equipos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Configuración completa de impresoras térmicas y red
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Garantía directa y asesoría comercial personalizada
              </li>
            </ul>

            <a
              href={`https://wa.me/529511273796?text=Hola,%20me%20interesa%20conocer%20la%20VENTA%20DE%20LICENCIA%20DEFINITIVA%20del%20sistema%20Cocinet%20POS.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider text-center block no-underline shadow-lg shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98"
            >
              Cotizar Compra de Licencia 💬
            </a>
          </div>
        </div>
      </section>

      {/* ─── 📞 CONTACTO COMERCIAL Y COTIZACIONES ───────────────────────── */}
      <section className="py-14 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 text-3xl font-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            📞
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¿Listo para transformar la operación de tu negocio?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Contáctanos directamente hoy mismo para una demostración en vivo o una cotización adaptada a tu restaurante.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={callUrl}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 no-underline shadow-md"
            >
              <span>📞 Llamar: 951 127 3796</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 no-underline shadow-lg shadow-emerald-500/20"
            >
              <span>💬 Enviar WhatsApp Directo</span>
            </a>

            <button
              type="button"
              onClick={onEnterLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>Entrar al POS 🔑</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-bold pt-2 m-0">
            📍 Atención directa en México • Servicio y soporte técnico garantizado
          </p>
        </div>
      </section>

      {/* ─── 🔻 FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-xs font-semibold px-4 space-y-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={onEnterLogin}
            className="text-amber-400 hover:text-amber-300 font-black uppercase text-xs bg-transparent border-none cursor-pointer transition-colors"
          >
            Acceso a Clientes / Iniciar Sesión 🔑
          </button>
          <span>•</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-400 text-xs no-underline font-bold transition-colors"
          >
            Soporte y Cotizaciones (951-127-3796)
          </a>
        </div>
        <p className="text-[11px] text-slate-600 m-0">
          © {new Date().getFullYear()} COCINET PRO POS • Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};
