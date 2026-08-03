'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import PartnerLoginForm from "@/components/auth/PartnerLoginForm/PartnerLoginForm";
import PrincipalLoginForm from "@/components/auth/PrincipalLoginForm/PrincipalLoginForm";
import AdminLoginForm from "@/components/auth/AdminLoginForm/AdminLoginForm";
import styles from "./page.module.css";

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
    } else if (type === 'admin') {
      setActiveTab('admin');
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
          <h1 className={styles.pageTitle}>
            {activeTab === 'admin' ? 'Executive Admin Gateway' : 'Secure Gateway'}
          </h1>
          <p className={styles.pageSubtitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'text-bottom', color: 'var(--gold)'}}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            {activeTab === 'admin'
              ? 'Restricted executive command gateway for Eagle Holdings deal advisors, compliance officers, and executive leadership.'
              : 'Restricted access to global strategic briefings and proprietary project data. Select your clearance level to proceed.'}
          </p>
        </div>
      </div>

      {/* ─── Form section ─── */}
      <section className={styles.formSection}>
        <div className={styles.container}>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              id="tab-partner"
              className={`${styles.tabBtn} ${activeTab === 'partner' ? styles.active : ''}`}
              onClick={() => setActiveTab('partner')}
            >
              Partner Access
            </button>
            <button
              id="tab-principal"
              className={`${styles.tabBtn} ${activeTab === 'principal' ? styles.active : ''}`}
              onClick={() => setActiveTab('principal')}
            >
              Principal Access
            </button>
            <button
              id="tab-admin"
              className={`${styles.tabBtn} ${activeTab === 'admin' ? styles.active : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Executive Admin
            </button>
          </div>

          {/* Form Content — rendered from separated component files */}
          {activeTab === 'partner' && <PartnerLoginForm />}
          {activeTab === 'principal' && <PrincipalLoginForm initialInvite={inviteCode} />}
          {activeTab === 'admin' && <AdminLoginForm />}

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
