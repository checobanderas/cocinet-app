import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
START = 36153  # 0-indexed (line 36154 in editor)
END = 36347    # 0-indexed (line 36348 in editor) - the closing );

body = '\n'.join(lines[START:END+1])
original_body_str = body

# Scan props used in the body
import re
prop_candidates = [
    'showMultiTurnModal', 'setShowMultiTurnModal',
    'multiTurnData', 'selectedMultiTurnDate', 'setSelectedMultiTurnDate',
    'handleExportMultiTurnCSV',
]

new_comp = '''import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { closeOutline, downloadOutline } from 'ionicons/icons';

interface MultiTurnModalProps {
  showMultiTurnModal: boolean;
  setShowMultiTurnModal: (v: boolean) => void;
  multiTurnData: any;
  selectedMultiTurnDate: string;
  setSelectedMultiTurnDate: (v: string) => void;
  handleExportMultiTurnCSV?: () => void;
}

export const MultiTurnModal: React.FC<MultiTurnModalProps> = ({
  showMultiTurnModal,
  setShowMultiTurnModal,
  multiTurnData,
  selectedMultiTurnDate,
  setSelectedMultiTurnDate,
  handleExportMultiTurnCSV
}) => {
  const renderMultiTurnModal = () => (
''' + '\n'.join(lines[START+1:END+1])  # skip the first line (const renderMultiTurnModal = () => ()

new_comp += '''
};
'''

with open('src/components/modals/MultiTurnModal.tsx', 'w', encoding='utf-8') as mf:
    mf.write(new_comp)

# Replace in App.tsx
content = content.replace(original_body_str, '')

replacement = '''<MultiTurnModal
          showMultiTurnModal={showMultiTurnModal}
          setShowMultiTurnModal={setShowMultiTurnModal}
          multiTurnData={multiTurnData}
          selectedMultiTurnDate={selectedMultiTurnDate}
          setSelectedMultiTurnDate={setSelectedMultiTurnDate}
          handleExportMultiTurnCSV={handleExportMultiTurnCSV}
        />'''

content = content.replace('{renderMultiTurnModal()}', replacement)

import_idx = content.find('import React')
if import_idx != -1:
    content = content[:import_idx] + "import { MultiTurnModal } from './components/modals/MultiTurnModal';\n" + content[import_idx:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Extracted MultiTurnModal successfully!')
