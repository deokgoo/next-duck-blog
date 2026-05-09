import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/serverAuth'
import { db } from '@/lib/firebaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/engagement/admin/stats
 * 어드민 전용: 모든 포스트의 engagement 통계를 상세하게 반환한다.
 * baseLikes와 likes를 분리하여 반환.
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const snapshot = await db.collection('post-engagement').get()

    const stats: Record<string, { likes: number; baseLikes: number; total: number }> = {}

    snapshot.forEach((doc) => {
      const data = doc.data()
      const likes = data?.likes ?? 0
      const baseLikes = data?.baseLikes ?? 0
      stats[doc.id] = {
        likes,
        baseLikes,
        total: likes + baseLikes,
      }
    })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[Admin Engagement Stats API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
