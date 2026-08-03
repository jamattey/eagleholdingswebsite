// src/app/api/admin/route.js
// OWASP Hardened Admin API Route enforcing mandatory server-side JWT verification (role === 'ADMIN')
// Supports Executive Command Center operations, deal auditing, partner briefing uploads, and sponsor invitations.

import { sanitizeInput, rateLimiter, securityLog } from '@/lib/security';
import { verifyJwt } from '@/lib/jwt';

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // OWASP A04/A07: Rate Limiting (30 requests per minute per IP)
  const rateLimit = rateLimiter(`admin_api_${clientIp}`, 30, 60000);
  if (!rateLimit.success) {
    securityLog('RATE_LIMIT_EXCEEDED', { endpoint: '/api/admin', ip: clientIp });
    return Response.json(
      { error: 'Too many administrative requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  // Extract and verify session cookie for Admin RBAC
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/eagle_session=([^;]+)/);
  const sessionToken = match ? match[1] : null;
  const session = sessionToken ? await verifyJwt(sessionToken) : null;

  // Strict Server-Side RBAC: ADMIN role mandatory for all endpoints in /api/admin
  if (!session || session.role !== 'ADMIN') {
    securityLog('UNAUTHORIZED_ADMIN_API_ACCESS', { ip: clientIp, userRole: session?.role });
    return Response.json(
      { error: 'Unauthorized. Executive Admin credentials required.' },
      { status: 403 }
    );
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { action, dealReference, newStatus, itemId, reviewNote, briefingTitle, briefingCategory, briefingFileName, sponsorName, email, projectName, facilityAmount, offerTerms } = body;

    // ─── GET ADMIN DASHBOARD CONSOLIDATED DATA ─────────────────────────────────
    if (action === 'get_admin_dashboard') {
      securityLog('ADMIN_DASHBOARD_FETCH', { adminUser: session.name || session.sub, ip: clientIp });
      return Response.json({
        success: true,
        metrics: {
          totalPipelineVolume: '$525,000,000 USD',
          activeDealsCount: 5,
          pendingAuditsCount: 3,
          clearancesIssuedCount: 2,
          registeredSponsorsCount: 14,
          activePartnersCount: 8,
          secAuditEventsCount: 142,
        },
      });
    }

    // ─── UPLOAD PARTNER BRIEFING TO PARTNER DASHBOARD ──────────────────────────
    // USER REQUIREMENT: "admin briefings should be able to tag specific deals where necessary"
    if (action === 'upload_partner_briefing') {
      const { briefingTitle, briefingCategory, briefingFileName, taggedDealRef, taggedDealName } = body;
      if (!briefingTitle || !briefingFileName) {
        return Response.json({ error: 'Briefing Title and File Name are required.' }, { status: 400 });
      }

      const briefingRef = `BRF-${Date.now().toString(36).toUpperCase()}`;

      securityLog('ADMIN_PARTNER_BRIEFING_UPLOAD', {
        briefingTitle,
        briefingCategory: briefingCategory || 'Strategic Briefing',
        briefingFileName,
        briefingRef,
        taggedDealRef: taggedDealRef || null,
        taggedDealName: taggedDealName || null,
        adminUser: session.name || session.sub,
        ip: clientIp,
      });

      return Response.json({
        success: true,
        action: 'upload_partner_briefing',
        briefing: {
          id: `brf-${Date.now()}`,
          ref: briefingRef,
          title: briefingTitle,
          category: briefingCategory || 'Strategic Briefing',
          fileName: briefingFileName,
          taggedDealRef: taggedDealRef || null,
          taggedDealName: taggedDealName || null,
          uploadedAt: new Date().toISOString(),
          uploadedBy: session.name || 'Eagle Holdings Admin',
          accessLevel: 'Restricted Partner Access',
          status: 'Published to Partner Portal',
        },
      });
    }

    // ─── UPDATE DEAL CLEARANCE STATUS ──────────────────────────────────────────
    if (action === 'update_deal_status') {
      if (!dealReference || !newStatus) {
        return Response.json({ error: 'Deal reference and new status are required.' }, { status: 400 });
      }

      securityLog('ADMIN_DEAL_STATUS_UPDATE', { dealReference, newStatus, ip: clientIp });

      return Response.json({
        success: true,
        action: 'update_deal_status',
        dealReference,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }

    // ─── AUDIT VDR DOCUMENT & RECORD ADVISOR NOTE ──────────────────────────────
    if (action === 'audit_vdr_document') {
      if (!itemId || !newStatus) {
        return Response.json({ error: 'Item ID and audit status are required.' }, { status: 400 });
      }

      securityLog('ADMIN_VDR_AUDIT', { itemId, newStatus, reviewNote, ip: clientIp });

      return Response.json({
        success: true,
        action: 'audit_vdr_document',
        itemId,
        status: newStatus,
        reviewNote: reviewNote || `Audited and set to ${newStatus}`,
        auditedAt: new Date().toISOString(),
        auditor: session.name || 'Eagle Holdings Compliance Officer',
      });
    }

    // ─── INVITE PRINCIPAL / SPONSOR ───────────────────────────────────────────
    if (action === 'invite_sponsor') {
      if (!sponsorName || !email || !projectName) {
        return Response.json({ error: 'Sponsor Name, Corporate Email, and Project Name are required.' }, { status: 400 });
      }

      const inviteCode = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      const inviteUrl = `/login?invite=${inviteCode}`;

      securityLog('ADMIN_INVITE_SPONSOR', { sponsorName, email, projectName, inviteCode, ip: clientIp });

      return Response.json({
        success: true,
        action: 'invite_sponsor',
        invitation: {
          inviteCode,
          inviteUrl,
          sponsorName,
          email,
          projectName,
          facilityAmount: facilityAmount || '$50,000,000 USD',
          invitedAt: new Date().toISOString(),
          status: 'Pending Registration',
        },
      });
    }

    // ─── UPDATE CAPITAL RAISE OFFER TERMS ─────────────────────────────────────
    if (action === 'update_terms') {
      securityLog('ADMIN_TERMS_UPDATE', { offerTerms, ip: clientIp });

      return Response.json({
        success: true,
        action: 'update_terms',
        updatedTerms: offerTerms,
        updatedAt: new Date().toISOString(),
      });
    }

    return Response.json({ error: 'Invalid admin action.' }, { status: 400 });

  } catch (err) {
    console.error('Admin API error:', err);
    return Response.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
