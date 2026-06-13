import { notFound } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getTagsByCategory, isPostPublishedAndReady } from '@/lib/firestore';
import { categoriesData, CategoryKey } from '@/data/categoriesData';
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';

export const revalidate = false; // 영구 캐시 — revalidatePath()로 온디맨드 갱신 전용

export async function generateMetadata(props: {
  params: Promise<{ category: string; tag: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const category = params.category as CategoryKey;
  const tag = decodeURI(params.tag);
  const data = categoriesData[category];

  if (!data) return;

  return genPageMetadata({
    title: `${data.title}의 ${tag}`,
    description: `${data.title} 카테고리의 ${tag} 관련 포스트 목록입니다.`,
  });
}

// generateStaticParams 제거: 빌드 시 모든 카테고리×태그 조합을 사전 생성하지 않음.
// 첫 요청 시 동적 렌더 후 Full Route Cache에 저장되며 (dynamicParams = true 기본값),
// 이후 동일 경로는 캐시에서 즉시 반환됨. 캐시 갱신은 revalidatePath()로 온디맨드 처리.

export default async function CategoryTagPage(props: {
  params: Promise<{ category: string; tag: string }>;
}) {
  const params = await props.params;
  const category = params.category as CategoryKey;
  const tag = decodeURI(params.tag);
  const data = categoriesData[category];

  if (!data) {
    return notFound();
  }

  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const filteredPosts = allPosts.filter(
    (post) => (post.category || 'dev') === category && post.tags.includes(tag)
  );

  const sortedPosts = sortPosts(filteredPosts);
  const tags = await getTagsByCategory(category);

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      title={`${tag} | ${data.title}`}
      tags={tags}
    />
  );
}
