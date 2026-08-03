'use client'; // DEVELOPER NOTE: Required because we use React state (useState) to manage the mobile hamburger menu open/close status.

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Header() {
  // State for tracking if the mobile dropdown menu is currently visible
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link href="/partner-login" className={styles.buttonPrimary}>
              Partner Login
            </Link>
            <Link href="/onboarding" className={styles.buttonPrimary}>
              Onboarding
            </Link>
            <Link href="/contact" className={styles.buttonPrimary}>
              Contact
            </Link>
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
        <Link href="/partner-login" className={styles.mobileNavLink} onClick={closeMobileMenu}>
          Partner Login
        </Link>
        <Link href="/onboarding" className={styles.mobileNavLink} onClick={closeMobileMenu}>
          Onboarding
        </Link>
        <Link href="/contact" className={styles.mobileNavLink} onClick={closeMobileMenu}>
          Contact
        </Link>
      </div>
    </header>
  );
}
