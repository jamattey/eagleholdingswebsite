'use client';

import { useState } from 'react';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const initialChecklist = [
  // Category 1: Entity & Principal Compliance
  {
    id: 'item-01',
    category: 'entity',
    categoryLabel: 'Entity Compliance',
    title: 'Personal KYC & Passport Verification',
    description: 'Notarized government ID and proof of residence for all project principals.',
    status: 'Verified',
    ref: 'DOC-KYC-991',
  },
  {
    id: 'item-02',
    category: 'entity',
    categoryLabel: 'Entity Compliance',
    title: 'Ultimate Beneficial Owner (UBO) Disclosures',
    description: 'Corporate ownership breakdown certifying all beneficiaries with >10% equity.',
    status: 'Verified',
    ref: 'DOC-UBO-402',
  },
  {
    id: 'item-03',
    category: 'entity',
    categoryLabel: 'Entity Compliance',
    title: 'Corporate Banking Credentials & CIS',
    description: 'Client Information Sheet (CIS) and bank reference letter dated within 30 days.',
    status: 'Under Audit',
    ref: 'DOC-CIS-108',
  },
  {
    id: 'item-04',
    category: 'entity',
    categoryLabel: 'Entity Compliance',
    title: 'Proof of Equity & Source of Funds',
    description: 'Audited financial statements or bank confirmation of sponsor capital contribution.',
    status: 'Action Required',
    ref: 'DOC-SOF-PENDING',
  },

  // Category 2: Project Technical Compliance
  {
    id: 'item-05',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Architectural & Structural Drawings',
    description: 'Approved master plan, elevation drawings, and certified structural blueprints.',
    status: 'Verified',
    ref: 'DOC-ARCH-882',
  },
  {
    id: 'item-06',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Mechanical, Electrical, & Plumbing (MEP) Plans',
    description: 'Stamped engineering MEP schematics, load calculations, and utility connections.',
    status: 'Under Audit',
    ref: 'DOC-MEP-304',
  },
  {
    id: 'item-07',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Geotechnical & Soil Test Reports',
    description: 'Certified soil borings, foundation analysis, and seismic hazard assessments.',
    status: 'Pending Upload',
    ref: 'DOC-SOIL-REQUIRED',
  },
  {
    id: 'item-08',
    category: 'project',
    categoryLabel: 'Project Technical Compliance',
    title: 'Environmental & Municipal Building Permits',
    description: 'Zoning approvals, Environmental Impact Statement (EIS), and construction permits.',
    status: 'Pending Upload',
    ref: 'DOC-PERMIT-REQUIRED',
  },
];

export default function OnboardingPage() {
  const [userRole, setUserRole] = useState('principal'); // 'principal' | 'admin'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'entity' | 'project'
  const [checklist, setChecklist] = useState(initialChecklist);
  const [uploadNotice, setUploadNotice] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [feedbackReceipt, setFeedbackReceipt] = useState('');
  
  // Offer terms state (editable by Admin)
  const [offerTerms, setOfferTerms] = useState({
    targetCapital: '$50,000,000 USD',
    preferredTerms: '8.5% p.a.',
    ltvRatio: '65.0% LTV',
    advisoryTerm: '36 Months',
  });
  const [adminNotice, setAdminNotice] = useState('');

  // Calculate compliance progress percentage
  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.status === 'Verified').length;
  const auditItems = checklist.filter((item) => item.status === 'Under Audit').length;
  const progressPercent = Math.round(((completedItems + auditItems * 0.5) / totalItems) * 100);

  const filteredChecklist = checklist.filter((item) => {
    if (activeTab === 'entity') return item.category === 'entity';
    if (activeTab === 'project') return item.category === 'project';
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

              {/* Role Switcher */}
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
            </div>

            <h1 className={styles.pageTitle}>
              {userRole === 'admin' ? 'Deal Audit & Command Portal' : 'Project Onboarding & Intake Portal'}
            </h1>
            <p className={styles.pageSubtitle}>
              {userRole === 'admin' 
                ? 'Backend deal review interface for Eagle Holdings advisors to audit sponsor compliance submissions, approve Data Room credentials, and adjust capital raise offer terms.'
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
                Entity & Principal Compliance ({checklist.filter(i => i.category === 'entity').length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'project' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('project')}
              >
                Project Technical & Permits ({checklist.filter(i => i.category === 'project').length})
              </button>
            </div>

            {/* Checklist Items Grid */}
            <div className={styles.checklistGrid} style={{ marginTop: '30px' }}>
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
                    {userRole === 'admin' ? (
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
            {userRole === 'admin' ? (
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
