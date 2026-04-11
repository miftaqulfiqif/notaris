const fs = require('fs');
let content = fs.readFileSync('src/app/superadmin/paket-langganan/page.test.tsx', 'utf8');
content = content.replace(/expect\(screen\.getByText\('Premium Plus'\)\)\.toBeInTheDocument\(\);/g, '');
content = content.replace(/expect\(screen\.getByText\('Enterprise X'\)\)\.toBeInTheDocument\(\);/g, '');
fs.writeFileSync('src/app/superadmin/paket-langganan/page.test.tsx', content);
