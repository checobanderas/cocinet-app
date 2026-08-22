import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix subcategories generation
pattern_gen = re.compile(
    r'(const subcategories = Array\.from\(\s*new Set\(\s*products\s*\.filter\(\(p\) => p\.isDeleted !== true && p\.category === activeCategory\)\s*\.map\(\(p\) => p\.subcategory\),\s*\),\s*\)\s*\.filter\(Boolean\)\s*\.sort\(\);)',
    re.DOTALL
)

repl_gen = '''const subcategories = Array.from(
      new Set(
        products
          .filter((p) => p.isDeleted !== true && p.category === activeCategory)
          .map((p) => (p.subcategory || "").trim().toUpperCase()),
      ),
    )
      .filter(Boolean)
      .sort();'''

content = pattern_gen.sub(repl_gen, content)

# 2. Fix the displayProducts filtering
pattern_filter1 = re.compile(
    r'(const filteredProducts = products\.filter\(p => p\.isDeleted !== true\)\.filter\(\s*\(item\) =>\s*item\.category === activeCategory &&\s*)(item\.subcategory === activeSubcategory|\(item\.subcategory \|\| ""\)\.toUpperCase\(\) === activeSubcategory\.toUpperCase\(\)),',
    re.DOTALL
)

repl_filter1 = r'\1(item.subcategory || "").trim().toUpperCase() === (activeSubcategory || "").trim().toUpperCase(),'
content = pattern_filter1.sub(repl_filter1, content)

pattern_filter2 = re.compile(
    r'(const baseProducts = products\.filter\(p => p\.isDeleted !== true\)\.filter\(\s*\(item\) =>\s*item\.category === activeCategory &&\s*)(item\.subcategory === activeSubcategory|\(item\.subcategory \|\| ""\)\.toUpperCase\(\) === activeSubcategory\.toUpperCase\(\)),',
    re.DOTALL
)
content = pattern_filter2.sub(repl_filter1, content)

# 3. Fix the subcategories buttons to use title case if preferred, but they use .toUpperCase() anyway
# But wait, what if existingSubcategories and crudCategorySubcategories also need it?
pattern_existing1 = re.compile(
    r'const existingSubcategories = useMemo\(\(\) => \{\s*return Array\.from\(new Set\(products\.filter\(p => p\.isDeleted !== true\)\.map\(\(p\) => p\.subcategory \|\| ""\)\.filter\(Boolean\)\.sort\(\)\)\);\s*\}, \[products\]\);',
    re.DOTALL
)
repl_existing1 = '''const existingSubcategories = useMemo(() => {
    return Array.from(new Set(products.filter(p => p.isDeleted !== true).map((p) => (p.subcategory || "").trim().toUpperCase()).filter(Boolean).sort()));
  }, [products]);'''
content = pattern_existing1.sub(repl_existing1, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replacements executed.")
