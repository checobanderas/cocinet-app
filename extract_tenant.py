import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = -1
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const renderTenantCrudModal = () => {' in line:
        start_idx = i
        break

if start_idx != -1:
    end_idx = -1
    for i in range(start_idx, len(lines)):
        if '};' in lines[i] and '</IonModal>' in lines[i-2]:
            end_idx = i
            break
            
    if end_idx != -1:
        # Extract the exact body
        body = '\n'.join(lines[start_idx:end_idx+1])
        
        # Determine the lines to delete (including the definition)
        original_body_str = body
        
        # New component
        new_comp = '''import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/react';
import { trashOutline, saveOutline, swapHorizontalOutline, documentTextOutline, mapOutline, colorPaletteOutline, businessOutline, closeOutline } from 'ionicons/icons';
import { CompanyTenant } from '../utils/companyCatalog';

interface TenantCrudModalProps {
  showTenantCrudModal: boolean;
  setShowTenantCrudModal: (v: boolean) => void;
  editingTenant: any;
  resetTenantForm: () => void;
  COMPANY_CATALOG: CompanyTenant[];
  customOwners: any[];
  dependentBranches: any[];
  formTenantType: string;
  setFormTenantType: (v: string) => void;
  formTenantName: string;
  setFormTenantName: (v: string) => void;
  formTenantPropietario: string;
  setFormTenantPropietario: (v: string) => void;
  formTenantOwnerKey: string;
  setFormTenantOwnerKey: (v: string) => void;
  formTenantSucursal: string;
  setFormTenantSucursal: (v: string) => void;
  formTenantRfc: string;
  setFormTenantRfc: (v: string) => void;
  formTenantDireccion: string;
  setFormTenantDireccion: (v: string) => void;
  formTenantEmail: string;
  setFormTenantEmail: (v: string) => void;
  formTenantLat: string;
  setFormTenantLat: (v: string) => void;
  formTenantLng: string;
  setFormTenantLng: (v: string) => void;
  formTenantLogoUrl: string;
  setFormTenantLogoUrl: (v: string) => void;
  formTenantAvatar: string;
  setFormTenantAvatar: (v: string) => void;
  formTenantAccentColor: string;
  setFormTenantAccentColor: (v: string) => void;
  formTenantRequireInternalFolio: boolean;
  setFormTenantRequireInternalFolio: (v: boolean) => void;
  transferStep: number;
  setTransferStep: (v: number) => void;
  transferTargetOwnerKey: string;
  setTransferTargetOwnerKey: (v: string) => void;
  transferIncludeBranches: boolean;
  setTransferIncludeBranches: (v: boolean) => void;
  handleSaveTenant: () => Promise<void>;
  handleDeleteTenant: () => Promise<void>;
  executeTenantTransfer: () => Promise<void>;
  triggerAppNotification: (title: string, msg: string, type: 'success'|'warning'|'error'|'info') => void;
}

export const TenantCrudModal: React.FC<TenantCrudModalProps> = ({
  showTenantCrudModal,
  setShowTenantCrudModal,
  editingTenant,
  resetTenantForm,
  COMPANY_CATALOG,
  customOwners,
  dependentBranches,
  formTenantType,
  setFormTenantType,
  formTenantName,
  setFormTenantName,
  formTenantPropietario,
  setFormTenantPropietario,
  formTenantOwnerKey,
  setFormTenantOwnerKey,
  formTenantSucursal,
  setFormTenantSucursal,
  formTenantRfc,
  setFormTenantRfc,
  formTenantDireccion,
  setFormTenantDireccion,
  formTenantEmail,
  setFormTenantEmail,
  formTenantLat,
  setFormTenantLat,
  formTenantLng,
  setFormTenantLng,
  formTenantLogoUrl,
  setFormTenantLogoUrl,
  formTenantAvatar,
  setFormTenantAvatar,
  formTenantAccentColor,
  setFormTenantAccentColor,
  formTenantRequireInternalFolio,
  setFormTenantRequireInternalFolio,
  transferStep,
  setTransferStep,
  transferTargetOwnerKey,
  setTransferTargetOwnerKey,
  transferIncludeBranches,
  setTransferIncludeBranches,
  handleSaveTenant,
  handleDeleteTenant,
  executeTenantTransfer,
  triggerAppNotification
}) => {
''' + body.replace('  const renderTenantCrudModal = () => {\n    if (!showTenantCrudModal) return null;\n', '')
        
        # fix trailing '};'
        new_comp = new_comp[:new_comp.rfind('  };')]
        new_comp += '''};
'''
        with open('src/components/modals/TenantCrudModal.tsx', 'w', encoding='utf-8') as mf:
            mf.write(new_comp)
            
        # replace the original function definition
        content = content.replace(original_body_str, '')
        
        # Replace the call
        replacement = '''<TenantCrudModal
          showTenantCrudModal={showTenantCrudModal}
          setShowTenantCrudModal={setShowTenantCrudModal}
          editingTenant={editingTenant}
          resetTenantForm={resetTenantForm}
          COMPANY_CATALOG={COMPANY_CATALOG}
          customOwners={customOwners}
          dependentBranches={dependentBranches}
          formTenantType={formTenantType}
          setFormTenantType={setFormTenantType}
          formTenantName={formTenantName}
          setFormTenantName={setFormTenantName}
          formTenantPropietario={formTenantPropietario}
          setFormTenantPropietario={setFormTenantPropietario}
          formTenantOwnerKey={formTenantOwnerKey}
          setFormTenantOwnerKey={setFormTenantOwnerKey}
          formTenantSucursal={formTenantSucursal}
          setFormTenantSucursal={setFormTenantSucursal}
          formTenantRfc={formTenantRfc}
          setFormTenantRfc={setFormTenantRfc}
          formTenantDireccion={formTenantDireccion}
          setFormTenantDireccion={setFormTenantDireccion}
          formTenantEmail={formTenantEmail}
          setFormTenantEmail={setFormTenantEmail}
          formTenantLat={formTenantLat}
          setFormTenantLat={setFormTenantLat}
          formTenantLng={formTenantLng}
          setFormTenantLng={setFormTenantLng}
          formTenantLogoUrl={formTenantLogoUrl}
          setFormTenantLogoUrl={setFormTenantLogoUrl}
          formTenantAvatar={formTenantAvatar}
          setFormTenantAvatar={setFormTenantAvatar}
          formTenantAccentColor={formTenantAccentColor}
          setFormTenantAccentColor={setFormTenantAccentColor}
          formTenantRequireInternalFolio={formTenantRequireInternalFolio}
          setFormTenantRequireInternalFolio={setFormTenantRequireInternalFolio}
          transferStep={transferStep}
          setTransferStep={setTransferStep}
          transferTargetOwnerKey={transferTargetOwnerKey}
          setTransferTargetOwnerKey={setTransferTargetOwnerKey}
          transferIncludeBranches={transferIncludeBranches}
          setTransferIncludeBranches={setTransferIncludeBranches}
          handleSaveTenant={handleSaveTenant}
          handleDeleteTenant={handleDeleteTenant}
          executeTenantTransfer={executeTenantTransfer}
          triggerAppNotification={triggerAppNotification}
        />'''
        
        content = content.replace('{showTenantCrudModal && renderTenantCrudModal()}', replacement)
        
        import_idx = content.find('import React')
        if import_idx != -1:
            content = content[:import_idx] + "import { TenantCrudModal } from './components/modals/TenantCrudModal';\n" + content[import_idx:]
            
        with open('src/App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print('Extracted TenantCrudModal successfully!')
