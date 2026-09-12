import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Smartphone, Copy, Check, MessageCircle, X, Wifi } from 'lucide-react';

interface ConnectWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
}

export const ConnectWaiterModal: React.FC<ConnectWaiterModalProps> = ({
  isOpen,
  onClose,
  branchName
}) => {
  const [hostIp, setHostIp] = useState('');
  const [port, setPort] = useState('3010');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname;
      const currentPort = window.location.port || '3010';
      setPort(currentPort);
      // If localhost or 127.0.0.1, try to offer or detect
      setHostIp(currentHost === 'localhost' || currentHost === '127.0.0.1' ? '' : currentHost);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveIp = hostIp.trim() || 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const shareUrl = `${protocol}//${effectiveIp}${port ? `:${port}` : ''}/?mode=celular`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(shareUrl)}`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `🚀 *COCINET - Acceso para Mesero / Celular*\n\nHola, entra a este enlace para tomar pedidos desde tu teléfono:\n👉 ${shareUrl}\n\n${branchName ? `🏢 Sucursal: *${branchName}*\n` : ''}✨ _Se configurará automáticamente en Modo Celular._`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900/60 via-slate-800 to-slate-900 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>📱 Conectar Celular / Meseros</span>
                </h3>
                <p className="text-xs text-purple-300/80 font-medium">
                  Enlace inteligente con auto-configuración permanente
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* IP Wi-Fi Notice & Input */}
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Wifi className="w-4 h-4" />
                  <span>IP de la Computadora (Red Wi-Fi Local)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Puerto: {port}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hostIp}
                  onChange={(e) => setHostIp(e.target.value)}
                  placeholder="Ej: 192.168.1.50 (IP de tu PC)"
                  className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-300 font-mono focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                />
                <button
                  onClick={() => {
                    const local = window.location.hostname;
                    setHostIp(local !== 'localhost' && local !== '127.0.0.1' ? local : '192.168.1.');
                  }}
                  className="px-3 py-2 bg-slate-700/70 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  title="Detectar IP actual"
                >
                  Detectar
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                💡 Asegúrate de que el celular esté conectado a la <strong>misma red Wi-Fi</strong> que esta computadora.
              </p>
            </div>

            {/* QR Code & Share link */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 border border-purple-500/20 rounded-2xl p-4">
              <div className="bg-white p-2 rounded-2xl shadow-lg border-2 border-purple-500/40 flex-shrink-0 flex flex-col items-center">
                <img
                  src={qrUrl}
                  alt="QR Conexión Mesero"
                  className="w-36 h-36 object-contain rounded-lg"
                  loading="eager"
                />
                <span className="text-[10px] font-black text-slate-800 mt-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-purple-600" />
                  Escanear con Cámara
                </span>
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <div className="text-xs font-bold text-slate-300">
                  Enlace directo para enviar al mesero:
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-purple-300 break-all select-all flex items-center justify-between">
                  <span>{shareUrl}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg shadow-emerald-900/40"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Enviar por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Feature Notice */}
            <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-start gap-3">
              <span className="text-2xl leading-none">✨</span>
              <div className="text-xs text-purple-200/90 leading-relaxed">
                <strong>Configuración Cero:</strong> Al abrir este enlace, el celular del mesero guardará en su memoria interna que es un dispositivo móvil y <strong>abrirá permanentemente en Modo Celular</strong>. ¡No necesitas configurar nada a mano!
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Listo / Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
