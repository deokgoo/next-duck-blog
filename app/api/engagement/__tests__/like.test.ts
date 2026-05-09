/**
 * Unit Tests for Like API Route
 *
 * Tests error cases, validation, and success paths for POST /api/engagement/like
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Mocks ---

const mockValidateSlug = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockIncrementLikes = vi.fn()

vi.mock('@/lib/engagement', () => ({
  validateSlug: (...args: any[]) => mockValidateSlug(...args),
  checkRateLimit: (...args: any[]) => mockCheckRateLimit(...args),
  incrementLikes: (...args: any[]) => mockIncrementLikes(...args),
}))

// --- Helpers ---

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/engagement/like', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/engagement/like', () => {
  beforeEach(() => {
    mockValidateSlug.mockReset()
    mockCheckRateLimit.mockReset()
    mockIncrementLikes.mockReset()
  })

  it('returns 400 when slug is missing from request body', async () => {
    mockValidateSlug.mockReturnValue(false)

    const request = createPostRequest({})
    const { POST } = await import('../like/route')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid slug')
  })

  it('returns 400 when slug is empty string', async () => {
    mockValidateSlug.mockReturnValue(false)

    const request = createPostRequest({ slug: '' })
    const { POST } = await import('../like/route')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid slug')
  })

  it('returns 200 with success and likes count for valid slug', async () => {
    mockValidateSlug.mockReturnValue(true)
    mockCheckRateLimit.mockResolvedValue(true)
    mockIncrementLikes.mockResolvedValue(5)

    const request = createPostRequest({ slug: 'test-post' })
    const { POST } = await import('../like/route')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.likes).toBe(5)
  })

  it('returns 500 when incrementLikes throws a Firestore error', async () => {
    mockValidateSlug.mockReturnValue(true)
    mockCheckRateLimit.mockResolvedValue(true)
    mockIncrementLikes.mockRejectedValue(new Error('Firestore unavailable'))

    const request = createPostRequest({ slug: 'test-post' })
    const { POST } = await import('../like/route')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('returns 200 without likes count when rate limited (silent success)', async () => {
    mockValidateSlug.mockReturnValue(true)
    mockCheckRateLimit.mockResolvedValue(false)

    const request = createPostRequest({ slug: 'test-post' })
    const { POST } = await import('../like/route')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.likes).toBeUndefined()
    // incrementLikes should NOT be called when rate limited
    expect(mockIncrementLikes).not.toHaveBeenCalled()
  })
})
