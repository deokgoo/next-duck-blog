// 댓글 시스템 서버 유틸리티 — 타입, 유효성 검증, 비밀번호 해싱, HTML 이스케이프, Firestore CRUD

import { db } from './firebaseAdmin'

// ── 타입 정의 ──

export interface Comment {
  id: string;
  postSlug: string;
  parentId: string | null;
  nickname: string;
  email: string | null;
  passwordHash: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: string;
  postSlug: string;
  parentId: string | null;
  nickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ── 유효성 검증 ──

export function validateComment(data: {
  nickname?: string;
  password?: string;
  content?: string;
}): ValidationResult {
  const nickname = (data.nickname ?? '').trim();
  const password = data.password ?? '';
  const content = (data.content ?? '').trim();

  if (nickname.length === 0) {
    return { valid: false, error: '닉네임을 입력해주세요' };
  }
  if (nickname.length > 30) {
    return { valid: false, error: '닉네임은 30자 이하로 입력해주세요' };
  }
  if (password.length < 4) {
    return { valid: false, error: '비밀번호는 4자 이상이어야 합니다' };
  }
  if (content.length === 0) {
    return { valid: false, error: '댓글 내용을 입력해주세요' };
  }
  if (content.length > 1000) {
    return { valid: false, error: '댓글은 1000자 이하로 입력해주세요' };
  }

  return { valid: true };
}

// ── 비밀번호 해싱 (Web Crypto API — SHA-256 + salt) ──

function getSubtle(): SubtleCrypto {
  // Node.js / Edge Runtime 환경
  if (typeof globalThis.crypto?.subtle !== 'undefined') {
    return globalThis.crypto.subtle;
  }
  // Node.js fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { webcrypto } = require('crypto');
  return webcrypto.subtle;
}

function getRandomValues(length: number): Uint8Array {
  const buf = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(buf);
    return buf;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { webcrypto } = require('crypto');
  webcrypto.getRandomValues(buf);
  return buf;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  const subtle = getSubtle();
  const saltBytes = getRandomValues(16);
  const salt = bufferToHex(saltBytes.buffer as ArrayBuffer);
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await subtle.digest('SHA-256', data);
  const hash = bufferToHex(hashBuffer);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const subtle = getSubtle();
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await subtle.digest('SHA-256', data);
  const computedHash = bufferToHex(hashBuffer);
  return computedHash === hash;
}

// ── HTML 이스케이프 ──

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function sanitizeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

// ── 이메일 유효성 검증 ──

/**
 * 이메일 형식 유효성 검증 (구문 검사)
 * - 정확히 하나의 @ 포함
 * - 로컬 파트와 도메인 파트가 비어있지 않음
 * - 도메인에 점(.) 포함
 */
export function validateEmail(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length === 0) return false;
  if (!domain || domain.length === 0) return false;
  if (!domain.includes('.')) return false;
  // 도메인의 점 앞뒤에 문자가 있어야 함
  const domainParts = domain.split('.');
  if (domainParts.some((part) => part.length === 0)) return false;
  return true;
}

// ── IP 기반 Rate Limiting (슬라이딩 윈도우) ──

/**
 * 댓글 작성 IP 기반 rate limit 확인 (슬라이딩 윈도우 방식)
 * 60초 내 동일 IP에서 최대 5개 요청 허용
 * 만료된 타임스탬프는 자동 정리
 */
export async function checkCommentRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const docRef = db.collection('comment-rate-limits').doc(ip)
  const now = Date.now()
  const windowMs = 60 * 1000 // 60초
  const maxRequests = 5

  const snapshot = await docRef.get()

  let timestamps: number[] = []

  if (snapshot.exists) {
    const data = snapshot.data()
    timestamps = data?.timestamps ?? []
  }

  // 윈도우 밖의 만료된 타임스탬프 제거
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs)

  // 윈도우 내 요청이 5개 이상이면 거부
  if (validTimestamps.length >= maxRequests) {
    // 만료된 타임스탬프가 있었다면 정리하여 저장
    if (validTimestamps.length !== timestamps.length) {
      await docRef.set({
        ip,
        timestamps: validTimestamps,
        updatedAt: new Date().toISOString(),
      })
    }
    return { allowed: false }
  }

  // 현재 타임스탬프 추가 후 저장
  validTimestamps.push(now)
  await docRef.set({
    ip,
    timestamps: validTimestamps,
    updatedAt: new Date().toISOString(),
  })

  return { allowed: true }
}

