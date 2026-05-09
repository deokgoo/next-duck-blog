import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

vi.mock('server-only', () => ({}))

// In-memory rate-limit document store
let rateLimitDocs: Record<string, { ip: string; slug: string; action: string; timestamp: any; expiresAt: any }> = {}
let setCalls: Array<{ docId: string; data: any }> = []

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: (n: number) => ({ _methodName: 'FieldValue.increment', _operand: n }),
    serverTimestamp: () => ({ _methodName: 'FieldValue.serverTimestamp' }),
  },
  Timestamp: {
    fromDate: (d: Date) => ({ toDate: () => d }),
  },
}))

vi.mock('../firebaseAdmin', () => ({
  db: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: vi.fn(async () => {
          const doc = rateLimitDocs[id]
          return {
            exists: !!doc,
            data: () => doc ?? null,
          }
        }),
        set: vi.fn(async (data: any) => {
          setCalls.push({ docId: id, data })
          rateLimitDocs[id] = data
        }),
      }),
    }),
  },
}))

/**
 * Property-Based Tests
 * Feature: post-likes-views, Property 6: Like rate limiting by IP
 *
 * Validates: Requirements 6.1, 6.2
 *
 * For any IP address and post slug, only the first like request within a 24-hour
 * window SHALL result in a Firestore write. Subsequent requests from the same IP
 * for the same slug within 24 hours SHALL return success (200) without performing a write.
 */
describe('Property 6: Like rate limiting by IP', () => {
  beforeEach(() => {
    rateLimitDocs = {}
    setCalls = []
  })

  // Generators
  const ipArb = fc
    .tuple(
      fc.integer({ min: 1, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 1, max: 255 })
    )
    .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)

  const slugCharArb = fc.oneof(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split(''))
  )
  const validSlugArb = fc
    .array(slugCharArb, { minLength: 1, maxLength: 60 })
    .map((chars) => chars.join(''))
    .filter((s) => s.trim().length > 0)

  it('for any IP/slug: first call to checkRateLimit returns true (allowed) and writes to Firestore', async () => {
    const { checkRateLimit } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(ipArb, validSlugArb, async (ip, slug) => {
        // Reset state
        rateLimitDocs = {}
        setCalls = []

        const result = await checkRateLimit(ip, slug, 'like')

        // First request should be allowed
        expect(result).toBe(true)

        // A write should have occurred
        expect(setCalls.length).toBe(1)
        expect(setCalls[0].data.ip).toBe(ip)
        expect(setCalls[0].data.slug).toBe(slug)
        expect(setCalls[0].data.action).toBe('like')
      }),
      { numRuns: 100 }
    )
  })

  it('for any IP/slug: when a non-expired entry exists, checkRateLimit returns false (rate limited) and does NOT write', async () => {
    const { checkRateLimit } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(ipArb, validSlugArb, async (ip, slug) => {
        // Reset state
        rateLimitDocs = {}
        setCalls = []

        // Pre-populate with a non-expired entry
        const docId = `${ip}_${slug}_like`
        rateLimitDocs[docId] = {
          ip,
          slug,
          action: 'like',
          timestamp: { toDate: () => new Date() },
          expiresAt: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // not expired
        }

        const result = await checkRateLimit(ip, slug, 'like')

        // Should be rate limited
        expect(result).toBe(false)

        // No write should have occurred
        expect(setCalls.length).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  it('for any IP/slug: when an expired entry exists, checkRateLimit returns true (allowed) and overwrites', async () => {
    const { checkRateLimit } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(ipArb, validSlugArb, async (ip, slug) => {
        // Reset state
        rateLimitDocs = {}
        setCalls = []

        // Pre-populate with an expired entry
        const docId = `${ip}_${slug}_like`
        rateLimitDocs[docId] = {
          ip,
          slug,
          action: 'like',
          timestamp: { toDate: () => new Date(Date.now() - 48 * 60 * 60 * 1000) },
          expiresAt: { toDate: () => new Date(Date.now() - 1000) }, // expired
        }

        const result = await checkRateLimit(ip, slug, 'like')

        // Should be allowed (expired entry)
        expect(result).toBe(true)

        // A write should have occurred to overwrite the expired entry
        expect(setCalls.length).toBe(1)
        expect(setCalls[0].data.ip).toBe(ip)
        expect(setCalls[0].data.slug).toBe(slug)
        expect(setCalls[0].data.action).toBe('like')
      }),
      { numRuns: 100 }
    )
  })

  it('for any IP/slug: the document ID format is {ip}_{slug}_{action}', async () => {
    const { checkRateLimit } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(ipArb, validSlugArb, async (ip, slug) => {
        // Reset state
        rateLimitDocs = {}
        setCalls = []

        await checkRateLimit(ip, slug, 'like')

        // Verify the document ID format
        const expectedDocId = `${ip}_${slug}_like`
        expect(setCalls.length).toBe(1)
        expect(setCalls[0].docId).toBe(expectedDocId)
      }),
      { numRuns: 100 }
    )
  })

  it('for different IP/slug combinations: rate limiting is independent', async () => {
    const { checkRateLimit } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(
        ipArb,
        ipArb,
        validSlugArb,
        async (ip1, ip2, slug) => {
          // Skip if IPs are the same
          fc.pre(ip1 !== ip2)

          // Reset state
          rateLimitDocs = {}
          setCalls = []

          // First IP makes a request — should be allowed
          const result1 = await checkRateLimit(ip1, slug, 'like')
          expect(result1).toBe(true)

          // Second IP makes a request for the same slug — should also be allowed
          const result2 = await checkRateLimit(ip2, slug, 'like')
          expect(result2).toBe(true)

          // First IP tries again — should be rate limited
          const result3 = await checkRateLimit(ip1, slug, 'like')
          expect(result3).toBe(false)

          // Second IP tries again — should be rate limited
          const result4 = await checkRateLimit(ip2, slug, 'like')
          expect(result4).toBe(false)

          // Total writes should be 2 (one per IP)
          expect(setCalls.length).toBe(2)
        }
      ),
      { numRuns: 100 }
    )
  })
})
