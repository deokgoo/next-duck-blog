import 'css/prism.css';
import 'katex/dist/katex.css';

import { components } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getAllPosts,
  getPostBySlug,
  getAuthorBySlug,
  isPostPublishedAndReady,
} from '@/lib/firestore';
import { sortPosts, coreContent, allAuthors } from '@/lib/types';
import type { Authors } from '@/lib/types';
import PostSimple from '@/layouts/PostSimple';
import PostLayout from '@/layouts/PostLayout';
import PostBanner from '@/layouts/PostBanner';
import PostModern from '@/layouts/PostModern';
import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import { notFound } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSmartypants from 'remark-smartypants';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';
import { resolvePostForLocale } from '@/lib/i18n';

type SupportedLocale = 'en' | 'jp';

const defaultLayout = 'PostLayout';
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
  PostModern,
};

export async function generateLocalePostParams(locale: SupportedLocale) {
  const posts = (await getAllPosts()).filter(isPostPublishedAndReady);
  return posts
    .filter((p) => !!p.translations?.[locale])
    .map((post) => ({
      category: post.category || 'dev',
      slug: post.slug.split('/'),
    }));
}

export async function generateLocalePostMetadata(
  locale: SupportedLocale,
  category: string,
  slug: string
): Promise<Metadata | undefined> {
  const post = await getPostBySlug(slug);
  if (!post || !isPostPublishedAndReady(post)) return;

  const localizedPost = resolvePostForLocale(post, locale);
  if (!localizedPost) return;

  const authorList = post.authors || ['default'];
  const authorDetails = await Promise.all(
    authorList.map(async (authorSlug) => {
      const result = await getAuthorBySlug(authorSlug);
      return coreContent(
        (result || allAuthors.find((p) => p.slug === authorSlug) || allAuthors[0]) as Authors
      );
    })
  );

  const publishedAt = new Date(post.date).toISOString();
  const modifiedAt = new Date(post.lastmod || post.date).toISOString();
  const authors = authorDetails.map((a) => a.name);

  let imageList = [siteMetadata.socialBanner];
  if (post.images && post.images.length > 0) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images;
  }
  const ogImages = imageList.map((img) => ({
    url: img.includes('http') ? img : siteMetadata.siteUrl + img,
  }));

  const koUrl = `${siteMetadata.siteUrl}/blog/${category}/${slug}`;
  const hasEn = !!post.translations?.en;
  const hasJp = !!post.translations?.jp;

  return {
    title: localizedPost.title,
    description: localizedPost.summary,
    alternates: {
      canonical: koUrl,
      languages: {
        ko: koUrl,
        ...(hasEn && { en: `${siteMetadata.siteUrl}/en/blog/${category}/${slug}` }),
        ...(hasJp && { ja: `${siteMetadata.siteUrl}/jp/blog/${category}/${slug}` }),
        'x-default': koUrl,
      },
    },
    openGraph: {
      title: localizedPost.title,
      description: localizedPost.summary,
      siteName: siteMetadata.title,
      locale: locale === 'en' ? 'en_US' : 'ja_JP',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: `${siteMetadata.siteUrl}/${locale}/blog/${category}/${slug}`,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: localizedPost.title,
      description: localizedPost.summary,
      images: imageList,
    },
  };
}

export async function LocalePostPage({
  locale,
  category,
  slugParts,
}: {
  locale: SupportedLocale;
  category: string;
  slugParts: string[];
}) {
  const slug = decodeURI(slugParts.join('/'));

  const postItem = await getPostBySlug(slug);
  if (!postItem || postItem.status === 'deleted') return notFound();

  const localizedPost = resolvePostForLocale(postItem, locale);
  if (!localizedPost) return notFound();

  const allPosts = (await getAllPosts())
    .filter(isPostPublishedAndReady)
    .filter((p) => (p.category || 'dev') === category);

  const sortedCoreContents = sortPosts(allPosts);
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug);

  const prevItem = postIndex >= 0 ? sortedCoreContents[postIndex + 1] : undefined;
  const nextItem = postIndex >= 0 ? sortedCoreContents[postIndex - 1] : undefined;

  const prev = prevItem ? { ...prevItem, path: `blog/${category}/${prevItem.slug}` } : undefined;
  const next = nextItem ? { ...nextItem, path: `blog/${category}/${nextItem.slug}` } : undefined;

  const wordCount = postItem.content.split(/\s+/gu).length;
  const readingTime = { minutes: Math.ceil(wordCount / 200) };
  const post = { ...localizedPost, readingTime };

  const authorList = post.authors || ['default'];
  const authorDetails = await Promise.all(
    authorList.map(async (authorSlug) => {
      const result = await getAuthorBySlug(authorSlug);
      return coreContent(
        (result || allAuthors.find((a) => a.slug === authorSlug) || allAuthors[0]) as Authors
      );
    })
  );
  const mainContent = coreContent(post);

  const koUrl = `${siteMetadata.siteUrl}/blog/${category}/${slug}`;

  let imageList = [siteMetadata.socialBanner];
  if (post.images && post.images.length > 0) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images;
  }
  const ogImageUrl = imageList[0]?.includes('http')
    ? imageList[0]
    : `${siteMetadata.siteUrl}${imageList[0] ?? siteMetadata.socialBanner}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.lastmod || post.date).toISOString(),
    description: post.summary,
    url: koUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': koUrl },
    image: ogImageUrl,
    publisher: { '@type': 'Person', name: siteMetadata.author },
    author: authorDetails.map((a) => ({ '@type': 'Person', name: a.name })),
  };

  const Layout = layouts[post.layout || defaultLayout];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXRemote
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath, remarkSmartypants],
              rehypePlugins: [
                rehypeSlug,
                rehypeAutolinkHeadings,
                rehypeKatex,
                [rehypePrismPlus, { ignoreMissing: true }],
              ],
            },
          }}
        />
      </Layout>
    </>
  );
}
