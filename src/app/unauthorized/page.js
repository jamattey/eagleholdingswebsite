'use client';

import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";
import { useEffect, useState } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [glitchText, setGlitchText] = useState('403');

  useEffect(() => {
    const chars = '0123456789!@#$%^&*()';
    let interval = setInterval(() => {
      if (Math.random() > 0.8) {
        let text = '403'.split('');
        text[Math.floor(Math.random() * 3)] = chars[Math.floor(Math.random() * chars.length)];
        setGlitchText(text.join(''));
        setTimeout(() => setGlitchText('403'), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main className={styles.main}>
        <div className={styles.backgroundGrid}>
          <div className={styles.scanline}></div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.lockContainer}>
            <div className={styles.lockIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
          
          <h1 className={styles.errorCode} data-text={glitchText}>{glitchText}</h1>
          <h2 className={styles.title}>Restricted Airspace: Clearance Denied</h2>
          
          <div className={styles.terminal}>
            <p><span className={styles.prompt}>&gt;</span> STATUS: ACCESS_DENIED</p>
            <p><span className={styles.prompt}>&gt;</span> PROTOCOL: EAGLE_STRICT_SILO</p>
            <p><span className={styles.prompt}>&gt;</span> REASON: INSUFFICIENT_CAPITAL_CLEARANCE</p>
            <p className={styles.blinkCursor}>_</p>
          </div>
          
          <p className={styles.description}>
            You have encountered a highly secured boundary within the Eagle Holdings digital infrastructure. 
            For compliance and zero-trust integrity, this vault remains strictly siloed. Your access attempt has been logged.
          </p>
          
          <div className={styles.actions}>
            <button className={styles.primaryBtn} onClick={() => router.push('/')}>
              Return to Headquarters
            </button>
            <button className={styles.secondaryBtn} onClick={() => router.back()}>
              Go Back
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
