import { sortPosts, allCoreContent } from '@/lib/types';
import { getAllPosts } from '@/lib/firestore';
import Main from './Main';

export default async function Page() {
  const sortedPosts = sortPosts(await getAllPosts());
  const posts = allCoreContent(sortedPosts);
  return <Main posts={posts} />;
}
