import { notFound, redirect } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags, isPostPublishedAndReady, getPostBySlug, getTagsByCategory } from '@/lib/firestore';
import { genPageMetadata } from 'app/seo';

import { Metadata } from 'next';

export const revalidate = false; // 영구 캐시 — revalidatePath()로 온디맨드 갱신 전용


// Dynamic categories helper
const getValidCategories = async () => {
  const posts = await getAllPosts();
  const cats = new Set(posts.map((p) => p.category || 'dev'));
  ['architecture', 'ai', 'web', 'career', 'dev'].forEach((c) => cats.add(c));
  return Array.from(cats);
};

// 카테고리별 설명
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    architecture: '대규모 웹 시스템 아키텍처, Next.js + AWS 인프라 구축, 성능 최적화 및 캐싱 전략을 공유합니다.',
    ai: 'Mac Studio 로컬 LLM 운영, AI 에이전트 워크플로우, 프롬프트 엔지니어링 및 개발 자동화 실전기를 다룹니다.',
    web: 'React/Next.js 생태계, Web Components (Lit), HLS 스트리밍, 브라우저 인터널 및 프론트엔드 심층 기술을 소개합니다.',
    career: '기술 의사결정의 이유(Why), 채용 및 기술 면접 기준, 8년 차 프로덕트 엔지니어의 경험과 회고를 기록합니다.',
    dev: '소프트웨어 엔지니어링 실무 경험과 개발 도구, 코드 설계 가이드를 다룹니다.',
    react: 'React, Next.js, 상태관리 등 React 생태계의 최신 기술과 실전 팁을 다룹니다.',
    js: 'JavaScript, TypeScript의 핵심 개념과 실무 활용법, ES6+ 최신 문법을 소개합니다.',
    performance: '웹 성능 최적화, 번들 사이즈 개선, 렌더링 최적화 등 실전 성능 튜닝 경험을 공유합니다.',
  };

  return descriptions[category] || `${category} 관련 글들을 모아봤습니다.`;
};

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata | undefined> {
  const params = await props.params;
  const category = decodeURI(params.category);
  const VALID_CATEGORIES = await getValidCategories();

  if (!VALID_CATEGORIES.includes(category)) return;

  const title = category.charAt(0).toUpperCase() + category.slice(1);
  return genPageMetadata({
    title,
    description: getCategoryDescription(category),
    path: `/blog/${category}`,
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

  // SEO Fallback for Old URLs (e.g. /blog/my-post -> category = 'my-post')
  if (!VALID_CATEGORIES.includes(category)) {
    const postItem = await getPostBySlug(category);
    if (!postItem || postItem.status === 'deleted') {
      return notFound();
    }
    const redirectCategory = postItem.category || 'dev';
    redirect(`/blog/${redirectCategory}/${category}`);
  }

  // Show all posts for this category
  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);
  const categoryPosts = allPosts.filter((p) => (p.category || 'dev') === category);
  const sortedPosts = sortPosts(categoryPosts);
  const tags = await getTagsByCategory(category);

  const title = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      title={`${title} Posts`}
      tags={tags}
    />
  );
}
