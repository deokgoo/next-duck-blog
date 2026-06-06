import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';
import { revalidateOnPostDelete } from '@/lib/revalidation';

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { slug } = await request.json();
 
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // 슬러그 정제: /가 포함되어 있다면 마지막 부분만 사용 (Firestore doc ID 규칙 준수)
    if (slug.includes('/')) {
      slug = slug.split('/').pop() || slug;
    }

    const docRef = db.collection('posts').doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Extract category and tags from the post document before deletion
    const postData = doc.data();
    const category = postData?.category || '';
    const tags: string[] = postData?.tags || [];

    // 논리 삭제 (status를 'deleted'로 변경)
    await docRef.update({ status: 'deleted' });

    // 캐시 즉시 무효화 (centralized revalidation handler)
    revalidateOnPostDelete({ slug, category, tags });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
