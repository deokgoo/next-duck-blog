/**
 * Next.js Instrumentation
 * 서버 시작 시 한 번 실행되어 필수 환경변수 설정 여부를 검사합니다.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

const REQUIRED_ENV_VARS: { key: string; description: string }[] = [
  { key: 'FIREBASE_PROJECT_ID', description: 'Firebase 프로젝트 ID' },
  { key: 'FIREBASE_CLIENT_EMAIL', description: 'Firebase 서비스 계정 이메일' },
  { key: 'FIREBASE_PRIVATE_KEY', description: 'Firebase 서비스 계정 비공개 키' },
  { key: 'FIREBASE_STORAGE_BUCKET', description: 'Firebase Storage 버킷' },
  { key: 'FIREBASE_DATABASE_ID', description: 'Firestore 데이터베이스 ID' },
  { key: 'NEXT_PUBLIC_ADMIN_EMAILS', description: '어드민 이메일 목록' },
  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', description: 'Firebase 클라이언트 API 키' },
  { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', description: 'Firebase Auth 도메인' },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase 클라이언트 프로젝트 ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', description: 'Firebase 클라이언트 Storage 버킷' },
  { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', description: 'Firebase Messaging Sender ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', description: 'Firebase 앱 ID' },
  { key: 'NEXT_PUBLIC_SITE_URL', description: '배포된 사이트 URL' },
];

export async function register() {
  // Edge runtime에서는 실행하지 않음
  if (process.env.NEXT_RUNTIME === 'edge') return;

  const missing = REQUIRED_ENV_VARS.filter(({ key }) => !process.env[key]);

  if (missing.length === 0) return;

  const border = '═'.repeat(60);
  const lines = [
    '',
    `╔${border}╗`,
    `║  ⚠️  필수 환경변수 미설정 (${missing.length}개)`.padEnd(61) + '║',
    `╠${border}╣`,
    ...missing.map(({ key, description }) =>
      `║  ✗  ${key}`.padEnd(61) + '║\n' +
      `║     └ ${description}`.padEnd(61) + '║'
    ),
    `╠${border}╣`,
    `║  .env.local.example 파일을 참고하여 .env.local을 설정하세요`.padEnd(61) + '║',
    `╚${border}╝`,
    '',
  ];

  console.warn('\x1b[33m%s\x1b[0m', lines.join('\n'));
}
