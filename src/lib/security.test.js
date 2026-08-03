import { sanitizeInput, rateLimiter, clearRateLimitStore, safeTimingCompare, securityLog } from './security';

describe('OWASP Security Utility Library', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe('Input Sanitization (sanitizeInput)', () => {
    it('escapes HTML special characters and strips script tags', () => {
      const malicious = '<script>alert("XSS")</script><a href="javascript:void(0)">Link</a>';
      const clean = sanitizeInput(malicious);

      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;a href=');
      expect(clean).toContain('&quot;javascript:void(0)&quot;');
    });

    it('sanitizes strings within nested objects', () => {
      const inputObj = {
        name: '<b>John</b>',
        details: {
          bio: '<script>doSomething()</script>Hello',
        },
      };

      const cleanObj = sanitizeInput(inputObj);
      expect(cleanObj.name).toBe('&lt;b&gt;John&lt;&#x2F;b&gt;');
      expect(cleanObj.details.bio).toBe('Hello');
    });
  });

  describe('Sliding Window Rate Limiter (rateLimiter)', () => {
    it('allows requests within limit and blocks when limit is exceeded', () => {
      const ip = '192.168.1.50';
      const limit = 3;

      expect(rateLimiter(ip, limit, 60000).success).toBe(true);
      expect(rateLimiter(ip, limit, 60000).success).toBe(true);
      expect(rateLimiter(ip, limit, 60000).success).toBe(true);

      // 4th request exceeds limit
      const exceeded = rateLimiter(ip, limit, 60000);
      expect(exceeded.success).toBe(false);
      expect(exceeded.remaining).toBe(0);
    });
  });

  describe('Timing-Attack Safe Comparison (safeTimingCompare)', () => {
    it('returns true for matching strings and false for mismatched strings', () => {
      expect(safeTimingCompare('secretKey123', 'secretKey123')).toBe(true);
      expect(safeTimingCompare('secretKey123', 'secretKey124')).toBe(false);
      expect(safeTimingCompare('short', 'longerString')).toBe(false);
    });

    it('returns false when non-string values are provided', () => {
      expect(safeTimingCompare(null, 'test')).toBe(false);
      expect(safeTimingCompare('test', undefined)).toBe(false);
    });
  });

  describe('Security Logging (securityLog)', () => {
    it('redacts sensitive details from audit logs', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      securityLog('AUTH_LOGIN_ATTEMPT', {
        user: 'admin',
        password: 'SuperSecretPassword123',
        token: 'TK-SENSITIVE-99',
      });

      expect(consoleSpy).toHaveBeenCalled();
      const loggedCall = consoleSpy.mock.calls[0][1];
      expect(loggedCall.password).toBe('[REDACTED_SECURITY_DATA]');
      expect(loggedCall.token).toBe('[REDACTED_SECURITY_DATA]');
      expect(loggedCall.user).toBe('admin');

      consoleSpy.mockRestore();
    });
  });
});
