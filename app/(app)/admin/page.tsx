import siteMetadata from '@/data/siteMetadata';
import type { Metadata } from 'next';

import AdminListClient from './AdminListClient';

export const metadata: Metadata = {
  title: `Admin Dashboard | ${siteMetadata.title}`,
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8 md:space-y-12">
        <AdminListClient />
      </div>
    </div>
  );
}
