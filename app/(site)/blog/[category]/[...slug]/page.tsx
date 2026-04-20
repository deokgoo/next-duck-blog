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
import type { Authors, Post as Blog } from '@/lib/types';
import PostSimple from '@/layouts/PostSimple';
import PostLayout from '@/layouts/PostLayout';
import PostBanner from '@/layouts/PostBanner';
import PostModern from '@/layouts/PostModern';
import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import { notFound } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';

const defaultLayout = 'PostLayout';
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
  PostModern,
};

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string[] }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const category = decodeURI(params.category);
  const slug = decodeURI(params.slug.join('/'));

  // SEO Redirect Fallback Check
  const posts = await getAllPosts();
  const validSet = new Set(posts.map((p) => p.category || 'dev'));
  ['dev', 'travel', 'hobby', 'life'].forEach((c) => validSet.add(c));
  const VALID_CATEGORIES = Array.from(validSet);

  const isOldRoute = !VALID_CATEGORIES.includes(category);
  const postSlugToFind = isOldRoute ? `${category}/${slug}` : slug;

  const post = await getPostBySlug(postSlugToFind);

  if (!post || !isPostPublishedAndReady(post) || isOldRoute) {
    return;
  }
  const authorList = post?.authors || ['default'];
  const authorDetails = await Promise.all(
    authorList.map(async (authorSlug) => {
      const authorResults = await getAuthorBySlug(authorSlug);
      return coreContent(
        (authorResults || allAuthors.find((p) => p.slug === authorSlug) || allAuthors[0]) as Authors
      );
    })
  );
  if (!post) {
    return;
  }

  const publishedAt = new Date(post.date).toISOString();
  const modifiedAt = new Date(post.lastmod || post.date).toISOString();
  const authors = authorDetails.map((author) => author.name);
  let imageList = [siteMetadata.socialBanner];
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images;
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    };
  });

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  };
}
export async function generateStaticParams() {
  const posts = (await getAllPosts()).filter(isPostPublishedAndReady);
  return posts.map((post) => ({
    category: post.category || 'dev',
    slug: post.slug.split('/'),
  }));
}

export const revalidate = 31536000; // 1년 — 사실상 영구 캐시, revalidatePath()로 수동 갱신

export default async function Page(props: {
  params: Promise<{ category: string; slug: string[] }>;
}) {
  const params = await props.params;
  const category = decodeURI(params.category);
  const slug = decodeURI(params.slug.join('/'));

  const posts = await getAllPosts();
  const validSet = new Set(posts.map((p) => p.category || 'dev'));
  ['dev', 'travel', 'hobby', 'life'].forEach((c) => validSet.add(c));
  const VALID_CATEGORIES = Array.from(validSet);

  const isOldRoute = !VALID_CATEGORIES.includes(category);
  const postSlugToFind = isOldRoute ? `${category}/${slug}` : slug;

  // 해당 포스트를 직접 조회 (slug 기반)
  const postItem = await getPostBySlug(postSlugToFind);
  if (!postItem || postItem.status === 'deleted') {
    return notFound();
  }

  // SEO 308 Redirect for Old URLs
  if (isOldRoute) {
    const redirectCategory = postItem.category || 'dev';
    const { redirect } = await import('next/navigation');
    redirect(`/blog/${redirectCategory}/${postSlugToFind}`, 'replace' as any); // Replace forces Next 14+ 308 permanent redirect automatically if outside try-catch, but standard is redirect(url, 'replace') or permanentRedirect. We use simple redirect for edge safety or permanentRedirect if imported. Next.js permanentRedirect does 308.
  }

  // prev/next 계산을 위해 카테고리 내 포스트 목록 조회
  const allPosts = (await getAllPosts())
    .filter(isPostPublishedAndReady)
    .filter((p) => (p.category || 'dev') === category);

  const sortedCoreContents = sortPosts(allPosts);
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug);

  const prevItem = postIndex >= 0 ? sortedCoreContents[postIndex + 1] : undefined;
  const nextItem = postIndex >= 0 ? sortedCoreContents[postIndex - 1] : undefined;

  // Add path to prev/next for layout compatibility
  const prev = prevItem ? { ...prevItem, path: `blog/${category}/${prevItem.slug}` } : undefined;
  const next = nextItem ? { ...nextItem, path: `blog/${category}/${nextItem.slug}` } : undefined;

  // Add readingTime to post
  const wordCount = postItem.content.split(/\s+/gu).length;
  const readingTime = { minutes: Math.ceil(wordCount / 200) };
  const post = { ...postItem, readingTime };

  const authorList = post?.authors || ['default'];
  const authorDetails = await Promise.all(
    authorList.map(async (authorSlug) => {
      const authorResults = await getAuthorBySlug(authorSlug);
      // fallback if Firestore returns null and mock isn't found
      return coreContent(
        (authorResults || allAuthors.find((a) => a.slug === authorSlug) || allAuthors[0]) as Authors
      );
    })
  );
  const mainContent = coreContent(post);

  // Structured Data (JSON-LD) - basic fallback if not in post
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.lastmod || post.date,
    description: post.summary,
    author: authorDetails.map((author) => ({
      '@type': 'Person',
      name: author.name,
    })),
  };

  const Layout = layouts[post.layout || defaultLayout];

  // MDX 파서가 **"텍스트"** 패턴에서 따옴표를 JSX attribute로 오해하는 문제 방지
  // 코드 블록(``` 또는 `)을 보존하면서 그 바깥의 **...** 를 <strong> 태그로 변환
  const sanitizedContent = post.content
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((segment: string, i: number) => {
      if (i % 2 === 1) return segment; // 코드 블록은 그대로
      return segment.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    })
    .join('');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXRemote
          source={sanitizedContent}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
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
