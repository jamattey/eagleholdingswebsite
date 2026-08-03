// src/app/api/auth/logout/route.js
// Destroys the HttpOnly session cookie to securely sign out the user.

import { createClearAuthCookie } from '@/lib/jwt';
import { securityLog } from '@/lib/security';

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  securityLog('AUTH_LOGOUT', { ip: clientIp });

  return new Response(
    JSON.stringify({ success: true, message: 'Signed out successfully.' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createClearAuthCookie(),
      },
    }
  );
}
