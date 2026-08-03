'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

function PrincipalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [principalId, setPrincipalId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('invite');
    if (code) {
      setInviteCode(code);
      setPrincipalId(`SPONSOR-${code.replace('INV-', '')}`);
    }
  }, [searchParams]);

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

      // Store principal session
      if (typeof window !== 'undefined') {
        const sessionData = JSON.stringify({
          token: data.token,
          principal: data.principal,
        });
        sessionStorage.setItem('eagle_principal_session', sessionData);
        localStorage.setItem('eagle_principal_session', sessionData);
      }

      // Redirect to onboarding landing dashboard
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

      {/* Demo Credentials Helper */}
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

export default function PrincipalLoginPage() {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main className={styles.main}>

        {/* ─── Hero strip ─── */}
        <div className={styles.heroStrip}>
          <div className={styles.bgGrid}></div>
          <div className={styles.heroContent}>
            <div className={styles.goldLine}></div>
            <h1 className={styles.pageTitle}>Project Principal Access</h1>
            <p className={styles.pageSubtitle}>
              Secure authentication for project principals and sponsors. Enter your credentials or invitation code to access the onboarding portal and Virtual Data Room.
            </p>
          </div>
        </div>

        {/* ─── Form section ─── */}
        <section className={styles.formSection}>
          <div className={styles.container}>
            <Suspense fallback={<div>Loading login form...</div>}>
              <PrincipalLoginForm />
            </Suspense>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
