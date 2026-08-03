const fs = require('fs');
let c = fs.readFileSync('src/app/onboarding/page.js', 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/app/onboarding/page.js', c);
