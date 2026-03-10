import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/firestore';
import { verifyAuth } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        if (!(await verifyAuth(request))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const post = await getPostBySlug(slug);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error('Error fetching admin post:', error);
        return NextResponse.json({ error: 'Failed to fetch admin post' }, { status: 500 });
    }
}
