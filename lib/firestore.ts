import 'server-only';
import { cache } from 'react';
import { db } from './firebaseAdmin';
import { Post, Authors } from './types';

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

export const getAllPosts = cache(async (): Promise<Post[]> => {
  const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
  return snapshot.docs.map((doc) => doc.data() as Post).filter((post) => post.status !== 'deleted');
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const snapshot = await db.collection('posts').where('slug', '==', slug).limit(1).get();

  if (snapshot.empty) return null;
  const post = snapshot.docs[0].data() as Post;
  return post.status === 'deleted' ? null : post;
});

export async function getAuthorBySlug(slug: string): Promise<Authors | null> {
  const docRef = db.collection('authors').doc(slug);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    const { allAuthors } = await import('./types');
    const author = allAuthors.find((p) => p.slug === slug);
    return author || null;
  }
  return docSnap.data() as Authors;
}

export async function updateAuthor(slug: string, data: Partial<Authors>): Promise<void> {
  const docRef = db.collection('authors').doc(slug);
  await docRef.set(data, { merge: true });
}

export const getAllTags = cache(async (): Promise<Record<string, number>> => {
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
});
