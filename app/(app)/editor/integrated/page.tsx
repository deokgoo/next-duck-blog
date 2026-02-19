'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IntegratedEditorPage() {
  const router = useRouter();

  useEffect(() => {
    // 메인 에디터로 리다이렉트
    router.replace('/editor');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">에디터 통합됨</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          모든 기능이 통합된 메인 에디터로 이동 중...
        </p>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}
