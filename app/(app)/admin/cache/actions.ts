'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAllPosts } from '@/lib/firestore';

export type RevalidateResult = {
  ok: boolean;
  message: string;
  details: string[];
};

export async function revalidateAll(): Promise<RevalidateResult> {
  const details: string[] = [];
  try {
    // Data Cache
    revalidateTag('posts-all');
    revalidateTag('tags-all');
    revalidateTag('author-default');
    details.push('태그: posts-all, tags-all, author-default');

    // 카테고리별 태그
    const posts = await getAllPosts();
    const categories = Array.from(new Set(posts.map((p) => p.category || 'dev')));
    categories.forEach((cat) => {
      revalidateTag(`tags-${cat}`);
    });
    details.push(`카테고리 태그: ${categories.map((c) => `tags-${c}`).join(', ')}`);

    // Full Route Cache
    revalidatePath('/', 'layout');
    details.push('경로: / (layout — 전체 트리 무효화)');

    return { ok: true, message: '전체 캐시가 초기화됐습니다.', details };
  } catch (error) {
    return { ok: false, message: `오류 발생: ${String(error)}`, details };
  }
}

export async function revalidatePosts(): Promise<RevalidateResult> {
  const details: string[] = [];
  try {
    revalidateTag('posts-all');
    details.push('태그: posts-all');

    revalidatePath('/');
    revalidatePath('/blog');
    details.push('경로: /, /blog');

    return { ok: true, message: '포스트 캐시가 초기화됐습니다.', details };
  } catch (error) {
    return { ok: false, message: `오류 발생: ${String(error)}`, details };
  }
}

export async function revalidateTags(): Promise<RevalidateResult> {
  const details: string[] = [];
  try {
    revalidateTag('tags-all');
    details.push('태그: tags-all');

    const posts = await getAllPosts();
    const categories = Array.from(new Set(posts.map((p) => p.category || 'dev')));
    categories.forEach((cat) => revalidateTag(`tags-${cat}`));
    details.push(`카테고리 태그: ${categories.map((c) => `tags-${c}`).join(', ')}`);

    return { ok: true, message: '태그 캐시가 초기화됐습니다.', details };
  } catch (error) {
    return { ok: false, message: `오류 발생: ${String(error)}`, details };
  }
}

export async function revalidateAuthor(): Promise<RevalidateResult> {
  const details: string[] = [];
  try {
    revalidateTag('author-default');
    details.push('태그: author-default');

    revalidatePath('/about');
    revalidatePath('/');
    details.push('경로: /about, /');

    return { ok: true, message: '저자 캐시가 초기화됐습니다.', details };
  } catch (error) {
    return { ok: false, message: `오류 발생: ${String(error)}`, details };
  }
}
