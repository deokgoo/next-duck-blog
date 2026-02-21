import { Authors, coreContent, allAuthors } from '@/lib/types';
import { getAuthorBySlug } from '@/lib/firestore';
import { MDXLayoutRenderer } from 'pliny/mdx-components';
import AuthorLayout from '@/layouts/AuthorLayout';
import { genPageMetadata } from 'app/seo';

export const metadata = genPageMetadata({ title: 'About' });

export default async function Page() {
  const authorData = await getAuthorBySlug('default');
  const author = (authorData || allAuthors.find(a => a.slug === 'default') || allAuthors[0]) as Authors;
  const mainContent = coreContent(author);

  return (
    <>
      <AuthorLayout content={mainContent}>
        {author.body?.code && <MDXLayoutRenderer code={author.body.code} />}
      </AuthorLayout>
    </>
  );
}
