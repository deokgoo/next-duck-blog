/**
 * extract-drafts.mjs
 *
 * posts.json에서 published 글을 개별 .md 파일로 추출
 * → .snapshots/drafts/{slug}.md
 *
 * 사용법:
 *   node scripts/extract-drafts.mjs              # 전체 published 추출
 *   node scripts/extract-drafts.mjs [slug]        # 특정 글만 추출
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '../.snapshots/posts.json');
const DRAFTS_DIR = path.join(__dirname, '../.snapshots/drafts');

if (!existsSync(SNAPSHOT_PATH)) {
  console.error('❌ posts.json이 없습니다. 먼저 pull을 실행하세요.');
  process.exit(1);
}

const data = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8'));

if (!existsSync(DRAFTS_DIR)) {
  mkdirSync(DRAFTS_DIR, { recursive: true });
}

const targetSlug = process.argv[2];

const posts = Object.values(data).filter((p) => {
  if (p.status !== 'published') return false;
  if (p.slug === 'tone-test-delete-me') return false;
  if (targetSlug) return p.slug === targetSlug;
  return true;
});

if (posts.length === 0) {
  console.error(`❌ 해당 글을 찾을 수 없습니다: ${targetSlug}`);
  process.exit(1);
}

let created = 0;
let skipped = 0;

for (const post of posts) {
  const draftPath = path.join(DRAFTS_DIR, `${post.slug}.md`);

  // 이미 draft가 있으면 덮어쓰지 않음 (수정 중인 파일 보호)
  if (existsSync(draftPath) && !process.argv.includes('--force')) {
    console.log(`⏭  스킵 (이미 존재): ${post.slug}.md`);
    skipped++;
    continue;
  }

  // 프론트매터 + content 형식으로 저장
  const frontmatter = [
    '---',
    `slug: ${post.slug}`,
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `summary: "${(post.summary || '').replace(/"/g, '\\"')}"`,
    `status: ${post.status}`,
    `category: ${post.category || 'dev'}`,
    '---',
    '',
  ].join('\n');

  writeFileSync(draftPath, frontmatter + post.content, 'utf-8');
  console.log(`✅ 추출: ${post.slug}.md (${post.content.length}자)`);
  created++;
}

console.log(`\n완료: 추출 ${created}개, 스킵 ${skipped}개`);
if (skipped > 0) {
  console.log('※ 기존 draft를 덮어쓰려면 --force 옵션을 추가하세요.');
}
console.log(`\n경로: ${DRAFTS_DIR}`);
