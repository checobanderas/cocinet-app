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

# Fix DLL search path for pywin32 in elevated UAC environment
try:
    pywin32_sys32 = os.path.join(sys.prefix, "Lib", "site-packages", "pywin32_system32")
    win32_dir = os.path.join(sys.prefix, "Lib", "site-packages", "win32")
    sys32_win = os.environ.get("SystemRoot", r"C:\Windows") + r"\System32"
    for d in (pywin32_sys32, win32_dir, sys32_win):
        if os.path.exists(d) and hasattr(os, "add_dll_directory"):
            try:
                os.add_dll_directory(d)
            except Exception:
                pass
except Exception:
    pass

try:
    import pywintypes
except Exception:
    pass

import win32print
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket

# PIL
try:
    from PIL import Image, ImageWin
except ImportError:
    pass

from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── Configuración ─────────────────────────────────────────────────
PORT    = 3010
VERSION = "6.0.0"

# ─── Helpers Pro: Total en Letra & Detección de Emojis ──────────────────────
def numero_a_letras(monto: float) -> str:
    """Convierte un monto numérico en su representación formal de texto en español (pesos mexicanos M.N.)."""
    try:
        monto = round(float(monto), 2)
        entero = int(monto)
        centavos = int(round((monto - entero) * 100))

        UNIDADES = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
        DECENAS = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
        DIEZ_A_DIECINUEVE = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"]
        CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"]

        def _convertir_grupo(n):
            if n == 0:
                return ""
            if n == 100:
                return "CIEN"
            c = n // 100
            d = (n % 100) // 10
            u = n % 10
            texto = CENTENAS[c]
            res_d = ""
            if d == 1:
                res_d = DIEZ_A_DIECINUEVE[u]
            elif d == 2:
                if u == 0: res_d = "VEINTE"
                else: res_d = f"VEINTI{UNIDADES[u]}"
            elif d > 2:
                if u == 0: res_d = DECENAS[d]
                else: res_d = f"{DECENAS[d]} Y {UNIDADES[u]}"
            elif u > 0:
                res_d = UNIDADES[u]

            if texto and res_d:
                return f"{texto} {res_d}"
            return texto or res_d

        if entero == 0:
            texto_entero = "CERO"
        else:
            partes = []
            millones = entero // 1_000_000
            resto = entero % 1_000_000
            miles = resto // 1_000
            unidades = resto % 1_000

            if millones > 0:
                if millones == 1:
                    partes.append("UN MILLON")
                else:
                    partes.append(f"{_convertir_grupo(millones)} MILLONES")
            if miles > 0:
                if miles == 1:
                    partes.append("UN MIL")
                else:
                    partes.append(f"{_convertir_grupo(miles)} MIL")
            if unidades > 0:
                partes.append(_convertir_grupo(unidades))

            texto_entero = " ".join(partes)

        moneda = "PESO" if entero == 1 else "PESOS"
        return f"SON: ({texto_entero} {moneda} {centavos:02d}/100 M.N.)"
    except Exception:
        return ""

