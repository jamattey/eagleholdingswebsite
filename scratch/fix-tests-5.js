const fs = require('fs');
const files = [
  'src/app/onboarding/page.test.js',
  'src/app/partner-portal/page.test.js',
  'src/app/request-credentials/page.test.js',
  'src/components/Header/Header.test.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace any beforeEach fetch mock setup
  content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/m, `beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: false, session: null }) };
      }
      return { ok: true, json: async () => ({}) };
    });
    if (typeof mockPush !== 'undefined') mockPush.mockReset();
  });`);

  // Remove any remaining mockResolvedValueOnce chaining
  content = content.replace(/global\.fetch\.mockResolvedValueOnce.*?mockResolvedValueOnce.*?;\s*/g, '');
  content = content.replace(/global\.fetch\.mockResolvedValue.*?;\s*/g, '');
  content = content.replace(/global\.fetch\.mockResolvedValueOnce.*?;\s*/g, '');

  fs.writeFileSync(file, content);
});
