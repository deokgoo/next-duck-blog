import { sortPosts, allCoreContent } from '@/lib/types';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import Main from './Main';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPosts(allPosts.filter(isPostPublishedAndReady));
  const posts = allCoreContent(sortedPosts);
  return <Main posts={posts} />;
}
