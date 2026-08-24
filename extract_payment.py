import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = -1
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const renderPaymentModal = () => {' in line:
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
import { closeOutline, backspaceOutline } from 'ionicons/icons';

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (v: boolean) => void;
  selectedTable: any;
  selectedAccountForPayment: any;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  paymentAmountReceived: string;
  setPaymentAmountReceived: (v: string) => void;
  paymentDiscountType: string;
  setPaymentDiscountType: (v: string) => void;
  paymentDiscountValue: string;
  setPaymentDiscountValue: (v: string) => void;
  paymentDiscountTarget: string;
  setPaymentDiscountTarget: (v: string) => void;
  paymentTipTarget: string;
  setPaymentTipTarget: (v: string) => void;
  paymentTipValue: string;
  setPaymentTipValue: (v: string) => void;
  paymentCardType: string;
  setPaymentCardType: (v: string) => void;
  paymentCardLastFour: string;
  setPaymentCardLastFour: (v: string) => void;
  confirmPayment: () => void;
  
  // Numpad props
  showNumpad: boolean;
  setShowNumpad: (v: boolean) => void;
  numpadValue: string;
  setNumpadValue: (v: string | ((prev: string) => string)) => void;
  numpadTarget: string;
  numpadTotal: number;
  isNumpadValueFresh: boolean;
  setIsNumpadValueFresh: (v: boolean) => void;
  handleNumpadConfirm: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  selectedTable,
  selectedAccountForPayment,
  paymentMethod,
  setPaymentMethod,
  paymentAmountReceived,
  setPaymentAmountReceived,
  paymentDiscountType,
  setPaymentDiscountType,
  paymentDiscountValue,
  setPaymentDiscountValue,
  paymentDiscountTarget,
  setPaymentDiscountTarget,
  paymentTipTarget,
  setPaymentTipTarget,
  paymentTipValue,
  setPaymentTipValue,
  paymentCardType,
  setPaymentCardType,
  paymentCardLastFour,
  setPaymentCardLastFour,
  confirmPayment,
  
  showNumpad,
  setShowNumpad,
  numpadValue,
  setNumpadValue,
  numpadTarget,
  numpadTotal,
  isNumpadValueFresh,
  setIsNumpadValueFresh,
  handleNumpadConfirm
}) => {
''' + body.replace('  const renderPaymentModal = () => {\n    if (!showPaymentModal) return null;\n', '')
        
        new_comp = new_comp[:new_comp.rfind('  };')]
        new_comp += '''};
'''
        with open('src/components/modals/PaymentModal.tsx', 'w', encoding='utf-8') as mf:
            mf.write(new_comp)
            
        content = content.replace(original_body_str, '')
        
        replacement = '''<PaymentModal
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          selectedTable={selectedTable}
          selectedAccountForPayment={selectedAccountForPayment}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentAmountReceived={paymentAmountReceived}
          setPaymentAmountReceived={setPaymentAmountReceived}
          paymentDiscountType={paymentDiscountType}
          setPaymentDiscountType={setPaymentDiscountType}
          paymentDiscountValue={paymentDiscountValue}
          setPaymentDiscountValue={setPaymentDiscountValue}
          paymentDiscountTarget={paymentDiscountTarget}
          setPaymentDiscountTarget={setPaymentDiscountTarget}
          paymentTipTarget={paymentTipTarget}
          setPaymentTipTarget={setPaymentTipTarget}
          paymentTipValue={paymentTipValue}
          setPaymentTipValue={setPaymentTipValue}
          paymentCardType={paymentCardType}
          setPaymentCardType={setPaymentCardType}
          paymentCardLastFour={paymentCardLastFour}
          setPaymentCardLastFour={setPaymentCardLastFour}
          confirmPayment={confirmPayment}
          
          showNumpad={showNumpad}
          setShowNumpad={setShowNumpad}
          numpadValue={numpadValue}
          setNumpadValue={setNumpadValue}
          numpadTarget={numpadTarget}
          numpadTotal={numpadTotal}
          isNumpadValueFresh={isNumpadValueFresh}
          setIsNumpadValueFresh={setIsNumpadValueFresh}
          handleNumpadConfirm={handleNumpadConfirm}
        />'''
        
        content = content.replace('{showPaymentModal && renderPaymentModal()}', replacement)
        
        import_idx = content.find('import React')
        if import_idx != -1:
            content = content[:import_idx] + "import { PaymentModal } from './components/modals/PaymentModal';\n" + content[import_idx:]
            
        with open('src/App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print('Extracted PaymentModal successfully!')
