import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check if document exists first
    const docRef = db.collection('posts').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete the document (logical via status update)
    await docRef.update({ status: 'deleted' });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
