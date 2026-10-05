import { ReactNode } from 'react';
import { formatDate } from 'pliny/utils/formatDate';
import { CoreContent, Post as Blog } from '@/lib/types';
import CommentWidget from '@/components/comments/CommentWidget';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import siteMetadata from '@/data/siteMetadata';
import ScrollTopAndComment from '@/components/ScrollTopAndComment';
import KoreanNewsletterForm from '@/components/KoreanNewsletterForm';

interface LayoutProps {
  content: CoreContent<Blog>;
  children: ReactNode;
  next?: { path: string; title: string };
  prev?: { path: string; title: string };
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { slug, date, title, createdAt } = content;
  const displayDate = createdAt || date;

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <header>
            <div className="space-y-1 border-b border-v-border pb-10 text-center dark:border-v-border-dark">
              <dl>
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3 dark:text-gray-500">
                    <time dateTime={displayDate}>
                      {formatDate(displayDate, siteMetadata.locale)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-v-border pb-8 dark:divide-v-border-dark xl:divide-y-0">
            <div className="divide-y divide-v-border dark:divide-v-border-dark xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pb-8 pt-10 dark:prose-invert">{children}</div>
            </div>
            <div className="pb-6 pt-6 text-ink-2 dark:text-gray-400" id="comment">
              <CommentWidget slug={slug} />
            </div>
            {siteMetadata.newsletter?.provider && (
              <div className="flex items-center justify-center pb-6 pt-6">
                <KoreanNewsletterForm showBenefits={true} />
              </div>
            )}
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${prev.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && next.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${next.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  );
}
