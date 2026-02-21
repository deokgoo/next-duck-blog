import UltimateEditor from '@/components/editor/UltimateEditor';
import { getPostBySlug } from '@/lib/firestore';
import { Post } from '@/lib/types';

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const slug = typeof resolvedParams.slug === 'string' ? resolvedParams.slug : undefined;
  
  let initialData: Post | null = null;

  if (slug) {
    const post = await getPostBySlug(slug);
    if (post) {
      initialData = post;
    }
  }

  // Ensure plain object serialization for Server action/Client component boundary
  const plainInitialData = initialData ? JSON.parse(JSON.stringify(initialData)) : null;

  return (
    <div className="min-h-screen">
      <UltimateEditor initialData={plainInitialData} />
    </div>
  );
}
