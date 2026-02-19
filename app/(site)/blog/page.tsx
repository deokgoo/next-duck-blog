import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags } from '@/lib/firestore';
import { genPageMetadata } from 'app/seo';

const POSTS_PER_PAGE = 5;

export const metadata = genPageMetadata({ title: 'Blog' });

export default async function BlogPage() {
  const posts = await getAllPosts();
  const sortedPosts = sortPosts(posts);
  const initialDisplayPosts = allCoreContent(sortedPosts.slice(0, POSTS_PER_PAGE));
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  };
  const tags = await getAllTags();

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
      tags={tags}
    />
  );
}
