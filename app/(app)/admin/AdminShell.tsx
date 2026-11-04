'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import NextImage from 'next/image';
import { useState } from 'react';
import {
  LayoutDashboard,
  SquarePen,
  MessageSquare,
  Lightbulb,
  Database,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { name: '대시보드', href: '/admin', icon: LayoutDashboard },
  { name: '새 글 쓰기', href: '/admin/editor', icon: SquarePen },
  { name: '댓글 관리', href: '/admin/comments', icon: MessageSquare },
  { name: '블로그 아이디어', href: '/admin/blog-ideas', icon: Lightbulb },
  { name: '캐시 관리', href: '/admin/cache', icon: Database },
  { name: '프로필', href: '/admin/profile', icon: User },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const sidebarHeader = (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
      <span className="text-lg font-bold text-gray-900 dark:text-white">Admin</span>
      <button
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 lg:hidden"
        onClick={() => setMobileOpen(false)}
        aria-label="메뉴 닫기"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const navLinks = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  const profileFooter = (
    <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/profile"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          title="프로필 설정"
        >
          {user?.photoURL ? (
            <NextImage
              src={user.photoURL}
              alt="User Avatar"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-600 dark:text-gray-300">
            {user?.email}
          </span>
        </Link>
        <button
          onClick={logout}
          className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="로그아웃"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <span className="text-lg font-bold text-gray-900 dark:text-white">Admin</span>
        <button
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={() => setMobileOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop: sidebar + main */}
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex">
          {sidebarHeader}
          {navLinks}
          {profileFooter}
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl dark:bg-gray-900">
            {sidebarHeader}
            {navLinks}
            {profileFooter}
          </aside>
        </div>
      )}
    </>
  );
}
