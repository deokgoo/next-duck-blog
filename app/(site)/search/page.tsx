'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import { slug as slugify } from 'github-slugger';
import { Post } from '@/lib/types';
import { Search, X, Calendar, Tag as TagIcon } from 'lucide-react';

interface TagInfo {
  tag: string;
  slug: string;
  count: number;
}

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
            href={`/blog/${post.slug}`}
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

function TagBadge({
  tag,
  count,
  selected,
  onClick,
}: {
  tag: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        selected
          ? 'border-primary-500 bg-primary-500 text-white dark:border-primary-400 dark:bg-primary-400'
          : 'border-gray-300 bg-white text-gray-600 hover:border-primary-400 hover:text-primary-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:text-primary-400'
      }`}
    >
      <span>{tag}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          selected
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  const [tagList, setTagList] = useState<TagInfo[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 태그 목록 로딩
  useEffect(() => {
    fetch('/api/blog/search', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setTagList(data.tags || []))
      .catch(console.error)
      .finally(() => setTagsLoading(false));
  }, []);

  const updateURL = useCallback(
    (kw: string, tags: string[], from: string, to: string) => {
      const params = new URLSearchParams();
      if (kw) params.set('keyword', kw);
      if (tags.length > 0) params.set('tags', tags.join(','));
      if (from) params.set('dateFrom', from);
      if (to) params.set('dateTo', to);
      const qs = params.toString();
      router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
    },
    [router]
  );

  const doSearch = useCallback(
    async (kw: string, tags: string[], from: string, to: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (kw) params.set('keyword', kw);
        if (tags.length > 0) params.set('tags', tags.join(','));
        if (from) params.set('dateFrom', from);
        if (to) params.set('dateTo', to);
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
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateURL(keyword, selectedTags, dateFrom, dateTo);
      doSearch(keyword, selectedTags, dateFrom, dateTo);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, selectedTags, dateFrom, dateTo, doSearch, updateURL]);

  const toggleTag = (tagSlug: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug]
    );
  };

  const clearAll = () => {
    setKeyword('');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
  };

  const hasFilter = keyword || selectedTags.length > 0 || dateFrom || dateTo;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">검색</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          키워드, 태그, 날짜로 글을 찾아보세요.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* 사이드바 */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* 키워드 검색 */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="키워드 검색..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary-500"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* 날짜 범위 */}
            <div className="mb-5">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                날짜 범위
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs outline-none focus:border-primary-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs outline-none focus:border-primary-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* 태그 필터 */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <TagIcon className="h-3.5 w-3.5" />
                태그
              </label>
              {tagsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              ) : (
                <div className="flex max-h-72 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  {tagList.map(({ tag, slug: tagSlug, count }) => (
                    <TagBadge
                      key={tagSlug}
                      tag={tag}
                      count={count}
                      selected={selectedTags.includes(tagSlug)}
                      onClick={() => toggleTag(tagSlug)}
                    />
                  ))}
                </div>
              )}
            </div>

            {hasFilter && (
              <button
                onClick={clearAll}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <X className="h-3 w-3" />
                필터 초기화
              </button>
            )}
          </div>
        </aside>

        {/* 결과 */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            {initialized && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasFilter ? (
                  <><span className="font-semibold text-gray-700 dark:text-gray-300">{total}개</span>의 글을 찾았습니다</>
                ) : (
                  <>전체 <span className="font-semibold text-gray-700 dark:text-gray-300">{total}개</span>의 글</>
                )}
              </p>
            )}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tagSlug) => {
                  const found = tagList.find((t) => t.slug === tagSlug);
                  return (
                    <span key={tagSlug} className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {found?.tag || tagSlug}
                      <button onClick={() => toggleTag(tagSlug)}><X className="h-3 w-3" /></button>
                    </span>
                  );
                })}
              </div>
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
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">다른 키워드나 태그를 시도해보세요</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex gap-8">
          <div className="h-64 w-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
