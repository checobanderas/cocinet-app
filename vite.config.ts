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
        if (req.url?.startsWith('/api/send-whatsapp')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const {
                  to,
                  message,
                  provider = 'meta',
                  instanceId = '',
                  token = '',
                  phoneNumberId = '1333624529829399',
                  accessToken = 'EAAWMw7qndssBSerl6nOEugdvr44OCrAikaLe9NafpbiPbB0jobmxZCgo5CRREWlhV1FhO7GFvHDsqsTuYrwV46OfjZAQIjAaqUQqq8MCZBrv3sPxwk4kZC509TeKaxMyI8B01d4BTn7fiK3VtrinM9zgrKmP47nLQEjSZAFNycSzeh96h3qXhzvieAqUDVQZDZD'
                } = data;

                if (!to || !message) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'Faltan parámetros: to o message' }));
                  return;
                }

                const cleanDigits = String(to).replace(/\D/g, '');
                const formattedPhone = cleanDigits.length === 10 ? `52${cleanDigits}` : cleanDigits;

                if (provider === 'ultramsg' || (!provider && instanceId)) {
                  const cleanInstance = String(instanceId).trim();
                  const endpoint = `https://api.ultramsg.com/${cleanInstance}/messages/chat`;
                  const bodyParams = new URLSearchParams();
                  bodyParams.append('token', String(token).trim());
                  bodyParams.append('to', formattedPhone);
                  bodyParams.append('body', message);

                  const apiRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: bodyParams.toString()
                  });

                  const resData: any = await apiRes.json().catch(() => ({}));
                  res.setHeader('Content-Type', 'application/json');
                  if (resData.sent === 'true' || resData.sent === true || resData.id) {
                    res.end(JSON.stringify({ success: true, messageId: String(resData.id) }));
                  } else {
                    const errorMsg = resData.error || resData.message || `Error UltraMsg HTTP ${apiRes.status}`;
                    res.end(JSON.stringify({ success: false, error: errorMsg }));
                  }
                  return;
                } else if (provider === 'meta') {
                  const endpoint = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
                  const payload = {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: formattedPhone,
                    type: 'text',
                    text: { preview_url: false, body: message }
                  };

                  const apiRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                  });

                  const resData: any = await apiRes.json().catch(() => ({}));
                  res.setHeader('Content-Type', 'application/json');
                  if (apiRes.ok && resData?.messages?.[0]?.id) {
                    res.end(JSON.stringify({ success: true, messageId: resData.messages[0].id }));
                  } else {
                    let errorMsg = resData?.error?.message || 'Error en la API de Meta';
                    if (resData?.error?.code === 131030 || String(errorMsg).includes('allowed list')) {
                      errorMsg = `El número ${formattedPhone} aún no está en la lista de destinatarios de Meta for Developers. En Meta > Destinatario, haz clic en "Administrar lista de números de teléfono" y agrega tu celular con el código de 6 dígitos.`;
                    }
                    res.end(JSON.stringify({ success: false, error: errorMsg }));
                  }
                  return;
                }

                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Proveedor no soportado' }));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }
        }
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
          description: 'Sistema de gestión gastronómico inteligente para restaurantes, taquerías y bares',
          theme_color: '#3b82f6',
          background_color: '#0f172a',
          icons: [
            {
              src: '/restaurant-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/restaurant-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/restaurant.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
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
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('xlsx')) {
                return 'vendor-excel';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('@ionic') || id.includes('ionicons')) {
                return 'vendor-ionic';
              }
              if (id.includes('@vis.gl') || id.includes('google-maps')) {
                return 'vendor-maps';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react-core';
              }
              return 'vendor-libs';
            }
          }
        }
      }
    },
    server: {
      hmr: false,
    },
  };
});
