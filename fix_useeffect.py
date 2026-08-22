import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r'(useEffect\(\(\) => \{\s*const subs = Array\.from\(\s*new Set\(\s*products\s*\.filter\(\(p\) => p\.isDeleted !== true && p\.category === activeCategory\)\s*\.map\(\(p\) => )(p\.subcategory)(,\s*\),\s*\)\.filter\(Boolean\);\s*if \(\s*subs\.length > 0 &&\s*\(!activeSubcategory \|\| !subs\.includes\()(activeSubcategory)(\)\)\s*\)\s*\{\s*setActiveSubcategory\()(subs\[0\])(\);\s*\}\s*\}, \[products, activeCategory, activeSubcategory\]\);)',
    re.DOTALL
)

def repl(match):
    return match.group(1) + '(p.subcategory || "").trim().toUpperCase()' + match.group(3) + '(activeSubcategory || "").trim().toUpperCase()' + match.group(5) + 'subs[0]' + match.group(7)

new_content = pattern.sub(repl, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed useEffect logic")
