'use client';

import { useState, useTransition } from 'react';
import { revalidateAll, revalidatePosts, revalidateTags, revalidateAuthor } from './actions';
import type { RevalidateResult } from './actions';
import { RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

type ActionStatus = { result: RevalidateResult; expandedDetails: boolean } | null;

interface CacheCardProps {
  title: string;
  description: string;
  onAction: () => Promise<RevalidateResult>;
  variant?: 'default' | 'danger';
}

function CacheCard({ title, description, onAction, variant = 'default' }: CacheCardProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ActionStatus>(null);

  const handleClick = () => {
    startTransition(async () => {
      const result = await onAction();
      setStatus({ result, expandedDetails: false });
    });
  };

  const buttonBase =
    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50';
  const buttonStyle =
    variant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
      : 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
          onClick={handleClick}
          disabled={isPending}
          className={`${buttonBase} ${buttonStyle} shrink-0`}
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? '처리 중...' : '초기화'}
        </button>
      </div>

      {status && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            status.result.ok
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {status.result.ok ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{status.result.message}</span>
            {status.result.details.length > 0 && (
              <button
                onClick={() =>
                  setStatus((prev) =>
                    prev ? { ...prev, expandedDetails: !prev.expandedDetails } : prev
                  )
                }
                className="ml-auto shrink-0 opacity-70 hover:opacity-100"
              >
                {status.expandedDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          {status.expandedDetails && (
            <ul className="mt-2 space-y-1 pl-6 text-xs opacity-80">
              {status.result.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function CachePanel() {
  return (
    <div className="space-y-4">
      <CacheCard
        title="전체 캐시 초기화"
        description="모든 Data Cache 태그와 Full Route Cache를 한 번에 무효화합니다. 데이터 불일치가 의심될 때 사용하세요."
        onAction={revalidateAll}
        variant="danger"
      />
      <CacheCard
        title="포스트 목록"
        description="posts-all 태그와 /, /blog 경로 캐시를 무효화합니다."
        onAction={revalidatePosts}
      />
      <CacheCard
        title="태그 목록"
        description="tags-all 및 카테고리별 태그 캐시를 무효화합니다."
        onAction={revalidateTags}
      />
      <CacheCard
        title="저자 정보"
        description="author-default 태그와 /about, / 경로 캐시를 무효화합니다."
        onAction={revalidateAuthor}
      />
    </div>
  );
}
