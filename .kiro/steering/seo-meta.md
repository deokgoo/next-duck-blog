---
inclusion: manual
---

# SEO 메타 작성 가이드 — 이 블로그 기준

글을 작성하거나 수정할 때 title, summary(description), 이미지 필드를 최적화하기 위한 기준.  
이 블로그는 Firestore의 `posts` 컬렉션에서 메타를 읽어 Next.js `generateMetadata()`로 주입한다.

---

## 필드별 역할

| Firestore 필드 | 역할 | SEO 노출 위치 |
|---|---|---|
| `title` | 페이지 제목 | `<title>`, OG title, Twitter title |
| `summary` | 설명 | `<meta description>`, OG description |
| `images[0]` | 대표 이미지 | OG image, Twitter card image |
| `date` | 발행일 | structured data `datePublished` |
| `lastmod` | 수정일 | structured data `dateModified` |
| `tags` | 태그 | 내부 분류, 향후 키워드 활용 |
| `category` | 카테고리 | URL 경로 `/blog/{category}/{slug}` |

---

## title 작성 기준

**목표**: 검색 결과 클릭을 유도하면서 핵심 키워드를 앞에 배치

- **길이**: 40~60자 (한글 기준). 70자 초과 시 검색 결과에서 잘림
- **구조**: `핵심 키워드 + 부가 설명` 또는 `[분류] 핵심 키워드`
- 브랜드명은 Next.js template이 자동으로 `| {blogTitle}` 추가하므로 title에 넣지 않음

```
✅ "React Suspense 진화 과정과 React 19 디자인 패턴"  (44자)
✅ "HTTP/2 탄생 배경과 핵심 기술 이해하기"           (21자)
✅ "[카파도키아 숙소] 아르테미스 동굴 호텔 솔직 후기" (28자)
❌ "React Suspense에 대해 알아보겠습니다"           (AI 교과서 톤)
❌ "이번 포스팅에서는 HTTP/2를 다룹니다"            (검색 키워드 없음)
```

---

## summary (description) 작성 기준

**목표**: 검색 결과 snippet에 노출. 클릭 유도 + 글 내용 예고

- **길이**: 80~160자 (한글 기준). 150자 초과 시 잘릴 수 있음
- **형식**: 글에서 얻을 수 있는 것을 구체적으로 → 추상적인 소개 금지
- 1인칭 또는 간접 서술 모두 OK

```
✅ "APLN 오류를 겪으며 HTTP/2를 제대로 공부했습니다. 
    HOL 블로킹 문제, Google SPDY, 4가지 핵심 기술까지 정리했습니다." (74자)

✅ "카파도키아 동굴 호텔 아르테미스 내돈내산 후기. 
    플랫폼보다 저렴하게 투어를 예약하는 방법도 함께 정리했습니다." (64자)

❌ "HTTP/2에 대해 깊이 있게 알아보는 글입니다."   (너무 막연)
❌ "이 포스팅에서는 카파도키아 여행기를 소개합니다." (클릭 유인 없음)
```

---

## 키워드 배치 전략

1. **title 앞부분**에 핵심 검색 키워드 배치 (Google은 앞 단어에 더 가중치)
2. **summary 첫 문장**에 동일 키워드 자연스럽게 반복
3. **tags**에 검색에 쓰일 구체적인 단어 포함
   - ❌ `react, web, frontend` (너무 일반적)
   - ✅ `React Suspense, RSC, Next.js 19, 서버 컴포넌트`

---

## 이미지 (images 필드)

- `images[0]`이 OG/Twitter 카드 이미지로 사용됨
- 권장 사이즈: **1200×630px** (OG 표준)
- 없으면 `siteMetadata.socialBanner` 기본값으로 대체됨
- 글에 핵심 이미지가 있다면 `images: ["{url}"]` 로 명시 권장

---

## summary 입력 전 체크리스트

작성한 summary를 저장하기 전에 확인:

- [ ] 80~160자인가?
- [ ] 글의 핵심 내용 또는 독자가 얻는 것을 담았는가?
- [ ] 검색에 쓰일 키워드가 포함됐는가?
- [ ] "알아보겠습니다", "소개합니다" 같은 막연한 표현이 없는가?
- [ ] title의 핵심 키워드가 자연스럽게 반복되는가?

---

## 블로그 카테고리별 키워드 방향

| category | 주요 독자 의도 | 키워드 예시 |
|---|---|---|
| `web` | 기술 이해, 구현 방법 | "~란", "~하는 법", "~차이", "~원리" |
| `dev` | 실무 적용, 패턴 | "~패턴", "~최적화", "~활용", "~가이드" |
| `travel` | 정보 탐색, 후기 | "~추천", "~후기", "~꿀팁", "~방법" |
| `daily` | 공감, 경험 공유 | 키워드 최적화보다 자연스러운 제목 우선 |
