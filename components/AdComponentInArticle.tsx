'use client';

import { useEffect } from 'react';

const AdComponentInArticle = () => {
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
    <>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2038243209448310"
        crossOrigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-2038243209448310"
        data-ad-slot="4907054773"
      ></ins>
    </>
  );
};

export default AdComponentInArticle;
