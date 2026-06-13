import { notFound } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';

type SupportedLocale = 'en' | 'jp';

const getValidCategories = async () => {
  const posts = await getAllPosts();
  const cats = new Set(posts.map((p) => p.category || 'dev'));
  ['dev', 'travel', 'hobby', 'life'].forEach((c) => cats.add(c));
  return Array.from(cats);
};

export async function generateLocaleBlogCategoryParams(locale: SupportedLocale) {
  const categories = await getValidCategories();
  return categories.map((category) => ({ category }));
}

export async function LocaleBlogCategoryPage({
  locale,
  category,
}: {
  locale: SupportedLocale;
  category: string;
}) {
  const VALID_CATEGORIES = await getValidCategories();
  if (!VALID_CATEGORIES.includes(category)) return notFound();

  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);

  const localePosts = allPosts
    .filter((p) => (p.category || 'dev') === category)
    .filter((p) => !!p.translations?.[locale])
    .map((p) => ({
      ...p,
      title: p.translations![locale]!.title,
      summary: p.translations![locale]!.summary,
    }));

  const sortedPosts = sortPosts(localePosts);

  const tagCounts: Record<string, number> = {};
  localePosts.forEach((p) => {
    p.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const title = `${category.charAt(0).toUpperCase() + category.slice(1)} Posts`;

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      title={title}
      tags={tagCounts}
    />
  );
}
