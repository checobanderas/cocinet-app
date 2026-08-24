import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = -1
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const renderBranchSwitcherModal = () => {' in line:
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

interface BranchSwitcherModalProps {
  showBranchSwitcherModal: boolean;
  setShowBranchSwitcherModal: (v: boolean) => void;
  companiesConfig: any[];
  customOwners: any[];
  currentUser: any;
  ownerKey: string;
  selectedTenant: any;
  restrictedOwnerKey: string;
  isSystemsMode: boolean;
  isSistemas: boolean;
  activeOwnerFilter: string;
  handleSwitchBranch: (ownerKey: string, tenantId: string) => void;
}

export const BranchSwitcherModal: React.FC<BranchSwitcherModalProps> = ({
  showBranchSwitcherModal,
  setShowBranchSwitcherModal,
  companiesConfig,
  customOwners,
  currentUser,
  ownerKey,
  selectedTenant,
  restrictedOwnerKey,
  isSystemsMode,
  isSistemas,
  activeOwnerFilter,
  handleSwitchBranch
}) => {
''' + body.replace('  const renderBranchSwitcherModal = () => {\n    if (!showBranchSwitcherModal) return null;\n', '')

        new_comp = new_comp[:new_comp.rfind('  };')]
        new_comp += '};\n'

        with open('src/components/modals/BranchSwitcherModal.tsx', 'w', encoding='utf-8') as mf:
            mf.write(new_comp)

        content = content.replace(original_body_str, '')

        replacement = '''<BranchSwitcherModal
          showBranchSwitcherModal={showBranchSwitcherModal}
          setShowBranchSwitcherModal={setShowBranchSwitcherModal}
          companiesConfig={companiesConfig}
          customOwners={customOwners}
          currentUser={currentUser}
          ownerKey={ownerKey}
          selectedTenant={selectedTenant}
          restrictedOwnerKey={restrictedOwnerKey}
          isSystemsMode={isSystemsMode}
          isSistemas={isSistemas}
          activeOwnerFilter={activeOwnerFilter}
          handleSwitchBranch={handleSwitchBranch}
        />'''

        content = content.replace('{showBranchSwitcherModal && renderBranchSwitcherModal()}', replacement)

        import_idx = content.find('import React')
        if import_idx != -1:
            content = content[:import_idx] + "import { BranchSwitcherModal } from './components/modals/BranchSwitcherModal';\n" + content[import_idx:]

        with open('src/App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)

        print('Extracted BranchSwitcherModal successfully!')
