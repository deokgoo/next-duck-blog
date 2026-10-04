'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import { Post } from '@/lib/types';
import { Search, X, Calendar } from 'lucide-react';

interface SearchResult extends Omit<Post, 'content'> {}

function PostCard({ post }: { post: SearchResult }) {
  return (
    <article className="group rounded-xl bg-white p-6 shadow-v-border transition-shadow hover:shadow-v-card dark:bg-transparent dark:shadow-v-border-dark dark:hover:shadow-v-card-dark">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-xs text-ink-4">
          <Calendar className="h-3 w-3" />
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        <h2 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-ink dark:text-gray-100">
          <Link
            href={`/blog/${post.category || 'dev'}/${post.slug}`}
            className="transition-colors hover:text-accent"
          >
            {post.title}
          </Link>
        </h2>
        {post.summary && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-2 dark:text-gray-400">
            {post.summary}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Tag key={tag} text={tag} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      const res = await fetch(`/api/blog/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.posts || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = keyword ? `?q=${encodeURIComponent(keyword)}` : '';
      router.replace(`/search${qs}`, { scroll: false });
      doSearch(keyword);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, doSearch, router]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-14">
      <div className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-3">
          Search
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
          검색
        </h1>
        <p className="mt-2 text-sm text-ink-2 dark:text-gray-400">
          제목, 요약, 태그에서 키워드로 글을 찾아보세요.
        </p>
      </div>

      {/* 검색 입력 */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-4" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="키워드 검색..."
          autoFocus
          className="w-full rounded-xl bg-black/[0.04] py-3 pl-11 pr-10 text-base text-ink outline-none transition-all placeholder:text-ink-4 focus:bg-black/[0.06] focus:ring-2 focus:ring-accent/30 dark:bg-white/10 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-white/15"
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 결과 */}
      <div className="mb-4">
        {initialized && (
          <p className="font-mono text-xs text-ink-3">
            {keyword ? (
              <>
                <span className="font-semibold text-ink">{total}개</span>의 글을 찾았습니다
              </>
            ) : (
              <>
                전체 <span className="font-semibold text-ink">{total}개</span>의 글
              </>
            )}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-black/[0.04] dark:bg-white/10"
            />
          ))}
        </div>
      )}

      {!loading && initialized && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-2 py-20 text-center">
          <Search className="mb-3 h-10 w-10 text-ink-4" />
          <p className="font-medium text-ink-2 dark:text-gray-400">검색 결과가 없습니다</p>
          <p className="mt-1 text-sm text-ink-4">다른 키워드를 시도해보세요</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-8 py-14">
          <div className="mb-8 h-10 w-32 animate-pulse rounded-lg bg-black/[0.04] dark:bg-white/10" />
          <div className="mb-8 h-12 animate-pulse rounded-xl bg-black/[0.04] dark:bg-white/10" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-black/[0.04] dark:bg-white/10"
              />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
