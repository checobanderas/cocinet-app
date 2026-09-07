import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function smsLogPlugin() {
  return {
    name: 'sms-log-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/sms-log') || req.url?.startsWith('/mensajes_sms.log')) {
          const logPath = path.resolve(process.cwd(), 'mensajes_sms.log');
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body || '{}');
                const {
                  timestamp = new Date().toISOString(),
                  cancellationFolio = "N/A",
                  tenantId = "N/A",
                  branchName = "N/A",
                  recipientName = "N/A",
                  recipientRole = "N/A",
                  recipientPhone = "Sin número",
                  channel = "SMS/WhatsApp",
                  status = "unknown",
                  detail = "",
                  targetUrl = ""
                } = data;

                const statusTag = status === "success" ? "✅ EXITOSO" : status === "failed" ? "❌ FALLIDO" : "⏭️ OMITIDO";
                const localTime = new Date(timestamp).toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

                const logText = [
                  `================================================================================`,
                  `[${timestamp}] (${localTime}) - CANAL: ${String(channel).toUpperCase()} - ESTADO: ${statusTag}`,
                  `Folio Cancelación: #${cancellationFolio}`,
                  `Sucursal: ${branchName} (ID: ${tenantId})`,
                  `Destinatario: ${recipientName} [Rol: ${recipientRole}]`,
                  `Teléfono Destino: ${recipientPhone}`,
                  `Detalle / Respuesta Pasarela: ${detail}`,
                  targetUrl ? `URL Directa: ${targetUrl}` : null,
                  `================================================================================\n`
                ].filter(Boolean).join("\n");

                fs.appendFileSync(logPath, logText + "\n", 'utf8');
                const publicLog = path.resolve(process.cwd(), 'public', 'mensajes_sms.log');
                try { fs.appendFileSync(publicLog, logText + "\n", 'utf8'); } catch (e) {}

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          } else if (req.method === 'GET') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            if (fs.existsSync(logPath)) {
              res.end(fs.readFileSync(logPath, 'utf8'));
            } else {
              res.end("=== REGISTRO DE MENSAJES SMS Y WHATSAPP (mensajes_sms.log) ===\nIniciando archivo de registro...\n");
            }
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      smsLogPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000 // 5MB
        },
        manifest: {
          name: 'COCINET Pro 2026',
          short_name: 'COCINET',
          description: 'Sistema de gestión inteligente con sincronización real-time',
          theme_color: '#3b82f6',
          icons: [
            {
              src: 'https://img.icons8.com/fluency/192/restaurant.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://img.icons8.com/fluency/512/restaurant.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY || env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
    },
  };
});
