import { NextRequest, NextResponse } from 'next/server'
import { validateSlug, checkRateLimit, incrementLikes } from '@/lib/engagement'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug } = body

    // Validate slug
    if (!validateSlug(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // Extract IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp ?? 'unknown'

    // Check rate limit
    const allowed = await checkRateLimit(ip, slug, 'like')

    if (!allowed) {
      // Rate limited: return success without performing a write
      return NextResponse.json({ success: true })
    }

    // Increment likes and return updated count
    const likes = await incrementLikes(slug)

    return NextResponse.json({ success: true, likes })
  } catch (error) {
    console.error('[Like API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
