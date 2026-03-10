import { Suspense } from 'react';
import EditorClientWrapper from './EditorClientWrapper';
import { Loader2 } from 'lucide-react';

export default function EditorPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center p-8 bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>로딩 중...</p>
          </div>
        </div>
      }>
        <EditorClientWrapper />
      </Suspense>
    </div>
  );
}
