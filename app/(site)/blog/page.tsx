import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags, isPostPublishedAndReady } from '@/lib/firestore';
import { genPageMetadata } from 'app/seo';

export const revalidate = false; // 영구 캐시 — revalidatePath()로 온디맨드 갱신 전용

export const metadata = genPageMetadata({
  title: 'Blog',
  path: '/blog',
  description: '대규모 웹 아키텍처, 로컬 AI 최적화, 프론트엔드 심층 기술과 실전 엔지니어링 기록.',
});

export default async function BlogPage() {
  const posts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const sortedPosts = sortPosts(posts);
  const tags = await getAllTags();

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      title="All Posts"
      tags={tags}
    />
  );
}
