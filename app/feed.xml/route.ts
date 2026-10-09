import siteMetadata from '@/data/siteMetadata';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import { sortPosts } from '@/lib/types';

export const revalidate = 3600; // 1시간 캐시 — IndexNow 알림과 연동

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * RSS 2.0 피드 — /feed.xml
 *
 * layout의 <link rel="alternate" type="application/rss+xml">가 이 라우트를
 * 가리키며, robots.txt에 함께 노출된다.
 */
export async function GET() {
  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const sorted = sortPosts(allPosts).slice(0, 30);

  const items = sorted
    .map((post) => {
      const url = `${siteMetadata.siteUrl}/blog/${post.category || 'dev'}/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      const lastmod = new Date(post.lastmod || post.date).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.summary || '')}</description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <lastBuildDate>${lastmod}</lastBuildDate>
      <category>${escapeXml(post.category || 'dev')}</category>
      ${(post.tags || []).map((t) => `      <category>${escapeXml(t)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteMetadata.title)}</title>
    <description>${escapeXml(siteMetadata.description)}</description>
    <link>${siteMetadata.siteUrl}</link>
    <atom:link href="${siteMetadata.siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
