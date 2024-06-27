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
        data-ad-format="autorelaxed"
        data-ad-client="ca-pub-2038243209448310"
        data-ad-slot="5822416435"
      ></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
  );
};

export default AdComponentGrid;