def has_emoji(text: str) -> bool:
    """Detecta si el texto contiene caracteres Emojis Unicode."""
    for char in text:
        code = ord(char)
        if (0x1F300 <= code <= 0x1F9FF) or (0x2600 <= code <= 0x27BF) or (0x1F600 <= code <= 0x1F64F) or (0x1F680 <= code <= 0x1F6FF):
            return True
    return False

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
        "FONT_NAME": "Segoe UI",
        "FONT_SIZE_PT": 11.0,
        "HEADER_FONT_SIZE_PT": 16.0,
        "ITEM_FONT_SIZE_PT": 11.0,
        "TOTAL_FONT_SIZE_PT": 15.0,
        "MARGIN_LEFT_PX": 10,
        "MARGIN_RIGHT_PX": 25,
        "LINE_SPACING": 4,
        "SHOW_DIVIDER": True
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "PRINTER_MAP" in data and isinstance(data["PRINTER_MAP"], dict):
                    default_config["PRINTER_MAP"].update(data["PRINTER_MAP"])
                if "PRINTER_PAPER_SIZES" in data and isinstance(data["PRINTER_PAPER_SIZES"], dict):
                    default_config["PRINTER_PAPER_SIZES"].update(data["PRINTER_PAPER_SIZES"])
                if "LOGO_PATH" in data:
                    default_config["LOGO_PATH"] = data["LOGO_PATH"]
                if "FONT_NAME" in data:
                    default_config["FONT_NAME"] = data["FONT_NAME"]
                if "FONT_SIZE_PT" in data:
                    default_config["FONT_SIZE_PT"] = float(data["FONT_SIZE_PT"])
                if "HEADER_FONT_SIZE_PT" in data:
                    default_config["HEADER_FONT_SIZE_PT"] = float(data["HEADER_FONT_SIZE_PT"])
                if "ITEM_FONT_SIZE_PT" in data:
                    default_config["ITEM_FONT_SIZE_PT"] = float(data["ITEM_FONT_SIZE_PT"])
                if "TOTAL_FONT_SIZE_PT" in data:
                    default_config["TOTAL_FONT_SIZE_PT"] = float(data["TOTAL_FONT_SIZE_PT"])
                if "MARGIN_LEFT_PX" in data:
                    default_config["MARGIN_LEFT_PX"] = int(data["MARGIN_LEFT_PX"])
                if "MARGIN_RIGHT_PX" in data:
                    default_config["MARGIN_RIGHT_PX"] = int(data["MARGIN_RIGHT_PX"])
                if "LINE_SPACING" in data:
                    default_config["LINE_SPACING"] = int(data["LINE_SPACING"])
                if "SHOW_DIVIDER" in data:
                    default_config["SHOW_DIVIDER"] = bool(data["SHOW_DIVIDER"])
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

def sanitize_text(text: str) -> str:
    """Remueve cualquier caracter de control binario residual de ESC/POS (como \x1b, \x1d, LE1, E1, etc.)."""
    if not text:
        return ""
    # Remover secuencias residuales comunes de ESC/POS
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    text = re.sub(r'(?:LE[01]|E[01]|!\d+)', '', text)
    return text.strip()

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

    def flush_current():
        nonlocal current_line_text
        if current_line_text.strip():
            lines.append({
                'text': current_line_text.strip(),
                'align': align,
                'size': size,
                'bold': bold
            })
            current_line_text = ""
    
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
                    flush_current()
                    align = 0
                    bold = False
                    size = 'normal'
                    i += 2
                    continue
                # ESC a (Alineación)
                elif cmd == 0x61:
                    if i + 2 < n:
                        flush_current()
                        align = raw_bytes[i + 2]
                        i += 3
                        continue
                # ESC ! (Modo de impresión general)
                elif cmd == 0x21:
                    if i + 2 < n:
                        mode = raw_bytes[i + 2]
                        new_bold = bool(mode & 8)
                        new_size = 'big' if (mode & 48) else 'normal'
                        if new_bold != bold or new_size != size:
                            flush_current()
                            bold = new_bold
                            size = new_size
                        i += 3
                        continue
                # ESC E (Negrita)
                elif cmd == 0x45:
                    if i + 2 < n:
                        new_bold = bool(raw_bytes[i + 2])
                        if new_bold != bold:
                            flush_current()
                            bold = new_bold
                        i += 3
                        continue
                # ESC d (Avanzar N líneas)
                elif cmd == 0x64:
                    if i + 2 < n:
                        feed_count = raw_bytes[i + 2]
                        flush_current()
                        for _ in range(max(1, feed_count - 1)):
                            lines.append({
                                'text': '',
                                'align': align,
                                'size': size,
                                'bold': bold
                            })
                        i += 3
                        continue
                # Descartar otros comandos ESC de 2 o 3 bytes
                elif cmd in (0x4a, 0x33, 0x32, 0x4d, 0x7b, 0x56):
                    i += 3
                    continue
            i += 2
            continue
            
        # Comando GS (0x1d / 29)
        elif b == 0x1d:
            if i + 1 < n:
                cmd = raw_bytes[i + 1]
                # GS V (Corte de papel)
                if cmd == 0x56:
                    if i + 2 < n and raw_bytes[i + 2] in (65, 66):
                        i += 4
                        continue
                    else:
                        i += 3
                        continue
                elif cmd in (0x21, 0x42, 0x6b, 0x77, 0x68):
                    i += 3
                    continue
            i += 2
            continue
            
        # Salto de línea (LF = 0x0a / 10)
        elif b == 0x0a:
            flush_current()
            i += 1
            
        # Retorno de carro (CR = 0x0d / 13)
        elif b == 0x0d:
            if i + 1 < n and raw_bytes[i + 1] == 0x0a:
                i += 1
            else:
                flush_current()
                i += 1
            
        # Caracteres normales del ticket
        else:
            decoded = False
            # Intentar decodificar secuencias UTF-8 multibyte (hasta 4 bytes) para preservar Emojis (🌮, 🍺, 🔔, 💰, etc.)
            for length in (4, 3, 2, 1):
                if i + length <= n:
                    try:
                        char_str = raw_bytes[i:i+length].decode('utf-8')
                        current_line_text += char_str
                        i += length
                        decoded = True
                        break
                    except UnicodeDecodeError:
                        continue
            if not decoded:
                try:
                    char_str = raw_bytes[i:i+1].decode('cp850')
                except Exception:
                    char_str = chr(b)
                current_line_text += char_str
                i += 1
            
    flush_current()
        
    # Sanitizar todas las líneas para remover basura binaria
    cleaned_lines = []
    for l in lines:
        cleaned_text = sanitize_text(l['text'])
        if cleaned_text or l['text'] == '':
            cleaned_lines.append({**l, 'text': cleaned_text})

    return cleaned_lines

