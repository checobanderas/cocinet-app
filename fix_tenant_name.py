import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'tenantName={tenantName}' in line:
        lines[i] = line.replace('tenantName={tenantName}', 'tenantName={selectedTenant?.name || ""}')
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
