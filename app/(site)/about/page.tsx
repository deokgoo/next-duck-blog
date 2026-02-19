import { Authors, allAuthors, coreContent } from '@/lib/types';
import { MDXLayoutRenderer } from 'pliny/mdx-components';
import AuthorLayout from '@/layouts/AuthorLayout';
import { genPageMetadata } from 'app/seo';

export const metadata = genPageMetadata({ title: 'About' });

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors;
  const mainContent = coreContent(author);

  return (
    <>
      <AuthorLayout content={mainContent}>
        {author.body && <MDXLayoutRenderer code={author.body.code} />}
      </AuthorLayout>
    </>
  );
}
