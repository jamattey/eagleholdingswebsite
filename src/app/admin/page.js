'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

// ─── Initial Admin Sample Datasets ───────────────────────────────────────────
const initialDeals = [
  { dealReference: 'DEAL-SPONSOR-991', partnerName: 'Metro Civil Infrastructure Group', vdrReference: 'DOC-KYC-991', documentTitle: 'Personal KYC & Passport Verification', facilityAmount: '$50,000,000 USD', submittedAt: '2026-07-28T10:00:00Z', status: 'Approved' },
  { dealReference: 'DEAL-SPONSOR-402', partnerName: 'Pacific Rim Energy Developers', vdrReference: 'DOC-UBO-402', documentTitle: 'Ultimate Beneficial Owner (UBO) Disclosures', facilityAmount: '$75,000,000 USD', submittedAt: '2026-07-29T14:30:00Z', status: 'Approved' },
  { dealReference: 'DEAL-SPONSOR-112', partnerName: 'Atlantic Deepwater Logistics', vdrReference: 'DOC-CORP-112', documentTitle: 'Mandatory Corporate Verification Documents', facilityAmount: '$120,000,000 USD', submittedAt: '2026-08-01T09:15:00Z', status: 'In Review' },
  { dealReference: 'DEAL-SPONSOR-011', partnerName: 'Sub-Saharan Rail Mobility', vdrReference: 'DOC-TECH-011', documentTitle: 'Environmental & Social Impact Assessment (ESIA)', facilityAmount: '$180,000,000 USD', submittedAt: '2026-08-01T16:45:00Z', status: 'Action Required' },
  { dealReference: 'DEAL-SPONSOR-108', partnerName: 'Lagos Smart Port Development', vdrReference: 'DOC-CIS-108', documentTitle: 'Corporate Banking Credentials & CIS', facilityAmount: '$100,000,000 USD', submittedAt: '2026-08-02T11:20:00Z', status: 'In Review' },
];

const initialPartnerBriefings = [
  { id: 'brf-101', ref: 'BRF-Q3-STRAT', title: 'Q3 2026 Global Infrastructure & Energy Briefing', category: 'Strategic Briefing', fileName: 'Q3_2026_Eagle_Holdings_Strategic_Briefing.pdf', uploadedAt: '2026-07-25', status: 'Published to Partner Portal' },
  { id: 'brf-102', ref: 'BRF-DEEP-VAL', title: 'Deepwater Terminal Valuation & Asset Analysis', category: 'Valuation & Advisory', fileName: 'Deepwater_Asset_Valuation_Model_v4.pdf', uploadedAt: '2026-07-30', status: 'Published to Partner Portal' },
  { id: 'brf-103', ref: 'BRF-ESG-AUD', title: 'ESG & Environmental Clearance Audit Framework', category: 'Compliance Audit', fileName: 'ESG_Compliance_Audit_Framework_2026.pdf', uploadedAt: '2026-08-01', status: 'Published to Partner Portal' },
];

const initialInvitedPartners = [
  { inviteCode: 'INV-882104', partnerName: 'Metro Civil Infrastructure Group', email: 'contact@metro-civil.com', projectName: 'High-Density Mobility Hub Phase I', facilityAmount: '$50,000,000 USD', invitedAt: '2026-08-01 14:30', status: 'Registered & Active' },
  { inviteCode: 'INV-401923', partnerName: 'Pacific Rim Energy Developers', email: 'capital@pacific-energy.org', projectName: 'Regional Deepwater Civil Asset', facilityAmount: '$75,000,000 USD', invitedAt: '2026-08-02 09:15', status: 'Pending Registration' },
];

