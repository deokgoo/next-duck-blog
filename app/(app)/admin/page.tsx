import { getAllPosts } from '@/lib/firestore';
import Link from 'next/link';
import { formatDate } from 'pliny/utils/formatDate';
import siteMetadata from '@/data/siteMetadata';
import SectionContainer from '@/components/SectionContainer';
import PageTitle from '@/components/PageTitle';

// Client Component behavior for interaction
import AdminListClient from './AdminListClient';

export const metadata = {
  title: 'Admin Dashboard | duck blog',
};

export default async function AdminPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8 md:space-y-12">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
          <PageTitle>Admin Dashboard</PageTitle>
          <Link
            href="/editor"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-lg shadow-black/10 active:scale-95"
          >
            New Post
          </Link>
        </div>
        
        <AdminListClient initialPosts={posts} />
      </div>
    </div>
  );
}
