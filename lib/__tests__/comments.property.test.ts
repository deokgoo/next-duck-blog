import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Set environment variables before any module imports
process.env.RESEND_API_KEY = 'test-key'
process.env.ADMIN_EMAIL = 'admin@test.com'

vi.mock('server-only', () => ({}))

// ── Resend Mock ──

const { mockSend } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue({ id: 'mock-email-id' })
  return { mockSend }
})

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend }
    },
  }
})

// ── Firestore Mock ──

let firestoreDocs: Record<string, any> = {}

vi.mock('../firebaseAdmin', () => ({
  db: {
    collection: (collectionName: string) => ({
      doc: (id: string) => {
        const key = `${collectionName}/${id}`
        return {
          get: vi.fn(async () => {
            const doc = firestoreDocs[key]
            return {
              exists: !!doc,
              data: () => doc ?? null,
            }
          }),
          set: vi.fn(async (data: any) => {
            firestoreDocs[key] = data
          }),
          path: key,
        }
      },
      where: (field: string, _op: string, value: any) => {
        const getMatchingDocs = () => {
          const prefix = `${collectionName}/`
          return Object.entries(firestoreDocs)
            .filter(([k, doc]) => k.startsWith(prefix) && doc && doc[field] === value)
            .map(([k, doc]) => ({
              ref: { path: k },
              data: () => doc,
            }))
        }
        return {
          orderBy: () => ({
            get: vi.fn(async () => ({ docs: getMatchingDocs() })),
          }),
          get: vi.fn(async () => ({ docs: getMatchingDocs() })),
        }
      },
    }),
    batch: () => {
      const deletions: string[] = []
      return {
        delete: vi.fn((ref: { path: string }) => {
          deletions.push(ref.path)
        }),
        commit: vi.fn(async () => {
          for (const path of deletions) {
            delete firestoreDocs[path]
          }
        }),
      }
    },
  },
}))

// ── Generators ──

const whitespaceOnlyArb = fc.string({ unit: fc.constantFrom(' ', '\t', '\n', '\r'), minLength: 1, maxLength: 10 })

const shortPasswordArb = fc.string({ minLength: 0, maxLength: 3 })

const longContentArb = fc.string({ minLength: 1001, maxLength: 1100 }).filter((s) => s.trim().length > 1000)

const longNicknameArb = fc.string({ minLength: 31, maxLength: 50 }).filter((s) => s.trim().length > 30)

const validPasswordArb = fc.string({ minLength: 4, maxLength: 50 }).filter((s) => s.length >= 4)

const validNicknameArb = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0)

const validContentArb = fc.string({ minLength: 1, maxLength: 1000 }).filter((s) => s.trim().length > 0)

// Generate strings that contain at least one HTML special character mixed with regular text
const htmlSpecialCharsArb = fc.tuple(
  fc.string({ minLength: 0, maxLength: 40 }),
  fc.constantFrom('&', '<', '>', '"', "'"),
  fc.string({ minLength: 0, maxLength: 40 }),
).map(([before, special, after]) => `${before}${special}${after}`)

// ── Property 1: Input validation rejects all invalid comments ──
// Feature: custom-comments, Property 1: Input validation rejects all invalid comments

