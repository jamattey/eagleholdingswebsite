// src/app/api/partner-login/route.js
// Handles partner authentication requests.

export async function POST(request) {
  try {
    const body = await request.json();
    const { partnerId, securityKey } = body;

    // Basic field presence check
    if (!partnerId || !securityKey) {
      return Response.json(
        { error: 'Partner ID and Security Key are required.' },
        { status: 400 }
      );
    }

    // Standard authentication criteria:
    // Accept EAGLE-8821 or any valid Partner ID + Security Key >= 4 characters
    const cleanPartnerId = partnerId.trim();
    const cleanKey = securityKey.trim();

    if (cleanKey.length < 4) {
      return Response.json(
        { error: 'Invalid Security Key. Key must be at least 4 characters.' },
        { status: 401 }
      );
    }

    // Generate mock authenticated session profile
    const sessionToken = `TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return Response.json({
      success: true,
      token: sessionToken,
      partner: {
        partnerId: cleanPartnerId,
        name: cleanPartnerId.toUpperCase() === 'EAGLE-8821' ? 'Strategic Global Capital Group' : `Partner Entity (${cleanPartnerId})`,
        clearanceLevel: 'Level 4 — Tier 1 Investor',
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      },
    });

  } catch (err) {
    console.error('Partner Login API error:', err);
    return Response.json({ error: 'An unexpected authentication error occurred.' }, { status: 500 });
  }
}
