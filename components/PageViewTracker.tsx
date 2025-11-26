'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    adsbygoogle?: any[];
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      // Google Analytics Pageview 추적
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'G-PN28LVMCKG', {
          page_path: url,
        });
      }

      // AdSense 광고 리프레시
      try {
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          // 기존 광고 슬롯 리프레시
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense refresh error:', error);
      }
    }
  }, [pathname, searchParams]);

  return null;
}
