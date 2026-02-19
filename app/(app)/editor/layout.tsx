import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
