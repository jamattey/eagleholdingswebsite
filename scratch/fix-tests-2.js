const fs = require('fs');
const file = 'src/app/onboarding/page.test.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the beforeEach
content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/m, `beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
  });`);

// Fix "switches between Principal View and Admin View"
content = content.replace(/it\('switches between Principal View and Admin View', \(\) => \{[\s\S]*?render\(<OnboardingPage \/>\);/m, `it('switches between Principal View and Admin View', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN' } }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for session to load
    await screen.findByRole('button', { name: /Admin View \\(Backend\\)/i });`);

// Fix "allows Admin to invite a new Project Principal..."
content = content.replace(/it\('allows Admin to invite a new Project Principal and generate an invitation link', async \(\) => \{[\s\S]*?render\(<OnboardingPage \/>\);/m, `it('allows Admin to invite a new Project Principal and generate an invitation link', async () => {
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN' } }) };
      if (url === '/api/onboarding') return { ok: true, json: async () => ({
        success: true,
        action: 'invite_principal',
        invitation: { inviteCode: 'INV-998877', inviteUrl: '/login?invite=INV-998877', sponsorName: 'Atlantic Port Systems', email: 'sponsor@atlantic.com', projectName: 'Port Expansion Facility', facilityAmount: '$60,000,000 USD', status: 'Pending Registration' }
      }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for session to load
    await screen.findByRole('button', { name: /Admin View \\(Backend\\)/i });`);

// Fix "allows Admin to approve checklist items and update status"
content = content.replace(/it\('allows Admin to approve checklist items and update status', async \(\) => \{[\s\S]*?render\(<OnboardingPage \/>\);/m, `it('allows Admin to approve checklist items and update status', async () => {
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN' } }) };
      if (url === '/api/onboarding') return { ok: true, json: async () => ({ success: true, action: 'admin_update_status', itemId: 'item-03', status: 'Verified' }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for session to load
    await screen.findByRole('button', { name: /Admin View \\(Backend\\)/i });`);

// Fix "submits capital raise feedback in Principal view"
content = content.replace(/it\('submits capital raise feedback in Principal view', async \(\) => \{[\s\S]*?render\(<OnboardingPage \/>\);/m, `it('submits capital raise feedback in Principal view', async () => {
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'PRINCIPAL' } }) };
      if (url === '/api/onboarding') return { ok: true, json: async () => ({ success: true, action: 'submit_feedback', receiptId: 'FBK-ONBOARDING-1' }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for component load
    await screen.findByLabelText(/Sponsor Feedback & Term Sheet Queries/i);`);

// Fix the simple tests that had double mock hack
content = content.replace(/global\.fetch\.mockResolvedValueOnce.*?mockResolvedValueOnce.*?;\s*/g, '');

content = content.replace(/it\('renders page header and compliance progress meter', async \(\) => \{/m, `it('renders page header and compliance progress meter', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });`);

content = content.replace(/it\('displays lock overlay and blur prompt when unauthenticated in Principal view', async \(\) => \{/m, `it('displays lock overlay and blur prompt when unauthenticated in Principal view', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });`);

content = content.replace(/it\('removes blur overlay when authenticated session is present', async \(\) => \{/m, `it('removes blur overlay when authenticated session is present', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: true, session: { sub: 'SPON-123', name: 'Metro Infra', role: 'PRINCIPAL' } }) });`);

content = content.replace(/it\('renders compliance items for KYC, UBO, CIS, Architectural, MEP, Soil, and Permits', \(\) => \{/m, `it('renders compliance items for KYC, UBO, CIS, Architectural, MEP, Soil, and Permits', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });`);

// The last one has `render(<OnboardingPage />);` but no `await`, it's ok.
// Let's write the patched content.
fs.writeFileSync(file, content);
console.log('Fixed onboarding tests');
