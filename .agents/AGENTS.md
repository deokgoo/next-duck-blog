# Antigravity Agent 가이드라인 (next-duck-blog)

이 프로젝트는 Firestore를 백엔드로 사용하며 Next.js, TailwindCSS 기반으로 구현된 개발자 블로그입니다. 에이전트(Antigravity)는 아래 가이드와 워크플로우를 항상 준수하여 작업을 진행해야 합니다.

---

## 1. 프로젝트 아키텍처 개요
- **기술 스택**: Next.js (App & Page Router 혼용), TailwindCSS, TypeScript, Firestore, Firebase Admin
- **데이터 보관**: 블로그 게시글의 원본 데이터는 Firestore에 보관되며, 로컬 스크립트를 통해 `.snapshots/posts.json` 형태로 동기화합니다.
- **정적 인프라**: RSS 피드(`feed.xml`), Sitemap 생성기(`app/sitemap.ts`), Robots.txt, IndexNow 색인 자동화 등이 구성되어 있습니다.

---

## 2. Firestore ↔ 로컬 동기화 및 편집 워크플로우
블로그 포스트 작성 및 윤문(리뷰) 시 다음 워크플로우와 단축 명령어를 따릅니다.

### 2.1 단축 명령어
`package.json`에 등록된 동기화 명령어를 사용해 작업을 제어합니다:
- **최신 데이터 수신**: `npm run db:pull` (`node scripts/posts-snapshot.mjs pull`)
- **드래프트 추출**: `npm run draft:extract` (`node scripts/extract-drafts.mjs`) -> `.snapshots/drafts/[slug].md` 파일로 변환
- **드래프트 로컬 반영**:
  - 드라이 런: `npm run draft:apply:dry`
  - 실제 반영: `npm run draft:apply` -> 수정된 `.md` 내용을 `.snapshots/posts.json`에 빌드/머지
- **차이점 비교**: `npm run db:diff` (`node scripts/posts-snapshot.mjs diff`)
- **Firestore 최종 반영**:
  - 드라이 런: `npm run db:push:dry`
  - 실제 반영: `npm run db:push`

### 2.2 표준 작업 절차
```
[1. db:pull] ➔ [2. draft:extract] ➔ [3. AI 윤문 & 수정] ➔ [4. draft:apply] ➔ [5. db:push]
```
> [!WARNING]
> - `.snapshots/` 폴더는 `.gitignore` 처리되어 있어 Git 커밋 대상이 아닙니다.
> - `push` 명령어는 로컬 스냅샷의 문서 변경/추가만 반영하며 Firestore에만 있는 문서를 무단 삭제하지 않습니다.
> - 이미 로컬에 존재하는 draft 파일은 extract 시 덮어쓰지 않고 보호됩니다. 강제 덮어쓰기를 하려면 `--force` 옵션을 인자로 넘겨 수동 처리해야 합니다.

---

## 3. 디자인 시스템 및 Tailwind 규칙
디자인 가이드는 `.kiro/steering/design-tokens.md`에 근거합니다.

- **Spacing (12px 이상) & Typography (헤딩) & Shadow & Rounding**은 커스텀 디자인 토큰을 사용하십시오.
  - Spacing 예시: `py-section` (64px), `py-hero` (120px), `p-xl` (24px), `gap-md` (16px), `gap-sm` (12px)
  - Typography 예시: `text-hero-display` (80px), `text-heading-1` (48px), `text-heading-3` (28px)
  - Shadow: `shadow-subtle`, `shadow-card`, `shadow-elevated`, `shadow-modal`
  - Rounding: `rounded-md` (8px), `rounded-lg` (12px), `rounded-xl` (16px), `rounded-xxxl` (24px)
- **미세 조정 (8px 이하 간격) & 본문 텍스트 & 색상 & 구조 레이아웃**은 Tailwind 기본값을 사용하십시오.
  - 8px 이하 간격: `p-1`, `p-2`, `gap-2`, `mt-1`
  - 본문 텍스트 크기: `text-sm`, `text-base`, `text-lg`
  - 색상: `text-gray-600`, `bg-primary-500`, `border-gray-200`
  - 폰트 웨이트: `font-bold`, `font-semibold`

---

## 4. 블로그 톤앤매너 및 AI 티 제거
에이전트가 블로그 글을 수정하거나 생성할 때 다음 원칙을 반드시 따릅니다.

### 4.1 기본 톤앤매너 (`.kiro/steering/blog-writing-tone.md`)
- **어조**: 경험을 나누는 친근한 동료 개발자의 존댓말 (`~합니다`, `~했는데요`, `~해보겠습니다`).
- **태도**: 정답을 강요하기보다 직접 겪은 삽질기나 주관적인 깨달음을 자연스럽게 서술합니다.

### 4.2 AI 티 제거 (`.kiro/steering/humanize-korean.md`)
- **금지 패턴**: 
  - `첫째로, 둘째로`, `요약하자면`, `결론적으로`, `~인 반면`, `~에 불과합니다` 등 문어체/정리형 접속사 및 번역투 배제.
  - 지나치게 격식 있고 딱딱한 구조적 병렬 나열(예: 리스트를 남발하며 교과서적으로 서술하는 행위) 지양.
- **수정 방향**: 실제 구어체에 가까운 문장 연결 구조를 지향하고, AI 특유의 작위적인 결론 마무리를 줄입니다.

---

## 5. SEO 요구사항
블로그의 SEO 품질 유지를 위해 글 작성 및 수정 단계에서 다음 규격을 확인합니다 (`.kiro/steering/seo-meta.md` 참고).

- **필수 필드 매핑**:
  - `title`: `<title>`, OG title, JSON-LD headline으로 매핑.
  - `summary`: `<meta description>`, OG description 등으로 매핑. 비어 있으면 크리티컬한 SEO 손실이 발생하므로 필수 기재.
  - `images`: OG image로 활용되며, 누락 시 `socialBanner` 기본 이미지로 대체됩니다.
  - `date` / `lastmod`: JSON-LD 시간 동기화에 필수적이며 ISO 형식을 따릅니다.
- **URL 구조**: `/blog/{category}/{slug}`

---

## 6. 에이전트 pair programming 팁
대화 중 필요에 따라 프로젝트 루트에 위치한 스티어링 가이드를 적극 조회하거나 참조하십시오:
- **디자인 작업 시**: `.kiro/steering/design-tokens.md`
- **블로그 작성 및 윤문 시**: `.kiro/steering/blog-writing-tone.md`, `.kiro/steering/humanize-korean.md`
- **SEO 수정 시**: `.kiro/steering/seo-current-implementation.md`, `.kiro/steering/seo-meta.md`
