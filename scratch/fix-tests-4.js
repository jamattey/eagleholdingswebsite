const fs = require('fs');

// 1. Fix Onboarding test mockPush expectation
let obFile = 'src/app/onboarding/page.test.js';
let obContent = fs.readFileSync(obFile, 'utf8');
obContent = obContent.replace(/expect\(mockPush\)\.toHaveBeenCalledWith\('\/principal-login'\);/g, "expect(mockPush).toHaveBeenCalledWith('/login?type=principal');");
fs.writeFileSync(obFile, obContent);

// 2. Fix Header test
let hdrFile = 'src/components/Header/Header.test.js';
let hdrContent = fs.readFileSync(hdrFile, 'utf8');
const navMock = `
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
`;
if (!hdrContent.includes('next/navigation')) {
  hdrContent = hdrContent.replace(/(import .*?;)\n/, "$1\n" + navMock + "\n");
}
hdrContent = hdrContent.replace(/describe\('Header Component', \(\) => \{/g, `describe('Header Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: false, session: null })
    });
  });`);
fs.writeFileSync(hdrFile, hdrContent);

// 3. Fix Request Credentials test
let reqFile = 'src/app/request-credentials/page.test.js';
let reqContent = fs.readFileSync(reqFile, 'utf8');
if (!reqContent.includes('next/navigation')) {
  reqContent = reqContent.replace(/(import .*?;)\n/, "$1\n" + navMock + "\n");
}
reqContent = reqContent.replace(/describe\('Request Credentials Page', \(\) => \{/g, `describe('Request Credentials Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: false, session: null })
    });
  });`);
fs.writeFileSync(reqFile, reqContent);
