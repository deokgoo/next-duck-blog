'use client';

import Link from '@/components/Link';
import { useAuth } from '@/lib/auth/AuthContext';
import headerNavLinks from '@/data/headerNavLinks';

export default function NavLinks() {
  const { isAuthorized } = useAuth();

  const visibleLinks = headerNavLinks.filter(
    (link) => link.href !== '/' && (!link.adminOnly || isAuthorized)
  );

  return (
    <>
      {visibleLinks.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className="hidden font-medium text-gray-900 dark:text-gray-100 sm:block"
        >
          {link.title}
        </Link>
      ))}
    </>
  );
}
