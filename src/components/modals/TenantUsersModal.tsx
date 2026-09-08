import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { closeOutline, settingsOutline } from 'ionicons/icons';
import { formatMexicoPhone } from '../../utils/appHelpers';
import { requestFCMToken, triggerDeviceNotification, addNotificationDeliveryLog } from '../../utils/fcm';
import { getWhatsAppCloudConfig, saveWhatsAppCloudConfig, sendSilentWhatsAppMessage, GLOBAL_DEFAULT_PHONE_NUMBER_ID, GLOBAL_DEFAULT_ACCESS_TOKEN } from '../../utils/whatsappCloud';

interface TenantUsersModalProps {
  isInline?: boolean;
  showTenantUsersModal?: boolean;
  setShowTenantUsersModal?: (v: boolean) => void;
  modalTenant: any;
  modalUsers: any[];
  handleAddRow?: (tenantId?: string) => void;
  handleCellChange?: (userId: string, field: string, value: any, tenantId?: string) => void;
  handleDeleteRow?: (userId: string, tenantId?: string) => void;
  revealedPins?: Record<string, boolean>;
  setRevealedPins?: React.Dispatch<React.SetStateAction<Record<string, boolean>>> | ((v: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void);
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const TenantUsersModal: React.FC<TenantUsersModalProps> = ({
  isInline = false,
  showTenantUsersModal = true,
  setShowTenantUsersModal,
  modalTenant,
  modalUsers,
  handleAddRow,
  handleCellChange,
  handleDeleteRow,
  revealedPins: externalRevealedPins,
  setRevealedPins: externalSetRevealedPins,
  triggerAppNotification
}) => {
    const [localRevealedPins, setLocalRevealedPins] = useState<Record<string, boolean>>({});
    const revealedPins = externalRevealedPins || localRevealedPins;
    const setRevealedPins = externalSetRevealedPins || setLocalRevealedPins;

    const [showWhatsAppPanel, setShowWhatsAppPanel] = useState(false);
    const [provider, setProvider] = useState<any>('meta');
    const [instanceId, setInstanceId] = useState('');
    const [token, setToken] = useState('');
    const [phoneNumberId, setPhoneNumberId] = useState(GLOBAL_DEFAULT_PHONE_NUMBER_ID);
    const [accessToken, setAccessToken] = useState(GLOBAL_DEFAULT_ACCESS_TOKEN);
    const [testPhone, setTestPhone] = useState('9511273796');
    const [showToken, setShowToken] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);

    // Estados para Selección Múltiple y Envío de Mensajes Personalizados 📢💬
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [showCustomMessageModal, setShowCustomMessageModal] = useState(false);
    const [targetUsersForMessage, setTargetUsersForMessage] = useState<any[]>([]);
    const [customMessageTitle, setCustomMessageTitle] = useState('📢 Actualización de Sistema');
    const [customMessageBody, setCustomMessageBody] = useState('');
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

    const MESSAGE_TEMPLATES = [
      {
        id: 'update',
        name: '🚀 Actualización del Sistema',
        title: '🚀 Actualización de Cocinet Pro',
        body: `Hola {nombre}! 👋\n\nTe informamos que hemos implementado una nueva actualización en Cocinet Pro para la sucursal {sucursal} con mejoras importantes para tu turno.\n\nPor favor actualiza la página o reinicia tu turno para ver los cambios aplicados.\n\n¡Gracias por tu excelente labor! ✨`
      },
      {
        id: 'cajeros',
        name: '💵 Aviso a Cajeros',
        title: '💵 Aviso Importante para Cajeros',
        body: `Hola {nombre}! 💵\n\nRecordatorio operativo para caja en {sucursal}:\n• Registrar todas las compras y gastos antes del corte.\n• Verificar que el arqueo de efectivo coincida con el sistema.\n• Emitir el corte al finalizar tu jornada.\n\n¡Cualquier duda consulta a gerencia!`
      },
      {
        id: 'meseros',
        name: '🏃 Aviso a Meseros',
        title: '🏃 Aviso para Meseros / Servicio',
        body: `Hola {nombre}! 🏃\n\nRecordatorio de servicio en {sucursal}:\n• Confirmar el folio de comanda en cada pedido.\n• Notificar a tiempo cualquier cambio o aclaración de mesa.\n\n¡Excelente turno y buen servicio! 🍽️`
      },
      {
        id: 'credenciales',
        name: '🔑 Recordatorio de PIN y Acceso',
        title: '🔑 Acceso y PIN de Cocinet Pro',
        body: `Hola {nombre}! 👋\n\nTe compartimos tus credenciales de acceso a Cocinet Pro:\n🏪 *Sucursal:* {sucursal}\n👤 *Rol:* {rol}\n🔢 *Tu PIN de acceso:* *{pin}*\n\n🔗 *Enlace directo:*\n{enlace}\n\n⚠️ _No compartas tu contraseña por seguridad._`
      }
    ];

    React.useEffect(() => {
      const cfg = getWhatsAppCloudConfig();
      if (cfg) {
        setProvider(cfg.provider || 'meta');
        setInstanceId(cfg.instanceId || '');
        setToken(cfg.token || '');
        setPhoneNumberId(cfg.phoneNumberId || GLOBAL_DEFAULT_PHONE_NUMBER_ID);
        setAccessToken(cfg.accessToken || GLOBAL_DEFAULT_ACCESS_TOKEN);
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
      if (provider === 'meta' && (!phoneNumberId.trim() || !accessToken.trim())) {
        triggerAppNotification('Faltan Credenciales ⚠️', 'Ingresa tu Phone Number ID y Access Token de Meta.', 'warning');
        return;
      }
      if (!testPhone.trim()) {
        triggerAppNotification('Teléfono Requerido 📱', 'Ingresa un número celular para probar.', 'warning');
        return;
      }

      setIsSendingTest(true);
      handleSaveConfig();

      try {
        const result = await sendSilentWhatsAppMessage(
          testPhone.trim(),
          `🌮 *COCINET PRO: PRUEBA DE MENSAJE SILENCIOSO*\n\n¡Hola! El sistema de envío automático en segundo plano está funcionando al 100%. 🚀✨\n\n🟢 *Servicio:* ${provider.toUpperCase()}\n⏰ *Fecha:* ${new Date().toLocaleString('es-MX')}\n📊 *Estado:* Conexión Exitosa`,
          {
            provider,
            instanceId: instanceId.trim(),
            token: token.trim(),
            phoneNumberId: phoneNumberId.trim(),
            accessToken: accessToken.trim(),
          }
        );

        if (result.success) {
          triggerAppNotification(
            '¡WhatsApp Silencioso Entregado! ✅🚀',
            `Mensaje entregado con éxito a +52 ${testPhone} (ID: ${result.messageId}).`,
            'success'
          );
        } else {
          triggerAppNotification('Error al Enviar ❌', result.error || 'Verifica tus credenciales de WhatsApp.', 'error');
        }
      } catch (err: any) {
        triggerAppNotification('Error Inesperado ⚠️', err.message || 'Error al conectar con el servidor.', 'error');
      } finally {
        setIsSendingTest(false);
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
        `✨ _Prueba de envío silencioso en segundo plano configurada correctamente._`;

      triggerAppNotification("Enviando WhatsApp Silencioso 🚀", `Enviando reporte de prueba a ${user.name}...`, "info");
      const res = await sendSilentWhatsAppMessage(user.phone, text);

      addNotificationDeliveryLog({
        tenantId: modalTenant?.id || 'tenant-1',
        branchName: modalTenant?.name || 'Cocinet',
        recipientName: user.name,
        recipientRole: user.role || 'user',
        recipientPhone: user.phone,
        channel: 'whatsapp',
        status: res.success ? 'success' : 'failed',
        detail: res.success ? `WhatsApp corte de prueba enviado con éxito (ID: ${res.messageId || 'OK'})` : `Error al enviar: ${res.error || 'Fallo API'}`,
      });

      if (res.success) {
        triggerAppNotification("WhatsApp Silencioso Entregado ✅🚀", `Reporte entregado en segundo plano a +52 ${user.phone}.`, "success");
      } else {
        console.warn("Fallo silent send corte:", res.error);
        triggerAppNotification("Error al Enviar Silencioso ⚠️", `No se pudo enviar vía pasarela: ${res.error}`, "warning");
      }
    };

    const handleSendDirectWA = async (user: any) => {
      const phoneTarget = formatMexicoPhone(user.phone || "");
      if (!phoneTarget) {
        triggerAppNotification("Teléfono Faltante 📱", `El usuario ${user.name} no tiene registrado un número celular de 10 dígitos.`, "warning");
        return;
      }
      const publicBase = (typeof window !== "undefined" && window.location.origin && window.location.origin.startsWith("https://") && !window.location.origin.includes("localhost"))
        ? window.location.origin
        : "https://cocinet-prueba.web.app";
      const rawPath = (typeof window !== "undefined" && window.location.pathname) ? window.location.pathname : "/";
      const cleanPath = rawPath.endsWith("/") ? rawPath : `${rawPath}/`;
      const testLink = `${publicBase}${cleanPath}?tenant=${modalTenant?.id || 'tenant-1'}`;
      const msg = `Hola ${user.name}! 🔔\n\nTu número está correctamente vinculado para recibir notificaciones y autorizaciones en Cocinet Pro.\n\n🔗 *Enlace de Acceso:*\n\n${testLink}\n\n⚠️ *IMPORTANTE:* _No compartas tu contraseña para seguridad de la captura del sistema._`;

      triggerAppNotification("Enviando WhatsApp Silencioso 🚀", `Enviando mensaje de prueba a ${user.name}...`, "info");
      const res = await sendSilentWhatsAppMessage(user.phone, msg);

      addNotificationDeliveryLog({
        tenantId: modalTenant?.id || 'tenant-1',
        branchName: modalTenant?.name || 'Cocinet',
        recipientName: user.name,
        recipientRole: user.role || 'user',
        recipientPhone: user.phone,
        channel: 'whatsapp',
        status: res.success ? 'success' : 'failed',
        detail: res.success ? `WhatsApp de prueba enviado con éxito (ID: ${res.messageId || 'OK'})` : `Error al enviar: ${res.error || 'Fallo API'}`,
        targetUrl: testLink,
      });

      if (res.success) {
        triggerAppNotification("Aviso Entregado ✅", `Mensaje silencioso de prueba enviado al WhatsApp de ${user.name}.`, "success");
      } else {
        console.warn("Fallo silent send direct WA:", res.error);
        triggerAppNotification("Error al Enviar Silencioso ⚠️", `No se pudo enviar vía pasarela: ${res.error}`, "warning");
      }
    };

    const handleShareAccessWA = async (user: any, accessLink?: string) => {
      const phoneTarget = formatMexicoPhone(user.phone || "");
      if (!phoneTarget) {
        triggerAppNotification("Teléfono Faltante 📱", `El usuario ${user.name} no tiene registrado un número celular de 10 dígitos.`, "warning");
        return;
      }

      const publicBase = (typeof window !== "undefined" && window.location.origin && window.location.origin.startsWith("https://") && !window.location.origin.includes("localhost"))
        ? window.location.origin
        : "https://cocinet-prueba.web.app";
      const rawPath = (typeof window !== "undefined" && window.location.pathname) ? window.location.pathname : "/";
      const cleanPath = rawPath.endsWith("/") ? rawPath : `${rawPath}/`;
      const cleanAccessLink = accessLink || `${publicBase}${cleanPath}?tenant=${modalTenant?.id || 'tenant-1'}`;

      const msg = `Hola ${user.name}! 👋\n\n🔑 *Tus Credenciales de Acceso a Cocinet Pro:*\n🏪 *Sucursal:* ${modalTenant?.name || "Cocinet"}\n👤 *Usuario / Rol:* ${user.name} (${user.role.toUpperCase()})\n🔢 *Tu PIN / Contraseña:* *${user.pin || "Sin PIN asignado"}*\n\n🔗 *Enlace para ingresar al Sistema:*\n\n${cleanAccessLink}\n\n⚠️ *IMPORTANTE:* _No compartas tu contraseña para seguridad de la captura del sistema._`;

      triggerAppNotification("Enviando Acceso Silencioso 🚀", `Enviando credenciales de acceso a ${user.name}...`, "info");
      const res = await sendSilentWhatsAppMessage(user.phone, msg);

      addNotificationDeliveryLog({
        tenantId: modalTenant?.id || 'tenant-1',
        branchName: modalTenant?.name || 'Cocinet',
        recipientName: user.name,
        recipientRole: user.role || 'user',
        recipientPhone: user.phone,
        channel: 'whatsapp',
        status: res.success ? 'success' : 'failed',
        detail: res.success ? `Enlace de acceso entregado silenciosamente a ${user.name}` : `Error al enviar enlace: ${res.error || 'Fallo API'}`,
        targetUrl: cleanAccessLink,
      });

      if (res.success) {
        triggerAppNotification("Acceso Entregado ✅", `Credenciales enviadas silenciosamente al WhatsApp de ${user.name}.`, "success");
      } else {
        triggerAppNotification("Error al Enviar Silencioso ⚠️", `No se pudo enviar vía pasarela: ${res.error}`, "warning");
      }
    };

    const handleSendCloudPush = async (user: any, isCorte: boolean) => {
      let token = user.fcmToken;
      if (!token) {
        token = await requestFCMToken();
        if (token) {
          handleCellChange(user.id, "fcmToken", token, modalTenant?.id);
        }
      }

      const testLink = `${window.location.origin}${window.location.pathname}?tenant=${modalTenant?.id || 'tenant-1'}&token=propietario`;
      const title = isCorte
        ? `📊 Corte Diario • ${modalTenant?.name || 'Cocinet'}`
        : `💬 Prueba Notificación • ${modalTenant?.name || 'Cocinet'}`;
      const body = isCorte
        ? `Hola ${user.name}! Tu corte programado (${user.reportSchedule || 'Al Cierre'}) está listo.`
        : `Hola ${user.name}! Alerta de prueba enviada a tu dispositivo. Toca para abrir.`;

      triggerDeviceNotification(title, body, "/logo.png", testLink);

      addNotificationDeliveryLog({
        tenantId: modalTenant?.id || 'tenant-1',
        branchName: modalTenant?.name || 'Cocinet',
        recipientName: user.name,
        recipientRole: user.role || 'user',
        recipientPhone: user.phone,
        channel: 'fcm_push',
        status: 'success',
        detail: `Notificación Push disparada al dispositivo de ${user.name}`,
        targetUrl: testLink,
      });

      triggerAppNotification(
        "🔔 Notificación Push Disparada 🚀",
        `Alerta enviada al dispositivo de ${user.name}. Revisa tu barra de notificaciones del móvil/escritorio.`,
        "success"
      );
    };

    const handleToggleUser = (userId: string) => {
      setSelectedUserIds((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    };

    const handleSelectAll = () => {
      if (selectedUserIds.length === modalUsers.length) {
        setSelectedUserIds([]);
      } else {
        setSelectedUserIds(modalUsers.map((u) => u.id));
      }
    };

    const handleSelectByRole = (role: string) => {
      const matchIds = modalUsers
        .filter((u) => {
          if (role === 'admin') {
            return u.role === 'admin' || u.id.endsWith('-admin') || u.id.endsWith('-manager') || u.id.endsWith('-sistemas');
          }
          return u.role === role;
        })
        .map((u) => u.id);

      setSelectedUserIds(matchIds);
      triggerAppNotification(
        'Filtro Aplicado 🎯',
        `Se seleccionaron ${matchIds.length} usuario(s) con rol ${role.toUpperCase()}.`,
        'info'
      );
    };

    const handleOpenMessageForSingle = (user: any) => {
      setTargetUsersForMessage([user]);
      setCustomMessageTitle(`📢 Aviso a ${user.name}`);
      setCustomMessageBody(`Hola ${user.name}! 👋\n\nTe escribo desde la administración de ${modalTenant?.name || 'la sucursal'} para informarte lo siguiente:\n\n[Escribe tu mensaje aquí...]`);
      setShowCustomMessageModal(true);
    };

    const handleOpenMessageForSelected = () => {
      const targets = modalUsers.filter((u) => selectedUserIds.includes(u.id));
      if (targets.length === 0) {
        triggerAppNotification(
          'Selecciona Destinatarios ⚠️',
          'Marca la casilla de al menos un empleado para redactar y enviar el mensaje.',
          'warning'
        );
        return;
      }
      setTargetUsersForMessage(targets);
      setCustomMessageTitle('📢 Aviso a Empleados');
      setCustomMessageBody(`Hola {nombre}! 👋\n\nTe informamos lo siguiente para tu turno en {sucursal}:\n\n[Escribe tu mensaje aquí...]`);
      setShowCustomMessageModal(true);
    };

    const handleApplyTemplate = (tmpl: any) => {
      setCustomMessageTitle(tmpl.title);
      setCustomMessageBody(tmpl.body);
    };

    const handleInsertVariable = (variableKey: string) => {
      setCustomMessageBody((prev) => `${prev} {${variableKey}}`);
    };

    const handleSendBroadcastWhatsApp = async () => {
      if (!customMessageBody.trim()) {
        triggerAppNotification('Mensaje Vacío ⚠️', 'Por favor redacta el texto del mensaje antes de enviar.', 'warning');
        return;
      }

      const validTargets = targetUsersForMessage.filter((u) => {
        const p = formatMexicoPhone(u.phone || '');
        return Boolean(p);
      });

      if (validTargets.length === 0) {
        triggerAppNotification(
          'Sin Celulares Registrados 📱⚠️',
          'Ninguno de los empleados seleccionados tiene configurado un número celular válido de 10 dígitos.',
          'warning'
        );
        return;
      }

      setIsSendingBroadcast(true);
      let successCount = 0;
      let failCount = 0;

      const publicBase = (typeof window !== "undefined" && window.location.origin && window.location.origin.startsWith("https://") && !window.location.origin.includes("localhost"))
        ? window.location.origin
        : "https://cocinet-prueba.web.app";
      const rawPath = (typeof window !== "undefined" && window.location.pathname) ? window.location.pathname : "/";
      const cleanPath = rawPath.endsWith("/") ? rawPath : `${rawPath}/`;
      const accessLink = `${publicBase}${cleanPath}?tenant=${modalTenant?.id || 'tenant-1'}`;

      triggerAppNotification(
        'Enviando WhatsApps 🚀',
        `Disparando mensajes silenciosos a ${validTargets.length} empleado(s)...`,
        'info'
      );

      for (const u of validTargets) {
        const parsedText = customMessageBody
          .replace(/\{nombre\}/gi, u.name || 'Empleado')
          .replace(/\{sucursal\}/gi, modalTenant?.name || 'Cocinet')
          .replace(/\{rol\}/gi, (u.role || 'personal').toUpperCase())
          .replace(/\{pin\}/gi, u.pin || '****')
          .replace(/\{enlace\}/gi, accessLink);

        const fullMessage = `${customMessageTitle.trim() ? `*${customMessageTitle.trim().toUpperCase()}*\n\n` : ''}${parsedText}\n\n_Enviado desde Cocinet Pro • ${modalTenant?.name || 'Sucursal'}_`;

        try {
          const res = await sendSilentWhatsAppMessage(u.phone, fullMessage);
          if (res.success) {
            successCount++;
          } else {
            failCount++;
          }

          addNotificationDeliveryLog({
            tenantId: modalTenant?.id || 'tenant-1',
            branchName: modalTenant?.name || 'Cocinet',
            recipientName: u.name,
            recipientRole: u.role || 'user',
            recipientPhone: u.phone,
            channel: 'whatsapp',
            status: res.success ? 'success' : 'failed',
            detail: res.success ? `WhatsApp de aviso entregado silenciosamente (ID: ${res.messageId || 'OK'})` : `Error: ${res.error || 'Fallo API'}`,
            targetUrl: accessLink,
          });
        } catch (err: any) {
          failCount++;
        }
      }

      setIsSendingBroadcast(false);
      setShowCustomMessageModal(false);

      if (successCount > 0) {
        triggerAppNotification(
          '¡Mensajes Entregados! ✅🚀',
          `Se enviaron exitosamente ${successCount} mensaje(s) de WhatsApp silencioso a los empleados.${failCount > 0 ? ` (${failCount} no se pudieron entregar).` : ''}`,
          'success'
        );
      } else {
        triggerAppNotification(
          'Error al Enviar ❌',
          'No se pudieron entregar los mensajes. Revisa tu conexión y credenciales de WhatsApp.',
          'error'
        );
      }
    };

    const mainBody = (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Phone Number ID de Meta 🆔:</label>
                    <input
                      type="text"
                      placeholder="Ej: 1333624529829399"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-black text-slate-700">Access Token de Meta (Bearer) 🔑:</label>
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-[10px] text-indigo-600 font-bold bg-transparent border-none cursor-pointer"
                      >
                        {showToken ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    <input
                      type={showToken ? 'text' : 'password'}
                      placeholder="EAABw..."
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
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

            {/* Barra de Selección Rápida y Envío de WhatsApp a Grupos */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-3.5 text-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <span className="text-[11px] font-black text-indigo-200 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                  <span>🎯</span> Filtrar Grupo:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1 ${
                    selectedUserIds.length === modalUsers.length && modalUsers.length > 0
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-indigo-100'
                  }`}
                >
                  <span>👥 Todos ({modalUsers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectByRole('cajero')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1"
                >
                  <span>💵 Cajeros ({modalUsers.filter((u) => u.role === 'cajero').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectByRole('mesero')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-amber-300 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1"
                >
                  <span>🏃 Meseros ({modalUsers.filter((u) => u.role === 'mesero').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectByRole('admin')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-sky-300 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1"
                >
                  <span>👔 Admins ({modalUsers.filter((u) => u.role === 'admin' || u.id.endsWith('-admin') || u.id.endsWith('-manager') || u.id.endsWith('-sistemas')).length})</span>
                </button>
                {selectedUserIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg text-xs font-bold transition border-none cursor-pointer"
                  >
                    ✕ Deseleccionar ({selectedUserIds.length})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleOpenMessageForSelected}
                  className={`py-2 px-4 rounded-xl text-xs font-black transition duration-200 flex items-center gap-2 shadow-md border-none cursor-pointer ${
                    selectedUserIds.length > 0
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/50 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title="Redactar y enviar mensaje personalizado a los usuarios seleccionados"
                >
                  <i className="fa-brands fa-whatsapp text-sm" />
                  <span>
                    {selectedUserIds.length > 0
                      ? `📢 Enviar WhatsApp a ${selectedUserIds.length} Seleccionado(s)`
                      : '📢 Enviar WhatsApp Grupal'}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-600 min-w-[1150px]">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-200 font-bold text-[11px]">
                      <th className="py-2.5 px-2.5 w-[40px] text-center">
                        <input
                          type="checkbox"
                          checked={modalUsers.length > 0 && selectedUserIds.length === modalUsers.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                          title="Seleccionar / Deseleccionar Todos"
                        />
                      </th>
                      <th className="py-2.5 px-2.5 w-[50px] text-center">Avatar</th>
                      <th className="py-2.5 px-2.5 w-[85px]">ID Acceso</th>
                      <th className="py-2.5 px-2.5">Nombre Completo</th>
                      <th className="py-2.5 px-2.5 w-[85px]">Rol</th>
                      <th className="py-2.5 px-2.5 w-[100px]">PIN Acceso 🔑</th>
                      <th className="py-2.5 px-2.5 w-[125px]">Teléfono 📱</th>
                      <th className="py-2.5 px-2.5 w-[135px]">Horario Reporte ⏰</th>
                      <th className="py-2.5 px-2.5 w-[220px] text-center">Mensajes y Pruebas 🚀</th>
                      <th className="py-2.5 px-2.5 w-[140px] text-center">Compartir Acceso</th>
                      <th className="py-2.5 px-2.5 w-[65px] text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {modalUsers.map((user) => {
                      const isProtected = user.id.endsWith("-admin") || user.id.endsWith("-sistemas") || user.id.endsWith("-manager");
                      const isSelected = selectedUserIds.includes(user.id);
                      
                      const publicBase = (typeof window !== "undefined" && window.location.origin && window.location.origin.startsWith("https://") && !window.location.origin.includes("localhost"))
                        ? window.location.origin
                        : "https://cocinet-prueba.web.app";
                      const rawPath = (typeof window !== "undefined" && window.location.pathname) ? window.location.pathname : "/";
                      const cleanPath = rawPath.endsWith("/") ? rawPath : `${rawPath}/`;
                      const link = `${publicBase}${cleanPath}?tenant=${modalTenant.id}`;
                      
                      return (
                        <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
                          {/* Checkbox de Selección */}
                          <td className="py-2 px-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleUser(user.id)}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                          </td>

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

                          {/* Mensajes y Pruebas */}
                          <td className="py-2 px-2.5 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {/* Botón de Mensaje Personalizado */}
                              <button
                                type="button"
                                onClick={() => handleOpenMessageForSingle(user)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black flex items-center gap-1 cursor-pointer transition border-none shadow-xs"
                                title={`Enviar mensaje personalizado de WhatsApp a ${user.name}`}
                              >
                                <i className="fa-brands fa-whatsapp text-[11px]" />
                                <span>Mensaje</span>
                              </button>

                              {isProtected ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSendTestCorteWA(user)}
                                    className="px-1.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition"
                                    title="Enviar Corte de Prueba por WhatsApp a este usuario"
                                  >
                                    <span>📊 Corte</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendCloudPush(user, true)}
                                    className="px-1.5 py-1 bg-slate-100 hover:bg-violet-50 text-violet-800 border border-violet-200 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition"
                                    title="Enviar Notificación Cloud de Corte"
                                  >
                                    <span>🔔 Cloud</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSendDirectWA(user)}
                                    className="px-1.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition"
                                    title="Enviar WhatsApp de prueba a este empleado"
                                  >
                                    <span>🔔 Prueba</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendCloudPush(user, false)}
                                    className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition"
                                    title="Enviar Notificación Cloud directa a este empleado"
                                  >
                                    <span>🔔 Push</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Enviar / Compartir Acceso */}
                          <td className="py-2 px-2.5">
                            <div className="flex justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(link);
                                  } catch (err) {
                                    const textarea = document.createElement("textarea");
                                    textarea.value = link;
                                    document.body.appendChild(textarea);
                                    textarea.select();
                                    document.execCommand("copy");
                                    document.body.removeChild(textarea);
                                  }

                                  triggerAppNotification(
                                    "🔗 Enlace Copiado",
                                    `URL de acceso directo para ${user.name} copiada al portapapeles.`,
                                    "success"
                                  );
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border-none"
                                title="Copiar enlace directo de acceso"
                              >
                                📋 Copiar
                              </button>
                               <button
                                type="button"
                                onClick={() => handleShareAccessWA(user, link)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border-none"
                                title="Enviar credenciales de acceso por WhatsApp Silencioso"
                              >
                                🟢 Acceso
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

        {/* Modal de Redacción y Envío de WhatsApp Personalizado / Grupal */}
        <IonModal
          isOpen={showCustomMessageModal}
          onDidDismiss={() => setShowCustomMessageModal(false)}
          style={{
            "--height": "auto",
            "--width": "100%",
            "--max-width": "680px",
            "--border-radius": "24px",
          }}
        >
          <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-brands fa-whatsapp" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-800 m-0">
                    Enviar WhatsApp a Empleados 📲
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium m-0">
                    {targetUsersForMessage.length === 1
                      ? `Destinatario: ${targetUsersForMessage[0]?.name} (${targetUsersForMessage[0]?.role?.toUpperCase()})`
                      : `Difusión a ${targetUsersForMessage.length} empleado(s) seleccionados`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomMessageModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border-none cursor-pointer transition"
              >
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            {/* Chips de Destinatarios */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Destinatarios ({targetUsersForMessage.length}):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {targetUsersForMessage.map((u) => {
                  const hasPhone = Boolean(formatMexicoPhone(u.phone || ''));
                  return (
                    <span
                      key={u.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        hasPhone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <i className={hasPhone ? 'fa-solid fa-phone text-[10px]' : 'fa-solid fa-triangle-exclamation text-[10px]'} />
                      <span>{u.name}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {hasPhone ? `(+52 ${u.phone})` : '(Sin celular)'}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Plantillas Rápidas */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Plantillas Rápidas:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {MESSAGE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition cursor-pointer"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Título / Asunto */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Título / Asunto del Mensaje:
              </label>
              <input
                type="text"
                value={customMessageTitle}
                onChange={(e) => setCustomMessageTitle(e.target.value)}
                placeholder="Ej. 🚀 Actualización de Cocinet Pro / 💵 Aviso a Caja"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none transition"
              />
            </div>

            {/* Cuerpo del Mensaje */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Contenido del Mensaje de WhatsApp:
                </label>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                  <span>Variables:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('nombre')}
                    className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 cursor-pointer"
                    title="Inserta el nombre del empleado"
                  >
                    {'{nombre}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('sucursal')}
                    className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 cursor-pointer"
                    title="Inserta el nombre de la sucursal"
                  >
                    {'{sucursal}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('rol')}
                    className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 cursor-pointer"
                    title="Inserta el rol del empleado"
                  >
                    {'{rol}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('pin')}
                    className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 cursor-pointer"
                    title="Inserta el PIN del empleado"
                  >
                    {'{pin}'}
                  </button>
                </div>
              </div>
              <textarea
                rows={5}
                value={customMessageBody}
                onChange={(e) => setCustomMessageBody(e.target.value)}
                placeholder="Escribe el mensaje que deseas enviar a los empleados..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-3 text-xs font-medium text-slate-800 outline-none transition leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                💡 Tip: Puedes usar etiquetas como <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">{'{nombre}'}</code> o <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">{'{sucursal}'}</code> para personalizar el mensaje de cada empleado automáticamente.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomMessageModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition border-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendBroadcastWhatsApp}
                disabled={isSendingBroadcast}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-200 transition border-none cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-sm" />
                <span>
                  {isSendingBroadcast
                    ? 'Enviando WhatsApps...'
                    : `Enviar WhatsApp Silencioso (${targetUsersForMessage.filter((u) => Boolean(formatMexicoPhone(u.phone || ''))).length} teléfonos)`}
                </span>
              </button>
            </div>
          </div>
        </IonModal>
      </div>
    );

    if (isInline) {
      return (
        <div className="bg-transparent">
          {mainBody}
        </div>
      );
    }

    return (
      <IonModal
        isOpen={showTenantUsersModal}
        onDidDismiss={() => setShowTenantUsersModal && setShowTenantUsersModal(false)}
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
              <IonButton onClick={() => setShowTenantUsersModal && setShowTenantUsersModal(false)} color="dark">
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          {mainBody}
        </IonContent>
      </IonModal>
    );
};

