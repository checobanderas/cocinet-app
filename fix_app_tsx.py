import re
import subprocess
import os

APP_TSX = "src/App.tsx"

def get_ts_errors():
    print("Running tsc on App.tsx...")
    result = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
    return result.stdout

def fix_app_tsx():
    with open(APP_TSX, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix un-replaced render functions
    content = content.replace('{renderPaymentModal()}', '<PaymentModal />')
    content = content.replace('{renderNumpadModal()}', '<NumpadModal />')
    content = content.replace('{renderPinModalOverlay()}', '<PinModalOverlay />')
    content = content.replace('{renderManageCompaniesModal()}', '<ManageCompaniesModal />')
    content = content.replace('{renderMultiTurnModal()}', '<MultiTurnModal />')
    content = content.replace('{renderPrintPreviewModal()}', '<PrintPreviewModal />')
    content = content.replace('{renderReceiptPreviewModal()}', '<ReceiptPreviewModal />')
    content = content.replace('{renderSupplierPurchaseModal()}', '<SupplierPurchaseModal />')
    content = content.replace('{renderSystemsChoiceAlert()}', '<SystemsChoiceAlert />')
    content = content.replace('{renderTablaArqueoModal()}', '<TablaArqueoModal />')
    content = content.replace('{renderTenantBackupConfirm()}', '<TenantBackupConfirm />')
    content = content.replace('{renderTenantCrudModal()}', '<TenantCrudModal />')

    with open(APP_TSX, "w", encoding="utf-8") as f:
        f.write(content)
        
    iteration = 0
    while iteration < 3:
        iteration += 1
        print(f"Iteration {iteration}")
        
        output = get_ts_errors()
        lines = output.split('\n')
        
        missing_names = set()
        for line in lines:
            m = re.match(r'^src/App\.tsx\(\d+,\d+\):\s+error\s+TS2304:\s+Cannot find name \'([^\']+)\'', line.strip())
            if m:
                missing_names.add(m.group(1))
        
        if not missing_names:
            print("No more missing names in App.tsx!")
            break
            
        print(f"Found {len(missing_names)} missing names to remove: {missing_names}")
        
        with open(APP_TSX, "r", encoding="utf-8") as f:
            content = f.read()
            
        for name in missing_names:
            # We want to remove the prop assignment: \n\s*name={name}
            pattern = r'\s*' + re.escape(name) + r'=\{' + re.escape(name) + r'\}'
            content = re.sub(pattern, '', content)
            
        with open(APP_TSX, "w", encoding="utf-8") as f:
            f.write(content)
            
    print("Done fixing App.tsx!")

if __name__ == '__main__':
    fix_app_tsx()
