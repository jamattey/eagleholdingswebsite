// src/app/api/contact/route.js
// OWASP Hardened Contact API route with rate limiting, input sanitization, timing-safe checks, and security logging.

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

    // OWASP A02: Timing-attack resistant comparisons
    return safeTimingCompare(challenge, expectedChallenge) && safeTimingCompare(signature, expectedSignature);
  } catch {
    return false;
  }
}

async function sendEmail({ name, organization, email, phone, inquiryType, message }) {
  console.log('📧 New contact submission (email provider ready):', {
    name, organization, email, phone, inquiryType,
    message: message.substring(0, 80) + '...',
  });

  return { ok: true };
}

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // OWASP A04/A07: Rate Limiting (10 requests per minute per IP)
  const rateLimit = rateLimiter(`contact_${clientIp}`, 10, 60000);
  if (!rateLimit.success) {
    securityLog('RATE_LIMIT_EXCEEDED', { endpoint: '/api/contact', ip: clientIp });
    return Response.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json();
    
    // OWASP A03: Input Sanitization across all fields
    const body = sanitizeInput(rawBody);
    const { name, organization, email, phone, inquiryType, message, altcha } = body;

    // 1. Verify CAPTCHA
    if (!altcha || !verifyAltcha(altcha)) {
      securityLog('CAPTCHA_VERIFICATION_FAILED', { endpoint: '/api/contact', ip: clientIp });
      return Response.json(
        { error: 'Security check failed. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // 2. Basic validation
    if (!name || !email || !inquiryType || !message) {
      return Response.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // 3. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 4. Send email
    const result = await sendEmail({ name, organization, email, phone, inquiryType, message });
    if (!result.ok) {
      return Response.json(
        { error: 'Failed to send your message. Please try again later.' },
        { status: 500 }
      );
    }

    securityLog('CONTACT_SUBMISSION_SUCCESS', { email, inquiryType, ip: clientIp });
    return Response.json({ success: true });

  } catch (err) {
    console.error('Contact API error:', err);
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
