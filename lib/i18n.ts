import type { Post, LocalizedPost } from './types';

/**
 * 주어진 locale에 맞는 번역 데이터를 Post에 적용하여 LocalizedPost를 반환한다.
 *
 * - `post.translations?.[locale]`이 없으면 null 반환 (→ 호출부에서 notFound() 처리)
 * - 번역이 있으면 title/summary를 locale 번역으로 오버라이드
 * - content는 항상 ko 원문(post.content) 유지
 * - `_originalTitle`, `_originalSummary`에 ko 원본 보존
 * - `_locale`에 전달된 locale 값 설정
 */
export function resolvePostForLocale(
  post: Post,
  locale: 'en' | 'jp'
): LocalizedPost | null {
  const translation = post.translations?.[locale];

  if (!translation) {
    return null;
  }

  return {
    ...post,
    title: translation.title,
    summary: translation.summary,
    // locale에 번역된 content가 있으면 사용, 없으면 ko 원문 유지
    content: translation.content || post.content,
    _locale: locale,
    _originalTitle: post.title,
    _originalSummary: post.summary,
  };
}
