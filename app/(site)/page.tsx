import { sortPosts, allCoreContent } from '@/lib/types';
import { getAllPosts, getAuthorBySlug, isPostPublishedAndReady } from '@/lib/firestore';
import Main from './Main';
import type { Locale } from '@/lib/i18n/messages';
import siteMetadata from '@/data/siteMetadata';
import { Metadata } from 'next';

export const revalidate = false; // 영구 캐시 — revalidatePath()로 온디맨드 갱신 전용

/**
 * 홈 3개 언어(ko/en/jp)의 hreflang.
 * 홈은 3개 언어 모두 존재하므로 3개 + x-default를 함께 낸다.
 */
export function homeHreflang(): Metadata['alternates'] {
  const base = siteMetadata.siteUrl;
  return {
    languages: {
      ko: base,
      en: `${base}/en`,
      ja: `${base}/jp`,
      'x-default': base,
    },
  };
}

/**
 * 홈 페이지 metadata — self canonical + 3개 언어 hreflang.
 * root layout은 canonical/locale을 내지 않으므로(모든 페이지에 유입되는 bug 방지)
 * 홈 3개 라우트(/, /en, /jp)가 각자 이 헬퍼를 사용해 설정한다.
 */
export function homeMetadata(options: {
  path: string; // '/', '/en', '/jp'
  title: string;
  description: string;
  locale: string; // 'ko_KR' | 'en_US' | 'ja_JP'
}): Metadata {
  const url = `${siteMetadata.siteUrl}${options.path === '/' ? '' : options.path}`;
  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical: url,
      ...homeHreflang(),
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: siteMetadata.title,
      images: [siteMetadata.socialBanner],
      locale: options.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [siteMetadata.socialBanner],
    },
  };
}

/**
 * 홈 페이지 공용 데이터 로딩.
 * ko 기본 라우트와 /en, /jp 라우트가 함께 사용한다.
 */
export async function HomePage({ locale = 'ko' }: { locale?: Locale }) {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPosts(allPosts.filter(isPostPublishedAndReady));
  const posts = allCoreContent(sortedPosts);

  let featuredTags: string[] = [];
  let blogDescription: string | undefined = undefined;
  try {
    const author = await getAuthorBySlug('default');
    featuredTags = author?.featuredTags ?? [];
    blogDescription = author?.blogDescription;
  } catch {
    featuredTags = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteMetadata.title,
            url: siteMetadata.siteUrl,
            logo: `${siteMetadata.siteUrl}${siteMetadata.image}`,
            sameAs: siteMetadata.github
              ? [siteMetadata.github]
              : [],
          }),
        }}
      />
      <Main posts={posts} locale={locale} featuredTags={featuredTags} description={blogDescription} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  let description = siteMetadata.description;
  try {
    const author = await getAuthorBySlug('default');
    description = author?.blogDescription || description;
  } catch {
    // Firestore 접근 실패 시 siteMetadata.description 사용
  }
  return homeMetadata({
    path: '/',
    title: siteMetadata.title,
    description,
    locale: 'ko_KR',
  });
}

export default async function Page() {
  return <HomePage locale="ko" />;
}
