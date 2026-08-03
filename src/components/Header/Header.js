'use client'; // DEVELOPER NOTE: Required because we use React state (useState) to manage the mobile hamburger menu open/close status.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Header() {
  // State for tracking if the mobile dropdown menu is currently visible
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSession(data.session);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link 
          href="/" 
          className={styles.logoContainer} 
          style={{ textDecoration: 'none' }}
          aria-label="Eagle Holdings Homepage"
          onClick={closeMobileMenu}
        >
          <span className={styles.brandName}>EAGLE</span>
          <Image 
            src="/eagle-icon.png" 
            alt="Eagle Holdings Logo" 
            width={45} 
            height={45} 
            className={styles.logoImage}
            priority
          />
          <span className={styles.brandName}>HOLDINGS</span>
        </Link>
        
        <div className={styles.navActions}>
          <ThemeToggle />
          
          <div className={styles.desktopNav}>
            {session ? (
              <>
                <span className={styles.roleBadge}>{session.role} ACCESS</span>
                {session.role === 'PARTNER' || session.role === 'ADMIN' ? (
                  <Link href="/partner-portal" className={styles.buttonPrimary}>
                    Partner Portal
                  </Link>
                ) : null}
                {session.role === 'PRINCIPAL' || session.role === 'ADMIN' ? (
                  <Link href="/onboarding" className={styles.buttonPrimary}>
                    Onboarding Portal
                  </Link>
                ) : null}
                <button onClick={handleLogout} className={styles.buttonSecondary}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.buttonPrimary}>
                  Login
                </Link>
                <Link href="/contact" className={styles.buttonPrimary}>
                  Contact
                </Link>
              </>
            )}
          </div>

          <button 
            className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      </div>

      <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
        {session ? (
          <>
            <div className={styles.mobileRoleBadge}>{session.role} ACCESS</div>
            {session.role === 'PARTNER' || session.role === 'ADMIN' ? (
              <Link href="/partner-portal" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                Partner Portal
              </Link>
            ) : null}
            {session.role === 'PRINCIPAL' || session.role === 'ADMIN' ? (
              <Link href="/onboarding" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                Onboarding Portal
              </Link>
            ) : null}
            <button 
              onClick={() => { handleLogout(); closeMobileMenu(); }} 
              className={styles.mobileNavLink}
              style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              Login
            </Link>
            <Link href="/contact" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              Contact
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
