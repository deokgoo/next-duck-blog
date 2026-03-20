import siteMetadata from '@/data/siteMetadata';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const TIMEOUT_MS = 5000;

/**
 * IndexNow API에 URL 변경 알림을 전송한다.
 * 환경변수 INDEXNOW_API_KEY가 없으면 조용히 건너뛴다.
 * 모든 에러는 내부에서 catch하여 로깅만 한다.
 */
export async function submitUrlToIndexNow(urls: string[]): Promise<void> {
  const apiKey = process.env.INDEXNOW_API_KEY;
  if (!apiKey) {
    return;
  }

  const siteUrl: string = siteMetadata.siteUrl;
  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl}/${apiKey}.txt`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: apiKey,
        keyLocation,
        urlList: urls,
      }),
      signal: controller.signal,
    });

    console.log(`[IndexNow] Response status: ${response.status}`);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('[IndexNow] Request timed out');
    } else {
      console.warn('[IndexNow] Request failed:', error);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
