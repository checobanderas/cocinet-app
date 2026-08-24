import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Match occurrences of `{renderCancellationPinPad(` and replace with JSX
# Note: Since the third argument is an inline function, we need to carefully capture the three arguments.
# However, Regex might be tricky for nested braces (the function body).
# Let's do it manually using Python's string operations.

def replace_pin_pads(text):
    start = 0
    while True:
        idx = text.find("{renderCancellationPinPad(", start)
        if idx == -1:
            break
            
        # Find the matching closing parenthesis and brace
        brace_level = 1
        paren_level = 0
        end_idx = -1
        
        # We start looking from idx + 1
        for i in range(idx + 1, len(text)):
            char = text[i]
            if char == '{':
                brace_level += 1
            elif char == '}':
                brace_level -= 1
            elif char == '(':
                paren_level += 1
            elif char == ')':
                paren_level -= 1
                
            if brace_level == 0:
                end_idx = i
                break
                
        if end_idx != -1:
            # We found the block: {renderCancellationPinPad( arg1, arg2, arg3 )}
            block = text[idx:end_idx+1]
            
            # The arguments inside the render function
            inner = block[len("{renderCancellationPinPad("):-2] # remove start and )}
            
            # Since args are separated by commas, but the third arg is an async (pin) => { ... } which contains commas,
            # we just split by comma but limit to 2 splits.
            # E.g. "authPin, setAuthPin, async (pin) => { ... }"
            parts = inner.split(',', 2)
            if len(parts) == 3:
                arg1 = parts[0].strip()
                arg2 = parts[1].strip()
                arg3 = parts[2].strip()
                
                new_jsx = f"<CancellationPinPad currentPin={{{arg1}}} setPin={{{arg2}}} onComplete={{{arg3}}} />"
                text = text[:idx] + new_jsx + text[end_idx+1:]
                start = idx + len(new_jsx)
            else:
                start = idx + 1
        else:
            start = idx + 1
            
    return text

content = replace_pin_pads(content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Pin pads replaced.")
