import type { Locale } from './messages';

/**
 * 메인 페이지(홈) UI 텍스트.
 * lib/i18n/messages.ts의 t()는 댓글/뉴스레터 등 공용 UI에 쓰이고,
 * 홈 페이지 전용 라벨은 여기에서 관리한다.
 */
export interface HomeStrings {
  overline: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  ctaRead: string;
  ctaProjects: string;
  categories: string;
  categoriesMeta: string; // "4 · 59 posts"
  recent: string;
  recentMeta: string; // "→ archive"
  projects: string;
  projectsMeta: string; // "→ github"
  about: string;
  aboutBody: string;
  allPosts: string;
  noPosts: string;
  posts: string; // "posts" 단위
}

export const homeStrings: Record<Locale, HomeStrings> = {
  ko: {
    overline: '개발자 · 작가 · 서울',
    heroTitle: '소프트웨어를 만들고',
    heroTitleAccent: '살아내는 기록',
    heroSubtitle:
      '엔지니어의 블로그 — 기술 심화, 여행, 그리고 가끔의 라이프 에세이.',
    ctaRead: '블로그 읽기',
    ctaProjects: '프로젝트',
    categories: '카테고리',
    categoriesMeta: '4 · 59 posts',
    recent: '최근 글',
    recentMeta: '→ 아카이브',
    projects: '선정 프로젝트',
    projectsMeta: '→ github',
    about: '소개',
    aboutBody:
      'Next.js와 TypeScript로 시스템을 만드는 풀스택 개발자입니다. 만드는 시스템과, 만들지 않는 날에 가는 곳을 기록합니다.',
    allPosts: '전체 글 →',
    noPosts: '아직 게시된 글이 없습니다.',
    posts: 'posts',
  },
  en: {
    overline: 'Developer · Writer · Seoul',
    heroTitle: 'Notes on building',
    heroTitleAccent: 'software & living well',
    heroSubtitle:
      "A developer's blog — engineering deep-dives, travel, and the occasional life essay.",
    ctaRead: 'Read the blog',
    ctaProjects: 'Projects',
    categories: 'Categories',
    categoriesMeta: '4 · 59 posts',
    recent: 'Recent posts',
    recentMeta: '→ archive',
    projects: 'Selected projects',
    projectsMeta: '→ github',
    about: 'About',
    aboutBody:
      'Full-stack developer building with Next.js and TypeScript. I write about the systems I ship, and the places I go when I\'m not shipping them.',
    allPosts: 'All posts →',
    noPosts: 'No posts yet.',
    posts: 'posts',
  },
  jp: {
    overline: '開発者 · 作家 · ソウル',
    heroTitle: 'ソフトウェアを',
    heroTitleAccent: '作り、暮らす記録',
    heroSubtitle:
      'エンジニアのブログ — 技術の深掘り、旅行、そしてときどきのライフエッセイ。',
    ctaRead: 'ブログを読む',
    ctaProjects: 'プロジェクト',
    categories: 'カテゴリ',
    categoriesMeta: '4 · 59 記事',
    recent: '最新記事',
    recentMeta: '→ アーカイブ',
    projects: '選定プロジェクト',
    projectsMeta: '→ github',
    about: '自己紹介',
    aboutBody:
      'Next.jsとTypeScriptでシステムを作るフルスタック開発者です。作るシステムと、作らない日に訪れる場所を記録しています。',
    allPosts: 'すべての記事 →',
    noPosts: 'まだ記事がありません。',
    posts: '記事',
  },
};

export function getHomeStrings(locale: Locale): HomeStrings {
  return homeStrings[locale] || homeStrings.ko;
}
