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

# ──── Modals to Extract ────

# 1. BulkItemCancellationReasonModal
header_1 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface BulkItemCancellationReasonModalProps {
  showBulkItemCancellationReasonModal: boolean;
  setShowBulkItemCancellationReasonModal: (v: boolean) => void;
}

export const BulkItemCancellationReasonModal: React.FC<BulkItemCancellationReasonModalProps> = ({
  showBulkItemCancellationReasonModal,
  setShowBulkItemCancellationReasonModal
}) => {'''
props_1 = '''          showBulkItemCancellationReasonModal={showBulkItemCancellationReasonModal}
          setShowBulkItemCancellationReasonModal={setShowBulkItemCancellationReasonModal}'''

content = extract_inline(content, 'isOpen={showBulkItemCancellationReasonModal}', 'BulkItemCancellationReasonModal', header_1, props_1, "import { BulkItemCancellationReasonModal } from './components/modals/BulkItemCancellationReasonModal';\n")

# 2. AuthorizeCancellationModal
header_2 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, checkmarkOutline, keyOutline } from 'ionicons/icons';

interface AuthorizeCancellationModalProps {
  showAuthorizeCancellationModal: boolean;
  setShowAuthorizeCancellationModal: (v: boolean) => void;
  authorizePasswordValue: any;
  setAuthorizePasswordValue: (v: any) => void;
}

export const AuthorizeCancellationModal: React.FC<AuthorizeCancellationModalProps> = ({
  showAuthorizeCancellationModal,
  setShowAuthorizeCancellationModal,
  authorizePasswordValue,
  setAuthorizePasswordValue
}) => {'''
props_2 = '''          showAuthorizeCancellationModal={showAuthorizeCancellationModal}
          setShowAuthorizeCancellationModal={setShowAuthorizeCancellationModal}
          authorizePasswordValue={authorizePasswordValue}
          setAuthorizePasswordValue={setAuthorizePasswordValue}'''

content = extract_inline(content, 'isOpen={showAuthorizeCancellationModal}', 'AuthorizeCancellationModal', header_2, props_2, "import { AuthorizeCancellationModal } from './components/modals/AuthorizeCancellationModal';\n")


# 3. ItemNoteModal
header_3 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline, trashOutline } from 'ionicons/icons';

interface ItemNoteModalProps {
  itemToNote: any;
  setItemToNote: (v: any) => void;
}

export const ItemNoteModal: React.FC<ItemNoteModalProps> = ({
  itemToNote,
  setItemToNote
}) => {'''
props_3 = '''          itemToNote={itemToNote}
          setItemToNote={setItemToNote}'''

content = extract_inline(content, 'isOpen={itemToNote !== null}', 'ItemNoteModal', header_3, props_3, "import { ItemNoteModal } from './components/modals/ItemNoteModal';\n")


# 4. ItemCancelModal
header_4 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ItemCancelModalProps {
  itemToCancel: any;
  setItemToCancel: (v: any) => void;
}

export const ItemCancelModal: React.FC<ItemCancelModalProps> = ({
  itemToCancel,
  setItemToCancel
}) => {'''
props_4 = '''          itemToCancel={itemToCancel}
          setItemToCancel={setItemToCancel}'''

content = extract_inline(content, 'isOpen={!!itemToCancel}', 'ItemCancelModal', header_4, props_4, "import { ItemCancelModal } from './components/modals/ItemCancelModal';\n")


# 5. ComandaCancelModal
header_5 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ComandaCancelModalProps {
  comandaToCancel: any;
  setComandaToCancel: (v: any) => void;
}

export const ComandaCancelModal: React.FC<ComandaCancelModalProps> = ({
  comandaToCancel,
  setComandaToCancel
}) => {'''
props_5 = '''          comandaToCancel={comandaToCancel}
          setComandaToCancel={setComandaToCancel}'''

content = extract_inline(content, 'isOpen={comandaToCancel !== null}', 'ComandaCancelModal', header_5, props_5, "import { ComandaCancelModal } from './components/modals/ComandaCancelModal';\n")


# 6. AccountCancellationModal
header_6 = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

interface AccountCancellationModalProps {
  showAccountCancellationModal: boolean;
  setShowAccountCancellationModal: (v: boolean) => void;
}

export const AccountCancellationModal: React.FC<AccountCancellationModalProps> = ({
  showAccountCancellationModal,
  setShowAccountCancellationModal
}) => {'''
props_6 = '''          showAccountCancellationModal={showAccountCancellationModal}
          setShowAccountCancellationModal={setShowAccountCancellationModal}'''

content = extract_inline(content, 'isOpen={showAccountCancellationModal}', 'AccountCancellationModal', header_6, props_6, "import { AccountCancellationModal } from './components/modals/AccountCancellationModal';\n")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone! Extracted 6 cancellation/note modals.')
