import siteMetadata from '@/data/siteMetadata';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import { MetadataRoute } from 'next';

export const revalidate = 3600; // 1시간 캐시 (IndexNow 알림과 연동하여 최신 콘텐츠 반영)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteMetadata.siteUrl;
  const cleanSlug = (slug: string) => slug.trim();

  // 기본 라우트 (높은 우선순위)
  const routes = ['', 'blog', 'projects', 'about', 'search'].map((route) => ({
    url: `${siteUrl}/${cleanSlug(route)}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // EN/JP 홈 페이지
  const localeRoutes = ['en', 'jp'].map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const allBlogs = await getAllPosts();
  const publishedPosts = allBlogs.filter(isPostPublishedAndReady);

  // KR 블로그 포스트
  const blogRoutes = publishedPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.category || 'dev'}/${cleanSlug(post.slug)}`,
    lastModified: new Date(post.lastmod || post.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // EN/JP 번역 포스트 (translations 필드가 있는 것만)
  const localePostRoutes: MetadataRoute.Sitemap = [];
  for (const post of publishedPosts) {
    const category = post.category || 'dev';
    const slug = cleanSlug(post.slug);
    const lastMod = new Date(post.lastmod || post.date).toISOString();

    if (post.translations?.en) {
      localePostRoutes.push({
        url: `${siteUrl}/en/blog/${category}/${slug}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
    if (post.translations?.jp) {
      localePostRoutes.push({
        url: `${siteUrl}/jp/blog/${category}/${slug}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return [...routes, ...localeRoutes, ...blogRoutes, ...localePostRoutes] as MetadataRoute.Sitemap;
}
