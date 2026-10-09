import siteMetadata from '@/data/siteMetadata';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import { MetadataRoute } from 'next';

export const revalidate = 3600; // 1시간 캐시 (IndexNow 알림과 연동하여 최신 콘텐츠 반영)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteMetadata.siteUrl;
  const cleanSlug = (slug: string) => slug.trim();

  // 기본 라우트 (높은 우선순위)
  // /search는 noindex 페이지라 sitemap에 포함하지 않는다
  const routes = ['', 'blog', 'projects', 'about'].map((route) => ({
    url: `${siteUrl}/${cleanSlug(route)}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // EN/JP 홈 페이지 — 홈 3개 언어는 hreflang으로 연결
  const homeHreflang = {
    ko: siteUrl,
    en: `${siteUrl}/en`,
    ja: `${siteUrl}/jp`,
    'x-default': siteUrl,
  };

  const localeRoutes = [
    {
      url: `${siteUrl}/en`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: { languages: homeHreflang },
    },
    {
      url: `${siteUrl}/jp`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: { languages: homeHreflang },
    },
  ];

  const allBlogs = await getAllPosts();
  const publishedPosts = allBlogs.filter(isPostPublishedAndReady);

  // KR 블로그 포스트 — 번역본이 있으면 hreflang 포함
  const blogRoutes: MetadataRoute.Sitemap = publishedPosts.map((post) => {
    const category = post.category || 'dev';
    const slug = cleanSlug(post.slug);
    const koUrl = `${siteUrl}/blog/${category}/${slug}`;
    const hasEn = !!post.translations?.en;
    const hasJp = !!post.translations?.jp;

    return {
      url: koUrl,
      lastModified: new Date(post.lastmod || post.date).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          ko: koUrl,
          ...(hasEn && { en: `${siteUrl}/en/blog/${category}/${slug}` }),
          ...(hasJp && { ja: `${siteUrl}/jp/blog/${category}/${slug}` }),
          'x-default': koUrl,
        },
      },
    };
  });

  // EN/JP 번역 포스트 (translations 필드가 있는 것만)
  const localePostRoutes: MetadataRoute.Sitemap = [];
  for (const post of publishedPosts) {
    const category = post.category || 'dev';
    const slug = cleanSlug(post.slug);
    const lastMod = new Date(post.lastmod || post.date).toISOString();
    const koUrl = `${siteUrl}/blog/${category}/${slug}`;
    const hasEn = !!post.translations?.en;
    const hasJp = !!post.translations?.jp;

    const languages = {
      ko: koUrl,
      ...(hasEn && { en: `${siteUrl}/en/blog/${category}/${slug}` }),
      ...(hasJp && { ja: `${siteUrl}/jp/blog/${category}/${slug}` }),
      'x-default': koUrl,
    };

    if (hasEn) {
      localePostRoutes.push({
        url: `${siteUrl}/en/blog/${category}/${slug}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages },
      });
    }
    if (hasJp) {
      localePostRoutes.push({
        url: `${siteUrl}/jp/blog/${category}/${slug}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  return [...routes, ...localeRoutes, ...blogRoutes, ...localePostRoutes] as MetadataRoute.Sitemap;
}
