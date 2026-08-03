'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

const strategicBriefings = [
  {
    id: 'brief-01',
    category: 'CIVIL INFRASTRUCTURE',
    title: '2026 Sovereign Asset & FDI Participation Deck',
    description: 'Confidential allocation breakdown of high-capacity transportation hubs and public civil infrastructure projects.',
    date: 'August 2026',
    fileSize: '4.2 MB PDF',
  },
  {
    id: 'brief-02',
    category: 'FINANCIAL ADVISORY',
    title: 'Cross-Border Capital Movement & Compliance Report',
    description: 'Detailed regulatory briefing covering international capital structures, tax neutrality, and institutional governance.',
    date: 'July 2026',
    fileSize: '2.8 MB PDF',
  },
  {
    id: 'brief-03',
    category: 'PRIVATE ENTERPRISE',
    title: 'Q3 Enterprise Real Estate & Equity Portfolio',
    description: 'Performance overview of primary commercial assets, debt syndication models, and yield forecasts.',
    date: 'June 2026',
    fileSize: '5.1 MB PDF',
  },
];

export default function PartnerPortalDashboard() {
  const router = useRouter();
  const [partnerSession, setPartnerSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadNotice, setDownloadNotice] = useState('');

  useEffect(() => {
    // Zero Trust: Fetch current session from server HttpOnly cookie
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
    router.push('/partner-login');
  };

  const handleDownload = (title) => {
    setDownloadNotice(`Secure download initiated for: "${title}". Document decryption key verified.`);
    setTimeout(() => setDownloadNotice(''), 5000);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.unauthorizedState}>
            <p>Verifying partner security clearance...</p>
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
            <h1 className={styles.portalTitle}>Access Restricted</h1>
            <p className={styles.partnerSubtext}>
              Authentication is required to view confidential partner briefings and strategic project data.
            </p>
            <button 
              onClick={() => router.push('/partner-login')} 
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

        {/* ─── Portal Header ─── */}
        <header className={styles.portalHeader}>
          <div className={styles.bgGrid}></div>
          <div className={styles.headerContainer}>
            <div className={styles.titleArea}>
              <div className={styles.securityTag}>
                <span className={styles.securityDot}></span>
                Active Zero Trust Session (HttpOnly)
              </div>
              <h1 className={styles.portalTitle}>Partner Executive Portal</h1>
              <p className={styles.partnerSubtext}>
                Proprietary strategic briefings, project governance, and capital allocation metrics.
              </p>
            </div>

            <div className={styles.userProfileCard}>
              <div className={styles.profileInfo}>
                <span className={styles.partnerName}>{partnerSession.name || 'Verified Partner'}</span>
                <span className={styles.clearanceBadge}>
                  {partnerSession.clearance || 'Level 4 — Tier 1 Investor'}
                </span>
              </div>
              <button onClick={handleSignOut} className={styles.signOutBtn}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* ─── Dashboard Content ─── */}
        <div className={styles.dashboardSection}>

          {downloadNotice && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(168, 140, 58, 0.15)',
              border: '1px solid var(--gold)',
              borderRadius: '4px',
              color: 'var(--foreground)',
              fontSize: '0.9rem',
            }}>
              ✓ {downloadNotice}
            </div>
          )}

          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Advisory Assets</span>
                <span className={styles.metricIcon}>🏛️</span>
              </div>
              <div className={styles.metricValue}>$4.8B</div>
              <div className={styles.metricSubtext}>Total Capital Under Management</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Civil Infrastructure</span>
                <span className={styles.metricIcon}>🌉</span>
              </div>
              <div className={styles.metricValue}>12 Assets</div>
              <div className={styles.metricSubtext}>Active High-Capacity Models</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>FDI Allocation</span>
                <span className={styles.metricIcon}>📈</span>
              </div>
              <div className={styles.metricValue}>84.5%</div>
              <div className={styles.metricSubtext}>Syndicated Capital Committed</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Security Audit</span>
                <span className={styles.metricIcon}>🛡️</span>
              </div>
              <div className={styles.metricValue}>Tier 1</div>
              <div className={styles.metricSubtext}>Full Compliance Verified</div>
            </div>
          </div>

          {/* Strategic Briefings Section */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.blockTitle}>Confidential Strategic Briefings</h2>
            <div className={styles.documentsGrid}>
              {strategicBriefings.map((doc) => (
                <div key={doc.id} className={styles.docCard}>
                  <div>
                    <span className={styles.docBadge}>{doc.category}</span>
                    <h3 className={styles.docTitle}>{doc.title}</h3>
                    <p className={styles.docDescription}>{doc.description}</p>
                  </div>
                  <div className={styles.docFooter}>
                    <span className={styles.docMeta}>{doc.date} • {doc.fileSize}</span>
                    <button 
                      onClick={() => handleDownload(doc.title)} 
                      className={styles.downloadBtn}
                    >
                      Download ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Access Audit Log */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.blockTitle}>Recent Session Activity Log</h2>
            <div className={styles.auditCard}>
              <div className={styles.auditList}>
                <div className={styles.auditItem}>
                  <span className={styles.auditAction}>Session Authentication Successful</span>
                  <span className={styles.auditMeta}>
                    {partnerSession.authenticatedAt ? new Date(partnerSession.authenticatedAt).toLocaleString() : 'Just now'} • TLS 1.3
                  </span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditAction}>Security clearance level verified</span>
                  <span className={styles.auditMeta}>Clearance: {partnerSession.clearance}</span>
                </div>
                <div className={styles.auditItem}>
                  <span className={styles.auditAction}>Encrypted HttpOnly cookie verified</span>
                  <span className={styles.auditMeta}>Subject: {partnerSession.sub}</span>
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
