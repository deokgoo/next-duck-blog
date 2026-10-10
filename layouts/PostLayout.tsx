import { ReactNode } from 'react';
import { CoreContent, Post as Blog, Authors } from '@/lib/types';
import CommentWidget from '@/components/comments/CommentWidget';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import Image from '@/components/Image';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';
import ScrollTopAndComment from '@/components/ScrollTopAndComment';
import AdComponentDisplay from '@/components/AdComponentDisplay';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';
import PostEngagement from '@/components/engagement/PostEngagement';
import PostHeaderEngagement from '@/components/engagement/PostHeaderEngagement';

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`;
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`;

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

interface LayoutProps {
  content: CoreContent<Blog>;
  authorDetails: CoreContent<Authors>[];
  next?: { path: string; title: string };
  prev?: { path: string; title: string };
  children: ReactNode;
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { slug, date, title, tags, createdAt, images } = content;
  const displayDate = createdAt || date;
  const path = `blog/${slug}`;
  const basePath = 'blog';

  const bannerSrc = Array.isArray(images) ? images[0] : images;

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-v-border xl:dark:divide-v-border-dark">
          <header className="pt-xl xl:pb-xl">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3 dark:text-gray-500">
                    <time dateTime={displayDate}>
                      {new Date(displayDate).toLocaleDateString(
                        siteMetadata.locale,
                        postDateTemplate
                      )}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
              <div className="pt-md">
                <PostHeaderEngagement slug={slug} title={title} />
              </div>
            </div>
          </header>
          {bannerSrc && (
            <div className="w-full overflow-hidden">
              <Image
                src={bannerSrc}
                alt={title}
                width={1200}
                height={675}
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="grid-rows-[auto_1fr] divide-y divide-v-border pb-xxl dark:divide-v-border-dark xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0">
            <dl className="pb-xxxl pt-xl xl:border-b xl:border-v-border xl:pt-11 xl:dark:border-v-border-dark">
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                  {authorDetails.map((author) => (
                    <li className="flex items-center space-x-2" key={author.name}>
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width={38}
                          height={38}
                          alt="avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <dl className="whitespace-nowrap text-sm font-medium leading-5">
                        <dt className="sr-only">Name</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                        <dt className="sr-only">Twitter</dt>
                        <dd>
                          {author.twitter && (
                            <Link
                              href={author.twitter}
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {author.twitter
                                .replace('https://twitter.com/', '@')
                                .replace('https://x.com/', '@')}
                            </Link>
                          )}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            <div className="divide-y divide-v-border dark:divide-v-border-dark xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pb-xxl pt-xxxl dark:prose-invert">{children}</div>
              <div className="flex justify-center py-8">
                <PostEngagement slug={slug} />
              </div>
              <AdComponentDisplay />
              <div
                className="pb-xl pt-xl text-ink-2 dark:text-gray-400"
                id="comment"
              >
                <CommentWidget slug={slug} />
              </div>
              {siteMetadata.newsletter?.provider && (
                <div className="flex items-center justify-center pb-xl pt-xl">
                  <KoreanNewsletterForm showBenefits={true} />
                </div>
              )}
            </div>
            <footer>
              <div className="divide-v-border text-sm font-medium leading-5 dark:divide-v-border-dark xl:col-start-1 xl:row-start-2 xl:divide-y">
                {tags && (
                  <div className="py-md xl:py-xxl">
                    <h2 className="text-xs uppercase tracking-wide text-ink-3 dark:text-gray-500">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-md xl:block xl:space-y-8 xl:py-xxl">
                    {prev && prev.path && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-ink-3 dark:text-gray-500">
                          Previous Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${prev.path}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && next.path && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-ink-3 dark:text-gray-500">
                          Next Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${next.path}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-md xl:pt-xxl">
                <Link
                  href={`/${basePath}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Back to the blog"
                >
                  &larr; Back to the blog
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  );
}
