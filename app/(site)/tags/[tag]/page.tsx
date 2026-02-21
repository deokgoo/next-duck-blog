import { slug } from 'github-slugger';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags, isPostPublishedAndReady } from '@/lib/firestore';
import siteMetadata from '@/data/siteMetadata';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const tag = decodeURI(params.tag);
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  });
}

export const generateStaticParams = async () => {
  const tagCounts = await getAllTags();
  const tagKeys = Object.keys(tagCounts);
  const paths = tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }));
  return paths;
};

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  const tag = decodeURI(params.tag);
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1);
  const allBlogs = (await getAllPosts()).filter(isPostPublishedAndReady);
  const filteredPosts = allCoreContent(
    sortPosts(allBlogs.filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)))
  );
  const tags = await getAllTags();
  return <ListLayout posts={filteredPosts} title={title} tags={tags} />;
}
