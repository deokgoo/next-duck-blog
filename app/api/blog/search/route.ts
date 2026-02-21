import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, isPostPublishedAndReady } from '@/lib/firestore';
import { slug as slugify } from 'github-slugger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword')?.trim().toLowerCase() || '';
    const tagsParam = searchParams.get('tags') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const selectedTags = tagsParam
      ? tagsParam.split(',').map((t) => slugify(t.trim())).filter(Boolean)
      : [];

    const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);

    const filtered = allPosts.filter((post) => {
      // 키워드 필터 (제목 + 요약)
      if (keyword) {
        const inTitle = post.title?.toLowerCase().includes(keyword);
        const inSummary = post.summary?.toLowerCase().includes(keyword);
        if (!inTitle && !inSummary) return false;
      }

      // 태그 필터 (선택된 태그를 모두 포함하는 글)
      if (selectedTags.length > 0) {
        const postTagSlugs = (post.tags || []).map((t) => slugify(t));
        const hasAllTags = selectedTags.every((tag) => postTagSlugs.includes(tag));
        if (!hasAllTags) return false;
      }

      // 날짜 범위 필터
      if (dateFrom && post.date < dateFrom) return false;
      if (dateTo && post.date > dateTo) return false;

      return true;
    });

    // 결과에서 불필요한 무거운 필드(content) 제외
    const results = filtered.map(({ content: _, ...post }) => post);

    return NextResponse.json({ posts: results, total: results.length });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// 태그 목록 조회
export async function POST() {
  try {
    const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);

    // slug 기준으로 그룹핑 (Next.js, nextjs 등 slug가 같은 태그를 하나로 합침)
    const tagMap: Record<string, { tag: string; slug: string; count: number }> = {};

    allPosts.forEach((post) => {
      (post.tags || []).forEach((tag) => {
        const rawTag = tag.trim();
        const tagSlug = slugify(rawTag);
        if (!tagMap[tagSlug]) {
          tagMap[tagSlug] = { tag: rawTag, slug: tagSlug, count: 0 };
        }
        tagMap[tagSlug].count += 1;
      });
    });

    const tags = Object.values(tagMap).sort((a, b) => b.count - a.count);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
