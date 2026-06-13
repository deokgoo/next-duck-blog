/**
 * apply-drafts.mjs
 *
 * .snapshots/drafts/*.md → posts.json 반영
 * draft 파일의 프론트매터(title, summary)와 content를 posts.json에 업데이트
 *
 * 사용법:
 *   node scripts/apply-drafts.mjs              # 전체 drafts 반영
 *   node scripts/apply-drafts.mjs [slug]        # 특정 글만 반영
 *   node scripts/apply-drafts.mjs --dry-run     # 변경 내용만 미리 확인
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '../.snapshots/posts.json');
const DRAFTS_DIR = path.join(__dirname, '../.snapshots/drafts');

const dryRun = process.argv.includes('--dry-run');
const targetSlug = process.argv.slice(2).find((a) => !a.startsWith('--'));

// ── 프론트매터 파서 ──────────────────────────────────────────────────────────

function parseDraft(filePath) {
  const raw = readFileSync(filePath, 'utf-8');

  if (!raw.startsWith('---')) {
    throw new Error(`프론트매터가 없습니다: ${filePath}`);
  }

  const endIdx = raw.indexOf('\n---', 3);
  if (endIdx === -1) {
    throw new Error(`프론트매터 닫힘 태그가 없습니다: ${filePath}`);
  }

  const frontmatterRaw = raw.slice(3, endIdx).trim();
  const content = raw.slice(endIdx + 4).replace(/^\n/, '');

  const meta = {};
  for (const line of frontmatterRaw.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^"(.*)"$/, '$1');
    meta[key] = val;
  }

  return { meta, content };
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

if (!existsSync(SNAPSHOT_PATH)) {
  console.error('❌ posts.json이 없습니다. 먼저 pull을 실행하세요.');
  process.exit(1);
}

if (!existsSync(DRAFTS_DIR)) {
  console.error('❌ drafts 폴더가 없습니다. 먼저 extract-drafts.mjs를 실행하세요.');
  process.exit(1);
}

const data = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8'));

// 대상 파일 목록
let draftFiles = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith('.md'));
if (targetSlug) {
  draftFiles = draftFiles.filter((f) => f === `${targetSlug}.md`);
  if (draftFiles.length === 0) {
    console.error(`❌ draft 파일을 찾을 수 없습니다: ${targetSlug}.md`);
    process.exit(1);
  }
}

console.log(`📝 drafts → posts.json 반영${dryRun ? ' (dry-run)' : ''}\n`);

let updated = 0;
let unchanged = 0;
let errors = 0;

for (const file of draftFiles) {
  const slug = file.replace('.md', '');
  const draftPath = path.join(DRAFTS_DIR, file);

  try {
    const { meta, content } = parseDraft(draftPath);

    if (!data[slug]) {
      console.log(`⚠️  posts.json에 없는 slug: ${slug} — 스킵`);
      errors++;
      continue;
    }

    const original = data[slug];
    const changes = [];

    // title 변경 감지
    if (meta.title && meta.title !== original.title) {
      changes.push(`  title: "${original.title}"\n       → "${meta.title}"`);
    }

    // summary 변경 감지
    if (meta.summary && meta.summary !== (original.summary || '')) {
      const prevPreview = (original.summary || '').slice(0, 60);
      const newPreview = meta.summary.slice(0, 60);
      changes.push(`  summary: "${prevPreview}..."\n          → "${newPreview}..."`);
    }

    // content 변경 감지
    const contentChanged = content !== original.content;
    if (contentChanged) {
      const origLen = original.content?.length || 0;
      const newLen = content.length;
      const changeRate = Math.abs(newLen - origLen) / origLen * 100;
      changes.push(`  content: ${origLen}자 → ${newLen}자 (${changeRate.toFixed(1)}% 변화)`);
    }

    if (changes.length === 0) {
      console.log(`✓ 변경 없음: ${slug}`);
      unchanged++;
      continue;
    }

    console.log(`✏️  변경: ${slug}`);
    changes.forEach((c) => console.log(c));

    if (!dryRun) {
      if (meta.title) data[slug].title = meta.title;
      if (meta.summary) data[slug].summary = meta.summary;
      if (contentChanged) {
        data[slug].content = content;
        // body.raw도 동기화 (Firestore 스키마 호환)
        if (data[slug].body) {
          data[slug].body.raw = content;
        }
      }
      data[slug].lastmod = new Date().toISOString();
    }

    updated++;
    console.log('');
  } catch (err) {
    console.error(`❌ 오류 (${file}): ${err.message}`);
    errors++;
  }
}

console.log(`\n결과: 업데이트 ${updated}개, 변경 없음 ${unchanged}개, 오류 ${errors}개`);

if (dryRun) {
  console.log('\n🔍 dry-run 모드: 실제 변경 없음');
  console.log('   실제 반영: node scripts/apply-drafts.mjs');
} else if (updated > 0) {
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('\n✅ posts.json 업데이트 완료');
  console.log('   Firestore에 반영: node scripts/posts-snapshot.mjs push --dry-run');
}
