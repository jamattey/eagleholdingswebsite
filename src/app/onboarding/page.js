'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const initialChecklist = [
  // ─── Entity & Principal Compliance ───
  {
    id: 'item-01',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Personal KYC & Passport Verification',
    description: 'Notarized government ID and proof of residence for all project principals and directors.',
    status: 'Verified',
    ref: 'DOC-KYC-991',
  },
  {
    id: 'item-02',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Ultimate Beneficial Owner (UBO) Disclosures',
    description: 'Corporate ownership breakdown certifying all beneficiaries meeting the applicable threshold.',
    status: 'Verified',
    ref: 'DOC-UBO-402',
  },
  {
    id: 'item-03',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Politically Exposed Person (PEP) Declarations',
    description: 'PEP declarations for all directors, signatories, and equity-investor UBOs.',
    status: 'Pending Upload',
    ref: 'DOC-PEP-REQ',
  },
  {
    id: 'item-04',
    category: 'entity',
    categoryLabel: 'Entity & Principal KYC',
    title: 'Mandatory Corporate Verification Documents',
    description: 'Certificate of Incorporation, M&A, Register of Directors, and recent Audited Financials.',
    status: 'Under Audit',
    ref: 'DOC-CORP-112',
  },

  // ─── Project Technical & Permits ───
  {
    id: 'item-05',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Architectural, Structural & MEP Drawings',
    description: 'Approved master plan, elevation drawings, structural blueprints, and stamped MEP schematics.',
    status: 'Verified',
    ref: 'DOC-ARCH-882',
  },
  {
    id: 'item-06',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Ghana Regulatory & Land Title Documentation',
    description: 'Land lease/title registration (Lands Commission), GIPC Certificate, and Ghana Tourism Authority license.',
    status: 'Pending Upload',
    ref: 'DOC-LAND-REQ',
  },
  {
    id: 'item-07',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Environmental & Social Impact Assessment (ESIA)',
    description: 'EPA environmental permit and ESIA approval aligned with Equator Principles/IFC Standards.',
    status: 'Action Required',
    ref: 'DOC-ESIA-PENDING',
  },
  {
    id: 'item-08',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Geotechnical & Soil Test Reports',
    description: 'Certified soil borings, foundation analysis, and seismic hazard assessments.',
    status: 'Under Audit',
    ref: 'DOC-SOIL-304',
  },

  // ─── Financial & Legal Contracts ───
  {
    id: 'item-09',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Corporate Banking Credentials & CIS',
    description: 'Client Information Sheet (CIS) and bank reference letter dated within 30 days.',
    status: 'Under Audit',
    ref: 'DOC-CIS-108',
  },
  {
    id: 'item-10',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Source of Funds & Equity Proof',
    description: 'Evidence of sponsor equity contribution, source of wealth, and finalized financial model.',
    status: 'Action Required',
    ref: 'DOC-SOF-PENDING',
  },
  {
    id: 'item-11',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Executed EPC / Construction Contract',
    description: 'Finalized Engineering, Procurement & Construction contract with the primary contractor.',
    status: 'Pending Upload',
    ref: 'DOC-EPC-REQ',
  },
  {
    id: 'item-12',
    category: 'financial',
    categoryLabel: 'Financial & Legal Compliance',
    title: 'Hotel Management or Franchise Agreement',
    description: 'Executed management contract or franchise agreement with the designated hotel operator.',
    status: 'Pending Upload',
    ref: 'DOC-HMA-REQ',
  }
];

