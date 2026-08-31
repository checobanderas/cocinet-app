import sys, codecs, re, os
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

# Read all state variables and handlers from App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Gather all valid vars: useState pairs, consts, handlers
app_vars = set()
for m in re.finditer(r'const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=', app_content):
    app_vars.add(m.group(1))
    app_vars.add(m.group(2))
for m in re.finditer(r'const\s+([a-zA-Z0-9_]+)\s*=', app_content):
    app_vars.add(m.group(1))
for m in re.finditer(r'function\s+([a-zA-Z0-9_]+)\s*\(', app_content):
    app_vars.add(m.group(1))
for m in re.finditer(r'useRef\s*<[^>]*>\s*\(', app_content):
    pass

# For each component file, check what vars it uses that aren't in props/locals
component_dirs = ['src/components/modals', 'src/components/views']

print("=== SCANNING ALL COMPONENT FILES ===\n")

for comp_dir in component_dirs:
    if not os.path.exists(comp_dir):
        continue
    for fname in sorted(os.listdir(comp_dir)):
        if not fname.endswith('.tsx'):
            continue
        fpath = os.path.join(comp_dir, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            comp_content = f.read()

        # Extract current props from interface
        props_in_interface = set()
        iface_match = re.search(r'interface \w+Props \{(.*?)\}', comp_content, re.DOTALL)
        if iface_match:
            for prop_m in re.finditer(r'^\s+([a-zA-Z0-9_]+)\s*[?:]', iface_match.group(1), re.MULTILINE):
                props_in_interface.add(prop_m.group(1))

        # Extract props destructured in function signature
        sig_match = re.search(r'React\.FC<[^>]+>\s*=\s*\(\{(.*?)\}\)', comp_content, re.DOTALL)
        props_destructured = set()
        if sig_match:
            for p in re.findall(r'([a-zA-Z0-9_]+)(?:\s*,|\s*\n)', sig_match.group(1)):
                props_destructured.add(p)

        # Get body (after component opening brace)
        body_match = re.search(r'React\.FC<[^>]+>\s*=\s*\([^)]*\)\s*=>\s*\{(.+)', comp_content, re.DOTALL)
        if not body_match:
            continue
        body = body_match.group(1)

        # Find local definitions inside body
        locals_defined = set()
        for m in re.finditer(r'(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=', body):
            locals_defined.add(m.group(1))
        for m in re.finditer(r'(?:const|let|var)\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]', body):
            locals_defined.add(m.group(1))
            locals_defined.add(m.group(2))

        # Find all identifiers used in body
        used_in_body = set(re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', body))

        # React/JS globals to ignore
        ignore = {
            'React','useState','useEffect','useRef','useCallback','useMemo','const','let','var',
            'function','return','if','else','for','while','true','false','null','undefined',
            'console','Math','JSON','Object','Array','String','Number','Boolean','Date','Promise',
            'window','document','navigator','localStorage','sessionStorage','setTimeout','clearTimeout',
            'setInterval','clearInterval','e','event','type','className','style','onClick',
            'onChange','onKeyDown','onDidDismiss','isOpen','children','key','ref','disabled',
            'placeholder','value','maxLength','autoFocus','any','FC','void','boolean','string',
            'number','props','export','import','from','interface','extends','typeof','instanceof',
            'new','delete','in','of','as','async','await','try','catch','finally','throw',
            'IonModal','IonContent','IonHeader','IonToolbar','IonTitle','IonButtons','IonButton',
            'IonInput','IonItem','IonLabel','IonIcon','IonList','IonGrid','IonRow','IonCol',
            'IonPage','IonSpinner','IonChip','IonSearchbar','IonSelect','IonSelectOption',
            'IonToggle','IonRadio','IonRadioGroup','IonCheckbox','IonTextarea','IonBadge',
            'IonNote','IonAvatar','IonSlides','IonSlide','IonCard','IonCardContent',
            'IonCardHeader','IonCardTitle','IonFab','IonFabButton','IonFabList','IonAlert',
            'IonToast','IonPopover','IonActionSheet','IonLoading','IonSkeletonText',
            'IonProgressBar','IonMenuButton','IonBackButton','IonTabBar','IonTabButton',
            'IonTab','IonRouterOutlet','IonSplitPane','IonMenu','IonMenuToggle',
            'IonReorderGroup','IonReorder','IonItemSliding','IonItemOptions','IonItemOption',
            'IonAccordion','IonAccordionGroup','IonPickerColumn','IonPicker',
            'motion','AnimatePresence','div','span','p','h1','h2','h3','h4','button','input',
            'label','form','select','option','img','table','tr','td','th','thead','tbody',
            'ul','li','a','strong','em','br','hr',
            'closeOutline','saveOutline','logoWhatsapp','addOutline','removeOutline',
            'checkmarkOutline','alertCircleOutline','trashOutline','pencilOutline',
            'arrowBackOutline','arrowForwardOutline','searchOutline','filterOutline',
            'chevronDownOutline','chevronUpOutline','chevronForwardOutline','chevronBackOutline',
            'Person','Email','Phone','Location','Business','Settings','Close','Add','Remove',
            'Check','Edit','Delete','Search','Filter','Menu','Home','Dashboard',
            'parseInt','parseFloat','isNaN','Number','encodeURIComponent','decodeURIComponent',
            'prev','item','index','zone','table','order','cat','sub','g','f','t','c','m','o',
            'x','y','i','j','k','v','n','s','p','r','d','l','entry','key','val','arr','obj',
            'e','err','error','msg','res','req','data','result','value','values',
            'total','sum','count','max','min','avg','len','size','pos','end','start',
            'true','false','null','undefined','NaN','Infinity',
        }

        # Missing: used in body but NOT in props, locals, or global ignore list - but IS in app_vars
        missing = (used_in_body & app_vars) - props_in_interface - locals_defined - ignore

        if missing:
            print(f"📁 {fname}:")
            for v in sorted(missing):
                print(f"   ⚠️  MISSING PROP: {v}")
            print()
