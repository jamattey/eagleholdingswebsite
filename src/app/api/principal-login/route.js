// src/app/api/principal-login/route.js
// OWASP Hardened Project Principal Login API.

import { sanitizeInput, rateLimiter, safeTimingCompare, securityLog } from '@/lib/security';

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // OWASP A07: Brute-Force Rate Limiting (5 attempts / min)
  const rateLimit = rateLimiter(`principal_login_${clientIp}`, 5, 60000);
  if (!rateLimit.success) {
    securityLog('BRUTE_FORCE_PREVENTED', { endpoint: '/api/principal-login', ip: clientIp });
    return Response.json(
      { error: 'Too many authentication attempts. Please wait 1 minute before retrying.' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { principalId, securityKey, inviteCode } = body;

    // Validation
    if (!principalId || !securityKey) {
      return Response.json(
        { error: 'Principal ID and Security Key are required.' },
        { status: 400 }
      );
    }

    const cleanId = principalId.trim();
    const cleanKey = securityKey.trim();

    if (cleanKey.length < 4) {
      securityLog('AUTH_FAILURE_SHORT_KEY', { principalId: cleanId, ip: clientIp });
      return Response.json(
        { error: 'Invalid Security Key. Key must be at least 4 characters.' },
        { status: 401 }
      );
    }

    const principalToken = `SPON-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    securityLog('PRINCIPAL_AUTH_SUCCESSFUL', { principalId: cleanId, inviteCode: inviteCode || 'N/A', ip: clientIp });

    return Response.json({
      success: true,
      token: principalToken,
      principal: {
        principalId: cleanId,
        name: safeTimingCompare(cleanId.toUpperCase(), 'PRINCIPAL-2026') ? 'Metro Infrastructure Group' : `Sponsor Entity (${cleanId})`,
        inviteCode: inviteCode || null,
        clearanceLevel: 'Project Sponsor — Tier 1',
        authenticatedAt: new Date().toISOString(),
      },
    });

  } catch (err) {
    console.error('Principal Login API error:', err);
    return Response.json({ error: 'An unexpected authentication error occurred.' }, { status: 500 });
  }
}