// ── Firestore CRUD 작업 ──

/**
 * Comment 문서를 CommentResponse로 변환 (passwordHash, email 제거)
 */
export function toCommentResponse(comment: Comment): CommentResponse {
  return {
    id: comment.id,
    postSlug: comment.postSlug,
    parentId: comment.parentId,
    nickname: comment.nickname,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

/**
 * 댓글 생성 — 입력 새니타이즈, 비밀번호 해싱, ID 생성, Firestore 저장
 */
export async function createComment(data: {
  postSlug: string;
  nickname: string;
  password: string;
  content: string;
  email?: string | null;
  parentId?: string | null;
}): Promise<Comment> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const nickname = sanitizeHtml(data.nickname.trim());
  const content = sanitizeHtml(data.content.trim());
  const passwordHash = await hashPassword(data.password);
  const email = data.email ?? null;
  const parentId = data.parentId ?? null;

  const comment: Comment = {
    id,
    postSlug: data.postSlug,
    parentId,
    nickname,
    email,
    passwordHash,
    content,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('comments').doc(id).set(comment);

  return comment;
}

/**
 * 특정 포스트의 댓글 목록 조회 (createdAt 오름차순)
 * passwordHash, email 필드를 제거한 CommentResponse[] 반환
 */
export async function getCommentsBySlug(slug: string): Promise<CommentResponse[]> {
  const snapshot = await db
    .collection('comments')
    .where('postSlug', '==', slug)
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Comment;
    return toCommentResponse(data);
  });
}

/**
 * 댓글 삭제 — 해당 댓글과 모든 답글(parentId가 일치하는) 함께 삭제 (cascade)
 */
export async function deleteComment(commentId: string): Promise<void> {
  // 답글 삭제 (parentId가 commentId인 문서들)
  const repliesSnapshot = await db
    .collection('comments')
    .where('parentId', '==', commentId)
    .get();

  const batch = db.batch();

  // 답글 삭제
  for (const doc of repliesSnapshot.docs) {
    batch.delete(doc.ref);
  }

  // 원본 댓글 삭제
  batch.delete(db.collection('comments').doc(commentId));

  await batch.commit();
}

/**
 * 댓글 ID로 단일 댓글 문서 조회 — 존재하지 않으면 null 반환
 */
export async function getCommentById(commentId: string): Promise<Comment | null> {
  const doc = await db.collection('comments').doc(commentId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as Comment;
}

/**
 * 모든 댓글 조회 (createdAt 내림차순) — 관리자 페이지용
 * passwordHash, email 필드를 제거한 CommentResponse[] 반환
 */
export async function getAllComments(): Promise<CommentResponse[]> {
  const snapshot = await db
    .collection('comments')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Comment;
    return toCommentResponse(data);
  });
}

/**
 * parentId 해석 — 참조된 댓글이 이미 답글인 경우 루트 조상 ID를 반환
 * 단일 레벨 중첩 강제: 답글의 답글은 원래 부모 댓글에 달리도록 함
 */
export async function resolveParentId(parentId: string): Promise<string> {
  const parentDoc = await db.collection('comments').doc(parentId).get();

  if (!parentDoc.exists) {
    return parentId;
  }

  const parentData = parentDoc.data() as Comment;

  // 부모 댓글이 이미 답글인 경우 (parentId가 있는 경우), 루트 조상 ID 반환
  if (parentData.parentId) {
    return parentData.parentId;
  }

  return parentId;
}
