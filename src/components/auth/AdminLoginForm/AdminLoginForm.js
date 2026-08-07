'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

/**
 * AdminLoginForm
 * Handles authentication for Eagle Holdings Executive Admin Command Center.
 * On success, sets an HttpOnly JWT cookie (server-side) with role === 'ADMIN' and redirects to /admin.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, securityKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Executive Admin authentication failed.');
      }

      // Zero Trust: Session is set as HttpOnly cookie by server. Redirect directly to Admin Portal.
      router.push('/admin');
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
        <label className={styles.label} htmlFor="adminId">Executive Admin ID</label>
        <input
          id="adminId"
          name="adminId"
          type="text"
          placeholder="Enter your executive admin ID"
          className={styles.input}
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="adminSecurityKey">Security Key</label>
        <input
          id="adminSecurityKey"
          name="securityKey"
          type="password"
          placeholder="••••••••••••"
          className={styles.input}
          value={securityKey}
          onChange={(e) => setSecurityKey(e.target.value)}
          required
        />
      </div>

      <div className={styles.formFooter} style={{ justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === 'loading'}
        >
          <span>{status === 'loading' ? 'Authenticating Clearance...' : 'Authenticate Executive Admin'}</span>
          <span className={styles.btnLine}></span>
        </button>
      </div>
    </form>
  );
}
