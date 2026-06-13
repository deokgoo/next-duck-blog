/**
 * posts-snapshot.mjs
 *
 * Firestore 'posts' 컬렉션 스냅샷 관리 스크립트
 *
 * 사용법:
 *   node scripts/posts-snapshot.mjs pull             # Firestore → 로컬 JSON 저장
 *   node scripts/posts-snapshot.mjs push             # 로컬 JSON → Firestore 일괄 업데이트
 *   node scripts/posts-snapshot.mjs diff             # 로컬 vs Firestore 변경 사항 비교
 *   node scripts/posts-snapshot.mjs push --dry-run   # 실제 반영 없이 변경 내용만 출력
 */

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// .env.local 로드
const { config: dotenvConfig } = require('dotenv');
dotenvConfig({ path: path.join(__dirname, '../.env.local') });

const SNAPSHOT_PATH = path.join(__dirname, '../.snapshots/posts.json');
const COLLECTION = 'posts';

// ── Firebase 초기화 ──────────────────────────────────────────────────────────

function getDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Firebase 환경변수가 없습니다. .env.local을 확인하세요.');
    console.error('   필요: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  const databaseId = process.env.FIREBASE_DATABASE_ID || '(default)';
  return getFirestore(admin.app(), databaseId);
}

// ── 스냅샷 디렉토리 준비 ──────────────────────────────────────────────────────

function ensureSnapshotDir() {
  const dir = path.dirname(SNAPSHOT_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ── pull: Firestore → 로컬 ───────────────────────────────────────────────────

async function pull() {
  const db = getDb();
  console.log('📥 Firestore에서 posts 컬렉션을 가져오는 중...\n');

  const snapshot = await db.collection(COLLECTION).orderBy('date', 'desc').get();
  const posts = {};

  snapshot.docs.forEach((doc) => {
    posts[doc.id] = doc.data();
  });

  ensureSnapshotDir();
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(posts, null, 2), 'utf-8');

  const total = Object.keys(posts).length;
  console.log(`✅ ${total}개 게시글 저장 완료 → ${SNAPSHOT_PATH}\n`);

  // 상태별 현황
  const byStatus = {};
  Object.values(posts).forEach((post) => {
    const s = post.status || 'unknown';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });
  console.log('상태별 현황:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}개`);
  });
}

// ── push: 로컬 → Firestore ───────────────────────────────────────────────────

async function push(dryRun = false) {
  if (!existsSync(SNAPSHOT_PATH)) {
    console.error(`❌ 스냅샷 파일이 없습니다: ${SNAPSHOT_PATH}`);
    console.error('   먼저 pull을 실행하세요: node scripts/posts-snapshot.mjs pull');
    process.exit(1);
  }

  const local = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8'));
  const db = getDb();

  console.log(`📤 로컬 스냅샷 → Firestore 업데이트${dryRun ? ' (dry-run)' : ''}\n`);

  // 현재 Firestore 상태 가져오기
  const snapshot = await db.collection(COLLECTION).get();
  const remote = {};
  snapshot.docs.forEach((doc) => {
    remote[doc.id] = doc.data();
  });

  const remoteIds = new Set(Object.keys(remote));
  const toAdd = [];
  const toUpdate = [];

  for (const [id, localData] of Object.entries(local)) {
    if (!remoteIds.has(id)) {
      toAdd.push({ id, data: localData });
    } else {
      const localStr = JSON.stringify(localData);
      const remoteStr = JSON.stringify(remote[id]);
      if (localStr !== remoteStr) {
        toUpdate.push({ id, data: localData, prev: remote[id] });
      }
    }
  }

  if (toAdd.length === 0 && toUpdate.length === 0) {
    console.log('✅ 변경 사항이 없습니다. Firestore와 동일합니다.');
    return;
  }

  // 변경 내용 출력
  if (toAdd.length > 0) {
    console.log(`➕ 새로 추가할 게시글 (${toAdd.length}개):`);
    toAdd.forEach(({ id, data }) => {
      console.log(`   - ${id} | ${data.title} | ${data.status}`);
    });
    console.log('');
  }

  if (toUpdate.length > 0) {
    console.log(`✏️  업데이트할 게시글 (${toUpdate.length}개):`);
    toUpdate.forEach(({ id, data, prev }) => {
      const changedFields = Object.keys(data).filter(
        (key) => JSON.stringify(data[key]) !== JSON.stringify(prev[key])
      );
      console.log(`   - ${id} | ${data.title}`);
      changedFields.forEach((field) => {
        const prevPreview = JSON.stringify(prev[field]);
        const newPreview = JSON.stringify(data[field]);
        const p = prevPreview?.length > 70 ? prevPreview.slice(0, 70) + '...' : prevPreview;
        const n = newPreview?.length > 70 ? newPreview.slice(0, 70) + '...' : newPreview;
        console.log(`     [${field}] ${p} → ${n}`);
      });
    });
    console.log('');
  }

  if (dryRun) {
    console.log('🔍 dry-run 모드: 실제 변경은 하지 않습니다.');
    console.log('   실제 반영: node scripts/posts-snapshot.mjs push');
    return;
  }

  // Firestore 일괄 적용 (Firestore batch 한 번에 최대 500개)
  const allChanges = [
    ...toAdd.map(({ id, data }) => ({ id, data })),
    ...toUpdate.map(({ id, data }) => ({ id, data })),
  ];

  const BATCH_SIZE = 499;
  for (let i = 0; i < allChanges.length; i += BATCH_SIZE) {
    const chunk = allChanges.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    chunk.forEach(({ id, data }) => {
      batch.set(db.collection(COLLECTION).doc(id), data);
    });
    await batch.commit();
    console.log(`   배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length}개 처리 완료`);
  }

  console.log(`\n✅ 완료: 추가 ${toAdd.length}개, 업데이트 ${toUpdate.length}개`);
}

