const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /(const \[menuSearchQuery, setMenuSearchQuery\] = useState\(""\);)/;
if (content.match(regex)) {
    content = content.replace(regex, `$1\n  const [showDeletedAdmin, setShowDeletedAdmin] = useState(false);`);
    fs.writeFileSync('src/App.tsx', content, 'utf-8');
    console.log('State injected.');
} else {
    console.log('Regex did not match.');
}
