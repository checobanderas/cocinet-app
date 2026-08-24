import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
start_idx = -1
for i, line in enumerate(lines):
    if 'const renderPinModalOverlay = () => {' in line:
        start_idx = i
        break

print(f"Start: {start_idx}")

# Find end - look for closing }; that follows the IonModal close tag
end_idx = -1
for i in range(start_idx, min(start_idx + 300, len(lines))):
    stripped = lines[i].strip()
    if stripped == '};' and i >= 2 and ('</IonModal>' in lines[i-1] or '</IonModal>' in lines[i-2]):
        end_idx = i
        print(f"End: {end_idx}")
        for j in range(end_idx-3, end_idx+2):
            print(f"  {j+1}: {lines[j]}")
        break

if end_idx == -1:
    # Try alternative: look for the pattern ); then }; after the return
    for i in range(start_idx, min(start_idx + 300, len(lines))):
        stripped = lines[i].strip()
        if stripped == '};' and i >= 2 and lines[i-1].strip() == ');':
            end_idx = i
            print(f"End (alt): {end_idx}")
            for j in range(end_idx-5, end_idx+2):
                print(f"  {j+1}: {lines[j]}")
            break
