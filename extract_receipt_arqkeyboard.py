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


# ──── ReceiptPreviewModal ────────────────────────────────────────────────────────
receipt_preview_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, printOutline } from 'ionicons/icons';

interface ReceiptPreviewModalProps {
  showReceiptPreviewModal: boolean;
  setShowReceiptPreviewModal: (v: boolean) => void;
  // Let's add any props passed in
  receiptPreviewContent: string;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  showReceiptPreviewModal,
  setShowReceiptPreviewModal,
  receiptPreviewContent
}) => {'''

receipt_preview_props = '''          showReceiptPreviewModal={showReceiptPreviewModal}
          setShowReceiptPreviewModal={setShowReceiptPreviewModal}
          receiptPreviewContent={receiptPreviewContent}'''

content = extract_inline(
    content,
    'isOpen={showReceiptPreviewModal}',
    'ReceiptPreviewModal',
    receipt_preview_header,
    receipt_preview_props,
    "import { ReceiptPreviewModal } from './components/modals/ReceiptPreviewModal';\n"
)

# ──── ArqKeyboardModal ────────────────────────────────────────────────────────
arq_keyboard_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, backspaceOutline, checkmarkOutline } from 'ionicons/icons';

interface ArqKeyboardModalProps {
  showArqKeyboardModal: boolean;
  setShowArqKeyboardModal: (v: boolean) => void;
  arqKeyboardTarget: any;
  setArqKeyboardTarget: (v: any) => void;
  arqKeyboardValue: any;
  setArqKeyboardValue: (v: any) => void;
  handleArqKeyboardDone: () => void;
}

export const ArqKeyboardModal: React.FC<ArqKeyboardModalProps> = ({
  showArqKeyboardModal,
  setShowArqKeyboardModal,
  arqKeyboardTarget,
  setArqKeyboardTarget,
  arqKeyboardValue,
  setArqKeyboardValue,
  handleArqKeyboardDone
}) => {'''

arq_keyboard_props = '''          showArqKeyboardModal={showArqKeyboardModal}
          setShowArqKeyboardModal={setShowArqKeyboardModal}
          arqKeyboardTarget={arqKeyboardTarget}
          setArqKeyboardTarget={setArqKeyboardTarget}
          arqKeyboardValue={arqKeyboardValue}
          setArqKeyboardValue={setArqKeyboardValue}
          handleArqKeyboardDone={handleArqKeyboardDone}'''

content = extract_inline(
    content,
    'isOpen={showArqKeyboardModal}',
    'ArqKeyboardModal',
    arq_keyboard_header,
    arq_keyboard_props,
    "import { ArqKeyboardModal } from './components/modals/ArqKeyboardModal';\n"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone! Extracted ReceiptPreviewModal + ArqKeyboardModal.')
