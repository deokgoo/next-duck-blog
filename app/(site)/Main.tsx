import Link from '@/components/Link';
import NextImage from 'next/image';
import Reveal from '@/components/Reveal';
import { categoriesData } from '@/data/categoriesData';
import siteMetadata from '@/data/siteMetadata';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';
import { getHomeStrings } from '@/lib/i18n/home-locale';
import type { Locale } from '@/lib/i18n/messages';
import type { Post, LocalizedPost } from '@/lib/types';
import { formatDate } from 'pliny/utils/formatDate';
import * as LucideIcons from 'lucide-react';

type MainProps = {
  posts: Post[];
  locale: Locale;
  featuredTags?: string[];
  description?: string;
};

/**
 * 메인 페이지 (Vercel Minimal 리디자인)
 * - ko: 전체 게시글
 * - en/jp: 번역이 있는 글만 (기존 LocaleHomePage 로직 유지)
 * 데이터/캐싱 레이어는 건드리지 않고 UI만 교체한다.
 */
export default function Main({ posts, locale, description }: MainProps) {
  const s = getHomeStrings(locale);

  // 로케일별 글 필터링 (en/jp는 번역 존재만)
  const visiblePosts: LocalizedPost[] =
    locale === 'ko'
      ? posts.map((p) => ({ ...p, _locale: 'ko', _originalTitle: p.title, _originalSummary: p.summary }))
      : posts
          .filter((p) => !!p.translations?.[locale])
          .map((p) => ({
            ...p,
            title: p.translations![locale]!.title,
            summary: p.translations![locale]!.summary,
            _locale: locale,
            _originalTitle: p.title,
            _originalSummary: p.summary,
          }));

  const featured = visiblePosts[0];
  const recentList = visiblePosts.slice(1, 4);
  const totalPosts = visiblePosts.length;

  // 한글은 루트 라우트, en/jp는 /en, /jp 프리픽스.
  // (빈 문자열을 '/' 앞에 붙이면 '//blog/...'가 되어 프로토콜 상대 URL로 해석됨)
  const localePrefix = locale === 'ko' ? '' : `/${locale}`;

  const postHref = (p: LocalizedPost) =>
    `${localePrefix}/blog/${p.category || 'dev'}/${p.slug}`;

  const tagColor = (i: number) =>
    ['text-accent', 'text-accent-3', 'text-accent-2'][i % 3];

  return (
    <div className="bg-white text-ink dark:bg-black dark:text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden px-8 py-20 text-center md:py-28">
        {/* Subtle engineering grid & glow accent */}
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full bg-accent/10 blur-3xl animate-pulse-glow" />

        <div className="relative mx-auto max-w-3xl">
          <div className="animate-fade-in-up [animation-delay:40ms]">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1 font-mono text-[11px] font-medium tracking-tight text-ink-2 backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.04] dark:text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{s.overline}</span>
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-6xl animate-fade-in-up [animation-delay:120ms]">
            {s.heroTitle} <span className="text-accent">{s.heroTitleAccent}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-ink-2 dark:text-gray-400 md:text-lg animate-fade-in-up [animation-delay:200ms]">
            {description || s.heroSubtitle}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 animate-fade-in-up [animation-delay:280ms]">
            <Link
              href={`${localePrefix}/blog/dev`}
              className="group inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-all hover:bg-ink/90 hover:shadow-sm dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <span>{s.ctaRead}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-8 py-14">
        <Reveal>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">{s.categories}</h2>
            <span className="font-mono text-xs text-ink-4">
              {Object.keys(categoriesData).length} · {totalPosts} {s.posts}
            </span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoriesData).map(([key, data], i) => {
            const Icon = (LucideIcons as any)[data.icon] || LucideIcons.FileText;
            return (
              <Reveal key={key} delay={i * 70} y={14}>
                <Link
                  href={`${localePrefix}/blog/${key}`}
                  className="group relative block h-full rounded-lg bg-white p-5 shadow-v-border transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-v-card dark:bg-transparent dark:shadow-v-border-dark dark:hover:shadow-v-card-dark"
                >
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-white transition-transform duration-200 ease-out group-hover:scale-105"
                    style={{ backgroundColor: data.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] transition-colors group-hover:text-accent">
                    {data.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2 dark:text-gray-400">
                    {data.description}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Recent posts */}
      <section className="mx-auto max-w-5xl px-8 py-14">
        <Reveal>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">{s.recent}</h2>
            <Link
              href={`${localePrefix}/blog/dev`}
              className="font-mono text-xs text-ink-4 transition-colors hover:text-ink dark:hover:text-white"
            >
              {s.recentMeta}
            </Link>
          </div>
        </Reveal>

        {visiblePosts.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-3">{s.noPosts}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Featured */}
            {featured && (
              <Reveal className="lg:col-span-3" y={20}>
                <Link
                  href={postHref(featured)}
                  className="group relative block h-full rounded-xl bg-white p-7 shadow-v-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card dark:bg-transparent dark:shadow-v-card-dark lg:col-span-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
                      {categoriesData[featured.category || 'dev']?.title || 'Development'}
                    </span>
                    <span className="font-mono text-xs text-ink-4 opacity-0 transition-opacity group-hover:opacity-100">
                      Read article →
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em] transition-colors group-hover:text-accent">
                    {featured.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-2 dark:text-gray-400">
                    {featured.summary}
                  </p>
                  <div className="mt-5 font-mono text-xs text-ink-4">
                    {formatDate(featured.createdAt || featured.date, locale)}
                    {featured.readingTime ? ` · ${featured.readingTime.minutes} min` : ''}
                  </div>
                </Link>
              </Reveal>
            )}

            {/* List */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              {recentList.map((p, i) => (
                <Reveal key={p.slug} delay={80 + i * 80} y={16}>
                  <Link
                    href={postHref(p)}
                    className="group block rounded-lg bg-white p-5 shadow-v-border transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-v-card dark:bg-transparent dark:shadow-v-border-dark dark:hover:shadow-v-card-dark"
                  >
                    <span
                      className={`text-[10.5px] font-medium uppercase tracking-[0.1em] ${tagColor(i)}`}
                    >
                      {categoriesData[p.category || 'dev']?.title || 'Development'}
                    </span>
                    <h3 className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent">
                      {p.title}
                    </h3>
                    <div className="mt-3 font-mono text-[11px] text-ink-4">
                      {formatDate(p.createdAt || p.date, locale)}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* About / Portfolio */}
      <section className="mx-auto max-w-5xl px-8 py-14">
        <Reveal>
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-ink-3">
            {s.about}
          </p>
        </Reveal>
        <Reveal y={20}>
          <div className="group relative flex flex-col items-start gap-6 rounded-xl bg-white p-7 shadow-v-card transition-all duration-200 hover:shadow-card dark:bg-transparent dark:shadow-v-card-dark sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <NextImage
                src={siteMetadata.image}
                alt={siteMetadata.author}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-black/[0.05] transition-transform duration-300 group-hover:scale-105 dark:ring-white/10"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-black"
                title="Online / Available"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-[-0.02em]">{siteMetadata.author}</h3>
              <p className="mt-1 text-sm text-ink-3 dark:text-gray-400">{s.aboutRole}</p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2 dark:text-gray-400">
                {s.aboutBody}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.interests.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-ink-2 transition-colors hover:bg-black/[0.08] dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/15"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {locale === 'ko' && (
                <Link
                  href="/about"
                  className="group/link mt-5 inline-flex items-center gap-1 text-sm font-medium text-ink-2 underline decoration-ink-3 underline-offset-4 transition-colors hover:text-ink dark:text-gray-400 dark:decoration-gray-600 dark:hover:text-white"
                >
                  <span>{s.aboutMore}</span>
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-3xl px-8 py-14">
        <Reveal y={20}>
          <KoreanNewsletterForm language={locale === 'en' ? 'en' : 'ko'} />
        </Reveal>
      </section>
    </div>
  );
}
