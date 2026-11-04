# 어드민 구성 문서

> Next.js 16 App Router 기반 블로그의 관리자(어드민) 영역 구성.
> 경로: `app/(app)/admin` — `(app)` 라우트 그룹으로 사이트 헤더/푸터 없이 독립 레이아웃 사용.

## 1. 접근 제어 (2중)

### 클라이언트 (브라우저)
- `lib/auth/AuthContext.tsx`
  - Firebase Auth + Google 팝업 로그인 (`signInWithPopup`)
  - `NEXT_PUBLIC_ADMIN_EMAILS` 환경 변수(`,` 구분)를 화이트리스트로 사용
  - `isAuthorized` = 로그인한 이메일이 화이트리스트에 포함 여부
- `app/(app)/admin/ProtectedRoute.tsx`
  - 미로그인 → `/login` 리다이렉트
  - 로그인했지만 권한 없음 → alert 후 `/`로 이동 (무한 리다이렉트 방지)
- `app/(app)/login/page.tsx`
  - 로그인 버튼 1개. 성공 시 `isAuthorized`면 `/admin`으로, 아니면 권한 오류 표시

### 서버 (API)
- `lib/auth/serverAuth.ts` — `verifyAuth(request)`
  - `Authorization: Bearer <ID token>` 헤더에서 토큰 추출
  - Firebase Admin SDK `verifyIdToken`으로 검증, 실패 시 `null`
- 모든 어드민 API는 첫 줄에서 `verifyAuth` 실패 시 401 반환

> ⚠️ 화이트리스트는 클라이언트 환경 변수라 노출되므로, 실제 방어는 서버 토큰 검증이 담당.

## 2. 페이지 구성

`AdminShell.tsx` 좌측 사이드바(데스크톱 고정, 모바일은 햄버거 드로어) — 메뉴 6개 + 하단 프로필/로그아웃.

| 메뉴 | 경로 | 역할 |
|---|---|---|
| 대시보드 | `/admin` | 포스트 목록. 게시/비게시 토글, 삭제 |
| 새 글 쓰기 | `/admin/editor` | 글 작성/수정 에디터 |
| 댓글 관리 | `/admin/comments` | 댓글 목록, 삭제, 답글 |
| 블로그 아이디어 | `/admin/blog-ideas` | 아이디어 백로그 (상태: idea → writing → done) |
| 캐시 관리 | `/admin/cache` | 수동 캐시 무효화 |
| 프로필 | `/admin/profile` | 블로그 제목/설명 등 사이트 메타데이터 |

### 대시보드 (`AdminListClient.tsx`)
- `/api/blog/get`으로 포스트 목록 로드
- 상태 토글 → `POST /api/blog/status`
- 삭제 → `DELETE /api/blog/delete` (논리 삭제: `status: 'deleted'`, 문서 보존)

### 에디터 (`editor/EditorClientWrapper.tsx` + `components/editor/`)
- 마크다운 본문, OG 이미지, 배너 이미지(`BannerImageSetting`), 레이아웃 썸네일(`LayoutThumbnailPicker`)
- 다국어 번역(en/jp) 필드
- 저장 → `POST /api/blog/save`

### 캐시 관리 (`cache/CachePanel.tsx` + `actions.ts`)
- `posts-all` 태그 + `/`, `/blog` 경로 무효화 (server action)

## 3. API 맵

| API | 메서드 | 용도 |
|---|---|---|
| `/api/blog/save` | POST | 글 생성/수정 (Firestore `posts`) |
| `/api/blog/get` | GET | 글 목록/단건 조회 |
| `/api/blog/status` | POST | 게시 상태 변경 + IndexNow |
| `/api/blog/delete` | DELETE | 논리 삭제 |
| `/api/blog/search` | GET | 검색 |
| `/api/comments` | GET/POST/DELETE | 댓글 CRUD (관리자 삭제 포함) |
| `/api/blog-ideas` | GET/POST | 아이디어 CRUD |
| `/api/admin/profile` | GET/POST | 사이트 메타데이터 |
| `/api/images/upload` | POST | 이미지 업로드 |

## 4. 데이터 흐름 (글 저장 시)

```
에디터 저장
  → POST /api/blog/save (verifyAuth)
  → Firestore `posts` 컬렉션 문서 쓰기
  → lib/revalidation.ts
      - 태그: post-{slug}, posts-all, tags-all, tags-{category}
      - 라우트: 홈 3개(/, /en, /jp), /blog, /blog/{category}, /{category},
               포스트 페이지, 태그 페이지, en/jp 로케일 페이지
      - 카테고리/슬러그 변경 시 이전 경로도 함께 무효화
  → published 전환 시 IndexNow (Bing 즉시 인덱싱, fire-and-forget)
```

## 5. 참고

- 운영 로그: 어드민 화면에 로그 페이지는 없음. 서버(Vercel) 콘솔에
  `[Revalidation] ... failed` 등 에러 로그만 남음.
- 캐싱 전략 상세: `docs/caching-strategy.md`
- SEO 구성: `docs/SEO.md`
