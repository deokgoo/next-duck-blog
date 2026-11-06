import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import { checkSearchRateLimit } from '@/lib/engagement';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim().toLowerCase() || '';

    // Rate limit: 동일 IP당 60초 내 최대 30회
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp ?? 'unknown';

    const { allowed } = await checkSearchRateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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
