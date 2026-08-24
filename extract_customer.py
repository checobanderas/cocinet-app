import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Re-find the current line of customerModal after previous extraction shifted things
# Search for isOpen={customerModal.isOpen}
start_idx = -1
for i, line in enumerate(lines):
    if 'isOpen={customerModal.isOpen}' in line and '<IonModal' in lines[max(0,i-1):i+1][0] or ('<IonModal' in line and 'customerModal' in line):
        start_idx = i
        break
    if 'isOpen={customerModal.isOpen}' in line:
        # Check a few lines back for the opening IonModal
        for j in range(max(0, i-3), i+1):
            if '<IonModal' in lines[j]:
                start_idx = j
                break
        if start_idx != -1:
            break

print(f"CustomerModal start: {start_idx + 1}")

# Find the matching end
depth = 0
end_idx = -1
for i in range(start_idx, min(start_idx + 500, len(lines))):
    if '<IonModal' in lines[i]:
        depth += 1
    if '</IonModal>' in lines[i]:
        depth -= 1
        if depth == 0:
            end_idx = i
            break

print(f"CustomerModal end: {end_idx + 1}, length: {end_idx - start_idx + 1}")

body = '\n'.join(lines[start_idx:end_idx+1])
original = body

new_comp = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface CustomerModalProps {
  customerModal: any;
  setCustomerModal: (v: any) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customerModal,
  setCustomerModal,
  triggerAppNotification
}) => {
  return (
''' + body + '''
  );
};
'''

with open('src/components/modals/CustomerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(new_comp)

content = content.replace(original, '''<CustomerModal
          customerModal={customerModal}
          setCustomerModal={setCustomerModal}
          triggerAppNotification={triggerAppNotification}
        />''')

import_idx = content.find('import React')
content = content[:import_idx] + "import { CustomerModal } from './components/modals/CustomerModal';\n" + content[import_idx:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Extracted CustomerModal successfully!')
