import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
imports = """import { SuppliersView } from './features/admin/SuppliersView';
import { CustomersView } from './features/admin/CustomersView';
import { ExpensesView } from './features/admin/ExpensesView';
import { ManageMenuView } from './features/admin/ManageMenuView';
"""
content = re.sub(
    r"import \{ CancellationPinPad \} from '\./components/common/CancellationPinPad';",
    "import { CancellationPinPad } from './components/common/CancellationPinPad';\n" + imports,
    content
)

# 2. Delete methods
content = re.sub(r"  const renderSuppliers = \(\) => \{.*?\n  };\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const renderCustomers = \(\) => \{.*?\n  };\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const renderExpenses = \(\) => \{.*?\n  };\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const renderManageMenu = \(\) => \{.*?\n  };\n\n", "", content, flags=re.DOTALL)

# 3. Replace usage in JSX
content = re.sub(r"\{appMode === \"suppliers\" && renderSuppliers\(\)\}", "{appMode === \"suppliers\" && <SuppliersView suppliers={suppliers} />}", content)
content = re.sub(r"\{appMode === \"customers\" && renderCustomers\(\)\}", "{appMode === \"customers\" && <CustomersView customers={customers} />}", content)
content = re.sub(r"\{appMode === \"expenses\" && renderExpenses\(\)\}", "{appMode === \"expenses\" && <ExpensesView expenses={expenses} />}", content)
content = re.sub(r"\{appMode === \"manage-menu\" && renderManageMenu\(\)\}", "{appMode === \"manage-menu\" && <ManageMenuView products={products} categories={productCategories} onAddProduct={() => {}} />}", content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Catalogs replaced successfully.")
