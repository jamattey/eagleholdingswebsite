// src/middleware.js
// Next.js Edge Middleware — OWASP Zero Trust Route Security Guard with Strict Role Siloing.

import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('eagle_session')?.value;
  const session = token ? await verifyJwt(token) : null;

  // Protect Partner Portal route
  if (pathname.startsWith('/partner-portal')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('type', 'partner');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Strict Siloing: Only PARTNER and ADMIN can access Partner Portal
    if (session.role !== 'PARTNER' && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect Onboarding Portal route
  if (pathname.startsWith('/onboarding')) {
    // Note: unauthenticated users can access onboarding (it shows a blurred view)
    // However, if authenticated as PARTNER, they are forbidden from viewing principal workflows
    if (session && session.role === 'PARTNER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/partner-portal/:path*', '/onboarding/:path*'],
};
