'use client';

import { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useDropdown } from './DropdownContext';

const Globe = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-6 w-6 text-gray-900 dark:text-gray-100"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.32 6.32a.75.75 0 011.06 0 11.04 11.04 0 002.57 4.42 11.04 11.04 0 004.42 2.57.75.75 0 11-.6 1.36 12.54 12.54 0 01-5-2.95 12.54 12.54 0 01-2.95-5 .75.75 0 01.5-1zM10 3.5a6.5 6.5 0 016.5 6.5.75.75 0 01-1.5 0A5 5 0 0010 5a.75.75 0 010-1.5z"
      clipRule="evenodd"
    />
  </svg>
);

const locales = [
  { code: 'ko', label: '한국어', path: '' },
  { code: 'en', label: 'English', path: '/en' },
  { code: 'jp', label: '日本語', path: '/jp' },
];

const LanguageSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { btnRef } = useDropdown('language', mounted);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mr-5">
        <div className="h-6 w-6" />
      </div>
    );
  }

  const current =
    locales.find(
      (l) => l.path && (pathname === l.path || pathname.startsWith(`${l.path}/`))
    ) || locales[0];

  const switchTo = (code: string) => {
    if (code === current.code) return;
    const target = locales.find((l) => l.code === code);
    if (!target) return;
    // 현재 로케일 프리픽스 제거: /en/blog/xxx → /blog/xxx
    const stripped = current.path
      ? pathname.replace(new RegExp(`^${current.path}`), '')
      : pathname;
    // 홈/블로그 라우트는 모든 로케일에 존재 → 경로 유지.
    // 그 외(/about, /projects, /search 등)는 타 로케일에 미존재(404) → 홈으로 폴백.
    const isSafePath = stripped === '/' || stripped.startsWith('/blog');
    const rel = isSafePath ? (stripped === '/' ? '' : stripped) : '';
    const next = target.path ? `${target.path}${rel}` : rel || '/';
    router.push(next);
  };

  return (
    <div className="mr-5">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button ref={btnRef} aria-label="Language Switcher">
            <Globe />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700">
            <div className="p-1">
              {locales.map((l) => (
                <Menu.Item key={l.code}>
                  <button
                    onClick={() => switchTo(l.code)}
                    aria-current={l.code === current.code ? 'true' : undefined}
                    className={`group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                      l.code === current.code
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {l.label}
                  </button>
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default LanguageSwitch;
