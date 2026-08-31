import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { closeOutline, logoWhatsapp } from 'ionicons/icons';
import { getWhatsAppCloudConfig, saveWhatsAppCloudConfig, sendSilentWhatsAppMessage } from '../../utils/whatsappCloud';

interface MetaWhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerAppNotification: (title: string, msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const MetaWhatsAppConfigModal: React.FC<MetaWhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  triggerAppNotification,
}) => {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getWhatsAppCloudConfig();
      setPhoneNumberId(config.phoneNumberId || '');
      setAccessToken(config.accessToken || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    saveWhatsAppCloudConfig({
      phoneNumberId: phoneNumberId.trim(),
      accessToken: accessToken.trim(),
      isEnabled: Boolean(phoneNumberId.trim() && accessToken.trim()),
    });
    triggerAppNotification('Configuración Guardada 💾', 'Las credenciales de WhatsApp Cloud API de Meta fueron guardadas con éxito.', 'success');
  };

  const handleTestSilentSend = async () => {
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      triggerAppNotification('Faltan Credenciales ⚠️', 'Por favor ingresa tu Phone Number ID y Access Token de Meta.', 'warning');
      return;
    }

    if (!testPhone.trim()) {
      triggerAppNotification('Teléfono Requerido 📱', 'Ingresa un número de 10 dígitos para la prueba.', 'warning');
      return;
    }

    setIsSending(true);
    handleSave();

    const result = await sendSilentWhatsAppMessage(
      testPhone.trim(),
      `🌮 *COCINET PRO: PRUEBA DE WHATSAPP SILENCIOSO*\n\n¡Hola! Esta es una prueba de envío 100% automático en segundo plano a través de la API oficial de WhatsApp Cloud (Meta). 🚀✨\n\n_Fecha: ${new Date().toLocaleString('es-MX')}_`,
      {
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
      }
    );

    setIsSending(false);

    if (result.success) {
      triggerAppNotification(
        '¡Mensaje Enviado con Éxito! ✅🚀',
        `El WhatsApp silencioso fue entregado a tu teléfono (ID: ${result.messageId}). Revisa tu app de WhatsApp.`,
        'success'
      );
    } else {
      triggerAppNotification('Error al Enviar ❌', result.error || 'Verifica tu Token y Phone Number ID.', 'error');
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{
        '--height': 'auto',
        '--max-height': '90vh',
        '--width': '95%',
        '--max-width': '650px',
        '--border-radius': '24px',
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#fff', padding: '8px 16px' }}>
          <IonTitle style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1e293b', paddingLeft: '0' }}>
            ⚙️ Configurar WhatsApp Cloud API (Meta Oficial)
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} color="dark">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div className="space-y-4 max-w-xl mx-auto pb-6 text-left font-sans">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xl shrink-0">
              <IonIcon icon={logoWhatsapp} />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-950 m-0 uppercase tracking-wider">
                Envío 100% Silencioso en Segundo Plano
              </h4>
              <p className="text-[11px] text-emerald-800 font-medium m-0 mt-0.5 leading-relaxed">
                Con esta API de Meta, el sistema enviará los cortes de caja de forma invisible a los celulares de los dueños sin abrir WhatsApp Web ni requerir intervención manual.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Phone Number ID */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Identificador de Número de Teléfono (Phone Number ID) 🆔:
              </label>
              <input
                type="text"
                placeholder="Ej: 104582910482910"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Lo encuentras en: <em>developers.facebook.com &gt; Tu App &gt; WhatsApp &gt; API Setup</em>.
              </p>
            </div>

            {/* Access Token */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-black text-slate-700">
                  Token de Acceso de Meta (Bearer Token) 🔑:
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[10px] text-indigo-600 font-bold bg-transparent border-none cursor-pointer"
                >
                  {showToken ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="EAABw..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none transition resize-none ${
                  !showToken && accessToken ? 'blur-xs' : ''
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Token temporal (24h) o Token permanente de cuenta de sistema en Meta.
              </p>
            </div>

            {/* Test phone */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-700 mb-1">
                Número de Celular para Probar Envío (10 dígitos en México):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs font-black text-slate-400 font-mono">+52</span>
                  <input
                    type="tel"
                    placeholder="9511234567"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-12 pr-3 py-2 text-xs font-mono text-slate-800 outline-none transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTestSilentSend}
                  disabled={isSending}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition border-none cursor-pointer shadow-md shadow-emerald-200 shrink-0"
                >
                  <IonIcon icon={logoWhatsapp} />
                  <span>{isSending ? 'Enviando...' : 'Probar Envío 🚀'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                En etapa de prueba de Meta, debes registrar tu número en la lista de números autorizados en Meta Developers.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition border-none cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                handleSave();
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition border-none cursor-pointer shadow-md shadow-indigo-200"
            >
              Guardar Credenciales 💾
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
