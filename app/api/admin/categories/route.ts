import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/firestore';
import { verifyAuth } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const isVerified = await verifyAuth(request);
    
    if (!isVerified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all posts and extract unique categories
    const posts = await getAllPosts();
    const uniqueCategories = Array.from(new Set(posts.map(p => p.category || 'dev')));
    
    // Default categories should always be present just in case
    const defaultCategories = ['dev', 'travel', 'hobby', 'life'];
    const mergedCategories = Array.from(new Set([...defaultCategories, ...uniqueCategories]));

    return NextResponse.json({ categories: mergedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
