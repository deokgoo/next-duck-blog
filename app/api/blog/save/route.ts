import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
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
      tags: metadata.tags || [],
      summary: metadata.summary || '',
      body: { code: '', raw: content }, // MDXRemote 호환성 고려 (raw content 저장)
      content: content, // 최상위 content 필드 (검색 및 마이그레이션 스크립트 호환용)
      draft: metadata.draft ?? false,
      layout: metadata.layout || 'PostLayout',
      images: metadata.images || [],
      lastmod: new Date().toISOString(),
    };

    // Firestore에 문서 저장 (덮어쓰기)
    await db.collection('posts').doc(slug).set(postData);

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
