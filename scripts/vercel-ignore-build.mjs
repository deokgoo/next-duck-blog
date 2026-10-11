#!/usr/bin/env node
/**
 * Vercel Ignored Build Step
 *
 * Vercel은 이 명령의 exit code로 빌드 여부를 결정한다:
 *   exit 0 → 빌드 스킵 (Ignored)
 *   exit 1 → 빌드 진행
 *
 * 전략: 이번 배포가 건드린 파일이 "앱 빌드 입력"이 아닌 문서/메타 파일
 * (docs, 루트 md, 에이전트/CI/스냅샷)뿐이면 빌드를 스킵한다.
 *
 * 앱 빌드 입력(변경 시 반드시 빌드)으로 간주하는 경로:
 *   app/ components/ layouts/ lib/ css/ public/ data/
 *   next.config.js vercel.json package.json pnpm-lock.yaml tsconfig.json
 *   postcss.config.* tailwind.config.* next-env.d.ts
 *
 * 그 외(=아래 SKIP_PREFIXES)만 변경된 커밋은 빌드 스킵.
 *
 * 주의: data/blog/*.mdx는 Firestore 스냅샷이라 빌드 입력이 아니지만,
 *       data/authors/default.mdx는 about 페이지가 빌드 시 읽으므로
 *       data/ 전체를 "앱 관련"으로 보수적으로 취급한다.
 *       (포스트 발행은 admin UI → Firestore + revalidate로 처리되므로
 *        mdx 커밋만으로는 스킵하지 않는 편이 안전하다.)
 */
import { execSync } from 'node:child_process';

// 이 경로(접두사)만 변경된 커밋은 빌드 스킵
const SKIP_PREFIXES = [
  'docs/',
  '.agents/',
  '.snapshots/',
  '.planning/',
  '.kiro/',
  '.hermes/',
  '.github/',
  // data/blog/*.mdx는 Firestore 스냅샷일 뿐 — 빌드 입력이 아님.
  // 포스트 콘텐츠는 Firestore(getAllPosts/getPostBySlug)에서 오고,
  // pageExtensions의 md/mdx도 data/ 디렉토리에 적용되지 않는다.
  // 발행은 admin UI → Firestore + revalidate로 처리되므로 mdx 커밋만으로는
  // 배포 사이트가 변하지 않는다. (data/authors, data/siteMetadata 등
  //  나머지 data/는 빌드 시 읽으므로 앱 관련으로 유지)
  'data/blog/',
];

// 루트 레벨에서 스킵 대상 파일 (정확히 일치)
const SKIP_ROOT_FILES = new Set([
  'README.md',
  'DESIGN.md',
  'REDESIGN_PLAN.md',
  'SETUP.md',
  'PROJECT_NOTES.md',
  'LICENSE',
  'LICENSE.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'CODE_OF_CONDUCT.md',
]);

function isSkippable(file) {
  if (SKIP_PREFIXES.some((p) => file.startsWith(p))) return true;
  // 루트 파일(슬래시 없음)만 정확히 일치로 스킵
  if (!file.includes('/')) return SKIP_ROOT_FILES.has(file);
  return false;
}

function main() {
  const prev = process.env.VERCEL_GIT_PREVIOUS_SHA;

  // 브랜치의 첫 배포(이전 SHA 없음) → 무조건 빌드
  if (!prev) {
    console.log('[ignore-build] VERCEL_GIT_PREVIOUS_SHA 없음(첫 배포) → 빌드 진행');
    process.exit(1);
  }

  let changed;
  try {
    changed = execSync(
      `git diff --name-only ${prev} HEAD`,
      { encoding: 'utf8' }
    )
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    // diff 실패(예: 이전 SHA가 이 브랜치에 없음) → 안전 위해 빌드 진행
    console.log(`[ignore-build] diff 실패 → 빌드 진행: ${e.message}`);
    process.exit(1);
  }

  if (changed.length === 0) {
    console.log('[ignore-build] 변경 파일 없음 → 빌드 스킵');
    process.exit(0);
  }

  const appFiles = changed.filter((f) => !isSkippable(f));
  const skipped = changed.filter(isSkippable);

  if (appFiles.length === 0) {
    console.log(
      `[ignore-build] 앱 관련 변경 없음 (${skipped.length}개 메타 파일만) → 빌드 스킵`
    );
    console.log(`[ignore-build]   스킵: ${skipped.join(', ')}`);
    process.exit(0);
  }

  console.log(
    `[ignore-build] 앱 관련 변경 ${appFiles.length}개 → 빌드 진행`
  );
  if (skipped.length) {
    console.log(`[ignore-build]   (동반 메타: ${skipped.join(', ')})`);
  }
  process.exit(1);
}

main();
