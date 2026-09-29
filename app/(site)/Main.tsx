'use client';

import { useState } from 'react';
import Link from '@/components/Link';
import siteMetadata from '@/data/siteMetadata';
import { formatDate } from 'pliny/utils/formatDate';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';
import { filterPostsByTag, filterPostsByCategory } from '@/lib/utils/filterPosts';
import TagFilterBar from '@/components/TagFilterBar';
import { Post } from '@/lib/types';
import { categoriesData } from '@/data/categoriesData';
import * as LucideIcons from 'lucide-react';

const MAX_DISPLAY = 10;

interface MainProps {
  posts: Post[];
  featuredTags: string[];
  description?: string;
}

export default function Home({ posts, featuredTags, description }: MainProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredPosts = filterPostsByCategory(filterPostsByTag(posts, selectedTag), selectedCategory);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary-100/60 blur-3xl dark:bg-primary-500/10"
        />
        <div className="relative py-xxxl md:py-hero">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            {siteMetadata.author} · dev log
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-1.5px] text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl md:leading-[1.05]">
            {siteMetadata.headerTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-400 md:text-lg md:leading-8">
            {description || siteMetadata.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/blog/dev"
              className="inline-flex min-h-[40px] items-center rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              글 읽기
            </Link>
            <Link
              href="/projects"
              className="inline-flex min-h-[40px] items-center rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100"
            >
              프로젝트
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Posts ─────────────────────────────────────── */}
      <section className="py-section">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.5px] text-gray-900 dark:text-gray-50 md:text-3xl">
            Latest Posts
          </h2>
          <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
            {filteredPosts.length} posts
          </span>
        </div>

        {/* Category Filter - swipeable on mobile */}
        <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-nowrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600'
              }`}
            >
              All
            </button>
            {Object.entries(categoriesData).map(([key, data]) => {
              const IconComponent = (LucideIcons as any)[data.icon] || LucideIcons.FileText;
              return (
                <button
                  key={key}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === key ? null : key)
                  }
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === key
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <IconComponent size={14} />
                  {data.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Filter */}
        {featuredTags.length > 0 && (
          <div className="pb-2">
            <TagFilterBar
              tags={featuredTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />
          </div>
        )}

        {/* Post List */}
        <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
          {!filteredPosts.length && 'No posts found.'}
          {filteredPosts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags, createdAt } = post;
            const displayDate = createdAt || date;
            return (
              <li key={slug} className="py-xl">
                <article>
                  <Link href={`/blog/${post.category || 'dev'}/${slug}`} className="group block">
                    <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="font-mono text-xs font-medium leading-6 text-gray-400 dark:text-gray-500">
                          <time dateTime={displayDate}>
                            {formatDate(displayDate, siteMetadata.locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-2 xl:col-span-3">
                        <div>
                          <h2 className="text-xl font-bold leading-7 tracking-tight text-gray-900 transition-colors group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
                            {title}
                          </h2>
                          <div className="mt-1.5 flex items-center gap-2 text-xs">
                            {tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="font-medium text-primary-500 dark:text-primary-400"
                              >
                                #{tag.split(' ').join('-')}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-primary-400 dark:text-primary-500">...</span>
                            )}
                          </div>
                        </div>
                        <div className="prose line-clamp-2 max-w-none text-sm text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      {filteredPosts.length > MAX_DISPLAY && (
        <div className="flex justify-end pb-section text-base font-medium leading-6">
          <Link
            href="/blog/dev"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts →
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <KoreanNewsletterForm compact={true} showBenefits={false} />
        </div>
      )}
    </>
  );
}
