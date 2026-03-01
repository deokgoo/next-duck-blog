import { sortPosts, allCoreContent } from '@/lib/types';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import Main from './Main';

export const revalidate = 31536000; // 1년 — 사실상 영구 캐시, revalidatePath()로 수동 갱신

export default async function Page() {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPosts(allPosts.filter(isPostPublishedAndReady));
  const posts = allCoreContent(sortedPosts);
  return <Main posts={posts} />;
}
