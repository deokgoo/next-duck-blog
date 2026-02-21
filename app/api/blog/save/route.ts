import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { content, metadata } = await request.json();

    // 슬러그 생성 (제목 기반)
    const slug =
      metadata.slug ||
      metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Firestore에 저장할 데이터 구성
    const postData = {
      slug,
      title: metadata.title,
      date: metadata.date,
      createdAt: metadata.createdAt,
      tags: metadata.tags || [],
      summary: metadata.summary || '',
      body: { code: '', raw: content },
      content: content,
      status: metadata.draft ? 'draft' : 'published',
      layout: metadata.layout || 'PostLayout',
      images: metadata.images || [],
      lastmod: new Date().toISOString(),
    };

    // Firestore에 문서 저장 (덮어쓰기)
    await db.collection('posts').doc(slug).set(postData);

    // 캐시 즉시 무효화 - 저장한 글과 목록 페이지를 바로 갱신
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/blog');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: '블로그 포스트가 성공적으로 저장되었습니다!',
      slug,
    });
  } catch (error) {
    console.error('Firestore 저장 중 오류:', error);
    return NextResponse.json(
      { success: false, message: '저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
