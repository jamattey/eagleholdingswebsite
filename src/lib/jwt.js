// src/lib/jwt.js
// Edge & Node-compatible, OWASP-compliant cryptographic JWT engine using Web Standard Crypto API.

const Encoder = typeof TextEncoder !== 'undefined' ? TextEncoder : require('util').TextEncoder;
const Decoder = typeof TextDecoder !== 'undefined' ? TextDecoder : require('util').TextDecoder;
const webCrypto = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto : require('crypto').webcrypto;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-zero-trust-secret-key-change-in-production';

function base64UrlEncode(str) {
  const buf = typeof str === 'string' ? new Encoder().encode(str) : new Uint8Array(str);
  let binary = '';
  for (let i = 0; i < buf.byteLength; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  const base64 = typeof btoa !== 'undefined' 
    ? btoa(binary) 
    : Buffer.from(buf).toString('base64');

  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Decoder().decode(bytes);
  }

  return Buffer.from(base64, 'base64').toString('utf8');
}

// ─── Sign JWT Token (HMAC-SHA256 using Web Crypto) ───────────────────────────
export async function signJwt(payload, expiresInSeconds = 28800) {
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

  const enc = new Encoder();
  const key = await webCrypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuf = await webCrypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const signature = base64UrlEncode(signatureBuf);

  return `${dataToSign}.${signature}`;
}

// ─── Verify JWT Token (HMAC-SHA256 using Web Crypto) ────────────────────────
export async function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const enc = new Encoder();
    const key = await webCrypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    let base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    let sigBytes;
    if (typeof atob !== 'undefined') {
      const binarySig = atob(base64);
      sigBytes = new Uint8Array(binarySig.length);
      for (let i = 0; i < binarySig.length; i++) {
        sigBytes[i] = binarySig.charCodeAt(i);
      }
    } else {
      sigBytes = Buffer.from(base64, 'base64');
    }

    const isValid = await webCrypto.subtle.verify('HMAC', key, sigBytes, enc.encode(dataToSign));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

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
