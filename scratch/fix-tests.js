const fs = require('fs');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace single unauthenticated session mock with double
  content = content.replace(/global\.fetch\s*\.mockResolvedValueOnce\(\{\s*ok: true,\s*json: async \(\) => \(\{ authenticated: false, session: null \}\),\s*\}\)/g,
    'global.fetch.mockResolvedValueOnce({ok:true, json: async() => ({authenticated:false, session:null})}).mockResolvedValueOnce({ok:true, json: async() => ({authenticated:false, session:null})})');

  // Replace single authenticated session mock with double (Partner)
  content = content.replace(/global\.fetch\.mockResolvedValueOnce\(\{\s*ok: true,\s*json: async \(\) => \(\{\s*authenticated: true,\s*session: \{\s*sub: 'EAGLE-8821',\s*name: 'Strategic Global Capital Group',\s*clearance: 'Level 4 — Tier 1 Investor',\s*\},\s*\}\),\s*\}\)/g,
    "global.fetch.mockResolvedValueOnce({ok:true, json: async() => ({authenticated:true, session:{sub: 'EAGLE-8821', name: 'Strategic Global Capital Group', clearance: 'Level 4 — Tier 1 Investor'}})}).mockResolvedValueOnce({ok:true, json: async() => ({authenticated:true, session:{sub: 'EAGLE-8821', name: 'Strategic Global Capital Group', clearance: 'Level 4 — Tier 1 Investor'}})})");

  // Replace single authenticated session mock with double (Partner generic)
  content = content.replace(/global\.fetch\s*\.mockResolvedValueOnce\(\{\s*ok: true,\s*json: async \(\) => \(\{\s*authenticated: true,\s*session: \{ name: 'Verified Partner', clearance: 'Level 4' \},\s*\}\),\s*\}\)/g,
    "global.fetch.mockResolvedValueOnce({ok:true, json: async() => ({authenticated:true, session:{name: 'Verified Partner', clearance: 'Level 4'}})}).mockResolvedValueOnce({ok:true, json: async() => ({authenticated:true, session:{name: 'Verified Partner', clearance: 'Level 4'}})})");

  // Replace single authenticated session mock with double (Principal)
  content = content.replace(/global\.fetch\.mockResolvedValueOnce\(\{\s*ok: true,\s*json: async \(\) => \(\{\s*authenticated: true,\s*session: \{ sub: 'SPON-123', name: 'Metro Infra', role: 'PRINCIPAL' \},\s*\}\),\s*\}\)/g,
    "global.fetch.mockResolvedValueOnce({ok:true, json: async() => ({authenticated:true, session:{sub: 'SPON-123', name: 'Metro Infra', role: 'PRINCIPAL'}})}).mockResolvedValueOnce({ok:true, json: async() => ({authenticated:true, session:{sub: 'SPON-123', name: 'Metro Infra', role: 'PRINCIPAL'}})})");

  // Fix routes for Partner
  content = content.replace(/'\/partner-login'/g, "'/login?type=partner'");

  // Fix routes for Principal
  content = content.replace(/'\/principal-login'/g, "'/login?type=principal'");
  content = content.replace(/\/principal-login\?invite=/g, '/login?invite=');

  fs.writeFileSync(filePath, content);
}

fixFile('src/app/onboarding/page.test.js');
fixFile('src/app/partner-portal/page.test.js');
fixFile('src/components/Header/Header.test.js');
