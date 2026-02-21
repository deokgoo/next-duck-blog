import 'server-only';
import { db } from './firebaseAdmin';
import { Post, Authors } from './types';

export type { Post, Authors }; // Re-export for convenience if needed, but better to import from types
export * from './types'; // Re-export everything from types

// Helper to check if a post is fully published (status is published and date has passed)
export function isPostPublishedAndReady(post: Post): boolean {
  // Backwards compatibility: if status is undefined, check draft
  if (post.status) {
    if (post.status !== 'published') return false;
  } else {
    // If no status is defined (older posts), check the old 'draft' boolean directly
    const isDraft = (post as any).draft;
    // If it explicitly was marked draft true, it's not ready
    if (isDraft === true || String(isDraft) === 'true') return false;
  }
  
  // Local time (or server time) comparison
  // Since date is stored as YYYY-MM-DDTHH:mm, we can safely parse it
  if (!post.date) return false;
  return new Date(post.date).getTime() <= Date.now();
}

export async function getAllPosts(): Promise<Post[]> {
  const snapshot = await db.collection('posts')
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs
    .map(doc => doc.data() as Post)
    .filter(post => post.status !== 'deleted');
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // We stored slug as a field, but also as the doc ID (sanitized)
  // Querying by field 'slug' is safer as doc ID might differ slightly
  const snapshot = await db.collection('posts')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const post = snapshot.docs[0].data() as Post;
  return post.status === 'deleted' ? null : post;
}

export async function getAuthorBySlug(slug: string): Promise<Authors | null> {
  const docRef = db.collection('authors').doc(slug);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    // If not found in DB, fallback to the hardcoded mock for seamless transition
    // Need to dynamically import to prevent circular dependency if they import firestore
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

export async function getAllTags(): Promise<Record<string, number>> {
  const posts = await getAllPosts();
  const tagCount: Record<string, number> = {};
  
  posts.forEach(post => {
    if (!isPostPublishedAndReady(post)) return;
    post.tags.forEach(tag => {
      const formattedTag = tag.trim(); // Keep original case for display but consistent
      const key = formattedTag.toLowerCase();
      // We might want to store the original casing too, but for counting let's use lower
      // For now, let's just count. If we need a map of slug -> display, we can add that later.
      // Actually, existing code uses slug(t) which lowercases it. 
      // Let's just count occurrences of the raw tag for now, or normalize to kebab-case?
      // Contentlayer usually does this. Let's stick to simple counting.
      tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1;
    });
  });
  
  return tagCount;
}



