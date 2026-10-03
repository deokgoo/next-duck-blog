import { revalidatePath, revalidateTag } from 'next/cache';
import { PostTranslations } from '@/lib/types';

export interface RevalidatePostOptions {
  slug: string;
  category: string;
  tags?: string[];
  previousSlug?: string;
  previousCategory?: string;
  translations?: PostTranslations | null;
}

/**
 * 홈 페이지 라우트 무효화.
 * ko('/') + en/jp 홈이 모두 revalidate=false(영구 캐시)라
 * 온디맨드 갱신 시 3개 라우트를 함께 무효화해야 한다.
 */
export function revalidateHomeRoutes(): void {
  revalidatePath('/');
  revalidatePath('/en');
  revalidatePath('/jp');
}

export function revalidateOnPostCreate(options: RevalidatePostOptions): void {
  try {
    // Data Cache invalidation
    revalidateTag('posts-all', 'max');
    revalidateTag('tags-all', 'max');
    revalidateTag(`tags-${options.category}`, 'max');

    // Full Route Cache invalidation
    revalidateHomeRoutes();
    revalidatePath('/blog');
    revalidatePath(`/blog/${options.category}`);
    revalidatePath(`/${options.category}`);
    revalidatePath(`/blog/${options.category}/${options.slug}`);

    // locale revalidation (en/jp)
    if (options.translations?.en) {
      revalidatePath(`/en/blog/${options.category}/${options.slug}`);
    }
    if (options.translations?.jp) {
      revalidatePath(`/jp/blog/${options.category}/${options.slug}`);
    }

    // Tag pages
    options.tags?.forEach((tag) => {
      revalidatePath(`/${options.category}/tag/${tag}`);
    });
  } catch (error) {
    console.error('[Revalidation] Post create failed:', error);
  }
}

export function revalidateOnPostUpdate(options: RevalidatePostOptions): void {
  try {
    // Data Cache invalidation
    revalidateTag(`post-${options.slug}`, 'max');
    revalidateTag('posts-all', 'max');
    revalidateTag('tags-all', 'max');
    revalidateTag(`tags-${options.category}`, 'max');

    // Full Route Cache invalidation
    revalidatePath(`/blog/${options.category}/${options.slug}`);
    revalidateHomeRoutes();
    revalidatePath('/blog');
    revalidatePath(`/blog/${options.category}`);
    revalidatePath(`/${options.category}`);

    // Category change handling
    if (options.previousCategory && options.previousCategory !== options.category) {
      revalidateTag(`tags-${options.previousCategory}`, 'max');
      revalidatePath(`/blog/${options.previousCategory}`);
      revalidatePath(`/${options.previousCategory}`);
    }

    // Slug change handling
    if (options.previousSlug && options.previousSlug !== options.slug) {
      revalidateTag(`post-${options.previousSlug}`, 'max');
      revalidatePath(`/blog/${options.category}/${options.previousSlug}`);
    }

    // locale revalidation (en/jp)
    if (options.translations?.en) {
      revalidatePath(`/en/blog/${options.category}/${options.slug}`);
    }
    if (options.translations?.jp) {
      revalidatePath(`/jp/blog/${options.category}/${options.slug}`);
    }

    // Tag pages
    options.tags?.forEach((tag) => {
      revalidatePath(`/${options.category}/tag/${tag}`);
    });
  } catch (error) {
    console.error('[Revalidation] Post update failed:', error);
  }
}

export function revalidateOnPostDelete(options: RevalidatePostOptions): void {
  try {
    // Data Cache invalidation
    revalidateTag(`post-${options.slug}`, 'max');
    revalidateTag('posts-all', 'max');
    revalidateTag('tags-all', 'max');
    revalidateTag(`tags-${options.category}`, 'max');

    // Full Route Cache invalidation
    revalidatePath(`/blog/${options.category}/${options.slug}`);
    revalidateHomeRoutes();
    revalidatePath('/blog');
    revalidatePath(`/blog/${options.category}`);
    revalidatePath(`/${options.category}`);

    // Tag pages
    options.tags?.forEach((tag) => {
      revalidatePath(`/${options.category}/tag/${tag}`);
    });
  } catch (error) {
    console.error('[Revalidation] Post delete failed:', error);
  }
}

export function revalidateOnAuthorUpdate(slug: string): void {
  try {
    revalidateTag(`author-${slug}`, 'max');
    revalidatePath('/about');
    revalidateHomeRoutes();
  } catch (error) {
    console.error('[Revalidation] Author update failed:', error);
  }
}