// ── diff: 변경 사항 비교 ─────────────────────────────────────────────────────

async function diff() {
  if (!existsSync(SNAPSHOT_PATH)) {
    console.error(`❌ 스냅샷 파일이 없습니다: ${SNAPSHOT_PATH}`);
    console.error('   먼저 pull을 실행하세요: node scripts/posts-snapshot.mjs pull');
    process.exit(1);
  }

  const local = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8'));
  const db = getDb();

  console.log('🔍 로컬 스냅샷 vs Firestore 비교 중...\n');

  const snapshot = await db.collection(COLLECTION).get();
  const remote = {};
  snapshot.docs.forEach((doc) => {
    remote[doc.id] = doc.data();
  });

  const localIds = new Set(Object.keys(local));
  const remoteIds = new Set(Object.keys(remote));

  const onlyLocal = [...localIds].filter((id) => !remoteIds.has(id));
  const onlyRemote = [...remoteIds].filter((id) => !localIds.has(id));
  const changed = [...localIds]
    .filter((id) => remoteIds.has(id))
    .filter((id) => JSON.stringify(local[id]) !== JSON.stringify(remote[id]));

  if (onlyLocal.length === 0 && onlyRemote.length === 0 && changed.length === 0) {
    console.log('✅ 변경 사항 없음. 로컬과 Firestore가 동일합니다.');
    return;
  }

  if (onlyLocal.length > 0) {
    console.log(`➕ 로컬에만 있음 (push 시 추가됨): ${onlyLocal.length}개`);
    onlyLocal.forEach((id) => console.log(`   - ${id} | ${local[id]?.title}`));
    console.log('');
  }

  if (onlyRemote.length > 0) {
    console.log(`⚠️  Firestore에만 있음 (로컬 스냅샷에 없음): ${onlyRemote.length}개`);
    console.log('   ※ push는 이 문서를 삭제하지 않습니다.');
    onlyRemote.forEach((id) => console.log(`   - ${id} | ${remote[id]?.title}`));
    console.log('');
  }

  if (changed.length > 0) {
    console.log(`✏️  변경됨: ${changed.length}개`);
    changed.forEach((id) => {
      const changedFields = Object.keys(local[id]).filter(
        (key) => JSON.stringify(local[id][key]) !== JSON.stringify(remote[id][key])
      );
      console.log(`   - ${id} | ${local[id]?.title} | 변경 필드: ${changedFields.join(', ')}`);
    });
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

const command = process.argv[2];
const isDryRun = process.argv.includes('--dry-run');

switch (command) {
  case 'pull':
    pull().catch(console.error);
    break;
  case 'push':
    push(isDryRun).catch(console.error);
    break;
  case 'diff':
    diff().catch(console.error);
    break;
  default:
    console.log('사용법:');
    console.log('  node scripts/posts-snapshot.mjs pull             # Firestore → 로컬 저장');
    console.log('  node scripts/posts-snapshot.mjs push             # 로컬 → Firestore 업데이트');
    console.log('  node scripts/posts-snapshot.mjs push --dry-run   # 변경 내용만 미리 확인');
    console.log('  node scripts/posts-snapshot.mjs diff             # 로컬 vs Firestore 비교');
    process.exit(1);
}
