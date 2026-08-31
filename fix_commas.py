import sys, codecs, re, os
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

# Fix ALL missing commas in destructuring patterns across all component files
# The bug: the fix_all_missing_props.py appended new props WITHOUT a leading comma
# when the last existing prop had no trailing comma.
component_dirs = ['src/components/modals', 'src/components/views']

fixed = 0
for comp_dir in component_dirs:
    if not os.path.exists(comp_dir):
        continue
    for fname in sorted(os.listdir(comp_dir)):
        if not fname.endswith('.tsx'):
            continue
        fpath = os.path.join(comp_dir, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            code = f.read()
        
        # Find the destructuring block: ({ ...\n  newProp\n})
        # Pattern: a word at end of line with NO trailing comma, followed by newline + 2-space word + newline + })
        # Fix: add comma after lines inside {} that don't have one but need one
        
        # Approach: find the FC destructure block and reformat it properly
        def fix_destructure(m):
            block = m.group(1)
            # split by newlines and clean up each prop
            lines = block.split('\n')
            cleaned = []
            for line in lines:
                stripped = line.strip().rstrip(',')
                if stripped:
                    cleaned.append(stripped)
            # rejoin with comma+newline
            return '({\n  ' + ',\n  '.join(cleaned) + '\n})'
        
        new_code = re.sub(
            r'\(\{((?:\s*[a-zA-Z0-9_,\n\s?:]+)*)\}\)',
            fix_destructure,
            code,
            count=1  # only fix the component props destructuring, first occurrence
        )
        
        if new_code != code:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_code)
            fixed += 1
            print(f"Fixed destructuring in {fname}")

print(f"\nFixed {fixed} files")
