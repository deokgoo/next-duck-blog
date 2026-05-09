import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

vi.mock('server-only', () => ({}))

// In-memory Firestore mock state
let docs: Record<string, Record<string, any>> = {}
let setCalls: Array<{ collection: string; docId: string; data: any; options?: any }> = []

const mockDocRef = (collection: string, docId: string) => ({
  set: vi.fn(async (data: any, options?: any) => {
    setCalls.push({ collection, docId, data, options })
    const key = `${collection}/${docId}`
    if (!docs[key]) {
      docs[key] = { likes: 0 }
    }
    // Simulate FieldValue.increment
    if (data.likes && data.likes._methodName === 'FieldValue.increment') {
      docs[key].likes += data.likes._operand
    }
    if (data.updatedAt) {
      docs[key].updatedAt = new Date()
    }
  }),
  get: vi.fn(async () => {
    const key = `${collection}/${docId}`
    return {
      data: () => docs[key] ?? null,
      exists: !!docs[key],
    }
  }),
})

vi.mock('../firebaseAdmin', () => ({
  db: {
    collection: (name: string) => ({
      doc: (id: string) => mockDocRef(name, id),
    }),
  },
}))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: (n: number) => ({ _methodName: 'FieldValue.increment', _operand: n }),
    serverTimestamp: () => ({ _methodName: 'FieldValue.serverTimestamp' }),
  },
  Timestamp: {
    fromDate: (d: Date) => ({ toDate: () => d }),
  },
}))

/**
 * Property-Based Tests
 * Feature: post-likes-views, Property 1: Like increment atomicity
 *
 * Validates: Requirements 1.1, 4.2
 *
 * For any valid post slug, calling the like handler exactly once SHALL result in
 * the Firestore document's `likes` field increasing by exactly 1, regardless of
 * concurrent requests.
 */
describe('Property 1: Like increment atomicity', () => {
  beforeEach(() => {
    docs = {}
    setCalls = []
  })

  // Generator for valid slugs: non-empty strings with typical slug characters
  const slugCharArb = fc.oneof(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split(''))
  )
  const validSlugArb = fc
    .array(slugCharArb, { minLength: 1, maxLength: 80 })
    .map((chars) => chars.join(''))
    .filter((s) => s.trim().length > 0)

  it('for any valid slug: calling incrementLikes once increases the likes count by exactly 1', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        // Reset state for each iteration
        docs = {}
        setCalls = []

        const result = await incrementLikes(slug)

        // The likes field should be exactly 1 (started from 0)
        expect(result).toBe(1)

        // Verify set was called with FieldValue.increment(1)
        expect(setCalls.length).toBe(1)
        expect(setCalls[0].data.likes).toEqual({
          _methodName: 'FieldValue.increment',
          _operand: 1,
        })
        expect(setCalls[0].options).toEqual({ merge: true })
      }),
      { numRuns: 100 }
    )
  })

  it('for any valid slug with any initial likes count [0, 10000]: after incrementLikes, the new count is initialCount + 1', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(
        validSlugArb,
        fc.integer({ min: 0, max: 10000 }),
        async (slug, initialCount) => {
          // Reset and seed with initial count
          docs = {}
          setCalls = []
          const key = `post-engagement/${slug}`
          docs[key] = { likes: initialCount }

          const result = await incrementLikes(slug)

          // After increment, likes should be initialCount + 1
          expect(result).toBe(initialCount + 1)

          // Verify the increment sentinel was used
          expect(setCalls[0].data.likes).toEqual({
            _methodName: 'FieldValue.increment',
            _operand: 1,
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('for any valid slug: incrementLikes on a non-existent document creates it with likes = 1', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        // Reset state — no pre-existing documents
        docs = {}
        setCalls = []

        const result = await incrementLikes(slug)

        // Document should now exist with likes = 1
        const key = `post-engagement/${slug}`
        expect(docs[key]).toBeDefined()
        expect(docs[key].likes).toBe(1)
        expect(result).toBe(1)

        // merge: true ensures document creation if it doesn't exist
        expect(setCalls[0].options).toEqual({ merge: true })
      }),
      { numRuns: 100 }
    )
  })
})
