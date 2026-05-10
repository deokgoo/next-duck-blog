import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set environment variables before any module imports
process.env.RESEND_API_KEY = 'test-key'
process.env.ADMIN_EMAIL = 'admin@test.com'

vi.mock('server-only', () => ({}))

// ── Resend Mock ──

const { mockSend } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue({ id: 'mock-email-id' })
  return { mockSend }
})

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend }
  },
}))

describe('sendAdminNotification', () => {
  beforeEach(() => {
    mockSend.mockClear()
    mockSend.mockResolvedValue({ id: 'mock-email-id' })
  })

  it('constructs correct email payload with subject, to, from, and html containing required info', async () => {
    const { sendAdminNotification } = await import('../email')

    await sendAdminNotification({
      postSlug: 'my-test-post',
      postTitle: 'My Test Post Title',
      nickname: 'TestUser',
      content: 'This is a test comment content',
    })

    expect(mockSend).toHaveBeenCalledTimes(1)

    const callArgs = mockSend.mock.calls[0][0]

    // Verify to field is the admin email
    expect(callArgs.to).toBe('admin@test.com')

    // Verify from field is set
    expect(callArgs.from).toBeDefined()
    expect(callArgs.from).toBeTruthy()

    // Verify subject contains post title
    expect(callArgs.subject).toContain('My Test Post Title')

    // Verify html body contains required info
    expect(callArgs.html).toContain('My Test Post Title')
    expect(callArgs.html).toContain('TestUser')
    expect(callArgs.html).toContain('This is a test comment content')
  })

  it('truncates content to 100 characters in email body', async () => {
    const { sendAdminNotification } = await import('../email')

    const longContent = 'A'.repeat(150)

    await sendAdminNotification({
      postSlug: 'test-post',
      postTitle: 'Test Post',
      nickname: 'User',
      content: longContent,
    })

    expect(mockSend).toHaveBeenCalledTimes(1)

    const callArgs = mockSend.mock.calls[0][0]
    // Should contain the first 100 chars
    expect(callArgs.html).toContain('A'.repeat(100))
  })
})

describe('sendReplyNotification', () => {
  beforeEach(() => {
    mockSend.mockClear()
    mockSend.mockResolvedValue({ id: 'mock-email-id' })
  })

  it('skips sending when toEmail is empty string', async () => {
    const { sendReplyNotification } = await import('../email')

    await sendReplyNotification({
      toEmail: '',
      postSlug: 'test-post',
      postTitle: 'Test Post',
      parentNickname: 'ParentUser',
      replyNickname: 'ReplyUser',
      replyContent: 'This is a reply',
      originalContent: 'Original comment',
    })

    expect(mockSend).not.toHaveBeenCalled()
  })

  it('sends email when toEmail is provided', async () => {
    const { sendReplyNotification } = await import('../email')

    await sendReplyNotification({
      toEmail: 'user@example.com',
      postSlug: 'test-post',
      postTitle: 'Test Post',
      parentNickname: 'ParentUser',
      replyNickname: 'ReplyUser',
      replyContent: 'This is a reply',
      originalContent: 'Original comment',
    })

    expect(mockSend).toHaveBeenCalledTimes(1)

    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.to).toBe('user@example.com')
    expect(callArgs.html).toContain('Test Post')
    expect(callArgs.html).toContain('ReplyUser')
    expect(callArgs.html).toContain('This is a reply')
  })
})

describe('error handling', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('sendAdminNotification does not throw when Resend API fails', async () => {
    const { sendAdminNotification } = await import('../email')

    mockSend.mockRejectedValue(new Error('Resend API error'))

    // Should not throw
    await expect(
      sendAdminNotification({
        postSlug: 'test-post',
        postTitle: 'Test Post',
        nickname: 'User',
        content: 'Some content',
      })
    ).resolves.toBeUndefined()
  })

  it('sendReplyNotification does not throw when Resend API fails', async () => {
    const { sendReplyNotification } = await import('../email')

    mockSend.mockRejectedValue(new Error('Resend API error'))

    // Should not throw
    await expect(
      sendReplyNotification({
        toEmail: 'user@example.com',
        postSlug: 'test-post',
        postTitle: 'Test Post',
        parentNickname: 'ParentUser',
        replyNickname: 'ReplyUser',
        replyContent: 'Reply content',
        originalContent: 'Original content',
      })
    ).resolves.toBeUndefined()
  })
})
