import { NextRequest, NextResponse } from 'next/server'
import { validateSlug, setBaseLikes } from '@/lib/engagement'
import { verifyAuth } from '@/lib/auth/serverAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/engagement/admin/base-likes
 * 어드민 전용: 포스트의 baseLikes(기본 좋아요 수)를 설정한다.
 * Firebase Auth 토큰으로 인증.
 *
 * Body: { slug: string, baseLikes: number }
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slug, baseLikes } = body

    // Validate slug
    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // Validate baseLikes
    if (typeof baseLikes !== 'number' || baseLikes < 0 || !Number.isInteger(baseLikes)) {
      return NextResponse.json({ error: 'baseLikes must be a non-negative integer' }, { status: 400 })
    }

    await setBaseLikes(slug, baseLikes)

    return NextResponse.json({ success: true, slug, baseLikes })
  } catch (error) {
    console.error('[Admin Base Likes API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
