# 🦆 Next Duck Blog — 설정 가이드

이 블로그 템플릿을 포크하여 자신의 블로그로 만들기 위한 단계별 설정 가이드입니다.

---

## 1. 필수 설정

### 1-1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. **Firestore Database** 활성화 (Production 모드 권장)
3. **Storage** 활성화
4. **Authentication** 활성화 → Sign-in method에서 **Google** 로그인 활성화

### 1-2. Firebase 서비스 계정 키 발급 (서버용)

1. Firebase Console → **프로젝트 설정** → **서비스 계정** 탭
2. "새 비공개 키 생성" 클릭 → JSON 파일 다운로드

### 1-3. Firebase 웹 앱 설정 (클라이언트용)

1. Firebase Console → **프로젝트 설정** → **일반** 탭 → 웹 앱 추가
2. 앱 등록 후 `firebaseConfig` 값 복사

---

## 2. 환경 변수 설정

프로젝트 루트의 `.env.local.example`을 복사하여 `.env.local` 파일을 생성하세요:

```bash
cp .env.local.example .env.local
```

`.env.local`의 필수 항목을 채워주세요:

| 환경 변수 | 설명 | 필수 여부 |
|-----------|------|----------|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | ✅ 필수 |
| `FIREBASE_CLIENT_EMAIL` | 서비스 계정 이메일 | ✅ 필수 |
| `FIREBASE_PRIVATE_KEY` | 서비스 계정 비공개 키 | ✅ 필수 |
| `FIREBASE_STORAGE_BUCKET` | Storage 버킷 (예: `your-id.appspot.com`) | ✅ 필수 |
| `FIREBASE_DATABASE_ID` | Firestore DB 이름 (기본: `(default)`) | ✅ 필수 |
| `NEXT_PUBLIC_ADMIN_EMAILS` | 어드민 접근 이메일 목록 (쉼표 구분) | ✅ 필수 |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase 클라이언트 설정 6개 | ✅ 필수 |
| `NEXT_PUBLIC_SITE_URL` | 배포된 사이트 URL | ✅ 필수 |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics 4 ID | 선택 |
| `NEXT_PUBLIC_NAVER_WEBMASTER_ID` | 네이버 웹마스터 인증 코드 | 선택 |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | Google AdSense Publisher ID | 선택 |
| `NEXT_UMAMI_ID` | Umami Analytics Website ID | 선택 |
| `NEXT_PUBLIC_GISCUS_*` | Giscus 댓글 설정 4개 | 선택 |

---

## 3. 사이트 메타데이터 수정

`data/siteMetadata.js`에서 블로그 기본 정보를 설정하세요:

```js
title: 'My Blog',          // 브라우저 탭, SEO 제목
author: 'Blog Author',     // 저자 이름
headerTitle: 'My Blog',    // 헤더에 표시되는 이름
description: '...',        // SEO 설명
```

SNS 링크도 이 파일에서 수정할 수 있습니다 (`github`, `twitter`, `linkedin` 등).

---

## 4. 저자 정보 수정

`data/authors/default.mdx`에서 자신의 정보를 입력하세요:

```yaml
---
name: Your Name
occupation: Developer
company: Your Company
email: your@email.com
github: https://github.com/your-username
---
```

Firebase의 어드민 대시보드(`/admin`)에서도 저자 정보를 관리할 수 있습니다.

---

## 5. 댓글 설정 (Giscus, 선택사항)

1. [giscus.app](https://giscus.app)에서 저장소 연동 설정
2. 발급받은 값을 `.env.local`의 `NEXT_PUBLIC_GISCUS_*` 항목에 입력
3. GitHub 저장소에서 **Discussions** 기능 활성화 필요

---

## 6. Vercel 배포

1. [Vercel](https://vercel.com)에 GitHub 저장소 연결
2. **Environment Variables** 설정에서 `.env.local`의 모든 항목 입력
3. Firebase Console에서 **Authorized domains**에 Vercel 배포 URL 추가
   - Authentication → Settings → Authorized domains

---

## 7. 템플릿 업데이트 받기 (Upstream Sync)

이 템플릿의 개선사항을 주기적으로 반영하려면 `upstream` 리모트를 등록하세요.

### 최초 설정

```bash
# 원본 템플릿 저장소를 upstream으로 추가
git remote add upstream https://github.com/deokgoo/next-duck-blog.git

# 설정 확인
git remote -v
```

### 업데이트 반영 방법

> **권장: Rebase 방식** (커밋 히스토리가 깔끔하게 유지됨)

```bash
# 1. upstream의 최신 변경사항 가져오기
git fetch upstream

# 2. 템플릿 브랜치(template)의 변경사항을 내 작업 브랜치에 rebase
git rebase upstream/template

# 3. 충돌이 발생하면 해결 후
git rebase --continue

# 4. 내 저장소에 반영
git push origin main --force-with-lease
```

> **대안: Merge 방식**

```bash
git fetch upstream
git merge upstream/template --allow-unrelated-histories
```

### 주의사항

- `data/siteMetadata.js`, `data/authors/default.mdx`, `.env.local`은 개인 설정 파일이므로 충돌 시 **내 버전을 유지**하세요.
- 업데이트 전에는 항상 현재 브랜치를 백업하거나 `git stash`를 활용하세요.

---

## 8. Firestore 보안 규칙

Firebase Console → Firestore → **Rules**에서 아래와 같이 설정하세요:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 게시된 포스트는 누구나 읽기 가능
    match /posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null;
    }
    // authors 컬렉션은 누구나 읽기 가능
    match /authors/{authorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 체크리스트

- [ ] Firebase 프로젝트 생성 및 각 서비스 활성화
- [ ] `.env.local` 파일 생성 및 필수 항목 입력
- [ ] `data/siteMetadata.js` 블로그 정보 수정
- [ ] `data/authors/default.mdx` 저자 정보 수정
- [ ] Vercel 배포 및 환경변수 설정
- [ ] Firebase Authorized domains에 Vercel URL 추가
- [ ] (선택) Giscus 댓글 설정
- [ ] (선택) Google Analytics / AdSense 설정
- [ ] `git remote add upstream` 설정
