
export type Post = {
  slug: string;
  title: string;
  date: string; // Publish Time (전시 시작 시간)
  createdAt?: string; // Written Date (작성 날짜)
  tags: string[];
  summary: string;
  content: string;
  status?: 'published' | 'draft' | 'deleted';  // Replaces `draft: boolean`
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
  // Blog Metadata
  blogTitle?: string;
  blogDescription?: string;
  siteLogo?: string;
  favicon?: string;
  socialBanner?: string;
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
    name: 'Template User',
    avatar: '/static/images/avatar.jpg',
    occupation: 'Developer',
    company: 'Company',
    email: 'your.email@example.com',
    twitter: 'https://twitter.com/x',
    linkedin: 'https://www.linkedin.com',
    github: 'https://github.com/username',
    layout: 'AuthorLayout',
    body: { code: '' },
  },
];
