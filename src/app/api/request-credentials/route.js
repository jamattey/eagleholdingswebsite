// src/app/api/request-credentials/route.js
// OWASP Hardened Credential Request API with rate limiting, sanitization, timing-safe checks, and security logging.

import { createHmac, createHash } from 'crypto';
import { sanitizeInput, rateLimiter, safeTimingCompare, securityLog } from '@/lib/security';

const HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET || 'dev-secret-change-in-production';

function verifyAltcha(payload) {
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    const { algorithm, challenge, number, salt, signature } = decoded;

    if (algorithm !== 'SHA-256') return false;

    const expectedChallenge = createHash('sha256')
      .update(`${salt}${number}`)
      .digest('hex');

    const expectedSignature = createHmac('sha256', HMAC_SECRET)
      .update(expectedChallenge)
      .digest('hex');

    return safeTimingCompare(challenge, expectedChallenge) && safeTimingCompare(signature, expectedSignature);
  } catch {
    return false;
  }
}

async function dispatchCredentialRequest({ referenceId, firstName, lastName, email, organization, purpose }) {
  console.log('🔑 New Partner Credential Request:', {
    referenceId,
    fullName: `${firstName} ${lastName}`,
    email,
    organization: organization || 'N/A',
    purpose: purpose.substring(0, 100) + '...',
  });

  return { ok: true };
}

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // OWASP A04/A07: Rate Limiting (5 requests per minute per IP)
  const rateLimit = rateLimiter(`req_cred_${clientIp}`, 5, 60000);
  if (!rateLimit.success) {
    securityLog('RATE_LIMIT_EXCEEDED', { endpoint: '/api/request-credentials', ip: clientIp });
    return Response.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { firstName, lastName, email, organization, purpose, altcha } = body;

    // 1. Basic validation
    if (!firstName || !lastName || !email || !purpose) {
      return Response.json(
        { error: 'Please fill in all required fields (First Name, Last Name, Corporate Email, and Purpose).' },
        { status: 400 }
      );
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Please enter a valid corporate email address.' },
        { status: 400 }
      );
    }

    // 3. Verify CAPTCHA if provided
    if (altcha && !verifyAltcha(altcha)) {
      securityLog('CAPTCHA_VERIFICATION_FAILED', { endpoint: '/api/request-credentials', ip: clientIp });
      return Response.json(
        { error: 'Security check failed. Please try submitting again.' },
        { status: 400 }
      );
    }

    // 4. Generate reference ID
    const referenceId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Dispatch request
    const result = await dispatchCredentialRequest({
      referenceId,
      firstName,
      lastName,
      email,
      organization,
      purpose,
    });

    if (!result.ok) {
      return Response.json(
        { error: 'Failed to process credential request. Please try again later.' },
        { status: 500 }
      );
    }

    securityLog('CREDENTIAL_REQUEST_SUCCESS', { referenceId, email, ip: clientIp });
    return Response.json({ success: true, referenceId });

  } catch (err) {
    console.error('Credential Request API error:', err);
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
