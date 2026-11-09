/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Duck Blog',
  author: 'deokgoo',
  headerTitle: 'Duck Blog',
  description: '대규모 웹 시스템 아키텍처, 로컬 AI 최적화, 그리고 실전 엔지니어링 경험을 기록하는 시니어 프로덕트 엔지니어의 테크 블로그입니다.',
  language: 'ko-KR',
  theme: 'system', // system, dark or light
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-blog.vercel.app',
  siteRepo: process.env.NEXT_PUBLIC_SITE_REPO || 'https://github.com/deokgoo/next-duck-blog',
  siteLogo: '/static/images/logo.png',
  image: '/static/images/avatar.jpg',
  socialBanner: '/static/images/main-logo-no-bg.png',
  mastodon: 'https://mastodon.social/@mastodonuser',
  email: 'kkddgg1001@gmail.com',
  github: 'https://github.com/deokgoo',
  x: 'https://twitter.com/x',
  // twitter: 'https://twitter.com/Twitter',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://www.linkedin.com/in/kim-deokgoo-51b583155',
  threads: 'https://www.threads.net',
  instagram: 'https://www.instagram.com',
  locale: 'ko-KR',
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      // We use an env variable for this site to avoid other users cloning our analytics ID
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
      // You may also need to overwrite the script if you're storing data in the US - ex:
      // src: 'https://us.umami.is/script.js'
      // Remember to add 'us.umami.is' in `next.config.js` as a permitted domain for the CSP
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    googleAnalytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
    },
    plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    simpleAnalytics: false, // true or false
    umamiWebsiteId: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    naverWebMasterId: process.env.NEXT_PUBLIC_NAVER_WEBMASTER_ID || '', // naver web master verification code
  },
  newsletter: {
    // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus
    // Please add your .env file and modify it according to your selection
    provider: 'buttondown',
  },
}

module.exports = siteMetadata
