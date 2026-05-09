import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

vi.mock('server-only', () => ({}))

// In-memory docs store for mocking Firestore
let docs: Record<string, { likes: number }> = {}

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
      doc: (id: string) => ({ _collection: name, _id: id }),
    }),
    getAll: vi.fn(async (...refs: any[]) => {
      return refs.map((ref) => {
        const key = ref._id
        const docData = docs[key]
        return {
          exists: !!docData,
          data: () => docData ?? null,
        }
      })
    }),
  },
}))

/**
 * Property-Based Tests
 * Feature: post-likes-views, Property 3: Stats API batch correctness
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 *
 * For any set of post slugs (up to 30), the Stats API SHALL return the correct
 * likes for each slug, with {likes: 0} as default for non-existent documents.
 */
describe('Property 3: Stats API batch correctness', () => {
  beforeEach(() => {
    docs = {}
  })

  // Generator for valid slugs: non-empty strings with typical slug characters
  const slugCharArb = fc.oneof(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split(''))
  )
  const validSlugArb = fc
    .array(slugCharArb, { minLength: 1, maxLength: 80 })
    .map((chars) => chars.join(''))
    .filter((s) => s.trim().length > 0)

  // Generator for a set of unique slugs (1-30)
  const slugSetArb = fc
    .uniqueArray(validSlugArb, { minLength: 1, maxLength: 30 })

  it('for any set of slugs (1-30): the result contains an entry for every requested slug', async () => {
    const { getEngagementStats } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(slugSetArb, async (slugs) => {
        docs = {}
        // Randomly populate some docs
        for (const slug of slugs) {
          if (Math.random() > 0.5) {
            docs[slug] = { likes: Math.floor(Math.random() * 100) }
          }
        }

        const result = await getEngagementStats(slugs)

        // Every requested slug must have an entry in the result
        for (const slug of slugs) {
          expect(result).toHaveProperty(slug)
          expect(result[slug]).toHaveProperty('likes')
        }
        // Result should have exactly the same number of entries as slugs
        expect(Object.keys(result).length).toBe(slugs.length)
      }),
      { numRuns: 100 }
    )
  })

  it('for any slug that exists in Firestore: the returned likes matches the stored value', async () => {
    const { getEngagementStats } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(
        slugSetArb,
        fc.array(fc.integer({ min: 0, max: 100000 }), { minLength: 1, maxLength: 30 }),
        async (slugs, likesValues) => {
          docs = {}
          // Populate all slugs with likes values
          for (let i = 0; i < slugs.length; i++) {
            docs[slugs[i]] = { likes: likesValues[i % likesValues.length] }
          }

          const result = await getEngagementStats(slugs)

          for (let i = 0; i < slugs.length; i++) {
            const expectedLikes = likesValues[i % likesValues.length]
            expect(result[slugs[i]].likes).toBe(expectedLikes)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('for any slug that does NOT exist in Firestore: the returned likes is 0', async () => {
    const { getEngagementStats } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(slugSetArb, async (slugs) => {
        // No docs exist — all should default to 0
        docs = {}

        const result = await getEngagementStats(slugs)

        for (const slug of slugs) {
          expect(result[slug].likes).toBe(0)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('for an empty slugs array: returns an empty object', async () => {
    const { getEngagementStats } = await import('../engagement')

    const result = await getEngagementStats([])

    expect(result).toEqual({})
    expect(Object.keys(result).length).toBe(0)
  })

  it('for any mix of existing and non-existing slugs: each slug gets the correct value', async () => {
    const { getEngagementStats } = await import('../engagement')

    // Generator: pairs of (slug, optionalLikes) where null means doc doesn't exist
    const slugWithOptionalLikesArb = fc.tuple(
      validSlugArb,
      fc.option(fc.integer({ min: 0, max: 100000 }), { nil: undefined })
    )

    const mixedSlugsArb = fc
      .uniqueArray(slugWithOptionalLikesArb, {
        minLength: 1,
        maxLength: 30,
        selector: ([slug]) => slug,
      })

    await fc.assert(
      fc.asyncProperty(mixedSlugsArb, async (slugsWithLikes) => {
        docs = {}
        const slugs: string[] = []
        const expected: Record<string, number> = {}

        for (const [slug, likes] of slugsWithLikes) {
          slugs.push(slug)
          if (likes !== undefined) {
            docs[slug] = { likes }
            expected[slug] = likes
          } else {
            expected[slug] = 0
          }
        }

        const result = await getEngagementStats(slugs)

        for (const slug of slugs) {
          expect(result[slug].likes).toBe(expected[slug])
        }
      }),
      { numRuns: 100 }
    )
  })
})
