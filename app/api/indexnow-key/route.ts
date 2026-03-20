/**
 * IndexNow API 키 검증 엔드포인트
 *
 * IndexNow 프로토콜은 사이트 소유권 확인을 위해
 * /{API_KEY}.txt 경로에서 키 값을 반환하도록 요구한다.
 * next.config.js의 rewrite 규칙이 해당 요청을 이 라우트로 전달한다.
 */
export async function GET(): Promise<Response> {
  const apiKey = process.env.INDEXNOW_API_KEY;

  if (!apiKey) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(apiKey, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
