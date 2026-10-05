# next-duck-blog — 아키텍처 & 구현 상태 노트

> 이 문서는 현재 채팅 세션에서 결정된 아키텍처와 구현 상태를 요약한 것이다.
> 마지막 업데이트: 2026-10-05 (KST)

---

## 1. 프로젝트 개요

- **프레임워크**: Next.js 13 (App Router) + TypeScript 5.1.3
- **배포**: Vercel (main 브랜치 자동 배포) → https://duck-blog.vercel.app
- **디자인 시스템**: **Vercel Minimal** (ink / accent / line / shadow-as-border)
- **콘텐츠**: Firestore(포스트) + 로컬 MDX(about 등)
- **로케일**: ko(기본) / en / jp

---

## 2. 디자인 시스템 (Vercel Minimal)

### 2.1 디자인 토큰 (`tailwind.config.js`)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `ink` | `#171717` | 메인 텍스트 |
| `ink-2` | `#666666` | 보조 텍스트 |
| `ink-3` / `ink-4` | `#767676` | 약한 텍스트 |
| `line` | `rgba(0,0,0,0.08)` | 구분선 (border-color) |
| `line-2` | `rgba(0,0,0,0.14)` | 강조 구분선 |
| `accent` | `#0a72ef` | 메인 액센트 (Vercel 블루) |
| `accent-2` | `#d93025` | 보조 액센트 (빨강) |
| `accent-3` | `#de1d8d` | 보조 액센트 (분홍) |
| `v-border` (shadow) | `0 0 0 1px rgba(0,0,0,0.08)` | shadow-as-border (1px 링) |
| `v-card` (shadow) | `0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)` | 카드 (링 + 그림자) |
| `v-border-dark` / `v-card-dark` | `rgba(255,255,255,0.14)` 계열 | 다크 모드 대응 |

### 2.2 ⚠️ 핵심 버그 & 수정 (2026-10-05)

**문제**: `v-border`/`v-card`는 **boxShadow** 토큰인데, 포스트 레이아웃·about·projects·Card에
`border-v-border` / `divide-v-border`(14곳)를 **border-color**로 사용.
`borderColor` 섹션이 없어 이 클래스들은 **CSS에 컴파일되지 않음** → 구분선/테두리 색이 실제로 안 바뀜.

**수정**: `tailwind.config.js`에 `borderColor` 섹션 추가.
```js
borderColor: {
  'v-border': 'rgba(0,0,0,0.08)',
  'v-border-dark': 'rgba(255,255,255,0.14)',
},
```
→ 14곳이 전부 유효한 클래스로 컴파일. 검증: `.border-v-border{border-color:#00000014}`,
`.divide-v-border>:not([hidden])~:not([hidden]){border-color:#00000014}`,
`.dark\:border-v-border-dark:is(.dark *){border-color:#ffffff24}`.

**원칙**: shadow-as-border(`shadow-v-border`)는 카드/박스 테두리에, `border-v-border`/`divide-v-border`는
실제 border/divide 색에 사용. 둘 다 `v-border`라는 이름이지만 **서로 다른 유틸리티**다.

---

## 3. 페이지별 구현 상태

### 3.1 홈 (`app/(site)/Main.tsx`) — ✅ 완료 (PR #28 머지)
- Vercel Minimal 리디자인: hero, Latest Posts, About 섹션
- `Reveal` 컴포넌트(스크롤 페이드업) 적용
- About 섹션에 **"상세보기" 링크** → `/about` (ko 로케일에서만 표시, en/jp는 about 페이지가 없어 숨김)
- `home-locale.ts`에 `aboutMore` 문자열 추가 (3개 로케일)

### 3.2 About (`app/(site)/about/page.tsx`) — ✅ 완료
- **로컬 MDX** 읽기로 전환 (Firestore 빈 레코드 대신)
- 내용: 경력(2019.04~ 7년차, 프론트엔드 개발자, FFG/Olive Young/Techwork 등) + 개인 관심사(3D 프린팅, 로컬 AI/MLX, 여행)
- `AuthorLayout`을 새 토큰(ink/v-border)으로 통일
- `avatar.jpg`를 GitHub 프로필 사진으로 교체

