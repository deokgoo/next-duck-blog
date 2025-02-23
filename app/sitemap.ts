import siteMetadata from '@/data/siteMetadata';
import { allBlogs } from 'contentlayer/generated';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl;
  const cleanSlug = (slug) =>
    slug
      .trim()
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

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