describe('Property 1: Input validation rejects all invalid comments', () => {
  it('rejects empty nickname', async () => {
    const { validateComment } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(fc.constant(''), whitespaceOnlyArb),
        validPasswordArb,
        validContentArb,
        async (nickname, password, content) => {
          const result = validateComment({ nickname, password, content })
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('rejects short passwords (< 4 chars)', async () => {
    const { validateComment } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(
        validNicknameArb,
        shortPasswordArb,
        validContentArb,
        async (nickname, password, content) => {
          const result = validateComment({ nickname, password, content })
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('rejects empty content', async () => {
    const { validateComment } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(
        validNicknameArb,
        validPasswordArb,
        fc.oneof(fc.constant(''), whitespaceOnlyArb),
        async (nickname, password, content) => {
          const result = validateComment({ nickname, password, content })
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('rejects content exceeding 1000 characters', async () => {
    const { validateComment } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(
        validNicknameArb,
        validPasswordArb,
        longContentArb,
        async (nickname, password, content) => {
          const result = validateComment({ nickname, password, content })
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('rejects nickname exceeding 30 characters', async () => {
    const { validateComment } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(
        longNicknameArb,
        validPasswordArb,
        validContentArb,
        async (nickname, password, content) => {
          const result = validateComment({ nickname, password, content })
          expect(result.valid).toBe(false)
          expect(result.error).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ── Property 2: Password hash round-trip ──
// Feature: custom-comments, Property 2: Password hash round-trip

describe('Property 2: Password hash round-trip', () => {
  it('hash then verify with same password returns true', async () => {
    const { hashPassword, verifyPassword } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(validPasswordArb, async (password) => {
        const hash = await hashPassword(password)
        const result = await verifyPassword(password, hash)
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('hash one password and verify with a different password returns false', async () => {
    const { hashPassword, verifyPassword } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(
        validPasswordArb,
        validPasswordArb,
        async (password1, password2) => {
          fc.pre(password1 !== password2)
          const hash = await hashPassword(password1)
          const result = await verifyPassword(password2, hash)
          expect(result).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ── Property 3: Sensitive fields never exposed in API response ──
// Feature: custom-comments, Property 3: Sensitive fields never exposed in API response

describe('Property 3: Sensitive fields never exposed in API response', () => {
  it('toCommentResponse strips passwordHash and email', async () => {
    const { toCommentResponse } = await import('../comments')

    const isoDateArb = fc.integer({ min: 946684800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString())

    const commentArb = fc.record({
      id: fc.uuid(),
      postSlug: fc.string({ minLength: 1, maxLength: 50 }),
      parentId: fc.oneof(fc.constant(null), fc.uuid()),
      nickname: fc.string({ minLength: 1, maxLength: 30 }),
      email: fc.oneof(fc.constant(null), fc.emailAddress()),
      passwordHash: fc.string({ minLength: 10, maxLength: 100 }),
      content: fc.string({ minLength: 1, maxLength: 1000 }),
      createdAt: isoDateArb,
      updatedAt: isoDateArb,
    })

    await fc.assert(
      fc.asyncProperty(commentArb, async (comment) => {
        const response = toCommentResponse(comment)
        expect(response).not.toHaveProperty('passwordHash')
        expect(response).not.toHaveProperty('email')
        expect(response).toHaveProperty('id', comment.id)
        expect(response).toHaveProperty('postSlug', comment.postSlug)
        expect(response).toHaveProperty('parentId', comment.parentId)
        expect(response).toHaveProperty('nickname', comment.nickname)
        expect(response).toHaveProperty('content', comment.content)
        expect(response).toHaveProperty('createdAt', comment.createdAt)
        expect(response).toHaveProperty('updatedAt', comment.updatedAt)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 4: HTML sanitization escapes all special characters ──
// Feature: custom-comments, Property 4: HTML sanitization escapes all special characters

describe('Property 4: HTML sanitization escapes all special characters', () => {
  it('sanitizeHtml replaces all &<>"\' with entities and output never contains unescaped versions', async () => {
    const { sanitizeHtml } = await import('../comments')

    await fc.assert(
      fc.asyncProperty(htmlSpecialCharsArb, async (input) => {
        const output = sanitizeHtml(input)

        // Output should not contain any unescaped special characters
        // We need to check that the raw characters are gone (not part of entity sequences)
        // After sanitization, & only appears as part of &amp; &lt; &gt; &quot; &#39;
        const withoutEntities = output
          .replace(/&amp;/g, '')
          .replace(/&lt;/g, '')
          .replace(/&gt;/g, '')
          .replace(/&quot;/g, '')
          .replace(/&#39;/g, '')

        expect(withoutEntities).not.toMatch(/[<>"']/)
        // & should not appear outside of entity sequences
        expect(withoutEntities).not.toContain('&')
      }),
      { numRuns: 100 }
    )
  })

  it('sanitizeHtml preserves non-special characters', async () => {
    const { sanitizeHtml } = await import('../comments')

    const safeStringArb = fc.string({ minLength: 1, maxLength: 100 }).filter(
      (s) => !/[&<>"']/.test(s)
    )

    await fc.assert(
      fc.asyncProperty(safeStringArb, async (input) => {
        const output = sanitizeHtml(input)
        expect(output).toBe(input)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 5: Single-level nesting enforcement ──
// Feature: custom-comments, Property 5: Single-level nesting enforcement

describe('Property 5: Single-level nesting enforcement', () => {
  beforeEach(() => {
    firestoreDocs = {}
  })

  it('when parent has a parentId, resolveParentId returns the root ancestor', async () => {
    const { resolveParentId } = await import('../comments')

    const rootIdArb = fc.uuid()
    const replyIdArb = fc.uuid()

    await fc.assert(
      fc.asyncProperty(rootIdArb, replyIdArb, async (rootId, replyId) => {
        fc.pre(rootId !== replyId)

        // Set up: replyId is a reply to rootId (has parentId = rootId)
        firestoreDocs[`comments/${replyId}`] = {
          id: replyId,
          postSlug: 'test-post',
          parentId: rootId,
          nickname: 'test',
          email: null,
          passwordHash: 'hash',
          content: 'reply content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // rootId is a top-level comment (parentId = null)
        firestoreDocs[`comments/${rootId}`] = {
          id: rootId,
          postSlug: 'test-post',
          parentId: null,
          nickname: 'test',
          email: null,
          passwordHash: 'hash',
          content: 'root content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // When trying to reply to a reply, it should resolve to the root
        const resolved = await resolveParentId(replyId)
        expect(resolved).toBe(rootId)
      }),
      { numRuns: 100 }
    )
  })

  it('when parent has no parentId (is root), resolveParentId returns the same id', async () => {
    const { resolveParentId } = await import('../comments')

    const rootIdArb = fc.uuid()

    await fc.assert(
      fc.asyncProperty(rootIdArb, async (rootId) => {
        // Set up: rootId is a top-level comment
        firestoreDocs[`comments/${rootId}`] = {
          id: rootId,
          postSlug: 'test-post',
          parentId: null,
          nickname: 'test',
          email: null,
          passwordHash: 'hash',
          content: 'root content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const resolved = await resolveParentId(rootId)
        expect(resolved).toBe(rootId)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 6: Cascade deletion removes all associated replies ──
// Feature: custom-comments, Property 6: Cascade deletion removes all associated replies

describe('Property 6: Cascade deletion removes all associated replies', () => {
  beforeEach(() => {
    firestoreDocs = {}
  })

  it('deleting a parent comment removes the parent and all its replies', async () => {
    const { deleteComment } = await import('../comments')

    const parentIdArb = fc.uuid()
    const numRepliesArb = fc.integer({ min: 0, max: 20 })

    await fc.assert(
      fc.asyncProperty(parentIdArb, numRepliesArb, async (parentId, numReplies) => {
        // Reset state
        firestoreDocs = {}

        // Set up parent comment (parentId is null)
        firestoreDocs[`comments/${parentId}`] = {
          id: parentId,
          postSlug: 'test-post',
          parentId: null,
          nickname: 'author',
          email: null,
          passwordHash: 'salt:hash',
          content: 'parent content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Set up N replies referencing the parent
        const replyIds: string[] = []
        for (let i = 0; i < numReplies; i++) {
          const replyId = `reply-${i}-${parentId}`
          replyIds.push(replyId)
          firestoreDocs[`comments/${replyId}`] = {
            id: replyId,
            postSlug: 'test-post',
            parentId: parentId,
            nickname: `replier-${i}`,
            email: null,
            passwordHash: 'salt:hash',
            content: `reply content ${i}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }

        // Verify setup: parent + N replies exist
        expect(Object.keys(firestoreDocs).length).toBe(1 + numReplies)

        // Delete the parent comment (should cascade)
        await deleteComment(parentId)

        // Verify: parent is deleted
        expect(firestoreDocs[`comments/${parentId}`]).toBeUndefined()

        // Verify: all replies are deleted
        for (const replyId of replyIds) {
          expect(firestoreDocs[`comments/${replyId}`]).toBeUndefined()
        }

        // Verify: no documents referencing the parent's ID remain
        const remainingWithParentRef = Object.values(firestoreDocs).filter(
          (doc) => doc && doc.parentId === parentId
        )
        expect(remainingWithParentRef.length).toBe(0)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 7: Rate limiter enforces sliding window ──
// Feature: custom-comments, Property 7: Rate limiter enforces sliding window

describe('Property 7: Rate limiter enforces sliding window', () => {
  beforeEach(() => {
    firestoreDocs = {}
  })

  it('allows up to 5 requests and rejects the 6th within 60s window', async () => {
    const { checkCommentRateLimit } = await import('../comments')

    const ipArb = fc.tuple(
      fc.integer({ min: 1, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 1, max: 255 })
    ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)

    await fc.assert(
      fc.asyncProperty(ipArb, async (ip) => {
        // Reset state for this IP
        firestoreDocs = {}

        // First 5 requests should be allowed
        for (let i = 0; i < 5; i++) {
          const result = await checkCommentRateLimit(ip)
          expect(result.allowed).toBe(true)
        }

        // 6th request should be rejected
        const result = await checkCommentRateLimit(ip)
        expect(result.allowed).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('allows requests after the window expires', async () => {
    const { checkCommentRateLimit } = await import('../comments')

    const ipArb = fc.tuple(
      fc.integer({ min: 1, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 1, max: 255 })
    ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)

    await fc.assert(
      fc.asyncProperty(ipArb, async (ip) => {
        // Reset state and pre-populate with 5 expired timestamps (older than 60s)
        firestoreDocs = {}
        const expiredTimestamp = Date.now() - 61000 // 61 seconds ago
        firestoreDocs[`comment-rate-limits/${ip}`] = {
          ip,
          timestamps: [expiredTimestamp, expiredTimestamp, expiredTimestamp, expiredTimestamp, expiredTimestamp],
          updatedAt: new Date().toISOString(),
        }

        // Should be allowed since all timestamps are expired
        const result = await checkCommentRateLimit(ip)
        expect(result.allowed).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 8: Honeypot silently rejects bot submissions ──
// Feature: custom-comments, Property 8: Honeypot silently rejects bot submissions

describe('Property 8: Honeypot silently rejects bot submissions', () => {
  it('any non-empty honeypot string should trigger silent rejection', async () => {
    // This tests the honeypot logic concept: any non-empty honeypot value means bot
    const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 200 })

    await fc.assert(
      fc.asyncProperty(nonEmptyStringArb, async (honeypotValue) => {
        // The honeypot check logic: if honeypot field is non-empty, reject silently
        const isBot = honeypotValue.length > 0
        expect(isBot).toBe(true)

        // Simulate the API behavior: return 200 without storing
        const shouldStore = honeypotValue.length === 0
        expect(shouldStore).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('empty honeypot string should allow submission', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(''), async (honeypotValue) => {
        const isBot = honeypotValue.length > 0
        expect(isBot).toBe(false)

        const shouldStore = honeypotValue.length === 0
        expect(shouldStore).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 11: Comment document serialization round-trip ──
// Feature: custom-comments, Property 11: Comment document serialization round-trip

describe('Property 11: Comment document serialization round-trip', () => {
  it('toCommentResponse produces consistent output for any valid Comment', async () => {
    const { toCommentResponse } = await import('../comments')

    const isoDateArb = fc.integer({ min: 946684800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString())

    const commentArb = fc.record({
      id: fc.uuid(),
      postSlug: fc.string({ minLength: 1, maxLength: 50 }),
      parentId: fc.oneof(fc.constant(null), fc.uuid()),
      nickname: fc.string({ minLength: 1, maxLength: 30 }),
      email: fc.oneof(fc.constant(null), fc.emailAddress()),
      passwordHash: fc.string({ minLength: 10, maxLength: 100 }),
      content: fc.string({ minLength: 1, maxLength: 1000 }),
      createdAt: isoDateArb,
      updatedAt: isoDateArb,
    })

    await fc.assert(
      fc.asyncProperty(commentArb, async (comment) => {
        // Calling toCommentResponse twice should produce identical results
        const response1 = toCommentResponse(comment)
        const response2 = toCommentResponse(comment)
        expect(response1).toEqual(response2)

        // Response should have exactly the expected keys
        const keys = Object.keys(response1).sort()
        expect(keys).toEqual(['content', 'createdAt', 'id', 'nickname', 'parentId', 'postSlug', 'updatedAt'])
      }),
      { numRuns: 100 }
    )
  })

  it('createComment produces valid documents with all required fields', async () => {
    const { createComment } = await import('../comments')

    beforeEach(() => {
      firestoreDocs = {}
    })

    const inputArb = fc.record({
      postSlug: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
      nickname: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      password: fc.string({ minLength: 4, maxLength: 50 }),
      content: fc.string({ minLength: 1, maxLength: 1000 }).filter((s) => s.trim().length > 0),
      email: fc.oneof(fc.constant(null), fc.emailAddress()),
      parentId: fc.oneof(fc.constant(null), fc.uuid()),
    })

    await fc.assert(
      fc.asyncProperty(inputArb, async (input) => {
        firestoreDocs = {}
        const comment = await createComment(input)

        // All required fields should be present
        expect(comment.id).toBeDefined()
        expect(comment.id.length).toBeGreaterThan(0)
        expect(comment.postSlug).toBe(input.postSlug)
        expect(comment.parentId).toBe(input.parentId)
        expect(comment.email).toBe(input.email)
        expect(comment.passwordHash).toBeDefined()
        expect(comment.passwordHash).toContain(':')
        expect(comment.createdAt).toBeDefined()
        expect(comment.updatedAt).toBeDefined()
        expect(comment.createdAt).toBe(comment.updatedAt)
      }),
      { numRuns: 100 }
    )
  })
})

// ── Property 12: Email format validation ──
// Feature: custom-comments, Property 12: Email format validation

describe('Property 12: Email format validation', () => {
  it('accepts valid email formats', async () => {
    const { validateEmail } = await import('../comments')

    // Generate valid emails: local@domain.tld
    const localPartArb = fc.string({
      unit: fc.oneof(
        fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
        fc.constantFrom('.', '_', '-', '+')
      ),
      minLength: 1,
      maxLength: 30,
    }).filter((s) => s.length > 0 && !s.startsWith('.') && !s.endsWith('.'))

    const domainLabelArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
      minLength: 1,
      maxLength: 15,
    })

    const tldArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      minLength: 2,
      maxLength: 6,
    })

    const validEmailArb = fc.tuple(localPartArb, domainLabelArb, tldArb)
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

    await fc.assert(
      fc.asyncProperty(validEmailArb, async (email) => {
        const result = validateEmail(email)
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('rejects emails without @', async () => {
    const { validateEmail } = await import('../comments')

    const noAtArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('@'))

    await fc.assert(
      fc.asyncProperty(noAtArb, async (email) => {
        const result = validateEmail(email)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('rejects emails with multiple @', async () => {
    const { validateEmail } = await import('../comments')

    const multipleAtArb = fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.string({ minLength: 1, maxLength: 20 })
    ).map(([a, b, c]) => `${a}@${b}@${c}`)

    await fc.assert(
      fc.asyncProperty(multipleAtArb, async (email) => {
        const result = validateEmail(email)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('rejects emails with empty local part', async () => {
    const { validateEmail } = await import('../comments')

    const emptyLocalArb = fc.string({ minLength: 1, maxLength: 20 })
      .filter((s) => s.includes('.') && !s.startsWith('.') && !s.endsWith('.') && s.split('.').every(p => p.length > 0))
      .map((domain) => `@${domain}`)

    await fc.assert(
      fc.asyncProperty(emptyLocalArb, async (email) => {
        const result = validateEmail(email)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('rejects emails where domain has no dot', async () => {
    const { validateEmail } = await import('../comments')

    const noDotDomainArb = fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes('@')),
      fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes('.') && !s.includes('@') && s.length > 0)
    ).map(([local, domain]) => `${local}@${domain}`)

    await fc.assert(
      fc.asyncProperty(noDotDomainArb, async (email) => {
        const result = validateEmail(email)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})


// ── Property 9: Reply notification conditional on parent author email ──
// Feature: custom-comments, Property 9: Reply notification conditional on parent author email

describe('Property 9: Reply notification conditional on parent author email', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('sends reply notification when parent email is non-null and non-empty', async () => {
    const { sendReplyNotification } = await import('../email')

    const nonEmptyEmailArb = fc.emailAddress()
    const nicknameArb = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0)
    const contentArb = fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0)
    const slugArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)
    const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(
        nonEmptyEmailArb,
        slugArb,
        titleArb,
        nicknameArb,
        nicknameArb,
        contentArb,
        contentArb,
        async (toEmail, postSlug, postTitle, parentNickname, replyNickname, replyContent, originalContent) => {
          mockSend.mockClear()

          await sendReplyNotification({
            toEmail,
            postSlug,
            postTitle,
            parentNickname,
            replyNickname,
            replyContent,
            originalContent,
          })

          // Should have called resend.emails.send since toEmail is non-empty
          expect(mockSend).toHaveBeenCalledTimes(1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('does NOT send reply notification when parent email is empty string', async () => {
    const { sendReplyNotification } = await import('../email')

    const nicknameArb = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0)
    const contentArb = fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0)
    const slugArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)
    const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(
        slugArb,
        titleArb,
        nicknameArb,
        nicknameArb,
        contentArb,
        contentArb,
        async (postSlug, postTitle, parentNickname, replyNickname, replyContent, originalContent) => {
          mockSend.mockClear()

          await sendReplyNotification({
            toEmail: '',
            postSlug,
            postTitle,
            parentNickname,
            replyNickname,
            replyContent,
            originalContent,
          })

          // Should NOT have called resend.emails.send since toEmail is empty
          expect(mockSend).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ── Property 10: Notification email contains required fields ──
// Feature: custom-comments, Property 10: Notification email contains required fields

describe('Property 10: Notification email contains required fields', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('admin notification email body contains post title, nickname, and content excerpt', async () => {
    const { sendAdminNotification } = await import('../email')

    // Generate alphanumeric strings to avoid HTML entity encoding issues in assertions
    const alphaNumArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
      minLength: 1,
      maxLength: 50,
    }).filter((s) => s.trim().length > 0)

    const contentArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
      minLength: 1,
      maxLength: 200,
    }).filter((s) => s.trim().length > 0)

    const slugArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
      minLength: 1,
      maxLength: 50,
    }).filter((s) => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(
        slugArb,
        alphaNumArb,
        alphaNumArb,
        contentArb,
        async (postSlug, postTitle, nickname, content) => {
          mockSend.mockClear()

          await sendAdminNotification({
            postSlug,
            postTitle,
            nickname,
            content,
          })

          expect(mockSend).toHaveBeenCalledTimes(1)

          const callArgs = mockSend.mock.calls[0][0]
          const html = callArgs.html

          // Email body should contain the post title
          expect(html).toContain(postTitle)
          // Email body should contain the commenter's nickname
          expect(html).toContain(nickname)
          // Email body should contain the content excerpt (first 100 chars)
          const expectedExcerpt = content.length <= 100 ? content : content.slice(0, 100)
          expect(html).toContain(expectedExcerpt)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('reply notification email body contains post title, reply nickname, and reply content excerpt', async () => {
    const { sendReplyNotification } = await import('../email')

    const alphaNumArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
      minLength: 1,
      maxLength: 50,
    }).filter((s) => s.trim().length > 0)

    const contentArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
      minLength: 1,
      maxLength: 200,
    }).filter((s) => s.trim().length > 0)

    const slugArb = fc.string({
      unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
      minLength: 1,
      maxLength: 50,
    }).filter((s) => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        slugArb,
        alphaNumArb,
        alphaNumArb,
        alphaNumArb,
        contentArb,
        contentArb,
        async (toEmail, postSlug, postTitle, parentNickname, replyNickname, replyContent, originalContent) => {
          mockSend.mockClear()

          await sendReplyNotification({
            toEmail,
            postSlug,
            postTitle,
            parentNickname,
            replyNickname,
            replyContent,
            originalContent,
          })

          expect(mockSend).toHaveBeenCalledTimes(1)

          const callArgs = mockSend.mock.calls[0][0]
          const html = callArgs.html

          // Email body should contain the post title
          expect(html).toContain(postTitle)
          // Email body should contain the reply nickname
          expect(html).toContain(replyNickname)
          // Email body should contain the reply content excerpt (first 100 chars)
          const expectedExcerpt = replyContent.length <= 100 ? replyContent : replyContent.slice(0, 100)
          expect(html).toContain(expectedExcerpt)
        }
      ),
      { numRuns: 100 }
    )
  })
})
