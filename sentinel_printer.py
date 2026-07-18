import sys
import os
import subprocess
import importlib
import json

# ─── Directorio base ───────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Dependencias ──────────────────────────────────────────────────
REQUIRED_PACKAGES = {
    "flask": "Flask",
    "flask_cors": "flask-cors",
    "win32print": "pywin32",
    "win32serviceutil": "pywin32",
    "PIL": "Pillow",
}

def ensure_deps():
    missing = []
    for module, package in REQUIRED_PACKAGES.items():
        try:
            importlib.import_module(module)
        except ImportError:
            if package not in missing:
                missing.append(package)
    if missing:
        print(f"Instalando dependencias faltantes: {missing}")
        for pkg in missing:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
            except Exception as e:
                print(f"Error instalando {pkg}: {e}")

service_commands = {"install", "remove", "start", "stop", "restart", "debug", "update"}
running_as_service_cmd = len(sys.argv) > 1 and sys.argv[1].lower() in service_commands
if not running_as_service_cmd or sys.argv[1].lower() == "debug":
    ensure_deps()

# ─── Importaciones Seguras ─────────────────────────────────────────
import urllib.parse
import threading
import logging
import hashlib
import time
import sqlite3
import re
from datetime import datetime

import win32print
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket

# Importaciones para renderizado GDI
import win32ui
import win32con

# PIL
try:
    from PIL import Image, ImageWin
except ImportError:
    pass

from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── Configuración ─────────────────────────────────────────────────
PORT    = 3010
VERSION = "3.4.0"

# MODO DE IMPRESIÓN PREDETERMINADO: "gdi" o "raw"
#   "gdi" → Renderizado gráfico con fuentes de Windows (más elegante, profesional y compatible con cualquier tipo de impresora)
#   "raw" → Envío de bytes ESC/POS crudos directamente a la impresora
PRINT_MODE = "gdi"

# ─── Configuración de Impresoras y Tamaños de Papel ────────────────────────────
CONFIG_FILE = os.path.join(BASE_DIR, "printer_config.json")