const initialSecurityLogs = [
  { id: 'sec-1', event: 'PRINCIPAL_AUTH_SUCCESSFUL', ip: '197.210.64.12', timestamp: '2026-08-03T00:35:10Z', status: 'Passed' },
  { id: 'sec-2', event: 'VDR_DOCUMENT_UPLOAD', ip: '102.176.45.88', timestamp: '2026-08-03T00:22:45Z', status: 'Audited' },
  { id: 'sec-3', event: 'ADMIN_TERMS_UPDATE', ip: '127.0.0.1', timestamp: '2026-08-02T23:50:00Z', status: 'Executed' },
  { id: 'sec-4', event: 'RATE_LIMIT_CHECK', ip: '197.210.64.12', timestamp: '2026-08-02T23:10:15Z', status: 'Passed' },
  { id: 'sec-5', event: 'AUTH_LOGOUT', ip: '102.176.45.88', timestamp: '2026-08-02T22:40:00Z', status: 'Completed' },
];

export default function AdminPortalPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Command view state: 'overview' | 'deals' | 'vdr' | 'briefings' | 'invites' | 'terms' | 'security'
  const [activeTab, setActiveTab] = useState('overview');

  const [deals, setDeals] = useState(initialDeals);
  const [partnerBriefings, setPartnerBriefings] = useState(initialPartnerBriefings);
  const [invitedPartners, setInvitedPartners] = useState(initialInvitedPartners);
  const [securityLogs, setSecurityLogs] = useState(initialSecurityLogs);
  const [notice, setNotice] = useState('');

  // Upload Partner Briefing Form State
  const [briefingForm, setBriefingForm] = useState({
    title: '',
    category: 'Strategic Briefing',
    fileName: '',
    taggedDealRef: '',
  });

  // Invite Partner Form State
  const [inviteForm, setInviteForm] = useState({
    partnerName: '',
    email: '',
    projectName: '',
    facilityAmount: '$50,000,000 USD',
  });
  const [latestInvite, setLatestInvite] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Offer terms state
  const [offerTerms, setOfferTerms] = useState({
    targetCapital: '$50,000,000 USD',
    preferredTerms: '8.5% p.a.',
    ltvRatio: '65.0% LTV',
    advisoryTerm: '36 Months',
  });

  useEffect(() => {
    async function checkAdminSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.session && data.session.role === 'ADMIN') {
          setAdminSession(data.session);
        } else {
          setAdminSession(null);
        }
      } catch {
        setAdminSession(null);
      } finally {
        setLoadingSession(false);
      }
    }
    checkAdminSession();
  }, []);

  // ─── UPLOAD PARTNER BRIEFING TO PARTNER DASHBOARD ──────────────────────────
  const handleBriefingUpload = async (e) => {
    e.preventDefault();
    if (!briefingForm.title || !briefingForm.fileName) return;

    const matchedDeal = deals.find(d => d.dealReference === briefingForm.taggedDealRef);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_partner_briefing',
          briefingTitle: briefingForm.title,
          briefingCategory: briefingForm.category,
          briefingFileName: briefingForm.fileName,
          taggedDealRef: briefingForm.taggedDealRef || null,
          taggedDealName: matchedDeal ? `${matchedDeal.partnerName} (${matchedDeal.documentTitle})` : null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPartnerBriefings(prev => [data.briefing, ...prev]);
        setBriefingForm({ title: '', category: 'Strategic Briefing', fileName: '', taggedDealRef: '' });
        setNotice(`Partner briefing "${data.briefing.title}" uploaded and published to Partner Portal.`);
        setTimeout(() => setNotice(''), 6000);
      }
    } catch (err) {
      console.error('Briefing upload error:', err);
    }
  };

  // ─── INVITE PARTNER ────────────────────────────────────────────────────────
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.partnerName || !inviteForm.email || !inviteForm.projectName) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite_sponsor',
          sponsorName: inviteForm.partnerName,
          email: inviteForm.email,
          projectName: inviteForm.projectName,
          facilityAmount: inviteForm.facilityAmount,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const inv = data.invitation;
        setLatestInvite(inv);
        setInvitedPartners(prev => [{
          inviteCode: inv.inviteCode,
          partnerName: inv.sponsorName,
          email: inv.email,
          projectName: inv.projectName,
          facilityAmount: inv.facilityAmount,
          invitedAt: inv.invitedAt,
          status: inv.status,
        }, ...prev]);
        setInviteForm({ partnerName: '', email: '', projectName: '', facilityAmount: '$50,000,000 USD' });
        setNotice(`Invitation link generated for ${inv.sponsorName}. Code: ${inv.inviteCode}`);
        setTimeout(() => setNotice(''), 6000);
      }
    } catch (err) {
      console.error('Invite partner error:', err);
    }
  };

  const copyInviteLink = () => {
    if (!latestInvite) return;
    navigator.clipboard.writeText(`${window.location.origin}${latestInvite.inviteUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 4000);
  };

  // ─── DEAL STATUS UPDATE ────────────────────────────────────────────────────
  const handleDealStatusChange = async (dealRef, newStatus) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_deal_status',
          dealReference: dealRef,
          newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDeals(prev => prev.map(d => d.dealReference === dealRef ? { ...d, status: newStatus } : d));
        setNotice(`Deal ${dealRef} status set to "${newStatus}".`);
        setTimeout(() => setNotice(''), 5000);
      }
    } catch (err) {
      console.error('Deal status update error:', err);
    }
  };

  // ─── UPDATE TERMS ──────────────────────────────────────────────────────────
  const handleTermsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_terms',
          offerTerms,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotice('Capital raise offer terms updated successfully.');
        setTimeout(() => setNotice(''), 5000);
      }
    } catch (err) {
      console.error('Terms save error:', err);
    }
  };

  if (loadingSession) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        Authenticating Executive Admin Clearance...
      </div>
    );
  }

  if (!adminSession) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container} style={{ textAlign: 'center', paddingTop: '160px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            <h1 className={styles.pageTitle} style={{ fontSize: '2rem', marginBottom: '12px' }}>Executive Admin Access Required</h1>
            <p className={styles.pageSubtitle} style={{ margin: '0 auto 24px' }}>
              The Executive Admin Portal is strictly restricted to verified Eagle Holdings deal advisors, compliance officers, and executive leadership.
            </p>
            <button
              onClick={() => router.push('/login?type=admin')}
              className={styles.submitBtn}
              style={{ margin: '0 auto' }}
            >
              Authenticate as Executive Admin
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main className={styles.main}>
        {/* ─── Hero Header Strip ─── */}
        <header className={styles.heroStrip}>
          <div className={styles.bgGrid}></div>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Eagle Holdings Executive Command Portal
            </div>
            <h1 className={styles.pageTitle}>Executive Admin Command Center</h1>
            <p className={styles.pageSubtitle}>
              Centralized administrative hub for deal clearance auditing, partner briefing publications, sponsor invitations, advisory term sheet controls, and real-time security log monitoring.
            </p>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
              <div className={statCardStyle(styles)}>
                <span className={styles.statLabel}>Target Facility Pipeline</span>
                <span className={styles.statVal}>$525,000,000 USD</span>
                <span className={styles.statSub}>Across 5 active deal mandates</span>
              </div>
              <div className={statCardStyle(styles)}>
                <span className={styles.statLabel}>Active Deals</span>
                <span className={styles.statVal}>{deals.length} Mandates</span>
                <span className={styles.statSub}>{deals.filter(d => d.status === 'Approved').length} Approved · {deals.filter(d => d.status === 'In Review').length} In Audit</span>
              </div>
              <div className={statCardStyle(styles)}>
                <span className={styles.statLabel}>Partner Briefings</span>
                <span className={styles.statVal}>{partnerBriefings.length} Published</span>
                <span className={styles.statSub}>Live on Partner Portal</span>
              </div>
              <div className={statCardStyle(styles)}>
                <span className={styles.statLabel}>Invited Partners</span>
                <span className={styles.statVal}>{invitedPartners.length} Entities</span>
                <span className={styles.statSub}>{invitedPartners.filter(i => i.status.includes('Active')).length} Registered & Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Main Content Container ─── */}
        <div className={styles.container}>
          {/* Command Navigation Bar */}
          <div className={styles.commandTabs}>
            <button className={`${styles.commandBtn} ${activeTab === 'overview' ? styles.activeCommand : ''}`} onClick={() => setActiveTab('overview')}>
              📊 Executive Overview
            </button>
            <button className={`${styles.commandBtn} ${activeTab === 'deals' ? styles.activeCommand : ''}`} onClick={() => setActiveTab('deals')}>
              💼 Deal Audit & Pipeline
            </button>
            <button className={`${styles.commandBtn} ${activeTab === 'briefings' ? styles.activeCommand : ''}`} onClick={() => setActiveTab('briefings')}>
              📄 Partner Briefings Upload
            </button>
            <button className={`${styles.commandBtn} ${activeTab === 'invites' ? styles.activeCommand : ''}`} onClick={() => setActiveTab('invites')}>
              ✉️ Partner Invitations
            </button>
            <button className={`${styles.commandBtn} ${activeTab === 'terms' ? styles.activeCommand : ''}`} onClick={() => setActiveTab('terms')}>
              ⚙️ Advisory Term Sheets
            </button>
            <button className={`${styles.commandBtn} ${activeTab === 'security' ? styles.activeCommand : ''}`} onClick={() => setActiveTab('security')}>
              🛡️ Security & Audit Stream
            </button>
          </div>

          {notice && <div className={styles.noticeBanner}>✓ {notice}</div>}

          {/* ─────────── EXECUTIVE OVERVIEW ─────────── */}
          {activeTab === 'overview' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Executive Command Summary</h2>
                <p className={styles.sectionSubtitle}>High-level portfolio clearance status, strategic briefings, and active partner pipeline.</p>
              </div>

              <div className={styles.adminTableCard}>
                <h3 className={styles.inputLabel} style={{ marginBottom: '12px' }}>Active Portfolio Deals Overview</h3>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Deal Reference</th>
                      <th>Partner Entity</th>
                      <th>Facility Amount</th>
                      <th>Submitted Document</th>
                      <th>Clearance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.slice(0, 4).map((deal, idx) => (
                      <tr key={idx}>
                        <td><code style={{ color: 'var(--gold)' }}>{deal.dealReference}</code></td>
                        <td><strong>{deal.partnerName}</strong></td>
                        <td>{deal.facilityAmount}</td>
                        <td>{deal.documentTitle}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${deal.status === 'Approved' ? styles.statusVerified : deal.status === 'Action Required' ? styles.statusAction : styles.statusAudit}`}>
                            {deal.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────── DEAL AUDIT & PIPELINE ─────────── */}
          {activeTab === 'deals' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Deal Audit & Pipeline Command</h2>
                <p className={styles.sectionSubtitle}>Audit submitted compliance documents, issue clearance approvals, or flag items for revision.</p>
              </div>

              <div className={styles.adminTableCard}>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Deal Reference</th>
                      <th>Partner Entity</th>
                      <th>Facility Amount</th>
                      <th>Document</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Advisor Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal, idx) => (
                      <tr key={idx}>
                        <td><code style={{ color: 'var(--gold)' }}>{deal.dealReference}</code></td>
                        <td><strong>{deal.partnerName}</strong></td>
                        <td>{deal.facilityAmount}</td>
                        <td>{deal.documentTitle}<br /><span style={{ opacity: 0.6, fontSize: '0.78rem' }}>{deal.fileName}</span></td>
                        <td style={{ fontSize: '0.78rem', opacity: 0.7 }}>{new Date(deal.submittedAt).toLocaleDateString('en-GB')}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${deal.status === 'Approved' ? styles.statusVerified : deal.status === 'Action Required' ? styles.statusAction : styles.statusAudit}`}>
                            {deal.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.adminControls}>
                            <button className={styles.adminApproveBtn} onClick={() => handleDealStatusChange(deal.dealReference, 'Approved')}>
                              Approve ✓
                            </button>
                            <button className={styles.adminActionBtn} onClick={() => handleDealStatusChange(deal.dealReference, 'Action Required')}>
                              Flag Action ⚠
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────── PARTNER BRIEFINGS UPLOAD ─────────── */}
          {activeTab === 'briefings' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Partner Briefing Manager</h2>
                <p className={styles.sectionSubtitle}>Upload strategic investment briefings and financial advisory updates to publish directly to the Partner Portal.</p>
              </div>

              {/* Upload Briefing Form */}
              <div className={styles.formCard}>
                <h3 className={styles.inputLabel} style={{ fontSize: '0.9rem' }}>Upload & Publish New Partner Briefing</h3>
                <form onSubmit={handleBriefingUpload} className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="briefingTitle">Briefing Title *</label>
                    <input
                      id="briefingTitle"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Q3 2026 Strategic Asset Valuation Briefing"
                      value={briefingForm.title}
                      onChange={e => setBriefingForm({ ...briefingForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="briefingCategory">Category</label>
                    <select
                      id="briefingCategory"
                      className={styles.inputField}
                      value={briefingForm.category}
                      onChange={e => setBriefingForm({ ...briefingForm, category: e.target.value })}
                    >
                      <option value="Strategic Briefing">Strategic Briefing</option>
                      <option value="Valuation & Advisory">Valuation & Advisory</option>
                      <option value="Compliance Audit">Compliance Audit</option>
                      <option value="Market Research">Market Research</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="briefingFileName">File Name / Document Name *</label>
                    <input
                      id="briefingFileName"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Strategic_Briefing_Q3_2026.pdf"
                      value={briefingForm.fileName}
                      onChange={e => setBriefingForm({ ...briefingForm, fileName: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="taggedDealRef">Tag Specific Deal / Mandate (Optional)</label>
                    <select
                      id="taggedDealRef"
                      className={styles.inputField}
                      value={briefingForm.taggedDealRef}
                      onChange={e => setBriefingForm({ ...briefingForm, taggedDealRef: e.target.value })}
                    >
                      <option value="">-- Global Portfolio (Untagged) --</option>
                      {deals.map(deal => (
                        <option key={deal.dealReference} value={deal.dealReference}>
                          {deal.dealReference} · {deal.partnerName} ({deal.documentTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                    <button type="submit" className={styles.submitBtn}>
                      Publish Briefing to Partner Portal →
                    </button>
                  </div>
                </form>
              </div>

              {/* Published Briefings Table */}
              <div className={styles.adminTableCard}>
                <h3 className={styles.inputLabel} style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Published Partner Briefings Index</h3>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Briefing Title</th>
                      <th>Category</th>
                      <th>Tagged Mandate / Deal</th>
                      <th>File Name</th>
                      <th>Published Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerBriefings.map((brf, idx) => (
                      <tr key={idx}>
                        <td><code style={{ color: 'var(--gold)' }}>{brf.ref}</code></td>
                        <td><strong>{brf.title}</strong></td>
                        <td><span className={styles.inputLabel} style={{ opacity: 0.8 }}>{brf.category}</span></td>
                        <td>
                          {brf.taggedDealRef ? (
                            <span className={styles.statusAudit} style={{ fontSize: '0.72rem' }}>
                              🏷️ {brf.taggedDealRef}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.5, fontSize: '0.78rem' }}>Global</span>
                          )}
                        </td>
                        <td><span style={{ opacity: 0.65, fontSize: '0.8rem', fontFamily: 'monospace' }}>{brf.fileName}</span></td>
                        <td style={{ fontSize: '0.78rem', opacity: 0.7 }}>{brf.uploadedAt}</td>
                        <td>
                          <span className={styles.statusVerified}>
                            ✓ Published
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────── PARTNER INVITATIONS ─────────── */}
          {activeTab === 'invites' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Partner & Sponsor Invitation Manager</h2>
                <p className={styles.sectionSubtitle}>Generate single-use invitation links and track partner registration status.</p>
              </div>

              <div className={styles.formCard}>
                <h3 className={styles.inputLabel} style={{ fontSize: '0.9rem' }}>Generate Partner / Sponsor Invitation</h3>
                <form onSubmit={handleInviteSubmit} className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="partnerName">Partner / Entity Name *</label>
                    <input
                      id="partnerName"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Metro Civil Infrastructure Group"
                      value={inviteForm.partnerName}
                      onChange={e => setInviteForm({ ...inviteForm, partnerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="email">Corporate Email *</label>
                    <input
                      id="email"
                      type="email"
                      className={styles.inputField}
                      placeholder="partner@entity.com"
                      value={inviteForm.email}
                      onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="projectName">Project Mandate *</label>
                    <input
                      id="projectName"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Deepwater Mobility Facility"
                      value={inviteForm.projectName}
                      onChange={e => setInviteForm({ ...inviteForm, projectName: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="facilityAmount">Target Facility</label>
                    <input
                      id="facilityAmount"
                      type="text"
                      className={styles.inputField}
                      placeholder="$50,000,000 USD"
                      value={inviteForm.facilityAmount}
                      onChange={e => setInviteForm({ ...inviteForm, facilityAmount: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                    <button type="submit" className={styles.submitBtn}>
                      Generate & Dispatch Partner Invitation Link
                    </button>
                  </div>
                </form>

                {latestInvite && (
                  <div className={styles.inviteResultBanner}>
                    <div>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block' }}>Invitation Link for {latestInvite.sponsorName}:</span>
                      <span className={styles.copyBadge}>{latestInvite.inviteUrl}</span>
                    </div>
                    <button type="button" onClick={copyInviteLink} className={styles.copyBtn}>
                      {copiedLink ? '✓ Copied Link!' : 'Copy Invitation Link'}
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.adminTableCard}>
                <h3 className={styles.inputLabel} style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Invited Partners Pipeline Index</h3>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Partner Entity</th>
                      <th>Project Title</th>
                      <th>Target Facility</th>
                      <th>Invite Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitedPartners.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.partnerName}</strong><br /><span style={{ opacity: 0.6, fontSize: '0.78rem' }}>{item.email}</span></td>
                        <td>{item.projectName}</td>
                        <td>{item.facilityAmount}</td>
                        <td><code style={{ color: 'var(--gold)' }}>{item.inviteCode}</code></td>
                        <td>
                          <span className={`${styles.statusBadge} ${item.status.includes('Active') ? styles.statusVerified : styles.statusAudit}`}>
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

          {/* ─────────── ADVISORY TERM SHEETS ─────────── */}
          {activeTab === 'terms' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Advisory Term Sheet Control</h2>
                <p className={styles.sectionSubtitle}>Configure default and customized capital raise facility parameters displayed to sponsors.</p>
              </div>

              <div className={styles.formCard}>
                <h3 className={styles.inputLabel} style={{ fontSize: '0.9rem' }}>Global Advisory Term Parameters</h3>
                <form onSubmit={handleTermsSave} className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="targetCapital">Target Capital Facility</label>
                    <input id="targetCapital" type="text" className={styles.inputField} value={offerTerms.targetCapital} onChange={e => setOfferTerms({ ...offerTerms, targetCapital: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="preferredTerms">Preferred Return Yield</label>
                    <input id="preferredTerms" type="text" className={styles.inputField} value={offerTerms.preferredTerms} onChange={e => setOfferTerms({ ...offerTerms, preferredTerms: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="ltvRatio">Senior Debt LTV Ratio</label>
                    <input id="ltvRatio" type="text" className={styles.inputField} value={offerTerms.ltvRatio} onChange={e => setOfferTerms({ ...offerTerms, ltvRatio: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="advisoryTerm">Advisory Duration</label>
                    <input id="advisoryTerm" type="text" className={styles.inputField} value={offerTerms.advisoryTerm} onChange={e => setOfferTerms({ ...offerTerms, advisoryTerm: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" className={styles.submitBtn}>
                      Save Capital Raise Term Parameters
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─────────── SECURITY AUDIT STREAM ─────────── */}
          {activeTab === 'security' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>System Security Audit &amp; Event Stream</h2>
                <p className={styles.sectionSubtitle}>Real-time log of security events, authentication attempts, rate limiting events, and system audit verifications.</p>
              </div>

              <div className={styles.adminTableCard}>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>Origin IP Address</th>
                      <th>Timestamp</th>
                      <th>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => (
                      <tr key={log.id}>
                        <td><code style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>{log.event}</code></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{log.ip}</td>
                        <td style={{ fontSize: '0.78rem', opacity: 0.7 }}>{log.timestamp}</td>
                        <td>
                          <span className={styles.statusVerified}>
                            ✓ {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function statCardStyle(styles) {
  return styles.statCard;
}
