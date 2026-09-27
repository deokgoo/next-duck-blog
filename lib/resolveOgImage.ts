import { Post } from '@/lib/types';

/**
 * 포스트 OG:image 우선순위 추출
 * 1. post.images[0] (썸네일)
 * 2. post.content 에서 첫 번째 <img src>
 * 3. null (호출부에서 default 폴백)
 */
export function resolveOgImage(post: Pick<Post, 'images' | 'content'>): string | null {
  // 1) 썸네일
  if (post.images && post.images.length > 0) {
    const first = post.images[0];
    if (first) return first;
  }

  // 2) 본문 첫 이미지 — <img \s+[^>]*src\s*=\s*["']([^"']+)
  if (post.content) {
    const match = post.content.match(/<img\s+[^>]*src\s*=\s*["']([^"']+)/i);
    if (match?.[1]) return match[1];
  }

  return null;
}
