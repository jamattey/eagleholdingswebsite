'use client';

import { useRouter } from 'next/navigation';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./not-found.module.css";
import { useEffect, useState } from 'react';

export default function NotFoundPage() {
  const router = useRouter();
  const [coordinates, setCoordinates] = useState('SEARCHING...');

  useEffect(() => {
    let interval = setInterval(() => {
      const lat = (Math.random() * 180 - 90).toFixed(4);
      const lng = (Math.random() * 360 - 180).toFixed(4);
      setCoordinates(`LAT: ${lat} | LNG: ${lng}`);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setCoordinates('TARGET_UNLOCATED');
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main className={styles.main}>
        <div className={styles.radarContainer}>
          <div className={styles.radar}></div>
          <div className={styles.sweep}></div>
          <div className={styles.grid}></div>
        </div>
        
        <div className={styles.content}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.title}>Asset Not Found</h2>
          
          <div className={styles.telemetry}>
            <p><span className={styles.label}>QUERY:</span> {typeof window !== 'undefined' ? window.location.pathname : '/unknown'}</p>
            <p><span className={styles.label}>STATUS:</span> {coordinates}</p>
            <p><span className={styles.label}>DIRECTIVE:</span> ASSET_DOES_NOT_EXIST</p>
          </div>
          
          <p className={styles.description}>
            The capital asset, document, or sector you are attempting to locate is missing from the Eagle Holdings registry. 
            It may have been relocated, heavily restricted, or permanently decommissioned.
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