def load_printer_config():
    default_config = {
        "PRINTER_MAP": {
            "cuentas": "CUENTAS",
            "cocina":  "COCINA",
            "barra":   "BARRA",
        },
        "PRINTER_PAPER_SIZES": {
            "cuentas": "80mm",
            "cocina":  "80mm",
            "barra":   "80mm",
        },
        "LOGO_PATH": "C:\\buzon\\logo.jpg",
        "FONT_NAME": "Arial",
        "FONT_SIZE_PT": 16.0
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "PRINTER_MAP" in data:
                    default_config["PRINTER_MAP"].update(data["PRINTER_MAP"])
                if "PRINTER_PAPER_SIZES" in data:
                    default_config["PRINTER_PAPER_SIZES"].update(data["PRINTER_PAPER_SIZES"])
                if "LOGO_PATH" in data:
                    default_config["LOGO_PATH"] = data["LOGO_PATH"]
                if "FONT_NAME" in data:
                    default_config["FONT_NAME"] = data["FONT_NAME"]
                if "FONT_SIZE_PT" in data:
                    default_config["FONT_SIZE_PT"] = float(data["FONT_SIZE_PT"])
        except Exception as e:
            print(f"Error cargando config de impresoras: {e}")
    else:
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(default_config, f, indent=4, ensure_ascii=False)
        except Exception:
            pass
    return default_config

config_printers = load_printer_config()
PRINTER_MAP = config_printers["PRINTER_MAP"]
PRINTER_PAPER_SIZES = config_printers["PRINTER_PAPER_SIZES"]
LOGO_PATH = config_printers["LOGO_PATH"]
FONT_NAME = config_printers["FONT_NAME"]
FONT_SIZE_PT = config_printers["FONT_SIZE_PT"]

# ─── Flask app ─────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
app.logger.disabled = True
log_flask = logging.getLogger("werkzeug")
log_flask.setLevel(logging.ERROR)

LOG_FILE = os.path.join(BASE_DIR, "sentinel_printer.log")

def get_logger():
    logger = logging.getLogger("sentinel")
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", "%Y-%m-%d %H:%M:%S")
    fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    if sys.stdout and sys.stdout.isatty():
        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(fmt)
        logger.addHandler(ch)
    return logger

log = get_logger()

# ─── Parser de Comandos ESC/POS ───────────────────────────────────
def parse_escpos(raw_bytes: bytes) -> list:
    """
    Decodifica un flujo de bytes ESC/POS y lo convierte en una lista de líneas estructuradas
    con propiedades de alineación, tamaño de fuente y negritas para su renderizado GDI.
    """
    lines = []
    current_line_text = ""
    
    align = 0  # 0=izq, 1=centro, 2=der
    bold = False
    size = 'normal'  # 'normal', 'big', 'small'
    
    i = 0
    n = len(raw_bytes)
    
    while i < n:
        b = raw_bytes[i]
        
        # Comando ESC (0x1b / 27)
        if b == 0x1b:
            if i + 1 < n:
                cmd = raw_bytes[i + 1]
                # ESC @ (Inicializar impresora)
                if cmd == 0x40:
                    align = 0
                    bold = False
                    size = 'normal'
                    i += 2
                    continue
                # ESC a (Alineación)
                elif cmd == 0x61:
                    if i + 2 < n:
                        align = raw_bytes[i + 2]
                        i += 3
                        continue
                # ESC ! (Modo de impresión general)
                elif cmd == 0x21:
                    if i + 2 < n:
                        mode = raw_bytes[i + 2]
                        bold = bool(mode & 8)
                        double_height = bool(mode & 16)
                        double_width = bool(mode & 32)
                        if double_height or double_width:
                            size = 'big'
                        else:
                            size = 'normal'
                        i += 3
                        continue
                # ESC E (Negrita)
                elif cmd == 0x45:
                    if i + 2 < n:
                        bold = (raw_bytes[i + 2] == 1 or raw_bytes[i + 2] == 49)
                        i += 3
                        continue
                # ESC d (Avanzar N líneas)
                elif cmd == 0x64:
                    if i + 2 < n:
                        feed_count = raw_bytes[i + 2]
                        lines.append({
                            'text': current_line_text,
                            'align': align,
                            'size': size,
                            'bold': bold
                        })
                        current_line_text = ""
                        for _ in range(feed_count - 1):
                            lines.append({
                                'text': '',
                                'align': align,
                                'size': size,
                                'bold': bold
                            })
                        i += 3
                        continue
            i += 1
            
        # Comando GS (0x1d / 29)
        elif b == 0x1d:
            if i + 1 < n:
                cmd = raw_bytes[i + 1]
                # GS V (Corte de papel)
                if cmd == 0x56:
                    if i + 2 < n:
                        m = raw_bytes[i + 2]
                        if m in (65, 66):
                            if i + 3 < n:
                                i += 4
                                continue
                        else:
                            i += 3
                            continue
            i += 1
            
        # Salto de línea (LF = 0x0a / 10)
        elif b == 0x0a:
            lines.append({
                'text': current_line_text,
                'align': align,
                'size': size,
                'bold': bold
            })
            current_line_text = ""
            i += 1
            
        # Retorno de carro (CR = 0x0d / 13)
        elif b == 0x0d:
            i += 1
            
        # Caracteres normales del ticket
        else:
            try:
                char_str = raw_bytes[i:i+1].decode('cp850')
            except Exception:
                try:
                    char_str = raw_bytes[i:i+1].decode('latin-1')
                except Exception:
                    char_str = chr(b)
            current_line_text += char_str
            i += 1
            
    if current_line_text:
        lines.append({
            'text': current_line_text,
            'align': align,
            'size': size,
            'bold': bold
        })
        
    return lines

# ─── Motores de Impresión ─────────────────────────────────────────
def get_installed_printers() -> list:
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    return [p[2] for p in win32print.EnumPrinters(flags)]

def resolve_printer_name(key: str) -> str:
    target = PRINTER_MAP.get(key.lower(), key)
    installed = get_installed_printers()
    for p in installed:
        if p.upper() == target.upper():
            return p
    raise ValueError(f"Impresora '{target}' no encontrada. Disponibles: {installed}")

def send_raw_to_printer(printer_name: str, data_bytes: bytes):
    hPrinter = win32print.OpenPrinter(printer_name)
    try:
        job_name = f"COCINET-RAW-{datetime.now().strftime('%H%M%S')}"
        win32print.StartDocPrinter(hPrinter, 1, (job_name, None, "RAW"))
        try:
            win32print.StartPagePrinter(hPrinter)
            win32print.WritePrinter(hPrinter, data_bytes)
            win32print.EndPagePrinter(hPrinter)
        finally:
            win32print.EndDocPrinter(hPrinter)
    finally:
        win32print.ClosePrinter(hPrinter)

def draw_logo_on_dc(hDC, logo_path: str, printable_width: int, y_start: int, dpi_y: int) -> int:
    """Carga y dibuja el logotipo centrado en el DC del ticket, retornando la nueva coordenada Y."""
    if not logo_path or not os.path.exists(logo_path):
        return y_start
    try:
        from PIL import Image, ImageWin
        img = Image.open(logo_path)
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        # Calcular escala
        w, h = img.size
        # El logotipo tendrá como ancho el 45% del ancho del ticket para verse bien estilizado y centrado
        max_logo_width = int(printable_width * 0.45)
        scale = max_logo_width / float(w)
        new_w = max_logo_width
        new_h = int(h * scale)
        
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Centrar horizontalmente
        x_start = (printable_width - new_w) // 2
        
        # Obtener el HDC nativo de Windows
        hdc_handle = hDC.GetSafeHdc()
        
        dib = ImageWin.Dib(img)
        dib.draw(hdc_handle, (x_start, y_start, x_start + new_w, y_start + new_h))
        
        return y_start + new_h + 15
    except Exception as e:
        log.error(f"Error renderizando el logotipo GDI: {e}")
        return y_start

def send_gdi_to_printer(printer_name: str, data_bytes: bytes, ticket_type: str = "comanda"):
    """Parsea el ticket de comandos ESC/POS y lo dibuja vectorialmente usando el GDI de Windows."""
    global PRINTER_MAP, PRINTER_PAPER_SIZES, LOGO_PATH, FONT_NAME, FONT_SIZE_PT
    config_printers = load_printer_config()
    PRINTER_MAP = config_printers["PRINTER_MAP"]
    PRINTER_PAPER_SIZES = config_printers["PRINTER_PAPER_SIZES"]
    LOGO_PATH = config_printers["LOGO_PATH"]
    FONT_NAME = config_printers["FONT_NAME"]
    FONT_SIZE_PT = config_printers["FONT_SIZE_PT"]

    parsed_lines = parse_escpos(data_bytes)
    
    # Encontrar la clave lógica de la impresora actual
    printer_key = "cuentas"
    for k, v in PRINTER_MAP.items():
        if v.upper() == printer_name.upper():
            printer_key = k
            break
            
    paper_size = PRINTER_PAPER_SIZES.get(printer_key, "80mm")
    
    hDC = win32ui.CreateDC()
    hDC.CreatePrinterDC(printer_name)
    hDC.SetMapMode(win32con.MM_TEXT)
    
    dpi_y = hDC.GetDeviceCaps(win32con.LOGPIXELSY) or 203
    
    # Dimensiones y márgenes basados en el ancho de papel (58mm / 80mm)
    if paper_size == "58mm":
        width = 384
        margin_right = 15
    else:
        width = 576
        margin_right = 25
        
    job_name = f"COCINET-GDI-{paper_size}-{datetime.now().strftime('%H%M%S')}"
    hDC.StartDoc(job_name)
    hDC.StartPage()
    
    font_cache = {}
    
    def get_font(name, pt_size, is_bold, is_italic=False):
        key = (name, pt_size, is_bold, is_italic)
        if key in font_cache:
            return font_cache[key]
        height = int(pt_size * dpi_y / 72)
        f = win32ui.CreateFont({
            "name": name,
            "height": height,
            "weight": win32con.FW_BOLD if is_bold else win32con.FW_NORMAL,
            "italic": is_italic
        })
        font_cache[key] = f
        return f

    y = 20
    
    # Dibujar logotipo si es ticket de cuentas (precuenta/cuenta) y existe logotipo
    if ticket_type.lower() in ["cuentas", "cuenta"]:
        y = draw_logo_on_dc(hDC, LOGO_PATH, width, y, dpi_y)
    
    # Escalar tamaño base de tipografía
    base_pt = FONT_SIZE_PT
    if paper_size == "58mm":
        base_pt = base_pt * 0.82  # Reducir un poco para que no desborde en papel angosto
        
    for line in parsed_lines:
        text = line['text'].strip()
        alignment = line['align']
        size_mode = line['size']
        is_bold = line['bold']
        
        # 1. Líneas divisorias vectoriales elegantes
        if len(text) >= 10 and (all(c == '-' for c in text) or all(c == '=' for c in text)):
            pen = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x94a3b8)  # Color Slate-400
            hDC.SelectObject(pen)
            hDC.MoveTo(10, y + 5)
            hDC.LineTo(width - margin_right, y + 5)
            y += 15
            continue
            
        # 2. Renglon vacío
        if not text:
            f = get_font(FONT_NAME, base_pt, False)
            hDC.SelectObject(f)
            _, text_height = hDC.GetTextExtent(" ")
            y += text_height
            continue
            
        # Determinar el tamaño de tipografía (pt)
        if size_mode == 'big':
            pt = base_pt * 1.35
            bold_to_use = True
        elif size_mode == 'small':
            pt = base_pt * 0.75
            bold_to_use = is_bold
        else:
            pt = base_pt
            bold_to_use = is_bold
            
        f = get_font(FONT_NAME, pt, bold_to_use)
        hDC.SelectObject(f)
        
        # 3. Formatear y alinear Totales, Subtotales, Cambios, etc.
        # Ejemplo: "TOTAL: $150.00"
        total_match = re.match(r'^(TOTAL|SUBTOTAL|PROPINA|DESCUENTO|PAGO|CAMBIO|ATENDIDO POR|MESERO|MESA|HORA|FECHA)\s*:\s*(.*)$', text, re.IGNORECASE)
        if total_match:
            label = total_match.group(1).upper() + ":"
            val = total_match.group(2)
            
            # Dibujar etiqueta izquierda con letra normal
            hDC.TextOut(10, y, label)
            
            # Dibujar valor a la derecha (negrita)
            fb = get_font(FONT_NAME, pt, True)
            hDC.SelectObject(fb)
            val_width, val_height = hDC.GetTextExtent(val)
            hDC.TextOut(width - margin_right - val_width, y, val)
            y += val_height + 4
            continue
            
        # 4. Formatear y alinear Items de producto con columnas exactas
        # Ejemplo: "2 x TACOS DE PASTOR"
        item_match = re.match(r'^(\d+)\s*(?:x)?\s+(.*?)(?:\s+\$?([0-9.,]+))?$', text, re.IGNORECASE)
        if item_match and not any(text.startswith(k) for k in ["MESA", "HORA", "FOLIO", "FECHA", "COMANDA"]):
            qty = item_match.group(1)
            desc = item_match.group(2)
            price = item_match.group(3)
            
            # Cantidad a la izquierda en negrita
            fq = get_font(FONT_NAME, pt, True)
            hDC.SelectObject(fq)
            hDC.TextOut(10, y, qty)
            
            # Descripción (Segoe UI/Consolas normal)
            fd = get_font(FONT_NAME, pt, is_bold)
            hDC.SelectObject(fd)
            
            # Reservar espacio a la derecha si hay precio
            max_desc_width = width - margin_right - 45
            if price:
                max_desc_width -= 100
                
            truncated_desc = desc
            while hDC.GetTextExtent(truncated_desc)[0] > max_desc_width and len(truncated_desc) > 3:
                truncated_desc = truncated_desc[:-1]
                
            hDC.TextOut(40, y, truncated_desc)
            
            if price:
                price_str = f"${price}"
                fp = get_font(FONT_NAME, pt, True)
                hDC.SelectObject(fp)
                pr_width, pr_height = hDC.GetTextExtent(price_str)
                hDC.TextOut(width - margin_right - pr_width, y, price_str)
                y += pr_height + 4
            else:
                _, desc_height = hDC.GetTextExtent(desc)
                y += desc_height + 4
            continue
            
        # 5. Renderizar notas del producto (líneas con asterisco *) con itálicas e indentadas
        if text.startswith('*'):
            f_italic = get_font(FONT_NAME, pt, False, is_italic=True)
            hDC.SelectObject(f_italic)
            _, text_height = hDC.GetTextExtent(text)
            hDC.TextOut(20, y, text)
            y += text_height + 4
            continue
            
        # 6. Renderizar líneas comunes
        text_width, text_height = hDC.GetTextExtent(text)
        if alignment == 1:    # Centro
            x = (width - text_width) // 2
        elif alignment == 2:  # Derecha
            x = width - margin_right - text_width
        else:                 # Izquierda
            x = 10
            
        hDC.TextOut(x, y, text)
        y += text_height + 4
        
    hDC.EndPage()
    hDC.EndDoc()
    hDC.DeleteDC()

