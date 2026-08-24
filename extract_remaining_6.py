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

# 1. ComensalPreview
header_1 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, logoWhatsapp } from 'ionicons/icons';

interface ComensalPreviewProps {
  showComensalPreview: boolean;
  setShowComensalPreview: (v: boolean) => void;
}

export const ComensalPreview: React.FC<ComensalPreviewProps> = ({
  showComensalPreview,
  setShowComensalPreview
}) => {'''
props_1 = '''          showComensalPreview={showComensalPreview}
          setShowComensalPreview={setShowComensalPreview}'''
content = extract_inline(content, 'isOpen={showComensalPreview}', 'ComensalPreview', header_1, props_1, "import { ComensalPreview } from './components/modals/ComensalPreview';\n")


# 2. GastoRegisterModal
header_2 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface GastoRegisterModalProps {
  showGastoRegisterModal: boolean;
  setShowGastoRegisterModal: (v: boolean) => void;
}

export const GastoRegisterModal: React.FC<GastoRegisterModalProps> = ({
  showGastoRegisterModal,
  setShowGastoRegisterModal
}) => {'''
props_2 = '''          showGastoRegisterModal={showGastoRegisterModal}
          setShowGastoRegisterModal={setShowGastoRegisterModal}'''
content = extract_inline(content, 'isOpen={showGastoRegisterModal}', 'GastoRegisterModal', header_2, props_2, "import { GastoRegisterModal } from './components/modals/GastoRegisterModal';\n")


# 3. ExportSessionModal
header_3 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, downloadOutline } from 'ionicons/icons';

interface ExportSessionModalProps {
  exportSessionModal: any;
  setExportSessionModal: (v: any) => void;
}

export const ExportSessionModal: React.FC<ExportSessionModalProps> = ({
  exportSessionModal,
  setExportSessionModal
}) => {'''
props_3 = '''          exportSessionModal={exportSessionModal}
          setExportSessionModal={setExportSessionModal}'''
content = extract_inline(content, 'isOpen={!!exportSessionModal}', 'ExportSessionModal', header_3, props_3, "import { ExportSessionModal } from './components/modals/ExportSessionModal';\n")

# 4. SystemsChoiceAlert
header_4 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, alertCircleOutline } from 'ionicons/icons';

interface SystemsChoiceAlertProps {
  showSystemsChoiceAlert: boolean;
  setShowSystemsChoiceAlert: (v: boolean) => void;
}

export const SystemsChoiceAlert: React.FC<SystemsChoiceAlertProps> = ({
  showSystemsChoiceAlert,
  setShowSystemsChoiceAlert
}) => {'''
props_4 = '''          showSystemsChoiceAlert={showSystemsChoiceAlert}
          setShowSystemsChoiceAlert={setShowSystemsChoiceAlert}'''
content = extract_inline(content, 'isOpen={showSystemsChoiceAlert}', 'SystemsChoiceAlert', header_4, props_4, "import { SystemsChoiceAlert } from './components/modals/SystemsChoiceAlert';\n")

# 5. TenantBackupConfirm
header_5 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, cloudDownloadOutline } from 'ionicons/icons';

interface TenantBackupConfirmProps {
  tenantBackupConfirm: any;
  setTenantBackupConfirm: (v: any) => void;
}

export const TenantBackupConfirm: React.FC<TenantBackupConfirmProps> = ({
  tenantBackupConfirm,
  setTenantBackupConfirm
}) => {'''
props_5 = '''          tenantBackupConfirm={tenantBackupConfirm}
          setTenantBackupConfirm={setTenantBackupConfirm}'''
content = extract_inline(content, 'isOpen={tenantBackupConfirm.isOpen}', 'TenantBackupConfirm', header_5, props_5, "import { TenantBackupConfirm } from './components/modals/TenantBackupConfirm';\n")

# 6. EditPaymentModal
header_6 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface EditPaymentModalProps {
  isEditPaymentModalOpen: boolean;
  setIsEditPaymentModalOpen: (v: boolean) => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isEditPaymentModalOpen,
  setIsEditPaymentModalOpen
}) => {'''
props_6 = '''          isEditPaymentModalOpen={isEditPaymentModalOpen}
          setIsEditPaymentModalOpen={setIsEditPaymentModalOpen}'''
content = extract_inline(content, 'isOpen={isEditPaymentModalOpen}', 'EditPaymentModal', header_6, props_6, "import { EditPaymentModal } from './components/modals/EditPaymentModal';\n")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone! Extracted remaining 6 modals (excl. DeliverySetup).')
