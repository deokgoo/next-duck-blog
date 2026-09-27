import { Post } from '@/lib/types';

export function filterPostsByTag(posts: Post[], tag: string | null): Post[] {
  if (!tag) return posts;
  return posts.filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
}

export function filterPostsByCategory(posts: Post[], category: string | null): Post[] {
  if (!category) return posts;
  return posts.filter((post) => post.category === category);
}
