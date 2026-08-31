import sys, codecs, re, os
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

# Read App.tsx to find ALL valid state vars, handlers, refs, computed vars
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

app_vars = set()
for m in re.finditer(r'const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=', app_content):
    app_vars.add(m.group(1)); app_vars.add(m.group(2))
for m in re.finditer(r'const\s+([a-zA-Z0-9_]+)\s*=', app_content):
    app_vars.add(m.group(1))
for m in re.finditer(r'function\s+([a-zA-Z0-9_]+)\s*\(', app_content):
    app_vars.add(m.group(1))

# These are things the scanner reports but are actually loop vars / JSX built-ins / short locals
# We use a stricter filter: only report vars that are >= 5 chars (skip i,j,k,b,w,v,etc)
# AND that appear in App.tsx state context

# Known false positives (lambda params, JSX attrs, short vars) to skip
always_ignore = {
    'map','filter','find','reduce','forEach','some','every','includes','push','pop','slice','splice',
    'split','join','trim','replace','match','exec','test',
    'b','w','v','n','s','p','r','d','l','q','z','x','y','a','c','f','g','h','m','t','u',
    'el','ws','idx','num','qty','tel','url','img','key',
    'name','title','text','padding','body','status','target','token','file','files','admin',
    'user','tenant','tenant','admin','comanda','folio','reason','notes','price','subcategory',
    'subgroup','occupied','confirmed','selected','total','sum','count','val','arr','obj',
    'amount','message','prompt','match','confirm','now','today','map','subtotal','tableLabel',
    'tenantId','targetId','targetName','line','ownerKey',
    'App','React','useState','useEffect','useRef','useCallback','useMemo',
    'IonModal','IonContent','IonHeader','IonToolbar','IonTitle','IonButtons','IonButton',
    'IonInput','IonItem','IonLabel','IonIcon','IonList','IonPage','IonSpinner','IonChip',
    'IonSearchbar','IonSelect','IonSelectOption','IonToggle','IonRadio','IonRadioGroup',
    'IonCheckbox','IonTextarea','IonBadge','IonNote','IonGrid','IonRow','IonCol',
    'motion','AnimatePresence',
    'div','span','p','h1','h2','h3','h4','button','input','label','form','select',
    'option','img','table','tr','td','th','thead','tbody','ul','li','a','strong','em',
    'console','Math','JSON','Object','Array','String','Number','Boolean','Date','Promise',
    'window','document','navigator','localStorage','sessionStorage',
    'parseInt','parseFloat','isNaN','encodeURIComponent','decodeURIComponent',
    'const','let','var','function','return','if','else','for','while',
    'true','false','null','undefined','NaN','Infinity',
    'type','className','style','onClick','onChange','onKeyDown','onDidDismiss','isOpen',
    'children','ref','disabled','placeholder','value','maxLength','autoFocus',
    'any','FC','void','boolean','string','number','export','import','from',
    'interface','extends','typeof','instanceof','new','delete','in','of','as',
    'async','await','try','catch','finally','throw','prev','e','err','error',
    'res','req','data','result','values','entry','pos','end','start','len','size',
}

component_dirs = ['src/components/modals', 'src/components/views']

