---
version: 1.0
name: Project Design System
description: emerald + Pretendard 기반 디자인 시스템
---

## Overview

이 프로젝트의 디자인 시스템은 emerald 컬러 팔레트와 Pretendard 폰트를 기반으로 한 깔끔하고 현대적인 시각 언어를 정의합니다. 기술 블로그와 개인 포트폴리오에 적합한 전문적이면서도 친근한 톤을 유지하며, 일관된 디자인 토큰을 통해 확장 가능한 UI를 구축합니다.

**핵심 원칙:**
- Emerald 팔레트를 primary 색상으로 사용하여 신선하고 생동감 있는 인상 전달
- Pretendard(본문) + Space Grotesk(디스플레이) + Fira Code(코드)의 3단 폰트 체계
- 4px 기반 스페이싱 시스템으로 일관된 리듬감 유지
- 명확한 elevation 계층으로 시각적 깊이 표현
- 반응형 우선 설계로 모든 디바이스에서 최적의 경험 제공

## Colors

### Primary (Emerald 팔레트)

프로젝트의 주요 색상으로 Tailwind CSS의 `colors.emerald` 팔레트를 사용합니다.

| Token | Value | Use |
|---|---|---|
| `primary.50` | #ecfdf5 | 배경 하이라이트, 호버 상태 |
| `primary.100` | #d1fae5 | 연한 배경, 배지 배경 |
| `primary.200` | #a7f3d0 | 보조 배경 |
| `primary.300` | #6ee7b7 | 보조 액센트 |
| `primary.400` | #34d399 | 다크모드 링크, 액센트 |
| `primary.500` | #10b981 | 기본 링크, CTA, 마커 |
| `primary.600` | #059669 | 호버 상태, 강조 |
| `primary.700` | #047857 | 활성 상태 |
| `primary.800` | #065f46 | 깊은 강조 |
| `primary.900` | #064e3b | 최대 강조 |
| `primary.950` | #022c22 | 최대 깊이 |

### Neutral (Gray 팔레트)

텍스트, 배경, 보더에 사용되는 중립 색상입니다.

| Token | Use |
|---|---|
| `gray.50` | 페이지 배경 (라이트) |
| `gray.100` | 섹션 배경, 서피스 |
| `gray.200` | 보더, 구분선 |
| `gray.300` | 비활성 보더 |
| `gray.500` | 보조 텍스트 |
| `gray.700` | 본문 텍스트 |
| `gray.900` | 헤드라인, 강조 텍스트 |
| `gray.950` | 최대 강조 (다크모드 배경) |

### Semantic

| Token | Use |
|---|---|
| `emerald.500` | 성공, 확인 |
| `amber.500` | 경고, 주의 |
| `red.500` | 에러, 삭제 |
| `blue.500` | 정보, 링크 |

## Typography

### Font Family

| Role | Font | Fallback | Use |
|---|---|---|---|
| 본문 (sans) | Pretendard | Inter, system-ui, sans-serif | 본문 텍스트, UI 요소, 한국어 최적화 |
| 디스플레이 (display) | Space Grotesk | Pretendard, sans-serif | 헤드라인, 히어로 타이틀, 브랜드 강조 |
| 코드 (mono) | Fira Code | ui-monospace, SFMono-Regular, monospace | 코드 블록, 인라인 코드, 터미널 |

### Typography Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `hero-display` | 80px | 600 | 1.05 | -2px | 히어로 섹션 메인 타이틀 |
| `display-lg` | 56px | 600 | 1.10 | -1px | 섹션 오프너, 대형 타이틀 |
| `heading-1` | 48px | 600 | 1.15 | -0.5px | 페이지 레벨 헤드라인 |
| `heading-2` | 36px | 600 | 1.20 | -0.5px | 서브섹션 헤드라인 |
| `heading-3` | 28px | 600 | 1.25 | 0 | 카드 타이틀, 기능 제목 |
| `heading-4` | 22px | 600 | 1.30 | 0 | 소제목, 타일 제목 |
| `heading-5` | 18px | 600 | 1.40 | 0 | FAQ 질문, 작은 제목 |
| `subtitle` | 18px | 400 | 1.50 | 0 | 히어로 서브타이틀 |
| `body-md` | 16px | 400 | 1.55 | 0 | 기본 본문 텍스트 |
| `body-md-medium` | 16px | 500 | 1.55 | 0 | 본문 강조 |
| `body-sm` | 14px | 400 | 1.50 | 0 | 보조 본문, 설명 |
| `body-sm-medium` | 14px | 500 | 1.50 | 0 | 버튼 라벨, 네비게이션 |
| `caption` | 13px | 400 | 1.40 | 0 | 캡션, 메타 정보 |
| `caption-bold` | 13px | 600 | 1.40 | 0 | 배지 라벨 |
| `micro` | 12px | 500 | 1.40 | 0 | 최소 텍스트, 태그 |
| `button-md` | 14px | 500 | 1.30 | 0 | 버튼 텍스트 |

### Typography 원칙
- 디스플레이 사이즈(80px~48px)에는 음수 letter-spacing 적용 (-2px ~ -0.5px)
- 본문(16px)은 넉넉한 line-height(1.55)로 가독성 확보
- 헤드라인은 600 weight, 버튼은 500 weight, 본문은 400 weight
- 디스플레이 폰트(Space Grotesk)는 h1, h2 헤드라인에 적용

## Spacing

### Spacing System (4px 기반)

