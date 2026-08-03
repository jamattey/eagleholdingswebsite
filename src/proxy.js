// src/proxy.js
// Next.js Edge Proxy — OWASP Zero Trust Route Security Guard with Strict Role Siloing.
// This file is automatically loaded by Next.js and runs on the Edge before every matched request.

import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('eagle_session')?.value;
  const session = token ? await verifyJwt(token) : null;

  // ─── Protect Partner Portal ──────────────────────────────────────────────────
  if (pathname.startsWith('/partner-portal')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('type', 'partner');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Siloing: Only PARTNER and ADMIN can access Partner Portal.
    // PRINCIPAL users are redirected to /unauthorized — they never see Partner data.
    if (session.role !== 'PARTNER' && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ─── Protect Onboarding Portal ───────────────────────────────────────────────
  // This route is completely hidden from unauthenticated visitors and regular
  // site traffic. No HTML, JS, or data is served until identity is verified.
  if (pathname.startsWith('/onboarding')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('type', 'principal');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Siloing: Only PRINCIPAL and ADMIN can access Onboarding.
    // PARTNER users are redirected to /unauthorized — they never see Principal data.
    if (session.role !== 'PRINCIPAL' && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ─── Protect Admin Portal ───────────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-portal')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('type', 'admin');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Siloing: Only ADMIN can access Executive Admin Portal.
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/partner-portal/:path*', '/onboarding/:path*', '/admin/:path*', '/admin-portal/:path*'],
};
