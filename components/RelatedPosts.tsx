import { formatDate } from 'pliny/utils/formatDate';
import type { Post } from '@/lib/types';
import Link from '@/components/Link';
import siteMetadata from '@/data/siteMetadata';

interface RelatedPostsProps {
  posts: Post[];
}

/**
 * 포스트 하단 관련 포스트 섹션.
 * 같은 카테고리/공유 태그 기반 내부 링크로 체류시간·인덱싱 강화.
 */
export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-v-border pt-10 dark:border-v-border-dark">
      <h2 className="mb-6 text-xl font-semibold tracking-[-0.02em]">
        관련 글
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.category ?? 'dev'}/${p.slug}`}
            className="group rounded-xl border border-v-border p-5 transition-colors hover:border-accent/50 dark:border-v-border-dark dark:hover:border-accent/50"
          >
            <p className="mb-2 text-xs text-ink-2 dark:text-gray-400">
              {formatDate(p.date, siteMetadata.locale)}
            </p>
            <h3 className="mb-2 text-base font-semibold leading-snug group-hover:text-accent">
              {p.title}
            </h3>
            <p className="line-clamp-2 text-sm text-ink-2 dark:text-gray-400">
              {p.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
