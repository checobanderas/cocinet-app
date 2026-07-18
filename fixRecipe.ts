import * as fs from 'fs';

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
