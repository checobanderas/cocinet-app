
const fs = require('fs');
const content = fs.readFileSync('src/utils/firestore.ts', 'utf8');

const softDeleteFunc = 'export async function softDeleteAllProductsFromFirebase(tenantId: string, sucursal: string, products: any[]) {\n' +
'  try {\n' +
'    await createMenuBackup(\n' +
'      tenantId,\n' +
'      sucursal || \'Sucursal\',\n' +
'      \'Respaldo antes de ocultar - \' + new Date().toLocaleString(),\n' +
'      products\n' +
'    );\n' +
'  } catch (error) {\n' +
'    console.error(\'Error creating backup before deletion:\', error);\n' +
'  }\n' +
'  try {\n' +
'    const q = query(collection(db, \'products\'));\n' +
'    const snapshot = await getDocs(q);\n' +
'    const batch = writeBatch(db);\n' +
'    let deletedCount = 0;\n' +
'    snapshot.docs.forEach((d) => {\n' +
'      const data = d.data();\n' +
'      const itemTenantId = data.tenantId || \'tenant-1\';\n' +
'      if (itemTenantId === tenantId && data.isDeleted !== true) {\n' +
'        batch.update(d.ref, { isDeleted: true });\n' +
'        deletedCount++;\n' +
'      }\n' +
'    });\n' +
'    if (deletedCount > 0) {\n' +
'      await runWrite(batch.commit());\n' +
'    }\n' +
'  } catch (error) {\n' +
'    console.error(\'Error soft deleting products: \', error);\n' +
'    throw error;\n' +
'  }\n' +
'}\n\n';

const newContent = content.replace(
  'export async function deleteAllProductsFromFirebase(tenantId: string, sucursal: string, products: any[]) {',
  softDeleteFunc + 'export async function deleteAllProductsFromFirebase(tenantId: string, sucursal: string, products: any[]) {'
);

fs.writeFileSync('src/utils/firestore.ts', newContent);
console.log('patched firestore.ts');

