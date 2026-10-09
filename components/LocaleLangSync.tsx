'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * <html lang>을 현재 경로(로케일)에 맞게 동기화한다.
 *
 * Next.js App Router에서 <html> 태그는 root layout(app/layout.tsx)에만 존재하므로,
 * /en, /jp 서브 라우트에서 lang을 직접 설정할 수 없다.
 * root layout 기본값은 ko이며, 이 컴포넌트가 pathname 기준으로 덮어쓴다.
 */
export function LocaleLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname.startsWith('/en')
      ? 'en'
      : pathname.startsWith('/jp')
        ? 'ja'
        : 'ko';
    document.documentElement.lang = lang;
  }, [pathname]);

  return null;
}
