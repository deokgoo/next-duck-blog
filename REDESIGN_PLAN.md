# 메인 페이지 리디자인 플랜 (Vercel Minimal)

## 목표
- 메인 페이지를 **Vercel 스타일 미니멀** 디자인으로 리디자인
  - 화이트 캔버스 + shadow-as-border, 절제된 타이포그래피
  - "엔지니어" 인상만 주지 않고, 다양한 관심사(여행/취미/라이프)를 아우르는 톤
- **기존 데이터 관리/캐싱 전략 유지** (Firestore, `revalidate = false`, 온디맨드 revalidation)
- **다국어 대응**: 헤더에 언어 전환 아이콘 추가 (ko/en/jp)
- 확장성: 카테고리/프로젝트 데이터가 늘어나도 레이아웃이 깨지지 않는 구조

## 범위 (이번 PR)
1. `tailwind.config.js` — 디자인 토큰 추가 (ink, line, accent, shadow-as-border)
2. `components/LanguageSwitch.tsx` — 신규: 헤더 언어 전환 드롭다운 (Globe 아이콘)
3. `components/Header.tsx` — LanguageSwitch 배치
4. `lib/i18n/messages.ts` — hero/섹션 라벨 문자열 추가 (ko/en/jp)
5. `lib/i18n/home-locale.ts` — 신규: 메인 페이지 로케일별 UI 텍스트
6. `app/(site)/Main.tsx` — 메인 레이아웃 리디자인 (hero → 카테고리 → 최근 글 → 프로젝트)
7. `app/(site)/page.tsx` — locale="ko" 전달
8. `app/_locale/home-page.tsx` — locale prop 전달 (en/jp)
9. `data/projectsData.ts` — 스키마 확장 (icon, stack) + 실제 프로젝트 3개
10. `app/(site)/projects/page.tsx` — 새 스키마에 맞춰 카드 렌더링

## 유지 (변경 없음)
- `lib/firestore.ts`, `lib/revalidation.ts`, `lib/types.ts` — 데이터 레이어 그대로
- `app/(site)/page.tsx`의 `revalidate = false` + 온디맨드 갱신 전략 그대로
- `app/_locale/home-page.tsx`의 번역 필터링 로직 그대로
- 태그/카테고리 필터 로직 (`filterPostsByTag/Category`) 그대로

## 디자인 스펙 (Vercel Minimal)
- 배경: `#ffffff` (dark: `#000000`), 텍스트: `#171717` (dark: `#ededed`)
- 카드: `0 0 0 1px rgba(0,0,0,0.08)` shadow-as-border, hover 시 `0 4px 16px rgba(0,0,0,0.04)`
- 레이아웃:
  - Hero: overline + 58px display 타이포 + 서브 + CTA 2개
  - Categories: 4열 카드 (이름/설명/글 수)
  - Recent: 1.6fr featured + 1fr 리스트 (3개)
  - Projects: 3열 카드 (아이콘/제목/설명/스택 칩)
- 어센트: `#0a72ef` (Vercel 블루) — 태그/CTA에만 사용

## 검증
- `pnpm build` 성공
- 로컬 dev 서버에서 스크린샷 (light/dark, mobile/desktop)
- agy CLI 리뷰 → PR 생성
