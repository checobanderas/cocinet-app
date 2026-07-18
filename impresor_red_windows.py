import socket
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

PORT_HTTP = 9101

class NetworkPrinterBridgeHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.end_headers()

    def do_POST(self):
        # Handle CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()

        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            # Parse parameters from query/body
            params = urllib.parse.parse_qs(post_data)
            ip = params.get('ip', [''])[0]
            port_str = params.get('port', ['9100'])[0]
            texto = params.get('texto', [''])[0]

            if not ip or not texto:
                self.wfile.write("Error: Faltan parametros (ip y texto son obligatorios)".encode('utf-8'))
                return

            port = int(port_str)
            print(f"📡 Enviando impresion a {ip}:{port}...")
            
            # Try connecting to the network printer on port 9100
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(5.0) # 5 seconds timeout
            s.connect((ip, port))
            
            # Encode using Cp1252 for thermal receipt printer compatibility
            encoded_text = texto.encode('cp1252', errors='replace')
            s.sendall(encoded_text)
            s.close()
            
            print("✅ ¡Impresion exitosa!")
            self.wfile.write("Exito".encode('utf-8'))
            
        except socket.timeout:
            print("❌ Error: Tiempo de espera agotado al conectar con la impresora.")
            self.wfile.write("Error: Tiempo de espera agotado al conectar con la impresora.".encode('utf-8'))
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            self.wfile.write(f"Error: {str(e)}".encode('utf-8')).decode('utf-8')

def run(server_class=HTTPServer, handler_class=NetworkPrinterBridgeHandler, port=PORT_HTTP):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"================================================================")
    print(f"🚀 PUENTE DE IMPRESIÓN EN RED INICIADO (WINDOWS)")
    print(f"🌐 Escuchando en: http://localhost:{port}/imprimir")
    print(f"👉 Compatible con impresoras en puerto 9100 (ESC/POS)")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Cerrando servidor puente...")
        httpd.server_close()

if __name__ == '__main__':
    run()
