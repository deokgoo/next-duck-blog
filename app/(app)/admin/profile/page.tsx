import ProfileFormClient from './ProfileFormClient';
import PageTitle from '@/components/PageTitle';

export const metadata = {
  title: 'Profile Settings | Admin Dashboard',
};

export default function AdminProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pb-8 pt-6 md:space-y-12">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
          <PageTitle>Profile Settings</PageTitle>
        </div>
        <ProfileFormClient />
      </div>
    </div>
  );
}
