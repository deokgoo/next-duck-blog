import { notFound } from 'next/navigation';
import Link from '@/components/Link';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import { categoriesData, CategoryKey } from '@/data/categoriesData';
import { formatDate } from 'pliny/utils/formatDate';
import siteMetadata from '@/data/siteMetadata';
import * as LucideIcons from 'lucide-react';

type SupportedLocale = 'en' | 'jp';

export async function LocaleCategoryLandingPage({
  locale,
  category,
}: {
  locale: SupportedLocale;
  category: string;
}) {
  const data = categoriesData[category as CategoryKey];
  if (!data) return notFound();

  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);

  const localePosts = allPosts
    .filter((p) => (p.category || 'dev') === category)
    .filter((p) => !!p.translations?.[locale])
    .map((p) => ({
      ...p,
      title: p.translations![locale]!.title,
      summary: p.translations![locale]!.summary,
    }));

  const tagCounts: Record<string, number> = {};
  localePosts.forEach((p) => {
    p.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

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
            <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{data.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 pt-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Latest in {data.title}
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {localePosts.length === 0 && (
              <p className="py-4 text-gray-500">No translated posts in this category yet.</p>
            )}
            {localePosts.slice(0, 5).map((post) => {
              const { slug, date, title, summary, createdAt } = post;
              const displayDate = createdAt || date;
              return (
                <li key={slug} className="py-8">
                  <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={displayDate}>
                          {formatDate(displayDate, siteMetadata.locale)}
                        </time>
                      </dd>
                    </dl>
                    <div className="space-y-3 xl:col-span-3">
                      <h3 className="text-xl font-bold leading-8 tracking-tight">
                        <Link
                          href={`/${locale}/blog/${category}/${slug}`}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {title}
                        </Link>
                      </h3>
                      <p className="prose max-w-none text-gray-500 dark:text-gray-400">{summary}</p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
          {localePosts.length > 5 && (
            <div className="mt-8 flex justify-end">
              <Link
                href={`/${locale}/blog/${category}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                View all posts &rarr;
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tags
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {sortedTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${locale}/${category}/tag/${tag}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  #{tag} <span className="opacity-50">({tagCounts[tag]})</span>
                </Link>
              ))}
            </div>
            {sortedTags.length === 0 && (
              <p className="text-sm italic text-gray-400">No tags found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
