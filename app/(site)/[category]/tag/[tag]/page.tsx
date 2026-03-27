import { notFound } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getTagsByCategory, isPostPublishedAndReady } from '@/lib/firestore';
import { categoriesData, CategoryKey } from '@/data/categoriesData';
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';

export const revalidate = 31536000;

export async function generateMetadata(props: {
  params: Promise<{ category: string; tag: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const category = params.category as CategoryKey;
  const tag = decodeURI(params.tag);
  const data = categoriesData[category];

  if (!data) return;

  return genPageMetadata({
    title: `${tag} in ${data.title}`,
    description: `${tag} tagged posts in ${data.title} category`,
  });
}

export async function generateStaticParams() {
  const categories = Object.keys(categoriesData);
  const paths: { category: string; tag: string }[] = [];

  for (const category of categories) {
    const tags = await getTagsByCategory(category);
    for (const tag of Object.keys(tags)) {
      paths.push({ category, tag });
    }
  }

  return paths;
}

export default async function CategoryTagPage(props: {
  params: Promise<{ category: string; tag: string }>;
}) {
  const params = await props.params;
  const category = params.category as CategoryKey;
  const tag = decodeURI(params.tag);
  const data = categoriesData[category];

  if (!data) {
    return notFound();
  }

  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const filteredPosts = allPosts.filter(
    (post) => (post.category || 'dev') === category && post.tags.includes(tag)
  );

  const sortedPosts = sortPosts(filteredPosts);
  const tags = await getTagsByCategory(category);

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      title={`${tag} | ${data.title}`}
      tags={tags}
    />
  );
}
