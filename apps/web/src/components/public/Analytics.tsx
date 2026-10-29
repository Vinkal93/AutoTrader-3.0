'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { getFirebaseAnalytics, firebaseConfig } from '@/lib/firebase';

export const Analytics: React.FC = () => {
  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    firebaseConfig.measurementId ||
    'G-NM0PXSZBVF';

  useEffect(() => {
    // SSR-Safe: Initialize Firebase Analytics strictly on client-side
    if (typeof window !== 'undefined') {
      getFirebaseAnalytics().catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Firebase] Analytics client initialization skipped:', err);
        }
      });
    }
  }, []);

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
};