| Token | Value | Use |
|---|---|---|
| `xxs` | 4px | 최소 간격, 인라인 요소 간 |
| `xs` | 8px | 아이콘-텍스트 간격, 태그 패딩 |
| `sm` | 12px | 인풋 내부 패딩, 작은 간격 |
| `md` | 16px | 기본 간격, 카드 내부 요소 간 |
| `lg` | 20px | 카드 내부 패딩 (compact) |
| `xl` | 24px | 카드 기본 패딩, 섹션 내 간격 |
| `xxl` | 32px | 카드 큰 패딩, 섹션 간 간격 |
| `xxxl` | 40px | 큰 섹션 간격 |
| `section-sm` | 48px | 작은 섹션 여백 |
| `section` | 64px | 기본 섹션 여백 |
| `section-lg` | 96px | 큰 섹션 여백 (마케팅 페이지) |
| `hero` | 120px | 히어로 섹션 패딩 |

### Spacing 원칙
- 모든 간격은 4px의 배수로 구성
- 컴포넌트 내부: xs ~ xl 범위 사용
- 섹션 간: section-sm ~ hero 범위 사용
- 기존 Tailwind 숫자 기반 spacing(0, 1, 2, 4, 8 등)과 공존

## Rounding

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | 태그 칩, 작은 요소 |
| `sm` | 6px | 배지, 작은 버튼 |
| `md` | 8px | **버튼**, 인풋, 검색바 |
| `lg` | 12px | **카드**, 컨테이너, 모달 |
| `xl` | 16px | 큰 패널, 피처 카드 |
| `xxl` | 20px | 쇼케이스 요소 |
| `xxxl` | 24px | 대형 피처 카드 |
| `full` | 9999px | 상태 배지, 필 탭, 아바타 |

### Rounding 원칙
- **버튼**: `md` (8px) — 직사각형 기하학, 필(pill) 형태 아님
- **카드**: `lg` (12px) — 일관된 카드 라운딩
- **배지/필**: `full` (9999px) — 상태 표시 요소에만 사용
- 인풋 필드: `md` (8px) — 버튼과 동일한 라운딩

## Elevation & Depth

### Elevation System (4단계)

| Level | Token | Shadow Value | Use |
|---|---|---|---|
| 0 | `flat` | none | 기본 상태, 보더만 사용하는 카드 |
| 1 | `subtle` | `rgba(15, 15, 15, 0.04) 0px 1px 2px 0px` | 호버 상태, 미세한 부양감 |
| 2 | `card` | `rgba(15, 15, 15, 0.08) 0px 4px 12px 0px` | 피처 카드, 드롭다운 |
| 3 | `elevated` | `rgba(15, 15, 15, 0.20) 0px 24px 48px -8px` | 히어로 요소, 강조 카드 |
| 4 | `modal` | `rgba(15, 15, 15, 0.16) 0px 16px 48px -8px` | 모달, 오버레이 |

### Elevation 원칙
- 기본 카드는 `flat` (보더로 구분) 또는 `subtle` 사용
- 강조가 필요한 피처 카드는 `card` 레벨 사용
- 모달/오버레이는 `modal` 레벨로 배경과 명확히 분리
- 히어로 섹션의 주요 요소는 `elevated`로 시각적 임팩트 부여

## Layout

### Container & Grid

| Property | Value |
|---|---|
| 최대 너비 | 1280px |
| 기본 거터 | 32px (xxl) |
| 사이드 패딩 | 16px (모바일) ~ 32px (데스크톱) |

### 반응형 브레이크포인트

| Token | Value | Use |
|---|---|---|
| `xs` | 480px | 소형 모바일 |
| `sm` | 640px | 모바일 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크톱 |
| `xl` | 1280px | 데스크톱 |
| `2xl` | 1536px | 대형 데스크톱 |

### Layout 원칙
- 콘텐츠 영역 최대 너비 1280px, 중앙 정렬
- 모바일 우선 반응형 설계
- 블로그 본문은 최대 768px 너비로 가독성 확보
- 그리드는 1~4 컬럼 반응형 전환 (xs: 1col → sm: 2col → lg: 3col → xl: 4col)

## Components

### Button

| Property | Value |
|---|---|
| 패딩 | 10px 18px |
| Border Radius | `md` (8px) |
| Typography | `button-md` (14px, 500) |
| 최소 높이 | 40px |

**버튼 변형:**
- **Primary**: emerald-500 배경, 흰색 텍스트
- **Secondary**: 투명 배경, 보더 1px solid gray-300
- **Ghost**: 투명 배경, 보더 없음
- **Link**: 텍스트만, 패딩 없음

### Card

| Property | Value |
|---|---|
| 패딩 (기본) | 24px (xl) |
| 패딩 (큰 카드) | 32px (xxl) |
| Border Radius | `lg` (12px) |
| 보더 | 1px solid gray-200 |

### Input

| Property | Value |
|---|---|
| 높이 | 44px |
| 패딩 | 12px 16px (sm md) |
| Border Radius | `md` (8px) |
| 보더 | 1px solid gray-300 |
| 포커스 보더 | 2px solid primary-500 |

### Badge

| Property | Value |
|---|---|
| 패딩 | 4px 10px |
| Border Radius | `full` (9999px) |
| Typography | `caption-bold` (13px, 600) |

## Responsive Behavior

### 모바일 (< 640px)
- 단일 컬럼 레이아웃
- 히어로 타이포그래피 축소 (hero-display → heading-1 수준)
- 카드 패딩 축소 (xxl → xl)
- 네비게이션 햄버거 메뉴 전환

### 태블릿 (640px ~ 1024px)
- 2컬럼 그리드
- 사이드바 숨김, 콘텐츠 영역 확장
- 섹션 여백 축소 (section-lg → section)

### 데스크톱 (> 1024px)
- 풀 레이아웃 (사이드바 + 콘텐츠)
- 3~4컬럼 그리드
- 최대 너비 1280px 컨테이너
- 넉넉한 섹션 여백 (section-lg, hero)
