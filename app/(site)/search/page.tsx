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
    <article className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        <h2 className="text-lg font-bold leading-snug text-gray-900 dark:text-gray-100">
          <Link
            href={`/blog/${post.category || 'dev'}/${post.slug}`}
            className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
          >
            {post.title}
          </Link>
        </h2>
        {post.summary && (
          <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{post.summary}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">검색</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          제목, 요약, 태그에서 키워드로 글을 찾아보세요.
        </p>
      </div>

      {/* 검색 입력 */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="키워드 검색..."
          autoFocus
          className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-10 text-base outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary-500"
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 결과 */}
      <div className="mb-4">
        {initialized && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {keyword ? (
              <><span className="font-semibold text-gray-700 dark:text-gray-300">{total}개</span>의 글을 찾았습니다</>
            ) : (
              <>전체 <span className="font-semibold text-gray-700 dark:text-gray-300">{total}개</span>의 글</>
            )}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
          ))}
        </div>
      )}

      {!loading && initialized && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-600">
          <Search className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="font-medium text-gray-500 dark:text-gray-400">검색 결과가 없습니다</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">다른 키워드를 시도해보세요</p>
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
    <Suspense fallback={
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="mb-8 h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
