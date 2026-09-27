// OG:image 1200×630 SVG 렌더러 — Next.js opengraph-image.tsx API에서 import
// https://vercel.com/docs/og-image

export interface OgImageProps {
  title: string;
  subtitle?: string;
  author?: string;
  siteName?: string;
  /** 로고 SVG data URI 또는 base64 PNG (선택) */
  logoDataUri?: string;
}

/** 1200×630 고정 */
export const OG_W = 1200;
export const OG_H = 630;

// Duck Blog 파스텔: 검정 배경 + 초록 강조
const BG = '#0a0a0a';
const FG = '#ffffff';
const ACCENT = '#22c55e';
const MUTED = '#9ca3af';

/** 긴 제목 잘라내기 (18자 기준, 3행 초과 방지) */
function truncate(str: string, max = 42): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function ogImageSvg({
  title,
  subtitle,
  author,
  siteName = 'duck blog',
  logoDataUri,
}: OgImageProps): string {
  const t = truncate(title);
  const s = subtitle ? truncate(subtitle, 60) : '';
  const hasLogo = !!logoDataUri;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#a)"/>
  <rect x="0" y="${OG_H - 6}" width="${OG_W}" height="6" fill="${ACCENT}"/>
  <rect x="64" y="64" width="8" height="40" fill="${ACCENT}" rx="4"/>
  <text x="88" y="96" font-family="system-ui,-apple-system,Inter,sans-serif"
        font-size="28" font-weight="600" fill="${MUTED}" letter-spacing="2">
    ${siteName}
  </text>
  <text x="64" y="${260}" font-family="system-ui,-apple-system,Inter,Pretendard,sans-serif"
        font-size="58" font-weight="800" fill="${FG}" letter-spacing="-0.02em">
    ${t}
  </text>
  ${
    s
      ? `<text x="64" y="330" font-family="system-ui,sans-serif" font-size="26" fill="${MUTED}">
  ${s}
</text>`
      : ''
  }
  ${
    author
      ? `<text x="64" y="${530}" font-family="system-ui,sans-serif" font-size="22" fill="${MUTED}">
  ${author}
</text>`
      : ''
  }
  ${
    hasLogo
      ? `<image x="${OG_W - 140}" y="${OG_H - 140}" width="80" height="80" href="${logoDataUri}"/>`
      : ''
  }
  <text x="${OG_W - 120}" y="${580}" text-anchor="middle"
        font-family="system-ui,sans-serif" font-size="18" fill="${ACCENT}" font-weight="600">
    READ MORE →
  </text>
</svg>`;
}
