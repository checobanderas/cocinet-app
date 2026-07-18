# Configuración de Impresión para Windows 🖨️

Para que tu sistema pueda imprimir automáticamente en las impresoras **Cocina**, **Barra** y **Cuentas**, sigue estos pasos:

## 1. Instalación de Python
Si aún no tienes Python, descárgalo de [python.org](https://www.python.org/downloads/) e instálalo. 
**IMPORTANTE:** Marca la casilla que dice **"Add Python to PATH"** durante la instalación.

## 2. Configuración de Impresoras
Asegúrate de que tus impresoras tengan exactamente estos nombres en Windows:
- `Cocina`
- `Barra`
- `Cuentas`

(Puedes cambiar estos nombres en el archivo `sentinel_printer.py` si prefieres otros).

## 3. Instalación del Centinela
1. Descarga el archivo `sentinel_printer.py` y `install_sentinel.bat` a una carpeta en tu PC.
2. Ejecuta `install_sentinel.bat` como Administrador. Esto instalará las librerías necesarias y dejará el servidor corriendo.

## 4. Ejecutar en Segundo Plano (Sin ventana negra)
Para que el servidor corra siempre al prender la PC sin mostrar una ventana:
1. Presiona `Win + R`, escribe `shell:startup` y da Enter.
2. Crea un archivo llamado `cocinet_print.vbs` y pega esto:
   ```vbs
   Set WshShell = CreateObject("WScript.Shell")
   WshShell.Run "pythonw.exe C:\RUTA\A\TU\CARPETA\sentinel_printer.py", 0
   Set WshShell = Nothing
   ```
   *(Cambia `C:\RUTA\A\TU\CARPETA\` por la ruta real donde guardaste el archivo).*

---
**Nota:** El sistema se comunica por el puerto **3010**. Asegúrate de que tu antivirus o Firewall no lo bloquee.
