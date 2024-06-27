'use client';

import { useEffect } from 'react';

const AdComponentGrid = () => {
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

  return (
    <div className="ad-container" style={{ textAlign: 'center', margin: '20px 0' }}>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2038243209448310"
        crossOrigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-gc+3r+68-9q-29"
        data-ad-client="ca-pub-2038243209448310"
        data-ad-slot="6151980699"
      ></ins>
      <script></script>
    </div>
  );
};

export default AdComponentGrid;
