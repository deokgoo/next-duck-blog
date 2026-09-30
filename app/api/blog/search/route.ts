import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim().toLowerCase() || '';

    const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);

    const filtered = allPosts.filter((post) => {
      if (!q) return true;
      const inTitle = post.title?.toLowerCase().includes(q);
      const inSummary = post.summary?.toLowerCase().includes(q);
      const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));
      return inTitle || inSummary || inTags;
    });

    // 결과에서 불필요한 무거운 필드(content) 제외
    const results = filtered.map(({ content: _, ...post }) => post);

    return NextResponse.json({ posts: results, total: results.length });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
