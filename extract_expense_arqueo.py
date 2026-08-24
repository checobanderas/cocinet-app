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


# ──── ExpenseModal ────────────────────────────────────────────────────────
expense_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, trashOutline } from 'ionicons/icons';

interface ExpenseModalProps {
  showExpenseModal: boolean;
  setShowExpenseModal: (v: boolean) => void;
  // Let's add any props passed in
  expenseFormData: any;
  setExpenseFormData: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: \'success\'|\'warning\'|\'error\'|\'info\') => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  showExpenseModal,
  setShowExpenseModal,
  expenseFormData,
  setExpenseFormData,
  triggerAppNotification
}) => {'''

expense_props = '''          showExpenseModal={showExpenseModal}
          setShowExpenseModal={setShowExpenseModal}
          expenseFormData={expenseFormData}
          setExpenseFormData={setExpenseFormData}
          triggerAppNotification={triggerAppNotification}'''

content = extract_inline(
    content,
    'isOpen={showExpenseModal}',
    'ExpenseModal',
    expense_header,
    expense_props,
    "import { ExpenseModal } from './components/modals/ExpenseModal';\n"
)

# ──── ArqueoFormModal ────────────────────────────────────────────────────────
arqueo_header = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ArqueoFormModalProps {
  showArqueoFormModal: boolean;
  setShowArqueoFormModal: (v: boolean) => void;
}

export const ArqueoFormModal: React.FC<ArqueoFormModalProps> = ({
  showArqueoFormModal,
  setShowArqueoFormModal
}) => {'''

arqueo_props = '''          showArqueoFormModal={showArqueoFormModal}
          setShowArqueoFormModal={setShowArqueoFormModal}'''

content = extract_inline(
    content,
    'isOpen={showArqueoFormModal}',
    'ArqueoFormModal',
    arqueo_header,
    arqueo_props,
    "import { ArqueoFormModal } from './components/modals/ArqueoFormModal';\n"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone! Extracted ExpenseModal + ArqueoFormModal.')