def print_data(printer_name: str, data_bytes: bytes, ticket_type: str = "comanda"):
    """Bypass unificado para imprimir en RAW o renderizar vectorialmente en GDI."""
    if PRINT_MODE.lower() == "gdi":
        try:
            log.info(f"Imprimiendo vía GDI vectorial ({ticket_type}) en: '{printer_name}'")
            send_gdi_to_printer(printer_name, data_bytes, ticket_type)
        except Exception as e:
            log.error(f"Fallo en GDI: {e}. Reintentando con bypass RAW...")
            send_raw_to_printer(printer_name, data_bytes)
    else:
        send_raw_to_printer(printer_name, data_bytes)

# ─── Endpoints de Flask ───────────────────────────────────────────
@app.route("/status", methods=["GET"])
def get_status():
    global PRINTER_MAP, PRINTER_PAPER_SIZES, LOGO_PATH, FONT_NAME, FONT_SIZE_PT
    config_printers = load_printer_config()
    PRINTER_MAP = config_printers["PRINTER_MAP"]
    PRINTER_PAPER_SIZES = config_printers["PRINTER_PAPER_SIZES"]
    LOGO_PATH = config_printers["LOGO_PATH"]
    FONT_NAME = config_printers["FONT_NAME"]
    FONT_SIZE_PT = config_printers["FONT_SIZE_PT"]

    installed = get_installed_printers()
    mapped = {
        key: {
            "windows_name": win_name,
            "paper_size": PRINTER_PAPER_SIZES.get(key, "80mm"),
            "available": any(p.upper() == win_name.upper() for p in installed),
        }
        for key, win_name in PRINTER_MAP.items()
    }
    return jsonify({
        "status": "online",
        "service": "COCINET Print Sentinel",
        "version": VERSION,
        "port": PORT,
        "print_mode": PRINT_MODE,
        "logo_path": LOGO_PATH,
        "font_name": FONT_NAME,
        "font_size_pt": FONT_SIZE_PT,
        "installed_printers": installed,
        "mapped_printers": mapped,
    })

