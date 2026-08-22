import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('item.subcategory === activeSubcategory,', '(item.subcategory || \"\").toUpperCase() === activeSubcategory.toUpperCase(),')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed subcategory filter')
