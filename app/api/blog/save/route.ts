import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';
import { revalidateOnPostCreate, revalidateOnPostUpdate } from '@/lib/revalidation';
import { submitUrlToIndexNow } from '@/lib/indexnow';
import siteMetadata from '@/data/siteMetadata';

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, metadata } = body;
    let { previousSlug } = body;

    // 슬러그 생성 및 정제 (Firestore Document ID 단계에서는 / 가 포함되면 안 됨)
    let slug =
      metadata.slug ||
      metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // 슬러그 및 이전 슬러그 정제: /가 포함되어 있다면 마지막 부분만 사용 (Firestore doc ID 규칙 준수)
    if (slug.includes('/')) {
      slug = slug.split('/').pop() || slug;
    }

    if (previousSlug && previousSlug.includes('/')) {
      previousSlug = previousSlug.split('/').pop() || previousSlug;
    }

    // Firestore에 저장할 데이터 구성
    const category = metadata.category || 'dev';
    const postData: Record<string, any> = {
      slug,
      title: metadata.title,
      category,
      date: metadata.date,
      tags: metadata.tags || [],
      summary: metadata.summary || '',
      body: { code: '', raw: content },
      content: content,
      status: metadata.draft ? 'draft' : 'published',
      layout: metadata.layout || 'PostLayout',
      images: metadata.images || [],
      lastmod: new Date().toISOString(),
    };

    // undefined 필드는 제외 (Firestore는 undefined 허용 안 함)
    if (metadata.createdAt !== undefined) {
      postData.createdAt = metadata.createdAt;
    }

    // Firestore에 문서 저장
    if (previousSlug && previousSlug !== slug) {
      // slug가 변경된 경우: 이전 문서 삭제 + 새 문서 생성을 원자적으로 수행
      await db.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
        transaction.delete(db.collection('posts').doc(previousSlug));
        transaction.set(db.collection('posts').doc(slug), postData);
      });
    } else {
      // 기존 동작: 덮어쓰기
      await db.collection('posts').doc(slug).set(postData);
    }

    // 캐시 무효화 — centralized revalidation handler
    if (previousSlug) {
      // previousSlug가 제공되면 update로 판단
      revalidateOnPostUpdate({
        slug,
        category,
        tags: metadata.tags || [],
        previousSlug,
        previousCategory: metadata.previousCategory || category,
      });
    } else {
      // previousSlug가 없으면 새 포스트 create
      revalidateOnPostCreate({
        slug,
        category,
        tags: metadata.tags || [],
      });
    }

    // IndexNow 알림: published 글만 fire-and-forget으로 전송
    try {
      if (postData.status === 'published') {
        const urls = [`${siteMetadata.siteUrl}/blog/${category}/${slug}`];
        if (previousSlug && previousSlug !== slug) {
          urls.push(`${siteMetadata.siteUrl}/blog/${category}/${previousSlug}`);
        }
        submitUrlToIndexNow(urls).catch(() => {});
      }
    } catch (indexNowError) {
      console.error('IndexNow submission failed:', indexNowError);
    }

    return NextResponse.json({
      success: true,
      message: '블로그 포스트가 성공적으로 저장되었습니다!',
      slug,
    });
  } catch (error: any) {
    console.error('Firestore 저장 중 오류:', error);
    // 더 구체적인 오류 정보 출력 (디버깅용)
    return NextResponse.json(
      { 
        success: false, 
        message: '저장 중 오류가 발생했습니다.', 
        error: error?.message,
        pathError: error?.message?.includes('components') 
      },
      { status: 500 }
    );
  }
}