const initialPipeline = [
  {
    inviteCode: 'INV-882104',
    sponsorName: 'Metro Civil Infrastructure Group',
    email: 'contact@metro-civil.com',
    projectName: 'High-Density Mobility Hub Phase I',
    facilityAmount: '$50,000,000 USD',
    invitedAt: '2026-08-01 14:30',
    status: 'Registered & Active',
  },
  {
    inviteCode: 'INV-401923',
    sponsorName: 'Pacific Rim Energy Developers',
    email: 'capital@pacific-energy.org',
    projectName: 'Regional Deepwater Civil Asset',
    facilityAmount: '$75,000,000 USD',
    invitedAt: '2026-08-02 09:15',
    status: 'Pending Registration',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('principal'); // 'principal' | 'admin'
  const [principalSession, setPrincipalSession] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [checklist, setChecklist] = useState(initialChecklist);
  const [uploadNotice, setUploadNotice] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [feedbackReceipt, setFeedbackReceipt] = useState('');

  // Admin offer terms state
  const [offerTerms, setOfferTerms] = useState({
    targetCapital: '$50,000,000 USD',
    preferredTerms: '8.5% p.a.',
    ltvRatio: '65.0% LTV',
    advisoryTerm: '36 Months',
  });
  const [adminNotice, setAdminNotice] = useState('');

  // Admin invite principal state
  const [inviteForm, setInviteForm] = useState({
    sponsorName: '',
    email: '',
    projectName: '',
    facilityAmount: '$50,000,000 USD',
  });
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
          if (data.session.role === 'ADMIN') {
            setUserRole('admin');
          }
        } else {
          setPrincipalSession(null);
        }
      } catch {
        setPrincipalSession(null);
      }
    }
    checkZeroTrustSession();
  }, []);

  // Calculate compliance progress percentage
  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.status === 'Verified').length;
  const auditItems = checklist.filter((item) => item.status === 'Under Audit').length;
  const progressPercent = Math.round(((completedItems + auditItems * 0.5) / totalItems) * 100);

  const filteredChecklist = checklist.filter((item) => {
    if (activeTab === 'entity') return item.category === 'entity';
    if (activeTab === 'project') return item.category === 'project';
    if (activeTab === 'financial') return item.category === 'financial';
    return true;
  });

  // Principal file upload
  const handleFileUpload = async (e, itemId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_document',
          itemId,
          documentName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setChecklist((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, status: 'Under Audit', ref: data.auditReference || 'DOC-AUDIT-SUBMITTED' }
              : item
          )
        );
        setUploadNotice(`Document "${file.name}" uploaded to Virtual Data Room. Reference: ${data.auditReference}`);
        setTimeout(() => setUploadNotice(''), 6000);
      }
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  // Principal feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackStatus('submitting');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          feedbackText,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedbackStatus('success');
        setFeedbackReceipt(data.receiptId);
        setFeedbackText('');
      } else {
        setFeedbackStatus('error');
      }
    } catch (err) {
      setFeedbackStatus('error');
    }
  };

  // Admin status update action
  const handleAdminStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_update_status',
          itemId,
          newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setChecklist((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
        );
        setAdminNotice(`Audit status for item ${itemId} set to "${newStatus}".`);
        setTimeout(() => setAdminNotice(''), 5000);
      }
    } catch (err) {
      console.error('Admin status change error:', err);
    }
  };

  // Admin offer terms update
  const handleAdminTermsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_update_terms',
          ...offerTerms,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAdminNotice('Capital raise offer terms updated successfully.');
        setTimeout(() => setAdminNotice(''), 5000);
      }
    } catch (err) {
      console.error('Admin terms update error:', err);
    }
  };

  // Admin invite principal submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.sponsorName || !inviteForm.email || !inviteForm.projectName) return;

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite_principal',
          ...inviteForm,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const inv = data.invitation;
        setLatestInvite(inv);
        setPipeline((prev) => [inv, ...prev]);
        setInviteForm({
          sponsorName: '',
          email: '',
          projectName: '',
          facilityAmount: '$50,000,000 USD',
        });
        setAdminNotice(`Invitation link generated for ${inv.sponsorName}. Email dispatched to ${inv.email}.`);
        setTimeout(() => setAdminNotice(''), 6000);
      }
    } catch (err) {
      console.error('Invite principal error:', err);
    }
  };

  const copyInviteLink = () => {
    if (!latestInvite) return;
    const fullUrl = `${window.location.origin}${latestInvite.inviteUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 4000);
  };

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main className={styles.main}>

        {/* ─── Hero / Header ─── */}
        <header className={styles.heroStrip}>
          <div className={styles.bgGrid}></div>
          <div className={styles.heroContent}>

            <div className={styles.topRow}>
              <div className={styles.badge}>
                <span className={styles.badgeDot}></span>
                {userRole === 'admin' ? 'Eagle Holdings Backend Command Center' : 'Secure Principal Data Room'}
              </div>

              {/* Role Switcher - Only visible to ADMIN */}
              {principalSession?.role === 'ADMIN' && (
                <div className={styles.roleSwitcher}>
                  <button 
                    className={`${styles.roleBtn} ${userRole === 'principal' ? styles.activeRole : ''}`}
                    onClick={() => setUserRole('principal')}
                  >
                    Principal View
                  </button>
                  <button 
                    className={`${styles.roleBtn} ${userRole === 'admin' ? styles.activeRole : ''}`}
                    onClick={() => setUserRole('admin')}
                  >
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

            {/* Overall Compliance Progress Meter */}
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

        {/* ─── Main Content Container ─── */}
        <div className={styles.container}>

          {uploadNotice && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(168, 140, 58, 0.15)',
              border: '1px solid var(--gold)',
              borderRadius: '4px',
              color: 'var(--foreground)',
              fontSize: '0.9rem',
            }}>
              ✓ {uploadNotice}
            </div>
          )}

          {adminNotice && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(46, 204, 113, 0.15)',
              border: '1px solid #2ecc71',
              borderRadius: '4px',
              color: '#2ecc71',
              fontSize: '0.9rem',
            }}>
              🛡️ {adminNotice}
            </div>
          )}

          {/* Prompt if in Principal Mode without explicit login session */}
          {userRole === 'principal' && !principalSession && (
            <div style={{
              padding: '16px 22px',
              background: 'rgba(168, 140, 58, 0.08)',
              border: '1px dashed var(--gold)',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div>
                <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Project Principal Login Recommended</strong>
                <span style={{ fontSize: '0.88rem', opacity: 0.8 }}>Log in with your sponsor credentials to access your saved project data room and custom term sheets.</span>
              </div>
              <button 
                onClick={() => router.push('/login?type=principal')}
                className={styles.loginBtn}
              >
                Login as Principal to Access
              </button>
            </div>
          )}

          {/* ─── Admin Feature: Invite Principal & Sponsor ─── */}
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
                    <input 
                      id="sponsorName"
                      type="text"
                      className={styles.adminInput}
                      placeholder="e.g. Apex Civil Infrastructure"
                      value={inviteForm.sponsorName}
                      onChange={(e) => setInviteForm({ ...inviteForm, sponsorName: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.adminInputGroup}>
                    <label className={styles.itemCategory} htmlFor="email">Corporate Email *</label>
                    <input 
                      id="email"
                      type="email"
                      className={styles.adminInput}
                      placeholder="sponsor@company.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.adminInputGroup}>
                    <label className={styles.itemCategory} htmlFor="projectName">Project Title *</label>
                    <input 
                      id="projectName"
                      type="text"
                      className={styles.adminInput}
                      placeholder="e.g. Deepwater Terminal Expansion"
                      value={inviteForm.projectName}
                      onChange={(e) => setInviteForm({ ...inviteForm, projectName: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.adminInputGroup}>
                    <label className={styles.itemCategory} htmlFor="facilityAmount">Target Facility</label>
                    <input 
                      id="facilityAmount"
                      type="text"
                      className={styles.adminInput}
                      placeholder="$50,000,000 USD"
                      value={inviteForm.facilityAmount}
                      onChange={(e) => setInviteForm({ ...inviteForm, facilityAmount: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.adminSaveBtn} style={{ alignSelf: 'flex-start' }}>
                  Generate & Send Principal Invitation
                </button>
              </form>

              {/* Generated Invite Link Banner */}
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

              {/* Invited Pipeline Table */}
              <div>
                <h3 className={styles.itemTitle} style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Invited Sponsors Pipeline</h3>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Sponsor Entity</th>
                      <th>Project Title</th>
                      <th>Target Facility</th>
                      <th>Invite Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipeline.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.sponsorName}</strong><br /><span style={{ opacity: 0.6, fontSize: '0.78rem' }}>{item.email}</span></td>
                        <td>{item.projectName}</td>
                        <td>{item.facilityAmount}</td>
                        <td><code style={{ color: 'var(--gold)' }}>{item.inviteCode}</code></td>
                        <td>
                          <span className={`
                            ${styles.statusBadge} 
                            ${item.status.includes('Active') ? styles.statusVerified : styles.statusAudit}
                          `}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Checklist Tabs */}
          <div>
            <div className={styles.tabGroup}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Checklist Items ({checklist.length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'entity' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('entity')}
              >
                Entity & Principal KYC ({checklist.filter(i => i.category === 'entity').length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'project' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('project')}
              >
                Technical & Permits ({checklist.filter(i => i.category === 'project').length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'financial' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('financial')}
              >
                Financial & Legal ({checklist.filter(i => i.category === 'financial').length})
              </button>
            </div>

            {/* Checklist Items Grid (Blurry for unauthenticated visitors) */}
            <div className={userRole === 'principal' && !principalSession ? styles.blurredContainer : ''}>
              {userRole === 'principal' && !principalSession && (
                <div className={styles.blurOverlay}>
                  <div className={styles.overlayLockIcon}>🔒</div>
                  <h3 className={styles.overlayTitle}>Authentication Required to Access Data Room</h3>
                  <p className={styles.overlayText}>
                    Detailed compliance intake checklists, technical specifications, and Virtual Data Room dropzones are restricted to verified project principals.
                  </p>
                  <button 
                    onClick={() => router.push('/login?type=principal')}
                    className={styles.blurLoginBtn}
                  >
                    Authenticate to Access Principal Workspace
                  </button>
                </div>
              )}

              <div className={`${styles.checklistGrid} ${userRole === 'principal' && !principalSession ? styles.blurredGrid : ''}`} style={{ marginTop: '30px' }}>
                {filteredChecklist.map((item) => (
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
                        `}>
                          {item.status}
                        </span>
                      </div>
                      <p className={styles.itemDescription}>{item.description}</p>
                    </div>

                    <div className={styles.itemFooter}>
                      <span className={styles.docRef}>Ref: {item.ref}</span>

                      {/* Role-Based Item Footer Controls */}
                      {userRole === 'admin' && principalSession?.role === 'ADMIN' ? (
                        <div className={styles.adminControls}>
                          <button 
                            onClick={() => handleAdminStatusChange(item.id, 'Verified')}
                            className={styles.adminApproveBtn}
                          >
                            Approve ✓
                          </button>
                          <button 
                            onClick={() => handleAdminStatusChange(item.id, 'Action Required')}
                            className={styles.adminActionBtn}
                          >
                            Flag Action ⚠️
                          </button>
                        </div>
                      ) : (
                        <label className={styles.uploadLabel}>
                          <span>{item.status === 'Verified' ? 'Re-upload' : 'Upload Document'}</span>
                          <input 
                            type="file" 
                            className={styles.hiddenInput}
                            onChange={(e) => handleFileUpload(e, item.id)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Capital Raise Offer & Term Sheet Section ─── */}
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

            {/* Terms Summary Grid */}
            <div className={styles.termsGrid}>
              <div className={styles.termItem}>
                <span className={styles.termLabel}>Target Capital Facility</span>
                <span className={styles.termVal}>{offerTerms.targetCapital}</span>
              </div>
              <div className={styles.termItem}>
                <span className={styles.termLabel}>Preferred Return Yield</span>
                <span className={styles.termVal}>{offerTerms.preferredTerms}</span>
              </div>
              <div className={styles.termItem}>
                <span className={styles.termLabel}>Senior Debt LTV</span>
                <span className={styles.termVal}>{offerTerms.ltvRatio}</span>
              </div>
              <div className={styles.termItem}>
                <span className={styles.termLabel}>Advisory Term</span>
                <span className={styles.termVal}>{offerTerms.advisoryTerm}</span>
              </div>
            </div>

            {/* Role-Based Offer Section: Admin Editor vs Principal Feedback Form */}
            {userRole === 'admin' && principalSession?.role === 'ADMIN' ? (
              <form className={styles.adminTermsForm} onSubmit={handleAdminTermsSave}>
                <div className={styles.adminInputGroup}>
                  <label className={styles.itemCategory} htmlFor="targetCapital">Target Capital</label>
                  <input 
                    id="targetCapital"
                    type="text" 
                    className={styles.adminInput}
                    value={offerTerms.targetCapital}
                    onChange={(e) => setOfferTerms({ ...offerTerms, targetCapital: e.target.value })}
                  />
                </div>
                <div className={styles.adminInputGroup}>
                  <label className={styles.itemCategory} htmlFor="preferredTerms">Preferred Yield</label>
                  <input 
                    id="preferredTerms"
                    type="text" 
                    className={styles.adminInput}
                    value={offerTerms.preferredTerms}
                    onChange={(e) => setOfferTerms({ ...offerTerms, preferredTerms: e.target.value })}
                  />
                </div>
                <div className={styles.adminInputGroup}>
                  <label className={styles.itemCategory} htmlFor="ltvRatio">Debt LTV</label>
                  <input 
                    id="ltvRatio"
                    type="text" 
                    className={styles.adminInput}
                    value={offerTerms.ltvRatio}
                    onChange={(e) => setOfferTerms({ ...offerTerms, ltvRatio: e.target.value })}
                  />
                </div>
                <button type="submit" className={styles.adminSaveBtn}>
                  Update Offer Terms
                </button>
              </form>
            ) : (
              <>
                {feedbackStatus === 'success' ? (
                  <div className={styles.successFeedbackAlert}>
                    ✓ Feedback successfully delivered to the Investment Committee! Receipt Reference: <strong>{feedbackReceipt}</strong>.
                  </div>
                ) : (
                  <form className={styles.feedbackForm} onSubmit={handleFeedbackSubmit}>
                    <label className={styles.itemCategory} htmlFor="feedbackText">Sponsor Feedback & Term Sheet Queries</label>
                    <textarea 
                      id="feedbackText"
                      name="feedbackText"
                      placeholder="Provide your feedback regarding the capital raise facility, preferred yield terms, draw schedule, or compliance items..."
                      className={styles.textarea}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      required
                    />
                    <button 
                      type="submit" 
                      className={styles.submitBtn}
                      disabled={feedbackStatus === 'submitting'}
                    >
                      {feedbackStatus === 'submitting' ? 'Delivering Feedback...' : 'Submit Capital Raise Feedback'}
                    </button>
                  </form>
                )}
              </>
            )}

          </div>

        </div>

      </main>
      <Footer />
    </>
  );
}
