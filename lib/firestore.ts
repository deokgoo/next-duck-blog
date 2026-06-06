import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { db } from './firebaseAdmin';
import { Post, Authors, allAuthors } from './types';
import siteMetadata from '@/data/siteMetadata';

export type { Post, Authors }; // Re-export for convenience if needed, but better to import from types
export * from './types'; // Re-export everything from types

// status가 published인지 확인 (날짜 필터링 없음)
export function isPostPublishedAndReady(post: Post): boolean {
  if (post.status) {
    return post.status === 'published';
  }
  // Backwards compatibility: status가 없는 이전 포스트는 draft 필드 확인
  const isDraft = (post as any).draft;
  return isDraft !== true && String(isDraft) !== 'true';
}

// Fallback author using siteMetadata defaults
function fallbackAuthor(slug: string): Authors {
  const staticAuthor = allAuthors.find((a) => a.slug === slug);
  if (staticAuthor) return staticAuthor;

  return {
    slug,
    name: siteMetadata.author || 'Unknown',
    avatar: siteMetadata.image,
    blogTitle: siteMetadata.title,
    blogDescription: siteMetadata.description,
    socialBanner: siteMetadata.socialBanner,
  };
}

// Pattern: cache(unstable_cache(fn)) — non-parameterized
// - React cache(): single render pass dedup
// - unstable_cache(): cross-request caching with tag-based invalidation
export const getAllPosts = cache(
  unstable_cache(
    async (): Promise<Post[]> => {
      if (!db) {
        console.warn('Firestore DB is not initialized. Returning empty posts.');
        return [];
      }
      try {
        const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
        return snapshot.docs
          .map((doc) => doc.data() as Post)
          .filter((post) => post.status !== 'deleted');
      } catch (error) {
        console.error('Error fetching all posts:', error);
        return [];
      }
    },
    ['firestore-all-posts'],
    { tags: ['posts-all'] }
  )
);

// Pattern: cache((param) => unstable_cache(fn, [key], { tags })()) — parameterized
export const getPostBySlug = cache((slug: string) =>
  unstable_cache(
    async (): Promise<Post | null> => {
      if (!db) return null;
      try {
        const snapshot = await db.collection('posts').where('slug', '==', slug).limit(1).get();
        if (snapshot.empty) return null;
        const post = snapshot.docs[0].data() as Post;
        return post.status === 'deleted' ? null : post;
      } catch (error) {
        console.error(`Error fetching post by slug "${slug}":`, error);
        return null;
      }
    },
    [`firestore-post-${slug}`],
    { tags: [`post-${slug}`, 'posts-all'] }
  )()
);

// Pattern: cache((param) => unstable_cache(fn, [key], { tags })()) — parameterized
export const getAuthorBySlug = cache((slug: string) =>
  unstable_cache(
    async (): Promise<Authors> => {
      if (!db) {
        return fallbackAuthor(slug);
      }
      try {
        const docRef = db.collection('authors').doc(slug);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
          return fallbackAuthor(slug);
        }
        return docSnap.data() as Authors;
      } catch (error) {
        console.error('Error fetching author from Firestore:', error);
        return fallbackAuthor(slug);
      }
    },
    [`firestore-author-${slug}`],
    { tags: [`author-${slug}`] }
  )()
);

// Pattern: cache(unstable_cache(fn)) — non-parameterized
export const getAllTags = cache(
  unstable_cache(
    async (): Promise<Record<string, number>> => {
      try {
        const posts = await getAllPosts();
        const tagCount: Record<string, number> = {};

        posts.forEach((post) => {
          if (!isPostPublishedAndReady(post)) return;
          post.tags.forEach((tag) => {
            const formattedTag = tag.trim();
            tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1;
          });
        });

        return tagCount;
      } catch (error) {
        console.error('Error fetching all tags:', error);
        return {};
      }
    },
    ['firestore-all-tags'],
    { tags: ['tags-all'] }
  )
);

// Pattern: cache((param) => unstable_cache(fn, [key], { tags })()) — parameterized
export const getTagsByCategory = cache((category: string) =>
  unstable_cache(
    async (): Promise<Record<string, number>> => {
      try {
        const posts = await getAllPosts();
        const tagCount: Record<string, number> = {};

        posts.forEach((post) => {
          if (!isPostPublishedAndReady(post)) return;
          if ((post.category || 'dev') !== category) return;
          post.tags.forEach((tag) => {
            const formattedTag = tag.trim();
            tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1;
          });
        });

        return tagCount;
      } catch (error) {
        console.error(`Error fetching tags for category "${category}":`, error);
        return {};
      }
    },
    [`firestore-tags-${category}`],
    { tags: [`tags-${category}`, 'tags-all'] }
  )()
);

export async function updateAuthor(slug: string, data: Partial<Authors>): Promise<void> {
  if (!db) {
    throw new Error('Firestore DB is not initialized.');
  }
  const docRef = db.collection('authors').doc(slug);
  await docRef.set(data, { merge: true });
}
