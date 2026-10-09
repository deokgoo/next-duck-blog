# Duck Blog

웹 개발, 프론트엔드, React, JavaScript에 관한 실무 경험과 기술 인사이트를 공유하는 개발 블로그입니다.

- **사이트:** [https://duck-blog.vercel.app](https://duck-blog.vercel.app)
- **저자:** deokgoo
- **다국어:** ko(기본) / en / jp

## 기술 스택

| 구분 | 구성 |
|------|------|
| 프레임워크 | [Next.js 16](https://nextjs.org/) (App Router, React 19) |
| 언어 | TypeScript |
| 스타일 | [Tailwind CSS](https://tailwindcss.com/) + Vercel Minimal 디자인 토큰 |
| 콘텐츠 | [MDX](https://mdxjs.com/) + [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) |
| CMS | [Firebase](https://firebase.google.com/) (Firestore) — 포스트·저자·댓글·참여도 |
| 배포 | [Vercel](https://vercel.com/) — `main` 브랜치 자동 배포 |
| 패키지 매니저 | pnpm |

## 주요 기능

- **다국어 라우팅** — `ko`(기본) / `en` / `jp` 로케일별 라우트. 번역이 없는 포스트는 해당 로케일에서 `notFound` 처리
- **Firebase CMS** — 포스트 작성/수정/삭제, 이미지 업로드, 댓글, 좋아요/조회 등 참여도, 관리자 대시보드(`/admin`)
- **캐싱 전략** — "영구 캐시 + 온디맨드 무효화" 원칙. 3-Layer 캐싱(React Request Cache → Data Cache → Full Route Cache), CRUD 시점에 `revalidateTag`/`revalidatePath` 호출
- **SEO** — canonical, OG/Twitter, sitemap, RSS feed, robots, IndexNow, Naver Webmaster
- **코드/수식** — rehype-prism-plus(라인 하이라이트), KaTeX, Mermaid 다이어그램
- **기타** — 검색, 태그/카테고리, 프로젝트 페이지, 뉴스레터, 테마(라이트/다크/시스템), Google Analytics, AdSense

## 구조

```
app/
  (site)/          # 공개 사이트 (홈, blog, about, projects, architecture, search)
  (app)/           # 관리자 대시보드 (login, admin/*)
  en/ jp/          # 다국어 라우트
  api/             # REST API (포스트, 댓글, 참여도, 이미지 업로드 등)
  _locale/         # 로케일별 공유 레이아웃/페이지
  seo.tsx          # OG/Twitter 메타 (genPageMetadata)
  sitemap.ts       # sitemap.xml
  robots.ts        # robots.txt
data/
  siteMetadata.js  # 사이트 메타 (타이틀, 설명, 소셜, 분석)
  blog/            # MDX 포스트 (algorithm, daily, nextjs, react, travel, web)
  authors/         # 저자 프로필
  headerNavLinks.ts, projectsData.ts, categoriesData.ts
lib/
  firestore.ts, firebase.ts, firebaseAdmin.ts   # Firebase 접근
  i18n.ts        # 로케일별 포스트 해석 (resolvePostForLocale)
  revalidation.ts, comments.ts, engagement.ts, og-image.tsx, indexnow.ts
components/      # UI 컴포넌트 (Header, Footer, Card, Reveal, editor, comments, ...)
docs/
  SEO.md         # SEO 구성 문서
  caching-strategy.md  # 캐싱 전략 문서
```

## 시작하기

```bash
# 설치
pnpm install

# 개발 서버
pnpm dev          # http://localhost:3000

# 프로덕션 빌드
pnpm build
pnpm serve
```

### 환경변수

`.env.local`에 아래 변수를 설정하세요 (`.env.local.example` 참고):

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (canonical, sitemap) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase 클라이언트 (API key, app id, auth domain, project id, storage bucket) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_DATABASE_ID` / `FIREBASE_STORAGE_BUCKET` | Firebase Admin (서버) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | 관리자 이메일 (쉼표 구분) |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics (선택) |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | AdSense — ads.txt 자동 생성 (선택) |
| `NEXT_PUBLIC_NAVER_WEBMASTER_ID` | Naver Webmaster 인증 (선택) |
| `NEXT_UMAMI_ID` | Umami 분석 (선택) |

### 콘텐츠 관리 스크립트

```bash
pnpm db:pull          # Firestore → 로컬 MDX 스냅샷
pnpm db:push          # 로컬 MDX → Firestore
pnpm db:push:dry      # dry-run (변경사항 미리보기)
pnpm db:diff          # 로컬/DB 차이 확인
pnpm draft:extract    # 초고 추출
pnpm draft:apply      # 초고 적용
```

## 문서

- [SEO 설정 문서](docs/SEO.md)
- [캐싱 전략 문서](docs/caching-strategy.md)
- [아키텍처 페이지](https://duck-blog.vercel.app/architecture) — 사이트 설계 종합 문서

## 라이선스

[MIT](LICENSE)
