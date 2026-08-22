const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const search = 'filter((p) => !menuSearchQuery || p.name.toLowerCase().includes(menuSearchQuery.toLowerCase()))';
const replace = `filter((p) => {
                        if (!menuSearchQuery) return true;
                        const tokens = menuSearchQuery.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').split(/\\s+/).filter(Boolean);
                        const n = p.name.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
                        return tokens.every(t => n.includes(t));
                      })`;

let newContent = content.split(search).join(replace);

if (newContent !== content) {
    fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
    console.log('Replaced search logic successfully');
} else {
    console.log('Search logic not found');
}