@app.route("/printers", methods=["GET"])
def list_printers():
    global PRINTER_MAP
    config_printers = load_printer_config()
    PRINTER_MAP = config_printers["PRINTER_MAP"]

    installed = get_installed_printers()
    default = win32print.GetDefaultPrinter()
    return jsonify({"printers": installed, "default": default, "mapped": PRINTER_MAP})

@app.route("/print", methods=["POST"])
def print_ticket():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "No data received"}), 400
        
    printer_key  = data.get("printer", "cuentas")
    raw_data_url = data.get("raw_data", "")
    raw_bytes    = urllib.parse.unquote_to_bytes(raw_data_url)
    
    if check_duplicate_and_register(raw_bytes):
        log.info(f"⚠️ Ticket duplicado detectado vía API POST /print. Omitiendo impresión física.")
        return jsonify({"success": True, "ignored": True, "reason": "duplicate", "bytes_sent": 0})
        
    try:
        printer_name = resolve_printer_name(printer_key)
        print_data(printer_name, raw_bytes, ticket_type=printer_key)
        return jsonify({"success": True, "printer_used": printer_name, "bytes_sent": len(raw_bytes)})
    except Exception as e:
        log.error(f"❌ Error en API /print: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/test-print", methods=["POST"])
def test_print():
    try:
        data         = request.get_json(silent=True) or {}
        printer_key  = data.get("printer", "cuentas")
        printer_name = resolve_printer_name(printer_key)

        ESC = b"\x1b"
        GS  = b"\x1d"
        now = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

        test_bytes = (
            ESC + b"@"
            + ESC + b"a\x01"
            + ESC + b"!\x18"
            + b"COCINET PRO\n"
            + ESC + b"!\x00"
            + b"--- PRUEBA DE IMPRESION ---\n\n"
            + ESC + b"a\x00"
            + f"Impresora : {printer_name}\n".encode()
            + f"Sentinel  : v{VERSION}\n".encode()
            + f"Puerto    : {PORT}\n".encode()
            + f"Fecha     : {now}\n".encode()
            + b"\n"
            + ESC + b"a\x01"
            + b"Si ves este ticket la impresion\n"
            + b"funciona correctamente! :)\n"
            + b"\n\n\n"
            + GS + b"V\x41\x03"
        )

        print_data(printer_name, test_bytes, ticket_type=printer_key)
        log.info(f"[TEST] Pagina de prueba impresa en '{printer_name}'")
        return jsonify({"success": True, "printer_used": printer_name})
    except Exception as e:
        log.error(f"test-print error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/diag-print", methods=["POST"])
