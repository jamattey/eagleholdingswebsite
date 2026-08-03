'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import styles from "./page.module.css";

// ─── PARTNER LOGIN FORM ──────────────────────────────────────────
function PartnerLoginForm() {
  const router = useRouter();
  const [partnerId, setPartnerId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/partner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, securityKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Zero Trust: Session is set as HttpOnly cookie by server. Redirect directly.
      router.push('/partner-portal');

    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Authentication error.');
    }
  };

  const fillDemoCredentials = () => {
    setPartnerId('EAGLE-8821');
    setSecurityKey('demo-key-2026');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.demoBanner}>
        <span>Need test credentials?</span>
        <button type="button" onClick={fillDemoCredentials} className={styles.demoBadge}>
          Use Demo Credentials (EAGLE-8821)
        </button>
      </div>

      {status === 'error' && errorMsg && (
        <div className={styles.errorMsg} role="alert">
          {errorMsg}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="partnerId">Partner ID</label>
        <input 
          id="partnerId"
          name="partnerId"
          type="text" 
          placeholder="Enter your credential ID" 
          className={styles.input}
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="securityKey">Security Key</label>
        <input 
          id="securityKey"
          name="securityKey"
          type="password" 
          placeholder="••••••••••••" 
          className={styles.input}
          value={securityKey}
          onChange={(e) => setSecurityKey(e.target.value)}
          required
        />
      </div>

      <div className={styles.formFooter}>
        <Link href="/request-credentials" className={styles.secondaryLink}>
          Don't have an account? <span>Request Credentials</span>
        </Link>
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={status === 'loading'}
        >
          <span>{status === 'loading' ? 'Authenticating...' : 'Authenticate'}</span>
          <span className={styles.btnLine}></span>
        </button>
      </div>
    </form>
  );
}

// ─── PRINCIPAL LOGIN FORM ────────────────────────────────────────
function PrincipalLoginForm({ initialInvite }) {
  const router = useRouter();

  const [principalId, setPrincipalId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [inviteCode, setInviteCode] = useState(initialInvite || '');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialInvite) {
      setPrincipalId(`SPONSOR-${initialInvite.replace('INV-', '')}`);
    }
  }, [initialInvite]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/principal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principalId, securityKey, inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      router.push('/onboarding');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Authentication error.');
    }
  };

  const fillDemoCredentials = () => {
    setPrincipalId('PRINCIPAL-2026');
    setSecurityKey('sponsor-key-2026');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {inviteCode && (
        <div className={styles.inviteNotice}>
          ✓ Valid Invitation Code Detected: <strong>{inviteCode}</strong>. Please enter your security key to complete account setup and access the onboarding portal.
        </div>
      )}

      <div className={styles.demoBanner}>
        <span>Need test credentials?</span>
        <button type="button" onClick={fillDemoCredentials} className={styles.demoBadge}>
          Use Demo Principal Credentials (PRINCIPAL-2026)
        </button>
      </div>

      {status === 'error' && errorMsg && (
        <div className={styles.errorMsg} role="alert">
          {errorMsg}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="principalId">Principal / Sponsor ID</label>
        <input 
          id="principalId"
          name="principalId"
          type="text" 
          placeholder="Enter your principal ID or email" 
          className={styles.input}
          value={principalId}
          onChange={(e) => setPrincipalId(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="securityKey">Security Key</label>
        <input 
          id="securityKey"
          name="securityKey"
          type="password" 
          placeholder="••••••••••••" 
          className={styles.input}
          value={securityKey}
          onChange={(e) => setSecurityKey(e.target.value)}
          required
        />
      </div>

      <div className={styles.formFooter}>
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={status === 'loading'}
        >
          <span>{status === 'loading' ? 'Accessing Data Room...' : 'Authenticate & Enter Onboarding'}</span>
          <span className={styles.btnLine}></span>
        </button>
      </div>
    </form>
  );
}

// ─── MAIN LOGIN PAGE CONTAINER ───────────────────────────────────
function LoginContainer() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('partner');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    const invite = searchParams.get('invite');
    
    if (invite) {
      setInviteCode(invite);
      setActiveTab('principal');
    } else if (type === 'principal') {
      setActiveTab('principal');
    } else if (type === 'partner') {
      setActiveTab('partner');
    }
  }, [searchParams]);

  return (
    <main className={styles.main}>
      {/* ─── Hero strip ─── */}
      <div className={styles.heroStrip}>
        <div className={styles.bgGrid}></div>
        <div className={styles.heroContent}>
          <div className={styles.goldLine}></div>
          <h1 className={styles.pageTitle}>Secure Gateway</h1>
          <p className={styles.pageSubtitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'text-bottom', color: 'var(--gold)'}}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            Restricted access to global strategic briefings and proprietary project data.
            Select your clearance level to proceed.
          </p>
        </div>
      </div>

      {/* ─── Form section ─── */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          
          {/* Tabs */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'partner' ? styles.active : ''}`}
              onClick={() => setActiveTab('partner')}
            >
              Partner Access
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'principal' ? styles.active : ''}`}
              onClick={() => setActiveTab('principal')}
            >
              Principal Access
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'partner' && <PartnerLoginForm />}
          {activeTab === 'principal' && <PrincipalLoginForm initialInvite={inviteCode} />}

        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <Suspense fallback={<div style={{minHeight: '100vh', backgroundColor: 'var(--background)'}}>Loading...</div>}>
        <LoginContainer />
      </Suspense>
      <Footer />
    </>
  );
}
