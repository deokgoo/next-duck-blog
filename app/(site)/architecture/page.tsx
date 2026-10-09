import Reveal from '@/components/Reveal';
import { genPageMetadata } from 'app/seo';
import type { ReactNode } from 'react';

export const revalidate = false; // 영구 캐시 — 프로젝트 캐싱 원칙과 일치

export const metadata = genPageMetadata({
  title: 'Architecture',
  path: '/architecture',
  description:
    'Duck Blog의 기술 스택, 캐싱 전략, SEO, 호스팅, 분석, 광고, 콘텐츠 관리까지 — 이 블로그가 어떻게 설계되어 있는지 한눈에 보는 페이지입니다.',
});

/* ─────────────────────────────────────────────────────────────
 * 섹션 공통 UI (Vercel Minimal 토큰: ink / line / v-border / accent)
 * ───────────────────────────────────────────────────────────── */

function Section({
  no,
  title,
  lead,
  children,
}: {
  no: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-v-border py-14 dark:border-v-border-dark md:py-20">
      <Reveal>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs font-medium tracking-tight text-accent">{no}</span>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink dark:text-gray-100 md:text-3xl">
            {title}
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2 dark:text-gray-400 md:text-base">
          {lead}
        </p>
      </Reveal>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Card({
  title,
  desc,
  mono,
  className = '',
}: {
  title: string;
  desc: string;
  mono?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-5 shadow-v-card dark:bg-white/[0.03] dark:shadow-v-card-dark ${className}`}
    >
      {mono && (
        <div className="mb-2 font-mono text-[11px] font-medium tracking-tight text-accent">{mono}</div>
      )}
      <h3 className="text-sm font-semibold text-ink dark:text-gray-100">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2 dark:text-gray-400">{desc}</p>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-v-card dark:shadow-v-card-dark">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-v-border dark:border-v-border-dark">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-mono text-[11px] font-medium tracking-tight text-ink-2 dark:text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-v-border last:border-0 dark:border-v-border-dark">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 ${j === 0 ? 'font-medium text-ink dark:text-gray-100' : 'text-ink-2 dark:text-gray-400'}`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 아키텍처 다이어그램 (요청 흐름)
 * ───────────────────────────────────────────────────────────── */

function FlowNode({ label, sub, accent = false }: { label: string; sub: string; accent?: boolean }) {
  return (
    <div
      className={`flex-1 min-w-[150px] rounded-lg px-4 py-3 text-center ${
        accent
          ? 'bg-accent/10 shadow-[0_0_0_1px_rgba(10,114,239,0.35)]'
          : 'bg-white shadow-v-card dark:bg-white/[0.03] dark:shadow-v-card-dark'
      }`}
    >
      <div className="font-mono text-[11px] font-medium tracking-tight text-ink dark:text-gray-100">{label}</div>
      <div className="mt-1 text-[11px] leading-snug text-ink-2 dark:text-gray-400">{sub}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center px-1 text-ink-3 dark:text-gray-500" aria-hidden>
      <span className="hidden md:block">→</span>
      <span className="md:hidden">↓</span>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-v-card dark:bg-white/[0.03] dark:shadow-v-card-dark md:p-8">
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        <FlowNode label="Vercel Edge" sub="CDN · 보안 헤더 · rewrite" />
        <FlowArrow />
        <FlowNode label="Next.js 16" sub="App Router · Turbopack" />
        <FlowArrow />
        <FlowNode label="3-Layer Cache" sub="Request → Data → Route" accent />
        <FlowArrow />
        <FlowNode label="Firestore" sub="posts · authors · engagement" />
      </div>
      <div className="mt-4 flex flex-col items-stretch gap-2 border-t border-v-border pt-4 dark:border-v-border-dark md:flex-row">
        <FlowNode label="Client (React 19)" sub="RSC Payload · hydration" />
        <FlowArrow />
        <FlowNode label="GA · AdSense" sub="lazy load · CSP 허용 도메인" />
        <FlowArrow />
        <FlowNode label="Admin" sub="Firebase Auth · CRUD API" />
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-ink-3 dark:text-gray-500">
        정적 페이지는 빌드 시 생성되어 Edge에서 영구 서빙되고, 콘텐츠 변경 시에만 온디맨드 무효화됩니다.
        캐시 계층과 무효화 매트릭스는 아래 섹션에서 자세히 다룹니다.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 페이지
 * ───────────────────────────────────────────────────────────── */

export default function ArchitecturePage() {
  return (
    <div className="bg-white text-ink dark:bg-black dark:text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden px-8 py-20 text-center md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl animate-pulse-glow sm:h-[480px] sm:w-[480px]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="animate-fade-in-up [animation-delay:40ms]">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1 font-mono text-[11px] font-medium tracking-tight text-ink-2 backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.04] dark:text-gray-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>Engineering Notes</span>
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] animate-fade-in-up [animation-delay:120ms] sm:text-5xl md:text-6xl">
            대충 만든 게 아니라, <span className="text-accent">설계</span>로 만들었습니다
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-2 dark:text-gray-400 animate-fade-in-up [animation-delay:200ms] md:text-lg">
            Duck Blog는 Next.js 16 + Vercel + Firebase로 구축된 개인 블로그입니다.
            캐싱, SEO, 보안, 분석, 광고, 콘텐츠 관리까지 — 각 레이어가 왜 이렇게 설계되었는지
            이 페이지에서 정리했습니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 sm:px-6 xl:max-w-5xl xl:px-0">
        {/* 01 — 스택 */}
        <Section
          no="01"
          title="기술 스택"
          lead="최신 스택을 쓰되, 안정성을 우선합니다. Next.js 16의 App Router와 Previous Caching Model, React 19, Tailwind CSS로 구성됩니다."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card mono="Framework" title="Next.js 16" desc="App Router · Previous Caching Model · Turbopack. Metadata API로 SEO를 관리합니다." />
            <Card mono="UI" title="React 19 + TypeScript" desc="Server Components 기반. 타입으로 데이터 구조를 보장합니다." />
            <Card mono="Styling" title="Tailwind CSS 3.4" desc="Vercel Minimal 디자인 토큰(ink/line/accent)으로 통일된 디자인 시스템." />
            <Card mono="Content" title="Firebase Firestore" desc="포스트·저자·댓글·좋아요를 Firestore로 관리하는 헤드리스 CMS." />
            <Card mono="Rendering" title="next-mdx-remote" desc="MDX + GFM + KaTeX + Prism. 수학 공식과 코드 하이라이팅을 지원합니다." />
            <Card mono="Deploy" title="Vercel" desc="main 브랜치 push 시 자동 배포. Edge 네트워크에서 정적 서빙." />
          </div>
        </Section>

        {/* 02 — 아키텍처 */}
        <Section
          no="02"
          title="요청 흐름"
          lead="브라우저 요청이 Edge에서 콘텐츠까지 거쳐 다시 돌아오는 경로입니다. 대부분 요청은 캐시에서 바로 응답됩니다."
        >
          <ArchitectureDiagram />
        </Section>

        {/* 03 — 캐싱 */}
        <Section
          no="03"
          title="캐싱 전략"
          lead="원칙은 하나입니다: 영구 캐시 + 온디맨드 무효화. 시간 기반 재검증을 쓰지 않고, 콘텐츠가 실제로 바뀌는 순간에만 캐시를 갱신합니다."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card mono="Layer 1" title="React Request Cache" desc="cache() — 단일 렌더 패스 내 동일 호출 중복 제거." />
            <Card mono="Layer 2" title="Data Cache" desc="unstable_cache — 요청 간 데이터 캐싱, tag 기반 무효화." />
            <Card mono="Layer 3" title="Full Route Cache" desc="HTML + RSC Payload 서버 캐싱, path 기반 무효화." />
          </div>
          <div className="mt-4">
            <Table
              head={['CRUD 작업', 'Tag 무효화', 'Path 무효화']}
              rows={[
                ['Post Create', 'posts-all · tags-*', '/ · /blog · /blog/{cat} · 각 tag 페이지'],
                ['Post Update', 'posts-all · post-{slug} · tags-*', '위 + 포스트 페이지 · 카테고리/slug 변경 시 이전 경로'],
                ['Post Delete', 'posts-all · post-{slug} · tags-*', '위와 동일'],
                ['Author Update', 'author-{slug}', '/ · /about'],
              ]}
            />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3 dark:text-gray-500">
            모든 무효화는 fire-and-forget(try/catch)이라 재검증 실패가 CRUD 응답을 막지 않습니다.
            전체 매트릭스는 docs/caching-strategy.md에 있습니다.
          </p>
        </Section>

        {/* 04 — SEO */}
        <Section
          no="04"
          title="SEO"
          lead="2026-10 SEO 오딧에서 발견한 12개 문제를 반영한 최종 구성입니다. 타이틀, 언어, canonical, sitemap, 구조화 데이터까지 Metadata API로 관리합니다."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card mono="Title" title="서픽스 없는 타이틀" desc="template: '%s' — 포스트 타이틀이 검색 결과에 그대로 노출됩니다." />
            <Card mono="Lang" title="로케일별 html lang" desc="LocaleLangSync가 pathname 기준으로 ko/en/ja를 동적으로 설정합니다." />
            <Card mono="Canonical" title="페이지별 self canonical" desc="root 전역 canonical 제거 — 각 페이지가 자기 URL을 canonical로 냅니다." />
            <Card mono="hreflang" title="다국어 연결" desc="홈 3개 라우트 + 포스트별 ko/en/ja + x-default를 sitemap과 함께 출력합니다." />
            <Card mono="JSON-LD" title="구조화 데이터" desc="포스트: BlogPosting + BreadcrumbList, 홈: Organization. script 태그로 렌더링합니다." />
            <Card mono="IndexNow" title="실시간 인덱싱" desc="포스트 저장/상태 변경 시 IndexNow에 URL을 제출해 검색 반영을 앞당깁니다." />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3 dark:text-gray-500">
            RSS(feed.xml), robots.txt, GSC/Naver 검증, OG Image 폴백까지 — 전체 구성은 docs/SEO.md에 문서화되어 있습니다.
          </p>
        </Section>

        {/* 05 — 호스팅 & 보안 */}
        <Section
          no="05"
          title="호스팅 & 보안"
          lead="Vercel Edge에서 보안 헤더를 일괄 적용합니다. CSP는 필요한 도메인만 허용하는 엄격한 설정입니다."
        >
          <Table
            head={['헤더', '설정', '의도']}
            rows={[
              ['Content-Security-Policy', 'GA · AdSense · Firebase 도메인만 허용', '스크립트 주입 차단'],
              ['X-Frame-Options', 'DENY', '클릭재킹 방지'],
              ['X-Content-Type-Options', 'nosniff', 'MIME 스니핑 방지'],
              ['Strict-Transport-Security', 'max-age + preload', 'HTTPS 강제'],
              ['Referrer-Policy', 'strict-origin-when-cross-origin', '리퍼러 정보 최소화'],
              ['Permissions-Policy', '불필요한 브라우저 기능 비활성', '표면 축소'],
            ]}
          />
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3 dark:text-gray-500">
            ads.txt는 빌드 시 env에서 자동 생성되고, GSC HTML 검증 파일과 IndexNow 키 파일은 rewrite로 API 라우트에 연결됩니다.
          </p>
        </Section>

        {/* 06 — 분석 & 광고 */}
        <Section
          no="06"
          title="분석 & 광고"
          lead="트래킹과 수익화는 렌더링을 해치지 않는 방식으로 설계됩니다. 둘 다 env 기반이라 미설정 시 완전히 비활성화됩니다."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card mono="Analytics" title="Google Analytics" desc="gtag.js를 lazyOnload로 로드해 렌더링 블로킹을 방지합니다. logEvent() 헬퍼로 이벤트를 추적합니다." />
            <Card mono="Ads" title="Google AdSense" desc="디스플레이(6079435296) + 인아티클(4907054773) 슬롯. 1초 지연 push로 AdBlocker 대응, CSP에 광고 도메인만 허용합니다." />
          </div>
        </Section>

        {/* 07 — 콘텐츠 관리 */}
        <Section
          no="07"
          title="콘텐츠 관리 (Firebase CMS)"
          lead="리포지토리에 콘텐츠를 두지 않고 Firestore로 관리합니다. MDX를 Firestore 문서에 저장해 코드 배포 없이 글을 발행합니다."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card mono="Posts" title="posts 컬렉션" desc="status: published / draft / deleted. MDX 콘텐츠 + 번역(translations) 필드." />
            <Card mono="Auth" title="이중 인증" desc="클라이언트는 Firebase Auth, 서버 API는 admin SDK의 verifyIdToken으로 검증합니다." />
            <Card mono="Admin" title="/admin" desc="포스트 CRUD, MDX 에디터, 아이디어, 댓글, 참여도, 프로필 관리." />
            <Card mono="Comments" title="댓글" desc="비밀번호 해싱 + HTML 이스케이프 + 유효성 검증으로 스팸·XSS 대응." />
            <Card mono="Engagement" title="좋아요" desc="post-engagement 컬렉션, FieldValue.increment으로 원자적 증가." />
            <Card mono="Tests" title="vitest" desc="rateLimit, comments, engagement, 캐싱, 문서 구조 — property 테스트 포함." />
          </div>
        </Section>

        {/* 08 — i18n */}
        <Section
          no="08"
          title="다국어 (i18n)"
          lead="ko(기본) / en / jp 세 언어를 로케일별 라우트로 제공합니다. 번역이 없는 콘텐츠는 해당 언어에서 숨겨집니다."
        >
          <Table
            head={['콘텐츠', 'ko', 'en', 'jp', '전략']}
            rows={[
              ['홈', '✓', '✓', '✓', '로케일별 라우트, 번역 있는 글만 표시'],
              ['포스트', '✓', '번역 시', '번역 시', 'translations 필드, content은 ko 원문 fallback'],
              ['About', '✓', '—', '—', 'ko 전용 (번역 없으면 숨김)'],
              ['Projects', '✓', '—', '—', 'ko 전용'],
            ]}
          />
        </Section>

        {/* 09 — 사이트 구조 */}
        <Section
          no="09"
          title="사이트 구조"
          lead="페이지 구성과 각 페이지의 역할을 정리했습니다."
        >
          <Table
            head={['Route', '역할', '캐싱']}
            rows={[
              ['/', 'Hero + 최신 포스트 + 소개', 'Static (revalidate: false)'],
              ['/blog', '전체 포스트, 태그 필터 + 무한 스크롤', 'Static'],
              ['/blog/[category]/[...slug]', '포스트 상세 (MDX 렌더링)', 'Static + generateStaticParams'],
              ['/about', '개발자 소개 (로컬 MDX)', 'Static'],
              ['/projects', '프로젝트 카드', 'Static'],
              ['/search', '실시간 검색 (client)', 'Shell only'],
              ['/admin/*', '콘텐츠 관리 (인증 필요)', 'Shell only'],
            ]}
          />
        </Section>

        {/* CTA */}
        <section className="border-t border-v-border py-14 dark:border-v-border-dark md:py-20">
          <Reveal>
            <div className="rounded-xl bg-white p-8 text-center shadow-v-card dark:bg-white/[0.03] dark:shadow-v-card-dark md:p-10">
              <h2 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
                더 깊은 내용은 레포지토리에서
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-2 dark:text-gray-400">
                이 페이지는 요약본입니다. 캐싱 매트릭스, SEO 운영 체크리스트,
                use cache 마이그레이션 가이드까지 — 전체 문서는
                <a
                  href="https://github.com/deokgoo/next-duck-blog"
                  className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  {' '}
                  GitHub
                </a>
                의 docs/ 폴더에 있습니다.
              </p>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
