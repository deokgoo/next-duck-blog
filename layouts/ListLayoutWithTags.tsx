/* eslint-disable jsx-a11y/anchor-is-valid */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDate } from 'pliny/utils/formatDate';
import { CoreContent } from '@/lib/types';
import type { Post as Blog } from '@/lib/types';
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';

const POSTS_PER_PAGE = 10;

interface ListLayoutProps {
  posts: CoreContent<Blog>[];
  title: string;
  tags?: Record<string, number>;
}

// 홈(Main.tsx)과 동일한 accent 순환 — 토큰 재사용
const tagColor = (i: number) =>
  ['text-accent', 'text-accent-3', 'text-accent-2'][i % 3];

export default function ListLayoutWithTags({
  posts,
  title,
  tags = {},
}: ListLayoutProps) {
  const tagCounts = tags;
  const tagKeys = Object.keys(tagCounts);
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMore = displayCount < posts.length;

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + POSTS_PER_PAGE, posts.length));
  }, [posts.length]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const displayPosts = posts.slice(0, displayCount);

  return (
    <div className="bg-white text-ink dark:bg-black dark:text-gray-100">
      <div className="mx-auto max-w-5xl px-8 py-14">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-3">
            Blog
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <span className="shrink-0 font-mono text-xs text-ink-4">
              {posts.length} posts
            </span>
          </div>
        </div>

        {/* Tags — horizontal wrapping chips (mobile/PC 동일) */}
        {sortedTags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {sortedTags.map((t) => {
              const tagHref = `/search?q=${encodeURIComponent(t)}`;
              return (
                <Link
                  key={t}
                  href={tagHref}
                  className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-ink-2 transition-colors hover:bg-black/[0.08] hover:text-ink dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/15 dark:hover:text-gray-200"
                  aria-label={`View posts tagged ${t}`}
                >
                  {t} <span className="text-ink-4 dark:text-gray-500">({tagCounts[t]})</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Posts — v-border cards */}
        {displayPosts.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-3">아직 게시된 글이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {displayPosts.map((post, i) => {
              const { slug, date, title, summary, tags, createdAt, category } = post;
              const displayDate = createdAt || date;
              const path = `blog/${category || 'dev'}/${slug}`;
              return (
                <li key={slug}>
                  <Link
                    href={`/${path}`}
                    className="group block rounded-xl bg-white p-6 shadow-v-border transition-shadow hover:shadow-v-card dark:bg-transparent dark:shadow-v-border-dark dark:hover:shadow-v-card-dark sm:p-7"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`text-[11px] font-medium uppercase tracking-[0.1em] ${tagColor(i)}`}
                      >
                        {category || 'dev'}
                      </span>
                      <time
                        dateTime={displayDate}
                        className="shrink-0 font-mono text-xs text-ink-4"
                      >
                        {formatDate(displayDate, siteMetadata.locale)}
                      </time>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] transition-colors group-hover:text-accent sm:text-2xl">
                      {title}
                    </h2>
                    {summary && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-2 dark:text-gray-400">
                        {summary}
                      </p>
                    )}
                    {tags && tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-10">
            <span className="font-mono text-xs text-ink-4">Loading…</span>
          </div>
        )}
      </div>
    </div>
  );
}
