'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import NextImage from 'next/image';

const navItems = [
  { name: '대시보드', href: '/admin' },
  { name: '새 글 쓰기', href: '/admin/editor' },
  { name: '블로그 아이디어', href: '/admin/blog-ideas' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Admin</span>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = item.href === '/admin' 
                  ? pathname === '/admin' 
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'border-primary-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 rounded-full bg-gray-50 pl-1 pr-3 py-1 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md cursor-pointer"
              title="프로필 설정"
            >
              {user?.photoURL ? (
                <NextImage 
                  src={user.photoURL} 
                  alt="User Avatar" 
                  width={28} 
                  height={28} 
                  className="rounded-full"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
                {user?.email}
              </span>
            </Link>
            <button
              onClick={logout}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-all dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="sm:hidden flex overflow-x-auto py-3 space-x-4 hide-scrollbar">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-white'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
