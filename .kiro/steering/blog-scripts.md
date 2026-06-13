---
inclusion: manual
---

# 블로그 스크립트 워크플로우

Firestore에서 글을 가져오고, 수정하고, 다시 반영하는 스크립트 모음.  
전체 설명은 `scripts/README.md` 참고.

## 스크립트 위치

```
scripts/
├── posts-snapshot.mjs   # Firestore ↔ 로컬 posts.json 동기화
├── extract-drafts.mjs   # posts.json → .snapshots/drafts/*.md 추출
├── apply-drafts.mjs     # .snapshots/drafts/*.md → posts.json 반영
└── README.md            # 상세 사용법
```

## 자주 쓰는 명령어

```bash
# Firestore에서 최신 데이터 가져오기
node scripts/posts-snapshot.mjs pull

# 전체 published 글 drafts 폴더에 추출
node scripts/extract-drafts.mjs

# 특정 글만 추출
node scripts/extract-drafts.mjs [slug]

# 수정 내용 미리 확인
node scripts/apply-drafts.mjs --dry-run

# posts.json에 반영
node scripts/apply-drafts.mjs

# Firestore에 push (확인)
node scripts/posts-snapshot.mjs push --dry-run

# Firestore에 push (실제)
node scripts/posts-snapshot.mjs push
```

## 글 윤문 워크플로우

```
pull → extract → 수정(에디터 or AI) → apply --dry-run → apply → push --dry-run → push
```

1. `pull` — 최신 데이터 동기화
2. `extract` — `.snapshots/drafts/` 에 .md 파일로 추출
3. 에디터에서 직접 수정 또는 `#humanize-korean` 으로 AI 윤문 요청
4. `apply --dry-run` — 변경 사항 확인
5. `apply` — posts.json 반영
6. `push` — Firestore 반영

## 주의사항

- `.snapshots/` 폴더는 `.gitignore` 처리됨 — 커밋 안 됨
- push는 로컬에만 있는 문서 추가/수정만. Firestore에만 있는 문서 삭제 안 함
- 이미 존재하는 draft 파일은 extract 시 스킵 (수정 중 보호). 덮어쓰려면 `--force`
