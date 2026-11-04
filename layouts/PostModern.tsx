import { ReactNode } from 'react';
import { CoreContent } from 'pliny/utils/contentlayer';
import type { Post as Blog, Authors } from '@/lib/types';
import CommentWidget from '@/components/comments/CommentWidget';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import Image from '@/components/Image';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';
import ScrollTopAndComment from '@/components/ScrollTopAndComment';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';

const postDateTemplate: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

interface LayoutProps {
  content: CoreContent<Blog>;
  authorDetails: CoreContent<Authors>[];
  next?: { path: string; title: string };
  prev?: { path: string; title: string };
  relatedPosts?: Blog[];
  children: ReactNode;
}

export default function PostModern({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { slug, date, title, tags, readingTime, createdAt } = content;
  const displayDate = createdAt || date;
  const path = `blog/${slug}`;
  const basePath = 'blog';

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-v-border xl:dark:divide-v-border-dark">
          {/* Header */}
          <header className="pt-6 xl:pb-6">
            <div className="space-y-4 text-center">
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
              <PageTitle>{title}</PageTitle>
              <div className="flex items-center justify-center space-x-4 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 dark:text-gray-500">
                <time dateTime={displayDate}>
                  {new Date(displayDate).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                </time>
                {readingTime && <span>• {Math.ceil(readingTime.minutes)}분 읽기</span>}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="grid-rows-[auto_1fr] divide-y divide-v-border pb-8 dark:divide-v-border-dark xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0">
            <div className="divide-y divide-v-border dark:divide-v-border-dark xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pb-8 pt-10 dark:prose-invert">{children}</div>
            </div>

            {/* Sidebar */}
            <aside className="text-sm font-medium leading-5 xl:col-start-4 xl:row-start-1">
              <div className="sticky top-8 space-y-8">
                {/* Author Info */}
                {authorDetails.map((author) => (
                  <div key={author.name} className="flex flex-col items-start">
                    {author.avatar && (
                      <div className="relative mb-3 h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-v-border shadow-subtle dark:ring-v-border-dark">
                        <Image
                          src={author.avatar}
                          width={56}
                          height={56}
                          alt={author.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-base font-semibold tracking-tight text-ink dark:text-gray-100">
                        {author.name}
                      </div>
                      {(author.occupation || author.company) && (
                        <div className="mt-0.5 text-xs text-ink-3 dark:text-gray-400">
                          {[author.occupation, author.company].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      {author.twitter && (
                        <div className="mt-1">
                          <Link
                            href={author.twitter}
                            className="text-xs font-mono text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {author.twitter
                              .replace('https://twitter.com/', '@')
                              .replace('https://x.com/', '@')}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Navigation */}
                <div className="space-y-4">
                  {prev && prev.path && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-ink-3 dark:text-gray-500">
                        이전 글
                      </div>
                      <Link
                        href={`/${prev.path}`}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {prev.title}
                      </Link>
                    </div>
                  )}
                  {next && next.path && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-ink-3 dark:text-gray-500">
                        다음 글
                      </div>
                      <Link
                        href={`/${next.path}`}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {next.title}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Back to Blog */}
                <div>
                  <Link
                    href={`/${basePath}`}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label="블로그로 돌아가기"
                  >
                    ← 블로그로 돌아가기
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <div className="pb-6 pt-6 text-ink-2 dark:text-gray-400" id="comment">
        <CommentWidget slug={slug} />
      </div>

      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pb-6 pt-6">
          <KoreanNewsletterForm showBenefits={true} />
        </div>
      )}
    </SectionContainer>
  );
}
