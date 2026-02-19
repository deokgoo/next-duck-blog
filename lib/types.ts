
export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  draft: boolean;
  layout?: string;
  images?: string[];
  authors?: string[];
  lastmod?: string;
  readingTime?: { minutes: number };
};

// Compatibility type for pliny/utils/contentlayer
export type CoreContent<T> = T;

// Compatibility function for pliny/utils/contentlayer
export function coreContent<T>(content: T): CoreContent<T> {
  return content;
}

export function allCoreContent<T>(content: T[]): CoreContent<T>[] {
  return content.map((c) => coreContent(c));
}

// Compatibility for Authors
export type Authors = {
  slug: string;
  name: string;
  avatar?: string;
  occupation?: string;
  company?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  layout?: string;
  body?: { code: string };
};

export function sortPosts(posts: Post[]): Post[] {
  return posts.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });
}

// Mock authors for now or fetch from Firestore 'authors' collection if implemented later
export const allAuthors: Authors[] = [
  {
    slug: 'default',
    name: 'Deokgoo Kim',
    avatar: '/static/images/avatar.jpg',
    occupation: 'FE Developer',
    company: 'Oliveyoung',
    email: 'kkddgg1001@gmail.com',
    twitter: 'https://twitter.com/Twitter',
    linkedin: 'https://www.linkedin.com',
    github: 'https://github.com/deokgoo',
    layout: 'AuthorLayout',
    body: { code: '' },
  },
];
