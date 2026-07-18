const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the key in the mapping for recipe ingredients
code = code.replace(
  '                                  <tr\n                                    key={index}',
  '                                  <tr\n                                    key={selectedRecipeProduct.id + "-" + rIng.inventoryItemId}'
);

// Fix mutation in onBlur the table
code = code.replace(
  '                                                currentRecipe[index].quantity =\n                                                  val;',
  '                                                currentRecipe[index] = { ...currentRecipe[index], quantity: val };'
);
// In case the formatter put it on one line:
code = code.replace(
  'currentRecipe[index].quantity = val;',
  'currentRecipe[index] = { ...currentRecipe[index], quantity: val };'
);

// Fix mutation in "Agregar a ESTE producto"
code = code.replace(
  'currentRecipe[existingIndex].quantity = qty;',
  'currentRecipe[existingIndex] = { ...currentRecipe[existingIndex], quantity: qty };'
);

// Fix mutation in "Agregar a TODOS los filtrados"
// This matches the same pattern, so the global replace above might just do it if we use string iteration or regex.
// Let's just use regex for all occurrences:

let newCode = fs.readFileSync('src/App.tsx', 'utf8');

newCode = newCode.replace(
  /key={index}/g,
  `key={selectedRecipeProduct.id + "-" + rIng.inventoryItemId}`
);

newCode = newCode.replace(
  /currentRecipe\[existingIndex\]\.quantity = qty;/g,
  'currentRecipe[existingIndex] = { ...currentRecipe[existingIndex], quantity: qty };'
);

newCode = newCode.replace(
  /currentRecipe\[index\]\.quantity =\s*val;/g,
  'currentRecipe[index] = { ...currentRecipe[index], quantity: val };'
);

newCode = newCode.replace(
  /currentRecipe\[index\]\.quantity = val;/g,
  'currentRecipe[index] = { ...currentRecipe[index], quantity: val };'
);

fs.writeFileSync('src/App.tsx', newCode);
console.log("Replaced instances.");