def diag_print():
    logs = []
    def add_log(msg):
        timestamp = datetime.now().strftime('%H:%M:%S')
        full_msg = f"{timestamp} - {msg}"
        logs.append(full_msg)
        log.info(f"[DIAG] {msg}")

    try:
        data = request.get_json(silent=True) or {}
        printer_key = data.get("printer", "cuentas")
        add_log(f"Iniciando diagnóstico para impresora clave: {printer_key}")

        printer_name = resolve_printer_name(printer_key)
        add_log(f"Impresora resuelta: {printer_name}")

        ESC = b"\x1b"
        GS  = b"\x1d"
        test_bytes = ESC + b"@" + b"Diagnostico OK\n" + GS + b"V\x41\x03"

        add_log("Intentando imprimir página de prueba de diagnóstico...")
        print_data(printer_name, test_bytes, ticket_type=printer_key)
        add_log("Impresión de diagnóstico completada.")

        return jsonify({"success": True, "logs": logs})
    except Exception as e:
        err_msg = f"Error durante diagnóstico: {str(e)}"
        add_log(err_msg)
        return jsonify({"success": False, "logs": logs, "error": str(e)}), 500

# ─── Deduplicación por Hash ───────────────────────────────────────
def generar_hash(raw_bytes: bytes) -> str:
    return hashlib.md5(raw_bytes).hexdigest()

