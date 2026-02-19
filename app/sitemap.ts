import siteMetadata from '@/data/siteMetadata';
import { getAllPosts } from '@/lib/firestore';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteMetadata.siteUrl;
  const cleanSlug = (slug: string) => slug.trim();

  // 기본 라우트 (높은 우선순위)
  const routes = ['', 'blog', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${cleanSlug(route)}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  const allBlogs = await getAllPosts();

  // 블로그 포스트 (중간 우선순위)
  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/blog/${cleanSlug(post.slug)}`,
      lastModified: new Date(post.lastmod || post.date).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...routes, ...blogRoutes] as MetadataRoute.Sitemap;
}
