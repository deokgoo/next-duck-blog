import type { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import CachePanel from './CachePanel';

export const metadata: Metadata = {
  title: `캐시 관리 | Admin — ${siteMetadata.title}`,
};

export default function CachePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 xl:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">캐시 관리</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Full Route Cache와 Data Cache를 수동으로 무효화합니다. 포스트 저장·삭제 시에는 자동으로 처리되므로, 데이터 불일치가 의심될 때만 사용하세요.
        </p>
      </div>
      <CachePanel />
    </div>
  );
}
