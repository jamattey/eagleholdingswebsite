const fs = require('fs');
const file = 'src/app/partner-portal/page.test.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/m, `beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
  });`);

content = content.replace(/global\.fetch\.mockResolvedValueOnce.*?mockResolvedValueOnce.*?;\s*/g, '');

content = content.replace(/it\('renders restricted access notice when unauthenticated', async \(\) => \{/m, `it('renders restricted access notice when unauthenticated', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });`);

content = content.replace(/it\('renders executive portal metrics and partner profile when session exists', async \(\) => \{/m, `it('renders executive portal metrics and partner profile when session exists', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { sub: 'EAGLE-8821', name: 'Strategic Global Capital Group', clearance: 'Level 4 — Tier 1 Investor' }
    }) });`);

content = content.replace(/it\('renders strategic briefings and handles briefing download click', async \(\) => \{/m, `it('renders strategic briefings and handles briefing download click', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { name: 'Verified Partner', clearance: 'Level 4' }
    }) });`);

content = content.replace(/it\('calls logout API and redirects to login when Sign Out is clicked', async \(\) => \{[\s\S]*?render\(<PartnerPortalDashboard \/>\);/m, `it('calls logout API and redirects to login when Sign Out is clicked', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { name: 'Verified Partner', clearance: 'Level 4' } }) };
      if (url === '/api/auth/logout') return { ok: true, json: async () => ({ success: true }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<PartnerPortalDashboard />);
    await screen.findByText('Sign Out');`);

fs.writeFileSync(file, content);
console.log('Fixed partner portal tests');
