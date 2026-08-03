'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import styles from "./page.module.css";

export default function PartnerLogin() {
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
    <>
      <Header />
      <main className={styles.main}>

        {/* ─── Hero strip ─── */}
        <div className={styles.heroStrip}>
          <div className={styles.bgGrid}></div>
          <div className={styles.heroContent}>
            <div className={styles.goldLine}></div>
            <h1 className={styles.pageTitle}>Partner Portal</h1>
            <p className={styles.pageSubtitle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'text-bottom', color: 'var(--gold)'}}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              </svg>
              Secure access to global strategic briefings and proprietary project data.
              Authentication required.
            </p>
          </div>
        </div>

        {/* ─── Form section ─── */}
        <section className={styles.formSection}>
          <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
              
              {/* Quick Demo Access Helper */}
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
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
