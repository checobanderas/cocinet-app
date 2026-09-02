import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { closeOutline, settingsOutline } from 'ionicons/icons';
import { formatMexicoPhone } from '../../utils/appHelpers';
import { requestFCMToken, triggerDeviceNotification } from '../../utils/fcm';
import { getWhatsAppCloudConfig, sendSilentWhatsAppMessage } from '../../utils/whatsappCloud';

interface TenantUsersModalProps {
  showTenantUsersModal: boolean;
  setShowTenantUsersModal: (v: boolean) => void;
  modalTenant: any;
  modalUsers: any[];
  handleAddRow: () => void;
  handleCellChange: (index: number, field: string, value: string) => void;
  handleDeleteRow: (index: number) => void;
  revealedPins: Record<number, boolean>;
  setRevealedPins: (v: Record<number, boolean> | ((prev: Record<number, boolean>) => Record<number, boolean>)) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const TenantUsersModal: React.FC<TenantUsersModalProps> = ({
  showTenantUsersModal,
  setShowTenantUsersModal,
  modalTenant,
  modalUsers,
  handleAddRow,
  handleCellChange,
  handleDeleteRow,
  revealedPins,
  setRevealedPins,
  triggerAppNotification
}) => {
    const [showWhatsAppPanel, setShowWhatsAppPanel] = useState(false);
    const [provider, setProvider] = useState<any>('ultramsg');
    const [instanceId, setInstanceId] = useState('instance190130');
    const [token, setToken] = useState('ayi9d3764t8h8t7s');
    const [phoneNumberId, setPhoneNumberId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [testPhone, setTestPhone] = useState('9511273796');
    const [showToken, setShowToken] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);

    React.useEffect(() => {
      const cfg = getWhatsAppCloudConfig();
      if (cfg) {
        setProvider(cfg.provider || 'ultramsg');
        setInstanceId(cfg.instanceId || 'instance190130');
        setToken(cfg.token || '');
        setPhoneNumberId(cfg.phoneNumberId || '');
        setAccessToken(cfg.accessToken || '');
      }
    }, [showTenantUsersModal]);

    const handleSaveConfig = () => {
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
      triggerAppNotification('Configuración Guardada 💾', 'Credenciales de WhatsApp guardadas con éxito.', 'success');
    };

    const handleTestSilentSendDirect = async () => {
      if (provider === 'ultramsg' && (!instanceId.trim() || !token.trim())) {
        triggerAppNotification('Faltan Credenciales ⚠️', 'Ingresa tu Instance ID y Token de UltraMsg.', 'warning');
        return;
      }
      if (!testPhone.trim()) {
        triggerAppNotification('Teléfono Requerido 📱', 'Ingresa un número celular para probar.', 'warning');
        return;
      }

      setIsSendingTest(true);
      handleSaveConfig();

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

      setIsSendingTest(false);

      if (result.success) {
        triggerAppNotification(
          '¡WhatsApp Silencioso Entregado! ✅🚀',
          `Mensaje entregado con éxito a +52 ${testPhone} (ID: ${result.messageId}).`,
          'success'
        );
      } else {
        triggerAppNotification('Error al Enviar ❌', result.error || 'Verifica tus credenciales.', 'error');
      }
    };

    const cycleAvatar = (userId: string, currentAvatar: string) => {
      const avatars = [
        "fa-solid fa-person-walking",
        "fa-solid fa-person-running",
        "fa-solid fa-bell-concierge",
        "fa-solid fa-cash-register",
        "fa-solid fa-user-tie",
        "fa-solid fa-user-shield",
        "fa-solid fa-hat-cowboy",
        "fa-solid fa-laptop-code"
      ];
      const index = avatars.indexOf(currentAvatar);
      const nextIndex = (index + 1) % avatars.length;
      handleCellChange(userId, "avatar", avatars[nextIndex], modalTenant?.id);
    };

    const handleSendTestCorteWA = async (user: any) => {
      const phoneTarget = formatMexicoPhone(user.phone || "");
      if (!phoneTarget) {
        triggerAppNotification("Teléfono Faltante 📱", `El usuario ${user.name} no tiene registrado un número celular de 10 dígitos.`, "warning");
        return;
      }

      const text = `📊 *REPORTE DE CORTE DE CAJA (PRUEBA)*\n` +
        `🏪 *${(modalTenant?.name || "COCINET").toUpperCase()}*\n` +
        `📍 Sucursal: ${modalTenant?.sucursalDefault || "Matriz"}\n` +
        `👤 Destinatario: ${user.name} (${user.role.toUpperCase()})\n` +
        `⏰ Horario Programado: ${user.reportSchedule || "Al Cerrar Turno 🔒"}\n` +
        `-----------------------------------------\n` +
        `🟢 *VENTAS TOTALES DEL TURNO:* $0.00\n` +
        `💰 *EFECTIVO EN CAJA:* $0.00\n` +
        `🧾 Cuentas Cobradas: 0\n` +
        `-----------------------------------------\n` +
        `📎 Archivo Excel: [Reporte_Diario_${(modalTenant?.name || "Cocinet").replace(/\s+/g, "_")}.xlsx]\n` +
        `✨ _Prueba de envío automático configurada correctamente (Lada +52)._`;

      const metaConfig = getWhatsAppCloudConfig();
      if ((metaConfig.instanceId && metaConfig.token) || (metaConfig.phoneNumberId && metaConfig.accessToken)) {
        triggerAppNotification("Enviando WhatsApp Silencioso 🚀", `Enviando reporte en segundo plano a ${user.name}...`, "info");
        const res = await sendSilentWhatsAppMessage(user.phone, text);
        if (res.success) {
          triggerAppNotification("WhatsApp Silencioso Entregado ✅🚀", `Reporte entregado en segundo plano a +52 ${user.phone}.`, "success");
          return;
        } else {
          console.warn("Fallo silent send:", res.error);
          triggerAppNotification("Error API ⚠️", `No se pudo enviar en segundo plano: ${res.error}`, "warning");
        }
      }

      const encoded = encodeURIComponent(text);
      const waUrl = `https://wa.me/${phoneTarget}?text=${encoded}`;
      window.open(waUrl, "_blank");
      triggerAppNotification("WhatsApp Preparado 📲", `Corte de prueba preparado para ${user.name} (+52 ${user.phone || ""}).`, "success");
    };

    const handleSendDirectWA = async (user: any) => {
      const phoneTarget = formatMexicoPhone(user.phone || "");
      if (!phoneTarget) {
        triggerAppNotification("Teléfono Faltante 📱", `El usuario ${user.name} no tiene registrado un número celular.`, "warning");
        return;
      }
      const msg = `Hola ${user.name}! Mensaje operativo de Cocinet Pro:\n\nTu acceso a la sucursal ${modalTenant?.name || ''} está activo.`;

      const metaConfig = getWhatsAppCloudConfig();
      if ((metaConfig.instanceId && metaConfig.token) || (metaConfig.phoneNumberId && metaConfig.accessToken)) {
        const res = await sendSilentWhatsAppMessage(user.phone, msg);
        if (res.success) {
          triggerAppNotification("Aviso Entregado ✅", `Mensaje silencioso enviado al WhatsApp de ${user.name}.`, "success");
          return;
        }
      }

      const encoded = encodeURIComponent(msg);
      const waUrl = `https://wa.me/${phoneTarget}?text=${encoded}`;
      window.open(waUrl, "_blank");
    };

    const handleSendCloudPush = async (user: any, isCorte: boolean) => {
      let token = user.fcmToken;
      if (!token) {
        token = await requestFCMToken();
        if (token) {
          handleCellChange(user.id, "fcmToken", token, modalTenant?.id);
        }
      }

      const title = isCorte
        ? `📊 Corte Diario • ${modalTenant?.name || 'Cocinet'}`
        : `💬 Mensaje Directo • ${modalTenant?.name || 'Cocinet'}`;
      const body = isCorte
        ? `Hola ${user.name}! Tu corte programado (${user.reportSchedule || 'Al Cierre'}) está listo: Venta $0.00, Efectivo $0.00.`
        : `Hola ${user.name}! Notificación operativa enviada a tu dispositivo.`;

      triggerDeviceNotification(title, body);

      if (isCorte) {
        triggerAppNotification(
          "🔔 Cloud Messaging Push 🚀",
          `Notificación enviada al dispositivo de ${user.name} (${user.role}). Revisa tu barra de notificaciones.`,
          "success"
        );
      } else {
        triggerAppNotification(
          "🔔 Cloud Messaging Push 📲",
          `Aviso operativo enviado al dispositivo de ${user.name}.`,
          "info"
        );
      }
    };

    return (
      <IonModal
        isOpen={showTenantUsersModal}
        onDidDismiss={() => setShowTenantUsersModal(false)}
        style={{
          "--height": "100%",
          "--width": "100%",
          "--max-height": "92vh",
          "--max-width": "1250px",
          "--border-radius": "24px",
        }}
      >
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "#fff", padding: "8px 16px" }}>
            <IonTitle style={{ fontSize: "1.2rem", fontWeight: "900", color: "#1e293b", paddingLeft: "0" }}>
              👥 Accesos, PINs y Reportes: {modalTenant?.name || ''}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowTenantUsersModal(false)} color="dark">
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="space-y-6 max-w-6xl mx-auto pb-12 text-left">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div>
                <h4 className="text-sm font-black text-slate-800 m-0">Gestión de Empleados, Teléfonos y Reportes</h4>
                <p className="text-[11px] text-slate-500 font-bold m-0">
                  Configura PINs de acceso, teléfonos celulares (Lada +52 automática), horarios de envío y pruebas Push.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppPanel(!showWhatsAppPanel)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl transition duration-200 flex items-center gap-1.5 text-xs shadow-md shadow-emerald-200 border-none cursor-pointer"
                  title="Configurar WhatsApp Silencioso (UltraMsg / Meta)"
                >
                  <i className="fa-brands fa-whatsapp text-[13px]" />
                  <span>{showWhatsAppPanel ? '▲ Ocultar Config WhatsApp' : '⚙️ Configurar WhatsApp Silencioso'}</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const token = await requestFCMToken();
                    if (token) {
                      triggerAppNotification("Dispositivo Vinculado 🔔✅", "Este dispositivo / navegador quedó registrado para recibir alertas Push de Cocinet.", "success");
                    } else {
                      triggerAppNotification("Aviso ⚠️", "Permiso de notificaciones no concedido o no soportado en esta ventana.", "warning");
                    }
                  }}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl transition duration-200 flex items-center gap-1.5 text-xs shadow-md border-none cursor-pointer"
                >
                  <i className="fa-solid fa-bell text-[11px]" />
                  <span>Activar Notificaciones Push</span>
                </button>
                <button
                  onClick={() => handleAddRow(modalTenant.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl transition duration-200 flex items-center gap-1.5 text-xs shadow-md shadow-indigo-200 border-none cursor-pointer"
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                  Agregar Fila
                </button>
              </div>
            </div>

            {/* Panel Desplegable de Configuración de WhatsApp */}
            {showWhatsAppPanel && (
              <div className="bg-white border-2 border-emerald-500/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
                      <i className="fa-brands fa-whatsapp" />
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 m-0">⚙️ Configuración de WhatsApp Silencioso (Segundo Plano)</h4>
                      <p className="text-[11px] text-slate-500 m-0 font-medium">Conecta UltraMsg por código QR o Meta Cloud API para enviar cortes automáticos sin abrir WhatsApp Web.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppPanel(false)}
                    className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg border-none cursor-pointer"
                  >
                    <IonIcon icon={closeOutline} />
                  </button>
                </div>

                {/* Selector de Proveedor */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 max-w-md">
                  <button
                    type="button"
                    onClick={() => setProvider('ultramsg')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                      provider === 'ultramsg' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-transparent text-slate-600'
                    }`}
                  >
                    <span>⚡ UltraMsg (Por Código QR)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('meta')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                      provider === 'meta' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-slate-600'
                    }`}
                  >
                    <span>🏢 Meta Cloud API</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider === 'ultramsg' ? (
                    <>
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          Instance ID (Identificador de Instancia) 🆔:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: instance190130"
                          value={instanceId}
                          onChange={(e) => setInstanceId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-black text-slate-700">Token Secreto de UltraMsg 🔑:</label>
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
                          placeholder="Ej: ayi9d3764t8h8t7s..."
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">Phone Number ID de Meta 🆔:</label>
                        <input
                          type="text"
                          placeholder="Ej: 104582910482910"
                          value={phoneNumberId}
                          onChange={(e) => setPhoneNumberId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">Access Token de Meta (Bearer) 🔑:</label>
                        <input
                          type="password"
                          placeholder="EAABw..."
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Fila de Prueba y Guardado */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-black text-slate-700 shrink-0">Celular de Prueba:</span>
                    <div className="relative flex-1 sm:w-48">
                      <span className="absolute left-2.5 top-2 text-xs font-black text-slate-400 font-mono">+52</span>
                      <input
                        type="tel"
                        placeholder="9511273796"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-2 py-1.5 text-xs font-mono text-slate-800 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTestSilentSendDirect}
                      disabled={isSendingTest}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition border-none cursor-pointer shadow-md shadow-emerald-200 shrink-0"
                    >
                      <i className="fa-brands fa-whatsapp text-xs" />
                      <span>{isSendingTest ? 'Enviando...' : 'Probar Envío 🚀'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveConfig();
                      setShowWhatsAppPanel(false);
                    }}
                    className="bg-slate-900 hover:bg-black text-white font-bold py-2 px-5 rounded-xl text-xs transition border-none cursor-pointer shadow-md"
                  >
                    Guardar y Cerrar 💾
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-600 min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-200 font-bold text-[11px]">
                      <th className="py-2.5 px-2.5 w-[50px] text-center">Avatar</th>
                      <th className="py-2.5 px-2.5 w-[85px]">ID Acceso</th>
                      <th className="py-2.5 px-2.5">Nombre Completo</th>
                      <th className="py-2.5 px-2.5 w-[85px]">Rol</th>
                      <th className="py-2.5 px-2.5 w-[100px]">PIN Acceso 🔑</th>
                      <th className="py-2.5 px-2.5 w-[125px]">Teléfono 📱</th>
                      <th className="py-2.5 px-2.5 w-[135px]">Horario Reporte ⏰</th>
                      <th className="py-2.5 px-2.5 w-[185px] text-center">Prueba de Envío 🚀</th>
                      <th className="py-2.5 px-2.5 w-[160px] text-center">Compartir Acceso</th>
                      <th className="py-2.5 px-2.5 w-[65px] text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {modalUsers.map((user) => {
                      const isProtected = user.id.endsWith("-admin") || user.id.endsWith("-sistemas") || user.id.endsWith("-manager");
                      
                      let roleLabel = user.id;
                      if (user.id.endsWith("-admin")) roleLabel = "propietario";
                      else if (user.id.endsWith("-manager")) roleLabel = "gerente";
                      else if (user.id.endsWith("-sistemas")) roleLabel = "sistemas";
                      else if (user.id.endsWith("-cajero-1")) roleLabel = "cajero1";
                      else if (user.id.endsWith("-cajero-2")) roleLabel = "cajero2";
                      else if (user.id.endsWith("-mesero-main")) roleLabel = "mesero1";
                      else if (user.id.endsWith("-mesero-1")) roleLabel = "mesero2";
                      else if (user.id.endsWith("-mesero-2")) roleLabel = "mesero3";
                      
                      const link = `${window.location.origin}${window.location.pathname}?tenant=${modalTenant.id}&token=${roleLabel}${roleLabel === "propietario" ? `&owner=${modalTenant.ownerKey}` : ""}`;
                      
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Avatar */}
                          <td className="py-2 px-2.5 text-center">
                            <button
                              onClick={() => cycleAvatar(user.id, user.avatar)}
                              className="w-8 h-8 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center text-sm hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                              title="Cambiar avatar"
                            >
                              <i className={user.avatar || "fa-solid fa-user"} />
                            </button>
                          </td>

                          {/* ID (Read-only) */}
                          <td className="py-2 px-2.5 font-mono text-[10px] text-slate-400 select-all font-bold">
                            {user.id.replace(`${user.tenantId}-`, "")}
                          </td>

                          {/* Name Input */}
                          <td className="py-2 px-2.5">
                            <input
                              type="text"
                              defaultValue={user.name}
                              onBlur={(e) => {
                                if (e.target.value.trim() && e.target.value.trim() !== user.name) {
                                  handleCellChange(user.id, "name", e.target.value.trim(), modalTenant.id);
                                }
                              }}
                              className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border border-transparent focus:border-indigo-500 rounded px-1.5 py-0.5 text-slate-800 font-semibold outline-none transition text-xs"
                            />
                          </td>

                          {/* Role Select */}
                          <td className="py-2 px-2.5">
                            <select
                              value={user.role}
                              onChange={(e) => handleCellChange(user.id, "role", e.target.value, modalTenant.id)}
                              className="w-full bg-transparent hover:bg-slate-100/50 focus:bg-white border border-transparent focus:border-indigo-500 rounded px-1.5 py-0.5 text-slate-800 font-semibold outline-none cursor-pointer text-xs"
                            >
                              <option value="mesero">Mesero 🏃</option>
                              <option value="cajero">Cajero 💵</option>
                              <option value="admin">Admin 👔</option>
                            </select>
                          </td>

                          {/* PIN Input */}
                          <td className="py-2 px-2.5">
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:bg-white rounded px-1.5 py-0.5 transition-all w-[90px]">
                              <input
                                type={revealedPins[user.id] ? "text" : "password"}
                                maxLength={4}
                                defaultValue={user.pin}
                                onClick={() => {
                                  setRevealedPins(prev => ({ ...prev, [user.id]: true }));
                                }}
                                onFocus={() => {
                                  setRevealedPins(prev => ({ ...prev, [user.id]: true }));
                                }}
                                onBlur={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  if (val.length === 4 && val !== user.pin) {
                                    handleCellChange(user.id, "pin", val, modalTenant.id);
                                  } else if (val !== user.pin) {
                                    e.target.value = user.pin; // Revert
                                    triggerAppNotification("⚠️ Error", "El PIN debe tener exactamente 4 dígitos.", "warning");
                                  }
                                }}
                                className="w-10 bg-transparent text-slate-800 font-mono font-black text-center outline-none border-none text-[12px] tracking-widest placeholder-slate-300"
                                placeholder="0000"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRevealedPins(prev => ({ ...prev, [user.id]: !prev[user.id] }));
                                }}
                                className="p-0.5 hover:bg-slate-200/60 text-slate-400 hover:text-indigo-600 rounded cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0 ml-auto"
                                title={revealedPins[user.id] ? "Ocultar PIN" : "Mostrar PIN"}
                              >
                                <i className={`fa-solid ${revealedPins[user.id] ? "fa-eye-slash" : "fa-eye"} text-[10px]`} />
                              </button>
                            </div>
                          </td>

                          {/* Teléfono (WhatsApp) */}
                          <td className="py-2 px-2.5">
                            <input
                              type="tel"
                              placeholder="Ej: 9511234567"
                              defaultValue={user.phone || ""}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (user.phone || "")) {
                                  handleCellChange(user.id, "phone", val, modalTenant.id);
                                }
                              }}
                              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px] outline-none transition"
                            />
                          </td>

                          {/* Horario de Envío */}
                          <td className="py-2 px-2.5">
                            {isProtected ? (
                              <select
                                value={user.reportSchedule || "Al Cerrar Turno 🔒"}
                                onChange={(e) => handleCellChange(user.id, "reportSchedule", e.target.value, modalTenant.id)}
                                className="w-full bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 border border-indigo-200/80 rounded px-1.5 py-1 font-bold outline-none cursor-pointer text-[10px]"
                              >
                                <option value="Al Cerrar Turno 🔒">Al Cierre 🔒</option>
                                <option value="01:00 AM 🌙">01:00 AM 🌙</option>
                                <option value="01:30 AM 🌙">01:30 AM 🌙</option>
                                <option value="02:00 AM 🌙">02:00 AM 🌙</option>
                                <option value="02:30 AM 🌙">02:30 AM 🌙</option>
                                <option value="03:00 AM 🌙">03:00 AM 🌙</option>
                                <option value="04:00 AM 🌙">04:00 AM 🌙</option>
                                <option value="05:00 AM 🌅">05:00 AM 🌅</option>
                                <option value="Desactivado ❌">Desactivado ❌</option>
                              </select>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block text-center">
                                Solo Avisos 🛡️
                              </span>
                            )}
                          </td>

                          {/* Prueba de Envío */}
                          <td className="py-2 px-2.5 text-center">
                            {isProtected ? (
                              <div className="flex justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSendTestCorteWA(user)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black flex items-center gap-1 cursor-pointer transition border-none shadow-xs"
                                  title="Enviar Corte por WhatsApp a este usuario"
                                >
                                  <span>📊💬 WA Corte</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendCloudPush(user, true)}
                                  className="px-2 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-[10px] font-black flex items-center gap-1 cursor-pointer transition border-none shadow-xs"
                                  title="Enviar Notificación Cloud de Corte"
                                >
                                  <span>🔔📲 Cloud</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSendDirectWA(user)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  title="Enviar WhatsApp directo a este empleado"
                                >
                                  <span>💬 WA</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendCloudPush(user, false)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  title="Enviar Notificación Cloud directa a este empleado"
                                >
                                  <span>🔔 Push</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Enviar / Compartir Acceso */}
                          <td className="py-2 px-2.5">
                            <div className="flex justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  const rawPhone = (user.phone || "").replace(/\D/g, "");
                                  const phoneTarget = rawPhone ? (rawPhone.length === 10 ? `52${rawPhone}` : rawPhone) : "";
                                  const msg = encodeURIComponent(`Hola ${user.name}! Aquí tienes tu acceso directo de Cocinet Pro:\n\n${link}`);
                                  const waUrl = phoneTarget ? `https://wa.me/${phoneTarget}?text=${msg}` : `https://wa.me/?text=${msg}`;

                                  try {
                                    await navigator.clipboard.writeText(waUrl);
                                  } catch (err) {
                                    const textarea = document.createElement("textarea");
                                    textarea.value = waUrl;
                                    document.body.appendChild(textarea);
                                    textarea.select();
                                    document.execCommand("copy");
                                    document.body.removeChild(textarea);
                                  }

                                  triggerAppNotification(
                                    "📲 Enlace de WhatsApp Copiado",
                                    `URL de WhatsApp con acceso para ${user.name} copiada al portapapeles.`,
                                    "success"
                                  );
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border-none"
                                title="Copiar enlace de WhatsApp"
                              >
                                📋 Copiar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const rawPhone = (user.phone || "").replace(/\D/g, "");
                                  const phoneTarget = rawPhone ? (rawPhone.length === 10 ? `52${rawPhone}` : rawPhone) : "";
                                  const msg = encodeURIComponent(`Hola ${user.name}! Aquí tienes tu acceso directo de Cocinet Pro:\n\n${link}`);
                                  const waUrl = phoneTarget ? `https://wa.me/${phoneTarget}?text=${msg}` : `https://wa.me/?text=${msg}`;
                                  window.open(waUrl, "_blank");
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border-none"
                              >
                                🟢 WhatsApp
                              </button>
                            </div>
                          </td>

                          {/* Action (Delete) */}
                          <td className="py-2 px-2.5 text-center">
                            {isProtected ? (
                              <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                Fijo
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteRow(user.id, modalTenant.id)}
                                className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/50 w-6 h-6 rounded flex items-center justify-center transition mx-auto cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <i className="fa-solid fa-trash-can text-[10px]" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </IonContent>
      </IonModal>
    );
};
