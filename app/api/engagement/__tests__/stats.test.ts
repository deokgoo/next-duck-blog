/**
 * Unit Tests for Stats API Route
 *
 * Tests error cases, validation, and success paths for GET /api/engagement/stats
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Mocks ---

const mockGetEngagementStats = vi.fn()

vi.mock('@/lib/engagement', () => ({
  getEngagementStats: (...args: any[]) => mockGetEngagementStats(...args),
}))

// --- Helpers ---

function createGetRequest(queryString: string): NextRequest {
  return new NextRequest(`http://localhost/api/engagement/stats${queryString}`)
}

describe('GET /api/engagement/stats', () => {
  beforeEach(() => {
    mockGetEngagementStats.mockReset()
  })

  it('returns 400 when slugs query param is missing', async () => {
    const request = createGetRequest('')
    const { GET } = await import('../stats/route')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing slugs parameter')
  })

  it('returns 400 when slugs query param is empty', async () => {
    const request = createGetRequest('?slugs=')
    const { GET } = await import('../stats/route')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing slugs parameter')
  })

  it('returns 400 when more than 30 slugs are provided', async () => {
    const slugs = Array.from({ length: 31 }, (_, i) => `slug-${i}`).join(',')
    const request = createGetRequest(`?slugs=${slugs}`)
    const { GET } = await import('../stats/route')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Maximum 30 slugs allowed')
  })

  it('returns 200 with stats for valid slugs', async () => {
    const mockStats = {
      'post-1': { likes: 10 },
      'post-2': { likes: 3 },
    }
    mockGetEngagementStats.mockResolvedValue(mockStats)

    const request = createGetRequest('?slugs=post-1,post-2')
    const { GET } = await import('../stats/route')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.stats).toEqual(mockStats)
    expect(mockGetEngagementStats).toHaveBeenCalledWith(['post-1', 'post-2'])
  })

  it('returns 500 when getEngagementStats throws a Firestore error', async () => {
    mockGetEngagementStats.mockRejectedValue(new Error('Firestore unavailable'))

    const request = createGetRequest('?slugs=post-1')
    const { GET } = await import('../stats/route')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
