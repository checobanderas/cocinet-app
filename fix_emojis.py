import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace {table.label} inside the table button render
# The line is around 32354: `{table.label}` followed by `{hasActiveOrders && (`

old_str = r"\{\s*table\.label\s*\}\s*\{\s*hasActiveOrders && \("
new_str = """{(() => {
                                          const z = (table.zone || "").toLowerCase();
                                          const l = (table.label || "").toLowerCase();
                                          if (z.includes("llevar") || l.includes("llevar") || l.startsWith("p")) return "🛍️ " + table.label;
                                          if (z.includes("domicilio") || l.includes("domicilio") || z.includes("reparto") || l.includes("reparto") || l.startsWith("d")) return "🛵 " + table.label;
                                          return table.label;
                                        })()}
                                        {hasActiveOrders && ("""

# Just replacing the first occurrence that matches in renderGestionCuentas
idx = content.find("const renderGestionCuentas = () => {")
if idx != -1:
    before = content[:idx]
    after = content[idx:]
    after = re.sub(old_str, new_str, after, count=1)
    content = before + after
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found!")
