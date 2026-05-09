import { NextRequest, NextResponse } from 'next/server'
import { getEngagementStats } from '@/lib/engagement'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slugsParam = searchParams.get('slugs')

    // Validate slugs parameter exists
    if (!slugsParam || slugsParam.trim() === '') {
      return NextResponse.json({ error: 'Missing slugs parameter' }, { status: 400 })
    }

    // Split by comma and filter empty entries
    const slugs = slugsParam.split(',').filter(Boolean)

    // Validate max 30 slugs
    if (slugs.length > 30) {
      return NextResponse.json({ error: 'Maximum 30 slugs allowed' }, { status: 400 })
    }

    // Fetch engagement stats
    const stats = await getEngagementStats(slugs)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[Stats API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
