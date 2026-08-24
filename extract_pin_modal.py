import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
START = 6145  # 0-indexed
END = 6261    # inclusive (the }; line)

body = '\n'.join(lines[START:END+1])
original_body_str = body

# Scan for props used
import re
# Key identifiers from the body (actual state vars, not CSS/inline values)
prop_candidates = [
    'showTenantPinModal', 'setShowTenantPinModal',
    'pendingTenant', 'setPendingTenant',
    'typedPin', 'setTypedPin',
    'handlePinNumericPress',
]

new_comp = '''import React from 'react';
import { IonIcon } from '@ionic/react';
import { backspaceOutline } from 'ionicons/icons';

interface PinModalOverlayProps {
  showTenantPinModal: boolean;
  setShowTenantPinModal: (v: boolean) => void;
  pendingTenant: any;
  setPendingTenant: (v: any) => void;
  typedPin: string;
  setTypedPin: (v: string) => void;
  handlePinNumericPress: (key: string) => void;
}

export const PinModalOverlay: React.FC<PinModalOverlayProps> = ({
  showTenantPinModal,
  setShowTenantPinModal,
  pendingTenant,
  setPendingTenant,
  typedPin,
  setTypedPin,
  handlePinNumericPress
}) => {
''' + body.replace('  const renderPinModalOverlay = () => {\n    if (!showTenantPinModal || !pendingTenant) return null;\n', '')

new_comp = new_comp[:new_comp.rfind('  };')]
new_comp += '};\n'

with open('src/components/modals/PinModalOverlay.tsx', 'w', encoding='utf-8') as mf:
    mf.write(new_comp)

content = content.replace(original_body_str, '')

replacement = '''<PinModalOverlay
          showTenantPinModal={showTenantPinModal}
          setShowTenantPinModal={setShowTenantPinModal}
          pendingTenant={pendingTenant}
          setPendingTenant={setPendingTenant}
          typedPin={typedPin}
          setTypedPin={setTypedPin}
          handlePinNumericPress={handlePinNumericPress}
        />'''

content = content.replace('{renderPinModalOverlay()}', replacement)

import_idx = content.find('import React')
if import_idx != -1:
    content = content[:import_idx] + "import { PinModalOverlay } from './components/modals/PinModalOverlay';\n" + content[import_idx:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Extracted PinModalOverlay successfully!')
