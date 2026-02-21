import { NextRequest } from 'next/server';

/**
 * Google Search Console HTML 파일 인증 처리
 *
 * 환경변수 설정:
 *   GOOGLE_SITE_VERIFICATION_ID=1d03319f0ede5dc1
 *
 * 그러면 /google1d03319f0ede5dc1.html 요청 시 올바른 내용을 반환합니다.
 */
export async function GET(request: NextRequest) {
  const verificationId = process.env.GOOGLE_SITE_VERIFICATION_ID;

  if (!verificationId) {
    return new Response('Not Found', { status: 404 });
  }

  const filename = `google${verificationId}.html`;
  const content = `google-site-verification: ${filename}`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
