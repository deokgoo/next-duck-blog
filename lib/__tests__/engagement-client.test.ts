import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { hasLiked, markAsLiked } from '../engagement-client'

/**
 * Property-Based Tests for localStorage like dedup
 * Feature: post-likes-views, Property 2: localStorage like dedup round-trip
 *
 * Validates: Requirements 1.4, 1.5
 *
 * "For any valid post slug, after a successful like operation, querying the
 * localStorage dedup check for that slug SHALL return true (already liked),
 * and the like button SHALL be disabled."
 */

// In-memory localStorage mock for Node.js test environment
let storage: Record<string, string> = {}

beforeEach(() => {
  storage = {}

  const localStorageMock = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      storage = {}
    },
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })

  // Mock window to satisfy the `typeof window === 'undefined'` check
  Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    writable: true,
    configurable: true,
  })
})

// Generator for valid slug strings (non-empty, realistic blog slugs)
const slugArb = fc
  .stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
  .filter((s) => s.length >= 2 && s.length <= 100)

describe('localStorage like dedup - Property-Based Tests', () => {
  describe('Property 2: localStorage like dedup round-trip', () => {
    it('Property 2.1: for any valid slug, after markAsLiked(slug), hasLiked(slug) returns true', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          // Clear storage for each iteration
          storage = {}

          markAsLiked(slug)
          expect(hasLiked(slug)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('Property 2.2: for any slug that has NOT been marked, hasLiked(slug) returns false', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          // Clear storage for each iteration
          storage = {}

          expect(hasLiked(slug)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('Property 2.3: for any set of distinct slugs, marking one slug does not affect the liked status of other slugs (independence)', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(slugArb, { minLength: 2, maxLength: 10 }),
          (slugs) => {
            // Clear storage for each iteration
            storage = {}

            // Mark only the first slug
            const markedSlug = slugs[0]
            markAsLiked(markedSlug)

            // The marked slug should be liked
            expect(hasLiked(markedSlug)).toBe(true)

            // All other slugs should NOT be liked
            for (let i = 1; i < slugs.length; i++) {
              expect(hasLiked(slugs[i])).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 2.4: for any slug, calling markAsLiked multiple times is idempotent (no duplicates in storage)', () => {
      fc.assert(
        fc.property(
          slugArb,
          fc.integer({ min: 2, max: 10 }),
          (slug, repeatCount) => {
            // Clear storage for each iteration
            storage = {}

            // Mark the same slug multiple times
            for (let i = 0; i < repeatCount; i++) {
              markAsLiked(slug)
            }

            // Should still be liked
            expect(hasLiked(slug)).toBe(true)

            // The stored array should contain the slug exactly once
            const stored = JSON.parse(storage['post-likes'] || '[]') as string[]
            const occurrences = stored.filter((s) => s === slug).length
            expect(occurrences).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
