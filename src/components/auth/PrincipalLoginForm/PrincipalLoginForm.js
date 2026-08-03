'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

/**
 * PrincipalLoginForm
 * Handles authentication for project principals / sponsors invited to the onboarding portal.
 * Accepts an optional inviteCode pre-filled from URL params.
 * On success, sets an HttpOnly JWT cookie (server-side) and redirects to /onboarding.
 */
export default function PrincipalLoginForm({ initialInvite }) {
  const router = useRouter();

  const [principalId, setPrincipalId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [inviteCode] = useState(initialInvite || '');
  const [status, setStatus] = useState('idle'); // idle | loading | error
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
        <label className={styles.label} htmlFor="principalSecurityKey">Security Key</label>
        <input
          id="principalSecurityKey"
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
