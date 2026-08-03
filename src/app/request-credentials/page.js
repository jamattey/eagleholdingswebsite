'use client';

import { useState } from 'react';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

export default function RequestCredentials() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    purpose: '',
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/request-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit credential request.');
      }

      setReferenceId(data.referenceId || '');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      purpose: '',
    });
    setStatus('idle');
    setErrorMsg('');
    setReferenceId('');
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
            <h1 className={styles.pageTitle}>Credential Request</h1>
            <p className={styles.pageSubtitle}>
              New stakeholders may request access to the Partner Portal. Each request undergoes 
              a rigorous verification process before credentials are issued.
            </p>
          </div>
        </div>

        {/* ─── Form section ─── */}
        <section className={styles.formSection}>
          <div className={styles.container}>
            {status === 'success' ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.successTitle}>Request Submitted</h2>
                <p className={styles.successText}>
                  Thank you, <strong>{formData.firstName}</strong>. Your application for access to the Eagle Holdings Partner Portal has been received. Our compliance team will audit your credentials and respond to <strong>{formData.email}</strong> within 2-3 business days.
                </p>
                {referenceId && (
                  <div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Reference Tracking Number:</span>
                    <span className={styles.refBadge}>{referenceId}</span>
                  </div>
                )}
                <button type="button" onClick={handleReset} className={styles.resetBtn}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                {status === 'error' && errorMsg && (
                  <div className={styles.errorMsg} role="alert">
                    {errorMsg}
                  </div>
                )}

                {/* Row 1 */}
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="firstName">First Name *</label>
                    <input 
                      id="firstName"
                      name="firstName"
                      type="text" 
                      placeholder="Enter your first name" 
                      className={styles.input}
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="lastName">Last Name *</label>
                    <input 
                      id="lastName"
                      name="lastName"
                      type="text" 
                      placeholder="Enter your last name" 
                      className={styles.input}
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Corporate Email & Organization */}
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Corporate Email *</label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="name@company.com" 
                      className={styles.input}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="organization">Organization / Firm</label>
                    <input 
                      id="organization"
                      name="organization"
                      type="text" 
                      placeholder="Company or Entity Name" 
                      className={styles.input}
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="purpose">Purpose of Request *</label>
                  <textarea 
                    id="purpose"
                    name="purpose"
                    placeholder="Please describe your affiliation and reason for requiring portal access..." 
                    className={`${styles.input} ${styles.textarea}`}
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formFooter}>
                  <p className={styles.disclaimer}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    </svg>
                    Credentials will be issued only to verified stakeholders. Access is monitored and strictly audited.
                  </p>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={status === 'loading'}
                  >
                    <span>{status === 'loading' ? 'Submitting...' : 'Submit Request'}</span>
                    <span className={styles.btnLine}></span>
                  </button>
                </div>

              </form>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