# ─── Motores de Impresión ─────────────────────────────────────────
def get_installed_printers() -> list:
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    return [p[2] for p in win32print.EnumPrinters(flags)]

def resolve_printer_name(key: str) -> str:
    global PRINTER_MAP
    try:
        config_printers = load_printer_config()
        PRINTER_MAP = config_printers.get("PRINTER_MAP", PRINTER_MAP)
    except Exception:
        pass
        
    target = PRINTER_MAP.get(key.lower(), key)
    installed = get_installed_printers()
    if not installed:
        raise ValueError("No hay impresoras instaladas en el sistema Windows.")
        
    # 1. Coincidencia exacta
    for p in installed:
        if p.upper() == target.upper():
            return p
            
    # 2. Coincidencia parcial (subcadena)
    for p in installed:
        if target.upper() in p.upper() or p.upper() in target.upper():
            return p
            
    # 3. Fallback a la impresora predeterminada de Windows
    try:
        default_win = win32print.GetDefaultPrinter()
        if default_win in installed:
            log.info(f"⚠️ Impresora '{target}' no mapeada explícitamente. Redirigiendo a la predeterminada de Windows: '{default_win}'")
            return default_win
    except Exception:
        pass
        
    # 4. Fallback a la primera impresora instalada
    first_printer = installed[0]
    log.info(f"⚠️ Impresora '{target}' no encontrada. Redirigiendo a la primera impresora disponible: '{first_printer}'")
    return first_printer

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
    target_logo = None
    possible_paths = [
        logo_path,
        "C:\\buzon\\logoroy.png",
        "C:\\buzon\\logo.png",
        "C:\\buzon\\logo.jpg",
        "C:\\buzon\\INSTALADOR_SENTINELA\\logoroy.png",
        "C:\\buzon\\INSTALADOR_SENTINELA\\logo.png",
        "C:\\buzon\\INSTALADOR_SENTINELA\\logo.jpg",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "logoroy.png"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo.png"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo.jpg"),
    ]
    for p in possible_paths:
        if p and os.path.exists(p):
            target_logo = p
            break

    if not target_logo:
        log.warning("No se encontró logotipo físico en ninguna de las rutas de búsqueda.")
        return y_start

    try:
        from PIL import Image, ImageWin
        img = Image.open(target_logo)
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        w, h = img.size
        max_logo_width = int(printable_width * 0.45)
        scale = max_logo_width / float(w)
        new_w = max_logo_width
        new_h = int(h * scale)
        
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        margin_left = 25
        x_start = margin_left + max(0, (printable_width - new_w) // 2)
        
        hdc_handle = hDC.GetSafeHdc()
        dib = ImageWin.Dib(img)
        dib.draw(hdc_handle, (x_start, y_start, x_start + new_w, y_start + new_h))
        return y_start + new_h + 15
    except Exception as e:
        log.error(f"Error renderizando el logotipo GDI ({target_logo}): {e}")
        return y_start

def wrap_and_draw_text(hDC, text: str, margin_left: int, margin_right: int, printable_width: int, y: int, align: int = 0, line_spacing: int = 4) -> int:
    """Renderiza texto con ajuste de línea automático para evitar recortes en los bordes del papel."""
    if not text:
        return y
        
    text_w, text_h = hDC.GetTextExtent(text)
    if text_w <= printable_width:
        if align == 1:    # Centro
            x = margin_left + (printable_width - text_w) // 2
        elif align == 2:  # Derecha
            x = margin_left + printable_width - text_w
        else:             # Izquierda
            x = margin_left
        hDC.TextOut(x, y, text)
        return y + text_h + line_spacing

    words = text.split(" ")
    lines_to_draw = []
    curr_line = ""
    
    for word in words:
        test_line = f"{curr_line} {word}".strip() if curr_line else word
        w, _ = hDC.GetTextExtent(test_line)
        if w <= printable_width:
            curr_line = test_line
        else:
            if curr_line:
                lines_to_draw.append(curr_line)
            w_word, _ = hDC.GetTextExtent(word)
            if w_word > printable_width:
                sub = ""
                for char in word:
                    if hDC.GetTextExtent(sub + char)[0] <= printable_width:
                        sub += char
                    else:
                        lines_to_draw.append(sub)
                        sub = char
                curr_line = sub
            else:
                curr_line = word
                
    if curr_line:
        lines_to_draw.append(curr_line)
        
    for l_text in lines_to_draw:
        tw, th = hDC.GetTextExtent(l_text)
        if align == 1:    # Centro
            x = margin_left + (printable_width - tw) // 2
        elif align == 2:  # Derecha
            x = margin_left + printable_width - tw
        else:             # Izquierda
            x = margin_left
        hDC.TextOut(x, y, l_text)
        y += th + line_spacing
        
    return y

def send_gdi_to_printer(printer_name: str, data_bytes: bytes, ticket_type: str = "comanda"):
    """Parsea el ticket de comandos ESC/POS y lo dibuja vectorialmente usando el GDI de Windows."""
    import pywintypes
    import win32ui
    import win32con

    global PRINTER_MAP, PRINTER_PAPER_SIZES, LOGO_PATH, FONT_NAME, FONT_SIZE_PT
    config_printers = load_printer_config()
    PRINTER_MAP = config_printers["PRINTER_MAP"]
    PRINTER_PAPER_SIZES = config_printers["PRINTER_PAPER_SIZES"]
    LOGO_PATH = config_printers["LOGO_PATH"]
    FONT_NAME = config_printers["FONT_NAME"]
    FONT_SIZE_PT = config_printers["FONT_SIZE_PT"]

    parsed_lines = parse_escpos(data_bytes)
    
    printer_key = "cuentas"
    for k, v in PRINTER_MAP.items():
        if v.upper() == printer_name.upper():
            printer_key = k
            break
            
    paper_size = PRINTER_PAPER_SIZES.get(printer_key, "80mm")
    
    hDC = win32ui.CreateDC()
    hDC.CreatePrinterDC(printer_name)
    hDC.SetMapMode(win32con.MM_TEXT)
    hDC.SetBkMode(win32con.TRANSPARENT)
    
    dpi_y = hDC.GetDeviceCaps(win32con.LOGPIXELSY) or 203
    
    # Obtener el ancho real de la superficie de impresión informada por el driver de Windows (DC)
    dev_width = hDC.GetDeviceCaps(win32con.HORZRES) or hDC.GetDeviceCaps(win32con.PHYSICALWIDTH)
    if dev_width and dev_width > 150:
        width = dev_width
    else:
        width = 370 if paper_size == "58mm" else 540
        
    margin_left = 15 if paper_size == "58mm" else 25
    margin_right = 15 if paper_size == "58mm" else 25
    printable_width = width - margin_left - margin_right
    job_name = f"COCINET-GDI-{paper_size}-{datetime.now().strftime('%H%M%S')}"
    hDC.StartDoc(job_name)
    hDC.StartPage()
    
    font_cache = {}
    
    def get_font(name, pt_size, is_bold, is_italic=False, use_emoji_font=False):
        font_name_to_use = "Segoe UI Emoji" if (use_emoji_font or name == "Segoe UI Emoji") else name
        key = (font_name_to_use, pt_size, is_bold, is_italic)
        if key in font_cache:
            return font_cache[key]
        height = int(pt_size * dpi_y / 72)
        f = win32ui.CreateFont({
            "name": font_name_to_use,
            "height": height,
            "weight": win32con.FW_BOLD if is_bold else win32con.FW_NORMAL,
            "italic": is_italic,
            "charset": win32con.DEFAULT_CHARSET
        })
        font_cache[key] = f
        return f

    y = 20
    
    # Dibujar logotipo para todos los tickets comerciales (cuentas/precuentas/caja)
    if ticket_type.lower() not in ["cocina", "barra"]:
        y = draw_logo_on_dc(hDC, LOGO_PATH, width, y, dpi_y)
    
    # Escalar tamaño base de tipografía
    base_pt = FONT_SIZE_PT
    if paper_size == "58mm":
        base_pt = base_pt * 0.82
        
    # Pre-procesamiento: separar renglones concatenados
    expanded_lines = []
    for l in parsed_lines:
        txt = l['text'].strip()
        if not txt:
            expanded_lines.append(l)
            continue
            
        # 1. Separar si vienen múltiples productos concatenados
        item_split_pattern = r'(\d+\s*(?:x|X)\s+.*?(?:\$?[0-9]+(?:\.[0-9]{1,2})?)(?=\s*\d+\s*(?:x|X)\s+|$))'
        found_items = re.findall(item_split_pattern, txt, flags=re.IGNORECASE)
        if len(found_items) > 1:
            for item_str in found_items:
                if item_str.strip():
                    expanded_lines.append({**l, 'text': item_str.strip()})
            continue

        # 2. Evitar recortar 'SUBTOTAL' en 'SUB' + 'TOTAL' usando Lookbehind Negativo (?<!SUB)
        keywords_pattern = r'(?=(?:RFC|REGIMEN|LUGAR|DIR|TEL|EMAIL|SUC|FOLIO|REIMPRESION|PRECUENTA|MESA|FECHA|HORA|LE ATENDIO|LE ATENDIÓ|ATENDIDO POR|MESERO|PAGO|SUBTOTAL|(?<!SUB)TOTAL|PROPINA|DESCUENTO|CAMBIO)\s*:)'
        found_parts = re.split(keywords_pattern, txt, flags=re.IGNORECASE)
        if len(found_parts) > 1:
            for p in found_parts:
                if p.strip():
                    expanded_lines.append({**l, 'text': p.strip()})
        else:
            expanded_lines.append(l)

    # 3. Fusionar líneas de producto que se hayan dividido entre cantidad/nombre y precio
    merged_lines = []
    idx = 0
    while idx < len(expanded_lines):
        curr = expanded_lines[idx]
        curr_text = curr['text'].strip()
        has_qty_only = bool(re.match(r'^\s*\d+\s*(?:x|X)\s+', curr_text, re.IGNORECASE)) and not bool(re.search(r'\$?[0-9]+(?:\.[0-9]{1,2})?\s*$', curr_text))
        if has_qty_only and idx + 1 < len(expanded_lines):
            nxt_text = expanded_lines[idx + 1]['text'].strip()
            if bool(re.match(r'^\$?[0-9]+(?:\.[0-9]{1,2})?\s*$', nxt_text)):
                merged_lines.append({**curr, 'text': f"{curr_text} {nxt_text}"})
                idx += 2
                continue
        merged_lines.append(curr)
        idx += 1

    header_drawn = False
    in_table_phase = False
        
    for line in merged_lines:
        text = line['text'].strip()
        alignment = line['align']
        size_mode = line['size']
        is_bold = line['bold']
        line_has_emoji = has_emoji(text)
        
        # 1. Líneas divisorias vectoriales elegantes
        if len(text) >= 10 and all(c in ('-', '=', '_', '*') for c in text):
            pen = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x94a3b8)
            hDC.SelectObject(pen)
            hDC.MoveTo(margin_left, y + 5)
            hDC.LineTo(width - margin_right, y + 5)
            y += 14
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
            pt = base_pt * 1.30
            bold_to_use = True
        elif size_mode == 'small':
            pt = base_pt * 0.75
            bold_to_use = is_bold
        else:
            pt = base_pt
            bold_to_use = is_bold
            
        f = get_font(FONT_NAME, pt, bold_to_use, use_emoji_font=line_has_emoji)
        hDC.SelectObject(f)

        # 3. Detectar Renglón de Producto
        is_item_line = bool(re.match(r'^\s*\d+\s*(?:x|X)\s+', text, re.IGNORECASE)) or bool(re.search(r'\$?[0-9]+(?:\.[0-9]{1,2})?\s*$', text))
        
        if is_item_line and not any(k in text.upper() for k in ["TOTAL", "SUBTOTAL", "PROPINA", "DESCUENTO", "CAMBIO", "FECHA", "HORA", "MESA", "FOLIO", "SUC", "RFC", "REGIMEN", "LUGAR", "DIR", "TEL", "EMAIL", "LE ATENDIO", "LE ATENDIÓ", "ATENDIDO POR", "MESERO"]):
            in_table_phase = True
            
            # Encabezado de tabla si es la primera vez
            if not header_drawn and ticket_type.lower() in ["cuentas", "cuenta", "precuenta"]:
                header_drawn = True
                y += 6
                pen_tbl = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x334155)
                hDC.SelectObject(pen_tbl)
                hDC.MoveTo(margin_left, y + 2)
                hDC.LineTo(width - margin_right, y + 2)
                y += 8
                fh = get_font(FONT_NAME, base_pt * 0.88, True)
                hDC.SelectObject(fh)
                hDC.TextOut(margin_left, y, "CANT / DESCRIPCIÓN")
                w_imp, h_imp = hDC.GetTextExtent("IMPORTE")
                x_imp = max(margin_left + 150, width - margin_right - w_imp)
                hDC.TextOut(x_imp, y, "IMPORTE")
                y += h_imp + 4
                hDC.MoveTo(margin_left, y + 2)
                hDC.LineTo(width - margin_right, y + 2)
                y += 10
                hDC.SelectObject(f)
            
            # Extraer Cantidad/Descripción/Precio
            qty_match = re.match(r'^\s*(\d+)\s*(?:x|X)?\s+(.*)$', text, re.IGNORECASE)
            qty_val = qty_match.group(1) if qty_match else "1"
            rem_text = qty_match.group(2).strip() if qty_match else text.strip()
            imp_match = re.search(r'(\$?[0-9]+(?:\.[0-9]{1,2})?)\s*$', rem_text)
            imp_str = imp_match.group(1) if imp_match else ""
            desc = rem_text[:imp_match.start()].strip() if imp_match else rem_text
                
            item_pt = base_pt * 0.88
            fp = get_font(FONT_NAME, item_pt, True)
            hDC.SelectObject(fp)
            
            if imp_str:
                pr_w, pr_h = hDC.GetTextExtent(imp_str)
                x_right = max(margin_left + 120, width - margin_right - pr_w)
                hDC.TextOut(x_right, y, imp_str)
            else:
                x_right = width - margin_right
                
            full_desc = f"{qty_val}x {desc}"
            max_desc_w = x_right - margin_left - 10
            while full_desc and hDC.GetTextExtent(full_desc)[0] > max_desc_w:
                full_desc = full_desc[:-1]
            hDC.TextOut(margin_left, y, full_desc)
            _, desc_h = hDC.GetTextExtent(full_desc)
            y += max(desc_h, int(item_pt * dpi_y / 72)) + 5
            continue
        
        # 3.5. Formatear Fecha y Hora
        if any(k in text.upper() for k in ["FECHA:", "HORA:"]):
            f_dt = get_font(FONT_NAME, pt * 1.05, True, use_emoji_font=True)
            hDC.SelectObject(f_dt)
            y = wrap_and_draw_text(hDC, text, margin_left, margin_right, printable_width, y, align=0, line_spacing=4)
            continue
        
        # 4. Totales
        total_match = re.search(r'^(TOTAL A PAGAR|TOTAL|SUBTOTAL|SUMA TOTAL|PROPINA MESEROS|PROPINA VOLUNTARIA|PROPINA|DESCUENTO|FORMA DE PAGO|PAGO|PAGA CON|RECIBIDO|CAMBIO|LE ATENDIO|LE ATENDIÓ|ATENDIDO POR|MESERO|MESA)\s*:?\s*(.*)$', text, re.IGNORECASE)
        has_total_keyword = bool(total_match or ("TOTAL" in text.upper() and "SUBTOTAL" not in text.upper()))
        
        if has_total_keyword:
            if in_table_phase:
                in_table_phase = False
                pen_end = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x334155)
                hDC.SelectObject(pen_end)
                hDC.MoveTo(margin_left, y + 2)
                hDC.LineTo(width - margin_right, y + 2)
                y += 12

            if total_match:
                label = total_match.group(1).upper() + ":"
                val = total_match.group(2).strip()
            else:
                parts = text.split(":", 1)
                label = parts[0].strip().upper() + ":"
                val = parts[1].strip() if len(parts) > 1 else ""

            is_total_label = ("TOTAL" in label or "TOTAL" in text.upper()) and "SUBTOTAL" not in text.upper()
            
            lbl_pt = pt * 1.15 if is_total_label else pt
            lbl_str = "TOTAL A PAGAR:" if is_total_label else label
            fl = get_font(FONT_NAME, lbl_pt, is_total_label or is_bold, use_emoji_font=has_emoji(lbl_str))
            hDC.SelectObject(fl)
            
            # Posicionar etiquetas al margen izquierdo para evitar colisión con importes a la derecha
            lbl_w, lbl_h = hDC.GetTextExtent(lbl_str)
            x_lbl = margin_left
            hDC.TextOut(x_lbl, y, lbl_str)
            
            val_pt = pt * 1.25 if is_total_label else pt
            fb = get_font(FONT_NAME, val_pt, True, use_emoji_font=has_emoji(val))
            hDC.SelectObject(fb)
            val_width, val_height = hDC.GetTextExtent(val)
            x_val = max(margin_left + lbl_w + 10, width - margin_right - val_width)
            hDC.TextOut(x_val, y, val)
            y += max(lbl_h, val_height) + 6
            
            # SI ES EL TOTAL PRINCIPAL, DIBUJAR AUTOMÁTICAMENTE EL TOTAL EN LETRA DEBAJO
            if is_total_label:
                monto_match = re.search(r'([0-9.,]+)', val)
                if monto_match:
                    try:
                        monto_clean = float(monto_match.group(1).replace(',', ''))
                        letra_str = numero_a_letras(monto_clean)
                        if letra_str:
                            f_letra = get_font(FONT_NAME, base_pt * 0.82, True, is_italic=True, use_emoji_font=has_emoji(letra_str))
                            hDC.SelectObject(f_letra)
                            y = wrap_and_draw_text(hDC, letra_str, margin_left, margin_right, printable_width, y, align=1, line_spacing=3)
                            
                            pen_tot = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x475569)
                            hDC.SelectObject(pen_tot)
                            hDC.MoveTo(margin_left, y + 2)
                            hDC.LineTo(width - margin_right, y + 2)
                            y += 12
                    except Exception as e:
                        log.error(f"Error calculando total en letra: {e}")
            continue

        # 5. Renderizar notas del producto (líneas con asterisco *) con itálicas e indentadas
        if text.startswith('*') or text.startswith('>'):
            f_italic = get_font(FONT_NAME, pt, False, is_italic=True, use_emoji_font=has_emoji(text))
            hDC.SelectObject(f_italic)
            y = wrap_and_draw_text(hDC, text, margin_left + 40, margin_right, printable_width - 40, y, align=0, line_spacing=3)
            continue
            
        # 6. Renderizar líneas comunes y pie de página con envoltorio automático
        f_line = get_font(FONT_NAME, pt, bold_to_use, use_emoji_font=line_has_emoji)
        hDC.SelectObject(f_line)
        y = wrap_and_draw_text(hDC, text, margin_left, margin_right, printable_width, y, align=alignment, line_spacing=4)
        
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
@app.route("/config", methods=["GET", "POST"])
def manage_config():
    if request.method == "POST":
        try:
            data = request.get_json(silent=True) or {}
            current = load_printer_config()
            current.update(data)
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(current, f, indent=4, ensure_ascii=False)
            load_printer_config()
            return jsonify({"success": True, "config": current})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
    else:
        cfg = load_printer_config()
        return jsonify({"success": True, "config": cfg})

