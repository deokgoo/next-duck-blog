import 'server-only';
import { db } from './firebaseAdmin';
import { Post, Authors } from './types';

export type { Post, Authors }; // Re-export for convenience if needed, but better to import from types
export * from './types'; // Re-export everything from types

export async function getAllPosts(): Promise<Post[]> {
  const snapshot = await db.collection('posts')
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map(doc => doc.data() as Post);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // We stored slug as a field, but also as the doc ID (sanitized)
  // Querying by field 'slug' is safer as doc ID might differ slightly
  const snapshot = await db.collection('posts')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Post;
}

export async function getAllTags(): Promise<Record<string, number>> {
  const posts = await getAllPosts();
  const tagCount: Record<string, number> = {};
  
  posts.forEach(post => {
    if (post.draft) return;
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



