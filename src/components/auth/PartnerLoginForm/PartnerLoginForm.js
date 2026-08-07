'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

/**
 * PartnerLoginForm
 * Handles authentication for Eagle Holdings global investment partners.
 * On success, sets an HttpOnly JWT cookie (server-side) and redirects to /partner-portal.
 */
export default function PartnerLoginForm() {
  const router = useRouter();
  const [partnerId, setPartnerId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
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

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

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
        <label className={styles.label} htmlFor="partnerSecurityKey">Security Key</label>
        <input
          id="partnerSecurityKey"
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
          Don&apos;t have an account? <span>Request Credentials</span>
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
