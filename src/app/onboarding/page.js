'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const initialChecklist = [
  { id: 'item-01', category: 'entity', categoryLabel: 'Entity & Principal KYC', title: 'Personal KYC & Passport Verification', description: 'Notarized government ID and proof of residence for all project principals and directors.', status: 'Verified', ref: 'DOC-KYC-991' },
  { id: 'item-02', category: 'entity', categoryLabel: 'Entity & Principal KYC', title: 'Ultimate Beneficial Owner (UBO) Disclosures', description: 'Corporate ownership breakdown certifying all beneficiaries meeting the applicable threshold.', status: 'Verified', ref: 'DOC-UBO-402' },
  { id: 'item-03', category: 'entity', categoryLabel: 'Entity & Principal KYC', title: 'Politically Exposed Person (PEP) Declarations', description: 'PEP declarations for all directors, signatories, and equity-investor UBOs.', status: 'Pending Upload', ref: 'DOC-PEP-REQ' },
  { id: 'item-04', category: 'entity', categoryLabel: 'Entity & Principal KYC', title: 'Mandatory Corporate Verification Documents', description: 'Certificate of Incorporation, M&A, Register of Directors, and recent Audited Financials.', status: 'Under Audit', ref: 'DOC-CORP-112' },
  { id: 'item-05', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Ghana Regulatory & Land Title Documentation', description: 'Land lease/title registration (Lands Commission), GIPC Certificate, and Ghana Tourism Authority license.', status: 'Pending Upload', ref: 'DOC-LAND-REQ' },
  { id: 'item-06', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Feasibility Studies', description: 'Comprehensive analysis of project viability, market conditions, and economic feasibility.', status: 'Pending Upload', ref: 'DOC-TECH-001' },
  { id: 'item-07', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Geotech Report', description: 'Detailed analysis of subsurface conditions, including ground stability and foundation requirements.', status: 'Pending Upload', ref: 'DOC-TECH-002' },
  { id: 'item-08', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Soil Test', description: 'Certified soil borings and composition analysis.', status: 'Pending Upload', ref: 'DOC-TECH-003' },
  { id: 'item-09', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Structural Design', description: 'Detailed structural engineering blueprints and calculations.', status: 'Pending Upload', ref: 'DOC-TECH-004' },
  { id: 'item-10', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Full Plans with Quantities', description: 'Complete architectural plans accompanied by a detailed Bill of Quantities (BoQ).', status: 'Pending Upload', ref: 'DOC-TECH-005' },
  { id: 'item-11', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Electrical Designs', description: 'Stamped electrical schematics, load calculations, and power distribution plans.', status: 'Pending Upload', ref: 'DOC-TECH-006' },
  { id: 'item-12', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Sewage and Trash Disposal', description: 'Waste management plans, including sewage treatment and solid waste disposal strategies.', status: 'Pending Upload', ref: 'DOC-TECH-007' },
  { id: 'item-13', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Permits', description: 'All necessary local and national construction and operational permits.', status: 'Pending Upload', ref: 'DOC-TECH-008' },
  { id: 'item-14', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Licenses', description: 'Required commercial, hospitality, and operational licenses.', status: 'Pending Upload', ref: 'DOC-TECH-009' },
  { id: 'item-15', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Civil Design', description: 'Site civil engineering designs, including grading, drainage, and infrastructure layouts.', status: 'Pending Upload', ref: 'DOC-TECH-010' },
  { id: 'item-16', category: 'project', categoryLabel: 'Project Technical Compliance', title: 'Environmental & Social Impact Assessment (ESIA)', description: 'Full Environmental & Social Impact Assessment (ESIA) including regulatory environmental permit, impact screening, and mitigation plan.', status: 'Action Required', ref: 'DOC-TECH-011' },
  { id: 'item-17', category: 'financial', categoryLabel: 'Financial & Legal Compliance', title: 'Corporate Banking Credentials & CIS', description: 'Client Information Sheet (CIS) and bank reference letter dated within 30 days.', status: 'Under Audit', ref: 'DOC-CIS-108' },
  { id: 'item-18', category: 'financial', categoryLabel: 'Financial & Legal Compliance', title: 'Source of Funds & Equity Proof', description: 'Evidence of sponsor equity contribution, source of wealth, and finalized financial model.', status: 'Action Required', ref: 'DOC-SOF-PENDING' },
  { id: 'item-19', category: 'financial', categoryLabel: 'Financial & Legal Compliance', title: 'Executed EPC / Construction Contract', description: 'Finalized Engineering, Procurement & Construction contract with the primary contractor.', status: 'Pending Upload', ref: 'DOC-EPC-REQ' },
  { id: 'item-20', category: 'financial', categoryLabel: 'Financial & Legal Compliance', title: 'Hotel Management or Franchise Agreement', description: 'Executed management contract or franchise agreement with the designated hotel operator.', status: 'Pending Upload', ref: 'DOC-HMA-REQ' },
];

const initialPipeline = [
  { inviteCode: 'INV-882104', sponsorName: 'Metro Civil Infrastructure Group', email: 'contact@metro-civil.com', projectName: 'High-Density Mobility Hub Phase I', facilityAmount: '$50,000,000 USD', invitedAt: '2026-08-01 14:30', status: 'Registered & Active' },
  { inviteCode: 'INV-401923', sponsorName: 'Pacific Rim Energy Developers', email: 'capital@pacific-energy.org', projectName: 'Regional Deepwater Civil Asset', facilityAmount: '$75,000,000 USD', invitedAt: '2026-08-02 09:15', status: 'Pending Registration' },
];

// ─── Document Viewer ──────────────────────────────────────────────────────────
function DocumentViewer({ doc, onClose }) {
  const isImage = doc.fileType?.startsWith('image/');
  const isPdf = doc.fileType === 'application/pdf';

  return (
    <div className={styles.viewerOverlay} onClick={onClose}>
      <div className={styles.viewerModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.viewerHeader}>
          <div>
            <span className={styles.itemCategory}>{doc.categoryLabel}</span>
            <h3 className={styles.viewerTitle}>{doc.title}</h3>
            <span className={styles.viewerMeta}>
              {doc.fileName} · {doc.vdrReference} · Submitted {new Date(doc.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <button className={styles.viewerCloseBtn} onClick={onClose} aria-label="Close viewer">✕</button>
        </div>
        <div className={styles.viewerBody}>
          {isPdf && (
            <iframe
              src={doc.objectUrl}
              className={styles.viewerIframe}
              title={doc.title}
            />
          )}
          {isImage && (
            <img src={doc.objectUrl} alt={doc.title} className={styles.viewerImage} />
          )}
          {!isPdf && !isImage && (
            <div className={styles.viewerFallback}>
              <div className={styles.viewerFallbackIcon}>📄</div>
              <p className={styles.viewerFallbackText}>
                Preview is not available for this file type ({doc.fileType || 'unknown'}).
              </p>
              <a
                href={doc.objectUrl}
                download={doc.fileName}
                className={styles.viewerDownloadBtn}
              >
                Download {doc.fileName}
              </a>
            </div>
          )}
        </div>
        <div className={styles.viewerFooter}>
          <span className={styles.statusBadge} style={{ background: 'rgba(241,196,15,0.12)', color: '#f1c40f', border: '1px solid rgba(241,196,15,0.3)' }}>
            View Only — Submitted to Eagle Holdings
          </span>
          <span className={styles.docRef}>Deal Ref: {doc.dealReference}</span>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('principal');
  const [principalSession, setPrincipalSession] = useState(null);

  const [activeView, setActiveView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('all');

  const [checklist, setChecklist] = useState(initialChecklist);
  const [uploadNotice, setUploadNotice] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [feedbackReceipt, setFeedbackReceipt] = useState('');

  // ─── Staged uploads (file selected but not yet submitted) ────────────────
  // Map<itemId, { file, objectUrl, fileName, fileType }>
  const [stagedFiles, setStagedFiles] = useState({});

  // ─── Submitted Data Room documents ───────────────────────────────────────
  const [dataRoomDocs, setDataRoomDocs] = useState([]);

  // ─── Active Deals (shown on admin dashboard) ─────────────────────────────
  const [deals, setDeals] = useState([]);

  // ─── Data Room viewer modal ───────────────────────────────────────────────
  const [viewingDoc, setViewingDoc] = useState(null);

  // ─── Expanded VDR card (accordion) ───────────────────────────────────────
  const [expandedVdrId, setExpandedVdrId] = useState(null);

  // ─── Review feedback per VDR entry: Map<vdrId, { notes, reviewedAt, reviewedBy, status }[]> ─
  const [vdrFeedback, setVdrFeedback] = useState({});

  // ─── Admin note input per VDR entry ──────────────────────────────────────
  const [vdrNoteInputs, setVdrNoteInputs] = useState({});

  const [offerTerms, setOfferTerms] = useState({ targetCapital: '$50,000,000 USD', preferredTerms: '8.5% p.a.', ltvRatio: '65.0% LTV', advisoryTerm: '36 Months' });
  const [adminNotice, setAdminNotice] = useState('');
  const [inviteForm, setInviteForm] = useState({ sponsorName: '', email: '', projectName: '', facilityAmount: '$50,000,000 USD' });
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [latestInvite, setLatestInvite] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function checkZeroTrustSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.session) {
          setPrincipalSession(data.session);
          if (data.session.role === 'ADMIN') setUserRole('admin');
        } else {
          setPrincipalSession(null);
        }
      } catch { setPrincipalSession(null); }
    }
    checkZeroTrustSession();
  }, []);

  // Clean up blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      Object.values(stagedFiles).forEach(f => URL.revokeObjectURL(f.objectUrl));
      dataRoomDocs.forEach(d => URL.revokeObjectURL(d.objectUrl));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalItems = checklist.length;
  const completedItems = checklist.filter(i => i.status === 'Verified').length;
  const auditItems = checklist.filter(i => i.status === 'Under Audit').length;
  const progressPercent = Math.round(((completedItems + auditItems * 0.5) / totalItems) * 100);

  const filteredChecklist = checklist.filter(item => {
    if (activeTab === 'entity') return item.category === 'entity';
    if (activeTab === 'project') return item.category === 'project';
    if (activeTab === 'financial') return item.category === 'financial';
    return true;
  });

  const actionChecklist = checklist.filter(item => item.status !== 'Verified');

  // ─── STAGE: file selected, not yet submitted ──────────────────────────────
  const handleFileSelect = (e, itemId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setStagedFiles(prev => ({
      ...prev,
      [itemId]: { file, objectUrl, fileName: file.name, fileType: file.type },
    }));
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: 'Ready to Submit' } : item
    ));
  };

  // ─── SUBMIT: send to API, post to Data Room, create Deal ─────────────────
  const handleDocumentSubmit = async (itemId) => {
    const staged = stagedFiles[itemId];
    if (!staged) return;

    const checklistItem = checklist.find(i => i.id === itemId);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_document',
          itemId,
          documentName: staged.fileName,
          fileSize: `${(staged.file.size / (1024 * 1024)).toFixed(2)} MB`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update checklist item status
        setChecklist(prev => prev.map(item =>
          item.id === itemId
            ? { ...item, status: 'Under Audit', ref: data.vdrReference }
            : item
        ));

        // Post to Data Room
        const vdrEntry = {
          id: `vdr-${itemId}-${Date.now()}`,
          itemId,
          title: checklistItem?.title || itemId,
          categoryLabel: checklistItem?.categoryLabel || '',
          category: checklistItem?.category || 'entity',
          fileName: staged.fileName,
          fileType: staged.fileType,
          objectUrl: staged.objectUrl,
          vdrReference: data.vdrReference,
          dealReference: data.dealReference,
          submittedAt: data.submittedAt,
          status: 'View Only',
        };
        setDataRoomDocs(prev => [...prev, vdrEntry]);

        // Create Deal entry for admin
        const deal = {
          dealReference: data.dealReference,
          vdrReference: data.vdrReference,
          documentTitle: checklistItem?.title || itemId,
          fileName: staged.fileName,
          fileType: staged.fileType,
          submittedAt: data.submittedAt,
          status: 'In Review',
        };
        setDeals(prev => [deal, ...prev]);

        // Clear staged file
        setStagedFiles(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });

        setUploadNotice(`"${checklistItem?.title}" submitted to Data Room. Deal ${data.dealReference} created for review.`);
        setTimeout(() => setUploadNotice(''), 8000);
      }
    } catch (err) {
      console.error('Document submit error:', err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackStatus('submitting');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_feedback', feedbackText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackStatus('success');
        setFeedbackReceipt(data.receiptId);
        setFeedbackText('');
      } else { setFeedbackStatus('error'); }
    } catch { setFeedbackStatus('error'); }
  };

  const handleAdminStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_update_status', itemId, newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
        if (newStatus === 'Verified') {
          setDeals(prev => prev.map(d => d.vdrReference === checklist.find(c => c.id === itemId)?.ref ? { ...d, status: 'Approved' } : d));
        }
        setAdminNotice(`Audit status for item ${itemId} set to "${newStatus}".`);
        setTimeout(() => setAdminNotice(''), 5000);
      }
    } catch (err) { console.error('Admin status change error:', err); }
  };

  // ─── Admin: add a review note to a VDR entry ─────────────────────────────
  const handleAddVdrNote = (vdrId, itemId, newStatus) => {
    const noteText = vdrNoteInputs[vdrId] || '';
    const entry = {
      text: noteText || `Status updated to "${newStatus}".`,
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Eagle Holdings Advisor',
    };
    setVdrFeedback(prev => ({
      ...prev,
      [vdrId]: [...(prev[vdrId] || []), entry],
    }));
    setVdrNoteInputs(prev => ({ ...prev, [vdrId]: '' }));
    // Also update checklist status
    handleAdminStatusChange(itemId, newStatus);
    // Update the doc's status in dataRoomDocs
    setDataRoomDocs(prev => prev.map(d =>
      d.id === vdrId ? { ...d, reviewStatus: newStatus } : d
    ));
  };

  const handleAdminTermsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_update_terms', ...offerTerms }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminNotice('Capital raise offer terms updated successfully.');
        setTimeout(() => setAdminNotice(''), 5000);
      }
    } catch (err) { console.error(err); }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.sponsorName || !inviteForm.email || !inviteForm.projectName) return;
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite_principal', ...inviteForm }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const inv = data.invitation;
        setLatestInvite(inv);
        setPipeline(prev => [inv, ...prev]);
        setInviteForm({ sponsorName: '', email: '', projectName: '', facilityAmount: '$50,000,000 USD' });
        setAdminNotice(`Invitation link generated for ${inv.sponsorName}. Email dispatched to ${inv.email}.`);
        setTimeout(() => setAdminNotice(''), 6000);
      }
    } catch (err) { console.error(err); }
  };

  const copyInviteLink = () => {
    if (!latestInvite) return;
    navigator.clipboard.writeText(`${window.location.origin}${latestInvite.inviteUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 4000);
  };

  // ─── Checklist item card renderer ────────────────────────────────────────
  const renderChecklistItem = (item) => {
    const staged = stagedFiles[item.id];
    const isReadyToSubmit = item.status === 'Ready to Submit' && staged;
    const isImage = staged?.fileType?.startsWith('image/');
    const isPdf = staged?.fileType === 'application/pdf';

    return (
      <div key={item.id} className={styles.checklistItem}>
        <div>
          <div className={styles.itemHeader}>
            <div>
              <span className={styles.itemCategory}>{item.categoryLabel}</span>
              <h3 className={styles.itemTitle}>{item.title}</h3>
            </div>
            <span className={`
              ${styles.statusBadge}
              ${item.status === 'Verified' ? styles.statusVerified : ''}
              ${item.status === 'Under Audit' ? styles.statusAudit : ''}
              ${item.status === 'Action Required' ? styles.statusAction : ''}
              ${item.status === 'Pending Upload' ? styles.statusPending : ''}
              ${item.status === 'Ready to Submit' ? styles.statusReady : ''}
            `}>
              {item.status}
            </span>
          </div>
          <p className={styles.itemDescription}>{item.description}</p>

          {/* Staged file preview */}
          {isReadyToSubmit && (
            <div className={styles.stagedPreview}>
              {isImage && (
                <img src={staged.objectUrl} alt="Preview" className={styles.stagedImageThumb} />
              )}
              {(isPdf || (!isImage && !isPdf)) && (
                <div className={styles.stagedPdfThumb}>
                  <span className={styles.stagedPdfIcon}>{isPdf ? '📄' : '📎'}</span>
                  <span className={styles.stagedFileName}>{staged.fileName}</span>
                </div>
              )}
              {/* View button — opens document in modal */}
              <button
                className={styles.stagedViewBtn}
                onClick={() => setViewingDoc({
                  id: `staged-${item.id}`,
                  title: item.title,
                  categoryLabel: item.categoryLabel,
                  fileName: staged.fileName,
                  fileType: staged.fileType,
                  objectUrl: staged.objectUrl,
                  vdrReference: 'STAGED — Not Yet Submitted',
                  dealReference: '—',
                  submittedAt: new Date().toISOString(),
                })}
              >
                👁 View Document
              </button>
            </div>
          )}
        </div>

        <div className={styles.itemFooter}>
          <span className={styles.docRef}>Ref: {item.ref}</span>

          {userRole === 'admin' && principalSession?.role === 'ADMIN' ? (
            <div className={styles.adminControls}>
              <button onClick={() => handleAdminStatusChange(item.id, 'Verified')} className={styles.adminApproveBtn}>
                Approve ✓
              </button>
              <button onClick={() => handleAdminStatusChange(item.id, 'Action Required')} className={styles.adminActionBtn}>
                Flag Action ⚠️
              </button>
            </div>
          ) : isReadyToSubmit ? (
            <div className={styles.submitGroup}>
              <label className={styles.uploadLabel}>
                <span>Replace</span>
                <input type="file" className={styles.hiddenInput} onChange={(e) => handleFileSelect(e, item.id)} />
              </label>
              <button className={styles.submitDocBtn} onClick={() => handleDocumentSubmit(item.id)}>
                Submit to Data Room →
              </button>
            </div>
          ) : (
            <label className={styles.uploadLabel}>
              <span>{item.status === 'Verified' ? 'Re-upload' : 'Upload Document'}</span>
              <input type="file" className={styles.hiddenInput} onChange={(e) => handleFileSelect(e, item.id)} />
            </label>
          )}
        </div>
      </div>
    );
  };

  // ─── Data Room document card renderer (expandable accordion) ────────────
  const renderDataRoomCard = (doc) => {
    const isImage = doc.fileType?.startsWith('image/');
    const isPdf = doc.fileType === 'application/pdf';
    const isExpanded = expandedVdrId === doc.id;
    const feedback = vdrFeedback[doc.id] || [];
    const docStatus = doc.reviewStatus || 'Under Audit';
    const noteInput = vdrNoteInputs[doc.id] || '';

    return (
      <div key={doc.id} className={`${styles.vdrCard} ${isExpanded ? styles.vdrCardExpanded : ''}`}>
        {/* ── Card Header (always visible, click to expand) ── */}
        <div className={styles.vdrCardHeader} onClick={() => setExpandedVdrId(isExpanded ? null : doc.id)}>
          <div className={styles.vdrThumb}>
            {isImage
              ? <img src={doc.objectUrl} alt={doc.title} className={styles.vdrThumbImage} />
              : <div className={styles.vdrThumbPlaceholder}>
                  <span className={styles.vdrThumbIcon}>{isPdf ? '📄' : '📎'}</span>
                </div>
            }
            <div className={styles.vdrViewOverlay}>{isExpanded ? 'Collapse ↑' : 'Expand & Review ↓'}</div>
          </div>
          <div className={styles.vdrCardBody}>
            <span className={styles.itemCategory}>{doc.categoryLabel}</span>
            <h4 className={styles.vdrCardTitle}>{doc.title}</h4>
            <p className={styles.vdrFileName}>{doc.fileName}</p>
          </div>
          <div className={styles.vdrCardFooter}>
            <span className={styles.docRef}>{doc.vdrReference}</span>
            <span className={`${styles.statusBadge} ${
              docStatus === 'Verified' ? styles.statusVerified :
              docStatus === 'Action Required' ? styles.statusAction :
              styles.statusAudit
            }`} style={{ fontSize: '0.65rem' }}>
              {docStatus === 'Verified' ? '✓ Approved' : docStatus === 'Action Required' ? '⚠ Action Required' : 'Under Review'}
            </span>
            <span className={styles.vdrExpandChevron}>{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* ── Expanded Panel ── */}
        {isExpanded && (
          <div className={styles.vdrExpandedPanel}>

            {/* Embedded document viewer */}
            <div className={styles.vdrEmbedSection}>
              <div className={styles.vdrEmbedLabel}>
                Document Preview
                <button className={styles.vdrOpenTabBtn} onClick={() => window.open(doc.objectUrl, '_blank')}>
                  ↗ Open in New Tab
                </button>
              </div>
              {isPdf && (
                <iframe src={doc.objectUrl} className={styles.vdrEmbedFrame} title={doc.title} />
              )}
              {isImage && (
                <img src={doc.objectUrl} alt={doc.title} className={styles.vdrEmbedImage} />
              )}
              {!isPdf && !isImage && (
                <div className={styles.vdrEmbedFallback}>
                  <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>📎</span>
                  <p style={{ opacity: 0.6, fontSize: '0.88rem' }}>{doc.fileName}</p>
                  <a href={doc.objectUrl} download={doc.fileName} className={styles.vdrDownloadLink}>Download File</a>
                </div>
              )}
            </div>

            {/* Review Feedback Timeline */}
            <div className={styles.vdrFeedbackSection}>
              <div className={styles.vdrFeedbackHeader}>
                <span className={styles.vdrFeedbackTitle}>Review Feedback & Audit Trail</span>
                <span className={styles.docRef}>Deal: {doc.dealReference}</span>
              </div>

              {/* Submission event */}
              <div className={styles.feedbackTimeline}>
                <div className={styles.feedbackEvent}>
                  <div className={styles.feedbackEventDot} style={{ background: 'rgba(255,255,255,0.25)' }} />
                  <div className={styles.feedbackEventContent}>
                    <span className={styles.feedbackEventTitle}>Document Submitted to Eagle Holdings VDR</span>
                    <span className={styles.feedbackEventMeta}>
                      {new Date(doc.submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · Ref: {doc.vdrReference}
                    </span>
                  </div>
                </div>

                {feedback.map((entry, idx) => (
                  <div key={idx} className={styles.feedbackEvent}>
                    <div className={styles.feedbackEventDot} style={{
                      background: entry.status === 'Verified' ? '#2ecc71' :
                        entry.status === 'Action Required' ? '#e74c3c' : '#f1c40f'
                    }} />
                    <div className={styles.feedbackEventContent}>
                      <span className={styles.feedbackEventTitle}>{entry.text}</span>
                      <span className={styles.feedbackEventMeta}>
                        {new Date(entry.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {entry.reviewedBy}
                      </span>
                    </div>
                  </div>
                ))}

                {feedback.length === 0 && (
                  <div className={styles.feedbackPending}>
                    <span style={{ opacity: 0.5, fontSize: '0.88rem' }}>⏳ Awaiting review by the Eagle Holdings advisory team. You will be notified when feedback is available.</span>
                  </div>
                )}
              </div>

              {/* Admin: Add note & update status */}
              {userRole === 'admin' && principalSession?.role === 'ADMIN' && (
                <div className={styles.adminFeedbackForm}>
                  <span className={styles.itemCategory} style={{ marginBottom: '8px', display: 'block' }}>Add Review Note</span>
                  <textarea
                    className={styles.textarea}
                    placeholder="Add advisor feedback, conditions, or approval notes..."
                    value={noteInput}
                    onChange={e => setVdrNoteInputs(prev => ({ ...prev, [doc.id]: e.target.value }))}
                    rows={3}
                    style={{ marginBottom: '10px' }}
                  />
                  <div className={styles.adminFeedbackBtns}>
                    <button
                      className={styles.adminApproveBtn}
                      onClick={() => handleAddVdrNote(doc.id, doc.itemId, 'Verified')}
                    >
                      Approve Document ✓
                    </button>
                    <button
                      className={styles.adminActionBtn}
                      onClick={() => handleAddVdrNote(doc.id, doc.itemId, 'Action Required')}
                    >
                      Flag for Action ⚠
                    </button>
                    {noteInput.trim() && (
                      <button
                        className={styles.adminNoteBtn}
                        onClick={() => handleAddVdrNote(doc.id, doc.itemId, docStatus)}
                      >
                        Add Note Only
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main className={styles.main}>
        <header className={styles.heroStrip}>
          <div className={styles.bgGrid}></div>
          <div className={styles.heroContent}>
            <div className={styles.topRow}>
              <div className={styles.badge}>
                <span className={styles.badgeDot}></span>
                {userRole === 'admin' ? 'Eagle Holdings Backend Command Center' : 'Secure Principal Data Room'}
              </div>
              {principalSession?.role === 'ADMIN' && (
                <div className={styles.roleSwitcher}>
                  <button className={`${styles.roleBtn} ${userRole === 'principal' ? styles.activeRole : ''}`} onClick={() => setUserRole('principal')}>
                    Principal View
                  </button>
                  <button className={`${styles.roleBtn} ${userRole === 'admin' ? styles.activeRole : ''}`} onClick={() => setUserRole('admin')}>
                    Admin View (Backend)
                  </button>
                </div>
              )}
            </div>
            <h1 className={styles.pageTitle}>
              {userRole === 'admin' ? 'Deal Audit & Command Portal' : 'Project Onboarding & Intake Portal'}
            </h1>
            <p className={styles.pageSubtitle}>
              {userRole === 'admin'
                ? 'Backend deal review interface for Eagle Holdings advisors to audit sponsor compliance submissions, send principal invitations, and adjust capital raise offer terms.'
                : 'Streamlined project intake, real-time compliance clearance tracking, and capital raise offer feedback for project principals and sponsors.'}
            </p>
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Overall Project Compliance Clearance Status</span>
                <span className={styles.progressVal}>{progressPercent}% Complete</span>
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.container}>
          <div className={styles.mainNavTabs}>
            <button className={`${styles.mainNavBtn} ${activeView === 'dashboard' ? styles.activeMainNav : ''}`} onClick={() => setActiveView('dashboard')}>
              Dashboard View
            </button>
            <button className={`${styles.mainNavBtn} ${activeView === 'submission' ? styles.activeMainNav : ''}`} onClick={() => setActiveView('submission')}>
              Data Submission Dropzone
            </button>
            <button className={`${styles.mainNavBtn} ${activeView === 'dataroom' ? styles.activeMainNav : ''}`} onClick={() => setActiveView('dataroom')}>
              Virtual Data Room {dataRoomDocs.length > 0 && `(${dataRoomDocs.length})`}
            </button>
          </div>

          {uploadNotice && (
            <div className={styles.uploadNotice}>✓ {uploadNotice}</div>
          )}
          {adminNotice && (
            <div className={styles.adminNotice}>🛡️ {adminNotice}</div>
          )}

          {userRole === 'principal' && !principalSession && (
            <div className={styles.authBanner}>
              <div>
                <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Project Principal Login Recommended</strong>
                <span style={{ fontSize: '0.88rem', opacity: 0.8 }}>Log in with your sponsor credentials to access your saved project data room and custom term sheets.</span>
              </div>
              <button onClick={() => router.push('/login?type=principal')} className={styles.loginBtn}>
                Login as Principal to Access
              </button>
            </div>
          )}

          {/* ─────────── DASHBOARD VIEW ─────────── */}
          {activeView === 'dashboard' && (
            <div className={styles.viewSection}>

              {/* Admin: Active Deals */}
              {userRole === 'admin' && principalSession?.role === 'ADMIN' && deals.length > 0 && (
                <div className={styles.dealsCard}>
                  <div>
                    <span className={styles.itemCategory}>Deal Management</span>
                    <h2 className={styles.offerTitle} style={{ fontSize: '1.4rem' }}>Active Deals from Document Submissions</h2>
                    <p className={styles.offerSubtitle}>Documents formally submitted by the principal. Each submission auto-creates a trackable deal record.</p>
                  </div>
                  <table className={styles.pipelineTable}>
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>File</th>
                        <th>Deal Reference</th>
                        <th>VDR Reference</th>
                        <th>Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deals.map((deal, idx) => (
                        <tr key={idx}>
                          <td><strong>{deal.documentTitle}</strong></td>
                          <td><span style={{ opacity: 0.65, fontSize: '0.8rem' }}>{deal.fileName}</span></td>
                          <td><code style={{ color: 'var(--gold)', fontSize: '0.78rem' }}>{deal.dealReference}</code></td>
                          <td><code style={{ color: 'var(--platinum)', fontSize: '0.78rem' }}>{deal.vdrReference}</code></td>
                          <td style={{ fontSize: '0.78rem', opacity: 0.7 }}>{new Date(deal.submittedAt).toLocaleDateString('en-GB')}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${deal.status === 'Approved' ? styles.statusVerified : styles.statusAudit}`}>
                              {deal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Admin: Invite Principal */}
              {userRole === 'admin' && principalSession?.role === 'ADMIN' && (
                <div className={styles.inviteCard}>
                  <div>
                    <span className={styles.itemCategory}>Sponsor Management</span>
                    <h2 className={styles.offerTitle}>Invite Project Principal to Onboarding</h2>
                    <p className={styles.offerSubtitle}>Generate a secure invitation link and dispatch onboarding credentials to a new project sponsor.</p>
                  </div>
                  <form className={styles.inviteForm} onSubmit={handleInviteSubmit}>
                    <div className={styles.inviteGrid}>
                      <div className={styles.adminInputGroup}>
                        <label className={styles.itemCategory} htmlFor="sponsorName">Principal / Sponsor Name *</label>
                        <input id="sponsorName" type="text" className={styles.adminInput} placeholder="e.g. Apex Civil Infrastructure" value={inviteForm.sponsorName} onChange={(e) => setInviteForm({ ...inviteForm, sponsorName: e.target.value })} required />
                      </div>
                      <div className={styles.adminInputGroup}>
                        <label className={styles.itemCategory} htmlFor="email">Corporate Email *</label>
                        <input id="email" type="email" className={styles.adminInput} placeholder="sponsor@company.com" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} required />
                      </div>
                      <div className={styles.adminInputGroup}>
                        <label className={styles.itemCategory} htmlFor="projectName">Project Title *</label>
                        <input id="projectName" type="text" className={styles.adminInput} placeholder="e.g. Deepwater Terminal Expansion" value={inviteForm.projectName} onChange={(e) => setInviteForm({ ...inviteForm, projectName: e.target.value })} required />
                      </div>
                      <div className={styles.adminInputGroup}>
                        <label className={styles.itemCategory} htmlFor="facilityAmount">Target Facility</label>
                        <input id="facilityAmount" type="text" className={styles.adminInput} placeholder="$50,000,000 USD" value={inviteForm.facilityAmount} onChange={(e) => setInviteForm({ ...inviteForm, facilityAmount: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className={styles.adminSaveBtn} style={{ alignSelf: 'flex-start' }}>
                      Generate & Send Principal Invitation
                    </button>
                  </form>
                  {latestInvite && (
                    <div className={styles.inviteResultBanner}>
                      <div>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block' }}>Active Invitation Link for {latestInvite.sponsorName}:</span>
                        <span className={styles.copyBadge}>{latestInvite.inviteUrl}</span>
                      </div>
                      <button type="button" onClick={copyInviteLink} className={styles.copyBtn}>
                        {copiedLink ? '✓ Copied Link!' : 'Copy Full Invitation Link'}
                      </button>
                    </div>
                  )}
                  <div>
                    <h3 className={styles.itemTitle} style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Invited Sponsors Pipeline</h3>
                    <table className={styles.pipelineTable}>
                      <thead>
                        <tr><th>Sponsor Entity</th><th>Project Title</th><th>Target Facility</th><th>Invite Code</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {pipeline.map((item, idx) => (
                          <tr key={idx}>
                            <td><strong>{item.sponsorName}</strong><br /><span style={{ opacity: 0.6, fontSize: '0.78rem' }}>{item.email}</span></td>
                            <td>{item.projectName}</td>
                            <td>{item.facilityAmount}</td>
                            <td><code style={{ color: 'var(--gold)' }}>{item.inviteCode}</code></td>
                            <td><span className={`${styles.statusBadge} ${item.status.includes('Active') ? styles.statusVerified : styles.statusAudit}`}>{item.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Capital Raise Offer */}
              <div className={styles.offerCard}>
                <div className={styles.offerHeader}>
                  <div>
                    <span className={styles.itemCategory}>Capital Raise Structure & Terms</span>
                    <h2 className={styles.offerTitle}>Eagle Holdings Advisory Offer & Term Sheet</h2>
                    <p className={styles.offerSubtitle}>
                      {userRole === 'admin'
                        ? 'Backend Offer Term Sheet Control — Adjust advisory terms displayed to the sponsor.'
                        : 'Review current term sheet parameters and submit structural feedback or counter-proposals.'}
                    </p>
                  </div>
                </div>
                <div className={styles.termsGrid}>
                  <div className={styles.termItem}><span className={styles.termLabel}>Target Capital Facility</span><span className={styles.termVal}>{offerTerms.targetCapital}</span></div>
                  <div className={styles.termItem}><span className={styles.termLabel}>Preferred Return Yield</span><span className={styles.termVal}>{offerTerms.preferredTerms}</span></div>
                  <div className={styles.termItem}><span className={styles.termLabel}>Senior Debt LTV</span><span className={styles.termVal}>{offerTerms.ltvRatio}</span></div>
                  <div className={styles.termItem}><span className={styles.termLabel}>Advisory Term</span><span className={styles.termVal}>{offerTerms.advisoryTerm}</span></div>
                </div>
                {userRole === 'admin' && principalSession?.role === 'ADMIN' ? (
                  <form className={styles.adminTermsForm} onSubmit={handleAdminTermsSave}>
                    <div className={styles.adminInputGroup}><label className={styles.itemCategory} htmlFor="targetCapital">Target Capital</label><input id="targetCapital" type="text" className={styles.adminInput} value={offerTerms.targetCapital} onChange={(e) => setOfferTerms({ ...offerTerms, targetCapital: e.target.value })} /></div>
                    <div className={styles.adminInputGroup}><label className={styles.itemCategory} htmlFor="preferredTerms">Preferred Yield</label><input id="preferredTerms" type="text" className={styles.adminInput} value={offerTerms.preferredTerms} onChange={(e) => setOfferTerms({ ...offerTerms, preferredTerms: e.target.value })} /></div>
                    <div className={styles.adminInputGroup}><label className={styles.itemCategory} htmlFor="ltvRatio">Debt LTV</label><input id="ltvRatio" type="text" className={styles.adminInput} value={offerTerms.ltvRatio} onChange={(e) => setOfferTerms({ ...offerTerms, ltvRatio: e.target.value })} /></div>
                    <button type="submit" className={styles.adminSaveBtn}>Update Offer Terms</button>
                  </form>
                ) : (
                  <>
                    {feedbackStatus === 'success' ? (
                      <div className={styles.successFeedbackAlert}>✓ Feedback successfully delivered to the Investment Committee! Receipt Reference: <strong>{feedbackReceipt}</strong>.</div>
                    ) : (
                      <form className={styles.feedbackForm} onSubmit={handleFeedbackSubmit}>
                        <label className={styles.itemCategory} htmlFor="feedbackText">Sponsor Feedback & Term Sheet Queries</label>
                        <textarea id="feedbackText" name="feedbackText" placeholder="Provide your feedback regarding the capital raise facility, preferred yield terms, draw schedule, or compliance items..." className={styles.textarea} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} required />
                        <button type="submit" className={styles.submitBtn} disabled={feedbackStatus === 'submitting'}>
                          {feedbackStatus === 'submitting' ? 'Delivering Feedback...' : 'Submit Capital Raise Feedback'}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─────────── DATA SUBMISSION VIEW ─────────── */}
          {activeView === 'submission' && (
            <div className={styles.viewSection}>
              <div style={{ borderBottom: '1px solid var(--border-faint)', paddingBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--foreground)', marginBottom: '8px' }}>File & Data Submission Dropzone</h2>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                  Upload each document and click <strong>Submit to Data Room</strong>. Submitted documents appear in your Virtual Data Room for cross-checking.
                </p>
              </div>

              <div className={userRole === 'principal' && !principalSession ? styles.blurredContainer : ''}>
                {userRole === 'principal' && !principalSession && (
                  <div className={styles.blurOverlay}>
                    <div className={styles.overlayLockIcon}>🔒</div>
                    <h3 className={styles.overlayTitle}>Authentication Required to Access Dropzone</h3>
                    <p className={styles.overlayText}>Detailed compliance intake checklists and submission dropzones are restricted to verified project principals.</p>
                    <button onClick={() => router.push('/login?type=principal')} className={styles.blurLoginBtn}>
                      Authenticate to Access Principal Workspace
                    </button>
                  </div>
                )}
                <div className={`${styles.checklistGrid} ${userRole === 'principal' && !principalSession ? styles.blurredGrid : ''}`}>
                  {actionChecklist.length > 0
                    ? actionChecklist.map(item => renderChecklistItem(item))
                    : (
                      <div className={styles.emptyState}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✓</div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>All Documents Submitted</h3>
                        <p>No pending action items. Check your Data Room to review submissions.</p>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )}

          {/* ─────────── DATA ROOM VIEW ─────────── */}
          {activeView === 'dataroom' && (
            <div className={styles.viewSection}>
              <div style={{ borderBottom: '1px solid var(--border-faint)', paddingBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--foreground)', marginBottom: '8px' }}>Virtual Data Room</h2>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                  View-only repository of all submitted compliance documents. Click any document to open the embedded viewer and cross-check your submissions.
                </p>
              </div>

              {/* Data Room sub-tabs */}
              <div className={styles.tabGroup}>
                <button className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`} onClick={() => setActiveTab('all')}>
                  All Items ({checklist.length})
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'entity' ? styles.activeTab : ''}`} onClick={() => setActiveTab('entity')}>
                  Entity & KYC ({checklist.filter(i => i.category === 'entity').length})
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'project' ? styles.activeTab : ''}`} onClick={() => setActiveTab('project')}>
                  Technical & Permits ({checklist.filter(i => i.category === 'project').length})
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'financial' ? styles.activeTab : ''}`} onClick={() => setActiveTab('financial')}>
                  Financial & Legal ({checklist.filter(i => i.category === 'financial').length})
                </button>
              </div>

              <div className={userRole === 'principal' && !principalSession ? styles.blurredContainer : ''}>
                {userRole === 'principal' && !principalSession && (
                  <div className={styles.blurOverlay}>
                    <div className={styles.overlayLockIcon}>🔒</div>
                    <h3 className={styles.overlayTitle}>Authentication Required to Access Data Room</h3>
                    <p className={styles.overlayText}>Detailed compliance intake checklists, technical specifications, and Virtual Data Room dropzones are restricted to verified project principals.</p>
                    <button onClick={() => router.push('/login?type=principal')} className={styles.blurLoginBtn}>
                      Authenticate to Access Principal Workspace
                    </button>
                  </div>
                )}

                {/* Submitted documents gallery */}
                {dataRoomDocs.length > 0 && (
                  <div>
                    <h3 className={styles.vdrSectionTitle}>
                      📁 Your Submitted Documents
                      <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '10px', fontWeight: 400 }}>Click to open embedded viewer</span>
                    </h3>
                    <div className={styles.vdrGallery}>
                      {dataRoomDocs
                        .filter(doc => activeTab === 'all' || doc.category === activeTab)
                        .map(doc => renderDataRoomCard(doc))}
                    </div>
                  </div>
                )}

                {/* Full checklist index */}
                <div>
                  <h3 className={styles.vdrSectionTitle}>📋 Complete Compliance Index</h3>
                  <div className={`${styles.checklistGrid} ${userRole === 'principal' && !principalSession ? styles.blurredGrid : ''}`} style={{ marginTop: '16px' }}>
                    {filteredChecklist.map(item => renderChecklistItem(item))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Document Viewer Modal */}
      {viewingDoc && <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </>
  );
}
