import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { closeOutline, logoWhatsapp, qrCodeOutline } from 'ionicons/icons';
import { getWhatsAppCloudConfig, saveWhatsAppCloudConfig, sendSilentWhatsAppMessage, WhatsAppProvider } from '../../utils/whatsappCloud';

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
  const [provider, setProvider] = useState<WhatsAppProvider>('ultramsg');
  // UltraMsg
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  // Meta
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  
  const [testPhone, setTestPhone] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getWhatsAppCloudConfig();
      setProvider(config.provider || 'ultramsg');
      setInstanceId(config.instanceId || '');
      setToken(config.token || '');
      setPhoneNumberId(config.phoneNumberId || '');
      setAccessToken(config.accessToken || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    saveWhatsAppCloudConfig({
      provider,
      instanceId: instanceId.trim(),
      token: token.trim(),
      phoneNumberId: phoneNumberId.trim(),
      accessToken: accessToken.trim(),
      isEnabled: provider === 'ultramsg' 
        ? Boolean(instanceId.trim() && token.trim())
        : Boolean(phoneNumberId.trim() && accessToken.trim()),
    });
    triggerAppNotification('Configuración Guardada 💾', 'Las credenciales de WhatsApp fueron guardadas con éxito.', 'success');
  };

  const handleTestSilentSend = async () => {
    if (provider === 'ultramsg' && (!instanceId.trim() || !token.trim())) {
      triggerAppNotification('Faltan Credenciales ⚠️', 'Por favor ingresa tu Instance ID y Token de UltraMsg.', 'warning');
      return;
    }
    if (provider === 'meta' && (!phoneNumberId.trim() || !accessToken.trim())) {
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
      `🌮 *COCINET PRO: PRUEBA DE CORTE SILENCIOSO*\n\n¡Hola! El sistema de envío automático en segundo plano está funcionando al 100%. 🚀✨\n\n🟢 *Servicio:* ${provider.toUpperCase()}\n⏰ *Fecha:* ${new Date().toLocaleString('es-MX')}\n📊 *Estado:* Conexión Exitosa`,
      {
        provider,
        instanceId: instanceId.trim(),
        token: token.trim(),
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
      }
    );

    setIsSending(false);

    if (result.success) {
      triggerAppNotification(
        '¡WhatsApp Silencioso Entregado! ✅🚀',
        `El mensaje fue entregado a tu celular con éxito (ID: ${result.messageId}). Revisa tu WhatsApp.`,
        'success'
      );
    } else {
      triggerAppNotification('Error al Enviar ❌', result.error || 'Verifica tus credenciales.', 'error');
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{
        '--height': 'auto',
        '--max-height': '92vh',
        '--width': '95%',
        '--max-width': '650px',
        '--border-radius': '24px',
      }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#fff', padding: '8px 16px' }}>
          <IonTitle style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1e293b', paddingLeft: '0' }}>
            ⚙️ Configurar WhatsApp Silencioso (API)
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
          {/* Selector de Proveedor */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setProvider('ultramsg')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border-none cursor-pointer ${
                provider === 'ultramsg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <IonIcon icon={qrCodeOutline} />
              <span>UltraMsg (Por Código QR ⚡)</span>
            </button>
            <button
              type="button"
              onClick={() => setProvider('meta')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border-none cursor-pointer ${
                provider === 'meta'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <IonIcon icon={logoWhatsapp} />
              <span>Meta Cloud API (Oficial)</span>
            </button>
          </div>

          {provider === 'ultramsg' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg shrink-0">
                <IonIcon icon={qrCodeOutline} />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-950 m-0 uppercase tracking-wider">
                  UltraMsg: Conexión Instantánea por QR
                </h4>
                <p className="text-[11px] text-emerald-800 font-medium m-0 mt-0.5 leading-relaxed">
                  Solo copia el <strong>Instance ID</strong> y el <strong>Token</strong> de tu panel de UltraMsg tras escanear el QR con WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg shrink-0">
                <IonIcon icon={logoWhatsapp} />
              </div>
              <div>
                <h4 className="text-xs font-black text-indigo-950 m-0 uppercase tracking-wider">
                  Meta Cloud API Oficial
                </h4>
                <p className="text-[11px] text-indigo-800 font-medium m-0 mt-0.5 leading-relaxed">
                  Para cuentas con aplicación creada en developers.facebook.com.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            {provider === 'ultramsg' ? (
              <>
                {/* Instance ID */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Instance ID (Identificador de Instancia) 🆔:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: instance12345"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Lo encuentras en tu panel de UltraMsg como <strong>Instance ID</strong>.
                  </p>
                </div>

                {/* Token */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-black text-slate-700">
                      Token Secreto de UltraMsg 🔑:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-[10px] text-emerald-600 font-bold bg-transparent border-none cursor-pointer"
                    >
                      {showToken ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="Ej: a1b2c3d4e5..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Copia el Token que aparece en tu instancia de UltraMsg.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Phone Number ID */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Phone Number ID de Meta 🆔:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 104582910482910"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none transition"
                  />
                </div>

                {/* Access Token */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-black text-slate-700">
                      Access Token de Meta (Bearer Token) 🔑:
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
                </div>
              </>
            )}

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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-12 pr-3 py-2 text-xs font-mono text-slate-800 outline-none transition"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition border-none cursor-pointer shadow-md shadow-emerald-200"
            >
              Guardar Credenciales 💾
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
