'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // 로그인하지 않은 경우
        router.push('/login');
      } else if (!isAuthorized) {
        // 로그인했지만 권한이 없는 경우 (화이트리스트 미포함)
        // 무한 리다이렉트 방지를 위해 경고창 띄우고 로그아웃 시키거나 홈으로 보냄
        alert('접근 권한이 없는 계정입니다.');
        router.push('/'); 
      }
    }
  }, [user, loading, isAuthorized, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // 인증되고 허용된 사용자만 렌더링
  if (user && isAuthorized) {
    return <>{children}</>;
  }

  return null;
}
