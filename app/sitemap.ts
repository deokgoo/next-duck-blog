import siteMetadata from '@/data/siteMetadata';
import { allBlogs } from 'contentlayer/generated';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl;
  const cleanSlug = (slug: string) =>
    slug
      .trim()
      .replace(/[^\x20-\x7E]/g, '') // ASCII 범위 이외 문자 제거
      .replace(/\s+/g, '-') // 공백을 `-`로 변경
      .replace(/[^\w-/]/g, ''); // `/`도 허용

  // 기본 라우트 (높은 우선순위)
  const routes = ['', 'blog', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${cleanSlug(route)}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 블로그 포스트 (중간 우선순위)
  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/blog/${cleanSlug(post.slug)}`,
      lastModified: new Date(post.lastmod || post.date).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...routes, ...blogRoutes] as MetadataRoute.Sitemap;
}
