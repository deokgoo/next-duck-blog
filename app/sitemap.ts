import siteMetadata from '@/data/siteMetadata';
import { allBlogs } from 'contentlayer/generated';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl;
  const cleanSlug = (slug) =>
    slug
      .trim()
      .replace(/[^\x20-\x7E]/g, '') // ASCII 범위 이외 문자 제거
      .replace(/\s+/g, '-') // 공백을 `-`로 변경
      .replace(/[^\w-/]/g, ''); // `/`도 허용

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${cleanSlug(post.path)}`,
      lastModified: cleanSlug(post.lastmod || post.date),
    }));

  const routes = ['', 'blog', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${cleanSlug(route)}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes, ...blogRoutes];
}
