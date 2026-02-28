import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags, isPostPublishedAndReady } from '@/lib/firestore';

export const revalidate = 31536000; // 1년 — 사실상 영구 캐시, revalidatePath()로 수동 갱신 // ISR 1시간 주기 재검증 + 수동 캐시 무효화

const POSTS_PER_PAGE = 5;

export async function generateStaticParams() {
  const posts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const allBlogs = (await getAllPosts()).filter(isPostPublishedAndReady);
  const posts = allCoreContent(sortPosts(allBlogs));
  const pageNumber = parseInt(params.page as string);
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  );
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  };
  const tags = await getAllTags();

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
      tags={tags}
    />
  );
}