@app.route("/download/<filename>", methods=["GET"])
def download_sentinel_file(filename):
    safe_files = ["sentinel_printer.py", "instalador.bat", "instalador_sentinela.py", "printer_config.json"]
    if filename not in safe_files:
        return jsonify({"error": "File not allowed"}), 400
    file_path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    from flask import send_file
    return send_file(file_path, as_attachment=True)

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
        "config": config_printers,
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
            + "🌮 TACOS ROY AZUCENAS 🌮\n".encode("utf-8")
            + ESC + b"!\x00"
            + "=== TICKET PRO GDI VECTORIAL ===\n\n".encode("utf-8")
            + ESC + b"a\x00"
            + f"Impresora : {printer_name}\n".encode("utf-8")
            + f"Sentinel  : v{VERSION} (Puerto {PORT})\n".encode("utf-8")
            + f"Fecha     : {now}\n".encode("utf-8")
            + "Atendio   : BLADIMIR (ADMIN) 👤\n".encode("utf-8")
            + "----------------------------------------\n".encode("utf-8")
            + "2 x 🌮 TACOS AL PASTOR      $100.00\n".encode("utf-8")
            + "  * Con todo y salsa verde\n".encode("utf-8")
            + "1 x 🍺 CERVEZA ARTESANAL    $80.00\n".encode("utf-8")
            + "1 x 🍹 MARGARITA AZUL       $95.50\n".encode("utf-8")
            + "----------------------------------------\n".encode("utf-8")
            + "SUBTOTAL: $275.50\n".encode("utf-8")
            + "PROPINA (10%): $27.55\n".encode("utf-8")
            + "TOTAL: $303.05\n".encode("utf-8")
            + "----------------------------------------\n".encode("utf-8")
            + ESC + b"a\x01"
            + "¡Gracias por su preferencia! ⭐\n".encode("utf-8")
            + "Facturacion: www.cocinet.app 🌐\n".encode("utf-8")
            + "\n\n\n"
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
