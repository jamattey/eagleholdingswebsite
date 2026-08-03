// src/middleware.js
// Next.js Edge Middleware — OWASP Zero Trust Route Security Guard.

import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect Partner Portal route
  if (pathname.startsWith('/partner-portal')) {
    const token = request.cookies.get('eagle_session')?.value;
    const session = await verifyJwt(token);

    if (!session) {
      const loginUrl = new URL('/partner-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/partner-portal/:path*'],
};
