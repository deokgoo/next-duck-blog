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
    <>
      <div>
        <div className="pb-6 pt-6">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden h-full max-h-screen min-w-[280px] max-w-[280px] flex-wrap overflow-auto rounded bg-gray-50 pt-5 shadow-md dark:bg-gray-900/70 dark:shadow-gray-800/40 sm:flex">
            <div className="px-6 py-4">
              <h3 className="font-bold uppercase text-primary-500">All Posts</h3>
              <ul>
                {sortedTags.map((t) => {
                  const tagHref = `/search?q=${encodeURIComponent(t)}`;

                  return (
                    <li key={t} className="my-3">
                      <Link
                          href={tagHref}
                          className="px-3 py-2 text-sm font-medium uppercase text-gray-500 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {`${t} (${tagCounts[t]})`}
                        </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="w-full">
            <ul>
              {displayPosts.map((post) => {
                const { slug, date, title, summary, tags, createdAt, category } = post;
                const displayDate = createdAt || date;
                const path = `blog/${category || 'dev'}/${slug}`;
                return (
                  <li key={slug} className="py-5">
                    <article className="flex flex-col space-y-2 xl:space-y-0">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                          <time dateTime={displayDate}>
                            {formatDate(displayDate, siteMetadata.locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
