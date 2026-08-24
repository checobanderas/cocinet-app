import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("const renderGestionCuentas = () => {")
if idx != -1:
    before = content[:idx]
    after = content[idx:]
    
    # Shrink the button size
    after = re.sub(r'width:\s*"72px"', 'width: "100%"', after, count=1)
    after = re.sub(r'height:\s*"72px"', 'height: "100%"', after, count=1)
    after = re.sub(r'minHeight:\s*"125px"', 'minHeight: "90px"', after, count=1)
    
    # Adjust font size to fit emojis
    after = re.sub(r'fontSize:\s*"1.5rem"', 'fontSize: "1.05rem"', after, count=1)
    
    content = before + after
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("UI Adjustments done!")
