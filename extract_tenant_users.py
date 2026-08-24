import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = -1
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const renderTenantUsersModal = () => {' in line:
        start_idx = i
        break

if start_idx != -1:
    end_idx = -1
    for i in range(start_idx, len(lines)):
        if '};' in lines[i] and '</IonModal>' in lines[i-2]:
            end_idx = i
            break
            
    if end_idx != -1:
        body = '\n'.join(lines[start_idx:end_idx+1])
        original_body_str = body
        
        new_comp = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

interface TenantUsersModalProps {
  showTenantUsersModal: boolean;
  setShowTenantUsersModal: (v: boolean) => void;
  modalTenant: any;
  modalUsers: any[];
  handleAddRow: () => void;
  handleCellChange: (index: number, field: string, value: string) => void;
  handleDeleteRow: (index: number) => void;
  revealedPins: Record<number, boolean>;
  setRevealedPins: (v: Record<number, boolean> | ((prev: Record<number, boolean>) => Record<number, boolean>)) => void;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const TenantUsersModal: React.FC<TenantUsersModalProps> = ({
  showTenantUsersModal,
  setShowTenantUsersModal,
  modalTenant,
  modalUsers,
  handleAddRow,
  handleCellChange,
  handleDeleteRow,
  revealedPins,
  setRevealedPins,
  triggerAppNotification
}) => {
''' + body.replace('  const renderTenantUsersModal = () => {\n    if (!showTenantUsersModal || !modalTenant) return null;\n', '')
        
        new_comp = new_comp[:new_comp.rfind('  };')]
        new_comp += '''};
'''
        with open('src/components/modals/TenantUsersModal.tsx', 'w', encoding='utf-8') as mf:
            mf.write(new_comp)
            
        content = content.replace(original_body_str, '')
        
        replacement = '''<TenantUsersModal
          showTenantUsersModal={showTenantUsersModal}
          setShowTenantUsersModal={setShowTenantUsersModal}
          modalTenant={modalTenant}
          modalUsers={modalUsers}
          handleAddRow={handleAddRow}
          handleCellChange={handleCellChange}
          handleDeleteRow={handleDeleteRow}
          revealedPins={revealedPins}
          setRevealedPins={setRevealedPins}
          triggerAppNotification={triggerAppNotification}
        />'''
        
        content = content.replace('{showTenantUsersModal && renderTenantUsersModal()}', replacement)
        
        import_idx = content.find('import React')
        if import_idx != -1:
            content = content[:import_idx] + "import { TenantUsersModal } from './components/modals/TenantUsersModal';\n" + content[import_idx:]
            
        with open('src/App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print('Extracted TenantUsersModal successfully!')
