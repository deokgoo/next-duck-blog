import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, status } = await request.json();

    if (!slug || !status) {
      return NextResponse.json({ error: 'Slug and status are required' }, { status: 400 });
    }

    const docRef = db.collection('posts').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await docRef.update({ status });

    // 캐시 즉시 무효화 (publish/unpublish 모두 즉시 반영)
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/blog');
    revalidatePath('/');

    return NextResponse.json({ message: 'Post status updated successfully' });
  } catch (error) {
    console.error('Error updating post status:', error);
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
}
