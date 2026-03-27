import { notFound } from 'next/navigation';
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import { getAllPosts, getTagsByCategory, isPostPublishedAndReady } from '@/lib/firestore';
import { categoriesData, CategoryKey } from '@/data/categoriesData';
import { formatDate } from 'pliny/utils/formatDate';
import siteMetadata from '@/data/siteMetadata';
import { Metadata } from 'next';
import * as LucideIcons from 'lucide-react';

export const revalidate = 31536000;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata | undefined> {
  const category = (await params).category as CategoryKey;
  const data = categoriesData[category];
  if (!data) return;

  return {
    title: `${data.title} | ${siteMetadata.title}`,
    description: data.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(categoriesData).map((category) => ({ category }));
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const category = (await params).category as CategoryKey;
  const data = categoriesData[category];

  if (!data) {
    return notFound();
  }

  const posts = (await getAllPosts())
    .filter(isPostPublishedAndReady)
    .filter((p) => (p.category || 'dev') === category);

  const tags = await getTagsByCategory(category);
  const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a]);

  // Use a fallback for icons if they don't exist in LucideIcons dynamically
  const IconComponent = (LucideIcons as any)[data.icon] || LucideIcons.FileText;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 xl:max-w-5xl xl:px-0">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <div className="flex items-center gap-4">
          <div 
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: data.color }}
          >
            <IconComponent size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              {data.title}
            </h1>
            <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
              {data.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 pt-10 lg:grid-cols-3">
        {/* Main Content: Latest Posts */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Latest in {data.title}
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.length === 0 && <p className="py-4 text-gray-500">No posts found in this category.</p>}
            {posts.slice(0, 5).map((post) => {
              const { slug, date, title, summary, createdAt } = post;
              const displayDate = createdAt || date;
              return (
                <li key={slug} className="py-8">
                  <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={displayDate}>{formatDate(displayDate, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-3 xl:col-span-3">
                      <div>
                        <h3 className="text-xl font-bold leading-8 tracking-tight">
                          <Link href={`/blog/${category}/${slug}`} className="text-gray-900 dark:text-gray-100">
                            {title}
                          </Link>
                        </h3>
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
          {posts.length > 5 && (
            <div className="mt-8 flex justify-end">
              <Link
                href={`/blog/${category}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label={`All posts in ${data.title}`}
              >
                View all posts &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: Explore by Tag (Sub-categories) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sub Categories / Tags
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {sortedTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${category}/tag/${tag}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  #{tag} <span className="opacity-50">({tags[tag]})</span>
                </Link>
              ))}
            </div>
            {sortedTags.length === 0 && (
              <p className="text-sm italic text-gray-400">No tags found in this category.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
