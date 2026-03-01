import Script from 'next/script';
import Head from 'next/head';
import siteMetadata from '@/data/siteMetadata';

const GAScript = () => {
  return (
    <>
      <Head>
        {/* Google Search Console 인증을 위함 */}
        {process.env.GOOGLE_SITE_VERIFICATION_ID && (
          <meta
            name="google-site-verification"
            content={process.env.GOOGLE_SITE_VERIFICATION_ID}
          />
        )}
      </Head>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${siteMetadata.analytics?.googleAnalytics?.googleAnalyticsId}`}
      />

      <Script strategy="lazyOnload" id="ga-script">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${siteMetadata.analytics?.googleAnalytics?.googleAnalyticsId}', {
              page_path: window.location.pathname,
            });
        `}
      </Script>
    </>
  );
};

export default GAScript;

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const logEvent = (action, category, label, value) => {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
