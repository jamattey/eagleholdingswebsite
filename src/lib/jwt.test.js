import { signJwt, verifyJwt, createAuthCookie, createClearAuthCookie } from './jwt';

describe('Cryptographic JWT & Zero Trust Cookie Engine', () => {
  it('signs and verifies valid JWT tokens correctly', () => {
    const payload = { sub: 'USER-123', role: 'ADMIN', clearance: 'Level 4' };
    const token = signJwt(payload, 3600);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const verified = verifyJwt(token);
    expect(verified).not.toBeNull();
    expect(verified.sub).toBe('USER-123');
    expect(verified.role).toBe('ADMIN');
    expect(verified.clearance).toBe('Level 4');
  });

  it('rejects tampered JWT tokens', () => {
    const token = signJwt({ sub: 'USER-123', role: 'PRINCIPAL' });
    const parts = token.split('.');
    
    // Tamper with payload
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: 'USER-123', role: 'ADMIN' })).toString('base64');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    expect(verifyJwt(tamperedToken)).toBeNull();
  });

  it('rejects expired JWT tokens', () => {
    // Expired -10 seconds ago
    const token = signJwt({ sub: 'USER-123' }, -10);
    expect(verifyJwt(token)).toBeNull();
  });

  it('creates OWASP-compliant HttpOnly SameSite=Strict Set-Cookie headers', () => {
    const token = signJwt({ sub: 'USER-123' });
    const cookie = createAuthCookie(token, 28800);

    expect(cookie).toContain('eagle_session=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Max-Age=28800');

    const clearCookie = createClearAuthCookie();
    expect(clearCookie).toContain('Max-Age=0');
  });
});
