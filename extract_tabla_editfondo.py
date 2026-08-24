import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

def find_ionmodal_block(lines, isopen_token):
    start_idx = -1
    for i, line in enumerate(lines):
        if isopen_token in line:
            for j in range(max(0, i-3), i+2):
                if '<IonModal' in lines[j]:
                    start_idx = j
                    break
            if start_idx != -1:
                break
    
    if start_idx == -1:
        return -1, -1
    
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
    lines = content.split('\n')
    start_idx, end_idx = find_ionmodal_block(lines, isopen_token)
    
    if start_idx == -1 or end_idx == -1:
        print(f"Could not find {component_name} ({isopen_token})")
        return content
    
    body = '\n'.join(lines[start_idx:end_idx+1])
    print(f"Found {component_name}: lines {start_idx+1}-{end_idx+1} ({end_idx-start_idx+1} lines)")
    
    with open(f'src/components/modals/{component_name}.tsx', 'w', encoding='utf-8') as f:
        f.write(component_code_header)
        f.write('\n  return (\n')
        f.write(body)
        f.write('\n  );\n};\n')
    
    replacement = f'<{component_name}\n{props_pass}\n        />'
    new_content = content.replace(body, replacement, 1)
    
    if new_content == content:
        print(f"WARNING: replacement for {component_name} did not change content!")
        return content
    
    import_idx = new_content.find('import React')
    new_content = new_content[:import_idx] + import_statement + new_content[import_idx:]
    
    return new_content


# ──── TablaArqueoModal ────────────────────────────────────────────────────────
tabla_arqueo_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, printOutline } from 'ionicons/icons';

interface TablaArqueoModalProps {
  showTablaArqueoModal: boolean;
  setShowTablaArqueoModal: (v: boolean) => void;
}

export const TablaArqueoModal: React.FC<TablaArqueoModalProps> = ({
  showTablaArqueoModal,
  setShowTablaArqueoModal
}) => {'''

tabla_arqueo_props = '''          showTablaArqueoModal={showTablaArqueoModal}
          setShowTablaArqueoModal={setShowTablaArqueoModal}'''

content = extract_inline(
    content,
    'isOpen={showTablaArqueoModal}',
    'TablaArqueoModal',
    tabla_arqueo_header,
    tabla_arqueo_props,
    "import { TablaArqueoModal } from './components/modals/TablaArqueoModal';\n"
)

# ──── EditFondoModal ────────────────────────────────────────────────────────
edit_fondo_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface EditFondoModalProps {
  showEditFondoModal: boolean;
  setShowEditFondoModal: (v: boolean) => void;
}

export const EditFondoModal: React.FC<EditFondoModalProps> = ({
  showEditFondoModal,
  setShowEditFondoModal
}) => {'''

edit_fondo_props = '''          showEditFondoModal={showEditFondoModal}
          setShowEditFondoModal={setShowEditFondoModal}'''

content = extract_inline(
    content,
    'isOpen={showEditFondoModal}',
    'EditFondoModal',
    edit_fondo_header,
    edit_fondo_props,
    "import { EditFondoModal } from './components/modals/EditFondoModal';\n"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone! Extracted TablaArqueoModal + EditFondoModal.')
