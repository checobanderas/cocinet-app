import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Folio Modal
folio_regex = r"\{\/\* Modal para solicitar Folio Interno de Comanda por Sucursal \(Rápido POS\) 📋 \*\/\}.*?<\/IonModal>"
content = re.sub(folio_regex, "{/* FolioModal extracted */}\n      <FolioModal />", content, flags=re.DOTALL)

# Invoice Modal
invoice_regex = r"\{\/\* Modal para solicitar Teléfono Celular de Referencia al requerir factura \*\/\}.*?<\/IonModal>"
content = re.sub(invoice_regex, "{/* InvoicePhoneModal extracted */}\n      <InvoiceModal />", content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Modals replaced successfully.")
