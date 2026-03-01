import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '(not set)',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '✅ set' : '❌ not set',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
        ? `✅ set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)`
        : '❌ not set',
      FIREBASE_DATABASE_ID: process.env.FIREBASE_DATABASE_ID || '(not set, using default)',
    },
  };

  try {
    const snapshot = await db.collection('posts').limit(3).get();
    results.firestore = {
      status: '✅ connected',
      postCount: snapshot.size,
      slugs: snapshot.docs.map((doc) => doc.data().slug),
    };

    // 특정 slug 직접 조회
    const targetSlug = 'change-blog-to-next-16';
    const targetSnapshot = await db
      .collection('posts')
      .where('slug', '==', targetSlug)
      .limit(1)
      .get();
    results.targetPost = targetSnapshot.empty
      ? { status: '❌ not found', slug: targetSlug }
      : {
          status: '✅ found',
          slug: targetSlug,
          data: {
            title: targetSnapshot.docs[0].data().title,
            status: targetSnapshot.docs[0].data().status,
            date: targetSnapshot.docs[0].data().date,
          },
        };

    // 전체 post 수
    const allSnapshot = await db.collection('posts').get();
    results.totalPosts = allSnapshot.size;
    results.allSlugs = allSnapshot.docs.map((doc) => doc.data().slug);
  } catch (error: any) {
    results.firestore = {
      status: '❌ error',
      code: error.code,
      message: error.message,
    };
  }

  return NextResponse.json(results, { status: 200 });
}
