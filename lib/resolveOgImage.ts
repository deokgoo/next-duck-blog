import { Post } from '@/lib/types';

/**
 * 포스트 OG:image 우선순위 추출
 * 1. post.images[0] (썸네일, string|array 양쪽 지원)
 * 2. post.content 에서 첫 번째 이미지 (HTML <img> + 마크다운 ![])
 *    - 코드 블록(``, ```)은 제외
 * 3. null (호출부에서 default 폴백)
 */

/** 안전 이미지 URL: http(s) 절대경로, `/static` 아래, 또는 `/...확장자` 상대경로 */
const SAFE_IMAGE_URL = /^(?:https?:\/\/.+)|(?:\/static\/.+)|(?:\/.+\.(?:jpe?g|png|webp|gif|svg|avif|bmp|ico))$/i;

/** 코드 블록(``` ... ```)과 인라인 코드(` ... `) 제거 */
function stripCodeBlocks(source: string): string {
  return source.replace(/```[\s\S]*?```|`[^`\n]*`/g, '');
}

/** HTML <img> 의 src + 마크다운 !(url) 중 첫 번째 유효 이미지 */
function firstImageInContent(content: string): string | null {
  const clean = stripCodeBlocks(content);

  // HTML 우선: <img ... src="..." (data-src, loading 등 다른 속성과 구분)
  const htmlMatch = clean.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
  if (htmlMatch?.[1]) {
    const url = htmlMatch[1].trim();
    if (url && SAFE_IMAGE_URL.test(url)) return url;
  }

  // 마크다운: [alt](url)
  const mdMatch = clean.match(/!\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/);
  if (mdMatch?.[1]) {
    const url = mdMatch[1].trim();
    if (url && SAFE_IMAGE_URL.test(url)) return url;
  }

  return null;
}

export function resolveOgImage(post: Pick<Post, 'images' | 'content'>): string | null {
  // 1) 썸네일 — string/array 둘 다 방어
  const images = post.images;
  if (images) {
    const arr: string[] = Array.isArray(images)
      ? images
      : typeof images === 'string'
        ? [images]
        : [];
    const first = arr.find((img) => typeof img === 'string' && img.trim().length > 0);
    if (first) {
      const trimmed = first.trim();
      if (SAFE_IMAGE_URL.test(trimmed)) return trimmed;
    }
  }

  // 2) 본문 첫 이미지
  if (typeof post.content === 'string' && post.content) {
    const fromContent = firstImageInContent(post.content);
    if (fromContent) return fromContent;
  }

  return null;
}
