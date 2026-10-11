import type { Post } from './types';
import { isPostPublishedAndReady } from './firestore';

/**
 * 관련 포스트 계산
 *
 * 점수 규칙:
 * - 같은 카테고리: +2
 * - 공유 태그 1개당: +1
 *
 * 점수 내림차순 → 같은 점수면 최신순. 점수 0인 포스트는 제외.
 */
export function getRelatedPosts(
  post: Post,
  allPosts: Post[],
  limit = 3
): Post[] {
  const scored = allPosts
    .filter((p) => p.slug !== post.slug && isPostPublishedAndReady(p))
    .map((p) => {
      let score = 0;
      if (p.category && p.category === post.category) score += 2;
      const sharedTags = (p.tags ?? []).filter((t) =>
        (post.tags ?? []).includes(t)
      ).length;
      score += sharedTags;
      return { p, score };
    })
    .filter(({ score }) => score > 0);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.p.date > b.p.date) return -1;
    if (a.p.date < b.p.date) return 1;
    return 0;
  });

  return scored.slice(0, limit).map(({ p }) => p);
}
