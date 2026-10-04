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
  aboutRole: string;
  aboutBody: string;
  interests: string[];
  allPosts: string;
  noPosts: string;
  posts: string; // "posts" 단위
}

export const homeStrings: Record<Locale, HomeStrings> = {
  ko: {
    overline: '엔지니어 · 작가 · 미래의 사업가',
    heroTitle: '엔지니어의',
    heroTitleAccent: '서브루틴 (Subroutine)',
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
    aboutRole: '프론트엔드 개발자 · 서울',
    aboutBody:
      '7년차 프론트엔드 개발자입니다. Next.js와 TypeScript로 웹을 만들고, 성능 최적화와 로컬 AI(MLX)에 관심이 많습니다. 코딩하지 않는 날은 3D 프린팅으로 물건을 만들고 여행으로 에너지를 채웁니다.',
    interests: ['프론트엔드', '로컬 AI', '3D 프린팅', '여행', '성능 최적화'],
    allPosts: '전체 글 →',
    noPosts: '아직 게시된 글이 없습니다.',
    posts: 'posts',
  },
  en: {
    overline: 'Engineer · Writer · Future Entrepreneur',
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
    aboutRole: 'Frontend developer · Seoul',
    aboutBody:
      'Frontend developer with 7 years of experience. I build with Next.js and TypeScript, and care about performance and local AI (MLX). When I\'m not coding I make things with 3D printing and recharge through travel.',
    interests: ['Frontend', 'Local AI', '3D Printing', 'Travel', 'Performance'],
    allPosts: 'All posts →',
    noPosts: 'No posts yet.',
    posts: 'posts',
  },
  jp: {
    overline: 'エンジニア · 作家 · 未来の起業家',
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
    aboutRole: 'フロントエンド開発者 · ソウル',
    aboutBody:
      '7年目のフロントエンド開発者です。Next.jsとTypeScriptでWebを作り、パフォーマンス最適化とローカルAI(MLX)に関心があります。コードを書かない日は3Dプリントで物を作り、旅行でエネルギーを充電しています。',
    interests: ['フロントエンド', 'ローカルAI', '3Dプリント', '旅行', 'パフォーマンス'],
    allPosts: 'すべての記事 →',
    noPosts: 'まだ記事がありません。',
    posts: '記事',
  },
};

export function getHomeStrings(locale: Locale): HomeStrings {
  return homeStrings[locale] || homeStrings.ko;
}
