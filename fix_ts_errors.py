import os
import re
import subprocess

APP_TSX = "src/App.tsx"

def get_app_imports_and_globals():
    with open(APP_TSX, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Map from identifier to its import path (relative to src)
    # Example: "getFormattedProductName" -> "utils/appHelpers"
    import_map = {}
    
    import_blocks = re.findall(r'import\s+(?:{[^}]+}|\w+)\s+from\s+[\'"]([^\'"]+)[\'"]', content)
    # Wait, simple regex won't capture the identifiers inside { }. Let's do a better one.
    
    for match in re.finditer(r'import\s+(.*?)\s+from\s+[\'"]([^\'"]+)[\'"]', content, re.DOTALL):
        idents_raw = match.group(1)
        path = match.group(2)
        
        # Clean up idents
        idents_raw = idents_raw.replace('{', '').replace('}', '').replace('\n', ' ')
        idents = [i.strip() for i in idents_raw.split(',')]
        
        # Normalize path to be relative to src/
        if path.startswith('./'):
            path = path[2:]
        elif path.startswith('../'):
            continue # ignore for now
            
        for ident in idents:
            if ident:
                # Handle "X as Y"
                parts = ident.split(' as ')
                name = parts[-1].strip()
                import_map[name] = path

    return import_map

import_map = get_app_imports_and_globals()
# Add some known ones that might not be captured well
import_map['sanitizeBusinessName'] = 'PROP'
import_map['sanitizeEmail'] = 'PROP'
import_map['playNotificationSound'] = 'PROP'
import_map['toggleTextCase'] = 'PROP'

def run_tsc():
    print("Running tsc...")
    result = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
    return result.stdout

def fix_errors():
    iteration = 0
    while iteration < 5:
        iteration += 1
        print(f"\n--- Iteration {iteration} ---")
        output = run_tsc()
        if "error TS" not in output:
            print("No more TS errors!")
            break
            
        lines = output.split('\n')
        
        file_modifications = {} # file -> {'add_imports': {path: set(idents)}, 'add_props': set(idents), 'remove_imports': {path: set(idents)}}
        
        for line in lines:
            # Example: src/components/views/DashboardView.tsx(327,15): error TS2304: Cannot find name 'addCashMovementToFirebase'.
            m = re.match(r'^([^:]+\.tsx)\(\d+,\d+\):\s+error\s+(TS\d+):\s+(.*)$', line.strip())
            if not m:
                continue
            
            filepath, ts_code, message = m.groups()
            
            if filepath not in file_modifications:
                file_modifications[filepath] = {'add_imports': {}, 'add_props': set(), 'remove_imports': {}}
                
            if ts_code == 'TS2304':
                # Cannot find name 'X'
                m2 = re.search(r"Cannot find name '([^']+)'", message)
                if m2:
                    name = m2.group(1)
                    if name in import_map and import_map[name] != 'PROP':
                        # Add import
                        mod_path = import_map[name]
                        if filepath.startswith('src/components/views/') or filepath.startswith('src/components/modals/'):
                            # Need to calculate relative path
                            if mod_path.startswith('components/modals/'):
                                rel_path = "../modals/" + mod_path.split('/')[-1]
                            elif mod_path.startswith('components/views/'):
                                rel_path = "../views/" + mod_path.split('/')[-1]
                            elif mod_path.startswith('utils/'):
                                rel_path = "../../utils/" + mod_path.split('/')[-1]
                            else:
                                rel_path = mod_path # third party like 'ionicons/icons'
                        else:
                            rel_path = mod_path
                            
                        file_modifications[filepath]['add_imports'].setdefault(rel_path, set()).add(name)
                    else:
                        # Add as prop
                        file_modifications[filepath]['add_props'].add(name)
                        
            elif ts_code == 'TS2305':
                # Module 'X' has no exported member 'Y'
                m2 = re.search(r"Module '([^']+)' has no exported member '([^']+)'", message)
                if m2:
                    mod = m2.group(1)
                    name = m2.group(2)
                    file_modifications[filepath]['remove_imports'].setdefault(mod, set()).add(name)
                    # And add it as prop instead!
                    file_modifications[filepath]['add_props'].add(name)
                    
            elif ts_code == 'TS2300':
                # Duplicate identifier 'X'
                pass # Usually handled manually or it's a global issue
        
        if not file_modifications:
            print("No fixable errors found.")
            break
            
        for filepath, mods in file_modifications.items():
            if not os.path.exists(filepath):
                continue
            if not filepath.startswith('src/components/'):
                continue
                
            print(f"Fixing {filepath}...")
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Remove imports
            for mod, names in mods['remove_imports'].items():
                # regex to find the import
                def repl_remove(match):
                    idents_str = match.group(1)
                    idents = [i.strip() for i in idents_str.split(',')]
                    new_idents = [i for i in idents if i not in names]
                    if new_idents:
                        return f"import {{ {', '.join(new_idents)} }} from '{mod}';"
                    else:
                        return ""
                content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'"]' + re.escape(mod) + r'[\'"];?', repl_remove, content)
                
            # Add imports
            for mod, names in mods['add_imports'].items():
                if mod in content:
                    # Append to existing
                    def repl_add(match):
                        idents_str = match.group(1)
                        idents = set(i.strip() for i in idents_str.split(','))
                        idents.update(names)
                        return f"import {{ {', '.join(sorted(idents))} }} from '{mod}';"
                    content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'"]' + re.escape(mod) + r'[\'"];?', repl_add, content)
                else:
                    # Add new line after first import
                    import_line = f"import {{ {', '.join(sorted(names))} }} from '{mod}';\n"
                    content = import_line + content
                    
            # Add props
            if mods['add_props']:
                def repl_props_interface(match):
                    existing = match.group(1)
                    new_props = []
                    for p in mods['add_props']:
                        if f"{p}:" not in existing and f"{p}?" not in existing:
                            new_props.append(f"  {p}: any;")
                    if new_props:
                        return f"interface {match.group(0)[10:].split('{')[0].strip()} {{\n" + "\n".join(new_props) + existing
                    return match.group(0)
                
                content = re.sub(r'interface\s+\w+Props\s*\{([^}]+)', repl_props_interface, content, count=1)
                
                def repl_props_destructure(match):
                    existing = match.group(1)
                    new_props = []
                    for p in mods['add_props']:
                        if not re.search(r'\b' + re.escape(p) + r'\b', existing):
                            new_props.append(p)
                    if new_props:
                        lines = existing.split('\n')
                        cleaned = [l.strip().rstrip(',') for l in lines if l.strip()]
                        cleaned.extend(new_props)
                        return "({\n  " + ",\n  ".join(cleaned) + "\n})"
                    return match.group(0)
                    
                content = re.sub(r'\(\{((?:\s*[a-zA-Z0-9_,\n\s?:]+)*)\}\)', repl_props_destructure, content, count=1)
                
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
if __name__ == '__main__':
    fix_errors()
