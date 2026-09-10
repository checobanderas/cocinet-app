import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import {
  closeOutline,
  logoWhatsapp,
  paperPlaneOutline,
  copyOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  settingsOutline,
  personOutline,
  addCircleOutline
} from 'ionicons/icons';
import {
  sendSilentWhatsAppMessage,
  getWhatsAppCloudConfig
} from '../../utils/whatsappCloud';

export interface WhatsAppRecipient {
  name: string;
  phone: string;
  role?: string;
}

interface WhatsAppCorteModalProps {
  isOpen: boolean;
  onClose: () => void;
  corteText: string;
  businessName?: string;
  recipients?: WhatsAppRecipient[];
  triggerAppNotification?: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onOpenApiConfig?: () => void;
}

export const WhatsAppCorteModal: React.FC<WhatsAppCorteModalProps> = ({
  isOpen,
  onClose,
  corteText,
  businessName = "COCINET",
  recipients = [],
  triggerAppNotification,
  onOpenApiConfig
}) => {
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [isSendingSilent, setIsSendingSilent] = useState<boolean>(false);
  const [silentStatus, setSilentStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
    details?: string;
  }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

  // Inicializar destinatario seleccionado
  useEffect(() => {
    if (isOpen) {
      setSilentStatus({ type: 'idle', message: '' });
      setCopied(false);
      if (recipients.length > 0) {
        setSelectedPhone(recipients[0].phone);
      } else {
        const savedPhone = localStorage.getItem('cocinet_last_corte_whatsapp_phone') || '';
        setSelectedPhone(savedPhone);
        setCustomPhone(savedPhone);
      }
    }
  }, [isOpen, recipients]);

  const effectivePhone = (selectedPhone === 'custom' ? customPhone : (selectedPhone || customPhone)).replace(/\D/g, '');

  const getCleanMexicoPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('52')) return digits.slice(2);
    if (digits.length === 13 && digits.startsWith('521')) return digits.slice(3);
    return digits;
  };

  const finalPhone = getCleanMexicoPhone(effectivePhone);

  const encodedText = encodeURIComponent(corteText);
  const waUrl = finalPhone
    ? `https://wa.me/52${finalPhone}?text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  const handleCopyText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(corteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      if (triggerAppNotification) {
        triggerAppNotification('Corte Copiado 📋', 'El reporte completo fue copiado al portapapeles.', 'success');
      }
    }
  };

  const handleSendSilent = async () => {
    if (!finalPhone || finalPhone.length < 10) {
      setSilentStatus({
        type: 'error',
        message: 'Por favor ingresa un número de teléfono válido de 10 dígitos.'
      });
      return;
    }

    // Guardar último teléfono usado
    localStorage.setItem('cocinet_last_corte_whatsapp_phone', finalPhone);

    setIsSendingSilent(true);
    setSilentStatus({ type: 'idle', message: 'Enviando corte en segundo plano...' });

    try {
      const res = await sendSilentWhatsAppMessage(finalPhone, corteText);
      setIsSendingSilent(false);

      if (res.success) {
        setSilentStatus({
          type: 'success',
          message: `¡Corte entregado por WhatsApp con éxito a ${finalPhone}! 🚀✅`,
          details: `ID de Entrega: ${res.messageId || 'OK'}`
        });
        if (triggerAppNotification) {
          triggerAppNotification(
            'WhatsApp Entregado ✅',
            `El corte fue enviado a ${finalPhone} con éxito.`,
            'success'
          );
        }
      } else {
        setSilentStatus({
          type: 'error',
          message: `No se pudo entregar por la API en segundo plano (${res.error || 'Fallo de conexión'}).`,
          details: 'Puedes usar el botón verde "Abrir WhatsApp Web / App" aquí abajo para enviarlo de inmediato con un solo clic.'
        });
      }
    } catch (err: any) {
      setIsSendingSilent(false);
      setSilentStatus({
        type: 'error',
        message: `Error al conectar con el servicio de WhatsApp: ${err.message || String(err)}`,
        details: 'Usa el botón verde de WhatsApp Web / App para enviarlo directamente.'
      });
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{
        '--width': '95%',
        '--max-width': '620px',
        '--height': '85%',
        '--border-radius': '24px',
      }}
    >
      <IonHeader>
        <IonToolbar style={{ '--background': '#0f172a', '--color': 'white' }}>
          <div className="flex items-center gap-2 px-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-xl">
              <IonIcon icon={logoWhatsapp} />
            </div>
            <div>
              <IonTitle style={{ fontSize: '1.1rem', fontWeight: 800, padding: 0 }}>
                Enviar Corte por WhatsApp
              </IonTitle>
              <div className="text-xs text-slate-400 font-medium">
                {businessName} • Resumen Oficial de Caja
              </div>
            </div>
          </div>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#94a3b8' }}>
              <IonIcon icon={closeOutline} className="text-2xl" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#0b1329', '--color': '#f8fafc' }} className="ion-padding">
        <div className="space-y-4 text-slate-200">
          
          {/* 1. SELECCIÓN DE DESTINATARIO */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              📱 Destinatario del Corte:
            </label>

            {recipients.length > 0 ? (
              <div className="space-y-2 mb-3">
                {recipients.map((r, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPhone === r.phone
                        ? 'bg-green-500/10 border-green-500 text-green-400 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="whatsapp_recipient"
                        value={r.phone}
                        checked={selectedPhone === r.phone}
                        onChange={() => setSelectedPhone(r.phone)}
                        className="accent-green-500"
                      />
                      <div>
                        <div className="text-sm font-semibold">{r.name}</div>
                        <div className="text-xs text-slate-400">{r.role || 'Administrador'}</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      {r.phone}
                    </div>
                  </label>
                ))}

                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPhone === 'custom'
                      ? 'bg-green-500/10 border-green-500 text-green-400 font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="whatsapp_recipient"
                      value="custom"
                      checked={selectedPhone === 'custom'}
                      onChange={() => setSelectedPhone('custom')}
                      className="accent-green-500"
                    />
                    <span className="text-sm">Otro número de teléfono</span>
                  </div>
                  <IonIcon icon={addCircleOutline} className="text-lg text-slate-400" />
                </label>
              </div>
            ) : null}

            {/* Input para número personalizado o cuando no hay usuarios predeterminados */}
            {(recipients.length === 0 || selectedPhone === 'custom') && (
              <div className="mt-2">
                <div className="text-xs text-slate-400 mb-1 font-medium">
                  Escribe el número de celular (10 dígitos con lada):
                </div>
                <div className="flex items-center gap-2 bg-slate-950 rounded-xl border border-slate-700 px-3 py-2">
                  <span className="text-slate-500 font-mono text-sm font-bold">🇲🇽 +52</span>
                  <input
                    type="tel"
                    placeholder="Ej. 9511234567"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full bg-transparent text-white font-mono text-sm outline-none placeholder:text-slate-600"
                    maxLength={13}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ESTADO DEL ENVÍO SILENCIOSO */}
          {silentStatus.type !== 'idle' && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-sm ${
                silentStatus.type === 'success'
                  ? 'bg-green-950/40 border-green-500/40 text-green-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <IonIcon
                icon={silentStatus.type === 'success' ? checkmarkCircleOutline : alertCircleOutline}
                className="text-xl shrink-0 mt-0.5"
              />
              <div className="space-y-1">
                <div className="font-bold">{silentStatus.message}</div>
                {silentStatus.details && (
                  <div className="text-xs opacity-90">{silentStatus.details}</div>
                )}
              </div>
            </div>
          )}

          {/* 2. BOTONES DE ACCIÓN PRINCIPALES */}
          <div className="space-y-2.5">
            {/* OPCIÓN 1: ABRIR WHATSAPP DIRECTAMENTE */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (finalPhone) {
                  localStorage.setItem('cocinet_last_corte_whatsapp_phone', finalPhone);
                }
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-slate-950 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/25 transition-all text-sm no-underline cursor-pointer active:scale-[0.98]"
            >
              <IonIcon icon={logoWhatsapp} className="text-2xl" />
              <span>Abrir en WhatsApp (Web / Celular) 📲</span>
            </a>

            {/* OPCIÓN 2: ENVÍO SILENCIOSO EN SEGUNDO PLANO */}
            <button
              type="button"
              disabled={isSendingSilent}
              onClick={handleSendSilent}
              className="w-full bg-slate-800 hover:bg-slate-700/80 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              {isSendingSilent ? (
                <>
                  <IonSpinner name="crescent" className="w-4 h-4 text-green-400" />
                  <span>Enviando por API Silenciosa...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={paperPlaneOutline} className="text-lg text-green-400" />
                  <span>Enviar Silencioso en 2do Plano (Meta / UltraMsg)</span>
                </>
              )}
            </button>
          </div>

          {/* 3. ACCIONES SECUNDARIAS */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyText}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-800 text-xs transition-all cursor-pointer"
            >
              <IonIcon icon={copied ? checkmarkCircleOutline : copyOutline} className={copied ? "text-green-400 text-base" : "text-base"} />
              <span>{copied ? '¡Copiado! 📋' : 'Copiar Reporte'}</span>
            </button>

            {onOpenApiConfig && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApiConfig();
                }}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-800 text-xs transition-all cursor-pointer"
              >
                <IonIcon icon={settingsOutline} className="text-base text-amber-400" />
                <span>Configurar API ⚙️</span>
              </button>
            )}
          </div>

          {/* VISTA PREVIA DEL CORTE */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Vista previa del mensaje a enviar:
            </div>
            <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto bg-slate-900/50 p-2 rounded-lg border border-slate-800/40 select-all">
              {corteText}
            </pre>
          </div>

        </div>
      </IonContent>
    </IonModal>
  );
};
