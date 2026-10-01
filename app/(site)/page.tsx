import { sortPosts, allCoreContent } from '@/lib/types';
import { getAllPosts, getAuthorBySlug, isPostPublishedAndReady } from '@/lib/firestore';
import Main from './Main';
import type { Locale } from '@/lib/i18n/messages';

export const revalidate = false; // 영구 캐시 — revalidatePath()로 온디맨드 갱신 전용

/**
 * 홈 페이지 공용 데이터 로딩.
 * ko 기본 라우트와 /en, /jp 라우트가 함께 사용한다.
 */
export async function HomePage({ locale = 'ko' }: { locale?: Locale }) {
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

  return <Main posts={posts} locale={locale} featuredTags={featuredTags} description={blogDescription} />;
}

export default async function Page() {
  return <HomePage locale="ko" />;
}
