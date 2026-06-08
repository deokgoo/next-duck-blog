---
inclusion: auto
---

# Design Token 사용 가이드

이 프로젝트는 Tailwind 기본 유틸리티와 커스텀 디자인 토큰이 공존합니다.
아래 규칙에 따라 어떤 것을 사용할지 결정하세요.

## 판단 기준

> "이 값이 디자인 시스템 레벨의 결정인가, 아니면 미세 조정인가?"

- 디자인 결정 → 커스텀 토큰 사용
- 미세 조정 → Tailwind 기본값 사용

## 커스텀 토큰 사용 (디자인 시스템 레벨)

### Spacing (섹션/컴포넌트 간격)

| 용도 | 토큰 | 값 |
|---|---|---|
| 섹션 간 여백 (대) | `py-section-lg` | 96px |
| 섹션 간 여백 (기본) | `py-section` | 64px |
| 섹션 간 여백 (소) | `py-section-sm` | 48px |
| 히어로 패딩 | `py-hero` | 120px |
| 카드 큰 패딩 | `p-xxl` | 32px |
| 카드 기본 패딩 | `p-xl` | 24px |
| 컴포넌트 간 간격 | `gap-xl`, `space-x-xl` | 24px |
| 중간 간격 | `gap-md`, `space-x-md` | 16px |
| 작은 간격 | `gap-sm`, `mb-sm` | 12px |
| 최소 시맨틱 간격 | `gap-xs`, `mb-xs` | 8px |

### Typography (히어로/헤딩만)

| 용도 | 토큰 |
|---|---|
| 히어로 타이틀 | `text-hero-display` (80px) |
| 대형 섹션 타이틀 | `text-display-lg` (56px) |
| 페이지 헤드라인 | `text-heading-1` (48px) |
| 서브섹션 헤드라인 | `text-heading-2` (36px) |
| 카드 타이틀 | `text-heading-3` (28px) |
| 소제목 | `text-heading-4` (22px) |
| FAQ/작은 제목 | `text-heading-5` (18px) |

### Shadow (elevation 체계)

| 용도 | 토큰 |
|---|---|
| 미세한 부양감, 호버 | `shadow-subtle` |
| 피처 카드, 드롭다운 | `shadow-card` |
| 히어로 요소, 강조 | `shadow-elevated` |
| 모달, 오버레이 | `shadow-modal` |

### Rounding (컴포넌트별)

| 용도 | 토큰 | 값 |
|---|---|---|
| 버튼, 인풋 | `rounded-md` | 8px |
| 카드, 모달 | `rounded-lg` | 12px |
| 큰 패널 | `rounded-xl` | 16px |
| 쇼케이스 | `rounded-xxl` | 20px |
| 대형 카드 | `rounded-xxxl` | 24px |
| 배지, 필 | `rounded-full` | 9999px |

### Layout

| 용도 | 토큰 |
|---|---|
| 컨테이너 최대 너비 | `max-w-container` (1280px) |
| 소형 모바일 브레이크포인트 | `xs:` (480px) |
| 인풋 높이 | `h-input` (44px) |

## Tailwind 기본값 사용 (미세 조정)

| 상황 | 예시 |
|---|---|
| 본문 텍스트 크기 | `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl` |
| 아주 작은 간격 (1~8px) | `p-1`, `p-2`, `gap-1`, `gap-2`, `space-x-2`, `mt-1` |
| 색상 전부 | `text-gray-500`, `bg-primary-500`, `border-gray-200` |
| 폰트 웨이트 | `font-bold`, `font-semibold`, `font-medium` |
| 고정 너비/높이 | `w-12`, `h-10`, `w-full` |
| line-height | `leading-5`, `leading-6`, `leading-tight` |
| letter-spacing | `tracking-tight`, `tracking-wide` |
| opacity, transition | `opacity-50`, `transition-all`, `duration-200` |
| flexbox/grid 구조 | `flex`, `grid`, `grid-cols-4`, `col-span-3` |

## 예시

```tsx
// 좋은 예: 의도가 명확
<section className="py-section-lg">                    // 섹션 여백
  <div className="p-xxl rounded-lg shadow-card">       // 카드
    <h2 className="text-heading-3 font-bold mb-md">    // 카드 제목
      Title
    </h2>
    <p className="text-base text-gray-600 leading-relaxed">  // 본문 (Tailwind 기본)
      Description
    </p>
    <button className="mt-xl rounded-md px-md py-xs">  // 버튼 간격
      Click
    </button>
  </div>
</section>

// 나쁜 예: 과도한 토큰 사용
<div className="mt-xxs">  // ❌ 4px 간격에 토큰은 과함 → mt-1 사용
<span className="p-xxs">  // ❌ → p-1 사용
```

## 요약 규칙

1. **12px 이상의 간격**이면 커스텀 토큰 고려 (`sm` = 12px부터)
2. **8px 이하**면 Tailwind 숫자 (`p-1`, `p-2`, `gap-2`)
3. **그림자**는 항상 커스텀 토큰 (`shadow-subtle/card/elevated/modal`)
4. **헤딩 텍스트**는 커스텀 토큰, **본문 텍스트**는 Tailwind 기본
5. **색상, 폰트 웨이트, 레이아웃 구조**는 항상 Tailwind 기본
