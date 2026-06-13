---
inclusion: manual
---

# 현재 블로그 SEO 구현 현황

이 블로그에 실제로 적용된 SEO 구현을 코드 레벨로 정리한 문서.  
SEO 코드 작업 시 참고 기준으로 사용한다.

---

## 1. 기술 SEO 인프라

| 기능 | 파일 | 비고 |
|---|---|---|
| sitemap.xml | `app/sitemap.ts` | published 포스트 자동 생성, `revalidate = 3600` |
| robots.txt | `app/robots.ts` | `Allow: /`, `Disallow: /admin/, /api/` |
| IndexNow | `lib/indexnow.ts` | 글 발행·수정 시 Bing/Yandex 즉시 알림 |
| GSC 인증 | `app/api/google-site-verification/route.ts` | `/google{ID}.html` 동적 제공 |
| Naver 웹마스터 | siteMetadata.analytics.naverWebMasterId | 환경변수 주입 |
| GA4 | `components/analytics/googleAnalytics.tsx` | `lazyOnload` 전략 |

sitemap URL 패턴: `{NEXT_PUBLIC_SITE_URL}/blog/{category}/{slug}`

---

## 2. 페이지별 메타데이터

### 공통 헬퍼 (`app/seo.tsx`)
```ts
genPageMetadata({ title, description, image }) → Metadata
// openGraph locale: 'ko_KR'
```
카테고리 목록, 검색, about 등 `genPageMetadata()`를 쓰는 모든 페이지에 적용.

### 루트 레이아웃 (`app/layout.tsx`)
- `title.template: "%s | {blogTitle}"` — 하위 페이지 title suffix 자동 추가
- OG: locale `ko_KR`, type `website`
- robots: index + follow + googleBot 상세 설정
- RSS: `feed.xml` alternate link

### 포스트 상세 (`app/(site)/blog/[category]/[...slug]/page.tsx`)
- `alternates.canonical`: 절대 URL (`${siteUrl}/blog/${category}/${slug}`)
- OG: type `article`, locale `ko_KR`, publishedTime, modifiedTime, authors, images
- JSON-LD (`BlogPosting`): headline, datePublished, dateModified, description, url, mainEntityOfPage, image, publisher, author

### 태그 페이지 (`app/(site)/[category]/tag/[tag]/page.tsx`)
- title: `"{tag} in {category}"`
- description: `"{category명} 카테고리의 {tag} 관련 포스트 목록입니다."`

---

## 3. Firestore 필드 → SEO 매핑

| 필드 | 활용처 | 비고 |
|---|---|---|
| `title` | `<title>`, OG title, JSON-LD headline | 필수 |
| `summary` | `<meta description>`, OG description, JSON-LD description | 필수 — 비어있으면 SEO 손실 |
| `images` | OG image, Twitter image, JSON-LD image | 없으면 socialBanner fallback |
| `date` | JSON-LD datePublished, sitemap lastmod | ISO 형식 |
| `lastmod` | JSON-LD dateModified | 없으면 date fallback |
| `tags` | 태그 페이지 URL | |
| `category` | URL `/blog/{category}/{slug}` | |
| `slug` | URL 경로 | |
| `status` | published만 sitemap·색인 포함 | |

---

## 4. 환경변수 체크리스트

```
NEXT_PUBLIC_SITE_URL           # canonical·JSON-LD URL 생성 핵심
GOOGLE_SITE_VERIFICATION_ID    # GSC 인증
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
NEXT_PUBLIC_NAVER_WEBMASTER_ID
INDEXNOW_API_KEY               # 발행 즉시 색인 알림
NEXT_PUBLIC_GOOGLE_ADSENSE_ID  # 애드센스 (선택)
```

---

## 5. 잔여 개선 여지

| 항목 | 내용 |
|---|---|
| 루트 canonical | `app/layout.tsx`의 canonical이 여전히 상대 경로 `"./"` |
| siteMetadata 기본값 | `data/siteMetadata.js`의 email·github·social 필드가 placeholder |
| 내부 링크 | 연관 포스트 간 상호 링크 없음 (P3) |
