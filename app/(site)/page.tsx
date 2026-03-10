import { sortPosts, allCoreContent } from '@/lib/types';
import { getAllPosts, getAuthorBySlug, isPostPublishedAndReady } from '@/lib/firestore';
import Main from './Main';

export const revalidate = 31536000; // 1년 — 사실상 영구 캐시, revalidatePath()로 수동 갱신

export default async function Page() {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPosts(allPosts.filter(isPostPublishedAndReady));
  const posts = allCoreContent(sortedPosts);

  let featuredTags: string[] = [];
  let blogDescription: string | undefined = undefined;
  try {
    const author = await getAuthorBySlug('default');
    featuredTags = author?.featuredTags ?? [];
    blogDescription = author?.blogDescription;
  } catch {
    featuredTags = [];
  }

  return <Main posts={posts} featuredTags={featuredTags} description={blogDescription} />;
}
