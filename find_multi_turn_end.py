import sys, codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Find renderMultiTurnModal
start_idx = -1
for i, line in enumerate(lines):
    if 'const renderMultiTurnModal = () =>' in line:
        start_idx = i
        break

print(f"Start: {start_idx}")

# Find end: look for }; after ); 
end_idx = -1
for i in range(start_idx, min(start_idx + 500, len(lines))):
    if lines[i].strip() == '};' and i >= 1 and lines[i-1].strip() == ');':
        end_idx = i
        print(f"End: {end_idx}")
        for j in range(end_idx-3, end_idx+2):
            print(f"  {j+1}: {lines[j]}")
        break

if end_idx == -1:
    # try alternative endings
    for i in range(start_idx, min(start_idx + 500, len(lines))):
        if lines[i].strip() == '};' and '</IonModal>' in '\n'.join(lines[max(0,i-5):i]):
            end_idx = i
            print(f"End (alt): {end_idx}")
            for j in range(end_idx-5, end_idx+2):
                print(f"  {j+1}: {lines[j]}")
            break
