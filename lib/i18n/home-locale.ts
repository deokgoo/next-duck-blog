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
  aboutMore: string;
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
    aboutRole: '프론트엔드 개발자 · 프로덕트 엔지니어',
    aboutBody:
      '8년차 프론트엔드 개발자입니다. 스스로를 프로덕트 엔지니어로 정의하며, 비즈니스 가치와 사용자 경험을 끝까지 책임지는 방식으로 일합니다. CJ올리브영에서 대규모 커머스·콘텐츠 서비스를 만들고 있고, 코딩하지 않는 날에는 로컬 AI와 3D 프린팅을 다룹니다.',
    aboutMore: '상세보기 →',
    interests: ['프론트엔드', '아키텍처 전환', '로컬 AI', '3D 프린팅', '성능 최적화'],
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
    aboutRole: 'Frontend developer · Product engineer',
    aboutBody:
      "Frontend developer with 8 years of experience. I define myself as a product engineer — accountable for business value and user experience end to end. I build large-scale commerce and content services at CJ Olive Young, and outside of code I work on local AI and 3D printing.",
    aboutMore: 'Read more →',
    interests: ['Frontend', 'Architecture migration', 'Local AI', '3D Printing', 'Performance'],
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
    aboutRole: 'フロントエンド開発者 · プロダクトエンジニア',
    aboutBody:
      '8年目のフロントエンド開発者です。自らをプロダクトエンジニアと定義し、ビジネス価値とユーザー体験を最後まで責任を持って作り上げます。CJ Olive Youngで大規模なコマース・コンテンツサービスを開発し、コードを書かない日はローカルAIと3Dプリントに取り組んでいます。',
    aboutMore: '詳しく見る →',
    interests: ['フロントエンド', 'アーキテクチャ移行', 'ローカルAI', '3Dプリント', 'パフォーマンス'],
    allPosts: 'すべての記事 →',
    noPosts: 'まだ記事がありません。',
    posts: '記事',
  },
};

export function getHomeStrings(locale: Locale): HomeStrings {
  return homeStrings[locale] || homeStrings.ko;
}
