# 캐싱 전략 문서

> Next.js 16 App Router (Previous Caching Model) 기반 블로그 캐싱 전략 문서

## 개요

본 프로젝트는 **"영구 캐시 + 온디맨드 무효화 전용"** 원칙을 따른다. 모든 콘텐츠 페이지에서 시간 기반 `revalidate`를 제거하고, CRUD 시점에 `revalidateTag()` / `revalidatePath()`를 명시적으로 호출하여 캐시를 갱신한다.

### 3-Layer 캐싱 아키텍처

1. **React Request Cache** (`cache()`) — 단일 렌더 패스 내 동일 호출 중복 제거
2. **Data Cache** (`unstable_cache`) — 요청 간(cross-request) 데이터 캐싱, tag 기반 무효화
3. **Full Route Cache** — HTML + RSC Payload 서버 측 캐싱, path 기반 무효화

---

## 1. 페이지별 캐싱 계층 매트릭스

| Route | Data Cache | Full Route Cache | CDN | `revalidate` | 데이터 함수 |
|-------|:----------:|:----------------:|:---:|:------------:|------------|
| `/` (홈) | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getAuthorBySlug('default')` |
| `/blog` | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getAllTags` |
| `/blog/[category]` | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getTagsByCategory`, `getPostBySlug` |
| `/blog/[category]/[...slug]` | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getPostBySlug`, `getAuthorBySlug` |
| `/blog/page/[page]` | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getAllTags` |
| `/[category]` | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getTagsByCategory` |
| `/[category]/tag/[tag]` | ✓ | ✓ | ✓ | `false` | `getAllPosts`, `getTagsByCategory` (generateStaticParams 없음 — 첫 요청 시 동적 렌더 후 캐싱) |
| `/about` | ✓ | ✓ | ✓ | `false` | `getAuthorBySlug('default')` |
| `/search` | — | — | — | N/A | Client component (`'use client'`), API 호출 |
| `/admin/*` | — | — | — | `force-dynamic` | 매 요청 시 fresh render |
| `/projects` | — | ✓ | ✓ | 미선언 | 빌드 시 정적 생성, 무기한 유지 |
| `/privacy` | — | ✓ | ✓ | 미선언 | 빌드 시 정적 생성, 무기한 유지 |
| Root Layout (`app/layout.tsx`) | ✓ | — | — | `false` | `getAuthorBySlug('default')` |

### 참고사항

- `revalidate = false`: 온디맨드 재검증 전용 영구 캐싱. `revalidatePath()` 또는 `revalidateTag()` 호출 없이는 캐시가 갱신되지 않음
- `force-dynamic`: 매 요청 시 서버에서 렌더링 (Full Route Cache 비활성화)
- 미선언: 빌드 시 정적 생성된 HTML이 영구 유지됨

---

## 2. CRUD 무효화 매트릭스

### Cache Tags 무효화

| 작업 | `posts-all` | `post-{slug}` | `tags-all` | `tags-{category}` | `author-{slug}` |
|------|:-----------:|:-------------:|:----------:|:------------------:|:---------------:|
| Post Create | ✓ | — | ✓ | ✓ | — |
| Post Update | ✓ | ✓ | ✓ | ✓ | — |
| Post Delete | ✓ | ✓ | ✓ | ✓ | — |
| Author Update | — | — | — | — | ✓ |

### Paths 무효화

| 작업 | `/` | `/blog` | `/blog/{cat}` | `/{cat}` | `/blog/{cat}/{slug}` | `/{cat}/tag/{tag}` | `/about` |
|------|:---:|:-------:|:-------------:|:--------:|:--------------------:|:------------------:|:--------:|
| Post Create | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (각 tag별) | — |
| Post Update | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (각 tag별) | — |
| Post Delete | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (각 tag별) | — |
| Author Update | ✓ | — | — | — | — | — | ✓ |

### 카테고리 변경 시 추가 무효화 (Post Update)

카테고리가 변경된 경우 (`previousCategory !== category`):
- `revalidateTag('tags-{previousCategory}')`
- `revalidatePath('/blog/{previousCategory}')`
- `revalidatePath('/{previousCategory}')`

### Slug 변경 시 추가 무효화 (Post Update)

Slug가 변경된 경우 (`previousSlug !== slug`):
- `revalidateTag('post-{previousSlug}')`
- `revalidatePath('/blog/{category}/{previousSlug}')`

---

## 3. Cache Tag 매핑표

| 함수명 | Cache Key | Cache Tags | 무효화 핸들러 |
|--------|-----------|------------|--------------|
| `getAllPosts` | `['firestore-all-posts']` | `['posts-all']` | `revalidateOnPostCreate`, `revalidateOnPostUpdate`, `revalidateOnPostDelete` |
| `getPostBySlug(slug)` | `['firestore-post-{slug}']` | `['post-{slug}', 'posts-all']` | `revalidateOnPostUpdate`, `revalidateOnPostDelete` |
| `getAuthorBySlug(slug)` | `['firestore-author-{slug}']` | `['author-{slug}']` | `revalidateOnAuthorUpdate` |
| `getAllTags` | `['firestore-all-tags']` | `['tags-all']` | `revalidateOnPostCreate`, `revalidateOnPostUpdate`, `revalidateOnPostDelete` |
| `getTagsByCategory(category)` | `['firestore-tags-{category}']` | `['tags-{category}', 'tags-all']` | `revalidateOnPostCreate`, `revalidateOnPostUpdate`, `revalidateOnPostDelete` |

