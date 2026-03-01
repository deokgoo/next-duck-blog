const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const fs = require('fs');
const path = require('path');

// ads.txt 파일을 환경변수 기반으로 생성하는 함수
function generateAdsText() {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  
  if (!adsenseId) {
    console.log('ℹ️  NEXT_PUBLIC_GOOGLE_ADSENSE_ID가 설정되지 않아 ads.txt를 생성하지 않습니다.');
    return;
  }

  // Publisher ID에서 ca-pub- 접두사 제거
  const publisherId = adsenseId.replace('ca-pub-', '');
  
  // ads.txt 내용 생성
  const adsContent = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0`;
  
  // public 디렉토리에 ads.txt 파일 생성
  const publicDir = path.join(__dirname, 'public');
  const adsFilePath = path.join(publicDir, 'ads.txt');
  
  try {
    // public 디렉토리가 없으면 생성
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // ads.txt 파일 생성
    fs.writeFileSync(adsFilePath, adsContent);
    console.log('✅ ads.txt 파일이 성공적으로 생성되었습니다:', adsFilePath);
    console.log('📄 내용:', adsContent);
  } catch (error) {
    console.error('❌ ads.txt 파일 생성 중 오류 발생:', error);
  }
}

// Next.js 구성 로드 시 ads.txt 생성
generateAdsText();

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is cloud.umami.is https://www.googletagmanager.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://apis.google.com https://www.gstatic.com https://fundingchoicesmessages.google.com https://ep2.adtrafficquality.google;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src * blob: data:;
  media-src *.s3.amazonaws.com;
  connect-src * https://*.googleapis.com https://*.google.com https://*.firebaseio.com https://*.firebase.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-src giscus.app https://www.google.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://apis.google.com https://*.firebaseapp.com https://ep2.adtrafficquality.google;
`;

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  outputFileTracingRoot: __dirname,
  // Next.js 16+ Turbopack: SVG를 React 컴포넌트로 import할 수 있도록 설정
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    deviceSizes: [320, 420, 768, 1024, 1040, 1200, 1440],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1040],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'i.giphy.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      {
        // Google Search Console HTML 검증 파일을 API로 처리
        // 환경변수 GOOGLE_SITE_VERIFICATION_ID 설정 시 자동 동작
        source: '/:googlefile(google[a-z0-9]+\\.html)',
        destination: '/api/google-site-verification',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
});
