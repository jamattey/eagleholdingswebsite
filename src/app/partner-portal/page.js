'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const initialBriefings = [
  {
    id: 'brief-01',
    ref: 'BRF-2026-Q3',
    category: 'CIVIL INFRASTRUCTURE',
    title: '2026 Sovereign Asset & FDI Participation Deck',
    description: 'Confidential allocation breakdown of high-capacity transportation hubs and public civil infrastructure projects.',
    date: 'August 2026',
    fileSize: '4.2 MB PDF',
    taggedDealRef: 'DEAL-SPONSOR-991',
    taggedDealName: 'Metro Civil Infrastructure Group',
  },
  {
    id: 'brief-02',
    ref: 'BRF-2026-FIN',
    category: 'FINANCIAL ADVISORY',
    title: 'Cross-Border Capital Movement & Tax Neutrality Report',
    description: 'Detailed regulatory briefing covering international capital structures, tax neutrality, and institutional governance.',
    date: 'July 2026',
    fileSize: '2.8 MB PDF',
    taggedDealRef: null,
    taggedDealName: null,
  },
  {
    id: 'brief-03',
    ref: 'BRF-2026-RE',
    category: 'PRIVATE ENTERPRISE',
    title: 'Q3 Enterprise Real Estate & Equity Portfolio Review',
    description: 'Performance overview of primary commercial assets, debt syndication models, and yield forecasts.',
    date: 'June 2026',
    fileSize: '5.1 MB PDF',
    taggedDealRef: 'DEAL-SPONSOR-402',
    taggedDealName: 'Pacific Rim Energy Developers',
  },
];

const syndicatedDeals = [
  {
    dealRef: 'DEAL-SPONSOR-991',
    title: 'High-Density Mobility Hub Phase I',
    sponsor: 'Metro Civil Infrastructure Group',
    category: 'Civil Transit Infrastructure',
    targetFacility: '$50,000,000 USD',
    targetYield: '14.5% Net IRR',
    seniorLtv: '60% Debt / 40% Equity',
    status: 'Open for Co-Investment',
    summary: 'Sovereign-backed urban transit hub with guaranteed revenue-sharing model and GIPC tax incentives.',
  },
  {
    dealRef: 'DEAL-SPONSOR-402',
    title: 'Regional Deepwater Civil Asset',
    sponsor: 'Pacific Rim Energy Developers',
    category: 'Deepwater Port & Maritime Terminal',
    targetFacility: '$75,000,000 USD',
    targetYield: '15.8% Net IRR',
    seniorLtv: '65% Debt / 35% Equity',
    status: 'Under Audit',
    summary: 'Strategic maritime logistics asset featuring 25-year concession lease and regional throughput guarantees.',
  },
  {
    dealRef: 'DEAL-SPONSOR-112',
    title: 'Atlantic Deepwater Logistics Terminal',
    sponsor: 'Atlantic Deepwater Logistics',
    category: 'Energy Logistics Infrastructure',
    targetFacility: '$120,000,000 USD',
    targetYield: '16.2% Net IRR',
    seniorLtv: '55% Debt / 45% Equity',
    status: 'Syndication Open',
    summary: 'High-yield energy transport hub with long-term take-or-pay off-take agreements.',
  },
];

const irEvents = [
  { date: '2026-08-15', title: 'Q3 Institutional Investor Webcast & Portfolio Audit Review', speaker: 'Eagle Holdings Deal Committee & Senior Partners', status: 'Registration Open' },
  { date: '2026-09-04', title: 'West Africa Civil Infrastructure Co-Investment Roundtable', speaker: 'Ghana Infrastructure Fund & Eagle Capital Leadership', status: 'Invites Dispatched' },
  { date: '2026-10-10', title: 'Annual Investor General Meeting (AGM) & ESG Audit', speaker: 'Board of Directors & Independent Auditor Panel', status: 'Scheduled' },
];

