import 'css/prism.css';
import 'katex/dist/katex.css';

import { components } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote/rsc';
import AuthorLayout from '@/layouts/AuthorLayout';
import { genPageMetadata } from 'app/seo';
import { Authors, allAuthors } from '@/lib/types';
import siteMetadata from '@/data/siteMetadata';
import { readFile } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSmartypants from 'remark-smartypants';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';

export const revalidate = false;

export const metadata = genPageMetadata({ title: 'About' });

export default async function Page() {
  // Read local MDX file
  let author: Authors;
  let content = '';

  try {
    const filePath = path.join(process.cwd(), 'data/authors/default.mdx');
    const raw = await readFile(filePath, 'utf-8');
    const { data, content: mdxContent } = matter(raw);
    content = mdxContent;
    author = {
      slug: 'default',
      name: data.name || siteMetadata.author,
      avatar: data.avatar || siteMetadata.image,
      occupation: data.occupation,
      company: data.company,
      email: data.email,
      twitter: data.twitter,
      linkedin: data.linkedin,
      github: data.github,
      visibleSocials: data.visibleSocials,
      layout: 'AuthorLayout',
      body: { code: '' },
    };
  } catch {
    // Fallback to Firestore / static
    const fallback = allAuthors.find((a) => a.slug === 'default') || allAuthors[0];
    author = fallback;
    content = '';
  }

  return (
    <>
      <AuthorLayout content={author as any}>
        {content && (
          <MDXRemote
            source={content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath, remarkSmartypants],
                rehypePlugins: [
                  rehypeSlug,
                  rehypeAutolinkHeadings,
                  rehypeKatex,
                  [rehypePrismPlus, { ignoreMissing: true }],
                ],
              },
            }}
          />
        )}
      </AuthorLayout>
    </>
  );
}
