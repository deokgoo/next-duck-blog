import { sortPosts } from '@/lib/types';
import { getAllPosts, getAuthorBySlug, isPostPublishedAndReady } from '@/lib/firestore';
import Link from '@/components/Link';
import siteMetadata from '@/data/siteMetadata';
import { formatDate } from 'pliny/utils/formatDate';
import { categoriesData } from '@/data/categoriesData';
import * as LucideIcons from 'lucide-react';

type SupportedLocale = 'en' | 'jp';

const LOCALE_CONFIG: Record<SupportedLocale, {
  welcome: string;
  latestPosts: string;
  exploreCategories: string;
  allPosts: string;
}> = {
  en: {
    welcome: 'Welcome to Duck Blog',
    latestPosts: 'Latest Posts',
    exploreCategories: 'Explore Categories',
    allPosts: 'All Posts →',
  },
  jp: {
    welcome: 'Duck Blog へようこそ',
    latestPosts: '最新記事',
    exploreCategories: 'カテゴリを探す',
    allPosts: 'すべての記事 →',
  },
};

export async function LocaleHomePage({ locale }: { locale: SupportedLocale }) {
  const config = LOCALE_CONFIG[locale];

  const allPosts = await getAllPosts();
  const publishedPosts = allPosts.filter(isPostPublishedAndReady);

  const localePosts = sortPosts(
    publishedPosts
      .filter((p) => !!p.translations?.[locale])
      .map((p) => ({
        ...p,
        title: p.translations![locale]!.title,
        summary: p.translations![locale]!.summary,
      }))
  );

  let blogDescription: string | undefined;
  try {
    const author = await getAuthorBySlug('default');
    blogDescription = author?.blogDescription;
  } catch {
    blogDescription = undefined;
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-section-sm pt-xxxl md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {config.welcome}
        </h1>
        <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          {blogDescription || siteMetadata.description}
        </p>
      </div>

      <div className="py-section-sm">
        <h2 className="mb-xxl text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {config.exploreCategories}
        </h2>
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoriesData).map(([key, data]) => {
            const IconComponent = (LucideIcons as any)[data.icon] || LucideIcons.FileText;
            return (
              <Link
                key={key}
                href={`/${locale}/${key}`}
                className="group relative overflow-hidden rounded-xxxl border border-gray-100 bg-white p-xxl transition-all hover:border-transparent hover:shadow-elevated dark:border-gray-800 dark:bg-gray-900"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: data.color }}
                >
                  <IconComponent size={24} />
                </div>
                <h3 className="mb-xs text-xl font-bold text-gray-900 dark:text-white">
                  {data.title}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
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

      <div className="pb-xxl pt-section-sm">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {config.latestPosts}
        </h2>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {localePosts.length === 0 && (
          <p className="py-8 text-gray-500">No translated posts yet.</p>
        )}
        {localePosts.slice(0, 10).map((post) => {
          const { slug, date, title, summary, tags, createdAt, category } = post;
          const displayDate = createdAt || date;
          return (
            <li key={slug} className="py-xl">
              <article>
                <Link href={`/${locale}/blog/${category || 'dev'}/${slug}`} className="group block">
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
                      <h2 className="text-xl font-bold leading-7 tracking-tight text-gray-900 transition-colors group-hover:text-primary-500 dark:text-gray-100 dark:group-hover:text-primary-400">
                        {title}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="font-medium text-primary-500 dark:text-primary-400">
                            #{tag.split(' ').join('-')}
                          </span>
                        ))}
                        {tags.length > 3 && <span className="text-primary-400">...</span>}
                      </div>
                      <p className="prose line-clamp-2 max-w-none text-sm text-gray-500 dark:text-gray-400">
                        {summary}
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      {localePosts.length > 10 && (
        <div className="flex justify-end py-4 text-base font-medium leading-6">
          <Link
            href={`/${locale}/blog/dev`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {config.allPosts}
          </Link>
        </div>
      )}
    </div>
  );
}
