import re

with open("src/utils/firestore.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the hanging getDoc in addComandaToFirebase with a Promise.race timeout
old_getdoc_block = """  try {
    const snapDoc = await getDoc(tableRef);
    if (snapDoc.exists()) {"""

new_getdoc_block = """  try {
    // Add a 2 second timeout so we don't hang if offline or poor network
    const getDocPromise = getDoc(tableRef);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
    const snapDoc: any = await Promise.race([getDocPromise, timeoutPromise]);
    if (snapDoc && snapDoc.exists && snapDoc.exists()) {"""

content = content.replace(old_getdoc_block, new_getdoc_block)

with open("src/utils/firestore.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("getDoc wrapped in timeout to prevent hanging.")
