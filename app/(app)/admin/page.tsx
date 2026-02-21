import { getAllPosts } from '@/lib/firestore';
import Link from 'next/link';
import { formatDate } from 'pliny/utils/formatDate';
import siteMetadata from '@/data/siteMetadata';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';

// Client Component behavior for interaction
import AdminListClient from './AdminListClient';

export const metadata: Metadata = {
  title: `Admin Dashboard | ${siteMetadata.title}`,
};

export default async function AdminPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8 md:space-y-12">
        <AdminListClient initialPosts={posts} />
      </div>
    </div>
  );
}
