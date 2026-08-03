// src/lib/jwt.js
// Lightweight, OWASP-compliant cryptographic JWT engine using Node.js built-in crypto.

import { createHmac, timingSafeEqual } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-zero-trust-secret-key-change-in-production';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

// ─── Sign JWT Token (HMAC-SHA256) ────────────────────────────────────────────
export function signJwt(payload, expiresInSeconds = 28800) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signature}`;
}

// ─── Verify JWT Token (HMAC-SHA256, Constant-Time Signature Check) ──────────
export function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  // Re-compute expected signature
  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const bufSig = Buffer.from(signature, 'utf8');
  const bufExp = Buffer.from(expectedSignature, 'utf8');

  // Constant-time signature comparison to prevent timing attacks
  if (bufSig.length !== bufExp.length || !timingSafeEqual(bufSig, bufExp)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Expiration check
    if (payload.exp && now > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ─── OWASP Set-Cookie Header Formatter ───────────────────────────────────────
export function createAuthCookie(token, maxAgeSeconds = 28800) {
  const isProd = process.env.NODE_ENV === 'production';
  // Note: Secure flag is enforced in production, SameSite=Strict, HttpOnly
  const flags = [
    `eagle_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isProd) {
    flags.push('Secure');
  }

  return flags.join('; ');
}

export function createClearAuthCookie() {
  return 'eagle_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
