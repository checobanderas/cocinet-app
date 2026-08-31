import os
import re

MODALS_TO_FIX = [
    "PaymentModal",
    "NumpadModal",
    "PinModalOverlay",
    "ManageCompaniesModal",
    "MultiTurnModal",
    "PrintPreviewModal",
    "ReceiptPreviewModal",
    "SupplierPurchaseModal",
    "SystemsChoiceAlert",
    "TablaArqueoModal",
    "TenantBackupConfirm",
    "TenantCrudModal"
]

APP_TSX = "src/App.tsx"

def get_props_for_component(name):
    filepath = f"src/components/modals/{name}.tsx"
    if not os.path.exists(filepath):
        filepath = f"src/components/views/{name}.tsx"
    if not os.path.exists(filepath):
        print(f"Could not find {name}.tsx")
        return []
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find interface
    interface_match = re.search(r'interface ' + name + r'Props\s*\{([^}]*)\}', content)
    if not interface_match:
        print(f"Could not find interface for {name}")
        return []
        
    props_text = interface_match.group(1)
    props = []
    for line in props_text.split('\n'):
        line = line.strip()
        if not line or line.startswith('//'): continue
        # match prop name: propName: type; or propName?: type;
        m = re.match(r'([a-zA-Z0-9_]+)\??\s*:', line)
        if m:
            props.append(m.group(1))
            
    return props

def fix_modals():
    with open(APP_TSX, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for modal in MODALS_TO_FIX:
        props = get_props_for_component(modal)
        if not props:
            continue
            
        # build prop string
        prop_str = '\n'.join([f"          {p}={{{p}}}" for p in props])
        
        replacement = f"<{modal}\n{prop_str}\n        />"
        
        # Replace empty tag
        # The empty tag might be <Modal /> or <Modal></Modal>
        content = re.sub(r'<' + modal + r'\s*/>', replacement, content)
        
    with open(APP_TSX, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done fixing modal props!")

if __name__ == '__main__':
    fix_modals()
