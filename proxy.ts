import { NextRequest, NextResponse } from 'next/server';

type SupportedLocale = 'en' | 'jp';

// 국가 코드 → locale 매핑
const GEO_LOCALE_MAP: Record<string, SupportedLocale> = {
  // 영어권
  US: 'en',
  GB: 'en',
  AU: 'en',
  CA: 'en',
  NZ: 'en',
  SG: 'en',
  // 일본
  JP: 'jp',
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 루트(/) 접근 시에만 동작
  if (pathname !== '/') return NextResponse.next();

  // Vercel이 주입하는 geo 헤더 (로컬 dev에서는 없음)
  const country = request.headers.get('x-vercel-ip-country');
  if (!country) return NextResponse.next();

  const targetLocale = GEO_LOCALE_MAP[country];
  if (!targetLocale) return NextResponse.next(); // KR 등 미매핑 국가는 기본 한국어

  // Accept-Language에 ko가 명시적으로 있으면 redirect 안 함
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.toLowerCase().includes('ko')) return NextResponse.next();

  return NextResponse.redirect(new URL(`/${targetLocale}`, request.url));
}

export const config = {
  matcher: ['/'],
};
