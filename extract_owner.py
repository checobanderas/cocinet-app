import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('  const renderOwnerCrudModal = () => {')
if start_idx != -1:
    end_idx = content.find('      </IonModal>\n    );\n  };\n', start_idx) + len('      </IonModal>\n    );\n  };\n')
    
    # delete the definition
    content = content[:start_idx] + content[end_idx:]
    
    # replace the call
    replacement = '''<OwnerCrudModal
          showOwnerCrudModal={showOwnerCrudModal}
          setShowOwnerCrudModal={setShowOwnerCrudModal}
          editingOwner={editingOwner}
          setEditingOwner={setEditingOwner}
          formOwnerName={formOwnerName}
          setFormOwnerName={setFormOwnerName}
          formOwnerPin={formOwnerPin}
          setFormOwnerPin={setFormOwnerPin}
          formOwnerSupervisorPin={formOwnerSupervisorPin}
          setFormOwnerSupervisorPin={setFormOwnerSupervisorPin}
          formOwnerAccent={formOwnerAccent}
          setFormOwnerAccent={setFormOwnerAccent}
          formOwnerLogo={formOwnerLogo}
          setFormOwnerLogo={setFormOwnerLogo}
          formOwnerAvatar={formOwnerAvatar}
          setFormOwnerAvatar={setFormOwnerAvatar}
          handleSaveOwner={handleSaveOwner}
          handleDeleteOwner={handleDeleteOwner}
          triggerAppNotification={triggerAppNotification}
        />'''
    
    content = content.replace('{showOwnerCrudModal && renderOwnerCrudModal()}', replacement)
    
    # Find the top of the file for import
    import_idx = content.find('import React')
    if import_idx != -1:
        content = content[:import_idx] + "import { OwnerCrudModal } from './components/modals/OwnerCrudModal';\n" + content[import_idx:]
    
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print('Extracted OwnerCrudModal successfully and safely!')
