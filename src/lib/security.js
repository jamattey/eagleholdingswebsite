// src/lib/security.js
// OWASP Security hardening utilities: Sanitization, Rate Limiting, Timing-Attack Protection, Security Logging.

import { createHmac, timingSafeEqual } from 'crypto';

// ─── OWASP A03: Input Sanitization & XSS Mitigation ─────────────────────────
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .trim()
      // Remove null bytes and control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Strip script tags and inline event attributes
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      // Escape HTML special characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input !== null && typeof input === 'object') {
    const sanitized = {};
    for (const key of Object.keys(input)) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
}

// ─── OWASP A04/A07: In-Memory Sliding Window Rate Limiter ────────────────────
const rateLimitStore = new Map();

export function rateLimiter(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const clientKey = ip || 'anonymous';
  const record = rateLimitStore.get(clientKey) || { count: 0, resetTime: now + windowMs };

  // Reset window if expired
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitStore.set(clientKey, record);

  const remaining = Math.max(0, limit - record.count);
  const success = record.count <= limit;

  return {
    success,
    remaining,
    resetMs: Math.max(0, record.resetTime - now),
  };
}

// Helper to reset rate limits in testing
export function clearRateLimitStore() {
  rateLimitStore.clear();
}

// ─── OWASP A02: Timing-Attack Resistant Comparison ─────────────────────────
export function safeTimingCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant execution time
    timingSafeEqual(bufA, bufA);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

// ─── OWASP A09: Security Audit Logging ──────────────────────────────────────
export function securityLog(eventType, details = {}) {
  const timestamp = new Date().toISOString();
  
  // Mask sensitive values (passwords, keys, tokens)
  const safeDetails = { ...details };
  for (const key of Object.keys(safeDetails)) {
    if (/password|key|token|secret|creditcard/i.test(key)) {
      safeDetails[key] = '[REDACTED_SECURITY_DATA]';
    }
  }

  console.log(`🛡️ [SECURITY_AUDIT] [${timestamp}] [${eventType}]`, safeDetails);
}
