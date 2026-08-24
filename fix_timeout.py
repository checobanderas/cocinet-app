import re

with open("src/utils/firestore.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Change the 15000ms (15s) timeout to 3000ms (3s) in runWrite
content = re.sub(r'setTimeout\(\(\) => reject\(new Error\("Database write timeout \(15s\)"\)\), 15000\)', 
                 r'setTimeout(() => reject(new Error("Database write timeout (3s)")), 3000)', 
                 content)

with open("src/utils/firestore.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Timeout lowered to 3s.")