### 에러 처리 전략

| 함수 | 실패 시 반환값 |
|------|--------------|
| `getAllPosts` | `[]` (빈 배열) |
| `getPostBySlug` | `null` |
| `getAuthorBySlug` | `siteMetadata` 기본값 기반 fallback author |
| `getAllTags` | `{}` (빈 객체) |
| `getTagsByCategory` | `{}` (빈 객체) |

### Revalidation Handler 에러 처리

모든 revalidation handler는 `try/catch`로 감싸져 있으며, 재검증 실패 시:
- 에러를 `console.error`로 기록
- CRUD 작업 응답을 차단하지 않음 (fire-and-forget 패턴)
- 원래 API 응답은 정상 반환

---

## 4. `use cache` 마이그레이션 가이드

Next.js의 새로운 `use cache` 디렉티브가 stable 되면 `unstable_cache`에서 마이그레이션이 필요하다.

### 현재 → 미래 패턴 비교

#### 비매개변수 함수 (`getAllPosts`, `getAllTags`)

```typescript
// 현재 패턴 (unstable_cache)
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

export const getAllPosts = cache(
  unstable_cache(
    async () => { /* Firestore query */ },
    ['firestore-all-posts'],
    { tags: ['posts-all'] }
  )
);

// 미래 패턴 (use cache)
import { cacheTag } from 'next/cache';

export async function getAllPosts() {
  'use cache';
  cacheTag('posts-all');
  // Firestore query ...
}
```

#### 매개변수 함수 (`getPostBySlug`, `getAuthorBySlug`, `getTagsByCategory`)

```typescript
// 현재 패턴 (unstable_cache)
export const getPostBySlug = cache((slug: string) =>
  unstable_cache(
    async () => { /* Firestore query */ },
    [`firestore-post-${slug}`],
    { tags: [`post-${slug}`, 'posts-all'] }
  )()
);

// 미래 패턴 (use cache)
import { cacheTag } from 'next/cache';

export async function getPostBySlug(slug: string) {
  'use cache';
  cacheTag(`post-${slug}`, 'posts-all');
  // Firestore query ...
}
```

### 변경이 필요한 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `lib/firestore.ts` | `unstable_cache` → `'use cache'` 디렉티브, `cacheTag()` 호출로 전환 |
| `lib/revalidation.ts` | 변경 없음 — `revalidateTag()` / `revalidatePath()` API는 동일 |
| `app/layout.tsx` | 변경 없음 — `lib/firestore.ts`에서 import하는 구조 유지 |
| `app/(site)/**/page.tsx` | 변경 없음 — 데이터 함수 호출 방식 동일 |
| `app/api/blog/save/route.ts` | 변경 없음 — revalidation handler 호출 동일 |
| `app/api/blog/delete/route.ts` | 변경 없음 — revalidation handler 호출 동일 |
| `app/api/author/update/route.ts` | 변경 없음 — revalidation handler 호출 동일 |

### 마이그레이션 시 주의사항

1. **TTL 설정**: `use cache`는 `cacheLife()`로 TTL을 설정한다. 현재 설계에서 TTL을 사용하지 않으므로 `cacheLife('max')` 또는 기본값을 사용한다.

2. **`cacheTag()` 호출 위치**: 현재 `unstable_cache`의 옵션 객체에서 태그를 설정하지만, `use cache`에서는 함수 본문 내에서 `cacheTag()`를 호출해야 한다.

3. **Request Dedup**: `use cache`로 전환 시 React `cache()`에 의한 request dedup 메커니즘이 별도로 필요할 수 있다. `use cache` 자체가 요청 간 캐싱만 제공하므로, 동일 렌더 내 중복 호출 방지가 필요한 경우 추가 래핑이 필요할 수 있다.

4. **서버 컴포넌트 전용**: `'use cache'` 디렉티브는 서버 컴포넌트와 서버 함수에서만 사용 가능하다. 현재 모든 데이터 조회 함수가 `'server-only'` 모듈에 있으므로 호환성 문제 없음.

5. **Cache Key 자동 생성**: `use cache`에서는 함수 인자를 기반으로 캐시 키가 자동 생성된다. 현재 수동 설정하는 `['firestore-post-${slug}']` 같은 키 배열이 불필요해진다.

6. **점진적 마이그레이션**: `unstable_cache`와 `use cache`를 혼용할 수 있으므로, 함수별 순차 마이그레이션이 가능하다. 우선순위: `getAllPosts` → `getPostBySlug` → `getAllTags` → `getTagsByCategory` → `getAuthorBySlug`.

---

## 부록: API Route 캐싱 설정

| API Route | `dynamic` 설정 | 용도 |
|-----------|:--------------:|------|
| `/api/blog/search` | `force-dynamic` | 검색 결과 캐시 방지, 항상 최신 데이터 |
| `/api/blog/save` | default | Mutation endpoint, revalidation handler 호출 |
| `/api/blog/delete` | default | Mutation endpoint, revalidation handler 호출 |
| `/api/author/update` | default | Mutation endpoint, revalidation handler 호출 |
