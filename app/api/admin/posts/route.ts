import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/firestore';
import { verifyAuth } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        if (!(await verifyAuth(request))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const posts = await getAllPosts();
        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        return NextResponse.json({ error: 'Failed to fetch admin posts' }, { status: 500 });
    }
}