def check_duplicate_and_register(raw_bytes: bytes, job_id: str = None) -> bool:
    ticket_hash = generar_hash(raw_bytes)
    db_path = os.path.join(BASE_DIR, "restaurant.db")
    
    try:
        conn = sqlite3.connect(db_path, timeout=30)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS print_queue (
                id TEXT PRIMARY KEY,
                printer_key TEXT NOT NULL,
                raw_data TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                printed_at TIMESTAMP
            )
        """)
        conn.commit()
        
        cursor.execute("""
            SELECT id FROM print_queue 
            WHERE hash=? AND status='printed' AND printed_at > datetime('now', '-10 seconds')
        """, (ticket_hash,))
        
        row = cursor.fetchone()
        if row:
            if job_id:
                cursor.execute("""
                    UPDATE print_queue 
                    SET status='duplicate', updated_at=CURRENT_TIMESTAMP 
                    WHERE id=?
                """, (job_id,))
                conn.commit()
            conn.close()
            return True
            
        if not job_id:
            new_id = f"http-{int(time.time() * 1000)}-{ticket_hash[:8]}"
            raw_data_encoded = urllib.parse.quote_from_bytes(raw_bytes)
            cursor.execute("""
                INSERT INTO print_queue (id, printer_key, raw_data, status, hash, printed_at)
                VALUES (?, 'http_api', ?, 'printed', ?, CURRENT_TIMESTAMP)
            """, (new_id, raw_data_encoded, ticket_hash))
            conn.commit()
            
        conn.close()
        return False
    except Exception as e:
        log.error(f"Error en validación de deduplicación: {e}")
        return False

# ─── Polling DB ───────────────────────────────────────────────────
def db_polling_loop():
    db_path = os.path.join(BASE_DIR, "restaurant.db")
    log.info(f"🔌 Iniciando polling de base de datos en: {db_path}")
    while True:
        try:
            conn = sqlite3.connect(db_path, timeout=30)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS print_queue (
                    id TEXT PRIMARY KEY,
                    printer_key TEXT NOT NULL,
                    raw_data TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    hash TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    printed_at TIMESTAMP
                )
            """)
            conn.commit()
            conn.close()
            
            conn = sqlite3.connect(db_path, timeout=30)
            conn.execute("BEGIN IMMEDIATE")
            cursor = conn.cursor()
            cursor.execute("SELECT id, printer_key, raw_data FROM print_queue WHERE status='pending'")
            jobs = cursor.fetchall()
            
            if jobs:
                for job_id, _, _ in jobs:
                    cursor.execute("UPDATE print_queue SET status='processing', updated_at=CURRENT_TIMESTAMP WHERE id=?", (job_id,))
                conn.commit()
            else:
                conn.commit()
            conn.close()
            
            for job_id, printer_key, raw_data in jobs:
                try:
                    raw_bytes = urllib.parse.unquote_to_bytes(raw_data)
                    ticket_hash = generar_hash(raw_bytes)
                    
                    if check_duplicate_and_register(raw_bytes, job_id):
                        log.info(f"⚠️ Ticket duplicado detectado en cola, no se imprime (ID: {job_id})")
                        continue
                    
                    printer_name = resolve_printer_name(printer_key)
                    print_data(printer_name, raw_bytes, ticket_type=printer_key)
                    
                    conn2 = sqlite3.connect(db_path, timeout=30)
                    cursor2 = conn2.cursor()
                    cursor2.execute("""
                        UPDATE print_queue
                        SET status='printed', updated_at=CURRENT_TIMESTAMP, printed_at=CURRENT_TIMESTAMP, hash=?
                        WHERE id=?
                    """, (ticket_hash, job_id))
                    conn2.commit()
                    conn2.close()
                    log.info(f"✅ Ticket impreso con éxito (ID: {job_id}, Impresora: {printer_name})")
                    
                except Exception as ex:
                    log.error(f"❌ Error al procesar trabajo de impresión {job_id}: {ex}")
                    conn2 = sqlite3.connect(db_path, timeout=30)
                    cursor2 = conn2.cursor()
                    cursor2.execute("UPDATE print_queue SET status='failed', updated_at=CURRENT_TIMESTAMP WHERE id=?", (job_id,))
                    conn2.commit()
                    conn2.close()
            
            time.sleep(2)
        except Exception as e:
            log.error(f"❌ Error en bucle de polling: {e}")
            time.sleep(5)

