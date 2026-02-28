import 'css/tailwind.css';
import 'pliny/search/algolia.css';

export const revalidate = false; // 수동 캐시 무효화만 사용

import { Space_Grotesk, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics, AnalyticsConfig } from 'pliny/analytics';
import { SearchProvider, SearchConfig } from 'pliny/search';
import siteMetadata from '@/data/siteMetadata';
import { ThemeProviders } from './theme-providers';
import { AuthProvider } from '@/lib/auth/AuthContext';
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
  
  const title = authorData?.blogTitle || siteMetadata.title;
  const description = authorData?.blogDescription || siteMetadata.description;
  const socialBanner = authorData?.socialBanner || siteMetadata.socialBanner;

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: './',
      siteName: title,
      images: [socialBanner],
      locale: 'ko_KR',
      type: 'website',
    },
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    twitter: {
      title: title,
      card: 'summary_large_image',
      images: [socialBanner],
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
      </head>
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <body className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white">
        <ThemeProviders>
          <AuthProvider>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
              {children}
            </SearchProvider>
          </AuthProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
