import 'css/tailwind.css';

export const revalidate = false; // 수동 캐시 무효화만 사용

import { Space_Grotesk, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics, AnalyticsConfig } from 'pliny/analytics';
import siteMetadata from '@/data/siteMetadata';
import { ThemeProviders } from './theme-providers';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { LocaleLangSync } from '@/components/LocaleLangSync';
import { Metadata } from 'next';
import { getAuthorBySlug } from '@/lib/firestore';

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

const firaCode = localFont({
  src: '../public/fonts/FiraCode-VF.ttf',
  display: 'swap',
  weight: '300 700',
  variable: '--font-fira-code',
});

export async function generateMetadata(): Promise<Metadata> {
  const authorData = await getAuthorBySlug('default');

  // Firestore blogTitle에 " | 서픽스"가 남아있을 수 있어(과거 값)
  // 파이프 이후는 제거하고, 없으면 siteMetadata.title로 폴백한다.
  const rawTitle = authorData?.blogTitle || siteMetadata.title;
  const title = rawTitle.split('|')[0].trim() || siteMetadata.title;
  const description = authorData?.blogDescription || siteMetadata.description;
  const socialBanner = authorData?.socialBanner || siteMetadata.socialBanner;

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: title,
      template: '%s',
    },
    description: description,
    openGraph: {
      title: title,
      description: description,
      // url은 각 페이지가 스스로 설정 (root에서 두면 모든 페이지에 루트 URL 유입)
      siteName: title,
      images: [socialBanner],
      // locale은 각 페이지(로케일)가 스스로 설정 — root에서 ko_KR을 두면
      // /en, /jp 페이지에 한국어 locale이 유입된다
      type: 'website',
    },
    // canonical/hreflang/robots는 각 페이지가 스스로 설정한다.
    // (root layout에 두면 모든 페이지에 홈 값이 유입되는 bug)
    alternates: {
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
      },
    },
    twitter: {
      title: title,
      card: 'summary_large_image',
      images: [socialBanner],
      description: description,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authorData = await getAuthorBySlug('default');
  const favicon = authorData?.favicon || '/static/favicons/favicon-32x32.png';

  return (
    <html
      lang={siteMetadata.language}
      className={`${pretendard.variable} ${inter.variable} ${space_grotesk.variable} ${firaCode.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" sizes="76x76" href={favicon} />
        <link rel="icon" type="image/png" sizes="32x32" href={favicon} />
        <link rel="icon" type="image/png" sizes="16x16" href={favicon} />
        <link rel="manifest" href="/static/favicons/site.webmanifest" />
        <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID && (
          <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID} />
        )}
        {process.env.GOOGLE_SITE_VERIFICATION_ID && (
          <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION_ID} />
        )}
      </head>
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <body className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-black dark:text-white">
        <LocaleLangSync />
        <ThemeProviders>
          <AuthProvider>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            {children}
          </AuthProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
