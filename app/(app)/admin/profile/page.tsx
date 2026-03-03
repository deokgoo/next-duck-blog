import { getAuthorBySlug, getAllTags } from '@/lib/firestore';
import ProfileFormClient from './ProfileFormClient';
import PageTitle from '@/components/PageTitle';

export const metadata = {
  title: 'Profile Settings | Admin Dashboard',
};

export default async function AdminProfilePage() {
  const [authorData, tagRecord] = await Promise.all([getAuthorBySlug('default'), getAllTags()]);

  const allTags = Object.keys(tagRecord).sort();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pb-8 pt-6 md:space-y-12">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
          <PageTitle>Profile Settings</PageTitle>
        </div>

        {authorData ? (
          <ProfileFormClient initialData={authorData} allTags={allTags} />
        ) : (
          <div className="py-12 text-center text-gray-500">Failed to load author profile data.</div>
        )}
      </div>
    </div>
  );
}
