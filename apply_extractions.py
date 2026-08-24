import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. PinsStructureModal
start_pins = content.find('        <IonModal\n          isOpen={showPinsStructureModal}')
if start_pins != -1:
    end_pins = content.find('        </IonModal>', start_pins) + len('        </IonModal>')
    replacement = '''        <PinsStructureModal
          showPinsStructureModal={showPinsStructureModal}
          setShowPinsStructureModal={setShowPinsStructureModal}
          COMPANY_CATALOG={COMPANY_CATALOG}
        />'''
    content = content[:start_pins] + replacement + content[end_pins:]
    print('PinsStructureModal replaced.')

# 2. DeviceRequestsModal
start_dev = content.find('        <IonModal\n          isOpen={showDeviceRequestsModal}')
if start_dev != -1:
    end_dev = content.find('        </IonModal>', start_dev) + len('        </IonModal>')
    replacement = '''        <DeviceRequestsModal
          showDeviceRequestsModal={showDeviceRequestsModal}
          setShowDeviceRequestsModal={setShowDeviceRequestsModal}
          allDeviceRequests={allDeviceRequests}
          COMPANY_CATALOG={COMPANY_CATALOG}
          updateDeviceRequest={updateDeviceRequest}
        />'''
    content = content[:start_dev] + replacement + content[end_dev:]
    print('DeviceRequestsModal replaced.')

# 3. BluetoothConfigModal
start_bt = content.find('  const renderBluetoothConfigModal = () => {')
if start_bt != -1:
    end_bt = content.find('      </IonModal>\n    );\n  };\n', start_bt)
    if end_bt != -1:
        end_bt += len('      </IonModal>\n    );\n  };\n')
        content = content[:start_bt] + content[end_bt:]
        print('renderBluetoothConfigModal definition deleted.')

    state_str = '''  const [newAreaName, setNewAreaName] = useState<string>("");
  const [newAreaEmoji, setNewAreaEmoji] = useState<string>("");
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatEmoji, setNewCatEmoji] = useState<string>("");
  const [newCatDest, setNewCatDest] = useState<string>("cocina");
  const [configModalTab, setConfigModalTab] = useState<"printers" | "categories">("printers");\n'''
    content = content.replace(state_str, '')

    call_str = '{showBluetoothConfigModal && renderBluetoothConfigModal()}'
    rep_call = '''<BluetoothConfigModal
          tenantName={tenantName}
          showBluetoothConfigModal={showBluetoothConfigModal}
          setShowBluetoothConfigModal={setShowBluetoothConfigModal}
          productCategories={productCategories}
          setProductCategories={setProductCategories}
          tenantPrinterConfig={tenantPrinterConfig}
          setTenantPrinterConfig={setTenantPrinterConfig}
          triggerAppNotification={triggerAppNotification}
        />'''
    content = content.replace(call_str, rep_call)
    print('BluetoothConfigModal call replaced.')

imports = '''import { PinsStructureModal } from './components/modals/PinsStructureModal';
import { DeviceRequestsModal } from './components/modals/DeviceRequestsModal';
import { BluetoothConfigModal } from './components/modals/BluetoothConfigModal';\n'''

last_import_idx = content.rfind('import ')
last_import_end = content.find('\n', last_import_idx) + 1
content = content[:last_import_end] + imports + content[last_import_end:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
