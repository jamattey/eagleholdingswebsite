// src/app/api/auth/session/route.js
// Inspects the HttpOnly session cookie and returns current authenticated user profile.

import { verifyJwt } from '@/lib/jwt';

export async function GET(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/eagle_session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return Response.json({ authenticated: false, session: null }, { status: 200 });
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return Response.json({ authenticated: false, session: null }, { status: 200 });
  }

  return Response.json({
    authenticated: true,
    session: {
      sub: payload.sub,
      name: payload.name,
      role: payload.role,
      clearance: payload.clearance,
      authenticatedAt: payload.authenticatedAt || new Date(payload.iat * 1000).toISOString(),
    },
  });
}
