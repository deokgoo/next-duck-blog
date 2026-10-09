import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';

interface PageSEOProps {
  title: string;
  description?: string;
  image?: string;
  // canonical 경로 (예: '/blog', '/about'). 생략 시 self URL을 호출부에서
  // generateMetadata로 구성해야 한다 — 이 헬퍼는 정적 metadata만 지원한다.
  path?: string;
  // og:locale — ko 페이지는 'ko_KR', en은 'en_US', jp는 'ja_JP'
  locale?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * 정적 페이지용 metadata 헬퍼.
 *
 * ⚠️ canonical은 `path`를 반드시 함께 전달할 것.
 * 과거 버전에 canonical이 항상 루트(siteUrl)로 고정되어 모든 페이지가
 * 루트로 canonical되는 bug가 있었다 — path 미지정 시 canonical을 내지 않는다.
 */
export function genPageMetadata({ title, description, image, path, locale = 'ko_KR', ...rest }: PageSEOProps): Metadata {
  const url = path ? `${siteMetadata.siteUrl}${path === '/' ? '' : path}` : undefined;

  return {
    title,
    ...(url && {
      alternates: {
        canonical: url,
      },
    }),
    openGraph: {
      title,
      description: description || siteMetadata.description,
      ...(url && { url }),
      siteName: siteMetadata.title,
      images: image ? [image] : [siteMetadata.socialBanner],
      locale,
      type: 'website',
    },
    twitter: {
      title,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
    },
    ...rest,
  };
}
