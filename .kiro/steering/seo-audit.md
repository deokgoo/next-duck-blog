---
inclusion: manual
---

# SEO 감사 가이드

기존 글의 SEO 이슈를 탐지하고 개선 방법을 제시하는 체크리스트.  
(메타 작성 기준은 `#seo-meta` 참고)

---

## 감사 절차

1. `posts.json` 또는 draft 파일에서 대상 글 확인
2. 아래 체크리스트 순서대로 이슈 탐지
3. 이슈별 우선순위(P1~P3) 부여
4. before/after 형태로 수정 권고

---

## 체크리스트

### P1 — 즉시 수정 (클릭률·색인에 직접 영향)

- [ ] title이 40자 미만이거나 70자 초과인가?
- [ ] title에 핵심 키워드가 없거나 AI 교과서 톤인가? ("~에 대해", "알아보겠습니다")
- [ ] summary가 비어있거나 80자 미만인가?
- [ ] summary가 160자 초과로 잘릴 수 있는가?

### P2 — 개선 권장 (노출 품질)

- [ ] tags가 3개 미만인가?
- [ ] title 핵심 키워드가 본문 첫 100자 안에 등장하는가?
- [ ] H2/H3 헤딩에 검색 키워드가 포함됐는가?
- [ ] images 필드가 비어있는가? (소셜 공유 시 기본 배너만 표시)

### P3 — 선택적 개선 (장기)

- [ ] 연관 글과 상호 링크가 없는가?
- [ ] 오래된 글(`2021~2022`)의 내용이 여전히 유효한가?
  - 유효하면 `lastmod` 현재 날짜로 업데이트 → Google 재크롤링 유도

---

## 감사 리포트 형식

```
## SEO 감사 결과: {slug}

### P1
- [title] "~에 대해 알아보겠습니다" → 키워드 누락
  권고: "JavaScript Proxy 패턴 — Vue 3 반응형의 비밀"

- [summary] 비어있음
  권고: "Vue 3 반응형 시스템의 핵심인 Proxy 패턴을 정리했습니다.
         GoF 패턴부터 ES6 도입 배경, Reflect API 활용까지."

### P2
- [tags] ["javascript", "proxy"] → 너무 일반적
  권고: ["JavaScript Proxy", "Vue 3 반응형", "메타프로그래밍", "Reflect API"]
```

---

## 전체 글 일괄 스캔 (posts.json 기준)

```js
// P1: title 문제
posts.filter(p =>
  p.title.length < 15 ||
  p.title.includes('알아보겠습니다') ||
  p.title.includes('에 대해')
)

// P1: summary 문제
posts.filter(p => !p.summary || p.summary.length < 80)

// P2: tags 부족
posts.filter(p => !p.tags || p.tags.length < 3)
```
