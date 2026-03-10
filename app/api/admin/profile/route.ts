import { NextRequest, NextResponse } from 'next/server';
import { getAuthorBySlug, getAllTags } from '@/lib/firestore';
import { verifyAuth } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        if (!(await verifyAuth(request))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In next-duck-blog, there's theoretically only 'default' author for a single author blog
        const [authorData, tagRecord] = await Promise.all([
            getAuthorBySlug('default'),
            getAllTags()
        ]);

        // Sort keys alphabetically 
        const allTags = Object.keys(tagRecord).sort();

        return NextResponse.json({ authorData, allTags });
    } catch (error) {
        console.error('Error fetching admin profile data:', error);
        return NextResponse.json({ error: 'Failed to fetch admin profile data' }, { status: 500 });
    }
}
