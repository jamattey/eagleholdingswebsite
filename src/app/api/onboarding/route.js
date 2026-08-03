// src/app/api/onboarding/route.js
// OWASP Hardened Onboarding API route supporting Principal intake actions and Server-Side RBAC for Admin actions.

import { sanitizeInput, rateLimiter, securityLog } from '@/lib/security';
import { verifyJwt } from '@/lib/jwt';

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // OWASP A04/A07: Rate Limiting (20 requests per minute per IP)
  const rateLimit = rateLimiter(`onboarding_${clientIp}`, 20, 60000);
  if (!rateLimit.success) {
    securityLog('RATE_LIMIT_EXCEEDED', { endpoint: '/api/onboarding', ip: clientIp });
    return Response.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { status: 429 }
    );
  }

  // Extract and verify session cookie for RBAC
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/eagle_session=([^;]+)/);
  const sessionToken = match ? match[1] : null;
  const session = sessionToken ? await verifyJwt(sessionToken) : null;

  try {
    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { action, itemId, newStatus, documentName, fileSize, feedbackText, targetCapital, preferredTerms, ltvRatio, sponsorName, email, projectName, facilityAmount } = body;

    // Principal Action: Uploading a document into Data Room
    if (action === 'upload_document') {
      if (!session || (session.role !== 'PRINCIPAL' && session.role !== 'ADMIN')) {
        securityLog('UNAUTHORIZED_UPLOAD', { action, ip: clientIp, userRole: session?.role });
        return Response.json({ error: 'Unauthorized. Principal access required.' }, { status: 403 });
      }
      if (!itemId || !documentName) {
        return Response.json({ error: 'Missing document item ID or file name.' }, { status: 400 });
      }

      securityLog('VDR_DOCUMENT_UPLOAD', { itemId, documentName, fileSize, ip: clientIp });

      return Response.json({
        success: true,
        action: 'upload_document',
        itemId,
        status: 'Under Audit',
        auditReference: `VDR-${Math.floor(100000 + Math.random() * 900000)}`,
        uploadedAt: new Date().toISOString(),
      });
    }

    // Principal Action: Submitting feedback on capital raise offer
    if (action === 'submit_feedback') {
      if (!session || (session.role !== 'PRINCIPAL' && session.role !== 'ADMIN')) {
        securityLog('UNAUTHORIZED_FEEDBACK', { action, ip: clientIp, userRole: session?.role });
        return Response.json({ error: 'Unauthorized. Principal access required.' }, { status: 403 });
      }
      if (!feedbackText) {
        return Response.json({ error: 'Feedback text is required.' }, { status: 400 });
      }

      securityLog('CAPITAL_RAISE_FEEDBACK', { ip: clientIp });

      return Response.json({
        success: true,
        action: 'submit_feedback',
        receiptId: `FBK-${Date.now().toString(36).toUpperCase()}`,
        submittedAt: new Date().toISOString(),
      });
    }

    // ─── Server-Side RBAC Enforcement for Admin Actions ────────────────────
    const isAdminAction = action === 'admin_update_status' || action === 'admin_update_terms' || action === 'invite_principal';
    
    if (isAdminAction) {
      if (!session || session.role !== 'ADMIN') {
        securityLog('UNAUTHORIZED_ADMIN_ACTION', { action, ip: clientIp, userRole: session?.role });
        return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
      }
    }

    // Admin Action: Update checklist item status
    if (action === 'admin_update_status') {
      if (!itemId || !newStatus) {
        return Response.json({ error: 'Item ID and new status are required.' }, { status: 400 });
      }

      securityLog('ADMIN_STATUS_CHANGE', { itemId, newStatus, ip: clientIp });

      return Response.json({
        success: true,
        action: 'admin_update_status',
        itemId,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }

    // Admin Action: Modify Capital Raise Offer Terms
    if (action === 'admin_update_terms') {
      securityLog('ADMIN_TERMS_UPDATE', { targetCapital, preferredTerms, ltvRatio, ip: clientIp });

      return Response.json({
        success: true,
        action: 'admin_update_terms',
        updatedTerms: { targetCapital, preferredTerms, ltvRatio },
        updatedAt: new Date().toISOString(),
      });
    }

    // Admin Action: Invite Project Principal
    if (action === 'invite_principal') {
      if (!sponsorName || !email || !projectName) {
        return Response.json({ error: 'Sponsor Name, Corporate Email, and Project Name are required.' }, { status: 400 });
      }

      const inviteCode = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      const inviteUrl = `/principal-login?invite=${inviteCode}`;

      securityLog('ADMIN_INVITE_PRINCIPAL', { sponsorName, email, projectName, inviteCode, ip: clientIp });

      return Response.json({
        success: true,
        action: 'invite_principal',
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

    return Response.json({ error: 'Invalid action.' }, { status: 400 });

  } catch (err) {
    console.error('Onboarding API error:', err);
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
