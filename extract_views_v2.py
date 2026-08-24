import sys, codecs, re
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

ionic_components = set(re.findall(r'Ion[A-Za-z]+', content))
ionic_icons = set(re.findall(r'[a-zA-Z]+Outline|[a-zA-Z]+Sharp', content))

def extract_render_function(function_name, component_name):
    global content, lines
    start_idx = -1
    for i, line in enumerate(lines):
        if re.search(r'const\s+' + function_name + r'\s*=\s*\(', line):
            start_idx = i
            break
            
    if start_idx == -1:
        print(f"Could not find {function_name}")
        return False

    first_line = lines[start_idx]
    
    # Check if it starts with () => ( or () => {
    is_paren = False
    is_brace = False
    
    match = re.search(r'const\s+' + function_name + r'\s*=\s*\((.*?)\)\s*=>\s*([({])', first_line)
    if not match:
        # maybe the arrow is on the next line? Let's check first 3 lines
        combined = " ".join(lines[start_idx:start_idx+3])
        match = re.search(r'const\s+' + function_name + r'\s*=\s*\((.*?)\)\s*=>\s*([({])', combined)
        if not match:
            print(f"Could not parse arrow function for {function_name}")
            return False

    func_params_str = match.group(1)
    open_char = match.group(2)
    
    if open_char == '(':
        open_char, close_char = '(', ')'
    else:
        open_char, close_char = '{', '}'

    # Count to find end
    depth = 0
    end_idx = -1
    started = False
    
    for i in range(start_idx, len(lines)):
        line = lines[i]
        # To avoid catching characters inside strings or comments, we could be more careful,
        # but simple counting usually works if the file is well formatted. 
        # But wait, there might be other ({}) inside! We MUST only count the main block's delimiter.
        for char in line:
            if char == open_char:
                depth += 1
                started = True
            elif char == close_char:
                depth -= 1
                if started and depth == 0:
                    end_idx = i
                    break
        if end_idx != -1:
            break

    if end_idx == -1:
        print(f"Could not find end of {function_name}")
        return False

    body_lines = lines[start_idx:end_idx+1]
    body_str = '\n'.join(body_lines)
    
    # find params
    func_params = [re.sub(r'[^a-zA-Z0-9_]', '', p.split(':')[0]) for p in func_params_str.split(',')] if func_params_str.strip() else []
    func_params = [p for p in func_params if p]

    # Find dependencies
    state_vars = set()
    for match_var in re.finditer(r'const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=', content):
        state_vars.add(match_var.group(1))
        state_vars.add(match_var.group(2))

    for match_fn in re.finditer(r'const\s+(handle[a-zA-Z0-9_]+)\s*=', content):
        state_vars.add(match_fn.group(1))
    for match_fn in re.finditer(r'const\s+(render[a-zA-Z0-9_]+)\s*=', content):
        state_vars.add(match_fn.group(1))
    for match_fn in re.finditer(r'const\s+(trigger[a-zA-Z0-9_]+)\s*=', content):
        state_vars.add(match_fn.group(1))
    for match_fn in re.finditer(r'const\s+(fetch[a-zA-Z0-9_]+)\s*=', content):
        state_vars.add(match_fn.group(1))

    known_constants = ['COMPANY_CATALOG', 'users', 'activeOwnerFilter', 'activeTenantFilter', 'selectedTable']
    for k in known_constants:
        state_vars.add(k)

    ignore_list = {'React', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Promise', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'e', 'event'}

    body_words = set(re.findall(r'\b[a-zA-Z_]\w*\b', body_str))
    
    props_to_pass = (state_vars & body_words) - ignore_list - set(func_params) - {function_name}

    props_interface = f'interface {component_name}Props {{\n'
    for prop in sorted(props_to_pass):
        props_interface += f'  {prop}: any;\n'
    for p in func_params:
        if p:
            props_interface += f'  {p}: any;\n'
    props_interface += '}'

    props_destructure = ',\n  '.join(sorted(list(props_to_pass) + [p for p in func_params if p]))
    props_pass_str = '\n'.join([f'      {p}={{{p}}}' for p in sorted(props_to_pass)])
    
    # Remove the wrapper `const renderX = (...) => (` or `{` and the closing `)` or `}`
    # Wait! the first line might just be `const renderX = () => (` and the last line `);`
    # Let's extract the inside of the outermost brackets!
    
    inner_start = body_str.find(open_char) + 1
    inner_end = body_str.rfind(close_char)
    inner_body = body_str[inner_start:inner_end].strip()
    
    # If it was a () block, we should wrap it in return (...)
    # If it was a {} block, we can just dump it inside the component.
    if open_char == '(':
        inner_body = f"  return (\n{inner_body}\n  );"

    used_components = ionic_components & body_words
    used_icons = ionic_icons & body_words
    
    logo_icons = set(re.findall(r'logo[A-Z][a-zA-Z]+', body_str))
    used_icons.update(logo_icons)
    
    import_components = f"import {{ {', '.join(sorted(used_components))} }} from '@ionic/react';" if used_components else ""
    import_icons = f"import {{ {', '.join(sorted(used_icons))} }} from 'ionicons/icons';" if used_icons else ""

    new_comp = f'''import React from 'react';
import {{ motion, AnimatePresence }} from 'framer-motion';
{import_components}
{import_icons}

{props_interface}

export const {component_name}: React.FC<{component_name}Props> = ({{
  {props_destructure}
}}) => {{
{inner_body}
}};
'''
    import os
    if not os.path.exists('src/components/views'):
        os.makedirs('src/components/views')
        
    with open(f'src/components/views/{component_name}.tsx', 'w', encoding='utf-8') as f:
        f.write(new_comp)

    # In App.tsx
    wrapper = f'''const {function_name} = ({func_params_str}) => (
    <{component_name}
{props_pass_str}
      {' '.join([f'{p}={{{p}}}' for p in func_params if p])}
    />
  );'''

    new_content = content.replace(body_str, wrapper)
    
    import_idx = new_content.find('import React')
    if import_idx != -1:
        new_content = new_content[:import_idx] + f"import {{ {component_name} }} from './components/views/{component_name}';\n" + new_content[import_idx:]
    
    content = new_content
    lines = content.split('\n')
        
    print(f"Extracted {function_name} -> {component_name} ({len(body_lines)} lines)")
    return True

# Just testing Floorplan first
extract_render_function('renderFloorplan', 'FloorplanView')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