# For each component, collect the missing props and then fix them
for comp_dir in component_dirs:
    if not os.path.exists(comp_dir):
        continue
    for fname in sorted(os.listdir(comp_dir)):
        if not fname.endswith('.tsx'):
            continue
        fpath = os.path.join(comp_dir, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            comp_content = f.read()

        # Extract current interface props
        props_in_interface = set()
        iface_match = re.search(r'interface \w+Props \{(.*?)\}', comp_content, re.DOTALL)
        if iface_match:
            for prop_m in re.finditer(r'^\s+([a-zA-Z0-9_]+)\s*[?:]', iface_match.group(1), re.MULTILINE):
                props_in_interface.add(prop_m.group(1))

        # Extract props destructured
        sig_match = re.search(r'React\.FC<[^>]+>\s*=\s*\(\{(.*?)\}\)', comp_content, re.DOTALL)
        props_destructured = set()
        if sig_match:
            for p in re.findall(r'\b([a-zA-Z0-9_]+)\b', sig_match.group(1)):
                props_destructured.add(p)

        # Get component body
        body_match = re.search(r'React\.FC<[^>]+>\s*=\s*\([^)]*\)\s*=>\s*\{(.+)', comp_content, re.DOTALL)
        if not body_match:
            continue
        body = body_match.group(1)

        # Find local defs in body
        locals_defined = set()
        for m in re.finditer(r'(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*[=:]', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'(?:const|let|var)\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]', body):
            locals_defined.add(m.group(1)); locals_defined.add(m.group(2))
        # params in arrow functions / map callbacks
        for m in re.finditer(r'\(([a-zA-Z0-9_]+)\)\s*=>', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'\(([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\)\s*=>', body):
            locals_defined.add(m.group(1)); locals_defined.add(m.group(2))
        for m in re.finditer(r'\.map\(\(([a-zA-Z0-9_]+)', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'\.forEach\(\(([a-zA-Z0-9_]+)', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'\.filter\(\(([a-zA-Z0-9_]+)', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'\.reduce\(\([^)]*\)', body):
            pass
        for m in re.finditer(r'for\s*\(.*?([a-zA-Z0-9_]+)\s+of\b', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'for\s*\(.*?([a-zA-Z0-9_]+)\s+in\b', body):
            locals_defined.add(m.group(1))
        # function params
        for m in re.finditer(r'function\s+\w+\s*\(([^)]*)\)', body):
            for p in m.group(1).split(','):
                p = p.strip().split(':')[0].strip()
                if p:
                    locals_defined.add(p)

        used_in_body = set(re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', body))

        # Missing = used in body AND is a real app var, NOT already in props/locals/ignore
        missing = (used_in_body & app_vars) - props_in_interface - locals_defined - always_ignore
        
        if not missing:
            continue

        print(f"\n📁 {fname}: Adding {len(missing)} missing props: {sorted(missing)}")

        # Fix: add missing to interface AND to destructuring AND to App.tsx call
        component_name = fname.replace('.tsx', '')
        
        # 1. Add to interface
        new_props_block = ''
        for prop in sorted(missing):
            new_props_block += f'  {prop}: any;\n'
        
        new_comp = re.sub(
            r'(interface \w+Props \{)(.*?)(\})',
            lambda m: m.group(1) + m.group(2) + new_props_block + m.group(3),
            comp_content,
            flags=re.DOTALL,
            count=1
        )
        
        # 2. Add to destructuring (before the closing })
        new_dest = ', '.join(sorted(missing))
        new_comp = re.sub(
            r'(React\.FC<[^>]+>\s*=\s*\(\{)(.*?)(\}\))',
            lambda m: m.group(1) + m.group(2) + f'  {new_dest}\n' + m.group(3),
            new_comp,
            flags=re.DOTALL,
            count=1
        )
        
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_comp)
        
        # 3. Fix App.tsx call to pass these props
        with open('src/App.tsx', 'r', encoding='utf-8') as f:
            app_code = f.read()
        
        # Find the JSX tag for this component in App.tsx and add props
        # The tag looks like: <ComponentName\n  ... />
        tag_pattern = rf'(<{component_name}\b)(.*?)(\s*/\s*>)'
        def add_props_to_tag(m):
            existing = m.group(2)
            new_attrs = '\n'.join([f'          {prop}={{{prop}}}' for prop in sorted(missing)])
            return m.group(1) + existing + '\n' + new_attrs + m.group(3)
        
        new_app = re.sub(tag_pattern, add_props_to_tag, app_code, flags=re.DOTALL)
        if new_app != app_code:
            with open('src/App.tsx', 'w', encoding='utf-8') as f:
                f.write(new_app)
            print(f"   ✅ Fixed App.tsx call to {component_name}")
        else:
            print(f"   ⚠️  Could not find tag <{component_name}> in App.tsx to add props")

print("\n✅ Done fixing all missing props!")
