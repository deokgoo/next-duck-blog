import { getAuthorBySlug } from '@/lib/firestore';
import ProfileFormClient from './ProfileFormClient';
import PageTitle from '@/components/PageTitle';

export const metadata = {
  title: 'Profile Settings | Admin Dashboard',
};

export default async function AdminProfilePage() {
  const authorData = await getAuthorBySlug('default');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8 md:space-y-12">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <PageTitle>Profile Settings</PageTitle>
        </div>
        
        {authorData ? (
          <ProfileFormClient initialData={authorData} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Failed to load author profile data.
          </div>
        )}
      </div>
    </div>
  );
}
