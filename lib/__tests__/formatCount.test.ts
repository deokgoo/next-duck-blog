import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatCount } from '../engagement-client'

describe('formatCount', () => {
  describe('raw number for count < 1000', () => {
    it('returns "0" for zero', () => {
      expect(formatCount(0)).toBe('0')
    })

    it('returns raw number as string for small values', () => {
      expect(formatCount(1)).toBe('1')
      expect(formatCount(42)).toBe('42')
      expect(formatCount(999)).toBe('999')
    })
  })

  describe('"X.YK" format for 1000-999999', () => {
    it('formats 1000 as "1.0K"', () => {
      expect(formatCount(1000)).toBe('1.0K')
    })

    it('formats 1500 as "1.5K"', () => {
      expect(formatCount(1500)).toBe('1.5K')
    })

    it('formats 12345 as "12.3K"', () => {
      expect(formatCount(12345)).toBe('12.3K')
    })

    it('uses truncation not rounding: 1999 → "1.9K"', () => {
      expect(formatCount(1999)).toBe('1.9K')
    })

    it('uses truncation not rounding: 999999 → "999.9K"', () => {
      expect(formatCount(999999)).toBe('999.9K')
    })
  })

  describe('"X.YM" format for >= 1000000', () => {
    it('formats 1000000 as "1.0M"', () => {
      expect(formatCount(1000000)).toBe('1.0M')
    })

    it('formats 1500000 as "1.5M"', () => {
      expect(formatCount(1500000)).toBe('1.5M')
    })

    it('uses truncation not rounding: 1999999 → "1.9M"', () => {
      expect(formatCount(1999999)).toBe('1.9M')
    })
  })

  /**
   * Property-Based Tests
   * Feature: post-likes-views, Property 5: Compact count formatting
   *
   * Validates: Requirements 1.2
   *
   * For any non-negative integer, the formatCount function SHALL produce a string
   * that correctly represents the number in compact notation (raw number for < 1000,
   * "X.YK" for thousands, "X.YM" for millions).
   */
  describe('Property 5: Compact count formatting', () => {
    it('for any integer in [0, 999]: output is the raw number as string (no suffix)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999 }),
          (n) => {
            const result = formatCount(n)
            expect(result).toBe(String(n))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('for any integer in [1000, 999999]: output matches pattern /^\\d+\\.\\dK$/', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 999999 }),
          (n) => {
            const result = formatCount(n)
            expect(result).toMatch(/^\d+\.\dK$/)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('for any integer >= 1000000: output matches pattern /^\\d+\\.\\dM$/', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000, max: 999999999 }),
          (n) => {
            const result = formatCount(n)
            expect(result).toMatch(/^\d+\.\dM$/)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('for any non-negative integer: output is always a non-empty string', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999999 }),
          (n) => {
            const result = formatCount(n)
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('for any non-negative integer: the formatted value approximately represents the original number (within truncation tolerance)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999999 }),
          (n) => {
            const result = formatCount(n)

            // Parse the formatted value back to a number
            let parsedValue: number
            if (result.endsWith('M')) {
              parsedValue = parseFloat(result.slice(0, -1)) * 1_000_000
            } else if (result.endsWith('K')) {
              parsedValue = parseFloat(result.slice(0, -1)) * 1_000
            } else {
              parsedValue = parseInt(result, 10)
            }

            if (n < 1000) {
              // For raw numbers, exact match
              expect(parsedValue).toBe(n)
            } else if (n < 1_000_000) {
              // For K format: truncation means parsedValue <= n
              // and the difference should be less than 100 (one decimal place in K = 100)
              expect(parsedValue).toBeLessThanOrEqual(n)
              expect(n - parsedValue).toBeLessThan(100)
            } else {
              // For M format: truncation means parsedValue <= n
              // and the difference should be less than 100000 (one decimal place in M = 100000)
              expect(parsedValue).toBeLessThanOrEqual(n)
              expect(n - parsedValue).toBeLessThan(100_000)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
