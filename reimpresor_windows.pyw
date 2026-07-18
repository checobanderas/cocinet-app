import tkinter as tk
from tkinter import ttk, messagebox
import threading
import requests
import json
import os
import sqlite3
from datetime import datetime
import urllib.parse

# --- CONFIGURACIÓN ESTATICA ---
CONFIG_FILE = "local_printer_config.json"
SENTINEL_URL = "http://localhost:3010"
# Ruta de la base de datos local sincronizada por el servidor Node
DB_PATH = "restaurant.db"

class ReimpresorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Sincronización Cocinet Pro - Dashboard")
        self.root.geometry("1300x850")
        self.root.configure(bg="#0f172a") # Estilo oscuro premium

        self.pedidos_data = [] 
        self.cuentas_data = []
        self.tenant_name = "CARGANDO..."
        self.branch_name = "..."
        
        self.setup_ui()
        self.check_sentinel_status()
        self.start_auto_refresh()

    def setup_ui(self):
        style = ttk.Style()
        style.theme_use("clam")
        
        # Estilo oscuro/elegante
        style.configure("TFrame", background="#0f172a")
        style.configure("TLabel", background="#0f172a", foreground="#f8fafc", font=("Segoe UI", 10))
        style.configure("Header.TLabel", font=("Segoe UI", 22, "bold"), foreground="#38bdf8")
        style.configure("SubHeader.TLabel", font=("Segoe UI", 14), foreground="#94a3b8")
        style.configure("Treeview", font=("Consolas", 10), rowheight=30, background="#1e293b", foreground="#f8fafc", fieldbackground="#1e293b")
        style.configure("Treeview.Heading", font=("Segoe UI", 10, "bold"), background="#334155", foreground="#f8fafc")
        
        # Top Bar
        self.top_frame = ttk.Frame(self.root)
        self.top_frame.pack(fill="x", padx=20, pady=15)
        
        self.header_label = ttk.Label(self.top_frame, text="Sincronizando...", style="Header.TLabel")
        self.header_label.pack(side="left")
        
        self.status_label = ttk.Label(self.top_frame, text="● Buscando Centinela...", font=("Segoe UI", 10, "bold"), foreground="#94a3b8")
        self.status_label.pack(side="right")

        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        # --- TAB COMANDAS (MESAS ACTIVAS) ---
        self.tab_p = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_p, text="   📝 COMANDAS ACTIVAS (TIEMPO REAL)   ")
        
        # Frame para Treeview + Scrollbars
        self.tree_p_frame = ttk.Frame(self.tab_p)
        self.tree_p_frame.pack(fill="both", expand=True, padx=10, pady=10)

        columns_p = ("folio", "mesa", "timestamp", "summary", "items_count", "createdBy")
        self.tree_p = ttk.Treeview(self.tree_p_frame, columns=columns_p, show="headings")
        self.tree_p.heading("folio", text="Folio")
        self.tree_p.heading("mesa", text="Mesa")
        self.tree_p.heading("timestamp", text="Fecha/Hora")
        self.tree_p.heading("summary", text="Productos en Comanda")
        self.tree_p.heading("items_count", text="Cant.")
        self.tree_p.heading("createdBy", text="Mesero")
        
        self.tree_p.column("folio", width=100, anchor="center", minwidth=80)
        self.tree_p.column("mesa", width=120, anchor="center", minwidth=100)
        self.tree_p.column("timestamp", width=200, minwidth=150)
        self.tree_p.column("summary", width=700, minwidth=400)
        self.tree_p.column("items_count", width=100, anchor="center", minwidth=60)
        self.tree_p.column("createdBy", width=180, minwidth=120)
        
        # Scrollbars para Comandas
        vsb_p = ttk.Scrollbar(self.tree_p_frame, orient="vertical", command=self.tree_p.yview)
        hsb_p = ttk.Scrollbar(self.tree_p_frame, orient="horizontal", command=self.tree_p.xview)
        self.tree_p.configure(yscrollcommand=vsb_p.set, xscrollcommand=hsb_p.set)
        
        self.tree_p.grid(row=0, column=0, sticky="nsew")
        vsb_p.grid(row=0, column=1, sticky="ns")
        hsb_p.grid(row=1, column=0, sticky="ew")
        
        self.tree_p_frame.grid_rowconfigure(0, weight=1)
        self.tree_p_frame.grid_columnconfigure(0, weight=1)
        
        frame_btn_p = ttk.Frame(self.tab_p)
        frame_btn_p.pack(fill="x", padx=10, pady=5)
        ttk.Button(frame_btn_p, text="🔄 REFRESCAR AHORA", command=self.refresh_from_sqlite).pack(side="left", padx=10)
        ttk.Button(frame_btn_p, text="🖨️ REIMPRIMIR COMANDA", command=self.reprint_comanda).pack(side="right", padx=10)

        # --- TAB CUENTAS (HISTORIAL) ---
        self.tab_c = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_c, text="   💰 HISTORIAL DE CUENTAS CERRADAS   ")
        
        self.tree_c_frame = ttk.Frame(self.tab_c)
        self.tree_c_frame.pack(fill="both", expand=True, padx=10, pady=10)

        columns_c = ("folio", "timestamp", "mesa", "total", "metodo", "items", "id")
        self.tree_c = ttk.Treeview(self.tree_c_frame, columns=columns_c, show="headings")
        self.tree_c.heading("folio", text="Folio")
        self.tree_c.heading("timestamp", text="Cierre")
        self.tree_c.heading("mesa", text="Mesa")
        self.tree_c.heading("total", text="Total $")
        self.tree_c.heading("metodo", text="Pago")
        self.tree_c.heading("items", text="Resumen")
        self.tree_c.heading("id", text="ID Transacción")

        self.tree_c.column("folio", width=120, anchor="center", minwidth=100)
        self.tree_c.column("timestamp", width=200, minwidth=180)
        self.tree_c.column("mesa", width=120, anchor="center", minwidth=100)
        self.tree_c.column("total", width=120, anchor="e", minwidth=100)
        self.tree_c.column("metodo", width=150, minwidth=120)
        self.tree_c.column("items", width=600, minwidth=400)
        self.tree_c.column("id", width=300, minwidth=200)

        # Scrollbars para Cuentas
        vsb_c = ttk.Scrollbar(self.tree_c_frame, orient="vertical", command=self.tree_c.yview)
        hsb_c = ttk.Scrollbar(self.tree_c_frame, orient="horizontal", command=self.tree_c.xview)
        self.tree_c.configure(yscrollcommand=vsb_c.set, xscrollcommand=hsb_c.set)
        
        self.tree_c.grid(row=0, column=0, sticky="nsew")
        vsb_c.grid(row=0, column=1, sticky="ns")
        hsb_c.grid(row=1, column=0, sticky="ew")
        
        self.tree_c_frame.grid_rowconfigure(0, weight=1)
        self.tree_c_frame.grid_columnconfigure(0, weight=1)
        
        frame_btn_c = ttk.Frame(self.tab_c)
        frame_btn_c.pack(fill="x", padx=10, pady=5)
        ttk.Button(frame_btn_c, text="🔄 REFRESCAR HISTORIAL", command=self.refresh_from_sqlite).pack(side="left", padx=10)
        ttk.Button(frame_btn_c, text="🖨️ REIMPRIMIR TICKET", command=self.reprint_cuenta).pack(side="right", padx=10)

    def start_auto_refresh(self):
        """Refresco automático cada 3 segundos para sincronización continua ⚡"""
        self.refresh_from_sqlite()
        self.root.after(3000, self.start_auto_refresh)

    def refresh_from_sqlite(self):
        if not os.path.exists(DB_PATH):
            return
            
        try:
            if not os.path.exists(DB_PATH):
                self.status_label.config(text="⚠️ Esperando base de datos...", foreground="orange")
                return

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # 1. Cargar Configuración (Nombre Tenant / Sucursal)
            cursor.execute("SELECT key, value FROM app_config")
            configs = {row['key']: row['value'] for row in cursor.fetchall()}
            self.tenant_name = configs.get('tenant_name', 'Cocinet Pro')
            self.branch_name = configs.get('branch_name', 'Sucursal Matriz')
            
            new_title = f"{self.tenant_name.upper()} - {self.branch_name.upper()}"
            self.header_label.config(text=new_title)
            self.root.title(f"DASHBOARD COCINET - {new_title}")
            
            # 2. Cargar Comandas Activas (Usamos LEFT JOIN para evitar perder datos si falta la mesa)
            cursor.execute("""
                SELECT c.*, t.label as mesa_label, 
                (SELECT GROUP_CONCAT(ci.quantity || 'x ' || COALESCE(p.name, ci.productId), ', ') 
                 FROM comanda_items ci 
                 LEFT JOIN products p ON ci.productId = p.id 
                 WHERE ci.folio = c.folio AND ci.isCancelled = 0) as summary,
                (SELECT SUM(quantity) FROM comanda_items WHERE folio = c.folio AND isCancelled = 0) as items_count
                FROM comandas c
                LEFT JOIN tables t ON c.tableId = t.id
                ORDER BY c.timestamp DESC
            """)
            self.pedidos_data = [dict(row) for row in cursor.fetchall()]
            self.update_tree_p()
            
            # 3. Cargar Cuentas Cerradas (Alias id as folio for UI consistency)
            cursor.execute("SELECT *, id as folio FROM closed_accounts ORDER BY timestamp DESC LIMIT 50")
            self.cuentas_data = [dict(row) for row in cursor.fetchall()]
            self.update_tree_c()
            
            conn.close()
            self.status_label.config(text=f"✅ Sincronizado: {time.strftime('%H:%M:%S')}", foreground="#10b981")
        except Exception as e:
            print(f"Error refreshing from SQLite: {e}")
            self.status_label.config(text=f"❌ Error: {str(e)[:40]}...", foreground="#ef4444")

    def update_tree_p(self):
        for i in self.tree_p.get_children(): self.tree_p.delete(i)
        for p in self.pedidos_data:
            self.tree_p.insert("", "end", values=(
                p.get("folio", "S/F"),
                p.get("mesa_label", "N/A"),
                p.get("timestamp", "N/A"),
                p.get("summary", "Sin productos"),
                p.get("items_count", 0),
                p.get("createdBy", "Sistema")
            ))

    def update_tree_c(self):
        for i in self.tree_c.get_children(): self.tree_c.delete(i)
        for c in self.cuentas_data:
            # Parsear resumen de productos del JSON si existe
            items_summary = "N/A"
            try:
                comandas = json.loads(c.get("comandasJson", "[]"))
                it_list = []
                for com in comandas:
                    for it in com.get("items", []):
                        if not it.get("isCancelled"):
                            name = it.get("product", {}).get("name", it.get("nombre", "Item"))
                            it_list.append(name)
                items_summary = ", ".join(it_list[:5])
            except: pass

            self.tree_c.insert("", "end", values=(
                c.get("folio", "N/A"),
                c.get("timestamp", "N/A"),
                c.get("tableLabel", "N/A"),
                f"${c.get('total', 0):.2f}",
                c.get("paymentMethod", "Efectivo"),
                items_summary,
                c.get("id", "N/A")
            ))

    def reprint_comanda(self):
        sel = self.tree_p.selection()
        if not sel: return
        idx = self.tree_p.index(sel[0])
        p = self.pedidos_data[idx]
        
        # Preparar data para el centinela
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT ci.*, p.name as product_name, p.destination 
                FROM comanda_items ci 
                JOIN products p ON ci.productId = p.id 
                WHERE ci.folio = ? AND ci.isCancelled = 0
            """, (p['folio'],))
            items_rows = cursor.fetchall()
            conn.close()
            
            items = []
            printer_key = "cocina"
            for row in items_rows:
                items.append({"nombre": row['product_name'], "cantidad": row['quantity']})
                if row['destination'] and "bar" in row['destination'].lower(): printer_key = "barra"
                
            data = {
                "folio": p['folio'],
                "mesa": p['mesa_label'],
                "items": items,
                "total": 0,
                "tipo": "REIMPRESION COMANDA"
            }
            self.send_to_sentinel(data, printer_key)
        except Exception as e:
            messagebox.showerror("Error", f"Error al reimprimir: {e}")

    def reprint_cuenta(self):
        sel = self.tree_c.selection()
        if not sel: return
        idx = self.tree_c.index(sel[0])
        cuenta = self.cuentas_data[idx]
        
        try:
            comandas = json.loads(cuenta.get("comandasJson", "[]"))
            items = []
            for com in comandas:
                for it in com.get("items", []):
                    if not it.get("isCancelled"):
                        name = it.get("product", {}).get("name", it.get("nombre", "Item"))
                        qty = it.get("quantity", it.get("cantidad", 1))
                        items.append({"nombre": name, "cantidad": qty})
            
            data = {
                "folio": cuenta.get("folio", ""),
                "mesa": cuenta.get("tableLabel", "N/A"),
                "items": items,
                "total": cuenta.get("total", 0),
                "tipo": "REIMPRESION TICKET"
            }
            self.send_to_sentinel(data, "cuentas")
        except Exception as e:
            messagebox.showerror("Error", f"Error al procesar ticket: {e}")

    def check_sentinel_status(self):
        def task():
            try:
                res = requests.get(f"{SENTINEL_URL}/status", timeout=2)
                self.root.after(0, lambda: self.update_status_bar(res.ok))
            except:
                self.root.after(0, lambda: self.update_status_bar(False))
            self.root.after(5000, self.check_sentinel_status)
        threading.Thread(target=task, daemon=True).start()

    def update_status_bar(self, sentinel_online=None):
        if sentinel_online is None:
            sentinel_online = "Activo" in self.status_label.cget("text")
            
        sentinel_text = "Centinela: Activo ✅" if sentinel_online else "Centinela: Desconectado ❌"
        color = "#10b981" if sentinel_online else "#ef4444"
        self.status_label.config(text=f"● {sentinel_text}", foreground=color)

    def send_to_sentinel(self, data, printer_key):
        try:
            t = "\x1b@\x1ba\x01\x1b!\x38" + "COCINET PRO\n" + "\x1b!\x00"
            t += f"--- {data.get('tipo', 'COMANDA').upper()} ---\n\n"
            t += "\x1ba\x00" + f"Folio: {data['folio']}\nMesa:  {data['mesa']}\n" + "-"*32 + "\n"
            for it in data.get("items", []):
                n = it.get('nombre', '')[:20]
                q = it.get('cantidad', 1)
                t += f"{q:>2}x {n:<20}\n"
            t += "-"*32 + f"\nTOTAL: ${data.get('total', 0):.2f}\n\n\x1ba\x01¡Gracias!\n\n\n\n\x1dV\x41\x03"
            
            raw = urllib.parse.quote(t)
            res = requests.post(f"{SENTINEL_URL}/print", json={"printer": printer_key, "raw_data": raw}, timeout=5)
            if res.ok:
                messagebox.showinfo("Impresora", "Enviado con éxito.")
            else:
                messagebox.showerror("Error", f"Sentinel respondió con error: {res.text}")
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo conectar con el Sentinel: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = ReimpresorApp(root)
    root.mainloop()
