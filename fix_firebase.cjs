const fs = require('fs');
let content = fs.readFileSync('src/utils/firebase.ts', 'utf-8');

content = content.replace(
  /localCache: persistentLocalCache\(\{[\s\S]*?\}\)/,
  'localCache: memoryLocalCache()'
);

content = content.replace(
  'persistentMultipleTabManager,',
  'persistentMultipleTabManager, memoryLocalCache,'
);

fs.writeFileSync('src/utils/firebase.ts', content, 'utf-8');
console.log('Updated firebase.ts to use memoryLocalCache()');
