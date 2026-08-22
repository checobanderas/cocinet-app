const fs = require('fs');
let content = fs.readFileSync('src/utils/firebase.ts', 'utf-8');

content = content.replace(
  'localCache: memoryLocalCache()',
  'localCache: persistentLocalCache({\n      tabManager: persistentMultipleTabManager(),\n      cacheSizeBytes: 41943040 // 40 MB default instead of UNLIMITED to avoid IndexedDB crashes\n    })'
);
content = content.replace(
  'persistentMultipleTabManager, memoryLocalCache,',
  'persistentMultipleTabManager, CACHE_SIZE_UNLIMITED,'
);

fs.writeFileSync('src/utils/firebase.ts', content, 'utf-8');
console.log('Restored IndexedDB persistence with 40MB limit');
