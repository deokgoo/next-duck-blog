import { notFound, redirect } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getAllTags, isPostPublishedAndReady, getPostBySlug, getTagsByCategory } from '@/lib/firestore';
import { genPageMetadata } from 'app/seo';

import { Metadata } from 'next';

export const revalidate = 31536000;
const POSTS_PER_PAGE = 5;

// Dynamic categories helper
const getValidCategories = async () => {
  const posts = await getAllPosts();
  const cats = new Set(posts.map((p) => p.category || 'dev'));
  ['dev', 'travel', 'hobby', 'life'].forEach((c) => cats.add(c));
  return Array.from(cats);
};

// 카테고리별 설명
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    dev: '개발 관련 기술, 프로그래밍 언어, 프레임워크, 개발 도구에 대한 실무 경험과 학습 내용을 공유합니다.',
    react: 'React, Next.js, 상태관리 등 React 생태계의 최신 기술과 실전 팁을 다룹니다.',
    js: 'JavaScript, TypeScript의 핵심 개념과 실무 활용법, ES6+ 최신 문법을 소개합니다.',
    css: 'CSS, Tailwind, 레이아웃, 애니메이션 등 스타일링 기술과 디자인 시스템을 다룹니다.',
    performance: '웹 성능 최적화, 번들 사이즈 개선, 렌더링 최적화 등 실전 성능 튜닝 경험을 공유합니다.',
    travel: '여행지 추천, 여행 팁, 여행 경험담을 기록합니다.',
    hobby: '취미 생활, 관심사, 일상 속 즐거움을 나눕니다.',
    life: '일상 생활, 생각, 경험담을 자유롭게 기록합니다.',
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
  const initialDisplayPosts = allCoreContent(sortedPosts.slice(0, POSTS_PER_PAGE));
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(categoryPosts.length / POSTS_PER_PAGE),
  };
  const tags = await getTagsByCategory(category);

  const title = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={`${title} Posts`}
      tags={tags}
    />
  );
}
