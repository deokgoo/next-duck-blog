import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Metadata } from 'next';
import AdminNav from './AdminNav';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#0b1120]">
        <AdminNav />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
