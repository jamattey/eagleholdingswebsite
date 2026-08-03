// src/app/api/onboarding/route.js
// Handles Principal intake actions and Admin backend deal management.

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, role, itemId, newStatus, documentName, fileSize, feedbackText, targetCapital, preferredTerms, ltvRatio } = body;

    // Principal Action: Uploading a document into Data Room
    if (action === 'upload_document') {
      if (!itemId || !documentName) {
        return Response.json({ error: 'Missing document item ID or file name.' }, { status: 400 });
      }

      console.log('📁 [Principal] Data Room Upload:', { itemId, documentName, fileSize });

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
      if (!feedbackText) {
        return Response.json({ error: 'Feedback text is required.' }, { status: 400 });
      }

      console.log('💬 [Principal] Capital Raise Feedback Submitted:', { feedbackText });

      return Response.json({
        success: true,
        action: 'submit_feedback',
        receiptId: `FBK-${Date.now().toString(36).toUpperCase()}`,
        submittedAt: new Date().toISOString(),
      });
    }

    // Admin Action: Update checklist item status (Approve, Flag Action Required, Put Under Audit)
    if (action === 'admin_update_status') {
      if (!itemId || !newStatus) {
        return Response.json({ error: 'Item ID and new status are required.' }, { status: 400 });
      }

      console.log('🛡️ [Admin] Item Status Updated:', { itemId, newStatus });

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
      console.log('⚙️ [Admin] Offer Terms Updated:', { targetCapital, preferredTerms, ltvRatio });

      return Response.json({
        success: true,
        action: 'admin_update_terms',
        updatedTerms: { targetCapital, preferredTerms, ltvRatio },
        updatedAt: new Date().toISOString(),
      });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });

  } catch (err) {
    console.error('Onboarding API error:', err);
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
