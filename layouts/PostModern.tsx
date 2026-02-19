import { ReactNode } from 'react';
import { CoreContent } from 'pliny/utils/contentlayer';
import type { Post as Blog, Authors } from '@/lib/types';
import Comments from '@/components/Comments';
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
  children: ReactNode;
}

export default function PostModern({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { slug, date, title, tags, readingTime } = content;
  const path = `blog/${slug}`;
  const basePath = 'blog';

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          {/* Header */}
          <header className="pt-6 xl:pb-6">
            <div className="space-y-4 text-center">
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
              <PageTitle>{title}</PageTitle>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                </time>
                {readingTime && <span>• {Math.ceil(readingTime.minutes)}분 읽기</span>}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pb-8 pt-10 dark:prose-invert">{children}</div>
            </div>

            {/* Sidebar */}
            <aside className="text-sm font-medium leading-5 xl:col-start-4 xl:row-start-1">
              <div className="sticky top-8 space-y-8">
                {/* Author Info */}
                {authorDetails.map((author) => (
                  <div key={author.name} className="flex items-center space-x-2">
                    {author.avatar && (
                      <Image
                        src={author.avatar}
                        width={40}
                        height={40}
                        alt="avatar"
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-gray-900 dark:text-gray-100">{author.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">@{author.twitter}</div>
                    </div>
                  </div>
                ))}

                {/* Navigation */}
                <div className="space-y-4">
                  {prev && prev.path && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
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

      {siteMetadata.comments && (
        <div className="pb-6 pt-6 text-center text-gray-700 dark:text-gray-300" id="comment">
          <Comments slug={slug} />
        </div>
      )}

      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-6 pb-6">
          <KoreanNewsletterForm
            showBenefits={true}
          />
        </div>
      )}
    </SectionContainer>
  );
}
