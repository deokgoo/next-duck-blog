import UltimateEditor from '@/components/editor/UltimateEditor';

export default async function EditorPage() {
  return (
    <div className="min-h-screen">
      <UltimateEditor initialData={null} />
    </div>
  );
}
