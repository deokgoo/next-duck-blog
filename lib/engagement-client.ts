'use client'

const STORAGE_KEY = 'post-likes'

/**
 * Check if a post has been liked by the current visitor.
 * Returns false if localStorage is unavailable (SSR, private browsing).
 */
export function hasLiked(slug: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    const slugs: string[] = JSON.parse(stored)
    return slugs.includes(slug)
  } catch {
    return false
  }
}

/**
 * Mark a post as liked in localStorage.
 * No-op if localStorage is unavailable (SSR, private browsing).
 */
export function markAsLiked(slug: string): void {
  try {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    const slugs: string[] = stored ? JSON.parse(stored) : []
    if (!slugs.includes(slug)) {
      slugs.push(slug)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
    }
  } catch {
    // No-op: localStorage unavailable
  }
}

/**
 * Format a count number into compact notation.
 * - count < 1000: raw number as string (e.g., "0", "999")
 * - count 1000-999999: "X.YK" format (e.g., 1500 → "1.5K")
 * - count >= 1000000: "X.YM" format (e.g., 1500000 → "1.5M")
 *
 * Uses Math.floor for truncation to avoid showing inflated numbers.
 */
export function formatCount(count: number): string {
  if (count < 1000) {
    return String(count)
  }

  if (count < 1_000_000) {
    const truncated = Math.floor(count / 100) / 10
    return `${truncated.toFixed(1)}K`
  }

  const truncated = Math.floor(count / 100_000) / 10
  return `${truncated.toFixed(1)}M`
}
