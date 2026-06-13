# scripts/

블로그 글을 Firestore에서 로컬로 가져오고, 수정한 뒤 다시 반영하는 워크플로우 스크립트 모음.

---

## 워크플로우 요약

```
pull → extract → (에디터에서 수정) → apply → push
```

---

## 스크립트 상세

### posts-snapshot.mjs

Firestore ↔ 로컬 posts.json 동기화.

```bash
# Firestore → 로컬 저장
node scripts/posts-snapshot.mjs pull

# 로컬 → Firestore 반영 (변경 내용 미리 확인)
node scripts/posts-snapshot.mjs push --dry-run

# 로컬 → Firestore 반영 (실제 적용)
node scripts/posts-snapshot.mjs push

# 로컬 vs Firestore 변경 사항 비교
node scripts/posts-snapshot.mjs diff
```

- 스냅샷 위치: `.snapshots/posts.json`
- push는 로컬에 있는 것만 추가/수정. Firestore에만 있는 문서는 건드리지 않음
- 500개 초과 시 배치 자동 분할

---

### extract-drafts.mjs

posts.json에서 published 글을 개별 .md 파일로 추출.
에디터에서 직접 편집하거나 AI 윤문 작업 전에 사용.

```bash
# 전체 published 글 추출
node scripts/extract-drafts.mjs

# 특정 글만 추출
node scripts/extract-drafts.mjs [slug]

# 기존 draft 덮어쓰기
node scripts/extract-drafts.mjs --force
```

- 추출 위치: `.snapshots/drafts/{slug}.md`
- 이미 파일이 있으면 스킵 (수정 중인 파일 보호)
- 프론트매터 형식: `slug`, `title`, `summary`, `status`, `category`

---

### apply-drafts.mjs

`.snapshots/drafts/*.md` 수정 내용을 posts.json에 반영.
에디터 수정 또는 AI 윤문 완료 후 posts.json 업데이트할 때 사용.

```bash
# 전체 drafts 반영 (변경 내용 미리 확인)
node scripts/apply-drafts.mjs --dry-run

# 전체 drafts 반영 (실제 적용)
node scripts/apply-drafts.mjs

# 특정 글만 반영
node scripts/apply-drafts.mjs [slug]
```

- title, summary, content 변경 감지 → posts.json 업데이트
- lastmod 자동 갱신
- content 변경 시 body.raw도 함께 동기화

---

## 전체 워크플로우 예시

### 글 일괄 윤문 작업

```bash
# 1. 최신 데이터 가져오기
node scripts/posts-snapshot.mjs pull

# 2. drafts 폴더에 추출
node scripts/extract-drafts.mjs

# 3. .snapshots/drafts/ 에서 직접 수정 또는 AI 윤문

# 4. 변경 내용 확인
node scripts/apply-drafts.mjs --dry-run

# 5. posts.json 반영
node scripts/apply-drafts.mjs

# 6. Firestore 반영 확인 후 push
node scripts/posts-snapshot.mjs push --dry-run
node scripts/posts-snapshot.mjs push
```

### 특정 글 하나만 수정

```bash
node scripts/posts-snapshot.mjs pull
node scripts/extract-drafts.mjs [slug]
# .snapshots/drafts/[slug].md 수정
node scripts/apply-drafts.mjs [slug]
node scripts/posts-snapshot.mjs push
```