export default function PartnerPortalDashboard() {
  const router = useRouter();
  const [partnerSession, setPartnerSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mandates' | 'briefings' | 'events' | 'governance'
  const [briefings, setBriefings] = useState(initialBriefings);
  const [downloadNotice, setDownloadNotice] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.session) {
          setPartnerSession(data.session);
        } else {
          setPartnerSession(null);
        }
      } catch {
        setPartnerSession(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setPartnerSession(null);
    router.push('/login?type=partner');
  };

  const handleDownload = (title, ref) => {
    setDownloadNotice(`Decrypted download initialized for IR Document "${title}" (Ref: ${ref || 'IR-DOC'}). Audit verification passed.`);
    setTimeout(() => setDownloadNotice(''), 6000);
  };

  const filteredBriefings = briefings.filter(b => {
    if (filterCategory === 'ALL') return true;
    return b.category === filterCategory;
  });

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.unauthorizedState}>
            <p>Verifying institutional investor security clearance...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!partnerSession) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.unauthorizedState}>
            <div className={styles.lockIcon}>🔒</div>
            <h1 className={styles.portalTitle}>Institutional Partner Access Restricted</h1>
            <p className={styles.partnerSubtext}>
              Authentication is required to access proprietary investor relations communications, co-investment deal teasers, and financial performance reports.
            </p>
            <button 
              onClick={() => router.push('/login?type=partner')} 
              className={styles.loginPromptBtn}
            >
              Authenticate at Partner Login
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* ─── Investor Relations Portal Header ─── */}
        <header className={styles.portalHeader}>
          <div className={styles.bgGrid}></div>
          <div className={styles.headerContainer}>
            <div className={styles.titleArea}>
              <div className={styles.securityTag}>
                <span className={styles.securityDot}></span>
                Encrypted Session · Institutional IR Gateway
              </div>
              <h1 className={styles.portalTitle}>Investor Relations &amp; Capital Advisory Dashboard</h1>
              <p className={styles.partnerSubtext}>
                Institutional investor communications, co-investment deal syndications, asset performance tracking, and confidential executive briefings.
              </p>
            </div>

            <div className={styles.userProfileCard}>
              <div className={styles.profileInfo}>
                <span className={styles.partnerName}>{partnerSession.name || 'Institutional Investment Partner'}</span>
                <span className={styles.clearanceBadge}>
                  {partnerSession.clearance || 'Level 4 — Tier 1 Investor'}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>
                  Assigned Officer: Eagle IR Desk
                </span>
              </div>
              <button onClick={handleSignOut} className={styles.signOutBtn}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* ─── IR Navigation & Dashboard ─── */}
        <div className={styles.dashboardSection}>

          {downloadNotice && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(168, 140, 58, 0.15)',
              border: '1px solid var(--gold)',
              borderRadius: '4px',
              color: 'var(--foreground)',
              fontSize: '0.9rem',
              marginBottom: '20px',
            }}>
              ✓ {downloadNotice}
            </div>
          )}

          {/* IR Command Navigation Bar */}
          <div className={styles.irNavTabs}>
            <button className={`${styles.irNavBtn} ${activeTab === 'overview' ? styles.activeIrNav : ''}`} onClick={() => setActiveTab('overview')}>
              📊 IR Executive Overview
            </button>
            <button className={`${styles.irNavBtn} ${activeTab === 'mandates' ? styles.activeIrNav : ''}`} onClick={() => setActiveTab('mandates')}>
              💼 Syndicated Opportunities ({syndicatedDeals.length})
            </button>
            <button className={`${styles.irNavBtn} ${activeTab === 'briefings' ? styles.activeIrNav : ''}`} onClick={() => setActiveTab('briefings')}>
              📄 IR Document Library ({briefings.length})
            </button>
            <button className={`${styles.irNavBtn} ${activeTab === 'events' ? styles.activeIrNav : ''}`} onClick={() => setActiveTab('events')}>
              📅 Investor Calls &amp; AGM ({irEvents.length})
            </button>
            <button className={`${styles.irNavBtn} ${activeTab === 'governance' ? styles.activeIrNav : ''}`} onClick={() => setActiveTab('governance')}>
              🛡️ Governance &amp; ESG Vault
            </button>
          </div>

          {/* IR Key Performance Indicators */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Assets Under Advisory</span>
                <span className={styles.metricIcon}>🏛️</span>
              </div>
              <div className={styles.metricValue}>$4.80 Billion</div>
              <div className={styles.metricSubtext}>Total Portfolio Valuation</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Portfolio Net IRR</span>
                <span className={styles.metricIcon}>📈</span>
              </div>
              <div className={styles.metricValue}>14.20% p.a.</div>
              <div className={styles.metricSubtext}>Target Net Investor Return</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Capital Syndicated</span>
                <span className={styles.metricIcon}>🤝</span>
              </div>
              <div className={styles.metricValue}>$3.10 Billion</div>
              <div className={styles.metricSubtext}>Committed FDI &amp; Debt Facilities</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Distribution Yield</span>
                <span className={styles.metricIcon}>💰</span>
              </div>
              <div className={styles.metricValue}>8.80% p.a.</div>
              <div className={styles.metricSubtext}>Cash-on-Cash Q2 2026 Paid</div>
            </div>
          </div>

          {/* ─────────── IR EXECUTIVE OVERVIEW ─────────── */}
          {activeTab === 'overview' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>Executive Investor Overview &amp; Market Positioning</h2>
                <div className={styles.overviewCard}>
                  <p style={{ lineHeight: 1.7, fontSize: '0.95rem', opacity: 0.85, marginBottom: '20px' }}>
                    Eagle Holdings serves institutional capital partners, sovereign wealth funds, and private equity syndicates as a principal financial advisory firm. Our primary mandates span high-barrier civil transit infrastructure, deepwater maritime ports, and sustainable energy logistics across growth markets.
                  </p>
                  <div className={styles.overviewStatsRow}>
                    <div className={styles.overviewStatItem}>
                      <span className={styles.metricLabel}>Sovereign Projects</span>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--white)' }}>12 Infrastructure Assets</strong>
                    </div>
                    <div className={styles.overviewStatItem}>
                      <span className={styles.metricLabel}>Syndicate Ticket Size</span>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--gold)' }}>$10M - $150M USD</strong>
                    </div>
                    <div className={styles.overviewStatItem}>
                      <span className={styles.metricLabel}>Audit Standard</span>
                      <strong style={{ fontSize: '1.4rem', color: '#2ecc71' }}>IFRS &amp; Big Four Audited</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Briefings Preview */}
              <div className={styles.sectionBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <h2 className={styles.blockTitle} style={{ margin: 0 }}>Featured IR Briefings &amp; Deal Teasers</h2>
                  <button onClick={() => setActiveTab('briefings')} className={styles.viewAllBtn}>
                    View All Document Library →
                  </button>
                </div>
                <div className={styles.documentsGrid}>
                  {briefings.slice(0, 3).map((doc) => (
                    <div key={doc.id} className={styles.docCard}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span className={styles.docBadge}>{doc.category}</span>
                          {doc.taggedDealRef && (
                            <span className={styles.dealTagBadge}>
                              🏷️ {doc.taggedDealRef}
                            </span>
                          )}
                        </div>
                        <h3 className={styles.docTitle}>{doc.title}</h3>
                        <p className={styles.docDescription}>{doc.description}</p>
                        {doc.taggedDealName && (
                          <div className={styles.taggedDealNote}>
                            Mandate: <strong>{doc.taggedDealName}</strong>
                          </div>
                        )}
                      </div>
                      <div className={styles.docFooter}>
                        <span className={styles.docMeta}>{doc.date} • {doc.fileSize}</span>
                        <button 
                          onClick={() => handleDownload(doc.title, doc.ref)} 
                          className={styles.downloadBtn}
                        >
                          Download ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────── SYNDICATED OPPORTUNITIES ─────────── */}
          {activeTab === 'mandates' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>Syndicated Co-Investment Mandates</h2>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '24px' }}>
                  Active infrastructure projects open for institutional co-investment, equity participation, and senior debt facility allocation.
                </p>
                <div className={styles.mandatesGrid}>
                  {syndicatedDeals.map((deal) => (
                    <div key={deal.dealRef} className={styles.mandateCard}>
                      <div className={styles.mandateHeader}>
                        <div>
                          <span className={styles.docBadge}>{deal.category}</span>
                          <h3 className={styles.mandateTitle}>{deal.title}</h3>
                          <span className={styles.sponsorName}>Sponsor: {deal.sponsor}</span>
                        </div>
                        <span className={styles.dealRefBadge}>{deal.dealRef}</span>
                      </div>
                      <p className={styles.mandateSummary}>{deal.summary}</p>
                      <div className={styles.mandateTermsGrid}>
                        <div className={styles.mandateTermItem}>
                          <span className={styles.metricLabel}>Facility Cap</span>
                          <strong className={styles.termValue}>{deal.targetFacility}</strong>
                        </div>
                        <div className={styles.mandateTermItem}>
                          <span className={styles.metricLabel}>Target Net IRR</span>
                          <strong className={styles.termValue} style={{ color: 'var(--gold)' }}>{deal.targetYield}</strong>
                        </div>
                        <div className={styles.mandateTermItem}>
                          <span className={styles.metricLabel}>Capital Structure</span>
                          <strong className={styles.termValue} style={{ fontSize: '0.85rem' }}>{deal.seniorLtv}</strong>
                        </div>
                      </div>

                      {/* Check if any briefing is tagged to this deal */}
                      {briefings.some(b => b.taggedDealRef === deal.dealRef) && (
                        <div className={styles.dealBriefingBanner}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600 }}>
                            📄 Tagged Briefing Available:
                          </span>
                          <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                            {briefings.find(b => b.taggedDealRef === deal.dealRef)?.title}
                          </span>
                          <button
                            onClick={() => handleDownload(briefings.find(b => b.taggedDealRef === deal.dealRef)?.title, deal.dealRef)}
                            className={styles.quickDownloadBtn}
                          >
                            Download Briefing
                          </button>
                        </div>
                      )}

                      <div className={styles.mandateFooter}>
                        <span className={styles.statusVerified}>{deal.status}</span>
                        <button
                          onClick={() => handleDownload(`Teaser Document - ${deal.title}`, deal.dealRef)}
                          className={styles.downloadBtn}
                        >
                          Request Deal Datasheet ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────── BRIEFINGS & IR DOCUMENT LIBRARY ─────────── */}
          {activeTab === 'briefings' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 className={styles.blockTitle} style={{ margin: 0 }}>IR Document Library &amp; Executive Briefings</h2>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '4px' }}>
                      Filter by sector category or review briefings tagged to specific deal mandates.
                    </p>
                  </div>
                  <div className={styles.filterGroup}>
                    {['ALL', 'CIVIL INFRASTRUCTURE', 'FINANCIAL ADVISORY', 'PRIVATE ENTERPRISE'].map(cat => (
                      <button
                        key={cat}
                        className={`${styles.filterBtn} ${filterCategory === cat ? styles.activeFilter : ''}`}
                        onClick={() => setFilterCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.documentsGrid}>
                  {filteredBriefings.map((doc) => (
                    <div key={doc.id} className={styles.docCard}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span className={styles.docBadge}>{doc.category}</span>
                          {doc.taggedDealRef && (
                            <span className={styles.dealTagBadge}>
                              🏷️ {doc.taggedDealRef}
                            </span>
                          )}
                        </div>
                        <h3 className={styles.docTitle}>{doc.title}</h3>
                        <p className={styles.docDescription}>{doc.description}</p>
                        {doc.taggedDealName && (
                          <div className={styles.taggedDealNote}>
                            Mandate: <strong>{doc.taggedDealName}</strong>
                          </div>
                        )}
                      </div>
                      <div className={styles.docFooter}>
                        <span className={styles.docMeta}>{doc.date} • {doc.fileSize}</span>
                        <button 
                          onClick={() => handleDownload(doc.title, doc.ref)} 
                          className={styles.downloadBtn}
                        >
                          Download Decrypted PDF ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────── INVESTOR CALLS & AGM ─────────── */}
          {activeTab === 'events' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>Investor Webcasts &amp; AGM Calendar</h2>
                <div className={styles.eventsCard}>
                  <table className={styles.irTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Event Title &amp; Agenda</th>
                        <th>Keynote / Panel</th>
                        <th>Access Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {irEvents.map((evt, idx) => (
                        <tr key={idx}>
                          <td><strong style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{evt.date}</strong></td>
                          <td><strong>{evt.title}</strong></td>
                          <td><span style={{ fontSize: '0.82rem', opacity: 0.75 }}>{evt.speaker}</span></td>
                          <td><span className={styles.statusVerified}>{evt.status}</span></td>
                          <td>
                            <button
                              onClick={() => handleDownload(`Event Access Key - ${evt.title}`, `EVT-${idx}`)}
                              className={styles.downloadBtn}
                              style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                            >
                              RSVP &amp; Add Calendar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────── GOVERNANCE & ESG VAULT ─────────── */}
          {activeTab === 'governance' && (
            <div className={styles.viewSection}>
              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>Corporate Governance &amp; ESG Clearance Vault</h2>
                <div className={styles.governanceGrid}>
                  <div className={styles.govCard}>
                    <div className={styles.metricIcon} style={{ fontSize: '2rem', marginBottom: '8px' }}>📜</div>
                    <h3 className={styles.docTitle}>Environmental &amp; Social Impact (ESIA) Framework</h3>
                    <p className={styles.docDescription}>Comprehensive environmental compliance guidelines adhering to IFC Performance Standards and Equator Principles.</p>
                    <button onClick={() => handleDownload('ESIA Governance Framework', 'GOV-ESIA')} className={styles.downloadBtn} style={{ marginTop: '16px' }}>
                      Download Audit Report ↓
                    </button>
                  </div>

                  <div className={styles.govCard}>
                    <div className={styles.metricIcon} style={{ fontSize: '2rem', marginBottom: '8px' }}>⚖️</div>
                    <h3 className={styles.docTitle}>Anti-Money Laundering &amp; KYC Charter</h3>
                    <p className={styles.docDescription}>International FATF-compliant anti-money laundering policies, beneficiary verification criteria, and security audit protocols.</p>
                    <button onClick={() => handleDownload('AML & KYC Policy Charter', 'GOV-AML')} className={styles.downloadBtn} style={{ marginTop: '16px' }}>
                      Download Compliance Charter ↓
                    </button>
                  </div>

                  <div className={styles.govCard}>
                    <div className={styles.metricIcon} style={{ fontSize: '2rem', marginBottom: '8px' }}>🏦</div>
                    <h3 className={styles.docTitle}>Independent Auditor Letters &amp; Tax Clearance</h3>
                    <p className={styles.docDescription}>Big Four independent auditor letters, tax neutrality certificates, and GIPC regulatory compliance filings.</p>
                    <button onClick={() => handleDownload('Tax & Audit Letters', 'GOV-AUDIT')} className={styles.downloadBtn} style={{ marginTop: '16px' }}>
                      Download Auditor Letter ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Access Audit Log */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.blockTitle}>Session Security &amp; Clearance Verification</h2>
            <div className={styles.auditCard}>
              <div className={styles.auditList}>
                <div className={styles.auditItem}>
                  <span className={styles.auditAction}>Session Authentication Verified</span>
                  <span className={styles.auditMeta}>
                    {partnerSession.authenticatedAt ? new Date(partnerSession.authenticatedAt).toLocaleString() : 'Just now'} • TLS 1.3 Secure Connection
                  </span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditAction}>Investor Security Clearance</span>
                  <span className={styles.auditMeta}>Clearance Level: {partnerSession.clearance}</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditAction}>Encrypted Session Cookie</span>
                  <span className={styles.auditMeta}>Subject Identity: {partnerSession.sub}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </>
  );
}
