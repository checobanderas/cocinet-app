import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports at the top
imports = """import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SwitchTenantOverlay } from './components/modals/SwitchTenantOverlay';
import { PinModalOverlay } from './components/modals/PinModalOverlay';
import { CancellationPinPad } from './components/common/CancellationPinPad';
"""
content = re.sub(
    r"import React, { useState, useEffect, useRef, useMemo } from ['\"]react['\"];?",
    imports,
    content
)

# 2. Delete renderSwitchingTenantOverlay
content = re.sub(
    r"  const renderSwitchingTenantOverlay = \(\) => \{.*?  \};\n",
    "",
    content,
    flags=re.DOTALL
)

# Replace its usage
content = re.sub(
    r"\{isSwitchingTenant && renderSwitchingTenantOverlay\(\)\}",
    "{isSwitchingTenant && <SwitchTenantOverlay switchingTenantName={switchingTenantName} />}",
    content
)

# 3. Delete renderPinModalOverlay
content = re.sub(
    r"  const renderPinModalOverlay = \(\) => \{.*?  \};\n\n  const \[showPaymentModal",
    "  const [showPaymentModal",
    content,
    flags=re.DOTALL
)

# Replace its usage
content = re.sub(
    r"\{showTenantPinModal && renderPinModalOverlay\(\)\}",
    "{showTenantPinModal && <PinModalOverlay pendingTenant={pendingTenant} typedPin={typedPin} setTypedPin={setTypedPin} handlePinNumericPress={handlePinNumericPress} setShowTenantPinModal={setShowTenantPinModal} setPendingTenant={setPendingTenant} />}",
    content
)

# 4. Delete renderCancellationPinPad
content = re.sub(
    r"  const renderCancellationPinPad = \(.*?  \};\n  const \[passwordTarget",
    "  const [passwordTarget",
    content,
    flags=re.DOTALL
)

# Replace usages
content = re.sub(
    r"\{renderCancellationPinPad\(\s*cancellationPin,\s*setCancellationPin,\s*handleAuthorizeCancellation\s*\)\}",
    "<CancellationPinPad currentPin={cancellationPin} setPin={setCancellationPin} onComplete={handleAuthorizeCancellation} />",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"\{renderCancellationPinPad\(\s*cancellationPin,\s*setCancellationPin,\s*handleAuthorizeClosedAccountCancellation\s*\)\}",
    "<CancellationPinPad currentPin={cancellationPin} setPin={setCancellationPin} onComplete={handleAuthorizeClosedAccountCancellation} />",
    content,
    flags=re.DOTALL
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Migration applied successfully.")
