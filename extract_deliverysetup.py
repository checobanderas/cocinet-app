import sys, codecs, re
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

start_idx = -1
for i, line in enumerate(lines):
    if 'isOpen={showDeliverySetupModal}' in line:
        for j in range(max(0, i-3), i+2):
            if '<IonModal' in lines[j]:
                start_idx = j
                break
        if start_idx != -1:
            break

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

body = '\n'.join(lines[start_idx:end_idx+1])

# Extract all possible props from App.tsx (state vars, consts, functions)
# We look for: const [Var, setVar]
state_vars = set()
for match in re.finditer(r'const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=', content):
    state_vars.add(match.group(1))
    state_vars.add(match.group(2))

# other consts like handleX, renderX
for match in re.finditer(r'const\s+(handle[a-zA-Z0-9_]+)\s*=', content):
    state_vars.add(match.group(1))
for match in re.finditer(r'const\s+(render[a-zA-Z0-9_]+)\s*=', content):
    state_vars.add(match.group(1))
for match in re.finditer(r'const\s+(trigger[a-zA-Z0-9_]+)\s*=', content):
    state_vars.add(match.group(1))
for match in re.finditer(r'const\s+(fetch[a-zA-Z0-9_]+)\s*=', content):
    state_vars.add(match.group(1))

# known constants
known_constants = ['COMPANY_CATALOG', 'users', 'activeOwnerFilter', 'activeTenantFilter', 'selectedTable']
for k in known_constants:
    state_vars.add(k)

# Add standard react/ionic components to ignore list
ignore_list = {'React', 'IonModal', 'IonPage', 'IonHeader', 'IonToolbar', 'IonTitle', 'IonButtons', 'IonButton', 'IonContent', 'IonIcon', 'IonItem', 'IonLabel', 'IonInput', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Promise', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'e', 'event'}

body_words = set(re.findall(r'\b[a-zA-Z_]\w*\b', body))

props_to_pass = (state_vars & body_words) - ignore_list

# Generate the interface and component
props_interface = 'interface DeliverySetupModalProps {\n'
for prop in sorted(props_to_pass):
    props_interface += f'  {prop}: any;\n'
props_interface += '}'

props_destructure = ',\n  '.join(sorted(props_to_pass))
props_pass_str = '\n'.join([f'          {p}={{{p}}}' for p in sorted(props_to_pass)])

new_comp = f'''import React from 'react';
import {{ IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonInput, IonPage }} from '@ionic/react';
import {{ closeOutline, checkmarkOutline, searchOutline, locationOutline }} from 'ionicons/icons';

{props_interface}

export const DeliverySetupModal: React.FC<DeliverySetupModalProps> = ({{
  {props_destructure}
}}) => {{
  return (
{body}
  );
}};
'''

with open('src/components/modals/DeliverySetupModal.tsx', 'w', encoding='utf-8') as f:
    f.write(new_comp)

new_content = content.replace(body, f'<DeliverySetupModal\n{props_pass_str}\n        />')
import_idx = new_content.find('import React')
new_content = new_content[:import_idx] + "import { DeliverySetupModal } from './components/modals/DeliverySetupModal';\n" + new_content[import_idx:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Extracted DeliverySetupModal with {len(props_to_pass)} props.")
