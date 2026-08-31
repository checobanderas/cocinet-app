import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'isSistemas={isSistemas}' in line:
        lines[i] = line.replace('isSistemas={isSistemas}', "isSistemas={currentUser?.id?.endsWith('-sistemas') || false}")
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
