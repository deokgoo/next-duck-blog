'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    try {
      // AdSense 스크립트 로드 후 초기화
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense initialization error:', error);
    }
  }, []);

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2038243209448310"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
