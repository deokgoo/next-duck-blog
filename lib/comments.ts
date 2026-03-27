// 댓글 시스템 서버 유틸리티 — 타입, 유효성 검증, 비밀번호 해싱, HTML 이스케이프

// ── 타입 정의 ──

export interface Comment {
  id: string;
  postSlug: string;
  nickname: string;
  passwordHash: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: string;
  postSlug: string;
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
