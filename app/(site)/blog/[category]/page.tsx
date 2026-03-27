import { notFound, redirect } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags, isPostPublishedAndReady, getPostBySlug } from '@/lib/firestore';
import { genPageMetadata } from 'app/seo';

import { Metadata } from 'next';

export const revalidate = 31536000;
const POSTS_PER_PAGE = 5;

// Dynamic categories helper
const getValidCategories = async () => {
  const posts = await getAllPosts();
  const cats = new Set(posts.map((p) => p.category || 'dev'));
  ['dev', 'travel', 'hobby', 'life'].forEach((c) => cats.add(c));
  return Array.from(cats);
};

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata | undefined> {
  const params = await props.params;
  const category = decodeURI(params.category);
  const VALID_CATEGORIES = await getValidCategories();

  if (!VALID_CATEGORIES.includes(category)) return;

  const title = category.charAt(0).toUpperCase() + category.slice(1);
  return genPageMetadata({
    title,
    description: `${title} Category Posts`,
  });
}

export async function generateStaticParams() {
  const VALID_CATEGORIES = await getValidCategories();
  return VALID_CATEGORIES.map((c) => ({ category: c }));
}

export default async function CategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const category = decodeURI(params.category);
  const VALID_CATEGORIES = await getValidCategories();

  // 1. SEO Fallback for Old URLs (e.g. /blog/my-post -> category = 'my-post')
  if (!VALID_CATEGORIES.includes(category)) {
    const postItem = await getPostBySlug(category);
    if (!postItem || postItem.status === 'deleted') {
      return notFound();
    }
    const redirectCategory = postItem.category || 'dev';
    redirect(`/blog/${redirectCategory}/${category}`);
  }

  // 2. Redirect /blog/[category] to /[category] (New Landing Page)
  redirect(`/${category}`);
}
