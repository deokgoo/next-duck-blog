'use client';

import { useEffect } from 'react';

const AdComponentInArticle = () => {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  useEffect(() => {
    setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        console.log('AdBlocker detected');
      }
    }, 1000);
  }, []);

  // AdSense가 설정되지 않으면 렌더링하지 않음
  if (!adsenseId) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
        crossOrigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={adsenseId}
        data-ad-slot="4907054773"
      ></ins>
    </>
  );
};

export default AdComponentInArticle;