# ─── Servicio Windows ─────────────────────────────────────────────
class CocinetPrinterService(win32serviceutil.ServiceFramework):
    _svc_name_ = "CocinetPrinterSentinel"
    _svc_display_name_ = "COCINET PRO - Print Sentinel"
    _svc_description_ = "Servidor local HTTP de impresión ESC/POS para COCINET PRO."

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)

    def SvcStop(self):
        log.info("Servicio detenido por Windows SCM.")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        stop_flask()
        win32event.SetEvent(self.stop_event)

    def SvcDoRun(self):
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, ""),
        )
        log.info("Servicio iniciado por Windows SCM.")
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        win32event.WaitForSingleObject(self.stop_event, win32event.INFINITE)

def run_flask():
    db_thread = threading.Thread(target=db_polling_loop, daemon=True)
    db_thread.start()
    from werkzeug.serving import make_server
    global _flask_server
    _flask_server = make_server("0.0.0.0", PORT, app)
    log.info(f"COCINET Print Sentinel v{VERSION} escuchando en puerto {PORT}")
    _flask_server.serve_forever()

def stop_flask():
    global _flask_server
    try:
        _flask_server.shutdown()
    except Exception:
        pass

def run_console():
    print()
    print("============================================================")
    print("   COCINET PRO - Windows Print Sentinel  v3.4")
    print("============================================================")
    print(f"   URL:  http://localhost:{PORT}")
    print(f"   Modo: GDI Vectorial (Arial / Segoe UI)")
    print("------------------------------------------------------------")
    try:
        installed = get_installed_printers()
        print(f"  Impresoras detectadas ({len(installed)}):")
        for p in installed:
            found = any(v.upper() == p.upper() for v in PRINTER_MAP.values())
            tag   = "[MAPEADA]   " if found else "[disponible]"
            print(f"    {tag}  {p}")
    except Exception as e:
        print(f"  [WARN] No se pudo listar impresoras: {e}")
    print()
    print("  Presiona Ctrl+C para detener.\n")
    try:
        run_flask()
    except KeyboardInterrupt:
        print("\n  Servidor detenido.")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        run_console()
    else:
        win32serviceutil.HandleCommandLine(CocinetPrinterService)
