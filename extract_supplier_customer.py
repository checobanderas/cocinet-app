import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

def find_ionmodal_block(lines, isopen_token):
    """Find the start and end lines of an IonModal block by its isOpen token."""
    start_idx = -1
    for i, line in enumerate(lines):
        if isopen_token in line:
            # The IonModal might be on the same line or a few lines before
            for j in range(max(0, i-3), i+2):
                if '<IonModal' in lines[j]:
                    start_idx = j
                    break
            if start_idx != -1:
                break
    
    if start_idx == -1:
        return -1, -1
    
    # Find the matching end
    depth = 0
    end_idx = -1
    for i in range(start_idx, min(start_idx + 1000, len(lines))):
        if '<IonModal' in lines[i]:
            depth += 1
        if '</IonModal>' in lines[i]:
            depth -= 1
            if depth == 0:
                end_idx = i
                break
    
    return start_idx, end_idx


def extract_inline(content, isopen_token, component_name, component_code_header, props_pass, import_statement):
    """Safely extract an inline IonModal and replace it with a component."""
    lines = content.split('\n')
    start_idx, end_idx = find_ionmodal_block(lines, isopen_token)
    
    if start_idx == -1 or end_idx == -1:
        print(f"Could not find {component_name} ({isopen_token})")
        return content
    
    body = '\n'.join(lines[start_idx:end_idx+1])
    print(f"Found {component_name}: lines {start_idx+1}-{end_idx+1} ({end_idx-start_idx+1} lines)")
    
    # Write component file
    with open(f'src/components/modals/{component_name}.tsx', 'w', encoding='utf-8') as f:
        f.write(component_code_header)
        f.write('\n  return (\n')
        f.write(body)
        f.write('\n  );\n};\n')
    
    # Replace in App.tsx
    replacement = f'<{component_name}\n{props_pass}\n        />'
    new_content = content.replace(body, replacement, 1)
    
    if new_content == content:
        print(f"WARNING: replacement for {component_name} did not change content!")
        return content
    
    # Add import at top
    import_idx = new_content.find('import React')
    new_content = new_content[:import_idx] + import_statement + new_content[import_idx:]
    
    return new_content


# ──── SupplierModal ────────────────────────────────────────────────────────
supplier_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface SupplierModalProps {
  supplierModal: any;
  setSupplierModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: \'success\'|\'warning\'|\'error\'|\'info\') => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  supplierModal,
  setSupplierModal,
  triggerAppNotification
}) => {'''

supplier_props = '''          supplierModal={supplierModal}
          setSupplierModal={setSupplierModal}
          triggerAppNotification={triggerAppNotification}'''

content = extract_inline(
    content,
    'isOpen={supplierModal.isOpen}',
    'SupplierModal',
    supplier_header,
    supplier_props,
    "import { SupplierModal } from './components/modals/SupplierModal';\n"
)

# ──── CustomerModal ────────────────────────────────────────────────────────
customer_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface CustomerModalProps {
  customerModal: any;
  setCustomerModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: \'success\'|\'warning\'|\'error\'|\'info\') => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customerModal,
  setCustomerModal,
  triggerAppNotification
}) => {'''

customer_props = '''          customerModal={customerModal}
          setCustomerModal={setCustomerModal}
          triggerAppNotification={triggerAppNotification}'''

content = extract_inline(
    content,
    'isOpen={customerModal.isOpen}',
    'CustomerModal',
    customer_header,
    customer_props,
    "import { CustomerModal } from './components/modals/CustomerModal';\n"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone! Extracted SupplierModal + CustomerModal.')
