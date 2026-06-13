---
inclusion: manual
---

# Steering 파일 목록

`.kiro/steering/` 에 있는 파일들은 Kiro 에이전트에게 이 프로젝트의 컨텍스트와 규칙을 전달하는 가이드다.  
채팅에서 `#파일명` (확장자 제외)으로 불러와서 사용한다.

---

## inclusion 방식

| 방식 | 의미 |
|---|---|
| `auto` | 항상 자동 로드 — 모든 대화에 적용 |
| `manual` | `#파일명`으로 명시 호출 시에만 로드 |

---

## 파일 목록

### 코드 스타일

| 파일 | 호출 | 설명 |
|---|---|---|
| `design-tokens.md` | 자동 | Tailwind 커스텀 토큰 vs 기본값 판단 기준 |

---

### 블로그 글 작성·윤문

| 파일 | 호출 | 설명 |
|---|---|---|
| `blog-writing-tone.md` | `#blog-writing-tone` | 블로그 목표 톤 정의 — "경험을 나누는 동료 개발자의 존댓말" |
| `humanize-korean.md` | `#humanize-korean` | AI 티 제거 실전 가이드 — 패턴 목록, 윤문 절차, 자체검증 |

> 글 윤문 작업 시 두 파일 함께 호출 권장: `#blog-writing-tone #humanize-korean`

---

### 블로그 운영 스크립트

| 파일 | 호출 | 설명 |
|---|---|---|
| `blog-scripts.md` | `#blog-scripts` | Firestore ↔ 로컬 동기화 스크립트 명령어 모음 |

워크플로우: `pull → extract → 수정 → apply → push`  
상세 사용법: `scripts/README.md`

---

### SEO

| 파일 | 호출 | 설명 |
|---|---|---|
| `seo-current-implementation.md` | `#seo-current-implementation` | 현재 코드에 구현된 SEO 전체 현황 (sitemap, JSON-LD, canonical 등) |
| `seo-meta.md` | `#seo-meta` | **글 쓸 때** — title·summary·tags·images 작성 기준 |
| `seo-audit.md` | `#seo-audit` | **기존 글 점검할 때** — P1~P3 체크리스트, 리포트 형식, 일괄 스캔 스니펫 |

> 새 글 작성 시: `#seo-meta`  
> 기존 글 점검 시: `#seo-audit`  
> 코드 레벨 SEO 작업 시: `#seo-current-implementation`

---

## 자주 쓰는 조합

```
# 글 윤문
#blog-writing-tone #humanize-korean

# 새 글 SEO 최적화
#seo-meta

# 전체 글 SEO 감사
#seo-audit

# SEO 코드 수정
#seo-current-implementation

# 글 수정 후 Firestore 반영
#blog-scripts
```
