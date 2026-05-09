import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'

// Mock 'server-only' to avoid import errors in test environment
vi.mock('server-only', () => ({}))

import { validateSlug } from '../engagement'

describe('validateSlug', () => {
  it('returns true for a valid non-empty slug', () => {
    expect(validateSlug('hello-world')).toBe(true)
  })

  it('returns true for a slug with spaces (non-whitespace content)', () => {
    expect(validateSlug('hello world')).toBe(true)
  })

  it('returns false for an empty string', () => {
    expect(validateSlug('')).toBe(false)
  })

  it('returns false for a whitespace-only string', () => {
    expect(validateSlug('   ')).toBe(false)
    expect(validateSlug('\t\n')).toBe(false)
  })

  it('returns false for non-string values', () => {
    expect(validateSlug(undefined as any)).toBe(false)
    expect(validateSlug(null as any)).toBe(false)
    expect(validateSlug(123 as any)).toBe(false)
    expect(validateSlug({} as any)).toBe(false)
    expect(validateSlug([] as any)).toBe(false)
  })

  it('returns true for single character slugs', () => {
    expect(validateSlug('a')).toBe(true)
  })
})

/**
 * Property-Based Tests for validateSlug
 * Feature: post-likes-views, Property 7: Input validation rejects invalid slugs
 *
 * Validates: Requirements 6.3
 * "For any request body that does not contain a valid non-empty string slug,
 * the Like API SHALL return a 400 status code."
 */
describe('validateSlug - Property-Based Tests', () => {
  it('Property 7.1: for any non-empty string containing at least one non-whitespace character, validateSlug returns true', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (input) => {
          expect(validateSlug(input)).toBe(true)
        }
      ),
      { numRuns: 100, verbose: true }
    )
  })

  it('Property 7.2: for any whitespace-only string, validateSlug returns false', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v'), { minLength: 1 })
          .map((chars) => chars.join('')),
        (input) => {
          expect(validateSlug(input)).toBe(false)
        }
      ),
      { numRuns: 100, verbose: true }
    )
  })

  it('Property 7.3: for any non-string value, validateSlug returns false', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer(),
          fc.double(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.object(),
          fc.array(fc.anything())
        ),
        (input) => {
          expect(validateSlug(input as any)).toBe(false)
        }
      ),
      { numRuns: 100, verbose: true }
    )
  })
})
