import 'css/prism.css';
import 'katex/dist/katex.css';

import { components } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug, getAuthorBySlug, isPostPublishedAndReady } from '@/lib/firestore';
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
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));
  const post = await getPostBySlug(slug);

  if (!post || !isPostPublishedAndReady(post)) {
    return;
  }
  const authorList = post?.authors || ['default'];
  const authorDetails = await Promise.all(
    authorList.map(async (authorSlug) => {
      const authorResults = await getAuthorBySlug(authorSlug);
      return coreContent((authorResults || allAuthors.find((p) => p.slug === authorSlug) || allAuthors[0]) as Authors);
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

export const generateStaticParams = async () => {
  const posts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const paths = posts.map((p) => ({ slug: p.slug.split('/') }));
  return paths;
};

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));
  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const sortedCoreContents = sortPosts(allPosts);
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug);
  
  if (postIndex === -1) {
    return notFound();
  }

  const prevItem = sortedCoreContents[postIndex + 1];
  const nextItem = sortedCoreContents[postIndex - 1];
  const postItem = sortedCoreContents[postIndex];

  // Add path to prev/next for layout compatibility
  const prev = prevItem ? { ...prevItem, path: `blog/${prevItem.slug}` } : undefined;
  const next = nextItem ? { ...nextItem, path: `blog/${nextItem.slug}` } : undefined;
  
  // Add readingTime to post
  const wordCount = postItem.content.split(/\s+/gu).length;
  const readingTime = { minutes: Math.ceil(wordCount / 200) };
  const post = { ...postItem, readingTime };
  
  const authorList = post?.authors || ['default'];
  const authorDetails = await Promise.all(
    authorList.map(async (authorSlug) => {
      const authorResults = await getAuthorBySlug(authorSlug);
      // fallback if Firestore returns null and mock isn't found
      return coreContent((authorResults || allAuthors.find(a => a.slug === authorSlug) || allAuthors[0]) as Authors);
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
