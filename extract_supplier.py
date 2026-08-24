import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

def extract_inline_modal(start_line_1indexed, end_line_1indexed, component_name, props_interface, props_destructure, props_pass, state_var_name, output_file):
    """Extract an inline IonModal block from App.tsx into its own component file."""
    start = start_line_1indexed - 1  # 0-indexed
    end = end_line_1indexed - 1      # 0-indexed (inclusive)
    
    body = '\n'.join(lines[start:end+1])
    original_body_str = body
    
    new_comp = f'''import React from 'react';
import {{ IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption }} from '@ionic/react';
import {{ closeOutline, saveOutline }} from 'ionicons/icons';

{props_interface}

export const {component_name}: React.FC<{component_name}Props> = ({{
{props_destructure}
}}) => {{
  return (
{body}
  );
}};
'''
    
    with open(f'src/components/modals/{output_file}.tsx', 'w', encoding='utf-8') as mf:
        mf.write(new_comp)
    
    # Replace in App.tsx content
    new_content = content.replace(original_body_str, f'<{component_name}\n{props_pass}\n        />')
    
    # Add import
    import_idx = new_content.find('import React')
    if import_idx != -1:
        new_content = new_content[:import_idx] + f"import {{ {component_name} }} from './components/modals/{output_file}';\n" + new_content[import_idx:]
    
    return new_content


# ─── Extract SupplierModal (lines 27549-27700) ─────────────────────────────
SUPPLIER_START = 27549
SUPPLIER_END = 27700

body = '\n'.join(lines[SUPPLIER_START-1:SUPPLIER_END])
original = body

new_comp = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface SupplierModalProps {
  supplierModal: any;
  setSupplierModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  supplierModal,
  setSupplierModal,
  triggerAppNotification
}) => {
  return (
''' + body + '''
  );
};
'''

with open('src/components/modals/SupplierModal.tsx', 'w', encoding='utf-8') as f:
    f.write(new_comp)

content = content.replace(original, '''<SupplierModal
          supplierModal={supplierModal}
          setSupplierModal={setSupplierModal}
          triggerAppNotification={triggerAppNotification}
        />''')

import_idx = content.find('import React')
content = content[:import_idx] + "import { SupplierModal } from './components/modals/SupplierModal';\n" + content[import_idx:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Extracted SupplierModal ({SUPPLIER_END - SUPPLIER_START + 1} lines)')
