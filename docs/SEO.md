# SEO 설정 문서

> Duck Blog (Next.js 16, App Router)의 SEO 구성과 관리 방식을 문서화한다.
> 2026-10-09 SEO 오딧에서 발견한 문제를 반영한 최종 상태.

## 개요

| 항목 | 구성 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 배포 | Vercel (main 브랜치 자동 배포) |
| 다국어 | ko(기본) / en / jp — 로케일별 라우트 |
| 콘텐츠 | Firestore 기반 블로그 (포스트·저자) |
| 캐싱 | 포스트 페이지 `revalidate: false` + 온디맨드 `revalidatePath` |

## 1. 타이틀 (Title)

- **root layout** (`app/layout.tsx`): `title.default = authorData?.blogTitle || siteMetadata.title`, `template: '%s'`
  - `template: '%s'`로 서픽스 없이 페이지 타이틀이 그대로 노출된다.
  - Firestore `authors/default.blogTitle` 값이 기본 타이틀이 되므로, 원치 않는 서픽스가 붙지 않도록 DB 값을 관리한다.
- **포스트** (`app/(site)/blog/[category]/[...slug]/page.tsx`): `title = post.title` (검색 결과에 그대로 노출)
- **정적 페이지** (blog/about/projects/search): 각 페이지가 자체 타이틀을 가진다.
- **OG/Twitter** (`app/seo.tsx` `genPageMetadata`): `| ${siteMetadata.title}` 서픽스를 OG/Twitter에만 추가.

> ⚠️ 과거 문제: root layout이 `template: '%s | Duck Blog'`처럼 서픽스를 붙여 모든 페이지(EN 포함)에 한국어 서픽스가 노출됐다. `'%s'`로 정리.

## 2. 언어 (lang / og:locale / hreflang)

- **`<html lang>`**: `components/LocaleLangSync.tsx`가 pathname을 기준으로 `ko`/`en`/`ja`를 동적으로 설정한다.
  - 과거 root layout이 항상 `lang="ko-KR"`을 내서 /en, /jp도 한국어로 노출되는 치명적 문제를 해결.
- **og:locale**: 로케일별 — ko→`ko_KR`, en→`en_US`, jp→`ja_JP`
- **hreflang**:
  - 홈 3개 라우트(`/`, `/en`, `/jp`): `homeHreflang()` 헬퍼가 ko/en/ja + `x-default`를 함께 출력.
  - 포스트: 각 페이지가 self canonical + ko/en/ja hreflang을 설정.

## 3. Canonical

- **root layout은 전역 canonical을 내지 않는다.** (과거: 모든 페이지에 루트 canonical이 출력되는 antipattern)
- **페이지별 self canonical**: 각 페이지가 `alternates.canonical = 자기 URL`을 설정.
  - 홈: `homeMetadata()`가 `siteUrl + path`로 self canonical.
  - 포스트: `siteUrl + /blog/{category}/{slug}` self canonical.
- **번역본**: 각 언어 포스트가 self canonical + hreflang을 가진다 (ko를 canonical로 가리키지 않음 → 번역본 인덱싱 강화).

## 4. Sitemap

- `app/sitemap.ts` (revalidate 3600):
  - 정적 라우트(홈 3개, blog, about, projects) + 포스트(KR + 번역)
  - **hreflang**을 함께 출력 (다국어 URL 명시)
  - `lastModified`: 포스트는 `post.lastmod`, 정적 라우트는 today
- `/search`는 **noindex** (검색 결과 페이지는 인덱싱하지 않음)

## 5. RSS (feed.xml)

- `app/feed.xml/route.ts`: 실제 RSS 2.0 피드를 생성.
  - 과거 layout에서 `rel=alternate type=application/rss+xml href=/feed.xml`을 참조했지만 라우트가 없어 깨져 있던 문제를 복구.
- `app/robots.ts`: sitemap URL + admin/api disallow.

## 6. IndexNow / 검색엔진 검증

- **IndexNow** (`lib/indexnow.ts`):
  - `INDEXNOW_API_KEY` env 필요. 키 발급: https://snippets.indexnow.org/
  - `app/api/indexnow-key/route.ts`: 키 공개 엔드포인트.
  - 포스트 저장/상태 변경 시(`app/api/blog/save`, `status`) `submitUrlToIndexNow()`로 URL 제출.
- **Google Search Console**: `GOOGLE_SITE_VERIFICATION_ID` env + meta 태그.
  - GSC: https://search.google.com/search-console
- **Naver Webmaster**: `NAVER_SITE_VERIFICATION_ID` env (선택).

> ⚠️ env 키가 `.env.local`에 없으면 IndexNow/GSC는 비활성화된다. 코드만 존재.

## 7. 구조화 데이터 (JSON-LD)

Next.js 16의 Metadata API는 `jsonLd`를 지원하지 않으므로(og/twitter만), **컴포넌트 본문에서 `<script type="application/ld+json">` 태그로 렌더링**한다.

| 위치 | 타입 |
|------|------|
| 포스트 (`[...slug]/page.tsx`) | `BlogPosting` + `BreadcrumbList` |
| 홈 (`(site)/page.tsx` → `HomePage`) | `Organization` (ko/en/jp 3개 언어에 모두 렌더링) |

- `BlogPosting`: headline, datePublished/Modified, description, url, image, publisher, author, mainEntityOfPage
- `BreadcrumbList`: 홈 → 카테고리 → 포스트
- `Organization`: name, url, logo, sameAs(github)

## 8. OG Image

- **포스트**: `post.images` → `resolveOgImage()` (없으면 `siteMetadata.socialBanner`)
- **홈**: `siteMetadata.socialBanner`
- 상대 경로면 `siteUrl`과 결합해 절대 URL로 변환.

## 9. Next.js 16 관리 방식 적절성

| 항목 | 상태 |
|------|------|
| Metadata API (`generateMetadata`) | ✅ 적절 — Next 16 권장 |
| `app/sitemap.ts`, `app/robots.ts` | ✅ 적절 |
| 포스트 `revalidate: false` + 수동 revalidate | ✅ 의도적 (IndexNow 연동) |
| sitemap revalidate 3600 | ✅ 적절 |
| root layout 전역 canonical | ❌ 제거 (페이지별 위임) |
| html lang 하드코딩 | ❌ 제거 (로케일별 동적) |
| feed.xml 라우트 | ✅ 생성 |

## 10. 운영 체크리스트

- [ ] `.env.local`에 `INDEXNOW_API_KEY` 설정
- [ ] `.env.local`에 `GOOGLE_SITE_VERIFICATION_ID` 설정
- [ ] (선택) `NAVER_SITE_VERIFICATION_ID` 설정
- [ ] Firestore `authors/default.blogTitle` 값 확인 (서픽스 원치 않을 시)
- [ ] GSC에서 sitemap 제출 + IndexNow 확인
- [ ] Google Rich Results Test로 JSON-LD 검증

## 참고

- live: https://duck-blog.vercel.app
- Next 16 metadata: https://nextjs.org/docs/app/api-reference/file-conventions/metadata
- IndexNow: https://snippets.indexnow.org/
- GSC: https://search.google.com/search-console
