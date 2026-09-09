import React, { useState, useEffect } from 'react';
import { IonModal, IonContent } from '@ionic/react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Edit3
} from 'lucide-react';
import {
  prepararBorradorFactura,
  timbrarFactura,
  descartarFactura,
  formatFriendlySatError,
  PrepareInvoiceResponse,
  StampInvoiceResponse
} from '../../services/invoicingService';

interface InvoiceModalProps {
  showInvoiceModal: boolean;
  setShowInvoiceModal: (show: boolean) => void;
  invoicingApiUrl?: string;
  ticketData?: {
    ticketId?: number | string;
    accountLabel?: string;
    total: number;
    paymentMethod?: string;
    clientPhone?: string;
    clientRfc?: string;
    clientName?: string;
    clientCp?: string;
    clientRegimen?: string;
    clientEmail?: string;
  } | null;
  triggerAppNotification?: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onInvoiceSuccess?: (uuid: string, folio: number, pdfUrl?: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  showInvoiceModal,
  setShowInvoiceModal,
  invoicingApiUrl = '',
  ticketData,
  triggerAppNotification,
  onInvoiceSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  const [rfc, setRfc] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [cp, setCp] = useState<string>('');
  const [regimen, setRegimen] = useState<string>('601');
  const [usoCfdi, setUsoCfdi] = useState<string>('G03');
  const [formaPago, setFormaPago] = useState<string>('01');
  const [metodoPago, setMetodoPago] = useState<string>('PUE');
  const [correo, setCorreo] = useState<string>('');
  const [concepto, setConcepto] = useState<string>('CONSUMO DE ALIMENTOS');

  const [draftResult, setDraftResult] = useState<PrepareInvoiceResponse | null>(null);
  const [stampedResult, setStampedResult] = useState<StampInvoiceResponse | null>(null);
  const [stampError, setStampError] = useState<{ title: string; explanation: string; tip: string; raw?: string } | null>(null);

  useEffect(() => {
    if (showInvoiceModal && ticketData) {
      setStep(1);
      setDraftResult(null);
      setStampedResult(null);
      setStampError(null);
      setRfc((ticketData.clientRfc || '').toUpperCase().trim());
      setNombre((ticketData.clientName || '').toUpperCase().trim());
      setCp((ticketData.clientCp || '').trim());
      setRegimen(ticketData.clientRegimen || '601');
      setCorreo((ticketData.clientEmail || '').trim());
      setConcepto('CONSUMO DE ALIMENTOS');

      const pm = (ticketData.paymentMethod || '').toLowerCase();
      if (pm.includes('tarjeta') || pm.includes('card')) {
        setFormaPago('04');
      } else if (pm.includes('transfer') || pm.includes('spei')) {
        setFormaPago('03');
      } else {
        setFormaPago('01');
      }
    }
  }, [showInvoiceModal, ticketData]);

  const cleanTotal = Number(ticketData?.total) || 0;
  const isPersonaMoral = rfc.trim().length === 12;

  const handleGenerarBorrador = async () => {
    const cleanRfc = rfc.trim().toUpperCase();
    const cleanNombre = nombre.trim().toUpperCase();
    const cleanCp = cp.trim();

    if (!cleanRfc || cleanRfc.length < 12 || cleanRfc.length > 13) {
      triggerAppNotification?.('⚠️ RFC Inválido', 'El RFC debe tener 12 (Persona Moral) o 13 (Persona Física) caracteres.', 'warning');
      return;
    }
    if (!cleanNombre) {
      triggerAppNotification?.('⚠️ Razón Social', 'Ingresa el nombre o razón social del cliente.', 'warning');
      return;
    }
    if (!cleanCp || cleanCp.length !== 5) {
      triggerAppNotification?.('⚠️ C.P. Inválido', 'El Código Postal Fiscal debe tener exactamente 5 dígitos.', 'warning');
      return;
    }
    if (!invoicingApiUrl.trim()) {
      triggerAppNotification?.(
        '⚠️ URL de Facturación No Configurada',
        'Por favor configure la URL de Facturación Web API en Configuración > Datos de Empresa.',
        'error'
      );
      return;
    }

    setLoading(true);
    setLoadingText('Generando Pre-Factura y Desglose de Impuestos...');
    setStampError(null);

    const res = await prepararBorradorFactura(invoicingApiUrl, {
      ticket_id: ticketData?.ticketId || 0,
      total: cleanTotal,
      rfc: cleanRfc,
      nombre: cleanNombre,
      cp: cleanCp,
      regimen: regimen,
      uso_cfdi: usoCfdi,
      forma_pago: formaPago,
      metodo_pago: metodoPago,
      correo: correo.trim(),
      concepto: concepto.trim()
    });

    setLoading(false);

    if (res.ok && res.folio) {
      setDraftResult(res);
      setStep(2);
      triggerAppNotification?.('📄 Borrador Generado', `Se generó la Pre-Factura Folio #${res.folio}`, 'info');
    } else {
      triggerAppNotification?.('❌ Error al Preparar', res.error || 'No se pudo generar el borrador de factura.', 'error');
    }
  };

  const handleTimbrar = async () => {
    if (!draftResult?.folio) return;

    setLoading(true);
    setLoadingText('Firmando XML con CSD y Timbrando ante el SAT / Finkok...');
    setStampError(null);

    const res = await timbrarFactura(invoicingApiUrl, {
      folio: draftResult.folio,
      serie: draftResult.serie || 'A'
    });

    setLoading(false);

    if (res.ok && res.uuid) {
      setStampedResult(res);
      setStep(3);
      triggerAppNotification?.('🎉 Timbrado Exitoso', `Factura Folio #${res.folio} timbrada ante el SAT.`, 'success');
      onInvoiceSuccess?.(res.uuid, res.folio || 0, res.pdfUrl);
    } else {
      const friendly = formatFriendlySatError(res.error || '');
      setStampError({ ...friendly, raw: res.error });
      triggerAppNotification?.('⚠️ Error de Timbrado', friendly.title, 'error');
    }
  };

  const handleDescartarBorrador = async () => {
    if (!draftResult?.folio) {
      setShowInvoiceModal(false);
      return;
    }

    const confirmDiscard = window.confirm(
      `¿Deseas descartar el borrador del Folio #${draftResult.folio}?\n\nEl folio consecutivo será liberado en el servidor para no saltar números de factura.`
    );
    if (!confirmDiscard) return;

    setLoading(true);
    setLoadingText('Liberando Folio Consecutivo...');

    const res = await descartarFactura(invoicingApiUrl, {
      folio: draftResult.folio
    });

    setLoading(false);

    if (res.ok) {
      triggerAppNotification?.('🗑️ Folio Liberado', `El borrador #${draftResult.folio} fue eliminado y el folio quedó libre.`, 'info');
      setDraftResult(null);
      setStampError(null);
      setStep(1);
      setShowInvoiceModal(false);
    } else {
      triggerAppNotification?.('⚠️ Error', res.error || 'No se pudo descartar el borrador.', 'warning');
    }
  };

  if (!showInvoiceModal) return null;

  return (
    <IonModal
      isOpen={showInvoiceModal}
      onDidDismiss={() => {
        if (!loading) {
          setShowInvoiceModal(false);
        }
      }}
      style={{
        '--height': 'auto',
        '--max-height': '94vh',
        '--width': '94%',
        '--max-width': '620px',
        '--border-radius': '28px',
        '--z-index': '99999',
        zIndex: 99999
      }}
    >
      <IonContent className="ion-padding" style={{ '--background': '#0f172a' }}>
        <div className="flex flex-col bg-slate-900 text-white p-5 sm:p-6 justify-between rounded-3xl min-h-[500px]">
          
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold border border-indigo-500/30">
                  🧾
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Facturación CFDI 4.0
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">
                      SAT México
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {ticketData?.accountLabel ? `Cuenta: ${ticketData.accountLabel} • ` : ''}
                    Total: <strong className="text-emerald-400">${cleanTotal.toFixed(2)} MXN</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowInvoiceModal(false)}
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-base hover:bg-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between my-4 px-2">
              <div className={`flex items-center gap-2 text-xs font-bold ${step === 1 ? 'text-indigo-400' : 'text-emerald-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  1
                </span>
                <span>Datos Fiscales</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-800 mx-3"></div>
              <div className={`flex items-center gap-2 text-xs font-bold ${step === 2 ? 'text-indigo-400' : step === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${step === 2 ? 'bg-indigo-600 text-white' : step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  2
                </span>
                <span>Pre-Factura / Borrador</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-800 mx-3"></div>
              <div className={`flex items-center gap-2 text-xs font-bold ${step === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  3
                </span>
                <span>Timbrado SAT</span>
              </div>
            </div>

            {loading && (
              <div className="my-6 p-8 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm font-bold text-slate-200">{loadingText}</p>
                <p className="text-xs text-slate-400">Por favor espere un momento...</p>
              </div>
            )}

            {!loading && step === 1 && (
              <div className="space-y-3.5 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      RFC del Receptor *
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      placeholder="XAXX010101000"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, ''))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 uppercase"
                    />
                    {isPersonaMoral && (
                      <span className="text-[10px] text-amber-400 font-bold block mt-1">
                        🏢 Persona Moral (Aplica Retención ISR 1.25% RESICO)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Código Postal Fiscal (5 dígitos) *
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="68000"
                      value={cp}
                      onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nombre / Razón Social (Exacto sin régimen de capital) *
                  </label>
                  <input
                    type="text"
                    placeholder="EMPRESA O NOMBRE COMPLETO EN MAYÚSCULAS"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Régimen Fiscal (SAT) *
                    </label>
                    <select
                      value={regimen}
                      onChange={(e) => setRegimen(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                      <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                      <option value="606">606 - Arrendamiento</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="621">621 - Incorporación Fiscal (RIF)</option>
                      <option value="625">625 - Plataformas Digitales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                      <option value="616">616 - Sin obligaciones fiscales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Uso del CFDI *
                    </label>
                    <select
                      value={usoCfdi}
                      onChange={(e) => setUsoCfdi(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="G01">G01 - Adquisición de mercancías</option>
                      <option value="S01">S01 - Sin efectos fiscales</option>
                      <option value="CP01">CP01 - Pagos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Forma de Pago *
                    </label>
                    <select
                      value={formaPago}
                      onChange={(e) => setFormaPago(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="01">01 - Efectivo</option>
                      <option value="03">03 - Transferencia electrónica de fondos</option>
                      <option value="04">04 - Tarjeta de crédito</option>
                      <option value="28">28 - Tarjeta de débito</option>
                      <option value="99">99 - Por definir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Correo de Envío (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="cliente@ejemplo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {!loading && step === 2 && draftResult && (
              <div className="space-y-4 mt-2">
                <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Pre-Factura Folio #{draftResult.folio} (Serie {draftResult.serie || 'A'})
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      Borrador No Timbrado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Receptor:</span>
                      <strong className="text-white">{nombre}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">RFC / C.P.:</span>
                      <strong className="font-mono text-white">{rfc}</strong> (C.P. {cp})
                    </div>
                  </div>

                  {draftResult.desglose && (
                    <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold text-white">${draftResult.desglose.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>IVA Trasladado (16%):</span>
                        <span className="font-mono font-bold text-white">+${draftResult.desglose.iva.toFixed(2)}</span>
                      </div>
                      {draftResult.desglose.retencion_isr > 0 && (
                        <div className="flex justify-between text-amber-400">
                          <span>Retención ISR RESICO (1.25%):</span>
                          <span className="font-mono font-bold">-${draftResult.desglose.retencion_isr.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-emerald-400 pt-1 border-t border-slate-700">
                        <span>Total Factura:</span>
                        <span className="font-mono font-bold">${draftResult.desglose.total.toFixed(2)} MXN</span>
                      </div>
                    </div>
                  )}

                  {draftResult.pdfUrl && (
                    <div className="pt-2">
                      <a
                        href={draftResult.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Vista Previa del PDF Borrador</span>
                      </a>
                    </div>
                  )}
                </div>

                {stampError && (
                  <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{stampError.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{stampError.explanation}</p>
                    <div className="p-2.5 bg-slate-900/60 rounded-xl text-[10.5px] text-amber-300 border border-amber-500/20">
                      💡 <strong>Sugerencia:</strong> {stampError.tip}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && step === 3 && stampedResult && (
              <div className="space-y-4 my-4 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 text-3xl">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">¡Factura Timbrada con Éxito!</h3>
                  <p className="text-xs text-slate-400 mt-1">Folio Oficial #{stampedResult.folio}</p>
                </div>

                <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-left space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Folio Fiscal (UUID SAT):</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 break-all">{stampedResult.uuid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Receptor:</span>
                    <span className="text-xs text-slate-200 font-bold">{nombre} ({rfc})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {stampedResult.pdfUrl && (
                    <a
                      href={stampedResult.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ver PDF Oficial</span>
                    </a>
                  )}
                  {stampedResult.xmlUrl && (
                    <a
                      href={stampedResult.xmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Descargar XML 4.0</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            {step === 1 && !loading && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition text-xs cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleGenerarBorrador}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Generar Pre-Factura (Borrador) ➔</span>
                </button>
              </div>
            )}

            {step === 2 && !loading && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleDescartarBorrador}
                  className="flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold py-3 px-4 rounded-xl transition text-xs cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Descartar y Liberar Folio</span>
                </button>

                {stampError && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Corregir Datos</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleTimbrar}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Timbrar SAT</span>
                </button>
              </div>
            )}

            {step === 3 && !loading && (
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-xs cursor-pointer"
              >
                Cerrar Ventana de Facturación
              </button>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