### 3.3 블로그 목록 (`app/(site)/blog/page.tsx`) — ✅ 완료 (PR #29 머지)
- Vercel Minimal: 태그 필터, 카드 그리드, 무한 스크롤(IntersectionObserver)
- `ListLayoutWithTags` 통일

### 3.4 포스트 상세 레이아웃 — ✅ 완료 (이번 세션, 미커밋)
- `PostLayout.tsx` / `PostSimple.tsx` / `PostModern.tsx` / `PostBanner.tsx`
- 구분선·날짜·제목·댓글 영역을 `ink`/`v-border`/`v-border-dark`로 통일
- `border-v-border`/`divide-v-border` 버그 수정(§2.2)으로 실제 적용 확인

### 3.5 Projects (`app/(site)/projects/page.tsx`) — ✅ 완료 (이번 세션, 미커밋)
- 헤더 + `Card.tsx`를 새 토큰으로 통일
- `Card.tsx`: `border-v-border` 버그 수정으로 테두리 정상 적용

### 3.6 Search (`app/(site)/search/page.tsx`) — ✅ (PR #29)
- 키워드 검색, `shadow-v-border` 카드, 빈 결과 상태

---

## 4. 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `components/Reveal.tsx` | 스크롤 페이드업 애니메이션 (IntersectionObserver, prefers-reduced-motion 대응) |
| `components/Card.tsx` | 프로젝트 카드 (shadow-as-border) |
| `components/SectionContainer.tsx` | 섹션 래퍼 |
| `components/Tag.tsx` | 태그 칩 |
| `components/Link.tsx` | i18n 인식 링크 |
| `layouts/PostLayout.tsx` | 포스트 상세 기본 레이아웃 |
| `layouts/PostSimple/Modern/Banner.tsx` | 포스트 상세 변형 |
| `layouts/AuthorLayout.tsx` | about 레이아웃 |
| `layouts/ListLayoutWithTags.tsx` | 블로그 목록 |

---

## 5. 로컬 LLM (Hermes Agent)

- **모델**: Qwen3.8-27B-4bit (MLX) — `/Users/deokgoo/.mlx-models/Qwen3.8-27B-4bit`
- **provider**: `mlx`, base_url `http://127.0.0.1:1234/v1` (OpenAI 호환)
- **하드웨어**: Mac Studio (M5 Max, 36GB 통합 메모리)
- **원칙**: 로컬 전용 (프라이버시/비용/오프라인) + 고품질 + 코딩
- **Family profile**: 전용 Telegram 봇 + Qwen3.8-27B-4bit (mlx)
- **참고**: MLX는 Hermes 코어가 아닌 `custom` provider(OpenAI 호환 base_url)로 연동

---

## 6. 커밋 컨벤션

- **Co-Authored-By**: `Hermes Agent <hermes@nousresearch.com>` (Claude/Anthropic 아님)
- **agy CLI 리뷰** 후 머지, 이후 배포 검증
- **2026osaka 프로젝트**: push 시 `index.html` "최종 업데이트" + `js/data.js` lastUpdated/updatedDate/updatedTime을 현재 KST로 갱신

---

## 7. 현재 미커밋 변경 (이번 세션)

```
 M app/(site)/projects/page.tsx
 M components/Card.tsx
 M css/tailwind.css          (bg-grid-pattern 추가)
 M layouts/AuthorLayout.tsx
 M layouts/PostBanner.tsx
 M layouts/PostLayout.tsx
 M layouts/PostModern.tsx
 M layouts/PostSimple.tsx
 M next-env.d.ts
 M tailwind.config.js        (borderColor 섹션 추가 — 버그 수정)
?? data/blog/web/mac-studio-base-local-llm-optimization.mdx  (draft: true)
```

- **build**: ✓ Compiled successfully (0 에러)
- **검증**: `border-v-border`/`divide-v-border`/dark 변형이 CSS에 정상 컴파일 확인

---

## 8. 알림

- 완료 시 **본계정(메인) 텔레그램**으로 알림 (family 계정 아님)
- 메인 계정의 Telegram: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ALLOWED_USERS` (`~/.hermes/.env`)
