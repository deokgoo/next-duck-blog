import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          rehypeAutolinkHeadings,
          rehypeKatex,
          [rehypePrismPlus, { ignoreMissing: true }],
        ],
        format: 'mdx',
      },
    });

    return NextResponse.json({ mdxSource });
  } catch (error) {
    console.error('MDX Serialization Error:', error);
    return NextResponse.json({ error: 'Failed to serialize MDX' }, { status: 500 });
  }
}
