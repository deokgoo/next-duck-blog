/**
 * Unit Tests for Comments API Routes
 *
 * Tests the POST, GET, DELETE handlers in app/api/comments/route.ts
 * Validates: Requirements 1.2, 1.3, 7.1, 7.4, 8.2, 8.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks ──

vi.mock('server-only', () => ({}))

const mockValidateComment = vi.fn()
const mockValidateEmail = vi.fn()
const mockCheckCommentRateLimit = vi.fn()
const mockResolveParentId = vi.fn()
const mockCreateComment = vi.fn()
const mockGetCommentsBySlug = vi.fn()
const mockGetCommentById = vi.fn()
const mockDeleteComment = vi.fn()
const mockVerifyPassword = vi.fn()
const mockToCommentResponse = vi.fn()

vi.mock('@/lib/comments', () => ({
  validateComment: (...args: any[]) => mockValidateComment(...args),
  validateEmail: (...args: any[]) => mockValidateEmail(...args),
  checkCommentRateLimit: (...args: any[]) => mockCheckCommentRateLimit(...args),
  resolveParentId: (...args: any[]) => mockResolveParentId(...args),
  createComment: (...args: any[]) => mockCreateComment(...args),
  getCommentsBySlug: (...args: any[]) => mockGetCommentsBySlug(...args),
  getCommentById: (...args: any[]) => mockGetCommentById(...args),
  deleteComment: (...args: any[]) => mockDeleteComment(...args),
  verifyPassword: (...args: any[]) => mockVerifyPassword(...args),
  toCommentResponse: (...args: any[]) => mockToCommentResponse(...args),
}))

const mockVerifyAuth = vi.fn()

vi.mock('@/lib/auth/serverAuth', () => ({
  verifyAuth: (...args: any[]) => mockVerifyAuth(...args),
}))

// ── Helpers ──

function createPostRequest(body: Record<string, unknown>, headers?: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

function createGetRequest(slug?: string): NextRequest {
  const url = slug
    ? `http://localhost/api/comments?slug=${encodeURIComponent(slug)}`
    : 'http://localhost/api/comments'
  return new NextRequest(url, { method: 'GET' })
}

function createDeleteRequest(body: Record<string, unknown>, headers?: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost/api/comments', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

// ── Tests ──

describe('POST /api/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 without storing when honeypot field is filled (Requirement 7.4)', async () => {
    const { POST } = await import('../route')

    const request = createPostRequest({
      slug: 'test-post',
      nickname: 'Bot',
      password: 'pass1234',
      content: 'spam content',
      honeypot: 'bot-filled-this',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.comment).toBeNull()

    // Should NOT call any storage functions
    expect(mockValidateComment).not.toHaveBeenCalled()
    expect(mockCreateComment).not.toHaveBeenCalled()
    expect(mockCheckCommentRateLimit).not.toHaveBeenCalled()
  })

  it('returns 400 when nickname is empty (Requirement 1.2)', async () => {
    const { POST } = await import('../route')

    mockValidateComment.mockReturnValue({ valid: false, error: '닉네임을 입력해주세요' })

    const request = createPostRequest({
      slug: 'test-post',
      nickname: '',
      password: 'pass1234',
      content: 'Hello',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('닉네임을 입력해주세요')
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 400 when password is too short (Requirement 1.3)', async () => {
    const { POST } = await import('../route')

    mockValidateComment.mockReturnValue({ valid: false, error: '비밀번호는 4자 이상이어야 합니다' })

    const request = createPostRequest({
      slug: 'test-post',
      nickname: 'User',
      password: '123',
      content: 'Hello',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('비밀번호는 4자 이상이어야 합니다')
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 400 when content is empty (Requirement 1.2)', async () => {
    const { POST } = await import('../route')

    mockValidateComment.mockReturnValue({ valid: false, error: '댓글 내용을 입력해주세요' })

    const request = createPostRequest({
      slug: 'test-post',
      nickname: 'User',
      password: 'pass1234',
      content: '',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('댓글 내용을 입력해주세요')
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 400 when email format is invalid (Requirement 1.2)', async () => {
    const { POST } = await import('../route')

    mockValidateComment.mockReturnValue({ valid: true })
    mockValidateEmail.mockReturnValue(false)

    const request = createPostRequest({
      slug: 'test-post',
      nickname: 'User',
      password: 'pass1234',
      content: 'Hello',
      email: 'invalid-email',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('올바른 이메일 형식을 입력해주세요')
    expect(mockCreateComment).not.toHaveBeenCalled()
  })

  it('returns 429 when rate limit is exceeded (Requirement 7.1)', async () => {
    const { POST } = await import('../route')

    mockValidateComment.mockReturnValue({ valid: true })
    mockCheckCommentRateLimit.mockResolvedValue({ allowed: false })

    const request = createPostRequest(
      {
        slug: 'test-post',
        nickname: 'User',
        password: 'pass1234',
        content: 'Hello',
      },
      { 'x-forwarded-for': '192.168.1.1' }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('너무 많은 요청입니다. 잠시 후 다시 시도해주세요')
    expect(mockCreateComment).not.toHaveBeenCalled()
  })
})

describe('GET /api/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when slug is missing', async () => {
    const { GET } = await import('../route')

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('slug is required')
  })

  it('returns comments for a valid slug', async () => {
    const { GET } = await import('../route')

    const mockComments = [
      { id: '1', postSlug: 'test-post', parentId: null, nickname: 'User1', content: 'Hello', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    ]
    mockGetCommentsBySlug.mockResolvedValue(mockComments)

    const request = createGetRequest('test-post')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.comments).toEqual(mockComments)
    expect(mockGetCommentsBySlug).toHaveBeenCalledWith('test-post')
  })
})

describe('DELETE /api/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when admin token is invalid (Requirement 8.2, 8.3)', async () => {
    const { DELETE } = await import('../route')

    mockVerifyAuth.mockResolvedValue(null)

    const request = createDeleteRequest(
      { commentId: 'comment-123' },
      { Authorization: 'Bearer invalid-token' }
    )

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })

  it('returns 403 when visitor password is wrong (Requirement 8.2)', async () => {
    const { DELETE } = await import('../route')

    const mockComment = {
      id: 'comment-123',
      postSlug: 'test-post',
      parentId: null,
      nickname: 'User',
      email: null,
      passwordHash: 'salt:hash',
      content: 'Hello',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    mockGetCommentById.mockResolvedValue(mockComment)
    mockVerifyPassword.mockResolvedValue(false)

    const request = createDeleteRequest({
      commentId: 'comment-123',
      password: 'wrong-password',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('비밀번호가 일치하지 않습니다')
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })

  it('returns 400 when commentId is missing', async () => {
    const { DELETE } = await import('../route')

    const request = createDeleteRequest({ password: 'pass1234' })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('commentId is required')
  })

  it('returns 404 when comment does not exist (visitor path)', async () => {
    const { DELETE } = await import('../route')

    mockGetCommentById.mockResolvedValue(null)

    const request = createDeleteRequest({
      commentId: 'nonexistent-id',
      password: 'pass1234',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Comment not found')
  })

  it('returns 400 when visitor does not provide password', async () => {
    const { DELETE } = await import('../route')

    const request = createDeleteRequest({ commentId: 'comment-123' })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('password is required')
  })

  it('successfully deletes comment with correct password', async () => {
    const { DELETE } = await import('../route')

    const mockComment = {
      id: 'comment-123',
      postSlug: 'test-post',
      parentId: null,
      nickname: 'User',
      email: null,
      passwordHash: 'salt:hash',
      content: 'Hello',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    mockGetCommentById.mockResolvedValue(mockComment)
    mockVerifyPassword.mockResolvedValue(true)
    mockDeleteComment.mockResolvedValue(undefined)

    const request = createDeleteRequest({
      commentId: 'comment-123',
      password: 'correct-password',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockDeleteComment).toHaveBeenCalledWith('comment-123')
  })
})
