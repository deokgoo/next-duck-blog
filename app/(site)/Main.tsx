'use client';

import { useState } from 'react';
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';
import { formatDate } from 'pliny/utils/formatDate';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';
import { filterPostsByTag } from '@/lib/utils/filterPosts';
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
  const filteredPosts = filterPostsByTag(posts, selectedTag);

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-12 pt-10 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Welcome to Duck Blog
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
            {description || siteMetadata.description}
          </p>
        </div>

        {/* Category Grid Section */}
        <div className="py-12">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Explore Categories
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(categoriesData).map(([key, data]) => {
              const IconComponent = (LucideIcons as any)[data.icon] || LucideIcons.FileText;
              return (
                <Link
                  key={key}
                  href={`/${key}`}
                  className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 transition-all hover:border-transparent hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                >
                  <div 
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-transform group-hover:scale-110"
                    style={{ backgroundColor: data.color }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {data.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {data.description}
                  </p>
                  <div 
                    className="absolute bottom-0 right-0 h-1.5 w-0 transition-all group-hover:w-full"
                    style={{ backgroundColor: data.color }}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pb-8 pt-12 md:space-y-5">
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
              <li key={slug} className="py-6">
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
