import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = -1
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const renderProductCrudModal = () => {' in line:
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
import { closeOutline, saveOutline } from 'ionicons/icons';

interface ProductCrudModalProps {
  productCrudModal: any;
  setProductCrudModal: (v: any) => void;
  crudSelectedCategory: string;
  crudQuickNotes: string[];
  setCrudQuickNotes: (v: string[] | ((prev: string[]) => string[])) => void;
  newCrudQuickNoteText: string;
  setNewCrudQuickNoteText: (v: string) => void;
  ownerBranches: any[];
  tenantPrinterConfig: any;
  allProducts: any[];
  productCategories: any[];
  generateUUID: () => string;
  getMexicoISOString: () => string;
  addProductToFirebase: (prod: any) => Promise<void>;
  updateProductInFirebase: (tenantId: string, prodId: string, updates: any) => Promise<void>;
  getAllProductsFromFirebase: () => Promise<void>;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const ProductCrudModal: React.FC<ProductCrudModalProps> = ({
  productCrudModal,
  setProductCrudModal,
  crudSelectedCategory,
  crudQuickNotes,
  setCrudQuickNotes,
  newCrudQuickNoteText,
  setNewCrudQuickNoteText,
  ownerBranches,
  tenantPrinterConfig,
  allProducts,
  productCategories,
  generateUUID,
  getMexicoISOString,
  addProductToFirebase,
  updateProductInFirebase,
  getAllProductsFromFirebase,
  triggerAppNotification
}) => {
''' + body.replace('  const renderProductCrudModal = () => {\n    if (!productCrudModal.isOpen) return null;\n', '')
        
        new_comp = new_comp[:new_comp.rfind('  };')]
        new_comp += '''};
'''
        with open('src/components/modals/ProductCrudModal.tsx', 'w', encoding='utf-8') as mf:
            mf.write(new_comp)
            
        content = content.replace(original_body_str, '')
        
        replacement = '''<ProductCrudModal
          productCrudModal={productCrudModal}
          setProductCrudModal={setProductCrudModal}
          crudSelectedCategory={crudSelectedCategory}
          crudQuickNotes={crudQuickNotes}
          setCrudQuickNotes={setCrudQuickNotes}
          newCrudQuickNoteText={newCrudQuickNoteText}
          setNewCrudQuickNoteText={setNewCrudQuickNoteText}
          ownerBranches={ownerBranches}
          tenantPrinterConfig={tenantPrinterConfig}
          allProducts={allProducts}
          productCategories={productCategories}
          generateUUID={generateUUID}
          getMexicoISOString={getMexicoISOString}
          addProductToFirebase={addProductToFirebase}
          updateProductInFirebase={updateProductInFirebase}
          getAllProductsFromFirebase={getAllProductsFromFirebase}
          triggerAppNotification={triggerAppNotification}
        />'''
        
        content = content.replace('{renderProductCrudModal()}', replacement)
        
        import_idx = content.find('import React')
        if import_idx != -1:
            content = content[:import_idx] + "import { ProductCrudModal } from './components/modals/ProductCrudModal';\n" + content[import_idx:]
            
        with open('src/App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print('Extracted ProductCrudModal successfully!')
