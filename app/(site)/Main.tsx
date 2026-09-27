'use client';

import { useState } from 'react';
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';
import { formatDate } from 'pliny/utils/formatDate';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';
import { filterPostsByTag, filterPostsByCategory } from '@/lib/utils/filterPosts';
import TagFilterBar from '@/components/TagFilterBar';
import { Post } from '@/lib/types';
import { categoriesData } from '@/data/categoriesData';
import * as LucideIcons from 'lucide-react';

const MAX_DISPLAY = 10; // 5개 → 10개로 증가

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
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-section-sm pt-xxxl md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Welcome to Duck Blog
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
            {description || siteMetadata.description}
          </p>
        </div>

        {/* Category Filter - horizontal scroll (swipeable on mobile) */}
        <div className="-mx-4 overflow-x-auto px-4 pb-2 pt-section-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        <div className="pb-xxl pt-section-sm md:space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Latest Posts
          </h2>
        </div>
        {featuredTags.length > 0 && (
          <div className="py-4">
            <TagFilterBar
              tags={featuredTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />
          </div>
        )}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
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
                        <dd className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
                          <time dateTime={displayDate}>
                            {formatDate(displayDate, siteMetadata.locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-2 xl:col-span-3">
                        <div>
                          <h2 className="text-xl font-bold leading-7 tracking-tight text-gray-900 transition-colors group-hover:text-primary-500 dark:text-gray-100 dark:group-hover:text-primary-400">
                            {title}
                          </h2>
                          <div className="mt-1 flex items-center gap-2 text-xs">
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
      </div>
      {filteredPosts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
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
