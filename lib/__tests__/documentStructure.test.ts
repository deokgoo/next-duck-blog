import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property-Based Tests
 * Feature: post-likes-views, Property 4: Engagement document structure invariant
 *
 * Validates: Requirements 5.2, 5.3, 5.4
 *
 * For any engagement operation (like) on any slug, the resulting Firestore document
 * SHALL have the slug as its document ID and contain `likes` (number) and `updatedAt`
 * (Timestamp) fields.
 */

vi.mock('server-only', () => ({}))

let setCallArgs: Array<{ docId: string; data: any; options?: any }> = []

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
        set: vi.fn(async (data: any, options?: any) => {
          setCallArgs.push({ docId: id, data, options })
        }),
        get: vi.fn(async () => ({
          data: () => ({ likes: 1, updatedAt: new Date() }),
          exists: true,
        })),
      }),
    }),
  },
}))

describe('Property 4: Engagement document structure invariant', () => {
  beforeEach(() => {
    setCallArgs = []
  })

  // Generator for valid slugs: non-empty strings with typical slug characters
  const slugCharArb = fc.oneof(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split(''))
  )
  const validSlugArb = fc
    .array(slugCharArb, { minLength: 1, maxLength: 80 })
    .map((chars) => chars.join(''))
    .filter((s) => s.trim().length > 0)

  it('for any valid slug: the document ID used in Firestore matches the slug exactly', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        setCallArgs = []

        await incrementLikes(slug)

        expect(setCallArgs.length).toBeGreaterThanOrEqual(1)
        expect(setCallArgs[0].docId).toBe(slug)
      }),
      { numRuns: 100 }
    )
  })

  it('for any valid slug: the set() call includes a `likes` field with FieldValue.increment', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        setCallArgs = []

        await incrementLikes(slug)

        expect(setCallArgs.length).toBeGreaterThanOrEqual(1)
        const data = setCallArgs[0].data
        expect(data).toHaveProperty('likes')
        expect(data.likes).toEqual({
          _methodName: 'FieldValue.increment',
          _operand: 1,
        })
      }),
      { numRuns: 100 }
    )
  })

  it('for any valid slug: the set() call includes an `updatedAt` field with FieldValue.serverTimestamp', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        setCallArgs = []

        await incrementLikes(slug)

        expect(setCallArgs.length).toBeGreaterThanOrEqual(1)
        const data = setCallArgs[0].data
        expect(data).toHaveProperty('updatedAt')
        expect(data.updatedAt).toEqual({
          _methodName: 'FieldValue.serverTimestamp',
        })
      }),
      { numRuns: 100 }
    )
  })

  it('for any valid slug: the set() call uses `{ merge: true }` option', async () => {
    const { incrementLikes } = await import('../engagement')

    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        setCallArgs = []

        await incrementLikes(slug)

        expect(setCallArgs.length).toBeGreaterThanOrEqual(1)
        expect(setCallArgs[0].options).toEqual({ merge: true })
      }),
      { numRuns: 100 }
    )
  })
})
