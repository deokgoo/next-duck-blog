import Link from '@/components/Link';
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
      <section className="px-8 py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-ink-3">
            {s.overline}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            {s.heroTitle} <span className="text-accent">{s.heroTitleAccent}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-2 dark:text-gray-400 md:text-lg">
            {description || s.heroSubtitle}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href={`${localePrefix}/blog/dev`}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {s.ctaRead}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-8 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{s.categories}</h2>
          <span className="font-mono text-xs text-ink-4">
            {Object.keys(categoriesData).length} · {totalPosts} {s.posts}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoriesData).map(([key, data]) => {
            const Icon = (LucideIcons as any)[data.icon] || LucideIcons.FileText;
            return (
              <Link
                key={key}
                href={`${localePrefix}/blog/${key}`}
                className="group rounded-lg bg-white p-5 shadow-v-border transition-shadow hover:shadow-v-card dark:bg-transparent dark:shadow-v-border-dark dark:hover:shadow-v-card-dark"
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: data.color }}
                >
                  <Icon size={18} />
                </div>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{data.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2 dark:text-gray-400">
                  {data.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent posts */}
      <section className="mx-auto max-w-5xl px-8 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{s.recent}</h2>
          <Link
            href={`${localePrefix}/blog/dev`}
            className="font-mono text-xs text-ink-4 transition-colors hover:text-ink dark:hover:text-white"
          >
            {s.recentMeta}
          </Link>
        </div>

        {visiblePosts.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-3">{s.noPosts}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Featured */}
            {featured && (
              <Link
                href={postHref(featured)}
                className="rounded-xl bg-white p-7 shadow-v-card transition-shadow hover:shadow-v-card dark:bg-transparent dark:shadow-v-card-dark lg:col-span-3"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
                  {categoriesData[featured.category || 'dev']?.title || 'Development'}
                </span>
                <h3 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em]">
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
            )}

            {/* List */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              {recentList.map((p, i) => (
                <Link
                  key={p.slug}
                  href={postHref(p)}
                  className="rounded-lg bg-white p-5 shadow-v-border transition-shadow hover:shadow-v-card dark:bg-transparent dark:shadow-v-border-dark dark:hover:shadow-v-card-dark"
                >
                  <span
                    className={`text-[10.5px] font-medium uppercase tracking-[0.1em] ${tagColor(i)}`}
                  >
                    {categoriesData[p.category || 'dev']?.title || 'Development'}
                  </span>
                  <h3 className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em]">
                    {p.title}
                  </h3>
                  <div className="mt-3 font-mono text-[11px] text-ink-4">
                    {formatDate(p.createdAt || p.date, locale)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* About / Portfolio */}
      <section className="mx-auto max-w-5xl px-8 py-14">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-ink-3">
          {s.about}
        </p>
        <div className="flex flex-col items-start gap-6 rounded-xl bg-white p-7 shadow-v-card dark:bg-transparent dark:shadow-v-card-dark sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink text-2xl text-white dark:bg-white dark:text-black">
            🦆
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
                  className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-ink-2 dark:bg-white/10 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            {locale === 'ko' && (
              <Link
                href="/about"
                className="mt-5 inline-block text-sm font-medium text-ink-2 underline decoration-ink-3 underline-offset-4 transition-colors hover:text-ink dark:text-gray-400 dark:decoration-gray-600 dark:hover:text-white"
              >
                {s.aboutMore}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-3xl px-8 py-14">
        <KoreanNewsletterForm language={locale === 'en' ? 'en' : 'ko'} />
      </section>
    </div>
  );
}
